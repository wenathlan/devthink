/**
 * widgets.ts — the universal widget surface of debonair: every widget of the
 * sol/widgets folder answers from this one module at the app root, so the
 * pages import their components from a single place and the dotted widget
 * file name lives exactly once (here) instead of repeating across every
 * page — the components stay complete independent files inside the
 * sol/widgets folder.
 *
 * the detailed engine wave (the owner order of the waves, landed): the
 * platform surfaces ride their real mounts again — the five composite
 * widgets the wave rebuilt (the landing strip of the home, the
 * decomposition bench of the ingest, the library shelf, the composer loop
 * of the generate and the preferences surface of the settings) answer from
 * this barrel beside the construction face that stays as the arming face
 * their face prop carries, and the chrome of the app frame (the entry gate
 * of the first-run flow, the shared transport of the shell). the DAW
 * console the studio wave landed keeps its own mount through its route
 * (sol/studio/studio.tsx — the studio wave's own geometry); the page
 * furniture the composites render (the song and genre cards, the drawn
 * cover art, the faders, timelines, rolls, spectra and meters) keeps
 * riding its own widget files, imported by the composites that own the
 * wiring — the barrel answers the composites and the chrome, the furniture
 * answers the composites.
 */

export * from "./sol/widgets/Constructionface.tsx";
export { default as Constructionface } from "./sol/widgets/Constructionface.tsx";
export { GenerateSurface } from "./sol/widgets/GenerateSurface.tsx";
export * from "./sol/widgets/HomeEntrygate.tsx";
export { default as HomeEntrygate } from "./sol/widgets/HomeEntrygate.tsx";
export { HomeSurface } from "./sol/widgets/HomeSurface.tsx";
export { IngestSurface } from "./sol/widgets/IngestSurface.tsx";
export { LibrarySurface } from "./sol/widgets/LibrarySurface.tsx";
export { SettingsSurface } from "./sol/widgets/SettingsSurface.tsx";
export * from "./sol/widgets/ShellPlayerbar.tsx";
export { default as ShellPlayerbar } from "./sol/widgets/ShellPlayerbar.tsx";
/* the detailed engine wave lands the page furniture again (the barrel law
 * the in-construction pass kept: the widget files themselves never left
 * their own files — the genre and song cards, the cover art beside them,
 * re-answer the barrel for the home and library surfaces that mount them) */
export { GenreCard } from "./sol/widgets/HomeGenrecard.tsx";
export * from "./sol/widgets/HomeGenrecard.tsx";
export { SongCard, SongCardSkeleton } from "./sol/widgets/HomeSongcard.tsx";
export * from "./sol/widgets/HomeSongcard.tsx";
export { CoverArt, coverHash } from "./sol/widgets/HomeCoverart.tsx";
export * from "./sol/widgets/HomeCoverart.tsx";
