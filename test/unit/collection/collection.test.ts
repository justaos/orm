import { assert } from 'chai';
import 'mocha';
import { ODM, Record } from '../../../src';
import { logger, MAX_TIMEOUT, Session } from '../../test.utils';

describe('Collection', () => {
  let odm: ODM;
  let johnRecord: Record;
  let johnObject;
  let EMPLOYEE_MODEL_NAME = 'employee';

  before(async function() {
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

  it('#Collection::getCollectionName', function() {
    this.timeout(MAX_TIMEOUT);
    let employeeCollection = odm.collection(EMPLOYEE_MODEL_NAME);
    assert.isOk(
      employeeCollection.getName() === EMPLOYEE_MODEL_NAME,
      'Invalid collection-service name'
    );
  });

  /**
   * CREATE
   */
  it('#Collection::insert', function(done) {
    this.timeout(MAX_TIMEOUT);
    let employeeCollection = odm.collection(EMPLOYEE_MODEL_NAME);
    let empRecord = employeeCollection.createNewRecord();
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
    empRecord.insert().then((rec: Record) => {
      johnRecord = rec;
      johnObject = rec.toObject();
      assert.isOk(
        johnObject._id + '' === empId,
        '_id is expected to be same as initialized value'
      );
      assert.isOk(johnObject.name === 'John', 'name is expected to be John');
      assert.isOk(johnObject.dynamic === 100, 'default is expected to be 100');
      done();
    });
  });

  it('#Collection::insert unique error', function(done) {
    this.timeout(MAX_TIMEOUT);
    let employeeCollection = odm.collection(EMPLOYEE_MODEL_NAME);
    let empRecord = employeeCollection.createNewRecord();
    empRecord.set('name', 'John');
    empRecord.insert().then(
      () => {
      },
      (err: any) => {
        done();
      }
    );
  });

  /**
   * CREATE
   */
  it('#Collection::update', function(done) {
    this.timeout(MAX_TIMEOUT);
    johnRecord.set('salary', 200);
    johnRecord.update().then(
      (rec) => {
        assert.isOk(rec.get('salary') === 200, 'record not updated');
        done();
      },
      (err) => {
        logger.logError(err);
      }
    );
  });

  /**
   * READ
   */
  it('#Collection::find', function(done) {
    this.timeout(MAX_TIMEOUT);
    let employeeCollection = odm.collection(EMPLOYEE_MODEL_NAME);
    employeeCollection
      .find()
      .toArray()
      .then((employees: Record[]) => {
        if (employees.length === 1) done();
      });
  });

  it('#Collection::findById ObjectId', function(done) {
    this.timeout(MAX_TIMEOUT);
    let employeeCollection = odm.collection(EMPLOYEE_MODEL_NAME);
    employeeCollection
      .findById(johnRecord.getID())
      .then((employee: Record | void) => {
        if (employee && employee.get('name') === 'John') done();
      });
  });

  it('#Collection::findById string', function(done) {
    this.timeout(MAX_TIMEOUT);
    let employeeCollection = odm.collection(EMPLOYEE_MODEL_NAME);
    employeeCollection
      .findById(johnRecord.getID())
      .then((employee: Record | void) => {
        if (employee && employee.get('name') === 'John') done();
      });
  });

  it('#Collection::findOne', function(done) {
    this.timeout(MAX_TIMEOUT);
    let employeeCollection = odm.collection(EMPLOYEE_MODEL_NAME);
    employeeCollection
      .findOne({ name: 'John' })
      .then((employee: Record | void) => {
        if (employee && employee.getID() === johnRecord.getID()) done();
      });
  });

  it('#Record::delete', function(done) {
    this.timeout(MAX_TIMEOUT);
    let employeeCollection = odm.collection(EMPLOYEE_MODEL_NAME);
    johnRecord.delete().then(() => {
      employeeCollection
        .findById(johnRecord.getID())
        .then((record: Record | void) => {
          if (!record) done();
        });
    });
  });

  /**
   * SORT
   */
  it('#Collection::Cursor::sort', function(done) {
    this.timeout(MAX_TIMEOUT);
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
    const rec = sortCollection.createNewRecord();
    rec.set('number', 2);
    rec.insert().then((rec: Record) => {
      rec = sortCollection.createNewRecord();
      rec.set('number', 1);
      rec.insert().then((rec: Record) => {
        sortCollection
          .find({})
          .sort([['number', 1]])
          .toArray()
          .then(function(recs: Record[]) {
            let expected = 1;
            recs.forEach(function(rec: Record) {
              assert.isOk(rec.get('number') == expected, 'Not expected value');
              expected++;
            });
            done();
          });
      });
    });
  });

  it('#Collection::Cursor::sort 2', function(done) {
    this.timeout(MAX_TIMEOUT);
    const sortCollection = odm.collection('sort_test');
    sortCollection
      .find({}, { sort: { number: 1 } })
      .toArray()
      .then(function(recs: Record[]) {
        let expected = 1;
        recs.forEach(function(rec: Record) {
          assert.isOk(rec.get('number') == expected, 'Not expected value');
          expected++;
        });
        done();
      });
  });

  it('#Collection::Aggregation', function(done) {
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
          assert.isOk(recs[0].count == 1, 'Not expected value');
          done();
        });
    });
  });
});

