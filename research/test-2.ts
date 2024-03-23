const worker = new Worker(new URL("./worker.ts", import.meta.url).href, {
  type: "module",
  deno: {
    permissions: "inherit",
  },
});

/*worker.postMessage({ post: "BBBBBB" });
console.log("posted message");
worker.postMessage({ post: "CCCCCC" });
console.log("posted message");*/

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
