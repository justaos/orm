const {ODM} = require('../');

async function getODM() {

    process.on('unhandledRejection', function onError(err) {
        console.error(err);
    });

    return new Promise((resolve, reject) => {
        const odm = new ODM();

        const config = {
            "host": "localhost",
            "port": "27017",
            "database": "odm-example-db",
            "dialect": "mongodb",
        };

        odm.connect(config).then(() => {
            console.log('connection success');
            resolve(odm);
        }, (err) => {
            console.log('connection failed');
        });
    });

}

module.exports = getODM;
