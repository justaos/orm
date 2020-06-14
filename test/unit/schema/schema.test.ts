import {assert} from "chai";
import "mocha";
import {ObjectId} from "mongodb"
import {MAX_TIMEOUT, session} from "../../test.utils";

describe('Schema', () => {


    let MODEL_NAME = "schema_test";
    let MODEL_EXTENDS = "schema_test_extends";

    it('#ODM::collection - negative check', function () {
        try {
            session.odm.collection('unknown_collection')
            assert.isOk(false, "Collection should not exists");
        } catch (e) {
            assert.isOk(true, "Collection should not exists");
        }
    });

    it('#ODM::defineCollection - simple', function () {
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

    it('#ODM::defineCollection - extends negative check', function () {
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

    it('#ODM::defineCollection - extends positive check', function () {
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

    it('#ODM::defineCollection - extends positive check', function () {
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

    it('#ODM::convertToObjectId', function () {
        const newId = session.odm.convertToObjectId('569ed8269353e9f4c51617aa');
        assert.isOk(ObjectId.isValid(newId), "Collection should not extend, final schema");
    });

});
