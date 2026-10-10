// # audiostructure — the structure layer of the cadria audio→image studio, housed at
// the cadria root beside versawase. It turns precomputed analysis frames into the
// composition feed the imagery waves choreograph against: a novelty curve (where the
// song changes), section boundaries, labeled sections (intro/build/peak/break/outro)
// and the energy/tension narratives. Decoupled by contract: the caller brings generic
// feature frames (one Float32Array of band energies per frame) plus the frame rate in
// Hz, and the module derives its own per-frame RMS internally (quadratic mean of the
// feature vector — a caller holding true RMS frames feeds energyCurve/labelSections
// directly). The clean-room pattern follows the analysis pass of the reference MIR
// toolchains, re-derived in pure TypeScript: diagonal checkerboard novelty, threshold
// peak picking (mean + 1.5·std) with a minimum-section guarantee, quantile roles and
// documented narrative heuristics. Every function is total: empty or invalid input
// answers empty/zero results, never throws, never carries NaN. Non-goals: no FFT or
// feature extraction (the caller owns frames), no beat or key tracking, no playback.
// Exports: 7 functions, 9 types, 2 constants — the honest count for this theme.

/** one feature vector per analysis frame (band energies, mel bins, …) — all the caller brings. */
export type FeatureFrames = readonly Float32Array[];
/** the role a section plays in the energy narrative. */
export type SectionRole = "intro" | "build" | "peak" | "break" | "outro";
/** one composition section: half-open [startMs, endMs) plus its energy stats. */
export type Section = { startMs: number; endMs: number; role: SectionRole; energyMean: number; energyPeak: number };
/** the global energy narrative shape, classified by documented heuristics. */
export type NarrativeShape = "arch" | "rise" | "fall" | "wave" | "flat";
/** the complete structure feed for the imagery waves. */
export type StructureStats = {
  sections: Section[];
  durationMs: number;
  peakSectionMs: number;
  repetitionIndex: number;
  narrativeShape: NarrativeShape;
};
// NoveltyOptions: frameRate is Hz, smoothingMs widens both the comparison windows and the smoothing box.
export type NoveltyOptions = { frameRate: number; smoothingMs?: number };
// BoundaryOptions: threshold defaults to mean + 1.5·std of the novelty; minSectionMs guards section length.
export type BoundaryOptions = { minSectionMs?: number; threshold?: number };
export type EnergyOptions = { points?: number };
export type StructureOptions = { smoothingMs?: number; minSectionMs?: number; threshold?: number; points?: number };

/** tensionCurve weights: 40% peak-scaled novelty + 60% energy (documented, deterministic). */
export const TENSION_NOVELTY_WEIGHT = 0.4;
export const TENSION_ENERGY_WEIGHT = 0.6;

// narrative heuristics: flatness floor, half drift for rise/fall, center-peak margin for arch.
const FLAT_STD = 0.08;
const HALF_DRIFT = 0.15;
const ARCH_MARGIN = 0.2;

function clamp01(v: number): number {
  return Number.isFinite(v) ? (v < 0 ? 0 : v > 1 ? 1 : v) : 0;
}

/** cosine similarity over the shorter vector, NaN-guarded and clamped to 0–1; zero vectors answer 0. */
function cosim(a: ArrayLike<number>, b: ArrayLike<number>): number {
  const dim = Math.min(a.length, b.length);
  let dot = 0,
    na = 0,
    nb = 0;
  for (let d = 0; d < dim; d += 1) {
    const x = a[d];
    const y = b[d];
    if (!Number.isFinite(x) || !Number.isFinite(y)) return 0;
    dot += x * y;
    na += x * x;
    nb += y * y;
  }
  const den = Math.sqrt(na) * Math.sqrt(nb);
  return den > 0 && Number.isFinite(dot) ? Math.max(0, Math.min(1, dot / den)) : 0;
}

function meanOf(x: ArrayLike<number>): number {
  let sum = 0;
  for (let i = 0; i < x.length; i += 1) sum += x[i];
  return x.length > 0 ? sum / x.length : 0;
}

function stdOf(x: ArrayLike<number>, mean: number): number {
  let sum = 0;
  for (let i = 0; i < x.length; i += 1) sum += (x[i] - mean) * (x[i] - mean);
  return x.length > 0 ? Math.sqrt(sum / x.length) : 0;
}

/** frameEnergies — the internal RMS: quadratic mean of each feature vector (tracks signal RMS for magnitude-like features); empty or NaN frames answer 0. */
export function frameEnergies(frames: FeatureFrames): Float32Array {
  const out = new Float32Array(frames.length);
  for (let f = 0; f < frames.length; f += 1) {
    const v = frames[f];
    let sum = 0;
    for (let d = 0; d < v.length; d += 1) if (Number.isFinite(v[d])) sum += v[d] * v[d];
    out[f] = v.length > 0 ? Math.sqrt(sum / v.length) : 0;
  }
  return out;
}

/** centered moving average with a running sum; edges shrink the window and float dust clamps into [0, 1]. */
function smoothbox(x: Float32Array, width: number): Float32Array {
  const n = x.length;
  if (width <= 1 || n === 0) return x;
  const half = Math.floor(width / 2);
  const out = new Float32Array(n);
  const stop = Math.min(n - 1, half);
  let sum = 0;
  for (let j = 0; j <= stop; j += 1) sum += x[j];
  let count = stop + 1;
  for (let i = 0; i < n; i += 1) {
    out[i] = sum / count >= 1 ? 1 : sum / count > 0 ? sum / count : 0;
    if (i + 1 + half < n) {
      sum += x[i + 1 + half];
      count += 1;
    }
    if (i - half >= 0) {
      sum -= x[i - half];
      count -= 1;
    }
  }
  return out;
}

/**
 * noveltyCurve — the self-similarity novelty: per frame, the mean feature vectors of the
 * adjacent windows before and after it (each ~smoothingMs/2 wide — the diagonal checkerboard
 * of the self-similarity matrix) are compared by cosine distance, then the raw curve is
 * smoothed with a centered moving average ~smoothingMs/4 wide — narrow enough to settle
 * frame noise without smearing the joint spike it exists to expose. Edge windows shrink;
 * empty windows and zero-norm vectors answer 0; the curve stays inside [0, 1].
 */
export function noveltyCurve(frames: FeatureFrames, options: NoveltyOptions): Float32Array {
  const n = frames.length;
  const rate = options.frameRate;
  if (n === 0 || !Number.isFinite(rate) || rate <= 0) return new Float32Array(0);
  const span =
    options.smoothingMs !== undefined && Number.isFinite(options.smoothingMs) && options.smoothingMs > 0
      ? options.smoothingMs
      : 800;
  const half = Math.max(1, Math.round((span / 2000) * rate));
  // smoothing box = a quarter of the comparison span, so the joint spike survives its own denoising
  const width = Math.max(1, Math.round((span / 4000) * rate));
  let dim = 0;
  for (let f = 0; f < n; f += 1) dim = Math.max(dim, frames[f].length);
  const prefix = new Float64Array((n + 1) * dim);
  for (let f = 0; f < n; f += 1) {
    const v = frames[f];
    for (let d = 0; d < dim; d += 1) {
      const x = d < v.length ? v[d] : 0;
      prefix[(f + 1) * dim + d] = prefix[f * dim + d] + (Number.isFinite(x) ? x : 0);
    }
  }
  const a = new Float64Array(dim);
  const b = new Float64Array(dim);
  const raw = new Float32Array(n);
  for (let i = 0; i < n; i += 1) {
    const from = Math.max(0, i - half);
    const to = Math.min(n, i + half);
    if (from >= i || to <= i) continue;
    for (let d = 0; d < dim; d += 1) {
      a[d] = (prefix[i * dim + d] - prefix[from * dim + d]) / (i - from);
      b[d] = (prefix[to * dim + d] - prefix[i * dim + d]) / (to - i);
    }
    raw[i] = 1 - cosim(a, b);
  }
  return smoothbox(raw, width);
}

/**
 * structureBoundaries — peak picking on the novelty: a boundary is a frame above
 * `threshold` (default mean + 1.5·std) that is a local maximum; candidates are then
 * greedily kept strongest-first under the minimum-section guarantee (no two kept
 * boundaries closer than minSectionMs — a huge minSectionMs still keeps the strongest
 * one). Answers boundary times in ms, ascending; a flat novelty answers none.
 */
export function structureBoundaries(novelty: Float32Array, frameRate: number, options: BoundaryOptions = {}): number[] {
  const n = novelty.length;
  if (n === 0 || !Number.isFinite(frameRate) || frameRate <= 0) return [];
  const mean = meanOf(novelty);
  const threshold =
    options.threshold !== undefined && Number.isFinite(options.threshold)
      ? options.threshold
      : mean + 1.5 * stdOf(novelty, mean);
  const minMs =
    options.minSectionMs !== undefined && Number.isFinite(options.minSectionMs) ? options.minSectionMs : 8000;
  const minGap = Math.max(1, Math.round((minMs / 1000) * frameRate));
  const candidates: number[] = [];
  for (let i = 0; i < n; i += 1) {
    if (novelty[i] <= threshold) continue;
    if (novelty[i] >= (i > 0 ? novelty[i - 1] : -Infinity) && novelty[i] >= (i < n - 1 ? novelty[i + 1] : -Infinity))
      candidates.push(i);
  }
  const kept: number[] = [];
  for (const frame of [...candidates].sort((a, b) => novelty[b] - novelty[a] || a - b)) {
    if (kept.every((k) => Math.abs(k - frame) >= minGap)) kept.push(frame);
  }
  return kept.sort((a, b) => a - b).map((frame) => (frame / frameRate) * 1000);
}

// role rules: a lone section is its own "peak"; first = "intro", last = "outro"; middle sections rank
// by energyMean — the top ⌊m/3⌋ (at least one) become "peak", the bottom ⌊m/3⌋ become "break" (only
// when m ≥ 3) and the rest stay "build".
function assignRoles(sections: Section[]): void {
  const count = sections.length;
  if (count === 0) return;
  if (count === 1) {
    sections[0].role = "peak";
    return;
  }
  sections[0].role = "intro";
  sections[count - 1].role = "outro";
  const middles = sections.slice(1, count - 1).map((section, index) => ({ section, index }));
  middles.sort((a, b) => a.section.energyMean - b.section.energyMean || a.index - b.index);
  const tops = Math.max(1, Math.floor(middles.length / 3));
  const bottoms = middles.length >= 3 ? tops : 0;
  middles.forEach((entry, rank) => {
    entry.section.role = rank >= middles.length - tops ? "peak" : rank < bottoms ? "break" : "build";
  });
}

/**
 * labelSections — tiles [0, durationMs) at the given boundaries (0 and the duration are
 * implicit; boundaries are clamped into the open interval, sorted and deduped) and assigns
 * roles by the documented quantile rules. Energy stats come from the frame range each
 * section covers (the tail edge clamps to at least one frame), so adjacent sections share
 * at most their edge frame.
 */
export function labelSections(boundaries: readonly number[], energyFrames: Float32Array, frameRate: number): Section[] {
  const n = energyFrames.length;
  if (n === 0 || !Number.isFinite(frameRate) || frameRate <= 0) return [];
  const durationMs = (n / frameRate) * 1000;
  const clipped = boundaries
    .filter((b) => Number.isFinite(b))
    .map((b) => Math.min(durationMs, Math.max(0, b)))
    .sort((a, b) => a - b);
  const edges: number[] = [0];
  for (const b of clipped) if (b > 1e-9 && b < durationMs - 1e-9 && b - edges[edges.length - 1] >= 1e-6) edges.push(b);
  edges.push(durationMs);
  const sections: Section[] = [];
  for (let s = 0; s + 1 < edges.length; s += 1) {
    const f0 = Math.min(n - 1, Math.max(0, Math.round((edges[s] / 1000) * frameRate)));
    const f1 = Math.min(n, Math.max(f0 + 1, Math.round((edges[s + 1] / 1000) * frameRate)));
    let sum = 0;
    let peak = 0;
    for (let f = f0; f < f1; f += 1) {
      sum += energyFrames[f];
      peak = Math.max(peak, energyFrames[f]);
    }
    sections.push({
      startMs: edges[s],
      endMs: edges[s + 1],
      role: "build",
      energyMean: sum / (f1 - f0),
      energyPeak: peak,
    });
  }
  assignRoles(sections);
  return sections;
}

/**
 * energyCurve — the 0–1 energy narrative for motion choreography: the RMS frames linearly
 * resampled to `points` samples, then peak-normalized (the loudest sample is exactly 1).
 * Silence and empty input answer all zeros of the requested length.
 */
export function energyCurve(rmsFrames: Float32Array, options: EnergyOptions = {}): Float32Array {
  const raw = options.points;
  const points = raw === undefined || !Number.isFinite(raw) ? 64 : Math.max(1, Math.trunc(raw));
  const n = rmsFrames.length;
  const out = new Float32Array(points);
  for (let k = 0; k < points && n > 0; k += 1) {
    const pos = points === 1 ? (n - 1) / 2 : (k * (n - 1)) / (points - 1);
    const i0 = Math.floor(pos);
    const v = rmsFrames[i0] * (1 - (pos - i0)) + rmsFrames[Math.min(n - 1, i0 + 1)] * (pos - i0);
    out[k] = Number.isFinite(v) ? v : 0;
  }
  let top = 0;
  for (let k = 0; k < points; k += 1) top = Math.max(top, out[k]);
  if (top > 0) for (let k = 0; k < points; k += 1) out[k] = clamp01(out[k] / top);
  return out;
}

/** linear sample of a curve at relative position t ∈ [0, 1]. */
function sampleAt(curve: Float32Array, t: number): number {
  const m = curve.length;
  if (m === 0) return 0;
  const pos = Math.max(0, Math.min(1, t)) * (m - 1);
  const i0 = Math.floor(pos);
  return curve[i0] + (curve[Math.min(m - 1, i0 + 1)] - curve[i0]) * (pos - i0);
}

/**
 * tensionCurve — the combined choreography feed: novelty peak-scaled to 0–1 and resampled
 * to the energy length, then TENSION_NOVELTY_WEIGHT·novelty + TENSION_ENERGY_WEIGHT·energy
 * (40% change, 60% loudness), clamped to 0–1; as long as `energy`, never NaN.
 */
export function tensionCurve(novelty: Float32Array, energy: Float32Array): Float32Array {
  const out = new Float32Array(energy.length);
  let top = 0;
  for (let i = 0; i < novelty.length; i += 1) if (Number.isFinite(novelty[i])) top = Math.max(top, novelty[i]);
  for (let k = 0; k < energy.length; k += 1) {
    const nov = top > 0 ? sampleAt(novelty, energy.length === 1 ? 0.5 : k / (energy.length - 1)) / top : 0;
    out[k] = clamp01(TENSION_NOVELTY_WEIGHT * clamp01(nov) + TENSION_ENERGY_WEIGHT * clamp01(energy[k]));
  }
  return out;
}

/**
 * repetitionIndexOf — blockiness of the self-similarity lag curve: mean cosine similarity
 * between frames one lag apart, per lag, over lags from max(minSectionMs, 2 s) to half the
 * track; the strongest lag is scored against the lag-curve baseline as
 * (best − baseline) / (1 − baseline), 0–1 clamped. No lag contrast (or too short) → 0.
 */
function repetitionIndexOf(frames: FeatureFrames, frameRate: number, minSectionMs: number): number {
  const n = frames.length;
  if (n < 4 || !Number.isFinite(frameRate) || frameRate <= 0) return 0;
  const minMs = Number.isFinite(minSectionMs) && minSectionMs > 0 ? minSectionMs : 8000;
  const minLag = Math.max(1, Math.round((Math.max(minMs, 2000) / 1000) * frameRate));
  const maxLag = Math.floor(n / 2);
  if (minLag > maxLag) return 0;
  const step = Math.max(1, Math.round(minLag / 4));
  let best = 0,
    total = 0,
    lags = 0;
  for (let lag = minLag; lag <= maxLag; lag += step) {
    let sum = 0;
    for (let i = 0; i + lag < n; i += 1) sum += cosim(frames[i], frames[i + lag]);
    best = Math.max(best, sum / (n - lag));
    total += sum / (n - lag);
    lags += 1;
  }
  return clamp01((best - total / lags) / Math.max(1 - total / lags, 1e-6));
}

/**
 * narrativeShapeOf — documented heuristics over the peak-normalized energy curve: std < 0.08
 * is "flat"; the second half mean above/below the first half by ≥ 0.15 is "rise"/"fall";
 * otherwise a maximum standing in the middle half and ≥ 0.2 over both edge quarters is
 * "arch"; anything else is "wave".
 */
function narrativeShapeOf(curve: Float32Array): NarrativeShape {
  const n = curve.length;
  if (n < 2) return "flat";
  const mean = meanOf(curve);
  if (stdOf(curve, mean) < FLAT_STD) return "flat";
  const half = Math.floor(n / 2);
  const drift = meanOf(curve.subarray(half)) - meanOf(curve.subarray(0, half));
  if (drift >= HALF_DRIFT) return "rise";
  if (drift <= -HALF_DRIFT) return "fall";
  let peakIdx = 0;
  for (let i = 1; i < n; i += 1) if (curve[i] > curve[peakIdx]) peakIdx = i;
  const quarter = Math.max(1, Math.floor(n / 4));
  const edge = Math.max(meanOf(curve.subarray(0, quarter)), meanOf(curve.subarray(n - quarter)));
  if (peakIdx >= quarter && peakIdx <= n - 1 - quarter && curve[peakIdx] - edge >= ARCH_MARGIN) return "arch";
  return "wave";
}

/**
 * analyzeStructure — the full composition feed in one deterministic pass: internal RMS,
 * novelty, boundaries, labeled sections, energy narrative, repetition index and narrative
 * shape. peakSectionMs is the startMs of the loudest "peak" section (falling back to the
 * loudest section of any role). Empty or invalid input answers a zeroed "flat" report.
 */
export function analyzeStructure(
  frames: FeatureFrames,
  frameRate: number,
  options: StructureOptions = {},
): StructureStats {
  const rms = frameEnergies(frames);
  if (rms.length === 0 || !Number.isFinite(frameRate) || frameRate <= 0) {
    return { sections: [], durationMs: 0, peakSectionMs: 0, repetitionIndex: 0, narrativeShape: "flat" };
  }
  const novelty = noveltyCurve(frames, { frameRate, smoothingMs: options.smoothingMs });
  const boundaries = structureBoundaries(novelty, frameRate, {
    minSectionMs: options.minSectionMs,
    threshold: options.threshold,
  });
  const sections = labelSections(boundaries, rms, frameRate);
  let peakSectionMs = 0;
  let best = -Infinity;
  for (const section of sections) {
    const score = section.energyMean + (section.role === "peak" ? 1e9 : 0);
    if (score > best) {
      best = score;
      peakSectionMs = section.startMs;
    }
  }
  return {
    sections,
    durationMs: (rms.length / frameRate) * 1000,
    peakSectionMs,
    repetitionIndex: repetitionIndexOf(frames, frameRate, options.minSectionMs ?? 8000),
    narrativeShape: narrativeShapeOf(energyCurve(rms, { points: options.points })),
  };
}
