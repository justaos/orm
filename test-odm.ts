import { ODM } from "./mod.ts";

const conn = await new ODM({
  hostname: "127.0.0.1",
  port: 5432,
  username: "postgres",
  password: "admin",
  database: "odm-test-db"
}).connect(true);

await conn.defineTable({
  schema: "testing_schema",
  name: "testing_table",
  columns: [
    {
      name: "name",
      type: "string"
    },
    {
      name: "age",
      type: "date"
    }
  ]
});

const table = conn.table("testing_schema.testing_table");

const record = table.createNewRecord();

record.set("name", "1992");
record.set("age", "1992-10-01");

  await record.insert();



const selectQuery = table.select();
selectQuery.where("name", "=", "1992");
const records = await selectQuery.getCount();

console.log(records);

await conn.closeConnection();
