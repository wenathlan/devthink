// # limiter.test — the true-peak limiter of the render lane: the ceiling
// law (a full-scale sine lands under the −1 dBTP promise), the inter-sample
// law (a sine whose samples hide the crest still gets limited — the case
// that tells a true-peak limiter from a sample-peak fake), the quiet law
// (a signal under the ceiling passes bit-exact, silence stays silence),
// the attack law (the lookahead descends before the peak arrives, the gain
// never slews faster than the attack slope — no click), the release law
// (the gain climbs back over the release window) and determinism (the same
// samples answer the same bytes). the fixtures are synthetic sines with
// honest onsets (a 10 ms raised-cosine fade — the limiter's law holds for
// physically plausible content, and a cold start at full scale is not).
// runnable with vitest:
//   pnpm vitest run tests/limiter.test.ts
import assert from "node:assert/strict";
import { describe, it } from "vitest";
import { MASTERING } from "../katexis.ts";
import {
  LIMITER_LOOKAHEAD_S,
  LIMITER_MARGIN_DB,
  LIMITER_RELEASE_S,
  limitTruePeak,
  TRUEPEAK_OVERSAMPLING,
  truePeakLinear,
} from "../limiter.ts";

/** The house rate the render lane bounces at. */
const SR = 48000;

/** The promised ceiling, linear domain (−1 dBTP — the mastering spec). */
const CEILING = 10 ** (MASTERING.truePeakDbtp / 20);

/** The onset fade every fixture rides (10 ms raised cosine — the test
 * signals start the way real content does, never a step from digital
 * silence at full scale). */
const FADE = Math.round(0.01 * SR);

/** The float32 seat of the output — the gain recovered from out/in carries
 * one float32 rounding, the honest slack every gain assertion rides. */
const FLOAT_SEAT = 1e-6;

/** Builds a sine with an honest onset fade. */
function sine(freq: number, amp: number, seconds: number, phase = 0): Float32Array {
  const out = new Float32Array(Math.round(seconds * SR));
  for (let i = 0; i < out.length; i++) {
    const fade = i < FADE ? 0.5 - 0.5 * Math.cos((Math.PI * i) / FADE) : 1;
    out[i] = amp * Math.sin((2 * Math.PI * freq * i) / SR + phase) * fade;
  }
  return out;
}

/** The sample peak of a signal. */
function samplePeak(sig: Float32Array): number {
  let peak = 0;
  for (const v of sig) peak = Math.max(peak, Math.abs(v));
  return peak;
}

/** The gain the limiter applied, read where the input carries enough
 * signal for an honest division. */
function gainAt(out: Float32Array, input: Float32Array, index: number): number | null {
  return Math.abs(input[index]) > 0.15 ? out[index] / input[index] : null;
}

/** The measured gain over a sample span, nulls skipped. */
function gainsOver(out: Float32Array, input: Float32Array, from: number, to: number): number[] {
  const gains: number[] = [];
  for (let i = from; i < to; i++) {
    const g = gainAt(out, input, i);
    if (g !== null) gains.push(g);
  }
  return gains;
}

describe("limiter — the constants and the measurement yard", () => {
  it("pins the mastering seats the stage card promises", () => {
    assert.equal(MASTERING.truePeakDbtp, -1, "the promise is −1 dBTP");
    assert.equal(TRUEPEAK_OVERSAMPLING, 4, "the bs.1770-4 class: 4× oversampling");
    assert.equal(LIMITER_LOOKAHEAD_S, 0.005, "the 5 ms lookahead");
    assert.equal(LIMITER_RELEASE_S, 0.05, "the 50 ms release");
    assert.ok(LIMITER_MARGIN_DB > 0 && LIMITER_MARGIN_DB <= 0.2, "a small honest process margin");
  });

  it("measures the hidden crest a sample-peak meter cannot see", () => {
    // a sine at fs/6 with the phase that lands the samples between crests:
    // the sample peak is 0.95·sin(60°) ≈ 0.823 (under the ceiling), the
    // bandlimited crest is the full 0.95 — the inter-sample peak
    const hidden = sine(SR / 6, 0.95, 0.2, 0);
    assert.ok(samplePeak(hidden) < CEILING, "the precondition: the samples sit under the ceiling");
    const measured = truePeakLinear(hidden);
    assert.ok(
      Math.abs(measured - 0.95) < 0.02,
      `the yard reads the hidden crest (${measured.toFixed(4)} against 0.95)`,
    );
  });

  it("reads a plain low-frequency sine at its amplitude", () => {
    const plain = sine(997, 0.5, 0.2, 0);
    const measured = truePeakLinear(plain);
    assert.ok(Math.abs(measured - 0.5) < 0.005, `the yard reads 0.5 within 1% (${measured.toFixed(4)})`);
  });
});

describe("limiter — the ceiling law", () => {
  it("lands a full-scale sine under the −1 dBTP promise", () => {
    const loud = sine(997, 1.0, 0.5, 0.3);
    const out = limitTruePeak(loud, SR);
    const tp = truePeakLinear(out);
    assert.ok(
      tp <= CEILING + FLOAT_SEAT,
      `the true peak ${(20 * Math.log10(tp)).toFixed(4)} dBTP must sit at or under −1`,
    );
    assert.ok(samplePeak(out) <= CEILING + FLOAT_SEAT, "the sample peak sits under the promise too");
    // the limiter actually engaged — a 0 dBFS sine asks for the ceiling
    assert.ok(Math.min(...gainsOver(out, loud, FADE + 1, out.length)) < 0.999, "the gain dipped under unity");
  });

  it("limits the inter-sample peak a sample-peak law would wave through", () => {
    // the same hiding-phase fs/6 sine, scaled so the crest rides above the
    // ceiling while every sample sits under it: only a true-peak sidechain
    // can catch it — a sample-peak limiter wearing the badge passes it
    const hidden = sine(SR / 6, 0.95, 0.3, 0);
    assert.ok(samplePeak(hidden) < CEILING, "the samples sit under the ceiling");
    assert.ok(truePeakLinear(hidden) > CEILING, "the inter-sample crest rides above it");
    const out = limitTruePeak(hidden, SR);
    const tp = truePeakLinear(out);
    assert.ok(tp <= CEILING + FLOAT_SEAT, `the limited true peak ${(20 * Math.log10(tp)).toFixed(4)} dBTP`);
    assert.ok(
      Math.min(...gainsOver(out, hidden, FADE + 1, out.length)) < 0.99,
      "the sidechain engaged on the hidden crest",
    );
  });

  it("holds the promise on a hot burst out of a quiet probe", () => {
    // a 997 Hz probe at 0.2 with a 3.0 burst over the middle — the attack,
    // the deep reduction and the release in one walk
    const seconds = 1.2;
    const input = new Float32Array(Math.round(seconds * SR));
    for (let i = 0; i < input.length; i++) {
      const t = i / SR;
      const amp = t >= 0.5 && t < 1.0 ? 3.0 : 0.2;
      const fade = i < FADE ? 0.5 - 0.5 * Math.cos((Math.PI * i) / FADE) : 1;
      input[i] = amp * Math.sin((2 * Math.PI * 997 * i) / SR) * fade;
    }
    const out = limitTruePeak(input, SR);
    const tp = truePeakLinear(out);
    assert.ok(tp <= CEILING + FLOAT_SEAT, `the burst lands at ${(20 * Math.log10(tp)).toFixed(4)} dBTP`);
    assert.ok(samplePeak(out) <= CEILING + FLOAT_SEAT, "the burst's sample peak sits under the promise");
  });
});

describe("limiter — the quiet law", () => {
  it("passes a signal under the ceiling bit-exact", () => {
    const quiet = sine(440, 0.4, 0.2, 0.7);
    assert.ok(truePeakLinear(quiet) < CEILING, "the precondition: the signal sits under the ceiling");
    const out = limitTruePeak(quiet, SR);
    assert.deepEqual(Array.from(out), Array.from(quiet), "not one sample moved — unity gain, bit-exact");
  });

  it("passes silence as silence", () => {
    const silence = new Float32Array(SR);
    const out = limitTruePeak(silence, SR);
    assert.ok(
      out.every((v) => v === 0),
      "silence stays bit-exact silence",
    );
    assert.equal(limitTruePeak(new Float32Array(0), SR).length, 0, "the empty signal answers empty");
  });

  it("answers the same bytes twice (the render lane's determinism)", () => {
    const input = sine(300, 1.6, 0.3, 0.2);
    const first = limitTruePeak(input, SR);
    const second = limitTruePeak(input, SR);
    assert.deepEqual(Array.from(second), Array.from(first), "the same samples answer the same bytes");
  });
});

describe("limiter — the attack law (the lookahead)", () => {
  // the burst fixture: a 0.2 probe, a 3.0 burst at burstOnset, the probe
  // again after burstEnd — the gain read where the probe carries signal
  const seconds = 1.3;
  const burstOnset = 0.5;
  const burstEnd = 1.0;
  const lookahead = Math.round(LIMITER_LOOKAHEAD_S * SR);
  const input = new Float32Array(Math.round(seconds * SR));
  const out = limitTruePeak(
    (() => {
      for (let i = 0; i < input.length; i++) {
        const t = i / SR;
        const amp = t >= burstOnset && t < burstEnd ? 3.0 : 0.2;
        const fade = i < FADE ? 0.5 - 0.5 * Math.cos((Math.PI * i) / FADE) : 1;
        input[i] = amp * Math.sin((2 * Math.PI * 997 * i) / SR) * fade;
      }
      return input;
    })(),
    SR,
  );

  it("holds unity until the lookahead horizon opens", () => {
    // before burstOnset − lookahead the window sees only the probe's unity
    // demand — the gain is exactly one, bit-exact
    const before = gainsOver(out, input, FADE + 1, Math.round((burstOnset - LIMITER_LOOKAHEAD_S * 1.2) * SR));
    assert.ok(before.length > 10, "the probe carries measurable samples");
    assert.ok(Math.min(...before) === 1, "the gain is unity before the horizon (no preemptive dip)");
  });

  it("descends before the peak arrives (the lookahead law)", () => {
    const half = gainsOver(
      out,
      input,
      Math.round((burstOnset - LIMITER_LOOKAHEAD_S / 2) * SR),
      Math.round((burstOnset - LIMITER_LOOKAHEAD_S / 4) * SR),
    );
    assert.ok(half.length > 0, "the half-horizon window carries measurable samples");
    assert.ok(
      Math.min(...half) < 0.9,
      `the gain at half the lookahead before the burst (${Math.min(...half).toFixed(4)}) is already descending`,
    );
  });

  it("never slews the gain faster than the attack slope (no click)", () => {
    // the gain's per-sample change is bounded by the attack slope — the
    // descent is a ramp, never a step: the continuity every click-free
    // limit answer rides (the float32 seat of the division rides along)
    const bound = 1 / lookahead + FLOAT_SEAT;
    let worst = 0;
    let previous: number | null = null;
    for (let i = FADE + 1; i < out.length; i++) {
      const g = gainAt(out, input, i);
      if (g === null) {
        previous = null;
        continue;
      }
      if (previous !== null) worst = Math.max(worst, Math.abs(g - previous));
      previous = g;
    }
    assert.ok(
      worst <= bound,
      `the worst gain step ${worst.toFixed(6)} stays under the slope bound ${bound.toFixed(6)}`,
    );
  });
});

describe("limiter — the release law", () => {
  const seconds = 1.3;
  const burstEnd = 1.0;
  const input = new Float32Array(Math.round(seconds * SR));
  const out = limitTruePeak(
    (() => {
      for (let i = 0; i < input.length; i++) {
        const t = i / SR;
        const amp = t >= 0.5 && t < burstEnd ? 3.0 : 0.2;
        const fade = i < FADE ? 0.5 - 0.5 * Math.cos((Math.PI * i) / FADE) : 1;
        input[i] = amp * Math.sin((2 * Math.PI * 997 * i) / SR) * fade;
      }
      return input;
    })(),
    SR,
  );

  it("climbs back to unity over the release window", () => {
    const at = (seconds: number): number => {
      const from = Math.round(seconds * SR);
      const span = gainsOver(out, input, from, from + Math.round(0.002 * SR));
      assert.ok(span.length > 0, `the probe at ${seconds} s carries measurable samples`);
      return Math.min(...span);
    };
    const early = at(burstEnd + LIMITER_RELEASE_S * 0.2);
    const mid = at(burstEnd + LIMITER_RELEASE_S * 0.5);
    const late = at(burstEnd + LIMITER_RELEASE_S * 2);
    assert.ok(early < 0.9, `the gain right after the burst (${early.toFixed(4)}) still carries the reduction`);
    assert.ok(mid > early, `the release climbs (early ${early.toFixed(4)} → mid ${mid.toFixed(4)})`);
    assert.ok(late >= 0.99, `the gain recovers to unity within two release windows (${late.toFixed(4)})`);
  });

  it("never dips on the way up (the release is a climb)", () => {
    const from = Math.round(burstEnd * SR);
    const span = gainsOver(out, input, from, from + Math.round(LIMITER_RELEASE_S * 2 * SR));
    for (let i = 1; i < span.length; i++)
      assert.ok(
        span[i] >= span[i - 1] - FLOAT_SEAT,
        `the release dipped at sample ${i} (${span[i - 1].toFixed(6)} → ${span[i].toFixed(6)})`,
      );
  });
});
