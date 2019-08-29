const {assert} = require('chai');
const {session, MAX_TIMEOUT} = require('../../test.utils');

describe('intercept.test.js', () => {

    let MODEL_NAME = "intecept";

    it('#AnysolsODM::addInterceptor', function (done) {
        this.timeout(MAX_TIMEOUT);
        session.anysolsODM.addInterceptor({

            getName: function () {
                return "my-intercept";
            },

            intercept: (collectionName, operation, when, payload) => {
                return new Promise((resolve, reject) => {
                    if (collectionName === MODEL_NAME) {
                        if (operation === 'create') {
                            console.log("[collectionName=" + collectionName + ", operation=" + operation + ", when=" + when + "]");
                            if (when === "before") {
                                console.log("before");
                                for (let record of payload.records)
                                    record.set("computed", "this is computed");
                            }
                        }
                    }
                    resolve(payload);
                });
            }
        });

        session.anysolsODM.defineCollection({
            name: MODEL_NAME,
            fields: [{
                name: 'name',
                type: 'string'
            }, {
                name: 'computed',
                type: 'string'
            }]
        });

        let interceptTestCollection = session.anysolsODM.collection(MODEL_NAME);
        let s = interceptTestCollection.createNewRecord();
        s.set("name", "John");
        s.insert().then(function (rec) {
            assert.isOk(rec.get("computed") === "this is computed", "read interceptor not computed the value");
            done();
        }, function(err) {
            console.log(err);
            done();
        });

    });

    it('#model define check', function (done) {
        this.timeout(MAX_TIMEOUT);
        session.anysolsODM.deleteInterceptor("my-intercept");

        let interceptTestCollection = session.anysolsODM.collection(MODEL_NAME);
        let s = interceptTestCollection.createNewRecord();
        s.set("name", "Ravi");
        s.insert().then(function (rec) {
            assert.isOk(rec.get("computed") !== "this is computed", "read interceptor computed the value");
            done();
        }, function(err) {
            console.log(err);
            done();
        });

    });

});
