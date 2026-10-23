/**
 * splash.tsx — the opening act of the intro: the akash floor. The mark
 * springs onto the stage (the family spring with the backOut overshoot), the
 * name rises with the same backOut curve, the role line fades in late; the
 * exit slides the whole stage up in exactly 0.8s on the leave curve
 * cubic-bezier(0.76, 0, 0.24, 1) and reveals the landing beneath. No loading
 * dots, no spinner — the akash floor recipe. One click, one tap or any key
 * skips straight to the leave; reduced motion hands over instantly.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { CadriaMark } from "../shell/shell.tsx";

/** the beat plan of the splash (ms): mark 0 → name 140 → role 400 → leave 1250. */
const BEATS = { name: 140, role: 400, leave: 1250 } as const;

/** the exit slide rides exactly 0.8s (the akash leave law). */
const LEAVE_MS = 800;

type SplashProps = {
  /** fired when the stage starts leaving (the seen flag is marked here — leaving counts as seen) */
  onLeave: () => void;
  /** fired after the slide completes (the caller unmounts the splash) */
  onDone: () => void;
};

/**
 * The akash-floor splash over the intro landing.
 *
 * @param props the leave/done hand-over callbacks.
 * @returns the splash element.
 */
export function IntroSplash({ onLeave, onDone }: SplashProps) {
  const [leaving, setLeaving] = useState(false);
  const leaveRef = useRef(onLeave);
  leaveRef.current = onLeave;
  const doneRef = useRef(onDone);
  doneRef.current = onDone;
  const left = useRef(false);
  const timerRef = useRef<number | null>(null);

  /** the single guarded leave: the flag fires once, the stage slides, the done lands. */
  const leave = useCallback(() => {
    if (left.current) return;
    left.current = true;
    leaveRef.current();
    setLeaving(true);
    timerRef.current = window.setTimeout(() => doneRef.current(), LEAVE_MS);
  }, []);

  // the slide timer never outlives the splash
  useEffect(
    () => () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    },
    [],
  );

  // reduced motion hands over instantly — the splash never plays
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      left.current = true;
      leaveRef.current();
      doneRef.current();
      return;
    }
    const timer = window.setTimeout(leave, BEATS.leave);
    return () => window.clearTimeout(timer);
  }, [leave]);

  // one click, one tap or any key skips straight to the leave
  useEffect(() => {
    const skip = (event: MouseEvent | KeyboardEvent): void => {
      if (event.type === "keydown" || (event as MouseEvent).button === 0) leave();
    };
    window.addEventListener("keydown", skip);
    window.addEventListener("pointerdown", skip);
    return () => {
      window.removeEventListener("keydown", skip);
      window.removeEventListener("pointerdown", skip);
    };
  }, [leave]);

  return (
    <div className="cdr-splash" data-leaving={leaving ? "true" : undefined} aria-hidden="true">
      <div className="cdr-splash__stage">
        <span className="cdr-splash__mark">
          <CadriaMark size={96} hidden flow />
        </span>
        <p className="cdr-splash__name">cadria</p>
        <p className="cdr-splash__role">video and image of the family</p>
      </div>
    </div>
  );
}

export default IntroSplash;
