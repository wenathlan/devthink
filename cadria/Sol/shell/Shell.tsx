// the cadria shell of the theme.
/**
 * Shell.tsx — the ONE chrome of the theme, riding the family APPLICATION
 * grammar: the routed pages render inside one Windows 11 application window
 * floating over the trylle canvas — a title bar carrying the brand lockup,
 * the app name and the role line (the drag handle: Pointer Events with the
 * offset batched once per animation frame, double-click toggles maximize,
 * the release lands the aero snap — the side strips preview the half/half
 * ghosts and the top strip the maximize ghost, both committed on release),
 * the Fluent caption buttons at the right edge (minimize
 * collapses the window into a restore chip, maximize fills the backdrop,
 * close relaunches the app at /intro), the eight resize handles of the real
 * window chrome and the 48px icon rail that switches the pages as the window
 * content (Windows pins: 38×38 r4 washes, the press rides scale .7, the
 * mount pops the pins in, the ladder indicator marks hover/active and the
 * acrylic tooltip names the page; the rail foot repeats the family row so
 * the chrome itself links the siblings through familyurl). A window the
 * document is not focused on turns inactive — grayscale(80%), the Windows
 * law. The window rides the WINDOW APP PASS primitives of sol.css (.winapp,
 * --winapp-x/y, --shadow-window) and opens with the 250ms scale .95→1 entry;
 * there is no taskbar, no start menu and no desktop navigation. The
 * presentation intro (/intro) stays outside the window — it hands the
 * surface over through the onboarding, and every seat after it mounts inside
 * this ONE window. The chrome styles ride the sol.css primitives (.titlebar
 * .railnav .icon-anim .appframe .winapp); the only css the shell owns is the
 * glue block below (skip link, stage gutter, the page transition — 250ms
 * window ease, fade + 4px rise). Session scope only: the theme flip writes a
 * data-theme attribute on <html> and nothing else — zero storage, zero
 * persistence.
 *
 * Mount law: the shell mounts ONCE — Sol/Sol.tsx wraps the routed Switch and
 * the page anchors render bare inside .sol-page (the shell keeps accepting
 * the window-era props so any legacy call site keeps compiling; nothing is
 * consumed beyond themeButton).
 */

import {
  CopyRegular,
  CutRegular,
  DismissRegular,
  HomeRegular,
  ImageRegular,
  MaximizeRegular,
  PlayCircleRegular,
  SettingsRegular,
  SubtractRegular,
  WandRegular,
  WeatherMoonRegular,
  WeatherSunnyRegular,
} from "@fluentui/react-icons";
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
import { type LabelKey, label } from "../../labels.ts";
import { currentTheme, type Theme, toggleTheme } from "../../theme.ts";
import { type WinSnapZone, winsnaprect, winsnapzone } from "../../winsnap.ts";
import BrandMark from "../widgets/shell.brandmark.tsx";

export { CadriaMark } from "../widgets/shell.cadriamark.tsx";

/** one entry of the shell navigation (the legacy page prop shape, kept for
 * the anchors that type against the shell beside this folder) */
export type NavLink = { label: string; href: string };

/** one entry of the icon rail: a page surface of the app with its glyph. */
export type StartApp = {
  href: string;
  label: LabelKey;
  detail: LabelKey;
  icon?: typeof HomeRegular;
};

/** the pages the platform hosts, one rail entry each (the apex home first).
 * exported for the onboarding copy beside this folder. */
export const START_APPS: readonly StartApp[] = [
  { href: "/", label: "shell.rail.home", detail: "shell.rail.homeDetail", icon: HomeRegular },
  {
    href: "/player",
    label: "shell.rail.player",
    detail: "shell.rail.playerDetail",
    icon: PlayCircleRegular,
  },
  {
    href: "/studio",
    label: "shell.rail.studio",
    detail: "shell.rail.studioDetail",
    icon: WandRegular,
  },
  {
    href: "/edit",
    label: "shell.rail.editor",
    detail: "shell.rail.editorDetail",
    icon: CutRegular,
  },
  {
    href: "/gallery",
    label: "shell.rail.gallery",
    detail: "shell.rail.galleryDetail",
    icon: ImageRegular,
  },
  {
    href: "/settings",
    label: "shell.rail.settings",
    detail: "shell.rail.settingsDetail",
    icon: SettingsRegular,
  },
];

/** the titlebar page titles, route → mono-label (the rail labels plus the
 * two framed pages that stay off the rail). */
const ROUTE_TITLES: Readonly<Record<string, LabelKey>> = {
  "/": "shell.title.home",
  "/studio": "shell.title.studio",
  "/edit": "shell.title.editor",
  "/gallery": "shell.title.gallery",
  "/player": "shell.title.player",
  "/settings": "shell.title.settings",
  "/onboarding": "shell.title.onboarding",
  "/404": "shell.title.notfound",
};

/** the titlebar title for a location: the rail page, the framed extras, or
 * the not-found label for everything else. */
function routeTitle(location: string): string {
  if (ROUTE_TITLES[location]) return label(ROUTE_TITLES[location]);
  const base = `/${location.split("/")[1] ?? ""}`;
  return label(ROUTE_TITLES[base] ?? "shell.title.notfound");
}

/** the hand-over route of the close caption: closing the window restarts the
 * application at the intro (the relaunch metaphor). */
const RESTART_ROUTE = "/intro";

/** the eight resize edges of the window chrome (the Windows handles). */
const RESIZE_EDGES = ["n", "s", "e", "w", "ne", "nw", "se", "sw"] as const;

/** the edge set as a type. */
type ResizeEdge = (typeof RESIZE_EDGES)[number];

/** the smallest window the resize allows (px). */
const MIN_SIZE = { w: 640, h: 440 } as const;

/** one pointer session over a resize handle: the edge, where the press
 * started and the window size it carried when it did. */
type ResizeTrack = {
  pointerId: number;
  edge: ResizeEdge;
  originX: number;
  originY: number;
  baseW: number;
  baseH: number;
};

/** one pointer session over the title bar: where the press started and the
 * offset the window carried when it did. */
type DragTrack = {
  pointerId: number;
  originX: number;
  originY: number;
  baseX: number;
  baseY: number;
};

/** one queued pointer pose of the drag loop: the latest client point the
 * move handler saw, flushed at most once per animation frame. */
type DragPose = { clientX: number; clientY: number };

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
      data-tip={next === "light" ? label("shell.theme.tipLight") : label("shell.theme.tipDark")}
      aria-label={next === "light" ? label("shell.theme.ariaLight") : label("shell.theme.ariaDark")}
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
  const [snapped, setSnapped] = useState<WinSnapZone | null>(null);
  const [drag, setDrag] = useState({ x: 0, y: 0 });
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);
  const [inactive, setInactive] = useState(false);
  /** the aero ghost: the zone the drag previews and the rect it paints. */
  const [ghost, setGhost] = useState<{
    zone: WinSnapZone;
    rect: { left: number; top: number; width: number; height: number };
  } | null>(null);
  const ghostRef = useRef<WinSnapZone | null>(null);
  const poseRef = useRef<DragPose | null>(null);
  const dragFrame = useRef(0);
  const trackRef = useRef<DragTrack | null>(null);
  const resizeRef = useRef<ResizeTrack | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const winRef = useRef<HTMLElement | null>(null);

  // every navigation lands at the top of the stage (the scroll lives on the
  // stage column, so the rail and the title bar never move)
  // biome-ignore lint/correctness/useExhaustiveDependencies: the location change is the reset trigger
  useEffect(() => {
    stageRef.current?.scrollTo({ top: 0 });
  }, [location]);

  // the Windows inactive law: a window the document is not focused on turns
  // grayscale — the state rides the document focus alone (session scope)
  useEffect(() => {
    const sync = (): void => setInactive(!document.hasFocus());
    sync();
    window.addEventListener("focus", sync);
    window.addEventListener("blur", sync);
    return () => {
      window.removeEventListener("focus", sync);
      window.removeEventListener("blur", sync);
    };
  }, []);

  /** clamps a resize candidate to the viewport and the minimum window size. */
  function clampSize(w: number, h: number): { w: number; h: number } {
    const maxW = Math.max(MIN_SIZE.w, window.innerWidth - 24);
    const maxH = Math.max(MIN_SIZE.h, window.innerHeight - 24);
    return {
      w: Math.min(maxW, Math.max(MIN_SIZE.w, Math.round(w))),
      h: Math.min(maxH, Math.max(MIN_SIZE.h, Math.round(h))),
    };
  }

  /** arms a resize session from one of the eight handles. */
  function onResizePointerDown(edge: ResizeEdge) {
    return (event: ReactPointerEvent<HTMLSpanElement>) => {
      if (maximized || snapped) return;
      const rect = winRef.current?.getBoundingClientRect();
      if (!rect) return;
      resizeRef.current = {
        pointerId: event.pointerId,
        edge,
        originX: event.clientX,
        originY: event.clientY,
        baseW: rect.width,
        baseH: rect.height,
      };
      event.preventDefault();
      event.currentTarget.setPointerCapture(event.pointerId);
    };
  }

  /** rides the pointer while a resize session is armed. */
  function onResizePointerMove(event: ReactPointerEvent<HTMLSpanElement>) {
    const track = resizeRef.current;
    if (!track || track.pointerId !== event.pointerId) return;
    const dx = event.clientX - track.originX;
    const dy = event.clientY - track.originY;
    let w = track.baseW;
    let h = track.baseH;
    if (track.edge.includes("e")) w = track.baseW + dx;
    if (track.edge.includes("w")) w = track.baseW - dx;
    if (track.edge.includes("s")) h = track.baseH + dy;
    if (track.edge.includes("n")) h = track.baseH - dy;
    setSize(clampSize(w, h));
  }

  /** releases the resize session. */
  function onResizePointerUp(event: ReactPointerEvent<HTMLSpanElement>) {
    const track = resizeRef.current;
    if (!track || track.pointerId !== event.pointerId) return;
    resizeRef.current = null;
    event.currentTarget.releasePointerCapture(event.pointerId);
  }

  /** maximizes over the backdrop or restores the windowed frame (the drag
   * offset resets and an aero half lets go of the window). */
  function toggleMaximize() {
    setDrag({ x: 0, y: 0 });
    setSnapped(null);
    setMaximized((value) => !value);
  }

  /** paints (or clears) the aero ghost for a pointer pose — a zone flip is
   * the only state change, so the drag never re-renders per pixel. */
  function showGhost(clientX: number, clientY: number) {
    const zone = winsnapzone(clientX, clientY, window.innerWidth, window.innerHeight);
    if (ghostRef.current === zone) return;
    ghostRef.current = zone;
    setGhost(zone ? { zone, rect: winsnaprect(zone, window.innerWidth, window.innerHeight) } : null);
  }

  /** lands the drag in the zone the release previews: the halves commit the
   * snapped states, the top strip maximizes, everything else keeps the move. */
  function commitDragSnap(clientX: number, clientY: number) {
    const zone = winsnapzone(clientX, clientY, window.innerWidth, window.innerHeight);
    if (!zone) return;
    setSize(null);
    setDrag({ x: 0, y: 0 });
    if (zone === "max") {
      setSnapped(null);
      setMaximized(true);
      return;
    }
    setMaximized(false);
    setSnapped(zone);
  }

  /** flushes one queued pointer pose into the drag offset (the rAF tail). */
  function flushDragPose(pose: DragPose | null = poseRef.current) {
    const track = trackRef.current;
    if (!track || !pose) return;
    setDrag(clampDrag(track.baseX + pose.clientX - track.originX, track.baseY + pose.clientY - track.originY));
  }

  /** arms a drag when the pointer presses the empty bar (never the caption
   * buttons); an aero half lets go of the window, the Windows restore law. */
  function onTitlePointerDown(event: ReactPointerEvent<HTMLElement>) {
    if (maximized) return;
    if ((event.target as HTMLElement).closest("button, a, input")) return;
    if (snapped) setSnapped(null);
    trackRef.current = {
      pointerId: event.pointerId,
      originX: event.clientX,
      originY: event.clientY,
      baseX: drag.x,
      baseY: drag.y,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  /** rides the pointer while a drag session is armed: the move queues the
   * pose and the offset applies at most once per animation frame (the raw
   * rAF loop — no motion library), the ghost rides the same pose. */
  function onTitlePointerMove(event: ReactPointerEvent<HTMLElement>) {
    const track = trackRef.current;
    if (!track || track.pointerId !== event.pointerId) return;
    poseRef.current = { clientX: event.clientX, clientY: event.clientY };
    showGhost(event.clientX, event.clientY);
    if (dragFrame.current) return;
    dragFrame.current = window.requestAnimationFrame(() => {
      dragFrame.current = 0;
      flushDragPose();
    });
  }

  /** releases the drag session: the queued pose flushes, the landing zone
   * commits (half/half/max) and the loop tears down. */
  function onTitlePointerUp(event: ReactPointerEvent<HTMLElement>) {
    const track = trackRef.current;
    if (!track || track.pointerId !== event.pointerId) return;
    trackRef.current = null;
    if (dragFrame.current) {
      window.cancelAnimationFrame(dragFrame.current);
      dragFrame.current = 0;
    }
    const pose = poseRef.current;
    poseRef.current = null;
    if (pose) flushDragPose(pose);
    if (pose) commitDragSnap(pose.clientX, pose.clientY);
    ghostRef.current = null;
    setGhost(null);
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

  // the embedded pass renders before the chrome: one window, one frame
  if (framed) return <main className="shell shell--embedded">{children}</main>;

  return (
    <div className="appframe" data-maximized={maximized ? "true" : undefined}>
      <style>{SHELL_CSS}</style>
      <a className="sol-skip" href="#sol-main">
        {label("shell.skip")}
      </a>

      <section
        ref={winRef}
        className="winapp"
        hidden={minimized}
        data-maximized={maximized ? "true" : undefined}
        data-snapped={snapped ?? undefined}
        data-sized={size && !maximized && !snapped ? "true" : undefined}
        data-inactive={inactive ? "true" : undefined}
        aria-label={label("shell.windowAria")}
        style={
          {
            "--winapp-x": `${drag.x}px`,
            "--winapp-y": `${drag.y}px`,
            ...(size && !maximized ? { width: size.w, height: size.h } : {}),
          } as CSSProperties
        }
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
            <span className="winapp__name">{label("shell.name")}</span>
            <span className="winapp__role">{label("shell.role")}</span>
          </div>
          <span className="titlebar__role mono-label" aria-hidden="true" style={{ flex: "none" }}>
            {routeTitle(path)}
          </span>
          <span className="titlebar__spacer" />
          {themeButton ? <ThemeToggle /> : null}
          <div className="winapp__caption">
            <button
              type="button"
              className="winapp__cap"
              data-tip={label("shell.caption.minimize")}
              aria-label={label("shell.caption.minimizeAria")}
              onClick={() => setMinimized(true)}
            >
              <SubtractRegular fontSize={14} aria-hidden="true" />
            </button>
            <button
              type="button"
              className="winapp__cap"
              data-tip={maximized ? label("shell.caption.restore") : label("shell.caption.maximize")}
              aria-label={maximized ? label("shell.caption.restoreAria") : label("shell.caption.maximizeAria")}
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
              className="winapp__cap winapp__cap--close"
              data-tip={label("shell.caption.close")}
              aria-label={label("shell.caption.closeAria")}
              onClick={() => navigate(RESTART_ROUTE)}
            >
              <DismissRegular fontSize={14} aria-hidden="true" />
            </button>
          </div>
        </header>

        {/* the body: the fixed icon rail beside the routed stage — the mount
            pops the pins in (popintro, staggered) and the rail foot carries the
            family row: one accent dot per sibling, resolved through the
            familyurl contract so every link survives any mount point */}
        <div className="winapp__body">
          <nav
            className="railnav railnav--enter"
            aria-label={label("shell.rail.primary")}
            style={{ borderRight: "1px solid var(--line)" }}
          >
            {START_APPS.map((app) => {
              const Icon = app.icon ?? HomeRegular;
              return (
                <Link
                  key={app.href}
                  href={app.href}
                  className="railnav__item"
                  data-tip={label(app.label)}
                  aria-label={label(app.label)}
                  aria-current={isActive(app.href) ? "page" : undefined}
                >
                  <Icon fontSize={20} aria-hidden="true" />
                </Link>
              );
            })}
            <fieldset className="railnav__foot" aria-label={label("shell.rail.family")}>
              {familyrow().map((member) => (
                <a
                  key={member.slug}
                  href={familyurl(member.slug)}
                  target="_blank"
                  rel="noreferrer"
                  className="railnav__fam"
                  data-tip={label("shell.rail.familyTip").replace("{slug}", member.slug)}
                >
                  <span aria-hidden="true" className="railnav__famdot" style={{ background: member.accent }} />
                  <span className="sr-only">{label("shell.rail.familyOpen").replace("{slug}", member.slug)}</span>
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

        {/* the eight resize handles of the window chrome (n/s/e/w + the corners) */}
        {RESIZE_EDGES.map((edge) => (
          <span
            key={edge}
            data-edge={edge}
            className="winapp__rz"
            aria-hidden="true"
            onPointerDown={onResizePointerDown(edge)}
            onPointerMove={onResizePointerMove}
            onPointerUp={onResizePointerUp}
            onPointerCancel={onResizePointerUp}
          />
        ))}
      </section>

      {/* the aero snap ghost: the half/half/max zone the drag previews —
          fixed over the viewport, inert, the windows-accent wash */}
      {ghost ? (
        <div
          aria-hidden="true"
          className="snapghost"
          data-zone={ghost.zone}
          style={{
            left: ghost.rect.left,
            top: ghost.rect.top,
            width: ghost.rect.width,
            height: ghost.rect.height,
          }}
        />
      ) : null}

      {minimized && (
        <button
          type="button"
          className="winchip"
          aria-label={label("shell.restore.aria")}
          onClick={() => setMinimized(false)}
        >
          <BrandMark size={16} />
          <span>{label("shell.restore.chip")}</span>
        </button>
      )}
    </div>
  );
}

export default Shell;
