import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      /** the workload law bridge of the family: the app battery pins the
       * lane mirror against the engine catalog through the published
       * library specifier ("@wenathlan/saddle/workloadlaw"), and this
       * bridge resolves the specifier to the monorepo source the sibling
       * engine carries — the catalog is never duplicated inside cadria.
       * the entry retires when the published envelope carries the built
       * workload law. */
      "@wenathlan/saddle/workloadlaw": path.resolve(import.meta.dirname, "../saddle/workloadlaw.ts"),
      /** the engine ownership bridges of the audio family: the analysis
       * seats the wave-1 pipeline rides (the descriptor contract, the pcm
       * decode layer, the feature fusion and the orchestrated report) live
       * in the katexis engine of the debonair sibling — the audio domain
       * has one owner and cadria consumes it through the published library
       * specifiers, never through a local duplicate. these bridges resolve
       * the specifiers to the monorepo source the sibling carries; each
       * entry retires when the published envelope carries the built
       * module. */
      "@wenathlan/debonair/audioattributes": path.resolve(import.meta.dirname, "../debonair/audioattributes.ts"),
      "@wenathlan/debonair/audiodecode": path.resolve(import.meta.dirname, "../debonair/audiodecode.ts"),
      "@wenathlan/debonair/audiofeatures": path.resolve(import.meta.dirname, "../debonair/audiofeatures.ts"),
      "@wenathlan/debonair/audiopipeline": path.resolve(import.meta.dirname, "../debonair/audiopipeline.ts"),
    },
  },
  test: {
    include: ["tests/*.test.ts"],
    environment: "node",
    /* the timeout stays five seconds on every native runner and scales through the env the emulated arm64 container leg sets (a qemu-interpreted second answers the same green suite many times slower), so an emulated runner never fails a test a native runner passed */
    testTimeout: Number(process.env.CADRIA_TEST_TIMEOUT_MS ?? 5000),
    hookTimeout: Number(process.env.CADRIA_TEST_TIMEOUT_MS ?? 10000),
    coverage: { enabled: false },
  },
});
