/**
 * saassections.tsx — the opening sections of the SaaS face, restored by
 * PR8 P1 to the nine-section reference landing: the hero-os statement with
 * the inline engine switch on the four-stop drift and the three scooped
 * proof cards, the creators-doo deck with its swing cards and the two
 * creator profiles, the workspace-subapps obsidian fan deck cycling every
 * 4.5s, and the sawtooth ribbon that hands into the studio flow bed. The
 * hero statement rides the ui store rows (the intro.hero.* rows of
 * uistore.ts — the exact reference words), every deck rides the landing
 * data layer (saascontent.ts) and the glyphs ride the lucide set of the
 * reference. The reference photography died with the owner image ban: the
 * avatars answer as gradient chips and the hero cards carry no photos at
 * all. Loose components of the intro page — the anchor (intro.tsx) mounts
 * the page (saas.tsx) and the page composes these.
 */

import { useEffect, useState } from "react";
import {
  Activity,
  ArrowRight,
  ArrowUpRight,
  AtSign,
  Check,
  Globe,
  Play,
  Plus,
  Share2,
  Star,
  Waves,
} from "lucide-react";
import {
  saascreators,
  saascreatorsintro,
  saasfandeck,
  saasflow,
  saasherocards,
  saasswingcards,
  saasworkspace,
} from "../../saascontent.ts";
import { uicopy, useUicopy } from "../../uistore.ts";
import { SaddleTabBridge, SaddleTabBridgeUp, ScoopedCard, Studiomark, type studiomarkid } from "./IntroSaaskit.tsx";

/** herocopy — the hero statement the ui store serves (the intro.hero.*
 * rows: the seed there is the exact reference copy, so the live db and the
 * offline build answer the same words the reference answers). */
function herocopy() {
  return {
    leada: uicopy("intro.hero.leada"),
    leadb: uicopy("intro.hero.leadb"),
    leadc: uicopy("intro.hero.leadc"),
    modetoggle: uicopy("intro.hero.modetoggle"),
    modeagents: uicopy("intro.hero.mode.agents"),
    modestudios: uicopy("intro.hero.mode.studios"),
    subtitle: uicopy("intro.hero.subtitle"),
    keyprimary: uicopy("intro.hero.keyprimary"),
    keysecondary: uicopy("intro.hero.keysecondary"),
  };
}

/** Section 1 — the hero: the OS statement with the activity tile, the
 * inline engine switch riding inside the headline on the four-stop drift
 * (blue, violet, pink, orange), the mode words that answer the switch, the
 * sub line, the two keys of the reference (the tactile Get Started and the
 * surface Why DevThink?) and the three scooped proof cards floating over
 * the gaussian shader field. */
export function SaasHero({ scrollto }: { scrollto: (id: string) => void }) {
  // the store ride: the live db rows land once per mount and the face
  // re-renders on them — the seed answers the first paint with the same
  // words the db serves, so the swap never flashes
  useUicopy();
  const [agentsmode, setAgentsmode] = useState(true);
  const hero = herocopy();
  return (
    <section id="hero-os" className="relative flex flex-col overflow-hidden bg-[#F2F5FC] pt-0 pb-32 sm:pb-40">
      <div
        className="hero-gaussian-shader pointer-events-none absolute inset-x-0 -bottom-20 z-0 h-[520px] opacity-90"
        aria-hidden="true"
      />
      <div className="relative z-20 mx-auto flex w-full max-w-[1360px] flex-col items-center px-6 pt-16 text-center sm:px-10 sm:pt-24 lg:px-16">
        <h1 className="max-w-5xl text-[44px] font-bold-tier text-slate-950 sm:text-7xl lg:text-[84px]">
          <span>{hero.leada} </span>
          <span className="surface-card mx-2 inline-flex h-12 w-12 items-center justify-center rounded-2xl align-middle text-orange-500 sm:h-14 sm:w-14">
            <Activity className="h-6 w-6 animate-pulse sm:h-7 sm:w-7" aria-hidden="true" />
          </span>
          <span> {hero.leadb}</span>
          <br />
          <span className="text-slate-400">{hero.leadc} </span>
          <button
            type="button"
            onClick={() => setAgentsmode((prev) => !prev)}
            aria-label={hero.modetoggle}
            className="hero-inline-switch mx-3 inline-flex h-12 w-24 cursor-pointer items-center rounded-full p-1.5 align-middle sm:h-14 sm:w-28"
          >
            <span
              className={`hero-switch-thumb block h-9 w-9 rounded-full transition-transform duration-300 sm:h-11 sm:w-11 ${agentsmode ? "translate-x-12 sm:translate-x-14" : "translate-x-0"}`}
            />
          </button>
          <span className={agentsmode ? "text-slate-950" : "text-indigo-600"}>
            {agentsmode ? hero.modeagents : hero.modestudios}
          </span>
        </h1>
        <p className="mt-8 max-w-xl text-[15px] font-thin-tier text-slate-600 sm:text-lg">{hero.subtitle}</p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <button
            type="button"
            onClick={() => scrollto("workspace-subapps")}
            className="btn-tactile-3d flex items-center gap-2.5 rounded-full px-10 py-4 text-sm font-bold-tier text-white"
          >
            <span>{hero.keyprimary}</span>
            <ArrowUpRight className="h-4 w-4 text-sky-400" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => scrollto("creators-doo")}
            className="surface-card flex items-center gap-2.5 rounded-full px-7 py-4 text-sm font-medium-tier text-slate-900 transition hover:border-indigo-300"
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-950 text-white">
              <Play className="ml-0.5 h-3 w-3 fill-current" aria-hidden="true" />
            </span>
            <span>{hero.keysecondary}</span>
          </button>
        </div>

        {/* the three scooped proof cards of the reference: the indigo rating
            slab, the surface time card and the dark neural core card */}
        <div className="mt-20 grid w-full grid-cols-1 items-stretch gap-6 text-left lg:grid-cols-12">
          <ScoopedCard
            className="animate-float-card lg:col-span-4"
            surfaceClassName="indigo-tactile-surface flex min-h-[300px] flex-col justify-between p-8 text-white"
            topRightContent={
              <button
                type="button"
                onClick={() => scrollto("workspace-subapps")}
                className="icon-frame-3d flex h-10 w-10 items-center justify-center rounded-full text-slate-950"
                aria-label={saasherocards.ratingfigure}
              >
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </button>
            }
          >
            <div className="flex items-baseline gap-2.5 pr-12">
              <span className="text-5xl font-bold-tier sm:text-6xl">{saasherocards.ratingfigure}</span>
              <Star className="h-5 w-5 fill-amber-300 text-amber-300" aria-hidden="true" />
            </div>
            <div className="mt-8 flex items-center justify-between gap-4 rounded-2xl border border-white/15 bg-white/10 p-4">
              <h3 className="text-sm leading-snug font-bold-tier text-white">{saasherocards.ratingline}</h3>
              {/* the two reader chips of the reference photos — gradient
                  initials over the indigo ring, no external image */}
              <div className="flex shrink-0 -space-x-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-sky-300 to-indigo-500 text-[10px] font-bold-tier text-white ring-2 ring-indigo-500">
                  A
                </span>
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-amber-300 to-rose-500 text-[10px] font-bold-tier text-white ring-2 ring-indigo-500">
                  N
                </span>
              </div>
            </div>
          </ScoopedCard>
          <ScoopedCard
            className="animate-float-card-delayed lg:col-span-4"
            surfaceClassName="surface-card flex min-h-[300px] flex-col justify-between p-8 text-slate-900"
            topRightContent={
              <button
                type="button"
                onClick={() => scrollto("spatial-bento")}
                className="btn-tactile-3d flex h-10 w-10 items-center justify-center rounded-full text-white"
                aria-label={saasherocards.timetitle}
              >
                <Activity className="h-4 w-4 text-sky-400" aria-hidden="true" />
              </button>
            }
          >
            <div className="pr-12">
              <h3 className="text-xl leading-tight font-bold-tier text-slate-950">{saasherocards.timetitle}</h3>
              <p className="mt-3 text-sm font-thin-tier text-slate-500">{saasherocards.timecopy}</p>
            </div>
            <div className="stat-tile mt-8 flex items-center justify-between gap-4 rounded-2xl p-4">
              <div className="flex items-center gap-2">
                <Studiomark app="cadria" className="h-9 w-9" />
                <Studiomark app="debonair" className="h-9 w-9" />
                <Studiomark app="saddle" className="h-9 w-9" />
              </div>
              <div className="flex h-8 items-end gap-1.5" aria-hidden="true">
                {saasherocards.bars.map((bar) => (
                  <span
                    key={bar}
                    style={{ height: `${bar}%` }}
                    className={`w-1.5 rounded-full ${bar === 100 || bar === 92 ? "bg-indigo-600" : "bg-slate-300"}`}
                  />
                ))}
              </div>
            </div>
          </ScoopedCard>
          <ScoopedCard
            className="animate-float-card lg:col-span-4"
            surfaceClassName="relative flex min-h-[300px] flex-col justify-between overflow-hidden border border-white/20 bg-[#0B0D16] p-8 text-white"
            topRightContent={
              <button
                type="button"
                onClick={() => scrollto("sonic-deck")}
                className="icon-frame-3d flex h-10 w-10 items-center justify-center rounded-full text-slate-950"
                aria-label={saasherocards.coretitle}
              >
                <Waves className="h-4 w-4 text-indigo-600" aria-hidden="true" />
              </button>
            }
          >
            <div
              className="pointer-events-none absolute top-10 right-6 h-16 w-16 rounded-full opacity-90"
              style={{
                background: "radial-gradient(circle at 30% 30%, #FFFFFF, #C084FC 55%, #4F46E5)",
                boxShadow: "inset 0 3px 6px rgba(255,255,255,0.85), 0 10px 20px rgba(0,0,0,0.45)",
              }}
              aria-hidden="true"
            />
            <div className="relative z-10 flex items-center gap-3 pr-12">
              <Studiomark app="doo" className="h-10 w-10" />
              <h3 className="text-xl font-bold-tier text-white">{saasherocards.coretitle}</h3>
            </div>
          </ScoopedCard>
        </div>
      </div>
    </section>
  );
}

/** Section 2 — the creators deck: the doo statement with the gradient
 * word, the three swing cards (the indigo AI Teams slab between the two
 * surface cards, each on its own swing idle) and the two creator profiles
 * with the follow pill, the conic rainbow ring and the three stat tiles. */
export function SaasCreators({ scrollto, ontoast }: { scrollto: (id: string) => void; ontoast: (m: string) => void }) {
  const [followed, setFollowed] = useState<Record<string, boolean>>({ alan: false, nato: true });
  return (
    <section id="creators-doo" className="relative bg-white px-6 py-24 sm:px-10 sm:py-32 lg:px-16">
      <div className="mx-auto grid max-w-[1360px] grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-7">
          <div className="mb-8 flex items-center gap-3">
            <Studiomark app="doo" className="h-11 w-11" />
            <h2 className="text-3xl font-bold-tier text-slate-950 sm:text-[40px]">
              {saascreatorsintro.title} <span className="text-gradient-brand">{saascreatorsintro.accent}</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 items-stretch gap-5 sm:grid-cols-3">
            {saasswingcards.map((card) => (
              <ScoopedCard
                key={card.title}
                className={card.swing}
                surfaceClassName={`${card.surface} flex h-full min-h-[260px] flex-col justify-between`}
                topRightContent={
                  <button
                    type="button"
                    onClick={() => scrollto(card.target)}
                    className="icon-frame-3d flex h-9 w-9 items-center justify-center rounded-full text-slate-800"
                    aria-label={card.title}
                  >
                    <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                  </button>
                }
              >
                <div>
                  <Studiomark app={card.app as studiomarkid} className="mb-4 h-11 w-11" />
                  <h3 className={`text-[15px] font-bold-tier ${card.titleclass}`}>{card.title}</h3>
                  <p className={`mt-2 text-[13px] font-thin-tier ${card.copyclass}`}>{card.copy}</p>
                </div>
                <div className="mt-6">
                  <span
                    className={`stat-tile inline-flex items-center rounded-lg px-3 py-1 text-[11px] font-bold-tier ${card.tagclass}`}
                  >
                    {card.tag}
                  </span>
                </div>
              </ScoopedCard>
            ))}
          </div>
        </div>
        <div className="lg:col-span-5">
          <h3 className="mb-6 text-2xl font-bold-tier text-slate-950">{saascreatorsintro.followtitle}</h3>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {saascreators.map((profile, pi) => (
              <div
                key={profile.key}
                className={`surface-card flex min-h-[340px] flex-col justify-between rounded-[28px] p-4 ${pi === 0 ? "animate-float-card" : "animate-float-card-delayed"}`}
              >
                <div>
                  <div
                    className={`relative flex h-24 items-start justify-end overflow-hidden rounded-[20px] bg-gradient-to-tr p-2.5 ${profile.banner}`}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setFollowed((prev) => ({ ...prev, [profile.key]: !prev[profile.key] }));
                        ontoast(followed[profile.key] ? `Unfollowed ${profile.name}` : `Following ${profile.name}`);
                      }}
                      className="relative z-10 flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-[11px] font-bold-tier text-slate-900 shadow-sm"
                    >
                      {followed[profile.key] ? "Following" : "Follow"}
                      {followed[profile.key] ? (
                        <Check className="h-3 w-3 text-indigo-600" aria-hidden="true" />
                      ) : (
                        <Plus className="h-3 w-3 text-indigo-600" aria-hidden="true" />
                      )}
                    </button>
                  </div>
                  <div className="relative z-10 -mt-8 flex items-end justify-between px-2">
                    <div
                      className={`h-16 w-16 rounded-full p-1 shadow-sm ${profile.ring ? "conic-rainbow-ring" : "bg-white"}`}
                    >
                      <span
                        className={`flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br text-lg font-bold-tier text-white ${profile.avatar}`}
                        aria-hidden="true"
                      >
                        {profile.initial}
                      </span>
                    </div>
                    <Studiomark app={profile.logo as studiomarkid} className="h-7 w-7" />
                  </div>
                  <div className="px-2 pt-3 pb-2">
                    <h4 className="text-[15px] font-bold-tier text-slate-900">{profile.name}</h4>
                    <p className="text-xs font-thin-tier text-slate-500">{profile.role}</p>
                  </div>
                </div>
                <div className="pt-2">
                  <div className="grid grid-cols-3 gap-1.5 text-center">
                    {profile.stats.map(([figure, label]) => (
                      <div key={label} className="stat-tile rounded-xl py-2">
                        <span className="block text-[13px] font-bold-tier text-slate-900">{figure}</span>
                        <span className="text-[10px] font-thin-tier text-slate-500">{label}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 flex justify-center gap-2">
                    <button
                      type="button"
                      className="icon-frame-3d flex h-7 w-7 items-center justify-center rounded-full text-slate-600"
                      aria-label={`${profile.name} globe`}
                    >
                      <Globe className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => ontoast("Shared")}
                      className="icon-frame-3d flex h-7 w-7 items-center justify-center rounded-full text-slate-600"
                      aria-label={`${profile.name} share`}
                    >
                      <Share2 className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      className="icon-frame-3d flex h-7 w-7 items-center justify-center rounded-full text-slate-600"
                      aria-label={`${profile.name} mention`}
                    >
                      <AtSign className="h-3.5 w-3.5" aria-hidden="true" />
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

/** Section 3 — the workspace fan deck: the obsidian grid with the frosted
 * wash and the ambient halo of the active app, the white bridge label, the
 * five clay cards fanned around the active one (rotate 5.5° a step, sink
 * 18px a step, the center scaled 1.08) cycling every 4.5s, the Open Studio
 * key and the up bridge with the five studio marks. */
export function SaasWorkspace({ scrollto }: { scrollto: (id: string) => void }) {
  const [active, setActive] = useState(2);
  useEffect(() => {
    const t = window.setInterval(() => setActive((prev) => (prev + 1) % saasfandeck.length), 4500);
    return () => window.clearInterval(t);
  }, []);
  const open = saasfandeck[active] ?? saasfandeck[0];
  return (
    <section id="workspace-subapps" className="obsidian-grid-bg relative overflow-hidden pt-0 pb-0 text-white">
      <div className="urbanist-frosted-blur pointer-events-none absolute inset-0 z-0" aria-hidden="true" />
      <div
        className="pointer-events-none absolute top-1/3 left-1/2 h-[320px] w-[560px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-20 transition-all duration-500"
        style={{ background: `radial-gradient(closest-side, ${open.glow}, transparent)` }}
        aria-hidden="true"
      />
      <div className="relative z-20 mb-8 w-full">
        <div className="h-2 w-full bg-white" aria-hidden="true" />
        <div className="-mt-[1px] flex w-full justify-center">
          <SaddleTabBridge fillColor="#FFFFFF" className="h-[44px]">
            <span className="text-xs font-bold-tier tracking-tight text-slate-950">{saasworkspace.bridge}</span>
          </SaddleTabBridge>
        </div>
      </div>
      <div className="relative z-10 mx-auto w-full max-w-[1320px] px-4 sm:px-8 lg:px-14 xl:pl-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold-tier tracking-tight text-white sm:text-5xl">
            {saasworkspace.titlea}
            <br />
            <span className="text-slate-400">{saasworkspace.titleb}</span>
          </h2>
        </div>

        <div className="relative flex items-end justify-center pt-8 pb-8">
          <div className="grid w-full max-w-[1160px] grid-cols-1 items-end gap-2 sm:grid-cols-5 sm:gap-0">
            {[0, 1, 2, 3, 4].map((slot) => {
              const idx = (active + slot - 2 + saasfandeck.length) % saasfandeck.length;
              const card = saasfandeck[idx];
              const offset = slot - 2;
              const isCenter = slot === 2;
              const rotateDeg = offset * 5.5;
              const translateY = Math.abs(offset) * 18;
              const scaleVal = isCenter ? 1.08 : 1 - Math.abs(offset) * 0.05;
              const zIndexVal = 30 - Math.abs(offset) * 5;
              return (
                <div
                  key={`slot-${slot}`}
                  role="button"
                  tabIndex={0}
                  aria-label={card.name}
                  onMouseEnter={() => setActive(idx)}
                  onClick={() => scrollto(card.target)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") scrollto(card.target);
                  }}
                  style={{
                    zIndex: zIndexVal,
                    transform: `translateY(${translateY}px) rotate(${rotateDeg}deg) scale(${scaleVal})`,
                  }}
                  className={`fan-clay group relative flex h-[270px] cursor-pointer flex-col justify-between overflow-hidden rounded-[20px] border bg-gradient-to-b p-5 transition-all duration-500 ease-out sm:-mx-4 sm:h-[300px] ${card.gradient} ${isCenter ? "border-white/60" : "border-white/30 opacity-85 hover:opacity-100"}`}
                >
                  <div className="fan-sheen pointer-events-none absolute inset-0" aria-hidden="true" />
                  <div key={card.id} className="fan-swap relative z-10 flex h-full flex-col justify-between">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-xl font-bold-tier tracking-tight text-white sm:text-2xl">{card.name}</h3>
                        <p className="mt-0.5 text-[11px] font-medium-tier text-white/85">{card.subtitle}</p>
                      </div>
                      <div className="flex shrink-0 items-center gap-1">
                        <Star className="h-3 w-3 fill-amber-300 text-amber-300" aria-hidden="true" />
                        <span className="text-xs font-bold-tier text-white">{card.rating}</span>
                      </div>
                    </div>
                    <div className="relative z-10 my-auto flex flex-col items-center pt-2">
                      <div
                        className={`transition-transform duration-500 ${isCenter ? "scale-125 -translate-y-1" : "scale-100 group-hover:scale-110"}`}
                      >
                        <Studiomark
                          app={card.id as studiomarkid}
                          className="h-24 w-24 drop-shadow-md sm:h-28 sm:w-28"
                        />
                      </div>
                    </div>
                    <div className="relative z-10 flex items-center justify-between border-t border-white/20 pt-2">
                      <span className="text-[10px] font-bold-tier tracking-wider text-white/90 uppercase">
                        {card.badge}
                      </span>
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-slate-950 shadow-md transition group-hover:scale-110">
                        <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="mt-8 flex justify-center">
          <button
            type="button"
            onClick={() => scrollto(open.target)}
            className="group flex items-center gap-3 rounded-full bg-white py-2 pl-6 pr-2 text-xs font-bold-tier text-slate-950 shadow-[0_14px_30px_rgba(255,255,255,0.2)] transition hover:scale-105 sm:text-sm"
          >
            <span>
              {saasworkspace.openkey} {open.name} {saasworkspace.studiokey}
            </span>
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-950 text-white transition group-hover:bg-indigo-600">
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </span>
          </button>
        </div>
        <div className="mt-16 -mb-[1px] flex justify-center">
          <SaddleTabBridgeUp fillColor="#F9F6F0" className="h-[64px]">
            <div className="flex h-full items-center gap-1.5 px-2 sm:gap-2 sm:px-3">
              {saasfandeck.map((item, idx) => (
                <button
                  key={item.id}
                  type="button"
                  onMouseEnter={() => setActive(idx)}
                  onClick={() => {
                    setActive(idx);
                    scrollto(item.target);
                  }}
                  aria-label={item.name}
                  className={`transition-all duration-300 hover:scale-110 ${idx === active ? "scale-110 opacity-100" : "opacity-60 hover:opacity-100"}`}
                >
                  <Studiomark app={item.id as studiomarkid} className="h-11 w-11 sm:h-12 sm:w-12" />
                </button>
              ))}
            </div>
          </SaddleTabBridgeUp>
        </div>
      </div>
    </section>
  );
}

/** Section 4 — the sawtooth ribbon with its whitewash center and the
 * studio flow bed: the keep exploring badge, the one-line statement and
 * the Enter Cadria key that walks the scroll into the bento. */
export function SaasStudioFlow({ scrollto }: { scrollto: (id: string) => void }) {
  return (
    <>
      <div className="relative" aria-hidden="true">
        <div className="ribbon-sawtooth-divider" />
        <div className="absolute inset-0 flex justify-center">
          <div className="ribbon-whitewash-center" />
        </div>
      </div>
      <section id="studio-flow" className="w-full bg-[#F9F6F0] px-6 py-14 text-center text-slate-950">
        <div className="mb-4 inline-flex items-center rounded-full bg-slate-950 px-4 py-1.5 text-xs font-bold-tier text-white">
          <span>{saasflow.badge}</span>
        </div>
        <h2 className="mx-auto max-w-3xl text-3xl font-bold-tier sm:text-5xl">{saasflow.title}</h2>
        <p className="mx-auto mt-3 max-w-lg text-sm font-thin-tier text-slate-600 sm:text-base">{saasflow.copy}</p>
        <button
          type="button"
          onClick={() => scrollto("spatial-bento")}
          className="mt-6 rounded-full bg-slate-950 px-7 py-3 text-xs font-bold-tier text-white transition hover:scale-105 sm:text-sm"
        >
          {saasflow.key}
        </button>
      </section>
    </>
  );
}
