/**
 * intro page anchor — layer 3 of the anchor architecture.
 * The file carrying the folder's own name is the path manager of the page:
 * it imports the loose components beside it, mounts the page and re-exports
 * the public component surface. Only the theme anchor (Sol/Sol.tsx) consumes
 * this file. This anchor carries the former main component of the folder,
 * which now lives here as the page mount itself.
 */

// The opening of the vault APPLICATION (the flow law: intro → onboarding →
// the platform): a full-viewport splash over the deep canvas + noise where
// the drawn mark springs in on the overshoot curve cubic-bezier(.34,1.56,.64,1)
// (the backOut of the akash floor) and the name rises with the same spring —
// no loading dots, no OS boot. The role rides the line: vault GUARDS. The
// beat plan is ~1.6s of open and 0.8s of slide-up exit on cubic-bezier
// (0.76,0,0.24,1); a click or any key skips straight to the hand-over and
// reduced motion hands over instantly. The seen flag rides the ONE accessor
// (onboardingstate.ts — database, cache, memory; the seen-wins law): while
// the read resolves the page renders null, a seen intro hands the flow
// straight over (the relaunch lands in the application, never a replay),
// and the leave marks introseen before the DIRECT hand to /onboarding.
import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { markOnboardingStage, readOnboardingState } from "../../onboardingstate.ts";
import { BrandMark } from "../shell/BrandMark";

/** the beat plan of the intro (ms): 1.6s of open, 0.8s of slide-up exit */
const OPEN_MS = 1600;
const EXIT_MS = 800;

/** the intro lifecycle: resolving (the state read) → playing → handing over. */
type IntroPhase = "resolving" | "playing" | "exit";

/**
 * The intro page: the splash of the vault application, with the skip and
 * the seen law of the flow contract.
 *
 * @returns the intro element (null while the state resolves).
 */
export default function Intro() {
  const [, navigate] = useLocation();
  const [phase, setPhase] = useState<IntroPhase>("resolving");
  const handed = useRef(false);

  /** the guarded hand-over: the intro counts as seen (leaving counts — the
   * visitor answered the stage) and the flow hands DIRECTLY to /onboarding. */
  const handOver = useCallback(() => {
    if (handed.current) return;
    handed.current = true;
    void markOnboardingStage("intro").then(() => navigate("/onboarding", { replace: true }));
  }, [navigate]);

  /** the seen hand-over: the visitor already answered this stage — the flow
   * lands where the law says (onboarding unseen → the walk; else the home). */
  const handThrough = useCallback(() => {
    if (handed.current) return;
    handed.current = true;
    void readOnboardingState().then((state) => navigate(state.onboardingseen ? "/" : "/onboarding", { replace: true }));
  }, [navigate]);

  useEffect(() => {
    let live = true;
    let exitTimer = 0;
    let doneTimer = 0;
    // skip: any click or key hands the flow over at once
    const skip = () => handOver();
    readOnboardingState().then((state) => {
      if (!live) return;
      // the seen law: the splash never replays for a visitor that answered it
      if (state.introseen) {
        handThrough();
        return;
      }
      // reduced motion: no splash, straight to the walk
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        handOver();
        return;
      }
      setPhase("playing");
      exitTimer = window.setTimeout(() => setPhase("exit"), OPEN_MS);
      doneTimer = window.setTimeout(handOver, OPEN_MS + EXIT_MS + 60);
      window.addEventListener("keydown", skip);
      window.addEventListener("pointerdown", skip);
    });
    return () => {
      live = false;
      window.clearTimeout(exitTimer);
      window.clearTimeout(doneTimer);
      window.removeEventListener("keydown", skip);
      window.removeEventListener("pointerdown", skip);
    };
  }, [handOver, handThrough]);

  if (phase === "resolving") return null;

  return (
    <div className={phase === "exit" ? "intro intro--exit" : "intro"} role="status" aria-label="vault is opening">
      <div className="intro__stage" aria-hidden="true">
        <span className="intro__mark">
          <BrandMark size={96} />
        </span>
        <strong className="intro__word">vault</strong>
        <p className="intro__line">vault guards the state of the family.</p>
      </div>
      <span className="intro__skip">click or press any key to continue</span>
    </div>
  );
}
