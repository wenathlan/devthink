// # versawasecomposition — the composition document of the cadria video
// studio: the structured payload a timeline project serializes to and the
// Saddle render lane consumes. Where timelineedit.ts owns the tick-space
// edit algebra of one track, this module owns the whole-document shape —
// tracks (video, audio, text), clips with media windows and playback rate,
// the shadercomp effect stack per clip, the transition on the cut (the
// gl-transitions name catalog) and the frame the whole thing renders at.
// Every mutation answers the new document or a typed refusal — never a
// throw, never a mutation — and the JSON lane is a real round trip:
// serialize answers a deterministic byte-for-byte payload, parse answers
// the same document back after validating every rule again (a document
// that only the writer can read is not a format). The composition carries
// its own Saddle plan: the same sliced-render planner the render lane
// rides (versawaseslices) cuts the composition duration into frame-aligned
// slices, so the heavy rasterization happens on the edge farm over the
// standard transport — the visitor GPU is never touched by the render
// lane, exactly the doctrine the engine records.

import { createHash } from "node:crypto";
import { SHADER_EFFECTS, type ShaderEffectId } from "./shadercomp.ts";
import { planSlices, type RenderSlice } from "./versawaseslices.ts";

/** the track kinds a composition carries. */
export type TrackKind = "video" | "audio" | "text";

/** one effect of a clip stack: a shadercomp library id plus its amount. */
export interface ClipEffect {
  /** the compositor effect id (validated against the shadercomp library). */
  effectId: ShaderEffectId;
  /** the effect amount inside the library's honest range. */
  amount: number;
  /** whether the effect is active in the stack (bypassed effects stay authored). */
  enabled: boolean;
}

/** the transition glued on a clip's leading cut. */
export interface ClipTransition {
  /** a gl-transitions catalog name (validated against GL_TRANSITIONS). */
  name: string;
  /** how long the transition overlaps, in seconds (inside the clip span). */
  durationSeconds: number;
}

/** one clip: a timeline span plus the media window it shows. */
export interface CompositionClip {
  id: string;
  /** the track this clip rides. */
  trackId: string;
  /** timeline start in seconds (>= 0). */
  startSeconds: number;
  /** timeline duration in seconds (> 0). */
  durationSeconds: number;
  /** media in-point in seconds (>= 0). */
  sourceIn: number;
  /** playback rate: media seconds per timeline second (> 0). */
  speed: number;
  /** the effect stack applied to this clip, in order. */
  effects: readonly ClipEffect[];
  /** the transition on the clip's leading cut, when one is authored. */
  transition?: ClipTransition;
}

/** one track of the composition. */
export interface CompositionTrack {
  id: string;
  kind: TrackKind;
  /** the clips of the track, in authored order. */
  clips: readonly CompositionClip[];
}

/** the whole composition document. */
export interface VideoComposition {
  id: string;
  name: string;
  /** the frame rate the composition renders at (> 0). */
  fps: number;
  /** raster width in pixels (positive, even per the transcode doctrine). */
  width: number;
  /** raster height in pixels (positive, even per the transcode doctrine). */
  height: number;
  tracks: readonly CompositionTrack[];
}

/** every way a composition request can honestly refuse (by return type). */
export type CompositionIssue =
  | "duplicate-track"
  | "unknown-track"
  | "duplicate-clip"
  | "overlap"
  | "bad-span"
  | "bad-speed"
  | "unknown-transition"
  | "bad-transition-span"
  | "unknown-effect"
  | "bad-amount"
  | "bad-format"
  | "bad-fps"
  | "bad-dimensions"
  | "bad-name"
  | "bad-id";

/** either the new document (or payload) or the reason nothing happened. */
export type CompositionOutcome<T> = { ok: true; value: T } | { ok: false; error: CompositionIssue };

/**
 * The canonical gl-transitions name set the engine recognizes on a cut —
 * the same public collection of webgl transitions (bounces, wipes, warps,
 * page curls) every player of the family names its cuts by. The catalog
 * ships names: each entry's sources and uniforms live in the upstream
 * collection, precompiled and served the shadercomp way.
 */
export const GL_TRANSITIONS: readonly string[] = [
  "Bounce",
  "BowTieHorizontal",
  "BowTieVertical",
  "ButterflyWaveScrawler",
  "CircleCrop",
  "ColourDistance",
  "CrazyParametricFun",
  "CrossZoom",
  "DirectionalSlide",
  "DoomScreenTransition",
  "Dreamy",
  "EdgeTransition",
  "FilmBurn",
  "GlitchDisplace",
  "Heart",
  "InvertedPageCurl",
  "LeftDrawer",
  "Mosaic",
  "PolkaDotsCurtain",
  "Radial",
  "RightDrawer",
  "Roll",
  "RotateScaleFade",
  "SimpleZoom",
  "StereoViewer",
  "Swap",
  "Swirl",
  "WaterDrop",
  "ZoomInCircles",
];

/** whether a transition name rides the gl-transitions catalog. */
export function isKnownTransition(name: string): boolean {
  return GL_TRANSITIONS.includes(name);
}

/** the effect library row of one id, when it exists. */
function effectRow(effectId: string) {
  return SHADER_EFFECTS.find((effect) => effect.id === effectId);
}

/** exclusive timeline end of a clip. */
export function clipEndSeconds(clip: CompositionClip): number {
  return clip.startSeconds + clip.durationSeconds;
}

/** the total duration of a composition — the furthest clip end over every track (0 when empty). */
export function compositionDurationSeconds(composition: VideoComposition): number {
  let duration = 0;
  for (const track of composition.tracks) {
    for (const clip of track.clips) {
      const end = clipEndSeconds(clip);
      if (end > duration) duration = end;
    }
  }
  return duration;
}

/** validates one clip against the library catalogs and the honest ranges. */
function clipIssue(clip: CompositionClip): CompositionIssue | null {
  if (typeof clip.id !== "string" || clip.id.length === 0) return "bad-id";
  if (typeof clip.trackId !== "string" || clip.trackId.length === 0) return "bad-id";
  if (!Number.isFinite(clip.startSeconds) || clip.startSeconds < 0 || !Number.isFinite(clip.durationSeconds) || clip.durationSeconds <= 0)
    return "bad-span";
  if (!Number.isFinite(clip.speed) || clip.speed <= 0) return "bad-speed";
  if (!Number.isFinite(clip.sourceIn) || clip.sourceIn < 0) return "bad-span";
  for (const effect of clip.effects ?? []) {
    const row = effectRow(effect.effectId);
    if (!row) return "unknown-effect";
    if (typeof effect.amount !== "number" || !Number.isFinite(effect.amount) || effect.amount < row.minAmount || effect.amount > row.maxAmount)
      return "bad-amount";
  }
  if (clip.transition !== undefined) {
    if (!isKnownTransition(clip.transition.name)) return "unknown-transition";
    if (
      !Number.isFinite(clip.transition.durationSeconds) ||
      clip.transition.durationSeconds <= 0 ||
      clip.transition.durationSeconds > clip.durationSeconds
    )
      return "bad-transition-span";
  }
  return null;
}

/** whether two half-open clip spans share any timeline instant. */
function spansOverlap(a: CompositionClip, b: CompositionClip): boolean {
  return a.startSeconds < clipEndSeconds(b) && b.startSeconds < clipEndSeconds(a);
}

/** validates the whole document shape (parse lane) — every rule, one pass. */
function documentIssue(document: VideoComposition): CompositionIssue | null {
  if (typeof document.id !== "string" || document.id.length === 0) return "bad-id";
  if (typeof document.name !== "string" || document.name.length === 0) return "bad-name";
  if (!Number.isFinite(document.fps) || document.fps <= 0) return "bad-fps";
  if (!Number.isInteger(document.width) || document.width <= 0 || document.width % 2 !== 0) return "bad-dimensions";
  if (!Number.isInteger(document.height) || document.height <= 0 || document.height % 2 !== 0) return "bad-dimensions";
  if (!Array.isArray(document.tracks)) return "bad-format";
  const trackIds = new Set<string>();
  const clipIds = new Set<string>();
  for (const track of document.tracks) {
    if (typeof track.id !== "string" || track.id.length === 0) return "bad-id";
    if (trackIds.has(track.id)) return "duplicate-track";
    trackIds.add(track.id);
    if (track.kind !== "video" && track.kind !== "audio" && track.kind !== "text") return "bad-format";
    if (!Array.isArray(track.clips)) return "bad-format";
    const placed: CompositionClip[] = [];
    for (const clip of track.clips) {
      const issue = clipIssue(clip);
      if (issue) return issue;
      if (clipIds.has(clip.id)) return "duplicate-clip";
      clipIds.add(clip.id);
      if (clip.trackId !== track.id) return "unknown-track";
      if (placed.some((other) => spansOverlap(other, clip))) return "overlap";
      placed.push(clip);
    }
  }
  return null;
}

/** adds one track to the composition (the id must be fresh). */
export function addTrack(composition: VideoComposition, track: CompositionTrack): CompositionOutcome<VideoComposition> {
  if (typeof track.id !== "string" || track.id.length === 0) return { ok: false, error: "bad-id" };
  if (track.kind !== "video" && track.kind !== "audio" && track.kind !== "text") return { ok: false, error: "bad-format" };
  if (composition.tracks.some((existing) => existing.id === track.id)) return { ok: false, error: "duplicate-track" };
  const clips: CompositionClip[] = [];
  const clipIds = new Set<string>();
  for (const clip of track.clips ?? []) {
    const issue = clipIssue(clip);
    if (issue) return { ok: false, error: issue };
    if (clip.trackId !== track.id) return { ok: false, error: "unknown-track" };
    if (clipIds.has(clip.id)) return { ok: false, error: "duplicate-clip" };
    if (clips.some((other) => spansOverlap(other, clip))) return { ok: false, error: "overlap" };
    clipIds.add(clip.id);
    clips.push(clip);
  }
  return { ok: true, value: { ...composition, tracks: [...composition.tracks, { ...track, clips }] } };
}

/** adds one clip to its track (the span must be free, the ids fresh, the catalogs satisfied). */
export function addClip(composition: VideoComposition, clip: CompositionClip): CompositionOutcome<VideoComposition> {
  const issue = clipIssue(clip);
  if (issue) return { ok: false, error: issue };
  const track = composition.tracks.find((existing) => existing.id === clip.trackId);
  if (!track) return { ok: false, error: "unknown-track" };
  const duplicate =
    clip.id.length === 0 ||
    composition.tracks.some((existing) => existing.clips.some((other) => other.id === clip.id));
  if (duplicate) return { ok: false, error: "duplicate-clip" };
  if (track.clips.some((other) => spansOverlap(other, clip))) return { ok: false, error: "overlap" };
  return {
    ok: true,
    value: {
      ...composition,
      tracks: composition.tracks.map((existing) =>
        existing.id === track.id ? { ...existing, clips: [...existing.clips, clip] } : existing,
      ),
    },
  };
}

/** serializes one clip to its plain json shape (fixed key order — the format IS the order). */
function clipToJson(clip: CompositionClip): Record<string, unknown> {
  const json: Record<string, unknown> = {
    id: clip.id,
    trackId: clip.trackId,
    startSeconds: clip.startSeconds,
    durationSeconds: clip.durationSeconds,
    sourceIn: clip.sourceIn,
    speed: clip.speed,
    effects: clip.effects.map((effect) => ({ effectId: effect.effectId, amount: effect.amount, enabled: effect.enabled })),
  };
  if (clip.transition !== undefined)
    json.transition = { name: clip.transition.name, durationSeconds: clip.transition.durationSeconds };
  return json;
}

/** the plain json shape of the whole document (deterministic — byte-stable for one document). */
export function compositionJson(composition: VideoComposition): Record<string, unknown> {
  return {
    id: composition.id,
    name: composition.name,
    fps: composition.fps,
    width: composition.width,
    height: composition.height,
    tracks: composition.tracks.map((track) => ({
      id: track.id,
      kind: track.kind,
      clips: track.clips.map(clipToJson),
    })),
  };
}

/** the serialized payload of a composition — the structured bytes the family transports. */
export function serializeComposition(composition: VideoComposition): string {
  return JSON.stringify(compositionJson(composition));
}

/** the sha-256 of the serialized payload — the identity the render lane dedupes by. */
export function compositionFingerprint(composition: VideoComposition): string {
  return createHash("sha256").update(serializeComposition(composition), "utf8").digest("hex");
}

/**
 * Parses a serialized payload back into a composition: json damage answers
 * bad-format, and every document rule is validated again on the way in —
 * a payload that skips the rules is refused no matter who wrote it.
 */
export function parseComposition(payload: string): CompositionOutcome<VideoComposition> {
  let parsed: unknown;
  try {
    parsed = JSON.parse(payload);
  } catch {
    return { ok: false, error: "bad-format" };
  }
  if (typeof parsed !== "object" || parsed === null) return { ok: false, error: "bad-format" };
  const candidate = parsed as VideoComposition;
  const issue = documentIssue(candidate);
  if (issue) return { ok: false, error: issue };
  return { ok: true, value: candidate };
}

/**
 * The Saddle render plan of a composition: the sliced-render planner cuts
 * the composition duration into frame-aligned slices (the doctrine's ten
 * second grid by default), so the edge farm rasterizes in parallel over
 * the standard transport and the preview equals the final artifact — the
 * visitor GPU is never part of the render lane.
 */
export function compositionSlicePlan(composition: VideoComposition, sliceSeconds = 10): readonly RenderSlice[] {
  return planSlices({
    durationSeconds: compositionDurationSeconds(composition),
    fps: composition.fps,
    sliceSeconds,
  });
}
