/**
 * saassections.tsx — the opening sections of the SaaS face: the hero with
 * the OS statement and the inline engine switch the original reference
 * carries inside the headline (the gradient track, the white thumb and the
 * mode words that answer with their color walk), the creator cards and the
 * studio fan deck. Loose components of the intro page — the anchor
 * (intro.tsx) mounts the page (saas.tsx) and the page composes these. All
 * copy rides the landing data layer (saascontent.ts) and the glyphs ride
 * the fluent set.
 */

import {
  HeartPulseRegular as Activity,
  ArrowRightRegular as Arrowright,
  ArrowUpRightRegular as Arrowupright,
  MentionRegular as Atsign,
  CheckmarkRegular as Check,
  GlobeRegular as Globe,
  PlayRegular as Play,
  AddRegular as Plus,
  ShareRegular as Share,
  StarRegular as Star,
  HeadphonesSoundWaveRegular as Wave,
} from "@fluentui/react-icons";
import { useEffect, useState } from "react";
import {
  saascreators,
  saascreatorsintro,
  saashero,
  saasstudios,
  saasstudiosintro,
  saastoasts,
} from "../../saascontent.ts";
import { SaddleTabBridge, SaddleTabBridgeUp, ScoopedCard, Studiomark, type studiomarkid } from "./IntroSaaskit.tsx";

type SectionProps = {
  /** the enter action: every launch path of the landing funnels to the login face */
  onenter: () => void;
  /** the smooth scroll to a landing section id */
  scrollto: (id: string) => void;
};

/** The hero: the OS statement with the activity tile, the inline engine
 * switch of the original reference riding inside the headline (the
 * gradient track with the white thumb), the mode words that answer the
 * switch with their color walk (slate ink for the agents mode, indigo for
 * the studios mode), the sub line, the two keys and the three scooped
 * stat cards. */
export function SaasHero({ onenter, scrollto }: SectionProps) {
  const [modeid, setModeid] = useState("agents");
  const mode = saashero.modes.find((row) => row.id === modeid) ?? saashero.modes[0];
  const agents = mode.id === "agents";
  return (
    <section id="hero-os" className="relative flex flex-col overflow-hidden bg-[#F2F5FC] pt-0 pb-32 sm:pb-40">
      <div className="hero-gaussian-shader pointer-events-none absolute inset-x-0 -bottom-20 z-0 h-[520px] opacity-90" />
      <div className="relative z-20 mx-auto flex w-full max-w-[1360px] flex-col items-center px-6 pt-16 text-center sm:px-10 sm:pt-24 lg:px-16">
        <h1 className="max-w-5xl text-[44px] leading-[1.02] font-extrabold tracking-[-0.035em] text-slate-950 sm:text-7xl lg:text-[84px]">
          <span>{saashero.leada} </span>
          <span className="surface-card mx-2 inline-flex h-12 w-12 items-center justify-center rounded-2xl align-middle text-orange-500 sm:h-14 sm:w-14">
            <Activity className="h-6 w-6 animate-pulse sm:h-7 sm:w-7" aria-hidden="true" />
          </span>
          <span> {saashero.leadb}</span>
          <br />
          <span className="text-slate-400">{saashero.leadc} </span>
          <button
            type="button"
            onClick={() => setModeid(agents ? "studios" : "agents")}
            aria-label={saashero.modetoggle}
            className="hero-inline-switch mx-3 inline-flex h-12 w-24 cursor-pointer items-center rounded-full p-1.5 align-middle sm:h-14 sm:w-28"
          >
            <span
              className={`hero-switch-thumb block h-9 w-9 rounded-full transition-transform duration-300 sm:h-11 sm:w-11 ${agents ? "translate-x-12 sm:translate-x-14" : "translate-x-0"}`}
            />
          </button>
          <span className={agents ? "text-slate-950" : "text-indigo-600"}>{mode.word}</span>
        </h1>
        <p className="mt-8 max-w-xl text-[15px] font-normal tracking-[-0.005em] text-slate-600 sm:text-lg">
          {saashero.subtitle}
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <button
            type="button"
            onClick={onenter}
            className="btn-tactile-3d flex items-center gap-2.5 rounded-full px-10 py-4 text-sm font-extrabold tracking-[-0.035em] text-white"
          >
            <span>{saashero.keyprimary}</span>
            <Arrowupright className="h-4 w-4 text-sky-400" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => scrollto("creators-doo")}
            className="surface-card flex items-center gap-2.5 rounded-full px-7 py-4 text-sm font-semibold tracking-[-0.018em] text-slate-900 transition hover:border-indigo-300"
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-950 text-white">
              <Play className="ml-0.5 h-3 w-3 fill-current" aria-hidden="true" />
            </span>
            <span>{saashero.keysecondary}</span>
          </button>
        </div>

        <div className="mt-20 grid w-full grid-cols-1 items-stretch gap-6 text-left lg:grid-cols-12">
          <ScoopedCard
            className="animate-float-card lg:col-span-4"
            surface="indigo-tactile-surface flex min-h-[300px] flex-col justify-between p-8 text-white"
            topRight={
              <button
                type="button"
                onClick={() => scrollto("workspace-subapps")}
                className="icon-frame-3d flex h-10 w-10 items-center justify-center rounded-full text-slate-950"
                aria-label="Explorer"
              >
                <Arrowupright className="h-4 w-4" aria-hidden="true" />
              </button>
            }
          >
            <div className="flex items-baseline gap-2.5 pr-12">
              <span className="text-5xl font-extrabold tracking-[-0.035em] sm:text-6xl">{saashero.rating}</span>
              <Star className="h-5 w-5 fill-amber-300 text-amber-300" aria-hidden="true" />
            </div>
            <div className="mt-8 flex items-center justify-between gap-4 rounded-2xl border border-white/15 bg-white/10 p-4">
              <h3 className="text-sm leading-snug font-extrabold tracking-[-0.035em] text-white">
                {saashero.organizer}
              </h3>
              <div className="flex shrink-0 -space-x-2">
                <img
                  src={saashero.faces[0]}
                  className="h-7 w-7 rounded-full object-cover ring-2 ring-indigo-500"
                  alt=""
                />
                <img
                  src={saashero.faces[1]}
                  className="h-7 w-7 rounded-full object-cover ring-2 ring-indigo-500"
                  alt=""
                />
              </div>
            </div>
          </ScoopedCard>
          <ScoopedCard
            className="animate-float-card-delayed lg:col-span-4"
            surface="surface-card flex min-h-[300px] flex-col justify-between p-8 text-slate-900"
            topRight={
              <button
                type="button"
                onClick={() => scrollto("spatial-bento")}
                className="btn-tactile-3d flex h-10 w-10 items-center justify-center rounded-full text-white"
                aria-label="Open Cadria"
              >
                <Activity className="h-4 w-4 text-sky-400" aria-hidden="true" />
              </button>
            }
          >
            <div className="pr-12">
              <h3 className="text-xl leading-tight font-extrabold tracking-[-0.035em] text-slate-950">
                {saashero.timetitle}
              </h3>
              <p className="mt-3 text-sm font-normal tracking-[-0.005em] text-slate-500">{saashero.timebody}</p>
            </div>
            <div className="stat-tile mt-8 flex items-center justify-between gap-4 rounded-2xl p-4">
              <div className="flex items-center gap-2">
                <Studiomark app="cadria" className="h-9 w-9" />
                <Studiomark app="debonair" className="h-9 w-9" />
                <Studiomark app="saddle" className="h-9 w-9" />
              </div>
              <div className="flex h-8 items-end gap-1.5">
                {saashero.chart.map((height, index) => (
                  <span
                    key={height}
                    style={{ height: `${height}%` }}
                    className={`w-1.5 rounded-full ${index === 4 || index === 6 ? "bg-indigo-600" : "bg-slate-300"}`}
                  />
                ))}
              </div>
            </div>
          </ScoopedCard>
          <ScoopedCard
            className="animate-float-card lg:col-span-4"
            surface="relative flex min-h-[300px] flex-col justify-between overflow-hidden border border-white/20 bg-[#0B0D16] p-8 text-white"
            topRight={
              <button
                type="button"
                onClick={() => scrollto("sonic-deck")}
                className="icon-frame-3d flex h-10 w-10 items-center justify-center rounded-full text-slate-950"
                aria-label="Open Debonair"
              >
                <Wave className="h-4 w-4 text-indigo-600" aria-hidden="true" />
              </button>
            }
          >
            <div
              className="pointer-events-none absolute top-10 right-6 h-16 w-16 rounded-full opacity-90"
              style={{
                background: "radial-gradient(circle at 30% 30%, #FFFFFF, #C084FC 55%, #4F46E5)",
                boxShadow: "inset 0 3px 6px rgba(255,255,255,0.85), 0 10px 20px rgba(0,0,0,0.45)",
              }}
            />
            <div className="relative z-10 flex items-center gap-3 pr-12">
              <Studiomark app="doo" className="h-10 w-10" />
              <h3 className="text-xl font-extrabold tracking-[-0.035em] text-white">{saashero.shader}</h3>
            </div>
          </ScoopedCard>
        </div>
      </div>
    </section>
  );
}

/** The creators section: the three build cards and the follow cards. */
export function SaasCreators({ onenter, showtoast }: SectionProps & { showtoast: (message: string) => void }) {
  const [followed, setFollowed] = useState<Record<string, boolean>>({ nato: true });
  const swings = ["swing-card-1", "swing-card-2", "swing-card-3"];
  return (
    <section id="creators-doo" className="relative bg-white px-6 py-24 sm:px-10 sm:py-32 lg:px-16">
      <div className="mx-auto grid max-w-[1360px] grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-7">
          <div className="mb-8 flex items-center gap-3">
            <Studiomark app="doo" className="h-11 w-11" />
            <h2 className="text-3xl font-extrabold tracking-[-0.035em] text-slate-950 sm:text-[40px]">
              {saascreatorsintro.headinga} <span className="text-gradient-brand">{saascreatorsintro.headingb}</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 items-stretch gap-5 sm:grid-cols-3">
            {saascreatorsintro.cards.map((card, index) => (
              <ScoopedCard
                key={card.title}
                className={swings[index]}
                surface={`${card.surface} flex h-full min-h-[260px] flex-col justify-between`}
                topRight={
                  <button
                    type="button"
                    onClick={onenter}
                    className="icon-frame-3d flex h-9 w-9 items-center justify-center rounded-full text-slate-800"
                    aria-label="Enter"
                  >
                    <Arrowupright className="h-4 w-4" aria-hidden="true" />
                  </button>
                }
              >
                <div>
                  <Studiomark app={card.app as studiomarkid} className="mb-4 h-11 w-11" />
                  <h3 className={`text-[15px] font-extrabold tracking-[-0.035em] ${card.titletone}`}>{card.title}</h3>
                  <p className={`mt-2 text-[13px] font-normal tracking-[-0.005em] ${card.bodytone}`}>{card.body}</p>
                </div>
                <div className="mt-6">
                  <span
                    className={`stat-tile inline-flex items-center rounded-lg px-3 py-1 text-[11px] font-extrabold tracking-[-0.035em] ${card.tagtone}`}
                  >
                    {card.tag}
                  </span>
                </div>
              </ScoopedCard>
            ))}
          </div>
        </div>
        <div className="lg:col-span-5">
          <h3 className="mb-6 text-2xl font-extrabold tracking-[-0.035em] text-slate-950">
            {saascreatorsintro.followheading}
          </h3>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {saascreators.map((creator, index) => (
              <div
                key={creator.id}
                className={`surface-card flex min-h-[340px] flex-col justify-between rounded-[28px] p-4 ${index === 0 ? "animate-float-card" : "animate-float-card-delayed"}`}
              >
                <div>
                  <div
                    className={`relative flex h-24 items-start justify-end overflow-hidden rounded-[20px] bg-gradient-to-tr p-2.5 ${creator.covergradient}`}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        const next = !followed[creator.id];
                        setFollowed((current) => ({ ...current, [creator.id]: next }));
                        showtoast(
                          next ? `${saastoasts.following} ${creator.name}` : `${saastoasts.unfollowed} ${creator.name}`,
                        );
                      }}
                      className="relative z-10 flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-[11px] font-extrabold tracking-[-0.035em] text-slate-900 shadow-sm transition active:scale-95"
                    >
                      {followed[creator.id] ? "Following" : "Follow"}
                      {followed[creator.id] ? (
                        <Check className="h-3 w-3 text-indigo-600" aria-hidden="true" />
                      ) : (
                        <Plus className="h-3 w-3 text-indigo-600" aria-hidden="true" />
                      )}
                    </button>
                  </div>
                  <div className="relative z-10 -mt-8 flex items-end justify-between px-2">
                    <div
                      className={`${index === 1 ? "conic-rainbow-ring" : "bg-white"} h-16 w-16 rounded-full p-1 shadow-sm`}
                    >
                      <img
                        src={creator.avatar}
                        alt={creator.name}
                        className="h-full w-full rounded-full object-cover"
                      />
                    </div>
                    <Studiomark app={creator.studio as studiomarkid} className="h-7 w-7" />
                  </div>
                  <div className="px-2 pt-3 pb-2">
                    <h4 className="text-[15px] font-extrabold tracking-[-0.035em] text-slate-900">{creator.name}</h4>
                    <p className="text-xs font-normal tracking-[-0.005em] text-slate-500">{creator.role}</p>
                  </div>
                </div>
                <div className="pt-2">
                  <div className="grid grid-cols-3 gap-1.5 text-center">
                    {creator.stats.map(([value, label]) => (
                      <div key={label} className="stat-tile rounded-xl py-2">
                        <span className="block text-[13px] font-extrabold tracking-[-0.035em] text-slate-900">
                          {value}
                        </span>
                        <span className="text-[10px] font-normal tracking-[-0.005em] text-slate-500">{label}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 flex justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => showtoast(saastoasts.shared)}
                      className="icon-frame-3d flex h-7 w-7 items-center justify-center rounded-full text-slate-600"
                      aria-label="Website"
                    >
                      <Globe className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => showtoast(saastoasts.shared)}
                      className="icon-frame-3d flex h-7 w-7 items-center justify-center rounded-full text-slate-600"
                      aria-label="Share"
                    >
                      <Share className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => showtoast(saastoasts.shared)}
                      className="icon-frame-3d flex h-7 w-7 items-center justify-center rounded-full text-slate-600"
                      aria-label="Mention"
                    >
                      <Atsign className="h-3.5 w-3.5" aria-hidden="true" />
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

/** The native studios section: the fan deck of five family apps on the
 * obsidian grid, closing with the up bridge of tile shortcuts. */
export function SaasStudios({ onenter }: SectionProps) {
  const [active, setActive] = useState(2);
  useEffect(() => {
    const timer = window.setInterval(() => setActive((current) => (current + 1) % saasstudios.length), 4500);
    return () => window.clearInterval(timer);
  }, []);
  return (
    <section id="workspace-subapps" className="obsidian-grid-bg relative overflow-hidden pt-0 pb-0 text-white">
      <div className="urbanist-frosted-blur pointer-events-none absolute inset-0 z-0" />
      <div
        className="pointer-events-none absolute top-1/3 left-1/2 h-[320px] w-[560px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-20 transition-all duration-500"
        style={{
          background: `radial-gradient(closest-side, ${["#8B5CF6", "#FB7185", "#38BDF8", "#10B981", "#3B82F6"][active]}, transparent)`,
        }}
      />
      <div className="relative z-20 mb-8 w-full inset-x-0 top-0">
        <div className="h-2 w-full bg-white" />
        <div className="flex w-full justify-center -mt-[1px]">
          <SaddleTabBridge fillColor="#FFFFFF" className="h-[44px]">
            <span className="text-xs font-extrabold tracking-tight text-slate-950">{saasstudiosintro.bridge}</span>
          </SaddleTabBridge>
        </div>
      </div>
      <div className="relative z-10 mx-auto max-w-[1320px] px-4 sm:px-8 lg:px-14 xl:pl-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-extrabold tracking-[-0.035em] text-white sm:text-5xl">
            {saasstudiosintro.headinga}
            <br />
            <span className="text-slate-400">{saasstudiosintro.headingb}</span>
          </h2>
        </div>
        <div className="relative mt-6 flex items-end justify-center pt-8 pb-8">
          <div className="grid w-full max-w-[1160px] grid-cols-1 items-end gap-2 sm:grid-cols-5 sm:gap-0">
            {[0, 1, 2, 3, 4].map((slot) => {
              const index = (active + slot - 2 + saasstudios.length) % saasstudios.length;
              const card = saasstudios[index];
              const offset = slot - 2;
              const center = slot === 2;
              return (
                <button
                  type="button"
                  key={slot}
                  onMouseEnter={() => setActive(index)}
                  onClick={onenter}
                  style={{
                    zIndex: 30 - Math.abs(offset) * 5,
                    transform: `translateY(${Math.abs(offset) * 18}px) rotate(${offset * 5.5}deg) scale(${center ? 1.08 : 1 - Math.abs(offset) * 0.05})`,
                  }}
                  className={`fan-clay group relative flex h-[270px] cursor-pointer flex-col justify-between overflow-hidden rounded-[20px] border bg-gradient-to-b p-5 text-left transition-all duration-500 ease-out sm:-mx-4 sm:h-[300px] ${card.gradient} ${card.glow} ${center ? "border-white/60" : "border-white/30 opacity-85 hover:opacity-100"}`}
                >
                  <div className="fan-sheen pointer-events-none absolute inset-0" />
                  <div key={card.id} className="fan-swap relative z-10 flex h-full flex-col justify-between">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-xl tracking-[-0.035em] font-extrabold text-white sm:text-2xl">
                          {card.name}
                        </h3>
                        <p className="mt-0.5 text-[11px] font-semibold tracking-[-0.018em] text-white/85">
                          {card.subtitle}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-1">
                        <Star className="h-3 w-3 fill-amber-300 text-amber-300" aria-hidden="true" />
                        <span className="text-xs font-extrabold tracking-[-0.035em] text-white">{card.rating}</span>
                      </div>
                    </div>
                    <div className="relative z-10 my-auto flex flex-col items-center pt-2">
                      <div
                        className={`transition-transform duration-500 ${center ? "scale-125 -translate-y-1" : "scale-100 group-hover:scale-110"}`}
                      >
                        <Studiomark
                          app={card.id as studiomarkid}
                          className="h-24 w-24 drop-shadow-md sm:h-28 sm:w-28"
                        />
                      </div>
                    </div>
                    <div className="relative z-10 flex items-center justify-between border-t border-white/20 pt-2">
                      <span className="text-[10px] font-extrabold tracking-wider text-white/90 uppercase">
                        {card.badge}
                      </span>
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-slate-950 shadow-md transition group-hover:scale-110">
                        <Arrowupright className="h-3.5 w-3.5" aria-hidden="true" />
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
        <div className="mt-8 flex justify-center">
          <button
            type="button"
            onClick={onenter}
            className="group flex items-center gap-3 rounded-full bg-white py-2 pr-2 pl-6 text-xs font-extrabold tracking-[-0.035em] text-slate-950 shadow-[0_14px_30px_rgba(255,255,255,0.2)] transition hover:scale-105 active:scale-95 sm:text-sm"
          >
            <span>
              {saasstudiosintro.openprefix} {saasstudios[active].name} {saasstudiosintro.opensuffix}
            </span>
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-950 text-white transition group-hover:bg-indigo-600">
              <Arrowright className="h-4 w-4" aria-hidden="true" />
            </span>
          </button>
        </div>
        <div className="-mb-[1px] mt-16 flex justify-center">
          <SaddleTabBridgeUp fillColor="#F9F6F0" className="h-[64px]">
            <div className="flex h-full items-center gap-1.5 px-2 sm:gap-2 sm:px-3">
              {saasstudios.map((studio, index) => (
                <button
                  key={studio.id}
                  type="button"
                  onMouseEnter={() => setActive(index)}
                  onClick={onenter}
                  aria-label={studio.name}
                  className={`transition-all duration-300 hover:scale-110 ${active === index ? "scale-110 opacity-100" : "opacity-60 hover:opacity-100"}`}
                >
                  <Studiomark app={studio.id as studiomarkid} className="h-11 w-11 sm:h-12 sm:w-12" />
                </button>
              ))}
            </div>
          </SaddleTabBridgeUp>
        </div>
      </div>
    </section>
  );
}
