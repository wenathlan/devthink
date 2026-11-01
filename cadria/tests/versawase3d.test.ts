// # versawase3d test — the mesh-data→three-args conversion validated without
// rendering: mirrored positions, reversed winding, passed-through colors,
// mirrored normals, bounding box and camera framing math, plus a real
// BufferGeometry construction (three is importable in node — only the render
// needs a canvas) and the typed refusal of a context-less mount.

import * as THREE from "three";
import { describe, expect, it } from "vitest";
import { fitCameraDistance, mountThreeScene, threeMeshArgs } from "../versawase3d.ts";
import { type ImageInput, visualize } from "../visualize.ts";
import { faceNormal } from "../visualizenormals.ts";

/** builds a w×h grayscale horizontal ramp (left black, right white, alpha full). */
function gradientImage(width: number, height: number): ImageInput {
  const data = new Uint8ClampedArray(width * height * 4);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const index = (y * width + x) * 4;
      const value = Math.round((255 * x) / (width - 1));
      data[index] = value;
      data[index + 1] = value;
      data[index + 2] = value;
      data[index + 3] = 255;
    }
  }
  return { width, height, data };
}

/** the shared fixture: an 8×6 ramp, step 2, depth 10 — 12 vertices, 12 triangles. */
const image = gradientImage(8, 6);
const result = visualize(image, { depth: 10, step: 2 });
const args = threeMeshArgs({ mesh: result.mesh, colors: result.colors, normals: result.normals });

describe("versawase3d mesh conversion", () => {
  it("mirrors the y axis and keeps x/z, one output float per input float", () => {
    expect(args.positions).toHaveLength(result.mesh.vertices.length);
    expect(args.counts.vertices).toBe(12);
    expect(args.counts.triangles).toBe(12);
    for (let offset = 0; offset < result.mesh.vertices.length; offset += 3) {
      expect(args.positions[offset]).toBe(result.mesh.vertices[offset]);
      expect(args.positions[offset + 1]).toBe(-result.mesh.vertices[offset + 1]);
      expect(args.positions[offset + 2]).toBe(result.mesh.vertices[offset + 2]);
    }
    // the bottom-right vertex (6, 4, ~8.57) answers (6, -4, ~8.57)
    const last = args.positions.length - 3;
    expect(args.positions[last]).toBe(6);
    expect(args.positions[last + 1]).toBe(-4);
    expect(Math.abs(args.positions[last + 2] - (6 / 7) * 10)).toBeLessThan(0.05);
  });

  it("reverses the winding so the front faces point toward the camera at +z", () => {
    expect(args.indices).toHaveLength(result.mesh.indices.length);
    for (let face = 0; face < result.mesh.indices.length; face += 3) {
      expect(args.indices[face]).toBe(result.mesh.indices[face]);
      expect(args.indices[face + 1]).toBe(result.mesh.indices[face + 2]);
      expect(args.indices[face + 2]).toBe(result.mesh.indices[face + 1]);
    }
    for (let face = 0; face < args.indices.length; face += 3) {
      const normal = faceNormal(args.positions, args.indices[face], args.indices[face + 1], args.indices[face + 2]);
      expect(normal).not.toBeNull();
      expect(normal?.[2]).toBeGreaterThan(0);
    }
  });

  it("passes vertex colors through untouched and mirrors the given normals", () => {
    expect(args.colors).not.toBeNull();
    expect(result.colors).not.toBeNull();
    if (!args.colors || !result.colors) return;
    expect(args.colors).toHaveLength(result.colors.length);
    expect([...args.colors.slice(0, 6)]).toEqual([...result.colors.slice(0, 6)]);
    expect(args.normals).not.toBeNull();
    expect(result.normals).not.toBeNull();
    if (!args.normals || !result.normals) return;
    for (let offset = 0; offset < result.normals.length; offset += 3) {
      expect(args.normals[offset]).toBe(result.normals[offset]);
      expect(args.normals[offset + 1]).toBe(-result.normals[offset + 1]);
      expect(args.normals[offset + 2]).toBe(result.normals[offset + 2]);
    }
  });

  it("answers null colors/normals when the pipeline ran without them", () => {
    const plain = visualize(image, { depth: 10, step: 2, colors: false, normals: false });
    const plainArgs = threeMeshArgs({ mesh: plain.mesh, colors: plain.colors, normals: plain.normals });
    expect(plainArgs.colors).toBeNull();
    expect(plainArgs.normals).toBeNull();
  });

  it("reports the axis-aligned center and size of the converted mesh", () => {
    expect(args.center[0]).toBe(3);
    expect(args.center[1]).toBe(-2);
    expect(args.size[0]).toBe(6);
    expect(args.size[1]).toBe(4);
    // the last sampled column sits at x=6 (byte 219 of the ramp), so z tops at (219/255)*10
    const topZ = (219 / 255) * 10;
    expect(args.size[2]).toBeCloseTo(topZ, 5);
    expect(args.center[2]).toBeCloseTo(topZ / 2, 5);
  });
});

describe("versawase3d camera framing", () => {
  it("frames the longest side with a positive, fov-monotone distance", () => {
    const size: [number, number, number] = [6, 4, 10];
    const tight = fitCameraDistance(size, 30);
    const wide = fitCameraDistance(size, 90);
    expect(tight).toBeGreaterThan(0);
    expect(wide).toBeGreaterThan(0);
    expect(tight).toBeGreaterThan(wide);
    expect(fitCameraDistance(size, 50, 2)).toBeCloseTo(2 * fitCameraDistance(size, 50, 1), 10);
  });

  it("falls back to the unit side for degenerate meshes", () => {
    const degenerate = fitCameraDistance([0, 0, 0], 50);
    expect(Number.isFinite(degenerate)).toBe(true);
    expect(degenerate).toBeGreaterThan(0);
  });
});

describe("versawase3d BufferGeometry construction (no render)", () => {
  it("builds a real three geometry with matching attribute counts and bounds", () => {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(args.positions, 3));
    if (args.normals) geometry.setAttribute("normal", new THREE.BufferAttribute(args.normals, 3));
    if (args.colors) geometry.setAttribute("color", new THREE.BufferAttribute(args.colors, 3));
    geometry.setIndex(new THREE.BufferAttribute(args.indices, 1));
    expect((geometry.getAttribute("position") as THREE.BufferAttribute).count).toBe(12);
    expect((geometry.getAttribute("normal") as THREE.BufferAttribute).count).toBe(12);
    expect((geometry.getAttribute("color") as THREE.BufferAttribute).count).toBe(12);
    expect(geometry.getIndex()?.count).toBe(36);
    geometry.computeBoundingBox();
    expect(geometry.boundingBox).not.toBeNull();
    expect(geometry.boundingBox?.min.x).toBe(0);
    expect(geometry.boundingBox?.max.x).toBe(6);
    expect(geometry.boundingBox?.min.y).toBe(-4);
    expect(geometry.boundingBox?.max.y).toBeCloseTo(0, 5);
  });
});

describe("versawase3d mount refusal", () => {
  it("refuses a canvas without a webgl context instead of pretending", () => {
    const canvas = { getContext: () => null } as unknown as HTMLCanvasElement;
    const mounted = mountThreeScene(canvas, {
      mesh: result.mesh,
      colors: result.colors,
      normals: result.normals,
    });
    expect(mounted).toEqual({ ok: false, error: "three-no-webgl" });
  });
});
