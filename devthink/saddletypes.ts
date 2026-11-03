/**
 * saddletypes.ts — the ambient declaration of the saddle engine's library
 * faces for the typecheck build. The os consumes the engine as a library
 * (the ownership law: saddle owns the virtualization domain), and the
 * runtime resolves the source-is-library envelope the 2.1.7 rung ships
 * (node 26 strips the types, the explicit .ts imports resolve natively —
 * the dist tree the 2.1.6 envelope carried never emits again), so the
 * example job runs the real engine through the installed sources while
 * the typecheck program resolves the bare specifier and the memory face
 * here — the same ladder the getry thinking shim documents for its own
 * owner. Retires the day the published saddle envelope carries the
 * declaration build beside the sources.
 */
declare module "@wenathlan/saddle" {
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
  export function engine(options: saddleengineoptions): {
    events: saddleeventbus;
    run<T = unknown>(spec: { name: string; input: unknown; outputkey?: string }, handler?: (context: { job: T }) => unknown): Promise<saddlerunresult>;
  };

  /** the in-process event bus (the memory-backed collector). */
  export function eventbus(): saddleeventbus;

  /** the in-process runner provider (executes inside the host process). */
  export function inprocess(options?: Record<string, unknown>): saddleprovider;

  /** the priority-ordered scheduler over the provider list. */
  export function scheduler(providers: saddleprovider[]): saddlescheduler;
}

declare module "@wenathlan/saddle/memory" {
  /** the in-process local memory manager (prepare, sync, cleanup). */
  export function localmemory(options?: Record<string, unknown>): {
    prepare(job: unknown): Promise<{ location: string }>;
    sync(set: unknown, bytes: Uint8Array): Promise<unknown>;
    cleanup(set: unknown): Promise<void>;
  };

  /** the filesystem storage under the given root directory. */
  export function localstorage(root: string): {
    put(entry: { key: string; data: Uint8Array; contenttype: string; metadata: Record<string, string> }): Promise<{ key: string; sha256: string }>;
  };
}
