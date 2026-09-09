/**
 * the one conversion config of the merged repository, living at the web root
 * so the capacitor cli resolves it from its working directory: the mobile
 * lane runs `npx cap add`/`npx cap sync` from web/ and every path below —
 * webDir above all — resolves relative to that cwd (verified against the
 * @capacitor/cli 8.5 line the mobile shell declares; the lane pins 8.5.0).
 *
 * the shared workbench build (dist/public, produced by vite) is the single
 * application source of every platform: the browser, github pages, vercel,
 * netlify, the tv and the android wrapper all render the same web bundle —
 * the doctrine the web folder carries as the design room of the whole
 * project. the native shells stay runner-side toolchain output (generated
 * on the mobile workflow into web/android and web/ios, never committed).
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
  android?: { allowMixedContent?: boolean };
};

const config: CapacitorConfigShape = {
  /** the devthink mobile identity — the id the mobile lane stamps onto the generated shells. */
  appId: "im.devthink.app",
  appName: "DevThink",
  /** the vite build of the workbench: pnpm --dir web build emits dist/public. */
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
