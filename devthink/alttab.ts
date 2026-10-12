// the alt-tab cycling math of the OS shell.
/**
 * alttab — the pure logic behind the Windows alt-tab switcher of the Sol
 * shell (Sol/shell/alttabswitcher.tsx). One responsibility: the cycle math
 * and the key grammar of the switcher. The switcher walks the MRU window
 * order (most recently focused first), stepping forward with alt+tab and
 * backward with alt+shift+tab, wrapping at both ends; the arrow keys walk
 * the visible cards the same way; releasing Alt commits the selected
 * window and Escape cancels back to the pre-switch focus. The key grammar
 * is matched by one predicate pair (`alttabkeydown` / `altkeyup`) so the
 * component stays presentational; `nextaltindex` never mutates and never
 * touches the DOM, so the reduced-motion rule of the stylesheet keeps the
 * only visual opinion (the hard stop zeroes the entrance).
 */

/**
 * Answers whether a keyboard event is the alt+tab cycle chord (with or
 * without shift — both directions ride the same chord) or one of the
 * in-switcher navigation keys.
 *
 * @param event the raw keyboard event.
 * @returns true when the event drives the switcher.
 */
export function alttabkeydown(event: KeyboardEvent): boolean {
  if (event.key === "Tab" && event.altKey) return true;
  if (event.altKey && (event.key === "ArrowRight" || event.key === "ArrowLeft")) return true;
  return false;
}

/**
 * Answers whether a keyboard event ends the switcher gesture: the Alt
 * release commits the selection, Escape cancels it.
 *
 * @param event the raw keyboard event.
 * @returns true when the gesture ends with this event.
 */
export function altgestureend(event: KeyboardEvent): boolean {
  if (event.key === "Alt") return true;
  return event.key === "Escape";
}

/**
 * Steps one index through the cycle with wrap-around in both directions.
 *
 * @param current the selected index (any integer — it wraps).
 * @param step the signed step (1 = next older window, -1 = back toward the
 * most recent one).
 * @param count the cycle length; a non-positive count answers 0.
 * @returns the next index, always inside `0..count-1`.
 */
export function nextaltindex(current: number, step: number, count: number): number {
  if (count <= 0) return 0;
  const moved = (((current + step) % count) + count) % count;
  return moved;
}

/**
 * Ranks the windows in the MRU order the switcher walks: the array order
 * of the shell window list already is the z order (last = focused), so the
 * reversed copy is the alt-tab order. Minimized windows stay in the cycle
 * (alt-tab restores them on commit, exactly like Windows).
 *
 * @param ids the window ids in z order (last = topmost).
 * @returns the same ids, most recently focused first.
 */
export function mruorder(ids: string[]): string[] {
  return [...ids].reverse();
}
