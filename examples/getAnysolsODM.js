const {AnysolsODM} = require('../');

async function getAnysolsODM() {

    return new Promise((resolve, reject) => {
        const anysolsODM = new AnysolsODM();

        const config = {
            "host": "localhost",
            "port": "27017",
            "database": "anysols-collection-service",
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
