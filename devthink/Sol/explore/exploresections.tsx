/**
 * exploresections.tsx — the free exploration sections of the landing, fed
 * EXCLUSIVELY by the catalog clients the explore page already reads
 * (catalog.ts: the reviewed seeds answer offline, the paired database
 * answers over HTTPS). Every section tells the truth about its rows: the
 * studio creations are the family's own made assets, the recipes are the
 * runnable gallery, the apps are the OS surfaces — no invented uploads.
 */

import { Play } from "lucide-react";
import type { CSSProperties } from "react";
import type { FamilySite, NativeApp, Recipe, RunnerBinary, StudioAsset, StudioTrack } from "../../catalog";

/** the identity tone of a recipe grade (the gallery grammar of the OS page) */
const gradetone: Record<Recipe["grade"], string> = {
  basic: "var(--dt-blue)",
  medium: "#e0a34a",
  advanced: "#ff7d66",
};

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

type ExploreSectionsProps = {
  sites: FamilySite[];
  recipes: Recipe[];
  apps: NativeApp[];
  runners: RunnerBinary[];
  assets: StudioAsset[];
  tracks: StudioTrack[];
};

export function ExploreSections({ sites, recipes, apps, runners, assets, tracks }: ExploreSectionsProps) {
  return (
    <>
      <section className="dt-landing__section" id="creations" aria-labelledby="dt-sec-creations">
        <header className="dt-landing__sechead">
          <h2 id="dt-sec-creations">creations made in the studios</h2>
          <p>video, image, 3d, music and audio produced with the family engines — upload yours after entering.</p>
        </header>
        <div className="dt-landing__cols">
          <div className="dt-lancards">
            {assets.map((asset, index) => (
              <article className="dt-lancard" key={asset.id} style={{ "--i": index } as CSSProperties}>
                <span className="dt-lancard__tag">{assetLabel(asset)}</span>
                <strong>{asset.title}</strong>
                <small>
                  {asset.engine} · {asset.duration ?? asset.size}
                </small>
              </article>
            ))}
          </div>
          <div className="dt-lancards">
            {tracks.map((track, index) => (
              <article className="dt-lancard" key={track.id} style={{ "--i": index } as CSSProperties}>
                <span className="dt-lancard__tag">music · katexis</span>
                <strong>{track.title}</strong>
                <small>
                  {track.minutes} min · {track.blurb}
                </small>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="dt-landing__section" id="recipes" aria-labelledby="dt-sec-recipes">
        <header className="dt-landing__sechead">
          <h2 id="dt-sec-recipes">runnable examples and recipes</h2>
          <p>the recipe gallery runs on the platform runner — from basic to advanced, nothing to install.</p>
        </header>
        <div className="dt-lancards">
          {recipes.map((recipe, index) => (
            <article className="dt-lancard" key={recipe.name} style={{ "--i": index } as CSSProperties}>
              <span className="dt-lancard__tag" style={{ color: gradetone[recipe.grade] }}>
                {recipe.grade}
              </span>
              <strong>{recipe.name}</strong>
              <small>
                {recipe.family} · {recipe.duration}
              </small>
            </article>
          ))}
        </div>
      </section>

      <section className="dt-landing__section" id="apps" aria-labelledby="dt-sec-apps">
        <header className="dt-landing__sechead">
          <h2 id="dt-sec-apps">apps of the os</h2>
          <p>the native studios and the binary runners — the same interface of the panel, open to everyone.</p>
        </header>
        <div className="dt-lancards">
          {apps.map((app, index) => (
            <article className="dt-lancard" key={app.id} style={{ "--i": index } as CSSProperties}>
              <span className="dt-lancard__tag">
                {app.owner} · {app.engine}
              </span>
              <strong>{app.title}</strong>
              <small>{app.blurb}</small>
            </article>
          ))}
          {runners.map((runner, index) => (
            <article className="dt-lancard" key={runner.id} style={{ "--i": index } as CSSProperties}>
              <span className="dt-lancard__tag">
                <Play size={10} aria-hidden="true" /> {runner.runner}
              </span>
              <strong>{runner.title}</strong>
              <small>
                {runner.kind} · {runner.formats} · {runner.blurb}
              </small>
            </article>
          ))}
        </div>
      </section>

      <section className="dt-landing__section" id="family" aria-labelledby="dt-sec-family">
        <header className="dt-landing__sechead">
          <h2 id="dt-sec-family">the family, one os</h2>
          <p>five branded apps over the same engines — each site lives on its own subdomain.</p>
        </header>
        <div className="family-grid">
          {sites.map((site) => (
            <a key={site.host} className="family-card" href={site.host}>
              <span className="family-card__host">{site.host.replace("https://", "")}</span>
              <strong>{site.name}</strong>
              <p>{site.blurb}</p>
            </a>
          ))}
        </div>
      </section>
    </>
  );
}
