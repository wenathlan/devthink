// # sandboxmodality — the workload lane declaration of the getry
// application (root layer, wave WL1): the lanes this app owns in the
// family workload catalog, answered now straight from the engine of
// record through the published library specifier
// ("@wenathlan/saddle/workloadlaw" — the envelope carries the workload
// law, so the mirror era closes): the rows are the owner's own objects,
// the lockstep is the import itself, the vendor can never drift in
// silence. The family law bars a relative path across apps, so the
// specifier rides the bridges the app's tsconfigs and the vitest config
// carry — the same discipline the modalityregistry bridge of the
// ownership wave already speaks. The app battery pins the import against
// the engine catalog so the vendor can never drift in silence.
//
// The seat law (the deploy's opt-in, the family's shared shape): the
// deploy pins GETRY_SANDBOX_LANE — "local" (the default, the deploy's own process),
// "join" (the platform resolves every lane through the engine's join
// resolver — the nuclear modality law: the workload never names a
// modality, the join answers), or a modality id the deploy pins for the
// app's lanes (validated by the platform's join at dispatch —
// this module never judges engine vocabulary, so the seat cannot drift
// when the registry grows). The module never spawns anything and resolves
// no join: it names the lanes' truth; the platform resolves the sandbox.
// Zero consumer data.
//
// The engine seat (wave W5, the dedup law): the seat resolver, the env
// reader and the lane lookup no longer live in this file — they ride the
// saddle factory (laneseating of the same owner specifier below) bound
// once to this app's own data, re-exported under the same names the
// surface always spoke. Zero behavior change, zero public-surface
// change.

import { type AppWorkloadLane, type LaneSeatResult, laneseating, lanesof } from "@wenathlan/saddle/workloadlaw";

/** one workload lane row of this app — the engine law's own shape (app,
 * lane, role, demand, today); the type itself rides the owner's law now
 * (wave W5 — the workload law answers AppWorkloadLane once), re-exported
 * under the historical surface name. */
export type { AppWorkloadLane };

/** the app slug every row carries. */
export const APPSLUG = "getry";

/** the workload lanes this app owns — the engine catalog rows
 * (saddle/workloadlaw.ts, the FAMILYLANES table) answered through the
 * published specifier; the battery pins the import against the engine
 * catalog byte for byte. */
export const WORKLOADLANES: readonly AppWorkloadLane[] = Object.freeze(lanesof(APPSLUG));

/** the environment name the deploy pins the sandbox lane seat through
 * (the opt-in seat — documented in the env example, zero hardcode). */
export const SANDBOXLANEENV = "GETRY_SANDBOX_LANE";

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
 * this module never judges engine vocabulary, so the seat cannot drift
 * when the registry grows).
 *
 * @param choice the deploy's choice (the env value or the config row).
 * @returns the seat declaration.
 */
export const lanesandbox = seating.lanesandbox;

/**
 * Reads the lane seat off one environment lookup — the deploy pins
 * GETRY_SANDBOX_LANE (opt-in per deploy); the lookup is injected so the server lane
 * hands process.env and any other lane hands its own seat. this module
 * never spawns anything: it names the truth the platform resolves.
 *
 * @param lookup the environment lookup function (the env carrier).
 * @returns the seat declaration.
 */
export const lanesandboxfromenv = seating.lanesandboxfromenv;

/**
 * Answers one lane row by lane id — the lookup the app surfaces
 * and the batteries read.
 *
 * @param lane the lane id inside the app.
 * @returns the lane row, or undefined when the app carries no such
 * lane.
 */
export const laneof = seating.laneof;
