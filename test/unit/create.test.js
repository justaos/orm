const {AnysolsModel} = require('../../lib');
const {assert} = require('chai');

describe('AnysolsModel', function () {

    let anysolsModel;

    before(function () {

    });

    it('#Connection test', function (cb) {
        anysolsModel = new AnysolsModel({
            "host": "localhost",
            "port": "27017",
            "name": "anysols",
            "dialect": "mongodb"
        });
        anysolsModel.connect().then(function () {
            anysolsModel.databaseExists().then(function(){
                cb();
            });
        }, function () {
            cb();
        });
    });


    after(function () {
        if (anysolsModel)
            anysolsModel.closeConnection();
    });

});
