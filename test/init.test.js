let {AnysolsModel} = require('../lib');
const {assert} = require('chai');

describe('AnysolsModel.connect', function () {

    let anysolsModel;

    it('#connect()', function (done) {
        anysolsModel = new AnysolsModel({
            "host": "localhost",
            "port": "27017",
            "name": "anysols",
            "dialect": "mongodb"
        });
        anysolsModel.connect().then(function () {
            assert.isOk(true, 'connection established');
            done()
        }, function () {
            assert.isOk(false, 'connection failed');
            done();
        });
    });

    after(function() {
        if (anysolsModel)
            anysolsModel.closeConnection();
    });

});
