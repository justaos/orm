/*
import { assertEquals, assert } from 'https://deno.land/std@0.107.0/testing/asserts.ts';
import {
    describe,
    it
} from 'https://deno.land/x/test_suite@v0.8.0/mod.ts';
import {ODM} from "../src";
import {Session, MAX_TIMEOUT} from "./test.utils";

describe('Debug', () => {
    let odm: ODM;
    let MODEL_NAME = "schema_test";
    let MODEL_EXTENDS = "schema_test_extends";

    before('#connect()', async async () => {
        this.timeout(MAX_TIMEOUT);
        odm = await Session.getODMByForce();
    });

    after('#disconnect()', async async () => {
        odm.closeConnection();
    });

    it('#ODM::defineCollection - simple', function () {
        this.timeout(MAX_TIMEOUT);
        odm.defineCollection({
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
        assert( true, "Collection not create as expected");
    });


    it('#ODM::defineCollection - extends positive check', function () {
        this.timeout(MAX_TIMEOUT);
        odm.defineCollection({
            name: MODEL_EXTENDS,
            extends: MODEL_NAME,
            final: true,
            fields: [{
                name: 'address',
                type: 'string'
            }]
        });
        assert( true, "Collection should get extended");
    });

    it('#ODM::collection - normal schema record', async () => {
        this.timeout(MAX_TIMEOUT);
        let assertValue = false;
        try {
            const extendsCol = odm.collection(MODEL_NAME);
            const extendsRec = extendsCol.createNewRecord();
            extendsRec.insert().then(function(){
                done();
            });

        } catch (err) {
            assertValue = true;
        }
    });

});
*/
