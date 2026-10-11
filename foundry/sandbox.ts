// # sandbox — the sandbox state machine of the foundry (root layer, pure
// logic). The foundry is the machine room of the family: every sandbox
// answers on a three-state ladder — cold (built, not booted), warm (booted,
// keeping its working set) and hot (executing work) — with pure, guarded
// transitions between the states. The rehearsal herd is deterministic from
// one integer seed (mulberry32); the transitions refuse what the machine
// does not do (a cold sandbox cannot execute, a hot one cannot boot twice),
// and every refusal is an honest string. This module is the testable core
// of the /sandboxes page.

/** the three states of the sandbox machine. */
export type SandboxState = "cold" | "warm" | "hot";

/** the state ladder in machine order. */
export const SANDBOX_STATES: readonly SandboxState[] = ["cold", "warm", "hot"];

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

/** the allowed transitions of the machine: cold → warm → hot and the
 * cooling paths back. A cold sandbox never executes; a hot one is already
 * executing. */
const TRANSITIONS: Readonly<Record<SandboxState, readonly SandboxState[]>> = {
  cold: ["warm"],
  warm: ["hot", "cold"],
  hot: ["warm", "cold"],
};

/** answers whether the machine allows one transition. */
export function canTransition(from: SandboxState, to: SandboxState): boolean {
  return TRANSITIONS[from].includes(to);
}

/** the refusal the machine answers when a transition is not allowed. */
export function refusalFor(from: SandboxState, to: SandboxState): string {
  if (from === to) return `the sandbox is already ${from}`;
  if (from === "cold" && to === "hot") return "a cold sandbox cannot execute — warm it first";
  if (from === "hot" && to === "hot") return "the sandbox is already hot";
  return `the machine never goes ${from} → ${to} directly`;
}

/** the action names of the machine, one per transition. */
export type SandboxAction = "warm" | "heat" | "cool" | "freeze";

/** the transition each action drives. */
const ACTION_TO: Readonly<Record<SandboxAction, SandboxState>> = {
  warm: "warm",
  heat: "hot",
  cool: "cold",
  freeze: "cold",
};

/** drives one action against one sandbox: returns the next sandbox and an
 * honest refusal when the machine does not allow the move. Pure — the
 * input never mutates. */
export function drive(sandbox: Sandbox, action: SandboxAction): { sandbox: Sandbox; refusal?: string } {
  const to = ACTION_TO[action];
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
