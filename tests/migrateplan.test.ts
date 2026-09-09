import { describe, expect, it } from "vitest";
import {
  importautoma,
  importselenium,
  importtabular,
  importuivision,
  importv1plan,
  migrateplanconversion,
  parsecsvrows,
  planlintfindings,
} from "../cli.js";
import { lintplanfile, parseplanfile } from "../plan.js";
import { actionkindcatalog, portablerulesetof } from "../policy.js";
import { clicommands, surfacepalette } from "../views.js";
import { packageversion } from "../version.js";
import { readFile } from "node:fs/promises";
import type { planfile, planlintdiagnostic, portableruleset } from "../types.js";

const now = 1_800_000_000_000;
const ruleset: portableruleset = portablerulesetof(now);
const capabilities = actionkindcatalog();

/** Reads one importer fixture of the tests/code/importers source set the build copies into dist/fixtures/importers. */
async function fixture(name: string): Promise<string> {
  return readFile(`tests/code/importers/${name}`, "utf8");
}

/** Reads one json importer fixture as the parsed source object its importer reads. */
async function jsonfixture(name: string): Promise<unknown> {
  return JSON.parse(await fixture(name));
}

/** Lints one converted plan through the same lint engine the planlint command runs: the portable rule set, the cli findings and the full action kind capability set. */
function lintconverted(file: planfile): planlintdiagnostic[] {
  return [...lintplanfile({ file, ruleset, capabilities, now }), ...planlintfindings({ file, capabilities })];
}

/** The happy path fixtures of every importer with the format the migrateplan command declares for them. */
const happy: Array<{ name: string; format: string }> = [
  { name: "v1-plan.json", format: "v1" },
  { name: "automa-workflow.json", format: "automa" },
  { name: "selenium-side.json", format: "selenium" },
  { name: "uivision-macro.json", format: "uivision" },
  { name: "tabular-plan.csv", format: "tabular" },
];

/** The refusal fixtures of every importer: each one carries one entry the importer must refuse with the entry named. */
const refusals: Array<{ name: string; format: string; pattern: RegExp }> = [
  {
    name: "v1-unknown.json",
    format: "v1",
    pattern: /version one step snap[\s\S]*screenshotpage outside the reviewed catalog/,
  },
  {
    name: "automa-unknown.json",
    format: "automa",
    pattern: /automa block ping of type notification stays outside the conversion table/,
  },
  {
    name: "selenium-unknown.json",
    format: "selenium",
    pattern: /selenium command roll of mouseOver stays outside the conversion table/,
  },
  {
    name: "uivision-unknown.json",
    format: "uivision",
    pattern: /ui vision command xclick-2 of XClick stays outside the conversion table/,
  },
  {
    name: "tabular-unknown.csv",
    format: "tabular",
    pattern: /tabular row 2[\s\S]*dragdrop outside the reviewed catalog/,
  },
];

describe("migrateplan importer conversion", () => {
  it("converts every happy fixture into a plan file that parses under schemastrict and lints with zero diagnostics", async () => {
    for (const source of happy) {
      const conversion = migrateplanconversion({ format: source.format, text: await fixture(source.name), now });
      expect(conversion.file.version).toBe(packageversion);
      expect(conversion.file.origin).toBe("https://example.org");
      expect(conversion.file.steps.length).toBeGreaterThan(0);
      const parsed = parseplanfile(JSON.parse(JSON.stringify(conversion.file)));
      expect(parsed).toEqual(conversion.file);
      expect(lintconverted(conversion.file)).toEqual([]);
      expect(conversion.format).toBe(source.format);
      expect(conversion.mapped).toBe(conversion.file.steps.length);
      expect(conversion.notes[0]).toContain(`${source.format} importer converted the source`);
      expect(conversion.notes[0]).toContain("the frozen plan file grammar carries no metadata field");
    }
  });

  it("marks every converted sensitive step with the explicit gate declaration while the read steps carry none", async () => {
    const v1 = importv1plan({ source: await jsonfixture("v1-plan.json"), now });
    expect(v1.file.steps.map((step) => [step.id, step.kind, step.gate])).toEqual([
      ["observe", "observe", undefined],
      ["read", "readforms", undefined],
      ["inspect", "inspect", undefined],
      ["answer", "type", true],
      ["pause", "delay", undefined],
    ]);
    expect(v1.file.grants).toEqual(["observe", "readforms", "inspect", "type", "delay"]);
    const lifted = v1.file.steps.find((step) => step.id === "pause");
    expect(lifted?.options).toBe('{"delay":3000}');
    expect(v1.sourceversion).toBe("1");
    expect(v1.notes.some((note) => note.includes("milliseconds field of 1 delay step lifted"))).toBe(true);
  });

  it("converts the automa blocks through the documented table and lands the trigger block in the report as the paused trigger", async () => {
    const conversion = importautoma({ source: await jsonfixture("automa-workflow.json"), now });
    expect(conversion.file.goal).toBe("contact survey sweep");
    expect(conversion.file.steps.map((step) => [step.id, step.kind, step.target, step.value, step.gate])).toEqual([
      ["tab", "tabcreate", undefined, "https://example.org/contact", true],
      ["survey", "fillform", undefined, undefined, true],
      ["send", "click", "button.primary", undefined, true],
      ["hold", "delay", undefined, undefined, undefined],
    ]);
    const fields = JSON.parse(conversion.file.steps.find((step) => step.id === "survey")?.options ?? "{}") as {
      fields: Array<Record<string, string>>;
    };
    expect(fields.fields).toEqual([
      { name: "email", value: "survey@example.org", selector: "input[name=email]" },
      { name: "message", value: "hello from the sweep", selector: "textarea" },
    ]);
    expect(JSON.parse(conversion.file.steps.find((step) => step.id === "hold")?.options ?? "{}")).toEqual({
      delay: 1500,
    });
    expect(conversion.notes.some((note) => note.includes("paused trigger"))).toBe(true);
    expect(conversion.sourceversion).toBe("1.0.0");
  });

  it("resolves the selenium locators, the open target and the pause milliseconds onto the reviewed grammar", async () => {
    const conversion = importselenium({ source: await jsonfixture("selenium-side.json"), now });
    expect(conversion.file.steps.map((step) => [step.id, step.kind, step.target, step.value, step.gate])).toEqual([
      ["open", "navigate", undefined, "https://example.org/contact", true],
      ["email", "type", "input[name=email]", "survey@example.org", true],
      ["keys", "appendtext", "input[name=email]", " hello", true],
      ["pick", "select", "#topic", "general", true],
      ["send", "click", "button.primary", undefined, true],
      ["hold", "delay", undefined, undefined, undefined],
    ]);
    expect(JSON.parse(conversion.file.steps.find((step) => step.id === "hold")?.options ?? "{}")).toEqual({
      delay: 2000,
    });
    expect(conversion.sourceversion).toBe("2.0");
  });

  it("converts the ui vision macro with its derived stable step ids and the waittext verification", async () => {
    const conversion = importuivision({ source: await jsonfixture("uivision-macro.json"), now });
    expect(conversion.file.goal).toBe("example releases read");
    expect(conversion.file.steps.map((step) => [step.id, step.kind, step.target, step.value, step.gate])).toEqual([
      ["open-1", "navigate", undefined, "https://example.org/releases", true],
      ["click-2", "click", "nav a.releases", undefined, true],
      ["type-3", "type", "input[name=filter]", "release notes", true],
      ["verifytext-4", "waittext", "main h1", "Releases", undefined],
    ]);
  });

  it("converts the tabular rows onto the step grammar with the preface metadata and the quoted csv cells", async () => {
    const conversion = importtabular({ text: await fixture("tabular-plan.csv"), now });
    expect(conversion.file.goal).toBe("Survey the releases page of the example project");
    expect(conversion.file.steps.map((step) => [step.id, step.kind, step.target, step.value, step.gate])).toEqual([
      ["observe-1", "observe", undefined, undefined, undefined],
      ["readtext-2", "readtext", "main", undefined, undefined],
      ["countelements-3", "countelements", "main section", undefined, undefined],
      ["type-4", "type", "input[name=filter]", "release notes, digest", true],
    ]);
  });

  it("reads the tabular preface markers through the linear scan that closed the polynomial regular expression alerts", async () => {
    /* the marker body accepts any spacing after the hash and the colon, and a marker line with no value never clears a value an earlier line set */
    const tight = importtabular({
      text: "#goal:tight\n#origin:https://example.org\nstep,target,value\nobserve,,\n",
      now,
    });
    expect(tight.file.goal).toBe("tight");
    expect(tight.file.origin).toBe("https://example.org");
    const spaced = importtabular({
      text: "#   goal:   spaced survey\n# origin:   https://example.org\nstep,target,value\nobserve,,\n",
      now,
    });
    expect(spaced.file.goal).toBe("spaced survey");
    expect(spaced.file.origin).toBe("https://example.org");
    const kept = importtabular({
      text: "# goal: kept\n# goal:\n# origin: https://example.org\nstep,target,value\nobserve,,\n",
      now,
    });
    expect(kept.file.goal).toBe("kept");
    const sameorigin = importtabular({
      text: "# goal: g\n# origin: https://example.org\n# origin:\nstep,target,value\nobserve,,\n",
      now,
    });
    expect(sameorigin.file.origin).toBe("https://example.org");
  });
});

describe("migrateplan refusal semantics", () => {
  it("refuses every unmappable entry with the source entry named, never with a silent drop", async () => {
    for (const source of refusals) {
      const text = await fixture(source.name);
      expect(() => migrateplanconversion({ format: source.format, text, now })).toThrow(source.pattern);
    }
  });

  it("refuses the formats, the shapes and the locators it cannot map instead of guessing", async () => {
    expect(() => migrateplanconversion({ format: "playwright", text: "{}", now })).toThrow(
      /stays outside the v1, automa, selenium, uivision and tabular source formats/,
    );
    expect(() => migrateplanconversion({ format: "v1", text: "not json", now })).toThrow(/v1 source parses no json/);
    expect(() =>
      importv1plan({
        source: {
          version: "1",
          goal: "g",
          origin: "https://example.org",
          steps: [{ id: "s", action: "observe", label: "l", legacy: true }],
        },
        now,
      }),
    ).toThrow(/unknown field legacy/);
    expect(() =>
      importv1plan({
        source: {
          version: "1",
          goal: "g",
          origin: "http://example.org",
          steps: [{ id: "s", action: "observe", label: "l" }],
        },
        now,
      }),
    ).toThrow(/HTTPS/);
    expect(() =>
      importv1plan({
        source: {
          version: "1",
          goal: "g",
          origin: "https://example.org",
          steps: [{ id: "s", action: "click", label: "l", milliseconds: 5 }],
        },
        now,
      }),
    ).toThrow(/only the delay action lifts/);
    expect(() =>
      importautoma({
        source: {
          name: "n",
          blocks: {
            tab: { type: "newtab", data: { url: "https://example.org" } },
            away: { type: "newtab", data: { url: "https://other.example" } },
          },
        },
        now,
      }),
    ).toThrow(/automa block away of type newtab navigates to https:\/\/other\.example/);
    expect(() =>
      importautoma({
        source: { name: "n", blocks: { only: { type: "click-element", data: { selector: "button" } } } },
        now,
      }),
    ).toThrow(/carries no newtab block/);
    expect(() =>
      importselenium({ source: { version: "2.0", name: "n", url: "https://example.org", tests: [] }, now }),
    ).toThrow(/carries 0 tests; one plan addresses exactly one test/);
    expect(() =>
      importselenium({
        source: {
          version: "2.0",
          name: "n",
          url: "https://example.org",
          tests: [{ name: "t", commands: [{ id: "x", command: "click", target: "xpath=//button", value: "" }] }],
        },
        now,
      }),
    ).toThrow(/outside the css=, id= and name= locator prefixes/);
    expect(() =>
      importuivision({ source: { Name: "n", Commands: [{ Command: "click", Target: "css=button", Value: "" }] }, now }),
    ).toThrow(/carries no open command/);
    expect(() => importtabular({ text: "step,target,value\nobserve,,\n", now })).toThrow(/no `# goal:` preface line/);
    expect(() => importtabular({ text: "# goal: g\nstep,target,value\nobserve,,\n", now })).toThrow(
      /no `# origin:` preface line/,
    );
    expect(() =>
      importtabular({ text: "# goal: g\n# origin: http://example.org\nstep,target,value\nobserve,,\n", now }),
    ).toThrow(/HTTPS origin/);
    expect(() =>
      importtabular({ text: "# goal: g\n# origin: https://example.org\nstep,target,extra\nobserve,,\n", now }),
    ).toThrow(/column extra outside the step, target and value columns/);
  });
});

describe("the csv parser of the tabular importer", () => {
  it("parses headers, quoted cells, escaped quotes, embedded newlines and crlf line endings while refusing an unterminated quote", () => {
    expect(parsecsvrows("step,target,value\nobserve,,\n")).toEqual([
      ["step", "target", "value"],
      ["observe", "", ""],
    ]);
    expect(parsecsvrows('a,b\n1,"x,y"\n')).toEqual([
      ["a", "b"],
      ["1", "x,y"],
    ]);
    expect(parsecsvrows('a,b\n1,"say ""hi"""\n')).toEqual([
      ["a", "b"],
      ["1", 'say "hi"'],
    ]);
    expect(parsecsvrows('a,b,c\n1,"two\nlines",3')).toEqual([
      ["a", "b", "c"],
      ["1", "two\nlines", "3"],
    ]);
    expect(parsecsvrows("a,b\r\n1,2\r\n")).toEqual([
      ["a", "b"],
      ["1", "2"],
    ]);
    expect(parsecsvrows('a,b\n,"","x"\n')).toEqual([
      ["a", "b"],
      ["", "", "x"],
    ]);
    expect(parsecsvrows('a,b\n,"""",x\n')).toEqual([
      ["a", "b"],
      ["", '"', "x"],
    ]);
    expect(parsecsvrows("")).toEqual([]);
    expect(() => parsecsvrows('a,"unterminated')).toThrow(/ends inside a quoted cell/);
  });
});

describe("the migrateplan command surface", () => {
  it("registers the migrateplan command in the shared registry the cli help prints", () => {
    const entry = clicommands(surfacepalette()).find((command) => command.id === "migrateplan");
    expect(entry?.terminal).toBe(true);
    expect(entry?.label).toContain("foreign plan source");
    expect(entry?.keywords).toContain("automa");
  });

  it("keeps the conversion idempotent: converting the already converted output yields the same plan", async () => {
    const first = migrateplanconversion({ format: "v1", text: await fixture("v1-plan.json"), now });
    const serialized = JSON.stringify(first.file, null, 2);
    const second = migrateplanconversion({ format: "v1", text: serialized, now: now + 5_000 });
    expect(second.file).toEqual(first.file);
    expect(second.mapped).toBe(first.mapped);
    expect(second.notes.some((note) => note.includes("passes it through unchanged"))).toBe(true);
    const tabular = migrateplanconversion({ format: "tabular", text: await fixture("tabular-plan.csv"), now });
    const reimported = migrateplanconversion({
      format: "tabular",
      text: await fixture("tabular-plan.csv"),
      now: now + 5_000,
    });
    expect(reimported.file).toEqual(tabular.file);
  });
});
