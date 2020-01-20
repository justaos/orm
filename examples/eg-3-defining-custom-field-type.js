let {StringDataType} = require("../");
let getODM = require("./getODM");

getODM().then(function (odm) {

    odm.addFieldType({

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

    odm.defineCollection({
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

    let studentCollection = odm.collection("student");
    let s = studentCollection.createNewRecord();
    s.set("personal_contact", "test@example.com");
    s.set("birth_date", new Date());
    s.insert().then(function () {
        console.log("Student created");
        studentCollection.find({}).toArray().then(function (res) {
            console.log(JSON.stringify(res));
            s.set("graduated", null);
            s.update().then(function () {
                odm.closeConnection();
            });
        });

    }, (err) => {
        console.log(err);
        odm.closeConnection();
    });
});
