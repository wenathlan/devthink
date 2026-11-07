/** Style: DevThink Sol — static SPA built straight at the repository root: hashed bundles land beside the source files, with a repository-scoped base path and preview-safe host handling. The Tailwind 4 vite plugin compiles the theme stylesheet's `@import "tailwindcss"` head (the @theme source of truth + the light/hcf custom variants). */

import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

function pagesBasePath(value: string | undefined): string {
  const candidate = value?.trim() || "/";
  if (candidate === "." || candidate === "./") return "./";
  return candidate === "/" ? candidate : `/${candidate.replace(/^\/+|\/+$/g, "")}/`;
}

export default defineConfig({
  base: pagesBasePath(process.env.VITE_BASE_PATH),
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      /** the label store bridge of the ownership law: the app's copy
       * mechanism rides the vault factory through the published library
       * specifier ("@wenathlan/vault/labelstore"), and this bridge resolves
       * the specifier to the monorepo source the sibling engine carries —
       * the mechanism is never duplicated inside debonair. the entry retires
       * when the published envelope carries the built label store. */
      "@wenathlan/vault/labelstore": path.resolve(import.meta.dirname, "../vault/labelstore.ts"),
      "@wenathlan/vault/onboardingstore": path.resolve(import.meta.dirname, "../vault/onboardingstore.ts"),
      /** the storage lane bridge of the ownership law: the app's sqlite
       * mechanism rides the vault factory through the published library
       * specifier ("@wenathlan/vault/storage"), and this bridge resolves
       * the specifier to the monorepo source the sibling engine carries —
       * the bootstrap and the helpers are never duplicated inside debonair.
       * the entry retires when the published envelope carries the built
       * storage lane. */
      "@wenathlan/vault/storage": path.resolve(import.meta.dirname, "../vault/storage.ts"),
      /** the workload law bridge of the family: the app battery pins the
       * lane mirror against the engine catalog through the published library
       * specifier ("@wenathlan/saddle/workloadlaw"), and this bridge
       * resolves the specifier to the monorepo source the sibling engine
       * carries — the catalog is never duplicated inside debonair. the
       * entry retires when the published envelope carries the built
       * workload law. */
      "@wenathlan/saddle/workloadlaw": path.resolve(import.meta.dirname, "../saddle/workloadlaw.ts"),
      /** the cadria engine bridge of the ownership law: the cover palette
       * derivation rides the visual engine through the published library
       * specifier ("@wenathlan/cadria/synth"), and this bridge
       * resolves the specifier to the monorepo source the sibling engine
       * carries — the palette mapping is never duplicated inside debonair
       * (the audio descriptor is debonair's own contract, the palette law
       * is cadria's). the entry retires when the published envelope carries
       * the built palette engine. */
      "@wenathlan/cadria/synth": path.resolve(import.meta.dirname, "../cadria/synth.ts"),
      /** the self bridge the transitive specifier rides: the cadria palette
       * engine imports the audio contract through debonair's own published
       * specifiers ("@wenathlan/debonair/audiofeatures" carries the dim
       * order the palette folds), so the app resolves its own published
       * surface to its own source — the graph the registry resolves for the
       * embedder, resolved to the monorepo root inside the app. the audio
       * leaves retired into the one keyword file (audio.ts), so the
       * specifier resolves to the consolidated file. */
      "@wenathlan/debonair/audio": path.resolve(import.meta.dirname, "audio.ts"),
      "@wenathlan/debonair/audiofeatures": path.resolve(import.meta.dirname, "audio.ts"),
      "@": path.resolve(import.meta.dirname, "sol"),
    },
  },
  root: import.meta.dirname,
  build: {
    outDir: path.resolve(import.meta.dirname, "."),
    emptyOutDir: false,
    assetsDir: "",
    /* the native binding never bundles for the browser: the storage lane
     * rides the lazy db chunk the browser graph never loads, so the binding
     * answers as an external of the chunk (the node lanes resolve it from
     * their own install — the doctrine the vault storage comment pins). */
    rolldownOptions: {
      external: ["better-sqlite3"],
    },
  },
  /** the config lives at the app root beside the engine: the theme pages import the
   * root logic files (katexis.ts and the data layer) and the "@" alias points into
   * the Sol folder of this same root, so the dev server allows this single root. */
  server: {
    fs: {
      allow: [import.meta.dirname, path.resolve(import.meta.dirname, "../vault"), path.resolve(import.meta.dirname, "../cadria"), path.resolve(import.meta.dirname, "../saddle")],
    },
    host: true,
    strictPort: false,
    allowedHosts: true,
  },
});
