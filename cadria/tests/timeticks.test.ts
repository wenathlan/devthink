// # timeticks.test — exact tick time: frame-rate math, sample clocks, the
// rational container conversions and SMPTE drop-frame timecode, runnable with
// the node built-in runner (no dependencies, no install):
//   node --test tests/timeticks.test.ts
// Every test watches the two invariants the module promises: conversions are
// exact inside the safe-integer range (no float drift) and nothing ever
// throws — damaged input answers the default or null.
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  addticks,
  clampticks,
  formattimecode,
  frameat,
  frameduration,
  framelabel,
  framerate,
  frameratefromf64,
  framestofields,
  makerange,
  parsetimecode,
  rangeintersect,
  rangeoverlaps,
  scaleticks,
  snaptick,
  subticks,
  TICKS_PER_SECOND,
  tickofframe,
  ticksfromrational,
  ticksfromseconds,
  ticksfromunits,
  tickstorationalround,
  tickstoseconds,
  tickstounitsfloor,
  timecodeparams,
} from "../timeticks.ts";

const R24 = { num: 24, den: 1 };
const R2997 = { num: 30000, den: 1001 };

describe("timeticks rates", () => {
  it("keeps the tick rate and exact frame durations", () => {
    assert.equal(TICKS_PER_SECOND, 254016000000);
    assert.equal(frameduration(R24), 10584000000);
    assert.equal(frameduration({ num: 24000, den: 1001 }), 10594584000);
  });
  it("reduces rational rates and falls back to the default on damaged input", () => {
    assert.deepEqual(framerate(24, 48), { num: 1, den: 2 });
    assert.deepEqual(framerate(0, 10), { num: 24000, den: 1001 });
    assert.equal(framelabel({ num: 24000, den: 1001 }), "23.976");
    assert.equal(framelabel({ num: 25, den: 1 }), "25");
  });
  it("matches the closest standard rate for a container average", () => {
    assert.deepEqual(frameratefromf64(29.97), R2997);
    assert.deepEqual(frameratefromf64(23.976), { num: 24000, den: 1001 });
    assert.deepEqual(frameratefromf64(23.5), { num: 47, den: 2 });
  });
});

describe("timeticks frame math", () => {
  it("floors frames and answers exact frame starts", () => {
    assert.equal(frameat(R24, frameduration(R24) + 1), 1);
    assert.equal(tickofframe(R24, 2), 2 * frameduration(R24));
    assert.equal(frameat(R24, 0), 0);
    assert.equal(tickofframe(R24, 0), 0);
  });
  it("snaps to floor, nearest and ceil boundaries", () => {
    const t = frameduration(R24) + frameduration(R24) * 0.6;
    assert.equal(snaptick(R24, t, "floor"), frameduration(R24));
    assert.equal(snaptick(R24, t, "nearest"), 2 * frameduration(R24));
    assert.equal(snaptick(R24, t, "ceil"), 2 * frameduration(R24));
    assert.equal(snaptick(R24, frameduration(R24), "ceil"), frameduration(R24));
  });
});

describe("timeticks conversions", () => {
  it("converts seconds both ways", () => {
    assert.equal(ticksfromseconds(1), TICKS_PER_SECOND);
    assert.equal(tickstoseconds(TICKS_PER_SECOND), 1);
    assert.equal(ticksfromseconds(1.5), 381024000000);
  });
  it("aligns audio samples without drift", () => {
    assert.equal(ticksfromunits(48000, 48000), TICKS_PER_SECOND);
    assert.equal(tickstounitsfloor(TICKS_PER_SECOND, 44100), 44100);
    assert.equal(tickstounitsfloor(ticksfromunits(1000, 44100), 44100), 1000);
  });
  it("converts rational container timestamps exactly", () => {
    assert.equal(ticksfromrational(1, 1, 1000), 254016000);
    assert.equal(tickstorationalround(TICKS_PER_SECOND / 3, 1, 1000), 333);
    assert.equal(tickstorationalround((TICKS_PER_SECOND * 2) / 3, 1, 1000), 667);
    assert.equal(scaleticks(TICKS_PER_SECOND, 1, 2), TICKS_PER_SECOND / 2);
  });
  it("does the integer arithmetic with saturation and crossed-bound clamps", () => {
    assert.equal(addticks(TICKS_PER_SECOND, 1), TICKS_PER_SECOND + 1);
    assert.equal(subticks(10, 4), 6);
    assert.equal(clampticks(5, 10, 20), 10);
    assert.equal(clampticks(5, 20, 10), 20);
  });
});

describe("timeticks timecode", () => {
  it("applies the drop-frame skip on NTSC rates only", () => {
    assert.equal(timecodeparams(R2997).dropCapable, true);
    assert.equal(timecodeparams(R24).dropCapable, false);
    assert.deepEqual(framestofields(1800, R2997, true), { neg: false, hours: 0, minutes: 1, seconds: 0, frames: 2 });
    assert.deepEqual(framestofields(17982, R2997, true), { neg: false, hours: 0, minutes: 10, seconds: 0, frames: 0 });
  });
  it("formats and parses timecodes (round trip, drop separator, garbage)", () => {
    const t = tickofframe(R24, 4320);
    assert.equal(formattimecode(t, R24), "00:03:00:00");
    assert.equal(formattimecode(tickofframe(R2997, 1800), R2997, true), "00:01:00;02");
    assert.equal(parsetimecode("00:03:00:00", R24), t);
    assert.equal(parsetimecode("nope", R24), null);
    assert.equal(parsetimecode("00:00:00:30", R24), null);
  });
});

describe("timeticks ranges", () => {
  it("overlaps and intersects half-open ranges", () => {
    const a = makerange(10, 5);
    assert.equal(a.duration, 5);
    assert.ok(rangeoverlaps(a, makerange(12, 10)));
    assert.deepEqual(rangeintersect(a, makerange(12, 10)), { start: 12, duration: 3 });
    assert.equal(rangeintersect(a, makerange(20, 5)), null);
    assert.equal(makerange(0, -5).duration, 0);
  });
});
