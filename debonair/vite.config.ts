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
      allow: [import.meta.dirname, path.resolve(import.meta.dirname, "../vault")],
    },
    host: true,
    strictPort: false,
    allowedHosts: true,
  },
});
