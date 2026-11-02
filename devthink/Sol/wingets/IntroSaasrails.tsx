/**
 * saasrails.tsx — the closing sections of the SaaS face, restored by PR8
 * P1 to the nine-section reference landing: the cadria bento (the hero
 * original, the TOP 10 rail with its stroked rank numerals and the live tv
 * banner), the explorer interlude (the spinning badge and the seven
 * panoramic reels), the debonair sonic deck (the LOVE 2K26 editorial and
 * the track rail with the green hearts), the doo advisor (the statement,
 * the three stat tiles and the demo chat on the scooped dark card) and the
 * editorial footer (the four link columns over the sawtooth ribbon). The
 * deck copy and the css art treatments ride the landing data layer
 * (saascontent.ts) — the reference photography died with the owner image
 * ban, so every cover answers as a gradient. Loose components of the
 * intro page — the anchor (intro.tsx) mounts the page (saas.tsx) and the
 * page composes these. The launch paths funnel to the enter callback —
 * the login face is the next page of the chain and the panel stays last —
 * while the footer Explorer row walks the entry chain through the free
 * exploration face (/explore).
 */

import { useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Clock,
  Globe,
  Heart,
  Maximize2,
  MessageSquare,
  Play,
  Plus,
  Send,
  Share2,
} from "lucide-react";
import {
  saasadvisor,
  saascadria,
  saascadriaheroart,
  saascadrialiveart,
  saascadriarail,
  saasdebonair,
  saasdebonairheroart,
  saasdebonairrail,
  saasexplorer,
  saasfooter,
  saasreels,
} from "../../saascontent.ts";
import { SaddleTabBridge, ScoopedCard, Studiomark } from "./IntroSaaskit.tsx";
import { SolLogoMark, SolWordmark } from "./PanelLogo.tsx";

/** The scroll step of the cadria rail arrows (the reference value). */
const CADRIA_STEP = 540;

/** The scroll step of the debonair rail arrows (the reference value). */
const DEBONAIR_STEP = 480;

/** Section 5 — the cadria bento: the slate bridge with the category tabs,
 * the hero original with the N badge and the play row, the TOP 10 rail
 * with the stroked rank numerals and the live tv banner under the red
 * wash. Clicking a rail row loads it into the hero. */
export function SaasCadria({ ontoast }: { ontoast: (m: string) => void }) {
  const [category, setCategory] = useState("trending");
  const [hero, setHero] = useState({
    title: saascadria.hero.title,
    ep: saascadria.hero.ep,
    match: saascadria.hero.match,
    art: saascadriaheroart,
  });
  const railRef = useRef<HTMLDivElement | null>(null);
  const row = category === "trending" ? saascadriarail : saascadriarail.filter((item) => item.category === category);
  const nudge = (left: boolean) =>
    railRef.current?.scrollBy({ left: left ? -CADRIA_STEP : CADRIA_STEP, behavior: "smooth" });
  return (
    <section
      id="spatial-bento"
      className="relative overflow-hidden border-t border-white/10 bg-[#0B0D14] pt-0 pb-24 text-white sm:pb-28"
    >
      <div className="mb-12 w-full">
        <div className="h-2 w-full bg-[#1E293B]" aria-hidden="true" />
        <div className="-mt-[1px] flex w-full items-start justify-center gap-4 px-6 sm:gap-8">
          <div className="flex items-center gap-2.5 pt-2">
            <Studiomark app="cadria" className="h-9 w-9" />
            <span className="text-lg font-bold-tier text-white">{saascadria.brand}</span>
          </div>
          <SaddleTabBridge fillColor="#1E293B" className="h-[48px]">
            <div className="flex items-center gap-2">
              {saascadria.tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setCategory(tab.id)}
                  className={`rounded-xl px-3 py-1.5 text-xs font-medium-tier transition ${category === tab.id ? "bg-white text-slate-950" : "bg-white/10 text-slate-200 hover:bg-white/20"}`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </SaddleTabBridge>
        </div>
      </div>

      <div className="mx-auto max-w-[1360px] px-6 sm:px-10 lg:px-16">
        {/* the hero original */}
        <div className="group relative h-[400px] overflow-hidden rounded-[32px] border border-white/15 sm:h-[500px]">
          <div
            className="absolute inset-0 h-full w-full transition duration-700 group-hover:scale-105"
            style={{ background: hero.art }}
            aria-hidden="true"
          />
          <div
            className="absolute inset-0 bg-gradient-to-t from-[#090D16] via-[#090D16]/40 to-transparent"
            aria-hidden="true"
          />
          <div className="absolute bottom-0 left-0 max-w-2xl p-8 sm:p-12">
            <div className="flex items-center gap-2">
              <span className="rounded bg-[#E50914] px-2 py-1 text-[10px] font-bold-tier text-white">N</span>
              <span className="text-[11px] font-bold-tier tracking-[0.2em] text-slate-300 uppercase">
                {saascadria.original}
              </span>
            </div>
            <h3 className="mt-3 text-5xl font-bold-tier text-white uppercase sm:text-7xl">{hero.title}</h3>
            <p className="mt-2 text-[13px] font-medium-tier text-emerald-400">
              {hero.match} {hero.ep}
            </p>
            <div className="mt-6 flex items-center gap-3">
              <button
                type="button"
                onClick={() => ontoast(`Playing ${hero.title}`)}
                className="flex items-center gap-2 rounded-lg bg-white px-7 py-3 text-sm font-bold-tier text-slate-950 transition hover:bg-slate-200"
              >
                <Play className="h-4 w-4 fill-current" aria-hidden="true" />
                <span>{saascadria.play}</span>
              </button>
              <button
                type="button"
                onClick={() => ontoast("Added to My List")}
                aria-label="Add to My List"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-white/30 bg-black/50 text-white transition hover:bg-white/20"
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>

        {/* the top 10 rail */}
        <div className="mt-16">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="rounded bg-[#E50914] px-2 py-1 text-[11px] font-bold-tier text-white">
                {saascadria.top10}
              </span>
              <h4 className="text-base font-bold-tier text-white sm:text-lg">{saascadria.top10title}</h4>
            </div>
            <div className="flex items-center gap-2">
              <span className="hidden text-xs font-thin-tier text-slate-400 sm:block">{saascadria.hint}</span>
              <button
                type="button"
                onClick={() => nudge(true)}
                aria-label="Scroll rail left"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white transition hover:bg-white/20"
              >
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => nudge(false)}
                aria-label="Scroll rail right"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white transition hover:bg-white/20"
              >
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>
          <div ref={railRef} className="rail-scroll mask-fade-x flex gap-8 overflow-x-auto pb-4 scroll-smooth">
            {row.map((item) => (
              <div
                key={item.rank}
                role="button"
                tabIndex={0}
                aria-label={item.title}
                onClick={() => {
                  setHero({
                    title: item.title,
                    ep: `${item.tag} ${item.duration}`,
                    match: item.match,
                    art: item.art,
                  });
                  ontoast(`Loaded ${item.title}`);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    setHero({
                      title: item.title,
                      ep: `${item.tag} ${item.duration}`,
                      match: item.match,
                      art: item.art,
                    });
                    ontoast(`Loaded ${item.title}`);
                  }
                }}
                className="group w-[220px] shrink-0 cursor-pointer snap-start"
              >
                <div className="relative h-[300px] overflow-hidden rounded-2xl">
                  <div
                    className="h-full w-full transition duration-500 group-hover:scale-105"
                    style={{ background: item.art }}
                    aria-hidden="true"
                  />
                </div>
                <div className="flex items-center gap-3 pt-4">
                  <span className="netflix-rank-num text-5xl font-bold-tier">{item.rank}</span>
                  <div className="min-w-0">
                    <h5 className="truncate text-sm font-bold-tier text-white">{item.title}</h5>
                    <span className="mt-1 block text-[10px] font-bold-tier tracking-[0.18em] text-slate-500">
                      {item.tag}
                    </span>
                    <span className="mt-0.5 block text-xs font-medium-tier text-emerald-400">{item.match}</span>
                    <span className="block text-[11px] font-thin-tier text-slate-400">{item.duration}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* the live tv banner */}
        <div className="group relative mt-14 overflow-hidden rounded-[32px]">
          <div
            className="h-[300px] w-full transition duration-700 group-hover:scale-105 sm:h-[340px]"
            style={{ background: saascadrialiveart }}
            aria-hidden="true"
          />
          <div
            className="absolute inset-0 bg-gradient-to-r from-[#E50914]/90 via-[#E50914]/40 to-black/70"
            aria-hidden="true"
          />
          <div className="absolute inset-0 flex flex-col items-start justify-between gap-6 p-8 sm:flex-row sm:items-center sm:p-10">
            <div>
              <div className="flex items-center gap-2.5">
                <span className="rounded bg-white px-2 py-1 text-[11px] font-bold-tier text-[#E50914]">
                  {saascadria.live.badge}
                </span>
                <span className="text-[11px] font-bold-tier tracking-[0.2em] text-white">{saascadria.live.title}</span>
              </div>
              <p className="mt-3 text-sm font-thin-tier text-white/85">{saascadria.live.copy}</p>
            </div>
            <button
              type="button"
              onClick={() => ontoast("Playing live TV")}
              className="flex shrink-0 items-center gap-2 rounded-lg bg-white px-7 py-3 text-sm font-bold-tier text-slate-950"
            >
              <Play className="h-4 w-4 fill-current" aria-hidden="true" />
              <span>{saascadria.live.key}</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

/** Section 6 — the explorer interlude: the spinning circular badge rising
 * over the section seam, the social proof line, the statement, the seven
 * panoramic reels (the center four on every face, the outer three stepping
 * in with the breakpoints) and the coral Explore key inside its dashed
 * ring. */
export function SaasExplorer({ scrollto, ontoast }: { scrollto: (id: string) => void; ontoast: (m: string) => void }) {
  const [activeReel, setActiveReel] = useState(3);
  return (
    <section
      id="explorer-wall"
      className="relative overflow-visible bg-[#FAF6F0] px-4 pt-14 pb-14 text-slate-950 sm:px-8 lg:px-14 xl:pl-20"
    >
      <div className="absolute -top-9 left-1/2 z-30 flex -translate-x-1/2 items-center justify-center">
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#FAF6F0] p-2 shadow-[0_-10px_25px_rgba(0,0,0,0.25)]">
          <button
            type="button"
            onClick={() => scrollto("sonic-deck")}
            aria-label={saasexplorer.title}
            className="group relative flex h-full w-full items-center justify-center rounded-full bg-slate-950 text-white"
          >
            <svg viewBox="0 0 100 100" className="spin-badge-slow h-full w-full p-1 select-none" aria-hidden="true">
              <defs>
                <path id="explorer-badge-path" d="M 50, 50 m -35, 0 a 35,35 0 1,1 70,0 a 35,35 0 1,1 -70,0" />
              </defs>
              <text fill="#A7F3D0" fontSize="9.5" fontWeight="800" letterSpacing="2.4px">
                <textPath href="#explorer-badge-path">{saasexplorer.spin}</textPath>
              </text>
            </svg>
            <ArrowRight
              className="absolute h-4 w-4 rotate-90 text-emerald-400 transition group-hover:translate-y-0.5"
              aria-hidden="true"
            />
          </button>
        </div>
      </div>
      <div className="relative mx-auto max-w-[1320px] text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#FDE68A]/70 px-4 py-1.5 text-xs font-bold-tier text-amber-950">
          <span>{saasexplorer.badge}</span>
        </div>
        <h2 className="mx-auto max-w-3xl text-3xl font-bold-tier text-slate-950 sm:text-5xl lg:text-[56px]">
          {saasexplorer.title}
        </h2>
        <p className="mx-auto mt-2.5 max-w-lg text-sm font-thin-tier text-slate-600 sm:text-base">
          {saasexplorer.copy}
        </p>
        <div className="mt-9 grid grid-cols-2 items-center gap-3.5 sm:grid-cols-4 lg:grid-cols-7">
          {saasreels.map((reel, idx) => {
            const dist = Math.abs(idx - 3);
            const heightClass =
              dist === 3
                ? "h-[250px] -rotate-2 sm:h-[270px]"
                : dist === 2
                  ? "h-[230px] rotate-1 sm:h-[245px]"
                  : dist === 1
                    ? "h-[205px] -rotate-1 sm:h-[218px]"
                    : "h-[195px] sm:h-[208px]";
            const selected = activeReel === idx;
            return (
              <div
                key={reel.title}
                role="button"
                tabIndex={0}
                aria-label={reel.title}
                onMouseEnter={() => setActiveReel(idx)}
                onClick={() => ontoast(`Playing ${reel.title}`)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") ontoast(`Playing ${reel.title}`);
                }}
                className={`group relative cursor-pointer overflow-hidden rounded-[24px] transition-all duration-300 ${heightClass} ${selected ? "z-20 scale-105 shadow-2xl ring-4 ring-slate-950" : "opacity-90 shadow-lg hover:opacity-100"} ${idx >= 4 ? "hidden sm:block" : ""} ${idx === 6 ? "hidden lg:block" : ""}`}
              >
                <div
                  className="h-full w-full transition duration-500 group-hover:scale-110"
                  style={{ background: reel.art }}
                  aria-hidden="true"
                />
                <div
                  className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent"
                  aria-hidden="true"
                />
                <div className="top-2.5 left-2.5 absolute">
                  <span className="rounded-full bg-white/90 px-2 py-0.5 text-[9px] font-bold-tier text-slate-950">
                    {reel.tag}
                  </span>
                </div>
                <div className="absolute right-3 bottom-3 left-3 text-left">
                  <h4 className="truncate text-xs font-bold-tier text-white">{reel.title}</h4>
                  <span className="block truncate text-[10px] font-thin-tier text-slate-300">{reel.creator}</span>
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-9 flex items-center justify-center gap-4">
          <div className="rounded-full border border-dashed border-[#FF6B5B] p-1.5">
            <button
              type="button"
              onClick={() => ontoast("Exploring Community Creations")}
              className="rounded-full bg-[#FF6B5B] px-7 py-3 text-xs font-bold-tier text-white shadow-[0_10px_24px_rgba(255,107,91,0.4)] transition hover:scale-105 hover:bg-[#ff5542] sm:text-sm"
            >
              {saasexplorer.key}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

/** Section 7 — the debonair sonic deck: the cream bridge with the studio
 * mark, the brand strip with the DAW line and the clock, the LOVE 2K26
 * editorial over the rose field and the track rail with the green hearts
 * (the four playable rows of the reference deck plus the two editorial
 * extras). */
export function SaasDebonair({ scrollto, ontoast }: { scrollto: (id: string) => void; ontoast: (m: string) => void }) {
  const [liked, setLiked] = useState<Record<number, boolean>>({ 1: true });
  const railRef = useRef<HTMLDivElement | null>(null);
  const nudge = (left: boolean) =>
    railRef.current?.scrollBy({ left: left ? -DEBONAIR_STEP : DEBONAIR_STEP, behavior: "smooth" });
  return (
    <section id="sonic-deck" className="overflow-hidden bg-[#0A0B0E] pt-0 pb-24 text-white sm:pb-28">
      <div className="relative z-20 mb-8 w-full">
        <div className="h-2 w-full bg-[#FAF6F0]" aria-hidden="true" />
        <div className="flex w-full justify-center">
          <SaddleTabBridge fillColor="#FAF6F0" className="h-[44px]">
            <div className="flex items-center gap-2">
              <Studiomark app="debonair" className="h-6 w-6" />
              <span className="text-xs font-bold-tier tracking-tight text-slate-950">{saasdebonair.bridge}</span>
            </div>
          </SaddleTabBridge>
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 px-6 py-4 sm:px-10">
        <div className="flex items-center gap-3">
          <Studiomark app="debonair" className="h-9 w-9" />
          <span className="text-[15px] font-bold-tier text-white">{saasdebonair.brand}</span>
          <span className="ml-2 text-[11px] font-thin-tier text-slate-400">{saasdebonair.sub}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
          <span className="text-xs font-thin-tier text-slate-400">{saasdebonair.clock}</span>
        </div>
      </div>
      <div className="mx-auto mt-12 max-w-[1360px] px-6 sm:px-10 lg:px-16">
        <div className="group relative h-[380px] overflow-hidden rounded-[32px] sm:h-[420px]">
          <div
            className="absolute inset-0 h-full w-full transition duration-700 group-hover:scale-105"
            style={{ background: saasdebonairheroart }}
            aria-hidden="true"
          />
          <div
            className="absolute inset-0 bg-gradient-to-t from-[#090D16] via-[#090D16]/40 to-transparent"
            aria-hidden="true"
          />
          <div className="absolute bottom-0 left-0 max-w-2xl p-8 sm:p-12">
            <span className="text-[11px] font-bold-tier tracking-[0.25em] text-slate-300 uppercase">
              {saasdebonair.editorial}
            </span>
            <h3 className="mt-3 text-5xl font-bold-tier text-white sm:text-7xl">
              {saasdebonair.herotitlea}
              <br />
              {saasdebonair.herotitleb}
            </h3>
            <p className="mt-2 text-[13px] font-thin-tier text-slate-300">{saasdebonair.herocopy}</p>
            <div className="mt-6 flex items-center gap-3">
              <button
                type="button"
                onClick={() => ontoast("Playing No Ordinary Love")}
                className="flex items-center gap-2 rounded-lg bg-white px-7 py-3 text-sm font-bold-tier text-slate-950 transition hover:bg-slate-200"
              >
                <Play className="h-4 w-4 fill-current" aria-hidden="true" />
                <span>{saasdebonair.play}</span>
              </button>
              <button
                type="button"
                onClick={() => scrollto("advisor-dark")}
                className="rounded-lg border border-white/25 bg-white/10 px-7 py-3 text-sm font-bold-tier text-white transition hover:bg-white/20"
              >
                {saasdebonair.openkey}
              </button>
            </div>
          </div>
        </div>
        <div className="mt-14">
          <div className="mb-6 flex items-center justify-between">
            <h4 className="text-base font-bold-tier text-white sm:text-lg">{saasdebonair.railtitle}</h4>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => nudge(true)}
                aria-label="Scroll rail left"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white transition hover:bg-white/20"
              >
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => nudge(false)}
                aria-label="Scroll rail right"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white transition hover:bg-white/20"
              >
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>
          <div ref={railRef} className="rail-scroll mask-fade-x flex gap-5 overflow-x-auto pb-4 scroll-smooth">
            {saasdebonairrail.map((track) => (
              <div
                key={track.title}
                role="button"
                tabIndex={0}
                aria-label={track.title}
                onClick={() => ontoast(`Playing ${track.title}`)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") ontoast(`Playing ${track.title}`);
                }}
                className="group w-[220px] shrink-0 cursor-pointer snap-start"
              >
                <div className="relative h-[220px] overflow-hidden rounded-2xl">
                  <div
                    className="h-full w-full transition duration-500 group-hover:scale-105"
                    style={{ background: track.art }}
                    aria-hidden="true"
                  />
                </div>
                <div className="pt-4">
                  <h5 className="truncate text-sm font-bold-tier text-white">{track.title}</h5>
                  <span className="mt-0.5 block truncate text-xs font-thin-tier text-slate-400">{track.artist}</span>
                  <div className="mt-1.5 flex items-center justify-between">
                    <span className="text-[11px] font-thin-tier text-slate-500">{track.total}</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (track.index != null)
                          setLiked((prev) => ({ ...prev, [track.index as number]: !prev[track.index as number] }));
                      }}
                      aria-label={track.title}
                    >
                      <Heart
                        className={`h-4 w-4 ${track.index != null && liked[track.index] ? "fill-[#1DB954] text-[#1DB954]" : "text-slate-500"}`}
                        aria-hidden="true"
                      />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/** Section 8 — the doo advisor: the dark bridge with the doo mark, the
 * statement, the two keys, the three stat tiles and the demo chat on the
 * scooped dark card — the question bubble, the indigo reply and the input
 * pill that answers with the visitor's own words. */
export function SaasAdvisor({ scrollto, ontoast }: { scrollto: (id: string) => void; ontoast: (m: string) => void }) {
  const [dooinput, setDooinput] = useState("");
  const [dooreply, setDooreply] = useState(saasadvisor.chat.reply);
  const send = () => {
    if (!dooinput.trim()) return;
    setDooreply(dooinput);
    setDooinput("");
    ontoast("Doo replied");
  };
  return (
    <section id="advisor-dark" className="relative overflow-hidden bg-white px-6 pt-0 pb-24 sm:px-10 sm:pb-32 lg:px-16">
      <div className="relative z-20 mb-12 w-full">
        <div className="h-2 w-full bg-[#0A0B0E]" aria-hidden="true" />
        <div className="flex w-full justify-center">
          <SaddleTabBridge fillColor="#0A0B0E" className="h-[44px]">
            <div className="flex items-center gap-2">
              <Studiomark app="doo" className="h-6 w-6" />
              <span className="text-xs font-bold-tier tracking-tight text-slate-100">{saasadvisor.bridge}</span>
            </div>
          </SaddleTabBridge>
        </div>
      </div>
      <div className="mx-auto grid max-w-[1360px] grid-cols-1 items-center gap-12 lg:grid-cols-12">
        <div className="lg:col-span-6">
          <div className="stat-tile mb-6 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[11px] font-medium-tier text-slate-600">
            <MessageSquare className="h-3.5 w-3.5 text-indigo-600" aria-hidden="true" />
            <span>{saasadvisor.badge}</span>
          </div>
          <h2 className="text-4xl leading-[1.02] font-bold-tier text-slate-950 sm:text-[56px]">
            {saasadvisor.titlea}
            <br />
            {saasadvisor.titleb}
          </h2>
          <p className="mt-6 max-w-md text-[15px] font-thin-tier text-slate-500">{saasadvisor.copy}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => ontoast("Portfolio drafted")}
              className="btn-tactile-3d rounded-full px-6 py-3 text-[13px] font-bold-tier text-white"
            >
              {saasadvisor.keyprimary}
            </button>
            <button
              type="button"
              onClick={() => scrollto("workspace-subapps")}
              className="surface-card rounded-full px-6 py-3 text-[13px] font-medium-tier text-slate-900"
            >
              {saasadvisor.keysecondary}
            </button>
          </div>
          <div className="mt-10 grid max-w-md grid-cols-3 gap-4">
            {saasadvisor.stats.map(([figure, label]) => (
              <div key={label} className="stat-tile rounded-2xl p-4 text-center">
                <span className="block text-xl font-bold-tier">{figure}</span>
                <span className="text-[11px] font-thin-tier text-slate-500">{label}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="lg:col-span-6">
          <ScoopedCard surfaceClassName="flex min-h-[440px] flex-col justify-between border border-white/15 bg-[#0B0D16] p-8 text-white sm:p-10">
            <div>
              <div className="flex items-center gap-3">
                <Studiomark app="doo" className="h-11 w-11" />
                <div>
                  <h3 className="text-base font-bold-tier">{saasadvisor.chat.name}</h3>
                  <p className="text-xs font-thin-tier text-slate-400">{saasadvisor.chat.status}</p>
                </div>
              </div>
              <div className="mt-8 space-y-4">
                <div className="max-w-[85%] rounded-2xl rounded-tl-md border border-white/10 bg-white/10 p-4 text-sm font-thin-tier">
                  {saasadvisor.chat.question}
                </div>
                <div className="ml-auto max-w-[85%] rounded-2xl rounded-tr-md bg-indigo-600 p-4 text-sm font-medium-tier">
                  {dooreply}
                </div>
              </div>
            </div>
            <div className="mt-8 flex items-center gap-2.5 rounded-full border border-white/12 bg-white/[0.06] p-2">
              <input
                value={dooinput}
                onChange={(e) => setDooinput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") send();
                }}
                placeholder={saasadvisor.chat.placeholder}
                aria-label={saasadvisor.chat.placeholder}
                className="flex-1 bg-transparent px-4 text-sm outline-none placeholder:text-slate-500"
              />
              <button
                type="button"
                onClick={send}
                aria-label="Send"
                className="btn-tactile-3d flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white"
              >
                <Send className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </ScoopedCard>
        </div>
      </div>
    </section>
  );
}

/** Section 9 — the editorial footer over the second sawtooth ribbon: the
 * brand row with the launch key, the four reference link columns (the
 * internal rows scroll the landing, the Explorer row walks the entry chain
 * to the free exploration face, the Company rows stay the plain spans of
 * the reference) and the base row with the three round keys. */
export function SaasFooter({
  onenter,
  onexplore,
  scrollto,
  ontoast,
}: {
  onenter: () => void;
  onexplore: () => void;
  scrollto: (id: string) => void;
  ontoast: (m: string) => void;
}) {
  return (
    <>
      <div className="ribbon-sawtooth-divider" aria-hidden="true" />
      <section
        id="editorial-bio"
        className="relative border-t border-slate-200/80 bg-[#F2F5FC] px-6 pt-20 pb-10 sm:px-10 lg:px-16"
      >
        <div className="mx-auto max-w-[1360px]">
          <div className="grid grid-cols-1 gap-12 pb-14 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <div className="flex items-center gap-2.5 text-slate-950">
                <SolLogoMark size={20} title="DevThink" />
                <SolWordmark height={12} />
              </div>
              <p className="mt-6 max-w-sm text-sm font-thin-tier text-slate-500">{saasfooter.tagline}</p>
              <div className="mt-8 flex gap-3">
                <button
                  type="button"
                  onClick={onenter}
                  className="btn-tactile-3d flex items-center gap-2 rounded-full px-6 py-3 text-[13px] font-bold-tier text-white"
                >
                  {saasfooter.launch}
                  <ArrowUpRight className="h-4 w-4 text-sky-400" aria-hidden="true" />
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-8 sm:grid-cols-4 lg:col-span-7">
              {saasfooter.columns.map((column) => (
                <div key={column.title}>
                  <h4 className="mb-4 text-xs font-bold-tier tracking-wider text-slate-900 uppercase">
                    {column.title}
                  </h4>
                  <div className="space-y-2.5 text-sm font-thin-tier text-slate-500">
                    {column.links.map((link) => {
                      if (link.route)
                        return (
                          <button
                            key={link.label}
                            type="button"
                            onClick={onexplore}
                            className="block transition hover:text-slate-900"
                          >
                            {link.label}
                          </button>
                        );
                      if (link.target)
                        return (
                          <button
                            key={link.label}
                            type="button"
                            onClick={() => scrollto(link.target as string)}
                            className="block transition hover:text-slate-900"
                          >
                            {link.label}
                          </button>
                        );
                      return (
                        <span key={link.label} className="block">
                          {link.label}
                        </span>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex flex-col items-center justify-between gap-4 border-t border-slate-200/80 pt-8 sm:flex-row">
            <span className="text-xs font-thin-tier text-slate-400">{saasfooter.base}</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => scrollto("hero-os")}
                aria-label="Home"
                className="icon-frame-3d flex h-9 w-9 items-center justify-center rounded-full text-slate-600"
              >
                <Globe className="h-4 w-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => ontoast("Shared")}
                aria-label="Share"
                className="icon-frame-3d flex h-9 w-9 items-center justify-center rounded-full text-slate-600"
              >
                <Share2 className="h-4 w-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                aria-label="Back to top"
                className="icon-frame-3d flex h-9 w-9 items-center justify-center rounded-full text-slate-600"
              >
                <Maximize2 className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
