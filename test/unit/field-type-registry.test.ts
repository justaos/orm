import {assert} from "chai";
import "mocha";
import {Record, StringDataType} from "../../src";
import {session} from "../test.utils";
import {getLoggerInstance} from "../../src/utils";
import Schema from "../../src/collection/Schema";

const logger = getLoggerInstance("FieldType");

describe('FieldType', () => {

    const MODEL_NAME = "field_definition_test";
    const EMAIL_TYPE = "email";
    const EMAIL_FIELD = "email";
    const EMAIL_VALUE = "test@example.com";

    it('#FieldTypeRegistry::addFieldType Registering Custom field type', function () {

        session.odm.addFieldType({

            getDataType: function (fieldDefinition: any) {
                return new StringDataType()
            },

            getType: function () {
                return "email"
            },

            validateValue(fieldDefinition: any, value: any) {
                const pattern = "(.+)@(.+){2,}\\.(.+){2,}";
                if (!new RegExp(pattern).test(value))
                    throw new Error("Not a valid email");
            },

            validateDefinition: function (fieldDefinition: any) {
                return !!fieldDefinition.name
            },

            getValueIntercept(schema: Schema, fieldDefinition: any, value: any): any {
                return value;
            },

            setValueIntercept(schema: Schema, fieldDefinition: any, value: any): any {
                return value;
            }
        });

        try {
            session.odm.defineCollection({
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
        } catch (err) {
            console.error(err);
            assert.isOk(false, "Custom field not defined as expected");
        }

    });


    it('#FieldTypeRegistry::registerFieldType creating record with custom field type', function (done) {
        let collection = session.odm.collection(MODEL_NAME);
        let rec = collection.createNewRecord();
        rec.set("name", "RAM");
        rec.set(EMAIL_FIELD, EMAIL_VALUE);
        rec.insert().then(function (rec: Record) {
            collection.find({[EMAIL_FIELD]: EMAIL_VALUE}).toArray().then(function (records: Record[]) {
                if (records.length === 1 && records[0].get(EMAIL_FIELD) === EMAIL_VALUE)
                    done();
            });
        }, function (err: Error) {
            logger.logError(err);
        });
    });


    it('#FieldTypeRegistry::registerFieldType trying create invalid field', function () {
        try {
            session.odm.defineCollection({
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
        } catch (err) {
            assert.isOk(true, "Invalid field type element not created as expected");
        }
    });


});
