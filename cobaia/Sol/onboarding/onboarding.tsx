/**
 * onboarding page anchor — layer 3 of the anchor architecture.
 * The file carrying the folder's own name is the path manager of the page:
 * it imports the loose components beside it, mounts the page and re-exports
 * the public component surface. Only the theme anchor (Sol/Sol.tsx) consumes
 * this file.
 *
 * The onboarding walk of the SITE (the flow law: intro → onboarding → the
 * content): four short frames on the deep canvas, mounted in window grammar —
 * a real window card over the canvas, a title bar with the brand and the
 * caption close, the frames remounting per step so the 250ms Fluent entry
 * plays each time, the segment ladder tracking the position. The copy is
 * third-person lowercase per the family grammar: what cobaia is (the support
 * surface of the family — sponsorships, plans, the blog), how the family
 * apps link here, where the money goes, and the door into the site. The
 * finish AND the skip mark onboardingseen through the one accessor
 * (onboardingstate.ts — seen = may skip, the flow is never forced again) and
 * the walk hands the site at "/".
 */
import { useCallback, useState } from "react";
import { useLocation } from "wouter";
import { markOnboardingSeen } from "../../onboardingstate";
import { BrandMark } from "../shell/brand";

/** the four beats of the walk, in the family copy grammar (third-person,
 * lowercase): what the site is, how the family links here, where the money
 * goes, enter */
const STEPS = [
  {
    title: "what cobaia is",
    text: "cobaia is the support surface of the devthink family — the one site that carries the sponsorships, the plans and the update blog while the ten applications stay clean of ads and tracking.",
  },
  {
    title: "how the family links here",
    text: "every application of the family links here: the directory at /apps carries the whole roster one folder beside this site, and every sibling links back through the same address book — the family redirects both ways.",
  },
  {
    title: "where the money goes",
    text: "the family runs on about us$15 a month of domains and free static hosting. the plans and the support channels cover that floor first — and the applications themselves stay free of ads, forever.",
  },
  {
    title: "enter",
    text: "the site ahead is the front door: the app directory, the honest pricing, the support page and the update blog. the enter button opens the site.",
  },
] as const;

/** The onboarding page: the four-frame walk into the site, in window
 * grammar — the finish and the skip both count the stage seen. */
export default function Onboarding() {
  const [, navigate] = useLocation();
  const [step, setStep] = useState(0);
  const last = step === STEPS.length - 1;
  const current = STEPS[step];

  /** the hand-over: the onboarding counts as seen (finish and skip alike —
   * seen = may skip; never forced again) and the site opens on the home. */
  const enterSite = useCallback(() => {
    markOnboardingSeen();
    navigate("/", { replace: true });
  }, [navigate]);

  return (
    <main className="ob">
      <section className="ob__card" aria-label="cobaia onboarding">
        <header className="ob__bar">
          <BrandMark size={16} />
          <span className="ob__bartitle">cobaia — onboarding</span>
          <button type="button" className="ob__cap" onClick={enterSite} aria-label="skip the onboarding">
            <svg viewBox="0 0 10 10" aria-hidden="true" focusable="false">
              <path d="M1 1 L9 9 M9 1 L1 9" fill="none" stroke="currentColor" strokeWidth="1" />
            </svg>
          </button>
        </header>
        <div className="ob__body">
          <div className="ob__step" key={current.title}>
            <p className="ob__eyebrow">{`step ${step + 1} of ${STEPS.length}`}</p>
            <h1 className="ob__title">{current.title}</h1>
            <p className="ob__text">{current.text}</p>
          </div>
        </div>
        <div className="ob__meter" role="img" aria-label={`step ${step + 1} of ${STEPS.length}`}>
          {STEPS.map((s) => (
            <span key={s.title} className="ob__seg" data-done={STEPS.indexOf(s) <= step ? "true" : undefined} />
          ))}
        </div>
        <footer className="ob__foot">
          <button
            type="button"
            className="ob__btn"
            onClick={() => setStep((value) => Math.max(0, value - 1))}
            disabled={step === 0}
          >
            back
          </button>
          {last ? (
            <button type="button" className="ob__btn ob__btn--accent" onClick={enterSite}>
              enter cobaia
            </button>
          ) : (
            <button
              type="button"
              className="ob__btn"
              onClick={() => setStep((value) => Math.min(STEPS.length - 1, value + 1))}
            >
              next
            </button>
          )}
        </footer>
      </section>
    </main>
  );
}
