/**
 * video — consolidated video engine logics of the cadria family.
 * @module video
 * @family wave/logicfold2
 * One keyed file per family: the former variant arms (videodecode, videoencoder)
 * retired into this seat with every export preserved under the same name.
 */

import { GifEncodeOptions, GifError, encodeGif } from "./gifencoder.ts";
import { PixelImage } from "./pixel.ts";
import { PngError, encodePng } from "./pngencoder.ts";
import { DEFAULT_FRAME_RATE, FrameRate, addticks, clampticks, formattimecode, frameat, frameduration, framelabel, framerate, snaptick, ticksfromseconds, tickstoseconds } from "./timeticks.ts";
import { WebmError, encodeWebmFrames } from "./webmencoder.ts";
import { createHash } from "node:crypto";

/* ===== block: videodecode ===== */
// # videodecode — the video decode arm of the versawase engine, housed at the
// cadria root beside timeticks. Phase 1 of the video plan: frame-accurate
// playback over the browser's own media decoder. The HTMLVideoElement is the
// platform decode arm of this phase; WebCodecs stays a future seam behind the
// same session contract, so the callers never learn which decoder ran. Every
// position the engine reasons about is an exact integer tick count —
// timeticks.ts owns all conversion math and this file never re-derives it —
// so seeks and steps land on frame boundaries of the session's rational frame
// rate and never drift. House rules hold: every call answers a typed outcome
// or snapshot, nothing throws on damaged input, no hidden globals, no
// hard-coded rates or sizes, and the element this file creates is released by
// this file (object URLs revoked, element detached and emptied). The session
// is the only mutable cell; everything else is pure over it. Non-goals: no
// container demuxing (mediaprobe owns inspection), no edit algebra
// (timelineedit.ts), no compositing or shader effects (later phases of the
// versawase surface). Exports: 7 types, 18 functions — the honest count for
// this theme.



/** why a decode call refused: `source` (bad input), `state` (closed session / missing metadata), `range` (outside the media), `codec` (browser refused the media). */
export type DecodeIssueCode = "source" | "state" | "range" | "codec";

/** the typed refusal a decode call answers instead of a value — never a throw. */
export type DecodeIssue = { code: DecodeIssueCode; detail: string };

/** the house outcome union: `{ ok: true, value }` or `{ ok: false, issue }`. */
export type DecodeOutcome<T> = { ok: true; value: T } | { ok: false; issue: DecodeIssue };

/** the lifecycle of one session as the snapshot reports it. */
export type DecodeState = "loading" | "ready" | "playing" | "paused" | "ended";

/** one poll of the session — the engine's whole observable truth, ticks first. */
export type DecodeSnapshot = {
  state: DecodeState;
  /** current presentation position, exact integer ticks. */
  ticks: number;
  /** total media duration in ticks (0 while the container can't say). */
  durationTicks: number;
  /** index of the frame presented at `ticks` (floor). */
  frame: number;
  /** frame count implied by the duration and the session rate (0 while unknown). */
  frames: number;
  /** the rational rate positions quantize to (a copy — callers can't reach the cell). */
  rate: FrameRate;
  /** true while the element is mid-seek. */
  seeking: boolean;
  /** the element's own readiness (HTMLMediaElement.readyState, 0–4). */
  readiness: number;
};

/** an open decode session: one element, one source, one rational rate identity. */
export type DecodeSession = {
  /** the src the element plays (an object URL for blobs, the given url otherwise). */
  readonly source: string;
  /** the rational rate positions quantize to (mutable via setratedecode). */
  rate: FrameRate;
  /** the module-created element; callers style and place it, never replace it. */
  readonly element: HTMLVideoElement;
  /** true once disposedecode ran — every later call refuses with a `state` issue. */
  disposed: boolean;
  /** the object URL this session owns (null when the source was already a url). */
  readonly objectUrl: string | null;
};

/** open options: the rate identity and the initial mute (autoplay policies punish unmuted programmatic play). */
export type DecodeOptions = {
  rate?: FrameRate;
  muted?: boolean;
};

function ok<T>(value: T): DecodeOutcome<T> {
  return { ok: true, value };
}

function refuse<T>(code: DecodeIssueCode, detail: string): DecodeOutcome<T> {
  return { ok: false, issue: { code, detail } };
}

/** the shared closed-session gate: null means alive, an outcome means refused. */
function gate<T>(session: DecodeSession): DecodeOutcome<T> | null {
  return session.disposed ? refuse<T>("state", "the decode session is closed") : null;
}

/** the frame-step clamp — absurd deltas saturate instead of overflowing the tick space. */
const MAX_STEP_FRAMES = 1_000_000;

/**
 * opens a decode session over a url, File or Blob. Resolves when the metadata
 * is in (duration and dimensions known) or refuses with a `source`/`codec`
 * issue — the promise never rejects. The session owns its object URL for
 * blob sources; disposedecode revokes it.
 */
export function opendecode(
  source: string | File | Blob,
  options: DecodeOptions = {},
): Promise<DecodeOutcome<DecodeSession>> {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || typeof document === "undefined") {
      resolve(refuse("state", "videodecode needs a browser document — there is no decoder headless"));
      return;
    }
    let objectUrl: string | null = null;
    let src: string;
    if (typeof source === "string") {
      if (source.trim() === "") {
        resolve(refuse("source", "the media url is empty"));
        return;
      }
      src = source;
    } else {
      try {
        objectUrl = URL.createObjectURL(source);
      } catch {
        resolve(refuse("source", "the browser refused to read this blob"));
        return;
      }
      src = objectUrl;
    }
    const wanted = options.rate ?? DEFAULT_FRAME_RATE;
    const rate = framerate(wanted.num, wanted.den);
    const element = document.createElement("video");
    element.preload = "auto";
    element.playsInline = true;
    element.muted = options.muted ?? false;
    const finish = (outcome: DecodeOutcome<DecodeSession>) => {
      element.removeEventListener("loadedmetadata", onReady);
      element.removeEventListener("error", onError);
      if (!outcome.ok && objectUrl !== null) URL.revokeObjectURL(objectUrl);
      resolve(outcome);
    };
    const onReady = () =>
      finish(
        ok({
          source: src,
          rate,
          element,
          disposed: false,
          objectUrl,
        }),
      );
    const onError = () => {
      const code = element.error?.code;
      finish(
        refuse(
          "codec",
          code === undefined
            ? "the decoder refused this media before reporting a reason"
            : `the decoder refused this media (media error ${code})`,
        ),
      );
    };
    element.addEventListener("loadedmetadata", onReady, { once: true });
    element.addEventListener("error", onError, { once: true });
    element.src = src;
    element.load();
  });
}

/** closes the session: pause, release the decoder, detach the element, revoke the object URL. Idempotent. */
export function disposedecode(session: DecodeSession): void {
  if (session.disposed) return;
  session.disposed = true;
  try {
    session.element.pause();
  } catch {
    // a paused dead element is still a released element — the release continues
  }
  session.element.removeAttribute("src");
  session.element.load();
  session.element.remove();
  if (session.objectUrl !== null) URL.revokeObjectURL(session.objectUrl);
}

/** total media duration in exact ticks; 0 while the container can't say (streams). */
export function durationticks(session: DecodeSession): DecodeOutcome<number> {
  const blocked = gate<number>(session);
  if (blocked) return blocked;
  const d = session.element.duration;
  if (!Number.isFinite(d) || d <= 0) return ok(0);
  return ok(ticksfromseconds(d));
}

/** snaps an arbitrary tick position to a frame boundary of the session rate (floor, nearest or ceil). */
export function quantizeticks(
  session: DecodeSession,
  ticks: number,
  mode: "floor" | "nearest" | "ceil" = "nearest",
): DecodeOutcome<number> {
  const blocked = gate<number>(session);
  if (blocked) return blocked;
  return ok(snaptick(session.rate, ticks, mode));
}

/** frame-quantized seek: clamps into the media, snaps to the frame grid, moves the element. Answers the exact tick requested. */
export function seekticks(
  session: DecodeSession,
  ticks: number,
  mode: "floor" | "nearest" | "ceil" = "nearest",
): DecodeOutcome<number> {
  const blocked = gate<number>(session);
  if (blocked) return blocked;
  const d = session.element.duration;
  if (!Number.isFinite(d)) return refuse("state", "duration unknown — the seek waits for the metadata to load");
  const target = clampticks(snaptick(session.rate, ticks, mode), 0, ticksfromseconds(d));
  try {
    session.element.currentTime = tickstoseconds(target);
  } catch {
    return refuse("range", "the element refused this position");
  }
  return ok(target);
}

/** steps `deltaFrames` frames from the current position (negative walks back), clamped into the media. */
export function stepdecode(session: DecodeSession, deltaFrames: number): DecodeOutcome<number> {
  const blocked = gate<number>(session);
  if (blocked) return blocked;
  const d = session.element.duration;
  if (!Number.isFinite(d)) return refuse("state", "duration unknown — the step waits for the metadata to load");
  const df = Math.max(-MAX_STEP_FRAMES, Math.min(MAX_STEP_FRAMES, Math.trunc(deltaFrames)));
  const current = snaptick(session.rate, ticksfromseconds(session.element.currentTime || 0), "nearest");
  const target = clampticks(addticks(current, df * frameduration(session.rate)), 0, ticksfromseconds(d));
  try {
    session.element.currentTime = tickstoseconds(target);
  } catch {
    return refuse("range", "the element refused this position");
  }
  return ok(target);
}

/** asks the element to play. The outcome says the request was issued; polldecode says the truth (autoplay policies may hold). */
export function playdecode(session: DecodeSession): DecodeOutcome<"playing"> {
  const blocked = gate<"playing">(session);
  if (blocked) return blocked;
  const request = session.element.play();
  if (request && typeof request.then === "function") request.catch(() => undefined);
  return ok("playing");
}

/** pauses at the current position. */
export function pausedecode(session: DecodeSession): DecodeOutcome<"paused"> {
  const blocked = gate<"paused">(session);
  if (blocked) return blocked;
  session.element.pause();
  return ok("paused");
}

/** pauses and rewinds to the exact start of frame 0. */
export function stopdecode(session: DecodeSession): DecodeOutcome<number> {
  const blocked = gate<number>(session);
  if (blocked) return blocked;
  session.element.pause();
  return seekticks(session, 0, "floor");
}

/** replaces the session's rate identity (the grid positions snap to) — playback speed is separate. */
export function setratedecode(session: DecodeSession, rate: FrameRate): DecodeOutcome<FrameRate> {
  const blocked = gate<FrameRate>(session);
  if (blocked) return blocked;
  session.rate = framerate(rate.num, rate.den);
  return ok({ ...session.rate });
}

/** sets the playback speed as a rational multiple; the element clamps to its own supported band. */
export function setspeeddecode(session: DecodeSession, num: number, den: number): DecodeOutcome<number> {
  const blocked = gate<number>(session);
  if (blocked) return blocked;
  const r = framerate(num, den);
  const speed = r.num / r.den;
  if (!Number.isFinite(speed) || speed <= 0) return refuse("range", "the speed must be a positive rational");
  session.element.playbackRate = Math.min(16, Math.max(0.0625, speed));
  return ok(speed);
}

/** mutes or unmutes the session's audio. */
export function setmuteddecode(session: DecodeSession, muted: boolean): DecodeOutcome<boolean> {
  const blocked = gate<boolean>(session);
  if (blocked) return blocked;
  session.element.muted = muted;
  return ok(muted);
}

/** sets the volume in [0, 1]; out-of-band values clamp instead of refusing. */
export function setvolumedecode(session: DecodeSession, volume: number): DecodeOutcome<number> {
  const blocked = gate<number>(session);
  if (blocked) return blocked;
  const v = Number.isFinite(volume) ? Math.min(1, Math.max(0, volume)) : 1;
  session.element.volume = v;
  return ok(v);
}

/** places the session's element inside a container (created once by opendecode, styled for letterboxed fit). Idempotent. */
export function attachdecode(session: DecodeSession, container: HTMLElement): DecodeOutcome<HTMLElement> {
  const blocked = gate<HTMLElement>(session);
  if (blocked) return blocked;
  const el = session.element;
  el.style.width = "100%";
  el.style.height = "100%";
  el.style.objectFit = "contain";
  el.style.display = "block";
  el.style.background = "transparent";
  if (el.parentElement !== container) {
    el.remove();
    container.appendChild(el);
  }
  return ok(container);
}

/** takes the element out of the document without closing the session. */
export function detachdecode(session: DecodeSession): DecodeOutcome<true> {
  const blocked = gate<true>(session);
  if (blocked) return blocked;
  session.element.remove();
  return ok(true);
}

/** one observation of the session: state, exact position, frame grid math, readiness. Never throws, safe on closed sessions (zeros). */
export function polldecode(session: DecodeSession): DecodeSnapshot {
  if (session.disposed) {
    return {
      state: "loading",
      ticks: 0,
      durationTicks: 0,
      frame: 0,
      frames: 0,
      rate: { ...session.rate },
      seeking: false,
      readiness: 0,
    };
  }
  const el = session.element;
  const durationTicks = Number.isFinite(el.duration) && el.duration > 0 ? ticksfromseconds(el.duration) : 0;
  const ticks = ticksfromseconds(el.currentTime || 0);
  const state: DecodeState = el.readyState < 2 ? "loading" : el.ended ? "ended" : el.paused ? "paused" : "playing";
  return {
    state,
    ticks,
    durationTicks,
    frame: frameat(session.rate, ticks),
    frames: durationTicks > 0 ? frameat(session.rate, durationTicks) + 1 : 0,
    rate: { ...session.rate },
    seeking: el.seeking,
    readiness: el.readyState,
  };
}

/** the SMPTE display of a tick position at the session's rate — a thin delegation to timeticks (the display lives there). */
export function timecodelabel(session: DecodeSession, ticks: number, dropFrame = false): string {
  return formattimecode(ticks, session.rate, dropFrame);
}

/** the human label of the session's rate ("24", "23.976"). */
export function ratelabel(session: DecodeSession): string {
  return framelabel(session.rate);
}
/* ===== block: videoencoder ===== */
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
function refusevideoencoder(issue: VideoEncodeIssue, detail: string): VideoEncodeOutcome {
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
    return refusevideoencoder("encode-format", `unknown format ${JSON.stringify(format)} — expected png, webm or gif`);
  }
  const frameProblem = frameIssue(frames);
  if (frameProblem) return refusevideoencoder(frameProblem.issue, frameProblem.detail);
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
      return refusevideoencoder("encode-bad-frame", error instanceof PngError ? error.message : String(error));
    }
  }
  const fps = options.fps;
  if (typeof fps !== "number" || !Number.isFinite(fps) || fps <= 0) {
    return refusevideoencoder("encode-bad-fps", `${format} needs a finite fps > 0, got ${String(options.fps)}`);
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
      return refusevideoencoder("encode-bad-frame", error instanceof WebmError ? error.message : String(error));
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
    return refusevideoencoder("encode-bad-frame", error instanceof GifError ? error.message : String(error));
  }
}
