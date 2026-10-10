/**
 * intro.tsx — the PRESENTATION page of cadria (the first interface of two:
 * the intro presents, the platform works). The page announces the studio
 * that listens — the ONE drawn mark over a lowercase display headline, the
 * honest value proposition, two ctas (open the studio → the platform home;
 * hear to see → the inline demo) — then runs the real engine live: the demo
 * strip below synthesizes fixtures in code, analyzes them with the genuine
 * wave-1 chain and renders the deterministic frame with the genuine wave-2
 * render layer. The capability row names the four generation lanes and the
 * footer strip keeps the family row and the legal line. Public-site rules:
 * zero storage (no session/local/indexed), zero network calls, React state
 * only; reduced motion skips every JS-driven beat.
 *
 * The anchor carries the page mount: it imports the loose components beside
 * it and is consumed only by Sol/Sol.tsx (the route /intro).
 */

import { useCallback, useState } from "react";
import { Link } from "wouter";
import { CadriaMark } from "../shell/Shell.tsx";
import CapabilityRow from "./capabilities.tsx";
import DemoStrip, { type DemoCue } from "./demo.tsx";
import IntroFooter from "./footer.tsx";

/** quiet secondary text: the page ink, softened (theme-proof). */
const MUTED = "color-mix(in srgb, currentColor 64%, transparent)";
/** the hairline the page draws beside the contract's own. */
const HAIR = "1px solid color-mix(in srgb, currentColor 18%, transparent)";

/**
 * The intro page: hero → demo → capabilities → footer, one mark, two ctas.
 *
 * @returns the intro element.
 */
export default function Intro() {
  const [cue, setCue] = useState<DemoCue | null>(null);

  /** the ghost cta: scrolls to the demo and cues the first fixture run. */
  const hearToSee = useCallback(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    document.getElementById("intro-demo")?.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
    setCue((current) => ({ id: "glass", nonce: (current?.nonce ?? 0) + 1 }));
  }, []);

  const heroStyle = {
    width: "100%",
    maxWidth: 1080,
    margin: "0 auto",
    padding: "104px 24px 64px",
    boxSizing: "border-box",
    textAlign: "center",
  } as const;
  const h1Style = {
    margin: "14px 0 18px",
    fontSize: "clamp(2.3rem, 5.4vw, 3.5rem)",
    lineHeight: 1.04,
    letterSpacing: "-0.03em",
    fontWeight: 650,
  } as const;
  const ledeStyle = {
    margin: "0 auto",
    maxWidth: "64ch",
    color: MUTED,
    fontSize: "1.05rem",
    lineHeight: 1.62,
  } as const;
  const ctaRowStyle = { display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 10, marginTop: 30 } as const;
  const ghostStyle = { background: "transparent", border: HAIR, color: "inherit" } as const;
  const dividerStyle = {
    width: "100%",
    maxWidth: 1080,
    margin: "0 auto",
    padding: "0 24px",
    boxSizing: "border-box",
  } as const;

  return (
    <div className="intro-page" data-page="intro">
      <main>
        {/* HERO — the one mark, the lowercase headline, the honest proposition */}
        <section aria-labelledby="intro-h" style={heroStyle}>
          <span className="intro-hero__mark reveal" aria-hidden="true">
            <CadriaMark size={76} hidden />
          </span>
          <p className="mono-label reveal" style={{ margin: "22px 0 0" }}>
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
            <Link href="/" className="btn">
              open the studio
            </Link>
            <button type="button" className="btn ghost" style={ghostStyle} onClick={hearToSee}>
              hear to see
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
