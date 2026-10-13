// # midiwriter — the standard midi file writer of the katexis engine (root layer): the take
// schedule turns into a format-1 SMF the outside world reads — a tempo map on track 0 and one
// MTrk per arrangement role, note on/off pairs delta-encoded in VLQ, channels fixed by role
// (the GM percussion seat owns channel 9). The export seam of wave b2 promised deterministic
// bytes for a given plan+seed, so the writer is dependency-free and the same call runs in the
// studio (browser) and in node (these tests). Pure — zero DOM, zero storage, zero audio.

import { type ArrangerRole, ROLE_NAMES, type TakePlan } from "./arranger.ts";
import type { TakeSchedule } from "./takeevents.ts";

/** The machine readable failure codes of the midi writer. */
export type MidiErrorCode =
  | "vlq-overflow"
  | "vlq-truncated"
  | "bad-tick"
  | "bad-note"
  | "bad-velocity"
  | "bad-channel"
  | "bad-program"
  | "unbalanced-pairs"
  | "bad-ppq"
  | "bad-bpm";

/** The typed midi failure, traceable to a machine code. */
export class MidiError extends Error {
  /** Machine readable failure code. */
  readonly code: MidiErrorCode;

  constructor(code: MidiErrorCode, message?: string) {
    super(message ?? `midi ${code}`);
    this.name = "MidiError";
    this.code = code;
  }
}

/** The writer's constants — opcodes, meta markers, the role channel map, the drum note map. */
export const MIDI_CONSTANTS = {
  /** The pulses per quarter note the writer defaults to (the grid the schedule rides). */
  ppqDefault: 480,
  /** The tempo the writer assumes when a caller passes none. */
  defaultTempoBpm: 120,
  /** Channel voice opcodes (the upper nibble; the channel rides the lower four bits). */
  noteOff: 0x80,
  noteOn: 0x90,
  programChange: 0xc0,
  /** Meta markers (0xff opens every meta; 0x51 carries tempo, 0x2f closes the track). */
  metaMarker: 0xff,
  metaTempo: 0x51,
  metaTrackName: 0x03,
  metaEndOfTrack: 0x2f,
  /** The channel per role: drums answer the GM percussion seat (channel 9), bass/keys/lead share the front. */
  channels: { drums: 9, bass: 0, keys: 1, lead: 2 } satisfies Record<ArrangerRole, number>,
  /** The GM program each role opens with (channel 9 ignores programs, the kit is selected by the receiver). */
  programs: { drums: 0, bass: 32, keys: 0, lead: 80 } satisfies Record<ArrangerRole, number>,
  /** The GM percussion note each drum lane answers (the scheduler's drum events carry midi 0 by contract). */
  drumNotes: { kick: 36, snare: 38, clap: 39, hat: 42, openhat: 46, perc: 63, ride: 51, tom: 45 },
} as const;

/** The largest value a SMF variable length quantity carries (four 7-bit groups). */
export const VLQ_MAX = 0x0fffffff;

/** One note of a midi track: the on lands at tick, the off at tick + duration. */
export interface MidiNote {
  /** The midi note number 0..127. */
  note: number;
  /** The strike velocity 0..127. */
  velocity: number;
  /** The start tick (a non-negative integer). */
  tick: number;
  /** The gate length in ticks (>= 1, so the off never precedes its on). */
  duration: number;
}

/** One track of the file: the notes of one role on one channel. */
export interface MidiTrack {
  /** The track name written as the 0xff 0x03 meta (empty skips the meta). */
  name: string;
  /** The channel 0..15 every note rides. */
  channel: number;
  /** The GM program written before the first note (-1 skips the program change). */
  program: number;
  /** The notes of the track. */
  notes: readonly MidiNote[];
}

/** One validateMidi verdict: the machine code plus a human line. */
export interface MidiProblem {
  /** The machine readable failure code. */
  code: MidiErrorCode;
  /** The human readable line. */
  message: string;
}

/** One delta-time stream event the track builder sorts and encodes (rank: releases precede attacks). */
interface StreamEvent {
  tick: number;
  status: number;
  data0: number;
  data1: number;
  rank: number;
}

/**
 * Encodes a non-negative integer as a SMF variable length quantity.
 *
 * @param value the quantity (0..0x0fffffff).
 * @returns the 1..4 continuation bytes, most significant group first.
 */
export function encodeVlq(value: number): Uint8Array {
  if (!Number.isInteger(value) || value < 0 || value > VLQ_MAX) {
    throw new MidiError("vlq-overflow", `midi vlq needs an integer 0..${VLQ_MAX}, got ${value}`);
  }
  const bytes = [value & 0x7f];
  let rest = value >> 7;
  while (rest > 0) {
    bytes.unshift(0x80 | (rest & 0x7f));
    rest >>= 7;
  }
  return Uint8Array.from(bytes);
}

/**
 * Decodes one SMF variable length quantity.
 *
 * @param bytes the buffer the quantity rides in.
 * @param offset where the quantity starts.
 * @returns the value and the offset just past the quantity.
 */
export function decodeVlq(bytes: Uint8Array, offset = 0): { value: number; next: number } {
  let value = 0;
  let cursor = offset;
  for (let guard = 0; guard < 4; guard++) {
    if (cursor >= bytes.length) throw new MidiError("vlq-truncated", "midi vlq ran past the buffer");
    const byte = bytes[cursor];
    value = (value << 7) | (byte & 0x7f);
    cursor += 1;
    if ((byte & 0x80) === 0) return { value, next: cursor };
  }
  throw new MidiError("vlq-overflow", "midi vlq longer than four bytes");
}

/** Asserts a tempo the time math and the tempo meta both survive. */
function assertBpm(bpm: number): void {
  if (!Number.isFinite(bpm) || bpm <= 0) throw new MidiError("bad-bpm", `midi needs a bpm > 0, got ${bpm}`);
}

/** Asserts a division the header can carry (u16; the SMPTE half of the field is not ours). */
function assertPpq(ppq: number): void {
  if (!Number.isInteger(ppq) || ppq <= 0 || ppq > 32767)
    throw new MidiError("bad-ppq", `midi needs an integer ppq 1..32767, got ${ppq}`);
}

/** Asserts one channel stays on the 0..15 band SMF carries. */
function assertChannel(channel: number): void {
  if (!Number.isInteger(channel) || channel < 0 || channel > 15)
    throw new MidiError("bad-channel", `midi channel ${channel} outside 0..15`);
}

/** Asserts one byte of the protocol (a note number or a velocity) stays on the 0..127 band GM speaks. */
function assertByte(value: number, code: MidiErrorCode, label: string): void {
  if (!Number.isInteger(value) || value < 0 || value > 127)
    throw new MidiError(code, `midi ${label} ${value} outside 0..127`);
}

/**
 * Converts seconds into ticks at the session tempo: one quarter spans ppq ticks
 * and one second spans bpm/60 quarters, so ticks = seconds * bpm * ppq / 60.
 *
 * @param seconds the time in seconds from the top of the take (>= 0).
 * @param bpm the session tempo.
 * @param ppq the pulses per quarter note.
 * @returns the rounded tick.
 */
export function secondsToTicks(seconds: number, bpm: number, ppq = MIDI_CONSTANTS.ppqDefault): number {
  assertBpm(bpm);
  assertPpq(ppq);
  if (!Number.isFinite(seconds) || seconds < 0)
    throw new MidiError("bad-tick", `midi needs a time >= 0, got ${seconds}`);
  return Math.round((seconds * bpm * ppq) / 60);
}

/**
 * Converts ticks back into seconds at the session tempo (seconds = ticks * 60 / (bpm * ppq);
 * the tempo meta stores the same law as microseconds per quarter: 60e6 / bpm).
 *
 * @param ticks the tick count (>= 0).
 * @param bpm the session tempo.
 * @param ppq the pulses per quarter note.
 * @returns the seconds.
 */
export function ticksToSeconds(ticks: number, bpm: number, ppq = MIDI_CONSTANTS.ppqDefault): number {
  assertBpm(bpm);
  assertPpq(ppq);
  if (!Number.isInteger(ticks) || ticks < 0) throw new MidiError("bad-tick", `midi needs ticks >= 0, got ${ticks}`);
  return (ticks * 60) / (bpm * ppq);
}

/** Builds the sorted on/off stream of one track: every on paired with its off, releases first on ties. */
function streamEvents(track: MidiTrack): StreamEvent[] {
  assertChannel(track.channel);
  const events: StreamEvent[] = [];
  for (const note of track.notes) {
    assertByte(note.note, "bad-note", "note");
    assertByte(note.velocity, "bad-velocity", "velocity");
    if (!Number.isInteger(note.tick) || note.tick < 0)
      throw new MidiError("bad-tick", `note ${note.note} starts at tick ${note.tick}`);
    if (!Number.isInteger(note.duration) || note.duration < 1) {
      throw new MidiError(
        "unbalanced-pairs",
        `note ${note.note} carries duration ${note.duration}; its off would not land after its on`,
      );
    }
    events.push({
      tick: note.tick,
      status: MIDI_CONSTANTS.noteOn | track.channel,
      data0: note.note,
      data1: note.velocity,
      rank: 1,
    });
    events.push({
      tick: note.tick + note.duration,
      status: MIDI_CONSTANTS.noteOff | track.channel,
      data0: note.note,
      data1: 0,
      rank: 0,
    });
  }
  // a release precedes an attack on a shared tick (a retrigger is never cut), then the lowest note wins
  events.sort(
    (left, right) =>
      left.tick - right.tick || left.rank - right.rank || left.data0 - right.data0 || left.data1 - right.data1,
  );
  return events;
}

/** Writes ascii magic straight into the byte array. */
function writeAscii(bytes: Uint8Array, offset: number, text: string): void {
  for (let index = 0; index < text.length; index++) bytes[offset + index] = text.charCodeAt(index);
}

/** Builds one MTrk chunk around a body the caller assembled. */
function trackChunk(body: readonly number[]): Uint8Array {
  const chunk = new Uint8Array(8 + body.length);
  writeAscii(chunk, 0, "MTrk");
  new DataView(chunk.buffer).setUint32(4, body.length, false);
  chunk.set(body, 8);
  return chunk;
}

/** Builds the MThd chunk: format 1, one track per role plus the tempo map. */
function headerChunk(trackCount: number, ppq: number): Uint8Array {
  const bytes = new Uint8Array(14);
  writeAscii(bytes, 0, "MThd");
  const view = new DataView(bytes.buffer);
  view.setUint32(4, 6, false);
  view.setUint16(8, 1, false); // format 1: the tempo map rides track 0
  view.setUint16(10, trackCount, false);
  view.setUint16(12, ppq, false);
  return bytes;
}

/** Builds the track-0 tempo map: the tempo meta (microseconds per quarter = 60e6 / bpm; 120 answers 500000) and the end of track. */
function tempoChunk(bpm: number): Uint8Array {
  const usPerQuarter = Math.round(60e6 / bpm); // microseconds: 120 bpm answers 500000 (0x07a120), the format's reference tempo
  if (usPerQuarter > 0xffffff)
    throw new MidiError("bad-bpm", `bpm ${bpm} is slower than the 3-byte tempo meta can carry`);
  return trackChunk([
    0x00,
    MIDI_CONSTANTS.metaMarker,
    MIDI_CONSTANTS.metaTempo,
    0x03,
    (usPerQuarter >> 16) & 0xff,
    (usPerQuarter >> 8) & 0xff,
    usPerQuarter & 0xff,
    0x00,
    MIDI_CONSTANTS.metaMarker,
    MIDI_CONSTANTS.metaEndOfTrack,
    0x00,
  ]);
}

/** Builds one role track: the name meta, the program change, the delta-encoded notes, the end of track. */
function roleChunk(track: MidiTrack): Uint8Array {
  const body: number[] = [];
  if (track.name.length > 0) {
    body.push(0x00, MIDI_CONSTANTS.metaMarker, MIDI_CONSTANTS.metaTrackName, track.name.length & 0x7f);
    for (let index = 0; index < track.name.length; index++) body.push(track.name.charCodeAt(index) & 0x7f);
  }
  if (track.program >= 0) {
    assertByte(track.program, "bad-program", "program");
    body.push(0x00, MIDI_CONSTANTS.programChange | track.channel, track.program);
  }
  let previous = 0;
  for (const event of streamEvents(track)) {
    for (const byte of encodeVlq(event.tick - previous)) body.push(byte);
    body.push(event.status, event.data0, event.data1);
    previous = event.tick;
  }
  body.push(0x00, MIDI_CONSTANTS.metaMarker, MIDI_CONSTANTS.metaEndOfTrack, 0x00);
  return trackChunk(body);
}

/**
 * Writes a format-1 SMF: the MThd, the tempo map on track 0 and one MTrk per
 * track the caller carries. Events are ordered by tick inside every chunk
 * (releases before attacks on a shared tick), every on is paired with its off.
 *
 * @param tracks the role tracks to write.
 * @param ppq the division the header declares (defaults to 480).
 * @param bpm the tempo the track-0 meta declares (defaults to 120).
 * @returns the SMF bytes, deterministic for the same input.
 */
export function writeMidi(
  tracks: readonly MidiTrack[],
  ppq: number = MIDI_CONSTANTS.ppqDefault,
  bpm: number = MIDI_CONSTANTS.defaultTempoBpm,
): Uint8Array {
  assertPpq(ppq);
  assertBpm(bpm);
  const chunks: Uint8Array[] = [headerChunk(tracks.length + 1, ppq), tempoChunk(bpm)];
  for (const track of tracks) chunks.push(roleChunk(track));
  const total = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
  const bytes = new Uint8Array(total);
  let cursor = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, cursor);
    cursor += chunk.length;
  }
  return bytes;
}

/** Resolves the percussion note of a drum lane: the map wins, a carried pitch follows, the kick answers last. */
function drumNoteFor(lane: string, midi: number): number {
  const mapped = MIDI_CONSTANTS.drumNotes[lane as keyof typeof MIDI_CONSTANTS.drumNotes] as number | undefined;
  if (mapped !== undefined) return mapped;
  return midi > 0 ? midi : MIDI_CONSTANTS.drumNotes.kick;
}

/**
 * Bridges the take schedule into the role tracks the writer encodes: ticks from the seconds
 * (bpm and ppq explicit), velocities from the 0..1 scale times 127, drum lanes onto the GM
 * percussion map, tonal roles onto the event's own midi note.
 *
 * @param schedule the scheduled take (time-ascending events).
 * @param plan the plan the take answers to (the track names ride its id).
 * @param bpm the tempo the ticks are computed against.
 * @param ppq the division the ticks are computed against (defaults to 480).
 * @returns one track per role, in the canonical role order.
 */
export function buildTracksFromSchedule(
  schedule: TakeSchedule,
  plan: TakePlan,
  bpm: number,
  ppq = MIDI_CONSTANTS.ppqDefault,
): MidiTrack[] {
  assertBpm(bpm);
  assertPpq(ppq);
  return ROLE_NAMES.map((role) => {
    const notes = schedule.events
      .filter((event) => event.role === role)
      .map((event) => ({
        note: role === "drums" ? drumNoteFor(event.lane, event.midi) : event.midi,
        velocity: Math.min(127, Math.max(0, Math.round(event.velocity * 127))),
        tick: secondsToTicks(event.time, bpm, ppq),
        duration: Math.max(1, secondsToTicks(event.seconds, bpm, ppq)),
      }));
    return {
      name: `${plan.id}-${role}`,
      channel: MIDI_CONSTANTS.channels[role],
      program: MIDI_CONSTANTS.programs[role],
      notes,
    };
  });
}

/**
 * Validates the tracks before they become bytes: channels on 0..15, notes and velocities on
 * 0..127, non-negative integer ticks in ascending order, and every pair balanced (a duration
 * below one tick means the off would not land after its on).
 *
 * @param tracks the tracks to check.
 * @returns the problems found (an empty list is a sound export).
 */
export function validateMidi(tracks: readonly MidiTrack[]): MidiProblem[] {
  const problems: MidiProblem[] = [];
  const push = (code: MidiErrorCode, message: string): void => {
    problems.push({ code, message });
  };
  for (const track of tracks) {
    if (!Number.isInteger(track.channel) || track.channel < 0 || track.channel > 15) {
      push("bad-channel", `track ${track.name} rides channel ${track.channel}`);
    }
    let last = -1;
    for (const note of track.notes) {
      const tickOk = Number.isInteger(note.tick) && note.tick >= 0;
      if (!tickOk) push("bad-tick", `note ${note.note} starts at tick ${note.tick}`);
      else if (note.tick < last) push("bad-tick", `track ${track.name} carries notes out of tick order`);
      last = tickOk ? note.tick : last;
      if (!Number.isInteger(note.duration) || note.duration < 1)
        push("unbalanced-pairs", `note ${note.note} carries duration ${note.duration}`);
      if (!Number.isInteger(note.note) || note.note < 0 || note.note > 127)
        push("bad-note", `note number ${note.note} outside 0..127`);
      if (!Number.isInteger(note.velocity) || note.velocity < 0 || note.velocity > 127)
        push("bad-velocity", `velocity ${note.velocity} outside 0..127`);
    }
  }
  return problems;
}
