import { Session } from "./test.utils.ts";

const client = await Session.getClient();
await client.dropDatabase();
