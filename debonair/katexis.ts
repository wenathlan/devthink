// # katexis — the audio and music engine of the family, housed at the debonair root.
// Library-grade module shipped inside the published packages (npm, maven with the Spring
// Boot rider): it owns the domain types and pure, generic helpers only — zero consumer
// data. The content tables of this site live in the db layer (seed.ts + db.ts) and reach
// the Sol pages through the catalog accessor over HTTPS; a page never hardcodes a row.

/** Badge tone used across the family cards and chips. */
export type BadgeTone = "default" | "success" | "error" | "warning" | "info";

/** One genre of the generator catalog. */
export interface GenreConfig {
  id: string;
  label: string;
  selected?: boolean;
}

/** One clip of the arrangement timeline. */
export interface TimelineClip {
  label: string;
  leftPercent: number;
  widthPercent: number;
}

/** One track group of the arrangement timeline. */
export interface TimelineTrack {
  name: string;
  sound: string;
  /** the clip color family of the sol palette (c1..c4) */
  colorClass: string;
  clips: readonly TimelineClip[];
}

/** One strip of the mixer. */
export interface MixerStripRow {
  name: string;
  meterPercent: number;
  faderDb: number;
  master?: boolean;
}

/** One readout of the transport bar. */
export interface ReadoutRow {
  label: string;
  value: string;
}

export type RenderStage = "queued" | "rendering" | "ready";

export const RENDER_STAGES: readonly RenderStage[] = ["queued", "rendering", "ready"];

/** One row of the render queue. */
export interface RenderJobRow {
  id: string;
  name: string;
  genreLabel: string;
  seed: number;
  duration: string;
  stage: RenderStage;
  createdAt: string;
}

export type LibraryStatus = "ready" | "rendering" | "draft";

/** One row of the library table. */
export interface LibraryTrackRow {
  name: string;
  genre: string;
  duration: string;
  status: LibraryStatus;
}

/** A structured card rendered from the db layer (home stages). */
export interface FeatureCard {
  group: string;
  title: string;
  badge?: string;
  detail: string;
}

/** A small tone-coded chip (hero badges). */
export interface SignalBadge {
  group: string;
  label: string;
  tone: BadgeTone;
  dot?: boolean;
}

/** One option of the settings selects. */
export interface OptionChoice {
  group: string;
  value: string;
  label: string;
  selected?: boolean;
}

/** Resolves the css class suffix of a badge tone (empty for the default tone). */
export function toneClass(tone: BadgeTone): string {
  return tone === "default" ? "" : ` ${tone}`;
}

/** Resolves the badge tone of a library status. */
export function statusTone(status: LibraryStatus): BadgeTone {
  if (status === "ready") return "success";
  if (status === "rendering") return "warning";
  return "info";
}

// ---------------------------------------------------------------------------
// engine spec (configuration of the engine itself, not site content)
// ---------------------------------------------------------------------------

/** mastering spec of the engine: true-peak ceiling and per-platform loudness targets */
export const MASTERING = {
  sampleRateHz: 48000,
  truePeakDbtp: -1,
  loudnessStandard: "BS.1770-4",
  platformTargetsLufs: { spotify: -14, apple: -16, beatport: -9 },
} as const;

/** the maximum prompt length the generator accepts */
export const PROMPT_MAX_LENGTH = 280;

// ---------------------------------------------------------------------------
// pure helpers
// ---------------------------------------------------------------------------

/** Formats a fader value as a dB readout ("-4.0 dB"). */
export function formatDb(value: number): string {
  return `${value.toFixed(1)} dB`;
}

/** Derives a six-digit render seed. */
export function deriveSeed(): number {
  return Math.floor(100000 + Math.random() * 900000);
}

/** Builds a track name from a prompt: the first four words, punctuation trimmed, capitalized. */
export function trackNameFromPrompt(prompt: string): string {
  const name = prompt
    .trim()
    .split(/\s+/)
    .slice(0, 4)
    .join(" ")
    .replace(/[.,;:!?]+$/, "");
  return name.charAt(0).toUpperCase() + name.slice(1);
}

/** Estimates a demo render duration as m:ss inside the two-to-three minute band. */
export function estimateDuration(): string {
  const minutes = 2 + Math.floor(Math.random() * 2);
  const seconds = String(Math.floor(Math.random() * 60)).padStart(2, "0");
  return `${minutes}:${seconds}`;
}

/** Finds a genre by its label ("Techno"). */
export function genreByLabel(genres: readonly GenreConfig[], label: string): GenreConfig | undefined {
  return genres.find((genre) => genre.label === label);
}

/** Filters the library rows by a free-text query over name, genre and status. */
export function filterTracks(tracks: readonly LibraryTrackRow[], query: string): LibraryTrackRow[] {
  const needle = query.trim().toLowerCase();
  if (!needle) return [...tracks];
  return tracks.filter((track) =>
    `${track.name} ${track.genre} ${track.status}`.toLowerCase().includes(needle),
  );
}
