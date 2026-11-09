/**
 * wingets.ts — the universal winget surface of stealthhead (root layer):
 * every winget of the sol/wingets folder answers from this one module at
 * the app root, so the theme imports its components from a single place
 * and the dotted winget file name lives exactly once (here) instead of
 * repeating across every page — the components stay complete independent
 * files inside the sol/wingets folder this root surface answers.
 */

export * from "./sol/wingets/Constructionface.tsx";
export { default as Constructionface } from "./sol/wingets/Constructionface.tsx";
export * from "./sol/wingets/HomeScope.tsx";
export { default as HomeScope } from "./sol/wingets/HomeScope.tsx";
export * from "./sol/wingets/ShellBrandmark.tsx";
export { default as ShellBrandmark } from "./sol/wingets/ShellBrandmark.tsx";
