/** Style: saddle Sol — the absorbed console surface on the family theme machinery: static-first vite build that emits the hashed bundles straight at the app root, with a repository-scoped base path and preview-safe host handling. */
import tailwindcss from "@tailwindcss/vite";
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
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      // the theme sources live in the Sol folder of this app root.
      "@": path.resolve(import.meta.dirname, "Sol"),
      // The playground consumes the engine source here so the build never
      // depends on a prebuilt dist directory.
      "@saddle/isolation": path.resolve(import.meta.dirname, "isolation.ts"),
    },
  },
  root: import.meta.dirname,
  envDir: import.meta.dirname,
  build: {
    outDir: path.resolve(import.meta.dirname, "."),
    emptyOutDir: false,
    assetsDir: "",
  },
  /** the theme sources live in the Sol folder of this app root: the pages import
   * the root engine logics (api, auth, db, mesh, sandbox) across the theme
   * boundary, and the playground consumes the root isolation module, so the
   * dev server allows this single root. */
  server: {
    fs: {
      allow: [import.meta.dirname],
    },
    host: true,
    strictPort: false,
    allowedHosts: true,
  },
});
