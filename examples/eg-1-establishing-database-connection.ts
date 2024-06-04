import { ORM } from "../mod.ts";
import ORMConnection from "../src/ORMConnection.ts";

const odm = new ORM({
  database: "school-database",
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
