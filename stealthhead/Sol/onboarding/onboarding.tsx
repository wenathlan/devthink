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
import { markOnboardingStage } from "../../onboardingstate.ts";
import { BrandMark } from "../shell/BrandMark";
import { START_APPS } from "../shell/Shell";

/** the honest statement of the opening frame (what the app is). */
const WHAT_IT_IS =
  "stealthhead is the FPS game platform of the wenathlan family — not an operating system: one application window holding the match surfaces, the season ladder and the armory of the game.";

/** the honest statement of the closing frame (the hand-over). */
const WHAT_ENTER =
  "the window opens on the home dashboard and every page rides the same rail. the theme starts dark and stays in memory only — nothing is written to this machine.";

/** the three frames of the first run, in order. */
const STEPS = ["the app", "the surfaces", "enter"] as const;

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
      <section className="winonboard__card" aria-label="stealthhead first run">
        <header className="winonboard__head">
          <BrandMark size={18} />
          <span className="winonboard__title">welcome to stealthhead</span>
        </header>

        <div className="winonboard__body">
          {step === 0 && (
            <article className="winonboard__step" key="what">
              <p className="winonboard__eyebrow">01 — {STEPS[0]}</p>
              <h2 className="winonboard__lead">one window, the whole platform</h2>
              <p className="winonboard__lede">{WHAT_IT_IS}</p>
            </article>
          )}
          {step === 1 && (
            <article className="winonboard__step" key="does">
              <p className="winonboard__eyebrow">02 — {STEPS[1]}</p>
              <h2 className="winonboard__lead">what the window hosts</h2>
              <ul className="winonboard__facts">
                {START_APPS.map((app) => {
                  const Icon = app.icon ?? LayoutDashboard;
                  return (
                    <li key={app.href} className="winonboard__fact">
                      <Icon fontSize={16} strokeWidth={1.7} aria-hidden="true" />
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
              <p className="winonboard__eyebrow">03 — {STEPS[2]}</p>
              <h2 className="winonboard__lead">ready to enter</h2>
              <p className="winonboard__lede">{WHAT_ENTER}</p>
            </article>
          )}
        </div>

        <footer className="winonboard__foot">
          <div className="winonboard__ladder" aria-hidden="true">
            {STEPS.map((label, index) => (
              <span key={label} className="winonboard__segrun" data-active={index === step ? "true" : undefined} />
            ))}
          </div>
          <div className="winonboard__actions">
            <button type="button" className="winonboard__skip" onClick={finish}>
              skip
            </button>
            {step > 0 && (
              <button type="button" className="winonboard__act" onClick={() => setStep((value) => value - 1)}>
                <ArrowLeft fontSize={14} aria-hidden="true" />
                back
              </button>
            )}
            {last ? (
              <button type="button" className="winonboard__act winonboard__act--primary" onClick={finish}>
                enter stealthhead
                <ArrowRight fontSize={14} aria-hidden="true" />
              </button>
            ) : (
              <button
                type="button"
                className="winonboard__act winonboard__act--primary"
                onClick={() => setStep((value) => value + 1)}
              >
                continue
                <ArrowRight fontSize={14} aria-hidden="true" />
              </button>
            )}
          </div>
        </footer>
      </section>
    </div>
  );
}
