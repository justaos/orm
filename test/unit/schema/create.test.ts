import {
  afterAll,
  assert,
  assertEquals,
  beforeAll,
  describe,
  it
} from "../../test.deps.ts";

import { Session } from "../../test.utils.ts";
import { ORMConnection, ORMError, ORM } from "../../../mod.ts";

describe(
  "TableCreate",
  {
    sanitizeResources: false,
    sanitizeOps: false
  },
  () => {
    let conn: ORMConnection;
    let odm: ORM;
    const logger = Session.getLogger();
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
      await conn.closeConnection();
    });

    it("#table - negative check", function () {
      try {
        conn.table("unknown_table");
        assert(false, "Table should not exists");
      } catch (error) {
        assert(
          error instanceof ORMError && error.code === "SCHEMA_VALIDATION_ERROR",
          "Table should not exists"
        );
      }
    });

    it("#defineTable - simple", async () => {
      try {
        await conn.defineTable({
          name: "person",
          columns: [
            {
              name: "name",
              type: "string"
            },
            {
              name: "dob",
              type: "date"
            },
            {
              name: "gender",
              type: "boolean"
            }
          ]
        });
        cleanTableList.push("person");
      } catch (_error) {
        assert(false, "Table has not been created");
      }
      assertEquals(odm.isTableDefined("person"), true, "Table should exists");
    });

    it("#defineTable - alter", async () => {
      try {
        conn.deregisterTable("person");
        await conn.defineTable({
          name: "person",
          columns: [
            {
              name: "name",
              type: "string"
            },
            {
              name: "dob",
              type: "date"
            },
            {
              name: "gender",
              type: "boolean"
            },
            {
              name: "color",
              type: "string"
            }
          ]
        });
      } catch (_error) {
        assert(false, "Table has not been created");
      }
      assertEquals(odm.isTableDefined("person"), true, "Table should exists");
    });

    it("#ORM::defineTable - unknown field type", async () => {
      try {
        await conn.defineTable({
          name: "unknown",
          columns: [
            {
              name: "unknown",
              type: "unknown"
            }
          ]
        });
      } catch (_e) {
        assert(true, "Table not create as expected");
      }
    });

    it("#defineTable - extends negative check", async () => {
      let assertValue = false;
      try {
        await conn.defineTable({
          schema: "company",
          name: "employee",
          inherits: "person",
          final: true,
          columns: [
            {
              name: "name",
              type: "integer"
            },
            {
              name: "employee_id",
              type: "integer"
            }
          ]
        });
      } catch (_error) {
        assertValue = true;
      }
      assert(
        assertValue,
        "Table should not get extended, with duplicate field names"
      );
    });

    it("#defineTable - extends positive check", async () => {
      await conn.defineTable({
        schema: "company",
        name: "employee",
        inherits: "person",
        final: true,
        columns: [
          {
            name: "employee_id",
            type: "integer"
          }
        ]
      });
      assert(true, "Table should get extended");
    });

    it("#defineTable - extends final negative check", async () => {
      let assertValue = false;
      try {
        await conn.defineTable({
          name: "EXTEND_FINAL",
          inherits: "company.employee",
          columns: [
            {
              name: "address",
              type: "string"
            }
          ]
        });
      } catch (_error) {
        assertValue = true;
      }
      assert(assertValue, "Table should not extend, final schema");
    });

    it("#table - normal schema record", async () => {
      let assertValue = false;
      try {
        const personTable = conn.table("person");
        const personRecord = personTable.createNewRecord();
        await personRecord.insert();
        assertValue = true;
      } catch (error) {
        logger.error(error.message);
      }
      assert(assertValue);
    });

    it("#table - extends schema record", async () => {
      let assertValue = false;
      try {
        const employeeTable = conn.table("company.employee");
        const employeeRecord = employeeTable.createNewRecord();
        await employeeRecord.insert();
        assertValue = true;
      } catch (error) {
        logger.error(error.message);
      }
      assert(assertValue);
    });
  }
);
