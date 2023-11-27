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
            }
          ]
        });
        assert(conn.isTableDefined(MODEL_NAME), "Table creation failed");
      } catch (err) {
        console.log(err);
        assert(false, "Table creation failed");
      }
    });

    it("#table - negative check", function () {
      try {
        conn.table("unknown_table");
        assert(false, "Table should not exists");
      } catch (e) {
        assert(true, "Table should not exists");
      }
    });

    /*it("#ODM::defineTable - simple", function () {
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
      assert(true, "Table not create as expected");
    });
    */

    it("#ODM::defineTable - extends negative check", function () {
      let assertValue = false;
      try {
        conn.defineTable({
          schema: "testing_schema",
          name: MODEL_EXTENDS,
          inherits: "testing_schema." + MODEL_NAME,
          final: true,
          columns: [
            {
              name: "testing",
              type: "string"
            }
          ]
        });
      } catch (err) {
        assertValue = true;
      }
      assert(assertValue, "Table should not get extended, with name fields");
    });

    /* it("#ODM::defineTable - extends positive check", function() {
       conn.defineTable({
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
       assert(true, "Table should get extended");
     });

     it("#ODM::defineTable - extends positive check", function() {
       let assertValue = false;
       try {
         conn.defineTable({
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
       assert(assertValue, "Table should not extend, final schema");
     });

     it("#ODM::table - normal schema record", async () => {
       let assertValue = false;
       try {
         const extendsCol = conn.table(MODEL_NAME);
         const extendsRec = extendsCol.createNewRecord();
         await extendsRec.insert();
         assertValue = true;
       } catch (err) {
         logger.error(err.message);
       }
       assert(assertValue);
     });

     it("#ODM::table - extends schema record", async () => {
       let assertValue = false;
       try {
         const extendsCol = conn.table(MODEL_EXTENDS);
         const extendsRec = extendsCol.createNewRecord();
         await extendsRec.insert();
         assertValue = true;
       } catch (err) {
         logger.error(err.message);
       }
       assert(assertValue);
     });

     it("#Table::find extends", async () => {
       const employeeTable = conn.table(MODEL_EXTENDS);
       const employees: Record[] = await employeeTable
         .find()
         .toArray();
       assertEquals(employees.length, 1);
     });

     it("#Table::find normal", async () => {
       const employeeTable = conn.table(MODEL_NAME);
       const employees: Record[] = await employeeTable
         .find()
         .toArray();
       assertEquals(employees.length, 2);
     });

     it("#ODM::convertToObjectId", function() {
       const newId = conn.generateObjectId("569ed8269353e9f4c51617aa");
       assert(
         conn.isObjectId(newId),
         "Table should not extend, final schema"
       );
     });

     it("#ODM::defineTable - unknown field type", function() {
       try {
         conn.defineTable({
           name: "unknown",
           fields: [
             {
               name: "unknown",
               type: "unknown"
             }
           ]
         });
       } catch (e) {
         assert(true, "Table not create as expected");
       }
     });
   */
  }
);
