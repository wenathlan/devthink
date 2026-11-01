/**
 * dockmagnify.ts — the pure math of the dock magnification (root logic
 * layer): the gaussian falloff the magnifying pad answers. The component
 * layer (Sol/wingets/ShellDockmagnify.tsx) walks the pointer and drives the
 * GSAP tweens; this module owns the numbers and the curve so the law is
 * unit-testable without a DOM — no react, no gsap, no listeners here.
 *
 * The falloff is the dock magnifying law the interactions catalog pinned:
 * every icon answers scale = 1 + maxScale × exp(−d² / 2σ²) where d is the
 * pointer distance to the icon center on the bar axis, σ the spread of the
 * bump and maxScale the peak growth — the pointer icon rides the peak, the
 * neighbors answer the smooth tail, and the whole field returns to rest on
 * the leave (the elastic return the component plays).
 */

/** the peak growth of the pointer icon (the scale rides 1 + max) — a 1.32
 * peak: the icon grows a visible third without pushing its row mates off
 * the pad */
export const DOCK_MAGNIFY_MAX = 0.32;

/** the spread of the gaussian bump (px): how fast the growth dies with the
 * distance — 90px reaches roughly one icon on either side at the 44px cell
 * rhythm and reads as one wave, not a fisheye */
export const DOCK_MAGNIFY_SPREAD = 90;

/**
 * the magnified scale of one icon at the pointer distance.
 *
 * @param distance the pointer distance to the icon center (px, signed or
 * absolute — the square kills the sign).
 * @param maxScale the peak growth (the DOCK_MAGNIFY_MAX default).
 * @param spread the gaussian σ (the DOCK_MAGNIFY_SPREAD default).
 * @returns the scale the icon answers — exactly 1 at the tail, 1 + maxScale
 * under the pointer.
 */
export function magnifyscale(distance: number, maxScale: number = DOCK_MAGNIFY_MAX, spread: number = DOCK_MAGNIFY_SPREAD): number {
  const square = Number(distance) ** 2;
  const sigma = Math.max(spread, 1);
  return 1 + maxScale * Math.exp(-square / (2 * sigma * sigma));
}
