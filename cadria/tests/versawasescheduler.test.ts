// # versawasescheduler.test — the engine's render-job scheduler, runnable with
// vitest: pnpm vitest run tests/versawasescheduler.test.ts
// Every test watches the promise the scheduler makes: the plan skips non-queued
// jobs, lands every job on the least-loaded slot with ties riding the lowest
// index, counts 3d frames through the renderJobFrames primitive, and the status
// machine answers null on every illegal transition.
import assert from "node:assert/strict";
import { describe, it } from "vitest";
import {
  completeJob,
  failJob,
  planSchedule,
  queueCensus,
  slotLoads,
  startJob,
} from "../versawasescheduler.ts";
import type { RenderJob } from "../versawase.ts";

const job = (id: string, frames: number, status: RenderJob["status"] = "queued"): RenderJob => ({
  id,
  kind: "3d",
  status,
  frameFrom: 0,
  frameTo: frames / 30,
});

const imageJob = (id: string, status: RenderJob["status"] = "queued"): RenderJob => ({
  id,
  kind: "image",
  status,
});

describe("versawasescheduler", () => {
  it("plans queued jobs onto the least-loaded slot, ties ride the lowest index", () => {
    const plan = planSchedule([job("a", 30), job("b", 30), job("c", 30)], 30, 2);
    assert.equal(plan.length, 3);
    assert.deepEqual(plan.map((entry) => entry.slot), [0, 1, 0]);
    assert.deepEqual(plan.map((entry) => entry.order), [1, 1, 2]);
    assert.equal(plan[2].startLoad, 30);
  });

  it("counts frames through the renderJobFrames primitive", () => {
    const plan = planSchedule([job("long", 90)], 30, 1);
    assert.equal(plan[0].frames, 90);
    const image = planSchedule([imageJob("still")], 30, 1);
    assert.equal(image[0].frames, 1);
  });

  it("skips jobs that already left the queue", () => {
    const plan = planSchedule(
      [job("done", 30, "ready"), job("running", 30, "rendering"), job("broken", 30, "failed"), imageJob("next")],
      30,
      2,
    );
    assert.equal(plan.length, 1);
    assert.equal(plan[0].job.id, "next");
  });

  it("never answers an empty plan for an empty queue and guards the slot count", () => {
    assert.equal(planSchedule([], 30, 4).length, 0);
    const plan = planSchedule([imageJob("only")], 30, 0);
    assert.equal(plan[0].slot, 0);
  });

  it("sums the slot loads after planning", () => {
    const entries = planSchedule([job("a", 60), job("b", 30)], 30, 2);
    assert.deepEqual(slotLoads(entries, 2), [60, 30]);
    assert.deepEqual(slotLoads([], 3), [0, 0, 0]);
  });

  it("rides the pure status machine and refuses illegal transitions", () => {
    const queued = imageJob("q");
    const running = startJob(queued);
    assert.equal(running?.status, "rendering");
    assert.equal(running?.tone, "info");
    assert.equal(completeJob(queued), null);
    const ready = completeJob(running as RenderJob);
    assert.equal(ready?.status, "ready");
    assert.equal(ready?.tone, "success");
    assert.equal(startJob(ready as RenderJob), null);
    const failed = failJob(running as RenderJob);
    assert.equal(failed?.status, "failed");
    assert.equal(failJob(ready as RenderJob), null);
  });

  it("censuses the queue in one pass", () => {
    const census = queueCensus([
      imageJob("a"),
      imageJob("b"),
      job("c", 30, "rendering"),
      job("d", 30, "ready"),
      job("e", 30, "failed"),
    ]);
    assert.deepEqual(census, { queued: 2, rendering: 1, ready: 1, failed: 1 });
  });
});
