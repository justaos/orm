import { assert } from 'https://deno.land/std@0.135.0/testing/asserts.ts';
import { afterAll, beforeAll, describe, it } from 'https://deno.land/std@0.166.0/testing/bdd.ts';
import { Session } from '../../test.utils.ts';
import { ODM } from '../../../mod.ts';

describe('Schema', {
  sanitizeResources: false,
  sanitizeOps: false
}, () => {
  let odm: ODM;

  let MODEL_NAME = 'schema_test';
  let MODEL_EXTENDS = 'schema_test_extends';

  beforeAll(async () => {
    odm = await Session.getODMByForce();
  });

  afterAll(async () => {
    await Session.getODM().closeConnection();
  });

  it('#ODM::collection - negative check', function() {
    try {
      odm.collection('unknown_collection');
      assert(false, 'Collection should not exists');
    } catch (e) {
      assert(true, 'Collection should not exists');
    }
  });

  it('#ODM::defineCollection - simple', function() {

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
    assert(true, 'Collection not create as expected');
  });

  it('#ODM::defineCollection - extends negative check', function() {

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
    assert(true, 'Collection should get extended');
  });

  it('#ODM::defineCollection - extends positive check', function() {

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
    assert(assertValue, 'Collection should not extend, final schema');
  });

  /* it('#ODM::collection - normal schema record', async () => {

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

       let assertValue = false;
       try {
           const extendsCol = odm.collection(MODEL_EXTENDS);
           const extendsRec = extendsCol.createNewRecord();
           await extendsRec.insert();
       } catch (err) {
           assertValue = true;
       }
        assertEquals(assertValue, true);
   });

   it('#Collection::find extends', async () => {

       let employeeCollection = odm.collection(MODEL_EXTENDS);
       const employees: Record[] = await employeeCollection
         .find()
         .toArray();
       assertEquals(employees.length, 1)
   });

   it('#Collection::find normal', async () => {
       let employeeCollection = odm.collection(MODEL_NAME);
       employeeCollection
         .find()
         .toArray()
         .then((employees: Record[]) => {
             assertEquals(employees.length, 2);
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
   });*/
});

