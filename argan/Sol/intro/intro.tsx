// the argan intro of the theme.
/**
 * intro.tsx — the opening splash of the APPLICATION (F-argan): the app
 * announces itself before the window — the Mica backdrop, the drawn mark
 * landing with the Akash spring (the overshoot curve
 * cubic-bezier(.34,1.56,.64,1)), the name rising with the backOut lift and
 * the honest role line fading in under the 1.6s hold. The exit slides the
 * whole stage up over 0.8s (cubic-bezier(0.76,0,0.24,1)) and hands the
 * surface to the onboarding at /onboarding. No loading dots, no spinner:
 * the mark speaks. A click or any key skips; prefers-reduced-motion hands
 * over straight away. The seen flag (argan.intro.seen) mirrors the
 * devthink/Sol/intro pattern: a cold load always plays, and the flag marks
 * the session opening for future consumers.
 */
import { useCallback, useEffect, useState } from "react";
import { useLocation } from "wouter";
import { ArganMark } from "../shell/Shell";

/** how long the brand holds before the exit (ms) — the doctrine asks ~1.6s */
const HOLD_MS = 1600;
/** how long the slide-up exit runs before the hand-over (ms) */
const LEAVE_MS = 800;
/** the session flag of the opening (mirrors devthink/Sol/intro) */
const INTRO_SEEN_KEY = "argan.intro.seen";

/**
 * Reads the seen flag of this browser session.
 *
 * @returns true when the intro already played this session.
 */
export function introSeen(): boolean {
  try {
    return window.sessionStorage.getItem(INTRO_SEEN_KEY) === "1";
  } catch {
    return false;
  }
}

/**
 * Raises the seen flag when the intro hands the surface over (a cold load
 * starts with a fresh sessionStorage and always plays).
 */
export function markIntroSeen(): void {
  try {
    window.sessionStorage.setItem(INTRO_SEEN_KEY, "1");
  } catch {
    /* storage unavailable: the intro simply plays on every visit */
  }
}

/**
 * The intro page: the brand lands, holds ~1.6s, slides up and hands the
 * surface to the onboarding. Click, any key or reduced motion skips.
 *
 * @returns the intro element.
 */
export default function Intro() {
  const [, navigate] = useLocation();
  const [leaving, setLeaving] = useState(false);

  /** slides the stage up and raises the seen flag (skips included). */
  const leave = useCallback(() => {
    markIntroSeen();
    setLeaving(true);
  }, []);

  useEffect(() => {
    // reduced motion skips the choreography and hands over at once
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      markIntroSeen();
      navigate("/onboarding");
      return;
    }
    const hold = window.setTimeout(leave, HOLD_MS);
    const onKey = () => leave();
    window.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(hold);
      window.removeEventListener("keydown", onKey);
    };
  }, [leave, navigate]);

  useEffect(() => {
    // the slide-up runs first; the router hands the paint only after it ends
    if (!leaving) return;
    const handover = window.setTimeout(() => navigate("/onboarding"), LEAVE_MS);
    return () => window.clearTimeout(handover);
  }, [leaving, navigate]);

  return (
    <div
      className="winintro"
      data-leaving={leaving ? "true" : undefined}
      role="status"
      aria-label="argan is opening"
      onClick={leave}
      onKeyDown={leave}
    >
      <div className="winintro__stage">
        <span className="winintro__mark" aria-hidden="true">
          <ArganMark size={96} />
        </span>
        <h1 className="winintro__name">argan</h1>
        <p className="winintro__role">dns and zones of the family</p>
      </div>
      <p className="winintro__skip" aria-hidden="true">
        click or press any key to skip
      </p>
    </div>
  );
}
