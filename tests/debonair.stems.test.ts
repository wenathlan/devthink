// # stems.test — the stem planner contract: the canonical partition order,
// the conservation invariant (the sum of the stem events equals the schedule
// total, per role and overall), the determinism of the partition, the
// schema v1 manifest with the take identity and the mastering rate, the
// desk faders the bounce rides and the hard failures with their codes.
import assert from "node:assert/strict";
import { describe, it } from "vitest";
import { planTake } from "../debonair/arranger.ts";
import { MASTERING } from "../debonair/katexis.ts";
import {
  planStems,
  STEM_ROLES,
  STEMS_SCHEMA_VERSION,
  StemsError,
  stemFile,
  stemsManifest,
  validateStems,
} from "../debonair/stems.ts";
import { type NoteEvent, scheduleTake, type TakeSchedule } from "../debonair/takeevents.ts";

describe("stems — planStems", () => {
  const plan = planTake({ prompt: "midnight techno, dark sub bass, hypnotic arp", seed: "k4-stems" });
  const schedule = scheduleTake(plan);
  const stems = planStems(schedule, plan);

  it("partitions the schedule one stem per role in canonical order", () => {
    assert.equal(stems.length, STEM_ROLES.length);
    assert.deepEqual(
      stems.map((stem) => stem.role),
      STEM_ROLES.map((policy) => policy.role),
    );
  });

  it("conserves every scheduled event (the sum of the stems equals the take)", () => {
    const total = stems.reduce((sum, stem) => sum + stem.events.length, 0);
    assert.equal(total, schedule.events.length);
    for (const stem of stems) assert.equal(stem.events.length, schedule.perRole[stem.role]);
  });

  it("keeps each stem time-ascending and inside its span", () => {
    for (const stem of stems) {
      for (let index = 1; index < stem.events.length; index++) {
        assert.ok(stem.events[index].time >= stem.events[index - 1].time);
      }
      for (const event of stem.events) assert.ok(event.time + event.seconds <= stem.seconds + 1e-6);
    }
  });

  it("is deterministic for the same schedule", () => {
    assert.deepEqual(planStems(scheduleTake(plan), plan), stems);
  });

  it("names the files after the take and the role", () => {
    for (const stem of stems) assert.equal(stem.file, stemFile(plan.id, stem.role));
    assert.equal(stemFile("abc123", "drums"), "abc123-drums.wav");
  });

  it("rides the desk faders the plan opened with", () => {
    for (const stem of stems) {
      const strip = plan.strips.find((row) => row.name === stem.role);
      assert.ok(strip);
      assert.equal(stem.gainDb, strip.faderDb);
      assert.ok(stem.channelkind === "mono" || stem.channelkind === "stereo");
    }
  });

  it("refuses an empty schedule and an unknown role", () => {
    const empty: TakeSchedule = { events: [], perRole: { drums: 0, bass: 0, keys: 0, lead: 0 }, duration: 1 };
    assert.throws(
      () => planStems(empty, plan),
      (error: unknown) => error instanceof StemsError && error.code === "empty-schedule",
    );
    const stranger = {
      lane: "guitar",
      role: "guitar",
      time: 0,
      seconds: 0.1,
      velocity: 0.5,
      midi: 60,
    } as unknown as NoteEvent;
    assert.throws(
      () => planStems({ ...schedule, events: [...schedule.events, stranger] }, plan),
      (error: unknown) => error instanceof StemsError && error.code === "unknown-role",
    );
  });
});

describe("stems — manifest", () => {
  const plan = planTake({ prompt: "smooth house, warm sub", seed: "k4-manifest" });
  const schedule = scheduleTake(plan);
  const stems = planStems(schedule, plan);
  const manifest = stemsManifest({ plan, stems });

  it("declares schema v1 with the take identity and the mastering rate", () => {
    assert.equal(STEMS_SCHEMA_VERSION, "debonair.stems/1");
    assert.equal(manifest.schemaVersion, "debonair.stems/1");
    assert.equal(manifest.takeId, plan.id);
    assert.equal(manifest.sampleRate, 48000);
    assert.equal(manifest.sampleRate, MASTERING.sampleRateHz);
    assert.equal(manifest.lufsTarget, plan.lufsTarget);
  });

  it("mirrors the partition into counted rows", () => {
    assert.equal(manifest.stems.length, stems.length);
    for (const row of manifest.stems) {
      const stem = stems.find((candidate) => candidate.role === row.role);
      assert.ok(stem);
      assert.equal(row.file, stem.file);
      assert.equal(row.events, stem.events.length);
      assert.equal(row.seconds, stem.seconds);
    }
    assert.equal(Number.isNaN(Date.parse(manifest.generatedAt)), false);
  });

  it("validates clean and flags a robbed event, a foreign take and a shuffled order", () => {
    assert.deepEqual(validateStems(schedule, plan, manifest), []);
    const robbed = {
      ...manifest,
      stems: manifest.stems.map((row, index) => (index === 0 ? { ...row, events: row.events - 1 } : row)),
    };
    assert.ok(validateStems(schedule, plan, robbed).some((problem) => problem.code === "conservation"));
    const foreign = { ...manifest, takeId: "other-take" };
    assert.ok(validateStems(schedule, plan, foreign).some((problem) => problem.code === "bad-manifest"));
    const shuffled = { ...manifest, stems: [...manifest.stems].reverse() };
    assert.ok(validateStems(schedule, plan, shuffled).some((problem) => problem.code === "bad-order"));
  });
});
