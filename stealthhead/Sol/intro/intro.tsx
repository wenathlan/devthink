// the stealthhead intro of the theme.
/**
 * intro.tsx — the opening splash of the APPLICATION (the flow contract of the
 * reform): the app announces itself before the window — the deep trylle
 * canvas, the drawn mark landing with the Akash spring (the overshoot curve
 * cubic-bezier(.34,1.56,.64,1)), the name rising with the backOut lift and
 * the honest role line fading in under the 1.6s hold. The exit slides the
 * whole stage up over 0.8s (cubic-bezier(0.76,0,0.24,1)) and hands the
 * surface DIRECTLY to the onboarding at /onboarding. No loading dots, no
 * spinner: the mark speaks. A click or any key skips; prefers-reduced-motion
 * hands over straight away. The seen stage rides the shared onboardingstate
 * accessor (DB-backed, cache-mirrored — this page is the intro writer only;
 * the home entry gate decides whether the splash plays at all).
 */
import { useCallback, useEffect, useState } from "react";
import { useLocation } from "wouter";
import { label } from "../../labels";
import { markOnboardingStage } from "../../onboardingstate.ts";
import { BrandMark } from "../widgets/shell.brandmark.tsx";

/** how long the brand holds before the exit (ms) — the doctrine asks ~1.6s */
const HOLD_MS = 1600;
/** how long the slide-up exit runs before the hand-over (ms) */
const LEAVE_MS = 800;

/**
 * The intro page: the brand lands, holds ~1.6s, slides up and hands the
 * surface directly to the onboarding. Click, any key or reduced motion
 * skips. Leaving (the hand-over included) marks the intro stage seen.
 *
 * @returns the intro element.
 */
export default function Intro() {
  const [, navigate] = useLocation();
  const [leaving, setLeaving] = useState(false);

  /** slides the stage up and marks the intro stage seen (skips included). */
  const leave = useCallback(() => {
    void markOnboardingStage("intro");
    setLeaving(true);
  }, []);

  useEffect(() => {
    // reduced motion skips the choreography and hands over at once
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      void markOnboardingStage("intro");
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
      aria-label={label("intro.aria")}
      onClick={leave}
      onKeyDown={leave}
    >
      <div className="winintro__stage">
        <span className="winintro__mark" aria-hidden="true">
          <BrandMark size={96} />
        </span>
        <h1 className="winintro__name">{label("intro.name")}</h1>
        <p className="winintro__role">{label("intro.role")}</p>
      </div>
      <p className="winintro__skip" aria-hidden="true">
        {label("intro.skip")}
      </p>
    </div>
  );
}
