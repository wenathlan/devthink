/**
 * window.chrome.tsx — the window chrome of the landing, presented on the
 * window hover of the top edge: when the pointer touches the top border of
 * the viewport a thin Fluent bar slides in with the minimize/maximize/close
 * glyphs and fades away after ~1.2s without pointer movement (any movement
 * while it is visible keeps it alive). Presentational only — the actions are
 * the callbacks of the page (minimize collapses the landing into a restore
 * chip, maximize toggles the full-bleed frame, close returns to the intro).
 */
import { useEffect, useRef, useState } from "react";
import { Copy, Minus, Square, X } from "lucide-react";
import { SolLogoMark } from "../panel/logo";

/** the top strip (px) that summons the chrome */
const HIT_PX = 6;
/** the idle time (ms) before the chrome hides itself again */
const IDLE_MS = 1200;

type WindowEdgeChromeProps = {
  /** the live maximized state (the restore glyph follows it) */
  maximized: boolean;
  onMinimize: () => void;
  onMaximize: () => void;
  onClose: () => void;
};

export function WindowEdgeChrome({ maximized, onMinimize, onMaximize, onClose }: WindowEdgeChromeProps) {
  const [visible, setVisible] = useState(false);
  const hideTimer = useRef<number | null>(null);

  useEffect(() => {
    const armHide = () => {
      if (hideTimer.current !== null) window.clearTimeout(hideTimer.current);
      hideTimer.current = window.setTimeout(() => setVisible(false), IDLE_MS);
    };
    const onMove = (event: PointerEvent) => {
      if (event.clientY <= HIT_PX) setVisible(true);
      armHide();
    };
    window.addEventListener("pointermove", onMove);
    return () => {
      window.removeEventListener("pointermove", onMove);
      if (hideTimer.current !== null) window.clearTimeout(hideTimer.current);
    };
  }, []);

  return (
    <div className={visible ? "dt-edgechrome is-visible" : "dt-edgechrome"} aria-hidden={!visible}>
      <span className="dt-edgechrome__brand" aria-hidden="true">
        <SolLogoMark size={13} />
      </span>
      <span className="dt-edgechrome__title">explore — devthink</span>
      <span className="dt-edgechrome__glyphs">
        <button type="button" tabIndex={visible ? 0 : -1} aria-label="Minimize the landing" onClick={onMinimize}>
          <Minus size={13} aria-hidden="true" />
        </button>
        <button
          type="button"
          tabIndex={visible ? 0 : -1}
          aria-label={maximized ? "Restore the landing" : "Maximize the landing"}
          onClick={onMaximize}
        >
          {maximized ? <Copy size={11} aria-hidden="true" /> : <Square size={11} aria-hidden="true" />}
        </button>
        <button type="button" tabIndex={visible ? 0 : -1} aria-label="Close and return to the intro" onClick={onClose}>
          <X size={14} aria-hidden="true" />
        </button>
      </span>
    </div>
  );
}
