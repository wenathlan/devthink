// # engineplans.ts — the engine plan profiles and the limits law of
// the saddle master virtualization engine (the pr15 tier law): the
// three engine profiles the family standard names — max, balanced and
// lite — and the law that keeps the engine itself unlimited.
//
// THE THREE ENGINE PROFILES (the saddle-exclusive law: the only app of
// the family that ships three container targets): every profile is the
// declared hardware plan the engine presents to a sandbox — the cpu
// class, the vcpu and thread counts, the ram plan, the gpu class and
// the gpu count — read from the eleven-device virtual hardware bank
// (seven cpu classes and four gpu classes the engine presents as
// virtual devices, never the visitor machine's own hardware). the
// profiles stamp the image config (the ENV surface and the OCI labels
// the container lanes carry) and scale the resource envelopes the
// modality seats apply:
//   max       — the epyc 9965 class, 192 vcpu, 384 threads, 1024 gib
//               ram plan, the b200 gpu plan x8.
//   balanced  — the threadripper pro 9995wx class, 96 vcpu, 192
//               threads, 512 gib ram plan, the b200 gpu plan x2 (the
//               documented default profile).
//   lite      — the ryzen 9950x3d class, 16 vcpu, 32 threads, 128 gib
//               ram plan, the rtx 5090 gpu plan x1.
//
// THE LIMITS LAW (the engine limits law of pr15): the engines are
// UNLIMITED — the engine graph carries no ceiling on the workloads,
// sessions or artifacts it may drive, because an engine limit would be
// a product decision wearing an engine costume. the limits that exist
// are PLAN limits (for example the 50 gb per plan storage quota) and
// they belong to the devthink system plan logic alone — the plan
// envelope arrives from outside (the caller stamps it through
// {@link planenvelope}), the engine only honors the envelope it is
// handed for that one run and never bakes a quota into its own
// capability table.
//
// THE VISITOR LAW (the critical law): every hardware number of every
// profile is a VIRTUAL device the engine presents on its own
// twenty-four hour internet infrastructure — the engine never reads,
// never borrows and never touches the visitor machine (no visitor gpu,
// no visitor cpu, no visitor browser, no visitor local storage, no
// localforage).
//
// Pure data and pure functions: zero storage, zero node-only imports,
// the browser-pure bundle keeps carrying it.

/* ════════════════════════════════════════════════════════════════════ */
/* Section 1: the profile contracts.                                    */
/* ════════════════════════════════════════════════════════════════════ */

/** The engine profile ids the family standard names (the tier law). */
export type EngineProfileId = "max" | "balanced" | "lite";

/** One engine plan profile: the declared virtual hardware plan the
 * engine presents to a sandbox (every device virtual — the
 * eleven-device bank the engine owns, never the visitor machine). */
export interface EnginePlanProfile {
  /** The profile id (max, balanced or lite). */
  readonly id: EngineProfileId;
  /** The display name (short, lowercase). */
  readonly name: string;
  /** The virtual cpu class the plan presents (the device bank id). */
  readonly cpu: string;
  /** The virtual cpu class display identity the plan stamps. */
  readonly cpuname: string;
  /** The vcpu count the plan allocates. */
  readonly vcpus: number;
  /** The thread count the plan allocates. */
  readonly threads: number;
  /** The ram plan in gibibytes. */
  readonly ramgb: number;
  /** The virtual gpu class the plan presents (the device bank id). */
  readonly gpu: string;
  /** The virtual gpu count the plan allocates. */
  readonly gpus: number;
  /** The queue concurrency the plan drives (the orchestration width). */
  readonly queuewidth: number;
  /** The resource envelope scale the plan applies to modality seats
   * (1.0 = the full envelope, lower profiles scale it down). */
  readonly envelopescale: number;
  /** The one-line role sentence of the profile. */
  readonly role: string;
}

/* ════════════════════════════════════════════════════════════════════ */
/* Section 2: the profile table — the three tiers the standard names. */
/* ════════════════════════════════════════════════════════════════════ */

/** The three engine plan profiles (the pr15 tier law, the values the
 * container lanes and the publish matrix stamp). */
export const ENGINEPLANS: readonly EnginePlanProfile[] = Object.freeze([
  {
    id: "max",
    name: "max",
    cpu: "epyc9965",
    cpuname: "EPYC 9965",
    vcpus: 192,
    threads: 384,
    ramgb: 1024,
    gpu: "b200",
    gpus: 8,
    queuewidth: 64,
    envelopescale: 1,
    role: "the full profile catalog: the heaviest virtual hardware plan the engine presents, every modality seat at its full envelope.",
  },
  {
    id: "balanced",
    name: "balanced",
    cpu: "threadripperpro9995wx",
    cpuname: "ThreadRipper PRO 9995WX",
    vcpus: 96,
    threads: 192,
    ramgb: 512,
    gpu: "b200",
    gpus: 2,
    queuewidth: 32,
    envelopescale: 0.5,
    role: "the balanced profile: the documented default tier the plain container build answers, half the max envelope on every seat.",
  },
  {
    id: "lite",
    name: "lite",
    cpu: "ryzen9950x3d",
    cpuname: "Ryzen 9950X3D",
    vcpus: 16,
    threads: 32,
    ramgb: 128,
    gpu: "rtx5090",
    gpus: 1,
    queuewidth: 8,
    envelopescale: 0.25,
    role: "the lite profile: the lightest virtual hardware plan, a quarter of the max envelope, the hardware-isolation seats refuse under it.",
  },
]);

/** The documented default profile (the plain container build with no
 * target flag answers the balanced stage — the container lane law). */
export const DEFAULTENGINEPROFILE: EngineProfileId = "balanced";

/* ════════════════════════════════════════════════════════════════════ */
/* Section 3: the limits law — engines unlimited, plans external.      */
/* ════════════════════════════════════════════════════════════════════ */

/** The engine limits law, as data: the engine graph is unlimited —
 * every ceiling below answers "none" because a limit on the engine
 * would be a product decision wearing an engine costume. the quotas
 * that exist (for example the 50 gb per plan storage quota) are
 * devthink system plan logic: they arrive from outside through
 * {@link planenvelope} and the engine honors them per run only. */
export interface EngineLimitsLaw {
  /** The engine workload ceiling — unlimited. */
  readonly workloads: "unlimited";
  /** The engine concurrent session ceiling — unlimited (the profile
   * queue width orchestrates fairness, it never caps the count). */
  readonly sessions: "unlimited";
  /** The engine modality seat ceiling — the full ninety, no seat
   * gated behind a tier. */
  readonly modalities: "unlimited";
  /** The engine artifact ceiling — unlimited (the plan envelope may
   * cap one run's artifacts, the engine never caps the graph). */
  readonly artifacts: "unlimited";
  /** Where the real limits live: the devthink system plan logic owns
   * every quota (storage per plan, runs per plan, seats per plan). */
  readonly plansowner: "devthink";
}

/** The engine limits law of record (pr15): the engines are unlimited,
 * the plan limits are devthink system plan logic — never engine
 * limits. */
export const ENGINELIMITS: EngineLimitsLaw = Object.freeze({
  workloads: "unlimited",
  sessions: "unlimited",
  modalities: "unlimited",
  artifacts: "unlimited",
  plansowner: "devthink",
});

/** One external plan envelope a caller hands the engine for a run: the
 * plan quotas belong to the devthink system plan logic and arrive from
 * outside — the engine never invents, never bakes and never raises
 * them (it only honors what the caller stamps for that one run). */
export interface PlanEnvelope {
  /** The plan id the envelope belongs to (the devthink plan row). */
  readonly planid: string;
  /** The storage quota of the plan in gibibytes (for example 50). */
  readonly storagegb?: number;
  /** The concurrent run quota of the plan (unlimited when absent). */
  readonly runs?: number;
  /** The honest provenance sentence of the envelope. */
  readonly source: string;
}

/**
 * Stamps one external plan envelope for a run — the single seam the
 * devthink system plan logic uses to hand the engine its quotas. the
 * engine answers the envelope verbatim (never mutated, never cached):
 * the limits law keeps the engine itself unlimited and the plan
 * envelope scoped to the run that carried it.
 *
 * @param planid the plan id the envelope belongs to.
 * @param quotas the plan quotas (for example { storagegb: 50 }).
 * @param source the provenance sentence (who stamped the envelope).
 * @returns the plan envelope the caller may attach to a run request.
 */
export function planenvelope(
  planid: string,
  quotas: { storagegb?: number; runs?: number },
  source = "devthink system plan logic",
): PlanEnvelope {
  if (typeof planid !== "string" || planid.length === 0) {
    throw Object.assign(new Error("the plan envelope requires a plan id"), { code: "PLAN_ENVELOPE_INVALID" });
  }
  return Object.freeze({ planid, ...quotas, source });
}

/**
 * Answers whether one run request fits the plan envelope it carried —
 * the plan check the engine performs per run (the engine itself stays
 * unlimited, the envelope scopes the run alone).
 *
 * @param envelope the plan envelope the caller stamped.
 * @param usedgb the storage the run already consumed, in gibibytes.
 * @returns true when the run fits, false when the plan quota answered.
 */
export function planfits(envelope: PlanEnvelope | undefined, usedgb: number): boolean {
  if (envelope === undefined) return true;
  if (envelope.storagegb === undefined) return true;
  return usedgb <= envelope.storagegb;
}

/* ════════════════════════════════════════════════════════════════════ */
/* Section 4: the profile resolvers — pure functions the seats read.   */
/* ════════════════════════════════════════════════════════════════════ */

/**
 * Answers one engine plan profile by id.
 *
 * @param id the profile id (max, balanced or lite).
 * @returns the profile record, or undefined when the id is unknown.
 */
export function getengineplan(id: string): EnginePlanProfile | undefined {
  return ENGINEPLANS.find((profile) => profile.id === id);
}

/**
 * Resolves one engine plan profile with the documented default: an
 * absent or unknown id answers the balanced profile (the plain
 * container build law), a known id answers its own profile.
 *
 * @param id the profile id (optional — the default answers balanced).
 * @returns the engine plan profile of record.
 */
export function selectengineplan(id?: string): EnginePlanProfile {
  return getengineplan(id ?? DEFAULTENGINEPROFILE) ?? getengineplan(DEFAULTENGINEPROFILE)!;
}

/**
 * Scales one resource number by the profile envelope scale (the tier
 * law: the modality seats apply the envelope their profile declares).
 *
 * @param profile the engine plan profile of the run.
 * @param value the full-envelope resource number.
 * @param floor the minimum the scaled number never drops below.
 * @returns the scaled resource number.
 */
export function scaleenvelope(profile: EnginePlanProfile, value: number, floor = 1): number {
  return Math.max(floor, Math.round(value * profile.envelopescale));
}

/**
 * Answers the honest profile report the console and the tests read:
 * the profile rows with their declared hardware plans, every device
 * virtual (the engine presents it, the visitor machine never lends its
 * own — the critical law).
 *
 * @returns the profile census of the engine plans table.
 */
export function engineplansreport(): {
  profiles: number;
  defaultprofile: EngineProfileId;
  limits: EngineLimitsLaw;
  rows: readonly EnginePlanProfile[];
} {
  return {
    profiles: ENGINEPLANS.length,
    defaultprofile: DEFAULTENGINEPROFILE,
    limits: ENGINELIMITS,
    rows: ENGINEPLANS,
  };
}
