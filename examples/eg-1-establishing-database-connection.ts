import { ORM } from "../mod.ts";
import ORMConnection from "../src/ORMConnection.ts";

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
