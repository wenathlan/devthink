// # sandboxmodality.test — the worker modality declaration (wave PV6.003):
// the vocabulary mirrors the saddle modalityregistry ids (local beside
// the three saddle modalities the heavy jobs may ride), both worker lanes
// declare the honest default ("local" — the deploy's own process, the
// functions never spawn anything themselves), the option seat answers
// the deploy's opt-in (a saddle modality id resolves sandboxed, an
// off-vocabulary choice refuses honestly, an absent choice answers the
// lane's declared default) and the env reader names the law
// (DEBONAIR_WORKER_MODALITY, the deploy decides — opt-in per deploy,
// never a silent switch). runnable with vitest:
//   pnpm vitest run tests/sandboxmodality.test.ts
import assert from "node:assert/strict";
import { describe, it } from "vitest";
import { INGEST_WORKER_MODALITY } from "../ingestworker.ts";
import { RENDER_WORKER_MODALITY } from "../renderworker.ts";
import { WORKER_MODALITIES, WORKER_MODALITY_ENV, workermodality, workermodalityfromenv } from "../sandboxmodality.ts";

describe("the modality vocabulary (the saddle registry mirror)", () => {
  it("carries local beside the three saddle modality ids the heavy jobs may ride", () => {
    assert.deepEqual(WORKER_MODALITIES, ["local", "runner-node", "container-docker", "microvm-firecracker"]);
  });

  it("names the environment seat the deploy pins the opt-in through", () => {
    assert.equal(WORKER_MODALITY_ENV, "DEBONAIR_WORKER_MODALITY");
  });
});

describe("the worker declarations (the constant law)", () => {
  it("both worker lanes declare the honest local default", () => {
    assert.equal(INGEST_WORKER_MODALITY, "local", "the ingest walk runs in the deploy's own process");
    assert.equal(RENDER_WORKER_MODALITY, "local", "the render walk runs in the deploy's own process");
  });
});

describe("the modality option seat (the deploy decides)", () => {
  it("answers the declared default when the deploy carries no choice", () => {
    const absent = workermodality(undefined);
    assert.ok(absent.ok);
    assert.equal(absent.modality, "local");
    assert.equal(absent.sandboxed, false);
    const blank = workermodality("   ");
    assert.ok(blank.ok && blank.modality === "local" && blank.sandboxed === false);
    // a lane whose declared default is a saddle modality keeps it
    const pinned = workermodality(undefined, "runner-node");
    assert.ok(pinned.ok && pinned.modality === "runner-node" && pinned.sandboxed === true);
  });

  it("resolves the deploy's saddle choice (the opt-in)", () => {
    for (const modality of ["runner-node", "container-docker", "microvm-firecracker"]) {
      const seated = workermodality(`  ${modality}  `);
      assert.ok(seated.ok, `${modality} seats`);
      assert.equal(seated.modality, modality);
      assert.equal(seated.sandboxed, true);
    }
    const local = workermodality("local");
    assert.ok(local.ok && local.modality === "local" && local.sandboxed === false);
  });

  it("refuses the off-vocabulary choice — never a silent local", () => {
    const refused = workermodality("turbo-vm");
    assert.ok(!refused.ok);
    assert.match(refused.message, /off the vocabulary/);
    assert.match(refused.message, /runner-node/);
  });
});

describe("the env seat (the deploy's opt-in through the environment)", () => {
  it("reads the pinned modality and answers the default when the seat is silent", () => {
    const seated = workermodalityfromenv((name) => (name === WORKER_MODALITY_ENV ? "container-docker" : undefined));
    assert.ok(seated.ok);
    assert.equal(seated.modality, "container-docker");
    assert.equal(seated.sandboxed, true);
    const silent = workermodalityfromenv(() => undefined);
    assert.ok(silent.ok && silent.modality === "local" && silent.sandboxed === false);
    const refused = workermodalityfromenv((name) => (name === WORKER_MODALITY_ENV ? "quantum" : undefined));
    assert.ok(!refused.ok);
  });
});
