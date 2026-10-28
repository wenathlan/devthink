/**
 * intro page anchor — layer 3 of the anchor architecture. The file carrying
 * the folder's own name is the path manager of the page: it imports the
 * loose components beside it, mounts the page and re-exports the public
 * component surface. Only the theme anchor (Sol/Sol.tsx) consumes this file.
 *
 * The PRESENTATION page of cobaia — the family grammar's last seat (every
 * app of the family carries one): the page mounts BARE at /intro, no window
 * chrome, riding the site voice, not the frame. The akash splash opens over
 * the landing (the mark spring on the overshoot curve, the name rise, the
 * role fade; click/tap/key skip; reduced motion never plays; the no storage
 * law holds — no seen flag, the splash plays per visit and writes nothing),
 * then the landing answers: the hero says what the surface is (the
 * monetization face kept apart so the main sites stay clean), the plans
 * zone renders the real offer from the one checkoutlinks table (the not
 * configured state stays honest), the doors panes open the app directory
 * and the legal page, and the footer carries the doors (the site row, the
 * family row, the legal line). The entrance rides the cb-in stagger under
 * the second, the layers ride the surface-ladder bands, the door panes ride
 * the silk law. Public-site rules: zero network calls from the page itself,
 * React state only; zero decorative dots; zero invented numbers and zero
 * fake testimonials — the real offer, read from the data modules.
 */

import type { CSSProperties } from "react";
import { Link } from "wouter";
import { useCallback, useEffect, useState } from "react";
import { label } from "../../labels";
import { IntroFooter as IntroFooter } from "../widgets";
import { IntroPlans as IntroPlans } from "../widgets";
import { IntroSplash as IntroSplash } from "../widgets";
import { BrandMark } from "../widgets";

/** the lifecycle of the opening act: resolving (the motion preference
 * decides) → playing (the akash floor over the landing) → done (the
 * landing alone). No seen state is consulted — the no storage law. */
type SplashPhase = "resolving" | "playing" | "done";

/** the door glyph of the panes: the inline 10×10 chevron the chrome's
 * caption grammar draws (the app carries no icon dependency). */
function DoorGlyph() {
  return (
    <svg
      className="cb-intropane__glyph"
      width="10"
      height="10"
      viewBox="0 0 10 10"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M3 0l5 5-5 5" fill="none" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

/**
 * The intro page: the splash plays over the landing, then the bare
 * presentation answers — hero, plans, doors, footer.
 *
 * @returns the intro element (null while the motion preference decides).
 */
export function Intro() {
  const [splash, setSplash] = useState<SplashPhase>("resolving");

  // the splash decision rides the motion preference alone — nothing is read
  // from the visitor machine and nothing is written back (the no storage law)
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setSplash("done");
      return;
    }
    setSplash("playing");
  }, []);

  /** the slide completed: the splash unmounts, the landing owns the page. */
  const onSplashDone = useCallback(() => {
    setSplash("done");
  }, []);

  /** the quiet cue: walks the page to the plans band. */
  const cuePlans = useCallback(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    document.getElementById("intro-plans")?.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
  }, []);

  // the phase decision holds the paint: nothing renders while it resolves —
  // no flash of the landing under a splash that will never play
  if (splash === "resolving") return null;

  return (
    <div className="cb-intro" data-page="intro">
      {/* the skip link rides outside no frame — the bare page answers the
       * viewport directly; the splash sits above it while it plays */}
      <a className="cb-skip" href="#intro-content">
        {label("shell.skip")}
      </a>

      {/* the akash floor: the opening act rides over the landing until its
       * slide completes; reduced motion never mounts it */}
      {splash === "playing" && <IntroSplash onDone={onSplashDone} />}

      {/* the intro bar: the wordmark and the two quiet doors — the ONE
       * primary cta lives in the hero */}
      <header className="cb-introbar">
        <div className="cb-introbar__in">
          <span className="cb-introbar__brand">
            <BrandMark size={20} />
            <span className="cb-introbar__word">{label("shell.name")}</span>
          </span>
          <span className="cb-introbar__spacer" />
          <nav className="cb-introbar__nav" aria-label={label("intro.bar.aria")}>
            <Link className="cb-introdoor" href="/apps">
              {label("shell.foot.apps")}
            </Link>
            <Link className="cb-introdoor" href="/pricing">
              {label("shell.foot.pricing")}
            </Link>
          </nav>
        </div>
      </header>

      <main id="intro-content">
        {/* the hero: what the surface is, said directly */}
        <section className="cb-introhero" aria-label={label("intro.aria.page")}>
          <div className="cb-introwrap">
            <span className="cb-introhero__mark cb-in" style={{ "--cb-d": 0 } as CSSProperties} aria-hidden="true">
              <BrandMark size={64} />
            </span>
            <p className="cb-eyebrow cb-in" style={{ "--cb-d": 1 } as CSSProperties}>
              {label("intro.hero.eyebrow")}
            </p>
            <h1 className="cb-title cb-in" style={{ "--cb-d": 2 } as CSSProperties}>
              {label("intro.hero.title")}
            </h1>
            <p className="cb-lede cb-in" style={{ "--cb-d": 3 } as CSSProperties}>
              {label("intro.hero.lede")}
            </p>
            <div className="cb-btnrow cb-in" style={{ "--cb-d": 4 } as CSSProperties}>
              <Link className="cb-btn" href="/">
                {label("intro.hero.cta")}
              </Link>
              <button type="button" className="cb-btn cb-btn--ghost" onClick={cuePlans}>
                {label("intro.hero.cue")}
              </button>
            </div>
            <p className="cb-note cb-in" style={{ "--cb-d": 5 } as CSSProperties}>
              {label("intro.hero.note")}
            </p>
          </div>
        </section>

        {/* the plans as they really are (the one checkoutlinks table) */}
        <IntroPlans />

        {/* the doors: the app directory and the legal page, on silk panes */}
        <section className="cb-introband cb-introband--deep" aria-label={label("intro.doors.aria")}>
          <div className="cb-introwrap">
            <div className="cb-secthead cb-in" style={{ "--cb-d": 0 } as CSSProperties}>
              <p className="cb-eyebrow">{label("intro.doors.eyebrow")}</p>
              <h2 className="cb-secttitle">{label("intro.doors.title")}</h2>
            </div>
            <div className="cb-introdoorgrid">
              <article className="cb-intropane cb-in" style={{ "--cb-d": 1 } as CSSProperties}>
                <p className="cb-cardmeta">{label("intro.doors.apps")}</p>
                <p className="cb-intropane__text">{label("intro.doors.appsText")}</p>
                <Link className="cb-intropane__door" href="/apps">
                  {label("intro.doors.appsCta")}
                  <DoorGlyph />
                </Link>
              </article>
              <article className="cb-intropane cb-in" style={{ "--cb-d": 2 } as CSSProperties}>
                <p className="cb-cardmeta">{label("intro.doors.legal")}</p>
                <p className="cb-intropane__text">{label("intro.doors.legalText")}</p>
                <Link className="cb-intropane__door" href="/legal">
                  {label("intro.doors.legalCta")}
                  <DoorGlyph />
                </Link>
              </article>
            </div>
          </div>
        </section>
      </main>

      {/* the footer carries the doors: the site row, the family row, the line */}
      <IntroFooter />
    </div>
  );
}

export default Intro;
