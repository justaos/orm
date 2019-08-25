const {assert} = require('chai');
const {session} = require('./test.utils');

describe('End test cleanup', () => {

    it("disconnect check", function (done) {
        this.timeout(5000);
        session.anysolsModel.closeConnection().then(() => {
            assert.isOk(true, 'close connection success');
            done()
        }, () => {
            assert.isOk(false, 'close connection failed');
            done();
        });
    });

});
