import { Logger, LoggerUtils, pg, SqlString } from "../../../deps.ts";
import { DatabaseConfiguration } from "./DatabaseConfiguration.ts";
import { DatabaseErrorCode, ORMError } from "../../errors/ORMError.ts";

const { Pool } = pg;

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
  #pool?: typeof Pool;
  readonly #logger;

  constructor(configuration: DatabaseConfiguration, logger?: Logger) {
    this.#config = configuration;
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
      this.#pool = new Pool({
        user: this.#config.username,
        database: this.#config.database || "postgres",
        password: this.#config.password,
        port: this.#config.port || 5432,
        host: this.#config.hostname,
        max: 20,
        connectionTimeoutMillis: this.#config.connect_timeout,
      });

      const client = await this.#pool.connect();
      await client.query(`select 1`);
      this.#logger.info(
        `Connected to ${this.#config.database} database successfully`,
      );
      client.release();
    } catch (err) {
      if (this.#pool) await this.#pool.end();
      this.#logger.error(err.message);
      throw err;
    }
  }

  getConnectionPool(): typeof Pool {
    if (!this.#pool) {
      throw new ORMError(
        DatabaseErrorCode.GENERIC_ERROR,
        `Database connection not established`,
      );
    }
    return this.#pool;
  }

  getDatabaseName(): string | undefined {
    return this.#config.database;
  }

  async isDatabaseExist(databaseName: string): Promise<boolean> {
    if (!databaseName) throw new Error(`No database name provided to check.`);
    const client = await this.getConnectionPool().connect();
    const result = await client.query({
      text: `SELECT EXISTS(SELECT 1 from pg_database WHERE datname = '${SqlString(
        databaseName,
      )}')`,
    });
    client.release();
    return result.rows[0].exists;
  }

  async createDatabase(databaseName: string): Promise<any> {
    if (!databaseName) throw new Error(`No database name provided to create.`);
    const client = await this.getConnectionPool().connect();
    const output = await client.query({
      text: `CREATE DATABASE "${SqlString(databaseName)}"`,
    });
    this.#logger.info(`Database ${databaseName} created successfully`);
    client.release();
    return output;
  }

  async dropDatabase(databaseName: string): Promise<any> {
    if (!databaseName) throw new Error(`No database name provided to drop.`);
    const client = await this.getConnectionPool().connect();
    const output = await client.query({
      text: `DROP DATABASE "${SqlString(databaseName)}"`,
    });
    this.#logger.info(`Database ${databaseName} dropped successfully`);
    client.release();
    return output;
  }

  async closeConnection(): Promise<void> {
    const pool = this.getConnectionPool();
    return await pool.end();
  }
}
