

const {assert} = require('chai');
let testSession = require('../session.test');

describe('record creation', function () {

    it('#model define check', function () {
        testSession.anysolsModel.defineModel({
            name: 'student',
            fields: [{
                name: 'name',
                type: 'string'
            }]
        });
        assert.isOk(testSession.anysolsModel.isModelDefined('student'), 'model not defined');
    });

    it('#record creation check', function (done) {
        let Student = testSession.anysolsModel.model("student");
        let s = new Student();
        s.set("name", "John");
        s.save().then(function () {
            done();
            assert.isOk(true, 'record created');
        });
    });

});
