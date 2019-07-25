const AnysolsModel = require('../').AnysolsModel;


exports.default = function(cb) {

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
        cb(anysolsModel)
    });

};
