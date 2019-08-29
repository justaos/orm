const {assert} = require('chai');
const {MAX_TIMEOUT} = require('../../test.utils');
const {DatabaseConfiguration, DatabaseConnection} = require("../../../lib/core");

const defaultConfig = {
    host: "localhost",
    port: "27017",
    database: "anysols-collection-service-dbservice",
    dialect: "mongodb"
};

describe('DatabaseConnection', () => {

    it('#DatabaseConfiguration::getUri with username/password', function () {
        const config = {...defaultConfig, username: "admin", password: "admin"};
        let dbConfig = new DatabaseConfiguration(config.host, config.port, config.database, config.username, config.password, config.dialect);
        assert.equal(dbConfig.getUri(), 'mongodb://admin:admin@localhost:27017/anysols-collection-service-dbservice', "Unexpected uri generated");
    });

    it('#DatabaseConfiguration::getUri without username/password', function () {
        const config = {
            ...defaultConfig
        };
        let dbConfig = new DatabaseConfiguration(config.host, config.port, config.database, config.username, config.password, config.dialect);
        assert.equal(dbConfig.getUri(), 'mongodb://localhost:27017/anysols-collection-service-dbservice', "Unexpected uri generated");
    });

    let dbConnection;

    it('#DatabaseService::connect', function (done) {
        this.timeout(MAX_TIMEOUT);
        let dbConfig = new DatabaseConfiguration(defaultConfig.host, defaultConfig.port, defaultConfig.database, defaultConfig.username, defaultConfig.password, defaultConfig.dialect);
        DatabaseConnection.connect(dbConfig).then((conn) => {
            dbConnection = conn;
            assert.isOk(true, 'connection established');
            done()
        }, () => {
            assert.isOk(false, 'connection failed');
            done();
        });
    });

    it('#DatabaseService::dropDatabase', function (done) {
        this.timeout(MAX_TIMEOUT);
        dbConnection.databaseExists().then(() => {
            let dbConfig = new DatabaseConfiguration(defaultConfig.host, defaultConfig.port, defaultConfig.database, defaultConfig.username, defaultConfig.password, defaultConfig.dialect);
            DatabaseConnection.dropDatabase(dbConfig).then(() => {
                assert.isOk(true, 'dropped successfully');
                done()
            }, () => {
                assert.isOk(false, 'dropping failed');
                done()
            })
        }, (err) => {
            done();
        });
    });

    it('#DatabaseService::closeConnection', function (done) {
        this.timeout(MAX_TIMEOUT);
        dbConnection.closeConnection().then(() => {
            assert.isOk(true, 'close connection success');
            done()
        }, () => {
            assert.isOk(false, 'close connection failed');
            done();
        });
    });


});
