// # pianoroll — the note editor of the katexis engine (root layer): the
// schedule the transport plays turns into editable notes and back. A note is
// a grid object — role, lane, pitch, bar, step, length in steps, velocity —
// with a stable deterministic id and the swing baked into its own position,
// so notesToSchedule rebuilds the take's clock bit-for-bit and every edit
// (add, remove, move, resize, quantize) stays honest against the plan's own
// grammar: the overlap policy answers the role (the plan never doubles a
// lane slot, a chord pitch or a bass onset). Zero DOM, zero audio, zero
// storage — pure and multi-mode, browser and node alike.

import { type ArrangerRole, RACK_LANES, stepSecondsOf, type TakePlan } from "./arranger.ts";
import type { NoteEvent, TakeSchedule } from "./takeevents.ts";

/** The constants the roll edits under (the window, the grid, the velocities). */
export const PIANOROLL_CONSTANTS = {
  /** The lowest editable pitch (C2). */
  NOTE_MIN: 36,
  /** The highest editable pitch (C6). */
  NOTE_MAX: 84,
  /** The steps one bar carries (the 16th grid). */
  STEPS_PER_BAR: 16,
  /** The velocity detents the roll writes (the rack's glyph law). */
  VELOCITY_STEPS: { ghost: 0.35, soft: 0.6, hard: 0.85, full: 1.0 },
  /** The shortest note an edit may leave, in steps. */
  MIN_NOTE_STEPS: 1,
} as const;

/** The machine readable failure codes of the roll. */
export type PianoRollErrorCode = "bad-note" | "out-of-window" | "overlap" | "bad-grid";

/** The typed roll failure, traceable to the note and the code. */
export class PianoRollError extends Error {
  /** Machine readable failure code. */
  readonly code: PianoRollErrorCode;
  /** The note the failure belongs to (when known). */
  readonly noteid: string | null;

  constructor(code: PianoRollErrorCode, noteid: string | null, message?: string) {
    super(message ?? `pianoroll ${code}${noteid === null ? "" : ` for ${noteid}`}`);
    this.name = "PianoRollError";
    this.code = code;
    this.noteid = noteid;
  }
}

/** One editable note of the roll (the grid object the piano roll draws). */
export interface EditableNote {
  /** The stable id, fixed at creation (`role-bar-step-midi`), never moved. */
  id: string;
  /** The role bus the note rides (the mixer strip). */
  role: ArrangerRole;
  /** The instrument lane ("kick" for drums; the role name otherwise). */
  lane: string;
  /** The pitch the roll row answers (the lane slot for drums; the bass rides +24 into the C2 window). */
  midi: number;
  /** The bar the note starts in (0-based). */
  bar: number;
  /** The step inside the bar (0..15, the 16th grid). */
  step: number;
  /** The length in steps (>= 1). */
  steps: number;
  /** The velocity, 0..1. */
  velocity: number;
  /** The swing baked into the onset, in step units (the plan's column offset). */
  swing: number;
  /** The gate seconds the schedule carries (verbatim on import; resize recomputes). */
  gate: number;
}

/** The clip window an edit may not leave (bars are 0-based, count inclusive). */
export interface RollWindow {
  /** The first bar the window opens on. */
  fromBar: number;
  /** How many bars the window spans. */
  bars: number;
}

/** The overlap policy per role, read off the plan's own grammar: a drum lane
 * never doubles inside its span, a chord pitch never doubles inside its span,
 * and the bass/lead retrigger grammar blocks only a doubled onset slot. */
const OVERLAP_POLICY: Record<ArrangerRole, "lane-span" | "pitch-span" | "pitch-slot"> = {
  drums: "lane-span",
  bass: "pitch-slot",
  keys: "pitch-span",
  lead: "pitch-span",
};

/** The float tolerance of the span and clock comparisons. */
const EPSILON = 1e-6;

/** The event cap the scheduler enforces (mirrored here so a rebuild never
 * answers more events than scheduleTake would). */
const EVENT_CAP = 4096;

/** The pitch key an overlap comparison answers for two notes of one role. */
function overlapKey(note: EditableNote): string {
  const policy = OVERLAP_POLICY[note.role];
  if (policy === "lane-span") return note.lane;
  return String(note.midi);
}

/** Whether two notes of the same role conflict under the role's policy. */
function conflicts(left: EditableNote, right: EditableNote): boolean {
  if (left.role !== right.role || left.id === right.id) return false;
  if (OVERLAP_POLICY[left.role] === "pitch-slot") {
    return overlapKey(left) === overlapKey(right) && left.bar === right.bar && left.step === right.step;
  }
  const from = left.bar * PIANOROLL_CONSTANTS.STEPS_PER_BAR + left.step;
  const to = from + left.steps;
  const otherFrom = right.bar * PIANOROLL_CONSTANTS.STEPS_PER_BAR + right.step;
  const otherTo = otherFrom + right.steps;
  return overlapKey(left) === overlapKey(right) && from < otherTo - EPSILON && otherFrom < to - EPSILON;
}

/** The absolute step a note starts on. */
function absoluteStep(note: EditableNote): number {
  return note.bar * PIANOROLL_CONSTANTS.STEPS_PER_BAR + note.step;
}

/** Validates one note shape and its bounds against the plan's take. */
function assertNote(note: EditableNote, plan: TakePlan): void {
  const c = PIANOROLL_CONSTANTS;
  const totalSteps = plan.bars * c.STEPS_PER_BAR;
  const bad = (message: string): PianoRollError => new PianoRollError("bad-note", note?.id ?? null, message);
  if (!note || typeof note.id !== "string" || note.id.length === 0) throw bad("the roll needs a note with an id");
  if (!Number.isFinite(note.bar) || note.bar < 0 || note.bar >= plan.bars || !Number.isInteger(note.bar))
    throw new PianoRollError("out-of-window", note.id, `note ${note.id} bar ${note.bar} sits outside the take`);
  if (!Number.isFinite(note.step) || note.step < 0 || note.step >= c.STEPS_PER_BAR || !Number.isInteger(note.step))
    throw new PianoRollError("out-of-window", note.id, `note ${note.id} step ${note.step} leaves the 16th grid`);
  if (!Number.isFinite(note.steps) || note.steps < c.MIN_NOTE_STEPS)
    throw bad(`note ${note.id} needs ${c.MIN_NOTE_STEPS} steps or more, got ${note.steps}`);
  if (absoluteStep(note) + note.steps > totalSteps + EPSILON)
    throw new PianoRollError("out-of-window", note.id, `note ${note.id} runs past the take`);
  if (!(note.velocity >= 0 && note.velocity <= 1)) throw bad(`note ${note.id} velocity ${note.velocity} out of range`);
  if (note.role === "drums") {
    if (!RACK_LANES.includes(note.lane as (typeof RACK_LANES)[number]))
      throw bad(`note ${note.id} lane ${note.lane} is not a rack lane`);
    return;
  }
  if (!Number.isInteger(note.midi) || note.midi < c.NOTE_MIN || note.midi > c.NOTE_MAX)
    throw bad(`note ${note.id} midi ${note.midi} leaves the C2..C6 window`);
}

/** Clamps a value into a range. */
function clamp(value: number, low: number, high: number): number {
  return Math.min(high, Math.max(low, value));
}

/** The swing the plan's step column carries for a role (drums and bass ride
 * the swung offsets, the melodic voices sit straight). */
function planSwing(plan: TakePlan, role: ArrangerRole, step: number): number {
  if (role !== "drums" && role !== "bass") return 0;
  return (
    plan.offsets[
      ((step % PIANOROLL_CONSTANTS.STEPS_PER_BAR) + PIANOROLL_CONSTANTS.STEPS_PER_BAR) %
        PIANOROLL_CONSTANTS.STEPS_PER_BAR
    ] ?? 0
  );
}

/** The roll pitch of an event: drums answer the lane's slot, the bass rides
 * two octaves up into the C2 window, keys and lead carry their midi verbatim. */
function rollMidiOf(event: NoteEvent): number {
  if (event.role === "drums") return Math.max(0, RACK_LANES.indexOf(event.lane as (typeof RACK_LANES)[number]));
  if (event.role === "bass") return event.midi + 24;
  return event.midi;
}

/** The schedule midi of a note (the inverse of rollMidiOf). */
function scheduleMidiOf(note: EditableNote): number {
  if (note.role === "drums") return 0;
  if (note.role === "bass") return note.midi - 24;
  return note.midi;
}

/**
 * Turns a schedule into the editable note list (one note per event, ids
 * stable, positions on the plan's grid, the swing recovered exactly).
 *
 * @param schedule the scheduled take.
 * @param plan the plan the schedule came from (the grid clock).
 * @returns the editable notes, in the schedule's own order.
 */
export function scheduleToNotes(schedule: TakeSchedule, plan: TakePlan): EditableNote[] {
  const stepSec = stepSecondsOf(plan);
  const notes: EditableNote[] = [];
  for (const event of schedule.events) {
    // the boundary law: keys land exactly on bar starts, so the floor rides a
    // hair of tolerance and never drops a bar-start event one bar early
    const bar = clamp(Math.floor(event.time / plan.barSeconds + 1e-6), 0, plan.bars - 1);
    const barStart = bar * plan.barSeconds;
    const raw = (event.time - barStart) / stepSec;
    // recover the exact column: the plan's own clock answers one candidate
    let step = -1;
    let swing = 0;
    for (let candidate = 0; candidate < PIANOROLL_CONSTANTS.STEPS_PER_BAR; candidate++) {
      const candidateSwing = planSwing(plan, event.role, candidate);
      const candidateTime = barStart + (candidate + candidateSwing) * stepSec;
      if (Math.abs(event.time - candidateTime) <= 1e-6) {
        step = candidate;
        swing = candidateSwing;
        break;
      }
    }
    if (step < 0) {
      // a schedule off the plan's clock snaps to the nearest column
      step = clamp(Math.round(raw), 0, PIANOROLL_CONSTANTS.STEPS_PER_BAR - 1);
      swing = planSwing(plan, event.role, step);
    }
    const midi = rollMidiOf(event);
    notes.push({
      id: `${event.role}-${bar}-${step}-${midi}`,
      role: event.role,
      lane: event.role === "drums" ? event.lane : event.role,
      midi,
      bar,
      step,
      steps: Math.max(PIANOROLL_CONSTANTS.MIN_NOTE_STEPS, Math.round(event.seconds / stepSec)),
      velocity: event.velocity,
      swing,
      gate: event.seconds,
    });
  }
  return notes;
}

/**
 * Rebuilds the schedule from the notes: the clock the transport plays, time
 * ascending, the per-role counts consistent, the duration the plan's own.
 *
 * @param notes the editable notes.
 * @param plan the plan the schedule answers to (grid clock + duration).
 * @returns the schedule (the same contract scheduleTake answers).
 */
export function notesToSchedule(notes: readonly EditableNote[], plan: TakePlan): TakeSchedule {
  const stepSec = stepSecondsOf(plan);
  const events: NoteEvent[] = [];
  const perRole: Record<ArrangerRole, number> = { drums: 0, bass: 0, keys: 0, lead: 0 };
  for (const note of notes) {
    assertNote(note, plan);
    if (events.length >= EVENT_CAP) break;
    const time = note.bar * plan.barSeconds + (note.step + note.swing) * stepSec;
    events.push({
      lane: note.role === "drums" ? note.lane : note.role,
      role: note.role,
      time,
      seconds: note.gate,
      velocity: note.velocity,
      midi: scheduleMidiOf(note),
    });
    perRole[note.role] += 1;
  }
  events.sort((left, right) => left.time - right.time);
  return { events, perRole, duration: plan.durationSeconds };
}

/**
 * Adds one note: the step snaps to the grid, the note clamps into the
 * window, the overlap policy answers the role.
 *
 * @param notes the roll's notes.
 * @param input the note to add (role required; lane for drums, midi for the melodic roles).
 * @param window the clip window the note may not leave.
 * @param plan the plan (grid clock, swing offsets, take bounds).
 * @returns the notes with the note added.
 */
export function addNote(
  notes: readonly EditableNote[],
  input: {
    role: ArrangerRole;
    lane?: string;
    midi?: number;
    bar: number;
    step: number;
    steps?: number;
    velocity?: number;
  },
  window: RollWindow,
  plan: TakePlan,
): EditableNote[] {
  const c = PIANOROLL_CONSTANTS;
  if (!Number.isFinite(window.fromBar) || !Number.isFinite(window.bars) || window.bars < 1 || window.fromBar < 0)
    throw new PianoRollError("bad-grid", null, `roll window ${window.fromBar}+${window.bars} is unsound`);
  if (window.fromBar + window.bars > plan.bars)
    throw new PianoRollError("out-of-window", null, `roll window ${window.fromBar}+${window.bars} leaves the take`);
  if (input.role === "drums" && !(input.lane && RACK_LANES.includes(input.lane as (typeof RACK_LANES)[number])))
    throw new PianoRollError("bad-note", null, `roll add needs a rack lane, got ${input.lane}`);
  if (input.role !== "drums" && !(input.midi !== undefined && Number.isInteger(input.midi)))
    throw new PianoRollError("bad-note", null, "roll add needs an integer midi for the melodic roles");
  const midi =
    input.role === "drums" ? RACK_LANES.indexOf(input.lane as (typeof RACK_LANES)[number]) : (input.midi as number);
  if (input.role !== "drums" && (midi < c.NOTE_MIN || midi > c.NOTE_MAX))
    throw new PianoRollError("bad-note", null, `roll add midi ${midi} leaves the C2..C6 window`);
  const windowStart = window.fromBar * c.STEPS_PER_BAR;
  const windowEnd = windowStart + window.bars * c.STEPS_PER_BAR;
  const steps = clamp(Math.round(input.steps ?? 1), c.MIN_NOTE_STEPS, window.bars * c.STEPS_PER_BAR);
  const requested = input.bar * c.STEPS_PER_BAR + Math.round(input.step);
  const abs = clamp(requested, windowStart, Math.max(windowStart, windowEnd - steps));
  const bar = Math.floor(abs / c.STEPS_PER_BAR);
  const step = abs % c.STEPS_PER_BAR;
  const stepSec = stepSecondsOf(plan);
  const note: EditableNote = {
    id: `${input.role}-${bar}-${step}-${midi}`,
    role: input.role,
    lane: input.role === "drums" ? (input.lane as string) : input.role,
    midi,
    bar,
    step,
    steps,
    velocity: clamp(input.velocity ?? c.VELOCITY_STEPS.hard, 0, 1),
    swing: planSwing(plan, input.role, step),
    gate: Number((steps * stepSec).toFixed(6)),
  };
  assertNote(note, plan);
  // the overlap answers first: a same-shape note (the same id, by
  // construction) IS the role's own conflict, so the slot law names it
  const conflicting = notes.find((other) => other.id === note.id || conflicts(note, other));
  if (conflicting)
    throw new PianoRollError(
      "overlap",
      note.id,
      conflicting.id === note.id
        ? `the roll already carries ${note.id}`
        : `roll note ${note.id} overlaps ${conflicting.id} on ${note.role}`,
    );
  return [...notes, note];
}

/**
 * Removes one note by id.
 *
 * @param notes the roll's notes.
 * @param id the note id.
 * @returns the notes without the note.
 */
export function removeNote(notes: readonly EditableNote[], id: string): EditableNote[] {
  if (!notes.some((note) => note.id === id)) throw new PianoRollError("bad-note", id, `the roll carries no ${id}`);
  return notes.filter((note) => note.id !== id);
}

/**
 * Moves one note by a signed step delta: the move lands on the straight grid
 * (the edit re-quantizes the onset), clamps into the window and honors the
 * role's overlap policy. The id stays fixed.
 *
 * @param notes the roll's notes.
 * @param id the note id.
 * @param deltaSteps the signed delta in steps.
 * @param window the clip window the note may not leave.
 * @param plan the plan (grid clock, swing offsets).
 * @returns the notes with the note moved.
 */
export function moveNote(
  notes: readonly EditableNote[],
  id: string,
  deltaSteps: number,
  window: RollWindow,
  plan: TakePlan,
): EditableNote[] {
  const c = PIANOROLL_CONSTANTS;
  if (!Number.isFinite(deltaSteps))
    throw new PianoRollError("bad-note", id, `roll move needs a finite delta, got ${deltaSteps}`);
  const note = notes.find((entry) => entry.id === id);
  if (!note) throw new PianoRollError("bad-note", id, `the roll carries no ${id}`);
  const windowStart = window.fromBar * c.STEPS_PER_BAR;
  const windowEnd = windowStart + window.bars * c.STEPS_PER_BAR;
  const abs = clamp(
    Math.round(absoluteStep(note)) + Math.round(deltaSteps),
    windowStart,
    Math.max(windowStart, windowEnd - note.steps),
  );
  const bar = Math.floor(abs / c.STEPS_PER_BAR);
  const step = abs % c.STEPS_PER_BAR;
  const moved: EditableNote = { ...note, bar, step, swing: planSwing(plan, note.role, step) };
  const conflicting = notes.find((other) => conflicts(moved, other));
  if (conflicting)
    throw new PianoRollError("overlap", moved.id, `roll note ${moved.id} overlaps ${conflicting.id} on ${moved.role}`);
  return notes.map((entry) => (entry.id === id ? moved : entry));
}

/**
 * Resizes one note in steps: never below the minimum, clamped into the
 * window; the gate follows the new length on the plan's clock.
 *
 * @param notes the roll's notes.
 * @param id the note id.
 * @param steps the new length in steps.
 * @param window the clip window the note may not leave.
 * @param plan the plan (grid clock).
 * @returns the notes with the note resized.
 */
export function resizeNote(
  notes: readonly EditableNote[],
  id: string,
  steps: number,
  window: RollWindow,
  plan: TakePlan,
): EditableNote[] {
  const c = PIANOROLL_CONSTANTS;
  if (!Number.isFinite(steps))
    throw new PianoRollError("bad-note", id, `roll resize needs a finite length, got ${steps}`);
  const note = notes.find((entry) => entry.id === id);
  if (!note) throw new PianoRollError("bad-note", id, `the roll carries no ${id}`);
  const windowEnd = (window.fromBar + window.bars) * c.STEPS_PER_BAR;
  const length = clamp(Math.round(steps), c.MIN_NOTE_STEPS, Math.max(c.MIN_NOTE_STEPS, windowEnd - absoluteStep(note)));
  const resized: EditableNote = {
    ...note,
    steps: length,
    gate: Number((length * stepSecondsOf(plan)).toFixed(6)),
  };
  const conflicting = notes.find((other) => conflicts(resized, other));
  if (conflicting)
    throw new PianoRollError(
      "overlap",
      resized.id,
      `roll note ${resized.id} overlaps ${conflicting.id} on ${resized.role}`,
    );
  return notes.map((entry) => (entry.id === id ? resized : entry));
}

/**
 * Quantizes one note's onset toward the straight 16th grid: strength 1
 * removes the swing entirely, strength 0 keeps it, the middle travels.
 *
 * @param notes the roll's notes.
 * @param id the note id.
 * @param strength the quantize strength, 0..1.
 * @returns the notes with the onset quantized.
 */
export function quantizeNote(notes: readonly EditableNote[], id: string, strength: number): EditableNote[] {
  if (!(strength >= 0 && strength <= 1))
    throw new PianoRollError("bad-note", id, `roll quantize needs a strength in 0..1, got ${strength}`);
  const note = notes.find((entry) => entry.id === id);
  if (!note) throw new PianoRollError("bad-note", id, `the roll carries no ${id}`);
  const swing = Number((note.swing * (1 - strength)).toFixed(9));
  return notes.map((entry) => (entry.id === id ? { ...entry, swing } : entry));
}

/**
 * Validates the roll against the plan: bounds, the role overlap policies and
 * the id uniqueness (an empty list is a sound roll).
 *
 * @param notes the roll's notes.
 * @param plan the plan the roll edits against.
 * @returns the problems found.
 */
export function validateNotes(notes: readonly EditableNote[], plan: TakePlan): string[] {
  const problems: string[] = [];
  const seen = new Set<string>();
  for (const note of notes) {
    try {
      assertNote(note, plan);
    } catch (error) {
      problems.push(error instanceof Error ? error.message : `note ${note.id} is unsound`);
    }
    if (seen.has(note.id)) problems.push(`the roll carries ${note.id} twice`);
    seen.add(note.id);
  }
  for (let left = 0; left < notes.length; left++) {
    for (let right = left + 1; right < notes.length; right++) {
      if (conflicts(notes[left], notes[right]))
        problems.push(`roll notes ${notes[left].id} and ${notes[right].id} overlap on ${notes[left].role}`);
    }
  }
  return problems;
}
