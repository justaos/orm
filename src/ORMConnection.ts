import { Logger } from "../deps.ts";
import { DatabaseOperationContext, TableDefinition, TableDefinitionRaw, UUID } from "./types.ts";
import { UUIDUtils } from "./utils.ts";
import { DatabaseConfiguration, DatabaseConnection } from "./core/connection/index.ts";
import Registry from "./core/Registry.ts";
import TableSchema from "./table/TableSchema.ts";
import DataType from "./data-types/DataType.ts";

import Table from "./table/Table.ts";
import DatabaseOperationInterceptorService from "./operation-interceptor/DatabaseOperationInterceptorService.ts";
import { DatabaseErrorCode, ORMError } from "./errors/ORMError.ts";
import DatabaseOperationInterceptor from "./operation-interceptor/DatabaseOperationInterceptor.ts";

import Query from "./query/Query.ts";

export default class ORMConnection {
  readonly #config: DatabaseConfiguration;
  readonly #conn: DatabaseConnection;
  readonly #fieldTypeRegistry: Registry<DataType>;
  readonly #schemaRegistry: Map<string, null>;
  readonly #tableDefinitionRegistry: Registry<TableDefinition>;
  readonly #logger: Logger;
  readonly #operationInterceptorService: DatabaseOperationInterceptorService;

  constructor(
    logger: Logger,
    config: DatabaseConfiguration,
    fieldTypeRegistry: Registry<DataType>,
    tableDefinitionRegistry: Registry<TableDefinition>,
    schemaRegistry: Map<string, null>,
    operationInterceptorService: DatabaseOperationInterceptorService
  ) {
    this.#logger = logger;
    this.#config = config;
    this.#conn = new DatabaseConnection(config, logger);
    this.#fieldTypeRegistry = fieldTypeRegistry;
    this.#tableDefinitionRegistry = tableDefinitionRegistry;
    this.#schemaRegistry = schemaRegistry;
    this.#operationInterceptorService = operationInterceptorService;
  }

  static generateRecordId(): UUID {
    return UUIDUtils.generateId();
  }

  static validateRecordId(id: UUID): boolean {
    return UUIDUtils.isValidId(id);
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

  async defineTable(tableDefinitionRaw: TableDefinitionRaw | Function) {
    if (typeof tableDefinitionRaw === "function") {
      // @ts-ignore
      tableDefinitionRaw = tableDefinitionRaw.__tableDefinition;
    }
    const tableSchema = new TableSchema(
      tableDefinitionRaw,
      this.#fieldTypeRegistry,
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
                    WHERE table_name = ${tableSchema.getName()} AND table_schema = ${tableSchema.getSchemaName()}
                    LIMIT 1);`;

      if (!tableExists) {
        const query = new Query(this.#conn.getNativeConnection());
        query.create(tableSchema.getFullName());
        for (const column of tableSchema.getOwnColumnSchemas()) {
          const columnDefinition = column.getDefinition();
          query.addColumn({
            name: column.getName(),
            data_type: column.getColumnType().getNativeType(),
            not_null: column.isNotNull(),
            unique: column.isUnique(),
            foreign_key: columnDefinition.foreign_key
          });
        }
        query.inherits(tableSchema.getInherits());
        this.#logger.info(`Create Query -> \n ${query.getSQLQuery()}`);
        await reserved.unsafe(query.getSQLQuery());
      } else {
        const columns =
          await reserved`SELECT column_name FROM information_schema.columns WHERE table_schema = ${tableSchema.getSchemaName()} AND table_name = ${tableSchema.getName()};`;
        const columnNames = columns.map((column: { column_name: string }) => column.column_name);
        const newColumns = tableSchema
          .getOwnColumnSchemas()
          .filter((column) => !columnNames.includes(column.getName()));
        // Create new columns
        if (newColumns.length > 0) {
          const query = `ALTER TABLE ${tableSchema.getFullName()} \n\t${newColumns
            .map((column) => {
              return `ADD COLUMN ${column.getName()} ${column
                .getColumnType()
                .getNativeType()}`;
            })
            .join(",\n\t")}\n`;
          this.#logger.info(`Alter Query -> \n ${query}`);
          await reserved.unsafe(query);
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
  table(nameWithSchema: string, context?: DatabaseOperationContext): Table {
    const tableSchema: TableSchema | undefined = this.getTableSchema(nameWithSchema);
    if (typeof tableSchema === "undefined") {
      throw new ORMError(
        DatabaseErrorCode.SCHEMA_VALIDATION_ERROR,
        `Table with name '${nameWithSchema}' is not defined`
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

  getTableSchema(tableName: string): TableSchema | undefined {
    const tableDefinition: TableDefinition | undefined =
      this.#tableDefinitionRegistry.get(
        TableSchema.getSchemaAndTableName(tableName)
      );
    if (tableDefinition) {
      return new TableSchema(
        tableDefinition,
        this.#fieldTypeRegistry,
        this.#tableDefinitionRegistry
      );
    }
  }

  isTableDefined(tableName: string): boolean {
    return this.#tableDefinitionRegistry.has(
      TableSchema.getSchemaAndTableName(tableName)
    );
  }

  addInterceptor(operationInterceptor: DatabaseOperationInterceptor): void {
    this.#operationInterceptorService.addInterceptor(operationInterceptor);
  }

  deleteInterceptor(operationInterceptorName: string): void {
    this.#operationInterceptorService.deleteInterceptor(
      operationInterceptorName
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
