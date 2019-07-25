# Anysols Model
Wrapper for mongoose with intercepts for operations

[![Coverage Status](https://coveralls.io/repos/github/anysols/anysols-model/badge.svg?branch=master)](https://coveralls.io/github/anysols/anysols-model?branch=master)

## Establishing connection
```js
const AnysolsModel = require('../').AnysolsModel;

const anysolsModel = new AnysolsModel();

const config = {
    "host": "localhost",
    "port": "27017",
    "database": "anysols",
    "dialect": "mongodb",
};

anysolsModel.connect({
    "host": "localhost",
    "port": "27017",
    "database": "anysols",
    "dialect": "mongodb",
}).then(function (dbConn) {
    console.log('connection success');
    anysolsModel.databaseExists().then( ()=> {
        console.log('db exists');
        anysolsModel.closeConnection();
    }, () => {
        console.log("db does not exists");
        anysolsModel.closeConnection();
    });
}, (err) => {
    console.log('connection failed');
});
```

## Defining Model and creating record
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
