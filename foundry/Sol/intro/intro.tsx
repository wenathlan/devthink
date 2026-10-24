// the foundry intro of the theme.
/**
 * intro.tsx — the opening splash of the APPLICATION (the flow contract of the
 * reform): the app announces itself before the window — the trylle deep
 * canvas, the drawn mark landing with the Akash spring (the overshoot curve
 * cubic-bezier(.34,1.56,.64,1)), the name rising with the backOut lift and
 * the honest role line fading in under the 1.6s hold. The exit slides the
 * whole stage up over 0.8s (cubic-bezier(0.76,0,0.24,1)) and hands the flow
 * DIRECTLY to the onboarding at /onboarding. No loading dots, no spinner: the
 * mark speaks. A click or any key skips; prefers-reduced-motion hands over
 * straight away. The seen stage rides the shared onboardingstate accessor
 * (DB-backed, cache-mirrored — this page is the intro writer only; the home
 * entry gate decides whether the splash plays at all).
 */
import { useCallback, useEffect, useState } from "react";
import { useLocation } from "wouter";
import { label } from "../../labels";
import { markIntroSeen } from "../../onboardingstate";
import { BrandMark } from "../widgets";

/** how long the brand holds before the exit (ms) — the doctrine asks ~1.6s */
const HOLD_MS = 1600;
/** how long the slide-up exit runs before the hand-over (ms) */
const LEAVE_MS = 800;
/** the walk the intro hands the flow to (the direct hand-over of the flow law) */
const HANDOVER = "/onboarding";

/**
 * The intro page: the brand lands, holds ~1.6s, slides up and hands the flow
 * to the onboarding. Click, any key or reduced motion skips.
 *
 * @returns the intro element.
 */
export default function Intro() {
  const [, navigate] = useLocation();
  const [leaving, setLeaving] = useState(false);

  /** slides the stage up and marks the intro stage seen (skips included). */
  const leave = useCallback(() => {
    markIntroSeen();
    setLeaving(true);
  }, []);

  useEffect(() => {
    // reduced motion skips the choreography and hands over at once
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      markIntroSeen();
      navigate(HANDOVER, { replace: true });
      return;
    }
    const hold = window.setTimeout(leave, HOLD_MS);
    // skip: any click or key hands the flow over at once
    const skip = () => leave();
    window.addEventListener("keydown", skip);
    window.addEventListener("pointerdown", skip);
    return () => {
      window.clearTimeout(hold);
      window.removeEventListener("keydown", skip);
      window.removeEventListener("pointerdown", skip);
    };
  }, [leave, navigate]);

  useEffect(() => {
    // the slide-up runs first; the router hands the paint only after it ends
    if (!leaving) return;
    const handover = window.setTimeout(() => navigate(HANDOVER, { replace: true }), LEAVE_MS);
    return () => window.clearTimeout(handover);
  }, [leaving, navigate]);

  return (
    <div className={leaving ? "intro intro--exit" : "intro"} role="status" aria-label={label("intro.aria")}>
      <div className="intro__stage" aria-hidden="true">
        <span className="intro__mark">
          <BrandMark size={96} />
        </span>
        <strong className="intro__word">{label("intro.name")}</strong>
        <p className="intro__line">{label("intro.line")}</p>
      </div>
      <span className="intro__skip" aria-hidden="true">
        {label("intro.skip")}
      </span>
    </div>
  );
}
