import { DatabaseConfiguration, ODM } from "../mod.ts";

export default function () {
  const config: DatabaseConfiguration = {
    database: "odm-example-db",
    username: "postgres",
    password: "admin",
    hostname: "localhost",
    port: 5432
  };
  return new ODM(config);
}
