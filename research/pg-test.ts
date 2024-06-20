import { pg } from "../deps.ts";

const pool = new pg.Pool({
  user: "postgres",
  database: "orm-performance-test",
  password: "postgres",
  port: 5432,
  host: "localhost",
  max: 20,
});

await pool.connect();
