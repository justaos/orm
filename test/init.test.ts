import {assert} from "chai";
import "mocha";
import {ODM} from "../src";
import {Session, MAX_TIMEOUT} from "./test.utils";

describe('Initial test setup', () => {

    it('#connect()', function (done) {
        this.timeout(MAX_TIMEOUT);
        Session.setODM(new ODM());
        Session.getODM().connect({
            "host": "127.0.0.1",
            "port": "27017",
            "database": "odm-test-db",
            "dialect": "mongodb",
        }).then(() => {
            assert.isOk(true, 'connection established');
            done();
        }, () => {
            assert.isOk(false, 'connection failed');
            done();
        });
    });

    it('#clear existing database', function (done) {
        this.timeout(MAX_TIMEOUT);
        Session.getODM().databaseExists().then(() => {
            Session.getODM().dropDatabase().then(() => {
                assert.isOk(true, 'dropped successfully');
                done()
            }, () => {
                assert.isOk(false, 'dropping failed');
                done()
            })
        }, () => {
            done();
        })
    });

});
