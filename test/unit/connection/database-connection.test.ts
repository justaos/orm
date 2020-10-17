import {assert} from "chai";
import "mocha";
import {MAX_TIMEOUT} from "../../test.utils";
import DatabaseConfiguration from "../../../src/core/connection/databaseConfiguration";
import DatabaseConnection from "../../../src/core/connection/databaseConnection";


const defaultConfig: any = {
    host: "localhost",
    port: "27017",
    database: "odm-conn-test",
    dialect: "mongodb"
};

describe('DatabaseConnection', () => {

    it('#DatabaseConfiguration::getUri with username/password', function () {
        const config: any = {...defaultConfig, username: "admin", password: "admin"};
        let dbConfig = new DatabaseConfiguration(config.host, config.port, config.dialect, config.database, config.username, config.password);
        assert.equal(dbConfig.getUri(), 'mongodb://admin:admin@localhost:27017/odm-conn-test', "Unexpected uri generated");
    });

    it('#DatabaseConfiguration::getUri without username/password', function () {
        const config: any = {
            ...defaultConfig
        };
        let dbConfig = new DatabaseConfiguration(config.host, config.port, config.dialect, config.database, config.username, config.password);
        assert.equal(dbConfig.getUri(), 'mongodb://localhost:27017/odm-conn-test', "Unexpected uri generated");
    });

    it('#DatabaseConfiguration::getUri without database', function () {
        const config: any = {
            ...defaultConfig,
            database: ""
        };
        let dbConfig = new DatabaseConfiguration(config.host, config.port, config.dialect, config.database, config.username, config.password);
        assert.equal(dbConfig.getUri(), 'mongodb://localhost:27017', "Unexpected uri generated");
    });

    it('#DatabaseConfiguration::getUri default params', function () {
        const config: any = {};
        let dbConfig = new DatabaseConfiguration(config.host, config.port, config.dialect, config.database, config.username, config.password);
        assert.equal(dbConfig.getUri(), 'mongodb://localhost:27017', "Unexpected uri generated");
    });

    let dbConnection: DatabaseConnection;

    it('#DatabaseService::connect', function (done) {
        this.timeout(MAX_TIMEOUT);
        let dbConfig = new DatabaseConfiguration(defaultConfig.host, defaultConfig.port, defaultConfig.dialect, defaultConfig.database, defaultConfig.username, defaultConfig.password);
        DatabaseConnection.connect(dbConfig).then((conn) => {
            dbConnection = conn;
            assert.isOk(true, 'connection established');
            done()
        }, () => {
            assert.isOk(false, 'connection failed');
            done();
        });
    });

    it('#DatabaseService::connect wrong config', function (done) {
        this.timeout(50000);
        const config: any = {
            ...defaultConfig,
            port: 80
        };
        let dbConfig = new DatabaseConfiguration(config.host, config.port, config.dialect, config.database, config.username, config.password, 1000);
        DatabaseConnection.connect(dbConfig).then((conn) => {
            assert.isOk(false, 'connection established');
        }).catch(() => {
            assert.isOk(true, 'connection failed');
            done();
        });
    });

    it('#DatabaseService::databaseExists - without database', function (done) {
        this.timeout(MAX_TIMEOUT);
        dbConnection.databaseExists().then(() => {
            assert.isOk(false, "Database should not exists")
        }, (err) => {
            done();
        });
    });

    it('#DatabaseService::getDBO - create record', function (done) {
        this.timeout(MAX_TIMEOUT);
        dbConnection.getDBO().collection('test').insertOne({"name": "hello"}).then(function (res) {
            const savedDoc = res.ops.find(() => true);
            if (savedDoc) {
                done();
            }
        });
    });

    it('#DatabaseService::databaseExists - with database', function (done) {
        this.timeout(MAX_TIMEOUT);
        dbConnection.databaseExists().then(() => {
            done();
        }, (err) => {
            assert.isOk(false, "Database should exists")
        });
    });

    it('#DatabaseService::dropDatabase', function (done) {
        this.timeout(MAX_TIMEOUT);
        let dbConfig = new DatabaseConfiguration(defaultConfig.host, defaultConfig.port, defaultConfig.dialect, defaultConfig.database, defaultConfig.username, defaultConfig.password);
        DatabaseConnection.dropDatabase(dbConfig).then(() => {
            assert.isOk(true, 'dropped successfully');
            done()
        }, () => {
            assert.isOk(false, 'dropping failed');
            done()
        })
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
