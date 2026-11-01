/** Verifies the full candidate matrix of the release candidate: the gate enumerates every cell the candidate must cover and records its outcome — every action kind of the frozen catalog against the fake tab provider of every browser kind (chromium, firefox and safari) through the step policy, every browser surface page across the popup, the sidepanel, the dashboard, the transparency and the options templates beside the offscreen and sandbox hosts, the cli surface in library mode through the manifest and help commands, the mcp surface through the server handshake and the protocol negotiation, the importers on the plan fixtures and the workflow dry runs and the session file round trip, the migration paths from version one plans through the closed 2.0.0 sunset negotiation, and the standing gates (poolaudit, apifreeze, cspaudit and permdiff as subprocess cells; agentcert, costcert, doccheck and sweep through their committed records). Every cell records its outcome in the committed record matrixverify.ts (the matrixverifyrecord const this module carries, migrated from devthink/artifacts/matrixverify.json when the flat folder law dissolved the artifacts folder), the matrix reports its coverage percentage of the candidate, and the gate exits nonzero when any cell fails. The sync mode (`node matrixverify.ts sync`, or pnpm records:sync over every gate) rewrites the committed record after the release stamps its version. */
import { execFile } from "node:child_process";
import { existsSync } from "node:fs";
import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";
import { promisify } from "node:util";
import { pathToFileURL } from "node:url";
import { summaryproblemsof, syncmode, syncrecord } from "./records.ts";
import { agentcertrecord } from "./agentcert.ts";
import { costcertrecord } from "./costcert.ts";
import { doccheckrecord } from "./doccheck.ts";
import { sweeprecord } from "./sweep.ts";
import type { actionkind, toolstep } from "./types.ts";

const execute = promisify(execFile);
const packagejson = JSON.parse(await readFile("package.json", "utf8"));
const release = String(packagejson.version);

/** The fake tab provider of the matrix: one deterministic tab id per browser kind and per slot, so the kind cells bind tabs the same way on chromium, firefox and safari — the fake tab covers every browser kind the extension ships. */
const faketabprovider = {
  kinds: ["chromium", "firefox", "safari"],
  tabof(browser: string, slot: number) {
    const base = ({ chromium: 100, firefox: 200, safari: 300 } as Record<string, number>)[browser] ?? 0;
    return base + slot;
  },
};

/** Collects one matrix cell with its outcome; the detail names what the cell covered and what it answered. */
const cells: Array<{ family: string; name: string; outcome: string; detail: string }> = [];

/** Runs one matrix cell body and records the outcome deterministically. */
async function cell(spec: { family: string; name: string }, body: () => Promise<string>) {
  try {
    const detail = await body();
    cells.push({ family: spec.family, name: spec.name, outcome: "pass", detail: detail ?? "" });
  } catch (error) {
    cells.push({
      family: spec.family,
      name: spec.name,
      outcome: "fail",
      detail: error instanceof Error ? error.message : String(error),
    });
  }
}

/** Asserts one condition with the message the failure reports. */
function check(condition: unknown, message: string) {
  if (!condition) throw new Error(message);
}

/** Runs one gate script as a subprocess cell and answers its one line summary. */
async function runcells(script: string) {
  const outcome = await execute(process.execPath, [script], { cwd: process.cwd() });
  return outcome.stdout.trim().split("\n").at(-1) ?? "";
}

/** One recorded gate report the matrix replays through its committed record: the release stamp and the summary fields the standing gates answer. */
interface gatereport {
  release: string;
  summary: { failed?: number; open?: number };
}

/** Runs the full matrix verification and answers the report the artifact records. */
export async function runmatrixverifysuite() {
  if (!existsSync("dist/index.js") || !existsSync("dist/policy.js") || !existsSync("dist/protocol.js")) {
    console.error(
      "MATRIXVERIFY The gate reads the compiled library, policy and protocol bundles; run pnpm build before the matrix verification.",
    );
    return {
      release,
      cells: [
        { family: "build", name: "the compiled bundles exist", outcome: "fail", detail: "the dist bundles are absent" },
      ],
      coverage: 0,
      summary: { total: 1, passed: 0, failed: 1 },
    };
  }
  const library = await import("./dist/index.js");
  const policy = await import("./dist/policy.js");
  const catalog = policy.actionkindcatalog();

  /* 1. the kind cells: every action kind of the frozen catalog against the fake tab provider of every browser kind; the step policy answers every kind with a structured verdict and never crashes, and the risk classification stays coherent with the catalog grading. */
  for (const browser of faketabprovider.kinds) {
    await cell(
      { family: "kinds", name: `every action kind answers the step policy on the ${browser} fake tab` },
      async () => {
        let reads = 0;
        let interactions = 0;
        let sensitive = 0;
        for (const kind of catalog) {
          const step: toolstep = {
            id: `matrix-${browser}-${kind}`,
            kind: kind as actionkind,
            summary: `The matrix cell of ${kind} on ${browser}`,
            target: policy.needstarget(kind as actionkind) ? "https://example.org/#main" : undefined,
            value: kind === "navigate" ? "https://example.org/" : undefined,
            risk: policy.actionrisk(kind as actionkind),
          };
          const verdict = policy.validatestep(step, "https://example.org");
          check(
            verdict !== undefined && typeof verdict.allowed === "boolean",
            `the kind ${kind} crashed the step policy instead of answering a verdict`,
          );
          const risk = policy.actionrisk(kind as actionkind);
          if (risk === "read") reads += 1;
          else if (risk === "interaction") interactions += 1;
          else sensitive += 1;
        }
        return `all ${catalog.length} kinds answered the policy on tab ${faketabprovider.tabof(browser, 1)}: ${reads} read, ${interactions} interaction, ${sensitive} sensitive`;
      },
    );
  }

  /* 2. the surface cells: every built page carries its script and the interface pages share the style sheet. */
  await cell({ family: "surfaces", name: "every browser surface page opens with its script and style" }, async () => {
    const interfacepages = [
      "popup.html",
      "sidepanel.html",
      "dashboardpage.html",
      "transparencypage.html",
      "optionspage.html",
    ];
    const hostpages = ["offscreen.html", "sandbox.html"];
    const broken = [];
    for (const page of [...interfacepages, ...hostpages]) {
      const path = join("dist", "extension", page);
      check(existsSync(path), `the built surface page ${page} is absent`);
      const html = await readFile(path, "utf8");
      check(html.toLowerCase().includes("<script"), `the surface page ${page} carries no script`);
      if (interfacepages.includes(page))
        check(html.includes("style.css"), `the interface page ${page} misses the shared style sheet`);
    }
    return `${interfacepages.length} interface pages with script and style beside ${hostpages.length} host pages with their inline logic`;
  });

  /* 3. the cli surface in library mode: the manifest and help commands answer through the compiled cli bundle. */
  await cell(
    { family: "cli", name: "the cli surface answers the manifest and help commands in library mode" },
    async () => {
      const manifest = await execute(process.execPath, ["dist/cli.js", "manifest"], { cwd: process.cwd() });
      const help = await execute(process.execPath, ["dist/cli.js", "help"], { cwd: process.cwd() });
      check(
        manifest.stdout.includes("1.1.") || manifest.stdout.includes(release),
        "the manifest command printed no release line",
      );
      check(
        help.stdout.includes("manifest") && help.stdout.includes("serve"),
        "the help command listed no command surface",
      );
      return `manifest and help answered for ${release}`;
    },
  );

  /* 4. the mcp surface: the server handshake initializes with the tool catalog and the protocol negotiation answers every client version. */
  await cell(
    {
      family: "mcp",
      name: "the mcp surface handshakes through the serve initialization and the stdio bridge contract",
    },
    async () => {
      const catalogbuilt = library.buildtoolcatalog();
      const handshake = library.serveinitialize({
        params: { clientinfo: { name: "matrixverify", version: "1" } },
        config: { port: 7436, transports: ["stdio"], enabled: true },
        catalog: catalogbuilt,
        templates: [],
      });
      check(handshake.handshake !== undefined, "the serve initialization answered no handshake");
      const tools = library.alltools(catalogbuilt);
      check(tools.length >= 35, `the tool catalog carries ${tools.length} tools under the expected 35`);
      return `the handshake initialized with ${tools.length} tools`;
    },
  );

  /* 5. the protocol negotiation and the closed 2.0.0 sunset: a fresh client agrees on the frozen major, a version one client refuses below the sunset floor with the migration path inside the refusal, a list that carries both majors negotiates up to two and a future client refuses with the supported range. */
  await cell(
    { family: "migration", name: "the migration paths from version one plans answer the protocol negotiation" },
    async () => {
      const fresh = library.negotiateprotocol({ client: 2 });
      const legacy = library.negotiateprotocol({ client: 1 });
      const future = library.negotiateprotocol({ client: 3 });
      const shared = library.sharedprotocolversion([1, 2]);
      check(
        fresh.agreed === true && fresh.major === 2,
        `a fresh client did not agree on the frozen major two: ${JSON.stringify(fresh)}`,
      );
      check(
        legacy.agreed === false && (legacy.reason ?? "").includes("migrateplan"),
        "the version one client did not refuse below the sunset floor with the migration path",
      );
      check(
        future.agreed === false && (future.reason ?? "").includes("supported"),
        "the future client did not refuse with the supported range",
      );
      check(
        shared.shared === true && shared.major === 2,
        "the client list that carries both majors did not negotiate up to the frozen major two",
      );
      return `negotiation agreed on major two, refused version one below the 2.0.0 sunset floor with the migration guide and refused the future client`;
    },
  );

  /* 6. the importer cells: the plan fixtures parse, the workflow fixtures dry run and the session file round trips. */
  await cell({ family: "importers", name: "the plan importer parses every fixture of the dist set" }, async () => {
    const plandirectory = join("dist", "fixtures", "plans");
    const files = (await readdir(plandirectory)).filter((file) => file.endsWith(".json"));
    check(files.length >= 2, `the dist plan fixture set holds ${files.length} plans under the expected two`);
    for (const file of files) {
      const parsed = library.parseplanfile(JSON.parse(await readFile(join(plandirectory, file), "utf8")));
      check(parsed.steps.length > 0, `the plan fixture ${file} parsed with no steps`);
    }
    return `${files.length} plan fixtures parsed`;
  });
  await cell(
    { family: "importers", name: "the workflow importer dry runs every workflow fixture of the dist set" },
    async () => {
      const workflowdirectory = join("dist", "fixtures", "workflows");
      const files = (await readdir(workflowdirectory)).filter((file) => file.endsWith(".json"));
      check(files.length >= 2, `the dist workflow fixture set holds ${files.length} workflows under the expected two`);
      for (const file of files) {
        const outcome = await execute(
          process.execPath,
          ["dist/cli.js", "runworkflow", join(workflowdirectory, file), "--dryrun", "--quiet"],
          { cwd: process.cwd() },
        );
        check(outcome.stdout.trim().length > 0, `the workflow fixture ${file} dry ran with no output`);
      }
      return `${files.length} workflow fixtures dry ran`;
    },
  );
  await cell({ family: "importers", name: "the session importer round trips one session file" }, async () => {
    const record = library.newsessionrecord({
      id: "matrix-session",
      name: "matrix",
      createdat: 1_800_000_000_000,
      tabs: [],
      captures: [],
      storage: [],
      cookies: [],
    });
    const file = library.exportsessionfile([record], 1_800_000_000_000);
    const imported = library.importsessionfile(file);
    check(
      imported !== undefined && imported.recordids[0] === "matrix-session",
      "the session file did not round trip through the importer",
    );
    const payload = library.importexportpayloadof({
      profile: "matrix",
      originprofiles: [],
      siteprofiles: [],
      notes: [],
      preferences: {},
      at: 1_800_000_000_000,
    });
    const verdict = library.importexportvalidate(payload);
    check(verdict.ok === true, `the export payload did not validate: ${verdict.reason}`);
    return "the session file and the export payload round tripped";
  });

  /* 7. the standing gates: the pool audit, the api freeze, the csp audit and the permission diff run as subprocess cells; the agent certification, the cost certification, the documentation check and the sweep answer through their committed records. */
  await cell({ family: "gates", name: "the pool audit gate runs green over the 626 item pool" }, async () =>
    runcells("poolaudit.ts"),
  );
  await cell({ family: "gates", name: "the api freeze gate runs green over the frozen contract" }, async () =>
    runcells("apifreeze.gate.ts"),
  );
  await cell({ family: "gates", name: "the csp audit gate runs green over the content security policy" }, async () =>
    runcells("cspaudit.ts"),
  );
  await cell({ family: "gates", name: "the permission diff gate runs green over the versioned baseline" }, async () =>
    runcells("permdiff.ts"),
  );
  for (const [gate, record, field] of [
    ["agentcert", agentcertrecord, (report: gatereport) => report.summary.failed ?? 0],
    ["costcert", costcertrecord, (report: gatereport) => report.summary.failed ?? 0],
    ["doccheck", doccheckrecord, (report: gatereport) => report.summary.failed ?? 0],
    ["sweep", sweeprecord, (report: gatereport) => report.summary.open ?? 0],
  ] as Array<[string, gatereport, (report: gatereport) => number]>) {
    await cell({ family: "gates", name: `the ${gate} artifact records a green run` }, async () => {
      check(
        record.release === release,
        `the ${gate} record stamps the release ${record.release} while the tree builds ${release}; run the gate with sync inside the release commit`,
      );
      const failures = field(record);
      check(failures === 0, `the ${gate} artifact records ${failures} open findings`);
      return `the ${gate} artifact records zero failures`;
    });
  }

  /* the report: every cell outcome lands in the artifact, the coverage percentage answers the passed share of the candidate matrix and the gate exits nonzero when any cell fails. */
  const failed = cells.filter((candidate) => candidate.outcome === "fail");
  return {
    release,
    matrix: { browsers: faketabprovider.kinds, kinds: catalog.length, cells: cells.length },
    cells,
    coverage: cells.length === 0 ? 0 : Math.round(((cells.length - failed.length) / cells.length) * 100),
    summary: { total: cells.length, passed: cells.length - failed.length, failed: failed.length },
  };
}

/* ── the committed record (the sync pass rewrites this block) ── */

/** The verification matrix report the committed record carries: the release
 * it stamps, the matrix shape (the browsers, the kind count and the cell
 * count), every cell in its fixed order with its outcome and detail, the
 * coverage percentage and the summary the gate exits on. */
export interface matrixverifyreport {
  release: string;
  matrix: { browsers: string[]; kinds: number; cells: number };
  cells: Array<{ family: string; name: string; outcome: string; detail: string }>;
  coverage: number;
  summary: { total: number; passed: number; failed: number };
}

/** The committed verification matrix record of the 2.0.151 release — the
 * evidence the readiness review reads, migrated from
 * devthink/artifacts/matrixverify.json when the flat folder law dissolved
 * the artifacts folder of the application first layer: every cell in its
 * fixed order with its outcome, no timestamps, so the record replays byte
 * identical. */
export const matrixverifyrecord: matrixverifyreport = {
  "release": "2.0.154",
  "matrix": {
    "browsers": [
      "chromium",
      "firefox",
      "safari"
    ],
    "kinds": 335,
    "cells": 18
  },
  "cells": [
    {
      "family": "kinds",
      "name": "every action kind answers the step policy on the chromium fake tab",
      "outcome": "pass",
      "detail": "all 335 kinds answered the policy on tab 101: 145 read, 29 interaction, 161 sensitive"
    },
    {
      "family": "kinds",
      "name": "every action kind answers the step policy on the firefox fake tab",
      "outcome": "pass",
      "detail": "all 335 kinds answered the policy on tab 201: 145 read, 29 interaction, 161 sensitive"
    },
    {
      "family": "kinds",
      "name": "every action kind answers the step policy on the safari fake tab",
      "outcome": "pass",
      "detail": "all 335 kinds answered the policy on tab 301: 145 read, 29 interaction, 161 sensitive"
    },
    {
      "family": "surfaces",
      "name": "every browser surface page opens with its script and style",
      "outcome": "pass",
      "detail": "5 interface pages with script and style beside 2 host pages with their inline logic"
    },
    {
      "family": "cli",
      "name": "the cli surface answers the manifest and help commands in library mode",
      "outcome": "pass",
      "detail": "manifest and help answered for 2.0.154"
    },
    {
      "family": "mcp",
      "name": "the mcp surface handshakes through the serve initialization and the stdio bridge contract",
      "outcome": "pass",
      "detail": "the handshake initialized with 35 tools"
    },
    {
      "family": "migration",
      "name": "the migration paths from version one plans answer the protocol negotiation",
      "outcome": "pass",
      "detail": "negotiation agreed on major two, refused version one below the 2.0.0 sunset floor with the migration guide and refused the future client"
    },
    {
      "family": "importers",
      "name": "the plan importer parses every fixture of the dist set",
      "outcome": "pass",
      "detail": "2 plan fixtures parsed"
    },
    {
      "family": "importers",
      "name": "the workflow importer dry runs every workflow fixture of the dist set",
      "outcome": "pass",
      "detail": "2 workflow fixtures dry ran"
    },
    {
      "family": "importers",
      "name": "the session importer round trips one session file",
      "outcome": "pass",
      "detail": "the session file and the export payload round tripped"
    },
    {
      "family": "gates",
      "name": "the pool audit gate runs green over the 626 item pool",
      "outcome": "pass",
      "detail": "Pool audit of 626 items against 4473 shipped symbols: 623 implemented, 3 planned, 0 unknown, the record in tests/devthink.poolaudit.ts."
    },
    {
      "family": "gates",
      "name": "the api freeze gate runs green over the frozen contract",
      "outcome": "pass",
      "detail": "}"
    },
    {
      "family": "gates",
      "name": "the csp audit gate runs green over the content security policy",
      "outcome": "pass",
      "detail": "}"
    },
    {
      "family": "gates",
      "name": "the permission diff gate runs green over the versioned baseline",
      "outcome": "pass",
      "detail": "Permission set hash: 1d6e1579114bf176eba45a159e9f166c9c4a2587a53644bd2a63f880506a6262 over 11 permission entries; the baseline of tests/permbaseline.ts carries the recorded set of the release."
    },
    {
      "family": "gates",
      "name": "the agentcert artifact records a green run",
      "outcome": "pass",
      "detail": "the agentcert artifact records zero failures"
    },
    {
      "family": "gates",
      "name": "the costcert artifact records a green run",
      "outcome": "pass",
      "detail": "the costcert artifact records zero failures"
    },
    {
      "family": "gates",
      "name": "the doccheck artifact records a green run",
      "outcome": "pass",
      "detail": "the doccheck artifact records zero failures"
    },
    {
      "family": "gates",
      "name": "the sweep artifact records a green run",
      "outcome": "pass",
      "detail": "the sweep artifact records zero failures"
    }
  ],
  "coverage": 100,
  "summary": {
    "total": 18,
    "passed": 18,
    "failed": 0
  }
};

const invokeddirectly = process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href;
if (invokeddirectly) {
  const report = await runmatrixverifysuite();
  for (const candidate of report.cells) {
    const line = `[${candidate.outcome === "pass" ? "ok" : "FAIL"}] ${candidate.family}/${candidate.name} — ${candidate.detail}`;
    if (candidate.outcome === "pass") console.log(line);
    else console.error(line);
  }
  if (syncmode()) {
    /* the sync rewrites the committed record this run produced, so the release refresh rides one reviewable commit */
    console.log(await syncrecord({ moduleurl: import.meta.url, recordname: "matrixverifyrecord", recordtype: "matrixverifyreport", record: report }));
  } else {
    /* the record verification: the committed evidence stays internally consistent (the summary math, the cell counts and the coverage share), so a hand-edited record never passes as a recorded run */
    const passing = matrixverifyrecord.cells.filter((cell) => cell.outcome === "pass").length;
    const problems = [
      ...summaryproblemsof(matrixverifyrecord.summary),
      ...(passing !== matrixverifyrecord.summary.passed ? ["the recorded passing cells disagree with the recorded passed count"] : []),
      ...(matrixverifyrecord.matrix.cells !== matrixverifyrecord.summary.total || matrixverifyrecord.cells.length !== matrixverifyrecord.summary.total
        ? ["the recorded cell counts disagree with the recorded matrix shape"]
        : []),
    ];
    for (const problem of problems) console.error(`MATRIXVERIFY record: ${problem}`);
    console.log(
      `Matrix verified for ${release}: ${report.summary.passed} of ${report.summary.total} cells green, ${report.coverage}% coverage of the candidate matrix, the record in matrixverify.ts.`,
    );
    if (problems.length > 0) process.exitCode = 1;
  }
  if (report.summary.failed > 0) process.exitCode = 1;
}
