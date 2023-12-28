import { LoggerUtils, Logger } from "../deps.ts";
import { DatabaseOperationContext, TableDefinition, TableDefinitionRaw } from "./types.ts";
import { DatabaseConfiguration, DatabaseConnection } from "./core/connection/index.ts";
import Registry from "./core/Registry.ts";
import TableSchema from "./table/TableSchema.ts";
import DataType from "./data-types/DataType.ts";

import Table from "./table/Table.ts";
import DatabaseOperationInterceptorService from "./operation-interceptor/DatabaseOperationInterceptorService.ts";
import { DatabaseErrorCode, ORMError } from "./errors/ORMError.ts";

import Query from "./query/Query.ts";
import ORM from "./ORM.ts";
import TableNameUtils from "./table/TableNameUtils.ts";
import { logSQLQuery } from "./utils.ts";

export default class ORMConnection {
  readonly #orm: ORM;
  readonly #config: DatabaseConfiguration;
  readonly #conn: DatabaseConnection;
  readonly #dataTypeRegistry: Registry<DataType>;
  readonly #schemaRegistry: Map<string, null>;
  readonly #tableDefinitionRegistry: Registry<TableDefinition>;
  readonly #logger: Logger;
  readonly #operationInterceptorService: DatabaseOperationInterceptorService;

  constructor(
    orm: ORM,
    logger: Logger,
    config: DatabaseConfiguration,
    dataTypeRegistry: Registry<DataType>,
    tableDefinitionRegistry: Registry<TableDefinition>,
    schemaRegistry: Map<string, null>,
    operationInterceptorService: DatabaseOperationInterceptorService
  ) {
    this.#orm = orm;
    this.#logger = logger;
    this.#config = config;
    this.#conn = new DatabaseConnection(config, logger);
    this.#dataTypeRegistry = dataTypeRegistry;
    this.#tableDefinitionRegistry = tableDefinitionRegistry;
    this.#schemaRegistry = schemaRegistry;
    this.#operationInterceptorService = operationInterceptorService;
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
        database: "postgres"
      },
      this.#logger
    );
    await tempConn.connect();
    const result = await tempConn.dropDatabase(databaseName);
    await tempConn.closeConnection();
    return result;
  }

  deregisterTable(tableName: string) {
    this.#tableDefinitionRegistry.delete(tableName);
  }

  async defineTable(tableDefinitionRaw: TableDefinitionRaw | Function) {
    if (typeof tableDefinitionRaw === "function") {
      // @ts-ignore
      tableDefinitionRaw = tableDefinitionRaw.__tableDefinition;
    }
    const tableSchema = new TableSchema(
      tableDefinitionRaw,
      this.#dataTypeRegistry,
      this.#tableDefinitionRegistry
    );
    try {
      tableSchema.validate();
    } catch (error) {
      this.#logger.error(error.message);
      throw error;
    }
    this.#tableDefinitionRegistry.add(tableSchema.getDefinition());

    const sql = this.#conn.getNativeConnection();
    const reserved = await sql.reserve();
    try {
      const [{ exists: schemaExists }] = await reserved`SELECT EXISTS(SELECT
                    FROM information_schema.schemata
                    WHERE schema_name = ${tableSchema.getSchemaName()}
                    LIMIT 1);`;

      if (!schemaExists) {
        await reserved`CREATE SCHEMA IF NOT EXISTS ${sql(
          tableSchema.getSchemaName()
        )};`;
        this.#logger.info(`Schema ${tableSchema.getSchemaName()} created`);
        this.#schemaRegistry.set(tableSchema.getSchemaName(), null);
      }

      const [{ exists: tableExists }] = await reserved`SELECT EXISTS(SELECT
                    FROM information_schema.tables
                    WHERE table_name = ${tableSchema.getTableName()} AND table_schema = ${tableSchema.getSchemaName()}
                    LIMIT 1);`;

      if (!tableExists) {
        const createQuery = new Query(this.#conn.getNativeConnection());
        createQuery.create(tableSchema.getName());
        for (const column of tableSchema.getOwnColumnSchemas()) {
          const columnDefinition = column.getDefinition();
          createQuery.addColumn({
            name: column.getName(),
            data_type: column.getColumnType().getNativeType(),
            not_null: column.isNotNull(),
            unique: column.isUnique(),
            foreign_key: columnDefinition.foreign_key
          });
        }
        const inherits = tableSchema.getInherits();
        if (inherits)
          createQuery.inherits(inherits);
        logSQLQuery(this.#logger, createQuery.getSQLQuery());
        await createQuery.execute();
      } else {
        const columns =
          await reserved`SELECT column_name FROM information_schema.columns WHERE table_schema = ${tableSchema.getSchemaName()} AND table_name = ${tableSchema.getTableName()};`;
        const existingColumnNames = columns.map((column: { column_name: string }) => column.column_name);
        const columnSchemas = tableSchema.getOwnColumnSchemas();
        // Create new columns
        if (columnSchemas.length > existingColumnNames.length) {
          const alterQuery = new Query(this.#conn.getNativeConnection());
          alterQuery.alter(tableSchema.getName());
          for (const column of tableSchema.getOwnColumnSchemas()) {
            const columnDefinition = column.getDefinition();
            if (!existingColumnNames.includes(column.getName()))
              alterQuery.addColumn({
                name: column.getName(),
                data_type: column.getColumnType().getNativeType(),
                not_null: column.isNotNull(),
                unique: column.isUnique(),
                foreign_key: columnDefinition.foreign_key
              });
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
    const sql = this.#conn.getNativeConnection();
    const reserved = await sql.reserve();
    try {
      await reserved.unsafe(`DROP TABLE IF EXISTS ${tableName} CASCADE;`);
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
    const tableSchema: TableSchema | undefined = this.#orm.getTableSchema(name);
    if (typeof tableSchema === "undefined") {
      throw new ORMError(
        DatabaseErrorCode.SCHEMA_VALIDATION_ERROR,
        `Table with name '${name}' is not defined`
      );
    }
    const queryBuilder = new Query(this.#conn.getNativeConnection());
    return new Table(
      queryBuilder,
      tableSchema,
      this.#operationInterceptorService,
      this.#logger,
      this.#conn.getNativeConnection(),
      context
    );
  }

  #getConnection(): DatabaseConnection {
    if (!this.#conn) {
      throw new ORMError(
        DatabaseErrorCode.GENERIC_ERROR,
        "There is no active connection"
      );
    }
    return this.#conn;
  }
}
