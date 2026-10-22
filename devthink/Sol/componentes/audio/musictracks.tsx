/**
 * musictracks.tsx — the tracks card of the audio app: hairline rows with
 * the real catalog fields (title, engine, minutes) and the queue action.
 * Loose component of the audio page.
 */
import {MusicNote2PlayFilled} from "@fluentui/react-icons";
import type { StudioTrack } from "../../../catalog.ts";

export function MusicTracks({
  rows,
  loaded,
  onQueue }: {
  rows: readonly StudioTrack[];
  loaded: boolean;
  onQueue: (track: StudioTrack) => void;
}) {
  return (
    <section className="dtw-card">
      <h2 className="dtw-cardtitle">
        Tracks
        {rows.length ? <span className="dtw-navrow__count">{rows.length}</span> : null}
      </h2>
      {rows.length === 0 ? (
        <p className="dtw-copy">{loaded ? "No tracks in the catalog" : "Loading the catalog"}</p>
      ) : (
        <ul className="dtw-music__rows">
          {rows.map((track) => (
            <li key={track.id} className="dtw-music__row">
              <div className="dtw-music__body">
                <h3>{track.title}</h3>
                <p className="dtw-music__meta">
                  <span>{track.engine}</span>
                  <span>{track.minutes} min</span>
                </p>
              </div>
              <button
                type="button"
                className="dtw-action dtw-action--primary"
                onClick={() => onQueue(track)}
                aria-label={`Queue ${track.title}`}
              >
                <MusicNote2PlayFilled fontSize={12} aria-hidden="true" />
                Queue
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
