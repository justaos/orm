import { ORM } from "../mod.ts";

export default function () {
  return new ORM({
    database: "school-database",
    username: "postgres",
    password: "postgres",
    hostname: "localhost",
    port: 5432,
  });
}
