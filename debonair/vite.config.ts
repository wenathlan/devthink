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
      /** the cadria engine bridge of the ownership law: the cover palette
       * derivation rides the visual engine through the published library
       * specifier ("@wenathlan/cadria/synthpalette"), and this bridge
       * resolves the specifier to the monorepo source the sibling engine
       * carries — the palette mapping is never duplicated inside debonair
       * (the audio descriptor is debonair's own contract, the palette law
       * is cadria's). the entry retires when the published envelope carries
       * the built palette engine. */
      "@wenathlan/cadria/synthpalette": path.resolve(import.meta.dirname, "../cadria/synthpalette.ts"),
      /** the self bridge the transitive specifier rides: the cadria palette
       * engine imports the audio contract through debonair's own published
       * specifiers ("@wenathlan/debonair/audiofeatures" carries the dim
       * order the palette folds), so the app resolves its own published
       * surface to its own source — the graph the registry resolves for the
       * embedder, resolved to the monorepo root inside the app. */
      "@wenathlan/debonair/audiofeatures": path.resolve(import.meta.dirname, "audiofeatures.ts"),
      "@": path.resolve(import.meta.dirname, "Sol"),
    },
  },
  root: import.meta.dirname,
  build: {
    outDir: path.resolve(import.meta.dirname, "."),
    emptyOutDir: false,
    assetsDir: "",
  },
  /** the config lives at the app root beside the engine: the theme pages import the
   * root logic files (katexis.ts and the data layer) and the "@" alias points into
   * the Sol folder of this same root, so the dev server allows this single root. */
  server: {
    fs: {
      allow: [import.meta.dirname, path.resolve(import.meta.dirname, "../vault"), path.resolve(import.meta.dirname, "../cadria")],
    },
    host: true,
    strictPort: false,
    allowedHosts: true,
  },
});
