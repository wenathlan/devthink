// # pianoroll.test — the note editor of the katexis engine: every test
// watches the contract the studio edits under — the import is deterministic,
// the rebuild answers the schedule bit-for-bit (deep equal), the ids stay
// stable and unique, the edit ops snap, clamp and honor the role overlap
// policies, quantize straightens the swing by strength and the validator
// answers the problems the plan's own grammar never allows.
import assert from "node:assert/strict";
import { describe, it } from "vitest";
import { planTake, type TakePlan } from "../arranger.ts";
import {
  addNote,
  type EditableNote,
  moveNote,
  notesToSchedule,
  PIANOROLL_CONSTANTS,
  PianoRollError,
  quantizeNote,
  removeNote,
  resizeNote,
  scheduleToNotes,
  validateNotes,
} from "../pianoroll.ts";
import { scheduleTake } from "../takeevents.ts";

/** the swung fixture (lofi swings 0.62 — the deep column offset the matrix carries) */
const SWUNG_PLAN: TakePlan = planTake({ prompt: "dusty lofi swing, warm sub", seed: "k3-swung", genreId: "lofi" });
/** the straight fixture (techno swings 0.5 — no column offset at all) */
const STRAIGHT_PLAN: TakePlan = planTake({
  prompt: "warehouse loop, four on the floor",
  seed: "k3-straight",
  genreId: "techno",
});
const BAR: { fromBar: number; bars: number } = { fromBar: 0, bars: 1 };

/** builds a synthetic melodic note (the validator's fixture). */
function keysNote(step: number, midi: number, idSuffix = `${step}-${midi}`): EditableNote {
  return {
    id: `keys-0-${idSuffix}`,
    role: "keys",
    lane: "keys",
    midi,
    bar: 0,
    step,
    steps: 4,
    velocity: 0.8,
    swing: 0,
    gate: 0.4,
  };
}

describe("pianoroll — scheduleToNotes", () => {
  const swung = scheduleToNotes(scheduleTake(SWUNG_PLAN), SWUNG_PLAN);

  it("is deterministic for the same schedule and plan", () => {
    const again = scheduleToNotes(scheduleTake(SWUNG_PLAN), SWUNG_PLAN);
    assert.equal(JSON.stringify(again), JSON.stringify(swung));
  });

  it("answers stable unique ids in the documented shape", () => {
    const ids = swung.map((note) => note.id);
    assert.equal(new Set(ids).size, ids.length, "the roll carried a duplicate id");
    for (const id of ids) assert.match(id, /^[a-z]+-\d+-\d+-\d+$/);
  });

  it("maps every note inside the take with a step on the 16th grid", () => {
    assert.ok(swung.length > 0);
    for (const note of swung) {
      assert.ok(note.bar >= 0 && note.bar < SWUNG_PLAN.bars);
      assert.ok(note.step >= 0 && note.step < PIANOROLL_CONSTANTS.STEPS_PER_BAR);
      assert.ok(note.steps >= PIANOROLL_CONSTANTS.MIN_NOTE_STEPS);
      assert.ok(note.velocity >= 0 && note.velocity <= 1);
      if (note.role !== "drums") {
        assert.ok(note.midi >= PIANOROLL_CONSTANTS.NOTE_MIN && note.midi <= PIANOROLL_CONSTANTS.NOTE_MAX);
      }
    }
  });

  it("recovers the plan's swing column exactly (the deep offset)", () => {
    // lofi swings 0.62 → the columns at step % 4 === 2 ride a 0.48 offset
    const swungHat = swung.find((note) => note.role === "drums" && note.lane === "hat" && note.step === 2);
    assert.ok(swungHat, "the lofi grid carries a hat on the swung column");
    assert.ok(Math.abs(swungHat.swing - 0.48) < 1e-9);
    // the straight plan carries no swing anywhere
    const straight = scheduleToNotes(scheduleTake(STRAIGHT_PLAN), STRAIGHT_PLAN);
    for (const note of straight) assert.equal(note.swing, 0);
  });

  it("rides the bass two octaves up into the C2 window", () => {
    const bass = swung.find((note) => note.role === "bass");
    assert.ok(bass, "the trap plan voices the bass");
    assert.ok(bass.midi >= PIANOROLL_CONSTANTS.NOTE_MIN, "the bass roll pitch left the window");
  });
});

describe("pianoroll — notesToSchedule", () => {
  it("rebuilds the swung schedule bit-for-bit (deep equal)", () => {
    const schedule = scheduleTake(SWUNG_PLAN);
    const rebuilt = notesToSchedule(scheduleToNotes(schedule, SWUNG_PLAN), SWUNG_PLAN);
    assert.deepEqual(rebuilt, schedule);
  });

  it("rebuilds the straight schedule bit-for-bit (deep equal)", () => {
    const schedule = scheduleTake(STRAIGHT_PLAN);
    const rebuilt = notesToSchedule(scheduleToNotes(schedule, STRAIGHT_PLAN), STRAIGHT_PLAN);
    assert.deepEqual(rebuilt, schedule);
  });

  it("is deterministic for the same notes and plan", () => {
    const notes = scheduleToNotes(scheduleTake(SWUNG_PLAN), SWUNG_PLAN);
    const first = JSON.stringify(notesToSchedule(notes, SWUNG_PLAN));
    const second = JSON.stringify(notesToSchedule(notes, SWUNG_PLAN));
    assert.equal(first, second);
  });

  it("keeps the per-role counts consistent and the events time-ascending", () => {
    const notes = scheduleToNotes(scheduleTake(SWUNG_PLAN), SWUNG_PLAN);
    const rebuilt = notesToSchedule(notes, SWUNG_PLAN);
    const counted = { drums: 0, bass: 0, keys: 0, lead: 0 };
    for (const note of notes) counted[note.role] += 1;
    assert.deepEqual(rebuilt.perRole, counted);
    for (let index = 1; index < rebuilt.events.length; index++) {
      assert.ok(rebuilt.events[index].time >= rebuilt.events[index - 1].time);
    }
  });

  it("answers the drums zero midi and the plan's duration", () => {
    const notes = scheduleToNotes(scheduleTake(SWUNG_PLAN), SWUNG_PLAN);
    const rebuilt = notesToSchedule(notes, SWUNG_PLAN);
    for (const event of rebuilt.events) if (event.role === "drums") assert.equal(event.midi, 0);
    assert.equal(rebuilt.duration, SWUNG_PLAN.durationSeconds);
  });
});

describe("pianoroll — addNote", () => {
  const notes = scheduleToNotes(scheduleTake(SWUNG_PLAN), SWUNG_PLAN);

  it("adds one note with the hard velocity, one step and the documented id", () => {
    const next = addNote(notes, { role: "drums", lane: "tom", bar: 0, step: 7 }, BAR, SWUNG_PLAN);
    assert.equal(next.length, notes.length + 1);
    const added = next.find((note) => note.lane === "tom");
    assert.ok(added);
    assert.equal(added.id, "drums-0-7-7");
    assert.equal(added.velocity, PIANOROLL_CONSTANTS.VELOCITY_STEPS.hard);
    assert.equal(added.steps, 1);
  });

  it("blocks a doubled lane slot (the drums policy) and spares the other lanes", () => {
    assert.throws(
      () => addNote(notes, { role: "drums", lane: "kick", bar: 0, step: 0 }, BAR, SWUNG_PLAN),
      (error: unknown) => {
        assert.ok(error instanceof PianoRollError);
        assert.equal(error.code, "overlap");
        return true;
      },
    );
    const next = addNote(notes, { role: "drums", lane: "snare", bar: 0, step: 0 }, BAR, SWUNG_PLAN);
    assert.equal(next.length, notes.length + 1);
  });

  it("blocks the keys span overlap and spares the other pitches (the chord law)", () => {
    const keys = notes.find((note) => note.role === "keys");
    assert.ok(keys);
    assert.throws(
      () => addNote(notes, { role: "keys", midi: keys.midi, bar: 0, step: 4 }, BAR, SWUNG_PLAN),
      (error: unknown) => error instanceof PianoRollError && error.code === "overlap",
    );
    const next = addNote(notes, { role: "keys", midi: PIANOROLL_CONSTANTS.NOTE_MAX, bar: 0, step: 0 }, BAR, SWUNG_PLAN);
    assert.equal(next.length, notes.length + 1);
  });

  it("blocks the doubled bass onset and allows the retrigger a slot later", () => {
    const bass = notes.find((note) => note.role === "bass");
    assert.ok(bass);
    // the bass enters with the verse, so the window rides the note's own bar
    const win = { fromBar: bass.bar, bars: 1 };
    assert.throws(
      () => addNote(notes, { role: "bass", midi: bass.midi, bar: bass.bar, step: bass.step }, win, SWUNG_PLAN),
      (error: unknown) => error instanceof PianoRollError && error.code === "overlap",
    );
    const next = addNote(notes, { role: "bass", midi: bass.midi, bar: bass.bar, step: bass.step + 1 }, win, SWUNG_PLAN);
    assert.equal(next.length, notes.length + 1);
  });

  it("clamps the drop into the clip window and refuses a window off the take", () => {
    const clamped = addNote(notes, { role: "drums", lane: "tom", bar: 5, step: 20 }, BAR, SWUNG_PLAN);
    const dropped = clamped.find((note) => note.lane === "tom");
    assert.ok(dropped);
    assert.equal(dropped.bar, 0);
    assert.equal(dropped.step, PIANOROLL_CONSTANTS.STEPS_PER_BAR - 1);
    assert.throws(
      () =>
        addNote(
          notes,
          { role: "drums", lane: "tom", bar: 0, step: 0 },
          { fromBar: SWUNG_PLAN.bars, bars: 1 },
          SWUNG_PLAN,
        ),
      (error: unknown) => error instanceof PianoRollError && error.code === "out-of-window",
    );
  });

  it("refuses a melodic midi off the C2..C6 window and a duplicate id", () => {
    assert.throws(
      () => addNote(notes, { role: "lead", midi: PIANOROLL_CONSTANTS.NOTE_MAX + 1, bar: 0, step: 0 }, BAR, SWUNG_PLAN),
      (error: unknown) => error instanceof PianoRollError && error.code === "bad-note",
    );
    const keys = notes.find((note) => note.role === "keys");
    assert.ok(keys);
    const slot = { role: "keys" as const, midi: PIANOROLL_CONSTANTS.NOTE_MAX, bar: 0, step: 15 };
    const seeded = addNote(notes, slot, BAR, SWUNG_PLAN);
    assert.throws(
      () => addNote(seeded, slot, BAR, SWUNG_PLAN),
      (error: unknown) => error instanceof PianoRollError && error.code === "overlap",
    );
  });
});

describe("pianoroll — removeNote, moveNote, resizeNote", () => {
  const notes = scheduleToNotes(scheduleTake(SWUNG_PLAN), SWUNG_PLAN);
  const kick = notes.find((note) => note.role === "drums" && note.lane === "kick" && note.bar === 0);
  assert.ok(kick);

  it("removes by id and refuses a second removal", () => {
    const next = removeNote(notes, kick.id);
    assert.equal(next.length, notes.length - 1);
    assert.ok(!next.some((note) => note.id === kick.id));
    assert.throws(
      () => removeNote(next, kick.id),
      (error: unknown) => error instanceof PianoRollError && error.code === "bad-note",
    );
  });

  it("moves on the straight grid, keeps the id stable and leaves the others untouched", () => {
    const next = moveNote(notes, kick.id, 2, BAR, SWUNG_PLAN);
    const moved = next.find((note) => note.id === kick.id);
    assert.ok(moved);
    assert.equal(moved.step, kick.step + 2);
    assert.equal(moved.bar, 0);
    assert.equal(next.length, notes.length);
    const others = next.filter((note) => note.id !== kick.id);
    assert.deepEqual(
      others,
      notes.filter((note) => note.id !== kick.id),
    );
  });

  it("clamps the move into the clip window", () => {
    const next = moveNote(notes, kick.id, 100, BAR, SWUNG_PLAN);
    const moved = next.find((note) => note.id === kick.id);
    assert.ok(moved);
    assert.equal(moved.step, PIANOROLL_CONSTANTS.STEPS_PER_BAR - kick.steps);
    assert.equal(moved.bar, 0);
  });

  it("refuses a move into a same-lane span and a move off the roll", () => {
    const seeded = addNote(notes, { role: "drums", lane: "kick", bar: 0, step: 4 }, BAR, SWUNG_PLAN);
    assert.throws(
      () => moveNote(seeded, kick.id, 4, BAR, SWUNG_PLAN),
      (error: unknown) => error instanceof PianoRollError && error.code === "overlap",
    );
    assert.throws(
      () => moveNote(notes, "drums-9-9-9", 1, BAR, SWUNG_PLAN),
      (error: unknown) => error instanceof PianoRollError && error.code === "bad-note",
    );
  });

  it("resizes with the one-step floor, recomputes the gate and clamps at the window", () => {
    const floored = resizeNote(notes, kick.id, 0, BAR, SWUNG_PLAN);
    assert.equal(floored.find((note) => note.id === kick.id)?.steps, PIANOROLL_CONSTANTS.MIN_NOTE_STEPS);
    const grown = resizeNote(notes, kick.id, 5, BAR, SWUNG_PLAN);
    const resized = grown.find((note) => note.id === kick.id);
    assert.ok(resized);
    assert.equal(resized.steps, 5);
    assert.equal(resized.gate, Number((5 * (60 / SWUNG_PLAN.bpm / 4)).toFixed(6)));
    const tail = addNote(notes, { role: "drums", lane: "kick", bar: 0, step: 15 }, BAR, SWUNG_PLAN);
    const clamped = resizeNote(
      tail,
      tail.find((note) => note.step === 15 && note.lane === "kick")?.id ?? "",
      100,
      BAR,
      SWUNG_PLAN,
    );
    assert.equal(clamped.find((note) => note.lane === "kick" && note.step === 15)?.steps, 1);
  });

  it("refuses a resize into a same-lane span", () => {
    const seeded = addNote(notes, { role: "drums", lane: "kick", bar: 0, step: 4 }, BAR, SWUNG_PLAN);
    assert.throws(
      () => resizeNote(seeded, kick.id, 5, BAR, SWUNG_PLAN),
      (error: unknown) => error instanceof PianoRollError && error.code === "overlap",
    );
  });
});

describe("pianoroll — quantizeNote", () => {
  const notes = scheduleToNotes(scheduleTake(SWUNG_PLAN), SWUNG_PLAN);
  const swungHat = notes.find((note) => note.role === "drums" && note.lane === "hat" && note.step === 2);
  assert.ok(swungHat);

  it("straightens the onset at strength 1 and keeps it at strength 0", () => {
    const straight = quantizeNote(notes, swungHat.id, 1);
    assert.equal(straight.find((note) => note.id === swungHat.id)?.swing, 0);
    const kept = quantizeNote(notes, swungHat.id, 0);
    assert.ok(Math.abs((kept.find((note) => note.id === swungHat.id)?.swing ?? 1) - swungHat.swing) < 1e-9);
  });

  it("travels halfway at strength 0.5 and refuses strengths off the range", () => {
    const half = quantizeNote(notes, swungHat.id, 0.5);
    const halfSwing = half.find((note) => note.id === swungHat.id)?.swing ?? 1;
    assert.ok(Math.abs(halfSwing - swungHat.swing * 0.5) < 1e-9);
    assert.throws(
      () => quantizeNote(notes, swungHat.id, 1.5),
      (error: unknown) => error instanceof PianoRollError && error.code === "bad-note",
    );
  });
});

describe("pianoroll — validateNotes", () => {
  it("answers no problems for the imported roll", () => {
    for (const plan of [SWUNG_PLAN, STRAIGHT_PLAN]) {
      const notes = scheduleToNotes(scheduleTake(plan), plan);
      assert.deepEqual(validateNotes(notes, plan), []);
    }
  });

  it("answers the overlap, the duplicate id and the bounds it finds", () => {
    const overlapping = [keysNote(0, 60), keysNote(2, 60, "2-60")];
    assert.ok(validateNotes(overlapping, SWUNG_PLAN).some((problem) => problem.includes("overlap")));
    const doubled = [keysNote(0, 60), { ...keysNote(0, 60), velocity: 0.5 }];
    assert.ok(validateNotes(doubled, SWUNG_PLAN).some((problem) => problem.includes("twice")));
    const offWindow = [keysNote(0, PIANOROLL_CONSTANTS.NOTE_MAX + 12, "0-120")];
    assert.ok(validateNotes(offWindow, SWUNG_PLAN).some((problem) => problem.includes("C2..C6")));
    const offTake = [{ ...keysNote(0, 60), bar: SWUNG_PLAN.bars + 1, id: "keys-17-0-60" }];
    assert.ok(validateNotes(offTake, SWUNG_PLAN).some((problem) => problem.includes("outside the take")));
  });
});
