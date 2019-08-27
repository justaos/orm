let getAnysolsModel = require("./getAnysolsModel");

getAnysolsModel(function (anysolsModel) {

    anysolsModel.addInterceptor({

        getName: function () {
            return "my-intercept";
        },

        intercept: (modelName, operation, when, records) => {
            return new Promise((resolve, reject) => {
                if (modelName === 'student') {
                    if (operation === 'create') {
                        if (when === "before") {
                            console.log("Student before");
                            for (let record of records)
                                record.set("computed", record.get("name") + " +++ computed");
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

    let studentModel = anysolsModel.model("student");
    let s = studentModel.initializeRecord();
    s.set("name", "John");
    s.insert().then(function () {
        studentModel.find().execute().then(function (students) {
            anysolsModel.closeConnection();
        });
    });

});
