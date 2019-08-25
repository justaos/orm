let {FieldDefinition, MONGOOSE_TYPES} = require("../");

let getAnysolsModel = require("./getAnysolsModel");

getAnysolsModel(function (anysolsModel) {

    anysolsModel.registerFieldType(new FieldDefinition("customType", field => {
        return true
    }, function (field, fieldDefinition) {
        return {
            type: MONGOOSE_TYPES.STRING
        }
    }));

    anysolsModel.defineModel({
        name: 'student',
        fields: [{
            name: 'name',
            type: 'string'
        }, {
            name: 'dob',
            type: 'date'
        }, {
            name: 'custom_field',
            type: 'customType'
        }]
    });

    let Student = anysolsModel.model("student");
    let s = new Student();
    s.set("name", "John");
    s.set("dob", new Date());
    s.set("custom_field", "testing");
    s.save().then(function () {
        console.log("Student created");
        anysolsModel.closeConnection();
    });
});
