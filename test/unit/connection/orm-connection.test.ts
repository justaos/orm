import { assert, describe, it } from "../../../test_deps.ts";
import { type DatabaseConfiguration, ORM } from "../../../mod.ts";

const defaultConfig: DatabaseConfiguration = {
  hostname: "127.0.0.1",
  port: 5432,
  username: "postgres",
  password: "postgres",
  database: "orm-test",
};

describe({
  name: "DatabaseConnection",
  fn: () => {
    it("#connect", async () => {
      const orm = new ORM({
        ...defaultConfig,
        port: undefined,
      });
      let conn;
      try {
        conn = await orm.connect(true);
      } catch (_error) {
        assert(false, "connection failed");
      } finally {
        if (conn) await conn.closeConnection();
      }
    });

    it("#isDatabaseExist - without database", async () => {
      const orm = new ORM({
        ...defaultConfig,
        database: "orm-test-2",
      });
      const output = await orm.isDatabaseExist();
      assert(!output, "Database should not exists");
    });

    it("#isDatabaseExist - without database", async () => {
      const orm = new ORM(defaultConfig);
      const connect = await orm.connect();
      const test = await connect.dropDatabase();
      assert(test, "Database exists");
    });
  },
});
