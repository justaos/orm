import {
  afterAll,
  assert,
  assertEquals,
  assertStrictEquals,
  beforeAll,
  describe,
  it
} from "../../test.deps.ts";
import { Temporal } from "npm:@js-temporal/polyfill";

import { ODMConnection, Record } from "../../../mod.ts";
import { Session } from "../../test.utils.ts";

describe({
  name: "Collection",
  sanitizeResources: false,
  sanitizeOps: false,
  fn: () => {
    let conn: ODMConnection;
    const cleanTableList: string[] = [];
    let johnRecord: Record;

    beforeAll(async () => {
      conn = await Session.getConnection();
    });

    afterAll(async () => {
      const conn = await Session.getConnection();
      for (const table of cleanTableList) {
        await conn.dropTable(table);
      }
      await conn.closeConnection();
    });

    it("#defineCollection with different field types", async () => {
      await conn.defineTable({
        name: "student",
        columns: [
          {
            name: "name",
            type: "string",
            unique: true
          },
          {
            name: "emp_no",
            type: "uuid"
          },
          {
            name: "salary",
            /*  maximum: 10000,*/
            type: "integer",
            not_null: true
          },
          {
            name: "birth_date",
            type: "date"
          },
          {
            name: "created_on",
            type: "datetime"
          },
          {
            name: "gender",
            type: "boolean"
          },
          {
            name: "address",
            type: "json"
          },
          {
            name: "rating",
            type: "number",
            default: 4.5
          }
        ]
      });
      cleanTableList.push("student");
    });

    it("#Table::getName", function () {
      const employeeTable = conn.table("student");
      assertEquals(employeeTable.getName(), "student", "Invalid table name");
    });

    /**
     * CREATE
     */
    it("#insert", async () => {
      const studentTable = conn.table("student");
      const student = studentTable.createNewRecord();
      const empId = student.getID();
      student.set("name", "John");
      student.set("emp_no", conn.generateRecordId());
      student.set("birth_date", Temporal.Now.plainDateISO());
      student.set("created_on", Temporal.Now.plainDateTimeISO());
      student.set("gender", true);
      student.set("salary", 5000);
      student.set("address", {
        street: "test",
        zipcode: 500000
      });
      johnRecord = await student.insert();

      const johnObject = johnRecord.toJSON();
      assertEquals(
        johnObject.id + "",
        empId,
        "id is expected to be same as initialized value"
      );
      assertEquals(johnObject.name, "John", "name is expected to be John");
      assertEquals(johnObject.rating, 4.5, "default is expected to be 4.5");
    });

    it("#::insert not null error", async () => {
      const studentTable = conn.table("student");
      const student = studentTable.createNewRecord();
      student.set("name", "Unique Name");
      try {
        await student.insert();
      } catch (_error) {
        return;
      }
      assert(false, "not null error");
    });

    it("#::insert unique error", async () => {
      const studentTable = conn.table("student");
      const student = studentTable.createNewRecord();
      student.set("name", "John");
      student.set("salary", 500);
      try {
        await student.insert();
      } catch (_error) {
        return;
      }
      assert(false, "duplicate key error");
    });

    /**
     * UPDATE
     */
    it("#update", async () => {
      johnRecord.set("salary", 200);
      try {
        const rec = await johnRecord.update();
        assert(rec.get("salary") === 200, "record not updated");
      } catch (_error) {
        assert(false, "duplicate key error");
      }
    });

    /* it("#findById", async () => {
      const studentTable = conn.table("student");
      const student: Record = await studentTable.findById(johnRecord.getID());
      assertEquals(student.length, 1);
    });*/

    it("#findById", async () => {
      const studentTable = conn.table("student");
      const student: Record | undefined = await studentTable.findById(
        johnRecord.getID()
      );
      assert(!!student, "record not found");
      assertStrictEquals(
        student.get("name"),
        "John",
        "name is expected to be John"
      );
    });

    /*
    it("#Collection::findById string", async () => {
    const employeeCollection = odm.collection(EMPLOYEE_MODEL_NAME);
    const employee: Record | undefined = await employeeCollection.findById(
    johnRecord.getID()
    );
    assert(!!employee && employee.get("name") === "John");
    });

    it("#Collection::findOne", async () => {
    const employeeCollection = odm.collection(EMPLOYEE_MODEL_NAME);
    const employee: Record | undefined = await employeeCollection.findOne({
    name: "John"
    });
    assert(!!employee && employee.getID() === johnRecord.getID());
    });

    it("#Record::delete", async () => {
    const employeeCollection = odm.collection(EMPLOYEE_MODEL_NAME);
    await johnRecord.delete();
    const employee: Record | undefined = await employeeCollection.findById(
    johnRecord.getID()
    );
    assert(!employee);
    });

    /!**
    * SORT
    *!/
    it("#Collection::Cursor::sort", async () => {
    odm.defineCollection({
    name: "sort_test",
    fields: [
    {
    name: "number",
    type: "integer"
    }
    ]
    });
    const sortCollection = odm.collection("sort_test");
    let rec = sortCollection.createNewRecord();
    rec.set("number", 2);
    await rec.insert();
    rec = sortCollection.createNewRecord();
    rec.set("number", 1);
    await rec.insert();
    const recs: Record[] = await sortCollection
    .find({})
    .sort([["number", 1]])
    .toArray();
    let expected = 1;
    recs.forEach(function (rec: Record) {
    assert(rec.get("number") == expected, "Not expected value");
    expected++;
    });
    });

    it("#Collection::Cursor::sort 2", async () => {
    const sortCollection = odm.collection("sort_test");
    const recs: Record[] = await sortCollection
    .find({}, { sort: { number: 1 } })
    .toArray();

    let expected = 1;
    recs.forEach(function (rec: Record) {
    assert(rec.get("number") == expected, "Not expected value");
    expected++;
    });
    });

    it("#Collection::Aggregation", async () => {
    const employeeCollection = odm.collection(EMPLOYEE_MODEL_NAME);
    const empRecord = employeeCollection.createNewRecord();
    empRecord.set("name", "John");
    empRecord.set("emp_no", odm.generateObjectId());
    empRecord.set("birth_date", new Date().toISOString());
    empRecord.set("created_on", new Date().toISOString());
    empRecord.set("gender", true);
    empRecord.set("salary", 5000);
    empRecord.set("rating", 4.5);
    empRecord.set("address", {
    street: "test",
    zipcode: 500000
    });
    await empRecord.insert();
    const recs: any = await employeeCollection
    .aggregate([
    {
    $group: {
    _id: "$name",
    count: { $count: {} }
    }
    }
    ])
    .toArray();
    console.log(recs);
    assert(recs[0].count == 1, "Not expected value");
    });*/
  }
});
