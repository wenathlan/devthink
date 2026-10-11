/**
 * logreplay.ts — the seeded log replay of the forge console (root layer).
 * The floor records no live logs: the replay derives every line from the
 * seeded fleet rehearsal (fleet.ts), so the console stays honest about what
 * it shows. The same seed and the same tick answer the same lines, byte for
 * byte — the tests pin that contract.
 */
import { fleetTick, healthRungOf, type Runner } from "./fleet.ts";

/** one replayed console line */
export interface Logline {
  /** the replay clock of the line (tick and beat, zero padded) */
  readonly clock: string;
  /** the level of the line (the health rung of the answering runner) */
  readonly level: "info" | "warn" | "error";
  /** the text of the line (what the runner answered at the beat) */
  readonly text: string;
}

/** the mulberry32 generator of fleet.ts, re-seeded per tick for stability */
function beatof(seed: number, tick: number, slot: number): number {
  let state = (seed ^ (tick * 7919) ^ (slot * 104729)) >>> 0;
  state = (state + 0x6d2b79f5) | 0;
  let t = state;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

/** the readable clock of one beat (tick 3, beat 2 → t003.02) */
function clockof(tick: number, beat: number): string {
  return `t${String(tick).padStart(3, "0")}.${String(beat).padStart(2, "0")}`;
}

/** the level of the line: the health rung of the runner at the beat */
function levelof(rung: 0 | 1 | 2): "info" | "warn" | "error" {
  if (rung === 2) return "error";
  if (rung === 1) return "warn";
  return "info";
}

/** the text of the line: what the runner answered at the beat */
function textof(runner: Runner, roll: number): string {
  const verb = roll < 0.5 ? "answered" : roll < 0.8 ? "drained one job" : "reported";
  const failure = runner.failures > 0 ? ` · ${runner.failures} failures recorded` : "";
  return `${runner.name} ${verb} · ${runner.mode} · load ${Math.round(runner.load * 100)}% · run #${runner.runs}${failure}`;
}

/**
 * logreplay — replays the console of the floor up to the tick: one line per
 * runner per tick, ordered by the beat, keeping only the last `keep` lines.
 * The lines come from the fleet of the seed (never invented) and the level
 * carries the health rung, so warn and error mean what they say.
 */
export function logreplay(fleet: readonly Runner[], seed: number, tick: number, keep = 40): Logline[] {
  const lines: Logline[] = [];
  for (let step = 0; step <= tick; step += 1) {
    const floor = fleetTick(fleet, seed, step);
    floor.forEach((runner, slot) => {
      if (runner.state === "offline") return;
      const roll = beatof(seed, step, slot);
      lines.push({ clock: clockof(step, slot), level: levelof(healthRungOf(runner).rung), text: textof(runner, roll) });
    });
  }
  return lines.slice(-keep);
}

/** the count of lines per level over a replay (the console facts read it) */
export function replaycount(lines: readonly Logline[]): Record<"info" | "warn" | "error", number> {
  const counts = { info: 0, warn: 0, error: 0 };
  for (const line of lines) counts[line.level] += 1;
  return counts;
}

/** the seed chips of the console (fixed, shown, pinned by the tests) */
export const REPLAY_SEEDS: readonly number[] = [20260214, 20260215, 20260216];
