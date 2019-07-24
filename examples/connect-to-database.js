let AnysolsModel = require('../lib').AnysolsModel;

let anysolsModel = new AnysolsModel();

anysolsModel.connect({
    "host": "localhost",
    "port": "27017",
    "database": "anysols",
    "dialect": "mongodb",
}).then(function (dbConn) {

    anysolsModel.databaseExists().then(function () {
        anysolsModel.defineModel({
            name: 'student',
            fields: [{
                name: 'name',
                type: 'string'
            }]
        });

        if (anysolsModel.isModelDefined('student')) {

            let Student = anysolsModel.model("student");
            let s = new Student();
            s.set("name", "John");
            s.save().then(function () {
                console.log("Student created successfully");
                anysolsModel.closeConnection();
            });
        }

    });

}, (err) => {
    console.log("##############################" + err.name);
});


