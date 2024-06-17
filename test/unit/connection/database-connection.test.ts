import { assert, assertRejects, describe, it } from "../../../test_deps.ts";
import DatabaseConnectionPool from "../../../src/core/DatabaseConnectionPool.ts";
import type { TDatabaseConfiguration } from "../../../mod.ts";

const defaultConfig: TDatabaseConfiguration = {
  hostname: "127.0.0.1",
  port: 5432,
  username: "postgres",
  password: "postgres",
};

describe({
  name: "DatabaseConnection",
  fn: () => {
    it("#connect(): Success case", async () => {
      const connectionPool = new DatabaseConnectionPool({
        ...defaultConfig,
        port: undefined,
      });
      try {
        await connectionPool.testConnection();
      } catch (_error) {
        assert(false, "Connection failed");
      } finally {
        await connectionPool.end();
      }
    });

    it("#connect(): Invalid configuration", async () => {
      const config: TDatabaseConfiguration = {
        ...defaultConfig,
        port: 80,
      };
      await assertRejects(async () => {
        await DatabaseConnectionPool.createConnectionPoll({
          ...config,
        });
      }, Error);
    });

    it("#createDatabase", async () => {
      try {
        const connectionPool =
          await DatabaseConnectionPool.createConnectionPoll(defaultConfig);
        await connectionPool.createDatabase("odm-created-database");
        await connectionPool.end();
      } catch (error) {
        console.log(error);
        assert(false, "Database dropping failed");
      }
    });

    it("#multi database connection pools", async () => {
      const config = {
        ...defaultConfig,
        database: "odm-created-database",
      };
      const conn1 = await DatabaseConnectionPool.createConnectionPoll(config);
      const conn2 = await DatabaseConnectionPool.createConnectionPoll(config);
      const conn3 = await DatabaseConnectionPool.createConnectionPoll(config);
      const conn4 = await DatabaseConnectionPool.createConnectionPoll(config);
      const conn5 = await DatabaseConnectionPool.createConnectionPoll(config);

      await conn1.end();
      await conn2.end();
      await conn3.end();
      await conn4.end();
      await conn5.end();
    });

    it("#dropDatabase", async () => {
      try {
        const dbConnection = await DatabaseConnectionPool.createConnectionPoll({
          ...defaultConfig,
          database: "",
        });
        await dbConnection.dropDatabase("odm-created-database");
        await dbConnection.end();
      } catch (error) {
        console.log(error);
        assert(false, "Database dropping failed");
      }
    });

    it("#end pool connections", async () => {
      const dbConnection = await DatabaseConnectionPool.createConnectionPoll(
        defaultConfig,
      );
      try {
        await dbConnection.end();
      } catch (error) {
        console.log(error);
        assert(false, "ending pool connections failed");
      }
    });
  },
});
