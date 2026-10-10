/** Style: DevThink Orbital Signal Room — a build straight at the application root (the owner doctrine: no dist, no public, no assets folder — the hashed bundles emit flat beside the entry) with a repository-scoped base path and preview-safe host handling. The config lives at the app root: the vite root is the app root, the theme component folders stay under Sol/ and the alias "@" maps to Sol. */

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
      "@": path.resolve(import.meta.dirname, "Sol"),
    },
  },
  root: import.meta.dirname,
  build: {
    /** the build answers at the application root: assetsDir empty keeps every
     * hashed bundle flat beside the entry html, emptyOutDir false never wipes
     * the source tree, and no dist or public folder ever exists. */
    outDir: path.resolve(import.meta.dirname, "."),
    emptyOutDir: false,
    assetsDir: "",
    rollupOptions: {
      output: {
        /** the flat-build churn guard: css and js bundles keep the hashed flat
         * name, every other emitted asset (icons, manifest, fonts) re-emits
         * under its stable source name so a rebuild never re-hashes an
         * already-hashed artifact and the entry html stays idempotent. */
        chunkFileNames: "index-[hash].js",
        assetFileNames: (asset) =>
          asset.names?.some((name) => name.endsWith(".css")) ? "index-[hash].css" : "[name][extname]",
      },
    },
  },
  /** the theme sources live in the Sol folder of this app root: the design room imports
   * the root logic modules (gateway.ts and the workspace families) across the theme
   * boundary from the same project root, so the dev server allows this single root. */
  server: {
    fs: {
      allow: [import.meta.dirname],
    },
    host: true,
    strictPort: false,
    allowedHosts: true,
  },
});
