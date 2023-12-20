import { assert, describe, it } from "../../test.deps.ts";
import DatabaseConnection from "../../../src/core/connection/DatabaseConnection.ts";
import { DatabaseConfiguration } from "../../../src/core/connection/index.ts";

const defaultConfig: DatabaseConfiguration = {
  hostname: "127.0.0.1",
  port: 5432,
  username: "postgres",
  password: "admin"
};

describe({
  name: "DatabaseConnection",
  sanitizeResources: false,
  sanitizeOps: false,
  fn: () => {
    it("#connect", async () => {
      const conn = new DatabaseConnection({
        ...defaultConfig,
        port: undefined
      });
      await conn.connect();
      if (conn) {
        await conn.closeConnection();
      } else {
        assert(false, "connection failed");
      }
    });

    it("#connect wrong config", async () => {
      const config: DatabaseConfiguration = {
        ...defaultConfig,
        port: 80
      };
      try {
        await DatabaseConnection.connect({
          ...config,
          connect_timeout: 500
        });
        assert(false, "Connection should fail");
      } catch (_error) {
        // Connection failed as expected
      }
    });

    /* it("#getDBO - create record", async () => {
       const conn = await DatabaseConnection.connect(defaultConfig);
       const res = await conn
         .getDBO()
         .collection("test")
         .insertOne({ name: "hello" });
       assert(!!res, "insertedCount should be 1");
       conn.closeConnection();
     });*/

    it("#isDatabaseExist - without database", async () => {
      const conn = await DatabaseConnection.connect(defaultConfig);
      const output = await conn.isDatabaseExist("some-random-database");
      assert(!output, "Database should not exists");
      await conn.closeConnection();
    });

    it("#createDatabase", async () => {
      try {
        const conn = await DatabaseConnection.connect(defaultConfig);
        await conn.createDatabase("odm-created-database");
        await conn.closeConnection();
      } catch (error) {
        console.log(error);
        assert(false, "Database dropping failed");
      }
    });

    it("#isDatabaseExist - with database", async () => {
      const conn = await DatabaseConnection.connect(defaultConfig);
      assert(
        await conn.isDatabaseExist("odm-created-database"),
        "Database should exists"
      );
      await conn.closeConnection();
    });

    it("#multi database connections", async () => {
      const config = {
        ...defaultConfig,
        database: "odm-created-database"
      }
      const conn1 = await DatabaseConnection.connect(config);
      const conn2 = await DatabaseConnection.connect(config);
      const conn3 = await DatabaseConnection.connect(config);
      const conn4 = await DatabaseConnection.connect(config);
      const conn5 = await DatabaseConnection.connect(config);

      await conn1.closeConnection();
      await conn2.closeConnection();
      await conn3.closeConnection();
      await conn4.closeConnection();
      await conn5.closeConnection();
    });

    it("#dropDatabase", async () => {
      try {
        const dbConnection = await DatabaseConnection.connect({
          ...defaultConfig,
          database: ""
        });
        await dbConnection.dropDatabase("odm-created-database");
      } catch (error) {
        console.log(error);
        assert(false, "Database dropping failed");
      }
    });

    it("#closeConnection", async () => {
      const dbConnection = await DatabaseConnection.connect(defaultConfig);
      try {
        await dbConnection.closeConnection();
      } catch (error) {
        console.log(error);
        assert(false, "close connection failed");
      }
    });
  }
});
