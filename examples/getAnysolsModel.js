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
        cb(anysolsModel)
    });

};
