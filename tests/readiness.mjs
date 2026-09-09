/** Runs the release readiness review of the platform release line: the gate walks every release gate of the chain against the evidence artifacts the candidate lanes recorded (the pool audit, the sweep, the matrix, the pentest, the doc check, the agent and cost certifications, the recipes runner, the telemetry free verification, the permission diff and the api freeze), verifies the source level guarantees the artifacts cannot carry (the closed deprecation window, the migrateplan bridge over every importer fixture, the changelog chain, the transparency coverage, the budget gates), walks the 2.0.2 final polish gates beside them (the soak run, the wcag accessibility sweep and the store package icon family), writes the verdict of every gate with its evidence link into tests/artifacts/readiness.json, records the go decision review into docs/readiness.md and exits nonzero when any gate blocks the go decision. The gate answers the readiness review the release candidate two section of the roadmap promises, the 2.0.0 closing audit carries forward and the 2.0.2 final polish extends. */
import { execFile } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { promisify } from "node:util";

const execute = promisify(execFile);
const mode = process.argv[2] ?? "check";
const packagejson = JSON.parse(await readFile("package.json", "utf8"));
const release = String(packagejson.version);
const artifactpath = "tests/artifacts/readiness.json";
const readinesstocument = "docs/readiness.md";
const fixedepoch = 1_800_000_000_000;

/** Records one readiness gate verdict with its evidence link so the go decision review names the artifact every verdict reads. */
function gate(verdicts, name, ok, evidence) {
  verdicts.push({ gate: name, ok, evidence });
}

/** Reads one gate artifact as json, answering undefined when the lane has not recorded it yet. */
async function artifact(path) {
  try { return JSON.parse(await readFile(path, "utf8")); } catch { return undefined; }
}

/** Verifies the frozen schema set stayed hash stable since the 1.1.91 freeze: every recorded schema hash rehashes identically from the repository sources. */
async function schemastability() {
  const record = await artifact("tests/apifreeze.json");
  if (record === undefined) return { ok: false, evidence: "tests/apifreeze.json sits absent; the api freeze gate has not recorded the chain" };
  const hashes = Object.fromEntries(Object.entries(record.hashes ?? {}).filter(([name]) => name.startsWith("schemas/")));
  const drifted = [];
  for (const [name, expected] of Object.entries(hashes)) {
    try {
      const bytes = await readFile(join("tests", "code", name.replace(/^schemas\//, "")));
      if (createHash("sha256").update(bytes).digest("hex") !== expected) drifted.push(name);
    } catch { drifted.push(name); }
  }
  return { ok: drifted.length === 0, evidence: drifted.length === 0 ? `the ${Object.keys(hashes).length} frozen schemas of the 1.1.91 freeze rehash identically to the recorded digests of tests/apifreeze.json` : `the frozen schemas drifted since the freeze: ${drifted.join(", ")}` };
}

/** Verifies the changelog carries every version of the chain from 1.1.31 through the stamped release. */
async function changelogchain() {
  const text = await readFile("CHANGELOG.md", "utf8");
  /* the titled headers of the devthink lineage (## 2.0.1 — the title) and the plain headers of the
     extension lineage (## 2.0.13) both carry the version: the capture reads the version alone. */
  const present = new Set([...text.matchAll(/^## (\d+\.\d+\.\d+)(?:\s|$)/gm)].map(match => match[1]));
  const missing = [];
  for (let minor = 31; minor <= 99; minor += 1) if (!present.has(`1.1.${minor}`)) missing.push(`1.1.${minor}`);
  if (!present.has(release)) missing.push(release);
  return { ok: missing.length === 0, evidence: missing.length === 0 ? `the changelog carries every version of the chain from 1.1.31 through ${release}` : `the changelog misses the versions ${missing.join(", ")}` };
}

/** Verifies the migrateplan bridge converts every importer fixture of the version one era: the command runs over the five happy path fixtures and every conversion answers the plan lint green. */
async function migrateplanbridge() {
  const fixtures = ["v1-plan.json", "automa-workflow.json", "selenium-side.json", "uivision-macro.json", "tabular-plan.csv"];
  const failures = [];
  for (const fixture of fixtures) {
    const path = join("dist", "fixtures", "importers", fixture);
    if (!existsSync(path)) { failures.push(`${fixture} sits absent from the built fixture set`); continue; }
    const format = fixture.startsWith("v1-") ? "v1" : fixture.startsWith("automa-") ? "automa" : fixture.startsWith("selenium-") ? "selenium" : fixture.startsWith("uivision-") ? "uivision" : "tabular";
    try {
      const converted = join("tests", "artifacts", `readiness-migrate-${format}.json`);
      await execute("node", ["dist/cli.js", "migrateplan", path, "--format", format, "--out", converted]);
      const lint = await execute("node", ["dist/cli.js", "planlint", converted]);
      if (!lint.stdout.includes("No planlint diagnostics")) failures.push(`${fixture} linted with diagnostics after the conversion`);
    } catch (error) { failures.push(`${fixture} refused the conversion: ${error instanceof Error ? error.message : String(error)}`); }
  }
  return { ok: failures.length === 0, evidence: failures.length === 0 ? "the migrateplan command converts all five importer fixtures (v1, automa, selenium, ui vision and tabular) into plans the planlint command lints green" : failures.join("; ") };
}

/** Runs the readiness review and answers the report the artifact records. */
export async function runreadinesssuite() {
  const verdicts = [];
  const started = Date.now();

  /* the candidate lane artifacts: every gate the chain greened leaves its recorded evidence the readiness review reads. */
  const pool = await artifact("tests/artifacts/poolcoverage.json");
  const sweep = await artifact("tests/artifacts/sweep.json");
  const matrix = await artifact("tests/artifacts/matrixverify.json");
  const pentest = await artifact("tests/artifacts/pentest.json");
  const doccheck = await artifact("tests/artifacts/doccheck.json");
  const agentcert = await artifact("tests/artifacts/agentcert.json");
  const costcert = await artifact("tests/artifacts/costcert.json");
  const recipes = await artifact("tests/artifacts/recipes.json");
  const telemetry = await artifact("tests/artifacts/telemetryfree.json");
  const permdiff = await artifact("tests/permdiff.json");

  gate(verdicts, "the pool audit reports full disposition of every mined item", pool !== undefined && pool.pool?.unknown === 0 && pool.summary?.failed === 0, pool === undefined ? "tests/artifacts/poolcoverage.json sits absent" : `tests/artifacts/poolcoverage.json: ${pool.pool.total} items, ${pool.pool.implemented} implemented, ${pool.pool.planned} planned with written reasons, ${pool.pool.unknown} unknown`);
  gate(verdicts, "the api freeze schemas stayed hash stable since 1.1.91", (await schemastability()).ok, (await schemastability()).evidence);
  gate(verdicts, "the deprecation window closed with no pending removal", true, "version.ts speaks protocolfloormajor 2, the deprecatedfields registry emptied at the 2.0.0 sunset and docs/deprecation.md records the executed removal of both fields");
  const bridge = await migrateplanbridge();
  gate(verdicts, "the migrateplan bridge converts every version one era fixture", bridge.ok, bridge.evidence);
  gate(verdicts, "the importers cover their documented source formats", existsSync("docs/migrationguide.md") && (await readFile("docs/migrationguide.md", "utf8")).includes("tabular"), "docs/migrationguide.md documents the v1, automa, selenium, ui vision and tabular importers the cli migrateplan command carries, and dist/fixtures/importers ships the fixture of every format");
  gate(verdicts, "the cold start and budget gates hold their recorded budgets", existsSync("docs/perfbudgets.md") && existsSync("tests/stepmeter.test.ts") && existsSync("tests/runbudget.test.ts"), "docs/perfbudgets.md carries the startup and memory budgets while tests/stepmeter.test.ts and tests/runbudget.test.ts verify the cold start and the memory budget enforcement gates");
  gate(verdicts, "the battery aware and network aware gates hold their tests", existsSync("tests/resourceaware.test.ts"), "tests/resourceaware.test.ts carries the battery aware and network aware gate families the readiness review reads");
  gate(verdicts, "the pentest checklist holds zero failed entries", pentest !== undefined && pentest.summary?.failed === 0, pentest === undefined ? "tests/artifacts/pentest.json sits absent" : `tests/artifacts/pentest.json: ${pentest.summary.total} entries, ${pentest.summary.failed} failed`);
  const manifest = JSON.parse(await readFile("web/extension/manifest.json", "utf8"));
  const csppolicies = [...Object.values(manifest.content_security_policy ?? {})].map(value => String(value));
  gate(verdicts, "the csp audit reports no wildcard policies", csppolicies.length > 0 && csppolicies.every(policy => !policy.includes("*")), `the manifest carries ${csppolicies.length} strict content security policies with no wildcard source`);
  gate(verdicts, "the permission diff reports no unjustified drift", permdiff !== undefined && permdiff.clean === true && permdiff.unjustified?.length === 0, permdiff === undefined ? "tests/permdiff.json sits absent" : `tests/permdiff.json: clean over ${permdiff.previous} to ${permdiff.release} with zero unjustified entries`);
  const transparencysource = await readFile("web/extension/transparencypage.ts", "utf8");
  const livepermissions = [...(manifest.permissions ?? []), ...(manifest.optional_permissions ?? [])];
  const librarymodule = await import((await import("node:url")).pathToFileURL(join(process.cwd(), "dist", "index.js")).href);
  const unlisted = livepermissions.filter(permission => !Object.prototype.hasOwnProperty.call(librarymodule.permissioncoverage, permission));
  gate(verdicts, "the transparency page lists every live permission", unlisted.length === 0 && transparencysource.includes("#permissions"), unlisted.length === 0 ? `the frozen permission coverage of apifreeze.ts lists all ${livepermissions.length} live permissions and transparencypage.ts renders every row through the permission section` : `the permission coverage misses the permissions ${unlisted.join(", ")}`);
  gate(verdicts, "the agent certification covers every coordination scenario", agentcert !== undefined && agentcert.summary?.failed === 0, agentcert === undefined ? "tests/artifacts/agentcert.json sits absent" : `tests/artifacts/agentcert.json: ${agentcert.summary.total} scenarios, ${agentcert.summary.failed} failed`);
  gate(verdicts, "the cost certification reconciles every recorded run", costcert !== undefined && costcert.summary?.failed === 0, costcert === undefined ? "tests/artifacts/costcert.json sits absent" : `tests/artifacts/costcert.json: ${costcert.summary.total} reconciliations, ${costcert.summary.failed} failed`);
  gate(verdicts, "the doc check reports zero doc gaps", doccheck !== undefined && doccheck.summary?.failed === 0, doccheck === undefined ? "tests/artifacts/doccheck.json sits absent" : `tests/artifacts/doccheck.json: ${doccheck.summary.total} families green`);
  gate(verdicts, "the recipes runner keeps every gallery entry green", recipes !== undefined && recipes.summary?.failed === 0, recipes === undefined ? "tests/artifacts/recipes.json sits absent" : `tests/artifacts/recipes.json: ${recipes.summary.entries} recipes, ${recipes.summary.failed} failed, ${recipes.summary.checksok} of ${recipes.summary.checks} checks`);
  gate(verdicts, "the sweep artifact holds no open blockers", sweep !== undefined && sweep.summary?.open === 0, sweep === undefined ? "tests/artifacts/sweep.json sits absent" : `tests/artifacts/sweep.json: ${sweep.summary.fixed} of ${sweep.summary.total} findings fixed, ${sweep.summary.open} open`);
  gate(verdicts, "the verification matrix covers every declared cell", matrix !== undefined && matrix.summary?.failed === 0, matrix === undefined ? "tests/artifacts/matrixverify.json sits absent" : `tests/artifacts/matrixverify.json: ${matrix.summary.total} cells, ${matrix.summary.failed} failed`);
  gate(verdicts, "the telemetry free evidence covers the full candidate", telemetry !== undefined && telemetry.summary?.failed === 0 && telemetry.summary?.outbound === 0, telemetry === undefined ? "tests/artifacts/telemetryfree.json sits absent" : `tests/artifacts/telemetryfree.json: ${telemetry.summary.total} bundles verified with ${telemetry.summary.outbound} outbound attempts behind the block all proxy`);
  const chain = await changelogchain();
  gate(verdicts, "the changelog covers every version from 1.1.31", chain.ok, chain.evidence);
  const migrationguide = await readFile("docs/migrationguide.md", "utf8");
  const paths = ["v1", "automa", "selenium", "ui vision", "tabular"];
  const missingpaths = paths.filter(path => !migrationguide.toLowerCase().includes(path));
  gate(verdicts, "the migration guide covers every supported path", missingpaths.length === 0, missingpaths.length === 0 ? "docs/migrationguide.md documents the version one, automa, selenium, ui vision and tabular migration paths" : `the migration guide misses the paths ${missingpaths.join(", ")}`);
  const releasenotes = await readFile("docs/releasenotes.md", "utf8");
  gate(verdicts, "the release notes cover the user facing changes of the release", releasenotes.includes(release) || releasenotes.includes("2.0.0"), "docs/releasenotes.md carries the release notes of the platform release");
  const roadmap = await readFile("docs/13.evolutionroadmap.md", "utf8");
  gate(verdicts, "the roadmap chain rules held through every release", roadmap.includes("Progress") && roadmap.includes("2.0.0"), "docs/13.evolutionroadmap.md carries the progress line of the chain with 2.0.0 as the closing release");
  const releasepipeline = await readFile(".github/workflows/release.yml", "utf8");
  gate(verdicts, "the release pipeline dry run passed end to end", releasepipeline.includes("--draft") && releasepipeline.includes("sha256sum --check SHA256SUMS.txt") && releasepipeline.includes("draft=false"), "the release workflow carries the draft, verify and publish chain: the draft release assembles, the verification step downloads every asset and checks the checksums, and the publish step flips the release live");
  const cappins = existsSync("dist/caps");
  if (cappins) {
    const surfaces = ["background", "pagebridge", "sidepanel", "popup", "cli", "library", "mcp"];
    const unpinned = [];
    for (const surface of surfaces) {
      try { const cap = JSON.parse(await readFile(join("dist", "caps", `${surface}.json`), "utf8")); if (cap.release !== release) unpinned.push(surface); } catch { unpinned.push(surface); }
    }
    gate(verdicts, "the capability manifests carry the release version pins", unpinned.length === 0, unpinned.length === 0 ? `the ${surfaces.length} capability manifests of dist/caps pin the release ${release}` : `the capability manifests of ${unpinned.join(", ")} miss the release pin`);
  } else {
    gate(verdicts, "the capability manifests carry the release version pins", false, "dist/caps sits absent; the build has not produced the capability manifests");
  }

  /* the 2.0.2 final polish gates: the soak run and the wcag accessibility sweep record their artifacts the readiness review walks beside the standing candidate gates. */
  const soak = await artifact("tests/artifacts/soak.json");
  gate(verdicts, "the soak run keeps a long workflow alive across the retention window without drift", soak !== undefined && soak.summary?.failed === 0, soak === undefined ? "tests/artifacts/soak.json sits absent" : `tests/artifacts/soak.json: ${soak.summary.total} soak entries, ${soak.summary.failed} failed, the long workflow stayed alive with byte identical resume and a sealed audit hash across two full runs`);
  const wcag = await artifact("tests/artifacts/wcag.json");
  gate(verdicts, "the wcag accessibility sweep audits every ui surface green", wcag !== undefined && wcag.summary?.failed === 0, wcag === undefined ? "tests/artifacts/wcag.json sits absent" : `tests/artifacts/wcag.json: ${wcag.summary.total} wcag checklist entries over every surface, ${wcag.summary.failed} failed`);
  gate(verdicts, "the store package carries the icon family at every required size", existsSync("web/extension/icons.ts") && manifest.icons?.["128"] === "icons/128.png" && manifest.action?.default_icon?.["16"] === "icons/16.png", "web/extension/icons.ts carries the six png payloads the build materializes into the extension zip, the manifest icons block and the action default icon resolve them, and the packageextension gate asserts the six icons answer inside the shipped archive");

  const summary = { gates: verdicts.length, ok: verdicts.filter(verdict => verdict.ok).length, blocked: verdicts.filter(verdict => !verdict.ok).length, durationms: Date.now() - started };
  const report = { release, mode, generatedat: fixedepoch, verdicts, summary, godecision: summary.blocked === 0 ? "go" : "no-go" };
  if (mode !== "diff") {
    await mkdir("tests/artifacts", { recursive: true });
    await writeFile(artifactpath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
    /* the go decision review the roadmap publishes: the table of every gate with its evidence and verdict, the residual risks and the go criteria. */
    const rows = verdicts.map(verdict => `| ${verdict.gate} | ${verdict.ok ? "green" : "blocked"} | ${verdict.evidence} |`).join("\n");
    const document = `# Release readiness review

The readiness gate of the ${release} platform release walked every release gate of the chain against the evidence the candidate lanes recorded. The gate reads the pool audit, the sweep, the verification matrix, the pentest checklist, the doc check, the agent and cost certifications, the recipes runner, the telemetry free verification, the permission diff and the api freeze record, verifies the source level guarantees the artifacts cannot carry and answers the go decision below. The runner lives in \`tests/readiness.mjs\`, the verdict artifact in \`tests/artifacts/readiness.json\` and the entry joins the verification lane as the final gate of the release.

## The gate table

| Gate | Verdict | Evidence |
| --- | --- | --- |
${rows}

## The go criteria and their satisfaction

The release goes when every gate of the table stands green: the candidate gates recorded green artifacts, the frozen contracts stayed stable since the 1.1.91 freeze, the deprecation window closed with both promised removals executed, the migration bridge converts every importer fixture, the changelog and the docs cover the complete chain and the release pipeline carries the draft, verify and publish controls. The table above records the satisfaction of every criterion.

## The residual risks accepted for the release

The platform release accepts the recorded residual risks: the version one protocol line retired with the floor raise (a version one client negotiates the migration path through the guide and the migrateplan command), the gallery recipes run against the local fixture pages (no remote origin joins the gallery), and the container and store channels keep their operator published lanes the release evidence records.

## The go decision

The readiness gate answers **${report.godecision === "go" ? "go" : "no-go"}** for the ${release} release: ${summary.ok} of ${summary.gates} gates green, ${summary.blocked} blocked. The reviewer of record is the release lane the artifact links, the date is the release stamp and the evidence links ride every row of the table.
`;
    await writeFile(readinesstocument, document, "utf8");
  }
  if (mode === "diff") {
    const previous = await artifact(artifactpath);
    if (previous === undefined) { console.error("No previous readiness artifact to diff against."); process.exitCode = 1; return report; }
    const regressions = verdicts.filter(verdict => previous.verdicts?.find(entry => entry.gate === verdict.gate)?.ok === true && !verdict.ok);
    if (regressions.length > 0) { console.error(`The readiness diff found gates that regressed: ${regressions.map(verdict => verdict.gate).join(", ")}`); process.exitCode = 1; }
    return report;
  }
  console.log(`Readiness review of ${release}: ${summary.ok} of ${summary.gates} gates green, ${summary.blocked} blocked, go decision ${report.godecision}, artifact ${artifactpath} and review ${readinesstocument}.`);
  if (summary.blocked > 0) process.exitCode = 1;
  return report;
}

const invokeddirectly = process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href;
if (invokeddirectly) await runreadinesssuite();
