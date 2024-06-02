import { ORM } from "../mod.ts";
import { Session } from "./test.utils.ts";

Session.setORM(
  new ORM({
    hostname: "127.0.0.1",
    port: 5432,
    username: "postgres",
    password: "postgres",
    database: "odm-test-db",
  }),
);

const conn = await Session.getConnection(true);
conn.closeConnection();
