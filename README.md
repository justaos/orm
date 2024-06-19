# JUSTAOS's ORM

![GitHub release (with filter)](https://img.shields.io/github/v/release/justaos/orm?label=Release)
[![Build](https://github.com/justaos/orm/workflows/Build/badge.svg)](https://github.com/justaos/orm/actions?workflow=Build)
[![Coverage](https://codecov.io/gh/justaos/orm/branch/main/graph/badge.svg?token=OzlniGFmNp)](https://codecov.io/gh/justaos/orm)
[![License](https://img.shields.io/github/license/justaos/orm.svg)](/LICENSE)
[![Contributors](https://img.shields.io/github/contributors/justaos/orm.svg)]()

JUSTAOS's ORM (Object Relational Mapping) tool is built for Deno and provides
transparent persistence for JavaScript objects to Postgres database.

- Supports all primitive data types (string, integer, float, boolean, date,
  object, array, etc.).
- Supports custom data types.
- Supports table with multi-level inheritance.
- Also supports interception on operations (create, read, update and delete).

```ts
import { ORM } from "jsr:@justaos/orm";
```

## Database connection

```ts
const odm = new ORM({
  database: "school-database",
  username: "postgres",
  password: "postgres",
  hostname: "localhost",
  port: 5432,
});

try {
  const client: ORMClient = await odm.connect(
    true, /* create database if not exists */
  );
  console.log("Client connected successfully");
  await client.closeConnection(); // terminate all connections in the pool
} catch (error) {
  console.log("Error while establishing connection", error);
}
```

## Defining tables

Definition automatically includes `id` and `_table` fields on every table.

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
      type: "uuid",
      foreign_key: {
        table: "department",
        column: "id",
        on_delete: "CASCADE",
      },
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
await client.defineTable({
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
    {
      name: "age",
      type: "integer",
    },
  ],
});

const teacherTable = client.table("teacher");
for (let i = 0; i < 10; i++) {
  const teacher = teacherTable.createNewRecord();
  teacher.set("name", "a" + (i + 1));
  teacher.set("roll_no", i + 1);
  teacher.set("age", 10 * ((i + 1) % 2));
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

await client.closeConnection();
```

## Querying with compound 'OR' and 'AND' conditions

```ts
// Where 'age' is 10  and (name is 'a1' or 'roll_no' is 5)
// SELECT * FROM public.teacher WHERE "age" = 10 AND ("name" = 'a1' OR "roll_no" = 5)

const selectQuery = teacherTable.select();
selectQuery.where("name", "a1");

const compoundOrQuery = selectQuery.compoundOr();
compoundOrQuery.where("roll_no", 4);
compoundOrQuery.where("roll_no", 2);

records = await selectQuery.toArray();

console.log(records.map((t) => t.toJSON()));
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

await client.defineTable({
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

class FullNameIntercept extends RecordInterceptor {
  getName() {
    return "full-name-intercept";
  }

  async intercept(
    tableName: string,
    interceptType: TRecordInterceptorType,
    records: Record[],
    _context: DatabaseOperationContext,
  ) {
    if (tableName === "student") {
      console.log(`[collectionName=${tableName}, when=${interceptType}]`);
      if (interceptType === "BEFORE_INSERT") {
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
      if (interceptType === "AFTER_SELECT") {
        for (const record of records) {
          console.log(JSON.stringify(record.toJSON(), null, 4));
        }
      }
    }
    return records;
  }
}

odm.addInterceptor(new FullNameIntercept());

const studentTable = client.table("student");
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

await client.closeConnection();
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

await client.defineTable({
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

const studentTable = client.table("student");
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
await client.defineTable({
  name: "animal",
  columns: [
    {
      name: "name",
      type: "string",
    },
  ],
});

const animalTable = client.table("animal");
const animal = animalTable.createNewRecord();
animal.set("name", "Puppy");
await animal.insert();

await client.defineTable({
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

const dogTable = client.table("dog");
const husky = dogTable.createNewRecord();
husky.set("name", "Jimmy");
husky.set("breed", "Husky");
await husky.insert();

const animalCursor = await animalTable.select().execute();

for await (const animal of animalCursor()) {
  console.log(animal.toJSON());
}

await client.closeConnection();
```

| Data type    | Record.get             | Record.getJSONValue |
| ------------ | ---------------------- | ------------------- |
| **date**     | Temporal.PlainDate     | string              |
| **datetime** | Temporal.PlainDateTime | string              |
| **integer**  | number                 | number              |
| **json**     | {}                     | {}                  |
| **number**   | number                 | number              |
| **string**   | string                 | string              |

Check the examples >> [here](./examples) <<

## Code of Conduct

[Contributor Covenant](/CODE_OF_CONDUCT.md)
