const {FieldDefinition, MONGOOSE_TYPES} = require("../../../index");
const {assert} = require('chai');
const {session} = require('../../test.utils');

describe('FieldDefinition', () => {

    const MODEL_NAME = "field_definition_test";
    const CUSTOM_FIELD_NAME = "custom_field_name";
    const CUSTOM_FIELD_TYPE = "custom_field_type";

    it('#FieldDefinitionRegistry::registerFieldDefinition Registering Custom field type', function () {

        session.anysolsModel.registerFieldDefinition(new FieldDefinition(CUSTOM_FIELD_TYPE, field => {
            return true
        }, function (field, fieldDefinition) {
            return {
                type: MONGOOSE_TYPES.STRING
            }
        }));

        try {
            session.anysolsModel.defineModel({
                name: MODEL_NAME,
                fields: [{
                    name: 'name',
                    type: 'string'
                }, {
                    name: CUSTOM_FIELD_NAME,
                    type: CUSTOM_FIELD_TYPE
                }]
            });
            assert.isOk(true, "Custom field defined as expected");
        } catch (e) {
            assert.isOk(false, "Custom field not defined as expected");
        }
    });

    it('#FieldDefinitionRegistry::registerFieldDefinition creating record with custom field type', function (done) {
        let CustomFieldTest = session.anysolsModel.model(MODEL_NAME);
        let s = new CustomFieldTest();
        s.set("name", "RAM");
        s.set(CUSTOM_FIELD_NAME, "testing");
        s.save().then(function () {
            CustomFieldTest.findOne({"custom_field_name": "testing"}).exec().then(function (result) {
                if (result)
                    done();
            });
        });
    });


    it('#FieldDefinitionRegistry::registerFieldDefinition trying create invalid field', function () {
        try {
            session.anysolsModel.defineModel({
                name: 'field_definition_invalid_test',
                fields: [{
                    name: 'name',
                    type: 'string'
                }, {
                    name: 'custom_field',
                    type: 'invalid_field_type'
                }]
            });
            assert.isOk(false, "Able to create, not defined field type element");
        } catch (e) {
            assert.isOk(true, "Invalid field type element not created as expected");
        }
    });


});
