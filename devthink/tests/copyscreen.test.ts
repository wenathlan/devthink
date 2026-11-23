import { describe, expect, it, vi } from "vitest";

/**
 * The dedicated copyscreen clipboard routing vitest of the 1.1.39 files family (roadmap item 89, closed by the 2.0.2 final polish): the executor routes the captureVisibleTab screenshot through a ClipboardItem onto navigator.clipboard.write, records the clip entry with the payload hash beside it and degrades to the destination marker when the clipboard refuses. The harness drives the real exported executor under a fake chrome with the capture, fetch, ClipboardItem and clipboard seams recorded.
 */

const fakeextensionid = "devthinkfaketest0000000000000";

/** The recorded clipboard write of one ClipboardItem the fake clipboard kept. */
type clipboardwrite = Array<{ kind: string; bytes: number }>;

/** The fake chrome state the executor reads and writes. */
type fakestate = { storage: Map<string, unknown>; clipboardwrites: clipboardwrite; clipboardrefuses: boolean };

/** Installs the fake chrome the exported files executor runs against: local storage over a map, the captureVisibleTab seam answering one fixed png data url, the ClipboardItem global the routing constructs and the navigator clipboard write recorder with a refusal switch. */
function installfakechrome(state: fakestate): void {
  const chromeapi = {
    runtime: {
      id: fakeextensionid,
      getURL: (path: string) => `chrome-extension://${fakeextensionid}/${path}`,
      getManifest: () => ({ version: "2.0.0", name: "devthink", permissions: ["storage"] }),
      onMessage: { addListener: () => undefined },
      onStartup: { addListener: () => undefined },
      onInstalled: { addListener: () => undefined },
      onConnect: { addListener: () => undefined },
      sendMessage: async () => ({ ok: true, value: {} }),
    },
    tabs: {
      onUpdated: { addListener: () => undefined },
      onActivated: { addListener: () => undefined },
      onRemoved: { addListener: () => undefined },
      captureVisibleTab: async () =>
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFAAH/q842iQAAAABJRU5ErkJggg==",
    },
    windows: { WINDOW_ID_CURRENT: -2 },
    storage: {
      local: {
        get: async (key: string) => ({ [key]: state.storage.get(key) }),
        set: async (items: Record<string, unknown>) => {
          for (const [key, value] of Object.entries(items)) state.storage.set(key, value);
        },
      },
    },
    action: { setBadgeText: async () => undefined },
    notifications: { create: () => undefined },
    permissions: { contains: async () => true, request: async () => true },
  };
  (globalThis as unknown as Record<string, unknown>).chrome = chromeapi;
  (globalThis as unknown as Record<string, unknown>).self = { addEventListener: () => undefined };
  (globalThis as unknown as { ClipboardItem?: unknown }).ClipboardItem = class {
    readonly items: Record<string, Blob>;
    constructor(items: Record<string, Blob>) {
      this.items = items;
    }
  };
  Object.defineProperty(globalThis, "navigator", {
    value: {
      onLine: true,
      clipboard: {
        write: async (payload: Array<{ items: Record<string, Blob> }>) => {
          if (state.clipboardrefuses) throw new Error("The clipboard refused the write.");
          for (const item of payload)
            for (const [kind, blob] of Object.entries(item.items))
              state.clipboardwrites.push({ kind, bytes: blob.size });
        },
        readText: async () => "",
      },
    },
    configurable: true,
  });
}

/** The minimal reviewed plan one copyscreen step rides in. */
function planof(): {
  id: string;
  objective: string;
  origin: string;
  steps: Array<Record<string, unknown>>;
  createdat: number;
  expiresat: number;
  state: string;
} {
  return {
    id: "plan-copyscreen",
    objective: "Copy the visible tab to the clipboard.",
    origin: "https://example.com",
    steps: [{ id: "step-copy", kind: "copyscreen", summary: "Copy the visible tab screenshot.", risk: "sensitive" }],
    createdat: 1_800_000_000_000,
    expiresat: 1_800_000_900_000,
    state: "approved",
  };
}

describe("the copyscreen clipboard routing", () => {
  it("routes the captureVisibleTab screenshot through a ClipboardItem onto navigator.clipboard.write and records the clip entry", async () => {
    vi.resetModules();
    const state: fakestate = { storage: new Map(), clipboardwrites: [], clipboardrefuses: false };
    installfakechrome(state);
    const background = await import("../background.js");
    const output = await background.executefilesstep(
      { id: "step-copy", kind: "copyscreen", summary: "Copy the visible tab screenshot.", risk: "sensitive" } as never,
      undefined,
      planof() as never,
      7,
      "https://example.com",
    );
    expect(output.ok).toBe(true);
    expect(output.summary).toContain("payload hash");
    expect(output.details?.destination).toBe("clipboard");
    expect(state.clipboardwrites).toHaveLength(1);
    expect(state.clipboardwrites[0]?.kind).toBe("image/png");
    expect(state.clipboardwrites[0]?.bytes ?? 0).toBeGreaterThan(40);
    const clip = output.details?.clip as { kind: string; hash: string; length: number; stepid: string };
    expect(clip.kind).toBe("screen");
    expect(clip.stepid).toBe("step-copy");
    expect(clip.hash).toMatch(/^fnv1a-[0-9a-f]{8}$/);
    expect(clip.length).toBeGreaterThan(40);
    const clips = state.storage.get("clips") as Array<{ kind: string; stepid: string }> | undefined;
    expect(Array.isArray(clips) ? clips.some((entry) => entry.stepid === "step-copy") : false).toBe(true);
  });

  it("degrades to the clipboard unavailable destination when the clipboard refuses the write", async () => {
    vi.resetModules();
    const state: fakestate = { storage: new Map(), clipboardwrites: [], clipboardrefuses: true };
    installfakechrome(state);
    const background = await import("../background.js");
    const output = await background.executefilesstep(
      { id: "step-copy", kind: "copyscreen", summary: "Copy the visible tab screenshot.", risk: "sensitive" } as never,
      undefined,
      planof() as never,
      7,
      "https://example.com",
    );
    expect(output.ok).toBe(false);
    expect(output.details?.destination).toBe("clipboard unavailable");
    expect(output.details?.clip).toMatchObject({ kind: "screen", stepid: "step-copy" });
    expect(state.clipboardwrites).toHaveLength(0);
  });
});
