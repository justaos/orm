import { ORM } from "../mod.ts";

const conn = await new ORM({
  hostname: "127.0.0.1",
  port: 5432,
  username: "postgres",
  password: "postgres",
  database: "odm-test-db",
}).connect(true);

/*@Table()
class TestingTable {

  @DataTypeString()
  name;

  @DataTypeInteger()
  age;

  @DataTypeInteger()
  test;
}*/

//await conn.defineTable(TestingTable);

await conn.defineTable({
  name: "testing_table",
  columns: [
    {
      name: "name",
      type: "string",
    },
    {
      name: "age",
      type: "integer",
    },
  ],
});

const table = conn.table("testing_table");

for (let i = 0; i < 1000; i++) {
  const record = table.createNewRecord();

  record.set("name", "1992");
  record.set("age", "199201");
  await record.insert();
}

const selectQuery = table.select();
selectQuery.where("name", "=", "1992");
const records = await selectQuery.getCount();

console.log(records);

await conn.closeConnection();
