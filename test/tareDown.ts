import { Session } from "./test.utils.ts";

const conn = await Session.getConnection();
await conn.dropDatabase();
