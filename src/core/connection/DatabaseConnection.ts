import { Logger, mongodb } from "../../../deps.ts";
import DatabaseConfiguration from "./DatabaseConfiguration.ts";

export default class DatabaseConnection {
  static #logger = Logger.createLogger({
    label: `ODM :: ${DatabaseConnection.name}`,
  });
  #conn: mongodb.MongoClient;
  #uri: string;

  constructor(conn: mongodb.MongoClient, uri: string) {
    this.#conn = conn;
    this.#uri = uri;
  }

  static async connect(
    dbConfig: DatabaseConfiguration,
  ): Promise<DatabaseConnection> {
    return await this.connectByUri(dbConfig.getUri());
  }

  static async connectByUri(uri: string) {
    try {
      const conn = await this.#createConnectionByUri(uri);
      DatabaseConnection.#logger.info("mongo db connection open");
      return new DatabaseConnection(conn, uri);
    } catch (err: any) {
      DatabaseConnection.#logger.error(err.message + "");
      throw err;
    }
  }

  static async dropDatabase(dbConfig: DatabaseConfiguration): Promise<void> {
    const c = await DatabaseConnection.connect(dbConfig);
    try {
      await c.dropDatabase();
      await c.closeConnection();
    } catch (err) {
      await c.closeConnection();
      throw err;
    }
  }

  static #createConnectionByUri = async (
    uri: string,
  ): Promise<mongodb.MongoClient> => {
    //@ts-ignore
    const client = new mongodb.MongoClient(uri);
    //@ts-ignore
    await client.connect();
    return client;
  };

  async dropDatabase(): Promise<boolean> {
    return this.getDBO().dropDatabase();
  }

  getDBO(): mongodb.Db {
    return this.#conn.db(this.getDatabaseName());
  }

  getDatabaseName(): string {
    return new URL(this.#uri).pathname.substring(1);
  }

  async databaseExists(): Promise<boolean> {
    // Use the admin database for the operation
    const adminDb = this.#conn.db("test").admin();

    // List all the available databases
    const dbs = await adminDb.command({ listDatabases: 1 });
    const index = dbs.databases.findIndex(
      (db: any) => db.name === this.getDatabaseName(),
    );
    if (index !== -1) {
      DatabaseConnection.#logger.info(
        `database "${this.getDatabaseName()}" exists`,
      );
      return true;
    } else {
      DatabaseConnection.#logger.info(
        `database "${this.getDatabaseName()}" don't exists`,
      );
      return false;
    }
  }

  async deleteAllIndexes() {
    const dbo = this.getDBO();
    const collections = await dbo.listCollections().toArray();
    collections.forEach((col) => {
      dbo.command({ dropIndexes: col.name, index: "*" });
    });
  }

  closeConnection(): Promise<void> {
    return this.#conn.close();
  }
}
