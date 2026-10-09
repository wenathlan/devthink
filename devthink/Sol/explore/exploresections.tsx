/**
 * exploresections.tsx — the free exploration sections of the landing, fed
 * EXCLUSIVELY by the catalog clients the explore page already reads
 * (catalog.ts: the reviewed seeds answer offline, the paired database
 * answers over HTTPS). Every section tells the truth about its rows: the
 * studio creations are the family's own made assets, the recipes are the
 * runnable gallery, the apps are the OS surfaces — no invented uploads.
 *
 * The composition doctrine: no uniform card grid anywhere. Every section
 * leads with ONE featured row (larger padding, the display face on the
 * title, the blurb promoted) and the remaining rows ride flex tracks of
 * natural width, so the density changes across each band — cards, a wider
 * card every few beats, and the runners answered as a quiet mono list.
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

/** the data rows of the cards ride tabular numerals (the theme polish rule) */
const cardDataStyle = { fontVariantNumeric: "tabular-nums" } as const;

/* ---- the varied rhythm: flex tracks instead of a uniform card grid — the
 * lead row features (wider track, bigger type), every fourth row widens,
 * the rest keep a natural narrow track; the wrap keeps it responsive
 * without a media query ---- */
const trackGridStyle = { display: "flex", flexWrap: "wrap", alignItems: "stretch", gap: 10 } as const;

function cardStyle(index: number): CSSProperties {
  const flex =
    index === 0
      ? { flex: "1.7 1 430px", padding: "22px 20px", gap: 7 }
      : index % 4 === 3
        ? { flex: "1.4 1 320px" }
        : { flex: "1 1 240px" };
  const style = { ...flex } as CSSProperties & Record<`--${string}`, number | string>;
  style["--i"] = Math.min(index, 8);
  return style;
}

/** the featured anatomy: the display face on the title, the blurb promoted
 * from the mono micro row to a readable line */
const featuredTitleStyle = {
  font: "600 21px/1.15 var(--font-display, var(--dt-sans))",
  letterSpacing: "-.02em",
} as const;
const featuredBlurbStyle = {
  color: "var(--dt-muted)",
  font: "400 11px/1.65 var(--dt-sans)",
  textTransform: "none",
} as const;
/** the section titles ride the display face token (the C1-01 landing) */
const sectionTitleStyle = { fontFamily: "var(--font-display, var(--dt-sans))" } as const;

/* ---- the runner list: the binaries answered as a quiet mono list — a
 * different anatomy from the cards, so the band never reads as a grid ---- */
const runnerPanelStyle = {
  flex: "1.2 1 320px",
  display: "grid",
  alignContent: "start",
  gap: 8,
  padding: "16px 18px",
  background: "var(--sol-surface-2)",
  border: "1px solid var(--sol-hairline)",
  borderRadius: 8,
  boxShadow: "var(--sol-shadow-1)",
} as const;
const runnerHeadStyle = {
  margin: 0,
  color: "var(--dt-faint)",
  font: "500 9px var(--dt-mono)",
  letterSpacing: ".08em",
} as const;
const runnerRowsStyle = { display: "grid", margin: 0, padding: 0, listStyle: "none" } as const;
const runnerRowStyle = {
  display: "flex",
  gap: 9,
  padding: "9px 0",
  borderTop: "1px solid var(--sol-hairline)",
} as const;
const runnerBodyStyle = { display: "grid", gap: 2 } as const;
const runnerNameStyle = {
  color: "var(--dt-text)",
  font: "600 13px/1.3 var(--dt-sans)",
  letterSpacing: "-.01em",
} as const;
const runnerMetaStyle = {
  color: "var(--dt-faint)",
  font: "400 10px/1.6 var(--dt-mono)",
  fontVariantNumeric: "tabular-nums",
} as const;

/* ---- the family band: the lead site featured wide, the siblings riding
 * their natural tracks ---- */
const familyHostStyle = { fontSize: 9, letterSpacing: ".08em", textTransform: "none" } as const;
const familyTrackStyle = { flex: "1 1 250px" } as const;
const familyFeaturedStyle = { flex: "1.7 1 430px", padding: "20px 18px" } as const;
const familyFeaturedNameStyle = {
  font: "600 19px/1.2 var(--font-display, var(--dt-sans))",
  letterSpacing: "-.02em",
} as const;
const familyFeaturedBlurbStyle = { minHeight: 0, fontSize: 12, lineHeight: 1.65 } as const;

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
          <h2 id="dt-sec-creations" style={sectionTitleStyle}>
            creations made in the studios
          </h2>
          <p>video, image, 3d, music and audio produced with the family engines — upload yours after entering.</p>
        </header>
        <div className="dt-landing__cols">
          <div className="dt-lancards" style={trackGridStyle}>
            {assets.map((asset, index) => (
              <article className="dt-lancard" key={asset.id} style={cardStyle(index)}>
                <span className="dt-lancard__tag">{assetLabel(asset)}</span>
                <strong style={index === 0 ? featuredTitleStyle : undefined}>{asset.title}</strong>
                <small style={index === 0 ? featuredBlurbStyle : cardDataStyle}>
                  {asset.engine} · {asset.duration ?? asset.size}
                </small>
              </article>
            ))}
          </div>
          <div className="dt-lancards" style={trackGridStyle}>
            {tracks.map((track, index) => (
              <article className="dt-lancard" key={track.id} style={cardStyle(index)}>
                <span className="dt-lancard__tag">music · katexis</span>
                <strong style={index === 0 ? featuredTitleStyle : undefined}>{track.title}</strong>
                <small style={index === 0 ? featuredBlurbStyle : cardDataStyle}>
                  {track.minutes} min · {track.blurb}
                </small>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="dt-landing__section" id="recipes" aria-labelledby="dt-sec-recipes">
        <header className="dt-landing__sechead">
          <h2 id="dt-sec-recipes" style={sectionTitleStyle}>
            runnable examples and recipes
          </h2>
          <p>the recipe gallery runs on the platform runner — from basic to advanced, nothing to install.</p>
        </header>
        <div className="dt-lancards" style={trackGridStyle}>
          {recipes.map((recipe, index) => (
            <article className="dt-lancard" key={recipe.name} style={cardStyle(index)}>
              <span className="dt-lancard__tag" style={{ color: gradetone[recipe.grade] }}>
                {recipe.grade}
              </span>
              <strong style={index === 0 ? featuredTitleStyle : undefined}>{recipe.name}</strong>
              <small style={index === 0 ? featuredBlurbStyle : cardDataStyle}>
                {recipe.family} · {recipe.duration}
              </small>
            </article>
          ))}
        </div>
      </section>

      <section className="dt-landing__section" id="apps" aria-labelledby="dt-sec-apps">
        <header className="dt-landing__sechead">
          <h2 id="dt-sec-apps" style={sectionTitleStyle}>
            apps of the os
          </h2>
          <p>the native studios and the binary runners — the same interface of the panel, open to everyone.</p>
        </header>
        <div className="dt-lancards" style={trackGridStyle}>
          {apps.map((app, index) => (
            <article className="dt-lancard" key={app.id} style={cardStyle(index)}>
              <span className="dt-lancard__tag">
                {app.owner} · {app.engine}
              </span>
              <strong style={index === 0 ? featuredTitleStyle : undefined}>{app.title}</strong>
              <small style={index === 0 ? featuredBlurbStyle : cardDataStyle}>{app.blurb}</small>
            </article>
          ))}
          {runners.length > 0 && (
            <div className="dt-runnerlist" style={runnerPanelStyle}>
              <p style={runnerHeadStyle}>binary runners</p>
              <ul style={runnerRowsStyle}>
                {runners.map((runner) => (
                  <li key={runner.id} style={runnerRowStyle}>
                    <Play
                      size={11}
                      aria-hidden="true"
                      style={{ flex: "none", marginTop: 3, color: "var(--dt-faint)" }}
                    />
                    <span style={runnerBodyStyle}>
                      <strong style={runnerNameStyle}>{runner.title}</strong>
                      <small style={runnerMetaStyle}>
                        {runner.runner} · {runner.kind} · {runner.formats} · {runner.blurb}
                      </small>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>

      <section className="dt-landing__section" id="family" aria-labelledby="dt-sec-family">
        <header className="dt-landing__sechead">
          <h2 id="dt-sec-family" style={sectionTitleStyle}>
            the family, one os
          </h2>
          <p>five branded apps over the same engines — each site lives on its own subdomain.</p>
        </header>
        <div className="family-grid" style={trackGridStyle}>
          {sites.map((site, index) => (
            <a
              key={site.host}
              className="family-card"
              href={site.host}
              style={index === 0 ? familyFeaturedStyle : familyTrackStyle}
            >
              <span className="family-card__host" style={familyHostStyle}>
                {site.host.replace("https://", "")}
              </span>
              <strong style={index === 0 ? familyFeaturedNameStyle : undefined}>{site.name}</strong>
              <p style={index === 0 ? familyFeaturedBlurbStyle : undefined}>{site.blurb}</p>
            </a>
          ))}
        </div>
      </section>
    </>
  );
}
