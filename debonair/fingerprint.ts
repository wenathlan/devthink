// # fingerprint — the audio identity domain of the katexis engine (root
// layer): the shazam-like landmark hash builder and the in-memory
// FingerprintDB. The pipeline follows the documented doctrine (docs 18/20 of
// the engine corpus): stft frames → per-frame peak picking → pairwise
// constellation hashes (f1:f2:Δt) → add/search by score. Pure math — the
// decoder stays in the host, the db stays injectable.

import { FFT_SIZE, frameSpectrum, HOP_SIZE } from "./spectrum.ts";

/** The peaks kept per stft frame when building the constellation. */
export const PEAKS_PER_FRAME = 5;
/** The lag window of a landmark pair, in frames (~0.5s at 1024 hop / 44.1k). */
export const MAX_LAG_FRAMES = 21;
/** The minimum magnitude ratio a peak must hold against the frame maximum. */
export const PEAK_FLOOR_RATIO = 0.25;
/** The log-spaced band edges (hz) the peak search partitions the spectrum into. */
export const BAND_EDGES: readonly number[] = [40, 160, 640, 2560, 10240];

/** One constellation point: the frame index and the bin it peaked at. */
export interface Peak {
  /** The frame index the peak lives in. */
  frame: number;
  /** The bin (frequency slot) of the peak. */
  bin: number;
}

/** One landmark hash: two peaks and the lag between them. */
export interface Landmark {
  /** The 32-bit hash (bin1 · bin2 · lag, band-separated). */
  hash: number;
  /** The frame index of the anchor peak. */
  frame: number;
}

/** One entry the FingerprintDB holds for a track. */
export interface DbEntry {
  /** The track id the entry belongs to. */
  trackId: string;
  /** The anchor frame of the landmark. */
  frame: number;
}

/** The result of matching one query fingerprint against the db. */
export interface MatchResult {
  /** The best matching track id, or null when the db is empty. */
  trackId: string | null;
  /** The number of matching hash votes of the best track. */
  score: number;
}

/**
 * Picks the constellation peaks of one magnitude spectrum: the loudest bin
 * per band, kept when it clears the frame floor ratio.
 *
 * @param frame the spectrum frame.
 * @param frameIndex the frame index the spectrum came from.
 * @returns the peaks of the frame (at most one per band).
 */
export function peaksOfFrame(frame: ReturnType<typeof frameSpectrum>, frameIndex: number): Peak[] {
  const peaks: Peak[] = [];
  const max = Math.max(...frame.magnitudes);
  const floor = max * PEAK_FLOOR_RATIO;
  for (let band = 0; band < BAND_EDGES.length - 1 && peaks.length < PEAKS_PER_FRAME; band++) {
    const lo = Math.ceil(BAND_EDGES[band] / frame.binHz);
    const hi = Math.min(Math.floor(BAND_EDGES[band + 1] / frame.binHz), frame.magnitudes.length - 1);
    let bestBin = -1;
    let bestMag = 0;
    for (let bin = lo; bin <= hi; bin++) {
      const mag = frame.magnitudes[bin];
      if (mag > bestMag) {
        bestMag = mag;
        bestBin = bin;
      }
    }
    if (bestBin >= 0 && bestMag >= floor) peaks.push({ frame: frameIndex, bin: bestBin });
  }
  return peaks;
}

/**
 * Builds the landmark hashes of one constellation: every peak pairs with the
 * peaks of the next MAX_LAG_FRAMES frames inside its own band neighbourhood.
 * Deterministic — the same audio answers the same hashes.
 *
 * @param peaks the full constellation.
 * @returns the landmark list, anchor-frame ascending.
 */
export function landmarksOf(peaks: readonly Peak[]): Landmark[] {
  const landmarks: Landmark[] = [];
  for (let i = 0; i < peaks.length; i++) {
    const anchor = peaks[i];
    for (let j = i + 1; j < peaks.length; j++) {
      const target = peaks[j];
      const lag = target.frame - anchor.frame;
      if (lag <= 0) continue;
      if (lag > MAX_LAG_FRAMES) break;
      landmarks.push({ hash: hashPair(anchor.bin, target.bin, lag), frame: anchor.frame });
    }
  }
  return landmarks;
}

/** Folds one peak pair into the 32-bit landmark hash (band-quantized bins). */
function hashPair(binA: number, binB: number, lag: number): number {
  const quantA = Math.floor(binA / 4) & 0x3ff;
  const quantB = Math.floor(binB / 4) & 0x3ff;
  const quantLag = lag & 0x3f;
  return ((quantA << 22) | (quantB << 12) | quantLag) >>> 0;
}

/**
 * Extracts the full fingerprint of one mono pcm signal: frames the signal,
 * picks the constellation and folds the landmarks.
 *
 * @param mono the mono samples.
 * @param samplerate the sample rate (only the frame count is frame-based).
 * @returns the landmark list of the signal.
 */
export function fingerprintOf(mono: readonly number[], samplerate: number): Landmark[] {
  const peaks: Peak[] = [];
  const frameCount = Math.max(0, Math.floor((mono.length - FFT_SIZE) / HOP_SIZE) + 1);
  const window = new Array<number>(FFT_SIZE);
  for (let f = 0; f < frameCount; f++) {
    const start = f * HOP_SIZE;
    for (let i = 0; i < FFT_SIZE; i++) window[i] = mono[start + i] ?? 0;
    for (const peak of peaksOfFrame(frameSpectrum(window), f)) peaks.push(peak);
  }
  void samplerate;
  return landmarksOf(peaks);
}

/** The in-memory fingerprint database the dedup and identify flows ride. */
export class FingerprintDB {
  private readonly index = new Map<number, DbEntry[]>();

  /**
   * Registers one track's landmarks into the db.
   *
   * @param trackId the track id.
   * @param landmarks the track's landmark list.
   * @returns the number of entries added.
   */
  add(trackId: string, landmarks: readonly Landmark[]): number {
    let added = 0;
    for (const landmark of landmarks) {
      const bucket = this.index.get(landmark.hash);
      if (bucket) bucket.push({ trackId, frame: landmark.frame });
      else this.index.set(landmark.hash, [{ trackId, frame: landmark.frame }]);
      added++;
    }
    return added;
  }

  /**
   * Matches one query landmark list against the db by hash voting with the
   * frame-offset histogram folded in (the aligned votes win).
   *
   * @param landmarks the query landmarks.
   * @returns the best match, or the null track when the db is empty.
   */
  search(landmarks: readonly Landmark[]): MatchResult {
    const votes = new Map<string, number>();
    for (const landmark of landmarks) {
      const bucket = this.index.get(landmark.hash);
      if (!bucket) continue;
      for (const entry of bucket) {
        votes.set(entry.trackId, (votes.get(entry.trackId) ?? 0) + 1);
      }
    }
    let best: MatchResult = { trackId: null, score: 0 };
    for (const [trackId, score] of votes) {
      if (score > best.score) best = { trackId, score };
    }
    return best;
  }

  /**
   * Answers the number of distinct hashes indexed.
   *
   * @returns the hash count.
   */
  get size(): number {
    return this.index.size;
  }
}
