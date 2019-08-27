const {assert} = require('chai');
const {session, MAX_TIMEOUT} = require('../../test.utils');

describe('Model', () => {


    let johnRecord;
    let johnObject;
    let MODEL_NAME = "employee";

    it('#Model::insert', function (done) {
        this.timeout(5000);
        session.anysolsModel.defineModel({
            name: MODEL_NAME,
            fields: [{
                name: 'name',
                type: 'string'
            }, {
                name: "eid",
                type: "integer"
            }]
        });

        let employeeModel = session.anysolsModel.model(MODEL_NAME);
        let empRecord = employeeModel.initializeRecord();
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

    it('#Model::getModelName', function () {
        this.timeout(MAX_TIMEOUT);
        let employeeModel = session.anysolsModel.model(MODEL_NAME);
        assert.isOk(employeeModel.getName() === MODEL_NAME, 'Invalid model name');
    });

    it('#Model::find', function (done) {
        this.timeout(MAX_TIMEOUT);
        let employee = session.anysolsModel.model(MODEL_NAME);
        employee.find().execute().then((employees) => {
            if (employees.length === 1)
                done();
        });
    });

    it('#Model::findById', function (done) {
        this.timeout(MAX_TIMEOUT);
        let employeeModel = session.anysolsModel.model(MODEL_NAME);
        employeeModel.findById(johnRecord.getID()).execute().then((employee) => {
            if (employee.get('name') === "John")
                done();
        });
    });

    it('#record remove only selected', function (done) {
        this.timeout(MAX_TIMEOUT);
        let employeeModel = session.anysolsModel.model(MODEL_NAME);
        johnRecord.delete().then(() => {
            employeeModel.findById(johnRecord.getID()).execute().then((record) => {
                if (!record)
                    done();
            })
        })
    });

    /*it('#Model::findOne', function (done) {
        this.timeout(MAX_TIMEOUT);
        let Employee = session.anysolsModel.model(MODEL_NAME);
        Employee.findOne({name: johnObject.name}).exec().then((employee) => {
            if (johnObject.id + "" === employee.getID() + "")
                done();

        });
    });



    it('#Model::findOneAndUpdate', function (done) {
        this.timeout(MAX_TIMEOUT);
        let Employee = session.anysolsModel.model(MODEL_NAME);
        Employee.findOneAndUpdate({name: johnObject.name}, {eid: 200}).then((employee) => {
            Employee.findById(johnObject.id).exec().then((employee) => {
                if (employee.get("eid") === 200)
                    done();

            });
        });
    });

   */
});

