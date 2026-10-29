import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/*.test.ts"],
    globals: true,
    testTimeout: 15000,
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
