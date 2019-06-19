const {assert} = require('chai');
let testSession = require('../session.test');

describe('model', function () {

    it('#model undefined check', function () {
        assert.isOk(!testSession.anysolsModel.isModelDefined('test'), 'model defined');
    });

});
