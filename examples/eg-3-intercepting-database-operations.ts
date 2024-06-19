import getORM from "./getORM.ts";
import {
  type Record,
  RecordInterceptor,
  type TRecordInterceptorContext,
  type TRecordInterceptorType,
} from "../mod.ts";

const odm = getORM();

const conn = await odm.connect(true);

await client.defineTable({
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
      name: "full_name", /* Value computed in intercept */
      type: "string",
    },
  ],
});

class FullNameIntercept extends RecordInterceptor {
  getName() {
    return "full-name-intercept";
  }

  async intercept(
    tableName: string,
    interceptType: TRecordInterceptorType,
    records: Record[],
    _context: TRecordInterceptorContext,
  ) {
    if (tableName === "student") {
      console.log(`[collectionName=${tableName}, when=${interceptType}]`);
      if (interceptType === "BEFORE_INSERT") {
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
      if (interceptType === "AFTER_SELECT") {
        for (const record of records) {
          console.log(JSON.stringify(record.toJSON(), null, 4));
        }
      }
    }
    return records;
  }
}

odm.addInterceptor(new FullNameIntercept());

const studentTable = client.table("student");
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

await client.closeConnection();
