/**
 * The capture module of the 1.1.90 consolidation: every correlated variation of the media capture, vision and redaction logic interned in this one file, so the module family carries one surface without duplicate variations.
 * The correlation is the capture pipeline of a run: capture holds the base geometry (the capture options with their formats and export targets, the stitch tiling with seam blending and fixed header skip, the element crop with the viewport fallback, the region container steps, the contact sheet grid, the annotation plan and the capture naming rule with the before and after state pairing); media holds the media capture part two (the derived pdf composition with reviewed paper sizes and pagination break points, the recording records with their frame intervals and clean stops, the image filter matching with url deduplication, the lapse frame ordering, the conversion and thumbnail geometry and the raw media, asset and stream normalization); vision holds the teaching to see (the ocr recognition with its word boxes merged into lines and paragraphs, the region, pdf and frame ocr passes, the vision descriptions, the crop geometry that reuses the capture rectangle rules, the redaction masks, the grounding and the dom pairing beside every screenshot); and redactshots holds the capture masking (the sensitive regions derived from the field shapes the recognizer masks or drawn by the user, covering viewport, element and stitched captures alike so the stored bytes never carry them).
 * No paper size, fps, region count, retention, model choice or cache window is ever hardcoded anywhere in the family: every geometry and bound stays the user's or the reviewed step's choice, recognition payloads stay opaque reviewed text, and no capture path ever bypasses the review.
 */

import type { captureexport, captureformat, capturenaming, captureoptions, regionrect, sheetlayout, shotpair, shotrecord, stitchplan } from "./types.js";

/**
 * Media capture logics for the 1.1.40 family.
 * Every correlated rule for the capture options defaults, the stitch tiling and seam blending, the fixed header skip, the pixel ratio scaling, the element crop and viewport fallback, the region container steps, the contact sheet grid, the annotation plan, the capture naming rule and the before and after state pairing lives in this file.
 */

/** Formats every capture kind may produce; the policy grammar refuses anything outside this set. */
export const captureformats: captureformat[] = ["png", "jpeg", "webp"];

/** Export targets a reviewed capture may route to; disk writes stay inside the reviewed download flow. */
export const capturetargets: captureexport[] = ["memory", "download", "clipboard"];

/** The capture kinds of the 1.1.40 family, listed among the available capabilities of every proposal request. */
export const capturekinds: string[] = ["shotview", "shotfullpage", "shotelement", "shotregion", "contactsheet"];

/** Normalizes reviewed capture options with png, pixel ratio one and the memory export target as defaults. */
export function captureoptionsof(value: unknown): captureoptions {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const options = value as Record<string, unknown>;
  const normalized: captureoptions = {};
  if (options.format === "png" || options.format === "jpeg" || options.format === "webp") normalized.format = options.format;
  if (typeof options.quality === "number" && Number.isFinite(options.quality)) normalized.quality = options.quality;
  if (typeof options.pixelratio === "number" && Number.isFinite(options.pixelratio)) normalized.pixelratio = options.pixelratio;
  if (typeof options.annotate === "boolean") normalized.annotate = options.annotate;
  if (options.exporttarget === "memory" || options.exporttarget === "download" || options.exporttarget === "clipboard") normalized.exporttarget = options.exporttarget;
  return normalized;
}

/** Builds one shotrecord for a visible viewport capture with the reviewed geometry and byte size. */
export function capturevisible(input: { runid: string; stepid: string; options: captureoptions; viewport: { width: number; height: number }; dataurl: string; at: number; id: string; name?: string; target?: string }): shotrecord {
  const ratio = input.options.pixelratio ?? 1;
  return {
    id: input.id,
    runid: input.runid,
    stepid: input.stepid,
    kind: "shotview",
    format: input.options.format ?? "png",
    width: Math.round(input.viewport.width * ratio),
    height: Math.round(input.viewport.height * ratio),
    capturedat: input.at,
    bytes: input.dataurl,
    ...(input.name !== undefined ? { name: input.name } : {}),
    ...(input.options.annotate === true ? { annotated: true } : {}),
    ...(input.options.exporttarget !== undefined ? { exporttarget: input.options.exporttarget } : {}),
    ...(input.target !== undefined ? { target: input.target } : {}),
  };
}

/** Builds one shotrecord for a stitched full page capture from the tile plan geometry. */
export function capturestitched(input: { runid: string; stepid: string; options: captureoptions; plan: stitchplan; dataurl: string; at: number; id: string; name?: string }): shotrecord {
  const ratio = input.options.pixelratio ?? 1;
  return {
    id: input.id,
    runid: input.runid,
    stepid: input.stepid,
    kind: "shotfullpage",
    format: input.options.format ?? "png",
    width: Math.round(input.plan.scrollwidth * ratio),
    height: Math.round(input.plan.scrollheight * ratio),
    capturedat: input.at,
    bytes: input.dataurl,
    ...(input.name !== undefined ? { name: input.name } : {}),
    ...(input.options.annotate === true ? { annotated: true } : {}),
    ...(input.options.exporttarget !== undefined ? { exporttarget: input.options.exporttarget } : {}),
  };
}

/** Builds one shotrecord for an element capture cropped to the pixel ratio scaled element bounds. */
export function captureelement(input: { runid: string; stepid: string; options: captureoptions; rect: regionrect; dataurl: string; at: number; id: string; name?: string; target?: string }): shotrecord {
  const ratio = input.options.pixelratio ?? 1;
  const scaled = scaledrect(input.rect, ratio);
  return {
    id: input.id,
    runid: input.runid,
    stepid: input.stepid,
    kind: "shotelement",
    format: input.options.format ?? "png",
    width: scaled.width,
    height: scaled.height,
    capturedat: input.at,
    bytes: input.dataurl,
    ...(input.name !== undefined ? { name: input.name } : {}),
    ...(input.options.annotate === true ? { annotated: true } : {}),
    ...(input.options.exporttarget !== undefined ? { exporttarget: input.options.exporttarget } : {}),
    ...(input.target !== undefined ? { target: input.target } : {}),
  };
}

/** Builds one shotrecord for a region capture of one reviewed rectangle or scrollable container. */
export function captureregion(input: { runid: string; stepid: string; options: captureoptions; rect: regionrect; dataurl: string; at: number; id: string; name?: string; target?: string }): shotrecord {
  const ratio = input.options.pixelratio ?? 1;
  const scaled = scaledrect(input.rect, ratio);
  return {
    id: input.id,
    runid: input.runid,
    stepid: input.stepid,
    kind: "shotregion",
    format: input.options.format ?? "png",
    width: scaled.width,
    height: scaled.height,
    capturedat: input.at,
    bytes: input.dataurl,
    ...(input.name !== undefined ? { name: input.name } : {}),
    ...(input.options.annotate === true ? { annotated: true } : {}),
    ...(input.options.exporttarget !== undefined ? { exporttarget: input.options.exporttarget } : {}),
    ...(input.target !== undefined ? { target: input.target } : {}),
  };
}

/** Links a before and an after shot into one shotpair with the action context and the dom snapshot id of the same moment; a missing after shot skips the pair. */
export function pairstates(before: shotrecord | undefined, after: shotrecord | undefined, action: { kind: string; target?: string; domsnapshotid?: string }, at: number, id: string): { pair?: shotpair; skipped?: "before" | "after"; reason: string } {
  if (!before) return { skipped: "before", reason: "The before shot was not captured, so no state pair exists." };
  if (!after) return { skipped: "after", reason: `The action of kind ${action.kind} failed before the after shot, so the state pair is skipped.` };
  return {
    pair: {
      id,
      beforeid: before.id,
      afterid: after.id,
      actionkind: action.kind,
      ...(action.target !== undefined ? { target: action.target } : {}),
      ...(action.domsnapshotid !== undefined ? { domsnapshotid: action.domsnapshotid } : {}),
      at,
    },
    reason: `Paired the before shot ${before.id} with the after shot ${after.id} around the ${action.kind} action.`,
  };
}

/** Applies the capture policy around one action: beforeafter pairs wrap the action, every other mode leaves the pair to the manual capture kinds. */
export function capturestates(input: { policy: string; before?: shotrecord | undefined; after?: shotrecord | undefined; actionkind: string; target?: string | undefined; domsnapshotid?: string | undefined; at: number; id: string }): { pair?: shotpair; skipped?: "before" | "after"; reason: string } {
  if (input.policy !== "beforeafter") return { reason: `The ${input.policy} capture policy takes no state pair around the ${input.actionkind} action.` };
  return pairstates(input.before, input.after, { kind: input.actionkind, ...(input.target !== undefined ? { target: input.target } : {}), ...(input.domsnapshotid !== undefined ? { domsnapshotid: input.domsnapshotid } : {}) }, input.at, input.id);
}

/** Builds the viewport tiling of one full page capture: a tile grid of scroll offsets with overlap rows; the last tile clamps to the page end. */
export function buildstitchplan(input: { scrollwidth: number; scrollheight: number; viewportwidth: number; viewportheight: number; overlap?: number }): stitchplan {
  const overlap = Math.max(0, Math.round(input.overlap ?? 0));
  const stepy = Math.max(1, input.viewportheight - overlap);
  const columns = Math.max(1, Math.ceil(input.scrollwidth / input.viewportwidth));
  const rows = input.scrollheight <= input.viewportheight ? 1 : Math.max(1, Math.ceil((input.scrollheight - overlap) / stepy));
  const tiles: Array<{ x: number; y: number }> = [];
  for (let column = 0; column < columns; column += 1) {
    for (let row = 0; row < rows; row += 1) {
      const x = Math.min(column * input.viewportwidth, Math.max(0, input.scrollwidth - input.viewportwidth));
      const y = rows === 1 ? 0 : Math.min(row * stepy, Math.max(0, input.scrollheight - input.viewportheight));
      tiles.push({ x: Math.round(x), y: Math.round(y) });
    }
  }
  return { columns, rows, tiles, overlap, scrollwidth: Math.round(input.scrollwidth), scrollheight: Math.round(input.scrollheight), viewportwidth: Math.round(input.viewportwidth), viewportheight: Math.round(input.viewportheight) };
}

/** Linear cross fade weights across one overlap band: the first row keeps the existing content, the last row adopts the new tile. */
export function seamweights(overlap: number): number[] {
  if (overlap <= 0) return [];
  const weights: number[] = [];
  for (let index = 0; index < overlap; index += 1) weights.push((index + 1) / (overlap + 1));
  return weights;
}

/** Blends one overlap band of equal length row arrays with the linear seam weights so tile seams never hard cut. */
export function blendrows(upper: number[], lower: number[]): number[] {
  const weights = seamweights(upper.length);
  return upper.map((value, index) => {
    const weight = weights[index] ?? 1;
    return value * (1 - weight) + (lower[index] ?? value) * weight;
  });
}

/** True when a tile band repeats the first tile band, so the stitcher skips it and fixed headers never repeat across tiles. */
export function fixedheadermatch(band: number[], firstband: number[]): boolean {
  if (band.length === 0 || band.length !== firstband.length) return false;
  return band.every((value, index) => value === firstband[index]);
}

/** Scales one css pixel rectangle by the reviewed pixel ratio; ratios of one, two and three scale every edge. */
export function scaledrect(rect: regionrect, pixelratio: number): regionrect {
  const ratio = pixelratio >= 1 ? pixelratio : 1;
  return { x: Math.round(rect.x * ratio), y: Math.round(rect.y * ratio), width: Math.round(rect.width * ratio), height: Math.round(rect.height * ratio) };
}

/** Clamps one rectangle to the visible part of the viewport, never returning negative geometry. */
export function croprect(rect: regionrect, viewport: { width: number; height: number }): regionrect {
  const x = Math.max(0, rect.x);
  const y = Math.max(0, rect.y);
  return { x: Math.round(x), y: Math.round(y), width: Math.round(Math.max(0, Math.min(rect.width, viewport.width - x))), height: Math.round(Math.max(0, Math.min(rect.height, viewport.height - y))) };
}

/** True when an element rectangle crosses any viewport edge and the capture falls back to tiled capture. */
export function crossesviewport(rect: regionrect, viewport: { width: number; height: number }): boolean {
  return rect.x < 0 || rect.y < 0 || rect.x + rect.width > viewport.width || rect.y + rect.height > viewport.height;
}

/** Scroll tops that walk a scrollable container in reviewed steps; every step clamps so the last window ends at the container end. */
export function regionsteps(containerheight: number, viewportstep: number): number[] {
  if (containerheight <= 0 || viewportstep <= 0) return [0];
  const steps: number[] = [];
  for (let top = 0; top < containerheight; top += viewportstep) {
    const clamped = Math.min(top, Math.max(0, containerheight - viewportstep));
    if (!steps.includes(clamped)) steps.push(clamped);
  }
  return steps;
}

/** One placed cell of a contact sheet grid with its caption stamped from the reviewed label style. */
export interface sheetcell {
  index: number;
  column: number;
  row: number;
  selector: string;
  label: string;
  caption: string;
}

/** Places the element captures of a contact sheet on a labeled grid; the cell count stays a user choice with no code ceiling. */
export function buildsheet(cells: Array<{ selector: string; label?: string }>, layout: sheetlayout): { columns: number; rows: number; cells: sheetcell[] } {
  const columns = Math.max(1, Math.round(layout.columns));
  const rows = Math.max(1, Math.ceil(cells.length / columns));
  const placed: sheetcell[] = cells.map((cell, index) => {
    const column = index % columns;
    const row = Math.floor(index / columns);
    const label = cell.label ?? "";
    const caption = layout.label === "none" ? "" : layout.label === "index" ? `${index + 1}` : layout.label === "selector" ? cell.selector : label ? `${index + 1} · ${cell.selector} · ${label}` : `${index + 1} · ${cell.selector}`;
    return { index, column, row, selector: cell.selector, label, caption };
  });
  return { columns, rows, cells: placed };
}

/** Slugifies one capture name part into a filename safe lowercase form through a plain character walk: a run of characters outside the reviewed set collapses into one dash, the leading and trailing dashes trim away, and the walk stays linear on adversarial names where a run regex would backtrack. */
function capturepart(value: string): string {
  let out = "";
  let pendingdash = false;
  for (let index = 0; index < value.length; index += 1) {
    const code = value.charCodeAt(index);
    const kept = (code >= 97 && code <= 122) || (code >= 65 && code <= 90) || (code >= 48 && code <= 57) || code === 45;
    if (kept) {
      if (pendingdash && out !== "") out += "-";
      pendingdash = false;
      out += value[index] ?? "";
    } else pendingdash = true;
  }
  let start = 0;
  let end = out.length;
  while (start < end && out[start] === "-") start += 1;
  while (end > start && out[end - 1] === "-") end -= 1;
  const slug = out.slice(start, end).toLowerCase();
  return slug !== "" ? slug : "capture";
}

/** Builds one capture filename from the reviewed naming rule segments; the sequence counter keeps every name unique inside a run. */
export function buildname(rule: capturenaming, parts: { run: string; step: string; sequence: number; kind: string }, extension: string): string {
  const segments: string[] = [];
  if (rule.run) segments.push(capturepart(parts.run));
  if (rule.step) segments.push(capturepart(parts.step));
  if (rule.sequence) segments.push(String(Math.max(0, Math.round(parts.sequence))));
  if (rule.kind) segments.push(capturepart(parts.kind));
  const safeextension = extension.replace(/^\.+/, "").toLowerCase() || "png";
  return `${(segments.length > 0 ? segments : ["capture"]).join("-")}.${safeextension}`;
}

/** One annotation plan for a captured image: the step number marker, the optional target outline and the footer with capture time and page url. */
export interface annotationplan {
  marker: { x: number; y: number; number: number };
  outline?: regionrect;
  footer: string;
}

/** Plans the annotations of one capture: the step number marker position, the expanded target rect outline and the footer text with capture time and url. */
export function annotationplanof(input: { step: number; width: number; height: number; rect?: regionrect; url: string; at: number }): annotationplan {
  const inset = Math.min(24, Math.max(8, Math.round(Math.min(input.width, input.height) / 12)));
  const plan: annotationplan = {
    marker: { x: inset, y: inset, number: Math.max(1, Math.round(input.step)) },
    footer: `${new Date(input.at).toISOString()} · ${input.url}`,
  };
  if (input.rect !== undefined) {
    const expansion = 2;
    plan.outline = { x: Math.round(input.rect.x - expansion), y: Math.round(input.rect.y - expansion), width: Math.round(input.rect.width + expansion * 2), height: Math.round(input.rect.height + expansion * 2) };
  }
  return plan;
}

/* ── Merged from media.ts ── */

import type { assetrecord, convertdirective, imagefilter, imagedescriptor, mediadatum, pdfoptions, recordingoptions, recordingrecord, streamrecord, thumbdirective } from "./types.js";

/**
 * Media capture part two logics for the 1.1.41 family.
 * Every correlated rule for the derived pdf composition with reviewed paper sizes, margins and pagination break points, the recording records with their frame intervals and clean stops, the image filter matching with url deduplication and counter names, the lapse frame ordering, the conversion and thumbnail geometry and the raw media, asset and stream normalization lives in this file.
 */

/** The media capture part two kinds, listed among the available capabilities of every proposal request. */
export const mediakinds: string[] = ["capturepdf", "recordscreen", "captureaudio", "captureframe", "downloadimages", "shotcanvas", "probestream", "readmedia", "readassets", "timelapse", "convertimage", "makethumbs"];

/** Default paper size in inches when the reviewed options leave it open: us letter portrait. */
const defaultpaperwidth = 8.5;
const defaultpaperheight = 11;

/** Default page margins in inches when the reviewed options leave them open. */
const defaultmargins = { top: 0.4, right: 0.4, bottom: 0.4, left: 0.4 };

/** Points per paper inch of the pdf coordinate space. */
const pdfpointsperinch = 72;

/** Base body font size in points that the reviewed scale multiplies. */
const basefontsize = 11;

/** Normalizes reviewed pdf options with paper defaults; unknown fields stay ignored. */
export function pdfoptionsof(value: unknown): pdfoptions {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const options = value as Record<string, unknown>;
  const normalized: pdfoptions = {};
  if (typeof options.paperwidth === "number" && Number.isFinite(options.paperwidth)) normalized.paperwidth = options.paperwidth;
  if (typeof options.paperheight === "number" && Number.isFinite(options.paperheight)) normalized.paperheight = options.paperheight;
  if (options.margins && typeof options.margins === "object" && !Array.isArray(options.margins)) {
    const margins = options.margins as Record<string, unknown>;
    const top = typeof margins.top === "number" ? margins.top : defaultmargins.top;
    const right = typeof margins.right === "number" ? margins.right : defaultmargins.right;
    const bottom = typeof margins.bottom === "number" ? margins.bottom : defaultmargins.bottom;
    const left = typeof margins.left === "number" ? margins.left : defaultmargins.left;
    normalized.margins = { top, right, bottom, left };
  }
  if (typeof options.scale === "number" && Number.isFinite(options.scale)) normalized.scale = options.scale;
  if (typeof options.landscape === "boolean") normalized.landscape = options.landscape;
  if (typeof options.paginate === "boolean") normalized.paginate = options.paginate;
  return normalized;
}

/** Resolves the pdf page size in points after the landscape swap. */
export function pdfpagesize(options: pdfoptions): { width: number; height: number } {
  const width = (options.paperwidth ?? defaultpaperwidth) * pdfpointsperinch;
  const height = (options.paperheight ?? defaultpaperheight) * pdfpointsperinch;
  return options.landscape === true ? { width: height, height: width } : { width, height };
}

/** Resolves the reviewed margins in points. */
function pdfmargins(options: pdfoptions): { top: number; right: number; bottom: number; left: number } {
  const margins = options.margins ?? defaultmargins;
  return { top: margins.top * pdfpointsperinch, right: margins.right * pdfpointsperinch, bottom: margins.bottom * pdfpointsperinch, left: margins.left * pdfpointsperinch };
}

/** Resolves the body font size in points from the reviewed scale with no code ceiling on the scale itself. */
function pdffontsize(options: pdfoptions): number {
  return basefontsize * (options.scale ?? 1);
}

/** Wraps one text block into page lines for the reviewed geometry: word wrap at the average glyph width of the Helvetica body font. */
export function pdftextlayout(text: string, options: pdfoptions): string[] {
  const size = pdfpagesize(options);
  const margins = pdfmargins(options);
  const fontsize = pdffontsize(options);
  const leading = fontsize * 1.35;
  const linesperpage = Math.max(1, Math.floor((size.height - margins.top - margins.bottom) / leading));
  const columns = Math.max(1, Math.floor((size.width - margins.left - margins.right) / (fontsize * 0.5)));
  const wrapped: string[] = [];
  for (const paragraph of text.split(/\r?\n/)) {
    let line = "";
    for (const word of paragraph.split(/\s+/).filter(Boolean)) {
      const candidate = line ? `${line} ${word}` : word;
      if (candidate.length <= columns) { line = candidate; continue; }
      if (line) wrapped.push(line);
      if (word.length <= columns) { line = word; continue; }
      for (let index = 0; index < word.length; index += columns) wrapped.push(word.slice(index, index + columns));
      line = "";
    }
    wrapped.push(line);
    if (wrapped.length >= linesperpage) break;
  }
  return wrapped.slice(0, linesperpage);
}

/** Splits the scroll height into report page segments at reviewed break point offsets; absent break points walk the height in viewport steps. */
export function pdfsegments(scrollheight: number, viewportheight: number, breaks: number[]): Array<{ top: number; height: number }> {
  if (scrollheight <= 0) return [];
  const step = viewportheight > 0 ? viewportheight : scrollheight;
  const cuts = [0, ...breaks.filter(top => Number.isFinite(top) && top > 0 && top < scrollheight).map(top => Math.round(top))].filter((top, index, list) => list.indexOf(top) === index).sort((left, right) => left - right);
  const segments: Array<{ top: number; height: number }> = [];
  let index = 0;
  let cursor = 0;
  while (cursor < scrollheight) {
    while (index < cuts.length && (cuts[index] ?? 0) <= cursor) index += 1;
    const nextcut = index < cuts.length ? cuts[index] : undefined;
    const next = nextcut !== undefined ? Math.min(nextcut, scrollheight) : Math.min(cursor + step, scrollheight);
    if (next <= cursor) break;
    segments.push({ top: cursor, height: next - cursor });
    cursor = next;
  }
  return segments.length > 0 ? segments : [{ top: 0, height: scrollheight }];
}

/** Escapes one pdf text string: parentheses and backslashes escape and characters outside latin one become honest question marks. */
function pdfescape(text: string): string {
  let escaped = "";
  for (const character of text) {
    const code = character.charCodeAt(0);
    if (character === "(" || character === ")" || character === "\\") escaped += `\\${character}`;
    else if (code >= 32 && code <= 255) escaped += character;
    else escaped += "?";
  }
  return escaped;
}

/** Composes one derived pdf document from the page text blocks with the reviewed paper size, margins, scale and landscape orientation; the byte size is the latin one document length. */
export function buildpdf(pages: string[], options: pdfoptions): { document: string; bytes: number; pages: number; pagewidth: number; pageheight: number } {
  const size = pdfpagesize(options);
  const margins = pdfmargins(options);
  const fontsize = pdffontsize(options);
  const leading = fontsize * 1.35;
  const laidout = (pages.length > 0 ? pages : [""]).map(text => pdftextlayout(text, options));
  const objects: string[] = [];
  const kids = laidout.map((_, index) => `${4 + index * 2} 0 R`).join(" ");
  objects.push(`<< /Type /Catalog /Pages 2 0 R >>`);
  objects.push(`<< /Type /Pages /Kids [${kids}] /Count ${laidout.length} >>`);
  objects.push(`<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>`);
  for (let pageindex = 0; pageindex < laidout.length; pageindex += 1) {
    const lines = laidout[pageindex] ?? [];
    const operators: string[] = ["BT", `/F1 ${fontsize} Tf`, `${leading.toFixed(2)} TL`, `${margins.left.toFixed(2)} ${(size.height - margins.top - fontsize).toFixed(2)} Td`];
    for (let lineindex = 0; lineindex < lines.length; lineindex += 1) {
      if (lineindex > 0) operators.push("T*");
      operators.push(`(${pdfescape(lines[lineindex] ?? "")}) Tj`);
    }
    operators.push("ET");
    const content = operators.join("\n");
    objects.push(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${size.width.toFixed(2)} ${size.height.toFixed(2)}] /Resources << /Font << /F1 3 0 R >> >> /Contents ${5 + pageindex * 2} 0 R >>`);
    objects.push(`<< /Length ${content.length} >>\nstream\n${content}\nendstream`);
  }
  let document = "%PDF-1.4\n";
  const offsets: number[] = [];
  for (let index = 0; index < objects.length; index += 1) {
    offsets.push(document.length);
    document += `${index + 1} 0 obj\n${objects[index]}\nendobj\n`;
  }
  const xrefstart = document.length;
  document += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (const offset of offsets) document += `${String(offset).padStart(10, "0")} 00000 n \n`;
  document += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefstart}\n%%EOF\n`;
  return { document, bytes: document.length, pages: laidout.length, pagewidth: Math.round(size.width), pageheight: Math.round(size.height) };
}

/** Normalizes reviewed recording options with the tab scope as the default. */
export function recordingoptionsof(value: unknown): recordingoptions {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const options = value as Record<string, unknown>;
  const normalized: recordingoptions = {};
  if (options.scope === "tab" || options.scope === "run") normalized.scope = options.scope;
  if (typeof options.fps === "number" && Number.isFinite(options.fps)) normalized.fps = options.fps;
  if (typeof options.bitrate === "number" && Number.isFinite(options.bitrate)) normalized.bitrate = options.bitrate;
  if (typeof options.audio === "boolean") normalized.audio = options.audio;
  return normalized;
}

/** Opens one recording record of user activity with the reviewed options applied. */
export function newrecording(input: { id: string; runid: string; stepid: string; tabid: number; kind: "screen" | "audio"; options: recordingoptions; at: number }): recordingrecord {
  return {
    id: input.id,
    runid: input.runid,
    stepid: input.stepid,
    tabid: input.tabid,
    kind: input.kind,
    scope: input.options.scope ?? "tab",
    format: input.kind === "audio" ? "evidence" : "frames",
    startedat: input.at,
    at: input.at,
    ...(input.options.fps !== undefined ? { fps: input.options.fps } : {}),
    ...(input.options.bitrate !== undefined ? { bitrate: input.options.bitrate } : {}),
    ...(input.options.audio !== undefined ? { audio: input.options.audio } : {}),
    frames: [],
  };
}

/** Closes one recording cleanly at the given time and stamps the duration. */
export function finishrecording(record: recordingrecord, endat: number): recordingrecord {
  return { ...record, endedat: endat, duration: Math.max(0, endat - record.startedat) };
}

/** Frame shoot interval in milliseconds of the reviewed fps; the fps itself carries no code ceiling. */
export function frameinterval(fps: number): number {
  if (!Number.isFinite(fps) || fps <= 0) return 1000;
  return Math.max(1, Math.round(1000 / fps));
}

/** Normalizes a reviewed image filter; unknown fields stay ignored. */
export function imagefilterof(value: unknown): imagefilter {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const options = value as Record<string, unknown>;
  const normalized: imagefilter = {};
  if (typeof options.selector === "string" && options.selector.trim()) normalized.selector = options.selector.trim();
  if (typeof options.minwidth === "number" && Number.isFinite(options.minwidth)) normalized.minwidth = options.minwidth;
  if (typeof options.minheight === "number" && Number.isFinite(options.minheight)) normalized.minheight = options.minheight;
  if (Array.isArray(options.formats) && options.formats.every(item => typeof item === "string" && item.trim())) normalized.formats = options.formats as string[];
  return normalized;
}

/** True when one observed image passes the reviewed filter: minimum dimensions and the format list; absent bounds never refuse. */
export function imagematches(image: imagedescriptor, filter: imagefilter): boolean {
  if (filter.minwidth !== undefined && image.width < filter.minwidth) return false;
  if (filter.minheight !== undefined && image.height < filter.minheight) return false;
  if (filter.formats !== undefined && filter.formats.length > 0) {
    const mime = image.mime.toLowerCase();
    const matches = filter.formats.some(format => {
      const wanted = format.toLowerCase().trim();
      return mime === wanted || mime === `image/${wanted}` || mime.endsWith(`/${wanted}`);
    });
    if (!matches) return false;
  }
  return true;
}

/** Deduplicates observed images by url before any download starts; the first observation of a url wins. */
export function dedupeimages(images: imagedescriptor[]): imagedescriptor[] {
  const seen = new Set<string>();
  const unique: imagedescriptor[] = [];
  for (const image of images) {
    if (seen.has(image.url)) continue;
    seen.add(image.url);
    unique.push(image);
  }
  return unique;
}

/** Stamps consistent image batch filenames from the reviewed naming rule with a per batch image counter. */
export function imagenames(rule: capturenaming, run: string, step: string, count: number, extension: string): string[] {
  const names: string[] = [];
  for (let index = 1; index <= Math.max(0, Math.round(count)); index += 1) names.push(buildname(rule, { run, step, sequence: index, kind: "image" }, extension));
  return names;
}

/** Normalizes a reviewed lapse plan; an absent format keeps png. */
export function lapseplanof(value: unknown): { interval: number; duration: number; format: captureformat } | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  const options = value as Record<string, unknown>;
  if (typeof options.interval !== "number" || !Number.isFinite(options.interval)) return undefined;
  if (typeof options.duration !== "number" || !Number.isFinite(options.duration)) return undefined;
  const format = options.format === "jpeg" || options.format === "webp" ? options.format : "png";
  return { interval: options.interval, duration: options.duration, format };
}

/** Ordered lapse frame timestamps starting at zero and stepping the reviewed interval inside the reviewed duration. */
export function lapseframes(plan: { interval: number; duration: number }): number[] {
  if (!(plan.interval > 0) || !(plan.duration > 0)) return [];
  const frames: number[] = [];
  for (let time = 0; time < plan.duration; time += plan.interval) frames.push(Math.round(time));
  return frames;
}

/** Normalizes a reviewed conversion directive; an absent payload leaves the step without a directive. */
export function convertdirectiveof(value: unknown): convertdirective | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  const options = value as Record<string, unknown>;
  if (options.target !== "png" && options.target !== "jpeg" && options.target !== "webp") return undefined;
  const normalized: convertdirective = { target: options.target };
  if (options.source === "png" || options.source === "jpeg" || options.source === "webp") normalized.source = options.source;
  if (typeof options.quality === "number" && Number.isFinite(options.quality)) normalized.quality = options.quality;
  return normalized;
}

/** Normalizes a reviewed thumbnail directive; an absent payload leaves the step without a directive. */
export function thumbdirectiveof(value: unknown): thumbdirective | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  const options = value as Record<string, unknown>;
  if (typeof options.size !== "number" || !Number.isFinite(options.size) || options.size <= 0) return undefined;
  if (options.fit !== "cover" && options.fit !== "contain") return undefined;
  if (typeof options.suffix !== "string" || !options.suffix.trim()) return undefined;
  return { size: options.size, fit: options.fit, suffix: options.suffix.trim() };
}

/** Nine argument draw geometry of one thumbnail: cover crops to the square and fits inside, contain letterboxes the whole source. */
export function thumbgeometry(source: { width: number; height: number }, directive: thumbdirective): { sx: number; sy: number; sw: number; sh: number; dx: number; dy: number; dw: number; dh: number; width: number; height: number } {
  const size = Math.max(1, Math.round(directive.size));
  if (directive.fit === "contain") {
    const scale = Math.min(size / Math.max(1, source.width), size / Math.max(1, source.height));
    const dw = Math.max(1, Math.round(source.width * scale));
    const dh = Math.max(1, Math.round(source.height * scale));
    return { sx: 0, sy: 0, sw: source.width, sh: source.height, dx: Math.floor((size - dw) / 2), dy: Math.floor((size - dh) / 2), dw, dh, width: size, height: size };
  }
  const scale = Math.max(size / Math.max(1, source.width), size / Math.max(1, source.height));
  const sw = Math.min(source.width, Math.round(size / scale));
  const sh = Math.min(source.height, Math.round(size / scale));
  return { sx: Math.floor((source.width - sw) / 2), sy: Math.floor((source.height - sh) / 2), sw, sh, dx: 0, dy: 0, dw: size, dh: size, width: size, height: size };
}

/** Normalizes raw embedded media element entries into mediadatum records with duration, dimensions, codecs and track lists. */
export function mediaentries(raw: Array<Record<string, unknown>>): mediadatum[] {
  return raw.map(entry => ({
    url: typeof entry.url === "string" ? entry.url : "",
    mime: typeof entry.mime === "string" ? entry.mime : "",
    duration: typeof entry.duration === "number" && Number.isFinite(entry.duration) ? entry.duration : 0,
    width: typeof entry.width === "number" && Number.isFinite(entry.width) ? Math.round(entry.width) : 0,
    height: typeof entry.height === "number" && Number.isFinite(entry.height) ? Math.round(entry.height) : 0,
    codecs: typeof entry.codecs === "string" ? entry.codecs : "",
    tracks: Array.isArray(entry.tracks) ? entry.tracks.filter(item => typeof item === "string") : [],
  }));
}

/** Normalizes raw page asset entries into favicon or logo asset shapes with their byte sizes and declared sizes. */
export function assetentries(raw: Array<Record<string, unknown>>): Array<{ kind: assetrecord["kind"]; url: string; bytes: number; sizes?: string }> {
  return raw.map(entry => ({
    kind: entry.kind === "logo" ? "logo" : "favicon",
    url: typeof entry.url === "string" ? entry.url : "",
    bytes: typeof entry.bytes === "number" && Number.isFinite(entry.bytes) ? entry.bytes : 0,
    ...(typeof entry.sizes === "string" && entry.sizes.trim() ? { sizes: entry.sizes.trim() } : {}),
  }));
}

/** Normalizes raw stream probe entries into stream summaries with track counts, labels, live states and track details. */
export function streamsummaries(raw: Array<Record<string, unknown>>): Array<Omit<streamrecord, "id" | "runid" | "stepid" | "at">> {
  return raw.map(entry => {
    const tracks = Array.isArray(entry.tracks) ? entry.tracks : [];
    return {
      kind: typeof entry.kind === "string" ? entry.kind : "stream",
      tracks: tracks.length,
      label: typeof entry.label === "string" ? entry.label : "",
      live: entry.live === true,
      detail: tracks.map(track => {
        const item = track as Record<string, unknown>;
        return {
          kind: typeof item.kind === "string" ? item.kind : "",
          label: typeof item.label === "string" ? item.label : "",
          ...(typeof item.width === "number" && Number.isFinite(item.width) ? { width: Math.round(item.width) } : {}),
          ...(typeof item.height === "number" && Number.isFinite(item.height) ? { height: Math.round(item.height) } : {}),
          ...(typeof item.framerate === "number" && Number.isFinite(item.framerate) ? { framerate: item.framerate } : {}),
          state: typeof item.state === "string" ? item.state : "",
        };
      }),
    };
  });
}

/* ── Merged from vision.ts ── */

import type { framereference, groundingmatch, groundingresult, ocrline, ocrregion, ocrresult, ocrword, redactionmask, screenshotpair, streamcursor, visioncacheentry, visiondescription } from "./types.js";
import { maskingfield } from "./security.js";
import { randomid } from "./memory.js";
import { bodyhashof } from "./gateway.js";

/**
 * Vision and ocr logic of the 1.1.77 family.
 * Every correlated rule for teaching the agent to see lives in this one module: the imageocr recognition that reads the words with their boxes and confidences off a captured image and merges the word boxes into lines and paragraphs; the regionocr recognition of one reviewed ocrregion of a screenshot with its bounds clamped into the viewport and its word boxes offset to absolute coordinates; the pdfocr pass that rasterizes one scanned pdf page at a time through a rasterize seam with the streamcursor checkpointing after every page; the frameocr read that refuses a playing video, seeks a paused video to its reviewed position and captures the frame; the visionshot description that carries the reviewed prompt with the image to the configured vision model and returns a visiondescription with labeled regions; the cropshot geometry that crops a screenshot to element bounds scaled with device pixel ratio awareness; the redactshot masking that applies a redactionmask before any sharing, fills the masked regions and proposes masks for the common sensitive regions by field type; the groundshot grounding that scores candidate elements by text and geometry match and returns ranked selectors; the pairshot pairing that captures a dom snapshot beside every screenshot, aligns the pair by capture time and viewport size and answers queries by searching text in both image and dom; the ocrtext normalization into searchable text; the visioncost counting of the model calls per run for the costshare ledger; and the visioncache that stores recognition results by image hash so a repeated read serves without a model call.
 * The module extends the reviewed families instead of duplicating them: the crop and scale geometry composes the capture rectangle rules of the 1.1.40 family, the sensitive field shapes come from the maskinputs recognizer the redactshots family already uses, the streamcursor checkpoint grammar comes from the pipeline family of the 1.1.75 release, and the image hash rides the same bodyhashof shape identity the web api cache of the 1.1.76 family keys its entries with.
 * Every impure move stays behind an injected seam — the ocr read, the vision model send, the pdf rasterize, the video state read, the frame grab and the mask fill resolve through functions the executor wires — while every recognition result, description text and labeled region stays opaque reviewed text; no recognition payload enters any audit summary built from these results, and every retention, budget and model choice stays the user's with no code default — an absent value never hides a hardcoded ceiling, and no vision path ever bypasses a review.
 */

/** Ocr read seam: one captured image with its optional region resolves to the recognized words with their boxes and confidences; the extension executor wires the configured vision model provider, tests wire plain fixtures. */
export type ocrread = (image: string, region?: ocrregion) => Promise<ocrword[]>;

/** The vision kinds of the 1.1.77 family, listed among the available capabilities of every proposal request. */
export const visionkinds: string[] = ["imageocr", "regionocr", "pdfocr", "frameocr", "visionshot", "cropshot", "redactshot", "groundshot", "pairshot"];

/** Vision model seam: one reviewed vision request with its image and prompt resolves to the description text and its labeled regions; the extension executor wires the configured model endpoint, tests wire plain fixtures. */
export type visionsend = (request: { imageid: string; image: string; prompt: string }) => Promise<{ text: string; regions: Array<{ label: string; box: ocrregion }> }>;

/** Pdf rasterize seam: one stored pdf document with its one based page number resolves to the rasterized page image; the extension executor wires the renderer backend, tests wire plain fixtures. */
export type pdfrasterize = (documentid: string, page: number) => Promise<string>;

/** Video state seam: one video selector resolves to its paused flag with the playback position and duration in milliseconds; the executor wires the page bridge, tests wire plain fixtures. */
export type videostateread = (selector: string) => Promise<{ paused: boolean; positionms: number; durationms: number }>;

/** Frame grab seam: one video selector at one reviewed position resolves to the captured frame image with its size; the executor wires the page bridge capture, tests wire plain fixtures. */
export type framegrab = (selector: string, positionms: number) => Promise<{ image: string; width: number; height: number }>;

/** Mask fill seam: one image with the regions to cover resolves to the image with the opaque rectangles drawn; the executor wires the capture canvas, tests wire plain fixtures. */
export type maskfill = (image: string, regions: ocrregion[]) => Promise<string>;

/** Reads the shared vertical height of two boxes relative to the shorter box, so the line merge groups words that visually sit on the same text row. */
function verticaloverlap(one: ocrregion, two: ocrregion): number {
  const top = Math.max(one.y, two.y);
  const bottom = Math.min(one.y + one.height, two.y + two.height);
  const shared = Math.max(0, bottom - top);
  const shorter = Math.min(one.height, two.height);
  return shorter > 0 ? shared / shorter : 0;
}

/** Builds the covering box of a set of boxes: the union rectangle of every region named. */
function boxof(regions: ocrregion[]): ocrregion {
  const x = Math.min(...regions.map(region => region.x));
  const y = Math.min(...regions.map(region => region.y));
  const right = Math.max(...regions.map(region => region.x + region.width));
  const bottom = Math.max(...regions.map(region => region.y + region.height));
  return { x: Math.round(x), y: Math.round(y), width: Math.round(right - x), height: Math.round(bottom - y) };
}

/** Reads the intersection over union of two boxes, the geometry half of the grounding score. */
function iou(one: ocrregion, two: ocrregion): number {
  const width = Math.max(0, Math.min(one.x + one.width, two.x + two.width) - Math.max(one.x, two.x));
  const height = Math.max(0, Math.min(one.y + one.height, two.y + two.height) - Math.max(one.y, two.y));
  const shared = width * height;
  const union = one.width * one.height + two.width * two.height - shared;
  return union > 0 ? shared / union : 0;
}

/** Splits a plain language value into its significant lowercase words of more than two characters. */
function words(value: string): string[] {
  return value.toLowerCase().split(/[^a-z0-9]+/).filter(word => word.length > 2);
}

/** Normalizes recognition output into searchable text: whitespace runs fold into single spaces, the ends trim, and the folded text feeds the pairshot queries and the observation vision block. */
export function ocrtext(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

/**
 * Merges the recognized word boxes into lines: two words join one line when their boxes share more than half of the shorter box's height, the line text joins the words left to right, the line box covers its words and the line confidence reports the lowest word confidence so a shaky word drags its line down instead of hiding inside an average — pure geometry with no configurable bound.
 */
export function mergelines(words: ocrword[]): ocrline[] {
  const ordered = [...words].sort((one, two) => one.box.y - two.box.y || one.box.x - two.box.x);
  const grouped: ocrword[][] = [];
  for (const word of ordered) {
    const line = grouped.find(candidate => candidate.some(member => verticaloverlap(member.box, word.box) > 0.5));
    if (line !== undefined) line.push(word);
    else grouped.push([word]);
  }
  return grouped.map(group => {
    const sorted = [...group].sort((one, two) => one.box.x - two.box.x);
    return { text: sorted.map(word => word.text).join(" "), box: boxof(sorted.map(word => word.box)), words: sorted.length, confidence: Math.min(...sorted.map(word => word.confidence)) };
  });
}

/**
 * Merges the recognized lines into paragraphs: two consecutive lines join one paragraph while the vertical gap between them stays inside the shorter line's height, and the paragraph text joins its line texts with single spaces — pure geometry again, so the paragraph breaks answer the page's own spacing.
 */
export function mergeparagraphs(lines: ocrline[]): string[] {
  const ordered = [...lines].sort((one, two) => one.box.y - two.box.y || one.box.x - two.box.x);
  const paragraphs: ocrline[][] = [];
  for (const line of ordered) {
    const last = paragraphs[paragraphs.length - 1];
    if (last !== undefined) {
      const previous = last[last.length - 1]!;
      const gap = line.box.y - (previous.box.y + previous.box.height);
      if (gap <= Math.min(previous.box.height, line.box.height)) { last.push(line); continue; }
    }
    paragraphs.push([line]);
  }
  return paragraphs.map(paragraph => ocrtext(paragraph.map(line => line.text).join(" ")));
}

/**
 * Runs the recognition of one captured image through the ocr read seam: the seam returns the words with their boxes and confidences, the words merge into lines and paragraphs by their own geometry, and the result carries the full normalized text beside the word level evidence.
 */
export async function imageocr(input: { record: { runid: string; stepid: string; imageid: string }; image: string; read: ocrread; id?: string; now: number }): Promise<ocrresult> {
  if (input.image.trim() === "") throw new Error("The imageocr pass needs its captured image; an empty payload reads no pixels.");
  const words = await input.read(input.image);
  const lines = mergelines(words);
  const paragraphs = mergeparagraphs(lines);
  return { id: input.id ?? randomid(), runid: input.record.runid, stepid: input.record.stepid, imageid: input.record.imageid, text: ocrtext(lines.map(line => line.text).join(" ")), words, lines, paragraphs, at: input.now };
}

/**
 * Runs the recognition of one reviewed ocrregion of a screenshot: the region clamps into the viewport so a region drawn past the edges reads only the visible part, a region fully outside the surface refuses loudly instead of reading wrong pixels, the read rides the region through the ocr seam, and the recognized boxes offset by the region origin so every word box lands in absolute screenshot coordinates.
 */
export async function regionocr(input: { record: { runid: string; stepid: string; imageid: string }; image: string; region: ocrregion; viewport: { width: number; height: number }; read: ocrread; id?: string; now: number }): Promise<ocrresult> {
  const clamped = croprect(input.region, input.viewport);
  if (clamped.width <= 0 || clamped.height <= 0) throw new Error(`The ocrregion of x ${input.region.x}, y ${input.region.y}, ${input.region.width} by ${input.region.height} falls entirely outside the ${input.viewport.width} by ${input.viewport.height} viewport; the region read refuses wrong pixels.`);
  const recognized = await input.read(input.image, clamped);
  const words: ocrword[] = recognized.map(word => ({ text: word.text, box: { x: word.box.x + clamped.x, y: word.box.y + clamped.y, width: word.box.width, height: word.box.height }, confidence: word.confidence }));
  const lines = mergelines(words);
  const paragraphs = mergeparagraphs(lines);
  return { id: input.id ?? randomid(), runid: input.record.runid, stepid: input.record.stepid, imageid: input.record.imageid, text: ocrtext(lines.map(line => line.text).join(" ")), words, lines, paragraphs, at: input.now };
}

/**
 * Reads one scanned pdf one page at a time through the rasterize and ocr seams: every page rasterizes, reads and lands its own ocrresult while the streamcursor checkpoints after each page, a cursor of another document refuses loudly because the pass continues exactly the document it came from, and the already read pages skip on a resume so nothing reads twice.
 */
export async function pdfocr(input: { record: { runid: string; stepid: string; documentid: string }; pages: number; rasterize: pdfrasterize; read: ocrread; cursor?: streamcursor; checkpoint?: (cursor: streamcursor) => void; now: number; clock?: () => number }): Promise<{ results: ocrresult[]; cursor: streamcursor; pagesread: number; skipped: number }> {
  const documentid = input.record.documentid;
  if (documentid.trim() === "") throw new Error("The pdfocr pass names its document; a scanned pdf carries its identity.");
  if (!(input.pages >= 1)) throw new Error("The pdfocr pass reads at least one page; a pageless document reads nothing.");
  const clock = input.clock ?? (() => input.now);
  const start = input.cursor !== undefined && input.cursor.pipelineid === documentid ? input.cursor.offset : 0;
  const skipped = input.cursor !== undefined && input.cursor.pipelineid === documentid ? input.cursor.offset : 0;
  if (input.cursor !== undefined && input.cursor.pipelineid !== documentid) throw new Error(`The streamcursor of ${input.cursor.pipelineid} belongs to another document; the pdfocr pass continues exactly the document it came from.`);
  const results: ocrresult[] = [];
  let cursor: streamcursor = { pipelineid: documentid, offset: start, chunk: input.cursor?.chunk ?? 0, updatedat: input.now };
  for (let page = start + 1; page <= input.pages; page += 1) {
    const image = await input.rasterize(documentid, page);
    results.push(await imageocr({ record: { runid: input.record.runid, stepid: input.record.stepid, imageid: `${documentid}:p${page}` }, image, read: input.read, id: `${documentid}:p${page}`, now: clock() }));
    cursor = { pipelineid: documentid, offset: page, chunk: cursor.chunk + 1, updatedat: clock() };
    input.checkpoint?.(cursor);
  }
  return { results, cursor, pagesread: results.length, skipped };
}

/**
 * Reads one video frame through the video state and frame grab seams: a playing video refuses loudly because the frame of a moving picture answers no question, a paused video seeks to its reviewed position in milliseconds and captures the frame, and the read rides the captured image through the ocr seam while the framereference records the position the run read.
 */
export async function frameocr(input: { record: { runid: string; stepid: string }; frame: framereference; state: videostateread; grab: framegrab; read: ocrread; now: number }): Promise<{ frame: framereference; result: ocrresult; image: string }> {
  const state = await input.state(input.frame.selector);
  if (!state.paused) throw new Error(`The video ${input.frame.selector} is playing at ${state.positionms} milliseconds; the frame read refuses a moving picture — pause the video first so the frame answers a real position.`);
  if (input.frame.positionms < 0 || (state.durationms > 0 && input.frame.positionms > state.durationms)) throw new Error(`The reviewed position of ${input.frame.positionms} milliseconds falls outside the video ${input.frame.selector} of ${state.durationms} milliseconds; the seek stays inside the video.`);
  const grabbed = await input.grab(input.frame.selector, input.frame.positionms);
  const result = await imageocr({ record: { runid: input.record.runid, stepid: input.record.stepid, imageid: `${input.frame.selector}@${input.frame.positionms}` }, image: grabbed.image, read: input.read, now: input.now });
  return { frame: { ...input.frame, positionms: input.frame.positionms, at: input.now }, result, image: grabbed.image };
}

/**
 * Sends one screenshot with its reviewed prompt to the configured vision model through the vision send seam: an empty prompt refuses loudly because the model answers exactly what the review asked, the seam returns the description text with its labeled regions, and the description carries the prompt it answered so the audit reads both sides.
 */
export async function visionshot(input: { record: { runid: string; stepid: string; imageid: string }; image: string; prompt: string; send: visionsend; id?: string; now: number }): Promise<visiondescription> {
  if (input.prompt.trim() === "") throw new Error("The visionshot prompt stays a non-empty reviewed string; the vision model answers exactly what the review asked.");
  if (input.image.trim() === "") throw new Error("The visionshot pass needs its captured image; an empty payload describes no pixels.");
  const answer = await input.send({ imageid: input.record.imageid, image: input.image, prompt: input.prompt.trim() });
  return { id: input.id ?? randomid(), runid: input.record.runid, stepid: input.record.stepid, imageid: input.record.imageid, prompt: input.prompt.trim(), text: answer.text, regions: answer.regions, at: input.now };
}

/**
 * Computes the crop geometry of one element shot: the element bounds in css pixels scale by the device pixel ratio so the crop lands in image pixels, the scaled crop clamps into the captured image because an element past the edges crops only the visible part, and a bounds rectangle fully outside the image refuses loudly instead of cropping wrong pixels.
 */
export function cropshot(input: { image: { width: number; height: number }; bounds: ocrregion; pixelratio: number }): { cssbounds: ocrregion; crop: ocrregion; width: number; height: number; ratio: number } {
  const device = scaledrect(input.bounds, input.pixelratio);
  const crop = croprect(device, input.image);
  if (crop.width <= 0 || crop.height <= 0) throw new Error(`The element bounds of x ${input.bounds.x}, y ${input.bounds.y}, ${input.bounds.width} by ${input.bounds.height} css pixels fall entirely outside the ${input.image.width} by ${input.image.height} pixel capture; the crop refuses wrong pixels.`);
  return { cssbounds: input.bounds, crop, width: crop.width, height: crop.height, ratio: input.pixelratio };
}

/**
 * Applies one redaction mask to a capture before any sharing through the mask fill seam: every region clamps into the capture so a mask past the edges covers only the real part, a mask whose every region falls outside the capture refuses loudly because a share that claims redaction while covering nothing leaks, the fill seam draws the opaque rectangles, and the returned summary records the mask in the audit trail with its reason.
 */
export async function redactshot(input: { image: string; width: number; height: number; mask: redactionmask; fill: maskfill }): Promise<{ image: string; regions: number; reason: string; summary: string }> {
  if (input.mask.regions.length === 0) throw new Error("The redaction mask carries at least one region; an empty mask masks nothing.");
  const regions = input.mask.regions.map(region => croprect(region, { width: input.width, height: input.height })).filter(region => region.width > 0 && region.height > 0);
  if (regions.length === 0) throw new Error("Every region of the redaction mask falls outside the capture; the share refuses instead of leaking what the mask promised to cover.");
  const image = await input.fill(input.image, regions);
  return { image, regions: regions.length, reason: input.mask.reason, summary: `The redaction mask covered ${regions.length} region${regions.length === 1 ? "" : "s"} of the capture before the share: ${input.mask.reason}` };
}

/**
 * Proposes redaction masks for the common sensitive regions by field type: every field whose name carries a sensitive field shape the maskinputs recognizer masks contributes one mask with its own reason, so the sidepanel offers exactly the masks the field types imply and the user edits them before any share.
 */
export function proposeredactionmasks(input: { runid: string; captureid: string; fields: Array<{ name: string; rect: ocrregion }>; now: number }): redactionmask[] {
  const masks: redactionmask[] = [];
  for (const field of input.fields) {
    if (!maskingfield(field.name, [])) continue;
    masks.push({ id: randomid(), runid: input.runid, captureid: input.captureid, regions: [field.rect], reason: `The ${field.name} field carries a sensitive field shape; the proposed mask covers it before any share.`, source: "fieldshape", at: input.now });
  }
  return masks;
}

/**
 * Grounds the labeled regions of one vision description into ranked page selectors: every candidate element scores by its text match with the label (the shared significant words over the label's words) and its geometry match with the region box (the intersection over union after the image pixel ratio converts the box into css pixels), the two halves average, and the matches rank by score so the top selector grounds the label; a candidate that shares neither words nor geometry never joins the ranking.
 */
export function groundshot(input: { description: visiondescription; elements: Array<{ selector: string; text: string; rect: ocrregion }>; pixelratio: number; record: { runid: string; stepid: string }; id?: string; now: number }): groundingresult {
  if (input.description.regions.length === 0) throw new Error("The grounding pass needs its labeled regions; a description without regions grounds nothing.");
  const matches: groundingmatch[] = [];
  const ratio = input.pixelratio >= 1 ? input.pixelratio : 1;
  for (const region of input.description.regions) {
    const cssbox = { x: region.box.x / ratio, y: region.box.y / ratio, width: region.box.width / ratio, height: region.box.height / ratio };
    const labelwords = words(region.label);
    for (const element of input.elements) {
      const textscore = labelwords.length > 0 ? words(element.text).filter(word => labelwords.includes(word)).length / labelwords.length : 0;
      const geometryscore = iou(cssbox, element.rect);
      const score = (textscore + geometryscore) / 2;
      if (score <= 0) continue;
      matches.push({ label: region.label, text: element.text, selector: element.selector, score });
    }
  }
  matches.sort((one, two) => two.score - one.score || one.selector.localeCompare(two.selector));
  return { id: input.id ?? randomid(), runid: input.record.runid, stepid: input.record.stepid, descriptionid: input.description.id, matches, at: input.now };
}

/**
 * Pairs one screenshot with the dom snapshot captured beside it: only snapshots of the same viewport size align, the nearest capture time wins because the pair answers one moment of the page, and an image with no same viewport snapshot stays unpaired and names its refusal instead of pairing wrong pixels with wrong dom.
 */
export function pairshot(input: { runid: string; stepid: string; image: { id: string; capturetime: number; viewport: { width: number; height: number } }; snapshots: Array<{ id: string; capturetime: number; viewport: { width: number; height: number } }>; id?: string; now: number }): { pair?: screenshotpair; skipped?: "snapshot"; reason: string } {
  const candidates = input.snapshots.filter(snapshot => snapshot.viewport.width === input.image.viewport.width && snapshot.viewport.height === input.image.viewport.height);
  if (candidates.length === 0) return { skipped: "snapshot", reason: `No dom snapshot of the ${input.image.viewport.width} by ${input.image.viewport.height} viewport exists; the pair of ${input.image.id} waits for a snapshot of the same viewport.` };
  const nearest = candidates.reduce((best, candidate) => Math.abs(candidate.capturetime - input.image.capturetime) < Math.abs(best.capturetime - input.image.capturetime) ? candidate : best);
  const delta = Math.abs(nearest.capturetime - input.image.capturetime);
  return { pair: { id: input.id ?? randomid(), runid: input.runid, stepid: input.stepid, imageid: input.image.id, domsnapshotid: nearest.id, capturetime: input.image.capturetime, viewport: input.image.viewport, at: input.now }, reason: `Paired the image ${input.image.id} with the dom snapshot ${nearest.id} captured ${delta} millisecond${delta === 1 ? "" : "s"} apart at the same ${input.image.viewport.width} by ${input.image.viewport.height} viewport.` };
}

/**
 * Answers one query by searching the text of both sides of a pair: the normalized ocr text of the image and the dom text both fold their whitespace and lowercase before the needle search, every matching side reports an excerpt around its hit, and the summary names exactly which sides matched so a visual claim answers its page side.
 */
export function pairquery(input: { query: string; ocrtextvalue: string; domtext: string }): { matches: Array<{ source: "image" | "dom"; excerpt: string }>; summary: string } {
  const needle = input.query.trim().toLowerCase();
  if (needle === "") throw new Error("The pair query stays a non-empty string; an empty query matches every side of the pair.");
  const image = ocrtext(input.ocrtextvalue).toLowerCase();
  const dom = ocrtext(input.domtext).toLowerCase();
  const matches: Array<{ source: "image" | "dom"; excerpt: string }> = [];
  if (image.includes(needle)) matches.push({ source: "image", excerpt: excerptof(image, needle) });
  if (dom.includes(needle)) matches.push({ source: "dom", excerpt: excerptof(dom, needle) });
  return { matches, summary: `The query ${input.query.trim()} matched ${matches.length} side${matches.length === 1 ? "" : "s"} of the pair${matches.length > 0 ? `: ${matches.map(match => match.source).join(" and ")}` : "; neither the image text nor the dom text carries it"}.` };
}

/** Reads the excerpt around one hit: up to forty characters of context on both sides of the needle so the match reads in place. */
function excerptof(value: string, needle: string): string {
  const index = value.indexOf(needle);
  if (index < 0) return "";
  const start = Math.max(0, index - 40);
  const end = Math.min(value.length, index + needle.length + 40);
  return `${start > 0 ? "…" : ""}${value.slice(start, end)}${end < value.length ? "…" : ""}`;
}

/**
 * Counts the vision calls of one run for the costshare ledger: every call records whether it rode the configured model endpoint, only the model calls count units because the local passes spend nothing, and the description names the split so the ledger entry reads exactly what the vision family spent.
 */
export function visioncost(input: { runid: string; calls: Array<{ kind: string; model: boolean; at: number }> }): { calls: number; modelcalls: number; units: number; description: string } {
  const modelcalls = input.calls.filter(call => call.model).length;
  return { calls: input.calls.length, modelcalls, units: modelcalls, description: `The vision family made ${input.calls.length} call${input.calls.length === 1 ? "" : "s"} of the run ${input.runid} with ${modelcalls} riding the configured model endpoint; every unit stays local to the costshare ledger.` };
}

/** Reads the hash of one image payload for the visioncache keys: the same bodyhashof shape identity the web api cache keys its entries with, never the pixel values. */
export function imagehashof(image: string): string {
  return `img:${bodyhashof(image)}`;
}

/**
 * Stores one recognition or description in the visioncache by its image hash: a newer entry of the same hash replaces the older one, and the cache never grows a duplicate because one image hash answers one recognition.
 */
export function visioncacheput(input: { entries: visioncacheentry[]; entry: visioncacheentry }): visioncacheentry[] {
  return [input.entry, ...input.entries.filter(candidate => candidate.hash !== input.entry.hash)];
}

/**
 * Serves one visioncache hit by the image hash and kind: entries older than the user retention window drop first because the expiry ties to the user choice with no code default, a live entry of the same hash and kind serves with its hit counter bumped so the repeated read never calls the model again, and the pass reports exactly what it expired.
 */
export function visioncacheserve(input: { entries: visioncacheentry[]; hash: string; kind: "ocr" | "vision"; now: number; retention?: number }): { entry?: visioncacheentry; entries: visioncacheentry[]; expired: number } {
  const live = input.entries.filter(entry => input.retention === undefined || input.now - entry.at < input.retention);
  const expired = input.entries.length - live.length;
  const found = live.find(entry => entry.hash === input.hash && entry.kind === input.kind);
  if (found === undefined) return { entries: live, expired };
  const bumped = { ...found, hits: found.hits + 1 };
  return { entry: bumped, entries: live.map(entry => entry.hash === found.hash && entry.kind === found.kind ? bumped : entry), expired };
}

/* ── Merged from redactshots.ts ── */

import type { capturesurface, redactregion, toolstep } from "./types.js";

/**
 * Redactshots logic of the 1.1.62 family.
 * The capture masking rules live here: sensitive regions of the capture surface — derived from the field shapes the recognizer masks or drawn by the user — cover viewport, element and stitched captures alike, so the stored bytes never carry the sensitive regions while the record keeps the redaction evidence and the reason.
 * The regions scope to one origin and one page template, and no geometry, region count or shape list is ever hardcoded: every region stays the user's knowledge, mirroring the maskinputs posture.
 */

/** Builds one redact region with its geometry in css pixels, its plain language reason and its source; the geometry stays finite and positive so the capture seam draws a real rectangle. */
export function regionof(input: { origin: string; template: string; x: number; y: number; width: number; height: number; reason: string; source: "fieldshape" | "userdrawn"; now: number; id?: string }): redactregion {
  if (input.origin.trim() === "" || input.template.trim() === "") throw new Error("The redact region needs its origin and its page template.");
  for (const value of [input.x, input.y, input.width, input.height]) {
    if (!Number.isFinite(value) || value < 0) throw new Error("The redact region needs finite, non-negative geometry in css pixels.");
  }
  if (input.width <= 0 || input.height <= 0) throw new Error("The redact region needs a positive width and height so the mask covers a real area.");
  if (input.reason.trim() === "") throw new Error("The redact region names its reason in plain language.");
  return { id: input.id ?? randomid(), origin: input.origin.trim(), template: input.template.trim(), x: input.x, y: input.y, width: input.width, height: input.height, reason: input.reason.trim(), source: input.source, createdat: input.now };
}

/** Reads whether one region keeps finite, positive geometry the capture seam can draw. */
export function regionvalid(region: redactregion): boolean {
  return Number.isFinite(region.x) && Number.isFinite(region.y) && Number.isFinite(region.width) && Number.isFinite(region.height) && region.width > 0 && region.height > 0;
}

/** Reads the regions of one origin and page template: the regions bind to the page they were drawn on and never leak onto another origin or template. */
export function regionsfor(regions: redactregion[], origin: string, template: string): redactregion[] {
  return regions.filter(region => region.origin === origin && region.template === template);
}

/** Derives redact regions from the sensitive field shapes of one form layout: every field whose name matches a masked shape contributes its rectangle, so the capture masks exactly what the recognizer would mask. */
export function fieldshaperegions(input: { origin: string; template: string; fields: Array<{ name: string; rect: { x: number; y: number; width: number; height: number } }>; now: number }): redactregion[] {
  const regions: redactregion[] = [];
  for (const field of input.fields) {
    if (!maskingfield(field.name, [])) continue;
    regions.push(regionof({ origin: input.origin, template: input.template, x: field.rect.x, y: field.rect.y, width: field.rect.width, height: field.rect.height, reason: `The ${field.name} field carries a sensitive field shape the recognizer masks.`, source: "fieldshape", now: input.now }));
  }
  return regions;
}

/** Merges drawn regions into the stored set: a region of the same origin, template and geometry keeps its first record while a new geometry joins the list. */
export function mergeregions(existing: redactregion[], added: redactregion[]): redactregion[] {
  const merged = [...existing];
  for (const region of added) {
    if (merged.some(candidate => candidate.origin === region.origin && candidate.template === region.template && candidate.x === region.x && candidate.y === region.y && candidate.width === region.width && candidate.height === region.height)) continue;
    merged.push(region);
  }
  return merged;
}

/** Maps one capture kind to its redactshots surface: viewport captures, element captures and stitched captures all carry the same region grammar. */
export function capturesurfaceof(kind: string): capturesurface {
  if (kind === "element" || kind === "elementshot") return "element";
  if (kind === "stitched" || kind === "fullpage" || kind === "shotfullpage" || kind === "stitch" || kind === "contactsheet" || kind === "timelapse" || kind === "recordscreen") return "stitched";
  return "viewport";
}

/** Reads the template name of one capture step: the reviewed option template the user named, or the step kind itself as the page template baseline. */
export function templateof(step: Pick<toolstep, "kind" | "options">): string {
  if (step.options) {
    try {
      const parsed = JSON.parse(step.options) as unknown;
      if (Boolean(parsed) && typeof parsed === "object" && !Array.isArray(parsed)) {
        const template = (parsed as Record<string, unknown>).template;
        if (typeof template === "string" && template.trim() !== "") return template.trim();
      }
    } catch { /* an options payload outside the json grammar falls back to the step kind */ }
  }
  return step.kind;
}

/** Applies the redact regions to one stored capture record: the record keeps the redaction evidence — the flag and the region count — while the capture seam draws the opaque rectangles before the bytes reach storage, across every capture kind. */
export function redactedshot<T extends { kind: string }>(record: T, regions: redactregion[]): T & { redacted?: boolean; redactedregions?: number } {
  if (regions.length === 0) return record;
  return { ...record, redacted: true, redactedregions: regions.length };
}

/** Builds the redaction evidence summary the audit trail records: the surface, the region count and the reason of every region. */
export function redactionsummary(regions: redactregion[]): string {
  if (regions.length === 0) return "No redact region covered the capture; the stored bytes carry everything the surface saw.";
  const sources = { fieldshape: 0, userdrawn: 0 };
  for (const region of regions) sources[region.source] += 1;
  return `${regions.length} redact region${regions.length === 1 ? "" : "s"} covered the capture before storage: ${sources.fieldshape} derived from sensitive field shapes and ${sources.userdrawn} drawn by the user (${regions.map(region => region.reason).join("; ")}).`;
}
