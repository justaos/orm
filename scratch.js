let AnysolsModel = require('./lib').AnysolsModel;

let am = new AnysolsModel();

am.connect({
    "host": "localhost",
    "port": "27017",
    "database": "anysols",
    "dialect": "mongodb",
}).then(function (dbConn) {

    am.databaseExists();

}, (err) => {
    console.log("##############################" + err.name);
});


