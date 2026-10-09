/**
 * Shell.tsx — the ONE chrome of the theme, now the chrome of an APPLICATION
 * WINDOW (the FAM-APPS reform, riding the WINDOWS IDENTITY PASS): the
 * Windows 11 app frame — a floating window over the Mica canvas, opened at
 * 250ms scale(.95 → 1) on the window curve cubic-bezier(.85,.14,.14,.85) —
 * with the Fluent focused-window shadow (0 32px 64px rgba(0,0,0,.24) +
 * 0 0 8px rgba(0,0,0,.2)), 8px corners and a 40px graphite title bar
 * (rgb(32 32 32 / 75%) + saturate(3) blur(20px), constant in both themes)
 * carrying the drawn vault mark, the name and the honest role on the left
 * and the Fluent caption buttons on the right: minimize collapses the window
 * into a restore chip, maximize toggles the full-bleed r0 state and close
 * relaunches the application (the seen flag of the intro is lifted and the
 * flow returns to /intro). The OS grammar is gone: no taskbar, no start
 * menu, no pins, no tray, no desktop — the content zone owns the page
 * surface. The window component is a copy-per-deploy (the consolidation
 * belongs to the future @wenathlan/* package).
 */

import { Minus, Square, X } from "lucide-react";
import { type ReactNode, useState } from "react";
import { useLocation } from "wouter";
import { resetIntro } from "../intro/intro";
import { BrandMark } from "./BrandMark";

/** the shared shell: the application window (title bar + content zone) over
 * the Mica stage */
export function Shell({ children }: { children: ReactNode }) {
  const [, navigate] = useLocation();
  const [maximized, setMaximized] = useState(false);
  const [minimized, setMinimized] = useState(false);

  /** close = relaunch: the intro is allowed to play again and the flow
   * restarts at /intro */
  const closeWindow = () => {
    resetIntro();
    navigate("/intro", { replace: true });
  };

  // the minimized window collapses into the restore chip over the Mica stage
  if (minimized) {
    return (
      <div className="win-root">
        <button
          type="button"
          className="win-chip"
          aria-label="Restore the vault window"
          onClick={() => setMinimized(false)}
        >
          <BrandMark size={16} />
          <span>vault</span>
        </button>
      </div>
    );
  }

  return (
    <div className="win-root" data-max={maximized ? "true" : undefined}>
      <section className="win-window" data-max={maximized ? "true" : undefined} aria-label="vault window">
        <header className="win-titlebar">
          <span className="win-title">
            <BrandMark size={18} />
            <strong>vault</strong>
            <span className="win-title__role">guards</span>
          </span>
          <div className="win-controls">
            <button
              type="button"
              className="win-control"
              aria-label="Minimize vault"
              onClick={() => setMinimized(true)}
            >
              <Minus size={14} strokeWidth={1.7} aria-hidden="true" />
            </button>
            <button
              type="button"
              className="win-control"
              aria-label={maximized ? "Restore vault" : "Maximize vault"}
              onClick={() => setMaximized((value) => !value)}
            >
              <Square size={11} strokeWidth={1.7} aria-hidden="true" />
            </button>
            <button
              type="button"
              className="win-control win-control--close"
              aria-label="Close vault"
              onClick={closeWindow}
            >
              <X size={14} strokeWidth={1.7} aria-hidden="true" />
            </button>
          </div>
        </header>
        <div className="win-content">{children}</div>
      </section>
    </div>
  );
}

export default Shell;
