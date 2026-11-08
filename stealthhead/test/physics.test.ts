// # physics.test — honest unit tests for the deterministic physics kernel,
// runnable with the vitest runner:
//   pnpm test
// Every case feeds plain structs and checks the exact replayable output —
// no fixtures from the DOM, no randomness, no mocks.
import assert from "node:assert/strict";
import { describe, it } from "vitest";
import {
  aabb,
  aabbcenter,
  add,
  applydrag,
  type Body,
  boxboxhit,
  closestpoint,
  createworld,
  DEFAULTGRAVITY,
  distance,
  dot,
  fixedsteps,
  length,
  normalize,
  type PhysWorld,
  scale,
  sphereboxhit,
  spherespherehit,
  stepbody,
  stepprojectile,
  sweepbox,
  vec3,
} from "../physics.ts";

const UNIT = aabb(vec3(0, 0, 0), vec3(1, 1, 1));

/** one free body resting at the origin with standard tuning. */
function bodyat(x: number, y: number, z: number, velocity = vec3(0, 0, 0)): Body {
  return { id: "b1", position: vec3(x, y, z), velocity, invmass: 1, restitution: 0.5, friction: 0 };
}

/** an open arena from the origin to 100 on every axis. */
function arena(): PhysWorld {
  return createworld(vec3(0, 0, 0), vec3(100, 100, 100));
}

describe("vector kernel", () => {
  it("adds, scales, dots, measures and normalizes without mutating", () => {
    const v = vec3(3, 0, 4);
    assert.deepEqual(add(v, vec3(1, 2, 3)), { x: 4, y: 2, z: 7 });
    assert.deepEqual(scale(v, 2), { x: 6, y: 0, z: 8 });
    assert.equal(dot(v, vec3(1, 0, 0)), 3);
    assert.equal(length(v), 5);
    const unit = normalize(v);
    assert.ok(Math.abs(unit.x - 0.6) < 1e-9);
    assert.equal(unit.y, 0);
    assert.ok(Math.abs(unit.z - 0.8) < 1e-9);
    assert.equal(length(v), 5);
  });

  it("keeps normalize total on the zero vector", () => {
    assert.deepEqual(normalize(vec3(0, 0, 0)), { x: 0, y: 0, z: 0 });
    assert.equal(distance(vec3(1, 2, 3), vec3(4, 6, 3)), 5);
  });
});

describe("shape queries", () => {
  it("builds boxes, centers them and finds closest points", () => {
    const box = aabb(vec3(0, 0, 0), vec3(4, 2, 6));
    assert.deepEqual(aabbcenter(box), { x: 2, y: 1, z: 3 });
    assert.deepEqual(closestpoint(box, vec3(5, 1, 3)), { x: 4, y: 1, z: 3 });
    assert.deepEqual(closestpoint(UNIT, vec3(0.5, 2, -1)), { x: 0.5, y: 1, z: 0 });
  });

  it("answers sphere, sphere-sphere and box-box overlaps", () => {
    assert.equal(sphereboxhit({ center: vec3(2, 0.5, 0.5), radius: 1.5 }, UNIT), true);
    assert.equal(sphereboxhit({ center: vec3(2, 0.5, 0.5), radius: 0.5 }, UNIT), false);
    assert.equal(spherespherehit({ center: vec3(0, 0, 0), radius: 1 }, { center: vec3(2, 0, 0), radius: 1 }), true);
    assert.equal(spherespherehit({ center: vec3(0, 0, 0), radius: 0.9 }, { center: vec3(2, 0, 0), radius: 1 }), false);
    assert.equal(boxboxhit(UNIT, aabb(vec3(0.5, 0.5, 0.5), vec3(2, 2, 2))), true);
    assert.equal(boxboxhit(UNIT, aabb(vec3(2, 2, 2), vec3(3, 3, 3))), false);
  });

  it("sweeps a box and reports the entry fraction or null", () => {
    const wall = aabb(vec3(4, 0, 0), vec3(5, 1, 1));
    assert.equal(sweepbox(UNIT, vec3(4, 0, 0), wall), 0.75);
    assert.equal(sweepbox(UNIT, vec3(3, 0, 0), wall), 1);
    assert.equal(sweepbox(UNIT, vec3(4, 0, 0), aabb(vec3(4, 5, 0), vec3(5, 6, 1))), null);
    assert.equal(sweepbox(UNIT, vec3(0, 0, 0), aabb(vec3(0.2, 0.2, 0.2), vec3(0.8, 0.8, 0.8))), 0);
    assert.equal(sweepbox(UNIT, vec3(0, 0, 0), aabb(vec3(5, 5, 5), vec3(6, 6, 6))), null);
  });
});

describe("integration", () => {
  it("applies gravity and bounces on the arena floor with restitution", () => {
    const next = stepbody(
      bodyat(0, 0, 0, vec3(1, 0, 0)),
      1,
      vec3(0, -10, 0),
      aabb(vec3(-10, 0, -10), vec3(10, 10, 10)),
    );
    assert.deepEqual(next.position, { x: 1, y: 0, z: 0 });
    assert.equal(next.velocity.x, 1);
    assert.equal(next.velocity.y, 5);
  });

  it("damps horizontal velocity by friction and respects invmass 0", () => {
    const grounded = { ...bodyat(0, 0, 0, vec3(2, 0, 0)), friction: 1 };
    const next = stepbody(grounded, 1, vec3(0, -10, 0), aabb(vec3(-10, 0, -10), vec3(10, 10, 10)));
    assert.equal(next.velocity.x, 0);
    const pinned: Body = { ...bodyat(3, 3, 3, vec3(1, 1, 1)), invmass: 0 };
    const still = stepbody(pinned, 1, vec3(0, -10, 0), aabb(vec3(-10, 0, -10), vec3(10, 10, 10)));
    assert.deepEqual(still.position, { x: 3, y: 3, z: 3 });
    assert.deepEqual(still.velocity, { x: 1, y: 1, z: 1 });
  });

  it("decays velocity through linear drag", () => {
    assert.deepEqual(applydrag(vec3(10, 0, 0), 0.5, 0.2), { x: 9, y: 0, z: 0 });
    assert.deepEqual(applydrag(vec3(10, 0, 0), 1, 2), { x: 0, y: 0, z: 0 });
  });
});

describe("projectiles", () => {
  it("flies with gravity and drag and reports no hit in open air", () => {
    const step = stepprojectile(
      { id: "p1", position: vec3(0, 50, 50), velocity: vec3(10, 0, 0), gravity: -10, drag: 0 },
      1,
      arena(),
    );
    assert.deepEqual(step.projectile.position, { x: 10, y: 40, z: 50 });
    assert.equal(step.hit, null);
    const dragged = stepprojectile(
      { id: "p2", position: vec3(0, 50, 50), velocity: vec3(10, 0, 0), gravity: 0, drag: 0.5 },
      1,
      arena(),
    );
    assert.equal(dragged.projectile.velocity.x, 5);
  });

  it("stops at the arena bounds as a world hit", () => {
    const step = stepprojectile(
      { id: "p3", position: vec3(99, 50, 50), velocity: vec3(10, 0, 0), gravity: -10, drag: 0 },
      1,
      arena(),
    );
    assert.equal(step.hit?.kind, "world");
    assert.deepEqual(step.hit?.at, { x: 100, y: 40, z: 50 });
  });

  it("stops at the first swept body hit and names it", () => {
    const world = arena();
    world.bodies.push({ ...bodyat(5, 50, 50), id: "crate" });
    const step = stepprojectile(
      { id: "p4", position: vec3(0, 50, 50), velocity: vec3(10, 0, 0), gravity: 0, drag: 0 },
      1,
      world,
    );
    assert.equal(step.hit?.kind, "body");
    assert.equal(step.hit?.id, "crate");
    assert.deepEqual(step.hit?.at, { x: 5, y: 50, z: 50 });
  });
});

describe("fixed-step loop", () => {
  it("converts frame deltas into whole steps plus a carried remainder", () => {
    const first = fixedsteps(0, 0.05, 0.02);
    assert.equal(first.steps, 2);
    assert.ok(Math.abs(first.remainder - 0.01) < 1e-9);
    const second = fixedsteps(0.01, 0.02, 0.02);
    assert.equal(second.steps, 1);
    assert.ok(Math.abs(second.remainder - 0.01) < 1e-9);
  });

  it("caps catch-up steps so a stall never spirals", () => {
    const capped = fixedsteps(0, 1, 0.02, 3);
    assert.equal(capped.steps, 3);
    assert.ok(Math.abs(capped.remainder - 0.94) < 1e-9);
  });

  it("bootstraps the empty arena with the default gravity", () => {
    const world = createworld(vec3(0, 0, 0), vec3(10, 10, 10));
    assert.deepEqual(world.gravity, DEFAULTGRAVITY);
    assert.equal(world.bodies.length, 0);
    assert.equal(world.projectiles.length, 0);
    assert.equal(dot(DEFAULTGRAVITY, vec3(0, 1, 0)), -19.6);
  });
});
