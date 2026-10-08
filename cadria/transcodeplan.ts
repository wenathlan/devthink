// # transcodeplan — the declarative transcode planner of the family, housed at the cadria root.
// Library-grade module shipped inside the published packages (npm, maven with the Spring
// Boot rider): it owns the domain types and pure, generic helpers only — zero consumer
// data. A caller brings its own bitrate ladder and one probed source; the planner
// answers the runnable variants (never upscaled, even dimensions, codec-native
// containers, size estimates). The bitrate spellings follow the renderer flags of
// remotion ("4M", "2500K" — validated, never a bare number). The ladder is always a
// parameter: no resolution, bitrate or codec is ever hardcoded here. Encaixe: the
// player formats of versawase.ts (MP4/HLS/DASH rows) answer the variants this plan
// produces; the publishing pipeline feeds the plan to the encoders and the Sol pages
// render the ladder from the plan, never from a constant table.

/** A bitrate in the renderer spelling: an integer ending in "K"/"k" or "M". */
export type Bitrate = string;

/** One rung of a bitrate ladder (the caller owns the table — zero hardcode here). */
export interface TranscodeRung {
  /** the rung id ("1080p") — unique inside a ladder */
  id: string;
  /** the target video height in pixels (width follows the source aspect) */
  height: number;
  videoCodec: string;
  audioCodec: string;
  videoBitrate: Bitrate;
  audioBitrate: Bitrate;
  /** optional fps cap; the variant never exceeds the source fps */
  fps?: number;
  /** optional container override ("mp4", "webm"); defaults follow the video codec */
  container?: string;
}

/** One probed source (the shape mediaprobe.ts answers for a real file). */
export interface SourceMedia {
  width: number;
  height: number;
  durationSeconds: number;
  fps: number;
  videoCodec: string;
  audioCodec: string;
}

/** One runnable variant the planner derives from a rung and the source. */
export interface TranscodeVariant {
  rung: TranscodeRung;
  /** the scaled, even dimensions (aspect preserved, never upscaled) */
  width: number;
  height: number;
  /** the effective fps: min(source fps, rung cap) */
  fps: number;
  container: string;
  /** the encoded size estimate: (video + audio) bits × duration ÷ 8 */
  estimatedBytes: number;
}

/** The complete plan: the source, its runnable variants and the total estimate. */
export interface TranscodePlan {
  source: SourceMedia;
  /** ordered by target height, highest first */
  variants: TranscodeVariant[];
  estimatedBytes: number;
}

/** The planner options. */
export interface TranscodePlanOptions {
  /** keep at most this many rungs, highest quality first */
  maxRungs?: number;
}

/** Error raised by the planner for invalid ladders, sources or options. */
export class TranscodeError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = "TranscodeError";
  }
}

/** The decimal multipliers of the K/M spellings (the ffmpeg flag convention). */
const BITRATESUFFIXES: Record<string, number> = { K: 1_000, M: 1_000_000 };

/** Video codecs that default to the MP4 container (everything MPEG-ish). */
const MP4CODECS = new Set(["avc1", "avc3", "hvc1", "hev1", "mp4v", "av01"]);

/**
 * parseBitrate — parses a renderer-spelling bitrate into bits per second:
 * "4M" → 4 000 000, "2500K" → 2 500 000. Throws `TranscodeError` for bare
 * numbers (the remotion rule: an untyped 4000000 is a bug waiting to encode).
 *
 * @param value the bitrate spelling.
 * @returns the bitrate in bps.
 */
export function parseBitrate(value: Bitrate): number {
  if (typeof value !== "string") {
    throw new TranscodeError(`transcodeplan: bitrate must be a string ending in "K" or "M", got ${JSON.stringify(value)}`);
  }
  const suffix = value.slice(-1).toUpperCase();
  const multiplier = BITRATESUFFIXES[suffix];
  const digits = value.slice(0, -1);
  if (!multiplier || !/^\d+$/.test(digits)) {
    throw new TranscodeError(`transcodeplan: bitrate must end in "K" or "M", got ${JSON.stringify(value)}`);
  }
  const parsed = Number.parseInt(digits, 10) * multiplier;
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new TranscodeError(`transcodeplan: bitrate must be positive, got ${JSON.stringify(value)}`);
  }
  return parsed;
}

/**
 * evenDimension — floors a dimension to the even value the MPEG encoders
 * demand (never below 2).
 *
 * @param value the raw dimension.
 * @returns the even dimension.
 */
export function evenDimension(value: number): number {
  const floored = Math.floor(value);
  return Math.max(2, floored - (floored % 2));
}

/** The container a video codec encodes into when the rung does not name one. */
function defaultContainer(videoCodec: string): string {
  return MP4CODECS.has(videoCodec.toLowerCase()) ? "mp4" : "webm";
}

/**
 * validateRung — checks one rung of a ladder and throws `TranscodeError`
 * naming the rung id: heights are positive integers, codecs are short
 * tokens, bitrates parse and the fps cap, when given, is positive.
 *
 * @param rung the rung to validate.
 */
export function validateRung(rung: TranscodeRung): void {
  if (!rung.id || typeof rung.id !== "string") throw new TranscodeError("transcodeplan: every rung needs an id");
  if (!Number.isInteger(rung.height) || rung.height < 1) {
    throw new TranscodeError(`transcodeplan: rung "${rung.id}" height must be an integer >= 1, got ${rung.height}`);
  }
  for (const codec of [rung.videoCodec, rung.audioCodec]) {
    if (!/^[a-z0-9]{2,8}$/i.test(codec ?? "")) {
      throw new TranscodeError(`transcodeplan: rung "${rung.id}" codec must be a short token, got ${JSON.stringify(codec)}`);
    }
  }
  try {
    parseBitrate(rung.videoBitrate);
    parseBitrate(rung.audioBitrate);
  } catch (error) {
    throw new TranscodeError(`transcodeplan: rung "${rung.id}" carries an unreadable bitrate`, { cause: error });
  }
  if (rung.fps !== undefined && (!Number.isFinite(rung.fps) || rung.fps <= 0)) {
    throw new TranscodeError(`transcodeplan: rung "${rung.id}" fps cap must be positive, got ${rung.fps}`);
  }
  if (rung.container !== undefined && !/^[a-z0-9]{2,6}$/i.test(rung.container)) {
    throw new TranscodeError(`transcodeplan: rung "${rung.id}" container must be a short token, got ${rung.container}`);
  }
}

/**
 * validateSource — checks the probed source the plan builds from.
 *
 * @param source the source to validate.
 */
export function validateSource(source: SourceMedia): void {
  for (const [field, value] of [
    ["width", source.width],
    ["height", source.height],
  ] as const) {
    if (!Number.isInteger(value) || value < 1) {
      throw new TranscodeError(`transcodeplan: source ${field} must be an integer >= 1, got ${value}`);
    }
  }
  if (!Number.isFinite(source.durationSeconds) || source.durationSeconds <= 0) {
    throw new TranscodeError(`transcodeplan: source durationSeconds must be > 0, got ${source.durationSeconds}`);
  }
  if (!Number.isFinite(source.fps) || source.fps <= 0) {
    throw new TranscodeError(`transcodeplan: source fps must be > 0, got ${source.fps}`);
  }
}

/**
 * estimateVariantBytes — the encoded size estimate of one variant:
 * (video + audio) bits × duration ÷ 8. Estimates only — the encoder answers
 * the real size.
 *
 * @param videoBitrate the video bitrate spelling.
 * @param audioBitrate the audio bitrate spelling.
 * @param durationSeconds the source duration.
 * @returns the estimated bytes.
 */
export function estimateVariantBytes(videoBitrate: Bitrate, audioBitrate: Bitrate, durationSeconds: number): number {
  const bitsPerSecond = parseBitrate(videoBitrate) + parseBitrate(audioBitrate);
  return Math.ceil((bitsPerSecond * durationSeconds) / 8);
}

/**
 * buildTranscodePlan — derives the runnable variants from one probed source
 * and the caller's ladder. Rules: a rung never upscales (its height must fit
 * the source), dimensions preserve the source aspect and land on even values,
 * the effective fps is the rung cap clamped by the source fps and the
 * container follows the video codec unless the rung names one. The plan
 * orders variants highest-first and, with `maxRungs`, keeps the top of the
 * ladder.
 *
 * @param source the probed source.
 * @param ladder the caller's bitrate ladder (any order; validated in full).
 * @param options the planner options.
 * @returns the complete transcode plan.
 */
export function buildTranscodePlan(
  source: SourceMedia,
  ladder: readonly TranscodeRung[],
  options: TranscodePlanOptions = {},
): TranscodePlan {
  validateSource(source);
  if (!Array.isArray(ladder) || ladder.length === 0) {
    throw new TranscodeError("transcodeplan: the ladder must carry at least one rung");
  }
  for (const rung of ladder) validateRung(rung);
  const ids = new Set(ladder.map((rung) => rung.id));
  if (ids.size !== ladder.length) throw new TranscodeError("transcodeplan: rung ids must be unique inside a ladder");
  const fitting = ladder.filter((rung) => rung.height <= source.height);
  if (fitting.length === 0) {
    throw new TranscodeError(
      `transcodeplan: no rung fits the source (shortest rung ${Math.min(...ladder.map((rung) => rung.height))}px, source ${source.height}px)`,
    );
  }
  const ordered = [...fitting].sort((left, right) => right.height - left.height);
  const kept = options.maxRungs !== undefined ? ordered.slice(0, Math.max(0, options.maxRungs)) : ordered;
  const variants = kept.map((rung) => ({
    rung,
    width: evenDimension((source.width * rung.height) / source.height),
    height: rung.height,
    fps: rung.fps === undefined ? source.fps : Math.min(source.fps, rung.fps),
    container: rung.container ?? defaultContainer(rung.videoCodec),
    estimatedBytes: estimateVariantBytes(rung.videoBitrate, rung.audioBitrate, source.durationSeconds),
  }));
  return {
    source,
    variants,
    estimatedBytes: variants.reduce((sum, variant) => sum + variant.estimatedBytes, 0),
  };
}
