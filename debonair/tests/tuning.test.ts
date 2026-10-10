// # tuning.test — the midi-to-hertz conversion the studio transport reads:
// A4 anchors the table, every semitone is the 12th root of two, and an
// octave doubles. The recipes ride this one function; the tests pin it.
import assert from "node:assert/strict";
import { describe, it } from "vitest";
import { A4_MIDI, CONCERT_PITCH, midiToHz } from "../Sol/studio/tuning.ts";

describe("tuning — midiToHz", () => {
  it("anchors A4 at the concert pitch", () => {
    assert.equal(A4_MIDI, 69);
    assert.equal(CONCERT_PITCH, 440);
    assert.equal(midiToHz(A4_MIDI), 440);
  });

  it("doubles every octave and halves below", () => {
    assert.ok(Math.abs(midiToHz(A4_MIDI + 12) - 880) < 1e-9);
    assert.ok(Math.abs(midiToHz(A4_MIDI - 12) - 220) < 1e-9);
  });

  it("walks the chromatic steps of the equal temperament", () => {
    const semitone = 2 ** (1 / 12);
    assert.ok(Math.abs(midiToHz(A4_MIDI + 0.5) - 440 * 2 ** (1 / 24)) < 1e-9); // fractional bends
    assert.ok(Math.abs(midiToHz(60) - 261.6256) < 1e-4); // middle C
    assert.ok(Math.abs(midiToHz(24) - 32.7032) < 1e-4); // the sub bass floor
    assert.ok(Math.abs(midiToHz(A4_MIDI + 1) - 440 * semitone) < 1e-9);
  });
});
