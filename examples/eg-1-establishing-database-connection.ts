import { ODM } from "../mod.ts";

const odm = new ODM();

try {
  await odm.connect("mongodb://127.0.0.1:27017/collection-service");
  console.log("connection success");
  const isDbExists = await odm.databaseExists();

  if (isDbExists) {
    console.log("db exists");
  } else {
    console.log("db does not exists");
  }
} catch (_error) {
  console.log("connection failed");
} finally {
  await odm.closeConnection();
}
