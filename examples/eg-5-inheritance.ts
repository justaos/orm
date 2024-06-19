import getORM from "./getORM.ts";

const odm = getORM();
const conn = await odm.connect(true);

await client.defineTable({
  name: "animal",
  columns: [
    {
      name: "name",
      type: "string",
    },
  ],
});

const animalTable = client.table("animal");
const animal = animalTable.createNewRecord();
animal.set("name", "Puppy");
await animal.insert();

await client.defineTable({
  name: "dog",
  inherits: "animal",
  final: true,
  columns: [
    {
      name: "breed",
      type: "string",
    },
  ],
});

const dogTable = client.table("dog");
const husky = dogTable.createNewRecord();
husky.set("name", "Jimmy");
husky.set("breed", "Husky");
await husky.insert();

const animalCursor = await animalTable.select().execute();

for await (const animal of animalCursor()) {
  console.log(animal.toJSON());
}

await client.closeConnection();
