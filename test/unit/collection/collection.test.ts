import { afterAll, assert, beforeAll, describe, it } from '../../test.deps.ts';

import { ODM, Record } from '../../../mod.ts';
import { Session } from '../../test.utils.ts';
import { assertEquals } from 'https://deno.land/std@0.165.0/testing/asserts.ts';

describe({
  name: 'Collection',
  sanitizeResources: false,
  sanitizeOps: false,
  fn: () => {
    let odm: ODM;
    let johnRecord: Record;
    let johnObject;
    const EMPLOYEE_MODEL_NAME = 'employee';

    beforeAll(async () => {
      odm = await Session.getODMByForce();

      odm.defineCollection({
        name: EMPLOYEE_MODEL_NAME,
        fields: [
          {
            name: 'name',
            type: 'string',
            unique: true
          },
          {
            name: 'emp_no',
            type: 'objectId'
          },
          {
            name: 'salary',
            maximum: 10000,
            type: 'integer'
          },
          {
            name: 'birth_date',
            type: 'date'
          },
          {
            name: 'created_on',
            type: 'datetime'
          },
          {
            name: 'gender',
            type: 'boolean'
          },
          {
            name: 'dynamic',
            type: 'any',
            default_value: 100
          },
          {
            name: 'address',
            type: 'object'
          },
          {
            name: 'rating',
            type: 'number'
          }
        ]
      });
    });

    afterAll(async () => {
      await Session.getODM().closeConnection();
    });

    it('#Collection::getCollectionName', function() {
      const employeeCollection = odm.collection(EMPLOYEE_MODEL_NAME);
      assert(
        employeeCollection.getName() === EMPLOYEE_MODEL_NAME,
        'Invalid collection-service name'
      );
    });

    /**
     * CREATE
     */
    it('#Collection::insert', async () => {
      const employeeCollection = odm.collection(EMPLOYEE_MODEL_NAME);
      const empRecord = employeeCollection.createNewRecord();
      const empId = empRecord.getID();
      empRecord.set('name', 'John');
      empRecord.set('emp_no', odm.generateObjectId());
      empRecord.set('birth_date', new Date());
      empRecord.set('created_on', new Date());
      empRecord.set('gender', true);
      empRecord.set('salary', 5000);
      empRecord.set('rating', 4.5);
      empRecord.set('address', {
        street: 'test',
        zipcode: 500000
      });
      const rec = await empRecord.insert();

      johnRecord = rec;
      johnObject = rec.toObject();
      assert(
        johnObject._id + '' === empId,
        '_id is expected to be same as initialized value'
      );
      assert(johnObject.name === 'John', 'name is expected to be John');
      assert(johnObject.dynamic === 100, 'default is expected to be 100');

    });

    it('#Collection::insert unique error', async () => {
      const employeeCollection = odm.collection(EMPLOYEE_MODEL_NAME);
      const empRecord = employeeCollection.createNewRecord();
      empRecord.set('name', 'John');
      try {
        await empRecord.insert();
        assert(false, 'duplicate key error expected');
      } catch (error) {
        assert(true, 'duplicate key error');
      }
    });

    /**
     * UPDATE
     */
    it('#Collection::update', async () => {
      johnRecord.set('salary', 200);
      try {
        const rec = await johnRecord.update();
        assert(rec.get('salary') === 200, 'record not updated');
      } catch (error) {
        assert(false, 'duplicate key error');
      }
    });


    /**
     * READ
     */
    it('#Collection::find', async () => {
      const employeeCollection = odm.collection(EMPLOYEE_MODEL_NAME);
      const employees: Record[] = await employeeCollection
        .find()
        .toArray();
      assertEquals(employees.length, 1);
    });


    it('#Collection::findById ObjectId', async () => {
      const employeeCollection = odm.collection(EMPLOYEE_MODEL_NAME);
      const employee: Record | undefined = await employeeCollection
        .findById(johnRecord.get('_id'));
      assert(!!employee && employee.get('name') === 'John');
    });

    it('#Collection::findById string', async () => {
      const employeeCollection = odm.collection(EMPLOYEE_MODEL_NAME);
      const employee: Record | undefined = await employeeCollection
        .findById(johnRecord.getID());
      assert(!!employee && employee.get('name') === 'John');
    });

    it('#Collection::findOne', async () => {
      const employeeCollection = odm.collection(EMPLOYEE_MODEL_NAME);
      const employee: Record | undefined = await employeeCollection
        .findOne({ name: 'John' });
      assert(!!employee && employee.getID() === johnRecord.getID());
    });

    it('#Record::delete', async () => {

      const employeeCollection = odm.collection(EMPLOYEE_MODEL_NAME);
      await johnRecord.delete();
      const employee: Record | undefined = await employeeCollection
        .findById(johnRecord.getID());
      assert(!employee);
    });


    /**
     * SORT
     */
    it('#Collection::Cursor::sort', async () => {
      odm.defineCollection({
        name: 'sort_test',
        fields: [
          {
            name: 'number',
            type: 'integer'
          }
        ]
      });
      const sortCollection = odm.collection('sort_test');
      let rec = sortCollection.createNewRecord();
      rec.set('number', 2);
      await rec.insert();
      rec = sortCollection.createNewRecord();
      rec.set('number', 1);
      await rec.insert();
      const recs: Record[] = await sortCollection
        .find({})
        .sort([['number', 1]])
        .toArray();
      let expected = 1;
      recs.forEach(function(rec: Record) {
        assert(rec.get('number') == expected, 'Not expected value');
        expected++;
      });
    });

    /*
    it('#Collection::Cursor::sort 2', async () => {
      this.timeout(MAX_TIMEOUT);
      const sortCollection = odm.collection('sort_test');
      sortCollection
        .find({}, { sort: { number: 1 } })
        .toArray()
        .then(function(recs: Record[]) {
          let expected = 1;
          recs.forEach(function(rec: Record) {
            assert( rec.get('number') == expected, 'Not expected value');
            expected++;
          });
          done();
        });
    });

    it('#Collection::Aggregation', async () => {
      this.timeout(MAX_TIMEOUT);
      const employeeCollection = odm.collection(EMPLOYEE_MODEL_NAME);
      let empRecord = employeeCollection.createNewRecord();
      const empId = empRecord.getID();
      empRecord.set('name', 'John');
      empRecord.set('emp_no', odm.generateObjectId());
      empRecord.set('birth_date', new Date().toISOString());
      empRecord.set('created_on', new Date().toISOString());
      empRecord.set('gender', true);
      empRecord.set('salary', 5000);
      empRecord.set('rating', 4.5);
      empRecord.set('address', {
        street: 'test',
        zipcode: 500000
      });
      empRecord.insert().then(() => {
        employeeCollection
          .aggregate([{
            $group: {
              _id: '$name',
              count: { $count: {} }
            }
          }])
          .toArray()
          .then(function(recs: any[]) {
            console.log(recs);
            assert( recs[0].count == 1, 'Not expected value');
            done();
          });
      });
    });*/
  }
});

