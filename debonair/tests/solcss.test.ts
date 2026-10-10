// # solcss.test — the theme contract of the Sol stylesheet (campaign 5-b):
// the definitive spec's anti-amateur reprovals pinned as CI guards over the
// real file the app ships. Zero banned hues, zero pills, zero transition:all,
// zero scale(0) entries, the reduced-motion hard stop and the
// reduced-transparency floors present, the tabular-nums discipline and the
// hairline aliases the desk reads all verified verbatim. The stylesheet is
// read as text — no browser, no DOM.

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "vitest";

const css = readFileSync(new URL("../Sol/sol.css", import.meta.url), "utf8");

/** Strips comments so the guards read rules, not the doctrine prose. */
function rules(source: string): string {
  return source.replace(/\/\*[\s\S]*?\*\//g, "");
}

describe("sol.css — the banned palette", () => {
  it("never ships the banned blues or the tailwind orange", () => {
    for (const banned of ["#3b82f6", "#2563eb", "#f97316"]) {
      assert.ok(!rules(css).toLowerCase().includes(banned), `${banned} rides in the stylesheet`);
    }
  });

  it("never ships the pill radius on buttons, badges, tabs or chips", () => {
    assert.ok(!rules(css).includes("999px"), "a 999px pill rides in the stylesheet");
    assert.ok(!rules(css).includes("rounded-full"), "rounded-full rides in the stylesheet");
    // true circles stay legal: avatars, dots and indicators use 50%
    assert.ok(rules(css).includes("border-radius: 50%"), "true circles use the 50% radius");
  });
});

describe("sol.css — the motion law", () => {
  it("never ships transition: all", () => {
    assert.ok(!/transition\s*:\s*all/.test(rules(css)), "transition: all rides in the stylesheet");
  });

  it("never enters an element from scale(0)", () => {
    assert.ok(!/scale\(0\)/.test(rules(css)), "a scale(0) entry rides in the stylesheet");
  });

  it("carries the reduced-motion hard stop as the last word", () => {
    assert.match(
      css,
      /@media \(prefers-reduced-motion: reduce\) \{\s*\*,\s*\*::before,\s*\*::after \{[^}]*animation-duration: 0\.01ms !important/,
      "the universal hard stop is missing",
    );
  });

  it("carries the reduced-transparency floors", () => {
    const floors = css.match(/@media \(prefers-reduced-transparency: reduce\)/g) ?? [];
    assert.ok(floors.length >= 3, "the transparency floors are missing");
  });

  it("mirrors the media kills into the in-session data-motion switch", () => {
    assert.ok(css.includes('[data-motion="reduced"]'), "the settings switch has no stylesheet guards");
    assert.match(
      css,
      /\[data-motion="reduced"\] \*,\s*\[data-motion="reduced"\] \*::before,\s*\[data-motion="reduced"\] \*::after \{[^}]*animation-duration: 0\.01ms !important/,
      "the in-session hard stop is missing",
    );
  });
});

describe("sol.css — the desk contract", () => {
  it("keeps the numeric discipline: the readouts ride tabular-nums", () => {
    assert.ok(css.includes("font-variant-numeric: tabular-nums"), "tabular-nums left the stylesheet");
  });

  it("defines every custom property its own rules read (--dbn-line aliases)", () => {
    for (const token of ["--dbn-line", "--dbn-line-strong"]) {
      const defined = new RegExp(`${token.replace("-", "\\-")}\\s*:`).test(css);
      assert.ok(defined, `${token} is read but never defined`);
    }
  });

  it("keeps the brass as the one accent (spec §12)", () => {
    assert.ok(css.includes("--win-accent: #d9962e"), "the latão accent left the tokens");
    assert.ok(css.includes("--sol-primary: #d9962e"), "the latão content accent left the tokens");
  });

  it("keeps the doctrine type triad (Bricolage display · Outfit UI · JetBrains mono)", () => {
    assert.ok(css.includes('"Bricolage Grotesque Variable"'), "the display face left the tokens");
    assert.ok(css.includes('"Outfit Variable"'), "the UI face left the tokens");
    assert.ok(css.includes('"JetBrains Mono Variable"'), "the detail face left the tokens");
  });

  it("keeps the sticky footer contract (the stage is a column, the footer glues)", () => {
    assert.ok(css.includes(".winapp__stage { display: flex; flex-direction: column; }"));
    assert.ok(css.includes(".meta-quad { margin-top: auto; }"));
  });
});
