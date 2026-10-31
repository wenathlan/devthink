/**
 * useismobile.ts — one breakpoint subscription for the chat subapp: the
 * rail becomes a drawer and the session panel an overlay below 860px, and
 * the scrim/Escape behavior needs that fact in JS, not only in CSS.
 *
 * Inside an os window the viewport law lies — a 720px chat window on a
 * 1920px screen still answers 1920 to matchMedia, so the drawer never
 * opens and the body renders the wide layout cut inside the frame (the
 * cut-window bug of PR12). the workspace registers the .shell-window__host
 * element of the open window on the WindowBodySurface context and the
 * hook measures that box (a ResizeObserver — matchMedia cannot see a
 * container) while the body rides inside one, falling back to the
 * matchMedia viewport law everywhere else. the @container mirrors of
 * sol.css answer the same 860px edge on the paint side.
 */
import { createContext, useContext, useEffect, useState } from "react";

/** the drawer breakpoint (px) — the @media block, the @container mirrors
 * and this hook all answer the same edge */
const BREAKPOINT = 860;
/** the same edge as a media query — the viewport fallback outside the
 * windows */
const QUERY = "(max-width: 860px)";

/** the container a window body measures: the workspace registers the
 * .shell-window__host element of the open window (the same box the
 * @container rules answer). the shared default carries no host, so every
 * consumer outside a window keeps the viewport law. */
export const WindowBodySurface = createContext<{ current: HTMLElement | null }>({ current: null });

/** useContainerWidth — the live width (px) of the registered window body
 * container, or null while the body renders outside a window (the
 * matchMedia fallback owns that case). */
export function useContainerWidth(): number | null {
  const surface = useContext(WindowBodySurface);
  const [width, setWidth] = useState<number | null>(() =>
    surface.current ? Math.round(surface.current.getBoundingClientRect().width) : null,
  );

  useEffect(() => {
    const host = surface.current;
    if (!host) return undefined;
    const measure = () => setWidth(Math.round(host.getBoundingClientRect().width));
    measure();
    if (typeof ResizeObserver === "undefined") {
      // engines without the observer keep the mount measure — the css
      // @container mirrors still answer the live width on the paint side
      return undefined;
    }
    const observer = new ResizeObserver(measure);
    observer.observe(host);
    return () => observer.disconnect();
  }, [surface]);

  return width;
}

/** useIsMobile — true while the surface the body renders on answers the
 * drawer breakpoint: the window body container inside an os window, the
 * viewport through matchMedia everywhere else (the api keeps its shape —
 * the consumers never learn which surface answered). */
export function useIsMobile(): boolean {
  const containerWidth = useContainerWidth();
  const [viewportMobile, setViewportMobile] = useState(
    () => typeof window !== "undefined" && window.matchMedia(QUERY).matches,
  );

  useEffect(() => {
    const mq = window.matchMedia(QUERY);
    const onChange = (e: MediaQueryListEvent) => setViewportMobile(e.matches);
    setViewportMobile(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return containerWidth === null ? viewportMobile : containerWidth <= BREAKPOINT;
}
