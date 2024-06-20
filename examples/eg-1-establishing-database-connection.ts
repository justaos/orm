import { ORM } from "../mod.ts";
import type ORMClient from "../src/ORMClient.ts";

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
  client.closeConnection();
} catch (error) {
  console.log("Error while establishing connection", error);
}
