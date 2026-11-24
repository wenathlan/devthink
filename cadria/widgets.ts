/**
 * widgets.ts — the universal widget surface of cadria: every widget of the
 * sol/widgets folder answers from this one module at the app root, so the
 * pages import their components from a single place and the dotted widget
 * file name lives exactly once (here) instead of repeating across every
 * page — the components stay complete independent files inside the
 * sol/widgets folder.
 *
 * the detailed engine wave (the owner order of the waves): the platform
 * surfaces ride their real mounts — the seven composite widgets the wave
 * rebuilt (the studio bench and pipeline, the edit timeline, the gallery
 * wall, the home strip, the player viewer, the settings surface) answer
 * from this barrel beside the construction face that stays as the arming
 * face their face prop carries, the chrome and the first-run flow that
 * stay (the entry gates, the drawn marks the shell re-exports, the opening
 * strip of the intro — its demo chain is real, so the intro keeps its
 * widgets) and the page furniture the composite mounts wire themselves
 * (the studio controls, the source rail, the stage art, the export and
 * readout rows, the empty state).
 */
export { default as Constructionface } from "./sol/widgets/Constructionface.tsx";
export * from "./sol/widgets/Constructionface.tsx";
export { default as EditTimeline } from "./sol/widgets/EditTimeline.tsx";
export { GalleryWall } from "./sol/widgets/GalleryWall.tsx";
export { HomeSurface } from "./sol/widgets/HomeSurface.tsx";
export { default as PlayerViewer } from "./sol/widgets/PlayerViewer.tsx";
export { SettingsSurface } from "./sol/widgets/SettingsSurface.tsx";
export { StudioBench } from "./sol/widgets/StudioBench.tsx";
export { PipelineBench } from "./sol/widgets/StudioPipeline.tsx";
export { default as HomeEntrygate } from "./sol/widgets/HomeEntrygate.tsx";
export * from "./sol/widgets/HomeEntrygate.tsx";
export { default as IntroCapabilities } from "./sol/widgets/IntroCapabilities.tsx";
export * from "./sol/widgets/IntroCapabilities.tsx";
export { default as IntroDemo } from "./sol/widgets/IntroDemo.tsx";
export * from "./sol/widgets/IntroDemo.tsx";
export { default as IntroFooter } from "./sol/widgets/IntroFooter.tsx";
export * from "./sol/widgets/IntroFooter.tsx";
export { default as IntroSplash } from "./sol/widgets/IntroSplash.tsx";
export * from "./sol/widgets/IntroSplash.tsx";
export { default as ShellBrandmark } from "./sol/widgets/ShellBrandmark.tsx";
export * from "./sol/widgets/ShellBrandmark.tsx";
export { default as ShellCadriamark } from "./sol/widgets/ShellCadriamark.tsx";
export * from "./sol/widgets/ShellCadriamark.tsx";
export { default as EntryGate } from "./sol/widgets/ShellEntrygate.tsx";
export * from "./sol/widgets/ShellEntrygate.tsx";
