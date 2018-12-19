let DatabaseService = require('../../lib').DatabaseService;
const {assert} = require('chai');

describe('DatabaseService', function () {

    let model;

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
        });
    });

});
