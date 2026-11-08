/** Style: DevThink Sol — static SPA built at the app root: the vite build emits
 * the hashed bundles directly into the app root folder (publish = "."), with a
 * repository-scoped base path and preview-safe host handling. The tailwind
 * plugin compiles the @import "tailwindcss" foundation of sol/sol.css (the
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
      /** the label store bridge of the ownership law: the app's copy
       * mechanism rides the vault factory through the published library
       * specifier ("@wenathlan/vault/labelstore"), and this bridge resolves
       * the specifier to the monorepo source the sibling engine carries —
       * the mechanism is never duplicated inside argan. the entry retires
       * when the published envelope carries the built label store. */
      "@wenathlan/vault/labelstore": path.resolve(import.meta.dirname, "../vault/labelstore.ts"),
      "@wenathlan/vault/onboardingstore": path.resolve(import.meta.dirname, "../vault/onboardingstore.ts"),
      "@": path.resolve(import.meta.dirname, "sol"),
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
      allow: [import.meta.dirname, path.resolve(import.meta.dirname, "../vault")],
    },
    host: true,
    strictPort: false,
    allowedHosts: true,
  },
});
