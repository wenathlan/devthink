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
 * write and no visitor storage beyond the shared onboarding state. Every
 * word of the dialog rides the label store (labels.ts — the copy law):
 * the three frame names arrive as the onboarding.steps row the page
 * splits, so no fixed step array lives in the component.
 */

import {
        ArrowLeftRegular as ArrowLeft,
        ArrowRightRegular as ArrowRight,
        TableRegular as LayoutDashboard,
} from '@fluentui/react-icons';
import { useCallback, useState } from 'react';
import { useLocation } from 'wouter';
import { markOnboardingSeen } from '../../onboardingstate.ts';
import { label, labelfill } from '../../labels.ts';
import { SaddleMark, START_APPS } from '../shell/Shell.tsx';

/** the three frames of the first run, in order — one config row of the
 * label store the page splits (the onboarding.steps precedent of the
 * provider chain row of the architecture page). */
const steps = label('onboarding.steps').split(' · ');

/**
 * The onboarding page: a three-step first-run dialog that hands the
 * surface to the home of the window.
 *
 * @returns the onboarding element.
 */
export default function Onboarding() {
        const [, navigate] = useLocation();
        const [step, setStep] = useState(0);
        const last = step === steps.length - 1;

        /** the hand-over: the onboarding counts as seen (finish and skip alike —
         * seen = may skip; never forced again) and the window opens on the home. */
        const enterHome = useCallback(() => {
                markOnboardingSeen();
                navigate('/');
        }, [navigate]);

        return (
                <div className="winonboard">
                        <section className="winonboard__card" aria-label={label('onboarding.cardAria')}>
                                <header className="winonboard__head">
                                        <SaddleMark size={18} hidden />
                                        <span className="winonboard__title">{label('onboarding.title')}</span>
                                        <button type="button" className="winonboard__skip" onClick={enterHome}>
                                                {label('onboarding.skip')}
                                        </button>
                                </header>

                                <div className="winonboard__body">
                                        {step === 0 && (
                                                <article className="winonboard__step" key="what">
                                                        <p className="winonboard__eyebrow">
                                                                {labelfill('onboarding.eyebrow', {
                                                                        index: String(step + 1),
                                                                        step: steps[step],
                                                                })}
                                                        </p>
                                                        <h2 className="winonboard__lead">
                                                                {label('onboarding.what.title')}
                                                        </h2>
                                                        <p className="winonboard__lede">
                                                                {label('onboarding.what.body')}
                                                        </p>
                                                </article>
                                        )}
                                        {step === 1 && (
                                                <article className="winonboard__step" key="does">
                                                        <p className="winonboard__eyebrow">
                                                                {labelfill('onboarding.eyebrow', {
                                                                        index: String(step + 1),
                                                                        step: steps[step],
                                                                })}
                                                        </p>
                                                        <h2 className="winonboard__lead">
                                                                {label('onboarding.does.title')}
                                                        </h2>
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
                                                        <p className="winonboard__eyebrow">
                                                                {labelfill('onboarding.eyebrow', {
                                                                        index: String(step + 1),
                                                                        step: steps[step],
                                                                })}
                                                        </p>
                                                        <h2 className="winonboard__lead">
                                                                {label('onboarding.enter.title')}
                                                        </h2>
                                                        <p className="winonboard__lede">
                                                                {label('onboarding.enter.body')}
                                                        </p>
                                                </article>
                                        )}
                                </div>

                                <footer className="winonboard__foot">
                                        <div className="winonboard__ladder" aria-hidden="true">
                                                {steps.map((stepname, index) => (
                                                        <span
                                                                key={stepname}
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
                                                                {label('onboarding.back')}
                                                        </button>
                                                )}
                                                {last ? (
                                                        <button
                                                                type="button"
                                                                className="winonboard__act winonboard__act--primary"
                                                                onClick={enterHome}
                                                        >
                                                                {label('onboarding.enterCta')}
                                                                <ArrowRight fontSize={14} aria-hidden="true" />
                                                        </button>
                                                ) : (
                                                        <button
                                                                type="button"
                                                                className="winonboard__act winonboard__act--primary"
                                                                onClick={() => setStep((value) => value + 1)}
                                                        >
                                                                {label('onboarding.continue')}
                                                                <ArrowRight fontSize={14} aria-hidden="true" />
                                                        </button>
                                                )}
                                        </div>
                                </footer>
                        </section>
                </div>
        );
}
