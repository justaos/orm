import DatabaseConnection from "./connection/DatabaseConnection.ts";
import { DatabaseConfiguration } from "./connection/DatabaseConfiguration.ts";
import DataType from "./data-types/DataType.ts";

import StringDataType from "./data-types/types/StringDataType.ts";
import ORMConnection from "./ORMConnection.ts";
import IntegerDataType from "./data-types/types/IntegerDataType.ts";
import NumberDataType from "./data-types/types/NumberDataType.ts";
import JSONDataType from "./data-types/types/JSONDataType.ts";
import BooleanDataType from "./data-types/types/BooleanDataType.ts";
import DateDataType from "./data-types/types/DateDataType.ts";
import DateTimeDataType from "./data-types/types/DateTimeDataType.ts";
import UUIDDataType from "./data-types/types/UUIDDataType.ts";
import DatabaseOperationInterceptor from "./operation-interceptor/DatabaseOperationInterceptor.ts";
import TimeDataType from "./data-types/types/TimeDataType.ts";
import CharDataType from "./data-types/types/CharDataType.ts";
import { CommonUtils, Logger, LoggerUtils, UUID4 } from "../deps.ts";
import RegistriesHandler from "./RegistriesHandler.ts";

/**
 * JUSTAOS's ORM (Object Document Mapper) is built for Deno and provides transparent persistence for JavaScript objects to Postgres database.
 * - Supports all primitive data types (string, integer, float, boolean, date, object, array, etc).
 * - Supports custom data types.
 * - Supports table with multi-level inheritance.
 * - Also supports interception on operations (create, read, update and delete).
 *
 * @example
 * ```typescript
 * import { ORM } from "@justaos/orm";
 * const odm = new ORM({
 *  hostname: "localhost",
 *  port: 5432,
 *  username: "postgres",
 *  password: "postgres"
 * });
 * odm.connect();
 * ```
 *
 * @module ORM
 * @see {@link DatabaseConfiguration} for the configuration options
 * @see {@link DataType} for the data types supported
 * @see {@link TableDefinition} for the table definitions
 * @see {@link DatabaseOperationInterceptor} for the operation interceptors
 *
 * @method connect Establishes a connection to the database
 * @method isDatabaseExist Checks if the database exists
 * @method isTableDefined Checks if a table is defined in the registry
 * @method addDataType Adds a new data type to the registry
 * @method addInterceptor Adds a new operation interceptor to the service
 * @method deleteInterceptor Deletes an operation interceptor from the service
 */
export default class ORM {
  readonly #logger: Logger;
  readonly #config: DatabaseConfiguration;

  readonly #registryHandler = new RegistriesHandler();

  constructor(config: DatabaseConfiguration, logger?: Logger) {
    this.#loadBuildInFieldTypes();
    this.#config = config;
    if (logger) this.#logger = logger;
    else this.#logger = LoggerUtils.getLogger(ORM.name);
  }

  /**
   * Generates a new record ID.
   */
  static generateRecordId(): UUID4 {
    return <UUID4>CommonUtils.generateUUID();
  }

  /**
   * Checks if the given ID is a valid record ID.
   * @param id
   */
  static isValidRecordId(id: UUID4): boolean {
    return CommonUtils.validateUUID(id);
  }

  /**
   * Establishes a connection to the database.
   * @param createDatabaseIfNotExists If true, creates the database if it does not exist.
   */
  async connect(createDatabaseIfNotExists?: boolean): Promise<ORMConnection> {
    try {
      const conn = new ORMConnection(
        this.#logger,
        this.#config,
        this.#registryHandler,
      );
      await conn.connect();
      return conn;
    } catch (error) {
      if (
        error.code === "3D000" &&
        this.#config.database &&
        createDatabaseIfNotExists
      ) {
        const tempConn = new DatabaseConnection({
          ...this.#config,
          database: "postgres",
        });
        await tempConn.connect();
        await tempConn.createDatabase(this.#config.database);
        await tempConn.closeConnection();
        return await this.connect(false);
      } else {
        throw error;
      }
    }
  }

  /**
   * Checks if the database exists.
   */
  async isDatabaseExist(): Promise<boolean> {
    const tempConn = new DatabaseConnection({
      ...this.#config,
      database: "postgres",
    });
    if (!this.#config.database) throw new Error("database name not provided");
    await tempConn.connect();
    const result = await tempConn.isDatabaseExist(this.#config.database);
    await tempConn.closeConnection();
    return result;
  }

  /**
   * Checks if a table is defined in the registry.
   * @param tableName
   */
  isTableDefined(tableName: string): boolean {
    return this.#registryHandler.tableDefinitionRegistry.has(tableName);
  }

  /**
   * Adds a new data type to the registry.
   * @param dataType
   */
  addDataType(dataType: DataType): void {
    this.#registryHandler.dataTypeRegistry.add(dataType);
  }

  /**
   * Adds a new operation interceptor to the service.
   * @param operationInterceptor
   */
  addInterceptor(operationInterceptor: DatabaseOperationInterceptor): void {
    this.#registryHandler.operationInterceptorService.addInterceptor(
      operationInterceptor,
    );
  }

  /**
   * Deletes an operation interceptor from the service.
   * @param operationInterceptorName
   */
  deleteInterceptor(operationInterceptorName: string): void {
    this.#registryHandler.operationInterceptorService.deleteInterceptor(
      operationInterceptorName,
    );
  }

  /**
   * Loads the built-in field types.
   * @private
   */
  #loadBuildInFieldTypes(): void {
    this.addDataType(new BooleanDataType());
    this.addDataType(new CharDataType());
    this.addDataType(new DateDataType());
    this.addDataType(new DateTimeDataType());
    this.addDataType(new IntegerDataType());
    this.addDataType(new JSONDataType());
    this.addDataType(new NumberDataType());
    this.addDataType(new StringDataType());
    this.addDataType(new TimeDataType());
    this.addDataType(new UUIDDataType());
  }
}
