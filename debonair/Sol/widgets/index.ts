/**
 * index.ts — the universal widget surface of debonair: every widget of the
 * Sol/widgets folder answers from this one module, so the pages import
 * their components from a single place and the dotted widget file name
 * lives exactly once (here) instead of repeating across every page —
 * the components stay complete independent files beside this surface.
 */
export * from "./HomeCoverart.tsx";
export { default as HomeEntrygate } from "./HomeEntrygate.tsx";
export * from "./HomeEntrygate.tsx";
export * from "./HomeSongcard.tsx";
export { default as ShellPlayerbar } from "./ShellPlayerbar.tsx";
export * from "./ShellPlayerbar.tsx";
export { default as StudioFader } from "./StudioFader.tsx";
export * from "./StudioFader.tsx";
export { default as StudioPianoroll } from "./StudioPianoroll.tsx";
export * from "./StudioPianoroll.tsx";
export { default as StudioSpectrum } from "./StudioSpectrum.tsx";
export * from "./StudioSpectrum.tsx";
export { default as StudioStagestepper } from "./StudioStagestepper.tsx";
export * from "./StudioStagestepper.tsx";
export { default as StudioTimeline } from "./StudioTimeline.tsx";
export * from "./StudioTimeline.tsx";
export { default as StudioVumeter } from "./StudioVumeter.tsx";
export * from "./StudioVumeter.tsx";
