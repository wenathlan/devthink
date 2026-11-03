// @ts-nocheck
/**
 * browserextension.ts — the Chrome Manifest V3 extension surface of the
 * family (the saddle browser bridge): permissions, protocol, content
 * bridge, popup, page bridge, worker, service worker and the build
 * adapter that emits the versioned unpacked artifact.
 *
 * MIGRATION (wave 2, the logic-regrouping PR): this module moved from
 * saddle/browser.ts (sections 10-17 of the v2.0.0 grand merge) into the
 * devthink app. The family rule that drove the move: the saddle is
 * EXCLUSIVELY the virtualization engine (VM / sandbox / microVM / the
 * ninety modalities / vGPU / vCPU) and never touches the browser, GPU,
 * CPU or storage of the user — every feature that runs in the user's
 * browser (a Chrome MV3 extension) is not a VM modality and belongs to
 * devthink, the owner of the family extension product (the devthink
 * extension of record: manifest.json, popup.ts, background.ts,
 * sidepanel.ts, crossbrowser.ts and the packageextension.ts packaging
 * gate). The saddle keeps only the transport-neutral virtual-browser
 * contracts in saddle/browser.ts (sections 1-9); every export that left
 * the saddle reappears here with the same name and signature — zero
 * feature loss, zero API break on the surface that stays.
 *
 * Why the sections stay verbatim classic JavaScript: the build adapter
 * (section 17) extracts each ordinal section of THIS file and emits it
 * under the stable browser `.js` filename of the artifact
 * (permissions.js, protocol.js, content.js, popup.js, pagebridge.js,
 * worker.js, serviceworker.js) — Chrome injects the content script and
 * the page bridge as classic script files, so the section sources carry
 * no type annotations; the module rides @ts-nocheck the way the saddle
 * authored it under the grand-merge loose typing baseline, and the
 * section ordinals (10-17) keep the saddle numbering so the extraction
 * contract and the provenance stay traceable.
 *
 * The tracked assets of this surface ride the devthink root under the
 * extension-prefixed names — extensionmanifest.json, extensionpopup.html,
 * extensionpopup.css, extensionicon32.png, extensionicon64.png,
 * extensionicon128.png — because the devthink root already owns its own
 * extension surface (manifest.json of record, popup.ts, design.html and
 * the icon family), so the migrated saddle assets carry the extension
 * prefix and no root name collides.
 */

import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { basename, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

/** Restores the extension-side global typing of the merged e2ugh globals.d.ts (dropped in the grand merge). */
declare const chrome: any;

/* ════════════════════════════════════════════════════════════════════ */
/* Section 10: extension/permissions.ts — extension permission policies keep the browser capability boundary explicit and caller-owned. */
/* ════════════════════════════════════════════════════════════════════ */
/**
 * extension permission policies keep the browser capability boundary explicit and caller-owned.
 */

export const extensionpermissions = Object.freeze(["activeTab", "scripting", "storage"]);

/** Creates a minimal permission policy without requesting broad host access. */
export function permissionpolicy(options = {}) {
  const requested = [...new Set((options.requested ?? extensionpermissions).map(String))];
  const optional = [...new Set((options.optional ?? []).map(String))];
  const unknown = requested.concat(optional).filter((permission) => !extensionpermissions.includes(permission));
  if (unknown.length) throw new TypeError(`unsupported extension permission: ${unknown[0]}`);
  return { version: 1, requested, optional, hostpermissions: [], allows(permission) { return requested.includes(String(permission)); }, missing(permissions = []) { return [...new Set(permissions.map(String))].filter((permission) => !requested.includes(permission)); } };
}

/** Requests an optional capability through an injected browser permission function. */
export async function requestpermission(policy, permission, request) {
  const name = String(permission ?? "");
  if (!policy?.optional?.includes(name)) throw new TypeError(`permission is not optional: ${name}`);
  if (typeof request !== "function") throw new TypeError("permission request function is required");
  try { return { permission: name, granted: Boolean(await request(name)) }; } catch (error) { return { permission: name, granted: false, code: String(error?.code ?? "PERMISSION_REQUEST_FAILED"), message: String(error?.message ?? error) }; }
}

/* ════════════════════════════════════════════════════════════════════ */
/* Section 11: extension/protocol.ts — extension protocol defines serializable commands, responses, errors and page snapshots. */
/* ════════════════════════════════════════════════════════════════════ */
/**
 * extension protocol defines serializable commands, responses, errors and page snapshots.
 */

export const protocolversion = 1;
export const extensioncommands = Object.freeze(["snapshot", "readpage", "pagefacts", "clickref", "fillref"]);

/** Creates a compact identifier without embedding a host, port or credential. */
export function createid(prefix = "msg", source) {
  const generator = source ?? (() => globalThis.crypto?.randomUUID?.() ?? `${Date.now()}${Math.random().toString(16).slice(2)}`);
  const value = generator().replaceAll("-", "");
  return `${prefix}${value}`;
}

/** Creates a versioned command for the extension message bus. */
export function createcommand(command, payload = {}, options = {}) {
  if (!extensioncommands.includes(command)) throw new TypeError(`unsupported extension command: ${command}`);
  return createmessage("command", { ...options, command, payload });
}

/** Creates a serializable message envelope. */
export function createmessage(type, options = {}) {
  if (!["command", "response", "error", "event"].includes(type)) throw new TypeError(`unsupported extension message type: ${type}`);
  const message = { version: protocolversion, type, id: options.id ?? createid(type) };
  if (options.requestid) message.requestid = options.requestid;
  if (options.command) message.command = options.command;
  if (options.payload !== undefined) message.payload = options.payload;
  if (options.error) message.error = options.error;
  assertserializable(message);
  return message;
}

/** Creates a correlated successful response. */
export function createresponse(request, payload = {}) {
  assertmessage(request);
  return createmessage("response", { requestid: request.id, payload });
}

/** Creates a correlated error response with stable error fields. */
export function createerror(request, error, options = {}) {
  const requestid = request?.id ?? options.requestid;
  const failure = { code: options.code ?? error?.code ?? "extension_error", message: String(error?.message ?? error ?? "extension request failed"), retryable: Boolean(options.retryable ?? error?.retryable) };
  return createmessage("error", { requestid, error: failure });
}

/** Validates a message before a privileged context handles it. */
export function assertmessage(message) {
  if (!message || typeof message !== "object") throw new TypeError("extension message must be an object");
  if (message.version !== protocolversion) throw new TypeError(`unsupported extension protocol version: ${message.version}`);
  if (typeof message.type !== "string" || typeof message.id !== "string") throw new TypeError("extension message requires type and id");
  if (message.type === "command" && !extensioncommands.includes(message.command)) throw new TypeError(`unsupported extension command: ${message.command}`);
  if (message.payload !== undefined && (!message.payload || typeof message.payload !== "object" || Array.isArray(message.payload))) throw new TypeError("extension payload must be an object");
  return message;
}

/** Creates a structured page snapshot with stable element references. */
export function createsnapshot(input = {}) {
  const snapshot = {
    version: protocolversion,
    snapshotid: String(input.snapshotid ?? createid("snap")),
    createdat: Number(input.createdat ?? Date.now()),
    windowid: input.windowid === undefined ? undefined : String(input.windowid),
    tabid: input.tabid === undefined ? undefined : String(input.tabid),
    frameid: input.frameid === undefined ? undefined : String(input.frameid),
    url: String(input.url ?? ""),
    title: String(input.title ?? ""),
    text: String(input.text ?? ""),
    elements: Array.isArray(input.elements) ? input.elements.map((element) => ({ ref: String(element.ref), role: String(element.role ?? "generic"), name: String(element.name ?? ""), value: element.value === undefined ? undefined : String(element.value), disabled: Boolean(element.disabled) })) : []
  };
  assertserializable(snapshot);
  return snapshot;
}

/** Returns whether a reference still belongs to the current page snapshot. */
export function isfreshsnapshot(snapshotid, currentid) { return Boolean(snapshotid && currentid && snapshotid === currentid); }

/** Computes bounded additions, removals and changed elements between extension snapshots. */
export function snapshotdiff(previous, current) {
  const before = createsnapshot(previous);
  const after = createsnapshot(current);
  const oldmap = new Map(before.elements.map((element) => [element.ref, element]));
  const newmap = new Map(after.elements.map((element) => [element.ref, element]));
  return {
    from: before.snapshotid,
    to: after.snapshotid,
    contextchanged: before.windowid !== after.windowid || before.tabid !== after.tabid || before.frameid !== after.frameid,
    added: after.elements.filter((element) => !oldmap.has(element.ref)),
    removed: before.elements.filter((element) => !newmap.has(element.ref)),
    changed: after.elements.filter((element) => oldmap.has(element.ref) && JSON.stringify(oldmap.get(element.ref)) !== JSON.stringify(element))
  };
}

function assertserializable(value) {
  try { JSON.stringify(value); } catch (error) { throw new TypeError(`extension message is not serializable: ${error.message}`); }
}

/* ════════════════════════════════════════════════════════════════════ */
/* Section 12: extension/content.ts — content bridge runs in the isolated world and exposes bounded page facts and user initiated actions. */
/* ════════════════════════════════════════════════════════════════════ */
/**
 * content bridge runs in the isolated world and exposes bounded page facts and user initiated actions.
 * It stays classic JavaScript because Chrome injects programmatic content scripts as files.
 */

(function installglobalbridge(global) {
  const installedkey = "__saddlecontentbridge";
  const protocolversion = 1;
  const commands = ["snapshot", "readpage", "pagefacts", "clickref", "fillref"];
  const pagechannelname = "saddle.pagefacts.v1";

  function createbridge(documentref, now = () => Date.now(), options = {}) {
    let snapshotid = null;
    let sequence = 0;
    const references = new Map();
    const pagechannel = options.pagechannel ?? (typeof global.addEventListener === "function" && typeof global.postMessage === "function" ? createpagechannel(global, now, options.timeout) : null);

    function snapshotpage() {
      const nextid = `snap${++sequence}${now()}`;
      const elements = [];
      references.clear();
      const candidates = documentref.querySelectorAll?.("a,button,input,textarea,select,[role]") ?? [];
      for (const element of Array.from(candidates).slice(0, 100)) {
        if (!visible(element)) continue;
        const ref = `e${elements.length + 1}`;
        references.set(ref, { element, snapshotid: nextid });
        elements.push({ ref, role: roleof(element), name: nameof(element) });
      }
      snapshotid = nextid;
      return { version: protocolversion, snapshotid, createdat: now(), url: String(documentref.location?.href ?? ""), title: String(documentref.title ?? ""), text: String(documentref.body?.innerText ?? "").slice(0, 100000), elements };
    }

    function readpage() {
      const page = snapshotpage();
      return { version: page.version, snapshotid: page.snapshotid, url: page.url, title: page.title, text: page.text };
    }

    function resolve(ref, requestedid) {
      if (requestedid !== snapshotid) throw failure("stale_snapshot", "page snapshot is stale");
      const entry = references.get(String(ref));
      if (!entry || entry.snapshotid !== snapshotid) throw failure("unknown_reference", `unknown page reference: ${ref}`);
      return entry.element;
    }

    function handle(request) {
      if (request?.version !== protocolversion || request.type !== "command" || !commands.includes(request.command)) throw failure("invalid_message", "invalid content command");
      const payload = request.payload ?? {};
      if (request.command === "snapshot") return snapshotpage();
      if (request.command === "readpage") return readpage();
      if (request.command === "pagefacts") {
        if (!pagechannel) throw failure("page_bridge_unavailable", "page bridge is not available");
        return pagechannel.readpage();
      }
      const element = resolve(payload.ref, payload.snapshotid);
      if (request.command === "clickref") { element.click?.(); return { ref: payload.ref, clicked: true, snapshotid }; }
      if (!isfillable(element)) throw failure("not_fillable", `element is not fillable: ${payload.ref}`);
      setvalue(element, payload.value);
      return { ref: payload.ref, filled: true, snapshotid };
    }

    return { handle, snapshotpage, readpage, pagechannel };
  }

  function createpagechannel(globalref = global, now = () => Date.now(), timeout = 1500) {
    if (typeof globalref.addEventListener !== "function" || typeof globalref.postMessage !== "function") throw new TypeError("page channel requires window messaging APIs");
    if (!Number.isSafeInteger(timeout) || timeout < 1) throw new TypeError("page channel timeout must be a positive safe integer");
    const pending = new Map();
    let sequence = 0;
    const token = `token${now()}${Math.random().toString(16).slice(2)}`;

    function listener(event) {
      const response = event?.data;
      if (event?.source && event.source !== globalref) return;
      if (response?.channel !== pagechannelname || response.type !== "response" || response.token !== token) return;
      const request = pending.get(response.requestid);
      if (!request) return;
      pending.delete(response.requestid);
      globalref.clearTimeout?.(request.timer);
      request.resolve(response.payload ?? {});
    }

    function readpage() {
      const requestid = `page${now()}${++sequence}`;
      return new Promise((resolve, reject) => {
        const timer = globalref.setTimeout(() => {
          pending.delete(requestid);
          const error = new Error("page bridge response timed out");
          error.code = "page_bridge_timeout";
          reject(error);
        }, timeout);
        pending.set(requestid, { resolve, timer });
        globalref.postMessage({ channel: pagechannelname, version: 1, type: "request", requestid, token }, "*");
      });
    }

    globalref.addEventListener("message", listener);
    return { readpage, dispose() { globalref.removeEventListener?.("message", listener); for (const request of pending.values()) globalref.clearTimeout?.(request.timer); pending.clear(); } };
  }

  function install(runtime = global.chrome?.runtime, documentref = global.document) {
    if (!runtime?.onMessage || !documentref) throw new TypeError("content bridge requires runtime and document");
    if (global[installedkey]) return global[installedkey];
    const bridge = createbridge(documentref);
    const listener = (message, sender, sendresponse) => {
      Promise.resolve().then(() => bridge.handle(message)).then((payload) => sendresponse({ version: protocolversion, type: "response", id: `resp${Date.now()}`, requestid: message?.id, payload })).catch((error) => sendresponse({ version: protocolversion, type: "error", id: `err${Date.now()}`, requestid: message?.id, error: { code: error.code ?? "content_error", message: error.message } }));
      return true;
    };
    runtime.onMessage.addListener(listener);
    global[installedkey] = { bridge, listener, dispose() { runtime.onMessage.removeListener?.(listener); delete global[installedkey]; } };
    return global[installedkey];
  }

  function visible(element) {
    const style = global.getComputedStyle?.(element);
    if (style && (style.display === "none" || style.visibility === "hidden")) return false;
    return typeof element.getClientRects !== "function" || element.getClientRects().length > 0;
  }

  function roleof(element) { return String(element.getAttribute?.("role") || element.tagName || "generic").toLowerCase(); }
  function nameof(element) { return String(element.getAttribute?.("aria-label") || element.innerText || element.textContent || element.getAttribute?.("placeholder") || "").trim().replace(/\s+/g, " ").slice(0, 200); }
  function isfillable(element) { return ["INPUT", "TEXTAREA"].includes(String(element.tagName).toUpperCase()); }
  function setvalue(element, value) { element.value = String(value ?? ""); element.dispatchEvent?.(new Event("input", { bubbles: true })); element.dispatchEvent?.(new Event("change", { bubbles: true })); }
  function failure(code, message) { const error = new Error(message); error.code = code; return error; }

  global.saddlecontent = { createbridge, createpagechannel, install };
  if (global.chrome?.runtime?.onMessage && global.document) install();
})(globalThis);

/* ════════════════════════════════════════════════════════════════════ */
/* Section 13: extension/popup.ts — popup sends user initiated read commands through the service worker. */
/* ════════════════════════════════════════════════════════════════════ */
/**
 * popup sends user initiated read commands through the service worker.
 * The DOM bootstrap of the former extension/popup.ts runs only when a
 * document exists (the popup page of the built extension); importing the
 * merged module from Node never touches the DOM.
 */

if (typeof document !== "undefined") {
const status = document.querySelector("#status");
const output = document.querySelector("#output");

for (const button of document.querySelectorAll("[data-command]")) button.addEventListener("click", () => request(button.dataset.command));

async function request(command) {
  try {
    status.textContent = "Reading active tab…";
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) throw new Error("no active tab");
    const response = await chrome.runtime.sendMessage(createcommand(command, { tabid: tab.id }));
    if (response?.type === "error") throw new Error(response.error?.message ?? "extension request failed");
    output.textContent = JSON.stringify(response?.payload ?? response, null, 2);
    status.textContent = "Complete.";
  } catch (error) {
    status.textContent = "Request failed.";
    output.textContent = String(error.message ?? error);
  }
}
}

/* ════════════════════════════════════════════════════════════════════ */
/* Section 14: extension/pagebridge.ts — page bridge exposes bounded, read-only page facts to the isolated content world. */
/* ════════════════════════════════════════════════════════════════════ */
/**
 * page bridge exposes bounded, read-only page facts to the isolated content world.
 * It never executes page supplied commands and never forwards extension credentials.
 */

(function installpagebridge(global) {
  const channel = "saddle.pagefacts.v1";
  const installedkey = "__saddlepagebridge";

  function createpagebridge(globalref = global) {
    function readpage() {
      const documentref = globalref.document;
      return {
        url: String(documentref?.location?.href ?? ""),
        title: String(documentref?.title ?? "").slice(0, 500),
        text: String(documentref?.body?.innerText ?? "").slice(0, 100000)
      };
    }

    function listener(event) {
      const request = event?.data;
      if (event?.source && event.source !== globalref) return;
      if (request?.channel !== channel || request.type !== "request" || typeof request.requestid !== "string" || typeof request.token !== "string") return;
      globalref.postMessage({ channel, version: 1, type: "response", requestid: request.requestid, token: request.token, payload: readpage() }, "*");
    }

    return { channel, listener, readpage };
  }

  function install(globalref = global) {
    if (typeof globalref?.addEventListener !== "function" || !globalref.document) throw new TypeError("page bridge requires a window and document");
    if (globalref[installedkey]) return globalref[installedkey];
    const bridge = createpagebridge(globalref);
    globalref.addEventListener("message", bridge.listener);
    globalref[installedkey] = { ...bridge, dispose() { globalref.removeEventListener?.("message", bridge.listener); delete globalref[installedkey]; } };
    return globalref[installedkey];
  }

  global.saddlepagebridge = { channel, createpagebridge, install };
  if (global.document && typeof global.addEventListener === "function") install(global);
})(globalThis);

/* ════════════════════════════════════════════════════════════════════ */
/* Section 15: extension/worker.ts — worker binds the generic extension router to the Manifest V3 runtime APIs. */
/* ════════════════════════════════════════════════════════════════════ */
/**
 * worker binds the generic extension router to the Manifest V3 runtime APIs.
 */


/** Installs the service worker listeners against a caller supplied Chrome API object. */
export function startworker(chromeapi = globalThis.chrome) {
  if (!chromeapi?.runtime?.onMessage || !chromeapi?.tabs || !chromeapi?.scripting) throw new TypeError("extension worker requires runtime tabs and scripting APIs");
  const router = createworkerrouter({ tabs: chromeapi.tabs, scripting: chromeapi.scripting, storage: chromeapi.storage?.session });
  const listener = (message, sender, sendresponse) => {
    router.handle(message, sender).then(sendresponse).catch((error) => sendresponse(createerror(message, error)));
    return true;
  };
  const startup = () => router.rehydrate().catch(() => undefined);
  chromeapi.runtime.onMessage.addListener(listener);
  chromeapi.runtime.onStartup?.addListener(startup);
  return { router, dispose() { chromeapi.runtime.onMessage.removeListener?.(listener); chromeapi.runtime.onStartup?.removeListener?.(startup); } };
}

if (globalThis.chrome?.runtime?.onMessage) startworker();

/* ════════════════════════════════════════════════════════════════════ */
/* Section 16: extension/serviceworker.ts — service worker router forwards user initiated commands to the active tab and persists resumable state. */
/* ════════════════════════════════════════════════════════════════════ */
/**
 * service worker router forwards user initiated commands to the active tab and persists resumable state.
 */


/** Creates a browser independent router around Chrome tabs, scripting and storage APIs. */
export function createworkerrouter(options = {}) {
  const tabs = options.tabs;
  const scripting = options.scripting;
  const storage = options.storage;
  const contentfile = options.contentfile ?? "content.js";
  const statekey = options.statekey ?? "saddleextensionstate";
  const maxpending = options.maxpending ?? 32;
  if (typeof tabs?.sendMessage !== "function") throw new TypeError("extension router requires tabs.sendMessage");
  if (!Number.isSafeInteger(maxpending) || maxpending < 1) throw new TypeError("extension router maxpending must be a positive safe integer");

  async function ensurecontent(tabid) {
    if (!Number.isInteger(tabid)) throw new TypeError("extension command requires a tab id");
    if (typeof scripting?.executeScript !== "function") throw new TypeError("extension router requires scripting.executeScript");
    await scripting.executeScript({ target: { tabId: tabid }, files: [contentfile] });
  }

  async function readstate() {
    if (typeof storage?.get !== "function") return {};
    const result = await storage.get(statekey);
    return result?.[statekey] ?? {};
  }

  async function savestate(value) {
    if (typeof storage?.set === "function") await storage.set({ [statekey]: value });
  }

  async function pendingstate() {
    const value = await readstate();
    return { ...value, pending: Array.isArray(value.pending) ? value.pending.filter(validpending) : [] };
  }

  async function enqueue(request, sender) {
    const state = await pendingstate();
    const record = pendingrecord(request, sender);
    const pending = state.pending.filter((item) => item.requestid !== record.requestid);
    if (pending.length >= maxpending && !state.pending.some((item) => item.requestid === record.requestid)) throw extensionerror("PENDING_LIMIT", "extension pending command limit reached");
    pending.push(record);
    await savestate({ ...state, pending });
    return record;
  }

  async function complete(requestid, patch = {}) {
    const state = await pendingstate();
    await savestate({ ...state, ...patch, pending: state.pending.filter((item) => item.requestid !== requestid) });
  }

  async function markfailure(requestid, error) {
    const state = await pendingstate();
    const pending = state.pending.map((item) => item.requestid === requestid ? { ...item, attempts: item.attempts + 1, lasterror: { code: String(error?.code ?? "extension_error"), message: String(error?.message ?? error) }, updatedat: Date.now() } : item);
    await savestate({ ...state, pending });
  }

  async function dispatch(request, sender = {}) {
    const tabid = request.payload?.tabid ?? sender.tab?.id;
    await ensurecontent(tabid);
    const response = await tabs.sendMessage(tabid, request);
    return decorate(response, sender, tabid);
  }

  async function handle(message, sender = {}) {
    const request = assertmessage(message);
    if (request.type !== "command") throw new TypeError("extension router accepts commands only");
    const tabid = request.payload?.tabid ?? sender.tab?.id;
    await enqueue(request, { ...sender, tab: { ...sender.tab, id: tabid } });
    try {
      const response = await dispatch(request, { ...sender, tab: { ...sender.tab, id: tabid } });
    await complete(request.id, response?.type === "response" && response.payload?.snapshotid ? { tabid, snapshotid: response.payload.snapshotid, frameid: response.payload.frameid, windowid: response.payload.windowid, updatedat: Date.now() } : { updatedat: Date.now() });
      return response;
    } catch (error) {
      await markfailure(request.id, error);
      throw error;
    }
  }

  async function rehydrate() { return pendingstate(); }

  async function resume(requestid, sender = {}) {
    const state = await pendingstate();
    const pending = state.pending.find((item) => item.requestid === requestid);
    if (!pending) throw extensionerror("PENDING_NOT_FOUND", `pending command not found: ${requestid}`);
    const tabid = pending.tabid ?? sender.tab?.id;
    const response = await dispatch(pending.message, { ...sender, frameId: pending.frameid ?? sender.frameId, tab: { ...sender.tab, id: tabid, windowId: pending.windowid ?? sender.tab?.windowId } });
    await complete(requestid, response?.type === "response" && response.payload?.snapshotid ? { tabid, snapshotid: response.payload.snapshotid, frameid: response.payload.frameid, windowid: response.payload.windowid, updatedat: Date.now() } : { updatedat: Date.now() });
    return response;
  }

  async function cancel(requestid) { const state = await pendingstate(); await savestate({ ...state, pending: state.pending.filter((item) => item.requestid !== requestid) }); }

  return { ensurecontent, readstate, savestate, rehydrate, enqueue, resume, cancel, handle };
}

function pendingrecord(request, sender = {}) { return { requestid: request.id, command: request.command, message: request, tabid: request.payload?.tabid ?? sender.tab?.id, frameid: request.payload?.frameid ?? sender.frameId, windowid: request.payload?.windowid ?? sender.tab?.windowId, attempts: 0, createdat: Date.now(), updatedat: Date.now() }; }

function decorate(response, sender, tabid) {
  if (response?.type !== "response" || !response.payload || typeof response.payload !== "object" || !response.payload.snapshotid) return response;
  const payload = { ...response.payload, tabid: response.payload.tabid ?? (tabid === undefined ? undefined : String(tabid)), frameid: response.payload.frameid ?? (sender.frameId === undefined ? undefined : String(sender.frameId)), windowid: response.payload.windowid ?? (sender.tab?.windowId === undefined ? undefined : String(sender.tab.windowId)) };
  return { ...response, payload };
}

function validpending(value) { return Boolean(value && typeof value === "object" && typeof value.requestid === "string" && value.message && value.message.type === "command" && Number.isSafeInteger(value.attempts) && value.attempts >= 0); }

function extensionerror(code, message) { const error = new Error(message); error.code = code; return error; }

/* ════════════════════════════════════════════════════════════════════ */
/* Section 17: extension/build.ts — extension build adapter creates a versioned, unpacked Manifest V3 artifact for release packaging. */
/* ════════════════════════════════════════════════════════════════════ */
/**
 * extension build adapter creates a versioned, unpacked Manifest V3 artifact for release packaging.
 *
 * The migration made the adapter self-referential: the grand merge had
 * folded the seven former extension scripts into ordinal sections of
 * saddle/browser.ts and the build extracted them from that file; the
 * sections now live in THIS module (devthink/browserextension.ts), so the
 * extraction reads this own source and the artifact never depends on the
 * saddle tree again.
 */


/* a bundled module resolves the app root as its parent directory (the
   devthink build emits into build/, the published envelope into dist/);
   the source browserextension.ts sits at the devthink app root itself. */
const modulepath = resolve(dirname(fileURLToPath(import.meta.url)));
const rootpath = basename(modulepath) === "dist" || basename(modulepath) === "build" ? resolve(modulepath, "..") : modulepath;
/* the extension surface lives flat at the app root (the root-build
   doctrine): the tracked manifest, the popup page and stylesheet and the
   seed icon ladder answer beside this module under their
   extension-prefixed names (the devthink root owns its own extension
   surface, so the migrated saddle assets carry the prefix). */
const extensionassets = rootpath;
/* the artifact entries: every script of the artifact is extracted from
   its ordinal section of THIS module (the self-referential contract
   above), and every static asset copies from the extension-prefixed
   source name it rides under at the app root. The artifact filenames
   keep the stable layout the bridge shipped since the saddle (the
   manifest of record, the seven scripts, the popup page and stylesheet
   and the seed icon ladder). */
const entries = [
  { artifact: "manifest.json", source: "extensionmanifest.json" },
  { artifact: "worker.js" },
  { artifact: "serviceworker.js" },
  { artifact: "content.js" },
  { artifact: "pagebridge.js" },
  { artifact: "popup.js" },
  { artifact: "popup.html", source: "extensionpopup.html" },
  { artifact: "popup.css", source: "extensionpopup.css" },
  { artifact: "protocol.js" },
  { artifact: "permissions.js" },
  { artifact: "icon32.png", source: "extensionicon32.png" },
  { artifact: "icon64.png", source: "extensionicon64.png" },
  { artifact: "icon128.png", source: "extensionicon128.png" },
];

function parsearguments(argumentslist) {
  const options = {};
  for (let index = 0; index < argumentslist.length; index += 1) {
    const argument = argumentslist[index];
    if (argument === "--version") options.version = argumentslist[++index];
    else if (argument === "--output") options.output = argumentslist[++index];
    else
      throw new TypeError(`unsupported extension build argument: ${argument}`);
  }
  return options;
}

function validversion(version) {
  return /^\d+\.\d+\.\d+(?:[-+][0-9A-Za-z.-]+)?$/.test(String(version ?? ""));
}

/**
 * Extracts the consolidated section of one extension entry from THIS
 * module's own source. The grand merge folded the seven former extension
 * scripts into ordinal sections of saddle/browser.ts and the build read
 * them there; the wave 2 regrouping moved the sections into this file,
 * so the extraction reads browserextension.ts itself (the
 * self-referential contract) and emits each section under its stable
 * browser `.js` filename exactly the way the former per-file sources
 * were emitted.
 */
async function extensionsectionsourcetext(entry) {
  const section = entry.replace(/\.js$/, "");
  const sourcemodule = resolve(rootpath, "browserextension.ts");
  const text = await readFile(sourcemodule, "utf8");
  const pattern = new RegExp(
    `\\/\\* Section \\d+: extension\\/${section}\\.ts[^\\n]*\\*\\/\\n\\/\\*[\\u2550 ]*\\*\\/\\n([\\s\\S]*?)\\n(?=\\/\\*[\\u2550 ]*\\*\\/\\n\\/\\* Section \\d+:|$)`,
  );
  const match = text.match(pattern);
  if (!match) throw new TypeError(`extension section not found: ${section}`);
  return match[1];
}

/** Resolves a static interface asset of the extension from the app root. */
async function resolveasset(source) {
  return resolve(extensionassets, source);
}

/** Builds the extension into an isolated directory and returns its manifest. */
export async function buildextension(options = {}) {
  const packagefile = JSON.parse(
    await readFile(resolve(rootpath, "package.json"), "utf8"),
  );
  const version = String(options.version ?? packagefile.version);
  if (!validversion(version))
    throw new TypeError(`invalid extension version: ${version}`);
  /* the default output of the migration: build/browserextension — the
     build/extension directory is owned by the devthink extension build
     (build.ts assembles the devthink extension of record there), so the
     saddle bridge artifact keeps its own isolated directory beside it. */
  const output = resolve(process.cwd(), options.output ?? "build/browserextension");
  await rm(output, { force: true, recursive: true });
  await mkdir(output, { recursive: true });
  const manifest = JSON.parse(
    await readFile(resolve(extensionassets, "extensionmanifest.json"), "utf8"),
  );
  manifest.version = version;
  for (const entry of entries) {
    const destination = resolve(output, entry.artifact);
    await mkdir(dirname(destination), { recursive: true });
    if (entry.artifact === "manifest.json")
      await writeFile(destination, `${JSON.stringify(manifest, null, 2)}\n`);
    else if (/\.js$/.test(entry.artifact)) {
      await writeFile(destination, `${await extensionsectionsourcetext(entry.artifact)}\n`);
    } else {
      const source = await resolveasset(entry.source ?? entry.artifact);
      await cp(source, destination);
    }
  }
  return { output, manifest };
}

if (process.argv[1] === fileURLToPath(import.meta.url))
  buildextension(parsearguments(process.argv.slice(2)))
    .then(({ output }) => {
      console.log(`extension artifact: ${output}`);
    })
    .catch((error) => {
      console.error(error.message);
      process.exitCode = 1;
    });
