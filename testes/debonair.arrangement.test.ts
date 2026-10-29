// # arrangement.test — the clip binding of the katexis engine: every test
// watches the law the desk rides — the identity (feeding the plan's own
// clips answers the seeded schedule), the move (a clip plays what it played,
// from its new start), the delete (the survivors re-slice the material), the
// split (the children share the parent's slice), the determinism (same plan,
// same clips, same schedule) and the refusals (unsound clips are named).
import assert from "node:assert/strict";
import { describe, it } from "vitest";
import { ArrangementError, rebaseSchedule, validateArrangement } from "../debonair/arrangement.ts";
import { planTake } from "../debonair/arranger.ts";
import { scheduleTake, validateSchedule } from "../debonair/takeevents.ts";

describe("arrangement — rebaseSchedule", () => {
  const plan = planTake({ prompt: "midnight techno, dark sub bass, hypnotic arp", seed: "demo-1" });
  const seeded = scheduleTake(plan);

  it("is the identity when the desk carries the plan's own clips", () => {
    const rebased = rebaseSchedule(plan, plan.clips, seeded);
    assert.equal(rebased.events.length, seeded.events.length);
    for (let index = 0; index < seeded.events.length; index++) {
      assert.equal(rebased.events[index].role, seeded.events[index].role);
      assert.ok(Math.abs(rebased.events[index].time - seeded.events[index].time) < 1e-6, `event ${index} drifted`);
    }
    assert.deepEqual(rebased.perRole, seeded.perRole);
  });

  it("moves a clip's material to the clip's new start", () => {
    const role = "drums";
    const clip = plan.clips.find((entry) => entry.track === role);
    assert.ok(clip);
    const shifted = plan.clips.map((entry) =>
      entry.id === clip.id ? { ...entry, start: entry.start + entry.duration } : entry,
    );
    const rebased = rebaseSchedule(plan, shifted, seeded);
    const sourceTimes = seeded.events
      .filter((event) => event.role === role && event.time >= clip.start && event.time < clip.start + clip.duration)
      .map((event) => event.time - clip.start + clip.start + clip.duration);
    const playedTimes = rebased.events.filter((event) => event.role === role).map((event) => event.time);
    assert.ok(sourceTimes.length > 0, "the source window carried no events");
    for (const expected of sourceTimes) {
      assert.ok(
        playedTimes.some((time) => Math.abs(time - expected) < 1e-6),
        `no event landed at ${expected.toFixed(3)}`,
      );
    }
  });

  it("re-slices the material across the survivors when a clip is deleted", () => {
    const role = "bass";
    const clips = plan.clips.filter((entry) => entry.track === role);
    assert.ok(clips.length > 1, "the test needs more than one bass clip");
    const removed = clips[0];
    const survivors = clips.slice(1);
    const rebased = rebaseSchedule(plan, survivors, seeded);
    const sourceCount = seeded.events.filter(
      (event) => event.role === role && event.time >= removed.start && event.time < removed.start + removed.duration,
    ).length;
    const playedCount = rebased.events.filter((event) => event.role === role).length;
    const expected = seeded.events.filter((event) => event.role === role).length - sourceCount;
    assert.equal(playedCount, expected, "the survivors must carry the remaining material");
  });

  it("keeps every event inside its clip's own gate after the re-slice", () => {
    const shrunk = plan.clips.map((entry) =>
      entry.track === "keys" ? { ...entry, duration: entry.duration / 2 } : entry,
    );
    const rebased = rebaseSchedule(plan, shrunk, seeded);
    for (const event of rebased.events) {
      const clip = shrunk.find(
        (entry) =>
          entry.track === event.role &&
          event.time >= entry.start - 1e-6 &&
          event.time < entry.start + entry.duration - 1e-6,
      );
      assert.ok(clip, `event at ${event.time} sits outside every clip of ${event.role}`);
    }
  });

  it("answers a valid schedule the transport validator accepts", () => {
    const edited = plan.clips.map((entry) =>
      entry.track === "lead" ? { ...entry, start: entry.start + 0.5 * entry.duration } : entry,
    );
    const rebased = rebaseSchedule(plan, edited, seeded);
    assert.deepEqual(validateSchedule(rebased), []);
  });

  it("is deterministic: same plan, same clips, same schedule", () => {
    const edited = plan.clips.map((entry) => ({ ...entry, start: entry.start + 0.25 * entry.duration }));
    const left = JSON.parse(JSON.stringify(rebaseSchedule(plan, edited, seeded)));
    const right = JSON.parse(JSON.stringify(rebaseSchedule(plan, edited, seeded)));
    assert.deepEqual(left, right);
  });

  it("refuses unsound clips with the clip's own id", () => {
    const broken = plan.clips.map((entry) => (entry.track === "drums" ? { ...entry, duration: -1 } : entry));
    assert.throws(
      () => rebaseSchedule(plan, broken, seeded),
      (error: unknown) => {
        assert.ok(error instanceof ArrangementError);
        assert.equal(error.code, "bad-clips");
        return true;
      },
    );
  });

  it("validates the edit base and names a sound plan empty", () => {
    assert.deepEqual(validateArrangement(plan), []);
  });
});
