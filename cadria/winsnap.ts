// the aero snap math of the studio window.
/**
 * winsnap — the pure math behind the aero snap of the cadria studio window
 * (Sol/shell/shell.tsx): the screen-edge zones a title-bar drag can land in
 * (the two halves and the top maximize strip, the Windows half/half-top
 * grammar) and the translucent ghost rect each zone previews before the
 * commit. One responsibility: the zone grammar and its geometry — no DOM,
 * no state, no listeners, no React. The shell reads the pointer through
 * `winsnapzone` while the drag rides (rAF-batched), previews the landing
 * zone through `winsnaprect` and commits on release; the reduced-motion
 * hard stop of the stylesheet keeps the only visual opinion (the ghost
 * entrance zeroes out under it).
 */

/** the width (px) of the vertical side strips that preview the aero halves. */
export const WIN_SNAP_EDGE_PX = 12;

/** the height (px) of the top strip that previews the maximize ghost (the
 * top strip wins where it overlaps the side strips, exactly like Windows). */
export const WIN_MAXIMIZE_EDGE_PX = 8;

/** the gap (px) between the ghost rect and the viewport edges (and between
 * the two halves) — the Windows 11 preview breathing room. */
export const WIN_SNAP_GUTTER_PX = 8;

/** one aero snap zone of the studio window: the left half, the right half
 * or the whole viewport (maximize). */
export type WinSnapZone = "left" | "right" | "max";

/** the fixed-position rect a zone previews (viewport coordinates, px). */
export type WinSnapRect = { left: number; top: number; width: number; height: number };

/**
 * Answers the snap zone a pointer pose lands in: the top strip answers the
 * maximize ghost, the vertical side strips answer the halves, everything
 * else answers null (the drag stays a plain move). Degenerate viewports
 * answer null so a hidden window never snaps.
 *
 * @param clientX the pointer x in viewport coordinates.
 * @param clientY the pointer y in viewport coordinates.
 * @param viewportWidth the inner width of the window.
 * @param viewportHeight the inner height of the window.
 * @returns the zone the pose previews, or null when no zone is under it.
 */
export function winsnapzone(
  clientX: number,
  clientY: number,
  viewportWidth: number,
  viewportHeight: number,
): WinSnapZone | null {
  if (viewportWidth <= 0 || viewportHeight <= 0) return null;
  if (clientY <= WIN_MAXIMIZE_EDGE_PX) return "max";
  if (clientX <= WIN_SNAP_EDGE_PX) return "left";
  if (clientX >= viewportWidth - WIN_SNAP_EDGE_PX) return "right";
  return null;
}

/**
 * The ghost rect a zone previews: the halves land inset by the gutter with
 * the gutter split across the center line, the maximize zone fills the
 * viewport minus the gutter. Never negative — a too-small viewport clamps
 * to a zero-area rect instead of lying about the landing zone.
 *
 * @param zone the zone the pointer previews.
 * @param viewportWidth the inner width of the window.
 * @param viewportHeight the inner height of the window.
 * @param gutter the edge breathing room (defaults to `WIN_SNAP_GUTTER_PX`).
 * @returns the rect the ghost overlay paints.
 */
export function winsnaprect(
  zone: WinSnapZone,
  viewportWidth: number,
  viewportHeight: number,
  gutter: number = WIN_SNAP_GUTTER_PX,
): WinSnapRect {
  const g = Math.max(0, gutter);
  const inset = g * 2;
  const height = Math.max(0, viewportHeight - inset);
  if (zone === "max") {
    return { left: g, top: g, width: Math.max(0, viewportWidth - inset), height };
  }
  const half = Math.round(Math.max(0, viewportWidth) / 2);
  const width = Math.max(0, half - g - Math.round(g / 2));
  return zone === "left"
    ? { left: g, top: g, width, height }
    : { left: Math.max(0, viewportWidth - g - width), top: g, width, height };
}
