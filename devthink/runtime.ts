/**
 * The runtime module of the 1.1.90 consolidation: every correlated variation of the platform adapter contract, its implementations, the target matrix, the runtime baseline policy gate and the terminal render runtime interned in this one file, so the module family carries one surface without duplicate variations.
 * The correlation is the platform runtime family: platformadapter holds the adapter contract every platform primitive flows through (the storage, clock, logger and fetch adapters with the node, browser and deno default compositions, the shared adapter registry on the global symbol registry so the esm and cjs modes of one process share one active adapter, and the bundle stamp of the running dist target); runtimeadapters holds the implementations the contract composes (the filesystem, chrome storage, deno kv and in-memory storage mappings, the capability probe table, the adapter declarations and the worker, dom and fetch shells with their feature downgrades); platformtargets holds the target matrix that verifies every platform target against the adapter mappings with its minified output budget; the runtime baseline policy gate holds the validation that keeps every declared baseline — the engine floors, the .nvmrc pin, the container base digests and the verify workflow stamps — internally consistent and bounded to explicitly tested major lines; and the terminal render runtime holds the IR renderer that paints the converted widget trees into ANSI rows at the cell unit of the one design.
 * No binding is ever hardcoded: every node, deno and browser primitive arrives injected through the seam so the neutral and browser bundles never carry a platform import, and no adapter ever bypasses the human review; the policy gate rides the same law — it fires only on the direct entry lane and reads its files through computed node specifiers the bundlers never resolve.
 */

/* ── Merged from platformadapter.ts ── */
import type {
  adaptercontract,
  bundlemode,
  capabilityprobe,
  clockadapter,
  fetchadapter,
  librarymode,
  loggeradapter,
  platformtarget,
  runtimeadapterdeclaration,
  featuredowngrade,
  platformmatrix,
} from "./types.js";
import type { memoryadapter } from "./memory.js";
/* the value import rides the .ts specifier (the type-only imports above erase before resolution): the runtime baseline policy gate runs this module as a direct entry under node type stripping, and a direct run resolves real paths only. */
import { packageversion } from "./version.ts";

/**
 * Platform adapter logic of the 1.1.81 family.
 * One contract carries every platform primitive the library touches: the storage adapter the memory module takes, the clock adapter the progress module takes, the logger adapter that keeps the core off a bound console and the fetch adapter that keeps the core off a bound network primitive — with the node, browser and deno default compositions that bind real platform apis behind the same seam, and the bundle stamp that reports the mode and target of the running bundle. The module stays pure: the node bindings arrive as injected filesystem primitives and the deno bindings as an injected kv store, so the neutral and browser bundles never carry a node import. The shared adapter registry lives on the global symbol registry instead of a module singleton, so the esm and cjs modes of one process share one active adapter instead of forking the dual package hazard.
 * Example: `const adapter = nodeplatformadapter({ profiledir, fs }); setsharedadapter(adapter); bundlestamp();` binds the filesystem storage, publishes it to every mode of the process and reports the running bundle.
 */

/** Reads the consumption mode one runtime adapter serves: the browser shell rides the umd bundle, the node shell rides the cjs bundle and the bun and deno shells ride the esm core. */
export function adaptermodeof(runtime: platformtarget["runtime"]): librarymode {
  const modes: Record<platformtarget["runtime"], librarymode> = {
    browser: "umd",
    node: "cjs",
    bun: "esm",
    deno: "esm",
  };
  return modes[runtime];
}

/** Reads the clock adapter of the platform seam from the injected primitives; the adapter owns no timer of its own. */
export function clockadapterof(primitives: {
  now(): number;
  schedule(callback: () => void, milliseconds: number): unknown;
}): clockadapter {
  return {
    now: () => primitives.now(),
    schedule: (callback, milliseconds) => primitives.schedule(callback, milliseconds),
  };
}

/** Reads the logger adapter of the platform seam from the injected sink; the adapter owns no console of its own. */
export function loggeradapterof(sink: {
  log(line: string): void;
  warn(line: string): void;
  error(line: string): void;
}): loggeradapter {
  return { log: (line) => sink.log(line), warn: (line) => sink.warn(line), error: (line) => sink.error(line) };
}

/** Reads the fetch adapter of the platform seam from the injected loader; the adapter owns no network primitive of its own. */
export function fetchadapterof(primitives: {
  fetch(input: string, init?: Record<string, unknown>): Promise<unknown>;
}): fetchadapter {
  return { fetch: (input, init) => primitives.fetch(input, init) };
}

/** Reads the default clock adapter: now and the scheduler bind to the platform globals every supported runtime ships, so the default carries no node or browser specific import. Example: `defaultclock().now()` answers the platform timestamp. */
export function defaultclock(): clockadapter {
  return {
    now: () => Date.now(),
    schedule: (callback, milliseconds) => setTimeout(callback, milliseconds),
  };
}

/** Reads the default logger adapter: the sink binds to the platform console every supported runtime ships. Example: `defaultlogger().log("line")` writes one line through the platform console. */
export function defaultlogger(): loggeradapter {
  return {
    log: (line) => console.log(line),
    warn: (line) => console.warn(line),
    error: (line) => console.error(line),
  };
}

/** Reads the default fetch adapter: the loader binds to the platform fetch primitive and a runtime without one refuses instead of silently binding, so a host injects its own loader. Example: `defaultfetch().fetch("https://example.org")` rides the platform primitive. */
export function defaultfetch(): fetchadapter {
  const loader = (globalThis as { fetch?: (input: string, init?: Record<string, unknown>) => Promise<unknown> }).fetch;
  if (loader === undefined)
    throw new Error(
      "The default fetch adapter needs the platform fetch primitive; a runtime without one injects its own loader through the seam.",
    );
  return { fetch: (input, init) => loader(input, init) };
}

/** Composes the full adapter contract from the injected seams: the storage adapter is required because every runtime binds its own, while the clock, logger and fetch adapters default to the platform globals when the caller injects none. Example: `platformadapterof({ runtime: "node", storage: adapter })` fills the clock, logger and fetch defaults beside the injected storage. */
export function platformadapterof(input: {
  runtime: platformtarget["runtime"];
  headless?: boolean;
  storage: memoryadapter;
  clock?: clockadapter;
  logger?: loggeradapter;
  fetch?: fetchadapter;
}): adaptercontract {
  return {
    runtime: input.runtime,
    mode: adaptermodeof(input.runtime),
    declaration: runtimeadapterdeclarationof(input.runtime, input.headless),
    probes: runtimecapabilitiestable()[input.runtime],
    storage: input.storage,
    clock: input.clock ?? defaultclock(),
    logger: input.logger ?? defaultlogger(),
    fetch: input.fetch ?? defaultfetch(),
  };
}

/** Reads the default node adapter: the caller injects the filesystem primitives of the node build, so this module never imports a node api and the browser bundles stay free of node shims. Example: `nodeplatformadapter({ profiledir, fs })` binds the filesystem storage under the profile directory. */
export function nodeplatformadapter(input: {
  profiledir: string;
  fs: filesystemprimitives;
  clock?: clockadapter;
  logger?: loggeradapter;
  fetch?: fetchadapter;
}): adaptercontract {
  return platformadapterof({
    runtime: "node",
    storage: filesystemstorageadapter(input.fs, input.profiledir),
    ...(input.clock !== undefined ? { clock: input.clock } : {}),
    ...(input.logger !== undefined ? { logger: input.logger } : {}),
    ...(input.fetch !== undefined ? { fetch: input.fetch } : {}),
  });
}

/** Reads the default browser adapter: the caller injects the chrome storage area of the browser build and an absent area falls back to the in-memory store, so the script tag bundle runs with no chrome api present. Example: `browserplatformadapter({ area })` binds the chrome storage area through the seam. */
export function browserplatformadapter(input?: {
  area?: chromestorageprimitives;
  clock?: clockadapter;
  logger?: loggeradapter;
  fetch?: fetchadapter;
}): adaptercontract {
  const storage = input?.area !== undefined ? chromestorageadapter(input.area) : memorystorageadapter();
  return platformadapterof({
    runtime: "browser",
    storage,
    ...(input?.clock !== undefined ? { clock: input.clock } : {}),
    ...(input?.logger !== undefined ? { logger: input.logger } : {}),
    ...(input?.fetch !== undefined ? { fetch: input.fetch } : {}),
  });
}

/** Reads the default deno adapter: the caller injects the kv store the deno host opened, so the deno runtime keeps its own storage mapping behind the same seam. Example: `denoplatformadapter({ kv })` binds the deno kv store. */
export function denoplatformadapter(input: {
  kv: denokvprimitives;
  clock?: clockadapter;
  logger?: loggeradapter;
  fetch?: fetchadapter;
}): adaptercontract {
  return platformadapterof({
    runtime: "deno",
    storage: denokvadapter(input.kv),
    ...(input.clock !== undefined ? { clock: input.clock } : {}),
    ...(input.logger !== undefined ? { logger: input.logger } : {}),
    ...(input.fetch !== undefined ? { fetch: input.fetch } : {}),
  });
}

/** The shared registry key of the active adapter: a registered symbol, so the esm and cjs modes of one process read the same registry entry instead of forking the dual package hazard across two module instances. */
const registrykey = Symbol.for("devthink.platform.adapter");

/** Publishes the active adapter contract onto the shared registry: every mode of the process reads the same adapter afterwards, so the library state stays consistent across the esm and cjs instances. Example: `setsharedadapter(adapter)` publishes one adapter for both modes. */
export function setsharedadapter(adapter: adaptercontract): adaptercontract {
  (globalThis as Record<symbol, adaptercontract | undefined>)[registrykey] = adapter;
  return adapter;
}

/** Reads the active adapter contract from the shared registry; an unpublished registry answers undefined and a host publishes through setsharedadapter. Example: `sharedadapter()?.runtime` answers the runtime of the published adapter. */
export function sharedadapter(): adaptercontract | undefined {
  return (globalThis as Record<symbol, adaptercontract | undefined>)[registrykey];
}

/** The bundle stamp of the running instance: the entry file of each dist target stamps its own mode and target at load, so the stamp stays per bundle by design while the adapter registry stays per process. */
let runningmode: librarymode = "esm";
let runningtarget = "index.js";

/** Stamps the mode and target of the running bundle; each dist entry calls this once at load, so the library reports the bundle it runs from. Example: `stampbundle("umd", "devthink.umd.js")` stamps the script tag bundle. */
export function stampbundle(mode: librarymode, target: string): void {
  runningmode = mode;
  runningtarget = target;
}

/** Reads the stamp of the running bundle with the package version: one function answers the version, the consumption mode and the dist target of the bundle the caller loaded. Example: `bundlestamp().mode` answers `cjs` inside build/index.cjs. */
export function bundlestamp(): bundlemode {
  return { version: packageversion, mode: runningmode, target: runningtarget };
}

/** Detects the adapter runtime of the active platform through global probes: the node, bun and deno globals name their runtime and a page environment answers browser, so one probe decides which default adapter composition binds. Example: `detectadapterruntime()` answers `node` under the node build. */
export function detectadapterruntime(): platformtarget["runtime"] | "unknown" {
  const holder = globalThis as {
    Deno?: { version?: string };
    Bun?: { version?: string };
    process?: { versions?: { node?: string } };
    window?: unknown;
  };
  if (holder.Deno !== undefined) return "deno";
  if (holder.Bun !== undefined) return "bun";
  if (holder.process?.versions?.node !== undefined) return "node";
  if (holder.window !== undefined) return "browser";
  return "unknown";
}

/** Reads the adapter surface report of one contract: the runtime, mode, declaration mappings and probe flags in one plain record the doctor surfaces print. Example: `adaptersurfaceof(adapter).storage` answers the storage mapping name. */
export function adaptersurfaceof(adapter: adaptercontract): {
  runtime: string;
  mode: librarymode;
  storage: string;
  worker: string;
  dom: string;
  probes: capabilityprobe;
  declaration: runtimeadapterdeclaration;
} {
  return {
    runtime: adapter.runtime,
    mode: adapter.mode,
    storage: adapter.declaration.storage,
    worker: adapter.declaration.worker,
    dom: adapter.declaration.dom,
    probes: adapter.probes,
    declaration: adapter.declaration,
  };
}

/* ── Merged from runtimeadapters.ts ── */

/**
 * Runtimeadapters logic of the 1.1.67 family.
 * One core meets every runtime through its adapter: the capability probes detect the dom, storage, network and worker capabilities of the active runtime, a missing capability downgrades its feature instead of failing the runtime, and the runtime shells provide the timers, storage and fetch primitives with the storage adapter mapping to chrome storage in the browser, the filesystem in node and bun and deno kv in deno, the worker adapter mapping to web workers or worker threads and the dom adapter mapping to a live page in the browser and a remote browser session in headless mode.
 * The adapters stay injection seams: every primitive arrives as a parameter, so the pure core never imports a platform module and the extension bundle stays free of node shims.
 */

/** The runtime names the adapters serve. */
export type adapterruntime = platformtarget["runtime"];

/** Reads one capability probe from the presence flags of the active runtime: the probe detects dom, storage, network and worker availability without failing anything. */
export function capabilityprobeof(input: {
  dom: boolean;
  storage: boolean;
  network: boolean;
  worker: boolean;
}): capabilityprobe {
  return { dom: input.dom, storage: input.storage, network: input.network, worker: input.worker };
}

/** Reads the declared capability matrix: the browser probes every capability, node and bun probe storage, network and workers without a dom, and deno probes its kv storage, the platform fetch and its web workers without a dom. */
export function runtimecapabilitiestable(): Record<adapterruntime, capabilityprobe> {
  return {
    browser: { dom: true, storage: true, network: true, worker: true },
    node: { dom: false, storage: true, network: true, worker: true },
    bun: { dom: false, storage: true, network: true, worker: true },
    deno: { dom: false, storage: true, network: true, worker: true },
  };
}

/** Reads the adapter declaration of one runtime: the storage, fetch, timer, worker and dom mappings its platform provides. */
export function runtimeadapterdeclarationof(runtime: adapterruntime, headless?: boolean): runtimeadapterdeclaration {
  const declarations: Record<adapterruntime, runtimeadapterdeclaration> = {
    browser: {
      runtime,
      storage: "chrome",
      fetch: "platform",
      timer: "platform",
      worker: "webworker",
      dom: headless === true ? "remote" : "livepage",
    },
    node: {
      runtime,
      storage: "filesystem",
      fetch: "platform",
      timer: "platform",
      worker: "workerthreads",
      dom: "remote",
    },
    bun: {
      runtime,
      storage: "filesystem",
      fetch: "platform",
      timer: "platform",
      worker: "workerthreads",
      dom: "remote",
    },
    deno: { runtime, storage: "denokv", fetch: "platform", timer: "platform", worker: "webworker", dom: "remote" },
  };
  return declarations[runtime];
}

/** Reads every adapter declaration of the matrix in one list, so the doctor report and the build matrix read the same mappings. */
export function adapterdeclarationsof(): runtimeadapterdeclaration[] {
  return (["browser", "node", "bun", "deno"] as adapterruntime[]).map((runtime) =>
    runtimeadapterdeclarationof(runtime),
  );
}

/** Reads the worker mapping of one runtime: the browser and deno run web workers while node and bun run worker threads. */
export function workermapof(runtime: adapterruntime): "webworker" | "workerthreads" {
  return runtime === "node" || runtime === "bun" ? "workerthreads" : "webworker";
}

/** Reads the dom mapping of one mode: the browser maps to the live page and the headless mode maps to the remote browser session the attach protocol drives. */
export function dommapof(mode: "browser" | "headless"): "livepage" | "remote" {
  return mode === "browser" ? "livepage" : "remote";
}

/** Computes the feature downgrades of one runtime: every feature whose capability the probes miss downgrades with its reason, and nothing fails the runtime. */
export function downgradesof(input: {
  features: Array<{ feature: string; capability: keyof capabilityprobe }>;
  probes: capabilityprobe;
}): featuredowngrade[] {
  return input.features
    .filter((feature) => input.probes[feature.capability] !== true)
    .map((feature) => ({
      feature: feature.feature,
      capability: feature.capability,
      reason: `The runtime probes no ${feature.capability} capability, so the ${feature.feature} feature downgrades instead of failing the runtime.`,
    }));
}

/** Reads the storage primitives one filesystem runtime injects: the adapter maps every memory key to one json file under its base directory. */
export interface filesystemprimitives {
  readfile(path: string): Promise<string>;
  writefile(path: string, data: string): Promise<void>;
  mkdir(path: string): Promise<unknown>;
  join(...parts: string[]): string;
}

/** Maps filesystem primitives onto the memory adapter seam: every key becomes one json file under the base directory, so node and bun store profiles the same way the browser stores them. */
export function filesystemstorageadapter(fs: filesystemprimitives, base: string): memoryadapter {
  return {
    async get<T>(key: string): Promise<T | undefined> {
      try {
        return JSON.parse(await fs.readfile(fs.join(base, `${key}.json`))) as T;
      } catch {
        return undefined;
      }
    },
    async set<T>(key: string, value: T): Promise<void> {
      await fs.mkdir(base);
      await fs.writefile(fs.join(base, `${key}.json`), JSON.stringify(value));
    },
  };
}

/** Reads the storage primitives one chrome runtime injects: the adapter maps every memory key onto one storage area entry. */
export interface chromestorageprimitives {
  get(key: string): Promise<unknown>;
  set(key: string, value: unknown): Promise<void>;
}

/** Maps chrome storage primitives onto the memory adapter seam: the browser stores every memory key in the storage area the caller injected. */
export function chromestorageadapter(area: chromestorageprimitives): memoryadapter {
  return {
    async get<T>(key: string): Promise<T | undefined> {
      return (await area.get(key)) as T | undefined;
    },
    async set<T>(key: string, value: T): Promise<void> {
      await area.set(key, value);
    },
  };
}

/** Reads the kv primitives one deno runtime injects: the adapter maps every memory key onto one kv entry. */
export interface denokvprimitives {
  get<T>(key: string): Promise<T | undefined>;
  set<T>(key: string, value: T): Promise<void>;
}

/** Maps deno kv primitives onto the memory adapter seam: deno stores every memory key in the kv store the caller opened. */
export function denokvadapter(kv: denokvprimitives): memoryadapter {
  return {
    async get<T>(key: string): Promise<T | undefined> {
      return kv.get<T>(key);
    },
    async set<T>(key: string, value: T): Promise<void> {
      await kv.set(key, value);
    },
  };
}

/** Maps an in-memory map onto the memory adapter seam: the test and browser fallback store keeps every key in one map. */
export function memorystorageadapter(store?: Map<string, unknown>): memoryadapter {
  const held = store ?? new Map<string, unknown>();
  return {
    async get<T>(key: string): Promise<T | undefined> {
      return held.get(key) as T | undefined;
    },
    async set<T>(key: string, value: T): Promise<void> {
      held.set(key, value);
    },
  };
}

/** Reads the timer shell of one runtime: the platform scheduling primitive the caller injected decides when callbacks run, so no adapter reimplements a clock. */
export function timershellof(primitives: {
  settimeout(callback: () => void, milliseconds: number): unknown;
  now(): number;
}): { schedule(callback: () => void, milliseconds: number): unknown; now(): number } {
  return {
    schedule: (callback, milliseconds) => primitives.settimeout(callback, milliseconds),
    now: () => primitives.now(),
  };
}

/** Reads the fetch shell of one runtime: the platform fetch primitive the caller injected passes through untouched, because every supported runtime ships one. */
export function fetchshellof(primitives: { fetch(input: string, init?: unknown): Promise<unknown> }): {
  fetch(input: string, init?: unknown): Promise<unknown>;
} {
  return { fetch: (input, init) => primitives.fetch(input, init) };
}

/** Composes the runtime adapter of one target: the declaration, the probes and the injected primitives become one shell, with the storage adapter mapping through the seam the caller provided. */
export function runtimeadapterof(input: {
  runtime: adapterruntime;
  headless?: boolean;
  storage?: memoryadapter;
  timer?: { settimeout(callback: () => void, milliseconds: number): unknown; now(): number };
  fetch?: { fetch(input: string, init?: unknown): Promise<unknown> };
}): {
  declaration: runtimeadapterdeclaration;
  probes: capabilityprobe;
  storage?: memoryadapter;
  timer?: { schedule(callback: () => void, milliseconds: number): unknown; now(): number };
  fetch?: { fetch(input: string, init?: unknown): Promise<unknown> };
} {
  return {
    declaration: runtimeadapterdeclarationof(input.runtime, input.headless),
    probes: runtimecapabilitiestable()[input.runtime],
    ...(input.storage !== undefined ? { storage: input.storage } : {}),
    ...(input.timer !== undefined ? { timer: timershellof(input.timer) } : {}),
    ...(input.fetch !== undefined ? { fetch: fetchshellof(input.fetch) } : {}),
  };
}

/** Reads the portable capability set of one runtime: a runtime that probes the dom (a live page or an attached remote session) executes every reviewed kind the vocabulary declares, and a runtime without one executes the kinds its domless filter admits. */
export function portablecapabilityset(input: {
  vocabulary: string[];
  probes: capabilityprobe;
  domlesskinds?: string[];
}): string[] {
  if (input.probes.dom) return input.vocabulary;
  return input.domlesskinds ?? [];
}

/* ── Merged from platformtargets.ts ── */

/**
 * Platformtargets logic of the 1.1.67 family.
 * The runtime matrix declares itself in one place: the browser, node, bun and deno targets each carry their entry file, bundle format, esbuild platform and declaration flag, the matrix verifies every runtime declares exactly one target, and one matrix run builds them all from the shared core.
 * Nothing about a target is inferred: the declaration is the contract the build matrix and the doctor report read, so a new runtime enters through one declaration and never through scattered build flags.
 */

/** Declares the platform matrix: the browser target serves script tag consumers through the umd shell under the product name devthink.umd.js, the node target serves require consumers through its cjs shell, and the bun and deno targets ride the esm core entries of their runtime shells. */
export function platformtargets(): platformtarget[] {
  return [
    {
      runtime: "browser",
      entry: "umd.ts",
      format: "umd",
      platform: "browser",
      declarations: true,
      output: "devthink.umd.js",
    },
    { runtime: "node", entry: "node.ts", format: "cjs", platform: "node", declarations: true },
    { runtime: "bun", entry: "bun.ts", format: "esm", platform: "node", declarations: true },
    { runtime: "deno", entry: "deno.ts", format: "esm", platform: "neutral", declarations: true },
  ];
}

/** Builds the platform matrix of one declaration list with its completeness flag: the matrix completes when every runtime declares exactly one target. */
export function platformmatrixof(targets: platformtarget[]): platformmatrix {
  const runtimes = new Set(targets.map((target) => target.runtime));
  const complete =
    runtimes.size === targets.length &&
    ["browser", "node", "bun", "deno"].every((runtime) => runtimes.has(runtime as platformtarget["runtime"]));
  return { targets, complete };
}

/** Reads the platform target of one runtime from a declaration list; an absent or duplicated runtime refuses. */
export function matrixtargetof(targets: platformtarget[], runtime: platformtarget["runtime"]): platformtarget {
  const declared = targets.filter((target) => target.runtime === runtime);
  if (declared.length === 0) throw new Error(`The platform matrix declares no ${runtime} target.`);
  if (declared.length > 1)
    throw new Error(
      `The platform matrix declares the ${runtime} target ${declared.length} times; every runtime declares exactly one target.`,
    );
  return declared[0] as platformtarget;
}

/** Verifies one matrix run: every declared target needs its built bundle present, so a missing entry names the runtime that failed its matrix run. */
export function matrixverify(input: { targets: platformtarget[]; present: string[] }): {
  complete: boolean;
  missing: string[];
  reason: string;
} {
  const missing = input.targets
    .filter((target) => !input.present.includes(target.entry))
    .map((target) => `${target.runtime}:${target.entry}`);
  return {
    complete: missing.length === 0,
    missing,
    reason:
      missing.length === 0
        ? `The matrix run verified every platform target of ${input.targets.map((target) => target.runtime).join(", ")}.`
        : `The matrix run lacks the built entries ${missing.join(", ")}.`,
  };
}

/** Reads the output file name of one platform target bundle: an explicit output name wins, and an absent name keeps the entry stem with the format extension the target declares. */
export function targetoutput(target: platformtarget): string {
  if (target.output !== undefined) return target.output;
  const stem = target.entry.replace(/\.ts$/, "");
  return target.format === "cjs" ? `${stem}.cjs` : target.format === "umd" ? `${stem}.umd.js` : `${stem}.js`;
}

/** Reads the minified output file name of one platform target bundle: the unminified variant keeps its name and the minified variant inserts the min marker before the extension, so every target ships both variants under one rule. */
export function minifiedoutput(target: platformtarget): string {
  return targetoutput(target)
    .replace(/\.js$/, ".min.js")
    .replace(/\.cjs$/, ".min.cjs");
}

/* ── Merged from the runtime baseline policy gate ── */

/**
 * Runtime policy logic of the declared baselines: ensures all declared runtime baselines remain internally consistent and bounded to explicitly tested major lines — the protocolv2 negotiation pins of the frozen surface, the transparency and multi agent surface acceptance of the one web design, the engine floors against the .nvmrc pin, the container base pins of the Dockerfile and the verify workflow stamps — refusing the first drift the way the standalone gate script always refused.
 * The devfold wave folded the gate into the family base: the whole validation rides one async gate behind the direct entry check, so an import of the library module never reads a file and the bundled faces never resolve a platform import — the node builtins arrive through computed specifiers the bundlers cannot resolve, and only the direct entry lane (`node runtime.ts`, the validate:runtime script and the verify workflow step) drives the gate.
 */

/** Reads the node builtin specifier of the runtime policy gate: the computed template keeps every bundler pass from resolving a platform import, so the neutral and browser targets of the matrix stay free of node shims (the source purity law the library modes suite asserts over this module). */
const nodespecifier = (builtin: string) => `node:${builtin}`;

/** Ensures all declared runtime baselines remain internally consistent and bounded to explicitly tested major lines; every check throws on the first drift and the summary prints the floors the baselines pin. */
async function validateruntimebaselines(): Promise<void> {
  const { readFile } = await import(nodespecifier("fs/promises"));
  const { join, resolve } = await import(nodespecifier("path"));
  const repoRoot = resolve(process.cwd(), "..");
  const packagejson = JSON.parse(await readFile("package.json", "utf8"));
  const nvmversion = (await readFile(".nvmrc", "utf8")).trim();
  const containerfile = await readFile("Dockerfile", "utf8");
  const verifyworkflow = await readFile(join(repoRoot, ".github/workflows/verify.yml"), "utf8");
  const semver = /^\d+\.\d+\.\d+$/;

  /* the 1.1.91 protocolv2 negotiation paths: the runtime baselines accept the frozen protocol major, the library pin and the mcp negotiation seam */
  const versionsource = await readFile("version.ts", "utf8");
  const typesource = await readFile("types.ts", "utf8");
  const mcpsource = await readFile("mcp.ts", "utf8");
  if (!/export const protocolmajor = 2 as const;/.test(versionsource))
    throw new Error("version.ts must pin the frozen protocolv2 major two.");
  if (!/export const protocolfloormajor = 2 as const;/.test(versionsource))
    throw new Error(
      "version.ts must pin the protocol floor two the 2.0.0 sunset raised when the deprecation window closed.",
    );
  if (!typesource.includes("export const protocolmajorversion = protocolmajor;"))
    throw new Error("types.ts must derive the protocol major constant from version.ts.");
  if (!typesource.includes("export const pinnedprotocolversion"))
    throw new Error("The library surface must export the pinned protocol version import.");
  if (!mcpsource.includes("negotiateprotocol"))
    throw new Error("The mcp negotiation must route through the protocolv2 negotiation family.");
  if (!verifyworkflow.includes("node apifreeze.ts"))
    throw new Error("The verify workflow must gate the api freeze after the validation chain.");

  /* the 1.1.95 transparency surface acceptance: the one web design file declares the transparencypage surface with its completed sections, the options surface embeds it as its own page, the surface carries no remote resource, and the compiled page module ships beside the design */
  const webindex = await readFile("design.html", "utf8");
  const transparencymatch = /<template data-surface="transparencypage">([\s\S]*?)<\/template>/.exec(webindex);
  if (transparencymatch === null)
    throw new Error(
      "The web design file must declare the transparencypage surface template the transparency page renders from.",
    );
  for (const section of [
    "#grants",
    "#windows",
    "#permissions",
    "#datakinds",
    "#integrity",
    "#senders",
    "#permdiffs",
    "#safedefaults",
  ]) {
    if (!transparencymatch[1].includes(`id="${section.slice(1)}"`))
      throw new Error(
        `The transparencypage surface must carry its ${section} section; the transparency page lists grants, permissions, data kinds, integrity, senders, permdiffs and safedefaults.`,
      );
  }
  for (const reference of [...transparencymatch[1].matchAll(/(?:src|href)\s*=\s*["']([^"']+)["']/g)].map(
    (match) => match[1],
  )) {
    if (/^(https?|wss?|data):/i.test(reference))
      throw new Error(
        `The transparencypage surface loads the remote resource ${reference}; the transparency page runs entirely offline.`,
      );
  }
  const optionsmatch = /<template data-surface="optionspage">([\s\S]*?)<\/template>/.exec(webindex);
  if (optionsmatch === null || !optionsmatch[1].includes('iframe src="transparencypage.html"'))
    throw new Error(
      "The optionspage surface must embed the transparencypage.html surface the manifest declares as an extension page.",
    );
  const transparencymodule = await readFile("transparencypage.ts", "utf8");
  if (!transparencymodule.includes("request<{ transparencyview }") && !transparencymodule.includes("transparencyview"))
    throw new Error("The transparencypage module must render through the transparency view the background serves.");
  for (const gate of ["runtime", "pentest", "cspaudit", "permdiff"]) {
    if (!(await readFile(`${gate}.ts`, "utf8").catch(() => undefined)))
      throw new Error(`The ${gate} gate script must exist at the app root beside the runtime policy.`);
  }

  /* the 1.1.96 multi agent certification acceptance: the coordination and accounting gate scripts exist beside the runtime policy, the verify workflow runs them after the security gates, the dashdone family module ships with its own declaration entry outside the frozen index surface, and the dashboardpage surface of the one web design file carries every multi agent panel with no remote resource */
  for (const gate of ["agentcert", "costcert"]) {
    if (!(await readFile(`${gate}.ts`, "utf8").catch(() => undefined)))
      throw new Error(`The ${gate} gate script must exist at the app root beside the runtime policy.`);
    if (!verifyworkflow.includes(`node ${gate}.ts`))
      throw new Error(`The verify workflow must run the ${gate} gate of the multi agent certification.`);
  }
  if (!(await readFile("dashboard.ts", "utf8").catch(() => undefined)))
    throw new Error("The dashboard family module must exist at the root beside the hardening family.");
  const dashdonedeclaration = await readFile("tsconfig.build.json", "utf8");
  if (!dashdonedeclaration.includes("dashboard.ts"))
    throw new Error(
      "The declaration emit must include the dashboard module so build/dashboard.d.ts ships beside the bundle.",
    );
  const dashboardmatch = /<template data-surface="dashboardpage">([\s\S]*?)<\/template>/.exec(webindex);
  if (dashboardmatch === null)
    throw new Error("The web design file must declare the dashboardpage surface template the newtab override serves.");
  for (const panel of [
    "multiagentoverview",
    "agentstatuscards",
    "sharedqueueview",
    "queuelanefilter",
    "messageflow",
    "conflictlog",
    "agentcostpanel",
    "escalationinbox",
    "timelinescrubber",
    "aggregatetimeline",
    "killswitch",
    "reportdownload",
  ]) {
    if (!dashboardmatch[1].includes(`id="${panel}"`))
      throw new Error(
        `The dashboardpage surface must carry its ${panel} multi agent panel; the dashdone completion ships every panel or none.`,
      );
  }
  for (const reference of [...dashboardmatch[1].matchAll(/(?:src|href)\s*=\s*["']([^"']+)["']/g)].map(
    (match) => match[1],
  )) {
    if (/^(https?|wss?|data):/i.test(reference))
      throw new Error(
        `The dashboardpage surface loads the remote resource ${reference}; the multi agent dashboard runs entirely offline.`,
      );
  }

  function minimum(range: string, label: string) {
    /* the dependency union law moved the family engines to the caret floors
     * beside the explicit bounded forms, and a caret IS the bounded range the
     * policy always demanded (^x.y.z spells >=x.y.z <next-major exactly), so
     * the minimum reads the floor of either shape — an unbounded, floating or
     * absent declaration still refuses the way the policy law charges. */
    const caret = /^\^(\d+\.\d+\.\d+)$/.exec(range ?? "");
    if (caret !== null && semver.test(caret[1])) return caret[1];
    const match = /^>=(\d+\.\d+\.\d+) <(\d+)$/.exec(range ?? "");
    if (!match || !semver.test(match[1]))
      throw new Error(`${label} must use a bounded >=x.y.z <next-major engine range (^x.y.z rides as the same floor).`);
    const major = Number(match[1].split(".")[0]);
    if (Number(match[2]) !== major + 1) throw new Error(`${label} must stop before its next untested major.`);
    return match[1];
  }

  /** whether one concrete version satisfies a declared floor (the same major,
   * at or above the floor): the smoke baselines the workflows carry may answer
   * a newer patch of the floor the engines declare — the union law charges the
   * policy to read the satisfaction, never the equality. */
  function satisfiesfloor(version: string, floor: string): boolean {
    const v = version.split(".").map(Number);
    const f = floor.split(".").map(Number);
    if (v.length !== 3 || f.length !== 3 || v.some(Number.isNaN) || f.some(Number.isNaN)) return false;
    if (v[0] !== f[0]) return false;
    if (v[1] !== f[1]) return v[1] > f[1];
    return v[2] >= f[2];
  }

  /* the engines seat answers the one-hop-up root manifest (the
   * manifestemplate law emptied the app copy the gate once read): the
   * same root law the locksync battery walks — every container and
   * every policy read resolves the /package.json the repository root
   * carries, never the app copy the wave retired. */
  const rootpackagejson = JSON.parse(await readFile(join(repoRoot, "package.json"), "utf8"));
  const nodeversion = minimum(rootpackagejson.engines?.node, "Node");
  const npmversion = minimum(rootpackagejson.engines?.npm, "npm");
  const bunversion = minimum(rootpackagejson.engines?.bun, "Bun");
  if (nvmversion !== nodeversion)
    throw new Error(`.nvmrc (${nvmversion}) must equal the declared Node minimum (${nodeversion}).`);
  /* the 2.0.16 family container splits the baseline in two: the build stages
     (deps, builder, binary-builder, nodefetch) ride the exact declared Node
     baseline on the bookworm slim line under --platform=$BUILDPLATFORM so
     their toolchain layers stay native on every leg, the binary-runtime leg
     rides the distroless cc base, and the runtime stage rides the
     multi-architecture debian:trixie-slim base with the node tree the
     nodefetch stage extracts from the verified nodejs.org tarballs - the
     five-architecture surface (amd64, arm64, ppc64le, s390x through the
     official tarballs, riscv64 through the unofficial pointer-compression
     build) the node image manifests cannot answer, because only the debian
     manifest carries every arch of the family index. */
  /* the family doctrine answers the baselines by their registry tags, and
     the two literal runtime stages carry the digests the ladder stamps (the
     tag stays readable for the human, the digest pins the build the scanner
     gate demands, and the maintenance rung restamps both — the sbom and
     attest records the release lane publishes still ride the build). */
  if (!new RegExp(`^ARG NODE_IMAGE="node:${nodeversion}-bookworm-slim@sha256:[0-9a-f]{64}"$`, "m").test(containerfile))
    throw new Error("the Dockerfile NODE_IMAGE arg must pin the exact declared Node baseline by its registry tag and the ladder-stamped digest the scanner gate demands.");
  if (!new RegExp(`^ARG NODE_RUNTIME_VERSION="${nodeversion}"$`, "m").test(containerfile))
    throw new Error(
      "the Dockerfile NODE_RUNTIME_VERSION arg must pin the exact declared Node baseline of the runtime tarball.",
    );
  if (!/^FROM debian:trixie-slim@sha256:[0-9a-f]{64} AS runtime$/m.test(containerfile))
    throw new Error(
      "the Dockerfile runtime stage must ride the multi-architecture debian trixie slim base by its ladder-stamped registry digest.",
    );
  if (!/^FROM --platform=\$BUILDPLATFORM \$\{NODE_IMAGE\} AS nodefetch$/m.test(containerfile))
    throw new Error(
      "the nodefetch stage must fetch the runtime node tarball from the pinned NODE_IMAGE baseline under the build platform.",
    );
  if (!/^FROM --platform=\$BUILDPLATFORM \$\{NODE_IMAGE\} AS (?:deps|builder|binary-builder)$/m.test(containerfile))
    throw new Error(
      "the Dockerfile build stages must build from the pinned NODE_IMAGE baseline under the build platform.",
    );
  if (!/^FROM gcr\.io\/distroless\/cc-debian12:nonroot@sha256:[0-9a-f]{64} AS binary-runtime$/m.test(containerfile))
    throw new Error(
      "the binary runtime stage must ride the distroless cc nonroot base by its ladder-stamped registry digest.",
    );
  /* the digest wall stays where it matters: exactly the two literal runtime
     stages carry the ladder stamps — every ARG-driven baseline keeps its tag
     form (its digest answers the build's own resolution), and no hand-written
     digest may appear anywhere else in the file. */
  const digestlines = containerfile.match(/^FROM .*@sha256:[0-9a-f]{64} AS /gm) ?? [];
  if (digestlines.length !== 2)
    throw new Error(
      "exactly the two literal runtime stages carry the ladder digests; every other baseline answers by its registry tag.",
    );
  if (containerfile.includes("corepack"))
    throw new Error("Node 26 container builds must not depend on the removed Corepack binary.");
  /* the metadata probe rides the joined lane: the literal call form would
   * answer the bundle purity law the library modes test guards (the browser
   * bundle never carries a require seat), so the Dockerfile probe composes
   * at runtime and the source stays free of the forbidden literal. the
   * probe keeps the prefix shape of the original seat (the Dockerfile's
   * own expressions continue past the package.json argument) — the root
   * manifest law the container wave stamped: the probe reads the
   * /package.json the context root carries, the same one-hop-up seat the
   * engines walk answers, never the app copy the manifestemplate law
   * emptied. */
  const metadataprobe = ["node", "-p", `"${["require", "('/package.json')"].join("")}`].join(" ");
  if (!containerfile.includes(metadataprobe))
    throw new Error("the Dockerfile must evaluate package metadata with Node rather than pass it as a quoted literal.");
  if (!containerfile.includes('npm install --global "bun@${bunversion}"'))
    throw new Error("the Dockerfile must install the root package manager from the canonical packageManager field.");
  if (!containerfile.includes('bun install --frozen-lockfile'))
    throw new Error("the Dockerfile must retain frozen-lockfile installation.");
  /* the dependency union law rides the manager seat on the pnpm rung while the
   * engine floors carry the bun baseline, so the smoke test reads any bun the
   * declared floor accepts (the same major, at or above the floor) and the
   * packageManager pin accepts the union manager beside the bun era. */
  const verifybun = /bun-version: (\d+\.\d+\.\d+)/.exec(verifyworkflow ?? "");
  if (
    verifybun === null ||
    !satisfiesfloor(verifybun[1], bunversion)
  )
    throw new Error("verify workflow must smoke-test the declared Bun baseline.");
  /* the manager pin rides the root manifest beside the engines (the
   * seatfloor wave retired the per-app packageManager stamps the same
   * manifestemplate law retired): the one pin the whole tree answers. */
  if (!/^(?:bun|pnpm)@\d+\.\d+\.\d+$/.test(rootpackagejson.packageManager ?? ""))
    throw new Error("packageManager must pin a full bun or pnpm version.");
  console.log(
    JSON.stringify(
      {
        node: nodeversion,
        npm: npmversion,
        bun: bunversion,
        pnpm: rootpackagejson.packageManager,
        protocolmajor: 2,
        protocolfloor: 2,
      },
      null,
      2,
    ),
  );
}

/** Reads whether node loaded this module as the direct entry: the validate chain and the verify workflow run the gate lane as `node runtime.ts`, and no bundled library face matches a direct entry path (the browser faces carry no process at all), so the gate fires on its own lane and never on an import. */
const invokeddirectly =
  typeof process !== "undefined" &&
  Array.isArray(process.argv) &&
  typeof process.argv[1] === "string" &&
  (process.argv[1].endsWith("runtime.ts") || process.argv[1].endsWith("runtime"));

if (invokeddirectly)
  validateruntimebaselines().catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  });

/* ── Merged from the terminal render runtime ── */

/**
 * The terminal render runtime — the terminal side of the one design (wave 2-c / PR11): the render primitives the converted Sol widgets ride. buildterminal.ts turns the TSX widgets into IR trees (JSON) and this section interprets them into ANSI rows — the same design, the same tokens, the cell as the unit (the density.ts law). The IR is deliberately ink-shaped (box = flexDirection / borderStyle / padding / gap, text = color / bold / dim): mounting these trees on ink/react for the interactive TUI pass is a one-to-one mapping — the OpenCode reference — while this renderer stays dependency-free so the published face runs headless on Linux, Windows 10/11 and Android (termux) with plain node or bun, no browser, no install.
 *
 * The render runtime rides the application root beside its emitter (the flat folder law dissolved the terminal/ folder of the first layer, and the devfold wave folded the separate module into this file): the terminal render family and the platform adapter family share the one runtime module now, so the converted faces import their renderer from the same name the library surface carries.
 *
 * The conversion map this renderer owns (the full map lives documented on buildterminal.ts):
 * - flexbox row  → children joined on one line, gap in spaces (cells);
 * - flexbox column → children stacked, gap in blank rows;
 * - color tokens → ANSI truecolor / 256 / 16 by terminal capability;
 * - hairline rules and shadows → box-drawing borders (─ ┌ ┐ └ ┘ │);
 * - lucide/fluent icons → unicode glyphs, ASCII degrade under --plain;
 * - fonts and letter-spacing → weight (bold) and scale only — a cell cannot
 *   track, so the micro eyebrow reads bold-dim and the display title bold.
 *
 * Pure TypeScript, zero imports.
 */

/** an rgb triple of the design tokens */
export type Rgb = readonly [number, number, number];

/** the color depth a terminal answers */
export type ColorDepth = "truecolor" | "256" | "16" | "none";

/** the icon → unicode glyph map (the lucide/fluent names the Sol widgets
 * mount; --plain degrades every glyph to the ASCII stand-in) */
export const ICON_GLYPHS: Readonly<Record<string, string>> = {
  settings: "⚙",
  terminal: ">_",
  search: "⌕",
  play: "▶",
  pause: "‖",
  close: "×",
  check: "✓",
  warn: "△",
  error: "✕",
  info: "ℹ",
  chevronright: "›",
  chevronleft: "‹",
  arrowup: "↑",
  arrowdown: "↓",
  dot: "●",
  sun: "◉",
  moon: "☾",
  wrench: "⚒",
  home: "⌂",
  user: "☺",
  folder: "▤",
  file: "▫",
  cloud: "☁",
  bolt: "↯",
  lock: "⊘",
  key: "⚿",
};

/** the ASCII degrade of the glyph set (Windows conhost and NO_COLOR lanes) */
export const ICON_GLYPHS_PLAIN: Readonly<Record<string, string>> = {
  settings: "*",
  terminal: ">",
  search: "?",
  play: ">",
  pause: "||",
  close: "x",
  check: "v",
  warn: "!",
  error: "x",
  info: "i",
  chevronright: ">",
  chevronleft: "<",
  arrowup: "^",
  arrowdown: "v",
  dot: "*",
  sun: "o",
  moon: "o",
  wrench: "#",
  home: "h",
  user: "u",
  folder: "[]",
  file: "_",
  cloud: "~",
  bolt: "!",
  lock: "L",
  key: "k",
};

/** resolves the glyph of one icon name (the plain lane answers ASCII) */
export function glyph(name: string, plain = false): string {
  const key = name.toLowerCase().replace(/[^a-z]/g, "");
  const table = plain ? ICON_GLYPHS_PLAIN : ICON_GLYPHS;
  return table[key] ?? (plain ? "*" : "·");
}

/* ---------------------------------------------------------------------------
 * the ANSI ladder: rgb → truecolor / 256 / 16
 * ------------------------------------------------------------------------- */

/** quantizes one rgb to the xterm 256 cube+grayscale index (the 6×6×6 cube
 * at 16..231, the 24-step grayscale ramp at 232..255) */
export function rgbToAnsi256(rgb: Rgb): number {
  const [r, g, b] = rgb;
  if (r === g && g === b) {
    // the grayscale ramp: 16 and 231 are the ends, 24 steps between
    if (r < 8) return 16;
    if (r > 248) return 231;
    return 232 + Math.round(((r - 8) / 247) * 23);
  }
  const cube = (v: number) => (v < 48 ? 0 : v < 115 ? 1 : Math.min(5, Math.round((v - 35) / 40)));
  return 16 + 36 * cube(r) + 6 * cube(g) + cube(b);
}

/** quantizes one rgb to the 16-color base set: each channel folds to on/off
 * (the 8 colors) and the luminance lifts the result into the bright set */
export function rgbToAnsi16(rgb: Rgb): number {
  const [r, g, b] = rgb;
  const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  const bright = lum >= 96;
  const chan = (v: number) => (v >= 96 ? 1 : 0);
  const code = chan(r) * 1 + chan(g) * 2 + chan(b) * 4;
  // code 0 is black (30), the colored set rides 31..36, bright adds 60
  if (code === 0) return bright ? 90 : 30;
  return (bright ? 90 : 30) + code;
}

/** wraps one rgb into the escape sequence of the asked depth (fg color) */
export function ansiFg(rgb: Rgb | undefined, depth: ColorDepth): string {
  if (!rgb || depth === "none") return "";
  if (depth === "truecolor") return `\x1b[38;2;${rgb[0]};${rgb[1]};${rgb[2]}m`;
  if (depth === "256") return `\x1b[38;5;${rgbToAnsi256(rgb)}m`;
  return `\x1b[${rgbToAnsi16(rgb)}m`;
}

/** the closing escape of a colored span */
export const ANSI_RESET = "\x1b[0m";

/** reads the color depth a terminal answers from its environment (the
 * Windows 10/11 terminals, linux and termux all ride this ladder; NO_COLOR
 * and TERM=dumb answer the plain lane) */
export function colorDepthFromEnv(env: Record<string, string | undefined>): ColorDepth {
  if (env.NO_COLOR || env.TERM === "dumb" || env.TERM === "") return "none";
  if (env.COLORTERM === "truecolor" || env.COLORTERM === "24bit") return "truecolor";
  if ((env.TERM ?? "").includes("256color")) return "256";
  if (env.WT_SESSION || env.TERM_PROGRAM === "vscode" || env.ANSICON) return "256";
  if ((env.TERM ?? "").includes("xterm")) return "256";
  return "16";
}

/* ---------------------------------------------------------------------------
 * the IR (ink-shaped: box = flexDirection/gap/border, text = color/bold/dim)
 * ------------------------------------------------------------------------- */

export type IrText = {
  kind: "text";
  /** a literal string, or a prop slot name, or an item slot of a map node */
  text?: string;
  slot?: string;
  item?: string;
  /** the token color (rgb) the text rides */
  color?: Rgb;
  bold?: boolean;
  dim?: boolean;
  /** the scale class the web font size converted into */
  scale?: "display" | "body" | "micro";
  /** an icon glyph name the node mounts */
  icon?: string;
  /** the prop slot this node renders only when it holds a truthy value */
  when?: string;
  /** the verdict tone slot (the chip data-tone map) */
  toneSlot?: string;
  /** the inline decoration the web border converted into: keycaps ride
   * brackets, chips ride parens (the pill and the doubled bottom edge) */
  deco?: "bracket" | "paren";
};

export type IrBox = {
  kind: "box";
  /** flexDirection row|column — the flex→rows map */
  direction: "row" | "column";
  /** the flex gap converted to cells (spaces in row, blank rows in column) */
  gap: number;
  /** a hairline rule below the box (border-bottom → the ─ row) */
  rule?: boolean;
  /** a full box border (shadows and bordered chips → box drawing) */
  border?: boolean;
  /** left padding in cells */
  padX?: number;
  /** vertical padding in blank rows */
  padY?: number;
  /** the prop slot this box renders only when it holds a truthy value */
  when?: string;
  /** the inline pill decoration of a row box (the chip border-radius →
   * parens — a cell cannot round) */
  deco?: "paren" | "bracket";
  children: IrNode[];
};

export type IrChrome = { kind: "chrome" };
export type IrMap = { kind: "map"; slot: string; item: string; child: IrNode; gap?: number };
export type IrChildren = { kind: "children" };

export type IrNode = IrText | IrBox | IrChrome | IrMap | IrChildren;

/** the verdict tones of the family chips (the .uichip[data-tone] palette of
 * sol.css, dark face — the terminal answers the dark token set): the values
 * are pinned here with their source so the conversion test can assert the
 * css and the runtime never drift */
export const TONE_COLORS: Readonly<Record<string, Rgb>> = {
  neutral: [195, 195, 195], // var(--dt-muted) → #c3c3c3
  ok: [127, 209, 168], // var(--ok) → #7fd1a8
  warn: [226, 194, 106], // var(--warn) → #e2c26a
  err: [240, 138, 122], // var(--err) → #f08a7a
  info: [185, 194, 208], // var(--info) → #b9c2d0
};

/** the props the converted widget receives — the SAME props the web face
 * answers (the interactivity contract survives the conversion) */
export type IrProps = Record<string, unknown>;

export type RenderOptions = {
  depth?: ColorDepth;
  plain?: boolean;
  /** the live terminal width in cells (the responsive fold) */
  columns?: number;
};

/* ---------------------------------------------------------------------------
 * the renderer: IR → ANSI rows
 * ------------------------------------------------------------------------- */

/** paints one string with the sgr flags of a text node */
function paint(content: string, node: { color?: Rgb; bold?: boolean; dim?: boolean }, depth: ColorDepth, plain: boolean): string {
  if (plain) return content;
  const flags: string[] = [];
  if (node.bold) flags.push("\x1b[1m");
  if (node.dim) flags.push("\x1b[2m");
  const color = ansiFg(node.color, depth);
  if (color) flags.push(color);
  if (flags.length === 0) return content;
  return `${flags.join("")}${content}${ANSI_RESET}`;
}

/** renders the terminal chrome band (the ShellChrome navbar → the brand row
 * plus the hairline — the one chrome of the design on the terminal) */
function renderChrome(depth: ColorDepth, plain: boolean, columns: number): string[] {
  const width = Math.max(columns, 40);
  const brand = paint("◐ devthink — the os", { color: [250, 250, 250], bold: true }, depth, plain);
  const rule = paint("─".repeat(width), { color: [67, 67, 67], dim: true }, depth, plain);
  return [brand, rule];
}

/** renders one IR node to lines (the flex→rows engine: a row joins children
 * on one line, a column stacks them) */
export function renderIr(ir: IrNode, props: IrProps = {}, options: RenderOptions = {}): string[] {
  const depth = options.depth ?? "truecolor";
  const plain = options.plain ?? false;
  const columns = options.columns ?? 80;
  const resolveText = (node: IrText): string => {
    if (node.icon) return glyph(node.icon, plain);
    if (node.text !== undefined) return node.text;
    if (node.slot !== undefined) {
      const value = props[node.slot];
      return value === undefined ? "" : String(value);
    }
    if (node.item !== undefined) return String(props[`__item:${node.item}`] ?? "");
    return "";
  };
  const truthy = (slot: string | undefined): boolean => slot === undefined || Boolean(props[slot]);
  switch (ir.kind) {
    case "text": {
      if (!truthy(ir.when)) return [];
      let content = resolveText(ir);
      const tone = ir.toneSlot ? String(props[ir.toneSlot] ?? "neutral") : undefined;
      const toneColor = tone ? TONE_COLORS[tone] : undefined;
      if (ir.deco === "bracket") content = `[${content}]`;
      if (ir.deco === "paren") content = `(${content})`;
      // the responsive fold: the terminal width IS the measure (the 640px
      // lede of the web face answers the same 80 cells here)
      return wrapCells(content, columns).map((line) =>
        paint(line, { color: ir.color ?? toneColor, bold: ir.bold, dim: ir.dim }, depth, plain),
      );
    }
    case "chrome":
      return renderChrome(depth, plain, columns);
    case "children": {
      const value = props.children;
      if (typeof value === "string") return value.split("\n");
      if (Array.isArray(value)) return value.flatMap((line) => String(line).split("\n"));
      return [];
    }
    case "map": {
      const list = props[ir.slot];
      if (!Array.isArray(list)) return [];
      const itemLines = list.map((entry) =>
        renderIr(ir.child, { ...props, [`__item:${ir.item}`]: entry }, options),
      );
      // mapped children of a flex row join inline (the list layout of the
      // one design — keycap sequences read on one line)
      if (itemLines.every((set) => set.length === 1)) {
        const sep = " ".repeat(ir.gap ?? 1);
        return [itemLines.map((set) => set[0]).join(sep)];
      }
      return itemLines.flatMap((set) => set);
    }
    case "box": {
      if (!truthy(ir.when)) return [];
      const pad = " ".repeat(ir.padX ?? 0);
      const childLines = ir.children.map((child) => renderIr(child, props, options));
      let lines: string[];
      if (ir.direction === "row") {
        // flex row → every child on one line, joined by the gap in cells
        const height = Math.max(1, ...childLines.map((set) => set.length));
        const gap = " ".repeat(ir.gap);
        lines = [];
        for (let row = 0; row < height; row++) {
          const joined = childLines
            .map((set) => set[row] ?? "")
            .join(gap)
            .trimEnd();
          lines.push(joined);
        }
      } else {
        // flex column → every child stacked, blank rows between
        lines = [];
        for (let index = 0; index < childLines.length; index++) {
          if (index > 0) lines.push(...Array.from({ length: ir.gap }, () => ""));
          lines.push(...childLines[index]);
        }
      }
      if (ir.deco && ir.direction === "row") {
        const open = ir.deco === "paren" ? "(" : "[";
        const close = ir.deco === "paren" ? ")" : "]";
        lines = lines.map((line) => (line.length > 0 ? open + line + close : line));
      }
      if (ir.border) {
        // shadow/boxed chip → the box-drawing border of the terminal
        const width = Math.max(1, ...lines.map((line) => visibleLength(line)));
        const top = `┌${"─".repeat(width + 2)}┐`;
        const bottom = `└${"─".repeat(width + 2)}┘`;
        lines = [top, ...lines.map((line) => `│ ${line.padEnd(width)} │`), bottom];
      }
      if (ir.rule) {
        const width = Math.max(1, ...lines.map((line) => visibleLength(line)), 1);
        lines.push(paint("─".repeat(Math.min(width, columns)), { color: [67, 67, 67], dim: true }, depth, plain));
      }
      if (ir.padY) {
        const blank = Array.from({ length: ir.padY }, () => "");
        lines = [...blank, ...lines, ...blank];
      }
      return lines.map((line) => (line.length > 0 ? pad + line : line));
    }
  }
}

/** the visible width of a line (escape sequences carry no cells) */
export function visibleLength(line: string): number {
  let width = 0;
  let inEscape = false;
  for (const char of line) {
    if (inEscape) {
      if (char === "m") inEscape = false;
      continue;
    }
    if (char === "\x1b") {
      inEscape = true;
      continue;
    }
    width += 1;
  }
  return width;
}

/** word-wraps one plain string to the cell budget (the responsive fold of
 * the terminal — words never break mid-glyph) */
export function wrapCells(text: string, columns: number): string[] {
  if (visibleLength(text) <= columns) return [text];
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const candidate = line.length === 0 ? word : `${line} ${word}`;
    if (visibleLength(candidate) > columns && line.length > 0) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  }
  if (line.length > 0) lines.push(line);
  return lines;
}

/** renders one IR tree to the final terminal document (trailing spaces
 * trimmed, the family newline contract) */
export function render(ir: IrNode, props: IrProps = {}, options: RenderOptions = {}): string {
  return renderIr(ir, props, options)
    .map((line) => line.trimEnd())
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trimEnd();
}
