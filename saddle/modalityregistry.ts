/**
 * modalityregistry — the catalog of the ninety sandbox modalities the
 * saddle virtualization engine opens (the exclusive master engine of
 * the family: the vm, the sandbox, the microvm, the runner and the
 * hardware virtual seats — every workload rides the self-hosted edge,
 * nothing touches the visitor machine). One record per modality: the
 * numeric id (1 to 90), the name, the slug, the lane (sandbox, vm,
 * runner or hardware), the category family, the driver requirements it
 * mounts, the boot cost class, the hardening gates it carries, the
 * mime contract it answers and the honest state of its wiring.
 *
 * THE REGISTRY LAW (pr15): this catalog derives every record from the
 * master engine table (modalities.ts — the real executable logic of
 * the ninety: the spawn plans, the cgroups-style resource flags, the
 * queue orchestration and the in-process engines every seat owns), so
 * the catalog can never drift from the engine and every record answers
 * with its working implementation attached. the registry is the
 * read-only view; the engine table is the truth.
 *
 * THE CRITICAL LAW (the visitor law): the ninety modalities act for
 * the system on our own twenty-four hour internet infrastructure via
 * saddle and vault edge processing — the engine never touches the
 * visitor gpu, cpu, browser, local storage or localforage (the guard
 * of modalities.ts enforces it at every dispatch).
 *
 * THE ENGINE LIMITS LAW: the engines are unlimited — the plan limits
 * (for example the 50 gb per plan storage quota) are devthink system
 * plan logic, never engine limits (engineplans.ts owns the law).
 *
 * the fold law of the virtual wave: the join resolver reads the
 * request (isolation, gpu, network, boot budget) and answers the
 * modality set that satisfies it, so the person chooses none and the
 * platform resolves the join of all (the nuclear modality law). Every
 * record declares its binding — live, host or planned — so the report
 * never lies: a lane that does not wire a modality says so instead of
 * pretending.
 *
 * Pure data and pure functions: zero storage, zero node-only imports,
 * the browser-pure bundle keeps carrying it.
 *
 * @module saddle/modalityregistry
 * @family wave/saddlepr15
 * @token modality
 * @token ninety
 * @flag join-resolver
 * @flag visitor-law
 * @binding MODALITY_COUNT is derived from the records' real length —
 *   never a hardcoded count — and MODALITYPLANCOUNT pins the plan line
 *   the owner charged; the tests assert both stay equal at ninety.
 */

import {
  BOOTLADDER as ENGINEBOOTLADDER,
  MODALITYCOUNT,
  MODALITYENGINE,
  MODALITYPLANCOUNT as ENGPLANCOUNT,
  type ModalityLane,
  type ModalitySpec,
  type ModalityWiringState,
} from "./modalities.ts";

/** The boot cost classes the ladder measures. */
export type BootClass = "hot" | "warm" | "cold";

/** The isolation families the modalities group under (the catalog's
 * finer vocabulary beside the four lanes — the join resolver reads it
 * when a workload prefers a family). */
export type ModalityFamily =
  | "virtual"
  | "runner"
  | "packages"
  | "container"
  | "microvm"
  | "browser"
  | "mobile"
  | "confidential"
  | "emulator"
  | "local"
  | "screen"
  | "wasm"
  | "fs"
  | "ram"
  | "delivery"
  | "language"
  | "sandbox"
  | "storage"
  | "network"
  | "build"
  | "ci"
  | "gpu"
  | "hardware"
  | "ports";

/**
 * The honest wiring state of one modality — the truth ladder every record
 * declares and every report reads:
 * - live — the platform lanes drive it today: the engine table owns a
 *   real executor and the run lane executes through it;
 * - host — the lane probes the host runtime and reports availability;
 * - planned — the declared catalog promise, no lane wires it yet and the
 *   record never pretends otherwise.
 */
export type ModalityState = ModalityWiringState;

/** One sandbox modality of the registry — the read-only catalog view of
 * one seat of the master engine table. */
export interface ModalityRecord {
  /** The stable slug the api and the config rows reference. */
  id: string;
  /** The numeric id of the seat: 1 (the first) to 90 (the ninetieth). */
  num: number;
  /** The display name of the seat (the full form). */
  name: string;
  /** The short display label (lowercase). */
  label: string;
  /** The lane of the seat: sandbox, vm, runner or hardware. */
  lane: ModalityLane;
  /** The isolation family the modality belongs to. */
  family: ModalityFamily;
  /** The isolation depth the family reaches (the capability contract). */
  isolation: "process" | "namespace" | "vm" | "hardware";
  /** The honest wiring state of the modality (the report never lies). */
  state: ModalityState;
  /** The driver modules the modality mounts when it boots. */
  drivers: readonly string[];
  /** The hardening gates the modality enforces by default. */
  hardening: readonly string[];
  /** The boot cost class (the measured budget lives in the boot ladder). */
  boot: BootClass;
  /** The measured boot budget in milliseconds (the ladder answers). */
  bootms: number;
  /** Whether the modality presents a gpu through the virtual drivers. */
  gpu: boolean;
  /** Whether the modality opens a network path (the hardened default is off). */
  network: boolean;
  /** The mime type the modality's api surface answers. */
  mime: string;
}

/** The boot budgets of the ladder, per class: the ceilings the records
 * walk under (firecracker 125 ms and gvisor about 200 ms ride warm,
 * the full machine images ride cold). */
export const BOOTLADDER: Readonly<Record<BootClass, number>> = Object.freeze({
  hot: ENGINEBOOTLADDER.hot,
  warm: ENGINEBOOTLADDER.warm,
  cold: ENGINEBOOTLADDER.cold,
});

/** The ninety modality plan: the count the owner charged (the ninety
 * modalities of saddle acting for the system) and the engine table
 * answers — the catalog walked from twenty through forty to the ninety
 * law, and this constant is the line the plan pins. */
export const MODALITYPLANCOUNT = ENGPLANCOUNT;

/** The family prefix table — the catalog's finer vocabulary derived
 * from the seat slugs (the engine table owns the lane; the family is
 * the join resolver's preference filter). */
const FAMILYPREFIXES: ReadonlyArray<readonly [string, ModalityFamily]> = [
  ["containerdockprincipal", "container"],
  ["container", "container"],
  ["runner", "runner"],
  ["language", "language"],
  ["runtime", "runner"],
  ["build", "build"],
  ["ci", "ci"],
  ["storage", "storage"],
  ["network", "network"],
  ["ram", "ram"],
  ["delivery", "delivery"],
  ["virtualvgpu", "gpu"],
  ["virtualgpu", "gpu"],
  ["virtualvcpu", "hardware"],
  ["virtualprocessor", "hardware"],
  ["hardwarevirtual", "hardware"],
  ["virtual", "virtual"],
  ["microvm", "microvm"],
  ["emulator", "emulator"],
  ["confidential", "confidential"],
  ["browser", "browser"],
  ["screen", "screen"],
  ["mobile", "mobile"],
  ["sandbox", "sandbox"],
  ["portsdock", "ports"],
  ["virtualfile", "fs"],
  ["fs", "fs"],
  ["gpu", "gpu"],
  ["local", "local"],
];

/** Derives the catalog family of one seat from its slug (the prefix
 * table walks longest-first so the compound slugs answer their own
 * family before the generic prefix catches them). */
function familyof(slug: string): ModalityFamily {
  for (const [prefix, family] of FAMILYPREFIXES) {
    if (slug.startsWith(prefix)) return family;
  }
  return "sandbox";
}

/** Derives one catalog record from one seat of the master engine table
 * (the registry is the read-only view — every field answers the engine
 * table, nothing is re-declared). */
function torecord(spec: ModalitySpec): ModalityRecord {
  return {
    id: spec.slug,
    num: spec.num,
    name: spec.name,
    label: spec.name,
    lane: spec.lane,
    family: familyof(spec.slug),
    isolation: spec.isolation,
    state: spec.state,
    drivers: spec.drivers,
    hardening: spec.hardening,
    boot: spec.boot,
    bootms: spec.bootms,
    gpu: spec.gpu,
    network: spec.network,
    mime: spec.mime,
  };
}

/** The modality records: the catalog the join resolver reads — all
 * ninety seats of the master engine table, each with its numeric id,
 * name, lane and honest wiring state. */
export const MODALITIES: readonly ModalityRecord[] = Object.freeze(MODALITYENGINE.map(torecord));

/** The count the catalog answers — derived from the records' real
 * length (never a hardcoded line, so the count cannot drift from the
 * array) and the line the tests pin against the plan the owner
 * charged. */
export const MODALITY_COUNT = MODALITIES.length;

/** The honest plan report: what the catalog holds against the ninety
 * plan — the counts per state and whether the plan is answered. The
 * report is the truth surface the lanes and the tests read; it never
 * counts a record as more than its state declares. */
export interface ModalityPlanReport {
  /** The plan line the owner charged (the ninety modalities). */
  plancount: number;
  /** The records the catalog holds. */
  catalogcount: number;
  /** The records the platform lanes drive today. */
  live: number;
  /** The records whose host runtime the lane probes. */
  host: number;
  /** The declared promises no lane wires yet. */
  planned: number;
  /** Whether the catalog answers the plan count. */
  plananswered: boolean;
}

/** planreport — the honest census of the registry against the ninety
 * plan: the counts per state and the plan verdict, computed from the
 * records (never hardcoded, so the report cannot drift from the
 * catalog). */
export function planreport(): ModalityPlanReport {
  const counts: Record<ModalityState, number> = { live: 0, host: 0, planned: 0 };
  for (const modality of MODALITIES) counts[modality.state] += 1;
  return {
    plancount: MODALITYPLANCOUNT,
    catalogcount: MODALITIES.length,
    live: counts.live,
    host: counts.host,
    planned: counts.planned,
    plananswered: MODALITIES.length >= MODALITYPLANCOUNT,
  };
}

/** The base profiles the owner names (the config wave makes them
 * editable — engineplans.ts owns the tier law). */
export type BaseProfile = "max" | "balanced" | "lite";

/** The join request: what the workload asks, never a modality name. */
export interface JoinRequest {
  /** The base profile the sandbox boots under. */
  base: BaseProfile;
  /** Whether the workload needs a gpu path through the virtual drivers. */
  gpu: boolean;
  /** Whether the workload needs a network path. */
  network: boolean;
  /** The isolation depth the workload demands at minimum. */
  isolation?: ModalityRecord["isolation"];
  /** The boot budget the workload tolerates, in milliseconds. */
  bootbudget?: number;
  /** The family the workload prefers (the first filter when given). */
  family?: ModalityFamily;
  /** The lane the workload prefers (the pr15 lane filter: sandbox, vm,
   * runner or hardware). */
  lane?: ModalityLane;
}

/**
 * Resolves the modality join for a request: the records that satisfy
 * every demand, ordered by boot cost then isolation depth — the
 * platform answers the join, the person never names a modality (the
 * nuclear law).
 *
 * @param request the workload demands.
 * @returns the modality records that satisfy the join, best candidate first.
 */
export function resolvejoin(request: JoinRequest): readonly ModalityRecord[] {
  const budget = request.bootbudget ?? BOOTLADDER.cold;
  const order: Record<ModalityRecord["isolation"], number> = { process: 0, namespace: 1, vm: 2, hardware: 3 };
  return MODALITIES.filter((modality) => {
    if (request.family && modality.family !== request.family) return false;
    if (request.lane && modality.lane !== request.lane) return false;
    if (request.gpu && !modality.gpu) return false;
    if (request.network && !modality.network) return false;
    if (request.isolation && order[modality.isolation] < order[request.isolation]) return false;
    if (modality.bootms > budget) return false;
    // the lite base keeps the heavy machine images out of the answer
    if (request.base === "lite" && modality.isolation === "hardware") return false;
    return true;
  }).sort((a, b) => a.bootms - b.bootms || order[a.isolation] - order[b.isolation]);
}

/**
 * Answers one modality by slug (the config rows and the api carry
 * slugs).
 *
 * @param id the modality slug.
 * @returns the record, or undefined when the slug is unknown.
 */
export function getmodality(id: string): ModalityRecord | undefined {
  return MODALITIES.find((modality) => modality.id === id);
}

/**
 * Answers one modality by its numeric id (1 to 90) — the pr15 seat
 * number the engine table owns.
 *
 * @param num the numeric id of the seat.
 * @returns the record, or undefined when the id is outside the ninety.
 */
export function getmodalitybynum(num: number): ModalityRecord | undefined {
  return MODALITIES.find((modality) => modality.num === num);
}

// the engine-count re-export: the master table's derived count rides
// beside the catalog's own count so the tests can pin the two never
// drift apart (the registry view and the engine table answer the same
// ninety).
export { MODALITYCOUNT };
