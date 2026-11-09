/** Style: cobaia sol — the vite config lives at the app root while the theme stays in sol/: static build emitting the hashed bundles directly into the app root folder (publish = "."), with a repository-scoped base path so the theme answers any deploy root (pages subpath, vercel, netlify, workers). The Tailwind 4 vite plugin compiles the theme stylesheet's `@import "tailwindcss"` head (the @theme source of truth + the light/hcf custom variants). */

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
      /** the workload law bridge: the sandbox seat reads the owner's lane seating through the published specifier ("@wenathlan/saddle/workloadlaw") — the entry retires when the published envelope carries the surface. */
      "@wenathlan/saddle/workloadlaw": path.resolve(import.meta.dirname, "../saddle/workloadlaw.ts"),

      /** the label store bridge of the ownership law: the app's copy
       * mechanism rides the vault factory through the published library
       * specifier ("@wenathlan/vault/labelstore"), and this bridge resolves
       * the specifier to the monorepo source the sibling engine carries —
       * the mechanism is never duplicated inside cobaia. the entry retires
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
    /* the node seats the staged family graph reaches but the browser never
     * loads: the devthink serve stack the personalstore security seam drags
     * into every family site container resolves its @wenathlan/getry bare
     * imports nowhere inside the staged tree (the sibling copy law stages
     * sources only, never installs), and the saddle modality seat carries
     * the babel and libsql lanes the same way — the bare imports stay external the same
     * law the cadria external block pins, the browser chunks never call
     * them, the node lanes resolve them from their own install. */
    rolldownOptions: {
      external: [/better-sqlite3/, /@hono\/node-server/, /@wenathlan\/getry\//, /@babel\/core/, /@libsql\/client/],
    },
  },
  /** the theme (sol/) and the root logics (checkoutlinks, posts, adsconfig) share one app root, so the dev server allows the app root. */
  server: {
    fs: {
      allow: [import.meta.dirname, path.resolve(import.meta.dirname, "../vault")],
    },
    host: true,
    strictPort: false,
    allowedHosts: true,
  },
});
