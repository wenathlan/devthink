/**
 * onboarding page anchor — layer 3 of the anchor architecture.
 * The file carrying the folder's own name is the path manager of the page:
 * it imports the loose components beside it, mounts the page and re-exports
 * the public component surface. Only the theme anchor (Sol/Sol.tsx) consumes
 * this file. This anchor carries the former main component of the folder,
 * which now lives here as the page mount itself.
 */

// The onboarding walk of the forge APPLICATION (the flow contract of the
// reform): three short frames presented like a Windows 11 first-run dialog
// over the deep canvas — what the application IS (the honest role: the
// execution application of the family — forge RUNS, it does not keep), what
// the window hosts (the runner floor pages read straight from the rail map)
// and the ENTER frame with the hand-over button. The finish AND the skip mark
// the onboarding stage seen through the shared onboardingstate accessor
// (DB-backed, cache-mirrored — seeing once is enough; the flow never replays)
// and navigate to "/", where the entry gate now lets the window take over.
// Frames remount on step change so the 250ms Fluent entry plays each time;
// reduced motion rides the stylesheet hard stop.
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import { markOnboardingSeen } from "../../onboardingstate";
import { BrandMark } from "../shell/BrandMark";
import { RAIL_APPS } from "../shell/Shell";

/** the honest statement of the opening frame (what the app is). */
const WHAT_IT_IS =
  "forge is the execution application of the wenathlan family — the build floor of the clones: any build runs through the saddle sandbox engine, and the outcomes travel back over https.";

/** the honest statement of the closing frame (the hand-over). */
const WHAT_ENTER =
  "the window opens on the landing and every surface rides the same rail. the theme starts dark and stays in memory only — nothing is written to this machine.";

/** the three frames of the first run, in order. */
const STEPS = ["what it is", "what it does", "enter"] as const;

/**
 * The onboarding page: a three-step first-run dialog that hands the surface
 * to the home of the window. Finish and skip both mark the onboarding stage
 * seen and navigate to the gated home.
 *
 * @returns the onboarding element.
 */
export default function Onboarding() {
  const [, navigate] = useLocation();
  const [step, setStep] = useState(0);
  const last = step === STEPS.length - 1;

  /** marks the stage seen and hands the surface to the home (the entry gate lets it through). */
  const finish = (): void => {
    markOnboardingSeen();
    navigate("/");
  };

  return (
    <div className="ob">
      <section className="ob__card" aria-label="forge first run">
        <header className="ob__head">
          <BrandMark size={20} />
          <span className="ob__title">welcome to forge</span>
        </header>

        <div className="ob__body">
          {step === 0 && (
            <article className="ob__step" key="is">
              <p className="ob__eyebrow">01 — {STEPS[0]}</p>
              <h2 className="ob__lead">the runner floor of the family</h2>
              <p className="ob__lede">{WHAT_IT_IS}</p>
            </article>
          )}
          {step === 1 && (
            <article className="ob__step" key="does">
              <p className="ob__eyebrow">02 — {STEPS[1]}</p>
              <h2 className="ob__lead">what the window hosts</h2>
              <ul className="ob__facts">
                {RAIL_APPS.map((app) => {
                  const Icon = app.icon;
                  return (
                    <li key={app.href} className="ob__fact">
                      <Icon size={16} strokeWidth={1.7} aria-hidden="true" />
                      <span>
                        <strong>{app.label}</strong> — {app.detail}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </article>
          )}
          {step === 2 && (
            <article className="ob__step" key="enter">
              <p className="ob__eyebrow">03 — {STEPS[2]}</p>
              <h2 className="ob__lead">ready to enter</h2>
              <p className="ob__lede">{WHAT_ENTER}</p>
            </article>
          )}
        </div>

        <footer className="ob__foot">
          <div className="ob__meter" role="img" aria-label={`step ${step + 1} of ${STEPS.length}`}>
            {STEPS.map((label, index) => (
              <span key={label} className="ob__seg" data-done={index <= step ? "true" : undefined} />
            ))}
          </div>
          <div className="ob__actions">
            <button type="button" className="ob__skip" onClick={finish}>
              skip
            </button>
            {step > 0 && (
              <button type="button" className="ob__btn" onClick={() => setStep((value) => value - 1)}>
                <ArrowLeft size={14} aria-hidden="true" />
                back
              </button>
            )}
            {last ? (
              <button type="button" className="ob__btn ob__btn--accent" onClick={finish}>
                enter forge
                <ArrowRight size={14} aria-hidden="true" />
              </button>
            ) : (
              <button type="button" className="ob__btn ob__btn--accent" onClick={() => setStep((value) => value + 1)}>
                continue
                <ArrowRight size={14} aria-hidden="true" />
              </button>
            )}
          </div>
        </footer>
      </section>
    </div>
  );
}
