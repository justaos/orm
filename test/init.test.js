const {assert} = require('chai');
const {AnysolsODM} = require('../');
const {session, MAX_TIMEOUT} = require('./test.utils');

describe('Initial test setup', () => {

    it('#connect()', function (done) {
        this.timeout(MAX_TIMEOUT);
        session.anysolsODM = new AnysolsODM();
        session.anysolsODM.connect({
            "host": "localhost",
            "port": "27017",
            "database": "anysols-collection-test",
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
        session.anysolsODM.databaseExists().then(() => {
            session.anysolsODM.dropDatabase().then(() => {
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
