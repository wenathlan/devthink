// # seed — the in-memory content tables of this site: the offline answer of the static
// build and the first-run rows of the self-hosted sqlite database. Plain memory only —
// nothing here touches the visitor machine; the same rows ship in the site database and
// reach the pages over HTTPS when a catalog endpoint is configured.

import type {
  FeatureCard,
  GenreConfig,
  LibraryTrackRow,
  MixerStripRow,
  OptionChoice,
  ReadoutRow,
  SignalBadge,
  TimelineTrack,
} from "./katexis.ts";

export const seedGenres: readonly GenreConfig[] = [
  { id: "trap", label: "Trap" },
  { id: "pop", label: "Pop" },
  { id: "edm", label: "EDM" },
  { id: "hiphop", label: "Hip-hop" },
  { id: "rnb", label: "R&B" },
  { id: "house", label: "House" },
  { id: "techno", label: "Techno", selected: true },
  { id: "ambient", label: "Ambient" },
  { id: "cinematic", label: "Cinematic" },
  { id: "jazz", label: "Jazz" },
  { id: "rock", label: "Rock" },
  { id: "funk", label: "Funk" },
  { id: "reggaeton", label: "Reggaeton" },
  { id: "drill", label: "Drill" },
  { id: "latin", label: "Latin" },
];

export const seedTimelineTracks: readonly TimelineTrack[] = [
  {
    name: "Drums",
    sound: "trap groove · swing 12%",
    colorClass: "c1",
    clips: [
      { label: "Intro", leftPercent: 0, widthPercent: 12 },
      { label: "Verse groove", leftPercent: 12, widthPercent: 33 },
      { label: "Fill", leftPercent: 45, widthPercent: 7 },
      { label: "Drop", leftPercent: 52, widthPercent: 33 },
      { label: "Outro", leftPercent: 85, widthPercent: 15 },
    ],
  },
  {
    name: "Bass",
    sound: "808 sub · key C",
    colorClass: "c2",
    clips: [
      { label: "Sub 808", leftPercent: 8, widthPercent: 30 },
      { label: "Walk", leftPercent: 38, widthPercent: 14 },
      { label: "Reese", leftPercent: 52, widthPercent: 34 },
    ],
  },
  {
    name: "Keys",
    sound: "dark pad · C min",
    colorClass: "c3",
    clips: [
      { label: "Pad C min", leftPercent: 0, widthPercent: 30 },
      { label: "Stabs", leftPercent: 30, widthPercent: 22 },
      { label: "Chorus chords", leftPercent: 52, widthPercent: 48 },
    ],
  },
  {
    name: "Lead",
    sound: "motif · call/response",
    colorClass: "c4",
    clips: [
      { label: "Motif A", leftPercent: 18, widthPercent: 27 },
      { label: "Call & response", leftPercent: 52, widthPercent: 32 },
    ],
  },
];

export const seedMixerStrips: readonly MixerStripRow[] = [
  { name: "Drums", meterPercent: 68, faderDb: -4 },
  { name: "Bass", meterPercent: 54, faderDb: -6 },
  { name: "Keys", meterPercent: 40, faderDb: -9 },
  { name: "Lead", meterPercent: 47, faderDb: -7 },
  { name: "Master", meterPercent: 72, faderDb: -2, master: true },
];

export const seedReadouts: readonly ReadoutRow[] = [
  { label: "BPM", value: "140" },
  { label: "Key", value: "C min" },
  { label: "Position", value: "00:04.12" },
  { label: "Bar", value: "5.2" },
  { label: "Swing", value: "12%" },
];

export const seedLibraryTracks: readonly LibraryTrackRow[] = [
  { name: "Midnight Tide", genre: "House", duration: "3:42", status: "ready" },
  { name: "Paper Lanterns", genre: "Pop", duration: "3:05", status: "ready" },
  { name: "Static Bloom", genre: "Techno", duration: "4:18", status: "rendering" },
  { name: "Copper Sky", genre: "Cinematic", duration: "2:56", status: "ready" },
  { name: "Velvet Static", genre: "R&B", duration: "3:21", status: "draft" },
  { name: "Drill Sermon", genre: "Drill", duration: "2:47", status: "ready" },
];

export const seedStageCards: readonly FeatureCard[] = [
  {
    group: "home-stages",
    title: "Generation",
    badge: "F-DBN-001..009",
    detail:
      "Theory, harmony, melody and rhythm engines draft the whole arrangement: chord progressions with voice leading, bass lines, drum grooves and instrument presets across 15 genres. Seeded RNG means the same prompt and seed always return the same take.",
  },
  {
    group: "home-stages",
    title: "Editing",
    badge: "F-DBN-006 · 010 · 029",
    detail:
      "A step sequencer and piano roll over four track groups: mute, solo, per-layer volume and BPM per group. Regenerate a single melody or swap a drum variation without touching the rest of the arrangement.",
  },
  {
    group: "home-stages",
    title: "Mastering",
    badge: "F-DBN-070..074",
    detail:
      "Genre-aware mixing recipes, 4-band multiband mastering, M/S imaging and a true-peak limiter at −1 dBTP. Loudness is normalized to BS.1770-4 with per-platform targets: Spotify −14 LUFS, Apple −16, Beatport −9.",
  },
  {
    group: "home-stages",
    title: "Export",
    badge: "F-DBN-013 · 014 · 040",
    detail:
      "Offline WAV renders at 48 kHz in seconds, MIDI export of any pattern in under 50 ms, stems as separate files and validated bounces per platform. Your renders stay yours — no vault, no lock-in.",
  },
];

export const seedHeroBadges: readonly SignalBadge[] = [
  { group: "hero", label: "katexis engine", tone: "default", dot: true },
  { group: "hero", label: "48 kHz", tone: "success" },
  { group: "hero", label: "multitrack", tone: "info" },
];

export const seedLocaleChoices: readonly OptionChoice[] = [
  { group: "locale", value: "en", label: "English", selected: true },
  { group: "locale", value: "pt", label: "Português (BR)" },
];
