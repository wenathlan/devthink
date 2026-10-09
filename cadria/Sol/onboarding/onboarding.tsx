// the cadria onboarding of the theme.
/**
 * onboarding.tsx — the first-run steps of the APPLICATION (FAM-APPS-A):
 * three short frames presented like a Windows 11 first-run dialog over the
 * Mica backdrop — what the app IS (the honest role: the video and image
 * home of the family, not an operating system), what it DOES (the domains
 * the window hosts — player, studio, gallery over the versawase engine —
 * read straight from the rail map) and the ENTER frame with the hand-over
 * button. The finish navigates to "/" and the window takes it from there.
 * Frames remount on step change so the 250ms entry plays each time; reduced
 * motion rides the stylesheet hard stop. No opt-in switches here: the app
 * holds no account, no network write and no visitor storage.
 */

import { ArrowLeft, ArrowRight, LayoutDashboard } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import { CadriaMark, START_APPS } from "../shell/Shell";

/** the honest statement of the opening frame (what the app is). */
const WHAT_IT_IS =
  "cadria is the video and image home of the wenathlan family — not an operating system: one application window holding the player, the studio workspace and the gallery of the craft, all riding the versawase engine.";

/** the honest statement of the closing frame (the hand-over). */
const WHAT_ENTER =
  "the window opens on the home page and every surface rides the same rail. the theme starts dark and stays in memory only — nothing is written to this machine.";

/** the three frames of the first run, in order. */
const STEPS = ["the app", "the surfaces", "enter"] as const;

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

  return (
    <div className="winonboard">
      <section className="winonboard__card" aria-label="cadria first run">
        <header className="winonboard__head">
          <CadriaMark size={18} hidden />
          <span className="winonboard__title">welcome to cadria</span>
        </header>

        <div className="winonboard__body">
          {step === 0 && (
            <article className="winonboard__step" key="what">
              <p className="winonboard__eyebrow">01 — {STEPS[0]}</p>
              <h2 className="winonboard__lead">one window, video and image</h2>
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
            {step > 0 && (
              <button type="button" className="winonboard__act" onClick={() => setStep((value) => value - 1)}>
                <ArrowLeft size={14} aria-hidden="true" />
                back
              </button>
            )}
            {last ? (
              <button type="button" className="winonboard__act winonboard__act--primary" onClick={() => navigate("/")}>
                enter cadria
                <ArrowRight size={14} aria-hidden="true" />
              </button>
            ) : (
              <button
                type="button"
                className="winonboard__act winonboard__act--primary"
                onClick={() => setStep((value) => value + 1)}
              >
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
