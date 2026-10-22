/**
 * Shell.tsx — the ONE chrome of the theme: the APPLICATION WINDOW (the
 * FAM-APPS reform, riding the trylle foundation with the WINDOWS hands).
 * One floating window over the deep canvas, opened at 250ms scale(.95 → 1)
 * on the window curve cubic-bezier(.85,.14,.14,.85), with the Fluent
 * focused-window shadow, 8px corners and a 48px graphite title bar
 * (rgb(32 32 32 / 75%) + saturate(3) blur(20px), constant in both themes)
 * that is the drag surface: pointer capture carries the window, the offset
 * is clamped so the bar never leaves the screen, a double click toggles
 * maximize and the drag never transitions (data-moving hard stop). The
 * caption buttons are the Fluent 44px grammar at the 4px control radius —
 * minimize collapses the window into a restore chip, maximize toggles the
 * full-bleed state, close relaunches the application (the flow returns to
 * /intro; the seen flags never regress — the seen-wins law of the
 * onboarding state). The EIGHT RESIZE HANDLES of the real window chrome
 * ride the frame edges, and a window the document is not focused on turns
 * inactive — grayscale(80%), the Windows law. The left rail carries the
 * pages of the application as the Windows pins (the press rides scale .7,
 * the mount pops the pins in, the ladder indicator marks the active entry
 * in the identity azul) with the accent ladder on the active entry (the
 * four real surfaces: home, sandboxes, images, artifacts), and the rail
 * foot gains the FAMILY section — the sibling applications, resolved by
 * familyurl, one spec §12 accent dot each from family.ts — above the theme
 * flip. No taskbar, no start menu, no pins row, no tray, no desktop: the
 * content zone owns the page surface. On the landing (location "/") the
 * window carries data-landing so the title-bar mark rests while the hero
 * lockup owns the mark of the zone — logo discipline, CSS-enforced. The
 * window component is a copy-per-deploy (the consolidation belongs to the
 * future @wenathlan/* package).
 */

import {
  BoxMultipleRegular,
  CheckmarkCircleRegular,
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
import { familyAccentOf, familyrow } from "../../family.ts";
import { familyurl } from "../../familyurl.ts";
import { BrandMark } from "../componentes/shell/BrandMark";

/** the theme in memory: flips the data-theme attribute, stores nothing */
type ThemeName = "dark" | "light";

/** the theme in memory for the current document lifetime (the light fusion default) */
let theme: ThemeName = "light";

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

/** one rail entry: a page surface of the app with its glyph. */
export type RailApp = {
  href: string;
  label: string;
  detail: string;
  icon: typeof HomeRegular;
};

/** the pages the application window hosts, one rail entry each — the real
 * surface set of the foundry: the landing first, then the three platform
 * pages of the machine room. exported for the onboarding copy beside this
 * folder. */
export const START_APPS: readonly RailApp[] = [
  { href: "/", label: "home", detail: "the landing of the foundry", icon: HomeRegular },
  {
    href: "/sandboxes",
    label: "sandboxes",
    detail: "the herd on the cold → warm → hot ladder",
    icon: BoxMultipleRegular,
  },
  { href: "/images", label: "images", detail: "the herd shelf and the conversion plans", icon: LayerRegular },
  {
    href: "/artifacts",
    label: "artifacts",
    detail: "the packaging line with sealed checksums",
    icon: CheckmarkCircleRegular,
  },
];

/** the rail family row: the nine siblings beside the foundry, resolved
 * through family.ts — the one §12 table the chrome, the landing and the
 * tests all read. */
const FAMILY = familyrow();

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
 * The theme flip at the foot of the rail: flips the in-memory theme, stores
 * nothing on the visitor machine.
 *
 * @returns the toggle element.
 */
function ThemeToggle() {
  const [current, setCurrent] = useState<ThemeName>(currentTheme());
  return (
    <button type="button" className="win-theme" aria-label="toggle theme" onClick={() => setCurrent(toggleTheme())}>
      {current === "dark" ? (
        <WeatherSunnyRegular fontSize={14} aria-hidden="true" />
      ) : (
        <WeatherMoonRegular fontSize={14} aria-hidden="true" />
      )}
      {current}
    </button>
  );
}

/**
 * The shared shell: the application window — title bar (brand, drag,
 * caption buttons), the page rail with the family foot and the content
 * zone — floating over the trylle canvas.
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
  const [drag, setDrag] = useState({ x: 0, y: 0 });
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);
  const [inactive, setInactive] = useState(false);
  const [dragging, setDragging] = useState(false);
  const trackRef = useRef<DragTrack | null>(null);
  const resizeRef = useRef<ResizeTrack | null>(null);
  const winRef = useRef<HTMLElement | null>(null);

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

  /** the Windows affordance: a double click on the empty bar toggles
   * maximize. */
  function onTitleDoubleClick(event: ReactMouseEvent<HTMLElement>) {
    if ((event.target as HTMLElement).closest("button, a, input")) return;
    toggleMaximize();
  }

  /** close = relaunch: the flow returns to /intro (the opening answers the
   * seen law — a visitor that lived the flow lands back in the window), the
   * seen flags themselves never regress */
  const closeWindow = () => {
    navigate("/intro", { replace: true });
  };

  // the active rail entry: the bare path owns home, every other page owns
  // its route
  const isActive = (href: string): boolean =>
    href === "/" ? location === "/" : location === href || location.startsWith(`${href}/`);

  // the minimized window collapses into the restore chip over the canvas stage
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

  // the embedded pass renders before the chrome: one window, one frame
  if (framed) return <main className="shell shell--embedded">{children}</main>;

  return (
    <div className="win-root" data-max={maximized ? "true" : undefined}>
      <section
        ref={winRef}
        className="win-window"
        data-max={maximized ? "true" : undefined}
        data-moving={dragging ? "true" : undefined}
        data-sized={size && !maximized ? "true" : undefined}
        data-inactive={inactive ? "true" : undefined}
        data-landing={location === "/" ? "true" : undefined}
        aria-label="foundry window"
        style={
          {
            "--win-x": `${drag.x}px`,
            "--win-y": `${drag.y}px`,
            ...(size && !maximized ? { width: size.w, height: size.h } : {}),
          } as CSSProperties
        }
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
            <strong>foundry</strong>
            <span className="win-title__role">the machine room of the family</span>
          </span>
          <div className="win-controls">
            <button
              type="button"
              className="win-control"
              aria-label="Minimize foundry"
              onClick={() => setMinimized(true)}
            >
              <SubtractRegular fontSize={14} aria-hidden="true" />
            </button>
            <button
              type="button"
              className="win-control"
              aria-label={maximized ? "Restore foundry" : "Maximize foundry"}
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
              aria-label="Close foundry"
              onClick={closeWindow}
            >
              <DismissRegular fontSize={14} aria-hidden="true" />
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
                <Link
                  key={app.href}
                  href={app.href}
                  className="win-raillink"
                  data-tip={app.detail}
                  aria-label={app.label}
                  aria-current={isActive(app.href) ? "page" : undefined}
                >
                  <Icon fontSize={16} aria-hidden="true" />
                  <span className="win-raillabel">{app.label}</span>
                </Link>
              );
            })}
            <div className="win-railfoot">
              <p className="win-railhead" aria-hidden="true">
                family
              </p>
              {FAMILY.map((app) => {
                const member = familyAccentOf(app.slug);
                return (
                  <a
                    key={app.slug}
                    className="win-famlink"
                    href={familyurl(app.slug)}
                    target="_blank"
                    rel="noreferrer"
                    data-tip={`${app.slug} — the family application beside the foundry`}
                    aria-label={`open ${app.slug} — the family application beside the foundry`}
                    style={{ "--fd-dot": member?.accent } as CSSProperties}
                  >
                    <span className="win-famdot" aria-hidden="true" />
                    <span className="win-famname">{app.slug}</span>
                  </a>
                );
              })}
              <ThemeToggle />
            </div>
          </nav>
          <div className="win-content">{children}</div>
        </div>

        {/* the eight resize handles of the window chrome (n/s/e/w + the corners) */}
        {RESIZE_EDGES.map((edge) => (
          <span
            key={edge}
            data-edge={edge}
            className="win-rz"
            aria-hidden="true"
            onPointerDown={onResizePointerDown(edge)}
            onPointerMove={onResizePointerMove}
            onPointerUp={onResizePointerUp}
            onPointerCancel={onResizePointerUp}
          />
        ))}
      </section>
    </div>
  );
}

export default Shell;
