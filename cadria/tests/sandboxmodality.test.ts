// # sandboxmodality.test — the workload lane declaration of cadria (wave
// WL1): the mirrored rows answer the engine catalog byte for byte (the
// lockstep pin — every lane, role, demand and honest today the engine
// FAMILYLANES table carries for cadria, compared through the library
// bridge so the vendor can never drift in silence), every row names the
// app slug, and the seat law answers the deploy's opt-in (absent or blank
// answers the declared local default, "join" opts the lanes onto the
// platform's join resolver — the nuclear modality law, and a named
// modality id pins the seat for the platform's join to validate at
// dispatch — this module never judges engine vocabulary). runnable with
// vitest:
//   pnpm vitest run tests/sandboxmodality.test.ts
import assert from "node:assert/strict";
import { describe, it } from "vitest";
import { lanesof } from "@wenathlan/saddle/workloadlaw";
import {
  APPSLUG,
  SANDBOXLANEENV,
  WORKLOADLANES,
  laneof,
  lanesandbox,
  lanesandboxfromenv,
} from "../sandboxmodality.ts";

describe("the workload lane mirror (the engine catalog lockstep)", () => {
  it("answers the engine catalog rows for cadria — the byte pin", () => {
    const engine = lanesof("cadria");
    assert.equal(engine.length, WORKLOADLANES.length, "the mirror carries every cadria lane");
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
    const analyze = laneof("analyze-wav");
    assert.ok(analyze !== undefined);
    assert.equal(analyze.today, "engine-lane");
    assert.equal(laneof("no-such-lane"), undefined);
  });
});

describe("the sandbox lane seat (the deploy decides)", () => {
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
    assert.equal(SANDBOXLANEENV, "CADRIA_SANDBOX_LANE");
    const unset = lanesandboxfromenv(() => undefined);
    assert.deepEqual(unset, { ok: true, seat: "local", sandboxed: false });
    const set = lanesandboxfromenv((key) => (key === SANDBOXLANEENV ? "join" : undefined));
    assert.deepEqual(set, { ok: true, seat: "join", sandboxed: true, pinned: false });
  });
});
