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

records.forEach(async function (rec) {
  console.log(`${await rec.get("name")} :: ${await rec.get("roll_no")}`);
  console.log(JSON.stringify(await rec.toJSON(), null, 4));
});

const count = await teacherTable.count();
console.log("COUNT :: " + count);
await conn.closeConnection();
