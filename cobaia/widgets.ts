/**
 * widgets.ts — the universal widget surface of cobaia: every widget of the
 * sol/widgets folder answers from this one module at the app root, so the
 * pages import their components from a single place and the dotted widget
 * file name lives exactly once (here) instead of repeating across every
 * page — the components stay complete independent files inside the
 * sol/widgets folder.
 */
export { type familymember, roster } from "./monetization.ts";
export * from "./sol/widgets/HomeEntrygate.tsx";
export { default as EntryGate } from "./sol/widgets/HomeEntrygate.tsx";
export * from "./sol/widgets/IntroFooter.tsx";
export { default as IntroFooter } from "./sol/widgets/IntroFooter.tsx";
export * from "./sol/widgets/IntroPlans.tsx";
export { default as IntroPlans } from "./sol/widgets/IntroPlans.tsx";
export * from "./sol/widgets/IntroSplash.tsx";
export { default as IntroSplash } from "./sol/widgets/IntroSplash.tsx";
export * from "./sol/widgets/ShellAdsslot.tsx";
export { default as ShellAdsslot } from "./sol/widgets/ShellAdsslot.tsx";
export * from "./sol/widgets/ShellBrand.tsx";
export { default as ShellBrand } from "./sol/widgets/ShellBrand.tsx";
