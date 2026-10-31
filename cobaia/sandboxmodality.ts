// # sandboxmodality — the workload lane declaration of the cobaia
// application (root layer, wave WL1): the lanes this app owns in the
// family workload catalog, mirrored from the engine of record
// (saddle/workloadlaw.ts — the FAMILYLANES table) as the string contract
// the deploy and the platform speak. The mirror law (the same discipline
// the devthink modalities vendor rides): the rows are mirrored, not
// imported, because the published saddle envelope the container build
// installs does not carry the workload law yet and the family law bars a
// relative path across apps — the day the envelope publishes, the ids
// answer the same strings (the lockstep is the string contract, not the
// import). The app battery pins the mirror against the engine source
// through the library bridge so the vendor can never drift in silence.
//
// The seat law (the deploy's opt-in, the family's shared shape): the
// deploy pins COBAIA_SANDBOX_LANE — "local" (the default, the deploy's own process),
// "join" (the platform resolves every lane through the engine's join
// resolver — the nuclear modality law: the workload never names a
// modality, the join answers), or a modality id the deploy pins for the
// app's lanes (named here, validated by the platform's join at dispatch —
// this module never judges engine vocabulary, so the mirror cannot drift
// when the registry grows). The module never spawns anything and resolves
// no join: it names the lanes' truth; the platform resolves the sandbox.
// Zero consumer data, zero imports.

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
export const APPSLUG = "cobaia";

/** the workload lanes this app owns — the mirror of the engine catalog
 * rows (saddle/workloadlaw.ts, the FAMILYLANES table; the battery pins
 * the two surfaces equal). */
export const WORKLOADLANES: readonly AppWorkloadLane[] = Object.freeze([
  {
    app: "cobaia",
    lane: "plan-checkout",
    role: "the plan checkout surface: mrr plan rows, link validation and the billing webhook walk when it lands, secrets server-side",
    demand: { gpu: false, network: true, isolation: "process", bootbudget: 25 },
    today: "app-lane",
  },
  {
    app: "cobaia",
    lane: "ads-slot",
    role: "the honest ad slot lane: the reserved slots and the rotation decision the deploy answers before the render",
    demand: { gpu: false, network: true, isolation: "process", bootbudget: 25 },
    today: "app-lane",
  },
  {
    app: "cobaia",
    lane: "label-seed",
    role: "the label manifest seed of the monetization face: the store walk the sqlite vault carries",
    demand: { gpu: false, network: false, isolation: "process", bootbudget: 25 },
    today: "app-lane",
  },
]);

/** the environment name the deploy pins the sandbox lane seat through
 * (the opt-in seat — documented in the env example, zero hardcode). */
export const SANDBOXLANEENV = "COBAIA_SANDBOX_LANE";

/** the typed answer of the seat: the declaration the deploy reads —
 * local (the lanes run in the deploy's own process), join (the platform
 * resolves every lane through the engine's join resolver), or the pinned
 * modality id the deploy named (validated by the platform's join at
 * dispatch, never judged here). every answer is honest: an absent or
 * blank choice answers the declared default, never a silent switch. */
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
 * COBAIA_SANDBOX_LANE (opt-in per deploy); the lookup is injected so the server lane
 * hands process.env and any other lane hands its own seat. this module
 * never spawns anything: it names the truth the platform resolves.
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
