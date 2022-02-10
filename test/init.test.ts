import {assert} from "chai";
import "mocha";
import {ODM} from "../src";
import {session, MAX_TIMEOUT} from "./test.utils";

describe('Initial test setup', () => {

    it('#connect()', function (done) {
        this.timeout(MAX_TIMEOUT);
        session.odm = new ODM();
        session.odm.connect({
            "host": "127.0.0.1",
            "port": "27017",
            "database": "odm-test-db",
            "dialect": "mongodb",
        }).then(() => {
            assert.isOk(true, 'connection established');
            session.odm.defineCollection({
                name: "employees",
                fields: [{
                    name: 'name',
                    type: 'string',
                    unique: true
                }, {
                    name: "emp_no",
                    type: "objectId"
                }, {
                    name: "salary",
                    maximum: 10000,
                    type: "integer"
                }, {
                    name: "birth_date",
                    type: "date"
                }, {
                    name: "created_on",
                    type: "datetime"
                },{
                    name: "gender",
                    type: "boolean"
                },{
                    name: "dynamic",
                    type: "any",
                    default_value: 100
                }, {
                    name: "address",
                    type: "object"
                }]
            });

            let employeeCollection = session.odm.collection("employees");
            let empRecord = employeeCollection.createNewRecord();
            empRecord.insert().then(function() {
                done();
            });


        }, () => {
            assert.isOk(false, 'connection failed');
            done();
        });
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
