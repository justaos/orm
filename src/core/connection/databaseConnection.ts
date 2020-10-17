import { Db, MongoClient } from 'mongodb';
import DatabaseConfiguration from './databaseConfiguration';
import { getLoggerInstance } from '../../utils';

export default class DatabaseConnection {
  #conn: MongoClient;
  #collections: Map<string, any>;
  #config: DatabaseConfiguration;

  constructor(conn: MongoClient, config: DatabaseConfiguration) {
    this.#conn = conn;
    this.#collections = new Map<string, any>();
    this.#config = config;
  }

  static async connect(dbConfig: DatabaseConfiguration): Promise<any> {
    try {
      const conn = await _createConnectionByUri(dbConfig.getUri());
      logger.info('mongo db connection open');
      return new DatabaseConnection(conn, dbConfig);
    } catch (err) {
      logger.error(err.message + '');
      throw err;
    }
  }

  static async dropDatabase(dbConfig: DatabaseConfiguration): Promise<any> {
    const c = await DatabaseConnection.connect(dbConfig);
    try {
      await c.dropDatabase();
      await c.closeConnection();
    } catch (err) {
      await c.closeConnection();
      throw err;
    }
  }

  async dropDatabase(): Promise<any> {
    await this.getDBO().dropDatabase();
  }

  getDBO(): Db {
    return this.#conn.db(this.getDatabaseName());
  }

  getDatabaseName(): string {
    return this.#config.getDatabaseName();
  }

  async databaseExists() {
    // Use the admin database for the operation
    const adminDb = this.#conn.db('test').admin();

    // List all the available databases
    const dbs = await adminDb.listDatabases();

    const index = dbs.databases.findIndex(
      (db: any) => db.name === this.getDatabaseName(),
    );
    if (index !== -1) {
      logger.info(`database "${this.getDatabaseName()}" exists`);
      return;
    } else {
      const err = new Error(
        `database "${this.getDatabaseName()}" don't exists`,
      );
      logger.error(err.message + '');
      throw err;
    }
  }

  async deleteAllIndexes() {
    const dbo = this.getDBO();
    const collections = await dbo.listCollections().toArray();
    collections.forEach(function (col: any) {
      dbo.command({ dropIndexes: col.name, index: '*' });
    });
  }

  closeConnection() {
    return this.#conn.close();
  }
}

async function _createConnectionByUri(uri: string): Promise<MongoClient> {
  const client = new MongoClient(uri);
  await client.connect();
  return client;
}

const logger = getLoggerInstance(DatabaseConnection.name);
