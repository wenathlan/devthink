/**
 * window.frame.tsx — the floating window of the shell: a Windows-grade frame
 * built on the measured recipes of the reference OS clones. The daedalOS
 * title bar (30px, 12px title, 45×30 flat caption areas with hairline
 * dividers and the classic close red), the focus-graded shadows with the
 * puter grayscale(80%) inactive head, eight os.js resize directions, the
 * null transition during drag/resize (data-moving) and the daedalOS
 * minimize physics — the window scales to 0.7 and glides into its dock
 * entry (measured with getBoundingClientRect, exactly the
 * useWindowTransitions technique) and glides back out of it on restore.
 * One window duration rules everything: 250ms cubic-bezier(0.85, 0.14,
 * 0.14, 0.85) on transform/opacity only; open is opacity 0 + scale .95 → 1,
 * close is the reverse. Windows stack inside the float band — z-index
 * values come from the parent shell, never above the bar band (50).
 */
import { useLayoutEffect, useRef, useState, type MouseEvent as ReactMouseEvent, type ReactNode } from "react";
import { Copy, Minus, PanelLeft, PanelRight, Square, X } from "lucide-react";

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
  /** the state to return to when the window is un-minimized from the dock */
  restoredState?: WindowState;
  z: number;
};

export const WINDOW_MIN_WIDTH = 320;
export const WINDOW_MIN_HEIGHT = 300;
/** the one window duration of this pass (the daedalOS/win11 curve) */
const WINDOW_TIMING = "250ms cubic-bezier(0.85, 0.14, 0.14, 0.85)";
/** the top strip (px) that turns a drag into a maximize */
const MAXIMIZE_EDGE = 10;
/** minimum visible px of a dragged window on each side */
const DRAG_VISIBLE = 96;
/** the os.js resize directions */
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

/** the dock entry a window flies to: its [data-dock-target] button, else the dock slab */
function dockTargetFor(id: string): Element | null {
  return document.querySelector(`[data-dock-target="${id}"]`) || document.querySelector(".shell-dock");
}

/** the translate+scale that collapses the window onto the dock entry center */
function flyTransform(frame: HTMLElement, target: Element): string {
  const from = frame.getBoundingClientRect();
  const to = target.getBoundingClientRect();
  const dx = Math.round(to.x + to.width / 2 - from.x - from.width / 2);
  const dy = Math.round(to.y + to.height / 2 - from.y - from.height / 2);
  return `translate(${dx}px, ${dy}px) scale(0.7)`;
}

export function WindowFrame({ win, active, tabs, onFocus, onUpdate, onClose, children }: WindowFrameProps) {
  const frameRef = useRef<HTMLElement | null>(null);
  /** a minimize/restore glide is in flight — blocks a second launch */
  const flyingRef = useRef(false);
  /** the exit animation is in flight — blocks a second close */
  const [closing, setClosing] = useState(false);
  /** the minimized state on the previous render — the restore-fly trigger */
  const minimizedBefore = useRef(win.state === "minimized");

  /** restore physics: the window re-appears collapsed on its dock entry and
   * glides back to its bounds (the daedalOS alignWithTaskbarEntry reversal) */
  useLayoutEffect(() => {
    const el = frameRef.current;
    const isMinimized = win.state === "minimized";
    const wasMinimized = minimizedBefore.current;
    minimizedBefore.current = isMinimized;
    if (!el || isMinimized || !wasMinimized || flyingRef.current || prefersReducedMotion()) return;
    const target = dockTargetFor(win.id);
    if (!target) return;
    el.dataset.flying = "true";
    el.style.transition = "none";
    el.style.transform = flyTransform(el, target);
    el.style.opacity = "0";
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        el.style.transition = `transform ${WINDOW_TIMING}, opacity ${WINDOW_TIMING}`;
        el.style.transform = "";
        el.style.opacity = "";
        window.setTimeout(() => {
          el.style.transition = "";
          delete el.dataset.flying;
          flyingRef.current = false;
        }, 270);
      });
    });
  }, [win.state, win.id]);

  /** starts a title-bar drag: restores maximized/snapped windows under the
   * cursor and maximizes when the pointer is released on the top edge; the
   * null-transition flag stays on until the pointer is released */
  function beginDrag(event: ReactMouseEvent) {
    if (event.button !== 0) return;
    if ((event.target as HTMLElement).closest("button, input")) return;
    onFocus(win.id);
    const el = frameRef.current;
    const floating = win.state !== "normal";
    const startRatio = floating ? event.clientX / Math.max(1, window.innerWidth) : 0;
    const startX = event.clientX;
    const startY = event.clientY;
    const originX = win.x;
    const originY = win.y;
    el?.setAttribute("data-moving", "true");

    const onMove = (move: MouseEvent) => {
      if (floating) {
        if (move.clientY <= MAXIMIZE_EDGE) return;
        const width = Math.max(WINDOW_MIN_WIDTH, Math.round(window.innerWidth * 0.62));
        const height = Math.max(WINDOW_MIN_HEIGHT, Math.round(window.innerHeight * 0.62));
        onUpdate(win.id, {
          state: "normal",
          width,
          height,
          x: Math.round(move.clientX - width * startRatio),
          y: Math.max(0, move.clientY - 18),
        });
        return;
      }
      onUpdate(win.id, {
        x: Math.min(Math.max(originX + move.clientX - startX, DRAG_VISIBLE - win.width), window.innerWidth - DRAG_VISIBLE),
        y: Math.min(Math.max(originY + move.clientY - startY, 0), window.innerHeight - DRAG_VISIBLE),
      });
    };
    const onUp = (up: MouseEvent) => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
      el?.removeAttribute("data-moving");
      if (!floating && up.clientY <= MAXIMIZE_EDGE) onUpdate(win.id, { state: "maximized" });
    };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  }

  /** os.js-grade resize: eight directions off the frame edges, minimum
   * 320×300, edges move under the cursor, null transition while moving */
  function beginResize(event: ReactMouseEvent, direction: string) {
    if (event.button !== 0) return;
    event.stopPropagation();
    event.preventDefault();
    if (win.state !== "normal") return;
    onFocus(win.id);
    const el = frameRef.current;
    el?.setAttribute("data-moving", "true");
    const startX = event.clientX;
    const startY = event.clientY;
    const origin = { x: win.x, y: win.y, width: win.width, height: win.height };
    const east = direction.includes("e");
    const west = direction.includes("w");
    const south = direction.includes("s");
    const north = direction.includes("n");

    const onMove = (move: MouseEvent) => {
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
      onUpdate(win.id, patch);
    };
    const onUp = () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
      el?.removeAttribute("data-moving");
    };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  }

  /** minimize physics: the window scales to 0.7, glides into its dock entry
   * and only then hides (reduced motion hides straight away) */
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
    el.dataset.flying = "true";
    el.style.transition = `transform ${WINDOW_TIMING}, opacity ${WINDOW_TIMING}`;
    el.style.transform = flyTransform(el, target);
    el.style.opacity = "0";
    const restoredState = win.state;
    window.setTimeout(() => {
      el.style.transition = "";
      el.style.transform = "";
      el.style.opacity = "";
      delete el.dataset.flying;
      flyingRef.current = false;
      onUpdate(win.id, { state: "minimized", restoredState });
    }, 260);
  }

  /** close physics: the reverse of the entrance (opacity 0 + scale .95) */
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

  const toggleMaximize = () => onUpdate(win.id, { state: win.state === "maximized" ? "normal" : "maximized" });
  const minimized = win.state === "minimized";
  const style =
    win.state === "normal"
      ? { left: win.x, top: win.y, width: win.width, height: win.height, zIndex: win.z }
      : { zIndex: win.z };

  return (
    <section
      ref={frameRef}
      className={`shell-window${active ? " is-active" : ""}`}
      data-state={win.state}
      data-min={minimized ? "true" : undefined}
      data-closing={closing ? "true" : undefined}
      style={style}
      aria-label={win.title}
      aria-hidden={minimized || undefined}
      onMouseDown={() => onFocus(win.id)}
    >
      {/* biome-ignore lint/a11y/noStaticElementInteractions: the title bar is the drag surface; the window controls inside it are real buttons */}
      <div className="shell-window__bar" onMouseDown={beginDrag} onDoubleClick={toggleMaximize}>
        {tabs ? (
          <div className="shell-window__tabs">{tabs}</div>
        ) : (
          <span className="shell-window__title">{win.title}</span>
        )}
        <div className="shell-window__controls">
          <div className="shell-window__snap">
            <button type="button" aria-label="Snap left" onClick={() => onUpdate(win.id, { state: "snapped-left" })}>
              <PanelLeft size={13} aria-hidden="true" />
            </button>
            <button type="button" aria-label="Snap right" onClick={() => onUpdate(win.id, { state: "snapped-right" })}>
              <PanelRight size={13} aria-hidden="true" />
            </button>
          </div>
          <button type="button" aria-label="Minimize" onClick={requestMinimize}>
            <Minus size={14} aria-hidden="true" />
          </button>
          <button
            type="button"
            aria-label={win.state === "maximized" ? "Restore" : "Maximize"}
            onClick={toggleMaximize}
          >
            {win.state === "maximized" ? (
              <Copy size={12} aria-hidden="true" />
            ) : (
              <Square size={12} aria-hidden="true" />
            )}
          </button>
          <button type="button" className="shell-window__close" aria-label="Close window" onClick={requestClose}>
            <X size={15} aria-hidden="true" />
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
              onMouseDown={(event) => beginResize(event, direction)}
              aria-hidden="true"
            />
          ))
        : null}
    </section>
  );
}
