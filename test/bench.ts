import { Session } from "./test.utils.ts";
import { ORM } from "../mod.ts";

const conn = await new ORM({
  hostname: "127.0.0.1",
  port: 5432,
  username: "postgres",
  password: "postgres",
  database: "odm-test-db",
}).connect(true);

const start = performance.now();
await conn.defineTable({
  name: "department",
  columns: [
    {
      name: "name",
      type: "string",
      unique: true,
    },
    {
      name: "description",
      type: "string",
    },
  ],
});
const departmentTable = conn.table("department");
const itDepartment = departmentTable.createNewRecord();
itDepartment.set("name", "IT");
await itDepartment.insert();

const hrDepartment = departmentTable.createNewRecord();
hrDepartment.set("name", "HR");
await hrDepartment.insert();

await departmentTable.select().toArray();

console.log(performance.now() - start);

await conn.dropDatabase();
