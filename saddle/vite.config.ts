/** Style: saddle Sol — the absorbed console surface on the family theme machinery: static-first vite build that emits the hashed bundles straight at the app root, with a repository-scoped base path and preview-safe host handling. */

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
      // the theme sources live in the sol folder of this app root.
      "@": path.resolve(import.meta.dirname, "sol"),
      /** The label store bridge of the ownership law: the app's copy mechanism
       * rides the vault factory through the relative sibling source (the
       * owner is the vault engine — the mechanism is never duplicated inside
       * saddle), and the raw-node lanes (the forked webserver) resolve the
       * same relative path without any registry envelope.
       * The playground consumes the engine source here so the build never
       * depends on a prebuilt dist directory. */
      "@saddle/isolation": path.resolve(import.meta.dirname, "isolation.ts"),
    },
    /** the single-instance law (the PR12 renderparity heal): the family
     * sources the thin doors re-export (devthink/reveal.ts and the sibling
     * bridges) live outside this app root, and the resolver answers their
     * bare react and wouter imports against the folder the file sits in —
     * a second physical copy rides the bundle when the sibling tree carries
     * its own node_modules (the two-react crash: the wouter context hook
     * then answers the dispatcher of the copy that never renders, and the
     * app dies at the workbench-failure face on both doors, the typed url
     * and the panel window alike). the dedupe forces every react,
     * react-dom and wouter specifier of the graph onto one resolved
     * instance — the cross-app source rides, the duplication dies, one
     * design answers both doors. */
    dedupe: ["react", "react-dom", "react-dom/client", "wouter"],
  },
  root: import.meta.dirname,
  envDir: import.meta.dirname,
  build: {
    outDir: path.resolve(import.meta.dirname, "."),
    emptyOutDir: false,
    assetsDir: "",
  },
  /** the theme sources live in the sol folder of this app root: the pages import
   * the root engine logics (api, auth, db, mesh, sandbox) across the theme
   * boundary, and the playground consumes the root isolation module, so the
   * dev server allows this single root. */
  server: {
    fs: {
      allow: [import.meta.dirname, path.resolve(import.meta.dirname, "../vault")],
    },
    host: true,
    strictPort: false,
    allowedHosts: true,
  },
});
