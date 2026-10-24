// the argan onboarding of the theme.
/**
 * onboarding.tsx — the first-run steps of the APPLICATION (the flow contract
 * of the reform): three short frames presented like a Windows 11 first-run
 * dialog over the deep canvas — what the app IS (the honest role: the dns and
 * zones home of the family, not an operating system), what it DOES (the
 * domains the window hosts — zones, dnssec, gateway over the devthink.pro
 * apex — read straight from the rail map) and the ENTER frame with the
 * hand-over button. The finish AND the skip mark the onboarding stage seen
 * through the shared onboardingstate accessor (DB-backed, cache-mirrored —
 * seeing once is enough; the flow never replays) and navigate to "/", where
 * the entry gate now lets the window take over. Frames remount on step change
 * so the 250ms Fluent entry plays each time; reduced motion rides the
 * stylesheet hard stop. No opt-in switches here: the app holds no account
 * and no visitor storage beyond the first-run stage itself.
 */

import { ArrowLeftRegular, ArrowRightRegular, HomeRegular } from "@fluentui/react-icons";
import { useState } from "react";
import { useLocation } from "wouter";
import { label, labelfill } from "../../labels";
import { markOnboardingSeen } from "../../onboardingstate";
import { ArganMark, START_APPS } from "../shell/Shell";

/** the honest statements of the frames, riding the copy law (labels.ts). */
const WHAT_IT_IS = label("onboarding.what.body");
const WHAT_ENTER = label("onboarding.enter.body");

/** the three frames of the first run, in order (the label keys of the copy law). */
const STEPS = [
  { id: "app", eyebrowNo: "01", label: label("onboarding.steps.app") },
  { id: "surfaces", eyebrowNo: "02", label: label("onboarding.steps.surfaces") },
  { id: "enter", eyebrowNo: "03", label: label("onboarding.steps.enter") },
] as const;

/**
 * The onboarding page: a three-step first-run dialog that hands the
 * surface to the home of the window. Finish and skip both mark the
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
    markOnboardingSeen();
    navigate("/");
  };

  return (
    <div className="winonboard">
      <section className="winonboard__card" aria-label={label("onboarding.aria")}>
        <header className="winonboard__head">
          <ArganMark size={18} hidden />
          <span className="winonboard__title">{label("onboarding.title")}</span>
        </header>

        <div className="winonboard__body">
          {step === 0 && (
            <article className="winonboard__step" key="what">
              <p className="winonboard__eyebrow">
                {labelfill("onboarding.step.eyebrow", { no: STEPS[0].eyebrowNo, step: STEPS[0].label })}
              </p>
              <h2 className="winonboard__lead">{label("onboarding.what.title")}</h2>
              <p className="winonboard__lede">{WHAT_IT_IS}</p>
            </article>
          )}
          {step === 1 && (
            <article className="winonboard__step" key="does">
              <p className="winonboard__eyebrow">
                {labelfill("onboarding.step.eyebrow", { no: STEPS[1].eyebrowNo, step: STEPS[1].label })}
              </p>
              <h2 className="winonboard__lead">{label("onboarding.hosts.title")}</h2>
              <ul className="winonboard__facts">
                {START_APPS.map((app) => {
                  const Icon = app.icon ?? HomeRegular;
                  return (
                    <li key={app.href} className="winonboard__fact">
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
            <article className="winonboard__step" key="enter">
              <p className="winonboard__eyebrow">
                {labelfill("onboarding.step.eyebrow", { no: STEPS[2].eyebrowNo, step: STEPS[2].label })}
              </p>
              <h2 className="winonboard__lead">{label("onboarding.enter.title")}</h2>
              <p className="winonboard__lede">{WHAT_ENTER}</p>
            </article>
          )}
        </div>

        <footer className="winonboard__foot">
          <div className="winonboard__ladder" aria-hidden="true">
            {STEPS.map((frame, index) => (
              <span key={frame.id} className="winonboard__segrun" data-active={index === step ? "true" : undefined} />
            ))}
          </div>
          <div className="winonboard__actions">
            <button type="button" className="winonboard__skip" onClick={finish}>
              {label("onboarding.skip")}
            </button>
            {step > 0 && (
              <button type="button" className="winonboard__act" onClick={() => setStep((value) => value - 1)}>
                <ArrowLeftRegular fontSize={14} aria-hidden="true" />
                {label("onboarding.back")}
              </button>
            )}
            {last ? (
              <button type="button" className="winonboard__act winonboard__act--primary" onClick={finish}>
                {label("onboarding.enterCta")}
                <ArrowRightRegular fontSize={14} aria-hidden="true" />
              </button>
            ) : (
              <button
                type="button"
                className="winonboard__act winonboard__act--primary"
                onClick={() => setStep((value) => value + 1)}
              >
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
