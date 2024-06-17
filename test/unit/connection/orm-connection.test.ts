import { assert, describe, it } from "../../../test_deps.ts";
import { ORM, type TDatabaseConfiguration } from "../../../mod.ts";

const defaultConfig: TDatabaseConfiguration = {
  hostname: "127.0.0.1",
  port: 5432,
  username: "postgres",
  password: "postgres",
  database: "orm-test",
};

describe({
  name: "ORMConnection",
  fn: () => {
    it("#connect(): success case", async () => {
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
  },
});
