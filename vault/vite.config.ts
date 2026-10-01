/** Style: vault sol — static SPA built straight at the app root so the hashed bundles land beside the sources, with a repository-scoped base path that answers any deploy root (pages subpath, vercel, netlify, workers). */
import react from "@vitejs/plugin-react";
import path from "node:path";
import { defineConfig } from "vite";

function pagesBasePath(value: string | undefined): string {
  const candidate = value?.trim() || "/";
  if (candidate === "." || candidate === "./") return "./";
  return candidate === "/" ? candidate : `/${candidate.replace(/^\/+|\/+$/g, "")}/`;
}

export default defineConfig({
  base: pagesBasePath(process.env.VITE_BASE_PATH),
  plugins: [react()],
  resolve: {
    alias: {
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
