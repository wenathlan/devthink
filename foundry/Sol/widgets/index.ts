/**
 * index.ts — the universal widget surface of foundry: every widget of the
 * Sol/widgets folder answers from this one module, so the pages import
 * their components from a single place and the dotted widget file name
 * lives exactly once (here) instead of repeating across every page —
 * the components stay complete independent files beside this surface.
 */
export { default as GraphPanel } from "./artifacts.graphpanel.tsx";
export * from "./home.entry.tsx";
export { default as HomeEntrygate } from "./home.entrygate.tsx";
export * from "./home.entrygate.tsx";
export * from "./home.tabs.tsx";
export { default as ShellBrandmark } from "./shell.brandmark.tsx";
export * from "./shell.brandmark.tsx";
export { default as ShellEmptystate } from "./shell.emptystate.tsx";
export * from "./shell.emptystate.tsx";
