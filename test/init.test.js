let {DatabaseService} = require('../lib/index');
const {assert} = require('chai');

describe('database.service', function () {

    it('#connect()', function (done) {
        DatabaseService.connect({
            "host": "localhost",
            "port": "27017",
            "name": "anysols",
            "user": "root",
            "password": "root",
            "dialect": "mongodb"
        }).then(function () {
            assert.isOk(true, 'connection established');
            done()
        }, function () {
            assert.isOk(false, 'connection failed');
            done();
        });
    });

});
