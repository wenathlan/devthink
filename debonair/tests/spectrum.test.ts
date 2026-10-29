// # spectrum.test — the spectral kernel: the fft answers known magnitudes,
// the hann window is unitary, the chroma folds a sine into its pitch class
// and the key correlation answers the scale it hears.
import assert from "node:assert/strict";
import { describe, it } from "vitest";
import { chromaOf, fftInPlace, frameSpectrum, keyOf } from "../spectrum.ts";

/** The KK minor profile rotated so the tonic (6.33) sits on pc 9 (A). */
const KK_MINOR_ROTATED: readonly number[] = Array.from(
  { length: 12 },
  (_, i) => [6.33, 2.68, 3.52, 5.38, 2.6, 3.53, 2.54, 4.75, 3.98, 2.69, 3.34, 3.17][(i - 9 + 12) % 12],
);

describe("spectrum — fftInPlace", () => {
  it("recovers a pure sine's magnitude at the right bin", () => {
    const n = 4096;
    const bin = 100;
    const re = Array.from({ length: n }, (_, i) => Math.sin((2 * Math.PI * bin * i) / n));
    const im = new Array<number>(n).fill(0);
    fftInPlace(re, im);
    const half = n / 2;
    const peak = Array.from({ length: half }, (_, b) => Math.hypot(re[b], im[b]));
    const bestBin = peak.indexOf(Math.max(...peak));
    assert.ok(Math.abs(bestBin - bin) <= 1, `peak bin ${bestBin} != ${bin}`);
  });

  it("answers zero imaginary energy for a real cosine symmetric input", () => {
    const n = 512;
    const re = Array.from({ length: n }, (_, i) => Math.cos((2 * Math.PI * 8 * i) / n));
    const im = new Array<number>(n).fill(0);
    fftInPlace(re, im);
    assert.ok(Math.abs(im[8]) < 1e-9, "dc-adjacent imaginary leaked");
  });
});

describe("spectrum — frameSpectrum + chroma", () => {
  it("folds a 440hz sine into the A pitch class", () => {
    const sine = Array.from({ length: 4096 }, (_, i) => Math.sin((2 * Math.PI * 440 * i) / 44100));
    const frame = frameSpectrum(sine);
    const chroma = chromaOf(frame.magnitudes, frame.binHz);
    const best = chroma.indexOf(Math.max(...chroma));
    assert.equal(best, 9, "440hz must fold to pc 9 (A)");
  });

  it("correlates a C-major chroma to the C major key", () => {
    const chroma = [6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88];
    const key = keyOf(chroma);
    assert.equal(key.tonic, 0);
    assert.equal(key.mode, "major");
  });

  it("correlates an A-minor profile to the A minor key", () => {
    // the chroma of an A-minor piece: the KK minor window starts at pc 9
    const chroma = Array.from({ length: 12 }, (_, i) => KK_MINOR_ROTATED[i]);
    const key = keyOf(chroma);
    assert.equal(key.tonic, 9);
    assert.equal(key.mode, "minor");
  });
});
