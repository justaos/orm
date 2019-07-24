const {assert} = require('chai');
let testSession = require('../session.test');

describe('AnysolsModel', function () {

    it('#databaseExists test', function (done) {
        testSession.anysolsModel.databaseExists().then(function(){
            assert.isOk(true, 'databaseExists working as expected');
            done();
        }, function () {
            assert.isOk(false, 'databaseExists no working as expected');
            done();
        });
    });

});
