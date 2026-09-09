import { describe, expect, it } from "vitest";
import { applyimport, detectfilekind, dropimportof, importexportpayloadof, importexportvalidate } from "../export.js";
import { importexportgate } from "../policy.js";

const now = 1_800_000_000_000;

describe("importexport and dropimport", () => {
  it("builds the settings bundle with its honest exclusion list", () => {
    const payload = importexportpayloadof({
      profile: "work",
      originprofiles: [{ origin: "https://example.com", decision: "allow" }],
      siteprofiles: [{ origin: "https://example.com", theme: "dark" }],
      notes: [{ origin: "https://example.com", title: "Pricing notes", sensitive: false }],
      preferences: { logstreambuffer: 200 },
      at: now,
    });
    expect(payload.kind).toBe("settings");
    expect(payload.exclusions).toEqual(["secretvault values", "unmasked logs"]);
    expect(payload.contents.originprofiles).toHaveLength(1);
    expect(() =>
      importexportpayloadof({
        profile: " ",
        originprofiles: [],
        siteprofiles: [],
        notes: [],
        preferences: {},
        at: now,
      }),
    ).toThrow(/profile name/);
  });

  it("refuses secretvault values and unmasked logs under any flag", () => {
    const clean = importexportpayloadof({
      profile: "work",
      originprofiles: [],
      siteprofiles: [],
      notes: [],
      preferences: { paletterecents: 5 },
      at: now,
    });
    expect(importexportvalidate(clean).ok).toBe(true);
    expect(importexportvalidate(clean).reason).toMatch(/never enter any bundle/);
    const secretbearing = { ...clean, contents: { ...clean.contents, preferences: { apikey: "sk-live-123456" } } };
    expect(importexportvalidate(secretbearing).ok).toBe(false);
    expect(importexportvalidate(secretbearing).reason).toMatch(/secretvault value/);
    const logbearing = {
      ...clean,
      contents: { ...clean.contents, unmaskedlogs: [{ summary: "the password hunter2 typed in the clear" }] },
    };
    expect(importexportvalidate(logbearing).ok).toBe(false);
    expect(importexportvalidate(logbearing).reason).toMatch(/unmasked log/);
    expect(importexportgate({ containssecrets: true, unmaskedlogs: false }).allowed).toBe(false);
    expect(importexportgate({ containssecrets: false, unmaskedlogs: true }).allowed).toBe(false);
    expect(() =>
      importexportpayloadof({
        profile: "work",
        originprofiles: [{ token: "abc123" }],
        siteprofiles: [],
        notes: [],
        preferences: {},
        at: now,
      }),
    ).toThrow(/secretvault value/);
  });

  it("applies an import to the current preferences only through a validated bundle", () => {
    const payload = importexportpayloadof({
      profile: "work",
      originprofiles: [],
      siteprofiles: [],
      notes: [],
      preferences: { paletterecents: 9, uilanguage: "pt" },
      at: now,
    });
    const applied = applyimport(payload, { paletterecents: 3, logstreambuffer: 100 });
    expect(applied.preferences.paletterecents).toBe(9);
    expect(applied.preferences.uilanguage).toBe("pt");
    expect(applied.preferences.logstreambuffer).toBe(100);
    expect(applied.applied).toEqual(["paletterecents", "uilanguage"]);
    const poisoned = { ...payload, contents: { ...payload.contents, preferences: { password: "hunter2" } } };
    expect(() => applyimport(poisoned, {})).toThrow(/secretvault value/);
  });

  it("detects the csv, json and workflow file kinds of dropped files", () => {
    expect(detectfilekind("table.csv", "a,b\n1,2")).toBe("csv");
    expect(detectfilekind("bundle.json", '{"a":1}')).toBe("json");
    expect(detectfilekind("flow.json", '{"name":"x","steps":[]}')).toBe("workflow");
    expect(detectfilekind("flow.yaml", "name: x")).toBe("workflow");
    expect(detectfilekind("notes.txt", "hello")).toBeUndefined();
    const session = dropimportof({ filename: "table.csv", bytes: 128, head: "a,b\n1,2", at: now });
    expect(session.kind).toBe("csv");
    expect(session.accepted).toBe(true);
    expect(() => dropimportof({ filename: " ", bytes: 1, head: "", at: now })).toThrow(/filename/);
    expect(() => dropimportof({ filename: "notes.txt", bytes: 1, head: "hello", at: now })).toThrow(/refuses the file/);
  });
});
