/**
 * the one conversion config of the app, living at the app root so the
 * capacitor cli resolves it from its working directory: the mobile lane runs
 * `npx cap add`/`npx cap sync` from debonair/ and every path below — webDir
 * above all — resolves relative to that cwd.
 *
 * the theme build (the hashed bundles that vite emits straight at the app root)
 * is the single application source of every platform: the browser, github
 * pages, vercel, netlify, the tv and the android wrapper all render the same
 * web bundle. the native shells
 * stay runner-side toolchain output (generated on the mobile workflow into
 * android and ios beside this config, never committed).
 *
 * the shape follows the capacitor-cli config contract; the type import stays
 * out so the web typecheck never requires the optional capacitor toolchain.
 */

/** the structural contract of the capacitor config the cli reads (the subset this repository declares). */
type CapacitorConfigShape = {
  appId: string;
  appName: string;
  webDir: string;
  bundledWebRuntime?: boolean;
  server?: { androidScheme?: string };
  android?: { allowMixedContent?: boolean };
};

const config: CapacitorConfigShape = {
  /** the debonair mobile identity — the id the mobile lane stamps onto the generated shells. */
  appId: "im.debonair.app",
  appName: "Debonair",
  /** the vite build of the theme: pnpm build emits the hashed bundles at the app root. */
  webDir: ".",
  bundledWebRuntime: false,
  server: {
    androidScheme: "https",
  },
  android: {
    allowMixedContent: false,
  },
};

export default config;
