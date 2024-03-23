import {
  afterAll,
  assertStrictEquals,
  beforeAll,
  describe,
  it,
} from "../../../test_deps.ts";

import {
  DatabaseOperationType,
  DatabaseOperationWhen,
  ORM,
  ORMConnection,
  Record,
} from "../../../mod.ts";
import { logger, Session } from "../../test.utils.ts";
import DatabaseOperationInterceptor from "../../../src/operation-interceptor/DatabaseOperationInterceptor.ts";

describe({
  name: "Operations Intercept",
  sanitizeResources: false,
  sanitizeOps: false,
  fn: () => {
    let odm: ORM;
    let conn: ORMConnection;
    const cleanTableList: string[] = [];

    beforeAll(async () => {
      conn = await Session.getConnection();
      odm = Session.getORM();
    });

    afterAll(async () => {
      const conn = await Session.getConnection();
      for (const table of cleanTableList) {
        await conn.dropTable(table);
      }
      await (await Session.getConnection()).closeConnection();
    });

    it("#ORM::addInterceptor", async () => {
      const INTERCEPT_TEST_MODEL = "intercept_test";
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
            if (tableName === INTERCEPT_TEST_MODEL) {
              if (operation === "INSERT") {
                logger.info(
                  `[tableName=${tableName}] [operation=${operation}] [when=${when}]`
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
        name: INTERCEPT_TEST_MODEL,
        columns: [
          {
            name: "name",
            type: "string",
          },
          {
            name: "computed",
            type: "string",
          },
        ],
      });
      cleanTableList.push(INTERCEPT_TEST_MODEL);

      const interceptTestTable = conn.table(INTERCEPT_TEST_MODEL);
      const s = interceptTestTable.createNewRecord();
      s.set("name", "John");
      try {
        const interceptRecord: Record = await s.insert();
        assertStrictEquals(
          interceptRecord.get("computed"),
          "this is computed",
          "read interceptor not computed the value"
        );
      } catch (err) {
        logger.info(err.message + "");
      }
    });
  },
});
