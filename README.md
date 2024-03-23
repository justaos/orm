# JUSTAOS's ORM

![GitHub release (with filter)](https://img.shields.io/github/v/release/justaos/orm?label=Release)
[![Build](https://github.com/justaos/orm/workflows/Build/badge.svg)](https://github.com/justaos/orm/actions?workflow=Build)
[![Coverage](https://codecov.io/gh/justaos/orm/branch/main/graph/badge.svg?token=OzlniGFmNp)](https://codecov.io/gh/justaos/orm)
[![License](https://img.shields.io/github/license/justaos/orm.svg)](/LICENSE)
[![Contributors](https://img.shields.io/github/contributors/justaos/orm.svg)]()

JUSTAOS's ORM (Object Relational Mapping) tool is built for Deno and provides transparent persistence for JavaScript
objects to
Postgres database.

- Supports all primitive data types (string, integer, float, boolean, date, object, array, etc).
- Supports custom data types.
- Supports table with multi-level inheritance.
- Also supports interception on operations (create, read, update and delete).

```shell
deno add @justaos/orm
```

```ts
import { ORM } from '@justaos/orm';
```

## Database connection

```ts
const odm = new ORM({
  database: "collection-service",
  username: "postgres",
  password: "postgres",
  hostname: "localhost",
  port: 5432
});

let conn: ORMConnection | undefined;
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
await orm.defineTable({
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

await orm.defineTable({
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
await conn.defineTable({
  name: "teacher",
  columns: [
    {
      name: "name",
      type: "string",
    },
    {
      name: "roll_no",
      type: "integer",
    },
  ],
});

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
  console.log(`${await rec.get("name")} :: ${await rec.get("roll_no")}`);
  console.log(JSON.stringify(await rec.toJSON(), null, 4));
});

const count = await teacherTable.count();
console.log("COUNT :: " + count);
await conn.closeConnection();
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
        if (operation === "INSERT") {
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
        if (operation === "SELECT") {
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
      type: "string",
    },
    {
      name: "computed",
      type: "string",
    },
  ],
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
  new (class extends DataType {
    constructor() {
      super("email", "VARCHAR");
    }

    toJSONValue(value: string | null): string | null {
      return value;
    }

    validateDefinition(_columnDefinition: ColumnDefinition) {
      return true;
    }

    setValueIntercept(newValue: any): any {
      return newValue;
    }

    async validateValue(value: unknown): Promise<void> {
      const pattern = "(.+)@(.+){2,}\\.(.+){2,}";
      if (
        value &&
        typeof value === "string" &&
        !new RegExp(pattern).test(value)
      )
        throw new Error("Not a valid email");
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
} catch (error) {
  console.log(error.toJSON());
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

| Data type | get                  | getJSONValue |
|-----------|----------------------|--------------|
| string    | _string_             | _string_     |
| integer   | _number_             | _number_     |
| date      | _Temporal.PlainDate_ | _string_     |

Check the examples >> [here](./examples) <<

## Code of Conduct

[Contributor Covenant](/CODE_OF_CONDUCT.md)
