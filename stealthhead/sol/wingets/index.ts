/**
 * index.ts — the universal winget surface of stealthhead: every winget of the
 * sol/wingets folder answers from this one module, so the theme imports
 * its components from a single place and the dotted winget file name
 * lives exactly once (here) instead of repeating across every page —
 * the components stay complete independent files beside this surface.
 */

export * from "./Constructionface.tsx";
export { default as Constructionface } from "./Constructionface.tsx";
export * from "./HomeScope.tsx";
export { default as HomeScope } from "./HomeScope.tsx";
export * from "./ShellBrandmark.tsx";
export { default as ShellBrandmark } from "./ShellBrandmark.tsx";
