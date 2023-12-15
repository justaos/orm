import {
  afterAll,
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

    beforeAll(async () => {
      conn = await Session.getConnection();
      odm = Session.getODM();
    });

    afterAll(async () => {
      const conn = await Session.getConnection();
      for (const table of cleanTableList) {
        await conn.dropTable(table);
      }
      await (await Session.getConnection()).closeConnection();
    });

    it("#ODM::addInterceptor", async () => {
      const INTERCEPT_TEST_MODAL = "intercept_test";
      odm.addInterceptor(
        new (class extends DatabaseOperationInterceptor {
          getName() {
            return "my-intercept";
          }

          async intercept(
            tableName: string,
            operation: DatabaseOperationType,
            when: DatabaseOperationWhen,
            records: Record[]
          ) {
            if (tableName === INTERCEPT_TEST_MODAL) {
              if (operation === "INSERT") {
                logger.info(
                  `[collectionName=${tableName}] [operation=${operation}] [when=${when}]`
                );
                if (when === "BEFORE") {
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
        name: INTERCEPT_TEST_MODAL,
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
      cleanTableList.push(INTERCEPT_TEST_MODAL);

      const interceptTestCollection = conn.table(INTERCEPT_TEST_MODAL);
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
  }
});
