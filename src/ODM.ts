import { DatabaseConfiguration, DatabaseConnection } from "./core/connection/index.ts";
import Registry from "./core/Registry.ts";
import FileType from "./data-types/DataType.ts";
import DataType from "./data-types/DataType.ts";

import StringDataType from "./data-types/types/StringFieldType.ts";
import ODMConnection from "./ODMConnection.ts";
import { TableDefinition } from "./table/definitions/TableDefinition.ts";
import DatabaseOperationInterceptorService from "./operation-interceptor/DatabaseOperationInterceptorService.ts";
import IntegerDataType from "./data-types/types/IntegerFieldType.ts";
import NumberDataType from "./data-types/types/NumberFieldType.ts";
import JSONDataType from "./data-types/types/JSONFieldType.ts";
import BooleanDataType from "./data-types/types/BooleanFieldType.ts";
import DateDataType from "./data-types/types/DateFieldType.ts";
import { Logger } from "https://deno.land/x/justaos_utils@v1.6.0/packages/logger-utils/mod.ts";
import UUIDFieldType from "./data-types/types/UUIDFieldType.ts";
import DatabaseOperationInterceptor from "./operation-interceptor/DatabaseOperationInterceptor.ts";
/*import IntegerDataType from "./field-types/types/IntegerDataType.ts";
import DateDataType from "./field-types/types/DateDataType.ts";

import ObjectFieldType from "./field-types/types/ObjectFieldType.ts";
import BooleanDataType from "./field-types/types/BooleanDataType.ts";
import ObjectIdFieldType from "./field-types/types/ObjectIdFieldType.ts";
import DateTimeFieldType from "./field-types/types/DateTimeFieldType.ts";
import AnyFieldType from "./field-types/types/AnyFieldType.ts";
import NumberDataType from "./field-types/types/NumberDataType.ts";*/

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
 * import {ODM} from "https://deno.land/x/justaos_odm@$VERSION/mod.ts";
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
  readonly #logger = Logger.createLogger({ label: ODM.name });
  readonly #config: DatabaseConfiguration;
  readonly #fieldTypeRegistry: Registry<FileType> = new Registry<FileType>();
  readonly #tableDefinitionRegistry: Registry<TableDefinition> =
    new Registry<TableDefinition>();
  readonly #schemaRegistry: Map<string, null> = new Map<string, null>();
  readonly #operationInterceptorService =
    new DatabaseOperationInterceptorService();

  constructor(config: DatabaseConfiguration) {
    this.#loadBuildInFieldTypes();
    this.#config = config;
  }

  async connect(createDatabaseIfNotExists?: boolean): Promise<ODMConnection> {
    try {
      const conn = new ODMConnection(
        this.#logger,
        this.#config,
        this.#fieldTypeRegistry,
        this.#tableDefinitionRegistry,
        this.#schemaRegistry,
        this.#operationInterceptorService
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

  addInterceptor(operationInterceptor: DatabaseOperationInterceptor): void {
    this.#operationInterceptorService.addInterceptor(operationInterceptor);
  }

  deleteInterceptor(operationInterceptorName: string): void {
    this.#operationInterceptorService.deleteInterceptor(
      operationInterceptorName
    );
  }

  #loadBuildInFieldTypes(): void {
    this.addFieldType(StringDataType);
     this.addFieldType(IntegerDataType);
    this.addFieldType(NumberDataType);
    this.addFieldType(JSONDataType);
    this.addFieldType(BooleanDataType);
    this.addFieldType(DateDataType);
    this.addFieldType(UUIDFieldType);
    //this.addFieldType()
    /*this.addFieldType(ObjectIdFieldType);
    this.addFieldType(DateTimeFieldType);*/
  }
}
