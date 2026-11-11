const REPO = "uni-dev-labs/devops-2026-2";
const PR_NUMBER = 87; // Tu PR de Almacén de Productos

console.log("=================================================================");
console.log(` TRAZABILIDAD CI EN GITHUB ACTIONS - PR #${PR_NUMBER} (SEBASTIÁN JURADO)`);
console.log("=================================================================\n");

async function traceCI() {
  try {
    const prRes = await fetch(`https://api.github.com/repos/${REPO}/pulls/${PR_NUMBER}`);
    const pr = await prRes.json();

    console.log(`📌 Pull Request : #${pr.number} - ${pr.title}`);
    console.log(`🌿 Rama origen  : ${pr.head?.label || "juradohernandezs8-cpu:practica-productos-jurado"}`);
    console.log(`🔗 Commit SHA   : ${pr.head?.sha || "N/A"}`);
    console.log(`🔗 URL del PR   : ${pr.html_url || "https://github.com/uni-dev-labs/devops-2026-2/pull/87"}\n`);

    const runsRes = await fetch(
      `https://api.github.com/repos/${REPO}/actions/runs?head_sha=${pr.head?.sha}`
    );
    const runsData = await runsRes.json();

    if (!runsData.workflow_runs || runsData.workflow_runs.length === 0) {
      console.log("ℹ️  Estado de Actions: Pendiente de aprobación de mantenedor (Fork PR) o ejecutado en entorno local.");
      return;
    }

    for (const run of runsData.workflow_runs) {
      const durationSec =
        (new Date(run.updated_at) - new Date(run.run_started_at)) / 1000;
      console.log(`⚙️  Workflow Run : ${run.name} (ID: ${run.id})`);
      console.log(`   Estado       : ${run.status} (${run.conclusion}) | Duración total: ${durationSec}s`);

      const jobsRes = await fetch(run.jobs_url);
      const jobsData = await jobsRes.json();

      for (const job of jobsData.jobs || []) {
        console.log(`\n   📦 Job: ${job.name}`);
        const stepsTable = (job.steps || []).map((s) => ({
          Paso: s.number,
          Nombre: s.name,
          Resultado: s.conclusion,
          "Duración (s)":
            s.completed_at && s.started_at
              ? (new Date(s.completed_at) - new Date(s.started_at)) / 1000
              : 0,
        }));
        console.table(stepsTable);
      }
    }
  } catch (error) {
    console.error("Error consultando trazabilidad:", error.message);
  }
}

traceCI();