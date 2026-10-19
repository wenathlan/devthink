/**
 * gameslist.tsx — the runner binaries card: hairline rows with the monogram
 * cover, the real catalog fields and the launch action. Loose component of
 * the games page.
 */
import {PlayFilled} from "@fluentui/react-icons";
import type { RunnerBinary } from "../../catalog";

/** The two leading initials of a real title, cut for the cover glyph. */
function monogram(title: string): string {
  return title
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function GamesList({
  rows,
  loaded,
  onLaunch }: {
  rows: readonly RunnerBinary[];
  loaded: boolean;
  onLaunch: (binary: RunnerBinary) => void;
}) {
  return (
    <section className="dtw-card">
      <h2 className="dtw-cardtitle">Runner binaries</h2>
      {rows.length === 0 ? (
        <p className="dtw-copy">{loaded ? "No binaries in this filter" : "Loading the catalog"}</p>
      ) : (
        <ul className="dtw-games__rows">
          {rows.map((binary) => (
            <li key={binary.id} className="dtw-games__row">
              <span className="dtw-games__cover" aria-hidden="true">
                {monogram(binary.title)}
              </span>
              <div className="dtw-games__body">
                <h3>{binary.title}</h3>
                <p className="dtw-games__blurb">{binary.blurb}</p>
                <p className="dtw-games__meta">
                  <span className="dtw-games__kind" data-kind={binary.kind}>
                    {binary.kind}
                  </span>
                  <span>{binary.formats}</span>
                  <span>{binary.runner}</span>
                </p>
              </div>
              <button
                type="button"
                className="dtw-action dtw-action--primary"
                onClick={() => onLaunch(binary)}
                aria-label={`Launch ${binary.title}`}
              >
                <PlayFilled fontSize={12} aria-hidden="true" />
                Launch
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
