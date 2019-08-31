let getAnysolsODM = require("./getAnysolsODM");

getAnysolsODM().then(async function (anysolsODM) {

    anysolsODM.defineCollection({
        name: 'animal',
        fields: [{
            name: 'name',
            type: 'string'
        }]
    });

    let animalCol = anysolsODM.collection("animal");
    let animal = animalCol.createNewRecord();
    animal.set("name", "Puppy");
    await animal.insert();

    anysolsODM.defineCollection({
        name: 'dog',
        extends: 'animal',
        fields: [{
            name: 'breed',
            type: 'string'
        }]
    });

    let dogCol = anysolsODM.collection("dog");
    let husky = dogCol.createNewRecord();
    husky.set("name", "Jimmy");
    husky.set("breed", "Husky");
    await husky.insert();

    await anysolsODM.closeConnection();
});
