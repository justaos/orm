import postgres from "https://deno.land/x/postgresjs@v3.4.3/mod.js";

const sql = postgres({
  username: "postgres",
  password: "admin",
  hostname: "localhost",
  port: 5432
});



//const output = await sql`SELECT EXISTS(SELECT 1 FROM pg_namespace WHERE nspname = 'tesaaaa');`

const query= sql`CREATE DATABASE ${ sql('tesssssss')}`;


console.log(query);

const output = await query;

console.log(output);

sql.end();
