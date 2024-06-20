const worker = new Worker(new URL("./worker-db.ts", import.meta.url).href, {
  type: "module",
  deno: {
    permissions: "inherit",
  },
});

const interval = setInterval(() => {
  worker.postMessage("status");
}, 100);

function startThreads() {
  console.log(worker);
  worker.postMessage({ post: "FIRST LOOP", delay: 100 });
  console.log("posted message first");

  worker.postMessage({ post: "SECOND LOOP", delay: 200 });
  console.log("posted message second");

  worker.postMessage({ post: "THIRD LOOP", delay: 300 });
  console.log("posted message third");
}

let i = 0;

worker.addEventListener("message", function (e) {
  if (e.data === "online") {
    clearInterval(interval);
    startThreads();
  } else if (e.data === "complete") {
    console.log("done");
    i++;
    if (i == 3) worker.terminate();
  }
});
