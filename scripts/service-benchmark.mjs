import { performance } from "node:perf_hooks";
import { execSync } from "node:child_process";
import fs from "node:fs";

// Aseguramos que el código TypeScript esté compilado en dist/
if (!fs.existsSync("./dist/services/product-store.js")) {
  console.log("Compilando TypeScript a dist/ para correr el benchmark...");
  execSync("npm run build", { stdio: "inherit" });
}

const { ProductStore } = await import("../dist/services/product-store.js");
const { createApp } = await import("../dist/app.js");

function percentile(sortedArr, p) {
  const idx = Math.ceil((p / 100) * sortedArr.length) - 1;
  return sortedArr[Math.max(0, idx)];
}

async function runBenchmark(name, iterations, fn) {
  const times = [];
  const startCpu = process.cpuUsage();
  const startWall = performance.now();

  for (let i = 0; i < iterations; i++) {
    const t0 = performance.now();
    await fn(i);
    const t1 = performance.now();
    times.push(t1 - t0);
  }

  const totalWallMs = performance.now() - startWall;
  const cpu = process.cpuUsage(startCpu);
  const mem = process.memoryUsage();

  times.sort((a, b) => a - b);
  const avgMs = times.reduce((a, b) => a + b, 0) / times.length;
  const p95Ms = percentile(times, 95);
  const maxMs = times[times.length - 1];
  const opsSec = Math.round((iterations / totalWallMs) * 1000);

  return {
    Servicio: name,
    Iteraciones: iterations,
    "Avg (ms)": Number(avgMs.toFixed(4)),
    "P95 (ms)": Number(p95Ms.toFixed(4)),
    "Max (ms)": Number(maxMs.toFixed(4)),
    "Throughput (ops/s)": opsSec,
    "CPU User (ms)": Number((cpu.user / 1000).toFixed(2)),
    "Heap MB": Number((mem.heapUsed / 1024 / 1024).toFixed(2)),
    "RSS MB": Number((mem.rss / 1024 / 1024).toFixed(2)),
  };
}

console.log("=================================================================");
console.log(" BENCHMARK DE RENDIMIENTO Y RECURSOS - SERVICIOS (TRAZABILIDAD)");
console.log("=================================================================\n");

const store = new ProductStore();
const createdIds = [];
const results = [];

// 1. ProductStore.create
results.push(
  await runBenchmark("ProductStore.create", 2000, (i) => {
    const prod = store.create({
      name: `Producto Benchmark ${i}`,
      sku: `SKU-BENCH-${i}`,
      price: 15000 + i,
      stock: 100,
      category: i % 2 === 0 ? "tecnologia" : "hogar",
    });
    createdIds.push(prod.id);
  })
);

// 2. ProductStore.getById
results.push(
  await runBenchmark("ProductStore.getById", 5000, (i) => {
    store.getById(createdIds[i % createdIds.length]);
  })
);

// 3. ProductStore.getBySku
results.push(
  await runBenchmark("ProductStore.getBySku", 5000, (i) => {
    store.getBySku(`SKU-BENCH-${i % createdIds.length}`);
  })
);

// 4. ProductStore.list (con filtros y ordenamiento)
results.push(
  await runBenchmark("ProductStore.list", 500, () => {
    store.list({ category: "tecnologia", minPrice: 15000 });
  })
);

// 5. ProductStore.update
results.push(
  await runBenchmark("ProductStore.update", 2000, (i) => {
    store.update(createdIds[i % createdIds.length], { price: 20000 + i });
  })
);

// 6. ProductStore.adjustStock
results.push(
  await runBenchmark("ProductStore.adjustStock", 5000, (i) => {
    store.adjustStock(createdIds[i % createdIds.length], i % 2 === 0 ? 1 : -1);
  })
);

// 7. Express API HTTP /health
const app = createApp();
const server = app.listen(0);
const port = server.address().port;

results.push(
  await runBenchmark("Express GET /health (HTTP)", 500, async () => {
    const res = await fetch(`http://127.0.0.1:${port}/health`);
    await res.json();
  })
);

server.close();

// 8. ProductStore.remove
results.push(
  await runBenchmark("ProductStore.remove", 2000, (i) => {
    store.remove(createdIds[i]);
  })
);

console.table(results);