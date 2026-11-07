// # sandboxmodality — the workload lane declaration of the vault
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
// deploy pins VAULT_SANDBOX_LANE — "local" (the default, the deploy's own process),
// "join" (the platform resolves every lane through the engine's join
// resolver — the nuclear modality law: the workload never names a
// modality, the join answers), or a modality id the deploy pins for the
// app's lanes (named here, validated by the platform's join at dispatch —
// this module never judges engine vocabulary, so the mirror cannot drift
// when the registry grows). The module never spawns anything and resolves
// no join: it names the lanes' truth; the platform resolves the sandbox.
// Zero consumer data; the one import below is the owner's lane seat
// factory and nothing else enters.
//
// The engine seat (wave W5, the dedup law): the seat resolver, the env
// reader and the lane lookup no longer live in this file — they ride the
// saddle factory (laneseating of ../saddle/workloadlaw.ts, the owner's
// workload law) bound once to this app's own data, re-exported under the
// same names the surface always spoke. The rows stay mirrored (the drift
// pin the battery wants), only the engine moved: zero behavior change,
// zero public-surface change.

import { type AppWorkloadLane, type LaneSeatResult, laneseating } from "../saddle/workloadlaw.ts";

/** one mirrored workload lane row — the same five keys the engine law pins
 * (app, lane, role, demand, today); the shape itself rides the owner's
 * law now (wave W5 — saddle/workloadlaw.ts answers the type once),
 * re-exported under the historical surface name. */
export type { AppWorkloadLane };

/** the app slug every mirrored row carries. */
export const APPSLUG = "vault";

/** the workload lanes this app owns — the mirror of the engine catalog
 * rows (saddle/workloadlaw.ts, the FAMILYLANES table; the battery pins
 * the two surfaces equal). */
export const WORKLOADLANES: readonly AppWorkloadLane[] = Object.freeze([
  {
    app: "vault",
    lane: "blob-ingest",
    role: "the object deposit lane: path and mime validation, the quota gate inside the write transaction and the detach walk",
    demand: { gpu: false, network: true, isolation: "process", bootbudget: 800 },
    today: "engine-lane",
  },
  {
    app: "vault",
    lane: "chunk-window",
    role: "the chunk window lane: the fixed slicing, the per-window digest and the brotli decision over the byte stream",
    demand: { gpu: false, network: false, isolation: "process", bootbudget: 800 },
    today: "engine-lane",
  },
  {
    app: "vault",
    lane: "digest-sha256",
    role: "the digest engine: the sha-256 master and chunk walks and the full re-verification the read path answers",
    demand: { gpu: false, network: false, isolation: "process", bootbudget: 25 },
    today: "engine-lane",
  },
  {
    app: "vault",
    lane: "ref-gc",
    role: "the reference gc lane: the soft-delete tombstones, the ref detach and the orphan sweep the store drives",
    demand: { gpu: false, network: true, isolation: "process", bootbudget: 800 },
    today: "engine-lane",
  },
]);

/** the environment name the deploy pins the sandbox lane seat through
 * (the opt-in seat — documented in the env example, zero hardcode). */
export const SANDBOXLANEENV = "VAULT_SANDBOX_LANE";

/** the typed answer of the seat: the declaration the deploy reads —
 * local (the lanes run in the deploy's own process), join (the platform
 * resolves every lane through the engine's join resolver), or the pinned
 * modality id the deploy named (validated by the platform's join at
 * dispatch, never judged here). every answer is honest: an absent or
 * blank choice answers the declared default, never a silent switch. */
export type { LaneSeatResult };

/** the lane seat engine of this app — the saddle factory bound once to
 * this app's own data (the dedup law: the engine lives in the owner, the
 * app keeps its data), the seats re-exported below under the names the
 * surface always spoke. */
const seating = laneseating({ slug: APPSLUG, envvar: SANDBOXLANEENV, lanes: WORKLOADLANES });

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
export const lanesandbox = seating.lanesandbox;

/**
 * Reads the lane seat off one environment lookup — the deploy pins
 * VAULT_SANDBOX_LANE (opt-in per deploy); the lookup is injected so the server lane
 * hands process.env and any other lane hands its own seat. this module
 * never spawns anything: it names the truth the platform resolves.
 *
 * @param lookup the environment lookup function (the env carrier).
 * @returns the seat declaration.
 */
export const lanesandboxfromenv = seating.lanesandboxfromenv;

/**
 * Answers one mirrored lane row by lane id — the lookup the app surfaces
 * and the batteries read.
 *
 * @param lane the lane id inside the app.
 * @returns the mirrored row, or undefined when the app carries no such
 * lane.
 */
export const laneof = seating.laneof;
