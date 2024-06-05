# JUSTAOS's ORM

![GitHub release (with filter)](https://img.shields.io/github/v/release/justaos/orm?label=Release)
[![Build](https://github.com/justaos/orm/workflows/Build/badge.svg)](https://github.com/justaos/orm/actions?workflow=Build)
[![Coverage](https://codecov.io/gh/justaos/orm/branch/main/graph/badge.svg?token=OzlniGFmNp)](https://codecov.io/gh/justaos/orm)
[![License](https://img.shields.io/github/license/justaos/orm.svg)](/LICENSE)
[![Contributors](https://img.shields.io/github/contributors/justaos/orm.svg)]()

JUSTAOS's ORM (Object Relational Mapping) tool is built for Deno and provides
transparent persistence for JavaScript objects to Postgres database.

- Supports all primitive data types (string, integer, float, boolean, date,
  object, array, etc).
- Supports custom data types.
- Supports table with multi-level inheritance.
- Also supports interception on operations (create, read, update and delete).

```shell
deno add @justaos/orm
```

```ts
import { ORM } from "@justaos/orm";
```

## Database connection

```ts
const odm = new ORM({
  database: "employee-database",
  username: "postgres",
  password: "postgres",
  hostname: "localhost",
  port: 5432,
});

let conn: ORMConnection | undefined;
try {
  conn = await odm.connect(true /* create database if not exists */);
  console.log("Connection established successfully");
} catch (error) {
  console.log("Error while establishing connection", error);
}

if (conn) await conn.closeConnection();
```

## Defining tables

```ts
await orm.defineTable({
  name: "blog_post",
  columns: [
    {
      name: "title",
      type: "string",
    },
    {
      name: "content",
      type: "string",
    },
  ],
});

await orm.defineTable({
  name: "comment",
  columns: [
    {
      name: "blog_post",
      type: "reference",
    },
    {
      name: "message",
      type: "string",
    },
  ],
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

for (const record of records) {
  console.log(record.get("name") + " :: " + record.get("roll_no"));
}

console.log("Count :: " + (await teacherTable.count()));

await conn.closeConnection();
```

#### Using cursor

```ts
const recordCursor = await teacherTable
  .select()
  .orderBy("roll_no", "DESC")
  .execute();

for await (const record of recordCursor) {
  console.log(record.get("name") + " :: " + record.get("roll_no"));
}
```

## Intercepting database operations

Intercept and compute student full name before insert and print all records
after

```ts
const conn = await odm.connect(true);

await conn.defineTable({
  name: "student",
  columns: [
    {
      name: "first_name",
      type: "string",
    },
    {
      name: "last_name",
      type: "string",
    },
    {
      name: "full_name", /* Value computed in intercept */
      type: "string",
    },
  ],
});

class FullNameIntercept extends DatabaseOperationInterceptor {
  getName() {
    return "full-name-intercept";
  }

  async intercept(
    tableName: string,
    operation: DatabaseOperationType,
    when: DatabaseOperationWhen,
    records: Record[],
    _context: DatabaseOperationContext,
  ) {
    if (tableName === "student") {
      console.log(
        `[collectionName=${tableName}, operation=${operation}, when=${when}]`,
      );
      if (operation === "INSERT") {
        if (when === "BEFORE") {
          for (const record of records) {
            console.log(
              `Full name field updated for :: ${record.get("first_name")}`,
            );
            record.set(
              "full_name",
              `${record.get("first_name")} ${record.get("last_name")}`,
            );
          }
        }
      }
      if (operation === "SELECT") {
        if (when === "AFTER") {
          for (const record of records) {
            console.log(JSON.stringify(record.toJSON(), null, 4));
          }
        }
      }
    }
    return records;
  }
}

odm.addInterceptor(new FullNameIntercept());

const studentTable = conn.table("student");
const studentRecord = studentTable.createNewRecord();
studentRecord.set("first_name", "John");
studentRecord.set("last_name", "Doe");
await studentRecord.insert();
await studentTable.select().toArray();
/* This will print the following:
[collectionName=student, operation=INSERT, when=BEFORE]
Full name field updated for :: John
[collectionName=student, operation=INSERT, when=AFTER]
[collectionName=student, operation=SELECT, when=BEFORE]
[collectionName=student, operation=SELECT, when=AFTER]
{
    "id": "653c21bb-7d92-435e-a742-1da749f914dd",
    "_table": "student",
    "first_name": "John",
    "last_name": "Doe",
    "full_name": "John Doe"
}
*/

await conn.closeConnection();
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
      ) {
        throw new Error("Not a valid email");
      }
    }
  })(),
);

await conn.defineTable({
  name: "student",
  columns: [
    {
      name: "name",
      type: "string",
    },
    {
      name: "personal_contact",
      type: "email",
    },
    {
      name: "emp_no",
      type: "uuid",
    },
    {
      name: "salary",
      type: "integer",
    },
    {
      name: "birth_date",
      type: "date",
    },
    {
      name: "gender",
      type: "boolean",
    },
  ],
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
      type: "string",
    },
  ],
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
      type: "string",
    },
  ],
});

const dogTable = conn.table("dog");
const husky = dogTable.createNewRecord();
husky.set("name", "Jimmy");
husky.set("breed", "Husky");
await husky.insert();

const animalCursor = await animalTable.select().execute();

for await (const animal of animalCursor()) {
  console.log(animal.toJSON());
}

await conn.closeConnection();
```

| Data type    | Record.get             | Record.getJSONValue |
|--------------|------------------------|---------------------|
| **date**     | Temporal.PlainDate     | string              |
| **datetime** | Temporal.PlainDateTime | string              |
| **integer**  | number                 | number              |
| **json**     | {}                     | {}                  |
| **number**   | number                 | number              |
| **string**   | string                 | string              |

Check the examples >> [here](./examples) <<

## Code of Conduct

[Contributor Covenant](/CODE_OF_CONDUCT.md)
