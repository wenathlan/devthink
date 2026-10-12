// # loudness — the loudness metering and normalisation of debonair (root
// layer): K-weighting, momentary/short-term/integrated loudness with the
// two-stage gate, loudness range and true peak, plus the gain that lands a
// programme on a target. The clean-room pattern is absorbed from filmcraft's
// audio-dsp/loudness.rs (ITU-R BS.1770-4 / EBU R128 metering: the two
// K-weight stages derived from their analog prototypes through the bilinear
// transform, 400 ms gating blocks with 75 % overlap, exact energy sums, LRA
// percentiles) — re-derived here in pure TypeScript. The power domain owns
// its own math (10·log10 of mean square): mixergraph's dB helpers are
// amplitude-domain and are not reused. Non-goals: no certified ITU true-peak
// oversampler (the 4× estimate here is linear — katexis owns DSP quality),
// no playback, no decode. Pure and multi-mode — browser and node alike.

/** The machine readable failure codes of the loudness logic. */
export type LoudnessErrorCode = "bad-samplerate" | "bad-params" | "empty-signal";

/** The typed result every fallible loudness call answers with (errors by return). */
export type LoudnessResult<T> = { ok: true; value: T } | { ok: false; code: LoudnessErrorCode; message: string };

/** One second-order filter section (Direct Form I coefficients). */
export interface KCoeffs {
  b0: number;
  b1: number;
  b2: number;
  a1: number;
  a2: number;
}

/** The carried filter memory of one biquad (for streaming blocks). */
export interface BiquadState {
  x1: number;
  x2: number;
  y1: number;
  y2: number;
}

/** The summary a full measurement answers. */
export interface LoudnessReport {
  /** The integrated loudness in LUFS (−Infinity for silence). */
  integrated: number;
  /** The loudness range in LU (EBU Tech 3342). */
  lra: number;
  /** The approximate true peak in dBTP. */
  truepeakdb: number;
  /** The sample peak in dBFS. */
  samplepeakdb: number;
}

/** The gate floor of the integrated loudness, in LUFS. */
export const ABSOLUTEGATE = -70;

/** The relative gate of the integrated loudness, in LU under the ungated level. */
export const RELATIVEGATE = 10;

/** Fails a fallible call with one machine readable code. */
function fail<T>(code: LoudnessErrorCode, message: string): LoudnessResult<T> {
  return { ok: false, code, message };
}

/** The loudness of a channel-weighted mean square, in LUFS. */
export function energyToLufs(meansquare: number): number {
  return meansquare <= 0 ? Number.NEGATIVE_INFINITY : -0.691 + 10 * Math.log10(meansquare);
}

/** The mean square a LUFS value stands for (the inverse of energyToLufs). */
export function lufsToEnergy(lufs: number): number {
  return Number.isFinite(lufs) ? 10 ** ((lufs + 0.691) / 10) : 0;
}

/** BS.1770 stage 1: the high-shelf "head" pre-filter for a sample rate. */
export function kShelfCoefficients(samplerate: number): KCoeffs {
  const f0 = 1681.974450955533;
  const q = 0.7071752369554196;
  const gaindb = 3.999843853973347;
  const k = Math.tan((Math.PI * f0) / samplerate);
  const vh = 10 ** (gaindb / 20);
  const vb = vh ** 0.4996667741545416;
  const a0 = 1 + k / q + k * k;
  return {
    b0: (vh + (vb * k) / q + k * k) / a0,
    b1: (2 * (k * k - vh)) / a0,
    b2: (vh - (vb * k) / q + k * k) / a0,
    a1: (2 * (k * k - 1)) / a0,
    a2: (1 - k / q + k * k) / a0,
  };
}

/** BS.1770 stage 2: the RLB high-pass for a sample rate. */
export function kHighpassCoefficients(samplerate: number): KCoeffs {
  const f0 = 38.13547087602444;
  const q = 0.5003270373238773;
  const k = Math.tan((Math.PI * f0) / samplerate);
  const a0 = 1 + k / q + k * k;
  return { b0: 1 / a0, b1: -2 / a0, b2: 1 / a0, a1: (2 * (k * k - 1)) / a0, a2: (1 - k / q + k * k) / a0 };
}

/** Filters one block with a biquad, carrying the state (Direct Form I). */
export function biquadFilter(
  coeffs: KCoeffs,
  samples: readonly number[],
  state: BiquadState = { x1: 0, x2: 0, y1: 0, y2: 0 },
): { filtered: number[]; state: BiquadState } {
  const filtered = new Array<number>(samples.length);
  let { x1, x2, y1, y2 } = state;
  for (let i = 0; i < samples.length; i++) {
    const x0 = samples[i];
    const y0 = coeffs.b0 * x0 + coeffs.b1 * x1 + coeffs.b2 * x2 - coeffs.a1 * y1 - coeffs.a2 * y2;
    filtered[i] = y0;
    x2 = x1;
    x1 = x0;
    y2 = y1;
    y1 = y0;
  }
  return { filtered, state: { x1, x2, y1, y2 } };
}

/** The BS.1770 channel weights (L R C LFE Ls Rs Lb Rb — the LFE counts 0). */
export function channelWeights(channels: number): number[] {
  const table = [1, 1, 1, 0, 1.41, 1.41, 1.41, 1.41];
  return Array.from({ length: Math.max(1, channels) }, (_, i) => table[i] ?? 1);
}

/** K-weights one channel (both stages in series). */
export function kWeightChannel(samples: readonly number[], samplerate: number): number[] {
  const shelf = biquadFilter(kShelfCoefficients(samplerate), samples);
  return biquadFilter(kHighpassCoefficients(samplerate), shelf.filtered).filtered;
}

/**
 * The channel-weighted mean square of a whole programme (the K-filtered sum
 * of squares over the channel weights, normalised by the sample count).
 */
export function weightedMeanSquare(channels: readonly number[][], samplerate: number): number {
  if (channels.length === 0) return 0;
  const weights = channelWeights(channels.length);
  let acc = 0;
  for (let c = 0; c < channels.length; c++) {
    const weighted = kWeightChannel(channels[c], samplerate);
    let sum = 0;
    for (const v of weighted) sum += v * v;
    acc += weights[c] * (sum / weighted.length);
  }
  return acc / channels.length;
}

/** The gating blocks: 400 ms windows of weighted mean square, every 100 ms. */
export function gatingBlocks(channels: readonly number[][], samplerate: number): number[] {
  if (channels.length === 0 || !(samplerate > 0)) return [];
  const len = Math.min(...channels.map((c) => c.length));
  const block = Math.round(0.4 * samplerate);
  const hop = Math.round(0.1 * samplerate);
  if (len < block) return [];
  const weights = channelWeights(channels.length);
  const prefix = channels.map((channel) => {
    const weighted = kWeightChannel(channel, samplerate);
    const pre = new Array<number>(weighted.length + 1).fill(0);
    for (let i = 0; i < weighted.length; i++) pre[i + 1] = pre[i] + weighted[i] * weighted[i];
    return pre;
  });
  const blocks: number[] = [];
  for (let start = 0; start + block <= len; start += hop) {
    let acc = 0;
    for (let c = 0; c < channels.length; c++) acc += weights[c] * (prefix[c][start + block] - prefix[c][start]);
    blocks.push(acc / (channels.length * block));
  }
  return blocks;
}

/**
 * The integrated loudness of a block series: the two-stage gate keeps blocks
 * above the absolute floor, then above 10 LU under the interim level, and
 * answers the energy mean of the survivors (−Infinity for silence).
 */
export function integratedLoudness(blocks: readonly number[]): number {
  const above = blocks.filter((b) => energyToLufs(b) > ABSOLUTEGATE);
  if (above.length === 0) return Number.NEGATIVE_INFINITY;
  const interim = energyToLufs(above.reduce((a, b) => a + b, 0) / above.length);
  const survivors = above.filter((b) => energyToLufs(b) > interim - RELATIVEGATE);
  if (survivors.length === 0) return interim;
  return energyToLufs(survivors.reduce((a, b) => a + b, 0) / survivors.length);
}

/**
 * A loudness series over fixed windows (momentary = 0.4 s, short-term = 3 s)
 * answered in LUFS per 100 ms hop.
 */
export function loudnessSeries(channels: readonly number[][], samplerate: number, windowseconds: number): number[] {
  if (channels.length === 0 || !(samplerate > 0)) return [];
  const len = Math.min(...channels.map((c) => c.length));
  const window = Math.round(windowseconds * samplerate);
  const hop = Math.round(0.1 * samplerate);
  if (len < window) return [];
  const weights = channelWeights(channels.length);
  const prefix = channels.map((channel) => {
    const weighted = kWeightChannel(channel, samplerate);
    const pre = new Array<number>(weighted.length + 1).fill(0);
    for (let i = 0; i < weighted.length; i++) pre[i + 1] = pre[i] + weighted[i] * weighted[i];
    return pre;
  });
  const series: number[] = [];
  for (let start = 0; start + window <= len; start += hop) {
    let acc = 0;
    for (let c = 0; c < channels.length; c++) acc += weights[c] * (prefix[c][start + window] - prefix[c][start]);
    series.push(energyToLufs(acc / (channels.length * window)));
  }
  return series;
}

/** The p-quantile of a sorted series with linear interpolation (EBU 3342 style). */
export function percentile(sorted: readonly number[], p: number): number {
  if (sorted.length === 0) return Number.NaN;
  const position = (p / 100) * (sorted.length - 1);
  const low = Math.floor(position);
  const high = Math.ceil(position);
  return low === high ? sorted[low] : sorted[low] + (sorted[high] - sorted[low]) * (position - low);
}

/**
 * The loudness range of a short-term series: the series is gated at the
 * absolute floor and 20 LU under its mean, then LRA is the 95th minus the
 * 10th percentile (EBU Tech 3342).
 */
export function loudnessRange(shortterm: readonly number[]): number {
  const above = shortterm.filter((l) => Number.isFinite(l) && l > ABSOLUTEGATE);
  if (above.length === 0) return 0;
  const mean = above.reduce((a, b) => a + b, 0) / above.length;
  const survivors = above.filter((l) => l > mean - 20).sort((a, b) => a - b);
  if (survivors.length === 0) return 0;
  return percentile(survivors, 95) - percentile(survivors, 10);
}

/** The sample peak in dBFS (−Infinity for silence). */
export function samplePeakDb(samples: readonly number[]): number {
  let peak = 0;
  for (const v of samples) peak = Math.max(peak, Math.abs(v));
  return peak === 0 ? Number.NEGATIVE_INFINITY : 20 * Math.log10(peak);
}

/**
 * The approximate true peak in dBTP: the signal is read at 4× the sample
 * rate through linear interpolation and the peak is referred to full scale.
 * This is an estimate — a certified polyphase oversampler stays in katexis.
 */
export function truePeakDb(samples: readonly number[]): number {
  let peak = 0;
  for (let i = 0; i < samples.length - 1; i++) {
    for (let k = 0; k < 4; k++) peak = Math.max(peak, Math.abs(samples[i] + ((samples[i + 1] - samples[i]) * k) / 4));
  }
  if (samples.length > 0) peak = Math.max(peak, Math.abs(samples[samples.length - 1]));
  return peak === 0 ? Number.NEGATIVE_INFINITY : 20 * Math.log10(peak);
}

/**
 * The gain that lands a programme on a target: the loudness difference,
 * with positive boosts clamped (EBU R128 never boosts more than +23 LU) and
 * the true-peak ceiling respected when a dBTP limit is given.
 */
export function gainToTarget(
  lufs: number,
  targetlufs: number,
  maxboostdb = 23,
  truepeakceiling = -1,
  currenttruepeakdb = Number.NEGATIVE_INFINITY,
): number {
  const gain = targetlufs - lufs;
  const boosted = Math.min(gain, Number.isFinite(lufs) ? maxboostdb : 0);
  const headroom = truepeakceiling - currenttruepeakdb;
  return Number.isFinite(headroom) ? Math.min(boosted, headroom) : boosted;
}

/** Applies a gain to a block of samples (the render step of normalisation). */
export function applyGain(samples: readonly number[], gaindb: number): number[] {
  const linear = 10 ** (gaindb / 20);
  return samples.map((v) => v * linear);
}

/**
 * The full offline measurement of a programme: integrated loudness, LRA,
 * true and sample peak. Codes: `bad-samplerate`, `empty-signal`.
 */
export function analyzeLoudness(channels: readonly number[][], samplerate: number): LoudnessResult<LoudnessReport> {
  if (!(samplerate > 0)) return fail("bad-samplerate", "the sample rate must be positive");
  const len = Math.min(...channels.map((c) => c.length));
  if (channels.length === 0 || len === 0) return fail("empty-signal", "the programme has no samples");
  const mono = channels[0];
  return {
    ok: true,
    value: {
      integrated: integratedLoudness(gatingBlocks(channels, samplerate)),
      lra: loudnessRange(loudnessSeries(channels, samplerate, 3)),
      truepeakdb: truePeakDb(mono),
      samplepeakdb: samplePeakDb(mono),
    },
  };
}
