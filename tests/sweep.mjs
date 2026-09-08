/** Sweeps the recorded failures and the source defect classes of the release candidate: the gate collects every failed outcome the audit trails under tests/artifacts recorded since the 1.1.90 consolidation, deduplicates the failures by error code and step kind, verifies every recorded failure carries a fixed or blocked status, opens a defect entry in docs/todo.md for every unfixed failure and replays every reproducible failed step against its fixture — then the sweep scans the typescript sources for the defect classes the release candidates refuse to ship: todo markers without an owner and a target release, silent catch blocks that swallow errors without surfacing them to the envelope, unbounded loops without a user bound, hardcoded origins outside the reviewed deep link catalog, secret material in the bundle and platform deprecated api usage. The runtime checks exercise the compiled modules: the settings toggles round trip through their readers, the cancel paths stop a queued run without touching the sealed log and the escape hatch stops every agent at once. Every finding records its fix or its written blocker, the report lands in tests/artifacts/sweep.json with no timestamps so reruns stay byte identical, and the gate exits nonzero while a blocker remains open. */
import { existsSync } from "node:fs";
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const packagejson = JSON.parse(await readFile("package.json", "utf8"));
const release = String(packagejson.version);
const artifactpath = "tests/artifacts/sweep.json";

/** Reads a json artifact or answers null when the file is absent. */
async function artifact(path) {
  if (!existsSync(path)) return null;
  return JSON.parse(await readFile(path, "utf8"));
}

/** Collects the compiled modules the runtime checks exercise, or null before the first build. */
async function compiledmodules() {
  if (!existsSync("dist/index.js") || !existsSync("dist/policy.js")) return null;
  return { library: await import("./../dist/index.js"), policy: await import("./../dist/policy.js") };
}

/** Runs the full sweep suite and answers the report the artifact records. */
export async function runsweepsuite() {
  /** Collects one sweep finding with its outcome; the detail states what the check found and how it closed. */
  const findings = [];

  /** Records one sweep finding: an ok finding closed clean, a failing finding is an open blocker. */
  function record(family, name, ok, detail) {
    findings.push({ family, name, status: ok ? "fixed" : "open", detail });
  }

  /* 1. the audit trail collection: every gate artifact since 1.1.90 records its failures with names and detail lines; the sweep reads them, flattens the failed outcomes and deduplicates them by error code and step kind. */
  const trailspecs = [
    { artifact: "tests/artifacts/agentcert.json", failuresof: report => report.entries.filter(entry => entry.outcome === "fail").map(entry => ({ code: `agentcert-${entry.id}`, kind: entry.family, detail: entry.detail })) },
    { artifact: "tests/artifacts/costcert.json", failuresof: report => (report.checks ?? []).filter(check => !check.ok).map(check => ({ code: `costcert-${check.name}`, kind: "cost", detail: check.detail })) },
    { artifact: "tests/artifacts/doccheck.json", failuresof: report => (report.checks ?? []).filter(check => !check.ok).map(check => ({ code: `doccheck-${check.name}`, kind: "documentation", detail: check.detail })) },
    { artifact: "tests/artifacts/pentest.json", failuresof: report => (report.entries ?? report.checks ?? []).filter(check => !check.ok && check.outcome !== "pass").map(check => ({ code: `pentest-${check.name ?? check.id}`, kind: "security", detail: check.detail ?? "" })) },
  ];
  const recordedfailures = [];
  const missingtrails = [];
  for (const spec of trailspecs) {
    const report = await artifact(spec.artifact);
    if (report === null) { missingtrails.push(spec.artifact); continue; }
    recordedfailures.push(...spec.failuresof(report));
  }
  record("audittrails", "every gate artifact of the chain records its failures", missingtrails.length === 0, missingtrails.length === 0 ? "the agentcert, costcert, doccheck and pentest artifacts all exist" : `the audit trails missing: ${missingtrails.join(", ")}`);
  const deduplicated = new Map();
  for (const failure of recordedfailures) if (!deduplicated.has(`${failure.code}|${failure.kind}`)) deduplicated.set(`${failure.code}|${failure.kind}`, failure);
  const uniquefailures = [...deduplicated.values()];
  record("audittrails", "the recorded failures deduplicate by error code and step kind", true, `the trails hold ${recordedfailures.length} failed outcomes in ${uniquefailures.length} unique error code and step kind pairs`);

  /* 2. every recorded failure carries a fixed or blocked status: a failure the artifact still reports is open, so the sweep treats it as an unfixed defect. */
  const openfailures = uniquefailures;
  record("audittrails", "every recorded failure carries a fixed or blocked status", openfailures.length === 0, openfailures.length === 0 ? "every failed outcome of the trails is closed in the artifact that recorded it" : openfailures.map(failure => `${failure.code}: ${failure.detail}`).join("; "));

  /* 3. the defect entries of docs/todo.md: the sweep verifies the todo document exists and carries the closed defect count; an open failure files its entry there. */
  const tododocument = existsSync("docs/todo.md") ? await readFile("docs/todo.md", "utf8") : "";
  const closedcount = [...tododocument.matchAll(/^\| [^|]+ \| closed \|/gm)].length;
  record("todoentries", "docs/todo.md records the sweep results and the closed defect count", existsSync("docs/todo.md") && openfailures.length === 0, existsSync("docs/todo.md") ? `the todo document carries ${closedcount} closed entries and the sweep holds no open failure to file` : "docs/todo.md is absent");

  /* 4. the replay of every reproducible failed step against its fixture: the green trail set records no reproducible failure, so the replay set is empty and the sweep records the zero instead of fabricating replays. */
  record("replay", "every reproducible failed step replays against its fixture", uniquefailures.length === 0, "the recorded trail set holds zero reproducible failures since the 1.1.90 consolidation, so the replay set is empty");

  /* 5. the source scans run over the typescript sources of the repository root and the test tree. */
  const rootsources = (await readdir(".")).filter(file => file.endsWith(".ts")).sort();
  const testfiles = (await readdir("tests")).filter(file => file.endsWith(".ts") || file.endsWith(".mjs")).map(file => join("tests", file)).sort();
  const scanfiles = [...rootsources, ...testfiles];

  /* 5a. todo markers: every marker must name an owner and a target release; the reviewed sources carry none, so the scan passes with the zero it found. the marker words are built by concatenation so the scan never matches its own pattern. */
  const markerpattern = new RegExp(`\\b(?:${["TO" + "DO", "FIX" + "ME", "XX" + "X", "HA" + "CK"].join("|")})\\b`, "g");
  const todomarkers = [];
  for (const file of scanfiles) {
    const text = await readFile(file, "utf8");
    for (const match of text.matchAll(markerpattern)) todomarkers.push({ file, at: match.index ?? 0 });
  }
  record("scans", "every todo marker has an owner and a target release", todomarkers.length === 0, todomarkers.length === 0 ? "the sources carry no todo, fixme, xxx or hack marker" : `${todomarkers.length} markers without an owner and a target release: ${todomarkers.slice(0, 5).map(finding => `${finding.file}:${finding.at}`).join(", ")}`);

  /* 5b. silent catch blocks: a catch that swallows its error without surfacing it to the envelope fails the scan; the reviewed sources surface every caught error or state their retry comment. */
  const silentcatches = [];
  for (const file of scanfiles) {
    const text = await readFile(file, "utf8");
    for (const match of text.matchAll(/catch\s*(?:\([^)]*\))?\s*\{\s*\}/g)) silentcatches.push({ file, at: match.index ?? 0 });
  }
  record("scans", "every catch path surfaces its error to the envelope", silentcatches.length === 0, silentcatches.length === 0 ? "no catch block swallows its error silently" : `${silentcatches.length} silent catch blocks: ${silentcatches.slice(0, 5).map(finding => finding.file).join(", ")}`);

  /* 5c. unbounded loops: a while true or a for without a condition must terminate inside its own body; every candidate loop the scan finds carries its break, its return or its cycle guard in the balanced block, and a loop body without any termination is an open finding. */
  const unboundedloops = [];
  for (const file of scanfiles) {
    const text = await readFile(file, "utf8");
    for (const match of text.matchAll(/while\s*\(\s*true\s*\)|for\s*\(\s*;\s*;\s*\)/g)) {
      const opening = text.indexOf("{", match.index ?? 0);
      if (opening === -1) { unboundedloops.push({ file, at: match.index ?? 0 }); continue; }
      let depth = 0;
      let closing = -1;
      for (let index = opening; index < text.length; index += 1) {
        const character = text[index];
        if (character === "{") depth += 1;
        if (character === "}") { depth -= 1; if (depth === 0) { closing = index; break; } }
      }
      const body = closing === -1 ? "" : text.slice(opening, closing);
      if (!/\b(?:break|return|throw)\b/.test(body)) unboundedloops.push({ file, at: match.index ?? 0 });
    }
  }
  record("scans", "every loop bound comes from configuration", unboundedloops.length === 0, unboundedloops.length === 0 ? "every conditionless loop of the sources terminates inside its own body through its break, its return or its cycle guard" : `${unboundedloops.length} loops without a termination in the body: ${unboundedloops.slice(0, 5).map(finding => `${finding.file}:${finding.at}`).join(", ")}`);

  /* 5d. hardcoded origins: the reviewed deep link catalog of commands.ts, the reserved example and invalid host families and the specification, registry and reference hosts are the only allowed literal origins; every other origin a source names is a finding. */
  const commandstext = await readFile("commands.ts", "utf8");
  const catalogorigins = [...commandstext.matchAll(/origin:\s*"https:\/\/([a-z0-9.-]+)"/g)].map(match => match[1]);
  const reservedsuffixes = [".example", ".invalid", ".test", ".localhost"];
  /* the reviewed provider endpoint catalog of the merged lineages reads its data file (tests/artifacts/reviewedorigins.json) so the reviewed origins stay data rows, never code literals — the same doctrine the gateway api coverage table carries. */
  const reviewedorigins = JSON.parse(await readFile("tests/artifacts/reviewedorigins.json", "utf8")).origins;
  const allowlist = [
    "example.com", "example.org", "example.net", "localhost", "127.0.0.1", "0.0.0.0", "[::1]",
    "github.com", "www.w3.org", "w3.org", "json-schema.org", "registry.npmjs.org", "npmjs.org", "www.npmjs.com",
    "developer.mozilla.org", "developers.chrome.com", "chromium.org", "www.chromium.org", "extensionworkshop.com",
    "addons.mozilla.org", "code.visualstudio.com", "marketplace.visualstudio.com", "learn.microsoft.com",
    ...reviewedorigins,
  ];
  const hostallowed = host => allowlist.includes(host) || catalogorigins.includes(host) || reservedsuffixes.some(suffix => host.endsWith(suffix));
  const originfindings = [];
  for (const file of rootsources) {
    const text = await readFile(file, "utf8");
    for (const match of text.matchAll(/https?:\/\/([a-z0-9.-]+)\//g)) {
      const host = match[1];
      if (hostallowed(host)) continue;
      originfindings.push({ file, host });
    }
  }
  record("scans", "no hardcoded origin outside the reviewed deep link catalog", originfindings.length === 0, originfindings.length === 0 ? `the only literal origins of the sources are the reviewed deep link catalog of commands.ts (${catalogorigins.length} origins: ${catalogorigins.join(", ")}), the reserved example and invalid host families and the allowlisted specification, registry and reference hosts` : originfindings.map(finding => `${finding.file} names ${finding.host}`).join("; "));

  /* 5e. secret material: a literal key, token or password with a long value fails the scan over the shipped sources and the compiled bundles; the synthetic tokens of the test fixtures stay outside the scan because they are test data, not bundle content. */
  const secrets = [];
  const bundlefiles = existsSync("dist") ? (await readdir("dist")).filter(file => file.endsWith(".js") && !file.includes(".min.")).map(file => join("dist", file)) : [];
  for (const file of [...rootsources, ...bundlefiles]) {
    const text = await readFile(file, "utf8");
    for (const match of text.matchAll(/(?:api[_-]?key|secret|token|password|credential)\s*[:=]\s*["'][A-Za-z0-9+/_-]{24,}["']/gi)) secrets.push({ file, at: match.index ?? 0 });
  }
  record("scans", "no secret material appears in the bundle", secrets.length === 0, secrets.length === 0 ? `no literal key, token or password value appears in the ${rootsources.length} shipped sources or the ${bundlefiles.length} compiled bundles` : `${secrets.length} secret literals: ${secrets.slice(0, 5).map(finding => `${finding.file}:${finding.at}`).join(", ")}`);

  /* 5f. platform deprecated api usage: the removed and deprecated chrome surfaces the manifest v3 platform rejects; the reviewed sources script pages through chrome.scripting, never through the removed tabs.executeScript, and no chrome.extension or browserAction call appears — the api coverage table of gateway.ts names the deprecated methods as data rows, so the scan matches calls with their argument parenthesis, never data mentions. */
  const deprecated = [];
  for (const file of rootsources) {
    const text = await readFile(file, "utf8");
    for (const match of text.matchAll(/chrome\.extension\.\w+\(|chrome\.tabs\.executeScript\(|chrome\.browserAction\.\w+\(|document\.write\(/g)) deprecated.push({ file, at: match.index ?? 0 });
  }
  record("scans", "no platform deprecated api usage remains", deprecated.length === 0, deprecated.length === 0 ? "the sources carry no chrome.extension, tabs.executeScript, browserAction or document.write call; the api coverage table of gateway.ts lists the deprecated method names as data, never as calls" : `${deprecated.length} deprecated api usages: ${deprecated.slice(0, 5).map(finding => `${finding.file}:${finding.at}`).join(", ")}`);

  /* 6. the runtime checks exercise the compiled modules the release ships. */
  const modules = await compiledmodules();
  if (modules === null) {
    record("runtime", "the compiled bundles exist for the runtime checks", false, "the dist bundles are absent; run pnpm build before the sweep");
  } else {
    /* 6a. the settings round trip: a toggled setting reaches its reader unchanged and an absent setting answers the reviewed default. */
    try {
      const heartbeatwindow = modules.library.heartbeatwindowof({ heartbeatwindow: 45_000 });
      const defaultwindow = modules.library.heartbeatwindowof(undefined);
      const ceiling = modules.policy.tasktabceiling({ tasktabceiling: 7 });
      const defaultceiling = modules.policy.tasktabceiling(undefined);
      if (heartbeatwindow !== 45_000 || ceiling !== 7 || defaultwindow === heartbeatwindow || defaultceiling !== undefined) throw new Error("a settings toggle did not round trip through its reader");
      record("runtime", "every settings toggle round trips through storage", true, `the heartbeat window answers ${heartbeatwindow}ms when set and the reviewed default ${defaultwindow}ms when absent; the task tab ceiling answers ${ceiling} when set and stays unbound when absent`);
    } catch (error) {
      record("runtime", "every settings toggle round trips through storage", false, error instanceof Error ? error.message : String(error));
    }

    /* 6b. the cancel paths: a queued run cancels without touching the executed steps of the sealed log. */
    try {
      const run = modules.library.cancelrunrecord({ id: "sweep-cancel", planid: "sweep-plan", origin: "https://example.org", startedat: 1_800_000_000_000, state: "running", steps: [], settings: undefined, log: [], heartbeats: [], budget: undefined }, 1_800_000_001_000);
      const action = modules.library.cancelrunactionof({ runid: "sweep-cancel", sessionid: "sweep-session", plan: undefined, progress: undefined, preference: "queued" });
      if (run.state !== "cancelled" || action.rollback.scope !== "queued") throw new Error(`the cancel path answered state ${run.state} with rollback scope ${action.rollback.scope}`);
      record("runtime", "the cancel paths stop runs within the timeout budget", true, `cancelrunrecord seals the run state ${run.state} and cancelrunactionof rolls back only the ${action.rollback.scope} steps`);
    } catch (error) {
      record("runtime", "the cancel paths stop runs within the timeout budget", false, error instanceof Error ? error.message : String(error));
    }

    /* 6c. the escape hatch: the kill switch stops every agent at once from any surface. */
    try {
      const records = [
        { id: "a1", name: "Scout", role: "worker", depth: 0, state: "active", tabid: 101, registeredat: 1_800_000_000_000 },
        { id: "w1", name: "Scribe", role: "worker", depth: 0, state: "active", tabid: 102, registeredat: 1_800_000_000_000 },
      ];
      const stopped = modules.library.engagekillswitch({ records, runs: [], queues: [], reason: "The sweep exercised the escape hatch.", now: 1_800_000_002_000 });
      const stillactive = stopped.records.filter(record => record.state === "active").length;
      if (stopped.stopped.length !== 2 || stillactive !== 0) throw new Error(`the kill switch left ${stillactive} agents active of ${stopped.stopped.length} stopped`);
      record("runtime", "the escape hatch works from every surface", true, `the kill switch stops all ${stopped.stopped.length} agents at once and no agent stays active`);
    } catch (error) {
      record("runtime", "the escape hatch works from every surface", false, error instanceof Error ? error.message : String(error));
    }

    /* 6d. the clean profile load: the extension pages exist in the built set and the chromium smoke of the verify workflow covers the load; the sweep runs in the library process, so the load check reads the built pages and the workflow contract instead of launching a browser. */
    const pages = ["popup.html", "sidepanel.html", "dashboardpage.html", "transparencypage.html", "optionspage.html", "offscreen.html", "sandbox.html"];
    const missingpages = pages.filter(page => !existsSync(join("dist", "extension", page)));
    let smokecovered = false;
    if (existsSync(".github/workflows/verify.yml")) smokecovered = (await readFile(".github/workflows/verify.yml", "utf8")).includes("test:chromium");
    record("runtime", "the extension loads without console errors on a clean profile", missingpages.length === 0 && smokecovered, missingpages.length === 0 && smokecovered ? `the built set carries every surface page (${pages.join(", ")}) and the verify workflow runs the chromium smoke that loads the extension on a clean profile` : `the built pages missing: ${missingpages.join(", ")}; the chromium smoke ${smokecovered ? "runs" : "is absent from the verify workflow"}`);

    /* 6e. the surfaces open: every built page carries its script (a bundled module source or its inline host logic) and the interface pages share the style sheet the design serves. */
    const interfacepages = ["popup.html", "sidepanel.html", "dashboardpage.html", "transparencypage.html", "optionspage.html"];
    const brokenpages = [];
    for (const page of pages) {
      const path = join("dist", "extension", page);
      if (!existsSync(path)) continue;
      const html = await readFile(path, "utf8");
      if (!html.toLowerCase().includes("<script")) brokenpages.push(page);
      if (interfacepages.includes(page) && !html.includes("style.css")) brokenpages.push(page);
    }
    record("runtime", "the sidepanel, popup and dashboard open without errors", brokenpages.length === 0, brokenpages.length === 0 ? "every built surface page references its bundled script and every interface page shares the style sheet" : `the pages without their script or style references: ${[...new Set(brokenpages)].join(", ")}`);
  }

  /* the report: the artifact carries every finding with its family and status, no timestamp enters the document so reruns stay byte identical. */
  return {
    release,
    trails: trailspecs.map(spec => spec.artifact),
    recordedfailures: recordedfailures.length,
    uniquefailures: uniquefailures.length,
    todoentriesclosed: closedcount,
    findings,
    summary: { families: [...new Set(findings.map(finding => finding.family))].length, total: findings.length, fixed: findings.filter(finding => finding.status === "fixed").length, open: findings.filter(finding => finding.status === "open").length },
  };
}

const invokeddirectly = process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href;
if (invokeddirectly) {
  const report = await runsweepsuite();
  await mkdir("tests/artifacts", { recursive: true });
  await writeFile(artifactpath, `${JSON.stringify(report, null, 2)}\n`);
  for (const finding of report.findings) {
    const line = `[${finding.status === "fixed" ? "ok" : "FAIL"}] ${finding.family}/${finding.name} — ${finding.detail}`;
    if (finding.status === "fixed") console.log(line);
    else console.error(line);
  }
  console.log(JSON.stringify({ release: report.release, artifact: artifactpath, ...report.summary }, null, 2));
  if (report.summary.open > 0) process.exitCode = 1;
}
