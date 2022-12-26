import { ODM } from "../mod.ts";

const odm = new ODM();

const config = {
  host: "127.0.0.1",
  port: "27017",
  database: "anysols-collection-service",
  dialect: "mongodb",
};

try {
  const output = await odm.connect(config);
  console.log("connection success");
  odm.databaseExists().then(
    () => {
      console.log("db exists");
      odm.closeConnection();
    },
    () => {
      console.log("db does not exists");
      odm.closeConnection();
    },
  );
} catch (e) {
  console.log("connection failed");
  odm.closeConnection();
}
