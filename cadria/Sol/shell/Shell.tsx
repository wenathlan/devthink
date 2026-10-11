// the cadria shell of the theme.
/**
 * Shell.tsx — the ONE chrome of the theme, riding the family APPLICATION
 * grammar: the routed pages render inside one Windows 11 application window
 * floating over the Mica backdrop — a title bar carrying the brand lockup,
 * the app name and the role line (the drag handle, double-click toggles
 * maximize), the Fluent caption buttons at the right edge (minimize
 * collapses the window into a restore chip, maximize fills the backdrop,
 * close relaunches the app at /intro) and the 48px icon rail that switches
 * the pages as the window content (the rail foot repeats the family row so
 * the chrome itself links the siblings through familyurl). The window rides
 * the WINDOW APP PASS primitives of sol.css (.winapp, --winapp-x/y,
 * --shadow-window) and opens with the 250ms scale .95→1 entry; there is no
 * taskbar, no start menu and no desktop navigation. The presentation intro
 * (/intro) stays outside the window — it hands the surface over through the
 * onboarding, and every seat after it mounts inside this ONE window. The
 * chrome styles ride the sol.css primitives (.titlebar .railnav .icon-anim
 * .appframe .winapp); the only css the shell owns is the glue block below
 * (skip link, stage gutter, the page transition — 250ms window ease, fade +
 * 4px rise). Session scope only: the theme flip writes a data-theme
 * attribute on <html> and nothing else — zero storage, zero persistence.
 *
 * Mount law: the shell mounts ONCE — Sol/Sol.tsx wraps the routed Switch and
 * the page anchors render bare inside .sol-page (the shell keeps accepting
 * the window-era props so any legacy call site keeps compiling; nothing is
 * consumed beyond themeButton).
 */

import { Copy, Image, LayoutDashboard, Minus, Moon, PlayCircle, Scissors, Settings2, Square, Sun, Wand2, X } from "lucide-react";
import {
  type CSSProperties,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
  type PointerEvent as ReactPointerEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import { Link, useLocation } from "wouter";
import { familyrow } from "../../family.ts";
import { familyurl } from "../../familyurl.ts";
import { currentTheme, type Theme, toggleTheme } from "../../theme.ts";
import BrandMark from "./BrandMark.tsx";

export { CadriaMark } from "./CadriaMark.tsx";

/** one entry of the shell navigation (the legacy page prop shape, kept for
 * the anchors that type against the shell beside this folder) */
export type NavLink = { label: string; href: string };

/** one entry of the icon rail: a page surface of the app with its glyph. */
export type StartApp = {
  href: string;
  label: string;
  detail: string;
  icon?: typeof LayoutDashboard;
};

/** the pages the platform hosts, one rail entry each (the apex home first).
 * exported for the onboarding copy beside this folder. */
export const START_APPS: readonly StartApp[] = [
  { href: "/", label: "home", detail: "the video and image home of the family", icon: LayoutDashboard },
  { href: "/player", label: "player", detail: "the 24-format universal player", icon: PlayCircle },
  { href: "/studio", label: "studio", detail: "the creative workspace over the versawase engine", icon: Wand2 },
  {
    href: "/edit",
    label: "editor",
    detail: "the timeline: clips, trims and the playhead on exact ticks",
    icon: Scissors,
  },
  { href: "/gallery", label: "gallery", detail: "renders by discipline, video and image", icon: Image },
  { href: "/settings", label: "settings", detail: "appearance and player defaults", icon: Settings2 },
];

/** the titlebar page titles, route → mono-label (the rail labels plus the
 * two framed pages that stay off the rail). */
const ROUTE_TITLES: Readonly<Record<string, string>> = {
  "/": "home",
  "/studio": "studio",
  "/edit": "editor",
  "/gallery": "gallery",
  "/player": "player",
  "/settings": "settings",
  "/onboarding": "first run",
  "/404": "not found",
};

/** the titlebar title for a location: the rail page, the framed extras, or
 * the not-found label for everything else. */
function routeTitle(location: string): string {
  if (ROUTE_TITLES[location]) return ROUTE_TITLES[location];
  const base = `/${location.split("/")[1] ?? ""}`;
  return ROUTE_TITLES[base] ?? "not found";
}

/** the hand-over route of the close caption: closing the window restarts the
 * application at the intro (the relaunch metaphor). */
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

/** SSR-safe read of the session theme: the document may not exist while
 * rendering on the server, so the sol dark default answers for it. */
function sessionTheme(): Theme {
  if (typeof document === "undefined") return "dark";
  return currentTheme();
}

/**
 * the theme flip of the titlebar: flips the in-memory theme on <html>,
 * stores nothing (session scope, per the family storage law).
 *
 * @returns the toggle element.
 */
function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(sessionTheme);
  const next = theme === "dark" ? "light" : "dark";
  return (
    <button
      type="button"
      className="icon-anim"
      title={`${next} theme`}
      aria-label={`switch to the ${next} theme`}
      onClick={() => setTheme(toggleTheme())}
    >
      {theme === "dark" ? (
        <Sun size={16} strokeWidth={1.5} aria-hidden="true" />
      ) : (
        <Moon size={16} strokeWidth={1.5} aria-hidden="true" />
      )}
    </button>
  );
}

/** the glue css of the chrome: the skip link, the stage gutter and the page
 * transition (fade + 4px rise on the window ease; the reduced-motion guard
 * of sol.css covers it). everything else rides the sol.css primitives. */
const SHELL_CSS = `
.sol-skip { position: fixed; top: -56px; left: 12px; z-index: var(--z-toast); padding: 10px 14px; border: 1px solid var(--line-strong); border-radius: var(--radius-md); background: var(--surface-1); color: var(--ink); font-size: 13px; font-weight: 600; transition: top var(--dur-1) var(--ease-out); }
.sol-skip:focus-visible { top: 12px; }
.sol-stage { scrollbar-gutter: stable; }
/* the stage gutter: the ONE padding of the platform — every page anchor renders
   bare inside it, so the gutters can never drift between seats (the negative
   bleeds of the home hero quote the same clamp pair by contract) */
.sol-page { padding: clamp(20px, 4vw, 56px) clamp(16px, 4vw, 40px) clamp(24px, 5vw, 56px); animation: solPageIn var(--dur-2) var(--ease-window) backwards; outline: none; }
@keyframes solPageIn { from { opacity: 0; transform: translateY(4px); } }
`;

/** the shell props: the routed page plus the legacy window-era props the
 * page anchors still pass — accepted for compilation, only themeButton is
 * consumed (the frame grammar names itself). */
type ShellProps = {
  children: ReactNode;
  name?: string;
  nav?: readonly NavLink[];
  cta?: NavLink;
  contained?: boolean;
  footerLinks?: readonly NavLink[];
  themeButton?: boolean;
  domain?: string;
};

/**
 * the application window: title bar (brand, drag, caption buttons), the icon
 * rail and the routed stage, floating over the Mica backdrop.
 *
 * @param children the routed page.
 * @returns the window element.
 */
export function Shell({ children, themeButton = true }: ShellProps) {
  const [location, navigate] = useLocation();
  const [maximized, setMaximized] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [drag, setDrag] = useState({ x: 0, y: 0 });
  const trackRef = useRef<DragTrack | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);

  // every navigation lands at the top of the stage (the scroll lives on the
  // stage column, so the rail and the title bar never move)
  // biome-ignore lint/correctness/useExhaustiveDependencies: the location change is the reset trigger
  useEffect(() => {
    stageRef.current?.scrollTo({ top: 0 });
  }, [location]);

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

  /** the Windows affordance: a double click on the empty bar toggles maximize. */
  function onTitleDoubleClick(event: ReactMouseEvent<HTMLElement>) {
    if ((event.target as HTMLElement).closest("button, a, input")) return;
    toggleMaximize();
  }

  // the bare path (no search) drives the title and the active rail entry:
  // the bare path owns home, every other page owns its route
  const path = location.split("?")[0] ?? "/";
  const isActive = (href: string): boolean =>
    href === "/" ? path === "/" : path === href || path.startsWith(`${href}/`);

  return (
    <div className="appframe" data-maximized={maximized ? "true" : undefined}>
      <style>{SHELL_CSS}</style>
      <a className="sol-skip" href="#sol-main">
        skip to content
      </a>

      <section
        className="winapp"
        hidden={minimized}
        data-maximized={maximized ? "true" : undefined}
        aria-label="cadria"
        style={{ "--winapp-x": `${drag.x}px`, "--winapp-y": `${drag.y}px` } as CSSProperties}
      >
        {/* biome-ignore lint/a11y/noStaticElementInteractions: the title bar is the drag surface; the window controls inside it are real buttons */}
        <header
          className="winapp__title"
          data-dragging={trackRef.current ? "true" : undefined}
          onPointerDown={onTitlePointerDown}
          onPointerMove={onTitlePointerMove}
          onPointerUp={onTitlePointerUp}
          onPointerCancel={onTitlePointerUp}
          onDoubleClick={onTitleDoubleClick}
        >
          <div className="winapp__brand">
            <BrandMark size={18} />
            <span className="winapp__name">cadria</span>
            <span className="winapp__role">video and image of the family</span>
          </div>
          <span className="titlebar__role mono-label" aria-hidden="true" style={{ flex: "none" }}>
            {routeTitle(path)}
          </span>
          <span className="titlebar__spacer" />
          {themeButton ? <ThemeToggle /> : null}
          <div className="winapp__caption">
            <button type="button" className="winapp__cap" aria-label="Minimize" onClick={() => setMinimized(true)}>
              <Minus size={14} aria-hidden="true" />
            </button>
            <button
              type="button"
              className="winapp__cap"
              aria-label={maximized ? "Restore" : "Maximize"}
              onClick={toggleMaximize}
            >
              {maximized ? <Copy size={12} aria-hidden="true" /> : <Square size={11} aria-hidden="true" />}
            </button>
            <button
              type="button"
              className="winapp__cap winapp__cap--close"
              aria-label="Close"
              onClick={() => navigate(RESTART_ROUTE)}
            >
              <X size={14} aria-hidden="true" />
            </button>
          </div>
        </header>

        {/* the body: the fixed icon rail beside the routed stage — the mount
            pops the pins in (popintro, staggered) and the rail foot carries the
            family row: one accent dot per sibling, resolved through the
            familyurl contract so every link survives any mount point */}
        <div className="winapp__body">
          <nav className="railnav railnav--enter" aria-label="primary" style={{ borderRight: "1px solid var(--line)" }}>
            {START_APPS.map((app) => {
              const Icon = app.icon ?? LayoutDashboard;
              return (
                <Link
                  key={app.href}
                  href={app.href}
                  className="railnav__item"
                  title={app.detail}
                  aria-label={app.label}
                  aria-current={isActive(app.href) ? "page" : undefined}
                >
                  <Icon size={20} strokeWidth={1.5} aria-hidden="true" />
                </Link>
              );
            })}
            <fieldset className="railnav__foot" aria-label="the wenathlan family">
              {familyrow().map((member) => (
                <a
                  key={member.slug}
                  href={familyurl(member.slug)}
                  target="_blank"
                  rel="noreferrer"
                  className="railnav__fam"
                  title={`${member.slug} — a family surface`}
                >
                  <span aria-hidden="true" className="railnav__famdot" style={{ background: member.accent }} />
                  <span className="sr-only">{`open ${member.slug} in its own tab`}</span>
                </a>
              ))}
            </fieldset>
          </nav>
          <div ref={stageRef} className="sol-stage winapp__stage">
            <main id="sol-main" key={location} tabIndex={-1} className="sol-page">
              {children}
            </main>
          </div>
        </div>
      </section>

      {minimized && (
        <button type="button" className="winchip" aria-label="Restore cadria" onClick={() => setMinimized(false)}>
          <BrandMark size={16} />
          <span>cadria</span>
        </button>
      )}
    </div>
  );
}

export default Shell;
