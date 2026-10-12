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
   * the engine files (argan.ts and the data layer) across the theme boundary from
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
