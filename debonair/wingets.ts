/**
 * wingets.ts — the universal winget surface of debonair: every winget of the
 * sol/wingets folder answers from this one module at the app root, so the
 * pages import their components from a single place and the dotted winget
 * file name lives exactly once (here) instead of repeating across every
 * page — the components stay complete independent files inside the
 * sol/wingets folder.
 *
 * the detailed engine wave (the owner order of the waves, landed): the
 * platform surfaces ride their real mounts again — the five composite
 * wingets the wave rebuilt (the landing strip of the home, the
 * decomposition bench of the ingest, the library shelf, the composer loop
 * of the generate and the preferences surface of the settings) answer from
 * this barrel beside the construction face that stays as the arming face
 * their face prop carries, and the chrome of the app frame (the entry gate
 * of the first-run flow, the shared transport of the shell). the DAW
 * console the studio wave landed keeps its own mount through its route
 * (sol/studio/studio.tsx — the studio wave's own geometry); the page
 * furniture the composites render (the song and genre cards, the drawn
 * cover art, the faders, timelines, rolls, spectra and meters) keeps
 * riding its own winget files, imported by the composites that own the
 * wiring — the barrel answers the composites and the chrome, the furniture
 * answers the composites.
 */

export * from "./sol/wingets/Constructionface.tsx";
export { default as Constructionface } from "./sol/wingets/Constructionface.tsx";
export { GenerateSurface } from "./sol/wingets/GenerateSurface.tsx";
export * from "./sol/wingets/HomeEntrygate.tsx";
export { default as HomeEntrygate } from "./sol/wingets/HomeEntrygate.tsx";
export { HomeSurface } from "./sol/wingets/HomeSurface.tsx";
export { IngestSurface } from "./sol/wingets/IngestSurface.tsx";
export { LibrarySurface } from "./sol/wingets/LibrarySurface.tsx";
export { SettingsSurface } from "./sol/wingets/SettingsSurface.tsx";
export * from "./sol/wingets/ShellPlayerbar.tsx";
export { default as ShellPlayerbar } from "./sol/wingets/ShellPlayerbar.tsx";
/* the detailed engine wave lands the page furniture again (the barrel law
 * the in-construction pass kept: the winget files themselves never left
 * their own files — the genre and song cards, the cover art beside them,
 * re-answer the barrel for the home and library surfaces that mount them) */
export { GenreCard } from "./sol/wingets/HomeGenrecard.tsx";
export * from "./sol/wingets/HomeGenrecard.tsx";
export { SongCard, SongCardSkeleton } from "./sol/wingets/HomeSongcard.tsx";
export * from "./sol/wingets/HomeSongcard.tsx";
export { CoverArt, coverHash } from "./sol/wingets/HomeCoverart.tsx";
export * from "./sol/wingets/HomeCoverart.tsx";
