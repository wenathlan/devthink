// # stems — the stem planner of the katexis engine (root layer): the take
// schedule partitions by arrangement role into the per-stem bounces the
// export seam writes, one wav per role, plus the manifest that names them
// and the validation that proves nothing was lost on the way. The
// conservation invariant is the whole point: the sum of the stem events
// must equal the schedule total, or the bounce lied. The wav bytes
// themselves come from wavwriter when the UI bounces. Pure and multi-mode —
// zero DOM, zero storage, zero audio.

import type { ArrangerRole, TakePlan } from "./arranger.ts";
import { MASTERING } from "./katexis.ts";
import type { NoteEvent, TakeSchedule } from "./takeevents.ts";

/** The machine readable failure codes of the stem planner. */
export type StemsErrorCode = "empty-schedule" | "unknown-role" | "bad-order" | "conservation" | "bad-manifest";

/** The typed stems failure, traceable to a machine code. */
export class StemsError extends Error {
  /** Machine readable failure code. */
  readonly code: StemsErrorCode;

  constructor(code: StemsErrorCode, message?: string) {
    super(message ?? `stems ${code}`);
    this.name = "StemsError";
    this.code = code;
  }
}

/** The manifest schema the export surface declares (v1 — the only one this planner writes). */
export const STEMS_SCHEMA_VERSION = "debonair.stems/1";

/** The bounce policy one role carries. */
export interface StemRolePolicy {
  /** The arrangement role the stem carries. */
  role: ArrangerRole;
  /** The channels the bounce renders: drum and bass buses fold to mono for punch, the pad stays stereo. */
  channelkind: "mono" | "stereo";
}

/** The role table — the partition order, the bounce policy, the one place a stem role is named. */
export const STEM_ROLES: readonly StemRolePolicy[] = [
  { role: "drums", channelkind: "mono" },
  { role: "bass", channelkind: "mono" },
  { role: "keys", channelkind: "stereo" },
  { role: "lead", channelkind: "mono" },
];

/**
 * Names the file one stem bounces to (the manifest and the download seam agree on it).
 *
 * @param takeId the stable id of the take.
 * @param role the arrangement role.
 * @returns the file name ("<takeId>-<role>.wav").
 */
export function stemFile(takeId: string, role: ArrangerRole): string {
  return `${takeId}-${role}.wav`;
}

/** One planned stem: the events of one role plus the facts the bounce needs. */
export interface StemPlan {
  /** The arrangement role the stem carries. */
  role: ArrangerRole;
  /** The file the bounce writes (the take id, the role, the wav extension). */
  file: string;
  /** The channels the bounce renders. */
  channelkind: "mono" | "stereo";
  /** The desk fader the take opens the role's strip with (the bounce rides it). */
  gainDb: number;
  /** The events of the role, time-ascending (the partition keeps the schedule's order). */
  events: readonly NoteEvent[];
  /** The seconds the stem spans: the last gate end (0 for an empty role). */
  seconds: number;
}

/** One stem row of the manifest (the counts, not the events). */
export interface StemsManifestStem {
  /** The arrangement role. */
  role: ArrangerRole;
  /** The file the bounce writes. */
  file: string;
  /** The event count the stem carries. */
  events: number;
  /** The seconds the stem spans. */
  seconds: number;
}

/** The manifest the export seam writes beside the wavs (schema v1). */
export interface StemsManifest {
  /** The schema marker ("debonair.stems/1"). */
  schemaVersion: "debonair.stems/1";
  /** The stable id of the take. */
  takeId: string;
  /** The bounce sample rate (the mastering spec's 48000). */
  sampleRate: number;
  /** The genre loudness target the take renders under (LUFS). */
  lufsTarget: number;
  /** One row per stem, in the canonical role order. */
  stems: readonly StemsManifestStem[];
  /** The ISO instant the manifest was written (wall clock, like the take shelf's savedAt). */
  generatedAt: string;
}

/** One validateStems verdict: the machine code plus a human line. */
export interface StemsProblem {
  /** The machine readable failure code. */
  code: StemsErrorCode;
  /** The human readable line. */
  message: string;
}

/**
 * Partitions the schedule into one stem per role, in the canonical role
 * order, deterministically: same schedule, same partition. The gain rides
 * the desk fader the plan opened the role's strip with.
 *
 * @param schedule the scheduled take (time-ascending events).
 * @param plan the plan the take answers to (the naming and the faders ride it).
 * @returns one stem per role of STEM_ROLES, in that order.
 */
export function planStems(schedule: TakeSchedule, plan: TakePlan): StemPlan[] {
  if (schedule.events.length === 0) {
    throw new StemsError("empty-schedule", `take ${plan.id} schedules no events; there is nothing to bounce`);
  }
  for (const event of schedule.events) {
    if (!STEM_ROLES.some((policy) => policy.role === event.role)) {
      throw new StemsError("unknown-role", `event ${event.lane}@${event.time} rides the unknown role ${event.role}`);
    }
  }
  return STEM_ROLES.map((policy) => {
    const events = schedule.events.filter((event) => event.role === policy.role);
    const strip = plan.strips.find((row) => row.name === policy.role);
    const latest = events.reduce((end, event) => Math.max(end, event.time + event.seconds), 0);
    return {
      role: policy.role,
      file: stemFile(plan.id, policy.role),
      channelkind: policy.channelkind,
      gainDb: strip?.faderDb ?? 0,
      events,
      seconds: Number(latest.toFixed(6)),
    };
  });
}

/**
 * Builds the manifest schema v1 for a planned partition: the take identity,
 * the mastering rate, the genre loudness target and one counted row per stem.
 *
 * @param take the plan plus the partition planStems answered.
 * @returns the manifest (generatedAt rides the wall clock, like the take shelf).
 */
export function stemsManifest(take: { plan: TakePlan; stems: readonly StemPlan[] }): StemsManifest {
  return {
    schemaVersion: STEMS_SCHEMA_VERSION,
    takeId: take.plan.id,
    sampleRate: MASTERING.sampleRateHz,
    lufsTarget: take.plan.lufsTarget,
    stems: take.stems.map((stem) => ({
      role: stem.role,
      file: stem.file,
      events: stem.events.length,
      seconds: stem.seconds,
    })),
    generatedAt: new Date().toISOString(),
  };
}

/**
 * Validates a manifest against the schedule it claims to describe: the
 * schema shape, the naming, the canonical order, the span of every stem and
 * the conservation invariant — the sum of the stem events equals the
 * schedule total, per role and overall.
 *
 * @param schedule the scheduled take.
 * @param plan the plan the take answers to.
 * @param manifest the manifest to check.
 * @returns the problems found (an empty list is a sound manifest).
 */
export function validateStems(schedule: TakeSchedule, plan: TakePlan, manifest: StemsManifest): StemsProblem[] {
  const problems: StemsProblem[] = [];
  if (manifest.schemaVersion !== STEMS_SCHEMA_VERSION) {
    problems.push({ code: "bad-manifest", message: `schema ${manifest.schemaVersion} is not ${STEMS_SCHEMA_VERSION}` });
  }
  if (manifest.takeId !== plan.id)
    problems.push({
      code: "bad-manifest",
      message: `manifest answers take ${manifest.takeId}, plan carries ${plan.id}`,
    });
  if (manifest.sampleRate !== MASTERING.sampleRateHz) {
    problems.push({
      code: "bad-manifest",
      message: `sample rate ${manifest.sampleRate} is not the mastering ${MASTERING.sampleRateHz}`,
    });
  }
  if (!Number.isFinite(manifest.lufsTarget))
    problems.push({ code: "bad-manifest", message: `lufs target ${manifest.lufsTarget} is not finite` });
  if (Number.isNaN(Date.parse(manifest.generatedAt)))
    problems.push({ code: "bad-manifest", message: "generatedAt is not an ISO instant" });
  if (
    manifest.stems.length !== STEM_ROLES.length ||
    manifest.stems.some((stem, index) => stem.role !== STEM_ROLES[index].role)
  ) {
    problems.push({ code: "bad-order", message: "the manifest stems are not in the canonical role order" });
  }
  for (const stem of manifest.stems) {
    if (stem.file !== stemFile(manifest.takeId, stem.role)) {
      problems.push({ code: "bad-manifest", message: `stem ${stem.role} names ${stem.file}` });
    }
    if (!(stem.seconds >= 0 && stem.seconds <= schedule.duration + 1e-6)) {
      problems.push({ code: "bad-manifest", message: `stem ${stem.role} spans ${stem.seconds}s past the take` });
    }
  }
  const total = manifest.stems.reduce((sum, stem) => sum + stem.events, 0);
  if (total !== schedule.events.length) {
    problems.push({
      code: "conservation",
      message: `the stems carry ${total} events for ${schedule.events.length} scheduled`,
    });
  }
  for (const stem of manifest.stems) {
    if (stem.events !== schedule.perRole[stem.role]) {
      problems.push({
        code: "conservation",
        message: `stem ${stem.role} carries ${stem.events} for ${schedule.perRole[stem.role]} scheduled`,
      });
    }
  }
  return problems;
}
