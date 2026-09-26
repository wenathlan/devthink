/** Style: DevThink Orbital Signal Room — static GitHub Pages build with a repository-scoped base path and preview-safe host handling. */
import tailwindcss from "@tailwindcss/vite";
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
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  root: import.meta.dirname,
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
  },
  /** the repository root answer the shared sources: the design room imports
   * the root logic modules (gateway.ts and the workspace families) across
   * the web boundary, so the dev server allows the repository root beside
   * the workbench root. */
  server: {
    fs: {
      allow: [import.meta.dirname, path.resolve(import.meta.dirname, "..")],
    },
    host: true,
    strictPort: false,
    allowedHosts: true,
  },
});
