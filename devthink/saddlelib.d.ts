/**
 * saddlelib.d.ts — the ambient mirror of the saddle library faces the os
 * consumes through the published envelope specifiers (the bare
 * "@wenathlan/saddle" root and the "@wenathlan/saddle/memory" subpath).
 *
 * The source-is-library doctrine (the dist law) ships the saddle envelope
 * as the engine sources themselves, and the node consumer resolves the
 * runtime through the registry package — but the declaration walk of the
 * os application runs under the strict baseline the saddle sources never
 * carried (the engine keeps its loose authored baseline), so the bare
 * faces answer through this ambient mirror instead of the node_modules
 * resolution: the same discipline the typeface ambient mirrors ride (the
 * vite client contract the app pass keeps clean). The subpath faces the
 * os consumes beside their engine sources (modalityregistry, workloadlaw,
 * sandbox) resolve through the tsconfig paths the app already carries —
 * those modules answer the strict walk natively — and this mirror covers
 * exactly the two specifiers the example local job rides: the engine
 * family (engine, eventbus, inprocess, scheduler) and the memory family
 * (localmemory, localstorage).
 *
 * The shapes mirror the source signatures the execution, foundation and
 * virtual modules author: the engine coordinates job intent through the
 * storage / memory / scheduler triad, the eventbus records the frozen
 * event stream, the inprocess provider answers the local runner, the
 * scheduler orders the providers by priority, and the memory family
 * answers the local working-memory manager and the filesystem storage.
 */

declare module "@wenathlan/saddle" {
  /** the engine options triad: the storage, the memory and the scheduler
   * the engine coordinates, with the optional eventbus and id/clock
   * factories the reproducible paths inject. */
  export interface engineoptions {
    storage: unknown;
    memory: unknown;
    scheduler: schedulershape;
    events?: eventbusshape;
  }

  /** the recorded frozen event stream the engine emits every lifecycle
   * transition through. */
  export interface eventbusshape {
    emit(event: unknown): void;
    all(): unknown[];
  }

  /** the provider-ordered scheduler the engine selects a runner through. */
  export interface schedulershape {
    select(job: unknown): Promise<unknown>;
    list(): unknown[];
  }

  /** the run answer: the job record with its identity and status, the
   * committed artifact key and the handler result the job carried. */
  export interface runanswer {
    job: { id: string; name: string; status: string };
    artifact: { key: string };
    result?: unknown;
  }

  /** the eventbus factory: a fresh recorded stream per call. */
  export function eventbus(): eventbusshape;

  /** the in-process runner provider: the local execution surface the
   * example and the embedded lanes ride. */
  export function inprocess(options?: unknown): unknown;

  /** the provider-ordered scheduler: the priority sort the descriptor
   * answers, the availability walk the select rides. */
  export function scheduler(providers: unknown[]): schedulershape;

  /** the engine factory: coordinates the job intent, the working memory,
   * the runner execution and the commit; the run answers the job record
   * and the committed artifact the handler produced. */
  export function engine(options: engineoptions): {
    events: eventbusshape;
    run(spec: unknown, handler: (context: { job: { id: string } }) => unknown): Promise<runanswer>;
  };
}

declare module "@wenathlan/saddle/memory" {
  /** the local working-memory manager: the prepare/commit lifecycle the
   * engine coordinates through the memory face. */
  export function localmemory(options?: unknown): unknown;

  /** the filesystem-backed storage the committed artifacts ride, rooted
   * at the directory the consumer pins. */
  export function localstorage(root: string): unknown;
}
