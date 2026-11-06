// # mesh.test — the mesh generator seat of the versawaze engine: the box,
// the plane, the cylinder/cone family, the capsule, the icosphere, the
// parametric surface, the merge and the matrix transform — every builder
// audited through validateMesh (versawasegen, single-sourced), plus the
// re-export parity with the versawasegen generators, runnable with vitest:
//   bun x vitest run test/mesh.test.ts
import assert from "node:assert/strict";
import { describe, it } from "vitest";
import {
  BoxOptions,
  GeneratedMesh,
  MeshGenError,
  generateBox,
  generateCapsule,
  generateCone,
  generateCylinder,
  generateIcosphere,
  generatePlane,
  generateSphere,
  generateTorus,
  mergemeshes,
  meshbounds,
  parametricsurface,
  transformmesh,
  validateMesh,
} from "../mesh.ts";
import { generateSphere as generateSphereDirect } from "../versawase.ts";
import { mat4rotationx, mat4translation } from "../versa.ts";

/** close-enough for float32 geometry. */
const EPS = 1e-5;

function close(a: number, b: number, eps = EPS): void {
  assert.ok(Math.abs(a - b) <= eps, `expected ${a} ≈ ${b}`);
}

/** every vertex of the mesh sits exactly on the given radius. */
function assertSphereRadius(mesh: GeneratedMesh, radius: number): void {
  for (let at = 0; at < mesh.positions.length; at += 3) {
    const distance = Math.hypot(mesh.positions[at], mesh.positions[at + 1], mesh.positions[at + 2]);
    close(distance, radius, 1e-4);
  }
}

describe("mesh box", () => {
  it("answers 24 vertices, 12 triangles and per-face axis normals", () => {
    const box = generateBox({ width: 2, height: 2, depth: 2 });
    assert.equal(box.counts.vertices, 24);
    assert.equal(box.counts.triangles, 12);
    assert.ok(validateMesh(box).ok, validateMesh(box).issues.map((issue) => issue.message).join("; "));
    // the first face is +x: its four normals point exactly +x
    for (let vertex = 0; vertex < 4; vertex += 1) {
      close(box.normals[vertex * 3], 1);
      close(box.normals[vertex * 3 + 1], 0);
      close(box.normals[vertex * 3 + 2], 0);
    }
    const bounds = meshbounds(box);
    close(bounds.min[0], -1);
    close(bounds.max[0], 1);
  });

  it("refuses non-positive extents honestly", () => {
    assert.throws(() => generateBox({ width: 0 } as BoxOptions), MeshGenError);
    assert.throws(() => generateBox({ height: -1 } as BoxOptions), MeshGenError);
  });
});

describe("mesh plane", () => {
  it("answers the (segments + 1)² grid with the +y normal everywhere", () => {
    const plane = generatePlane({ width: 2, depth: 4, segmentsX: 2, segmentsZ: 3 });
    assert.equal(plane.counts.vertices, 3 * 4);
    assert.equal(plane.counts.triangles, 2 * 2 * 3);
    assert.ok(validateMesh(plane).ok);
    for (let at = 0; at < plane.normals.length; at += 3) {
      close(plane.normals[at], 0);
      close(plane.normals[at + 1], 1);
      close(plane.normals[at + 2], 0);
    }
    const bounds = meshbounds(plane);
    close(bounds.min[1], 0);
    close(bounds.max[1], 0);
    close(bounds.min[2], -2);
    close(bounds.max[2], 2);
  });
});

describe("mesh cylinder family", () => {
  it("answers the ring lattice with horizontal side normals", () => {
    const cylinder = generateCylinder({ radiusTop: 1, radiusBottom: 1, height: 2, radialSegments: 8, heightSegments: 1, caps: true });
    // 2 rings x 9 columns + 2 cap centers
    assert.equal(cylinder.counts.vertices, 2 * 9 + 2);
    // 8 side quads + 8 + 8 cap triangles
    assert.equal(cylinder.counts.triangles, 8 * 2 + 8 + 8);
    assert.ok(validateMesh(cylinder).ok);
    // the first ring vertex sits at θ = 0: position (1, -1, 0), normal (1, 0, 0)
    close(cylinder.positions[0], 1);
    close(cylinder.positions[1], -1);
    close(cylinder.normals[0], 1);
    close(cylinder.normals[1], 0, 1e-6);
  });

  it("collapses the cone apex without a degenerate triangle", () => {
    const cone = generateCone({ radius: 1, height: 2, radialSegments: 8, caps: true });
    // 1 base ring x 9 + 1 apex + 1 base center
    assert.equal(cone.counts.vertices, 9 + 1 + 1);
    assert.equal(cone.counts.triangles, 8 + 8);
    assert.ok(validateMesh(cone).ok);
    // the cone side normals tilt up (the honest -slope tilt)
    let upCount = 0;
    for (let at = 0; at < cone.normals.length; at += 3) {
      if (cone.normals[at + 1] > 0.1) upCount += 1;
    }
    assert.ok(upCount >= 9, `the side normals tilt upward, got ${upCount} of ${cone.counts.vertices}`);
  });

  it("tilts the tapered side normals between the rings", () => {
    const tapered = generateCylinder({ radiusTop: 0.5, radiusBottom: 1, height: 2, radialSegments: 8, caps: false });
    assert.ok(validateMesh(tapered).ok);
    // slope = (0.5 - 1) / 2 = -0.25 → normal y = -slope / len > 0
    const expectedY = 0.25 / Math.hypot(1, 0.25);
    close(tapered.normals[1], expectedY, 1e-4);
  });
});

describe("mesh capsule", () => {
  it("answers the closed lathe with two pole vertices", () => {
    const capsule = generateCapsule({ radius: 0.5, length: 1, radialSegments: 8, capSegments: 2 });
    // profile rows: 2 * (capSegments + 1) = 6 — two poles (1 vertex) + 4 rings x 9
    assert.equal(capsule.counts.vertices, 2 + 4 * 9);
    assert.ok(validateMesh(capsule).ok);
    const bounds = meshbounds(capsule);
    close(bounds.min[1], -1, 1e-6); // -(length/2 + radius)
    close(bounds.max[1], 1, 1e-6);
    // every vertex rides the capsule surface: x² + z² ≤ r² and y inside the hull
    for (let at = 0; at < capsule.positions.length; at += 3) {
      const radial = Math.hypot(capsule.positions[at], capsule.positions[at + 2]);
      assert.ok(radial <= 0.5 + 1e-5, `the radial distance stays inside the radius, got ${radial}`);
    }
  });
});

describe("mesh icosphere", () => {
  it("answers the welded subdivision counts (12 → 42 → 162 vertices)", () => {
    const level0 = generateIcosphere({ radius: 1, subdivisions: 0 });
    assert.equal(level0.counts.vertices, 12);
    assert.equal(level0.counts.triangles, 20);
    const level1 = generateIcosphere({ radius: 2, subdivisions: 1 });
    assert.equal(level1.counts.vertices, 42);
    assert.equal(level1.counts.triangles, 80);
    assert.ok(validateMesh(level1).ok);
    assertSphereRadius(level1, 2);
  });

  it("answers normals exactly along the radius", () => {
    const sphere = generateIcosphere({ radius: 3, subdivisions: 2 });
    for (let at = 0; at < sphere.positions.length; at += 3) {
      const length = Math.hypot(sphere.positions[at], sphere.positions[at + 1], sphere.positions[at + 2]);
      close(sphere.normals[at], sphere.positions[at] / length, 1e-5);
      close(sphere.normals[at + 1], sphere.positions[at + 1] / length, 1e-5);
      close(sphere.normals[at + 2], sphere.positions[at + 2] / length, 1e-5);
    }
  });
});

describe("mesh parametric surface", () => {
  it("answers the grid counts and the cross(du, dv) orientation", () => {
    const plane = parametricsurface((u, v) => [u, 0, v], { uRange: [-1, 1], vRange: [-1, 1], segmentsU: 4, segmentsV: 6 });
    assert.equal(plane.counts.vertices, 5 * 7);
    assert.equal(plane.counts.triangles, 4 * 6 * 2);
    assert.ok(validateMesh(plane).ok);
    // du = +x, dv = +z → cross(du, dv) = -y
    for (let at = 0; at < plane.normals.length; at += 3) {
      close(plane.normals[at + 1], -1, 1e-4);
    }
    // the flip option answers the mirrored orientation
    const flipped = parametricsurface((u, v) => [u, 0, v], { segmentsU: 2, segmentsV: 2, flip: true });
    close(flipped.normals[1], 1, 1e-4);
  });

  it("answers unit normals for a saddle surface", () => {
    const saddle = parametricsurface((u, v) => [u, u * u - v * v, v], { segmentsU: 8, segmentsV: 8 });
    assert.ok(validateMesh(saddle).ok, "the saddle normals stay unit through the audit");
  });

  it("refuses a non-finite map answer honestly", () => {
    assert.throws(() => parametricsurface(() => [0, Number.NaN, 0]), MeshGenError);
    assert.throws(() => parametricsurface((u) => [u, 0, 0], { uRange: [1, 1] }), MeshGenError);
  });
});

describe("mesh re-export parity (the dedup law)", () => {
  it("answers the versawasegen generators byte for byte", () => {
    const throughSeat = generateSphere({ radius: 1.5, rings: 8, segments: 12 });
    const direct = generateSphereDirect({ radius: 1.5, rings: 8, segments: 12 });
    assert.deepEqual(new Float32Array(throughSeat.positions), new Float32Array(direct.positions));
    assert.deepEqual(new Uint32Array(throughSeat.indices), new Uint32Array(direct.indices));
    const torus = generateTorus({ majorRadius: 2, minorRadius: 0.5 });
    assert.ok(validateMesh(torus).ok);
  });
});

describe("mesh merge and transform", () => {
  it("merges two boxes with rebased indices", () => {
    const first = generateBox();
    const second = generateBox({ width: 2, height: 2, depth: 2 });
    const merged = mergemeshes([first, second]);
    assert.equal(merged.counts.vertices, 48);
    assert.equal(merged.counts.triangles, 24);
    assert.ok(validateMesh(merged).ok);
    // the second box's first index is offset by the first box's vertex count
    // (each box carries 36 indices — 12 triangles)
    assert.equal(merged.indices[36], second.indices[0] + 24);
    assert.throws(() => mergemeshes([]), MeshGenError);
  });

  it("translates the positions and keeps the normals", () => {
    const box = generateBox({ width: 2, height: 2, depth: 2 });
    const moved = transformmesh(box, mat4translation(5, 0, 0));
    assert.ok(validateMesh(moved).ok);
    const bounds = meshbounds(moved);
    close(bounds.min[0], 4);
    close(bounds.max[0], 6);
    // a pure translation never turns a normal
    close(moved.normals[0], box.normals[0]);
    close(moved.normals[1], box.normals[1]);
  });

  it("rotates the plane so the +y normal walks to +z", () => {
    const plane = generatePlane({ width: 2, depth: 2 });
    const rotated = transformmesh(plane, mat4rotationx(Math.PI / 2));
    assert.ok(validateMesh(rotated).ok);
    close(rotated.normals[1], 0, 1e-6);
    close(rotated.normals[2], 1, 1e-5);
    // the plane's z extent folds onto the y axis of the rotated space and
    // the old y (a flat zero) collapses onto the new z
    const bounds = meshbounds(rotated);
    close(bounds.min[1], -1, 1e-5);
    close(bounds.max[1], 1, 1e-5);
    close(bounds.min[2], 0, 1e-6);
    close(bounds.max[2], 0, 1e-6);
  });
});
