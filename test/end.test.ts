import {assert} from "chai";
import "mocha";
import {MAX_TIMEOUT, Session} from "./test.utils";

describe('End test cleanup', () => {

    it("disconnect check", function (done) {
        this.timeout(MAX_TIMEOUT);
        Session.getODM().closeConnection().then(() => {
            assert.isOk(true, 'close connection success');
            done()
        }, () => {
            assert.isOk(false, 'close connection failed');
            done();
        });
    });

});
