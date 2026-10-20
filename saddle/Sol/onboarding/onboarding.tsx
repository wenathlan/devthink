// the saddle onboarding of the theme.
/**
 * onboarding.tsx — the first-run steps of the APPLICATION (the family
 * window recipe): three short frames presented like a Windows 11 first-run
 * dialog over the canvas backdrop — what the app IS (the honest role: the
 * sandbox engine of the family, not an operating system), what it DOES
 * (the surfaces the window hosts — console, playground, compute and the
 * agent browser over the storage == compute engine — read straight from
 * the rail map) and the ENTER frame with the hand-over button. The finish
 * AND the skip mark onboarding seen through the one accessor
 * (onboardingstate.ts — seen = may skip; the flow is never forced again)
 * and navigate to "/" so the window takes over. Frames remount on step
 * change so the 250ms entry plays each time; reduced motion rides the
 * stylesheet hard stop. No opt-in switches here: the app holds no account
 * write and no visitor storage beyond the shared onboarding state.
 */

import {
        ArrowLeftRegular as ArrowLeft,
        ArrowRightRegular as ArrowRight,
        TableRegular as LayoutDashboard,
} from '@fluentui/react-icons';
import { useCallback, useState } from 'react';
import { useLocation } from 'wouter';
import { markOnboardingSeen } from '../../onboardingstate.ts';
import { SaddleMark, START_APPS } from '../shell/Shell';

/** the honest statement of the opening frame (what the app is). */
const WHAT_IT_IS =
        'saddle is the sandbox engine of the wenathlan family — not an operating system: one application window holding the console, the internal api playground, the compute tiers and the agent browser, all riding the storage == compute engine.';

/** the honest statement of the closing frame (the hand-over). */
const WHAT_ENTER =
        'the window opens on the home page and every surface rides the same sectioned rail. the theme starts light and flips in memory only — nothing is written to this machine.';

/** the three frames of the first run, in order. */
const STEPS = ['the app', 'the surfaces', 'enter'] as const;

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
                navigate('/');
        }, [navigate]);

        return (
                <div className="winonboard">
                        <section className="winonboard__card" aria-label="saddle first run">
                                <header className="winonboard__head">
                                        <SaddleMark size={18} hidden />
                                        <span className="winonboard__title">welcome to saddle</span>
                                        <button type="button" className="winonboard__skip" onClick={enterHome}>
                                                skip ahead
                                        </button>
                                </header>

                                <div className="winonboard__body">
                                        {step === 0 && (
                                                <article className="winonboard__step" key="what">
                                                        <p className="winonboard__eyebrow">01 — {STEPS[0]}</p>
                                                        <h2 className="winonboard__lead">one window, the sandbox engine</h2>
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
                                                        <span
                                                                key={label}
                                                                className="winonboard__segrun"
                                                                data-active={index === step ? 'true' : undefined}
                                                        />
                                                ))}
                                        </div>
                                        <div className="winonboard__actions">
                                                {step > 0 && (
                                                        <button
                                                                type="button"
                                                                className="winonboard__act"
                                                                onClick={() => setStep((value) => value - 1)}
                                                        >
                                                                <ArrowLeft fontSize={14} aria-hidden="true" />
                                                                back
                                                        </button>
                                                )}
                                                {last ? (
                                                        <button
                                                                type="button"
                                                                className="winonboard__act winonboard__act--primary"
                                                                onClick={enterHome}
                                                        >
                                                                enter saddle
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
