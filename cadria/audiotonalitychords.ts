// # audiotonalitychords — the chord timeline of the tonality layer, housed at
// the cadria root beside audiotonality (the chroma/key layer that consumes
// this file for its HarmonicStats). The template table folds seven chord
// qualities (maj, min, dim, aug, maj7, min7, dom7) over the twelve roots and
// scores every chroma frame against them with cosine similarity; the greedy
// smoother then dissolves any run of frames shorter than minFramesPerChord
// into its longer neighbour, so no flip shorter than that survives in the
// timeline. Everything is deterministic: fixed template order (root
// ascending, qualities as declared), strict-greater argmax (ties keep the
// lowest root), mean confidence per segment, no randomness, nothing throws —
// damaged, silent or empty chromagrams answer an empty timeline. Time is
// owned by the caller: frameMs maps frame indices to milliseconds (default =
// the 2048-hop / 44100 Hz cadria STFT grid). Exports: 3 types, 3 constants,
// 1 function — the honest count for this theme.

/** the chord qualities the template table folds over the twelve roots. */
export type ChordQuality = "maj" | "min" | "dim" | "aug" | "maj7" | "min7" | "dom7";

/** one detected chord stretch over the chromagram timeline. */
export type ChordSegment = {
  /** timeline start in milliseconds (first frame index × frameMs) */
  startMs: number;
  /** timeline end in milliseconds, exclusive (one past the last frame × frameMs) */
  endMs: number;
  /** chord root as a pitch-class index 0–11 (0 = c, tuned at a440) */
  root: number;
  /** chord quality from the template table */
  quality: ChordQuality;
  /** mean cosine similarity of the member frames, clamped to 0–1 */
  confidence: number;
};

/** options for detectChords; every field is optional and sanitized. */
export type ChordDetectorOptions = {
  /** shortest run of frames allowed to keep its own label (default 4) */
  minFramesPerChord?: number;
  /** milliseconds one chroma frame spans (default 1000·2048/44100) */
  frameMs?: number;
  /** frames scoring below this cosine count as unvoiced and inherit a neighbour (default 0) */
  minConfidence?: number;
};

/** chord-tone intervals in semitones above the root, per quality. */
export const CHORD_INTERVALS: Readonly<Record<ChordQuality, readonly number[]>> = {
  maj: [0, 4, 7],
  min: [0, 3, 7],
  dim: [0, 3, 6],
  aug: [0, 4, 8],
  maj7: [0, 4, 7, 11],
  min7: [0, 3, 7, 10],
  dom7: [0, 4, 7, 10],
};

/** milliseconds of one frame on the default cadria stft grid (hop 2048 at 44100 Hz). */
export const CHORD_DEFAULT_FRAME_MS = (1000 * 2048) / 44100;

const QUALITY_ORDER: readonly ChordQuality[] = ["maj", "min", "dim", "aug", "maj7", "min7", "dom7"];
const ROOTS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] as const;

/** one scored chord shape: uniform weight 1 on the chord tones, 0 elsewhere. */
export type ChordTemplate = {
  /** root pitch class 0–11 */
  root: number;
  /** quality from CHORD_INTERVALS */
  quality: ChordQuality;
  /** 12-bin template the cosine similarity reads */
  weights: Float32Array;
};

/** the full 7 qualities × 12 roots table (84 templates), root ascending, quality as declared. */
export const chordTemplates: readonly ChordTemplate[] = QUALITY_ORDER.flatMap((quality) =>
  ROOTS.map((root) => {
    const weights = new Float32Array(12);
    for (const interval of CHORD_INTERVALS[quality]) weights[(root + interval) % 12] = 1;
    return { root, quality, weights };
  }),
);

type FrameLabel = { label: number; confidence: number };

/** cosine similarity argmax over the whole template table; label −1 when the frame is silent. */
function bestTemplate(chroma: Float32Array | readonly number[]): FrameLabel {
  let norm = 0;
  for (let i = 0; i < 12; i += 1) {
    const value = Number.isFinite(chroma[i]) ? chroma[i] : 0;
    norm += value * value;
  }
  if (!(norm > 0)) return { label: -1, confidence: 0 };
  norm = Math.sqrt(norm);
  let best = -1;
  let bestScore = -1;
  for (let t = 0; t < chordTemplates.length; t += 1) {
    const weights = chordTemplates[t].weights;
    let dot = 0;
    let templateNorm = 0;
    for (let i = 0; i < 12; i += 1) {
      dot += chroma[i] * weights[i];
      templateNorm += weights[i] * weights[i];
    }
    const score = dot / (norm * Math.sqrt(templateNorm));
    if (score > bestScore) {
      bestScore = score;
      best = t;
    }
  }
  return { label: best, confidence: Math.min(1, Math.max(0, bestScore)) };
}

type Run = { label: number; from: number; to: number; confSum: number; count: number };

/** run-length encodes the per-frame labels with their confidence sums. */
function collectRuns(labels: readonly number[], confidences: readonly number[]): Run[] {
  const runs: Run[] = [];
  for (let i = 0; i < labels.length; i += 1) {
    const last = runs[runs.length - 1];
    if (last && last.label === labels[i]) {
      last.to = i + 1;
      last.confSum += confidences[i];
      last.count += 1;
    } else {
      runs.push({ label: labels[i], from: i, to: i + 1, confSum: confidences[i], count: 1 });
    }
  }
  return runs;
}

/** greedy smoother: dissolves every run shorter than minFrames into its longer neighbour (ties → previous). */
function dissolveShortRuns(runs: readonly Run[], minFrames: number): Run[] {
  const list = runs.slice();
  while (list.length > 1) {
    const at = list.findIndex((run) => run.count < minFrames);
    if (at < 0) break;
    const run = list[at];
    const prev = at > 0 ? list[at - 1] : null;
    const next = at + 1 < list.length ? list[at + 1] : null;
    const target = prev && next ? (next.count > prev.count ? next : prev) : (prev ?? next);
    if (!target) break;
    target.from = Math.min(target.from, run.from);
    target.to = Math.max(target.to, run.to);
    target.confSum += run.confSum;
    target.count += run.count;
    list.splice(at, 1);
  }
  return list;
}

/** the chord timeline of a chromagram: cosine argmax per frame, then greedy smoothing; [] when nothing sounds. */
export function detectChords(chromagram: readonly Float32Array[], options: ChordDetectorOptions = {}): ChordSegment[] {
  const minFrames = Math.max(1, Math.trunc(options.minFramesPerChord ?? 4));
  const frameMs = Number.isFinite(options.frameMs) && (options.frameMs as number) > 0 ? (options.frameMs as number) : CHORD_DEFAULT_FRAME_MS;
  const minConfidence = Number.isFinite(options.minConfidence) ? Math.min(1, Math.max(0, options.minConfidence as number)) : 0;
  if (chromagram.length === 0) return [];
  const labels: number[] = [];
  const confidences: number[] = [];
  for (const frame of chromagram) {
    const found = bestTemplate(frame);
    labels.push(found.confidence >= minConfidence && found.label >= 0 ? found.label : -1);
    confidences.push(found.confidence);
  }
  // unvoiced frames inherit the previous label; leading silence inherits the first voiced one
  for (let i = 1; i < labels.length; i += 1) if (labels[i] < 0) labels[i] = labels[i - 1];
  const first = labels.findIndex((label) => label >= 0);
  if (first < 0) return [];
  for (let i = 0; i < first; i += 1) labels[i] = labels[first];
  return dissolveShortRuns(collectRuns(labels, confidences), minFrames).map((run) => ({
    startMs: run.from * frameMs,
    endMs: run.to * frameMs,
    root: chordTemplates[run.label].root,
    quality: chordTemplates[run.label].quality,
    confidence: Math.min(1, Math.max(0, run.confSum / run.count)),
  }));
}
