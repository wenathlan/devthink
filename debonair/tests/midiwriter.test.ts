// # midiwriter.test — the SMF writer contract: the MThd/MTrk magic and the
// header fields, the VLQ round trip on the boundary values, the tempo meta
// as microseconds per quarter, the balanced on/off pairs validateMidi
// proves, the drums on the GM percussion channel 9, the schedule-to-tracks
// conservation and the determinism of the bytes.
import assert from "node:assert/strict";
import { describe, it } from "vitest";
import { planTake } from "../arranger.ts";
import {
  buildTracksFromSchedule,
  decodeVlq,
  encodeVlq,
  MIDI_CONSTANTS,
  MidiError,
  secondsToTicks,
  ticksToSeconds,
  VLQ_MAX,
  validateMidi,
  writeMidi,
} from "../midiwriter.ts";
import { scheduleTake } from "../takeevents.ts";

/** Reads a big-endian u16 out of the bytes (SMF is big-endian, the opposite of wav). */
const u16be = (bytes: Uint8Array, offset: number): number => (bytes[offset] << 8) | bytes[offset + 1];

/** Reads a big-endian u32 out of the bytes. */
const u32be = (bytes: Uint8Array, offset: number): number =>
  ((bytes[offset] << 24) | (bytes[offset + 1] << 16) | (bytes[offset + 2] << 8) | bytes[offset + 3]) >>> 0;

describe("midiwriter — vlq", () => {
  it("round trips the boundary values", () => {
    for (const value of [0, 1, 0x7f, 0x80, 0xff, 0x3fff, 0x4000, 0x1fffff, 0x200000, VLQ_MAX]) {
      const encoded = encodeVlq(value);
      const decoded = decodeVlq(encoded);
      assert.equal(decoded.value, value);
      assert.equal(decoded.next, encoded.length);
    }
  });

  it("encodes the documented byte shapes", () => {
    assert.deepEqual([...encodeVlq(0)], [0x00]);
    assert.deepEqual([...encodeVlq(127)], [0x7f]);
    assert.deepEqual([...encodeVlq(128)], [0x81, 0x00]);
    assert.deepEqual([...encodeVlq(0x200000)], [0x81, 0x80, 0x80, 0x00]);
  });

  it("refuses overflow and truncated streams", () => {
    assert.throws(
      () => encodeVlq(VLQ_MAX + 1),
      (error: unknown) => error instanceof MidiError && error.code === "vlq-overflow",
    );
    assert.throws(
      () => encodeVlq(-1),
      (error: unknown) => error instanceof MidiError && error.code === "vlq-overflow",
    );
    assert.throws(
      () => decodeVlq(new Uint8Array([0x80])),
      (error: unknown) => error instanceof MidiError && error.code === "vlq-truncated",
    );
  });
});

describe("midiwriter — time math", () => {
  it("maps seconds to ticks and back exactly", () => {
    assert.equal(secondsToTicks(1, 120, 480), 960);
    assert.equal(ticksToSeconds(960, 120, 480), 1);
    for (const bpm of [90, 124, 174]) {
      for (const seconds of [0, 0.5, 1.75, 30]) {
        const ticks = secondsToTicks(seconds, bpm);
        assert.equal(secondsToTicks(ticksToSeconds(ticks, bpm), bpm), ticks);
      }
    }
  });

  it("refuses impossible tempo inputs", () => {
    assert.throws(
      () => secondsToTicks(1, 0),
      (error: unknown) => error instanceof MidiError && error.code === "bad-bpm",
    );
    assert.throws(
      () => ticksToSeconds(1, 120, 0),
      (error: unknown) => error instanceof MidiError && error.code === "bad-ppq",
    );
  });
});

describe("midiwriter — writeMidi", () => {
  const plan = planTake({ prompt: "midnight techno, dark sub bass", seed: "k4-midi" });
  const schedule = scheduleTake(plan);
  const tracks = buildTracksFromSchedule(schedule, plan, plan.bpm);
  const bytes = writeMidi(tracks, MIDI_CONSTANTS.ppqDefault, plan.bpm);

  it("opens with MThd and declares format 1 with one track per role plus the tempo map", () => {
    assert.equal(String.fromCharCode(...bytes.subarray(0, 4)), "MThd");
    assert.equal(u32be(bytes, 4), 6);
    assert.equal(u16be(bytes, 8), 1);
    assert.equal(u16be(bytes, 10), 5);
    assert.equal(u16be(bytes, 12), MIDI_CONSTANTS.ppqDefault);
  });

  it("opens every chunk with MTrk and walks them cleanly", () => {
    let cursor = 14;
    let count = 0;
    while (cursor < bytes.length) {
      assert.equal(String.fromCharCode(...bytes.subarray(cursor, cursor + 4)), "MTrk");
      count += 1;
      cursor += 8 + u32be(bytes, cursor + 4);
    }
    assert.equal(count, 5);
  });

  it("writes the tempo meta on track 0 as microseconds per quarter", () => {
    const tempoAt = 14 + 8; // the first MTrk body
    assert.equal(bytes[tempoAt], 0x00); // delta
    assert.equal(bytes[tempoAt + 1], 0xff);
    assert.equal(bytes[tempoAt + 2], 0x51);
    assert.equal(bytes[tempoAt + 3], 0x03);
    const us = (bytes[tempoAt + 4] << 16) | (bytes[tempoAt + 5] << 8) | bytes[tempoAt + 6];
    assert.equal(us, Math.round(60e6 / plan.bpm)); // microseconds per quarter: 60e6 / bpm
    const reference = writeMidi([{ name: "", channel: 0, program: -1, notes: [] }], 480, 120);
    assert.equal((reference[26] << 16) | (reference[27] << 8) | reference[28], 500000); // 60e6 / 120 = 0x07a120
  });

  it("keeps the drums on the GM percussion channel 9", () => {
    const drums = tracks.find((track) => track.name.endsWith("-drums"));
    assert.ok(drums);
    assert.equal(drums.channel, 9);
    const drumsAt = 14 + 19; // the drums chunk rides right after the tempo map chunk (8 + 11 bytes)
    const body = bytes.subarray(drumsAt + 8, drumsAt + 8 + u32be(bytes, drumsAt + 4));
    assert.ok(body.includes(0x99)); // note on, channel 9
    assert.ok(body.includes(0xc9)); // program change, channel 9
  });

  it("balances every note on with exactly one note off", () => {
    assert.deepEqual(validateMidi(tracks), []);
  });

  it("is deterministic — the same schedule renders the same bytes", () => {
    const again = writeMidi(
      buildTracksFromSchedule(scheduleTake(plan), plan, plan.bpm),
      MIDI_CONSTANTS.ppqDefault,
      plan.bpm,
    );
    assert.deepEqual(again, bytes);
  });

  it("conserves the schedule into the tracks", () => {
    const total = tracks.reduce((sum, track) => sum + track.notes.length, 0);
    assert.equal(total, schedule.events.length);
    for (const track of tracks) {
      const role = track.name.slice(plan.id.length + 1);
      assert.equal(track.notes.length, schedule.perRole[role]);
    }
  });

  it("answers machine codes for broken tracks and options", () => {
    assert.throws(
      () => writeMidi(tracks, 0, plan.bpm),
      (error: unknown) => error instanceof MidiError && error.code === "bad-ppq",
    );
    assert.throws(
      () => writeMidi(tracks, 480, 0),
      (error: unknown) => error instanceof MidiError && error.code === "bad-bpm",
    );
    const louder = tracks.map((track, index) =>
      index === 0
        ? { ...track, notes: track.notes.map((note, order) => (order === 0 ? { ...note, velocity: 300 } : note)) }
        : track,
    );
    assert.ok(validateMidi(louder).some((problem) => problem.code === "bad-velocity"));
    const gated = tracks.map((track, index) =>
      index === 0
        ? { ...track, notes: track.notes.map((note, order) => (order === 0 ? { ...note, duration: 0 } : note)) }
        : track,
    );
    assert.ok(validateMidi(gated).some((problem) => problem.code === "unbalanced-pairs"));
    assert.ok(
      validateMidi([{ name: "x", channel: 16, program: 0, notes: [] }]).some(
        (problem) => problem.code === "bad-channel",
      ),
    );
  });
});
