/**
 * installerintro.tsx — the intro of the binary targets (installer and
 * extension): a Windows boot/installation surface. The literal #202020 slab
 * carries the wordmark and the progress lines ("preparing the os…"), which
 * advance once and hand the surface straight to the OS desktop — the
 * sandbox/binary feeling of a program starting, no SaaS stage, no spinning
 * loop: the choreography is one deterministic 800ms pass. One click or any
 * key skips straight to the hand-over; reduced motion hands over instantly.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { SolLogoMark } from "../panel/logo";

/** the beat plan of the boot (ms): one line per beat, hand-over at 800ms */
const LINE_MS = 160;
const DONE_MS = 800;

/** the progress lines of the boot, in the owner's own wording */
const LINES = ["preparing the os…", "mounting the apps…", "preparing the session…", "opening the panel…"] as const;

type InstallerIntroProps = {
  /** the hand-over: fired once, after the last progress line settles */
  onDone: () => void;
};

export function InstallerIntro({ onDone }: InstallerIntroProps) {
  const [shown, setShown] = useState(0);
  const doneRef = useRef(onDone);
  doneRef.current = onDone;

  /** one guarded hand-over shared by the timers, the click and the keyboard */
  const handOver = useCallback(() => {
    doneRef.current();
  }, []);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      doneRef.current();
      return;
    }
    const timers = LINES.map((_, index) => window.setTimeout(() => setShown(index + 1), (index + 1) * LINE_MS));
    timers.push(window.setTimeout(() => handOver(), DONE_MS));
    return () => {
      for (const timer of timers) window.clearTimeout(timer);
    };
  }, [handOver]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Meta" || event.key === "Control" || event.key === "Alt" || event.key === "Shift") return;
      handOver();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handOver]);

  return (
    /* biome-ignore lint/a11y/useKeyWithClickEvents: the keyboard skip path is the window keydown listener above, so any key skips without focus */
    <div className="dt-bootintro" role="status" aria-label="DevThink is starting" onClick={handOver}>
      <div
        className="dt-bootintro__mark"
        style={{ marginBottom: 18, animation: "dtIntroMarkIn 400ms var(--win-ease-decel) backwards" }}
        aria-hidden="true"
      >
        <SolLogoMark size={40} />
      </div>
      <strong className="dt-bootintro__word">DevThink</strong>
      <ul className="dt-bootintro__lines" aria-live="polite">
        {LINES.slice(0, shown).map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>
    </div>
  );
}
