let getAnysolsModel = require("./getAnysolsModel").default;

getAnysolsModel(function (anysolsModel) {

    anysolsModel.defineModel({
        name: 'student',
        fields: [{
            name: 'name',
            type: 'string'
        }]
    });

    let Student = anysolsModel.model("student");
    let s = new Student();
    s.set("name", "John");
    s.save().then(function () {
        console.log("Student created");
        anysolsModel.closeConnection();
    });
});
