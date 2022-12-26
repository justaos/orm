import { afterAll, assert, beforeAll, describe, it } from "./test.deps.ts";
import { Session } from "./test.utils.ts";

describe("End test cleanup", () => {
  it("disconnect check", async () => {
    if (Session.hasODM()) {
      Session.getODM().closeConnection();
    }
    assert(true, "close connection success");
  });
});
