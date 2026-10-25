/**
 * index.ts — the universal widget surface of cobaia: every widget of the
 * Sol/widgets folder answers from this one module, so the pages import
 * their components from a single place and the dotted widget file name
 * lives exactly once (here) instead of repeating across every page —
 * the components stay complete independent files beside this surface.
 */
export * from "./apps.roster.ts";
export { default as IntroFooter } from "./intro.footer.tsx";
export * from "./intro.footer.tsx";
export { default as IntroPlans } from "./intro.plans.tsx";
export * from "./intro.plans.tsx";
export { default as IntroSplash } from "./intro.splash.tsx";
export * from "./intro.splash.tsx";
export { default as ShellAdsslot } from "./shell.adsslot.tsx";
export * from "./shell.adsslot.tsx";
export { default as ShellBrand } from "./shell.brand.tsx";
export * from "./shell.brand.tsx";
