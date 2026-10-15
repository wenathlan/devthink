/**
 * androidintro.tsx — the intro of the android target: the opening of an
 * Android app as the piso Akash, one deterministic pass — the app tile lands
 * on the ONE spring (stiffness 300, damping 15), the wordmark rises on
 * backOut, then the tile expands over the stage on the sheet curve
 * (cubic-bezier(0.32, 0.72, 0, 1)) while the brand rides the 0.8s slide-up
 * (cubic-bezier(0.76, 0, 0.24, 1)) and the surface hands over to the entry
 * flow at /onboarding (the tour opens the landing SaaS at /explore, which
 * continues to the OS desktop). Every beat animates transform/opacity exactly
 * once — no loops, no loading dots, no scattered fades; one click or any key
 * skips straight to the hand-over; reduced motion hands over instantly.
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
} from "../../akash.ts";
import { SolLogoMark } from "../panel/logo.tsx";

/** the beat plan of the open (ms): tile spring → brand → expansion → done */
const BEATS = { mark: 0, word: 60, leave: 1250, done: 2140 } as const;
/** the spring window of the tile landing (the decay settles inside it) */
const MARK_MS = 900;
/** the 0.8s exit window shared by the tile expansion and the brand slide-up */
const EXIT_MS = 800;

/** the dark mica floor of the doctrine: #202020 with the fixed indigo core */
const MICA_STYLE = {
  backgroundColor: "#202020",
  backgroundImage: "radial-gradient(#1a1f35 25%, #202020 100%)",
  backgroundAttachment: "fixed",
} as const;

type AndroidIntroProps = {
  /** the hand-over: fired once, after the expansion window completes */
  onDone: () => void;
};

export function AndroidIntro({ onDone }: AndroidIntroProps) {
  const tileRef = useRef<HTMLDivElement | null>(null);
  const brandRef = useRef<HTMLDivElement | null>(null);
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
      // the app tile: the ONE spring (real stiffness 300, damping 15)
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
      // the brand rises on backOut
      akashBeat(
        brandRef.current,
        [
          { opacity: 0, transform: "translateY(20px)" },
          { opacity: 1, transform: "translateY(0)" },
        ],
        { duration: 600, delay: BEATS.word, easing: AKASH_BACKOUT },
      ),
    ].filter((anim): anim is Animation => anim !== null);
    const timers = [
      window.setTimeout(() => {
        // the exit: the tile expands over the stage on the sheet curve while
        // the brand rides the 0.8s slide-up — the open of the android target
        akashBeat(
          tileRef.current,
          [
            { transform: "scale(1)", opacity: 1, offset: 0 },
            { transform: "scale(6)", opacity: 1, offset: 0.5 },
            { transform: "scale(24)", opacity: 0, offset: 1 },
          ],
          { duration: EXIT_MS, easing: AKASH_SHEET, fill: "forwards" },
        );
        akashBeat(
          brandRef.current,
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
    <div className="dt-akash fixed inset-0 z-[90] grid cursor-pointer place-items-center overflow-hidden bg-canvas" style={MICA_STYLE} role="status" aria-label="DevThink is opening" onClick={handOver}>
      <div className="dt-akash__glow" aria-hidden="true" style={{ position: "absolute", inset: "-18%", zIndex: 0, pointerEvents: "none", background: "radial-gradient(1000px 600px at 50% 38%, rgb(255 95 0 / 12%), transparent 62%)" }} />
      <div className="relative z-[1] grid justify-items-center gap-6">
        <div
          ref={tileRef}
          className="grid h-28 w-28 place-items-center rounded-[26px] bg-s0 text-ink ring-1 ring-hairline-strong"
          style={{ boxShadow: "0 1px 2px rgb(0 0 0 / 30%), 0 10px 28px -8px rgb(0 0 0 / 35%)" }}
          aria-hidden="true"
        >
          <SolLogoMark size={60} />
        </div>
        <div ref={brandRef} className="grid justify-items-center gap-1.5" aria-hidden="true">
          <strong
            className="font-display text-[26px] font-semibold leading-[1.1] tracking-[-0.02em] text-ink"
            style={{ fontFamily: "var(--font-display)" }}
          >
            DevThink
          </strong>
          <span className="font-mono text-[10px] font-medium tracking-[.08em] text-ink-3">the local os</span>
        </div>
      </div>
    </div>
  );
}
