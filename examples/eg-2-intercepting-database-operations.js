let getAnysolsModel = require("./getAnysolsModel");

getAnysolsModel(function (anysolsModel) {

    anysolsModel.addInterceptor("my-intercept", {
        intercept: (modelName, operation, when, records) => {
            return new Promise((resolve, reject) => {
                if (modelName === 'student') {
                    if (operation === 'create') {
                        if (when === "before") {
                            console.log("Student before");
                            if (!Array.isArray(records)) {
                                let record = records;
                                record.set("computed",  record.get("name") + " +++ computed");
                            }
                        } else if (when === "after")
                            console.log("Student after");
                    }
                }
                resolve(records);
            });
        }
    });

    anysolsModel.defineModel({
        name: 'student',
        fields: [{
            name: 'name',
            type: 'string'
        }, {
            name: 'computed',
            type: 'string'
        }]
    });

    let Student = anysolsModel.model("student");
    let s = new Student({});
    s.set("name", "John");
    s.save().then(function () {
        Student.find().exec().then(function (students) {
            console.log(JSON.stringify(students, null, 4));
            anysolsModel.closeConnection();
        });
    });

});
