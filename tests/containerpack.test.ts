import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";
import { containerbuildchecks, containerbuildstages, containerdigestfiles, containerexposedsurfaces, containerimagetags, containerrunnerentry } from "../pack.js";

describe("containerpack", () => {
  it("moves to a multi stage build with a builder stage and a lean runtime stage", () => {
    const stages = containerbuildstages();
    expect(stages.map(stage => stage.name)).toEqual(["builder", "runtime"]);
    const builder = stages[0];
    expect(builder?.purpose).toContain("build checks");
    const runtime = stages[1];
    expect(runtime?.purpose).toContain("lean output");
  });

  it("runs the cli manifest and the headless smoke as build checks", () => {
    const checks = containerbuildchecks();
    expect(checks).toContain("node dist/cli.js manifest");
    expect(checks.some(check => check.includes("headless"))).toBe(true);
    expect(checks.some(check => check.includes("dist/fixtures/plans/release-notes-plan.json"))).toBe(true);
  });

  it("exposes the static site, the socket relay and the mcp server as runtime surfaces", () => {
    const surfaces = containerexposedsurfaces();
    expect(surfaces.map(surface => surface.kind)).toEqual(["site", "relay", "mcp"]);
    for (const surface of surfaces) {
      expect(surface.bindenv).toMatch(/^DEVTHINK_/);
      expect(surface.portenv).toMatch(/^DEVTHINK_/);
    }
    const relay = surfaces.find(surface => surface.kind === "relay");
    expect(relay?.path).toBe("DEVTHINK_RELAY_PATH");
  });

  it("stamps the version beside the stable channel alias and the pre suffix for prereleases", () => {
    expect(containerimagetags("1.1.87")).toEqual(["1.1.87", "stable", "latest"]);
    expect(containerimagetags("1.2.0-pre.1")).toEqual(["1.2.0-pre.1", "pre"]);
    expect(() => containerimagetags("not-a-version")).toThrow();
  });

  it("publishes the digest files with the image hash", () => {
    const files = containerdigestfiles("1.1.87");
    expect(files.map(file => file.name)).toEqual(["extension-container.txt", "extension-container.digest", "extension-container.json"]);
    expect(files[0]?.content).toContain("ghcr.io/wenathlan/extension:VERSION");
    expect(files[1]?.content).toBe("sha256:IMAGE");
    expect(files[2]?.content).toContain("\"digest\":\"sha256:IMAGE\"");
    expect(() => containerdigestfiles("not-a-version")).toThrow();
  });

  it("starts the runtime through the self hosting runner", () => {
    expect(containerrunnerentry()).toBe("node container.mjs");
  });

  it("keeps the checked-in containerfile mirroring the multi stage build so the descriptor never drifts", async () => {
    const containerfile = await readFile("containerfile", "utf8");
    /* the two stages of the multi stage build */
    expect(containerfile).toContain("FROM node:26.8.1-bookworm-slim AS builder");
    expect(containerfile).toContain("FROM node:26.8.1-bookworm-slim AS runtime");
    /* the build checks the builder stage runs before the runtime stage ships */
    expect(containerfile).toContain("RUN node dist/cli.js manifest");
    expect(containerfile).toContain("RUN node dist/cli.js headless dist/fixtures/plans/release-notes-plan.json --fixtures dist/fixtures");
    expect(containerfile).toContain("RUN node container.mjs --check");
    /* the validation chain runs on both architectures the four entry index builds, and the emulated arm64 leg scales its timeouts through the env the suite reads while the checks stay the same */
    expect(containerfile).toContain('RUN if [ "$(uname -m)" = "aarch64" ]; then DEVTHINK_TEST_TIMEOUT_MS=120000 DEVTHINK_TEST_BUDGET_MS=10000 pnpm validate; else pnpm validate; fi');
    const vitestconfig = await readFile("vitest.config.ts", "utf8");
    expect(vitestconfig).toContain("Number(process.env.DEVTHINK_TEST_TIMEOUT_MS ?? 5000)");
    /* the runtime surfaces behind the operator chosen environment */
    for (const surface of containerexposedsurfaces()) {
      expect(containerfile).toContain(surface.bindenv);
      expect(containerfile).toContain(surface.portenv);
    }
    expect(containerfile).toContain("DEVTHINK_RELAY_PATH=/relay");
    expect(containerfile).toContain("DEVTHINK_MCP_BIND=127.0.0.1");
    expect(containerfile).toContain("EXPOSE 8080 7436");
    expect(containerfile).toContain('ENTRYPOINT ["node", "container.mjs"]');
    /* the lean runtime copies only the site, the cli and the relay beside the runner */
    expect(containerfile).toContain("COPY --from=builder /work/dist/site /app/dist/site");
    expect(containerfile).toContain("COPY --from=builder /work/dist/cli.js /app/dist/cli.js");
    expect(containerfile).toContain("COPY --from=builder /work/dist/http.js /app/dist/http.js");
  });
});
