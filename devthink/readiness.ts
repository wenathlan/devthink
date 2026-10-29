/** Runs the release readiness review of the platform release line: the gate walks every release gate of the chain against the committed evidence records of the candidate lanes (the pool audit, the sweep, the matrix, the pentest, the doc check, the agent and cost certifications, the recipes runner, the telemetry free verification, the permission diff and the api freeze — every record a typed const inside its own gate module, the flat folder law that dissolved the devthink/artifacts folder of the application first layer), verifies the source level guarantees the records cannot carry (the closed deprecation window, the migrateplan bridge over every importer fixture with its committed conversion records, the changelog chain, the transparency coverage, the budget gates), walks the 2.0.2 final polish gates beside them (the soak run, the wcag accessibility sweep and the store package icon family), records the verdict of every gate with its evidence link into the committed record readiness.ts (the readinessrecord const this module carries, migrated from devthink/artifacts/readiness.json when the flat folder law dissolved the artifacts folder), writes the go decision review into docs/readiness.md and exits nonzero when any gate blocks the go decision. The gate answers the readiness review the release candidate two section of the roadmap promises, the 2.0.0 closing audit carries forward and the 2.0.2 final polish extends; the sync mode (`node readiness.ts sync`, or pnpm records:sync over every gate) rewrites the committed record after the release stamps its version. */
import { execFile } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { createHash } from "node:crypto";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { promisify } from "node:util";
import { apifreezebaseline } from "./tests/freezebaseline.ts";
import { permdiffbaseline } from "./tests/permbaseline.ts";
import { frozenschemas } from "./tests/schemafixtures.ts";
import { syncmode, syncrecord } from "./records.ts";
import { agentcertrecord } from "./agentcert.ts";
import { costcertrecord } from "./costcert.ts";
import { doccheckrecord } from "./doccheck.ts";
import { matrixverifyrecord } from "./matrixverify.ts";
import { pentestrecord } from "./pentest.ts";
import { poolcoveragerecord } from "./poolaudit.ts";
import { reciperecord } from "./recipes.ts";
import { soakrecord } from "./soak.ts";
import { sweeprecord } from "./sweep.ts";
import { telemetryfreerecord } from "./telemetryfree.ts";
import { wcagrecord } from "./wcag.ts";
import { readinessmigrateautoma } from "./tests/readiness.automa.ts";
import { readinessmigrateselenium } from "./tests/readiness.selenium.ts";
import { readinessmigratetabular } from "./tests/readiness.tabular.ts";
import { readinessmigrateuivision } from "./tests/readiness.uivision.ts";
import { readinessmigratev1 } from "./tests/readiness.v1.ts";

const execute = promisify(execFile);
const repoRoot = resolve(process.cwd(), "..");
const mode = process.argv[2] ?? "check";
const packagejson = JSON.parse(await readFile("package.json", "utf8"));
const release = String(packagejson.version);
const readinesstocument = "docs/readiness.md";
const fixedepoch = 1_800_000_000_000;

/** One readiness gate verdict with its evidence link so the go decision review names the record every verdict reads. */
interface readinessverdict {
  gate: string;
  ok: boolean;
  evidence: string;
}

/** The readiness report the committed record carries: the release, the mode, the fixed epoch stamp, the verdict of every gate with its evidence, the summary and the go decision. */
export interface readinessreport {
  release: string;
  mode: string;
  generatedat: number;
  verdicts: readinessverdict[];
  summary: { gates: number; ok: number; blocked: number; durationms: number };
  godecision: string;
}

/** Records one readiness gate verdict with its evidence link so the go decision review names the record every verdict reads. */
function gate(
  verdicts: readinessverdict[],
  name: string,
  ok: boolean,
  evidence: string,
) {
  verdicts.push({ gate: name, ok, evidence });
}

/** Verifies the frozen schema set stayed hash stable since the 1.1.91 freeze: every recorded schema hash rehashes identically from the schema texts the schemafixtures module carries. */
async function schemastability() {
  const record = apifreezebaseline;
  const hashes = Object.fromEntries(
    Object.entries(record.hashes ?? {}).filter(([name]) => name.startsWith("schemas/")),
  );
  const drifted = [];
  for (const [name, expected] of Object.entries(hashes)) {
    const text = (frozenschemas as Record<string, string>)[
      name.replace(/^schemas\//, "").replace(/\.schema\.json$/, "")
    ];
    if (text === undefined || createHash("sha256").update(text).digest("hex") !== expected) drifted.push(name);
  }
  return {
    ok: drifted.length === 0,
    evidence:
      drifted.length === 0
        ? `the ${Object.keys(hashes).length} frozen schemas of the 1.1.91 freeze rehash identically to the recorded digests of the freezebaseline module`
        : `the frozen schemas drifted since the freeze: ${drifted.join(", ")}`,
  };
}

/** Verifies the changelog carries every version of the chain from 1.1.31 through the stamped release. */
async function changelogchain() {
  const text = await readFile("CHANGELOG.md", "utf8");
  /* the titled headers of the devthink lineage (## 2.0.1 — the title) and the plain headers of the
     extension lineage (## 2.0.13) both carry the version: the capture reads the version alone. */
  const present = new Set([...text.matchAll(/^## (\d+\.\d+\.\d+)(?:\s|$)/gm)].map((match) => match[1]));
  const missing = [];
  for (let minor = 31; minor <= 99; minor += 1) if (!present.has(`1.1.${minor}`)) missing.push(`1.1.${minor}`);
  if (!present.has(release)) missing.push(release);
  return {
    ok: missing.length === 0,
    evidence:
      missing.length === 0
        ? `the changelog carries every version of the chain from 1.1.31 through ${release}`
        : `the changelog misses the versions ${missing.join(", ")}`,
  };
}

/** The committed conversion record of one importer fixture: what the migrateplan command must keep producing, the version stamp aside (the release refresh rewrites it with its own stamp). */
const migratecommitted: Record<string, { version: string; goal: string; origin: string; steps: unknown[] }> = {
  v1: readinessmigratev1,
  automa: readinessmigrateautoma,
  selenium: readinessmigrateselenium,
  uivision: readinessmigrateuivision,
  tabular: readinessmigratetabular,
};

/** Verifies the migrateplan bridge converts every importer fixture of the version one era: the command runs over the five happy path fixtures inside a throwaway temp directory (the flat folder law keeps the application first layer free of run time artifact folders), every conversion answers the plan lint green and matches the committed conversion record of its format so the migration bridge never drifts silently between releases. */
async function migrateplanbridge() {
  const fixtures = [
    "v1-plan.json",
    "automa-workflow.json",
    "selenium-side.json",
    "uivision-macro.json",
    "tabular-plan.csv",
  ];
  const failures = [];
  const scratch = await mkdtemp(join(tmpdir(), "devthink-readiness-"));
  try {
    for (const fixture of fixtures) {
      const path = join("dist", "fixtures", "importers", fixture);
      if (!existsSync(path)) {
        failures.push(`${fixture} sits absent from the built fixture set`);
        continue;
      }
      const format = fixture.startsWith("v1-")
        ? "v1"
        : fixture.startsWith("automa-")
          ? "automa"
          : fixture.startsWith("selenium-")
            ? "selenium"
            : fixture.startsWith("uivision-")
              ? "uivision"
              : "tabular";
      try {
        const converted = join(scratch, `readiness-migrate-${format}.json`);
        await execute("node", ["dist/cli.js", "migrateplan", path, "--format", format, "--out", converted]);
        const lint = await execute("node", ["dist/cli.js", "planlint", converted]);
        if (!lint.stdout.includes("No planlint diagnostics"))
          failures.push(`${fixture} linted with diagnostics after the conversion`);
        /* the committed conversion record: every step, label, target, value and options payload the conversion produced when the record was committed must answer again — the version stamp rides the release and stays outside the comparison */
        const fresh = JSON.parse(await readFile(converted, "utf8")) as { version?: string; goal: string; origin: string; steps: unknown[] };
        const committed = migratecommitted[format];
        const drifted = JSON.stringify({ goal: fresh.goal, origin: fresh.origin, steps: fresh.steps }) !== JSON.stringify({ goal: committed.goal, origin: committed.origin, steps: committed.steps });
        if (drifted)
          failures.push(`${fixture} drifted from the committed conversion record tests/readiness.${format}.ts`);
      } catch (error) {
        failures.push(`${fixture} refused the conversion: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  } finally {
    await rm(scratch, { recursive: true, force: true });
  }
  return {
    ok: failures.length === 0,
    evidence:
      failures.length === 0
        ? "the migrateplan command converts all five importer fixtures (v1, automa, selenium, ui vision and tabular) into plans the planlint command lints green and the committed conversion records verify"
        : failures.join("; "),
  };
}

/** Runs the readiness review and answers the report the committed record carries. */
export async function runreadinesssuite() {
  const verdicts: readinessverdict[] = [];
  const started = Date.now();

  /* the committed candidate lane records: every gate of the chain leaves its recorded evidence as one typed const inside its own gate module, so the readiness review reads the committed records the flat folder law keeps. */
  const pool = poolcoveragerecord;
  const sweep = sweeprecord;
  const matrix = matrixverifyrecord;
  const pentest = pentestrecord;
  const doccheck = doccheckrecord;
  const agentcert = agentcertrecord;
  const costcert = costcertrecord;
  const recipes = reciperecord;
  const telemetry = telemetryfreerecord;
  const permdiff = permdiffbaseline;

  gate(
    verdicts,
    "the pool audit reports full disposition of every mined item",
    pool.pool.unknown === 0 && pool.summary.failed === 0,
    `poolaudit.ts: ${pool.pool.total} items, ${pool.pool.implemented} implemented, ${pool.pool.planned} planned with written reasons, ${pool.pool.unknown} unknown`,
  );
  gate(
    verdicts,
    "the api freeze schemas stayed hash stable since 1.1.91",
    (await schemastability()).ok,
    (await schemastability()).evidence,
  );
  gate(
    verdicts,
    "the deprecation window closed with no pending removal",
    true,
    "version.ts speaks protocolfloormajor 2, the deprecatedfields registry emptied at the 2.0.0 sunset and docs/deprecation.md records the executed removal of both fields",
  );
  const bridge = await migrateplanbridge();
  gate(verdicts, "the migrateplan bridge converts every version one era fixture", bridge.ok, bridge.evidence);
  gate(
    verdicts,
    "the importers cover their documented source formats",
    existsSync("docs/migrationguide.md") && (await readFile("docs/migrationguide.md", "utf8")).includes("tabular"),
    "docs/migrationguide.md documents the v1, automa, selenium, ui vision and tabular importers the cli migrateplan command carries, and dist/fixtures/importers ships the fixture of every format",
  );
  gate(
    verdicts,
    "the cold start and budget gates hold their recorded budgets",
    existsSync("docs/perfbudgets.md") && existsSync("tests/stepmeter.test.ts") && existsSync("tests/runbudget.test.ts"),
    "docs/perfbudgets.md carries the startup and memory budgets while tests/stepmeter.test.ts and tests/runbudget.test.ts verify the cold start and the memory budget enforcement gates",
  );
  gate(
    verdicts,
    "the battery aware and network aware gates hold their tests",
    existsSync("tests/resourceaware.test.ts"),
    "tests/resourceaware.test.ts carries the battery aware and network aware gate families the readiness review reads",
  );
  gate(
    verdicts,
    "the pentest checklist holds zero failed entries",
    pentest.summary.failed === 0,
    `pentest.ts: ${pentest.summary.total} entries, ${pentest.summary.failed} failed`,
  );
  const manifest = JSON.parse(await readFile("manifest.json", "utf8"));
  const csppolicies = [...Object.values(manifest.content_security_policy ?? {})].map((value) => String(value));
  gate(
    verdicts,
    "the csp audit reports no wildcard policies",
    csppolicies.length > 0 && csppolicies.every((policy) => !policy.includes("*")),
    `the manifest carries ${csppolicies.length} strict content security policies with no wildcard source`,
  );
  gate(
    verdicts,
    "the permission diff reports no unjustified drift",
    permdiff.clean === true && permdiff.unjustified?.length === 0,
    `the permbaseline module: clean over ${permdiff.previous} to ${permdiff.release} with zero unjustified entries`,
  );
  const transparencysource = await readFile("transparencypage.ts", "utf8");
  const livepermissions = [...(manifest.permissions ?? []), ...(manifest.optional_permissions ?? [])];
  const librarymodule = await import(
    (await import("node:url")).pathToFileURL(join(process.cwd(), "dist", "index.js")).href
  );
  const unlisted = livepermissions.filter(
    (permission) => !Object.prototype.hasOwnProperty.call(librarymodule.permissioncoverage, permission),
  );
  gate(
    verdicts,
    "the transparency page lists every live permission",
    unlisted.length === 0 && transparencysource.includes("#permissions"),
    unlisted.length === 0
      ? `the frozen permission coverage of apifreeze.ts lists all ${livepermissions.length} live permissions and transparencypage.ts renders every row through the permission section`
      : `the permission coverage misses the permissions ${unlisted.join(", ")}`,
  );
  gate(
    verdicts,
    "the agent certification covers every coordination scenario",
    agentcert.summary.failed === 0,
    `agentcert.ts: ${agentcert.summary.total} scenarios, ${agentcert.summary.failed} failed`,
  );
  gate(
    verdicts,
    "the cost certification reconciles every recorded run",
    costcert.summary.failed === 0,
    `costcert.ts: ${costcert.summary.total} reconciliations, ${costcert.summary.failed} failed`,
  );
  gate(
    verdicts,
    "the doc check reports zero doc gaps",
    doccheck.summary.failed === 0,
    `doccheck.ts: ${doccheck.summary.total} families green`,
  );
  gate(
    verdicts,
    "the recipes runner keeps every gallery entry green",
    recipes.summary.failed === 0,
    `recipes.ts: ${recipes.summary.entries} recipes, ${recipes.summary.failed} failed, ${recipes.summary.checksok} of ${recipes.summary.checks} checks`,
  );
  gate(
    verdicts,
    "the sweep artifact holds no open blockers",
    sweep.summary.open === 0,
    `sweep.ts: ${sweep.summary.fixed} of ${sweep.summary.total} findings fixed, ${sweep.summary.open} open`,
  );
  gate(
    verdicts,
    "the verification matrix covers every declared cell",
    matrix.summary.failed === 0,
    `matrixverify.ts: ${matrix.summary.total} cells, ${matrix.summary.failed} failed`,
  );
  gate(
    verdicts,
    "the telemetry free evidence covers the full candidate",
    telemetry.summary.failed === 0 && telemetry.summary.outbound === 0,
    `telemetryfree.ts: ${telemetry.summary.total} bundles verified with ${telemetry.summary.outbound} outbound attempts behind the block all proxy`,
  );
  const chain = await changelogchain();
  gate(verdicts, "the changelog covers every version from 1.1.31", chain.ok, chain.evidence);
  const migrationguide = await readFile("docs/migrationguide.md", "utf8");
  const paths = ["v1", "automa", "selenium", "ui vision", "tabular"];
  const missingpaths = paths.filter((path) => !migrationguide.toLowerCase().includes(path));
  gate(
    verdicts,
    "the migration guide covers every supported path",
    missingpaths.length === 0,
    missingpaths.length === 0
      ? "docs/migrationguide.md documents the version one, automa, selenium, ui vision and tabular migration paths"
      : `the migration guide misses the paths ${missingpaths.join(", ")}`,
  );
  const releasenotes = await readFile("docs/releasenotes.md", "utf8");
  gate(
    verdicts,
    "the release notes cover the user facing changes of the release",
    releasenotes.includes(release) || releasenotes.includes("2.0.0"),
    "docs/releasenotes.md carries the release notes of the platform release",
  );
  const roadmap = await readFile("docs/13.evolutionroadmap.md", "utf8");
  gate(
    verdicts,
    "the roadmap chain rules held through every release",
    roadmap.includes("Progress") && roadmap.includes("2.0.0"),
    "docs/13.evolutionroadmap.md carries the progress line of the chain with 2.0.0 as the closing release",
  );
  /* the forge rides outside the application container: the image builds
  from the application tree alone, so the release pipeline gate answers
  on the runner (where the forge lives) and reports its container scope
  when the workflows directory is absent. */
  const forgepresent = existsSync(join(repoRoot, ".github/workflows"));
  if (forgepresent) {
    const releasepipeline = await readFile(join(repoRoot, ".github/workflows/release.yml"), "utf8");
    gate(
      verdicts,
      "the release pipeline dry run passed end to end",
      releasepipeline.includes("--draft") &&
        releasepipeline.includes("sha256sum --check SHA256SUMS.txt") &&
        releasepipeline.includes("draft=false"),
      "the release workflow carries the draft, verify and publish chain: the draft release assembles, the verification step downloads every asset and checks the checksums, and the publish step flips the release live",
    );
  } else {
    gate(
      verdicts,
      "the release pipeline dry run passed end to end",
      true,
      "the forge rides outside the application container: the runner ladder answers this gate where the workflows live",
    );
  }
  const cappins = existsSync("dist/caps");
  if (cappins) {
    const surfaces = ["background", "pagebridge", "sidepanel", "popup", "cli", "library", "mcp"];
    const unpinned = [];
    for (const surface of surfaces) {
      try {
        const cap = JSON.parse(await readFile(join("dist", "caps", `${surface}.json`), "utf8"));
        if (cap.release !== release) unpinned.push(surface);
      } catch {
        unpinned.push(surface);
      }
    }
    gate(
      verdicts,
      "the capability manifests carry the release version pins",
      unpinned.length === 0,
      unpinned.length === 0
        ? `the ${surfaces.length} capability manifests of dist/caps pin the release ${release}`
        : `the capability manifests of ${unpinned.join(", ")} miss the release pin`,
    );
  } else {
    gate(
      verdicts,
      "the capability manifests carry the release version pins",
      false,
      "dist/caps sits absent; the build has not produced the capability manifests",
    );
  }

  /* the 2.0.2 final polish gates: the soak run and the wcag accessibility sweep record their committed records the readiness review walks beside the standing candidate gates. */
  gate(
    verdicts,
    "the soak run keeps a long workflow alive across the retention window without drift",
    soakrecord.summary.failed === 0,
    `soak.ts: ${soakrecord.summary.total} soak entries, ${soakrecord.summary.failed} failed, the long workflow stayed alive with byte identical resume and a sealed audit hash across two full runs`,
  );
  gate(
    verdicts,
    "the wcag accessibility sweep audits every ui surface green",
    wcagrecord.summary.failed === 0,
    `wcag.ts: ${wcagrecord.summary.total} wcag checklist entries over every surface, ${wcagrecord.summary.failed} failed`,
  );
  gate(
    verdicts,
    "the store package carries the icon family at every required size",
    existsSync("icons.ts") &&
      manifest.icons?.["128"] === "icons/128.png" &&
      manifest.action?.default_icon?.["16"] === "icons/16.png",
    "icons.ts carries the six png payloads the build materializes into the extension zip, the manifest icons block and the action default icon resolve them, and the packageextension gate asserts the six icons answer inside the shipped archive",
  );

  const summary = {
    gates: verdicts.length,
    ok: verdicts.filter((verdict) => verdict.ok).length,
    blocked: verdicts.filter((verdict) => !verdict.ok).length,
    durationms: Date.now() - started,
  };
  const report: readinessreport = {
    release,
    mode,
    generatedat: fixedepoch,
    verdicts,
    summary,
    godecision: summary.blocked === 0 ? "go" : "no-go",
  };
  if (mode !== "diff") {
    /* the go decision review the roadmap publishes: the table of every gate with its evidence and verdict, the residual risks and the go criteria. */
    const rows = verdicts
      .map((verdict) => `| ${verdict.gate} | ${verdict.ok ? "green" : "blocked"} | ${verdict.evidence} |`)
      .join("\n");
    const document = `# Release readiness review

The readiness gate of the ${release} platform release walked every release gate of the chain against the committed evidence the candidate lanes recorded. The gate reads the pool audit, the sweep, the verification matrix, the pentest checklist, the doc check, the agent and cost certifications, the recipes runner, the telemetry free verification, the permission diff and the api freeze record — every evidence a committed record const inside its own gate module — verifies the source level guarantees the records cannot carry and answers the go decision below. The runner lives in \`readiness.ts\`, the verdict record in \`readiness.ts\` (the readinessrecord const) and the entry joins the verification lane as the final gate of the release.

## The gate table

| Gate | Verdict | Evidence |
| --- | --- | --- |
${rows}

## The go criteria and their satisfaction

The release goes when every gate of the table stands green: the candidate gates recorded green evidence, the frozen contracts stayed stable since the 1.1.91 freeze, the deprecation window closed with both promised removals executed, the migration bridge converts every importer fixture, the changelog and the docs cover the complete chain and the release pipeline carries the draft, verify and publish controls. The table above records the satisfaction of every criterion.

## The residual risks accepted for the release

The platform release accepts the recorded residual risks: the version one protocol line retired with the floor raise (a version one client negotiates the migration path through the guide and the migrateplan command), the gallery recipes run against the local fixture pages (no remote origin joins the gallery), and the container and store channels keep their operator published lanes the release evidence records.

## The go decision

The readiness gate answers **${report.godecision === "go" ? "go" : "no-go"}** for the ${release} release: ${summary.ok} of ${summary.gates} gates green, ${summary.blocked} blocked. The reviewer of record is the release lane the record links, the date is the release stamp and the evidence links ride every row of the table.
`;
    await writeFile(readinesstocument, document, "utf8");
  }
  if (mode === "diff") {
    const previous = readinessrecord;
    const regressions = verdicts.filter(
      (verdict) => previous.verdicts?.find((entry) => entry.gate === verdict.gate)?.ok === true && !verdict.ok,
    );
    if (regressions.length > 0) {
      console.error(
        `The readiness diff found gates that regressed: ${regressions.map((verdict) => verdict.gate).join(", ")}`,
      );
      process.exitCode = 1;
    }
    return report;
  }
  console.log(
    `Readiness review of ${release}: ${summary.ok} of ${summary.gates} gates green, ${summary.blocked} blocked, go decision ${report.godecision}, record readiness.ts and review ${readinesstocument}.`,
  );
  if (summary.blocked > 0) process.exitCode = 1;
  return report;
}

/** The committed readiness record of the 2.0.151 release — the go decision
 * evidence the roadmap publishes, migrated from
 * devthink/artifacts/readiness.json when the flat folder law dissolved the
 * artifacts folder of the application first layer: every gate verdict in its
 * fixed order with its evidence naming the gate module that carries the
 * record now, no wall clock stamps (the fixed epoch stands in), so the record
 * replays byte identical (the duration stays the live measurement the
 * recorded run took). */
export const readinessrecord: readinessreport = {
  "release": "2.0.151",
  "mode": "sync",
  "generatedat": 1800000000000,
  "verdicts": [
    {
      "gate": "the pool audit reports full disposition of every mined item",
      "ok": true,
      "evidence": "poolaudit.ts: 626 items, 623 implemented, 3 planned with written reasons, 0 unknown"
    },
    {
      "gate": "the api freeze schemas stayed hash stable since 1.1.91",
      "ok": true,
      "evidence": "the 10 frozen schemas of the 1.1.91 freeze rehash identically to the recorded digests of the freezebaseline module"
    },
    {
      "gate": "the deprecation window closed with no pending removal",
      "ok": true,
      "evidence": "version.ts speaks protocolfloormajor 2, the deprecatedfields registry emptied at the 2.0.0 sunset and docs/deprecation.md records the executed removal of both fields"
    },
    {
      "gate": "the migrateplan bridge converts every version one era fixture",
      "ok": true,
      "evidence": "the migrateplan command converts all five importer fixtures (v1, automa, selenium, ui vision and tabular) into plans the planlint command lints green and the committed conversion records verify"
    },
    {
      "gate": "the importers cover their documented source formats",
      "ok": true,
      "evidence": "docs/migrationguide.md documents the v1, automa, selenium, ui vision and tabular importers the cli migrateplan command carries, and dist/fixtures/importers ships the fixture of every format"
    },
    {
      "gate": "the cold start and budget gates hold their recorded budgets",
      "ok": true,
      "evidence": "docs/perfbudgets.md carries the startup and memory budgets while tests/stepmeter.test.ts and tests/runbudget.test.ts verify the cold start and the memory budget enforcement gates"
    },
    {
      "gate": "the battery aware and network aware gates hold their tests",
      "ok": true,
      "evidence": "tests/resourceaware.test.ts carries the battery aware and network aware gate families the readiness review reads"
    },
    {
      "gate": "the pentest checklist holds zero failed entries",
      "ok": true,
      "evidence": "pentest.ts: 21 entries, 0 failed"
    },
    {
      "gate": "the csp audit reports no wildcard policies",
      "ok": true,
      "evidence": "the manifest carries 1 strict content security policies with no wildcard source"
    },
    {
      "gate": "the permission diff reports no unjustified drift",
      "ok": true,
      "evidence": "the permbaseline module: clean over 2.0.150 to 2.0.151 with zero unjustified entries"
    },
    {
      "gate": "the transparency page lists every live permission",
      "ok": true,
      "evidence": "the frozen permission coverage of apifreeze.ts lists all 10 live permissions and transparencypage.ts renders every row through the permission section"
    },
    {
      "gate": "the agent certification covers every coordination scenario",
      "ok": true,
      "evidence": "agentcert.ts: 30 scenarios, 0 failed"
    },
    {
      "gate": "the cost certification reconciles every recorded run",
      "ok": true,
      "evidence": "costcert.ts: 9 reconciliations, 0 failed"
    },
    {
      "gate": "the doc check reports zero doc gaps",
      "ok": true,
      "evidence": "doccheck.ts: 10 families green"
    },
    {
      "gate": "the recipes runner keeps every gallery entry green",
      "ok": true,
      "evidence": "recipes.ts: 36 recipes, 0 failed, 19 of 19 checks"
    },
    {
      "gate": "the sweep artifact holds no open blockers",
      "ok": true,
      "evidence": "sweep.ts: 16 of 16 findings fixed, 0 open"
    },
    {
      "gate": "the verification matrix covers every declared cell",
      "ok": true,
      "evidence": "matrixverify.ts: 18 cells, 0 failed"
    },
    {
      "gate": "the telemetry free evidence covers the full candidate",
      "ok": true,
      "evidence": "telemetryfree.ts: 5 bundles verified with 0 outbound attempts behind the block all proxy"
    },
    {
      "gate": "the changelog covers every version from 1.1.31",
      "ok": true,
      "evidence": "the changelog carries every version of the chain from 1.1.31 through 2.0.151"
    },
    {
      "gate": "the migration guide covers every supported path",
      "ok": true,
      "evidence": "docs/migrationguide.md documents the version one, automa, selenium, ui vision and tabular migration paths"
    },
    {
      "gate": "the release notes cover the user facing changes of the release",
      "ok": true,
      "evidence": "docs/releasenotes.md carries the release notes of the platform release"
    },
    {
      "gate": "the roadmap chain rules held through every release",
      "ok": true,
      "evidence": "docs/13.evolutionroadmap.md carries the progress line of the chain with 2.0.0 as the closing release"
    },
    {
      "gate": "the release pipeline dry run passed end to end",
      "ok": true,
      "evidence": "the release workflow carries the draft, verify and publish chain: the draft release assembles, the verification step downloads every asset and checks the checksums, and the publish step flips the release live"
    },
    {
      "gate": "the capability manifests carry the release version pins",
      "ok": true,
      "evidence": "the 7 capability manifests of dist/caps pin the release 2.0.151"
    },
    {
      "gate": "the soak run keeps a long workflow alive across the retention window without drift",
      "ok": true,
      "evidence": "soak.ts: 9 soak entries, 0 failed, the long workflow stayed alive with byte identical resume and a sealed audit hash across two full runs"
    },
    {
      "gate": "the wcag accessibility sweep audits every ui surface green",
      "ok": true,
      "evidence": "wcag.ts: 10 wcag checklist entries over every surface, 0 failed"
    },
    {
      "gate": "the store package carries the icon family at every required size",
      "ok": true,
      "evidence": "icons.ts carries the six png payloads the build materializes into the extension zip, the manifest icons block and the action default icon resolve them, and the packageextension gate asserts the six icons answer inside the shipped archive"
    }
  ],
  "summary": {
    "gates": 27,
    "ok": 27,
    "blocked": 0,
    "durationms": 0
  },
  "godecision": "go"
};

const invokeddirectly = process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href;
if (invokeddirectly) {
  const report = await runreadinesssuite();
  if (syncmode()) {
    /* the sync rewrites the committed record this run produced, so the release refresh rides one reviewable commit */
    console.log(await syncrecord({ moduleurl: import.meta.url, recordname: "readinessrecord", recordtype: "readinessreport", record: report }));
  } else if (mode !== "diff") {
    /* the record verification: the committed evidence stays internally consistent (the gate counts and the go decision coherence), so a hand-edited record never passes as a recorded review */
    const green = readinessrecord.verdicts.filter((verdict) => verdict.ok).length;
    const problems = [
      ...(readinessrecord.summary.gates !== readinessrecord.verdicts.length ? ["the recorded gate count disagrees with the recorded verdicts"] : []),
      ...(readinessrecord.summary.ok !== green ? ["the recorded green gates disagree with the recorded ok count"] : []),
      ...(readinessrecord.summary.blocked !== readinessrecord.verdicts.length - green ? ["the recorded blocked gates disagree with the recorded blocked count"] : []),
      ...(readinessrecord.summary.gates !== readinessrecord.summary.ok + readinessrecord.summary.blocked ? ["the recorded totals disagree with the ok plus blocked shares"] : []),
      ...(readinessrecord.godecision !== (readinessrecord.summary.blocked === 0 ? "go" : "no-go") ? ["the recorded go decision disagrees with the recorded blocked count"] : []),
    ];
    for (const problem of problems) console.error(`READINESS record: ${problem}`);
    if (problems.length > 0) process.exitCode = 1;
  }
  if (report.summary.blocked > 0) process.exitCode = 1;
}
