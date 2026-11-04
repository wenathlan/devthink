// # fleet — the runner fleet engine of the forge (root layer, pure logic).
// The runner floor of the family: named sandbox runners in a state, with a
// load and a failure record, answered on a three-rung health ladder
// (green → amber → red). Everything here is deterministic: the rehearsal
// fleet is generated from one integer seed (mulberry32), the health rules
// are pure thresholds and the tick advances the fleet without clocks —
// the same seed always produces the same fleet, in node and in the browser.
// This module is the testable core of the /runs page.

import { modes, type RunnerMode } from "./runner.ts";

/** the runner modes of the saddle engine, re-exported for the surface. */
export const RUNNER_MODES: readonly RunnerMode[] = modes;

/** the five states a runner can hold on the floor. */
export type RunnerState = "idle" | "starting" | "busy" | "draining" | "offline";

/** the state ladder, in floor order. */
export const RUNNER_STATES: readonly RunnerState[] = ["idle", "starting", "busy", "draining", "offline"];

/** the three rungs of the health ladder (the spec: status is a signal, the
 * ladder tells how far from healthy). */
export type RunnerHealth = "green" | "amber" | "red";

/** the health ladder in rung order (index = rung). */
export const HEALTH_LADDER: readonly RunnerHealth[] = ["green", "amber", "red"];

/** one sandbox runner of the fleet. */
export interface Runner {
  /** the floor id (stable, derived from the seed) */
  id: string;
  /** the display name of the runner */
  name: string;
  /** the saddle runner mode the runner answers */
  mode: RunnerMode;
  /** the floor state */
  state: RunnerState;
  /** busy load, 0..1 (1 = saturated) */
  load: number;
  /** completed runs recorded by the runner */
  runs: number;
  /** failed runs recorded by the runner */
  failures: number;
}

/** one rung answer: the rung index, the health label and the honest why. */
export interface HealthRung {
  rung: 0 | 1 | 2;
  label: RunnerHealth;
  why: string;
}

/** the failure share that paints a runner red (one in five is a floor down). */
export const RED_FAILURE_RATE = 0.2;

/** the load share that paints a runner amber (near saturation). */
export const AMBER_LOAD = 0.85;

/** the failure share that paints a runner amber (watching). */
export const AMBER_FAILURE_RATE = 0.05;

/** mulberry32 — the small deterministic prng of the family engines. */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** short mode tag for the runner names (full-virtual → "virt"). */
function modeTag(mode: RunnerMode): string {
  if (mode === "full-virtual") return "virt";
  if (mode === "node-packages") return "node";
  return mode;
}

/** the failure rate of a runner (0 when nothing ran). */
export function failureRate(runner: Runner): number {
  if (runner.runs <= 0) return 0;
  return runner.failures / runner.runs;
}

/** the health answer of one runner: pure thresholds, never a guess. */
export function healthRungOf(runner: Runner): HealthRung {
  if (runner.state === "offline") {
    return { rung: 2, label: "red", why: "runner offline — not picking up runs" };
  }
  const rate = failureRate(runner);
  if (rate > RED_FAILURE_RATE) {
    return {
      rung: 2,
      label: "red",
      why: `failure rate ${(rate * 100).toFixed(0)}% over the ${RED_FAILURE_RATE * 100}% line`,
    };
  }
  if (runner.state === "draining" || runner.load > AMBER_LOAD || rate > AMBER_FAILURE_RATE) {
    const why =
      runner.state === "draining"
        ? "draining — finishing its runs, taking no new ones"
        : runner.load > AMBER_LOAD
          ? `load ${(runner.load * 100).toFixed(0)}% near saturation`
          : `failure rate ${(rate * 100).toFixed(0)}% is being watched`;
    return { rung: 1, label: "amber", why };
  }
  return { rung: 0, label: "green", why: runner.state === "busy" ? "running inside its budget" : "ready for work" };
}

/** the rehearsal fleet of the floor: deterministic from the seed — the same
 * seed always musters the same runners (the surface says the fleet is a
 * seeded rehearsal, never a live claim). */
export function seedFleet(seed: number, count = 6): Runner[] {
  const rand = mulberry32(seed);
  const runners: Runner[] = [];
  for (let i = 0; i < count; i++) {
    const mode = modes[Math.floor(rand() * modes.length)] as RunnerMode;
    const stateRoll = rand();
    const state: RunnerState =
      stateRoll < 0.06
        ? "offline"
        : stateRoll < 0.14
          ? "draining"
          : stateRoll < 0.24
            ? "starting"
            : stateRoll < 0.62
              ? "busy"
              : "idle";
    const runs = Math.floor(rand() * 180) + (state === "offline" ? 0 : 8);
    const failures = state === "offline" ? 0 : Math.floor(rand() * (rand() < 0.2 ? 14 : 3));
    runners.push({
      id: `fgr-${(seed >>> 0).toString(36)}-${String(i + 1).padStart(2, "0")}`,
      name: `runner-${modeTag(mode)}-${String(i + 1).padStart(2, "0")}`,
      mode,
      state,
      load: state === "busy" ? 0.35 + rand() * 0.6 : state === "draining" ? 0.2 + rand() * 0.4 : rand() * 0.18,
      runs,
      failures,
    });
  }
  return runners;
}

/** one fleet summary: counts per state, counts per rung and the floor
 * verdict (the floor is healthy while no runner rides red). */
export interface FleetSummary {
  total: number;
  byState: Readonly<Record<RunnerState, number>>;
  byHealth: Readonly<Record<RunnerHealth, number>>;
  healthy: boolean;
  busyLoad: number;
}

function zeroStates(): Record<RunnerState, number> {
  return { idle: 0, starting: 0, busy: 0, draining: 0, offline: 0 };
}

function zeroHealth(): Record<RunnerHealth, number> {
  return { green: 0, amber: 0, red: 0 };
}

/** summarizes the fleet: state and health histograms plus the honest
 * verdict (red anywhere means the floor is not healthy). */
export function fleetSummary(fleet: readonly Runner[]): FleetSummary {
  const byState = zeroStates();
  const byHealth = zeroHealth();
  let loadSum = 0;
  for (const runner of fleet) {
    byState[runner.state] += 1;
    byHealth[healthRungOf(runner).label] += 1;
    loadSum += runner.load;
  }
  return {
    total: fleet.length,
    byState,
    byHealth,
    healthy: byHealth.red === 0,
    busyLoad: fleet.length === 0 ? 0 : loadSum / fleet.length,
  };
}

/** advances the fleet one tick, deterministically: loads drift on the seed,
 * busy runners may finish (load falls, runs grow), idle runners may start,
 * offline runners stay offline until a human act — the tick never heals a
 * red runner by hiding its record. */
export function fleetTick(fleet: readonly Runner[], seed: number, tick: number): Runner[] {
  const rand = mulberry32((seed ^ Math.imul(tick + 1, 0x9e3779b9)) >>> 0);
  return fleet.map((runner) => {
    if (runner.state === "offline") return runner;
    if (runner.state === "draining") {
      // the drain completes: load falls, the runner goes idle with its record kept
      const load = Math.max(0, runner.load - 0.4 - rand() * 0.2);
      return { ...runner, load, state: load <= 0 ? ("idle" as const) : ("draining" as const) };
    }
    const finish = runner.state === "busy" && rand() < 0.5;
    if (finish) {
      const failed = rand() < 0.08;
      return {
        ...runner,
        state: rand() < 0.55 ? ("idle" as const) : ("busy" as const),
        load: failed ? runner.load : Math.max(0, runner.load - 0.5 - rand() * 0.4),
        runs: runner.runs + 1,
        failures: runner.failures + (failed ? 1 : 0),
      };
    }
    const start = runner.state === "idle" && rand() < 0.5;
    if (start) return { ...runner, state: "starting" as const, load: Math.min(1, runner.load + 0.1) };
    if (runner.state === "starting")
      return { ...runner, state: "busy" as const, load: Math.min(1, runner.load + 0.45) };
    return { ...runner, load: Math.min(1, Math.max(0.05, runner.load + (rand() - 0.45) * 0.18)) };
  });
}

/** picks the runner the queue should hand a job to: the healthiest idle
 * runner of the requested mode (amber before red, never an offline one);
 * undefined when nobody can take the work — an honest refusal. */
export function pickRunner(fleet: readonly Runner[], mode: RunnerMode): Runner | undefined {
  const candidates = fleet
    .filter((runner) => runner.mode === mode && runner.state !== "offline")
    .map((runner) => ({ runner, rung: healthRungOf(runner).rung }))
    .filter((entry) => entry.rung < 2)
    .sort((a, b) => a.rung - b.rung || a.runner.load - b.runner.load);
  return candidates[0]?.runner;
}
