import getORM from "./getORM.ts";

const odm = getORM();
const conn = await odm.connect(true);

await conn.defineTable({
  name: "teacher",
  columns: [
    {
      name: "name",
      type: "string",
    },
    {
      name: "roll_no",
      type: "integer",
    },
  ],
});

const teacherTable = conn.table("teacher");
for (let i = 0; i < 10; i++) {
  const teacher = teacherTable.createNewRecord();
  teacher.set("name", "a" + (i + 1));
  teacher.set("roll_no", i + 1);
  await teacher.insert();
}

const records = await teacherTable
  .select()
  .orderBy("roll_no", "DESC")
  .toArray();

for (const record of records) {
  console.log(record.get("name") + " :: " + record.get("roll_no"));
}

console.log("Count :: " + (await teacherTable.count()));

await conn.closeConnection();
