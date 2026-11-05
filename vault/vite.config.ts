/** Style: vault sol — the static SPA builds straight at the application
 * root (the family law the ten siblings ride: the hashed bundles land flat
 * beside the entry html, no dist, no public, no assets folder). The
 * deploy-safety law moves to the http surface: the api.ts static lane
 * carries the face allowlist (only the built faces answer — the engine
 * sources, the runtime sqlite stores and every non-face extension refuse),
 * so the root emit never publishes what the lane must not serve. The base
 * path answers any deploy root (pages subpath, vercel, netlify, workers)
 * and the Tailwind 4 vite plugin compiles the theme stylesheet's
 * `@import "tailwindcss"` head (the @theme source of truth + the
 * light/hcf custom variants). */

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
      "@": path.resolve(import.meta.dirname, "sol"),
    },
  },
  root: import.meta.dirname,
  build: {
    /** the family build law: the emit lands flat at the application root
     * (never emptied — the committed faces stay, the hashed bundles answer
     * the gitignore lanes), and the faun seal rides the http surface where
     * the api.ts static lane refuses every non-face extension. */
    outDir: path.resolve(import.meta.dirname, "."),
    emptyOutDir: false,
    assetsDir: "",
    /* the native binding never bundles for the browser (the debonair
     * precedent): the storage lane rides the lazy chunks the browser graph
     * never loads, so the binding answers as an external of those chunks
     * (the node lanes resolve it from their own install — the doctrine the
     * storage lane comment pins). */
    rolldownOptions: {
      external: ["better-sqlite3"],
    },
  },
  /** the theme sources live in the Sol folder of this app root: the pages import
   * the root logics (api, db, storage, utils) across the theme boundary from
   * the same project root, so the dev server allows this single root. */
  server: {
    fs: {
      allow: [import.meta.dirname],
    },
    host: true,
    strictPort: false,
    allowedHosts: true,
  },
});
