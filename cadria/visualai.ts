// # visualai — the honest generative seat of the versawaze engine, housed at
// the cadria root beside mesh.ts, shaders.ts and versa.ts. Two seats, zero
// fake intelligence: every answer is deterministic procedural mathematics
// labeled as such, and every suggestion is derived from the payload
// statistics the caller supplies — no trained-model claims, no "AI" badge on
// static data, no randomness without a seed.
//
//   1. procedural mesh variation — a base GeneratedMesh walks the real
//      modifier stack the meshgen seat owns (twist, belly — single-sourced
//      re-exports, never duplicated) plus the radial noise displacement of
//      this seat (deterministic valueNoise2 along the vertex normals, the
//      amplitude a fraction of the mesh's own bounding radius so the
//      variation is scale-invariant), with the normals recomputed from the
//      displaced faces (averageNormals, the meshgen audit math). Every
//      parameter set derives from the integer hash of (seed, index, salt) —
//      the same hashNoise2 floor the terrain rides — so the same seed
//      answers the same variations forever, on every host.
//
//   2. keyframe auto-suggestion — the payload stats lane: a motion-energy
//      series (per-frame or per-window samples the caller extracted from
//      the media payload) walks a real peak detector (local maxima with
//      prominence over a window, z-scored against the series' own mean and
//      deviation) and the strongest, best-separated instants answer as
//      keyframe suggestions with honest reasons (motion-peak, motion-step,
//      quiet-settle). When the series carries no honest signal the seat
//      answers fewer suggestions or none — a refusal, never a filler.
//
// Pure TypeScript, zero DOM, zero network, zero ML runtime: the generate-image
// and compile-shader workload lanes of the Saddle catalog run this seat
// edge-side. Errors refuse by return type or the typed MeshGenError of the
// meshgen doctrine. Exports: 6 interfaces, 9 functions, 3 constants — the
// honest count for this theme.

import {
  type GeneratedMesh,
  type MeshValidation,
  MeshGenError,
  averageNormals,
  bellyMesh,
  hashNoise2,
  twistMesh,
  validateMesh,
  valueNoise2,
} from "./versawase.ts";

/* the wrapped versawase contract rides the public surface: the variation
 * seat builds on the meshgen doctrine and its consumers import the
 * doctrine symbols through this door — the mutual-dependency law (one
 * import path per concept, never a duplicated re-declaration). The
 * GeneratedMesh and MeshValidation types answer in the exported
 * signatures above, so the surface owes them to every consumer. */
export { MeshGenError } from "./versawase.ts";
export type { GeneratedMesh, MeshValidation } from "./versawase.ts";

// ---------------------------------------------------------------------------
// seat 1: the procedural mesh variation
// ---------------------------------------------------------------------------

/** the honest parameter budget of the variation engine — every field is a
 * hard ceiling the proposals never cross. */
export interface VariationBudget {
  /** the twist ceiling in radians per y unit (default 1.5). */
  maxTwist: number;
  /** the belly ceiling as a fraction of the profile (default 0.5, kept
   * > -1 by the bellyMesh contract). */
  maxBelly: number;
  /** the noise displacement ceiling as a fraction of the bounding radius
   * (default 0.15). */
  maxNoise: number;
  /** the noise frequency ceiling in cycles per bounding radius (default 3). */
  maxNoiseFrequency: number;
}

/** the engine default budget — the documented studio preset. */
export const DEFAULT_VARIATION_BUDGET: VariationBudget = {
  maxTwist: 1.5,
  maxBelly: 0.5,
  maxNoise: 0.15,
  maxNoiseFrequency: 3,
};

/** one variation's parameter set — the honest recipe, replayable. */
export interface VariationParameters {
  /** radians of twist per y unit (signed — the direction is part of the
   * proposal). */
  twist: number;
  /** the belly fraction (signed). */
  belly: number;
  /** the noise displacement as a fraction of the bounding radius. */
  noiseAmplitude: number;
  /** the noise frequency in cycles per bounding radius. */
  noiseFrequency: number;
  /** the noise seed — the displacement field's own identity. */
  noiseSeed: number;
}

/** one proposed variation: the parameters, the applied mesh and the honest
 * provenance label. */
export interface MeshVariation {
  id: string;
  /** the honest label — a recipe card, never an artwork claim. */
  label: string;
  parameters: VariationParameters;
  /** the variation applied to the base mesh (a new buffer set). */
  mesh: GeneratedMesh;
  /** always "deterministic-procedural" — the seat never claims more. */
  provenance: "deterministic-procedural";
}

/** the variation request: the base mesh, the seed, the count and the
 * optional budget (the default preset when absent). */
export interface VariationRequest {
  base: GeneratedMesh;
  seed: number;
  count: number;
  budget?: VariationBudget;
}

/** the bounding radius of one mesh — the honest scale the noise parameters
 * divide (the farthest vertex from the centroid, never zero). */
function boundingRadius(mesh: GeneratedMesh): number {
  let cx = 0;
  let cy = 0;
  let cz = 0;
  const count = mesh.positions.length / 3;
  for (let at = 0; at < mesh.positions.length; at += 3) {
    cx += mesh.positions[at];
    cy += mesh.positions[at + 1];
    cz += mesh.positions[at + 2];
  }
  if (count === 0) throw new MeshGenError("visualai: the base mesh carries no vertex");
  cx /= count;
  cy /= count;
  cz /= count;
  let radius = 0;
  for (let at = 0; at < mesh.positions.length; at += 3) {
    const dx = mesh.positions[at] - cx;
    const dy = mesh.positions[at + 1] - cy;
    const dz = mesh.positions[at + 2] - cz;
    const distance = Math.hypot(dx, dy, dz);
    if (distance > radius) radius = distance;
  }
  return radius > 1e-9 ? radius : 1;
}

/** one deterministic 0..1 sample of the proposal stream: the hash of
 * (seed, index, salt) — the same floor the terrain generator rides. */
function sample(seed: number, index: number, salt: number): number {
  return hashNoise2(index, salt, seed);
}

/**
 * Applies one variation parameter set to a base mesh — the real modifier
 * walk in the documented order: twist (versawasegen, single-sourced), belly
 * (versawasegen), then the radial noise displacement of this seat (every
 * vertex walks its current normal by amplitude * (valueNoise2 * 2 - 1),
 * frequency measured in cycles per bounding radius) with the normals
 * recomputed from the displaced faces. A new buffer set answers; the base
 * is never mutated. Parameters outside the honest ranges refuse with
 * MeshGenError.
 */
export function applyvariation(base: GeneratedMesh, parameters: VariationParameters): GeneratedMesh {
  const audit: MeshValidation = validateMesh(base);
  if (!audit.ok) throw new MeshGenError(`visualai: the base mesh fails the audit (${audit.issues[0]?.code ?? "unknown"})`);
  if (!Number.isFinite(parameters.twist) || !Number.isFinite(parameters.belly))
    throw new MeshGenError("visualai: twist and belly must be finite");
  if (parameters.belly <= -1) throw new MeshGenError(`visualai: belly must stay > -1, got ${parameters.belly}`);
  if (!Number.isFinite(parameters.noiseAmplitude) || parameters.noiseAmplitude < 0)
    throw new MeshGenError(`visualai: noiseAmplitude must be >= 0, got ${String(parameters.noiseAmplitude)}`);
  if (!Number.isFinite(parameters.noiseFrequency) || parameters.noiseFrequency <= 0)
    throw new MeshGenError(`visualai: noiseFrequency must be > 0, got ${String(parameters.noiseFrequency)}`);
  if (!Number.isInteger(parameters.noiseSeed)) throw new MeshGenError("visualai: noiseSeed must be an integer");
  let current = twistMesh(base, parameters.twist);
  current = bellyMesh(current, parameters.belly);
  if (parameters.noiseAmplitude > 0) {
    const radius = boundingRadius(current);
    const cycles = parameters.noiseFrequency / radius;
    const positions = new Float32Array(current.positions);
    for (let at = 0; at < positions.length; at += 3) {
      const x = positions[at];
      const y = positions[at + 1];
      const z = positions[at + 2];
      const noise = valueNoise2(x * cycles, y * cycles + z * 0.7 * cycles, parameters.noiseSeed) * 2 - 1;
      positions[at] = x + current.normals[at] * parameters.noiseAmplitude * radius * noise;
      positions[at + 1] = y + current.normals[at + 1] * parameters.noiseAmplitude * radius * noise;
      positions[at + 2] = z + current.normals[at + 2] * parameters.noiseAmplitude * radius * noise;
    }
    current = {
      positions,
      normals: averageNormals(positions, current.indices),
      uvs: current.uvs,
      indices: current.indices,
      counts: { ...current.counts },
    };
  }
  return current;
}

/**
 * Proposes `count` deterministic variations of a base mesh: every parameter
 * set samples the (seed, index, salt) hash stream inside the budget
 * ceilings, applies through applyvariation and labels itself with the
 * honest recipe. The same seed answers the same proposals byte for byte —
 * the determinism is the contract. Count refuses below 1 or above 64 with
 * MeshGenError (a proposal storm is a bug, never a feature).
 */
export function proposevariations(request: VariationRequest): MeshVariation[] {
  const budget = request.budget ?? DEFAULT_VARIATION_BUDGET;
  const count = Math.round(request.count);
  if (!Number.isInteger(count) || count < 1 || count > 64)
    throw new MeshGenError(`visualai: the variation count must be an integer 1..64, got ${String(request.count)}`);
  if (!Number.isInteger(request.seed)) throw new MeshGenError("visualai: the seed must be an integer");
  const seed = request.seed | 0;
  const variations: MeshVariation[] = [];
  for (let index = 0; index < count; index += 1) {
    const twistSign = sample(seed, index, 1) < 0.5 ? -1 : 1;
    const bellySign = sample(seed, index, 5) < 0.5 ? -1 : 1;
    const parameters: VariationParameters = {
      twist: twistSign * budget.maxTwist * sample(seed, index, 2),
      belly: bellySign * budget.maxBelly * sample(seed, index, 6),
      noiseAmplitude: budget.maxNoise * sample(seed, index, 3),
      noiseFrequency: Math.max(0.25, budget.maxNoiseFrequency * sample(seed, index, 4)),
      noiseSeed: Math.floor(sample(seed, index, 7) * 0x7fffffff) | 0,
    };
    const mesh = applyvariation(request.base, parameters);
    variations.push({
      id: `variation-${seed}-${index + 1}`,
      label: `procedural variation ${index + 1} of seed ${seed}: twist ${parameters.twist.toFixed(3)} rad/u, belly ${parameters.belly.toFixed(3)}, noise ${parameters.noiseAmplitude.toFixed(3)}r @ ${parameters.noiseFrequency.toFixed(2)} cycles/r`,
      parameters,
      mesh,
      provenance: "deterministic-procedural",
    });
  }
  return variations;
}

// ---------------------------------------------------------------------------
// seat 2: the keyframe auto-suggestion from payload stats
// ---------------------------------------------------------------------------

/** one motion-energy sample of a media payload: the time in seconds and the
 * motion energy the payload stats extracted at it (0..1 normalized by the
 * caller, or any positive scale — the detector z-scores its own series). */
export interface MotionSample {
  time: number;
  motion: number;
}

/** the suggestion options; every field carries an engine default. */
export interface KeyframeSuggestionOptions {
  /** how many suggestions to answer at most (default 5). */
  count?: number;
  /** the peak window in samples — a peak must beat every neighbor this far
   * on both sides (default 3). */
  window?: number;
  /** the minimum separation, in seconds, between two answered suggestions
   * (default 1). */
  minSeparationSeconds?: number;
  /** the minimum z-score a peak must carry to count (default 0.5 — honest
   * noise floors never manufacture peaks). */
  minZScore?: number;
}

/** one honest keyframe suggestion. */
export interface KeyframeSuggestion {
  /** the suggested keyframe time in seconds. */
  time: number;
  /** the normalized strength of the signal behind the suggestion (0..1). */
  score: number;
  /** why the seat suggested it — the honest reason, never a filler. */
  reason: "motion-peak" | "motion-step" | "quiet-settle";
}

/** the default options of the suggestion seat. */
export const DEFAULT_SUGGESTION_OPTIONS: Required<KeyframeSuggestionOptions> = {
  count: 5,
  window: 3,
  minSeparationSeconds: 1,
  minZScore: 0.5,
};

/** the mean and deviation of a motion series (the z-score floor). */
function statsOf(values: number[]): { mean: number; deviation: number } {
  if (values.length === 0) return { mean: 0, deviation: 0 };
  let sum = 0;
  for (const value of values) sum += value;
  const mean = sum / values.length;
  let variance = 0;
  for (const value of values) variance += (value - mean) * (value - mean);
  return { mean, deviation: Math.sqrt(variance / values.length) };
}

/**
 * Suggests keyframe times from a motion-energy series — the payload stats
 * lane. The detector is real: local maxima with prominence over the window
 * (a peak beats every neighbor window samples on both sides), z-scored
 * against the series' own mean and deviation, plus the honest secondary
 * reasons — a motion-step (the largest single-sample jump of the series)
 * and a quiet-settle (the calmest stretch after the loudest peak, the
 * natural hold keyframe). The strongest, best-separated instants answer
 * first, capped at count; when the series carries no honest signal (too
 * short, flat, or below the z floor) the seat answers fewer suggestions or
 * none — a refusal, never a filler. Invalid series (unsorted times,
 * non-finite values, fewer than 3 samples) answer null.
 */
export function suggestkeyframes(
  samples: readonly MotionSample[],
  options: KeyframeSuggestionOptions = {},
): KeyframeSuggestion[] | null {
  if (!Array.isArray(samples) || samples.length < 3) return null;
  let previousTime = Number.NEGATIVE_INFINITY;
  const values: number[] = [];
  for (const entry of samples) {
    if (!Number.isFinite(entry.time) || entry.time <= previousTime) return null;
    if (!Number.isFinite(entry.motion)) return null;
    previousTime = entry.time;
    values.push(entry.motion);
  }
  const count = Math.max(1, Math.round(options.count ?? DEFAULT_SUGGESTION_OPTIONS.count));
  const window = Math.max(1, Math.round(options.window ?? DEFAULT_SUGGESTION_OPTIONS.window));
  const minSeparation = Math.max(0, options.minSeparationSeconds ?? DEFAULT_SUGGESTION_OPTIONS.minSeparationSeconds);
  const minZScore = options.minZScore ?? DEFAULT_SUGGESTION_OPTIONS.minZScore;
  const { mean, deviation } = statsOf(values);
  // the candidate pool: every local maximum with honest prominence
  type Candidate = KeyframeSuggestion & { z: number };
  const candidates: Candidate[] = [];
  for (let at = window; at < samples.length - window; at += 1) {
    let isPeak = true;
    for (let offset = 1; offset <= window; offset += 1) {
      if (values[at] < values[at - offset] || values[at] < values[at + offset]) {
        isPeak = false;
        break;
      }
    }
    if (!isPeak) continue;
    const z = deviation > 1e-9 ? (values[at] - mean) / deviation : 0;
    if (z < minZScore) continue;
    candidates.push({ time: samples[at].time, score: Math.min(1, Math.max(0, z / 3)), reason: "motion-peak", z });
  }
  // the motion-step candidate: the largest single-sample jump
  let stepAt = -1;
  let stepJump = 0;
  for (let at = 1; at < samples.length; at += 1) {
    const jump = Math.abs(values[at] - values[at - 1]);
    if (jump > stepJump) {
      stepJump = jump;
      stepAt = at;
    }
  }
  if (stepAt >= 0 && deviation > 1e-9) {
    const z = stepJump / deviation;
    if (z >= minZScore) candidates.push({ time: samples[stepAt].time, score: Math.min(1, z / 3), reason: "motion-step", z });
  }
  // the quiet-settle candidate: the calmest window after the loudest peak
  let loudestAt = 0;
  for (let at = 1; at < samples.length; at += 1) if (values[at] > values[loudestAt]) loudestAt = at;
  if (loudestAt + window < samples.length && deviation > 1e-9) {
    let calmAt = loudestAt + 1;
    let calmValue = Number.POSITIVE_INFINITY;
    for (let at = loudestAt + 1; at < samples.length; at += 1) {
      if (values[at] < calmValue) {
        calmValue = values[at];
        calmAt = at;
      }
    }
    const z = (mean - values[calmAt]) / deviation;
    if (z > 0) candidates.push({ time: samples[calmAt].time, score: Math.min(1, z / 3), reason: "quiet-settle", z });
  }
  // the strongest first, the separation honored greedily
  candidates.sort((a, b) => b.z - a.z);
  const answered: KeyframeSuggestion[] = [];
  for (const candidate of candidates) {
    if (answered.length >= count) break;
    let separated = true;
    for (const picked of answered) {
      if (Math.abs(picked.time - candidate.time) < minSeparation) {
        separated = false;
        break;
      }
    }
    if (separated) answered.push({ time: candidate.time, score: candidate.score, reason: candidate.reason });
  }
  return answered;
}

/**
 * The honest confidence report of a motion series — the studio chip the
 * suggestion seat answers beside its proposals: how many peaks the detector
 * found, the series' own z floor and whether the signal is honest at all
 * (flat series answer ok: false — the seat never invents confidence).
 */
export function motionconfidence(samples: readonly MotionSample[]): { ok: boolean; peaks: number; mean: number; deviation: number } {
  if (!Array.isArray(samples) || samples.length < 3) return { ok: false, peaks: 0, mean: 0, deviation: 0 };
  const values = samples.map((entry) => entry.motion).filter((value) => Number.isFinite(value));
  if (values.length < 3) return { ok: false, peaks: 0, mean: 0, deviation: 0 };
  const { mean, deviation } = statsOf(values);
  if (deviation < 1e-9) return { ok: false, peaks: 0, mean, deviation };
  let peaks = 0;
  for (let at = 1; at < values.length - 1; at += 1) {
    if (values[at] > values[at - 1] && values[at] >= values[at + 1]) peaks += 1;
  }
  return { ok: peaks > 0, peaks, mean, deviation };
}
