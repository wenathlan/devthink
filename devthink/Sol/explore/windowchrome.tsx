/**
 * windowchrome.tsx — the window chrome of the landing, presented on the
 * window hover of the top edge: when the pointer touches the top border of
 * the viewport a thin Fluent bar slides in with the minimize/maximize/close
 * glyphs and fades away after ~1.2s without pointer movement (any movement
 * while it is visible keeps it alive). The bar is the Windows caption
 * grammar at the viewport edge: acrylic canvas fill, hairline bottom, 60ms
 * caption hovers, the close glyph riding the red. Presentational only — the
 * actions are the callbacks of the page (minimize collapses the landing
 * into a restore chip, maximize toggles the full-bleed frame, close returns
 * to the intro). Fully self-contained: theme utilities, no stylesheet rules.
 */

import {CopyRegular as Copy, SubtractRegular as Minus, StopRegular as Square, DismissRegular as X} from "@fluentui/react-icons";
import { useEffect, useRef, useState } from "react";
import { SolLogoMark } from "../panel/logo.tsx";

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

  const captionClass =
    "grid h-9 w-11 place-items-center text-ink-2 transition-colors duration-[60ms] hover:bg-[rgb(136_136_136_/_0.2)] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-(--color-focus) motion-reduce:transition-none";

  return (
    <div
      className={`fixed inset-x-0 top-0 z-[80] flex h-9 items-center gap-3 border-b border-hairline bg-canvas/80 px-3 backdrop-blur-xl backdrop-saturate-150 transition-[transform,opacity] duration-200 ease-fluent motion-reduce:transition-none ${
        visible ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-full opacity-0"
      }`}
      aria-hidden={!visible}
    >
      <span className="text-ink-2" aria-hidden="true">
        <SolLogoMark size={13} />
      </span>
      <span className="font-mono text-[11px] text-ink-2">explore — devthink</span>
      <span className="ml-auto flex items-center">
        <button type="button" tabIndex={visible ? 0 : -1} aria-label="Minimize the landing" onClick={onMinimize} className={captionClass}>
          <Minus fontSize={13} aria-hidden="true" />
        </button>
        <button
          type="button"
          tabIndex={visible ? 0 : -1}
          aria-label={maximized ? "Restore the landing" : "Maximize the landing"}
          onClick={onMaximize}
          className={captionClass}
        >
          {maximized ? <Copy fontSize={11} aria-hidden="true" /> : <Square fontSize={11} aria-hidden="true" />}
        </button>
        <button
          type="button"
          tabIndex={visible ? 0 : -1}
          aria-label="Close and return to the intro"
          onClick={onClose}
          className={`${captionClass} rounded-none hover:bg-[rgb(255_0_0_/_0.8)] hover:text-white`}
        >
          <X fontSize={14} aria-hidden="true" />
        </button>
      </span>
    </div>
  );
}
