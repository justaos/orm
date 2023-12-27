import { DatabaseConfiguration, DatabaseConnection } from "./core/connection/index.ts";
import Registry from "./core/Registry.ts";
import DataType from "./data-types/DataType.ts";

import StringDataType from "./data-types/types/StringDataType.ts";
import ORMConnection from "./ORMConnection.ts";
import { TableDefinition } from "./types.ts";
import DatabaseOperationInterceptorService from "./operation-interceptor/DatabaseOperationInterceptorService.ts";
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
import TableSchema from "./table/TableSchema.ts";
import TableNameUtils from "./table/TableNameUtils.ts";
import { CommonUtils, Logger, LoggerUtils, UUID } from "../deps.ts";

/**
 * JUSTAOS's ORM (Object Document Mapper) is built for Deno and provides transparent persistence for JavaScript objects to Postgres database.
 * - Supports all primitive data types (string, integer, float, boolean, date, object, array, etc).
 * - Supports custom data types.
 * - Supports table with multi-level inheritance.
 * - Also supports interception on operations (create, read, update and delete).
 *
 * @example
 * Get connection to database
 * ```ts
 * import {ORM} from "https://deno.land/x/justaos_odm@$VERSION/mod.ts";
 * const odm = new ORM({
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
export default class ORM {
  readonly #logger: Logger;
  readonly #config: DatabaseConfiguration;
  readonly #dataTypeRegistry: Registry<DataType> = new Registry<DataType>(
    function(dataType): string {
      return dataType.getName();
    }
  );
  readonly #tableDefinitionRegistry: Registry<TableDefinition> =
    new Registry<TableDefinition>(function(tableDefinition) {
      return TableNameUtils.getShortFormTableName(`${tableDefinition.schema}.${tableDefinition.name}`);
    });
  readonly #schemaRegistry: Map<string, null> = new Map<string, null>();
  readonly #operationInterceptorService =
    new DatabaseOperationInterceptorService();

  constructor(config: DatabaseConfiguration, logger?: Logger) {
    this.#loadBuildInFieldTypes();
    this.#config = config;
    if (logger) this.#logger = logger;
    else this.#logger = LoggerUtils.getLogger(ORM.name);
  }

  static generateRecordId(): UUID {
    return CommonUtils.generateUUID();
  }

  static isValidRecordId(id: UUID): boolean {
    return CommonUtils.validateUUID(id);
  }

  async connect(createDatabaseIfNotExists?: boolean): Promise<ORMConnection> {
    try {
      const conn = new ORMConnection(
        this,
        this.#logger,
        this.#config,
        this.#dataTypeRegistry,
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
        await tempConn.closeConnection();
        return await this.connect(false);
      } else {
        throw error;
      }
    }
  }

  async isDatabaseExist(): Promise<boolean> {
    const tempConn = new DatabaseConnection({
      ...this.#config,
      database: "postgres"
    });
    if (!this.#config.database)
      throw new Error("database name not provided");
    await tempConn.connect();
    const result = await tempConn.isDatabaseExist(this.#config.database);
    await tempConn.closeConnection();
    return result;
  }

  isTableDefined(tableName: string): boolean {
    return this.#tableDefinitionRegistry.has(tableName);
  }

  getTableSchema(tableName: string): TableSchema | undefined {
    const tableDefinition: TableDefinition | undefined =
      this.#tableDefinitionRegistry.get(tableName);
    if (tableDefinition) {
      return new TableSchema(
        tableDefinition,
        this.#dataTypeRegistry,
        this.#tableDefinitionRegistry
      );
    }
  }

  addDataType(dataType: DataType): void {
    this.#dataTypeRegistry.add(dataType);
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
