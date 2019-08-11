let {AnysolsModel} = require('../');
const {assert} = require('chai');
let testSession = require('./session.test');

describe('AnysolsModel.connect', () => {

    it('#connect()', function (done) {
        this.timeout(5000);
        testSession.anysolsModel = new AnysolsModel();
        testSession.anysolsModel.connect({
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

    it('#dropdatabase if exists', function (done) {
        this.timeout(5000);
        testSession.anysolsModel.databaseExists().then(() => {
            testSession.anysolsModel.dropDatabase().then(() => {
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
