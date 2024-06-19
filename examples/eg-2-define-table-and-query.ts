import getORM from "./getORM.ts";

const odm = getORM();
const conn = await odm.connect(true);

await client.defineTable({
  name: "department",
  columns: [
    {
      name: "name",
      type: "string",
    },
    {
      name: "code",
      type: "string",
    },
  ],
});

await client.defineTable({
  name: "teacher",
  columns: [
    {
      name: "name",
      type: "string",
    },
    {
      name: "badge_number",
      type: "integer",
    },
    {
      name: "age",
      type: "integer",
    },
    {
      name: "date_of_joining",
      type: "date",
    },
    {
      name: "department",
      type: "uuid",
      foreign_key: {
        table: "department",
        column: "id",
      },
    },
  ],
});

const teacherTable = client.table("teacher");
for (let i = 0; i < 10; i++) {
  const teacher = teacherTable.createNewRecord();
  teacher.set("name", randomNames());
  teacher.set("badge_number", i + 1);
  teacher.set("age", 10 * ((i + 1) % 2));
  await teacher.insert();
}

let records = await teacherTable
  .select()
  .orderBy("badge_number", "DESC")
  .toArray();

for (const record of records) {
  console.log(record.get("name") + " :: " + record.get("badge_number"));
}

console.log("Count :: " + (await teacherTable.count()));

// Where 'age' is 10  and (name is 'a1' or 'badge_number' is 5)
const selectQuery = teacherTable.select();
selectQuery.where("age", 10);

const compoundOrQuery = selectQuery.where("name", "a1").compoundOr();
compoundOrQuery.where("badge_number", 5);

records = await selectQuery.toArray();
console.log(records.map((t) => t.toJSON()));

await client.closeConnection();

function randomNames() {
  const names = [
    "John",
    "Doe",
    "Jane",
    "Smith",
    "Alice",
    "Bob",
    "Charlie",
    "David",
    "Eve",
    "Frank",
  ];
  return names[Math.floor(Math.random() * names.length)];
}
