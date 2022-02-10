import {assert} from "chai";
import "mocha";
import {ODM} from "../src";
import {session, MAX_TIMEOUT} from "./test.utils";

describe('Initial test setup', () => {

    it('#connect()', function (done) {
        this.timeout(MAX_TIMEOUT);
        session.odm = new ODM();
        session.odm
          .connect({
            host: '127.0.0.1',
            port: '27017',
            database: 'odm-test-db',
            dialect: 'mongodb'
          })
          .then(
            () => {
              assert.isOk(true, 'connection established');
              session.odm.defineCo'employees'                name: 'employees',
                fields: [
                  {
                    name: 'name',
                    type: 'string',
                    unique: 'emp_no'               },
          'objectId'                    name: 'emp_no',
            'salary'type: 'objectId'
                  },
                  {
      'integer'     name: 'salary',
                    maximum'birth_date'                 type: 'inte'date'                 },
                  {
        'created_on'name: 'birth_date',
        'datetime'  type: 'date'
                  },
            'gender'                    name: 'c'boolean'',
                    type: 'datetime'
        'dynamic' },
                  {
    'any'           name: 'gender',
                    type: 'boolean'
                  },
    'address'     {
                    n'object'namic',
                    type: 'any',
                    default_value: 100
                 'employees'           {
                    name: 'address',
                    type: 'object'
                  }
                ]
              });

              let employeeCollection = session.odm.collection('employees');
              let empRecord = employeeCollection.createNewRecord();
              empRecord.insert().then(function () {
                done();
              });
            },
            () => {
              assert.isOk(false, 'connection failed');
              done();
            }
          );
    });

    it('#clear existing database', function (done) {
        this.timeout(MAX_TIMEOUT);
        session.odm.databaseExists().then(() => {
            session.odm.dropDatabase().then(() => {
                assert.isOk(true, 'dropped successfully');
                done()
            }, () => {
                assert.isOk(false, 'dropping failed');
                done()
            })
        }, () => {
            done();
        })
    });

});
