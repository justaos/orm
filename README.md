# Anysols Model
Wrapper for mongoose with intercepts for operations

[![Coverage Status](https://coveralls.io/repos/github/anysols/anysols-model/badge.svg?branch=master)](https://coveralls.io/github/anysols/anysols-model?branch=master)

```js
var config = {
	"host": "localhost",
	"port": "27017",
	"name": "anysols",
	"user": "root",
	"password": "root",
	"dialect": "mongodb"
};

DatabaseService.connect(config).then(() => {
    console.log('connection success');
    DatabaseService.databaseExists().then(() => {
        console.log('database "anysols" exists');
    }, () => {
        console.log('no such database "anysols" exists');
    });
}, function () {
    console.log('connection failed');
});
```
