/**
 * The runtime module of the 1.1.90 consolidation: every correlated variation of the platform adapter contract, its implementations and the target matrix interned in this one file, so the module family carries one surface without duplicate variations.
 * The correlation is the platform runtime family: platformadapter holds the adapter contract every platform primitive flows through (the storage, clock, logger and fetch adapters with the node, browser and deno default compositions, the shared adapter registry on the global symbol registry so the esm and cjs modes of one process share one active adapter, and the bundle stamp of the running dist target); runtimeadapters holds the implementations the contract composes (the filesystem, chrome storage, deno kv and in-memory storage mappings, the capability probe table, the adapter declarations and the worker, dom and fetch shells with their feature downgrades); and platformtargets holds the target matrix that verifies every platform target against the adapter mappings with its minified output budget.
 * No binding is ever hardcoded: every node, deno and browser primitive arrives injected through the seam so the neutral and browser bundles never carry a platform import, and no adapter ever bypasses the human review.
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
import { packageversion } from "./version.js";

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

/** Reads the stamp of the running bundle with the package version: one function answers the version, the consumption mode and the dist target of the bundle the caller loaded. Example: `bundlestamp().mode` answers `cjs` inside dist/index.cjs. */
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
