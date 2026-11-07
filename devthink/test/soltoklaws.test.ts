// # soltoklaws.test — the sol token law battery (the owner's named visual
// laws of the devthink sol theme, pinned per law so a future pass can
// never quietly retire one):
//
// 1. no `transition: all` anywhere — every rule names its properties,
//    tokens only, the reduced-motion hard stop carries the last word;
// 2. no pure black / pure white literals — the token ladder carries the
//    seats (the near-black/near-white rungs beside the documented pure
//    seats the doctrine words: the sun, the mask ink), rule bodies read
//    the seats, never a raw #000/#fff;
// 3. no neon, no default blue/purple, no emoji icons — the fluent sheet
//    answers the glyphs, the one sanctioned landing hover lives in the
//    landing materials block, the blue family answers only at named seats;
// 4. the z-index ladder: atmosphere 0 at the floor → tooltip 400 at the
//    ceiling — every stacking value rides a ladder band (sol.css rides
//    zindex.test; this battery walks the wingets and page sources too);
// 5. the touch floor 44px on interactive targets;
// 6. Sol single theme: white never yellow — the theme floor stays the
//    house white, no yellow-washed variant seats anywhere;
// 7. the window visuals: titlebar 28–30px, the close button
//    rgb(232,17,35), the pill purge (the §12B radius ladder owns every
//    rounded rect), the accents #a3d7e6 / #4cc2ff seated side by side.
//
// the documented artwork carve-out: the folder glyph art keeps its painted
// gloss stops (FilesFoldericons) — icon artwork is a fixed asset, the
// theme seats never reach into glyph art, and its alpha-washed whites are
// not surface fills.
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const approot = join(import.meta.dirname, "..");
const solcss = readFileSync(join(approot, "sol", "sol.css"), "utf8");

/** every tsx source under sol/ — the shell the laws govern */
function walktsx(dir: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) out.push(...walktsx(full));
    else if (name.endsWith(".tsx")) out.push(full);
  }
  return out;
}
const solfiles = walktsx(join(approot, "sol"));
const solsources = solfiles.map((path) => readFileSync(path, "utf8"));

/** the folder glyph art file — the one documented artwork carve-out (the
 * painted gloss stops ride their own asset palette, never the theme) */
const artworkfiles = solfiles.filter((path) => path.replaceAll("\\", "/").endsWith("sol/wingets/FilesFoldericons.tsx"));
const shellsources = solfiles
  .filter((path) => !artworkfiles.includes(path))
  .map((path) => ({ path, source: readFileSync(path, "utf8") }));

/** the exact-form pure literal — 3 or 6 hex digits, never a longer alpha
 * hex (the #ffffff73 gloss washes and #00000038 shadow washes of the
 * painted stacks are alpha washes, not surface fills) */
const pureliteral = /#(?:000|000000|fff|ffffff)(?![\da-f])/gi;

/** the comment-stripped sheet — the doctrine comments that NAME a banned
 * literal never answer as a rule body */
const barecss = solcss.replace(/\/\*[\s\S]*?\*\//g, "");

describe("law 1 — the transition-all ban (every rule names its properties)", () => {
  it("sol.css never names the all keyword as a declaration", () => {
    expect(barecss).not.toMatch(/transition:\s*all\b/);
    expect(barecss).not.toMatch(/transition-property:\s*all\b/);
    expect(barecss).not.toContain("transition-all");
  });

  it("every sol tsx source and html entry carries no transition-all either", () => {
    for (const source of solsources) expect(source).not.toContain("transition-all");
    for (const page of ["index.html", "design.html", "extensionpopup.html"]) {
      const html = readFileSync(join(approot, page), "utf8");
      expect(html, `${page}`).not.toContain("transition-all");
      expect(html, `${page}`).not.toMatch(/transition:\s*all\b/);
    }
  });
});

describe("law 2 — the pure black/white literal purge (the ladder seats carry the values)", () => {
  it("every pure literal in sol.css sits on a named seat declaration — never a rule body", () => {
    const lines = barecss.split("\n");
    const bodies: string[] = [];
    for (const [index, line] of lines.entries()) {
      if (pureliteral.test(line) && !/^\s*--/.test(line)) bodies.push(`line ${index + 1}: ${line.trim()}`);
      pureliteral.lastIndex = 0;
    }
    expect(bodies, `rule bodies carry pure literals: ${bodies.slice(0, 8).join(" | ")}`).toEqual([]);
  });

  it("the seat lines the literals ride are the documented ones", () => {
    for (const seat of [
      "--color-signal: #ffffff;",
      "--color-signal-strong: #ffffff;",
      "--color-sun: #ffffff;",
      "--color-mask-ink: #000;",
      "--mask-ink: #000;",
      "--dtw-face: #ffffff;",
      "--dtw-seg: #ffffff;",
      "--dtfx-card: #ffffff;",
    ]) {
      expect(solcss, `${seat} is the documented seat`).toContain(seat);
    }
  });

  it("the winget sources carry no raw pure literal outside the documented artwork", () => {
    const leaks: string[] = [];
    for (const { path, source } of shellsources) {
      const match = source.match(pureliteral);
      if (match) leaks.push(`${path}: ${match.join(", ")}`);
      pureliteral.lastIndex = 0;
    }
    expect(leaks, `winget pure literals: ${leaks.slice(0, 6).join(" | ")}`).toEqual([]);
  });

  it("the near-white ink rides the veil seat and the near seats the ladder added", () => {
    expect(solcss).toContain("--color-veil: #eef0f6;");
    expect(solcss).toContain("--dtv3-card: #fefefe;");
    expect(solcss).toContain("--dt-construction-face: #fefefe;");
    expect(solcss).toContain("--boot-face: #fefefe;");
    expect(solcss).toContain("--saas-face: #fefefe;");
  });
});

describe("law 3 — no neon, no default blue/purple, no emoji icons", () => {
  it("no default blue/indigo/violet literal answers outside the sanctioned landing block", () => {
    const landingAt = solcss.indexOf("THE LANDING MATERIALS");
    expect(landingAt).toBeGreaterThan(-1);
    const bluefamily = [
      "#3b82f6",
      "#60a5fa",
      "#818cf8",
      "#6366f1",
      "#8b5cf6",
      "#a855f7",
      "#a5b4fc",
      "59,130,246",
      "99,102,241",
      "79,70,229",
      "139,92,246",
      "168,85,247",
    ];
    const outside = solcss.slice(0, landingAt).split("\n");
    const leaks = outside
      .map((line, index) => ({ line, index }))
      .filter(({ line }) => bluefamily.some((hue) => line.includes(hue)))
      .filter(({ line }) => !/^\s*--/.test(line));
    expect(leaks.map(({ index, line }) => `line ${index + 1}: ${line.trim()}`)).toEqual([]);
  });

  it("no emoji icon answers anywhere in the shell sources", () => {
    const emoji = /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}]/u;
    for (const source of solsources) expect(emoji.test(source), "an emoji glyph rides a sol source").toBe(false);
  });
});

describe("law 4 — the z ladder (atmosphere 0 at the floor, tooltip 400 at the ceiling)", () => {
  it("the ten bands stand declared in the sheet", () => {
    for (const band of [
      "--z-atmosphere: 0;",
      "--z-content: 10;",
      "--z-float: 20;",
      "--z-bar: 50;",
      "--z-menu: 60;",
      "--z-overlay: 100;",
      "--z-dock: 150;",
      "--z-modal: 200;",
      "--z-toast: 300;",
      "--z-tooltip: 400;",
    ]) {
      expect(solcss, `${band} is a ladder band`).toContain(band);
    }
  });

  it("no raw band-scale z-index literal answers the sheet (zindex.test pins the var discipline)", () => {
    const raw = [...barecss.matchAll(/z-index:\s*([^;]+);/g)]
      .map((match) => match[1]?.trim() ?? "")
      .filter((value) => !value.startsWith("var(--z-") && !value.startsWith("calc(var(--z-"));
    const leaks = raw.filter((value) => {
      const parsed = Number.parseInt(value, 10);
      return Number.isFinite(parsed) && Math.abs(parsed) > 5;
    });
    expect(leaks).toEqual([]);
  });

  it("the winget and page sources ride the ladder — no raw z class, no raw z literal", () => {
    const zclass = /z-\[\d+\]/;
    const zliteral = /zIndex:\s*(-?\d+)\s*[,}]/;
    for (const { path, source } of shellsources) {
      expect(zclass.test(source), `${path} carries a raw z-[n] class`).toBe(false);
      const match = source.match(zliteral);
      if (match) {
        const parsed = Number.parseInt(match[1] ?? "0", 10);
        expect(Math.abs(parsed), `${path} carries the raw z literal ${match[0]}`).toBeLessThanOrEqual(5);
      }
    }
  });
});

describe("law 5 — the touch floor 44px on interactive targets", () => {
  it("the sheet carries the 44px floor family across the faces", () => {
    const floors = (solcss.match(/min-(?:height|width):\s*44px/g) ?? []).length + (solcss.match(/(?:height|width):\s*44px/g) ?? []).length;
    expect(floors, "the 44px floor rides the interactive faces").toBeGreaterThanOrEqual(20);
  });

  it("the touch doctrine stands worded in the sheet", () => {
    expect(solcss).toMatch(/touch law reaches\s*\n?\s*\*?\s*every interactive control: 44px targets/);
    expect(solcss).toContain("touch-action: manipulation;");
  });
});

describe("law 6 — Sol single theme: white never yellow", () => {
  it("no yellow-washed literal seat answers the sheet", () => {
    for (const hue of ["#ff0;", "#ffff00", "#ffd700", "#facc15", "#eab308", "#fde047", "#fbbf24", "#f59e0b"]) {
      expect(solcss.toLowerCase()).not.toContain(hue);
    }
  });

  it("the sun seat stays the house white on both faces", () => {
    expect(solcss).toContain("--color-sun: #ffffff;");
    const flips = solcss.match(/\[data-theme="light"\] \{[\s\S]*?\n\}/g) ?? [];
    expect(flips.some((block) => block.includes("--color-sun: #ffffff;")), "the light face keeps the white sun").toBe(
      true,
    );
  });
});

describe("law 7 — the window visuals (titlebar, close red, pills, the accent pair)", () => {
  it("the titlebar band seats 30px standard and 28px compact", () => {
    expect(solcss).toContain("--win-titlebar-h: 30px;");
    expect(solcss).toContain("--win-titlebar-h-compact: 28px;");
  });

  it("the close button rides the rgb(232,17,35) seat", () => {
    expect(solcss).toContain("--win-close: rgb(232 17 35);");
    expect(solcss).toContain("--color-close: #e81123;");
  });

  it("the pill purge holds — zero 999px/9999px literals, the ladder base carries the pill rung", () => {
    expect([...solcss.matchAll(/border-radius:\s*(9999px|999px)/g)]).toEqual([]);
    expect(solcss).toContain("--r-pill: 10px;");
    expect(solcss).toContain("--win-pill: 10px;");
  });

  it("the accent pair sits side by side — the ice vault and the windows focus", () => {
    expect(solcss).toContain("--accent-ice-vault: #a3d7e6;");
    expect(solcss).toContain("--color-win: #4cc2ff;");
    expect(solcss).toContain("#4cc2ff");
  });
});
