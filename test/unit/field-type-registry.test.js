const {assert} = require('chai');
const {session} = require('../test.utils');
const {StringDataType} = require("../../lib");

describe('FieldType', () => {

    const MODEL_NAME = "field_definition_test";
    const EMAIL_TYPE = "email";
    const EMAIL_FIELD = "email";
    const EMAIL_VALUE = "test@example.com";

    it('#FieldTypeRegistry::addFieldType Registering Custom field type', function () {

        session.anysolsODM.addFieldType({

            getDataType: function (fieldDefinition) {
                return new StringDataType({pattern: "(.+)@(.+){2,}\\.(.+){2,}"})
            },

            getType: function () {
                return "email"
            },

            validateDefinition: function (fieldDefinition) {
                return !!fieldDefinition.name
            }
        });

        try {
            session.anysolsODM.defineCollection({
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
        let collection = session.anysolsODM.collection(MODEL_NAME);
        let rec = collection.createNewRecord();
        rec.set("name", "RAM");
        rec.set(EMAIL_FIELD, EMAIL_VALUE);
        rec.insert().then(function (rec) {
            collection.find({[EMAIL_FIELD]: EMAIL_VALUE}).toArray().then(function (records) {
                if (records.length === 1 && records[0].get(EMAIL_FIELD) === EMAIL_VALUE)
                    done();
            });
        }, function (e) {
            console.error(JSON.stringify(e));
        });
    });


    it('#FieldTypeRegistry::registerFieldType trying create invalid field', function () {
        try {
            session.anysolsODM.defineCollection({
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
