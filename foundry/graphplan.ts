// # graphplan — the pipeline plan engine of the foundry (root layer, pure
// logic). The foundry stores and executes together, and the owner asked
// everything to be drawn by graphs and nodes, stage by stage — so the
// pipeline of one packaging run is a graph: provision the sandbox, pull the
// image through the registry gate, run the herd, collect the sealed
// artifacts and store them on the shelf. This module is the foundry's own
// small engine for that (the apps share no engine code — each app owns its
// own): the canonical plan, the projection into nodes and wires, the stable
// topological stages, the validation and the deterministic rehearsal states
// the artifacts page drives from its seed and tick. No DOM, no clocks, no
// randomness beyond the family mulberry32 seeded from the line: the same
// plan with the same seed and tick always answers the same states, in node
// and in the browser.

/** The ladder states one plan step holds across a rehearsal tick. */
export type planstate = "pending" | "running" | "done" | "failed" | "skipped";

/** Every plan state, in ladder order. */
export const PLAN_STATES: readonly planstate[] = ["pending", "running", "done", "failed", "skipped"];

/** The kinds a plan step can wear (the role the panel draws). */
export type planstepkind = "stage" | "gate" | "tool" | "sink";

/** One step of the pipeline plan: what the floor does on the way to the shelf. */
export interface planstep {
  /** The stable id of the step inside the plan. */
  id: string;
  /** The kind the step wears. */
  kind: planstepkind;
  /** The human label of the step. */
  label: string;
  /** The one-line note the manifest reads. */
  note: string;
}

/** One wire of the plan: the hand-off from one step into the next. */
export interface planwire {
  from: string;
  to: string;
}

/** One pipeline plan: the closed set of steps and wires (a tiny graph). */
export interface runplan {
  /** The plan identity (the rehearsed plan of the line answers the canonical id). */
  id: string;
  steps: readonly planstep[];
  wires: readonly planwire[];
}

/** One drawn plan node: the step fields plus the state the rehearsal holds. */
export interface plannode {
  id: string;
  kind: planstepkind;
  label: string;
  note: string;
  state: planstate;
}

/** One drawn plan edge (the wire, unchanged). */
export interface planedge {
  from: string;
  to: string;
}

/** The plan as a drawn graph: nodes carrying states, edges carrying hand-offs. */
export interface plangraph {
  nodes: readonly plannode[];
  edges: readonly planedge[];
}

/** One drawn position on the plan panel: the layer (stage) and the row inside it. */
export interface planposition {
  x: number;
  y: number;
  layer: number;
  row: number;
}

/** The canonical plan of one foundry pipeline run — the catalog of what a
 * packaging run is, in ride order: the sandbox shape provisions, the image
 * pulls through the registry gate, the herd runs, the artifacts come back
 * sealed and the vault shelf stores them. */
export const PIPELINE: runplan = {
  id: "foundry-pipeline",
  steps: [
    { id: "provision", kind: "stage", label: "provision the sandbox", note: "the sandbox shape comes up on the machine room floor" },
    { id: "pull", kind: "gate", label: "pull the image", note: "the image pulls through the registry gate before anything runs" },
    { id: "run", kind: "tool", label: "run the herd", note: "the herd executes inside the sandbox and the turnaround is recorded" },
    { id: "collect", kind: "tool", label: "collect the artifacts", note: "the artifacts come back sealed with their fnv-1a identity" },
    { id: "store", kind: "sink", label: "store on the shelf", note: "the vault shelf keeps every artifact the line seals" },
  ],
  wires: [
    { from: "provision", to: "pull" },
    { from: "pull", to: "run" },
    { from: "run", to: "collect" },
    { from: "collect", to: "store" },
  ],
};

/** Answers a fresh copy of one plan (immutable edits start from a copy). */
export function plancopy(plan: runplan): runplan {
  return { id: plan.id, steps: plan.steps.map((step) => ({ ...step })), wires: plan.wires.map((wire) => ({ ...wire })) };
}

/** Reads one step of the plan by id. */
export function planstepof(plan: runplan, id: string): planstep | undefined {
  return plan.steps.find((step) => step.id === id);
}

/** Reads the direct feeders of one step (the wires that arrive), stable order. */
export function planfeeders(plan: runplan, id: string): string[] {
  const feeders: string[] = [];
  for (const wire of plan.wires) {
    if (wire.to === id && !feeders.includes(wire.from)) feeders.push(wire.from);
  }
  return feeders;
}

/** Reads the direct successors of one step (the wires that leave), stable order. */
export function plannext(plan: runplan, id: string): string[] {
  const next: string[] = [];
  for (const wire of plan.wires) {
    if (wire.from === id && !next.includes(wire.to)) next.push(wire.to);
  }
  return next;
}

/** Layers the plan into the stable topological stages (one wave per layer,
 * steps inside a wave in ride order) — the etapas the panel draws. */
export function planstages(plan: runplan): string[][] {
  const levels: Record<string, number> = {};
  let placed = true;
  while (placed) {
    placed = false;
    for (const step of plan.steps) {
      if (levels[step.id] !== undefined) continue;
      const feeders = planfeeders(plan, step.id);
      if (feeders.every((feeder) => levels[feeder] !== undefined)) {
        levels[step.id] = feeders.reduce((max, feeder) => Math.max(max, levels[feeder] ?? 0), -1) + 1;
        placed = true;
      }
    }
  }
  const waves: string[][] = [];
  for (const step of plan.steps) {
    const level = levels[step.id] ?? 0;
    while (waves.length <= level) waves.push([]);
    waves[level]?.push(step.id);
  }
  return waves;
}

/** The number of stages the plan rides. */
export function plandepth(plan: runplan): number {
  return planstages(plan).length;
}

/** Validates the plan: duplicate ids, wires naming unknown steps, cycles.
 * Answers the problem codes (empty array = a valid plan). */
export function planvalid(plan: runplan): string[] {
  const problems: string[] = [];
  const seen = new Set<string>();
  for (const step of plan.steps) {
    if (seen.has(step.id)) problems.push("duplicateid");
    seen.add(step.id);
  }
  for (const [index, wire] of plan.wires.entries()) {
    if (wire.from === wire.to) problems.push("selfwire");
    if (!seen.has(wire.from) || !seen.has(wire.to)) {
      problems.push("unknownstep");
      continue;
    }
    if (reaches(plan, wire.to, wire.from)) problems.push(`cycle@${index}`);
  }
  return problems;
}

/** Answers whether one step reaches another forward (transitive, self inclusive). */
function reaches(plan: runplan, from: string, to: string): boolean {
  if (from === to) return true;
  const seen = new Set<string>();
  const queue = [...plannext(plan, from)];
  while (queue.length > 0) {
    const current = queue.shift();
    if (current === undefined) break;
    if (current === to) return true;
    if (seen.has(current)) continue;
    seen.add(current);
    for (const next of plannext(plan, current)) queue.push(next);
  }
  return false;
}

/** Projects the plan into the drawn graph: every step carries the state the
 * rehearsal map holds (pending when the map stays silent). */
export function plangraphof(plan: runplan, states: Readonly<Record<string, planstate>> = {}): plangraph {
  return {
    nodes: plan.steps.map((step) => ({ ...step, state: states[step.id] ?? "pending" })),
    edges: plan.wires.map((wire) => ({ ...wire })),
  };
}

/** Lays the plan out on its stages: x rides the stage column, y rides the
 * stable row — the geometry the panel draws without improvising. */
export function planpositions(
  plan: runplan,
  options: { columnwidth?: number; rowheight?: number; originx?: number; originy?: number } = {},
): Record<string, planposition> {
  const columnwidth = Math.max(1, options.columnwidth ?? 208);
  const rowheight = Math.max(1, options.rowheight ?? 72);
  const originx = options.originx ?? 0;
  const originy = options.originy ?? 0;
  const positions: Record<string, planposition> = {};
  planstages(plan).forEach((wave, layer) => {
    wave.forEach((id, row) => {
      positions[id] = { x: originx + layer * columnwidth, y: originy + row * rowheight, layer, row };
    });
  });
  return positions;
}

/** Answers the bounds box of a drawn plan (the box the svg viewBox rides). */
export function planbounds(
  positions: Readonly<Record<string, planposition>>,
  options: { cardwidth?: number; cardheight?: number; padding?: number } = {},
): { minx: number; miny: number; width: number; height: number } {
  const cardwidth = options.cardwidth ?? 176;
  const cardheight = options.cardheight ?? 56;
  const padding = options.padding ?? 20;
  const entries = Object.values(positions);
  if (entries.length === 0) return { minx: 0, miny: 0, width: cardwidth + padding * 2, height: cardheight + padding * 2 };
  const minx = Math.min(...entries.map((position) => position.x)) - padding;
  const miny = Math.min(...entries.map((position) => position.y)) - padding;
  const maxx = Math.max(...entries.map((position) => position.x + cardwidth)) + padding;
  const maxy = Math.max(...entries.map((position) => position.y + cardheight)) + padding;
  return { minx, miny, width: maxx - minx, height: maxy - minx };
}

/** Answers whether one state settled (the rehearsal already decided the step). */
export function planstateissettled(state: planstate): boolean {
  return state === "done" || state === "failed" || state === "skipped";
}

/** Tallies the states of a rehearsal map. */
export function plantally(states: Readonly<Record<string, planstate>>): Record<planstate, number> {
  const tally: Record<planstate, number> = { pending: 0, running: 0, done: 0, failed: 0, skipped: 0 };
  for (const id of Object.keys(states)) tally[states[id] as planstate] += 1;
  return tally;
}

/** The aggregated progress of a rehearsal map (0..100): the done share. */
export function planprogress(states: Readonly<Record<string, planstate>>): number {
  const ids = Object.keys(states);
  if (ids.length === 0) return 0;
  let done = 0;
  for (const id of ids) {
    if (states[id] === "done") done += 1;
  }
  return Math.round((done / ids.length) * 100);
}

/** mulberry32 — the small deterministic prng of the family engines (the
 * foundry keeps its own private roll, like the artifact engine does). */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** The step of the pipeline that rides red on this seed: one deterministic
 * roll (1 in 5 pipelines rides red — the rehearsal never heals a red rung
 * by hiding it, and a reseed rolls again). -1 = the pipeline rides green. */
export function planfailindex(plan: runplan, seed: number): number {
  const roll = mulberry32(seed >>> 0)();
  return roll < 1 / 5 ? Math.floor(roll * 5 * plan.steps.length) : -1;
}

/** The rehearsal states of the plan at one tick: every step before the
 * cursor settled done, the cursor step runs (or rides the seeded red and the
 * rest strand skipped), everything after stays pending. Deterministic —
 * the same seed and tick always answer the same map. */
export function planrehearsal(plan: runplan, seed: number, tick: number): Record<string, planstate> {
  const states: Record<string, planstate> = {};
  const failindex = planfailindex(plan, seed);
  const cursor = Math.min(Math.max(0, tick), plan.steps.length);
  for (const [index, step] of plan.steps.entries()) {
    if (failindex >= 0 && tick > failindex) {
      // the pipeline already rode red: the red step keeps its failure record and the rest strand
      states[step.id] = index < failindex ? "done" : index === failindex ? "failed" : "skipped";
      continue;
    }
    states[step.id] = index < cursor ? "done" : index === cursor && cursor < plan.steps.length ? "running" : "pending";
  }
  return states;
}

/** The ids of the steps the pipeline still holds on the shelf run: the
 * unsettled prefix the artifacts page reads to narrate the walk. */
export function planopensteps(plan: runplan, states: Readonly<Record<string, planstate>>): string[] {
  return plan.steps.filter((step) => !planstateissettled(states[step.id] ?? "pending")).map((step) => step.id);
}
