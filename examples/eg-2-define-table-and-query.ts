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
    {
      name: "age",
      type: "integer",
    },
  ],
});

const teacherTable = conn.table("teacher");
for (let i = 0; i < 10; i++) {
  const teacher = teacherTable.createNewRecord();
  teacher.set("name", "a" + (i + 1));
  teacher.set("roll_no", i + 1);
  teacher.set("age", 10 * ((i + 1) % 2));
  await teacher.insert();
}

let records = await teacherTable.select().orderBy("roll_no", "DESC").toArray();

for (const record of records) {
  console.log(record.get("name") + " :: " + record.get("roll_no"));
}

console.log("Count :: " + (await teacherTable.count()));

// Where 'age' is 10  and (name is 'a1' or 'roll_no' is 5)
const selectQuery = teacherTable.select();
selectQuery.where("age", 10);

const compoundOrQuery = selectQuery.where("name", "a1").compoundOr();
compoundOrQuery.where("roll_no", 5);

records = await selectQuery.toArray();
console.log(records.map((t) => t.toJSON()));

await conn.closeConnection();
