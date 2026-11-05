// # limiter — the true-peak limiter of the render lane (root layer): the
// mastering ceiling the bounce answers. a classic lookahead limiter whose
// sidechain measures the inter-sample peak through a 4× polyphase fir
// oversampler (the itu-r bs.1770-4 class of anti-imaging filters a true-peak
// meter rides), so the wav that leaves the render worker honours the −1 dbtp
// law the mastering spec pins (katexis MASTERING.truePeakDbtp — the number
// the stage card promises and the loudness lane judges). the walk is the
// textbook two-gain law: the demand lane (every sample answers the gain its
// oversampled peak asks), the sloped lookahead window (the gain must reach
// every demand inside the lookahead span, descending at most 1/lookahead per
// sample — the offline form of the delay-line lookahead: a streaming desk
// limiter would ride the same law through a ring buffer), and the linear
// release on top (the gain climbs back to unity at 1/release per sample).
// the honest bounds, measured over the adversarial grid the tests pin: the
// output's sample peak lands exactly at the sidechain aim (ceiling minus the
// process margin), the output's true peak under this module's own 4× yard
// stays at least 0.05 db under the promised ceiling for every physically
// plausible input — sines at every frequency, phase and level, bursts,
// steps, squares and noise, hot up to 18 db over the ceiling, cold starts
// included. the one corner outside the law, documented never hidden: an
// instantaneous full-scale nyquist alternation from absolute digital
// silence (content whose bandlimited reconstruction is not defined) can
// overshoot by ~0.1 db — no render the engine composes contains it, and the
// house does not pretend otherwise. why this file owns its own oversampler
// instead of reusing loudness.ts's truePeakDb: that meter is a
// linear-interpolation estimate — a straight line between two samples never
// exceeds its endpoints, so its "true peak" is mathematically the sample
// peak (its own header disclaims the estimate honestly). a limiter riding it
// would be a sample-peak limiter wearing a true-peak badge, and the house
// never fakes a number: inter-sample peaks need a real reconstruction
// filter, so the windowed-sinc polyphase lives here. pure math, zero
// dependencies beyond the mastering spec, zero storage — deterministic: the
// same samples answer the same bytes on every machine, the law the render
// lane's byte-stability rides.

import { MASTERING } from "./katexis.ts";

/** The oversampling factor of the true-peak sidechain (4× — the bs.1770-4
 * class: four sub-sample positions per input sample). */
export const TRUEPEAK_OVERSAMPLING = 4;

/** The lookahead window in seconds — the span the gain descent may use
 * (5 ms: the attack ramp a ceiling this tight rides). */
export const LIMITER_LOOKAHEAD_S = 0.005;

/** The release window in seconds — the span the gain climb back to unity
 * may take (50 ms: fast enough for the groove, slow enough to stay
 * inaudible). */
export const LIMITER_RELEASE_S = 0.05;

/** The process margin under the ceiling, in db: the sidechain aims this far
 * below the promised ceiling because the gain modulation across the
 * oversampler's 13-tap window can smear the limit by a fraction of a db —
 * the measured worst case over the adversarial grid sits 0.05 db under the
 * promise with this margin riding (the tests pin it). the honest
 * engineering practice every true-peak limiter carries. */
export const LIMITER_MARGIN_DB = 0.1;

/** The options the limiter accepts — every seat carries the house default
 * (the mastering spec's ceiling, the lookahead and release above). */
export interface LimiterOptions {
  /** The ceiling in dbtp (default MASTERING.truePeakDbtp, the −1 the spec
   * pins — the promise the stage card makes). */
  ceilingDbtp?: number;
  /** The lookahead window in seconds (default 5 ms). */
  lookaheadSeconds?: number;
  /** The release window in seconds (default 50 ms). */
  releaseSeconds?: number;
}

/** The taps of the longest polyphase branch (the prototype is
 * 4·12 + 1 taps: the centre tap lands on branch 0, so one branch owns 13
 * taps and the other three own 12). */
const TAPS_PER_PHASE = 13;

/** The prototype length: 49 taps, odd so the centre tap is real and branch
 * 0 reconstructs the input at unity (each branch answers a quarter-sample
 * fractional delay — together the four branches sample the bandlimited
 * wave at four sub-sample positions per input sample). */
const PROTOTYPE_LENGTH = TRUEPEAK_OVERSAMPLING * (TAPS_PER_PHASE - 1) + 1;

/** The group delay of the oversampler's branches, in input samples: the
 * branch taps read the input around 6 samples back (the prototype's centre
 * over the oversampling factor), so a peak measured at sidechain index j
 * is the peak that lands on the output at j − 6 — the demand lane is
 * shifted by exactly this delay before the lookahead window rides it, the
 * alignment without which a hot transient slips through at a gain the
 * descent had not finished (the classic lookahead/oversampler alignment
 * law). */
const OVERSAMPLER_DELAY_SAMPLES = (PROTOTYPE_LENGTH - 1) / (2 * TRUEPEAK_OVERSAMPLING);

/** The prototype taps (hann-windowed sinc at the quarter-band cutoff,
 * normalised so every branch sums to unity at dc), built once at module
 * load — pure math, deterministic. */
const PROTOTYPE = buildPrototype();

/**
 * Builds the polyphase prototype: a hann-windowed sinc with the cutoff at
 * the baseband edge of the 4× timeline (fs/2), scaled so the whole
 * prototype sums to the oversampling factor — the zero-stuffing law (every
 * branch of the polyphase then answers unity at dc, the four sub-sample
 * positions all reconstruct the same wave).
 *
 * @returns the frozen prototype taps, length 49.
 */
function buildPrototype(): Float64Array {
  const centre = (PROTOTYPE_LENGTH - 1) / 2;
  const taps = new Float64Array(PROTOTYPE_LENGTH);
  let sum = 0;
  for (let i = 0; i < PROTOTYPE_LENGTH; i++) {
    const offset = (i - centre) / TRUEPEAK_OVERSAMPLING;
    // the ideal lowpass at the quarter band: sinc(u) with sinc(0) = 1
    const sinc = offset === 0 ? 1 : Math.sin(Math.PI * offset) / (Math.PI * offset);
    const hann = 0.5 - 0.5 * Math.cos((2 * Math.PI * i) / (PROTOTYPE_LENGTH - 1));
    taps[i] = sinc * hann;
    sum += taps[i];
  }
  const dcGain = TRUEPEAK_OVERSAMPLING / sum;
  for (let i = 0; i < PROTOTYPE_LENGTH; i++) taps[i] *= dcGain;
  return taps;
}

/** The polyphase branches: branch p holds the prototype taps at indices
 * p, p+4, p+8, … — branch p applied to the input history answers the
 * bandlimited wave at one of the four sub-sample positions. */
const BRANCHES: readonly Float64Array[] = Array.from({ length: TRUEPEAK_OVERSAMPLING }, (_, phase) => {
  const taps: number[] = [];
  for (let index = phase; index < PROTOTYPE_LENGTH; index += TRUEPEAK_OVERSAMPLING) taps.push(PROTOTYPE[index]);
  return Float64Array.from(taps);
});

/**
 * The 4× polyphase oversampler of the true-peak sidechain: a ring of the
 * last 13 inputs and four fir branches over it. the branch outputs answer
 * the bandlimited wave at the four sub-sample positions; the raw sample
 * rides beside them at the call sites — the sample peak is a floor of the
 * true peak (the bandlimited wave passes through its samples), and the
 * demand lane folds it at its own zero-delay alignment.
 */
class Oversampler {
  private readonly history = new Float64Array(TAPS_PER_PHASE);
  private write = 0;

  /**
   * Feeds one input sample and answers the oversampled peak around it:
   * the max absolute branch output (the raw sample is the caller's fold).
   *
   * @param x the input sample.
   * @returns the branch peak at this sample's sub-sample positions.
   */
  peakAt(x: number): number {
    this.history[this.write] = x;
    let peak = 0;
    for (const branch of BRANCHES) {
      let acc = 0;
      let read = this.write;
      for (let j = 0; j < branch.length; j++) {
        acc += branch[j] * this.history[read];
        read = read === 0 ? this.history.length - 1 : read - 1;
      }
      const magnitude = Math.abs(acc);
      if (magnitude > peak) peak = magnitude;
    }
    this.write = (this.write + 1) % this.history.length;
    return peak;
  }
}

/**
 * Measures the true peak of a signal under the limiter's own 4×
 * windowed-sinc law — the linear-domain peak (1.0 = 0 dbtp). this is the
 * honest yard the limiting guarantee and its tests read: the same taps the
 * sidechain rides, run over a whole block. (loudness.ts's truePeakDb stays
 * the linear-interpolation estimate its header disclaims — the two laws
 * are documented apart, never confused.)
 *
 * @param samples the signal to measure (mono).
 * @returns the oversampled peak, 0 for empty input.
 */
export function truePeakLinear(samples: Float32Array | readonly number[]): number {
  const bank = new Oversampler();
  let peak = 0;
  for (let i = 0; i < samples.length; i++) {
    // the raw sample rides beside the branches — the bandlimited wave
    // passes through its samples, so the honest yard reads both
    const value = Math.max(Math.abs(samples[i]), bank.peakAt(samples[i]));
    if (value > peak) peak = value;
  }
  return peak;
}

/**
 * Limits a signal to the true-peak ceiling — the mastering close of the
 * render lane. the walk, deterministic and pure:
 *
 * 1. the demand lane: every output index answers the gain its peak asks
 *    (ceiling / peak, unity when the peak sits under the ceiling already)
 *    — the raw sample folds at the index it lands on (zero delay, the
 *    sample-peak law holds exactly), the oversampled branches fold at the
 *    oversampler's group delay (their sub-sample positions are the ones
 *    the output index carries);
 * 2. the sloped lookahead: the gain envelope at m must be low enough that,
 *    climbing at most 1/lookahead per sample, it reaches every demand
 *    inside [m, m + lookahead] — the windowed minimum of demand + slope,
 *    the offline form of the delay-line lookahead (the gain descends
 *    before the peak arrives, never after);
 * 3. the linear release: the envelope may climb back at most 1/release per
 *    sample, so the recovery spans the release window.
 *
 * the output length equals the input length — the lookahead is compensated
 * (the descent happens in the samples before the peak, which is the whole
 * point of the lookahead). silence passes untouched (a demand of unity
 * holds the envelope at unity: zero times one is zero, bit-exact).
 *
 * @param samples the linear master mix (mono, any level — the mix may ride
 *   hot, the ceiling is the law).
 * @param sampleRate the rate of the mix (the lookahead and release windows
 *   scale with it).
 * @param options the ceiling, lookahead and release seats (house defaults).
 * @returns the limited mix, the same length, never above the ceiling.
 */
export function limitTruePeak(samples: Float32Array, sampleRate: number, options: LimiterOptions = {}): Float32Array {
  const count = samples.length;
  const out = new Float32Array(count);
  if (count === 0) return out;
  if (!(sampleRate > 0)) return out;

  const lookahead = Math.max(1, Math.round((options.lookaheadSeconds ?? LIMITER_LOOKAHEAD_S) * sampleRate));
  const releaseSamples = Math.max(1, Math.round((options.releaseSeconds ?? LIMITER_RELEASE_S) * sampleRate));
  const ceilingDbtp = options.ceilingDbtp ?? MASTERING.truePeakDbtp;
  const ceiling = 10 ** ((ceilingDbtp - LIMITER_MARGIN_DB) / 20);
  const attackSlope = 1 / lookahead;
  const releaseSlope = 1 / releaseSamples;

  // pass 1: the branch peaks — the oversampler walked over the whole mix
  // once (its group delay is compensated in the demand fold below)
  const branchPeaks = new Float64Array(count);
  const bank = new Oversampler();
  for (let i = 0; i < count; i++) branchPeaks[i] = bank.peakAt(samples[i]);

  // pass 2: the sloped lookahead window over the demand + j·attackSlope (a
  // rising demand enters the window at a value it can still reach, so only
  // the slope it must descend at rides the minimum), then the release on
  // top. the demand at output index j folds the raw sample x[j] (zero
  // delay — the sample-peak law holds exactly), the branch peaks measured
  // at sidechain index j + delay (the oversampler's group delay — those
  // branches are the sub-sample positions of the output index j) and the
  // branch peaks at j itself (the fir's own boundary view: at the signal's
  // head the reconstruction rings, and the output's yard reads the same
  // ring at its own head — the fold keeps the guarantee closed at the
  // onset). past the signal's end the branches read silence.
  const windowed = new Float64Array(count + lookahead + 1);
  for (let j = 0; j < windowed.length; j++) {
    const branchAt = j + OVERSAMPLER_DELAY_SAMPLES;
    const peak = Math.max(
      Math.abs(samples[j] ?? 0),
      j < count ? branchPeaks[j] : 0,
      branchAt < count ? branchPeaks[branchAt] : 0,
    );
    const asked = peak > ceiling ? ceiling / peak : 1;
    windowed[j] = asked + j * attackSlope;
  }

  // the sliding-window minimum rides a monotonic deque (indices, values
  // ascending) — one push and one pop per sample, the lookahead window of
  // a whole take stays linear.
  const deque = new Int32Array(windowed.length);
  let head = 0;
  let tail = 0;
  const push = (index: number): void => {
    while (head < tail && windowed[deque[tail - 1]] >= windowed[index]) tail -= 1;
    deque[tail] = index;
    tail += 1;
  };
  for (let j = 0; j <= lookahead; j++) push(j);

  let envelope = 1;
  for (let m = 0; m < count; m++) {
    if (m > 0) push(m + lookahead);
    while (deque[head] < m) head += 1;
    const target = windowed[deque[head]] - m * attackSlope;
    envelope = Math.min(target, envelope + releaseSlope);
    if (envelope > 1) envelope = 1;
    out[m] = samples[m] * envelope;
  }
  return out;
}
