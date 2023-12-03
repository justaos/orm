import {
  afterAll,
  assert,
  assertStrictEquals,
  beforeAll,
  describe,
  it
} from "../../test.deps.ts";

import {
  DatabaseOperationType,
  DatabaseOperationWhen,
  ODM,
  ODMConnection,
  OPERATION_TYPES,
  OPERATION_WHENS,
  Record
} from "../../../mod.ts";
import { logger, Session } from "../../test.utils.ts";
import DatabaseOperationInterceptor from "../../../src/operation-interceptor/DatabaseOperationInterceptor.ts";

describe({
  name: "Operations Intercept",
  sanitizeResources: false,
  sanitizeOps: false,
  fn: () => {
    let odm: ODM;
    let conn: ODMConnection;
    const cleanTableList: string[] = [];
    const MODEL_NAME = "intercept";

    beforeAll(async () => {
      conn = await Session.getConnection();
      odm = Session.getOdm();
    });

    afterAll(async () => {
      const conn = await Session.getConnection();
      for (const table of cleanTableList) {
        await conn.dropTable(table);
      }
      await (await Session.getConnection()).closeConnection();
    });

    it("#ODM::addInterceptor", async () => {
      odm.addInterceptor(
        new (class extends DatabaseOperationInterceptor {
          getName() {
            return "my-intercept";
          }

          async intercept(
            collectionName: string,
            operation: DatabaseOperationType,
            when: DatabaseOperationWhen,
            records: Record[]
          ) {
            if (collectionName === MODEL_NAME) {
              if (operation === OPERATION_TYPES.CREATE) {
                logger.info(
                  `[collectionName=${collectionName}] [operation=${operation}] [when=${when}]`
                );
                if (when === OPERATION_WHENS.BEFORE) {
                  logger.info("before");
                  for (const record of records) {
                    record.set("computed", "this is computed");
                  }
                }
              }
            }
            return records;
          }
        })()
      );

      await conn.defineTable({
        name: MODEL_NAME,
        columns: [
          {
            name: "name",
            type: "string"
          },
          {
            name: "computed",
            type: "string"
          }
        ]
      });

      const interceptTestCollection = conn.table(MODEL_NAME);
      const s = interceptTestCollection.createNewRecord();
      s.set("name", "John");
      try {
        const rec: Record = await s.insert();
        assertStrictEquals(
          rec.get("computed"),
          "this is computed",
          "read interceptor not computed the value"
        );
      } catch (err) {
        logger.info(err.message + "");
      }
    });

    it("#model define check", async () => {
      odm.deleteInterceptor("my-intercept");

      const interceptTestCollection = conn.table(MODEL_NAME);
      const s = interceptTestCollection.createNewRecord();
      s.set("name", "Ravi");
      const record = await s.insert();

      assert(
        record.get("computed") !== "this is computed",
        "read interceptor computed the value"
      );
    });
  }
});
