/**
 * density.ts — the DPI law of the one design (wave 2-c / PR11): the family
 * answers every screen with ONE design; the only thing a platform changes is
 * the density it renders that design at. This module is the single token
 * splitter every surface reads — the web (vercel, cloudflare, netlify — the
 * same static build), the terminal conversion (buildterminal.ts rides these
 * tokens when it maps the Sol widgets to cells), the TV 10-foot face and the
 * android dp face all resolve the SAME spacing rhythm through here, so a
 * second design can never fork in.
 *
 * The law in tokens:
 * - web — the device pixel ratio ladder (1x / 2x / 3x): the CSS px grid of
 *   the design stays the unit, the device doubles and triples behind it;
 * - terminal — the character cell is the unit: one cell horizontally
 *   (≈8px) and one row vertically (≈16px); every spacing of the design
 *   quantizes to cells, never to fractions of a glyph;
 * - tv — the 10-foot face: the same rhythm at a 1.75 factor with the
 *   generous hit targets a couch distance needs;
 * - android — density-independent pixels: dp is the design unit, px = dp ×
 *   dpi/160, the mdpi→xxxhdpi buckets are the dpi ladder of the platform.
 *
 * Pure TypeScript, zero imports, DOM-free: the browser, the build converter
 * and the terminal runtime all import the same module.
 */

/** the platforms the one design answers */
export type DensityPlatform = "web" | "terminal" | "tv" | "android";

/** every platform of the law, in the canonical family order */
export const DENSITY_PLATFORMS: readonly DensityPlatform[] = ["web", "terminal", "tv", "android"];

/** the web device pixel ratio ladder */
export type WebDpr = 1 | 2 | 3;

/** the android density buckets (the dpi ladder of the platform) */
export type AndroidBucket = "mdpi" | "hdpi" | "xhdpi" | "xxhdpi" | "xxxhdpi";

/** the android bucket → dpi and factor table (160dpi is the dp baseline) */
export const ANDROID_DPI: Readonly<Record<AndroidBucket, number>> = {
  mdpi: 160,
  hdpi: 240,
  xhdpi: 320,
  xxhdpi: 480,
  xxxhdpi: 640,
};

/** the terminal character cell: the nominal cell of the medium (a mono glyph
 * is ≈8px wide and ≈16px tall on the reference terminal) — every px of the
 * design quantizes through these when the conversion maps it to cells */
export const CELL_W_PX = 8;
export const CELL_H_PX = 16;

/** the reference columns/rows of the terminal face (the 80×24 contract the
 * conversion renders into — the same measure the 640px lede answers) */
export const TERMINAL_COLUMNS = 80;
export const TERMINAL_ROWS = 24;

/** the tv 10-foot factor: the couch distance scale of the same rhythm */
export const TV_TEN_FOOT_FACTOR = 1.75;

/** the resolved density tokens of the one design on one platform */
export type DensityTokens = {
  /** the platform the tokens answer */
  platform: DensityPlatform;
  /** the multiplier the platform renders the design at (web dpr, terminal 1
   * cell, tv 10-foot, android bucket factor) */
  factor: number;
  /** the unit the platform counts the rhythm in */
  unit: "px" | "cell" | "dp";
  /** the base spacing step of the design (the 4px rhythm) in the unit */
  step: number;
  /** the hairline width in the unit (the 1px rule of the design) */
  hairline: number;
  /** the icon size of the design in the unit */
  icon: number;
  /** the body font size of the design in the unit */
  font: number;
  /** the minimum interactive target in the unit (the affordance law) */
  hit: number;
  /** how many columns the responsive grid folds into on this platform */
  columns: number;
};

/** the platform hint the caller may pass (every field optional) */
export type DensityHint = {
  /** the web device pixel ratio */
  dpr?: WebDpr;
  /** the android density bucket */
  bucket?: AndroidBucket;
  /** the live terminal size in cells */
  cols?: number;
  rows?: number;
};

/** resolves the density tokens of the one design for one platform.
 *
 * @param platform the platform the tokens answer.
 * @param hint optional resolution hints (web dpr, android bucket, live
 *        terminal size). Defaults: web 2x (the reference display), terminal
 *        80×24, tv 1080p couch, android xhdpi (the reference handset).
 */
export function densityTokens(platform: DensityPlatform, hint: DensityHint = {}): DensityTokens {
  switch (platform) {
    case "web": {
      const dpr: WebDpr = hint.dpr ?? 2;
      return {
        platform,
        factor: dpr,
        unit: "px",
        step: 4,
        hairline: 1,
        icon: 16 * dpr,
        font: 13,
        hit: 24,
        columns: 12,
      };
    }
    case "terminal": {
      const cols = hint.cols ?? TERMINAL_COLUMNS;
      return {
        platform,
        factor: 1,
        unit: "cell",
        step: 1,
        hairline: 1,
        icon: 1,
        font: 1,
        hit: 1,
        columns: cols,
      };
    }
    case "tv": {
      return {
        platform,
        factor: TV_TEN_FOOT_FACTOR,
        unit: "px",
        step: 4 * TV_TEN_FOOT_FACTOR,
        hairline: 2,
        icon: 28 * TV_TEN_FOOT_FACTOR,
        font: Math.round(13 * TV_TEN_FOOT_FACTOR),
        hit: Math.round(24 * 2),
        columns: 12,
      };
    }
    case "android": {
      const bucket: AndroidBucket = hint.bucket ?? "xhdpi";
      const dpi = ANDROID_DPI[bucket];
      return {
        platform,
        factor: dpi / 160,
        unit: "dp",
        step: 4,
        hairline: 1,
        icon: 16,
        font: 13,
        hit: 24,
        columns: 4,
      };
    }
  }
}

/** converts android dp to device px at one bucket (px = dp × dpi/160) */
export function dpToPx(dp: number, bucket: AndroidBucket): number {
  return dp * (ANDROID_DPI[bucket] / 160);
}

/** converts design px to terminal cells: the horizontal lane quantizes to
 * the cell width, the vertical lane to the row height (never a fraction of a
 * glyph — the conversion rounds to the nearest cell, minimum one) */
export function pxToCellX(px: number): number {
  return Math.max(1, Math.round(px / CELL_W_PX));
}
export function pxToCellY(px: number): number {
  return Math.max(1, Math.round(px / CELL_H_PX));
}

/** the device pixels one design px renders at on one platform (the dpi
 * difference, the only difference) */
export function designPxToPlatformPx(px: number, platform: DensityPlatform, hint: DensityHint = {}): number {
  const tokens = densityTokens(platform, hint);
  if (platform === "terminal") return pxToCellX(px) * CELL_W_PX;
  return px * tokens.factor;
}
