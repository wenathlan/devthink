/**
 * index.ts — the universal winget surface of cobaia: every winget of the
 * sol/wingets folder answers from this one module, so the pages import
 * their components from a single place and the dotted winget file name
 * lives exactly once (here) instead of repeating across every page —
 * the components stay complete independent files beside this surface.
 */
export { type familymember, roster } from "../../monetization.ts";
export * from "./HomeEntrygate.tsx";
export { default as EntryGate } from "./HomeEntrygate.tsx";
export * from "./IntroFooter.tsx";
export { default as IntroFooter } from "./IntroFooter.tsx";
export * from "./IntroPlans.tsx";
export { default as IntroPlans } from "./IntroPlans.tsx";
export * from "./IntroSplash.tsx";
export { default as IntroSplash } from "./IntroSplash.tsx";
export * from "./ShellAdsslot.tsx";
export { default as ShellAdsslot } from "./ShellAdsslot.tsx";
export * from "./ShellBrand.tsx";
export { default as ShellBrand } from "./ShellBrand.tsx";
