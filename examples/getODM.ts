import { DatabaseConfiguration, ODM } from "../mod.ts";

export default async function () {
  const odm = new ODM();

  const config: DatabaseConfiguration = {
    host: "127.0.0.1",
    port: 27017,
    database: "odm-example-db",
    dialect: "mongodb"
  };

  await odm.connect(config);
  console.log("connection success");
  return odm;
}
