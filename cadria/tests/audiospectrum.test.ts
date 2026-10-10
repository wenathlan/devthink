// # audiospectrum.test — honest unit tests for the spectral layer, runnable
// with the node built-in runner (no audio files, no dependencies, no install):
//   node --test tests/audiospectrum.test.ts
// Fixtures are synthetic: pure sines on exact bins, DC, seeded noise and a
// two-tone onset signal — every test is deterministic.
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  FftError,
  blackman,
  fft,
  fftMagnitudes,
  hamming,
  hann,
  stft,
  stftFrameCount,
  type WindowName,
} from "../audiofft.ts";
import {
  BAND_EDGES_HZ,
  BAND_NAMES,
  bandEnergies,
  hertzToMel,
  melToHertz,
  melbands,
  spectralCentroid,
  spectralFlatness,
  spectralFlux,
  spectralRolloff,
  spectrogramImage,
  summarizeSpectrum,
} from "../audiospectrum.ts";

const SAMPLE_RATE = 8000;
const SIZE = 1024;
const STEP = SAMPLE_RATE / SIZE; // 7.8125 Hz per bin

/** one frame of a pure sine completing `cycles` periods inside the frame. */
function sineFrame(cycles: number, size = SIZE): Float32Array {
  const out = new Float32Array(size);
  for (let i = 0; i < size; i++) out[i] = Math.sin((2 * Math.PI * cycles * i) / size);
  return out;
}

/** deterministic seeded noise (LCG), values in [-1, 1). */
function noiseFrame(size: number, seed: number): Float32Array {
  let state = seed >>> 0;
  const out = new Float32Array(size);
  for (let i = 0; i < size; i++) {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    out[i] = (state / 4294967296) * 2 - 1;
  }
  return out;
}

/** bin index of the largest magnitude. */
function peakBin(magnitudes: Float32Array): number {
  let best = 0;
  for (let k = 1; k < magnitudes.length; k++) if (magnitudes[k] > magnitudes[best]) best = k;
  return best;
}

/** sum of a typed array. */
function total(values: ArrayLike<number>): number {
  let acc = 0;
  for (let i = 0; i < values.length; i++) acc += values[i];
  return acc;
}

describe("audiofft", () => {
  it("peaks a pure sine at the expected bin", () => {
    const magnitudes = fftMagnitudes(sineFrame(8));
    assert.equal(magnitudes.length, SIZE / 2 + 1);
    const peak = peakBin(magnitudes);
    assert.ok(Math.abs(peak - 8) <= 1, `peak at bin ${peak}, expected 8 ± 1`);
  });

  it("keeps DC energy at bin 0", () => {
    const magnitudes = fftMagnitudes(new Float32Array(256).fill(1));
    assert.ok(Math.abs(magnitudes[0] - 256) < 1e-3, `DC bin ${magnitudes[0]}`);
    assert.equal(peakBin(magnitudes), 0);
    assert.ok(total(magnitudes) - magnitudes[0] < 1e-2, "no energy outside bin 0");
  });

  it("conserves energy (Parseval)", () => {
    const samples = noiseFrame(SIZE, 7);
    const re = Float32Array.from(samples);
    const im = new Float32Array(SIZE);
    fft(re, im);
    let timeEnergy = 0;
    for (let i = 0; i < SIZE; i++) timeEnergy += samples[i] * samples[i];
    let spectralEnergy = 0;
    for (let k = 0; k < SIZE; k++) spectralEnergy += re[k] * re[k] + im[k] * im[k];
    const ratio = spectralEnergy / (SIZE * timeEnergy);
    assert.ok(Math.abs(ratio - 1) < 1e-4, `Parseval ratio ${ratio}`);
  });

  it("sums periodic windows to their documented totals", () => {
    assert.ok(Math.abs(total(hann(SIZE)) - SIZE / 2) < 1e-6, `hann sums to ${total(hann(SIZE))}`);
    assert.ok(Math.abs(total(hamming(SIZE)) - 0.54 * SIZE) < 1e-6);
    assert.ok(Math.abs(total(blackman(SIZE)) - 0.42 * SIZE) < 1e-6);
    assert.equal(hann(SIZE)[0], 0);
  });

  it("counts stft frames as ceil((n − size) / hop) + 1", () => {
    assert.equal(stftFrameCount(5000, 1024, 300), Math.ceil((5000 - 1024) / 300) + 1);
    assert.equal(stft(new Float32Array(5000), { size: 1024, hop: 300 }).length, 15);
    assert.equal(stftFrameCount(200, 1024, 512), 0);
    assert.equal(stft(new Float32Array(200), { size: 1024 }).length, 0);
  });

  it("returns one-sided magnitude frames, deterministically", () => {
    const samples = noiseFrame(4096, 21);
    const first = stft(samples, { size: 512, hop: 256, window: "hamming" });
    const again = stft(samples, { size: 512, hop: 256, window: "hamming" });
    assert.equal(first.length, stftFrameCount(4096, 512, 256));
    for (let f = 0; f < first.length; f++) {
      assert.equal(first[f].length, 512 / 2 + 1);
      assert.deepEqual(first[f], again[f]);
      for (const value of first[f]) assert.ok(Number.isFinite(value));
    }
  });

  it("rejects invalid sizes and unknown windows", () => {
    assert.throws(() => fft(new Float32Array(100), new Float32Array(100)), FftError);
    assert.throws(() => fftMagnitudes(new Float32Array(32768)), FftError);
    assert.throws(() => stft(new Float32Array(4096), { window: "kaiser" as WindowName }), FftError);
  });
});

describe("audiospectrum", () => {
  it("round-trips mel and hertz", () => {
    assert.equal(melToHertz(0), 0);
    assert.ok(Math.abs(hertzToMel(1000) - 1000) < 1, `1000 Hz is ${hertzToMel(1000)} mel`);
    assert.ok(Math.abs(melToHertz(hertzToMel(440)) - 440) < 1e-9);
  });

  it("shapes the mel filterbank to the requested band count", () => {
    const frame = fftMagnitudes(sineFrame(8));
    assert.equal(melbands(frame, SAMPLE_RATE).length, 40);
    assert.equal(melbands(frame, SAMPLE_RATE, 24).length, 24);
    assert.equal(melbands(frame, SAMPLE_RATE, 1).length, 1);
  });

  it("reads a flat spectrum as equal mel bands", () => {
    const bands = melbands(new Float32Array(SIZE / 2 + 1).fill(1), SAMPLE_RATE, 16);
    for (let b = 0; b < bands.length; b++) {
      assert.ok(Math.abs(bands[b] - 1) < 1e-6, `flat band ${b} reads ${bands[b]}, expected 1`);
    }
  });

  it("keeps single-bin energy local to its mel triangles", () => {
    const magnitudes = new Float32Array(SIZE / 2 + 1);
    magnitudes[100] = 1; // 100 · 7.8125 Hz = 781.25 Hz
    const bands = melbands(magnitudes, SAMPLE_RATE, 40);
    let nonzero = 0;
    let best = 0;
    for (let b = 0; b < bands.length; b++) {
      if (bands[b] > 0) nonzero++;
      if (bands[b] > bands[best]) best = b;
    }
    assert.ok(nonzero >= 1 && nonzero <= 2, `${nonzero} bands lit by a single bin`);
    const center = melToHertz((hertzToMel(SAMPLE_RATE / 2) * (best + 1)) / 41);
    assert.ok(Math.abs(center - 781.25) < 100, `peak band center ${center} Hz, tone at 781.25 Hz`);
  });

  it("ranks centroids of low and high sines", () => {
    const low = spectralCentroid(fftMagnitudes(sineFrame(8)), SAMPLE_RATE);
    const high = spectralCentroid(fftMagnitudes(sineFrame(64)), SAMPLE_RATE);
    assert.ok(low < high, `low centroid ${low} should sit under high ${high}`);
    assert.ok(Math.abs(low - 8 * STEP) < STEP, `low centroid ${low}, expected near ${8 * STEP}`);
    assert.ok(Math.abs(high - 64 * STEP) < STEP, `high centroid ${high}, expected near ${64 * STEP}`);
  });

  it("scores noise flatter than a sine", () => {
    const tone = spectralFlatness(fftMagnitudes(sineFrame(8)));
    const noise = spectralFlatness(fftMagnitudes(noiseFrame(SIZE, 3)));
    assert.ok(tone >= 0 && tone <= 1 && noise >= 0 && noise <= 1);
    assert.ok(noise > tone, `noise flatness ${noise} should beat tone ${tone}`);
  });

  it("reports zero flux for silence and steady frames", () => {
    const silence = new Float32Array(513);
    assert.equal(spectralFlux(silence, silence), 0);
    const frame = fftMagnitudes(sineFrame(8));
    assert.equal(spectralFlux(frame, frame), 0);
  });

  it("peaks flux at the note onsets of a two-tone fixture", () => {
    const size = 256;
    const toneA = sineFrame(4, size); // 125 Hz — bin 4
    const toneB = sineFrame(24, size); // 750 Hz — bin 24
    const both = new Float32Array(size);
    for (let i = 0; i < size; i++) both[i] = toneA[i] + toneB[i];
    const signal = new Float32Array(size * 5); // two silent frames, then the notes
    for (let i = 0; i < size; i++) {
      signal[size * 2 + i] = toneA[i];
      signal[size * 3 + i] = toneA[i];
      signal[size * 4 + i] = both[i];
    }
    const frames = stft(signal, { size, hop: size, window: "hann" });
    assert.equal(frames.length, 5);
    const fluxes = frames.map((frame, f) => (f === 0 ? 0 : spectralFlux(frame, frames[f - 1])));
    assert.equal(fluxes[1], 0, "silence → silence is flat");
    assert.equal(fluxes[3], 0, "steady tone A is flat");
    assert.ok(fluxes[2] > 0 && fluxes[4] > 0, "both note onsets light up");
    const peak = fluxes.indexOf(Math.max(...fluxes));
    assert.ok(peak === 2 || peak === 4, `flux peak at frame ${peak}, expected an onset frame`);
  });

  it("normalizes bandBalance to sum 1", () => {
    const frames = [fftMagnitudes(sineFrame(8)), fftMagnitudes(noiseFrame(SIZE, 11))];
    assert.equal(bandEnergies(frames[0], SAMPLE_RATE).length, BAND_NAMES.length);
    assert.equal(BAND_EDGES_HZ.length, BAND_NAMES.length + 1);
    const summary = summarizeSpectrum(frames, SAMPLE_RATE);
    assert.equal(summary.bandBalance.length, BAND_NAMES.length);
    const balance = total(summary.bandBalance);
    assert.ok(Math.abs(balance - 1) < 1e-9, `bandBalance sums to ${balance}`);
    for (const share of summary.bandBalance) assert.ok(share >= 0 && share <= 1);
    assert.ok(summary.brightnessIndex >= 0 && summary.brightnessIndex <= 1);
    assert.ok(summary.centroidMean > 0 && summary.rolloffMean > 0);
  });

  it("decimates a spectrogram to width×height grayscale", () => {
    const signal = new Float32Array(4096);
    for (let i = 0; i < signal.length; i++) {
      signal[i] = i < 2048 ? Math.sin((2 * Math.PI * 8 * i) / 512) : Math.sin((2 * Math.PI * 40 * i) / 512);
    }
    const frames = stft(signal, { size: 512, hop: 256 });
    const image = spectrogramImage(frames, 12, 9);
    assert.equal(image.length, 12 * 9);
    let min = 255;
    let max = 0;
    for (const value of image) {
      assert.ok(Number.isInteger(value) && value >= 0 && value <= 255, `gray value ${value} out of range`);
      if (value < min) min = value;
      if (value > max) max = value;
    }
    assert.equal(min, 0, "the quietest cell maps to 0");
    assert.equal(max, 255, "the loudest cell maps to 255");
    assert.deepEqual(image, spectrogramImage(frames, 12, 9));
  });

  it("maps digital silence to a black spectrogram", () => {
    const image = spectrogramImage([new Float32Array(257), new Float32Array(257)], 4, 4);
    assert.equal(image.length, 16);
    for (const value of image) assert.equal(value, 0);
  });

  it("rises rolloff with tone frequency", () => {
    const low = spectralRolloff(fftMagnitudes(sineFrame(8)), SAMPLE_RATE);
    const high = spectralRolloff(fftMagnitudes(sineFrame(64)), SAMPLE_RATE);
    assert.ok(low < high, `rolloff ${low} should sit under ${high}`);
    assert.ok(Math.abs(low - 8 * STEP) < STEP, `low rolloff ${low}, expected near ${8 * STEP}`);
    assert.ok(Math.abs(high - 64 * STEP) < STEP, `high rolloff ${high}, expected near ${64 * STEP}`);
  });
});
