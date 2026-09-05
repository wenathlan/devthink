import { describe, expect, it, vi } from "vitest";

/**
 * The version one sunset notice and the one time migration prompt of the 2.0.0 release candidate (roadmap rc.2 items 50, 51 and 52).
 * The harness drives the real background module under a fake chrome: the inbound mcp frame intake marks the once-per-session sunset state a below floor negotiate frame refuses, the onMessage router answers the popup dismissal, the onInstalled update branch fires the migration prompt once through the notification path the trigger notifications already use, and the popup module renders both banner cards with the migration guide reference.
 */

const fakeextensionid = "devthinkfaketest0000000000000";

/** One recorded browser notification the fake chrome create call kept. */
type fakenotification = { id: string; options: Record<string, unknown> };

/** The shared fake chrome state: the storage map the background memory adapter reads and writes, the notification recorder, the message recorder and the listener registry the tests fire. */
type fakechromestate = {
  storage: Map<string, unknown>;
  notifications: fakenotification[];
  messages: Array<Record<string, unknown>>;
  clipboardwrites: unknown[][];
  listeners: Record<string, Array<(payload: unknown, sender: unknown, sendresponse: (value: unknown) => void) => unknown>>;
};

/** One fake dom node: the popup renders into stub nodes because the popup harness runs in node without a dom. */
class fakenode {
  textContent = "";
  className = "";
  hidden = false;
  value = "";
  disabled = false;
  type = "button";
  title = "";
  children: fakenode[] = [];
  removed = false;
  readonly attributes: Record<string, string> = {};
  readonly dataset: Record<string, string> = {};
  readonly listeners: Record<string, Array<() => void>> = {};
  addEventListener(kind: string, listener: () => void): void { (this.listeners[kind] ??= []).push(listener); }
  removeEventListener(): void { /* the popup harness never detaches mid test */ }
  appendChild(child: fakenode): fakenode { this.children.push(child); return child; }
  append(...nodes: Array<fakenode | string>): void { for (const node of nodes) this.children.push(node instanceof fakenode ? node : Object.assign(new fakenode(), { textContent: node })); }
  replaceChildren(...nodes: fakenode[]): void { this.children = nodes; }
  setAttribute(name: string, value: string): void { this.attributes[name] = value; }
  remove(): void { this.removed = true; }
  focus(): void { /* the popup harness keeps focus calls inert */ }
  /** Collects the text of the node tree so banner assertions read the rendered card. */
  textof(): string { return `${this.textContent} ${this.children.map(child => child.textof()).join(" ")}`; }
}

/** The fake document the popup module queries: every selector answers an inert stub node and created nodes record into the body. */
function fakedocument(state: fakechromestate): { body: fakenode; created: fakenode[] } {
  const body = new fakenode();
  const created: fakenode[] = [];
  const documentstub = {
    body,
    querySelector: (): fakenode => new fakenode(),
    createElement: (): fakenode => { const node = new fakenode(); created.push(node); return node; },
    addEventListener: (): void => { /* the popup keydown handler stays inert under the harness */ },
  };
  Object.defineProperty(globalThis, "document", { value: documentstub, configurable: true });
  void state;
  return { body, created };
}

/** Installs the fake chrome the background and popup modules run against: local storage over a map, the runtime listener registry, the tabs and windows seams the executors read, the notification recorder and the clipboard write recorder. */
function installfakechrome(): fakechromestate {
  const state: fakechromestate = { storage: new Map(), notifications: [], messages: [], clipboardwrites: [], listeners: {} };
  const on = (name: string) => ({ addListener: (callback: (payload: never, sender: never, sendresponse: (value: never) => void) => unknown) => { (state.listeners[name] ??= []).push(callback as never); } });
  const manifest = { version: "2.0.0", name: "devthink", permissions: ["storage"], optional_permissions: [], optional_host_permissions: [] };
  const chromeapi = {
    runtime: {
      id: fakeextensionid,
      getURL: (path: string) => `chrome-extension://${fakeextensionid}/${path}`,
      getManifest: () => manifest,
      onMessage: on("message"),
      onStartup: on("startup"),
      onInstalled: on("installed"),
      onConnect: on("connect"),
      sendMessage: async (message: Record<string, unknown>) => { state.messages.push(message); return { ok: true, value: {} }; },
    },
    tabs: { onUpdated: on("tabsupdated"), onActivated: on("tabsactivated"), onRemoved: on("tabsremoved"), captureVisibleTab: async () => "data:image/png;base64,iVBORw0KGgoAAAANSUhEUg==" },
    windows: { WINDOW_ID_CURRENT: -2 },
    storage: { local: { get: async (key: string) => ({ [key]: state.storage.get(key) }), set: async (items: Record<string, unknown>) => { for (const [key, value] of Object.entries(items)) state.storage.set(key, value); } } },
    action: { setBadgeText: async () => undefined },
    notifications: { create: (id: string, options: Record<string, unknown>) => { state.notifications.push({ id, options }); } },
    permissions: { contains: async () => true, request: async () => true },
  };
  (globalThis as unknown as Record<string, unknown>).chrome = chromeapi;
  (globalThis as unknown as Record<string, unknown>).self = { addEventListener: () => undefined };
  Object.defineProperty(globalThis, "navigator", { value: { onLine: true, clipboard: { write: async (items: unknown[]) => { state.clipboardwrites.push(items); }, readText: async () => "" } }, configurable: true });
  return state;
}

/** Fires the onInstalled listener the background router registered with the chrome contract shape: the runtime detail, the inert sender and an unused sendresponse keep the typed signature honest. */
function fireinstalled(state: fakechromestate, detail: { reason: string; previousVersion?: string }): void {
  const listener = state.listeners.installed?.[0];
  if (listener === undefined) throw new Error("The background router registered no onInstalled listener.");
  listener(detail, { id: fakeextensionid, url: `chrome-extension://${fakeextensionid}/background.html` }, () => undefined);
}

/** Lets the module load side effects of the background service worker settle before the test asserts on the storage. */
async function settled(): Promise<void> { await new Promise(resolve => setTimeout(resolve, 60)); }

/** Fires one recorded listener and awaits the sendresponse callback the chrome messaging contract answers through. */
async function firemessage(state: fakechromestate, message: Record<string, unknown>): Promise<{ ok: boolean; value?: unknown; error?: string }> {
  const listener = state.listeners.message?.[0];
  if (listener === undefined) throw new Error("The background router registered no onMessage listener.");
  return await new Promise(resolve => { listener(message, { id: fakeextensionid, url: `chrome-extension://${fakeextensionid}/popup.html` }, value => resolve(value as { ok: boolean; value?: unknown; error?: string })); });
}

/** The below floor negotiate frame a version one client sends. */
const v1frame = JSON.stringify({ jsonrpc: "2.0", id: 7, method: "negotiate", params: { capabilities: { protocolmajor: 1 } } });
/** The frozen major two negotiate frame an agreeing client sends. */
const v2frame = JSON.stringify({ jsonrpc: "2.0", id: 8, method: "negotiate", params: { capabilities: { protocolmajor: 2 } } });

describe("the version one sunset notice of the negotiation banner", () => {
  it("marks the once-per-session state when a below floor negotiate frame refuses", async () => {
    const state = installfakechrome();
    vi.resetModules();
    const background = await import("../background.js");
    await settled();
    state.storage.set("mcpstate", { state: "running", startedat: Date.now() });
    const refusal = await background.processmcpframe(v1frame, "", "stdio");
    expect(refusal.error?.message).toContain("below the supported floor");
    expect(refusal.error?.message).toContain("migrateplan");
    expect(refusal.error?.message).toContain("docs/migrationguide.md");
    const marked = state.storage.get("v1sunset") as { at: number; declared: number; clientid: string; dismissedat?: number };
    expect(marked.declared).toBe(1);
    expect(marked.dismissedat).toBeUndefined();
    expect(marked.clientid).toContain("client-");
    /* a second refusal of the same session changes nothing: the once-per-session flag holds */
    const second = await background.processmcpframe(v1frame, "", "stdio");
    expect(second.error?.message).toContain("below the supported floor");
    expect(state.storage.get("v1sunset")).toEqual(marked);
    /* a frozen major two frame refuses nothing and marks nothing */
    await background.processmcpframe(v2frame, "", "stdio");
    expect(state.storage.get("v1sunset")).toEqual(marked);
  });

  it("answers the popup dismissal through the surface command family and resets the banner state for the session", async () => {
    const state = installfakechrome();
    vi.resetModules();
    const background = await import("../background.js");
    await settled();
    state.storage.set("mcpstate", { state: "running", startedat: Date.now() });
    await background.processmcpframe(v1frame, "", "stdio");
    const reply = await firemessage(state, { kind: "surface", v1sunset: { dismiss: true } });
    expect(reply.ok).toBe(true);
    expect((reply.value as { visible: boolean }).visible).toBe(false);
    const dismissed = state.storage.get("v1sunset") as { at: number; declared: number; clientid: string; dismissedat?: number };
    expect(dismissed.dismissedat).toBeGreaterThan(0);
    /* a later below floor frame of the same session keeps the dismissal: the banner stays reset for the session */
    await background.processmcpframe(v1frame, "", "stdio");
    expect((state.storage.get("v1sunset") as { dismissedat?: number }).dismissedat).toBe(dismissed.dismissedat);
    const audittrail = state.storage.get("audit") as Array<{ kind: string; summary: string }>;
    expect(audittrail.some(entry => entry.kind === "protocol" && /version one sunset notice marked the session/.test(entry.summary))).toBe(true);
    expect(audittrail.some(entry => entry.kind === "surface" && /dismissed the version one sunset banner/.test(entry.summary))).toBe(true);
  });

  it("renders the banner card in the popup with the sunset text, the guide reference and the dismissal wiring", async () => {
    const state = installfakechrome();
    const dom = fakedocument(state);
    vi.resetModules();
    const popup = await import("../web/extension/popup.js");
    const marked = { at: Date.now(), declared: 1, clientid: "client-1" };
    const card = popup.v1sunsetbannercard(marked);
    expect(card.visible).toBe(true);
    expect(card.title).toContain("Protocol v1 retired");
    expect(card.body).toContain("Protocol v1 retired — this client cannot connect.");
    expect(card.body).toContain("The migration guide and the migrateplan command upgrade v1 plans.");
    expect(card.guide).toBe("docs/migrationguide.md");
    expect(card.command).toContain("migrateplan");
    expect(popup.v1sunsetbannercard({ ...marked, dismissedat: Date.now() }).visible).toBe(false);
    expect(popup.v1sunsetbannercard(undefined).visible).toBe(false);
    /* the rendered card carries the sunset text and the dismiss button routes the surface dismissal */
    popup.renderv1sunsetbanner(marked);
    expect(dom.body.children).toContain(popup.renderv1sunsetbanner.name === "renderv1sunsetbanner" ? dom.body.children[dom.body.children.length - 1] : dom.body.children[dom.body.children.length - 1]);
    const section = dom.body.children[dom.body.children.length - 1] as fakenode & { textof(): string };
    expect(section.textof()).toContain("Protocol v1 retired");
    expect(section.textof()).toContain("docs/migrationguide.md");
    expect(section.textof()).toContain("migrateplan");
    const dismiss = section.children.find(child => (child.listeners.click ?? []).length > 0);
    expect(dismiss).toBeDefined();
    (dismiss as fakenode).listeners.click?.[0]?.();
    await settled();
    expect(state.messages.some(message => message.kind === "surface" && (message as { v1sunset?: { dismiss?: boolean } }).v1sunset?.dismiss === true)).toBe(true);
    popup.renderv1sunsetbanner({ ...marked, dismissedat: Date.now() });
    expect(section.removed).toBe(true);
  });
});

describe("the one time version one migration prompt", () => {
  it("prompts once on an update from a 1.x release through the notification path the triggers already use", async () => {
    const state = installfakechrome();
    vi.resetModules();
    const background = await import("../background.js");
    await settled();
    fireinstalled(state, { reason: "update", previousVersion: "1.1.99" });
    await settled();
    expect(state.notifications).toHaveLength(1);
    const prompt = state.notifications[0] as fakenotification;
    expect(prompt.options.title).toBe("Devthink migration prompt");
    expect(String(prompt.options.message)).toContain("migrateplan");
    expect(String(prompt.options.message)).toContain("docs/migrationguide.md");
    const record = state.storage.get("migrationprompt") as { promptedat: number; previousversion: string; command: string; migrationpromptdismissed?: boolean; dismissedat?: number };
    expect(record.previousversion).toBe("1.1.99");
    expect(record.command).toContain("devthink migrateplan");
    expect(record.migrationpromptdismissed).toBeUndefined();
    const history = state.storage.get("notificationhistory") as Array<{ title: string; body: string; deeplink: string }>;
    expect(history).toHaveLength(1);
    expect(history[0]?.body).toContain("migrateplan");
    expect(history[0]?.deeplink).toContain("devthink://migration");
    /* the flag gates the second firing: a second update of the same install prompts nothing */
    fireinstalled(state, { reason: "update", previousVersion: "1.1.99" });
    await settled();
    expect(state.notifications).toHaveLength(1);
    expect((state.storage.get("notificationhistory") as unknown[])).toHaveLength(1);
    /* an update that already sits on the 2.x line prompts nothing and writes no record */
    state.storage.delete("migrationprompt");
    state.notifications.length = 0;
    fireinstalled(state, { reason: "update", previousVersion: "2.0.0" });
    await settled();
    expect(state.notifications).toHaveLength(0);
    expect(state.storage.get("migrationprompt")).toBeUndefined();
    /* an unknowable previous version answers from the stored lastpermissions install marker */
    state.storage.set("lastpermissions", { permissions: ["required:storage"], version: "1.1.95" });
    fireinstalled(state, { reason: "update" });
    await settled();
    expect(state.notifications).toHaveLength(1);
    expect((state.storage.get("migrationprompt") as { previousversion: string }).previousversion).toBe("1.1.95");
  });

  it("keeps a dismissed prompt from ever appearing again through the persistent flag", async () => {
    const state = installfakechrome();
    vi.resetModules();
    const background = await import("../background.js");
    await settled();
    fireinstalled(state, { reason: "update", previousVersion: "1.1.98" });
    await settled();
    expect(state.notifications).toHaveLength(1);
    const reply = await firemessage(state, { kind: "surface", migrationprompt: { dismiss: true } });
    expect(reply.ok).toBe(true);
    expect((reply.value as { visible: boolean }).visible).toBe(false);
    const dismissed = state.storage.get("migrationprompt") as { migrationpromptdismissed?: boolean; dismissedat?: number };
    expect(dismissed.migrationpromptdismissed).toBe(true);
    expect(dismissed.dismissedat).toBeGreaterThan(0);
    fireinstalled(state, { reason: "update", previousVersion: "1.1.98" });
    await settled();
    expect(state.notifications).toHaveLength(1);
    const migrate = await firemessage(state, { kind: "surface", migrationprompt: { migrate: true } });
    expect((migrate.value as { command: string }).command).toContain("devthink migrateplan");
    expect((migrate.value as { guide: string }).guide).toBe("docs/migrationguide.md");
  });

  it("renders the migration prompt card in the popup with the migrate action and the persistent dismissal wiring", async () => {
    const state = installfakechrome();
    const dom = fakedocument(state);
    vi.resetModules();
    const popup = await import("../web/extension/popup.js");
    const prompted = { promptedat: Date.now(), previousversion: "1.1.99", command: "devthink migrateplan <plan source> --format v1 --out <converted plan>" };
    const card = popup.migrationpromptcard(prompted);
    expect(card.visible).toBe(true);
    expect(card.title).toContain("Version one migration");
    expect(card.body).toContain("1.1.99");
    expect(card.guide).toBe("docs/migrationguide.md");
    expect(card.command).toContain("--format v1");
    expect(card.migrate).toBe("Migrate");
    expect(popup.migrationpromptcard({ ...prompted, migrationpromptdismissed: true }).visible).toBe(false);
    expect(popup.migrationpromptcard(undefined).visible).toBe(false);
    popup.rendermigrationpromptbanner(prompted);
    const section = dom.body.children[dom.body.children.length - 1] as fakenode & { textof(): string };
    expect(section.textof()).toContain("Version one migration");
    expect(section.textof()).toContain("docs/migrationguide.md");
    const buttons = section.children.filter(child => (child.listeners.click ?? []).length > 0);
    expect(buttons).toHaveLength(2);
    (buttons[1] as fakenode).listeners.click?.[0]?.();
    await settled();
    expect(state.messages.some(message => message.kind === "surface" && (message as { migrationprompt?: { dismiss?: boolean } }).migrationprompt?.dismiss === true)).toBe(true);
    popup.rendermigrationpromptbanner({ ...prompted, migrationpromptdismissed: true });
    expect(section.removed).toBe(true);
  });
});
