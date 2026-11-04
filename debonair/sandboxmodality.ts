// # sandboxmodality — the sandbox modality declaration of the worker
// lanes (root layer, wave PV6.003): the ingest worker and the render
// worker declare the sandbox modality their walks run under, and this
// module owns the one vocabulary both declarations read. the vocabulary
// mirrors the saddle modalityregistry's own ids — "local" (the deploy's
// own process, the honest default every walk declares) beside the three
// saddle modalities the heavy jobs may ride: "runnernode" (the node
// packages modality, live, process isolation), "containerdocker" (the
// hardened container modality, live, namespace isolation) and
// "microvmfirecracker" (the firecracker microvm, host, vm isolation).
// the ids stay the worker seat's own opt-in strings (three of the
// registry's ninety records named by this app, not a copy of the engine
// table — the registry gate rides the getry precedent).
//
// wave WL1 adds the workload lane declaration the whole family now rides:
// the WORKLOADLANES rows answered now straight from the engine of record
// through the published library specifier
// ("@wenathlan/saddle/workloadlaw" — the envelope carries the workload
// law, so the lane-mirror era closes: the rows are the owner's own
// objects, the lockstep is the import itself, the vendor can never drift
// in silence) plus the sandbox lane seat (DEBONAIR_SANDBOX_LANE: local,
// join or a pinned modality id). the worker seat above
// (DEBONAIR_WORKER_MODALITY and its vocabulary) stays
// the workers' own opt-in — the two seats coexist honestly: the worker
// seat pins the worker process, the lane seat declares the app's lanes to
// the platform's join resolver (the nuclear modality law). the worker functions never spawn anything themselves — the
// declaration is the contract the deploy reads: the deploy opts the lane
// onto a saddle modality through DEBONAIR_WORKER_MODALITY (opt-in per
// deploy, never a silent switch), and the platform resolves the sandbox
// while this module only names the lane's truth. zero consumer data.

import { lanesof } from "@wenathlan/saddle/workloadlaw";
import type { WorkloadLane } from "@wenathlan/saddle/workloadlaw";

/** The sandbox modality one worker walk runs under — "local" (the
 * deploy's own process) or one of the saddle modality ids the deploy
 * resolves the lane onto. */
export type WorkerModality = "local" | "runnernode" | "containerdocker" | "microvmfirecracker";

/** The modality vocabulary the declarations read (the saddle
 * modalityregistry ids mirrored — the string contract the deploy and the
 * platform speak). */
export const WORKER_MODALITIES: readonly WorkerModality[] = [
  "local",
  "runnernode",
  "containerdocker",
  "microvmfirecracker",
];

/** The environment name the deploy pins the modality through (the opt-in
 * seat — documented in the env example, zero hardcode). */
export const WORKER_MODALITY_ENV = "DEBONAIR_WORKER_MODALITY";

/** The typed answer of the modality seat: the declaration the deploy
 * reads (the modality and whether the lane opted onto a saddle modality)
 * or the honest refusal of an off-vocabulary choice — never a silent
 * local, never a silent switch. */
export type WorkerModalityResult =
  | { ok: true; modality: WorkerModality; sandboxed: boolean }
  | { ok: false; message: string };

/**
 * Resolves the modality seat of one worker lane — the deploy's opt-in:
 * an absent or empty choice answers the lane's declared default ("local"
 * — the walk runs in the deploy's own process); a choice on the
 * vocabulary answers the saddle modality the platform resolves the lane
 * onto (sandboxed true); a choice off the vocabulary answers the honest
 * refusal, because a deploy that names a modality the registry does not
 * carry must learn it, not land somewhere it did not name.
 *
 * @param choice the deploy's choice (the env value or the config row).
 * @param fallback the lane's declared default (the worker constant).
 * @returns the declaration, or the typed refusal.
 */
export function workermodality(choice: string | undefined, fallback: WorkerModality = "local"): WorkerModalityResult {
  if (choice === undefined || choice.trim().length === 0) {
    return { ok: true, modality: fallback, sandboxed: fallback !== "local" };
  }
  const name = choice.trim();
  if (!WORKER_MODALITIES.includes(name as WorkerModality)) {
    return {
      ok: false,
      message: `the modality "${name}" is off the vocabulary (${WORKER_MODALITIES.join(", ")}) — the deploy names "local" or a saddle modality id`,
    };
  }
  return { ok: true, modality: name as WorkerModality, sandboxed: name !== "local" };
}

/**
 * Reads the modality seat off one environment lookup — the deploy pins
 * DEBONAIR_WORKER_MODALITY (opt-in per deploy); the lookup is injected so
 * the server lane hands process.env and any other lane hands its own
 * seat. this module never spawns anything: it names the truth the
 * platform resolves.
 *
 * @param getenv the environment lookup.
 * @param fallback the lane's declared default (the worker constant).
 * @returns the declaration, or the typed refusal.
 */
export function workermodalityfromenv(
  getenv: (name: string) => string | undefined,
  fallback: WorkerModality = "local",
): WorkerModalityResult {
  return workermodality(getenv(WORKER_MODALITY_ENV), fallback);
}

/**
 * @section workloadlaw — the family workload lane seat (wave WL1)
 * the lanes this app owns in the family workload catalog, answered now
 * straight from the engine of record through the published specifier
 * ("@wenathlan/saddle/workloadlaw"): the rows are the engine catalog's
 * own objects, the lockstep is the import itself. the app battery pins
 * the import against the engine catalog so the vendor can never drift in
 * silence. the rows never name a modality: the demand rides the join and
 * the platform answers.
 */

/** one workload lane row of this app — the engine law's own shape (app,
 * lane, role, demand, today). */
export type AppWorkloadLane = WorkloadLane;

/** the app slug every row carries. */
export const APPSLUG = "debonair";

/** the workload lanes this app owns — the engine catalog rows
 * (saddle/workloadlaw.ts, the FAMILYLANES table) answered through the
 * published specifier; the battery pins the import against the engine
 * catalog byte for byte. */
export const WORKLOADLANES: readonly AppWorkloadLane[] = Object.freeze(lanesof(APPSLUG));

/** the environment name the deploy pins the sandbox lane seat through
 * (the family opt-in — the lane seat the whole family speaks, beside the
 * worker seat above). */
export const SANDBOXLANEENV = "DEBONAIR_SANDBOX_LANE";

/** the typed answer of the lane seat: the declaration the deploy reads —
 * local (the lanes run in the deploy's own process), join (the platform
 * resolves every lane through the engine's join resolver), or the pinned
 * modality id the deploy named (validated by the platform's join at
 * dispatch, never judged here). */
export type LaneSeatResult =
  | { ok: true; seat: "local"; sandboxed: false }
  | { ok: true; seat: "join"; sandboxed: true; pinned: false }
  | { ok: true; seat: string; sandboxed: true; pinned: true };

/**
 * Resolves the sandbox lane seat of this application — the deploy's
 * opt-in: an absent or blank choice answers the declared default ("local"
 * — the lanes run in the deploy's own process); "join" opts every lane
 * onto the platform's join resolver (the nuclear modality law); any other
 * non-empty choice is the modality id the deploy pins for the lanes
 * (named by the deploy, validated by the platform's join at dispatch —
 * this module never judges engine vocabulary, so the seat cannot drift
 * when the registry grows).
 *
 * @param choice the deploy's choice (the env value or the config row).
 * @returns the seat declaration.
 */
export function lanesandbox(choice: string | undefined): LaneSeatResult {
  const name = choice?.trim() ?? "";
  if (name.length === 0 || name === "local") {
    return { ok: true, seat: "local", sandboxed: false };
  }
  if (name === "join") {
    return { ok: true, seat: "join", sandboxed: true, pinned: false };
  }
  return { ok: true, seat: name, sandboxed: true, pinned: true };
}

/**
 * Reads the lane seat off one environment lookup — the deploy pins
 * DEBONAIR_SANDBOX_LANE (opt-in per deploy); the lookup is injected so
 * the server lane hands process.env and any other lane hands its own
 * seat.
 *
 * @param lookup the environment lookup function (the env carrier).
 * @returns the seat declaration.
 */
export function lanesandboxfromenv(lookup: (key: string) => string | undefined): LaneSeatResult {
  return lanesandbox(lookup(SANDBOXLANEENV));
}

/**
 * Answers one lane row by lane id — the lookup the app surfaces
 * and the batteries read.
 *
 * @param lane the lane id inside the app.
 * @returns the lane row, or undefined when the app carries no such
 * lane.
 */
export function laneof(lane: string): AppWorkloadLane | undefined {
  return WORKLOADLANES.find((row) => row.lane === lane);
}
