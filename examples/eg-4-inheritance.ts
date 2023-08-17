import getODM from "./getODM.ts";

const odm = await getODM();

odm.defineCollection({
  name: "animal",
  fields: [
    {
      name: "name",
      type: "string"
    }
  ]
});

const animalCol = odm.collection("animal");
const animal = animalCol.createNewRecord();
animal.set("name", "Puppy");
await animal.insert();

odm.defineCollection({
  name: "dog",
  extends: "animal",
  final: true,
  fields: [
    {
      name: "breed",
      type: "string"
    }
  ]
});

const dogCol = odm.collection("dog");
const husky = dogCol.createNewRecord();
husky.set("name", "Jimmy");
husky.set("breed", "Husky");
await husky.insert();

const animals = await animalCol.find({}).toArray();

animals.forEach((animal) => {
  console.log(animal.toObject());
});
await odm.closeConnection();
