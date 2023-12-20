import {
  afterAll,
  assertStrictEquals,
  beforeAll,
  describe,
  it
} from "../../test.deps.ts";

import { Session } from "../../test.utils.ts";
import { ORMConnection } from "../../../mod.ts";

describe(
  "SELECT Query",
  {
    sanitizeResources: false,
    sanitizeOps: false
  },
  () => {
    let conn: ORMConnection;
    const logger = Session.getLogger();

    beforeAll(async () => {
      conn = await Session.getConnection();
      await conn.defineTable({
        name: "task",
        columns: [
          {
            name: "description",
            type: "string"
          },
          {
            name: "state",
            type: "string",
            default: "new"
          },
          {
            name: "priority",
            type: "integer",
            default: 0
          },
          {
            name: "order",
            type: "integer",
            default: 100
          },
          {
            name: "active",
            type: "boolean",
            default: true
          }
        ]
      });
      const taskTable = conn.table("task");
      for (let i = 0; i < 20; i++) {
        const taskRecord = taskTable.createNewRecord();
        taskRecord.set("description", `Task [priority 1] ${i}`);
        taskRecord.set("priority", 1);
        taskRecord.set("order", Math.floor(Math.random() * 100));
        await taskRecord.insert();
      }
      for (let i = 0; i < 20; i++) {
        const taskRecord = taskTable.createNewRecord();
        taskRecord.set("description", `Task [priority 2] ${i}`);
        taskRecord.set("priority", 2);
        taskRecord.set("order", Math.floor(Math.random() * 100));
        await taskRecord.insert();
      }
    });

    afterAll(async () => {
      const conn = await Session.getConnection();
      await conn.dropTable("task");
      await (await Session.getConnection()).closeConnection();
    });

    it("#simple select query", async () => {
      const taskTable = conn.table("task");
      let count = await taskTable.count();
      assertStrictEquals(count, 40, "Should be 40 records");

      taskTable.select().where("priority", 1);
      count = await taskTable.count();
      assertStrictEquals(count, 20, "Should be 20 records");
    });

    it("#simple in select query", async () => {
      const taskTable = conn.table("task");
      taskTable.select().where("priority", [1, 2]);
      let count = await taskTable.count();
      assertStrictEquals(count, 40, "Should be 40 records");
    });

    it("#select - filter and sort", async () => {
      const taskTable = conn.table("task");
      taskTable.select();
      taskTable.where("priority", 1);
      taskTable.offset(5);
      taskTable.orderBy("order", "ASC");
      const taskCursor = await taskTable.execute();
      for await (const taskRecord of taskCursor()) {
        assertStrictEquals(taskRecord.get("priority"), 1, "Should be 1");
      }
    });

    it("#select - sort DESC", async () => {
      const taskTable = conn.table("task");
      taskTable.select();
      taskTable.orderBy("order", "DESC");
      const taskCursor = await taskTable.execute();
      let prevOrder;
      for await (const taskRecord of taskCursor()) {
        const order = taskRecord.get("order");
        if (prevOrder) {
          assertStrictEquals(
            prevOrder >= order,
            true,
            "Previous order is greater than current order"
          );
        }
        prevOrder = order;
      }
    });

    /* it("#Collection::findOne", async () => {
      const employeeCollection = odm.collection(EMPLOYEE_MODEL_NAME);
      const employee: Record | undefined = await employeeCollection.findOne({
        name: "John"
      });
      assert(!!employee && employee.getID() === johnRecord.getID());
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
);
