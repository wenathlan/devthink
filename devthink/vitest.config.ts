import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      /** the transcode engine bridge of the ownership law: the os envelope
       * re-exports the video engine the cadria seat owns; this bridge
       * resolves the specifier to the monorepo source the sibling engine
       * carries — retires when the published cadria envelope carries the
       * transcodeengine export entry. */
      "@wenathlan/cadria/transcode": path.resolve(import.meta.dirname, "../cadria/transcode.ts"),
      /** the modality registry bridge of the ownership law, mirrored from
       * vite.config.ts: the sandbox lane tests read the ninety-modality
       * catalog through the published library specifier
       * ("@wenathlan/saddle/modalityregistry"), and this bridge resolves
       * the specifier to the monorepo source the sibling engine carries —
       * the vendored modalities.ts mirror retires with the lane import, so
       * the node-side tests answer the same module the dev server serves
       * and the catalog keeps one owner. */
      "@wenathlan/saddle/modalityregistry": path.resolve(import.meta.dirname, "../saddle/modalities.ts"),
      /** the label store bridge of the ownership law: the app's copy
       * mechanism rides the vault factory through the published library
       * specifier ("@wenathlan/vault/labelstore"), and this bridge resolves
       * the specifier to the monorepo source the sibling engine carries —
       * the mechanism is never duplicated inside devthink. the entry retires
       * when the published envelope carries the built label store. */
      "@wenathlan/vault/labelstore": path.resolve(import.meta.dirname, "../vault/labelstore.ts"),
      /** the ui store engine bridge of the ownership law (the wave 14
       * uistore consolidation): the os seat rides the vault factory
       * through the published library specifier
       * ("@wenathlan/vault/uistore"), and this bridge resolves the
       * specifier to the monorepo source the sibling engine carries — the
       * uicopy mechanism is never duplicated inside devthink. the entry
       * retires when the published envelope carries the built ui store. */
      "@wenathlan/vault/uistore": path.resolve(import.meta.dirname, "../vault/uistore.ts"),

      /** the workload law bridge of the family: the app battery pins the
       * lane mirror against the engine catalog through the published
       * library specifier ("@wenathlan/saddle/workloadlaw"), and this
       * bridge resolves the specifier to the monorepo source the sibling
       * engine carries — the catalog is never duplicated inside devthink.
       * the entry retires when the published envelope carries the built
       * workload law. */
      "@wenathlan/saddle/workloadlaw": path.resolve(import.meta.dirname, "../saddle/workloadlaw.ts"),
      /** the exact-subpath bridge mirrored from vite.config.ts: the saddle
       * engine specifier resolves to the monorepo source (the installed
       * 2.1.6 envelope lacks the ./sandbox export surface), so any node-side
       * test that pulls the engine through the library specifier answers the
       * same module the dev server serves. retires when saddle 2.1.7
       * publishes the export entry. */
      "@wenathlan/saddle/sandbox": path.resolve(import.meta.dirname, "../saddle/sandbox.ts"),
      /** the bare saddle face bridge of the source-is-library doctrine (the
       * mirror of the vite bridge): the 2.1.7 envelope ships the .ts
       * sources, so the test bundler resolves the bare specifier and the
       * memory face to the monorepo source. */
      /** the aead seal bridge the transcode engine channel imports
       * ("@wenathlan/saddle/security" — the rfc 8439 law the
       * virtualization engine owns); resolves the specifier to the
       * monorepo source ahead of the bare saddle alias so the subpath
       * never lands on the index face. */
      "@wenathlan/saddle/security": path.resolve(import.meta.dirname, "../saddle/security.ts"),
      "@wenathlan/saddle": path.resolve(import.meta.dirname, "../saddle/index.ts"),
      "@wenathlan/saddle/memory": path.resolve(import.meta.dirname, "../saddle/virtual.ts"),
      /** the getry engine bridge of the ownership law (pr16): the os imports
       * the 7-level reasoning ladder through the published library specifier
       * ("@wenathlan/getry/thinking"), and the bridge resolves the specifier
       * to the monorepo source the sibling app carries — the ladder is never
       * duplicated inside devthink, the engine answers from its one owner. */
      "@wenathlan/getry/thinking": path.resolve(import.meta.dirname, "../getry/thinking.ts"),
      "@wenathlan/getry/validate": path.resolve(import.meta.dirname, "../getry/validate.ts"),
      /** the getry research corpus bridge of the ownership law (the build
       * family consolidation carried it): the researchcatalog lane of the
       * one build file reads the corpus fixtures through the published
       * library specifier ("@wenathlan/getry/test/researchfixtures"),
       * and this bridge resolves the specifier to the monorepo source the
       * sibling app carries — the corpus is never duplicated inside
       * devthink, the lane answers from its one owner. */
      "@wenathlan/getry/test/researchfixtures": path.resolve(
        import.meta.dirname,
        "../getry/test/researchfixtures.ts",
      ),
      /** the queue self-bridge of the ownership law: the getry owner's llm
       * module (imported through the family bridges) walks the house
       * retry.backoff parser through the published specifier
       * ("@wenathlan/devthink/queue" — the request queue family owns the
       * discipline), and this bridge resolves the specifier to this app's
       * own monorepo source — the installed envelope carries no ./queue
       * export yet. retires when the published devthink envelope carries
       * the built queue family. */
      "@wenathlan/devthink/queue": path.resolve(import.meta.dirname, "queue.ts"),
      /** the getry engine module bridges of the ownership wave
       * (wave/ownership.getry), mirrored from vite.config.ts: the gateway
       * pipeline sources moved from the devthink root to the getry owner
       * root, and the consumers (server, background, config, the os tests)
       * speak them through the published library specifiers
       * ("@wenathlan/getry/engine" and siblings) — these bridges resolve
       * every specifier to the monorepo source the sibling app carries, so
       * the node-side tests answer the same modules the dev server serves
       * and the gateway logic keeps one owner. the installed 2.0.154
       * envelope carries none of these export surfaces yet, so the bridge is
       * the resolution of record until the published envelope catches up. */
      "@wenathlan/getry/engine": path.resolve(import.meta.dirname, "../getry/engine.ts"),
      "@wenathlan/getry/llm": path.resolve(import.meta.dirname, "../getry/llm.ts"),
      "@wenathlan/getry/streaming": path.resolve(import.meta.dirname, "../getry/streaming.ts"),
      "@wenathlan/getry/models": path.resolve(import.meta.dirname, "../getry/models.ts"),
      "@wenathlan/getry/request": path.resolve(import.meta.dirname, "../getry/request.ts"),
      "@wenathlan/getry/providers": path.resolve(import.meta.dirname, "../getry/providers.ts"),
      "@wenathlan/getry/antigravity": path.resolve(import.meta.dirname, "../getry/antigravity.ts"),
      "@wenathlan/getry/oauth": path.resolve(import.meta.dirname, "../getry/oauth.ts"),
      "@wenathlan/getry/accounts": path.resolve(import.meta.dirname, "../getry/accounts.ts"),
      "@wenathlan/getry/project": path.resolve(import.meta.dirname, "../getry/project.ts"),
      "@wenathlan/getry/quota": path.resolve(import.meta.dirname, "../getry/quota.ts"),
      "@wenathlan/getry/recovery": path.resolve(import.meta.dirname, "../getry/recovery.ts"),
      "@wenathlan/getry/fingerprint": path.resolve(import.meta.dirname, "../getry/fingerprint.ts"),
      "@wenathlan/getry/search": path.resolve(import.meta.dirname, "../getry/search.ts"),
      "@wenathlan/getry/utils": path.resolve(import.meta.dirname, "../getry/utils.ts"),
      "@wenathlan/getry/versionregistry": path.resolve(import.meta.dirname, "../getry/versionregistry.ts"),
      "@wenathlan/getry/intelligence": path.resolve(import.meta.dirname, "../getry/intelligence.ts"),
      "@wenathlan/getry/json": path.resolve(import.meta.dirname, "../getry/json.ts"),
      "@wenathlan/getry/gatewayconfig": path.resolve(import.meta.dirname, "../getry/gateway.ts"),
      "@wenathlan/getry/gatewayviewconfig": path.resolve(import.meta.dirname, "../getry/gateway.ts"),
      "@wenathlan/getry/gatewaycheck": path.resolve(import.meta.dirname, "../getry/gatewaycheck.ts"),
      "@wenathlan/getry/nodeshim": path.resolve(import.meta.dirname, "../getry/shims.ts"),
      "@wenathlan/getry/types": path.resolve(import.meta.dirname, "../getry/types.ts"),
      "@wenathlan/getry/constants": path.resolve(import.meta.dirname, "../getry/constants.ts"),
      /** the getry owner faces of the gateway ownership wave
       * (wave/ownership.gateway), mirrored from vite.config.ts: the
       * embedded gateway surfaces the grand merge interned in server.ts
       * (the http transport server, the request auth family, the console
       * cli and the provider cli) move to the getry owner root one face
       * per step, and the consumers speak them through the published
       * library specifiers ("@wenathlan/getry/server" and siblings) —
       * these bridges resolve every specifier to the monorepo source the
       * sibling app carries, so the node-side tests answer the same
       * modules the dev server serves and the gateway logic keeps one
       * owner (the auth family landed with step 2; the server, cli and
       * providercli faces land with the steps that follow). the installed
       * 2.0.154 envelope carries none of these export surfaces yet, so
       * the bridge is the resolution of record until the published
       * envelope catches up. */
      "@wenathlan/getry/server": path.resolve(import.meta.dirname, "../getry/server.ts"),
      "@wenathlan/getry/auth": path.resolve(import.meta.dirname, "../getry/auth.ts"),
      "@wenathlan/getry/cli": path.resolve(import.meta.dirname, "../getry/cli.ts"),
      /** the devthink self bridges of the ownership wave
       * (wave/ownership.getry), mirrored from the getry side: the moved
       * gateway graph leans on the os-owned seams it grew beside (config,
       * constants, core, the http/memory/policy/security lane, server,
       * storage and the shared types surface) through the published library
       * specifiers ("@wenathlan/devthink/config" and siblings), and this app
       * is the package those specifiers name — no node_modules copy exists
       * to answer them — so every self specifier resolves to this app's own
       * source at test runtime. the entries retire when the published
       * devthink envelope carries the export surfaces the moved graph
       * consumes. */
      "@wenathlan/devthink/config": path.resolve(import.meta.dirname, "config.ts"),
      "@wenathlan/devthink/constants": path.resolve(import.meta.dirname, "constants.ts"),
      "@wenathlan/devthink/core": path.resolve(import.meta.dirname, "core.ts"),
      "@wenathlan/devthink/http": path.resolve(import.meta.dirname, "http.ts"),
      "@wenathlan/devthink/memory": path.resolve(import.meta.dirname, "memory.ts"),
      "@wenathlan/devthink/policy": path.resolve(import.meta.dirname, "policy.ts"),
      "@wenathlan/devthink/security": path.resolve(import.meta.dirname, "security.ts"),
      "@wenathlan/devthink/server": path.resolve(import.meta.dirname, "server.ts"),
      /* the oslabels self bridge of the provider console move (the gateway
       * ownership wave, step 5): the moved console's barrel reads the
       * paired label catalog through the published os specifier, and this
       * server resolves it to this app's own source at test runtime the
       * same way the other self specifiers above ride. */
      "@wenathlan/devthink/oslabels": path.resolve(import.meta.dirname, "os.ts"),
      "@wenathlan/devthink/storage": path.resolve(import.meta.dirname, "storage.ts"),
      "@wenathlan/devthink/types": path.resolve(import.meta.dirname, "types.ts"),
    },
  },
  test: {
    include: ["test/*.test.ts"],
    environment: "node",
    /* the timeout floor stays thirty seconds on every native runner and scales through the env the emulated arm64 container leg sets (the 2.0.9 multi platform build proved a qemu-interpreted second answers the same green suite three to ten times slower), so an emulated runner never fails a test a native runner passed — the five second floor the house carried answered the cold-runner lottery: every lane that spawns subprocesses (the deno esm load, the matrix cell walk, the library modes) rides past it on a cold cache and the same test passes green on the retry, so the floor moves to the budget a subprocess walk actually needs while every fast test keeps answering in milliseconds */
    testTimeout: Number(process.env.DEVTHINK_TEST_TIMEOUT_MS ?? 30000),
    hookTimeout: Number(process.env.DEVTHINK_TEST_TIMEOUT_MS ?? 30000),
    coverage: { enabled: false },
  },
});
