import { Logger } from "../deps.ts";
import {
  DatabaseOperationContext,
  TableDefinition,
  TableDefinitionInternal,
} from "./types.ts";
import DatabaseConnection from "./connection/DatabaseConnection.ts";
import { DatabaseConfiguration } from "./connection/DatabaseConfiguration.ts";
import TableDefinitionHandler from "./table/TableDefinitionHandler.ts";

import Table from "./table/Table.ts";
import { DatabaseErrorCode, ORMError } from "./errors/ORMError.ts";

import Query from "./query/Query.ts";
import { logSQLQuery, runSQLQuery } from "./utils.ts";
import RegistriesHandler from "./RegistriesHandler.ts";

/**
 * The main class for interacting with the database.
 * It provides methods for creating, dropping, and interacting with tables.
 * It also provides methods for creating and executing queries.
 * It is the main entry point for the ORM.
 *
 * @module ORMConnection
 * @see {@link DatabaseConfiguration} for the configuration options
 * @see {@link DataType} for the data types supported
 * @see {@link TableDefinition} for the table definitions
 * @see {@link DatabaseOperationInterceptorService} for the operation interceptors\
 *
 * @method connect Establishes a connection to the database
 * @method closeConnection Closes the connection to the database
 * @method dropDatabase Drops the database
 * @method deregisterTable Deregisters a table from the registry
 * @method defineTable Defines a new table
 * @method dropTable Drops a table
 * @method table Gets a table object
 * @method query Creates a new query object
 *
 * @example
 * ```typescript
 * import { ORMConnection } from "@justaos/orm";
 * const connection: ORMConnection = odm.connect();
 * const table = connection.table("users");
 * ```
 */
export default class ORMConnection {
  readonly #config: DatabaseConfiguration;
  readonly #conn: DatabaseConnection;
  readonly #registriesHandler: RegistriesHandler;
  readonly #logger: Logger;

  constructor(
    logger: Logger,
    config: DatabaseConfiguration,
    registriesHandler: RegistriesHandler,
  ) {
    this.#logger = logger;
    this.#config = config;
    this.#conn = new DatabaseConnection(config, logger);
    this.#registriesHandler = registriesHandler;
  }

  async connect(): Promise<void> {
    return await this.#conn.connect();
  }

  closeConnection(): Promise<void> {
    return this.#getConnection().closeConnection();
  }

  async dropDatabase(): Promise<any> {
    const databaseName = this.#getConnection().getDatabaseName();
    if (!databaseName) {
      throw new Error("Database name is not defined");
    }
    await this.closeConnection();
    const tempConn = new DatabaseConnection(
      {
        ...this.#config,
        database: "postgres",
      },
      this.#logger,
    );
    await tempConn.connect();
    const result = await tempConn.dropDatabase(databaseName);
    await tempConn.closeConnection();
    return result;
  }

  deregisterTable(tableName: string) {
    this.#registriesHandler.tableDefinitionRegistry.delete(tableName);
  }

  async defineTable(tableDefinitionRaw: TableDefinition | Function) {
    if (typeof tableDefinitionRaw === "function") {
      // @ts-ignore
      tableDefinitionRaw = tableDefinitionRaw.__tableDefinition;
    }
    const tableSchema = new TableDefinitionHandler(
      tableDefinitionRaw,
      this.#registriesHandler,
    );

    tableSchema.validate();

    this.#registriesHandler.tableDefinitionRegistry.add(
      tableSchema.getDefinitionClone(),
    );

    const pool = this.#conn.getConnectionPool();
    const reserved = await pool.connect();
    try {
      const [{ exists: schemaExists }] = await runSQLQuery(
        reserved,
        `SELECT EXISTS(SELECT
                       FROM information_schema.schemata
                       WHERE schema_name = '${tableSchema.getSchemaName()}'
          LIMIT 1);`,
      );

      if (!schemaExists) {
        await runSQLQuery(
          reserved,
          `CREATE SCHEMA IF NOT EXISTS "${tableSchema.getSchemaName()}";`,
        );
        this.#logger.info(`Schema ${tableSchema.getSchemaName()} created`);
      }

      const [{ exists: tableExists }] = await runSQLQuery(
        reserved,
        `SELECT EXISTS(SELECT
                       FROM information_schema.tables
                       WHERE table_name = '${tableSchema.getTableName()}'
                         AND table_schema = '${tableSchema.getSchemaName()}'
          LIMIT 1);`,
      );

      if (!tableExists) {
        const createQuery = new Query(this.#conn.getConnectionPool());
        createQuery.create(tableSchema.getName());
        for (const column of tableSchema.getOwnColumns()) {
          const columnDefinition = column.getDefinitionClone();
          createQuery.addColumn({
            name: column.getName(),
            type: columnDefinition.type,
            data_type: column.getColumnType().getNativeType(),
            not_null: column.isNotNull(),
            unique: column.isUnique(),
            foreign_key: columnDefinition.foreign_key,
          });
        }
        const inherits = tableSchema.getInherits();
        if (inherits) {
          createQuery.inherits(inherits);
        }
        logSQLQuery(this.#logger, createQuery.getSQLQuery());
        await createQuery.execute();
      } else {
        const columns = await runSQLQuery(
          reserved,
          `SELECT column_name
           FROM information_schema.columns
           WHERE table_schema = '${tableSchema.getSchemaName()}'
             AND table_name = '${tableSchema.getTableName()}';`,
        );
        const existingColumnNames = columns.map(
          (column: { column_name: string }) => column.column_name,
        );
        const columnSchemas = tableSchema.getOwnColumns();
        // Create new columns
        if (columnSchemas.length > existingColumnNames.length) {
          const alterQuery = new Query(this.#conn.getConnectionPool());
          alterQuery.alter(tableSchema.getName());
          for (const column of tableSchema.getOwnColumns()) {
            const columnDefinition = column.getDefinitionClone();
            if (!existingColumnNames.includes(column.getName())) {
              alterQuery.addColumn({
                name: column.getName(),
                type: columnDefinition.type,
                data_type: column.getColumnType().getNativeType(),
                not_null: column.isNotNull(),
                unique: column.isUnique(),
                foreign_key: columnDefinition.foreign_key,
              });
            }
          }

          logSQLQuery(this.#logger, alterQuery.getSQLQuery());
          await alterQuery.execute();
        }
      }
    } finally {
      reserved.release();
    }
  }

  async dropTable(tableName: string): Promise<void> {
    const pool = this.#conn.getConnectionPool();
    const reserved = await pool.connect();
    try {
      await runSQLQuery(
        reserved,
        `DROP TABLE IF EXISTS "${tableName}" CASCADE;`,
      );
    } finally {
      reserved.release();
    }
  }

  /*
   * Get table object
   * @param name Table name
   * @param context Context object
   */
  table(name: string, context?: DatabaseOperationContext): Table {
    const tableDefinition: TableDefinitionInternal | undefined =
      this.#registriesHandler.tableDefinitionRegistry.get(name);
    if (typeof tableDefinition === "undefined") {
      throw new ORMError(
        DatabaseErrorCode.SCHEMA_VALIDATION_ERROR,
        `Table with name '${name}' is not defined`,
      );
    }
    const queryBuilder = new Query(this.#conn.getConnectionPool());
    return new Table(
      queryBuilder,
      tableDefinition,
      this.#registriesHandler,
      this.#logger,
      this.#conn.getConnectionPool(),
      context,
    );
  }

  query(): Query {
    return new Query(this.#conn.getConnectionPool());
  }

  #getConnection(): DatabaseConnection {
    if (!this.#conn) {
      throw new ORMError(
        DatabaseErrorCode.GENERIC_ERROR,
        "There is no active connection",
      );
    }
    return this.#conn;
  }
}
