/**
 * genrecard.tsx — the genre profile card of the home vitrine: one card per
 * catalog profile row (the bpm range, the key pool top, the band balance
 * bar and the trained-on count) — presentation only, the data path rides
 * the catalog seam (the db rows the gateway mine lane lands; the offline
 * seed answers the fifteen untrained genres). An untrained card (trainedOn
 * 0) wears the honest empty face — no invented numbers, the awaiting line
 * and the flat band bar. The stagger and the rise ride the same suno
 * grammar the song cards wear; the surfaces stay transform/opacity only.
 */

import type { CSSProperties } from "react";
import type { GenreProfileCard } from "../../katexis.ts";
import { label, labelfill } from "../../labels.ts";

/** The props of one genre card. */
type GenreCardProps = {
  /** The catalog profile row the card draws. */
  card: GenreProfileCard;
  /** The stagger slot of the card (60ms a step, presentation only). */
  slot: number;
};

/**
 * GenreCard — one trained-profile tile of the vitrine grid.
 *
 * @param props the profile row and the stagger slot.
 * @returns the card element.
 */
export function GenreCard({ card, slot }: GenreCardProps) {
  const trained = card.trainedOn > 0;
  const total = card.bandsLow + card.bandsMid + card.bandsHigh;
  const share = (value: number): number => (total > 0 ? (value / total) * 100 : 0);
  const meta = trained
    ? labelfill("home.vitrine.meta", { min: String(card.bpmMin), max: String(card.bpmMax), key: card.keyTop })
    : label("home.vitrine.awaiting");
  return (
    <article
      className="genre-card"
      style={{ "--i": slot } as CSSProperties}
      data-trained={trained ? "true" : undefined}
    >
      <h3 className="genre-name">{card.label}</h3>
      <p className="genre-meta">{meta}</p>
      <div
        className="band-bar"
        role="img"
        aria-label={labelfill("home.vitrine.bandsAria", {
          low: card.bandsLow.toFixed(2),
          mid: card.bandsMid.toFixed(2),
          high: card.bandsHigh.toFixed(2),
        })}
      >
        <span className="band-seg band-seg--low" style={{ width: `${share(card.bandsLow)}%` }} />
        <span className="band-seg band-seg--mid" style={{ width: `${share(card.bandsMid)}%` }} />
        <span className="band-seg band-seg--high" style={{ width: `${share(card.bandsHigh)}%` }} />
      </div>
      <p className="genre-foot">
        {trained
          ? labelfill("home.vitrine.trainedOn", {
              count: String(card.trainedOn),
              s: card.trainedOn === 1 ? "" : "s",
            })
          : label("home.vitrine.untrained")}
      </p>
    </article>
  );
}
