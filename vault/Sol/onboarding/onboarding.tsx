/**
 * onboarding page anchor — layer 3 of the anchor architecture.
 * The file carrying the folder's own name is the path manager of the page:
 * it imports the loose components beside it, mounts the page and re-exports
 * the public component surface. Only the theme anchor (Sol/Sol.tsx) consumes
 * this file. This anchor carries the former main component of the folder,
 * which now lives here as the page mount itself.
 */

// The onboarding walk of the vault APPLICATION (the flow law: intro →
// onboarding → the platform): three short steps on the deep canvas — what
// the application is, what it does and the door into the window. The role
// stays honest: vault only KEEPS — the execution of the family lives
// elsewhere. The copy is third-person lowercase per the family grammar; the
// frames ride the 250ms window entry (winOpen) and the reduced-motion hard
// stop of the stylesheet. The finish AND the skip mark onboardingseen
// through the one accessor (onboardingstate.ts — seen = may skip, the flow
// is never forced again) and the walk hands the window at "/".
import { useCallback, useState } from "react";
import { useLocation } from "wouter";
import { label, labelfill } from "../../labels";
import { markOnboardingStage } from "../../onboardingstate.ts";
import { BrandMark } from "../widgets/shell.brandmark.tsx";

/** the three beats of the walk: what it is, what it does, enter (the copy law) */
const STEPS = [
  {
    title: label("onboarding.steps.is.title"),
    text: label("onboarding.steps.is.text"),
  },
  {
    title: label("onboarding.steps.does.title"),
    text: label("onboarding.steps.does.text"),
  },
  {
    title: label("onboarding.steps.enter.title"),
    text: label("onboarding.steps.enter.text"),
  },
] as const;

/**
 * The onboarding page: the three-step walk into the application window —
 * the finish and the skip both count the stage seen.
 *
 * @returns the onboarding element.
 */
export default function Onboarding() {
  const [, navigate] = useLocation();
  const [step, setStep] = useState(0);
  const last = step === STEPS.length - 1;
  const current = STEPS[step];

  /** the hand-over: the onboarding counts as seen (finish and skip alike —
   * seen = may skip; never forced again) and the platform opens on the home. */
  const enterPlatform = useCallback(() => {
    void markOnboardingStage("onboarding").then(() => navigate("/", { replace: true }));
  }, [navigate]);

  return (
    <main className="ob">
      <section className="ob__card" aria-label={label("onboarding.aria")}>
        <header className="ob__head">
          <BrandMark size={30} />
          <div className="ob__heading">
            <p className="ob__eyebrow">{label("onboarding.eyebrow")}</p>
            <h1 className="ob__title">{current.title}</h1>
          </div>
          <button type="button" className="ob__skip" onClick={enterPlatform}>
            {label("onboarding.skip")}
          </button>
        </header>
        <p className="ob__text">{current.text}</p>
        <div
          className="ob__meter"
          role="img"
          aria-label={labelfill("onboarding.meterAria", { step: String(step + 1), total: String(STEPS.length) })}
        >
          {STEPS.map((s, index) => (
            <span key={s.title} className="ob__seg" data-done={index <= step ? "true" : undefined} />
          ))}
        </div>
        <footer className="ob__foot">
          <button
            type="button"
            className="ob__btn"
            onClick={() => setStep((value) => Math.max(0, value - 1))}
            disabled={step === 0}
          >
            {label("onboarding.back")}
          </button>
          {last ? (
            <button type="button" className="ob__btn ob__btn--accent" onClick={enterPlatform}>
              {label("onboarding.enterCta")}
            </button>
          ) : (
            <button
              type="button"
              className="ob__btn"
              onClick={() => setStep((value) => Math.min(STEPS.length - 1, value + 1))}
            >
              {label("onboarding.next")}
            </button>
          )}
        </footer>
      </section>
    </main>
  );
}
