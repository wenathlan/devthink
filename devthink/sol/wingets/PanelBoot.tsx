/** Design: the opening animation of the desktop, in the real Windows boot
 * face (win11React BootScreen): a near-black fullscreen canvas (the doctrine
 * #010001 recipe on the --win-boot token), the white brand mark centered
 * and the STARTUP BAR under it — the original bar of commits 118/140 the
 * owner ordered back (the 168px pill track of sol.css, the 1.6s bootFill
 * sweep with the silver gradient fill and the bootLeadDot bead riding its
 * lead edge; the Fluent ring era of the later pass is retired from the
 * markup by the same order — the ring stylesheet seat stays for the day a
 * face needs it, zero deletion). The screen is REAL: it holds
 * until the panel's own boot work settles (the `ready` prop — the local
 * identity and the preference resolution of the panel anchor) AND the
 * orchestrated minimum window elapsed, then bootOut carries the handover
 * and the desktop fades in on the slowfadein of the doctrine. No fake
 * percentage meter — the bar sweeps on the 1.6s floor that genuinely gates
 * the leave (FILL_MS below answers the bootFill span one to one).
 * Every timing constant below mirrors the sol.css boot grammar exactly:
 * bootMarkIn 700ms on the mark, riseIn 800ms on the wordmark, the 1.6s
 * minimum window (the bootFill span, the orchestrated floor) and bootOut
 * .45s carrying the handover. Plays once per browser session
 * and skips instantly under reduced motion. When the intro page already
 * carried the session-opening animation (the catalogued intro flag of
 * onboardingstate.ts), the desktop never replays a second boot on top of
 * it. */
import { useEffect, useRef, useState } from "react";
import { peekonboardingstate } from "../../onboardingstate.ts";
import { osText } from "../../oslabels.ts";
import { SolLogoMark } from "./PanelLogo.tsx";

const BOOT_KEY = "devthink.boot.done";
/** bootMarkIn / riseIn settle inside this window; the minimum visual floor */
const FILL_MS = 1600;
/** bootOut duration in sol.css — the leaving animation of the whole screen */
const BOOT_OUT_MS = 450;
/** the leave fires at max(FILL_MS, the real boot settle); the handover
 * lands when bootOut finishes (fill + out), never truncating mid-flight */
const BOOT_MS = FILL_MS + BOOT_OUT_MS;

function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function shouldBoot(): boolean {
  try {
    // the intro page owns the session-opening animation: once the intro
    // played (the catalogued flag), the desktop hands straight over without
    // a second boot screen
    if (peekonboardingstate().introseen) return false;
    return window.sessionStorage.getItem(BOOT_KEY) !== "1";
  } catch {
    return true;
  }
}

/** BootScreen — the boot face. `ready` is the REAL boot verdict: the
 * panel anchor flips it once its own boot work (identity, preferences,
 * session resolution) settled; the screen never leaves before it. */
export function BootScreen({ ready = true, onDone }: { ready?: boolean; onDone: () => void }) {
  const [leaving, setLeaving] = useState(false);
  // the play runs once per mount: the callback rides a ref so a parent
  // re-render (a new inline identity every time) never restarts the timers
  const doneRef = useRef(onDone);
  doneRef.current = onDone;
  const startRef = useRef(0);

  useEffect(() => {
    startRef.current = performance.now();
    try {
      window.sessionStorage.setItem(BOOT_KEY, "1");
    } catch {
      // storage may be unavailable; the boot still plays once for this mount
    }
    if (prefersReducedMotion()) {
      doneRef.current();
      return;
    }
  }, []);

  // the REAL gate: the leave waits for the boot work (`ready`) past the
  // orchestrated floor, then bootOut carries the handover to the desktop
  useEffect(() => {
    if (prefersReducedMotion()) return undefined;
    if (!ready) return undefined;
    const elapsed = performance.now() - startRef.current;
    const leave = window.setTimeout(() => setLeaving(true), Math.max(0, FILL_MS - elapsed));
    const finish = window.setTimeout(() => doneRef.current(), Math.max(0, BOOT_MS - elapsed));
    return () => {
      window.clearTimeout(leave);
      window.clearTimeout(finish);
    };
  }, [ready]);

  return (
    <div className={`boot-screen${leaving ? " leaving" : ""}`} role="status" aria-label={osText("boot.aria")}>
      {/* the one mark of the boot zone: the white brand mark centered (the
          mark recolors through currentColor — the boot canvas paints it
          white like the real system logo) */}
      <div className="boot-screen__mark" aria-hidden="true">
        <SolLogoMark size={92} />
      </div>
      <p className="boot-screen__name">{osText("boot.wordmark")}</p>
      <p className="boot-screen__state">{osText("boot.state")}</p>
      {/* the startup bar — the original bar of commits 118/140 the owner
          ordered back: the 168px pill track, the 1.6s bootFill sweep over
          the silver gradient fill and the bootLeadDot bead on its lead
          edge (the sol.css boot zone owns every stroke; the fill span and
          FILL_MS answer each other one to one, so the sweep lands exactly
          as the leave window opens) */}
      <div className="boot-screen__bar" aria-hidden="true">
        <i />
      </div>
    </div>
  );
}
