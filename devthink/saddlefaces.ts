/**
 * saddlefaces.ts — the typed library face of the saddle engine for the
 * typecheck build, declared as a real module the tsconfig paths resolve
 * the bare specifier and the /memory subpath onto (the 2.1.8 envelope
 * ships the source-is-library
 * doctrine, so the physical module resolves for the runtime while the
 * typecheck program answers these declarations instead — the implicit
 * anys the upstream sources carry under their own loose tsconfig never
 * enter the consumer program). The runtime keeps resolving the real
 * sources through the vitest and vite bridges, node 26 strips the types.
 * The memory face of the /memory subpath (localmemory, localstorage)
 * rides in this same file under its own lane below.
 * Retires the day the published saddle envelope carries the declaration
 * build beside the sources.
 */
  /** one engine event of the bus (queued, preparing, running, syncing, committed, failed). */
  export type saddleevent = {
    id: string;
    type: string;
    jobid: string;
    at: number;
    data: unknown;
  };

  /** the event bus the engine emits its lifecycle through. */
  export type saddleeventbus = {
    emit(event: saddleevent): void | Promise<void>;
    all(): saddleevent[];
  };

  /** one runner provider the scheduler selects between. */
  export type saddleprovider = {
    descriptor(): { id: string; priority: number; status: string };
    canrun(job: unknown): Promise<boolean> | boolean;
    execute(context: { job: unknown; workingset: unknown; signal: AbortSignal }, handler?: (context: { job: unknown }) => unknown): Promise<unknown>;
  };

  /** the scheduler the engine asks to select a provider per job. */
  export type saddlescheduler = {
    select(job: unknown): Promise<saddleprovider>;
    list(): saddleprovider[];
  };

  /** the memory manager that prepares, syncs and cleans working sets. */
  export type saddlememory = {
    prepare(job: unknown): Promise<{ location: string }>;
    sync(set: unknown, bytes: Uint8Array): Promise<unknown>;
    cleanup(set: unknown): Promise<void>;
  };

  /** the storage the engine commits artifacts to. */
  export type saddlestorage = {
    put(entry: { key: string; data: Uint8Array; contenttype: string; metadata: Record<string, string> }): Promise<{ key: string; sha256: string }>;
  };

  /** the engine options: storage, memory and scheduler are required. */
  export type saddleengineoptions = {
    storage: saddlestorage;
    memory: saddlememory;
    scheduler: saddlescheduler;
    events?: saddleeventbus;
    ids?: { next(prefix: string): string };
    clock?: { now(): number };
  };

  /** the run result: the job, the output, the runner and the artifact. */
  export type saddlerunresult = {
    job: { id: string; name: string; status: string };
    output: unknown;
    runnerid: string;
    artifact: { key: string; sha256: string };
    sync: unknown;
  };

  /** the engine coordinates job intent, working memory, runner execution and commit. */
  export declare function engine(options: saddleengineoptions): {
    events: saddleeventbus;
    run<T = unknown>(spec: { name: string; input: unknown; outputkey?: string }, handler?: (context: { job: T }) => unknown): Promise<saddlerunresult>;
  };

  /** the in-process event bus (the memory-backed collector). */
  export declare function eventbus(): saddleeventbus;

  /** the in-process runner provider (executes inside the host process). */
  export declare function inprocess(options?: Record<string, unknown>): saddleprovider;

  /** the priority-ordered scheduler over the provider list. */
  export declare function scheduler(providers: saddleprovider[]): saddlescheduler;

  /* ── the memory face of the saddle library: the /memory subpath the tsconfig paths resolve onto this same file. ── */

  /** the in-process local memory manager (prepare, sync, cleanup). */
  export declare function localmemory(options?: Record<string, unknown>): {
    prepare(job: unknown): Promise<{ location: string }>;
    sync(set: unknown, bytes: Uint8Array): Promise<unknown>;
    cleanup(set: unknown): Promise<void>;
  };

  /** the filesystem storage under the given root directory. */
  export declare function localstorage(root: string): {
    put(entry: { key: string; data: Uint8Array; contenttype: string; metadata: Record<string, string> }): Promise<{ key: string; sha256: string }>;
  };

/* ===== block: modalityregistry ===== */
/**
 * the modality registry face of the @wenathlan/saddle/modalityregistry
 * subpath (wave/engineregroup1): the sandbox lane reads the ninety-modality
 * catalog through the published specifier, the runtime bridges inline the
 * owner's real source (../saddle/modalityregistry.ts) and this typed face
 * answers the declaration build (the rootDir law keeps the tsc program in
 * the application root). The surface mirrors the engine's type-only bridge
 * (saddle/modalityregistrytypes.ts) one for one; retires the day the
 * published saddle envelope carries the declaration build beside the
 * sources.
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

  /** the count the catalog answers — derived from the records' real length,
   * never a hardcoded line (the wave/saddlemod2 law). */
  export const MODALITY_COUNT: number;

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
