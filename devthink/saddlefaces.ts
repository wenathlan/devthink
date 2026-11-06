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
  /* ── the workload lane face (the gateladder build parity) ── */

  /** the demand one workload lane puts on the sandbox. */
  export type WorkloadDemand = {
    gpu: boolean;
    network: boolean;
    isolation: string;
    bootbudget?: number;
  };

  /** where the heavy pass of the lane runs today (the honest truth). */
  export type LaneToday = "engine-lane" | "app-lane";

  /** one workload lane of the family catalog. */
  export type WorkloadLane = {
    app: string;
    lane: string;
    role: string;
    demand: WorkloadDemand;
    today: LaneToday;
  };

  /** the lanes one app owns (the owner's table answers at runtime; the
   * face declares the contract the typecheck reads). */
  export declare function lanesof(app: string): readonly WorkloadLane[];

  /** one lane by its app and id. */
  export declare function getlane(app: string, lane: string): WorkloadLane | undefined;

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
