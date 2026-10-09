/** Design: the opening animation of the desktop — one orchestrated entrance
 * (70ms steps: the real DevThink mark with the two official paths lands with
 * a discreet fade+scale and then breathes in the idle loop, the wordmark and
 * role line rise behind it and the progress meter fills once with its
 * tabular-nums mono readout counting in sync); no sheens, no dissolving
 * text. The surface then hands over straight to the desktop. Every timing
 * constant below mirrors the sol.css boot grammar exactly: bootMarkIn 700ms
 * on the mark, riseIn 800ms on the wordmark, bootFill 1.6s on the bar (so
 * the fill completes exactly when the leave starts) and bootOut .45s
 * carrying the handover. Plays once per browser session and skips instantly
 * under reduced motion. When the intro page already carried the
 * session-opening animation (dt.intro.seen), the desktop never replays a
 * second boot on top of it. */
import { useEffect, useRef, useState } from "react";
import { INTRO_SEEN_KEY } from "../../introtarget";
import { SolLogoMark } from "./logo";

const BOOT_KEY = "devthink.boot.done";
/** bootMarkIn / riseIn settle inside this window; bootFill runs 0→1600ms */
const FILL_MS = 1600;
/** bootOut duration in sol.css — the leaving animation of the whole screen */
const BOOT_OUT_MS = 450;
/** the leave starts the instant the bar completes; the handover lands when
 * bootOut finishes (1600 + 450), never truncating the keyframe mid-flight */
const LEAVE_MS = FILL_MS;
const BOOT_MS = FILL_MS + BOOT_OUT_MS;

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
  /** the meter readout, 0→100 in lockstep with the 1.6s bar fill */
  const [pct, setPct] = useState(0);
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
      setPct(100);
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

  // the tabular meter: one rAF tracks the fill window, stopping at 100
  useEffect(() => {
    if (prefersReducedMotion()) return undefined;
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const value = Math.min(100, Math.round(((now - start) / FILL_MS) * 100));
      setPct(value);
      if (value < 100) frame = window.requestAnimationFrame(tick);
    };
    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, []);

  return (
    <div className={`boot-screen${leaving ? " leaving" : ""}`} role="status" aria-label="DevThink is starting">
      {/* the one mark of the boot zone: mark + name + role line as the single opening lockup */}
      <div className="boot-screen__mark" aria-hidden="true">
        <SolLogoMark size={92} />
      </div>
      <p className="boot-screen__name">DevThink</p>
      <p className="boot-screen__state">opening the local os</p>
      <div className="boot-screen__bar" aria-hidden="true">
        <i />
      </div>
      <p className="boot-screen__readout" aria-hidden="true">
        {String(pct).padStart(3, "0")}%
      </p>
    </div>
  );
}
