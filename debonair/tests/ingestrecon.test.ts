// # ingestrecon.test — the descriptor law of the recon lane (the wave 16a
// battery): the deterministic kernels (the 13-coefficient mfcc of a sine —
// the seats equal the timbre library's own answer, the 32-window envelope
// of a constant signal, the top-5 peaks of a pure tone, the yin
// fundamental of a 440 hz sine — A4, midi 69), the 48-scale fit and the
// register law, and the converter contract (debonair.ingest/1 →
// debonair.recon/3: every segment fact maps its seat, the identity hashes
// agree, the ingest document itself stays whole — the recon never removes a
// fact from it). Everything runs twice where determinism is the claim: the
// same pcm always answers the same document, and the canonical serializer
// then answers the same bytes. runnable with vitest:
// pnpm vitest run tests/ingestrecon.test.ts
import assert from "node:assert/strict";
import { describe, it } from "vitest";
import { mfcc } from "../audiotimbre.ts";
import { decompose } from "../ingest.ts";
import { separate } from "../hpss.ts";
import {
  RECON_ENVELOPE_WINDOWS,
  RECON_MFCC_COEFFICIENTS,
  reconBpmPerSecond,
  reconEnvelope32,
  reconFamilyOf,
  reconFromIngest,
  reconOf,
  reconScaleFit,
  reconSpectralPeaks,
  reconYinNotes,
  trackStreamOf,
} from "../ingestrecon.ts";
import { RECON_LAYERS, RECON_SAMPLE_RATE, RECON_SCALE_NAMES, serializeRecon, validateRecon } from "../reconpayload.ts";
import { FFT_SIZE, frameSpectrum, keyOf } from "../spectrum.ts";

/** The analysis rate of the recon lane (the cd canon). */
const SR = RECON_SAMPLE_RATE;

/** A deterministic synthetic take: a sustained 440 hz sine (the tonal
 * layer, A4 for the yin lane) over a 120 bpm click train (the percussive
 * layer, the pulse for the tempo lane) — two seconds, two frames. */
function synthetictake(): Float32Array {
  const mono = new Float32Array(SR * 2);
  for (let i = 0; i < mono.length; i++) {
    const t = i / SR;
    const sine = 0.35 * Math.sin(2 * Math.PI * 440 * t);
    const click = t % 0.5 < 0.015 ? 0.5 : 0;
    mono[i] = Math.max(-1, Math.min(1, sine + click));
  }
  return mono;
}

/** One pure 440 hz sine second — the clean probe of the spectral kernels. */
function pureSineSecond(): Float32Array {
  const second = new Float32Array(SR);
  for (let i = 0; i < second.length; i++) second[i] = 0.4 * Math.sin((2 * Math.PI * 440 * i) / SR);
  return second;
}

// the heavy artifacts, built once at collection: the standalone lane twice
// (the determinism proof) and the converter lane over the same separation
const TAKE = synthetictake();
const RECON_FIRST = reconOf(TAKE, SR, { name: "law take" });
const RECON_SECOND = reconOf(TAKE, SR, { name: "law take" });
const STEMS = separate(TAKE);
const DECOMP = decompose(TAKE, STEMS, SR, { name: "law take", at: "2026-01-01T00:00:00.000Z" });
const INGEST_SNAPSHOT = JSON.parse(JSON.stringify(DECOMP.doc));
const RECON_CONVERTED = reconFromIngest(DECOMP.doc, TAKE, DECOMP.harmonic, DECOMP.percussive);

describe("the descriptor kernels (the deterministic measurements)", () => {
  it("seats the timbre library's own 13-coefficient mfcc for a sine", () => {
    const frame = RECON_FIRST.frames[0];
    assert.ok(frame, "the take seats its first frame");
    const record = frame as unknown as Record<string, number>;
    const seats = Array.from({ length: RECON_MFCC_COEFFICIENTS }, (_, c) => record[`mfcc${c}`]);
    assert.equal(seats.length, 13);
    for (const seat of seats) assert.ok(Number.isFinite(seat), "every coefficient is finite");
    // the seats equal the library's answer over the same shared spectrum —
    // the lane imports the front end, it never re-implements it
    const spectrum = frameSpectrum(Array.from(TAKE.subarray(0, FFT_SIZE)), SR);
    const coefficients = mfcc(spectrum.magnitudes, SR, { coefficients: RECON_MFCC_COEFFICIENTS });
    assert.equal(coefficients.length, 13);
    const again = mfcc(spectrum.magnitudes, SR, { coefficients: RECON_MFCC_COEFFICIENTS });
    assert.deepEqual([...again], [...coefficients], "the same spectrum answers the same coefficients");
    const rounded = (value: number): number => Math.round(value * 10000) / 10000;
    for (let c = 0; c < RECON_MFCC_COEFFICIENTS; c++) {
      assert.equal(seats[c], rounded(coefficients[c]), `the mfcc${c} seat equals the library's answer`);
    }
  });

  it("seats exactly 32 equal windows for a constant signal", () => {
    const constant = new Float32Array(SR).fill(0.5);
    const envelope = reconEnvelope32(constant, SR);
    assert.ok(Math.abs(envelope.mean - 0.5) < 1e-6, "the mean window rms is the constant");
    assert.ok(Math.abs(envelope.min - 0.5) < 1e-6);
    assert.ok(Math.abs(envelope.max - 0.5) < 1e-6);
    assert.equal(envelope.std, 0, "thirty-two equal windows carry no movement");
    assert.equal(envelope.dynamic, 0);
    assert.equal(RECON_ENVELOPE_WINDOWS, 32);
  });

  it("seats the fundamental bin of a pure sine as the strongest peak", () => {
    const spectrum = frameSpectrum(Array.from(pureSineSecond().subarray(0, FFT_SIZE)), SR);
    const peaks = reconSpectralPeaks(spectrum.magnitudes, spectrum.binHz);
    assert.equal(peaks.length, 10, "five hz/mag pairs");
    assert.ok(
      Math.abs(peaks[0] - 440) <= spectrum.binHz,
      `the strongest peak sits on the fundamental (${peaks[0]} hz)`,
    );
    assert.equal(peaks[1], 1, "the strongest peak normalizes to 1");
    for (let seat = 1; seat < 5; seat++) {
      assert.equal(peaks[seat * 2], 0, `a pure sine has no partial ${seat + 1}`);
      assert.equal(peaks[seat * 2 + 1], 0);
    }
  });

  it("detects A4 (midi 69) on a 440 hz sine with the yin lane", () => {
    const notes = reconYinNotes(pureSineSecond(), SR, 0, SR);
    assert.ok(notes.length >= 3, "the sine seats at least one note triple");
    assert.equal(notes.length % 3, 0);
    const [midi, onset, vel] = notes;
    assert.equal(Math.round(midi), 69, `the 440 hz sine is A4 (got midi ${midi})`);
    assert.ok(Math.abs(midi - 69) < 0.5, "the fundamental lands within a quarter tone");
    assert.ok(onset >= 0 && onset <= 1, "the onset seats inside the second");
    assert.ok(vel > 0 && vel <= 1, "the velocity seats in 0..1");
  });

  it("answers no note for silence (the honest aperiodic gate)", () => {
    const silence = new Float32Array(SR);
    assert.deepEqual(reconYinNotes(silence, SR, 0, SR), []);
  });

  it("fits the 48-scale library at the krumhansl root", () => {
    // the c major triad energy inside the major scale: capture 1, leak 0
    const majorTriad = [1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0];
    assert.equal(keyOf(majorTriad).tonic, 0, "krumhansl seats the root on c");
    assert.equal(reconScaleFit(majorTriad, 0), 0, "the major scale wins at root c (ties keep the lowest id)");
    // the phrygian dominant degrees (root, b2, 4, 5) fit phrygian-dom —
    // the spec's own dictionary example
    const phrygian = [1, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0];
    assert.equal(reconScaleFit(phrygian, 0), RECON_SCALE_NAMES.indexOf("phrygian-dom"));
  });

  it("seats the family by the register law", () => {
    const frame = (noteCount: number, noteMidiMean: number) => ({ noteCount, noteMidiMean });
    assert.equal(reconFamilyOf([frame(1, 40)], 0.1, 0.1), "bass");
    assert.equal(reconFamilyOf([frame(1, 60)], 0.1, 0.1), "guitar");
    assert.equal(reconFamilyOf([frame(1, 80)], 0.1, 0.1), "vocal");
    assert.equal(reconFamilyOf([frame(0, 0)], 0.1, 0.5), "percussion");
    assert.equal(reconFamilyOf([frame(0, 0)], 0.5, 0.1), "pad");
  });

  it("seats a per-second tempo series (never one global)", () => {
    const bpm = reconBpmPerSecond(TAKE, SR, 2);
    assert.equal(bpm.length, 2);
    for (const value of bpm) assert.ok(value >= 0 && value <= 250, `the bpm ${value} seats honestly`);
    assert.ok(bpm.some((value) => value > 0), "the 120 bpm click train carries a pulse");
  });
});

describe("the standalone lane (reconOf)", () => {
  it("answers the same document twice (the determinism law)", () => {
    assert.equal(serializeRecon(RECON_FIRST), serializeRecon(RECON_SECOND));
  });

  it("seats the canon rate, the frames and the layers of the take", () => {
    assert.equal(RECON_FIRST.header.sampleRate, 44100);
    assert.equal(RECON_FIRST.header.schema, "debonair.recon/3");
    assert.equal(RECON_FIRST.frames.length, 2, "two seconds, two frames");
    for (const frame of RECON_FIRST.frames) {
      assert.equal(frame.layers.length, 2, "the harmonic and percussive layers");
      assert.equal(frame.layers[0].layerId, RECON_LAYERS.indexOf("harmonic"));
      assert.equal(frame.layers[1].layerId, RECON_LAYERS.indexOf("percussive"));
      assert.deepEqual(frame.layers[1].midiNotes, [], "the percussive layer carries no notes");
      assert.equal(frame.layers[0].midiNotes.length % 3, 0, "the note lane seats triples");
      assert.ok(frame.noteCount >= 1, "the tonal sine seats notes");
      assert.equal(Math.round(frame.noteMidiMean), 69, "the 440 hz sine seats A4");
      assert.ok(frame.bpm >= 0, "the per-second bpm seats honestly");
    }
    assert.ok(RECON_FIRST.header.mostUsedKeyId >= 0 && RECON_FIRST.header.mostUsedKeyId <= 11);
    assert.ok(RECON_FIRST.header.mostUsedScaleId >= 0 && RECON_FIRST.header.mostUsedScaleId <= 47);
    assert.ok(RECON_FIRST.correlations.tempoFluctuationIndex >= 0);
    assert.ok(RECON_FIRST.correlations.tempoFluctuationIndex <= 1);
    assert.ok(Number.isInteger(RECON_FIRST.correlations.harmonicDistortionStateHash));
  });

  it("validates against the contract (the document the lane answers is lawful)", () => {
    const result = validateRecon(RECON_FIRST);
    assert.ok(result.ok);
  });

  it("resamples an off-canon source to the 44100 canon", () => {
    const eightK = new Float32Array(8000 + 800); // 1.1 s at 8 khz
    for (let i = 0; i < eightK.length; i++) eightK[i] = 0.3 * Math.sin((2 * Math.PI * 440 * i) / 8000);
    const doc = reconOf(eightK, 8000, { name: "off canon" });
    assert.equal(doc.header.sampleRate, 44100);
    assert.equal(doc.frames.length, 1);
    assert.ok(Math.abs(doc.header.durationSeconds - 1.1) < 0.01);
  });
});

describe("the converter lane (ingest/1 → recon/3)", () => {
  it("maps every segment fact onto its recon seat (information preserved)", () => {
    const doc = RECON_CONVERTED;
    assert.equal(doc.frames.length, DECOMP.doc.segments.length);
    for (const [index, segment] of DECOMP.doc.segments.entries()) {
      const frame = doc.frames[index];
      assert.equal(frame.s, segment.s);
      assert.equal(frame.rms, segment.rms, "the rms seat");
      assert.equal(frame.peak, segment.peak, "the peak seat");
      assert.equal(frame.zcr, segment.zcr, "the zcr seat");
      assert.equal(frame.centroid, segment.cent, "the centroid seat");
      assert.equal(frame.flatness, segment.flat, "the flatness seat");
      assert.equal(frame.beatStrength, segment.beat, "the beat strength seat");
      assert.equal(frame.onsetCount, segment.onsets, "the onset count seat");
      assert.equal(frame.bandLow, segment.bands[0], "the low band seat");
      assert.equal(frame.bandMid, segment.bands[1], "the mid band seat");
      assert.equal(frame.bandHigh, segment.bands[2], "the high band seat");
      // the chroma seats: the wheel normalized to unit sum, the dominant
      // pitch class preserved
      const wheel = [
        frame.chroma0,
        frame.chroma1,
        frame.chroma2,
        frame.chroma3,
        frame.chroma4,
        frame.chroma5,
        frame.chroma6,
        frame.chroma7,
        frame.chroma8,
        frame.chroma9,
        frame.chroma10,
        frame.chroma11,
      ];
      const wheelSum = wheel.reduce((sum, value) => sum + value, 0);
      assert.ok(Math.abs(wheelSum - 1) < 0.02 || wheelSum === 0, "the wheel sums to one (or silence)");
      const dominantFrame = wheel.indexOf(Math.max(...wheel));
      const dominantSegment = segment.chroma.indexOf(Math.max(...segment.chroma));
      assert.equal(dominantFrame, dominantSegment, "the dominant pitch class survives the normalization");
    }
  });

  it("carries the identity of the ingest document (name, duration, pcm hash)", () => {
    assert.equal(RECON_CONVERTED.header.name, DECOMP.doc.name);
    assert.equal(RECON_CONVERTED.header.durationSeconds, DECOMP.doc.durationSeconds);
    assert.equal(RECON_CONVERTED.header.pcmhash, DECOMP.doc.pcmhash);
    assert.ok(RECON_CONVERTED.header.bpmMedian >= 0);
    assert.equal(RECON_CONVERTED.header.timeSignature, "4/4", "the default meter seat");
    assert.equal(RECON_CONVERTED.header.encoding, "pcm16", "the default encoding seat");
    assert.equal(RECON_CONVERTED.header.mimeType, "audio/wav", "the default mime seat");
  });

  it("never removes a fact from the ingest document (the record stays whole)", () => {
    assert.deepEqual(JSON.parse(JSON.stringify(DECOMP.doc)), INGEST_SNAPSHOT);
    assert.equal(DECOMP.doc.schema, "debonair.ingest/1");
    assert.equal(DECOMP.doc.stems.length, 2, "both stems stay");
    assert.equal(DECOMP.doc.segments.length, 2, "the mix segments stay");
  });

  it("answers the same document as the standalone lane over the same take", () => {
    // the converter over the decomposition and the standalone lane agree:
    // one separation, one analysis, one law
    assert.equal(serializeRecon(RECON_CONVERTED), serializeRecon(RECON_FIRST));
  });

  it("exposes the per-track streams of the track-only exception", () => {
    const harmonic = trackStreamOf(RECON_FIRST, RECON_LAYERS.indexOf("harmonic"));
    const percussive = trackStreamOf(RECON_FIRST, RECON_LAYERS.indexOf("percussive"));
    assert.ok(harmonic.midiNotes.length >= 3, "the harmonic stream carries the yin notes");
    assert.equal(percussive.midiNotes.length, 0, "the percussive stream carries none");
    assert.ok(harmonic.spectralPeaks.length > 0, "the harmonic stream carries its peaks");
    assert.ok(percussive.spectralPeaks.length > 0, "the percussive stream carries its peaks");
  });

  it("round-trips the converter output through the contract parser", () => {
    const parsed = JSON.parse(serializeRecon(RECON_CONVERTED));
    assert.equal(parsed.header.schema, "debonair.recon/3");
    const validated = validateRecon(parsed);
    assert.ok(validated.ok, "the serialized converter output parses back lawful");
  });
});
