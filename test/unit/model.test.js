const {assert} = require('chai');
let testSession = require('../session.test');

describe('model', () => {

    it('#model undefined check', function () {
        assert.isOk(!testSession.anysolsModel.isModelDefined('test'), 'model defined');
    });

});
