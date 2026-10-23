/**
 * onboarding page anchor — layer 3 of the anchor architecture.
 * The file carrying the folder's own name is the path manager of the page:
 * it imports the loose components beside it, mounts the page and re-exports
 * the public component surface. Only the theme anchor (Sol/Sol.tsx) consumes
 * this file. The onboarding is the second page of the owner flow (intro →
 * onboarding → explore): a frame-a-frame tour — 4 frames — dressed in the
 * window grammar and dressed in the trylle card system: the tour window is a
 * stepped surface (one ladder step above the canvas), radius 1rem, the
 * Linear shadow with its ring, and every control is at least 44px tall. The
 * real title bar carries the red close glyph (close = skip = seen). Every
 * exit raises the onboarding flag through onboardingstate.ts (the only
 * writer) and hands the surface to /explore.
 *
 * Motion: the window rises from the modal floor (.96 — never zero) on the
 * doctrine micro curve; every frame re-keys its beats (art, eyebrow, title,
 * body) into a 60ms stagger of 450ms rises; the dismiss is a 400ms exit.
 * The choreography rides the Web Animations API (no stylesheet keyframes)
 * and every effect answers the reduced-motion query by skipping itself.
 */
import { DismissRegular as X } from "@fluentui/react-icons";
import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { writeonboardingstage } from "../../onboardingstate";
import { osText } from "../../oslabels.ts";
import { SolLogoMark } from "../components/panel.logo.tsx";
import { ONBOARDING_STEPS, StepArt } from "../components/onboarding.steps.tsx";

export * from "../components/onboarding.steps.tsx";

/** The finish target of the flow: explore is the free SaaS surface. */
export const ONBOARDING_HANDOVER = "/explore";

/** the doctrine micro curve of every quiet entrance */
const MICRO = "cubic-bezier(0.22, 1, 0.36, 1)";
/** the exit curve of the dismiss */
const EXIT = "cubic-bezier(0.76, 0, 0.24, 1)";
/** the Linear shadow with its ring, on the tour window (ring first, then the
 * doubling soft layers — the trylle/Linear DNA) */
const WINDOW_SHADOW =
  "0 0 0 1px rgb(0 0 0 / 32%), 0 1px 2px rgb(0 0 0 / 22%), 0 3px 12px rgb(0 0 0 / 9%), 0 24px 48px -12px rgb(0 0 0 / 30%)";
/** the trylle primary tone stack of the "enter devthink" CTA (the exact
 * rest stack of the quality ruler) */
const PRIMARY_STACK =
  "inset 0 1.2px 0 0 #ffffff73, inset 0 8px 14px -6px #ffffff38, inset 0 0 0 1px #ffffff2e, 0 0 0 1px oklch(14% 0 0), 0 1px 2px #00000038, 0 3px 5px -1px #00000047";

/** true when the visitor asked the system to reduce motion */
function motionReduced(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Onboarding — the frame-a-frame tour. The window chrome carries the real
 * close glyph (close = skip = seen); the footer carries back/next/finish and
 * the quiet skip, every control at least 44px tall with the press scale of
 * the touch law; the keyboard walks the frames (→/←/Enter, Esc skips —
 * Enter yields to a focused control so a button press never double-fires).
 * Every exit raises the onboarding stage once through onboardingstate.ts,
 * then navigates to /explore.
 */
export default function Onboarding() {
  const [, navigate] = useLocation();
  const [index, setIndex] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const windowRef = useRef<HTMLElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const total = ONBOARDING_STEPS.length;
  const last = index === total - 1;

  /** One guarded exit: mark the onboarding seen, hand over to /explore. */
  const finish = useCallback(() => {
    if (leaving) return;
    setLeaving(true);
    writeonboardingstage("onboarding").finally(() => navigate(ONBOARDING_HANDOVER));
  }, [leaving, navigate]);

  const next = useCallback(() => {
    if (last) finish();
    else setIndex((value) => Math.min(value + 1, total - 1));
  }, [last, finish]);

  const back = useCallback(() => setIndex((value) => Math.max(value - 1, 0)), []);

  useEffect(() => {
    const onkey = (event: KeyboardEvent) => {
      if (event.key === "Escape") finish();
      // Enter on a focused button already answers its click — the walk must
      // not double-fire, so the key yields to the control (→/← never conflict)
      const onControl = event.target instanceof HTMLElement && event.target.closest("button") !== null;
      if (event.key === "ArrowRight" || (event.key === "Enter" && !onControl)) next();
      if (event.key === "ArrowLeft") back();
    };
    window.addEventListener("keydown", onkey);
    return () => window.removeEventListener("keydown", onkey);
  }, [finish, next, back]);

  // the window entrance: the modal floor pose (.96 — never zero) rising to
  // rest on the doctrine micro curve, one pass
  useEffect(() => {
    if (motionReduced()) return;
    const entrance = windowRef.current?.animate(
      [
        { opacity: 0, transform: "scale(0.96)" },
        { opacity: 1, transform: "scale(1)" },
      ],
      { duration: 500, easing: MICRO, fill: "backwards" },
    );
    return () => entrance?.cancel();
  }, []);

  // the frame entrance: the beats of one frame rise in a 60ms stagger —
  // the stage re-keys per index, so the stagger replays on every frame
  // biome-ignore lint/correctness/useExhaustiveDependencies: index is the re-key signal — the effect must replay the stagger on every frame change even though the stage is read through the ref
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || motionReduced()) return;
    const beats = Array.from(stage.querySelectorAll<HTMLElement>("[data-frame-beat]")).map((el, position) =>
      el.animate(
        [
          { opacity: 0, transform: "translateY(12px)" },
          { opacity: 1, transform: "translateY(0)" },
        ],
        { duration: 450, delay: position * 60, easing: MICRO, fill: "backwards" },
      ),
    );
    return () => {
      for (const beat of beats) beat.cancel();
    };
  }, [index]);

  // the dismiss: the window lifts on the exit curve while the flag writes
  useEffect(() => {
    if (!leaving || motionReduced()) return;
    windowRef.current?.animate(
      [
        { opacity: 1, transform: "translateY(0)" },
        { opacity: 0, transform: "translateY(-24px)" },
      ],
      { duration: 400, easing: EXIT, fill: "forwards" },
    );
  }, [leaving]);

  const step = ONBOARDING_STEPS[index] as (typeof ONBOARDING_STEPS)[number];

  return (
    <div className="ob-root">
      <section
        ref={windowRef}
        className="ob-window"
        style={{ boxShadow: WINDOW_SHADOW }}
        role="dialog"
        aria-modal="true"
        aria-label={osText("onboarding.aria")}
      >
        {/* the window grammar: the real 28px title bar with the red close glyph */}
        <header className="ob-titlebar">
          <span className="ob-brand">
            <SolLogoMark size={14} />
            {osText("onboarding.brand")}
          </span>
          <span className="ob-caption">{osText("onboarding.caption")}</span>
          <button type="button" aria-label={osText("onboarding.close.aria")} onClick={finish} className="ob-close">
            <X fontSize={14} aria-hidden="true" />
          </button>
        </header>

        {/* the frame stage: re-keyed per step so the stagger replays */}
        <div ref={stageRef} key={index} className="ob-stage">
          <StepArt app={step.app} index={index} />
          <p data-frame-beat className="ob-eyebrow">
            {step.eyebrow}
          </p>
          <h1 data-frame-beat className="ob-title">
            {step.title}
          </h1>
          <p data-frame-beat className="ob-body">
            {step.body}
          </p>
        </div>

        <footer className="ob-footer">
          <div className="ob-progress">
            <span className="ob-dots" aria-hidden="true">
              {ONBOARDING_STEPS.map((entry, position) => (
                <span
                  key={entry.eyebrow}
                  className={`ob-dot${position === index ? " ob-dot--active" : position < index ? " ob-dot--done" : ""}`}
                />
              ))}
            </span>
            <span className="ob-count">
              {osText("onboarding.count")
                .replace("{index}", String(index + 1))
                .replace("{total}", String(total))}
            </span>
          </div>
          <div className="ob-actions">
            <button type="button" onClick={finish} className="ob-btn ob-btn--ghost">
              {osText("onboarding.skip")}
            </button>
            {index > 0 ? (
              <button type="button" onClick={back} className="ob-btn ob-btn--flat">
                {osText("onboarding.back")}
              </button>
            ) : null}
            <button
              type="button"
              onClick={next}
              className="ob-btn ob-btn--primary"
              style={{ boxShadow: PRIMARY_STACK }}
            >
              {last ? osText("onboarding.enter") : osText("onboarding.next")}
            </button>
          </div>
        </footer>
      </section>
    </div>
  );
}
