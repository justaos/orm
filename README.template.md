# P4RM's ODM
P4RM's ODM (Object Document Mapper) is built for NodeJS and provides transparent persistence for JavaScript objects to MongoDB database.
 
 Supports schemas with multi-level inheritance. Also supports interception on operations (create, read, update and delete). 

[![Build](https://github.com/p4rm/odm/workflows/Node%20Build%20CI/badge.svg)](https://github.com/p4rm/odm/actions?workflow=Node+CI)
[![Coverage Status](https://coveralls.io/repos/github/p4rm/odm/badge.svg?branch=main)](https://coveralls.io/github/p4rm/odm?branch=master)

```bash
npm install --save @p4rm/odm
```

```js
const ODM = require("@p4rm/odm");
```

## Establishing database connection
```js
// examples/eg-1-establishing-database-connection.js#L3-L24
```

## Intercepting database operations
```js
// examples/eg-2-intercepting-database-operations.js
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
