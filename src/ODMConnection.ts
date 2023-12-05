import {
  DatabaseConfiguration,
  DatabaseConnection
} from "./core/connection/index.ts";
import Registry from "./core/Registry.ts";
import TableSchema from "./table/TableSchema.ts";
import DataType from "./data-types/DataType.ts";
import {
  TableDefinition,
  TableDefinitionRaw
} from "./table/definitions/TableDefinition.ts";
import { Logger } from "../deps.ts";
import Table from "./table/Table.ts";
import DatabaseOperationInterceptorService from "./operation-interceptor/DatabaseOperationInterceptorService.ts";
import { DatabaseErrorCode, ODMError } from "./errors/ODMError.ts";
import { DatabaseOperationContext } from "./operation-interceptor/DatabaseOperationContext.ts";
import DatabaseOperationInterceptor from "./operation-interceptor/DatabaseOperationInterceptor.ts";
import { UUID, UUIDUtils } from "./core/UUID.ts";

export default class ODMConnection {
  readonly #config: DatabaseConfiguration;
  readonly #conn: DatabaseConnection;
  readonly #fieldTypeRegistry: Registry<DataType>;
  readonly #schemaRegistry: Map<string, null>;
  readonly #tableDefinitionRegistry: Registry<TableDefinition>;
  readonly #logger: Logger;
  readonly #operationInterceptorService: DatabaseOperationInterceptorService;

  /*  #operationInterceptorService: OperationInterceptorService =
      new OperationInterceptorService();*/

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
    const tempConn = new DatabaseConnection(
      {
        ...this.#config,
        database: "postgres"
      },
      this.#logger
    );
    await tempConn.connect();
    return tempConn.dropDatabase(databaseName);
  }

  async defineTable(tableDefinition: TableDefinitionRaw | Function) {
    if (typeof tableDefinition === "function") {
      // @ts-ignore
      tableDefinition = tableDefinition.__tableDefinition;
    }
    const tableSchema = new TableSchema(
      tableDefinition,
      this.#fieldTypeRegistry,
      this.#tableDefinitionRegistry
    );
    try {
      tableSchema.validate();
    } catch (error) {
      this.#logger.error(error.message);
      throw error;
    }
    this.#tableDefinitionRegistry.add(
      tableSchema.getDefinition(),
      tableSchema.getFullName()
    );

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
        let query = `CREATE TABLE IF NOT EXISTS ${tableSchema.getFullName()}`;
        query = `${query} (\n\t`;
        query = `${query} ${tableSchema
          .getOwnColumnSchemas()
          .map((column) => {
            return `"${column.getName()}" ${column
              .getColumnType()
              .getNativeType()} ${column.isNotNull() ? "NOT NULL" : ""} ${
              column.isUnique() ? "UNIQUE" : ""
            }`;
          })
          .join(",\n\t")}`;
        if (!tableSchema.getInherits()) {
          query = `${query},
          \t PRIMARY KEY (id)
          \t`;
        }
        query = `${query} \n)`;
        if (tableSchema.getInherits()) {
          query = `${query}
          INHERITS (${tableSchema.getInherits()})`;
        }
        this.#logger.info(`Create Query -> \n ${query}`);
        await reserved.unsafe(query);
      } else {
        const columns =
          await reserved`SELECT column_name FROM information_schema.columns WHERE table_schema = ${tableSchema.getSchemaName()} AND table_name = ${tableSchema.getName()};`;
        const columnNames = columns.map((column: any) => column.column_name);
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
    const tableDefinitionStrict: TableDefinition | undefined =
      this.#tableDefinitionRegistry.get(
        TableSchema.getSchemaAndTableName(nameWithSchema)
      );
    if (typeof tableDefinitionStrict === "undefined") {
      throw new ODMError(
        DatabaseErrorCode.SCHEMA_VALIDATION_ERROR,
        `Collection with name '${nameWithSchema}' is not defined`
      );
    }
    const tableSchema = new TableSchema(
      tableDefinitionStrict,
      this.#fieldTypeRegistry,
      this.#tableDefinitionRegistry
    );
    return new Table(
      this.#conn.getNativeConnection(),
      tableSchema,
      this.#operationInterceptorService,
      context
    );
  }

  /* getSchema(name: string): TableSchema | undefined {
    return this.#tableDefinitionRegistry.get(name);
  }*/

  isTableDefined(collectionName: string): boolean {
    return this.#tableDefinitionRegistry.has(collectionName);
  }

  addInterceptor(operationInterceptor: DatabaseOperationInterceptor): void {
    this.#operationInterceptorService.addInterceptor(operationInterceptor);
  }

  deleteInterceptor(operationInterceptorName: string): void {
    this.#operationInterceptorService.deleteInterceptor(
      operationInterceptorName
    );
  }

  generateRecordId(): UUID {
    return UUIDUtils.generateId();
  }

  validateRecordId(id: UUID): boolean {
    return UUIDUtils.isValidId(id);
  }

  #getConnection(): DatabaseConnection {
    if (!this.#conn) {
      throw new ODMError(
        DatabaseErrorCode.GENERIC_ERROR,
        "There is no active connection"
      );
    }
    return this.#conn;
  }
}
