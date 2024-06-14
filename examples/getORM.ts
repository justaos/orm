import { ORM } from "../mod.ts";
import { LoggerUtils } from "../deps.ts";
const logger = LoggerUtils.defineLogger("ORMDemo", "DEBUG");

export default function () {
  return new ORM(
    {
      database: "school-database",
      username: "postgres",
      password: "postgres",
      hostname: "localhost",
      port: 5432,
    },
    logger,
  );
}
