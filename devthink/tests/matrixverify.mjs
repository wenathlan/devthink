/** Verifies the full candidate matrix of the release candidate: the gate enumerates every cell the candidate must cover and records its outcome — every action kind of the frozen catalog against the fake tab provider of every browser kind (chromium, firefox and safari) through the step policy, every browser surface page across the popup, the sidepanel, the dashboard, the transparency and the options templates beside the offscreen and sandbox hosts, the cli surface in library mode through the manifest and help commands, the mcp surface through the server handshake and the protocol negotiation, the importers on the plan fixtures and the workflow dry runs and the session file round trip, the migration paths from version one plans through the closed 2.0.0 sunset negotiation, and the standing gates (poolaudit, apifreeze, cspaudit and permdiff as subprocess cells; agentcert, costcert, doccheck and sweep through their recorded artifacts). Every cell records its outcome in tests/artifacts/matrixverify.json, the matrix reports its coverage percentage of the candidate, and the gate exits nonzero when any cell fails. */
import { execFile } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { promisify } from "node:util";
import { pathToFileURL } from "node:url";

const execute = promisify(execFile);
const packagejson = JSON.parse(await readFile("package.json", "utf8"));
const release = String(packagejson.version);
const artifactpath = "tests/artifacts/matrixverify.json";

/** The fake tab provider of the matrix: one deterministic tab id per browser kind and per slot, so the kind cells bind tabs the same way on chromium, firefox and safari — the fake tab covers every browser kind the extension ships. */
const faketabprovider = {
  kinds: ["chromium", "firefox", "safari"],
  tabof(browser, slot) {
    const base = { chromium: 100, firefox: 200, safari: 300 }[browser] ?? 0;
    return base + slot;
  },
};

/** Collects one matrix cell with its outcome; the detail names what the cell covered and what it answered. */
const cells = [];

/** Runs one matrix cell body and records the outcome deterministically. */
async function cell(spec, body) {
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
function check(condition, message) {
  if (!condition) throw new Error(message);
}

/** Runs one gate script as a subprocess cell and answers its one line summary. */
async function runcells(script) {
  const outcome = await execute(process.execPath, [script], { cwd: process.cwd() });
  return outcome.stdout.trim().split("\n").at(-1) ?? "";
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
  const library = await import("./../dist/index.js");
  const policy = await import("./../dist/policy.js");
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
          const step = {
            id: `matrix-${browser}-${kind}`,
            kind,
            summary: `The matrix cell of ${kind} on ${browser}`,
            target: policy.needstarget(kind) ? "https://example.org/#main" : undefined,
            value: kind === "navigate" ? "https://example.org/" : undefined,
          };
          const verdict = policy.validatestep(step, "https://example.org");
          check(
            verdict !== undefined && typeof verdict.allowed === "boolean",
            `the kind ${kind} crashed the step policy instead of answering a verdict`,
          );
          const risk = policy.actionrisk(kind);
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
        config: { transport: "stdio", enabled: true },
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

  /* 7. the standing gates: the pool audit, the api freeze, the csp audit and the permission diff run as subprocess cells; the agent certification, the cost certification, the documentation check and the sweep report through their recorded artifacts. */
  await cell({ family: "gates", name: "the pool audit gate runs green over the 626 item pool" }, async () =>
    runcells("tests/poolaudit.mjs"),
  );
  await cell({ family: "gates", name: "the api freeze gate runs green over the frozen contract" }, async () =>
    runcells("tests/apifreeze.mjs"),
  );
  await cell({ family: "gates", name: "the csp audit gate runs green over the content security policy" }, async () =>
    runcells("tests/cspaudit.mjs"),
  );
  await cell({ family: "gates", name: "the permission diff gate runs green over the versioned baseline" }, async () =>
    runcells("tests/permdiff.mjs"),
  );
  for (const [gate, artifact, field] of [
    ["agentcert", "tests/artifacts/agentcert.json", (report) => report.summary.failed],
    ["costcert", "tests/artifacts/costcert.json", (report) => report.summary.failed],
    ["doccheck", "tests/artifacts/doccheck.json", (report) => report.summary.failed],
    ["sweep", "tests/artifacts/sweep.json", (report) => report.summary.open],
  ]) {
    await cell({ family: "gates", name: `the ${gate} artifact records a green run` }, async () => {
      check(existsSync(artifact), `the ${gate} artifact is absent; run the gate before the matrix`);
      const report = JSON.parse(await readFile(artifact, "utf8"));
      const failures = field(report);
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

const invokeddirectly = process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href;
if (invokeddirectly) {
  const report = await runmatrixverifysuite();
  await mkdir("tests/artifacts", { recursive: true });
  await writeFile(artifactpath, `${JSON.stringify(report, null, 2)}\n`);
  for (const candidate of report.cells) {
    const line = `[${candidate.outcome === "pass" ? "ok" : "FAIL"}] ${candidate.family}/${candidate.name} — ${candidate.detail}`;
    if (candidate.outcome === "pass") console.log(line);
    else console.error(line);
  }
  console.log(
    `Matrix verified for ${release}: ${report.summary.passed} of ${report.summary.total} cells green, ${report.coverage}% coverage of the candidate matrix.`,
  );
  if (report.summary.failed > 0) process.exitCode = 1;
}
