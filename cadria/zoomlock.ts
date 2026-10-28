/**
 * zoomlock of cadria — pins the interface zoom at the boot 100% and refuses every user
 * zoom gesture. The owner order: the zoom stays fixed at 100% — no zoom
 * scrolling, no dancing interface, one stable render. The lock captures the
 * boot devicePixelRatio as the immutable 100% baseline; whenever the live
 * ratio drifts (ctrl+scroll, pinch, browser zoom, a display change) it
 * applies the exact inverse correction so the interface always renders as it
 * would at 100%. Chromium, Edge and Safari take the CSS `zoom` correction on
 * the document element; an engine without CSS `zoom` (Firefox) takes the
 * `transform: scale` fallback on the #root wrapper with the width and the
 * height compensated by `calc(100% / factor)` and `transform-origin: top
 * left`. The keyboard zoom shortcuts (ctrl/cmd + =/-/0), the ctrl wheel and
 * the touch pinch are prevented at the window level; only an Alt-modified
 * key escapes the block — the modifier the owner reserved for himself. The
 * html and the body carry `touch-action: pan-x pan-y` so panning and
 * scrolling survive while a pinch never starts. One install, one
 * responsibility: `zoomlocked()` reports the state, the default
 * `installzoomlock()` arms the lock and stays idempotent.
 */

/** The boot device pixel ratio — the immutable 100% baseline of the session. */
let baseline = 1;

/** Whether the lock already armed in this document (the idempotence flag). */
let installed = false;

/** The resolution media query the drift watcher currently rides. */
let resolution: MediaQueryList | null = null;

/** The drift epsilon: one real zoom step moves the ratio by 0.05 or more,
 * so float noise from the display compositor never trips a correction. */
const DRIFT = 0.01;

/** The keys the browser zoom shortcuts ride (ctrl/cmd held). */
const ZOOM_KEYS = new Set(["=", "+", "-", "_", "0"]);

/** The code names of the zoom shortcuts, so non-US layouts block too. */
const ZOOM_CODES = new Set([
  "Equal",
  "Minus",
  "Digit0",
  "Numpad0",
  "NumpadAdd",
  "NumpadSubtract",
]);

/** Reads the live device pixel ratio, answering 1 where the platform stays silent. */
function pixelRatio(): number {
  return typeof window === "undefined" ? 1 : window.devicePixelRatio || 1;
}

/** Answers whether the engine implements CSS `zoom` on a style declaration. */
function supportsZoom(): boolean {
  return (
    typeof CSS !== "undefined" &&
    typeof CSS.supports === "function" &&
    CSS.supports("zoom", "1")
  );
}

/** Rounds a correction factor to four decimals so the style strings stay clean. */
function factorOf(current: number): number {
  return Number((baseline / current).toFixed(4));
}

/** Drops every correction — the render returns to the untouched 100% layout. */
function clearcorrections(): void {
  document.documentElement.style.removeProperty("zoom");
  const shell = document.getElementById("root");
  if (shell) {
    shell.style.transform = "";
    shell.style.width = "";
    shell.style.height = "";
    shell.style.transformOrigin = "";
  }
}

/** Applies the inverse correction for the current drift:
 * CSS `zoom` on the document element where supported, the transform scale
 * on the #root wrapper with compensated width and height otherwise. */
function applycorrection(): void {
  const current = pixelRatio();
  if (Math.abs(current - baseline) <= DRIFT) {
    clearcorrections();
    return;
  }
  const factor = factorOf(current);
  if (supportsZoom()) {
    document.documentElement.style.zoom = String(factor);
    return;
  }
  const shell = document.getElementById("root");
  if (!shell) return;
  shell.style.transformOrigin = "top left";
  shell.style.transform = `scale(${factor})`;
  shell.style.width = `calc(100% / ${factor})`;
  shell.style.height = `calc(100% / ${factor})`;
}

/** Re-arms the resolution media query watcher: the query for the live ratio
 * stops matching exactly when the device pixel ratio changes again. */
function rearmresolution(): void {
  if (resolution) {
    if (typeof resolution.removeEventListener === "function") {
      resolution.removeEventListener("change", ondrift);
    } else if (typeof (resolution as unknown as { removeListener?: (cb: () => void) => void }).removeListener === "function") {
      (resolution as unknown as { removeListener: (cb: () => void) => void }).removeListener(ondrift);
    }
  }
  const next = window.matchMedia(`(resolution: ${pixelRatio()}dppx)`);
  if (typeof next.addEventListener === "function") next.addEventListener("change", ondrift);
  else if (typeof (next as unknown as { addListener?: (cb: () => void) => void }).addListener === "function") {
    (next as unknown as { addListener: (cb: () => void) => void }).addListener(ondrift);
  }
  resolution = next;
}

/** The drift callback: reapply the correction and re-arm the watcher. */
function ondrift(): void {
  applycorrection();
  rearmresolution();
}

/** The resize callback: a browser zoom relayouts the viewport, so the
 * correction rides the same event. */
function onresize(): void {
  applycorrection();
}

/** The keyboard gate: blocks ctrl/cmd zoom shortcuts, passes everything
 * else and always passes an Alt-modified key (the owner modifier). */
function onkeydown(event: KeyboardEvent): void {
  if (event.altKey) return;
  const zoomModifier = event.ctrlKey || event.metaKey;
  if (!zoomModifier) return;
  if (!ZOOM_KEYS.has(event.key) && !ZOOM_CODES.has(event.code)) return;
  event.preventDefault();
}

/** The wheel gate: blocks the ctrl wheel zoom (and the mac trackpad pinch,
 * which reports a wheel event with ctrlKey set) without touching the scroll. */
function onwheel(event: WheelEvent): void {
  if (!event.ctrlKey) return;
  event.preventDefault();
}

/** The gesture gate: prevents the iOS Safari pinch zoom events. */
function ongesture(event: Event): void {
  event.preventDefault();
}

/** The touch gate: prevents every multi-touch move — a pinch needs two
 * touches, a single-finger scroll stays free. */
function ontouchmove(event: TouchEvent): void {
  if (event.touches.length > 1) event.preventDefault();
}

/** Injects the touch-action rule once: pan survives, pinch never starts. */
function injecttouchcss(): void {
  if (document.getElementById("zoomlock-touch-style")) return;
  const sheet = document.createElement("style");
  sheet.id = "zoomlock-touch-style";
  sheet.textContent = "html, body { touch-action: pan-x pan-y; }";
  document.head.append(sheet);
}

/** Answers whether the zoom lock armed in this document. */
export function zoomlocked(): boolean {
  return installed && typeof window !== "undefined";
}

/** Installs the 100% zoom lock: captures the boot baseline, injects the
 * touch-action rule, wires the drift watcher and every gesture gate and
 * applies the first correction. Idempotent — a second call is a no-op that
 * answers the current state. */
export default function installzoomlock(): boolean {
  if (installed || typeof window === "undefined" || typeof document === "undefined") {
    return zoomlocked();
  }
  baseline = pixelRatio();
  injecttouchcss();
  window.addEventListener("resize", onresize);
  rearmresolution();
  window.addEventListener("keydown", onkeydown, true);
  window.addEventListener("wheel", onwheel, { passive: false, capture: true });
  window.addEventListener("gesturestart", ongesture);
  window.addEventListener("gesturechange", ongesture);
  window.addEventListener("touchmove", ontouchmove, { passive: false });
  applycorrection();
  installed = true;
  return true;
}
