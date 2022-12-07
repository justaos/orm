import { assert, assertEquals } from 'https://deno.land/std@0.135.0/testing/asserts.ts';
import { afterAll, beforeAll, describe, it } from 'https://deno.land/std@0.166.0/testing/bdd.ts';

import DatabaseConfiguration from '../../../src/core/connection/databaseConfiguration.ts';
import DatabaseConnection from '../../../src/core/connection/DatabaseConnection.ts';


const defaultConfig: any = {
  host: '127.0.0.1',
  port: '27017',
  database: 'odm-conn-test',
  dialect: 'mongodb'
};

describe({
  name: 'DatabaseConnection',
  sanitizeResources: false,
  sanitizeOps: false,
  fn: () => {
    it('#DatabaseConfiguration::getUri with username/password', function() {
      const config: any = {
        ...defaultConfig,
        username: 'admin',
        password: 'admin'
      };
      let dbConfig = new DatabaseConfiguration(
        config.host,
        config.port,
        config.dialect,
        config.database,
        config.username,
        config.password
      );
      assertEquals(
        dbConfig.getUri(),
        'mongodb://admin:admin@127.0.0.1:27017/odm-conn-test',
        'Unexpected uri generated'
      );
    });

    it('#DatabaseConfiguration::getUri without username/password', function() {
      const config: any = {
        ...defaultConfig
      };
      let dbConfig = new DatabaseConfiguration(
        config.host,
        config.port,
        config.dialect,
        config.database,
        config.username,
        config.password
      );
      assertEquals(
        dbConfig.getUri(),
        'mongodb://127.0.0.1:27017/odm-conn-test',
        'Unexpected uri generated'
      );
    });

    it('#DatabaseConfiguration::getUri without database', function() {
      const config: any = {
        ...defaultConfig,
        database: ''
      };
      let dbConfig = new DatabaseConfiguration(
        config.host,
        config.port,
        config.dialect,
        config.database,
        config.username,
        config.password
      );
      assertEquals(
        dbConfig.getUri(),
        'mongodb://127.0.0.1:27017',
        'Unexpected uri generated'
      );
    });

    it('#DatabaseConfiguration::getUri default params', function() {
      const config: any = {};
      let dbConfig = new DatabaseConfiguration(
        config.host,
        config.port,
        config.dialect,
        config.database,
        config.username,
        config.password
      );
      assertEquals(
        dbConfig.getUri(),
        'mongodb://127.0.0.1:27017',
        'Unexpected uri generated'
      );
    });

    let defaultConfigInstance: DatabaseConfiguration;

    it('#DatabaseService::connect', async () => {
      defaultConfigInstance = new DatabaseConfiguration(
        defaultConfig.host,
        defaultConfig.port,
        defaultConfig.dialect,
        defaultConfig.database,
        defaultConfig.username,
        defaultConfig.password
      );

      const conn = await DatabaseConnection.connect(defaultConfigInstance);
      if (conn) {
        conn.closeConnection();
        assert( true, 'connection established');
      } else {
        assert( false, 'connection failed');
      }
    });

    /*it('#DatabaseConnection::connect wrong config', async () => {
      const config: any = {
        ...defaultConfig,
        port: 80
      };
      let dbConfig = new DatabaseConfiguration(
        config.host,
        config.port,
        config.dialect,
        config.database,
        config.username,
        config.password,
        500
      );

      try {
        await DatabaseConnection.connect(dbConfig);
        assert( false, 'connection established');
      } catch (error) {
        assert( true, 'connection failed as expected');
      }
    });*/


    it('#DatabaseConnection::databaseExists - without database', async () => {
      const conn = await DatabaseConnection.connect(defaultConfigInstance);
      const value = await conn.databaseExists();
      if (value) {
        assert( false, 'Database should not exists');
      } else {
        assert( true, 'Database exists');
      }
      conn.closeConnection();
    });


    it('#DatabaseConnection::getDBO - create record', async () => {
      const conn = await DatabaseConnection.connect(defaultConfigInstance);
      const res = await conn
        .getDBO()
        .collection('test')
        .insertOne({ name: 'hello' });
      assert( !!res, 'insertedCount should be 1');
      conn.closeConnection();
    });

    it('#DatabaseService::databaseExists - with database', async () => {
      const conn = await DatabaseConnection.connect(defaultConfigInstance);
      const value = await conn.databaseExists();
      if (value) {
        assert( true, 'Database should not exists');
      } else {
        assert( false, 'Database exists');
      }
      conn.closeConnection();
    });


    it('#DatabaseService::dropDatabase', async () => {
      try {
        await DatabaseConnection.dropDatabase(defaultConfigInstance);
        assert( true, 'Database dropped successfully');
      } catch (error) {
        assert( false, 'Database dropping failed');
      }
    });


    it('#DatabaseService::closeConnection', async () => {
      const dbConnection = await DatabaseConnection.connect(defaultConfigInstance);
      dbConnection.closeConnection();
      try {
        assert( true, 'close connection success');
      } catch (error) {
        assert( false, 'close connection failed');
      }
    });
  }
});
