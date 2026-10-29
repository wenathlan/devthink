/**
 * runtime.terminal.ts — the terminal side of the one design (wave 2-c / PR11): the
 * render primitives the converted Sol widgets ride. build.terminal.ts turns
 * the TSX widgets into IR trees (JSON) and this module interprets them into
 * ANSI rows — the same design, the same tokens, the cell as the unit (the
 * density.ts law). The IR is deliberately ink-shaped (box = flexDirection /
 * borderStyle / padding / gap, text = color / bold / dim): mounting these
 * trees on ink/react for the interactive TUI pass is a one-to-one mapping —
 * the OpenCode reference — while this runtime stays dependency-free so the
 * published face runs headless on Linux, Windows 10/11 and Android (termux)
 * with plain node or bun, no browser, no install.
 *
 * The module rides the application root beside its emitter (the flat folder
 * law dissolved the terminal/ folder of the first layer): the name carries
 * the .terminal family infix because the root already owns a runtime.ts —
 * the platform adapter runtime of the 1.1.90 consolidation — so the terminal
 * render runtime answers as runtime.terminal.ts, the one name of its family.
 *
 * The conversion map this runtime owns (the full map lives documented on
 * build.terminal.ts):
 * - flexbox row  → children joined on one line, gap in spaces (cells);
 * - flexbox column → children stacked, gap in blank rows;
 * - color tokens → ANSI truecolor / 256 / 16 by terminal capability;
 * - hairline rules and shadows → box-drawing borders (─ ┌ ┐ └ ┘ │);
 * - lucide/fluent icons → unicode glyphs, ASCII degrade under --plain;
 * - fonts and letter-spacing → weight (bold) and scale only — a cell cannot
 *   track, so the micro eyebrow reads bold-dim and the display title bold.
 *
 * Pure TypeScript, zero imports.
 */

/** an rgb triple of the design tokens */
export type Rgb = readonly [number, number, number];

/** the color depth a terminal answers */
export type ColorDepth = "truecolor" | "256" | "16" | "none";

/** the icon → unicode glyph map (the lucide/fluent names the Sol widgets
 * mount; --plain degrades every glyph to the ASCII stand-in) */
export const ICON_GLYPHS: Readonly<Record<string, string>> = {
  settings: "⚙",
  terminal: ">_",
  search: "⌕",
  play: "▶",
  pause: "‖",
  close: "×",
  check: "✓",
  warn: "△",
  error: "✕",
  info: "ℹ",
  chevronright: "›",
  chevronleft: "‹",
  arrowup: "↑",
  arrowdown: "↓",
  dot: "●",
  sun: "◉",
  moon: "☾",
  wrench: "🔧",
  home: "⌂",
  user: "☺",
  folder: "▤",
  file: "▫",
  cloud: "☁",
  bolt: "⚡",
  lock: "🔒",
  key: "🔑",
};

/** the ASCII degrade of the glyph set (Windows conhost and NO_COLOR lanes) */
export const ICON_GLYPHS_PLAIN: Readonly<Record<string, string>> = {
  settings: "*",
  terminal: ">",
  search: "?",
  play: ">",
  pause: "||",
  close: "x",
  check: "v",
  warn: "!",
  error: "x",
  info: "i",
  chevronright: ">",
  chevronleft: "<",
  arrowup: "^",
  arrowdown: "v",
  dot: "*",
  sun: "o",
  moon: "o",
  wrench: "#",
  home: "h",
  user: "u",
  folder: "[]",
  file: "_",
  cloud: "~",
  bolt: "!",
  lock: "L",
  key: "k",
};

/** resolves the glyph of one icon name (the plain lane answers ASCII) */
export function glyph(name: string, plain = false): string {
  const key = name.toLowerCase().replace(/[^a-z]/g, "");
  const table = plain ? ICON_GLYPHS_PLAIN : ICON_GLYPHS;
  return table[key] ?? (plain ? "*" : "·");
}

/* ---------------------------------------------------------------------------
 * the ANSI ladder: rgb → truecolor / 256 / 16
 * ------------------------------------------------------------------------- */

/** quantizes one rgb to the xterm 256 cube+grayscale index (the 6×6×6 cube
 * at 16..231, the 24-step grayscale ramp at 232..255) */
export function rgbToAnsi256(rgb: Rgb): number {
  const [r, g, b] = rgb;
  if (r === g && g === b) {
    // the grayscale ramp: 16 and 231 are the ends, 24 steps between
    if (r < 8) return 16;
    if (r > 248) return 231;
    return 232 + Math.round(((r - 8) / 247) * 23);
  }
  const cube = (v: number) => (v < 48 ? 0 : v < 115 ? 1 : Math.min(5, Math.round((v - 35) / 40)));
  return 16 + 36 * cube(r) + 6 * cube(g) + cube(b);
}

/** quantizes one rgb to the 16-color base set: each channel folds to on/off
 * (the 8 colors) and the luminance lifts the result into the bright set */
export function rgbToAnsi16(rgb: Rgb): number {
  const [r, g, b] = rgb;
  const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  const bright = lum >= 96;
  const chan = (v: number) => (v >= 96 ? 1 : 0);
  const code = chan(r) * 1 + chan(g) * 2 + chan(b) * 4;
  // code 0 is black (30), the colored set rides 31..36, bright adds 60
  if (code === 0) return bright ? 90 : 30;
  return (bright ? 90 : 30) + code;
}

/** wraps one rgb into the escape sequence of the asked depth (fg color) */
export function ansiFg(rgb: Rgb | undefined, depth: ColorDepth): string {
  if (!rgb || depth === "none") return "";
  if (depth === "truecolor") return `\x1b[38;2;${rgb[0]};${rgb[1]};${rgb[2]}m`;
  if (depth === "256") return `\x1b[38;5;${rgbToAnsi256(rgb)}m`;
  return `\x1b[${rgbToAnsi16(rgb)}m`;
}

/** the closing escape of a colored span */
export const ANSI_RESET = "\x1b[0m";

/** reads the color depth a terminal answers from its environment (the
 * Windows 10/11 terminals, linux and termux all ride this ladder; NO_COLOR
 * and TERM=dumb answer the plain lane) */
export function colorDepthFromEnv(env: Record<string, string | undefined>): ColorDepth {
  if (env.NO_COLOR || env.TERM === "dumb" || env.TERM === "") return "none";
  if (env.COLORTERM === "truecolor" || env.COLORTERM === "24bit") return "truecolor";
  if ((env.TERM ?? "").includes("256color")) return "256";
  if (env.WT_SESSION || env.TERM_PROGRAM === "vscode" || env.ANSICON) return "256";
  if ((env.TERM ?? "").includes("xterm")) return "256";
  return "16";
}

/* ---------------------------------------------------------------------------
 * the IR (ink-shaped: box = flexDirection/gap/border, text = color/bold/dim)
 * ------------------------------------------------------------------------- */

export type IrText = {
  kind: "text";
  /** a literal string, or a prop slot name, or an item slot of a map node */
  text?: string;
  slot?: string;
  item?: string;
  /** the token color (rgb) the text rides */
  color?: Rgb;
  bold?: boolean;
  dim?: boolean;
  /** the scale class the web font size converted into */
  scale?: "display" | "body" | "micro";
  /** an icon glyph name the node mounts */
  icon?: string;
  /** the prop slot this node renders only when it holds a truthy value */
  when?: string;
  /** the verdict tone slot (the chip data-tone map) */
  toneSlot?: string;
  /** the inline decoration the web border converted into: keycaps ride
   * brackets, chips ride parens (the pill and the doubled bottom edge) */
  deco?: "bracket" | "paren";
};

export type IrBox = {
  kind: "box";
  /** flexDirection row|column — the flex→rows map */
  direction: "row" | "column";
  /** the flex gap converted to cells (spaces in row, blank rows in column) */
  gap: number;
  /** a hairline rule below the box (border-bottom → the ─ row) */
  rule?: boolean;
  /** a full box border (shadows and bordered chips → box drawing) */
  border?: boolean;
  /** left padding in cells */
  padX?: number;
  /** vertical padding in blank rows */
  padY?: number;
  /** the prop slot this box renders only when it holds a truthy value */
  when?: string;
  /** the inline pill decoration of a row box (the chip border-radius →
   * parens — a cell cannot round) */
  deco?: "paren" | "bracket";
  children: IrNode[];
};

export type IrChrome = { kind: "chrome" };
export type IrMap = { kind: "map"; slot: string; item: string; child: IrNode; gap?: number };
export type IrChildren = { kind: "children" };

export type IrNode = IrText | IrBox | IrChrome | IrMap | IrChildren;

/** the verdict tones of the family chips (the .uichip[data-tone] palette of
 * sol.css, dark face — the terminal answers the dark token set): the values
 * are pinned here with their source so the conversion test can assert the
 * css and the runtime never drift */
export const TONE_COLORS: Readonly<Record<string, Rgb>> = {
  neutral: [195, 195, 195], // var(--dt-muted) → #c3c3c3
  ok: [127, 209, 168], // var(--ok) → #7fd1a8
  warn: [226, 194, 106], // var(--warn) → #e2c26a
  err: [240, 138, 122], // var(--err) → #f08a7a
  info: [185, 194, 208], // var(--info) → #b9c2d0
};

/** the props the converted widget receives — the SAME props the web face
 * answers (the interactivity contract survives the conversion) */
export type IrProps = Record<string, unknown>;

export type RenderOptions = {
  depth?: ColorDepth;
  plain?: boolean;
  /** the live terminal width in cells (the responsive fold) */
  columns?: number;
};

/* ---------------------------------------------------------------------------
 * the renderer: IR → ANSI rows
 * ------------------------------------------------------------------------- */

/** paints one string with the sgr flags of a text node */
function paint(content: string, node: { color?: Rgb; bold?: boolean; dim?: boolean }, depth: ColorDepth, plain: boolean): string {
  if (plain) return content;
  const flags: string[] = [];
  if (node.bold) flags.push("\x1b[1m");
  if (node.dim) flags.push("\x1b[2m");
  const color = ansiFg(node.color, depth);
  if (color) flags.push(color);
  if (flags.length === 0) return content;
  return `${flags.join("")}${content}${ANSI_RESET}`;
}

/** renders the terminal chrome band (the ShellChrome navbar → the brand row
 * plus the hairline — the one chrome of the design on the terminal) */
function renderChrome(depth: ColorDepth, plain: boolean, columns: number): string[] {
  const width = Math.max(columns, 40);
  const brand = paint("◐ devthink — the os", { color: [250, 250, 250], bold: true }, depth, plain);
  const rule = paint("─".repeat(width), { color: [67, 67, 67], dim: true }, depth, plain);
  return [brand, rule];
}

/** renders one IR node to lines (the flex→rows engine: a row joins children
 * on one line, a column stacks them) */
export function renderIr(ir: IrNode, props: IrProps = {}, options: RenderOptions = {}): string[] {
  const depth = options.depth ?? "truecolor";
  const plain = options.plain ?? false;
  const columns = options.columns ?? 80;
  const resolveText = (node: IrText): string => {
    if (node.icon) return glyph(node.icon, plain);
    if (node.text !== undefined) return node.text;
    if (node.slot !== undefined) {
      const value = props[node.slot];
      return value === undefined ? "" : String(value);
    }
    if (node.item !== undefined) return String(props[`__item:${node.item}`] ?? "");
    return "";
  };
  const truthy = (slot: string | undefined): boolean => slot === undefined || Boolean(props[slot]);
  switch (ir.kind) {
    case "text": {
      if (!truthy(ir.when)) return [];
      let content = resolveText(ir);
      const tone = ir.toneSlot ? String(props[ir.toneSlot] ?? "neutral") : undefined;
      const toneColor = tone ? TONE_COLORS[tone] : undefined;
      if (ir.deco === "bracket") content = `[${content}]`;
      if (ir.deco === "paren") content = `(${content})`;
      // the responsive fold: the terminal width IS the measure (the 640px
      // lede of the web face answers the same 80 cells here)
      return wrapCells(content, columns).map((line) =>
        paint(line, { color: ir.color ?? toneColor, bold: ir.bold, dim: ir.dim }, depth, plain),
      );
    }
    case "chrome":
      return renderChrome(depth, plain, columns);
    case "children": {
      const value = props.children;
      if (typeof value === "string") return value.split("\n");
      if (Array.isArray(value)) return value.flatMap((line) => String(line).split("\n"));
      return [];
    }
    case "map": {
      const list = props[ir.slot];
      if (!Array.isArray(list)) return [];
      const itemLines = list.map((entry) =>
        renderIr(ir.child, { ...props, [`__item:${ir.item}`]: entry }, options),
      );
      // mapped children of a flex row join inline (the list layout of the
      // one design — keycap sequences read on one line)
      if (itemLines.every((set) => set.length === 1)) {
        const sep = " ".repeat(ir.gap ?? 1);
        return [itemLines.map((set) => set[0]).join(sep)];
      }
      return itemLines.flatMap((set) => set);
    }
    case "box": {
      if (!truthy(ir.when)) return [];
      const pad = " ".repeat(ir.padX ?? 0);
      const childLines = ir.children.map((child) => renderIr(child, props, options));
      let lines: string[];
      if (ir.direction === "row") {
        // flex row → every child on one line, joined by the gap in cells
        const height = Math.max(1, ...childLines.map((set) => set.length));
        const gap = " ".repeat(ir.gap);
        lines = [];
        for (let row = 0; row < height; row++) {
          const joined = childLines
            .map((set) => set[row] ?? "")
            .join(gap)
            .trimEnd();
          lines.push(joined);
        }
      } else {
        // flex column → every child stacked, blank rows between
        lines = [];
        for (let index = 0; index < childLines.length; index++) {
          if (index > 0) lines.push(...Array.from({ length: ir.gap }, () => ""));
          lines.push(...childLines[index]);
        }
      }
      if (ir.deco && ir.direction === "row") {
        const open = ir.deco === "paren" ? "(" : "[";
        const close = ir.deco === "paren" ? ")" : "]";
        lines = lines.map((line) => (line.length > 0 ? open + line + close : line));
      }
      if (ir.border) {
        // shadow/boxed chip → the box-drawing border of the terminal
        const width = Math.max(1, ...lines.map((line) => visibleLength(line)));
        const top = `┌${"─".repeat(width + 2)}┐`;
        const bottom = `└${"─".repeat(width + 2)}┘`;
        lines = [top, ...lines.map((line) => `│ ${line.padEnd(width)} │`), bottom];
      }
      if (ir.rule) {
        const width = Math.max(1, ...lines.map((line) => visibleLength(line)), 1);
        lines.push(paint("─".repeat(Math.min(width, columns)), { color: [67, 67, 67], dim: true }, depth, plain));
      }
      if (ir.padY) {
        const blank = Array.from({ length: ir.padY }, () => "");
        lines = [...blank, ...lines, ...blank];
      }
      return lines.map((line) => (line.length > 0 ? pad + line : line));
    }
  }
}

/** the visible width of a line (escape sequences carry no cells) */
export function visibleLength(line: string): number {
  let width = 0;
  let inEscape = false;
  for (const char of line) {
    if (inEscape) {
      if (char === "m") inEscape = false;
      continue;
    }
    if (char === "\x1b") {
      inEscape = true;
      continue;
    }
    width += 1;
  }
  return width;
}

/** word-wraps one plain string to the cell budget (the responsive fold of
 * the terminal — words never break mid-glyph) */
export function wrapCells(text: string, columns: number): string[] {
  if (visibleLength(text) <= columns) return [text];
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const candidate = line.length === 0 ? word : `${line} ${word}`;
    if (visibleLength(candidate) > columns && line.length > 0) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  }
  if (line.length > 0) lines.push(line);
  return lines;
}

/** renders one IR tree to the final terminal document (trailing spaces
 * trimmed, the family newline contract) */
export function render(ir: IrNode, props: IrProps = {}, options: RenderOptions = {}): string {
  return renderIr(ir, props, options)
    .map((line) => line.trimEnd())
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trimEnd();
}
