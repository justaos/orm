const {AnysolsModel} = require('../');

const anysolsModel = new AnysolsModel();

const config = {
    "host": "localhost",
    "port": "27017",
    "database": "anysols-model",
    "dialect": "mongodb",
};

anysolsModel.connect(config).then(function () {
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
