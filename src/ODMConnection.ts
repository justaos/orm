import {
  DatabaseConfiguration,
  DatabaseConnection
} from "./core/connection/index.ts";
import Registry from "./core/Registry.ts";
import TableSchema from "./table/TableSchema.ts";
import DataType from "./field-types/DataType.ts";
import {
  TableSchemaDefinition,
  TableSchemaDefinitionStrict
} from "./table/definitions/TableSchemaDefinition.ts";
import { Logger } from "https://deno.land/x/justaos_utils@v1.6.0/packages/logger-utils/mod.ts";

export default class ODMConnection {
  readonly #config: DatabaseConfiguration;
  readonly #conn: DatabaseConnection;
  readonly #fieldTypeRegistry: Registry<DataType>;
  readonly #schemaRegistry: Map<string, null>;
  readonly #tableDefinitionRegistry: Registry<TableSchemaDefinitionStrict>;
  readonly #logger = Logger.createLogger({ label: DatabaseConnection.name });

  /*  #operationInterceptorService: OperationInterceptorService =
      new OperationInterceptorService();*/

  constructor(
    config: DatabaseConfiguration,
    fieldTypeRegistry: Registry<DataType>,
    tableDefinitionRegistry: Registry<TableSchemaDefinitionStrict>,
    schemaRegistry: Map<string, null>
  ) {
    this.#config = config;
    this.#conn = new DatabaseConnection(config);
    this.#fieldTypeRegistry = fieldTypeRegistry;
    this.#tableDefinitionRegistry = tableDefinitionRegistry;
    this.#schemaRegistry = schemaRegistry;
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

  async defineTable(tableSchemaDefinition: TableSchemaDefinition) {
    const tableSchema = new TableSchema(
      tableSchemaDefinition,
      this.#fieldTypeRegistry,
      this.#tableDefinitionRegistry
    );
    try {
      tableSchema.validate();
    } catch (error) {
      this.#logger.error(error.message);
      throw error;
    }
    const tableSchemaDefinitionStrict = tableSchema.getDefinition();
    this.#tableDefinitionRegistry.add(tableSchema.getDefinition());

    const sql = this.#conn.getNativeConnection();
    const reserved = await sql.reserve();

    try {
      const [{ exists: schemaExists }] = await reserved`SELECT EXISTS(SELECT
                    FROM information_schema.schemata
                    WHERE schema_name = ${tableSchemaDefinitionStrict.schema}
                    LIMIT 1);`;

      if (!schemaExists) {
        await reserved`CREATE SCHEMA IF NOT EXISTS ${sql(
          tableSchemaDefinitionStrict.schema
        )};`;
        this.#logger.info(
          `Schema ${tableSchemaDefinitionStrict.schema} created`
        );
        this.#schemaRegistry.set(tableSchemaDefinitionStrict.schema, null);
      }

      const [{ exists: tableExists }] = await reserved`SELECT EXISTS(SELECT
                    FROM information_schema.tables
                    WHERE table_name = ${tableSchemaDefinitionStrict.name} AND table_schema = ${tableSchemaDefinitionStrict.schema}
                    LIMIT 1);`;

      if (!tableExists) {
        const query = `CREATE TABLE IF NOT EXISTS ${
          tableSchemaDefinitionStrict.schema
        }.${tableSchemaDefinitionStrict.name} (\n\t${tableSchema
          .getColumnSchemas()
          .map((column) => {
            return `${column.getName()} ${column
              .getColumnType()
              .getNativeType()}`;
          })
          .join(",\n\t")}\n);`;
        this.#logger.info(`creating table ${tableSchemaDefinitionStrict.name}`);
        this.#logger.info(`Create Query -> \n ${query}`);
        await reserved.unsafe(query);
      } else {
        const columns =
          await reserved`SELECT column_name FROM information_schema.columns WHERE table_schema = ${tableSchemaDefinitionStrict.schema} AND table_name = ${tableSchemaDefinitionStrict.name};`;
        const columnNames = columns.map((column: any) => column.column_name);
        const newColumns = tableSchema
          .getColumnSchemas()
          .filter((column) => !columnNames.includes(column.getName()));
        // Create new columns
        if (newColumns.length > 0) {
          const query = `ALTER TABLE ${tableSchemaDefinitionStrict.schema}.${
            tableSchemaDefinitionStrict.name
          } \n\t${newColumns
            .map((column) => {
              return `ADD COLUMN ${column.getName()} ${column
                .getColumnType()
                .getNativeType()}`;
            })
            .join(",\n\t")}\n`;
          this.#logger.info(`alter table ${tableSchemaDefinitionStrict.name}`);
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
  /* table(name: string, context?: any): Collection {
    const schema: Schema | undefined =
      this.#tableDefinitionRegistry.getSchema(name);
    if (schema === undefined) {
      throw Error(`Collection with name '${name}' is not defined`);
    }
    return new Collection(
      this.#getConnection().getDBO().collection(schema.getBaseName()),
      schema,
      this.#operationInterceptorService,
      context
    );
  }*/

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
