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

import {
  addticks,
  clampticks,
  DEFAULT_FRAME_RATE,
  type FrameRate,
  formattimecode,
  frameat,
  frameduration,
  framelabel,
  framerate,
  snaptick,
  ticksfromseconds,
  tickstoseconds,
} from "./timeticks.ts";

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
