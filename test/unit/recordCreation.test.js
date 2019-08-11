const {assert} = require('chai');
let testSession = require('../session.test');

describe('record operations', () => {

    it('#model define check', function () {
        testSession.anysolsModel.defineModel({
            name: 'student',
            fields: [{
                name: 'name',
                type: 'string'
            }, {
                name: 'roll_no',
                type: 'integer'
            }]
        });
        assert.isOk(testSession.anysolsModel.isModelDefined('student'), 'model not defined');
    });

    it('#record creation john check', function (done) {
        this.timeout(5000);
        let Student = testSession.anysolsModel.model("student");
        let s = new Student();
        s.set("name", "John");
        s.set("roll_no", 200);
        s.save().then(() => {
            assert.isOk(true, 'record created');
            done();
        }, () => {
            assert.isOk(false, 'record not created');
            done();
        });
    });

    it('#record creation ravi check', function (done) {
        this.timeout(5000);
        let Student = testSession.anysolsModel.model("student");
        let s = new Student();
        s.set("name", "Ravi");
        s.set("roll_no", 100);
        s.save().then(() => {
            assert.isOk(true, 'record created');
            done();
        }, () => {
            assert.isOk(false, 'record not created');
            done();
        });
    });
    it('#record query check', function (done) {
        this.timeout(5000);
        let Student = testSession.anysolsModel.model("student");
        Student.find().exec().then((students) => {
            if (students)
                done();
        });
    });

    it('#record findOne check', function (done) {
        this.timeout(5000);
        let Student = testSession.anysolsModel.model("student");
        Student.findOne({name: "John"}).exec().then((student) => {
            if (student.get('name') === "John" && student.toObject().name === "John")
                done();

        });
    });

    it('#record remove only selected', function (done) {
        this.timeout(5000);
        let Student = testSession.anysolsModel.model("student");
        Student.findOne({name: "John"}).exec().then((student) => {
            student.remove().then(() => {
                Student.findOne({name: "John"}).exec().then((student) => {
                    if (!student)
                        Student.find().exec().then((students) => {
                            if (students)
                                done();
                        });
                })
            })
        });
    });
});
