import { ORM } from "../mod.ts";

const odm = new ORM({
  hostname: "127.0.0.1",
  port: 5432,
  username: "postgres",
  password: "postgres",
  database: "odm-test-db",
});

const conn = await odm.connect(true);

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

await conn.closeConnection();

self.onmessage = async (e) => {
  if (e.data == "status") {
    self.postMessage("online");
    return;
  }

  console.log(`WORKER ${e.data.post}========================================`);
  const ormClient = await odm.connect();
  const table = ormClient.table("testing_table");
  for (let i = 0; i < 1000; i++) {
    console.log(
      `WORKER ${e.data.post} INDEX : ${i} ========================================`,
    );
    const record = table.createNewRecord();
    record.set("name", "1992");
    record.set("age", "199201");
    await record.insert();
  }
  // const selectQuery = table;
  // selectQuery.where("name", "=", "1992");
  // const count = await selectQuery.count();

  console.log(
    `WORKER ${e.data.post} COUNTs : -- ========================================`,
  );

  ormClient.closeConnection();
  self.postMessage("complete");
};
