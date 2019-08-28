let {StringDataType} = require("../");
let getAnysolsODM = require("./getAnysolsODM");

getAnysolsODM(function (anysolsODM) {

    anysolsODM.addFieldType({

        getDataType: function (fieldDefinition) {
            return new StringDataType({pattern: "(.+)@(.+){2,}\\.(.+){2,}"})
        },

        getType: function () {
            return "email"
        },

        validateDefinition: function (fieldDefinition) {
            return !!fieldDefinition.name
        }
    });

    anysolsODM.defineCollection({
        name: 'student',
        fields: [{
            name: 'name',
            type: 'string'
        }, {
            name: 'email',
            type: 'email'
        }, {
            name: 'dob',
            type: 'date'
        }]
    });

    let studentCollection = anysolsODM.collection("student");
    let s = studentCollection.createNewRecord();
    s.set("name", "John");
    s.set("email", "test@example.com");
    s.set("dob", new Date());
    s.insert().then(function () {
        console.log("Student created");
        anysolsODM.closeConnection();
    }, (err) => {
        console.log(err);
        anysolsODM.closeConnection();
    });
});
