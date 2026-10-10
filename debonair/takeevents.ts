// # takeevents — the event scheduler of the katexis engine (root layer): one
// plan (arranger.ts) expands into the flat note event list the browser
// transport schedules against the WebAudio clock — drums from the 16-step
// grid with the swing offsets and the fill cascade, the bass locked to the
// kick, the pad holding the bar's chord, the lead motif walked over the
// scale with the engine's seeded rng. The same expansion drives the channel
// rack (step highlighting) and the honesty checks of the tests. Pure and
// multi-mode — browser and node alike; zero audio, zero consumer data.

import { type ArrangerRole, beatSecondsOf, stepSecondsOf, type TakePlan } from "./arranger.ts";
import { hashSeed, mulberry32 } from "./harmonyengine.ts";
import { chordNotes, scalePcs } from "./musictheory.ts";
import { LANES, type LaneName } from "./rhythmgrammar.ts";

/** One scheduled note of a take. */
export interface NoteEvent {
  /** The instrument lane ("kick", "bass", "keys", "lead"...). */
  lane: string;
  /** The role bus the event rides (the mixer strip). */
  role: ArrangerRole;
  /** The start time in seconds from the top of the take. */
  time: number;
  /** The note duration in seconds (the gate before release). */
  seconds: number;
  /** The velocity, 0..1 (section energy included). */
  velocity: number;
  /** The midi note number (drums answer 0). */
  midi: number;
}

/** The scheduled take: the flat event list plus the totals the surfaces read. */
export interface TakeSchedule {
  /** Every note event, time-ascending. */
  events: readonly NoteEvent[];
  /** The event count per role (the mixer strips' load). */
  perRole: Record<ArrangerRole, number>;
  /** The total duration the events cover (the plan's duration). */
  duration: number;
}

/** The documented fill cascade the last four steps of a fill bar play. */
const FILL_CASCADE: readonly number[] = [0.85, 0.6, 0.85, 1];

/** The event cap of one schedule (a runaway grid would freeze the transport). */
const EVENT_CAP = 4096;

/** The pitch classes of the plan's key (the lead motif's pool). */
function scalePcsList(plan: TakePlan): number[] {
  return scalePcs(plan.key);
}

/**
 * Expands a plan into the flat note event list (time-ascending).
 *
 * @param plan the arrangement plan.
 * @returns the schedule.
 */
export function scheduleTake(plan: TakePlan): TakeSchedule {
  const stepSec = stepSecondsOf(plan);
  const beatSec = beatSecondsOf(plan);
  const events: NoteEvent[] = [];
  const perRole: Record<ArrangerRole, number> = { drums: 0, bass: 0, keys: 0, lead: 0 };
  const push = (event: NoteEvent): void => {
    if (events.length >= EVENT_CAP) return;
    events.push(event);
    perRole[event.role] += 1;
  };

  const leadRng = mulberry32(hashSeed(`lead:${plan.seed}:${plan.prompt}`));
  const scalePcs = scalePcsList(plan);

  for (let bar = 0; bar < plan.bars; bar++) {
    const section = sectionAt(plan, bar);
    const barStart = bar * plan.barSeconds;
    const chord = plan.chords[bar];
    const fill = plan.fillBars[bar];

    if (section.voices.includes("drums")) {
      for (const lane of LANES) {
        const steps = plan.grid.lanes[lane as LaneName];
        for (let step = 0; step < 16; step++) {
          let velocity = steps[step];
          if (velocity <= 0) continue;
          if (fill && step >= 12) {
            // the documented fill: the snare cascade takes over, the hats halve
            if (lane === "snare") velocity = Math.max(velocity, FILL_CASCADE[step - 12]);
            if (lane === "hat" || lane === "openhat") velocity *= 0.5;
          }
          push({
            lane,
            role: "drums",
            time: barStart + (step + plan.offsets[step]) * stepSec,
            seconds: lane === "openhat" ? 0.28 : lane === "ride" ? 0.5 : 0.12,
            velocity: Math.min(1, velocity * section.energy),
            midi: 0,
          });
        }
      }
    }

    if (section.voices.includes("bass")) {
      const bassMidi = 24 + chord.chord.root;
      for (let step = 0; step < 16; step++) {
        const kick = plan.grid.lanes.kick[step];
        if (kick <= 0) continue;
        push({
          lane: "bass",
          role: "bass",
          time: barStart + (step + plan.offsets[step]) * stepSec,
          seconds: Number((0.9 * beatSec).toFixed(6)),
          velocity: Math.min(1, (0.55 + kick * 0.35) * section.energy),
          midi: bassMidi,
        });
      }
    }

    if (section.voices.includes("keys")) {
      for (const midi of chordNotes(chord.chord, 3)) {
        push({
          lane: "keys",
          role: "keys",
          time: barStart,
          seconds: Number((plan.barSeconds * 0.96).toFixed(6)),
          velocity: Math.min(1, (0.42 + chord.tension * 0.3) * section.energy),
          midi,
        });
      }
    }

    if (section.voices.includes("lead")) {
      for (let step = 0; step < 16; step += 2) {
        if (leadRng() < 0.5) continue;
        const pc = scalePcs[Math.floor(leadRng() * scalePcs.length)];
        const midi = 72 + pc;
        push({
          lane: "lead",
          role: "lead",
          time: barStart + step * stepSec,
          seconds: Number((stepSec * 1.6).toFixed(6)),
          velocity: 0.5 + leadRng() * 0.3,
          midi,
        });
      }
    }
  }

  events.sort((left, right) => left.time - right.time);
  return { events, perRole, duration: plan.durationSeconds };
}

/**
 * The section a bar sits in (the section plan is contiguous by construction).
 *
 * @param plan the arrangement plan.
 * @param bar the bar index.
 * @returns the owning section.
 */
export function sectionAt(plan: TakePlan, bar: number): TakePlan["sections"][number] {
  let cursor = 0;
  for (const section of plan.sections) {
    cursor += section.bars;
    if (bar < cursor) return section;
  }
  return plan.sections[plan.sections.length - 1];
}

/**
 * Slices the schedule to the events inside a window (the loop pass the
 * transport schedules).
 *
 * @param schedule the full schedule.
 * @param from the window start in seconds (inclusive).
 * @param to the window end in seconds (exclusive).
 * @returns the events inside [from, to).
 */
export function eventsInWindow(schedule: TakeSchedule, from: number, to: number): NoteEvent[] {
  return schedule.events.filter((event) => event.time >= from && event.time < to);
}

/**
 * The grid position of an instant: the bar and the 16-step column the
 * playhead sits on (the channel rack reads it while playing).
 *
 * @param plan the arrangement plan.
 * @param time the instant in seconds.
 * @returns the bar and step indices.
 */
export function positionAt(plan: TakePlan, time: number): { bar: number; step: number } {
  const stepSec = stepSecondsOf(plan);
  const absolute = Math.max(0, time / stepSec);
  const bar = Math.min(plan.bars - 1, Math.floor(absolute / 16));
  const step = Math.floor(absolute) % 16;
  return { bar, step };
}

/**
 * Validates a schedule; answers the problems (an empty list is a sound
 * schedule): every event inside the take, velocities in range, times finite
 * and ascending.
 *
 * @param schedule the schedule to check.
 * @returns the problems found.
 */
export function validateSchedule(schedule: TakeSchedule): string[] {
  const problems: string[] = [];
  let last = -1;
  for (const event of schedule.events) {
    if (!Number.isFinite(event.time) || event.time < 0 || event.time >= schedule.duration) {
      problems.push(`event ${event.lane}@${event.time} outside the take`);
    }
    if (!(event.velocity >= 0 && event.velocity <= 1))
      problems.push(`event ${event.lane}@${event.time} velocity out of range`);
    if (event.time < last - 1e-9) problems.push("events are not time-ascending");
    last = event.time;
  }
  if (schedule.events.length === 0) problems.push("the schedule carries no events");
  return problems;
}
