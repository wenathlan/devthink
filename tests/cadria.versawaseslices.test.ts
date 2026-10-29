// # versawaseslices.test — the sliced-render planner (F-CAD-027), runnable with
// vitest: pnpm vitest run tests/versawaseslices.test.ts
// Every test watches the promise the planner makes: slices land on the frame
// grid with exact tick windows, the last slice carries the remainder, the
// preview seek rides the same grid, progress weighs frames (never slice count)
// and the wall-clock estimate pays the slowest worker.
import assert from "node:assert/strict";
import { describe, it } from "vitest";
import { estimateWallClock, planSlices, sliceAt, sliceProgress } from "../cadria/versawaseslices.ts";
import { TICKS_PER_SECOND, tickofframe } from "../cadria/timeticks.ts";

describe("versawaseslices", () => {
  it("cuts 35s at 24fps into four 10s frame-aligned slices", () => {
    const slices = planSlices({ durationSeconds: 35, fps: 24 });
    assert.equal(slices.length, 4);
    assert.deepEqual(slices.map((slice) => slice.frames), [240, 240, 240, 360 - 240]);
    assert.equal(slices[0].fromFrame, 0);
    assert.equal(slices[0].toFrame, 240);
    assert.equal(slices[3].toFrame, 840);
  });

  it("answers exact tick windows that ride tickofframe", () => {
    const slices = planSlices({ durationSeconds: 10, fps: 24 });
    assert.equal(slices[0].fromTick, 0);
    assert.equal(slices[0].toTick, tickofframe({ num: 24, den: 1 }, 240));
    assert.ok(slices[0].toTick > 0 && slices[0].toTick < TICKS_PER_SECOND * 11);
  });

  it("carries the remainder in the last slice and guards the max", () => {
    const slices = planSlices({ durationSeconds: 12.5, fps: 30, sliceSeconds: 10 });
    assert.equal(slices.length, 2);
    assert.equal(slices[1].frames, 375 - 300);
    const capped = planSlices({ durationSeconds: 60, fps: 30, maxSlices: 2 });
    assert.equal(capped.length, 2);
    assert.deepEqual(capped.map((slice) => slice.frames), [900, 900]);
  });

  it("maps a preview seek to the slice that owns the instant", () => {
    const slices = planSlices({ durationSeconds: 35, fps: 24 });
    assert.equal(sliceAt(slices, 0)?.index, 0);
    assert.equal(sliceAt(slices, 12)?.index, 1);
    assert.equal(sliceAt(slices, 34.9)?.index, 3);
    assert.equal(sliceAt(slices, 40), undefined);
    assert.equal(sliceAt([], 1), undefined);
  });

  it("weighs progress by frames, never by slice count", () => {
    const slices = planSlices({ durationSeconds: 35, fps: 24 });
    const total = 840;
    assert.equal(sliceProgress(slices, []), 0);
    assert.ok(Math.abs(sliceProgress(slices, [0]) - 240 / total) < 1e-12);
    assert.equal(sliceProgress(slices, [0, 1, 2, 3]), 1);
    // the short final slice weighs less than a full one
    const shortOnly = sliceProgress(slices, [3]);
    const fullOnly = sliceProgress(slices, [0]);
    assert.ok(shortOnly < fullOnly);
  });

  it("pays the slowest worker in the honest estimate", () => {
    const slices = planSlices({ durationSeconds: 40, fps: 24 });
    // 4 slices of 240 frames; 2 workers ride 2 slices each — equal lanes.
    assert.equal(estimateWallClock(slices, 0.01, 2), 480 * 0.01);
    // 1 worker carries everything.
    assert.equal(estimateWallClock(slices, 0.01, 1), 960 * 0.01);
    assert.equal(estimateWallClock([], 0.01, 4), 0);
  });

  it("answers empty plans and defaults with engine defaults", () => {
    assert.deepEqual(planSlices({ durationSeconds: 0 }), []);
    assert.deepEqual(planSlices({ durationSeconds: 5, sliceSeconds: 0 }), []);
    const single = planSlices({ durationSeconds: 2 });
    assert.equal(single.length, 1);
    assert.equal(single[0].frames, 48); // 2s at the default 24fps
  });
});
