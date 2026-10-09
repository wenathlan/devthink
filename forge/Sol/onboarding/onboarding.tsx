/**
 * onboarding page anchor — layer 3 of the anchor architecture.
 * The file carrying the folder's own name is the path manager of the page:
 * it imports the loose components beside it, mounts the page and re-exports
 * the public component surface. Only the theme anchor (Sol/Sol.tsx) consumes
 * this file. This anchor carries the former main component of the folder,
 * which now lives here as the page mount itself.
 */

// The onboarding walk of the forge APPLICATION (the FAM-APPS reform): three
// short steps on the Mica stage — what the application is, what it does and
// the door into the window. The role stays honest: forge only RUNS — it
// executes any build through the saddle sandbox engine without holding the
// network persistence. The enter button hands the flow to the window at "/".
import { useState } from "react";
import { useLocation } from "wouter";
import { BrandMark } from "../shell/BrandMark";

/** the three beats of the walk: what it is, what it does, enter */
const STEPS = [
  {
    title: "what it is",
    text: "forge is the execution application of the DevThink family — the build floor where the work actually runs, one window away from the storage clones.",
  },
  {
    title: "what it does",
    text: "It registers the runners, records the run logs and reports the outcomes over https. The sandbox engine lives in saddle: forge runs, it does not keep.",
  },
  {
    title: "enter",
    text: "The window ahead is the runner surface — the dashboard of the runners, the logs and the outcomes. The enter button opens the floor.",
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
      <section className="ob__card" aria-label="forge onboarding">
        <header className="ob__head">
          <BrandMark size={30} />
          <div className="ob__heading">
            <p className="ob__eyebrow">forge onboarding</p>
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
              enter forge
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
