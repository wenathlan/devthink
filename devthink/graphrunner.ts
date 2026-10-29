/**
 * graphrunner — the stage engine of the devthink graphs (root layer, pure
 * typescript).
 *
 * The owner law: "as lógicas tem que correr por etapas". The runner walks the
 * graph exactly the way graphnodes.ts layers it: one wave per stage, the
 * nodes of a stage in the stable insertion order of the model, never a
 * nondeterministic promise pool — the run is one straight await chain, so the
 * same graph with the same handler always produces the same event sequence.
 * Every node holds one state of the model ladder (pending → running → done |
 * failed, with skipped for everything a failure strands), a failing node
 * retries a fixed number of attempts before it strands the rest of the run,
 * and the view aggregates the whole run into one progress percentage the
 * surfaces draw. The engine owns no clock and no work: the handler is the
 * caller's logic (sync or async), the pause between stages is an option the
 * caller injects, and the engine only sequences — deterministically, with an
 * event and a view callback on every transition.
 */

import { type graphnode, type nodegraph, type nodestate, nodebyid, resetnodestates, stagewaves } from "./graphnodes.ts";

/** The status of the whole run: idle before it starts, running on the waves, done or failed at the end. */
export type runstatus = "idle" | "running" | "done" | "failed";

/** The kinds of event the engine answers on the onevent callback, in run order. */
export type runeventtype = "runbegin" | "stagebegin" | "nodestart" | "nodeattempt" | "nodedone" | "nodefailed" | "nodeskipped" | "stageend" | "runend";

/** One event of the run: the kind, the stage it rode, the node it touched, the attempt number and the run progress at the moment. */
export interface runevent {
  type: runeventtype;
  /** The zero-based stage (wave) the event rode. */
  stage: number;
  /** The node the event touched (absent on the run and stage markers). */
  nodeid?: string;
  /** The attempt number (1-based) on the attempt and failure events. */
  attempt?: number;
  /** The human detail (the failure message a handler threw). */
  message?: string;
  /** The aggregated progress of the run at the moment (0..100). */
  progress: number;
}

/** One immutable snapshot of the run: the stage map, the node states, the counters and the aggregated progress. */
export interface runstageview {
  status: runstatus;
  /** The stage the run stands on (0-based; equals stagecount when settled). */
  stageindex: number;
  /** The stage waves of the graph (the etapas, stable order). */
  stages: readonly (readonly string[])[];
  /** The state of every node of the graph. */
  nodestates: Readonly<Record<string, nodestate>>;
  /** How many nodes settled done. */
  donecount: number;
  /** How many nodes settled failed. */
  failedcount: number;
  /** How many nodes settled skipped (stranded by a failure). */
  skippedcount: number;
  /** How many nodes the run walks. */
  totalcount: number;
  /** The aggregated progress (0..100): the done share of the walk. */
  progress: number;
  /** The failure that stranded the run (status failed only). */
  failure?: { nodeid: string; message: string };
}

/** The options of one run: the caller injects the work, the cadence and the callbacks. */
export interface runneroptions {
  /** The work of one node — sync or async; absent, the node just passes. */
  handler?: (node: graphnode) => void | Promise<void>;
  /** The extra attempts after the first one (0 = run once, the default). */
  retry?: number;
  /** The pause in ms between stages — the caller's cadence, injected (0 by default). */
  stagegap?: number;
  /** The view callback: every state transition answers one fresh snapshot. */
  onview?: (view: runstageview) => void;
  /** The event callback: every transition answers one event, in run order. */
  onevent?: (event: runevent) => void;
}

/** One staged runner over one graph: the view reads anytime, run walks the stages. */
export interface graphrunner {
  /** The graph the runner walks (as given). */
  readonly graph: nodegraph;
  /** The options the run rides (as given). */
  readonly options: runneroptions;
  /** Reads the current snapshot without touching the run. */
  view(): runstageview;
  /** Walks the stages once; a second call on a settled runner answers the settled view unchanged. */
  run(): Promise<runstageview>;
}

/** Counts the settled shares of a state map and answers the aggregated progress (0..100). */
export function viewprogress(nodestates: Readonly<Record<string, nodestate>>): number {
  const ids = Object.keys(nodestates);
  if (ids.length === 0) return 0;
  let done = 0;
  for (const id of ids) {
    if (nodestates[id] === "done") done += 1;
  }
  return Math.round((done / ids.length) * 100);
}

/** Builds the initial view of one graph: every node pending, progress zero, the stages layered and stable. */
export function initialview(graph: nodegraph): runstageview {
  const stages = stagewaves(graph);
  const nodestates: Record<string, nodestate> = {};
  for (const node of graph.nodes) nodestates[node.id] = "pending";
  return {
    status: "idle",
    stageindex: 0,
    stages,
    nodestates,
    donecount: 0,
    failedcount: 0,
    skippedcount: 0,
    totalcount: graph.nodes.length,
    progress: 0,
  };
}

/** Reads the stage index one node rides on a view (0-based), or -1 when the view holds no such node. */
export function stageofnode(view: runstageview, nodeid: string): number {
  for (const [index, wave] of view.stages.entries()) {
    if (wave.includes(nodeid)) return index;
  }
  return -1;
}

/** The pause the engine itself takes: the injected stage gap (never a timer the module owns). */
function pause(milliseconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

/**
 * Creates the staged runner of one graph. The view starts idle with every
 * node pending; run() walks the waves in order — the nodes of a wave one
 * after the other in the stable insertion order, each one retried up to the
 * retry budget, the view and the events answered on every transition. One
 * failure after the last attempt strands the run: the stranded nodes settle
 * skipped, the status settles failed and the failure names the node and the
 * message. Example: `createrunner(graph, { handler, onview: setrunview })`.
 */
export function createrunner(graph: nodegraph, options: runneroptions = {}): graphrunner {
  let current: runstageview = initialview(graph);
  let started = false;
  const emit = (view: runstageview): void => {
    current = view;
    options.onview?.(view);
  };
  const event = (partial: Omit<runevent, "progress">): void => {
    options.onevent?.({ ...partial, progress: current.progress });
  };
  const counts = (nodestates: Readonly<Record<string, nodestate>>) => {
    let donecount = 0;
    let failedcount = 0;
    let skippedcount = 0;
    for (const id of Object.keys(nodestates)) {
      if (nodestates[id] === "done") donecount += 1;
      else if (nodestates[id] === "failed") failedcount += 1;
      else if (nodestates[id] === "skipped") skippedcount += 1;
    }
    return { donecount, failedcount, skippedcount };
  };
  const viewof = (base: Omit<runstageview, "donecount" | "failedcount" | "skippedcount" | "progress" | "totalcount">): runstageview => {
    const tally = counts(base.nodestates);
    return {
      ...base,
      nodestates: { ...base.nodestates },
      ...tally,
      totalcount: graph.nodes.length,
      progress: viewprogress(base.nodestates),
    };
  };
  return {
    graph,
    options,
    view: () => current,
    async run(): Promise<runstageview> {
      if (started) return current;
      started = true;
      const stages = current.stages;
      const nodestates: Record<string, nodestate> = { ...current.nodestates };
      const retry = Math.max(0, Math.floor(options.retry ?? 0));
      const stagegap = Math.max(0, options.stagegap ?? 0);
      emit(viewof({ status: "running", stageindex: 0, stages, nodestates }));
      event({ type: "runbegin", stage: 0 });
      for (const [index, wave] of stages.entries()) {
        emit(viewof({ status: "running", stageindex: index, stages, nodestates }));
        event({ type: "stagebegin", stage: index });
        for (const nodeid of wave) {
          const node = nodebyid(graph, nodeid);
          if (!node) continue;
          nodestates[nodeid] = "running";
          emit(viewof({ status: "running", stageindex: index, stages, nodestates }));
          event({ type: "nodestart", stage: index, nodeid });
          let settled = false;
          let message: string | undefined;
          for (let attempt = 1; attempt <= retry + 1 && !settled; attempt += 1) {
            if (attempt > 1) event({ type: "nodeattempt", stage: index, nodeid, attempt });
            try {
              await options.handler?.(node);
              settled = true;
            } catch (error) {
              message = error instanceof Error ? error.message : String(error);
            }
          }
          if (settled) {
            nodestates[nodeid] = "done";
            emit(viewof({ status: "running", stageindex: index, stages, nodestates }));
            event({ type: "nodedone", stage: index, nodeid });
            continue;
          }
          nodestates[nodeid] = "failed";
          emit(viewof({ status: "running", stageindex: index, stages, nodestates }));
          event({ type: "nodefailed", stage: index, nodeid, attempt: retry + 1, message });
          for (const waveid of stages.slice(index).flat()) {
            if (nodestates[waveid] === "pending" || nodestates[waveid] === "running") {
              nodestates[waveid] = "skipped";
              emit(viewof({ status: "running", stageindex: index, stages, nodestates }));
              event({ type: "nodeskipped", stage: index, nodeid: waveid });
            }
          }
          const failure = { nodeid, message: message ?? "the node failed without a message" };
          const settledview = viewof({ status: "failed", stageindex: stages.length, stages, nodestates, failure });
          emit(settledview);
          event({ type: "stageend", stage: index });
          event({ type: "runend", stage: stages.length });
          return settledview;
        }
        event({ type: "stageend", stage: index });
        if (stagegap > 0 && index < stages.length - 1) await pause(stagegap);
      }
      const settledview = viewof({ status: "done", stageindex: stages.length, stages, nodestates });
      emit(settledview);
      event({ type: "runend", stage: stages.length });
      return settledview;
    },
  };
}

/**
 * Resets one runner view to the idle start (every node pending) — the pure
 * answer for surfaces that rerun the same graph with a fresh runner. Example:
 * `resetview(initialview(graph))` is an identity; the helper exists so the
 * surfaces read one name.
 */
export function resetview(graph: nodegraph): runstageview {
  return initialview(resetnodestates(graph));
}
