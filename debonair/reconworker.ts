// # reconworker — the reconstruction worker of the recon lane (root layer,
// wave 16b): the reverse walk of the debonair.recon/3 contract — a validated
// document (the 82 seats the descriptor lane measured) renders back into
// real wav bytes at the 44100 cd canon (RECON_SAMPLE_RATE, never the 48 khz
// mastering rate the render lane rides — the two rates never silently swap,
// docs/recon.spec.md §8). The synthesis is the spec's third honest strategy:
// additive ola from the seed — per second, the layer lane's top-5 spectral
// peaks seat the partial bank (the measured frequencies, the seeded phases),
// the 32-window envelope statistics shape the amplitude curve inside the
// second, the band seats split the energy between the two hpss layers
// (harmonic and percussive, RECON_LAYERS), the rms seat scales every layer
// to the loudness the frame measured, and the chroma/scaleRoot/scaleType
// seats answer the fallback partial bank when a layer's peaks seat nothing
// (the scale vocabulary of the pattern library, the same 48 scales the fit
// lane scored). Every random draw rides the engine's canonical
// mulberry32(hashSeed(seed)) stream — the seed is the fnv-1a of the
// document's own canonical serialization, so the same document always
// answers the same bytes, on every machine, forever (docs/recon.spec.md §9).
//
// THE ANTI-FAKE LAW (docs/recon.spec.md §7): the checksums this lane
// answers IDENTIFY the render, they never allege reproduction. A seed
// synthesis rebuilds a take *in the spirit of* the analysis — honestly
// labeled as a rebuild; it does not and cannot reconstitute the recorded
// pcm the document measured (that is the blob lane's job, the ladder's
// second rung). The renderPcmHash is the fnv-1a identity of the pcm this
// synthesis produced; the sourcePcmHash is the identity of the analyzed
// source echoed from the header — the two differ by construction, and the
// difference is the honesty: a checksum identifies, never verifies. The
// proof of function is the play — payload → reconstruct → play — and the
// feature funnel the tests pin: the render's per-second rms, centroid, zcr
// and flatness land inside the bands the original's seats measured.
//
// Non-goals: no measurement (ingestrecon.ts owns the descriptor lane), no
// storage (the blob store seam rides the orchestrator), no gateway (the
// route lane binds this walk). Pure and multi-mode — the same call runs in
// the browser and in node.

import { seededNoiseChannel } from "./audioengine.ts";
import { hashSeed, mulberry32 } from "./harmonyengine.ts";
import { pcmhash } from "./ingest.ts";
import { RECON_ENVELOPE_WINDOWS } from "./ingestrecon.ts";
import { limitTruePeak } from "./limiter.ts";
import { PATTERN_SCALES, type PatternScaleName } from "./patternenums.ts";
import {
  parseRecon,
  RECON_LAYERS,
  RECON_SAMPLE_RATE,
  RECON_SCALE_NAMES,
  type ReconDocument,
  type ReconFrame,
  serializeRecon,
} from "./reconpayload.ts";
import type { RenderBlobPointer, RenderBlobStore, RenderJobRow, RenderJobSeat } from "./renderworker.ts";
import { midiToHz } from "./tuning.ts";
import { encodeWav } from "./wavwriter.ts";

// ---------------------------------------------------------------------------
// the render lane constants (the cd canon law)
// ---------------------------------------------------------------------------

/** The rate the recon lane renders at — the cd canon the contract freezes
 * (44100, RECON_SAMPLE_RATE). the generation lane's render master stays at
 * the 48 khz MASTERING rate; the two lanes never swap (docs/recon.spec.md §8). */
export const RECON_RENDER_SAMPLE_RATE = RECON_SAMPLE_RATE;

/** The bounce depth: mono pcm 16 (the wavwriter's container law). */
export const RECON_RENDER_BIT_DEPTH = 16 as const;

/** The blob kind of the reconstructed wav (the mime the playback lane streams). */
export const RECON_WAV_KIND = "audio/wav";

/** The pipeline phases of one reconstruction, in the law order (the ledger
 * row and the progress callback speak these names — the render lane's own
 * vocabulary stays schedule/render/encode/store; the recon walk rides its
 * own on the same ledger). */
export const RECON_PHASES: readonly ReconPhase[] = ["reconstruct", "encode", "store"];

/** One phase of the reconstruction pipeline. */
export type ReconPhase = "reconstruct" | "encode" | "store";

/** The layer dictionary seats of the two hpss stems (0 harmonic, 1 percussive). */
const HARMONIC_LAYER_ID = RECON_LAYERS.indexOf("harmonic");
const PERCUSSIVE_LAYER_ID = RECON_LAYERS.indexOf("percussive");

/** The lowest partial frequency the additive bank trusts, hz (under this a
 * measured peak is a dc drift, not a partial). */
const PARTIAL_MIN_HZ = 20;

/** The highest partial frequency the additive bank trusts, hz. */
const PARTIAL_MAX_HZ = 18000;

/** The cap of the fallback scale bank (the chroma-guided partials a layer
 * without peaks seats — bounded, the runaway law). */
const SCALE_BANK_MAX = 6;

/** The burst count ceiling of the percussive layer inside one second. */
const BURST_MAX = 32;

// ---------------------------------------------------------------------------
// the seed law (the determinism rail of docs/recon.spec.md §9)
// ---------------------------------------------------------------------------

/**
 * The seed of one recon document — the fnv-1a (hashSeed) of the document's
 * own canonical serialization, spelled as the lane's identity string. Every
 * generative consumer of the document draws its randomness from
 * mulberry32(hashSeed(seed)); a synthesis seeded by the document hash is
 * reproducible forever — the same document always answers the same seed,
 * whatever key order it arrived with (the canonical serializer pins the
 * bytes first).
 *
 * @param doc the recon document (must satisfy the contract — a broken
 *   document throws ReconError through the canonical serializer).
 * @returns the seed string ("recon/3:xxxxxxxx" — the hash in hex).
 */
export function reconSeedOf(doc: ReconDocument): string {
  return `recon/3:${(hashSeed(serializeRecon(doc)) >>> 0).toString(16).padStart(8, "0")}`;
}

/**
 * The checksums of one reconstruction — the identity triple the export and
 * the job answers carry. IDENTIFIES, never verifies (the anti-fake law):
 * the render hash names the pcm this synthesis produced, the source hash
 * names the pcm the document measured, and the two differ by construction —
 * a seed synthesis is a rebuild in the spirit of the analysis, never a
 * claim of lossless reproduction.
 */
export interface ReconChecksums {
  /** The fnv-1a identity of the reconstructed pcm (the float the writer
   * quantized — identifies this render, byte-stable forever). */
  renderPcmHash: number;
  /** The fnv-1a identity of the analyzed source, echoed from the document's
   * header (the identity of the take the document measured — never equal to
   * the render hash, by law). */
  sourcePcmHash: number;
  /** The uint32 the seeded rng rode (hashSeed of the seed string — the
   * determinism anchor, so a third party can rebuild the same render). */
  seedHash: number;
}

/** The pure answer of the reconstruction synthesis (before the container). */
export interface ReconPcmRender {
  /** The mono pcm at the cd canon rate, one second per frame. */
  pcm: Float32Array;
  /** The seed the rng rode. */
  seed: string;
  /** The identity checksums (the anti-fake triple). */
  checksums: ReconChecksums;
}

/** The full answer of the reconstruction (the wav container included). */
export interface ReconWavRender {
  /** The wav bytes — mono pcm 16 at 44100, the wavwriter's own container. */
  wav: Uint8Array;
  /** The seed the rng rode. */
  seed: string;
  /** The identity checksums (the anti-fake triple). */
  checksums: ReconChecksums;
}

// ---------------------------------------------------------------------------
// the additive ola kernels (the per-second synthesis)
// ---------------------------------------------------------------------------

/** One additive partial of the harmonic bank — the measured frequency, its
 * normalized magnitude and the seeded phase. */
interface PartialVoice {
  /** The partial frequency, hz (a measured peak or a scale seat). */
  hz: number;
  /** The relative amplitude (0..1 — the peak magnitude or the chroma weight). */
  amplitude: number;
  /** The seeded initial phase (radians). */
  phase: number;
}

/** Clamps a number into the inclusive range. */
function clamp(x: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, x));
}

/**
 * Reads the partial bank of one layer's second — the top-5 spectral peaks
 * the layer lane carries, interleaved [hz0, mag0, …]: every pair inside
 * the honest band (20 hz..18 khz, a positive magnitude) seats one partial
 * with a seeded phase. A layer without peaks answers an empty bank — the
 * caller's fallback decides what seats instead.
 *
 * @param layerPeaks the layer's interleaved peak pairs.
 * @param rng the seeded stream the phases draw from.
 * @returns the partial voices, strongest first as the peaks seated them.
 */
function partialsOf(layerPeaks: readonly number[], rng: () => number): PartialVoice[] {
  const voices: PartialVoice[] = [];
  for (let pair = 0; pair + 1 < layerPeaks.length; pair += 2) {
    const hz = layerPeaks[pair];
    const magnitude = layerPeaks[pair + 1];
    if (typeof hz !== "number" || typeof magnitude !== "number") continue;
    if (!(hz >= PARTIAL_MIN_HZ && hz <= PARTIAL_MAX_HZ) || !(magnitude > 0)) continue;
    voices.push({ hz, amplitude: magnitude, phase: rng() * 2 * Math.PI });
  }
  return voices;
}

/**
 * The fallback partial bank of one frame's second — the chroma/scaleRoot/
 * scaleType seats guiding the voices when the harmonic layer's peaks seat
 * nothing (a sustained pad the peak lane under-seats, an honest silence the
 * scale answers). The law: the frame's 48-scale vocabulary rotates on the
 * frame's root, the chroma wheel weighs every degree, the heaviest degrees
 * seat partials in the octave around the note register (the noteMidiMean
 * seat, middle c when no note sang), the seeded stream drawing the phases.
 *
 * @param frame the frame whose tonality seats the bank.
 * @param rng the seeded stream the phases draw from.
 * @returns the partial voices (empty when the chroma carries no energy).
 */
function scaleBankOf(frame: ReconFrame, rng: () => number): PartialVoice[] {
  const scaleName = RECON_SCALE_NAMES[frame.scaleType] as PatternScaleName | undefined;
  const intervals =
    scaleName !== undefined && scaleName in PATTERN_SCALES ? PATTERN_SCALES[scaleName] : PATTERN_SCALES.major;
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
  const register = frame.noteMidiMean > 0 ? frame.noteMidiMean : 60;
  const degrees = intervals
    .map((degree) => ({ degree, weight: wheel[(frame.scaleRoot + degree) % 12] ?? 0 }))
    .filter((entry) => entry.weight > 0)
    .sort((left, right) => right.weight - left.weight || left.degree - right.degree)
    .slice(0, SCALE_BANK_MAX);
  const voices: PartialVoice[] = [];
  for (const entry of degrees) {
    const pitchClass = (frame.scaleRoot + entry.degree) % 12;
    let midi = 12 * Math.floor(register / 12) + pitchClass;
    if (midi > register + 6) midi -= 12;
    if (midi < register - 6) midi += 12;
    voices.push({ hz: midiToHz(midi), amplitude: entry.weight, phase: rng() * 2 * Math.PI });
  }
  return voices;
}

/**
 * The 32-window amplitude curve of one second — the envelope statistics
 * shaped into a smooth macro movement: a seeded breath (one to three swells
 * inside the second, a seeded phase) walks between the frame's envelopeMin
 * and envelopeMax seats, the same 32 windows the descriptor lane measured.
 * The linear interpolation between the seats is the ola crossfade the
 * samples read.
 *
 * @param frame the frame whose envelope seats shape the curve.
 * @param rng the seeded stream the swell draws from.
 * @returns the 32 amplitude seats.
 */
function envelopeCurveOf(frame: ReconFrame, rng: () => number): Float32Array {
  const curve = new Float32Array(RECON_ENVELOPE_WINDOWS);
  const lo = Math.min(frame.envelopeMin, frame.envelopeMax);
  const hi = Math.max(frame.envelopeMin, frame.envelopeMax);
  const cycles = 1 + Math.floor(rng() * 3);
  const phase = rng() * 2 * Math.PI;
  for (let window = 0; window < RECON_ENVELOPE_WINDOWS; window++) {
    const breath = 0.5 + 0.5 * Math.sin((2 * Math.PI * cycles * window) / RECON_ENVELOPE_WINDOWS + phase);
    curve[window] = lo + breath * (hi - lo);
  }
  return curve;
}

/**
 * The ola gain at one position inside the second — the linear interpolation
 * between the envelope curve's window seats (the crossfade law).
 *
 * @param curve the 32 amplitude seats.
 * @param position the position inside the second, 0..1.
 * @returns the gain at the position.
 */
function gainAt(curve: Float32Array, position: number): number {
  const x = clamp(position, 0, 1) * (curve.length - 1);
  const index = Math.min(curve.length - 2, Math.floor(x));
  const fraction = x - index;
  return curve[index] + (curve[index + 1] - curve[index]) * fraction;
}

/**
 * Scales one pcm slice onto a target rms — the loudness law: the measured
 * shape survives, the level lands on the seat the frame carries (a slice
 * that measured nothing stays nothing — silence never scales into sound).
 *
 * @param pcm the slice to scale (in place).
 * @param target the target rms (0..1 — the seat the frame measured).
 */
function scaleToRms(pcm: Float32Array, target: number): void {
  let energy = 0;
  for (let i = 0; i < pcm.length; i++) energy += pcm[i] * pcm[i];
  const measured = Math.sqrt(energy / pcm.length);
  if (measured <= 1e-9 || target <= 0) return;
  const scale = target / measured;
  for (let i = 0; i < pcm.length; i++) pcm[i] *= scale;
}

/**
 * Renders the harmonic layer of one frame's second — the additive bank (the
 * layer's top-5 peaks, the scale fallback when the peaks seat nothing)
 * under the 32-window envelope curve, scaled onto the layer's rms share.
 *
 * @param frame the frame whose seats guide the layer.
 * @param rng the frame's seeded stream.
 * @param targetRms the layer's rms share (the band-seat energy split).
 * @returns the layer's second (silence when the layer seats nothing).
 */
function harmonicSecondOf(frame: ReconFrame, rng: () => number, targetRms: number): Float32Array {
  const second = new Float32Array(RECON_SAMPLE_RATE);
  if (targetRms <= 0) return second;
  const layer = frame.layers.find((entry) => entry.layerId === HARMONIC_LAYER_ID);
  let voices = partialsOf(layer?.spectralPeaks ?? [], rng);
  if (voices.length === 0) voices = scaleBankOf(frame, rng);
  if (voices.length === 0) return second;
  const curve = envelopeCurveOf(frame, rng);
  for (let i = 0; i < second.length; i++) {
    const t = i / RECON_SAMPLE_RATE;
    let sample = 0;
    for (const voice of voices) sample += voice.amplitude * Math.sin(2 * Math.PI * voice.hz * t + voice.phase);
    second[i] = sample * gainAt(curve, t);
  }
  scaleToRms(second, targetRms);
  return second;
}

/**
 * The magnitude centroid of a 4-pole lowpass noise floor — the closed form
 * the noise color solve rides (the same magnitude-weighted centroid law the
 * descriptor lane's segment kernel measures): a cascade of four one-pole
 * sections answers the magnitude spectrum 1/(1+(f/fc)²)², whose centroid
 * over the band is fc · (1 − 1/(1+X²)) / (X/(1+X²) + atan(X)) with
 * X = nyquist/fc. Monotonic in fc — the bisection below inverts it.
 *
 * @param cutoffHz the one-pole cutoff of every section.
 * @param nyquist the band ceiling.
 * @returns the magnitude centroid, hz.
 */
function fourPoleNoiseCentroid(cutoffHz: number, nyquist: number): number {
  const x = nyquist / cutoffHz;
  const square = 1 / (1 + x * x);
  return (cutoffHz * (1 - square)) / (x * square + Math.atan(x));
}

/**
 * Solves the noise color of one frame — the 4-pole cutoff whose noise
 * centroid lands on the frame's centroid seat (the spectral center the
 * analysis measured): a pure bisection over the closed form, deterministic
 * and pure. A seat outside the honest band clamps (a centroid the noise
 * floor cannot reach answers the nearest reachable color).
 *
 * @param centroid the frame's centroid seat, hz.
 * @returns the one-pole cutoff of every section, hz.
 */
function noiseCutoffOf(centroid: number): number {
  const nyquist = RECON_SAMPLE_RATE / 2;
  const target = Math.min(nyquist * 0.45, Math.max(60, centroid > 0 ? centroid : 1000));
  let lo = 1;
  let hi = nyquist;
  for (let iteration = 0; iteration < 48; iteration++) {
    const mid = (lo + hi) / 2;
    if (fourPoleNoiseCentroid(mid, nyquist) < target) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

/**
 * Renders the percussive layer of one frame's second — the burst bank the
 * layer's own top-5 peaks seat (the measured thump frequencies as decaying
 * tonal bursts, the seeded phases) beside the noise floor the flatness seat
 * weighs (the tone-versus-noise balance the analysis measured), the bursts
 * placed at the frame's rhythmic seats (the onsetCount first, the bpm grid
 * as the fallback), the decay guided by the brightness seat (a bright
 * second ticks, a dark one rolls), the noise colored by the centroid seat
 * (a 4-pole lowpass solved onto the frame's spectral center), scaled onto
 * the layer's rms share. A second with onsets seated nowhere but high-band
 * energy answers a sustained bed — the honest wash.
 *
 * @param frame the frame whose seats guide the layer.
 * @param seed the take seed (the noise take's identity).
 * @param rng the frame's seeded stream (the burst phases).
 * @param targetRms the layer's rms share (the band-seat energy split).
 * @returns the layer's second (silence when the layer seats nothing).
 */
function percussiveSecondOf(frame: ReconFrame, seed: string, rng: () => number, targetRms: number): Float32Array {
  const second = new Float32Array(RECON_SAMPLE_RATE);
  if (targetRms <= 0) return second;
  const layer = frame.layers.find((entry) => entry.layerId === PERCUSSIVE_LAYER_ID);
  const voices = partialsOf(layer?.spectralPeaks ?? [], rng);
  const noise = seededNoiseChannel(`${seed}:${frame.s}:perc`, RECON_SAMPLE_RATE);
  // the flatness seat weighs the tone-versus-noise balance of the bursts
  const noiseShare = clamp(frame.flatness, 0, 1);
  const tonalScale = Math.sqrt(1 - noiseShare);
  const noiseScale = Math.sqrt(noiseShare);
  // the noise color: four cascaded one-pole sections solved onto the
  // frame's centroid seat (the noise energy lands where the analysis
  // centered it, never a white blast the take never carried)
  const alpha = 1 - Math.exp((-2 * Math.PI * noiseCutoffOf(frame.centroid)) / RECON_SAMPLE_RATE);
  const stages = [0, 0, 0, 0];
  const shaped = (input: number): number => {
    let carried = input;
    for (let stage = 0; stage < stages.length; stage++) {
      stages[stage] += alpha * (carried - stages[stage]);
      carried = stages[stage];
    }
    return carried;
  };
  const onsets = Math.max(0, Math.round(frame.onsetCount));
  const beats = frame.bpm > 0 ? Math.round(frame.bpm / 60) : 0;
  const count = Math.min(BURST_MAX, Math.max(onsets, beats));
  const decay = 0.012 + 0.048 * (1 - clamp(frame.brightness, 0, 1));
  if (count > 0) {
    const burstLength = Math.ceil(decay * 4 * RECON_SAMPLE_RATE);
    for (let burst = 0; burst < count; burst++) {
      const onset = Math.floor((burst / count) * second.length);
      const end = Math.min(second.length, onset + burstLength);
      for (let i = onset; i < end; i++) {
        const dt = (i - onset) / RECON_SAMPLE_RATE;
        let tonal = 0;
        for (const voice of voices) tonal += voice.amplitude * Math.sin(2 * Math.PI * voice.hz * dt + voice.phase);
        second[i] += (tonal * tonalScale + shaped(noise[i % noise.length] ?? 0) * noiseScale) * Math.exp(-dt / decay);
      }
    }
  } else {
    // the sustained wash — energy with no discrete onsets (the tones hold,
    // the noise floor runs, the same tone-versus-noise law)
    for (let i = 0; i < second.length; i++) {
      const t = i / RECON_SAMPLE_RATE;
      let tonal = 0;
      for (const voice of voices) tonal += voice.amplitude * Math.sin(2 * Math.PI * voice.hz * t + voice.phase);
      second[i] = tonal * tonalScale + shaped(noise[i] ?? 0) * noiseScale;
    }
  }
  scaleToRms(second, targetRms);
  return second;
}

/**
 * Reconstructs the pcm of a validated recon document — the reverse walk of
 * the descriptor lane, pure and deterministic: one second per frame, the
 * band seats splitting the energy between the two layers (the high-band
 * share rides the percussive layer, the rest the harmonic one — the
 * uncorrelated layers sum onto the frame's rms seat by the energy law),
 * every random draw riding the canonical seeded stream. An inactive frame
 * answers honest silence. The mix closes under the engine's own
 * deterministic true-peak limiter — the same law the render lane rides,
 * pinned at the cd rate here — so the writer never sees a clipped word.
 * The same document always answers the same pcm, the same seed and the
 * same checksums.
 *
 * @param doc the recon document (the contract gate runs first — a broken
 *   document throws ReconError honestly through the canonical serializer).
 * @returns the pcm, the seed and the identity checksums.
 */
export function renderReconPcm(doc: ReconDocument): ReconPcmRender {
  const canonical = serializeRecon(doc);
  const parsed = parseRecon(canonical);
  if (!parsed.ok) {
    // unreachable in practice (the serializer validated the same bytes) —
    // the guard keeps the walk honest against a hostile serializer
    throw new Error(`recon render: the canonical document refused its own parse (${parsed.code})`);
  }
  const seated = parsed.doc;
  const seed = `recon/3:${(hashSeed(canonical) >>> 0).toString(16).padStart(8, "0")}`;
  const pcm = new Float32Array(seated.frames.length * RECON_SAMPLE_RATE);
  for (const frame of seated.frames) {
    if (frame.active <= 0) continue; // the silence floor cleared — honest silence
    const start = frame.s * RECON_SAMPLE_RATE;
    if (start >= pcm.length) continue;
    const frameRng = mulberry32(hashSeed(`${seed}:${frame.s}`));
    // the layer weights: the band seats carry the energy split (the
    // high-band fraction rides the percussive layer; uncorrelated layers
    // sum onto the rms seat by the energy law h² + p² = total²)
    const percussiveShare = clamp(frame.bandHigh, 0, 1);
    const targetRms = clamp(frame.rms, 0, 1);
    const harmonicTarget = targetRms * Math.sqrt(1 - percussiveShare);
    const percussiveTarget = targetRms * Math.sqrt(percussiveShare);
    const harmonic = harmonicSecondOf(frame, frameRng, harmonicTarget);
    const percussive = percussiveSecondOf(frame, seed, frameRng, percussiveTarget);
    for (let i = 0; i < RECON_SAMPLE_RATE && start + i < pcm.length; i++) {
      pcm[start + i] = (harmonic[i] ?? 0) + (percussive[i] ?? 0);
    }
  }
  const mastered = limitTruePeak(pcm, RECON_SAMPLE_RATE);
  return {
    pcm: mastered,
    seed,
    checksums: {
      renderPcmHash: pcmhash(mastered),
      sourcePcmHash: seated.header.pcmhash,
      seedHash: hashSeed(seed),
    },
  };
}

/**
 * Reconstructs the wav of a validated recon document — the synthesis above
 * closed in the wavwriter's own container (mono pcm 16 at the 44100 cd
 * canon). Deterministic end to end: the same document always answers the
 * same bytes. THE ANTI-FAKE LAW rides the answer: the checksums identify
 * this render — a seed synthesis never reconstitutes the recorded pcm the
 * document measured (the blob lane owns those bytes); two renders with the
 * same renderPcmHash are the same synthesis, nothing more.
 *
 * @param doc the recon document.
 * @returns the wav bytes, the seed and the identity checksums.
 */
export function renderRecon(doc: ReconDocument): ReconWavRender {
  const rendered = renderReconPcm(doc);
  return {
    wav: encodeWav([rendered.pcm], { sampleRate: RECON_RENDER_SAMPLE_RATE, bitDepth: RECON_RENDER_BIT_DEPTH }),
    seed: rendered.seed,
    checksums: rendered.checksums,
  };
}

// ---------------------------------------------------------------------------
// the orchestrator (reconstruct -> encode -> store)
// ---------------------------------------------------------------------------

/** The machine codes the reconstruction answers: a document off the
 * debonair.recon/3 contract (bad-document — the serializer's own refusal
 * rides the message), the synthesis or the encode refusal (render-failed),
 * the store refusal (store-failed). */
export type ReconErrorCode = "bad-document" | "render-failed" | "store-failed";

/** The typed renderReconPlan answer — ok carries the pointer, the bytes, the
 * seed and the checksums; the error branch carries the machine code. */
export type ReconPlanResult =
  | {
      ok: true;
      wavPointer: RenderBlobPointer;
      bytes: Uint8Array;
      seed: string;
      checksums: ReconChecksums;
      durationSeconds: number;
    }
  | { ok: false; code: ReconErrorCode; message: string };

/** One progress report: the phase that just landed and the completed share
 * of the walk (0..1, ascending). */
export interface ReconJobProgress {
  /** The phase that completed. */
  phase: ReconPhase;
  /** The completed share of the pipeline. */
  fraction: number;
}

/** The progress callback — a hostile throw never breaks the job. */
export type ReconProgressCallback = (progress: ReconJobProgress) => void;

/** The readable message of any thrown failure. */
function errmsgof(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

/** The plan error branch builder. */
function planerr(code: ReconErrorCode, message: string): ReconPlanResult {
  return { ok: false, code, message };
}

/**
 * Renders one recon document end to end — the reconstruction's own walk:
 * the contract gate (the canonical serializer — a document off the
 * debonair.recon/3 law answers bad-document with its honest machine code),
 * the synthesis (reconstruct — the additive ola lane above), the wav encode
 * (encode — the wavwriter at the cd canon), the blob store put under
 * audio/wav (store). Every failure answers the typed result with a machine
 * code — never a throw. Deterministic: the same document answers the same
 * bytes on every machine (the seed rides the document's own canonical
 * bytes, never the job — a fresh job on the same document answers the same
 * take, the recon law the render lane's job-identity law deliberately
 * differs from).
 *
 * @param doc the recon document.
 * @param store the blob store the wav lands in.
 * @param onProgress the optional progress sink (one report per completed phase).
 * @returns the pointer, the bytes, the seed and the checksums, or the machine code.
 */
export async function renderReconPlan(
  doc: ReconDocument,
  store: RenderBlobStore,
  onProgress?: ReconProgressCallback,
): Promise<ReconPlanResult> {
  const report = (phase: ReconPhase): void => {
    if (!onProgress) return;
    try {
      onProgress({ phase, fraction: (RECON_PHASES.indexOf(phase) + 1) / RECON_PHASES.length });
    } catch {
      // a hostile callback never breaks the job — the answer matters more
    }
  };

  // phase: reconstruct — the contract gate, then the additive ola synthesis
  let rendered: ReconPcmRender;
  try {
    rendered = renderReconPcm(doc);
  } catch (error) {
    const message = errmsgof(error);
    if (error instanceof Error && error.name === "ReconError") {
      return planerr("bad-document", `the document failed the recon contract: ${message}`);
    }
    return planerr("render-failed", `the reconstruction lane faulted: ${message}`);
  }
  report("reconstruct");

  // phase: encode — the wavwriter at the cd canon, mono pcm 16
  let bytes: Uint8Array;
  try {
    bytes = encodeWav([rendered.pcm], { sampleRate: RECON_RENDER_SAMPLE_RATE, bitDepth: RECON_RENDER_BIT_DEPTH });
  } catch (error) {
    return planerr("render-failed", `the wavwriter refused the reconstruction: ${errmsgof(error)}`);
  }
  report("encode");

  // phase: store — the wav lands in the blob store under audio/wav
  let put: { ok: true; pointer: RenderBlobPointer } | { ok: false; code: string; message: string };
  try {
    put = await store.put(bytes, RECON_WAV_KIND);
  } catch (error) {
    return planerr("store-failed", `the store lane threw: ${errmsgof(error)}`);
  }
  if (!put.ok) return planerr("store-failed", `the store refused the wav: ${put.code} (${put.message})`);
  report("store");

  return {
    ok: true,
    wavPointer: put.pointer,
    bytes,
    seed: rendered.seed,
    checksums: rendered.checksums,
    durationSeconds: rendered.pcm.length / RECON_RENDER_SAMPLE_RATE,
  };
}

// ---------------------------------------------------------------------------
// the job walk (the caller loop drives it; the gateway binds the routes)
// ---------------------------------------------------------------------------

/** The environment the recon walk rides — all injected, the handlers pure
 * over it (the render lane's own env law; the recon walk reuses the same
 * ledger seat, the same store seam, the same clock). */
export interface ReconEnv {
  /** The blob store the reconstructed wav lands in. */
  store: RenderBlobStore;
  /** The render job ledger seat (the existing table — the recon walk rides
   * its own phase vocabulary on the same columns, the honest reuse the
   * miner lane's collect/mine/store rides on ingest_jobs). */
  jobs: RenderJobSeat;
  /** The iso clock the finishes stamp. */
  now: () => string;
}

/** The machine codes the walk answers: the ledger codes first (not-found,
 * conflict, ledger-failed), the render codes last (bad-document, the
 * renderReconPlan codes passthrough). */
export type ReconRunErrorCode =
  | "not-found" // no job row answers the id
  | "conflict" // the row's state refuses the move (the walk is one-shot)
  | "bad-document" // the queued payload fails the recon contract
  | "render-failed" // the synthesis or the encode refused
  | "store-failed" // the blob store refused the wav
  | "ledger-failed"; // the ledger seat refused a patch

/** The typed walk answer — ok carries the landed reconstruction (the wav
 * pointer, the byte count, the duration, the seed and the checksums), the
 * error branch carries the machine code. never a throw. */
export type ReconJobRun =
  | {
      ok: true;
      jobId: string;
      state: "done";
      wavPointer: string;
      bytes: number;
      durationSeconds: number;
      seed: string;
      checksums: ReconChecksums;
    }
  | { ok: false; code: ReconRunErrorCode; message: string };

/** The run error branch builder. */
function runerr(code: ReconRunErrorCode, message: string): ReconJobRun {
  return { ok: false, code, message };
}

/**
 * Starts one queued recon job — the render lane's own walk law over the
 * shared ledger: the state moves queued → rendering, every completed phase
 * patches the phase and the ascending fraction (the recon vocabulary —
 * reconstruct, encode, store), the wav lands in the blob store and the
 * walk lands done with the wav pointer (the track lane stays null — a
 * reconstruction is not a new take, it is the same take rebuilt; the
 * pointer chain the playback lane rides is the wav alone) or failed with
 * the honest error code. Unlike the render walk the take identity is NOT
 * the job id — the reconstruction is deterministic from the document (the
 * seed rides the canonical bytes), so two jobs over one document answer
 * the same wav, honestly. never a throw; a re-run of a landed job answers
 * conflict.
 *
 * @param env the injected environment (the store, the ledger seat, the clock).
 * @param jobId the queued job the route registered.
 * @returns the landed reconstruction, or the machine code of the refusing lane.
 */
export async function startReconJob(env: ReconEnv, jobId: string): Promise<ReconJobRun> {
  let row: RenderJobRow | null;
  try {
    row = env.jobs.getjob(jobId);
  } catch (error) {
    return runerr("ledger-failed", `the ledger refused the read: ${errmsgof(error)}`);
  }
  if (row === null) return runerr("not-found", `no job answers ${jobId}`);
  if (row.state !== "queued") {
    return runerr("conflict", `the job ${jobId} is ${row.state} — only a queued job starts`);
  }
  try {
    env.jobs.updatejob(jobId, { state: "rendering", fraction: 0 });
  } catch (error) {
    return runerr("ledger-failed", `the ledger refused the rendering patch: ${errmsgof(error)}`);
  }
  const fail = (code: ReconRunErrorCode, message: string): ReconJobRun => {
    try {
      env.jobs.updatejob(jobId, { state: "failed", error: `${code}: ${message}`, finished_at: env.now() });
    } catch {
      // a hostile ledger never breaks the answer — the failure lands in the run
    }
    return runerr(code, message);
  };

  // the queued payload: the canonical recon json the route serialized
  const parsed = parseRecon(row.plan_json);
  if (!parsed.ok) {
    return fail("bad-document", `the queued payload failed the recon contract (${parsed.code}): ${parsed.message}`);
  }
  const result = await renderReconPlan(parsed.doc, env.store, (progress) => {
    try {
      env.jobs.updatejob(jobId, { phase: progress.phase, fraction: progress.fraction });
    } catch {
      // a hostile ledger never breaks the run — the answer matters more
    }
  });
  if (!result.ok) return fail(result.code, result.message);

  try {
    env.jobs.updatejob(jobId, {
      state: "done",
      fraction: 1,
      wav_pointer: result.wavPointer.id,
      track_pointer: null,
      finished_at: env.now(),
    });
  } catch (error) {
    return runerr(
      "ledger-failed",
      `the ledger refused the done stamp (the wav ${result.wavPointer.id} landed): ${errmsgof(error)}`,
    );
  }
  return {
    ok: true,
    jobId,
    state: "done",
    wavPointer: result.wavPointer.id,
    bytes: result.bytes.length,
    durationSeconds: result.durationSeconds,
    seed: result.seed,
    checksums: result.checksums,
  };
}
