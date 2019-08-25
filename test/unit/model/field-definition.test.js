const {StringDataType, DataType} = require("../../../lib/model");

const {assert} = require('chai');
const {session} = require('../../test.utils');

describe('FieldType', () => {

    const MODEL_NAME = "field_definition_test";
    const CUSTOM_FIELD_NAME = "custom_field_name";
    const CUSTOM_FIELD_TYPE = "custom_field_type";

    it('#FieldTypeRegistry::addFieldType Registering Custom field type', function () {

        class EmailType {

            transform() {
                return new StringDataType()
            }

            getType() {
                return "string"
            }
        }

        try {
            session.anysolsModel.defineModel({
                name: MODEL_NAME,
                fields: [{
                    name: 'name',
                    type: 'string'
                }, {
                    name: 'email',
                    type: 'email'
                }]
            });
            assert.isOk(true, "Custom field defined as expected");
        } catch (e) {
            console.error(e);
            assert.isOk(false, "Custom field not defined as expected");
        }

    });


    it('#FieldTypeRegistry::registerFieldType creating record with custom field type', function (done) {
        let model = session.anysolsModel.model(MODEL_NAME);
        let rec = model.initializeRecord();
        rec.set("name", "RAM");
        rec.set(CUSTOM_FIELD_NAME, "testing");
        rec.insert().then(function (rec) {
             model.find({"custom_field_name": "testing"}).execute().then(function (docs) {
                 if (docs[0].get('name') === "RAM")
                     done();
             });
        });
    });


    /*it('#FieldTypeRegistry::registerFieldType trying create invalid field', function () {
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
    });*/


});
