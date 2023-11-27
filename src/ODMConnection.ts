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

export default class ODMConnection {
  readonly #config: DatabaseConfiguration;
  readonly #conn: DatabaseConnection;
  readonly #fieldTypeRegistry: Registry<DataType>;
  readonly #schemaRegistry: Map<string, null>;
  readonly #tableDefinitionRegistry: Registry<TableDefinition>;
  readonly #logger = Logger.createLogger({ label: DatabaseConnection.name });
  readonly #operationInterceptorService: DatabaseOperationInterceptorService;

  /*  #operationInterceptorService: OperationInterceptorService =
      new OperationInterceptorService();*/

  constructor(
    config: DatabaseConfiguration,
    fieldTypeRegistry: Registry<DataType>,
    tableDefinitionRegistry: Registry<TableDefinition>,
    schemaRegistry: Map<string, null>,
    operationInterceptorService: DatabaseOperationInterceptorService
  ) {
    this.#config = config;
    this.#conn = new DatabaseConnection(config);
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
    const tempConn = new DatabaseConnection({
      ...this.#config,
      database: "postgres"
    });
    await tempConn.connect();
    return tempConn.dropDatabase(databaseName);
  }

  async defineTable(tableDefinition: TableDefinitionRaw) {
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
    const tableDefinitionStrict = tableSchema.getDefinition();
    this.#tableDefinitionRegistry.add(tableSchema.getDefinition());

    const sql = this.#conn.getNativeConnection();
    const reserved = await sql.reserve();

    try {
      const [{ exists: schemaExists }] = await reserved`SELECT EXISTS(SELECT
                    FROM information_schema.schemata
                    WHERE schema_name = ${tableDefinitionStrict.schema}
                    LIMIT 1);`;

      if (!schemaExists) {
        await reserved`CREATE SCHEMA IF NOT EXISTS ${sql(
          tableDefinitionStrict.schema
        )};`;
        this.#logger.info(`Schema ${tableDefinitionStrict.schema} created`);
        this.#schemaRegistry.set(tableDefinitionStrict.schema, null);
      }

      const [{ exists: tableExists }] = await reserved`SELECT EXISTS(SELECT
                    FROM information_schema.tables
                    WHERE table_name = ${tableDefinitionStrict.name} AND table_schema = ${tableDefinitionStrict.schema}
                    LIMIT 1);`;

      if (!tableExists) {
        let query = `CREATE TABLE IF NOT EXISTS ${
          tableDefinitionStrict.schema
        }.${tableDefinitionStrict.name} (\n\t${tableSchema
          .getOwnColumnSchemas()
          .map((column) => {
            const columnDef = `${column.getName()} ${column
              .getColumnType()
              .getNativeType()}`;
            if (column.getName() == "id") {
              return columnDef + " PRIMARY KEY";
            }
            return columnDef;
          })
          .join(",\n\t")}\n)`;
        if (tableDefinitionStrict.inherits) {
          query = `${query} INHERITS (${tableDefinitionStrict.schema}.${tableDefinitionStrict.inherits})`;
        }
        this.#logger.info(`Create Query -> \n ${query}`);
        await reserved.unsafe(query);
      } else {
        const columns =
          await reserved`SELECT column_name FROM information_schema.columns WHERE table_schema = ${tableDefinitionStrict.schema} AND table_name = ${tableDefinitionStrict.name};`;
        const columnNames = columns.map((column: any) => column.column_name);
        const newColumns = tableSchema
          .getOwnColumnSchemas()
          .filter((column) => !columnNames.includes(column.getName()));
        // Create new columns
        if (newColumns.length > 0) {
          const query = `ALTER TABLE ${tableDefinitionStrict.schema}.${
            tableDefinitionStrict.name
          } \n\t${newColumns
            .map((column) => {
              return `ADD COLUMN ${column.getName()} ${column
                .getColumnType()
                .getNativeType()}`;
            })
            .join(",\n\t")}\n`;
          this.#logger.info(`alter table ${tableDefinitionStrict.name}`);
          this.#logger.info(`Alter Query -> \n ${query}`);
          await reserved.unsafe(query);
        }
      }
    } finally {
      reserved.release();
    }
  }

  /*
   * Get table object
   * @param name Table name
   * @param context Context object
   */
  table(nameWithSchema: string, context?: any): Table {
    const [schema, name] = nameWithSchema.split(".");
    if (!schema) {
      throw Error(`Schema is not defined in table name '${nameWithSchema}'`);
    }
    const tableDefinitionStrict: TableDefinition | undefined =
      this.#tableDefinitionRegistry.get(name);
    if (typeof tableDefinitionStrict === "undefined") {
      throw Error(`Collection with name '${name}' is not defined`);
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

  /* addInterceptor(operationInterceptor: OperationInterceptorInterface): void {
     this.#operationInterceptorService.addInterceptor(operationInterceptor);
   }
 
   deleteInterceptor(operationInterceptorName: string): void {
     this.#operationInterceptorService.deleteInterceptor(
       operationInterceptorName
     );
   }
 */

  generateRecordId(): string {
    return crypto.randomUUID();
  }

  #getConnection(): DatabaseConnection {
    if (!this.#conn) {
      throw new Error("ODM::#getConnection -> There is no active connection");
    }
    return this.#conn;
  }
}
