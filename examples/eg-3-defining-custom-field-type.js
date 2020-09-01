let {StringDataType} = require("../");
let getODM = require("./getODM");

getODM().then(function (odm) {

    odm.addFieldType({

        setODM() {},

        getDataType: function () {
            return new StringDataType()
        },

        getType: function () {
            return "email"
        },

        async validateValue(schema, field, record, context) {
            const pattern = "(.+)@(.+){2,}\\.(.+){2,}";
            if (!new RegExp(pattern).test(record[field.getName()]))
                throw new Error("Not a valid email");
        },

        validateDefinition: function (fieldDefinition) {
            return !!fieldDefinition.name
        },

        getValueIntercept(schema, field, record, context) {
            return record[field.getName()];
        },

        setValueIntercept(schema, field, newValue, record, context) {
            return newValue;
        }
    });

    odm.defineCollection({
        name: 'student',
        fields: [{
            name: 'name',
            type: 'string'
        }, {
            name: "personal_contact",
            type: "email"
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

    let studentCollection = odm.collection("student");
    let s = studentCollection.createNewRecord();
    s.set("personal_contact", "ttest");
    s.set("birth_date", new Date());
    s.insert().then(function () {
        console.log("Student created");
        studentCollection.find({}).toArray().then(function (res) {
            console.log(JSON.stringify(res));
            s.set("graduated", null);
            s.update().then(function () {
                odm.closeConnection();
            });
        });

    }, (err) => {
        console.log(err);
        odm.closeConnection();
    });
});
