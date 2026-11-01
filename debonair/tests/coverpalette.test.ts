// # coverpalette — the bridge battery of the ownership law: the cadria
// palette engine answers the audio app through the published library
// specifier ("@wenathlan/cadria/synthpalette"), resolved to the monorepo
// source by the vitest alias the family bridge pattern carries. The seats
// pinned here: the derivation is deterministic (the same pcm answers the
// same palette bit-for-bit), the engine answers real content (a tonal take
// and a noise take fold different palettes), the refusal lane answers the
// cadria engine's own fallback rung (never a throw), and the plate accents
// carry the anchor-first law the cover plate renders.

import assert from "node:assert/strict";
import { FALLBACK_PALETTE } from "@wenathlan/cadria/synthpalette";
import { describe, it } from "vitest";
import type { DescriptorStats } from "../audioattributes.ts";
import { coverPaletteFromPcm, coverPaletteFromStats, plateAccents } from "../coverpalette.ts";

/** A deterministic synthetic tonal take: a 110 hz sawtooth bass under an
 * amplitude-gated click train, 3 seconds at 8 khz — the same shape the
 * ingest battery rides. */
function tonaltake(): { mono: Float32Array; sampleRate: number } {
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

/** A deterministic noise take: an 8 hz amplitude-gated LCG stream, 3
 * seconds at 8 khz — noiselike content the flatness and noisiness dials
 * carry to a different palette than the tonal take. */
function noisetake(): { mono: Float32Array; sampleRate: number } {
  const sampleRate = 8000;
  const length = sampleRate * 3;
  const mono = new Float32Array(length);
  let state = 0x2f6e2b1;
  for (let i = 0; i < length; i++) {
    state = (Math.imul(state, 48271) >>> 0) % 2147483647;
    const noise = (state / 2147483647) * 2 - 1;
    const t = i / sampleRate;
    const gate = t % 0.25 < 0.02 ? 0.9 : 0.25;
    mono[i] = Math.max(-1, Math.min(1, noise * gate));
  }
  return { mono, sampleRate };
}

describe("the cadria palette bridge", () => {
  it("derives a deterministic palette from the same pcm", () => {
    const { mono, sampleRate } = tonaltake();
    const first = coverPaletteFromPcm(mono, sampleRate);
    const second = coverPaletteFromPcm(mono, sampleRate);
    assert.equal(first.anchor, second.anchor);
    assert.deepEqual(first.accents, second.accents);
    assert.deepEqual(first.support, second.support);
    assert.equal(first.ink, second.ink);
    assert.equal(first.surface, second.surface);
  });

  it("answers real content: the tonal take and the noise take fold different palettes", () => {
    const tonal = coverPaletteFromPcm(tonaltake().mono, 8000);
    const noise = coverPaletteFromPcm(noisetake().mono, 8000);
    assert.notEqual(tonal.anchor, noise.anchor, "the anchor hue follows the tonal content");
    assert.notDeepEqual(tonal.accents, noise.accents, "the accent family follows the energy profile");
  });

  it("answers the cadria fallback rung when the pipeline refuses the slice", () => {
    const refused = coverPaletteFromPcm(new Float32Array(0), 8000);
    assert.deepEqual(refused, FALLBACK_PALETTE);
  });

  it("carries the anchor-first accent law the plate renders", () => {
    const palette = coverPaletteFromPcm(tonaltake().mono, 8000);
    const accents = plateAccents(palette);
    assert.equal(accents[0], palette.anchor, "the anchor leads the plate accents");
    assert.ok(accents.length >= 3 && accents.length <= 5, "the anchor plus two to four engine accents");
    for (const hex of accents) assert.match(hex, /^#[0-9a-f]{6}$/, "every accent renders a hex");
  });

  it("derives the stats lane through the same engine (deterministic, total on damage)", () => {
    const { mono, sampleRate } = tonaltake();
    const report = coverPaletteFromPcm(mono, sampleRate);
    // the stats lane rides the same engine: an empty stats bundle coerces
    // through the fusion layer's total law (never a throw) and answers the
    // same deterministic palette on every call — the fallback rung belongs
    // to the refusal lane above, the coercion law belongs here
    const damagedfirst = coverPaletteFromStats({} as DescriptorStats);
    const damagedsecond = coverPaletteFromStats({} as DescriptorStats);
    assert.equal(damagedfirst.anchor, damagedsecond.anchor);
    assert.deepEqual(damagedfirst.accents, damagedsecond.accents);
    // while the pcm-lane palette this take answered is a real palette
    assert.notDeepEqual(report, damagedfirst);
    assert.match(report.anchor, /^#[0-9a-f]{6}$/);
  });
});
