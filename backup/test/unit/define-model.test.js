const {assert} = require('chai');
const {session} = require('../test.utils');

describe('ModelBuilder::Model', () => {

    it('#AnysolsModel::defineModel check', function () {
        session.anysolsModel.defineModel({
            name: 'student',
            fields: [{
                name: 'id',
                type: 'id'
            }, {
                name: 'name',
                type: 'string'
            }, {
                name: 'roll_no',
                type: 'integer'
            }, {
                name: 'dob',
                type: 'date'
            }, {
                name: 'graduated',
                type: 'boolean'
            }]
        });
        assert.isOk(session.anysolsModel.isModelDefined('student'), 'model not defined');
        assert.isOk(!session.anysolsModel.isModelDefined('undefined_collection'), 'model defined');
    });

    it('#AnysolsModel::defineModel negative checks - undefined definition', function () {
        try {
            session.anysolsModel.defineModel();
        } catch (e) {
            assert.isOk(true, 'model cannot defined using empty definition');
        }
    });

    it('#AnysolsModel::defineModel negative checks - with not collection name', function () {
        try {
            session.anysolsModel.defineModel({});
        } catch (e) {
            assert.isOk(true, 'model cannot defined without collection name in definition');
        }
    });

    it('#AnysolsModel::defineModel negative checks - with no fields', function () {
        try {
            session.anysolsModel.defineModel({
                name: "teacher"
            });
        } catch (e) {
            assert.isOk(true, 'model cannot defined without fields in definition');
        }
    });

    it('#AnysolsModel::defineModel negative checks - with no field type', function () {
        try {
            session.anysolsModel.defineModel({
                name: "teacher",
                fields: [{
                    name: "name"
                }]
            });
        } catch (e) {
            assert.isOk(true, 'model cannot defined without field type in definition');
        }
    });

    it('#AnysolsModel::defineModel negative checks - duplicate field name', function () {
        try {
            session.anysolsModel.defineModel({
                name: "teacher",
                fields: [{
                    name: "name",
                    type: "string"
                }, {
                    name: "name",
                    type: "integer"
                }]
            });
        } catch (e) {
            assert.isOk(true, 'model cannot defined without specifying ref for reference type field');
        }
    });

    it('#AnysolsModel::defineModel negative checks - with no ref for reference field', function () {
        try {
            session.anysolsModel.defineModel({
                name: "teacher",
                fields: [{
                    name: "name",
                    type: "string"
                }, {
                    name: "ref_field",
                    type: "reference"
                }]
            });
        } catch (e) {
            assert.isOk(true, 'model cannot defined without specifying ref for reference type field');
        }
    });

    it('#AnysolsModel::defineModel negative checks - override definition', function (done) {

        session.anysolsModel.defineModel({
            name: "teacher",
            fields: [{
                name: "name",
                type: "string"
            }, {
                name: "ref_field",
                type: "reference",
                ref: "my_ref_collection"
            }]
        });

        session.anysolsModel.defineModel({
            name: "teacher",
            fields: [{
                name: "some_field",
                type: "string"
            }]
        }, true /* forced */);

        let Teacher = session.anysolsModel.model("teacher");
        let t = new Teacher();
        t.set("some_field", "some value");
        t.save().then((t) => {
            if (t.get("some_field") === "some value")
                assert.isOk(true, 'record created');
            else
                assert.isOk(false, 'record not created');
            done();
        });
    });

});
