let {StringDataType} = require("../");
let getAnysolsModel = require("./getAnysolsModel");

getAnysolsModel(function (anysolsModel) {

    anysolsModel.addFieldType({

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

    anysolsModel.defineModel({
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

    let studentModel = anysolsModel.model("student");
    let s = studentModel.initializeRecord();
    s.set("name", "John");
    s.set("email", "test@example.com");
    s.set("dob", new Date());
    s.insert().then(function () {
        console.log("Student created");
        anysolsModel.closeConnection();
    }, (err) => {
        console.log(err);
    });
});
