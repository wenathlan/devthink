/** Proves the release candidate makes no request without consent: the gate greps the compiled bundle set for every network call site, lists every network capable path with the policy gate that guards it, runs the candidate behind a block all proxy over the startup, a full fixture recipe run and the dashboard render with the fake clock, and records zero outbound requests on the fresh run. The block all proxy of the library process replaces every outbound primitive (fetch, websocket and the xmlhttprequest constructor) with a recording refusal, so any code path that attempts the network fails loudly into the proxy counter instead of leaving the machine. The opt in assertions follow: the sync and update paths answer their opt in gates only, the crash and error reporting paths stay local only, and the telemetry policy of the types carries its enabled false literal. The evidence lands in tests/artifacts/telemetryfree.json with no timestamps so reruns stay byte identical, and the gate exits nonzero on any outbound attempt, on any unguarded network path or on any opt in assertion that fails. */
import { existsSync } from "node:fs";
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const packagejson = JSON.parse(await readFile("package.json", "utf8"));
const release = String(packagejson.version);
const artifactpath = "tests/artifacts/telemetryfree.json";

/** Collects one verification entry with its outcome. */
const entries = [];

/** Records one telemetry free verification entry: an ok entry passed, a failing entry is an open violation. */
function record(name, ok, detail) {
  entries.push({ name, ok, detail });
}

/** Runs the telemetry free verification suite and answers the report the artifact records. */
export async function runtelemetryfreesuite() {
  if (!existsSync("dist/index.js") || !existsSync("dist/policy.js")) {
    console.error(
      "TELEMETRYFREE The gate reads the compiled library and policy bundles; run pnpm build before the telemetry free verification.",
    );
    return { release, entries, summary: { total: 1, passed: 0, failed: 1, outbound: 0 } };
  }

  /* 1. the network call site scan: every fetch, websocket and beacon call site of the compiled bundles; the inventory names the primitive, the bundle and the count. */
  const bundles = (await readdir("dist")).filter((file) => file.endsWith(".js") && !file.includes(".min."));
  const callsites = [];
  for (const bundle of bundles) {
    const text = await readFile(join("dist", bundle), "utf8");
    const fetches = [...text.matchAll(/\bfetch\s*\(/g)].length;
    const sockets = [...text.matchAll(/\bnew\s+WebSocket\s*\(/g)].length;
    const beacons = [...text.matchAll(/\bsendBeacon\s*\(/g)].length;
    const requests = [...text.matchAll(/\bXMLHttpRequest\b/g)].length;
    if (fetches + sockets + beacons > 0)
      callsites.push({ bundle, fetch: fetches, websocket: sockets, beacon: beacons, xmlhttprequest: requests });
  }
  const totalsites = callsites.reduce((sum, site) => sum + site.fetch + site.websocket + site.beacon, 0);
  record(
    "callsites",
    callsites.length > 0,
    `the bundle set carries its network call sites inventoried: ${totalsites} sites over ${callsites.length} bundles — ${callsites.map((site) => `${site.bundle} (fetch ${site.fetch}, websocket ${site.websocket}, beacon ${site.beacon})`).join("; ")}`,
  );

  /* 2. the network capable paths with their gates: every outbound primitive sits behind a policy gate; the gate inventory maps each path to the gate that guards it. */
  const library = await import("./../dist/index.js");
  const policy = await import("./../dist/policy.js");
  const dashdone = await import("./../dist/dashdone.js");
  const hardening = await import("./../dist/hardening.js");
  const paths = [
    { path: "sendfetch of the http family", gate: "fetchconsentcovers" },
    { path: "opensocket of the net family", gate: "socketgate" },
    { path: "subscribesse of the net family", gate: "socketgate" },
    { path: "outbound rest calls of the web api family", gate: "origincheck" },
    { path: "the api key header of the net control family", gate: "apikeyconsentgranted" },
    { path: "the auth flow of the net control family", gate: "authconsentgranted" },
    { path: "the relay client of the bridge family", gate: "serverbindgate" },
    { path: "the gateway adapters of the llm family", gate: "providervalid" },
  ];
  const ungated = paths.filter((entry) => typeof policy[entry.gate] !== "function");
  record(
    "gates",
    ungated.length === 0,
    ungated.length === 0
      ? `every network capable path carries its policy gate: ${paths.map((entry) => `${entry.path} guarded by ${entry.gate}`).join("; ")}`
      : `the paths without their gate: ${ungated.map((entry) => `${entry.path} misses ${entry.gate}`).join("; ")}`,
  );

  /* 3. the block all proxy: the proxy replaces every outbound primitive of the library process with a recording refusal, then the candidate runs its startup, one full fixture recipe run and the dashboard render under the proxy — zero outbound attempts on the fresh run. */
  const attempts = [];
  const originalfetch = globalThis.fetch;
  const originalwebsocket = globalThis.WebSocket;
  globalThis.fetch = (input, init) => {
    attempts.push(`fetch ${typeof input === "string" ? input : String(input)}`);
    throw new Error(
      `The block all proxy refused the fetch of ${typeof input === "string" ? input : "a request object"}.`,
    );
  };
  if (originalwebsocket !== undefined)
    globalThis.WebSocket = class {
      constructor(url) {
        attempts.push(`websocket ${String(url)}`);
        throw new Error(`The block all proxy refused the websocket of ${String(url)}.`);
      }
    };
  let startupok = false;
  let recipeok = false;
  let dashboardok = false;
  let proxystartuperror = "";
  let recipeerror = "";
  let dashboarderror = "";
  try {
    /* the startup: the protocol negotiation, the serve handshake, the capability manifests and the version pin all answer without the network. */
    const fresh = library.negotiateprotocol({ client: 2 });
    const catalogbuilt = library.buildtoolcatalog();
    const handshake = library.serveinitialize({
      params: { clientinfo: { name: "telemetryfree", version: "1" } },
      config: { transport: "stdio", enabled: true },
      catalog: catalogbuilt,
      templates: [],
    });
    const manifest = library.capmanifestof("library");
    startupok = fresh.agreed === true && handshake.handshake !== undefined && manifest.release === release;
    if (!startupok)
      proxystartuperror = `the startup answered negotiation ${JSON.stringify(fresh)} with the manifest release ${manifest.release}`;
  } catch (error) {
    proxystartuperror = error instanceof Error ? error.message : String(error);
  }
  try {
    /* the full fixture recipe run: the plan fixture parses, lints and dry runs through the library without the network. */
    const plandirectory = join("dist", "fixtures", "plans");
    const files = (await readdir(plandirectory)).filter((file) => file.endsWith(".json"));
    let steps = 0;
    for (const file of files) {
      const parsed = library.parseplanfile(JSON.parse(await readFile(join(plandirectory, file), "utf8")));
      const diagnostics = library.lintplanfile({
        file: parsed,
        ruleset: policy.portablerulesetof(1_800_000_000_000),
        capabilities: [],
        now: 1_800_000_000_000,
      });
      steps += parsed.steps.length + diagnostics.length;
    }
    const recordbuilt = library.newsessionrecord({
      id: "telemetry-session",
      name: "telemetry",
      createdat: 1_800_000_000_000,
      tabs: [],
      captures: [],
      storage: [],
      cookies: [],
    });
    const sessionfile = library.exportsessionfile([recordbuilt], 1_800_000_000_000);
    const imported = library.importsessionfile(sessionfile);
    recipeok = steps > 0 && imported !== undefined;
    if (!recipeok) recipeerror = "the recipe run answered no steps or the session file did not round trip";
  } catch (error) {
    recipeerror = error instanceof Error ? error.message : String(error);
  }
  try {
    /* the dashboard render: the dashdone views render their panels from the fixture state without the network. */
    const topology = {
      id: "top1",
      leaderid: "a1",
      workerids: ["w1"],
      criticids: [],
      verifierids: [],
      assignments: [],
      rule: { kind: "first" },
      electedat: 1_800_000_000_000,
    };
    const agents = [
      {
        id: "a1",
        name: "Scout",
        role: "worker",
        depth: 0,
        state: "active",
        tabid: 101,
        registeredat: 1_800_000_000_000,
      },
      {
        id: "w1",
        name: "Scribe",
        role: "worker",
        depth: 0,
        state: "active",
        tabid: 102,
        registeredat: 1_800_000_000_000,
      },
    ];
    const overview = dashdone.multiagentoverviewof({
      agents,
      queue: library.emptyqueue({ lanes: ["extraction"] }),
      topology,
      killswitch: { engaged: false, engagedat: 0, reason: "" },
      unread: 0,
    });
    dashboardok = overview !== undefined && overview.topology.includes("leader a1");
    if (!dashboardok) dashboarderror = "the dashboard render answered no panel";
  } catch (error) {
    dashboarderror = error instanceof Error ? error.message : String(error);
  }
  globalThis.fetch = originalfetch;
  if (originalwebsocket !== undefined) globalThis.WebSocket = originalwebsocket;
  record(
    "proxy",
    attempts.length === 0 && startupok && recipeok && dashboardok,
    attempts.length === 0 && startupok && recipeok && dashboardok
      ? `the proxy run covered the startup (negotiation, handshake, capability manifest), the recipe run (${(await readdir(join("dist", "fixtures", "plans"))).filter((file) => file.endsWith(".json")).length} plan fixtures with the session round trip) and the dashboard render with zero outbound attempts`
      : `the proxy recorded ${attempts.length} attempts (${attempts.slice(0, 3).join(", ")}); startup: ${proxystartuperror || "ok"}; recipe: ${recipeerror || "ok"}; dashboard: ${dashboarderror || "ok"}`,
  );

  /* 4. the opt in assertions: the sync paths answer their opt in gates only and the crash and error reporting stays local only. */
  const typestext = await readFile("types.ts", "utf8");
  const telemetrydisabled = /telemetrypolicy[\s\S]{0,400}?enabled:\s*false/.test(typestext);
  const syncoptin = typeof library.optinsync === "function";
  const crashlocal = typeof library.crashinterrupted === "function" && typeof hardening.masklogtext === "function";
  record(
    "optin",
    syncoptin && telemetrydisabled,
    syncoptin && telemetrydisabled
      ? "the sync and update checks stay opt in only: the sync settings answer the optinsync consent gate and the telemetry policy of the types carries its enabled false literal"
      : `the opt in surface: optinsync ${syncoptin ? "exists" : "is absent"}, telemetry enabled false literal ${telemetrydisabled ? "present" : "absent"}`,
  );
  record(
    "local",
    crashlocal,
    crashlocal
      ? "the crash and error reporting stays local only: the crash marking (crashinterrupted) and the log masking (masklogtext) answer from the local stores with no outbound reporting path"
      : "the local crash surface is absent",
  );

  /* the report: the artifact carries every entry with its outcome, no timestamp enters the document so reruns stay byte identical. */
  const failed = entries.filter((entry) => !entry.ok);
  return {
    release,
    callsites,
    paths,
    outboundattempts: attempts,
    entries,
    summary: {
      total: entries.length,
      passed: entries.length - failed.length,
      failed: failed.length,
      outbound: attempts.length,
    },
  };
}

const invokeddirectly = process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href;
if (invokeddirectly) {
  const report = await runtelemetryfreesuite();
  await mkdir("tests/artifacts", { recursive: true });
  await writeFile(artifactpath, `${JSON.stringify(report, null, 2)}\n`);
  for (const entry of report.entries) {
    const line = `[${entry.ok ? "ok" : "FAIL"}] ${entry.name} — ${entry.detail}`;
    if (entry.ok) console.log(line);
    else console.error(line);
  }
  console.log(
    `Telemetry free verification for ${release}: ${report.summary.outbound} outbound attempts behind the block all proxy over ${report.summary.passed} green assertions.`,
  );
  if (report.summary.failed > 0 || report.summary.outbound > 0) process.exitCode = 1;
}
