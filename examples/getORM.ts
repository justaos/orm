import { DatabaseConfiguration, ORM } from "../mod.ts";

export default function () {
  const config: DatabaseConfiguration = {
    database: "odm-example-db",
    username: "postgres",
    password: "postgres",
    hostname: "localhost",
    port: 5432,
  };
  return new ORM(config);
}
