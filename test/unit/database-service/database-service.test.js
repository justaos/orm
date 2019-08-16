const {assert} = require('chai');
const DatabaseConfiguration = require("../../../lib/database/model/database-configuration").default;
const DatabaseService = require("../../../lib/database/database-service").default;
const {MAX_TIMEOUT} = require('../../test.utils');
const defaultConfig = {
    host: "localhost",
    port: "27017",
    database: "anysols-model-dbservice",
    dialect: "mongodb"
};

describe('DatabaseService', () => {


    it('#DatabaseConfiguration::getUri with username/password', function () {
        const config = {...defaultConfig, username: "admin", password: "admin"};
        let dbConfig = new DatabaseConfiguration(config.host, config.port, config.database, config.username, config.password, config.dialect);
        assert.equal(dbConfig.getUri(), 'mongodb://admin:admin@localhost:27017/anysols-model-dbservice', "Unexpected uri generated");
    });

    it('#DatabaseConfiguration::getUri without username/password', function () {
        const config = {
            ...defaultConfig
        };
        let dbConfig = new DatabaseConfiguration(config.host, config.port, config.database, config.username, config.password, config.dialect);
        assert.equal(dbConfig.getUri(), 'mongodb://localhost:27017/anysols-model-dbservice', "Unexpected uri generated");
    });

    let dbService;

    it('#DatabaseService::connect', function (done) {
        this.timeout(5000);
        const config = defaultConfig;
        let dbConfig = new DatabaseConfiguration(config.host, config.port, config.database, config.username, config.password, config.dialect);
        dbService = new DatabaseService();
        dbService.connect(dbConfig).then(() => {
            assert.isOk(true, 'connection established');
            done()
        }, () => {
            assert.isOk(false, 'connection failed');
            done();
        });
    });

    it('#DatabaseService::dropDatabase', function (done) {
        this.timeout(MAX_TIMEOUT);
        dbService.databaseExists().then(() => {
            dbService.dropDatabase().then(() => {
                assert.isOk(true, 'dropped successfully');
                done()
            }, () => {
                assert.isOk(false, 'dropping failed');
                done()
            })
        }, () => {
            done();
        });
    });

    it('#DatabaseService::closeConnection', function (done) {
        this.timeout(MAX_TIMEOUT);
        dbService.closeConnection().then(() => {
            assert.isOk(true, 'close connection success');
            done()
        }, () => {
            assert.isOk(false, 'close connection failed');
            done();
        });
    });


});
