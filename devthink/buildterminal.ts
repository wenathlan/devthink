/**
 * buildterminal.ts — the tsx→terminal converter (wave 2-c / PR11): the ONE
 * design of the Sol theme rides the terminal through a BUILD conversion, not
 * a second design. This script reads the design tokens of Sol/sol.css and
 * the TSX widgets of Sol/wingets, walks the JSX and emits terminal modules
 * at the application root (the flat folder law dissolved the terminal/
 * folder of the first layer) that the runtime (runtimeterminal.ts) renders
 * into ANSI — the OpenCode reference (a modern TUI in TSX-like trees): the IR is
 * ink-shaped (box = flexDirection/gap/border, text = color/bold/dim), so the
 * interactive ink/react pass mounts the same trees one-to-one while the
 * dependency-free runtime keeps the published face runnable headless on
 * Linux, Windows 10/11 and Android (termux) with plain node or bun.
 *
 * THE CONVERSION MAP (the whole map, so every rule is one place):
 *
 *   web (tsx + css tokens)              terminal (cells + ansi)
 *   ────────────────────────────────    ─────────────────────────────────
 *   flexbox / grid, flexDirection       box row (children join one line) /
 *                                        box column (children stack lines)
 *   gap: 12px                           row: round(px/8) spaces;
 *                                        column: round(px/16) blank rows
 *   padding: "24px 32px"                padY blank rows + padX cell indent
 *   color: var(--dt-text)               the css token chain resolved to rgb
 *                                        → ansi truecolor / 256 / 16 ladder
 *   color-mix(x N%, transparent)        x blended over the canvas token
 *   border-bottom: 1px solid edge       the ─ hairline row (dim gray)
 *   box-shadow / bordered boxes         the ┌─┐│└┘ box-drawing border
 *   border-radius pill (uichip)         ( ) parens — a cell cannot round
 *   .kbd doubled bottom edge            [ ] brackets — the keycap glyph
 *   font: "700 30px display"            bold + the display scale class
 *   font: "600 10px mono"               bold + the micro scale class
 *   letter-spacing                      dropped — a cell cannot track
 *   max-width / width / margin          dropped — the terminal width IS the
 *                                        responsive fold (columns prop)
 *   lucide / fluentui icon components   unicode glyphs (⚙ ▶ ● …), ASCII
 *                                        degrade on the --plain lane
 *   {prop} slots                        the SAME prop slots (the props API
 *                                        survives: ControlShellTerminal takes
 *                                        eyebrow/title/summary/actions)
 *   {prop ? (<el/>) : null}             the node with when: "prop"
 *   {list.map((x) => (<el/>))}          the map node (list rendering)
 *   {children}                          the children node (passthrough)
 *   animation / staged entrance         dropped — stillness is the terminal
 *                                        motion law already
 *   aria-label / title                  dropped on the paint lane (the
 *                                        visible text stays identical)
 *   ShellChrome (the navbar)            the chrome band: brand row + rule
 *
 * The density law rides the same build: the cell is the terminal unit of
 * density.ts (px quantize to cells, never fractions of a glyph), so the
 * platforms differ ONLY in dpi — the design never forks.
 *
 * Usage (node ≥ 23.6 or bun, no install, no browser):
 *   node buildterminal.ts           convert + write *terminal.ts at the root
 *   node buildterminal.ts --check   verify the committed output matches
 *
 * Pure TypeScript, node:fs only.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { pxToCellX, pxToCellY } from "./density.ts";
import type { IrNode } from "./runtimeterminal.ts";

/* ---------------------------------------------------------------------------
 * the design tokens (sol.css → the terminal palette)
 * ------------------------------------------------------------------------- */

/** a css style declaration dict as the converter reads it */
export type StyleDict = Record<string, string>;

/** parses the custom property declarations of a stylesheet — first
 * definition wins, so the dark face (the first block of sol.css) is the set
 * the terminal answers: terminals are the dark face of the same design */
export function parseCssTokens(css: string): Map<string, string> {
  const tokens = new Map<string, string>();
  for (const match of css.matchAll(/--([a-z0-9-]+)\s*:\s*([^;}]+)/g)) {
    const name = `--${match[1]}`;
    if (!tokens.has(name)) tokens.set(name, match[2].trim());
  }
  return tokens;
}

/** resolves the var() chain of one value (with fallbacks) through tokens */
export function resolveCssVars(value: string, tokens: Map<string, string>): string {
  let out = value.trim();
  for (let guard = 0; guard < 16; guard++) {
    const use = /var\(\s*(--[a-z0-9-]+)\s*(?:,\s*([^()]+)\s*)?\)/.exec(out);
    if (!use) return out;
    const replacement = tokens.get(use[1]) ?? use[2] ?? "";
    out = out.slice(0, use.index) + replacement + out.slice(use.index + use[0].length);
  }
  return out;
}

/** an rgb triple (mirrors the runtime type without importing react land) */
export type Rgb = readonly [number, number, number];

/** converts one css color value to rgb through the token chain — hex,
 * rgb()/rgba() and color-mix (the mix blends over the canvas, the honest
 * approximation of alpha on a terminal that paints text only) */
export function cssColorToRgb(value: string, tokens: Map<string, string>, bg: Rgb = [32, 32, 32]): Rgb | undefined {
  const resolved = resolveCssVars(value, tokens).trim().replace(/^["']|["']$/g, "");
  if (!resolved || resolved === "transparent" || resolved === "none" || resolved === "inherit") return undefined;
  const hex = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(resolved);
  if (hex) {
    const digits = hex[1].length === 3 ? hex[1].split("").map((c) => c + c).join("") : hex[1];
    return [
      Number.parseInt(digits.slice(0, 2), 16),
      Number.parseInt(digits.slice(2, 4), 16),
      Number.parseInt(digits.slice(4, 6), 16),
    ] as Rgb;
  }
  const func = /^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)/.exec(resolved);
  if (func) return [Number(func[1]), Number(func[2]), Number(func[3])] as Rgb;
  const mix = /^color-mix\(\s*in\s+[a-z-]+\s*,\s*([^,]+?)\s+([\d.]+)%,\s*(.+?)\s*\)$/.exec(resolved);
  if (mix) {
    const fg = cssColorToRgb(mix[1], tokens, bg);
    const pct = Number(mix[2]) / 100;
    if (!fg || pct <= 0) return undefined;
    const rest = mix[3].trim();
    const base = rest === "transparent" ? bg : (cssColorToRgb(rest, tokens, bg) ?? bg);
    return [
      Math.round(fg[0] * pct + base[0] * (1 - pct)),
      Math.round(fg[1] * pct + base[1] * (1 - pct)),
      Math.round(fg[2] * pct + base[2] * (1 - pct)),
    ] as Rgb;
  }
  return undefined;
}

/* ---------------------------------------------------------------------------
 * the jsx reader (a lightweight structural scan — no compiler dependency)
 * ------------------------------------------------------------------------- */

export type JsxAttr = { name: string; value: string; form: "string" | "expr" | "none" };
export type JsxChild =
  | { type: "element"; element: JsxElement }
  | { type: "text"; text: string }
  | { type: "slot"; expr: string };
export type JsxElement = { tag: string; attrs: JsxAttr[]; children: JsxChild[] };

/** reads one balanced brace region (strings and nesting respected) */
function readBalanced(source: string, start: number, open: string = "{", close: string = "}"): { content: string; next: number } {
  let depth = 0;
  let inStr: string | null = null;
  for (let i = start; i < source.length; i++) {
    const char = source[i];
    if (inStr) {
      if (char === inStr && source[i - 1] !== "\\") inStr = null;
      continue;
    }
    if (char === '"' || char === "'") {
      inStr = char;
      continue;
    }
    if (char === open) depth += 1;
    else if (char === close) {
      depth -= 1;
      if (depth === 0) return { content: source.slice(start + 1, i), next: i + 1 };
    }
  }
  return { content: source.slice(start + 1), next: source.length };
}

/** parses the attributes of one open tag */
function parseAttrs(source: string, start: number): { attrs: JsxAttr[]; next: number; selfClose: boolean } {
  const attrs: JsxAttr[] = [];
  let i = start;
  for (;;) {
    while (i < source.length && /\s/.test(source[i])) i += 1;
    if (source.startsWith("/>", i)) return { attrs, next: i + 2, selfClose: true };
    if (source[i] === ">") return { attrs, next: i + 1, selfClose: false };
    const name = /^[A-Za-z_:@][\w:.-]*/.exec(source.slice(i));
    if (!name) {
      i += 1;
      continue;
    }
    i += name[0].length;
    while (i < source.length && /\s/.test(source[i])) i += 1;
    if (source[i] !== "=") {
      attrs.push({ name: name[0], value: "", form: "none" });
      continue;
    }
    i += 1;
    while (i < source.length && /\s/.test(source[i])) i += 1;
    if (source[i] === '"' || source[i] === "'") {
      const quote = source[i];
      const end = source.indexOf(quote, i + 1);
      attrs.push({ name: name[0], value: source.slice(i + 1, end), form: "string" });
      i = end + 1;
    } else if (source[i] === "{") {
      const region = readBalanced(source, i);
      attrs.push({ name: name[0], value: region.content, form: "expr" });
      i = region.next;
    } else {
      const bare = /^[^\s>]+/.exec(source.slice(i));
      attrs.push({ name: name[0], value: bare?.[0] ?? "", form: "string" });
      i += bare?.[0].length ?? 0;
    }
  }
}

/** parses the children of one element until its closing tag (or a
 * fragment's closer) — text, nested elements, slots and jsx comments */
function parseChildrenUntil(source: string, start: number, closer: string): { children: JsxChild[]; next: number } {
  const children: JsxChild[] = [];
  let i = start;
  while (i < source.length) {
    if (source.startsWith(closer, i)) return { children, next: i + closer.length };
    const char = source[i];
    if (/\s/.test(char)) {
      i += 1;
      continue;
    }
    if (char === "<") {
      if (source.startsWith("<>", i)) {
        const inner = parseChildrenUntil(source, i + 2, "</>");
        children.push(...inner.children);
        i = inner.next;
        continue;
      }
      const element = parseElementAt(source, i);
      children.push({ type: "element", element: element.element });
      i = element.next;
      continue;
    }
    if (char === "{") {
      const region = readBalanced(source, i);
      i = region.next;
      const expr = region.content.trim();
      if (expr.startsWith("/*") || expr.length === 0) continue;
      children.push({ type: "slot", expr });
      continue;
    }
    let j = i;
    while (j < source.length && !"<{".includes(source[j])) j += 1;
    const text = source.slice(i, j).trim();
    if (text) children.push({ type: "text", text });
    i = j;
  }
  return { children, next: i };
}

/** parses one element starting at a `<` followed by a tag name */
function parseElementAt(source: string, start: number): { element: JsxElement; next: number } {
  const name = /^[A-Za-z][\w.]*/.exec(source.slice(start + 1));
  const tag = name?.[0] ?? "div";
  const after = parseAttrs(source, start + 1 + tag.length);
  if (after.selfClose) return { element: { tag, attrs: after.attrs, children: [] }, next: after.next };
  const rest = parseChildrenUntil(source, after.next, `</${tag}>`);
  return { element: { tag, attrs: after.attrs, children: rest.children }, next: rest.next };
}

/** reads the root JSX element of a widget source (the element the return
 * mounts; falls back to the first tag in the file) */
export function parseJsxRoot(source: string): JsxElement | undefined {
  const returnAt = source.indexOf("return (");
  const scanFrom = returnAt >= 0 ? returnAt : 0;
  const tagAt = source.slice(scanFrom).search(/<[A-Za-z]/);
  if (tagAt < 0) return undefined;
  return parseElementAt(source, scanFrom + tagAt).element;
}

/* ---------------------------------------------------------------------------
 * the style contracts (the exported CSSProperties objects of the wingets)
 * ------------------------------------------------------------------------- */

/** scans one value until the next comma/brace at depth zero */
function scanStyleValue(text: string, start: number): { value: string; next: number } {
  let i = start;
  let depth = 0;
  let inStr: string | null = null;
  const buf: string[] = [];
  while (i < text.length) {
    const char = text[i];
    if (inStr) {
      buf.push(char);
      if (char === inStr && text[i - 1] !== "\\") inStr = null;
      i += 1;
      continue;
    }
    if (char === '"' || char === "'") {
      inStr = char;
      buf.push(char);
      i += 1;
      continue;
    }
    if (char === "(" || char === "[") depth += 1;
    if (char === ")" || char === "]") depth -= 1;
    if (depth === 0 && (char === "," || char === "}")) break;
    buf.push(char);
    i += 1;
  }
  return { value: buf.join("").trim(), next: i };
}

/** parses one style object literal (spreads resolved through contracts;
 * spread calls — the motion entrances — drop, the terminal holds still) */
export function parseStyleObject(text: string, contracts: Record<string, StyleDict> = {}): StyleDict {
  let body = text.trim();
  if (body.startsWith("{")) body = readBalanced(body, 0).content;
  const out: StyleDict = {};
  let i = 0;
  while (i < body.length) {
    while (i < body.length && /[\s,]/.test(body[i])) i += 1;
    if (i >= body.length) break;
    if (body.startsWith("...", i)) {
      const ident = /^[A-Za-z_$][\w$]*/.exec(body.slice(i + 3));
      if (!ident) {
        i += 3;
        continue;
      }
      let end = i + 3 + ident[0].length;
      if (body[end] === "(") {
        // a spread call (stagedEntrance) — skip to the closing paren
        let depth = 0;
        let j = end;
        for (; j < body.length; j++) {
          if (body[j] === "(") depth += 1;
          else if (body[j] === ")") {
            depth -= 1;
            if (depth === 0) break;
          }
        }
        end = j + 1;
      } else {
        Object.assign(out, contracts[ident[0]] ?? {});
      }
      i = end;
      continue;
    }
    const prop = /^([a-zA-Z-]+)\s*:\s*/.exec(body.slice(i));
    if (!prop) {
      i += 1;
      continue;
    }
    i += prop[0].length;
    const value = scanStyleValue(body, i);
    out[prop[1]] = value.value;
    i = value.next;
  }
  return out;
}

/** collects the exported CSSProperties contracts of one winget file */
export function collectStyleContracts(source: string): Record<string, StyleDict> {
  const contracts: Record<string, StyleDict> = {};
  for (const match of source.matchAll(/export const (\w+)\s*:\s*CSSProperties\s*=\s*\{/g)) {
    const openAt = match.index + match[0].length - 1;
    const region = readBalanced(source, openAt);
    contracts[match[1]] = parseStyleObject(region.content);
  }
  return contracts;
}

/* ---------------------------------------------------------------------------
 * the conversion (jsx + styles + tokens → the terminal IR)
 * ------------------------------------------------------------------------- */

/** the conversion context: the contracts of the imported wingets, the css
 * tokens, the discovered prop slots and the item binding of a map scope */
export type ConvertContext = {
  contracts: Record<string, StyleDict>;
  tokens: Map<string, string>;
  slots: Set<string>;
  item?: string;
};

/** the widgets the pipeline converts today (the shell + the two proof
 * widgets — the map generalizes to every winget) */
export const TERMINAL_WIDGETS: ReadonlyArray<{ source: string; output: string; exportName: string }> = [
  { source: "Sol/wingets/ShellControlshell.tsx", output: "shellterminal.ts", exportName: "ControlShellTerminal" },
  { source: "Sol/wingets/ShellChip.tsx", output: "chipterminal.ts", exportName: "ChipTerminal" },
  { source: "Sol/wingets/ShellKbd.tsx", output: "kbdterminal.ts", exportName: "KbdTerminal" },
];

function attrValue(element: JsxElement, name: string): JsxAttr | undefined {
  return element.attrs.find((attr) => attr.name === name);
}

function classNames(element: JsxElement): string[] {
  const attr = attrValue(element, "className");
  if (!attr) return [];
  return attr.value.split(/\s+/).filter(Boolean);
}

/** resolves the style dict of one element: the contract identifier, the
 * inline object (spreads included) or the empty dict */
function styleOf(element: JsxElement, ctx: ConvertContext): StyleDict {
  const attr = attrValue(element, "style");
  if (!attr) return {};
  const raw = attr.value.trim();
  if (attr.form === "string") return parseStyleObject(raw, ctx.contracts);
  if (raw.startsWith("{")) return parseStyleObject(raw, ctx.contracts);
  if (/^[A-Za-z_$][\w$]*$/.test(raw)) return ctx.contracts[raw] ?? {};
  return parseStyleObject(raw, ctx.contracts);
}

/** the font shorthand → weight and scale flags (sizes fold to the three
 * terminal scale classes; tracking drops — a cell cannot track) */
function fontFlags(value: string): { bold?: boolean; scale?: "display" | "body" | "micro" } {
  const clean = value.replace(/^["']|["']$/g, "");
  const match = /(\d{3})\s+(\d+(?:\.\d+)?)px/.exec(clean);
  if (!match) return {};
  const weight = Number(match[1]);
  const size = Number(match[2]);
  return { bold: weight >= 600 ? true : undefined, scale: size >= 24 ? "display" : size <= 11 ? "micro" : "body" };
}

/** the tailwind arbitrary utilities of a className (gap-[18px] and the
 * bracket paddings ride the same px→cell map) */
function tailwindArbitrary(classes: string[]): { gap?: number; padY?: number; padX?: number } {
  const out: { gap?: number; padY?: number; padX?: number } = {};
  for (const cls of classes) {
    const gap = /^gap-\[([\d.]+)px\]$/.exec(cls);
    if (gap) out.gap = Number(gap[1]);
    const pad = /^p[tblrxy]?-\[([\d.]+)px\]$/.exec(cls);
    if (pad) out.padY = Number(pad[1]);
  }
  return out;
}

/** converts one jsx element into the terminal IR */
export function convertElement(element: JsxElement, ctx: ConvertContext): IrNode {
  const style = styleOf(element, ctx);
  const classes = classNames(element);
  const tw = tailwindArbitrary(classes);
  const display = style.display ?? "";
  const flexDirection = style.flexDirection === "row" || display.includes("inline-flex") ? "row" : style.flexDirection === "column" ? "column" : "column";
  const isTextTag = ["p", "h1", "h2", "h3", "h4", "span", "kbd", "button", "strong", "em", "code", "small", "label", "a", "li"].includes(element.tag);
  const toneAttr = attrValue(element, "data-tone");

  // the mounted chrome (the navbar widget) answers the terminal chrome band;
  // every other childless component is a face this pass does not convert —
  // it renders nothing rather than a wrong guess (its own conversion ride)
  if (/^[A-Z]/.test(element.tag)) {
    if (element.tag === "ShellChrome") return { kind: "chrome" };
    if (element.children.length === 0) return { kind: "box", direction: "column", gap: 0, children: [] };
  }

  // the child slots: text, props, optionals, maps, children passthrough
  const childNodes: IrNode[] = [];
  for (const child of element.children) {
    if (child.type === "text") {
      childNodes.push({ kind: "text", text: child.text });
      continue;
    }
    if (child.type === "element") {
      childNodes.push(convertElement(child.element, ctx));
      continue;
    }
    const expr = child.expr;
    if (/^[A-Za-z_$][\w$]*$/.test(expr)) {
      ctx.slots.add(expr);
      if (expr === "children") childNodes.push({ kind: "children" });
      else if (ctx.item === expr) childNodes.push({ kind: "text", item: expr });
      else childNodes.push({ kind: "text", slot: expr });
      continue;
    }
    const optional = /^([A-Za-z_$][\w$]*)\s*\?\s*([\s\S]+?)\s*:\s*null$/.exec(expr);
    if (optional) {
      ctx.slots.add(optional[1]);
      const body = optional[2];
      const tagAt = body.search(/<[A-Za-z]/);
      if (tagAt >= 0) {
        const inner = parseElementAt(body, tagAt).element;
        const node = convertElement(inner, ctx);
        if (node.kind === "box" || node.kind === "text") node.when = optional[1];
        childNodes.push(node);
      }
      continue;
    }
    const map = /^([A-Za-z_$][\w$]*)\.map\(\s*\(\s*([A-Za-z_$][\w$]*)\s*\)\s*=>\s*([\s\S]+)$/.exec(expr);
    if (map) {
      ctx.slots.add(map[1]);
      const body = map[3];
      const tagAt = body.search(/<[A-Za-z]/);
      if (tagAt >= 0) {
        const inner = parseElementAt(body, tagAt).element;
        const child = convertElement(inner, { ...ctx, item: map[2] });
        childNodes.push({ kind: "map", slot: map[1], item: map[2], gap: 1, child });
      }
      continue;
    }
    // a plain expression with jsx islands folds to the island; string
    // literals fold to text — anything else drops (handlers stay web-side)
    const tagAt = expr.search(/<[A-Za-z]/);
    if (tagAt >= 0) {
      childNodes.push(convertElement(parseElementAt(expr, tagAt).element, ctx));
      continue;
    }
    const literal = /^["'](.*)["']$/.exec(expr);
    if (literal) childNodes.push({ kind: "text", text: literal[1] });
  }

  if (isTextTag || (childNodes.length === 1 && childNodes[0].kind === "text" && element.children.every((c) => c.type !== "element"))) {
    // a leaf text element: the first text/prop/item child rides the tags own
    // style (color, weight, scale, the keycap brackets and chip tones)
    const flags = fontFlags(style.font ?? "");
    const color = style.color ? cssColorToRgb(style.color, ctx.tokens) : undefined;
    // inside a text element the children slot reads as its string content
    const textish = childNodes.map((node) => (node.kind === "children" ? ({ kind: "text", slot: "children" } as IrNode) : node));
    const text = textish.find((node) => node.kind === "text");
    if (text && text.kind === "text" && textish.every((node) => node.kind !== "box" && node.kind !== "map")) {
      const only = textish.length === 1;
      const node: IrNode = {
        kind: "text",
        ...(text.text !== undefined ? { text: text.text } : {}),
        ...(text.slot !== undefined ? { slot: text.slot } : {}),
        ...(text.item !== undefined ? { item: text.item } : {}),
        ...(color ? { color } : {}),
        ...flags,
        ...(toneAttr?.form === "expr" ? { toneSlot: toneAttr.value.trim() } : {}),
        ...(classes.includes("kbd") ? { deco: "bracket" as const } : {}),
        ...(classes.includes("uichip") && only ? { deco: "paren" as const } : {}),
        ...(text.when !== undefined ? { when: text.when } : {}),
      };
      if (!only) {
        // multiple text children (the chip: content + remove glyph) fold to
        // a row so the pill reads on one line — the tone rides the content
        const first = textish[0];
        if (toneAttr?.form === "expr" && first?.kind === "text") first.toneSlot = toneAttr.value.trim();
        return {
          kind: "box",
          direction: "row",
          gap: 1,
          ...(classes.includes("uichip") ? { deco: "paren" as const } : {}),
          children: textish,
        };
      }
      return node;
    }
  }

  // a container element: the flex/grid rhythm → the box
  const gapPx = (() => {
    const raw = style.gap ?? style.rowGap ?? style.columnGap;
    if (raw !== undefined) return Number.parseFloat(raw);
    return tw.gap;
  })();
  const gap = flexDirection === "row" ? pxToCellX(gapPx ?? 8) : pxToCellY(gapPx ?? 16);
  const padding = (style.padding ?? "").replace(/["']/g, "");
  const pads = padding.split(/\s+/).filter(Boolean).map((token) => Number.parseFloat(token) || 0);
  const padY = pads.length >= 1 ? Math.max(1, Math.round(((pads[0] ?? 0) + (pads.length === 2 ? pads[0] : (pads[2] ?? pads[0]))) / 2 / 16)) : undefined;
  const padX = pads.length >= 2 ? Math.max(0, Math.round(pads[1] / 8)) : undefined;
  return {
    kind: "box",
    direction: flexDirection === "row" ? "row" : "column",
    gap,
    ...(style.borderBottom ? { rule: true } : {}),
    ...(style.boxShadow ? { border: true } : {}),
    ...(padX ? { padX } : {}),
    ...(padY ? { padY } : {}),
    children: childNodes,
  };
}

/** converts one widget source into its terminal IR (tokens + contracts ride
 * the imports of the file) */
export function convertWidget(source: string, cssTokens: Map<string, string>): { ir: IrNode; slots: string[] } {
  const contracts: Record<string, StyleDict> = {};
  for (const match of source.matchAll(/from\s+"\.\/([\w]+)\.tsx"/g)) {
    const sibling = path.resolve(import.meta.dirname ?? ".", "Sol", "wingets", `${match[1]}.tsx`);
    if (existsSync(sibling)) Object.assign(contracts, collectStyleContracts(readFileSync(sibling, "utf8")));
  }
  const root = parseJsxRoot(source);
  if (!root) throw new Error("no jsx root found in the widget source");
  const ctx: ConvertContext = { contracts, tokens: cssTokens, slots: new Set() };
  const ir = convertElement(root, ctx);
  return { ir, slots: [...ctx.slots].sort() };
}

/* ---------------------------------------------------------------------------
 * the emitter (IR → the committed terminal module)
 * ------------------------------------------------------------------------- */

/** emits one terminal module: the IR as a typed constant plus the props
 * function with the SAME prop slots the web widget answers */
export function emitTerminalModule(options: { exportName: string; sourcePath: string; ir: IrNode; slots: string[] }): string {
  const { exportName, sourcePath, ir, slots } = options;
  const propsType = `Record<string, unknown>`;
  const slotDoc = slots.length > 0 ? slots.map((slot) => `\`string\``).join(", ") : "none";
  return `/**
 * GENERATED FILE — the terminal face of ${sourcePath}.
 * emitter: devthink/buildterminal.ts (the tsx→terminal conversion of wave
 * 2-c / PR11): the same design, the same tokens, the cell as the unit. The
 * prop slots the web widget answers survive verbatim (${slotDoc}) — the
 * interactivity contract rides the conversion. Regenerate with
 * \`node buildterminal.ts\` — never edit by hand.
 */
import { render, type IrNode, type RenderOptions } from "./runtimeterminal.ts";

const ir: IrNode = ${JSON.stringify(ir, null, 2)};

export type ${exportName}Props = ${propsType};

/** renders the ${sourcePath} face into terminal rows (ANSI, headless) */
export function ${exportName}(props: ${exportName}Props = {}, options: RenderOptions = {}): string {
  return render(ir, props, options);
}
`;
}

/** converts every configured widget; returns the output files in memory */
export function convertAll(): Array<{ output: string; content: string; slots: string[] }> {
  const root = import.meta.dirname ?? ".";
  const css = readFileSync(path.resolve(root, "Sol", "sol.css"), "utf8");
  const tokens = parseCssTokens(css);
  return TERMINAL_WIDGETS.map((widget) => {
    const source = readFileSync(path.resolve(root, widget.source), "utf8");
    const { ir, slots } = convertWidget(source, tokens);
    return {
      output: widget.output,
      slots,
      content: emitTerminalModule({ exportName: widget.exportName, sourcePath: widget.source, ir, slots }),
    };
  });
}

/* ---------------------------------------------------------------------------
 * the cli: write (default) or verify (--check)
 * ------------------------------------------------------------------------- */

function main(): void {
  const check = process.argv.includes("--check");
  const root = import.meta.dirname ?? ".";
  const files = convertAll();
  let drift = 0;
  for (const file of files) {
    const target = path.resolve(root, file.output);
    if (check) {
      const current = existsSync(target) ? readFileSync(target, "utf8") : "";
      if (current !== file.content) {
        drift += 1;
        console.error(`drift: ${file.output} does not match the conversion of the current widgets`);
      } else {
        console.log(`ok: ${file.output} (${file.slots.length} prop slots survive)`);
      }
    } else {
      mkdirSync(path.dirname(target), { recursive: true });
      writeFileSync(target, file.content);
      console.log(`converted ${file.output} (${file.slots.length} prop slots survive)`);
    }
  }
  if (check && drift > 0) process.exitCode = 1;
}

const direct = process.argv[1]?.endsWith("buildterminal.ts") || process.argv[1]?.endsWith("buildterminal");
if (direct) main();
