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
// import).
//
// wave WL1 adds the workload lane declaration the whole family now rides:
// the WORKLOADLANES mirror below (the engine catalog rows of
// saddle/workloadlaw.ts — the FAMILYLANES table) plus the sandbox lane
// seat (DEBONAIR_SANDBOX_LANE: local, join or a pinned modality id). the
// worker seat above (DEBONAIR_WORKER_MODALITY and its vocabulary) stays
// the workers' own opt-in — the two seats coexist honestly: the worker
// seat pins the worker process, the lane seat declares the app's lanes to
// the platform's join resolver (the nuclear modality law). the worker functions never spawn anything themselves — the
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


/**
 * @section workloadlaw — the family workload lane mirror (wave WL1)
 * the lanes this app owns in the family workload catalog, mirrored from
 * the engine of record (saddle/workloadlaw.ts — the FAMILYLANES table)
 * as the string contract the deploy and the platform speak. the app
 * battery pins the mirror against the engine source through the library
 * bridge so the vendor can never drift in silence. the rows never name a
 * modality: the demand rides the join and the platform answers.
 */

/** one mirrored workload lane row — the same five keys the engine law pins
 * (app, lane, role, demand, today). */
export type AppWorkloadLane = {
  /** the official app slug every row carries. */
  readonly app: string;
  /** the lane id inside the app (kebab-case, the engine catalog id). */
  readonly lane: string;
  /** what the lane does, in one sentence (the engine row's sentence). */
  readonly role: string;
  /** the demand the lane puts on the sandbox (gpu, network, isolation,
   * boot budget — never a modality name: the nuclear law). */
  readonly demand: {
    readonly gpu: boolean;
    readonly network: boolean;
    readonly isolation: "process" | "namespace" | "vm" | "hardware";
    readonly bootbudget?: number;
  };
  /** where the heavy pass runs today — the honest truth the census reads. */
  readonly today: "engine-lane" | "app-lane";
};

/** the app slug every mirrored row carries. */
export const APPSLUG = "debonair";

/** the workload lanes this app owns — the mirror of the engine catalog
 * rows (saddle/workloadlaw.ts, the FAMILYLANES table; the battery pins
 * the two surfaces equal). */
export const WORKLOADLANES: readonly AppWorkloadLane[] = Object.freeze([
  {
    app: "debonair",
    lane: "ingest-audio",
    role: "the ingest worker: the stream separation, the pcm downmix and the payload json the reconstruction reads",
    demand: { gpu: false, network: false, isolation: "process", bootbudget: 800 },
    today: "engine-lane",
  },
  {
    app: "debonair",
    lane: "render-track",
    role: "the render worker: the composed plan render, the mastering chain and the wav encode into the take store",
    demand: { gpu: false, network: false, isolation: "process", bootbudget: 800 },
    today: "engine-lane",
  },
]);

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
 * this module never judges engine vocabulary, so the mirror cannot drift
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
 * DEBONAIR_SANDBOX_LANE (opt-in per deploy); the lookup is injected so the
 * server lane hands process.env and any other lane hands its own seat.
 *
 * @param lookup the environment lookup function (the env carrier).
 * @returns the seat declaration.
 */
export function lanesandboxfromenv(lookup: (key: string) => string | undefined): LaneSeatResult {
  return lanesandbox(lookup(SANDBOXLANEENV));
}

/**
 * Answers one mirrored lane row by lane id — the lookup the app surfaces
 * and the batteries read.
 *
 * @param lane the lane id inside the app.
 * @returns the mirrored row, or undefined when the app carries no such
 * lane.
 */
export function laneof(lane: string): AppWorkloadLane | undefined {
  return WORKLOADLANES.find((row) => row.lane === lane);
}
