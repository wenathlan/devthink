/**
 * index.ts — the universal widget surface of debonair: every widget of the
 * Sol/widgets folder answers from this one module, so the pages import
 * their components from a single place and the dotted widget file name
 * lives exactly once (here) instead of repeating across every page —
 * the components stay complete independent files beside this surface.
 */
export * from "./home.coverart.tsx";
export { default as HomeEntrygate } from "./home.entrygate.tsx";
export * from "./home.entrygate.tsx";
export * from "./home.songcard.tsx";
export { default as ShellPlayerbar } from "./shell.playerbar.tsx";
export * from "./shell.playerbar.tsx";
export { default as StudioFader } from "./studio.fader.tsx";
export * from "./studio.fader.tsx";
export { default as StudioPianoroll } from "./studio.pianoroll.tsx";
export * from "./studio.pianoroll.tsx";
export { default as StudioSpectrum } from "./studio.spectrum.tsx";
export * from "./studio.spectrum.tsx";
export { default as StudioStagestepper } from "./studio.stagestepper.tsx";
export * from "./studio.stagestepper.tsx";
export { default as StudioTimeline } from "./studio.timeline.tsx";
export * from "./studio.timeline.tsx";
export { default as StudioVumeter } from "./studio.vumeter.tsx";
export * from "./studio.vumeter.tsx";
