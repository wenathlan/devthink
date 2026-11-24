/**
 * widgets.ts — the universal winget surface of vault: every winget of the
 * sol/widgets folder answers from this one module at the app root, so the
 * pages import their components from a single place and the dotted winget
 * file name lives exactly once (here) instead of repeating across every
 * page — the components stay complete independent files inside the
 * sol/widgets folder.
 * The surface stays alphabetical (the family winget law).
 */

export * from "./sol/widgets/HomeDbconsole.tsx";
export { default as HomeDbconsole } from "./sol/widgets/HomeDbconsole.tsx";
export * from "./sol/widgets/HomeEntry.tsx";
export * from "./sol/widgets/HomeEntrygate.tsx";
export { default as HomeEntrygate } from "./sol/widgets/HomeEntrygate.tsx";
export * from "./sol/widgets/HomeHalo.tsx";
export { default as HomeHalo } from "./sol/widgets/HomeHalo.tsx";
export * from "./sol/widgets/HomeMyfiles.tsx";
export { default as HomeMyfiles } from "./sol/widgets/HomeMyfiles.tsx";
export * from "./sol/widgets/HomeObjectbrowse.tsx";
export { default as HomeObjectbrowse } from "./sol/widgets/HomeObjectbrowse.tsx";
export * from "./sol/widgets/HomePlanstable.tsx";
export { default as HomePlanstable } from "./sol/widgets/HomePlanstable.tsx";
export * from "./sol/widgets/HomeReveal.tsx";
export { default as HomeReveal } from "./sol/widgets/HomeReveal.tsx";
export * from "./sol/widgets/HomeSignupgate.tsx";
export { default as HomeSignupgate } from "./sol/widgets/HomeSignupgate.tsx";
export * from "./sol/widgets/HomeSkeleton.tsx";
export { default as HomeSkeleton } from "./sol/widgets/HomeSkeleton.tsx";
export * from "./sol/widgets/HomeTabs.tsx";
export * from "./sol/widgets/HomeToaster.tsx";
export { default as HomeToaster } from "./sol/widgets/HomeToaster.tsx";
export * from "./sol/widgets/ShellBrandmark.tsx";
export { default as ShellBrandmark } from "./sol/widgets/ShellBrandmark.tsx";
export * from "./sol/widgets/ShellEmptystate.tsx";
export { default as ShellEmptystate } from "./sol/widgets/ShellEmptystate.tsx";
