/**
 * videoassets.tsx — the assets card of the video app: hairline rows with
 * the real catalog fields (title, engine, duration) and the render action.
 * Loose component of the video page.
 */
import { MoviesAndTvFilled } from "@fluentui/react-icons";
import type { StudioAsset } from "../../catalog";

export function VideoAssets({
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
        Assets
        {rows.length ? <span className="dtw-navrow__count">{rows.length}</span> : null}
      </h2>
      {rows.length === 0 ? (
        <p className="dtw-copy">{loaded ? "No assets in the catalog" : "Loading the catalog"}</p>
      ) : (
        <ul className="dtw-video__rows">
          {rows.map((asset) => (
            <li key={asset.id} className="dtw-video__row">
              <div className="dtw-video__body">
                <h3>{asset.title}</h3>
                <p className="dtw-video__meta">
                  <span>{asset.engine}</span>
                  <span>{asset.duration}</span>
                </p>
              </div>
              <button
                type="button"
                className="dtw-action dtw-action--primary"
                onClick={() => onRender(asset)}
                aria-label={`Render ${asset.title}`}
              >
                <MoviesAndTvFilled fontSize={12} aria-hidden="true" />
                Render
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
