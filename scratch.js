let AnysolsModel = require('./lib').AnysolsModel;

let am = new AnysolsModel();

am.connect({
    "host": "localhost",
    "port": "27017",
    "database": "anysols",
    "dialect": "mongodb",
}).then(function (dbConn) {

    am.databaseExists().then(function () {
        am.defineModel({
            name: 'student',
            fields: [{
                name: 'name',
                type: 'string'
            }]
        });

        console.log(am.isModelDefined('student'));

        let Student = am.model("student");

        let s = new Student();
        s.set("name", "testing");
        s.save();


    });

}, (err) => {
    console.log("##############################" + err.name);
});


