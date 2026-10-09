/**
 * Shell.tsx — the ONE chrome of the theme, the chrome of an APPLICATION
 * WINDOW (the FAM-APPS reform, polished by the wave D1 pass): the Windows 11
 * app frame — a floating window over the Mica canvas, opened at 250ms
 * scale(.95 → 1) on the window curve cubic-bezier(.85,.14,.14,.85) — with
 * the Fluent focused-window shadow, 8px corners and a 48px graphite title
 * bar (rgb(32 32 32 / 75%) + saturate(3) blur(20px), constant in both
 * themes) carrying the drawn foundry mark, the name and the honest role on
 * the left as the drag surface (pointer capture, clamped offsets,
 * double-click maximize) and the Fluent caption buttons on the right
 * (44px targets; minimize collapses the window into a restore chip,
 * maximize toggles the full-bleed state and close relaunches the
 * application — the seen flag of the intro is lifted and the flow returns
 * to /intro). The left rail hosts the page entries on the accent ladder and
 * the FAMILY section at the foot: the siblings of the family, one accent
 * dot + name each, opened in a new tab through familyurl() — the family
 * redirects both ways. The campaign v3 · R3 pass is nav polish only: the
 * landing zone (location "/") rides data-landing on the window so the
 * title-bar mark rests while the hero lockup owns the mark of the zone, and
 * the role reads the honest store story — runs and stores. No taskbar, no
 * start menu, no pins, no tray, no desktop — the content zone owns the page
 * surface. The window component is
 * a copy-per-deploy (the consolidation belongs to the future @wenathlan/*
 * package).
 */

import { LayoutDashboard, Minus, Square, X } from "lucide-react";
import {
  type CSSProperties,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
  type PointerEvent as ReactPointerEvent,
  useRef,
  useState,
} from "react";
import { useLocation } from "wouter";
import { familyurl } from "../../familyurl";
import { resetIntro } from "../intro/intro";
import { BrandMark } from "./BrandMark";

/** one rail entry: a page surface of the app with its glyph. */
export type RailApp = {
  href: string;
  label: string;
  detail: string;
  icon: typeof LayoutDashboard;
};

/** the pages the application window hosts, one rail entry each. exported
 * for the onboarding copy beside this folder. */
export const START_APPS: readonly RailApp[] = [
  { href: "/", label: "home", detail: "the pipeline surface of the family", icon: LayoutDashboard },
];

/** one sibling of the family: the deploy unit segment and its identity
 * accent (the dot color of the rail foot). */
export type FamilyApp = { slug: string; accent: string };

/** the family deploy units beside the foundry, in rail order — the DevThink
 * OS first, then the sibling applications. */
export const FAMILY: readonly FamilyApp[] = [
  { slug: "devthink", accent: "#ff5f00" },
  { slug: "cadria", accent: "#f472b6" },
  { slug: "stealhead", accent: "#f87171" },
  { slug: "debonair", accent: "#a78bfa" },
  { slug: "argan", accent: "#1dcf64" },
  { slug: "saddle", accent: "#d6b483" },
  { slug: "forge", accent: "#fb923c" },
  { slug: "vault", accent: "#eab308" },
  { slug: "getry", accent: "#60a5fa" },
];

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

/** the shared shell: the application window (title bar + rail + content
 * zone) over the Mica stage */
export function Shell({ children }: { children: ReactNode }) {
  const [location, navigate] = useLocation();
  const [maximized, setMaximized] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [drag, setDrag] = useState({ x: 0, y: 0 });
  const trackRef = useRef<DragTrack | null>(null);

  /** maximizes over the backdrop or restores the windowed frame (the drag
   * offset resets). */
  function toggleMaximize() {
    setDrag({ x: 0, y: 0 });
    setMaximized((value) => !value);
  }

  /** arms a drag when the pointer presses the empty bar (never the caption
   * buttons). */
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

  // the active rail entry: the bare path owns home, every other page owns
  // its route
  const isActive = (href: string): boolean =>
    href === "/" ? location === "/" : location === href || location.startsWith(`${href}/`);

  // the minimized window collapses into the restore chip over the Mica stage
  if (minimized) {
    return (
      <div className="win-root">
        <button
          type="button"
          className="win-chip"
          aria-label="Restore the foundry window"
          onClick={() => setMinimized(false)}
        >
          <BrandMark size={16} />
          <span>foundry</span>
        </button>
      </div>
    );
  }

  return (
    <div className="win-root" data-max={maximized ? "true" : undefined}>
      <section
        className="win-window"
        data-max={maximized ? "true" : undefined}
        data-dragging={trackRef.current ? "true" : undefined}
        data-landing={location === "/" ? "true" : undefined}
        aria-label="foundry window"
        style={{ "--win-x": `${drag.x}px`, "--win-y": `${drag.y}px` } as CSSProperties}
      >
        {/* biome-ignore lint/a11y/noStaticElementInteractions: the title bar is the drag surface; the window controls inside it are real buttons */}
        <header
          className="win-titlebar"
          data-dragging={trackRef.current ? "true" : undefined}
          onPointerDown={onTitlePointerDown}
          onPointerMove={onTitlePointerMove}
          onPointerUp={onTitlePointerUp}
          onPointerCancel={onTitlePointerUp}
          onDoubleClick={onTitleDoubleClick}
        >
          <span className="win-title">
            <BrandMark size={18} />
            <strong>foundry</strong>
            <span className="win-title__role">runs and stores</span>
          </span>
          <div className="win-controls">
            <button
              type="button"
              className="win-control"
              aria-label="Minimize foundry"
              onClick={() => setMinimized(true)}
            >
              <Minus size={14} strokeWidth={1.7} aria-hidden="true" />
            </button>
            <button
              type="button"
              className="win-control"
              aria-label={maximized ? "Restore foundry" : "Maximize foundry"}
              onClick={toggleMaximize}
            >
              <Square size={11} strokeWidth={1.7} aria-hidden="true" />
            </button>
            <button
              type="button"
              className="win-control win-control--close"
              aria-label="Close foundry"
              onClick={closeWindow}
            >
              <X size={14} strokeWidth={1.7} aria-hidden="true" />
            </button>
          </div>
        </header>
        <div className="win-body">
          <nav className="win-rail" aria-label="foundry pages">
            <p className="win-railhead" aria-hidden="true">
              pages
            </p>
            {START_APPS.map((app) => {
              const Icon = app.icon;
              return (
                <a
                  key={app.href}
                  href={app.href}
                  className="win-raillink"
                  title={app.detail}
                  aria-label={app.label}
                  aria-current={isActive(app.href) ? "page" : undefined}
                >
                  <Icon size={16} strokeWidth={1.7} aria-hidden="true" />
                  <span className="win-raillabel">{app.label}</span>
                </a>
              );
            })}
            <div className="win-railfoot">
              <p className="win-railhead" aria-hidden="true">
                family
              </p>
              {FAMILY.map((app) => (
                <a
                  key={app.slug}
                  className="win-famlink"
                  href={familyurl(app.slug)}
                  target="_blank"
                  rel="noreferrer"
                  title={`${app.slug} — the family application beside the foundry`}
                  style={{ "--fd-dot": app.accent } as CSSProperties}
                >
                  <span className="win-famdot" aria-hidden="true" />
                  <span className="win-famname">{app.slug}</span>
                </a>
              ))}
            </div>
          </nav>
          <div className="win-content">{children}</div>
        </div>
      </section>
    </div>
  );
}

export default Shell;
