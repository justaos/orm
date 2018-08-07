let DatabaseConnector = require('../../index').DatabaseConnector;
const {assert} = require('chai');

describe('ds-utils', function () {

    it('#connect()', function (done) {
        let db = new DatabaseConnector({
            "host": "localhost",
            "port": "27017",
            "name": "anysols",
            "user": "root",
            "password": "root",
            "dialect": "mongodb"
        });
        db.connect().then(function(){
            assert.isOk(true, 'connection established');
            db.getConnection().close();
            done()
        }, function(){
            assert.isOk(false, 'connection failed');
            done();
        });
    });

});
