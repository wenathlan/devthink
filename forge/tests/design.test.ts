// # design.test — the design contract of the forge surface, runnable with
// the node built-in runner (no dependencies, no install):
//   node --test tests/design.test.ts
// The file reads the shipped sources (css, entry face, brand mark, app
// identity) and pins the family laws: no banned hue, no pill, no
// transition:all, the family font triad, the source-face entry and the
// honest page set of the application identity.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

function read(path: string): string {
  return readFileSync(new URL(path, import.meta.url), "utf8");
}

const CSS = read("../Sol/sol.css");
const ENTRY = read("../index.html");
const MARK = read("../Sol/shell/BrandMark.tsx");
const TOML = read("../devthink.toml");
const SOL = read("../Sol/Sol.tsx");

const BANNED = [/3b82f6/i, /2563eb/i, /f97316/i];

describe("design contract", () => {
  it("ships no banned hue in the stylesheet, the entry or the mark", () => {
    for (const source of [CSS, ENTRY, MARK]) {
      for (const banned of BANNED) {
        assert.ok(!banned.test(source), `banned hue ${banned} found`);
      }
    }
  });

  it("carries the forge accent #a2cb3a as the one signal", () => {
    assert.match(CSS, /--sol-primary: #a2cb3a/);
    assert.match(MARK, /#a2cb3a/);
  });

  it("restates the window accent on the lime-brasa after the D1 orange (the cascade retints)", () => {
    assert.match(CSS, /--win-accent: #a2cb3a/);
    assert.match(CSS, /--dt-accent: #a2cb3a/);
    assert.match(CSS, /--win-accent: #5c7a12/);
    const orange = CSS.lastIndexOf("#fb923c");
    const darkLime = CSS.indexOf("--win-accent: #a2cb3a");
    const lightLime = CSS.indexOf("--win-accent: #5c7a12");
    assert.ok(darkLime > orange, "the dark window accent must be restated after the D1 orange");
    assert.ok(lightLime > orange, "the light window accent must be restated after the D1 orange");
    assert.ok(!CSS.includes("#f59e0b"), "the OS amber never rides the forge chrome");
  });

  it("keeps the pill out of the stylesheet (no 999px, no stadium radius)", () => {
    assert.ok(!CSS.includes("999px"), "the pill radius is retired");
    assert.ok(!CSS.includes("--r-pill"), "no pill token survives");
  });

  it("never ships transition: all", () => {
    assert.ok(!/transition:\s*all/.test(CSS), "transition: all is a reprovação");
  });

  it("declares the family font triad (Bricolage display, Outfit reading, JetBrains Mono detail)", () => {
    assert.match(CSS, /--font-display: "Bricolage Grotesque"/);
    assert.match(CSS, /--sol-sans: "Outfit"/);
    assert.match(CSS, /--sol-mono: "JetBrains Mono"/);
    assert.match(ENTRY, /Bricolage\+Grotesque/);
    assert.match(ENTRY, /Outfit/);
    assert.match(ENTRY, /JetBrains\+Mono/);
  });

  it("keeps the entry on the source face (./App.tsx, no hashed ghosts)", () => {
    assert.match(ENTRY, /script[^>]*\.\/App\.tsx/);
    assert.ok(!/-[0-9a-f]{8}\.(js|css)/.test(ENTRY), "no hashed bundle rides the entry");
    assert.match(ENTRY, /href="\.\/favicon\.svg"/);
  });

  it("guards the reduced-motion stop on the platform layers", () => {
    const blocks = CSS.match(/@media \(prefers-reduced-motion: reduce\)/g) ?? [];
    assert.ok(blocks.length >= 4, `expected the hard stop on every layer, found ${blocks.length}`);
  });

  it("declares the honest page set (home, runs, queue, logs, notfound)", () => {
    assert.match(TOML, /pages = \["home", "runs", "queue", "logs", "notfound"\]/);
    for (const route of ['"/runs"', '"/queue"', '"/logs"', '"/404"']) {
      assert.ok(SOL.includes(`path=${route}`), `route ${route} must mount`);
    }
  });

  it("keeps tabular numerals on the platform numbers", () => {
    assert.match(CSS, /font-variant-numeric:\s*tabular-nums/);
  });

  it("rests the title-bar mark on the landing (logo discipline)", () => {
    assert.match(CSS, /data-landing/);
  });
});
