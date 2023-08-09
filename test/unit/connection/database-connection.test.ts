import { assert, assertEquals, describe, it } from "../../test.deps.ts";

import { DatabaseConfiguration } from "../../../src/core/connection/DatabaseConfiguration.ts";
import DatabaseConnection from "../../../src/core/connection/DatabaseConnection.ts";

const defaultConfig: any = {
  host: "127.0.0.1",
  port: 27017,
  database: "odm-conn-test",
  dialect: "mongodb"
};

describe({
  name: "DatabaseConnection",
  sanitizeResources: false,
  sanitizeOps: false,
  fn: () => {
    it("#DatabaseConfiguration::getUri with username/password", function () {
      const config: any = {
        ...defaultConfig,
        username: "admin",
        password: "admin",
      };
      assertEquals(
        new DatabaseConfiguration(config).getUri(),
        "mongodb://admin:admin@127.0.0.1:27017/odm-conn-test",
        "Unexpected uri generated",
      );
    });

    it("#DatabaseConfiguration::getUri without username/password", function () {
      const config: any = {
        ...defaultConfig,
      };
      console.log(new DatabaseConfiguration(config).getUri())
      assertEquals(
        new DatabaseConfiguration(config).getUri(),
        "mongodb://127.0.0.1:27017/odm-conn-test",
        "Unexpected uri generated",
      );
    });

    it("#DatabaseConfiguration::getUri without database", function () {
      const config: any = {
        ...defaultConfig,
        database: "",
      };
      assertEquals(
        new DatabaseConfiguration(config).getUri(),
        "mongodb://127.0.0.1:27017",
        "Unexpected uri generated",
      );
    });

    it("#DatabaseConfiguration::getUri default params", function () {
      const config: any = {};
      assertEquals(
        new DatabaseConfiguration(config).getUri(),
        "mongodb://127.0.0.1:27017",
        "Unexpected uri generated",
      );
    });

    it("#DatabaseService::connect", async () => {

      const conn = await DatabaseConnection.connect({
        ...defaultConfig,
        port: null,
        dialect: "mongodb"
      });
      await conn.connect();
      if (conn) {
        await conn.closeConnection();
        assert(true, "connection established");
      } else {
        assert(false, "connection failed");
      }
    });

    it('#DatabaseConnection::connect wrong config', async () => {
      const config: any = {
        ...defaultConfig,
        port: 80
      };
      try {
        await DatabaseConnection.connect({
          ...config.host,
          connectTimeoutMS: 500
        });
        assert( false, 'connection established');
      } catch (error) {
        assert( true, 'connection failed as expected');
      }
    });

    it("#DatabaseConnection::databaseExists - without database", async () => {
      const conn = await DatabaseConnection.connect(defaultConfig);
      const value = await conn.databaseExists();
      if (value) {
        assert(false, "Database should not exists");
      } else {
        assert(true, "Database exists");
      }
      conn.closeConnection();
    });

    it("#DatabaseConnection::getDBO - create record", async () => {
      const conn = await DatabaseConnection.connect(defaultConfig);
      const res = await conn
        .getDBO()
        .collection("test")
        .insertOne({ name: "hello" });
      assert(!!res, "insertedCount should be 1");
      conn.closeConnection();
    });

    it("#DatabaseService::databaseExists - with database", async () => {
      const conn = await DatabaseConnection.connect(defaultConfig);
      const value = await conn.databaseExists();
      if (value) {
        assert(true, "Database should not exists");
      } else {
        assert(false, "Database exists");
      }
      conn.closeConnection();
    });

    it("#DatabaseService::dropDatabase", async () => {
      try {
        const dbConnection = await DatabaseConnection.connect(
          defaultConfig,
        );
        await dbConnection.dropDatabase();
        assert(true, "Database dropped successfully");
      } catch (error) {
        assert(false, "Database dropping failed");
      }
    });

    it("#DatabaseService::closeConnection", async () => {
      const dbConnection = await DatabaseConnection.connect(
        defaultConfig,
      );
      dbConnection.closeConnection();
      try {
        assert(true, "close connection success");
      } catch (error) {
        assert(false, "close connection failed");
      }
    });
  },
});
