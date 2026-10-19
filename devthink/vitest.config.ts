import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      /** the exact-subpath bridge mirrored from vite.config.ts: the saddle
       * engine specifier resolves to the monorepo source (the installed
       * 2.1.6 envelope lacks the ./sandbox export surface), so any node-side
       * test that pulls the engine through the library specifier answers the
       * same module the dev server serves. retires when saddle 2.1.7
       * publishes the export entry. */
      "@wenathlan/saddle/sandbox": path.resolve(import.meta.dirname, "../saddle/sandbox.ts"),
    },
  },
  test: {
    include: ["tests/**/*.test.ts"],
    environment: "node",
    /* the timeout stays five seconds on every native runner and scales through the env the emulated arm64 container leg sets (the 2.0.9 multi platform build proved a qemu-interpreted second answers the same green suite three to ten times slower), so an emulated runner never fails a test a native runner passed */
    testTimeout: Number(process.env.DEVTHINK_TEST_TIMEOUT_MS ?? 5000),
    hookTimeout: Number(process.env.DEVTHINK_TEST_TIMEOUT_MS ?? 10000),
    coverage: { enabled: false },
  },
});
