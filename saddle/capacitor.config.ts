import type { CapacitorConfig } from "@capacitor/cli";

/**
 * The one conversion config of the grand merge, living at the app root
 * so the Capacitor CLI resolves it from its working directory (verified against
 * @capacitor/cli 8.5.1: loadConfig searches process.cwd() - the mobile
 * workflow runs `npx cap add`/`npx cap sync` from the app root and every path
 * below - webDir, android.path, ios.path - resolves relative to that cwd).
 * The shared web build (the hashed bundles that vite emits straight at the
 * app root) is the single
 * application source; the native shells are GENERATED ON THE RUNNERS
 * (npx cap add android / npx cap add ios) into android/ and ios/ beside the
 * config, a gitignored toolchain output that is never committed (the paths
 * resolve relative to the app root since the config moved there — the same
 * contract the family mobile lane stamps; see docs/native-wrappers.md for
 * the doctrine).
 */
const config: CapacitorConfig = {
  appId: "com.wenathlan.saddle",
  appName: "Saddle Browser",
  webDir: ".",
  loggingBehavior: "none",
  android: {
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
