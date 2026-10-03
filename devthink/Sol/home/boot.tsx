/** Design: the opening animation — the real DevThink mark reveals (the two
 * paths fade+scale in and a sheen sweeps the mark through a mask), the
 * progress bar fills once below the Space Grotesk wordmark, then the surface
 * hands over to the identity, entry or shell. Plays once per browser session
 * and skips instantly under reduced motion. */
import { useEffect, useState } from "react";
import { SolLogoMark } from "./logo";

const BOOT_KEY = "devthink.boot.done";
/** total boot duration before the handover */
const BOOT_MS = 2400;
/** when the leaving animation starts, so it lands inside the total budget */
const LEAVE_MS = 1950;

function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function shouldBoot(): boolean {
  try {
    return window.sessionStorage.getItem(BOOT_KEY) !== "1";
  } catch {
    return true;
  }
}

export function BootScreen({ onDone }: { onDone: () => void }) {
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    try {
      window.sessionStorage.setItem(BOOT_KEY, "1");
    } catch {
      // storage may be unavailable; the boot still plays once for this mount
    }
    if (prefersReducedMotion()) {
      onDone();
      return;
    }
    const leave = window.setTimeout(() => setLeaving(true), LEAVE_MS);
    const finish = window.setTimeout(onDone, BOOT_MS);
    return () => {
      window.clearTimeout(leave);
      window.clearTimeout(finish);
    };
  }, [onDone]);

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
