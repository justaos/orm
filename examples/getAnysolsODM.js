const {AnysolsODM} = require('../');

async function getAnysolsODM() {

    process.on('unhandledRejection', function onError(err) {
        console.error(err);
    });

    return new Promise((resolve, reject) => {
        const anysolsODM = new AnysolsODM();

        const config = {
            "host": "localhost",
            "port": "27017",
            "database": "anysols-odm-example",
            "dialect": "mongodb",
        };

        anysolsODM.connect(config).then(() => {
            console.log('connection success');
            resolve(anysolsODM);
        }, (err) => {
            console.log('connection failed');
        });
    });

}

module.exports = getAnysolsODM;
