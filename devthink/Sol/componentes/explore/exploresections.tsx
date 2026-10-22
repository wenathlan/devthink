/**
 * exploresections.tsx — the curated sections of the explore hub. The hub
 * curates its catalog as a grade of trylle cards — each section is a
 * responsive grid of stepped surfaces (rounded-2xl, hairline ring, Linear
 * shadow, p-8), each led by ONE featured card riding the raised elevation.
 * The sections stay fed exclusively by the existing sources — the studio
 * assets and tracks of the catalog (recent) and the shared app registry
 * (pinned, all apps). Nothing is invented; the sites/recipes/apps/runners
 * props remain part of the public type for callers that still pass them,
 * the sections simply no longer render those bands (the family lives in the
 * constellation, the runners answer in the panel and the launcher page).
 */

import { DESKTOP_APPS, PINNED_APPS } from "../../../appregistry.ts";
import type { FamilySite, NativeApp, Recipe, RunnerBinary, StudioAsset, StudioTrack } from "../../../catalog";
import { osText } from "../../../oslabels.ts";
import { DeckCell, TRYLLE_CARD_SHADOW, TRYLLE_CARD_SHADOW_RAISED } from "./launchdeck.tsx";

/** the studio labels of the made assets, by their catalog studio field (any
 * studio value the paired database adds falls back to its own name) */
const studiolabel: Record<string, string> = {
  video: osText("explore.studio.video"),
  image: osText("explore.studio.image"),
  music: osText("explore.studio.music"),
  model3d: osText("explore.studio.model3d") };

function assetLabel(asset: StudioAsset): string {
  return studiolabel[asset.studio] ?? asset.studio;
}

/** the identity tint of a made asset's studio — one signal color per origin,
 * the card chrome itself stays neutral */
const studiotint: Record<string, string> = {
  video: "#f472b6",
  image: "#f472b6",
  model3d: "#f472b6",
  music: "#d9962e" };

type ExploreSectionsProps = {
  sites?: FamilySite[];
  recipes?: Recipe[];
  apps?: NativeApp[];
  runners?: RunnerBinary[];
  assets: StudioAsset[];
  tracks: StudioTrack[];
};

/** the section header of one curated zone (mono cap, display title, sub) */
function SectionHead(props: { cap: string; title: string; sub: string; id?: string }) {
  return (
    <header className="mb-8 max-w-[56ch]">
      <p className="font-mono text-[10px] tracking-[.08em] text-ink-3">{props.cap}</p>
      <h2 id={props.id} className="mt-2 font-display text-2xl font-semibold tracking-[-0.02em] text-ink">
        {props.title}
      </h2>
      <p className="mt-2 text-sm leading-[1.55] text-ink-2">{props.sub}</p>
    </header>
  );
}

/** one curated card of the recent grid: studio tag (identity tint), title
 * on the display face, one mono meta line — the first card rides raised */
function RecentCard({
  item,
  index }: {
  item: { tag: string; title: string; meta: string; tint: string };
  index: number;
}) {
  const featured = index === 0;
  return (
    <article
      className={`relative flex h-full flex-col gap-3 overflow-hidden rounded-2xl p-8 ring-1 ring-hairline-strong transition-[background-color] duration-150 ease-micro hover:bg-s1 ${
        featured ? "bg-s1" : "bg-s0"
      }`}
      style={{
        boxShadow: featured ? TRYLLE_CARD_SHADOW_RAISED : TRYLLE_CARD_SHADOW,
        backgroundImage: `radial-gradient(150px 110px at 20% 12%, ${item.tint}24, transparent 70%)` }}
    >
      <span className="font-mono text-[10px] tracking-[.08em] text-ink-3">{item.tag}</span>
      <strong className="mt-auto pt-4 font-display text-[15px] font-semibold tracking-[-0.01em] text-ink">
        {item.title}
      </strong>
      <small className="font-mono text-[11px] leading-[1.5] text-ink-3">{item.meta}</small>
    </article>
  );
}

export function ExploreSections({ assets, tracks }: ExploreSectionsProps) {
  const recent = [
    ...assets.map((asset) => ({
      tag: assetLabel(asset),
      title: asset.title,
      meta: `${asset.engine} · ${asset.duration ?? asset.size}`,
      tint: studiotint[asset.studio] ?? "#9aa3b5" })),
    ...tracks.map((track) => ({
      tag: osText("explore.studio.track"),
      title: track.title,
      meta: `${track.minutes} min · ${track.blurb}`,
      tint: studiotint.music })),
  ];

  return (
    <>
      <section className="scroll-mt-24 py-14" id="rails" aria-labelledby="dt-sec-recent">
        <SectionHead
          id="dt-sec-recent"
          cap={osText("explore.sections.recent.cap")}
          title={osText("explore.sections.recent.title")}
          sub={osText("explore.sections.recent.sub")}
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {recent.map((item, index) => (
            <RecentCard key={`${item.tag}-${item.title}`} item={item} index={index} />
          ))}
          {recent.length === 0 && <p className="py-6 font-mono text-xs text-ink-3">{osText("explore.sections.recent.empty")}</p>}
        </div>
      </section>

      <section className="scroll-mt-24 py-14" aria-labelledby="dt-sec-pinned">
        <SectionHead
          id="dt-sec-pinned"
          cap={osText("explore.sections.pinned.cap")}
          title={osText("explore.sections.pinned.title")}
          sub={osText("explore.sections.pinned.sub")}
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PINNED_APPS.map((app, index) => (
            <DeckCell key={app.id} app={app} featured={index === 0} phase={index} />
          ))}
        </div>
      </section>

      <section className="scroll-mt-24 py-14" aria-labelledby="dt-sec-all">
        <SectionHead
          id="dt-sec-all"
          cap={osText("explore.sections.all.cap")}
          title={osText("explore.sections.all.title")}
          sub={osText("explore.sections.all.sub")}
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {DESKTOP_APPS.map((app, index) => (
            <DeckCell key={app.id} app={app} featured={app.id === "panel"} phase={index} />
          ))}
        </div>
      </section>
    </>
  );
}
