# JUSTAOS's ODM
JUSTAOS's ODM (Object Document Mapper) is built for NodeJS and provides transparent persistence for JavaScript objects to MongoDB database.

Supports schemas with multi-level inheritance. Also supports interception on operations (create, read, update and delete).

[![Build](https://github.com/justaos/odm/workflows/Node%20Build%20CI/badge.svg)](https://github.com/justaos/odm/actions?workflow=Node+CI)
[![Coverage Status](https://coveralls.io/repos/github/justaos/odm/badge.svg?branch=main)](https://coveralls.io/github/justaos/odm?branch=master)

```bash
npm install --save @justaos/odm
```

```js
const ODM = require("@justaos/odm");
```

## Establishing database connection
```js
const odm = new ODM();

const config = {
  "host": "127.0.0.1",
  "port": "27017",
  "database": "anysols-collection-service",
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
odm.addInterceptor({

    getName: function () {
        return "my-intercept";
    },

    intercept: (collectionName, operation, when, records) => {
        return new Promise((resolve, reject) => {
            if (collectionName === 'student') {
                if (operation === 'CREATE') {
                    console.log("[collectionName=" + collectionName + ", operation=" + operation + ", when=" + when + "]");
                    if (when === "BEFORE") {
                        for (let record of records) {
                            console.log("computed field updated for :: " + record.get('name'));
                            record.set("computed", record.get("name") + " +++ computed");
                        }
                    }
                }
                if (operation === 'READ') {
                    console.log("[collectionName=" + collectionName + ", operation=" + operation + ", when=" + when + "]");
                    if (when === "AFTER") {
                        for (let record of records)
                            console.log(JSON.stringify(record.toObject(), null, 4));
                    }
                }
            }
            resolve(records);
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
After connection established, you can define custom field type.
```js
odm.addFieldType({
  setODM() {
  },

  getDataType: function() {
    return new StringDataType();
  },

  getType: function() {
    return 'email';
  },

  async validateValue(schema, field, record, context) {
    const pattern = '(.+)@(.+){2,}\\.(.+){2,}';
    if (!new RegExp(pattern).test(record[field.getName()]))
      throw new Error('Not a valid email');
  },

  validateDefinition: function(fieldDefinition) {
    return !!fieldDefinition.name;
  },

  getValueIntercept(schema, field, record, context) {
    return record[field.getName()];
  },

  setValueIntercept(schema, field, newValue, record, context) {
    return newValue;
  }
});

odm.defineCollection({
  label: 'Student',
  name: 'student',
  fields: [
    {
      name: 'name',
      type: 'string'
    },
    {
      name: 'personal_contact',
      type: 'email'
    },
    {
      name: 'emp_no',
      type: 'objectId'
    },
    {
      name: 'salary',
      type: 'integer'
    },
    {
      name: 'birth_date',
      type: 'date'
    },
    {
      name: 'gender',
      type: 'boolean'
    },
    {
      name: 'address',
      type: 'object'
    }
  ]
});

let studentCollection = odm.collection('student');
let s = studentCollection.createNewRecord();
s.set('personal_contact', 'ttest');
s.set('birth_date', new Date());
s.insert().then(
  function() {
    console.log('Student created');
    studentCollection
      .find({})
      .toArray()
      .then(function(res) {
        console.log(JSON.stringify(res));
        s.set('graduated', null);
        s.update().then(function() {
          odm.closeConnection();
        });
      });
  },
  (err) => {
    console.log(err.toJSON());
    odm.closeConnection().then(function() {
      console.log('Connection closed');
    });
  }
);
```

## Inheritance
```js
odm.defineCollection({
  name: 'animal',
  fields: [
    {
      name: 'name',
      type: 'string'
    }
  ]
});

let animalCol = odm.collection('animal');
let animal = animalCol.createNewRecord();
animal.set('name', 'Puppy');
await animal.insert();

odm.defineCollection({
  name: 'dog',
  extends: 'animal',
  final: true,
  fields: [
    {
      name: 'breed',
      type: 'string'
    }
  ]
});

let dogCol = odm.collection('dog');
let husky = dogCol.createNewRecord();
husky.set('name', 'Jimmy');
husky.set('breed', 'Husky');
await husky.insert();

animalCol
  .find({})
  .toArray()
  .then(function (animals) {
    animals.forEach((animal) => {
      console.log(animal.toObject());
    });
    odm.closeConnection();
  });
```

Check the examples >> [here](./examples) <<

## Code of Conduct
[Contributor Covenant](/CODE_OF_CONDUCT.md)

## License
[Apache License 2.0](/LICENSE)
