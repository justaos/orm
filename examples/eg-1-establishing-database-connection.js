const {AnysolsODM} = require('../');

const anysolsODM = new AnysolsODM();

const config = {
    "host": "localhost",
    "port": "27017",
    "database": "anysols-collection-service",
    "dialect": "mongodb",
};

anysolsODM.connect(config).then(() => {
    console.log('connection success');
    anysolsODM.databaseExists().then(() => {
        console.log('db exists');
        anysolsODM.closeConnection();
    }, () => {
        console.log("db does not exists");
        anysolsODM.closeConnection();
    });
}, (err) => {
    console.log('connection failed');
    anysolsODM.closeConnection();
});
