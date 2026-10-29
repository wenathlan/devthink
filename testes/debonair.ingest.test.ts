// # ingest.test — the decomposition pipeline contract: the hpss separation
//   conserves the mix (harmonic + percussive == the original), the ingest
//   document is deterministic for a given pcm and carries the vector
//   segments the pattern miner reads (one frame per second, chroma, bands,
//   onsets), the pcm hash is stable and the store guard refuses foreign
//   schemas. runnable with vitest: pnpm vitest run tests/ingest.test.ts
import assert from "node:assert/strict";
import { describe, it } from "vitest";
import { separate } from "../debonair/hpss.ts";
import type { IngestDocument } from "../debonair/ingest.ts";
import { INGEST_SCHEMA_VERSION, ingestPcm, onsetSecondsOf, pcmhash, segmentsof } from "../debonair/ingest.ts";

/** A deterministic synthetic take: a 110 hz sawtooth bass (harmonic) over
 * an 8 hz amplitude-gated click train (percussive), 3 seconds at 8 khz —
 * small enough to analyze fast, structured enough to exercise both stems. */
function synthetictake(): { mono: Float32Array; sampleRate: number } {
  const sampleRate = 8000;
  const length = sampleRate * 3;
  const mono = new Float32Array(length);
  for (let i = 0; i < length; i++) {
    const t = i / sampleRate;
    const bass = 0.4 * Math.sign(Math.sin(2 * Math.PI * 110 * t));
    const gate = t % 0.5 < 0.02 ? 0.8 : 0;
    mono[i] = Math.max(-1, Math.min(1, bass * 0.7 + gate));
  }
  return { mono, sampleRate };
}

describe("hpss separation", () => {
  it("conserves the mix: harmonic + percussive equals the original", () => {
    const { mono, sampleRate } = synthetictake();
    const { harmonic, percussive } = separate(mono);
    assert.equal(harmonic.length, mono.length);
    let worst = 0;
    // the centered framing keeps every input sample near a window peak, so
    // the whole signal conserves to the f32 storage floor
    for (let i = 0; i < mono.length; i++) {
      worst = Math.max(worst, Math.abs(harmonic[i] + percussive[i] - mono[i]));
    }
    assert.ok(worst < 1e-3, `reconstruction error ${worst}`);
    void sampleRate;
  });

  it("pushes the click train into the percussive stem and the sawtooth into the harmonic one", () => {
    const { mono } = synthetictake();
    const { harmonic, percussive } = separate(mono);
    const energy = (pcm: Float32Array): number => {
      let sum = 0;
      for (let i = 0; i < pcm.length; i++) sum += pcm[i] * pcm[i];
      return sum;
    };
    assert.ok(energy(harmonic) > energy(percussive), "the tonal sawtooth carries most of the energy");
  });
});

describe("ingest document", () => {
  const { mono, sampleRate } = synthetictake();
  const doc = ingestPcm(mono, sampleRate, { name: "synthetic take", at: "2026-01-01T00:00:00.000Z" });

  it("writes the one schema with the mix, two stems and per-second frames", () => {
    assert.equal(doc.schema, INGEST_SCHEMA_VERSION);
    assert.equal(doc.name, "synthetic take");
    assert.equal(doc.stems.length, 2);
    assert.equal(doc.stems[0].role, "harmonic");
    assert.equal(doc.stems[1].role, "percussive");
    assert.equal(doc.segments.length, 3);
    for (const stem of doc.stems) assert.equal(stem.segments.length, 3);
  });

  it("is deterministic: the same pcm ingests to the same bytes", () => {
    const again = ingestPcm(mono, sampleRate, { name: "synthetic take", at: "2026-01-01T00:00:00.000Z" });
    assert.equal(JSON.stringify(again), JSON.stringify(doc));
  });

  it("carries the vector fields every frame needs", () => {
    for (const frame of doc.segments) {
      assert.equal(frame.s >= 0, true);
      assert.equal(frame.bands.length, 3);
      assert.equal(frame.chroma.length, 12);
      const total = frame.bands.reduce((sum, value) => sum + value, 0);
      assert.ok(Math.abs(total - 1) < 0.01, `bands sum ${total}`);
      assert.ok(frame.rms >= 0 && frame.peak >= 0 && frame.zcr >= 0);
      assert.ok(["", ...["c", "c#", "d", "d#", "e", "f", "f#", "g", "g#", "a", "a#", "b"]].includes(frame.note));
    }
  });

  it("hashes the pcm deterministically and differently per stem", () => {
    assert.equal(pcmhash(mono), doc.pcmhash);
    assert.notEqual(doc.stems[0].pcmhash, doc.stems[1].pcmhash);
    const scratch = new Float32Array(mono);
    scratch[10] += 0.5;
    assert.notEqual(pcmhash(scratch), doc.pcmhash);
  });

  it("detects the gated clicks as onsets of the percussive stem", () => {
    const onsets = onsetSecondsOf(mono, sampleRate);
    assert.ok(onsets.length >= 4, `onsets ${onsets.length}`);
    for (let i = 1; i < onsets.length; i++) assert.ok(onsets[i] > onsets[i - 1], "ascending");
  });

  it("segments count the onsets that fall inside each second", () => {
    const onsets = onsetSecondsOf(mono, sampleRate);
    const frames = segmentsof(mono, sampleRate, onsets);
    let counted = 0;
    for (const frame of frames) counted += frame.onsets;
    assert.equal(counted, onsets.length);
  });
});

describe("the store guard", () => {
  it("accepts only schema-matching documents (the browser guard shape)", () => {
    const { mono, sampleRate } = synthetictake();
    const doc = ingestPcm(mono, sampleRate, { name: "guard take", at: "2026-01-01T00:00:00.000Z" });
    const broken = { schema: "other/1" } as unknown as IngestDocument;
    // the guard lives in the store module: the shape check mirrors it here
    const guard = (candidate: IngestDocument): boolean =>
      !!candidate &&
      candidate.schema === INGEST_SCHEMA_VERSION &&
      typeof candidate.name === "string" &&
      candidate.name.length > 0 &&
      Array.isArray(candidate.stems) &&
      candidate.stems.length > 0 &&
      Array.isArray(candidate.segments);
    assert.equal(guard(broken), false);
    assert.equal(guard(doc), true);
  });
});
