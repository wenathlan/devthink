/**
 * webintro.tsx — the SaaS intro of the web target. One light source (the
 * mica + grain backdrop carries a single radial glow), the DevThink brand
 * lands on the Fluent decel curve (cubic-bezier(.1,.9,.2,1) — the theme's
 * own --win-ease-decel) with a spring-free subtle rise, and the whole
 * choreography completes inside 800ms: the stage breathes once, fades out
 * over the final beat and the surface hands over to the Explore landing.
 * One click or any key skips straight to the hand-over; reduced motion
 * hands over instantly.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { SolLogoMark } from "../panel/logo";

/** the beat plan of the intro (ms): the brand settles, the stage fades, the
 * hand-over fires — one choreography, 800ms end to end */
const BEATS = { leave: 560, done: 800 } as const;
/** the leave fade: transform/opacity only, spring-free, no sheen */
const LEAVE_MS = 240;
const LEAVE_EASING = "cubic-bezier(0.32, 0.72, 0, 1)";

type WebIntroProps = {
  /** the hand-over: fired once, after the stage fade completes */
  onDone: () => void;
};

export function WebIntro({ onDone }: WebIntroProps) {
  const [leaving, setLeaving] = useState(false);
  const stageRef = useRef<HTMLDivElement | null>(null);
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
    const timers = [
      window.setTimeout(() => setLeaving(true), BEATS.leave),
      window.setTimeout(() => handOver(), BEATS.done),
    ];
    return () => {
      for (const timer of timers) window.clearTimeout(timer);
    };
  }, [handOver]);

  useEffect(() => {
    if (!leaving) return;
    const stage = stageRef.current;
    if (!stage) return;
    stage.style.transition = `opacity ${LEAVE_MS}ms ${LEAVE_EASING}`;
    stage.style.opacity = "0";
  }, [leaving]);

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
    <div className="dt-webintro" role="status" aria-label="DevThink is opening" onClick={handOver}>
      <div ref={stageRef} className="dt-webintro__stage" aria-hidden="true">
        <div className="dt-webintro__mark">
          <SolLogoMark size={84} accent />
        </div>
        <strong className="dt-webintro__word">DevThink</strong>
        <span
          className="dt-webintro__line"
          style={{
            margin: "6px 0 0",
            color: "var(--dt-faint)",
            font: "500 9px var(--dt-mono)",
            letterSpacing: ".22em",
            textTransform: "uppercase",
            animation: "dtIntroWordIn 500ms var(--win-ease-decel) 260ms backwards",
          }}
        >
          the local os
        </span>
      </div>
    </div>
  );
}
