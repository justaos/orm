let {AnysolsModel} = require('../lib');
const {assert} = require('chai');
let testSession = require('./session.test');

describe('AnysolsModel.connect', function () {

    it('#connect()', function (done) {
        this.timeout(5000);
        testSession.anysolsModel = new AnysolsModel();
        testSession.anysolsModel.connect({
            "host": "localhost",
            "port": "27017",
            "database": "anysols",
            "dialect": "mongodb",
        }).then(function () {
            assert.isOk(true, 'connection established');
            done()
        }, function () {
            assert.isOk(false, 'connection failed');
            done();
        });
    });

});
