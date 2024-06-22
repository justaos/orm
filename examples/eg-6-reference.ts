import getORM from "./getORM.ts";
import ORMClient from "../src/ORMClient.ts";

const odm = getORM();
let client: ORMClient = await odm.connect(true);
await client.dropDatabase();
client = await odm.connect(true);
await client.defineTable({
  name: "department",
  schema: "system",
  columns: [
    {
      name: "name",
      type: "string",
      unique: true,
    },
  ],
});

await client.defineTable({
  name: "department",
  inherits: "system.department",
  columns: [
    {
      name: "description",
      type: "string",
    },
  ],
});

await client.defineTable({
  name: "employee",
  columns: [
    {
      name: "name",
      type: "string",
    },
    {
      name: "department",
      type: "string",
      foreign_key: {
        table: "department",
        column: "name",
      },
    },
    {
      name: "salary",
      /*  maximum: 10000,*/
      type: "integer",
      not_null: true,
    },
    {
      name: "birth_date",
      type: "date",
    },
    {
      name: "created_on",
      type: "datetime",
    },
    {
      name: "gender",
      type: "boolean",
    },
    {
      name: "address",
      type: "json",
    },
    {
      name: "rating",
      type: "number",
      default: 4.5,
    },
  ],
});

const departmentTable = client.table("department");

const department = departmentTable.createNewRecord();
department.set("name", "HR2");
department.set("description", "Human Resources");
await department.insert();

client = await odm.connect();
const employeeTable = client.table("employee");
const employee = employeeTable.createNewRecord();
employee.set("name", "John Doe");
employee.set("department", "HR2");
employee.set("salary", 5000);
employee.set("birth_date", new Date());
employee.set("created_on", new Date());
await employee.insert();

client.closeConnection();

// https://www.the-art-of-web.com/sql/inheritance-foreign-key/
