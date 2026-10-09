/**
 * Shell.tsx — the ONE chrome of the theme, the chrome of an APPLICATION
 * WINDOW (the FAM-APPS reform, polished on wave D1): a floating window over
 * the Mica canvas — a 48px graphite title bar (rgb(32 32 32 / 75%) +
 * saturate(3) blur(20px), constant in both themes) carrying the drawn forge
 * mark, the name and the honest role on the left as the drag surface
 * (pointer capture, clamp, double-click = maximize) and the Fluent caption
 * buttons on the right (44px targets: minimize collapses the window into a
 * restore chip, maximize fills the backdrop, close relaunches the flow at
 * /intro); a left rail (216px) with the page entries of the window — the
 * active one under the accent ladder — and, in the rail foot, the family
 * section linking every sibling application (target blank, one identity
 * dot each) beside the theme flip. The content zone owns the page surface.
 * The window opens at 250ms scale(.95 → 1) on the window curve
 * cubic-bezier(.85,.14,.14,.85) with the focused-window shadow and 8px
 * corners; while dragging the offsets ride --win-x/--win-y and every
 * transition stops. The OS grammar is gone: no taskbar, no start menu, no
 * pins, no tray, no desktop. The window component is a copy-per-deploy
 * (the consolidation belongs to the future @wenathlan/* package). Campaign
 * v3 mark discipline: the title-bar mark is the ONE mark of the platform
 * pages — it rests on the landing (data-landing), where the hero lockup
 * owns it.
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
import { currentTheme, type Theme, toggleTheme } from "../../theme";
import { resetIntro } from "../intro/intro";
import { BrandMark } from "./BrandMark";

/** one entry of the window rail: a page surface of the app with its glyph. */
export type RailApp = {
  href: string;
  label: string;
  detail: string;
  icon: typeof LayoutDashboard;
};

/** the pages the application window hosts, one rail entry each — the real
 * surface set of the forge, the apex home first. exported for the flow
 * components beside this folder. */
export const RAIL_APPS: readonly RailApp[] = [
  { href: "/", label: "home", detail: "the runner floor of the family", icon: LayoutDashboard },
];

/** the sibling applications of the family, the OS first — the rail foot
 * links every one of them back (the family redirects both ways). */
const FAMILY = ["devthink", "cadria", "stealthhead", "debonair", "argan", "saddle", "foundry", "vault", "getry"] as const;

/** the hand-over route of the close caption: closing the window restarts
 * the application at the intro (the relaunch metaphor). */
const RESTART_ROUTE = "/intro";

/** one pointer session over the title bar: where the press started and the
 * offset the window carried when it did. */
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
 * nothing (a cold load starts from the dark Mica again).
 *
 * @returns the toggle element.
 */
function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(currentTheme());
  return (
    <button type="button" className="win-theme" aria-label="toggle theme" onClick={() => setTheme(toggleTheme())}>
      {theme === "dark" ? <Sun size={14} aria-hidden="true" /> : <Moon size={14} aria-hidden="true" />}
      {theme}
    </button>
  );
}

/** the shared shell: the application window (title bar + rail + content
 * zone) over the Mica stage */
export function Shell({ children }: { children: ReactNode }) {
  const [location, navigate] = useLocation();
  const [maximized, setMaximized] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [drag, setDrag] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const trackRef = useRef<DragTrack | null>(null);

  /** maximizes over the backdrop or restores the windowed frame (the drag
   * offset resets, the window re-centers). */
  function toggleMaximize() {
    setDrag({ x: 0, y: 0 });
    setMaximized((value) => !value);
  }

  /** arms a drag when the pointer presses the empty bar (never the caption
   * buttons or a link). */
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

  /** rides the pointer while a drag session is armed. */
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

  /** the Windows affordance: a double click on the empty bar toggles
   * maximize. */
  function onTitleDoubleClick(event: ReactMouseEvent<HTMLElement>) {
    if ((event.target as HTMLElement).closest("button, a, input")) return;
    toggleMaximize();
  }

  /** close = relaunch: the intro is allowed to play again and the flow
   * restarts at /intro */
  const closeWindow = () => {
    resetIntro();
    navigate(RESTART_ROUTE, { replace: true });
  };

  // the active rail entry: the bare path owns home, every other page owns its route
  const isActive = (href: string): boolean =>
    href === "/" ? location === "/" : location === href || location.startsWith(`${href}/`);

  // the minimized window collapses into the restore chip over the Mica stage
  if (minimized) {
    return (
      <div className="win-root">
        <button
          type="button"
          className="win-chip"
          aria-label="Restore the forge window"
          onClick={() => setMinimized(false)}
        >
          <BrandMark size={16} />
          <span>forge</span>
        </button>
      </div>
    );
  }

  return (
    <div className="win-root" data-max={maximized ? "true" : undefined}>
      <section
        className="win-window"
        data-landing={location === "/" ? "true" : undefined}
        data-max={maximized ? "true" : undefined}
        data-moving={dragging ? "true" : undefined}
        aria-label="forge window"
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
            <strong>forge</strong>
            <span className="win-title__role">the family forge</span>
          </span>
          <div className="win-controls">
            <button
              type="button"
              className="win-control"
              aria-label="Minimize forge"
              onClick={() => setMinimized(true)}
            >
              <Minus size={14} strokeWidth={1.7} aria-hidden="true" />
            </button>
            <button
              type="button"
              className="win-control"
              aria-label={maximized ? "Restore forge" : "Maximize forge"}
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
              aria-label="Close forge"
              onClick={closeWindow}
            >
              <X size={14} strokeWidth={1.7} aria-hidden="true" />
            </button>
          </div>
        </header>
        <div className="win-body">
          <nav className="win-rail" aria-label="Pages">
            <p className="win-railhead" aria-hidden="true">
              pages
            </p>
            {RAIL_APPS.map((app) => {
              const Icon = app.icon;
              return (
                <Link
                  key={app.href}
                  href={app.href}
                  className="win-raillink"
                  title={app.detail}
                  aria-label={app.label}
                  aria-current={isActive(app.href) ? "page" : undefined}
                >
                  <Icon size={16} strokeWidth={1.7} aria-hidden="true" />
                  <span className="win-raillabel">{app.label}</span>
                </Link>
              );
            })}
            <div className="win-railfoot">
              <p className="win-family__head" aria-hidden="true">
                family
              </p>
              <div className="win-family">
                {FAMILY.map((slug) => (
                  <a
                    key={slug}
                    className="win-family__link"
                    href={familyurl(slug)}
                    target="_blank"
                    rel="noreferrer"
                    title={`open ${slug} — a family application`}
                  >
                    <span className="win-family__dot" data-app={slug} aria-hidden="true" />
                    <span className="win-family__name">{slug}</span>
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
