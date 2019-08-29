const {assert} = require('chai');
const {session, MAX_TIMEOUT} = require('../../test.utils');

describe('AnysolsCollection', () => {


    let johnRecord;
    let johnObject;
    let MODEL_NAME = "employee";

    it('#AnysolsCollection::insert', function (done) {
        this.timeout(5000);
        session.anysolsODM.defineCollection({
            name: MODEL_NAME,
            fields: [{
                name: 'name',
                type: 'string'
            }, {
                name: "eid",
                type: "integer"
            }]
        });

        let employeeCollection = session.anysolsODM.collection(MODEL_NAME);
        let empRecord = employeeCollection.createNewRecord();
        empRecord.set("name", "John");
        empRecord.set("eid", 100);
        empRecord.insert().then((rec) => {
            johnRecord = rec;
            johnObject = rec.toObject();
            if (johnObject.name === 'John') {
                assert.isOk(true, 'record created');
            } else
                assert.isOk(false, 'record not created');
            done();
        });
    });

    it('#AnysolsCollection::getCollectionName', function () {
        this.timeout(MAX_TIMEOUT);
        let employeeCollection = session.anysolsODM.collection(MODEL_NAME);
        assert.isOk(employeeCollection.getName() === MODEL_NAME, 'Invalid collection-service name');
    });

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
        employeeCollection.findOne({"name" : "John"}).then((employee) => {
            if (employee.getID().toString() === johnRecord.getID().toString())
                done();
        });
    });

  /*  it('#record remove only selected', function (done) {
        this.timeout(MAX_TIMEOUT);
        let employeeCollection = session.anysolsODM.collection(MODEL_NAME);
        johnRecord.delete().then(() => {
            employeeCollection.findById(johnRecord.getID()).then((record) => {
                if (!record)
                    done();
            })
        })
    });*/

    /*it('#AnysolsCollection::findOne', function (done) {
        this.timeout(MAX_TIMEOUT);
        let Employee = session.anysolsODM.collection-service(MODEL_NAME);
        Employee.findOne({name: johnObject.name}).exec().then((employee) => {
            if (johnObject.id + "" === employee.getID() + "")
                done();

        });
    });



    it('#AnysolsCollection::findOneAndUpdate', function (done) {
        this.timeout(MAX_TIMEOUT);
        let Employee = session.anysolsODM.collection-service(MODEL_NAME);
        Employee.findOneAndUpdate({name: johnObject.name}, {eid: 200}).then((employee) => {
            Employee.findById(johnObject.id).exec().then((employee) => {
                if (employee.get("eid") === 200)
                    done();

            });
        });
    });

   */
});

