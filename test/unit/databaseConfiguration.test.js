const DatabaseConfiguration = require("../../lib/database/model/database-configuration").default;
const {assert} = require('chai');

describe('DatabaseConfiguration test', () => {

    it('#DatabaseConfiguration::getUri with username/password', function () {
        const config = {
            "host": "localhost",
            "port": "27017",
            "database": "anysols-model",
            "dialect": "mongodb",
            "username": "admin",
            "password": "admin"
        };
        let dbConfig = new DatabaseConfiguration(config.host, config.port, config.database, config.username, config.password, config.dialect);
        assert.equal(dbConfig.getUri(), 'mongodb://admin:admin@localhost:27017/anysols-model', "Unexpected uri generated");
    });

    it('#DatabaseConfiguration::getUri without username/password', function () {
        const config = {
            "host": "localhost",
            "port": "27017",
            "database": "anysols-model",
            "dialect": "mongodb"
        };
        let dbConfig = new DatabaseConfiguration(config.host, config.port, config.database, config.username, config.password, config.dialect);
        assert.equal(dbConfig.getUri(), 'mongodb://localhost:27017/anysols-model', "Unexpected uri generated");
    });

});
