// # sandbox.test — the sandbox state machine of the /sandboxes page,
// runnable with the node built-in runner (no dependencies, no install):
//   node --test tests/sandbox.test.ts
// The machine never lies: the ladder is cold → warm → hot with the cooling
// paths back, every refusal is an honest string, the herd replays from the
// seed and the census counts exactly.
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  canTransition,
  drive,
  herdCensus,
  mulberry32,
  refusalFor,
  SANDBOX_STATES,
  type Sandbox,
  seedHerd,
  step,
} from "../foundry/sandbox.ts";

/** one hand-built sandbox */
function boxOf(patch: Partial<Sandbox>): Sandbox {
  return { id: "fdy-test-01", name: "sandbox-test", state: "cold", image: "base.tzst", boots: 0, steps: 0, ...patch };
}

describe("the machine", () => {
  it("keeps the three-state ladder cold → warm → hot", () => {
    assert.deepEqual(SANDBOX_STATES, ["cold", "warm", "hot"]);
  });

  it("allows the boot path and the cooling paths", () => {
    assert.equal(canTransition("cold", "warm"), true);
    assert.equal(canTransition("warm", "hot"), true);
    assert.equal(canTransition("warm", "cold"), true);
    assert.equal(canTransition("hot", "warm"), true);
    assert.equal(canTransition("hot", "cold"), true);
  });

  it("refuses the impossible moves", () => {
    assert.equal(canTransition("cold", "hot"), false);
    assert.equal(canTransition("cold", "cold"), false);
    assert.equal(canTransition("hot", "hot"), false);
  });

  it("answers honest refusals with the reason", () => {
    assert.match(refusalFor("cold", "hot"), /warm it first/);
    assert.match(refusalFor("warm", "warm"), /already warm/);
    assert.match(refusalFor("hot", "hot"), /already hot/);
  });
});

describe("drive", () => {
  it("warms a cold sandbox and counts the boot", () => {
    const box = boxOf({});
    const answer = drive(box, "warm");
    assert.equal(answer.refusal, undefined);
    assert.equal(answer.sandbox.state, "warm");
    assert.equal(answer.sandbox.boots, 1);
    assert.equal(answer.sandbox.steps, 0);
  });

  it("refuses to warm an already warm sandbox (no double boot)", () => {
    const box = boxOf({ state: "warm", boots: 2 });
    const answer = drive(box, "warm");
    assert.match(answer.refusal ?? "", /already warm/);
    assert.equal(answer.sandbox.boots, 2);
  });

  it("heats a warm sandbox into hot", () => {
    const answer = drive(boxOf({ state: "warm" }), "heat");
    assert.equal(answer.sandbox.state, "hot");
  });

  it("cools a hot sandbox back to warm (working set kept)", () => {
    const box = boxOf({ state: "hot", boots: 3, steps: 12 });
    const answer = drive(box, "cool");
    assert.equal(answer.sandbox.state, "warm");
    assert.equal(answer.sandbox.boots, 3);
  });

  it("freezes back to cold and tears the working set down", () => {
    const box = boxOf({ state: "hot", boots: 3, steps: 12 });
    const answer = drive(box, "freeze");
    assert.equal(answer.sandbox.state, "cold");
    assert.equal(answer.sandbox.boots, 0);
    assert.equal(answer.sandbox.steps, 0);
  });

  it("never mutates the input sandbox", () => {
    const box = boxOf({ state: "warm" });
    const frozen = JSON.parse(JSON.stringify(box)) as Sandbox;
    drive(box, "heat");
    drive(box, "freeze");
    assert.deepEqual(box, frozen);
  });
});

describe("step", () => {
  it("counts a step only on a hot sandbox", () => {
    const hot = boxOf({ state: "hot", steps: 5 });
    assert.equal(step(hot).sandbox.steps, 6);
  });

  it("refuses steps on cold and warm with the honest line", () => {
    assert.match(step(boxOf({ state: "cold" })).refusal ?? "", /heat it first/);
    assert.match(step(boxOf({ state: "warm" })).refusal ?? "", /only a hot sandbox/);
  });
});

describe("the rehearsal herd", () => {
  it("replays the same herd from the same seed", () => {
    assert.deepEqual(seedHerd(620221, 7), seedHerd(620221, 7));
  });

  it("herds unique ids with valid states and images", () => {
    const herd = seedHerd(9, 30);
    assert.equal(new Set(herd.map((box) => box.id)).size, 30);
    for (const box of herd) {
      assert.ok(SANDBOX_STATES.includes(box.state));
      assert.match(box.image, /\.(tzst|tar\.gz|tar\.xz)$/);
      assert.ok(box.boots >= 0 && box.steps >= 0);
    }
  });

  it("keeps cold boxes honest: no boots, no steps", () => {
    for (const box of seedHerd(1234, 60).filter((entry) => entry.state === "cold")) {
      assert.equal(box.boots, 0);
      assert.equal(box.steps, 0);
    }
  });
});

describe("the census", () => {
  it("counts the ladder exactly and derives the warm share", () => {
    const herd = [
      boxOf({ id: "a", state: "cold" }),
      boxOf({ id: "b", state: "warm" }),
      boxOf({ id: "c", state: "warm" }),
      boxOf({ id: "d", state: "hot" }),
    ];
    const census = herdCensus(herd);
    assert.equal(census.total, 4);
    assert.equal(census.byState.cold, 1);
    assert.equal(census.byState.warm, 2);
    assert.equal(census.byState.hot, 1);
    assert.equal(census.warmShare, 0.75);
  });

  it("answers zero shares on an empty room", () => {
    const census = herdCensus([]);
    assert.equal(census.total, 0);
    assert.equal(census.warmShare, 0);
  });
});

describe("prng", () => {
  it("mulberry32 is deterministic across calls", () => {
    const a = mulberry32(620221);
    const b = mulberry32(620221);
    for (let i = 0; i < 16; i++) assert.equal(a(), b());
  });
});
