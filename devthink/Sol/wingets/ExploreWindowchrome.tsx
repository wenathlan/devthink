/**
 * windowchrome.tsx — the window chrome of the landing, presented on the
 * window hover of the top edge: when the pointer touches the top border of
 * the window a thin Fluent bar slides in with the minimize/maximize/close
 * glyphs and fades away after ~1.2s without pointer movement (any movement
 * while it is visible keeps it alive). The bar is the Windows caption
 * grammar of the house windows — and it tracks the window it captions:
 * the windowed mode pins the bar to the frame box explore.tsx mounts (the
 * 12px gutter, the 1400px max-width), never to the viewport, so the
 * caption row — the close glyph riding the very right edge — stays inside
 * the window at every resize (the x-overflow the explore resize carried
 * dies here); the maximized mode spans the viewport as before. Acrylic
 * canvas fill, hairline bottom, 100ms caption hovers, the close glyph
 * riding the red, the z ladder riding --z-bar. Presentational only — the
 * actions are the callbacks of the page (minimize collapses the landing
 * into a restore chip, maximize toggles the full-bleed frame, close returns
 * to the intro). Fully self-contained: theme utilities, no stylesheet rules.
 */

import {CopyRegular as Copy, SubtractRegular as Minus, StopRegular as Square, DismissRegular as X} from "@fluentui/react-icons";
import { useEffect, useRef, useState } from "react";
import { osText } from "../../oslabels.ts";
import { SolLogoMark } from "./PanelLogo.tsx";

/** the top strip (px) that summons the chrome */
const HIT_PX = 6;
/** the windowed frame's gutter (px) — the p-3 geometry explore.tsx mounts */
const WINDOW_GUTTER_PX = 12;
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
      // the reveal zone follows the window border: the maximized top edge
      // rides the viewport, the windowed top edge rides the frame gutter.
      if (event.clientY <= HIT_PX + (maximized ? 0 : WINDOW_GUTTER_PX)) setVisible(true);
      armHide();
    };
    window.addEventListener("pointermove", onMove);
    return () => {
      window.removeEventListener("pointermove", onMove);
      if (hideTimer.current !== null) window.clearTimeout(hideTimer.current);
    };
  }, [maximized]);

  /** the shared caption grammar: the caption cell on the doctrine band
   * (--win-titlebar-h) with the 46px Fluent width, the visible
   * focus ring on the windows focus token (--win-focus, #4cc2ff dark /
   * #0067c0 light — the owner law of the caption family; the neutral
   * --color-focus ink never rides a window chrome) — the hover fill rides
   * each button's own class so the close red never fights a competing
   * hover utility in the compiled sheet */
  const captionBase =
    "grid h-(--win-titlebar-h) w-[46px] place-items-center text-ink-2 transition-colors duration-100 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-(--win-focus) motion-reduce:transition-none";
  const captionIdle = `${captionBase} hover:bg-(--win-hover)`;

  return (
    <div
      className={`fixed z-(--z-bar) flex h-(--win-titlebar-h) items-center gap-3 border-b border-hairline acrylic-bar pl-3.5 pr-0 transition-[transform,opacity] duration-200 ease-fluent motion-reduce:transition-none ${
        maximized ? "inset-x-0 top-0" : "top-3 left-[max(12px,calc(50%_-_700px))] right-[max(12px,calc(50%_-_700px))]"
      } ${visible ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-full opacity-0"}`}
      aria-hidden={!visible}
    >
      <span className="text-ink-2" aria-hidden="true">
        <SolLogoMark size={13} />
      </span>
      <span className="min-w-0 max-w-[30ch] overflow-hidden text-ellipsis whitespace-nowrap font-mono text-[11px] text-ink-2">{osText("explore.window.title")}</span>
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
          className={`${captionBase} rounded-(--win-pill) hover:bg-(--color-close) hover:text-white active:bg-(--color-close-deep) active:text-white`}
        >
          <X fontSize={14} aria-hidden="true" />
        </button>
      </span>
    </div>
  );
}
