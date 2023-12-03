import {
  afterAll,
  assertStrictEquals,
  beforeAll,
  describe,
  it
} from "../../test.deps.ts";

import { Session } from "../../test.utils.ts";
import { ODMConnection } from "../../../mod.ts";
import { Logger } from "https://deno.land/x/justaos_utils@v1.6.0/packages/logger-utils/mod.ts";

describe(
  "Schema",
  {
    sanitizeResources: false,
    sanitizeOps: false
  },
  () => {
    let conn: ODMConnection;
    let logger = Logger.createLogger();

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
            name: "active",
            type: "boolean",
            default: true
          }
        ]
      });
      const taskTable = conn.table("task");
      for (let i = 0; i < 20; i++) {
        const taskRecord = taskTable.createNewRecord();
        taskRecord.set("description", `Task ${i}`);
        taskRecord.set("priority", 1);
        await taskRecord.insert();
      }
      for (let i = 0; i < 20; i++) {
        const taskRecord = taskTable.createNewRecord();
        taskRecord.set("description", `Task priority 2 ${i}`);
        taskRecord.set("priority", 2);
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
      let taskSelectQuery = taskTable.select();
      let count = await taskSelectQuery.getCount();
      assertStrictEquals(count, 40, "Should be 40 records");

      taskSelectQuery = taskTable.select();
      taskSelectQuery.where("priority", 1);
      count = await taskSelectQuery.getCount();
      assertStrictEquals(count, 20, "Should be 20 records");
    });

    it("#select query using cursor", async () => {
      const taskTable = conn.table("task");
      const taskSelectQuery = taskTable.select();
      taskSelectQuery.where("priority", 1);
      const taskCursor = await taskSelectQuery.execute();
      for await (const taskRecord of taskCursor()) {
        assertStrictEquals(taskRecord.get("priority"), 1, "Should be 1");
      }
    });
  }
);
