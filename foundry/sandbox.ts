// # sandbox — the sandbox state machine of the foundry (root layer, pure
// logic). The foundry is the machine room of the family: every sandbox
// answers on a three-state ladder — cold (built, not booted), warm (booted,
// keeping its working set) and hot (executing work) — with pure, guarded
// transitions between the states. The rehearsal herd is deterministic from
// one integer seed (mulberry32); the transitions refuse what the machine
// does not do (a cold sandbox cannot execute, a hot one cannot boot twice),
// and every refusal is an honest string. This module is the testable core
// of the /sandboxes page.
//
// wave 3, the engine ownership law: the state machine itself (the ladder,
// the transition table, the guards and the refusal vocabulary) answers
// from the saddle owner through the published library specifier
// ("@wenathlan/saddle/sandbox") — the machine is never duplicated inside
// the app. the foundry keeps the page-model projection: the sandbox
// record, the herd, the census and the boot/step bookkeeping the machine
// drives.

import {
  canTransition,
  refusalFor,
  SANDBOX_LIFECYCLE_ACTION_TARGETS,
  SANDBOX_LIFECYCLE_STATES,
  type SandboxLifecycleAction,
  type SandboxLifecycleState,
} from "@wenathlan/saddle/sandbox";

/** the three states of the sandbox machine (the ladder the saddle engine owns). */
export type SandboxState = SandboxLifecycleState;

/** the state ladder in machine order (the ladder the saddle engine owns). */
export const SANDBOX_STATES: readonly SandboxState[] = SANDBOX_LIFECYCLE_STATES;

/** one sandbox of the herd. */
export interface Sandbox {
  /** the stable id of the sandbox */
  id: string;
  /** the display name of the sandbox */
  name: string;
  /** the machine state (cold / warm / hot) */
  state: SandboxState;
  /** the image the sandbox booted from (its herd format rides along) */
  image: string;
  /** the boot count of this working set */
  boots: number;
  /** the executed step count since the last cold build */
  steps: number;
}

/** the machine the saddle engine owns (the ladder, the transition table,
 * the guards canTransition/refusalFor and the action guard table), bound
 * to the foundry surface — wave 3, the engine ownership law. */
export { canTransition, refusalFor };

/** the action names of the machine, one per transition (the vocabulary the
 * saddle engine owns — wave 3). */
export type SandboxAction = SandboxLifecycleAction;

/** drives one action against one sandbox: returns the next sandbox and an
 * honest refusal when the machine does not allow the move. Pure — the
 * input never mutates. */
export function drive(sandbox: Sandbox, action: SandboxAction): { sandbox: Sandbox; refusal?: string } {
  const to = SANDBOX_LIFECYCLE_ACTION_TARGETS[action];
  if (!canTransition(sandbox.state, to)) {
    return { sandbox, refusal: refusalFor(sandbox.state, to) };
  }
  if (action === "warm") {
    return { sandbox: { ...sandbox, state: "warm", boots: sandbox.boots + 1, steps: 0 } };
  }
  if (action === "heat") {
    return { sandbox: { ...sandbox, state: "hot" } };
  }
  if (action === "cool") {
    // cool keeps the booted working set (the fast path back to warm)
    return { sandbox: { ...sandbox, state: "warm" } };
  }
  // freeze: the working set is torn down, the sandbox goes cold
  return { sandbox: { ...sandbox, state: "cold", boots: 0, steps: 0 } };
}

/** records one executed step on a hot sandbox; refuses on anything colder. */
export function step(sandbox: Sandbox): { sandbox: Sandbox; refusal?: string } {
  if (sandbox.state !== "hot") {
    return { sandbox, refusal: "only a hot sandbox executes steps — heat it first" };
  }
  return { sandbox: { ...sandbox, steps: sandbox.steps + 1 } };
}

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

/** the images the herd boots from (the real clone formats of the family). */
const HERD_IMAGES: readonly string[] = [
  "base.tzst",
  "toolchain.tzst",
  "runtime.tar.gz",
  "release.tar.xz",
  "pack.tzst",
] as const;

/** the rehearsal herd of the machine room: deterministic from the seed —
 * the same seed always herds the same sandboxes (the surface says the herd
 * is a seeded rehearsal, never a live claim). */
export function seedHerd(seed: number, count = 7): Sandbox[] {
  const rand = mulberry32(seed);
  const herd: Sandbox[] = [];
  for (let i = 0; i < count; i++) {
    const stateRoll = rand();
    const state: SandboxState = stateRoll < 0.4 ? "cold" : stateRoll < 0.75 ? "warm" : "hot";
    herd.push({
      id: `fdy-${(seed >>> 0).toString(36)}-${String(i + 1).padStart(2, "0")}`,
      name: `sandbox-${String(i + 1).padStart(2, "0")}`,
      state,
      image: HERD_IMAGES[Math.floor(rand() * HERD_IMAGES.length)] as string,
      boots: state === "cold" ? 0 : Math.floor(rand() * 6) + 1,
      steps: state === "hot" ? Math.floor(rand() * 40) + 1 : 0,
    });
  }
  return herd;
}

/** the herd census the /sandboxes page shows: counts per state and the
 * share of the herd keeping a warm working set. */
export interface HerdCensus {
  total: number;
  byState: Readonly<Record<SandboxState, number>>;
  warmShare: number;
}

/** summarizes the herd: the state histogram plus the warm share. */
export function herdCensus(herd: readonly Sandbox[]): HerdCensus {
  const byState: Record<SandboxState, number> = { cold: 0, warm: 0, hot: 0 };
  for (const sandbox of herd) byState[sandbox.state] += 1;
  return {
    total: herd.length,
    byState,
    warmShare: herd.length === 0 ? 0 : (byState.warm + byState.hot) / herd.length,
  };
}
