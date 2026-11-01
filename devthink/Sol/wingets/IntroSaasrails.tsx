/**
 * saasrails.tsx — the media sections of the SaaS face: the Cadria top ten
 * with its hero, the explorer reel wall, the Debonair track rail, the Doo
 * advisor demo and the footer. Loose components of the intro page. The
 * launch paths funnel to the enter callback — the login face is the next
 * page of the chain and the panel stays last — while the footer Explorer
 * row walks the entry chain through the free exploration face (/explore)
 * and the demo actions speak the reference toasts through the page pill.
 * All copy rides the landing data layer (saascontent.ts) and the glyphs
 * ride the fluent set.
 */

import {
  ArrowLeftRegular as Arrowleft,
  ArrowRightRegular as Arrowright,
  ArrowUpRightRegular as Arrowupright,
  ClockRegular as Clock,
  GlobeRegular as Globe,
  HeartRegular as Heart,
  MaximizeRegular as Maximize,
  ChatRegular as Messagesquare,
  PlayRegular as Play,
  AddRegular as Plus,
  SendRegular as Send,
  ShareRegular as Share,
} from "@fluentui/react-icons";
import { useState } from "react";
import {
  saascadria,
  saasdebonair,
  saasdoo,
  saasexplorer,
  saasfilms,
  saasflow,
  saasfooter,
  saasreels,
  saastoasts,
  saastracks,
} from "../../saascontent.ts";
import { SaddleTabBridge, ScoopedCard, Studiomark } from "./IntroSaaskit.tsx";
import { SolLogoMark, SolWordmark } from "./PanelLogo.tsx";

type SectionProps = {
  /** the enter action: every launch path of the landing funnels to the login face */
  onenter: () => void;
  /** the smooth scroll to a landing section id */
  scrollto: (id: string) => void;
};

/** The footer copy contract: the enter action, the explore walker of the
 * entry chain, the internal scroll and the toast channel. */
type FooterProps = SectionProps & {
  onexplore: () => void;
  showtoast: (message: string) => void;
};

/** The sawtooth ribbon divider with the whitewash center. */
export function SaasRibbon() {
  return (
    <div className="relative">
      <div className="ribbon-sawtooth-divider" />
      <div className="absolute inset-0 flex justify-center">
        <div className="ribbon-whitewash-center" />
      </div>
    </div>
  );
}

/** The studio flow strip between the fan deck and Cadria. */
export function SaasFlowStrip({ scrollto }: Pick<SectionProps, "scrollto">) {
  return (
    <section id="studio-flow" className="w-full bg-[#F9F6F0] px-6 py-14 text-center text-slate-950">
      <div className="mb-4 inline-flex items-center rounded-full bg-slate-950 px-4 py-1.5 text-xs font-extrabold tracking-[-0.035em] text-white">
        <span>{saasflow.badge}</span>
      </div>
      <h2 className="mx-auto max-w-3xl text-3xl font-extrabold tracking-[-0.035em] sm:text-5xl">{saasflow.heading}</h2>
      <p className="mx-auto mt-3 max-w-lg text-sm font-normal tracking-[-0.005em] text-slate-600 sm:text-base">
        {saasflow.copy}
      </p>
      <button
        type="button"
        onClick={() => scrollto("spatial-bento")}
        className="mt-6 rounded-full bg-slate-950 px-7 py-3 text-xs font-extrabold tracking-[-0.035em] text-white transition hover:scale-105 active:scale-95 sm:text-sm"
      >
        {saasflow.cta}
      </button>
    </section>
  );
}

/** The Cadria section: the category tabs, the film hero, the top ten rail
 * with the giant rank numerals and the live TV banner. */
export function SaasCadria({ showtoast }: { showtoast: (message: string) => void }) {
  const [category, setCategory] = useState<string>("trending");
  const [hero, setHero] = useState({
    title: saascadria.hero.title,
    ep: saascadria.hero.ep,
    image: saascadria.hero.image,
  });
  const rows = category === "trending" ? saasfilms : saasfilms.filter((film) => film.category === category);
  return (
    <section
      id="spatial-bento"
      className="relative overflow-hidden border-t border-white/10 bg-[#0B0D14] pt-0 pb-24 text-white sm:pb-28"
    >
      <div className="mb-12 w-full inset-x-0 top-0">
        <div className="h-2 w-full bg-[#1E293B]" />
        <div className="-mt-[1px] flex w-full items-start justify-center gap-4 px-6 sm:gap-8">
          <div className="flex items-center gap-2.5 pt-2">
            <Studiomark app="cadria" className="h-9 w-9" />
            <span className="text-lg font-extrabold tracking-[-0.035em] text-white">{saascadria.brand}</span>
          </div>
          <SaddleTabBridge fillColor="#1E293B" className="h-[48px]">
            <div className="flex items-center gap-2">
              {saascadria.tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setCategory(tab.id)}
                  className={`rounded-xl px-3 py-1.5 text-xs font-semibold tracking-[-0.018em] transition active:scale-[0.97] ${category === tab.id ? "bg-white text-slate-950" : "bg-white/10 text-slate-200 hover:bg-white/20"}`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </SaddleTabBridge>
        </div>
      </div>

      <div className="mx-auto max-w-[1360px] px-6 sm:px-10 lg:px-16">
        <div className="group relative h-[400px] overflow-hidden rounded-[32px] border border-white/15 sm:h-[500px]">
          <img
            src={hero.image}
            alt={hero.title}
            className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#090D16] via-[#090D16]/40 to-transparent" />
          <div className="absolute bottom-0 left-0 max-w-2xl p-8 sm:p-12">
            <div className="flex items-center gap-2">
              <span className="rounded bg-[#E50914] px-2 py-1 text-[10px] font-extrabold tracking-[-0.035em] text-white">
                N
              </span>
              <span className="text-[11px] font-extrabold tracking-[0.2em] text-slate-300 uppercase">
                {saascadria.original}
              </span>
            </div>
            <h3 className="mt-3 text-5xl font-extrabold tracking-[-0.035em] text-white uppercase sm:text-7xl">
              {hero.title}
            </h3>
            <p className="mt-2 text-[13px] font-semibold tracking-[-0.018em] text-emerald-400">
              {saascadria.hero.match} {hero.ep}
            </p>
            <div className="mt-6 flex items-center gap-3">
              <button
                type="button"
                onClick={() => showtoast(`${saastoasts.playing} ${hero.title}`)}
                className="flex items-center gap-2 rounded-lg bg-white px-7 py-3 text-sm font-extrabold tracking-[-0.035em] text-slate-950 transition hover:bg-slate-200 active:scale-[0.97]"
              >
                <Play className="h-4 w-4 fill-current" aria-hidden="true" />
                <span>{saascadria.play}</span>
              </button>
              <button
                type="button"
                onClick={() => showtoast(saastoasts.addedlist)}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-white/30 bg-black/50 text-white transition hover:bg-white/20 active:scale-[0.97]"
                aria-label="My List"
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>

        <div className="mt-16">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="rounded bg-[#E50914] px-2 py-1 text-[11px] font-extrabold tracking-[-0.035em] text-white">
                {saascadria.top10}
              </span>
              <h4 className="text-base font-extrabold tracking-[-0.035em] text-white sm:text-lg">
                {saascadria.railheading}
              </h4>
            </div>
            <div className="flex items-center gap-2">
              <span className="hidden text-xs font-normal tracking-[-0.005em] text-slate-400 sm:block">
                {saascadria.previewhint}
              </span>
              <button
                type="button"
                onClick={() => document.getElementById("cadria-rail")?.scrollBy({ left: -540, behavior: "smooth" })}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white transition hover:bg-white/20 active:scale-90"
                aria-label="Scroll back"
              >
                <Arrowleft className="h-4 w-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => document.getElementById("cadria-rail")?.scrollBy({ left: 540, behavior: "smooth" })}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white transition hover:bg-white/20 active:scale-90"
                aria-label="Scroll forward"
              >
                <Arrowright className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>
          <div id="cadria-rail" className="rail-scroll mask-fade-x flex gap-8 overflow-x-auto pb-4 scroll-smooth">
            {rows.map((film) => {
              const preview = () => {
                setHero({ title: film.title, ep: `${film.tag} ${film.duration}`, image: film.image });
                showtoast(`${saastoasts.loaded} ${film.title}`);
              };
              return (
                <button
                  type="button"
                  key={film.rank}
                  onClick={preview}
                  className="group w-[220px] shrink-0 cursor-pointer snap-start border-0 bg-transparent p-0 text-left"
                >
                  <div className="relative h-[300px] overflow-hidden rounded-2xl">
                    <img
                      src={film.image}
                      alt={film.title}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="flex items-center gap-3 pt-4">
                    <span className="netflix-rank-num text-5xl font-extrabold tracking-[-0.035em]">{film.rank}</span>
                    <div className="min-w-0">
                      <h5 className="truncate text-sm font-extrabold tracking-[-0.035em] text-white">{film.title}</h5>
                      <span className="mt-1 block text-[10px] font-extrabold tracking-[0.18em] text-slate-500">
                        {film.tag}
                      </span>
                      <span className="mt-0.5 block text-xs font-semibold tracking-[-0.018em] text-emerald-400">
                        {film.match}
                      </span>
                      <span className="block text-[11px] font-normal tracking-[-0.005em] text-slate-400">
                        {film.duration}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="group relative mt-14 overflow-hidden rounded-[32px]">
          <img
            src={saascadria.liveimage}
            alt={saascadria.livealt}
            className="h-[300px] w-full object-cover transition duration-700 group-hover:scale-105 sm:h-[340px]"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#E50914]/90 via-[#E50914]/40 to-black/70" />
          <div className="absolute inset-0 flex flex-col items-start justify-between gap-6 p-8 sm:flex-row sm:items-center sm:p-10">
            <div>
              <div className="flex items-center gap-2.5">
                <span className="rounded bg-white px-2 py-1 text-[11px] font-extrabold tracking-[-0.035em] text-[#E50914]">
                  {saascadria.livebadge}
                </span>
                <span className="text-[11px] font-extrabold tracking-[0.2em] text-white">{saascadria.livetitle}</span>
              </div>
              <p className="mt-3 text-sm font-normal tracking-[-0.005em] text-white/85">{saascadria.livecopy}</p>
            </div>
            <button
              type="button"
              onClick={() => showtoast(saastoasts.livetv)}
              className="flex shrink-0 items-center gap-2 rounded-lg bg-white px-7 py-3 text-sm font-extrabold tracking-[-0.035em] text-slate-950 transition active:scale-[0.97]"
            >
              <Play className="h-4 w-4 fill-current" aria-hidden="true" />
              <span>{saascadria.watchlive}</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

/** The explorer wall: the unified feed of reels with the spinning badge. */
export function SaasExplorerWall({ showtoast }: { showtoast: (message: string) => void }) {
  const [active, setActive] = useState(3);
  return (
    <section
      id="explorer-wall"
      className="relative overflow-visible bg-[#FAF6F0] px-4 pt-14 pb-14 text-slate-950 sm:px-8 lg:px-14 xl:pl-20"
    >
      <div className="absolute -top-9 left-1/2 z-30 flex -translate-x-1/2 items-center justify-center">
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#FAF6F0] p-2 shadow-[0_-10px_25px_rgba(0,0,0,0.25)]">
          <button
            type="button"
            onClick={() => showtoast(saastoasts.community)}
            className="group relative flex h-full w-full items-center justify-center rounded-full bg-slate-950 text-white"
          >
            <svg viewBox="0 0 100 100" className="spin-badge-slow h-full w-full select-none p-1" aria-hidden="true">
              <defs>
                <path id="dtbadgepath" d="M 50, 50 m -35, 0 a 35,35 0 1,1 70,0 a 35,35 0 1,1 -70,0" />
              </defs>
              <text fill="#A7F3D0" fontSize="9.5" fontWeight="800" letterSpacing="2.4px">
                <textPath href="#dtbadgepath">{saasexplorer.badgepath}</textPath>
              </text>
            </svg>
            <Arrowright
              className="absolute h-4 w-4 rotate-90 text-emerald-400 transition group-hover:translate-y-0.5"
              aria-hidden="true"
            />
          </button>
        </div>
      </div>
      <div className="relative mx-auto max-w-[1320px] text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#FDE68A]/70 px-4 py-1.5 text-xs font-extrabold tracking-[-0.035em] text-amber-950">
          <span>{saasexplorer.badge}</span>
        </div>
        <h2 className="mx-auto max-w-3xl text-3xl font-extrabold tracking-[-0.035em] text-slate-950 sm:text-5xl lg:text-[56px]">
          {saasexplorer.heading}
        </h2>
        <p className="mx-auto mt-2.5 max-w-lg text-sm font-normal tracking-[-0.005em] text-slate-600 sm:text-base">
          {saasexplorer.copy}
        </p>
        <div className="mt-9 grid grid-cols-2 items-center gap-3.5 sm:grid-cols-4 lg:grid-cols-7">
          {saasreels.map((reel, index) => {
            const distance = Math.abs(index - 3);
            const height =
              distance === 3
                ? "h-[250px] sm:h-[270px] -rotate-2"
                : distance === 2
                  ? "h-[230px] sm:h-[245px] rotate-1"
                  : distance === 1
                    ? "h-[205px] sm:h-[218px] -rotate-1"
                    : "h-[195px] sm:h-[208px]";
            const selected = active === index;
            return (
              <button
                type="button"
                key={reel.title}
                onMouseEnter={() => setActive(index)}
                onClick={() => showtoast(`${saastoasts.playing} ${reel.title}`)}
                className={`group relative cursor-pointer overflow-hidden rounded-[24px] border-0 bg-transparent p-0 transition-[transform,box-shadow,opacity] duration-300 ${height} ${selected ? "z-20 scale-105 ring-4 ring-slate-950 shadow-2xl" : "opacity-90 shadow-lg hover:opacity-100"} ${index >= 4 ? "hidden sm:block" : ""} ${index === 6 ? "hidden lg:block" : ""}`}
              >
                <img
                  src={reel.image}
                  alt={reel.title}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent" />
                <div className="absolute top-2.5 left-2.5">
                  <span className="rounded-full bg-white/90 px-2 py-0.5 text-[9px] font-extrabold tracking-[-0.035em] text-slate-950">
                    {reel.tag}
                  </span>
                </div>
                <div className="absolute inset-x-3 bottom-3 text-left">
                  <h4 className="truncate text-xs font-extrabold tracking-[-0.035em] text-white">{reel.title}</h4>
                  <span className="block truncate text-[10px] font-normal tracking-[-0.005em] text-slate-300">
                    {reel.creator}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
        <div className="mt-9 flex items-center justify-center gap-4">
          <div className="rounded-full border border-dashed border-[#FF6B5B] p-1.5">
            <button
              type="button"
              onClick={() => showtoast(saastoasts.community)}
              className="rounded-full bg-[#FF6B5B] px-7 py-3 text-xs font-extrabold tracking-[-0.035em] text-white shadow-[0_10px_24px_rgba(255,107,91,0.4)] transition hover:scale-105 hover:bg-[#ff5542] active:scale-95 sm:text-sm"
            >
              {saasexplorer.cta}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

/** The Debonair section: the editorial hero and the trending track rail. */
export function SaasDebonair({
  showtoast,
  scrollto,
}: { showtoast: (message: string) => void } & Pick<SectionProps, "scrollto">) {
  const [liked, setLiked] = useState<Record<number, boolean>>({ 1: true });
  const [track, setTrack] = useState(1);
  return (
    <section id="sonic-deck" className="overflow-hidden bg-[#0A0B0E] pt-0 pb-24 text-white sm:pb-28">
      <div className="relative z-20 mb-8 w-full inset-x-0 top-0">
        <div className="h-2 w-full bg-[#FAF6F0]" />
        <div className="flex w-full justify-center">
          <SaddleTabBridge fillColor="#FAF6F0" className="h-[44px]">
            <div className="flex items-center gap-2">
              <Studiomark app="debonair" className="h-6 w-6" />
              <span className="text-xs font-extrabold tracking-tight text-slate-950">{saasdebonair.bridge}</span>
            </div>
          </SaddleTabBridge>
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 px-6 py-4 sm:px-10">
        <div className="flex items-center gap-3">
          <Studiomark app="debonair" className="h-9 w-9" />
          <span className="text-[15px] font-extrabold tracking-[-0.035em] text-white">{saasdebonair.brand}</span>
          <span className="ml-2 text-[11px] font-normal tracking-[-0.005em] text-slate-400">
            {saasdebonair.dawlabel}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
          <span className="text-xs font-normal tracking-[-0.005em] text-slate-400">{saasdebonair.clock}</span>
        </div>
      </div>
      <div className="mx-auto mt-12 max-w-[1360px] px-6 sm:px-10 lg:px-16">
        <div className="group relative h-[380px] overflow-hidden rounded-[32px] sm:h-[420px]">
          <img
            src={saasdebonair.heroimage}
            alt={saasdebonair.heroalt}
            className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#090D16] via-[#090D16]/40 to-transparent" />
          <div className="absolute bottom-0 left-0 max-w-2xl p-8 sm:p-12">
            <span className="text-[11px] font-extrabold tracking-[0.25em] text-slate-300 uppercase">
              {saasdebonair.editorial}
            </span>
            <h3 className="mt-3 text-5xl font-extrabold tracking-[-0.035em] text-white sm:text-7xl">
              {saasdebonair.titlea}
              <br />
              {saasdebonair.titleb}
            </h3>
            <p className="mt-2 text-[13px] font-normal tracking-[-0.005em] text-slate-300">{saasdebonair.copy}</p>
            <div className="mt-6 flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setTrack(2);
                  showtoast(saastoasts.noordinary);
                }}
                className="flex items-center gap-2 rounded-lg bg-white px-7 py-3 text-sm font-extrabold tracking-[-0.035em] text-slate-950 transition hover:bg-slate-200 active:scale-[0.97]"
              >
                <Play className="h-4 w-4 fill-current" aria-hidden="true" />
                <span>{saasdebonair.play}</span>
              </button>
              <button
                type="button"
                onClick={() => scrollto("advisor-dark")}
                className="rounded-lg border border-white/25 bg-white/10 px-7 py-3 text-sm font-extrabold tracking-[-0.035em] text-white transition hover:bg-white/20 active:scale-[0.97]"
              >
                {saasdebonair.opendaw}
              </button>
            </div>
          </div>
        </div>
        <div className="mt-14">
          <div className="mb-6 flex items-center justify-between">
            <h4 className="text-base font-extrabold tracking-[-0.035em] text-white sm:text-lg">
              {saasdebonair.railheading}
            </h4>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => document.getElementById("debonair-rail")?.scrollBy({ left: -480, behavior: "smooth" })}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white transition hover:bg-white/20 active:scale-90"
                aria-label="Scroll back"
              >
                <Arrowleft className="h-4 w-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => document.getElementById("debonair-rail")?.scrollBy({ left: 480, behavior: "smooth" })}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white transition hover:bg-white/20 active:scale-90"
                aria-label="Scroll forward"
              >
                <Arrowright className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>
          <div id="debonair-rail" className="rail-scroll mask-fade-x flex gap-5 overflow-x-auto pb-4 scroll-smooth">
            {saastracks.map((row) => {
              const link = row.link;
              return (
                <div
                  key={row.title}
                  role="button"
                  tabIndex={0}
                  aria-current={link === track ? "true" : undefined}
                  onClick={() => {
                    if (link !== null) setTrack(link);
                    showtoast(`${saastoasts.playing} ${row.title}`);
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") showtoast(`${saastoasts.playing} ${row.title}`);
                  }}
                  className="group w-[220px] shrink-0 cursor-pointer snap-start"
                >
                  <div className="relative h-[220px] overflow-hidden rounded-2xl">
                    <img
                      src={row.cover}
                      alt={row.title}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="pt-4">
                    <h5 className="truncate text-sm font-extrabold tracking-[-0.035em] text-white">{row.title}</h5>
                    <span className="mt-0.5 block truncate text-xs font-normal tracking-[-0.005em] text-slate-400">
                      {row.artist}
                    </span>
                    <div className="mt-1.5 flex items-center justify-between">
                      <span className="text-[11px] font-normal tracking-[-0.005em] text-slate-500">{row.total}</span>
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          if (link !== null) setLiked((current) => ({ ...current, [link]: !current[link] }));
                        }}
                        aria-label="Like"
                      >
                        <Heart
                          className={`h-4 w-4 ${link !== null && liked[link] ? "fill-[#1DB954] text-[#1DB954]" : "text-slate-500"}`}
                          aria-hidden="true"
                        />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

/** The Doo section: the advisor statement with the working demo chat card. */
export function SaasDoo({
  showtoast,
  scrollto,
}: { showtoast: (message: string) => void } & Pick<SectionProps, "scrollto">) {
  const [draft, setDraft] = useState("");
  const [reply, setReply] = useState(saasdoo.reply);
  const send = () => {
    if (!draft.trim()) return;
    setReply(draft);
    setDraft("");
    showtoast(saastoasts.dooroo);
  };
  return (
    <section id="advisor-dark" className="relative overflow-hidden bg-white px-6 pt-0 pb-24 sm:px-10 sm:pb-32 lg:px-16">
      <div className="relative z-20 mb-12 w-full inset-x-0 top-0">
        <div className="h-2 w-full bg-[#0A0B0E]" />
        <div className="flex w-full justify-center">
          <SaddleTabBridge fillColor="#0A0B0E" className="h-[44px]">
            <div className="flex items-center gap-2">
              <Studiomark app="doo" className="h-6 w-6" />
              <span className="text-xs font-extrabold tracking-tight text-slate-100">{saasdoo.bridge}</span>
            </div>
          </SaddleTabBridge>
        </div>
      </div>
      <div className="mx-auto grid max-w-[1360px] grid-cols-1 items-center gap-12 lg:grid-cols-12">
        <div className="lg:col-span-6">
          <div className="stat-tile mb-6 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[11px] font-semibold tracking-[-0.018em] text-slate-600">
            <Messagesquare className="h-3.5 w-3.5 text-violet-600" aria-hidden="true" />
            <span>{saasdoo.badge}</span>
          </div>
          <h2 className="text-4xl leading-[1.02] font-extrabold tracking-[-0.035em] text-slate-950 sm:text-[56px]">
            {saasdoo.headinga}
            <br />
            {saasdoo.headingb}
          </h2>
          <p className="mt-6 max-w-md text-[15px] font-normal tracking-[-0.005em] text-slate-500">{saasdoo.copy}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => showtoast(saastoasts.portfolio)}
              className="btn-tactile-3d rounded-full px-6 py-3 text-[13px] font-extrabold tracking-[-0.035em] text-white"
            >
              {saasdoo.primary}
            </button>
            <button
              type="button"
              onClick={() => scrollto("workspace-subapps")}
              className="surface-card rounded-full px-6 py-3 text-[13px] font-semibold tracking-[-0.018em] text-slate-900"
            >
              {saasdoo.secondary}
            </button>
          </div>
          <div className="mt-10 grid max-w-md grid-cols-3 gap-4">
            {saasdoo.stats.map(([value, label]) => (
              <div key={label} className="stat-tile rounded-2xl p-4 text-center">
                <span className="block text-xl font-extrabold tracking-[-0.035em]">{value}</span>
                <span className="text-[11px] font-normal tracking-[-0.005em] text-slate-500">{label}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="lg:col-span-6">
          <ScoopedCard surface="flex min-h-[440px] flex-col justify-between border border-white/15 bg-[#0B0D16] p-8 text-white sm:p-10">
            <div>
              <div className="flex items-center gap-3">
                <Studiomark app="doo" className="h-11 w-11" />
                <div>
                  <h3 className="text-base font-extrabold tracking-[-0.035em]">{saasdoo.name}</h3>
                  <p className="text-xs font-normal tracking-[-0.005em] text-slate-400">{saasdoo.status}</p>
                </div>
              </div>
              <div className="mt-8 space-y-4">
                <div className="max-w-[85%] rounded-2xl rounded-tl-md border border-white/10 bg-white/10 p-4 text-sm font-normal tracking-[-0.005em]">
                  {saasdoo.question}
                </div>
                <div className="ml-auto max-w-[85%] rounded-2xl rounded-tr-md bg-violet-600 p-4 text-sm font-semibold tracking-[-0.018em]">
                  {reply}
                </div>
              </div>
            </div>
            <div className="mt-8 flex items-center gap-2.5 rounded-full border border-white/12 bg-white/[0.06] p-2">
              <input
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") send();
                }}
                placeholder={saasdoo.placeholder}
                className="flex-1 bg-transparent px-4 text-sm outline-none placeholder:text-slate-500"
                aria-label="Ask Doo"
              />
              <button
                type="button"
                onClick={send}
                className="btn-tactile-3d flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white"
                aria-label="Send"
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

/** The footer: the brand row with the launch key, the link columns (the
 * internal rows scroll the landing, the Explorer row walks the entry
 * chain to the free exploration face) and the base row. */
export function SaasFooter({ onenter, onexplore, scrollto, showtoast }: FooterProps) {
  return (
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
            <p className="mt-6 max-w-sm text-sm font-normal tracking-[-0.005em] text-slate-500">{saasfooter.tagline}</p>
            <div className="mt-8 flex gap-3">
              <button
                type="button"
                onClick={onenter}
                className="btn-tactile-3d flex items-center gap-2 rounded-full px-6 py-3 text-[13px] font-extrabold tracking-[-0.035em] text-white"
              >
                {saasfooter.launch}
                <Arrowupright className="h-4 w-4 text-fuchsia-400" aria-hidden="true" />
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-8 lg:col-span-7 sm:grid-cols-4">
            {saasfooter.columns.map((column) => (
              <div key={column.title}>
                <h4 className="mb-4 text-xs font-extrabold tracking-wider text-slate-900 uppercase">{column.title}</h4>
                <div className="space-y-2.5 text-sm font-normal tracking-[-0.005em] text-slate-500">
                  {column.links.map((link) => {
                    const target = link.target;
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
                    if (target)
                      return (
                        <button
                          key={link.label}
                          type="button"
                          onClick={() => scrollto(target)}
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
          <span className="text-xs font-normal tracking-[-0.005em] text-slate-400">{saasfooter.base}</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => scrollto("hero-os")}
              className="icon-frame-3d flex h-9 w-9 items-center justify-center rounded-full text-slate-600"
              aria-label="Website"
            >
              <Globe className="h-4 w-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => showtoast(saastoasts.shared)}
              className="icon-frame-3d flex h-9 w-9 items-center justify-center rounded-full text-slate-600"
              aria-label="Share"
            >
              <Share className="h-4 w-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="icon-frame-3d flex h-9 w-9 items-center justify-center rounded-full text-slate-600"
              aria-label="Top"
            >
              <Maximize className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
