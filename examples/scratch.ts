const status = await Deno.permissions.query({ name: "env" });
console.log(status.state);
console.log("testing");
