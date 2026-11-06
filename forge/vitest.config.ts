import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      /** the label store bridge of the ownership law: the app's copy
       * mechanism rides the vault factory through the published library
       * specifier ("@wenathlan/vault/labelstore"), and this bridge resolves
       * the specifier to the monorepo source the sibling engine carries —
       * the mechanism is never duplicated inside forge. the entry retires
       * when the published envelope carries the built label store. */
      "@wenathlan/vault/labelstore": path.resolve(import.meta.dirname, "../vault/labelstore.ts"),

      /** the storage lane bridge of the ownership law: the app's sqlite
       * mechanism rides the vault factory through the published library
       * specifier ("@wenathlan/vault/storage"), and this bridge resolves
       * the specifier to the monorepo source the sibling engine carries —
       * the bootstrap and the helpers are never duplicated inside forge.
       * the entry retires when the published envelope carries the built
       * storage lane. */
      "@wenathlan/vault/storage": path.resolve(import.meta.dirname, "../vault/storage.ts"),

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

      /** the workload law bridge of the family: the app battery pins the
       * lane mirror against the engine catalog through the published
       * library specifier ("@wenathlan/saddle/workloadlaw"), and this
       * bridge resolves the specifier to the monorepo source the sibling
       * engine carries — the catalog is never duplicated inside forge.
       * the entry retires when the published envelope carries the built
       * workload law. */
      "@wenathlan/saddle/workloadlaw": path.resolve(import.meta.dirname, "../saddle/workloadlaw.ts"),

      /** the runner-mode ladder bridge of the ownership law (wave 3): the
       * app's runner seam (runner.ts) rides the five runtime targets
       * through the published library specifier
       * ("@wenathlan/saddle/modes"), and this bridge resolves the
       * specifier to the monorepo source the sibling engine carries — the
       * ladder is never duplicated inside forge. the entry retires when
       * the published envelope carries the built mode surface. */
      "@wenathlan/saddle/modes": path.resolve(import.meta.dirname, "../saddle/modes.ts"),
    },
  },
  test: {
    include: ["test/*.test.ts"],
    environment: "node",
    /* the timeout stays five seconds on every native runner and scales through the env the emulated arm64 container leg sets (a qemu-interpreted second answers the same green suite many times slower), so an emulated runner never fails a test a native runner passed */
    testTimeout: Number(process.env.FORGE_TEST_TIMEOUT_MS ?? 5000),
    hookTimeout: Number(process.env.FORGE_TEST_TIMEOUT_MS ?? 10000),
    coverage: { enabled: false },
  },
});
