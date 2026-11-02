/**
 * terminal.test.ts — the conversion map of the terminal face (wave
 * 2-c / PR11): the owner order says ONE design serves every screen, the
 * platforms differ only in dpi, and the terminal rides the SAME tsx through
 * a build conversion. This battery pins the three legs of that law:
 *
 * - the dpi tokens (density.ts): the web dpr ladder, the terminal character
 *   cell, the tv 10-foot factor and the android dp buckets — one spacing
 *   rhythm, four densities, never a second design;
 * - the conversion map (buildterminal.ts): the css token chain resolves to
 *   rgb (color-mix blends over the canvas), the rgb quantizes down the ansi
 *   ladder (truecolor → 256 → 16 → plain), the flexbox folds to rows and
 *   columns, the gap counts cells, the hairlines and shadows become
 *   box-drawing rules and borders, the icons become glyphs;
 * - the committed proof (the app root): the shell, the chip and the keycap
 *   render from the SAME prop slots the web widgets answer, and the checked
 *   in modules never drift from what the converter emits today. The converted
 *   faces ride the application root beside their emitter (the flat folder
 *   law dissolved the terminal/ folder of the first layer).
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  TERMINAL_WIDGETS,
  convertAll,
  convertWidget,
  cssColorToRgb,
  parseCssTokens,
  parseJsxRoot,
} from "../buildterminal.ts";
import {
  DENSITY_PLATFORMS,
  TERMINAL_COLUMNS,
  densityTokens,
  dpToPx,
  pxToCellX,
  pxToCellY,
} from "../density.ts";
import {
  TONE_COLORS,
  ansiFg,
  colorDepthFromEnv,
  glyph,
  renderIr,
  rgbToAnsi16,
  rgbToAnsi256,
  type IrNode,
} from "../runtimeterminal.ts";
import { ChipTerminal } from "../chipterminal.ts";
import { KbdTerminal } from "../kbdterminal.ts";
import { ControlShellTerminal } from "../shellterminal.ts";

const approot = join(import.meta.dirname, "..");
const solcss = readFileSync(join(approot, "Sol", "sol.css"), "utf8");
const tokens = parseCssTokens(solcss);

describe("the dpi tokens (one design, four densities)", () => {
  it("answers the four platforms of the law", () => {
    expect(DENSITY_PLATFORMS).toEqual(["web", "terminal", "tv", "android"]);
  });

  it("web rides the dpr ladder — the px grid stays the unit", () => {
    for (const dpr of [1, 2, 3] as const) {
      const web = densityTokens("web", { dpr });
      expect(web.factor).toBe(dpr);
      expect(web.unit).toBe("px");
      expect(web.step).toBe(4);
    }
    expect(densityTokens("web", { dpr: 2 }).icon).toBe(32);
    expect(densityTokens("web", { dpr: 3 }).icon).toBe(48);
  });

  it("terminal counts the character cell — never a fraction of a glyph", () => {
    const terminal = densityTokens("terminal");
    expect(terminal.unit).toBe("cell");
    expect(terminal.step).toBe(1);
    expect(terminal.hairline).toBe(1);
    expect(terminal.columns).toBe(TERMINAL_COLUMNS);
    expect(densityTokens("terminal", { cols: 120 }).columns).toBe(120);
    expect(pxToCellX(32)).toBe(4);
    expect(pxToCellX(4)).toBe(1);
    expect(pxToCellY(16)).toBe(1);
  });

  it("tv answers the 10-foot factor with the doubled hit target", () => {
    const tv = densityTokens("tv");
    expect(tv.factor).toBe(1.75);
    expect(tv.step).toBe(7);
    expect(tv.hit).toBe(48);
    expect(tv.unit).toBe("px");
  });

  it("android counts dp at the 160dpi baseline", () => {
    const android = densityTokens("android", { bucket: "xhdpi" });
    expect(android.unit).toBe("dp");
    expect(android.factor).toBe(2);
    expect(dpToPx(4, "xxhdpi")).toBe(12);
    expect(dpToPx(4, "mdpi")).toBe(4);
  });
});

describe("the conversion map — colors ride the token chain to ansi", () => {
  it("resolves the design tokens through the var() chain", () => {
    expect(tokens.get("--sol-sun")).toBe("var(--color-sun)");
    expect(cssColorToRgb("var(--sol-sun)", tokens)).toEqual([255, 255, 255]);
    expect(cssColorToRgb("var(--dt-text)", tokens)).toEqual([250, 250, 250]);
    expect(cssColorToRgb("var(--dt-muted)", tokens)).toEqual([195, 195, 195]);
  });

  it("blends color-mix over the canvas (the hairline of the dark face)", () => {
    // color-mix(in oklab, #fefefe 5%, transparent) over the #202020 canvas
    expect(cssColorToRgb("var(--dt-edge)", tokens)).toEqual([43, 43, 43]);
  });

  it("quantizes rgb down the 256 cube and grayscale ramp", () => {
    expect(rgbToAnsi256([255, 255, 255])).toBe(231);
    expect(rgbToAnsi256([43, 43, 43])).toBe(235);
    expect(rgbToAnsi256([195, 195, 195])).toBe(249);
    expect(rgbToAnsi256([127, 209, 168])).toBeGreaterThan(15);
  });

  it("quantizes rgb to the 16-color base set", () => {
    expect(rgbToAnsi16([255, 255, 255])).toBe(97);
    expect(rgbToAnsi16([43, 43, 43])).toBe(30);
  });

  it("emits the escape of the asked depth — and nothing on the plain lane", () => {
    expect(ansiFg([127, 209, 168], "truecolor")).toBe("\x1b[38;2;127;209;168m");
    expect(ansiFg([255, 255, 255], "256")).toBe("\x1b[38;5;231m");
    expect(ansiFg([255, 255, 255], "none")).toBe("");
  });

  it("reads the terminal capability from the environment ladder", () => {
    expect(colorDepthFromEnv({ NO_COLOR: "1", TERM: "xterm-256color" })).toBe("none");
    expect(colorDepthFromEnv({ TERM: "dumb" })).toBe("none");
    expect(colorDepthFromEnv({ TERM: "" })).toBe("none");
    expect(colorDepthFromEnv({ COLORTERM: "truecolor" })).toBe("truecolor");
    expect(colorDepthFromEnv({ TERM: "xterm-256color" })).toBe("256");
    expect(colorDepthFromEnv({ WT_SESSION: "1", TERM: "vt100" })).toBe("256");
  });

  it("pins the chip tone palette to the sol.css tokens (no drift)", () => {
    expect(cssColorToRgb("var(--ok)", tokens)).toEqual(TONE_COLORS.ok);
    expect(cssColorToRgb("var(--warn)", tokens)).toEqual(TONE_COLORS.warn);
    expect(cssColorToRgb("var(--err)", tokens)).toEqual(TONE_COLORS.err);
    expect(cssColorToRgb("var(--info)", tokens)).toEqual(TONE_COLORS.info);
    expect(cssColorToRgb("var(--dt-muted)", tokens)).toEqual(TONE_COLORS.neutral);
  });
});

describe("the conversion map — flexbox folds to rows and columns", () => {
  const row: IrNode = {
    kind: "box",
    direction: "row",
    gap: 2,
    children: [
      { kind: "text", text: "alpha" },
      { kind: "text", text: "beta" },
    ],
  };
  const column: IrNode = {
    kind: "box",
    direction: "column",
    gap: 1,
    children: [
      { kind: "text", text: "alpha" },
      { kind: "text", text: "beta" },
    ],
  };

  it("a flex row joins the children on one line, gap in cells", () => {
    expect(renderIr(row, {}, { depth: "none" })).toEqual(["alpha  beta"]);
  });

  it("a flex column stacks the children, gap in blank rows", () => {
    expect(renderIr(column, {}, { depth: "none" })).toEqual(["alpha", "", "beta"]);
  });

  it("the hairline rule answers the border-bottom (the ─ row below)", () => {
    const ruled: IrNode = { kind: "box", direction: "column", gap: 0, rule: true, children: [{ kind: "text", text: "head" }] };
    const lines = renderIr(ruled, {}, { plain: true });
    expect(lines).toHaveLength(2);
    expect(lines[1]).toMatch(/^─+$/);
  });

  it("the shadow answers the box-drawing border", () => {
    const bordered: IrNode = { kind: "box", direction: "column", gap: 0, border: true, children: [{ kind: "text", text: "card" }] };
    const lines = renderIr(bordered, {}, { depth: "none" });
    expect(lines[0]).toMatch(/^┌─+┐$/);
    expect(lines[1]).toContain("card");
    expect(lines.at(-1)).toMatch(/^└─+┘$/);
  });

  it("the icons answer unicode glyphs with the ASCII degrade", () => {
    expect(glyph("settings")).toBe("⚙");
    expect(glyph("settings", true)).toBe("*");
    expect(glyph("play")).toBe("▶");
  });
});

describe("the committed proof — the shell, the chip and the keycap", () => {
  it("converts the real widgets of Sol (the jsx reader walks the sources)", () => {
    const chipSource = readFileSync(join(approot, "Sol", "wingets", "ShellChip.tsx"), "utf8");
    expect(parseJsxRoot(chipSource)?.tag).toBe("span");
    const { slots } = convertWidget(chipSource, tokens);
    expect(slots).toContain("children");
    expect(slots).toContain("onRemove");
  });

  it("the keycap sequence rides one line with the bracket keycaps", () => {
    expect(KbdTerminal({ keys: ["Ctrl", "K"] }, { depth: "none" })).toContain("[Ctrl] [K]");
  });

  it("the chip pill answers the tone palette and the remove glyph", () => {
    const ok = ChipTerminal({ children: "verified", tone: "ok" }, { depth: "none" });
    expect(ok).toContain("(verified)");
    const dismissable = ChipTerminal({ children: "draft", tone: "err", onRemove: true }, { depth: "none" });
    expect(dismissable).toContain("(draft ×)");
    const colored = ChipTerminal({ children: "verified", tone: "ok" }, { depth: "truecolor" });
    expect(colored).toContain("\x1b[38;2;127;209;168m");
  });

  it("the control shell renders the same hero grammar on the terminal", () => {
    const face = ControlShellTerminal(
      {
        eyebrow: "console · wave 2-c",
        title: "the one design answers every screen",
        summary: "the same tsx rides the browser and the terminal.",
        children: ["the body rhythm of the management pages"],
      },
      { plain: true },
    );
    const lines = face.split("\n");
    expect(lines[0]).toBe("◐ devthink — the os");
    expect(face).toContain("console · wave 2-c");
    expect(face).toContain("the one design answers every screen");
    expect(face).toContain("the same tsx rides the browser and the terminal.");
    expect(face).toContain("the body rhythm of the management pages");
    expect(lines.some((line) => /^─+$/.test(line.trim()))).toBe(true);
    // the actions row answers the same prop slot — absent stays absent
    expect(face).not.toContain("explore");
    expect(ControlShellTerminal({ actions: "explore" }, { plain: true })).toContain("explore");
  });

  it("the committed terminal modules never drift from the converter", () => {
    expect(TERMINAL_WIDGETS).toHaveLength(3);
    for (const file of convertAll()) {
      const committed = readFileSync(join(approot, file.output), "utf8");
      expect(committed, `${file.output} must match the conversion`).toBe(file.content);
    }
  });
});
