/**
 * saas.tsx — the SaaS face of the intro (layer 3, page body): the approved
 * landing restored at full parity — the pale canvas (#DCE2EE) with the
 * palco (#F2F5FC) at radius 30, the saddle rail at the left edge with its
 * snug fitted curve, the Urbanist tiers, the gaussian shader hero with the
 * inline engine switch, the studio fan deck, the Cadria top ten, the
 * explorer reel wall, the Debonair rail, the Doo demo and the footer. The
 * glyphs ride the fluent set the owner pinned for this face. Every launch
 * path funnels to the login face: the panel is the last page of the chain.
 * The stylesheet injects once at import time, scoped to the saas-* root and
 * the reference class names.
 */

import {
  AlertRegular as Bell,
  ArrowUpRightRegular as Arrowupright,
  DoorArrowRightRegular as Signin,
  HeadphonesRegular as Headphones,
  StackRegular as Layers,
  ChatRegular as Messagesquare,
  MaximizeRegular as Maximize,
  SparkleRegular as Sparkle,
  StarRegular as Star,
  TvRegular as Tv,
  PeopleRegular as Users,
} from "@fluentui/react-icons";
import { type ComponentType, useCallback, useEffect, useState } from "react";
import { useLocation } from "wouter";
import { saaschrome, saasheadertabs, saasrailstops } from "../../saascontent.ts";
import { SaddleTabBridge, Studiomark, VerticalSaddleBridge } from "./IntroSaaskit.tsx";
import {
  SaasCadria,
  SaasDebonair,
  SaasDoo,
  SaasExplorerWall,
  SaasFlowStrip,
  SaasFooter,
  SaasRibbon,
} from "./IntroSaasrails.tsx";
import { SaasCreators, SaasHero, SaasStudios } from "./IntroSaassections.tsx";
import { SolLogoMark, SolWordmark } from "./PanelLogo.tsx";

const SAAS_CSS = `
.saas-root { font-family: 'Urbanist', sans-serif; letter-spacing: -0.015em; background: #DCE2EE; }
.saas-root ::selection { background: #4F46E5; color: #FFFFFF; }
.saas-root button:focus-visible, .saas-root input:focus-visible { outline: 2px solid rgba(99,102,241,0.65); outline-offset: 2px; }
.saas-root button, .saas-root input { outline: none; }
.saas-root img { -webkit-user-drag: none; user-select: none; }

.btn-tactile-3d { background: linear-gradient(180deg, #243047 0%, #090D16 100%); box-shadow: 0 14px 28px -8px rgba(9,13,22,0.55), 0 4px 10px -2px rgba(9,13,22,0.35), inset 0 1.5px 2px rgba(255,255,255,0.42), inset 0 -3px 6px rgba(0,0,0,0.65); border: 1px solid rgba(255,255,255,0.16); transition: transform 0.25s cubic-bezier(0.16,1,0.3,1), box-shadow 0.25s ease; }
.btn-tactile-3d:hover { transform: translateY(-2px) scale(1.02); box-shadow: 0 20px 34px -8px rgba(79,70,229,0.45), inset 0 2px 3px rgba(255,255,255,0.55), inset 0 -3px 6px rgba(0,0,0,0.75); }
.btn-tactile-3d:active { transform: translateY(0) scale(0.96); transition-duration: 0.08s; box-shadow: 0 8px 18px -8px rgba(9,13,22,0.55), inset 0 1.5px 2px rgba(255,255,255,0.32), inset 0 -2px 5px rgba(0,0,0,0.55); }
.icon-frame-3d { background: rgba(255,255,255,0.92); border: 1px solid rgba(203,213,225,0.85); box-shadow: 0 8px 18px -6px rgba(15,23,42,0.10), inset 0 1px 2px rgba(255,255,255,1); transition: transform 0.22s ease, border-color 0.22s ease, box-shadow 0.22s ease; }
.icon-frame-3d:hover { transform: translateY(-1.5px); border-color: rgba(99,102,241,0.5); box-shadow: 0 12px 22px -6px rgba(79,70,229,0.18), inset 0 1px 2px rgba(255,255,255,1); }
.icon-frame-3d:active { transform: translateY(0) scale(0.94); transition-duration: 0.08s; }
.icon-frame-3d-active { background: #FFFFFF; border: 1px solid rgba(99,102,241,0.6); box-shadow: 0 10px 22px -6px rgba(79,70,229,0.24), inset 0 1px 2px rgba(255,255,255,1); }
.surface-card { background: #FFFFFF; border: 1px solid rgba(226,232,240,0.95); box-shadow: 0 16px 36px -14px rgba(15,23,42,0.10); }
.stat-tile { background: #F4F6FB; border: 1px solid rgba(226,232,240,0.9); }
.indigo-tactile-surface { background: linear-gradient(145deg, #4F46E5 0%, #3730A3 58%, #312E81 100%); box-shadow: 0 22px 44px -12px rgba(55,48,163,0.5), inset 0 2px 5px rgba(255,255,255,0.32), inset 0 -5px 10px rgba(15,23,42,0.4); }
.hero-inline-switch { background: linear-gradient(125deg, #60A5FA 0%, #A855F7 48%, #EC4899 78%, #F97316 100%); box-shadow: 0 12px 26px -6px rgba(168,85,247,0.45), inset 0 2px 4px rgba(255,255,255,0.55); }
.hero-switch-thumb { background: radial-gradient(circle at 30% 30%, #FFFFFF 0%, #F1F5F9 70%, #CBD5E1 100%); box-shadow: -3px 4px 10px rgba(15,23,42,0.35), inset 0 2px 3px rgba(255,255,255,1); }
@keyframes shaderPulse { 0%,100% { transform: scale(1) translate(0,0); } 50% { transform: scale(1.05) translate(10px,-8px); } }
.hero-gaussian-shader { background: radial-gradient(circle at 14% 70%, rgba(56,189,248,0.82) 0%, transparent 48%), radial-gradient(circle at 36% 80%, rgba(99,102,241,0.78) 0%, transparent 50%), radial-gradient(circle at 58% 65%, rgba(168,85,247,0.78) 0%, transparent 48%), radial-gradient(circle at 78% 75%, rgba(236,72,153,0.78) 0%, transparent 48%), radial-gradient(circle at 92% 65%, rgba(251,146,60,0.82) 0%, transparent 45%); filter: blur(56px) saturate(165%); animation: shaderPulse 9s ease-in-out infinite; }
.conic-rainbow-ring { background: conic-gradient(from 180deg at 50% 50%, #EC4899 0deg, #8B5CF6 72deg, #3B82F6 144deg, #38BDF8 216deg, #F59E0B 288deg, #EC4899 360deg); padding: 2.5px; }
.obsidian-grid-bg { background-color: #08080C; background-image: linear-gradient(to right, rgba(255,255,255,0.032) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.032) 1px, transparent 1px); background-size: 60px 60px; }
.netflix-rank-num { -webkit-text-stroke: 2px rgba(255,255,255,0.35); color: rgba(15,23,42,0.75); }
@keyframes spinBadgeSlow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
.spin-badge-slow { animation: spinBadgeSlow 18s linear infinite; }
.ribbon-sawtooth-divider { height: 30px; width: 100%; background-image: linear-gradient(135deg, rgba(15,23,42,0.92) 25%, transparent 25%), linear-gradient(225deg, rgba(99,102,241,0.75) 25%, transparent 25%), linear-gradient(45deg, rgba(56,189,248,0.45) 25%, transparent 25%), linear-gradient(315deg, rgba(200,75,17,0.75) 25%, #F9F6F0 25%); background-position: 15px 0, 15px 0, 0 0, 0 0; background-size: 30px 30px; background-repeat: repeat-x; }
.ribbon-whitewash-center { width: min(320px, 80vw); height: 100%; background: #F9F6F0; -webkit-mask-image: linear-gradient(to right, transparent 0, #000 28px, #000 calc(100% - 28px), transparent 100%); mask-image: linear-gradient(to right, transparent 0, #000 28px, #000 calc(100% - 28px), transparent 100%); }
@media (min-width: 640px) { .ribbon-whitewash-center { width: min(392px, 84vw); -webkit-mask-image: linear-gradient(to right, transparent 0, #000 42px, #000 calc(100% - 42px), transparent 100%); mask-image: linear-gradient(to right, transparent 0, #000 42px, #000 calc(100% - 42px), transparent 100%); } }
@keyframes fanSwap { from { opacity: 0; transform: translateY(3px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
.fan-swap { animation: fanSwap 0.42s cubic-bezier(0.16,1,0.3,1); }
.urbanist-frosted-blur { background: linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(100,116,139,0.12) 65%, rgba(15,23,42,0.35) 100%); border-top: 1px solid rgba(255,255,255,0.14); }
.fan-clay { box-shadow: inset 0 1.5px 3px rgba(255,255,255,0.65), inset 0 -10px 18px rgba(15,23,42,0.1), 0 12px 24px -12px rgba(15,23,42,0.28); }
.fan-sheen { background: linear-gradient(180deg, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0.06) 32%, transparent 55%, rgba(15,23,42,0.08) 100%); }
.mask-fade-x { -webkit-mask-image: linear-gradient(to right, transparent, #000 52px, #000 calc(100% - 52px), transparent); mask-image: linear-gradient(to right, transparent, #000 52px, #000 calc(100% - 52px), transparent); }
.rail-scroll::-webkit-scrollbar { display: none; }
.rail-scroll { scrollbar-width: none; -ms-overflow-style: none; }
.text-gradient-brand { background: linear-gradient(92deg, #6366F1 0%, #38BDF8 100%); -webkit-background-clip: text; background-clip: text; color: transparent; }
@keyframes cardSwingLeft { 0%,100% { transform: translateY(0) rotate(-0.7deg); } 50% { transform: translateY(-8px) rotate(0.5deg); } }
@keyframes cardSwingCenter { 0%,100% { transform: translateY(10px) rotate(0.5deg); } 50% { transform: translateY(0) rotate(-0.5deg); } }
@keyframes cardSwingRight { 0%,100% { transform: translateY(0) rotate(0.7deg); } 50% { transform: translateY(-9px) rotate(-0.5deg); } }
.swing-card-1 { animation: cardSwingLeft 5s ease-in-out infinite; }
.swing-card-2 { animation: cardSwingCenter 5.6s ease-in-out infinite; }
.swing-card-3 { animation: cardSwingRight 5.2s ease-in-out infinite; }
@keyframes subtleFloat { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
.animate-float-card { animation: subtleFloat 6s ease-in-out infinite; }
.animate-float-card-delayed { animation: subtleFloat 6.6s ease-in-out 1.2s infinite; }
@media (prefers-reduced-motion: reduce) {
  .hero-gaussian-shader, .spin-badge-slow, .swing-card-1, .swing-card-2, .swing-card-3, .animate-float-card, .animate-float-card-delayed, .fan-swap { animation: none; }
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

/** One glyph of the fluent set, addressable by its section id. */
type glyphkind = ComponentType<{ className?: string; "aria-hidden"?: boolean | "true" | "false" }>;

/** The glyph each header tab of the saddle bridge wears. */
const TABGLYPH: Record<string, glyphkind> = {
  "hero-os": Sparkle,
  "workspace-subapps": Layers,
  "creators-doo": Users,
  "spatial-bento": Tv,
  "sonic-deck": Headphones,
};

/** The tone each header tab glyph rides. */
const TABTONE: Record<string, string> = {
  "hero-os": "text-indigo-600",
  "workspace-subapps": "text-sky-600",
  "creators-doo": "text-purple-600",
  "spatial-bento": "text-pink-600",
  "sonic-deck": "text-blue-600",
};

/** The glyph each left rail stop wears. */
const RAILGLYPH: Record<string, glyphkind> = {
  "hero-os": Sparkle,
  "creators-doo": Users,
  "workspace-subapps": Layers,
  "spatial-bento": Tv,
  "sonic-deck": Headphones,
  "advisor-dark": Messagesquare,
};

/** The SaaS page: the approved landing, one scroll, every launch path
 * through the login face. The anchor hands the onDone callback — the
 * intro flag rises on the way out, wherever the visitor leaves — and the
 * explorer key of the corner dock and the footer row walk the entry
 * chain through the free exploration face (/explore) on the way. */
export default function Saas({ onDone }: { onDone: () => void }) {
  const [, navigate] = useLocation();
  const [active, setActive] = useState<string>("hero-os");
  const [toastmessage, setToastmessage] = useState<string | null>(null);
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
  const showtoast = useCallback((message: string) => {
    setToastmessage(message);
  }, []);
  useEffect(() => {
    if (!toastmessage) return;
    const timer = window.setTimeout(() => setToastmessage(null), 2200);
    return () => window.clearTimeout(timer);
  }, [toastmessage]);
  return (
    <div className="saas-root min-h-screen w-full overflow-x-hidden p-[2.5px] text-slate-900 select-none sm:select-auto">
      {/* the left rail: the vertical saddle slab at the screen edge — the
          hairline divider, the six mandate stops with the indigo active
          pill and the saddle cloud key under them */}
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
                  className={`group relative flex h-10 w-10 items-center justify-center rounded-full transition-all duration-300 ${current ? "scale-105 bg-gradient-to-tr from-indigo-600 to-sky-500 text-white" : "bg-white/10 text-slate-300 hover:bg-white/20 hover:text-white"}`}
                >
                  <Glyph className="h-4 w-4" aria-hidden="true" />
                  <span className="pointer-events-none absolute left-14 rounded-lg border border-white/10 bg-slate-950 px-2.5 py-1 text-[11px] font-semibold tracking-[-0.018em] whitespace-nowrap text-white opacity-0 transition group-hover:opacity-100">
                    {item.label}
                  </span>
                </button>
              );
            })}
            <button
              type="button"
              onClick={() => scrollto("workspace-subapps")}
              className="group relative mt-1 flex h-10 w-10 items-center justify-center rounded-full transition hover:scale-110"
              aria-label={saaschrome.railcloud}
            >
              <Studiomark app="saddle" className="h-10 w-10" />
              <span className="pointer-events-none absolute left-14 rounded-lg border border-white/10 bg-slate-950 px-2.5 py-1 text-[11px] font-semibold tracking-[-0.018em] whitespace-nowrap text-white opacity-0 transition group-hover:opacity-100">
                {saaschrome.railcloud}
              </span>
            </button>
          </div>
        </VerticalSaddleBridge>
      </aside>

      {/* the corner dock: the white card with the three tactile keys of the
          original dock — the favorites key answers with the page pill, the
          explorer key walks the entry chain to the free exploration face
          and the top key walks the page home */}
      <div className="surface-card fixed right-4 bottom-8 z-40 hidden flex-col items-center gap-2 rounded-2xl p-2 text-slate-700 md:flex">
        <button
          type="button"
          onClick={() => showtoast(saaschrome.savedtofavorites)}
          className="icon-frame-3d flex h-9 w-9 items-center justify-center rounded-xl"
          aria-label={saaschrome.dockstar}
        >
          <Star className="h-4 w-4" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={explore}
          className="icon-frame-3d flex h-9 w-9 items-center justify-center rounded-xl"
          aria-label={saaschrome.dockexplore}
        >
          <Layers className="h-4 w-4" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="icon-frame-3d flex h-9 w-9 items-center justify-center rounded-xl"
          aria-label={saaschrome.docktop}
        >
          <Maximize className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

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
                          className={`group flex items-center rounded-xl px-3 py-2 transition-all ${current ? "icon-frame-3d-active text-slate-950" : "icon-frame-3d text-slate-800"}`}
                          aria-label={tab.label}
                        >
                          <Glyph className={`h-4 w-4 ${TABTONE[tab.id]}`} aria-hidden="true" />
                          <span className="max-w-0 overflow-hidden text-xs font-semibold tracking-[-0.018em] whitespace-nowrap opacity-0 transition-all group-hover:ml-2 group-hover:max-w-[90px] group-hover:opacity-100">
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
                  onClick={() => showtoast(saaschrome.notificationssynced)}
                  className="icon-frame-3d group flex items-center rounded-full p-2.5 text-slate-800"
                  aria-label={saaschrome.alerts}
                >
                  <Bell className="h-4 w-4" aria-hidden="true" />
                  <span className="max-w-0 overflow-hidden text-xs font-semibold tracking-[-0.018em] whitespace-nowrap opacity-0 transition-all group-hover:ml-2 group-hover:max-w-[70px] group-hover:opacity-100">
                    {saaschrome.alerts}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={enter}
                  className="icon-frame-3d group hidden items-center rounded-full p-2.5 text-slate-800 sm:flex"
                  aria-label={saaschrome.signin}
                >
                  <Signin className="h-4 w-4" aria-hidden="true" />
                  <span className="max-w-0 overflow-hidden text-xs font-semibold tracking-[-0.018em] whitespace-nowrap opacity-0 transition-all group-hover:ml-2 group-hover:max-w-[70px] group-hover:opacity-100">
                    {saaschrome.signin}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={enter}
                  className="btn-tactile-3d group flex items-center rounded-full p-2.5 text-white"
                  aria-label={saaschrome.launch}
                >
                  <Arrowupright className="h-4 w-4 text-sky-400" aria-hidden="true" />
                  <span className="max-w-0 overflow-hidden text-xs font-extrabold tracking-[-0.035em] whitespace-nowrap opacity-0 transition-all group-hover:mr-1 group-hover:ml-2 group-hover:max-w-[80px] group-hover:opacity-100">
                    {saaschrome.launch}
                  </span>
                </button>
              </div>
            </div>
          </header>
        </section>

        <SaasHero onenter={enter} scrollto={scrollto} />
        <SaasCreators onenter={enter} scrollto={scrollto} showtoast={showtoast} />
        <SaasStudios onenter={enter} scrollto={scrollto} />
        <SaasRibbon />
        <SaasFlowStrip scrollto={scrollto} />
        <SaasCadria showtoast={showtoast} />
        <SaasExplorerWall showtoast={showtoast} />
        <SaasDebonair showtoast={showtoast} scrollto={scrollto} />
        <SaasDoo showtoast={showtoast} scrollto={scrollto} />
        <SaasRibbon />
        <SaasFooter onenter={enter} onexplore={explore} scrollto={scrollto} showtoast={showtoast} />
      </main>

      {toastmessage ? (
        <div className="fixed bottom-8 left-1/2 z-[60] -translate-x-1/2 rounded-full border border-white/10 bg-slate-950 px-5 py-3 text-[13px] font-semibold tracking-[-0.018em] text-white shadow-2xl">
          {toastmessage}
        </div>
      ) : null}
    </div>
  );
}
