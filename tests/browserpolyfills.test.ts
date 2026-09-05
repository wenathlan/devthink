import { describe, expect, it } from "vitest";
import { browserpolyfillintersection, browserpolyfillnamespace, browserpolyfillpromisify, browserpolyfillof, browserpolyfillstructerrorof } from "../crossbrowser.js";

describe("browserpolyfills", () => {
  it("prefers the browser namespace when present and falls back to the chrome namespace", () => {
    const firefox = browserpolyfillnamespace({ runtime: { browser: { runtime: { id: "abc" } } } });
    expect(firefox.browser).toBe("firefox");
    expect(firefox.namespace).toBeDefined();
    const chromium = browserpolyfillnamespace({ runtime: { chrome: { runtime: { id: "abc" } } } });
    expect(chromium.browser).toBe("chromium");
    expect(chromium.namespace).toBeDefined();
    const neither = browserpolyfillnamespace({ runtime: {} });
    expect(neither.browser).toBe("chromium");
    expect(neither.namespace).toBeUndefined();
  });

  it("normalizes the callback style into a promise across browsers", async () => {
    const calls: unknown[] = [];
    const call = (...args: unknown[]) => { for (const a of args) calls.push(a); const callback = args[args.length - 1]; if (typeof callback === "function") callback({ ok: true }); };
    const result = await browserpolyfillpromisify<unknown>({ call, args: ["first"] });
    expect(result).toEqual({ ok: true });
    expect(calls.length).toBe(2);
  });

  it("opens a popup window when the sidepanel api is missing on firefox", async () => {
    const windows = { create: (...args: unknown[]) => { const callback = args[args.length - 1]; if (typeof callback === "function") callback({ id: 1 }); } };
    const runtime = { id: "abc", getURL: (path: string) => `moz-extension://abc/${path}` };
    const polyfills = browserpolyfillof({ runtime: { browser: { runtime, windows } } });
    const result = await polyfills.sidepanel.open({ path: "sidepanel.html" });
    expect(result.ok).toBe(true);
    expect(result.fallback).toBe(true);
  });

  it("falls back to tabs.executeScript on older engines when the scripting api is missing", async () => {
    const calls: string[] = [];
    const tabs = { executeScript: (...args: unknown[]) => { calls.push("executeScript"); const callback = args[args.length - 1]; if (typeof callback === "function") callback([{ result: true }]); } };
    const runtime = { id: "abc" };
    const polyfills = browserpolyfillof({ runtime: { browser: { runtime, tabs } } });
    const result = await polyfills.scripting.executescript({ tabid: 1, files: ["pagebridge.js"] });
    expect(result.ok).toBe(true);
    expect(result.fallback).toBe(true);
    expect(calls).toEqual(["executeScript"]);
  });

  it("keeps session tokens under the same keys on every browser", async () => {
    let stored: Record<string, unknown> = {};
    const local = {
      set: (entries: Record<string, unknown>, callback?: () => void) => { stored = { ...stored, ...entries }; if (callback !== undefined) callback(); },
      get: (key: string | undefined, callback?: (entries: Record<string, unknown>) => void) => { if (callback !== undefined) callback(stored); },
    };
    const session = {
      set: (entries: Record<string, unknown>, callback?: () => void) => { stored = { ...stored, ...entries }; if (callback !== undefined) callback(); },
      get: (key: string | undefined, callback?: (entries: Record<string, unknown>) => void) => { if (callback !== undefined) callback(stored); },
    };
    const polyfills = browserpolyfillof({ runtime: { browser: { storage: { local, session } } } });
    await polyfills.storage.local.set({ "devthink.session.token": "abc" });
    expect(stored["devthink.session.token"]).toBe("abc");
    const entries = await polyfills.storage.session.get<unknown>("devthink.session.token");
    expect(entries["devthink.session.token"]).toBe("abc");
  });

  it("surfaces unsupported api calls as structured errors with the retry hint none", () => {
    const struct = browserpolyfillstructerrorof({ family: "storage", message: "missing", browser: "safari", now: 1000 });
    expect(struct.family).toBe("storage");
    expect(struct.retry).toBe("none");
    expect(struct.browser).toBe("safari");
    expect(struct.at).toBe(1000);
  });

  it("defaults the feature flags to the intersection set across browsers", () => {
    const intersection = browserpolyfillintersection();
    expect(intersection).toContain("scripting");
    expect(intersection).toContain("storage.session");
    expect(intersection).toContain("tabs.executeScript");
    expect(intersection).toContain("notifications");
    expect(intersection).toContain("contextMenus");
    expect(intersection).toContain("clipboard");
    expect(intersection).toContain("downloads");
    expect(intersection).toContain("runtime.messaging");
    expect(intersection).toContain("runtime.geturl");
  });

  it("normalizes geturl across browsers", () => {
    const runtime = { id: "abc", getURL: (path: string) => `moz-extension://abc/${path}` };
    const polyfills = browserpolyfillof({ runtime: { browser: { runtime } } });
    expect(polyfills.runtime.geturl("sidepanel.html")).toBe("moz-extension://abc/sidepanel.html");
  });
});
