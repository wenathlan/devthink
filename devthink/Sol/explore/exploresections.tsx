/**
 * exploresections.tsx — the curated rails of the explore hub (campaign v3,
 * wave R1-d). The old flex-tracks bands retired: the hub curates its rows
 * as horizontal snap rails, each introduced by a mono rail caption, each
 * led by ONE featured card riding the center-pop (raised, z-top, spring).
 * The rails stay fed exclusively by the existing sources — the studio
 * assets and tracks of the catalog (recent) and the shared app registry
 * (pinned, all apps). Nothing is invented; the sites/recipes/apps/runners
 * props remain part of the public type for callers that still pass them,
 * the rails simply no longer render those bands (the family lives in the
 * constellation, the runners answer in the panel and the launcher page).
 */

import type { CSSProperties } from "react";
import type { FamilySite, NativeApp, Recipe, RunnerBinary, StudioAsset, StudioTrack } from "../../catalog";
import { DESKTOP_APPS, PINNED_APPS } from "../shell/appregistry";
import { DeckCell } from "./launchdeck";

/** the studio labels of the made assets, by their catalog studio field (any
 * studio value the paired database adds falls back to its own name) */
const studiolabel: Record<string, string> = {
  video: "video · cadria",
  image: "image · cadria",
  music: "music · debonair",
  model3d: "3d · cadria",
};

function assetLabel(asset: StudioAsset): string {
  return studiolabel[asset.studio] ?? asset.studio;
}

/** the identity tint of a made asset's studio — one signal color per origin,
 * the card chrome itself stays neutral */
const studiotint: Record<string, string> = {
  video: "#f472b6",
  image: "#f472b6",
  model3d: "#f472b6",
  music: "#d9962e",
};

type ExploreSectionsProps = {
  sites?: FamilySite[];
  recipes?: Recipe[];
  apps?: NativeApp[];
  runners?: RunnerBinary[];
  assets: StudioAsset[];
  tracks: StudioTrack[];
};

/** the entrance slot variable of a staggered rail child (70ms steps) */
function lotVars(index: number): CSSProperties {
  return { "--ldk-i": Math.min(index, 9) } as CSSProperties;
}

/** one curated card of the recent rail: studio tag (identity tint), title
 * on the display face, one mono meta line — the first card rides featured */
function RecentCard({
  item,
  index,
}: {
  item: { tag: string; title: string; meta: string; tint: string };
  index: number;
}) {
  return (
    <div className="ldk-rlot" style={lotVars(index)}>
      <article
        className={index === 0 ? "ldk-rcard is-featured" : "ldk-rcard"}
        style={{ "--ldk-tint": item.tint } as CSSProperties}
      >
        <span className="ldk-rcard__tag">{item.tag}</span>
        <strong className="ldk-rcard__title">{item.title}</strong>
        <small className="ldk-rcard__meta">{item.meta}</small>
      </article>
    </div>
  );
}

export function ExploreSections({ assets, tracks }: ExploreSectionsProps) {
  const recent = [
    ...assets.map((asset) => ({
      tag: assetLabel(asset),
      title: asset.title,
      meta: `${asset.engine} · ${asset.duration ?? asset.size}`,
      tint: studiotint[asset.studio] ?? "#9aa3b5",
    })),
    ...tracks.map((track) => ({
      tag: "music · katexis",
      title: track.title,
      meta: `${track.minutes} min · ${track.blurb}`,
      tint: studiotint.music,
    })),
  ];

  return (
    <>
      <section className="dt-landing__section ldk-railzone" id="rails" aria-labelledby="dt-sec-recent">
        <header className="dt-landing__sechead">
          <p className="ldk-railzone__cap">rail 01 · recent</p>
          <h2 id="dt-sec-recent">recent from the studios</h2>
          <p>the family's own made assets — video, image, 3d and music, straight from the catalog.</p>
        </header>
        <div className="ldk-rail">
          {recent.map((item, index) => (
            <RecentCard key={`${item.tag}-${item.title}`} item={item} index={index} />
          ))}
          {recent.length === 0 && <p className="ldk-empty">the studios have not answered yet.</p>}
        </div>
      </section>

      <section className="dt-landing__section ldk-railzone" aria-labelledby="dt-sec-pinned">
        <header className="dt-landing__sechead">
          <p className="ldk-railzone__cap">rail 02 · pinned</p>
          <h2 id="dt-sec-pinned">pinned of the os</h2>
          <p>the surfaces the os itself keeps one click away — the same rows the taskbar pins.</p>
        </header>
        <div className="ldk-rail">
          {PINNED_APPS.map((app, index) => (
            <div className="ldk-rlot" key={app.id} style={lotVars(index)}>
              <DeckCell app={app} featured={index === 0} phase={index} />
            </div>
          ))}
        </div>
      </section>

      <section className="dt-landing__section ldk-railzone" aria-labelledby="dt-sec-all">
        <header className="dt-landing__sechead">
          <p className="ldk-railzone__cap">rail 03 · all apps</p>
          <h2 id="dt-sec-all">every app, one field away</h2>
          <p>the full registry — native surfaces and family apps, in catalog order.</p>
        </header>
        <div className="ldk-rail">
          {DESKTOP_APPS.map((app, index) => (
            <div className="ldk-rlot" key={app.id} style={lotVars(index)}>
              <DeckCell app={app} featured={app.id === "panel"} phase={index} />
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
