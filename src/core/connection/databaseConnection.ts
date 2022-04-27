import * as mongodb from 'mongodb';
import DatabaseConfiguration from './databaseConfiguration';
import { Logger } from '@justaos/utils';

export default class DatabaseConnection {
  #conn: mongodb.MongoClient;
  #config: DatabaseConfiguration;

  static #logger = Logger.createLogger({
    label: `ODM :: ${DatabaseConnection.name}`
  });

  constructor(conn: mongodb.MongoClient, config: DatabaseConfiguration) {
    this.#conn = conn;
    this.#config = config;
  }

  static async connect(
    dbConfig: DatabaseConfiguration
  ): Promise<DatabaseConnection> {
    try {
      const conn = await this.#createConnectionByUri(dbConfig.getUri());
      DatabaseConnection.#logger.info('mongo db connection open');
      return new DatabaseConnection(conn, dbConfig);
    } catch (err: any) {
      DatabaseConnection.#logger.error(err.message + '');
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

  async dropDatabase(): Promise<boolean> {
    return this.getDBO().dropDatabase();
  }

  getDBO(): mongodb.Db {
    return this.#conn.db(this.getDatabaseName());
  }

  getDatabaseName(): string {
    return this.#config.getDatabaseName();
  }

  async databaseExists(): Promise<boolean> {
    // Use the admin database for the operation
    const adminDb = this.#conn.db('test').admin();

    // List all the available databases
    const dbs = await adminDb.command({ listDatabases: 1 });
    const index = dbs.databases.findIndex(
      (db: any) => db.name === this.getDatabaseName()
    );
    if (index !== -1) {
      DatabaseConnection.#logger.info(
        `database "${this.getDatabaseName()}" exists`
      );
      return true;
    } else {
      DatabaseConnection.#logger.info(
        `database "${this.getDatabaseName()}" don't exists`
      );
      return false;
    }
  }

  async deleteAllIndexes() {
    const dbo = this.getDBO();
    const collections = await dbo.listCollections().toArray();
    collections.forEach((col) => {
      dbo.command({ dropIndexes: col.name, index: '*' });
    });
  }

  closeConnection(): Promise<void> {
    return this.#conn.close();
  }

  static #createConnectionByUri = async (
    uri: string
  ): Promise<mongodb.MongoClient> => {
    const client = new mongodb.MongoClient(uri);
    await client.connect();
    return client;
  };
}
