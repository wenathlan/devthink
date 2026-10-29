// # versawaseanimate.test — the engine's animation sampler, runnable with vitest:
//   pnpm vitest run tests/versawaseanimate.test.ts
// Every test watches the promise the sampler makes: tracks resolve by target,
// defaults hold for untouched channels, sampling lerps inside keys, the scene
// span wraps long plays, and the world transform accumulates the parent chain
// without hanging on a cyclic graph.
import assert from "node:assert/strict";
import { describe, it } from "vitest";
import {
  sampleNode,
  sampleSceneAt,
  tracksByTarget,
  worldTransform,
  wrapSeconds,
} from "../versawaseanimate.ts";
import type { Scene3d } from "../versawase.ts";

const SCENE: Scene3d = {
  id: "scene-arm",
  name: "arm rig",
  fps: 30,
  nodes: [
    { id: "arm", kind: "group", name: "arm", parent: "" },
    { id: "hand", kind: "mesh", name: "hand", parent: "arm" },
  ],
  tracks: [
    { id: "pos-x", target: "arm", channel: "position", keys: [0, 2], values: [0, 10], loop: true },
    { id: "scl-x", target: "hand", channel: "scale", keys: [0, 1], values: [1, 2], loop: false },
    { id: "opa", target: "hand", channel: "opacity", keys: [0, 1], values: [1, 0], loop: false },
    { id: "rot-y", target: "hand", channel: "rotation", keys: [0, 4], values: [0, 90], loop: false },
  ],
};

describe("versawaseanimate", () => {
  it("collects the tracks that target one node", () => {
    const tracks = tracksByTarget(SCENE, "hand");
    assert.deepEqual(tracks.map((track) => track.id), ["scl-x", "opa", "rot-y"]);
    assert.equal(tracksByTarget(SCENE, "ghost").length, 0);
  });

  it("keeps untouched channels on their defaults", () => {
    const bare = { id: "bare", kind: "mesh" as const, name: "bare", parent: "" };
    const snapshot = sampleNode({ ...SCENE, tracks: [] }, bare, 1);
    assert.deepEqual(snapshot.position, { x: 0, y: 0, z: 0 });
    assert.deepEqual(snapshot.scale, { x: 1, y: 1, z: 1 });
    assert.equal(snapshot.opacity, 1);
    assert.equal(snapshot.morph, 0);
  });

  it("lerps inside the keys and rides the axis suffix", () => {
    const arm = SCENE.nodes[0];
    const snapshot = sampleNode(SCENE, arm, 1);
    assert.equal(snapshot.position.x, 5);
    assert.equal(snapshot.position.y, 0);
  });

  it("samples the whole scene at one instant", () => {
    const snapshots = sampleSceneAt(SCENE, 1);
    assert.equal(snapshots.size, 2);
    assert.equal(snapshots.get("arm")?.position.x, 5);
    assert.equal(snapshots.get("hand")?.scale.x, 2);
    assert.equal(snapshots.get("hand")?.opacity, 0);
    assert.equal(snapshots.get("hand")?.rotation.y, 22.5);
  });

  it("wraps long plays into the authored span", () => {
    assert.equal(wrapSeconds(1, 4), 1);
    assert.equal(wrapSeconds(6, 4), 2);
    assert.equal(wrapSeconds(-1, 4), 0);
    assert.equal(wrapSeconds(6, 0), 6);
    const snapshots = sampleSceneAt(SCENE, 6);
    // span is 4 (the rot-y keys); t=6 rides t=2, where the looping arm
    // position returns to its first key value per the trackValueAt contract.
    assert.equal(snapshots.get("arm")?.position.x, 0);
  });

  it("accumulates the parent chain into the world transform", () => {
    const world = worldTransform(SCENE, "hand", 1);
    assert.equal(world.position.x, 5);
    assert.equal(world.scale.x, 2);
    assert.equal(world.rotation.y, 22.5);
    const root = worldTransform(SCENE, "arm", 1);
    assert.equal(root.position.x, 5);
    assert.equal(root.scale.x, 1);
  });

  it("cuts a cyclic parent graph at the first revisit", () => {
    const cyclic: Scene3d = {
      ...SCENE,
      nodes: [
        { id: "arm", kind: "group", name: "arm", parent: "hand" },
        { id: "hand", kind: "mesh", name: "hand", parent: "arm" },
      ],
    };
    const world = worldTransform(cyclic, "arm", 1);
    assert.equal(world.scale.x, 2);
    assert.equal(world.position.x, 5);
  });

  it("answers an empty scene with an empty snapshot map", () => {
    const empty: Scene3d = { id: "empty", name: "empty", fps: 30, nodes: [], tracks: [] };
    assert.equal(sampleSceneAt(empty, 5).size, 0);
    const world = worldTransform(empty, "ghost", 5);
    assert.deepEqual(world.scale, { x: 1, y: 1, z: 1 });
  });
});
