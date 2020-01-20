const {ODM} = require('../');

const odm = new ODM();

const config = {
    "host": "localhost",
    "port": "27017",
    "database": "anysols-collection-service",
    "dialect": "mongodb",
};

odm.connect(config).then(() => {
    console.log('connection success');
    odm.databaseExists().then(() => {
        console.log('db exists');
        odm.closeConnection();
    }, () => {
        console.log("db does not exists");
        odm.closeConnection();
    });
}, (err) => {
    console.log('connection failed');
    odm.closeConnection();
});
