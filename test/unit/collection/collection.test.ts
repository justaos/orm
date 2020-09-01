import {assert} from "chai";
import "mocha";
import {Record} from "../../../src";
import {session, MAX_TIMEOUT, logger} from "../../test.utils";

describe('Collection', () => {


    let johnRecord: Record;
    let johnObject;
    let MODEL_NAME = "employee";

    before(function () {
        session.odm.defineCollection({
            name: MODEL_NAME,
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
    });

    it('#Collection::getCollectionName', function () {
        this.timeout(MAX_TIMEOUT);
        let employeeCollection = session.odm.collection(MODEL_NAME);
        assert.isOk(employeeCollection.getName() === MODEL_NAME, 'Invalid collection-service name');
    });

    /**
     * CREATE
     */
    it('#Collection::insert', function (done) {
        this.timeout(MAX_TIMEOUT);
        let employeeCollection = session.odm.collection(MODEL_NAME);
        let empRecord = employeeCollection.createNewRecord();
        empRecord.set("name", "John");
        empRecord.set("emp_no", session.odm.generateNewObjectId());
        empRecord.set("birth_date", new Date().toISOString());
        empRecord.set("created_on", new Date().toISOString());
        empRecord.set("gender", true);
        empRecord.set("salary", 5000);
        empRecord.set("address", {
            "street": "test",
            "zipcode": 500000
        });
        empRecord.insert().then((rec: Record) => {
            johnRecord = rec;
            johnObject = rec.toObject();
            assert.isOk(johnObject.name === 'John', 'record not created');
            assert.isOk(johnObject.dynamic === 100, "default is expected to be 100");
            done();
        });
    });


    it('#Collection::insert unique error', function (done) {
        this.timeout(MAX_TIMEOUT);
        let employeeCollection = session.odm.collection(MODEL_NAME);
        let empRecord = employeeCollection.createNewRecord();
        empRecord.set('name', 'John');
        empRecord.insert().then(() => {

        }, () => {
            done();
        })
    });

    /**
     * CREATE
     */
    it('#Collection::update', function (done) {
        this.timeout(MAX_TIMEOUT);
        johnRecord.set("salary", 200);
        johnRecord.update().then((rec) => {
            assert.isOk(rec.get("salary") === 200, 'record not updated');
            done();
        }, (err) => {
            logger.logError(err);
        })
    });


    /**
     * READ
     */
    it('#Collection::find', function (done) {
        this.timeout(MAX_TIMEOUT);
        let employeeCollection = session.odm.collection(MODEL_NAME);
        employeeCollection.find().toArray().then((employees: Record[]) => {
            if (employees.length === 1)
                done();
        });
    });

    it('#Collection::findById ObjectId', function (done) {
        this.timeout(MAX_TIMEOUT);
        let employeeCollection = session.odm.collection(MODEL_NAME);
        employeeCollection.findById(johnRecord.getID()).then((employee: Record) => {
            if (employee.get('name') === "John")
                done();
        });
    });

    it('#Collection::findById string', function (done) {
        this.timeout(MAX_TIMEOUT);
        let employeeCollection = session.odm.collection(MODEL_NAME);
        employeeCollection.findById(johnRecord.getID()).then((employee: Record) => {
            if (employee.get('name') === "John")
                done();
        });
    });


    it('#Collection::findOne', function (done) {
        this.timeout(MAX_TIMEOUT);
        let employeeCollection = session.odm.collection(MODEL_NAME);
        employeeCollection.findOne({"name": "John"}).then((employee: Record) => {
            if (employee && employee.getID() === johnRecord.getID())
                done();
        });
    });

    it('#Record::delete', function (done) {
        this.timeout(MAX_TIMEOUT);
        let employeeCollection = session.odm.collection(MODEL_NAME);
        johnRecord.delete().then(() => {
            employeeCollection.findById(johnRecord.getID()).then((record: Record) => {
                if (!record)
                    done();
            })
        })
    });

    /**
     * SORT
     */
    it('#Collection::Cursor::sort', function (done) {
        this.timeout(MAX_TIMEOUT);
        session.odm.defineCollection({
            name: "sort_test",
            fields: [{
                name: 'number',
                type: 'integer'
            }]
        });
        const sortCollection = session.odm.collection("sort_test");
        const rec = sortCollection.createNewRecord();
        rec.set("number", 2);
        rec.insert().then((rec: Record) => {
            rec = sortCollection.createNewRecord();
            rec.set("number", 1);
            rec.insert().then((rec: Record) => {
                sortCollection.find({}).sort([['number', 1]]).toArray().then(function(recs: Record[]) {
                    let expected = 1;
                    recs.forEach(function(rec: Record){
                        assert.isOk(rec.get('number') == expected, "Not expected value");
                        expected++;
                    });
                    done();
                });


            });
        });
    });

});

