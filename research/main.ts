const worker = new Worker(new URL("./worker.ts", import.meta.url).href, {
  type: "module",
  deno: {
    permissions: "inherit",
  },
});

setTimeout(() => {
  worker.postMessage({ post: "FIRST LOOP", delay: 100 });
  console.log("posted message");
}, 1);

setTimeout(() => {
  worker.postMessage({ post: "SECOND LOOP", delay: 200 });
  console.log("posted message");
}, 1000);

setTimeout(() => {
  worker.postMessage({ post: "THIRD LOOP", delay: 300 });
  console.log("posted message");
}, 2000);

let i = 0;

worker.addEventListener("message", function () {
  console.log("done");
  i++;
  if (i == 3) worker.terminate();
});
