/** Style: stealhead Sol — static-first vite build with a repository-scoped base path and preview-safe host handling. */
import react from "@vitejs/plugin-react";
import path from "node:path";
import { defineConfig } from "vite";

function themeBasePath(value: string | undefined): string {
  const candidate = value?.trim() || "/";
  if (candidate === "." || candidate === "./") return "./";
  return candidate === "/" ? candidate : `/${candidate.replace(/^\/+|\/+$/g, "")}/`;
}

export default defineConfig({
  base: themeBasePath(process.env.VITE_BASE_PATH),
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname),
    },
  },
  root: import.meta.dirname,
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
  },
  /** the repository root answers the shared sources: the pages import the
   * root game logics (match, ranking, weapons, world, db) across the theme
   * boundary, so the dev server allows the repository root beside the
   * theme root. */
  server: {
    fs: {
      allow: [import.meta.dirname, path.resolve(import.meta.dirname, "..")],
    },
    host: true,
    strictPort: false,
    allowedHosts: true,
  },
});
