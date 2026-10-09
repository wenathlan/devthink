/**
 * androidintro.tsx — the intro of the android target: the opening of an
 * Android app. One light source (the mica backdrop), the DevThink tile
 * rises once with a spring-free subtle rise (the one-shot dtIntroWordIn
 * keyframe — the overshoot bounce of the old recipe leaves), a second beat
 * expands the tile over the stage on the sheet curve, and the whole
 * choreography completes inside 800ms before the surface hands over to the
 * OS desktop. One click or any key skips straight to the hand-over;
 * reduced motion hands over instantly.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { SolLogoMark } from "../panel/logo";

/** the beat plan of the open (ms): the tile rises, the expansion starts and
 * the hand-over fires — one choreography, 800ms end to end */
const BEATS = { expand: 360, done: 800 } as const;
/** the expansion runs on the sheet curve (no spring) and fades in the tail */
const EXPAND_MS = 420;
const EXPAND_EASING = "cubic-bezier(0.32, 0.72, 0, 1)";

type AndroidIntroProps = {
  /** the hand-over: fired once, after the expansion beat settles */
  onDone: () => void;
};

export function AndroidIntro({ onDone }: AndroidIntroProps) {
  const [expand, setExpand] = useState(false);
  const tileRef = useRef<HTMLDivElement | null>(null);
  const doneRef = useRef(onDone);
  doneRef.current = onDone;

  /** one guarded hand-over shared by the timers, the click and the keyboard */
  const handOver = useCallback(() => {
    doneRef.current();
  }, []);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      doneRef.current();
      return;
    }
    const timers = [
      window.setTimeout(() => setExpand(true), BEATS.expand),
      window.setTimeout(() => handOver(), BEATS.done),
    ];
    return () => {
      for (const timer of timers) window.clearTimeout(timer);
    };
  }, [handOver]);

  useEffect(() => {
    if (!expand) return;
    const tile = tileRef.current;
    if (!tile) return;
    // the rectangle grows over the stage on the sheet curve and fades in
    // the tail, right before the router hands the paint to the desktop
    tile.style.transition = `transform ${EXPAND_MS}ms ${EXPAND_EASING}, opacity 200ms ${EXPAND_EASING} ${EXPAND_MS - 220}ms`;
    tile.style.transform = "scale(40)";
    tile.style.opacity = "0";
  }, [expand]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Meta" || event.key === "Control" || event.key === "Alt" || event.key === "Shift") return;
      handOver();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handOver]);

  return (
    /* biome-ignore lint/a11y/useKeyWithClickEvents: the keyboard skip path is the window keydown listener above, so any key skips without focus */
    <div className="dt-androidintro" role="status" aria-label="DevThink is opening" onClick={handOver}>
      <div
        ref={tileRef}
        className={expand ? "dt-androidintro__tile is-expanding" : "dt-androidintro__tile"}
        style={{ animation: "dtIntroWordIn 320ms var(--win-ease-decel) backwards" }}
        aria-hidden="true"
      >
        <SolLogoMark size={56} />
      </div>
      <div className="dt-androidintro__brand" aria-hidden="true">
        <strong>DevThink</strong>
        <span>the local os</span>
      </div>
    </div>
  );
}
