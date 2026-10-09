/**
 * onboarding page anchor — layer 3 of the anchor architecture.
 * The file carrying the folder's own name is the path manager of the page:
 * it imports the loose components beside it, mounts the page and re-exports
 * the public component surface. Only the theme anchor (Sol/Sol.tsx) consumes
 * this file. This anchor carries the former main component of the folder,
 * which now lives here as the page mount itself.
 */

// The onboarding walk of the foundry APPLICATION (the FAM-APPS reform): three
// short steps on the Mica stage — what the application is, what it does and
// the door into the window. The role stays honest: foundry RUNS AND GUARDS —
// the vault layer beside the forge layer, while the engine lives in saddle.
// The enter button hands the flow to the window at "/".
import { useState } from "react";
import { useLocation } from "wouter";
import { BrandMark } from "../shell/BrandMark";

/** the three beats of the walk, in the family copy grammar (third-person,
 * lowercase): what it is, what it does, enter */
const STEPS = [
  {
    title: "what it is",
    text: "foundry is the pipeline application of the devthink family — the working set stored and executed together, the vault layer beside the forge layer in one unit.",
  },
  {
    title: "what it does",
    text: "it drives the sandboxes and shapes the images while keeping the records of both. the engine lives in saddle: foundry runs and guards at once.",
  },
  {
    title: "enter",
    text: "the window ahead is the pipeline surface — sandboxes, images and the records of the floor. the enter button opens the pipeline.",
  },
] as const;

/** The onboarding page: the three-step walk into the application window. */
export default function Onboarding() {
  const [, navigate] = useLocation();
  const [step, setStep] = useState(0);
  const last = step === STEPS.length - 1;
  const current = STEPS[step];

  return (
    <main className="ob">
      <section className="ob__card" aria-label="foundry onboarding">
        <header className="ob__head">
          <BrandMark size={30} />
          <div className="ob__heading">
            <p className="ob__eyebrow">foundry onboarding</p>
            <h1 className="ob__title">{current.title}</h1>
          </div>
        </header>
        <p className="ob__text">{current.text}</p>
        <div className="ob__meter" role="img" aria-label={`step ${step + 1} of ${STEPS.length}`}>
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
            back
          </button>
          {last ? (
            <button type="button" className="ob__btn ob__btn--accent" onClick={() => navigate("/")}>
              enter foundry
            </button>
          ) : (
            <button
              type="button"
              className="ob__btn"
              onClick={() => setStep((value) => Math.min(STEPS.length - 1, value + 1))}
            >
              next
            </button>
          )}
        </footer>
      </section>
    </main>
  );
}
