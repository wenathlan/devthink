// # dawview.test — the pure view math of the DAW surfaces: the clock format,
// the clip geometry clamps, the fader travel round-trip, the meter percent
// and the playhead percent. The studio reads these numbers; the tests pin
// them.
import assert from "node:assert/strict";
import { describe, it } from "vitest";
import {
  clampFader,
  clipStyle,
  FADER_MAX_DB,
  FADER_MIN_DB,
  faderToUnit,
  formatClock,
  formatGain,
  levelToPercent,
  playheadPercent,
  unitToFader,
} from "../dawview.ts";

describe("dawview — formatClock", () => {
  it("formats the classic m:ss.t readout", () => {
    assert.equal(formatClock(0), "0:00.0");
    assert.equal(formatClock(4.12), "0:04.1");
    assert.equal(formatClock(65.5), "1:05.5");
    assert.equal(formatClock(601.25), "10:01.2");
  });

  it("answers the zero clock for junk input", () => {
    assert.equal(formatClock(Number.NEGATIVE_INFINITY), "0:00.0");
    assert.equal(formatClock(Number.NaN), "0:00.0");
    assert.equal(formatClock(-3), "0:00.0");
  });
});

describe("dawview — clipStyle", () => {
  it("maps a clip onto its percent geometry", () => {
    const geo = clipStyle(10, 5, 20);
    assert.equal(geo.left, 50);
    assert.equal(geo.width, 25);
  });

  it("clamps a clip that runs past the arrangement", () => {
    const geo = clipStyle(15, 10, 20);
    assert.equal(geo.left, 75);
    assert.equal(geo.width, 25);
  });

  it("never answers negative or over-full geometry", () => {
    const over = clipStyle(25, 5, 20);
    assert.equal(over.left, 100);
    assert.equal(over.width, 0);
    const empty = clipStyle(1, 1, 0);
    assert.deepEqual(empty, { left: 0, width: 0 });
  });
});

describe("dawview — fader travel", () => {
  it("maps the −60..+6 dB travel onto 0..1", () => {
    assert.equal(faderToUnit(FADER_MIN_DB), 0);
    assert.equal(faderToUnit(0), 60 / 66);
    assert.equal(faderToUnit(FADER_MAX_DB), 1);
  });

  it("round-trips a fader value through the unit space", () => {
    for (let db = FADER_MIN_DB; db <= FADER_MAX_DB; db += 0.5) {
      assert.ok(Math.abs(unitToFader(faderToUnit(db)) - db) < 1e-9);
    }
  });

  it("clamps out-of-travel values", () => {
    assert.equal(clampFader(-100), FADER_MIN_DB);
    assert.equal(clampFader(20), FADER_MAX_DB);
    assert.equal(unitToFader(-2), FADER_MIN_DB);
    assert.equal(unitToFader(2), FADER_MAX_DB);
  });

  it("snaps the unit walk onto 0.5 dB steps", () => {
    const db = unitToFader(0.5);
    assert.equal(db, Math.round(db * 2) / 2);
  });
});

describe("dawview — meters and playhead", () => {
  it("maps a dBFS level onto the 0..100 meter with the −48 floor", () => {
    assert.equal(levelToPercent(Number.NEGATIVE_INFINITY), 0);
    assert.equal(levelToPercent(-48), 0);
    assert.equal(levelToPercent(-24), 50);
    assert.equal(levelToPercent(0), 100);
    assert.equal(levelToPercent(6), 100);
    assert.equal(levelToPercent(Number.NaN), 0);
  });

  it("maps the playhead percent and clamps both ends", () => {
    assert.equal(playheadPercent(5, 20), 25);
    assert.equal(playheadPercent(-1, 20), 0);
    assert.equal(playheadPercent(30, 20), 100);
    assert.equal(playheadPercent(5, 0), 0);
  });

  it("formats gains with the silence glyph", () => {
    assert.equal(formatGain(-4), "-4.0");
    assert.equal(formatGain(Number.NEGATIVE_INFINITY), "−∞");
  });
});
