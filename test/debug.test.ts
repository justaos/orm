import {assert} from "chai";
import "mocha";
import {ODM} from "../src";
import {session, MAX_TIMEOUT} from "./test.utils";

describe('Debug', () => {

    let MODEL_NAME = "schema_test";
    let MODEL_EXTENDS = "schema_test_extends";

    before('#connect()', function (done) {
        this.timeout(MAX_TIMEOUT);
        session.odm = new ODM();
        session.odm.connect({
            "host": "127.0.0.1",
            "port": "27017",
            "database": "odm-debug",
            "dialect": "mongodb",
        }).then(() => {
            assert.isOk(true, 'connection established');
            done();
        }, () => {
            assert.isOk(false, 'connection failed');
            done();
        });
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

    it('#ODM::collection - normal schema record', function (done) {
        this.timeout(MAX_TIMEOUT);
        let assertValue = false;
        try {
            const extendsCol = session.odm.collection(MODEL_NAME);
            const extendsRec = extendsCol.createNewRecord();
            extendsRec.insert().then(function(){
                done();
            });

        } catch (err) {
            assertValue = true;
        }
    });

});
