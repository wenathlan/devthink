/**
 * webintro.tsx — the SaaS intro of the web target: ONE orchestrated
 * cinematic, 1140ms end to end, beat by beat —
 *
 *   0ms    the warm light rises over the graphite mica (one ember breath)
 *   120ms  the mark lands with the ONE spring (scale .64 → 1, mild overshoot)
 *   380ms  the wordmark rides in on the display face (rise + decel)
 *   560ms  the role line settles under it (mono, lowercase)
 *   860ms  the stage fades on the sheet curve and the surface hands over
 *
 * to the Explore landing. Every beat animates transform/opacity exactly once
 * (no loops, no shimmer, no scattered fades) through the Web Animations API,
 * so the choreography never depends on stylesheet keyframes. One click or
 * any key skips straight to the hand-over; reduced motion hands over
 * instantly. The mark appears once, center stage — the chrome carries it
 * everywhere else.
 */
import { useCallback, useEffect, useRef } from "react";
import { SolLogoMark } from "../panel/logo";

/** the beat plan of the cinematic (ms): light → mark → word → role → fade → hand-over */
const BEATS = { light: 0, mark: 120, word: 380, role: 560, leave: 860, done: 1140 } as const;
/** the hand-over fade: sheet curve, opacity only, one pass */
const LEAVE_MS = 280;
const LEAVE_EASING = "cubic-bezier(0.32, 0.72, 0, 1)";
/** the one spring of the mark landing (mild overshoot — never a bounce) */
const SPRING = "cubic-bezier(0.22, 1.24, 0.36, 1)";
/** the Fluent decel curve of the rising beats */
const DECEL = "cubic-bezier(0.1, 0.9, 0.2, 1)";

/** the warm light source of the stage: one ember radial over the graphite mica */
const GLOW_STYLE = {
  position: "absolute",
  inset: "-18%",
  zIndex: 0,
  pointerEvents: "none",
  background:
    "radial-gradient(1100px 640px at 50% 34%, rgb(255 95 0 / 15%), transparent 62%), radial-gradient(720px 480px at 50% 46%, rgb(255 176 58 / 9%), transparent 58%)",
} as const;

/** the role line under the wordmark: mono, lowercase, quiet */
const ROLE_STYLE = {
  margin: "6px 0 0",
  color: "var(--dt-faint)",
  font: "500 10px var(--dt-mono)",
  letterSpacing: ".08em",
} as const;

type WebIntroProps = {
  /** the hand-over: fired once, after the stage fade completes */
  onDone: () => void;
};

export function WebIntro({ onDone }: WebIntroProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const glowRef = useRef<HTMLDivElement | null>(null);
  const markRef = useRef<HTMLDivElement | null>(null);
  const wordRef = useRef<HTMLElement | null>(null);
  const roleRef = useRef<HTMLSpanElement | null>(null);
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
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      handOver();
      return;
    }
    /** one beat: a single transform/opacity animation, backwards fill */
    const beat = (el: Element | null, frames: Keyframe[], options: KeyframeAnimationOptions): Animation | null => {
      if (!el) return null;
      return el.animate(frames, { fill: "backwards", ...options });
    };
    const anims = [
      beat(
        glowRef.current,
        [
          { opacity: 0, transform: "scale(1.05)" },
          { opacity: 1, transform: "scale(1)" },
        ],
        { duration: 520, delay: BEATS.light, easing: DECEL },
      ),
      beat(
        markRef.current,
        [
          { opacity: 0, transform: "scale(.64)" },
          { opacity: 1, transform: "scale(1)" },
        ],
        { duration: 560, delay: BEATS.mark, easing: SPRING },
      ),
      beat(
        wordRef.current,
        [
          { opacity: 0, transform: "translateY(16px)" },
          { opacity: 1, transform: "translateY(0)" },
        ],
        { duration: 460, delay: BEATS.word, easing: DECEL },
      ),
      beat(
        roleRef.current,
        [
          { opacity: 0, transform: "translateY(8px)" },
          { opacity: 1, transform: "translateY(0)" },
        ],
        { duration: 380, delay: BEATS.role, easing: DECEL },
      ),
    ].filter((anim): anim is Animation => anim !== null);
    const timers = [
      window.setTimeout(() => {
        rootRef.current?.animate([{ opacity: 1 }, { opacity: 0 }], {
          duration: LEAVE_MS,
          easing: LEAVE_EASING,
          fill: "forwards",
        });
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
    <div ref={rootRef} className="dt-webintro" role="status" aria-label="DevThink is opening" onClick={handOver}>
      <div ref={glowRef} className="dt-webintro__glow" style={GLOW_STYLE} aria-hidden="true" />
      <div className="dt-webintro__stage" style={{ position: "relative", zIndex: 1 }} aria-hidden="true">
        <div ref={markRef} className="dt-webintro__mark">
          <SolLogoMark size={84} accent />
        </div>
        <strong
          ref={wordRef}
          className="dt-webintro__word"
          style={{ fontFamily: "var(--font-display, var(--dt-sans))" }}
        >
          DevThink
        </strong>
        <span ref={roleRef} className="dt-webintro__role" style={ROLE_STYLE}>
          the local os
        </span>
      </div>
    </div>
  );
}
