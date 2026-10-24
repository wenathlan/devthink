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
import { ArrowLeftRegular, ArrowRightRegular } from "@fluentui/react-icons";
import { useState } from "react";
import { useLocation } from "wouter";
import { labelfill, label } from "../../labels";
import { markOnboardingSeen } from "../../onboardingstate";
import { BrandMark } from "../widgets";
import { RAIL_APPS } from "../shell/Shell";

/** the three frames of the first run, in order (the label keys of the steps). */
const STEPS = ["onboarding.steps.is", "onboarding.steps.does", "onboarding.steps.enter"] as const;

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
      <section className="ob__card" aria-label={label("onboarding.aria")}>
        <header className="ob__head">
          <BrandMark size={20} />
          <span className="ob__title">{label("onboarding.title")}</span>
        </header>

        <div className="ob__body">
          {step === 0 && (
            <article className="ob__step" key="is">
              <p className="ob__eyebrow">{labelfill("onboarding.eyebrow", { no: "01", step: label(STEPS[0]) })}</p>
              <h2 className="ob__lead">{label("onboarding.what.lead")}</h2>
              <p className="ob__lede">{label("onboarding.what.body")}</p>
            </article>
          )}
          {step === 1 && (
            <article className="ob__step" key="does">
              <p className="ob__eyebrow">{labelfill("onboarding.eyebrow", { no: "02", step: label(STEPS[1]) })}</p>
              <h2 className="ob__lead">{label("onboarding.hosts.lead")}</h2>
              <ul className="ob__facts">
                {RAIL_APPS.map((app) => {
                  const Icon = app.icon;
                  return (
                    <li key={app.href} className="ob__fact">
                      <Icon fontSize={16} aria-hidden="true" />
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
              <p className="ob__eyebrow">{labelfill("onboarding.eyebrow", { no: "03", step: label(STEPS[2]) })}</p>
              <h2 className="ob__lead">{label("onboarding.enter.lead")}</h2>
              <p className="ob__lede">{label("onboarding.enter.body")}</p>
            </article>
          )}
        </div>

        <footer className="ob__foot">
          <div
            className="ob__meter"
            role="img"
            aria-label={labelfill("onboarding.meterAria", { no: String(step + 1), total: String(STEPS.length) })}
          >
            {STEPS.map((stepKey, index) => (
              <span key={stepKey} className="ob__seg" data-done={index <= step ? "true" : undefined} />
            ))}
          </div>
          <div className="ob__actions">
            <button type="button" className="ob__skip" onClick={finish}>
              {label("onboarding.skip")}
            </button>
            {step > 0 && (
              <button type="button" className="ob__btn" onClick={() => setStep((value) => value - 1)}>
                <ArrowLeftRegular fontSize={14} aria-hidden="true" />
                {label("onboarding.back")}
              </button>
            )}
            {last ? (
              <button type="button" className="ob__btn ob__btn--accent" onClick={finish}>
                {label("onboarding.enterCta")}
                <ArrowRightRegular fontSize={14} aria-hidden="true" />
              </button>
            ) : (
              <button type="button" className="ob__btn ob__btn--accent" onClick={() => setStep((value) => value + 1)}>
                {label("onboarding.continue")}
                <ArrowRightRegular fontSize={14} aria-hidden="true" />
              </button>
            )}
          </div>
        </footer>
      </section>
    </div>
  );
}
