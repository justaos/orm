import { ORM } from "../mod.ts";

const odm = new ORM({
  hostname: "127.0.0.1",
  port: 5432,
  username: "postgres",
  password: "postgres",
  database: "odm-test-db",
});

const conn = await odm.connect(true);

/*@Table()
class TestingTable {

  @DataTypeString()
  name;

  @DataTypeInteger()
  age;

  @DataTypeInteger()
  test;
}*/

//await client.defineTable(TestingTable);

await client.defineTable({
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

await client.closeConnection();

self.onmessage = async (e) => {
  console.log(`WORKER ${e.data.post}========================================`);
  const conn = await odm.connect();
  const table = client.table("testing_table");
  for (let i = 0; i < 1000; i++) {
    console.log(
      `WORKER ${e.data.post} INDEX : ${i} ========================================`,
    );
    const record = table.createNewRecord();
    record.set("name", "1992");
    record.set("age", "199201");
    await record.insert();
  }
  const selectQuery = table.select();
  selectQuery.where("name", "=", "1992");
  const count = await selectQuery.count();

  console.log(
    `WORKER ${e.data.post} COUNTs : ${count} ========================================`,
  );

  await client.closeConnection();
  self.close();
};
