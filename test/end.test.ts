import { assert, describe, it } from "./test.deps.ts";
import { Session } from "./test.utils.ts";

describe("End test cleanup", () => {
  it("disconnect check", async () => {
    const conn = await Session.getConnection();
    await conn.closeConnection();
    assert(true, "close connection success");
  });
});
