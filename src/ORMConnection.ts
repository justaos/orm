import type { Logger } from "../deps.ts";
import type {
  DatabaseOperationContext,
  TableDefinition,
  TableDefinitionInternal,
} from "./types.ts";
import DatabaseConnectionPool from "./core/DatabaseConnectionPool.ts";
import type { TDatabaseConfiguration } from "./core/types.ts";
import TableDefinitionHandler from "./table/TableDefinitionHandler.ts";

import Table from "./table/Table.ts";

import Query from "./query/Query.ts";
import { logSQLQuery, runSQLQuery } from "./utils.ts";
import type RegistriesHandler from "./RegistriesHandler.ts";
import ORMError from "./errors/ORMError.ts";

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
  readonly #config: TDatabaseConfiguration;
  readonly #pool: DatabaseConnectionPool;
  readonly #registriesHandler: RegistriesHandler;
  readonly #logger: Logger;

  constructor(
    logger: Logger,
    config: TDatabaseConfiguration,
    registriesHandler: RegistriesHandler,
  ) {
    this.#logger = logger;
    this.#config = config;
    this.#pool = new DatabaseConnectionPool(config, logger);
    this.#registriesHandler = registriesHandler;
  }

  async testConnection(): Promise<void> {
    return await this.#pool.testConnection();
  }

  closeConnection(): Promise<void> {
    return this.#getConnection().end();
  }

  async dropDatabase(): Promise<any> {
    const databaseName = this.#getConnection().getDatabaseName();
    if (!databaseName) {
      throw ORMError.generalError("Database name is not defined");
    }
    await this.closeConnection();
    const tempConn = new DatabaseConnectionPool(
      {
        ...this.#config,
        database: "postgres",
      },
      this.#logger,
    );
    await tempConn.testConnection();
    const result = await tempConn.dropDatabase(databaseName);
    await tempConn.end();
    return result;
  }

  deregisterTable(tableName: string) {
    this.#registriesHandler.deleteTableDefinition(tableName);
  }

  async defineTable(tableDefinitionRaw: TableDefinition | Function) {
    if (typeof tableDefinitionRaw === "function") {
      // @ts-ignore
      tableDefinitionRaw = tableDefinitionRaw.__tableDefinition;
    }
    const tableDefinitionHandler = new TableDefinitionHandler(
      tableDefinitionRaw,
      this.#registriesHandler,
    );

    tableDefinitionHandler.validate();

    this.#registriesHandler.addTableDefinition(
      tableDefinitionHandler.getDefinitionClone(),
    );

    const reserved = await this.#pool.connect();
    try {
      const [{ exists: schemaExists }] = await runSQLQuery(
        reserved,
        `SELECT EXISTS(SELECT
                       FROM information_schema.schemata
                       WHERE schema_name = '${tableDefinitionHandler.getSchemaName()}'
          LIMIT 1);`,
      );

      if (!schemaExists) {
        await runSQLQuery(
          reserved,
          `CREATE SCHEMA IF NOT EXISTS "${tableDefinitionHandler.getSchemaName()}";`,
        );
        this.#logger.info(
          `Schema ${tableDefinitionHandler.getSchemaName()} created`,
        );
      }

      const [{ exists: tableExists }] = await runSQLQuery(
        reserved,
        `SELECT EXISTS(SELECT
                       FROM information_schema.tables
                       WHERE table_name = '${tableDefinitionHandler.getTableName()}'
                         AND table_schema = '${tableDefinitionHandler.getSchemaName()}'
          LIMIT 1);`,
      );

      if (!tableExists) {
        const createQuery = new Query(this.#pool);
        createQuery.create(tableDefinitionHandler.getName());
        for (const column of tableDefinitionHandler.getOwnColumns()) {
          const columnDefinition = column.getDefinitionClone();
          createQuery.addColumn({
            name: column.getName(),
            native_type: column.getColumnType().getNativeType(),
            not_null: column.isNotNull(),
            unique: column.isUnique(),
            foreign_key: columnDefinition.foreign_key,
          });
        }
        const inherits = tableDefinitionHandler.getInherits();
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
           WHERE table_schema = '${tableDefinitionHandler.getSchemaName()}'
             AND table_name = '${tableDefinitionHandler.getTableName()}';`,
        );
        const existingColumnNames = columns.map(
          (column: { column_name: string }) => column.column_name,
        );
        const columnSchemas = tableDefinitionHandler.getOwnColumns();
        // Create new columns
        if (columnSchemas.length > existingColumnNames.length) {
          const alterQuery = new Query(this.#pool);
          alterQuery.alter(tableDefinitionHandler.getName());
          for (const column of tableDefinitionHandler.getOwnColumns()) {
            const columnDefinition = column.getDefinitionClone();
            if (!existingColumnNames.includes(column.getName())) {
              alterQuery.addColumn({
                name: column.getName(),
                native_type: column.getColumnType().getNativeType(),
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
    const reserved = await this.#pool.connect();
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
    const tableDefinition: TableDefinitionInternal | undefined = this
      .#registriesHandler.getTableDefinition(name);
    if (typeof tableDefinition === "undefined") {
      throw new ORMError(
        "TABLE_DEFINITION_VALIDATION",
        `Table with name '${name}' is not defined`,
      );
    }
    const queryBuilder = new Query(this.#pool);
    return new Table(
      queryBuilder,
      tableDefinition,
      this.#registriesHandler,
      this.#logger,
      this.#pool,
      context,
    );
  }

  query(): Query {
    return new Query(this.#pool);
  }

  #getConnection(): DatabaseConnectionPool {
    if (!this.#pool) {
      throw ORMError.generalError("There is no active connection");
    }
    return this.#pool;
  }
}
