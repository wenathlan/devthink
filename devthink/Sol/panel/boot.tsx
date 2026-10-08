/** Design: the opening animation of the desktop — the real DevThink mark (the
 * two official paths) lands with a discreet fade+scale, the Space Grotesk
 * wordmark fades in and the progress bar fills once; no sheens, no dissolving
 * text. The surface then hands over straight to the desktop. Plays once per
 * browser session and skips instantly under reduced motion. When the intro
 * page already carried the session-opening animation (dt.intro.seen), the
 * desktop never replays a second boot on top of it. */
import { useEffect, useRef, useState } from "react";
import { INTRO_SEEN_KEY } from "../../intro.target";
import { SolLogoMark } from "./logo";

const BOOT_KEY = "devthink.boot.done";
/** total boot duration before the handover */
const BOOT_MS = 2000;
/** when the leaving animation starts, so it lands inside the total budget */
const LEAVE_MS = 1600;

function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function shouldBoot(): boolean {
  try {
    // the intro page owns the session-opening animation: once it played this
    // session, the desktop hands straight over without a second boot screen
    if (window.sessionStorage.getItem(INTRO_SEEN_KEY) === "1") return false;
    return window.sessionStorage.getItem(BOOT_KEY) !== "1";
  } catch {
    return true;
  }
}

export function BootScreen({ onDone }: { onDone: () => void }) {
  const [leaving, setLeaving] = useState(false);
  // the play runs once per mount: the callback rides a ref so a parent
  // re-render (a new inline identity every time) never restarts the timers
  const doneRef = useRef(onDone);
  doneRef.current = onDone;

  useEffect(() => {
    try {
      window.sessionStorage.setItem(BOOT_KEY, "1");
    } catch {
      // storage may be unavailable; the boot still plays once for this mount
    }
    if (prefersReducedMotion()) {
      doneRef.current();
      return;
    }
    const leave = window.setTimeout(() => setLeaving(true), LEAVE_MS);
    const finish = window.setTimeout(() => doneRef.current(), BOOT_MS);
    return () => {
      window.clearTimeout(leave);
      window.clearTimeout(finish);
    };
  }, []);

  return (
    <div className={`boot-screen${leaving ? " leaving" : ""}`} role="status" aria-label="DevThink is starting">
      <div className="boot-screen__mark" aria-hidden="true">
        <SolLogoMark size={92} />
      </div>
      <p className="boot-screen__name">DevThink</p>
      <p className="boot-screen__state">opening the local OS</p>
      <div className="boot-screen__bar" aria-hidden="true">
        <i />
      </div>
    </div>
  );
}
