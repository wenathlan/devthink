/**
 * index.ts — the universal widget surface of vault: every widget of the
 * Sol/widgets folder answers from this one module, so the pages import
 * their components from a single place and the dotted widget file name
 * lives exactly once (here) instead of repeating across every page —
 * the components stay complete independent files beside this surface.
 */
export * from "./HomeEntry.tsx";
export { default as HomeEntrygate } from "./HomeEntrygate.tsx";
export * from "./HomeEntrygate.tsx";
export * from "./HomeTabs.tsx";
export { default as ShellBrandmark } from "./ShellBrandmark.tsx";
export * from "./ShellBrandmark.tsx";
export { default as ShellEmptystate } from "./ShellEmptystate.tsx";
export * from "./ShellEmptystate.tsx";
