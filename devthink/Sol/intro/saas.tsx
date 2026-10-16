/**
 * saas.tsx — the SaaS face of the intro (layer 3, page body): the approved
 * landing rebuilt from zero on the pale canvas (#DCE2EE) with the palco
 * (#F2F5FC) at radius 30. The face carries the Urbanist tiers, the saddle
 * bridges, the gaussian shader hero, the studio fan deck, the Cadria top
 * ten, the explorer reel wall, the Debonair rail, the Doo demo and the
 * footer. Every action funnels to the login face: the panel is the last
 * page of the chain. The stylesheet injects once at import time, scoped to
 * the saas-* root and the reference class names.
 */

import {
  ArrowUpRight,
  Bell,
  Headphones,
  Layers,
  LogIn,
  Maximize2,
  MessageSquare,
  Sparkles,
  Star,
  Tv,
  Users,
} from "lucide-react";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { useLocation } from "wouter";
import { SolLogoMark } from "../panel/logo.tsx";
import { SaddleTabBridge, VerticalSaddleBridge } from "./saaskit.tsx";
import {
  SaasCadria,
  SaasDebonair,
  SaasDoo,
  SaasExplorerWall,
  SaasFlowStrip,
  SaasFooter,
  SaasRibbon,
} from "./saasrails.tsx";
import { SaasCreators, SaasHero, SaasStudios } from "./saassections.tsx";

const SAAS_CSS = `
.saas-root { font-family: 'Urbanist', sans-serif; letter-spacing: -0.015em; background: #DCE2EE; }
.saas-root ::selection { background: #4F46E5; color: #FFFFFF; }
.saas-root button:focus-visible, .saas-root input:focus-visible { outline: 2px solid rgba(99,102,241,0.65); outline-offset: 2px; }
.saas-root button, .saas-root input { outline: none; }
.saas-root img { -webkit-user-drag: none; user-select: none; }

.btn-tactile-3d { background: linear-gradient(180deg, #243047 0%, #090D16 100%); box-shadow: 0 14px 28px -8px rgba(9,13,22,0.55), 0 4px 10px -2px rgba(9,13,22,0.35), inset 0 1.5px 2px rgba(255,255,255,0.42), inset 0 -3px 6px rgba(0,0,0,0.65); border: 1px solid rgba(255,255,255,0.16); transition: transform 0.25s cubic-bezier(0.16,1,0.3,1), box-shadow 0.25s ease; }
.btn-tactile-3d:hover { transform: translateY(-2px) scale(1.02); box-shadow: 0 20px 34px -8px rgba(79,70,229,0.45), inset 0 2px 3px rgba(255,255,255,0.55), inset 0 -3px 6px rgba(0,0,0,0.75); }
.icon-frame-3d { background: rgba(255,255,255,0.92); border: 1px solid rgba(203,213,225,0.85); box-shadow: 0 8px 18px -6px rgba(15,23,42,0.10), inset 0 1px 2px rgba(255,255,255,1); transition: transform 0.22s ease, border-color 0.22s ease, box-shadow 0.22s ease; }
.icon-frame-3d:hover { transform: translateY(-1.5px); border-color: rgba(99,102,241,0.5); box-shadow: 0 12px 22px -6px rgba(79,70,229,0.18), inset 0 1px 2px rgba(255,255,255,1); }
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

/** The nav entries of the tab bridge and the left rail, one section each. */
const NAV = [
  { id: "hero-os", label: "OS", rail: "DevThink OS", icon: Sparkles },
  { id: "creators-doo", label: "Creators", rail: "Doo and creators", icon: Users },
  { id: "workspace-subapps", label: "Explorer", rail: "Explorer", icon: Layers },
  { id: "spatial-bento", label: "Cadria", rail: "Cadria", icon: Tv },
  { id: "sonic-deck", label: "Debonair", rail: "Debonair", icon: Headphones },
  { id: "advisor-dark", label: "Doo", rail: "Doo chat", icon: MessageSquare },
] as const;

/** The SaaS page: the approved landing, one scroll, every action through
 * the login face. The anchor hands the onDone callback — the intro flag
 * rises on the way out, wherever the visitor leaves. */
export default function Saas({ onDone }: { onDone: () => void }) {
  const [, navigate] = useLocation();
  const [active, setActive] = useState<string>("hero-os");
  const enter = useCallback(() => {
    onDone();
    navigate("/auth");
  }, [navigate, onDone]);
  const scrollto = useCallback((id: string) => {
    setActive(id);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  }, []);
  return (
    <div className="saas-root min-h-screen w-full overflow-x-hidden p-[2.5px] text-slate-900 select-none sm:select-auto">
      <aside className="fixed top-1/2 left-0 z-50 hidden -translate-y-1/2 flex-col items-center lg:flex">
        <VerticalSaddleBridge fillColor="#0A0B0E" className="py-2">
          <div className="flex flex-col items-center gap-3 px-1">
            <div className="my-0.5 h-[1px] w-5 bg-white/15" />
            {NAV.map((item) => {
              const Icon = item.icon;
              const current = active === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => scrollto(item.id)}
                  aria-label={item.rail}
                  className={`group relative flex h-10 w-10 items-center justify-center rounded-full transition-all duration-300 ${current ? "scale-105 bg-gradient-to-tr from-indigo-600 to-sky-500 text-white" : "bg-white/10 text-slate-300 hover:bg-white/20 hover:text-white"}`}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  <span className="pointer-events-none absolute left-14 rounded-lg border border-white/10 bg-slate-950 px-2.5 py-1 text-[11px] font-semibold tracking-[-0.018em] whitespace-nowrap text-white opacity-0 transition group-hover:opacity-100">
                    {item.rail}
                  </span>
                </button>
              );
            })}
          </div>
        </VerticalSaddleBridge>
      </aside>

      <div className="surface-card fixed right-4 bottom-8 z-40 hidden flex-col items-center gap-2 rounded-2xl p-2 text-slate-700 md:flex">
        <button
          type="button"
          onClick={() => toast("Saved")}
          className="icon-frame-3d flex h-9 w-9 items-center justify-center rounded-xl"
          aria-label="Save"
        >
          <Star className="h-4 w-4" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={() => scrollto("workspace-subapps")}
          className="icon-frame-3d flex h-9 w-9 items-center justify-center rounded-xl"
          aria-label="Explorer"
        >
          <Layers className="h-4 w-4" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="icon-frame-3d flex h-9 w-9 items-center justify-center rounded-xl"
          aria-label="Top"
        >
          <Maximize2 className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      <main className="relative z-10 min-h-[calc(100vh-5px)] w-full overflow-hidden rounded-[30px] border border-white bg-[#F2F5FC] shadow-[0_25px_80px_-15px_rgba(15,23,42,0.25)] sm:rounded-[34px]">
        <section id="saas-header" className="relative bg-[#F2F5FC]">
          <header className="relative z-40">
            <div className="h-1.5 w-full bg-white" />
            <div className="-mt-[1px] flex w-full items-start justify-center gap-2 px-4 sm:gap-4 sm:px-8">
              <div className="ml-1 flex shrink-0 items-center pt-2 sm:ml-3">
                <button
                  type="button"
                  onClick={() => scrollto("hero-os")}
                  className="group inline-flex items-center gap-1 text-slate-950 transition hover:scale-[1.015]"
                >
                  <SolLogoMark size={28} />
                  <span className="text-lg font-extrabold tracking-[-0.035em]">DevThink</span>
                </button>
              </div>
              <div className="flex shrink-0 flex-col items-center drop-shadow-[0_10px_20px_rgba(15,23,42,0.06)]">
                <SaddleTabBridge fillColor="#FFFFFF" className="h-[52px]">
                  <nav className="flex items-center gap-2" aria-label="Sections">
                    {NAV.slice(0, 5).map((tab) => {
                      const Icon = tab.icon;
                      const current = active === tab.id;
                      return (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => scrollto(tab.id)}
                          className={`group flex items-center rounded-xl px-3 py-2 transition-all ${current ? "icon-frame-3d-active text-slate-950" : "icon-frame-3d text-slate-800"}`}
                          aria-label={tab.label}
                        >
                          <Icon
                            strokeWidth={1.7}
                            className={`h-4 w-4 ${tab.id === "hero-os" ? "text-indigo-600" : tab.id === "workspace-subapps" ? "text-sky-600" : tab.id === "creators-doo" ? "text-purple-600" : tab.id === "spatial-bento" ? "text-pink-600" : "text-blue-600"}`}
                            aria-hidden="true"
                          />
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
                  onClick={enter}
                  className="icon-frame-3d group flex items-center rounded-full p-2.5 text-slate-800"
                  aria-label="Alerts"
                >
                  <Bell strokeWidth={1.7} className="h-4 w-4" aria-hidden="true" />
                  <span className="max-w-0 overflow-hidden text-xs font-semibold tracking-[-0.018em] whitespace-nowrap opacity-0 transition-all group-hover:ml-2 group-hover:max-w-[70px] group-hover:opacity-100">
                    Alerts
                  </span>
                </button>
                <button
                  type="button"
                  onClick={enter}
                  className="icon-frame-3d group hidden items-center rounded-full p-2.5 text-slate-800 sm:flex"
                  aria-label="Sign in"
                >
                  <LogIn strokeWidth={1.7} className="h-4 w-4" aria-hidden="true" />
                  <span className="max-w-0 overflow-hidden text-xs font-semibold tracking-[-0.018em] whitespace-nowrap opacity-0 transition-all group-hover:ml-2 group-hover:max-w-[70px] group-hover:opacity-100">
                    Sign in
                  </span>
                </button>
                <button
                  type="button"
                  onClick={enter}
                  className="btn-tactile-3d group flex items-center rounded-full p-2.5 text-white"
                  aria-label="Launch"
                >
                  <ArrowUpRight className="h-4 w-4 text-sky-400" aria-hidden="true" />
                  <span className="max-w-0 overflow-hidden text-xs font-extrabold tracking-[-0.035em] whitespace-nowrap opacity-0 transition-all group-hover:mr-1 group-hover:ml-2 group-hover:max-w-[80px] group-hover:opacity-100">
                    Launch
                  </span>
                </button>
              </div>
            </div>
          </header>
        </section>

        <SaasHero onenter={enter} scrollto={scrollto} />
        <SaasCreators onenter={enter} scrollto={scrollto} />
        <SaasStudios onenter={enter} scrollto={scrollto} />
        <SaasRibbon />
        <SaasFlowStrip scrollto={scrollto} />
        <SaasCadria />
        <SaasExplorerWall onenter={enter} />
        <SaasDebonair />
        <SaasDoo onenter={enter} />
        <SaasRibbon />
        <SaasFooter onenter={enter} scrollto={scrollto} />
      </main>
    </div>
  );
}
