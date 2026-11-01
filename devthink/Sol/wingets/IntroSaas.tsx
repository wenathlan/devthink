/**
 * saas.tsx — the SaaS face of the intro (layer 3, page body): the
 * redesigned landing the owner ordered — the pale canvas (#DCE2EE) with
 * the palco (#F2F5FC) at radius 30, the saddle rail at the left edge with
 * its snug fitted curve and its six stops, the ever rose hero with the
 * inline engine switch, and the minimal sections that present the real
 * studios of the monorepo (the mock decks — the film rail, the track
 * rail, the reel wall, the demo chat and the invented social proof —
 * retired). The six rail stops walk the body beside the header chrome (the
 * logo, the tabs, the sign-in and the launch keys) and the footer rows;
 * every launch path funnels to the login face: the panel is the last page
 * of the chain. The glyphs ride the fluent set, the type rides the Inter
 * Variable voice of the os and the materials ride the ever family with
 * the neutral fluent shadows (never a blue glow). The stylesheet injects
 * once at import time, scoped to the saas-* root and the reference class
 * names.
 */

import {
  ArrowUpRightRegular as Arrowupright,
  GridRegular as Grid,
  DoorArrowRightRegular as Signin,
  SparkleRegular as Sparkle,
} from "@fluentui/react-icons";
import { useCallback, useState } from "react";
import { useLocation } from "wouter";
import { saaschrome, saasheadertabs, saasrailstops, saasspotlights } from "../../saascontent.ts";
import { SaddleTabBridge, VerticalSaddleBridge } from "./IntroSaaskit.tsx";
import { SaasFooter, SaasStudioSpotlight } from "./IntroSaasrails.tsx";
import { type glyphkind, SaasHero, SaasStudios, STUDIOGLYPH } from "./IntroSaassections.tsx";
import { SolLogoMark, SolWordmark } from "./PanelLogo.tsx";

const SAAS_CSS = `
.saas-root { font-family: var(--font-display, "Inter Variable", ui-sans-serif, sans-serif); letter-spacing: -0.015em; background: #DCE2EE; }
.saas-root ::selection { background: var(--color-ever-deep, #c92b86); color: #FFFFFF; }
.saas-root button:focus-visible, .saas-root input:focus-visible { outline: 2px solid rgba(15,23,42,0.55); outline-offset: 2px; }
.saas-root button, .saas-root input { outline: none; }
.saas-root img { -webkit-user-drag: none; user-select: none; }

.btn-tactile-3d { background: linear-gradient(180deg, #243047 0%, #090D16 100%); box-shadow: 0 14px 28px -8px rgba(9,13,22,0.55), 0 4px 10px -2px rgba(9,13,22,0.35), inset 0 1.5px 2px rgba(255,255,255,0.42), inset 0 -3px 6px rgba(0,0,0,0.65); border: 1px solid rgba(255,255,255,0.16); transition: transform 0.25s cubic-bezier(0.16,1,0.3,1), box-shadow 0.25s ease; }
.btn-tactile-3d:hover { transform: translateY(-2px) scale(1.02); box-shadow: 0 20px 34px -8px rgba(9,13,22,0.55), inset 0 2px 3px rgba(255,255,255,0.55), inset 0 -3px 6px rgba(0,0,0,0.75); }
.btn-tactile-3d:active { transform: translateY(0) scale(0.96); transition-duration: 0.08s; box-shadow: 0 8px 18px -8px rgba(9,13,22,0.55), inset 0 1.5px 2px rgba(255,255,255,0.32), inset 0 -2px 5px rgba(0,0,0,0.55); }
.icon-frame-3d { background: rgba(255,255,255,0.92); border: 1px solid rgba(203,213,225,0.85); box-shadow: 0 8px 18px -6px rgba(15,23,42,0.10), inset 0 1px 2px rgba(255,255,255,1); transition: transform 0.22s ease, border-color 0.22s ease, box-shadow 0.22s ease; }
.icon-frame-3d:hover { transform: translateY(-1.5px); border-color: rgba(15,23,42,0.35); box-shadow: 0 12px 22px -6px rgba(15,23,42,0.16), inset 0 1px 2px rgba(255,255,255,1); }
.icon-frame-3d:active { transform: translateY(0) scale(0.94); transition-duration: 0.08s; }
.icon-frame-3d-active { background: #FFFFFF; border: 1px solid rgba(15,23,42,0.40); box-shadow: 0 10px 22px -6px rgba(15,23,42,0.18), inset 0 1px 2px rgba(255,255,255,1); }
.surface-card { background: #FFFFFF; border: 1px solid rgba(226,232,240,0.95); box-shadow: 0 16px 36px -14px rgba(15,23,42,0.10); }
.hero-inline-switch { background: linear-gradient(125deg, var(--color-ever, #f0509e) 0%, var(--color-ever-deep, #c92b86) 100%); box-shadow: 0 12px 26px -6px rgba(201,43,134,0.45), inset 0 2px 4px rgba(255,255,255,0.55); }
.hero-switch-thumb { background: radial-gradient(circle at 30% 30%, #FFFFFF 0%, #F1F5F9 70%, #CBD5E1 100%); box-shadow: -3px 4px 10px rgba(15,23,42,0.35), inset 0 2px 3px rgba(255,255,255,1); }
@keyframes shaderPulse { 0%,100% { transform: scale(1) translate(0,0); } 50% { transform: scale(1.05) translate(10px,-8px); } }
.hero-gaussian-shader { background: radial-gradient(circle at 14% 70%, rgba(255,210,232,0.90) 0%, transparent 48%), radial-gradient(circle at 36% 80%, rgba(240,80,158,0.55) 0%, transparent 50%), radial-gradient(circle at 58% 65%, rgba(201,43,134,0.50) 0%, transparent 48%), radial-gradient(circle at 78% 75%, rgba(240,80,158,0.45) 0%, transparent 48%), radial-gradient(circle at 92% 65%, rgba(255,210,232,0.85) 0%, transparent 45%); filter: blur(56px) saturate(150%); animation: shaderPulse 9s ease-in-out infinite; }
.text-gradient-brand { background: linear-gradient(92deg, var(--color-ever, #f0509e) 0%, var(--color-ever-deep, #c92b86) 100%); -webkit-background-clip: text; background-clip: text; color: transparent; }
@media (prefers-reduced-motion: reduce) {
  .hero-gaussian-shader { animation: none; }
  .btn-tactile-3d, .icon-frame-3d, .hero-switch-thumb { transition: none; }
}
`;

let saasCssReady = false;

/** Injects the SaaS stylesheet exactly once per document, at import time. */
function ensureSaasCss(): void {
  if (saasCssReady || typeof document === "undefined") return;
  saasCssReady = true;
  const tag = document.createElement("style");
  tag.setAttribute("data-dt-saas", "");
  tag.textContent = SAAS_CSS;
  document.head.appendChild(tag);
}
ensureSaasCss();

/** The glyph each header tab of the saddle bridge wears — the OS spark, the
 * studio grid and the fluent glyph of the studio section the tab walks to. */
const TABGLYPH: Record<string, glyphkind> = {
  "hero-os": Sparkle,
  "workspace-subapps": Grid,
  "creators-doo": STUDIOGLYPH.doo,
  "spatial-bento": STUDIOGLYPH.cadria,
  "sonic-deck": STUDIOGLYPH.debonair,
};

/** The glyph each left rail stop wears. */
const RAILGLYPH: Record<string, glyphkind> = {
  "hero-os": Sparkle,
  "workspace-subapps": Grid,
  "creators-doo": STUDIOGLYPH.doo,
  "spatial-bento": STUDIOGLYPH.cadria,
  "sonic-deck": STUDIOGLYPH.debonair,
  "advisor-dark": STUDIOGLYPH.getry,
};

/** The SaaS page: the redesigned landing, one scroll, every launch path
 * through the login face. The anchor hands the onDone callback — the
 * intro flag rises on the way out, wherever the visitor leaves — and the
 * footer Explorer row walks the entry chain through the free exploration
 * face (/explore) on the way. */
export default function Saas({ onDone }: { onDone: () => void }) {
  const [, navigate] = useLocation();
  const [active, setActive] = useState<string>("hero-os");
  const enter = useCallback(() => {
    onDone();
    navigate("/auth");
  }, [navigate, onDone]);
  const explore = useCallback(() => {
    onDone();
    navigate("/explore");
  }, [navigate, onDone]);
  const scrollto = useCallback((id: string) => {
    setActive(id);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  }, []);
  return (
    <div className="saas-root min-h-screen w-full overflow-x-hidden p-[2.5px] text-slate-900 select-none sm:select-auto">
      {/* the left rail: the vertical saddle slab at the screen edge — the
          hairline divider and the six mandate stops with the ever active
          pill (the saddle cloud key retired with the owner order: the six
          stops are the only keys of the landing body) */}
      <aside className="fixed top-1/2 left-0 z-50 hidden -translate-y-1/2 flex-col items-center lg:flex">
        <VerticalSaddleBridge fillColor="#0A0B0E" className="py-2">
          <div className="flex flex-col items-center gap-3 px-1">
            <div className="my-0.5 h-[1px] w-5 bg-white/15" aria-hidden="true" />
            {saasrailstops.map((item) => {
              const Glyph = RAILGLYPH[item.id];
              const current = active === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => scrollto(item.id)}
                  aria-label={item.label}
                  aria-pressed={current}
                  className={`group relative flex h-10 w-10 items-center justify-center rounded-full transition-[transform,background-color,color] duration-300 ${current ? "scale-105 bg-gradient-to-tr from-ever to-ever-deep text-white" : "bg-white/10 text-slate-300 hover:bg-white/20 hover:text-white"}`}
                >
                  <Glyph className="h-4 w-4" aria-hidden="true" />
                  <span className="pointer-events-none absolute left-14 rounded-lg border border-white/10 bg-slate-950 px-2.5 py-1 text-[11px] font-semibold tracking-[-0.018em] whitespace-nowrap text-white opacity-0 transition group-hover:opacity-100">
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </VerticalSaddleBridge>
      </aside>

      <main className="relative z-10 min-h-[calc(100vh-5px)] w-full overflow-hidden rounded-[30px] border border-white bg-[#F2F5FC] shadow-[0_25px_80px_-15px_rgba(15,23,42,0.25)] sm:rounded-[34px]">
        <section id="saas-header" className="relative bg-[#F2F5FC]">
          <header className="relative z-40">
            <div className="h-1.5 w-full bg-white" aria-hidden="true" />
            <div className="-mt-[1px] flex w-full items-start justify-center gap-2 px-4 sm:gap-4 sm:px-8">
              <div className="ml-1 flex shrink-0 items-center sm:ml-3">
                <button
                  type="button"
                  onClick={() => scrollto("hero-os")}
                  className="group inline-flex items-center gap-1 text-slate-950 transition hover:scale-[1.015] active:scale-[0.99]"
                >
                  <SolLogoMark size={28} className="h-7 w-7 sm:h-9 sm:w-9" title={saaschrome.title} />
                  <SolWordmark height={16} className="h-4 sm:h-5" />
                </button>
              </div>
              <div className="flex shrink-0 flex-col items-center drop-shadow-[0_10px_20px_rgba(15,23,42,0.06)]">
                <SaddleTabBridge fillColor="#FFFFFF" className="h-[52px]">
                  <nav className="flex items-center gap-2" aria-label="Sections">
                    {saasheadertabs.map((tab) => {
                      const Glyph = TABGLYPH[tab.id];
                      const current = active === tab.id;
                      return (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => scrollto(tab.id)}
                          className={`group flex items-center rounded-xl px-3 py-2 transition-[transform,box-shadow,border-color] ${current ? "icon-frame-3d-active text-slate-950" : "icon-frame-3d text-slate-800"}`}
                          aria-label={tab.label}
                        >
                          <Glyph
                            className={`h-4 w-4 ${current ? "text-ever-deep" : "text-slate-600"}`}
                            aria-hidden="true"
                          />
                          <span className="max-w-0 overflow-hidden text-xs font-semibold tracking-[-0.018em] whitespace-nowrap opacity-0 transition-[margin,max-width,opacity] group-hover:ml-2 group-hover:max-w-[90px] group-hover:opacity-100">
                            {tab.label}
                          </span>
                        </button>
                      );
                    })}
                  </nav>
                </SaddleTabBridge>
              </div>
              <div className="flex shrink-0 items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={enter}
                  className="icon-frame-3d group hidden items-center rounded-full p-2.5 text-slate-800 sm:flex"
                  aria-label={saaschrome.signin}
                >
                  <Signin className="h-4 w-4" aria-hidden="true" />
                  <span className="max-w-0 overflow-hidden text-xs font-semibold tracking-[-0.018em] whitespace-nowrap opacity-0 transition-[margin,max-width,opacity] group-hover:ml-2 group-hover:max-w-[70px] group-hover:opacity-100">
                    {saaschrome.signin}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={enter}
                  className="btn-tactile-3d group flex items-center rounded-full p-2.5 text-white"
                  aria-label={saaschrome.launch}
                >
                  <Arrowupright className="h-4 w-4 text-ever-soft" aria-hidden="true" />
                  <span className="max-w-0 overflow-hidden text-xs font-extrabold tracking-[-0.035em] whitespace-nowrap opacity-0 transition-[margin,max-width,opacity] group-hover:mr-1 group-hover:ml-2 group-hover:max-w-[80px] group-hover:opacity-100">
                    {saaschrome.launch}
                  </span>
                </button>
              </div>
            </div>
          </header>
        </section>

        <SaasHero onenter={enter} />
        <SaasStudios />
        {saasspotlights.map((stop, index) => (
          <SaasStudioSpotlight key={stop.id} stop={stop} flip={index % 2 === 1} />
        ))}
        <SaasFooter onenter={enter} onexplore={explore} scrollto={scrollto} />
      </main>
    </div>
  );
}
