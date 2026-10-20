// # modalityregistry.test — the catalog contract: every record complete,
// the boot ladder consistent with the records, the join resolver answering
// the nuclear law (the workload asks, the engine resolves), and the lite
// base refusing the hardware images. runnable with vitest:
// pnpm vitest run tests/modalityregistry.test.ts
import assert from "node:assert/strict";
import { describe, it } from "vitest";
import { BOOTLADDER, MODALITIES, getmodality, resolvejoin } from "../modalityregistry.ts";

describe("the modality registry", () => {
  it("carries a complete record for every modality", () => {
    assert.ok(MODALITIES.length >= 20, `the catalog holds ${MODALITIES.length}`);
    for (const modality of MODALITIES) {
      assert.ok(modality.id.length > 0);
      assert.ok(modality.label.length > 0);
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
