let testSession = require('./session.test');
const {assert} = require('chai');

describe('database-connector', function () {


    it("disconnect check", function() {
        if (testSession.anysolsModel)
            testSession.anysolsModel.closeConnection();
    });

});
