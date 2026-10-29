// # takestore.test — the session take store: the seam stays injectable (the
// tests run on a memory stub), the ids dedupe (a re-render replaces its
// earlier take), the order is newest first, broken documents answer empty
// and a removal keeps the rest.
import assert from "node:assert/strict";
import { describe, it } from "vitest";
import { planTake } from "../arranger.ts";
import {
  findTakeRecord,
  loadTakeRecords,
  memoryStorage,
  removeTakePlan,
  saveTakePlan,
  TAKE_SELECT_KEY,
  TAKE_STORE_KEY,
} from "../takestore.ts";

describe("takestore", () => {
  it("stores a take and reads it back with its timestamp", () => {
    const storage = memoryStorage();
    const plan = planTake({ prompt: "midnight techno", seed: "s1" });
    const records = saveTakePlan(plan, storage);
    assert.equal(records.length, 1);
    assert.ok(records[0].savedAt.length > 0);
    assert.equal(loadTakeRecords(storage).length, 1);
    assert.equal(loadTakeRecords(storage)[0].plan.id, plan.id);
  });

  it("replaces the record of the same plan id (the seed lock dedupes)", () => {
    const storage = memoryStorage();
    const first = planTake({ prompt: "midnight techno", seed: "s1" });
    const again = planTake({ prompt: "midnight techno", seed: "s1" });
    saveTakePlan(first, storage);
    const records = saveTakePlan(again, storage);
    assert.equal(records.length, 1);
    assert.equal(findTakeRecord(first.id, storage)?.plan.id, again.id);
  });

  it("orders the shelf newest first", () => {
    const storage = memoryStorage();
    const early = planTake({ prompt: "early techno", seed: "a" });
    const late = planTake({ prompt: "late house", seed: "b" });
    const afterFirst = saveTakePlan(early, storage);
    // force the second record to read later than the first
    const clock = Date.now();
    const realNow = Date.now;
    Date.now = () => clock + 5;
    const afterSecond = saveTakePlan(late, storage);
    Date.now = realNow;
    assert.equal(afterSecond[0].plan.id, late.id);
    assert.equal(afterSecond.length, 2);
    assert.ok(afterFirst.length === 1);
  });

  it("removes one take and keeps the rest", () => {
    const storage = memoryStorage();
    const one = planTake({ prompt: "one techno", seed: "a" });
    const two = planTake({ prompt: "two house", seed: "b" });
    saveTakePlan(one, storage);
    saveTakePlan(two, storage);
    const records = removeTakePlan(one.id, storage);
    assert.equal(records.length, 1);
    assert.equal(records[0].plan.id, two.id);
    assert.equal(findTakeRecord(one.id, storage), undefined);
  });

  it("answers empty for a broken or missing document", () => {
    const storage = memoryStorage();
    assert.deepEqual(loadTakeRecords(storage), []);
    storage.setItem(TAKE_STORE_KEY, "{not json");
    assert.deepEqual(loadTakeRecords(storage), []);
    storage.setItem(TAKE_STORE_KEY, JSON.stringify({ nope: true }));
    assert.deepEqual(loadTakeRecords(storage), []);
  });

  it("drops records without a plan id or bpm", () => {
    const storage = memoryStorage();
    const plan = planTake({ prompt: "keeps techno", seed: "a" });
    saveTakePlan(plan, storage);
    storage.setItem(
      TAKE_STORE_KEY,
      JSON.stringify([{ plan: { id: "x" } }, ...JSON.parse(storage.getItem(TAKE_STORE_KEY) ?? "[]")]),
    );
    const records = loadTakeRecords(storage);
    assert.equal(records.length, 1);
    assert.equal(records[0].plan.id, plan.id);
  });

  it("keeps the studio hand-off key beside the shelf key", () => {
    assert.equal(TAKE_STORE_KEY, "debonair.takes");
    assert.equal(TAKE_SELECT_KEY, "debonair.studio.take");
  });
});
