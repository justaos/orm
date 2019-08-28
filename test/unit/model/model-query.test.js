const {assert} = require('chai');
const {session, MAX_TIMEOUT} = require('../../test.utils');

describe('Collection', () => {


    let johnRecord;
    let johnObject;
    let MODEL_NAME = "employee";

    it('#Collection::insert', function (done) {
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
        let empRecord = employeeCollection.initializeRecord();
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

    it('#Collection::getCollectionName', function () {
        this.timeout(MAX_TIMEOUT);
        let employeeCollection = session.anysolsODM.collection(MODEL_NAME);
        assert.isOk(employeeCollection.getName() === MODEL_NAME, 'Invalid collection name');
    });

    it('#Collection::find', function (done) {
        this.timeout(MAX_TIMEOUT);
        let employeeCollection = session.anysolsODM.collection(MODEL_NAME);
        employeeCollection.find().execute().then((employees) => {
            if (employees.length === 1)
                done();
        });
    });

    it('#Collection::findById', function (done) {
        this.timeout(MAX_TIMEOUT);
        let employeeCollection = session.anysolsODM.collection(MODEL_NAME);
        employeeCollection.findById(johnRecord.getID()).execute().then((employee) => {
            if (employee.get('name') === "John")
                done();
        });
    });

    it('#record remove only selected', function (done) {
        this.timeout(MAX_TIMEOUT);
        let employeeCollection = session.anysolsODM.collection(MODEL_NAME);
        johnRecord.delete().then(() => {
            employeeCollection.findById(johnRecord.getID()).execute().then((record) => {
                if (!record)
                    done();
            })
        })
    });

    /*it('#Collection::findOne', function (done) {
        this.timeout(MAX_TIMEOUT);
        let Employee = session.anysolsODM.collection(MODEL_NAME);
        Employee.findOne({name: johnObject.name}).exec().then((employee) => {
            if (johnObject.id + "" === employee.getID() + "")
                done();

        });
    });



    it('#Collection::findOneAndUpdate', function (done) {
        this.timeout(MAX_TIMEOUT);
        let Employee = session.anysolsODM.collection(MODEL_NAME);
        Employee.findOneAndUpdate({name: johnObject.name}, {eid: 200}).then((employee) => {
            Employee.findById(johnObject.id).exec().then((employee) => {
                if (employee.get("eid") === 200)
                    done();

            });
        });
    });

   */
});

