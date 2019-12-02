# Anysols ODM
Anysols ODM (Object Document Mapper) is built for NodeJS and provides transparent persistence for JavaScript objects to MongoDB database.
 
 Supports schemas with multi-level inheritance. Also supports interception on operations (create, read, update and delete). 

[![Coverage Status](https://coveralls.io/repos/github/anysols/anysols-odm/badge.svg?branch=master)](https://coveralls.io/github/anysols/anysols-odm?branch=master)

```bash
npm install --save @anysols/odm
```
## Establishing database connection
```js
const {AnysolsODM} = require("@anysols/odm");

const anysolsODM = new AnysolsODM();
 
const config = {
    "host": "localhost",
    "port": "27017",
    "database": "anysols-collection-service",
    "dialect": "mongodb",
};

anysolsODM.connect(config).then(() => {
    console.log('connection success');
    anysolsODM.databaseExists().then(() => {
        console.log('db exists');
        anysolsODM.closeConnection();
    }, () => {
        console.log("db does not exists");
        anysolsODM.closeConnection();
    });
}, (err) => {
    console.log('connection failed');
    anysolsODM.closeConnection();
});

```

## Intercepting database operations
```js
// after establishing connection

anysolsODM.addInterceptor({

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

anysolsODM.defineCollection({
    name: 'student',
    fields: [{
        name: 'name',
        type: 'string'
    }, {
        name: 'computed',
        type: 'string'
    }]
});

let studentCollection = anysolsODM.collection("student");
let s = studentCollection.createNewRecord();
s.set("name", "John " + new Date().toISOString());
s.insert().then(function () {
    studentCollection.find().toArray().then(function (students) {
        anysolsODM.closeConnection();
    });
});
```

## Define custom field type
```js
// after establishing connection

anysolsODM.addFieldType({

    getDataType: function (fieldDefinition) {
        return new StringDataType({pattern: "(.+)@(.+){2,}\\.(.+){2,}"})
    },

    getType: function () {
        return "email"
    },

    validateDefinition: function (fieldDefinition) {
        return !!fieldDefinition.name
    }
});

anysolsODM.defineCollection({
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

let studentCollection = anysolsODM.collection("student");
let s = studentCollection.createNewRecord();
s.set("name", "John");
s.set("email", "test@example.com");
s.set("dob", new Date());
s.insert().then(function () {
    console.log("Student created");
    anysolsODM.closeConnection();
}, (err) => {
    console.log(err);
    anysolsODM.closeConnection();
});
```

Check the examples >> [here](./examples) <<

## Code of Conduct
[Contributor Covenant](/CODE_OF_CONDUCT.md)

## License
[Apache License 2.0](/LICENSE)
