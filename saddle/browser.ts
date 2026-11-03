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
const profiles = Object.freeze({
  desktopwindows: { os: "windows", platform: "Win32", browser: "chrome", locale: "en-US", timezone: "America/New_York", touch: false, devicepixelratio: 1 },
  desktopmacos: { os: "macos", platform: "MacIntel", browser: "safari", locale: "en-US", timezone: "America/Los_Angeles", touch: false, devicepixelratio: 2 },
  mobileandroid: { os: "android", platform: "Linux armv8l", browser: "chrome", locale: "en-US", timezone: "America/Chicago", touch: true, devicepixelratio: 2.75 }
});

export function fingerprintprofile(name = "desktopwindows", overrides = {}) { return { ...(profiles[name] ?? profiles.desktopwindows), ...overrides, name }; }
export function fingerprintvalidate(profile) { return Boolean(profile?.os && profile?.platform && profile?.browser && profile?.locale && profile?.timezone && typeof profile.touch === "boolean"); }
export function fingerprintfor(sessionid, options = {}) { const names = options.profiles ?? Object.keys(profiles); const index = [...String(sessionid)].reduce((sum, value) => sum + value.charCodeAt(0), 0) % names.length; return fingerprintprofile(names[index], options.overrides); }

/* ════════════════════════════════════════════════════════════════════ */
/* Section 2: browser/session.ts — browser sessions bind one fingerprint to one proxy and one event recorder. */
/* ════════════════════════════════════════════════════════════════════ */
/**
 * browser sessions bind one fingerprint to one proxy and one event recorder.
 */

export function browsersession(options = {}) {
  const id = options.id ?? `browsersession${Date.now().toString(36)}`;
  const fingerprint = options.fingerprint ?? fingerprintfor(id, options);
  if (!fingerprintvalidate(fingerprint)) throw new TypeError("browser fingerprint is incoherent");
  const events = [];
  return {
    id,
    fingerprint,
    proxy: options.proxy,
    record(event) { if (!event || !Number.isFinite(event.t) || event.t < 0 || typeof event.type !== "string") throw new TypeError("browser event is invalid"); events.push({ ...event }); return event; },
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
export function actionresult(action, options = {}) {
  if (!browseractions.includes(action)) throw new TypeError(`unsupported browser action: ${action}`);
  return { version: 1, action, ok: true, startedat: Number(options.startedat ?? Date.now()), finishedat: Number(options.finishedat ?? Date.now()), tabid: options.tabid === undefined ? undefined : String(options.tabid), frameid: options.frameid === undefined ? undefined : String(options.frameid), snapshotid: options.snapshotid, value: options.value, metadata: options.metadata ?? {} };
}

/** Creates a stable action failure without leaking adapter internals or credentials. */
export function actionfailure(action, error, options = {}) {
  if (!action || typeof action !== "string") throw new TypeError("browser action failure requires an action name");
  return { version: 1, action, ok: false, code: String(options.code ?? error?.code ?? "BROWSER_ACTION_FAILED"), message: String(error?.message ?? error ?? "browser action failed"), retryable: Boolean(options.retryable ?? error?.retryable), tabid: options.tabid === undefined ? undefined : String(options.tabid), frameid: options.frameid === undefined ? undefined : String(options.frameid), snapshotid: options.snapshotid, metadata: options.metadata ?? {} };
}

/** Executes a bounded list of actions through an injected adapter and keeps per-action outcomes. */
export async function actionbatch(adapter, actions = [], options = {}) {
  if (!adapter || typeof adapter !== "object") throw new TypeError("browser action batch requires an adapter");
  if (!Array.isArray(actions) || actions.length > (options.maxactions ?? 100)) throw new TypeError("browser action batch is invalid or too large");
  const results = [];
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
export function browsercontext(options = {}) {
  const sessionid = String(options.sessionid ?? `context${Date.now().toString(36)}`);
  const tabs = new Map();
  let activeid = options.activeid === undefined ? undefined : String(options.activeid);

  function opentab(input = {}) {
    const id = String(input.id ?? `tab${tabs.size + 1}`);
    const tab = { id, url: String(input.url ?? "about:blank"), title: String(input.title ?? ""), active: Boolean(input.active), frames: new Map() };
    tabs.set(id, tab);
    if (tab.active || activeid === undefined) { activeid = id; tab.active = true; }
    return describetab(tab);
  }

  function closetab(id) {
    const key = String(id);
    if (!tabs.delete(key)) return false;
    if (activeid === key) activeid = tabs.keys().next().value;
    if (activeid && tabs.has(activeid)) tabs.get(activeid).active = true;
    return true;
  }

  function setactive(id) {
    const key = String(id);
    const tab = tabs.get(key);
    if (!tab) throw new Error(`unknown browser tab: ${key}`);
    for (const item of tabs.values()) item.active = false;
    tab.active = true;
    activeid = key;
    return describetab(tab);
  }

  function openframe(tabid, input = {}) {
    const tab = requiretab(tabid);
    const id = String(input.id ?? `frame${tab.frames.size + 1}`);
    tab.frames.set(id, { id, url: String(input.url ?? tab.url), parentid: input.parentid === undefined ? undefined : String(input.parentid), name: String(input.name ?? "") });
    return { ...tab.frames.get(id) };
  }

  function closeframe(tabid, frameid) { return Boolean(requiretab(tabid).frames.delete(String(frameid))); }
  function activetab() { return activeid === undefined ? undefined : describetab(requiretab(activeid)); }
  function describe() { return { sessionid, activeid, tabs: [...tabs.values()].map(describetab) }; }

  return { sessionid, opentab, closetab, setactive, openframe, closeframe, activetab, describe };

  function requiretab(id) { const tab = tabs.get(String(id)); if (!tab) throw new Error(`unknown browser tab: ${id}`); return tab; }
  function describetab(tab) { return { id: tab.id, url: tab.url, title: tab.title, active: tab.active, frames: [...tab.frames.values()].map((frame) => ({ ...frame })) }; }
}

/* ════════════════════════════════════════════════════════════════════ */
/* Section 5: browser/snapshot.ts — browser snapshots turn page state into bounded serializable data with stable references. */
/* ════════════════════════════════════════════════════════════════════ */
/**
 * browser snapshots turn page state into bounded serializable data with stable references.
 */

/** Creates a validated page snapshot for browser, MCP and extension adapters. */
export function pagesnapshot(input = {}) {
  if (!input || typeof input !== "object") throw new TypeError("page snapshot must be an object");
  const snapshot = {
    version: 1,
    snapshotid: String(input.snapshotid ?? `snapshot${Date.now().toString(36)}`),
    tabid: input.tabid === undefined ? undefined : String(input.tabid),
    frameid: input.frameid === undefined ? undefined : String(input.frameid),
    url: String(input.url ?? ""),
    title: String(input.title ?? ""),
    text: String(input.text ?? "").slice(0, input.maxtext ?? 100000),
    elements: normalizeelements(input.elements)
  };
  if (!snapshot.snapshotid || !snapshot.url) throw new TypeError("page snapshot requires snapshotid and url");
  return snapshot;
}

/** Creates an element reference bound to a snapshot and browser context. */
export function snapshotref(snapshot, input = {}) {
  const current = pagesnapshot(snapshot);
  const ref = String(input.ref ?? "");
  if (!current.elements.some((element) => element.ref === ref)) throw new TypeError(`snapshot reference not found: ${ref}`);
  return { version: 1, snapshotid: current.snapshotid, tabid: current.tabid, frameid: current.frameid, ref };
}

/** Throws a stable error when an action uses a reference from a previous page state. */
export function assertfreshsnapshot(snapshot, reference) {
  const current = pagesnapshot(snapshot);
  if (!reference || reference.snapshotid !== current.snapshotid || (reference.tabid !== undefined && reference.tabid !== current.tabid) || (reference.frameid !== undefined && reference.frameid !== current.frameid)) {
    const error = new Error("browser snapshot is stale");
    error.code = "STALE_SNAPSHOT";
    error.retryable = true;
    throw error;
  }
  return true;
}

/** Computes additions, removals and changed labels between two page snapshots (the page-side diff of the former browser/snapshot.ts; the extension-protocol diff of the same name lives in the migrated devthink/browserextension.ts). */
export function pagesnapshotdiff(previous, current) {
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
export function projectcontext(snapshot, options = {}) {
  const current = pagesnapshot(snapshot);
  const maxbytes = normalizebudget(options.maxbytes ?? 32768);
  const allowed = normalizefields(options.fields ?? options.allowlist);
  const context = { snapshotid: current.snapshotid };
  const truncated = [];
  for (const field of allowed) {
    if (field === "snapshotid") continue;
    const value = current[field];
    if (value === undefined) continue;
    if (field === "elements") {
      const elements = [];
      for (const element of value) {
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
    if (typeof value === "string" && context[field].length < value.length) truncated.push(field);
  }
  const bytes = contextbytes(context);
  if (bytes > maxbytes) throw new RangeError("browser context budget is smaller than stable snapshot identity");
  return { version: 1, snapshotid: current.snapshotid, context, fields: Object.keys(context), bytes, maxbytes, truncated: [...new Set(truncated)] };
}

function normalizeelements(elements) {
  if (!Array.isArray(elements)) return [];
  return elements.slice(0, 500).map((element, index) => ({ ref: String(element?.ref ?? `e${index + 1}`), role: String(element?.role ?? "generic"), name: String(element?.name ?? "").trim().slice(0, 200), value: element?.value === undefined ? undefined : String(element.value).slice(0, 500), disabled: Boolean(element?.disabled) }));
}

const snapshotfields = Object.freeze(["snapshotid", "tabid", "frameid", "url", "title", "text", "elements"]);

function normalizefields(fields) {
  if (fields === undefined) return [...snapshotfields];
  if (!Array.isArray(fields) || fields.length === 0) throw new TypeError("browser context fields must be a non-empty array");
  const normalized = [...new Set(fields.map((field) => String(field)))];
  if (normalized.some((field) => !snapshotfields.includes(field))) throw new TypeError("browser context field is not allowlisted");
  return normalized;
}

function normalizebudget(value) { const normalized = Number(value); if (!Number.isSafeInteger(normalized) || normalized <= 0) throw new RangeError("browser context maxbytes must be a positive safe integer"); return normalized; }

function contextbytes(value) { return new TextEncoder().encode(JSON.stringify(value)).byteLength; }

function fitscontext(context, field, value, maxbytes) { return contextbytes({ ...context, [field]: value }) <= maxbytes; }

function clipcontextstring(context, field, value, maxbytes) {
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
export function actionrecorder(options = {}) {
  const startedat = Number(options.startedat ?? Date.now());
  const maxevents = limit(options.maxevents);
  const events = [];
  let lastsnapshotid;
  let dropped = 0;

  function snapshot(value) {
    lastsnapshotid = value?.snapshotid;
    add({ type: "snapshot", t: Date.now() - startedat, snapshotid: lastsnapshotid, tabid: value?.tabid, frameid: value?.frameid, context: recordercontext(value) });
    return value;
  }

  function action(input = {}) {
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

  function add(event) {
    events.push(event);
    while (events.length > maxevents) { events.shift(); dropped += 1; }
  }
}

function limit(value) {
  if (value === undefined) return Infinity;
  const numeric = Number(value);
  if (!Number.isInteger(numeric) || numeric < 0) throw new TypeError("maxevents must be a non-negative integer");
  return numeric;
}

function clonevalue(value) {
  if (Array.isArray(value)) return value.map(clonevalue);
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, clonevalue(item)]));
  return value;
}

function recordercontext(value = {}) {
  const context = {};
  for (const name of ["windowid", "tabid", "frameid"]) if (value[name] !== undefined) context[name] = String(value[name]);
  return Object.keys(context).length ? context : undefined;
}

/* ════════════════════════════════════════════════════════════════════ */
/* Section 7: browser/agent.ts — browser agent delegates browser actions to an injected runtime adapter. */
/* ════════════════════════════════════════════════════════════════════ */
/**
 * browser agent delegates browser actions to an injected runtime adapter.
 */
export function browseragent(adapter) {
  const required = ["navigate", "click", "type", "screenshot", "html", "text", "title", "scrolltobottom", "executecommands"];
  for (const name of required) if (typeof adapter?.[name] !== "function") throw new TypeError(`browser adapter requires ${name}`);
  const optional = (name) => (...args) => { if (typeof adapter[name] !== "function") throw new Error(`browser adapter does not support ${name}`); return adapter[name](...args); };
  return { navigate: (options) => adapter.navigate(options), click: (target) => adapter.click(target), type: (value) => adapter.type(value), screenshot: (options) => adapter.screenshot(options), html: () => adapter.html(), text: () => adapter.text(), title: () => adapter.title(), scrolltobottom: (options) => adapter.scrolltobottom(options), executecommands: (commands) => adapter.executecommands(commands), fill: optional("fill"), key: optional("key"), upload: optional("upload"), snapshot: optional("snapshot"), tabs: optional("tabs"), frames: optional("frames") };
}

/* ════════════════════════════════════════════════════════════════════ */
/* Section 8: browser/virtual.ts */
/* ════════════════════════════════════════════════════════════════════ */
// @ts-nocheck
/**
 * virtual browser contracts select remote browser capabilities without launching a browser or touching user state.
 */


const engines = new Set(["chromium", "gecko", "webkit", "custom"]);
const displays = new Set(["webrtc", "cdp", "webdriver", "remote-display", "custom"]);
const storages = new Set(["ephemeral", "caller-managed"]);
const receipts = new Set(["declared", "observed", "completed", "unknown"]);
const distributions = Object.freeze({
  chromium: new Set(["chromium", "chrome", "edge", "brave", "vivaldi", "opera", "ungoogled-chromium"]),
  gecko: new Set(["firefox", "tor-browser"]),
  webkit: new Set(["safari"]),
  custom: new Set(["saddle-browser", "custom"])
});

/** Creates a data-only request for a remote, adapter-owned browser session. */
export function virtualbrowserrequest(input = {}) {
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
export function virtualbrowserdecision(input, configuration = {}) {
  const request = normalizerequest(input);
  const base = executiondecision(request.execution, configuration);
  const adapter = configuration.adapter ?? {};
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
export function virtualbrowserhandoff(input = {}) {
  const decision = virtualbrowserdecision(input.request, input.configuration);
  if (decision.state !== "caller-delegates") return Object.freeze({ version: 1, state: "browser-disabled", code: "VIRTUAL_BROWSER_POLICY_DENIED", decision, effects: Object.freeze([]) });
  return Object.freeze({ version: 1, state: "caller-delegates", code: "REMOTE_BROWSER_ADAPTER_REQUIRED", decision, effects: Object.freeze([]) });
}

/** Records declared or observed remote-browser capabilities without asserting isolation or trust. */
export function virtualbrowserreceipt(input = {}) {
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

function list(value) { return [...new Set(Array.isArray(value) ? value.map((entry) => String(entry)) : [])].sort(); }
function normalizerequest(input) {
  if (input?.execution?.effect === "browser-session") return virtualbrowserrequest({ id: input.id, source: input.execution.source, engine: input.engine, distribution: input.distribution, display: input.display, storage: input.storage, budget: input.execution.budget });
  return virtualbrowserrequest(input);
}
function valid(value, collection, name) { const output = String(value ?? ""); if (!collection.has(output)) throw new TypeError(`${name} is invalid`); return output; }
function nonempty(value, name) { const output = String(value ?? ""); if (!output) throw new TypeError(`${name} is required`); return output; }

/* ════════════════════════════════════════════════════════════════════ */
/* Section 9: browser/playwright.ts — browser playwright adapter keeps the optional Node browser provider outside the transport-neutral surface. */
/* ════════════════════════════════════════════════════════════════════ */
/**
 * browser playwright adapter keeps the optional Node browser provider outside the transport-neutral surface.
 */

/** Creates a caller-owned Playwright browser session when the optional peer is installed. */
export async function createplaywrightsession(options = {}) {
  let playwright;
  try {
    playwright = await import("playwright");
  } catch (error) {
    const missing = new Error("optional peer dependency 'playwright' is required for the Playwright adapter", { cause: error });
    missing.code = "OPTIONAL_DEPENDENCY_MISSING";
    throw missing;
  }
  const browsername = options.browser ?? "chromium";
  const browsertype = playwright[browsername];
  if (!browsertype || typeof browsertype.launch !== "function") throw new TypeError(`unsupported Playwright browser: ${browsername}`);
  const browser = await browsertype.launch({ headless: options.headless ?? true, ...(options.launch ?? {}) });
  const context = await browser.newContext(options.context ?? {});
  const page = await context.newPage();
  return { browser, context, page, close: () => browser.close() };
}

