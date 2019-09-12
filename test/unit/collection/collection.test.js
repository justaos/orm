const {ObjectId} = require('mongodb');
const {assert} = require('chai');
const {session, MAX_TIMEOUT, logger} = require('../../test.utils');

describe('AnysolsCollection', () => {


    let johnRecord;
    let johnObject;
    let MODEL_NAME = "employee";

    before(function () {
        session.anysolsODM.defineCollection({
            name: MODEL_NAME,
            fields: [{
                name: 'name',
                type: 'string'
            }, {
                name: "emp_no",
                type: "objectId"
            }, {
                name: "salary",
                type: "integer"
            }, {
                name: "birth_date",
                type: "date"
            }, {
                name: "gender",
                type: "boolean"
            }, {
                name: "address",
                type: "object"
            }]
        });
    });

    it('#AnysolsCollection::getCollectionName', function () {
        this.timeout(MAX_TIMEOUT);
        let employeeCollection = session.anysolsODM.collection(MODEL_NAME);
        assert.isOk(employeeCollection.getName() === MODEL_NAME, 'Invalid collection-service name');
    });

    /**
     * CREATE
     */
    it('#AnysolsCollection::insert', function (done) {
        this.timeout(MAX_TIMEOUT);
        let employeeCollection = session.anysolsODM.collection(MODEL_NAME);
        let empRecord = employeeCollection.createNewRecord();
        empRecord.set("name", "John");
        empRecord.set("emp_no",  new ObjectId());
        empRecord.set("birth_date", new Date());
        empRecord.set("gender", true);
        empRecord.set("salary", 10000);
        empRecord.set("address", {
            "street": "test",
            "zipcode": 500000
        });
        empRecord.insert().then((rec) => {
            johnRecord = rec;
            johnObject = rec.toObject();
            assert.isOk(johnObject.name === 'John', 'record not created');
            done();
        });
    });

    /**
     * CREATE
     */
    it('#AnysolsCollection::update', function (done) {
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
    it('#AnysolsCollection::find', function (done) {
        this.timeout(MAX_TIMEOUT);
        let employeeCollection = session.anysolsODM.collection(MODEL_NAME);
        employeeCollection.find().toArray().then((employees) => {
            if (employees.length === 1)
                done();
        });
    });

    it('#AnysolsCollection::findById', function (done) {
        this.timeout(MAX_TIMEOUT);
        let employeeCollection = session.anysolsODM.collection(MODEL_NAME);
        employeeCollection.findById(johnRecord.getID()).then((employee) => {
            if (employee.get('name') === "John")
                done();
        });
    });

    it('#AnysolsCollection::findOne', function (done) {
        this.timeout(MAX_TIMEOUT);
        let employeeCollection = session.anysolsODM.collection(MODEL_NAME);
        employeeCollection.findOne({"name": "John"}).then((employee) => {
            if (employee.getID().toString() === johnRecord.getID().toString())
                done();
        });
    });

    it('#Record::delete', function (done) {
        this.timeout(MAX_TIMEOUT);
        let employeeCollection = session.anysolsODM.collection(MODEL_NAME);
        johnRecord.delete().then(() => {
            employeeCollection.findById(johnRecord.getID()).then((record) => {
                if (!record)
                    done();
            })
        })
    });

});

