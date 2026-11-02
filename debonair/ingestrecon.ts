// # ingestrecon — the recon descriptor lane of the katexis engine (root
// layer, wave 16a): the measurement half of the debonair.recon/3 contract
// (reconpayload.ts owns the law, this file fills the seats). The lane wraps
// the existing ingest pipeline — one hpss separation, the ingest document
// (debonair.ingest/1, untouched — the recon never removes a fact from it),
// the per-second segment vectors — and adds the descriptors the recon
// frames seat: the 13-coefficient MFCC (dct-ii over the mel bands, imported
// from the timbre library — never re-implemented), the 32-window rms
// envelope statistics, the top-5 spectral peaks, the YIN fundamental notes
// (window 80 ms, hop 40 ms, the tonal layers only — the hpss harmonic stem
// is the layer detection the engine already owns), the per-second flux, the
// per-second krumhansl root with the 48-scale fit, and the per-second bpm
// (the sliding tempo curve of the rhythm library). One 4096-point FFT per
// signal per second is computed and shared by every spectral seat (mfcc,
// peaks, rolloff, slope, warmth, brightness, flux); the segment seats ride
// the ingest document the lane reuses, and the tempo lane rides the rhythm
// module's own onset stft (imported, not duplicated). Everything is pure
// math over the pcm — the same bytes always answer the same document, and
// the canonical serializer then answers the same json bytes (docs/recon.spec.md
// §9). Non-goals: no storage, no scheduling, no synthesis — the ladder's
// lower rungs own theirs. Pure and multi-mode — the browser and node agree.

import { SILENCE_RMS } from "./analyze.ts";
import { onsetEnvelope } from "./audiorhythm.ts";
import { bpmOverTime } from "./audiorhythmbeat.ts";
import { brightness, mfcc, rolloffSharpness, spectralSlope, warmthIndex } from "./audiotimbre.ts";
import { rmsEnvelope } from "./audiotimbreenv.ts";
import { resample } from "./audiodecode.ts";
import { spectralFlux } from "./audiospectrum.ts";
import { type StemPair, separate } from "./hpss.ts";
import { decompose, type IngestDocument, type IngestSegment, onsetSecondsOf, pcmhash, segmentsof } from "./ingest.ts";
import { PATTERN_SCALES, PATTERN_SCALE_NAMES } from "./patternenums.ts";
import {
  type ReconCorrelations,
  type ReconDocument,
  type ReconFrame,
  type ReconHeader,
  type ReconLayerFrame,
  RECON_LAYERS,
  RECON_SAMPLE_RATE,
  RECON_SCHEMA_VERSION,
  fnv1aNumbers,
} from "./reconpayload.ts";
import { FFT_SIZE, frameSpectrum, keyOf } from "./spectrum.ts";

// ---------------------------------------------------------------------------
// the descriptor constants (the window laws the frames ride)
// ---------------------------------------------------------------------------

/** The mel coefficient count the mfcc seats carry (the dct-ii front end of
 * the timbre library answers 13 by default — one number, one law). */
export const RECON_MFCC_COEFFICIENTS = 13;

/** The rms window count of the envelope seat — thirty-two windows per
 * second, seated as their statistics (mean, std, min, max, spread). */
export const RECON_ENVELOPE_WINDOWS = 32;

/** The spectral peak count the peak seats carry (the top five). */
export const RECON_SPECTRAL_PEAKS = 5;

/** The noise-floor guard of the peak lane: a candidate must clear this
 * fraction of the strongest bin (−60 db) — numerical leakage never seats a
 * partial, a pure sine answers its fundamental and four empty seats. */
export const RECON_PEAK_FLOOR = 1e-3;

/** The YIN analysis window, in ms (the f0 tracker's ear). */
export const RECON_YIN_WINDOW_MS = 80;

/** The YIN hop, in ms (half the window — the classic overlap). */
export const RECON_YIN_HOP_MS = 40;

/** The YIN absolute threshold on the cumulative mean normalized difference
 * (the de Cheveigné & Kawahara default — a dip under 0.1 is a period). */
export const RECON_YIN_THRESHOLD = 0.1;

/** The lowest fundamental the YIN lane trusts, hz (the bass register floor). */
export const RECON_YIN_MIN_HZ = 50;

/** The highest fundamental the YIN lane trusts, hz (above this a monophonic
 * voice is unlikely and the timbre seats tell the story instead). */
export const RECON_YIN_MAX_HZ = 1600;

/** The sliding tempo window of the per-second bpm seat, in ms (the shortest
 * honest window the tempo curve accepts — it must hold a pulse). */
export const RECON_BPM_WINDOW_MS = 2000;

/** The midi breakpoint under which the register law seats the bass family. */
export const RECON_BASS_MIDI_MAX = 48;

/** The midi breakpoint under which the register law seats the guitar family. */
export const RECON_GUITAR_MIDI_MAX = 72;

/** The layer dictionary seats of the two hpss stems (0 harmonic, 1 percussive). */
const HARMONIC_LAYER_ID = RECON_LAYERS.indexOf("harmonic");
const PERCUSSIVE_LAYER_ID = RECON_LAYERS.indexOf("percussive");

// ---------------------------------------------------------------------------
// the descriptor kernels (each one answers a frozen seat family)
// ---------------------------------------------------------------------------

/**
 * The 32-window rms envelope of one second, as its statistics — the frame's
 * envelope seats. The window law: size = hop = floor(sampleRate / 32), so
 * exactly thirty-two rectangular windows cover the second (the envelope
 * kernel of the timbre library — imported, never re-implemented).
 *
 * @param second the pcm of one second (sampleRate samples).
 * @param sampleRate the analysis rate.
 * @returns the five envelope statistics (mean, std, min, max, dynamic).
 */
export function reconEnvelope32(
  second: Float32Array,
  sampleRate: number,
): { mean: number; std: number; min: number; max: number; dynamic: number } {
  const window = Math.max(1, Math.floor(sampleRate / RECON_ENVELOPE_WINDOWS));
  const envelope = rmsEnvelope(second, { size: window, hop: window });
  if (envelope.length === 0) return { mean: 0, std: 0, min: 0, max: 0, dynamic: 0 };
  let sum = 0;
  let min = Infinity;
  let max = 0;
  for (const value of envelope) {
    sum += value;
    if (value < min) min = value;
    if (value > max) max = value;
  }
  const mean = sum / envelope.length;
  let squared = 0;
  for (const value of envelope) squared += (value - mean) * (value - mean);
  return { mean, std: Math.sqrt(squared / envelope.length), min, max, dynamic: max - min };
}

/**
 * The top-5 spectral peaks of one magnitude spectrum, interleaved
 * [hz0, mag0, hz1, mag1, …] — the frame's peak seats and the layer peak
 * stream. The peak law: a bin qualifies when it is a local maximum (it
 * holds its left neighbour and beats its right) and clears the noise-floor
 * guard (a thousandth of the strongest bin — numerical leakage never seats
 * a partial), candidates rank by magnitude (ties keep the lower bin),
 * magnitudes normalize by the frame's strongest bin, and absent peaks seat
 * zero — a pure sine answers its fundamental and four empty seats, honestly.
 *
 * @param magnitudes the shared magnitude spectrum of the second.
 * @param binHz the frequency per bin.
 * @returns ten numbers: five hz/mag pairs, strongest first.
 */
export function reconSpectralPeaks(magnitudes: readonly number[], binHz: number): number[] {
  const candidates: { bin: number; magnitude: number }[] = [];
  for (let bin = 1; bin < magnitudes.length - 1; bin++) {
    const magnitude = magnitudes[bin];
    if (magnitude <= 0) continue;
    if (magnitude >= magnitudes[bin - 1] && magnitude > magnitudes[bin + 1]) {
      candidates.push({ bin, magnitude });
    }
  }
  const strongest = candidates.reduce((max, candidate) => Math.max(max, candidate.magnitude), 0);
  const seated =
    strongest > 0 ? candidates.filter((candidate) => candidate.magnitude >= strongest * RECON_PEAK_FLOOR) : [];
  seated.sort((a, b) => b.magnitude - a.magnitude || a.bin - b.bin);
  const out = new Array<number>(RECON_SPECTRAL_PEAKS * 2).fill(0);
  for (let seat = 0; seat < RECON_SPECTRAL_PEAKS; seat++) {
    const candidate = seated[seat];
    if (candidate === undefined) break;
    out[seat * 2] = candidate.bin * binHz;
    out[seat * 2 + 1] = strongest > 0 ? candidate.magnitude / strongest : 0;
  }
  return out;
}

/**
 * The YIN fundamental notes of one pcm slice — the midi note lane of the
 * tonal layers. The algorithm is the classic de Cheveigné & Kawahara YIN:
 * the squared difference function per lag (computed lazily — the cumsum
 * walks from lag 1 and the search stops at the first dip under the
 * threshold, so high voices pay little), the cumulative mean normalized
 * difference, the absolute threshold 0.1 with the descent to the local
 * minimum, parabolic interpolation on the normalized difference, and the
 * silence gate. Consecutive frames within half a semitone merge into one
 * note (the first onset, the loudest velocity); the answer is the flat
 * triple list [midi, onset, vel, …] with the onset seated 0..1 in the slice.
 *
 * @param pcm the tonal layer's pcm.
 * @param sampleRate the analysis rate.
 * @param from the first sample of the slice.
 * @param to the end of the slice (exclusive).
 * @returns the note triples, time-ascending.
 */
export function reconYinNotes(pcm: Float32Array, sampleRate: number, from: number, to: number): number[] {
  const window = Math.max(2, Math.round((RECON_YIN_WINDOW_MS / 1000) * sampleRate));
  const hop = Math.max(1, Math.round((RECON_YIN_HOP_MS / 1000) * sampleRate));
  const minLag = Math.max(1, Math.ceil(sampleRate / RECON_YIN_MAX_HZ));
  const maxLag = Math.min(window - 2, Math.floor(sampleRate / RECON_YIN_MIN_HZ));
  const span = Math.max(0, to - from);
  if (maxLag <= minLag || span < window) return [];
  const notes: number[] = [];
  let openMidi = -1;
  let openOnset = 0;
  let openVel = 0;
  const closeOpen = () => {
    if (openMidi >= 0) notes.push(openMidi, openOnset, openVel);
    openMidi = -1;
  };
  for (let start = from; start + window <= to; start += hop) {
    // the silence gate — a quiet frame carries no honest fundamental
    let energy = 0;
    for (let i = 0; i < window; i++) energy += pcm[start + i] * pcm[start + i];
    const frameRms = Math.sqrt(energy / window);
    if (frameRms <= SILENCE_RMS) {
      closeOpen();
      continue;
    }
    // the cumulative mean normalized difference, computed lazily: the cumsum
    // walks from lag 1 (the honest denominator) and stops at the first dip
    // under the threshold — the descent may extend it one lag at a time
    const raw = new Float64Array(maxLag + 1);
    const normalizedTable = new Float64Array(maxLag + 1);
    let computed = 0;
    let cumulative = 0;
    const ensure = (lag: number): number => {
      while (computed < lag) {
        computed++;
        let sum = 0;
        for (let i = 0; i < window - computed; i++) {
          const delta = pcm[start + i] - pcm[start + i + computed];
          sum += delta * delta;
        }
        raw[computed] = sum;
        cumulative += sum;
        normalizedTable[computed] = cumulative > 1e-30 ? (sum * computed) / cumulative : 0;
      }
      return normalizedTable[lag];
    };
    let tauStar = -1;
    for (let lag = minLag; lag <= maxLag; lag++) {
      if (ensure(lag) < RECON_YIN_THRESHOLD) {
        tauStar = lag;
        break;
      }
    }
    let period = -1;
    if (tauStar >= 0) {
      // descend to the local minimum under the threshold
      period = tauStar;
      while (period + 1 <= maxLag && ensure(period + 1) < normalizedTable[period]) period++;
    } else {
      // nothing under the strict threshold — the global dip serves when it
      // is still a strong period (the honest tolerance of the lane)
      ensure(maxLag);
      let best = minLag;
      let bestValue = normalizedTable[minLag];
      for (let lag = minLag + 1; lag <= maxLag; lag++) {
        if (normalizedTable[lag] < bestValue) {
          bestValue = normalizedTable[lag];
          best = lag;
        }
      }
      if (bestValue < RECON_YIN_THRESHOLD * 5) period = best;
    }
    if (period < minLag) {
      closeOpen();
      continue;
    }
    // the parabolic interpolation on the normalized difference
    const left = period > 1 ? normalizedTable[period - 1] : 1;
    const right = period < maxLag ? ensure(period + 1) : normalizedTable[period];
    const denominator = left - 2 * normalizedTable[period] + right;
    const shift = denominator < 0 ? Math.max(-0.5, Math.min(0.5, (0.5 * (left - right)) / denominator)) : 0;
    const hz = sampleRate / (period + shift);
    if (hz < RECON_YIN_MIN_HZ || hz > RECON_YIN_MAX_HZ) {
      closeOpen();
      continue;
    }
    const midi = 69 + 12 * Math.log2(hz / 440);
    const onset = span > 0 ? (start - from) / span : 0;
    const vel = Math.min(1, frameRms);
    if (openMidi >= 0 && Math.abs(midi - openMidi) < 0.5) {
      openVel = Math.max(openVel, vel);
    } else {
      closeOpen();
      openMidi = midi;
      openOnset = onset;
      openVel = vel;
    }
  }
  closeOpen();
  return notes;
}

/**
 * The best 48-scale fit at one root — the frame's scaleType seat. The fit
 * law: every scale of the pattern vocabulary scores its captured-minus-
 * leaked chroma energy (the degrees inside the scale minus the degrees
 * outside it, at the rotation the root seats); the highest score wins and
 * ties keep the lowest id (the library carries honest aliases — maj7
 * mirrors major — and the lowest id is the canonical spelling).
 *
 * @param chroma the twelve-bin chroma of the second.
 * @param root the krumhansl root the scale rotates on.
 * @returns the scale id 0..47.
 */
export function reconScaleFit(chroma: readonly number[], root: number): number {
  let bestId = 0;
  let bestScore = -Infinity;
  for (const [id, name] of PATTERN_SCALE_NAMES.entries()) {
    const intervals = PATTERN_SCALES[name];
    let inside = 0;
    for (const degree of intervals) inside += chroma[(root + degree) % 12] ?? 0;
    const outside = chroma.reduce((sum, value) => sum + value, 0) - inside;
    const score = inside - outside;
    if (score > bestScore) {
      bestScore = score;
      bestId = id;
    }
  }
  return bestId;
}

/**
 * The per-second tempo series — the frame's bpm seat. The tempo law: the
 * rhythm library's onset envelope (its own 1024-point stft — the rhythm
 * lane's kernel, imported) feeds the sliding bpmOverTime curve (a 2-second
 * window advanced half a window); every second seats the bpm of the window
 * whose center sits nearest, zero when no window held a pulse. Never one
 * global value — the header's median and mean ride this series.
 *
 * @param pcm the mix pcm.
 * @param sampleRate the analysis rate.
 * @param seconds the whole seconds the frames cover.
 * @returns one bpm per second.
 */
export function reconBpmPerSecond(pcm: Float32Array, sampleRate: number, seconds: number): number[] {
  const out = new Array<number>(seconds).fill(0);
  if (pcm.length < 1024 || seconds <= 0) return out;
  let envelope: Float32Array;
  let frameMs = 0;
  try {
    const lane = onsetEnvelope(pcm, sampleRate);
    envelope = lane.envelope;
    frameMs = lane.frameMs;
  } catch {
    return out;
  }
  const points = bpmOverTime(envelope, frameMs, RECON_BPM_WINDOW_MS);
  if (points.length === 0) return out;
  for (let s = 0; s < seconds; s++) {
    const center = (s + 0.5) * 1000;
    let nearest = points[0];
    let nearestDistance = Math.abs(points[0].tMs - center);
    for (const point of points) {
      const distance = Math.abs(point.tMs - center);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearest = point;
      }
    }
    out[s] = nearest.bpm;
  }
  return out;
}

// ---------------------------------------------------------------------------
// the conversion lane (ingest/1 → recon/3, the converter contract)
// ---------------------------------------------------------------------------

/** The text-seat overrides and the take identity the converter accepts. */
export interface ReconOptions {
  /** The display name (reconOf requires it; reconFromIngest defaults to the ingest document's). */
  name?: string;
  /** The iso instant the wrapped ingest document stamps (reconOf only). */
  at?: string;
  /** The meter seat — a dictionary value, default "4/4". */
  timeSignature?: string;
  /** The encoding seat — a dictionary value, default "pcm16". */
  encoding?: string;
  /** The mime seat — a dictionary value, default "audio/wav". */
  mimeType?: string;
  /** The instrument seat — a dictionary value, default "mix". */
  instrumentName?: string;
  /** The family seat — a dictionary value; the default answers the register law. */
  instrumentFamily?: string;
}

/** The block rms of a pcm slice — the envelope kernel's one-window reading
 * (size = hop = the whole slice), the dominance measure the register law rides. */
function blockRms(pcm: Float32Array): number {
  if (pcm.length < 1) return 0;
  const envelope = rmsEnvelope(pcm, { size: pcm.length, hop: pcm.length });
  return envelope[0] ?? 0;
}

/** The mean of a series (0 when empty). */
function meanOf(values: readonly number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

/** The median of a series (0 when empty; the mean of the two middles when even). */
function medianOf(values: readonly number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = sorted.length >> 1;
  return sorted.length % 2 === 1 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

/** The population standard deviation of a series (0 when empty). */
function stdOf(values: readonly number[]): number {
  if (values.length < 2) return 0;
  const mean = meanOf(values);
  return Math.sqrt(meanOf(values.map((value) => (value - mean) * (value - mean))));
}

/** The statistical mode of a series of small ids, ties keeping the lowest id. */
function modeIdOf(values: readonly number[]): number {
  const counts = new Map<number, number>();
  for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1);
  let bestId = 0;
  let bestCount = 0;
  for (const id of [...counts.keys()].sort((a, b) => a - b)) {
    const count = counts.get(id) ?? 0;
    if (count > bestCount) {
      bestCount = count;
      bestId = id;
    }
  }
  return bestId;
}

/** Rounds to four decimals (the canonical number law of the serializer). */
function round4(x: number): number {
  return Math.round(x * 10000) / 10000;
}

/** The first FFT_SIZE samples of a second as a plain array (the shared
 * first-window law the ingest segments ride — zero-padded when short). */
function secondWindow(second: Float32Array): number[] {
  const window = new Array<number>(FFT_SIZE).fill(0);
  for (let i = 0; i < FFT_SIZE && i < second.length; i++) window[i] = second[i];
  return window;
}

/**
 * Builds the recon document over a decomposition the caller owns — the one
 * constructor the reconOf and reconFromIngest lanes share. The pcm must sit
 * at the canon rate (the resample happens before this door); the segment
 * seats map the ingest lane's per-second vectors (at the canon rate they
 * are the decomposition's own numbers — zero recompute), the descriptor
 * seats ride one shared FFT per signal per second, and the header answers
 * the aggregates, the modes and the identity hashes.
 *
 * @param name the display name of the take.
 * @param mono the mix pcm at RECON_SAMPLE_RATE.
 * @param harmonic the harmonic stem pcm at RECON_SAMPLE_RATE.
 * @param percussive the percussive stem pcm at RECON_SAMPLE_RATE.
 * @param segments the per-second segment vectors at RECON_SAMPLE_RATE.
 * @param options the text-seat overrides.
 * @returns the debonair.recon/3 document.
 */
function buildRecon(
  name: string,
  mono: Float32Array,
  harmonic: Float32Array,
  percussive: Float32Array,
  segments: readonly IngestSegment[],
  options: ReconOptions,
): ReconDocument {
  const sampleRate = RECON_SAMPLE_RATE;
  const seconds = segments.length;
  const bpmSeries = reconBpmPerSecond(mono, sampleRate, seconds);
  const frames: ReconFrame[] = [];
  const mixSpectra: Float32Array[] = [];
  const rawFlux: number[] = [];
  for (let s = 0; s < seconds; s++) {
    const segment = segments[s];
    const start = s * sampleRate;
    const second = mono.subarray(start, start + sampleRate);
    // the one shared fft of the second — every spectral seat reads it (the
    // mfcc, the peaks, the timbre indices, the flux)
    const spectrum = frameSpectrum(secondWindow(second), sampleRate);
    const magnitudes = Float32Array.from(spectrum.magnitudes);
    mixSpectra.push(magnitudes);
    rawFlux.push(s === 0 ? 0 : spectralFlux(magnitudes, mixSpectra[s - 1]));
    // the mfcc seats: the dct-ii front end of the timbre library over the
    // shared spectrum — computed once per second, shared by the seats
    const coefficients = mfcc(spectrum.magnitudes, sampleRate, { coefficients: RECON_MFCC_COEFFICIENTS });
    const [mc0, mc1, mc2, mc3, mc4, mc5, mc6, mc7, mc8, mc9, mc10, mc11, mc12] = [...coefficients];
    // the mix peak seats: the top-5 of the shared spectrum
    const [h0, m0, h1, m1, h2, m2, h3, m3, h4, m4] = reconSpectralPeaks(spectrum.magnitudes, spectrum.binHz);
    // the envelope seats: the 32-window statistics of the second
    const envelope = reconEnvelope32(second, sampleRate);
    // the chroma seats: the segment's wheel normalized to unit sum (the
    // clamp law seats proportions, the rms seat keeps the level)
    const chromaSum = segment.chroma.reduce((sum, value) => sum + value, 0);
    const wheel = segment.chroma.map((value) => (chromaSum > 0 ? value / chromaSum : 0));
    const scaleRoot = keyOf(segment.chroma).tonic;
    // the layer lane: the per-track exception (peaks per layer, the yin
    // notes on the tonal harmonic stem only)
    const harmonicSecond = harmonic.subarray(start, start + sampleRate);
    const percussiveSecond = percussive.subarray(start, start + sampleRate);
    const harmonicSpectrum = frameSpectrum(secondWindow(harmonicSecond), sampleRate);
    const percussiveSpectrum = frameSpectrum(secondWindow(percussiveSecond), sampleRate);
    const notes = reconYinNotes(harmonic, sampleRate, start, start + sampleRate);
    const layers: ReconLayerFrame[] = [
      {
        layerId: HARMONIC_LAYER_ID,
        spectralPeaks: reconSpectralPeaks(harmonicSpectrum.magnitudes, harmonicSpectrum.binHz).map(round4),
        midiNotes: notes.map(round4),
      },
      {
        layerId: PERCUSSIVE_LAYER_ID,
        spectralPeaks: reconSpectralPeaks(percussiveSpectrum.magnitudes, percussiveSpectrum.binHz).map(round4),
        midiNotes: [],
      },
    ];
    // the note statistics over the tonal notes of the second
    const midiValues: number[] = [];
    for (let triple = 0; triple < notes.length; triple += 3) midiValues.push(notes[triple]);
    const frame: ReconFrame = {
      s,
      active: segment.rms > SILENCE_RMS ? 1 : 0,
      rms: segment.rms,
      peak: segment.peak,
      zcr: segment.zcr,
      centroid: segment.cent,
      flatness: segment.flat,
      flux: 0,
      rolloff: round4(rolloffSharpness(spectrum.magnitudes)),
      slope: round4(spectralSlope(spectrum.magnitudes, sampleRate)),
      warmth: round4(warmthIndex(spectrum.magnitudes, sampleRate)),
      brightness: round4(brightness(spectrum.magnitudes, sampleRate)),
      beatStrength: segment.beat,
      onsetCount: segment.onsets,
      bandLow: segment.bands[0] ?? 0,
      bandMid: segment.bands[1] ?? 0,
      bandHigh: segment.bands[2] ?? 0,
      chroma0: round4(wheel[0] ?? 0),
      chroma1: round4(wheel[1] ?? 0),
      chroma2: round4(wheel[2] ?? 0),
      chroma3: round4(wheel[3] ?? 0),
      chroma4: round4(wheel[4] ?? 0),
      chroma5: round4(wheel[5] ?? 0),
      chroma6: round4(wheel[6] ?? 0),
      chroma7: round4(wheel[7] ?? 0),
      chroma8: round4(wheel[8] ?? 0),
      chroma9: round4(wheel[9] ?? 0),
      chroma10: round4(wheel[10] ?? 0),
      chroma11: round4(wheel[11] ?? 0),
      mfcc0: round4(mc0),
      mfcc1: round4(mc1),
      mfcc2: round4(mc2),
      mfcc3: round4(mc3),
      mfcc4: round4(mc4),
      mfcc5: round4(mc5),
      mfcc6: round4(mc6),
      mfcc7: round4(mc7),
      mfcc8: round4(mc8),
      mfcc9: round4(mc9),
      mfcc10: round4(mc10),
      mfcc11: round4(mc11),
      mfcc12: round4(mc12),
      envelopeMean: round4(envelope.mean),
      envelopeStd: round4(envelope.std),
      envelopeMin: round4(envelope.min),
      envelopeMax: round4(envelope.max),
      envelopeDynamic: round4(envelope.dynamic),
      bpm: round4(bpmSeries[s] ?? 0),
      scaleRoot,
      scaleType: reconScaleFit(segment.chroma, scaleRoot),
      pcmhash: pcmhash(second),
      spectralPeaksHash: fnv1aNumbers([
        layers[0].layerId,
        ...layers[0].spectralPeaks,
        layers[1].layerId,
        ...layers[1].spectralPeaks,
      ]),
      midiNotesHash: fnv1aNumbers([layers[0].layerId, ...layers[0].midiNotes]),
      peakHz0: round4(h0),
      peakHz1: round4(h1),
      peakHz2: round4(h2),
      peakHz3: round4(h3),
      peakHz4: round4(h4),
      peakMag0: round4(m0),
      peakMag1: round4(m1),
      peakMag2: round4(m2),
      peakMag3: round4(m3),
      peakMag4: round4(m4),
      noteCount: midiValues.length,
      noteMidiMean: midiValues.length > 0 ? round4(meanOf(midiValues)) : 0,
      noteMidiRange: midiValues.length > 1 ? round4(Math.max(...midiValues) - Math.min(...midiValues)) : 0,
      layers,
    };
    frames.push(frame);
  }
  // the flux normalization: the series folds to 0..1 by its own maximum
  const fluxMax = Math.max(...rawFlux, 0);
  for (const frame of frames) frame.flux = round4(fluxMax > 0 ? (rawFlux[frame.s] ?? 0) / fluxMax : 0);
  const header = headerOf(name, mono, harmonic, percussive, frames, options);
  return { header, frames, correlations: correlationsOf(frames) };
}

/**
 * The header of the recon document — the manifest seats, the time
 * aggregates (the mean over the frames of every shared seat), the opening
 * tonality, the statistical modes, the median tempo and the identity hashes.
 *
 * @param name the display name.
 * @param mono the mix pcm at the canon rate.
 * @param harmonic the harmonic stem pcm.
 * @param percussive the percussive stem pcm.
 * @param frames the per-second frames.
 * @param options the text-seat overrides.
 * @returns the 76-seat header.
 */
function headerOf(
  name: string,
  mono: Float32Array,
  harmonic: Float32Array,
  percussive: Float32Array,
  frames: readonly ReconFrame[],
  options: ReconOptions,
): ReconHeader {
  const active = frames.filter((frame) => frame.active > 0);
  const opening = active[0];
  const aggregate = (seat: keyof ReconFrame): number =>
    frames.length > 0 ? round4(meanOf(frames.map((frame) => frame[seat] as number))) : 0;
  const family = options.instrumentFamily ?? reconFamilyOf(frames, blockRms(harmonic), blockRms(percussive));
  return {
    schema: RECON_SCHEMA_VERSION,
    name,
    mimeType: options.mimeType ?? "audio/wav",
    encoding: options.encoding ?? "pcm16",
    timeSignature: options.timeSignature ?? "4/4",
    instrumentName: options.instrumentName ?? "mix",
    instrumentFamily: family,
    sampleRate: RECON_SAMPLE_RATE,
    durationSeconds: round4(mono.length / RECON_SAMPLE_RATE),
    bpmMedian: round4(medianOf(frames.map((frame) => frame.bpm))),
    mostUsedScaleId: modeIdOf(active.map((frame) => frame.scaleType)),
    mostUsedKeyId: modeIdOf(active.map((frame) => frame.scaleRoot)),
    rms: aggregate("rms"),
    peak: aggregate("peak"),
    zcr: aggregate("zcr"),
    centroid: aggregate("centroid"),
    flatness: aggregate("flatness"),
    flux: aggregate("flux"),
    rolloff: aggregate("rolloff"),
    slope: aggregate("slope"),
    warmth: aggregate("warmth"),
    brightness: aggregate("brightness"),
    beatStrength: aggregate("beatStrength"),
    onsetCount: aggregate("onsetCount"),
    bandLow: aggregate("bandLow"),
    bandMid: aggregate("bandMid"),
    bandHigh: aggregate("bandHigh"),
    chroma0: aggregate("chroma0"),
    chroma1: aggregate("chroma1"),
    chroma2: aggregate("chroma2"),
    chroma3: aggregate("chroma3"),
    chroma4: aggregate("chroma4"),
    chroma5: aggregate("chroma5"),
    chroma6: aggregate("chroma6"),
    chroma7: aggregate("chroma7"),
    chroma8: aggregate("chroma8"),
    chroma9: aggregate("chroma9"),
    chroma10: aggregate("chroma10"),
    chroma11: aggregate("chroma11"),
    mfcc0: aggregate("mfcc0"),
    mfcc1: aggregate("mfcc1"),
    mfcc2: aggregate("mfcc2"),
    mfcc3: aggregate("mfcc3"),
    mfcc4: aggregate("mfcc4"),
    mfcc5: aggregate("mfcc5"),
    mfcc6: aggregate("mfcc6"),
    mfcc7: aggregate("mfcc7"),
    mfcc8: aggregate("mfcc8"),
    mfcc9: aggregate("mfcc9"),
    mfcc10: aggregate("mfcc10"),
    mfcc11: aggregate("mfcc11"),
    mfcc12: aggregate("mfcc12"),
    envelopeMean: aggregate("envelopeMean"),
    envelopeStd: aggregate("envelopeStd"),
    envelopeMin: aggregate("envelopeMin"),
    envelopeMax: aggregate("envelopeMax"),
    envelopeDynamic: aggregate("envelopeDynamic"),
    bpm: aggregate("bpm"),
    scaleRoot: opening?.scaleRoot ?? 0,
    scaleType: opening?.scaleType ?? 0,
    pcmhash: pcmhash(mono),
    spectralPeaksHash: fnv1aNumbers(frames.flatMap((frame) => [frame.s, frame.spectralPeaksHash])),
    midiNotesHash: fnv1aNumbers(frames.flatMap((frame) => [frame.s, frame.midiNotesHash])),
    peakHz0: aggregate("peakHz0"),
    peakHz1: aggregate("peakHz1"),
    peakHz2: aggregate("peakHz2"),
    peakHz3: aggregate("peakHz3"),
    peakHz4: aggregate("peakHz4"),
    peakMag0: aggregate("peakMag0"),
    peakMag1: aggregate("peakMag1"),
    peakMag2: aggregate("peakMag2"),
    peakMag3: aggregate("peakMag3"),
    peakMag4: aggregate("peakMag4"),
    noteCount: aggregate("noteCount"),
    noteMidiMean: aggregate("noteMidiMean"),
    noteMidiRange: aggregate("noteMidiRange"),
  };
}

/**
 * The register law — the family seat. The tonal register decides first: a
 * mean midi under 48 seats bass, under 72 seats guitar, above seats vocal
 * (the monophonic families the note lane serves). Without notes the energy
 * decides: a percussive-dominant take seats percussion, a sustained tonal
 * one seats pad. A decision the engine recomputes from the frames.
 *
 * @param frames the per-second frames (the note seats are all it reads).
 * @param harmonicRms the harmonic stem's block rms.
 * @param percussiveRms the percussive stem's block rms.
 * @returns the family name (a dictionary seat).
 */
export function reconFamilyOf(
  frames: ReadonlyArray<Pick<ReconFrame, "noteCount" | "noteMidiMean">>,
  harmonicRms: number,
  percussiveRms: number,
): string {
  const sung = frames.filter((frame) => frame.noteCount > 0);
  if (sung.length > 0) {
    const register = meanOf(sung.map((frame) => frame.noteMidiMean));
    if (register < RECON_BASS_MIDI_MAX) return "bass";
    if (register < RECON_GUITAR_MIDI_MAX) return "guitar";
    return "vocal";
  }
  return percussiveRms > harmonicRms ? "percussion" : "pad";
}

/**
 * The four named correlations — the whole-track relations the frames'
 * series answer (docs/recon.spec.md §10): the tempo drift, the transition
 * assertion, the distortion trajectory identity and the pitch slope.
 *
 * @param frames the per-second frames.
 * @returns the correlation block.
 */
function correlationsOf(frames: readonly ReconFrame[]): ReconCorrelations {
  const bpms = frames.map((frame) => frame.bpm);
  const bpmMean = meanOf(bpms);
  const tempoFluctuationIndex = bpmMean > 0 ? round4(Math.min(1, stdOf(bpms) / bpmMean)) : 0;
  const fluxes = frames.map((frame) => frame.flux);
  const fluxMax = Math.max(...fluxes, 0);
  const spectralTransitionConfidence = fluxMax > 0 ? round4(Math.min(1, meanOf(fluxes) / fluxMax)) : 0;
  const harmonicDistortionStateHash = fnv1aNumbers(
    frames.flatMap((frame) => [frame.flatness, frame.peak, frame.warmth]),
  );
  const sung = frames.filter((frame) => frame.noteCount > 0);
  let pitchTrajectorySlope = 0;
  if (sung.length >= 2) {
    const meanS = meanOf(sung.map((frame) => frame.s));
    const meanMidi = meanOf(sung.map((frame) => frame.noteMidiMean));
    let numerator = 0;
    let denominator = 0;
    for (const frame of sung) {
      numerator += (frame.s - meanS) * (frame.noteMidiMean - meanMidi);
      denominator += (frame.s - meanS) * (frame.s - meanS);
    }
    pitchTrajectorySlope = denominator > 0 ? round4(numerator / denominator) : 0;
  }
  return { tempoFluctuationIndex, spectralTransitionConfidence, harmonicDistortionStateHash, pitchTrajectorySlope };
}

/** Carries one mono pcm to the canon rate (the identity shortcut answers
 * the same object when the rate already sits at 44100). */
function toCanonRate(mono: Float32Array, sampleRate: number): Float32Array {
  if (sampleRate === RECON_SAMPLE_RATE) return mono;
  return resample({ samples: mono, sampleRate, channels: 1, length: mono.length }, RECON_SAMPLE_RATE).samples;
}

/**
 * Converts an existing decomposition into the recon document — the
 * converter the ingest lane calls when the separation already happened
 * (the worker, the bench): the ingest document names the take, the pcms
 * feed the descriptors, and nothing is removed from the ingest document
 * (the debonair.ingest/1 record stays whole beside the recon/3 canon). A
 * source off the canon rate is resampled to 44100 and the segment vectors
 * recompute at the canon (the ingest document's own numbers stay untouched).
 *
 * @param doc the ingest document (debonair.ingest/1) of the decomposition.
 * @param mono the mix pcm of the document.
 * @param harmonic the harmonic stem pcm.
 * @param percussive the percussive stem pcm.
 * @param options the text-seat overrides.
 * @returns the debonair.recon/3 document.
 */
export function reconFromIngest(
  doc: IngestDocument,
  mono: Float32Array,
  harmonic: Float32Array,
  percussive: Float32Array,
  options: ReconOptions = {},
): ReconDocument {
  const monoCanon = toCanonRate(mono, doc.sampleRate);
  const harmonicCanon = toCanonRate(harmonic, doc.sampleRate);
  const percussiveCanon = toCanonRate(percussive, doc.sampleRate);
  const segments =
    doc.sampleRate === RECON_SAMPLE_RATE
      ? doc.segments
      : segmentsof(monoCanon, RECON_SAMPLE_RATE, onsetSecondsOf(monoCanon, RECON_SAMPLE_RATE));
  return buildRecon(options.name ?? doc.name, monoCanon, harmonicCanon, percussiveCanon, segments, options);
}

/**
 * Decomposes one mono pcm into the recon document — the standalone lane:
 * one hpss separation, the full ingest document (the same bytes the
 * ingestPcm path answers), then the descriptors over the mix and the
 * stems. Deterministic end to end: the same pcm always answers the same
 * document, whatever the source rate (the off-canon sources resample to
 * 44100 first — the cd law of docs/recon.spec.md §8).
 *
 * @param mono the decoded pcm (any sample rate).
 * @param sampleRate the rate of the pcm.
 * @param options the take identity (the name is required) and the seat overrides.
 * @returns the debonair.recon/3 document.
 */
export function reconOf(
  mono: Float32Array,
  sampleRate: number,
  options: ReconOptions & { name: string },
): ReconDocument {
  const monoCanon = toCanonRate(mono, sampleRate);
  const stems: StemPair = separate(monoCanon);
  const { doc } = decompose(monoCanon, stems, RECON_SAMPLE_RATE, { name: options.name, at: options.at });
  return buildRecon(options.name, monoCanon, stems.harmonic, stems.percussive, doc.segments, options);
}

/**
 * The per-track stream view of a recon document — the spectralPeaksStream
 * and the midiNotes the track-only exception seats (docs/recon.spec.md §4):
 * the per-second layer entries of one track concatenated in time order.
 *
 * @param doc the recon document.
 * @param layerId the track (0 harmonic, 1 percussive).
 * @returns the concatenated peak pairs and note triples of the track.
 */
export function trackStreamOf(doc: ReconDocument, layerId: number): { spectralPeaks: number[]; midiNotes: number[] } {
  const spectralPeaks: number[] = [];
  const midiNotes: number[] = [];
  for (const frame of doc.frames) {
    const layer = frame.layers.find((entry) => entry.layerId === layerId);
    if (layer === undefined) continue;
    spectralPeaks.push(...layer.spectralPeaks);
    midiNotes.push(...layer.midiNotes);
  }
  return { spectralPeaks, midiNotes };
}
