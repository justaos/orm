let {StringDataType} = require("../");
let getAnysolsODM = require("./getAnysolsODM");

getAnysolsODM().then(function (anysolsODM) {

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
            name: "personal_contact",
            type: "email"
        }, {
            name: "emp_no",
            type: "objectId"
        }, {
            name: "salary",
            type: "integer"
        }, {
            name: "birth_date",
            type: "date"
        }, {
            name: "gender",
            type: "boolean"
        }, {
            name: "address",
            type: "object"
        }]
    });

    let studentCollection = anysolsODM.collection("student");
    let s = studentCollection.createNewRecord();
    s.set("personal_contact", "test@example.com");
    s.set("birth_date", new Date());
    s.insert().then(function () {
        console.log("Student created");
        studentCollection.find({}).toArray().then(function (res) {
            console.log(JSON.stringify(res));
            s.set("graduated", null);
            s.update().then(function () {
                anysolsODM.closeConnection();
            });
        });

    }, (err) => {
        console.log(err);
        anysolsODM.closeConnection();
    });
});
