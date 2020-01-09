const {assert} = require('chai');
const {session, MAX_TIMEOUT} = require('../../test.utils');

describe('Collection', () => {


    let MODEL_NAME = "schema_test";
    let MODEL_EXTENDS = "schema_test_extends";

    it('#Collection::collection - negative check', function () {
        assert.isOk(session.odm.collection('unknown_collection') === undefined, "Collection should not exists");
    });

    it('#Collection::defineCollection - simple', function () {
        this.timeout(MAX_TIMEOUT);
        session.odm.defineCollection({
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

    it('#Collection::defineCollection - extends negative check', function () {
        this.timeout(MAX_TIMEOUT);
        let assertValue = false;
        try {
            session.odm.defineCollection({
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

    it('#Collection::defineCollection - extends positive check', function () {
        this.timeout(MAX_TIMEOUT);
        session.odm.defineCollection({
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

    it('#Collection::defineCollection - extends positive check', function () {
        this.timeout(MAX_TIMEOUT);
        let assertValue = false;
        try {
            session.odm.defineCollection({
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
