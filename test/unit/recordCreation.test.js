const {assert} = require('chai');
let testSession = require('../session.test');

describe('record operations', function () {

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
        this.timeout(5000);
        let Student = testSession.anysolsModel.model("student");
        let s = new Student();
        s.set("name", "John");
        s.save().then(function () {
            assert.isOk(true, 'record created');
            done();
        }, function () {
            assert.isOk(false, 'record not created');
            done();
        });
    });

    it('#record creation check', function (done) {
        this.timeout(5000);
        let Student = testSession.anysolsModel.model("student");
        Student.find().exec().then(function (students) {
            if (students)
                done();
        });
    });


    it('#record remove check', function (done) {
        this.timeout(5000);
        let Student = testSession.anysolsModel.model("student");
        Student.findOne({}).exec().then(function (student) {
            student.remove().then(() => {
                done();
            })
        });
    });
});
