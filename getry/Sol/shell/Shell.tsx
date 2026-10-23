// the getry shell of the theme.
/**
 * Shell.tsx — the ONE chrome of the theme, converted from the OS grammar to
 * the APPLICATION grammar: the routed pages render inside one Windows 11
 * application window floating over the trylle canvas — a title bar carrying
 * the drawn getry mark and the app name (the drag handle, double-click
 * toggles maximize), the Fluent caption buttons at the right edge (the
 * theme flip, minimize collapses the window into a restore chip, maximize
 * fills the backdrop, close relaunches the app at /intro), the eight resize
 * handles of the real window chrome and the inactive law (an unfocused
 * window turns grayscale). The pages switch through the 48px Windows pin
 * rail: 38×38 r4 pins riding the pin law — the hover wash, the press at
 * scale .7, the dtPopIntro entrance and the ladder indicator — with the
 * acrylic tooltip naming the page; the rail foot carries the family dots.
 * The window rides the trylle foundation with the Windows hands (the trylle
 * surfaces and hairlines, the Fluent window shadow, the 250ms scale .95→1
 * entry at the window curve; the getry violet stays the identity accent of
 * the mark and the content). The chrome is a copy-per-deploy minimum:
 * consolidation belongs to the future @wenathlan/* package.
 */

import {
  BrainRegular,
  ChatMultipleRegular,
  CopyRegular,
  DismissRegular,
  HomeRegular,
  LayerRegular,
  MaximizeRegular,
  SubtractRegular,
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
import { currentTheme, type ThemeName, toggleTheme } from "../../theme.ts";
import { BrandMark } from "../components/shell.brandmark";

/** one entry of the window rail: a page surface of the app with its glyph. */
export type StartApp = {
  href: string;
  label: string;
  detail: string;
  icon: typeof HomeRegular;
};

/** the pages the application window hosts, one rail entry each (the gateway
 * home first, then the session store, the reasoning ladder and the gateway
 * versions — the rail order of the polish pass). exported for the onboarding
 * copy beside this folder. */
export const START_APPS: readonly StartApp[] = [
  { href: "/", label: "home", detail: "the gateway surface of the family", icon: HomeRegular },
  { href: "/sessions", label: "sessions", detail: "the session store and key rotation", icon: ChatMultipleRegular },
  { href: "/thinking", label: "thinking", detail: "the 7-level reasoning ladder", icon: BrainRegular },
  { href: "/versions", label: "versions", detail: "five provider gateways and their routes", icon: LayerRegular },
];

/** the hand-over route of the close caption: closing the window restarts the
 * application at the intro (the relaunch metaphor — the intro itself
 * consults the seen flags, so a finished visitor lands home). */
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

/** keeps the dragged title bar reachable: the offset never slides the bar
 * fully off screen, so the window can always be grabbed back. */
function clampDrag(x: number, y: number): { x: number; y: number } {
  const spanX = Math.max(window.innerWidth / 2 - 80, 0);
  const spanY = Math.max(window.innerHeight / 2 - 60, 0);
  return { x: Math.min(spanX, Math.max(-spanX, x)), y: Math.min(spanY, Math.max(-spanY, y)) };
}

/**
 * the theme flip of the caption: flips the in-memory theme, stores nothing.
 *
 * @returns the toggle element.
 */
function ThemeToggle() {
  const [theme, setTheme] = useState<ThemeName>(currentTheme());
  return (
    <button type="button" className="winapp__theme" aria-label="toggle theme" onClick={() => setTheme(toggleTheme())}>
      {theme === "dark" ? (
        <WeatherSunnyRegular fontSize={15} aria-hidden="true" />
      ) : (
        <WeatherMoonRegular fontSize={15} aria-hidden="true" />
      )}
    </button>
  );
}

/**
 * the application window: title bar (brand, drag, theme, caption buttons),
 * the Windows pin rail and the routed stage, floating over the trylle
 * canvas.
 *
 * @param children the routed page.
 * @returns the window element.
 */
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
  const [inactive, setInactive] = useState(false);
  const [drag, setDrag] = useState({ x: 0, y: 0 });
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);
  const trackRef = useRef<DragTrack | null>(null);
  const resizeRef = useRef<ResizeTrack | null>(null);
  const winRef = useRef<HTMLElement | null>(null);

  // the Windows inactive law: the window the document lost turns grayscale
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
    return { w: Math.min(maxW, Math.max(MIN_SIZE.w, w)), h: Math.min(maxH, Math.max(MIN_SIZE.h, h)) };
  }

  /** maximizes over the backdrop or restores the windowed frame (the drag
   * offset resets, the resized frame gives way). */
  function toggleMaximize() {
    setDrag({ x: 0, y: 0 });
    setSize(null);
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

  /** arms a resize session from one of the eight handles. */
  function onResizePointerDown(edge: ResizeEdge) {
    return (event: ReactPointerEvent<HTMLSpanElement>) => {
      if (maximized) return;
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
      event.currentTarget.setPointerCapture(event.pointerId);
    };
  }

  /** rides the pointer while a resize session is armed (the window owns the
   * size — the drag offset resets so the bar stays reachable). */
  function onResizePointerMove(event: ReactPointerEvent<HTMLSpanElement>) {
    const track = resizeRef.current;
    if (!track || track.pointerId !== event.pointerId) return;
    const dx = event.clientX - track.originX;
    const dy = event.clientY - track.originY;
    const east = track.edge.includes("e");
    const west = track.edge.includes("w");
    const south = track.edge.includes("s");
    const north = track.edge.includes("n");
    const width = east ? track.baseW + dx : west ? track.baseW - dx : track.baseW;
    const height = south ? track.baseH + dy : north ? track.baseH - dy : track.baseH;
    setSize(clampSize(width, height));
    if (west || north) setDrag({ x: 0, y: 0 });
  }

  /** releases the resize session. */
  function onResizePointerUp(event: ReactPointerEvent<HTMLSpanElement>) {
    const track = resizeRef.current;
    if (!track || track.pointerId !== event.pointerId) return;
    resizeRef.current = null;
    event.currentTarget.releasePointerCapture(event.pointerId);
  }

  // the active rail entry: the bare path owns home, every other page owns its route
  const isActive = (href: string): boolean =>
    href === "/" ? location === "/" : location === href || location.startsWith(`${href}/`);

  // the embedded pass renders before the chrome: one window, one frame
  if (framed) return <main className="shell shell--embedded">{children}</main>;

  return (
    <div className="appframe" data-maximized={maximized ? "true" : undefined}>
      <section
        ref={winRef}
        className="winapp"
        data-landing={location === "/" ? "true" : undefined}
        hidden={minimized}
        data-maximized={maximized ? "true" : undefined}
        data-sized={size && !maximized ? "true" : undefined}
        data-inactive={inactive ? "true" : undefined}
        aria-label="getry"
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
            <BrandMark size={20} />
            <span className="winapp__name">getry</span>
            <span className="winapp__role">the AI gateway of the wenathlan family</span>
          </div>
          <div className="winapp__caption">
            <ThemeToggle />
            <button type="button" className="winapp__cap" aria-label="Minimize" onClick={() => setMinimized(true)}>
              <SubtractRegular fontSize={14} aria-hidden="true" />
            </button>
            <button
              type="button"
              className="winapp__cap"
              aria-label={maximized ? "Restore" : "Maximize"}
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
              aria-label="Close"
              onClick={() => navigate(RESTART_ROUTE)}
            >
              <DismissRegular fontSize={14} aria-hidden="true" />
            </button>
          </div>
        </header>

        {/* the body: the Windows pin rail beside the routed stage — the mount
            pops the pins in (dtPopIntro, staggered), the ladder indicator
            marks hover and the active page, the acrylic tooltip names it and
            the rail foot carries the family row (one accent dot per sibling,
            resolved through the familyurl contract so every link survives
            any mount point) */}
        <div className="winapp__body">
          <nav className="railnav railnav--enter" aria-label="primary">
            {START_APPS.map((app) => {
              const Icon = app.icon;
              return (
                <Link
                  key={app.href}
                  href={app.href}
                  className="railnav__item"
                  data-tip={app.detail}
                  aria-label={app.label}
                  aria-current={isActive(app.href) ? "page" : undefined}
                >
                  <Icon fontSize={20} aria-hidden="true" />
                </Link>
              );
            })}
            <fieldset className="railnav__foot" aria-label="the wenathlan family">
              {familyrow().map((member) => (
                <a
                  key={member.slug}
                  className="railnav__fam"
                  href={familyurl(member.slug)}
                  target="_blank"
                  rel="noreferrer"
                  data-tip={`${member.slug} — a family surface`}
                >
                  <span aria-hidden="true" className="railnav__famdot" style={{ background: member.accent }} />
                  <span className="sr-only">{`open ${member.slug} in its own tab`}</span>
                </a>
              ))}
            </fieldset>
          </nav>
          <div className="winapp__stage">
            <main className="shell">{children}</main>
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

      {minimized && (
        <button type="button" className="winchip" aria-label="Restore getry" onClick={() => setMinimized(false)}>
          <BrandMark size={16} />
          <span>getry</span>
        </button>
      )}
    </div>
  );
}

export default Shell;
