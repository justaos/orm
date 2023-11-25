import { Logger, postgres } from "../../../deps.ts";
import { DatabaseConfigurationOptions } from "./DatabaseConfiguration.ts";

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
  readonly #config: DatabaseConfigurationOptions;
  #sql: any;
  readonly #logger = Logger.createLogger({ label: DatabaseConnection.name });

  constructor(configuration: DatabaseConfigurationOptions) {
    this.#config = configuration;
  }

  async connect() {
    try {
      this.#sql = postgres(this.#config);
      await this.#sql`select 1`;
      this.#logger.info(`Connected to ${this.#config.database} database successfully`)
    } catch (err) {
      this.#logger.error(err.message);
      throw err;
    }
  }

  static async connect(configuration: DatabaseConfigurationOptions) {
    const conn = new DatabaseConnection(configuration);
    await conn.connect();
    return conn;
  }

  /* async dropDatabase(): Promise<boolean> {
     return await this.getDBO().dropDatabase();
   }*/

  #getNativeConnection(): any {
    if (!this.#sql) {
      throw new Error("Database connection not established");
    }
    return this.#sql;
  }

  getNativeConnection(): any {
    return this.#getNativeConnection();
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

  async createDatabase(databaseName: string): Promise<boolean> {
    if (!databaseName) throw new Error(`No database name provided to create.`);
    const output =
      await this.#getNativeConnection()`CREATE DATABASE ${this.#sql(
        databaseName
      )}`;
    this.#logger.info(`Database ${databaseName} created successfully`);
    return output;
  }

  async dropDatabase(): Promise<boolean> {
    if (!this.getDatabaseName())
      throw new Error(`No database name provided to drop.`);
    const output = await this.#getNativeConnection()`DROP DATABASE ${this.#sql(
      this.getDatabaseName()
    )}`;
    this.#logger.info(
      `Database ${this.getDatabaseName()} dropped successfully`
    );
    return output;
  }

  closeConnection(): Promise<void> {
    if (!this.#sql) {
      throw new Error(`No connection established to disconnect.`);
    }
    return this.#sql.end();
  }
}
