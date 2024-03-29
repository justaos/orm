import { Logger, LoggerUtils, postgres } from "../../../deps.ts";
import { DatabaseConfiguration } from "./DatabaseConfiguration.ts";
import { NativeSQL } from "../NativeSQL.ts";
import { DatabaseErrorCode, ORMError } from "../../errors/ORMError.ts";

/**
 * A class to handle the connection to the database.
 * @param configuration A URI string from the user.
 * @returns A connection object.
 * example: new DatabaseConnection({
 *   host: "127.0.0.1",
 *   port: 5432,
 *   username: "postgres",
 *   password: "postgres",
 *   database: "odm-test"
 * });
 */
export default class DatabaseConnection {
  readonly #config: DatabaseConfiguration;
  #sql: any;
  readonly #logger;

  constructor(configuration: DatabaseConfiguration, logger?: Logger) {
    this.#config = { max_connections: 20, ...configuration };
    if (logger) this.#logger = logger;
    else this.#logger = LoggerUtils.getLogger(DatabaseConnection.name);
  }

  static async connect(configuration: DatabaseConfiguration) {
    const conn = new DatabaseConnection(configuration);
    await conn.connect();
    return conn;
  }

  async connect(): Promise<void> {
    try {
      this.#sql = postgres({
        ...this.#config,
        max: this.#config.max_connections,
      });
      await this.#sql`select 1`;
      this.#logger.info(
        `Connected to ${this.#config.database} database successfully`
      );
    } catch (err) {
      if (this.#sql) await this.#sql.end();
      this.#logger.error(err.message);
      throw err;
    }
  }

  getNativeConnection(): NativeSQL {
    if (!this.#sql) {
      throw new ORMError(
        DatabaseErrorCode.GENERIC_ERROR,
        `Database connection not established`
      );
    }
    return this.#sql;
  }

  getDatabaseName(): string | undefined {
    return this.#config.database;
  }

  async isDatabaseExist(databaseName: string): Promise<boolean> {
    if (!databaseName) throw new Error(`No database name provided to check.`);
    const reserve = await this.#sql.reserve();
    const [output] =
      await reserve`SELECT EXISTS(SELECT 1 from pg_database WHERE datname=${databaseName})`.execute();
    await reserve.release();
    return output.exists;
  }

  async createDatabase(databaseName: string): Promise<any> {
    if (!databaseName) throw new Error(`No database name provided to create.`);
    const output = await this.getNativeConnection()`CREATE DATABASE ${this.#sql(
      databaseName
    )}`;
    this.#logger.info(`Database ${databaseName} created successfully`);
    return output;
  }

  async dropDatabase(databaseName: string): Promise<any> {
    if (!databaseName) throw new Error(`No database name provided to drop.`);
    const output = await this.getNativeConnection()`DROP DATABASE ${this.#sql(
      databaseName
    )}`;
    this.#logger.info(`Database ${databaseName} dropped successfully`);
    return output;
  }

  async closeConnection(): Promise<void> {
    return await this.getNativeConnection().end();
  }
}
