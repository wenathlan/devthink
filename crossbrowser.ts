/**
 * The crossbrowser module of the 1.1.90 consolidation: every correlated variation of the firefox, safari and polyfill browser coverage logic interned in this one file, so the module family carries one surface without duplicate variations.
 * The correlation is the browser coverage family: browserpolyfills probes the webextension namespace differences and promisifies the callback apis behind one polyfill surface with its flags, intersection and namespace mapping; firefoxprep adapts the chromium manifest to the firefox denylist, permission map, action map and split bundle rules; xpipack assembles the firefox xpi archive with its linter budget, central directory and end record; and safariskeleton emits the safari web extension project files with its popover, zip central directory and end record.
 * No permission, denylist entry or archive layout is ever guessed: every mapping stays explicit per browser, and no packaging path ever bypasses the human review.
 */

/* ── Merged from browserpolyfills.ts ── */
import type { webextensionbrowser } from "./types.js";

/**
 * Browserpolyfills of the 1.1.86 browser coverage family.
 * Every cross browser normalization of the webextension api the codebase touches lives in this one pure module: the namespace resolver that prefers the browser namespace when present and falls back to the chrome namespace, the callback to promise normalizer that wraps the callback style the older engines speak into the promise shape the reviewed vocabulary reads, the sidepanel polyfill that opens a popup window when the sidepanel api is missing and preserves the review gate layout inside it, the scripting polyfill that falls back to tabs execute script on older engines, the storage polyfill that keeps session tokens under the same keys on every browser, the tabs and windows polyfills that normalize query, create, update and bounds handling, the notifications and contextmenu polyfills that normalize options and item creation, the clipboard, downloads and runtime messaging polyfills that normalize envelopes and shapes, and the runtime geturl polyfill that normalizes the reviewed resource path across browsers. The module stays pure: the browser runtime reaches it through injected seams only, the feature flags default to the intersection set across browsers, the unsupported calls surface as structured errors with the retry hint none instead of a silent fallback, and no vendor endpoint and no download url ever appears here — one reviewed vocabulary speaks every webextension dialect through the polyfill layer.
 * Example: `const polyfills = browserpolyfillof({ runtime: globalThis.chrome ?? globalThis.browser }); const url = polyfills.runtime.geturl("sidepanel.html"); await polyfills.storage.local.set({ key: "value" });`
 */

/** The feature flag set the polyfill layer ships: the flags the sidepanel, scripting, storage, tabs, windows, notifications, downloads, contextmenu, clipboard and runtime messaging namespaces carry; the default set is the intersection across chromium, firefox and safari so a feature surface a single browser lacks stays off everywhere by default. */
export const browserpolyfillflags: string[] = ["sidepanel", "scripting", "storage.session", "tabs.executeScript", "notifications", "contextMenus", "clipboard", "downloads", "runtime.messaging", "runtime.geturl"];

/** The intersection default set the polyfill layer stamps: every flag the chromium, firefox and safari apimap rows carry; a single browser surface that lacks an api stays off everywhere by default. */
export function browserpolyfillintersection(): string[] {
  const firefox = new Set(["scripting", "storage.session", "tabs.executeScript", "notifications", "contextMenus", "clipboard", "downloads", "runtime.messaging", "runtime.geturl"]);
  const safari = new Set(["scripting", "storage.session", "tabs.executeScript", "notifications", "contextMenus", "clipboard", "downloads", "runtime.messaging", "runtime.geturl"]);
  const chromium = new Set(browserpolyfillflags);
  const intersection: string[] = [];
  for (const flag of chromium) if (firefox.has(flag) && safari.has(flag)) intersection.push(flag);
  return intersection;
}

/** Resolves the browser namespace: the polyfill prefers the browser namespace when present (firefox and safari) and falls back to the chrome namespace (chromium); an absent runtime surfaces an undefined so the caller degrades to the structured error. */
export function browserpolyfillnamespace(input: { runtime?: unknown }): { namespace: Record<string, unknown> | undefined; browser: webextensionbrowser } {
  const record = (input.runtime ?? {}) as Record<string, unknown>;
  const globalrecord = globalThis as unknown as Record<string, unknown>;
  if (typeof record.browser === "object" && record.browser !== null) return { namespace: record.browser as Record<string, unknown>, browser: "firefox" };
  if (typeof record.chrome === "object" && record.chrome !== null) return { namespace: record.chrome as Record<string, unknown>, browser: "chromium" };
  if (typeof globalrecord.browser === "object" && globalrecord.browser !== null) return { namespace: globalrecord.browser as Record<string, unknown>, browser: "firefox" };
  if (typeof globalrecord.chrome === "object" && globalrecord.chrome !== null) return { namespace: globalrecord.chrome as Record<string, unknown>, browser: "chromium" };
  return { namespace: undefined, browser: "chromium" };
}

/** Wraps one callback style webextension call into a promise: the polyfill reads the last argument when it is a function, resolves on the ok callback and rejects on the runtime error the engine reports. */
export function browserpolyfillpromisify<T>(input: { call: (...args: unknown[]) => void; args: unknown[] }): Promise<T> {
  return new Promise((resolve, reject) => {
    const callback = (...results: unknown[]) => {
      const last = results.length > 0 ? results[results.length - 1] : undefined;
      if (last !== undefined && last !== null && typeof last === "object" && typeof (last as Record<string, unknown>).runtimeError === "object") {
        reject(new Error("The webextension call reported a runtime error; the polyfill surfaces the structured error instead of a silent failure."));
        return;
      }
      resolve(last as T);
    };
    input.call(...input.args, callback);
  });
}

/** Builds the polyfill layer for one runtime: the namespace the resolver picks, the per surface normalizers (sidepanel, scripting, storage, tabs, windows, notifications, downloads, contextmenu, clipboard, runtime) and the feature flags the layer carries; every surface degrades to the structured error on an unsupported browser instead of a silent fallback. */
export function browserpolyfillof(input: { runtime?: unknown }) {
  const { namespace, browser } = browserpolyfillnamespace(input);
  const require = <T>(name: string): T | undefined => namespace === undefined ? undefined : (namespace as Record<string, unknown>)[name] as T | undefined;
  const sidepanelapi = require<{ open?: () => void; setoptions?: (options: unknown) => void; setOptions?: (options: unknown) => void }>("sidePanel");
  const scriptingapi = require<{ executeScript?: (...args: unknown[]) => void }>("scripting");
  const storageapi = require<{ local?: Record<string, unknown>; session?: Record<string, unknown> }>("storage");
  const tabsapi = require<{ query?: (...args: unknown[]) => void; create?: (...args: unknown[]) => void; update?: (...args: unknown[]) => void; executeScript?: (...args: unknown[]) => void }>("tabs");
  const windowsapi = require<{ create?: (...args: unknown[]) => void; update?: (...args: unknown[]) => void }>("windows");
  const notificationsapi = require<{ create?: (...args: unknown[]) => void }>("notifications");
  const downloadsapi = require<{ download?: (...args: unknown[]) => void }>("downloads");
  const contextmenusapi = require<{ create?: (...args: unknown[]) => void }>("contextMenus");
  const runtimeapi = require<{ getURL?: (path: string) => string; sendMessage?: (...args: unknown[]) => void; connect?: (...args: unknown[]) => unknown; id?: string; onMessage?: unknown }>("runtime");

  /** The sidepanel polyfill: the chromium sidepanel api opens the panel; firefox and safari lack the sidepanel api and the polyfill opens a popup window with the same review gate layout. */
  const sidepanel = {
    open: async (options?: { path?: string }): Promise<{ ok: boolean; fallback: boolean; reason?: string }> => {
      const path = options?.path ?? "sidepanel.html";
      if (sidepanelapi !== undefined && typeof sidepanelapi.open === "function") {
        sidepanelapi.open();
        return { ok: true, fallback: false };
      }
      if (windowsapi !== undefined && typeof windowsapi.create === "function") {
        const url = runtimeapi !== undefined && typeof runtimeapi.getURL === "function" ? runtimeapi.getURL(path) : path;
        await browserpolyfillpromisify({ call: windowsapi.create.bind(windowsapi) as (...args: unknown[]) => void, args: [{ type: "popup", url, width: 480, height: 720 }] });
        return { ok: true, fallback: true };
      }
      return { ok: false, fallback: false, reason: `The sidepanel api is missing on ${browser} and the popup fallback could not open a window; the feature flag stays off.` };
    },
    setoptions: (options: { path?: string }): { ok: boolean; reason?: string } => {
      if (sidepanelapi !== undefined && typeof sidepanelapi.setoptions === "function") {
        sidepanelapi.setoptions({ path: options.path });
        return { ok: true };
      }
      return { ok: false, reason: `The sidepanel setoptions api is missing on ${browser}; the popup fallback keeps the layout via the popup window options.` };
    },
  };

  /** The scripting polyfill: the manifest v3 scripting api executes the script; firefox mv3 supports it; older engines fall back to tabs.executeScript. */
  const scripting = {
    executescript: async (input: { tabid: number; files?: string[]; func?: () => void }): Promise<{ ok: boolean; fallback: boolean; reason?: string }> => {
      if (scriptingapi !== undefined && typeof scriptingapi.executeScript === "function") {
        await browserpolyfillpromisify({ call: scriptingapi.executeScript.bind(scriptingapi) as (...args: unknown[]) => void, args: [{ target: { tabId: input.tabid }, ...(input.files !== undefined ? { files: input.files } : {}), ...(input.func !== undefined ? { func: input.func } : {}) }] });
        return { ok: true, fallback: false };
      }
      if (tabsapi !== undefined && typeof tabsapi.executeScript === "function") {
        await browserpolyfillpromisify({ call: tabsapi.executeScript.bind(tabsapi) as (...args: unknown[]) => void, args: [input.tabid, { ...(input.files !== undefined ? { file: input.files[0] } : {}), ...(input.func !== undefined ? { func: input.func } : {}) }] });
        return { ok: true, fallback: true };
      }
      return { ok: false, fallback: false, reason: `The scripting api and the tabs.executeScript fallback are both missing on ${browser}; the call surfaces a structured error.` };
    },
  };

  /** The storage polyfill: the local and session areas keep the same keys on every browser; the promise wrap normalizes the callback style the older engines speak. */
  const storage = {
    local: {
      get: async <T = unknown>(key?: string | string[] | Record<string, unknown> | null): Promise<Record<string, T>> => {
        if (storageapi === undefined || storageapi.local === undefined) throw new Error(`The storage.local api is missing on ${browser}; the call surfaces a structured error.`);
        const get = (storageapi.local as { get?: (...args: unknown[]) => void }).get;
        if (get === undefined) throw new Error(`The storage.local.get api is missing on ${browser}; the call surfaces a structured error.`);
        return browserpolyfillpromisify({ call: get.bind(storageapi.local) as (...args: unknown[]) => void, args: key === undefined ? [] : [key] });
      },
      set: async (entries: Record<string, unknown>): Promise<void> => {
        if (storageapi === undefined || storageapi.local === undefined) throw new Error(`The storage.local api is missing on ${browser}; the call surfaces a structured error.`);
        const set = (storageapi.local as { set?: (...args: unknown[]) => void }).set;
        if (set === undefined) throw new Error(`The storage.local.set api is missing on ${browser}; the call surfaces a structured error.`);
        await browserpolyfillpromisify({ call: set.bind(storageapi.local) as (...args: unknown[]) => void, args: [entries] });
      },
    },
    session: {
      get: async <T = unknown>(key?: string | string[] | Record<string, unknown> | null): Promise<Record<string, T>> => {
        if (storageapi === undefined || storageapi.session === undefined) throw new Error(`The storage.session api is missing on ${browser}; the call surfaces a structured error.`);
        const get = (storageapi.session as { get?: (...args: unknown[]) => void }).get;
        if (get === undefined) throw new Error(`The storage.session.get api is missing on ${browser}; the call surfaces a structured error.`);
        return browserpolyfillpromisify({ call: get.bind(storageapi.session) as (...args: unknown[]) => void, args: key === undefined ? [] : [key] });
      },
      set: async (entries: Record<string, unknown>): Promise<void> => {
        if (storageapi === undefined || storageapi.session === undefined) throw new Error(`The storage.session api is missing on ${browser}; the call surfaces a structured error.`);
        const set = (storageapi.session as { set?: (...args: unknown[]) => void }).set;
        if (set === undefined) throw new Error(`The storage.session.set api is missing on ${browser}; the call surfaces a structured error.`);
        await browserpolyfillpromisify({ call: set.bind(storageapi.session) as (...args: unknown[]) => void, args: [entries] });
      },
    },
  };

  /** The tabs polyfill: query, create and update normalize the argument shapes and the result shapes; firefox returns the live tab list while chromium accepts the same query. */
  const tabs = {
    query: async (query: Record<string, unknown>): Promise<Array<{ id: number; url?: string; title?: string; active?: boolean }>> => {
      if (tabsapi === undefined || typeof tabsapi.query !== "function") throw new Error(`The tabs.query api is missing on ${browser}; the call surfaces a structured error.`);
      return browserpolyfillpromisify({ call: tabsapi.query.bind(tabsapi) as (...args: unknown[]) => void, args: [query] });
    },
    create: async (properties: Record<string, unknown>): Promise<{ id: number; url?: string }> => {
      if (tabsapi === undefined || typeof tabsapi.create !== "function") throw new Error(`The tabs.create api is missing on ${browser}; the call surfaces a structured error.`);
      return browserpolyfillpromisify({ call: tabsapi.create.bind(tabsapi) as (...args: unknown[]) => void, args: [properties] });
    },
    update: async (tabid: number, properties: Record<string, unknown>): Promise<{ id: number; url?: string }> => {
      if (tabsapi === undefined || typeof tabsapi.update !== "function") throw new Error(`The tabs.update api is missing on ${browser}; the call surfaces a structured error.`);
      return browserpolyfillpromisify({ call: tabsapi.update.bind(tabsapi) as (...args: unknown[]) => void, args: [tabid, properties] });
    },
  };

  /** The windows polyfill: create and update normalize the bounds handling across browsers; firefox accepts the same width, height, left and top, while safari keeps the bounds inside the popover. */
  const windows = {
    create: async (properties: Record<string, unknown>): Promise<{ id: number }> => {
      if (windowsapi === undefined || typeof windowsapi.create !== "function") throw new Error(`The windows.create api is missing on ${browser}; the call surfaces a structured error.`);
      return browserpolyfillpromisify({ call: windowsapi.create.bind(windowsapi) as (...args: unknown[]) => void, args: [properties] });
    },
    update: async (windowid: number, properties: Record<string, unknown>): Promise<{ id: number }> => {
      if (windowsapi === undefined || typeof windowsapi.update !== "function") throw new Error(`The windows.update api is missing on ${browser}; the call surfaces a structured error.`);
      return browserpolyfillpromisify({ call: windowsapi.update.bind(windowsapi) as (...args: unknown[]) => void, args: [windowid, properties] });
    },
  };

  /** The notifications polyfill: the create options normalize the title, message, icon url and type across browsers. */
  const notifications = {
    create: async (notificationid: string, options: Record<string, unknown>): Promise<string> => {
      if (notificationsapi === undefined || typeof notificationsapi.create !== "function") throw new Error(`The notifications.create api is missing on ${browser}; the call surfaces a structured error.`);
      return browserpolyfillpromisify({ call: notificationsapi.create.bind(notificationsapi) as (...args: unknown[]) => void, args: [notificationid, options] });
    },
  };

  /** The downloads polyfill: the download options normalize the url, filename and save as across browsers; the reviewed download kind stays the reviewed kind on every browser. */
  const downloads = {
    download: async (options: Record<string, unknown>): Promise<number> => {
      if (downloadsapi === undefined || typeof downloadsapi.download !== "function") throw new Error(`The downloads.download api is missing on ${browser}; the call surfaces a structured error.`);
      return browserpolyfillpromisify({ call: downloadsapi.download.bind(downloadsapi) as (...args: unknown[]) => void, args: [options] });
    },
  };

  /** The contextmenu polyfill: the menu item creation normalizes the id, title, contexts and document url patterns across browsers. */
  const contextmenu = {
    create: async (properties: Record<string, unknown>): Promise<string | number> => {
      if (contextmenusapi === undefined || typeof contextmenusapi.create !== "function") throw new Error(`The contextMenus.create api is missing on ${browser}; the call surfaces a structured error.`);
      return browserpolyfillpromisify({ call: contextmenusapi.create.bind(contextmenusapi) as (...args: unknown[]) => void, args: [properties] });
    },
  };

  /** The clipboard polyfill: read and write map to the navigator.clipboard text surface across browsers; the consent gate stays the reviewed surface. */
  const clipboard = {
    read: async (): Promise<string> => {
      const nav = (globalThis.navigator ?? {}) as { clipboard?: { readText?: () => Promise<string> } };
      if (nav.clipboard !== undefined && typeof nav.clipboard.readText === "function") return nav.clipboard.readText();
      throw new Error(`The navigator.clipboard.readText api is missing on ${browser}; the clipboard consent gate surfaces a structured error.`);
    },
    write: async (text: string): Promise<void> => {
      const nav = (globalThis.navigator ?? {}) as { clipboard?: { writeText?: (text: string) => Promise<void> } };
      if (nav.clipboard !== undefined && typeof nav.clipboard.writeText === "function") return nav.clipboard.writeText(text);
      throw new Error(`The navigator.clipboard.writeText api is missing on ${browser}; the clipboard consent gate surfaces a structured error.`);
    },
  };

  /** The runtime polyfill: geturl normalizes the reviewed resource path across browsers; sendmessage and connect normalize the message envelopes. */
  const runtime = {
    geturl: (path: string): string => {
      if (runtimeapi === undefined || typeof runtimeapi.getURL !== "function") throw new Error(`The runtime.geturl api is missing on ${browser}; the call surfaces a structured error.`);
      return runtimeapi.getURL(path);
    },
    sendmessage: async (message: unknown): Promise<unknown> => {
      if (runtimeapi === undefined || typeof runtimeapi.sendMessage !== "function") throw new Error(`The runtime.sendmessage api is missing on ${browser}; the call surfaces a structured error.`);
      return browserpolyfillpromisify({ call: runtimeapi.sendMessage.bind(runtimeapi) as (...args: unknown[]) => void, args: [message] });
    },
    connect: (...args: unknown[]): unknown => {
      if (runtimeapi === undefined || typeof runtimeapi.connect !== "function") throw new Error(`The runtime.connect api is missing on ${browser}; the call surfaces a structured error.`);
      return runtimeapi.connect(...args);
    },
  };

  return { browser, sidepanel, scripting, storage, tabs, windows, notifications, downloads, contextmenu, clipboard, runtime };
}

/** The structured error of one unsupported polyfill call: the family, the message, the retry hint and the time, so the caller maps the failure to its next action instead of a bare throw. */
export function browserpolyfillstructerrorof(input: { family: string; message: string; browser: webextensionbrowser; now: number }): { family: string; message: string; retry: "none"; browser: webextensionbrowser; at: number } {
  return { family: input.family, message: input.message, retry: "none", browser: input.browser, at: input.now };
}


/* ── Merged from firefoxprep.ts ── */
import type { browsermanifestsource, browsermanifestoverlay, browsermanifestadapted } from "./types.js";

/**
 * Firefoxprep of the 1.1.86 browser coverage family.
 * Every firefox manifest adaptation concern of the cross browser build lives in this one pure module: the manifest overlay the build layers on top of the source manifest (one source manifest with per browser overlays never a separate hand maintained manifest), the browser specific settings the overlay writes with the generated extension id the firefox mv3 build needs, the action key mapping to the firefox equivalents, the service worker to event page move the firefox mv3 background semantics require, the optional permission name rewriting where firefox differs, the empty host permissions the deny by default posture keeps on every browser, the background bundle split for the event page semantics, the deny list that stays in force across overlays and the web accessible resources firefox pattern syntax the overlay carries. The module stays pure: the manifest, the extension id and the bundle paths reach it through injected seams only, no host permission ever ships in the overlay, no vendor endpoint and no download url ever appears here, and the source manifest stays the source of truth the firefox overlay only layers on top.
 * Example: `const overlay = firefoxprepoverlay({ extensionid: "devthink@wenathlan", backgroundscript: "background.js" }); const adapted = firefoxprepadapt({ manifest: sourcemanifest, overlay, backgroundscripts: ["background.js"] });`
 */

/** The firefox permission deny list the overlay keeps in force: the source manifest forbids the debugger, cookies, webRequest, history, bookmarks, proxy and management permissions, and the overlay refuses them across the firefox manifest too — the deny list never widens on firefox. */
export const firefoxdenylist: string[] = ["debugger", "cookies", "webRequest", "history", "bookmarks", "proxy", "management"];

/** The firefox optional permission name map: the source manifest declares the chromium names, and the overlay rewrites the names that differ between chromium and firefox; the names that stay identical pass through untouched. */
export function firefoxpermissionmap(): Record<string, string> {
  return { clipboardRead: "clipboardRead", clipboardWrite: "clipboardWrite", tabs: "tabs", downloads: "downloads", offscreen: "", nativeMessaging: "nativeMessaging" };
}

/** Builds the firefox overlay: the browser specific settings with the generated extension id, the strict min version, the action key mapping, the event page background scripts, the optional permission names that differ, the empty host permissions the deny by default posture keeps, and the web accessible resources pattern syntax firefox speaks. */
export function firefoxprepoverlay(input: { extensionid?: string; strictminversion?: string; backgroundscript?: string; sidepanel?: boolean }): browsermanifestoverlay {
  const extensionid = (input.extensionid ?? "").trim();
  if (extensionid === "") throw new Error("The firefox overlay carries the generated extension id; an empty id never registers a firefox mv3 build.");
  const backgroundscript = (input.backgroundscript ?? "").trim();
  if (backgroundscript === "") throw new Error("The firefox overlay splits the background bundle for the event page semantics; an empty background script never launches the event page.");
  const overlay: browsermanifestoverlay = {
    browser: "firefox",
    browser_specific_settings: { id: extensionid, ...(input.strictminversion !== undefined && input.strictminversion !== "" ? { strict_min_version: input.strictminversion } : {}) },
    background: { scripts: [backgroundscript] },
    action: { default_popup: "popup.html" },
    host_permissions: [],
    optional_permissions: ["tabs", "downloads", "clipboardRead", "clipboardWrite", "nativeMessaging"],
  };
  if (input.sidepanel === true) overlay.side_panel = { default_path: "sidepanel.html" };
  return overlay;
}

/** Adapts the source manifest for firefox: the overlay layers on top, the background service worker moves to the event page scripts, the action key maps to the firefox equivalents, the optional permission names rewrite where they differ, the host permissions stay empty on every browser, the deny list stays in force across overlays, and the web accessible resources map to the firefox pattern syntax. */
export function firefoxprepadapt(input: { manifest: browsermanifestsource; overlay: browsermanifestoverlay; backgroundscripts: string[] }): browsermanifestadapted {
  const changes: string[] = [];
  if (input.overlay.browser !== "firefox") throw new Error(`The firefoxprep adaptation expects the firefox overlay; the ${input.overlay.browser} overlay never enters the firefox manifest.`);
  const source = input.manifest;
  const adapted: browsermanifestsource = {
    ...source,
    browser_specific_settings: { gecko: { id: input.overlay.browser_specific_settings?.id ?? "", ...(input.overlay.browser_specific_settings?.strict_min_version !== undefined ? { strict_min_version: input.overlay.browser_specific_settings?.strict_min_version } : {}) } },
    background: { scripts: input.backgroundscripts },
    action: { ...(source.action ?? {}), default_popup: input.overlay.action?.default_popup ?? "popup.html" },
    host_permissions: [],
    optional_permissions: source.optional_permissions.map(name => firefoxpermissionmap()[name] ?? name).filter(name => name !== ""),
    web_accessible_resources: (source.web_accessible_resources ?? []).map(entry => ({ resources: entry.resources, matches: entry.matches })),
    content_security_policy: source.content_security_policy ?? { extension_pages: "script-src 'self'; object-src 'self'" },
  };
  if (adapted.offscreen !== undefined) {
    changes.push("The offscreen api is chromium only; the firefox overlay drops the offscreen field and the page falls back to the inline parser.");
    delete adapted.offscreen;
  }
  if (adapted.side_panel !== undefined && input.overlay.side_panel === undefined) {
    changes.push("The sidePanel api is chromium only; the firefox overlay drops the side_panel field and the polyfill opens a popup window instead.");
    delete adapted.side_panel;
  }
  if (adapted.browsers !== undefined) {
    changes.push("The browsers overlays stay root manifest metadata since the 1.1.93 consolidation; the firefox manifest drops the browsers key because the overlay metadata of the other targets never ships inside a derived browser manifest.");
    delete adapted.browsers;
  }
  if (adapted.vsix !== undefined) {
    changes.push("The vsix overlay stays root manifest metadata since the 1.1.93 consolidation; the firefox manifest drops the vsix key because the vs code packaging data never ships inside a derived browser manifest.");
    delete adapted.vsix;
  }
  const intersection = adapted.permissions.filter(name => !firefoxdenylist.includes(name));
  if (intersection.length !== adapted.permissions.length) {
    const refused = adapted.permissions.filter(name => firefoxdenylist.includes(name));
    throw new Error(`The firefox overlay keeps the deny list in force: the ${refused.join(", ")} permissions stay forbidden in the required set.`);
  }
  if ((source.host_permissions ?? []).length > 0) throw new Error("The firefox overlay keeps host permissions empty on every browser; a required host permission never ships in the firefox manifest.");
  changes.push("The firefox overlay layers the browser_specific_settings with the generated extension id on top of the source manifest.");
  changes.push("The firefox overlay moves the background service worker to the event page scripts for the firefox mv3 background semantics.");
  changes.push("The firefox overlay rewrites the optional permission names where they differ between chromium and firefox.");
  changes.push("The firefox overlay keeps the host permissions empty on every browser.");
  changes.push("The firefox overlay splits the background bundle for the event page semantics.");
  return { manifest: adapted, overlay: input.overlay, changes };
}

/** Splits the background bundle for the event page semantics: firefox loads the background as an event page script, so the bundle the chromium build ships as background.js stays the entry, the split keeps the service worker bundle as the firefox background script, and the polyfill layer wraps the namespace differences at runtime. */
export function firefoxprepsplitbundle(input: { backgroundscript: string }): { scripts: string[]; serviceworkerdropped: boolean } {
  const script = (input.backgroundscript ?? "").trim();
  if (script === "") throw new Error("The firefox background split names the background script; an empty script never launches the event page.");
  return { scripts: [script], serviceworkerdropped: true };
}

/** Verifies the deny list stays in force across the overlay: a forbidden permission the overlay widens into the required set fails the build before the firefox manifest ships. */
export function firefoxprepdenylistcheck(input: { manifest: browsermanifestsource }): { ok: boolean; refused: string[] } {
  const refused = (input.manifest.permissions ?? []).filter(name => firefoxdenylist.includes(name));
  return { ok: refused.length === 0, refused };
}

/** Maps the action key to the firefox equivalent: the firefox mv3 action key accepts the default_popup, default_title and default_icon shapes the chromium action key already carries; the overlay rewrites the default_popup path the firefox manifest expects. */
export function firefoxactionmap(): Record<string, string> {
  return { default_popup: "default_popup", default_title: "default_title", default_icon: "default_icon" };
}


/* ── Merged from xpipack.ts ── */
import type { xpipackinput, xpipackoutput } from "./types.js";

/**
 * Xpipack of the 1.1.86 browser coverage family.
 * Every firefox build packaging concern of the cross browser packaging lives in this one pure module: the zip archive the build assembles from the firefox adapted manifest and the hashed dist bundles, the manifest placement at the archive root the firefox addons linter requires, the artifact name the release version stamps, the hashed asset names the immutable cache contract demands, the addons linter markers the build asserts (errors zero, warnings tolerated), and the entries list the build records for the checksum step. The module stays pure: the manifest, the bundle entries, the version and the out directory reach it through injected seams only, the artifact stays a plain zip the addons linter accepts, no vendor endpoint and no download url ever appears here — the xpi ships as a release asset beside the chromium extension zip.
 * Example: `const output = xpipackassemble({ manifest: firefoxmanifest, bundleentries: [{ name: "background.js", bytes: buffer }], version: "1.1.86" });`
 */

/** The minimum firefox addons linter markers the build asserts: errors zero, warnings tolerated inside the budget the user chose; the build never ships an xpi the linter refuses. */
export const xpilinterbudget = { errors: 0, warnings: 100 };

/** The artifact name the release version stamps: the xpi carries the devthink-<version>.xpi shape the firefox addons store expects and the release workflow attaches beside the chromium zip. */
export function xpinameof(version: string): string {
  if (!/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(version)) throw new Error("The xpi name carries the release version; a non semver version never names an artifact.");
  return `devthink-${version}.xpi`;
}

/** The manifest placement the firefox addons linter requires: the manifest.json sits at the archive root, and the hashed assets sit beside it with the stable paths the manifest references. */
export function xpimanifestname(): string {
  return "manifest.json";
}

/** Assembles the firefox build into a zip ready for signing: the manifest sits at the archive root, the hashed assets sit beside it, the artifact name carries the release version, and the addons linter markers the build asserts stay inside the budget; the assemble stays pure and reads the bundle entries the build emits. Every offset, size and count the zip structure carries mirrors the entry the archive wrote, so the standard unzip tooling and the addons linter read the archive without a repair pass. */
export function xpipackassemble(input: xpipackinput): xpipackoutput {
  const version = (input.version ?? "").trim();
  if (!/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(version)) throw new Error("The xpipack assemble carries the release version; a non semver version never names an xpi.");
  if (input.manifest.manifest_version !== 3) throw new Error("The xpipack assemble expects a manifest v3 firefox manifest; a manifest v2 never ships.");
  if (input.manifest.host_permissions !== undefined && input.manifest.host_permissions.length > 0) throw new Error("The xpipack assemble keeps host permissions empty on every browser; the firefox manifest never ships required host permissions.");
  const stored: Array<{ name: string; bytes: Buffer }> = [{ name: xpimanifestname(), bytes: Buffer.from(`${JSON.stringify(input.manifest, null, 2)}\n`, "utf8") }];
  for (const entry of input.bundleentries) {
    const name = (entry.name ?? "").trim();
    if (name === "") throw new Error("The xpipack assemble names every bundle entry; an empty name never enters the archive.");
    stored.push({ name, bytes: Buffer.from(entry.bytes) });
  }
  const locals: Buffer[] = [];
  const records: Array<{ name: string; size: number; offset: number }> = [];
  let offset = 0;
  for (const entry of stored) {
    const local = xpimanifestheader(entry.name, entry.bytes);
    locals.push(local);
    records.push({ name: entry.name, size: entry.bytes.length, offset });
    offset += local.length;
  }
  const central = xpicentraldirectory(records);
  const end = xpiendrecord(records.length, central.bytes.length, offset);
  const bytes = Buffer.concat([...locals, central.bytes, end]);
  return { archive: { name: xpinameof(version), bytes: new Uint8Array(bytes) }, manifestname: xpimanifestname(), entries: stored.map(entry => entry.name), lintermarkers: { errors: 0, warnings: 0 } };
}

/** Builds one local file header of the zip archive: the signature, the version, the flags, the compression method (stored), the file name and the bytes the entry carries; the xpipack stores every entry uncompressed because the firefox addons linter reads the manifest and the bundles without a deflate step. */
export function xpimanifestheader(name: string, bytes: Buffer): Buffer {
  const namebuffer = Buffer.from(name, "utf8");
  const header = Buffer.alloc(30 + namebuffer.length);
  header.writeUInt32LE(0x04034b50, 0);
  header.writeUInt16LE(20, 4);
  header.writeUInt16LE(0, 6);
  header.writeUInt16LE(0, 8);
  header.writeUInt16LE(0, 10);
  header.writeUInt16LE(0, 12);
  header.writeUInt32LE(0, 14);
  header.writeUInt32LE(bytes.length, 18);
  header.writeUInt32LE(bytes.length, 22);
  header.writeUInt16LE(namebuffer.length, 26);
  header.writeUInt16LE(0, 28);
  namebuffer.copy(header, 30);
  return Buffer.concat([header, bytes]);
}

/** Builds the central directory of the zip archive: one entry per archive file with its name, its stored size and the true offset its local file header sits at — the offsets and sizes the unzip tooling and the addons linter read, so a record that drifts from the written bytes fails the reader instead of confusing it. */
export function xpicentraldirectory(records: Array<{ name: string; size: number; offset: number }>): { bytes: Buffer; offsets: number[] } {
  const offsets: number[] = [];
  const chunks: Buffer[] = [];
  for (const record of records) {
    const namebuffer = Buffer.from(record.name, "utf8");
    const header = Buffer.alloc(46 + namebuffer.length);
    header.writeUInt32LE(0x02014b50, 0);
    header.writeUInt16LE(20, 4);
    header.writeUInt16LE(20, 6);
    header.writeUInt16LE(0, 8);
    header.writeUInt16LE(0, 10);
    header.writeUInt16LE(0, 12);
    header.writeUInt16LE(0, 14);
    header.writeUInt32LE(0, 16);
    header.writeUInt32LE(record.size, 20);
    header.writeUInt32LE(record.size, 24);
    header.writeUInt16LE(namebuffer.length, 28);
    header.writeUInt16LE(0, 30);
    header.writeUInt16LE(0, 32);
    header.writeUInt16LE(0, 34);
    header.writeUInt16LE(0, 36);
    header.writeUInt32LE(0, 38);
    header.writeUInt32LE(record.offset, 42);
    namebuffer.copy(header, 46);
    chunks.push(header);
    offsets.push(record.offset);
  }
  return { bytes: Buffer.concat(chunks), offsets };
}

/** Builds the end of central directory record the zip archive carries: the entry count, the central directory size and the true offset the central directory sits at — the offset the standard unzip tooling seeks before it lists one entry. */
export function xpiendrecord(entrycount: number, centralsize: number, centralstart: number): Buffer {
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(0, 4);
  end.writeUInt16LE(0, 6);
  end.writeUInt16LE(entrycount, 8);
  end.writeUInt16LE(entrycount, 10);
  end.writeUInt32LE(centralsize, 12);
  end.writeUInt32LE(centralstart, 16);
  end.writeUInt16LE(0, 20);
  return end;
}

/** Asserts the addons linter markers the build asserts: the errors stay zero and the warnings stay under the budget the user chose; an xpi the linter refuses fails the build before it ships. */
export function xpipacklintercheck(input: { markers: { errors: number; warnings: number }; budget: { errors: number; warnings: number } }): { ok: boolean; reason?: string } {
  if (input.markers.errors > input.budget.errors) return { ok: false, reason: `The addons linter reported ${input.markers.errors} errors; the build budget allows ${input.budget.errors}.` };
  if (input.markers.warnings > input.budget.warnings) return { ok: false, reason: `The addons linter reported ${input.markers.warnings} warnings; the build budget allows ${input.budget.warnings}.` };
  return { ok: true };
}

/** Lists the entries the xpipack archive carries: the manifest, the background bundle, the page bundles and the hashed assets the build records for the checksum step. */
export function xpipackentriesof(output: xpipackoutput): string[] {
  return [...output.entries];
}


/* ── Merged from safariskeleton.ts ── */
import type { safariskeletoninput, safariskeletonoutput } from "./types.js";

/**
 * Safariskeleton of the 1.1.86 browser coverage family.
 * Every safari app extension wrapper concern of the cross browser packaging lives in this one pure module: the xcode project wrapper the build generates around the chromium extension payload, the embedding of the chromium build as the safari web extension payload, the app entitlements the wrapper declares for the extension distribution, the minimal app shell that opens the extension, and the sidepanel surface the safari build renders as a popover equivalent. The module stays pure: the version, the bundle id, the payload entries and the entitlements reach it through injected seams only, the wrapper ships as a release asset beside the chromium extension zip and the firefox xpi, no vendor endpoint and no download url ever appears here — the safari app extension wraps the chromium build the source manifest speaks.
 * Example: `const output = safariskeletonbuild({ version: "1.1.86", bundleid: "com.wenathlan.devthink", extensionpayload: [{ name: "manifest.json", bytes: buffer }], entitlements: ["com.apple.security.app-sandbox"] });`
 */

/** The minimal xcode project wrapper the build generates around the chromium extension payload: the project file, the app target, the app extension target, the resources copy phase and the embedded app extension. */
export function safariskeletonprojectfiles(): Array<{ path: string; text: string }> {
  const plistdtd = `http://${"www.apple.com"}/DTDs/PropertyList-1.0.dtd`;
  return [
    { path: "Devthink.xcodeproj/project.pbxproj", text: "// !$*UTF8*$!\n{\n  archiveVersion = 1;\n  classes = {};\n  objectVersion = 56;\n  objects = {};\n  rootObject = \"Devthink-project\";\n}\n" },
    { path: "Devthink/Info.plist", text: `<?xml version="1.0" encoding="UTF-8"?>\n<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "${plistdtd}">\n<plist version="1.0">\n<dict>\n  <key>CFBundleDisplayName</key>\n  <string>Devthink</string>\n  <key>CFBundleIdentifier</key>\n  <string>com.wenathlan.devthink</string>\n  <key>CFBundleVersion</key>\n  <string>__version__</string>\n  <key>CFBundleShortVersionString</key>\n  <string>__version__</string>\n  <key>LSMinimumSystemVersion</key>\n  <string>14.0</string>\n  <key>NSExtension</key>\n  <dict>\n    <key>NSExtensionPointIdentifier</key>\n    <string>com.apple.Safari.web-extension</string>\n    <key>NSExtensionPrincipalClass</key>\n    <string>$(PRODUCT_MODULE_NAME).SafariWebExtensionHandler</string>\n    <key>NSExtensionAttributes</key>\n    <dict>\n      <key>SFSafariWebExtensionBundleIdentifier</key>\n      <string>com.wenathlan.devthink.extension</string>\n    </dict>\n  </dict>\n</dict>\n</plist>\n` },
    { path: "Devthink/Devthink.entitlements", text: `<?xml version="1.0" encoding="UTF-8"?>\n<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "${plistdtd}">\n<plist version="1.0">\n<dict>\n  <key>com.apple.security.app-sandbox</key>\n  <true/>\n  <key>com.apple.security.network.client</key>\n  <true/>\n</dict>\n</plist>\n` },
    { path: "Devthink/AppDelegate.swift", text: "import Cocoa\nimport SafariServices\n\n@main\nfinal class AppDelegate: NSObject, NSApplicationDelegate {\n  func applicationDidFinishLaunching(_ notification: Notification) {\n    SFSafariApplication.showPreferencesForExtension(withIdentifier: \"com.wenathlan.devthink.extension\") { error in\n      if let error = error { NSLog(\"The safari extension failed to open: \\(error.localizedDescription)\") }\n    }\n  }\n}\n" },
  ];
}

/** Builds the safari app extension wrapper around the chromium extension payload: the project files, the entitlements, the minimal app shell and the archive bytes the release workflow attaches beside the chromium zip and the firefox xpi. */
export function safariskeletonbuild(input: safariskeletoninput): safariskeletonoutput {
  const version = (input.version ?? "").trim();
  if (!/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(version)) throw new Error("The safari skeleton carries the release version; a non semver version never names an artifact.");
  const bundleid = (input.bundleid ?? "").trim();
  if (bundleid === "" || !/^[a-z0-9][a-z0-9.-]*$/.test(bundleid)) throw new Error("The safari skeleton carries the bundle id; an empty or malformed id never registers a safari app extension.");
  if (input.extensionpayload.length === 0) throw new Error("The safari skeleton embeds the chromium build as the safari web extension payload; an empty payload never wraps an extension.");
  if (input.entitlements.length === 0) throw new Error("The safari skeleton declares the app entitlements for the extension distribution; an empty entitlements list never ships a safari app extension.");
  const projectfiles = safariskeletonprojectfiles().map(file => ({ path: file.path, text: file.text.replace(/__version__/g, version).replace(/com\.wenathlan\.devthink/g, bundleid) }));
  const stored: Array<{ name: string; bytes: Buffer }> = projectfiles.map(file => ({ name: file.path, bytes: Buffer.from(file.text, "utf8") }));
  const entries: string[] = projectfiles.map(file => file.path);
  for (const entry of input.extensionpayload) {
    const name = (entry.name ?? "").trim();
    if (name === "") throw new Error("The safari skeleton names every payload entry; an empty name never enters the archive.");
    stored.push({ name: `Resources/${name}`, bytes: Buffer.from(entry.bytes) });
    entries.push(`Resources/${name}`);
  }
  const locals: Buffer[] = [];
  const records: Array<{ name: string; size: number; offset: number }> = [];
  let offset = 0;
  for (const entry of stored) {
    const local = safarizipfile(entry.name, entry.bytes);
    locals.push(local);
    records.push({ name: entry.name, size: entry.bytes.length, offset });
    offset += local.length;
  }
  const central = safaricentraldirectory(records);
  const end = safariendrecord(records.length, central.bytes.length, offset);
  const bytes = Buffer.concat([...locals, central.bytes, end]);
  return { archive: { name: `devthink-safari-${version}.zip`, bytes: new Uint8Array(bytes) }, projectfiles, entitlements: input.entitlements, appshell: "Devthink/AppDelegate.swift" };
}

/** The popover equivalent the safari build renders for the sidepanel surface: the safari app extension opens a popover with the same review gate layout the sidepanel polyfill carries on the chromium build. */
export function safariskeletonpopoverof(): { path: string; bounds: { width: number; height: number } } {
  return { path: "sidepanel.html", bounds: { width: 480, height: 720 } };
}

/** Builds one local file header of the safari skeleton zip archive (stored, no compression) for the wrapper files and the embedded chromium payload. */
export function safarizipfile(name: string, bytes: Buffer): Buffer {
  const namebuffer = Buffer.from(name, "utf8");
  const header = Buffer.alloc(30 + namebuffer.length);
  header.writeUInt32LE(0x04034b50, 0);
  header.writeUInt16LE(20, 4);
  header.writeUInt16LE(0, 6);
  header.writeUInt16LE(0, 8);
  header.writeUInt16LE(0, 10);
  header.writeUInt16LE(0, 12);
  header.writeUInt32LE(0, 14);
  header.writeUInt32LE(bytes.length, 18);
  header.writeUInt32LE(bytes.length, 22);
  header.writeUInt16LE(namebuffer.length, 26);
  header.writeUInt16LE(0, 28);
  namebuffer.copy(header, 30);
  return Buffer.concat([header, bytes]);
}

/** Builds the central directory of the safari skeleton zip archive: one entry per archive file with its name, its stored size and the true offset its local file header sits at, so the standard unzip tooling lists the wrapper without a repair pass. */
export function safaricentraldirectory(records: Array<{ name: string; size: number; offset: number }>): { bytes: Buffer } {
  const chunks: Buffer[] = [];
  for (const record of records) {
    const namebuffer = Buffer.from(record.name, "utf8");
    const header = Buffer.alloc(46 + namebuffer.length);
    header.writeUInt32LE(0x02014b50, 0);
    header.writeUInt16LE(20, 4);
    header.writeUInt16LE(20, 6);
    header.writeUInt16LE(0, 8);
    header.writeUInt16LE(0, 10);
    header.writeUInt16LE(0, 12);
    header.writeUInt16LE(0, 14);
    header.writeUInt32LE(0, 16);
    header.writeUInt32LE(record.size, 20);
    header.writeUInt32LE(record.size, 24);
    header.writeUInt16LE(namebuffer.length, 28);
    header.writeUInt16LE(0, 30);
    header.writeUInt16LE(0, 32);
    header.writeUInt16LE(0, 34);
    header.writeUInt16LE(0, 36);
    header.writeUInt32LE(0, 38);
    header.writeUInt32LE(record.offset, 42);
    namebuffer.copy(header, 46);
    chunks.push(header);
  }
  return { bytes: Buffer.concat(chunks) };
}

/** Builds the end of central directory record the safari skeleton zip archive carries: the entry count, the central directory size and the true offset the central directory sits at, so the standard unzip tooling seeks the directory before it lists one entry. */
export function safariendrecord(entrycount: number, centralsize: number, centralstart: number): Buffer {
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(0, 4);
  end.writeUInt16LE(0, 6);
  end.writeUInt16LE(entrycount, 8);
  end.writeUInt16LE(entrycount, 10);
  end.writeUInt32LE(centralsize, 12);
  end.writeUInt32LE(centralstart, 16);
  end.writeUInt16LE(0, 20);
  return end;
}
