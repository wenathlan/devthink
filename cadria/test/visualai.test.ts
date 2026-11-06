// # visualai.test — the honest generative seat of the versawaze engine: the
// deterministic procedural mesh variation (same seed, same proposals — the
// contract) and the keyframe auto-suggestion from payload stats (real peak
// detection, honest refusals on flat or broken series), runnable with
// vitest:
//   bun x vitest run test/visualai.test.ts
import assert from "node:assert/strict";
import { describe, it } from "vitest";
import {
  type MotionSample,
  type VariationRequest,
  DEFAULT_VARIATION_BUDGET,
  MeshGenError,
  applyvariation,
  motionconfidence,
  proposevariations,
  suggestkeyframes,
} from "../visualai.ts";
import { generateBox, generateSphere, validateMesh } from "../mesh.ts";

/** a quiet series with two loud, well-separated peaks (t = 4 and t = 8). */
function twoPeakSeries(): MotionSample[] {
  const samples: MotionSample[] = [];
  for (let index = 0; index <= 20; index += 1) {
    const time = index * 0.5;
    let motion = 0.1;
    if (index === 8) motion = 0.9;
    if (index === 16) motion = 0.8;
    samples.push({ time, motion });
  }
  return samples;
}

/** buffer equality that forgives the −0/0 sign flip the modifier math can
 * introduce on exact-zero components. */
function sameBuffer(a: Float32Array, b: Float32Array): boolean {
  if (a.length !== b.length) return false;
  for (let at = 0; at < a.length; at += 1) {
    if (a[at] !== b[at] && Math.abs(a[at] - b[at]) > 0) return false;
  }
  return true;
}

describe("visualai procedural mesh variation", () => {
  const request: VariationRequest = { base: generateSphere({ radius: 1, rings: 8, segments: 12 }), seed: 42, count: 4 };

  it("answers the same proposals for the same seed (the determinism contract)", () => {
    const first = proposevariations(request);
    const second = proposevariations(request);
    assert.equal(first.length, 4);
    assert.deepEqual(first.map((entry) => entry.parameters), second.map((entry) => entry.parameters));
    for (let at = 0; at < first.length; at += 1) {
      assert.deepEqual(new Float32Array(first[at].mesh.positions), new Float32Array(second[at].mesh.positions));
    }
  });

  it("answers different proposals for a different seed", () => {
    const seedA = proposevariations({ ...request, count: 3 });
    const seedB = proposevariations({ ...request, seed: 43, count: 3 });
    let differs = false;
    for (let at = 0; at < seedA.length; at += 1) {
      if (seedA[at].parameters.twist !== seedB[at].parameters.twist) differs = true;
    }
    assert.ok(differs, "the seed drives the proposals");
  });

  it("keeps every parameter inside the honest budget", () => {
    const budget = { maxTwist: 1.2, maxBelly: 0.3, maxNoise: 0.1, maxNoiseFrequency: 2 };
    for (const variation of proposevariations({ ...request, budget })) {
      assert.ok(Math.abs(variation.parameters.twist) <= 1.2 + 1e-9);
      assert.ok(Math.abs(variation.parameters.belly) <= 0.3 + 1e-9);
      assert.ok(variation.parameters.noiseAmplitude <= 0.1 + 1e-9);
      assert.ok(variation.parameters.noiseFrequency <= 2 + 1e-9);
      assert.ok(variation.parameters.noiseFrequency > 0);
    }
  });

  it("applies through the real modifier stack and audits clean", () => {
    for (const variation of proposevariations(request)) {
      assert.equal(variation.mesh.counts.vertices, request.base.counts.vertices);
      assert.equal(variation.mesh.counts.triangles, request.base.counts.triangles);
      assert.ok(validateMesh(variation.mesh).ok, `the variation keeps the audit: ${variation.id}`);
      assert.equal(variation.provenance, "deterministic-procedural");
      assert.ok(variation.label.includes("procedural"), "the label stays honest");
    }
  });

  it("answers the untouched geometry under a zero budget", () => {
    const zero = { maxTwist: 0, maxBelly: 0, maxNoise: 0, maxNoiseFrequency: 1 };
    const [variation] = proposevariations({ base: request.base, seed: 7, count: 1, budget: zero });
    assert.ok(sameBuffer(new Float32Array(variation.mesh.positions), new Float32Array(request.base.positions)));
  });

  it("moves the geometry under a real budget", () => {
    const [variation] = proposevariations({ base: request.base, seed: 9, count: 1 });
    let moved = 0;
    for (let at = 0; at < request.base.positions.length; at += 1) {
      if (Math.abs(variation.mesh.positions[at] - request.base.positions[at]) > 1e-6) moved += 1;
    }
    assert.ok(moved > 0, "the variation displaces real vertices");
  });

  it("refuses broken requests honestly", () => {
    assert.throws(() => proposevariations({ ...request, count: 0 }), MeshGenError);
    assert.throws(() => proposevariations({ ...request, count: 65 }), MeshGenError);
    assert.throws(() => proposevariations({ ...request, seed: 1.5 }), MeshGenError);
    assert.throws(
      () => applyvariation(request.base, { twist: 0, belly: 0, noiseAmplitude: -1, noiseFrequency: 1, noiseSeed: 0 }),
      MeshGenError,
    );
  });
});

describe("visualai keyframe auto-suggestion", () => {
  it("finds the honest motion peaks of a two-peak series", () => {
    const suggestions = suggestkeyframes(twoPeakSeries());
    assert.ok(suggestions);
    assert.ok(suggestions.length >= 2 && suggestions.length <= 5);
    const times = suggestions.map((entry) => entry.time);
    assert.ok(times.includes(4), `the loud peak at t=4 rides the answer: ${JSON.stringify(times)}`);
    assert.ok(times.includes(8), `the second peak at t=8 rides the answer: ${JSON.stringify(times)}`);
    for (const entry of suggestions) {
      assert.ok(entry.score >= 0 && entry.score <= 1);
      assert.ok(["motion-peak", "motion-step", "quiet-settle"].includes(entry.reason));
    }
  });

  it("honors the minimum separation", () => {
    const samples: MotionSample[] = [];
    for (let index = 0; index <= 20; index += 1) {
      let motion = 0.1;
      if (index === 8) motion = 0.95;
      if (index === 12) motion = 0.9;
      samples.push({ time: index * 0.5, motion });
    }
    // t=4 and t=6 sit 2 seconds apart: both answer at separation 1, only
    // the stronger answers at separation 3
    const near = suggestkeyframes(samples, { minSeparationSeconds: 1 });
    const far = suggestkeyframes(samples, { minSeparationSeconds: 3 });
    assert.ok(near && far);
    assert.ok(near.some((entry) => entry.time === 4) && near.some((entry) => entry.time === 6));
    assert.ok(far.some((entry) => entry.time === 4));
    assert.ok(!far.some((entry) => entry.time === 6), "the weaker peak yields to the separation rule");
  });

  it("caps the answer at the requested count", () => {
    const suggestions = suggestkeyframes(twoPeakSeries(), { count: 1 });
    assert.ok(suggestions);
    assert.equal(suggestions.length, 1);
    assert.equal(suggestions[0].time, 4, "the strongest instants answer first");
  });

  it("answers nothing for a flat series (a refusal, never a filler)", () => {
    const flat: MotionSample[] = Array.from({ length: 12 }, (_, index) => ({ time: index, motion: 0.5 }));
    assert.deepEqual(suggestkeyframes(flat), []);
  });

  it("refuses broken series honestly", () => {
    assert.equal(suggestkeyframes([]), null);
    assert.equal(suggestkeyframes([{ time: 0, motion: 1 }]), null);
    const unsorted: MotionSample[] = [
      { time: 2, motion: 1 },
      { time: 1, motion: 1 },
      { time: 0, motion: 1 },
    ];
    assert.equal(suggestkeyframes(unsorted), null);
    const nonFinite: MotionSample[] = [
      { time: 0, motion: Number.NaN },
      { time: 1, motion: 1 },
      { time: 2, motion: 1 },
    ];
    assert.equal(suggestkeyframes(nonFinite), null);
  });

  it("reports the honest confidence of a series", () => {
    assert.deepEqual(motionconfidence([]), { ok: false, peaks: 0, mean: 0, deviation: 0 });
    const flat = motionconfidence(Array.from({ length: 10 }, (_, index) => ({ time: index, motion: 0.3 })));
    assert.equal(flat.ok, false, "a flat series carries no honest signal");
    const peaked = motionconfidence(twoPeakSeries());
    assert.equal(peaked.ok, true);
    assert.ok(peaked.peaks >= 2);
    assert.ok(peaked.deviation > 0);
  });
});

describe("visualai base mesh honesty", () => {
  it("refuses to vary a mesh that fails the audit", () => {
    assert.throws(
      () =>
        applyvariation(
          { positions: new Float32Array(3), normals: new Float32Array(3), uvs: new Float32Array(2), indices: new Uint32Array(3), counts: { vertices: 1, triangles: 1 } },
          { twist: 0, belly: 0, noiseAmplitude: 0.1, noiseFrequency: 1, noiseSeed: 1 },
        ),
      MeshGenError,
    );
  });

  it("varies a generated box through the seat too", () => {
    const box = generateBox({ width: 1, height: 2, depth: 1 });
    const [variation] = proposevariations({ base: box, seed: 3, count: 1 });
    assert.ok(validateMesh(variation.mesh).ok);
  });
});
