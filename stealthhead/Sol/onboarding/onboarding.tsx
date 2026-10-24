// the stealthhead onboarding of the theme.
/**
 * onboarding.tsx — the first-run steps of the APPLICATION (the flow contract
 * of the reform): three short frames presented like a Windows 11 first-run
 * dialog over the deep trylle canvas — what the app IS (the honest role: a
 * real game platform, not an operating system), what it DOES (the four
 * domains the window hosts, read straight from the rail map) and the ENTER
 * frame with the hand-over button. The finish AND the skip mark the
 * onboarding stage seen through the shared onboardingstate accessor
 * (DB-backed, cache-mirrored — seeing once is enough; the flow never
 * replays) and navigate to "/", where the entry gate now lets the window
 * take over. Frames remount on step change so the 250ms Fluent entry plays
 * each time; reduced motion rides the stylesheet hard stop. No opt-in
 * switches here: the app holds no account and no visitor storage beyond the
 * first-run stage itself.
 */

import {
  ArrowLeftRegular as ArrowLeft,
  ArrowRightRegular as ArrowRight,
  TableRegular as LayoutDashboard,
} from "@fluentui/react-icons";
import { useState } from "react";
import { useLocation } from "wouter";
import { type LabelKey, label } from "../../labels";
import { markOnboardingStage } from "../../onboardingstate.ts";
import { BrandMark } from "../widgets/shell.brandmark.tsx";
import { START_APPS } from "../shell/Shell.tsx";

/** the three frames of the first run, in order — the copy rides the store
 * (the id keeps the ladder segments keyed, the key answers the eyebrow). */
const STEPS: readonly { id: string; eyebrowKey: LabelKey }[] = [
  { id: "is", eyebrowKey: "onboarding.steps.is.eyebrow" },
  { id: "does", eyebrowKey: "onboarding.steps.does.eyebrow" },
  { id: "enter", eyebrowKey: "onboarding.steps.enter.eyebrow" },
];

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
    void markOnboardingStage("onboarding").then(() => navigate("/"));
  };

  return (
    <div className="winonboard">
      <section className="winonboard__card" aria-label={label("onboarding.aria")}>
        <header className="winonboard__head">
          <BrandMark size={18} />
          <span className="winonboard__title">{label("onboarding.title")}</span>
        </header>

        <div className="winonboard__body">
          {step === 0 && (
            <article className="winonboard__step" key="what">
              <p className="winonboard__eyebrow">{label(STEPS[0].eyebrowKey)}</p>
              <h2 className="winonboard__lead">{label("onboarding.steps.is.title")}</h2>
              <p className="winonboard__lede">{label("onboarding.steps.is.text")}</p>
            </article>
          )}
          {step === 1 && (
            <article className="winonboard__step" key="does">
              <p className="winonboard__eyebrow">{label(STEPS[1].eyebrowKey)}</p>
              <h2 className="winonboard__lead">{label("onboarding.steps.does.title")}</h2>
              <ul className="winonboard__facts">
                {START_APPS.map((app) => {
                  const Icon = app.icon ?? LayoutDashboard;
                  return (
                    <li key={app.href} className="winonboard__fact">
                      <Icon fontSize={16} strokeWidth={1.7} aria-hidden="true" />
                      <span>
                        <strong>{label(app.labelKey)}</strong> — {label(app.detailKey)}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </article>
          )}
          {step === 2 && (
            <article className="winonboard__step" key="enter">
              <p className="winonboard__eyebrow">{label(STEPS[2].eyebrowKey)}</p>
              <h2 className="winonboard__lead">{label("onboarding.steps.enter.title")}</h2>
              <p className="winonboard__lede">{label("onboarding.steps.enter.text")}</p>
            </article>
          )}
        </div>

        <footer className="winonboard__foot">
          <div className="winonboard__ladder" aria-hidden="true">
            {STEPS.map((frame) => (
              <span key={frame.id} className="winonboard__segrun" data-active={STEPS[step].id === frame.id ? "true" : undefined} />
            ))}
          </div>
          <div className="winonboard__actions">
            <button type="button" className="winonboard__skip" onClick={finish}>
              {label("onboarding.skip")}
            </button>
            {step > 0 && (
              <button type="button" className="winonboard__act" onClick={() => setStep((value) => value - 1)}>
                <ArrowLeft fontSize={14} aria-hidden="true" />
                {label("onboarding.back")}
              </button>
            )}
            {last ? (
              <button type="button" className="winonboard__act winonboard__act--primary" onClick={finish}>
                {label("onboarding.enterCta")}
                <ArrowRight fontSize={14} aria-hidden="true" />
              </button>
            ) : (
              <button
                type="button"
                className="winonboard__act winonboard__act--primary"
                onClick={() => setStep((value) => value + 1)}
              >
                {label("onboarding.next")}
                <ArrowRight fontSize={14} aria-hidden="true" />
              </button>
            )}
          </div>
        </footer>
      </section>
    </div>
  );
}
