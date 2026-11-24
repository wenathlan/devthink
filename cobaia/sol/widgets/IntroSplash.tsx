/**
 * intro.splash.tsx — the opening act of the cobaia intro: the akash floor of
 * the family. The drawn mark springs onto the deep canvas on the overshoot
 * curve cubic-bezier(.34,1.56,.64,1), the name rises with the same backOut
 * spring, the role line fades in late; the exit slides the whole overlay up
 * in exactly 0.8s on the leave curve cubic-bezier(0.76,0,0.24,1) and reveals
 * the landing beneath. No loading dots, no spinner — the mark speaks. One
 * click, one tap or any key skips straight to the leave; prefers-reduced-
 * motion hands over instantly. The cobaia no storage law holds: the splash
 * writes nothing to the visitor machine — no seen flag, no cache row — it
 * plays per visit to /intro and leaves nothing behind, so the leave marks
 * nothing and the done callback is the only hand-over.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { label } from "../../labels";
import { BrandMark } from "./ShellBrand.tsx";

/** the beat plan of the splash (ms): mark 0 → name 140 → role 400 → leave 1250. */
const BEATS = { name: 140, role: 400, leave: 1250 } as const;

/** the exit slide rides exactly 0.8s (the akash leave law). */
const LEAVE_MS = 800;

type SplashProps = {
  /** fired after the slide completes (the caller unmounts the splash) */
  onDone: () => void;
};

/**
 * The akash-floor splash over the intro landing.
 *
 * @param props the done hand-over callback.
 * @returns the splash element.
 */
export function IntroSplash({ onDone }: SplashProps) {
  const [leaving, setLeaving] = useState(false);
  const doneRef = useRef(onDone);
  doneRef.current = onDone;
  const left = useRef(false);
  const timerRef = useRef<number | null>(null);

  /** the single guarded leave: the stage slides once, the done lands after
   * the slide — the leave marks nothing (the no storage law). */
  const leave = useCallback(() => {
    if (left.current) return;
    left.current = true;
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
    <div
      className="cb-splash"
      data-leaving={leaving ? "true" : undefined}
      role="status"
      aria-label={label("intro.aria.splash")}
    >
      <div className="cb-splash__stage" aria-hidden="true">
        <span className="cb-splash__mark">
          <BrandMark size={96} />
        </span>
        <p className="cb-splash__name">{label("intro.splash.name")}</p>
        <p className="cb-splash__role">{label("intro.splash.role")}</p>
      </div>
      <span className="cb-splash__skip" aria-hidden="true">
        {label("intro.splash.skip")}
      </span>
    </div>
  );
}

export default IntroSplash;
