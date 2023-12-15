import {
  afterAll,
  assertStrictEquals,
  beforeAll,
  describe,
  it
} from "../../test.deps.ts";

import { Session } from "../../test.utils.ts";
import { ODMConnection } from "../../../mod.ts";

describe(
  "SELECT Query",
  {
    sanitizeResources: false,
    sanitizeOps: false
  },
  () => {
    let conn: ODMConnection;
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

    it("#select query using cursor", async () => {
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
  }
);
