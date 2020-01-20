import {assert} from "chai";
import "mocha";
import {ODM} from "../src";
import {session, MAX_TIMEOUT} from "./test.utils";

describe('Initial test setup', () => {

    it('#connect()', function (done) {
        this.timeout(MAX_TIMEOUT);
        session.odm = new ODM();
        session.odm.connect({
            "host": "localhost",
            "port": "27017",
            "database": "odm-test-db",
            "dialect": "mongodb",
        }).then(() => {
            assert.isOk(true, 'connection established');
            done()
        }, () => {
            assert.isOk(false, 'connection failed');
            done();
        });
    });

    it('#clear existing database', function (done) {
        this.timeout(MAX_TIMEOUT);
        session.odm.databaseExists().then(() => {
            session.odm.dropDatabase().then(() => {
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
