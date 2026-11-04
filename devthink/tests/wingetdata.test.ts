// # wingetdata.test — the winget data lane law, batch one: the about family
// and timeline words, and the calculator key tables, answer through the
// label store (oslabels.ts — the typed seed rows the paired database
// overrides when it comes online), never through literals restated inside
// the wingets. runnable with vitest:
// pnpm vitest run tests/wingetdata.test.ts
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { type OsStringId, osCalcKeys, osCalcMemoryKeys, osText } from "../oslabels.ts";

const aboutFamily = readFileSync(join(import.meta.dirname, "..", "Sol", "wingets", "AboutFamily.tsx"), "utf8");
const aboutTimeline = readFileSync(join(import.meta.dirname, "..", "Sol", "wingets", "AboutTimeline.tsx"), "utf8");
const calcKeypad = readFileSync(join(import.meta.dirname, "..", "Sol", "wingets", "CalculatorKeypad.tsx"), "utf8");

describe("the about family winget answers the label store", () => {
  it("answers the family seeds through the accessor (the offline build law)", () => {
    expect(osText("about.family.kicker")).toBe("the family");
    expect(osText("about.family.count")).toBe("{count} named sites");
    expect(osText("about.family.heading")).toBe("The family");
    expect(osText("about.family.intro")).toContain("One platform, several named sites");
    expect(osText("about.family.cta")).toBe("open site");
  });

  it("renders through osText, never through a restated literal", () => {
    expect(aboutFamily).toContain('osText("about.family.kicker")');
    expect(aboutFamily).toContain('osText("about.family.count").replace("{count}"');
    expect(aboutFamily).toContain('osText("about.family.heading")');
    expect(aboutFamily).toContain('osText("about.family.intro")');
    expect(aboutFamily).toContain('osText("about.family.cta")');
    // the retired literals stay retired — the words live in the store only
    expect(aboutFamily).not.toContain("One platform, several named sites");
    expect(aboutFamily).not.toContain("<h2>The family</h2>");
  });
});

describe("the about timeline winget answers the label store", () => {
  it("answers the timeline seeds through the accessor", () => {
    expect(osText("about.timeline.kicker")).toBe("the release ladder");
    expect(osText("about.timeline.heading")).toBe("How the platform moved");
    expect(osText("about.timeline.intro")).toContain("the same rows the history surface serves");
    expect(osText("about.timeline.stat")).toBe("release rungs");
    expect(osText("about.timeline.latest")).toBe("latest");
  });

  it("renders through osText, never through a restated literal", () => {
    expect(aboutTimeline).toContain('osText("about.timeline.heading")');
    expect(aboutTimeline).toContain('osText("about.timeline.kicker")');
    expect(aboutTimeline).toContain('osText("about.timeline.stat")');
    expect(aboutTimeline).toContain('osText("about.timeline.latest")');
    expect(aboutTimeline).not.toContain("How the platform moved</h2>");
    expect(aboutTimeline).not.toContain("The release ladder records the stamps");
  });
});

describe("the calculator keypad winget answers the label store", () => {
  it("serves the memory strip rows in strip order", () => {
    const rows = osCalcMemoryKeys();
    expect(rows.map((row) => row.kind)).toEqual(["mc", "mr", "m+", "m-"]);
    expect(rows.map((row) => row.label)).toEqual(["MC", "MR", "M+", "M−"]);
    // the aria names ride the calc.key.* rows the store already owned
    expect(rows[0]?.aria).toBe(osText("calc.key.memoryClear"));
    expect(rows[3]?.aria).toBe(osText("calc.key.memorySubtract"));
  });

  it("serves the four column grid with the answer key closing it alone", () => {
    const rows = osCalcKeys();
    expect(rows).toHaveLength(6);
    const flat = rows.flat();
    expect(flat).toHaveLength(21);
    expect(new Set(flat.map((cell) => cell.label)).size).toBe(21);
    const equals = flat.filter((cell) => cell.equals);
    expect(equals).toHaveLength(1);
    expect(equals[0]?.label).toBe("=");
    expect(equals[0]?.aria).toBe(osText("calc.key.equals"));
    // the honest modifier row: C, the parens and the backspace stay muted
    const muted = flat.filter((cell) => cell.muted).map((cell) => cell.label);
    expect(muted).toEqual(["C", "(", ")", "\u232b"]);
    // the backspace aria rides the store row, never a winget literal
    expect(flat.find((cell) => cell.label === "\u232b")?.aria).toBe(osText("calc.key.backspace"));
  });

  it("renders through the accessors, never through a restated table", () => {
    expect(calcKeypad).toContain("osCalcMemoryKeys().map");
    expect(calcKeypad).toContain("osCalcKeys().flat().map");
    // the retired inline tables stay retired — the keys live in the store only
    expect(calcKeypad).not.toContain("KEYPAD_ROWS");
    expect(calcKeypad).not.toContain("MEMORY_KEYS");
  });

  it("keeps every dot id the wingets quote a seeded row (never a blank)", () => {
    const ids = [
      "about.family.kicker",
      "about.family.count",
      "about.family.heading",
      "about.family.intro",
      "about.family.cta",
      "about.timeline.kicker",
      "about.timeline.heading",
      "about.timeline.intro",
      "about.timeline.stat",
      "about.timeline.latest",
    ] as const;
    for (const id of ids) {
      expect(osText(id as OsStringId).length).toBeGreaterThan(0);
    }
  });
});
