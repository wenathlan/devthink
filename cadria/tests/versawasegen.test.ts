// # versawasegen test — the procedural mesh generator of the versawase
// engine, runnable with vitest (no canvas, no GL):
//   pnpm vitest run tests/versawasegen.test.ts
// Every test watches the promises the charter makes: real vertex counts
// from the parametrization, analytic unit normals, outward winding, seed
// determinism of the noise terrain, ear-clipped caps on concave profiles,
// the modifier stack (twist, belly, subdivision) keeping the buffers valid,
// and the honest refusals of the MeshGenError contract.

import assert from "node:assert/strict";
import { describe, it } from "vitest";
import {
  averageNormals,
  bellyMesh,
  fbmNoise2,
  generateExtrusion,
  generateSphere,
  generateTerrain,
  generateTorus,
  hashNoise2,
  MeshGenError,
  subdivideMesh,
  twistMesh,
  validateMesh,
  valueNoise2,
  type GeneratedMesh,
} from "../versawasegen.ts";

/** the vertex triple at one index of a position buffer. */
function vertex(mesh: GeneratedMesh, index: number): [number, number, number] {
  return [mesh.positions[index * 3], mesh.positions[index * 3 + 1], mesh.positions[index * 3 + 2]];
}

/** share of faces whose winding agrees with a reference direction (outward / up). */
function agreeingFaces(mesh: GeneratedMesh, direction: (centroid: [number, number, number]) => [number, number, number]): number {
  let agree = 0;
  let total = 0;
  for (let face = 0; face + 2 < mesh.indices.length; face += 3) {
    const a = vertex(mesh, mesh.indices[face]);
    const b = vertex(mesh, mesh.indices[face + 1]);
    const c = vertex(mesh, mesh.indices[face + 2]);
    const centroid: [number, number, number] = [(a[0] + b[0] + c[0]) / 3, (a[1] + b[1] + c[1]) / 3, (a[2] + b[2] + c[2]) / 3];
    const reference = direction(centroid);
    const u: [number, number, number] = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
    const v: [number, number, number] = [c[0] - a[0], c[1] - a[1], c[2] - a[2]];
    const normal: [number, number, number] = [
      u[1] * v[2] - u[2] * v[1],
      u[2] * v[0] - u[0] * v[2],
      u[0] * v[1] - u[1] * v[0],
    ];
    const length = Math.hypot(...normal);
    if (length < 1e-9) continue;
    total += 1;
    if (normal[0] * reference[0] + normal[1] * reference[1] + normal[2] * reference[2] > 0) agree += 1;
  }
  return total === 0 ? 0 : agree / total;
}

describe("versawasegen sphere", () => {
  it("answers the parametrization counts exactly", () => {
    const sphere = generateSphere({ rings: 16, segments: 24 });
    assert.equal(sphere.counts.vertices, 17 * 25);
    assert.equal(sphere.counts.triangles, 2 * 24 * 15);
    assert.equal(sphere.positions.length, 17 * 25 * 3);
  });

  it("carries analytic normals — the normalized position of every vertex", () => {
    const sphere = generateSphere({ radius: 2, rings: 8, segments: 12 });
    for (let index = 0; index < sphere.counts.vertices; index += 1) {
      const [x, y, z] = vertex(sphere, index);
      const length = Math.hypot(x, y, z);
      assert.ok(Math.abs(length - 2) < 1e-6, "every vertex sits on the radius");
      assert.ok(
        Math.abs(sphere.normals[index * 3] - x / length) < 1e-6 &&
          Math.abs(sphere.normals[index * 3 + 1] - y / length) < 1e-6 &&
          Math.abs(sphere.normals[index * 3 + 2] - z / length) < 1e-6,
        "the normal is the normalized position",
      );
    }
  });

  it("winds every face outward (counter-clockwise from outside)", () => {
    const sphere = generateSphere({ rings: 8, segments: 12 });
    assert.equal(agreeingFaces(sphere, (centroid) => centroid), 1);
  });

  it("keeps the uv seam continuous: u spans 0..1 on every row", () => {
    const sphere = generateSphere({ rings: 4, segments: 8 });
    for (let row = 0; row <= 4; row += 1) {
      assert.equal(sphere.uvs[(row * 9) * 2], 0);
      assert.ok(Math.abs(sphere.uvs[(row * 9 + 8) * 2] - 1) < 1e-9);
    }
  });

  it("refuses a non-positive radius honestly", () => {
    assert.throws(() => generateSphere({ radius: 0 }), MeshGenError);
  });
});

describe("versawasegen torus", () => {
  it("answers the parametrization counts exactly", () => {
    const torus = generateTorus({ majorSegments: 32, minorSegments: 16 });
    assert.equal(torus.counts.vertices, 33 * 17);
    assert.equal(torus.counts.triangles, 2 * 32 * 16);
  });

  it("winds every face outward from the tube surface", () => {
    const torus = generateTorus({ majorSegments: 12, minorSegments: 8, majorRadius: 1, minorRadius: 0.3 });
    // the reference is away from the tube centerline at the face's angle
    const agree = agreeingFaces(torus, (centroid) => {
      const angle = Math.atan2(centroid[2], centroid[0]);
      return [centroid[0] - Math.cos(angle), centroid[1], centroid[2] - Math.sin(angle)];
    });
    assert.ok(agree > 0.95, `faces agree outward (${agree})`);
  });

  it("is deterministic for one option set", () => {
    const a = generateTorus({ majorSegments: 6, minorSegments: 5, seed: undefined } as never);
    const b = generateTorus({ majorSegments: 6, minorSegments: 5 } as never);
    assert.ok(a.positions.every((value, index) => value === b.positions[index]));
  });

  it("refuses a tube thicker than its ring honestly", () => {
    assert.throws(() => generateTorus({ majorRadius: 1, minorRadius: 1 }), MeshGenError);
  });
});

describe("versawasegen noise terrain", () => {
  it("answers the grid counts exactly", () => {
    const terrain = generateTerrain({ segmentsX: 20, segmentsZ: 10 });
    assert.equal(terrain.counts.vertices, 21 * 11);
    assert.equal(terrain.counts.triangles, 2 * 20 * 10);
  });

  it("is deterministic over the seed and differs across seeds", () => {
    const a = generateTerrain({ segmentsX: 8, segmentsZ: 8, fbm: { seed: 3 } });
    const b = generateTerrain({ segmentsX: 8, segmentsZ: 8, fbm: { seed: 3 } });
    const c = generateTerrain({ segmentsX: 8, segmentsZ: 8, fbm: { seed: 4 } });
    assert.ok(a.positions.every((value, index) => value === b.positions[index]));
    assert.ok(a.positions.some((value, index) => value !== c.positions[index]));
  });

  it("keeps every height inside the amplitude band and every face up", () => {
    const terrain = generateTerrain({ segmentsX: 12, segmentsZ: 12, amplitude: 0.5, fbm: { seed: 9 } });
    for (let index = 0; index < terrain.counts.vertices; index += 1) {
      assert.ok(Math.abs(terrain.positions[index * 3 + 1]) <= 0.5 + 1e-9);
    }
    assert.ok(agreeingFaces(terrain, () => [0, 1, 0]) > 0.95, "terrain faces agree with +y");
  });

  it("derives normals from the central differences of the field (mostly +y)", () => {
    const terrain = generateTerrain({ segmentsX: 10, segmentsZ: 10, amplitude: 0.2 });
    for (let index = 0; index < terrain.counts.vertices; index += 1) {
      assert.ok(terrain.normals[index * 3 + 1] > 0, "the y normal component stays positive on gentle terrain");
    }
  });

  it("refuses a non-positive size honestly", () => {
    assert.throws(() => generateTerrain({ sizeX: 0 }), MeshGenError);
  });
});

describe("versawasegen extrusion", () => {
  it("extrudes a convex square with exact side and cap counts", () => {
    const square = generateExtrusion(
      [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 1, y: 1 },
        { x: 0, y: 1 },
      ],
      { zFrom: 0, zTo: 2 },
    );
    assert.equal(square.counts.vertices, 16);
    assert.equal(square.counts.triangles, 12);
  });

  it("ear-clips a concave L profile (more cap triangles, still valid)", () => {
    const ell = generateExtrusion(
      [
        { x: 0, y: 0 },
        { x: 2, y: 0 },
        { x: 2, y: 1 },
        { x: 1, y: 1 },
        { x: 1, y: 2 },
        { x: 0, y: 2 },
      ],
    );
    assert.equal(ell.counts.vertices, 24);
    assert.equal(ell.counts.triangles, 20);
    assert.ok(validateMesh(ell).ok);
  });

  it("gives the caps exact +/-z normals (hard edges, honestly split)", () => {
    const shape = generateExtrusion(
      [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 0.5, y: 1 },
      ],
      { zFrom: 0, zTo: 1 },
    );
    const count = shape.counts.vertices;
    for (let index = count - 6; index < count - 3; index += 1) {
      assert.deepEqual([shape.normals[index * 3], shape.normals[index * 3 + 1], shape.normals[index * 3 + 2]], [0, 0, 1]);
    }
    for (let index = count - 3; index < count; index += 1) {
      assert.deepEqual([shape.normals[index * 3], shape.normals[index * 3 + 1], shape.normals[index * 3 + 2]], [0, 0, -1]);
    }
  });

  it("refuses degenerate rings: collinear, repeated points, short spans", () => {
    assert.throws(
      () =>
        generateExtrusion([
          { x: 0, y: 0 },
          { x: 1, y: 1 },
          { x: 2, y: 2 },
        ]),
      MeshGenError,
    );
    assert.throws(
      () =>
        generateExtrusion([
          { x: 0, y: 0 },
          { x: 0, y: 0 },
          { x: 1, y: 1 },
        ]),
      MeshGenError,
    );
    assert.throws(() => generateExtrusion([{ x: 0, y: 0 }, { x: 1, y: 0 }]), MeshGenError);
    assert.throws(() => generateExtrusion([{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 1 }], { zFrom: 1, zTo: 1 }), MeshGenError);
  });
});

describe("versawasegen modifier stack", () => {
  it("twists without touching the counts, recomputing the normals honestly", () => {
    const sphere = generateSphere({ rings: 6, segments: 8 });
    const twisted = twistMesh(sphere, 2);
    assert.equal(twisted.counts.vertices, sphere.counts.vertices);
    assert.equal(twisted.counts.triangles, sphere.counts.triangles);
    assert.ok(validateMesh(twisted).ok);
    assert.ok(sphere.positions.some((value, index) => value !== twisted.positions[index]));
  });

  it("bellies at mid-height and returns to exact size at the extremes", () => {
    // the belly keys on the y band of the mesh: a hexagon profile carries
    // vertices on the mid band, so the swell is measurable there
    const h = Math.sqrt(3) / 4;
    const column = generateExtrusion(
      [
        { x: 0.5, y: 0 },
        { x: 0.25, y: h },
        { x: -0.25, y: h },
        { x: -0.5, y: 0 },
        { x: -0.25, y: -h },
        { x: 0.25, y: -h },
      ],
      { zFrom: 0, zTo: 2 },
    );
    const belled = bellyMesh(column, 0.5);
    assert.ok(validateMesh(belled).ok);
    let bandMin = Number.POSITIVE_INFINITY;
    let bandMax = Number.NEGATIVE_INFINITY;
    for (let index = 1; index < column.positions.length; index += 3) {
      bandMin = Math.min(bandMin, column.positions[index]);
      bandMax = Math.max(bandMax, column.positions[index]);
    }
    // the radial (xz) distance of a vertex slice, smallest corner first
    const radiusAt = (mesh: GeneratedMesh, y: number): number => {
      let best = Number.POSITIVE_INFINITY;
      for (let index = 0; index < mesh.counts.vertices; index += 1) {
        if (Math.abs(mesh.positions[index * 3 + 1] - y) < 1e-9)
          best = Math.min(best, Math.hypot(mesh.positions[index * 3], mesh.positions[index * 3 + 2]));
      }
      return best;
    };
    const midY = (bandMin + bandMax) / 2;
    assert.ok(Math.abs(radiusAt(belled, bandMin) - radiusAt(column, bandMin)) < 1e-9, "the band ends keep their size");
    assert.ok(radiusAt(belled, midY) > radiusAt(column, midY) + 0.05, "the mid band swells");
  });

  it("subdivides four triangles per face per level, sharing the edge midpoints", () => {
    const sphere = generateSphere({ rings: 4, segments: 6 });
    const once = subdivideMesh(sphere, 1);
    const twice = subdivideMesh(sphere, 2);
    assert.equal(once.counts.triangles, sphere.counts.triangles * 4);
    assert.equal(twice.counts.triangles, sphere.counts.triangles * 16);
    assert.ok(validateMesh(once).ok);
    assert.ok(validateMesh(twice).ok);
    // face-local duplication would add 3 midpoints per triangle; sharing
    // through the edge cache answers strictly fewer new vertices than that
    const faceLocal = sphere.counts.vertices + sphere.counts.triangles * 3;
    assert.ok(once.counts.vertices < faceLocal, `midpoints are shared (${once.counts.vertices} < ${faceLocal})`);
  });

  it("refuses the explosion: level bounds and the triangle cap", () => {
    const dense = generateTerrain({ segmentsX: 64, segmentsZ: 64 });
    assert.throws(() => subdivideMesh(dense, 0.5), MeshGenError);
    assert.throws(() => subdivideMesh(dense, 7), MeshGenError);
    assert.throws(() => subdivideMesh(dense, 4), MeshGenError);
  });
});

describe("versawasegen audit and noise floor", () => {
  it("validates every primitive the module ships", () => {
    for (const mesh of [
      generateSphere({ rings: 4, segments: 6 }),
      generateTorus({ majorSegments: 6, minorSegments: 4 }),
      generateTerrain({ segmentsX: 5, segmentsZ: 5 }),
      generateExtrusion([
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 0.5, y: 1 },
      ]),
    ]) {
      const audit = validateMesh(mesh);
      assert.deepEqual(audit.issues, []);
      assert.ok(audit.ok);
    }
  });

  it("refuses crafted damage: misaligned buffers, out-of-bounds indices, non-unit normals", () => {
    const good = generateSphere({ rings: 2, segments: 3 });
    const misaligned = validateMesh({ ...good, normals: new Float32Array(7) });
    assert.equal(misaligned.ok, false);
    assert.ok(misaligned.issues.some((issue) => issue.code === "normals-shape"));
    const outOfBounds = validateMesh({ ...good, indices: new Uint32Array([good.counts.vertices, 0, 1]) });
    assert.ok(outOfBounds.issues.some((issue) => issue.code === "index-out-of-bounds"));
    const scaled = new Float32Array(good.normals);
    scaled[0] = 2;
    const nonUnit = validateMesh({ ...good, normals: scaled });
    assert.ok(nonUnit.issues.some((issue) => issue.code === "normals-not-unit"));
  });

  it("answers a deterministic hash, bounded value noise and bounded fractal sums", () => {
    assert.equal(hashNoise2(3, 4, 5), hashNoise2(3, 4, 5));
    assert.notEqual(hashNoise2(3, 4, 5), hashNoise2(3, 4, 6));
    for (const [x, y] of [[0, 0], [1.3, 7.8], [-4.2, 2.9]] as const) {
      const value = valueNoise2(x, y, 11);
      assert.ok(value >= 0 && value <= 1, `value noise stays inside 0..1 (${value})`);
      const fractal = fbmNoise2(x, y, { seed: 11, octaves: 4 });
      assert.ok(fractal >= 0 && fractal <= 1, `fbm stays inside 0..1 (${fractal})`);
    }
    // the fractal sum is continuous: a small step never jumps the field
    const step = Math.abs(fbmNoise2(1.0, 1.0, { seed: 2 }) - fbmNoise2(1.001, 1.0, { seed: 2 }));
    assert.ok(step < 0.05, `the field is continuous across a small step (${step})`);
  });

  it("recomputes smooth normals over the averaged faces (isolated vertices fall back)", () => {
    const triangle: GeneratedMesh = {
      positions: new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0]),
      normals: new Float32Array(9),
      uvs: new Float32Array(6),
      indices: new Uint32Array([0, 1, 2]),
      counts: { vertices: 3, triangles: 1 },
    };
    const normals = averageNormals(triangle.positions, triangle.indices);
    assert.deepEqual([...normals], [0, 0, 1, 0, 0, 1, 0, 0, 1]);
  });
});
