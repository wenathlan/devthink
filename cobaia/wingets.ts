/**
 * wingets.ts — the universal winget surface of cobaia: every winget of the
 * sol/wingets folder answers from this one module at the app root, so the
 * pages import their components from a single place and the dotted winget
 * file name lives exactly once (here) instead of repeating across every
 * page — the components stay complete independent files inside the
 * sol/wingets folder.
 */
export { type familymember, roster } from "./monetization.ts";
export * from "./sol/wingets/HomeEntrygate.tsx";
export { default as EntryGate } from "./sol/wingets/HomeEntrygate.tsx";
export * from "./sol/wingets/IntroFooter.tsx";
export { default as IntroFooter } from "./sol/wingets/IntroFooter.tsx";
export * from "./sol/wingets/IntroPlans.tsx";
export { default as IntroPlans } from "./sol/wingets/IntroPlans.tsx";
export * from "./sol/wingets/IntroSplash.tsx";
export { default as IntroSplash } from "./sol/wingets/IntroSplash.tsx";
export * from "./sol/wingets/ShellAdsslot.tsx";
export { default as ShellAdsslot } from "./sol/wingets/ShellAdsslot.tsx";
export * from "./sol/wingets/ShellBrand.tsx";
export { default as ShellBrand } from "./sol/wingets/ShellBrand.tsx";
