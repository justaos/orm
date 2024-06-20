const worker = new Worker(new URL("./worker-db.ts", import.meta.url).href, {
  type: "module",
  deno: {
    permissions: "inherit",
  },
});

setTimeout(() => {
  worker.postMessage({ post: "AAAAAA" });
  console.log("posted message");
}, 1000);

setTimeout(() => {
  worker.postMessage({ post: "BBBBBB" });
  console.log("posted message");
}, 1000);

setTimeout(() => {
  worker.postMessage({ post: "CCCCCC" });
  console.log("posted message");
}, 1000);
