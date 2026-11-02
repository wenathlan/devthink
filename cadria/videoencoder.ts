// # videoencoder — the encoder facade of the versawase engine (the wave-4
// encoder doctrine, actions 201-230: the last mile ships real bytes, never
// mock buffers). One typed entry routes PixelImage frames through the real
// byte lanes this wave landed: pngencoder (the still lane — signature,
// IHDR, adaptive filters, real zlib, CRCs), gifencoder (the indexed
// animation lane — median-cut palette, real LZW, NETSCAPE loop) and
// webmencoder (the EBML container lane — Info/Tracks/Clusters over the
// cadria lossless frame codec). Every artifact answers the real bytes,
// the byte length, the frame count, the mime type and the real sha-256
// digest (node:crypto — the native lane), so a caller never trusts a
// digest without the bytes it names. Refusal is typed and honest (the
// VideoEncodeIssue taxonomy): no fake claim, no placeholder blob, no
// mock buffer. The estimate model of imageexport.ts stays beside this
// lane: the plan estimates, this encoder answers the truth.
// Exports: 1 type union, 5 functions, 3 constants, 2 interfaces.

import { createHash } from "node:crypto";
import type { PixelImage } from "./pixel.ts";
import { encodeGif, GifError, type GifEncodeOptions } from "./gifencoder.ts";
import { encodePng, PngError } from "./pngencoder.ts";
import { encodeWebmFrames, WebmError } from "./webmencoder.ts";

/** the real byte formats the facade routes through. */
export type VideoEncodeFormat = "png" | "webm" | "gif";

/** why an encode refused — typed, never a throw past the facade. */
export type VideoEncodeIssue =
  | "encode-empty" // no frames in the request
  | "encode-bad-frame" // a frame does not match the stream shape
  | "encode-bad-fps" // the fps is missing or not > 0
  | "encode-format"; // the format name is not one of the three lanes

/** the typed outcome: the artifact or the honest refusal. */
export type VideoEncodeOutcome = { ok: true; artifact: VideoArtifact } | { ok: false; issue: VideoEncodeIssue; detail: string };

/** one real encoded artifact: the bytes, the facts and the sha-256 of the bytes. */
export interface VideoArtifact {
  format: VideoEncodeFormat;
  /** the real encoded bytes — never a mock buffer. */
  bytes: Uint8Array;
  /** the byte count of the encoded artifact. */
  byteLength: number;
  /** the frames the artifact carries (1 for the png still lane). */
  frames: number;
  width: number;
  height: number;
  /** the frame rate the animation lanes ride (null on the png still lane). */
  fps: number | null;
  /** the internet media type of the artifact. */
  mime: string;
  /** the real sha-256 digest of the bytes (hex). */
  sha256: string;
}

/** the encode options of the facade. */
export interface VideoEncodeOptions {
  /** the format lane: png (still), webm (EBML) or gif (indexed). */
  format: VideoEncodeFormat;
  /** the frame rate (required for webm/gif, ignored by the png still lane). */
  fps?: number;
  /** the gif delay per frame in milliseconds (default: the fps grid). */
  delayMs?: number;
  /** the gif loop count (0 = forever, the default). */
  loop?: number;
  /** the gif color budget (default 256). */
  maxColors?: number;
  /** the webm cluster window (default 30 frames). */
  clusterFrames?: number;
}

/** the internet media types of the three lanes. */
export const VIDEO_MIME: Record<VideoEncodeFormat, string> = {
  png: "image/png",
  webm: "video/webm",
  gif: "image/gif",
};

/** the file extensions of the three lanes. */
export const VIDEO_EXTENSION: Record<VideoEncodeFormat, string> = {
  png: "png",
  webm: "webm",
  gif: "gif",
};

/** the real sha-256 digest of the bytes (hex, the native node:crypto lane). */
export function videoSha256(bytes: Uint8Array): string {
  return createHash("sha256").update(bytes).digest("hex");
}

/** validates the frame list against the stream shape; answers the refusal or null. */
function frameIssue(frames: readonly PixelImage[]): { issue: VideoEncodeIssue; detail: string } | null {
  if (!Array.isArray(frames) || frames.length === 0) {
    return { issue: "encode-empty", detail: "the encode request carries no frames" };
  }
  const first = frames[0];
  if (
    !Number.isInteger(first?.width) ||
    !Number.isInteger(first?.height) ||
    first.width < 1 ||
    first.height < 1 ||
    !first?.data ||
    first.data.length !== first.width * first.height * 4
  ) {
    return { issue: "encode-bad-frame", detail: "frame 0 is not a width x height x 4 RGBA image" };
  }
  for (let at = 1; at < frames.length; at += 1) {
    const frame = frames[at];
    if (frame.width !== first.width || frame.height !== first.height) {
      return {
        issue: "encode-bad-frame",
        detail: `frame ${at} is ${frame.width}x${frame.height}, the stream is ${first.width}x${first.height}`,
      };
    }
    if (!frame.data || frame.data.length !== first.width * first.height * 4) {
      return { issue: "encode-bad-frame", detail: `frame ${at} carries ${frame.data?.length ?? 0} bytes, expected ${first.width * first.height * 4}` };
    }
  }
  return null;
}

/** the typed refusal of the facade. */
function refuse(issue: VideoEncodeIssue, detail: string): VideoEncodeOutcome {
  return { ok: false, issue, detail };
}

/**
 * encodeVideoFrames — the one real entry: routes the frames through the
 * format lane and answers the artifact (bytes, facts, sha-256). The png
 * lane ships the first frame as the still; the webm lane muxes every
 * frame over the cadria lossless frame codec; the gif lane quantizes the
 * palette across every frame and LZW-compresses each. The lane errors
 * (PngError, WebmError, GifError) fold into the typed refusal — the
 * facade never throws past its contract.
 *
 * @param frames the frames to encode (all one size).
 * @param options the format, the fps and the lane options.
 * @returns the artifact or the typed refusal.
 */
export function encodeVideoFrames(frames: readonly PixelImage[], options: VideoEncodeOptions): VideoEncodeOutcome {
  const format = options?.format;
  if (format !== "png" && format !== "webm" && format !== "gif") {
    return refuse("encode-format", `unknown format ${JSON.stringify(format)} — expected png, webm or gif`);
  }
  const frameProblem = frameIssue(frames);
  if (frameProblem) return refuse(frameProblem.issue, frameProblem.detail);
  const first = frames[0];
  if (format === "png") {
    try {
      const bytes = encodePng(first);
      return {
        ok: true,
        artifact: {
          format,
          bytes,
          byteLength: bytes.length,
          frames: 1,
          width: first.width,
          height: first.height,
          fps: null,
          mime: VIDEO_MIME.png,
          sha256: videoSha256(bytes),
        },
      };
    } catch (error) {
      return refuse("encode-bad-frame", error instanceof PngError ? error.message : String(error));
    }
  }
  const fps = options.fps;
  if (typeof fps !== "number" || !Number.isFinite(fps) || fps <= 0) {
    return refuse("encode-bad-fps", `${format} needs a finite fps > 0, got ${String(options.fps)}`);
  }
  if (format === "webm") {
    try {
      const bytes = encodeWebmFrames(
        frames.map((pixels) => ({ pixels })),
        { fps, width: first.width, height: first.height, clusterFrames: options.clusterFrames },
      );
      return {
        ok: true,
        artifact: {
          format,
          bytes,
          byteLength: bytes.length,
          frames: frames.length,
          width: first.width,
          height: first.height,
          fps,
          mime: VIDEO_MIME.webm,
          sha256: videoSha256(bytes),
        },
      };
    } catch (error) {
      return refuse("encode-bad-frame", error instanceof WebmError ? error.message : String(error));
    }
  }
  try {
    const gifOptions: GifEncodeOptions = {
      delayMs: options.delayMs ?? Math.round(1000 / fps),
      loop: options.loop,
      maxColors: options.maxColors,
    };
    const bytes = encodeGif(frames.map((image) => ({ image })), gifOptions);
    return {
      ok: true,
      artifact: {
        format,
        bytes,
        byteLength: bytes.length,
        frames: frames.length,
        width: first.width,
        height: first.height,
        fps,
        mime: VIDEO_MIME.gif,
        sha256: videoSha256(bytes),
      },
    };
  } catch (error) {
    return refuse("encode-bad-frame", error instanceof GifError ? error.message : String(error));
  }
}
