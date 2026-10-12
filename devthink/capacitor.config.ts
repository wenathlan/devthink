/**
 * the one conversion config of the merged repository, living at the app root
 * so the capacitor cli resolves it from its working directory: the mobile
 * lane runs `npx cap add`/`npx cap sync` from the app root and every path below —
 * webDir above all — resolves relative to that cwd (verified against the
 * @capacitor/cli 8.5 line the mobile shell declares; the lane pins 8.5.0).
 *
 * the shared workbench build answers straight at the application root (the
 * vite build emits the entry and the hashed bundles at the root, with no dist,
 * no public and no assets folder) and it is the single application source of
 * every platform: the browser, github pages, vercel, netlify, the tv and the
 * android wrapper all render the same web bundle — the doctrine the Sol theme
 * carries as the design room of the whole project. the native shells stay
 * runner-side toolchain output (generated on the mobile workflow into android/
 * and ios/ beside the config, never committed).
 *
 * the shape follows the capacitor-cli config contract; the type import
 * stays out so the web typecheck never requires the optional capacitor
 * toolchain (the mobile package carries @capacitor/cli — the identity
 * fields stay plain and typed structurally here).
 */

/** the structural contract of the capacitor config the cli reads (the subset this repository declares). */
type CapacitorConfigShape = {
  appId: string;
  appName: string;
  webDir: string;
  bundledWebRuntime?: boolean;
  server?: { androidScheme?: string };
  android?: { allowMixedContent?: boolean; path?: string };
  ios?: { path?: string };
};

const config: CapacitorConfigShape = {
  /** the devthink mobile identity — the id the mobile lane stamps onto the generated shells. */
  appId: "im.devthink.app",
  appName: "DevThink",
  /** the vite build of the workbench: the bundles answer at the application root. */
  webDir: ".",
  bundledWebRuntime: false,
  server: {
    androidScheme: "https",
  },
  /** the build paths the mobile lane answers: the android wrapper and the ios
   * shell materialize beside this config (family-mobile.yml) and the cli
   * reads them from these declared folders. */
  android: {
    allowMixedContent: false,
    path: "android",
  },
  ios: {
    path: "ios",
  },
};

export default config;
