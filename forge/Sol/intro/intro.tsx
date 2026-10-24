/**
 * intro page anchor — layer 3 of the anchor architecture.
 * The file carrying the folder's own name is the path manager of the page:
 * it imports the loose components beside it, mounts the page and re-exports
 * the public component surface. Only the theme anchor (Sol/Sol.tsx) consumes
 * this file. This anchor carries the former main component of the folder,
 * which now lives here as the page mount itself.
 */

// The opening of the forge APPLICATION (the flow contract of the reform): a
// full-viewport deep-canvas splash where the drawn mark springs in on the
// Akash overshoot curve cubic-bezier(.34,1.56,.64,1), the name rises with the
// backOut lift and the honest role line fades in under the ~1.6s hold. The
// exit slides the whole stage up over 0.8s (cubic-bezier(0.76,0,0.24,1)) and
// hands the surface DIRECTLY to the onboarding walk — no loading dots, no
// spinner: the mark speaks. A click or any key skips; prefers-reduced-motion
// hands over straight away. The seen stage rides the shared onboardingstate
// accessor (DB-backed, cache-mirrored — this page is the intro writer only;
// the home entry gate decides whether the splash plays at all).
import { useCallback, useEffect, useState } from "react";
import { useLocation } from "wouter";
import { label } from "../../labels";
import { markIntroSeen } from "../../onboardingstate";
import { BrandMark } from "../widgets/shell.brandmark.tsx";

/** how long the brand holds before the exit (ms) — the doctrine asks ~1.6s */
const HOLD_MS = 1600;
/** how long the slide-up exit runs before the hand-over (ms) */
const LEAVE_MS = 800;

/**
 * The intro page: the brand lands, holds ~1.6s, slides up and hands the
 * surface to the onboarding. Click, any key or reduced motion skips.
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
      className="intro"
      data-leaving={leaving ? "true" : undefined}
      role="status"
      aria-label={label("intro.aria")}
      onClick={leave}
      onKeyDown={leave}
    >
      <div className="intro__stage" aria-hidden="true">
        <span className="intro__mark">
          <BrandMark size={96} />
        </span>
        <strong className="intro__word">{label("intro.name")}</strong>
        <p className="intro__line">{label("intro.line")}</p>
      </div>
      <p className="intro__skip" aria-hidden="true">
        {label("intro.skip")}
      </p>
    </div>
  );
}
