/**
 * wingets.ts — the universal winget surface of forge, seated at the root
 * beside the sol theme folder (the family law: every .ts logic file lives
 * at the root, only .tsx components live inside sol): every winget of the
 * sol/wingets folder answers from this one module, so the pages import
 * their components from a single place and the dotted winget file name
 * lives exactly once (here) instead of repeating across every page —
 * the components stay complete independent files inside the theme.
 */
export * from "./sol/wingets/HomeEntry.tsx";
export { default as HomeEntrygate } from "./sol/wingets/HomeEntrygate.tsx";
export * from "./sol/wingets/HomeEntrygate.tsx";
export * from "./sol/wingets/HomeTabs.tsx";
export { default as GraphPanel } from "./sol/wingets/RunsGraphpanel.tsx";
export { default as ShellBrandmark } from "./sol/wingets/ShellBrandmark.tsx";
export * from "./sol/wingets/ShellBrandmark.tsx";
export { default as ShellEmptystate } from "./sol/wingets/ShellEmptystate.tsx";
export * from "./sol/wingets/ShellEmptystate.tsx";
