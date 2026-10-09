/**
 * explore page anchor — layer 3 of the anchor architecture.
 * The file carrying the folder's own name is the path manager of the page:
 * it imports the loose components beside it, mounts the page and re-exports
 * the public component surface. Only the theme anchor (Sol/Sol.tsx) consumes
 * this file.
 */

import { ArrowRight, Compass, RotateCcw, Sparkles } from "lucide-react";
/** Style: DevThink Landing — the SaaS page of the entry flow (the owner
 * doctrine: on the web the site opens as the free exploration app, YouTube/
 * Apple/Cloudflare grade, and the "enter devthink" button opens the OS).
 * The hero is the Modulify-grade composition: ONE warm radial light source
 * (the ember family at low alpha over the graphite mica), a halftone dot
 * dissolve at two edges, one film-grain veil, the headline on the display
 * face and an asymmetric layout — the lead object offset left, the studio
 * rail answering from the right, never a centered symmetric stack. The
 * strip below answers "what the platform does" from the core modules
 * catalog, the free sections are fed exclusively by the catalog clients
 * this page already used, and the footer keeps the institutional routes.
 * The window chrome on the top edge (windowchrome.tsx) is presentational:
 * minimize collapses the landing into a restore chip, maximize toggles the
 * full-bleed frame, close returns to the intro (the explicit close clears
 * the session flag so the opening plays again — the only replay path beyond
 * a cold load). The brand mark rides ONCE per zone: the ShellChrome navbar
 * and the edge chrome carry it — the hero mounts no second mark. */
import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import {
  type CoreModule,
  coreModuleTable,
  type FamilySite,
  familySites,
  type NativeApp,
  nativeApps,
  type Recipe,
  type RunnerBinary,
  recipeGallery,
  runnerBinaries,
  type StudioAsset,
  type StudioTrack,
  studioAssets,
  studioTracks,
} from "../../catalog";
import { INTRO_SEEN_KEY } from "../../introtarget";
import { SolLogoMark } from "../panel/logo";
import { ShellChrome } from "../shell/ShellChrome";
import { ExploreSections } from "./exploresections";
import { HeroWaves } from "./waves";
import { WindowEdgeChrome } from "./windowchrome";

export * from "./exploresections";
export * from "./waves";
export * from "./windowchrome";

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

/* ---- the asymmetric hero layout: the lead object offset left, the studio
        rail answering from the right; the flex wrap keeps the composition
        alive down to the phone without a media query ---- */
const heroStyle = {
  position: "relative",
  display: "flex",
  flexWrap: "wrap",
  alignItems: "flex-end",
  justifyContent: "space-between",
  gap: "34px 56px",
  paddingTop: "clamp(64px, 10vh, 132px)",
  paddingBottom: "clamp(150px, 20vh, 230px)",
  textAlign: "left",
} as const;
const leadStyle = {
  position: "relative",
  zIndex: 1,
  flex: "1 1 520px",
  maxWidth: 760,
  paddingBottom: 6,
} as const;
/** the headline rides the display face token (the C1-01 landing); the
 * system sans answers until the token ships */
const heroTitleStyle = {
  margin: "0 0 20px",
  font: "700 clamp(36px, 6.4vw, 76px)/1.04 var(--font-display, var(--dt-sans))",
  letterSpacing: "-.035em",
  textWrap: "balance",
} as const;
const heroEyebrowStyle = { fontSize: 10, letterSpacing: ".08em", textTransform: "none" } as const;
const heroSubStyle = { maxWidth: 520 } as const;
const heroActionsStyle = { justifyContent: "flex-start" } as const;

/* ---- the studio rail: the engines of the os, read from the loaded app
 * catalog (unique owners with their engines) plus the runner binaries —
 * real rows only, no invented numbers ---- */
const railStyle = {
  position: "relative",
  zIndex: 1,
  flex: "0 1 300px",
  minWidth: 264,
  margin: 0,
  paddingTop: 16,
  borderTop: "1px solid var(--sol-hairline)",
} as const;
const railHeadStyle = {
  margin: "0 0 14px",
  color: "var(--dt-faint)",
  font: "500 10px var(--dt-mono)",
  letterSpacing: ".08em",
} as const;
const railListStyle = { display: "grid", gap: 14, margin: 0, padding: 0, listStyle: "none" } as const;
const railRowStyle = { display: "flex", alignItems: "baseline", gap: 10 } as const;
const railIndexStyle = {
  flex: "none",
  color: "var(--dt-faint)",
  font: "500 9px var(--dt-mono)",
  fontVariantNumeric: "tabular-nums",
} as const;
const railBodyStyle = { display: "grid", gap: 2 } as const;
const railNameStyle = {
  color: "var(--dt-text)",
  font: "600 13px/1.3 var(--dt-sans)",
  letterSpacing: "-.01em",
} as const;
const railValueStyle = { color: "var(--dt-muted)", font: "400 10px/1.6 var(--dt-mono)" } as const;

/** The DevThink free exploration landing, served at /explore (the web intro
 * hands its zoom expansion over to this page). */
export default function Explore() {
  const [, navigate] = useLocation();
  const [sites, setSites] = useState<FamilySite[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [modules, setModules] = useState<CoreModule[]>([]);
  const [apps, setApps] = useState<NativeApp[]>([]);
  const [runners, setRunners] = useState<RunnerBinary[]>([]);
  const [assets, setAssets] = useState<StudioAsset[]>([]);
  const [tracks, setTracks] = useState<StudioTrack[]>([]);
  const [landing, setLanding] = useState<LandingState>("open");
  const [frame, setFrame] = useState<FrameState>("windowed");

  useEffect(() => {
    void familySites().then(setSites);
    void recipeGallery().then(setRecipes);
    void coreModuleTable().then(setModules);
    void nativeApps().then(setApps);
    void runnerBinaries().then(setRunners);
    void studioAssets().then(setAssets);
    void studioTracks().then(setTracks);
  }, []);

  /** the studio rail rows, derived from the loaded catalogs (unique owners
   * with their engines, then the runner binaries) */
  const railRows = useMemo(() => {
    const studioRows = [...new Set(apps.map((app) => app.owner))].map((owner) => ({
      label: owner,
      value: [...new Set(apps.filter((app) => app.owner === owner).map((app) => app.engine))].join(" · "),
    }));
    if (runners.length === 0) return studioRows;
    return [
      ...studioRows,
      { label: "runners", value: [...new Set(runners.map((runner) => runner.runner))].join(" · ") },
    ];
  }, [apps, runners]);

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
              <a href="#does">what it does</a>
              <a href="#creations">creations</a>
              <a href="#recipes">recipes</a>
              <a href="#family">family</a>
            </nav>
            <button type="button" className="dt-landing__cta" onClick={enterOs}>
              enter devthink
              <ArrowRight size={15} aria-hidden="true" />
            </button>
          </div>
        </header>

        <section className="dt-landing__hero" aria-label="DevThink — the local os" style={heroStyle}>
          {/* the atmosphere: one warm light source, two halftone edge
              dissolves and the film grain — layered, pointer-transparent */}
          <div className="atmos dt-hero__light" style={heroLightStyle} aria-hidden="true" />
          <div className="halftone dt-hero__halftone" style={halftoneTopStyle} aria-hidden="true" />
          <div className="halftone dt-hero__halftone" style={halftoneLowStyle} aria-hidden="true" />
          <div className="grain dt-hero__grain" style={heroGrainStyle} aria-hidden="true" />

          <div style={leadStyle}>
            <p className="dt-landing__eyebrow" style={heroEyebrowStyle}>
              <Sparkles size={13} aria-hidden="true" /> free to explore · the os comes after
            </p>
            <h1 style={heroTitleStyle}>
              the operating system of your work <em>with ai</em>
            </h1>
            <p className="dt-landing__sub" style={heroSubStyle}>
              Explore the platform for free: studio creations, runnable recipes, music, video and the app family. When
              you want your creation panel, enter DevThink.
            </p>
            <div className="dt-landing__actions" style={heroActionsStyle}>
              <button type="button" className="dt-landing__cta dt-landing__cta--hero" onClick={enterOs}>
                enter devthink
                <ArrowRight size={16} aria-hidden="true" />
              </button>
              <a className="dt-landing__ghost" href="#creations">
                <Compass size={15} aria-hidden="true" /> explore free
              </a>
            </div>
          </div>

          {railRows.length > 0 && (
            <aside className="dt-hero__rail" aria-label="The studios of the os" style={railStyle}>
              <p style={railHeadStyle}>the studios of the os</p>
              <ul style={railListStyle}>
                {railRows.map((row, index) => (
                  <li key={row.label} style={railRowStyle}>
                    <span aria-hidden="true" style={railIndexStyle}>
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span style={railBodyStyle}>
                      <strong style={railNameStyle}>{row.label}</strong>
                      <small style={railValueStyle}>{row.value}</small>
                    </span>
                  </li>
                ))}
              </ul>
            </aside>
          )}

          <HeroWaves />
        </section>

        <section className="dt-strip" id="does" aria-labelledby="dt-sec-does">
          <h2 id="dt-sec-does" style={{ fontFamily: "var(--font-display, var(--dt-sans))" }}>
            what the platform does
          </h2>
          <ul>
            {modules.map((module) => (
              <li key={module.name}>
                <strong>{module.name}</strong>
                <span>{module.role}</span>
              </li>
            ))}
          </ul>
        </section>

        <ExploreSections
          sites={sites}
          recipes={recipes}
          apps={apps}
          runners={runners}
          assets={assets}
          tracks={tracks}
        />
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
