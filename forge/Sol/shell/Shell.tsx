/**
 * Shell.tsx — the ONE chrome of the theme, the chrome of an APPLICATION
 * WINDOW (the FAM-APPS reform, rebased on the trylle canvas with the Windows
 * hands): a floating window over the deep canvas — a 48px acrylic title bar
 * (noise grain + saturate(3) blur(20px), constant in both themes) carrying
 * the drawn forge mark, the name and the honest role on the left as the drag
 * surface (pointer capture, clamp, double-click = maximize) and the Fluent
 * caption buttons on the right (44px targets, the r4 faces: minimize
 * collapses the window into a restore chip, maximize fills the backdrop,
 * close relaunches the flow at /intro); a 48px pin rail at the left — 38×38
 * r4 icon pins with the Windows press hand (scale .7), the dtPopIntro bounce,
 * the state ladder under the active pin (0 closed → 6px open → 12px lime)
 * and the name in an acrylic tooltip — and, in the rail foot, the family
 * section (one identity dot per sibling, target blank) above the theme flip.
 * The eight real resize handles ring the frame (pointer capture, clamped to
 * the viewport); the window opens at 250ms scale(.95 → 1) on the window
 * curve cubic-bezier(.85,.14,.14,.85) with the focused-window shadow and 8px
 * corners; while dragging the offsets ride --win-x/--win-y and every
 * transition stops. The seen state of the flow never regresses — closing the
 * window is the explicit relaunch metaphor and replays the opening on
 * purpose. The window component is a copy-per-deploy (the consolidation
 * belongs to the future @wenathlan/* package). Campaign v3 mark discipline:
 * the title-bar mark is the ONE mark of the platform pages — it rests on the
 * landing (data-landing), where the hero lockup owns it.
 */

import {
  CopyRegular,
  DismissRegular,
  HomeRegular,
  ListRegular,
  MaximizeRegular,
  PulseRegular,
  SubtractRegular,
  WeatherMoonRegular,
  WeatherSunnyRegular,
  WindowConsoleRegular,
} from "@fluentui/react-icons";
import {
  type CSSProperties,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
  type PointerEvent as ReactPointerEvent,
  useRef,
  useState,
} from "react";
import { Link, useLocation } from "wouter";
import { FAMILY_SLUGS, familyAccentOf } from "../../family";
import { familyurl } from "../../familyurl";
import { currentTheme, type Theme, toggleTheme } from "../../theme";
import { BrandMark } from "../widgets/shell.brandmark.tsx";

/** one entry of the window rail: a page surface of the app with its glyph. */
export type RailApp = {
  href: string;
  label: string;
  detail: string;
  icon: typeof HomeRegular;
};

/** the pages the application window hosts, one rail pin each — the real
 * surface set of the forge: the landing first, then the three platform
 * pages of the runner floor. exported for the flow components beside this
 * folder. */
export const RAIL_APPS: readonly RailApp[] = [
  { href: "/", label: "home", detail: "the landing of the forge", icon: HomeRegular },
  { href: "/runs", label: "runs", detail: "the runner fleets and their health", icon: PulseRegular },
  { href: "/queue", label: "queue", detail: "the execution queue and its priorities", icon: ListRegular },
  { href: "/logs", label: "logs", detail: "the seeded replay of a run log", icon: WindowConsoleRegular },
];

/** the hand-over route of the close caption: closing the window restarts
 * the application at the intro (the relaunch metaphor — the seen flags of
 * the flow never regress, the replay is the explicit choice). */
const RESTART_ROUTE = "/intro";

/** the clamp of the resizable window frame (the handle law) */
const MIN_W = 520;
const MIN_H = 400;

/** one pointer session over the title bar: where the press started and the
 * offset the window carried when it did. */
type DragTrack = {
  pointerId: number;
  originX: number;
  originY: number;
  baseX: number;
  baseY: number;
};

/** one pointer session over a resize handle: the direction (n/s/e/w and the
 * corners) and the frame size the drag started from. */
type ResizeTrack = {
  pointerId: number;
  dir: string;
  originX: number;
  originY: number;
  baseW: number;
  baseH: number;
};

/** keeps the dragged title bar reachable: the offset never slides the bar
 * fully off screen, so the window can always be grabbed back. */
function clampDrag(x: number, y: number): { x: number; y: number } {
  const spanX = Math.max(window.innerWidth / 2 - 80, 0);
  const spanY = Math.max(window.innerHeight / 2 - 60, 0);
  return { x: Math.min(spanX, Math.max(-spanX, x)), y: Math.min(spanY, Math.max(-spanY, y)) };
}

/**
 * Keeps a resized frame on screen: the width and height stay inside the
 * viewport (with a margin) and above the minimum usable window.
 *
 * @param width the drafted width.
 * @param height the drafted height.
 * @returns the clamped size.
 */
function clampSize(width: number, height: number): { w: number; h: number } {
  const w = Math.min(window.innerWidth - 24, Math.max(MIN_W, width));
  const h = Math.min(window.innerHeight - 24, Math.max(MIN_H, height));
  return { w, h };
}

/**
 * The theme flip of the rail foot: flips the in-memory theme, stores
 * nothing (a cold load starts from the dark canvas again).
 *
 * @returns the toggle element.
 */
function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(currentTheme());
  return (
    <button
      type="button"
      className="win-theme"
      data-tip="toggle theme"
      aria-label="toggle theme"
      onClick={() => setTheme(toggleTheme())}
    >
      {theme === "dark" ? (
        <WeatherSunnyRegular fontSize={16} aria-hidden="true" />
      ) : (
        <WeatherMoonRegular fontSize={16} aria-hidden="true" />
      )}
    </button>
  );
}

/** the shared shell: the application window (title bar + pin rail + content
 * zone) over the deep canvas */
export function Shell({ children }: { children: ReactNode }) {
  // the embedded contract: inside the os power clip the app rides the host
  // window chrome — the routed stage renders bare, full-bleed in the frame
  const framed = (() => {
    try {
      return window.self !== window.top;
    } catch {
      return true;
    }
  })();

  const [location, navigate] = useLocation();
  const [maximized, setMaximized] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [drag, setDrag] = useState({ x: 0, y: 0 });
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);
  const [dragging, setDragging] = useState(false);
  const [resizing, setResizing] = useState(false);
  const frameRef = useRef<HTMLElement | null>(null);
  const trackRef = useRef<DragTrack | null>(null);
  const resizeRef = useRef<ResizeTrack | null>(null);

  /** maximizes over the backdrop or restores the windowed frame (the drag
   * offset and the manual size reset, the window re-centers). */
  function toggleMaximize() {
    setDrag({ x: 0, y: 0 });
    setSize(null);
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

  /** arms a resize on the pressed handle (the direction rides data-dir). */
  function onHandlePointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    const handle = (event.target as HTMLElement).closest<HTMLElement>("[data-dir]");
    if (!handle || maximized) return;
    const rect = frameRef.current?.getBoundingClientRect();
    if (!rect) return;
    resizeRef.current = {
      pointerId: event.pointerId,
      dir: handle.dataset.dir ?? "",
      originX: event.clientX,
      originY: event.clientY,
      baseW: rect.width,
      baseH: rect.height,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
    setResizing(true);
  }

  /** rides the pointer while a resize session is armed (the edges grow the
   * frame, the west/north edges mirror the delta). */
  function onHandlePointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    const track = resizeRef.current;
    if (!track || track.pointerId !== event.pointerId) return;
    const dx = event.clientX - track.originX;
    const dy = event.clientY - track.originY;
    let width = track.baseW;
    let height = track.baseH;
    if (track.dir.includes("e")) width = track.baseW + dx;
    if (track.dir.includes("w")) width = track.baseW - dx;
    if (track.dir.includes("s")) height = track.baseH + dy;
    if (track.dir.includes("n")) height = track.baseH - dy;
    setSize(clampSize(width, height));
  }

  /** releases the resize session. */
  function onHandlePointerUp(event: ReactPointerEvent<HTMLDivElement>) {
    const track = resizeRef.current;
    if (!track || track.pointerId !== event.pointerId) return;
    resizeRef.current = null;
    event.currentTarget.releasePointerCapture(event.pointerId);
    setResizing(false);
  }

  /** close = relaunch: the flow restarts at the intro on purpose (the seen
   * flags never regress) */
  const closeWindow = () => {
    navigate(RESTART_ROUTE, { replace: true });
  };

  // the active rail entry: the bare path owns home, every other page owns its route
  const isActive = (href: string): boolean =>
    href === "/" ? location === "/" : location === href || location.startsWith(`${href}/`);

  // the manual frame size applies while windowed; maximize owns the viewport
  const frameStyle = {
    "--win-x": `${drag.x}px`,
    "--win-y": `${drag.y}px`,
    ...(!maximized && size ? { width: `${size.w}px`, height: `${size.h}px` } : {}),
  } as CSSProperties;

  // the minimized window collapses into the restore chip over the deep canvas
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

  // the embedded pass renders before the chrome: one window, one frame
  if (framed) return <main className="shell shell--embedded">{children}</main>;

  return (
    <div className="win-root" data-max={maximized ? "true" : undefined}>
      <section
        ref={frameRef}
        className="win-window"
        data-landing={location === "/" ? "true" : undefined}
        data-max={maximized ? "true" : undefined}
        data-moving={dragging || resizing ? "true" : undefined}
        aria-label="forge window"
        style={frameStyle}
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
            <span className="win-title__role">the runner floor of the family</span>
          </span>
          <div className="win-controls">
            <button
              type="button"
              className="win-control"
              aria-label="Minimize forge"
              onClick={() => setMinimized(true)}
            >
              <SubtractRegular fontSize={14} aria-hidden="true" />
            </button>
            <button
              type="button"
              className="win-control"
              aria-label={maximized ? "Restore forge" : "Maximize forge"}
              onClick={toggleMaximize}
            >
              {maximized ? (
                <CopyRegular fontSize={12} aria-hidden="true" />
              ) : (
                <MaximizeRegular fontSize={11} aria-hidden="true" />
              )}
            </button>
            <button
              type="button"
              className="win-control win-control--close"
              aria-label="Close forge"
              onClick={closeWindow}
            >
              <DismissRegular fontSize={14} aria-hidden="true" />
            </button>
          </div>
        </header>
        {/* the windows resize chrome: the eight handle zones of the real frame
            (pointer capture on the ring, the size clamped to the viewport) */}
        <div
          className="win-handles"
          onPointerDown={onHandlePointerDown}
          onPointerMove={onHandlePointerMove}
          onPointerUp={onHandlePointerUp}
          onPointerCancel={onHandlePointerUp}
        >
          <span className="win-handle" data-dir="n" aria-hidden="true" />
          <span className="win-handle" data-dir="s" aria-hidden="true" />
          <span className="win-handle" data-dir="e" aria-hidden="true" />
          <span className="win-handle" data-dir="w" aria-hidden="true" />
          <span className="win-handle" data-dir="nw" aria-hidden="true" />
          <span className="win-handle" data-dir="ne" aria-hidden="true" />
          <span className="win-handle" data-dir="sw" aria-hidden="true" />
          <span className="win-handle" data-dir="se" aria-hidden="true" />
        </div>
        <div className="win-body">
          <nav className="win-rail" aria-label="Pages">
            {RAIL_APPS.map((app) => {
              const Icon = app.icon;
              return (
                <Link
                  key={app.href}
                  href={app.href}
                  className="win-raillink"
                  data-tip={app.label}
                  aria-label={app.label}
                  aria-current={isActive(app.href) ? "page" : undefined}
                >
                  <Icon fontSize={18} aria-hidden="true" />
                </Link>
              );
            })}
            <div className="win-railfoot">
              <div className="win-family">
                {FAMILY_SLUGS.map((slug) => {
                  const member = familyAccentOf(slug);
                  return (
                    <a
                      key={slug}
                      className="win-family__link"
                      href={familyurl(slug)}
                      target="_blank"
                      rel="noreferrer"
                      data-tip={slug}
                      aria-label={`open ${slug} — a family application`}
                    >
                      <span
                        className="win-family__dot"
                        data-app={slug}
                        style={member ? { background: member.accent } : undefined}
                        aria-hidden="true"
                      />
                      <span className="win-sr">{slug}</span>
                    </a>
                  );
                })}
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
