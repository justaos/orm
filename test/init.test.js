let {AnysolsModel} = require('../lib');
const {assert} = require('chai');
let testSession = require('./session.test');

describe('AnysolsModel.connect', function () {

    it('#connect()', function (done) {
        testSession.anysolsModel = new AnysolsModel({
            "host": "localhost",
            "port": "27017",
            "name": "anysols",
            "dialect": "mongodb"
        });
        testSession.anysolsModel.connect().then(function () {
            assert.isOk(true, 'connection established');
            done()
        }, function () {
            assert.isOk(false, 'connection failed');
            done();
        });
    });

});
