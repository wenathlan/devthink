/**
 * webintro.tsx — the intro of the web target: the piso Akash, one
 * deterministic pass, beat by beat —
 *
 *    0ms   the mark tile lands on the ONE spring (stiffness 300, damping 15)
 *   60ms   the wordmark rises on backOut
 *  120ms   the role line settles under it (the doctrine micro)
 * 1250ms   the exit: the tile zooms over the stage on the sheet curve
 *          (cubic-bezier(0.32, 0.72, 0, 1)) while the stage rides the 0.8s
 *          slide-up (cubic-bezier(0.76, 0, 0.24, 1))
 * 2140ms   the surface hands over to the entry flow at /onboarding
 *
 * to the onboarding tour (whose finish opens the landing SaaS at /explore —
 * the "enter devthink" CTA there continues to the OS desktop). Every beat
 * animates transform/opacity exactly once — no loops, no shimmer, no loading
 * dots, no scattered fades — through the Web Animations API, so the
 * choreography never depends on stylesheet keyframes. One click or any key
 * skips straight to the hand-over; reduced motion hands over instantly. The
 * mark appears once, center stage — the chrome carries it everywhere else.
 */
import { useCallback, useEffect, useRef } from "react";
import {
  AKASH_BACKOUT,
  AKASH_EXIT,
  AKASH_MICRO,
  AKASH_SHEET,
  AKASH_MARK_FLOOR,
  akashBeat,
  akashSpringTrack,
  prefersReducedMotion,
} from "./akash.ts";
import { SolLogoMark } from "../panel/logo.tsx";

/** the beat plan of the floor (ms): mark spring → word → role → exit → done */
const BEATS = { mark: 0, word: 60, role: 120, leave: 1250, done: 2140 } as const;
/** the spring window of the mark landing (the decay settles inside it) */
const MARK_MS = 900;
/** the 0.8s exit window shared by the tile zoom and the stage slide-up */
const EXIT_MS = 800;

/** the dark mica floor of the doctrine: #202020 with the fixed indigo core */
const MICA_STYLE = {
  backgroundColor: "#202020",
  backgroundImage: "radial-gradient(#1a1f35 25%, #202020 100%)",
  backgroundAttachment: "fixed",
} as const;

/** the warm light source of the floor: one ember radial over the graphite mica */
const GLOW_STYLE = {
  position: "absolute",
  inset: "-18%",
  zIndex: 0,
  pointerEvents: "none",
  background:
    "radial-gradient(1100px 640px at 50% 34%, rgb(255 95 0 / 15%), transparent 62%), radial-gradient(720px 480px at 50% 46%, rgb(255 176 58 / 9%), transparent 58%)",
} as const;

type WebIntroProps = {
  /** the hand-over: fired once, after the exit window completes */
  onDone: () => void;
};

export function WebIntro({ onDone }: WebIntroProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const tileRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
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
      // the mark tile: the ONE spring (real stiffness 300, damping 15)
      akashBeat(tileRef.current, akashSpringTrack(AKASH_MARK_FLOOR, 1, MARK_MS), {
        duration: MARK_MS,
        delay: BEATS.mark,
        easing: "linear",
      }),
      akashBeat(tileRef.current, [{ opacity: 0 }, { opacity: 1 }], {
        duration: 240,
        delay: BEATS.mark,
        easing: AKASH_MICRO,
      }),
      // the wordmark rises on backOut, the role settles on the micro curve
      akashBeat(
        stageRef.current?.querySelector<HTMLElement>(".dt-akash__word") ?? null,
        [
          { opacity: 0, transform: "translateY(20px)" },
          { opacity: 1, transform: "translateY(0)" },
        ],
        { duration: 600, delay: BEATS.word, easing: AKASH_BACKOUT },
      ),
      akashBeat(
        stageRef.current?.querySelector<HTMLElement>(".dt-akash__role") ?? null,
        [
          { opacity: 0, transform: "translateY(10px)" },
          { opacity: 1, transform: "translateY(0)" },
        ],
        { duration: 500, delay: BEATS.role, easing: AKASH_MICRO },
      ),
    ].filter((anim): anim is Animation => anim !== null);
    const timers = [
      window.setTimeout(() => {
        // the exit: the tile zooms over the stage on the sheet curve while
        // the stage rides the 0.8s slide-up — the expansion of the web intro
        akashBeat(
          tileRef.current,
          [
            { transform: "scale(1)", opacity: 1, offset: 0 },
            { transform: "scale(5)", opacity: 1, offset: 0.5 },
            { transform: "scale(22)", opacity: 0, offset: 1 },
          ],
          { duration: EXIT_MS, easing: AKASH_SHEET, fill: "forwards" },
        );
        akashBeat(
          stageRef.current,
          [
            { transform: "translateY(0)", opacity: 1 },
            { transform: "translateY(-48px)", opacity: 0 },
          ],
          { duration: EXIT_MS, easing: AKASH_EXIT, fill: "forwards" },
        );
      }, BEATS.leave),
      window.setTimeout(() => handOver(), BEATS.done),
    ];
    return () => {
      for (const timer of timers) window.clearTimeout(timer);
      for (const anim of anims) anim.cancel();
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
    <div ref={rootRef} className="dt-akash fixed inset-0 z-[90] grid cursor-pointer place-items-center overflow-hidden bg-canvas" style={MICA_STYLE} role="status" aria-label="DevThink is opening" onClick={handOver}>
      <div className="dt-akash__glow" style={GLOW_STYLE} aria-hidden="true" />
      <div ref={stageRef} className="relative z-[1] grid justify-items-center gap-5" aria-hidden="true">
        <div
          ref={tileRef}
          className="dt-akash__tile grid h-24 w-24 place-items-center rounded-2xl bg-s0 text-ink ring-1 ring-hairline-strong"
          style={{ boxShadow: "0 1px 2px rgb(0 0 0 / 30%), 0 8px 24px -8px rgb(0 0 0 / 35%)" }}
        >
          <SolLogoMark size={52} accent />
        </div>
        <div className="grid justify-items-center gap-1.5">
          <strong
            className="dt-akash__word font-display text-[30px] font-semibold leading-[1.1] tracking-[-0.02em] text-ink"
            style={{ fontFamily: "var(--font-display)" }}
          >
            DevThink
          </strong>
          <span className="dt-akash__role font-mono text-[10px] font-medium tracking-[.08em] text-ink-3">
            the local os
          </span>
        </div>
      </div>
    </div>
  );
}
