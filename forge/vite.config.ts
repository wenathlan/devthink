/** Style: forge sol — the vite config lives at the app root while the theme stays in Sol/: static build with a repository-scoped base path so the theme answers any deploy root (pages subpath, vercel, netlify, workers). */
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
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
  },
  /** the theme (Sol/) and the root logics (runner, api, utils) share one app root, so the dev server allows the app root. */
  server: {
    fs: {
      allow: [import.meta.dirname],
    },
    host: true,
    strictPort: false,
    allowedHosts: true,
  },
});
