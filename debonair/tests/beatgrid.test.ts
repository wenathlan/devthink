// # beatgrid.test — honest unit tests for the beat grid (tempo detection, beat
// tracking, quantize/swing, tempo map integration), runnable with the node
// built-in runner (no dependencies, no install):
//   node --test tests/beatgrid.test.ts
// The fixtures synthesise a 120 BPM click track and piecewise tempo curves.
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  beatCount,
  beatsElapsed,
  beatTime,
  detectTempo,
  gridFromBeats,
  gridToTempoMap,
  identityGrid,
  isDownbeat,
  nearestBeat,
  onsetEnvelope,
  quantizeToGrid,
  subdivideBeat,
  swingOffset,
  tempoAtTime,
  tempoMapFromAnchors,
  timeAtBeat,
  trackBeats,
} from "../beatgrid.ts";

const SR = 44100;

/** The straight-time grid the query tests share. */
const GRID = identityGrid(120, 4).value;

/** Synthesises a click track: one sine burst every `interval` samples. */
function clicks(interval: number, seconds: number, burst = 600): number[] {
  const out: number[] = [];
  for (let i = 0; i < SR * seconds; i++) {
    const phase = i % interval;
    out.push(phase < burst ? Math.sin((2 * Math.PI * 440 * i) / SR) * (1 - phase / burst) : 0);
  }
  return out;
}

describe("tempo detection and beat tracking", () => {
  it("finds a 120 BPM pulse inside a narrowed band", () => {
    const { envelope, framerate } = onsetEnvelope(clicks(SR / 2, 6), SR);
    const tempo = detectTempo(envelope, framerate, 100, 140);
    assert.ok(tempo.ok, tempo.ok ? "" : tempo.message);
    assert.ok(Math.abs(tempo.value.bpm - 120) < 5, `bpm ${tempo.value.bpm}`);
    assert.ok(tempo.value.pulse > 0.3);
  });

  it("refuses silence with the no-pulse code and short envelopes outright", () => {
    const flat = detectTempo(new Array(64).fill(0.5), 40);
    assert.equal(flat.ok, false);
    assert.equal(flat.ok ? "" : flat.code, "no-pulse");
    const short = detectTempo([1, 2, 3], 40);
    assert.equal(short.ok ? "" : short.code, "empty-envelope");
  });

  it("tracks one beat per click and grids them in seconds", () => {
    const { envelope, framerate } = onsetEnvelope(clicks(SR / 2, 6), SR);
    const tempo = detectTempo(envelope, framerate, 100, 140);
    assert.ok(tempo.ok);
    const frames = trackBeats(envelope, tempo.value.period);
    assert.ok(frames.length >= 10, `tracked ${frames.length}`);
    const grid = gridFromBeats(frames, framerate, 120);
    assert.ok(grid.ok);
    assert.equal(beatCount(grid.value), frames.length);
    const first = grid.value.beats[0];
    const last = grid.value.beats[grid.value.beats.length - 1];
    const mean = (last - first) / (grid.value.beats.length - 1);
    assert.ok(Math.abs(mean - 0.5) < 0.03, `mean step ${mean}`);
  });
});

describe("grid queries and quantize", () => {
  it("answers downbeats, nearest beats and interpolated beat times", () => {
    assert.ok(isDownbeat(GRID, 0));
    assert.ok(!isDownbeat(GRID, 1));
    assert.ok(!isDownbeat(GRID, 99));
    assert.equal(nearestBeat(GRID, 1.62), 3);
    assert.equal(beatTime(GRID, 2.5), 1.25);
    assert.ok(Math.abs(beatTime(GRID, 9) - 4.5) < 1e-9);
    assert.equal(beatTime({ bpm: 120, beats: [], beatsperbar: 4 }, 3), 0);
  });

  it("quantizes partially by strength and refuses out-of-range strengths", () => {
    const half = quantizeToGrid(1.07, GRID, 0.5);
    assert.ok(half.ok);
    assert.ok(Math.abs(half.value - 1.035) < 1e-9);
    assert.equal(quantizeToGrid(1.07, GRID, 1.5).ok ? "" : "bad-strength", "bad-strength");
  });

  it("swings only offbeat positions and subdivides beats", () => {
    const straight = swingOffset(GRID, 1.3, 0.5);
    const swung = swingOffset(GRID, 1.3, 0.667);
    assert.equal(straight, 0);
    assert.ok(Math.abs(swung - 0.0835) < 1e-3, `swing ${swung}`);
    assert.equal(swingOffset(GRID, 1.0, 0.667), 0);
    assert.deepEqual(subdivideBeat(GRID, 0, 4), [0, 0.125, 0.25, 0.375]);
    assert.deepEqual(subdivideBeat(GRID, -1, 4), []);
  });
});

describe("tempo map curves", () => {
  const map = tempoMapFromAnchors([
    { time: 0, bpm: 60, curve: "linear" },
    { time: 10, bpm: 120, curve: "hold" },
  ]).value;

  it("evaluates linear, exponential and hold curves with clamp ends", () => {
    assert.equal(tempoAtTime(map, -5), 60);
    assert.equal(tempoAtTime(map, 5), 90);
    assert.equal(tempoAtTime(map, 30), 120);
    const expo = tempoMapFromAnchors([
      { time: 0, bpm: 100, curve: "exponential" },
      { time: 1, bpm: 200, curve: "hold" },
    ]).value;
    assert.ok(Math.abs(tempoAtTime(expo, 0.5) - 100 * Math.SQRT2) < 1e-9);
  });

  it("integrates tempo into beats and inverts it back into time", () => {
    assert.ok(Math.abs(beatsElapsed(map, 0, 10) - 15) < 1e-9);
    assert.equal(beatsElapsed(map, 5, 5), 0);
    const time = timeAtBeat(map, 0, 7.5);
    assert.ok(Math.abs(time - 5.8114) < 1e-3, `time ${time}`);
    const roundtrip = timeAtBeat(map, 0, beatsElapsed(map, 0, 3));
    assert.ok(Math.abs(roundtrip - 3) < 1e-9);
  });

  it("validates anchors and maps a grid to a constant tempo map", () => {
    const broken = tempoMapFromAnchors([
      { time: 2, bpm: 90, curve: "hold" },
      { time: 1, bpm: 90, curve: "hold" },
    ]);
    assert.equal(broken.ok ? "" : broken.code, "bad-tempo");
    assert.equal(tempoMapFromAnchors([]).ok, false);
    const constant = gridToTempoMap(GRID);
    assert.equal(tempoAtTime(constant, 100), 120);
  });
});
