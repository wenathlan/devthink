/**
 * vitest.config.ts — the test harness seat of the vault battery (root
 * layer): the node lane over the test/*.test.ts corpus, the ownership
 * bridges that resolve every published library specifier the sources
 * import onto the monorepo sibling that owns the surface (the vault's own
 * label store, the saddle workload law and the argan mimetypes corpus
 * engine the media-type pillar rides), and the timeout law the emulated
 * arm64 container leg scales through its env — the bridges retire the day
 * the published envelopes carry the built surfaces, the battery keeps
 * answering from the reviewed repository sources alone.
 */
import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      /** the label store bridge of the ownership law: the app's copy
       * mechanism rides the vault factory through the published library
       * specifier ("@wenathlan/vault/labelstore"), and this bridge resolves
       * the specifier to the monorepo source the sibling engine carries —
       * the mechanism is never duplicated inside vault. the entry retires
       * when the published envelope carries the built label store. */
      "@wenathlan/vault/labelstore": path.resolve(import.meta.dirname, "../vault/labelstore.ts"),

      /** the workload law bridge of the family: the app battery pins the
       * lane mirror against the engine catalog through the published
       * library specifier ("@wenathlan/saddle/workloadlaw"), and this
       * bridge resolves the specifier to the monorepo source the sibling
       * engine carries — the catalog is never duplicated inside vault.
       * the entry retires when the published envelope carries the built
       * workload law. */
      "@wenathlan/saddle/workloadlaw": path.resolve(import.meta.dirname, "../saddle/workloadlaw.ts"),

      /** the mimetypes engine bridge of the ownership law (wave 3): the
       * vault's media-type pillar rides the family corpus engine through
       * the published library specifier ("@wenathlan/argan/mimetypes"),
       * and this bridge resolves the specifier to the monorepo source the
       * sibling engine carries — the catalog engine (the parse, the
       * collision-law indexes, the lookup lanes) is never duplicated
       * inside vault. the entry retires when the published argan envelope
       * carries the built mimetypes surface. */
      "@wenathlan/argan/mimetypes": path.resolve(import.meta.dirname, "../argan/mimetypes.ts"),
    },
  },
  test: {
    include: ["test/*.test.ts"],
    environment: "node",
    /* the timeout stays five seconds on every native runner and scales through the env the emulated arm64 container leg sets (a qemu-interpreted second answers the same green suite many times slower), so an emulated runner never fails a test a native runner passed */
    testTimeout: Number(process.env.VAULT_TEST_TIMEOUT_MS ?? 5000),
    hookTimeout: Number(process.env.VAULT_TEST_TIMEOUT_MS ?? 10000),
    coverage: { enabled: false },
  },
});
