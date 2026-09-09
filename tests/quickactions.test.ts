import { describe, expect, it } from "vitest";
import {
  omniboxtasktotaskinput,
  parseomniboxtask,
  parseshortcut,
  quickactioncatalog,
  quickactionsfor,
  shortcutbindingafter,
  shortcutcommandof,
  shortcutdefaults,
  shortcutdispatchable,
  shortcuttext,
} from "../views.js";
import { surfacepalette } from "../views.js";
import { omniboxtaskgate, quickactiongate, shortcutkeygate } from "../policy.js";

const now = 1_800_000_000_000;

describe("quickactions, shortcutkeys and omniboxtask", () => {
  it("gates the quickactions behind the origin allowlist of the clicked tab", () => {
    const catalog = quickactioncatalog();
    expect(catalog.map((action) => action.id)).toEqual([
      "extractpage",
      "captureshot",
      "runrecent",
      "opendashboardpage",
    ]);
    const granted = ["https://example.com"];
    const permitted = quickactionsfor(catalog, {
      origin: "https://example.com",
      granted,
      sessionactive: true,
      grantedcapabilities: ["activeTab", "storage", "scripting", "sidePanel", "downloads"],
    });
    expect(permitted.map((action) => action.id)).toEqual([
      "extractpage",
      "captureshot",
      "runrecent",
      "opendashboardpage",
    ]);
    const nosession = quickactionsfor(catalog, {
      origin: "https://example.com",
      granted,
      sessionactive: false,
      grantedcapabilities: ["activeTab", "storage", "scripting", "sidePanel", "downloads"],
    });
    expect(nosession.map((action) => action.id)).toEqual(["opendashboardpage"]);
    const ungranted = quickactionsfor(catalog, {
      origin: "https://other.example",
      granted,
      sessionactive: true,
      grantedcapabilities: ["activeTab", "storage", "scripting", "sidePanel", "downloads"],
    });
    expect(ungranted).toHaveLength(0);
    expect(
      quickactiongate({
        action: { command: "starttask", origin: "https://example.com", session: true },
        granted,
        sessionactive: false,
        capabilities: ["activeTab"],
      }).reason,
    ).toMatch(/active browser session/);
    expect(
      quickactiongate({
        action: { command: "captureshot", origin: "https://example.com", permission: "downloads" },
        granted,
        sessionactive: true,
        capabilities: ["activeTab"],
      }).allowed,
    ).toBe(false);
  });

  it("binds run, pause, resume, cancelrun and the palette to user editable shortcuts", () => {
    const defaults = shortcutdefaults();
    expect(defaults.map((binding) => binding.command)).toEqual([
      "starttask",
      "pauserun",
      "resumerun",
      "cancelrun",
      "commandpalette",
    ]);
    expect(defaults.every((binding) => binding.editable)).toBe(true);
    expect(
      shortcuttext(
        defaults.find((binding) => binding.command === "commandpalette") ?? {
          command: "",
          key: "",
          modifiers: [],
          editable: true,
          surface: "popup",
        },
      ),
    ).toBe("ctrl+.");
    expect(parseshortcut("Ctrl+Shift+P")).toEqual({ key: "p", modifiers: ["ctrl", "shift"] });
    expect(() => parseshortcut("ctrl+")).toThrow(/key/);
    const edited = shortcutbindingafter(defaults, "pauserun", "alt+q");
    expect(edited.find((binding) => binding.command === "pauserun")?.key).toBe("q");
    expect(() => shortcutbindingafter(defaults, "unknowncommand", "alt+q")).toThrow(/know no/);
  });

  it("matches a pressed key against the bindings with the palette command open from every surface", () => {
    const bindings = shortcutdefaults();
    expect(shortcutcommandof(bindings, { key: ".", modifiers: ["ctrl"], surface: "sidepanel" })).toBe("commandpalette");
    expect(shortcutcommandof(bindings, { key: ".", modifiers: ["ctrl"], surface: "dashboardpage" })).toBe(
      "commandpalette",
    );
    expect(shortcutcommandof(bindings, { key: "p", modifiers: ["ctrl", "shift"], surface: "sidepanel" })).toBe(
      "pauserun",
    );
    expect(shortcutcommandof(bindings, { key: "p", modifiers: ["ctrl", "shift"], surface: "popup" })).toBeUndefined();
    expect(shortcutcommandof(bindings, { key: "z", modifiers: [], surface: "popup" })).toBeUndefined();
  });

  it("keeps the palette gates intact behind every shortcut dispatch", () => {
    const entries = surfacepalette();
    expect(shortcutdispatchable("starttask", entries, { granted: ["activeTab", "storage"], sessionactive: true })).toBe(
      true,
    );
    expect(
      shortcutdispatchable("cancelrun", entries, { granted: ["activeTab", "storage"], sessionactive: false }),
    ).toBe(false);
    expect(shortcutdispatchable("cancelrun", entries, { granted: ["activeTab", "storage"], sessionactive: true })).toBe(
      true,
    );
    expect(shortcutdispatchable("commandpalette", entries, { granted: [], sessionactive: false })).toBe(true);
    expect(
      shortcutkeygate({
        command: "historysearch",
        palettecommands: entries.map((entry) => entry.action.command),
        granted: ["tabs"],
        sessionactive: true,
        action: { permission: "tabs" },
      }).allowed,
    ).toBe(true);
    expect(
      shortcutkeygate({
        command: "unknowncommand",
        palettecommands: entries.map((entry) => entry.action.command),
        granted: [],
        sessionactive: false,
      }).reason,
    ).toMatch(/commandpalette command/);
  });

  it("parses the omnibox keyword into a taskinput submission of the proposal flow", () => {
    const submission = parseomniboxtask({
      text: "  Collect the pricing table  ",
      origin: "https://example.com",
      at: now,
    });
    expect(submission.text).toBe("Collect the pricing table");
    expect(submission.surface).toBe("omnibox");
    expect(() => parseomniboxtask({ text: "  ", origin: "https://example.com", at: now })).toThrow(/goal/);
    expect(() => parseomniboxtask({ text: "goal", origin: " ", at: now })).toThrow(/origin/);
    const taskinput = omniboxtasktotaskinput(submission);
    expect(taskinput.origin).toBe("https://example.com");
    expect(taskinput.surface).toBe("omnibox");
    expect(omniboxtaskgate({ text: "goal", origin: "https://example.com", direct: false }).allowed).toBe(true);
    expect(omniboxtaskgate({ text: "goal", origin: "https://example.com", direct: true }).reason).toMatch(
      /never executes a goal directly/,
    );
    expect(omniboxtaskgate({ text: "", origin: "https://example.com", direct: false }).allowed).toBe(false);
  });
});
