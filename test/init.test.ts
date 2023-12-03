import { assert, describe, it } from "./test.deps.ts";
import { ODM } from "../mod.ts";
import { Session } from "./test.utils.ts";

describe({
  name: "Initial test setup",
  sanitizeResources: false,
  sanitizeOps: false,
  fn: () => {
    it("#connect()", async () => {
      Session.setODM(
        new ODM({
          hostname: "127.0.0.1",
          port: 5432,
          username: "postgres",
          password: "admin",
          database: "odm-test-db"
        })
      );

      try {
        await Session.getConnection();
        assert(true, "connection established");
      } catch (_error) {
        assert(false, "connection failed");
      }
    });

    it("#clear existing database", async () => {
      const conn = await Session.getConnection();

      /* const exists = await odm.databaseExists();

      if (exists) {
        const result = await odm.dropDatabase();
        if (result) {
          assert(true, "dropped successfully");
        } else {
          assert(false, "dropping failed");
        }
      }*/
      await conn.closeConnection();
    });
  }
});
