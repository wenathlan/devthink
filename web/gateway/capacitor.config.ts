/**
 * capacitor — android wrapper config for the gateway web interface
 * one interface one design for android web tv browser and extension
 *
 * the web/ folder is the single design source: the same app.tsx
 * bundle runs in the browser, on the tv, inside the extension and
 * wrapped by capacitor on android
 *
 * usage:
 *   npm i -D @capacitor/cli && npx cap init
 *   npx cap add android && npx cap sync
 *   webDir points at the vite build output (../dist from web/)
 *
 * the shape follows the capacitor-cli config contract; the type
 * import stays out so typecheck never requires the optional
 * capacitor toolchain
 */

const config = {
  appId: "io.github.wenathlan.gateway",
  appName: "Gateway",
  webDir: "../dist",
  server: {
    androidScheme: "https",
  },
  android: {
    allowMixedContent: false,
  },
};

export default config;
