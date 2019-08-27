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
                        console.log("[modelName=" + modelName + ", operation=" + operation + ", when=" + when + "]");
                        if (when === "before") {
                            for (let record of records) {
                                console.log("computed field updated for :: " + record.get('name'));
                                record.set("computed", record.get("name") + " +++ computed");
                            }
                        }
                    }
                    if (operation === 'read') {
                        console.log("[modelName=" + modelName + ", operation=" + operation + ", when=" + when + "]");
                        for (let record of records) {
                            console.log(record.toObject());
                        }
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
    s.set("name", "John " + new Date().toISOString());
    s.insert().then(function () {
        studentModel.find().execute().then(function (students) {
            anysolsModel.closeConnection();
        });
    });

});
