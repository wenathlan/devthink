import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/*.test.ts"],
    globals: true,
    testTimeout: Number(process.env.SADDLE_TEST_TIMEOUT_MS ?? 200000),
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      include: ["src/**/*.ts"],
      exclude: [
        "tests/*.test.ts",
        "scripts/**",
        "web/**",
        "production/**",
        "docs/**",
        "node_modules/**",
        "dist/**",
        "coverage/**",
      ],
      thresholds: { lines: 60, functions: 50, branches: 50, statements: 60 },
    },
  },
});
