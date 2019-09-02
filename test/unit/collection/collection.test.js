const {assert} = require('chai');
const {session, MAX_TIMEOUT} = require('../../test.utils');

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
                name: "eid",
                type: "integer"
            }, {
                name: "dob",
                type: "date"
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
        empRecord.set("eid", 100);
        empRecord.set("dob", new Date());
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
        johnRecord.set("eid", 200);
        johnRecord.update().then((rec) => {
            assert.isOk(rec.get("eid") === 200, 'record not updated');
            done();
        }, (err) => {
            console.log(JSON.stringify(err, null, 4));
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

