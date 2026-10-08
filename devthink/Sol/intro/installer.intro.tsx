/**
 * installer.intro.tsx — the intro of the binary targets (installer and
 * extension): a Windows boot/installation surface. The literal #202020 slab,
 * a Fluent ring-of-dots spinner, the wordmark and the progress lines
 * ("preparing the os…") advance once and the surface goes straight to the
 * OS desktop — the sandbox/binary feeling of a program starting, no SaaS
 * stage. Reduced motion skips straight to the hand-over.
 */
import { useEffect, useRef, useState } from "react";
import { SolLogoMark } from "../panel/logo";

/** the beat plan of the boot (ms): one line per beat, hand-over at the end */
const LINE_MS = 620;
const DONE_MS = LINE_MS * 4 + 180;

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

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      doneRef.current();
      return;
    }
    const timers = LINES.map((_, index) => window.setTimeout(() => setShown(index + 1), (index + 1) * LINE_MS));
    timers.push(window.setTimeout(() => doneRef.current(), DONE_MS));
    return () => {
      for (const timer of timers) window.clearTimeout(timer);
    };
  }, []);

  return (
    <div className="dt-bootintro" role="status" aria-label="DevThink is starting">
      <div className="dt-bootintro__ring" aria-hidden="true">
        <i />
        <i />
        <i />
        <i />
        <i />
      </div>
      <div className="dt-bootintro__mark" aria-hidden="true">
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
