/**
 * Shell.tsx — the ONE chrome of the theme: the APPLICATION WINDOW (the
 * FAM-APPS reform, riding the WINDOWS IDENTITY PASS and the family window
 * recipe of the cadria reference). One floating window over the Mica canvas,
 * opened at 250ms scale(.95 → 1) on the window curve
 * cubic-bezier(.85,.14,.14,.85), with the Fluent focused-window shadow,
 * 8px corners and a 48px graphite title bar (rgb(32 32 32 / 75%) +
 * saturate(3) blur(20px), constant in both themes) that is the drag
 * surface: pointer capture carries the window, the offset is clamped so
 * the bar never leaves the screen, a double click toggles maximize and the
 * drag never transitions (data-moving hard stop). The caption buttons are
 * the Fluent 44px grammar — minimize collapses the window into a restore
 * chip, maximize toggles the full-bleed state, close relaunches the
 * application (the seen flag of the intro is lifted and the flow returns
 * to /intro). The left rail carries the pages of the application with the
 * accent ladder on the active entry, and the rail foot gains the FAMILY
 * section — the sibling applications and the DevThink OS, resolved by
 * familyurl — above the theme flip. No taskbar, no start menu, no pins,
 * no tray, no desktop: the content zone owns the page surface. The window
 * component is a copy-per-deploy (the consolidation belongs to the future
 * @wenathlan/* package).
 */

import { Copy, LayoutDashboard, Minus, Moon, Square, Sun, X } from "lucide-react";
import {
  type CSSProperties,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
  type PointerEvent as ReactPointerEvent,
  useRef,
  useState,
} from "react";
import { Link, useLocation } from "wouter";
import { familyurl } from "../../familyurl";
import { resetIntro } from "../intro/intro";
import { BrandMark } from "./BrandMark";

/** the theme in memory: flips the data-theme attribute, stores nothing */
type ThemeName = "dark" | "light";

/** the theme in memory for the current document lifetime (dark default) */
let theme: ThemeName = "dark";

/**
 * Reads the theme currently applied in this document.
 *
 * @returns the active theme name.
 */
function currentTheme(): ThemeName {
  return theme;
}

/**
 * Applies a theme by flipping the document attribute; the css token
 * variant does the rest.
 *
 * @param next the theme to apply.
 */
function applyTheme(next: ThemeName): void {
  theme = next;
  document.documentElement.dataset.theme = next;
}

/**
 * Flips between the two variants and applies the result.
 *
 * @returns the theme now active.
 */
function toggleTheme(): ThemeName {
  const next: ThemeName = theme === "dark" ? "light" : "dark";
  applyTheme(next);
  return next;
}

/** the siblings of the family (the DevThink OS first, then the apps) —
 * every link opens in its own tab and every sibling links back */
const FAMILY = ["devthink", "cadria", "stealhead", "debonair", "argan", "saddle", "forge", "foundry", "getry"] as const;

/** the drag session of the title bar: pointer id, origin and base offset */
type DragTrack = {
  pointerId: number;
  originX: number;
  originY: number;
  baseX: number;
  baseY: number;
};

/** keeps the dragged title bar reachable: the offset never slides the bar
 * fully off screen, so the window can always be grabbed back. */
function clampDrag(x: number, y: number): { x: number; y: number } {
  const spanX = Math.max(window.innerWidth / 2 - 80, 0);
  const spanY = Math.max(window.innerHeight / 2 - 60, 0);
  return { x: Math.min(spanX, Math.max(-spanX, x)), y: Math.min(spanY, Math.max(-spanY, y)) };
}

/**
 * The theme flip of the rail foot: flips the in-memory theme, stores
 * nothing.
 *
 * @returns the toggle element.
 */
function ThemeToggle() {
  const [current, setCurrent] = useState<ThemeName>(currentTheme());
  return (
    <button type="button" className="win-theme" aria-label="toggle theme" onClick={() => setCurrent(toggleTheme())}>
      {current === "dark" ? <Sun size={14} aria-hidden="true" /> : <Moon size={14} aria-hidden="true" />}
      {current}
    </button>
  );
}

/**
 * The shared shell: the application window — title bar (brand, drag,
 * caption buttons), the page rail with the family foot and the content
 * zone — floating over the Mica stage.
 *
 * @param children the routed page.
 * @returns the window element.
 */
export function Shell({ children }: { children: ReactNode }) {
  const [location, navigate] = useLocation();
  const [maximized, setMaximized] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [drag, setDrag] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const trackRef = useRef<DragTrack | null>(null);

  /** maximizes over the backdrop or restores the windowed frame (the drag offset resets). */
  function toggleMaximize() {
    setDrag({ x: 0, y: 0 });
    setMaximized((value) => !value);
  }

  /** arms a drag when the pointer presses the empty bar (never the caption buttons). */
  function onTitlePointerDown(event: ReactPointerEvent<HTMLElement>) {
    if (maximized) return;
    if ((event.target as HTMLElement).closest("button, a, input")) return;
    trackRef.current = {
      pointerId: event.pointerId,
      originX: event.clientX,
      originY: event.clientY,
      baseX: drag.x,
      baseY: drag.y,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
    setDragging(true);
  }

  /** moves the window with the pointer while the session is armed. */
  function onTitlePointerMove(event: ReactPointerEvent<HTMLElement>) {
    const track = trackRef.current;
    if (!track || track.pointerId !== event.pointerId) return;
    setDrag(clampDrag(track.baseX + event.clientX - track.originX, track.baseY + event.clientY - track.originY));
  }

  /** releases the drag session. */
  function onTitlePointerUp(event: ReactPointerEvent<HTMLElement>) {
    const track = trackRef.current;
    if (!track || track.pointerId !== event.pointerId) return;
    trackRef.current = null;
    event.currentTarget.releasePointerCapture(event.pointerId);
    setDragging(false);
  }

  /** the Windows affordance: a double click on the empty bar toggles maximize. */
  function onTitleDoubleClick(event: ReactMouseEvent<HTMLElement>) {
    if ((event.target as HTMLElement).closest("button, a, input")) return;
    toggleMaximize();
  }

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
      <section
        className="win-window"
        data-max={maximized ? "true" : undefined}
        data-moving={dragging ? "true" : undefined}
        aria-label="vault window"
        style={{ "--win-x": `${drag.x}px`, "--win-y": `${drag.y}px` } as CSSProperties}
      >
        {/* biome-ignore lint/a11y/noStaticElementInteractions: the title bar is the drag surface; the window controls inside it are real buttons */}
        <header
          className="win-titlebar"
          data-dragging={dragging ? "true" : undefined}
          onPointerDown={onTitlePointerDown}
          onPointerMove={onTitlePointerMove}
          onPointerUp={onTitlePointerUp}
          onPointerCancel={onTitlePointerUp}
          onDoubleClick={onTitleDoubleClick}
        >
          <span className="win-title">
            <BrandMark size={18} />
            <strong>vault</strong>
            <span className="win-title__role">the family vault</span>
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
              onClick={toggleMaximize}
            >
              {maximized ? (
                <Copy size={12} strokeWidth={1.7} aria-hidden="true" />
              ) : (
                <Square size={11} strokeWidth={1.7} aria-hidden="true" />
              )}
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

        <div className="win-body">
          <nav className="win-rail" aria-label="Pages">
            <p className="win-rail__head" aria-hidden="true">
              pages
            </p>
            <Link
              href="/"
              className="win-rail__link"
              title="the staging surface of the vault"
              aria-label="home"
              aria-current={location === "/" ? "page" : undefined}
            >
              <LayoutDashboard size={16} strokeWidth={1.7} aria-hidden="true" />
              <span className="win-rail__label">home</span>
            </Link>
            <div className="win-rail__foot">
              <p className="win-fam__head" aria-hidden="true">
                family
              </p>
              <div className="win-fam">
                {FAMILY.map((slug) => (
                  <a
                    key={slug}
                    className="win-fam__link"
                    href={familyurl(slug)}
                    target="_blank"
                    rel="noreferrer"
                    title={`open ${slug} — the family answers both ways`}
                  >
                    <span className="win-fam__dot" aria-hidden="true" />
                    <span className="win-fam__name">{slug}</span>
                  </a>
                ))}
              </div>
              <ThemeToggle />
            </div>
          </nav>
          <div className="win-content">{children}</div>
        </div>
      </section>
    </div>
  );
}

export default Shell;
