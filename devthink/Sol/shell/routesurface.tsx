/**
 * routesurface.tsx — the route transition stage of the theme anchor (the
 * Fluent page grammar of Windows): every page change enters with the 250ms
 * --win-ease-entry decelerate (a 10px rise + fade — the window-open feel)
 * and hands the previous page a REAL 100ms --win-ease-exit exit (a fade +
 * scale settle) rendered from a parked snapshot of the previous tree. The
 * stage keys the entering layer by the page identity, not by the raw
 * location: the panel family (/panel and every deep /w/… workspace route)
 * shares one key, so shell state (the open windows) survives in-family
 * navigation while distinct pages remount and play the transition. Under
 * prefers-reduced-motion the stage skips the exit parking entirely (the
 * entrance dies on the stylesheet hard stop).
 */

import { type ReactNode, useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";

/** The exit pass duration — the one 100ms Windows exit. */
const EXIT_MS = 120;

/**
 * Derives the stable page key of one location: the first path segment,
 * with the panel family collapsed (the deep /w/… workspace routes are the
 * /panel page) and the bare root landing on "home".
 *
 * @param location the router location (pathname with optional search).
 * @returns the page identity the stage keys the entering layer by.
 */
export function routekeyof(location: string): string {
  const clean = location.split("?")[0];
  const head = clean.replace(/^\/+/, "").split("/")[0] || "home";
  if (head === "panel" || head === "w") return "panel";
  return head;
}

/**
 * Answers whether the OS allows motion (the exit parking is the only
 * motion the stage owns in JS — the entrance is stylesheet-owned).
 *
 * @returns false under prefers-reduced-motion, true otherwise.
 */
function motionallowed(): boolean {
  return typeof window === "undefined" || typeof window.matchMedia !== "function"
    ? false
    : !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

type RouteSurfaceProps = {
  /** the route tree (the wouter Switch of the theme anchor) */
  children: ReactNode;
};

export function RouteSurface({ children }: RouteSurfaceProps) {
  const [location] = useLocation();
  const key = routekeyof(location);
  /** the parked previous page, rendered through the exit pass */
  const [leaving, setLeaving] = useState<ReactNode | null>(null);
  /** the last rendered page (its key and its element tree) */
  const prev = useRef<{ key: string; node: ReactNode } | null>(null);

  // the derive-on-render pass: a changed page key parks the previous tree
  // for the exit layer (skipped under reduced motion — the exit dies there)
  if (motionallowed() && prev.current && prev.current.key !== key && prev.current.node) {
    setLeaving(prev.current.node);
  }
  prev.current = { key, node: children };

  // the exit layer lives for exactly one exit pass, then leaves the DOM
  useEffect(() => {
    if (!leaving) return undefined;
    const timer = window.setTimeout(() => setLeaving(null), EXIT_MS);
    return () => window.clearTimeout(timer);
  }, [leaving]);

  return (
    <div className="route-stage">
      {leaving ? (
        <div className="route-leave" aria-hidden="true">
          {leaving}
        </div>
      ) : null}
      <div key={key} className="route-enter">
        {children}
      </div>
    </div>
  );
}
