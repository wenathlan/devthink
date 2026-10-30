/**
 * onboarding.tsx — the first-run steps of the APPLICATION: three short
 * frames presented like a Windows 11 first-run dialog over the trylle
 * canvas — what the app IS (the honest role: the audio home of the family,
 * not an operating system), what it DOES (the domains the window hosts —
 * the generate queue, the studio timeline and the library over the katexis
 * engine — read straight from the rail map) and the ENTER frame with the
 * hand-over button. The finish and the skip both mark onboardingseen
 * through the one accessor (onboardingstate.ts — seen = may skip; the flow
 * is never forced again) and the window takes the visitor to the home at
 * "/". Frames remount on step change so the 250ms window entry plays each
 * time; reduced motion rides the stylesheet hard stop. No opt-in switches
 * here: the app holds no account, no network write of visitor content and
 * no visitor storage — the seen flags alone ride onboardingstate.ts.
 */

import { ArrowLeftRegular, ArrowRightRegular, HomeRegular } from "@fluentui/react-icons";
import { useCallback, useState } from "react";
import { useLocation } from "wouter";
import { label, labelfill } from "../../labels.ts";
import { markOnboardingSeen } from "../../onboardingstate.ts";
import { DebonairMark, START_APPS } from "../shell/Shell.tsx";

/** the step keys of the first run, in order (the eyebrow names answer the
 * label store; the shell rail map stays data). */
const STEPS: readonly { key: "app" | "surfaces" | "enter"; no: string }[] = [
  { key: "app", no: "01" },
  { key: "surfaces", no: "02" },
  { key: "enter", no: "03" },
];

/** the eyebrow key of one step (the step name rides the manifest). */
const STEP_KEYS = {
  app: "onboarding.steps.app",
  surfaces: "onboarding.steps.surfaces",
  enter: "onboarding.steps.enter",
} as const;

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
          <DebonairMark size={18} hidden />
          <span className="winonboard__title">{label("onboarding.title")}</span>
          <button type="button" className="winonboard__skip" onClick={enterHome}>
            {label("onboarding.skip")}
          </button>
        </header>

        <div className="winonboard__body">
          {step === 0 && (
            <article className="winonboard__step" key="what">
              <p className="winonboard__eyebrow">
                {labelfill("onboarding.step.eyebrow", {
                  no: STEPS[0].no,
                  step: label(STEP_KEYS[STEPS[0].key]),
                })}
              </p>
              <h2 className="winonboard__lead">{label("onboarding.what.title")}</h2>
              <p className="winonboard__lede">{label("onboarding.what.body")}</p>
            </article>
          )}
          {step === 1 && (
            <article className="winonboard__step" key="does">
              <p className="winonboard__eyebrow">
                {labelfill("onboarding.step.eyebrow", {
                  no: STEPS[1].no,
                  step: label(STEP_KEYS[STEPS[1].key]),
                })}
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
                {labelfill("onboarding.step.eyebrow", {
                  no: STEPS[2].no,
                  step: label(STEP_KEYS[STEPS[2].key]),
                })}
              </p>
              <h2 className="winonboard__lead">{label("onboarding.enter.title")}</h2>
              <p className="winonboard__lede">{label("onboarding.enter.body")}</p>
            </article>
          )}
        </div>

        <footer className="winonboard__foot">
          <div className="winonboard__ladder" aria-hidden="true">
            {STEPS.map((entry) => (
              <span
                key={entry.key}
                className="winonboard__segrun"
                data-active={STEPS.indexOf(entry) === step ? "true" : undefined}
              />
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
