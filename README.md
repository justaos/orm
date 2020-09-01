# plt4rm's ODM
plt4rm's ODM (Object Document Mapper) is built for NodeJS and provides transparent persistence for JavaScript objects to MongoDB database.
 
 Supports schemas with multi-level inheritance. Also supports interception on operations (create, read, update and delete). 

[![Build](https://github.com/plt4rm/odm/workflows/Node%20CI/badge.svg)](https://github.com/plt4rm/odm/actions?workflow=Node+CI)
[![Coverage Status](https://coveralls.io/repos/github/plt4rm/odm/badge.svg?branch=master)](https://coveralls.io/github/plt4rm/odm?branch=master)
[![CodeFactor](https://www.codefactor.io/repository/github/plt4rm/odm/badge)](https://www.codefactor.io/repository/github/plt4rm/odm)

```bash
npm install --save @plt4rm/odm
```
## Establishing database connection
```js
const {ODM} = require("@plt4rm/odm");

const odm = new ODM();
 
const config = {
    "host": "localhost",
    "port": "27017",
    "database": "collection-service",
    "dialect": "mongodb",
};

odm.connect(config).then(() => {
    console.log('connection success');
    odm.databaseExists().then(() => {
        console.log('db exists');
        odm.closeConnection();
    }, () => {
        console.log("db does not exists");
        odm.closeConnection();
    });
}, (err) => {
    console.log('connection failed');
    odm.closeConnection();
});

```

## Intercepting database operations
```js
// after establishing connection

odm.addInterceptor({

    getName: function () {
        return "my-intercept";
    },

    intercept: (collectionName, operation, when, payload) => {
        return new Promise((resolve, reject) => {
            if (collectionName === 'student') {
                if (operation === 'CREATE') {
                    console.log("[collectionName=" + collectionName + ", operation=" + operation + ", when=" + when + "]");
                    if (when === "BEFORE") {
                        for (let record of payload.records) {
                            console.log("computed field updated for :: " + record.get('name'));
                            record.set("computed", record.get("name") + " +++ computed");
                        }
                    }
                }
                if (operation === 'READ') {
                    console.log("[collectionName=" + collectionName + ", operation=" + operation + ", when=" + when + "]");
                    if (when === "AFTER") {
                        for (let record of payload.records)
                            console.log(JSON.stringify(record.toObject(), null, 4));
                    }
                }
            }
            resolve(payload);
        });
    }
});

odm.defineCollection({
    name: 'student',
    fields: [{
        name: 'name',
        type: 'string'
    }, {
        name: 'computed',
        type: 'string'
    }]
});

let studentCollection = odm.collection("student");
let s = studentCollection.createNewRecord();
s.set("name", "John " + new Date().toISOString());
s.insert().then(function () {
    studentCollection.find().toArray().then(function (students) {
        odm.closeConnection();
    });
});
```

## Define custom field type
```js
// after establishing connection

odm.addFieldType({

 getDataType: function () {
     return new StringDataType()
 },

 getType: function () {
     return "email"
 },

 async validateValue(schema: Schema, field: Field, record: any, context: any) {
     const pattern = "(.+)@(.+){2,}\\.(.+){2,}";
     if (!new RegExp(pattern).test(record[field.getName()]))
         throw new Error("Not a valid email");
 },

 validateDefinition: function (fieldDefinition: any) {
     return !!fieldDefinition.name
 },

 getValueIntercept(schema: Schema, field: Field, record: any, context: any): any {
     return record[field.getName()];
 },

 setValueIntercept(schema: Schema, field: Field, newValue: any, record: any, context: any): any {
     return newValue;
 },
 
 setODM() {}

});

odm.defineCollection({
    name: 'student',
    fields: [{
        name: 'name',
        type: 'string'
    }, {
        name: 'email',
        type: 'email'
    }, {
        name: 'dob',
        type: 'date'
    }]
});

let studentCollection = odm.collection("student");
let s = studentCollection.createNewRecord();
s.set("name", "John");
s.set("email", "test@example.com");
s.set("dob", new Date());
s.insert().then(function () {
    console.log("Student created");
    odm.closeConnection();
}, (err) => {
    console.log(err);
    odm.closeConnection();
});
```

Check the examples >> [here](./examples) <<

## Code of Conduct
[Contributor Covenant](/CODE_OF_CONDUCT.md)

## License
[Apache License 2.0](/LICENSE)
