// # netcode.test — honest unit tests for the deterministic netcode layer
// (deltas, interpolation, reconciliation, rewind, jitter), runnable with
// the vitest runner:
//   pnpm test
// Every case feeds plain snapshots and commands and checks exact output —
// no sockets, no mocks, no timing, no randomness.
import assert from "node:assert/strict";
import { describe, it } from "vitest";
import {
  applydelta,
  bracketpair,
  CMDSPEED,
  DEFAULTINTERPDELAY,
  duepackets,
  type EntityState,
  entityattick,
  interpolateat,
  jitterof,
  latestsnapshot,
  lerpentity,
  makedelta,
  makejitterbuffer,
  needsreconcile,
  positionerror,
  pushpacket,
  pushrewind,
  RECONCILETHRESHOLD,
  reconcile,
  replaycmds,
  rewindattick,
  type Snapshot,
  simulatecmd,
  wrapangle,
  yawlerp,
} from "../netcode.ts";

/** one entity standing at a spot. */
function entityat(id: string, px: number, tick: number, yaw = 0): EntityState {
  return { id, tick, px, py: 0, pz: 0, yaw };
}

/** one snapshot from id/px pairs. */
function snapshot(tick: number, time: number, rows: Array<[string, number]>): Snapshot {
  return { tick, time, entities: rows.map(([id, px]) => entityat(id, px, tick)) };
}

describe("angles", () => {
  it("wraps angles into [0, 2π)", () => {
    assert.ok(Math.abs(wrapangle(-0.1) - (Math.PI * 2 - 0.1)) < 1e-9);
    assert.ok(Math.abs(wrapangle(Math.PI * 5) - Math.PI) < 1e-9);
    assert.equal(wrapangle(0), 0);
  });

  it("interpolates yaw by the shortest arc", () => {
    assert.ok(Math.abs(yawlerp(0, Math.PI / 2, 0.5) - Math.PI / 4) < 1e-9);
    assert.ok(Math.abs(yawlerp(3, -3, 0.5) - Math.PI) < 1e-9);
    assert.ok(Math.abs(yawlerp(1, 1, 0.9) - 1) < 1e-9);
  });
});

describe("snapshot deltas", () => {
  it("carries only movers, spawns and despawns", () => {
    const base = snapshot(1, 10, [
      ["a", 0],
      ["b", 5],
      ["gone", 9],
    ]);
    const next = snapshot(2, 20, [
      ["a", 4],
      ["b", 5],
      ["new", 1],
    ]);
    const delta = makedelta(base, next);
    assert.equal(delta.base, 1);
    assert.deepEqual(delta.changed.map((entity) => entity.id).sort(), ["a", "new"]);
    assert.deepEqual(delta.removed, ["gone"]);
  });

  it("rebuilds the full snapshot from base plus delta", () => {
    const base = snapshot(1, 10, [
      ["a", 0],
      ["gone", 9],
    ]);
    const next = snapshot(2, 20, [
      ["a", 4],
      ["new", 1],
    ]);
    const rebuilt = applydelta(base, makedelta(base, next));
    assert.equal(rebuilt.tick, 2);
    assert.deepEqual(rebuilt.entities.map((entity) => entity.id).sort(), ["a", "new"]);
    assert.equal(rebuilt.entities.find((entity) => entity.id === "a")?.px, 4);
  });

  it("answers the newest snapshot by tick", () => {
    const stream = [snapshot(1, 0, []), snapshot(3, 20, []), snapshot(2, 10, [])];
    assert.equal(latestsnapshot(stream)?.tick, 3);
    assert.equal(latestsnapshot([]), null);
  });
});

describe("entity interpolation", () => {
  it("brackets the render time without extrapolating", () => {
    const stream = [snapshot(1, 0, [["a", 0]]), snapshot(2, 100, [["a", 10]])];
    assert.deepEqual(
      bracketpair(stream, 50)?.map((snap) => snap.tick),
      [1, 2],
    );
    assert.equal(bracketpair(stream, 150), null);
    assert.equal(bracketpair(stream, -1), null);
  });

  it("interpolates positions and yaw at the fraction", () => {
    const stream = [snapshot(1, 0, [["a", 0]]), snapshot(2, 100, [["a", 10]])];
    const state = interpolateat(stream, 50).find((entity) => entity.id === "a");
    assert.equal(state?.px, 5);
    const turn = interpolateat(
      [snapshot(1, 0, [["a", 0]]), snapshot(2, 100, [["a", 10]])].map((snap, i) => ({
        ...snap,
        entities: snap.entities.map((entity) => ({ ...entity, yaw: i === 0 ? 0 : Math.PI })),
      })),
      50,
    );
    assert.ok(Math.abs((turn.find((entity) => entity.id === "a")?.yaw ?? 0) - Math.PI / 2) < 1e-9);
  });

  it("spawns newer-only entities and drops older-only ones", () => {
    const stream = [
      snapshot(1, 0, [
        ["a", 0],
        ["dead", 9],
      ]),
      snapshot(2, 100, [
        ["a", 10],
        ["born", 3],
      ]),
    ];
    const states = interpolateat(stream, 50);
    assert.deepEqual(states.map((entity) => entity.id).sort(), ["a", "born"]);
    assert.equal(states.find((entity) => entity.id === "born")?.px, 3);
  });

  it("lerps one entity directly", () => {
    const out = lerpentity(entityat("a", 0, 1, 0), { ...entityat("a", 10, 2, Math.PI), py: 4 }, 0.25);
    assert.equal(out.px, 2.5);
    assert.equal(out.py, 1);
    assert.ok(Math.abs(out.yaw - Math.PI / 4) < 1e-9);
  });
});

describe("prediction and reconciliation", () => {
  it("advances the entity with the shared movement math", () => {
    const walked = simulatecmd(entityat("a", 0, 1), { seq: 1, forward: 1, side: 0, yaw: 0, dt: 0.5 });
    assert.equal(walked.px, CMDSPEED * 0.5);
    assert.equal(walked.tick, 2);
    const sideways = simulatecmd(entityat("a", 0, 1), { seq: 2, forward: 0, side: 1, yaw: 0, dt: 1 });
    assert.equal(sideways.pz, -CMDSPEED);
    const turned = simulatecmd(entityat("a", 0, 1), { seq: 3, forward: 1, side: 0, yaw: Math.PI / 2, dt: 1 });
    assert.ok(Math.abs(turned.pz - CMDSPEED) < 1e-9);
    assert.equal(turned.yaw, Math.PI / 2);
  });

  it("replays command lists in order", () => {
    const cmds = [
      { seq: 1, forward: 1, side: 0, yaw: 0, dt: 1 },
      { seq: 2, forward: 1, side: 0, yaw: 0, dt: 1 },
    ];
    assert.equal(replaycmds(entityat("a", 0, 1), cmds).px, 2 * CMDSPEED);
    assert.equal(replaycmds(entityat("a", 0, 1), []).px, 0);
  });

  it("reconciles only above the drift threshold", () => {
    const server = entityat("a", 3, 5);
    const pending = [{ seq: 1, forward: 1, side: 0, yaw: 0, dt: 0.5 }];
    const drifted = reconcile(entityat("a", 10, 7), server, pending, RECONCILETHRESHOLD);
    assert.ok(drifted.error > RECONCILETHRESHOLD);
    assert.equal(drifted.replayed.length, 1);
    assert.equal(drifted.state.px, 3 + CMDSPEED * 0.5);
    const close = reconcile(entityat("a", 3, 5), server, pending, RECONCILETHRESHOLD);
    assert.equal(close.replayed.length, 0);
    assert.equal(close.state.px, 3);
    assert.equal(needsreconcile(entityat("a", 3.05, 5), server, RECONCILETHRESHOLD), false);
    assert.equal(needsreconcile(entityat("a", 3.2, 5), server, RECONCILETHRESHOLD), true);
    assert.ok(Math.abs(positionerror({ ...entityat("a", 3, 5), pz: 4 }, server) - 4) < 1e-9);
  });
});

describe("lag compensation rewind", () => {
  it("keeps the history ordered and capped to the newest frames", () => {
    let buffer = { frames: [] as Snapshot[], capacity: 2 };
    for (const tick of [10, 20, 30]) buffer = pushrewind(buffer, snapshot(tick, tick * 10, [["a", tick]]));
    assert.deepEqual(
      buffer.frames.map((frame) => frame.tick),
      [20, 30],
    );
    buffer = pushrewind(buffer, snapshot(20, 200, [["a", 20]]));
    assert.deepEqual(
      buffer.frames.map((frame) => frame.tick),
      [20, 30],
    );
  });

  it("rewinds to the newest frame at or before the tick", () => {
    let buffer = { frames: [] as Snapshot[], capacity: 8 };
    for (const tick of [10, 20, 30]) buffer = pushrewind(buffer, snapshot(tick, tick * 10, [["a", tick]]));
    assert.equal(rewindattick(buffer, 25)?.tick, 20);
    assert.equal(rewindattick(buffer, 30)?.tick, 30);
    assert.equal(rewindattick(buffer, 5), null);
    assert.equal(entityattick(buffer, 25, "a")?.px, 20);
    assert.equal(entityattick(buffer, 25, "ghost"), null);
  });
});

describe("jitter buffer", () => {
  it("measures the arrival jitter of the stream", () => {
    assert.equal(jitterof([0, 20, 45, 70]), 2.5);
    assert.equal(jitterof([0, 10]), 0);
    assert.equal(jitterof([5]), 0);
    assert.equal(jitterof([]), 0);
  });

  it("orders, dedupes and caps the playout queue", () => {
    let buffer = makejitterbuffer(2, DEFAULTINTERPDELAY);
    buffer = pushpacket(buffer, { tick: 2, arrivedat: 20 });
    buffer = pushpacket(buffer, { tick: 1, arrivedat: 10 });
    buffer = pushpacket(buffer, { tick: 1, arrivedat: 11 });
    assert.deepEqual(
      buffer.packets.map((packet) => packet.tick),
      [1, 2],
    );
    buffer = pushpacket(buffer, { tick: 3, arrivedat: 30 });
    assert.deepEqual(
      buffer.packets.map((packet) => packet.tick),
      [2, 3],
    );
  });

  it("drains only the packets whose playout delay elapsed", () => {
    let buffer = makejitterbuffer(8, 50);
    buffer = pushpacket(buffer, { tick: 1, arrivedat: 0 });
    buffer = pushpacket(buffer, { tick: 2, arrivedat: 40 });
    assert.deepEqual(
      duepackets(buffer, 60).map((packet) => packet.tick),
      [1],
    );
    assert.deepEqual(
      duepackets(buffer, 100).map((packet) => packet.tick),
      [1, 2],
    );
    assert.deepEqual(duepackets(buffer, 10), []);
  });
});
