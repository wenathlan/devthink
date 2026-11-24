/**
 * widgets.ts — the universal widget surface of stealthhead (root layer):
 * every widget of the sol/widgets folder answers from this one module at
 * the app root, so the theme imports its components from a single place
 * and the dotted widget file name lives exactly once (here) instead of
 * repeating across every page — the components stay complete independent
 * files inside the sol/widgets folder this root surface answers.
 */

export * from "./sol/widgets/Constructionface.tsx";
export { default as Constructionface } from "./sol/widgets/Constructionface.tsx";
export * from "./sol/widgets/HomeScope.tsx";
export { default as HomeScope } from "./sol/widgets/HomeScope.tsx";
export * from "./sol/widgets/ShellBrandmark.tsx";
export { default as ShellBrandmark } from "./sol/widgets/ShellBrandmark.tsx";
