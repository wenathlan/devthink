/**
 * the one conversion config of the app, living at the theme root so the
 * capacitor cli resolves it from its working directory: the mobile lane runs
 * `npx cap add`/`npx cap sync` from Sol/ and every path below — webDir above
 * all — resolves relative to that cwd.
 *
 * the theme build (dist/public, produced by vite) is the single application
 * source of every platform: the browser, github pages, vercel, netlify, the tv
 * and the android wrapper all render the same web bundle. the native shells
 * stay runner-side toolchain output (generated on the mobile workflow into
 * Sol/android and Sol/ios, never committed).
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
  /** the forge mobile identity — the id the mobile lane stamps onto the generated shells. */
  appId: "im.forge.app",
  appName: "Forge",
  /** the vite build of the theme: pnpm build emits dist/public. */
  webDir: "dist/public",
  bundledWebRuntime: false,
  server: {
    androidScheme: "https",
  },
  android: {
    allowMixedContent: false,
  },
};

export default config;
