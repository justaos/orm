const {assert} = require('chai');
const {session, MAX_TIMEOUT} = require('../../test.utils');

describe('AnysolsCollection', () => {


    let MODEL_NAME = "schema_test";
    let MODEL_EXTENDS = "schema_test_extends";

    it('#AnysolsCollection::defineCollection - simple', function () {
        this.timeout(MAX_TIMEOUT);
        session.anysolsODM.defineCollection({
            name: MODEL_NAME,
            fields: [{
                name: 'name',
                type: 'string'
            }, {
                name: "eid",
                type: "integer"
            }, {
                name: "dob",
                type: "date"
            }, {
                name: "gender",
                type: "boolean"
            }]
        });
        assert.isOk(true, "Collection not create as expected");
    });

    it('#AnysolsCollection::defineCollection - extends negative check', function () {
        this.timeout(MAX_TIMEOUT);
        let assertValue = false;
        try {
            session.anysolsODM.defineCollection({
                name: MODEL_EXTENDS,
                extends: MODEL_NAME,
                final: true,
                fields: [{
                    name: 'name',
                    type: 'string'
                }]
            });
        } catch (err) {
            assertValue = true;
        }
        assert.isOk(assertValue, "Collection should not get extended, with name fields");
    });

    it('#AnysolsCollection::defineCollection - extends positive check', function () {
        this.timeout(MAX_TIMEOUT);
        session.anysolsODM.defineCollection({
            name: MODEL_EXTENDS,
            extends: MODEL_NAME,
            final: true,
            fields: [{
                name: 'address',
                type: 'string'
            }]
        });
        assert.isOk(true, "Collection should get extended");
    });

    it('#AnysolsCollection::defineCollection - extends positive check', function () {
        this.timeout(MAX_TIMEOUT);
        let assertValue = false;
        try {
            session.anysolsODM.defineCollection({
                name: "EXTEND_FINAL",
                extends: MODEL_EXTENDS,
                fields: [{
                    name: 'address',
                    type: 'string'
                }]
            });
        } catch (err) {
            assertValue = true;
        }
        assert.isOk(assertValue, "Collection should not extend, final schema");
    });

});
