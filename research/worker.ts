const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

self.onmessage = async (e) => {
  console.log(`WORKER ${e.data.post}========================================`);

  for (let i = 0; i < 100; i++) {
    console.log(`${e.data.post} INDEX : ${i}`);
    await delay(e.data.delay);
  }

  self.postMessage("complete");
};
