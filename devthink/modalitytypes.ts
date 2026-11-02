/**
 * modalitytypes.ts — the ambient declaration of the saddle engine's
 * modality registry for the declaration build. The os consumes the
 * ninety-modality catalog as a library (the ownership law: saddle owns the
 * sandbox lane), and the runtime bundle inlines the owner's source through
 * the vite/vitest config bridges (../saddle/modalityregistry.ts) — the
 * declaration build resolves the specifier here so the tsc program never
 * leaves the application root (rootDir "." keeps the emitted declarations
 * flat under the outDir) and the emitted declarations keep referencing the
 * owner library specifier. The surface mirrors the engine's type-only
 * bridge (saddle/modalityregistrytypes.ts) one for one; it retires the day
 * the published saddle envelope carries the ./modalityregistry export,
 * exactly the way the getry thinking bridge (thinkingtypes.ts) documents
 * the same ladder for its own owner.
 */
declare module "@wenathlan/saddle/modalityregistry" {
  /** the boot cost classes the ladder measures. */
  export type BootClass = "hot" | "warm" | "cold";

  /** the isolation families the modalities group under. */
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
    | "pod"
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
    | "gpu";

  /** the honest wiring state of one modality (live, host or planned). */
  export type ModalityState = "live" | "host" | "planned";

  /** one sandbox modality of the registry. */
  export interface ModalityRecord {
    /** the stable id the api and the config rows reference. */
    id: string;
    /** the display label (short, lowercase). */
    label: string;
    /** the isolation family the modality belongs to. */
    family: ModalityFamily;
    /** the isolation depth the family reaches (the capability contract). */
    isolation: "process" | "namespace" | "vm" | "hardware";
    /** the honest wiring state of the modality (the report never lies). */
    state: ModalityState;
    /** the driver modules the modality mounts when it boots. */
    drivers: readonly string[];
    /** the hardening gates the modality enforces by default. */
    hardening: readonly string[];
    /** the boot cost class (the measured budget lives in the boot ladder). */
    boot: BootClass;
    /** the measured boot budget in milliseconds (the ladder answers). */
    bootms: number;
    /** whether the modality presents a gpu through the virtual drivers. */
    gpu: boolean;
    /** whether the modality opens a network path (the hardened default is off). */
    network: boolean;
    /** the mime type the modality's api surface answers. */
    mime: string;
  }

  /** the boot budgets of the ladder, per class. */
  export const BOOTLADDER: Readonly<Record<BootClass, number>>;

  /** the plan line the owner charged (the ninety modalities). */
  export const MODALITYPLANCOUNT: 90;

  /** the catalog: every modality record, frozen, in catalog order. */
  export const MODALITIES: readonly ModalityRecord[];

  /** the honest census of the registry against the ninety plan. */
  export interface ModalityPlanReport {
    /** the plan line the owner charged (the ninety modalities). */
    plancount: number;
    /** the records the catalog holds. */
    catalogcount: number;
    /** the records the platform lanes drive today. */
    live: number;
    /** the records whose host runtime the lane probes. */
    host: number;
    /** the declared promises no lane wires yet. */
    planned: number;
    /** whether the catalog answers the plan count. */
    plananswered: boolean;
  }

  /**
   * planreport — the honest census of the registry: the counts per state
   * and the plan verdict, computed from the records (never hardcoded).
   *
   * @returns the census of the catalog.
   */
  export function planreport(): ModalityPlanReport;

  /** the base profiles the owner names (the config wave makes them editable). */
  export type BaseProfile = "max" | "balanced" | "lite";

  /** the join request: what the workload asks, never a modality name. */
  export interface JoinRequest {
    /** the base profile the sandbox boots under. */
    base: BaseProfile;
    /** whether the workload needs a gpu path through the virtual drivers. */
    gpu: boolean;
    /** whether the workload needs a network path. */
    network: boolean;
    /** the isolation depth the workload demands at minimum. */
    isolation?: ModalityRecord["isolation"];
    /** the boot budget the workload tolerates, in milliseconds. */
    bootbudget?: number;
    /** the family the workload prefers (the first filter when given). */
    family?: ModalityFamily;
  }

  /**
   * resolves the modality join for a request: the records that satisfy
   * every demand, ordered by boot cost then isolation depth.
   *
   * @param request the workload demands.
   * @returns the modality records that satisfy the join, best candidate first.
   */
  export function resolvejoin(request: JoinRequest): readonly ModalityRecord[];

  /**
   * answers one modality by id (the config rows and the api carry ids).
   *
   * @param id the modality id.
   * @returns the record, or undefined when the id is unknown.
   */
  export function getmodality(id: string): ModalityRecord | undefined;
}
