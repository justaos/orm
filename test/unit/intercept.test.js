const ModelInterceptor = require("../../lib/model-handler/model/model-interceptor").default;
const {assert} = require('chai');
const testSession = require('../session.test');

describe('intercept.test.js', () => {

    it('#model define check', function (done) {

        class MyIntercept {
            intercept(modelName, operation, when, records) {
                return new Promise((resolve, reject) => {
                    if (modelName === 'intecepttest') {
                        if (operation === 'create') {
                            if (when === "before") {
                                done();
                            }
                        }
                    }

                    resolve(records);
                });
            }
        }

        testSession.anysolsModel.addInterceptor("my-intercept", new MyIntercept());

        testSession.anysolsModel.defineModel({
            name: 'intecepttest',
            fields: [{
                name: 'name',
                type: 'string'
            }]
        });

        let InterceptTest = testSession.anysolsModel.model("intecepttest");
        let s = new InterceptTest({});
        s.set("name", "John");
        s.save();

    });

});
