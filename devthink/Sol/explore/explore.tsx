/**
 * explore page anchor — layer 3 of the anchor architecture.
 * The file carrying the folder's own name is the path manager of the page:
 * it imports the loose components beside it, mounts the page and re-exports
 * the public component surface. Only the theme anchor (Sol/Sol.tsx) consumes
 * this file.
 */

import {ArrowRightRegular as ArrowRight, ArrowCounterclockwiseRegular as RotateCcw} from "@fluentui/react-icons";
/** Style: DevThink landing SaaS — the trylle ruler over the Windows canvas,
 * rebuilt into the category experience: the person enters and EXPLORES —
 * the categories of video, image, audio, three dee, code, documents,
 * sandbox runs and community shares, browsable the way the captures browse.
 * The body rides the captured sidebar grammar (explore.sidebar.tsx — nouns
 * first, the section stacks, the per-row overflow menus) beside the stage:
 * ONE hero zone on the theme mica (display face, the campaign light, the
 * film grain) over the prompt-giga command field and the app constellation
 * (launchdeck.tsx), then the category rail, the section deck per category
 * with the real entries the catalog answers, the detail view per entry and
 * the share surface (sections.tsx), the core catalog strip and the
 * distribution rail. The anchor owns the data: the catalog accessors load
 * once into one bundle, the honest ladder renders the skeleton while the
 * catalog reads, the empty with the next action and the error with the
 * retry — zero fake rows, zero invented numbers, zero demo content.
 * Every card rides the trylle grammar: rounded-2xl, ring-1, the Linear
 * shadow with its ring. The window chrome on the top edge (windowchrome.tsx)
 * is presentational: minimize collapses the landing into a restore chip,
 * maximize toggles the full-bleed frame, close returns to the intro (the
 * explicit close clears the session flag so the opening plays again — the
 * only replay path beyond a cold load). Logo discipline: the ONE navbar
 * above (ShellChrome) owns the brand mark. Entrances: the hero beats rise
 * once in a 60ms stagger (Web Animations API, skipped under
 * prefers-reduced-motion); micro interactions are 150ms on the doctrine
 * micro curve. */
import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "wouter";
import {
  aboutBlocks,
  coreModuleTable,
  familySites,
  policySections,
  runnerBinaries,
  studioAssets,
  studioTracks,
  termsSections,
  type AboutBlock,
  type CoreModule,
  type FamilySite,
  type LegalSection,
  type RunnerBinary,
  type StudioAsset,
  type StudioTrack } from "../../catalog";
import { DESKTOP_APPS, isFamilyApp } from "../../appregistry.ts";
import { label } from "../../labels.ts";
import { peekonboardingstate } from "../../onboardingstate";
import { osText } from "../../oslabels.ts";
import { SolLogoMark } from "../wingets";
import { ShellChrome } from "../wingets";
import { DownloadRail } from "../wingets";
import { ExploreSidebar } from "../wingets";
import {
  CategoryDeck,
  CategorySectionDeck,
  exploreCategories,
  exploreRecents,
  type ExploreCategoryId,
  type ExploreData } from "../wingets";
import { LaunchDeck, OsSigil, TRYLLE_PRIMARY_STACK } from "../wingets";
import { HeroWaves } from "../wingets";
import { WindowEdgeChrome } from "../wingets";

export * from "../wingets";

type LandingState = "open" | "minimized";
type FrameState = "windowed" | "maximized";

/** the doctrine micro curve of every quiet entrance */
const MICRO = "cubic-bezier(0.22, 1, 0.36, 1)";
/** the soft layers under the hairline ring of the strip cards (Linear DNA) */
const STRIP_SHADOW = "0 1px 2px rgb(0 0 0 / 26%), 0 3px 12px rgb(0 0 0 / 12%)";
/** the mica floor of the doctrine: the theme token (--mica answers the dark
 * #202020 radial #1a1f35 and the light #f3f3f3 radial #eff4f9 of the spec)
 * so the hub rides the os surface of the live theme — never a hardcode */
const MICA_STYLE = {
  background: "var(--mica)" } as const;

/* ---- the hero atmosphere: the named light source and the film grain — layered over the mica floor, all
        presentational, pointer-transparent, riding the campaign recipes ---- */
const heroLightStyle = {
  position: "absolute",
  inset: 0,
  zIndex: 0,
  pointerEvents: "none",
  background:
    "radial-gradient(1200px 700px at 72% -12%, rgb(255 95 0 / 15%), transparent 62%), radial-gradient(900px 620px at 6% 110%, rgb(255 159 46 / 9%), transparent 58%)" } as const;
/** the film grain: feTurbulence fractal noise, 2 octaves, 140px tile,
 * soft-light — the doctrine veil, additive over the mica */
const heroGrainStyle = {
  position: "absolute",
  inset: 0,
  zIndex: 0,
  pointerEvents: "none",
  mixBlendMode: "soft-light",
  backgroundImage:
    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.86' numOctaves='2'/%3E%3C/filter%3E%3Crect width='140' height='140' filter='url(%23n)' opacity='.07'/%3E%3C/svg%3E\")" } as const;

/** the anchor rows of the page head (the jump links of the landing) — the
 * new zone reads the label store, the inherited rows stay on the os table */
const ANCHORS: ReadonlyArray<{ href: string; label: string }> = [
  { href: "#constellation", label: osText("explore.nav.constellation") },
  { href: "#categories", label: label("explore.nav.categories") },
  { href: "#deck", label: osText("explore.nav.sections") },
  { href: "#does", label: osText("explore.nav.modules") },
  { href: "#builds", label: osText("explore.nav.builds") },
];

/** The DevThink free exploration landing, served at /explore (the web intro
 * hands its zoom expansion over to this page) — the category gallery. */
export default function Explore() {
  const [, navigate] = useLocation();
  const [data, setData] = useState<ExploreData | null>(null);
  const [failed, setFailed] = useState(false);
  const [active, setActive] = useState<ExploreCategoryId | null>(null);
  const [activeEntryId, setActiveEntryId] = useState<string | null>(null);
  const [landing, setLanding] = useState<LandingState>("open");
  const [frame, setFrame] = useState<FrameState>("windowed");
  const pageRef = useRef<HTMLElement | null>(null);
  const deckRef = useRef<HTMLElement | null>(null);
  const categoriesRef = useRef<HTMLElement | null>(null);

  /** the catalog bundle: the paired database answers first over HTTPS, the
   * reviewed seeds answer offline — one load, one honest ladder. */
  function loadAll() {
    setFailed(false);
    setData(null);
    Promise.all([
      studioAssets(),
      studioTracks(),
      coreModuleTable(),
      familySites(),
      aboutBlocks(),
      termsSections(),
      policySections(),
      runnerBinaries(),
    ])
      .then(([assets, tracks, modules, sites, about, terms, policy, binaries]: [
        StudioAsset[],
        StudioTrack[],
        CoreModule[],
        FamilySite[],
        AboutBlock[],
        LegalSection[],
        LegalSection[],
        RunnerBinary[],
      ]) => {
        setData({ assets, tracks, modules, sites, about, terms, policy, binaries });
      })
      .catch(() => setFailed(true));
  }

  useEffect(() => {
    loadAll();
  }, []);

  const categories = useMemo(() => exploreCategories(data), [data]);
  const recents = useMemo(() => (data ? exploreRecents(data) : null), [data]);
  const family = useMemo(() => DESKTOP_APPS.filter(isFamilyApp), []);

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

  /** the honest walk of the scroll: the reduced motion preference rides
   * the instant jump, the silk curve rides the smooth one */
  function scrollTo(zone: HTMLElement | null) {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    zone?.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
  }

  /** picking a category: the deck opens under the rail and the walk lands
   * on it; the open detail closes with the switch */
  function pickCategory(id: ExploreCategoryId) {
    setActive(id);
    setActiveEntryId(null);
    scrollTo(deckRef.current);
  }

  /** back to the rail: the deck rests and the walk lands on the categories */
  function backToCategories() {
    setActive(null);
    setActiveEntryId(null);
    scrollTo(categoriesRef.current);
  }

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
        className="dtv-x__chip fixed bottom-5 left-1/2 z-[80] flex min-h-11 -translate-x-1/2 items-center gap-2 rounded-lg bg-s1 px-4 text-sm font-medium text-ink ring-1 ring-hairline-strong transition-[background-color,transform] duration-150 ease-micro hover:bg-s2 active:scale-[.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-focus) motion-reduce:transition-none"
        style={{ boxShadow: STRIP_SHADOW }}
      >
        <SolLogoMark size={16} />
        <span>{osText("explore.window.title")}</span>
        <RotateCcw fontSize={13} aria-hidden="true" />
      </button>
    );
  }

  return (
    <div className="dtv-x min-h-dvh" style={MICA_STYLE}>
      <div className={frame === "maximized" ? "" : "p-3"}>
        <div
          className={`min-h-dvh ${frame === "maximized" ? "" : "mx-auto max-w-[1400px] overflow-clip rounded-lg ring-1 ring-hairline-strong"}`}
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

          {/* the body: the captured sidebar grammar docks left, the stage
          explores right — one column on the phone, two on the ladder */}
          <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-6 px-4 pb-16 pt-4 sm:px-6 lg:flex-row lg:items-start lg:gap-8">
            <ExploreSidebar
              categories={categories}
              recents={recents}
              family={family}
              sites={data?.sites ?? null}
              failed={failed}
              active={active}
              onPick={pickCategory}
              onRetry={loadAll}
            />

            <main ref={pageRef} className="min-w-0 flex-1">
              <header className="flex flex-wrap items-center justify-between gap-4 pt-2">
                <p className="font-mono text-[10px] tracking-[.08em] text-ink-3">{osText("explore.eyebrow")}</p>
                <div className="flex flex-wrap items-center gap-5">
                  <nav className="flex items-center gap-5 text-sm text-ink-2" aria-label={osText("explore.nav.aria")}>
                    {ANCHORS.map((anchor) => (
                      <a
                        key={anchor.href}
                        href={anchor.href}
                        className="rounded-xs transition-colors duration-150 ease-micro hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-focus) motion-reduce:transition-none"
                      >
                        {anchor.label}
                      </a>
                    ))}
                  </nav>
                  <button
                    type="button"
                    onClick={enterOs}
                    className="dtv-x__enter inline-flex min-h-11 items-center gap-2 rounded-lg bg-win px-5 text-sm font-semibold text-(--win-accent-ink) transition-[filter,transform] duration-150 ease-micro hover:brightness-95 active:translate-y-px focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-focus) motion-reduce:transition-none"
                    style={{ boxShadow: TRYLLE_PRIMARY_STACK }}
                  >
                    {osText("explore.enter")}
                    <ArrowRight fontSize={15} aria-hidden="true" />
                  </button>
                </div>
              </header>

              <section
                className="relative pb-6 pt-[clamp(40px,7vh,96px)]"
                aria-label={osText("explore.hero.aria")}
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
                    <OsSigil size={18} /> <span>{osText("explore.hero.eyebrow")}</span>
                  </p>
                  {/* the trylle hero: display face, weight 600, tracking -0.02em,
                  the clamp of the ruler — never italic */}
                  <h1
                    data-akash-beat
                    className="mt-4 font-display text-[clamp(2.25rem,5vw,3.75rem)] font-semibold leading-[1.1] tracking-[-0.02em] text-ink"
                    style={{ textWrap: "balance", fontFamily: "var(--font-display)" }}
                  >
                    {osText("explore.hero.title")}
                  </h1>
                  <p data-akash-beat className="mt-4 max-w-[560px] text-sm leading-[1.55] text-ink-2">
                    {osText("explore.hero.sub")}
                  </p>
                </div>

                <div data-akash-beat className="relative z-[1] mt-10">
                  <LaunchDeck />
                </div>
              </section>

              <HeroWaves
                caption={label("explore.categories.waves")}
                meta={label("explore.categories.wavesMeta")}
              />

              <CategoryDeck
                categories={categories}
                active={active}
                loading={data === null}
                onPick={pickCategory}
                zoneRef={categoriesRef}
              />

              <HeroWaves
                caption={label("explore.deck.waves")}
                meta={label("explore.deck.wavesMeta")}
              />

              <CategorySectionDeck
                categories={categories}
                active={active}
                data={data}
                failed={failed}
                activeEntryId={activeEntryId}
                onPickCategory={pickCategory}
                onOpenEntry={setActiveEntryId}
                onCloseEntry={() => setActiveEntryId(null)}
                onBack={backToCategories}
                onRetry={loadAll}
                zoneRef={deckRef}
              />

              <HeroWaves
                caption={label("explore.modules.waves")}
                meta={osText("explore.waves.modulesMeta")}
              />

              {/* the catalog strip: the core modules as a horizontal strip of
              trylle cards — the same rows the panel serves after you enter */}
              <section className="scroll-mt-24 pb-14" id="does" aria-labelledby="dt-sec-does">
                <header className="mb-8 max-w-[56ch]">
                  <p className="font-mono text-[10px] tracking-[.08em] text-ink-3">{osText("explore.modules.cap")}</p>
                  <h2 id="dt-sec-does" className="mt-2 font-display text-2xl font-semibold tracking-[-0.02em] text-ink">
                    {osText("explore.modules.title")}
                  </h2>
                  <p className="mt-2 text-sm leading-[1.55] text-ink-2">{osText("explore.modules.sub")}</p>
                </header>
                {data === null ? (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-hidden="true">
                    {[0, 1, 2, 3].map((card) => (
                      <div key={card} className="anim-skeleton h-[120px] rounded-2xl bg-s1" />
                    ))}
                  </div>
                ) : (
                  <ul className="dtv-x__strip flex snap-x snap-mandatory gap-4 overflow-x-auto pb-3">
                    {data.modules.map((module, index) => (
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
                    {data.modules.length === 0 && (
                      <li className="py-6 font-mono text-xs text-ink-3">{osText("explore.modules.empty")}</li>
                    )}
                  </ul>
                )}
              </section>

              <HeroWaves
                caption={label("explore.download.waves")}
                meta={osText("explore.waves.buildsMeta")}
              />

              {/* the distribution rail: the release channels of the immutable
              tag — the extension, the vsix and the provenance set, walkable
              from the landing */}
              <DownloadRail />
            </main>
          </div>

          <footer className="dtv-x__foot border-t border-hairline px-6 py-10">
            <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4">
              <span className="flex items-center gap-2 text-sm font-medium text-ink" aria-hidden="true">
                <SolLogoMark size={18} accent />
                {osText("explore.footer.wordmark")}
              </span>
              <nav aria-label={osText("explore.footer.nav.aria")} className="flex items-center gap-5 text-sm text-ink-2">
                <a
                  href="/about"
                  className="rounded-xs transition-colors duration-150 ease-micro hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-focus) motion-reduce:transition-none"
                >
                  {osText("explore.footer.about")}
                </a>
                <a
                  href="/terms"
                  className="rounded-xs transition-colors duration-150 ease-micro hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-focus) motion-reduce:transition-none"
                >
                  {osText("explore.footer.terms")}
                </a>
                <a
                  href="/policy"
                  className="rounded-xs transition-colors duration-150 ease-micro hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-focus) motion-reduce:transition-none"
                >
                  {osText("explore.footer.policy")}
                </a>
              </nav>
              <small className="text-xs leading-[1.55] text-ink-3">{osText("explore.footer.note")}</small>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
