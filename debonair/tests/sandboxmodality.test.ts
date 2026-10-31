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
import {
  APPSLUG,
  SANDBOXLANEENV,
  WORKLOADLANES,
  WORKER_MODALITIES,
  WORKER_MODALITY_ENV,
  laneof,
  lanesandbox,
  lanesandboxfromenv,
  workermodality,
  workermodalityfromenv,
} from "../sandboxmodality.ts";
import { lanesof } from "@wenathlan/saddle/workloadlaw";

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


describe("the workload lane mirror (wave WL1 — the engine catalog lockstep)", () => {
  it("answers the engine catalog rows for debonair — the byte pin", () => {
    const engine = lanesof("debonair");
    assert.equal(engine.length, WORKLOADLANES.length, "the mirror carries every debonair lane");
    for (let index = 0; index < engine.length; index += 1) {
      const row = engine[index];
      const mirror = WORKLOADLANES[index];
      assert.equal(mirror.app, row.app);
      assert.equal(mirror.lane, row.lane, `lane ${index} id drifts from the engine`);
      assert.equal(mirror.role, row.role, `lane ${row.lane} role drifts from the engine`);
      assert.deepEqual(mirror.demand, row.demand, `lane ${row.lane} demand drifts from the engine`);
      assert.equal(mirror.today, row.today, `lane ${row.lane} today drifts from the engine`);
    }
  });

  it("carries the app slug on every row and answers the lane lookup", () => {
    for (const row of WORKLOADLANES) {
      assert.equal(row.app, APPSLUG);
    }
    const ingest = laneof("ingest-audio");
    assert.ok(ingest !== undefined);
    assert.equal(ingest.today, "engine-lane");
    assert.equal(laneof("no-such-lane"), undefined);
  });
});

describe("the sandbox lane seat (wave WL1 — the deploy decides)", () => {
  it("answers the declared local default when the deploy carries no choice", () => {
    const absent = lanesandbox(undefined);
    assert.deepEqual(absent, { ok: true, seat: "local", sandboxed: false });
    const blank = lanesandbox("   ");
    assert.deepEqual(blank, { ok: true, seat: "local", sandboxed: false });
    const explicit = lanesandbox("local");
    assert.deepEqual(explicit, { ok: true, seat: "local", sandboxed: false });
  });

  it("opts the lanes onto the platform join when the deploy chooses join", () => {
    const joined = lanesandbox("join");
    assert.deepEqual(joined, { ok: true, seat: "join", sandboxed: true, pinned: false });
    const padded = lanesandbox("  join  ");
    assert.deepEqual(padded, { ok: true, seat: "join", sandboxed: true, pinned: false });
  });

  it("pins the named modality for the platform join to validate", () => {
    const pinned = lanesandbox("runner-node");
    assert.deepEqual(pinned, { ok: true, seat: "runner-node", sandboxed: true, pinned: true });
    // the module never judges engine vocabulary: the platform's join
    // validates the pinned id at dispatch, the mirror only names it
    const unusual = lanesandbox("microvm-firecracker");
    assert.deepEqual(unusual, { ok: true, seat: "microvm-firecracker", sandboxed: true, pinned: true });
  });

  it("reads the seat off the environment lookup the deploy pins", () => {
    assert.equal(SANDBOXLANEENV, "DEBONAIR_SANDBOX_LANE");
    const unset = lanesandboxfromenv(() => undefined);
    assert.deepEqual(unset, { ok: true, seat: "local", sandboxed: false });
    const set = lanesandboxfromenv((key) => (key === SANDBOXLANEENV ? "join" : undefined));
    assert.deepEqual(set, { ok: true, seat: "join", sandboxed: true, pinned: false });
  });

  it("keeps the worker seat and the lane seat beside each other — no silent switch", () => {
    // the two seats coexist honestly: the worker seat (workermodality)
    // pins the worker process; the lane seat (lanesandbox) declares the
    // app's lanes to the platform join — neither replaces the other
    const workerseat = workermodality(undefined);
    assert.ok(workerseat.ok && workerseat.modality === "local" && workerseat.sandboxed === false);
    const laneseat = lanesandbox(undefined);
    assert.deepEqual(laneseat, { ok: true, seat: "local", sandboxed: false });
    assert.notEqual(SANDBOXLANEENV, WORKER_MODALITY_ENV);
  });
});
