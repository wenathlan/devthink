// # takeevents.test — the event scheduler of the katexis engine: every test
// watches the contract the transport and the rack ride — the expansion is
// deterministic, the events sit inside the take and ascend in time, the
// velocities stay in range with the section energy applied, the bass locks
// to the kick steps, the lead stays in the key, the position maps an instant
// onto the 16-step grid and the window slice cuts cleanly.
import assert from "node:assert/strict";
import { describe, it } from "vitest";
import { planTake } from "../debonair/arranger.ts";
import { scalePcs } from "../debonair/musictheory.ts";
import { eventsInWindow, positionAt, scheduleTake, sectionAt, validateSchedule } from "../debonair/takeevents.ts";

describe("takeevents — scheduleTake", () => {
  const plan = planTake({ prompt: "midnight techno, dark sub bass, hypnotic arp", seed: "demo-1" });
  const schedule = scheduleTake(plan);

  it("is deterministic for the same plan", () => {
    const again = scheduleTake(plan);
    assert.deepEqual(again, schedule);
  });

  it("answers events for every role and sorts them ascending", () => {
    assert.ok(schedule.perRole.drums > 0);
    assert.ok(schedule.perRole.bass > 0);
    assert.ok(schedule.perRole.keys > 0);
    assert.ok(schedule.perRole.lead > 0);
    for (let index = 1; index < schedule.events.length; index++) {
      assert.ok(schedule.events[index].time >= schedule.events[index - 1].time);
    }
  });

  it("keeps every event inside the take with a velocity in range", () => {
    assert.deepEqual(validateSchedule(schedule), []);
    for (const event of schedule.events) {
      assert.ok(event.time >= 0 && event.time < schedule.duration);
      assert.ok(event.velocity >= 0 && event.velocity <= 1);
      assert.ok(event.seconds > 0);
    }
  });

  it("carries the drop louder than the intro (the section energy rides)", () => {
    const intro = schedule.events.filter((event) => event.time < plan.sections[0].bars * plan.barSeconds);
    const drop = plan.sections.find((section) => section.name === "drop");
    assert.ok(drop);
    const dropStart = drop.bar * plan.barSeconds;
    const dropEvents = schedule.events.filter(
      (event) =>
        event.time >= dropStart && event.time < dropStart + drop.bars * plan.barSeconds && event.role === "drums",
    );
    const loudestIntro = Math.max(...intro.filter((event) => event.role === "drums").map((event) => event.velocity));
    const loudestDrop = Math.max(...dropEvents.map((event) => event.velocity));
    assert.ok(loudestDrop > loudestIntro);
  });

  it("locks the bass to the kick steps of the same bar", () => {
    const eps = 1e-6;
    for (let bar = 0; bar < plan.bars; bar++) {
      const section = sectionAt(plan, bar);
      if (!section.voices.includes("bass")) continue;
      const barStart = bar * plan.barSeconds;
      const stepSec = 60 / plan.bpm / 4;
      const bassSteps = schedule.events
        .filter(
          (event) =>
            event.role === "bass" && event.time >= barStart - eps && event.time < barStart + plan.barSeconds - eps,
        )
        .map((event) => Math.round((event.time - barStart) / stepSec));
      const kickSteps = plan.grid.lanes.kick
        .map((velocity, step) => (velocity > 0 ? step : -1))
        .filter((step) => step >= 0);
      assert.deepEqual(
        [...bassSteps].sort((a, b) => a - b),
        [...kickSteps].sort((a, b) => a - b),
      );
    }
  });

  it("holds one pad voicing per bar on the keys lane", () => {
    const keysByBar = new Map<number, number>();
    for (const event of schedule.events) {
      if (event.role !== "keys") continue;
      const bar = Math.floor(event.time / plan.barSeconds);
      keysByBar.set(bar, (keysByBar.get(bar) ?? 0) + 1);
    }
    for (const [, count] of keysByBar) assert.ok(count >= 3, "a pad voicing carries at least a triad");
  });

  it("keeps the lead on the key's pitch classes", () => {
    const allowed = new Set(scalePcs(plan.key));
    for (const event of schedule.events) {
      if (event.role !== "lead") continue;
      assert.ok(allowed.has(event.midi % 12));
    }
  });

  it("cuts a clean window slice", () => {
    const window = eventsInWindow(schedule, 0, 1);
    for (const event of window) assert.ok(event.time >= 0 && event.time < 1);
    assert.equal(eventsInWindow(schedule, 0, 0).length, 0);
    assert.equal(eventsInWindow(schedule, schedule.duration, schedule.duration + 5).length, 0);
  });
});

describe("takeevents — positionAt", () => {
  const plan = planTake({ prompt: "smooth house, warm sub", seed: "grid-1" });

  it("maps the top of the take onto bar 1 step 1", () => {
    assert.deepEqual(positionAt(plan, 0), { bar: 0, step: 0 });
  });

  it("maps a mid-take instant onto its bar and step", () => {
    const stepSec = 60 / plan.bpm / 4;
    const time = 9 * plan.barSeconds + 5 * stepSec;
    const { bar, step } = positionAt(plan, time);
    assert.equal(bar, 9);
    assert.equal(step, 5);
  });

  it("clamps past the end onto the last bar", () => {
    const { bar } = positionAt(plan, plan.durationSeconds + 30);
    assert.equal(bar, plan.bars - 1);
  });

  it("never answers a negative position", () => {
    const { bar, step } = positionAt(plan, -4);
    assert.equal(bar, 0);
    assert.equal(step, 0);
  });
});
