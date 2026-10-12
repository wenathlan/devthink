import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["tests/**/*.test.ts"],
    environment: "node",
    /* the timeout stays five seconds on every native runner and scales through the env the emulated arm64 container leg sets (the 2.0.9 multi platform build proved a qemu-interpreted second answers the same green suite three to ten times slower), so an emulated runner never fails a test a native runner passed */
    testTimeout: Number(process.env.DEVTHINK_TEST_TIMEOUT_MS ?? 5000),
    hookTimeout: Number(process.env.DEVTHINK_TEST_TIMEOUT_MS ?? 10000),
    coverage: { enabled: false },
  },
});
