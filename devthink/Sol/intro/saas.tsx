/**
 * saas.tsx — the SaaS face of the intro (layer 3, page body). Two beats in
 * one face, both riding the approved doctrine: the opening splash (the
 * akash floor of every intro this wave — the mark springs in with overshoot,
 * the wordmark rises behind a mask, the status line answers in mono, the
 * curtain slides up on the way out) and the landing itself (the trylle
 * ruler over the theme mica: the display hero, the family constellation,
 * the native app grid, the studio rails and the modules strip — every row
 * read from the catalog accessors, never a hardcoded one). Every action
 * funnels to the login face: the panel is the last page of the chain. The
 * landing never writes to the visitor machine; the only thing the machine
 * does is load the interface.
 */

import {ArrowRightRegular as ArrowRight} from "@fluentui/react-icons";
import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import {
  type CoreModule,
  coreModuleTable,
  type NativeApp,
  nativeApps,
  type FamilySite,
  familySites,
  type StudioAsset,
  studioAssets,
  type StudioTrack,
  studioTracks } from "../../catalog";
import { SolLogoMark, SolWordmark } from "../panel/logo.tsx";
import { Studiomark } from "./saaskit.tsx";
import { SaasHero, SaasFamily, SaasApps } from "./saassections.tsx";
import { SaasRails, SaasFooter } from "./saasrails.tsx";

/** the doctrine micro curve of every quiet entrance */
const MICRO = "cubic-bezier(0.22, 1, 0.36, 1)";
/** the curtain curve of the splash exit (the akash floor) */
const CURTAIN = "cubic-bezier(0.76, 0, 0.24, 1)";
/** the spring overshoot of the mark (stiffness 300, damping 15) */
const SPRING = "cubic-bezier(0.34, 1.56, 0.64, 1)";
/** the soft layers under the hairline ring of the trylle cards (Linear DNA) */
const STRIP_SHADOW = "0 1px 2px rgb(0 0 0 / 26%), 0 3px 12px rgb(0 0 0 / 12%)";

/** the splash timings: the mark springs, the name rises, the status holds,
 * the curtain lifts — 3.3s end to end, skipped under reduced motion */
const SPLASH_MARK_MS = 700;
const SPLASH_HOLD_MS = 2500;
const SPLASH_EXIT_MS = 800;

/** the brand shine of the splash ring — the approved lockup gradient
 * (blue → orange → light blue → rose), animated over the 6s shine loop */
const SHINE = "linear-gradient(45deg, #2563eb 0%, #f97316 35%, #60a5fa 65%, #fb7185 100%)";

const SPLASH_CSS = `
@keyframes dtSplashShine { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
@keyframes dtSplashPulse { 0%, 100% { opacity: 0.45; } 50% { opacity: 1; } }
@keyframes dtSplashCurtain { from { transform: translateY(0); } to { transform: translateY(-100%); } }
@media (prefers-reduced-motion: reduce) {
  .dt-splash-ring, .dt-splash-pulse { animation: none !important; }
}
`;

let splashCssReady = false;

/** Injects the splash stylesheet exactly once per document, at import time. */
function ensuresplashcss(): void {
  if (splashCssReady || typeof document === "undefined") return;
  splashCssReady = true;
  const tag = document.createElement("style");
  tag.setAttribute("data-dt-saas-splash", "");
  tag.textContent = SPLASH_CSS;
  document.head.appendChild(tag);
}
ensuresplashcss();

/** The opening splash: the akash floor. The mark container (112px, radius
 * 40) springs from scale 0 with overshoot, the wordmark rises behind an
 * overflow mask in backOut, the mono status line answers below and the
 * whole curtain slides up on the exit beat. Only transform and opacity
 * ever animate; the glow is static, never animated. */
function Splash({ onexited }: { onexited: () => void }) {
  const [stage, setStage] = useState<"mark" | "hold" | "exit" | "gone">(() =>
    window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "gone" : "mark",
  );

  useEffect(() => {
    if (stage === "gone") {
      onexited();
      return undefined;
    }
    if (stage === "mark") {
      const timer = window.setTimeout(() => setStage("hold"), SPLASH_MARK_MS);
      return () => window.clearTimeout(timer);
    }
    if (stage === "hold") {
      const timer = window.setTimeout(() => setStage("exit"), SPLASH_HOLD_MS - SPLASH_MARK_MS);
      return () => window.clearTimeout(timer);
    }
    if (stage === "exit") {
      const timer = window.setTimeout(() => setStage("gone"), SPLASH_EXIT_MS);
      return () => window.clearTimeout(timer);
    }
    return undefined;
  }, [stage, onexited]);

  if (stage === "gone") return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#09090b]"
      style={
        stage === "exit"
          ? { animation: `dtSplashCurtain ${SPLASH_EXIT_MS}ms ${CURTAIN} forwards` }
          : undefined
      }
      aria-hidden="true"
    >
      {/* the mark container: 112px, radius 40, the approved hero geometry */}
      <div
        className="relative flex h-28 w-28 items-center justify-center rounded-[40px] border border-white/5"
        style={{
          backgroundColor: "#09090b",
          boxShadow: "0 0 60px rgb(0 0 0 / 80%)",
          animation:
            stage === "mark" ? `dtSplashMark ${SPLASH_MARK_MS}ms ${SPRING} both` : undefined,
          ...(stage === "mark" ? {} : { transform: "scale(1)" }),
        }}
      >
        <style>{`
@keyframes dtSplashMark { from { transform: scale(0) rotate(-45deg); opacity: 0; } to { transform: scale(1) rotate(0deg); opacity: 1; } }
@keyframes dtSplashName { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
@keyframes dtSplashStatus { from { opacity: 0; } to { opacity: 1; } }
`}</style>
        {/* the shine ring: the lockup gradient on the inset ring, the only
        place the brand gradient ever rides, looping the 6s shine */}
        <span
          className="dt-splash-ring pointer-events-none absolute -inset-[1px] rounded-[40px] opacity-20 blur-[2px]"
          style={{
            backgroundImage: SHINE,
            backgroundSize: "300% 300%",
            animation: "dtSplashShine 6s ease infinite",
          }}
        />
        <SolLogoMark size={64} />
      </div>

      {/* the wordmark rises behind the overflow mask in backOut */}
      <div className="mt-8 overflow-hidden">
        <div
          className="flex items-center gap-3"
          style={{
            animation:
              stage === "mark" ? undefined : `dtSplashName 600ms ${SPRING} both`,
          }}
        >
          <SolWordmark height={30} title="DevThink" />
          <span className="text-lg font-light text-zinc-600">OS</span>
        </div>
      </div>

      {/* the status line: mono uppercase, the honest boot answer — a quiet
      amber pulse keeps the rhythm, never decorative dots */}
      <p
        className="dt-splash-pulse mt-10 font-mono text-[11px] tracking-[0.18em] text-zinc-500 uppercase"
        style={{
          animation: `dtSplashStatus 400ms ease-out both, dtSplashPulse 1s ease-in-out infinite`,
        }}
      >
        the thinking os is starting
      </p>
    </div>
  );
}

/** the anchor rows of the landing head (the jump links of the face) */
const ANCHORS: ReadonlyArray<{ href: string; label: string }> = [
  { href: "#constellation", label: "family" },
  { href: "#apps", label: "apps" },
  { href: "#rails", label: "studios" },
  { href: "#modules", label: "modules" },
];

/** The SaaS page: the approved landing, one scroll, every action through
 * the login face. The anchor hands the onDone callback — the intro flag
 * rises on the way out, wherever the visitor leaves. */
export default function Saas({ onDone }: { onDone: () => void }) {
  const [, navigate] = useLocation();
  const [splash, setSplash] = useState(true);
  const [apps, setApps] = useState<NativeApp[]>([]);
  const [sites, setSites] = useState<FamilySite[]>([]);
  const [modules, setModules] = useState<CoreModule[]>([]);
  const [assets, setAssets] = useState<StudioAsset[]>([]);
  const [tracks, setTracks] = useState<StudioTrack[]>([]);
  const pageRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    void nativeApps().then(setApps);
    void familySites().then(setSites);
    void coreModuleTable().then(setModules);
    void studioAssets().then(setAssets);
    void studioTracks().then(setTracks);
  }, []);

  // the landing entrance: every data-akash-beat rises once in a 60ms
  // stagger (capped so the tail never crawls); reduced motion skips
  useEffect(() => {
    if (splash) return undefined;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;
    const stage = pageRef.current;
    if (!stage) return undefined;
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
  }, [splash]);

  const enter = useCallback(() => {
    onDone();
    navigate("/auth");
  }, [navigate, onDone]);

  return (
    <div className="min-h-dvh" style={{ background: "var(--mica)" }}>
      {splash && <Splash onexited={() => setSplash(false)} />}

      <main ref={pageRef} className="mx-auto w-full max-w-5xl px-6 pb-24">
        <header className="flex flex-wrap items-center justify-between gap-4 pt-6">
          <p className="flex items-center gap-2 font-mono text-[10px] tracking-[.08em] text-ink-3">
            <SolLogoMark size={16} /> <span>devthink · the thinking os</span>
          </p>
          <div className="flex flex-wrap items-center gap-5">
            <nav className="flex items-center gap-5 text-sm text-ink-2" aria-label="Sections">
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
              onClick={enter}
              className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-win px-5 text-sm font-semibold text-(--win-accent-ink) transition-[filter,transform] duration-150 ease-micro hover:brightness-95 active:translate-y-px focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-focus) motion-reduce:transition-none"
              style={{ boxShadow: STRIP_SHADOW }}
            >
              enter devthink
              <ArrowRight fontSize={15} aria-hidden="true" />
            </button>
          </div>
        </header>

        <SaasHero onenter={enter} />

        <SaasFamily sites={sites} />

        <SaasApps apps={apps} onenter={enter} />

        <SaasRails assets={assets} tracks={tracks} />

        <SaasModules modules={modules} />

        <SaasFooter onenter={enter} />
      </main>
    </div>
  );
}

/** The modules strip: the core catalog rows — the same rows the panel
 * serves after the visitor enters. Trylle cards, honest empty state. */
function SaasModules({ modules }: { modules: CoreModule[] }) {
  return (
    <section className="scroll-mt-24 pb-14" id="modules" aria-labelledby="dt-sec-modules">
      <header className="mb-8 max-w-[56ch]">
        <p className="font-mono text-[10px] tracking-[.08em] text-ink-3">the core catalog</p>
        <h2 id="dt-sec-modules" className="mt-2 font-display text-2xl font-semibold tracking-[-0.02em] text-ink">
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
  );
}
