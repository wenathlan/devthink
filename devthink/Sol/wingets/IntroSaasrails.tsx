/**
 * saasrails.tsx — the closing sections of the SaaS face: the studio
 * spotlights (the minimal sections the owner ordered — the bridge label,
 * the studio name, one line of description and the fluent glyph; the mock
 * decks of the film rail, the track rail, the reel wall and the demo chat
 * retired) and the footer. Loose components of the intro page. The launch
 * paths funnel to the enter callback — the login face is the next page of
 * the chain and the panel stays last — while the footer Explorer row walks
 * the entry chain through the free exploration face (/explore). The studio
 * copy rides the ui store (the intro.studios.* rows of uistore.ts), the
 * footer rows ride the landing data layer (saascontent.ts) and the glyphs
 * ride the fluent set.
 */

import { ArrowUpRightRegular as Arrowupright } from "@fluentui/react-icons";
import { saasfooter } from "../../saascontent.ts";
import { uicopy, useUicopy } from "../../uistore.ts";
import { SaddleTabBridge } from "./IntroSaaskit.tsx";
import { STUDIOGLYPH } from "./IntroSaassections.tsx";
import { SolLogoMark, SolWordmark } from "./PanelLogo.tsx";

/** The footer copy contract: the enter action, the explore walker of the
 * entry chain and the internal scroll. */
type FooterProps = {
  onenter: () => void;
  onexplore: () => void;
  scrollto: (id: string) => void;
};

/** One studio spotlight: the minimal section the owner ordered — the
 * bridge label, the studio name, one line of description and the fluent
 * glyph on the ever-soft tile. No keys, no cards, no sub-paragraphs: the
 * studio is real and the line is the whole pitch. */
export function SaasStudioSpotlight({ stop, flip = false }: { stop: { id: string; studio: string }; flip?: boolean }) {
  useUicopy();
  const Glyph = STUDIOGLYPH[stop.studio];
  if (!Glyph) return null;
  return (
    <section id={stop.id} className="relative bg-white px-6 pt-0 pb-20 sm:px-10 sm:pb-28 lg:px-16">
      {/* the bridge: the saddle head of the palco stitched into the white
          bed of the section — the same curve every section wears */}
      <div className="relative z-20 mb-10 w-full">
        <div className="h-2 w-full bg-[#F2F5FC]" />
        <div className="-mt-[1px] flex w-full justify-center">
          <SaddleTabBridge fillColor="#F2F5FC" className="h-[44px]">
            <span className="text-xs font-extrabold tracking-tight text-slate-950">
              {uicopy("intro.studios.bridge")}
            </span>
          </SaddleTabBridge>
        </div>
      </div>
      <div className="mx-auto grid max-w-[1360px] grid-cols-1 items-center gap-10 lg:grid-cols-12">
        <div className={flip ? "lg:order-2 lg:col-span-7" : "lg:col-span-7"}>
          <h2 className="text-4xl leading-[1.02] font-extrabold tracking-[-0.035em] text-slate-950 sm:text-5xl">
            {uicopy(`intro.studios.${stop.studio}.name`)}
          </h2>
          <p className="mt-5 max-w-lg text-[15px] font-normal tracking-[-0.005em] text-slate-600 sm:text-base">
            {uicopy(`intro.studios.${stop.studio}.copy`)}
          </p>
        </div>
        <div className={`flex lg:col-span-5 ${flip ? "lg:order-1 lg:justify-start" : "lg:justify-end"}`}>
          <span className="flex h-28 w-28 items-center justify-center rounded-[28px] bg-ever-soft/70 text-ever-ink sm:h-32 sm:w-32">
            <Glyph className="h-12 w-12 sm:h-14 sm:w-14" aria-hidden="true" />
          </span>
        </div>
      </div>
    </section>
  );
}

/** The footer: the brand row with the launch key, the link columns (the
 * internal rows scroll the landing, the Explorer row walks the entry
 * chain to the free exploration face) and the base row. The
 * destination-less column and the social pills died with the owner order —
 * every row answers a real target and the launch key stays the one key. */
export function SaasFooter({ onenter, onexplore, scrollto }: FooterProps) {
  return (
    <section
      id="editorial-bio"
      className="relative border-t border-slate-200/80 bg-[#F2F5FC] px-6 pt-16 pb-10 sm:px-10 lg:px-16"
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
                <Arrowupright className="h-4 w-4 text-ever-soft" aria-hidden="true" />
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-8 lg:col-span-7 sm:grid-cols-3">
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
        <div className="flex justify-center border-t border-slate-200/80 pt-8">
          <span className="text-xs font-normal tracking-[-0.005em] text-slate-400">{saasfooter.base}</span>
        </div>
      </div>
    </section>
  );
}
