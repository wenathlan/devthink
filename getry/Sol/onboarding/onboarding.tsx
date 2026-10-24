// the getry onboarding of the theme.
/**
 * onboarding.tsx — the first-run steps of the APPLICATION: three short
 * frames presented like a Windows 11 first-run dialog over the trylle
 * canvas — what the app IS (the honest role: the AI gateway console of the
 * family, not an operating system), what it DOES (the surfaces the window
 * hosts, read straight from the rail map) and the ENTER frame with the
 * hand-over button. The finish and the skip both mark onboardingseen
 * through the one accessor (onboardingstate.ts — seen = may skip; the flow
 * is never forced again) and the window takes the visitor to the home at
 * "/". Frames remount on step change so the 250ms window entry plays each
 * time; reduced motion rides the stylesheet hard stop. No opt-in switches
 * here: the console holds no account, no provider key and no visitor
 * storage — the seen flags alone ride onboardingstate.ts.
 */

import { ArrowLeftRegular, ArrowRightRegular, HomeRegular } from "@fluentui/react-icons";
import { useCallback, useState } from "react";
import { useLocation } from "wouter";
import { label, labelfill } from "../../labels";
import { markOnboardingSeen } from "../../onboardingstate.ts";
import { BrandMark } from "../widgets";
import { START_APPS } from "../shell/Shell.tsx";

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
 * surface to the home of the window.
 *
 * @returns the onboarding element.
 */
export default function Onboarding() {
  const [, navigate] = useLocation();
  const [step, setStep] = useState(0);
  const last = step === STEPS.length - 1;

  /** the hand-over: the onboarding counts as seen (finish and skip alike —
   * seen = may skip; never forced again) and the window opens on the home. */
  const enterHome = useCallback(() => {
    markOnboardingSeen();
    navigate("/");
  }, [navigate]);

  return (
    <div className="winonboard">
      <section className="winonboard__card" aria-label={label("onboarding.aria")}>
        <header className="winonboard__head">
          <BrandMark size={18} />
          <span className="winonboard__title">{label("onboarding.title")}</span>
          <button type="button" className="winonboard__skip" onClick={enterHome}>
            {label("onboarding.skip")}
          </button>
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
            {step > 0 && (
              <button type="button" className="winonboard__act" onClick={() => setStep((value) => value - 1)}>
                <ArrowLeftRegular fontSize={14} aria-hidden="true" />
                {label("onboarding.back")}
              </button>
            )}
            {last ? (
              <button type="button" className="winonboard__act winonboard__act--primary" onClick={enterHome}>
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
