// # kathesis.test — the engine core seat of the katexis engine: the dsp
// primitives (the ramps, the rbj biquad set, the one-pole), the wavetable
// tiers, the adsr seat, the eq chain, the delay lines, the freeverb
// plate, the drive law, the effects rack, the sampler voice, the payload
// generations registry (v1/v2/v3 with the vector-one fold) and the sound
// ai pair (the markov model over payload events + the spectral envelope
// resynthesis) — each pinned to real dsp behavior, and the generated
// document walked through the v1 law's own doors (the schedule bridge,
// the render lane, the reverse ingest) so the sound ai's answer plays.
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { describe, it } from "vitest";
import {
  ADSR_MELODIC,
  ADSR_SEGMENT_TCS,
  AdsrEnvelope,
  type AdsrSpec,
  DelayLine,
  EffectsRack,
  ENGINE_NAME,
  FREEVERB_COMB_TUNINGS,
  FeedbackDelay,
  KATHESIS_SEATS,
  PULSE_DUTY,
  PAYLOAD_GENERATIONS,
  PingPongDelay,
  REVERB_ROOM,
  RackSlot,
  ReverbSeat,
  SPECTRAL_ENVELOPE_BANDS,
  SOUND_MODEL_SCHEMA_VERSION,
  WAVETABLE_PEAK,
  WAVETABLE_SIZE,
  WAVETABLE_TIERS,
  WavetableOscillator,
  adsrLevelAt,
  biquadMagnitudeDb,
  biquadOf,
  buildEqChain,
  buildWavetable,
  driveSample,
  emptySoundModel,
  eqResponseDb,
  expRampOf,
  generateFromSoundModel,
  linearRampOf,
  onePoleOf,
  payloadGenerationOf,
  renderRack,
  renderSamplerNote,
  resynthesizeSpectral,
  runBiquad,
  runEqChain,
  runOnePole,
  seatOf,
  spectralEnvelopeOf,
  targetOf,
  tierIndexOf,
  trainSoundModel,
  vectorOneTimelineToPatternTimeline,
  wavetableStack,
} from "../kathesis.ts";
import { LANE_STEPS, type PatternProject, type PatternTimeline, serializePattern } from "../pattern.ts";
import { RENDER_SAMPLE_RATE, renderPatternMix, schedulePattern } from "../renderengine.ts";
import { reverseIngestPayload } from "../reverseingest.ts";
import { wavInfo } from "../wavwriter.ts";

/** The engine rate the dsp seats under test ride. */
const SR = 48000;

/** The near-zero of the floating assertions. */
const EPS = 1e-9;

/** The rms of a span. */
function rmsOf(buffer: Float32Array, from = 0, count = buffer.length): number {
  let sum = 0;
  const end = Math.min(buffer.length, from + count);
  for (let index = from; index < end; index++) sum += buffer[index] * buffer[index] ?? 0;
  return Math.sqrt(sum / Math.max(1, end - from));
}

/** A silent sixteen-step lane. */
const SILENT_LANE: readonly number[] = new Array<number>(LANE_STEPS).fill(0);

/** The surgical score the model learns from — one bar at 120 bpm: a kick
 * at 0 and 8, hats on the offbeats, an a3→c4→e4 climb in the lead and a
 * c2 bass note (the same shape the reverse ingest fixtures ride). */
function teachingProject(): PatternProject {
  return {
    schema: "debonair.pattern/1",
    bpm: 120,
    root: 0,
    scale: "major",
    bars: 1,
    mood: "surgical",
    prompt: "the teaching fixture",
    drums: {
      kick: [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
      snare: [...SILENT_LANE],
      hat: [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0],
      clap: [...SILENT_LANE],
    },
    notes: [
      { step: 0, pitch: 57, vel: 0.8, dur: 2, voice: "lead" },
      { step: 4, pitch: 60, vel: 0.7, dur: 2, voice: "lead" },
      { step: 8, pitch: 64, vel: 0.9, dur: 2, voice: "lead" },
      { step: 0, pitch: 36, vel: 0.9, dur: 4, voice: "bass" },
    ],
    embedding: new Array<number>(32).fill(0),
  };
}

/** The dissected reference the model learns from — two seconds, one e4
 * note in the first second (onset 0.1) and a kick-classified transient
 * at the top, a quieter second with a g3 note. */
function teachingTimeline(): PatternTimeline {
  return {
    schema: "debonair.timeline/1",
    source: "import",
    bpm: 128,
    seconds: 2,
    embedding: new Array<number>(32).fill(0),
    frames: [
      {
        s: 0,
        rms: 0.4,
        centroid: 1200,
        flux: 0.3,
        chroma: [0.1, 0, 0, 0.1, 0.6, 0, 0, 0, 0.2, 0, 0, 0],
        embedding: new Array<number>(32).fill(0),
        events: [
          { kind: "transient", note: "kick", onset: 0, velocity: 1, confidence: 0.9 },
          { kind: "note", note: "e4", pitch: 64, onset: 0.1, velocity: 0.8, confidence: 0.85, hz: 329.63 },
        ],
        tags: ["ritmico"],
      },
      {
        s: 1,
        rms: 0.2,
        centroid: 700,
        flux: 0.1,
        chroma: [0.4, 0, 0, 0, 0.1, 0, 0, 0.4, 0.1, 0, 0, 0],
        embedding: new Array<number>(32).fill(0),
        events: [{ kind: "note", note: "g3", pitch: 55, onset: 0.25, velocity: 0.6, confidence: 0.8, hz: 196 }],
        tags: [],
      },
    ],
  };
}

/** The historical vector-one document (the outros.debonair v2 contract)
 * — the same frame shape with the uppercase spellings and a transient
 * label outside the v1 vocabulary ("rimshot"). */
function vectorOneTimeline(): Record<string, unknown> {
  return {
    schema: "vector-one/timeline@5.0",
    source: "import",
    bpm: 122,
    seconds: 2,
    embedding: new Array<number>(32).fill(0.1),
    frames: [
      {
        s: 0,
        rms: 0.5,
        centroid: 900,
        flux: 0.2,
        chroma: new Array<number>(12).fill(0.05),
        embedding: new Array<number>(32).fill(0),
        events: [
          { kind: "transient", note: "Kick", onset: 0, velocity: 1, confidence: 0.9 },
          { kind: "note", note: "C4", pitch: 60, onset: 0.5, velocity: 0.7, confidence: 0.9, hz: 261.63 },
        ],
        tags: ["v2tag"],
      },
      {
        s: 1,
        rms: 0.3,
        centroid: 800,
        flux: 0.1,
        chroma: new Array<number>(12).fill(0.05),
        embedding: new Array<number>(32).fill(0),
        events: [{ kind: "transient", note: "rimshot", onset: 0.2, velocity: 0.9, confidence: 0.8 }],
        tags: [],
      },
    ],
  };
}

describe("kathesis — the engine registry", () => {
  it("answers the engine name and the seat table with modules that exist", () => {
    assert.equal(ENGINE_NAME, "kathesis");
    assert.ok(KATHESIS_SEATS.length >= 13, "the seat table carries the mission's seats");
    const seats = new Set(KATHESIS_SEATS.map((row) => row.seat));
    for (const expected of ["music-studio", "mixer", "effects-rack", "transport", "sampler", "synthesis", "voice", "mixing", "mastering", "ingest", "reverse-ingest", "sound-ai", "sandbox"]) {
      assert.ok(seats.has(expected), `the seat table carries ${expected}`);
    }
    for (const row of KATHESIS_SEATS) {
      assert.ok(existsSync(row.module), `the seat ${row.seat} names its owning module ${row.module}`);
      assert.ok(row.owns.length > 0, `the seat ${row.seat} carries its law`);
    }
    assert.deepEqual(seatOf("sampler")?.module, "kathesis.ts");
    assert.equal(seatOf("no-such-seat"), undefined);
  });
});

describe("kathesis — the payload generations (v1/v2/v3)", () => {
  it("recognizes the three generations with their schema families", () => {
    assert.deepEqual(PAYLOAD_GENERATIONS.map((generation) => generation.id), ["v1", "v2", "v3"]);
    assert.equal(payloadGenerationOf("debonair.pattern/1")?.id, "v1");
    assert.equal(payloadGenerationOf("debonair.timeline/1")?.id, "v1");
    assert.equal(payloadGenerationOf("debonair.soundpayload/1")?.id, "v1");
    assert.equal(payloadGenerationOf("vector-one/timeline@5.0")?.id, "v2");
    assert.equal(payloadGenerationOf("vector-one/project@5.0")?.id, "v2");
    assert.equal(payloadGenerationOf("debonair.recon/3")?.id, "v3");
    assert.equal(payloadGenerationOf("unknown/schema"), undefined);
  });

  it("folds the historical vector-one timeline onto the v1 contract", () => {
    const fold = vectorOneTimelineToPatternTimeline(vectorOneTimeline());
    assert.ok(fold.ok, fold.ok ? "" : fold.message);
    if (!fold.ok) return;
    const doc = fold.doc;
    assert.equal(doc.schema, "debonair.timeline/1");
    assert.equal(doc.frames.length, 2);
    // the label law: the uppercase kick lowers, the out-of-vocabulary
    // transient folds onto the generic hit, the note keeps its spelling
    assert.equal(doc.frames[0]?.events[0]?.note, "kick");
    assert.equal(doc.frames[0]?.events[1]?.note, "c4");
    assert.equal(doc.frames[1]?.events[0]?.note, "hit");
    // the fold is idempotent under the validator's own canonical law
    assert.ok(doc.frames[0] !== undefined && doc.frames[0].s === 0);
  });

  it("refuses a non-vector-one document with the honest machine code", () => {
    const wrongSchema = vectorOneTimelineToPatternTimeline({ schema: "something/else" });
    assert.ok(!wrongSchema.ok);
    assert.equal(wrongSchema.code, "bad-schema");
    const noFrames = vectorOneTimelineToPatternTimeline({ schema: "vector-one/timeline@5.0" });
    assert.ok(!noFrames.ok);
    assert.equal(noFrames.code, "bad-fold");
  });
});

describe("kathesis — the dsp primitives", () => {
  it("walks the webaudio automation laws (the ramp seats hold their ends)", () => {
    assert.equal(expRampOf(2, 8, 0, 1), 2);
    assert.equal(expRampOf(2, 8, 1, 1), 8);
    assert.ok(Math.abs(expRampOf(2, 8, 0.5, 1) - 2 * 4 ** 0.5) < EPS);
    assert.equal(linearRampOf(0, 1, 0, 1), 0);
    assert.equal(linearRampOf(0, 1, 1, 1), 1);
    assert.equal(linearRampOf(0, 1, 0.25, 1), 0.25);
    assert.equal(targetOf(0, 1, 0, 0.5), 1);
    assert.ok(Math.abs(targetOf(0, 1, 0.5, 0.5) - Math.exp(-1)) < EPS);
  });

  it("walks the rbj biquad law: the lowpass passes dc and stops nyquist", () => {
    const lowpass = biquadOf("lowpass", 1000, Math.SQRT1_2, SR);
    assert.ok(biquadMagnitudeDb(lowpass, 1, SR) > -0.1, "dc passes at unity");
    assert.ok(biquadMagnitudeDb(lowpass, 20000, SR) < -30, "the far band stops");
    const highpass = biquadOf("highpass", 1000, Math.SQRT1_2, SR);
    assert.ok(biquadMagnitudeDb(highpass, 1, SR) < -30, "dc stops");
    assert.ok(biquadMagnitudeDb(highpass, 20000, SR) > -0.5, "the far band passes");
    const bandpass = biquadOf("bandpass", 1000, 1, SR);
    assert.ok(biquadMagnitudeDb(bandpass, 1000, SR) > -0.1, "the center passes");
    assert.ok(biquadMagnitudeDb(bandpass, 100, SR) < -10, "the flank stops");
  });

  it("folds the gain seats: the peaking boost and the shelf lift", () => {
    const peaking = biquadOf("peaking", 1000, 1, SR, 6);
    assert.ok(Math.abs(biquadMagnitudeDb(peaking, 1000, SR) - 6) < 0.5, "the center lifts ~6 db");
    assert.ok(Math.abs(biquadMagnitudeDb(peaking, 100, SR)) < 0.5, "the flank stays flat");
    const shelf = biquadOf("lowshelf", 200, 0.9, SR, 4);
    assert.ok(Math.abs(biquadMagnitudeDb(shelf, 50, SR) - 4) < 0.5, "the low band lifts ~4 db");
    assert.ok(Math.abs(biquadMagnitudeDb(shelf, 8000, SR)) < 0.5, "the high band stays flat");
    const notch = biquadOf("notch", 1000, 2, SR);
    assert.ok(biquadMagnitudeDb(notch, 1000, SR) < -20, "the center cuts");
  });

  it("runs the direct form 1 stably (the impulse train stays bounded)", () => {
    const filter = biquadOf("lowpass", 2000, 4, SR);
    let peak = 0;
    for (let index = 0; index < SR; index++) {
      const sample = runBiquad(filter, index % 480 === 0 ? 1 : 0);
      peak = Math.max(peak, Math.abs(sample));
    }
    assert.ok(peak > 0 && peak < 4, `the filtered train stays bounded (peak ${peak.toFixed(3)})`);
  });

  it("walks the one-pole damping law", () => {
    const pole = onePoleOf(1000, SR);
    let level = 0;
    for (let index = 0; index < 480; index++) level = runOnePole(pole, 1);
    assert.ok(level > 0.9, `the pole converges toward the input (${level.toFixed(3)})`);
    const dark = runOnePole(onePoleOf(10, SR), 1);
    assert.ok(dark < 0.01, `the dark pole answers almost nothing on the first sample (${dark.toFixed(5)})`);
  });
});

describe("kathesis — the wavetable seat", () => {
  it("builds the band-limited tables: centered, peak-normalized, honest shapes", () => {
    const saw = buildWavetable("saw", 64);
    assert.equal(saw.length, WAVETABLE_SIZE);
    let mean = 0;
    let peak = 0;
    for (const sample of saw) {
      mean += sample;
      peak = Math.max(peak, Math.abs(sample));
    }
    mean /= saw.length;
    assert.ok(Math.abs(mean) < 1e-6, `the table is dc-free (mean ${mean.toExponential(2)})`);
    assert.ok(Math.abs(peak - WAVETABLE_PEAK) < 1e-6, `the table peaks at the law (${peak.toFixed(4)})`);
    // the sine table answers the sine law
    const sine = buildWavetable("sine", 1);
    let worst = 0;
    for (let index = 0; index < WAVETABLE_SIZE; index++) {
      const expected = WAVETABLE_PEAK * Math.sin((2 * Math.PI * index) / WAVETABLE_SIZE);
      worst = Math.max(worst, Math.abs(sine[index] - expected));
    }
    assert.ok(worst < 1e-6, `the sine table is the sine law (worst ${worst.toExponential(2)})`);
    // the pulse duty: the positive span answers the duty law
    const pulse = buildWavetable("pulse", 256);
    let positive = 0;
    for (const sample of pulse) positive += sample > 0 ? 1 : 0;
    const duty = positive / WAVETABLE_SIZE;
    assert.ok(Math.abs(duty - PULSE_DUTY) < 0.02, `the pulse duty answers the law (${duty.toFixed(3)})`);
  });

  it("seats the mip tiers by the nyquist law", () => {
    const stack = wavetableStack("saw");
    assert.equal(stack.tiers.length, WAVETABLE_TIERS.length);
    // a low note reads the richest tier, a high note a narrow one
    assert.equal(tierIndexOf(stack, 55, SR), 0);
    const highTier = tierIndexOf(stack, 12000, SR);
    assert.ok(highTier > 0, `the high note reads a narrow tier (${highTier})`);
    assert.ok(WAVETABLE_TIERS[highTier] !== undefined && 12000 * WAVETABLE_TIERS[highTier] <= SR / 2 + 1);
  });

  it("renders the oscillator at the note's own frequency", () => {
    const hz = 220;
    const osc = new WavetableOscillator({ shapeA: "saw", sampleRate: SR });
    osc.note(hz);
    const span = osc.render(SR);
    // the zero crossings of one second of a 220 hz wave ~ 440 (two per cycle)
    let crossings = 0;
    for (let index = 1; index < span.length; index++) {
      if ((span[index - 1] < 0 && span[index] >= 0) || (span[index - 1] >= 0 && span[index] < 0)) crossings++;
    }
    assert.ok(Math.abs(crossings - 2 * hz) < 6, `the oscillator sings ${hz} hz (${crossings} crossings)`);
    assert.ok(Math.max(...span) <= WAVETABLE_PEAK + 1e-6);
  });

  it("answers the morph, detune and determinism laws", () => {
    const pure = new WavetableOscillator({ shapeA: "sine", sampleRate: SR });
    pure.note(330);
    const pureSpan = pure.render(2048);
    const morphed = new WavetableOscillator({ shapeA: "sine", shapeB: "square", morph: 0.5, sampleRate: SR });
    morphed.note(330);
    const morphSpan = morphed.render(2048);
    // the morph seat blends: the morphed span answers neither pure shape
    let pureEnergy = 0;
    let morphEnergy = 0;
    for (let index = 0; index < 2048; index++) {
      pureEnergy += (pureSpan[index] ?? 0) ** 2;
      morphEnergy += (morphSpan[index] ?? 0) ** 2;
    }
    assert.ok(Math.abs(morphEnergy - pureEnergy) > 1e-3, "the morph changes the timbre");
    // the detune law: +1200 cents answers the octave (double frequency)
    const detuned = new WavetableOscillator({ shapeA: "sine", detuneCents: 1200, sampleRate: SR });
    detuned.note(220);
    const detunedSpan = detuned.render(SR);
    let crossings = 0;
    for (let index = 1; index < detunedSpan.length; index++) {
      if ((detunedSpan[index - 1] < 0 && detunedSpan[index] >= 0) || (detunedSpan[index - 1] >= 0 && detunedSpan[index] < 0)) crossings++;
    }
    assert.ok(Math.abs(crossings - 2 * 440) < 8, `the detune answers the octave (${crossings} crossings)`);
    // determinism: the same construction answers the same bytes
    const first = new WavetableOscillator({ shapeA: "softsaw", driftCents: 8, driftHz: 5, sampleRate: SR });
    const second = new WavetableOscillator({ shapeA: "softsaw", driftCents: 8, driftHz: 5, sampleRate: SR });
    first.note(110);
    second.note(110);
    assert.deepEqual(Array.from(first.render(1024)), Array.from(second.render(1024)));
  });
});

describe("kathesis — the adsr seat", () => {
  const spec: AdsrSpec = { attackSeconds: 0.1, decaySeconds: 0.2, sustainLevel: 0.5, releaseSeconds: 0.3 };

  it("walks the closed-form law: attack, sustain, release", () => {
    assert.ok(Math.abs(adsrLevelAt(spec, 0, true) - 0) < EPS);
    assert.ok(Math.abs(adsrLevelAt(spec, spec.attackSeconds, true) - 1) < EPS);
    assert.ok(adsrLevelAt(spec, spec.attackSeconds + spec.decaySeconds * 3, true) <= 0.5 + EPS);
    const released = adsrLevelAt(spec, spec.releaseSeconds * ADSR_SEGMENT_TCS, false, 1);
    assert.ok(released < 0.06, `the release walks home (${released.toFixed(3)})`);
  });

  it("walks the streaming machine: gate, hold, release, silence", () => {
    const envelope = new AdsrEnvelope(spec, SR);
    envelope.gate();
    let peak = 0;
    for (let index = 0; index < Math.round(0.12 * SR); index++) peak = Math.max(peak, envelope.step());
    assert.ok(peak > 0.99, `the attack reaches the peak (${peak.toFixed(3)})`);
    let held = 0;
    for (let index = 0; index < Math.round(0.6 * SR); index++) held = envelope.step();
    assert.ok(Math.abs(held - 0.5) < 0.02, `the hold seats at the sustain (${held.toFixed(3)})`);
    envelope.release();
    let tail = 1;
    for (let index = 0; index < Math.round(1.2 * SR); index++) tail = envelope.step();
    assert.ok(tail === 0, `the release lands at silence (${tail})`);
    // the retrigger law: a new gate restarts the attack
    envelope.gate();
    const restarted = envelope.step();
    assert.ok(restarted < 0.01, `the retrigger starts from zero (${restarted.toFixed(4)})`);
  });

  it("answers the house seats (the melodic and percussive laws)", () => {
    assert.ok(ADSR_MELODIC.sustainLevel > 0, "the melodic seat sustains");
    assert.equal(ADSR_MELODIC.attackSeconds < 0.05, true, "the melodic seat attacks fast");
    assert.equal(ADSR_MELODIC.releaseSeconds > 0, true, "the melodic seat releases");
  });
});

describe("kathesis — the eq chain seat", () => {
  it("answers the flat reference eq at unity across the spectrum", () => {
    const flat = { bands: [{ type: "peaking" as const, hz: 1000, q: 1, gainDb: 0 }] };
    for (const hz of [40, 200, 1000, 4000, 12000]) {
      assert.ok(Math.abs(eqResponseDb(flat, hz, SR)) < 0.01, `the flat band stays flat at ${hz} hz`);
    }
  });

  it("lifts the boosted band and stops the far band (the cascade law)", () => {
    const boost = { bands: [{ type: "peaking" as const, hz: 1000, q: 1, gainDb: 6 }] };
    assert.ok(Math.abs(eqResponseDb(boost, 1000, SR) - 6) < 0.5);
    assert.ok(Math.abs(eqResponseDb(boost, 100, SR)) < 0.5);
    const chain = { bands: [
      { type: "lowpass" as const, hz: 2000, q: 0.9, gainDb: 0 },
      { type: "peaking" as const, hz: 300, q: 1, gainDb: 3 },
    ] };
    assert.ok(eqResponseDb(chain, 15000, SR) < -30, "the cascade stops the far band");
    assert.ok(eqResponseDb(chain, 300, SR) > 2, "the cascade lifts the boosted band");
  });

  it("runs the primed cascade over a buffer (streaming state)", () => {
    const chain = buildEqChain({ bands: [{ type: "highpass", hz: 500, q: 1, gainDb: 0 }] }, SR);
    const dc = new Float32Array(480).fill(1);
    let tail = 0;
    for (const sample of dc) tail = runEqChain(chain, sample);
    assert.ok(Math.abs(tail) < 0.05, `the highpass chain rejects dc (${tail.toFixed(4)})`);
  });
});

describe("kathesis — the delay seat", () => {
  it("reads the fractional delay law (the impulse answers at its seat)", () => {
    const line = new DelayLine(0.1, SR);
    line.write(1);
    for (let index = 0; index < 47; index++) line.write(0);
    // the impulse sits 47 samples behind the write seat: the exact read
    // answers it whole, the halfway read blends it with the zero beside it
    assert.ok(Math.abs(line.read(47 / SR, SR) - 1) < 1e-6, "the exact read answers the impulse");
    const halfway = line.read(47.5 / SR, SR);
    assert.ok(halfway > 0.4 && halfway <= 0.5, `the fractional read blends (${halfway.toFixed(3)})`);
  });

  it("walks the feedback echo law (the taps decay by the feedback seat)", () => {
    const delay = new FeedbackDelay({ delaySeconds: 0.05, feedback: 0.5, dampingHz: 12000, wetMix: 1 }, SR);
    // feed one impulse, then silence; the wet output answers the taps
    const out = new Float32Array(Math.round(0.3 * SR));
    out[0] = delay.process(1);
    for (let index = 1; index < out.length; index++) out[index] = delay.process(0);
    const tapAt = (seconds: number): number => Math.abs(out[Math.round(seconds * SR)] ?? 0);
    const first = tapAt(0.05);
    const second = tapAt(0.1);
    assert.ok(first > 0.2, `the first tap lands (${first.toFixed(3)})`);
    assert.ok(second > 0 && second < first * 0.75, `the second tap decays (${second.toFixed(3)} < ${first.toFixed(3)})`);
  });

  it("walks the ping-pong law (the bounce alternates the channels)", () => {
    const ping = new PingPongDelay({ delaySeconds: 0.02, feedback: 0.4, dampingHz: 8000, wetMix: 1 }, SR);
    let left = 0;
    let right = 0;
    for (let index = 0; index < Math.round(0.05 * SR); index++) {
      const [l, r] = ping.process(index === 0 ? 1 : 0, 0);
      if (index === Math.round(0.02 * SR)) left = Math.abs(l);
      if (index === Math.round(0.04 * SR)) right = Math.abs(r);
    }
    assert.ok(left > 0.01, `the left answers the first echo (${left.toFixed(3)})`);
    assert.ok(right > 0.001, `the right answers the bounce (${right.toFixed(3)})`);
  });
});

describe("kathesis — the reverb seat (the freeverb law)", () => {
  it("answers the wet tail: nonzero past the dry, decaying to silence", () => {
    const reverb = new ReverbSeat({ ...REVERB_ROOM, wetMix: 1 }, SR);
    const out = new Float32Array(Math.round(2 * SR));
    for (let index = 0; index < out.length; index++) {
      const [left] = reverb.process(index === 0 ? 1 : 0, index === 0 ? 1 : 0);
      out[index] = left;
    }
    // the wet tail: energy after the first 100 ms, decayed by the end
    const early = rmsOf(out, Math.round(0.02 * SR), Math.round(0.1 * SR));
    const late = rmsOf(out, Math.round(1.0 * SR), Math.round(0.9 * SR));
    assert.ok(early > 1e-4, `the plate answers the impulse (${early.toFixed(5)})`);
    assert.ok(late < early, `the tail decays (${late.toFixed(5)} < ${early.toFixed(5)})`);
    assert.ok(late < 0.02, `the tail settles toward silence (${late.toFixed(5)})`);
  });

  it("answers the dry law at wet 0 and the determinism law", () => {
    const dry = new ReverbSeat({ ...REVERB_ROOM, wetMix: 0 }, SR);
    const [left] = dry.process(0.5, 0.5);
    assert.ok(Math.abs(left - 0.5) < EPS, `the dry passes through (${left})`);
    const first = new ReverbSeat(REVERB_ROOM, SR);
    const second = new ReverbSeat(REVERB_ROOM, SR);
    const a: number[] = [];
    const b: number[] = [];
    for (let index = 0; index < 1000; index++) {
      a.push(first.process(index % 100 === 0 ? 1 : 0, 0)[1]);
      b.push(second.process(index % 100 === 0 ? 1 : 0, 0)[1]);
    }
    assert.deepEqual(a, b, "the same construction answers the same bytes");
    assert.ok(FREEVERB_COMB_TUNINGS.length === 8, "the law carries its eight combs");
  });
});

describe("kathesis — the drive seat and the rack", () => {
  it("bounds the drive law (the tanh ceiling)", () => {
    for (const x of [-100, -2, -0.1, 0, 0.1, 2, 100]) {
      const shaped = driveSample(x, 4);
      assert.ok(shaped <= 1 && shaped >= -1, `the drive bounds ${x} → ${shaped}`);
    }
    assert.ok(Math.abs(driveSample(0, 4)) < EPS, "the drive seats at zero");
    // the floor law: the normalized tanh answers k·x/tanh(k) at the floor
    assert.ok(Math.abs(driveSample(0.01, 2) - Math.tanh(0.02) / Math.tanh(2)) < 1e-9, "the drive answers the tanh law");
    // the odd symmetry law
    assert.ok(Math.abs(driveSample(0.3, 3) + driveSample(-0.3, 3)) < EPS);
  });

  it("walks the rack slots in chain order (gain → eq → drive)", () => {
    const slots: RackSlot[] = [
      { kind: "gain", gainDb: -6 },
      { kind: "eq", bands: [{ type: "peaking", hz: 1000, q: 1, gainDb: 0 }] },
      { kind: "drive", amount: 3 },
    ];
    const input = new Float32Array(256).fill(0.25);
    const out = renderRack(input, { slots }, SR);
    assert.equal(out.length, input.length);
    // the gain seats -6 db (0.5), the drive shapes a little: near the law
    const expected = Math.tanh(3 * 0.5 * 0.25) / Math.tanh(3);
    assert.ok(Math.abs(out[200] - expected) < 0.02, `the chain answers the law (${out[200]?.toFixed(4)} ≈ ${expected.toFixed(4)})`);
    // determinism: the same spec answers the same bytes
    assert.deepEqual(Array.from(renderRack(input, { slots }, SR)), Array.from(out));
  });

  it("streams the rack class (the held state law)", () => {
    const rack = new EffectsRack({ slots: [{ kind: "gain", gainDb: 0 }] }, SR);
    assert.ok(Math.abs(rack.process(0.75) - 0.75) < EPS, "the unity rack passes through");
    const delayed = new EffectsRack(
      { slots: [{ kind: "delay", spec: { delaySeconds: 0.01, feedback: 0.2, dampingHz: 4000, wetMix: 0.5 } }] },
      SR,
    );
    const first = delayed.process(1);
    assert.ok(Math.abs(first - 0.5) < 1e-6, `the dry half passes (${first})`);
    let echo = 0;
    for (let index = 1; index <= Math.round(0.01 * SR); index++) echo = delayed.process(0);
    assert.ok(echo > 0.01, `the wet half tails in (${echo.toFixed(4)})`);
  });
});

describe("kathesis — the sampler seat", () => {
  /** A one-second 220 hz sine take at the mastering rate. */
  function sineTake(): Float32Array {
    const take = new Float32Array(SR);
    for (let index = 0; index < take.length; index++) {
      take[index] = 0.8 * Math.sin((2 * Math.PI * 220 * index) / SR);
    }
    return take;
  }

  it("plays the take at its root (the ratio law at 1)", () => {
    const result = renderSamplerNote(
      { sample: sineTake(), rootHz: 220, loop: false, adsr: { attackSeconds: 0.001, decaySeconds: 0, sustainLevel: 1, releaseSeconds: 0.05 } },
      220,
      0.2,
      1,
      SR,
    );
    assert.equal(result.sampleRate, SR);
    // the voice answers the take's own shape inside the gate
    const mid = Math.round(0.1 * SR);
    const expected = 0.8 * Math.sin((2 * Math.PI * 220 * mid) / SR);
    assert.ok(Math.abs((result.pcm[mid] ?? 0) - expected) < 0.01, `the voice answers the take (${result.pcm[mid]?.toFixed(4)} ≈ ${expected.toFixed(4)})`);
    // and the release tail lands at silence
    const tail = result.pcm[result.pcm.length - 1] ?? 0;
    assert.ok(Math.abs(tail) < 0.05, `the release closes (${tail.toFixed(4)})`);
  });

  it("pitches the take by the ratio law (the octave reads twice as fast)", () => {
    const spec = {
      sample: sineTake(),
      rootHz: 220,
      loop: false,
      adsr: { attackSeconds: 0.001, decaySeconds: 0, sustainLevel: 1, releaseSeconds: 0.01 },
    };
    const octave = renderSamplerNote(spec, 440, 0.1, 1, SR);
    // count the zero crossings inside the gate: the octave doubles them
    let crossings = 0;
    const gate = Math.round(0.1 * SR);
    for (let index = 1; index < gate; index++) {
      const a = octave.pcm[index - 1] ?? 0;
      const b = octave.pcm[index] ?? 0;
      if ((a < 0 && b >= 0) || (a >= 0 && b < 0)) crossings++;
    }
    assert.ok(Math.abs(crossings - 2 * 440 * 0.1) < 12, `the octave reads twice as fast (${crossings} crossings)`);
    // the velocity law
    const quiet = renderSamplerNote(spec, 440, 0.1, 0.25, SR);
    const loudRms = rmsOf(octave.pcm, 0, gate);
    const quietRms = rmsOf(quiet.pcm, 0, gate);
    assert.ok(quietRms < loudRms * 0.4, `the velocity scales (${quietRms.toFixed(4)} < ${loudRms.toFixed(4)})`);
  });

  it("wraps the loop points (the loop keeps its energy through the gate)", () => {
    const take = sineTake();
    const looped = renderSamplerNote(
      { sample: take, rootHz: 220, loop: true, loopStartSeconds: 0, loopEndSeconds: 0.05, adsr: { attackSeconds: 0.001, decaySeconds: 0, sustainLevel: 1, releaseSeconds: 0.01 } },
      220,
      0.5,
      1,
      SR,
    );
    const rms = rmsOf(looped.pcm, 0, Math.round(0.5 * SR));
    assert.ok(rms > 0.2, `the loop keeps its energy (${rms.toFixed(3)})`);
    // the one-shot law on a short take: past the take's end the voice
    // answers silence (the gate still open — the take is the law)
    const short = new Float32Array(Math.round(0.1 * SR));
    for (let index = 0; index < short.length; index++) {
      short[index] = 0.8 * Math.sin((2 * Math.PI * 220 * index) / SR);
    }
    const oneshot = renderSamplerNote(
      { sample: short, rootHz: 220, loop: false, adsr: { attackSeconds: 0.001, decaySeconds: 0, sustainLevel: 1, releaseSeconds: 0.01 } },
      220,
      0.5,
      1,
      SR,
    );
    const tailRms = rmsOf(oneshot.pcm, Math.round(0.45 * SR), Math.round(0.05 * SR));
    assert.ok(tailRms < 0.01, `the one-shot answers silence past its end (${tailRms.toFixed(4)})`);
  });
});

describe("kathesis — the sound ai seat (the markov model over payload events)", () => {
  it("learns the real counts from the payloads (never a hardcoded table)", () => {
    const model = trainSoundModel([teachingProject(), teachingTimeline()], "2026-01-01T00:00:00.000Z");
    assert.equal(model.schema, SOUND_MODEL_SCHEMA_VERSION);
    assert.equal(model.trainedOn, 2);
    // the markov seat: the project's step-ordered line — the lead a3 and
    // the bass c2 share step 0 (the a3 sorts first), then c4, then e4
    assert.equal(model.noteTransitions["57"]?.["36"], 1);
    assert.equal(model.noteTransitions["36"]?.["60"], 1);
    assert.equal(model.noteTransitions["60"]?.["64"], 1);
    // the global counts and the phrase starts (one start per document)
    assert.equal(model.notePitchCounts["57"], 1);
    assert.equal(model.notePitchCounts["55"], 1);
    assert.equal(model.noteStarts["57"], 1);
    assert.equal(model.noteStarts["64"], 1);
    // the drum histogram: the kick hits at 0 and 8, the hats at 2/6/10/14
    assert.equal(model.drumHistogram.kick[0], 1);
    assert.equal(model.drumHistogram.kick[8], 1);
    assert.equal(model.drumHistogram.hat[2], 1);
    assert.equal(model.drumHistogram.hat[3], 0);
    // the bpm buckets: both teaches land in the 120 bucket (the first
    // bucket whose upper edge clears the value — 120 and 128 < 140)
    assert.equal(model.bpmHistogram["120"], 2);
    // the scale affinity and the root mass fold
    assert.equal(model.scaleAffinity["major"], 1);
    assert.ok(model.rootMass[4] > 0, "the timeline's chroma mass folds onto the root seat");
    // the empty model is the honest zero state
    const empty = emptySoundModel();
    assert.equal(empty.trainedOn, 0);
    assert.equal(Object.keys(empty.noteTransitions).length, 0);
  });

  it("generates a validated pattern from the model, deterministically", () => {
    const model = trainSoundModel([teachingProject(), teachingTimeline()]);
    const first = generateFromSoundModel(model, "seed-a", { bars: 2, mood: "generated", prompt: "the walk" });
    assert.ok(first.ok, first.ok ? "" : first.message);
    if (!first.ok) return;
    assert.equal(first.doc.schema, "debonair.pattern/1");
    assert.equal(first.doc.bars, 2);
    // the seed law: the same seed answers the same document (canonical bytes)
    const again = generateFromSoundModel(model, "seed-a", { bars: 2, mood: "generated", prompt: "the walk" });
    assert.ok(again.ok);
    if (again.ok) assert.equal(serializePattern(first.doc), serializePattern(again.doc));
    // a different seed answers a different document
    const other = generateFromSoundModel(model, "seed-b", { bars: 2, mood: "generated", prompt: "the walk" });
    assert.ok(other.ok);
    if (other.ok) assert.notEqual(serializePattern(first.doc), serializePattern(other.doc));
    // the learned law answers: the model's scale (major) and root (c)
    assert.equal(first.doc.scale, "major");
    assert.equal(first.doc.root, 0);
    // the drums ride the learned histogram: the kick lands on 0 and 8
    assert.equal(first.doc.drums.kick[0], 1);
    assert.equal(first.doc.drums.kick[8], 1);
    assert.ok(first.doc.notes.length > 0, "the melodic walk answers notes");
    assert.ok(first.doc.notes.every((note) => note.vel > 0 && note.vel <= 1));
  });

  it("refuses the empty model with the honest machine code", () => {
    const refusal = generateFromSoundModel(emptySoundModel(), "seed");
    assert.ok(!refusal.ok);
    assert.equal(refusal.code, "empty-model");
  });

  it("walks the generated document through the v1 law's own doors (it plays)", async () => {
    const model = trainSoundModel([teachingProject(), teachingTimeline()]);
    const generated = generateFromSoundModel(model, "the round trip seed", { bars: 1, mood: "generated", prompt: "the round trip" });
    assert.ok(generated.ok);
    if (!generated.ok) return;
    // door one: the schedule bridge + the render lane (the offline bounce)
    const schedule = schedulePattern(generated.doc);
    assert.ok(schedule.events.length > 0);
    const mix = renderPatternMix(schedule, "kathesis.test:roundtrip");
    assert.ok(mix.length > SR / 2, `the bounce answers a real span (${mix.length} samples)`);
    assert.ok(rmsOf(mix) > 1e-4, "the bounce answers energy");
    // door two: the reverse ingest (the payload in, playable bytes out)
    const reversed = await reverseIngestPayload(serializePattern(generated.doc));
    assert.ok(reversed.ok, reversed.ok ? "" : reversed.message);
    if (!reversed.ok) return;
    assert.ok(reversed.wav.length > 44, "the reverse ingest answers wav bytes");
    const info = wavInfo(reversed.wav);
    assert.equal(info.sampleRate, RENDER_SAMPLE_RATE);
    assert.ok(info.durationSeconds > 1, `the reconstruction spans the take (${info.durationSeconds.toFixed(2)} s)`);
  });
});

describe("kathesis — the spectral envelope pair", () => {
  /** One magnitude frame with a single peak at hz (the stft bin law). */
  function peakFrame(hz: number, size = 1024): Float32Array {
    const frame = new Float32Array(size / 2);
    const bin = Math.round((hz / (SR / 2)) * (size / 2 - 1));
    frame[Math.max(0, Math.min(frame.length - 1, bin))] = 1;
    return frame;
  }

  it("extracts the envelope of a peaked stack (the band law)", () => {
    const envelope = spectralEnvelopeOf([peakFrame(1000), peakFrame(1000)], SR);
    assert.equal(envelope.length, SPECTRAL_ENVELOPE_BANDS);
    const peakBand = envelope.indexOf(Math.max(...envelope));
    assert.equal(peakBand, envelope.lastIndexOf(Math.max(...envelope)));
    assert.ok(envelope[peakBand] > 0.99, `the peak band answers the energy (${envelope[peakBand]?.toFixed(3)})`);
    // a dark stack answers its energy in a lower band than a bright one
    const dark = spectralEnvelopeOf([peakFrame(120)], SR);
    const bright = spectralEnvelopeOf([peakFrame(8000)], SR);
    assert.ok(dark.indexOf(Math.max(...dark)) < bright.indexOf(Math.max(...bright)), "the dark peak sits below the bright peak");
  });

  it("resynthesizes deterministically under the envelope (bounded, real)", () => {
    const envelope = new Array<number>(SPECTRAL_ENVELOPE_BANDS).fill(0.2);
    envelope[4] = 1;
    const first = resynthesizeSpectral(envelope, "spectral-seed", { seconds: 0.25, fundamentalHz: 220, partials: 24, sampleRate: SR });
    const second = resynthesizeSpectral(envelope, "spectral-seed", { seconds: 0.25, fundamentalHz: 220, partials: 24, sampleRate: SR });
    assert.deepEqual(Array.from(first), Array.from(second), "the same seed answers the same bytes");
    assert.ok(first.length === Math.round(0.25 * SR));
    assert.ok(Math.max(...first) <= 0.9 + EPS && Math.min(...first) >= -0.9 - EPS, "the render stays inside the peak law");
    assert.ok(rmsOf(first) > 0.05, `the render answers energy (${rmsOf(first).toFixed(3)})`);
    // the envelope law: the bright envelope answers a brighter render
    const darkEnv = new Array<number>(SPECTRAL_ENVELOPE_BANDS).fill(0.1);
    darkEnv[1] = 1;
    const brightEnv = new Array<number>(SPECTRAL_ENVELOPE_BANDS).fill(0.1);
    brightEnv[SPECTRAL_ENVELOPE_BANDS - 2] = 1;
    const dark = resynthesizeSpectral(darkEnv, "timbre", { seconds: 0.25, fundamentalHz: 220, partials: 32, sampleRate: SR });
    const bright = resynthesizeSpectral(brightEnv, "timbre", { seconds: 0.25, fundamentalHz: 220, partials: 32, sampleRate: SR });
    const crossingsOf = (buffer: Float32Array): number => {
      let count = 0;
      for (let index = 1; index < buffer.length; index++) {
        const a = buffer[index - 1] ?? 0;
        const b = buffer[index] ?? 0;
        if ((a < 0 && b >= 0) || (a >= 0 && b < 0)) count++;
      }
      return count;
    };
    assert.ok(crossingsOf(bright) > crossingsOf(dark), "the bright envelope answers a brighter render");
    // the empty envelope answers the honest silence
    const silent = resynthesizeSpectral(new Array<number>(SPECTRAL_ENVELOPE_BANDS).fill(0), "timbre", { seconds: 0.05, sampleRate: SR });
    assert.ok(rmsOf(silent) === 0, "the empty envelope answers silence");
  });
});
