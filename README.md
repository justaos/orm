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
const odm = new ODM({
  database: "collection-service",
  username: "postgres",
  password: "admin",
  hostname: "localhost",
  port: 5432
});

let conn: ODMConnection | undefined;
try {
  conn = await odm.connect(true /* create database if not exists */);
  console.log("connection success");
} catch (_error) {
  console.log("connection failed");
} finally {
  if (conn) await conn.closeConnection();
}
```

## Defining models

```ts
await odm.defineTable({
  name: "blog_post",
  columns: [
    {
      name: "title",
      type: "string"
    },
    {
      name: "content",
      type: "string"
    }
  ]
});

await odm.defineTable({
  name: "comment",
  columns: [
    {
      name: "blog_post",
      type: "reference"
      
    },
    {
      name: "message",
      type: "string"
    }
  ]
});
```



## Querying

```ts
const teacherTable = conn.table("teacher");
for (let i = 0; i < 10; i++) {
  const teacher = teacherTable.createNewRecord();
  teacher.set("name", "a" + (i + 1));
  teacher.set("roll_no", i + 1);
  await teacher.insert();
}

const records = await teacherTable
  .select()
  .orderBy("roll_no", "DESC")
  .toArray();

records.forEach(async function (rec) {
  console.log(
    `${await rec.getDisplayValue("name")} :: ${await rec.getDisplayValue(
      "roll_no"
    )}`
  );
  console.log(JSON.stringify(await rec.toJSON(), null, 4));
});

const count = await teacherTable.select().getCount();
console.log(count);
```

## Intercepting database operations

```ts
odm.addInterceptor(
  new (class extends DatabaseOperationInterceptor {
    getName() {
      return "my-intercept";
    }

    async intercept(
      collectionName: string,
      operation: DatabaseOperationType,
      when: DatabaseOperationWhen,
      records: Record[],
      _context: DatabaseOperationContext
    ) {
      if (collectionName === "student") {
        if (operation === "CREATE") {
          console.log(
            `[collectionName=${collectionName}, operation=${operation}, when=${when}]`
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
            `[collectionName=${collectionName}, operation=${operation}, when=${when}]`
          );
          if (when === "AFTER") {
            for (const record of records) {
              console.log(JSON.stringify(record.toJSON(), null, 4));
            }
          }
        }
      }
      return records;
    }
  })()
);

await conn.defineTable({
  name: "student",
  columns: [
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

const studentTable = conn.table("student");
const studentRecord = studentTable.createNewRecord();
studentRecord.set("name", "John " + new Date().toISOString());
await studentRecord.insert();
await studentTable.select().toArray();

/* This will print the following:
[collectionName=student, operation=CREATE, when=BEFORE]
computed field updated for :: John 2023-12-05T13:57:21.418Z
[collectionName=student, operation=CREATE, when=AFTER]

[collectionName=student, operation=READ, when=BEFORE]
[collectionName=student, operation=READ, when=AFTER]
{
    "id": "e5d8a03e-7511-45c6-96ad-31a6fa833696",
    "_table": "student",
    "name": "John 2023-12-05T13:31:13.313Z",
    "computed": "John 2023-12-05T13:31:13.313Z +++ computed"
}
*/
```

## Define custom field type

After connection established, you can define custom field type.

```ts
odm.addDataType(
  class extends DataType {
    constructor() {
      super(NATIVE_DATA_TYPES.VARCHAR);
    }

    getName() {
      return "email";
    }

    async validateValue(
      _schema: TableSchema,
      fieldName: string,
      record: RawRecord
    ) {
      const pattern = "(.+)@(.+){2,}\\.(.+){2,}";
      if (!new RegExp(pattern).test(record[fieldName]))
        throw new Error("Not a valid email");
    }

    validateDefinition(fieldDefinition: ColumnDefinition) {
      return !!fieldDefinition.name;
    }

    getValueIntercept(
      _schema: TableSchema,
      fieldName: string,
      record: RawRecord
    ): any {
      return record[fieldName];
    }

    setValueIntercept(
      _schema: TableSchema,
      _fieldName: string,
      newValue: any,
      _record: RawRecord
    ): any {
      return newValue;
    }

    async getDisplayValue(
      _schema: TableSchema,
      fieldName: string,
      record: RawRecord,
      _context: DatabaseOperationContext
    ) {
      return record[fieldName];
    }
  }
);

await conn.defineTable({
  name: "student",
  columns: [
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
      type: "uuid"
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
    }
  ]
});

const studentTable = conn.table("student");
const student = studentTable.createNewRecord();
student.set("personal_contact", "test");
student.set("birth_date", new Date());

try {
  await student.insert();
  console.log("Student created");
} catch (_error) {
  console.log(_error.toJSON());
}
```

## Inheritance

```ts
await conn.defineTable({
  name: "animal",
  columns: [
    {
      name: "name",
      type: "string"
    }
  ]
});

const animalTable = conn.table("animal");
const animal = animalTable.createNewRecord();
animal.set("name", "Puppy");
await animal.insert();

await conn.defineTable({
  name: "dog",
  inherits: "animal",
  final: true,
  columns: [
    {
      name: "breed",
      type: "string"
    }
  ]
});

const dogTable = conn.table("dog");
const husky = dogTable.createNewRecord();
husky.set("name", "Jimmy");
husky.set("breed", "Husky");
await husky.insert();

const animals = await animalTable.select().toArray();

animals.forEach((animal) => {
  console.log(animal.toJSON());
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
