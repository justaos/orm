# Anysols Model
Wrapper for mongodb with support for intercepts on operations (create, read, update and delete) and support for schemas with multi-level inheritance

[![Coverage Status](https://coveralls.io/repos/github/anysols/anysols-model/badge.svg?branch=master)](https://coveralls.io/github/anysols/anysols-model?branch=master)

```bash
npm install --save anysols-model
```
## Establishing database connection
```js
const {AnysolsModel} = require('anysols-model');

 const anysolsModel = new AnysolsModel();

    const config = {
        "host": "localhost",
        "port": "27017",
        "database": "anysols-model",
        "dialect": "mongodb",
    };

    anysolsModel.connect(config).then(() => {
        console.log('connection success');
        anysolsModel.databaseExists().then(() => {
            console.log('db exists');
            cb(anysolsModel);
        }, () => {
            console.log("db does not exists");
        });
    }, (err) => {
        console.log('connection failed');
    });
```

## Intercepting database operations
```js
// after establishing connection

 anysolsModel.addInterceptor("my-intercept", {
    intercept: (modelName, operation, when, records) => {
        return new Promise((resolve, reject) => {
            if (modelName === 'student') {
                if (operation === 'create') {
                    if (when === "before") {
                        console.log("Student before");
                        if (!Array.isArray(records)) {
                            let record = records;
                            record.set("computed",  record.get("name") + " +++ computed");
                        }
                    } else if (when === "after")
                        console.log("Student after");
                }
            }
            resolve(records);
        });
    }
});

anysolsModel.defineModel({
    name: 'student',
    fields: [{
        name: 'name',
        type: 'string'
    }, {
        name: 'computed',
        type: 'string'
    }]
});

let Student = anysolsModel.model("student");
let s = new Student({});
s.set("name", "John");
s.save().then(function () {
    Student.find().exec().then(function (students) {
        console.log(JSON.stringify(students, null, 4));
    });
});
```

## Define custom field type
```js
// after establishing connection

 anysolsModel.registerFieldDefinition(new FieldDefinition("customType", field => {
     return true
 }, function (field, fieldDefinition) {
     return {
         type: MONGOOSE_TYPES.STRING
     }
 }));

 anysolsModel.defineModel({
     name: 'student',
     fields: [{
         name: 'name',
         type: 'string'
     }, {
         name: 'dob',
         type: 'date'
     }, {
         name: 'custom_field',
         type: 'customType'
     }]
 });

 let Student = anysolsModel.model("student");
 let s = new Student();
 s.set("name", "John");
 s.set("dob", new Date());
 s.set("custom_field", "testing");
 s.save().then(function () {
     console.log("Student created");
     anysolsModel.closeConnection();
 });
```

Check the examples >> [here](./examples) <<

## Code of Conduct
[Contributor Covenant](/CODE_OF_CONDUCT.md)

## License
[Apache License 2.0](/LICENSE)
