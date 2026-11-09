/** Style: forge sol — the vite config lives at the app root while the theme stays in sol/: static build emitting the hashed bundles directly into the app root folder (publish = "."), with a repository-scoped base path so the theme answers any deploy root (pages subpath, vercel, netlify, workers). The Tailwind 4 vite plugin compiles the theme stylesheet's `@import "tailwindcss"` head (the @theme source of truth + the light/hcf custom variants). */

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
      /** the pipeline bridge: the runner reads the owner's stage plan seats through the published specifier ("@wenathlan/foundry/pipeline") — the entry retires when the published envelope carries the surface. */
      "@wenathlan/foundry/pipeline": path.resolve(import.meta.dirname, "../foundry/pipeline.ts"),
      /** the home types bridge: the home face reads the owner's home props through the published specifier ("@wenathlan/foundry/hometypes") — the entry retires when the published envelope carries the surface. */
      "@wenathlan/foundry/hometypes": path.resolve(import.meta.dirname, "../foundry/hometypes.ts"),
      /** the workload law bridge: the sandbox seat reads the owner's lane seating through the published specifier ("@wenathlan/saddle/workloadlaw") — the entry retires when the published envelope carries the surface. */
      "@wenathlan/saddle/workloadlaw": path.resolve(import.meta.dirname, "../saddle/workloadlaw.ts"),

      /** the label store bridge of the ownership law: the app's copy
       * mechanism rides the vault factory through the published library
       * specifier ("@wenathlan/vault/labelstore"), and this bridge resolves
       * the specifier to the monorepo source the sibling engine carries —
       * the mechanism is never duplicated inside forge. the entry retires
       * when the published envelope carries the built label store. */
      "@wenathlan/vault/labelstore": path.resolve(import.meta.dirname, "../vault/labelstore.ts"),
      "@wenathlan/vault/onboardingstore": path.resolve(import.meta.dirname, "../vault/onboardingstore.ts"),

      /** the route catalog bridge of the ownership law: the app's http
       * surface rides the vault route catalog through the published
       * library specifier ("@wenathlan/vault/routes"), and this bridge
       * resolves the specifier to the monorepo source the sibling engine
       * carries — the route strings are never duplicated inside forge. */
      "@wenathlan/vault/routes": path.resolve(import.meta.dirname, "../vault/routes.ts"),

      /** the shared helpers bridge of the ownership law: the app's word
       * splitter rides the vault helper module through the published
       * library specifier ("@wenathlan/vault/utils"), and this bridge
       * resolves the specifier to the monorepo source the sibling engine
       * carries — the helper is never duplicated inside forge. */
      "@wenathlan/vault/utils": path.resolve(import.meta.dirname, "../vault/utils.ts"),

      /** the runner-mode ladder bridge of the ownership law (wave 3): the
       * app's runner seam (runner.ts, the module the pages and the floor
       * engines read the five runtime targets from) rides the ladder
       * through the published library specifier ("@wenathlan/saddle/modes"),
       * and this bridge resolves the specifier to the monorepo source the
       * sibling engine carries — the ladder is never duplicated inside
       * forge, so the dev server and the build answer the same module the
       * node-side tests answer. */
      "@wenathlan/saddle/modes": path.resolve(import.meta.dirname, "../saddle/modalities.ts"),

      /** the sandbox bridge of the ownership law: the graphplan door
       * (the dedup law the family walks) imports the foundry pipeline
       * source, and the pipeline's sandbox seat rides the published
       * library specifier ("@wenathlan/saddle/sandbox") — this bridge
       * resolves the specifier to the monorepo source the sibling
       * engine carries the same way the foundry lane and the modes
       * bridge above answer, so the build resolves the door the
       * runner seam reads without the registry envelope. */
      "@wenathlan/saddle/sandbox": path.resolve(import.meta.dirname, "../saddle/sandbox.ts"),
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
    /** the optional runtimes external law (the honest absence the browser
     * graph carries): the saddle sources this app's bridges resolve
     * (../saddle/modalities.ts and ../saddle/edgelandes.ts) load @babel/core
     * and webpack through lazy imports the engine guards with the honest
     * coded absence (HOST_RUNTIME_ABSENT / the babel and webpack lanes'
     * runtime probes) — the browser bundle never carries either (a static
     * site never compiles babel and never bundles webpack), so the build
     * externalizes both: rolldown leaves the dynamic specifiers bare and
     * the runtime rejection answers the absence lane the engine owns. The
     * monorepo lanes resolved the same imports by accident (the sibling
     * saddle/node_modules dev tree), a resolution the container never
     * carried — the external law makes every lane answer the same honest
     * bundle instead. The libsql vault roundtrip seat rides the same law:
     * modalities.ts lazy-imports @libsql/client for the engine host's
     * database driver (the visitor law — the browser never owns the db
     * runtime), so the android lanes that stage no saddle dependency tree
     * externalize it the same honest way. The node seats the staged family
     * graph reaches but the browser never loads ride the same law (the
     * devthink serve stack the personalstore security seam drags resolves
     * its @wenathlan/getry bare imports nowhere inside the staged tree —
     * the sibling copy law stages sources only, never installs — beside
     * the better-sqlite3 and hono node server seats the cadria block pins:
     * the browser chunks never call them, the node lanes resolve them from
     * their own install). */
    rolldownOptions: {
      external: [/better-sqlite3/, /@hono\/node-server/, /@wenathlan\/getry\//, "@babel/core", "webpack", "@libsql/client"],
    },
  },
  /** the theme (sol/) and the root logics (runner, api, utils) share one app root, so the dev server allows the app root — and the ownership bridge (wave 3) resolves the saddle mode surface the runner seam imports, so the saddle root rides the allow list beside the vault root. */
  server: {
    fs: {
      allow: [import.meta.dirname, path.resolve(import.meta.dirname, "../vault"), path.resolve(import.meta.dirname, "../saddle")],
    },
    host: true,
    strictPort: false,
    allowedHosts: true,
  },
});
