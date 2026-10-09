/**
 * intro page anchor — layer 3 of the anchor architecture.
 * The file carrying the folder's own name is the path manager of the page:
 * it imports the loose components beside it, mounts the page and re-exports
 * the public component surface. Only the theme anchor (Sol/Sol.tsx) consumes
 * this file. This anchor carries the former main component of the folder,
 * which now lives here as the page mount itself.
 */

// The opening of the vault APPLICATION (the FAM-APPS reform): a full-viewport
// Mica + noise splash where the drawn mark springs in on the overshoot curve
// cubic-bezier(.34,1.56,.64,1) and the name rises with the backOut — no
// loading dots, no OS boot. The role rides the line: vault GUARDS. The beat
// plan is ~1.6s of open and 0.8s of slide-up exit on cubic-bezier(0.76,0,0.24,1);
// a click or any key skips straight to the hand-over. The sessionStorage flag
// (modeled on the devthink dt.intro.seen key) avoids a replay on client-side
// re-navigation — a cold load always plays — and closing the application
// window lifts the flag so the relaunch plays the opening again.
import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { BrandMark } from "../shell/BrandMark";

/** the sessionStorage flag of the opening (modeled on the family flag
 * `<app>.intro.seen`; a cold load always plays) */
const INTRO_SEEN_KEY = "vault.intro.seen";

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
 * Raises the seen flag so a client-side re-navigation never replays the
 * opening (a cold load starts with a fresh sessionStorage and always plays).
 * Storage failures keep the intro playing on every visit.
 */
export function markIntroSeen(): void {
  try {
    window.sessionStorage.setItem(INTRO_SEEN_KEY, "1");
  } catch {
    /* storage unavailable: the intro simply plays on every visit */
  }
}

/**
 * Lifts the seen flag: closing the application window is a relaunch, and a
 * relaunch plays the opening again.
 */
export function resetIntro(): void {
  try {
    window.sessionStorage.removeItem(INTRO_SEEN_KEY);
  } catch {
    /* storage unavailable: the flag never existed */
  }
}

/** the opening hands the flow to the onboarding walk */
const HANDOVER = "/onboarding";
/** the beat plan of the intro (ms): 1.6s of open, 0.8s of slide-up exit */
const OPEN_MS = 1600;
const EXIT_MS = 800;

/** The intro page: the splash of the vault application, with the skip and
 * the replay guard of the family intro model. */
export default function Intro() {
  const [, navigate] = useLocation();
  const [phase, setPhase] = useState<"open" | "exit">("open");
  const [replay] = useState(() => introSeen());
  const handed = useRef(false);

  const done = useCallback(() => {
    if (handed.current) return;
    handed.current = true;
    navigate(HANDOVER, { replace: true });
  }, [navigate]);

  useEffect(() => {
    // the replay guard: the opening already played this session
    if (replay) {
      done();
      return;
    }
    markIntroSeen();
    // reduced motion: no splash, straight to the walk
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      done();
      return;
    }
    const exitTimer = window.setTimeout(() => setPhase("exit"), OPEN_MS);
    const doneTimer = window.setTimeout(done, OPEN_MS + EXIT_MS + 60);
    // skip: any click or key hands the flow over at once
    const skip = () => done();
    window.addEventListener("keydown", skip);
    window.addEventListener("pointerdown", skip);
    return () => {
      window.clearTimeout(exitTimer);
      window.clearTimeout(doneTimer);
      window.removeEventListener("keydown", skip);
      window.removeEventListener("pointerdown", skip);
    };
  }, [replay, done]);

  if (replay) return null;

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
