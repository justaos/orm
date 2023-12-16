import { Logger, postgres } from "../../../deps.ts";
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
 *   password: "admin",
 *   database: "odm-test"
 * });
 */
export default class DatabaseConnection {
  readonly #config: DatabaseConfiguration;
  #sql: any;
  readonly #logger = Logger.createLogger({ label: DatabaseConnection.name });

  constructor(configuration: DatabaseConfiguration, logger?: Logger) {
    this.#config = configuration;
    if (logger) {
      this.#logger = logger;
    }
  }

  static async connect(configuration: DatabaseConfiguration) {
    const conn = new DatabaseConnection(configuration);
    await conn.connect();
    return conn;
  }

  async connect(): Promise<void> {
    try {
      this.#sql = postgres({ ...this.#config, max: 20 });
      await this.#sql`select 1`;
      this.#logger.info(
        `Connected to ${this.#config.database} database successfully`
      );
    } catch (err) {
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
    const [output] = await this
      .#sql`SELECT EXISTS(SELECT 1 from pg_database WHERE datname=${databaseName})`;
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

  closeConnection(): Promise<void> {
    return this.getNativeConnection().end();
  }
}
