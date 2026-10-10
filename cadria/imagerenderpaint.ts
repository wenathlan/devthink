// # imagerenderpaint — the SVG arm of the render layer (wave 2, module b7):
// imagerender.ts compiles a project into pixel-free DrawCommands; this sibling
// carries the bigger builders — the deterministic SVG serializer any SVG
// consumer paints. Every number is spelled with fixed 3-decimal toFixed (never
// a locale float, never an exponent for the magnitudes used here), ids are
// command indexes (unique, stable), there are no timestamps and no escaping —
// all inputs are internal IR (colors are #rrggbb by compiler contract), so the
// same frame always serializes to the same string, byte for byte. Geometry
// arrives normalized 0-1 and is scaled by the frame size here; px fields
// (strokeWidth, grainfield r, blur) pass through unscaled. Kind mapping:
// rect→<rect>, ellipse→<ellipse>, gradientwash→<linearGradient>+<rect>,
// path→closed <path d="… Z">, strokepath→open stroked <path>, grainfield→
// <circle>; blur > 0 adds a per-command <feGaussianBlur> filter def.
// Exports: renderSvg.

import type { DrawCommand, RenderFrame } from "./imagerender.ts";

/** fixed 3-decimal spelling; non-finite damage answers "0.000" (total, never NaN). */
function f(n: number): string {
  return (Number.isFinite(n) ? n : 0).toFixed(3);
}

/** flat x,y pairs (normalized) → "M x y L x y …" path data, scaled to px. */
function pathData(points: number[], w: number, h: number): string {
  const out: string[] = [];
  for (let i = 0; i + 1 < points.length; i += 2) out.push(`${i === 0 ? "M" : "L"} ${f(points[i] * w)} ${f(points[i + 1] * h)}`);
  return out.length > 0 ? out.join(" ") : "M 0.000 0.000";
}

/** blur > 0 registers one filter def and answers its reference attribute. */
function blurAttr(c: DrawCommand, i: number, defs: string[]): string {
  if (!(c.blur > 0)) return "";
  defs.push(`<filter id="blur-${i}" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="${f(c.blur)}"/></filter>`);
  return ` filter="url(#blur-${i})"`;
}

/** shared fill-paint attributes: fill-opacity (unless 1) plus the blur reference. */
function fillAttrs(c: DrawCommand, i: number, defs: string[]): string {
  return `${c.opacity < 1 ? ` fill-opacity="${f(c.opacity)}"` : ""}${blurAttr(c, i, defs)}`;
}

/** serializes one command; the defs list collects gradient/filter partners in order. */
function commandSvg(c: DrawCommand, i: number, w: number, h: number, defs: string[]): string {
  switch (c.kind) {
    case "rect":
      return `<rect x="${f(c.x * w)}" y="${f(c.y * h)}" width="${f(c.w * w)}" height="${f(c.h * h)}" fill="${c.fill}"${fillAttrs(c, i, defs)}/>`;
    case "ellipse":
      return `<ellipse cx="${f(c.cx * w)}" cy="${f(c.cy * h)}" rx="${f(c.rx * w)}" ry="${f(c.ry * h)}" fill="${c.fill}"${fillAttrs(c, i, defs)}/>`;
    case "gradientwash": {
      // angle in degrees (0 = +x, svg y-down) → objectBoundingBox endpoints
      const rad = (Number.isFinite(c.angle) ? c.angle : 0) * (Math.PI / 180);
      const dx = Math.cos(rad) / 2;
      const dy = Math.sin(rad) / 2;
      defs.push(`<linearGradient id="wash-${i}" x1="${f(0.5 - dx)}" y1="${f(0.5 - dy)}" x2="${f(0.5 + dx)}" y2="${f(0.5 + dy)}"><stop offset="0" stop-color="${c.from}"/><stop offset="1" stop-color="${c.to}"/></linearGradient>`);
      return `<rect x="${f(c.x * w)}" y="${f(c.y * h)}" width="${f(c.w * w)}" height="${f(c.h * h)}" fill="url(#wash-${i})"${fillAttrs(c, i, defs)}/>`;
    }
    case "path":
      return `<path d="${pathData(c.points, w, h)} Z" fill="${c.fill}"${fillAttrs(c, i, defs)}/>`;
    case "strokepath":
      return `<path d="${pathData(c.points, w, h)}" fill="none" stroke="${c.stroke}" stroke-width="${f(c.strokeWidth)}" stroke-opacity="${f(c.opacity)}" stroke-linecap="round"${blurAttr(c, i, defs)}/>`;
    case "grainfield":
      return `<circle cx="${f(c.x * w)}" cy="${f(c.y * h)}" r="${f(c.r)}" fill="${c.fill}"${fillAttrs(c, i, defs)}/>`;
  }
}

/**
 * renderSvg — the deterministic SVG serializer over a render frame (exactly
 * what renderCommands answers): root svg with width/height/viewBox, then an
 * optional <defs> block (gradients + blur filters, command-index ids), then
 * one element per command in paint order. Newline-indented, no trailing
 * whitespace, ends with a newline.
 */
export function renderSvg(frame: RenderFrame): string {
  const width = Math.round(Number.isFinite(frame?.width) ? frame.width : 1080);
  const height = Math.round(Number.isFinite(frame?.height) ? frame.height : 1080);
  const defs: string[] = [];
  const commands = Array.isArray(frame?.commands) ? frame.commands : [];
  const body = commands.map((c, i) => commandSvg(c, i, width, height, defs));
  const head = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`;
  const defBlock = defs.length > 0 ? `  <defs>\n    ${defs.join("\n    ")}\n  </defs>` : "";
  return [head, defBlock, ...body.map((row) => `  ${row}`), "</svg>"].filter((row) => row.length > 0).join("\n") + "\n";
}
