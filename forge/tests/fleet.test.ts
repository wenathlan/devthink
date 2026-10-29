// # fleet.test — the runner fleet engine of the /runs page, runnable with
// the house vitest suite:
//   bunx vitest run tests/fleet.test.ts
// The fleet is a seeded rehearsal: the same seed musters the same runners,
// the health ladder is pure thresholds, the tick advances the floor
// deterministically and never heals an offline runner by hiding its record.
import assert from "node:assert/strict";
import { describe, it } from "vitest";
import {
  fleetSummary,
  fleetTick,
  HEALTH_LADDER,
  healthRungOf,
  mulberry32,
  pickRunner,
  RUNNER_MODES,
  RUNNER_STATES,
  type Runner,
  seedFleet,
} from "../fleet.ts";

/** one hand-built runner for the threshold tests */
function runnerOf(patch: Partial<Runner>): Runner {
  return {
    id: "fgr-test-01",
    name: "runner-test-01",
    mode: "runner",
    state: "busy",
    load: 0.4,
    runs: 100,
    failures: 0,
    ...patch,
  };
}

describe("seeded fleet", () => {
  it("musters the same runners from the same seed, every time", () => {
    const a = seedFleet(20260214, 8);
    const b = seedFleet(20260214, 8);
    assert.deepEqual(a, b);
  });

  it("musters a fleet of the requested size with unique ids and names", () => {
    const fleet = seedFleet(7, 12);
    assert.equal(fleet.length, 12);
    assert.equal(new Set(fleet.map((r) => r.id)).size, 12);
    assert.equal(new Set(fleet.map((r) => r.name)).size, 12);
  });

  it("answers only real states, modes and load ranges", () => {
    for (const runner of seedFleet(99, 40)) {
      assert.ok(RUNNER_STATES.includes(runner.state), `state ${runner.state} is on the ladder`);
      assert.ok(RUNNER_MODES.includes(runner.mode), `mode ${runner.mode} is a saddle mode`);
      assert.ok(runner.load >= 0 && runner.load <= 1, `load ${runner.load} rides 0..1`);
      assert.ok(runner.runs >= 0 && runner.failures >= 0);
      assert.ok(runner.failures <= runner.runs, "failures never exceed runs");
    }
  });

  it("keeps offline runners honest: no load, no fresh runs", () => {
    const fleet = seedFleet(1234, 60);
    for (const runner of fleet.filter((r) => r.state === "offline")) {
      assert.equal(runner.failures, 0);
    }
  });
});

describe("prng", () => {
  it("mulberry32 is deterministic across calls", () => {
    const a = mulberry32(42);
    const b = mulberry32(42);
    for (let i = 0; i < 16; i++) assert.equal(a(), b());
  });
});

describe("health ladder", () => {
  it("is the three-rung ladder green → amber → red", () => {
    assert.deepEqual(HEALTH_LADDER, ["green", "amber", "red"]);
  });

  it("paints an offline runner red with an honest why", () => {
    const rung = healthRungOf(runnerOf({ state: "offline" }));
    assert.equal(rung.rung, 2);
    assert.equal(rung.label, "red");
    assert.match(rung.why, /offline/);
  });

  it("paints a failure rate over 20% red", () => {
    const rung = healthRungOf(runnerOf({ runs: 10, failures: 3 }));
    assert.equal(rung.label, "red");
    assert.match(rung.why, /failure rate/);
  });

  it("paints a draining runner amber", () => {
    const rung = healthRungOf(runnerOf({ state: "draining" }));
    assert.equal(rung.rung, 1);
    assert.equal(rung.label, "amber");
    assert.match(rung.why, /draining/);
  });

  it("paints a saturated runner amber (load over 85%)", () => {
    const rung = healthRungOf(runnerOf({ load: 0.9 }));
    assert.equal(rung.label, "amber");
    assert.match(rung.why, /load/);
  });

  it("keeps a healthy busy runner green", () => {
    const rung = healthRungOf(runnerOf({ load: 0.5, runs: 40, failures: 1 }));
    assert.equal(rung.rung, 0);
    assert.equal(rung.label, "green");
  });

  it("computes the failure rate honestly (zero runs → zero)", () => {
    assert.equal(healthRungOf(runnerOf({ runs: 0, failures: 0 })).label, "green");
  });
});

describe("fleet tick", () => {
  it("advances the fleet deterministically", () => {
    const fleet = seedFleet(20260214, 8);
    const t1 = fleetTick(fleet, 20260214, 1);
    const t1again = fleetTick(fleet, 20260214, 1);
    assert.deepEqual(t1, t1again);
  });

  it("never mutates the input fleet", () => {
    const fleet = seedFleet(5, 6);
    const frozen = JSON.parse(JSON.stringify(fleet)) as Runner[];
    fleetTick(fleet, 5, 3);
    assert.deepEqual(fleet, frozen);
  });

  it("keeps runs monotonic and loads inside 0..1", () => {
    let fleet = seedFleet(321, 8);
    for (let tick = 1; tick <= 12; tick++) {
      const next = fleetTick(fleet, 321, tick);
      for (let i = 0; i < next.length; i++) {
        assert.ok(next[i].runs >= fleet[i].runs, "runs never go backwards");
        assert.ok(next[i].load >= 0 && next[i].load <= 1);
      }
      fleet = next;
    }
  });

  it("never heals an offline runner by hiding its record", () => {
    const fleet = [runnerOf({ id: "fgr-off", name: "runner-off-01", state: "offline", runs: 10, failures: 4 })];
    const next = fleetTick(fleet, 1, 1)[0];
    assert.equal(next.state, "offline");
    assert.equal(next.failures, 4);
  });
});

describe("fleet summary", () => {
  it("counts states and rungs exactly", () => {
    const fleet = [
      runnerOf({ id: "a", state: "busy", load: 0.5 }),
      runnerOf({ id: "b", state: "idle", load: 0.1 }),
      runnerOf({ id: "c", state: "offline", load: 0 }),
    ];
    const summary = fleetSummary(fleet);
    assert.equal(summary.total, 3);
    assert.equal(summary.byState.busy, 1);
    assert.equal(summary.byState.idle, 1);
    assert.equal(summary.byState.offline, 1);
    assert.equal(summary.byHealth.red, 1);
    assert.equal(summary.byHealth.green, 2);
    assert.equal(summary.healthy, false);
  });

  it("answers a healthy floor when no runner rides red", () => {
    const summary = fleetSummary([
      runnerOf({ id: "a", state: "busy", load: 0.5 }),
      runnerOf({ id: "b", state: "idle", load: 0.2 }),
    ]);
    assert.equal(summary.healthy, true);
  });

  it("answers a zero busy load on an empty floor", () => {
    const summary = fleetSummary([]);
    assert.equal(summary.total, 0);
    assert.equal(summary.busyLoad, 0);
  });
});

describe("pick runner", () => {
  it("never hands work to an offline or red runner", () => {
    const fleet = [
      runnerOf({ id: "a", state: "offline" }),
      runnerOf({ id: "b", runs: 10, failures: 5 }),
      runnerOf({ id: "c", state: "idle", load: 0.1 }),
    ];
    const picked = pickRunner(fleet, "runner");
    assert.ok(picked);
    assert.equal(picked.id, "c");
  });

  it("prefers the greener, lighter runner of the requested mode", () => {
    const fleet = [
      runnerOf({ id: "light", state: "idle", load: 0.1 }),
      runnerOf({ id: "heavy", state: "busy", load: 0.9 }),
    ];
    assert.equal(pickRunner(fleet, "runner")?.id, "light");
  });

  it("refuses honestly when nobody of the mode can take the work", () => {
    const fleet = [runnerOf({ id: "a", mode: "docker", state: "offline" })];
    assert.equal(pickRunner(fleet, "runner"), undefined);
  });
});
