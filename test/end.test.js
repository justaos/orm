const {assert} = require('chai');
const {session} = require('./test.utils');

describe('End test cleanup', () => {

    it("disconnect check", function () {
        session.anysolsModel.closeConnection(() => {
            assert.isOk(true, 'close connection success');
            done()
        }, () => {
            assert.isOk(false, 'close connection failed');
            done();
        });
    });

});
