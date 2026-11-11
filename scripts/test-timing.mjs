import { spawnSync } from "node:child_process";
import { performance } from "node:perf_hooks";
import fs from "node:fs";

const mode = process.argv[2] || "all";
const args = ["vitest", "run", "--reporter=json"];

if (mode === "productos") {
  args.push("tests/practica-productos");
}

console.log(`\n⏱️  Ejecutando medición de tiempos de tests (modo: ${mode})...\n`);
const t0 = performance.now();
const proc = spawnSync("npx", args, { encoding: "utf-8", shell: true });
const wallTimeMs = (performance.now() - t0).toFixed(2);

try {
  const jsonStart = proc.stdout.indexOf("{");
  const report = JSON.parse(proc.stdout.slice(jsonStart));

  const fileRows = report.testResults.map((file) => {
    const durationMs = file.endTime - file.startTime;
    const shortName = file.name.split(/[/\\]/).slice(-2).join("/");
    return {
      Archivo: shortName,
      "Tests Totales": file.assertionResults.length,
      "Pasaron": file.assertionResults.filter((a) => a.status === "passed").length,
      "Duración (ms)": durationMs,
    };
  });

  console.log("=== Duración por archivo de test ===");
  console.table(fileRows);

  const allTests = report.testResults.flatMap((file) =>
    file.assertionResults.map((t) => ({
      Test: t.title,
      Estado: t.status,
      "Duración (ms)": t.duration || 0,
    }))
  );

  allTests.sort((a, b) => b["Duración (ms)"] - a["Duración (ms)"]);

  console.log("=== Top 10 Tests con mayor tiempo de ejecución ===");
  console.table(allTests.slice(0, 10));
  console.log(`✅ Tiempo total de pared (Wall Time): ${wallTimeMs} ms | Tests pasados: ${report.numPassedTests}/${report.numTotalTests}\n`);
} catch (err) {
  console.log(proc.stdout);
}