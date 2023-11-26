import { afterAll, assert, beforeAll, describe, it } from "../../test.deps.ts";

import { Session } from "../../test.utils.ts";
import ODMConnection from "../../../src/ODMConnection.ts";

describe(
  "Schema",
  {
    sanitizeResources: false,
    sanitizeOps: false
  },
  () => {
    let conn: ODMConnection;

    let MODEL_NAME = "testing_table";
    let MODEL_EXTENDS = "schema_test_extends";

    beforeAll(async () => {
      conn = await Session.getConnection();
    });

    afterAll(async () => {
      await (await Session.getConnection()).closeConnection();
    });

    it("#ODM::defineTable - simple", async () => {
      try {
        await conn.defineTable({
          schema: "testing_schema",
          name: MODEL_NAME,
          columns: [
            {
              name: "name",
              type: "string"
            },
            {
              name: "new",
              type: "string"
            }
          ]
        });
        assert(conn.isTableDefined(MODEL_NAME), "Table creation failed");
      } catch (err) {
        console.log(err);
        assert(false, "Table creation failed");
      }
    });

    /* it("#collection - negative check", function () {
       try {
         conn.collection("unknown_collection");
         assert(false, "Collection should not exists");
       } catch (e) {
         assert(true, "Collection should not exists");
       }
     });*/

    /*it("#ODM::defineCollection - simple", function () {
      conn.defineTable({
        name: MODEL_NAME,
        columns: [
          {
            name: "name",
            type: "string",
          },
          {
            name: "eid",
            type: "integer",
          },
          {
            name: "dob",
            type: "date",
          },
          {
            name: "gender",
            type: "boolean",
          },
        ],
      });
      assert(true, "Collection not create as expected");
    });

    it("#ODM::defineCollection - extends negative check", function() {
      let assertValue = false;
      try {
        conn.defineCollection({
          name: MODEL_EXTENDS,
          extends: MODEL_NAME,
          final: true,
          fields: [
            {
              name: "name",
              type: "string"
            }
          ]
        });
      } catch (err) {
        assertValue = true;
      }
      assert(
        assertValue,
        "Collection should not get extended, with name fields"
      );
    });

    it("#ODM::defineCollection - extends positive check", function() {
      conn.defineCollection({
        name: MODEL_EXTENDS,
        extends: MODEL_NAME,
        final: true,
        fields: [
          {
            name: "address",
            type: "string"
          }
        ]
      });
      assert(true, "Collection should get extended");
    });

    it("#ODM::defineCollection - extends positive check", function() {
      let assertValue = false;
      try {
        conn.defineCollection({
          name: "EXTEND_FINAL",
          extends: MODEL_EXTENDS,
          fields: [
            {
              name: "address",
              type: "string"
            }
          ]
        });
      } catch (err) {
        assertValue = true;
      }
      assert(assertValue, "Collection should not extend, final schema");
    });

    it("#ODM::collection - normal schema record", async () => {
      let assertValue = false;
      try {
        const extendsCol = conn.collection(MODEL_NAME);
        const extendsRec = extendsCol.createNewRecord();
        await extendsRec.insert();
        assertValue = true;
      } catch (err) {
        logger.error(err.message);
      }
      assert(assertValue);
    });

    it("#ODM::collection - extends schema record", async () => {
      let assertValue = false;
      try {
        const extendsCol = conn.collection(MODEL_EXTENDS);
        const extendsRec = extendsCol.createNewRecord();
        await extendsRec.insert();
        assertValue = true;
      } catch (err) {
        logger.error(err.message);
      }
      assert(assertValue);
    });

    it("#Collection::find extends", async () => {
      const employeeCollection = conn.collection(MODEL_EXTENDS);
      const employees: Record[] = await employeeCollection
        .find()
        .toArray();
      assertEquals(employees.length, 1);
    });

    it("#Collection::find normal", async () => {
      const employeeCollection = conn.collection(MODEL_NAME);
      const employees: Record[] = await employeeCollection
        .find()
        .toArray();
      assertEquals(employees.length, 2);
    });

    it("#ODM::convertToObjectId", function() {
      const newId = conn.generateObjectId("569ed8269353e9f4c51617aa");
      assert(
        conn.isObjectId(newId),
        "Collection should not extend, final schema"
      );
    });

    it("#ODM::defineCollection - unknown field type", function() {
      try {
        conn.defineCollection({
          name: "unknown",
          fields: [
            {
              name: "unknown",
              type: "unknown"
            }
          ]
        });
      } catch (e) {
        assert(true, "Collection not create as expected");
      }
    });
  */
  }
);
