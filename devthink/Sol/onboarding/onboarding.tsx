/**
 * onboarding page anchor — layer 3 of the anchor architecture.
 * The file carrying the folder's own name is the path manager of the page:
 * it imports the loose components beside it, mounts the page and re-exports
 * the public component surface. Only the theme anchor (Sol/Sol.tsx) consumes
 * this file. The onboarding is the second page of the owner flow (intro →
 * onboarding → explore): a frame-a-frame tour dressed in the window grammar
 * — a Fluent window with the real title bar and the red close glyph — whose
 * finish AND skip both raise the onboarding flag through onboardingstate.ts
 * (the only writer) and hand the surface to /explore.
 */
import { useCallback, useEffect, useState } from "react";
import { useLocation } from "wouter";
import { writeonboardingstage } from "../../onboardingstate";
import { SolLogoMark } from "../panel/logo.tsx";
import { ONBOARDING_STEPS, StepArt } from "./steps.tsx";

export * from "./steps.tsx";

/** The finish target of the flow: explore is the free SaaS surface. */
export const ONBOARDING_HANDOVER = "/explore";

/**
 * Onboarding — the frame-a-frame tour. The window chrome carries the real
 * close glyph (close = skip = seen); the footer carries back/next/finish and
 * the quiet skip; the keyboard walks the frames (→/←/Enter, Esc skips).
 * Every exit raises the onboarding stage once through onboardingstate.ts,
 * then navigates to /explore.
 */
export default function Onboarding() {
  const [, navigate] = useLocation();
  const [index, setIndex] = useState(0);
  const [leaving, setLeaving] = useState(false);
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
      if (event.key === "ArrowRight" || event.key === "Enter") next();
      if (event.key === "ArrowLeft") back();
    };
    window.addEventListener("keydown", onkey);
    return () => window.removeEventListener("keydown", onkey);
  }, [finish, next, back]);

  const step = ONBOARDING_STEPS[index] as (typeof ONBOARDING_STEPS)[number];

  return (
    <div className={`dt-onboard${leaving ? " is-leaving" : ""}`}>
      <section
        className="dt-onboard__window acrylic-panel animate-start-in"
        role="dialog"
        aria-modal="true"
        aria-label="devthink onboarding"
      >
        <header className="dt-onboard__bar">
          <span className="dt-onboard__lockup">
            <SolLogoMark size={16} />
            <strong>devthink</strong>
            <small>onboarding</small>
          </span>
          <button type="button" className="dt-onboard__close" aria-label="close onboarding" onClick={finish}>
            <svg viewBox="0 0 10 10" width="10" height="10" aria-hidden="true">
              <path d="M0 0 L10 10 M10 0 L0 10" stroke="currentColor" strokeWidth="1" fill="none" />
            </svg>
          </button>
        </header>

        <div className="dt-onboard__stage" key={index}>
          <StepArt app={step.app} index={index} />
          <p className="dt-onboard__eyebrow">{step.eyebrow}</p>
          <h1 className="dt-onboard__title">{step.title}</h1>
          <p className="dt-onboard__body">{step.body}</p>
        </div>

        <footer className="dt-onboard__foot">
          <div className="dt-onboard__progress">
            {ONBOARDING_STEPS.map((entry, position) => (
              <button
                type="button"
                key={entry.eyebrow}
                aria-current={position === index ? "step" : undefined}
                aria-label={`step ${position + 1} of ${total}: ${entry.eyebrow}`}
                className={`dt-onboard__tick${position === index ? " is-active" : ""}${
                  position < index ? " is-done" : ""
                }`}
                onClick={() => setIndex(position)}
              />
            ))}
          </div>
          <div className="dt-onboard__actions">
            <button type="button" className="dt-onboard__skip" onClick={finish}>
              skip
            </button>
            {index > 0 ? (
              <button type="button" className="dt-onboard__back" onClick={back}>
                back
              </button>
            ) : null}
            <button type="button" className="dt-onboard__next" onClick={next}>
              {last ? "enter devthink" : "next"}
            </button>
          </div>
        </footer>
      </section>
    </div>
  );
}
