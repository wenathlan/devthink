/** Design: the opening animation screen — the mark breathes, the bar sweeps,
 * then the surface hands over to the entry or the workspace. Plays once per
 * browser session and skips instantly under reduced motion. */
import { useEffect, useState } from "react";

const BOOT_KEY = "devthink.boot.done";
const BOOT_MS = 1900;

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
    const leave = window.setTimeout(() => setLeaving(true), BOOT_MS);
    const finish = window.setTimeout(onDone, BOOT_MS + 450);
    return () => {
      window.clearTimeout(leave);
      window.clearTimeout(finish);
    };
  }, [onDone]);

  return (
    <div className={`boot-screen${leaving ? " leaving" : ""}`} role="status" aria-label="DevThink is starting">
      <div className="boot-screen__mark" aria-hidden="true">
        <span>dt</span>
      </div>
      <p className="boot-screen__name">DevThink</p>
      <p className="boot-screen__state">opening the local OS</p>
      <div className="boot-screen__bar" aria-hidden="true">
        <i />
      </div>
    </div>
  );
}
