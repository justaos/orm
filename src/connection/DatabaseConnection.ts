import { Logger, LoggerUtils, pg, SqlString } from "../../deps.ts";
import { DatabaseConfiguration } from "./DatabaseConfiguration.ts";
import { DatabaseErrorCode, ORMError } from "../errors/ORMError.ts";

const { Pool } = pg;

/**
 * DatabaseConnection class manages the connection to the database.
 *
 * @class
 * @classdesc DatabaseConnection class to manage connection to the database.
 * @param {DatabaseConfiguration} configuration - Database configuration.
 * @param {Logger} logger - Logger instance.
 * @throws {Error} - Throws error if database connection fails.
 * @returns {DatabaseConnection} - Database connection instance.
 *
 * @example
 * ```ts
 *  new DatabaseConnection({
 *   host: "127.0.0.1",
 *   port: 5432,
 *   username: "postgres",
 *   password: "postgres",
 *   database: "project-management-system"
 * ```
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

  /**
   * Establishes a connection to the database.
   *
   * @returns {Promise<void>} A promise that resolves when the connection is successfully established.
   * @throws {Error} Throws an error if the connection could not be established.
   */
  async connect(): Promise<void> {
    let client;
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

      client = await this.#pool.connect();
      await client.query(`select 1`);
      this.#logger.info(
        `Connected to ${this.#config.database} database successfully`,
      );
    } catch (err) {
      if (this.#pool) await this.#pool.end();
      this.#logger.error(err.message);
      throw err;
    }
    if (client) {
      client.release();
    }
  }

  /**
   * Returns the connection pool.
   *
   * @returns {Pool} The connection pool.
   * @throws {ORMError} Throws an error if the connection pool is not established.
   */
  getConnectionPool(): typeof Pool {
    if (!this.#pool) {
      throw new ORMError(
        DatabaseErrorCode.GENERIC_ERROR,
        `Database connection not established`,
      );
    }
    return this.#pool;
  }

  /**
   * Returns the database name.
   *
   * @returns {string | undefined} The database name.
   */
  getDatabaseName(): string | undefined {
    return this.#config.database;
  }

  /**
   * Checks if a database exists.
   *
   * @param {string} databaseName - The name of the database.
   * @returns {Promise<boolean>} A promise that resolves to a boolean indicating whether the database exists.
   * @throws {Error} Throws an error if no database name is provided.
   */
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

  /**
   * Creates a database.
   *
   * @param {string} databaseName - The name of the database.
   * @returns {Promise<any>} A promise that resolves when the database is created.
   * @throws {Error} Throws an error if no database name is provided.
   */
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

  /**
   * Drops a database.
   *
   * @param {string} databaseName - The name of the database.
   * @returns {Promise<any>} A promise that resolves when the database is dropped.
   * @throws {Error} Throws an error if no database name is provided.
   */
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

  /**
   * Closes the database connection.
   *
   * @returns {Promise<void>} A promise that resolves when the connection is closed.
   */
  async closeConnection(): Promise<void> {
    const pool = this.getConnectionPool();
    return await pool.end();
  }
}
