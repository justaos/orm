import { Logger, mongodb } from "../../../deps.ts";
import { DatabaseConfiguration, DatabaseConfigurationOptions } from "./DatabaseConfiguration.ts";

/**
 * A class to handle the connection to the database.
 * @param configuration A URI string from the user.
 * @returns A connection object.
 * example: new DatabaseConnection('mongodb+srv://example-uri');
 */
export default class DatabaseConnection {
  readonly #uri: string;
  #conn: mongodb.MongoClient | null;
  public connected: boolean;
  readonly #logger = Logger.createLogger({ label: DatabaseConnection.name });
  readonly #databaseName: string;

  constructor(configuration: string | DatabaseConfigurationOptions) {
    this.connected = false;
    this.#conn = null;
    if (typeof configuration === "string") {
      this.#uri = configuration;
      this.#databaseName = new URL(configuration).pathname.substring(1);
    } else if (typeof configuration === "object") {
      this.#uri = new DatabaseConfiguration(configuration).getUri();
      this.#databaseName = configuration.database;
    } else {
      throw new Error("Invalid database configuration");
    }
  }

  async connect() {
    try {
      const client = new mongodb.MongoClient(this.#uri);
      await client.connect();
      this.#logger.info("Database connection established successfully");
      this.connected = true;
      this.#conn = client;
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

  async dropDatabase(): Promise<boolean> {
    return await this.getDBO().dropDatabase();
  }

  #getConnection(): mongodb.MongoClient {
    if (!this.#conn) {
      throw new Error("Database connection not established");
    }
    return this.#conn;
  }

  getDBO(): mongodb.Db {
    return this.#getConnection().db(this.#databaseName);
  }

  getDatabaseName(): string {
    return this.#databaseName;
  }

  async databaseExists(): Promise<boolean> {
    // Use the admin database for the operation
    const adminDb = this.#getConnection().db("test").admin();

    // List all the available databases
    const dbs = await adminDb.command({ listDatabases: 1 });
    const index = dbs.databases.findIndex(
      (db: any) => db.name === this.#databaseName
    );
    return index !== -1;
  }

  async deleteAllIndexes() {
    const dbo = this.getDBO();
    const collections = await dbo.listCollections().toArray();
    collections.forEach((col) => {
      dbo.command({ dropIndexes: col.name, index: "*" });
    });
  }

  closeConnection(): Promise<void> {
    if (!this.#conn) {
      throw new Error(`No connection established to disconnect.`);
    }
    return this.#conn.close();
  }
}
