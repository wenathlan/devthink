/** Style: saddle Sol — the absorbed console surface on the family theme machinery: static-first vite build with a repository-scoped base path and preview-safe host handling. */
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { defineConfig } from "vite";

const SOL_ROOT = import.meta.dirname;
/** the repository root answers the shared sources: the pages import the
 * root engine logics (api, auth, db, mesh, sandbox) across the theme
 * boundary, and the playground consumes the root isolation module. */
const REPO_ROOT = path.resolve(SOL_ROOT, "..");

function themeBasePath(value: string | undefined): string {
  const candidate = value?.trim() || "/";
  if (candidate === "." || candidate === "./") return "./";
  return candidate === "/" ? candidate : `/${candidate.replace(/^\/+|\/+$/g, "")}/`;
}

export default defineConfig({
  base: themeBasePath(process.env.VITE_BASE_PATH),
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": SOL_ROOT,
      // The playground consumes the engine source here so the build never
      // depends on a prebuilt dist directory.
      "@saddle/isolation": path.resolve(REPO_ROOT, "isolation.ts"),
    },
  },
  root: SOL_ROOT,
  envDir: SOL_ROOT,
  build: {
    outDir: path.resolve(SOL_ROOT, "dist/public"),
    emptyOutDir: true,
  },
  server: {
    fs: {
      allow: [SOL_ROOT, REPO_ROOT],
    },
    host: true,
    strictPort: false,
    allowedHosts: true,
  },
});
