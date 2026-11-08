// the forge unit of the family.
// # graphplan — the forge door to the owner logic in foundry/pipeline.ts per the dedup law.
// The whole plan engine — the states, the staging, the validation, the
// projection, the layout, the tallies and the deterministic rehearsal —
// answers from the one seat the foundry owns; the forge never carries a
// second engine. The door keeps only the two forge seats the owner engine
// never needed: the run plan shape (the owner step plus the saddle mode
// seat — a forge gate step asks the floor for a runtime target) and the
// canonical RUNPLAN fixture the runs page rehearses, built on the shared
// types and still assignable to the owner engine, ride for ride.

import type { planstep as ownerplanstep, runplan as ownerrunplan } from "@wenathlan/foundry/pipeline";
import type { RunnerMode } from "./runner.ts";

export type {
  planedge,
  plangraph,
  plannode,
  planposition,
  planstate,
  planstepkind,
  planwire,
} from "@wenathlan/foundry/pipeline";
export {
  PLAN_STATES,
  planbounds,
  plancopy,
  plandepth,
  planfailindex,
  planfeeders,
  plangraphof,
  plannext,
  planpositions,
  planprogress,
  planrehearsal,
  planstages,
  planstateissettled,
  planstepof,
  plantally,
  planvalid,
} from "@wenathlan/foundry/pipeline";

/** One step of the run plan: the owner's step plus the saddle mode seat —
 * what the runner does, on which saddle mode (the forge contract the
 * pipeline plans never needed, kept so the gate step still speaks to the
 * floor through the runner seam). */
export interface planstep extends ownerplanstep {
  /** The saddle runner mode the step asks the floor for (absent = floor choice). */
  mode?: RunnerMode;
}

/** One run plan: the owner's plan shape carrying the forge step — the mode
 * seat survives on the steps and the plan stays assignable to the owner
 * engine (every engine function reads it unchanged). */
export interface runplan extends ownerrunplan {
  steps: readonly planstep[];
}

/** The canonical plan of one forge run — the catalog of what a run is, in
 * ride order: the floor musters the runner, the runner resolves the saddle
 * mode, the sandbox provisions, the run executes, the evidence collects and
 * the sealed log chain closes the run. */
export const RUNPLAN: runplan = {
  id: "forge-run",
  steps: [
    {
      id: "muster",
      kind: "stage",
      label: "muster the runner",
      note: "the floor picks the healthiest runner for the mode",
    },
    {
      id: "resolve",
      kind: "gate",
      label: "resolve the mode",
      mode: "full-virtual",
      note: "the saddle boundary resolves the runtime target",
    },
    {
      id: "provision",
      kind: "tool",
      label: "provision the sandbox",
      note: "the sandbox shape comes up for the resolved mode",
    },
    {
      id: "execute",
      kind: "tool",
      label: "execute the run",
      note: "the binary runs and the runner records the turnaround",
    },
    {
      id: "collect",
      kind: "tool",
      label: "collect the evidence",
      note: "the exit state and the artifacts come back to the floor",
    },
    { id: "seal", kind: "sink", label: "seal the log chain", note: "the sealed log chain closes the run record" },
  ],
  wires: [
    { from: "muster", to: "resolve" },
    { from: "resolve", to: "provision" },
    { from: "provision", to: "execute" },
    { from: "execute", to: "collect" },
    { from: "collect", to: "seal" },
  ],
};
