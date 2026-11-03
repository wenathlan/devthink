// # sandboxmodality — the workload lane declaration of the devthink
// application (root layer, wave WL1): the lanes this app owns in the
// family workload catalog, answered from the engine of record
// (saddle/workloadlaw.ts — the FAMILYLANES table) through the published
// library specifier ("@wenathlan/saddle/workloadlaw") the config bridges
// resolve to the sibling owner source — the same ownership law the
// modality registry bridge rides (sandboxlane.ts answers the catalog of
// record the same way). The app carries no second copy of the rows: the
// vendored WORKLOADLANES mirror retired the day the bridge answered in
// every config (the vitest, the vite and the typecheck paths all resolve
// the specifier), so this app's table IS the engine's table filtered to
// this app's slug — one owner, zero duplication (the family law), and
// the app battery still pins the two surfaces equal through the library
// bridge, so the derivation can never drift in silence.
//
// The seat law (the deploy's opt-in, the family's shared shape): the
// deploy pins DEVTHINK_SANDBOX_LANE — "local" (the default, the deploy's own process),
// "join" (the platform resolves every lane through the engine's join
// resolver — the nuclear modality law: the workload never names a
// modality, the join answers), or a modality id the deploy pins for the
// app's lanes (named here, validated by the platform's join at dispatch —
// this module never judges engine vocabulary, so the declaration cannot
// drift when the registry grows). The module never spawns anything and
// resolves no join: it names the lanes' truth; the platform resolves the
// sandbox. Zero consumer data; the one import below is the declaration's
// single source (the engine's workload law) and nothing else enters.

// the engine's workload law — the single source of the family lane
// catalog (the ownership law: the engine owns the catalog, this app owns
// the seat law below). lanesof answers this app's rows out of the
// engine's FAMILYLANES table; WorkloadLane is the row shape the engine
// law pins. The specifier resolves through the vitest, vite and tsconfig
// bridges to the sibling owner source, exactly the way the app battery
// already resolves it — the same bridge grammar
// ("@wenathlan/saddle/modalityregistry") the sandbox lane rides.
import { lanesof, type WorkloadLane } from "@wenathlan/saddle/workloadlaw";

/** one workload lane row — the same five keys the engine law pins (app,
 * lane, role, demand, today). The shape itself belongs to the engine law
 * (workloadlaw.ts answers WorkloadLane); the alias below keeps this
 * module's historical surface name, so no importer moves while the rows
 * derive from the engine. */
export type AppWorkloadLane = WorkloadLane;

/** the app slug every engine row of this app carries — the filter key
 * lanesof reads. */
export const APPSLUG = "devthink";

/** the workload lanes this app owns — the engine catalog rows answered
 * through the library bridge (lanesof filters the engine's FAMILYLANES
 * table down to this app's slug; the freeze keeps the answer constant):
 * the local mirror table retired with the 2-c dedup wave, so the rows
 * can never drift from the engine — they are the engine's rows, and the
 * battery keeps pinning the app surface against the engine source the
 * way it always did. */
export const WORKLOADLANES: readonly AppWorkloadLane[] = Object.freeze(lanesof(APPSLUG));

/** the environment name the deploy pins the sandbox lane seat through
 * (the opt-in seat — documented in the env example, zero hardcode). */
export const SANDBOXLANEENV = "DEVTHINK_SANDBOX_LANE";

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
 * this module never judges engine vocabulary, so the declaration cannot
 * drift when the registry grows).
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
 * DEVTHINK_SANDBOX_LANE (opt-in per deploy); the lookup is injected so the server lane
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
 * Answers one engine lane row by lane id — the lookup the app surfaces
 * and the batteries read.
 *
 * @param lane the lane id inside the app.
 * @returns the engine's row for this app, or undefined when the app
 * carries no such lane.
 */
export function laneof(lane: string): AppWorkloadLane | undefined {
  return WORKLOADLANES.find((row) => row.lane === lane);
}
