let DatabaseService = require('../../lib').DatabaseService;
const {assert} = require('chai');

describe('DatabaseService', function () {

    before(function () {

    });

    it('#Connection test', function () {
        DatabaseService.connect({
            "host": "localhost",
            "port": "27017",
            "name": "anysols",
            "user": "**USERNAME**",
            "password": "**PASSWORD**",
            "dialect": "mongodb"
        }).then(function() {
            DatabaseService.databaseExists();
        });
    });


    after(function() {
        DatabaseService.closeConnection();
    });

});
