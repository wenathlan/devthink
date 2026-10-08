/**
 * android.intro.tsx — the intro of the android target: the opening of an
 * Android app. The DevThink tile drops in with a bounce (the overshoot curve
 * measured in the design recipes, cubic-bezier(0.34, 1.56, 0.64, 1)), a
 * second beat expands the tile, then the surface hands over to the OS
 * desktop. Reduced motion skips straight to the hand-over.
 */
import { useEffect, useRef, useState } from "react";
import { SolLogoMark } from "../panel/logo";

type AndroidIntroProps = {
  /** the hand-over: fired once, after the expansion beat settles */
  onDone: () => void;
};

/** the beat plan of the open (ms): land, breathe, expand, hand over */
const BEATS = { expand: 1450, done: 2150 } as const;

export function AndroidIntro({ onDone }: AndroidIntroProps) {
  const [expand, setExpand] = useState(false);
  const doneRef = useRef(onDone);
  doneRef.current = onDone;

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      doneRef.current();
      return;
    }
    const timers = [
      window.setTimeout(() => setExpand(true), BEATS.expand),
      window.setTimeout(() => doneRef.current(), BEATS.done),
    ];
    return () => {
      for (const timer of timers) window.clearTimeout(timer);
    };
  }, []);

  return (
    <div className="dt-androidintro" role="status" aria-label="DevThink is opening">
      <div className={expand ? "dt-androidintro__tile is-expanding" : "dt-androidintro__tile"} aria-hidden="true">
        <SolLogoMark size={56} />
      </div>
      <div className="dt-androidintro__brand" aria-hidden="true">
        <strong>DevThink</strong>
        <span>the local os</span>
      </div>
    </div>
  );
}
