import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      /** the label store bridge of the ownership law: the app's copy
       * mechanism rides the vault factory through the published library
       * specifier ("@wenathlan/vault/labelstore"), and this bridge resolves
       * the specifier to the monorepo source the sibling engine carries —
       * the mechanism is never duplicated inside foundry. the entry retires
       * when the published envelope carries the built label store. */
      "@wenathlan/vault/labelstore": path.resolve(import.meta.dirname, "../vault/labelstore.ts"),

      /** the storage lane bridge of the ownership law: the app's sqlite
       * mechanism rides the vault factory through the published library
       * specifier ("@wenathlan/vault/storagelane"), and this bridge resolves
       * the specifier to the monorepo source the sibling engine carries —
       * the bootstrap and the helpers are never duplicated inside foundry.
       * the entry retires when the published envelope carries the built
       * storage lane. */
      "@wenathlan/vault/storagelane": path.resolve(import.meta.dirname, "../vault/storagelane.ts"),

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

      /** the workload law bridge of the family: the app battery pins the
       * lane mirror against the engine catalog through the published
       * library specifier ("@wenathlan/saddle/workloadlaw"), and this
       * bridge resolves the specifier to the monorepo source the sibling
       * engine carries — the catalog is never duplicated inside foundry.
       * the entry retires when the published envelope carries the built
       * workload law. */
      "@wenathlan/saddle/workloadlaw": path.resolve(import.meta.dirname, "../saddle/workloadlaw.ts"),
    },
  },
  test: {
    include: ["tests/*.test.ts"],
    environment: "node",
    /* the timeout stays five seconds on every native runner and scales through the env the emulated arm64 container leg sets (a qemu-interpreted second answers the same green suite many times slower), so an emulated runner never fails a test a native runner passed */
    testTimeout: Number(process.env.FOUNDRY_TEST_TIMEOUT_MS ?? 5000),
    hookTimeout: Number(process.env.FOUNDRY_TEST_TIMEOUT_MS ?? 10000),
    coverage: { enabled: false },
  },
});
