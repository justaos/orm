# JUSTAOS's ODM
JUSTAOS's ODM (Object Document Mapper) is built for NodeJS and provides transparent persistence for JavaScript objects to MongoDB database.

Supports schemas with multi-level inheritance. Also supports interception on operations (create, read, update and delete).

[![Build](https://github.com/justaos/odm/workflows/Build/badge.svg)](https://github.com/justaos/odm/actions?workflow=Build)
[![codecov](https://codecov.io/gh/justaos/odm/branch/main/graph/badge.svg?token=OzlniGFmNp)](https://codecov.io/gh/justaos/odm)
[![GitHub license](https://img.shields.io/github/license/justaos/odm.svg)](/LICENSE)

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


## Querying
```js
odm.defineCollection({
  name: 'teacher',
  fields: [
    {
      name: 'name',
      type: 'string'
    },
    {
      name: 'roll_no',
      type: 'integer'
    }
  ]
});

let teacherCollection = odm.collection('teacher');
for (let i = 0; i < 10; i++) {
  let teacherRecord = teacherCollection.createNewRecord();
  teacherRecord.set('name', 'a' + (i + 1));
  teacherRecord.set('roll_no', i + 1);
  await teacherRecord.insert();
}

teacherCollection
  .find({}, { sort: { roll_no: -1 } })
  .toArray()
  .then(function (records) {
    records.forEach(async function (rec) {
      console.log(
        (await rec.getDisplayValue('name')) +
        ' :: ' +
        (await rec.getDisplayValue('roll_no'))
      );
      console.log(JSON.stringify(await rec.toObject(), null, 4));
    });
  });

teacherCollection.count().then(function (count) {
  console.log(count);
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
odm.addFieldType(
  class extends FieldType {
    constructor(odm) {
      super(odm, PrimitiveDataType.STRING);
    }

    getName() {
      return 'email';
    }

    async validateValue(schema, fieldName, record, context) {
      const pattern = '(.+)@(.+){2,}\\.(.+){2,}';
      if (!new RegExp(pattern).test(record[fieldName]))
        throw new Error('Not a valid email');
    }

    validateDefinition(fieldDefinition) {
      return !!fieldDefinition.name;
    }

    setValueIntercept(schema, field, newValue, record) {
      return newValue;
    }
  }
);

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
let studentRecord = studentCollection.createNewRecord();
studentRecord.set('personal_contact', 'test');
studentRecord.set('birth_date', new Date());
studentRecord.insert().then(
  function () {
    console.log('Student created');
  },
  (err) => {
    console.log(err.toJSON());
    odm.closeConnection().then(function () {
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
