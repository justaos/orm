import { assert, describe, it } from "../test_deps.ts";
import { Session } from "./test.utils.ts";

describe("End test cleanup", () => {
  it("disconnect check", async () => {
    const conn = await Session.getConnection();
    try {
      await conn.dropDatabase();
    } catch (error) {
      assert(false, "Database does not exist");
    }
  });
});
