import getORM from "./getORM.ts";

const odm = getORM();
const conn = await odm.connect(true);

await client.defineTable({
  name: "department",
  columns: [
    {
      name: "name",
      type: "string",
      unique: true,
    },
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
      unique: true,
    },
    {
      name: "department",
      type: "string",
      foreign_key: {
        table: "department",
        column: "name",
        on_delete: "CASCADE",
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

await client.closeConnection();
