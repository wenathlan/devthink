// # solcss.test — the theme contract of the Sol stylesheet (the reform wave):
//   the trylle foundation wearing the windows hands, pinned as CI guards over
//   the real file the app ships. Zero banned hues, zero pills, zero
//   transition:all, zero scale(0) entries OUTSIDE the windows pin law (the
//   dtPopIntro bounce is the one lawful scale-from-zero), the reduced-motion
//   hard stop and the reduced-transparency floors present, the in-session
//   data-motion mirror, the tabular-nums discipline, the trylle type stacks,
//   the two-accent contract (the brass identity beside the windows accent),
//   the FAMILY STANDALONE LAW (the shell answers the direct url full-bleed,
//   the window chrome lives only inside the os embed) and the rail pin law
//   all verified verbatim. The sources are read as text — no browser, no
//   DOM.

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "vitest";

const css = readFileSync(new URL("../Sol/sol.css", import.meta.url), "utf8");
const shell = readFileSync(new URL("../Sol/shell/Shell.tsx", import.meta.url), "utf8");

/** Strips comments so the guards read rules, not the doctrine prose. */
function rules(source: string): string {
  return source.replace(/\/\*[\s\S]*?\*\//g, "");
}

/** The stylesheet with the windows pin law lifted out (the one lawful scale(0)). */
function withoutPinLaw(source: string): string {
  return rules(source).replace(/@keyframes dtPopIntro \{(?:[^{}]|\{[^}]*\})*\}/g, "");
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

  it("never enters an element from scale(0) outside the windows pin law", () => {
    assert.ok(!/scale\(0\)/.test(withoutPinLaw(css)), "a scale(0) entry rides outside dtPopIntro");
    // the pin law itself: 0 → 1.125 (40%) → 0.725 (70%) → 1 (the bounce)
    const pin = rules(css).match(/@keyframes dtPopIntro \{(?:[^{}]|\{[^}]*\})*\}/);
    assert.ok(pin !== null, "the dtPopIntro keyframe is missing");
    assert.ok(
      pin[0].includes("scale(1.125)") && pin[0].includes("scale(0.725)"),
      "the dtPopIntro bounce left the pin law",
    );
  });

  it("carries the reduced-motion hard stop as the last word", () => {
    assert.match(
      css,
      /@media \(prefers-reduced-motion: reduce\) \{\s*\*,\s*\*::before,\s*\*::after \{[^}]*animation-duration: 0\.01ms !important/,
      "the universal hard stop is missing",
    );
    const hardStop = css.indexOf("@media (prefers-reduced-motion: reduce)");
    const lastBlock = css.lastIndexOf("@media");
    assert.ok(lastBlock >= hardStop, "a media block rides after the reduced-motion stop");
  });

  it("carries the reduced-transparency floors", () => {
    const floors = css.match(/@media \(prefers-reduced-transparency: reduce\)/g) ?? [];
    assert.ok(floors.length >= 1, "the transparency floors are missing");
    assert.match(css, /backdrop-filter: none/, "the acrylic blur never dies under the floor");
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

describe("sol.css — the trylle foundation", () => {
  it("keeps the trylle canvas and the surface ladder", () => {
    // the v2 foundation: the windows-11 canvas and the exact 8-step ladder
    assert.ok(css.includes("--color-canvas: #202020"), "the trylle canvas left the tokens");
    assert.ok(css.includes("--color-deep: #191919"), "the deep floor left the tokens");
    assert.ok(css.includes("--color-s0: #242424"), "the ladder foot left the tokens");
    assert.ok(css.includes("--color-s7: #494949"), "the ladder head left the tokens");
  });

  it("keeps the trylle type stacks (Inter Variable · Geist Mono)", () => {
    assert.ok(css.includes('"Inter Variable"'), "the trylle sans left the tokens");
    assert.ok(css.includes('"Geist Mono Variable"'), "the trylle mono left the tokens");
    assert.ok(css.includes("font-size: 13px"), "the trylle body size left the base");
    assert.ok(css.includes("--sol-track-display: -0.02em"), "the display tracking left the tokens");
    assert.ok(css.includes("--sol-track-label: 0.14em"), "the label tracking left the tokens");
  });

  it("keeps the two-accent contract (the white sun beside the windows accent)", () => {
    assert.ok(css.includes("--accent: var(--color-signal)"), "the identity left the identity slot");
    assert.ok(css.includes("--color-signal: #ffffff"), "the white sun left the tokens");
    assert.ok(css.includes("--color-win: #4cc2ff"), "the windows accent left the chrome slot");
    assert.ok(css.includes("--color-focus: #4cc2ff"), "focus no longer answers the windows accent");
  });

  it("keeps the trylle shadow ladder and the fluent window float", () => {
    assert.ok(css.includes("--shadow-8"), "the trylle shadow ladder left the tokens");
    assert.ok(css.includes("0 96px 96px -48px"), "the doubling ladder head left the tokens");
    assert.ok(
      css.includes("--shadow-window: 0 32px 64px rgb(0 0 0 / 24%), 0 0 8px rgb(0 0 0 / 20%)"),
      "the fluent window shadow left the tokens",
    );
    assert.ok(css.includes("--ease-window: cubic-bezier(0.85, 0.14, 0.14, 0.85)"), "the window curve left the tokens");
  });

  it("keeps the numeric discipline: the readouts ride tabular-nums", () => {
    assert.ok(css.includes("font-variant-numeric: tabular-nums"), "tabular-nums left the stylesheet");
  });

  it("defines every custom property its own rules read (--dbn-line aliases)", () => {
    for (const token of ["--dbn-line", "--dbn-line-strong"]) {
      const defined = new RegExp(`${token.replace("-", "\\-")}\\s*:`).test(css);
      assert.ok(defined, `${token} is read but never defined`);
    }
  });

  it("keeps the sticky footer contract (the stage is a column, the footer glues)", () => {
    assert.match(css, /\.winapp__stage \{[^}]*flex-direction: column/, "the stage is not a column");
    assert.match(css, /\.meta-quad \{[^}]*margin-top: auto/, "the footer no longer glues to the floor");
  });

  it("keeps the windows hands on the rail (the pin press law)", () => {
    assert.match(css, /\.railnav__item:active \{ transform: scale\(0\.7\)/, "the pin press law left the rail");
  });

  it("answers the direct url full-bleed — the window chrome lives only inside the os", () => {
    /* the family standalone law: an app accessed by its own url is the
    normal application, one hundred percent — the shell renders
    shell--standalone with no window chrome of its own (no title bar, no
    captions, no resize handles, no inactive law, no entry scale), while
    the framed contract keeps the bare stage for the os power clip */
    assert.ok(shell.includes("shell--standalone"), "the standalone law left the shell");
    assert.ok(shell.includes("shell--embedded"), "the framed contract left the shell");
    assert.ok(
      !/className="appframe"|winapp__title|winapp__cap|winapp__rz|winchip|setPointerCapture|data-inactive/.test(shell),
      "the window chrome still rides the standalone shell",
    );
    assert.match(css, /\.shell--standalone \{[^}]*height: 100vh/, "the standalone block must fill the viewport");
    // the window tokens stay in the stylesheet for the os embed lane
    assert.ok(css.includes("--shadow-window"), "the window float token left the tokens");
    assert.ok(css.includes("--ease-window: cubic-bezier(0.85, 0.14, 0.14, 0.85)"), "the window curve left the tokens");
  });
});
