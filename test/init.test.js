const {assert} = require('chai');
const {AnysolsModel} = require('../');
const {session} = require('./test.utils');

describe('Initial test setup', () => {

    it('#connect()', function () {
        //this.timeout(5000);
        /*session.anysolsModel = new AnysolsModel();
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
        });*/
    });

});
