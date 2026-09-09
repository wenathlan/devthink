import { describe, expect, it } from "vitest";
import {
  chainrows,
  csvfield,
  csvof,
  exportchain,
  exportdescriptorof,
  exportextractions,
  exportnotes,
  exportrecords,
  noterow,
  unmaskedfieldsof,
} from "../export.js";
import { defaultmaskshapes } from "../security.js";
import { appendlogentry, openrunlog } from "../security.js";

const now = 1_800_000_000_000;

describe("exporttools descriptors", () => {
  it("validates the format and scope pair of every export", () => {
    expect(exportdescriptorof("csv", "runs")).toEqual({ format: "csv", scope: "runs" });
    expect(exportdescriptorof("json", "extractions").scope).toBe("extractions");
    expect(exportdescriptorof("log", "notes").format).toBe("log");
    expect(exportdescriptorof("jsonl", "audit").format).toBe("jsonl");
    expect(exportdescriptorof("markdown", "extraction").scope).toBe("extraction");
    expect(() => exportdescriptorof("xml", "runs")).toThrow(/csv, json, log, jsonl and markdown/);
    expect(() => exportdescriptorof("csv", "profiles")).toThrow(
      /runs, extractions, notes, session, audit and extraction/,
    );
  });

  it("escapes csv fields the csv way", () => {
    expect(csvfield("plain")).toBe("plain");
    expect(csvfield('with "quote"')).toBe('"with ""quote"""');
    expect(csvfield("a,b")).toBe('"a,b"');
    expect(csvfield("line\nbreak")).toBe('"line\nbreak"');
    expect(csvof([{ a: "1", b: "2" }, { a: "x,y" }])).toBe('a,b\n1,2\n"x,y",');
  });
});

describe("exporttools records", () => {
  it("honors the mask verdicts in every format: the verdicts mask the fields they hold back", () => {
    const records = [{ name: "email", password: "hunter2", author: "user", note: "plain" }];
    const csv = exportrecords({
      descriptor: exportdescriptorof("csv", "extractions"),
      records: [{ name: "email", password: "[redacted]", author: "user", note: "plain" }],
      shapes: [...defaultmaskshapes],
    });
    expect(csv.result.rows).toBe(1);
    expect(csv.content).toContain("[redacted]");
    expect(csv.content).toContain("plain");
    const json = exportrecords({
      descriptor: exportdescriptorof("json", "extractions"),
      records: [{ name: "email", password: "[redacted]", author: "user", note: "plain" }],
      shapes: [...defaultmaskshapes],
    });
    expect(JSON.parse(json.content)[0].password).toBe("[redacted]");
    expect(JSON.parse(json.content)[0].author).toBe("[redacted]");
    const log = exportrecords({
      descriptor: exportdescriptorof("log", "extractions"),
      records: [{ name: "email", password: "[redacted]", note: "plain" }],
      shapes: [...defaultmaskshapes],
    });
    expect(log.content).toContain("password=[redacted]");
    expect(log.content).toContain("note=plain");
    const usershapes = exportrecords({
      descriptor: exportdescriptorof("csv", "extractions"),
      records: [{ internalcode: "raw" }],
      shapes: [...defaultmaskshapes, "internalcode"],
    });
    expect(usershapes.result.rows).toBe(1);
    expect(usershapes.content).toContain("[redacted]");
    expect(unmaskedfieldsof(records)).toEqual(["password"]);
  });

  it("refuses to export unmasked values in full under any format", () => {
    const records = [{ name: "email", password: "hunter2" }];
    const refused = exportrecords({
      descriptor: exportdescriptorof("csv", "extractions"),
      records,
      shapes: [...defaultmaskshapes],
    });
    expect(refused.result.rows).toBe(0);
    expect(refused.result.bytes).toBe(0);
    expect(refused.content).toBe("");
    expect(refused.result.reason).toMatch(/refuses 1 unmasked value.*password/);
    expect(unmaskedfieldsof(records)).toEqual(["password"]);
    expect(unmaskedfieldsof([{ apikey: "xyz" }])).toEqual(["apikey"]);
    expect(unmaskedfieldsof([{ authorization: "Bearer raw" }])).toEqual(["authorization"]);
    expect(unmaskedfieldsof([{ password: "[redacted]" }])).toEqual([]);
    expect(unmaskedfieldsof([{ note: "plain" }])).toEqual([]);
    expect(unmaskedfieldsof([{ password: "" }])).toEqual([]);
  });

  it("exports notes with the sealed bodies intact and the plain bodies masked", () => {
    const notes = [
      {
        id: "n1",
        origin: "https://example.org",
        title: "Release notes",
        author: "user",
        sensitive: true,
        sealedbody: "sealed:abc",
        createdat: now,
        updatedat: now,
      },
      {
        id: "n2",
        origin: "https://example.org",
        title: "Plain note",
        body: "the changelog",
        author: "user",
        sensitive: false,
        createdat: now,
        updatedat: now,
      },
    ];
    const row = noterow(notes[0] as never);
    expect(row.sealedbody).toBe("sealed:abc");
    expect(row.body).toBeUndefined();
    const exported = exportnotes({
      descriptor: exportdescriptorof("json", "notes"),
      notes,
      shapes: [...defaultmaskshapes],
    });
    expect(exported.result.rows).toBe(2);
    expect(exported.content).toContain("sealed:abc");
    expect(exported.content).toContain("Release notes");
    const extractions = exportextractions({
      descriptor: exportdescriptorof("csv", "extractions"),
      rows: [{ title: "row", password: "[redacted]" }],
      shapes: [...defaultmaskshapes],
    });
    expect(extractions.content).toContain("[redacted]");
    const refusedextraction = exportextractions({
      descriptor: exportdescriptorof("csv", "extractions"),
      rows: [{ title: "row", password: "hunter2" }],
      shapes: [...defaultmaskshapes],
    });
    expect(refusedextraction.result.reason).toMatch(/refuses 1 unmasked value/);
  });
});

describe("exporttools chains", () => {
  it("verifies the log chain before any byte leaves the store", async () => {
    let log = openrunlog({ runid: "run:1", sessionid: "flowrun", now });
    log = await appendlogentry({
      log,
      kind: "step",
      summary: "The step ran.",
      origin: "https://example.org",
      stepid: "observe",
      at: now,
    });
    log = await appendlogentry({
      log,
      kind: "flowrun",
      summary: "The flowrun completed.",
      origin: "https://example.org",
      at: now + 10,
    });
    const rows = chainrows(log.entries);
    expect(rows).toHaveLength(2);
    expect(rows[0]).toMatchObject({ kind: "step", origin: "https://example.org", stepid: "observe" });
    const csv = await exportchain({
      descriptor: exportdescriptorof("csv", "runs"),
      log,
      shapes: [...defaultmaskshapes],
    });
    expect(csv.result.rows).toBe(2);
    expect(csv.content.split("\n")[0]).toContain("kind");
    const json = await exportchain({
      descriptor: exportdescriptorof("json", "runs"),
      log,
      shapes: [...defaultmaskshapes],
    });
    expect(JSON.parse(json.content)).toHaveLength(2);
    const second = log.entries[1];
    if (second === undefined) throw new Error("The fixture chain needs its second entry.");
    const broken = { ...log, entries: [...log.entries.slice(0, 1), { ...second, summary: "tampered" }] };
    const refused = await exportchain({ descriptor: exportdescriptorof("csv", "runs"), log: broken, shapes: [] });
    expect(refused.result.rows).toBe(0);
    expect(refused.result.reason).toMatch(/chain|verification/i);
  });
});
