/**
 * The environments module of the 1.1.90 consolidation: every correlated variation of the execution environment, emulation and sandbox rendering logic interned in this one file, so the module family carries one surface without duplicate variations.
 * The correlation is the execution environment family: environments holds the base grammar (the per kind requirement table, the executor registry, the offscreen document lifecycle with its worker pool plan, the executor traffic envelopes and the isolated world injection of reviewed arguments); emulation stacks the device, network, location, agent and permission presets as revertible layers with the blackbox rules that hide the stack frames of the host page; and sandboxframe renders the untrusted markup of a reviewed step inside the sandboxed page with scripts, schemes and handlers stripped before render and the result posted back through a per render nonce.
 * No pool size, preset, retention or posture is ever hardcoded: every interval, ceiling and grant stays the user's choice, and no environment ever bypasses the human review.
 */

import type {
  actionkind,
  environmentkind,
  environmentrequirement,
  offscreenregistryentry,
  toolstep,
  workerrequest,
  workerresponse,
} from "./types.js";

/**
 * Execution environment logic of the 1.1.60 family.
 * Correlated rules for the environment grammar live here: the per kind requirement table (the live page, the isolated world of the scripting api, the offscreen document worker pool and the sandboxed frame), the executor registry that maps every environmentkind to its runtime adapter, the offscreen document lifecycle with its spawn on first use, reuse across the steps of one run and close at completion, the worker pool plan that grows and shrinks with the pending parse queue, the executor traffic envelopes with their transferable plan and partial streaming, and the isolated world injection that carries reviewed arguments only.
 * No pool size, interval, reason list or environment posture is ever hardcoded: the user choices drive every decision, the capability gate keeps offscreenworker behind the optional offscreen grant with an inline fallback, and no environment ever bypasses the human review.
 */

/** The parse heavy read kinds the offscreen worker pool may take over: large html snapshots, network json payloads, table row reductions, accessibility tree shaping, complex selector evaluation and screenshot stitching. */
const offloadfamilies: ReadonlyArray<{ task: string; kinds: readonly string[] }> = [
  { task: "htmlsnapshot", kinds: ["readhtml", "parsehtml", "readertree", "readoutline", "classifypage"] },
  { task: "jsonpayload", kinds: ["readjson", "parsejson"] },
  { task: "tablerows", kinds: ["readtable", "scrapetable", "detecttables", "deduperows", "transformvalues"] },
  { task: "a11ytree", kinds: ["a11ytree"] },
  { task: "complexselector", kinds: ["resolvexpath", "deriveselector", "detectvirtual"] },
  { task: "stitchshots", kinds: ["contactsheet", "timelapse", "makethumbs"] },
];

/** Reads the parse family of one offload eligible kind; a kind outside the families returns undefined. */
export function offfamilyof(kind: actionkind): string | undefined {
  return offloadfamilies.find((family) => family.kinds.includes(kind))?.task;
}

/** Reads the environments one action kind may run in: evaluate runs in the isolated world only, a step carrying untrusted markup renders inside the sandboxframe only, the parse heavy kinds may offload into the offscreen worker pool beside the live page and every other kind keeps the pagecontext of the page bridge. */
export function environmentsof(step: Pick<toolstep, "kind" | "options">): environmentkind[] {
  if (markuprenderstep(step)) return ["sandboxframe"];
  if (step.kind === "evaluate") return ["isolatedworld"];
  if (offfamilyof(step.kind) !== undefined) return ["pagecontext", "offscreenworker"];
  return ["pagecontext"];
}

/** Reads the default environment of one step: the absent environment field routes to the isolated world for evaluate, the sandboxframe for untrusted markup and the pagecontext for everything else including the parse offload candidates until the user turns the offload on. */
export function defaultenvironment(step: Pick<toolstep, "kind" | "options">): environmentkind {
  if (markuprenderstep(step)) return "sandboxframe";
  if (step.kind === "evaluate") return "isolatedworld";
  return "pagecontext";
}

function offamilyeligible(kind: actionkind): boolean {
  return offloadfamilies.some((family) => family.kinds.includes(kind));
}

/** Lists the parse heavy kinds the offscreen worker pool may take over, grouped by their parse family. */
export function offloadkinds(): Array<{ task: string; kinds: string[] }> {
  return offloadfamilies.map((family) => ({ task: family.task, kinds: [...family.kinds] }));
}

/** Reads whether one step carries untrusted markup for rendering: a reviewed options object with a markup string renders inside the sandboxframe only, so the untrusted markup never reenters the page dom. */
export function markuprenderstep(step: Pick<toolstep, "kind" | "options">): boolean {
  if (!step.options) return false;
  try {
    const parsed = JSON.parse(step.options);
    return Boolean(
      parsed &&
        typeof parsed === "object" &&
        !Array.isArray(parsed) &&
        typeof (parsed as Record<string, unknown>).markup === "string" &&
        ((parsed as Record<string, unknown>).markup as string).trim() !== "",
    );
  } catch {
    return false;
  }
}

/** Builds the per kind environment requirement table the policy exposes: one profile per action kind with its allowed environments and its default. */
export function environmentrequirementsof(kinds: actionkind[]): environmentrequirement[] {
  return kinds.map((kind) => {
    const bare: Pick<toolstep, "kind" | "options"> = { kind };
    const environments = environmentsof(bare);
    return { kind, environments, defaultenvironment: defaultenvironment(bare) };
  });
}

/** Maps every environmentkind to its runtime adapter: pagecontext rides the page bridge in the live page, isolatedworld rides the scripting api world page scripts cannot touch, offscreenworker rides the offscreen document worker pool and sandboxframe rides the sandboxed page with no extension privileges. */
export function executorregistry(): Array<{ environment: environmentkind; adapter: string; description: string }> {
  return [
    {
      environment: "pagecontext",
      adapter: "pagebridge",
      description: "The page bridge executes dom actions inside the live page because page events only fire there.",
    },
    {
      environment: "isolatedworld",
      adapter: "scriptingapi",
      description:
        "The scripting api injects step logic inside the isolated world where page globals stay unreachable from step code.",
    },
    {
      environment: "offscreenworker",
      adapter: "offscreendocument",
      description:
        "The offscreen document hosts the worker pool that parses heavy payloads away from the page; the capability gate keeps it behind the optional offscreen grant with an inline fallback.",
    },
    {
      environment: "sandboxframe",
      adapter: "sandboxpage",
      description:
        "The sandboxed page renders untrusted markup with scripts and handlers stripped before render and posts its result back through a per render nonce.",
    },
  ];
}

/** Routes one step to its environment: the reviewed environment field wins when it sits inside the requirement table, the offload toggle moves parse heavy kinds into the offscreen worker pool, and a missing offscreen capability grant falls the step back to inline parsing inside the page instead of refusing the reviewed work. */
export function routeenvironment(
  step: toolstep,
  input: { offload: boolean; granted: boolean },
): { environment: environmentkind; fallback: boolean; reason: string } {
  const allowed = environmentsof(step);
  const named = step.environment;
  if (named !== undefined) {
    if (!allowed.includes(named))
      return {
        environment: defaultenvironment(step),
        fallback: false,
        reason: `The ${named} environment sits outside the ${allowed.join(", ")} the ${step.kind} kind permits, so the executor routes to the ${defaultenvironment(step)} default.`,
      };
    return {
      environment: named,
      fallback: false,
      reason: `The reviewed step names its ${named} environment and the ${step.kind} kind permits it.`,
    };
  }
  if (markuprenderstep(step))
    return {
      environment: "sandboxframe",
      fallback: false,
      reason: `The ${step.kind} step carries untrusted markup, so it renders inside the sandboxframe only.`,
    };
  if (step.kind === "evaluate")
    return {
      environment: "isolatedworld",
      fallback: false,
      reason: "The evaluate kind runs inside the isolated world where page globals stay unreachable from step code.",
    };
  if (offamilyeligible(step.kind)) {
    if (!input.offload)
      return {
        environment: "pagecontext",
        fallback: false,
        reason: `The ${step.kind} step stays inside the page because the user keeps the parse offload off.`,
      };
    if (!input.granted)
      return {
        environment: "pagecontext",
        fallback: true,
        reason: `The ${step.kind} step falls back to inline parsing inside the page because the offscreen capability grant stays absent.`,
      };
    return {
      environment: "offscreenworker",
      fallback: false,
      reason: `The ${step.kind} step offloads into the offscreen worker pool under the granted capability.`,
    };
  }
  return {
    environment: "pagecontext",
    fallback: false,
    reason: `The ${step.kind} step keeps the pagecontext because page events only fire inside the live page.`,
  };
}

/** Builds one executor traffic envelope for the offscreen worker pool: the parse family of the kind, the payload reference and the transferable keys the payload carries. */
export function workerrequestof(input: {
  id: string;
  runid: string;
  stepid: string;
  kind: actionkind;
  payload: string;
  options?: Record<string, unknown>;
  sentat: number;
}): workerrequest {
  const task = offfamilyof(input.kind);
  if (task === undefined) throw new Error(`The ${input.kind} kind stays outside the offscreen worker pool families.`);
  if (input.payload.trim() === "") throw new Error("The worker request needs its payload reference.");
  return {
    id: input.id,
    runid: input.runid,
    stepid: input.stepid,
    task,
    payload: input.payload,
    transferables: transferablekeys(input.options ?? {}),
    sentat: input.sentat,
  };
}

/** Reads the payload keys the executor moves as transferable buffers where possible: every ArrayBuffer value travels as a transferable so the worker owns its bytes without a copy. */
export function transferablekeys(options: Record<string, unknown>): string[] {
  return Object.keys(options).filter((key) => options[key] instanceof ArrayBuffer);
}

/** Builds one worker answer to the executor: the finished result or one streamed partial chunk with its sequence number. */
export function workerresponseof(input: {
  id: string;
  requestid: string;
  ok: boolean;
  result?: string;
  partial?: number;
  summary: string;
  receivedat: number;
}): workerresponse {
  if (input.summary.trim() === "") throw new Error("The worker answer needs its summary in plain language.");
  return {
    id: input.id,
    requestid: input.requestid,
    ok: input.ok,
    ...(input.result !== undefined ? { result: input.result } : {}),
    ...(input.partial !== undefined ? { partial: input.partial } : {}),
    summary: input.summary,
    receivedat: input.receivedat,
  };
}

/** Reads one worker answer: a partial chunk streams on while the final answer without a partial sequence completes the request, and a failed answer refuses without a result. */
export function acceptworkerresponse(response: workerresponse): {
  done: boolean;
  partial: boolean;
  result?: string;
  reason: string;
} {
  if (!response.ok)
    return {
      done: true,
      partial: false,
      reason: `The worker refused the request ${response.requestid}: ${response.summary}`,
    };
  if (response.partial !== undefined)
    return {
      done: false,
      partial: true,
      reason: `The partial ${response.partial} of the request ${response.requestid} streams back to the executor.`,
    };
  return {
    done: true,
    partial: false,
    ...(response.result !== undefined ? { result: response.result } : {}),
    reason: `The request ${response.requestid} completed inside the offscreen worker pool.`,
  };
}

/** Plans the worker pool against the pending parse queue: the pool grows with the pending parses and shrinks with the idle workers, a user configured size pins the pool with no engine cap, and an absent size lets the queue alone decide. */
export function poolplan(input: { pending: number; current: number; size?: number }): {
  workers: number;
  added: number;
  retired: number;
  reason: string;
} {
  if (input.size !== undefined) {
    if (!Number.isFinite(input.size) || input.size < 1 || !Number.isInteger(input.size))
      return {
        workers: input.current,
        added: 0,
        retired: 0,
        reason:
          "The configured pool size stays a positive whole number the user chose; the pool keeps its current workers.",
      };
    const target = input.size;
    if (target > input.current)
      return {
        workers: target,
        added: target - input.current,
        retired: 0,
        reason: `The user configured pool size ${target} adds ${target - input.current} worker${target - input.current === 1 ? "" : "s"} to the pool.`,
      };
    if (target < input.current)
      return {
        workers: target,
        added: 0,
        retired: input.current - target,
        reason: `The user configured pool size ${target} retires ${input.current - target} worker${input.current - target === 1 ? "" : "s"} from the pool.`,
      };
    return {
      workers: target,
      added: 0,
      retired: 0,
      reason: `The pool holds the ${target} workers the user configured.`,
    };
  }
  if (input.pending > input.current)
    return {
      workers: input.pending,
      added: input.pending - input.current,
      retired: 0,
      reason: `The ${input.pending} pending parses grow the pool by ${input.pending - input.current} worker${input.pending - input.current === 1 ? "" : "s"}; no engine cap exists.`,
    };
  if (input.current > input.pending)
    return {
      workers: input.pending,
      added: 0,
      retired: input.current - input.pending,
      reason: `The ${input.current - input.pending} idle worker${input.current - input.pending === 1 ? "" : "s"} retire down to the ${input.pending} pending parse${input.pending === 1 ? "" : "s"}.`,
    };
  return {
    workers: input.current,
    added: 0,
    retired: 0,
    reason: `The ${input.current} workers match the ${input.pending} pending parses; the pool stays unchanged.`,
  };
}

/** Spawns the offscreen document of one run on first use and reuses the same document across the steps of the run: a registry entry already open for the run carries on while the first need records its reasons and justification. */
export function openoffscreen(input: {
  registry: offscreenregistryentry[];
  document: string;
  runid: string;
  reasons: string[];
  justification: string;
  now: number;
}): { registry: offscreenregistryentry[]; entry: offscreenregistryentry; reused: boolean } {
  if (input.document.trim() === "") throw new Error("The offscreen document needs its user configured path.");
  if (input.reasons.length === 0) throw new Error("The offscreen document needs the reasons the user reviewed.");
  if (input.justification.trim() === "")
    throw new Error("The offscreen document needs its justification in plain language.");
  const open = input.registry.find((entry) => entry.runid === input.runid && entry.closedat === undefined);
  if (open) return { registry: input.registry, entry: open, reused: true };
  const entry: offscreenregistryentry = {
    document: input.document,
    runid: input.runid,
    reasons: [...input.reasons],
    justification: input.justification,
    createdat: input.now,
  };
  return { registry: [entry, ...input.registry], entry, reused: false };
}

/** Closes the offscreen document of one run when the run completes: the registry entry records its close time so the audit reads every spawn with its teardown. */
export function closeoffscreen(
  registry: offscreenregistryentry[],
  runid: string,
  now: number,
): { registry: offscreenregistryentry[]; closed: boolean } {
  const open = registry.find((entry) => entry.runid === runid && entry.closedat === undefined);
  if (!open) return { registry, closed: false };
  return { registry: registry.map((entry) => (entry === open ? { ...entry, closedat: now } : entry)), closed: true };
}

/** Builds the isolated world injection of one evaluate step: the scripting api injects the reviewed code inside the isolated world where page globals stay unreachable from step code, and the injection carries reviewed arguments only. */
export function isolatedinjection(step: toolstep): { world: "ISOLATED"; code: string; args: string[] } {
  if (step.kind !== "evaluate") throw new Error("The isolated world injection serves the evaluate kind only.");
  if (!step.value || step.value.trim() === "") throw new Error("The evaluate step needs its reviewed expression.");
  let args: string[] = [];
  if (step.options) {
    try {
      const parsed = JSON.parse(step.options);
      if (Array.isArray(parsed)) args = parsed.filter((item) => typeof item === "string") as string[];
    } catch {
      /* an options object outside the reviewed argument list stays empty */
    }
  }
  return { world: "ISOLATED", code: step.value, args };
}

/** The runsummary task family of the 1.1.63 session interface: the distillation of a completed run runs as one offscreen worker task beside the parse families. */
export const runsummarytask = "runsummary";

/** Builds the offscreen worker request of one runsummary distillation: the task family name, the run and session provenance and the distilled payload reference; the step id slot carries the session id because the distillation belongs to the whole run. */
export function summaryrequestof(input: {
  id: string;
  runid: string;
  sessionid: string;
  payload: string;
  sentat: number;
}): workerrequest {
  if (input.payload.trim() === "") throw new Error("The runsummary request needs its payload reference.");
  return {
    id: input.id,
    runid: input.runid,
    stepid: input.sessionid,
    task: runsummarytask,
    payload: input.payload,
    transferables: [],
    sentat: input.sentat,
  };
}

/* ── Merged from emulation.ts ── */
import type {
  agentpreset,
  blackboxrule,
  devicepreset,
  emulationlayer,
  emulationstate,
  locationconsent,
  locationpreset,
  networkpreset,
  permissiongrant,
  permissionstate,
  presetlibrary,
  stackframe,
} from "./types.js";

/**
 * Emulation layer engine for the 1.1.48 family.
 * Every correlated rule for the reviewed masks of the run lives in this file: the preset normalizers of the user curated device, network, location and agent libraries, the reviewed revert plan grammar, the layer apply and revert math with prior state capture and reverse order restore, the stacking conflict order where the last applied layer wins, the latitude, longitude and user agent grammars, the browser permission set, the blackbox pattern matching that hides third party frames from stack traces, the retention expiry of reverted layer states and the versioned preset library import and export.
 * True device metric, network condition, geolocation and user agent override needs browser debugger or platform permissions that the manifest gate forbids, so every layer applies page-injected overrides through the scripting api and shapes only the traffic the extension itself initiates; the derivation is recorded on every layer instead of hidden.
 */

/** The emulation kinds of the 1.1.48 family, listed among the available capabilities of every proposal request. */
export const emulationkinds: string[] = [
  "emulatedevice",
  "emulatenetwork",
  "emulatelocate",
  "setuseragent",
  "overridepermission",
  "blackboxscripts",
];

/** The reviewed browser permission set of the override grammar; overrides outside this set are refused. */
export const browserpermissions: string[] = [
  "geolocation",
  "notifications",
  "camera",
  "microphone",
  "clipboard-read",
  "clipboard-write",
  "midi",
  "persistent-storage",
];

/** The reviewed permission states of an override: granted, denied or the browser default prompt. */
export const permissionstates: permissionstate[] = ["granted", "denied", "prompt"];

/** The emulation family of one emulation action kind. */
export function familyofkind(
  kind: string,
): "device" | "network" | "location" | "agent" | "permission" | "blackbox" | undefined {
  if (kind === "emulatedevice") return "device";
  if (kind === "emulatenetwork") return "network";
  if (kind === "emulatelocate") return "location";
  if (kind === "setuseragent") return "agent";
  if (kind === "overridepermission") return "permission";
  if (kind === "blackboxscripts") return "blackbox";
  return undefined;
}

/** Normalizes one user curated device preset: the name, width, height, pixel ratio and the mobile flag with every bound a user choice only. */
export function devicepresetof(value: unknown): devicepreset | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  const entry = value as Record<string, unknown>;
  const name = typeof entry.name === "string" && entry.name.trim() ? entry.name.trim() : undefined;
  const width =
    typeof entry.width === "number" && Number.isInteger(entry.width) && entry.width > 0 ? entry.width : undefined;
  const height =
    typeof entry.height === "number" && Number.isInteger(entry.height) && entry.height > 0 ? entry.height : undefined;
  const pixelratio =
    typeof entry.pixelratio === "number" && Number.isFinite(entry.pixelratio) && entry.pixelratio > 0
      ? entry.pixelratio
      : undefined;
  if (name === undefined || width === undefined || height === undefined || pixelratio === undefined) return undefined;
  return { name, width, height, pixelratio, mobile: entry.mobile === true };
}

/** Normalizes one user curated network preset: the name, latency, download and upload bounds and the offline flag. */
export function networkpresetof(value: unknown): networkpreset | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  const entry = value as Record<string, unknown>;
  const name = typeof entry.name === "string" && entry.name.trim() ? entry.name.trim() : undefined;
  const latency =
    typeof entry.latency === "number" && Number.isFinite(entry.latency) && entry.latency >= 0
      ? entry.latency
      : undefined;
  const download =
    typeof entry.download === "number" && Number.isFinite(entry.download) && entry.download >= 0
      ? entry.download
      : undefined;
  const upload =
    typeof entry.upload === "number" && Number.isFinite(entry.upload) && entry.upload >= 0 ? entry.upload : undefined;
  if (name === undefined || latency === undefined || download === undefined || upload === undefined) return undefined;
  return { name, latency, download, upload, offline: entry.offline === true };
}

/** Normalizes one user curated location preset: the name, the latitude and longitude inside the reviewed ranges and the non-negative accuracy radius. */
export function locationpresetof(value: unknown): locationpreset | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  const entry = value as Record<string, unknown>;
  const name = typeof entry.name === "string" && entry.name.trim() ? entry.name.trim() : undefined;
  const latitude = typeof entry.latitude === "number" && Number.isFinite(entry.latitude) ? entry.latitude : undefined;
  const longitude =
    typeof entry.longitude === "number" && Number.isFinite(entry.longitude) ? entry.longitude : undefined;
  const accuracy =
    typeof entry.accuracy === "number" && Number.isFinite(entry.accuracy) && entry.accuracy >= 0
      ? entry.accuracy
      : undefined;
  if (name === undefined || latitude === undefined || longitude === undefined || accuracy === undefined)
    return undefined;
  if (!locationrangevalid(latitude, longitude)) return undefined;
  return { name, latitude, longitude, accuracy };
}

/** Normalizes one user curated agent preset: the user agent string of the reviewed grammar, the platform and the non-empty brand list reported together. */
export function agentpresetof(value: unknown): agentpreset | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  const entry = value as Record<string, unknown>;
  const name = typeof entry.name === "string" && entry.name.trim() ? entry.name.trim() : undefined;
  const useragent = typeof entry.useragent === "string" ? entry.useragent : undefined;
  const platform = typeof entry.platform === "string" && entry.platform.trim() ? entry.platform.trim() : undefined;
  const brands = Array.isArray(entry.brands)
    ? entry.brands.filter((brand): brand is string => typeof brand === "string" && brand.trim().length > 0)
    : [];
  if (name === undefined || useragent === undefined || platform === undefined || brands.length === 0) return undefined;
  if (!agentgrammarvalid(useragent)) return undefined;
  return { name, useragent, platform, brands: [...new Set(brands)] };
}

/** Normalizes one reviewed permission override: the name of the reviewed browser permission set, the state of the reviewed permission states and the run scope flag. */
export function permissiongrantof(value: unknown): permissiongrant | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  const entry = value as Record<string, unknown>;
  const name = typeof entry.name === "string" && browserpermissions.includes(entry.name) ? entry.name : undefined;
  const state =
    typeof entry.state === "string" && permissionstates.includes(entry.state as permissionstate)
      ? (entry.state as permissionstate)
      : undefined;
  if (name === undefined || state === undefined) return undefined;
  return { name, state, runscope: entry.runscope !== false };
}

/** Normalizes one reviewed blackbox rule: a non-empty url pattern list where every pattern names its origin explicitly and the trace scope of profiles, traces or both. */
export function blackboxruleof(value: unknown): blackboxrule | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  const entry = value as Record<string, unknown>;
  const urlpatterns = Array.isArray(entry.urlpatterns)
    ? entry.urlpatterns.filter(
        (pattern): pattern is string => typeof pattern === "string" && /^https:\/\//.test(pattern),
      )
    : [];
  const tracescope = entry.tracescope;
  if (urlpatterns.length === 0) return undefined;
  if (tracescope !== "profiles" && tracescope !== "traces" && tracescope !== "both") return undefined;
  return { urlpatterns: [...new Set(urlpatterns)], tracescope };
}

/** Normalizes one reviewed revert plan: a non-empty ordered list of revert steps kept beside its layer; plans without steps are refused. */
export function revertplanof(value: unknown): string[] | undefined {
  const steps = Array.isArray(value)
    ? value.filter((step): step is string => typeof step === "string" && step.trim().length > 0)
    : [];
  return steps.length > 0 ? steps : undefined;
}

/** Builds one emulation layer record with its origin scope, apply time, captured prior state and reviewed revert plan. */
export function newlayer(input: {
  id: string;
  runid: string;
  stepid: string;
  family: emulationlayer["family"];
  name: string;
  originscope: string;
  revertplan: string[];
  prior?: Record<string, unknown>;
  at: number;
}): emulationlayer {
  return {
    id: input.id,
    runid: input.runid,
    stepid: input.stepid,
    family: input.family,
    name: input.name,
    originscope: input.originscope,
    appliedat: input.at,
    ...(input.prior !== undefined ? { prior: input.prior } : {}),
    revertplan: [...input.revertplan],
  };
}

/** Builds the initial emulation state of one run scoped to its tab and origin. */
export function emulationstateof(input: { runid: string; tabid: number; origin: string; now: number }): emulationstate {
  return { runid: input.runid, tabid: input.tabid, origin: input.origin, layers: [], updatedat: input.now };
}

/** Stacks one layer onto the emulation state in apply order: a second layer of the same family replaces the first in effect while both stay in the history, so the last applied layer wins conflicts. */
export function applylayer(state: emulationstate, layer: emulationlayer, at: number): emulationstate {
  const layers = [...state.layers.filter((item) => item.id !== layer.id), layer];
  return { ...state, layers, updatedat: at };
}

/** Reverts one layer of the state by its id: the revert time stamps the record while the layer history survives for review. */
export function revertlayer(state: emulationstate, layerid: string, at: number): emulationstate {
  const layers = state.layers.map((layer) =>
    layer.id === layerid && layer.revertedat === undefined ? { ...layer, revertedat: at } : layer,
  );
  return { ...state, layers, updatedat: at };
}

/** Reverts every active layer of the state in reverse apply order: the reversed list is the exact restore sequence and every layer keeps its revert stamp. */
export function revertalllayers(
  state: emulationstate,
  at: number,
): { state: emulationstate; reverted: emulationlayer[] } {
  const reverted = [...state.layers].reverse().filter((layer) => layer.revertedat === undefined);
  const layers = state.layers.map((layer) => (layer.revertedat === undefined ? { ...layer, revertedat: at } : layer));
  return { state: { ...state, layers, updatedat: at }, reverted };
}

/** Returns the active layers of the state in apply order. */
export function activelayers(state: emulationstate | undefined): emulationlayer[] {
  return state ? state.layers.filter((layer) => layer.revertedat === undefined) : [];
}

/** Returns the names of the active layers for the response envelope and the review panel. */
export function layernames(state: emulationstate | undefined): string[] {
  return activelayers(state).map((layer) => layer.name);
}

/** Counts the active layers of one family so the panel can warn when layers stack on one tab. */
export function stackedcount(state: emulationstate | undefined): number {
  return activelayers(state).length;
}

/** True when the reviewed latitude stays inside the -90 to 90 degree range and the longitude inside the -180 to 180 degree range. */
export function locationrangevalid(latitude: number, longitude: number): boolean {
  return (
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
  );
}

/** Validates one user agent string against the reviewed grammar: tokens of word characters, separators, slashes, spaces, numbers and version dots; the string must carry at least one token pair and refuse line breaks. */
export function agentgrammarvalid(useragent: string): boolean {
  const text = useragent.trim();
  if (text.length === 0 || text.length > 512) return false;
  if (/[\r\n]/.test(text)) return false;
  if (!/^[A-Za-z0-9][A-Za-z0-9._+\-()/:; ,]*$/.test(text)) return false;
  return /\/\d/.test(text) || /\d+\.\d+/.test(text);
}

/** Grades one reviewed permission name by its power: location, camera, microphone and notification overrides carry the user's most sensitive signals and stay the highest grade. */
export function permissiongrade(name: string): "powerful" | "standard" {
  return name === "geolocation" || name === "camera" || name === "microphone" || name === "notifications"
    ? "powerful"
    : "standard";
}

/** Matches one script url against a reviewed blackbox pattern of an explicit https origin with single star segments and double star subtrees. */
export function blackboxmatches(urlpattern: string, url: string): boolean {
  const patternmatch = /^(https:\/\/[^/]+)(\/.*)?$/.exec(urlpattern);
  const urlmatch = /^(https:\/\/[^/]+)(\/.*)?$/.exec(url);
  if (!patternmatch || !urlmatch) return false;
  if (patternmatch[1] !== urlmatch[1]) return false;
  const patternpath = (patternmatch[2] ?? "/").split("/").filter((segment) => segment.length > 0);
  const urlpath = (urlmatch[2] ?? "/").split("/").filter((segment) => segment.length > 0);
  const walk = (patternindex: number, urlindex: number): boolean => {
    if (patternindex >= patternpath.length) return urlindex >= urlpath.length;
    const segment = patternpath[patternindex];
    if (segment === undefined) return false;
    if (segment === "**")
      return walk(patternindex + 1, urlindex) || (urlindex < urlpath.length && walk(patternindex, urlindex + 1));
    if (urlindex >= urlpath.length) return false;
    if (segment !== "*" && segment !== urlpath[urlindex]) return false;
    return walk(patternindex + 1, urlindex + 1);
  };
  return walk(0, 0);
}

/** Hides blackboxed frames from one stack trace: every frame whose url matches a rule pattern with a traces scope of traces or both is dropped so third party frames never enter the shaped trace. */
export function hideblackboxedframes(rules: blackboxrule[], frames: stackframe[]): stackframe[] {
  const patterns = rules
    .filter((rule) => rule.tracescope === "traces" || rule.tracescope === "both")
    .flatMap((rule) => rule.urlpatterns);
  if (patterns.length === 0) return frames;
  return frames.filter((frame) => !patterns.some((pattern) => blackboxmatches(pattern, frame.url)));
}

/** Marks one url as blackboxed when any rule with a profiles or both trace scope matches it, so the trace shaping lists the hidden third party urls. */
export function blackboxedurls(rules: blackboxrule[], urls: string[]): string[] {
  const patterns = rules.flatMap((rule) => rule.urlpatterns);
  return urls.filter((url) => patterns.some((pattern) => blackboxmatches(pattern, url)));
}

/** Expires the prior states of reverted layers after the retention window while the layer history itself always survives; an absent window keeps every prior state. */
export function expirelayers(state: emulationstate, retention: number | undefined, now: number): emulationstate {
  if (retention === undefined) return state;
  const layers = state.layers.map((layer) => {
    if (layer.revertedat === undefined || layer.prior === undefined || layer.priorexpired === true) return layer;
    if (now - layer.revertedat <= retention) return layer;
    const { prior, ...metadata } = layer;
    void prior;
    return { ...metadata, priorexpired: true };
  });
  return { ...state, layers, updatedat: now };
}

/** Builds one shareable preset library file of the user curated presets; the version carries the library contract for imports through review. */
export function exportpresetlibrary(input: {
  devices: devicepreset[];
  networks: networkpreset[];
  locations: locationpreset[];
  agents: agentpreset[];
  now: number;
}): presetlibrary {
  return {
    version: 1,
    devices: [...input.devices],
    networks: [...input.networks],
    locations: [...input.locations],
    agents: [...input.agents],
    exportedat: input.now,
  };
}

/** Parses one reviewed preset library file: every preset entry must pass its normalizer and a file without any valid preset is refused; unknown fields stay ignored. */
export function importpresetlibrary(value: unknown): presetlibrary | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  const entry = value as Record<string, unknown>;
  const devices = (Array.isArray(entry.devices) ? entry.devices : []).flatMap((preset) => {
    const parsed = devicepresetof(preset);
    return parsed !== undefined ? [parsed] : [];
  });
  const networks = (Array.isArray(entry.networks) ? entry.networks : []).flatMap((preset) => {
    const parsed = networkpresetof(preset);
    return parsed !== undefined ? [parsed] : [];
  });
  const locations = (Array.isArray(entry.locations) ? entry.locations : []).flatMap((preset) => {
    const parsed = locationpresetof(preset);
    return parsed !== undefined ? [parsed] : [];
  });
  const agents = (Array.isArray(entry.agents) ? entry.agents : []).flatMap((preset) => {
    const parsed = agentpresetof(preset);
    return parsed !== undefined ? [parsed] : [];
  });
  if (devices.length + networks.length + locations.length + agents.length === 0) return undefined;
  return {
    version:
      typeof entry.version === "number" && Number.isInteger(entry.version) && entry.version >= 1 ? entry.version : 1,
    devices,
    networks,
    locations,
    agents,
    exportedat: typeof entry.exportedat === "number" ? entry.exportedat : Date.now(),
  };
}

/** True when one approved location consent of that origin covers the reviewed coordinates; the prompt shows the exact latitude and longitude before the override applies. */
export function locationconsentcovers(
  origin: string,
  latitude: number,
  longitude: number,
  consents: locationconsent[],
): boolean {
  return consents.some(
    (consent) =>
      consent.origin === origin &&
      consent.approved === true &&
      consent.revokedat === undefined &&
      consent.latitude === latitude &&
      consent.longitude === longitude,
  );
}

/* ── Merged from sandboxframe.ts ── */
import type { environmentprovenance, sandboxrender, sandboxrenderresult } from "./types.js";

/**
 * Sandbox frame logic of the 1.1.60 family.
 * Correlated rules for untrusted markup live here: the render descriptor with its per render nonce, the stripping of scripts and event handlers before any render, the postmessage envelope the sandboxed page answers through, the nonce checked acceptance of every render result and the provenance each render records with its source origin.
 * The sandboxed page carries no extension privileges: a render result never reenters the dom outside the frame, and the untrusted markup never touches the page the session granted.
 */

/** Strips every script and event handler from untrusted markup before render through one linear character scan, because a replace chain over reassembled payloads (`<scr<script>ipt>` or `javajavascript:script:`) reads as incomplete sanitization to static analysis even inside a convergence loop. The scan rebuilds the markup instead of removing fragments from it: a well formed tag keeps its name and its safe attributes with the script url schemes stripped from the values, every `on` event handler attribute drops, a script element drops with its whole content through the closing tag, and a malformed tag whose body carries another open angle (the reassembly payloads live on) drops entirely so no `<script` or `on...=` sequence ever survives into the sanitized output. */
export function stripscripts(markup: string): string {
  let out = "";
  let index = 0;
  while (index < markup.length) {
    const open = markup.indexOf("<", index);
    if (open === -1) {
      out += markup.slice(index);
      break;
    }
    out += markup.slice(index, open);
    const close = markup.indexOf(">", open);
    if (close === -1) {
      index = markup.length;
      break;
    } /* an unterminated tag fragment never renders */
    const body = markup.slice(open + 1, close);
    if (body.includes("<")) {
      index = close + 1;
      continue;
    } /* a reassembled payload drops as a whole */
    const namematch = /^\/?\s*([a-zA-Z][a-zA-Z0-9:-]*)/.exec(body);
    const name = (namematch?.[1] ?? "").toLowerCase();
    if (name === "script") {
      if (body.startsWith("/") || body.endsWith("/")) {
        index = close + 1;
        continue;
      } /* a closing or self closing script tag drops alone */
      const rest = markup.slice(close + 1).toLowerCase();
      const end = rest.indexOf("</script");
      if (end === -1) {
        index = markup.length;
        break;
      } /* an unterminated script element swallows the rest */
      const endclose = markup.indexOf(">", close + 1 + end);
      index = endclose === -1 ? markup.length : endclose + 1;
      continue;
    }
    out += rebuildtag(name, body);
    index = close + 1;
  }
  return out.trim();
}

/** Rebuilds one tag with its event handler attributes dropped and its script url schemes stripped: the name keeps its letter case, every kept attribute re-renders with double quoted values, and a non element tag (a comment or a doctype) passes through verbatim because its body already carries no open angle. */
function rebuildtag(name: string, body: string): string {
  if (name === "") return `<${body}>`;
  if (body.startsWith("/")) return `</${name}>`;
  const kept: string[] = [];
  let cursor = namelengthof(body);
  while (cursor < body.length) {
    while (cursor < body.length && /\s/.test(charof(body, cursor))) cursor += 1;
    if (cursor >= body.length) break;
    const attrstart = cursor;
    while (cursor < body.length && !/\s/.test(charof(body, cursor)) && charof(body, cursor) !== "=") cursor += 1;
    const attrname = body.slice(attrstart, cursor).toLowerCase();
    if (attrname.startsWith("on") && attrname.length > 2) {
      cursor = skipattribute(body, cursor);
      continue;
    }
    if (charof(body, cursor) !== "=") {
      kept.push(attrname);
      continue;
    }
    cursor += 1;
    const quote = charof(body, cursor);
    if (quote === '"' || quote === "'") {
      cursor += 1;
      const valueend = body.indexOf(quote, cursor);
      const value = stripschemes(body.slice(cursor, valueend === -1 ? body.length : valueend));
      cursor = valueend === -1 ? body.length : valueend + 1;
      kept.push(`${attrname}="${value}"`);
      continue;
    }
    const valuestart = cursor;
    while (cursor < body.length && !/\s/.test(charof(body, cursor))) cursor += 1;
    kept.push(`${attrname}="${stripschemes(body.slice(valuestart, cursor))}"`);
  }
  return kept.length === 0 ? `<${name}>` : `<${name} ${kept.join(" ")}>`;
}

/** Reads one character of a body safely: an out of bounds position answers the empty string so the strict index access never surfaces undefined. */
function charof(text: string, at: number): string {
  return at >= 0 && at < text.length ? text[at]! : "";
}

/** Reads the length of the tag name the body starts with: the attribute walk starts right after it. */
function namelengthof(body: string): number {
  const match = /^[a-zA-Z][a-zA-Z0-9:-]*/.exec(body);
  return match === null ? 0 : match[0].length;
}

/** Advances past one attribute value (a quoted or bare run) so a dropped event handler leaves nothing behind: the function answers the cursor after the value. */
function skipattribute(body: string, cursor: number): number {
  if (charof(body, cursor) !== "=") return cursor;
  const at = cursor + 1;
  const quote = charof(body, at);
  if (quote === '"' || quote === "'") {
    const valueend = body.indexOf(quote, at + 1);
    return valueend === -1 ? body.length : valueend + 1;
  }
  let bare = at;
  while (bare < body.length && !/\s/.test(charof(body, bare))) bare += 1;
  return bare;
}

/** Strips the script url schemes from one attribute value through plain index finds, so no regular expression runs over untrusted text anywhere in the sanitizer. */
function stripschemes(value: string): string {
  let out = value;
  for (const scheme of ["javascript:", "vbscript:", "data:"]) {
    let at = out.toLowerCase().indexOf(scheme);
    while (at >= 0) {
      out = out.slice(0, at) + out.slice(at + scheme.length);
      at = out.toLowerCase().indexOf(scheme);
    }
  }
  return out;
}

/** Strips every tag from a render result text through a single linear scan: an open angle starts a tag that runs to the next close angle or, when no close angle follows, to the end of the text, so an unclosed fragment never survives into the result. */
function striptags(text: string): string {
  let out = "";
  let index = 0;
  while (index < text.length) {
    const open = text.indexOf("<", index);
    if (open === -1) {
      out += text.slice(index);
      break;
    }
    out += text.slice(index, open);
    const close = text.indexOf(">", open);
    if (close === -1) break;
    index = close + 1;
  }
  return out;
}

/** Issues the per render nonce of one sandbox render: every message the sandboxed page answers carries the nonce of exactly one render so a stale or replayed message never passes. */
export function nonceof(seed: string): string {
  const alphabet = "abcdefghijklmnopqrstuvwxyz0123456789";
  let hash = 0;
  for (let index = 0; index < seed.length; index += 1) hash = (hash * 31 + seed.charCodeAt(index)) >>> 0;
  let nonce = "";
  let state = hash === 0 ? 0x9e3779b9 : hash;
  for (let index = 0; index < 16; index += 1) {
    state = (state * 1664525 + 1013904223) >>> 0;
    nonce += alphabet[state % alphabet.length];
  }
  return nonce;
}

/** Builds one sandbox render descriptor: the sanitized markup, the per render nonce and the source origin of the untrusted markup, ready for the sandboxed page that holds no extension privileges. */
export function sandboxrenderof(input: {
  id: string;
  markup: string;
  sourceorigin: string;
  stepid: string;
  now: number;
}): sandboxrender {
  if (input.markup.trim() === "") throw new Error("The sandbox render needs its untrusted markup.");
  if (input.sourceorigin.trim() === "")
    throw new Error("The sandbox render needs the source origin of its untrusted markup.");
  if (input.stepid.trim() === "") throw new Error("The sandbox render names the reviewed step it renders for.");
  return {
    id: input.id,
    nonce: nonceof(`${input.id}:${input.now}`),
    markup: stripscripts(input.markup),
    sourceorigin: input.sourceorigin,
    stepid: input.stepid,
    renderedat: input.now,
  };
}

/** Builds the postmessage envelope the executor posts into the sandboxed page: the render nonce and the sanitized markup travel together so the frame answers with the same nonce only. */
export function rendermessage(render: sandboxrender): { channel: string; type: string; nonce: string; markup: string } {
  return { channel: "devthinksandbox", type: "render", nonce: render.nonce, markup: render.markup };
}

/** Accepts one sandbox render result posted back through postmessage: the nonce must answer exactly one known unanswered render, an unknown, replayed or already answered nonce refuses, and the accepted result stays plain text that never reenters the dom outside the frame. The returned renders carry the answeredat marker of the accepted render so the caller threads the closed render out of its pending set. */
export function acceptrenderresult(input: {
  renders: sandboxrender[];
  message: { channel?: string; type?: string; nonce?: string; ok?: boolean; text?: string; summary?: string };
  now: number;
}): { accepted: boolean; result?: sandboxrenderresult; reason: string; renders: sandboxrender[] } {
  if (input.message.channel !== "devthinksandbox")
    return {
      accepted: false,
      reason: "The sandbox message travels the devthinksandbox channel only.",
      renders: input.renders,
    };
  if (input.message.type !== "renderresult")
    return {
      accepted: false,
      reason: "The sandbox message answers with the renderresult type only.",
      renders: input.renders,
    };
  const render = input.renders.find(
    (entry) => entry.nonce === input.message.nonce && entry.answeredat === undefined && entry.renderedat <= input.now,
  );
  if (!render)
    return {
      accepted: false,
      reason:
        "The sandbox message carries no nonce of a known unanswered render; a stale, replayed or already answered message never passes.",
      renders: input.renders,
    };
  const text = striptags(input.message.text ?? "");
  const result: sandboxrenderresult = {
    nonce: render.nonce,
    ok: input.message.ok !== false,
    text,
    summary:
      input.message.summary?.trim() ||
      `The sandbox frame rendered the markup of the step ${render.stepid} and returned its inert text.`,
    at: input.now,
  };
  const renders = input.renders.map((entry) =>
    entry.nonce === render.nonce ? { ...entry, answeredat: input.now } : entry,
  );
  return {
    accepted: true,
    result,
    reason: `The render result of the step ${render.stepid} answers the nonce of its render; the text stays inside the frame.`,
    renders,
  };
}

/** Reads the provenance of one sandbox render: the source origin, the step and the sandboxframe environment land beside the stored render so the audit reads where every untrusted markup came from. */
export function renderprovenance(render: sandboxrender): environmentprovenance {
  return { origin: render.sourceorigin, stepid: render.stepid, environment: "sandboxframe" };
}
