import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      /** the labelstore bridge (the family door law): the entry retires when the published envelope carries the surface. */
      "@wenathlan/vault/labelstore": path.resolve(import.meta.dirname, "../vault/labelstore.ts"),
      /** the onboardingstore bridge (the family door law): the entry retires when the published envelope carries the surface. */
      "@wenathlan/vault/onboardingstore": path.resolve(import.meta.dirname, "../vault/onboardingstore.ts"),

      // the theme sources live in the sol folder of this app root.
      "@": path.resolve(import.meta.dirname, "sol"),
      /** the isolation face bridge of the engine: the raw-node lanes (the
       * forked webserver) and the suite sources resolve the face through
       * the same relative path the vite build reads, so the tests answer
       * the same module the build serves. */
      "@saddle/isolation": path.resolve(import.meta.dirname, "isolation.ts"),
    },
  },
  test: {
    include: ["test/*.test.ts"],
    environment: "node",
    globals: true,
    /* the timeout stays fifteen seconds on every native runner and scales through the env the emulated arm64 container leg sets (a qemu-interpreted second answers the same green suite many times slower), so an emulated runner never fails a test a native runner passed */
    testTimeout: Number(process.env.SADDLE_TEST_TIMEOUT_MS ?? 15000),
    hookTimeout: Number(process.env.SADDLE_TEST_TIMEOUT_MS ?? 15000),
    coverage: { enabled: false },
  },
});
