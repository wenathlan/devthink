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
import { osText } from "../../../oslabels.ts";
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

  /** the shared caption grammar: the 36px caption cell with the visible
   * focus ring — the hover fill rides each button's own class so the close
   * red never fights a competing hover utility in the compiled sheet */
  const captionBase =
    "grid h-9 w-11 place-items-center text-ink-2 transition-colors duration-[60ms] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-(--color-focus) motion-reduce:transition-none";
  const captionIdle = `${captionBase} hover:bg-[rgb(136_136_136_/_0.2)]`;

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
      <span className="font-mono text-[11px] text-ink-2">{osText("explore.window.title")}</span>
      <span className="ml-auto flex items-center">
        <button type="button" tabIndex={visible ? 0 : -1} aria-label={osText("explore.window.minimize")} onClick={onMinimize} className={captionIdle}>
          <Minus fontSize={13} aria-hidden="true" />
        </button>
        <button
          type="button"
          tabIndex={visible ? 0 : -1}
          aria-label={maximized ? osText("explore.window.restore") : osText("explore.window.maximize")}
          onClick={onMaximize}
          className={captionIdle}
        >
          {maximized ? <Copy fontSize={11} aria-hidden="true" /> : <Square fontSize={11} aria-hidden="true" />}
        </button>
        <button
          type="button"
          tabIndex={visible ? 0 : -1}
          aria-label={osText("explore.window.close")}
          onClick={onClose}
          className={`${captionBase} rounded-none hover:bg-(--color-close) hover:text-white active:bg-(--color-close-deep) active:text-white`}
        >
          <X fontSize={14} aria-hidden="true" />
        </button>
      </span>
    </div>
  );
}
