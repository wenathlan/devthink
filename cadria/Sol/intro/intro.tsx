/**
 * intro.tsx — the PRESENTATION page of cadria (the first interface of two:
 * the intro presents, the platform works). The page opens on the akash
 * floor — the splash rides over the landing when the intro was never seen
 * (mark spring + backOut name, exit slide-up 0.8s, click/key skip, no
 * loading dots) and marks introseen through the one accessor — then the
 * spec §8.1 landing bar — the ONE mark slot, the mono links into the
 * platform, the ONE primary cta — then the hero carries the animated mark
 * with the light band riding INSIDE its glyph strokes (the spec §9
 * signature), the lowercase tagline and the single cta. Below, the page
 * runs the real engine live: the demo strip synthesizes fixtures in code,
 * analyzes them with the genuine wave-1 chain and renders the deterministic
 * frame with the genuine wave-2 render layer; the capability ledger names
 * the four generation lanes; the footer strip keeps the family row and the
 * legal line. Public-site rules: zero network calls from the page itself
 * (the seen flags ride onboardingstate.ts), React state only; reduced
 * motion skips every JS-driven beat.
 *
 * The anchor carries the page mount: it imports the loose components beside
 * it and is consumed only by Sol/Sol.tsx (the route /intro).
 */

import { ArrowDownRegular, ArrowUpRightRegular } from "@fluentui/react-icons";
import { useCallback, useEffect, useState } from "react";
import { Link } from "wouter";
import { markOnboardingStage, readOnboardingState } from "../../onboardingstate.ts";
import { CadriaMark } from "../shell/Shell.tsx";
import CapabilityRow from "../components/intro.capabilities.tsx";
import DemoStrip, { type DemoCue } from "../components/intro.demo.tsx";
import IntroFooter from "../components/intro.footer.tsx";
import IntroSplash from "../components/intro.splash.tsx";

/** the lifecycle of the opening act: pending (the state read resolves) →
 * playing (the akash floor over the landing) → done (the landing alone). */
type SplashPhase = "pending" | "playing" | "done";

/** quiet secondary text: the page ink, softened (theme-proof). */
const MUTED = "color-mix(in srgb, currentColor 64%, transparent)";
/** the hairline the page draws beside the contract's own. */
const HAIR = "1px solid color-mix(in srgb, currentColor 18%, transparent)";

/** the mono platform links of the landing bar (the rail seats, lowercased). */
const NAV_LINKS: readonly { label: string; href: string }[] = [
  { label: "studio", href: "/studio" },
  { label: "editor", href: "/edit" },
  { label: "gallery", href: "/gallery" },
  { label: "player", href: "/player" },
];

/**
 * The intro page: the akash-floor splash opens (when the intro was never
 * seen), then bar → hero → demo → capabilities → footer, one mark, one cta.
 * The splash's leave marks introseen through the one accessor; the ONE cta
 * hands the surface to /onboarding.
 *
 * @returns the intro element.
 */
export default function Intro() {
  const [cue, setCue] = useState<DemoCue | null>(null);
  const [splash, setSplash] = useState<SplashPhase>("pending");

  // the flow law: the splash plays once, only while the intro is unseen
  useEffect(() => {
    let live = true;
    readOnboardingState().then((state) => {
      if (live) setSplash(state.introseen ? "done" : "playing");
    });
    return () => {
      live = false;
    };
  }, []);

  /** the splash leaves: the intro counts as seen (leaving counts — the
   * visitor answered the stage), the landing stays beneath. */
  const onSplashLeave = useCallback(() => {
    void markOnboardingStage("intro");
  }, []);

  /** the slide completed: the splash unmounts, the landing owns the page. */
  const onSplashDone = useCallback(() => {
    setSplash("done");
  }, []);

  /** the quiet cue: scrolls to the demo and cues the first fixture run. */
  const hearToSee = useCallback(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    document.getElementById("intro-demo")?.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
    setCue((current) => ({ id: "glass", nonce: (current?.nonce ?? 0) + 1 }));
  }, []);

  const heroStyle = {
    width: "100%",
    maxWidth: 1080,
    margin: "0 auto",
    padding: "clamp(72px, 11vw, 132px) 24px clamp(56px, 8vw, 96px)",
    boxSizing: "border-box",
    textAlign: "center",
  } as const;
  const h1Style = {
    margin: "18px 0 22px",
    fontSize: "clamp(2.9rem, 6.8vw, 5.2rem)",
    lineHeight: 1.02,
    letterSpacing: "-0.035em",
    fontWeight: 750,
  } as const;
  const ledeStyle = {
    margin: "0 auto",
    maxWidth: "68ch",
    color: MUTED,
    fontSize: "1.125rem",
    lineHeight: 1.68,
  } as const;
  const ctaRowStyle = {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
    gap: 14,
    marginTop: 34,
  } as const;
  const dividerStyle = {
    width: "100%",
    maxWidth: 1080,
    margin: "0 auto",
    padding: "0 24px",
    boxSizing: "border-box",
  } as const;

  // the state read holds the page: nothing renders, the canvas alone shows — no flash
  if (splash === "pending") return null;

  return (
    <div className="intro-page" data-page="intro">
      {/* the akash floor: the opening act rides over the landing until its slide completes */}
      {splash === "playing" && <IntroSplash onLeave={onSplashLeave} onDone={onSplashDone} />}
      {/* LANDING BAR — the wordmark rides the bar; the drawn mark stays the
          hero's (the ONE brand focus per surface — spec principle 10) */}
      <header className="intro-nav">
        <span className="intro-nav__word">cadria</span>
        <span className="intro-nav__spacer" />
        {NAV_LINKS.map((link) => (
          <Link key={link.href} href={link.href} className="intro-nav__link">
            {link.label}
          </Link>
        ))}
        <Link href="/onboarding" className="btn" style={{ minHeight: 40 }}>
          open the studio
        </Link>
      </header>

      <main>
        {/* HERO — the animated mark, the lowercase tagline, the single cta */}
        <section aria-labelledby="intro-h" style={heroStyle}>
          <span className="intro-hero__mark reveal" aria-hidden="true">
            <CadriaMark size={112} hidden flow />
          </span>
          <p className="mono-label reveal" style={{ margin: "28px 0 0" }}>
            cadria · the studio that listens
          </p>
          <h1 id="intro-h" className="reveal" style={h1Style}>
            hear a sound.
            <br />
            see its picture.
          </h1>
          <p className="reveal" style={ledeStyle}>
            drop any audio — the engine reads its spectrum, rhythm, tonality, timbre and structure, then
            deterministically generates the artwork the sound implies: palettes from key, composition from sections,
            texture from timbre, motion from bpm. one hundred percent client-side — the same audio always renders the
            same image.
          </p>
          <div className="reveal" style={ctaRowStyle}>
            <Link href="/onboarding" className="btn">
              open the studio
              <ArrowUpRightRegular fontSize={15} aria-hidden="true" />
            </Link>
            <button type="button" className="intro-cue" onClick={hearToSee}>
              hear to see — the engine, live
              <ArrowDownRegular fontSize={13} aria-hidden="true" />
            </button>
          </div>
          <p className="mono-label reveal" style={{ margin: "26px auto 0", maxWidth: "72ch" }}>
            no uploads · no accounts · deterministic by construction — the demo below runs the real chain
          </p>
        </section>

        {/* the one hairline that separates hero from the live engine */}
        <div aria-hidden="true" style={dividerStyle}>
          <div style={{ borderTop: HAIR }} />
        </div>

        {/* DEMO — the real analysis → render flow over in-code fixtures */}
        <DemoStrip cue={cue} />

        {/* CAPABILITIES — the four quiet generation lanes */}
        <CapabilityRow />
      </main>

      {/* FOOTER — the family row and the legal line */}
      <IntroFooter />
    </div>
  );
}
