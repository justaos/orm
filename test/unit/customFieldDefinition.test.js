const {FieldDefinition, MONGOOSE_TYPES} = require("../../lib");
const {assert} = require('chai');
const testSession = require('../session.test');

describe('FieldDefinition test', () => {

    it('#Custom field registry test', function (done) {
        testSession.anysolsModel.registerFieldDefinition(new FieldDefinition("customType", field => {
            return true
        }, function (field, fieldDefinition) {
            return {
                type: MONGOOSE_TYPES.STRING
            }
        }));

        testSession.anysolsModel.defineModel({
            name: 'custom_field_test',
            fields: [{
                name: 'name',
                type: 'string'
            }, {
                name: 'custom_field',
                type: 'customType'
            }]
        });

        let CustomFieldTest = testSession.anysolsModel.model("custom_field_test");
        let s = new CustomFieldTest();
        s.set("name", "John");
        s.set("custom_field", "testing");
        s.save().then(function () {
            CustomFieldTest.findOne({"custom_field": "testing"}).exec().then(function (result) {
                if (result)
                    done();
            });
        });
    });

});
