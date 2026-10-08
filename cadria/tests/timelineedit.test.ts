// # timelineedit.test — the editing algebra of the timeline: the
// overwrite, insert, lift and extract spans, the split with the fresh
// right id, the trims with handles and neighbours, the roll, slip,
// slide and rate stretch, runnable with the node built-in runner (no
// dependencies, no install):
//   node --test tests/timelineedit.test.ts
// Every test watches the two invariants the module promises: edits
// never throw — every refusal rides the outcome type — and the media
// window of a piece only moves through the source in point its speed
// computes.
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  type EditItem,
  type EditTrack,
  extract,
  insert,
  itemat,
  itemend,
  lift,
  overwrite,
  ratestretch,
  roll,
  shapeof,
  slide,
  slip,
  sorttrack,
  split,
  syncconflict,
  trackof,
  trim,
} from "../timelineedit.ts";

function item(id: number, start: number, duration: number, sourceIn = 0, speed = 1): EditItem {
  return { id, start, duration, sourceIn, speed };
}

function track(items: EditItem[]): EditTrack {
  return { id: 1, locked: false, syncLock: false, items };
}

describe("timelineedit", () => {
  it("answers the exclusive end and the item under a tick", () => {
    const one = item(1, 10, 5);
    assert.equal(itemend(one), 15);
    const trk = track([one, item(2, 0, 5)]);
    assert.equal(itemat(trk, 12)?.id, 1);
    assert.equal(itemat(trk, 5), null);
    assert.equal(itemat(trk, 4)?.id, 2);
  });

  it("sorts a track by start and then id", () => {
    const trk = sorttrack(track([item(2, 10, 5), item(1, 0, 5), item(3, 10, 5)]));
    assert.deepEqual(
      trk.items.map((it) => it.id),
      [1, 2, 3],
    );
  });

  it("detects the sync-lock conflict of a range", () => {
    const trk = track([item(1, 0, 10)]);
    assert.equal(syncconflict(trk, { start: 5, duration: 2 }), true);
    assert.equal(syncconflict(trk, { start: 10, duration: 2 }), false);
  });

  it("overwrites the covered span and trims the partials", () => {
    const trk = track([item(1, 0, 10, 0), item(2, 10, 10, 0)]);
    const done = overwrite(trk, item(3, 5, 10, 100));
    assert.ok(done.ok);
    if (!done.ok) return;
    const left = done.value.items.find((it) => it.id === 1) as EditItem;
    const right = done.value.items.find((it) => it.id === 2) as EditItem;
    assert.equal(left.duration, 5);
    assert.equal(right.start, 15);
    assert.equal(right.duration, 5);
    assert.equal(right.sourceIn, 5);
    assert.ok(done.value.items.some((it) => it.id === 3));
  });

  it("inserts at the in point and pushes the rest right", () => {
    const trk = track([item(1, 0, 10, 0)]);
    const done = insert(trk, item(2, 5, 4, 50));
    assert.ok(done.ok);
    if (!done.ok) return;
    assert.equal(done.value.items.length, 3);
    const head = done.value.items.find((it) => it.start === 0) as EditItem;
    assert.equal(head.duration, 5);
    const tail = done.value.items.find((it) => it.start === 9) as EditItem;
    assert.equal(tail.duration, 5);
    assert.equal(tail.sourceIn, 5);
    const fresh = done.value.items.find((it) => it.id === 2) as EditItem;
    assert.equal(fresh.start, 5);
  });

  it("lifts the span and keeps the gap", () => {
    const trk = track([item(1, 0, 10, 0), item(2, 10, 10, 0)]);
    const done = lift(trk, { start: 8, duration: 4 });
    assert.ok(done.ok);
    if (!done.ok) return;
    assert.equal(done.value.items.length, 2);
    assert.equal(done.value.items[0].duration, 8);
    assert.equal(done.value.items[1].start, 12);
    assert.equal(done.value.items[1].duration, 8);
    assert.equal(done.value.items[1].sourceIn, 2);
    assert.equal(lift(trk, { start: 50, duration: 4 }).ok, false);
  });

  it("extracts the span and closes the gap", () => {
    const trk = track([item(1, 0, 10, 0), item(2, 10, 10, 0)]);
    const done = extract(trk, { start: 8, duration: 4 });
    assert.ok(done.ok);
    if (!done.ok) return;
    assert.equal(done.value.items[1].start, 8);
    assert.equal(done.value.items[1].duration, 8);
  });

  it("splits the containing item with a fresh right id", () => {
    const trk = track([item(1, 0, 10, 0, 2)]);
    const done = split(trk, 6);
    assert.ok(done.ok);
    if (!done.ok) return;
    assert.equal(done.value.track.items.length, 2);
    assert.equal(done.value.track.items[0].duration, 6);
    const right = done.value.track.items[1];
    assert.equal(right.start, 6);
    assert.equal(right.duration, 4);
    assert.equal(right.sourceIn, 12);
    assert.equal(right.speed, 2);
    assert.equal(done.value.rightId, 2);
    assert.equal(split(trk, 20).ok, false);
  });

  it("trims the in edge across the media handles", () => {
    const trk = track([item(1, 0, 10, 20)]);
    const done = trim(trk, 1, "in", 2, { mediaStart: 0 });
    assert.ok(done.ok);
    if (!done.ok) return;
    const moved = done.value.items[0];
    assert.equal(moved.start, 2);
    assert.equal(moved.duration, 8);
    assert.equal(moved.sourceIn, 22);
    assert.equal(trim(trk, 1, "in", 30, { mediaStart: 0 }).ok, false);
    assert.equal(trim(trk, 1, "in", 0).ok, false);
  });

  it("trims the out edge against the media duration", () => {
    const trk = track([item(1, 0, 10, 0, 1)]);
    const done = trim(trk, 1, "out", 5, { mediaStart: 0, mediaDuration: 20 });
    assert.ok(done.ok);
    if (!done.ok) return;
    assert.equal(done.value.items[0].duration, 15);
    assert.equal(trim(trk, 1, "out", 5, { mediaStart: 0, mediaDuration: 12 }).ok, false);
  });

  it("rolls the cut between two joined items", () => {
    const trk = track([item(1, 0, 10, 0), item(2, 10, 10, 0)]);
    const done = roll(trk, 1, 3);
    assert.ok(done.ok);
    if (!done.ok) return;
    const left = done.value.items.find((it) => it.id === 1) as EditItem;
    const right = done.value.items.find((it) => it.id === 2) as EditItem;
    assert.equal(left.duration, 13);
    assert.equal(right.start, 13);
    assert.equal(right.duration, 7);
    assert.equal(right.sourceIn, 3);
    assert.equal(roll(trk, 1, 0).ok, false);
  });

  it("slips the media window without moving the span", () => {
    const trk = track([item(1, 0, 10, 20)]);
    const done = slip(trk, 1, 5);
    assert.ok(done.ok);
    if (!done.ok) return;
    assert.equal(done.value.items[0].start, 0);
    assert.equal(done.value.items[0].duration, 10);
    assert.equal(done.value.items[0].sourceIn, 25);
    assert.equal(slip(trk, 1, -30, { mediaStart: 0 }).ok, false);
  });

  it("slides the item between its neighbours", () => {
    const trk = track([item(1, 0, 5, 0), item(2, 10, 5, 0), item(3, 20, 5, 0)]);
    const done = slide(trk, 2, 3);
    assert.ok(done.ok);
    if (!done.ok) return;
    assert.equal(done.value.items[1].start, 13);
    assert.equal(slide(trk, 2, 6).ok, false);
    assert.equal(slide(trk, 2, -8).ok, false);
  });

  it("rate stretches the item over a new duration", () => {
    const trk = track([item(1, 0, 10, 0, 1)]);
    const done = ratestretch(trk, 1, 20);
    assert.ok(done.ok);
    if (!done.ok) return;
    assert.equal(done.value.items[0].duration, 20);
    assert.equal(done.value.items[0].speed, 0.5);
    const back = ratestretch(done.value, 1, 5);
    assert.ok(back.ok);
    if (!back.ok) return;
    assert.equal(back.value.items[0].speed, 2);
    assert.equal(ratestretch(trk, 1, 0, { minDuration: 1 }).ok, false);
  });

  it("refuses every edit on a locked track", () => {
    const trk = track([item(1, 0, 10)]);
    trk.locked = true;
    assert.equal(overwrite(trk, item(2, 0, 5)).ok, false);
    assert.equal(insert(trk, item(2, 0, 5)).ok, false);
    assert.equal(lift(trk, { start: 0, duration: 5 }).ok, false);
    assert.equal(split(trk, 5).ok, false);
  });
});
