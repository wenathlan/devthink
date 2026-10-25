/**
 * index.ts — the universal widget surface of cobaia: every widget of the
 * Sol/widgets folder answers from this one module, so the pages import
 * their components from a single place and the dotted widget file name
 * lives exactly once (here) instead of repeating across every page —
 * the components stay complete independent files beside this surface.
 */
export * from "./AppsRoster.ts";
export { default as IntroFooter } from "./IntroFooter.tsx";
export * from "./IntroFooter.tsx";
export { default as IntroPlans } from "./IntroPlans.tsx";
export * from "./IntroPlans.tsx";
export { default as IntroSplash } from "./IntroSplash.tsx";
export * from "./IntroSplash.tsx";
export { default as ShellAdsslot } from "./ShellAdsslot.tsx";
export * from "./ShellAdsslot.tsx";
export { default as ShellBrand } from "./ShellBrand.tsx";
export * from "./ShellBrand.tsx";
