import postgres from "https://deno.land/x/postgresjs@v3.4.3/mod.js";

const sql = postgres({
  username: "postgres",
  password: "postgres",
  hostname: "localhost",
  port: 5432,
});

//const output = await sql`SELECT EXISTS(SELECT * FROM _schema_registry WHERE nspname = 'tesaaaa');`

const cursor = await sql`SELECT * FROM _schema_registry`.cursor();

console.log(cursor);

for await (const [row] of cursor) {
  console.log(row);
}

sql.end();
