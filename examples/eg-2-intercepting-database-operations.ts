import getORM from "./getORM.ts";
import {
  DatabaseOperationContext,
  DatabaseOperationInterceptor,
  DatabaseOperationType,
  DatabaseOperationWhen,
  Record,
} from "../mod.ts";

const odm = getORM();

const conn = await odm.connect(true);

odm.addInterceptor(
  new (class extends DatabaseOperationInterceptor {
    getName() {
      return "my-intercept";
    }

    async intercept(
      collectionName: string,
      operation: DatabaseOperationType,
      when: DatabaseOperationWhen,
      records: Record[],
      _context: DatabaseOperationContext,
    ) {
      if (collectionName === "student") {
        if (operation === "INSERT") {
          console.log(
            `[collectionName=${collectionName}, operation=${operation}, when=${when}]`,
          );
          if (when === "BEFORE") {
            for (let record of records) {
              console.log(
                "computed field updated for :: " + record.get("name"),
              );
              record.set("computed", record.get("name") + " +++ computed");
            }
          }
        }
        if (operation === "SELECT") {
          console.log(
            `[collectionName=${collectionName}, operation=${operation}, when=${when}]`,
          );
          if (when === "AFTER") {
            for (const record of records) {
              console.log(JSON.stringify(record.toJSON(), null, 4));
            }
          }
        }
      }
      return records;
    }
  })(),
);

await conn.defineTable({
  name: "student",
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

const studentTable = conn.table("student");
const studentRecord = studentTable.createNewRecord();
studentRecord.set("name", "John " + new Date().toISOString());
await studentRecord.insert();
await studentTable.select().toArray();
/* This will print the following:
[collectionName=student, operation=CREATE, when=BEFORE]
computed field updated for :: John 2023-12-05T13:57:21.418Z
[collectionName=student, operation=CREATE, when=AFTER]

[collectionName=student, operation=READ, when=BEFORE]
[collectionName=student, operation=READ, when=AFTER]
{
    "id": "e5d8a03e-7511-45c6-96ad-31a6fa833696",
    "_table": "student",
    "name": "John 2023-12-05T13:31:13.313Z",
    "computed": "John 2023-12-05T13:31:13.313Z +++ computed"
}
*/

await conn.closeConnection();
