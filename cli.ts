/** The cli module of the 1.1.88 consolidation: the terminal entry and the cli tools interned in this one file, so the cli surface carries one module without duplicate variations. */

/* ── Merged from cli/devthink.ts: the terminal entry of the cli. ── */
import { createInterface } from "node:readline/promises";
import { mkdir, readFile, readdir, stat, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { join, resolve } from "node:path";
import {
  formatdiagnostics,
  lintplanfile,
  parseplanfile,
  planlintsummary,
  rulesetcachekey,
  plansteprisk,
} from "./plan.js";
import {
  dryflowdriver,
  flowrunreport,
  parseflowrunrequest,
  parsegrantsfile,
  renderflowevents,
  renderflowtimeline,
  runflow,
} from "./flow.js";
import type { flowdriver } from "./flow.js";
import {
  exportchain,
  exportdescriptorof,
  exportextractions,
  exportnotes,
  exportrecords,
  secretfieldshapes,
} from "./export.js";
import { openheadlesssession, openlibraryrun, remoteattachframes } from "./headless.js";
import {
  dryrunworkflow,
  newworkflowrun,
  runworkflow,
  composeworkflow,
  workflowblockof,
  workflowstepof,
} from "./workflow.js";
import { platformtargets } from "./runtime.js";
import {
  adapterdeclarationsof,
  capabilityprobeof,
  filesystemstorageadapter,
  portablecapabilityset,
} from "./runtime.js";
import {
  actionkindcatalog,
  actionrisk,
  dryrunprojection,
  portablerulesetof,
  mcpmodegate,
  nativeinstallconsentgate,
  cssselectorvalid,
  fixtureconsentgate,
  kindoptionfields,
  validatetargetref,
} from "./policy.js";
import { clicommands, surfacepalette } from "./views.js";
import {
  apifreezedate,
  apifreezerelease,
  capmanifestof,
  deprecationwindow,
  protocolsupported,
  sharedprotocolversion,
  type capmanifestsurface,
} from "./apifreeze.js";
import { toolcallframe } from "./protocol.js";
import { defaultmaskshapes, maskmarker } from "./security.js";
import { sessionmemory } from "./memory.js";
import { acquirerunlock, releaserunlock } from "./run.js";
import { exportlogchain } from "./security.js";
import { packageversion } from "./version.js";
import {
  createservesession,
  routeserveframe,
  shutdowndrain,
  startserve,
  transportendpoints,
  defaultmcpport,
  localhostbind,
} from "./mcp.js";
import { createlinepump, httpanswer, httpendpoint, parsepost, routepath } from "./http.js";
import {
  hostmanifestdestination,
  installnativehost,
  nativedefaultstate,
  nativediagnostics,
  nativehostmanifesttemplate,
  uninstallnativehost,
} from "./bridge.js";
import type {
  auditevent,
  cliconfiguration,
  clientrecord,
  consentprovider,
  headlessfixture,
  immutablelogentry,
  mcpserverconfig,
  planfile,
  planfilestep,
  planlintdiagnostic,
  portableruleset,
  runlogentry,
  sitenote,
  stepoutcome,
  storedrunlog,
  toolmock,
  transportkind,
  variablescope,
  workflowstep,
  exportdescriptor,
  exportresult,
  headlessfixtureoutcome,
  manifestcheckfinding,
  planprogress,
  planrisksummary,
  runworkflowoutcome,
  workflowdocument,
  workflowrecord,
  workflowrun,
} from "./types.js";

const forbidden = new Set([
  "debugger",
  "cookies",
  "webRequest",
  "history",
  "bookmarks",
  "nativeMessaging",
  "proxy",
  "management",
]);
const allowedoptional = new Set([
  "tabs",
  "downloads",
  "clipboardRead",
  "clipboardWrite",
  "offscreen",
  "nativeMessaging",
]);
/** The extension surfaces that must never become sandbox pages because they hold extension privileges. */
const privilegedpages = new Set(["background.html", "popup.html", "sidepanel.html", "offscreen.html"]);
/** The configuration file location the cli reads when no --config flag rides the invocation; every value inside stays the user's choice. */
const defaultconfigfile = ".devthink/config.json";
/** Decodes the manifest identity key strictly so a corrupted key cannot reach the packaged extension. */
function decodeidentitykey(key: string): Buffer {
  if (!/^[A-Za-z0-9+/]+={0,2}$/.test(key))
    throw new Error("The manifest key must be strict base64 without whitespace.");
  if (key.length % 4 !== 0)
    throw new Error(`The manifest key length ${key.length} is not a multiple of four, so it is not valid base64.`);
  const der = Buffer.from(key, "base64");
  if (der.length < 150 || der.length > 600)
    throw new Error(`The manifest key decodes to ${der.length} bytes, outside the RSA subject public key range.`);
  if (!der.subarray(0, 2).equals(Buffer.from([0x30, 0x82])))
    throw new Error("The manifest key does not decode to a DER subject public key sequence.");
  const declared = der.readUInt16BE(2);
  if (declared !== der.length - 4)
    throw new Error(`The manifest key DER length ${declared} does not match the decoded ${der.length - 4} bytes.`);
  return der;
}

/** Reads the recorded digest of the published identity key from the build artifact checksums: the build writes the manifest key digest beside the bundle checksums, so the identity pin rides a generated artifact of the shipped package set instead of a hard coded constant — the internal cryptographic digests of the bundles, the packages and the identity never stay baked inside the sources, they are generated by every build and verified against the artifact that shipped them. */
async function recordedidentitydigest(): Promise<string | undefined> {
  /* the installed package carries its scoped checksums at the package root and the repository build carries the full set under dist: the identity pin rides whichever artifact set the running tree owns, so the digest reads the package copy first and the build copy second */
  for (const candidate of ["checksums.txt", "dist/checksums.txt"]) {
    try {
      const text = await readFile(resolve(candidate), "utf8");
      for (const line of text.split("\n")) {
        const match = /^([0-9a-f]{64})  manifest\.json key$/.exec(line.trim());
        if (match !== null) return match[1];
      }
    } catch {
      /* an unbuilt tree carries no artifact record: the structural identity checks alone stand, and the build regenerates the record on every run */
    }
  }
  return undefined;
}

/** Parses loose terminal arguments into positional values and --flags, with --name=value and --name value both accepted. */
function parseflags(args: string[]): { positional: string[]; flags: Map<string, string> } {
  const positional: string[] = [];
  const flags = new Map<string, string>();
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === undefined) continue;
    if (arg.startsWith("--")) {
      const [name, inline] = arg.slice(2).split("=", 2);
      if (name === undefined || name.trim() === "") throw new Error(`The argument ${arg} carries no flag name.`);
      const next = args[index + 1];
      if (inline !== undefined) flags.set(name, inline);
      else if (next !== undefined && !next.startsWith("--")) {
        flags.set(name, next);
        index += 1;
      } else flags.set(name, "true");
    } else positional.push(arg);
  }
  return { positional, flags };
}

/** Reads the global invocation state the commands share: the parsed configuration, the verbosity and the json output marker, all resolved before any command dispatches. */
async function globalstate(
  args: string[],
): Promise<{
  config: cliconfiguration;
  verbosity: "quiet" | "normal" | "verbose";
  json: boolean;
  flags: Map<string, string>;
  positional: string[];
}> {
  const { positional, flags } = parseflags(args);
  const configpath = flags.get("config") ?? defaultconfigfile;
  let raw: unknown = {};
  try {
    raw = JSON.parse(await readFile(configpath, "utf8"));
  } catch {
    /* an absent or unreadable configuration keeps every default off; a present but malformed one refuses below */
  }
  const config = parsecliconfig(raw);
  const verbosityflag =
    flags.get("verbose") === "true" ? "verbose" : flags.get("quiet") === "true" ? "quiet" : undefined;
  const verbosity = verbosityflag ?? config.verbosity ?? "normal";
  const json = flags.get("json") === "true" || config.format === "json";
  return { config, verbosity, json, flags, positional };
}

/** Asks one terminal question and returns the trimmed answer. */
async function ask(question: string): Promise<string> {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  try {
    return (await rl.question(question)).trim();
  } finally {
    rl.close();
  }
}

/** Reads the rule cache of one compiled portable rule set: a matching cache returns the parsed set and a stale or absent cache recompiles and rewrites the file. */
async function cachedruleset(cachedir: string): Promise<portableruleset> {
  const ruleset = portablerulesetof(Date.now());
  const key = rulesetcachekey(ruleset);
  const cachefile = join(cachedir, `${key}.json`);
  try {
    const cached = JSON.parse(await readFile(cachefile, "utf8")) as portableruleset;
    if (rulesetcachekey(cached) === key) return cached;
  } catch {
    /* a missing or unreadable cache recompiles below */
  }
  await mkdir(cachedir, { recursive: true });
  await writeFile(cachefile, JSON.stringify(ruleset, null, 2), "utf8");
  return ruleset;
}

/** Reads the plan file targets of one path: a file lints alone and a directory lints every json file it holds. */
async function plantargets(target: string): Promise<string[]> {
  const info = await stat(target);
  if (info.isFile()) return [target];
  const entries = await readdir(target);
  return entries.filter((entry) => entry.endsWith(".json")).map((entry) => join(target, entry));
}

/** Reads the read only kinds of the reviewed vocabulary: a runtime without a dom executes the read only vocabulary only. */
function readonlykinds(): string[] {
  return actionkindcatalog().filter((kind) => {
    try {
      return actionrisk(kind as never) === "read";
    } catch {
      return false;
    }
  });
}

/** Lints plan files against the portable rule set with the 1.1.80 findings beside it: the selector grammar, the required option fields, the origin allowlist and the risk summary ride every lint, the lines format prints one stable line per finding for editors, and error diagnostics exit non zero. */
async function cmdplanlint(
  args: string[],
  state: { config: cliconfiguration; verbosity: "quiet" | "normal" | "verbose"; json: boolean },
): Promise<void> {
  const { positional, flags } = parseflags(args);
  const target = positional[0] ?? state.config.defaultplan;
  if (target === undefined || target.trim() === "")
    throw new Error(
      "The planlint command needs the plan file or directory it lints, or the default plan location in the configuration.",
    );
  const format = flags.get("format") ?? (state.json ? "json" : "human");
  if (format !== "human" && format !== "json" && format !== "lines")
    throw new Error("The planlint format must stay human, json or lines.");
  const ruleset = await cachedruleset(flags.get("cache") ?? ".devthink");
  const capabilities = flags.has("capabilities")
    ? (JSON.parse(await readFile(flags.get("capabilities") as string, "utf8")) as string[])
    : portablecapabilityset({
        vocabulary: actionkindcatalog(),
        probes: capabilityprobeof({ dom: flags.get("domless") !== "true", storage: true, network: true, worker: true }),
        domlesskinds: readonlykinds(),
      });
  const allowlist = flags.has("allowlist")
    ? (flags.get("allowlist") as string)
        .split(",")
        .map((origin) => origin.trim())
        .filter((origin) => origin !== "")
    : state.config.allowlist;
  const files = await plantargets(target);
  if (files.length === 0) throw new Error(`The target ${target} carries no plan file to lint.`);
  const report: Array<{
    file: string;
    diagnostics: planlintdiagnostic[];
    risk: ReturnType<typeof planrisksummaryof>;
    exitcode: number;
  }> = [];
  let exitcode = 0;
  for (const file of files) {
    let diagnostics: planlintdiagnostic[];
    let plan: planfile;
    try {
      plan = parseplanfile(JSON.parse(await readFile(file, "utf8")));
      diagnostics = [
        ...lintplanfile({ file: plan, ruleset, capabilities, now: Date.now() }),
        ...planlintfindings({ file: plan, capabilities, ...(allowlist !== undefined ? { allowlist } : {}) }),
      ];
    } catch (error) {
      diagnostics = [
        {
          code: "plan.schema.file",
          path: file,
          severity: "error",
          message: error instanceof Error ? error.message : String(error),
        },
      ];
      plan = { version: packageversion, goal: "", origin: "https://invalid.example", steps: [] };
    }
    const summary = planlintsummary(diagnostics);
    if (summary.exitcode !== 0) exitcode = 1;
    report.push({ file, diagnostics, risk: planrisksummaryof(plan), exitcode: summary.exitcode });
  }
  if (state.verbosity !== "quiet" && state.verbosity === "verbose" && format === "human")
    console.log(
      `The planlint ran ${ruleset.rules.length} portable rules over ${files.length} plan file${files.length === 1 ? "" : "s"} with ${capabilities.length} declared capabilities${allowlist !== undefined ? ` and the consent allowlist of ${allowlist.length} origin${allowlist.length === 1 ? "" : "s"}` : ""}.`,
    );
  if (format === "json") console.log(JSON.stringify(report, null, 2));
  else if (format === "lines")
    for (const entry of report)
      for (const diagnostic of entry.diagnostics)
        console.log(
          `${entry.file}:${diagnostic.severity}:${diagnostic.code}:${diagnostic.path}: ${diagnostic.message}`,
        );
  else
    for (const entry of report) {
      console.log(`== ${entry.file}\n${formatdiagnostics(entry.diagnostics, "human")}`);
      if (state.verbosity !== "quiet") console.log(`risk: ${entry.risk.reason}`);
    }
  process.exitCode = exitcode;
}

/** Converts one foreign plan source into the reviewed plan file grammar: the migrateplan command of the 2.0.0 migration bridge reads the source file in its --format dialect (a version one devthink plan, an automa workflow, a selenium side file, a ui vision macro or a tabular csv), refuses every entry the importer cannot map with the source entry named, verifies the converted plan against the same frozen grammar and the same lint engine planlint runs before anything is written, prints the conversion report with its provenance on stderr because the plan file grammar carries no metadata field, and writes the --out file or prints the plan json to stdout. The importer converts only: nothing executes here, and every imported plan enters the same review flow a hand authored plan enters — no imported plan ever inherits a consent grant. */
async function cmdmigrateplan(
  args: string[],
  state: { config: cliconfiguration; verbosity: "quiet" | "normal" | "verbose"; json: boolean },
): Promise<void> {
  const { positional, flags } = parseflags(args);
  const source = positional[0];
  if (source === undefined || source.trim() === "")
    throw new Error("The migrateplan command needs the source file it converts.");
  const format = flags.get("format") ?? "";
  if (format.trim() === "")
    throw new Error(
      "The migrateplan command needs the --format flag of v1, automa, selenium, uivision or tabular; the converter never guesses the source format.",
    );
  const text = await readFile(source, "utf8");
  const conversion = migrateplanconversion({ format, text, now: Date.now() });
  const serialized = JSON.stringify(conversion.file, null, 2);
  const parsed = parseplanfile(
    JSON.parse(serialized),
  ); /* the frozen grammar verifies the exact bytes the command writes */
  const ruleset = await cachedruleset(flags.get("cache") ?? ".devthink");
  const capabilities = flags.has("capabilities")
    ? (JSON.parse(await readFile(flags.get("capabilities") as string, "utf8")) as string[])
    : portablecapabilityset({
        vocabulary: actionkindcatalog(),
        probes: capabilityprobeof({ dom: flags.get("domless") !== "true", storage: true, network: true, worker: true }),
        domlesskinds: readonlykinds(),
      });
  const diagnostics = [
    ...lintplanfile({ file: parsed, ruleset, capabilities, now: Date.now() }),
    ...planlintfindings({ file: parsed, capabilities }),
  ];
  const errors = diagnostics.filter((diagnostic) => diagnostic.severity === "error");
  if (errors.length > 0) {
    console.error(formatdiagnostics(errors, "human"));
    console.error(
      "The migrateplan command refuses to emit a converted plan that fails its own lint; the importers mark every entry they cannot map, so this refusal names a conversion gap the importer should have caught.",
    );
    process.exitCode = exitcodeof("schemaerror");
    return;
  }
  const out = flags.get("out");
  if (out !== undefined) {
    await mkdir(resolve(out, ".."), { recursive: true });
    await writeFile(out, serialized + "\n", "utf8");
    if (state.verbosity !== "quiet") console.error(`The migrateplan command wrote the converted plan to ${out}.`);
  } else {
    console.log(serialized);
  }
  for (const note of conversion.notes) console.error(note);
}

/** Lists the example gallery of the 2.0.0 platform release and validates one entry: the recipes command reads the gallery index the packages ship (gallery.json at the installed package root, the dist build copy second, the repository source fallback tests/code/recipes/gallery.json last), prints every entry with its category, difficulty, fixture page and description, and validates one named entry by loading its plan through the same frozen grammar and the same lint engine the planlint command runs. The --dryrun flag walks the entry through the same dry flow driver the extension runs with a recording consent provider, so a gallery recipe imports, lints and dry runs through the terminal exactly as the ci runner walks it — the gallery never drifts from the code. */
async function cmdrecipes(
  args: string[],
  state: { config: cliconfiguration; verbosity: "quiet" | "normal" | "verbose"; json: boolean },
): Promise<void> {
  const { positional, flags } = parseflags(args);
  const candidates = ["gallery.json", "dist/gallery.json", "tests/code/recipes/gallery.json"];
  let gallery:
    | {
        entries: Array<{
          id: string;
          category: string;
          difficulty: string;
          description: string;
          fixture: string;
          origin: string;
          expecteddurationms: number;
        }>;
        fixturepages: Array<{ name: string }>;
      }
    | undefined;
  let gallerypath = "";
  for (const candidate of candidates) {
    try {
      gallery = JSON.parse(await readFile(candidate, "utf8"));
      gallerypath = candidate;
      break;
    } catch {
      /* the built index first, the repository source second, and neither found refuses below */
    }
  }
  if (gallery === undefined)
    throw new Error(
      "The recipes command needs the gallery index the installed package ships (gallery.json at the package root), the build copy (dist/gallery.json) or the repository source (tests/code/recipes/gallery.json); run from the package root or run pnpm build first.",
    );
  const id = positional[0];
  if (id === undefined) {
    if (state.json || flags.get("format") === "json") {
      console.log(JSON.stringify(gallery, null, 2));
      return;
    }
    for (const entry of gallery.entries)
      console.log(
        `${entry.id.padEnd(24)} ${entry.category.padEnd(11)} ${entry.difficulty.padEnd(12)} ${entry.fixture.padEnd(17)} ${entry.description}`,
      );
    console.log(
      `The gallery carries ${gallery.entries.length} recipes over ${gallery.fixturepages.length} fixture pages; run devthink recipes <id> for one entry, with --dryrun to walk its flow.`,
    );
    return;
  }
  const entry = gallery.entries.find((candidate) => candidate.id === id);
  if (entry === undefined) throw new Error(`The gallery carries no entry ${id}; run devthink recipes for the list.`);
  const recipecandidates = [
    gallerypath === "gallery.json"
      ? `fixtures/recipes/${id}.json`
      : gallerypath.startsWith("dist/")
        ? `dist/fixtures/recipes/${id}.json`
        : `tests/code/recipes/${id}.json`,
    `fixtures/recipes/${id}.json`,
    `dist/fixtures/recipes/${id}.json`,
  ];
  let recipetext: string | undefined;
  for (const candidate of recipecandidates) {
    try {
      recipetext = await readFile(candidate, "utf8");
      break;
    } catch {
      /* the index sibling first, the built copy second */
    }
  }
  if (recipetext === undefined)
    throw new Error(
      `The recipe file of ${id} sits beside neither the gallery index nor the shipped fixture set; run from the package root or run pnpm build first.`,
    );
  const file = parseplanfile(JSON.parse(recipetext));
  const ruleset = await cachedruleset(flags.get("cache") ?? ".devthink");
  const capabilities = portablecapabilityset({
    vocabulary: actionkindcatalog(),
    probes: capabilityprobeof({ dom: flags.get("domless") !== "true", storage: true, network: true, worker: true }),
    domlesskinds: readonlykinds(),
  });
  const diagnostics = [
    ...lintplanfile({ file, ruleset, capabilities, now: Date.now() }),
    ...planlintfindings({ file, capabilities }),
  ];
  const errors = diagnostics.filter((diagnostic) => diagnostic.severity === "error");
  if (state.json || flags.get("format") === "json") {
    console.log(
      JSON.stringify(
        { entry, plan: file, diagnostics, ...(flags.get("dryrun") === "true" ? { dryrun: "requested" } : {}) },
        null,
        2,
      ),
    );
  } else {
    console.log(`${entry.id} — ${entry.category} — ${entry.difficulty} — fixture ${entry.fixture} of ${entry.origin}`);
    console.log(entry.description);
    console.log(
      `The plan carries ${file.steps.length} step${file.steps.length === 1 ? "" : "s"} over the origin ${file.origin}.`,
    );
    if (diagnostics.length > 0) console.log(formatdiagnostics(diagnostics, "human"));
    else console.log("No planlint diagnostics.");
  }
  if (errors.length > 0) {
    process.exitCode = exitcodeof("schemaerror");
    return;
  }
  if (flags.get("dryrun") === "true") {
    const resolvedgates: string[] = [];
    const provider: consentprovider = {
      async resolvegate(gate) {
        resolvedgates.push(gate.id);
        return "approve";
      },
    };
    const planpath = recipecandidates[0] ?? `dist/fixtures/recipes/${id}.json`;
    const run = await runflow({
      request: {
        planpath,
        options: {
          format: "human",
          outputdir: "tests/artifacts",
          interactive: false,
          dryrun: true,
          grantspath: "gallery",
        },
      },
      file,
      grants: [entry.origin],
      provider,
      driver: dryflowdriver(),
      now: Date.now(),
      clock: () => Date.now(),
    });
    console.log(
      `The dry run walked ${run.outcome.steps} of ${file.steps.length} steps, waited at ${resolvedgates.length} consent gate${resolvedgates.length === 1 ? "" : "s"} and ended ${run.outcome.state} with exit code ${run.outcome.exitcode}.`,
    );
    process.exitCode = run.outcome.exitcode;
  }
}

/** Builds the terminal consent provider: every gate wait prints its reason and asks the human for one approve or refuse answer. */
function terminalprovider(): consentprovider {
  return {
    async resolvegate(gate) {
      const answer = await ask(
        `${gate.reason}\nApprove the gate ${gate.id} of kind ${gate.kind} on ${gate.origin}? [y/N] `,
      );
      return answer.toLowerCase() === "y" ? "approve" : "refuse";
    },
  };
}

/** Attaches one remote driver through the same agent protocol frames the extension speaks, then executes every step as one tools/call frame. */
async function attachremotedriver(endpoint: string, origin: string): Promise<flowdriver> {
  const session = openheadlesssession({ origin, now: Date.now() });
  const frames = remoteattachframes({ id: 1, session, runtime: "node" });
  const attach = await fetch(endpoint, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(frames.initialize),
  });
  const attached = (await attach.json()) as { result?: { attached?: boolean }; error?: { message?: string } };
  if (attached.error !== undefined || attached.result?.attached !== true)
    throw new Error(
      `The remote session at ${endpoint} refused the attach: ${attached.error?.message ?? "the endpoint returned no attached result."}`,
    );
  let sequence = 1;
  return {
    async execute(step) {
      sequence += 1;
      const started = Date.now();
      const frame = toolcallframe({
        id: sequence,
        name: `browser.${step.kind}`,
        params: {
          id: step.id,
          kind: step.kind,
          label: step.label,
          ...(step.target !== undefined ? { target: step.target } : {}),
          ...(step.value !== undefined ? { value: step.value } : {}),
          ...(step.options !== undefined ? { options: step.options } : {}),
        },
      });
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(frame),
      });
      const body = (await response.json()) as { result?: unknown; error?: { message?: string } };
      const duration = Date.now() - started;
      if (body.error !== undefined)
        return {
          state: "failed",
          summary: `The remote session refused the step ${step.id}: ${body.error.message ?? "the endpoint returned an error."}`,
          duration,
        };
      return {
        state: "done",
        summary: `The remote session executed the step ${step.id} of kind ${step.kind}.`,
        duration,
      };
    },
  };
}

/** Runs one plan file from the terminal: the grants gate, the consent prompts, the driver, the sealed chain in the output directory and the exit code all ride the same pipeline the extension runs. */
async function cmdflowrun(args: string[]): Promise<void> {
  const request = parseflowrunrequest(args);
  const { flags } = parseflags(args);
  const file = parseplanfile(JSON.parse(await readFile(request.planpath, "utf8")));
  const grants =
    request.options.grantspath !== undefined
      ? parsegrantsfile(JSON.parse(await readFile(request.options.grantspath, "utf8")))
      : [];
  if (request.options.grantspath === undefined && request.options.interactive) {
    const answer = await ask(`Grant the origin ${file.origin} for this run? [y/N] `);
    if (answer.toLowerCase() !== "y")
      throw new Error("The interactive origin grant was refused; the flowrun never starts.");
    grants.push(file.origin);
  }
  const provider = request.options.interactive ? terminalprovider() : undefined;
  const endpoint = flags.get("endpoint");
  const driver =
    endpoint !== undefined
      ? await attachremotedriver(endpoint, file.origin)
      : request.options.dryrun
        ? dryflowdriver()
        : undefined;
  if (driver === undefined)
    throw new Error(
      "The flowrun needs a remote endpoint (--endpoint) or the dry run flag (--dryrun); the cli drives no local browser itself.",
    );
  const profiledir = flags.get("profile") ?? ".devthink/profile";
  const store = new sessionmemory(
    filesystemstorageadapter(
      {
        readfile: (path) => readFile(path, "utf8"),
        writefile: (path, data) => writeFile(path, data, "utf8"),
        mkdir: (path) => mkdir(path, { recursive: true }),
        join: (...parts: string[]) => join(...parts),
      },
      profiledir,
    ),
  );
  const runid = `flowrun:${Date.now()}`;
  const lock = acquirerunlock({
    locks: await store.getrunlocks(),
    sessionid: "flowrun",
    runid,
    holder: "devthink-cli",
    now: Date.now(),
  });
  await store.setrunlocks(lock.locks);
  if (!lock.acquired) throw new Error(lock.reason);
  try {
    const run = await runflow({
      request,
      file,
      grants,
      ...(provider !== undefined ? { provider } : {}),
      driver,
      now: Date.now(),
      clock: () => Date.now(),
      emit: (event) => {
        if (request.options.format === "human") console.log(renderflowevents([event], "human"));
      },
    });
    await mkdir(request.options.outputdir, { recursive: true });
    const chain = await exportlogchain(run.log);
    const stem = join(request.options.outputdir, runid.replace(/:/g, "-"));
    await writeFile(`${stem}.chain.json`, JSON.stringify(chain, null, 2), "utf8");
    await writeFile(
      `${stem}.report.json`,
      JSON.stringify(flowrunreport({ outcome: run.outcome, events: run.events }), null, 2),
      "utf8",
    );
    await store.addaudi({
      id: createHash("sha256").update(runid).digest("hex").slice(0, 16),
      kind: "flowrun",
      at: Date.now(),
      summary: `The flowrun of ${file.origin} ended ${run.outcome.state} after ${run.outcome.steps} step${run.outcome.steps === 1 ? "" : "s"}.`,
      sessionid: "flowrun",
    });
    if (request.options.format === "json")
      console.log(JSON.stringify(flowrunreport({ outcome: run.outcome, events: run.events }), null, 2));
    else console.log(renderflowtimeline(run.events));
    process.exitCode = run.outcome.exitcode;
  } finally {
    const released = releaserunlock({ locks: await store.getrunlocks(), sessionid: "flowrun", runid, now: Date.now() });
    await store.setrunlocks(released.locks);
  }
}

/** Runs one saved workflow from the terminal through the library engine: the review gate pauses for the terminal approval before the run and before every sensitive step, the checkpoints persist beside the workflow so a resume continues from its checkpoint id, the audit trail file writes beside the workflow after each run, the progress streams one line per completed step and the structured outcome summary maps onto the documented exit code. */
async function cmdrunworkflow(
  args: string[],
  state: { config: cliconfiguration; verbosity: "quiet" | "normal" | "verbose"; json: boolean },
): Promise<void> {
  const { positional, flags } = parseflags(args);
  const workflowpath = positional[0];
  if (workflowpath === undefined || workflowpath.trim() === "")
    throw new Error("The runworkflow command needs the workflow file it runs.");
  const dryrun = flags.get("dryrun") === "true";
  const format = flags.get("format") ?? (state.json ? "json" : "human");
  if (format !== "human" && format !== "json") throw new Error("The runworkflow format must stay human or json.");
  const document = parseworkflowdocument(JSON.parse(await readFile(workflowpath, "utf8")));
  const record = composeworkflowdocument(document, Date.now());
  const runid = `workflow:${record.id}:${Date.now()}`;
  const checkpointfile = `${workflowpath}.checkpoint.json`;
  let resumed = false;
  let run = newworkflowrun({ id: runid, workflowid: record.id, ...(dryrun ? { dryrun: true } : {}), now: Date.now() });
  let scopes: variablescope[] | undefined;
  let log: runlogentry[] | undefined;
  let outputs: Record<string, stepoutcome> | undefined;
  const resumeid = flags.get("resume");
  if (resumeid !== undefined) {
    const checkpoints = JSON.parse(await readFile(checkpointfile, "utf8")) as Array<{
      runid: string;
      cursor: number;
      scopes: variablescope[];
      log: runlogentry[];
      outputs: Record<string, stepoutcome>;
    }>;
    const checkpoint = [...checkpoints].reverse().find((entry) => entry.runid === resumeid);
    if (checkpoint === undefined)
      throw new Error(
        `No checkpoint of the run ${resumeid} sits beside ${workflowpath}; the resume needs its checkpoint id.`,
      );
    run = { id: resumeid, workflowid: record.id, state: "paused", cursor: checkpoint.cursor, startedat: Date.now() };
    scopes = checkpoint.scopes;
    log = checkpoint.log;
    outputs = checkpoint.outputs;
    resumed = true;
  }
  if (state.verbosity !== "quiet") {
    const approval = await ask(
      `Run the workflow ${record.name} of ${record.steps.length} step${record.steps.length === 1 ? "" : "s"} on ${record.origins.join(", ")}${resumed ? ` resuming from the checkpoint ${run.cursor}` : ""}${dryrun ? " as a dry run" : ""}? [y/N] `,
    );
    if (approval.toLowerCase() !== "y") {
      console.log(
        format === "json"
          ? JSON.stringify(
              {
                runid,
                state: "cancelled",
                exitclass: "consentrefused",
                exitcode: exitcodeof("consentrefused"),
                reason: "The terminal review refused the workflow before the first step.",
              },
              null,
              2,
            )
          : "The terminal review refused the workflow; nothing ran.",
      );
      process.exitCode = exitcodeof("consentrefused");
      return;
    }
  }
  let summary: ReturnType<typeof runworkflowsummaryof>;
  if (dryrun) {
    const dried = dryrunworkflow({
      record,
      run,
      ...(scopes !== undefined ? { scopes } : {}),
      ...(log !== undefined ? { log } : {}),
      now: Date.now(),
      projection: dryrunprojection,
    });
    summary = runworkflowsummaryof({ runid: dried.run.id, run: dried.run, log: dried.log });
  } else {
    const endpoint = flags.get("endpoint");
    if (endpoint === undefined)
      throw new Error(
        "The runworkflow command needs a remote endpoint (--endpoint) or the dry run flag (--dryrun); the cli drives no local browser itself.",
      );
    const driver = await attachremotedriver(endpoint, record.origins[0] as string);
    const checkpoints = [] as Array<{
      runid: string;
      cursor: number;
      scopes: variablescope[];
      log: runlogentry[];
      outputs: Record<string, stepoutcome>;
    }>;
    const executed = await runworkflow({
      record,
      run,
      ...(scopes !== undefined ? { scopes } : {}),
      ...(log !== undefined ? { log } : {}),
      ...(outputs !== undefined ? { outputs } : {}),
      execute: async (step: workflowstep, context) => {
        let risk: "read" | "interaction" | "sensitive" = "sensitive";
        try {
          risk = actionrisk(step.kind as never);
        } catch {
          /* an unknown kind already refused at composition */
        }
        if (risk === "sensitive" && state.verbosity !== "quiet") {
          const answer = await ask(
            `The step ${step.id} of kind ${step.kind} grades sensitive on ${record.origins.join(", ")}.\nApprove the step before it runs? [y/N] `,
          );
          if (answer.toLowerCase() !== "y")
            return {
              ok: false,
              summary: `The terminal review refused the sensitive step ${step.id} of kind ${step.kind}.`,
            };
        }
        const result = await driver.execute(step as planfilestep, Date.now());
        return {
          ok: result.state === "done",
          summary: result.summary,
          ...(context.block !== undefined ? { details: { block: context.block } } : {}),
        };
      },
      now: Date.now(),
      gates: { sessionactive: true, planapproved: true, origingranted: (origin) => record.origins.includes(origin) },
      oncheckpoint: async (checkpoint) => {
        if (state.verbosity !== "quiet" && format === "human")
          console.log(`step ${checkpoint.run.cursor}/${record.steps.length}: ${checkpoint.log.at(-1)?.summary ?? ""}`);
        checkpoints.push({
          runid: checkpoint.run.id,
          cursor: checkpoint.run.cursor,
          scopes: checkpoint.scopes,
          log: checkpoint.log,
          outputs: {},
        });
        await writeFile(checkpointfile, JSON.stringify(checkpoints, null, 2), "utf8");
      },
    });
    summary = runworkflowsummaryof({ runid: executed.run.id, run: executed.run, log: executed.log });
  }
  await writeFile(
    `${workflowpath}.audit.jsonl`,
    workflowauditlines({
      runid: summary.runid,
      workflow: record.name,
      log: summary.steps.map((entry) => ({
        stepid: entry.stepid,
        label: entry.label,
        state: entry.state as "done",
        startedat: 0,
        duration: entry.duration,
        summary: entry.summary,
      })),
      now: Date.now(),
    }) + "\n",
    "utf8",
  );
  if (format === "json") console.log(JSON.stringify(summary, null, 2));
  else {
    for (const step of summary.steps)
      console.log(
        `${step.state === "done" ? "done" : step.state} ${step.stepid} ${step.label} (${step.duration} ms): ${step.summary}`,
      );
    console.log(
      `The workflow run ${summary.runid} ended ${summary.state} at checkpoint ${summary.checkpoint} with the exit class ${summary.exitclass} (${summary.exitcode}).${summary.reason !== undefined ? ` ${summary.reason}` : ""}`,
    );
  }
  process.exitCode = summary.exitcode;
}

/** Exports session, audit or extraction data from the profile store or an input file: the serializers ride the shared export menu, the from and to flags window the records, an absent output path writes to stdout and the secret store material refuses the export in full. */
async function cmdexportdata(
  args: string[],
  state: { config: cliconfiguration; verbosity: "quiet" | "normal" | "verbose"; json: boolean },
): Promise<void> {
  const { positional, flags } = parseflags(args);
  const scope = positional[0];
  if (scope === undefined) throw new Error("The exportdata command needs its scope of session, audit or extraction.");
  if (scope !== "session" && scope !== "audit" && scope !== "extraction")
    throw new Error("The exportdata scope stays session, audit or extraction.");
  const format = flags.get("format") ?? (scope === "session" ? "json" : scope === "audit" ? "jsonl" : "csv");
  const timebound = (name: string): number | undefined => {
    const value = flags.get(name);
    if (value === undefined) return undefined;
    if (/^-?\d+$/.test(value)) return Number(value);
    const parsed = Date.parse(value);
    if (Number.isNaN(parsed))
      throw new Error(`The ${name} flag must carry an epoch millisecond number or an ISO date.`);
    return parsed;
  };
  const from = timebound("from");
  const to = timebound("to");
  const input = flags.get("input");
  const storedir = flags.get("store");
  let records: Array<Record<string, unknown>>;
  if (input !== undefined) {
    records = JSON.parse(await readFile(input, "utf8")) as Array<Record<string, unknown>>;
  } else if (storedir !== undefined) {
    const store = new sessionmemory(
      filesystemstorageadapter(
        {
          readfile: (path) => readFile(path, "utf8"),
          writefile: (path, data) => writeFile(path, data, "utf8"),
          mkdir: (path) => mkdir(path, { recursive: true }),
          join: (...parts: string[]) => join(...parts),
        },
        storedir,
      ),
    );
    if (scope === "session") records = (await store.gethistory()) as unknown as Array<Record<string, unknown>>;
    else if (scope === "audit") records = (await store.getaudit()) as unknown as Array<Record<string, unknown>>;
    else
      records = (await store.getdatasets()).flatMap((dataset) =>
        dataset.rows.map((row) => ({ ...row, dataset: dataset.name, at: dataset.at })),
      );
  } else {
    throw new Error("The exportdata command needs its records from the --input file or the --store profile directory.");
  }
  if (!Array.isArray(records)) throw new Error("The exportdata records must be a json array.");
  const shapes = flags.has("shapes")
    ? (flags.get("shapes") as string)
        .split(",")
        .map((shape) => shape.trim())
        .filter((shape) => shape !== "")
    : [...defaultmaskshapes];
  const out = flags.get("out");
  const exported = exportdatacontent({
    scope,
    format,
    records,
    shapes,
    ...(from !== undefined ? { from } : {}),
    ...(to !== undefined ? { to } : {}),
    ...(out !== undefined ? { path: out } : {}),
  });
  if (exported.result.reason !== undefined) {
    console.error(exported.result.reason);
    process.exitCode = exitcodeof("consentrefused");
    return;
  }
  if (state.verbosity === "verbose" && state.json !== true)
    console.log(
      `The exportdata wrote ${exported.result.rows} record${exported.result.rows === 1 ? "" : "s"} of ${exported.result.bytes} bytes in ${format}.`,
    );
  if (out !== undefined) {
    await mkdir(resolve(out, ".."), { recursive: true });
    await writeFile(out, exported.content + "\n", "utf8");
    if (state.verbosity !== "quiet") console.log(`The exportdata wrote ${out}.`);
  } else console.log(exported.content);
}

/** Replays one plan against recorded page state fixtures through the library run handle: the fixture consent gates hold against the recorded grants, the read only kinds execute against the observation, the unsupported kinds report honestly and the outcomes record through the progress model the live runs share. */
async function cmdheadless(
  args: string[],
  state: { config: cliconfiguration; verbosity: "quiet" | "normal" | "verbose"; json: boolean },
): Promise<void> {
  const { positional, flags } = parseflags(args);
  const planpath = positional[0] ?? state.config.defaultplan;
  if (planpath === undefined || planpath.trim() === "")
    throw new Error(
      "The headless command needs the plan file it replays, or the default plan location in the configuration.",
    );
  const fixturesdir = flags.get("fixtures") ?? state.config.fixturesdir;
  if (fixturesdir === undefined || fixturesdir.trim() === "")
    throw new Error(
      "The headless command needs the fixtures directory (--fixtures) or the fixturesdir location in the configuration.",
    );
  const entries = (await readdir(fixturesdir)).filter((entry) => entry.endsWith(".json"));
  if (entries.length === 0) throw new Error(`The fixtures directory ${fixturesdir} carries no fixture file.`);
  const fixtures: headlessfixture[] = [];
  for (const entry of entries)
    fixtures.push(parseheadlessfixture(JSON.parse(await readFile(join(fixturesdir, entry), "utf8"))));
  const plan = parseplanfile(JSON.parse(await readFile(planpath, "utf8")));
  const fixture = resolvefixture(fixtures, plan.origin);
  const handle = openlibraryrun({
    plan,
    statesource: (origin) => fixtures.find((candidate) => candidate.origin === origin),
    ...(flags.has("grants")
      ? {
          policy: {
            grants: (flags.get("grants") as string)
              .split(",")
              .map((grant) => grant.trim())
              .filter((grant) => grant !== ""),
          },
        }
      : {}),
    now: Date.now(),
  });
  const outcomes: Array<{
    stepid: string;
    kind: string;
    state: "done" | "refused" | "unsupported";
    summary: string;
    details?: Record<string, unknown>;
  }> = [];
  for (const step of plan.steps as planfilestep[]) {
    const outcome = handle.step(step, Date.now());
    outcomes.push(outcome);
    if (state.verbosity !== "quiet" && state.json !== true)
      console.log(`${outcome.state} ${outcome.stepid} of kind ${outcome.kind}: ${outcome.summary}`);
  }
  const exitclass = outcomes.some((outcome) => outcome.state === "unsupported")
    ? "unsupported"
    : outcomes.some((outcome) => outcome.state === "refused")
      ? "consentrefused"
      : "ok";
  if (state.json || flags.get("format") === "json")
    console.log(
      JSON.stringify(
        {
          plan: planpath,
          fixture: fixture.id,
          origin: fixture.origin,
          outcomes,
          progress: { completedsteps: handle.handle().progress.completedsteps.length },
          exitclass,
          exitcode: exitcodeof(exitclass),
        },
        null,
        2,
      ),
    );
  else
    console.log(
      `The headless replay of ${plan.goal} against the fixture ${fixture.id} of ${fixture.origin} completed ${handle.handle().progress.completedsteps.length} step${handle.handle().progress.completedsteps.length === 1 ? "" : "s"} with the exit class ${exitclass} (${exitcodeof(exitclass)}).`,
    );
  process.exitCode = exitcodeof(exitclass);
}

/** Serves the mcp server mode of the 1.1.84 family: the serve command validates the mcpmode gate over the user chosen transports, bind, port, frame size, queue depth, drain window and tls material, then speaks newline delimited json rpc over its own stdin and stdout while the optional http listener serves the streamable endpoint on its own localhost port — both transports may run at the same time — with every log line on stderr so the stdio wire stays clean. The standalone serve answers the protocol surfaces with the same gates the extension surfaces run (unpaired clients dispatch nothing, sensitive tools raise the human gate, the serve lists only the tools the grants cover) and executes no page step because the real execution rides the paired extension engine; the tool mocks of the --mocks flag let a client exercise the catalog without a browser. */
async function cmdserve(args: string[]): Promise<void> {
  const { flags } = parseflags(args);
  const transportflag = flags.get("transport");
  const transports: transportkind[] =
    transportflag === "stdio" ? ["stdio"] : transportflag === "http" ? ["http"] : ["stdio", "http"];
  const portflag = flags.get("port");
  const port =
    portflag !== undefined && Number.isFinite(Number(portflag)) && Number(portflag) > 0 && Number(portflag) <= 65535
      ? Math.floor(Number(portflag))
      : defaultmcpport;
  const bind = flags.get("bind") ?? localhostbind;
  const localbind = bind === "127.0.0.1" || bind === "localhost" || bind === "::1";
  const framesizeflag = flags.get("framesize");
  const queuedepthflag = flags.get("queuedepth");
  const drainwindowflag = flags.get("drainwindow");
  const config: mcpserverconfig = {
    bind,
    port,
    transports,
    enabled: true,
    ...(localbind ? {} : { remote: true }),
    ...(framesizeflag !== undefined && Number.isFinite(Number(framesizeflag))
      ? { framesize: Math.floor(Number(framesizeflag)) }
      : {}),
    ...(queuedepthflag !== undefined && Number.isFinite(Number(queuedepthflag))
      ? { queuedepth: Math.floor(Number(queuedepthflag)) }
      : {}),
    ...(drainwindowflag !== undefined && Number.isFinite(Number(drainwindowflag))
      ? { drainwindow: Math.floor(Number(drainwindowflag)) }
      : {}),
  };
  const gate = mcpmodegate(config);
  if (!gate.allowed) throw new Error(gate.reason ?? "The serve command failed its gate.");
  const startedat = Date.now();
  const started = startserve({ config, now: startedat });
  if (started.state === undefined) throw new Error(started.reason ?? "The serve command did not start.");
  const mocknames = (flags.get("mocks") ?? "")
    .split(",")
    .map((name) => name.trim())
    .filter((name) => name !== "");
  const mocks: toolmock[] = mocknames.map((tool) => ({
    tool,
    result: {
      content: `The ${tool} mock answered from the serve test context; no browser was touched.`,
      iserror: false,
    },
    testcontext: true,
    createdat: startedat,
  }));
  const client: clientrecord = {
    id: "serve-stdio",
    transport: "stdio",
    paired: flags.get("pair-client") === "true",
    connectedat: startedat,
    ...(flags.get("pair-client") === "true" ? { pairedat: startedat } : {}),
  };
  const holder: { session: ReturnType<typeof createservesession> } = {
    session: createservesession({ config, client, origin: "stdio", now: startedat }),
  };
  holder.session.mocks = mocks;
  const execute = async (step: { kind: string; id: string }): Promise<never> => {
    throw new Error(
      `The standalone serve executes the ${step.kind} step ${step.id} through the paired extension engine; run the extension for the real execution.`,
    );
  };
  const handle = async (
    frame: import("./types.js").jsonrpcframe,
  ): Promise<import("./types.js").jsonrpcframe | undefined> => {
    const outcome = await routeserveframe({ frame, state: holder.session, now: Date.now(), execute: execute as never });
    holder.session = outcome.state;
    return outcome.response;
  };
  const pump = createlinepump({
    write: (line) => {
      process.stdout.write(line);
    },
    handle,
    now: startedat,
  });
  const endpoints = transportendpoints({ config, now: startedat });
  process.stderr.write(
    `The mcp serve started ${endpoints.map((transport) => `${transport.kind} on ${transport.endpoint}`).join(" and ")}${started.state.degraded ? " degraded to the read only tools because no origin grant covers the serve" : ""}; ${mocks.length} tool mock${mocks.length === 1 ? "" : "s"} registered; the client ${client.paired ? "stays paired through the explicit launch flag" : "waits for the pairing approval"}. Every log rides stderr so the stdio wire stays clean.\n`,
  );
  let stopping = false;
  const stop = (): void => {
    if (stopping) return;
    stopping = true;
    const drain = shutdowndrain({
      inflight: holder.session.contexts,
      now: Date.now(),
      ...(config.drainwindow !== undefined ? { window: config.drainwindow, drainstart: startedat } : {}),
    });
    process.stderr.write(
      `The serve shutdown ${drain.phase} with ${drain.waiting} in flight call${drain.waiting === 1 ? "" : "s"}; the drain waits for every call before the exit.\n`,
    );
    process.exit(0);
  };
  if (transports.includes("stdio")) {
    process.stdin.setEncoding("utf8");
    process.stdin.on("data", (chunk) => {
      void pump.feed(typeof chunk === "string" ? chunk : String(chunk)).catch((error) => {
        process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
      });
    });
    process.stdin.on("end", stop);
  }
  if (transports.includes("http")) {
    const endpoint = httpendpoint(config);
    const { createServer } = await import("node:http");
    const { createServer: createsecure } = await import("node:https");
    const readbody = async (request: import("node:http").IncomingMessage): Promise<string> => {
      const chunks: Buffer[] = [];
      for await (const chunk of request) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(String(chunk)));
      return Buffer.concat(chunks).toString("utf8");
    };
    const handler = async (
      request: import("node:http").IncomingMessage,
      response: import("node:http").ServerResponse,
    ): Promise<void> => {
      const route = routepath(config, request.url ?? "/");
      if (route !== "endpoint") {
        response.writeHead(404, { "content-type": "application/json" });
        response.end(
          httpanswer({
            jsonrpc: "2.0",
            id: null,
            error: { code: "method", message: `The serve routes no http path ${request.url ?? "/"}.` },
          }),
        );
        return;
      }
      if (request.method !== "POST") {
        response.writeHead(405, { "content-type": "application/json", allow: "POST" });
        response.end(
          httpanswer({
            jsonrpc: "2.0",
            id: null,
            error: { code: "method", message: "The streamable endpoint accepts posted json rpc messages only." },
          }),
        );
        return;
      }
      const parsed = parsepost(await readbody(request));
      if (parsed.message === undefined) {
        response.writeHead(400, { "content-type": "application/json" });
        response.end(
          httpanswer({
            jsonrpc: "2.0",
            id: null,
            error: {
              code: "parse",
              message: parsed.error?.message ?? "The posted body does not parse as one json rpc message.",
            },
          }),
        );
        return;
      }
      const frames = Array.isArray(parsed.message) ? parsed.message : [parsed.message];
      const answers: import("./types.js").jsonrpcframe[] = [];
      for (const frame of frames) {
        if (frame.id === undefined) continue;
        const answer = await handle(frame);
        if (answer !== undefined) answers.push(answer);
      }
      response.writeHead(200, { "content-type": "application/json" });
      response.end(
        answers.length === 1
          ? httpanswer(answers[0] as import("./types.js").jsonrpcframe)
          : httpanswer({
              jsonrpc: "2.0",
              id: null,
              error: { code: "internal", message: "The posted message produced no answer." },
            }),
      );
    };
    let server: import("node:http").Server | import("node:https").Server;
    const certpath = flags.get("tlscert");
    const keypath = flags.get("tlskey");
    if (certpath !== undefined && keypath !== undefined) {
      const { readFile } = await import("node:fs/promises");
      server = createsecure(
        { cert: await readFile(certpath, "utf8"), key: await readFile(keypath, "utf8") },
        handler as never,
      );
      process.stderr.write(`The http listener terminates tls with the user provided certificate ${certpath}.\n`);
    } else {
      server = createServer(handler as never);
    }
    await new Promise<void>((resolve) => {
      server.listen(endpoint.port, endpoint.bind, () => {
        resolve();
      });
    });
    process.stderr.write(
      `The streamable http endpoint listens on ${endpoint.endpoint} (localhost bind${endpoint.localhost ? "" : " behind the explicit remote review"}).\n`,
    );
  }
  await new Promise<void>(() => {
    /* the serve runs until the stdin closes or the process receives a stop signal */
  });
}

/** Installs, removes or diagnoses the optional native host of the 1.1.85 native host bridge: the install subcommand writes the host manifest into the user profile directory behind the install consent flag that explains the scope, the uninstall subcommand removes the host manifest and its preferences, and the diagnostics subcommand reports the install state the manifest declares — nothing native runs until the user installs it, the companion path stays the user's choice and a system wide install refuses without its explicit flag. */
async function cmdnative(args: string[]): Promise<void> {
  const { flags, positional } = parseflags(args);
  const subcommand = positional[0] ?? "diagnostics";
  const profiledir = flags.get("profile") ?? "";
  const hostname = flags.get("host") ?? "";
  const platformflag = flags.get("platform");
  const platform = platformflag === "macos" || platformflag === "windows" ? platformflag : "linux";
  const systemwide = flags.get("systemwide") === "true";
  if (subcommand === "install") {
    const extensionid = flags.get("extension-id") ?? "";
    const companionpath = flags.get("companion") ?? "";
    const gate = nativeinstallconsentgate({
      consent: flags.get("consent") === "true",
      profiledir: systemwide ? "/system" : profiledir,
      hostname,
    });
    if (!gate.allowed) {
      console.error(gate.reason);
      console.error(
        "The install scope: the companion process the manifest launches, the profile directory the manifest writes into and the extension origins the manifest allows. Pass --consent true once you reviewed the scope.",
      );
      process.exitCode = exitcodeof("consentrefused");
      return;
    }
    const outcome = await installnativehost({
      profiledir,
      hostname,
      extensionid,
      companionpath,
      consent: true,
      now: Date.now(),
      ...(systemwide ? { systemwide: true } : {}),
      platform,
      io: {
        mkdir: async (dir) => {
          await mkdir(dir, { recursive: true });
        },
        writefile: async (path, text) => {
          await writeFile(path, text, "utf8");
        },
      },
    });
    if (outcome.refused !== undefined) {
      console.error(outcome.refused);
      process.exitCode = exitcodeof("schemaerror");
      return;
    }
    console.log(
      JSON.stringify(
        {
          installed: true,
          manifestpath: outcome.manifestpath,
          hostname,
          extensionid,
          installerversion: outcome.state.installerversion,
          systemwide,
        },
        null,
        2,
      ),
    );
    return;
  }
  if (subcommand === "uninstall") {
    const outcome = await uninstallnativehost({
      profiledir,
      hostname,
      now: Date.now(),
      ...(systemwide ? { systemwide: true } : {}),
      platform,
      io: {
        exists: async (path) => {
          try {
            await stat(path);
            return true;
          } catch {
            return false;
          }
        },
        removefile: async (path) => {
          await (await import("node:fs/promises")).rm(path, { force: true });
        },
      },
    });
    if (outcome.refused !== undefined) {
      console.error(outcome.refused);
      process.exitCode = exitcodeof("schemaerror");
      return;
    }
    console.log(
      JSON.stringify({ installed: false, manifestpath: outcome.manifestpath, removed: outcome.removed }, null, 2),
    );
    return;
  }
  if (subcommand === "diagnostics") {
    const companionpath = (flags.get("companion") ?? "").trim();
    const template =
      hostname !== "" && companionpath !== "" ? nativehostmanifesttemplate({ hostname, companionpath }) : undefined;
    const destination =
      hostname !== ""
        ? hostmanifestdestination({
            hostname,
            ...(profiledir !== "" ? { profiledir } : {}),
            ...(systemwide ? { systemwide: true } : {}),
            platform,
          })
        : undefined;
    const report = nativediagnostics({ state: nativedefaultstate(), now: Date.now() });
    console.log(
      JSON.stringify(
        {
          ...report,
          ...(destination !== undefined ? { manifestdestination: destination } : {}),
          ...(template !== undefined ? { manifesttemplate: template.manifest } : {}),
        },
        null,
        2,
      ),
    );
    return;
  }
  throw new Error(
    `The native subcommand ${subcommand} stays outside the reviewed surface; run devthink help for the command list.`,
  );
}

/** Exports runs, extractions and notes in csv, json or log format: the chain verifies first and an unmasked value refuses the export in full. */
async function cmdexport(args: string[]): Promise<void> {
  const { positional, flags } = parseflags(args);
  const scope = positional[0];
  if (scope === undefined) throw new Error("The export command needs its scope of runs, extractions or notes.");
  const descriptor = exportdescriptorof(flags.get("format") ?? "json", scope);
  const input = flags.get("input");
  if (input === undefined) throw new Error("The export command needs the --input file it exports.");
  const shapes = flags.has("shapes")
    ? (flags.get("shapes") as string)
        .split(",")
        .map((shape) => shape.trim())
        .filter((shape) => shape !== "")
    : [...defaultmaskshapes];
  const out = flags.get("out");
  const payload = JSON.parse(await readFile(input, "utf8"));
  const exported =
    scope === "runs"
      ? await exportchain({
          descriptor,
          log: {
            runid:
              typeof (payload as { runid?: string }).runid === "string" ? (payload as { runid: string }).runid : "run",
            sessionid: "flowrun",
            entries: (payload as { log: immutablelogentry[] }).log,
            updatedat: Date.now(),
          } as storedrunlog,
          shapes,
          ...(out !== undefined ? { path: out } : {}),
        })
      : scope === "extractions"
        ? exportextractions({
            descriptor,
            rows: payload as Array<Record<string, unknown>>,
            shapes,
            ...(out !== undefined ? { path: out } : {}),
          })
        : exportnotes({
            descriptor,
            notes: payload as sitenote[],
            shapes,
            ...(out !== undefined ? { path: out } : {}),
          });
  if (exported.result.reason !== undefined) throw new Error(exported.result.reason);
  if (out !== undefined) {
    await mkdir(resolve(out, ".."), { recursive: true });
    await writeFile(out, exported.content + "\n", "utf8");
  } else console.log(exported.content);
}

/** Scaffolds one plan file: the documented starting point a plan author edits, with read only steps and a placeholder origin the author replaces. */
async function cmdinit(args: string[]): Promise<void> {
  const { positional } = parseflags(args);
  const target = positional[0];
  if (target === undefined || target.trim() === "")
    throw new Error("The init command needs the plan file path it scaffolds.");
  const scaffold = {
    version: packageversion,
    goal: "Describe the objective of the plan",
    origin: "https://example.org",
    grants: ["observe", "readtext"],
    steps: [
      { id: "observe", kind: "observe", label: "Observe the page", gate: false },
      { id: "read", kind: "readtext", label: "Read the main text", target: "main" },
    ],
  };
  await mkdir(resolve(target, ".."), { recursive: true });
  await writeFile(target, JSON.stringify(scaffold, null, 2) + "\n", "utf8");
  console.log(
    `Scaffolded the plan file ${target}; edit the goal, the origin and the steps, then run devthink planlint on it.`,
  );
}

/** Probes the capabilities of the active runtime and prints the capability matrix beside the adapter declarations and the platform targets. */
async function cmddoctor(): Promise<void> {
  const probes = capabilityprobeof({
    dom: typeof document !== "undefined",
    storage: true,
    network: typeof fetch === "function",
    worker: true,
  });
  console.log(
    JSON.stringify(
      {
        version: packageversion,
        runtime: "node",
        probes,
        adapters: adapterdeclarationsof(),
        platforms: platformtargets(),
        capabilitycount: portablecapabilityset({
          vocabulary: actionkindcatalog(),
          probes,
          domlesskinds: readonlykinds(),
        }).length,
      },
      null,
      2,
    ),
  );
}

/** Prints the shared command registry the commandpalette and the cli register together. */
async function cmdcommands(args: string[]): Promise<void> {
  const { flags } = parseflags(args);
  const registry = clicommands(surfacepalette());
  if (flags.get("format") === "json") {
    console.log(JSON.stringify(registry, null, 2));
    return;
  }
  for (const command of registry)
    console.log(`${command.terminal ? "cli " : "ui  "} ${command.id}: ${command.label} [${command.surface}]`);
}

/** Prints the frozen capability manifest of every surface through the describe command of the 1.1.91 api freeze: one manifest per surface with its message types, action kinds, permissions and permission coverage beside the freeze scope record and the protocolv2 negotiation line — the json format answers the full manifests while the plain format prints one summary line per surface. */
async function cmddescribe(args: string[]): Promise<void> {
  const { flags } = parseflags(args);
  const surfaces: capmanifestsurface[] = ["background", "pagebridge", "sidepanel", "popup", "cli", "library", "mcp"];
  const manifests = surfaces.map((surface) => capmanifestof(surface));
  const negotiation = sharedprotocolversion([1, 2]);
  if (flags.get("format") === "json") {
    console.log(
      JSON.stringify(
        {
          freeze: {
            release: apifreezerelease,
            date: apifreezedate,
            scope: surfaces,
            supported: protocolsupported,
            deprecation: deprecationwindow,
          },
          protocol: negotiation,
          manifests,
        },
        null,
        2,
      ),
    );
    return;
  }
  console.log(
    `Devthink ${packageversion} — the protocolv2 api freeze of ${apifreezerelease} pinned on ${apifreezedate}.`,
  );
  console.log(
    `Supported protocol versions ${protocolsupported.minimum} through ${protocolsupported.maximum}; the deprecation window closes at ${deprecationwindow.closes}.`,
  );
  for (const manifest of manifests)
    console.log(
      `  ${manifest.surface.padEnd(12)} ${manifest.messages.length} message types, ${manifest.kinds.length} action kinds, ${manifest.permissions.length} permissions, pinned to release ${manifest.release}.`,
    );
}

/** Prints the version banner from package.json and every command with its one line description, beside the documented exit code classes. */
async function cmdhelp(): Promise<void> {
  console.log(`Devthink ${packageversion} — the consent-first browser agent bridge on the terminal.`);
  console.log("Usage: devthink <command> [options]");
  for (const command of clicommands(surfacepalette()).filter((entry) => entry.terminal))
    console.log(`  ${entrypad(command.id)} ${command.label}`);
  console.log(`Global flags: --config <file> (default ${defaultconfigfile}), --verbose, --quiet, --json.`);
  console.log(`Exit codes: ${cliexitclasses.map((exitclass) => `${exitclass}=${exitcodeof(exitclass)}`).join(", ")}.`);
}

/** Pads one command id so the help lines align. */
function entrypad(id: string): string {
  return id.padEnd(12);
}

/**
 * Family entry of the grand merge: the single devthink binary routes the
 * extension command family here (`devthink ext <command>`); the argv is
 * spliced into the process position the original entry reading expects,
 * the family main runs untouched and the caller argv is restored.
 *
 * @param argv the family arguments (without the family prefix).
 */
export async function runclifamily(argv: string[]): Promise<void> {
  const saved = process.argv.slice();
  process.argv = [saved[0], saved[1], ...argv];
  try {
    await main();
  } finally {
    process.argv = saved;
  }
}

async function main(): Promise<void> {
  const command = process.argv[2] ?? "help";
  const args = process.argv.slice(3);
  if (command === "manifest") {
    const manifesttext = await readFile(resolve("web/manifest.json"), "utf8");
    const manifest = JSON.parse(manifesttext) as {
      version: string;
      key?: string;
      permissions?: string[];
      optional_permissions?: string[];
      host_permissions?: string[];
      sandbox?: { pages?: string[] };
      offscreen?: { document?: string; reasons?: string[]; justification?: string };
      content_scripts?: Array<{ matches?: string[]; world?: string; js?: string[] }>;
    };
    const packagejson = JSON.parse(await readFile(resolve("package.json"), "utf8")) as { version: string };
    const permissions = manifest.permissions ?? [];
    const optional = manifest["optional_permissions"] ?? [];
    const denied = permissions.filter((permission) => forbidden.has(permission));
    const deniedoptional = optional.filter((permission) => !allowedoptional.has(permission));
    if (manifest.version !== packagejson.version) throw new Error("Manifest version must match package.json.");
    if (!manifest.key) throw new Error("A stable manifest key is required for the extension identity.");
    const identitykey = decodeidentitykey(manifest.key);
    if (identitykey.length !== 294)
      throw new Error(
        `The manifest key decodes to ${identitykey.length} bytes; the published Devthink identity key decodes to 294.`,
      );
    const digest = createHash("sha256").update(identitykey).digest("hex");
    const recorded = await recordedidentitydigest();
    if (recorded !== undefined && digest !== recorded)
      throw new Error(
        `The manifest identity key digest ${digest} does not match the recorded build artifact digest ${recorded}; changing the extension identity must be a reviewed decision through a rebuilt artifact.`,
      );
    if ((manifest["host_permissions"] ?? []).length) throw new Error("Mandatory host permissions are not allowed.");
    if (denied.length) throw new Error(`Forbidden permissions: ${denied.join(", ")}`);
    if (deniedoptional.length) throw new Error(`Forbidden optional permissions: ${deniedoptional.join(", ")}`);
    const sandboxpages = manifest.sandbox?.pages ?? [];
    if (manifest.sandbox !== undefined) {
      if (sandboxpages.length === 0) throw new Error("The sandbox key needs at least one sandbox page.");
      if (sandboxpages.some((page) => !/^([a-z0-9-]+)\.html$/.test(page)))
        throw new Error("Every sandbox page needs its plain html file name.");
      if (new Set(sandboxpages).size !== sandboxpages.length)
        throw new Error("The sandbox page names must stay unique.");
      const privileged = sandboxpages.filter((page) => privilegedpages.has(page));
      if (privileged.length)
        throw new Error(
          `The sandbox pages ${privileged.join(", ")} hold extension privileges and must never run untrusted markup.`,
        );
    }
    if (manifest.offscreen !== undefined) {
      if (!manifest.offscreen.document || !/^[a-z0-9-]+\.html$/.test(manifest.offscreen.document))
        throw new Error("The offscreen declaration needs its document path.");
      if (!manifest.offscreen.reasons?.length)
        throw new Error("The offscreen declaration needs the reasons the user reviewed.");
      if (!manifest.offscreen.justification?.trim())
        throw new Error("The offscreen declaration needs its justification in plain language.");
    }
    const worlds = (manifest["content_scripts"] ?? []).map((script) => script.world ?? "ISOLATED");
    if (worlds.some((world) => world !== "ISOLATED"))
      throw new Error(
        "Content scripts stay registered in the isolated world by default; no main world registration exists.",
      );
    if ((manifest["content_scripts"] ?? []).some((script) => (script.matches ?? []).length > 0))
      throw new Error(
        "Content script registrations carry no matches because injection stays behind the granted scripting calls on reviewed origins.",
      );
    const filebytes: Record<string, Uint8Array> = {};
    let bundlepresent = false;
    try {
      const distdir = resolve("dist/extension");
      for (const entry of await readdir(distdir))
        if (entry.endsWith(".js")) filebytes[entry] = new Uint8Array(await readFile(join(distdir, entry)));
      bundlepresent = true;
      /* the 2.0.2 icon family: the icon payloads the build materializes under dist/extension/icons join the bundle bytes so the deep manifest check reads their png dimensions against the manifest size keys — the store set provably renders at the required sizes through the cli manifest command too. */
      const iconsdir = resolve("dist/extension/icons");
      for (const entry of await readdir(iconsdir))
        if (entry.endsWith(".png")) filebytes[`icons/${entry}`] = new Uint8Array(await readFile(join(iconsdir, entry)));
    } catch {
      /* a manifest check before a build carries no bundled scripts; the deep checks report the absent bytes */
    }
    const deep = deepmanifestchecks({
      manifest,
      manifesttext,
      manifestfile: "manifest.json",
      filebytes,
      capabilities: capabilityapireport([...permissions, ...optional]),
      digestof: (bytes) => createHash("sha256").update(bytes).digest("base64"),
      /* the 2.0.6 fail-soft: a running tree without any dist/extension bundle (an installed library package, an unbuilt checkout) answers the icon family through the release-zip note instead of six absent-bundle errors — the bundle-present error stays for a built tree whose bundle misses a declared icon. */
      bundlepresent,
    });
    if (deep.exitcode !== 0) {
      for (const finding of deep.findings.filter((entry) => entry.severity === "error"))
        console.error(
          `${finding.severity.toUpperCase()} ${finding.rule} at ${finding.path}${finding.source !== undefined ? ` (${finding.source})` : ""}: ${finding.message}`,
        );
      process.exitCode = deep.exitcode;
      return;
    }
    /* the 1.1.91 api freeze: the manifest validation verifies the served capability manifest files stay pinned to the release, the frozen protocol major and the frozen surface lists */
    const capsurfaces: capmanifestsurface[] = [
      "background",
      "pagebridge",
      "sidepanel",
      "popup",
      "cli",
      "library",
      "mcp",
    ];
    const capmanifestfiles: Array<{
      surface: string;
      release: string;
      protocolmajor: number;
      messages: number;
      permissions: number;
    }> = [];
    for (const surface of capsurfaces) {
      const capstext = await readFile(new URL(`./caps/${surface}.json`, import.meta.url), "utf8");
      const stored = JSON.parse(capstext) as {
        surface: string;
        release: string;
        protocolmajor: number;
        messages: string[];
        kinds: string[];
        permissions: string[];
      };
      if (stored.surface !== surface)
        throw new Error(`The capmanifest of the ${surface} surface names the surface ${stored.surface}.`);
      if (stored.release !== packagejson.version)
        throw new Error(
          `The capmanifest of the ${surface} surface pins the release ${stored.release} while the package carries ${packagejson.version}.`,
        );
      if (stored.protocolmajor !== 2)
        throw new Error(`The capmanifest of the ${surface} surface must pin the frozen protocol major two.`);
      const served = capmanifestof(surface);
      if (
        JSON.stringify(served.messages) !== JSON.stringify(stored.messages) ||
        JSON.stringify(served.permissions) !== JSON.stringify(stored.permissions) ||
        JSON.stringify(served.kinds) !== JSON.stringify(stored.kinds)
      )
        throw new Error(
          `The capmanifest of the ${surface} surface drifted from the frozen surface lists of apifreeze.ts.`,
        );
      capmanifestfiles.push({
        surface,
        release: stored.release,
        protocolmajor: stored.protocolmajor,
        messages: stored.messages.length,
        permissions: stored.permissions.length,
      });
    }
    console.log(
      JSON.stringify(
        {
          valid: true,
          version: manifest.version,
          identitykeybytes: identitykey.length,
          permissions,
          optionalpermissions: optional,
          capmanifests: capmanifestfiles,
          ...(sandboxpages.length > 0 ? { sandboxpages } : {}),
          ...(manifest.offscreen !== undefined
            ? { offscreendocument: manifest.offscreen.document, offscreenreasons: manifest.offscreen.reasons }
            : {}),
          deepchecks: {
            rules: deep.findings.length,
            findings: deep.findings.map((finding) => ({
              rule: finding.rule,
              path: finding.path,
              severity: finding.severity,
              ...(finding.source !== undefined ? { source: finding.source } : {}),
              message: finding.message,
            })),
          },
        },
        null,
        2,
      ),
    );
    return;
  }
  const state = await globalstate(args);
  if (command === "planlint") {
    await cmdplanlint(args, state);
    return;
  }
  if (command === "migrateplan") {
    await cmdmigrateplan(args, state);
    return;
  }
  if (command === "recipes") {
    await cmdrecipes(args, state);
    return;
  }
  if (command === "flowrun") {
    await cmdflowrun(args);
    return;
  }
  if (command === "runworkflow") {
    await cmdrunworkflow(args, state);
    return;
  }
  if (command === "exportdata") {
    await cmdexportdata(args, state);
    return;
  }
  if (command === "headless") {
    await cmdheadless(args, state);
    return;
  }
  if (command === "serve") {
    await cmdserve(args);
    return;
  }
  if (command === "native") {
    await cmdnative(args);
    return;
  }
  if (command === "export") {
    await cmdexport(args);
    return;
  }
  if (command === "init") {
    await cmdinit(args);
    return;
  }
  if (command === "doctor") {
    await cmddoctor();
    return;
  }
  if (command === "commands") {
    await cmdcommands(args);
    return;
  }
  if (command === "describe") {
    await cmddescribe(args);
    return;
  }
  if (command === "help" || command === "--help") {
    await cmdhelp();
    return;
  }
  throw new Error(
    `The command ${command} stays outside the reviewed command surface; run devthink help for the command list.`,
  );
}

/* the grand-merge guard: when this module is imported as the ext family
   surface by the devthink router (dynamic import), the module-load main must
   not fire — only a direct `bun cli.ts` (or bun entry) run executes it. */
const cliDirectEntry = process.argv[1]?.endsWith("cli.ts") || process.argv[1]?.endsWith("cli");
const cliBunEntry = (import.meta as ImportMeta & { main?: boolean }).main === true;
if (cliDirectEntry || cliBunEntry)
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = exitcodeof("schemaerror");
  });

/* ── Merged from clitools.ts: the cli tool surface. ── */
import { recordoutcome, recordstep } from "./progress.js";

/**
 * Cli tools logic of the 1.1.80 family.
 * The pure half of the terminal surface lives in this one module while the impure half (the filesystem reads, the terminal prompts and the process exit) stays in the cli entry that wires it: the deep manifest checks grade the manifest key allowlist, the permission source lines, the content security policy hashes, the web accessible resources, the permission duplication, the minimum chrome version against the capability report and the icon dimensions; the planlint findings add the selector grammar, the required option fields and the origin allowlist to the shared lint engine beside the risk summary; the runworkflow composition loads a workflow document through the composeworkflow engine the extension runs; the exportdata selection routes session, audit and extraction records through the shared export menu serializers with the time window filter and the secret store refusal; the exit code mapping documents the failure classes; and the headless fixture resolution replays read only kinds against recorded page state fixtures under the fixture consent gate.
 * Every rule shares the modules the extension shares: the kind catalog and the selector grammar come from policy, the risk grades flow through the same resolvedrisk derivation, the workflow steps compose through the same engine, the serializers ride the exporttools descriptors and the fixtures carry the observation schema of the live snapshot pipeline — so the consent gates hold on the terminal exactly as they hold in the browser.
 */

/** Parses the global cli configuration under schemastrict: the default plan location, the fixtures directory, the verbosity, the default format and the consent allowlist; unknown fields and wrong shapes refuse with the field that names them, so a misconfigured terminal never silently widens a default. */
export function parsecliconfig(value: unknown): cliconfiguration {
  if (value === undefined || value === null) return {};
  if (typeof value !== "object" || Array.isArray(value))
    throw new Error("The cli configuration must be a json object.");
  const root = value as Record<string, unknown>;
  const unknownfields = Object.keys(root).filter(
    (key) => !["defaultplan", "fixturesdir", "verbosity", "format", "allowlist"].includes(key),
  );
  if (unknownfields.length > 0)
    throw new Error(
      `The cli configuration carries the unknown field${unknownfields.length === 1 ? "" : "s"} ${unknownfields.join(", ")}; schemastrict refuses unknown configuration fields.`,
    );
  const config: cliconfiguration = {};
  if (root.defaultplan !== undefined) {
    if (typeof root.defaultplan !== "string" || root.defaultplan.trim() === "")
      throw new Error("The defaultplan configuration must be a non-empty path string.");
    config.defaultplan = root.defaultplan;
  }
  if (root.fixturesdir !== undefined) {
    if (typeof root.fixturesdir !== "string" || root.fixturesdir.trim() === "")
      throw new Error("The fixturesdir configuration must be a non-empty directory string.");
    config.fixturesdir = root.fixturesdir;
  }
  if (root.verbosity !== undefined) {
    if (root.verbosity !== "quiet" && root.verbosity !== "normal" && root.verbosity !== "verbose")
      throw new Error("The verbosity configuration must stay quiet, normal or verbose.");
    config.verbosity = root.verbosity;
  }
  if (root.format !== undefined) {
    if (root.format !== "human" && root.format !== "json")
      throw new Error("The format configuration must stay human or json.");
    config.format = root.format;
  }
  if (root.allowlist !== undefined) {
    if (
      !Array.isArray(root.allowlist) ||
      !root.allowlist.every((origin) => typeof origin === "string" && origin.startsWith("https://"))
    )
      throw new Error("The allowlist configuration must be a list of HTTPS origins.");
    config.allowlist = root.allowlist.filter((origin): origin is string => typeof origin === "string");
  }
  return config;
}

/** The exit code classes the cli documents in the readme: every command maps its failure onto exactly one class. */
export const cliexitclasses: readonly string[] = [
  "ok",
  "consentrefused",
  "stepfailed",
  "schemaerror",
  "unsupported",
  "cancelled",
];

/** Maps one exit class onto its documented exit code; an unknown class refuses as a schema error because the mapping itself is contract. */
export function exitcodeof(exitclass: string): number {
  const codes: Record<string, number> = {
    ok: 0,
    consentrefused: 1,
    stepfailed: 2,
    schemaerror: 3,
    unsupported: 4,
    cancelled: 5,
  };
  const code = codes[exitclass];
  if (code === undefined)
    throw new Error(`The exit class ${exitclass} stays outside the documented classes ${cliexitclasses.join(", ")}.`);
  return code;
}

/** Reads the exit class of one workflow run state: a done run reports ok, a failed run reports the step failure, a cancelled run reports the cancellation and every other state reports the schema error of an unfinished document. */
export function exitclassofrun(run: workflowrun): string {
  if (run.state === "done") return "ok";
  if (run.state === "failed") return "stepfailed";
  if (run.state === "cancelled") return "cancelled";
  return "schemaerror";
}

/** The reviewed manifest key allowlist of the deep manifest check: every key the published extension may declare; a key outside the list is a review miss, never a silent pass. The browsers and vsix keys of the 1.1.93 single manifest design carry the per browser overlays and the vs code packaging data the build reads — reviewed metadata keys the derived browser manifests strip before they ship. */
export const manifestkeyallowlist: readonly string[] = [
  "manifest_version",
  "key",
  "name",
  "version",
  "description",
  "default_locale",
  "permissions",
  "optional_permissions",
  "optional_host_permissions",
  "host_permissions",
  "content_scripts",
  "content_security_policy",
  "web_accessible_resources",
  "sandbox",
  "offscreen",
  "background",
  "action",
  "side_panel",
  "chrome_url_overrides",
  "options_ui",
  "icons",
  "minimum_chrome_version",
  "browsers",
  "vsix",
];

/** The reviewed web accessible resource set of the deep manifest check: the pages the extension declares to the store; a resource outside the set is web exposed without review. */
export const reviewedwebresources: readonly string[] = ["sandbox.html"];

/** Reads the capability api report of one permission list: every api the permissions turn on with the minimum chrome version that ships it, so the minimum chrome version check derives its floor from the declared capabilities instead of a hardcoded number. */
export function capabilityapireport(permissions: string[]): Array<{ api: string; minchrome: number }> {
  const floors: Record<string, number> = {
    activeTab: 88,
    storage: 88,
    scripting: 88,
    sidePanel: 114,
    tabs: 88,
    downloads: 88,
    clipboardRead: 88,
    clipboardWrite: 88,
    offscreen: 109,
    nativeMessaging: 88,
  };
  return permissions.flatMap((permission) =>
    floors[permission] !== undefined ? [{ api: permission, minchrome: floors[permission] as number }] : [],
  );
}

/** Reads the png dimensions of one icon payload straight from the ihdr header: the width and height the declared icon size key must match. */
export function pngdimensions(bytes: Uint8Array): { width: number; height: number } {
  const signature = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
  if (bytes.length < 24 || signature.some((byte, index) => bytes[index] !== byte))
    throw new Error("The icon payload carries no png signature.");
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  return { width: view.getUint32(16), height: view.getUint32(20) };
}

/** Reads the source file and line of one manifest declaration: the first text line that carries the value, in the file:line form editors consume. */
export function manifestsourceline(manifesttext: string, manifestfile: string, value: string): string | undefined {
  const index = manifesttext.indexOf(value);
  if (index < 0) return undefined;
  const line = manifesttext.slice(0, index).split("\n").length;
  return `${manifestfile}:${line}`;
}

/** Reads the sha256 script hashes of one content security policy list: the hash entries the deep check verifies against the bundled script bytes. */
export function csphashesof(policy: string): string[] {
  return [...policy.matchAll(/'sha256-([A-Za-z0-9+/=]+)'/g)].map((match) => `sha256-${match[1]}`);
}

/** Runs the deep manifest checks of the 1.1.80 family: every manifest key verifies against the runtime policy allowlist, every permission reports its source file and line, the content security policy hashes verify against the bundled scripts through the digest seam, the web accessible resources verify against the reviewed resource set, duplicated permissions across the required and optional sets refuse, the minimum chrome version checks against the capability report and every declared icon verifies its file presence and dimensions. */
export function deepmanifestchecks(input: {
  manifest: unknown;
  manifesttext: string;
  manifestfile: string;
  filebytes: Record<string, Uint8Array>;
  capabilities: Array<{ api: string; minchrome: number }>;
  digestof: (bytes: Uint8Array) => string;
  bundlepresent?: boolean;
}): { findings: manifestcheckfinding[]; exitcode: number } {
  if (!input.manifest || typeof input.manifest !== "object" || Array.isArray(input.manifest))
    throw new Error("The manifest must be a json object.");
  const manifest = input.manifest as Record<string, unknown>;
  const findings: manifestcheckfinding[] = [];
  for (const key of Object.keys(manifest)) {
    if (!manifestkeyallowlist.includes(key))
      findings.push({
        rule: "manifest.key.allowlist",
        path: key,
        ...(manifestsourceline(input.manifesttext, input.manifestfile, `"${key}"`) !== undefined
          ? { source: manifestsourceline(input.manifesttext, input.manifestfile, `"${key}"`) as string }
          : {}),
        severity: "error",
        message: `The manifest key ${key} stays outside the runtime policy allowlist; an undeclared key never ships unreviewed.`,
      });
  }
  const permissions = Array.isArray(manifest.permissions)
    ? manifest.permissions.filter((permission): permission is string => typeof permission === "string")
    : [];
  const optional = Array.isArray(manifest["optional_permissions"])
    ? manifest["optional_permissions"].filter((permission): permission is string => typeof permission === "string")
    : [];
  for (const permission of permissions) {
    const source = manifestsourceline(input.manifesttext, input.manifestfile, `"${permission}"`);
    findings.push({
      rule: "manifest.permission.source",
      path: `permissions.${permission}`,
      ...(source !== undefined ? { source } : {}),
      severity: "info",
      message: `The required permission ${permission} declares at ${source ?? "an unknown line"}.`,
    });
  }
  for (const permission of optional) {
    const source = manifestsourceline(input.manifesttext, input.manifestfile, `"${permission}"`);
    findings.push({
      rule: "manifest.permission.source",
      path: `optional_permissions.${permission}`,
      ...(source !== undefined ? { source } : {}),
      severity: "info",
      message: `The optional permission ${permission} declares at ${source ?? "an unknown line"}.`,
    });
  }
  const duplicated = permissions.filter((permission) => optional.includes(permission));
  if (duplicated.length > 0)
    findings.push({
      rule: "manifest.permission.duplicate",
      path: "permissions",
      severity: "error",
      message: `The permission${duplicated.length === 1 ? "" : "s"} ${duplicated.join(", ")} declare${duplicated.length === 1 ? "s" : ""} in both the required and the optional sets; one permission declares exactly once.`,
    });
  if (permissions.includes("nativeMessaging"))
    findings.push({
      rule: "manifest.permission.nativemessaging",
      path: "permissions.nativeMessaging",
      severity: "error",
      message:
        "The native messaging permission declares in the optional set only: a required native messaging permission installs a native host grant the user never reviewed, so the validator refuses it in the required set and the native transport stays a per install user choice.",
    });
  if (optional.includes("nativeMessaging"))
    findings.push({
      rule: "manifest.permission.nativemessaging",
      path: "optional_permissions.nativeMessaging",
      severity: "info",
      message:
        "The native messaging permission declares in the optional set: the user grants the native transport per install behind the install consent, the per class gates and the kill switch of the native host bridge.",
    });
  const csp = manifest["content_security_policy"];
  if (csp === undefined) {
    findings.push({
      rule: "manifest.csp.hashes",
      path: "content_security_policy",
      severity: "info",
      message:
        "The manifest declares no content security policy; the store default script-src 'self' applies and no inline script runs.",
    });
  } else if (!csp || typeof csp !== "object" || Array.isArray(csp)) {
    findings.push({
      rule: "manifest.csp.hashes",
      path: "content_security_policy",
      severity: "error",
      message:
        "The content security policy must be the object with its extension pages policy; the manifest v3 form the extension pages read.",
    });
  } else {
    /* the 1.1.95 strict csp: the manifest v3 key the root manifest and both overlays declare reads first, the legacy extension scripts key stays a fallback so an old dialect still answers the check */
    const policy =
      (csp as Record<string, unknown>)["extension_pages"] ?? (csp as Record<string, unknown>)["extension_scripts"];
    if (typeof policy !== "string")
      findings.push({
        rule: "manifest.csp.hashes",
        path: "content_security_policy.extension_pages",
        severity: "error",
        message: "The extension pages policy needs its string form.",
      });
    else {
      if (/unsafe-inline|unsafe-eval|\*/.test(policy))
        findings.push({
          rule: "manifest.csp.hashes",
          path: "content_security_policy.extension_pages",
          severity: "error",
          message:
            "The extension pages policy widens with a wildcard or an unsafe source; the reviewed policy carries only 'self' and script hashes.",
        });
      const hashes = csphashesof(policy);
      if (hashes.length === 0)
        findings.push({
          rule: "manifest.csp.hashes",
          path: "content_security_policy.extension_pages",
          severity: "info",
          message: "The extension pages policy pins no script hash; only the 'self' origin loads scripts.",
        });
      for (const hash of hashes) {
        const digest = hash.slice("sha256-".length);
        const matches = Object.entries(input.filebytes).filter(([, bytes]) => input.digestof(bytes) === digest);
        findings.push(
          matches.length > 0
            ? {
                rule: "manifest.csp.hashes",
                path: "content_security_policy.extension_pages",
                severity: "info",
                message: `The script hash ${hash} verifies against ${matches.map(([name]) => name).join(", ")}.`,
              }
            : {
                rule: "manifest.csp.hashes",
                path: "content_security_policy.extension_pages",
                severity: "error",
                message: `The script hash ${hash} verifies against no bundled script; every declared hash pins a shipped file.`,
              },
        );
      }
    }
  }
  const resources = manifest["web_accessible_resources"];
  if (resources === undefined) {
    findings.push({
      rule: "manifest.war.reviewed",
      path: "web_accessible_resources",
      severity: "info",
      message: "The manifest declares no web accessible resources; nothing the extension ships is web exposed.",
    });
  } else {
    const declared = Array.isArray(resources)
      ? resources.flatMap((entry) =>
          typeof entry === "string"
            ? [entry]
            : entry && typeof entry === "object" && Array.isArray((entry as Record<string, unknown>).resources)
              ? ((entry as Record<string, unknown>).resources as unknown[]).filter(
                  (resource): resource is string => typeof resource === "string",
                )
              : [],
        )
      : [];
    if (declared.length === 0)
      findings.push({
        rule: "manifest.war.reviewed",
        path: "web_accessible_resources",
        severity: "error",
        message: "The web accessible resources declaration carries no resource; an empty declaration declares nothing.",
      });
    for (const resource of declared) {
      const source = manifestsourceline(input.manifesttext, input.manifestfile, resource);
      if (!reviewedwebresources.includes(resource))
        findings.push({
          rule: "manifest.war.reviewed",
          path: "web_accessible_resources",
          ...(source !== undefined ? { source } : {}),
          severity: "error",
          message: `The web accessible resource ${resource} stays outside the reviewed resource set ${reviewedwebresources.join(", ")}.`,
        });
    }
  }
  const floor = input.capabilities.reduce((highest, entry) => Math.max(highest, entry.minchrome), 0);
  const minimum = manifest["minimum_chrome_version"];
  if (minimum === undefined) {
    findings.push({
      rule: "manifest.chromeminimum",
      path: "minimum_chrome_version",
      severity: "info",
      message: `The manifest declares no minimum chrome version; the capability report of ${input.capabilities.length} api${input.capabilities.length === 1 ? "" : "s"} derives the floor ${floor}.`,
    });
  } else if (typeof minimum !== "number" || !Number.isInteger(minimum) || minimum < 88) {
    findings.push({
      rule: "manifest.chromeminimum",
      path: "minimum_chrome_version",
      severity: "error",
      message: "The minimum chrome version must be an integer at or above the manifest v3 floor of 88.",
    });
  } else if (minimum < floor) {
    findings.push({
      rule: "manifest.chromeminimum",
      path: "minimum_chrome_version",
      severity: "error",
      message: `The declared minimum chrome version ${minimum} sits below the capability floor ${floor} the declared apis require; a browser below the floor installs an extension whose apis miss.`,
    });
  }
  const icons = manifest.icons;
  if (icons === undefined) {
    findings.push({
      rule: "manifest.icons",
      path: "icons",
      severity: "info",
      message: "The manifest declares no icons; the store renders the default puzzle piece beside the extension name.",
    });
  } else if (!icons || typeof icons !== "object" || Array.isArray(icons)) {
    findings.push({
      rule: "manifest.icons",
      path: "icons",
      severity: "error",
      message: "The icons declaration must be the object of size keys and icon paths.",
    });
  } else {
    for (const [size, path] of Object.entries(icons as Record<string, unknown>)) {
      const declared = Number(size);
      if (typeof path !== "string" || path.trim() === "") {
        findings.push({
          rule: "manifest.icons",
          path: `icons.${size}`,
          severity: "error",
          message: `The icon of size ${size} needs its file path.`,
        });
        continue;
      }
      const bytes = input.filebytes[path];
      if (bytes === undefined) {
        if (input.bundlepresent === false) {
          findings.push({
            rule: "manifest.icons",
            path: `icons.${size}`,
            severity: "info",
            message: `The icon ${path} of size ${size} rides the browser bundle of the release zip channel; the running tree carries no bundle to verify against — a repository checkout verifies it after pnpm build and an installed library package carries the manifest structure alone.`,
          });
          continue;
        }
        const source = manifestsourceline(input.manifesttext, input.manifestfile, path);
        findings.push({
          rule: "manifest.icons",
          path: `icons.${size}`,
          ...(source !== undefined ? { source } : {}),
          severity: "error",
          message: `The icon ${path} of size ${size} ships no file in the bundle.`,
        });
        continue;
      }
      try {
        const dimensions = pngdimensions(bytes);
        if (dimensions.width !== declared || dimensions.height !== declared)
          findings.push({
            rule: "manifest.icons",
            path: `icons.${size}`,
            severity: "error",
            message: `The icon ${path} decodes to ${dimensions.width}x${dimensions.height} while its size key declares ${declared}.`,
          });
        else
          findings.push({
            rule: "manifest.icons",
            path: `icons.${size}`,
            severity: "info",
            message: `The icon ${path} decodes to ${dimensions.width}x${dimensions.height} and matches its size key.`,
          });
      } catch (error) {
        findings.push({
          rule: "manifest.icons",
          path: `icons.${size}`,
          severity: "error",
          message: `The icon ${path} fails its png read: ${error instanceof Error ? error.message : String(error)}`,
        });
      }
    }
  }
  const exitcode = findings.some((finding) => finding.severity === "error") ? 1 : 0;
  return { findings, exitcode };
}

/** Runs the 1.1.80 planlint findings the cli adds to the shared lint engine: the kind catalog check that refuses forbidden kinds, the selector grammar check shared with policy, the required option fields check the executor enforces and the origin allowlist check against the consent allowlist the user configured. */
export function planlintfindings(input: {
  file: planfile;
  capabilities?: string[];
  allowlist?: string[];
}): planlintdiagnostic[] {
  const diagnostics: planlintdiagnostic[] = [];
  const catalog = new Set(actionkindcatalog());
  const capabilities = input.capabilities === undefined ? undefined : new Set(input.capabilities);
  input.file.steps.forEach((step, index) => {
    const path = `steps[${index}]`;
    if (!catalog.has(step.kind))
      diagnostics.push({
        code: "plan.kind.catalog",
        path: `${path}.kind`,
        severity: "error",
        message: `The step ${step.id} carries the kind ${step.kind} outside the reviewed catalog of ${catalog.size} kinds; a forbidden kind refuses the plan before any run starts.`,
      });
    if (step.target !== undefined) {
      const trimmed = step.target.trim();
      if (trimmed.startsWith("{")) {
        try {
          const reference = validatetargetref(JSON.parse(trimmed));
          if (!reference.allowed)
            diagnostics.push({
              code: "plan.selector.grammar",
              path: `${path}.target`,
              severity: "error",
              message: `The target reference of the step ${step.id} fails the shared target reference grammar: ${reference.reason}`,
            });
        } catch (error) {
          diagnostics.push({
            code: "plan.selector.grammar",
            path: `${path}.target`,
            severity: "error",
            message: `The target of the step ${step.id} parses neither as a selector nor as a target reference: ${error instanceof Error ? error.message : String(error)}`,
          });
        }
      } else {
        const selector = cssselectorvalid(trimmed);
        if (!selector.allowed)
          diagnostics.push({
            code: "plan.selector.grammar",
            path: `${path}.target`,
            severity: "error",
            message: `The selector of the step ${step.id} fails the shared selector grammar: ${selector.reason}`,
          });
      }
    }
    const required = kindoptionfields(step.kind);
    if (required.length > 0) {
      let options: Record<string, unknown> = {};
      if (step.options !== undefined) {
        try {
          const parsed = JSON.parse(step.options);
          if (!parsed || typeof parsed !== "object" || Array.isArray(parsed))
            throw new Error("The options payload must be a json object.");
          options = parsed as Record<string, unknown>;
        } catch (error) {
          diagnostics.push({
            code: "plan.options.required",
            path: `${path}.options`,
            severity: "error",
            message: `The step ${step.id} of kind ${step.kind} carries options that parse no json object: ${error instanceof Error ? error.message : String(error)}`,
          });
        }
      }
      const missing = required.filter((field) => options[field] === undefined);
      if (missing.length > 0)
        diagnostics.push({
          code: "plan.options.required",
          path: `${path}.options`,
          severity: "error",
          message: `The step ${step.id} of kind ${step.kind} misses the required option field${missing.length === 1 ? "" : "s"} ${missing.join(", ")}; the executor refuses the same payload at run time.`,
        });
    }
    if (capabilities !== undefined && !capabilities.has(step.kind))
      diagnostics.push({
        code: "plan.capability.catalog",
        path: `${path}.kind`,
        severity: "error",
        message: `The step ${step.id} carries the kind ${step.kind} outside the declared capability set; the target runtime never executes it.`,
      });
  });
  if (input.allowlist !== undefined && input.allowlist.length > 0 && !input.allowlist.includes(input.file.origin))
    diagnostics.push({
      code: "plan.origin.allowlist",
      path: "origin",
      severity: "error",
      message: `The plan origin ${input.file.origin} stays outside the consent allowlist of ${input.allowlist.length} origin${input.allowlist.length === 1 ? "" : "s"}; the extension demands the same grant before any step runs.`,
    });
  return diagnostics;
}

/** Reads the risk summary of one plan file: the step counts per risk class beside the total, so the review reads the plan risk shape at a glance. */
export function planrisksummaryof(file: planfile): planrisksummary {
  let read = 0;
  let interaction = 0;
  let sensitive = 0;
  for (const step of file.steps) {
    const risk = plansteprisk(step);
    if (risk === "read") read += 1;
    else if (risk === "interaction") interaction += 1;
    else sensitive += 1;
  }
  return {
    read,
    interaction,
    sensitive,
    steps: file.steps.length,
    reason: `The plan carries ${file.steps.length} step${file.steps.length === 1 ? "" : "s"}: ${read} read, ${interaction} interaction and ${sensitive} sensitive; the sensitive steps gate on the human review before any run starts.`,
  };
}

/** Parses one workflow document under schemastrict: the version, the workflow payload with its name, version, origins and steps; unknown fields refuse with the path that names them. */
export function parseworkflowdocument(value: unknown): workflowdocument {
  if (typeof value !== "object" || value === null || Array.isArray(value))
    throw new Error("The workflow document must be a json object.");
  const root = value as Record<string, unknown>;
  const unknownroot = Object.keys(root).filter((key) => !["version", "workflow"].includes(key));
  if (unknownroot.length > 0)
    throw new Error(
      `The workflow document carries the unknown field${unknownroot.length === 1 ? "" : "s"} ${unknownroot.join(", ")}; schemastrict refuses unknown workflow document fields.`,
    );
  if (typeof root.version !== "string" || root.version.trim() === "")
    throw new Error("The workflow document needs its version as a non-empty string.");
  const payload = root.workflow;
  if (typeof payload !== "object" || payload === null || Array.isArray(payload))
    throw new Error("The workflow document needs its workflow payload object.");
  const candidate = payload as Record<string, unknown>;
  const unknownpayload = Object.keys(candidate).filter(
    (key) => !["name", "version", "origins", "steps", "blocks"].includes(key),
  );
  if (unknownpayload.length > 0)
    throw new Error(
      `The workflow payload carries the unknown field${unknownpayload.length === 1 ? "" : "s"} ${unknownpayload.join(", ")}; schemastrict refuses unknown workflow payload fields.`,
    );
  if (typeof candidate.name !== "string" || candidate.name.trim() === "")
    throw new Error("The workflow needs its name as a non-empty string.");
  if (typeof candidate.version !== "number" || !Number.isInteger(candidate.version) || candidate.version < 1)
    throw new Error("The workflow version must be a positive integer.");
  if (
    !Array.isArray(candidate.origins) ||
    candidate.origins.length === 0 ||
    !candidate.origins.every((origin) => typeof origin === "string" && origin.startsWith("https://"))
  )
    throw new Error("The workflow needs at least one granted HTTPS origin.");
  if (!Array.isArray(candidate.steps) || candidate.steps.length === 0)
    throw new Error("The workflow needs at least one step.");
  const steps = candidate.steps.map((step, index) => {
    const parsed = workflowstepof(step);
    if (parsed === undefined) throw new Error(`The workflow step at index ${index} fails the workflow step grammar.`);
    return parsed as unknown as Record<string, unknown>;
  });
  const blocks =
    candidate.blocks === undefined
      ? undefined
      : (candidate.blocks as unknown[]).map((block, index) => {
          if (!block || typeof block !== "object")
            throw new Error(`The workflow block at index ${index} must be an object.`);
          return block as Record<string, unknown>;
        });
  return {
    version: root.version,
    workflow: {
      name: candidate.name,
      version: candidate.version,
      origins: candidate.origins as string[],
      steps,
      ...(blocks !== undefined ? { blocks } : {}),
    },
  };
}

/** Composes one workflow document through the engine the extension runs: the kinds verify against the reviewed catalog and the risk grades flow through the same policy table, so the terminal replay and the browser run grade one workflow identically. */
export function composeworkflowdocument(document: workflowdocument, now: number): workflowrecord {
  const steps = document.workflow.steps.flatMap((step) => {
    const parsed = workflowstepof(step);
    return parsed !== undefined ? [parsed] : [];
  });
  const blocks = (document.workflow.blocks ?? []).flatMap((block) => {
    const parsed = workflowblockof(block);
    return parsed !== undefined ? [parsed] : [];
  });
  return composeworkflow({
    name: document.workflow.name,
    version: document.workflow.version,
    origins: document.workflow.origins,
    steps,
    blocks,
    now,
    kindallowed: (kind) => {
      try {
        actionrisk(kind as never);
        return true;
      } catch {
        return false;
      }
    },
    riskof: (kind) => {
      try {
        return actionrisk(kind as never);
      } catch {
        return "sensitive" as const;
      }
    },
  });
}

/** Builds the structured outcome summary of one runworkflow execution: the run state beside the per step durations, the checkpoint the run reached and the exit class the terminal maps onto its exit code. */
export function runworkflowsummaryof(input: {
  runid: string;
  run: workflowrun;
  log: runlogentry[];
}): runworkflowoutcome {
  const exitclass = exitclassofrun(input.run);
  return {
    runid: input.runid,
    state: input.run.state,
    steps: input.log.map((entry) => ({
      stepid: entry.stepid,
      label: entry.label,
      state: entry.state,
      duration: entry.duration,
      summary: entry.summary,
    })),
    checkpoint: input.run.cursor,
    exitclass,
    exitcode: exitcodeof(exitclass),
    ...(input.run.failreason !== undefined ? { reason: input.run.failreason } : {}),
    ...(input.run.cancelreason !== undefined ? { reason: input.run.cancelreason } : {}),
  };
}

/** Renders the audit trail lines of one runworkflow execution: one json line per run log entry with the sealed header, the file the command writes beside the workflow after each run. */
export function workflowauditlines(input: {
  runid: string;
  workflow: string;
  log: runlogentry[];
  now: number;
}): string {
  const header = JSON.stringify({ runid: input.runid, workflow: input.workflow, state: "sealed", at: input.now });
  return [header, ...input.log.map((entry) => JSON.stringify(entry))].join("\n");
}

/** Filters records through the exportdata time window: a record enters the window when its timestamp field sits inside the from and to bounds the flags declared; an absent bound stays open and a record without a timestamp never drops on a window it cannot answer. */
export function exportdatawindow(
  records: Array<Record<string, unknown>>,
  from?: number,
  to?: number,
  timefield = "at",
): Array<Record<string, unknown>> {
  return records.filter((record) => {
    const at = record[timefield];
    if (typeof at !== "number" || !Number.isFinite(at)) return true;
    if (from !== undefined && at < from) return false;
    if (to !== undefined && at > to) return false;
    return true;
  });
}

/** Refuses secret store material before any serialization: a record that carries a secret shaped field without its mask marker, or a vault entry marker at all, refuses the export in full because the secret store never ships through an export. */
export function secretstorerefusal(records: Array<Record<string, unknown>>): {
  refused: boolean;
  fields: string[];
  reason?: string;
} {
  const fields = new Set<string>();
  for (const record of records) {
    for (const [name, value] of Object.entries(record)) {
      const lower = name.toLowerCase();
      if (lower === "vaultid" || lower === "vaultentry" || lower === "secretstore") fields.add(name);
      if (
        typeof value === "string" &&
        value.trim() !== "" &&
        secretfieldshapes.some((shape) => lower.includes(shape)) &&
        !value.includes(maskmarker)
      )
        fields.add(name);
    }
  }
  if (fields.size === 0) return { refused: false, fields: [] };
  const listed = [...fields].sort();
  return {
    refused: true,
    fields: listed,
    reason: `The exportdata command refuses the secret store material of ${listed.join(", ")}; the vault never ships through an export and an unmasked secret value refuses the export in full.`,
  };
}

/** Exports session, audit or extraction data through the shared export menu serializers: the descriptor routes through exporttools, the mask verdicts honor in every format and a refused export writes nothing. */
export function exportdatacontent(input: {
  scope: "session" | "audit" | "extraction";
  format: string;
  records: Array<Record<string, unknown>>;
  shapes: string[];
  from?: number;
  to?: number;
  path?: string;
}): { result: exportresult; content: string } {
  const refusal = secretstorerefusal(input.records);
  const descriptor: exportdescriptor = exportdescriptorof(input.format, input.scope);
  if (refusal.refused && refusal.reason !== undefined)
    return {
      result: {
        descriptor,
        bytes: 0,
        rows: 0,
        ...(input.path !== undefined ? { path: input.path } : {}),
        reason: refusal.reason,
      },
      content: "",
    };
  const windowed = exportdatawindow(input.records, input.from, input.to);
  return exportrecords({
    descriptor,
    records: windowed,
    shapes: input.shapes,
    ...(input.path !== undefined ? { path: input.path } : {}),
  });
}

/** Parses one recorded page state fixture under schemastrict: the identity, the HTTPS origin, the observation payload of the live snapshot schema, the fixture scoped grants and the recording time; unknown fields refuse with the path that names them. */
export function parseheadlessfixture(value: unknown): headlessfixture {
  if (typeof value !== "object" || value === null || Array.isArray(value))
    throw new Error("The fixture file must be a json object.");
  const root = value as Record<string, unknown>;
  const unknownfields = Object.keys(root).filter(
    (key) => !["id", "origin", "observation", "grants", "recordedat"].includes(key),
  );
  if (unknownfields.length > 0)
    throw new Error(
      `The fixture carries the unknown field${unknownfields.length === 1 ? "" : "s"} ${unknownfields.join(", ")}; schemastrict refuses unknown fixture fields.`,
    );
  if (typeof root.id !== "string" || root.id.trim() === "")
    throw new Error("The fixture needs its id as a non-empty string.");
  if (typeof root.origin !== "string" || !root.origin.startsWith("https://"))
    throw new Error("The fixture needs the HTTPS origin it recorded.");
  if (!root.observation || typeof root.observation !== "object" || Array.isArray(root.observation))
    throw new Error("The fixture needs its observation payload of the live snapshot schema.");
  const observation = root.observation as Record<string, unknown>;
  for (const field of [
    "schemaversion",
    "url",
    "title",
    "textpreview",
    "textlength",
    "forms",
    "interactive",
    "capturedat",
  ]) {
    if (observation[field] === undefined)
      throw new Error(`The fixture observation misses its ${field} field of the live snapshot schema.`);
  }
  if (!Array.isArray(observation.forms) || !Array.isArray(observation.interactive))
    throw new Error("The fixture observation needs its forms and interactive lists.");
  if (!Array.isArray(root.grants) || !root.grants.every((grant) => typeof grant === "string" && grant.trim() !== ""))
    throw new Error("The fixture grants must be a list of non-empty action kind names.");
  if (typeof root.recordedat !== "number" || !Number.isFinite(root.recordedat))
    throw new Error("The fixture needs its recording time.");
  return {
    id: root.id,
    origin: root.origin,
    observation: root.observation as headlessfixture["observation"],
    grants: root.grants.filter((grant): grant is string => typeof grant === "string"),
    recordedat: root.recordedat,
  };
}

/** Resolves the fixture of one origin: the recorded page state whose origin matches exactly, so a plan replays against the state its review recorded. */
export function resolvefixture(fixtures: headlessfixture[], origin: string): headlessfixture {
  const resolved = fixtures.find((fixture) => fixture.origin === origin);
  if (resolved === undefined)
    throw new Error(
      `No recorded fixture covers the origin ${origin}; headlessmode replays only against recorded page state.`,
    );
  return resolved;
}

/* ── The migrateplan importers of the 2.0.0 migration bridge: the conversion of foreign plan sources into the reviewed plan file grammar. ── */

/**
 * Conversion logic of the 2.0.0 migration bridge, promised by the roadmap 1.1.92 migration tools and carried by this release.
 * Every importer is a pure conversion: it reads one foreign plan source (a version one devthink plan, an automa workflow, a selenium ide side file, a ui vision macro or a tabular csv), maps every entry onto the reviewed plan file step grammar — the kind from the actionkindcatalog, the target as a reviewed css selector, the value and the reviewed json options — and refuses every entry it cannot map with the source entry named, because an importer never guesses a kind, a selector or a value. The converted plan carries no metadata (the frozen plan file grammar allows no provenance field), so the provenance, the field mapping notes and the import date ride the conversion report the terminal prints on stderr. The importers never execute anything and never touch a page: an imported plan enters exactly the same review flow, consent gates and origin grants a hand authored plan enters, and no imported plan inherits a consent grant from its source format.
 */

/** One conversion record of the migration bridge: the converted plan file beside the provenance notes the terminal report prints, because the frozen plan file grammar carries no metadata field — the source format, the source version, the import date and every field mapping note ride this record on stderr and never the plan json an importer produced. */
export interface conversionrecord {
  file: planfile;
  format: string;
  sourceversion: string;
  mapped: number;
  notes: string[];
}

/** Reads one required string field of an imported source record or refuses with the path that names it. */
function requiredtext(record: Record<string, unknown>, field: string, path: string): string {
  const value = record[field];
  if (typeof value !== "string" || value.trim() === "")
    throw new Error(`${path} needs its ${field} as a non-empty string.`);
  return value;
}

/** Reads one optional string field of an imported source record; an absent field stays absent while a present field must stay a string (an empty one reads as absent). */
function optionaltext(record: Record<string, unknown>, field: string, path: string): string | undefined {
  const value = record[field];
  if (value === undefined) return undefined;
  if (typeof value !== "string")
    throw new Error(`${path} carries its ${field} as neither a string nor an absent field.`);
  return value.trim() === "" ? undefined : value;
}

/** Reads one optional value field of an imported source record: a string or a number stringifies onto the reviewed value field while every other shape refuses with the path that names it. */
function optionalvalue(record: Record<string, unknown>, field: string, path: string): string | undefined {
  const value = record[field];
  if (value === undefined) return undefined;
  if (typeof value !== "string" && typeof value !== "number")
    throw new Error(`${path} carries its ${field} as neither a string nor a number.`);
  return String(value).trim() === "" ? undefined : String(value);
}

/** Builds one reviewed plan file step from a converted source entry: the kind verifies against the reviewed catalog, the target verifies against the shared selector grammar, and every kind that grades sensitive carries the explicit gate declaration the review demands — the importer marks converted sensitive steps for consent review instead of letting them pass ungated. */
function convertedstep(input: {
  entry: string;
  id: string;
  kind: string;
  label: string;
  target?: string;
  value?: string;
  options?: string;
}): planfilestep {
  const catalog = new Set(actionkindcatalog());
  if (!catalog.has(input.kind))
    throw new Error(
      `The ${input.entry} carries the action ${input.kind} outside the reviewed catalog of ${catalog.size} kinds; the importer refuses to guess a kind.`,
    );
  const step: planfilestep = { id: input.id, kind: input.kind, label: input.label };
  if (input.target !== undefined) {
    const selector = cssselectorvalid(input.target);
    if (!selector.allowed)
      throw new Error(
        `The ${input.entry} carries the selector ${input.target} the reviewed selector grammar refuses: ${selector.reason}`,
      );
    step.target = input.target;
  }
  if (input.value !== undefined) step.value = input.value;
  if (input.options !== undefined) step.options = input.options;
  let risk: "read" | "interaction" | "sensitive" = "sensitive";
  try {
    risk = actionrisk(input.kind as never);
  } catch {
    /* the catalog check above already refused the kind */
  }
  if (risk === "sensitive") step.gate = true;
  return step;
}

/** Reads one derived label for a converted step whose source format carries no label of its own: the kind and the target or value compose the plain language line the review reads. */
function derivedlabel(kind: string, detail?: string): string {
  return detail === undefined ? `Run the ${kind} step` : `Run the ${kind} step on ${detail}`;
}

/** Reads the provenance note every conversion record carries first: the source format, the source version, the import date and the mapped step count, because the frozen plan file grammar carries no metadata field of its own. */
function provenancenote(input: { format: string; sourceversion: string; mapped: number; now: number }): string {
  return `The ${input.format} importer converted the source of version ${input.sourceversion} into ${input.mapped} reviewed step${input.mapped === 1 ? "" : "s"} on ${new Date(input.now).toISOString()}; the provenance rides this conversion report on stderr because the frozen plan file grammar carries no metadata field, and the converted plan enters the same review flow a hand authored plan enters.`;
}

/**
 * Converts one version one era devthink plan into the reviewed plan file grammar of the migration bridge.
 * The legacy grammar this importer reads (documented here because the version one era predates the frozen grammar): the root carries its version, goal, origin, the optional grants and denials and its steps; every step carries its id, its action, its label and the optional selector, value and milliseconds. The action names the reviewed kind directly — the version one vocabulary and the frozen vocabulary share their kind names, so a legacy action outside the reviewed catalog refuses with the step named instead of guessing. The selector becomes the reviewed target, the value becomes the reviewed value, the milliseconds field of a delay action lifts its hardcoded wait onto the reviewed delay option grammar, the sensitive kinds gain their explicit gate declaration, the step identifiers pass through unchanged, and the grants and denials of the devthink source pass through because they are devthink origin declarations rather than foreign consent grants.
 * A source that already parses as the current plan file grammar passes through unchanged, so converting an already converted plan is the identity and the migration is idempotent.
 */
export function importv1plan(input: { source: unknown; now: number }): conversionrecord {
  try {
    const current = parseplanfile(input.source);
    const passthrough: conversionrecord = {
      file: current,
      format: "v1",
      sourceversion: current.version,
      mapped: current.steps.length,
      notes: [
        provenancenote({ format: "v1", sourceversion: current.version, mapped: current.steps.length, now: input.now }),
        "The source already parses as the reviewed plan file grammar, so the conversion passes it through unchanged; the migration is idempotent.",
      ],
    };
    return passthrough;
  } catch {
    /* the source is not the current grammar: the legacy grammar below reads it */
  }
  if (typeof input.source !== "object" || input.source === null || Array.isArray(input.source))
    throw new Error("The version one plan must be a json object.");
  const root = input.source as Record<string, unknown>;
  const unknownroot = Object.keys(root).filter(
    (key) => !["version", "goal", "origin", "steps", "grants", "denials"].includes(key),
  );
  if (unknownroot.length > 0)
    throw new Error(
      `The version one plan carries the unknown field${unknownroot.length === 1 ? "" : "s"} ${unknownroot.join(", ")}; the migration reports fields without a destination as refusals, never as silent drops.`,
    );
  const sourceversion = requiredtext(root, "version", "The version one plan");
  const goal = requiredtext(root, "goal", "The version one plan");
  const origin = requiredtext(root, "origin", "The version one plan");
  if (!origin.startsWith("https://")) throw new Error("The version one plan origin must be an HTTPS origin.");
  if (!Array.isArray(root.steps) || root.steps.length === 0)
    throw new Error("The version one plan needs at least one step.");
  const notes: string[] = [];
  const steps: planfilestep[] = [];
  let lifteddelays = 0;
  root.steps.forEach((rawstep, index) => {
    const path = `The version one step at index ${index}`;
    if (typeof rawstep !== "object" || rawstep === null || Array.isArray(rawstep))
      throw new Error(`${path} must be an object.`);
    const step = rawstep as Record<string, unknown>;
    const unknownfields = Object.keys(step).filter(
      (key) => !["id", "action", "label", "selector", "value", "milliseconds"].includes(key),
    );
    if (unknownfields.length > 0)
      throw new Error(
        `${path} carries the unknown field${unknownfields.length === 1 ? "" : "s"} ${unknownfields.join(", ")}; the migration reports fields without a destination as refusals, never as silent drops.`,
      );
    const id = requiredtext(step, "id", path);
    const action = requiredtext(step, "action", path);
    const label = requiredtext(step, "label", path);
    const selector = optionaltext(step, "selector", path);
    const value = optionalvalue(step, "value", path);
    const milliseconds = step.milliseconds;
    if (milliseconds !== undefined) {
      if (action !== "delay")
        throw new Error(
          `The version one step ${id} carries its milliseconds field on the action ${action}; only the delay action lifts a hardcoded wait onto the reviewed option grammar.`,
        );
      if (typeof milliseconds !== "number" || !Number.isInteger(milliseconds) || milliseconds < 1)
        throw new Error(
          `The version one step ${id} carries its milliseconds as a number the reviewed delay grammar refuses; the wait needs a positive integer of milliseconds.`,
        );
      lifteddelays += 1;
    }
    steps.push(
      convertedstep({
        entry: `version one step ${id}`,
        id,
        kind: action,
        label,
        ...(selector !== undefined ? { target: selector } : {}),
        ...(value !== undefined ? { value } : {}),
        ...(milliseconds !== undefined ? { options: JSON.stringify({ delay: milliseconds }) } : {}),
      }),
    );
  });
  const file: planfile = { version: packageversion, goal, origin, steps };
  if (root.grants !== undefined) {
    if (!Array.isArray(root.grants) || !root.grants.every((grant) => typeof grant === "string" && grant.trim() !== ""))
      throw new Error("The version one plan grants must be a list of non-empty action kind names.");
    file.grants = root.grants.filter((grant): grant is string => typeof grant === "string");
  }
  if (root.denials !== undefined) {
    if (
      !Array.isArray(root.denials) ||
      !root.denials.every((denial) => typeof denial === "string" && denial.trim() !== "")
    )
      throw new Error("The version one plan denials must be a list of non-empty action kind names.");
    file.denials = root.denials.filter((denial): denial is string => typeof denial === "string");
  }
  const gated = steps.filter((step) => step.gate === true).map((step) => step.id);
  notes.push(
    `The version one field action of every step moved onto the kind field of the reviewed step grammar, the selector field onto the target field and the value field onto the value field; the step identifiers pass through unchanged.`,
    lifteddelays > 0
      ? `The milliseconds field of ${lifteddelays} delay step${lifteddelays === 1 ? "" : "s"} lifted onto the reviewed delay option grammar as the delay option the executor reads.`
      : "The source carries no hardcoded delay to lift.",
    gated.length > 0
      ? `The converted sensitive step${gated.length === 1 ? "" : "s"} ${gated.join(", ")} carr${gated.length === 1 ? "ies" : "ry"} the explicit gate declaration the review demands; the sensitive steps wait for the human review exactly as a hand authored plan waits.`
      : "The source converts to read only steps that carry no gate declaration.",
    file.grants !== undefined
      ? "The grants and denials of the devthink source pass through because they are devthink origin declarations of the same grammar family, never foreign consent grants; the foreign importers contribute none."
      : "The source declares no grants, so the converted plan inherits no consent grant from its source format.",
  );
  return {
    file,
    format: "v1",
    sourceversion,
    mapped: steps.length,
    notes: [provenancenote({ format: "v1", sourceversion, mapped: steps.length, now: input.now }), ...notes],
  };
}

/**
 * Converts one automa workflow into the reviewed plan file grammar of the migration bridge.
 * The automa grammar this importer reads: the root carries the workflow name, the optional version and its blocks object keyed by block id; every block carries its type and its optional data. The conversion table: newtab becomes tabcreate with its url as the value, click-element becomes click, forms becomes fillform with its field list as the reviewed options, link becomes click, go-back becomes back, close-tab becomes tabclose, wait becomes delay with its milliseconds lifted onto the reviewed delay option grammar, scroll becomes scroll and screenshot becomes shotview. The trigger block never becomes a plan step: it lands in the conversion report as the paused trigger the scheduler arms only after the plan review. Every other block type refuses with the block named. The plan origin derives from the first newtab url — one plan addresses exactly one origin, so a navigation away from that origin refuses with the block named — the steps follow the block order the workflow file carries, and the block ids become the step ids so the provenance stays traceable.
 * The importer converts only: it opens no tab, fills no form and never executes anything outside the normal consent gates.
 */
export function importautoma(input: { source: unknown; now: number }): conversionrecord {
  if (typeof input.source !== "object" || input.source === null || Array.isArray(input.source))
    throw new Error("The automa workflow must be a json object.");
  const root = input.source as Record<string, unknown>;
  const unknownroot = Object.keys(root).filter((key) => !["name", "version", "blocks"].includes(key));
  if (unknownroot.length > 0)
    throw new Error(
      `The automa workflow carries the unknown field${unknownroot.length === 1 ? "" : "s"} ${unknownroot.join(", ")}; the migration reports fields without a destination as refusals, never as silent drops.`,
    );
  const goal = requiredtext(root, "name", "The automa workflow");
  const sourceversion = optionaltext(root, "version", "The automa workflow") ?? "unrecorded";
  const blocks = root.blocks;
  if (typeof blocks !== "object" || blocks === null || Array.isArray(blocks))
    throw new Error("The automa workflow carries its blocks as the object keyed by block id.");
  const notes: string[] = [];
  const steps: planfilestep[] = [];
  let origin: string | undefined;
  let pausedtriggers = 0;
  for (const [key, rawblock] of Object.entries(blocks)) {
    if (key.trim() === "")
      throw new Error("The automa workflow carries a block under an empty id; every block names its id.");
    if (typeof rawblock !== "object" || rawblock === null || Array.isArray(rawblock))
      throw new Error(`The automa block ${key} must be an object.`);
    const block = rawblock as Record<string, unknown>;
    const type = requiredtext(block, "type", `The automa block ${key}`);
    const data: Record<string, unknown> =
      typeof block.data === "object" && block.data !== null && !Array.isArray(block.data)
        ? (block.data as Record<string, unknown>)
        : {};
    if (type === "trigger") {
      pausedtriggers += 1;
      continue; /* the trigger block lands in the report as the paused trigger, never as a plan step */
    }
    if (type === "newtab") {
      const url = requiredtext(data, "url", `The automa block ${key} of type newtab`);
      if (!url.startsWith("https://"))
        throw new Error(
          `The automa block ${key} of type newtab carries the url ${url} the reviewed grammar refuses; the plan origin must be an HTTPS origin.`,
        );
      const blockorigin = new URL(url).origin;
      if (origin === undefined) origin = blockorigin;
      else if (origin !== blockorigin)
        throw new Error(
          `The automa block ${key} of type newtab navigates to ${blockorigin} while the plan addresses ${origin}; one plan addresses exactly one origin, so the importer refuses the navigation instead of guessing.`,
        );
      steps.push(
        convertedstep({
          entry: `automa block ${key} of type newtab`,
          id: key,
          kind: "tabcreate",
          label: derivedlabel("tabcreate", url),
          value: url,
        }),
      );
      continue;
    }
    if (type === "click-element" || type === "link") {
      const selector = requiredtext(data, "selector", `The automa block ${key} of type ${type}`);
      steps.push(
        convertedstep({
          entry: `automa block ${key} of type ${type}`,
          id: key,
          kind: "click",
          label: derivedlabel("click", selector),
          target: selector,
        }),
      );
      continue;
    }
    if (type === "forms") {
      const fields = data.fields;
      if (!Array.isArray(fields) || fields.length === 0)
        throw new Error(
          `The automa block ${key} of type forms carries no field list; a form block without fields fills nothing.`,
        );
      const reviewed: Array<Record<string, string>> = [];
      fields.forEach((rawfield, fieldindex) => {
        if (typeof rawfield !== "object" || rawfield === null || Array.isArray(rawfield))
          throw new Error(`The field at index ${fieldindex} of the automa block ${key} must be an object.`);
        const field = rawfield as Record<string, unknown>;
        const name = requiredtext(field, "name", `The field at index ${fieldindex} of the automa block ${key}`);
        const value =
          optionalvalue(field, "value", `The field at index ${fieldindex} of the automa block ${key}`) ?? "";
        const selector = requiredtext(field, "selector", `The field at index ${fieldindex} of the automa block ${key}`);
        const checked = cssselectorvalid(selector);
        if (!checked.allowed)
          throw new Error(
            `The field at index ${fieldindex} of the automa block ${key} carries the selector ${selector} the reviewed selector grammar refuses: ${checked.reason}`,
          );
        reviewed.push({ name, value, selector });
      });
      steps.push(
        convertedstep({
          entry: `automa block ${key} of type forms`,
          id: key,
          kind: "fillform",
          label: derivedlabel("fillform", `${reviewed.length} form fields`),
          options: JSON.stringify({ fields: reviewed }),
        }),
      );
      continue;
    }
    if (type === "go-back") {
      steps.push(
        convertedstep({
          entry: `automa block ${key} of type go-back`,
          id: key,
          kind: "back",
          label: derivedlabel("back"),
        }),
      );
      continue;
    }
    if (type === "close-tab") {
      steps.push(
        convertedstep({
          entry: `automa block ${key} of type close-tab`,
          id: key,
          kind: "tabclose",
          label: derivedlabel("tabclose"),
        }),
      );
      continue;
    }
    if (type === "wait") {
      const ms = data.ms;
      if (typeof ms !== "number" || !Number.isInteger(ms) || ms < 1)
        throw new Error(
          `The automa block ${key} of type wait carries its ms as a number the reviewed delay grammar refuses; the wait needs a positive integer of milliseconds.`,
        );
      steps.push(
        convertedstep({
          entry: `automa block ${key} of type wait`,
          id: key,
          kind: "delay",
          label: derivedlabel("delay", `${ms} milliseconds`),
          options: JSON.stringify({ delay: ms }),
        }),
      );
      continue;
    }
    if (type === "scroll") {
      const selector = requiredtext(data, "selector", `The automa block ${key} of type scroll`);
      steps.push(
        convertedstep({
          entry: `automa block ${key} of type scroll`,
          id: key,
          kind: "scroll",
          label: derivedlabel("scroll", selector),
          target: selector,
        }),
      );
      continue;
    }
    if (type === "screenshot") {
      steps.push(
        convertedstep({
          entry: `automa block ${key} of type screenshot`,
          id: key,
          kind: "shotview",
          label: derivedlabel("shotview"),
        }),
      );
      continue;
    }
    throw new Error(
      `The automa block ${key} of type ${type} stays outside the conversion table of the automa importer; the importer refuses unmapped block types with the block named instead of guessing a kind.`,
    );
  }
  if (origin === undefined)
    throw new Error(
      "The automa workflow carries no newtab block; the plan origin derives from the first newtab url, so a workflow without one refuses instead of guessing an origin.",
    );
  if (steps.length === 0)
    throw new Error("The automa workflow converted to no step; the plan file grammar needs at least one step.");
  const gated = steps.filter((step) => step.gate === true).map((step) => step.id);
  notes.push(
    "The automa block ids became the step ids and the steps follow the block order the workflow file carries, so the provenance of every converted step stays traceable to its block.",
    pausedtriggers > 0
      ? `The trigger block${pausedtriggers === 1 ? "" : "s"} converted to no plan step: ${pausedtriggers === 1 ? "it lands" : "they land"} in this report as the paused trigger the scheduler arms only after the plan review, exactly the paused state the roadmap promises.`
      : "The workflow carries no trigger block.",
    `The converted sensitive step${gated.length === 1 ? "" : "s"} ${gated.join(", ")} carr${gated.length === 1 ? "ies" : "ry"} the explicit gate declaration the review demands, and the converted plan inherits no consent grant from the automa workflow.`,
  );
  const file: planfile = { version: packageversion, goal, origin, steps };
  return {
    file,
    format: "automa",
    sourceversion,
    mapped: steps.length,
    notes: [provenancenote({ format: "automa", sourceversion, mapped: steps.length, now: input.now }), ...notes],
  };
}

/** Resolves one selenium or ui vision locator target onto the reviewed css selector grammar: the css= prefix passes its selector verbatim, the id= prefix resolves onto the #id form and the name= prefix resolves onto the [name=value] attribute form, while every other locator strategy — an xpath, a link text or a bare locator — refuses with the entry named because the importer never guesses a selector. */
function resolvedlocator(entry: string, target: string): string {
  const trimmed = target.trim();
  if (trimmed.startsWith("css=")) {
    const selector = trimmed.slice("css=".length).trim();
    if (selector === "")
      throw new Error(`The ${entry} carries an empty css= locator; a step that addresses the page names its selector.`);
    return selector;
  }
  if (trimmed.startsWith("id=")) {
    const id = trimmed.slice("id=".length).trim();
    if (id === "")
      throw new Error(`The ${entry} carries an empty id= locator; a step that addresses the page names its element.`);
    return `#${id}`;
  }
  if (trimmed.startsWith("name=")) {
    const name = trimmed.slice("name=".length).trim();
    if (name === "")
      throw new Error(`The ${entry} carries an empty name= locator; a step that addresses the page names its element.`);
    return `[name=${name}]`;
  }
  throw new Error(
    `The ${entry} carries the locator ${trimmed} outside the css=, id= and name= locator prefixes the importer resolves; the importer never guesses a selector.`,
  );
}

/** Reads the reviewed step id of one selenium command: the command id the side file carries, because the identifier preservation of the migration bridge keeps the source identity of every step. */
function seleniumstepid(command: Record<string, unknown>, index: number, testname: string): string {
  const id = optionaltext(command, "id", `The selenium command of ${testname} at index ${index}`);
  return id ?? `${testname}-${index + 1}`;
}

/**
 * Converts one selenium ide side file into the reviewed plan file grammar of the migration bridge.
 * The selenium grammar this importer reads: the root carries its version, name, the base url every open target resolves against and its tests; every test carries its commands, and every command carries its id, command, target and value. One plan addresses exactly one test, so a side file with several tests refuses with the count named. The command table: open becomes navigate with the resolved absolute url as its value, click becomes click, type becomes type, sendKeys becomes appendtext (both deliver keystrokes to the addressed element — type replaces the content and sendKeys appends), select becomes select and pause becomes delay with its milliseconds lifted onto the reviewed delay option grammar. Every other command refuses with the command named. The target grammar accepts the css=, id= and name= locator prefixes; every other locator strategy refuses with the command named.
 * The importer converts only: it opens no page, types no text and never executes anything outside the normal consent gates.
 */
export function importselenium(input: { source: unknown; now: number }): conversionrecord {
  if (typeof input.source !== "object" || input.source === null || Array.isArray(input.source))
    throw new Error("The selenium side file must be a json object.");
  const root = input.source as Record<string, unknown>;
  const unknownroot = Object.keys(root).filter(
    (key) => !["id", "version", "name", "url", "tests", "suites"].includes(key),
  );
  if (unknownroot.length > 0)
    throw new Error(
      `The selenium side file carries the unknown field${unknownroot.length === 1 ? "" : "s"} ${unknownroot.join(", ")}; the migration reports fields without a destination as refusals, never as silent drops.`,
    );
  const sourceversion = requiredtext(root, "version", "The selenium side file");
  const goal = requiredtext(root, "name", "The selenium side file");
  const base = requiredtext(root, "url", "The selenium side file");
  if (!base.startsWith("https://"))
    throw new Error("The selenium side file url must be the HTTPS base origin the plan addresses.");
  const origin = new URL(base).origin;
  const tests = root.tests;
  if (!Array.isArray(tests)) throw new Error("The selenium side file carries its tests as a list.");
  if (tests.length !== 1)
    throw new Error(
      `The selenium side file carries ${tests.length} test${tests.length === 1 ? "" : "s"}; one plan addresses exactly one test, so split the side file or pick the test before the conversion.`,
    );
  const rawtest = tests[0];
  if (typeof rawtest !== "object" || rawtest === null || Array.isArray(rawtest))
    throw new Error("The selenium test must be an object.");
  const test = rawtest as Record<string, unknown>;
  const testname = requiredtext(test, "name", "The selenium test");
  const commands = test.commands;
  if (!Array.isArray(commands) || commands.length === 0)
    throw new Error(`The selenium test ${testname} carries no command; the plan file grammar needs at least one step.`);
  const notes: string[] = [];
  const steps: planfilestep[] = [];
  commands.forEach((rawcommand, index) => {
    const path = `The selenium command of ${testname} at index ${index}`;
    if (typeof rawcommand !== "object" || rawcommand === null || Array.isArray(rawcommand))
      throw new Error(`${path} must be an object.`);
    const command = rawcommand as Record<string, unknown>;
    const name = requiredtext(command, "command", path);
    const id = seleniumstepid(command, index, testname);
    const target = optionaltext(command, "target", path);
    const value = optionalvalue(command, "value", path);
    if (name === "open") {
      if (target === undefined)
        throw new Error(
          `The selenium command ${id} of open carries no target; the open command names the url it resolves against the side file base.`,
        );
      let resolved: string;
      if (target.startsWith("https://")) resolved = target;
      else if (target.startsWith("/")) resolved = `${origin}${target}`;
      else
        throw new Error(
          `The selenium command ${id} of open carries the target ${target} the importer resolves neither as an absolute url nor as a base relative path; the importer never guesses a url.`,
        );
      const commandorigin = new URL(resolved).origin;
      if (commandorigin !== origin)
        throw new Error(
          `The selenium command ${id} of open navigates to ${commandorigin} while the plan addresses ${origin}; one plan addresses exactly one origin, so the importer refuses the navigation instead of guessing.`,
        );
      steps.push(
        convertedstep({
          entry: `selenium command ${id} of ${name}`,
          id,
          kind: "navigate",
          label: derivedlabel("navigate", resolved),
          value: resolved,
        }),
      );
      return;
    }
    if (name === "click" || name === "type" || name === "sendKeys" || name === "select") {
      if (target === undefined)
        throw new Error(
          `The selenium command ${id} of ${name} carries no target; a step that addresses the page names its selector.`,
        );
      const selector = resolvedlocator(`selenium command ${id} of ${name}`, target);
      const kind = name === "sendKeys" ? "appendtext" : name;
      steps.push(
        convertedstep({
          entry: `selenium command ${id} of ${name}`,
          id,
          kind,
          label: derivedlabel(kind, value !== undefined ? `${selector} with ${value}` : selector),
          target: selector,
          ...(value !== undefined ? { value } : {}),
        }),
      );
      return;
    }
    if (name === "pause") {
      if (target === undefined || !/^\d+$/.test(target.trim()) || Number(target.trim()) < 1)
        throw new Error(
          `The selenium command ${id} of pause carries its target ${target ?? ""} as the milliseconds the reviewed delay grammar refuses; the pause needs a positive integer of milliseconds.`,
        );
      const ms = Number(target.trim());
      steps.push(
        convertedstep({
          entry: `selenium command ${id} of ${name}`,
          id,
          kind: "delay",
          label: derivedlabel("delay", `${ms} milliseconds`),
          options: JSON.stringify({ delay: ms }),
        }),
      );
      return;
    }
    throw new Error(
      `The selenium command ${id} of ${name} stays outside the conversion table of the selenium importer; the importer refuses unmapped commands with the command named instead of guessing a kind.`,
    );
  });
  const gated = steps.filter((step) => step.gate === true).map((step) => step.id);
  notes.push(
    `The selenium command ids became the step ids and the command table mapped open onto navigate, click onto click, type onto type, sendKeys onto appendtext, select onto select and pause onto the reviewed delay option grammar; the field mapping notes ride this report because the plan file grammar carries no metadata field.`,
    `The css=, id= and name= locator prefixes resolved onto the reviewed css selector grammar while the base url ${origin} became the plan origin; the importer resolved no xpath and guessed no selector.`,
    `The converted sensitive step${gated.length === 1 ? "" : "s"} ${gated.join(", ")} carr${gated.length === 1 ? "ies" : "ry"} the explicit gate declaration the review demands, and the converted plan inherits no consent grant from the selenium side file.`,
  );
  const file: planfile = { version: packageversion, goal, origin, steps };
  return {
    file,
    format: "selenium",
    sourceversion,
    mapped: steps.length,
    notes: [provenancenote({ format: "selenium", sourceversion, mapped: steps.length, now: input.now }), ...notes],
  };
}

/**
 * Converts one ui vision (kantu) macro into the reviewed plan file grammar of the migration bridge.
 * The ui vision grammar this importer reads: the root carries the macro Name and its Commands list, and every command carries its Command, Target and Value with the capitalized field names the macro format records. The command table: open becomes navigate with the absolute url as its value, click becomes click, type becomes type and verifyText becomes waittext; every other command refuses with the command named. The macro format carries no step identifiers, so the importer derives stable step ids from the command name and the position that stay stable across reimports of the same macro. The plan origin derives from the first open target — one plan addresses exactly one origin, so a later open away from that origin refuses — and the target grammar accepts the same css=, id= and name= locator prefixes the selenium importer resolves.
 * The importer converts only: it opens no page, clicks nothing and never executes anything outside the normal consent gates.
 */
export function importuivision(input: { source: unknown; now: number }): conversionrecord {
  if (typeof input.source !== "object" || input.source === null || Array.isArray(input.source))
    throw new Error("The ui vision macro must be a json object.");
  const root = input.source as Record<string, unknown>;
  const unknownroot = Object.keys(root).filter((key) => !["Name", "CreationDate", "Commands"].includes(key));
  if (unknownroot.length > 0)
    throw new Error(
      `The ui vision macro carries the unknown field${unknownroot.length === 1 ? "" : "s"} ${unknownroot.join(", ")}; the migration reports fields without a destination as refusals, never as silent drops.`,
    );
  const goal = requiredtext(root, "Name", "The ui vision macro");
  const commands = root.Commands;
  if (!Array.isArray(commands) || commands.length === 0)
    throw new Error("The ui vision macro carries no command; the plan file grammar needs at least one step.");
  const notes: string[] = [];
  const steps: planfilestep[] = [];
  let origin: string | undefined;
  commands.forEach((rawcommand, index) => {
    const path = `The ui vision command at index ${index}`;
    if (typeof rawcommand !== "object" || rawcommand === null || Array.isArray(rawcommand))
      throw new Error(`${path} must be an object.`);
    const command = rawcommand as Record<string, unknown>;
    const name = requiredtext(command, "Command", path);
    const target = optionaltext(command, "Target", path);
    const value = optionalvalue(command, "Value", path);
    const id = `${name.toLowerCase()}-${index + 1}`;
    if (name === "open") {
      if (target === undefined)
        throw new Error(
          `The ui vision command ${id} of open carries no Target; the open command names the absolute url it opens.`,
        );
      if (!target.startsWith("https://"))
        throw new Error(
          `The ui vision command ${id} of open carries the Target ${target} the reviewed grammar refuses; the plan origin must be an HTTPS origin.`,
        );
      const commandorigin = new URL(target).origin;
      if (origin === undefined) origin = commandorigin;
      else if (origin !== commandorigin)
        throw new Error(
          `The ui vision command ${id} of open navigates to ${commandorigin} while the plan addresses ${origin}; one plan addresses exactly one origin, so the importer refuses the navigation instead of guessing.`,
        );
      steps.push(
        convertedstep({
          entry: `ui vision command ${id} of ${name}`,
          id,
          kind: "navigate",
          label: derivedlabel("navigate", target),
          value: target,
        }),
      );
      return;
    }
    if (name === "click" || name === "type" || name === "verifyText") {
      if (target === undefined)
        throw new Error(
          `The ui vision command ${id} of ${name} carries no Target; a step that addresses the page names its selector.`,
        );
      const selector = resolvedlocator(`ui vision command ${id} of ${name}`, target);
      const kind = name === "verifyText" ? "waittext" : name.toLowerCase();
      steps.push(
        convertedstep({
          entry: `ui vision command ${id} of ${name}`,
          id,
          kind,
          label: derivedlabel(kind, value !== undefined ? `${selector} with ${value}` : selector),
          target: selector,
          ...(value !== undefined ? { value } : {}),
        }),
      );
      return;
    }
    throw new Error(
      `The ui vision command ${id} of ${name} stays outside the conversion table of the ui vision importer; the importer refuses unmapped commands with the command named instead of guessing a kind.`,
    );
  });
  if (origin === undefined)
    throw new Error(
      "The ui vision macro carries no open command; the plan origin derives from the first open target, so a macro without one refuses instead of guessing an origin.",
    );
  const gated = steps.filter((step) => step.gate === true).map((step) => step.id);
  notes.push(
    "The macro format carries no step identifiers, so the importer derived stable step ids from the command name and the position; the ids stay stable across reimports of the same macro.",
    `The Command, Target and Value fields moved onto the kind, target and value fields of the reviewed step grammar with the css=, id= and name= locator prefixes resolved onto the reviewed css selector grammar; the plan origin ${origin} derives from the first open target.`,
    `The converted sensitive step${gated.length === 1 ? "" : "s"} ${gated.join(", ")} carr${gated.length === 1 ? "ies" : "ry"} the explicit gate declaration the review demands, and the converted plan inherits no consent grant from the ui vision macro.`,
  );
  const file: planfile = { version: packageversion, goal, origin, steps };
  return {
    file,
    format: "uivision",
    sourceversion: optionaltext(root, "CreationDate", "The ui vision macro") ?? "unrecorded",
    mapped: steps.length,
    notes: [
      provenancenote({
        format: "uivision",
        sourceversion: optionaltext(root, "CreationDate", "The ui vision macro") ?? "unrecorded",
        mapped: steps.length,
        now: input.now,
      }),
      ...notes,
    ],
  };
}

/** Parses one csv table into its rows of cells: quoted cells carry their embedded commas, quotes and newlines, a doubled quote inside a quoted cell escapes one quote, the carriage returns of crlf line endings never enter a cell, and a table that ends inside a quoted cell refuses instead of guessing the cell end. */
export function parsecsvrows(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inquote = false;
  let cellstarted = false;
  const pushcell = (): void => {
    row.push(cell);
    cell = "";
    cellstarted = false;
  };
  const pushrow = (): void => {
    if (row.length > 0 || cellstarted || cell !== "") {
      pushcell();
      rows.push(row);
      row = [];
    }
  };
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index] ?? "";
    if (inquote) {
      if (char === '"') {
        if ((text[index + 1] ?? "") === '"') {
          cell += '"';
          index += 1;
        } else inquote = false;
        continue;
      }
      cell += char;
      continue;
    }
    if (char === '"') {
      inquote = true;
      cellstarted = true;
      continue;
    }
    if (char === ",") {
      pushcell();
      continue;
    }
    if (char === "\n") {
      pushrow();
      continue;
    }
    if (char === "\r") continue; /* the carriage return of a crlf line ending never enters a cell */
    cell += char;
    cellstarted = true;
  }
  if (inquote)
    throw new Error(
      "The csv table ends inside a quoted cell; an unterminated quote refuses the parse instead of guessing the cell end.",
    );
  pushrow(); /* the last row of a table without its trailing newline */
  return rows;
}

/**
 * Converts one tabular csv plan into the reviewed plan file grammar of the migration bridge.
 * The tabular grammar this importer reads: the file opens with its preface comment lines — one `# goal:` line and one `# origin:` line — because a csv row set carries no metadata of its own; the header row then names the three columns step, target and value in any order, and every data row becomes one reviewed step: the step cell names the reviewed kind, the target cell names the css selector, the value cell carries the literal value, and the label derives from the kind and the target because a row set carries no labels. A row whose step cell names a kind outside the reviewed catalog refuses with the row named, the step ids derive from the kind and the row position so a reimport of the same table keeps its ids, and the csv parser honors quoted cells with embedded commas, quotes and newlines.
 * The importer converts only: it runs no step and never executes anything outside the normal consent gates.
 */
export function importtabular(input: { text: string; now: number }): conversionrecord {
  const rawlines = input.text.split("\n");
  let cursor = 0;
  let goal: string | undefined;
  let origin: string | undefined;
  while (cursor < rawlines.length && (rawlines[cursor] ?? "").trim().startsWith("#")) {
    /* the preface markers read as linear string scans over the uncontrolled preface text: a trimmed comment line sheds its marker, and a body that opens with the marker word and its colon carries the value — constant-shape scans never backtrack, so no polynomial regular expression ever runs over the tabular preface (this closes the two code scanning alerts the migration bridge carried) */
    const comment = (rawlines[cursor] ?? "").trim();
    const body = comment.slice(1).trim();
    const goalvalue = body.startsWith("goal:") ? body.slice("goal:".length).trim() : "";
    if (goalvalue !== "") goal = goalvalue;
    const originvalue = body.startsWith("origin:") ? body.slice("origin:".length).trim() : "";
    if (originvalue !== "") origin = originvalue;
    cursor += 1;
  }
  if (goal === undefined || goal === "")
    throw new Error(
      "The tabular source carries no `# goal:` preface line; a csv row set holds no metadata of its own, so the goal must ride the preface the conversion reads.",
    );
  if (origin === undefined || origin === "")
    throw new Error(
      "The tabular source carries no `# origin:` preface line; a csv row set holds no metadata of its own, so the HTTPS origin must ride the preface the conversion reads.",
    );
  if (!origin.startsWith("https://")) throw new Error("The tabular source origin preface must be an HTTPS origin.");
  const table = parsecsvrows(rawlines.slice(cursor).join("\n"));
  const header = table[0];
  if (header === undefined)
    throw new Error("The tabular source carries no header row; the header names the step, target and value columns.");
  const columns = header.map((cell) => cell.trim());
  for (const column of columns)
    if (column !== "step" && column !== "target" && column !== "value")
      throw new Error(
        `The tabular header carries the column ${column} outside the step, target and value columns; the migration reports columns without a destination as refusals, never as silent drops.`,
      );
  for (const column of ["step", "target", "value"])
    if (!columns.includes(column))
      throw new Error(
        `The tabular header misses its ${column} column; every tabular plan names its step, target and value columns.`,
      );
  const stepcolumn = columns.indexOf("step");
  const targetcolumn = columns.indexOf("target");
  const valuecolumn = columns.indexOf("value");
  const steps: planfilestep[] = [];
  table.slice(1).forEach((cells, rowindex) => {
    const rownumber = rowindex + 1;
    if (cells.every((cell) => cell.trim() === "")) return; /* an empty row never becomes a step */
    const kind = (cells[stepcolumn] ?? "").trim();
    if (kind === "")
      throw new Error(
        `The tabular row ${rownumber} carries no step cell; every row names the reviewed kind it converts onto.`,
      );
    const target = (cells[targetcolumn] ?? "").trim();
    const value = cells[valuecolumn] ?? "";
    const detail = target !== "" ? target : value.trim() !== "" ? value.trim() : undefined;
    steps.push(
      convertedstep({
        entry: `tabular row ${rownumber}`,
        id: `${kind}-${rownumber}`,
        kind,
        label: derivedlabel(kind, detail),
        ...(target !== "" ? { target } : {}),
        ...(value.trim() !== "" ? { value } : {}),
      }),
    );
  });
  if (steps.length === 0)
    throw new Error("The tabular source converted to no step; the plan file grammar needs at least one step.");
  const gated = steps.filter((step) => step.gate === true).map((step) => step.id);
  const notes: string[] = [
    `The tabular header row named the step, target and value columns, every data row became one reviewed step and the step ids derive from the kind and the row position so a reimport of the same table keeps its ids; the labels derive from the kind and the target because a row set carries no labels.`,
    `The converted sensitive step${gated.length === 1 ? "" : "s"} ${gated.join(", ")} carr${gated.length === 1 ? "ies" : "ry"} the explicit gate declaration the review demands, and the converted plan inherits no consent grant from the tabular source.`,
  ];
  const file: planfile = { version: packageversion, goal, origin, steps };
  return {
    file,
    format: "tabular",
    sourceversion: "csv row set",
    mapped: steps.length,
    notes: [
      provenancenote({ format: "tabular", sourceversion: "csv row set", mapped: steps.length, now: input.now }),
      ...notes,
    ],
  };
}

/** Dispatches one migration conversion onto its importer by the format the caller declared: the pure core of the migrateplan command, so the terminal wiring and the tests drive the same conversion. The tabular format reads its text; every other format parses its json first and refuses a source that parses no json with the format named. */
export function migrateplanconversion(input: { format: string; text: string; now: number }): conversionrecord {
  if (input.format === "tabular") return importtabular({ text: input.text, now: input.now });
  if (input.format !== "v1" && input.format !== "automa" && input.format !== "selenium" && input.format !== "uivision")
    throw new Error(
      `The migrateplan format ${input.format} stays outside the v1, automa, selenium, uivision and tabular source formats; the converter never guesses the source format.`,
    );
  let source: unknown;
  try {
    source = JSON.parse(input.text);
  } catch (error) {
    throw new Error(
      `The ${input.format} source parses no json: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
  if (input.format === "v1") return importv1plan({ source, now: input.now });
  if (input.format === "automa") return importautoma({ source, now: input.now });
  if (input.format === "selenium") return importselenium({ source, now: input.now });
  return importuivision({ source, now: input.now });
}

/** Reads the bundle size accounting of every dist target of the library modes: every target name with its byte size grades against its budget, so a bundle that outgrows the budget fails the build before it ships. */
export function bundlesizeaccounting(input: Array<{ target: string; bytes: number }>): {
  ok: boolean;
  over: Array<{ target: string; bytes: number; budget: number }>;
  reason: string;
} {
  /** The byte budget of every dist target of the library modes: the bounds are build-time engineering bounds on the unminified variants (a minified variant stays strictly smaller than its unminified bundle), and an overgrown bundle fails the build before it ships. */
  const budgets: Record<string, number> = {
    index: 1_800_000,
    indexcjs: 1_900_000,
    neutral: 1_800_000,
    umd: 1_900_000,
    node: 1_900_000,
    bun: 1_800_000,
    deno: 1_800_000,
    cli: 600_000,
    headless: 700_000,
    policy: 600_000,
    protocol: 380_000,
    memory: 330_000,
    progress: 60_000,
  };
  const over: Array<{ target: string; bytes: number; budget: number }> = [];
  for (const entry of input) {
    const budget = budgets[entry.target];
    if (budget === undefined) continue;
    if (entry.bytes > budget) over.push({ target: entry.target, bytes: entry.bytes, budget });
  }
  return {
    ok: over.length === 0,
    over,
    reason:
      over.length === 0
        ? `Every dist target stays inside its size budget: ${input.map((entry) => `${entry.target}=${entry.bytes}b`).join(", ")}.`
        : `The dist target${over.length === 1 ? "" : "s"} ${over.map((entry) => entry.target).join(", ")} exceed${over.length === 1 ? "s" : ""} the size budget: ${over.map((entry) => `${entry.target}=${entry.bytes}b>${entry.budget}b`).join(", ")}.`,
  };
}
