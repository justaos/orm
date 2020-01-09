const {assert} = require('chai');
const {session, MAX_TIMEOUT} = require('./test.utils');

describe('End test cleanup', () => {

    it("disconnect check", function (done) {
        this.timeout(MAX_TIMEOUT);
        session.odm.closeConnection().then(() => {
            assert.isOk(true, 'close connection success');
            done()
        }, () => {
            assert.isOk(false, 'close connection failed');
            done();
        });
    });

});
