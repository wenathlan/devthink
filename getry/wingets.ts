/**
 * wingets.ts — the universal winget surface of getry: every winget of the
 * sol/wingets folder answers from this one module at the app root, so the
 * pages import their components from a single place and the dotted winget
 * file name lives exactly once (here) instead of repeating across every
 * page — the components stay complete independent files inside the
 * sol/wingets folder.
 */
export { default as HomeEntrygate } from "./sol/wingets/HomeEntrygate.tsx";
export * from "./sol/wingets/HomeEntrygate.tsx";
export { default as ShellBrandmark } from "./sol/wingets/ShellBrandmark.tsx";
export * from "./sol/wingets/ShellBrandmark.tsx";
export { default as ShellEmptystate } from "./sol/wingets/ShellEmptystate.tsx";
export * from "./sol/wingets/ShellEmptystate.tsx";
