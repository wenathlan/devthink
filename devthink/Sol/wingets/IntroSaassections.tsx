/**
 * saassections.tsx — the opening sections of the SaaS face: the hero with
 * the OS statement and the inline engine switch (the ever rose gradient the
 * owner ordered back — the track, the gaussian field and the shader hero
 * all ride the --color-ever family of sol.css) and the family grid that
 * presents the real studios of the monorepo. Loose components of the intro
 * page — the anchor (intro.tsx) mounts the page (saas.tsx) and the page
 * composes these. All copy rides the ui store (the intro.hero.*, intro.os.*
 * and intro.studios.* rows of uistore.ts) and the glyphs ride the fluent
 * set.
 */

import {
  HeartPulseRegular as Activity,
  CloudArchiveRegular as Archive,
  ArrowUpRightRegular as Arrowupright,
  BotRegular as Bot,
  CloudRegular as Cloud,
  CubeRegular as Cube,
  PeopleTeamRegular as Team,
  MusicNote2Regular as Wavenote,
} from "@fluentui/react-icons";
import { type ComponentType, useState } from "react";
import { saasstudiofamily } from "../../saascontent.ts";
import { uicopy, useUicopy } from "../../uistore.ts";
import { SaddleTabBridge, Studiomark, type studiomarkid } from "./IntroSaaskit.tsx";
import { Shaderhero } from "./IntroShaderhero.tsx";

/** One glyph of the fluent set, addressable by its studio id. */
export type glyphkind = ComponentType<{ className?: string; "aria-hidden"?: boolean | "true" | "false" }>;

/** The glyph each real studio of the family wears — the one map the page
 * chrome and the studio sections share (the studios are real apps of the
 * monorepo, so one glyph answers every surface that names them). */
export const STUDIOGLYPH: Record<string, glyphkind> = {
  cadria: Cube,
  debonair: Wavenote,
  getry: Team,
  saddle: Cloud,
  vault: Archive,
  doo: Bot,
};

/** herocopy — the hero copy the ui store serves: every string rides the
 * db row (the intro.hero.* keys of uistore.ts — the seed there is the one
 * place the literals live) and no literal lives in this component. The
 * mode ids stay structural: the words behind them ride the rows. */
function herocopy() {
  return {
    leada: uicopy("intro.hero.leada"),
    leadb: uicopy("intro.hero.leadb"),
    leadc: uicopy("intro.hero.leadc"),
    modetoggle: uicopy("intro.hero.modetoggle"),
    modes: [
      { id: "agents", word: uicopy("intro.hero.mode.agents") },
      { id: "studios", word: uicopy("intro.hero.mode.studios") },
    ],
    subtitle: uicopy("intro.hero.subtitle"),
    keyprimary: uicopy("intro.hero.keyprimary"),
  };
}

/** The hero: the OS statement with the activity tile, the inline engine
 * switch of the original reference riding inside the headline on the ever
 * rose track, the mode words that answer the switch (slate ink for the
 * agents mode, ever for the studios mode), the sub line, the one launch
 * key of the body and the family marks — the real studios of the monorepo,
 * no copy, no keys, no invented numbers. */
export function SaasHero({ onenter }: { onenter: () => void }) {
  // the store ride: the live db rows land once per mount and the face
  // re-renders on them — the seed answers the first paint with the same
  // words the db serves, so the swap never flashes
  useUicopy();
  const [modeid, setModeid] = useState("agents");
  const saashero = herocopy();
  const mode = saashero.modes.find((row) => row.id === modeid) ?? saashero.modes[0];
  const agents = mode.id === "agents";
  return (
    <section id="hero-os" className="relative flex flex-col overflow-hidden bg-[#F2F5FC] pt-0 pb-24 sm:pb-32">
      {/* the living shader hero: the drifting grid and the particle sky —
          three.js rides the lazy lane (never the landing bundle), the field
          never arms under reduced motion, the CSS gaussian stays the base */}
      <Shaderhero />
      <div className="hero-gaussian-shader pointer-events-none absolute inset-x-0 -bottom-20 z-0 h-[520px] opacity-90" />
      <div className="relative z-20 mx-auto flex w-full max-w-[1360px] flex-col items-center px-6 pt-16 text-center sm:px-10 sm:pt-24 lg:px-16">
        <h1 className="max-w-5xl text-[44px] leading-[1.02] font-extrabold tracking-[-0.035em] text-slate-950 sm:text-7xl lg:text-[84px]">
          <span>{saashero.leada} </span>
          <span className="surface-card mx-2 inline-flex h-12 w-12 items-center justify-center rounded-2xl align-middle text-ever-deep sm:h-14 sm:w-14">
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
          <span className={agents ? "text-slate-950" : "text-ever-deep"}>{mode.word}</span>
        </h1>
        <p className="mt-8 max-w-xl text-[15px] font-normal tracking-[-0.005em] text-slate-600 sm:text-lg">
          {saashero.subtitle}
        </p>
        {/* the one launch key of the body: the funnel walks the entry chain
            to the login face — the header chrome carries the other doors */}
        <button
          type="button"
          onClick={onenter}
          className="btn-tactile-3d mt-10 flex items-center gap-2.5 rounded-full px-10 py-4 text-sm font-extrabold tracking-[-0.035em] text-white"
        >
          <span>{saashero.keyprimary}</span>
          <Arrowupright className="h-4 w-4 text-ever-soft" aria-hidden="true" />
        </button>
      </div>
      {/* the family marks: the real studios of the monorepo under the
          statement — the tile marks of the kit, no copy, no keys, no
          invented numbers */}
      <div className="relative z-20 mt-16 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
        {saasstudiofamily.map((studio) => (
          <Studiomark key={studio} app={studio as studiomarkid} className="h-10 w-10 sm:h-11 sm:w-11" />
        ))}
      </div>
    </section>
  );
}

/** The family grid: the real studios of the monorepo — the bridge label,
 * the two-tone statement, one line of description and the quiet grid of
 * the six studios with their fluent glyphs (the mock decks died by the
 * owner order: what the landing presents is what actually ships). */
export function SaasStudios() {
  useUicopy();
  return (
    <section id="workspace-subapps" className="relative bg-white px-6 pt-0 pb-20 sm:px-10 sm:pb-28 lg:px-16">
      {/* the bridge: the saddle head of the palco stitched into the white
          bed of the section — the same curve every section wears */}
      <div className="relative z-20 mb-12 w-full">
        <div className="h-2 w-full bg-[#F2F5FC]" />
        <div className="-mt-[1px] flex w-full justify-center">
          <SaddleTabBridge fillColor="#F2F5FC" className="h-[44px]">
            <span className="text-xs font-extrabold tracking-tight text-slate-950">{uicopy("intro.os.bridge")}</span>
          </SaddleTabBridge>
        </div>
      </div>
      <div className="mx-auto max-w-[1360px]">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-extrabold tracking-[-0.035em] text-slate-950 sm:text-5xl">
            {uicopy("intro.os.titlea")} <span className="text-gradient-brand">{uicopy("intro.os.titleb")}</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm font-normal tracking-[-0.005em] text-slate-600 sm:text-base">
            {uicopy("intro.os.copy")}
          </p>
        </div>
        <div className="mt-12 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {saasstudiofamily.map((studio) => {
            const Glyph = STUDIOGLYPH[studio];
            if (!Glyph) return null;
            return (
              <div
                key={studio}
                className="flex items-start gap-4 rounded-2xl border border-slate-200/90 bg-[#F4F6FB] p-6"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-ever-soft/70 text-ever-ink">
                  <Glyph className="h-5 w-5" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <h3 className="text-[15px] font-extrabold tracking-[-0.035em] text-slate-950">
                    {uicopy(`intro.studios.${studio}.name`)}
                  </h3>
                  <p className="mt-1.5 text-[13px] font-normal tracking-[-0.005em] text-slate-500">
                    {uicopy(`intro.studios.${studio}.copy`)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
