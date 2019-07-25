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

anysolsModel.defineModel({
    name: 'student',
    fields: [{
        name: 'name',
        type: 'string'
    }]
});

let Student = anysolsModel.model("student");
let s = new Student();
s.set("name", "John");
s.save().then(function () {
    console.log("Student created")
});
```
