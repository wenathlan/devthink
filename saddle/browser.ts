/**
 * browser.ts — the transport-neutral virtual-browser contracts of the
 * saddle engine.
 *
 * This file is the v2.0.0 grand-merge consolidation of the former nested
 * folders of the repository (browser, extension) into the single
 * root-level domain file of the saddle family standard: one optimized
 * TypeScript file per correlated domain, ordinal sections, JSDoc on every
 * block, intra-domain imports dissolved, cross-domain imports rewritten to
 * ./<domain>.js. Every capability of every source file is preserved here;
 * the pure re-export barrels (browser/index.ts, extension/index.ts) folded their surface into this file directly.
 *
 * WAVE 2 REGROUPING (the logic-regrouping PR): the Chrome Manifest V3
 * extension surface — the former sections 10-17 (extension/permissions,
 * extension/protocol, extension/content, extension/popup,
 * extension/pagebridge, extension/worker, extension/serviceworker,
 * extension/build) — migrated to devthink/browserextension.ts. The family
 * rule that drove the move: the saddle is EXCLUSIVELY the virtualization
 * engine (VM / sandbox / microVM / the ninety modalities / vGPU / vCPU)
 * and never touches the browser, GPU, CPU or storage of the user — every
 * feature that runs in the user's browser is not a VM modality and
 * belongs to devthink, the owner of the family extension product. What
 * stays here are the engine-side, transport-neutral contracts of the
 * virtual browser (sections 1-9); every extension export keeps its name
 * and signature at the new owner, so nothing is lost and no consumer of
 * this file breaks.
 */

import { executiondecision, executionrequest } from "./isolation.ts";

/* ════════════════════════════════════════════════════════════════════ */
/* Section 1: browser/fingerprint.ts — fingerprint profiles keep session settings coherent without modifying browser internals. */
/* ════════════════════════════════════════════════════════════════════ */
/**
 * fingerprint profiles keep session settings coherent without modifying browser internals.
 */
/** the shape every fingerprint profile carries (the os, platform, browser, locale, timezone, touch flag and device pixel ratio the session settings read). */
type fingerprintprofileshape = { os: string; platform: string; browser: string; locale: string; timezone: string; touch: boolean; devicepixelratio: number };

/** the overrides a caller layers over a profile (any field the shape carries, never a foreign key). */
type fingerprintoverrides = Partial<fingerprintprofileshape>;

const profiles: Readonly<Record<string, fingerprintprofileshape>> = Object.freeze({
  desktopwindows: { os: "windows", platform: "Win32", browser: "chrome", locale: "en-US", timezone: "America/New_York", touch: false, devicepixelratio: 1 },
  desktopmacos: { os: "macos", platform: "MacIntel", browser: "safari", locale: "en-US", timezone: "America/Los_Angeles", touch: false, devicepixelratio: 2 },
  mobileandroid: { os: "android", platform: "Linux armv8l", browser: "chrome", locale: "en-US", timezone: "America/Chicago", touch: true, devicepixelratio: 2.75 }
});

export function fingerprintprofile(name: string = "desktopwindows", overrides: fingerprintoverrides = {}): fingerprintprofileshape & { name: string } { return { ...(profiles[name] ?? profiles.desktopwindows), ...overrides, name }; }
export function fingerprintvalidate(profile: unknown): boolean { const p = profile as Partial<fingerprintprofileshape> | null | undefined; return Boolean(p?.os && p?.platform && p?.browser && p?.locale && p?.timezone && typeof p?.touch === "boolean"); }
export function fingerprintfor(sessionid: string | number, options: { profiles?: string[]; overrides?: fingerprintoverrides } = {}): fingerprintprofileshape & { name: string } { const names = options.profiles ?? Object.keys(profiles); const index = [...String(sessionid)].reduce((sum, value) => sum + value.charCodeAt(0), 0) % names.length; return fingerprintprofile(names[index], options.overrides); }

/* ════════════════════════════════════════════════════════════════════ */
/* Section 2: browser/session.ts — browser sessions bind one fingerprint to one proxy and one event recorder. */
/* ════════════════════════════════════════════════════════════════════ */
/**
 * browser sessions bind one fingerprint to one proxy and one event recorder.
 */

export function browsersession(options: { id?: string; fingerprint?: fingerprintprofileshape & { name: string }; proxy?: { id?: string }; profiles?: string[]; overrides?: fingerprintoverrides } = {}) {
  const id = options.id ?? `browsersession${Date.now().toString(36)}`;
  const fingerprint = options.fingerprint ?? fingerprintfor(id, options);
  if (!fingerprintvalidate(fingerprint)) throw new TypeError("browser fingerprint is incoherent");
  const events: Array<Record<string, unknown>> = [];
  return {
    id,
    fingerprint,
    proxy: options.proxy,
    record(event: { t: number; type: string } & Record<string, unknown>) { if (!event || !Number.isFinite(event.t) || event.t < 0 || typeof event.type !== "string") throw new TypeError("browser event is invalid"); events.push({ ...event }); return event; },
    events() { return events.map((event) => ({ ...event })); },
    manifest() { return { id, fingerprint: { ...fingerprint }, proxy: options.proxy?.id ?? options.proxy, eventcount: events.length }; }
  };
}

/* ════════════════════════════════════════════════════════════════════ */
/* Section 3: browser/actions.ts — browser actions normalize adapter outcomes and preserve failure metadata for agents and replay. */
/* ════════════════════════════════════════════════════════════════════ */
/**
 * browser actions normalize adapter outcomes and preserve failure metadata for agents and replay.
 */

export const browseractions = Object.freeze(["navigate", "click", "type", "fill", "key", "scroll", "upload", "screenshot", "snapshot"]);

/** Creates a stable action result independent of the underlying browser vendor. */
export function actionresult(action: string, options: { startedat?: number; finishedat?: number; tabid?: unknown; frameid?: unknown; snapshotid?: unknown; value?: unknown; metadata?: Record<string, unknown> } = {}) {
  if (!browseractions.includes(action)) throw new TypeError(`unsupported browser action: ${action}`);
  return { version: 1, action, ok: true, startedat: Number(options.startedat ?? Date.now()), finishedat: Number(options.finishedat ?? Date.now()), tabid: options.tabid === undefined ? undefined : String(options.tabid), frameid: options.frameid === undefined ? undefined : String(options.frameid), snapshotid: options.snapshotid, value: options.value, metadata: options.metadata ?? {} };
}

/** Creates a stable action failure without leaking adapter internals or credentials. */
export function actionfailure(action: string, error: unknown, options: { code?: string; retryable?: boolean; tabid?: unknown; frameid?: unknown; snapshotid?: unknown; metadata?: Record<string, unknown> } = {}) {
  const failure = error as { code?: string; message?: string; retryable?: boolean } | null | undefined;
  if (!action || typeof action !== "string") throw new TypeError("browser action failure requires an action name");
  return { version: 1, action, ok: false, code: String(options.code ?? failure?.code ?? "BROWSER_ACTION_FAILED"), message: String(failure?.message ?? error ?? "browser action failed"), retryable: Boolean(options.retryable ?? failure?.retryable), tabid: options.tabid === undefined ? undefined : String(options.tabid), frameid: options.frameid === undefined ? undefined : String(options.frameid), snapshotid: options.snapshotid, metadata: options.metadata ?? {} };
}

/** Executes a bounded list of actions through an injected adapter and keeps per-action outcomes. */
export async function actionbatch(adapter: Record<string, ((input: unknown) => Promise<unknown>) | unknown>, actions: Array<Record<string, unknown>> = [], options: { maxactions?: number; stoponerror?: boolean } = {}) {
  if (!adapter || typeof adapter !== "object") throw new TypeError("browser action batch requires an adapter");
  if (!Array.isArray(actions) || actions.length > (options.maxactions ?? 100)) throw new TypeError("browser action batch is invalid or too large");
  const results: Array<Record<string, unknown>> = [];
  for (const item of actions) {
    const action = String(item?.action ?? "");
    const method = adapter[action];
    if (typeof method !== "function") { results.push(actionfailure(action, new Error(`browser adapter does not support ${action}`), { code: "UNSUPPORTED_ACTION" })); continue; }
    const startedat = Date.now();
    try { const value = await method(item.options ?? item.value); results.push(actionresult(action, { ...item, startedat, finishedat: Date.now(), value })); }
    catch (error) { results.push(actionfailure(action, error, { ...item, tabid: item.tabid, frameid: item.frameid, snapshotid: item.snapshotid })); if (options.stoponerror) break; }
  }
  return results;
}

/* ════════════════════════════════════════════════════════════════════ */
/* Section 4: browser/context.ts — browser context tracks tabs and frames without owning a browser implementation. */
/* ════════════════════════════════════════════════════════════════════ */
/**
 * browser context tracks tabs and frames without owning a browser implementation.
 */

/** Creates a serializable browser context registry for an injected browser adapter. */
export function browsercontext(options: { sessionid?: unknown; activeid?: unknown } = {}) {
  const sessionid = String(options.sessionid ?? `context${Date.now().toString(36)}`);
  const tabs = new Map<string, { id: string; url: string; title: string; active: boolean; frames: Map<string, Record<string, unknown>> }>();
  let activeid: string | undefined = options.activeid === undefined ? undefined : String(options.activeid);

  function opentab(input: { id?: unknown; url?: unknown; title?: unknown; active?: boolean } = {}) {
    const id = String(input.id ?? `tab${tabs.size + 1}`);
    const tab = { id, url: String(input.url ?? "about:blank"), title: String(input.title ?? ""), active: Boolean(input.active), frames: new Map<string, Record<string, unknown>>() };
    tabs.set(id, tab);
    if (tab.active || activeid === undefined) { activeid = id; tab.active = true; }
    return describetab(tab);
  }

  function closetab(id: unknown) {
    const key = String(id);
    if (!tabs.delete(key)) return false;
    if (activeid === key) activeid = tabs.keys().next().value;
    if (activeid && tabs.has(activeid)) tabs.get(activeid)!.active = true;
    return true;
  }

  function setactive(id: unknown) {
    const key = String(id);
    const tab = tabs.get(key);
    if (!tab) throw new Error(`unknown browser tab: ${key}`);
    for (const item of tabs.values()) item.active = false;
    tab.active = true;
    activeid = key;
    return describetab(tab);
  }

  function openframe(tabid: unknown, input: { id?: unknown; url?: unknown; parentid?: unknown; name?: unknown } = {}) {
    const tab = requiretab(tabid);
    const id = String(input.id ?? `frame${tab.frames.size + 1}`);
    tab.frames.set(id, { id, url: String(input.url ?? tab.url), parentid: input.parentid === undefined ? undefined : String(input.parentid), name: String(input.name ?? "") });
    return { ...tab.frames.get(id) };
  }

  function closeframe(tabid: unknown, frameid: unknown) { return Boolean(requiretab(tabid).frames.delete(String(frameid))); }
  function activetab() { return activeid === undefined ? undefined : describetab(requiretab(activeid)); }
  function describe() { return { sessionid, activeid, tabs: [...tabs.values()].map(describetab) }; }

  return { sessionid, opentab, closetab, setactive, openframe, closeframe, activetab, describe };

  function requiretab(id: unknown) { const tab = tabs.get(String(id)); if (!tab) throw new Error(`unknown browser tab: ${id}`); return tab; }
  function describetab(tab: { id: string; url: string; title: string; active: boolean; frames: Map<string, Record<string, unknown>> }) { return { id: tab.id, url: tab.url, title: tab.title, active: tab.active, frames: [...tab.frames.values()].map((frame) => ({ ...frame })) }; }
}

/* ════════════════════════════════════════════════════════════════════ */
/* Section 5: browser/snapshot.ts — browser snapshots turn page state into bounded serializable data with stable references. */
/* ════════════════════════════════════════════════════════════════════ */
/**
 * browser snapshots turn page state into bounded serializable data with stable references.
 */

/** Creates a validated page snapshot for browser, MCP and extension adapters. */
export function pagesnapshot(input: unknown = {}) {
  if (!input || typeof input !== "object") throw new TypeError("page snapshot must be an object");
  const source = input as { snapshotid?: unknown; tabid?: unknown; frameid?: unknown; url?: unknown; title?: unknown; text?: unknown; maxtext?: number; elements?: unknown };
  const snapshot = {
    version: 1,
    snapshotid: String(source.snapshotid ?? `snapshot${Date.now().toString(36)}`),
    tabid: source.tabid === undefined ? undefined : String(source.tabid),
    frameid: source.frameid === undefined ? undefined : String(source.frameid),
    url: String(source.url ?? ""),
    title: String(source.title ?? ""),
    text: String(source.text ?? "").slice(0, source.maxtext ?? 100000),
    elements: normalizeelements(source.elements)
  };
  if (!snapshot.snapshotid || !snapshot.url) throw new TypeError("page snapshot requires snapshotid and url");
  return snapshot;
}

/** Creates an element reference bound to a snapshot and browser context. */
export function snapshotref(snapshot: unknown, input: { ref?: unknown } = {}) {
  const current = pagesnapshot(snapshot);
  const ref = String(input.ref ?? "");
  if (!current.elements.some((element) => element.ref === ref)) throw new TypeError(`snapshot reference not found: ${ref}`);
  return { version: 1, snapshotid: current.snapshotid, tabid: current.tabid, frameid: current.frameid, ref };
}

/** Throws a stable error when an action uses a reference from a previous page state. */
export function assertfreshsnapshot(snapshot: unknown, reference: { snapshotid?: string; tabid?: string; frameid?: string } | null | undefined) {
  const current = pagesnapshot(snapshot);
  if (!reference || reference.snapshotid !== current.snapshotid || (reference.tabid !== undefined && reference.tabid !== current.tabid) || (reference.frameid !== undefined && reference.frameid !== current.frameid)) {
    const error = new Error("browser snapshot is stale") as Error & { code?: string; retryable?: boolean };
    error.code = "STALE_SNAPSHOT";
    error.retryable = true;
    throw error;
  }
  return true;
}

/** Computes additions, removals and changed labels between two page snapshots (the page-side diff of the former browser/snapshot.ts; the extension-protocol diff of the same name lives in the migrated devthink/browserextension.ts). */
export function pagesnapshotdiff(previous: unknown, current: unknown) {
  const before = pagesnapshot(previous);
  const after = pagesnapshot(current);
  const oldmap = new Map(before.elements.map((element) => [element.ref, element]));
  const newmap = new Map(after.elements.map((element) => [element.ref, element]));
  const added = after.elements.filter((element) => !oldmap.has(element.ref));
  const removed = before.elements.filter((element) => !newmap.has(element.ref));
  const changed = after.elements.filter((element) => oldmap.has(element.ref) && JSON.stringify(oldmap.get(element.ref)) !== JSON.stringify(element));
  return { from: before.snapshotid, to: after.snapshotid, added, removed, changed };
}

/** Projects a page snapshot into a byte-bounded, allowlisted browser context. */
export function projectcontext(snapshot: unknown, options: { maxbytes?: number; fields?: unknown; allowlist?: unknown } = {}) {
  const current = pagesnapshot(snapshot);
  const maxbytes = normalizebudget(options.maxbytes ?? 32768);
  const allowed = normalizefields(options.fields ?? options.allowlist);
  const context: Record<string, unknown> = { snapshotid: current.snapshotid };
  const truncated: string[] = [];
  for (const field of allowed) {
    if (field === "snapshotid") continue;
    const value: unknown = (current as unknown as Record<string, unknown>)[field];
    if (value === undefined) continue;
    if (field === "elements") {
      const elements: unknown[] = [];
      for (const element of Array.isArray(value) ? value : []) {
        if (fitscontext(context, field, [...elements, element], maxbytes)) elements.push(element);
        else { truncated.push("elements"); break; }
      }
      if (fitscontext(context, field, elements, maxbytes)) context[field] = elements;
      else truncated.push("elements");
      continue;
    }
    if (fitscontext(context, field, value, maxbytes)) { context[field] = value; continue; }
    if (typeof value === "string") context[field] = clipcontextstring(context, field, value, maxbytes);
    else truncated.push(field);
    if (typeof value === "string" && String(context[field] ?? "").length < value.length) truncated.push(field);
  }
  const bytes = contextbytes(context);
  if (bytes > maxbytes) throw new RangeError("browser context budget is smaller than stable snapshot identity");
  return { version: 1, snapshotid: current.snapshotid, context, fields: Object.keys(context), bytes, maxbytes, truncated: [...new Set(truncated)] };
}

function normalizeelements(elements: unknown): Array<{ ref: string }> {
  if (!Array.isArray(elements)) return [];
  return elements.slice(0, 500).map((element, index) => ({ ref: String(element?.ref ?? `e${index + 1}`), role: String(element?.role ?? "generic"), name: String(element?.name ?? "").trim().slice(0, 200), value: element?.value === undefined ? undefined : String(element.value).slice(0, 500), disabled: Boolean(element?.disabled) }));
}

const snapshotfields = Object.freeze(["snapshotid", "tabid", "frameid", "url", "title", "text", "elements"]);

function normalizefields(fields: unknown): string[] {
  if (fields === undefined) return [...snapshotfields];
  if (!Array.isArray(fields) || fields.length === 0) throw new TypeError("browser context fields must be a non-empty array");
  const normalized = [...new Set(fields.map((field) => String(field)))];
  if (normalized.some((field) => !snapshotfields.includes(field))) throw new TypeError("browser context field is not allowlisted");
  return normalized;
}

function normalizebudget(value: unknown): number { const normalized = Number(value); if (!Number.isSafeInteger(normalized) || normalized <= 0) throw new RangeError("browser context maxbytes must be a positive safe integer"); return normalized; }

function contextbytes(value: unknown): number { return new TextEncoder().encode(JSON.stringify(value)).byteLength; }

function fitscontext(context: Record<string, unknown>, field: string, value: unknown, maxbytes: number): boolean { return contextbytes({ ...context, [field]: value }) <= maxbytes; }

function clipcontextstring(context: Record<string, unknown>, field: string, value: string, maxbytes: number): string {
  let low = 0;
  let high = value.length;
  let result = "";
  while (low <= high) {
    const middle = Math.floor((low + high) / 2);
    const candidate = value.slice(0, middle);
    if (fitscontext(context, field, candidate, maxbytes)) { result = candidate; low = middle + 1; } else high = middle - 1;
  }
  return result;
}

/* ════════════════════════════════════════════════════════════════════ */
/* Section 6: browser/recorder.ts — browser recorder captures action and snapshot boundaries for deterministic replay. */
/* ════════════════════════════════════════════════════════════════════ */
/**
 * browser recorder captures action and snapshot boundaries for deterministic replay.
 * The optional event limit keeps long sessions bounded without owning persistence.
 */

/** Creates a recorder that links actions to snapshots and optionally bounds events. */
export function actionrecorder(options: { startedat?: number; maxevents?: unknown } = {}) {
  const startedat = Number(options.startedat ?? Date.now());
  const maxevents = limit(options.maxevents);
  const events: Array<Record<string, unknown>> = [];
  let lastsnapshotid: string | undefined;
  let dropped = 0;

  function snapshot(value: { snapshotid?: string; tabid?: string; frameid?: string } | null | undefined) {
    lastsnapshotid = value?.snapshotid;
    add({ type: "snapshot", t: Date.now() - startedat, snapshotid: lastsnapshotid, tabid: value?.tabid, frameid: value?.frameid, context: recordercontext(value) });
    return value;
  }

  function action(input: Record<string, unknown> = {}) {
    const context = recordercontext(input.context ?? input);
    const event = { type: "action", t: Date.now() - startedat, action: String(input.action), snapshotid: input.snapshotid ?? lastsnapshotid, tabid: input.tabid, frameid: input.frameid, windowid: input.windowid, context, payload: clonevalue(input.payload ?? {}) };
    add(event);
    return clonevalue(event);
  }

  function list() { return events.map(clonevalue); }
  function manifest() { return { version: 1, startedat, eventcount: events.length, dropped, lastsnapshotid, events: list() }; }
  function exportjson() { return JSON.stringify(manifest()); }
  function clear() { events.length = 0; dropped = 0; lastsnapshotid = undefined; }

  return { snapshot, action, list, manifest, exportjson, clear };

  function add(event: Record<string, unknown>) {
    events.push(event);
    while (events.length > maxevents) { events.shift(); dropped += 1; }
  }
}

function limit(value: unknown): number {
  if (value === undefined) return Infinity;
  const numeric = Number(value);
  if (!Number.isInteger(numeric) || numeric < 0) throw new TypeError("maxevents must be a non-negative integer");
  return numeric;
}

function clonevalue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(clonevalue);
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, clonevalue(item)]));
  return value;
}

function recordercontext(value: unknown = {}) {
  const source = (value ?? {}) as Record<string, unknown>;
  const context: Record<string, string> = {};
  for (const name of ["windowid", "tabid", "frameid"]) if (source[name] !== undefined) context[name] = String(source[name]);
  return Object.keys(context).length ? context : undefined;
}

/* ════════════════════════════════════════════════════════════════════ */
/* Section 7: browser/agent.ts — browser agent delegates browser actions to an injected runtime adapter. */
/* ════════════════════════════════════════════════════════════════════ */
/**
 * browser agent delegates browser actions to an injected runtime adapter.
 */
export function browseragent(adapter: Record<string, unknown>) {
  const required = ["navigate", "click", "type", "screenshot", "html", "text", "title", "scrolltobottom", "executecommands"];
  for (const name of required) if (typeof adapter?.[name] !== "function") throw new TypeError(`browser adapter requires ${name}`);
  const callable = (name: string): ((...args: unknown[]) => unknown) => {
    const method = adapter[name];
    if (typeof method !== "function") throw new Error(`browser adapter does not support ${name}`);
    return method as (...args: unknown[]) => unknown;
  };
  const optional = (name: string) => (...args: unknown[]) => callable(name)(...args);
  return { navigate: (options: unknown) => callable("navigate")(options), click: (target: unknown) => callable("click")(target), type: (value: unknown) => callable("type")(value), screenshot: (options: unknown) => callable("screenshot")(options), html: () => callable("html")(), text: () => callable("text")(), title: () => callable("title")(), scrolltobottom: (options: unknown) => callable("scrolltobottom")(options), executecommands: (commands: unknown) => callable("executecommands")(commands), fill: optional("fill"), key: optional("key"), upload: optional("upload"), snapshot: optional("snapshot"), tabs: optional("tabs"), frames: optional("frames") };
}

/* ════════════════════════════════════════════════════════════════════ */
/* Section 8: browser/virtual.ts */
/* ════════════════════════════════════════════════════════════════════ */
/**
 * virtual browser contracts select remote browser capabilities without launching a browser or touching user state.
 */


const engines = new Set(["chromium", "gecko", "webkit", "custom"]);
const displays = new Set(["webrtc", "cdp", "webdriver", "remote-display", "custom"]);
const storages = new Set(["ephemeral", "caller-managed"]);
const receipts = new Set(["declared", "observed", "completed", "unknown"]);
const distributions: Readonly<Record<string, Set<string>>> = Object.freeze({
  chromium: new Set(["chromium", "chrome", "edge", "brave", "vivaldi", "opera", "ungoogled-chromium"]),
  gecko: new Set(["firefox", "tor-browser"]),
  webkit: new Set(["safari"]),
  custom: new Set(["saddle-browser", "custom"])
});

/** Creates a data-only request for a remote, adapter-owned browser session. */
export function virtualbrowserrequest(input: Record<string, unknown> = {}) {
  const engine = valid(input.engine, engines, "browser engine");
  const distribution = nonempty(input.distribution, "browser distribution");
  if (!distributions[engine].has(distribution)) throw new TypeError("browser distribution does not match engine");
  const display = valid(input.display ?? "webrtc", displays, "browser display transport");
  const storage = valid(input.storage ?? "ephemeral", storages, "browser storage policy");
  const execution = executionrequest({
    id: input.id,
    effect: "browser-session",
    target: "remote",
    source: input.source,
    budget: input.budget
  });
  return Object.freeze({
    version: 1,
    state: "requested",
    id: execution.id,
    engine,
    distribution,
    display,
    storage,
    execution,
    localaccess: Object.freeze({ browser: false, filesystem: false, storage: false, process: false }),
    effects: Object.freeze([])
  });
}

/** Evaluates a virtual browser request without contacting a runtime or provider. */
export function virtualbrowserdecision(input: unknown, configuration: Record<string, unknown> = {}) {
  const request = normalizerequest(input);
  const base = executiondecision(request.execution, configuration);
  const adapter = (configuration.adapter ?? {}) as Record<string, unknown>;
  const supportedengines = list(adapter.engines);
  const supporteddistributions = list(adapter.distributions);
  const reasons = [...base.reasons];
  if (!supportedengines.includes(request.engine)) reasons.push("adapter-engine");
  if (!supporteddistributions.includes(request.distribution)) reasons.push("adapter-distribution");
  const allowed = reasons.length === 0;
  return Object.freeze({
    version: 1,
    request,
    state: allowed ? "caller-delegates" : "denied",
    reasons: Object.freeze([...new Set(reasons)].sort()),
    adapter: allowed ? Object.freeze({ owner: String(adapter.owner), engines: Object.freeze(supportedengines), distributions: Object.freeze(supporteddistributions) }) : null,
    effects: Object.freeze([])
  });
}

/** Projects an adapter handoff without launching a browser or transferring user state. */
export function virtualbrowserhandoff(input: Record<string, unknown> = {}) {
  const decision = virtualbrowserdecision(input.request, (input.configuration ?? {}) as Record<string, unknown>);
  if (decision.state !== "caller-delegates") return Object.freeze({ version: 1, state: "browser-disabled", code: "VIRTUAL_BROWSER_POLICY_DENIED", decision, effects: Object.freeze([]) });
  return Object.freeze({ version: 1, state: "caller-delegates", code: "REMOTE_BROWSER_ADAPTER_REQUIRED", decision, effects: Object.freeze([]) });
}

/** Records declared or observed remote-browser capabilities without asserting isolation or trust. */
export function virtualbrowserreceipt(input: Record<string, unknown> = {}) {
  const request = normalizerequest(input.request ?? input);
  const state = valid(input.state ?? "declared", receipts, "browser receipt state");
  const adapterid = nonempty(input.adapterid, "browser adapter id");
  const image = nonempty(input.image, "browser image reference");
  return Object.freeze({
    version: 1,
    state,
    request,
    adapterid,
    image,
    capabilities: Object.freeze(list(input.capabilities)),
    effects: Object.freeze([])
  });
}

function list(value: unknown): string[] { return [...new Set(Array.isArray(value) ? value.map((entry) => String(entry)) : [])].sort(); }
function normalizerequest(input: unknown) {
  const source = input as { execution?: { effect?: string; source?: unknown; budget?: unknown } } & Record<string, unknown> | null | undefined;
  if (source?.execution?.effect === "browser-session") return virtualbrowserrequest({ id: source.id, source: source.execution.source, engine: source.engine, distribution: source.distribution, display: source.display, storage: source.storage, budget: source.execution.budget });
  return virtualbrowserrequest(input as Record<string, unknown> | undefined);
}
function valid(value: unknown, collection: ReadonlySet<string>, name: string): string { const output = String(value ?? ""); if (!collection.has(output)) throw new TypeError(`${name} is invalid`); return output; }
function nonempty(value: unknown, name: string): string { const output = String(value ?? ""); if (!output) throw new TypeError(`${name} is required`); return output; }

/* ════════════════════════════════════════════════════════════════════ */
/* Section 9: browser/playwright.ts — browser playwright adapter keeps the optional Node browser provider outside the transport-neutral surface. */
/* ════════════════════════════════════════════════════════════════════ */
/**
 * browser playwright adapter keeps the optional Node browser provider outside the transport-neutral surface.
 */

/** Creates a caller-owned Playwright browser session when the optional peer is installed. */
export async function createplaywrightsession(options: { browser?: string } & Record<string, unknown> = {}) {
  let playwright: Record<string, unknown>;
  try {
    playwright = (await import("playwright")) as unknown as Record<string, unknown>;
  } catch (error) {
    const missing = new Error("optional peer dependency 'playwright' is required for the Playwright adapter", { cause: error }) as Error & { code?: string };
    missing.code = "OPTIONAL_DEPENDENCY_MISSING";
    throw missing;
  }
  const browsername = String(options.browser ?? "chromium");
  const browsertype = playwright[browsername] as { launch?: unknown } | undefined;
  if (!browsertype || typeof browsertype.launch !== "function") throw new TypeError(`unsupported Playwright browser: ${browsername}`);
  const browser = await browsertype.launch({ headless: options.headless ?? true, ...(options.launch ?? {}) });
  const context = await browser.newContext(options.context ?? {});
  const page = await context.newPage();
  return { browser, context, page, close: () => browser.close() };
}

