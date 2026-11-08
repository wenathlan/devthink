import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      /** the label store bridge of the ownership law: the app's copy
       * mechanism rides the vault factory through the published library
       * specifier ("@wenathlan/vault/labelstore"), and this bridge resolves
       * the specifier to the monorepo source the sibling engine carries —
       * the mechanism is never duplicated inside getry. the entry retires
       * when the published envelope carries the built label store. */
      "@wenathlan/vault/labelstore": path.resolve(import.meta.dirname, "../vault/labelstore.ts"),
      /** the onboarding store bridge of the ownership law: the app's
       * seen-flags mechanism rides the vault factory through the published
       * library specifier ("@wenathlan/vault/onboardingstore"), and this
       * bridge resolves the specifier to the monorepo source the sibling
       * engine carries — the mechanism is never duplicated inside getry.
       * the entry retires when the published envelope carries the built
       * onboarding store. */
      "@wenathlan/vault/onboardingstore": path.resolve(import.meta.dirname, "../vault/onboardingstore.ts"),

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
      "@wenathlan/vault/routes": path.resolve(import.meta.dirname, "../vault/routes.ts"),

      /** the workload law bridge of the family: the app battery pins the
       * lane mirror against the engine catalog through the published
       * library specifier ("@wenathlan/saddle/workloadlaw"), and this
       * bridge resolves the specifier to the monorepo source the sibling
       * engine carries — the catalog is never duplicated inside getry.
       * the entry retires when the published envelope carries the built
       * workload law. */
      "@wenathlan/saddle/workloadlaw": path.resolve(import.meta.dirname, "../saddle/workloadlaw.ts"),

      /** the modality registry bridge of the ownership wave
       * (wave/ownership.getry), mirrored from the devthink side: the moved
       * engine graph leans on the os server seam
       * ("@wenathlan/devthink/server") whose sandbox lane reads the
       * ninety-modality catalog through the published library specifier
       * ("@wenathlan/saddle/modalityregistry"), and the installed 2.1.6
       * envelope carries no ./modalityregistry export surface — this bridge
       * resolves the specifier to the monorepo source the saddle engine
       * carries, so the node-side tests answer the same module the devthink
       * runner serves. retires when saddle 2.1.7 publishes the export
       * entry. */
      "@wenathlan/saddle/modalityregistry": path.resolve(import.meta.dirname, "../saddle/modalityregistry.ts"),

      /** the devthink module bridges of the ownership wave
       * (wave/ownership.getry), mirrored from vite.config.ts: the moved
       * gateway modules lean on the os-owned seams they grew beside
       * (config, constants, core, the http/memory/policy/protocol/security
       * lane, server, storage, tools and the data surface) through the
       * published library specifiers ("@wenathlan/devthink/http" and
       * siblings), and these bridges resolve every specifier to the
       * monorepo source the sibling app carries — the node-side tests
       * answer the same modules the dev server serves and the seams keep
       * one owner. the entries retire when the published devthink envelope
       * carries the export surfaces the moved graph consumes. */
      "@wenathlan/devthink/config": path.resolve(import.meta.dirname, "../devthink/config.ts"),
      "@wenathlan/devthink/constants": path.resolve(import.meta.dirname, "../devthink/constants.ts"),
      "@wenathlan/devthink/core": path.resolve(import.meta.dirname, "../devthink/core.ts"),
      "@wenathlan/devthink/data": path.resolve(import.meta.dirname, "../devthink/data.ts"),
      "@wenathlan/devthink/http": path.resolve(import.meta.dirname, "../devthink/http.ts"),
      "@wenathlan/devthink/memory": path.resolve(import.meta.dirname, "../devthink/memory.ts"),
      "@wenathlan/devthink/policy": path.resolve(import.meta.dirname, "../devthink/policy.ts"),
      "@wenathlan/devthink/protocol": path.resolve(import.meta.dirname, "../devthink/protocol.ts"),
      "@wenathlan/devthink/security": path.resolve(import.meta.dirname, "../devthink/security.ts"),
      /* the @wenathlan/devthink/server self bridge was DELETED with the
       * final double move of the gateway ownership wave (steps 4+5): the
       * last getry consumers of the os server seam were the property lane
       * (flipped in step 3) and the provider console barrel (moved to this
       * app's providercli.ts, whose imports answer from in-package
       * relatives) — nothing in getry imports the os server entry anymore,
       * so the reverse-edge bridge retired with them. */
      "@wenathlan/devthink/storage": path.resolve(import.meta.dirname, "../devthink/storage.ts"),
      "@wenathlan/devthink/tools": path.resolve(import.meta.dirname, "../devthink/tools.ts"),

      /** the getry self bridges of the ownership wave
       * (wave/ownership.getry), mirrored from the devthink side: the os
       * sources the moved graph consumes through the devthink bridges above
       * (server, policy, protocol and siblings) import the gateway modules
       * back through the published specifiers ("@wenathlan/getry/engine"
       * and siblings), and the published envelope still answers from the
       * 2.0.154 face that carries only ./thinking — so every gateway
       * specifier resolves to this app's own source here (the one owner of
       * the moved modules) until the published envelope carries the export
       * surfaces the wave added. */
      "@wenathlan/getry/thinking": path.resolve(import.meta.dirname, "thinking.ts"),
      "@wenathlan/getry/validate": path.resolve(import.meta.dirname, "validate.ts"),
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
       * ("@wenathlan/getry/auth"), and the engine / property lanes pull
       * the shim in through the devthink server bridge at test runtime —
       * the specifier resolves to this app's own source (the one owner
       * of the moved family). */
      "@wenathlan/getry/auth": path.resolve(import.meta.dirname, "auth.ts"),
      /** the server self bridge of the gateway ownership wave
       * (wave/ownership.gateway, step 3 — the transport move): the
       * sse/ndjson stream pipeline, the gateway route loop, the console
       * static roots, the transport boot and the gateway config loader
       * moved to this app's server.ts, and every lane that speaks the
       * published specifier ("@wenathlan/getry/server") — the devthink
       * server and config compat shims, the property lane that rides the
       * owner in-package — resolves it to this app's own source at test
       * runtime: the one owner of the moved transport. */
      "@wenathlan/getry/server": path.resolve(import.meta.dirname, "server.ts"),
      /** the cli self bridge of the gateway ownership wave
       * (wave/ownership.gateway, step 4 — the console cli move): the gateway
       * console cli family moved to this app's cli.ts, and every lane that
       * speaks the published specifier ("@wenathlan/getry/cli") — the
       * devthink server compat shim and the devthink router — resolves it
       * to this app's own source at test runtime: the one owner of the
       * moved console. */
      "@wenathlan/getry/cli": path.resolve(import.meta.dirname, "cli.ts"),
      /** the providercli self bridge of the gateway ownership wave
       * (wave/ownership.gateway, step 5 — the provider console move): the
       * provider account console family moved to this app's providercli.ts,
       * and every lane that speaks the published specifier
       * ("@wenathlan/getry/providers") — the devthink server compat shim
       * and the devthink router — resolves it to this app's own source at
       * test runtime: the one owner of the moved console. */
      /** the oslabels bridge of the ownership wave: the moved provider
       * console reads the paired label catalog through the published os
       * specifier ("@wenathlan/devthink/os"), and this bridge resolves
       * it to the monorepo source the sibling app carries — the label
       * catalog is never duplicated inside getry. */
      "@wenathlan/devthink/os": path.resolve(import.meta.dirname, "../devthink/os.ts"),
      "@wenathlan/getry/project": path.resolve(import.meta.dirname, "project.ts"),
      "@wenathlan/getry/quota": path.resolve(import.meta.dirname, "quota.ts"),
      "@wenathlan/getry/recovery": path.resolve(import.meta.dirname, "recovery.ts"),
      "@wenathlan/getry/fingerprint": path.resolve(import.meta.dirname, "fingerprint.ts"),
      "@wenathlan/getry/search": path.resolve(import.meta.dirname, "search.ts"),
      "@wenathlan/getry/utils": path.resolve(import.meta.dirname, "utils.ts"),
      "@wenathlan/getry/versionregistry": path.resolve(import.meta.dirname, "versionregistry.ts"),
      "@wenathlan/getry/intelligence": path.resolve(import.meta.dirname, "intelligence.ts"),
      "@wenathlan/getry/json": path.resolve(import.meta.dirname, "json.ts"),
      "@wenathlan/getry/gatewayconfig": path.resolve(import.meta.dirname, "gateway.ts"),
      "@wenathlan/getry/gatewayviewconfig": path.resolve(import.meta.dirname, "gateway.ts"),
      "@wenathlan/getry/gatewaycheck": path.resolve(import.meta.dirname, "gatewaycheck.ts"),
      "@wenathlan/getry/nodeshim": path.resolve(import.meta.dirname, "shims.ts"),
      "@wenathlan/getry/types": path.resolve(import.meta.dirname, "types.ts"),
      "@wenathlan/getry/constants": path.resolve(import.meta.dirname, "constants.ts"),
      "@wenathlan/getry/test/researchfixtures": path.resolve(import.meta.dirname, "test/researchfixtures.ts"),
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
    },
  },
  test: {
    include: ["test/*.test.ts"],
    environment: "node",
    /* the timeout floor moves to thirty seconds with the ownership wave
     * (wave/ownership.getry): the moved gateway battery (the property walks
     * of fast-check, the torture lanes and the gatewayserver suites) ran
     * under the devthink floor of thirty seconds and a cold or emulated
     * runner never fails a test a native runner passed — every fast test
     * keeps answering in milliseconds while the subprocess-spawning lanes
     * ride past the five second floor the house carried before the move */
    testTimeout: Number(process.env.GETRY_TEST_TIMEOUT_MS ?? 30000),
    hookTimeout: Number(process.env.GETRY_TEST_TIMEOUT_MS ?? 30000),
    coverage: { enabled: false },
  },
});
