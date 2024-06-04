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

await conn.defineTable({
  name: "student",
  columns: [
    {
      name: "first_name",
      type: "string",
    },
    {
      name: "last_name",
      type: "string",
    },
    {
      name: "full_name" /* Value computed in intercept */,
      type: "string",
    },
  ],
});

class FullNameIntercept extends DatabaseOperationInterceptor {
  getName() {
    return "full-name-intercept";
  }

  async intercept(
    collectionName: string,
    operation: DatabaseOperationType,
    when: DatabaseOperationWhen,
    records: Record[],
    _context: DatabaseOperationContext,
  ) {
    if (collectionName === "student") {
      console.log(
        `[collectionName=${collectionName}, operation=${operation}, when=${when}]`,
      );
      if (operation === "INSERT") {
        if (when === "BEFORE") {
          for (const record of records) {
            console.log(
              `Full name field updated for :: ${record.get("first_name")}`,
            );
            record.set(
              "full_name",
              `${record.get("first_name")} ${record.get("last_name")}`,
            );
          }
        }
      }
      if (operation === "SELECT") {
        if (when === "AFTER") {
          for (const record of records) {
            console.log(JSON.stringify(record.toJSON(), null, 4));
          }
        }
      }
    }
    return records;
  }
}

odm.addInterceptor(new FullNameIntercept());

const studentTable = conn.table("student");
const studentRecord = studentTable.createNewRecord();
studentRecord.set("first_name", "John");
studentRecord.set("last_name", "Doe");
await studentRecord.insert();
await studentTable.select().toArray();
/* This will print the following:
[collectionName=student, operation=INSERT, when=BEFORE]
Full name field updated for :: John
[collectionName=student, operation=INSERT, when=AFTER]
[collectionName=student, operation=SELECT, when=BEFORE]
[collectionName=student, operation=SELECT, when=AFTER]
{
    "id": "653c21bb-7d92-435e-a742-1da749f914dd",
    "_table": "student",
    "first_name": "John",
    "last_name": "Doe",
    "full_name": "John Doe"
}
*/

await conn.closeConnection();
