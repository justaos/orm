import {
  afterAll,
  assertStrictEquals,
  beforeAll,
  describe,
  it,
} from "../../../test_deps.ts";

import { Session } from "../../test.utils.ts";
import { ORMConnection } from "../../../mod.ts";

describe(
  "SELECT Query",
  {
    sanitizeResources: false,
    sanitizeOps: false,
  },
  () => {
    let conn: ORMConnection;

    beforeAll(async () => {
      conn = await Session.getConnection();
      await conn.defineTable({
        name: "task",
        columns: [
          {
            name: "description",
            type: "string",
          },
          {
            name: "state",
            type: "string",
            default: "new",
          },
          {
            name: "priority",
            type: "integer",
            default: 0,
          },
          {
            name: "order",
            type: "integer",
            default: 100,
          },
          {
            name: "active",
            type: "boolean",
            default: true,
          },
        ],
      });
      const taskTable = conn.table("task");
      for (let i = 0; i < 10; i++) {
        const taskRecord = taskTable.createNewRecord();
        taskRecord.set("description", `Task [priority 1] ${i}`);
        taskRecord.set("priority", 1);
        taskRecord.set("order", Math.floor(Math.random() * 100));
        await taskRecord.insert();
      }
      for (let i = 0; i < 30; i++) {
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
      assertStrictEquals(count, 10, "Should be 20 records");
    });

    it("#simple in select query", async () => {
      const taskTable = conn.table("task");
      taskTable.select().where("priority", [1, 2]);
      const count = await taskTable.count();
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
        console.log(taskRecord);
        const priority = taskRecord.get("priority");
        assertStrictEquals(priority, 1, "Should be 1");
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
            "Previous order is greater than current order",
          );
        }
        prevOrder = order;
      }
    });

    it("#select - conn.query", async () => {
      const taskQuery = conn.query();
      taskQuery.select(["priority"]);
      taskQuery.from("task");
      taskQuery.where("priority", 2);
      taskQuery.orderBy([
        {
          column: "order",
          order: "ASC",
        },
      ]);
      console.log(taskQuery.getSQLQuery());
      const taskGroupedRecords = await taskQuery.execute();
      for (const taskGroupedRecord of taskGroupedRecords) {
        assertStrictEquals(
          taskGroupedRecord.priority,
          2,
          "priority should be 2",
        );
        assertStrictEquals(
          typeof taskGroupedRecord.description,
          "undefined",
          "except priority, all other fields should be undefined",
        );
      }
    });

    it("#select - group by", async () => {
      const taskQuery = conn.query();
      taskQuery.select("priority", "count(*)::int as count");
      taskQuery.from("task");
      taskQuery.groupBy("priority");
      taskQuery.orderBy("count", "ASC");
      console.log(taskQuery.getSQLQuery());
      const taskGroupedRecords = await taskQuery.execute();
      assertStrictEquals(taskGroupedRecords.length, 2, "Should be 2 records");
      assertStrictEquals(taskGroupedRecords[0].priority, 1, "Should be 1");
      assertStrictEquals(taskGroupedRecords[0].count, 10, "Should be 10");
      assertStrictEquals(taskGroupedRecords[1].priority, 2, "Should be 2");
      assertStrictEquals(taskGroupedRecords[1].count, 30, "Should be 30");
    });

    it("#select - getRecord", async () => {
      const taskTable = conn.table("task");
      const taskRecord = taskTable.createNewRecord();
      const createdTaskId = taskRecord.getID();
      taskRecord.set("description", "getRecord test");
      await taskRecord.insert();

      const foundRecord = await taskTable.getRecord({
        description: "getRecord test",
      });
      assertStrictEquals(
        createdTaskId,
        foundRecord?.getID(),
        "Record not found",
      );
    });
  },
);
