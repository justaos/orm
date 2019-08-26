const {StringDataType, DataType} = require("../../../lib");

const {assert} = require('chai');
const {session} = require('../../test.utils');

describe('FieldType', () => {

    const MODEL_NAME = "field_definition_test";
    const EMAIL_TYPE = "email";
    const EMAIL_FIELD = "email";
    const EMAIL_VALUE = "test@example.com";

    it('#FieldTypeRegistry::addFieldType Registering Custom field type', function () {

        class EmailType {

            getDataType(fieldDefinition) {
                return new StringDataType({pattern: "(.+)@(.+){2,}\\.(.+){2,}"})
            }

            getType() {
                return EMAIL_TYPE
            }

            validateDefinition(fieldDefinition) {
                return !!fieldDefinition.name
            }
        }

        session.anysolsModel.addFieldType(new EmailType());

        try {
            session.anysolsModel.defineModel({
                name: MODEL_NAME,
                fields: [{
                    name: 'name',
                    type: 'string'
                }, {
                    name: EMAIL_FIELD,
                    type: EMAIL_TYPE
                }]
            });
            assert.isOk(true, "Custom field defined as expected");
        } catch (e) {
            console.error(JSON.stringify(e));
            assert.isOk(false, "Custom field not defined as expected");
        }

    });


    it('#FieldTypeRegistry::registerFieldType creating record with custom field type', function (done) {
        let model = session.anysolsModel.model(MODEL_NAME);
        let rec = model.initializeRecord();
        rec.set("name", "RAM");
        rec.set(EMAIL_FIELD, EMAIL_VALUE);
        rec.insert().then(function (rec) {
            model.find({[EMAIL_FIELD]: EMAIL_VALUE}).execute().then(function (docs) {
                if (docs.length === 1 && docs[0].get(EMAIL_FIELD) === EMAIL_VALUE)
                    done();
            });
        }, function (e) {
            console.error(JSON.stringify(e));
        });
    });


    it('#FieldTypeRegistry::registerFieldType trying create invalid field', function () {
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
