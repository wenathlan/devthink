/**
 * explore page anchor — layer 3 of the anchor architecture.
 * The file carrying the folder's own name is the path manager of the page:
 * it imports the loose components beside it, mounts the page and re-exports
 * the public component surface. Only the theme anchor (Sol/Sol.tsx) consumes
 * this file.
 */

/** Style: DevThink Landing — the SaaS page of the entry flow (the owner
 * doctrine: on the web the site opens as the free exploration app, YouTube/
 * Apple/Cloudflare grade, and the "enter devthink" button opens the OS).
 * The hero rides saddle-grade smooth waves (one inline SVG), the strip below
 * answers "what the platform does" from the core modules catalog, the free
 * sections are fed exclusively by the catalog clients this page already
 * used, and the footer keeps the institutional routes. The window chrome on
 * the top edge (window.chrome.tsx) is presentational: minimize collapses the
 * landing into a restore chip, maximize toggles the full-bleed frame, close
 * returns to the intro (the explicit close clears the session flag so the
 * opening plays again — the only replay path beyond a cold load). */
import { useEffect, useState } from "react";
import { ArrowRight, Compass, RotateCcw, Sparkles } from "lucide-react";
import { useLocation } from "wouter";
import {
  familySites,
  nativeApps,
  recipeGallery,
  runnerBinaries,
  coreModuleTable,
  studioAssets,
  studioTracks,
  type FamilySite,
  type NativeApp,
  type Recipe,
  type RunnerBinary,
  type CoreModule,
  type StudioAsset,
  type StudioTrack,
} from "../../catalog";
import { INTRO_SEEN_KEY } from "../../intro.target";
import { SolLogoMark } from "../panel/logo";
import { ExploreSections } from "./explore.sections";
import { WindowEdgeChrome } from "./window.chrome";
import { HeroWaves } from "./waves";

export * from "./explore.sections";
export * from "./waves";
export * from "./window.chrome";

type LandingState = "open" | "minimized";
type FrameState = "windowed" | "maximized";

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

      <header className="dt-landing__bar">
        <a className="dt-landing__brand" href="/" aria-label="DevThink — start">
          <SolLogoMark size={22} accent />
          <strong>DevThink</strong>
        </a>
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
      </header>

      <main className="dt-landing__page">
        <section className="dt-landing__hero" aria-label="DevThink — the local os">
          <p className="dt-landing__eyebrow">
            <Sparkles size={13} aria-hidden="true" /> free to explore · the os comes after
          </p>
          <h1>
            the operating system of your work <em>with ai</em>
          </h1>
          <p className="dt-landing__sub">
            Explore the platform for free: studio creations, runnable recipes, music, video and the app family. When
            you want your creation panel, enter DevThink.
          </p>
          <div className="dt-landing__actions">
            <button type="button" className="dt-landing__cta dt-landing__cta--hero" onClick={enterOs}>
              enter devthink
              <ArrowRight size={16} aria-hidden="true" />
            </button>
            <a className="dt-landing__ghost" href="#creations">
              <Compass size={15} aria-hidden="true" /> explore free
            </a>
          </div>
          <HeroWaves />
        </section>

        <section className="dt-strip" id="does" aria-labelledby="dt-sec-does">
          <h2 id="dt-sec-does">what the platform does</h2>
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
