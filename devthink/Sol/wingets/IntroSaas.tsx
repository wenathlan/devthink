/**
 * saas.tsx — the SaaS face of the intro (layer 3, page body): the
 * nine-section reference landing restored by PR8 P1 at the 97% fidelity
 * the owner ordered — the pale canvas (#DCE2EE) with the palco (#F2F5FC)
 * at radius 30/34, the white header chrome (the h-1.5 bar, the saddle tab
 * bridge with the five reference tabs, the Alerts, Sign In and Launch
 * keys), the vertical saddle rail at the left edge with its six mandate
 * stops (the saddle cloud key stays retired by the owner order — no
 * seventh key ever answers the rail), the quick dock at the corner and
 * the toast channel at the bottom center. Every section composes from the
 * sections and rails wingets in the reference order: hero-os,
 * creators-doo, workspace-subapps, the sawtooth ribbon with studio-flow,
 * spatial-bento, explorer-wall, sonic-deck, advisor-dark and the
 * editorial footer. The voice rides the Urbanist tiers of sol.css (the
 * Google Fonts stylesheet injected once here; the house Inter Variable
 * answers wherever the frozen CSP keeps the remote face from loading),
 * the glyphs ride the lucide set of the reference and the materials ride
 * the landing block of sol.css — the tactile keys with the one
 * sanctioned indigo hover of the reference, never a blue glow elsewhere
 * and never a solid blue key in the hero. The launch paths funnel to the
 * login face: the panel is the last page of the chain.
 */

import type { LucideIcon } from "lucide-react";
import {
  ArrowUpRight,
  Bell,
  Compass,
  Film,
  Headphones,
  Layers,
  LogIn,
  Maximize2,
  MessageSquare,
  Music,
  Sparkles,
  Star,
  Tv,
  Users,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useLocation } from "wouter";
import { saaschrome, saasheadertabs, saasrailstops } from "../../saascontent.ts";
import { SaddleTabBridge, VerticalSaddleBridge } from "./IntroSaaskit.tsx";
import { SaasAdvisor, SaasCadria, SaasDebonair, SaasExplorer, SaasFooter } from "./IntroSaasrails.tsx";
import { SaasCreators, SaasHero, SaasStudioFlow, SaasWorkspace } from "./IntroSaassections.tsx";
import { SolLogoMark, SolWordmark } from "./PanelLogo.tsx";

/** The reference voice: the Urbanist stylesheet, injected once per
 * document at import time (the reference @import). Where the frozen CSP
 * of a target keeps the remote face from loading (the extension pages),
 * the tier stacks of sol.css fall back to the house Inter Variable voice
 * — the face never blanks. */
const SAAS_FONT_CSS = "@import url('https://fonts.googleapis.com/css2?family=Urbanist:wght@400;600;800&display=swap');";

let saasCssReady = false;

/** Injects the Urbanist stylesheet exactly once per document, at import time. */
function ensureSaasCss(): void {
  if (saasCssReady || typeof document === "undefined") return;
  saasCssReady = true;
  const tag = document.createElement("style");
  tag.setAttribute("data-dt-saas", "");
  tag.textContent = SAAS_FONT_CSS;
  document.head.appendChild(tag);
}
ensureSaasCss();

/** The lucide glyph and the ink color each header tab wears — the exact
 * reference pair (the OS spark in indigo, the explorer compass in sky, the
 * creators team in purple, the cadria film in pink, the debonair note in
 * blue). */
const TABICON: Record<string, { icon: LucideIcon; color: string }> = {
  "hero-os": { icon: Sparkles, color: "text-indigo-600" },
  "workspace-subapps": { icon: Compass, color: "text-sky-600" },
  "creators-doo": { icon: Users, color: "text-purple-600" },
  "spatial-bento": { icon: Film, color: "text-pink-600" },
  "sonic-deck": { icon: Music, color: "text-blue-600" },
};

/** The lucide glyph each left rail stop wears — the exact reference set. */
const RAILICON: Record<string, LucideIcon> = {
  "hero-os": Sparkles,
  "creators-doo": Compass,
  "workspace-subapps": Layers,
  "spatial-bento": Tv,
  "sonic-deck": Headphones,
  "advisor-dark": MessageSquare,
};

/** The SaaS page: the restored reference landing, one scroll, every launch
 * path through the login face. The anchor hands the onDone callback — the
 * intro flag rises on the way out, wherever the visitor leaves — and the
 * footer Explorer row walks the entry chain through the free exploration
 * face (/explore) on the way. */
export default function Saas({ onDone }: { onDone: () => void }) {
  const [, navigate] = useLocation();
  const [active, setActive] = useState("hero-os");
  const [toast, setToast] = useState<string | null>(null);

  const enter = useCallback(() => {
    onDone();
    navigate("/auth");
  }, [navigate, onDone]);

  const explore = useCallback(() => {
    onDone();
    navigate("/explore");
  }, [navigate, onDone]);

  /** the toast channel of the reference: one pill at the bottom center,
   * 2.2s per message */
  const ontoast = useCallback((message: string) => setToast(message), []);

  const scrollto = useCallback((id: string) => {
    setActive(id);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 2200);
    return () => window.clearTimeout(t);
  }, [toast]);

  return (
    <div className="saas-root min-h-screen w-full overflow-x-hidden bg-[#DCE2EE] p-[2.5px] text-slate-900 select-none sm:select-auto">
      {/* the left rail: the vertical saddle slab at the screen edge — the
          hairline divider and the six mandate stops with the reference
          indigo-to-sky active pill (the saddle cloud key retired by the
          owner order: the six stops are the only keys of the rail) */}
      <aside className="fixed top-1/2 left-0 z-50 hidden -translate-y-1/2 flex-col items-center p-0 lg:flex">
        <VerticalSaddleBridge fillColor="#0A0B0E" className="py-2">
          <div className="flex flex-col items-center gap-3 px-1">
            <div className="my-0.5 h-[1px] w-5 bg-white/15" aria-hidden="true" />
            {saasrailstops.map((item) => {
              const Glyph = RAILICON[item.id];
              const current = active === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => scrollto(item.id)}
                  aria-label={item.label}
                  aria-pressed={current}
                  className={`group relative flex h-10 w-10 items-center justify-center rounded-full transition-all duration-300 ${current ? "scale-105 bg-gradient-to-tr from-indigo-600 to-sky-500 text-white" : "bg-white/10 text-slate-300 hover:bg-white/20 hover:text-white"}`}
                >
                  {Glyph ? <Glyph className="h-4 w-4" aria-hidden="true" /> : null}
                  <span className="pointer-events-none absolute left-14 rounded-lg border border-white/10 bg-slate-950 px-2.5 py-1 text-[11px] font-medium-tier whitespace-nowrap text-white opacity-0 transition group-hover:opacity-100">
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </VerticalSaddleBridge>
      </aside>

      {/* the quick dock: the three corner keys of the reference on the
          surface card — favorites, the studio walk and the return to the
          top */}
      <div className="surface-card fixed right-4 bottom-8 z-40 hidden flex-col items-center gap-2 rounded-2xl p-2 text-slate-700 md:flex">
        <button
          type="button"
          onClick={() => ontoast("Saved to Favorites")}
          aria-label="Favorites"
          className="icon-frame-3d flex h-9 w-9 items-center justify-center rounded-xl"
        >
          <Star className="h-4 w-4" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={() => scrollto("workspace-subapps")}
          aria-label="Studios"
          className="icon-frame-3d flex h-9 w-9 items-center justify-center rounded-xl"
        >
          <Layers className="h-4 w-4" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="Back to top"
          className="icon-frame-3d flex h-9 w-9 items-center justify-center rounded-xl"
        >
          <Maximize2 className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      <main className="relative z-10 min-h-[calc(100vh-5px)] w-full overflow-hidden rounded-[30px] border border-white bg-[#F2F5FC] shadow-[0_25px_80px_-15px_rgba(15,23,42,0.25)] sm:rounded-[34px]">
        {/* the header chrome: the white h-1.5 bar, the brand row, the five
            reference tabs on the white saddle bridge and the Alerts, Sign
            In and Launch keys — the two doors walk the entry chain to the
            login face */}
        <header className="relative z-30 inset-x-0 top-0 w-full">
          <div className="h-1.5 w-full bg-white" aria-hidden="true" />
          <div className="-mt-[1px] flex w-full items-start justify-center gap-2 px-4 sm:gap-4 sm:px-8">
            <div className="ml-1 flex shrink-0 items-center sm:ml-3">
              <button
                type="button"
                onClick={() => scrollto("hero-os")}
                className="group inline-flex items-center gap-1 text-slate-950 transition hover:scale-[1.015]"
                aria-label={saaschrome.title}
              >
                <SolLogoMark size={28} className="h-7 w-7 sm:h-9 sm:w-9" title={saaschrome.title} />
                <SolWordmark height={16} className="h-4 sm:h-5" />
              </button>
            </div>
            <div className="flex shrink-0 flex-col items-center drop-shadow-[0_10px_20px_rgba(15,23,42,0.06)]">
              <SaddleTabBridge fillColor="#FFFFFF" className="h-[52px]">
                <nav className="flex items-center gap-2" aria-label="Sections">
                  {saasheadertabs.map((tab) => {
                    const entry = TABICON[tab.id];
                    const current = active === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => scrollto(tab.id)}
                        aria-label={tab.label}
                        className={`group flex items-center rounded-xl px-3 py-2 transition-all ${current ? "icon-frame-3d-active text-slate-950" : "icon-frame-3d text-slate-800"}`}
                      >
                        {entry ? (
                          <entry.icon strokeWidth={1.7} className={`h-4 w-4 ${entry.color}`} aria-hidden="true" />
                        ) : null}
                        <span className="max-w-0 overflow-hidden text-xs font-medium-tier whitespace-nowrap opacity-0 transition-all group-hover:ml-2 group-hover:max-w-[90px] group-hover:opacity-100">
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
                onClick={() => ontoast("Notifications synced")}
                className="icon-frame-3d group flex items-center rounded-full p-2.5 text-slate-800"
                aria-label={saaschrome.alerts}
              >
                <Bell strokeWidth={1.7} className="h-4 w-4" aria-hidden="true" />
                <span className="max-w-0 overflow-hidden text-xs font-medium-tier whitespace-nowrap opacity-0 transition-all group-hover:ml-2 group-hover:max-w-[70px] group-hover:opacity-100">
                  {saaschrome.alerts}
                </span>
              </button>
              <button
                type="button"
                onClick={enter}
                className="icon-frame-3d group hidden items-center rounded-full p-2.5 text-slate-800 sm:flex"
                aria-label={saaschrome.signin}
              >
                <LogIn strokeWidth={1.7} className="h-4 w-4" aria-hidden="true" />
                <span className="max-w-0 overflow-hidden text-xs font-medium-tier whitespace-nowrap opacity-0 transition-all group-hover:ml-2 group-hover:max-w-[70px] group-hover:opacity-100">
                  {saaschrome.signin}
                </span>
              </button>
              <button
                type="button"
                onClick={enter}
                className="btn-tactile-3d group flex items-center rounded-full p-2.5 text-white"
                aria-label={saaschrome.launch}
              >
                <ArrowUpRight className="h-4 w-4 text-sky-400" aria-hidden="true" />
                <span className="max-w-0 overflow-hidden text-xs font-bold-tier whitespace-nowrap opacity-0 transition-all group-hover:mr-1 group-hover:ml-2 group-hover:max-w-[80px] group-hover:opacity-100">
                  {saaschrome.launch}
                </span>
              </button>
            </div>
          </div>
        </header>

        {/* the nine sections in the reference order */}
        <SaasHero scrollto={scrollto} />
        <SaasCreators scrollto={scrollto} ontoast={ontoast} />
        <SaasWorkspace scrollto={scrollto} />
        <SaasStudioFlow scrollto={scrollto} />
        <SaasCadria ontoast={ontoast} />
        <SaasExplorer scrollto={scrollto} ontoast={ontoast} />
        <SaasDebonair scrollto={scrollto} ontoast={ontoast} />
        <SaasAdvisor scrollto={scrollto} ontoast={ontoast} />
        <SaasFooter onenter={enter} onexplore={explore} scrollto={scrollto} ontoast={ontoast} />
      </main>

      {/* the toast pill: bottom center, 2.2s */}
      {toast ? (
        <div className="fixed bottom-8 left-1/2 z-[60] -translate-x-1/2 rounded-full border border-white/10 bg-slate-950 px-5 py-3 text-[13px] font-medium-tier text-white shadow-2xl">
          {toast}
        </div>
      ) : null}
    </div>
  );
}
