import { describe, expect, it } from "vitest";
import {
  csvfield, csvof, exportdescriptorof, exportformats, exportrecords, exportscopes, jsonlinesof,
  markdownfield, markdownof, secretfieldshapes, unmaskedfieldsof,
} from "../export.js";
import { maskfield, maskingfield, maskmarker, maskrecord, maskvalue } from "../security.js";

/**
 * Torture suite for the export family: csv injection, formula smuggling,
 * secret laundering attempts, markdown escaping and pathological payloads.
 */

describe("torture: csv field escaping", () => {
  it("escapes commas, quotes and newlines with doubled inner quotes", () => {
    expect(csvfield("plain")).toBe("plain");
    expect(csvfield("with,comma")).toBe("\"with,comma\"");
    expect(csvfield("with\"quote")).toBe("\"with\"\"quote\"");
    expect(csvfield("line1\nline2")).toBe("\"line1\nline2\"");
    expect(csvfield("all\"three\",chars\nhere")).toBe("\"all\"\"three\"\",chars\nhere\"");
    expect(csvfield("")).toBe("");
    expect(csvfield(" ")).toBe(" ");
    expect(csvfield("no special")).toBe("no special");
  });

  it("keeps tab, cr and unicode unquoted unless they collide with the escape set", () => {
    expect(csvfield("with\ttab")).toBe("with\ttab");
    expect(csvfield("cr\ronly")).toBe("cr\ronly");
    expect(csvfield("こんにちは")).toBe("こんにちは");
    expect(csvfield("emoji 🌍 here")).toBe("emoji 🌍 here");
    expect(csvfield("rtl שלום")).toBe("rtl שלום");
  });

  it("csv rows sort headers, union fields and fill absent fields empty", () => {
    const csv = csvof([{ b: "2", a: "1" }, { a: "x", c: "3" }]);
    const lines = csv.split("\n");
    expect(lines[0]).toBe("a,b,c");
    expect(lines[1]).toBe("1,2,");
    expect(lines[2]).toBe("x,,3");
    expect(csvof([])).toBe("");
  });

  it("csv round trips adversarial payloads without breaking the column count", () => {
    const rows = [
      { formula: "=cmd|' /C calc'!A0", note: "excel injection" },
      { formula: "+1|2", note: "lotus injection" },
      { formula: "-2+3+cmd|' /C calc'!A0", note: "another form" },
      { formula: "@SUM(1+9)*cmd|' /C calc'!A0", note: "at form" },
      { formula: "\t=hidden", note: "tab led formula" },
      { formula: "quote\"and,comma\nnewline", note: "escape collision" },
      { formula: "\u2028unicode sep", note: "u2028" },
      { formula: "\0null", note: "null byte" },
    ];
    const csv = csvof(rows);
    const parsed = parsecsv(csv);
    expect(parsed.length).toBe(rows.length + 1);
    expect(parsed[0]).toEqual(["formula", "note"]);
    for (const cells of parsed.slice(1)) expect(cells.length).toBe(2);
    expect(parsed[1]?.[0]).toBe("=cmd|' /C calc'!A0");
    expect(parsed[6]?.[0]).toBe("quote\"and,comma\nnewline");
  });

  /** Parses whole csv content honoring quoted cells with embedded newlines and doubled quotes. */
  function parsecsv(content: string): string[][] {
    const rowsout: string[][] = [];
    let row: string[] = [];
    let cell = "";
    let quoted = false;
    for (let index = 0; index < content.length; index += 1) {
      const char = content[index]!;
      if (quoted) {
        if (char === "\"") {
          if (content[index + 1] === "\"") { cell += "\""; index += 1; } else quoted = false;
        } else cell += char;
      } else if (char === "\"") quoted = true;
      else if (char === ",") { row.push(cell); cell = ""; }
      else if (char === "\n") { row.push(cell); rowsout.push(row); row = []; cell = ""; }
      else cell += char;
    }
    if (cell !== "" || row.length > 0) { row.push(cell); rowsout.push(row); }
    return rowsout;
  }
});

describe("torture: markdown escaping", () => {
  it("escapes pipes, backslashes and newlines in order", () => {
    expect(markdownfield("plain")).toBe("plain");
    expect(markdownfield("a|b")).toBe("a\\|b");
    expect(markdownfield("a\\b")).toBe("a\\\\b");
    expect(markdownfield("a\\|b")).toBe("a\\\\\\|b");
    expect(markdownfield("line1\nline2")).toBe("line1<br>line2");
    expect(markdownfield("line1\r\nline2")).toBe("line1<br>line2");
    expect(markdownfield("")).toBe("");
    expect(markdownfield("all|three\\chars\nhere")).toBe("all\\|three\\\\chars<br>here");
  });

  it("markdown tables keep the column count under adversarial cells", () => {
    const table = markdownof([{ a: "|injection|", b: "x" }, { a: "line\nbreak", b: "y" }]);
    const lines = table.split("\n");
    expect(lines[0]).toBe("| a | b |");
    expect(lines[1]).toBe("| --- | --- |");
    for (const line of lines) {
      expect((line.match(/(?<!\\)\|/g) ?? []).length).toBe(line.startsWith("| ---") ? 3 : 3);
    }
    expect(markdownof([])).toBe("");
  });
});

describe("torture: secret field detection and laundering refusal", () => {
  it("detects every secret shape by substring in any casing", () => {
    const shapes = ["password"];
    const rows = [
      { password: "hunter2" },
      { Password: "hunter2" },
      { PASSWORD: "hunter2" },
      { mypasswordfield: "hunter2" },
      { apikey: "abc" },
      { apiKey: "abc" },
      { api_key: "not matched by shape list" },
      { token: "tok" },
      { authauthorization: "z" },
      { secret: "s" },
    ];
    const unmasked = unmaskedfieldsof(rows);
    expect(new Set(unmasked)).toEqual(new Set(["Password", "PASSWORD", "password", "mypasswordfield", "apikey", "apiKey", "token", "authauthorization", "secret"]));
    expect(unmasked.length).toBe(9);
  });

  it("masked values pass while empty and non string values never trip the gate", () => {
    const rows = [
      { password: maskmarker },
      { token: "" },
      { secret: "  " },
      { apikey: 42 },
      { apikey: null },
      { apikey: { nested: "x" } },
      { note: "a normal note about passwords as a word" },
    ];
    expect(unmaskedfieldsof(rows)).toEqual([]);
  });

  it("export refuses the whole file when one unmasked secret rides any format", () => {
    for (const format of exportformats) {
      const descriptor = exportdescriptorof(format, "runs");
      const refused = exportrecords({ descriptor, records: [{ note: "ok", password: "hunter2" }], shapes: [] });
      expect(refused.result.bytes).toBe(0);
      expect(refused.result.rows).toBe(0);
      expect(refused.content).toBe("");
      expect(refused.result.reason).toMatch(/unmasked/i);
      const clean = exportrecords({ descriptor, records: [{ note: "ok", password: maskmarker }], shapes: [] });
      expect(clean.result.rows).toBe(1);
      expect(clean.result.bytes).toBeGreaterThan(0);
    }
  });

  it("export descriptors refuse unknown formats and scopes", () => {
    expect(() => exportdescriptorof("exe", "runs")).toThrow(/csv, json, log, jsonl and markdown/i);
    expect(() => exportdescriptorof("csv", "passwords")).toThrow(/runs, extractions, notes, session, audit and extraction/i);
    expect(exportdescriptorof("csv", "runs").format).toBe("csv");
    expect(exportscopes.length).toBeGreaterThan(0);
    expect(secretfieldshapes).toContain("authorization");
  });

  it("masked shapes honor the configured list while the documented recognizer always runs", () => {
    expect(maskingfield("password", [])).toBe(true);
    expect(maskingfield("token", [])).toBe(true);
    expect(maskingfield("apikey", [])).toBe(true);
    expect(maskingfield("secret", [])).toBe(true);
    expect(maskingfield("authorization", [])).toBe(true);
    expect(maskingfield("name", [])).toBe(false);
    expect(maskingfield("name", ["name"])).toBe(true);
    expect(maskingfield("username", ["name"])).toBe(true);
    expect(maskingfield("nomatch", ["name"])).toBe(false);
    expect(maskingfield("anything", [""])).toBe(false);
    expect(maskingfield("caseinsensitive", ["ins"])).toBe(true);
    expect(maskfield({ name: "password", value: "x", shapes: [] })).toBe(maskmarker);
    expect(maskfield({ name: "note", value: "x", shapes: [] })).toBe("x");
    expect(maskvalue("")).toBe("");
    expect(maskvalue("anything")).toBe(maskmarker);
  });

  it("maskrecord walks nested records and arrays deeply", () => {
    const masked = maskrecord({ password: "x", note: "ok", nested: { password: "y", keep: "z" } }, []);
    expect(masked.password).toBe(maskmarker);
    expect(masked.note).toBe("ok");
    expect((masked.nested as Record<string, unknown>).password).toBe(maskmarker);
    expect((masked.nested as Record<string, unknown>).keep).toBe("z");
  });
});

describe("torture: jsonl rendering under adversarial records", () => {
  it("one compact json document per line with no delimiter inside", () => {
    const records = [
      { a: "line1\nline2" },
      { b: "quote\"inside" },
      { c: "こんにちは" },
      { d: 42 },
      { e: null },
    ];
    const jsonl = jsonlinesof(records);
    const lines = jsonl.split("\n");
    expect(lines.length).toBe(5);
    for (const line of lines) expect(() => JSON.parse(line)).not.toThrow();
    expect(jsonlinesof([])).toBe("");
  });
});

describe("torture: pathological payloads through the export pipeline", () => {
  it("one megabyte values export without losing bytes", () => {
    const huge = "x".repeat(1_000_000);
    const csv = exportrecords({ descriptor: exportdescriptorof("csv", "runs"), records: [{ blob: huge }], shapes: [] });
    expect(csv.content.length).toBeGreaterThan(1_000_000);
    expect(csv.result.rows).toBe(1);
  });

  it("prototype pollution keys never reach the export through object entries", () => {
    const rows = JSON.parse('{"__proto__":"polluted","constructor":"also","note":"ok"}') as Record<string, string>;
    const csv = exportrecords({ descriptor: exportdescriptorof("csv", "runs"), records: [rows], shapes: [] });
    expect(csv.content).toContain("note");
    expect(csv.content).not.toContain("polluted");
    expect(({} as Record<string, unknown>).polluted).toBeUndefined();
  });

  it("unicode newlines and separators stay inside their cells", () => {
    const rows = [{ note: "a\u2028b\u2029c" }];
    const csv = exportrecords({ descriptor: exportdescriptorof("csv", "runs"), records: rows, shapes: [] });
    expect(csv.content.split("\n").length).toBe(2);
  });
});
