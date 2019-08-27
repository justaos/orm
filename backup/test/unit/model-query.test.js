const {assert} = require('chai');
const {session, MAX_TIMEOUT} = require('../test.utils');

describe('Model', () => {


    let johnRecord;
    let johnObject;
    let MODEL_NAME = "employee";


    it('#Model::find', function (done) {
        this.timeout(MAX_TIMEOUT);
        let Employee = session.anysolsModel.model(MODEL_NAME);
        Employee.find().exec().then((employees) => {
            if (employees.length === 1)
                done();
        });
    });

    it('#Model::findOne', function (done) {
        this.timeout(MAX_TIMEOUT);
        let Employee = session.anysolsModel.model(MODEL_NAME);
        Employee.findOne({name: johnObject.name}).exec().then((employee) => {
            if (johnObject.id + "" === employee.getID() + "")
                done();

        });
    });

    it('#Model::findById', function (done) {
        this.timeout(MAX_TIMEOUT);
        let Employee = session.anysolsModel.model(MODEL_NAME);
        Employee.findById(johnObject.id).exec().then((employee) => {
            if (employee.get('name') === "John")
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

    it('#record remove only selected', function (done) {
        this.timeout(5000);
        let Employee = session.anysolsModel.model(MODEL_NAME);
        johnRecord.remove().then(() => {
            Employee.findById(johnObject.id).exec().then((record) => {
                if (!record)
                    done();
            })
        })
    });
});

