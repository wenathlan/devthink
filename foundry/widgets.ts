/**
 * widgets.ts — the universal widget surface of foundry: every widget of the
 * sol/widgets folder answers from this one module at the app root, so the
 * pages import their components from a single place and the dotted widget
 * file name lives exactly once (here) instead of repeating across every
 * page — the components stay complete independent files inside the
 * sol/widgets folder.
 */
export { default as GraphPanel } from "./sol/widgets/ArtifactsGraphpanel.tsx";
export * from "./sol/widgets/HomeEntry.tsx";
export { default as HomeEntrygate } from "./sol/widgets/HomeEntrygate.tsx";
export * from "./sol/widgets/HomeEntrygate.tsx";
export * from "./sol/widgets/HomeTabs.tsx";
export { default as ShellBrandmark } from "./sol/widgets/ShellBrandmark.tsx";
export * from "./sol/widgets/ShellBrandmark.tsx";
export { default as ShellEmptystate } from "./sol/widgets/ShellEmptystate.tsx";
export * from "./sol/widgets/ShellEmptystate.tsx";
