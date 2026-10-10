/**
 * the one conversion config of the grand merge, living at the app root so
 * the capacitor cli resolves it from its working directory (verified against
 * @capacitor/cli 8.5.1: the mobile lane runs `npx cap add`/`npx cap sync`
 * from the app root and every path below — webDir above all — resolves
 * relative to that cwd).
 *
 * the shared web build (the hashed bundles that vite emits straight at the
 * app root) is the single application source of every platform: the browser,
 * github pages, vercel, netlify, the tv and the android wrapper all render
 * the same web bundle. the native shells are generated on the runners
 * (`npx cap add android` / `npx cap add ios`) into android/ and ios/ beside
 * this config — a gitignored toolchain output that is never committed (see
 * docs/native-wrappers.md for the doctrine).
 *
 * the shape follows the family capacitor contract (the same shape every
 * family app declares, devthink first); the type import stays out so the web
 * typecheck never requires the optional capacitor toolchain — the identity
 * fields stay plain and typed structurally here, with the saddle extras
 * (logging behavior, web-content debugging, the ios content mode) riding
 * beside them.
 */

/** the structural contract of the capacitor config the cli reads (the subset this repository declares). */
type CapacitorConfigShape = {
  appId: string;
  appName: string;
  webDir: string;
  bundledWebRuntime?: boolean;
  loggingBehavior?: string;
  server?: { androidScheme?: string };
  android?: { allowMixedContent?: boolean; path?: string; webContentsDebuggingEnabled?: boolean };
  ios?: { path?: string; preferredContentMode?: string; webContentsDebuggingEnabled?: boolean };
};

const config: CapacitorConfigShape = {
  /** the saddle mobile identity — the id the mobile lane stamps onto the generated shells. */
  appId: "com.wenathlan.saddle",
  appName: "Saddle Browser",
  /** the vite build of the theme: `npm run web:build:pages` emits the hashed bundles at the app root. */
  webDir: ".",
  bundledWebRuntime: false,
  loggingBehavior: "none",
  server: {
    androidScheme: "https",
  },
  /** the build paths the mobile lane answers: the android wrapper and the ios
   * shell materialize beside this config (family-mobile.yml) and the cli
   * reads them from these declared folders. */
  android: {
    allowMixedContent: false,
    path: "android",
    webContentsDebuggingEnabled: false,
  },
  ios: {
    path: "ios",
    preferredContentMode: "mobile",
    webContentsDebuggingEnabled: false,
  },
};

export default config;
