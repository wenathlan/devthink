/**
 * onboarding.tsx — the first-run steps of the ENTRY FLOW (the flow contract
 * of the reform the family rides: intro → onboarding → entrada). Three
 * short frames on the site voice over the deep canvas — what the site IS
 * (the honest role: the family's monetization face, kept apart so the apps
 * stay clean), what it DOES (the real offer read from the one content
 * lane: the plans, the support rails, the honest ad slots) and the ENTER
 * frame with the hand-over button. The finish AND the skip mark the
 * onboarding stage seen through the shared onboardingstate accessor
 * (DB-backed, cache-mirrored — seeing once is enough; the flow never
 * replays) and navigate to "/", where the entry gate now lets the site
 * take over. The copy rides the label store; no icon dependency (the site
 * grammar draws its own glyphs); reduced motion rides the stylesheet hard
 * stop. No opt-in switches here: the site holds no account and no visitor
 * storage beyond the first-run stage itself.
 */

import { useState } from "react";
import { useLocation } from "wouter";
import { type LabelKey, label } from "../../labels";
import { markOnboardingStage } from "../../onboardingstate.ts";
import { BrandMark } from "../../wingets";

/** the three frames of the first run, in order — the copy rides the store
 * (the id keeps the ladder segments keyed, the key answers the eyebrow). */
const STEPS: readonly { id: string; eyebrowKey: LabelKey }[] = [
  { id: "is", eyebrowKey: "onboarding.steps.is.eyebrow" },
  { id: "does", eyebrowKey: "onboarding.steps.does.eyebrow" },
  { id: "enter", eyebrowKey: "onboarding.steps.enter.eyebrow" },
];

/** the does-frame rows: the real offer the site carries, one label each
 * (the plans, the support rails, the honest ad slots — nothing invented). */
const FACTS: readonly LabelKey[] = ["onboarding.facts.plans", "onboarding.facts.support", "onboarding.facts.ads"];

/** the chevron glyph of the pager actions: the inline 10×10 chevron the
 * site grammar draws (no icon dependency rides the content site). */
function StepGlyph({ back }: { back?: boolean }) {
  return (
    <svg
      className="cb-onboard__glyph"
      width={10}
      height={10}
      viewBox="0 0 10 10"
      aria-hidden="true"
      focusable="false"
      style={back ? { transform: "rotate(180deg)" } : undefined}
    >
      <path d="M3 0l5 5-5 5" fill="none" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

/**
 * The onboarding page: a three-step first-run dialog that hands the
 * surface to the home of the site. Finish and skip both mark the
 * onboarding stage seen and navigate to the gated home.
 *
 * @returns the onboarding element.
 */
export default function Onboarding() {
  const [, navigate] = useLocation();
  const [step, setStep] = useState(0);
  const last = step === STEPS.length - 1;

  /** marks the stage seen and hands the surface to the home (the entry gate lets it through). */
  const finish = (): void => {
    void markOnboardingStage("onboarding").then(() => navigate("/"));
  };

  return (
    <div className="cb-onboard" data-page="onboarding">
      <section className="cb-onboard__card" aria-label={label("onboarding.aria")}>
        <header className="cb-onboard__head">
          <BrandMark size={18} />
          <span className="cb-onboard__title">{label("onboarding.title")}</span>
        </header>

        <div className="cb-onboard__body">
          {step === 0 && (
            <article className="cb-onboard__step" key="is">
              <p className="cb-eyebrow">{label(STEPS[0].eyebrowKey)}</p>
              <h2 className="cb-onboard__lead">{label("onboarding.steps.is.title")}</h2>
              <p className="cb-onboard__lede">{label("onboarding.steps.is.text")}</p>
            </article>
          )}
          {step === 1 && (
            <article className="cb-onboard__step" key="does">
              <p className="cb-eyebrow">{label(STEPS[1].eyebrowKey)}</p>
              <h2 className="cb-onboard__lead">{label("onboarding.steps.does.title")}</h2>
              <p className="cb-onboard__lede">{label("onboarding.steps.does.text")}</p>
              <ul className="cb-onboard__facts">
                {FACTS.map((key) => (
                  <li key={key} className="cb-onboard__fact">
                    {label(key)}
                  </li>
                ))}
              </ul>
            </article>
          )}
          {step === 2 && (
            <article className="cb-onboard__step" key="enter">
              <p className="cb-eyebrow">{label(STEPS[2].eyebrowKey)}</p>
              <h2 className="cb-onboard__lead">{label("onboarding.steps.enter.title")}</h2>
              <p className="cb-onboard__lede">{label("onboarding.steps.enter.text")}</p>
            </article>
          )}
        </div>

        <footer className="cb-onboard__foot">
          <div className="cb-onboard__ladder" aria-hidden="true">
            {STEPS.map((frame) => (
              <span
                key={frame.id}
                className="cb-onboard__segrun"
                data-active={STEPS[step].id === frame.id ? "true" : undefined}
              />
            ))}
          </div>
          <div className="cb-onboard__actions">
            <button type="button" className="cb-onboard__skip" onClick={finish}>
              {label("onboarding.skip")}
            </button>
            {step > 0 && (
              <button type="button" className="cb-btn cb-btn--ghost" onClick={() => setStep((value) => value - 1)}>
                <StepGlyph back />
                {label("onboarding.back")}
              </button>
            )}
            {last ? (
              <button type="button" className="cb-btn" onClick={finish}>
                {label("onboarding.enterCta")}
                <StepGlyph />
              </button>
            ) : (
              <button type="button" className="cb-btn" onClick={() => setStep((value) => value + 1)}>
                {label("onboarding.next")}
                <StepGlyph />
              </button>
            )}
          </div>
        </footer>
      </section>
    </div>
  );
}
