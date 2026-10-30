// # sandboxmodality — the sandbox modality declaration of the worker
// lanes (root layer, wave PV6.003): the ingest worker and the render
// worker declare the sandbox modality their walks run under, and this
// module owns the one vocabulary both declarations read. the vocabulary
// mirrors the saddle modalityregistry's own ids — "local" (the deploy's
// own process, the honest default every walk declares) beside the three
// saddle modalities the heavy jobs may ride: "runner-node" (the node
// packages modality, live, process isolation), "container-docker" (the
// hardened container modality, live, namespace isolation) and
// "microvm-firecracker" (the firecracker microvm, host, vm isolation).
// the ids are mirrored, not imported: the published 2.1.6 saddle
// envelope does not carry the registry yet, and the family law bars a
// relative path across apps — the day the registry publishes, the ids
// answer the same strings (the lockstep is the string contract, not the
// import). the worker functions never spawn anything themselves — the
// declaration is the contract the deploy reads: the deploy opts the lane
// onto a saddle modality through DEBONAIR_WORKER_MODALITY (opt-in per
// deploy, never a silent switch), and the platform resolves the sandbox
// while this module only names the lane's truth. zero consumer data.

/** The sandbox modality one worker walk runs under — "local" (the
 * deploy's own process) or one of the saddle modality ids the deploy
 * resolves the lane onto. */
export type WorkerModality = "local" | "runner-node" | "container-docker" | "microvm-firecracker";

/** The modality vocabulary the declarations read (the saddle
 * modalityregistry ids mirrored — the string contract the deploy and the
 * platform speak). */
export const WORKER_MODALITIES: readonly WorkerModality[] = [
  "local",
  "runner-node",
  "container-docker",
  "microvm-firecracker",
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
