/**
 * vitest.config.ts — the test harness seat of the argan battery (root
 * layer): the node lane over the tests/*.test.ts corpus, the ownership
 * bridges that resolve every published library specifier the sources
 * import onto the monorepo sibling that owns the surface (the motionpref
 * door, the vault label/onboarding/storage factories and the saddle
 * workload law — the mechanisms are never duplicated inside argan), and
 * the timeout law the emulated arm64 container leg scales through its
 * env — the bridges retire the day the published envelopes carry the
 * built surfaces, the battery keeps answering from the reviewed
 * repository sources alone.
 */
import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      /** the motionpref bridge (the family door law): the entry retires when the published envelope carries the surface. */
      "@wenathlan/debonair/motionpref": path.resolve(import.meta.dirname, "../debonair/motionpref.ts"),

      /** the label store bridge of the ownership law: the app's copy
       * mechanism rides the vault factory through the published library
       * specifier ("@wenathlan/vault/labelstore"), and this bridge resolves
       * the specifier to the monorepo source the sibling engine carries —
       * the mechanism is never duplicated inside argan. the entry retires
       * when the published envelope carries the built label store. */
      "@wenathlan/vault/labelstore": path.resolve(import.meta.dirname, "../vault/labelstore.ts"),
      /** the onboarding store bridge of the ownership law: the app's
       * seen-flags mechanism rides the vault factory through the published
       * library specifier ("@wenathlan/vault/onboardingstore"), and this
       * bridge resolves the specifier to the monorepo source the sibling
       * engine carries — the mechanism is never duplicated inside argan.
       * the entry retires when the published envelope carries the built
       * onboarding store. */
      "@wenathlan/vault/onboardingstore": path.resolve(import.meta.dirname, "../vault/onboardingstore.ts"),

      /** the storage lane bridge of the ownership law: the app's sqlite
       * mechanism rides the vault factory through the published library
       * specifier ("@wenathlan/vault/storage"), and this bridge resolves
       * the specifier to the monorepo source the sibling engine carries —
       * the bootstrap and the helpers are never duplicated inside argan.
       * the entry retires when the published envelope carries the built
       * storage lane. */
      "@wenathlan/vault/storage": path.resolve(import.meta.dirname, "../vault/storage.ts"),

      /** the storagelane bridge of the ownership law: the app's sqlite
       * factory rides the vault factory owner through the published library
       * specifier ("@wenathlan/vault/storagelane" — the keyed file the
       * wave/db-vault-subpath seat owns), and this bridge resolves the
       * specifier to the monorepo source the sibling engine carries — the
       * open, the pragma ladder and the helpers are never duplicated
       * inside argan. the entry retires when the published envelope
       * carries the built storage lane owner. */
      "@wenathlan/vault/storagelane": path.resolve(import.meta.dirname, "../vault/storagelane.ts"),

      /** the workload law bridge of the family: the app battery pins the
       * lane mirror against the engine catalog through the published
       * library specifier ("@wenathlan/saddle/workloadlaw"), and this
       * bridge resolves the specifier to the monorepo source the sibling
       * engine carries — the catalog is never duplicated inside argan.
       * the entry retires when the published envelope carries the built
       * workload law. */
      "@wenathlan/saddle/workloadlaw": path.resolve(import.meta.dirname, "../saddle/workloadlaw.ts"),
    },
  },
  test: {
    include: ["tests/*.test.ts"],
    environment: "node",
    /* the timeout stays five seconds on every native runner and scales through the env the emulated arm64 container leg sets (a qemu-interpreted second answers the same green suite many times slower), so an emulated runner never fails a test a native runner passed */
    testTimeout: Number(process.env.ARGAN_TEST_TIMEOUT_MS ?? 5000),
    hookTimeout: Number(process.env.ARGAN_TEST_TIMEOUT_MS ?? 10000),
    coverage: { enabled: false },
  },
});
