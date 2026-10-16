/**
 * explore page anchor — layer 3 of the anchor architecture.
 * The file carrying the folder's own name is the path manager of the page:
 * it imports the loose components beside it, mounts the page and re-exports
 * the public component surface. Only the theme anchor (Sol/Sol.tsx) consumes
 * this file.
 */

import { ArrowRight, RotateCcw } from "lucide-react";
/** Style: DevThink landing SaaS — the trylle ruler over the Windows canvas.
 * ONE hero zone on the graphite mica: the trylle hero (display face, H1 at
 * clamp(2.25rem, 5vw, 3.75rem), weight 600, tracking -0.02em, never italic)
 * over the campaign atmosphere (one warm radial light, the film grain
 * dissolves, one film-grain veil), then the prompt-giga command field and
 * the app constellation (launchdeck.tsx), the curated grade of trylle cards
 * (exploresections.tsx), the catalog strip and the editorial ledger. Every
 * card rides the trylle grammar: rounded-2xl, ring-1, the Linear shadow
 * with its ring, p-8. The "enter devthink" CTA carries the exact trylle
 * primary tone stack. The window chrome on the top edge (windowchrome.tsx)
 * is presentational: minimize collapses the landing into a restore chip,
 * maximize toggles the full-bleed frame, close returns to the intro (the
 * explicit close clears the session flag so the opening plays again — the
 * only replay path beyond a cold load). Logo discipline: the ONE navbar
 * above (ShellChrome) owns the brand mark — the hub rides the mono wordmark
 * and the drawing sigil beside the eyebrow, never a second logo. Entrances:
 * the hero beats rise once in a 60ms stagger (Web Animations API, skipped
 * under prefers-reduced-motion); micro interactions are 150ms on the
 * doctrine micro curve. */
import { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import {
  type CoreModule,
  coreModuleTable,
  type StudioAsset,
  type StudioTrack,
  studioAssets,
  studioTracks,
} from "../../catalog";
import { peekonboardingstate } from "../../onboardingstate";
import { SolLogoMark } from "../panel/logo.tsx";
import { ShellChrome } from "../shell/ShellChrome.tsx";
import { ExploreSections } from "./exploresections.tsx";
import { DownloadRail } from "./downloadrail.tsx";
import { LaunchDeck, OsSigil, TRYLLE_PRIMARY_STACK } from "./launchdeck.tsx";
import { HeroWaves } from "./waves.tsx";
import { WindowEdgeChrome } from "./windowchrome.tsx";

export * from "./exploresections.tsx";
export * from "./downloadrail.tsx";
export * from "./launchdeck.tsx";
export * from "./waves.tsx";
export * from "./windowchrome.tsx";

type LandingState = "open" | "minimized";
type FrameState = "windowed" | "maximized";

/** the doctrine micro curve of every quiet entrance */
const MICRO = "cubic-bezier(0.22, 1, 0.36, 1)";
/** the soft layers under the hairline ring of the strip cards (Linear DNA) */
const STRIP_SHADOW = "0 1px 2px rgb(0 0 0 / 26%), 0 3px 12px rgb(0 0 0 / 12%)";
/** the dark mica floor of the doctrine: #202020 with the fixed indigo core */
const MICA_STYLE = {
  backgroundColor: "#202020",
  backgroundImage: "radial-gradient(#1a1f35 25%, #202020 100%)",
  backgroundAttachment: "fixed",
} as const;

/* ---- the hero atmosphere: the named light source and the film grain — layered over the graphite mica, all
        presentational, pointer-transparent, riding the campaign recipes ---- */
const heroLightStyle = {
  position: "absolute",
  inset: 0,
  zIndex: 0,
  pointerEvents: "none",
  background:
    "radial-gradient(1200px 700px at 72% -12%, rgb(255 95 0 / 15%), transparent 62%), radial-gradient(900px 620px at 6% 110%, rgb(255 159 46 / 9%), transparent 58%)",
} as const;
/** the film grain: feTurbulence fractal noise, 2 octaves, 140px tile,
 * soft-light — the doctrine veil, additive over the mica */
const heroGrainStyle = {
  position: "absolute",
  inset: 0,
  zIndex: 0,
  pointerEvents: "none",
  mixBlendMode: "soft-light",
  backgroundImage:
    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.86' numOctaves='2'/%3E%3C/filter%3E%3Crect width='140' height='140' filter='url(%23n)' opacity='.07'/%3E%3C/svg%3E\")",
} as const;

/** the anchor rows of the page head (the jump links of the landing) */
const ANCHORS: ReadonlyArray<{ href: string; label: string }> = [
  { href: "#constellation", label: "constellation" },
  { href: "#family", label: "family" },
  { href: "#rails", label: "sections" },
  { href: "#does", label: "modules" },
  { href: "#builds", label: "builds" },
];

/** The DevThink free exploration landing, served at /explore (the web intro
 * hands its zoom expansion over to this page) — the landing SaaS. */
export default function Explore() {
  const [, navigate] = useLocation();
  const [modules, setModules] = useState<CoreModule[]>([]);
  const [assets, setAssets] = useState<StudioAsset[]>([]);
  const [tracks, setTracks] = useState<StudioTrack[]>([]);
  const [landing, setLanding] = useState<LandingState>("open");
  const [frame, setFrame] = useState<FrameState>("windowed");
  const pageRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    void coreModuleTable().then(setModules);
    void studioAssets().then(setAssets);
    void studioTracks().then(setTracks);
  }, []);

  // the hero entrance: every data-akash-beat of the page rises once in a
  // 60ms stagger (capped so the tail never crawls); reduced motion skips
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const stage = pageRef.current;
    if (!stage) return;
    const beats = Array.from(stage.querySelectorAll<HTMLElement>("[data-akash-beat]")).map((el, index) =>
      el.animate(
        [
          { opacity: 0, transform: "translateY(14px)" },
          { opacity: 1, transform: "translateY(0)" },
        ],
        { duration: 600, delay: Math.min(index, 7) * 60, easing: MICRO, fill: "backwards" },
      ),
    );
    return () => {
      for (const beat of beats) beat.cancel();
    };
  }, []);

  /** the explicit close: walks back into the entry flow — the flow head of a
   * fresh visitor is the intro, and a visitor that already saw the
   * onboarding never sees the opening again, so the close keeps the landing
   * open for them (the doctrine: seen is never replayed). */
  function closeLanding() {
    if (!peekonboardingstate().onboardingseen) navigate("/");
  }

  function enterOs() {
    navigate("/auth");
  }

  if (landing === "minimized") {
    return (
      <button
        type="button"
        onClick={() => setLanding("open")}
        className="fixed bottom-5 left-1/2 z-[80] flex min-h-11 -translate-x-1/2 items-center gap-2 rounded-lg bg-s1 px-4 text-sm font-medium text-ink ring-1 ring-hairline-strong transition-[background-color] duration-150 ease-micro hover:bg-s2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-focus) motion-reduce:transition-none"
        style={{ boxShadow: STRIP_SHADOW }}
      >
        <SolLogoMark size={16} />
        <span>explore — devthink</span>
        <RotateCcw size={13} aria-hidden="true" />
      </button>
    );
  }

  return (
    <div className="min-h-dvh" style={MICA_STYLE}>
      <div className={frame === "maximized" ? "" : "p-3"}>
        <div
          className={`min-h-dvh ${frame === "maximized" ? "" : "mx-auto max-w-[1400px] overflow-hidden rounded-lg ring-1 ring-hairline-strong"}`}
          style={frame === "maximized" ? undefined : { boxShadow: "var(--shadow-window)" }}
        >
          <WindowEdgeChrome
            maximized={frame === "maximized"}
            onMinimize={() => setLanding("minimized")}
            onMaximize={() => setFrame(frame === "maximized" ? "windowed" : "maximized")}
            onClose={closeLanding}
          />

          {/* the ONE chrome of the theme as the landing's header row: brand mark,
          pins, omnibox and tray — no second navbar rides the frame */}
          <ShellChrome />

          <main
            ref={pageRef}
            className={`mx-auto w-full px-6 pb-24 ${frame === "maximized" ? "max-w-none" : "max-w-5xl"}`}
          >
            <header className="flex flex-wrap items-center justify-between gap-4 pt-6">
              <p className="font-mono text-[10px] tracking-[.08em] text-ink-3">devthink · explore</p>
              <div className="flex flex-wrap items-center gap-5">
                <nav className="flex items-center gap-5 text-sm text-ink-2" aria-label="Site navigation">
                  {ANCHORS.map((anchor) => (
                    <a
                      key={anchor.href}
                      href={anchor.href}
                      className="transition-colors duration-150 ease-micro hover:text-ink motion-reduce:transition-none"
                    >
                      {anchor.label}
                    </a>
                  ))}
                </nav>
                <button
                  type="button"
                  onClick={enterOs}
                  className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-win px-5 text-sm font-semibold text-win-ink transition-[filter,transform] duration-150 ease-micro hover:brightness-95 active:translate-y-px focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-focus) motion-reduce:transition-none"
                  style={{ boxShadow: TRYLLE_PRIMARY_STACK }}
                >
                  enter devthink
                  <ArrowRight size={15} aria-hidden="true" />
                </button>
              </div>
            </header>

            <section
              className="relative pb-6 pt-[clamp(56px,9vh,118px)]"
              aria-label="DevThink — the launcher of the os"
            >
              {/* the atmosphere: one warm light source
              dissolves and the film grain — layered, pointer-transparent */}
              <div style={heroLightStyle} aria-hidden="true" />
              <div style={heroGrainStyle} aria-hidden="true" />

              <div className="relative z-[1] max-w-[780px]">
                <p
                  data-akash-beat
                  className="flex items-center gap-2 font-mono text-[10px] tracking-[.08em] text-ink-3"
                >
                  <OsSigil size={18} /> <span>devthink · explore — the launcher</span>
                </p>
                {/* the trylle hero: display face, weight 600, tracking -0.02em,
                the clamp of the ruler — never italic */}
                <h1
                  data-akash-beat
                  className="mt-4 font-display text-[clamp(2.25rem,5vw,3.75rem)] font-semibold leading-[1.1] tracking-[-0.02em] text-ink"
                  style={{ textWrap: "balance", fontFamily: "var(--font-display)" }}
                >
                  every surface of the os, one command away
                </h1>
                <p data-akash-beat className="mt-4 max-w-[560px] text-sm leading-[1.55] text-ink-2">
                  the stage reads the whole registry: type, filter, open. the native surfaces and the nine family apps
                  share one field.
                </p>
              </div>

              <div data-akash-beat className="relative z-[1] mt-10">
                <LaunchDeck />
              </div>
            </section>

            <HeroWaves caption="02 · the sections" meta="recent · pinned · all apps" />

            <ExploreSections assets={assets} tracks={tracks} />

            <HeroWaves caption="03 · the modules" meta="the core catalog" />

            {/* the catalog strip: the core modules as a horizontal strip of
            trylle cards — the same rows the panel serves after you enter */}
            <section className="scroll-mt-24 pb-14" id="does" aria-labelledby="dt-sec-does">
              <header className="mb-8 max-w-[56ch]">
                <p className="font-mono text-[10px] tracking-[.08em] text-ink-3">the catalog strip</p>
                <h2 id="dt-sec-does" className="mt-2 font-display text-2xl font-semibold tracking-[-0.02em] text-ink">
                  what the platform does
                </h2>
                <p className="mt-2 text-sm leading-[1.55] text-ink-2">
                  the modules of the core catalog — the same rows the panel serves after you enter.
                </p>
              </header>
              <ul className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-3">
                {modules.map((module, index) => (
                  <li
                    key={module.name}
                    className="flex w-[248px] flex-none snap-start flex-col rounded-2xl bg-s0 p-5 ring-1 ring-hairline-strong"
                    style={{ boxShadow: STRIP_SHADOW }}
                  >
                    <span className="font-mono text-[10px] text-ink-3" style={{ fontVariantNumeric: "tabular-nums" }}>
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <strong className="mt-3 block font-display text-sm font-semibold tracking-[-0.01em] text-ink">
                      {module.name}
                    </strong>
                    <span className="mt-1 block text-xs leading-[1.55] text-ink-2">{module.role}</span>
                  </li>
                ))}
                {modules.length === 0 && (
                  <li className="py-6 font-mono text-xs text-ink-3">the catalog has not answered yet.</li>
                )}
              </ul>
            </section>

            <HeroWaves caption="04 · the builds" meta="chromium · firefox · vs code · safari" />

            {/* the distribution rail: the release channels of the immutable
            tag — the extension, the vsix and the provenance set, walkable
            from the landing */}
            <DownloadRail />
          </main>

          <footer className="border-t border-hairline px-6 py-10">
            <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4">
              <span className="flex items-center gap-2 text-sm font-medium text-ink" aria-hidden="true">
                <SolLogoMark size={18} accent />
                DevThink
              </span>
              <nav aria-label="Institutional" className="flex items-center gap-5 text-sm text-ink-2">
                <a
                  href="/about"
                  className="transition-colors duration-150 ease-micro hover:text-ink motion-reduce:transition-none"
                >
                  about
                </a>
                <a
                  href="/terms"
                  className="transition-colors duration-150 ease-micro hover:text-ink motion-reduce:transition-none"
                >
                  terms
                </a>
                <a
                  href="/policy"
                  className="transition-colors duration-150 ease-micro hover:text-ink motion-reduce:transition-none"
                >
                  privacy
                </a>
              </nav>
              <small className="text-xs leading-[1.55] text-ink-3">
                exploration is free and reads the public catalog · the local identity of the os is yours: no remote
                authentication, no telemetry
              </small>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
