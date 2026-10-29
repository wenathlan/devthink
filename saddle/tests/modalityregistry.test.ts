// # modalityregistry.test — the catalog contract: the ninety modality plan
// answered (the count the owner charged), every record complete and
// honestly stated, the boot ladder consistent with the records, the join
// resolver answering the nuclear law (the workload asks, the engine
// resolves), the lite base refusing the hardware images, and the plan
// report counting exactly what the catalog holds. runnable with vitest:
// pnpm vitest run tests/modalityregistry.test.ts
import assert from "node:assert/strict";
import { describe, it } from "vitest";
import {
  BOOTLADDER,
  MODALITIES,
  MODALITYPLANCOUNT,
  getmodality,
  planreport,
  resolvejoin,
} from "../modalityregistry.ts";

/** the records the platform lanes drive today — the honest live set the
 * report and the lanes agree on (the run lane executes node inside the
 * container, the storage lane drives the session jail, the exec lane
 * drives every host runtime of the polyglot languages and the builds) */
const LIVESET = [
  "build-make",
  "build-ninja",
  "container-docker",
  "fs-vfs",
  "language-cargo",
  "language-dotnet",
  "language-go",
  "language-java",
  "language-lua",
  "language-nim",
  "language-php",
  "language-python",
  "language-ruby",
  "language-rust",
  "language-v",
  "language-zig",
  "runner-bun",
  "runner-deno",
  "runner-node",
  "runner-serverless",
  "runtime-jvm",
] as const;

/** the records whose host runtime the sandbox lane probes on PATH */
const HOSTSET = ["container-runsc", "emulator-qemu", "microvm-firecracker"] as const;

describe("the modality registry", () => {
  it("answers the ninety modality plan the owner charged", () => {
    assert.equal(MODALITYPLANCOUNT, 90);
    assert.equal(MODALITIES.length, MODALITYPLANCOUNT, `the catalog holds ${MODALITIES.length}`);
    const report = planreport();
    assert.equal(report.plananswered, true);
    assert.equal(report.plancount, 90);
    assert.equal(report.catalogcount, MODALITIES.length);
    assert.equal(report.live + report.host + report.planned, MODALITIES.length);
  });

  it("carries a complete record for every modality", () => {
    for (const modality of MODALITIES) {
      assert.ok(modality.id.length > 0);
      assert.ok(modality.label.length > 0);
      assert.ok(["live", "host", "planned"].includes(modality.state), `${modality.id} carries no honest state`);
      assert.ok(modality.mime.startsWith("application/") || modality.mime.startsWith("audio/") || modality.mime.startsWith("video/"));
      assert.ok(modality.bootms >= 0);
      // a record never claims a boot cost above its class ceiling
      assert.ok(modality.bootms <= BOOTLADDER[modality.boot], `${modality.id} exceeds its class`);
      assert.ok(Array.isArray(modality.drivers));
      assert.ok(Array.isArray(modality.hardening));
    }
  });

  it("keeps ids unique and the boot ladder measured", () => {
    const ids = new Set(MODALITIES.map((m) => m.id));
    assert.equal(ids.size, MODALITIES.length);
    assert.equal(BOOTLADDER.hot < BOOTLADDER.warm, true);
    assert.equal(BOOTLADDER.warm < BOOTLADDER.cold, true);
  });

  it("declares the live set and the host set exactly as the lanes drive them", () => {
    const live = MODALITIES.filter((m) => m.state === "live").map((m) => m.id).sort();
    assert.deepEqual(live, [...LIVESET].sort());
    const host = MODALITIES.filter((m) => m.state === "host").map((m) => m.id).sort();
    assert.deepEqual(host, [...HOSTSET].sort());
    // the plan report counts the same sets — it cannot drift from the catalog
    const report = planreport();
    assert.equal(report.live, LIVESET.length);
    assert.equal(report.host, HOSTSET.length);
    assert.equal(report.planned, MODALITIES.length - LIVESET.length - HOSTSET.length);
  });

  it("resolves the join without the caller naming a modality", () => {
    const answer = resolvejoin({ base: "balanced", gpu: true, network: true, isolation: "hardware" });
    assert.ok(answer.length >= 1);
    for (const modality of answer) {
      assert.equal(modality.gpu, true);
      assert.equal(modality.network, true);
    }
    // the best candidate boots fastest
    for (let i = 1; i < answer.length; i++) {
      assert.ok(answer[i - 1].bootms <= answer[i].bootms);
    }
  });

  it("refuses the hardware images on the lite base and honors the boot budget", () => {
    const lite = resolvejoin({ base: "lite", gpu: false, network: true });
    for (const modality of lite) assert.notEqual(modality.isolation, "hardware");
    const tight = resolvejoin({ base: "max", gpu: false, network: false, bootbudget: 50 });
    for (const modality of tight) assert.ok(modality.bootms <= 50, `${modality.id} boots in ${modality.bootms}`);
    const none = resolvejoin({ base: "max", gpu: true, network: false, bootbudget: 50 });
    assert.equal(none.length, 0);
  });

  it("answers records by id", () => {
    assert.equal(getmodality("pod-session")?.family, "pod");
    assert.equal(getmodality("no-such-modality"), undefined);
  });
});
