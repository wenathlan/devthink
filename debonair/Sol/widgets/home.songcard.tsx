// the debonair song card — the suno-style grid tile of the landing.
/**
 * songcard.tsx — the loose components of the home song grid: one card per
 * catalog row (deterministic cover, title, the genre line as the artist
 * slot, the engine duration, the play key that rides the player bus) and the
 * loading skeleton that stands in while the catalog table answers. The
 * stagger (60ms a card) and the shimmer sweep ride the suno pass of
 * Sol/sol.css and stay transform/opacity only.
 */

import { PlayFilled } from "@fluentui/react-icons";
import type { CSSProperties } from "react";
import type { TakePlan } from "../../arranger.ts";
import type { LibraryTrackRow } from "../../katexis.ts";
import { CoverArt } from "./home.coverart.tsx";

/** The props of one song card. */
type SongCardProps = {
  /** The catalog row the card draws. */
  track: LibraryTrackRow;
  /** The take the play key renders on demand (the engine's real plan). */
  take: TakePlan;
  /** The stagger slot of the card (60ms a step, presentation only). */
  slot: number;
  /** Whether the bus is currently playing this card's take. */
  live: boolean;
  /** The play handler (the card never owns audio). */
  onPlay: (take: TakePlan) => void;
};

/**
 * SongCard — one cover-led tile of the landing grid.
 *
 * @param props the row, the take, the stagger slot and the play hand-off.
 * @returns the card element.
 */
export function SongCard({ track, take, slot, live, onPlay }: SongCardProps) {
  return (
    <article className="song-card" style={{ "--i": slot } as CSSProperties} data-live={live ? "true" : undefined}>
      <div className="song-card__frame">
        <CoverArt name={track.name} />
        <button
          type="button"
          className="song-play"
          aria-label={`Play ${track.name}`}
          title={`Play ${track.name} — ${track.genre} · ${track.duration}`}
          onClick={() => onPlay(take)}
        >
          <PlayFilled fontSize={18} aria-hidden="true" />
        </button>
      </div>
      <h3 className="song-name">{track.name}</h3>
      <p className="song-meta">
        {track.genre} · {track.duration}
      </p>
    </article>
  );
}

/**
 * SongCardSkeleton — the shimmer placeholder of one grid slot (the same
 * geometry as a card: the square frame, the two text bars).
 *
 * @param props the stagger slot.
 * @returns the skeleton element.
 */
export function SongCardSkeleton({ slot }: { slot: number }) {
  return (
    <article className="song-card song-card--skeleton" aria-hidden="true" style={{ "--i": slot } as CSSProperties}>
      <div className="song-card__frame song-skeleton" />
      <div className="song-skeleton song-skeleton--text" />
      <div className="song-skeleton song-skeleton--text song-skeleton--short" />
    </article>
  );
}
