import { assert, assertRejects, describe, it } from "../../../test_deps.ts";
import DatabaseConnectionPool from "../../../src/core/connection/DatabaseConnectionPool.ts";
import type { TDatabaseConfiguration } from "../../../mod.ts";
import { defaultConfig } from "../../test.utils.ts";

describe({
  name: "DatabaseConnection",
  fn() {
    it("should establish a connection", async () => {
      const connectionPool = new DatabaseConnectionPool({
        ...defaultConfig,
        database: "postgres",
      });
      await connectionPool.testConnection();
      connectionPool.end();
    });

    it("should reject the connection request", async () => {
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

    it("should create new database", async () => {
      try {
        const connectionPool = await DatabaseConnectionPool
          .createConnectionPoll(defaultConfig);
        await connectionPool.createDatabase("odm-created-database");
        connectionPool.end();
      } catch (error) {
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

      conn1.end();
      conn2.end();
      conn3.end();
      conn4.end();
      conn5.end();
    });

    it("#dropDatabase", async () => {
      try {
        const dbConnection = await DatabaseConnectionPool.createConnectionPoll({
          ...defaultConfig,
          database: "",
        });
        await dbConnection.dropDatabase("odm-created-database");
        dbConnection.end();
      } catch (error) {
        assert(false, "Database dropping failed");
      }
    });

    it("#end pool connections", async () => {
      const dbConnection = await DatabaseConnectionPool.createConnectionPoll(
        {
          ...defaultConfig,
          database: "postgres",
        },
      );
      try {
        dbConnection.end();
      } catch (error) {
        assert(false, "ending pool connections failed");
      }
    });
  },
});
