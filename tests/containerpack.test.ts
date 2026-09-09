import { access, constants, readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";
import { containerexposedsurfaces, containerrunnerentry } from "../pack.js";

describe("containerpack", () => {
  it("keeps THE Dockerfile and retires the compose stack and every second container script", async () => {
    const dockerfile = await readFile("Dockerfile", "utf8");
    expect(dockerfile.length).toBeGreaterThan(0);
    await expect(access("compose.yml", constants.F_OK)).rejects.toThrow();
    await expect(access("containerfile", constants.F_OK)).rejects.toThrow();
  });

  it("builds the multi stage image with the dependency layer, the validated builder, the lean runtime and the folded binary target", async () => {
    const dockerfile = await readFile("Dockerfile", "utf8");
    expect(dockerfile).toContain("FROM ${NODE_IMAGE} AS deps");
    expect(dockerfile).toContain("FROM deps AS builder");
    expect(dockerfile).toContain("FROM builder AS binary-builder");
    expect(dockerfile).toContain("FROM gcr.io/distroless/cc-debian12:nonroot AS binary-runtime");
    expect(dockerfile).toContain("FROM ${NODE_IMAGE} AS runtime");
    /* the runner stage closes the file: it stays the default build target
    (a plain docker build and the publish lanes build the runner image, the
    single-binary surface stays behind its own --target) */
    const fromLines = [...dockerfile.matchAll(/^FROM .*$/gm)].map((match) => match[0]);
    expect(fromLines.at(-1)).toBe("FROM ${NODE_IMAGE} AS runtime");
  });

  it("resolves the compiled binary target from TARGETARCH so the arm64 image never carries an x64 binary", async () => {
    const dockerfile = await readFile("Dockerfile", "utf8");
    expect(dockerfile).toContain("ARG TARGETARCH");
    expect(dockerfile).toContain('arm64|aarch64) buntarget="bun-linux-arm64"');
    expect(dockerfile).toContain('buntarget="bun-linux-x64"');
    expect(dockerfile).not.toContain("--target=bun-linux-x64");
  });

  it("runs the library build and the deterministic build checks in the builder before the runtime ships", async () => {
    const dockerfile = await readFile("Dockerfile", "utf8");
    expect(dockerfile).toContain("RUN node tests/build.mjs");
    expect(dockerfile).toContain("RUN node dist/cli.js manifest");
    expect(dockerfile).toContain(
      "RUN node dist/cli.js headless dist/fixtures/plans/release-notes-plan.json --fixtures dist/fixtures",
    );
    expect(dockerfile).toContain("RUN node tests/nativesmoke.mjs");
    expect(dockerfile).toContain("RUN node tests/packageextension.mjs");
    expect(dockerfile).toContain("web/extension/manifest.json");
  });

  it("runs the vitest suite on both architectures the image builds for with the qemu scaled timeouts", async () => {
    const dockerfile = await readFile("Dockerfile", "utf8");
    expect(dockerfile).toContain(
      'RUN if [ "$(uname -m)" = "aarch64" ]; then export DEVTHINK_TEST_TIMEOUT_MS=120000 DEVTHINK_TEST_BUDGET_MS=10000; fi',
    );
    const vitestconfig = await readFile("vitest.config.ts", "utf8");
    expect(vitestconfig).toContain("Number(process.env.DEVTHINK_TEST_TIMEOUT_MS ?? 5000)");
  });

  it("smoke boots the runner with server death detection before the image ships", async () => {
    const dockerfile = await readFile("Dockerfile", "utf8");
    expect(dockerfile).toContain("node container.mjs --check & runnerpid=$!");
    expect(dockerfile).toContain("the container runner died during the smoke boot");
    expect(dockerfile).toContain("the container runner never answered /healthz within 30s");
    expect(dockerfile).toContain('wait "${runnerpid}"');
  });

  it("exposes the static site, the socket relay and the mcp server behind the operator chosen environment", async () => {
    const dockerfile = await readFile("Dockerfile", "utf8");
    for (const surface of containerexposedsurfaces()) {
      expect(dockerfile).toContain(surface.bindenv);
      expect(dockerfile).toContain(surface.portenv);
    }
    expect(containerrunnerentry()).toBe("node container.mjs");
    expect(dockerfile).toContain("DEVTHINK_RELAY_PATH=/relay");
    expect(dockerfile).toContain("DEVTHINK_MCP_BIND=127.0.0.1");
    expect(dockerfile).toContain("EXPOSE 8080 7436");
    expect(dockerfile).toContain('ENTRYPOINT ["node", "container.mjs"]');
    expect(dockerfile).toContain("COPY --from=builder --chown=10000:10000 /work/dist/site /app/dist/site");
    expect(dockerfile).toContain("COPY --from=builder --chown=10000:10000 /work/dist/cli.js /app/dist/cli.js");
    expect(dockerfile).toContain("COPY --from=builder --chown=10000:10000 /work/dist/http.js /app/dist/http.js");
  });

  it("absorbs the retired compose behaviors into the one container file", async () => {
    const dockerfile = await readFile("Dockerfile", "utf8");
    for (const flag of [
      "--read-only",
      "--cap-drop ALL",
      "no-new-privileges:true",
      "--pids-limit 512",
      "--network none",
      "--tmpfs /tmp:size=2g,mode=1777",
    ]) {
      expect(dockerfile).toContain(flag);
    }
    expect(dockerfile).toContain("DEVTHINK_MEMORY_ENGINE=ram");
    expect(dockerfile).toContain('DEVTHINK_PLATFORM=""');
    expect(dockerfile).toContain('DEVTHINK_CDN_URL=""');
  });

  it("runs the image as the non root devthink user with a live healthcheck and the OCI labels of the DevThink identity", async () => {
    const dockerfile = await readFile("Dockerfile", "utf8");
    expect(dockerfile).toContain("groupadd --gid 10000 devthink");
    expect(dockerfile).toContain("useradd --uid 10000 --gid 10000");
    expect(dockerfile).toMatch(/HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3/);
    expect(dockerfile).toContain("/healthz");
    expect(dockerfile).toContain('org.opencontainers.image.version="${DEVTHINK_VERSION}"');
    expect(dockerfile).toContain('org.opencontainers.image.source="https://github.com/wenathlan/devthink"');
    expect(dockerfile).not.toMatch(/:latest\b/);
  });

  it("publishes the image with version tags only, the registry buildcache and the multi arch matrix", async () => {
    const publish = await readFile(".github/workflows/publishghcr.yml", "utf8");
    expect(publish).not.toContain(":latest");
    expect(publish).toContain("target: runtime");
    expect(publish).toContain("devthink-buildcache");
    expect(publish).toContain("type=gha");
    expect(publish).toContain("mode=max");
    expect(publish).toContain("platforms: linux/amd64,linux/arm64");
    expect(publish).toContain("provenance: mode=max");
    expect(publish).toContain("sbom: true");
    expect(publish).toContain("aquasecurity/trivy-action@v0.36.0");
  });

  it("builds the release container archive from THE Dockerfile", async () => {
    const container = await readFile(".github/workflows/container.yml", "utf8");
    expect(container).toContain("docker build");
    expect(container).toContain("--build-arg DEVTHINK_VERSION=");
    expect(container).toContain("docker save");
  });
});
