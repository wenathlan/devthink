// # visualize.test — honest unit tests for the visualize library, runnable with the
// node built-in runner (no canvas, no dependencies, no install):
//   node --test tests/visualize.test.ts
// The fixture is a synthetic grayscale gradient buffer shaped like ImageData.
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { type ImageInput, VisualizeError, visualize } from "../visualize.ts";
import { materialSummary, vertexColors } from "../visualizematerial.ts";
import { gridDimensions } from "../visualizemesh.ts";
import { boundingBox, faceNormal, normalizedScale, vertexNormals } from "../visualizenormals.ts";

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

describe("visualize pipeline", () => {
  const image = gradientImage(8, 6);

  it("counts vertices and indices for a decimated grid", () => {
    const result = visualize(image, { depth: 10, step: 2, colors: false, normals: false });
    const { columns, rows } = gridDimensions(8, 6, 2);
    assert.equal(columns, 4);
    assert.equal(rows, 3);
    assert.equal(result.mesh.vertices.length, columns * rows * 3);
    assert.equal(result.mesh.vertices.length / 3, 12);
    assert.equal(result.mesh.indices.length, (columns - 1) * (rows - 1) * 6);
    assert.equal(result.mesh.indices.length / 3, 12);
    assert.equal(result.mesh.depth, 10);
  });

  it("extrudes heights by depth and keeps image-space x/y", () => {
    const result = visualize(image, { depth: 10, step: 2 });
    const lastVertex = (result.mesh.vertices.length / 3 - 1) * 3;
    // bottom-right vertex: x = 6, y = 4, z = luminance(6/7) * 10 — within 8-bit
    // quantization of the synthetic ramp (byte 219 instead of 218.57)
    assert.equal(result.mesh.vertices[lastVertex], 6);
    assert.equal(result.mesh.vertices[lastVertex + 1], 4);
    assert.ok(Math.abs(result.mesh.vertices[lastVertex + 2] - (6 / 7) * 10) < 0.05);
  });

  it("exports OBJ that starts with a vertex and carries faces", () => {
    const result = visualize(image, { depth: 10, step: 2 });
    const obj = result.toObj();
    assert.ok(obj.startsWith("v "), `expected OBJ to start with "v ", got: ${obj.slice(0, 12)}`);
    assert.ok(obj.includes("\nf "), "expected OBJ to contain face lines");
    const faceLines = obj.split("\n").filter((line) => line.startsWith("f "));
    assert.equal(faceLines.length, 12);
  });

  it("exports OBJ with vertex colors in the v lines when colors are on", () => {
    const result = visualize(image, { depth: 10, step: 2 });
    const first = result.toObj().split("\n")[0];
    assert.ok(first.startsWith("v "));
    assert.equal(first.split(" ").length, 7, `expected "v x y z r g b", got: ${first}`);
  });

  it("exports STL ASCII with facet normals", () => {
    const result = visualize(image, { depth: 10, step: 2 });
    const stl = result.toStl();
    assert.ok(stl.startsWith("solid cadria-visualize"));
    assert.ok(stl.includes("facet normal"));
    assert.ok(stl.includes("vertex"));
    assert.ok(stl.endsWith("endsolid cadria-visualize"));
    assert.equal(stl.split("facet normal").length - 1, 12);
  });

  it("exports binary STL with the documented byte layout", () => {
    const result = visualize(image, { depth: 10, step: 2, colors: false, normals: false });
    const bytes = result.toStlBinary();
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    assert.equal(bytes.byteLength, 84 + 12 * 50);
    assert.equal(view.getUint32(80, true), 12);
    const normalY = view.getFloat32(84 + 4, true);
    assert.ok(Math.abs(normalY) <= 1, "facet normal must be normalized");
  });

  it("computes unit-length vertex normals", () => {
    const result = visualize(image, { depth: 10, step: 2 });
    const normals = result.normals;
    assert.ok(normals, "expected normals by default");
    assert.equal(normals.length, result.mesh.vertices.length);
    for (let offset = 0; offset < normals.length; offset += 3) {
      const length = Math.hypot(normals[offset], normals[offset + 1], normals[offset + 2]);
      assert.ok(Math.abs(length - 1) < 1e-6, `normal ${offset / 3} is not unit: ${length}`);
    }
  });

  it("keeps vertex colors within [0, 1]", () => {
    const result = visualize(image, { depth: 10, step: 2 });
    const colors = result.colors;
    assert.ok(colors, "expected colors by default");
    assert.equal(colors.length, 12 * 3);
    for (const channel of colors) {
      assert.ok(channel >= 0 && channel <= 1, `color channel out of range: ${channel}`);
    }
  });

  it("minHeight carves holes into the low end of the gradient", () => {
    const full = visualize(image, { depth: 10, colors: false, normals: false });
    const cut = visualize(image, { depth: 10, minHeight: 0.5, colors: false, normals: false });
    assert.ok(cut.mesh.indices.length > 0, "high half of the gradient must survive");
    assert.ok(cut.mesh.indices.length < full.mesh.indices.length, "low half must be carved away");
  });

  it("blurRadius changes the heightmap", () => {
    const sharp = visualize(image, { depth: 10, colors: false, normals: false });
    const blurred = visualize(image, { depth: 10, blurRadius: 2, colors: false, normals: false });
    let differs = false;
    for (let i = 0; i < sharp.mesh.vertices.length; i++) {
      if (sharp.mesh.vertices[i] !== blurred.mesh.vertices[i]) {
        differs = true;
        break;
      }
    }
    assert.ok(differs, "blur must move vertices");
  });

  it("reports stats with counts and material summary", () => {
    const result = visualize(image, { depth: 10, step: 2 });
    const stats = result.stats();
    assert.equal(stats.vertices, 12);
    assert.equal(stats.triangles, 12);
    assert.equal(stats.columns, 4);
    assert.equal(stats.rows, 3);
    assert.equal(stats.hasColors, true);
    assert.equal(stats.hasNormals, true);
    assert.ok(stats.material);
    assert.equal(stats.material.minLuminance, 0);
    assert.ok(Math.abs(stats.material.maxLuminance - 1) < 0.01);
  });

  it("rejects buffers that do not match the dimensions", () => {
    assert.throws(() => visualize({ width: 2, height: 2, data: new Uint8ClampedArray(4) }), VisualizeError);
    assert.throws(() => visualize(image, { step: 0 }), VisualizeError);
  });

  it("survives a decimation step larger than the image", () => {
    const result = visualize(image, { depth: 10, step: 100, colors: false, normals: false });
    assert.equal(result.stats().vertices, 1);
    assert.equal(result.stats().triangles, 0);
  });
});

describe("visualize geometry and material helpers", () => {
  const image = gradientImage(8, 6);

  it("averages adjacent face normals into vertex normals", () => {
    const result = visualize(image, { depth: 10, step: 2, normals: false });
    const normals = vertexNormals(result.mesh);
    const flat = faceNormal(result.mesh.vertices, 0, 1, result.mesh.columns + 1);
    assert.ok(flat);
    // the first vertex only sees up-facing triangles of the same slope family
    assert.ok(Math.abs(normals[2] - flat[2]) < 0.2);
  });

  it("bounding box, center scale and color grid agree with the mesh", () => {
    const result = visualize(image, { depth: 10, step: 2 });
    const box = boundingBox(result.mesh.vertices);
    assert.equal(box.min[0], 0);
    assert.equal(box.max[0], 6);
    assert.ok(normalizedScale(result.mesh.vertices, 2) > 0);
    const colors = vertexColors(image, result.mesh.columns, result.mesh.rows, 2);
    assert.equal(colors.length, result.mesh.vertices.length);
    const summary = materialSummary(image);
    assert.ok(summary.average[0] > 0.4 && summary.average[0] < 0.6, "ramp average sits near mid gray");
  });
});
