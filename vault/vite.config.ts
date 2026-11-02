/** Style: vault sol — the static SPA builds into the dedicated dist tree
 * (the deploy safety law: the engine keeps its runtime sqlite stores beside
 * the working directory, so the application root must never be a
 * publishable surface — the hashed bundles and the databases never share a
 * root), with a repository-scoped base path that answers any deploy root
 * (pages subpath, vercel, netlify, workers). The Tailwind 4 vite plugin
 * compiles the theme stylesheet's `@import "tailwindcss"` head (the @theme
 * source of truth + the light/hcf custom variants). */

import { copyFileSync } from "node:fs";
import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, type Plugin } from "vite";

function pagesBasePath(value: string | undefined): string {
  const candidate = value?.trim() || "/";
  if (candidate === "." || candidate === "./") return "./";
  return candidate === "/" ? candidate : `/${candidate.replace(/^\/+|\/+$/g, "")}/`;
}

/** the deploy faces that never ride the bundle graph — the netlify headers
 * and redirects, the crawler faces (robots, sitemap) and the unhashed icons
 * the webmanifest cites. The build copies them verbatim into dist so every
 * publish lane (netlify, vercel, workers, the container) mounts one
 * self-contained output and the application root stays out of every deploy
 * surface. */
const DEPLOY_FACES = ["_headers", "_redirects", "favicon.svg", "icon.svg", "robots.txt", "sitemap.xml"] as const;

/** the dist copy of the deploy faces (closeBundle answers after the emit
 * landed, so the outDir always exists when the copy rides). */
function copyDeployFaces(): Plugin {
  const root = import.meta.dirname;
  return {
    name: "vault-deploy-faces",
    closeBundle() {
      const outDir = path.resolve(root, "dist");
      for (const face of DEPLOY_FACES) {
        copyFileSync(path.resolve(root, face), path.join(outDir, face));
      }
    },
  };
}

export default defineConfig({
  base: pagesBasePath(process.env.VITE_BASE_PATH),
  plugins: [react(), tailwindcss(), copyDeployFaces()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "Sol"),
    },
  },
  root: import.meta.dirname,
  build: {
    /** the faun seal of the build: the emit lands in the dedicated dist
     * tree (emptied on every build), never beside the sources — the engine
     * drops its sqlite stores in the working directory and a root emit
     * would publish them with the site. */
    outDir: path.resolve(import.meta.dirname, "dist"),
    emptyOutDir: true,
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
