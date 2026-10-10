// # audiorhythm — the onset half of the cadria rhythm layer (wave 1, module
// a3): spectral-flux onset detection over the shared stft of audiofft.ts,
// adaptive-threshold peak picking, and the RhythmStats facade that fuses
// the beat-geometry answers of audiorhythmbeat.ts into one stats object the
// descriptor layer consumes. The dependency arrow stays one-way: this file
// imports audiofft.ts and audiorhythmbeat.ts, never the reverse.
// Deterministic, finite-guarded answers; contract violations throw
// RhythmError from the beat leaf.

import { stft } from "./audiofft.ts";
import {
  RhythmError,
  canonicalTempo,
  downbeatGrid,
  envelopeSampleAt,
  estimateBpm,
  finite,
  swingRatio,
  type BpmEstimate,
  type CanonicalTempo,
  type DownbeatGrid,
  type SwingRead,
} from "./audiorhythmbeat.ts";

/** the onset envelope answer: flux values per frame plus the frame period. */
export type OnsetEnvelope = { envelope: Float32Array; frameMs: number };

/** onset-envelope options: stft geometry plus the smoothing horizon. */
export type OnsetEnvelopeOptions = { size?: number; hop?: number; smoothMs?: number };

/** clamps into [lo, hi]; non-finite reads lo. */
function clamp(value: number, lo: number, hi: number): number {
  const v = finite(value, lo);
  return v < lo ? lo : v > hi ? hi : v;
}

/**
 * onsetEnvelope — half-wave rectified spectral flux across consecutive stft
 * magnitude frames, lightened by a centered moving average of `smoothMs`
 * (default 40 ms — short enough to keep the spikes, long enough to de-flicker
 * the noise floor). Frame 0 reads 0 (no previous frame). Throws RhythmError
 * for a non-finite/non-positive sampleRate and for sample slices shorter
 * than one analysis window.
 */
export function onsetEnvelope(samples: Float32Array, sampleRate: number, options: OnsetEnvelopeOptions = {}): OnsetEnvelope {
  if (!Number.isFinite(sampleRate) || sampleRate <= 0) throw new RhythmError(`audiorhythm: sampleRate must be finite > 0, got ${sampleRate}`);
  const size = options.size ?? 1024;
  const hop = options.hop ?? size / 2;
  const smoothMs = options.smoothMs ?? 40;
  if (!Number.isFinite(hop) || hop < 1 || hop > size) throw new RhythmError(`audiorhythm: hop must be finite within [1, size], got ${hop}`);
  const frames = stft(samples, { size, hop });
  const flux = new Float32Array(frames.length);
  for (let f = 1; f < frames.length; f++) {
    const current = frames[f];
    const previous = frames[f - 1];
    let sum = 0;
    for (let b = 0; b < current.length; b++) {
      const rise = current[b] - previous[b];
      if (rise > 0) sum += rise;
    }
    flux[f] = finite(sum);
  }
  const frameMs = (hop / sampleRate) * 1000;
  const width = Math.max(1, Math.round(smoothMs / frameMs));
  if (width <= 1) return { envelope: flux, frameMs };
  const smoothed = new Float32Array(flux.length);
  let running = 0;
  let count = 0;
  let head = 0;
  for (let i = 0; i < flux.length; i++) {
    running += flux[i];
    count++;
    if (count > width) {
      running -= flux[head];
      head++;
      count--;
    }
    smoothed[i] = finite(running / count);
  }
  return { envelope: smoothed, frameMs };
}

/** peak-picking options: threshold factor and the minimum onset spacing. */
export type OnsetPeakOptions = { k?: number; minGapMs?: number };

/**
 * onsetPeaks — adaptive peak picking: a frame qualifies when it exceeds its
 * neighborhood mean plus `k` standard deviations (default 1.5), holds a
 * local maximum over ±2 frames, and sits at least `minGapMs` (default 60)
 * past the last accepted onset. Answers onset times in ms, ascending.
 */
export function onsetPeaks(envelope: Float32Array, frameMs: number, options: OnsetPeakOptions = {}): number[] {
  if (!Number.isFinite(frameMs) || frameMs <= 0) throw new RhythmError(`audiorhythm: frameMs must be finite > 0, got ${frameMs}`);
  const k = options.k ?? 1.5;
  const minGapMs = options.minGapMs ?? 60;
  let mean = 0;
  for (const v of envelope) mean += v;
  mean = envelope.length > 0 ? mean / envelope.length : 0;
  let variance = 0;
  for (const v of envelope) {
    const d = v - mean;
    variance += d * d;
  }
  const std = envelope.length > 1 ? Math.sqrt(variance / envelope.length) : 0;
  const threshold = mean + k * std;
  const onsets: number[] = [];
  let lastAcceptedMs = -Infinity;
  for (let i = 0; i < envelope.length; i++) {
    const v = envelope[i];
    if (!(v > threshold)) continue;
    if (i > 0 && envelope[i - 1] > v) continue;
    if (i + 1 < envelope.length && envelope[i + 1] > v) continue;
    const tMs = i * frameMs;
    if (tMs - lastAcceptedMs < minGapMs) continue;
    onsets.push(finite(tMs));
    lastAcceptedMs = tMs;
  }
  return onsets;
}

/** the rhythm facade answer the descriptor layer reads. */
export type RhythmStats = {
  bpm: number; // canonical bpm inside 70-160; 0 when no pulse was found
  multiplier: 0.5 | 1 | 2; // the fold that produced the canonical bpm
  confidence: number; // 0-1 pulse trust of the raw estimate
  onsetsPerSecond: number; // accepted peaks per second of envelope span
  regularityIndex: number; // 0-1: 1 = metronome, 0 = scatter
  swing: SwingRead; // beat-pair split read
  downbeatPeriodBeats: number; // beats per bar of the aligned grid
  rawBpm: number; // the estimate before the 70-160 fold
};

/** stats options: bpm bounds and the bar period handed to the grid. */
export type RhythmStatsOptions = { minBpm?: number; maxBpm?: number; periodBeats?: number; minGapMs?: number };

/**
 * rhythmStats — the full rhythm read of one sample slice: envelope, peaks,
 * tempo (estimate + canonical fold), swing, downbeat alignment and the
 * regularity index (1 - normalized interval spread over the inter-onset
 * gaps, metronomes near 1, scatter near 0). A pulse-less slice answers the
 * zero band (bpm 0, confidence 0, regularity 0) without throwing.
 */
export function rhythmStats(samples: Float32Array, sampleRate: number, options: RhythmStatsOptions = {}): RhythmStats {
  const { envelope, frameMs } = onsetEnvelope(samples, sampleRate);
  const onsets = onsetPeaks(envelope, frameMs, { minGapMs: options.minGapMs ?? 60 });
  const estimate: BpmEstimate = estimateBpm(envelope, frameMs, { minBpm: options.minBpm ?? 60, maxBpm: options.maxBpm ?? 200 });
  if (estimate.bpm <= 0 || onsets.length < 3) {
    return { bpm: 0, multiplier: 1, confidence: 0, onsetsPerSecond: 0, regularityIndex: 0, swing: { ratio: 0.5, swung: false }, downbeatPeriodBeats: options.periodBeats ?? 4, rawBpm: 0 };
  }
  const canonical: CanonicalTempo = canonicalTempo(estimate.bpm);
  const gaps: number[] = [];
  for (let i = 1; i < onsets.length; i++) gaps.push(onsets[i] - onsets[i - 1]);
  const gapMean = gaps.reduce((acc, v) => acc + v, 0) / gaps.length;
  const gapSpread = Math.sqrt(gaps.reduce((acc, v) => acc + (v - gapMean) ** 2, 0) / gaps.length);
  const regularityIndex = clamp(1 - gapSpread / Math.max(gapMean, 1e-9), 0, 1);
  // the beat is the stronger onset: the swing anchor reads onset strengths
  // (envelope sampled at each onset) so loud onbeats outrank quiet offbeats.
  const weights = onsets.map((t) => envelopeSampleAt(envelope, frameMs, t));
  const swing: SwingRead = swingRatio(onsets, canonical.bpm, weights);
  const durationMs = envelope.length * frameMs;
  const grid: DownbeatGrid = downbeatGrid(canonical.bpm, durationMs, envelope, frameMs, { periodBeats: options.periodBeats ?? 4 });
  return {
    bpm: canonical.bpm,
    multiplier: canonical.multiplier,
    confidence: clamp(estimate.confidence, 0, 1),
    onsetsPerSecond: finite(onsets.length / Math.max(durationMs / 1000, 1e-9)),
    regularityIndex,
    swing,
    downbeatPeriodBeats: grid.periodBeats,
    rawBpm: finite(estimate.bpm),
  };
}
