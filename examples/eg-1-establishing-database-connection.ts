import { ODM } from "../mod.ts";
import ODMConnection from "../src/ODMConnection.ts";

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
