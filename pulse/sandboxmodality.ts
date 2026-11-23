// # sandboxmodality — the workload lane declaration of the pulse
// application (root layer, the twelfth module's seat): the lanes this app
// owns in the family workload catalog, mirrored from the engine of record
// (saddle/workloadlaw.ts — the FAMILYLANES table) as the string contract
// the deploy and the platform speak. The mirror law (the same discipline
// every sibling rides): the rows are mirrored as the string contract the
// lockstep pins, while the engine seat rides the published library
// specifier (the family law bars a relative path across apps — the ids
// answer the same strings, the lockstep is the string contract, not the
// copy). The app battery pins the mirror against the engine source
// through the library bridge so the vendor can never drift in silence.
//
// The seat law (the deploy's opt-in, the family's shared shape): the
// deploy pins PULSE_SANDBOX_LANE — "local" (the default, the deploy's own
// process), "join" (the platform resolves every lane through the engine's
// join resolver — the nuclear modality law: the workload never names a
// modality, the join answers), or a modality id the deploy pins for the
// app's lanes (named here, validated by the platform's join at dispatch —
// this module never judges engine vocabulary, so the mirror cannot drift
// when the registry grows). The module never spawns anything and resolves
// no join: it names the lanes' truth; the platform resolves the sandbox.
// Zero consumer data; the one import below is the owner's lane seat
// factory and nothing else enters.
//
// The honesty law of the construction seat: the studio is in construction
// — the surface is the one under-construction face and the only lane the
// app truthfully owns today is the label seed walk (the manifest the
// vault store carries). The social automation lanes of the canon (the
// 24/7 channel scheduling with renewal-aware tokens, the 24h cut channel
// production through cadria, the static mission distribution with the
// MERGE_FEATURE versus CREATE_NEW_APP anti-duplication filter) stay
// UNDECLARED until the day the studio wakes up with real engine logics —
// a declared row without an engine behind it is exactly the false
// surface the owner's radical honesty law bans.

import { type AppWorkloadLane, type LaneSeatResult, laneseating } from "@wenathlan/saddle/workloadlaw";

/** one mirrored workload lane row — the same five keys the engine law pins
 * (app, lane, role, demand, today); the shape itself rides the owner's
 * law (saddle/workloadlaw.ts answers the type once), re-exported under
 * the historical surface name. */
export type { AppWorkloadLane };

/** the app slug every mirrored row carries. */
export const APPSLUG = "pulse";

/** the workload lanes this app owns — the mirror of the engine catalog
 * rows (saddle/workloadlaw.ts, the FAMILYLANES table; the battery pins
 * the two surfaces equal). The construction law seats one honest row:
 * the label seed of the under-construction face. */
export const WORKLOADLANES: readonly AppWorkloadLane[] = Object.freeze([
  {
    app: "pulse",
    lane: "label-seed",
    role: "the label manifest seed of the under-construction face: the store walk the sqlite vault carries",
    demand: { gpu: false, network: false, isolation: "process", bootbudget: 25 },
    today: "app-lane",
  },
]);

/** the environment name the deploy pins the sandbox lane seat through
 * (the opt-in seat — documented in the env example, zero hardcode). */
export const SANDBOXLANEENV = "PULSE_SANDBOX_LANE";

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
 * PULSE_SANDBOX_LANE (opt-in per deploy); the lookup is injected so the
 * server lane hands process.env and any other lane hands its own seat.
 * this module never spawns anything: it names the truth the platform
 * resolves.
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
