/**
 * musictracks.tsx — the tracks card of the audio app: hairline rows with
 * the real catalog fields (title, minutes) and the queue action.
 * Loose component of the audio page.
 */
import {MusicNote2PlayFilled} from "@fluentui/react-icons";
import type { StudioTrack } from "../../catalog";
import { osText } from "../../oslabels.ts";

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
        {osText("audio.tracks.title")}
        {rows.length ? <span className="dtw-navrow__count">{rows.length}</span> : null}
      </h2>
      {rows.length === 0 ? (
        <p className="dtw-copy">{loaded ? osText("audio.tracks.empty") : osText("studios.loading")}</p>
      ) : (
        <ul className="dtw-music__rows">
          {rows.map((track) => (
            <li key={track.id} className="dtw-music__row">
              <div className="dtw-music__body">
                <h3>{track.title}</h3>
                <p className="dtw-music__meta">
                  <span>{osText("audio.tracks.minutes").replace("{value}", track.minutes)}</span>
                </p>
              </div>
              <button
                type="button"
                className="dtw-action dtw-action--primary"
                onClick={() => onQueue(track)}
                aria-label={osText("audio.tracks.queueAria").replace("{title}", track.title)}
              >
                <MusicNote2PlayFilled fontSize={12} aria-hidden="true" />
                {osText("audio.tracks.queue")}
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
