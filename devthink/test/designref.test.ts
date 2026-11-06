// # designref.test — the designref battery (the owner's complaint set,
// pinned): the design rides the DevThink Web reference face, and the
// deviations the owner catalogued stay dead — no blue glows outside the
// one sanctioned landing hover, no blue default key on the hero, no
// leaking elevation on the login card, no white border artifacts on the
// flat chrome, no transition-all anywhere (every rule names its
// properties), no freehand 999px pill literals in the sheet (the §12B
// radius ladder 10/16/24 owns every rounded rect and the geometric 50%
// owns every true circle — the pills the reference itself wears live in
// the landing wingets as the rounded-full utility, never as literals of
// sol.css), and no indigo-300 hover borders (the CTA accent answers the
// §12B pair #0067c0 light / #4cc2ff dark). The zoomlock battery rides
// zoomlock.test, the fluent icon and type voice ride fluenticons.test,
// the restored face values ride entryface.test — this battery pins the
// purge laws so a future pass can never quietly retire one.
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const approot = join(import.meta.dirname, "..");
const solcss = readFileSync(join(approot, "sol", "sol.css"), "utf8");
const sections = readFileSync(join(approot, "sol", "wingets", "IntroSaassections.tsx"), "utf8");
const composer = readFileSync(join(approot, "sol", "wingets", "ChatComposer.tsx"), "utf8");
const explorechrome = readFileSync(join(approot, "sol", "wingets", "ExploreWindowchrome.tsx"), "utf8");
const indexhtml = readFileSync(join(approot, "index.html"), "utf8");
const designhtml = readFileSync(join(approot, "design.html"), "utf8");
const popuphtml = readFileSync(join(approot, "extensionpopup.html"), "utf8");

/** the marker of the landing materials block — the one zone the reference
 * itself sanctions the indigo hover family (its own tactile keys) */
const landingAt = solcss.indexOf("THE LANDING MATERIALS");
expect(landingAt, "the landing materials block lives in sol.css").toBeGreaterThan(-1);

/** every tsx source under sol/ — the shell the purge laws govern */
function walktsx(dir: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) out.push(...walktsx(full));
    else if (name.endsWith(".tsx")) out.push(full);
  }
  return out;
}
const shellsources = walktsx(join(approot, "sol")).map((path) => readFileSync(path, "utf8"));

/** the raw blue/indigo/violet family the no-default-blue law bans from
 * shadow literals — every hue a "blue glow" could ride */
const bluefamily = [
  "59,130,246",
  "99,102,241",
  "79,70,229",
  "139,92,246",
  "168,85,247",
  "56,189,248",
  "96,165,250",
  "14,165,233",
  "37,99,235",
  "#3b82f6",
  "#60a5fa",
  "#818cf8",
  "#6366f1",
  "#8b5cf6",
  "#a855f7",
  "#a5b4fc",
];

describe("the transition-all purge (every rule names its properties)", () => {
  it("sol.css never names the all keyword — no class utility, no declaration", () => {
    expect(solcss).not.toContain("transition-all");
    /* the declaration scan reads the comment-stripped sheet — the doctrine
     * comments that BAN the keyword never answer as declarations */
    const bare = solcss.replace(/\/\*[\s\S]*?\*\//g, "");
    expect(bare).not.toMatch(/transition:\s*all\b/);
    expect(bare).not.toMatch(/transition-property:\s*all\b/);
  });

  it("the shell wingets and every html entry carry no transition-all either", () => {
    for (const [index, source] of shellsources.entries()) {
      expect(source, `sol tsx source #${index} carries no transition-all class`).not.toContain("transition-all");
    }
    for (const [name, page] of [
      ["index.html", indexhtml],
      ["design.html", designhtml],
      ["extensionpopup.html", popuphtml],
    ] as const) {
      expect(page, `${name} carries no transition-all class`).not.toContain("transition-all");
      expect(page, `${name} declares no transition: all`).not.toMatch(/transition:\s*all\b/);
    }
  });
});

describe("the pill radius purge (the §12B ladder owns every shape)", () => {
  it("sol.css carries zero 999px/9999px literals — the sanctioned exception list is empty", () => {
    /* the exception the law allows — the pills the reference itself wears
     * on its own landing face — ride the rounded-full utility of the
     * landing wingets (compiled by tailwind, pinned by entryface), never
     * a literal of this sheet: the sheet itself answers the ladder alone */
    const sanctioned: string[] = [];
    const pills = [...solcss.matchAll(/border-radius:\s*(9999px|999px)/g)].map((match) => match[1] ?? "");
    expect(pills).toEqual(sanctioned);
    /* the two legacy pill tokens read the ladder base now — no token may
     * smuggle the freehand value back in */
    expect(solcss).not.toMatch(/--[a-z-]*pill[a-z-]*:\s*9999?px/);
  });

  it("the two pill tokens read the ladder base rung", () => {
    expect(solcss).toContain("--r-pill: 10px;");
    expect(solcss).toContain("--win-pill: 10px;");
  });

  it("the circles ride the geometric half or the 2xl rung — never a pill literal", () => {
    expect(solcss.match(/^\.dot \{[^}]*\}/m)?.[0], "the status dot stays the circle").toContain("border-radius: 50%;");
    expect(solcss.match(/^\.avatar \{[^}]*\}/m)?.[0], "the avatar stays the circle at every size rung").toContain(
      "border-radius: 50%;",
    );
    expect(solcss.match(/^\.uichip__x \{[^}]*\}/m)?.[0], "the chip dismiss glyph stays the circle").toContain(
      "border-radius: 50%;",
    );
    /* the 32px signal circle: 16px (the 2xl rung) is the exact half that
     * draws the circle — every .dtc-send definition that sets a radius
     * carries it (the nested state rules set no radius of their own) */
    const sends = [...solcss.matchAll(/^\.dtc-send \{[^}]*\}/gm)].map((match) => match[0] ?? "");
    const radiused = sends.filter((block) => block.includes("border-radius:"));
    expect(radiused.length, "the send key radius definitions live in the sheet").toBeGreaterThanOrEqual(2);
    for (const send of radiused) {
      expect(send, "the 32px signal key draws its circle on the 2xl rung").toContain(
        "border-radius: var(--sol-radius-2xl);",
      );
    }
  });

  it("the chips, the toggles and the caption chrome ride the ladder rungs", () => {
    /* the owner's named example: the plans badge answers the ladder base
     * with the family's own fallback literal */
    expect(solcss).toContain(
      ".plans-badge { display: inline-flex; align-items: center; min-height: 26px; padding: 0 12px; border-radius: var(--sol-radius, 10px)",
    );
    expect(solcss.match(/^\.uichip \{[^}]*\}/m)?.[0], "the ui chip reads the base rung").toContain(
      "border-radius: 10px;",
    );
    expect(
      solcss.match(/^\.dtw-settings__pill \{[^}]*\}/m)?.[0],
      "the settings status chip reads the base rung",
    ).toContain("border-radius: var(--sol-radius);");
    expect(
      solcss.match(/^\.dtw-settings__switchtrack \{[^}]*\}/m)?.[0],
      "the toggle track reads the base rung (the exact half of its 20px height — the capsule stays)",
    ).toContain("border-radius: var(--sol-radius);");
    for (const chip of [".dtc-compactpill", ".dtc-welcome__ghost", ".dtc-tasks__chip"]) {
      expect(
        solcss.match(new RegExp(`^${chip.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")} \\{[^}]*\\}`, "m"))?.[0],
        `${chip} reads the base rung`,
      ).toContain("border-radius: var(--sol-radius);");
    }
    /* the caption chrome (the rounded-full chrome of the complaint): the
     * snap pair and the caption/close pair read the caption rung */
    expect(solcss.match(/^\.shell-window__snapbtn \{[^}]*\}/m)?.[0]).toContain("border-radius: var(--win-pill);");
    expect(solcss.match(/\.shell-window__caption,\n\.shell-window__close \{[^}]*\}/)?.[0]).toContain(
      "border-radius: var(--win-pill);",
    );
  });

  it("the composer resting morph reads the caption rung — no pill fallback literal", () => {
    expect(composer).toContain('borderRadius: resting ? "var(--win-pill, 10px)"');
    expect(composer).not.toContain("999px");
    expect(composer).not.toContain("9999px");
  });

  it("the explore chrome rides the caption rung — the chrome never wears the rounded-full pill", () => {
    expect(explorechrome, "the close key reads the caption rung token").toContain("rounded-(--win-pill)");
    expect(explorechrome, "the window chrome carries no rounded-full class").not.toContain("rounded-full");
  });
});

describe("the no-default-blue CTA law (the indigo-300 purge)", () => {
  it("no indigo-300 border class answers anywhere in the shell or the entries", () => {
    for (const [index, source] of shellsources.entries()) {
      expect(source, `sol tsx source #${index} carries no indigo-300 border`).not.toContain("indigo-300");
    }
    expect(indexhtml).not.toContain("indigo-300");
    expect(designhtml).not.toContain("indigo-300");
  });

  it("the secondary hero key hovers on the §12B accent pair, never the default indigo", () => {
    expect(sections).toContain("hover:border-[#0067c0]/45");
    /* the surface grammar of the reference key survives the purge */
    expect(sections).toContain("surface-card flex items-center gap-2.5 rounded-full px-7 py-4");
  });

  it("the primary hero key stays the reference tactile dark key — never a blue default", () => {
    expect(sections).toContain('className="btn-tactile-3d flex items-center gap-2.5 rounded-full px-10 py-4');
    expect(sections).not.toContain("bg-blue-600");
    expect(sections).not.toContain("bg-sky-500");
  });
});

describe("the blue glow purge (the one sanctioned glow lives in the landing block)", () => {
  it("no blue-family shadow literal answers outside the landing materials", () => {
    const before = solcss.slice(0, landingAt);
    const declarations = [...before.matchAll(/box-shadow:\s*([^;]+);/g)].map((match) =>
      (match[1] ?? "").replace(/\s+/g, ""),
    );
    expect(declarations.length, "the sheet carries box-shadow declarations to scan").toBeGreaterThan(50);
    for (const value of declarations) {
      for (const hue of bluefamily) {
        expect(value, `the shadow ${value} carries no default-blue hue`).not.toContain(hue);
      }
    }
  });

  it("the sanctioned indigo hover of the tactile keys survives inside the landing block", () => {
    const after = solcss.slice(landingAt);
    expect(after).toContain("rgba(79, 70, 229, 0.45)");
  });
});

describe("the login contained shadow (the leak the owner reported stays dead)", () => {
  it("the sign-in card carries one contained drop and never the window token union", () => {
    const card = solcss.match(/^\.dtw-login__card \{[^}]*\}/m)?.[0] ?? "";
    expect(card, "the login card rule lives in the sheet").not.toBe("");
    expect(card).toContain("0 12px 28px rgb(0 0 0 / 16%)");
    /* the tighter heal the owner ordered: the 0 16px 40px / 22% reach the
     * first contained cut carried still read as a leaking wash on the
     * translucent mica — the 0 12px 28px / 16% seat is the whole law now */
    expect(card).not.toContain("0 16px 40px");
    /* the leaking signature: the doubled elevation that stacked the
     * window token union (the 0 32px 64px reach plus its 0 0 8px halo)
     * beyond the card edge — none of it may ride the mica card again */
    expect(card).not.toContain("var(--win-shad-window)");
    expect(card).not.toContain("var(--win-shadow-window)");
    expect(card).not.toContain("var(--shadow-window)");
    expect(card).not.toContain("0 32px 64px");
    expect(card).not.toContain("0 0 8px");
  });
});

describe("the white border law (the flat taskbar, the flipped light chrome)", () => {
  it("the taskbar bar stays flat — no border, no gradient, no pill", () => {
    const bar = solcss.match(/^\.acrylic-bar \{[^}]*\}/m)?.[0] ?? "";
    expect(bar, "the acrylic bar rule lives in the sheet").not.toBe("");
    expect(bar).not.toContain("border");
    expect(bar).not.toMatch(/gradient/);
  });

  it("the light chrome flips its white hairlines to ink — no white border artifact", () => {
    expect(solcss).toMatch(/\[data-theme="light"\] \.acrylic-menu \{[^}]*border-color: rgb\(0 0 0 \/ 12%\)/);
    expect(solcss).toMatch(/\[data-theme="light"\] \.acrylic-tip \{[^}]*border-color: rgb\(0 0 0 \/ 12%\)/);
  });
});
