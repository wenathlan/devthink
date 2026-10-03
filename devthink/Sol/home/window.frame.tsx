/**
 * window.frame.tsx — the floating window of the shell: a Windows-grade frame
 * with a draggable title bar (tabs or title), side snapping, drag-to-top
 * maximize, double-click maximize and the classic min/max/close controls
 * (the close control wears the #e81123 hover). Windows stack inside the
 * float band — z-index values come from the parent shell, never above the
 * bar band (50). Motion stays on transform/opacity and micro timings.
 */
import type { MouseEvent as ReactMouseEvent, ReactNode } from "react";
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

export const WINDOW_MIN_WIDTH = 420;
export const WINDOW_MIN_HEIGHT = 300;
/** the top strip (px) that turns a drag into a maximize */
const MAXIMIZE_EDGE = 10;
/** minimum visible px of a dragged window on each side */
const DRAG_VISIBLE = 96;

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

export function WindowFrame({ win, active, tabs, onFocus, onUpdate, onClose, children }: WindowFrameProps) {
  /** starts a title-bar drag: restores maximized/snapped windows under the
   * cursor and maximizes when the pointer is released on the top edge */
  function beginDrag(event: ReactMouseEvent) {
    if (event.button !== 0) return;
    if ((event.target as HTMLElement).closest("button, input")) return;
    onFocus(win.id);
    const floating = win.state !== "normal";
    const startRatio = floating ? event.clientX / Math.max(1, window.innerWidth) : 0;
    const startX = event.clientX;
    const startY = event.clientY;
    const originX = win.x;
    const originY = win.y;

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
      if (!floating && up.clientY <= MAXIMIZE_EDGE) onUpdate(win.id, { state: "maximized" });
    };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  }

  /** bottom-right resize handle, normal state only */
  function beginResize(event: ReactMouseEvent) {
    if (event.button !== 0) return;
    event.stopPropagation();
    event.preventDefault();
    if (win.state !== "normal") return;
    onFocus(win.id);
    const startX = event.clientX;
    const startY = event.clientY;
    const originWidth = win.width;
    const originHeight = win.height;
    const onMove = (move: MouseEvent) => {
      onUpdate(win.id, {
        width: Math.max(WINDOW_MIN_WIDTH, originWidth + move.clientX - startX),
        height: Math.max(WINDOW_MIN_HEIGHT, originHeight + move.clientY - startY),
      });
    };
    const onUp = () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  }

  const toggleMaximize = () => onUpdate(win.id, { state: win.state === "maximized" ? "normal" : "maximized" });
  const minimized = win.state === "minimized";
  const style =
    win.state === "normal"
      ? { left: win.x, top: win.y, width: win.width, height: win.height, zIndex: win.z }
      : { zIndex: win.z };

  return (
    <section
      className={`shell-window${active ? " is-active" : ""}`}
      data-state={win.state}
      data-min={minimized ? "true" : undefined}
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
          <button
            type="button"
            aria-label="Minimize"
            onClick={() => onUpdate(win.id, { state: "minimized", restoredState: win.state })}
          >
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
          <button type="button" className="shell-window__close" aria-label="Close window" onClick={() => onClose(win.id)}>
            <X size={15} aria-hidden="true" />
          </button>
        </div>
      </div>
      <div className="shell-window__body">{children}</div>
      {win.state === "normal" ? <div className="shell-window__resize" onMouseDown={beginResize} aria-hidden="true" /> : null}
    </section>
  );
}
