/**
 * androidintro.tsx — the intro of the android target: the opening of an
 * Android app as ONE orchestrated cinematic (~1060ms) — the tile mark lands
 * with the one spring, the wordmark rides in on the display face, then the
 * tile expands over the stage on the sheet curve and the surface hands over
 * to the OS desktop. Every beat animates transform/opacity exactly once (no
 * loops, no scattered fades); one click or any key skips straight to the
 * hand-over; reduced motion hands over instantly.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { SolLogoMark } from "../panel/logo.tsx";

/** the beat plan of the open (ms): the mark lands, the brand rides in, the
 * tile expands and the hand-over fires — one choreography end to end */
const BEATS = { land: 90, brand: 300, expand: 620, done: 1060 } as const;
/** the expansion runs on the sheet curve (no spring) and fades in the tail */
const EXPAND_MS = 420;
const EXPAND_EASING = "cubic-bezier(0.32, 0.72, 0, 1)";
/** the one spring of the mark landing (mild overshoot — never a bounce) */
const SPRING = "cubic-bezier(0.22, 1.24, 0.36, 1)";
/** the Fluent decel curve of the rising beats */
const DECEL = "cubic-bezier(0.1, 0.9, 0.2, 1)";

type AndroidIntroProps = {
  /** the hand-over: fired once, after the expansion beat settles */
  onDone: () => void;
};

export function AndroidIntro({ onDone }: AndroidIntroProps) {
  const [expand, setExpand] = useState(false);
  const tileRef = useRef<HTMLDivElement | null>(null);
  const markRef = useRef<HTMLSpanElement | null>(null);
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
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      handOver();
      return;
    }
    const anims: Animation[] = [];
    if (markRef.current) {
      anims.push(
        markRef.current.animate(
          [
            { opacity: 0, transform: "scale(.6) translateY(18px)" },
            { opacity: 1, transform: "scale(1) translateY(0)" },
          ],
          { duration: 480, delay: BEATS.land, easing: SPRING, fill: "backwards" },
        ),
      );
    }
    if (brandRef.current) {
      anims.push(
        brandRef.current.animate(
          [
            { opacity: 0, transform: "translateY(10px)" },
            { opacity: 1, transform: "translateY(0)" },
          ],
          { duration: 420, delay: BEATS.brand, easing: DECEL, fill: "backwards" },
        ),
      );
    }
    const timers = [
      window.setTimeout(() => setExpand(true), BEATS.expand),
      window.setTimeout(() => handOver(), BEATS.done),
    ];
    return () => {
      for (const timer of timers) window.clearTimeout(timer);
      for (const anim of anims) anim.cancel();
    };
  }, [handOver]);

  useEffect(() => {
    if (!expand) return;
    const tile = tileRef.current;
    if (!tile) return;
    // the rectangle grows over the stage on the sheet curve and fades in
    // the tail, right before the router hands the paint to the desktop
    tile.style.transition = `transform ${EXPAND_MS}ms ${EXPAND_EASING}, opacity 200ms ${EXPAND_EASING} ${EXPAND_MS - 220}ms`;
    tile.style.transform = "scale(40)";
    tile.style.opacity = "0";
  }, [expand]);

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
    <div className="dt-androidintro" role="status" aria-label="DevThink is opening" onClick={handOver}>
      <div ref={tileRef} className="dt-androidintro__tile" aria-hidden="true">
        <span ref={markRef} style={{ display: "grid", placeItems: "center" }}>
          <SolLogoMark size={56} />
        </span>
      </div>
      <div ref={brandRef} className="dt-androidintro__brand" aria-hidden="true">
        <strong style={{ fontFamily: "var(--font-display, var(--dt-sans))" }}>DevThink</strong>
        <span style={{ textTransform: "none", letterSpacing: ".08em" }}>the local os</span>
      </div>
    </div>
  );
}
