const {assert} = require('chai');
const ModelInterceptor = require("../../../lib/model-handler/model/model-interceptor").default;
const {session, MAX_TIMEOUT} = require('../../test.utils');

describe('ModelInterceptor', () => {

    const MODEL_NAME = "intercept_test";

    it('#AnysolsModel::addInterceptor defining a intercept', function () {

        class MyIntercept {
            intercept(modelName, operation, when, records) {
                return new Promise((resolve, reject) => {
                    if (modelName === MODEL_NAME) {
                        if (operation === 'create') {
                            if (when === "before") {
                                records.set("name", "overridden_by_intercept");
                            }
                        }
                    }
                    resolve(records);
                });
            }
        }

        session.anysolsModel.addInterceptor("my-intercept", new MyIntercept());
    });

    it('#AnysolsModel::addInterceptor defining a intercept', function (done) {
        this.timeout(MAX_TIMEOUT);
        session.anysolsModel.defineModel({
            name: 'intercept_test',
            fields: [{
                name: 'name',
                type: 'string'
            }]
        });

        let InterceptTest = session.anysolsModel.model(MODEL_NAME);
        let s = new InterceptTest({});
        s.set("name", "John");
        s.save().then((record) => {
            if (record.get("name") === "overridden_by_intercept")
                done();
        });
    });

    it('#Model::deactivateIntercept', function (done) {
        this.timeout(MAX_TIMEOUT);
        let InterceptTest = session.anysolsModel.model(MODEL_NAME);
        InterceptTest.deactivateIntercept("my-intercept");
        let s = new InterceptTest({});
        s.set("name", "Ravi");
        s.save().then((record) => {
            if (record.get("name") === "Ravi")
                done();
        });
    });


});
