const AnysolsModel = require('../').AnysolsModel;

const anysolsModel = new AnysolsModel();

const config = {
    "host": "localhost",
    "port": "27017",
    "database": "anysols",
    "dialect": "mongodb",
};

anysolsModel.connect({
    "host": "localhost",
    "port": "27017",
    "database": "anysols",
    "dialect": "mongodb",
}).then(function (dbConn) {
    console.log('connection success');
    anysolsModel.databaseExists().then( ()=> {
        console.log('db exists');
        anysolsModel.closeConnection();
    }, () => {
        console.log("db does not exists");
        anysolsModel.closeConnection();
    });
}, (err) => {
    console.log('connection failed');
});


exports.default = anysolsModel;
