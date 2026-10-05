// # timeline.model.test — honest unit tests for the arrangement timeline
// model (snap, overlap, split, trim, move), runnable with the node runner:
//   node --test tests/timeline.model.test.ts
// The clip fixtures mirror the shapes the studio timeline serves.
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  activeAt,
  clipsOverlap,
  MINIMUMDURATION,
  moveClip,
  snapClip,
  snapToGrid,
  splitClip,
  TimelineModelError,
  totalDuration,
  trimClip,
  validatePlacement,
  type TimelineClip,
} from "../timeline.model.ts";

const GRID = { stepseconds: 0.25 };

/** builds one clip with the given span on a track. */
function clip(id: string, track: string, start: number, duration: number, label = id): TimelineClip {
  return { id, track, label, start, duration };
}

describe("timeline grid snap", () => {
  it("snaps a time to the nearest step", () => {
    assert.equal(snapToGrid(1.04, GRID), 1);
    assert.equal(snapToGrid(1.13, GRID), 1.25);
    assert.equal(snapToGrid(0, GRID), 0);
  });

  it("cleans the float noise of the division", () => {
    assert.equal(snapToGrid(0.3, { stepseconds: 0.1 }), 0.3);
  });

  it("snaps a clip start and rounds its duration to whole steps", () => {
    const snapped = snapClip(clip("c1", "Drums", 1.04, 1.1), GRID);
    assert.equal(snapped.start, 1);
    assert.equal(snapped.duration, 1);
    assert.equal(snapped.track, "Drums");
  });

  it("refuses a bad time or a bad grid", () => {
    assert.throws(() => snapToGrid(-1, GRID), TimelineModelError);
    assert.throws(() => snapToGrid(1, { stepseconds: 0 }), (error: unknown) => {
      assert.ok(error instanceof TimelineModelError);
      assert.equal(error.code, "bad-grid");
      return true;
    });
  });
});

describe("timeline overlap", () => {
  it("flags same track sharing time and spares touching edges", () => {
    assert.equal(clipsOverlap(clip("a", "Drums", 0, 1), clip("b", "Drums", 0.5, 1)), true);
    assert.equal(clipsOverlap(clip("a", "Drums", 0, 1), clip("b", "Drums", 1, 1)), false);
  });

  it("never flags different tracks", () => {
    assert.equal(clipsOverlap(clip("a", "Drums", 0, 1), clip("b", "Bass", 0, 1)), false);
  });

  it("validates the placement and reports the offending pair", () => {
    const arrangement = [clip("a", "Drums", 0, 2), clip("b", "Bass", 0, 4)];
    assert.doesNotThrow(() => validatePlacement(clip("c", "Bass", 5, 1), arrangement));
    assert.throws(() => validatePlacement(clip("c", "Drums", 1, 2), arrangement), (error: unknown) => {
      assert.ok(error instanceof TimelineModelError);
      assert.equal(error.code, "overlap");
      assert.equal(error.clipid, "c");
      return true;
    });
  });

  it("skips the clip itself and honors the allowoverlap escape hatch", () => {
    const arrangement = [clip("a", "Drums", 0, 2)];
    assert.doesNotThrow(() => validatePlacement(clip("a", "Drums", 0, 2), arrangement));
    assert.doesNotThrow(() => validatePlacement(clip("c", "Drums", 1, 2), arrangement, { allowoverlap: true }));
  });
});

describe("timeline split", () => {
  it("cuts one clip into two spans that cover the original", () => {
    const [left, right] = splitClip(clip("c1", "Bass", 2, 1.5), 2.5);
    assert.equal(left.id, "c1.a");
    assert.equal(left.start, 2);
    assert.equal(left.duration, 0.5);
    assert.equal(right.id, "c1.b");
    assert.equal(right.start, 2.5);
    assert.equal(right.duration, 1);
    assert.ok(!clipsOverlap(left, right));
  });

  it("refuses a split on the edges or outside the span", () => {
    const target = clip("c1", "Bass", 2, 1.5);
    assert.throws(() => splitClip(target, 2), (error: unknown) => {
      assert.ok(error instanceof TimelineModelError);
      assert.equal(error.code, "split-outside");
      assert.equal(error.clipid, "c1");
      return true;
    });
    assert.throws(() => splitClip(target, 3.5), TimelineModelError);
    assert.throws(() => splitClip(target, 9), TimelineModelError);
  });
});

describe("timeline trim", () => {
  it("slides the start right and keeps the end", () => {
    const trimmed = trimClip(clip("c1", "Drums", 2, 1.5), "start", 2.5);
    assert.equal(trimmed.start, 2.5);
    assert.equal(trimmed.duration, 1);
  });

  it("slides the end left and keeps the start", () => {
    const trimmed = trimClip(clip("c1", "Drums", 2, 1.5), "end", 3);
    assert.equal(trimmed.start, 2);
    assert.equal(trimmed.duration, 1);
  });

  it("refuses a trim that leaves the span or breaks the minimum duration", () => {
    const target = clip("c1", "Drums", 2, 1.5);
    assert.throws(() => trimClip(target, "start", 1.9), (error: unknown) => {
      assert.ok(error instanceof TimelineModelError);
      assert.equal(error.code, "trim-invalid");
      return true;
    });
    assert.throws(() => trimClip(target, "start", 3.5 - MINIMUMDURATION + 0.01), TimelineModelError);
    assert.throws(() => trimClip(target, "end", 2 + MINIMUMDURATION - 0.01), TimelineModelError);
    assert.throws(() => trimClip(target, "end", 9), TimelineModelError);
  });
});

describe("timeline move", () => {
  const arrangement = [clip("a", "Drums", 0, 2), clip("b", "Drums", 4, 2), clip("c", "Bass", 0, 4)];

  it("moves a clip into a free span", () => {
    const moved = moveClip(clip("d", "Drums", 7, 1), -0.5, arrangement);
    assert.equal(moved.start, 6.5);
  });

  it("clamps the landing at zero", () => {
    const moved = moveClip(clip("d", "Lead", 1, 1), -9, arrangement);
    assert.equal(moved.start, 0);
  });

  it("rejects the landing on an occupied spot", () => {
    assert.throws(() => moveClip(clip("d", "Drums", 2, 1), 1.5, arrangement), (error: unknown) => {
      assert.ok(error instanceof TimelineModelError);
      assert.equal(error.code, "overlap");
      return true;
    });
  });

  it("snaps the landing when a grid is passed and moves across tracks", () => {
    const moved = moveClip(clip("d", "Drums", 6, 1), 0.9, arrangement, { grid: GRID });
    assert.equal(moved.start, 7);
    const rebassed = moveClip(clip("d", "Drums", 6, 1), 0, arrangement, { track: "Bass", allowoverlap: true });
    assert.equal(rebassed.track, "Bass");
  });
});

describe("timeline queries", () => {
  const arrangement = [clip("a", "Drums", 0, 1), clip("b", "Bass", 0.5, 2), clip("c", "Lead", 5, 1)];

  it("answers the clips playing at one instant", () => {
    assert.deepEqual(activeAt(arrangement, 0.75).map((row) => row.id), ["a", "b"]);
    assert.deepEqual(activeAt(arrangement, 1).map((row) => row.id), ["b"]);
    assert.deepEqual(activeAt(arrangement, 10), []);
  });

  it("refuses a negative instant", () => {
    assert.throws(() => activeAt(arrangement, -0.1), TimelineModelError);
  });

  it("measures the arrangement length by the last clip end", () => {
    assert.equal(totalDuration(arrangement), 6);
    assert.equal(totalDuration([]), 0);
  });
});
