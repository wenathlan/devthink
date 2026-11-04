// # catalog — the typed accessor the Sol pages call: it serves the content tables of the
// site from the site's own self-hosted db. When VITE_CATALOG_URL points at the site api
// the rows arrive over HTTPS; otherwise the static build answers from the in-memory seed
// module. Nothing is written anywhere: the memo below is plain memory, the visitor
// machine only loads the interface.

import type { VitrineTrackValue } from "./gatewayapi.ts";
import type {
  FeatureCard,
  GenreConfig,
  GenreProfileCard,
  LibraryTrackRow,
  MixerStripRow,
  OptionChoice,
  ReadoutRow,
  SignalBadge,
  TimelineTrack,
  VitrineTrackRow,
} from "./katexis.ts";
import {
  seedGenreProfileCards,
  seedGenres,
  seedHeroBadges,
  seedLibraryTracks,
  seedLocaleChoices,
  seedMixerStrips,
  seedReadouts,
  seedStageCards,
  seedTimelineTracks,
  seedVitrineTracks,
} from "./seed.ts";

/** base url of the site catalog api (self-hosted db over HTTPS); empty answers from the seed */
const endpoint = (import.meta.env.VITE_CATALOG_URL as string | undefined)?.trim().replace(/\/$/, "") ?? "";

const memo = new Map<string, Promise<unknown>>();

async function fetchTable(name: string): Promise<unknown[]> {
  const response = await fetch(`${endpoint}/${name}`, { headers: { accept: "application/json" } });
  if (!response.ok) throw new Error(`catalog ${name} answered ${response.status}`);
  return (await response.json()) as unknown[];
}

/** Resolves one content table: the api over HTTPS when configured, the seed offline. */
function table<T>(name: string, seeds: readonly T[]): Promise<T[]> {
  let entry = memo.get(name);
  if (!entry) {
    entry = endpoint ? fetchTable(name) : Promise.resolve([...seeds]);
    memo.set(name, entry);
    entry.catch(() => memo.delete(name)); // a failed fetch retries on the next call
  }
  return entry as Promise<T[]>;
}

export function listGenres(): Promise<GenreConfig[]> {
  return table("genres", seedGenres);
}

export function listTimelineTracks(): Promise<TimelineTrack[]> {
  return table("timeline-tracks", seedTimelineTracks);
}

export function listMixerStrips(): Promise<MixerStripRow[]> {
  return table("mixer-strips", seedMixerStrips);
}

export function listReadouts(): Promise<ReadoutRow[]> {
  return table("readouts", seedReadouts);
}

export function listLibraryTracks(): Promise<LibraryTrackRow[]> {
  return table("library-tracks", seedLibraryTracks);
}

export function listStageCards(): Promise<FeatureCard[]> {
  return table("cards.home-stages", seedStageCards);
}

export function listHeroBadges(): Promise<SignalBadge[]> {
  return table("badges.hero", seedHeroBadges);
}

/** The vitrine lane: the genre profile cards the home surfaces — the
 * trained profile rows (bpm range, key pool top, band balance, the
 * trained-on count) the miner lane lands in the db; the seed answers the
 * fifteen untrained genres offline. */
export function listGenreProfileCards(): Promise<GenreProfileCard[]> {
  return table("cards.genre-profiles", seedGenreProfileCards);
}

/** The vitrine lane: the streaming shelf rows the home song grid reads —
 * the published generated takes beside the ingested references (the
 * publish lane moves a rendered track row onto the vitrine, the site api
 * answers the db rows over this seam); the seed answers the honest empty
 * shelf offline — the genre profile cards' own law, mirrored. */
export function listVitrineTracks(): Promise<VitrineTrackRow[]> {
  return table("tracks.vitrine", seedVitrineTracks);
}

/**
 * Folds one vitrine wire row (the gateway's GET /api/v1/tracks answer)
 * onto the catalog row the home grid reads — the one law both shapes
 * ride, so the site api and the tests answer the same fold.
 *
 * @param value the vitrine wire row.
 * @returns the catalog row.
 */
export function vitrineRowOf(value: VitrineTrackValue): VitrineTrackRow {
  return {
    group: "vitrine",
    kind: value.kind,
    id: value.id,
    name: value.name,
    genre: value.genre,
    seconds: value.seconds,
    blobId: value.wavPointer,
    mime: "audio/wav",
    publishedAt: value.publishedAt,
  };
}

/** Reads one group of the settings selects (parameterized by group). */
export function listOptionChoices(group: "locale"): Promise<OptionChoice[]> {
  return table(`choices.${group}`, seedLocaleChoices);
}
