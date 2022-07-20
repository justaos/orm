/*
import { assertEquals, assert } from 'https://deno.land/std@0.107.0/testing/asserts.ts';
import {
    describe,
    it
} from 'https://deno.land/x/test_suite@v0.8.0/mod.ts';
import { MAX_TIMEOUT, Session } from '../../test.utils.ts';
import { ODM, Record, ObjectId } from '../../../mod.ts';

describe('Schema', () => {
    let odm: ODM;

    let MODEL_NAME = 'schema_test';
    let MODEL_EXTENDS = 'schema_test_extends';

    before(async () => {
        odm = await Session.getODMByForce();
    });

    it('#ODM::collection - negative check', function() {
        try {
            odm.collection('unknown_collection');
            assert( false, 'Collection should not exists');
        } catch (e) {
            assert( true, 'Collection should not exists');
        }
    });

    it('#ODM::defineCollection - simple', function() {
        this.timeout(MAX_TIMEOUT);
        odm.defineCollection({
            name: MODEL_NAME,
            fields: [
                {
                    name: 'name',
                    type: 'string'
                },
                {
                    name: 'eid',
                    type: 'integer'
                },
                {
                    name: 'dob',
                    type: 'date'
                },
                {
                    name: 'gender',
                    type: 'boolean'
                }
            ]
        });
        assert( true, 'Collection not create as expected');
    });

    it('#ODM::defineCollection - extends negative check', function() {
        this.timeout(MAX_TIMEOUT);
        let assertValue = false;
        try {
            odm.defineCollection({
                name: MODEL_EXTENDS,
                extends: MODEL_NAME,
                final: true,
                fields: [
                    {
                        name: 'name',
                        type: 'string'
                    }
                ]
            });
        } catch (err) {
            assertValue = true;
        }
        assert( 
          assertValue,
          'Collection should not get extended, with name fields'
        );
    });

    it('#ODM::defineCollection - extends positive check', function() {
        this.timeout(MAX_TIMEOUT);
        odm.defineCollection({
            name: MODEL_EXTENDS,
            extends: MODEL_NAME,
            final: true,
            fields: [
                {
                    name: 'address',
                    type: 'string'
                }
            ]
        });
        assert( true, 'Collection should get extended');
    });

    it('#ODM::defineCollection - extends positive check', function() {
        this.timeout(MAX_TIMEOUT);
        let assertValue = false;
        try {
            odm.defineCollection({
                name: 'EXTEND_FINAL',
                extends: MODEL_EXTENDS,
                fields: [
                    {
                        name: 'address',
                        type: 'string'
                    }
                ]
            });
        } catch (err) {
            assertValue = true;
        }
        assert( assertValue, 'Collection should not extend, final schema');
    });

    it('#ODM::collection - normal schema record', async () => {
        this.timeout(MAX_TIMEOUT);
        let assertValue = false;
        try {
            const extendsCol = odm.collection(MODEL_NAME);
            const extendsRec = extendsCol.createNewRecord();
            extendsRec.insert().then(function() {
                done();
            });
        } catch (err) {
            assertValue = true;
        }
    });

    it('#ODM::collection - extends schema record', async () => {
        this.timeout(MAX_TIMEOUT);
        let assertValue = false;
        try {
            const extendsCol = odm.collection(MODEL_EXTENDS);
            const extendsRec = extendsCol.createNewRecord();
            extendsRec.insert().then(function() {
                done();
            });
        } catch (err) {
            assertValue = true;
        }
    });

    it('#Collection::find extends', async () => {
        this.timeout(MAX_TIMEOUT);
        let employeeCollection = odm.collection(MODEL_EXTENDS);
        employeeCollection
          .find()
          .toArray()
          .then((employees: Record[]) => {
              if (employees.length === 1) done();
          });
    });

    it('#Collection::find normal', async () => {
        this.timeout(MAX_TIMEOUT);
        let employeeCollection = odm.collection(MODEL_NAME);
        employeeCollection
          .find()
          .toArray()
          .then((employees: Record[]) => {
              if (employees.length === 2) done();
          });
    });

    it('#ODM::convertToObjectId', function() {
        const newId = odm.generateObjectId('569ed8269353e9f4c51617aa');
        assert( 
          ObjectId.isValid(newId),
          'Collection should not extend, final schema'
        );
    });

    it('#ODM::defineCollection - unknown field type', function() {
        this.timeout(MAX_TIMEOUT);
        try {
            odm.defineCollection({
                name: 'unknown',
                fields: [
                    {
                        name: 'unknown',
                        type: 'unknown'
                    }
                ]
            });
        } catch(e) {
            assert( true, 'Collection not create as expected');
        }
    });
});
*/
