// # versawasescheduler — the render-job scheduler of the versawase engine: it
// turns the RenderJob contract (versawase.ts) into a deterministic multi-slot
// plan and owns the pure status transitions of the queue. Library-grade: no
// worker pool, no I/O, no clock — the pages, the gateway and stealthhead bring
// their own executors and ride the same plan. Frame counts compose on the
// engine primitive (renderJobFrames) instead of re-deriving them.

import { type RenderJob, renderJobFrames } from "./versawase.ts";

/** One scheduled job: the slot it rides, the load it adds and its queue position. */
export interface ScheduleEntry {
  job: RenderJob;
  /** worker slot index (0-based) */
  slot: number;
  /** frame count the job produces (fps-normalized for 3d ranges) */
  frames: number;
  /** 1-based position inside its slot */
  order: number;
  /** load the slot already carried when the job was placed (abstract units) */
  startLoad: number;
}

/** Total load a slot carries after planning (frame units summed per slot). */
export function slotLoads(entries: readonly ScheduleEntry[], slots: number): number[] {
  const loads = Array.from({ length: Math.max(0, slots) }, () => 0);
  for (const entry of entries) {
    if (entry.slot >= 0 && entry.slot < loads.length) loads[entry.slot] += entry.frames;
  }
  return loads;
}

/**
 * Plans queued jobs onto slots deterministically: input order is preserved,
 * every job lands on the least-loaded slot (ties ride the lowest index) and
 * the frame count comes from renderJobFrames. Non-queued jobs are skipped —
 * the plan never re-runs work that already left the queue.
 */
export function planSchedule(jobs: readonly RenderJob[], fps: number, slots: number): ScheduleEntry[] {
  const safeSlots = Math.max(1, Math.floor(slots));
  const loads = Array.from({ length: safeSlots }, () => 0);
  const perSlot = Array.from({ length: safeSlots }, () => 0);
  const entries: ScheduleEntry[] = [];
  for (const job of jobs) {
    if (job.status !== "queued") continue;
    const frames = renderJobFrames(job, fps);
    let slot = 0;
    for (let at = 1; at < safeSlots; at += 1) {
      if (loads[at] < loads[slot]) slot = at;
    }
    perSlot[slot] += 1;
    entries.push({ job, slot, frames, order: perSlot[slot], startLoad: loads[slot] });
    loads[slot] += frames;
  }
  return entries;
}

/** Moves a queued job to rendering; answers null when the transition is illegal. */
export function startJob(job: RenderJob): RenderJob | null {
  return transition(job, "queued", "rendering");
}

/** Moves a rendering job to ready; answers null when the transition is illegal. */
export function completeJob(job: RenderJob): RenderJob | null {
  return transition(job, "rendering", "ready");
}

/** Moves a queued or rendering job to failed; answers null when the transition is illegal. */
export function failJob(job: RenderJob): RenderJob | null {
  if (job.status !== "queued" && job.status !== "rendering") return null;
  return { ...job, status: "failed", tone: "error" };
}

/** Counts the jobs per status in one pass (queue health readout). */
export function queueCensus(jobs: readonly RenderJob[]): Record<RenderJob["status"], number> {
  const census: Record<RenderJob["status"], number> = { queued: 0, rendering: 0, ready: 0, failed: 0 };
  for (const job of jobs) census[job.status] += 1;
  return census;
}

/** Shared guard of the pure status machine. */
function transition(job: RenderJob, from: RenderJob["status"], to: RenderJob["status"]): RenderJob | null {
  if (job.status !== from) return null;
  const next: RenderJob = { ...job, status: to };
  if (to === "ready") next.tone = "success";
  if (to === "rendering") next.tone = "info";
  return next;
}
