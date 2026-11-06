// # versa.test — the math core of the versawaze engine: the mat4 algebra
// (identity, multiply, invert, the normal matrix), the projection and view
// matrices, the model-view-projection pipeline with the screen viewport
// walk, the bone rigs (forward kinematics, poses, the honest refusals) and
// the movements (linear, eased, bezier and hold spans), runnable with
// vitest:
//   bun x vitest run tests/versa.test.ts
import assert from "node:assert/strict";
import { describe, it } from "vitest";
import {
  type MovementKey,
  type Rig,
  Vec3,
  VersaError,
  bezier3,
  composepipeline,
  mat3normalfrommat4,
  mat4identity,
  mat4invert,
  mat4lookat,
  mat4multiply,
  mat4orthographic,
  mat4perspective,
  mat4rotationz,
  mat4scale,
  mat4transformdir,
  mat4transformpoint,
  mat4translation,
  movementarclength,
  movementduration,
  projectpoint,
  rigpose,
  samplemovement,
  validatemovement,
  vec3lerp,
} from "../versa.ts";

/** close-enough for float32 math. */
const EPS = 1e-5;

function close(a: number, b: number, eps = EPS): void {
  assert.ok(Math.abs(a - b) <= eps, `expected ${a} ≈ ${b}`);
}

describe("versa mat4 algebra", () => {
  it("multiplies by the identity without change", () => {
    const m = mat4multiply(mat4translation(1, 2, 3), mat4identity());
    close(m[12], 1);
    close(m[13], 2);
    close(m[14], 3);
  });

  it("applies translation to a point and leaves directions alone", () => {
    const t = mat4translation(10, -4, 2);
    assert.deepEqual(mat4transformpoint(t, [1, 1, 1]), [11, -3, 3]);
    assert.deepEqual(mat4transformdir(t, [1, 0, 0]), [1, 0, 0]);
  });

  it("answers the inverse so M * M⁻¹ is the identity", () => {
    const m = mat4multiply(mat4translation(3, -2, 5), mat4rotationz(0.7));
    const inverse = mat4invert(m);
    assert.ok(inverse, "the rigid transform is invertible");
    const product = mat4multiply(m, inverse);
    const identity = mat4identity();
    for (let at = 0; at < 16; at += 1) close(product[at], identity[at], 1e-4);
  });

  it("refuses to invert a singular matrix", () => {
    assert.equal(mat4invert(mat4scale(1, 0, 1)), null);
  });

  it("keeps normals orthogonal through non-uniform scale (the normal matrix)", () => {
    const normalMatrix = mat3normalfrommat4(mat4scale(2, 2, 2));
    assert.ok(normalMatrix);
    // inverse-transpose of 2I is 0.5I
    close(normalMatrix[0], 0.5);
    close(normalMatrix[4], 0.5);
    close(normalMatrix[8], 0.5);
  });
});

describe("versa projections and pipeline", () => {
  it("carries the view axis point to the screen center", () => {
    const view = mat4lookat([0, 0, 0], [0, 0, -1], [0, 1, 0]);
    const projection = mat4perspective(Math.PI / 2, 1, 1, 100);
    const pipeline = composepipeline({ view, projection, viewport: { x: 0, y: 0, width: 800, height: 600 } });
    const projected = projectpoint(pipeline, [0, 0, -5]);
    close(projected.x, 400);
    close(projected.y, 300);
    assert.ok(projected.visible, "the axis point sits inside the frustum");
    assert.ok(projected.depth > -1 && projected.depth < 1, "the ndc depth stays inside the range");
  });

  it("maps the near plane to -1 and the far plane to +1", () => {
    const view = mat4lookat([0, 0, 0], [0, 0, -1], [0, 1, 0]);
    const projection = mat4perspective(Math.PI / 2, 1, 1, 100);
    const pipeline = composepipeline({ view, projection, viewport: { x: 0, y: 0, width: 100, height: 100 } });
    close(projectpoint(pipeline, [0, 0, -1]).depth, -1, 1e-3);
    close(projectpoint(pipeline, [0, 0, -100]).depth, 1, 1e-3);
  });

  it("flags the frustum outsiders honestly", () => {
    const view = mat4lookat([0, 0, 0], [0, 0, -1], [0, 1, 0]);
    const projection = mat4perspective(Math.PI / 2, 1, 1, 100);
    const pipeline = composepipeline({ view, projection, viewport: { x: 0, y: 0, width: 100, height: 100 } });
    assert.equal(projectpoint(pipeline, [0, 0, 5]).visible, false, "behind the camera");
    assert.equal(projectpoint(pipeline, [500, 0, -5]).visible, false, "outside the frustum sides");
  });

  it("walks the camera eye to the camera origin through the view matrix", () => {
    const view = mat4lookat([3, 4, 5], [0, 0, 0], [0, 1, 0]);
    const eyeInView = mat4transformpoint(view, [3, 4, 5]);
    assert.deepEqual(eyeInView.map((axis) => Math.round(axis * 1e5) / 1e5), [0, 0, 0]);
  });

  it("refuses the degenerate lookAt bases", () => {
    assert.throws(() => mat4lookat([1, 1, 1], [1, 1, 1], [0, 1, 0]), VersaError);
    assert.throws(() => mat4lookat([0, 0, 0], [0, 1, 0], [0, 1, 0]), VersaError);
  });

  it("answers an orthographic depth of -1 at the near plane", () => {
    const view = mat4lookat([0, 0, 0], [0, 0, -1], [0, 1, 0]);
    const projection = mat4orthographic(-1, 1, -1, 1, 1, 10);
    const pipeline = composepipeline({ view, projection, viewport: { x: 0, y: 0, width: 100, height: 100 } });
    close(projectpoint(pipeline, [0, 0, -1]).depth, -1, 1e-4);
    close(projectpoint(pipeline, [0, 0, -10]).depth, 1, 1e-4);
  });
});

describe("versa rigs", () => {
  const rig: Rig = {
    name: "test-arm",
    bones: [
      { id: "root", parent: null, translation: [0, 0, 0], rotation: [0, 0, 0], length: 2 },
      { id: "arm", parent: "root", translation: [0, 2, 0], rotation: [0, 0, Math.PI / 2], length: 1 },
    ],
  };

  it("walks forward kinematics through the bone chain", () => {
    const posed = rigpose(rig);
    assert.equal(posed.length, 2);
    assert.deepEqual(posed[0].origin, [0, 0, 0]);
    assert.deepEqual(posed[0].tip, [0, 2, 0]);
    // the arm rides its parent tip, then its own z-rotation swings the tip
    // from +y to -x
    close(posed[1].origin[0], 0);
    close(posed[1].origin[1], 2);
    close(posed[1].tip[0], -1);
    close(posed[1].tip[1], 2);
    close(posed[1].tip[2], 0);
  });

  it("swings the whole chain when the root pose rotates", () => {
    const posed = rigpose(rig, { root: { rotation: [0, 0, Math.PI / 2] } });
    // the root tip (0,2,0) rotates to (-2,0,0); the arm origin follows
    close(posed[1].origin[0], -2);
    close(posed[1].origin[1], 0, 1e-5);
  });

  it("refuses broken rigs and unknown pose bones honestly", () => {
    const cyclic: Rig = {
      name: "bad",
      bones: [
        { id: "a", parent: "b", translation: [0, 0, 0], rotation: [0, 0, 0], length: 1 },
        { id: "b", parent: "a", translation: [0, 0, 0], rotation: [0, 0, 0], length: 1 },
      ],
    };
    assert.throws(() => rigpose(cyclic), VersaError);
    const orphan: Rig = {
      name: "bad",
      bones: [{ id: "a", parent: "ghost", translation: [0, 0, 0], rotation: [0, 0, 0], length: 1 }],
    };
    assert.throws(() => rigpose(orphan), VersaError);
    assert.throws(() => rigpose(rig, { unknown: { rotation: [0, 0, 1] } }), VersaError);
  });
});

describe("versa movements", () => {
  const linear: MovementKey[] = [
    { time: 0, position: [0, 0, 0] },
    { time: 2, position: [10, 0, 0] },
  ];

  it("blends linearly by the time fraction", () => {
    assert.deepEqual(samplemovement(linear, 1), [5, 0, 0]);
    assert.deepEqual(samplemovement(linear, 0), [0, 0, 0]);
    assert.deepEqual(samplemovement(linear, 2), [10, 0, 0]);
    // outside the span the ends hold
    assert.deepEqual(samplemovement(linear, -1), [0, 0, 0]);
    assert.deepEqual(samplemovement(linear, 99), [10, 0, 0]);
  });

  it("freezes through a hold span", () => {
    const held: MovementKey[] = [
      { time: 0, position: [0, 0, 0], mode: "hold" },
      { time: 2, position: [10, 0, 0] },
    ];
    assert.deepEqual(samplemovement(held, 1.9), [0, 0, 0]);
    assert.deepEqual(samplemovement(held, 2), [10, 0, 0]);
  });

  it("delegates the eased spans to the easecurves solver (in-out symmetry)", () => {
    const eased: MovementKey[] = [
      {
        time: 0,
        position: [0, 0, 0],
        mode: "ease",
        ease: { outInfluence: 100 / 3, outSpeed: 0, inInfluence: 100 / 3, inSpeed: 0 },
      },
      { time: 2, position: [10, 0, 0] },
    ];
    const mid = samplemovement(eased, 1) as Vec3;
    close(mid[0], 5);
    // the in-out preset starts slower than linear
    const early = samplemovement(eased, 0.25) as Vec3;
    assert.ok(early[0] < 2.5, `the ease-in start runs slow, got ${early[0]}`);
  });

  it("walks the bezier spans with the cubic math", () => {
    const curved: MovementKey[] = [
      { time: 0, position: [0, 0, 0], mode: "bezier", control1: [10, 0, 0], control2: [10, 10, 0] },
      { time: 2, position: [10, 10, 0] },
    ];
    assert.deepEqual(samplemovement(curved, 0), [0, 0, 0]);
    assert.deepEqual(samplemovement(curved, 2), [10, 10, 0]);
    const middle = samplemovement(curved, 1) as Vec3;
    // p(0.5) = 0.125 p0 + 0.375 c1 + 0.375 c2 + 0.125 p3
    close(middle[0], 10 * (0.375 + 0.375) + 10 * 0.125, 1e-4);
    close(middle[1], 10 * (0.375 + 0.125), 1e-4);
    // the raw cubic helper agrees
    const direct = bezier3([0, 0, 0], [10, 0, 0], [10, 10, 0], [10, 10, 0], 0.5);
    close(direct[0], middle[0], 1e-6);
  });

  it("refuses invalid tracks instead of faking a path", () => {
    assert.equal(samplemovement([], 1), null);
    assert.equal(validatemovement([{ time: 1, position: [0, 0, 0] }, { time: 1, position: [1, 0, 0] }]), false);
    assert.equal(validatemovement([{ time: 0, position: [Number.NaN, 0, 0] }]), false);
    assert.equal(movementduration([]), null);
  });

  it("answers a monotonic arc-length table", () => {
    // the symmetric control handles keep the cubic span on the straight
    // diagonal, so the chord table must land on the euclidean length
    const straight: MovementKey[] = [
      {
        time: 0,
        position: [0, 0, 0],
        mode: "bezier",
        control1: [5 / 3, 5 / 3, 0],
        control2: [10 / 3, 10 / 3, 0],
      },
      { time: 1, position: [5, 5, 0] },
    ];
    const lengths = movementarclength(straight, 16);
    assert.ok(lengths);
    for (let at = 1; at < lengths.length; at += 1) assert.ok(lengths[at] >= lengths[at - 1]);
    close(lengths[lengths.length - 1], Math.hypot(5, 5), 1e-3);
    // a curved span answers strictly longer than the diagonal
    const curved: MovementKey[] = [
      { time: 0, position: [0, 0, 0], mode: "bezier", control1: [5, 0, 0], control2: [5, 5, 0] },
      { time: 1, position: [5, 5, 0] },
    ];
    const curvedLengths = movementarclength(curved, 32);
    assert.ok(curvedLengths);
    assert.ok(curvedLengths[curvedLengths.length - 1] > Math.hypot(5, 5), "the bowed path runs longer than the diagonal");
  });

  it("lerps vectors component-wise", () => {
    assert.deepEqual(vec3lerp([0, 0, 0], [10, 20, 30], 0.5), [5, 10, 15]);
  });
});
