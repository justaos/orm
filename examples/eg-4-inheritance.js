let getODM = require("./getODM");

getODM().then(async function (odm) {

    odm.defineCollection({
        name: 'animal',
        fields: [{
            name: 'name',
            type: 'string'
        }]
    });

    let animalCol = odm.collection("animal");
    let animal = animalCol.createNewRecord();
    animal.set("name", "Puppy");
    await animal.insert();

    odm.defineCollection({
        name: 'dog',
        extends: 'animal',
        final: true,
        fields: [{
            name: 'breed',
            type: 'string'
        }]
    });

    let dogCol = odm.collection("dog");
    let husky = dogCol.createNewRecord();
    husky.set("name", "Jimmy");
    husky.set("breed", "Husky");
    await husky.insert();

    animalCol.find({}).toArray().then(function (animals) {
        animals.forEach((animal) => {
            console.log(animal.toObject());
        });
        odm.closeConnection();
    });


});
