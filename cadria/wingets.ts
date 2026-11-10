/**
 * wingets.ts — the universal winget surface of cadria: every winget of the
 * sol/wingets folder answers from this one module at the app root, so the
 * pages import their components from a single place and the dotted winget
 * file name lives exactly once (here) instead of repeating across every
 * page — the components stay complete independent files inside the
 * sol/wingets folder.
 *
 * the detailed engine wave (the owner order of the waves): the platform
 * surfaces ride their real mounts — the seven composite wingets the wave
 * rebuilt (the studio bench and pipeline, the edit timeline, the gallery
 * wall, the home strip, the player viewer, the settings surface) answer
 * from this barrel beside the construction face that stays as the arming
 * face their face prop carries, the chrome and the first-run flow that
 * stay (the entry gates, the drawn marks the shell re-exports, the opening
 * strip of the intro — its demo chain is real, so the intro keeps its
 * wingets) and the page furniture the composite mounts wire themselves
 * (the studio controls, the source rail, the stage art, the export and
 * readout rows, the empty state).
 */
export { default as Constructionface } from "./sol/wingets/Constructionface.tsx";
export * from "./sol/wingets/Constructionface.tsx";
export { default as EditTimeline } from "./sol/wingets/EditTimeline.tsx";
export { GalleryWall } from "./sol/wingets/GalleryWall.tsx";
export { HomeSurface } from "./sol/wingets/HomeSurface.tsx";
export { default as PlayerViewer } from "./sol/wingets/PlayerViewer.tsx";
export { SettingsSurface } from "./sol/wingets/SettingsSurface.tsx";
export { StudioBench } from "./sol/wingets/StudioBench.tsx";
export { PipelineBench } from "./sol/wingets/StudioPipeline.tsx";
export { default as HomeEntrygate } from "./sol/wingets/HomeEntrygate.tsx";
export * from "./sol/wingets/HomeEntrygate.tsx";
export { default as IntroCapabilities } from "./sol/wingets/IntroCapabilities.tsx";
export * from "./sol/wingets/IntroCapabilities.tsx";
export { default as IntroDemo } from "./sol/wingets/IntroDemo.tsx";
export * from "./sol/wingets/IntroDemo.tsx";
export { default as IntroFooter } from "./sol/wingets/IntroFooter.tsx";
export * from "./sol/wingets/IntroFooter.tsx";
export { default as IntroSplash } from "./sol/wingets/IntroSplash.tsx";
export * from "./sol/wingets/IntroSplash.tsx";
export { default as ShellBrandmark } from "./sol/wingets/ShellBrandmark.tsx";
export * from "./sol/wingets/ShellBrandmark.tsx";
export { default as ShellCadriamark } from "./sol/wingets/ShellCadriamark.tsx";
export * from "./sol/wingets/ShellCadriamark.tsx";
export { default as EntryGate } from "./sol/wingets/ShellEntrygate.tsx";
export * from "./sol/wingets/ShellEntrygate.tsx";
