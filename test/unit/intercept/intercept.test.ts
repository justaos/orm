import {assert} from "chai";
import "mocha";
import {OPERATION_WHEN, OPERATIONS, Record} from "../../../src";
import {logger, MAX_TIMEOUT, session} from "../../test.utils";

describe('Operations Intercept', () => {

    let MODEL_NAME = "intercept";

    it('#ODM::addInterceptor', function (done) {
        this.timeout(MAX_TIMEOUT);
        session.odm.addInterceptor({

            getName: function () {
                return "my-intercept";
            },

            intercept: (collectionName: string, operation: string, when: string, payload: any) => {
                return new Promise((resolve, reject) => {
                    if (collectionName === MODEL_NAME) {
                        if (operation === OPERATIONS.CREATE) {
                            logger.info("[collectionName=" + collectionName + ", operation=" + operation + ", when=" + when + "]");
                            if (when === OPERATION_WHEN.BEFORE) {
                                logger.info("before");
                                for (let record of payload.records)
                                    record.set("computed", "this is computed");
                            }
                        }
                    }
                    resolve(payload);
                });
            }
        });

        session.odm.defineCollection({
            name: MODEL_NAME,
            fields: [{
                name: 'name',
                type: 'string'
            }, {
                name: 'computed',
                type: 'string'
            }]
        });

        let interceptTestCollection = session.odm.collection(MODEL_NAME);
        let s = interceptTestCollection.createNewRecord();
        s.set("name", "John");
        s.insert().then(function (rec: Record) {
            assert.isOk(rec.get("computed") === "this is computed", "read interceptor not computed the value");
            done();
        }, function (err: Error) {
            logger.info(err.message + "");
            done();
        });

    });

    it('#model define check', function (done) {
        this.timeout(MAX_TIMEOUT);
        session.odm.deleteInterceptor("my-intercept");

        let interceptTestCollection = session.odm.collection(MODEL_NAME);
        let s = interceptTestCollection.createNewRecord();
        s.set("name", "Ravi");
        s.insert().then(function (rec: Record) {
            assert.isOk(rec.get("computed") !== "this is computed", "read interceptor computed the value");
            done();
        }, function (err: Error) {
            logger.logError(err);
            done();
        });

    });

});
