/** Style: foundry sol — the vite config lives at the app root while the theme stays in sol/: static build emitting the hashed bundles directly into the app root folder (publish = "."), with a repository-scoped base path so the theme answers any deploy root (pages subpath, vercel, netlify, workers). The Tailwind 4 vite plugin compiles the theme stylesheet's `@import "tailwindcss"` head (the @theme source of truth + the light/hcf custom variants). */

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
       * the mechanism is never duplicated inside foundry. the entry retires
       * when the published envelope carries the built label store. */
      "@wenathlan/vault/labelstore": path.resolve(import.meta.dirname, "../vault/labelstore.ts"),

      /** the route catalog bridge of the ownership law: the app's http
       * surface rides the vault route catalog through the published
       * library specifier ("@wenathlan/vault/routes"), and this bridge
       * resolves the specifier to the monorepo source the sibling engine
       * carries — the route strings are never duplicated inside foundry. */
      "@wenathlan/vault/routes": path.resolve(import.meta.dirname, "../vault/routes.ts"),

      /** the shared helpers bridge of the ownership law: the app's word
       * splitter rides the vault helper module through the published
       * library specifier ("@wenathlan/vault/utils"), and this bridge
       * resolves the specifier to the monorepo source the sibling engine
       * carries — the helper is never duplicated inside foundry. */
      "@wenathlan/vault/utils": path.resolve(import.meta.dirname, "../vault/utils.ts"),

      /** the sandbox lifecycle bridge of the ownership law (wave 3): the
       * /sandboxes page model rides the cold/warm/hot state machine
       * through the published library specifier
       * ("@wenathlan/saddle/sandbox"), and this bridge resolves the
       * specifier to the monorepo source the sibling engine carries — the
       * machine is never duplicated inside foundry, so the dev server and
       * the build answer the same module the node-side tests answer. */
      "@wenathlan/saddle/sandbox": path.resolve(import.meta.dirname, "../saddle/sandbox.ts"),

      /** the runner-mode ladder bridge of the ownership law (wave 3): the
       * app's runner seam (runner.ts) rides the five runtime targets
       * through the published library specifier
       * ("@wenathlan/saddle/modes"), and this bridge resolves the
       * specifier to the monorepo source the sibling engine carries — the
       * ladder is never duplicated inside foundry. */
      "@wenathlan/saddle/modes": path.resolve(import.meta.dirname, "../saddle/modes.ts"),
      "@": path.resolve(import.meta.dirname, "Sol"),
    },
  },
  root: import.meta.dirname,
  build: {
    outDir: path.resolve(import.meta.dirname, "."),
    emptyOutDir: false,
    assetsDir: "",
  },
  /** the theme (sol/) and the root logics (runner, api, utils, db) share one app root, so the dev server allows the app root — and the ownership bridges (wave 3) resolve the saddle engine modules the sandbox page and the runner seam import, so the saddle root rides the allow list beside the vault root. */
  server: {
    fs: {
      allow: [import.meta.dirname, path.resolve(import.meta.dirname, "../vault"), path.resolve(import.meta.dirname, "../saddle")],
    },
    host: true,
    strictPort: false,
    allowedHosts: true,
  },
});
