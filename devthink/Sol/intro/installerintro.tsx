/**
 * installerintro.tsx — the intro of the binary targets (installer and
 * extension): a Windows boot slab. The literal deep floor carries the piso
 * Akash — the mark lands on the ONE spring (stiffness 300, damping 15), the
 * wordmark rises on backOut, the boot lines advance once ("preparing the
 * os…", plain text, never a spinner, never loading dots) — and the stage
 * leaves on the 0.8s slide-up (cubic-bezier(0.76, 0, 0.24, 1)) before the
 * surface hands over to the entry flow at /onboarding (the tour opens the
 * landing SaaS at /explore, which continues to the OS desktop). One click or
 * any key skips straight to the hand-over; reduced motion hands over
 * instantly.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import {
  AKASH_BACKOUT,
  AKASH_EXIT,
  AKASH_MICRO,
  AKASH_MARK_FLOOR,
  akashBeat,
  akashSpringTrack,
  prefersReducedMotion,
} from "./akash.ts";
import { SolLogoMark } from "../panel/logo.tsx";

/** the beat plan of the boot (ms): the floor, then one line per step */
const BEATS = { mark: 0, word: 60, firstLine: 400, line: 160, leave: 1250, done: 2140 } as const;
/** the spring window of the mark landing (the decay settles inside it) */
const MARK_MS = 900;
/** the 0.8s slide-up exit window */
const EXIT_MS = 800;

/** the progress lines of the boot, in the owner's own wording */
const LINES = ["preparing the os…", "mounting the apps…", "preparing the session…", "opening the surface…"] as const;

type InstallerIntroProps = {
  /** the hand-over: fired once, after the slide-up completes */
  onDone: () => void;
};

export function InstallerIntro({ onDone }: InstallerIntroProps) {
  const [shown, setShown] = useState(0);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const linesRef = useRef<HTMLUListElement | null>(null);
  const doneRef = useRef(onDone);
  doneRef.current = onDone;
  const finished = useRef(false);

  /** one guarded hand-over shared by the timers, the click and the keyboard */
  const handOver = useCallback(() => {
    if (finished.current) return;
    finished.current = true;
    doneRef.current();
  }, []);

  useEffect(() => {
    if (prefersReducedMotion()) {
      handOver();
      return;
    }
    const anims = [
      // the mark: the ONE spring (real stiffness 300, damping 15)
      akashBeat(stageRef.current?.querySelector<HTMLElement>(".dt-akash__mark") ?? null, akashSpringTrack(AKASH_MARK_FLOOR, 1, MARK_MS), {
        duration: MARK_MS,
        delay: BEATS.mark,
        easing: "linear",
      }),
      akashBeat(stageRef.current?.querySelector<HTMLElement>(".dt-akash__mark") ?? null, [{ opacity: 0 }, { opacity: 1 }], {
        duration: 240,
        delay: BEATS.mark,
        easing: AKASH_MICRO,
      }),
      // the wordmark rises on backOut
      akashBeat(stageRef.current?.querySelector<HTMLElement>(".dt-akash__word") ?? null, [
        { opacity: 0, transform: "translateY(20px)" },
        { opacity: 1, transform: "translateY(0)" },
      ], { duration: 600, delay: BEATS.word, easing: AKASH_BACKOUT }),
    ].filter((anim): anim is Animation => anim !== null);
    const timers: number[] = LINES.map((_, index) =>
      window.setTimeout(() => setShown(index + 1), BEATS.firstLine + index * BEATS.line),
    );
    timers.push(
      window.setTimeout(() => {
        // the exit: the boot stage lifts on the 0.8s slide-up
        akashBeat(
          stageRef.current,
          [
            { transform: "translateY(0)", opacity: 1 },
            { transform: "translateY(-100%)", opacity: 0 },
          ],
          { duration: EXIT_MS, easing: AKASH_EXIT, fill: "forwards" },
        );
      }, BEATS.leave),
      window.setTimeout(() => handOver(), BEATS.done),
    );
    return () => {
      for (const timer of timers) window.clearTimeout(timer);
      for (const anim of anims) anim.cancel();
    };
  }, [handOver]);

  // each boot line rises once as it appears (400ms, the micro curve)
  useEffect(() => {
    if (shown === 0 || prefersReducedMotion()) return;
    const line = linesRef.current?.lastElementChild ?? null;
    akashBeat(
      line,
      [
        { opacity: 0, transform: "translateY(6px)" },
        { opacity: 1, transform: "translateY(0)" },
      ],
      { duration: 400, easing: AKASH_MICRO },
    );
  }, [shown]);

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
    <div className="dt-akash fixed inset-0 z-[90] grid cursor-pointer place-items-center overflow-hidden bg-deep" role="status" aria-label="DevThink is starting" onClick={handOver}>
      <div ref={stageRef} className="relative z-[1] grid justify-items-center gap-6">
        <div className="dt-akash__mark grid h-14 w-14 place-items-center text-ink" aria-hidden="true">
          <SolLogoMark size={40} />
        </div>
        <strong
          className="dt-akash__word font-display text-[26px] font-semibold leading-[1.1] tracking-[-0.02em] text-ink"
          style={{ fontFamily: "var(--font-display)" }}
        >
          DevThink
        </strong>
        <ul ref={linesRef} className="grid justify-items-center gap-1.5" aria-live="polite">
          {LINES.slice(0, shown).map((line) => (
            <li key={line} className="font-mono text-[11px] font-medium tracking-[.08em] text-ink-3">
              {line}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
