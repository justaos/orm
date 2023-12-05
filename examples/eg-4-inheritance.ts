import getODM from "./getODM.ts";

const odm = getODM();
const conn = await odm.connect(true);

await conn.defineTable({
  name: "animal",
  columns: [
    {
      name: "name",
      type: "string"
    }
  ]
});

const animalTable = conn.table("animal");
const animal = animalTable.createNewRecord();
animal.set("name", "Puppy");
await animal.insert();

await conn.defineTable({
  name: "dog",
  inherits: "animal",
  final: true,
  columns: [
    {
      name: "breed",
      type: "string"
    }
  ]
});

const dogTable = conn.table("dog");
const husky = dogTable.createNewRecord();
husky.set("name", "Jimmy");
husky.set("breed", "Husky");
await husky.insert();

const animals = await animalTable.select().toArray();

animals.forEach((animal) => {
  console.log(animal.toJSON());
});

await conn.closeConnection();
