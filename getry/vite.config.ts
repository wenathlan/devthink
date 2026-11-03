/** Style: getry Sol — static SPA built straight at the repository root: hashed bundles land beside the source files, with a repository-scoped base path and preview-safe host handling. The Tailwind 4 vite plugin compiles the theme stylesheet's `@import "tailwindcss"` head (the @theme source of truth + the light/hcf custom variants). */

import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
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
      /** the label store bridge of the ownership law: the app's copy
       * mechanism rides the vault factory through the published library
       * specifier ("@wenathlan/vault/labelstore"), and this bridge resolves
       * the specifier to the monorepo source the sibling engine carries —
       * the mechanism is never duplicated inside getry. the entry retires
       * when the published envelope carries the built label store. */
      "@wenathlan/vault/labelstore": path.resolve(import.meta.dirname, "../vault/labelstore.ts"),
      /** the modality registry bridge of the ownership wave
       * (wave/ownership.getry), mirrored from vitest.config.ts: the moved
       * engine graph leans on the os server seam whose sandbox lane reads
       * the saddle catalog through the published specifier
       * ("@wenathlan/saddle/modalityregistry"), and the installed 2.1.6
       * envelope carries no ./modalityregistry export surface — this bridge
       * resolves the specifier to the monorepo source the saddle engine
       * carries. retires when saddle 2.1.7 publishes the export entry. */
      "@wenathlan/saddle/modalityregistry": path.resolve(import.meta.dirname, "../saddle/modalityregistry.ts"),
      /** the devthink module bridges of the ownership wave
       * (wave/ownership.getry): the gateway pipeline sources this app owns
       * still lean on the os-owned seams they grew beside (config,
       * constants, core, the http/memory/policy/protocol/security lane,
       * server, storage, tools and the data surface), and the moved modules
       * speak them through the published library specifiers
       * ("@wenathlan/devthink/http" and siblings) instead of sibling-folder
       * paths — these bridges resolve every specifier to the monorepo
       * source the sibling app carries, so the seams are never duplicated
       * inside getry and every module answers from its one owner (see
       * engines.ts, the ownership manifest). the entries retire when the
       * published devthink envelope carries the export surfaces the moved
       * graph consumes. */
      "@wenathlan/devthink/config": path.resolve(import.meta.dirname, "../devthink/config.ts"),
      "@wenathlan/devthink/constants": path.resolve(import.meta.dirname, "../devthink/constants.ts"),
      "@wenathlan/devthink/core": path.resolve(import.meta.dirname, "../devthink/core.ts"),
      "@wenathlan/devthink/data": path.resolve(import.meta.dirname, "../devthink/data.ts"),
      "@wenathlan/devthink/http": path.resolve(import.meta.dirname, "../devthink/http.ts"),
      "@wenathlan/devthink/memory": path.resolve(import.meta.dirname, "../devthink/memory.ts"),
      "@wenathlan/devthink/policy": path.resolve(import.meta.dirname, "../devthink/policy.ts"),
      "@wenathlan/devthink/protocol": path.resolve(import.meta.dirname, "../devthink/protocol.ts"),
      "@wenathlan/devthink/security": path.resolve(import.meta.dirname, "../devthink/security.ts"),
      "@wenathlan/devthink/server": path.resolve(import.meta.dirname, "../devthink/server.ts"),
      "@wenathlan/devthink/storage": path.resolve(import.meta.dirname, "../devthink/storage.ts"),
      "@wenathlan/devthink/tools": path.resolve(import.meta.dirname, "../devthink/tools.ts"),
      "@wenathlan/devthink/types": path.resolve(import.meta.dirname, "../devthink/types.ts"),
      /** the getry self bridges of the ownership wave
       * (wave/ownership.getry), mirrored from vitest.config.ts: the os
       * sources the moved graph consumes through the devthink bridges above
       * import the gateway modules back through the published specifiers
       * ("@wenathlan/getry/engine" and siblings), and the published
       * envelope still answers from the 2.0.154 face that carries only
       * ./thinking — so every gateway specifier resolves to this app's own
       * source here (the one owner of the moved modules) until the
       * published envelope carries the export surfaces the wave added. */
      "@wenathlan/getry/thinking": path.resolve(import.meta.dirname, "thinking.ts"),
      "@wenathlan/getry/engine": path.resolve(import.meta.dirname, "engine.ts"),
      "@wenathlan/getry/llm": path.resolve(import.meta.dirname, "llm.ts"),
      "@wenathlan/getry/streaming": path.resolve(import.meta.dirname, "streaming.ts"),
      "@wenathlan/getry/models": path.resolve(import.meta.dirname, "models.ts"),
      "@wenathlan/getry/request": path.resolve(import.meta.dirname, "request.ts"),
      "@wenathlan/getry/providers": path.resolve(import.meta.dirname, "providers.ts"),
      "@wenathlan/getry/antigravity": path.resolve(import.meta.dirname, "antigravity.ts"),
      "@wenathlan/getry/oauth": path.resolve(import.meta.dirname, "oauth.ts"),
      "@wenathlan/getry/accounts": path.resolve(import.meta.dirname, "accounts.ts"),
      /** the auth self bridge of the gateway ownership wave
       * (wave/ownership.gateway): the devthink server compat shim speaks
       * the moved auth family back through the published specifier
       * ("@wenathlan/getry/auth"), and the graph lanes that pull the
       * shim in through the devthink server bridge resolve it to this
       * app's own source (the one owner of the moved family). */
      "@wenathlan/getry/auth": path.resolve(import.meta.dirname, "auth.ts"),
      /** the server self bridge of the gateway ownership wave
       * (wave/ownership.gateway, step 3 — the transport move): the
       * sse/ndjson stream pipeline, the gateway route loop, the console
       * static roots, the transport boot and the gateway config loader
       * moved to this app's server.ts, and every lane that speaks the
       * published specifier ("@wenathlan/getry/server") — the devthink
       * server and config compat shims — resolves it to this app's own
       * source: the one owner of the moved transport. */
      "@wenathlan/getry/server": path.resolve(import.meta.dirname, "server.ts"),
      "@wenathlan/getry/project": path.resolve(import.meta.dirname, "project.ts"),
      "@wenathlan/getry/quota": path.resolve(import.meta.dirname, "quota.ts"),
      "@wenathlan/getry/recovery": path.resolve(import.meta.dirname, "recovery.ts"),
      "@wenathlan/getry/fingerprint": path.resolve(import.meta.dirname, "fingerprint.ts"),
      "@wenathlan/getry/search": path.resolve(import.meta.dirname, "search.ts"),
      "@wenathlan/getry/utils": path.resolve(import.meta.dirname, "utils.ts"),
      "@wenathlan/getry/versionregistry": path.resolve(import.meta.dirname, "versionregistry.ts"),
      "@wenathlan/getry/intelligence": path.resolve(import.meta.dirname, "intelligence.ts"),
      "@wenathlan/getry/json": path.resolve(import.meta.dirname, "json.ts"),
      "@wenathlan/getry/jsonpolicy": path.resolve(import.meta.dirname, "jsonpolicy.ts"),
      "@wenathlan/getry/jsonschema": path.resolve(import.meta.dirname, "jsonschema.ts"),
      "@wenathlan/getry/gatewayconfig": path.resolve(import.meta.dirname, "gatewayconfig.ts"),
      "@wenathlan/getry/gatewayviewconfig": path.resolve(import.meta.dirname, "gatewayviewconfig.ts"),
      "@wenathlan/getry/gatewayprobe": path.resolve(import.meta.dirname, "gatewayprobe.ts"),
      "@wenathlan/getry/gatewaysmoke": path.resolve(import.meta.dirname, "gatewaysmoke.ts"),
      "@wenathlan/getry/nodeshim": path.resolve(import.meta.dirname, "nodeshim.ts"),
      "@wenathlan/getry/types": path.resolve(import.meta.dirname, "types.ts"),
      "@wenathlan/getry/constants": path.resolve(import.meta.dirname, "constants.ts"),
      "@wenathlan/getry/tests/researchfixtures": path.resolve(import.meta.dirname, "tests/researchfixtures.ts"),

      /** the debonair route table bridge of the ownership law: the
       * debonair lane rides the owner's route table through the published
       * library specifier ("@wenathlan/debonair/routetable" — the
       * zero-import leaf the debonair app carved out of gatewayapi.ts),
       * and this bridge resolves the specifier to the monorepo source the
       * sibling engine carries — the route rows are never duplicated
       * inside getry (the mirror era of the debonair lane is over). the
       * entry retires when the published envelope carries the built
       * route table. */
      "@wenathlan/debonair/routetable": path.resolve(import.meta.dirname, "../debonair/routetable.ts"),
      /** the devthink queue bridge of the ownership law: the streaming
       * fallback rides the house retry.backoff discipline (the doubling
       * curve, the ±20% jitter, the retry-after hint parsing, the abortable
       * sleep) through the published library specifier
       * ("@wenathlan/devthink/queue" — the request queue family owns the
       * retry backoff), and this bridge resolves the specifier to the
       * monorepo source the sibling engine carries — the discipline is
       * never duplicated inside getry (the local backoff copy of
       * streamfallback.ts retired the day the gateway app started riding
       * the library). the entry retires when the published envelope carries
       * the built queue family. */
      "@wenathlan/devthink/queue": path.resolve(import.meta.dirname, "../devthink/queue.ts"),
      "@": path.resolve(import.meta.dirname, "Sol"),
    },
  },
  root: import.meta.dirname,
  build: {
    outDir: path.resolve(import.meta.dirname, "."),
    emptyOutDir: false,
    assetsDir: "",
  },
  /** the theme sources live in the Sol folder of this app root: the pages import
   * the root gateway logics (gateway, thinking, sessions, db) across the theme
   * boundary from the same project root, so the dev server allows this root. The
   * ownership wave (wave/ownership.getry) added the devthink root beside the
   * vault seam: the moved gateway modules import the os-owned seams (storage,
   * server, http and siblings) through the @wenathlan/devthink bridges above,
   * and the dev server may only serve those sources when the sibling root joins
   * the allow list. */
  server: {
    fs: {
      allow: [
        import.meta.dirname,
        path.resolve(import.meta.dirname, "../vault"),
        path.resolve(import.meta.dirname, "../debonair"),
        path.resolve(import.meta.dirname, "../devthink"),
      ],
    },
    host: true,
    strictPort: false,
    allowedHosts: true,
  },
});
