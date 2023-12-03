# JUSTAOS's ODM

![GitHub release (with filter)](https://img.shields.io/github/v/release/justaos/odm?label=Release)
[![Build](https://github.com/justaos/odm/workflows/Build/badge.svg)](https://github.com/justaos/odm/actions?workflow=Build)
[![Coverage](https://codecov.io/gh/justaos/odm/branch/main/graph/badge.svg?token=OzlniGFmNp)](https://codecov.io/gh/justaos/odm)
[![License](https://img.shields.io/github/license/justaos/odm.svg)](/LICENSE)
[![Contributors](https://img.shields.io/github/contributors/justaos/odm.svg)]()

JUSTAOS's ODM (Object Document Mapper) is built for Deno and provides transparent persistence for JavaScript objects to
Postgres database.

- Supports all primitive data types (string, integer, float, boolean, date, object, array, etc).
- Supports custom data types.
- Supports table with multi-level inheritance.
- Also supports interception on operations (create, read, update and delete).

```ts
import { ODM } from 'https://deno.land/x/justaos_odm@$VERSION/mod.ts';
```

## Database connection

```ts
const odm = new ODM();

try {
  await odm.connect("mongodb://127.0.0.1:27017/collection-service");
  console.log("connection success");
  const isDbExists = await odm.databaseExists();

  if (isDbExists) {
    console.log("db exists");
  } else {
    console.log("db does not exists");
  }
} catch (_error) {
  console.log("connection failed");
} finally {
  await odm.closeConnection();
}
```

## Defining models

Justaos ODM models following snake case naming convention. If you want to use camel case naming convention, you can
use `@Table` decorator.

```ts

// Table name will be "comment"
@Table()
class Comment {
  // Fields
}

// Table name will be "blog_post"
@Table()
class BlogPost {
  // Fields
}

// Table name will be "blog_custom_post"
@Table({ name: "blog_custom_post" })
class BlogPost {
  // Fields
}
```

## Querying

```ts
odm.defineCollection({
  name: "teacher",
  fields: [
    {
      name: "name",
      type: "string"
    },
    {
      name: "roll_no",
      type: "integer"
    }
  ]
});

let teacherCollection = odm.collection("teacher");
for (let i = 0; i < 10; i++) {
  let teacherRecord = teacherCollection.createNewRecord();
  teacherRecord.set("name", "a" + (i + 1));
  teacherRecord.set("roll_no", i + 1);
  await teacherRecord.insert();
}

teacherCollection
  .find({}, { sort: { roll_no: -1 } })
  .toArray()
  .then(function(records) {
    records.forEach(async function(rec) {
      console.log(
        (await rec.getDisplayValue("name")) +
        " :: " +
        (await rec.getDisplayValue("roll_no"))
      );
      console.log(JSON.stringify(await rec.toObject(), null, 4));
    });
  });

teacherCollection.count().then(function(count) {
  console.log(count);
  odm.closeConnection();
});

```

## Intercepting database operations

```ts
import getODM from "./getODM.ts";
import {
  OperationInterceptorInterface,
  OperationType,
  OperationWhen,
  Record
} from "../mod.ts";

const odm = await getODM();

odm.addInterceptor(
  new (class extends OperationInterceptorInterface {
    getName() {
      return "my-intercept";
    }

    async intercept(
      collectionName: string,
      operation: OperationType,
      when: OperationWhen,
      records: Record[],
      context: any
    ) {
      if (collectionName === "student") {
        if (operation === "CREATE") {
          console.log(
            "[collectionName=" +
            collectionName +
            ", operation=" +
            operation +
            ", when=" +
            when +
            "]"
          );
          if (when === "BEFORE") {
            for (let record of records) {
              console.log(
                "computed field updated for :: " + record.get("name")
              );
              record.set("computed", record.get("name") + " +++ computed");
            }
          }
        }
        if (operation === "READ") {
          console.log(
            "[collectionName=" +
            collectionName +
            ", operation=" +
            operation +
            ", when=" +
            when +
            "]"
          );
          if (when === "AFTER") {
            for (const record of records)
              console.log(JSON.stringify(record.toObject(), null, 4));
          }
        }
      }
      return records;
    }
  })()
);

odm.defineCollection({
  name: "student",
  fields: [
    {
      name: "name",
      type: "string"
    },
    {
      name: "computed",
      type: "string"
    }
  ]
});

const studentCollection = odm.collection("student");
const studentRecord = studentCollection.createNewRecord();
studentRecord.set("name", "John " + new Date().toISOString());
studentRecord.insert().then(function() {
  studentCollection
    .find()
    .toArray()
    .then(function() {
      odm.closeConnection();
    });
});

```

## Define custom field type

After connection established, you can define custom field type.

```ts
import getODM from "./getODM.ts";
import { FieldType, PrimitiveDataType, Schema, ODM } from "../mod.ts";

const odm = await getODM();

odm.addFieldType(
  class extends FieldType {
    constructor(odm: ODM) {
      super(odm, PrimitiveDataType.STRING);
    }

    getName() {
      return "email";
    }

    async validateValue(schema: Schema, fieldName: string, record: any, context: any) {
      const pattern = "(.+)@(.+){2,}\.(.+){2,}";
      if (!new RegExp(pattern).test(record[fieldName]))
        throw new Error("Not a valid email");
    }

    validateDefinition(fieldDefinition: any) {
      return !!fieldDefinition.name;
    }

    async getDisplayValue(schema: Schema, fieldName: string, record: any) {
      return record[fieldName];
    }

    setValueIntercept(schema: Schema, fieldName: string, newValue: any): any {
      return newValue;
    }
  }
);

odm.defineCollection({
  label: "Student",
  name: "student",
  fields: [
    {
      name: "name",
      type: "string"
    },
    {
      name: "personal_contact",
      type: "email"
    },
    {
      name: "emp_no",
      type: "objectId"
    },
    {
      name: "salary",
      type: "integer"
    },
    {
      name: "birth_date",
      type: "date"
    },
    {
      name: "gender",
      type: "boolean"
    },
    {
      name: "address",
      type: "object"
    }
  ]
});

const studentCollection = odm.collection("student");
const studentRecord = studentCollection.createNewRecord();
studentRecord.set("personal_contact", "test");
studentRecord.set("birth_date", new Date());
studentRecord.insert().then(
  function() {
    console.log("Student created");
  },
  (err) => {
    console.log(err.toJSON());
    odm.closeConnection().then(function() {
      console.log("Connection closed");
    });
  }
);

```

## Inheritance

```ts
import getODM from "./getODM.ts";

const odm = await getODM();

odm.defineCollection({
  name: "animal",
  fields: [
    {
      name: "name",
      type: "string"
    }
  ]
});

const animalCol = odm.collection("animal");
const animal = animalCol.createNewRecord();
animal.set("name", "Puppy");
await animal.insert();

odm.defineCollection({
  name: "dog",
  extends: "animal",
  final: true,
  fields: [
    {
      name: "breed",
      type: "string"
    }
  ]
});

const dogCol = odm.collection("dog");
const husky = dogCol.createNewRecord();
husky.set("name", "Jimmy");
husky.set("breed", "Husky");
await husky.insert();

animalCol
  .find({})
  .toArray()
  .then(function(animals) {
    animals.forEach((animal) => {
      console.log(animal.toObject());
    });
    odm.closeConnection();
  });

 ```

| Database Data type | get    | getDisplayValue | getObject          |
|--------------------|--------|-----------------|--------------------|
| **string**         | string | string          | string             |
| **integer**        | number | number          | number             |
| **date**           | string | string          | Temporal.PlainDate |

Check the examples >> [here](./examples) <<

## Code of Conduct

[Contributor Covenant](/CODE_OF_CONDUCT.md)
