const {assert} = require('chai');
const {AnysolsModel} = require('../');
const {session, MAX_TIMEOUT} = require('./test.utils');

describe('Initial test setup', () => {

    it('#connect()', function (done) {
        this.timeout(MAX_TIMEOUT);
        session.anysolsModel = new AnysolsModel();
        session.anysolsModel.connect({
            "host": "localhost",
            "port": "27017",
            "database": "anysols-model-test",
            "dialect": "mongodb",
        }).then(() => {
            assert.isOk(true, 'connection established');
            done()
        }, () => {
            assert.isOk(false, 'connection failed');
            done();
        });
    });

    it('#clear existing database', function (done) {
        this.timeout(MAX_TIMEOUT);
        session.anysolsModel.databaseExists().then(() => {
            session.anysolsModel.dropDatabase().then(() => {
                assert.isOk(true, 'dropped successfully');
                done()
            }, () => {
                assert.isOk(false, 'dropping failed');
                done()
            })
        }, () => {
            done();
        })
    });

});
