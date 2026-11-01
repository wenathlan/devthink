/** Style: DevThink Sol — static SPA built at the app root: the vite build emits
 * the hashed bundles directly into the app root folder (publish = "."), with a
 * repository-scoped base path and preview-safe host handling. The tailwind
 * plugin compiles the @import "tailwindcss" foundation of Sol/sol.css (the
 * 8-g pass): the @theme tokens become utilities and preflight loads once. */

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
      /** the engine ownership bridges of the audio family: the analysis
       * seats the studio pages ride (the descriptor contract and the
       * orchestrated analysis report) live in the katexis engine of the
       * debonair sibling — the audio domain has one owner and cadria
       * consumes it through the published library specifiers, never
       * through a local duplicate. the long family keys ride before the
       * "@" theme alias; each entry retires when the published envelope
       * carries the built module. */
      "@wenathlan/debonair/audioattributes": path.resolve(import.meta.dirname, "../debonair/audioattributes.ts"),
      "@wenathlan/debonair/audiodecode": path.resolve(import.meta.dirname, "../debonair/audiodecode.ts"),
      "@wenathlan/debonair/audiofeatures": path.resolve(import.meta.dirname, "../debonair/audiofeatures.ts"),
      "@wenathlan/debonair/audiopipeline": path.resolve(import.meta.dirname, "../debonair/audiopipeline.ts"),
      /** the label store bridge of the ownership law: the app's copy
       * mechanism rides the vault factory through the published library
       * specifier ("@wenathlan/vault/labelstore"), and this bridge resolves
       * the specifier to the monorepo source the sibling engine carries —
       * the mechanism is never duplicated inside cadria. the entry retires
       * when the published envelope carries the built label store. */
      "@wenathlan/vault/labelstore": path.resolve(import.meta.dirname, "../vault/labelstore.ts"),
      "@": path.resolve(import.meta.dirname, "Sol"),
    },
  },
  root: import.meta.dirname,
  build: {
    outDir: path.resolve(import.meta.dirname, "."),
    emptyOutDir: false,
    assetsDir: "",
  },
  /** the theme sources live in the Sol folder of this app root: the pages import
   * the engine files (versawase.ts and the data layer) across the theme boundary
   * from the same project root, and the audio analysis family answers from the
   * debonair sibling root (the engine ownership law), so the dev server allows
   * both roots. */
  server: {
    fs: {
      allow: [import.meta.dirname, path.resolve(import.meta.dirname, "../debonair"), path.resolve(import.meta.dirname, "../vault")],
    },
    host: true,
    strictPort: false,
    allowedHosts: true,
  },
});
