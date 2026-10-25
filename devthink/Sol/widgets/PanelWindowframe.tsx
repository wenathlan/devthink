/**
 * windowframe.tsx — the floating window of the shell: a Windows-grade frame
 * on the measured recipes of the reference OS clones, redesigned to the
 * campaign-V3 "Obsidian Kinetic HUD" chrome (R1-a).
 *
 * Titlebar: 30px acrylic (blur 20px saturate(140%), owner law 28-30px)
 * carrying the ONE lockup of the window zone — the official mark, the
 * DevThink name and the role line (the window title as a lowercase mono
 * context) — logo discipline: exactly one brand voice per zone, never
 * doubled by the wallpaper hero (which recedes while a window is open) or
 * the taskbar. The caption buttons are the 46×30 Fluent hover zones; close
 * hovers the classic red via the --color-close/--color-close-deep tokens
 * with the white glyph. The chrome paint (frame wash, titlebar, captions,
 * resize strips, snap flyout) lives in Sol/sol.css as named
 * classes — the elements carry the semantic class only. The session tab
 * strip (tabs.tsx) rides beside the lockup, Edge-style, and never carries
 * a second mark.
 *
 * Motion: one window duration, 250ms, on transform/opacity only. Open is
 * opacity 0 + scale .95 → 1 over 250ms on the Fluent window curve
 * (windowIn); close is the reverse (windowOut, data-closing); minimize is
 * the daedalOS flight in two CSS-owned phases — the press (the window lifts
 * off the desktop, 200ms spring) then the glide into its taskbar pin: the
 * component measures the pin with getBoundingClientRect, writes the delta
 * into the inline `--fly-x`/`--fly-y` custom properties and flips the
 * `data-flying` class, and the stylesheet paints the translate+scale flight
 * from those properties (restore glides back out of the pin the same way).
 * Drag/resize keep the null-transition grammar (data-moving) and the eight
 * os.js resize directions; windows stack inside the float band — z-index
 * values come from the parent shell, never above the bar band (50).
 *
 * Snap layouts: dwelling ~350ms on the maximize caption opens the win11
 * .snap-flyout — six layout templates as mini-glyphs; hovering a zone marks
 * it data-active="true" (the CSS grades the hover in the signal color) and
 * clicking snaps the window into that zone (the halves land on the
 * snapped-left/right states, the corners and stacked column zones land on
 * free floating bounds). Escape, blur or mouse-leave closes it. Dragging a
 * window within 12px of a side edge previews the half with a ghost zone and
 * snaps on release; the top edge keeps the maximize gesture. Every snap
 * records the pre-snap floating bounds on `float`, so the next drag of a
 * snapped window restores them. The flyout and the ghost are body portals on
 * the float band: they never touch the window's 250ms transition grammar and
 * never rise above the bar band. The flyout paint (mica, borders, signal
 * zones) lives in the shelldelta stylesheet — the inline styles here are
 * layout only.
 */
import {CopyRegular as Copy, SubtractRegular as Minus, PanelLeftRegular as PanelLeft, PanelRightRegular as PanelRight, StopRegular as Square, DismissRegular as X} from "@fluentui/react-icons";
import {
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
  type PointerEvent as ReactPointerEvent,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState } from "react";
import { createPortal } from "react-dom";
import { osText } from "../../oslabels.ts";
import { SolLogoMark } from "./PanelLogo.tsx";

export type WindowState = "normal" | "maximized" | "minimized" | "snapped-left" | "snapped-right";

export type WindowSnapshot = {
  id: string;
  title: string;
  /** floating bounds — kept while maximized/snapped so restore returns here */
  x: number;
  y: number;
  width: number;
  height: number;
  state: WindowState;
  /** the floating bounds a snapped/maximized window returns to on restore */
  float?: { x: number; y: number; width: number; height: number };
  /** the state to return to when the window is un-minimized from the dock */
  restoredState?: WindowState;
  z: number;
};

/** aero snap zones: halves map onto the snapped states, corners and the
 * stacked column zones land on free floating bounds; the drag preview adds
 * the "max" zone (the top strip = maximize) as a translucent overlay
 * before the commit */
export type SnapZone = "left" | "right" | "tl" | "tr" | "bl" | "br" | "free";

type SnapCell = { zone: SnapZone; col: number; row: number; cols: number; rows: number };

type SnapTemplate = {
  id: string;
  label: string;
  cols: number;
  rows: number;
  cells: SnapCell[];
};

const snap = (zone: SnapZone, col: number, row: number, cols = 1, rows = 1): SnapCell => ({
  zone,
  col,
  row,
  cols,
  rows });

/** the six win11 layout templates of the flyout, top-left to bottom-right
 * (the labels ride the os label table; the geometry stays code) */
const SNAP_TEMPLATES: SnapTemplate[] = [
  { id: "halves", label: osText("win.layout.halves"), cols: 2, rows: 1, cells: [snap("left", 1, 1), snap("right", 2, 1)] },
  {
    id: "thirds-left",
    label: osText("win.layout.thirdsLeft"),
    cols: 2,
    rows: 3,
    cells: [snap("free", 1, 1), snap("free", 1, 2), snap("free", 1, 3), snap("right", 2, 1, 1, 3)] },
  {
    id: "thirds-right",
    label: osText("win.layout.thirdsRight"),
    cols: 2,
    rows: 3,
    cells: [snap("left", 1, 1, 1, 3), snap("free", 2, 1), snap("free", 2, 2), snap("free", 2, 3)] },
  {
    id: "quarters",
    label: osText("win.layout.quarters"),
    cols: 2,
    rows: 2,
    cells: [snap("tl", 1, 1), snap("tr", 2, 1), snap("bl", 1, 2), snap("br", 2, 2)] },
  {
    id: "focus-left",
    label: osText("win.layout.focusLeft"),
    cols: 2,
    rows: 2,
    cells: [snap("free", 1, 1), snap("free", 1, 2), snap("right", 2, 1, 1, 2)] },
  {
    id: "focus-right",
    label: osText("win.layout.focusRight"),
    cols: 2,
    rows: 2,
    cells: [snap("left", 1, 1, 1, 2), snap("free", 2, 1), snap("free", 2, 2)] },
];

/** the aria-label of every snap cell (lowercase mono grammar) — the words
 * ride the os label table, quoted by zone id */
const ZONE_WORDS: Record<SnapZone, string> = {
  left: osText("win.zone.left"),
  right: osText("win.zone.right"),
  tl: osText("win.zone.tl"),
  tr: osText("win.zone.tr"),
  bl: osText("win.zone.bl"),
  br: osText("win.zone.br"),
  free: osText("win.zone.free") };

export const WINDOW_MIN_WIDTH = 320;
export const WINDOW_MIN_HEIGHT = 300;
/** the top strip (px) that turns a drag into a maximize */
const MAXIMIZE_EDGE = 10;
/** the side strips (px) that turn a drag into an aero half snap */
const SNAP_EDGE = 12;
/** minimum visible px of a dragged window on each side */
const DRAG_VISIBLE = 96;
/** the snap layouts dwell on the maximize caption before the flyout opens */
const FLYOUT_DWELL = 350;
/** grace while the pointer travels from the caption into the flyout */
const FLYOUT_GRACE = 160;
/** 3 glyph columns of 76px + 2×8px gaps + 2×10px padding */
const FLYOUT_WIDTH = 264;
/** the os.js resize directions — the strip geometry per direction lives in
 * the shelldelta stylesheet (.shell-window__rz[data-direction]) */
const RESIZE_DIRECTIONS = ["n", "s", "e", "w", "ne", "nw", "se", "sw"] as const;

type WindowFrameProps = {
  win: WindowSnapshot;
  active: boolean;
  /** optional tab strip rendered inside the title bar */
  tabs?: ReactNode;
  onFocus: (id: string) => void;
  onUpdate: (id: string, patch: Partial<Omit<WindowSnapshot, "id">>) => void;
  onClose: (id: string) => void;
  children: ReactNode;
};

/** true when the OS-level reduced-motion preference is on (motion opt-out) */
function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** the taskbar entry a window flies to: its [data-dock-target] pin, else the
 * first pin of the bar (the bar is the only dock — the taskbar owns the
 * bottom edge) */
function dockTargetFor(id: string): Element | null {
  return document.querySelector(`[data-dock-target="${id}"]`) || document.querySelector("[data-dock-target]");
}

/** writes the center-to-center delta of the flight into the inline
 * `--fly-x`/`--fly-y` custom properties — the stylesheet owns the actual
 * translate+scale paint through the `[data-flying="glide"]` class */
function setFlyProps(frame: HTMLElement, target: Element): void {
  const from = frame.getBoundingClientRect();
  const to = target.getBoundingClientRect();
  frame.style.setProperty("--fly-x", `${Math.round(to.x + to.width / 2 - from.x - from.width / 2)}px`);
  frame.style.setProperty("--fly-y", `${Math.round(to.y + to.height / 2 - from.y - from.height / 2)}px`);
}

/** clears the flight custom properties (the pose leaves with the class) */
function clearFlyProps(frame: HTMLElement): void {
  frame.style.removeProperty("--fly-x");
  frame.style.removeProperty("--fly-y");
}

/** the desktop area a window lives in: the offset parent (the shell
 * desktop, below the navbar band), falling back to the viewport */
function desktopAreaOf(el: HTMLElement): { left: number; top: number; width: number; height: number } {
  const parent = el.offsetParent;
  if (parent instanceof HTMLElement) {
    const rect = parent.getBoundingClientRect();
    return { left: rect.left, top: rect.top, width: rect.width, height: rect.height };
  }
  return { left: 0, top: 0, width: window.innerWidth, height: window.innerHeight };
}

export function WindowFrame({ win, active, tabs, onFocus, onUpdate, onClose, children }: WindowFrameProps) {
  const frameRef = useRef<HTMLElement | null>(null);
  /** a minimize/restore glide is in flight — blocks a second launch */
  const flyingRef = useRef(false);
  /** the exit animation is in flight — blocks a second close */
  const [closing, setClosing] = useState(false);
  /** the minimized state on the previous render — the restore-fly trigger */
  const minimizedBefore = useRef(win.state === "minimized");
  /** the snap layouts flyout: dwell state, anchor and timers */
  const [flyout, setFlyout] = useState(false);
  const [flyoutAt, setFlyoutAt] = useState({ left: 24, top: 40 });
  const maxBtnRef = useRef<HTMLButtonElement | null>(null);
  const flyoutRef = useRef<HTMLDivElement | null>(null);
  const dwellRef = useRef<number | null>(null);
  const graceRef = useRef<number | null>(null);
  /** the aero edge ghost: which zone is previewed and its fixed rect */
  const [ghost, setGhost] = useState<"left" | "right" | "max" | null>(null);
  const ghostRef = useRef<"left" | "right" | "max" | null>(null);
  const ghostRectRef = useRef<{ left: number; top: number; width: number; height: number } | null>(null);
  /** the first press on an inactive window focuses it without click-through
   * (the Windows rule: the click activates the window, never the control) */
  const [swallowed, setSwallowed] = useState(false);

  /** restore physics: the window re-appears collapsed on its taskbar pin
   * (the `data-flying="glide"` pose reads the measured `--fly-x`/`--fly-y`)
   * and glides back to its bounds — the daedalOS alignWithTaskbarEntry
   * reversal, painted by the stylesheet. The settle attributes stay on the
   * frame after the glide (they read as the identity pose and keep the
   * mounting animation from replaying on a restored window). */
  useLayoutEffect(() => {
    const el = frameRef.current;
    const isMinimized = win.state === "minimized";
    const wasMinimized = minimizedBefore.current;
    minimizedBefore.current = isMinimized;
    if (!el || isMinimized || !wasMinimized || flyingRef.current || prefersReducedMotion()) return;
    const target = dockTargetFor(win.id);
    if (!target) return;
    flyingRef.current = true;
    el.style.transition = "none";
    setFlyProps(el, target);
    el.dataset.flying = "glide";
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        el.style.transition = "";
        el.dataset.flySettle = "true";
        window.setTimeout(() => {
          clearFlyProps(el);
          // the flight ends here: the poses must leave with the props or
          // [data-flying] keeps the window pointer-dead forever (the
          // restored window answered no click — the caixa de texto bug)
          delete el.dataset.flying;
          delete el.dataset.flySettle;
          flyingRef.current = false;
        }, 270);
      });
    });
  }, [win.state, win.id]);

  const closeFlyout = useCallback(() => {
    if (dwellRef.current !== null) {
      window.clearTimeout(dwellRef.current);
      dwellRef.current = null;
    }
    if (graceRef.current !== null) {
      window.clearTimeout(graceRef.current);
      graceRef.current = null;
    }
    setFlyout(false);
  }, []);

  const openFlyout = useCallback(() => {
    dwellRef.current = null;
    const rect = maxBtnRef.current?.getBoundingClientRect();
    const left = rect
      ? Math.min(Math.max(8, Math.round(rect.right) - FLYOUT_WIDTH), Math.round(window.innerWidth) - FLYOUT_WIDTH - 8)
      : 24;
    const top = rect ? Math.round(rect.bottom) + 6 : 40;
    setFlyoutAt({ left, top });
    setFlyout(true);
  }, []);

  const enterCaption = useCallback(() => {
    if (graceRef.current !== null) {
      window.clearTimeout(graceRef.current);
      graceRef.current = null;
    }
    if (dwellRef.current !== null || flyoutRef.current) return;
    dwellRef.current = window.setTimeout(openFlyout, FLYOUT_DWELL);
  }, [openFlyout]);

  const leaveCaption = useCallback(() => {
    if (dwellRef.current !== null) {
      window.clearTimeout(dwellRef.current);
      dwellRef.current = null;
    }
    if (!flyoutRef.current) return;
    if (graceRef.current !== null) window.clearTimeout(graceRef.current);
    graceRef.current = window.setTimeout(closeFlyout, FLYOUT_GRACE);
  }, [closeFlyout]);

  const enterFlyout = useCallback(() => {
    if (graceRef.current !== null) {
      window.clearTimeout(graceRef.current);
      graceRef.current = null;
    }
  }, []);

  // escape closes the flyout wherever the focus sits
  useEffect(() => {
    if (!flyout) return undefined;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeFlyout();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [closeFlyout, flyout]);

  // the dwell and grace timers never outlive the frame
  useEffect(
    () => () => {
      if (dwellRef.current !== null) window.clearTimeout(dwellRef.current);
      if (graceRef.current !== null) window.clearTimeout(graceRef.current);
    },
    [],
  );

  /** the aero edge ghost: flips the previewed zone (an aero half or the
   * full maximize area) and measures its fixed rect once per flip (never
   * per pointer move) */
  function showGhost(zone: "left" | "right" | "max" | null) {
    if (ghostRef.current === zone) return;
    ghostRef.current = zone;
    if (zone && frameRef.current) {
      const area = desktopAreaOf(frameRef.current);
      if (zone === "max") {
        ghostRectRef.current = { left: area.left, top: area.top, width: area.width, height: area.height };
      } else {
        const half = Math.round(area.width / 2);
        ghostRectRef.current = {
          left: zone === "left" ? area.left : area.left + area.width - half,
          top: area.top,
          width: half,
          height: area.height };
      }
    } else {
      ghostRectRef.current = null;
    }
    setGhost(zone);
  }

  /** starts a title-bar drag on the pointer capture: the pointer is
   * captured by the frame and the move applies at most once per animation
   * frame (the raw rAF loop — no motion library); maximized/snapped windows
   * restore under the cursor at their pre-snap floating bounds, the top
   * strip previews the full maximize ghost, the side strips preview the
   * aero half ghosts and the release commits (the null-transition flag
   * stays on until the pointer is up) */
  function beginDrag(event: ReactPointerEvent) {
    if (event.button !== 0) return;
    if ((event.target as HTMLElement).closest("button, input")) return;
    onFocus(win.id);
    closeFlyout();
    const el = frameRef.current;
    if (!el) return;
    const floating = win.state !== "normal";
    const rect = el.getBoundingClientRect();
    const grabRatio = rect.width > 0 ? Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width)) : 0.5;
    const grabOffsetY = event.clientY - rect.top;
    const startX = event.clientX;
    const startY = event.clientY;
    const origin = { x: win.x, y: win.y, width: win.width, height: win.height };
    /** a quarter/stacked snap keeps its pre-snap bounds here — one drag consumes them */
    const floatRestore = floating ? null : (win.float ?? null);
    let consumed = false;
    el.setAttribute("data-moving", "true");
    try {
      el.setPointerCapture(event.pointerId);
    } catch {
      /* the capture is best effort — the frame listeners below still hold */
    }

    const zoneAt = (move: PointerEvent): "left" | "right" | "max" | null => {
      if (move.clientY <= MAXIMIZE_EDGE) return "max";
      if (move.clientX <= SNAP_EDGE) return "left";
      if (move.clientX >= window.innerWidth - SNAP_EDGE) return "right";
      return null;
    };

    const applyMove = (move: PointerEvent) => {
      if (floating) {
        if (move.clientY <= MAXIMIZE_EDGE) {
          showGhost("max");
          return;
        }
        const dims = win.float || {
          width: Math.max(WINDOW_MIN_WIDTH, Math.round(window.innerWidth * 0.62)),
          height: Math.max(WINDOW_MIN_HEIGHT, Math.round(window.innerHeight * 0.62)) };
        onUpdate(win.id, {
          state: "normal",
          width: dims.width,
          height: dims.height,
          x: Math.round(move.clientX - dims.width * grabRatio),
          y: Math.max(0, Math.round(move.clientY - grabOffsetY)) });
        showGhost(zoneAt(move));
        return;
      }
      const patch: Partial<Omit<WindowSnapshot, "id">> = {
        x: Math.min(
          Math.max(origin.x + move.clientX - startX, DRAG_VISIBLE - origin.width),
          window.innerWidth - DRAG_VISIBLE,
        ),
        y: Math.min(Math.max(origin.y + move.clientY - startY, 0), window.innerHeight - DRAG_VISIBLE) };
      if (floatRestore && !consumed) {
        consumed = true;
        patch.width = floatRestore.width;
        patch.height = floatRestore.height;
        patch.float = undefined;
      }
      onUpdate(win.id, patch);
      showGhost(zoneAt(move));
    };

    /** the latest pointer pose, flushed once per animation frame */
    let pending: PointerEvent | null = null;
    let frame = 0;

    const onMove = (move: PointerEvent) => {
      pending = move;
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        const latest = pending;
        pending = null;
        if (latest) applyMove(latest);
      });
    };

    const detach = (pointerId: number) => {
      if (frame) {
        window.cancelAnimationFrame(frame);
        frame = 0;
      }
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerup", onUp);
      el.removeEventListener("pointercancel", onCancel);
      try {
        if (el.hasPointerCapture(pointerId)) el.releasePointerCapture(pointerId);
      } catch {
        /* the capture may already be gone — the listeners are detached anyway */
      }
      el.removeAttribute("data-moving");
    };

    const flush = () => {
      if (!pending) return;
      const latest = pending;
      pending = null;
      applyMove(latest);
    };

    const onUp = (up: PointerEvent) => {
      detach(up.pointerId);
      flush();
      showGhost(null);
      const zone = zoneAt(up);
      if (zone && zone !== "max" && up.clientY > MAXIMIZE_EDGE) {
        const state = zone === "left" ? "snapped-left" : "snapped-right";
        if (floating) {
          onUpdate(win.id, { state });
          return;
        }
        const float = consumed && floatRestore ? floatRestore : origin;
        onUpdate(win.id, { state, float: { ...float } });
        return;
      }
      if (!floating && up.clientY <= MAXIMIZE_EDGE) onUpdate(win.id, { state: "maximized", float: { ...origin } });
    };

    const onCancel = (cancel: PointerEvent) => {
      detach(cancel.pointerId);
      showGhost(null);
    };

    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerup", onUp);
    el.addEventListener("pointercancel", onCancel);
  }

  /** os.js-grade resize on the pointer capture: eight directions off the
   * frame edges, minimum 320×300, edges move under the cursor at most once
   * per animation frame (the raw rAF loop), null transition while moving; a
   * manual resize defines new floating bounds and retires the snap memory */
  function beginResize(event: ReactPointerEvent, direction: string) {
    if (event.button !== 0) return;
    event.stopPropagation();
    event.preventDefault();
    if (win.state !== "normal") return;
    onFocus(win.id);
    closeFlyout();
    const el = frameRef.current;
    const handle = event.currentTarget;
    el?.setAttribute("data-moving", "true");
    try {
      handle.setPointerCapture(event.pointerId);
    } catch {
      /* the capture is best effort — the handle listeners below still hold */
    }
    const startX = event.clientX;
    const startY = event.clientY;
    const origin = { x: win.x, y: win.y, width: win.width, height: win.height };
    const east = direction.includes("e");
    const west = direction.includes("w");
    const south = direction.includes("s");
    const north = direction.includes("n");

    const applyMove = (move: PointerEvent) => {
      const patch: Partial<Omit<WindowSnapshot, "id">> = {};
      if (east) patch.width = Math.max(WINDOW_MIN_WIDTH, origin.width + (move.clientX - startX));
      if (west) {
        const width = Math.max(WINDOW_MIN_WIDTH, origin.width - (move.clientX - startX));
        patch.width = width;
        patch.x = origin.x + (origin.width - width);
      }
      if (south) patch.height = Math.max(WINDOW_MIN_HEIGHT, origin.height + (move.clientY - startY));
      if (north) {
        const height = Math.max(WINDOW_MIN_HEIGHT, origin.height - (move.clientY - startY));
        patch.height = height;
        patch.y = origin.y + (origin.height - height);
      }
      if (win.float) patch.float = undefined;
      onUpdate(win.id, patch);
    };

    let pending: PointerEvent | null = null;
    let frame = 0;

    const onMove = (move: PointerEvent) => {
      pending = move;
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        const latest = pending;
        pending = null;
        if (latest) applyMove(latest);
      });
    };

    const detach = (pointerId: number) => {
      if (frame) {
        window.cancelAnimationFrame(frame);
        frame = 0;
      }
      handle.removeEventListener("pointermove", onMove as EventListener);
      handle.removeEventListener("pointerup", onUp as EventListener);
      handle.removeEventListener("pointercancel", onCancel as EventListener);
      try {
        if (handle.hasPointerCapture(pointerId)) handle.releasePointerCapture(pointerId);
      } catch {
        /* the capture may already be gone — the listeners are detached anyway */
      }
      el?.removeAttribute("data-moving");
    };

    const onUp = (up: PointerEvent) => {
      detach(up.pointerId);
      if (!pending) return;
      const latest = pending;
      pending = null;
      applyMove(latest);
    };

    const onCancel = (cancel: PointerEvent) => {
      detach(cancel.pointerId);
    };

    handle.addEventListener("pointermove", onMove as EventListener);
    handle.addEventListener("pointerup", onUp as EventListener);
    handle.addEventListener("pointercancel", onCancel as EventListener);
  }

  /** minimize physics: the two-phase daedalOS flight, painted by the
   * stylesheet from the `data-flying` class and the measured `--fly-x`/
   * `--fly-y` — phase 1 the press (the window lifts off the desktop, 200ms
   * spring), phase 2 the glide into its taskbar pin (the 250ms Fluent
   * window curve) and only then it hides (reduced motion hides straight
   * away) */
  function requestMinimize() {
    const el = frameRef.current;
    const commit = () => onUpdate(win.id, { state: "minimized", restoredState: win.state });
    if (!el || flyingRef.current || prefersReducedMotion()) {
      commit();
      return;
    }
    const target = dockTargetFor(win.id);
    if (!target) {
      commit();
      return;
    }
    flyingRef.current = true;
    // a settled restore pose must leave before the flight starts
    delete el.dataset.flySettle;
    // phase 1 — the press: the window leaves the desktop plane (200ms)
    el.dataset.flying = "press";
    window.setTimeout(() => {
      // phase 2 — the glide into the pin: measure, write the flight props,
      // flip the class (the stylesheet carries the transition)
      setFlyProps(el, target);
      el.dataset.flying = "glide";
    }, 200);
    const restoredState = win.state;
    window.setTimeout(() => {
      delete el.dataset.flying;
      clearFlyProps(el);
      flyingRef.current = false;
      onUpdate(win.id, { state: "minimized", restoredState });
    }, 470);
  }

  /** close physics: the reverse of the entrance (opacity 0 + scale .96) */
  function requestClose() {
    if (closing) return;
    const el = frameRef.current;
    if (!el || prefersReducedMotion()) {
      onClose(win.id);
      return;
    }
    setClosing(true);
    window.setTimeout(() => onClose(win.id), 260);
  }

  /** the floating bounds of a normal window, captured when it leaves the
   * floating band for a maximized or snapped state */
  function floatCapture(): Partial<WindowSnapshot> {
    return win.state === "normal" ? { float: { x: win.x, y: win.y, width: win.width, height: win.height } } : {};
  }

  const toggleMaximize = () =>
    onUpdate(
      win.id,
      win.state === "maximized" ? { state: "normal", float: undefined } : { ...floatCapture(), state: "maximized" },
    );

  const snapHalf = (state: "snapped-left" | "snapped-right") => onUpdate(win.id, { ...floatCapture(), state });

  /** double-click on the bar toggles maximize/restore — never from the
   * caption buttons or the tab strip */
  function onBarDoubleClick(event: ReactMouseEvent) {
    if ((event.target as HTMLElement).closest("button, input")) return;
    toggleMaximize();
  }

  /** zone → bounds mapping: the halves land on the snapped states, the
   * corners and stacked column zones land on free floating bounds of the
   * desktop area (never under the 320×300 minimum) */
  function applyZone(template: SnapTemplate, cell: SnapCell) {
    closeFlyout();
    const el = frameRef.current;
    if (!el) return;
    const keep = floatCapture();
    if (cell.zone === "left") {
      onUpdate(win.id, { ...keep, state: "snapped-left" });
      return;
    }
    if (cell.zone === "right") {
      onUpdate(win.id, { ...keep, state: "snapped-right" });
      return;
    }
    const area = desktopAreaOf(el);
    const width = Math.max(WINDOW_MIN_WIDTH, Math.round((cell.cols / template.cols) * area.width));
    const height = Math.max(WINDOW_MIN_HEIGHT, Math.round((cell.rows / template.rows) * area.height));
    const x = Math.min(
      Math.round(area.left + ((cell.col - 1) / template.cols) * area.width),
      Math.round(area.left + area.width) - width,
    );
    const y = Math.min(
      Math.round(area.top + ((cell.row - 1) / template.rows) * area.height),
      Math.round(area.top + area.height) - height,
    );
    onUpdate(win.id, { ...keep, state: "normal", x, y, width, height });
  }

  const minimized = win.state === "minimized";
  const style =
    win.state === "normal"
      ? { left: win.x, top: win.y, width: win.width, height: win.height, zIndex: win.z }
      : { zIndex: win.z };
  const ghostRect = ghost ? ghostRectRef.current : null;

  return (
    <section
      ref={frameRef}
      className={`shell-window ${active ? "is-active" : ""}`}
      data-state={win.state}
      data-min={minimized ? "true" : undefined}
      data-closing={closing ? "true" : undefined}
      style={style}
      aria-label={win.title}
      aria-hidden={minimized || undefined}
      onPointerDownCapture={() => {
        // the Windows activation rule: the first press on an inactive
        // window only focuses it — the click never reaches the control
        if (!active) setSwallowed(true);
        else setSwallowed(false);
        onFocus(win.id);
      }}
      onClickCapture={(event) => {
        if (!swallowed) return;
        event.preventDefault();
        event.stopPropagation();
        setSwallowed(false);
      }}
    >
      {/* biome-ignore lint/a11y/noStaticElementInteractions: the title bar is the drag surface; the window controls inside it are real buttons */}
      <div className="shell-window__bar" onPointerDown={beginDrag} onDoubleClick={onBarDoubleClick}>
        {/* the ONE lockup of the window zone (logo discipline): the official
            mark, the DevThink name and the role line — the tab strip beside it
            never carries a second mark */}
        <span className="shell-window__lockup">
          <span className="shell-window__mark" aria-hidden="true">
            <SolLogoMark size={16} />
          </span>
          <strong className="shell-window__app">{osText("win.lockup")}</strong>
          <span className="shell-window__role">{win.title}</span>
        </span>
        {tabs ? <div className="shell-window__tabs">{tabs}</div> : null}
        <div className="shell-window__controls">
          <div className="shell-window__snap">
            <button
              type="button"
              aria-label={osText("win.snap.left.aria")}
              className="shell-window__snapbtn"
              onClick={() => snapHalf("snapped-left")}
            >
              <PanelLeft fontSize={13} aria-hidden="true" />
            </button>
            <button
              type="button"
              aria-label={osText("win.snap.right.aria")}
              className="shell-window__snapbtn"
              onClick={() => snapHalf("snapped-right")}
            >
              <PanelRight fontSize={13} aria-hidden="true" />
            </button>
          </div>
          <button type="button" aria-label={osText("win.caption.minimize")} className="shell-window__caption" onClick={requestMinimize}>
            <Minus fontSize={14} aria-hidden="true" />
          </button>
          <button
            ref={maxBtnRef}
            type="button"
            aria-label={win.state === "maximized" ? osText("win.caption.restore") : osText("win.caption.maximize")}
            aria-haspopup="dialog"
            aria-expanded={flyout || undefined}
            className="shell-window__caption"
            onClick={() => {
              closeFlyout();
              toggleMaximize();
            }}
            onMouseEnter={enterCaption}
            onMouseLeave={leaveCaption}
            onFocus={enterCaption}
            onBlur={(event) => {
              const next = event.relatedTarget;
              if (next instanceof Node && flyoutRef.current?.contains(next)) return;
              leaveCaption();
            }}
          >
            {win.state === "maximized" ? (
              <Copy fontSize={12} aria-hidden="true" />
            ) : (
              <Square fontSize={12} aria-hidden="true" />
            )}
          </button>
          <button type="button" className="shell-window__close" aria-label={osText("win.caption.close")} onClick={requestClose}>
            <X fontSize={15} aria-hidden="true" />
          </button>
        </div>
      </div>
      <div className="shell-window__body">{children}</div>
      {win.state === "normal"
        ? RESIZE_DIRECTIONS.map((direction) => (
            <div
              key={direction}
              className="shell-window__rz"
              data-direction={direction}
              onPointerDown={(event) => beginResize(event, direction)}
              aria-hidden="true"
            />
          ))
        : null}
      {/* the snap layouts flyout: a body portal on the float band — it never
          steals the window's 250ms transition grammar and never rises above
          the bar band; the acrylic panel paint rides the design-system class */}
      {flyout && !minimized
        ? createPortal(
            <div
              ref={flyoutRef}
              className="acrylic-menu snap-flyout"
              role="dialog"
              aria-label={osText("win.snap.layouts.aria")}
              data-reduced={prefersReducedMotion() ? "true" : undefined}
              style={{
                position: "fixed",
                left: flyoutAt.left,
                top: flyoutAt.top,
                zIndex: "var(--z-float)",
                gridTemplateColumns: "repeat(3, 76px)" }}
              onMouseEnter={enterFlyout}
              onMouseLeave={leaveCaption}
              onBlur={(event) => {
                const next = event.relatedTarget;
                if (next instanceof Node && event.currentTarget.contains(next)) return;
                closeFlyout();
              }}
            >
              {SNAP_TEMPLATES.map((template) => (
                /* biome-ignore lint/a11y/noStaticElementInteractions: hover-only preview highlight; the clickable zones are the button cells inside */
                <div
                  key={template.id}
                  className="snap-flyout__layout"
                  data-layout={template.id}
                  title={template.label}
                  style={{
                    display: "grid",
                    gridTemplateColumns: `repeat(${template.cols}, 1fr)`,
                    gridTemplateRows: `repeat(${template.rows}, 1fr)`,
                    gap: "2px",
                    width: "76px",
                    height: "54px",
                    padding: "3px" }}
                  onMouseEnter={(event) => {
                    event.currentTarget.dataset.active = "true";
                  }}
                  onMouseLeave={(event) => {
                    event.currentTarget.removeAttribute("data-active");
                  }}
                >
                  {template.cells.map((cell) => (
                    <button
                      key={`${cell.col}:${cell.row}`}
                      type="button"
                      className="snap-flyout__cell"
                      aria-label={ZONE_WORDS[cell.zone]}
                      style={{
                        gridColumn: `${cell.col} / span ${cell.cols}`,
                        gridRow: `${cell.row} / span ${cell.rows}` }}
                      onMouseEnter={(event) => {
                        event.currentTarget.dataset.active = "true";
                      }}
                      onMouseLeave={(event) => {
                        event.currentTarget.removeAttribute("data-active");
                      }}
                      onClick={() => applyZone(template, cell)}
                    />
                  ))}
                </div>
              ))}
            </div>,
            document.body,
          )
        : null}
      {/* the aero edge ghost: the half the drag would snap into (fixed,
          inert, the zone wash — never a button) */}
      {ghost && ghostRect
        ? createPortal(
            <div
              className="snap-ghost"
              data-active="true"
              aria-hidden="true"
              style={{
                position: "fixed",
                left: ghostRect.left,
                top: ghostRect.top,
                width: `${ghostRect.width}px`,
                height: `${ghostRect.height}px`,
                zIndex: "var(--z-float)",
                pointerEvents: "none" }}
            />,
            document.body,
          )
        : null}
    </section>
  );
}
