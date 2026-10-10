/**
 * explore page anchor — layer 3 of the anchor architecture.
 * The file carrying the folder's own name is the path manager of the page:
 * it imports the loose components beside it, mounts the page and re-exports
 * the public component surface. Only the theme anchor (Sol/Sol.tsx) consumes
 * this file.
 */

import { ArrowRight, RotateCcw } from "lucide-react";
/** Style: DevThink orbital launcher — the navigation hub of the entry flow
 * (campaign v3, wave R1-d: the owner doctrine — the hub is a stage, not a
 * settings page). ONE hero zone: the prompt-giga command field (the giant
 * input with the open action embedded inside it, quick-filter chips riding
 * below) over the Modulify atmosphere (one warm radial light, two halftone
 * edge dissolves, one film-grain veil), then the app constellation — the
 * devthink native surfaces as the wide feature rail of hairline rows and
 * the nine external family apps as the identity grid with ONE tile raised
 * (the center-pop). The curated rails (recent, pinned, all apps) answer as
 * horizontal snap rails, the core modules close the page as an editorial
 * ledger. Data comes only from the existing sources: the app registry
 * (Sol/shell/appregistry.ts) and the catalog clients this page already
 * read. The window chrome on the top edge (windowchrome.tsx) is
 * presentational: minimize collapses the landing into a restore chip,
 * maximize toggles the full-bleed frame, close returns to the intro (the
 * explicit close clears the session flag so the opening plays again — the
 * only replay path beyond a cold load). Logo discipline: the ONE navbar
 * above (ShellChrome) owns the brand mark — the hub rides the mono wordmark
 * and the drawing sigil beside the eyebrow, never a second logo. */
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import {
  type CoreModule,
  coreModuleTable,
  type StudioAsset,
  type StudioTrack,
  studioAssets,
  studioTracks,
} from "../../catalog";
import { INTRO_SEEN_KEY } from "../../introtarget";
import { SolLogoMark } from "../panel/logo.tsx";
import { ShellChrome } from "../shell/ShellChrome.tsx";
import { ExploreSections } from "./exploresections.tsx";
import { LaunchDeck, OsSigil } from "./launchdeck.tsx";
import { HeroWaves } from "./waves.tsx";
import { WindowEdgeChrome } from "./windowchrome.tsx";

export * from "./exploresections.tsx";
export * from "./launchdeck.tsx";
export * from "./waves.tsx";
export * from "./windowchrome.tsx";

type LandingState = "open" | "minimized";
type FrameState = "windowed" | "maximized";

/** the slim .pagehead row of the landing: the eyebrow left, the actions of
 * the retired landing bar right (the anchor jumps and the enter CTA). The
 * ONE navbar above (ShellChrome) carries the brand mark, so the landing
 * mounts no second header of its own. */
const pageheadStyle = {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 16,
  padding: "18px 0 0",
} as const;
/** the eyebrow grammar of the doctrine: mono, lowercase, quiet tracking */
const eyebrowStyle = {
  margin: 0,
  color: "var(--dt-muted)",
  font: "500 10px var(--dt-mono)",
  letterSpacing: ".08em",
  textTransform: "none",
} as const;
const actionsStyle = { display: "flex", flexWrap: "wrap", alignItems: "center", gap: 18 } as const;

/* ---- the hero atmosphere: the named light source, the halftone edge
        dissolves and the film grain — layered over the graphite mica, all
        presentational, pointer-transparent, riding the campaign recipes ---- */
const heroLightStyle = {
  position: "absolute",
  inset: 0,
  zIndex: 0,
  pointerEvents: "none",
  background:
    "radial-gradient(1200px 700px at 72% -12%, rgb(255 95 0 / 15%), transparent 62%), radial-gradient(900px 620px at 6% 110%, rgb(255 159 46 / 9%), transparent 58%)",
} as const;
const halftoneEdgeStyle = {
  position: "absolute",
  zIndex: 0,
  pointerEvents: "none",
  backgroundImage: "radial-gradient(rgb(255 95 0 / 16%) 1px, transparent 1.4px)",
  backgroundSize: "11px 11px",
} as const;
const halftoneTopStyle = {
  ...halftoneEdgeStyle,
  top: 0,
  right: 0,
  width: "min(48vw, 620px)",
  height: 380,
  maskImage: "radial-gradient(620px 380px at 100% 0%, #000 0%, transparent 72%)",
  WebkitMaskImage: "radial-gradient(620px 380px at 100% 0%, #000 0%, transparent 72%)",
} as const;
const halftoneLowStyle = {
  ...halftoneEdgeStyle,
  bottom: 0,
  left: 0,
  width: "min(38vw, 470px)",
  height: 320,
  backgroundImage: "radial-gradient(rgb(255 143 36 / 12%) 1px, transparent 1.4px)",
  maskImage: "radial-gradient(470px 320px at 0% 100%, #000 0%, transparent 72%)",
  WebkitMaskImage: "radial-gradient(470px 320px at 0% 100%, #000 0%, transparent 72%)",
} as const;
const heroGrainStyle = {
  position: "absolute",
  inset: 0,
  zIndex: 0,
  pointerEvents: "none",
  backgroundImage:
    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23n)' opacity='.05'/%3E%3C/svg%3E\")",
} as const;

/* ---- the hero zone: the lead statement, then the stage answers below —
        the command field, the chips, the constellation; one warm light over
        the whole zone, editorial air between the beats ---- */
const heroStyle = {
  position: "relative",
  paddingTop: "clamp(56px, 9vh, 118px)",
  paddingBottom: "clamp(40px, 6vh, 72px)",
  textAlign: "left",
} as const;
const leadStyle = {
  position: "relative",
  zIndex: 1,
  maxWidth: 780,
  marginBottom: "clamp(30px, 4.5vh, 48px)",
} as const;
/** the headline rides the display face token; the system sans answers
 * until the token ships */
const heroTitleStyle = {
  margin: "0 0 16px",
  font: "700 clamp(36px, 6.4vw, 74px)/1.04 var(--font-display, var(--dt-sans))",
  letterSpacing: "-.035em",
  textWrap: "balance",
} as const;
const heroEyebrowStyle = { fontSize: 10, letterSpacing: ".08em", textTransform: "none" } as const;
const heroSubStyle = { maxWidth: 560, fontSize: 14 } as const;

/** the editorial ledger rows of the core modules (index / name / role) */
const ledgerIndexStyle = {
  color: "var(--dt-faint)",
  font: "500 9px var(--dt-mono)",
  fontVariantNumeric: "tabular-nums",
} as const;
const ledgerNameStyle = {
  color: "var(--dt-text)",
  font: "600 14px/1.3 var(--font-display, var(--dt-sans))",
  letterSpacing: "-.01em",
} as const;
const ledgerRoleStyle = { color: "var(--dt-muted)", fontSize: 12, lineHeight: 1.65 } as const;

/** The DevThink free exploration landing, served at /explore (the web intro
 * hands its zoom expansion over to this page) — the orbital launcher hub. */
export default function Explore() {
  const [, navigate] = useLocation();
  const [modules, setModules] = useState<CoreModule[]>([]);
  const [assets, setAssets] = useState<StudioAsset[]>([]);
  const [tracks, setTracks] = useState<StudioTrack[]>([]);
  const [landing, setLanding] = useState<LandingState>("open");
  const [frame, setFrame] = useState<FrameState>("windowed");

  useEffect(() => {
    void coreModuleTable().then(setModules);
    void studioAssets().then(setAssets);
    void studioTracks().then(setTracks);
  }, []);

  /** the explicit close: the only replay path of the intro beyond a cold load */
  function closeLanding() {
    try {
      window.sessionStorage.removeItem(INTRO_SEEN_KEY);
    } catch {
      /* storage unavailable: the intro still receives the navigation */
    }
    navigate("/");
  }

  function enterOs() {
    navigate("/auth");
  }

  if (landing === "minimized") {
    return (
      <button type="button" className="dt-restorechip" onClick={() => setLanding("open")}>
        <SolLogoMark size={16} />
        <span>explore — devthink</span>
        <RotateCcw size={13} aria-hidden="true" />
      </button>
    );
  }

  return (
    <div className="dt-landing" data-max={frame === "maximized" ? "true" : undefined}>
      <WindowEdgeChrome
        maximized={frame === "maximized"}
        onMinimize={() => setLanding("minimized")}
        onMaximize={() => setFrame(frame === "maximized" ? "windowed" : "maximized")}
        onClose={closeLanding}
      />

      {/* the ONE chrome of the theme as the landing's header row: brand mark,
          pins, omnibox and tray — no second navbar rides the frame */}
      <ShellChrome />

      <main className="dt-landing__page">
        <header className="pagehead" style={pageheadStyle}>
          <p className="pagehead__eyebrow" style={eyebrowStyle}>
            devthink · explore
          </p>
          <div className="pagehead__actions" style={actionsStyle}>
            <nav className="dt-landing__nav" aria-label="Site navigation">
              <a href="#constellation">constellation</a>
              <a href="#family">family</a>
              <a href="#rails">rails</a>
              <a href="#does">what it does</a>
            </nav>
            <button type="button" className="dt-landing__cta" onClick={enterOs}>
              enter devthink
              <ArrowRight size={15} aria-hidden="true" />
            </button>
          </div>
        </header>

        <section className="dt-landing__hero ldk-hero" aria-label="DevThink — the launcher of the os" style={heroStyle}>
          {/* the atmosphere: one warm light source, two halftone edge
              dissolves and the film grain — layered, pointer-transparent */}
          <div className="atmos dt-hero__light" style={heroLightStyle} aria-hidden="true" />
          <div className="halftone dt-hero__halftone" style={halftoneTopStyle} aria-hidden="true" />
          <div className="halftone dt-hero__halftone" style={halftoneLowStyle} aria-hidden="true" />
          <div className="grain dt-hero__grain" style={heroGrainStyle} aria-hidden="true" />

          <div style={leadStyle}>
            <p className="dt-landing__eyebrow" style={heroEyebrowStyle}>
              <OsSigil size={18} /> <span>devthink · explore — the launcher</span>
            </p>
            <h1 style={heroTitleStyle}>
              every surface of the os, <em>one command away</em>
            </h1>
            <p className="dt-landing__sub" style={heroSubStyle}>
              the stage reads the whole registry: type, filter, open. the native surfaces and the nine family apps share
              one field.
            </p>
          </div>

          <LaunchDeck />
        </section>

        <HeroWaves caption="02 · the rails" meta="recent · pinned · all apps" />

        <ExploreSections assets={assets} tracks={tracks} />

        <HeroWaves caption="03 · the modules" meta="the core catalog" />

        <section className="dt-landing__section ldk-ledgerzone" id="does" aria-labelledby="dt-sec-does">
          <header className="dt-landing__sechead">
            <p className="ldk-railzone__cap">the core modules</p>
            <h2 id="dt-sec-does">what the platform does</h2>
            <p>the modules of the core catalog — the same rows the panel serves after you enter.</p>
          </header>
          <ul className="ldk-ledger">
            {modules.map((module, index) => (
              <li key={module.name}>
                <span aria-hidden="true" style={ledgerIndexStyle}>
                  {String(index + 1).padStart(2, "0")}
                </span>
                <strong style={ledgerNameStyle}>{module.name}</strong>
                <span style={ledgerRoleStyle}>{module.role}</span>
              </li>
            ))}
          </ul>
        </section>
      </main>

      <footer className="dt-landing__footer">
        <span className="dt-landing__brandmark" aria-hidden="true">
          <SolLogoMark size={18} accent />
          DevThink
        </span>
        <nav aria-label="Institutional">
          <a href="/about">about</a>
          <a href="/terms">terms</a>
          <a href="/policy">privacy</a>
        </nav>
        <small>
          exploration is free and reads the public catalog · the local identity of the os is yours: no remote
          authentication, no telemetry
        </small>
      </footer>
    </div>
  );
}
