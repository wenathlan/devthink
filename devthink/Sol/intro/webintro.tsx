/**
 * webintro.tsx — the SaaS intro of the web target. A full-viewport Mica +
 * noise backdrop carries the animated DevThink brand (the Fluent decel curve
 * cubic-bezier(.1,.9,.2,1) — the theme's own --win-ease-decel), a shimmer
 * loading line, and then the free exploration app: the Explore icon appears
 * centered and expands in a ~700ms transform zoom until its rectangle covers
 * the whole viewport, and the surface hands over to the Explore landing.
 * Reduced motion skips straight to the hand-over.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { SolLogoMark } from "../panel/logo";
import { DESKTOP_APPS } from "../shell/appregistry";
import { AppTile } from "../shell/apptile";

/** the icon square the zoom grows from (px, matches .dt-intro__tile) */
const TILE_PX = 96;
/** how long the zoom expansion runs (ms) — the doctrine asks for ~700ms */
const EXPAND_MS = 700;
/** the zoom easing: the Apple-sheet curve measured in the design recipes */
const EXPAND_EASING = "cubic-bezier(0.32, 0.72, 0, 1)";

/** the beat plan of the intro (ms): brand lands, shimmer shows, tile shows,
 * zoom starts, hand-over fires */
const BEATS = { shimmer: 350, tile: 1500, expand: 2100, done: 2100 + EXPAND_MS + 60 } as const;

type WebIntroProps = {
  /** the hand-over: fired once, after the expansion covers the viewport */
  onDone: () => void;
};

/**
 * The diagonal scale that grows the centered tile rectangle past the
 * viewport corners at any window size.
 *
 * @param width the live viewport width.
 * @param height the live viewport height.
 * @returns the scale factor for the tile expansion.
 */
export function tileCoverScale(width: number, height: number): number {
  return Math.hypot(width, height) / TILE_PX;
}

export function WebIntro({ onDone }: WebIntroProps) {
  const [phase, setPhase] = useState<"brand" | "tile" | "expand">("brand");
  const tileRef = useRef<HTMLDivElement | null>(null);
  const doneRef = useRef(onDone);
  doneRef.current = onDone;
  const explore = useMemo(() => DESKTOP_APPS.find((app) => app.id === "explore") ?? DESKTOP_APPS[0], []);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      doneRef.current();
      return;
    }
    const timers = [
      window.setTimeout(() => setPhase("tile"), BEATS.tile),
      window.setTimeout(() => setPhase("expand"), BEATS.expand),
      window.setTimeout(() => doneRef.current(), BEATS.done),
    ];
    return () => {
      for (const timer of timers) window.clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    if (phase !== "expand") return;
    const tile = tileRef.current;
    if (!tile) return;
    // the rectangle grows over the stage and only crossfades away in the
    // final beat, right before the router hands the paint to the landing
    tile.style.transition = `transform ${EXPAND_MS}ms ${EXPAND_EASING}, border-radius ${EXPAND_MS}ms ${EXPAND_EASING}, opacity 200ms ${EXPAND_EASING} ${EXPAND_MS - 220}ms`;
    tile.style.transform = `scale(${tileCoverScale(window.innerWidth, window.innerHeight)})`;
    tile.style.borderRadius = "0px";
    tile.style.opacity = "0";
  }, [phase]);

  return (
    <div className="dt-webintro" role="status" aria-label="DevThink is opening">
      <div className="dt-webintro__stage" aria-hidden="true">
        <div className="dt-webintro__mark">
          <SolLogoMark size={84} accent />
        </div>
        <strong className="dt-webintro__word">DevThink</strong>
        {phase === "brand" && <span className="dt-webintro__shimmer">warming up the free gallery</span>}
      </div>
      {(phase === "tile" || phase === "expand") && (
        <div ref={tileRef} className="dt-webintro__tile" aria-hidden="true">
          <AppTile app={explore} size={64} />
        </div>
      )}
    </div>
  );
}
