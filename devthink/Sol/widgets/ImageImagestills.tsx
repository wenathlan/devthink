/**
 * imagestills.tsx — the stills card of the image studio: hairline rows with
 * the real catalog fields (title, engine, size) and the render action.
 * Loose component of the image page.
 */
import { PlayFilled } from "@fluentui/react-icons";
import type { StudioAsset } from "../../catalog";
import { osText } from "../../oslabels.ts";

/** megapixelsOf — the still's real pixel area from its catalog size
 * ("4032×3024" → 12.2mp); unparseable sizes answer null and the row skips
 * the number. */
function megapixelsOf(size: string | undefined): number | null {
  if (!size) return null;
  const [w, h] = size.split("×").map((value) => Number.parseFloat(value));
  if (!Number.isFinite(w) || !Number.isFinite(h) || w <= 0 || h <= 0) return null;
  return (w * h) / 1_000_000;
}

export function ImageStills({
  rows,
  loaded,
  onRender,
}: {
  rows: readonly StudioAsset[];
  loaded: boolean;
  onRender: (asset: StudioAsset) => void;
}) {
  return (
    <section className="dtw-card">
      <h2 className="dtw-cardtitle">
        {osText("image.stills.title")}
        {rows.length ? <span className="dtw-navrow__count">{rows.length}</span> : null}
      </h2>
      {rows.length === 0 ? (
        <p className="dtw-copy">{loaded ? osText("image.stills.empty") : osText("studios.loading")}</p>
      ) : (
        <ul className="dtw-image__rows">
          {rows.map((asset) => {
            const mp = megapixelsOf(asset.size);
            return (
              <li key={asset.id} className="dtw-image__row">
                <div className="dtw-image__body">
                  <h3>{asset.title}</h3>
                  <p className="dtw-image__meta">
                    <span>{asset.engine}</span>
                    <span>{asset.size ?? osText("image.stills.unknownSize")}</span>
                    {mp !== null ? <span>{osText("image.stills.mp").replace("{value}", mp.toFixed(1))}</span> : null}
                  </p>
                </div>
                <button
                  type="button"
                  className="dtw-action dtw-action--primary"
                  onClick={() => onRender(asset)}
                  aria-label={osText("image.stills.renderAria").replace("{title}", asset.title)}
                >
                  <PlayFilled fontSize={12} aria-hidden="true" />
                  {osText("image.stills.render")}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
