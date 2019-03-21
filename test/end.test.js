let testSession = require('./session.test');
const {assert} = require('chai');

describe('database-connector', function () {


    after(function() {
        if (testSession.anysolsModel)
            testSession.anysolsModel.closeConnection();
    });

});
