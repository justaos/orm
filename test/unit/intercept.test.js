const {assert} = require('chai');
let testSession = require('../session.test');

describe('intercept.test.js', function () {

    it('#model define check', function (done) {


        testSession.anysolsModel.addInterceptor("my-intercept", {
            intercept: (modelName, operation, when, records) => {
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
        });

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
