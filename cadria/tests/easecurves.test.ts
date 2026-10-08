// # easecurves.test — the influence and speed easing model: the handle
// algebra of the presets, the cubic bezier solver, the linear detection
// and the key track evaluation with hold segments, runnable with the
// node built-in runner (no dependencies, no install):
//   node --test tests/easecurves.test.ts
// Every test watches the two invariants the module promises: the linear
// preset answers the identity of its parameter and damaged curves or
// times answer null or the nearest key instead of throwing.
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  bezierprogress,
  curvefromhandles,
  curvehandles,
  curveprogress,
  EASE_INOUT,
  EASE_LINEAR,
  type EaseKey,
  evaluatekeys,
  evaluatesegment,
  islinearcurve,
  samplecurve,
  sanitizecurve,
  timeatprogress,
} from "../easecurves.ts";

describe("easecurves", () => {
  it("renders the linear preset as the identity handles", () => {
    const handles = curvehandles(EASE_LINEAR);
    assert.ok(Math.abs(handles[0] - 1 / 3) < 1e-9);
    assert.ok(Math.abs(handles[1] - 1 / 3) < 1e-9);
    assert.ok(Math.abs(handles[2] - 2 / 3) < 1e-9);
    assert.ok(Math.abs(handles[3] - 2 / 3) < 1e-9);
    assert.equal(islinearcurve(EASE_LINEAR), true);
    assert.equal(islinearcurve(EASE_INOUT), false);
  });

  it("rebuilds the curve from the handles of the preset", () => {
    const rebuilt = curvefromhandles(curvehandles(EASE_LINEAR));
    assert.ok(rebuilt !== null);
    assert.equal(islinearcurve(rebuilt as NonNullable<typeof rebuilt>), true);
    assert.equal(curvefromhandles([Number.NaN, 0, 1, 1]), null);
  });

  it("solves the degenerate linear bezier as the identity", () => {
    assert.ok(Math.abs(bezierprogress(0, 0, 1, 1, 0) - 0) < 1e-9);
    assert.ok(Math.abs(bezierprogress(0, 0, 1, 1, 0.5) - 0.5) < 1e-9);
    assert.ok(Math.abs(bezierprogress(0, 0, 1, 1, 1) - 1) < 1e-9);
  });

  it("answers the parameter of the linear preset along the progress", () => {
    assert.ok(Math.abs((curveprogress(EASE_LINEAR, 0.25) as number) - 0.25) < 0.02);
    assert.ok(Math.abs((curveprogress(EASE_LINEAR, 0.75) as number) - 0.75) < 0.02);
    assert.ok(Math.abs((curveprogress(EASE_INOUT, 0.5) as number) - 0.5) < 0.01);
    assert.equal(curveprogress(EASE_LINEAR, Number.NaN), 0);
  });

  it("inverts the progress of the linear preset back into time", () => {
    assert.ok(Math.abs((timeatprogress(EASE_LINEAR, 0.5) as number) - 0.5) < 0.02);
    assert.ok(Math.abs(timeatprogress(EASE_LINEAR, Number.NaN) as number) < 0.001);
  });

  it("samples the linear preset across the unit range", () => {
    const samples = samplecurve(EASE_LINEAR, 4) as number[];
    const expected = [0, 0.25, 0.5, 0.75, 1];
    assert.equal(samples.length, 5);
    for (let i = 0; i < expected.length; i += 1) assert.ok(Math.abs(samples[i] - expected[i]) < 0.02, `sample ${i}`);
    assert.equal(samplecurve(EASE_LINEAR, 0), null);
  });

  it("evaluates the key track with linear segments and edge clamps", () => {
    const keys: EaseKey[] = [
      { time: 0, value: 0 },
      { time: 10, value: 100 },
    ];
    assert.ok(Math.abs((evaluatekeys(keys, 5) as number) - 50) < 0.5);
    assert.equal(evaluatekeys(keys, -1), 0);
    assert.equal(evaluatekeys(keys, 11), 100);
    assert.equal(evaluatekeys([], 5), null);
    assert.equal(evaluatekeys(keys, Number.NaN), null);
  });

  it("holds the value of a hold segment until the next key", () => {
    const keys: EaseKey[] = [
      { time: 0, value: 1, holdOut: true },
      { time: 10, value: 2 },
    ];
    assert.equal(evaluatekeys(keys, 5), 1);
    assert.equal(evaluatekeys(keys, 10), 2);
  });

  it("evaluates one segment through the bezier of its curves", () => {
    const value = evaluatesegment({ time: 0, value: 0 }, { time: 1, value: 10 }, 0.5);
    assert.ok(Math.abs(value - 5) < 0.3);
    const held = evaluatesegment({ time: 0, value: 3, holdOut: true }, { time: 1, value: 9 }, 0.5);
    assert.equal(held, 3);
  });

  it("sanitizes curves into the legal ranges", () => {
    const clean = sanitizecurve(EASE_LINEAR);
    assert.ok(clean !== null);
    assert.ok(Math.abs((clean as NonNullable<typeof clean>).outInfluence - 100 / 3) < 1e-9);
    assert.equal(
      sanitizecurve({
        outInfluence: Number.NaN,
        outSpeed: 1,
        inInfluence: 100 / 3,
        inSpeed: 1,
      }),
      null,
    );
  });
});
