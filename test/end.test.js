let DatabaseConnector = require('../lib/index').DatabaseConnector;
const {assert} = require('chai');

describe('database-connector', function () {

    it('#close()', function () {
        DatabaseConnector.getInstance().getConnection().close();
    });

});
