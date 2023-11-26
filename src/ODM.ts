import { DatabaseConfiguration, DatabaseConnection } from "./core/connection/index.ts";
import Registry from "./core/Registry.ts";
import FileType from "./field-types/DataType.ts";
import DataType from "./field-types/DataType.ts";

import StringFieldType from "./field-types/types/StringFieldType.ts";
import ODMConnection from "./ODMConnection.ts";
import { TableSchemaDefinitionStrict } from "./table/definitions/TableSchemaDefinition.ts";
/*import IntegerFieldType from "./field-types/types/IntegerFieldType.ts";
import DateFieldType from "./field-types/types/DateFieldType.ts";

import ObjectFieldType from "./field-types/types/ObjectFieldType.ts";
import BooleanFieldType from "./field-types/types/BooleanFieldType.ts";
import ObjectIdFieldType from "./field-types/types/ObjectIdFieldType.ts";
import DateTimeFieldType from "./field-types/types/DateTimeFieldType.ts";
import AnyFieldType from "./field-types/types/AnyFieldType.ts";
import NumberFieldType from "./field-types/types/NumberFieldType.ts";*/

/*
 *
 */

/**
 * JUSTAOS's ODM (Object Document Mapper) is built for Deno and provides transparent persistence for JavaScript objects to Postgres database.
 * - Supports all primitive data types (string, integer, float, boolean, date, object, array, etc).
 * - Supports custom data types.
 * - Supports table with multi-level inheritance.
 * - Also supports interception on operations (create, read, update and delete).
 *
 * @example
 * Get connection to database
 * ```ts
 * import {ODM} from 'https://deno.land/x/justaos_odm@$VERSION/mod.ts';
 * const odm = new ODM({
 *  hostname: "localhost",
 *  port: 5432,
 *  username: "postgres",
 *  password: "postgres"
 * });
 * odm.connect();
 * ```
 *
 * @param config Database configuration
 */
export default class ODM {
  readonly #config: DatabaseConfiguration;
  readonly #fieldTypeRegistry: Registry<FileType> = new Registry<FileType>();
  readonly #tableDefinitionRegistry: Registry<TableSchemaDefinitionStrict> =
    new Registry<TableSchemaDefinitionStrict>();
  readonly #schemaRegistry: Map<string, null> = new Map<string, null>();

  /*  #operationInterceptorService: OperationInterceptorService =
      new OperationInterceptorService();*/

  constructor(config: DatabaseConfiguration) {
    this.#loadBuildInFieldTypes();
    this.#config = config;
  }

  async connect(createDatabaseIfNotExists?: boolean): Promise<ODMConnection> {
    try {
      const conn = new ODMConnection(
        this.#config,
        this.#fieldTypeRegistry,
        this.#tableDefinitionRegistry,
        this.#schemaRegistry
      );
      await conn.connect();
      return conn;
    } catch (error) {
      if (
        error.name === "PostgresError" &&
        error.code === "3D000" &&
        this.#config.database &&
        createDatabaseIfNotExists
      ) {
        const tempConn = new DatabaseConnection({
          ...this.#config,
          database: "postgres"
        });
        await tempConn.connect();
        await tempConn.createDatabase(this.#config.database);
        return await this.connect(false);
      } else {
        throw error;
      }
    }
  }

  isTableDefined(tableName: string): boolean {
    return this.#tableDefinitionRegistry.has(tableName);
  }

  addFieldType(FieldTypeClass: new (odm: ODM) => DataType): void {
    this.#fieldTypeRegistry.add(new FieldTypeClass(this));
  }

  #loadBuildInFieldTypes(): void {
    this.addFieldType(StringFieldType);
    /* this.addFieldType(IntegerFieldType);
     this.addFieldType(NumberFieldType);
     this.addFieldType(DateFieldType);
     this.addFieldType(ObjectFieldType);
     this.addFieldType(BooleanFieldType);
     this.addFieldType(ObjectIdFieldType);
     this.addFieldType(DateTimeFieldType);
     this.addFieldType(AnyFieldType);*/
  }
}
