const {AnysolsModel} = require('../');

module.exports = (cb) => {

    const anysolsModel = new AnysolsModel();

    const config = {
        "host": "localhost",
        "port": "27017",
        "database": "anysols-model",
        "dialect": "mongodb",
    };

    anysolsModel.connect(config).then(() => {
        console.log('connection success');
        anysolsModel.databaseExists().then(() => {
            console.log('db exists');
            cb(anysolsModel);
        }, () => {
            console.log("db does not exists");
        });
    }, (err) => {
        console.log('connection failed');
    });

};
