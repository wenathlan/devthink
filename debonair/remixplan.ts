// # remixplan — the music remix planner of debonair (root layer): retime a
// piece of music to a target length by cutting it at musically similar beat
// boundaries. The clean-room pattern is absorbed from filmcraft's
// audio-dsp/remix.rs (per-beat chroma + cepstra self-similarity, joint
// scoring along the diagonals of the similarity matrix, piece plans with an
// equal-power crossfade at every joint) and from remotion's interpolate
// (deterministic value mapping, here the even spacing of joint targets). The
// planner receives per-beat FEATURES as parameters — STFT, onset and chroma
// extraction stay in the katexis engine — and emits the cut plan only.
// Non-goals: no DSP, no decoding, no playback, no timestretch of samples.
// Pure and multi-mode — the same call runs in the browser and in node.

/** The machine readable failure codes of the remix planner. */
export type RemixErrorCode = "too-short" | "target-too-short" | "bad-params" | "bad-plan";

/** The typed result every fallible planner call answers with (errors by return). */
export type RemixResult<T> = { ok: true; value: T } | { ok: false; code: RemixErrorCode; message: string };

/** What the planner needs to know about the music: one feature vector per beat. */
export interface RemixAnalysis {
  /** The number of beats analysed (chroma and cepstra must match it). */
  beatcount: number;
  /** The 12-bin chroma of each beat (katexis owns the extraction). */
  chroma: number[][];
  /** The 12 mel cepstra of each beat (katexis owns the extraction). */
  cepstra: number[][];
}

/** The remix sliders: how many joints and how far they may wander. */
export interface RemixParams {
  /** The segments slider 0..100 → 1, 2 or 3 joints. */
  segments: number;
  /** The variations slider 0..100 → joint search window ±(1 + 7·v/100) beats. */
  variations: number;
  /** The target length of the remix in beats. */
  targetbeats: number;
}

/** One piece of the output: `lengthbeats` beats read from the source at `startbeat`. */
export interface RemixPiece {
  /** The source beat the piece starts at (>= 0). */
  startbeat: number;
  /** The number of source beats the piece plays (>= 1). */
  lengthbeats: number;
}

/** A remix: pieces played one after the other, crossfaded at every joint. */
export interface RemixPlan {
  /** The pieces in play order (at least one). */
  pieces: RemixPiece[];
  /** The crossfade length at every joint, in seconds. */
  xfadeseconds: number;
}

/** Row-major beat self-similarity matrix. */
export interface SimilarityMatrix {
  /** The matrix order (the beat count). */
  size: number;
  /** The row-major entries, `size × size`. */
  data: number[];
}

/** Beats of context on each side of a joint the jump score looks at. */
export const JOINTCONTEXT = 4;

/** Shortest piece, in beats (no stutter edits). */
export const MINPIECEBEATS = 4;

/** The crossfade at each joint, in seconds (filmcraft's constant). */
export const XFADESECONDS = 0.02;

/** Fails a fallible call with one machine readable code. */
function fail<T>(code: RemixErrorCode, message: string): RemixResult<T> {
  return { ok: false, code, message };
}

/** The cosine similarity of two equal-length vectors (0 for empty inputs). */
export function cosineSimilarity(a: readonly number[], b: readonly number[]): number {
  const n = Math.min(a.length, b.length);
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < n; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  return na > 0 && nb > 0 ? dot / Math.sqrt(na * nb) : 0;
}

/** Standardises a series to zero mean and unit variance (zeros when flat). */
export function zScoreSeries(values: readonly number[]): number[] {
  const n = values.length;
  if (n === 0) return [];
  const mean = values.reduce((a, b) => a + b, 0) / n;
  const sd = Math.sqrt(values.reduce((a, b) => a + (b - mean) * (b - mean), 0) / n);
  return sd > 0 ? values.map((v) => (v - mean) / sd) : values.map(() => 0);
}

/** Harmonic similarity of two beats: cosine of the chroma pair (0..1). */
export function chromaMatch(a: readonly number[], b: readonly number[]): number {
  return (cosineSimilarity(a, b) + 1) / 2;
}

/** Timbre similarity of two beats: cosine of the z-scored cepstra mapped to 0..1. */
export function timbreMatch(a: readonly number[], b: readonly number[]): number {
  return (cosineSimilarity(zScoreSeries(a), zScoreSeries(b)) + 1) / 2;
}

/** The beat self-similarity of filmcraft's blend: 60% chroma + 40% timbre. */
export function beatSimilarity(analysis: RemixAnalysis, i: number, j: number): number {
  const ca = analysis.chroma[i];
  const cb = analysis.chroma[j];
  const ta = analysis.cepstra[i];
  const tb = analysis.cepstra[j];
  if (!ca || !cb || !ta || !tb) return 0;
  return 0.6 * chromaMatch(ca, cb) + 0.4 * timbreMatch(ta, tb);
}

/** The full row-major self-similarity matrix of the analysed beats. */
export function selfSimilarity(analysis: RemixAnalysis): SimilarityMatrix {
  const size = analysis.beatcount;
  const data = new Array<number>(size * size).fill(0);
  for (let i = 0; i < size; i++) {
    data[i * size + i] = 1;
    for (let j = i + 1; j < size; j++) {
      const s = beatSimilarity(analysis, i, j);
      data[i * size + j] = s;
      data[j * size + i] = s;
    }
  }
  return { size, data };
}

/** Reads one entry of a similarity matrix (0 outside the matrix). */
export function similarityAt(matrix: SimilarityMatrix, i: number, j: number): number {
  return i >= 0 && j >= 0 && i < matrix.size && j < matrix.size ? matrix.data[i * matrix.size + j] : 0;
}

/**
 * How well a jump from beat boundary `i` (the source is left there) to beat
 * boundary `j` (playback continues there) fits: the mean similarity of the
 * beats after `i` and after `j`, and of the beats before them, over
 * `JOINTCONTEXT` beats on both sides (filmcraft's diagonal scoring).
 */
export function jumpScore(matrix: SimilarityMatrix, i: number, j: number, context = JOINTCONTEXT): number {
  let sum = 0;
  let n = 0;
  for (let k = 0; k < context; k++) {
    if (i + k < matrix.size && j + k < matrix.size) {
      sum += similarityAt(matrix, i + k, j + k);
      n++;
    }
    if (i > k && j > k) {
      sum += similarityAt(matrix, i - 1 - k, j - 1 - k);
      n++;
    }
  }
  return n > 0 ? sum / n : 0;
}

/** The joints count the segments slider means: 0–33 → 1, 34–67 → 2, 68–100 → 3. */
export function segmentCount(segments: number): number {
  const s = Math.max(0, Math.min(100, segments));
  return s < 34 ? 1 : s < 68 ? 2 : 3;
}

/** The joint search window the variations slider means, in beats. */
export function variationWindow(variations: number): number {
  return 1 + (7 * Math.max(0, Math.min(100, variations))) / 100;
}

/**
 * Finds the source beat that best continues after `outgoing` among the
 * candidates in `[minbeat, maxbeat]` (ties keep the earliest candidate).
 */
export function bestTargetBeat(matrix: SimilarityMatrix, outgoing: number, minbeat: number, maxbeat: number): number {
  const lo = Math.max(1, Math.floor(minbeat));
  const hi = Math.min(matrix.size - 1, Math.floor(maxbeat));
  let best = lo;
  let bestscore = -Infinity;
  for (let j = lo; j <= hi; j++) {
    const score = jumpScore(matrix, outgoing, j);
    if (score > bestscore) {
      bestscore = score;
      best = j;
    }
  }
  return best;
}

/**
 * Plans the remix: evenly spaced joint targets over the requested length,
 * each moved inside the variations window to the most similar source context,
 * so the output plays `targetbeats` beats in pieces cut at beat boundaries.
 * Deterministic: the same analysis, target and sliders give the same plan.
 */
export function planRemix(analysis: RemixAnalysis, params: RemixParams): RemixResult<RemixPlan> {
  const beatcount = analysis.beatcount;
  if (!Number.isInteger(beatcount) || beatcount < MINPIECEBEATS * 4)
    return fail("too-short", `the music needs at least ${MINPIECEBEATS * 4} beats`);
  if (analysis.chroma.length !== beatcount || analysis.cepstra.length !== beatcount)
    return fail("bad-params", "chroma and cepstra must carry one vector per beat");
  if (!(params.targetbeats >= MINPIECEBEATS * 2) || !Number.isFinite(params.targetbeats))
    return fail("target-too-short", "the target does not fit intro and outro");
  const joints = segmentCount(params.segments);
  if (params.targetbeats < MINPIECEBEATS * (joints + 1))
    return fail("target-too-short", `the target does not fit ${joints + 1} pieces`);
  const matrix = selfSimilarity(analysis);
  const window = variationWindow(params.variations);
  const pieces: RemixPiece[] = [];
  let source = 0;
  let played = 0;
  for (let k = 1; k <= joints; k++) {
    const target = Math.round((params.targetbeats * k) / (joints + 1));
    const outgoing = source + (target - played);
    if (outgoing < MINPIECEBEATS || outgoing > beatcount - MINPIECEBEATS) break;
    const landing = bestTargetBeat(matrix, outgoing, target - window, target + window);
    pieces.push({ startbeat: source, lengthbeats: outgoing - source });
    source = landing;
    played = target;
  }
  const final = params.targetbeats - played;
  if (final < MINPIECEBEATS || source + final > beatcount)
    return fail("target-too-short", "the final piece does not fit the source");
  pieces.push({ startbeat: source, lengthbeats: final });
  return { ok: true, value: { pieces, xfadeseconds: XFADESECONDS } };
}

/** The plan that plays the source unchanged, once, no joints. */
export function identityPlan(beatcount: number): RemixPlan {
  return { pieces: [{ startbeat: 0, lengthbeats: Math.max(0, beatcount) }], xfadeseconds: XFADESECONDS };
}

/** The plan length in beats (the sum of the pieces). */
export function planLength(plan: RemixPlan): number {
  return plan.pieces.reduce((a, p) => a + p.lengthbeats, 0);
}

/** The output positions of every joint (the start of each piece after the first). */
export function planJoints(plan: RemixPlan): number[] {
  const out: number[] = [];
  let at = 0;
  for (const piece of plan.pieces.slice(0, -1)) {
    at += piece.lengthbeats;
    out.push(at);
  }
  return out;
}

/** The source cut of every joint: [end of the outgoing piece, start of the incoming one]. */
export function planCuts(plan: RemixPlan): Array<[number, number]> {
  const cuts: Array<[number, number]> = [];
  for (let i = 0; i + 1 < plan.pieces.length; i++) {
    const a = plan.pieces[i];
    const b = plan.pieces[i + 1];
    cuts.push([a.startbeat + a.lengthbeats, b.startbeat]);
  }
  return cuts;
}

/** Which piece plays at an output beat (the last piece past the end). */
export function pieceAtOutputBeat(plan: RemixPlan, beat: number): RemixPiece {
  let at = 0;
  for (const piece of plan.pieces) {
    if (beat < at + piece.lengthbeats) return piece;
    at += piece.lengthbeats;
  }
  return plan.pieces[plan.pieces.length - 1];
}

/** The equal-power fade pair at progress 0..1: [fade-out of the outgoing, fade-in of the incoming]. */
export function equalPowerGain(progress: number): [number, number] {
  const p = Math.max(0, Math.min(1, progress));
  return [Math.cos((p * Math.PI) / 2), Math.sin((p * Math.PI) / 2)];
}

/** Validates a plan: piece lengths, source bounds and the minimum piece rule. */
export function validatePlan(plan: RemixPlan, beatcount: number): RemixResult<number> {
  if (plan.pieces.length === 0) return fail("bad-plan", "a plan needs at least one piece");
  let at = 0;
  for (const piece of plan.pieces) {
    if (!(piece.lengthbeats >= 1) || piece.startbeat < 0 || piece.startbeat + piece.lengthbeats > beatcount) {
      return fail("bad-plan", "a piece leaves the source bounds");
    }
    if (plan.pieces.length > 1 && piece.lengthbeats < MINPIECEBEATS)
      return fail("bad-plan", "a piece is shorter than the minimum");
    at += piece.lengthbeats;
  }
  return { ok: true, value: at };
}
