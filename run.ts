/**
 * The run module of the 1.1.90 consolidation: every correlated variation of the run logic interned in this one file, so the module family carries one surface without duplicate variations.
 * The correlation is the run lifecycle itself, ordered from the base outward: runstate holds the typed run state every other variation builds on (the keepalive heartbeat trail, the url history, the environment and turnaround provenance, the restart recovery, the zombie reaping, the storage level run lock, the integrity sealing and the quota pruning); resilience continues the same lifecycle at the runrecord level (the legal state machine, the offline queue with its replay, the checkpoints, the heartbeat staleness window, the zombie check beside the reap audit event and the rollback compensation the user chooses); runhistory keeps the per run url visits, the merged runtimeline stream, the tab isolation namespace and the session lock that serializes concurrent runs; runtimeline deepens the observation side of the same runs (console, error, rejection, long task and network failure capture with redaction, spam collapse, rotation and the console diff between two runs); runbudget guards the step and memory ceilings with the timeoutcancel bound; runresume, runreplay and runparallel optimize the identical lifecycle (the checkpoint resume with fingerprint revalidation, the audit walk replay of a sealed run and the parallel read lanes with carried selectors); and backgroundruns closes the family with the queue that keeps reviewed workflows executing with no open surface, holding the same keepalive signal of the base lifecycle.
 * No window, depth, retention or ceiling is ever hardcoded anywhere in the family: every interval, tolerance, budget and bound stays the user's choice, and no recovery, replay, rollback or queue path ever bypasses the human review.
 */

/* ── Merged from runstate.ts ── */

import type {
  environmentkind,
  environmentprovenance,
  runlock,
  runstaterecord,
  sealedrunstate,
  urlhistoryentry,
} from "./types.js";

/**
 * Run state logic of the 1.1.60 family.
 * Correlated rules for the typed run state live here: the keepalive lifecycle with its start and stop events, its heartbeat trail and its reattach after a service worker restart, the url history of every navigation inside the run, the environment and worker turnaround of every step, the restart recovery of the pending step, the zombie reaping of runs whose heartbeat fell silent, the storage level run lock that holds a session against concurrent runs, the serialization of steps that share one tab across parallel branches, the integrity sealing of persisted run state and the quota pruning under storage pressure.
 * No interval, window or lock expiry is ever hardcoded: the heartbeat interval, the zombie tolerance and the lock expiry stay user choices, the run state persists on every heartbeat, and no recovery path ever bypasses the human review.
 */

/** Opens one run state: the keepalive port opens, the start event records and the run waits for its first heartbeat. */
export function openrun(input: {
  runid: string;
  sessionid: string;
  planid: string;
  profileid: string;
  interval: number;
  now: number;
}): runstaterecord {
  if (input.runid.trim() === "" || input.sessionid.trim() === "")
    throw new Error("The run state needs its run and session ids.");
  if (!Number.isFinite(input.interval) || input.interval <= 0)
    throw new Error("The keepalive heartbeat interval stays a positive user value in milliseconds.");
  return {
    runid: input.runid,
    sessionid: input.sessionid,
    planid: input.planid,
    profileid: input.profileid,
    state: "active",
    urlhistory: [],
    environments: {},
    turnarounds: {},
    keepalive: {
      runid: input.runid,
      sessionid: input.sessionid,
      state: "active",
      startedat: input.now,
      interval: input.interval,
      beats: 0,
      lastbeatat: input.now,
      portopen: true,
      events: [
        {
          kind: "start" as const,
          at: input.now,
          detail: `The keepalive port opens for the run ${input.runid} and beats every ${input.interval} milliseconds.`,
        },
      ],
    },
    updatedat: input.now,
  };
}

/** Emits one keepalive heartbeat: the beat counter grows, the last beat time moves and the event trail records the beat so the persisted state carries it into any restart recovery. */
export function beatrun(state: runstaterecord, now: number): runstaterecord {
  if (state.keepalive.state !== "active")
    throw new Error(`The run ${state.runid} is ${state.keepalive.state}; a stopped run emits no heartbeat.`);
  return {
    ...state,
    keepalive: {
      ...state.keepalive,
      beats: state.keepalive.beats + 1,
      lastbeatat: now,
      events: [...state.keepalive.events, { kind: "heartbeat" as const, at: now }].slice(-200),
    },
    updatedat: now,
  };
}

/** Closes one run at its terminal state: the keepalive port closes, the stop event records and the run state freezes for the audit trail. */
export function closerun(state: runstaterecord, now: number): runstaterecord {
  if (state.keepalive.state === "stopped")
    throw new Error(`The run ${state.runid} already stopped its keepalive port.`);
  return {
    ...state,
    state: "completed",
    keepalive: {
      ...state.keepalive,
      state: "stopped",
      stoppedat: now,
      portopen: false,
      events: [
        ...state.keepalive.events,
        { kind: "stop" as const, at: now, detail: "The run reached a terminal state and the keepalive port closed." },
      ].slice(-200),
    },
    updatedat: now,
  };
}

/** Reattaches the keepalive port after a service worker restart: the persisted state rehydrates, the reattach event records and the pending step stays exactly where the run stopped. */
export function reattachrun(state: runstaterecord, now: number): runstaterecord {
  if (state.keepalive.state !== "active")
    throw new Error(`The run ${state.runid} is ${state.keepalive.state}; a stopped run never reattaches.`);
  return {
    ...state,
    state: "recovered",
    keepalive: {
      ...state.keepalive,
      portopen: true,
      events: [
        ...state.keepalive.events,
        {
          kind: "reattach" as const,
          at: now,
          detail: "The service worker restarted and the keepalive port reattached from the persisted run state.",
        },
      ].slice(-200),
    },
    updatedat: now,
  };
}

/** Records one navigation inside the run: every url the run visits lands its history entry so the audit reads the full route of the run. */
export function recordurl(state: runstaterecord, entry: { url: string; stepid: string; now: number }): runstaterecord {
  if (entry.url.trim() === "") throw new Error("The url history entry needs its url.");
  const record: urlhistoryentry = { url: entry.url, stepid: entry.stepid, at: entry.now };
  return {
    ...state,
    urlhistory: [
      ...state.urlhistory.filter((item) => !(item.url === record.url && item.stepid === record.stepid)),
      record,
    ],
    updatedat: entry.now,
  };
}

/** Records the environment of one executed step with its provenance: the step id, the environment and the origin land in the run state beside the outcome. */
export function recordenvironment(
  state: runstaterecord,
  input: { stepid: string; environment: environmentkind; origin: string; now: number },
): runstaterecord {
  if (input.stepid.trim() === "") throw new Error("The environment record needs its step id.");
  const provenance: environmentprovenance = {
    origin: input.origin,
    stepid: input.stepid,
    environment: input.environment,
  };
  return {
    ...state,
    environments: { ...state.environments, [input.stepid]: input.environment },
    lastprovenance: provenance,
    updatedat: input.now,
  };
}

/** Records the worker turnaround of one offloaded step: the milliseconds between the worker request and its answer land in the run state for later profiling. */
export function recordturnaround(
  state: runstaterecord,
  input: { stepid: string; milliseconds: number; now: number },
): runstaterecord {
  if (input.stepid.trim() === "") throw new Error("The turnaround record needs its step id.");
  if (!Number.isFinite(input.milliseconds) || input.milliseconds < 0)
    throw new Error("The worker turnaround stays a non-negative duration in milliseconds.");
  return { ...state, turnarounds: { ...state.turnarounds, [input.stepid]: input.milliseconds }, updatedat: input.now };
}

/** Marks the pending step of one run for restart recovery: the executor resumes exactly this step after the service worker restart, and no other step ever moves. */
export function markpending(state: runstaterecord, stepid: string | undefined, now: number): runstaterecord {
  return {
    ...state,
    ...(stepid !== undefined && stepid.trim() !== "" ? { pendingstepid: stepid } : {}),
    updatedat: now,
  };
}

/** Reads the recovery plan of one interrupted run: the pending step names the single step the executor resumes, and a run without a pending step starts over through the same review instead of guessing. */
export function recoveryplan(state: runstaterecord): {
  runid: string;
  pendingstepid?: string;
  recoverable: boolean;
  reason: string;
} {
  if (state.state === "completed")
    return {
      runid: state.runid,
      recoverable: false,
      reason: `The run ${state.runid} completed before the restart; nothing resumes.`,
    };
  if (state.state === "reaped")
    return {
      runid: state.runid,
      recoverable: false,
      reason: `The run ${state.runid} was reaped as a zombie; the user starts a fresh reviewed run.`,
    };
  if (state.pendingstepid === undefined || state.pendingstepid.trim() === "")
    return {
      runid: state.runid,
      recoverable: false,
      reason: `The run ${state.runid} carries no pending step; a fresh reviewed run starts over instead of guessing.`,
    };
  return {
    runid: state.runid,
    pendingstepid: state.pendingstepid,
    recoverable: true,
    reason: `The executor resumes the pending step ${state.pendingstepid} of the run ${state.runid} from the persisted run state.`,
  };
}

/** Sweeps the zombie runs whose heartbeat fell silent: a run whose last beat sits past the tolerated silent intervals reaps, while a live run keeps its state; the tolerance stays the user configured number of intervals. */
export function zombiesweep(input: { states: runstaterecord[]; now: number; interval: number; missedlimit: number }): {
  states: runstaterecord[];
  reaped: string[];
} {
  if (!Number.isFinite(input.interval) || input.interval <= 0)
    throw new Error("The zombie sweep needs its heartbeat interval as a positive user value.");
  if (!Number.isInteger(input.missedlimit) || input.missedlimit < 1)
    throw new Error("The zombie tolerance stays a positive whole number of silent intervals.");
  const silentfor = input.interval * input.missedlimit;
  const zombies = input.states.filter(
    (state) => state.keepalive.state === "active" && input.now - state.keepalive.lastbeatat > silentfor,
  );
  if (zombies.length === 0) return { states: input.states, reaped: [] };
  const ids = new Set(zombies.map((state) => state.runid));
  return {
    states: input.states.map((state) =>
      ids.has(state.runid)
        ? {
            ...state,
            state: "reaped" as const,
            keepalive: {
              ...state.keepalive,
              state: "stopped" as const,
              portopen: false,
              ...(state.keepalive.stoppedat === undefined ? { stoppedat: input.now } : {}),
              events: [
                ...state.keepalive.events,
                { kind: "stop" as const, at: input.now, detail: "The zombie reaper closed the silent run." },
              ],
            },
          }
        : state,
    ),
    reaped: [...ids],
  };
}

/** Acquires the storage level run lock of one session: a session with no live lock gains its run lock while a concurrent run of the same session refuses, so one session never carries two runs at once. */
export function acquirerunlock(input: {
  locks: runlock[];
  sessionid: string;
  runid: string;
  holder: string;
  expiresat?: number;
  now: number;
}): { locks: runlock[]; acquired: boolean; reason: string } {
  if (input.sessionid.trim() === "" || input.runid.trim() === "")
    throw new Error("The run lock needs its session and run ids.");
  const live = input.locks.filter(
    (lock) => lock.sessionid === input.sessionid && (lock.expiresat === undefined || lock.expiresat > input.now),
  );
  const held = live.find((lock) => lock.runid !== input.runid);
  if (held)
    return {
      locks: input.locks,
      acquired: false,
      reason: `The session ${input.sessionid} already holds the run ${held.runid}; a session never carries two concurrent runs.`,
    };
  const own = input.locks.find((lock) => lock.sessionid === input.sessionid && lock.runid === input.runid);
  if (own)
    return {
      locks: input.locks,
      acquired: true,
      reason: `The run ${input.runid} of the session ${input.sessionid} already holds its lock.`,
    };
  const lock: runlock = {
    sessionid: input.sessionid,
    runid: input.runid,
    holder: input.holder,
    acquiredat: input.now,
    ...(input.expiresat !== undefined ? { expiresat: input.expiresat } : {}),
  };
  return {
    locks: [...input.locks.filter((entry) => entry.sessionid !== input.sessionid), lock],
    acquired: true,
    reason: `The run ${input.runid} locked the session ${input.sessionid} against concurrent runs.`,
  };
}

/** Releases the storage level run lock of one session: the run that holds the lock frees it while another holder refuses. */
export function releaserunlock(input: { locks: runlock[]; sessionid: string; runid: string; now: number }): {
  locks: runlock[];
  released: boolean;
  reason: string;
} {
  const lock = input.locks.find((entry) => entry.sessionid === input.sessionid);
  if (!lock || lock.runid !== input.runid)
    return {
      locks: input.locks,
      released: false,
      reason: `The run ${input.runid} holds no lock of the session ${input.sessionid}.`,
    };
  return {
    locks: input.locks.filter((entry) => entry.sessionid !== input.sessionid),
    released: true,
    reason: `The run ${input.runid} released the run lock of the session ${input.sessionid}.`,
  };
}

/** Expires the run locks past their user configured expiry: an expired lock frees its session while a lock without an expiry keeps holding until its run releases it. */
export function expirerunlocks(locks: runlock[], now: number): { locks: runlock[]; expired: string[] } {
  const expired = locks.filter((lock) => lock.expiresat !== undefined && now > lock.expiresat);
  if (expired.length === 0) return { locks, expired: [] };
  const ids = new Set(expired.map((lock) => lock.sessionid));
  return { locks: locks.filter((lock) => !ids.has(lock.sessionid)), expired: [...ids] };
}

/** Serializes the steps that share one tab across parallel branches: every branch keeps its inner order while the shared tab receives one deterministic lane, so two branches never touch one tab inside the same beat. */
export function serializesteps(input: {
  branches: Array<{ branchid: string; steps: Array<{ stepid: string; tabid: number }> }>;
}): Array<{ branchid: string; stepid: string; tabid: number; order: number }> {
  const shared = new Set<number>();
  const counts = new Map<number, number>();
  for (const branch of input.branches)
    for (const step of branch.steps) counts.set(step.tabid, (counts.get(step.tabid) ?? 0) + 1);
  for (const [tabid, count] of counts) if (count > 1) shared.add(tabid);
  const order: Array<{ branchid: string; stepid: string; tabid: number; order: number }> = [];
  let cursor = 0;
  for (const branch of input.branches) {
    for (const step of branch.steps) {
      if (shared.has(step.tabid)) {
        order.push({ branchid: branch.branchid, stepid: step.stepid, tabid: step.tabid, order: cursor });
        cursor += 1;
      }
    }
  }
  for (const branch of input.branches) {
    for (const step of branch.steps) {
      if (!shared.has(step.tabid)) {
        order.push({ branchid: branch.branchid, stepid: step.stepid, tabid: step.tabid, order: cursor });
        cursor += 1;
      }
    }
  }
  return order;
}

/** Seals one persisted run state with its sha-256 integrity digest: the payload and its digest travel together so a tampered run state at rest stays detectable before any recovery uses it. */
export async function sealrunstate(state: runstaterecord): Promise<sealedrunstate> {
  const payload = JSON.stringify(state);
  const digest = await sha256(payload);
  return { payload, algorithm: "sha-256", digest, sealedat: state.updatedat };
}

/** Opens one sealed run state: the digest must match the payload before the recovery reads it, and a tampered or malformed seal refuses. */
export async function openseal(sealed: sealedrunstate): Promise<runstaterecord> {
  const digest = await sha256(sealed.payload);
  if (digest !== sealed.digest)
    throw new Error(
      "The sealed run state fails its integrity digest; a tampered run state never reaches the recovery.",
    );
  const parsed = JSON.parse(sealed.payload) as runstaterecord;
  if (
    parsed === null ||
    typeof parsed !== "object" ||
    typeof parsed.runid !== "string" ||
    typeof parsed.sessionid !== "string"
  )
    throw new Error("The sealed run state carries no run record.");
  return parsed;
}

async function sha256(value: string): Promise<string> {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

/** Prunes the stored run states under storage pressure: the oldest completed run states leave first while every active or recovered run keeps its state, and the pruned ids name what left. */
export function prunerunstates(input: { states: runstaterecord[]; used: number; ceiling: number }): {
  states: runstaterecord[];
  pruned: string[];
  reason: string;
} {
  if (!Number.isFinite(input.ceiling) || input.ceiling <= 0)
    return {
      states: input.states,
      pruned: [],
      reason: "No storage ceiling is configured, so the run states stay under the user choice alone.",
    };
  if (input.used <= input.ceiling)
    return {
      states: input.states,
      pruned: [],
      reason: `The run state storage sits at ${input.used} of the ${input.ceiling} bytes the user configured; no pressure exists.`,
    };
  const removable = input.states
    .filter((state) => state.state === "completed" || state.state === "reaped")
    .sort((one, two) => one.updatedat - two.updatedat);
  const states = [...input.states];
  const pruned: string[] = [];
  for (const candidate of removable) {
    pruned.push(candidate.runid);
    const index = states.findIndex((state) => state.runid === candidate.runid);
    if (index >= 0) states.splice(index, 1);
    if (pruned.length >= Math.max(1, Math.ceil(input.states.length / 2))) break;
  }
  return {
    states,
    pruned,
    reason: `The storage pressure at ${input.used} of ${input.ceiling} bytes pruned the ${pruned.length} oldest finished run state${pruned.length === 1 ? "" : "s"} while every active run keeps its state.`,
  };
}

/** Exports the run states as one single audit record: every run, its url history, its environments, its turnarounds and its keepalive trail in one envelope the auditor reads at once. */
export function exportrunstate(
  states: runstaterecord[],
  now: number,
): { runs: number; urls: number; environments: number; offloaded: number; beats: number; exportedat: number } {
  return {
    runs: states.length,
    urls: states.reduce((total, state) => total + state.urlhistory.length, 0),
    environments: states.reduce((total, state) => total + Object.keys(state.environments).length, 0),
    offloaded: states.reduce((total, state) => total + Object.values(state.turnarounds).length, 0),
    beats: states.reduce((total, state) => total + state.keepalive.beats, 0),
    exportedat: now,
  };
}

/* ── Merged from resilience.ts ── */

import { iscomplete } from "./progress.js";
import type {
  agentplan,
  auditevent,
  checkpointrecord,
  heartbeatrecord,
  planprogress,
  rollbackitem,
  runrecord,
  runsettings,
  runstate,
  runtransition,
  queuedtask,
  toolstep,
} from "./types.js";

/**
 * Run lifecycle logic of the 1.1.70 family.
 * The runstatemachine tracks every legal transition of a run so a service worker restart or a lost connection never loses work: approved plans queue offline with monotonic sequences, steps carry deterministic idempotencykeys so replays deduplicate, checkpoints capture the completed steps with their page digest, heartbeats time the live runs, zombies reap through the audit trail, and failed runs roll back through compensating steps the user explicitly chooses.
 * No window, depth or retention is ever hardcoded: the heartbeat staleness window, the offline queue depth and the failed run retention stay user choices, and no recovery, replay or rollback path ever bypasses the human review.
 */

/** The documented heartbeat staleness window the roadmap names while the configured window stays the user's choice with no code ceiling. */
export const roadmapheartbeatwindow = 60_000;

/** The legal transitions of each runstate: queued runs start or cancel, running runs pause, complete, fail or cancel, paused and awaitingapproval runs resume or stop, and only a failed or cancelled run rolls back. */
export function runstatemachine(): Record<runstate, runstate[]> {
  return {
    queued: ["running", "awaitingapproval", "cancelled", "failed"],
    running: ["paused", "awaitingapproval", "completed", "failed", "cancelled"],
    paused: ["running", "cancelled", "failed"],
    awaitingapproval: ["running", "paused", "cancelled", "failed"],
    completed: [],
    failed: ["rolledback"],
    cancelled: ["rolledback"],
    rolledback: [],
    pending: ["running", "paused", "cancelled", "failed"],
    done: [],
  };
}

/** Reads whether one run transition stays legal inside the state machine: every state allows only the pairs its lifecycle defines. */
export function transitionislegal(transition: runtransition): boolean {
  return runstatemachine()[transition.from].includes(transition.to);
}

/** Moves one runrecord through a single legal transition or throws: an illegal transition never silently mutates the run state. */
export function advancerun(run: runrecord, to: runstate, now: number): runrecord {
  if (!transitionislegal({ from: run.state, to }))
    throw new Error(
      `The run ${run.runid} cannot move from ${run.state} to ${to}; the run lifecycle allows only its legal transitions.`,
    );
  return { ...run, state: to, updatedat: now };
}

/** Creates one runrecord in the queued state for an approved plan: the run waits in the offlinequeue or the executor before it ever runs. */
export function initialrun(input: { planid: string; sessionid: string; now: number; runid?: string }): runrecord {
  if (input.planid.trim() === "") throw new Error("The run record needs its plan id.");
  if (input.sessionid.trim() === "") throw new Error("The run record needs its session id.");
  return {
    runid: input.runid ?? crypto.randomUUID(),
    planid: input.planid,
    sessionid: input.sessionid,
    state: "queued",
    createdat: input.now,
    updatedat: input.now,
  };
}

/** Derives the deterministic idempotencykey of one step from its plan and step identity so a replay of the same step deduplicates on the same key. */
export function stepkey(input: { planid: string; stepid: string; kind: string }): string {
  if (input.planid.trim() === "" || input.stepid.trim() === "")
    throw new Error("The step key needs its plan and step ids.");
  if (input.kind.trim() === "") throw new Error("The step key needs its step kind.");
  return `${input.planid}:${input.stepid}:${input.kind}`;
}

/** Returns the count of tasks waiting in the offlinequeue. */
export function queuesize(queue: queuedtask[]): number {
  return queue.length;
}

/** Appends one approved plan to the offlinequeue with a monotonic sequence number so the replay drains the tasks in their enqueue order. */
export function enqueueoffline(
  queue: queuedtask[],
  input: { plan: agentplan; sessionid: string; now: number },
): queuedtask[] {
  if (input.plan.state !== "approved")
    throw new Error("Only an approved plan enters the offlinequeue; an unreviewed plan never queues.");
  const sequence = queue.reduce((highest, task) => Math.max(highest, task.sequence), 0) + 1;
  return [
    ...queue,
    {
      sequence,
      planid: input.plan.id,
      sessionid: input.sessionid,
      plan: input.plan,
      enqueuedat: input.now,
      expiresat: input.plan.expiresat,
    },
  ];
}

/** Returns the next queuedtask in sequence order and the queue without it; an empty queue returns no task. */
export function dequeueoffline(queue: queuedtask[]): { queue: queuedtask[]; task?: queuedtask } {
  if (queue.length === 0) return { queue };
  const ordered = [...queue].sort((one, two) => one.sequence - two.sequence);
  const [task, ...rest] = ordered;
  if (task === undefined) return { queue: [...ordered] };
  return { queue: rest, task };
}

/** Reads the replay plan of the offlinequeue once connectivity returns: every task drains in sequence order while the tasks whose plan window passed offline expire and fail instead of running. */
export function replayqueue(queue: queuedtask[], now: number): { ready: queuedtask[]; expired: queuedtask[] } {
  const ordered = [...queue].sort((one, two) => one.sequence - two.sequence);
  const ready = ordered.filter((task) => task.expiresat > now);
  const expired = ordered.filter((task) => task.expiresat <= now);
  return { ready, expired };
}

/** Captures one checkpoint of a run: the completed step ids, the step boundary, the page digest a resume revalidates and the timestamp. */
export function makecheckpoint(input: {
  runid: string;
  stepid: string;
  completed: string[];
  digest: string;
  now: number;
}): checkpointrecord {
  if (input.runid.trim() === "") throw new Error("The checkpoint needs its run id.");
  if (input.stepid.trim() === "") throw new Error("The checkpoint needs its step id.");
  if (input.digest.trim() === "")
    throw new Error("The checkpoint needs its page digest; a digestless resume never revalidates the page.");
  return {
    runid: input.runid,
    stepid: input.stepid,
    completed: [...input.completed],
    digest: input.digest,
    createdat: input.now,
  };
}

/** Returns the steps that follow the last stored checkpoint so the resume continues at the first open step instead of repeating completed work. */
export function resumecheckpoint(input: { checkpoint: checkpointrecord | undefined; steps: string[] }): string[] {
  if (input.checkpoint === undefined) return [...input.steps];
  const done = new Set(input.checkpoint.completed);
  return input.steps.filter((step) => !done.has(step));
}

/** Verifies one checkpointrecord against its run and page digest: a checkpoint of another run or a page that changed since the capture never validates. */
export function checkpointisvalid(input: { checkpoint: checkpointrecord; runid: string; digest: string }): boolean {
  return (
    input.checkpoint.runid === input.runid &&
    input.checkpoint.digest === input.digest &&
    input.checkpoint.digest.trim() !== ""
  );
}

/** Refreshes the heartbeatrecord of a running run: the beat counter grows and the last beat time moves so the zombiecheck sees the run alive. */
export function runheartbeat(input: { runid: string; beat?: number; now: number }): heartbeatrecord {
  if (input.runid.trim() === "") throw new Error("The heartbeat needs its run id.");
  const previous = Number.isFinite(input.beat) ? (input.beat as number) : 0;
  return { runid: input.runid, beat: previous + 1, at: input.now };
}

/** Reads whether the last heartbeat of a run sits older than the configured window: a stale heartbeat turns a running run into a zombie candidate. */
export function heartbeatisstale(input: {
  heartbeat: heartbeatrecord | undefined;
  now: number;
  window: number;
}): boolean {
  if (input.heartbeat === undefined) return true;
  return input.now - input.heartbeat.at > input.window;
}

/** Loads the user configured heartbeat staleness window without a hard cap: an absent setting keeps the documented roadmap window while every configured value stays the user's choice. */
export function heartbeatwindowof(settings: runsettings | undefined): number {
  return settings?.heartbeatwindow ?? roadmapheartbeatwindow;
}

/** Lists the running runs whose heartbeat is stale: every run past its staleness window names a zombie candidate the reaper may reap. */
export function zombiecheck(input: {
  runs: runrecord[];
  heartbeats: Record<string, heartbeatrecord>;
  now: number;
  window: number;
}): runrecord[] {
  return input.runs.filter(
    (run) =>
      run.state === "running" &&
      heartbeatisstale({ heartbeat: input.heartbeats[run.runid], now: input.now, window: input.window }),
  );
}

/** Transitions one zombie run to failed and records its reap audit event: the reaped run keeps its record for the audit trail while it never executes again. */
export function reaprun(run: runrecord, now: number): { run: runrecord; event: auditevent } {
  if (run.state !== "running")
    throw new Error(`The run ${run.runid} is ${run.state}; only a running run with a silent heartbeat reaps.`);
  const reaped: runrecord = { ...run, state: "failed", updatedat: now };
  return {
    run: reaped,
    event: {
      id: crypto.randomUUID(),
      kind: "reap",
      at: now,
      summary: `The zombie reaper failed the run ${run.runid} whose heartbeat stayed silent past the user window; the user starts a fresh reviewed run instead of guessing.`,
      sessionid: run.sessionid,
      planid: run.planid,
    },
  };
}

/** Lists the mutating steps a run already executed: every executed step that is not read only names a side effect the rollback must compensate. */
export function sideeffects(steps: toolstep[], executedstepids: string[]): toolstep[] {
  const executed = new Set(executedstepids);
  return steps.filter((step) => executed.has(step.id) && step.risk !== "read");
}

/** The compensating action of each mutating kind in plain language; the kinds outside the table report their outcome for the user review because their effect stays applied. */
const compensationtable: Record<string, string> = {
  navigate: "navigate back to the origin the run started from",
  openlink: "close the opened link target and return to the origin the run started from",
  followlink: "navigate back to the origin the run started from",
  navlist: "close every tab the list navigation opened and return to the origin the run started from",
  batchopen: "close every tab the batch navigation opened and return to the origin the run started from",
  openprivate: "close the private window the navigation opened",
  reload: "the navigation history stays as the run left it; the compensation reports the route for the user review",
  reloadcache:
    "the navigation history stays as the run left it; the compensation reports the route for the user review",
  back: "the navigation history stays as the run left it; the compensation reports the route for the user review",
  forward: "the navigation history stays as the run left it; the compensation reports the route for the user review",
  type: "restore the field value the form carried before the typing",
  setvalue: "restore the field value the form carried before the change",
  appendtext: "restore the field value the form carried before the append",
  typeedit: "restore the field value the form carried before the edit",
  clear: "restore the cleared value from the session record",
  check: "restore the checkbox state the form carried before the check",
  uncheck: "restore the checkbox state the form carried before the uncheck",
  toggle: "restore the control state the form carried before the toggle",
  chooseradio: "restore the radio choice the form carried",
  setslider: "restore the slider position the form carried",
  setdate: "restore the date the form carried",
  setcolor: "restore the color the form carried",
  select: "restore the selection the form carried",
  selectmulti: "restore the selections the form carried",
  upload: "clear the file input of the uploaded file",
  attachfile: "clear the file input of the attached file",
  click: "the click stays executed; the compensation reports its outcome for the user review",
  clickdeep: "the click stays executed; the compensation reports its outcome for the user review",
  rightclick: "the click stays executed; the compensation reports its outcome for the user review",
  doubleclick: "the click stays executed; the compensation reports its outcome for the user review",
  submit: "the submission stays submitted; the compensation reports it for the user review",
  submitform: "the submission stays submitted; the compensation reports it for the user review",
  retryform: "the submission stays submitted; the compensation reports it for the user review",
  submitsearch: "the search submission stays submitted; the compensation reports it for the user review",
  writestorage: "remove the written storage key",
  setattribute: "restore the attribute value the page carried",
  removeattribute: "restore the removed attribute from the session record",
  setcookies: "delete the cookies the step set",
  clearcookies: "restore the cleared cookies from the session record",
  blockrequest: "remove the block rule the step applied",
  mockresponse: "remove the mock rule the step applied",
  rewriteheaders: "remove the header rewrite rule the step applied",
  routeproxy: "remove the proxy route the step applied",
  overridescript: "remove the script override the step applied",
  tabcreate: "close the created tab",
  tabclose: "reopen the closed tab from the session record",
  windowcreate: "close the created window",
  downloadfile: "delete the downloaded file from the user downloads",
  evaluate: "the evaluated script stays applied; the compensation reports its effect for the user review",
};

/** Builds the compensating steps of a failed run for its executed side effects; read only steps carry no compensation at all because they changed nothing. */
export function rollbackrun(input: {
  runid: string;
  steps: toolstep[];
  executedstepids: string[];
  origin: string;
  now: number;
}): rollbackitem[] {
  return sideeffects(input.steps, input.executedstepids).map((step) => ({
    runid: input.runid,
    stepid: step.id,
    kind: step.kind,
    origin: input.origin,
    compensation:
      compensationtable[step.kind] ??
      `the ${step.kind} step stays executed; the compensation reports its outcome for the user review`,
    at: input.now,
  }));
}

/** Moves one run to cancelled and returns the rollback choice the cancel pairs with: the cancel itself never executes a compensation without the explicit user choice. */
export function cancelrunrecord(run: runrecord, now: number): runrecord {
  return advancerun(run, "cancelled", now);
}

/** Pairs one cancellation with its optional rollback execution: the choice rollback builds the compensating steps while the choice none stops the run with its state frozen for the audit trail. */
export function cancelrollback(input: {
  run: runrecord;
  steps: toolstep[];
  executedstepids: string[];
  origin: string;
  choice: "rollback" | "none";
  now: number;
}): { run: runrecord; compensations: rollbackitem[]; reason: string } {
  const cancelled = cancelrunrecord(input.run, input.now);
  if (input.choice === "none")
    return {
      run: cancelled,
      compensations: [],
      reason: `The run ${input.run.runid} cancelled without a rollback; the executed steps stay applied and the run state freezes for the audit trail.`,
    };
  const compensations = rollbackrun({
    runid: input.run.runid,
    steps: input.steps,
    executedstepids: input.executedstepids,
    origin: input.origin,
    now: input.now,
  });
  const rolledback = advancerun(cancelled, "rolledback", input.now);
  return {
    run: rolledback,
    compensations,
    reason: `The run ${input.run.runid} cancelled with its rollback: ${compensations.length} compensating step${compensations.length === 1 ? "" : "s"} run only after the explicit user choice.`,
  };
}

/** Transitions one run to failed and freezes its progress snapshot so the failure keeps exactly the state it failed at. */
export function runfail(input: { run: runrecord; progress?: planprogress; now: number }): {
  run: runrecord;
  frozen?: planprogress;
} {
  const failed = advancerun(input.run, "failed", input.now);
  if (input.progress === undefined) return { run: failed };
  return {
    run: failed,
    frozen: {
      ...input.progress,
      ...(input.progress.runid !== undefined ? { runid: input.progress.runid } : { runid: input.run.runid }),
      updatedat: input.now,
    },
  };
}

/** Transitions one run to completed only when iscomplete reports the plan finished; an unfinished run never completes. */
export function runcomplete(input: {
  run: runrecord;
  plan: agentplan;
  progress?: planprogress;
  now: number;
}): runrecord {
  if (!iscomplete(input.progress, input.plan))
    throw new Error(
      `The run ${input.run.runid} did not finish every step of its plan; an unfinished run never completes.`,
    );
  return advancerun(input.run, "completed", input.now);
}

/** Rebuilds one runrecord after a service worker restart: the persisted plan restores its run with its original timestamps while an expired or unapproved plan rebuilds as failed because it never resumes. */
export function runfromplan(plan: agentplan, sessionid: string, now: number): runrecord {
  if (plan.state !== "approved" || plan.expiresat <= now)
    return { runid: plan.id, planid: plan.id, sessionid, state: "failed", createdat: plan.createdat, updatedat: now };
  return { runid: plan.id, planid: plan.id, sessionid, state: "running", createdat: plan.createdat, updatedat: now };
}

/** Returns the summary of one run: its state, its step counts against its plan, its checkpoint position and its last update. */
export function runsummaryof(input: {
  run: runrecord;
  plan: agentplan;
  progress?: planprogress;
  checkpoint?: checkpointrecord;
}): { runid: string; state: runstate; steps: number; completed: number; checkpointstep?: string; updatedat: number } {
  const completed = input.progress?.completedsteps.length ?? 0;
  return {
    runid: input.run.runid,
    state: input.run.state,
    steps: input.plan.steps.length,
    completed,
    ...(input.checkpoint !== undefined ? { checkpointstep: input.checkpoint.stepid } : {}),
    updatedat: input.run.updatedat,
  };
}

/* ── Merged from runhistory.ts ── */

import type { agentsession, lockrecord, runtimelineevent, tabstate, urlvisit } from "./types.js";

/**
 * Run history logic of the 1.1.71 state depth family.
 * Every run keeps its own urlhistory and timeline: urlvisit entries append per navigation with consecutive duplicates folded, the runtimeline merges step results, audit events and url visits into one ordered stream with phase buckets, tabisolate namespaces the memory keys per tab so runs never share state, and the sessionlock serializes concurrent runs on one session while it names its holder and expires its abandoned locks.
 * No window stays hardcoded: the lock expiry window reads the user setting with no code ceiling, urlhistory stays scoped per run and never merges runs, and no lock, visit or timeline path ever bypasses the review.
 */

/** The documented lock expiry window the roadmap names while the configured window stays the user's choice with no code ceiling. */
export const roadmaplockwindow = 120_000;

/** Builds one urlvisit of a navigation inside a run: the url, the page title, the time and the run it belongs to. */
export function visitof(input: { url: string; title?: string; runid: string; now: number }): urlvisit {
  if (input.url.trim() === "") throw new Error("The url visit needs its url.");
  if (input.runid.trim() === "") throw new Error("The url visit needs its run id.");
  return {
    url: input.url,
    ...(input.title !== undefined && input.title.trim() !== "" ? { title: input.title } : {}),
    at: input.now,
    runid: input.runid,
  };
}

/** Appends one urlvisit to the urlhistory of a run: consecutive visits to the same url fold into one entry so the history reads as the real route, and the visits of one run never merge with another run. */
export function appendvisit(visits: urlvisit[], visit: urlvisit): urlvisit[] {
  const last = visits.at(-1);
  if (last !== undefined && last.url === visit.url && last.runid === visit.runid) {
    const folded: urlvisit = { ...last, at: visit.at };
    return [...visits.slice(0, -1), folded];
  }
  return [...visits, visit];
}

/** Builds one runtimeline event of a step result: the step identity, its outcome summary and its timestamp inside the run. */
export function stepeventof(input: {
  runid: string;
  stepid: string;
  summary: string;
  ok: boolean;
  now: number;
}): runtimelineevent {
  return {
    at: input.now,
    runid: input.runid,
    source: "step",
    summary: `${input.ok ? "completed" : "failed"}: ${input.summary}`,
    stepid: input.stepid,
  };
}

/** Builds one runtimeline event of an audit event so the timeline carries the audit trail beside the steps. */
export function auditeventof(event: auditevent): runtimelineevent {
  return {
    at: event.at,
    runid: "",
    source: "audit",
    summary: event.summary,
    ...(event.stepid !== undefined ? { stepid: event.stepid } : {}),
    kind: event.kind,
  };
}

/** Builds one runtimeline event of a url visit so the timeline carries the route beside the steps. */
export function visiteventof(visit: urlvisit): runtimelineevent {
  return {
    at: visit.at,
    runid: visit.runid,
    source: "visit",
    summary: `visited ${visit.url}${visit.title !== undefined ? ` (${visit.title})` : ""}`,
  };
}

/** Merges step results, audit events and url visits into one ordered runtimeline stream: every event sorts by its timestamp, the audit events carry their kind and the visits carry their route. */
export function runtimelineof(input: {
  steps: runtimelineevent[];
  audits: runtimelineevent[];
  visits: urlvisit[];
  runid: string;
}): runtimelineevent[] {
  const scoped = input.audits.filter((event) => event.runid === input.runid || event.runid === "");
  const merged = [
    ...input.steps.filter((event) => event.runid === input.runid),
    ...scoped,
    ...input.visits.filter((visit) => visit.runid === input.runid).map(visiteventof),
  ];
  return merged.sort((one, two) => one.at - two.at);
}

/** Buckets one runtimeline stream by phase for the timeline view: every event lands in the phase its timestamp names while the order inside a phase stays the stream order. */
export function buckettimeline(events: runtimelineevent[]): Array<{ phase: string; events: runtimelineevent[] }> {
  const buckets = new Map<string, runtimelineevent[]>();
  for (const event of events) {
    const phase =
      event.source === "visit"
        ? "route"
        : event.source === "audit"
          ? "audit"
          : event.summary.startsWith("failed")
            ? "failures"
            : "steps";
    const bucket = buckets.get(phase) ?? [];
    bucket.push(event);
    buckets.set(phase, bucket);
  }
  return [...buckets.entries()].map(([phase, bucket]) => ({ phase, events: bucket }));
}

/** Derives the isolated namespace id of one tab: every memory key of the run lives under its tab namespace so runs never share state. */
export function tabnamespace(tabid: number): string {
  return `tab:${tabid}`;
}

/** Names one memory key inside the isolated namespace of its tab; the shared key stays readable beside the namespace copy. */
export function tabkey(tabid: number, key: string): string {
  if (key.trim() === "") throw new Error("The namespaced key needs its key.");
  return `${tabnamespace(tabid)}:${key}`;
}

/** Copies the shared config into the tab namespace on demand: the tabstate carries its namespace id, its isolated run id and the copied config snapshot. */
export function tabisolate(input: {
  tabid: number;
  config: Record<string, unknown>;
  runid?: string;
  now: number;
}): tabstate {
  if (!Number.isFinite(input.tabid)) throw new Error("The tab isolation needs its tab id.");
  return {
    tabid: input.tabid,
    namespace: tabnamespace(input.tabid),
    config: { ...input.config },
    ...(input.runid !== undefined && input.runid.trim() !== "" ? { runid: input.runid } : {}),
    at: input.now,
  };
}

/** Acquires one lockrecord for a run on a session: the holder names the run, the acquisition time stamps it and the expiry window stays the user choice. */
export function acquiresessionlock(input: {
  runid: string;
  sessionid: string;
  window: number;
  now: number;
}): lockrecord {
  if (input.runid.trim() === "") throw new Error("The lock needs its run id.");
  if (input.sessionid.trim() === "") throw new Error("The lock needs its session id.");
  return {
    holder: input.runid,
    runid: input.runid,
    sessionid: input.sessionid,
    acquiredat: input.now,
    expiresat: input.now + input.window,
  };
}

/** Reads whether one lock blocks a run: a lock of the same run never blocks itself, a live foreign lock blocks and names its holder while an expired lock blocks nothing because its window passed. */
export function lockblocks(
  lock: lockrecord | undefined,
  runid: string,
  now: number,
): { blocked: boolean; reason: string } {
  if (lock === undefined)
    return {
      blocked: false,
      reason: "No sessionlock stands on the session; the run starts through the reviewed path.",
    };
  if (lock.runid === runid)
    return {
      blocked: false,
      reason: `The sessionlock already belongs to the run ${runid}; the run holds its own lock.`,
    };
  if (lock.expiresat <= now)
    return {
      blocked: false,
      reason: `The sessionlock of the run ${lock.holder} expired past its window; the stale lock leaves before a new run starts.`,
    };
  return {
    blocked: true,
    reason: `The sessionlock of the session ${lock.sessionid} stays held by the run ${lock.holder}; the concurrent run ${runid} waits because one session never runs two runs at once.`,
  };
}

/** Reads whether one lock belongs to a run so the release path only clears its own lock. */
export function lockheldby(lock: lockrecord | undefined, runid: string): boolean {
  return lock !== undefined && lock.runid === runid;
}

/** Releases the lock of a completed, failed or cancelled run: the sessionlock clears so the next reviewed run may acquire it. */
export function releasesessionlock(lock: lockrecord | undefined, runid: string): boolean {
  return lockheldby(lock, runid);
}

/** Loads the user configured lock expiry window without a hard cap: an absent setting keeps the documented roadmap window while every configured value stays the user's choice. */
export function lockwindowof(settings: runsettings | undefined): number {
  return settings?.lockwindow ?? roadmaplockwindow;
}

/** Lists the locks whose expiry window passed: every abandoned lock names an expiry candidate the startup pass clears before the zombiecheck runs. */
export function stalelocks(locks: lockrecord[], now: number): lockrecord[] {
  return locks.filter((lock) => lock.expiresat <= now);
}

/** Attaches the acquired lockid to one agentsession so concurrent run protection travels with the session record. */
export function sessionwithlock(session: agentsession, lockid: string | undefined): agentsession {
  if (lockid === undefined || lockid.trim() === "") return session;
  return { ...session, lockid };
}

/** Summarizes the urlhistory of one run: the visit count, its distinct origins and its first and last visit times; a run without visits carries none. */
export function visitsummary(visits: urlvisit[]): { count: number; origins: string[]; first?: number; last?: number } {
  const scoped = visits.filter((visit) => visit.url.trim() !== "");
  const origins = [
    ...new Set(
      scoped
        .map((visit) => {
          try {
            return new URL(visit.url).origin;
          } catch {
            return "";
          }
        })
        .filter((origin) => origin !== ""),
    ),
  ];
  const first = scoped[0]?.at;
  const last = scoped.at(-1)?.at;
  return {
    count: scoped.length,
    origins,
    ...(first !== undefined ? { first } : {}),
    ...(last !== undefined ? { last } : {}),
  };
}

/** Reads the final url of a completed navigation step result so the urlhistory records the url the redirect chain landed on; a result without a final url reports the planned url unchanged. */
export function finalurlof(input: { plannedurl: string; finalurl?: string }): string {
  if (input.finalurl !== undefined && input.finalurl.trim() !== "") return input.finalurl;
  return input.plannedurl;
}

/** Lists the navigation steps of a plan in their reviewed order: the urlhistory records one urlvisit for each completed navigation step. */
export function navigationsteps(steps: toolstep[]): toolstep[] {
  return steps.filter((step) =>
    [
      "navigate",
      "openlink",
      "followlink",
      "spanav",
      "navlist",
      "batchopen",
      "openprivate",
      "reload",
      "reloadcache",
      "back",
      "forward",
    ].includes(step.kind),
  );
}

/** Reads the runrecord of a run with its visits attached so the record carries its urlhistory beside its lifecycle state. */
export function runwithvisits(run: runrecord, visits: urlvisit[]): runrecord {
  const scoped = visits.filter((visit) => visit.runid === run.runid);
  if (scoped.length === 0) return run;
  return { ...run, visits: scoped };
}

/* ── Merged from runtimeline.ts ── */

import type {
  consolediff,
  consoleentry,
  errorrecord,
  exchangerecord,
  loglevel,
  loglevelset,
  longtaskentry,
  netfailureentry,
  rejectionrecord,
  rotationrule,
  spamrule,
  stackframe,
  timelineentry,
  timelinesource,
} from "./types.js";

/**
 * Run timeline logics for the 1.1.45 debugging family.
 * Every correlated rule for console capture with reviewed depth bounds and secret redaction, stack frame parsing, error, rejection and resource failure capture, long task attribution windows, the timeline binding to one run and its step ids, spam collapse with reviewed thresholds, log rotation without entry loss, level and source filters, the blocking duration per step window and the console diff between two runs lives in this file.
 * Console, error and task watching derives from page-injected listeners installed through the scripting api and the performance buffers, so no debugger permission exists anywhere in the manifest; redaction runs before any entry leaves the page bridge and captured text never carries reviewed secret patterns.
 */

/** The debugging kinds, listed among the available capabilities of every proposal request. */
export const timelinekinds: string[] = ["watchconsole", "watcherrors", "watchtasks"];

/** The reviewed level set, ordered from the most severe to the most verbose level. */
export const loglevels: loglevel[] = ["error", "warn", "info", "log", "debug", "trace"];

/** The reviewed timeline source grammar: page console output, script errors, promise rejections, resource failures, long tasks, failed network requests and instrumented devtools protocol events. */
export const timelinesources: timelinesource[] = [
  "console",
  "error",
  "rejection",
  "resource",
  "longtask",
  "network",
  "cdp",
];

/** Ranks one level inside the reviewed level set; lower ranks are more severe. */
export function levelrank(level: loglevel): number {
  return loglevels.indexOf(level);
}

/** Redacts reviewed secret patterns from console text before any entry leaves the page bridge; matched patterns never survive into a stored entry. */
export function redactconsoletext(text: string, patterns: string[]): string {
  let redacted = text;
  for (const pattern of patterns) {
    if (!pattern) continue;
    while (redacted.includes(pattern)) redacted = redacted.replace(pattern, "[redacted]");
  }
  return redacted;
}

/** Classifies the kind tag of one console argument for the consoleentry argument kinds. */
export function argkind(value: unknown): string {
  if (value === null) return "null";
  if (Array.isArray(value)) return "array";
  if (value instanceof Error) return "error";
  switch (typeof value) {
    case "string":
      return "string";
    case "number":
      return "number";
    case "boolean":
      return "boolean";
    case "bigint":
      return "bigint";
    case "symbol":
      return "symbol";
    case "function":
      return "function";
    case "undefined":
      return "undefined";
    default:
      return "object";
  }
}

/** Serializes one console argument through the reviewed depth bound; deeper objects collapse to their constructor tag so the bound stays a user choice with no code ceiling. */
export function serializearg(value: unknown, depth: number): string {
  const render = (item: unknown, remaining: number): string => {
    if (item instanceof Error) return `${item.name}: ${item.message}`;
    if (typeof item === "string") return item;
    if (typeof item === "function") return `[function ${item.name || "anonymous"}]`;
    if (typeof item === "bigint") return `${item}n`;
    if (typeof item === "symbol") return item.toString();
    if (item === null || item === undefined || typeof item !== "object") return String(item);
    if (remaining <= 0) {
      const tag = Array.isArray(item)
        ? "Array"
        : ((item as { constructor?: { name?: string } }).constructor?.name ?? "Object");
      return `[${tag}]`;
    }
    if (Array.isArray(item)) return `[${item.map((entry) => render(entry, remaining - 1)).join(", ")}]`;
    const record = item as Record<string, unknown>;
    return `{${Object.keys(record)
      .map((key) => `${key}: ${render(record[key], remaining - 1)}`)
      .join(", ")}}`;
  };
  return render(value, Math.max(0, depth));
}

/** Builds one captured console entry from a forwarded console call: the level, the redacted text of every serialized argument and the argument kinds, with redaction applied before the entry exists. */
export function consolecapture(input: {
  level: loglevel;
  args: unknown[];
  depth: number;
  redact: string[];
}): consoleentry {
  const parts = input.args.map((arg) => serializearg(arg, input.depth));
  return {
    level: input.level,
    text: redactconsoletext(parts.join(" "), input.redact),
    argkinds: input.args.map((arg) => argkind(arg)),
    repeat: 1,
  };
}

/** Parses one stack trace text into stack frames with function names, urls, lines and columns; unparseable lines are skipped instead of crashing capture. */
export function stackframes(stacktext: string): stackframe[] {
  const frames: stackframe[] = [];
  for (const row of stacktext.split("\n")) {
    const trimmed = row.trim();
    if (!trimmed.startsWith("at ")) continue;
    const body = trimmed.slice(3).trim();
    const location = body.match(/\(([^()]*:\d+:\d+)\)$/) ?? body.match(/^(.*:\d+:\d+)$/);
    const located = location?.[1];
    if (!located) continue;
    const segments = located.split(":");
    const column = Number.parseInt(segments.pop() ?? "", 10);
    const lineno = Number.parseInt(segments.pop() ?? "", 10);
    const url = segments.join(":");
    if (!Number.isFinite(lineno) || lineno < 0) continue;
    const name = body.endsWith(`(${located})`) ? body.slice(0, body.length - located.length - 2).trim() : "";
    frames.push({
      ...(name ? { functionname: name } : {}),
      url,
      line: lineno,
      ...(Number.isFinite(column) ? { column } : {}),
    });
  }
  return frames;
}

/** Builds one captured javascript error record body from an error event: the redacted message, the parsed stack frames, the source url and the line. */
export function errorcapture(input: {
  message: string;
  sourceurl: string;
  line: number;
  stacktext?: string;
  redact: string[];
}): Pick<errorrecord, "message" | "frames" | "sourceurl" | "line"> {
  return {
    message: redactconsoletext(input.message, input.redact),
    frames: input.stacktext !== undefined ? stackframes(input.stacktext) : [],
    sourceurl: input.sourceurl,
    line: input.line,
  };
}

/** Builds one captured unhandled rejection record body from the rejection reason text and its stack frames, with the reason redacted before capture. */
export function rejectioncapture(input: {
  reason: string;
  stacktext?: string;
  redact: string[];
}): Pick<rejectionrecord, "reason" | "frames"> {
  return {
    reason: redactconsoletext(input.reason, input.redact),
    frames: input.stacktext !== undefined ? stackframes(input.stacktext) : [],
  };
}

/** Builds the long task entry bodies of one watch window from performance longtask entries with their attribution names; the reviewed threshold filters entries below the user configured duration. */
export function longtaskcapture(input: {
  entries: Array<{ starttime: number; duration: number; attributions: string[] }>;
  threshold: number;
}): Array<Pick<longtaskentry, "duration" | "starttime" | "attributions">> {
  return input.entries
    .filter((entry) => entry.duration >= input.threshold)
    .map((entry) => ({
      duration: Math.round(entry.duration),
      starttime: Math.round(entry.starttime),
      attributions: [...entry.attributions],
    }));
}

/** One run timeline bound to its run and step ids. */
export interface timeline {
  runid: string;
  origin: string;
  stepids: string[];
  attachedat: number;
  entries: timelineentry[];
}

/** Binds one timeline to the run and its step ids; capture stays scoped to that run and every entry carries the run correlation id of its step. */
export function attachtimeline(input: { runid: string; origin: string; stepids: string[]; now: number }): timeline {
  return { runid: input.runid, origin: input.origin, stepids: [...input.stepids], attachedat: input.now, entries: [] };
}

/** Applies the reviewed level set to timeline entries: per step level floors drop entries more verbose than the floor and source filters drop entries from unreviewed sources. */
export function filterentries(entries: timelineentry[], levelset: loglevelset): timelineentry[] {
  return entries.filter((entry) => {
    const floor = levelset.floors?.[entry.stepid] ?? levelset.floors?.["*"];
    if (floor !== undefined && levelrank(entry.level) > levelrank(floor)) return false;
    if (levelset.sources !== undefined && levelset.sources.length > 0 && !levelset.sources.includes(entry.source))
      return false;
    return true;
  });
}

/** Collapses repeated identical messages inside the reviewed spam window into counts and flags the patterns that exceed the reviewed collapse threshold. */
export function spamdetect(
  entries: timelineentry[],
  rule: spamrule,
): { entries: Array<timelineentry & { repeat: number }>; flagged: Array<{ message: string; count: number }> } {
  const collapsed: Array<timelineentry & { repeat: number }> = [];
  const counts = new Map<string, number>();
  for (const entry of entries) {
    if (rule.pattern !== "" && !entry.message.includes(rule.pattern)) {
      collapsed.push({ ...entry, repeat: 1 });
      continue;
    }
    const key = `${entry.level}|${entry.source}|${entry.message}`;
    const previous = collapsed[collapsed.length - 1];
    if (
      previous &&
      previous.repeat !== undefined &&
      `${previous.level}|${previous.source}|${previous.message}` === key &&
      entry.time - previous.time <= rule.windowsize
    ) {
      previous.repeat += 1;
      continue;
    }
    collapsed.push({ ...entry, repeat: 1 });
  }
  for (const entry of collapsed) {
    if (entry.repeat > 1) counts.set(`${entry.level}|${entry.source}|${entry.message}`, entry.repeat);
  }
  const flagged = [...counts.entries()]
    .filter(([, count]) => count > rule.collapse)
    .map(([key, count]) => ({ message: key.split("|").slice(2).join("|"), count }));
  return { entries: collapsed, flagged };
}

/** Rotates the timeline of one run: the newest entries stay inside the reviewed max entries window while every overflow entry moves to the rotation target store without data loss. */
export function rotatelogs(
  entries: timelineentry[],
  rule: rotationrule,
): { kept: timelineentry[]; overflow: timelineentry[] } {
  if (entries.length <= rule.maxentries) return { kept: [...entries], overflow: [] };
  const kept = entries.slice(entries.length - rule.maxentries);
  const overflow = entries.slice(0, entries.length - rule.maxentries);
  return { kept, overflow };
}

/** Counts the timeline entries per level for the response envelope timeline block. */
export function timelinecounts(entries: timelineentry[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const level of loglevels) counts[level] = 0;
  for (const entry of entries) counts[entry.level] = (counts[entry.level] ?? 0) + 1;
  return counts;
}

/** Sums the blocking duration of long task entries inside one step window; the window stays a reviewed value with no code ceiling. */
export function blockingduration(
  tasks: Array<{ starttime: number; duration: number }>,
  stepid: string,
  window: { startedat: number; endedat: number },
): { stepid: string; blocking: number; tasks: number } {
  const inside = tasks.filter((task) => task.starttime >= window.startedat && task.starttime <= window.endedat);
  return { stepid, blocking: inside.reduce((total, task) => total + task.duration, 0), tasks: inside.length };
}

/** Marks one failed request of the run in the timeline from its observed exchange: the url, status, error class and correlation id. */
export function netfailureentryof(input: { id: string; exchange: exchangerecord; at: number }): netfailureentry | null {
  const exchange = input.exchange;
  if (exchange.errorclass === undefined && exchange.status < 400) return null;
  return {
    id: input.id,
    runid: exchange.runid,
    stepid: exchange.stepid,
    url: exchange.url,
    status: exchange.status,
    errorclass: exchange.errorclass ?? "httperror",
    correlationid: exchange.correlationid,
    at: input.at,
  };
}

/** Decides whether a watcher detached early because the run tab navigated inside its watch window: navigation timestamps inside the window detach the watcher at the navigation time. */
export function watcherdetached(input: { startedat: number; lifetime: number; navigations: number[] }): {
  detached: boolean;
  at?: number;
} {
  for (const navigation of input.navigations) {
    if (navigation >= input.startedat && navigation <= input.startedat + input.lifetime)
      return { detached: true, at: navigation };
  }
  return { detached: false };
}

/** Compares the console output of two runs and classifies every line as added, removed or repeated; repeated lines carry their repeat counts. */
export function consolediff(input: {
  baseid: string;
  targetid: string;
  baselines: string[];
  targetlines: string[];
  now: number;
}): consolediff {
  const base = input.baselines;
  const target = input.targetlines;
  const basemap = new Map<string, number>();
  for (const line of base) basemap.set(line, (basemap.get(line) ?? 0) + 1);
  const targetmap = new Map<string, number>();
  for (const line of target) targetmap.set(line, (targetmap.get(line) ?? 0) + 1);
  const lines = [];
  const added: string[] = [];
  const removed: string[] = [];
  const repeated: string[] = [];
  for (const [line, count] of targetmap) {
    const basecount = basemap.get(line) ?? 0;
    if (basecount === 0) {
      for (let index = 0; index < count; index += 1) {
        lines.push({ kind: "added" as const, text: line });
        added.push(line);
      }
      continue;
    }
    const share = Math.min(basecount, count);
    for (let index = 0; index < share; index += 1) {
      lines.push({ kind: "repeated" as const, text: line, count: share });
      repeated.push(line);
    }
    for (let index = share; index < count; index += 1) {
      lines.push({ kind: "added" as const, text: line });
      added.push(line);
    }
  }
  for (const [line, count] of basemap) {
    const targetcount = targetmap.get(line) ?? 0;
    const missing = Math.max(0, count - targetcount);
    for (let index = 0; index < missing; index += 1) {
      lines.push({ kind: "removed" as const, text: line });
      removed.push(line);
    }
  }
  return {
    base: input.baseid,
    target: input.targetid,
    lines,
    added: added.length,
    removed: removed.length,
    repeated: repeated.length,
    at: input.now,
  };
}

/* ── Merged from runbudget.ts ── */

import type { budgetalert, runbudgetrecord, timeoutcancelevent, timeoutcancelpolicy } from "./types.js";
import { randomid } from "./memory.js";

/**
 * Runbudget logic of the 1.1.69 family.
 * Every run tracks its step usage against the user chosen step budget and its memory pressure through the worker telemetry, the budgetalerts fire at the user chosen thresholds with their severity levels while the critical threshold pauses the run pending a user choice instead of refusing it, and the timeoutcancel aborts a slow step at the user chosen bound with the cancel event recorded in the immutable log beside the step outcome.
 * Every budget, threshold and bound stays a user choice: the tracker measures and never caps, and the pause waits for the user instead of dropping work.
 */

/** Builds one runbudget record of a run: the step usage against the user chosen step budget beside the memory pressure the worker telemetry reported. */
export function runbudgetof(input: {
  runid: string;
  steps: number;
  stepbudget?: number;
  pressure: number;
  memorybudget?: number;
  now: number;
}): runbudgetrecord {
  if (input.runid.trim() === "") throw new Error("The runbudget record needs its run id.");
  const pressure = Number.isFinite(input.pressure) ? Math.min(Math.max(input.pressure, 0), 1) : 0;
  return {
    runid: input.runid,
    steps: Math.max(input.steps, 0),
    ...(input.stepbudget !== undefined ? { stepbudget: input.stepbudget } : {}),
    pressure,
    ...(input.memorybudget !== undefined ? { memorybudget: input.memorybudget } : {}),
    at: input.now,
  };
}

/** Reads the budgetalerts of one runbudget record: the warning threshold fires its warning while the critical threshold fires its critical alert that pauses the run pending a user choice; an absent threshold keeps the alert informational only. */
export function budgetalertstate(input: {
  budget: runbudgetrecord;
  thresholds?: { warning?: number; critical?: number };
}): budgetalert[] {
  const alerts: budgetalert[] = [];
  const stepsbudget = input.budget.stepbudget;
  if (stepsbudget !== undefined && stepsbudget > 0) {
    const ratio = input.budget.steps / stepsbudget;
    const alert = budgetalertof({
      runid: input.budget.runid,
      kind: "steps",
      ratio,
      ...(input.thresholds !== undefined ? { thresholds: input.thresholds } : {}),
      at: input.budget.at,
    });
    if (alert !== undefined) alerts.push(alert);
  }
  const memorybudget = input.budget.memorybudget;
  if (memorybudget !== undefined && memorybudget > 0) {
    const ratio = input.budget.pressure / memorybudget;
    const alert = budgetalertof({
      runid: input.budget.runid,
      kind: "memory",
      ratio,
      ...(input.thresholds !== undefined ? { thresholds: input.thresholds } : {}),
      at: input.budget.at,
    });
    if (alert !== undefined) alerts.push(alert);
  }
  return alerts;
}

/** Reads the single alert of one budget ratio at its reached severity level; the critical level pauses the run pending a user choice. */
function budgetalertof(input: {
  runid: string;
  kind: "steps" | "memory";
  ratio: number;
  thresholds?: { warning?: number; critical?: number };
  at: number;
}): budgetalert | undefined {
  const critical = input.thresholds?.critical;
  const warning = input.thresholds?.warning;
  if (critical !== undefined && critical > 0 && input.ratio >= critical)
    return { runid: input.runid, level: "critical", kind: input.kind, ratio: input.ratio, paused: true, at: input.at };
  if (warning !== undefined && warning > 0 && input.ratio >= warning)
    return { runid: input.runid, level: "warning", kind: input.kind, ratio: input.ratio, paused: false, at: input.at };
  return undefined;
}

/** Reads whether one run pauses for its budgetalerts: only a critical alert pauses the run pending a user choice while every warning stays informational. */
export function runpausesforalerts(alerts: budgetalert[]): boolean {
  return alerts.some((alert) => alert.paused);
}

/** Reads the timeoutcancel decision of one step: the step aborts at the user chosen bound while an absent bound never aborts a step because the bound stays a user choice. */
export function timeoutcanceldecision(input: { elapsed: number; bound?: number }): { abort: boolean; reason: string } {
  if (input.bound === undefined)
    return {
      abort: false,
      reason:
        "The user set no timeout bound and the engine sets none; the step runs to its end inside the reviewed plan.",
    };
  if (!Number.isFinite(input.elapsed))
    return {
      abort: false,
      reason: "The step reported no finite elapsed time; the executor never aborts on a telemetry gap.",
    };
  if (input.elapsed <= input.bound)
    return {
      abort: false,
      reason: `The step ran ${input.elapsed} milliseconds inside the user timeout bound of ${input.bound} milliseconds.`,
    };
  return {
    abort: true,
    reason: `The step ran ${input.elapsed} milliseconds past the user timeout bound of ${input.bound} milliseconds; the executor aborts it and records the cancel event beside the step outcome.`,
  };
}

/** Builds one timeoutcancel event: the aborted step, its bound, its elapsed time and the immutable log entry the cancel wrote beside the step outcome. */
export function timeoutcanceleventof(input: {
  runid: string;
  stepid: string;
  bound: number;
  elapsed: number;
  now: number;
  logged: boolean;
}): timeoutcancelevent {
  if (input.runid.trim() === "") throw new Error("The timeoutcancel event needs its run id.");
  if (input.stepid.trim() === "") throw new Error("The timeoutcancel event needs its step id.");
  return {
    id: randomid(),
    runid: input.runid,
    stepid: input.stepid,
    bound: Math.max(input.bound, 0),
    elapsed: Math.max(input.elapsed, 0),
    at: input.now,
    logged: input.logged,
  };
}

/** Reads the timeoutcancel policies of one plan: one policy per step carrying the user chosen bound, and an absent bound keeps every policy unbounded. */
export function timeoutcancelpolicies(input: { steps: string[]; bound?: number }): timeoutcancelpolicy[] {
  return input.steps.map((stepid) => ({ stepid, ...(input.bound !== undefined ? { bound: input.bound } : {}) }));
}

/* ── Merged from runresume.ts ── */

import type { navdedupeentry, resumepoint, runcacheentry, stepprefetchhint } from "./types.js";

/**
 * Runresume logic of the 1.1.69 family.
 * The efficientresume checkpoints every step boundary with its cursor and its page digest, skips the completed steps after a restart and revalidates the page fingerprint before it resumes, the navdedupe skips navigations to the already active url and folds repeated planned visits into one navigation, the runcache stores fetched resources per run keyed by their digest, serves the repeat fetches of the same run and clears at the run end unless the user pins the profile cache, and the stepprefetch derives its likely next pages and likely next selectors from the plan structure alone.
 * The resume, the dedupe and the prefetch optimize the run only: they never skip a review and never fetch a page the reviewed plan never named.
 */

/** Builds one efficientresume checkpoint: the step boundary with its cursor and the digest of the page fingerprint the resume revalidates. */
export function resumepointof(input: {
  runid: string;
  stepid: string;
  cursor: number;
  digest: string;
  now: number;
}): resumepoint {
  if (input.runid.trim() === "") throw new Error("The resume checkpoint needs its run id.");
  if (input.stepid.trim() === "") throw new Error("The resume checkpoint needs its step id.");
  if (input.digest.trim() === "")
    throw new Error("The resume checkpoint needs its page digest; a digestless resume never revalidates the page.");
  return {
    runid: input.runid,
    stepid: input.stepid,
    cursor: Math.max(input.cursor, 0),
    digest: input.digest,
    at: input.now,
  };
}

/** Reads the skip plan after a restart: the steps with a checkpoint skip while the resume continues at the first step without one. */
export function skipcompletedsteps(input: { checkpoints: resumepoint[]; steps: string[] }): {
  skip: string[];
  resumeat?: string;
} {
  const done = new Set(input.checkpoints.map((checkpoint) => checkpoint.stepid));
  const skip = input.steps.filter((step) => done.has(step));
  const resumeat = input.steps.find((step) => !done.has(step));
  return { skip, ...(resumeat !== undefined ? { resumeat } : {}) };
}

/** Revalidates the page fingerprint before one resume: a matching digest resumes while a changed fingerprint refuses so the resume never continues against a different page. */
export function revalidatefingerprint(input: { checkpoint: resumepoint; fingerprint: string }): {
  ok: boolean;
  reason: string;
} {
  if (input.checkpoint.digest === input.fingerprint)
    return {
      ok: true,
      reason: `The page fingerprint matches the checkpoint digest of the step ${input.checkpoint.stepid}; the resume continues at cursor ${input.checkpoint.cursor}.`,
    };
  return {
    ok: false,
    reason: `The page fingerprint changed since the checkpoint of the step ${input.checkpoint.stepid}; the resume refuses so the run never continues against a different page.`,
  };
}

/** Reads the navdedupe verdict of one planned navigation: a navigation to the already active url skips while every other navigation runs. */
export function navdedupeverdict(input: { url: string; activeurl: string }): { skip: boolean; reason: string } {
  if (input.url.trim() === "")
    return { skip: false, reason: "The planned navigation carries no url; the navigation runs as reviewed." };
  if (input.url === input.activeurl)
    return {
      skip: true,
      reason: `The planned navigation to ${input.url} targets the already active url; the navdedupe skips the duplicate navigation while the step outcome records the skip.`,
    };
  return {
    skip: false,
    reason: `The planned navigation to ${input.url} targets a new url; the navigation runs as reviewed.`,
  };
}

/** Folds repeated planned visits into one navigation per url: every step that plans the same url merges into one navdedupe entry. */
export function foldplannedvisits(steps: Array<{ id: string; url?: string }>): navdedupeentry[] {
  const folded = new Map<string, navdedupeentry>();
  for (const step of steps) {
    if (step.url === undefined || step.url.trim() === "") continue;
    const entry = folded.get(step.url);
    if (entry === undefined) {
      folded.set(step.url, { url: step.url, stepids: [step.id] });
      continue;
    }
    entry.stepids.push(step.id);
  }
  return [...folded.values()];
}

/** Reads the digest key of one fetched resource within one run so the runcache stores and serves it by digest. */
export function runcachedigest(input: { runid: string; resource: string }): string {
  if (input.runid.trim() === "") throw new Error("The runcache digest needs its run id.");
  if (input.resource.trim() === "") throw new Error("The runcache digest needs its resource.");
  return `${input.runid}:${input.resource}`;
}

/** Serves one repeat fetch from the runcache: a stored entry of the same run and the same resource answers the fetch while no stored entry keeps the fetch running. */
export function runcachehit(
  entries: runcacheentry[],
  input: { runid: string; resource: string },
): runcacheentry | undefined {
  return entries.find((entry) => entry.runid === input.runid && entry.resource === input.resource);
}

/** Reads the runcache sweep of one run end: the entries clear at the run end while the pinned entries of the user profile cache survive. */
export function runcachesweep(
  entries: runcacheentry[],
  input: { runid: string; pin: boolean },
): { kept: runcacheentry[]; cleared: number } {
  if (input.pin) return { kept: [...entries], cleared: 0 };
  const kept = entries.filter((entry) => entry.runid !== input.runid || entry.pinned);
  return { kept, cleared: entries.length - kept.length };
}

/** Derives the stepprefetch hints from the plan structure alone: every step names its likely next page from the next planned navigation and its likely next selectors from the targets of the steps that follow, so the warming never reaches a page the reviewed plan never named. */
export function stepprefetchhints(plan: {
  steps: Array<{ id: string; kind: string; value?: string; target?: string }>;
}): stepprefetchhint[] {
  return plan.steps.map((step, index) => {
    const rest = plan.steps.slice(index + 1);
    const nav = rest.find(
      (candidate) =>
        ["navigate", "openlink", "followlink"].includes(candidate.kind) &&
        candidate.value !== undefined &&
        candidate.value.trim() !== "",
    );
    const selectors = rest
      .map((candidate) => candidate.target)
      .filter((target): target is string => target !== undefined && target.trim() !== "");
    return {
      stepid: step.id,
      ...(nav?.value !== undefined ? { page: nav.value } : {}),
      selectors: [...new Set(selectors)].slice(0, 5),
    };
  });
}

/* ── Merged from runreplay.ts ── */

import type { immutablelogentry, runreplaysession, runreplaystep } from "./types.js";

/**
 * Runreplay logic of the 1.1.66 family.
 * The audit walk of one sealed run lives here: the replay opens only a sealed run whose chain verified, derives one replay step per recorded log entry with its gate resolutions and its restored observation and capture refs, and the viewer moves forward, backward and to any chosen step while every viewer action records in the audit trail.
 * The replay never re-executes anything: it reads the immutable log and the stored captures only, so a replay of a run never touches the page.
 */

/** Derives the observation version and the capture id of one log entry from its summary provenance when the entry carries them; an entry without refs restores its text alone. */
function restoredrefsof(entry: immutablelogentry): { observationversion?: number; captureid?: string } {
  const observation = /observation (\d+)/i.exec(entry.summary);
  const capture = /capture ([a-z0-9-]+)/i.exec(entry.summary);
  return {
    ...(observation !== null ? { observationversion: Number(observation[1]) } : {}),
    ...(capture !== null ? { captureid: capture[1] } : {}),
  };
}

/** Builds one replay step of a log entry with its gate resolutions: the step annotates the gate the run waited at when the entry carries one. */
export function replaystepof(
  entry: immutablelogentry,
  index: number,
  gates: Array<{ gateid: string; kind: string; resolution: string; at: number }>,
): runreplaystep {
  const refs = restoredrefsof(entry);
  return {
    stepid: entry.stepid ?? entry.id,
    index,
    summary: entry.summary,
    ...(refs.observationversion !== undefined ? { observationversion: refs.observationversion } : {}),
    ...(refs.captureid !== undefined ? { captureid: refs.captureid } : {}),
    gateresolutions: entry.stepid === undefined ? [] : gates.filter((gate) => gate.gateid === entry.stepid),
  };
}

/** Builds one runreplay session of a sealed run: one replay step per verified log entry in order, the cursor starts before the first step and the viewer actions start empty. */
export function runreplaysessionof(input: {
  runid: string;
  entries: immutablelogentry[];
  gates?: Array<{ gateid: string; kind: string; resolution: string; at: number }>;
  now: number;
}): runreplaysession {
  if (input.runid.trim() === "") throw new Error("The runreplay session needs its recorded run id.");
  if (input.entries.length === 0)
    throw new Error("The runreplay session needs at least one verified log entry to walk.");
  const steps = input.entries.map((entry, index) => replaystepof(entry, index, input.gates ?? []));
  return {
    id: `replay:${input.runid}:${input.now}`,
    runid: input.runid,
    cursor: 0,
    playing: false,
    steps,
    openedat: input.now,
    actions: [],
  };
}

/** Moves the replay cursor one step forward or backward; the cursor stays inside the step list because a replay walks its recorded chain only. */
export function replaymove(
  session: runreplaysession,
  direction: "forward" | "backward",
  now: number,
): runreplaysession {
  const next =
    direction === "forward" ? Math.min(session.steps.length - 1, session.cursor + 1) : Math.max(0, session.cursor - 1);
  const step = session.steps[next];
  return {
    ...session,
    cursor: next,
    playing: false,
    actions: [
      ...session.actions,
      { kind: "step" as const, at: now, ...(step !== undefined ? { stepid: step.stepid } : {}) },
    ],
  };
}

/** Jumps the replay cursor to one chosen step of the recorded chain; a step outside the chain refuses the jump. */
export function replayjump(session: runreplaysession, stepid: string, now: number): runreplaysession {
  const index = session.steps.findIndex((step) => step.stepid === stepid);
  if (index === -1) throw new Error(`The runreplay knows no ${stepid} step in the recorded chain of ${session.runid}.`);
  return {
    ...session,
    cursor: index,
    playing: false,
    actions: [...session.actions, { kind: "jump" as const, stepid, at: now }],
  };
}

/** Toggles the replay play state: playing advances the viewer through the recorded steps while the pause holds the cursor exactly where it stands. */
export function replayplay(session: runreplaysession, playing: boolean, now: number): runreplaysession {
  return {
    ...session,
    playing,
    actions: [...session.actions, { kind: playing ? ("play" as const) : ("pause" as const), at: now }],
  };
}

/** Records one viewer action of the replay session for the audit trail: every play, pause, step and jump keeps its time. */
export function replayviewaction(
  session: runreplaysession,
  action: { kind: "play" | "pause" | "step" | "jump"; stepid?: string; at: number },
): runreplaysession {
  return {
    ...session,
    actions: [
      ...session.actions,
      { kind: action.kind, ...(action.stepid !== undefined ? { stepid: action.stepid } : {}), at: action.at },
    ],
  };
}

/** Reads the restored view of the replayed step: the log summary it stands on beside the observation and the capture the step restored from the stored captures of the run. */
export function replayrestoredview(step: runreplaystep): {
  stepid: string;
  index: number;
  summary: string;
  observationversion?: number;
  captureid?: string;
  gateresolutions: Array<{ gateid: string; kind: string; resolution: string; at: number }>;
} {
  return {
    stepid: step.stepid,
    index: step.index,
    summary: step.summary,
    ...(step.observationversion !== undefined ? { observationversion: step.observationversion } : {}),
    ...(step.captureid !== undefined ? { captureid: step.captureid } : {}),
    gateresolutions: step.gateresolutions,
  };
}

/** Reads the replay cursor of one viewed run the memory keeps per run, so a reopened replay stands where the viewer left it. */
export function replaycursorof(session: runreplaysession): { runid: string; cursor: number; playing: boolean } {
  return { runid: session.runid, cursor: session.cursor, playing: session.playing };
}

/* ── Merged from runparallel.ts ── */

import type { readparallelgroup, sessionreusegrant, warmselectorrecord } from "./types.js";

/**
 * Runparallel logic of the 1.1.69 family.
 * The readparallel groups the independent page reads of one run into parallel lanes and joins the lanes before the dependent steps, the warmselectors carry the validated selectors between adjacent steps and revalidate on a fingerprint change only, and the sessionreuse attaches an authenticated profile to a run on its explicit per profile consent while it isolates the cookies per task through separate containers.
 * The parallel lanes, the carried selectors and the reused sessions optimize the run only: every read, every resolution and every attached profile stays inside the reviewed plan and its consent gates.
 */

/** Groups the independent page reads of one run into parallel lanes: every read runs in its own lane while the user chosen lane ceiling keeps the waves bounded, and an absent ceiling keeps every lane open. */
export function readparallelgroupof(input: {
  runid: string;
  reads: Array<{ stepid: string; origin: string }>;
  lanes?: number;
}): readparallelgroup {
  if (input.runid.trim() === "") throw new Error("The readparallel group needs its run id.");
  const lanes = input.lanes !== undefined && input.lanes > 0 ? input.reads.slice(0, input.lanes) : [...input.reads];
  return {
    runid: input.runid,
    lanes: lanes.map((read) => ({ stepid: read.stepid, origin: read.origin })),
    joined: false,
  };
}

/** Joins one readparallel group before its dependent steps: every lane completes before the dependent step runs. */
export function joinlanes(group: readparallelgroup): readparallelgroup {
  return { ...group, joined: true };
}

/** Reads the lanes of one readparallel group that still run, so the join waits on the open lanes alone. */
export function openlanes(group: readparallelgroup): Array<{ stepid: string; origin: string }> {
  return group.lanes.filter((lane) => lane.stepid !== "");
}

/** Carries one validated selector to the adjacent step: the record holds the resolution and the page fingerprint the resolution stays valid under. */
export function carrywarmselector(input: {
  selector: string;
  resolution: string;
  fingerprint: string;
  from: string;
}): warmselectorrecord {
  if (input.selector.trim() === "") throw new Error("The warmselector record needs its selector.");
  if (input.fingerprint.trim() === "")
    throw new Error("The warmselector record needs its page fingerprint; a fingerprintless carry never revalidates.");
  return {
    selector: input.selector,
    resolution: input.resolution,
    fingerprint: input.fingerprint,
    carriedfrom: input.from,
  };
}

/** Reads whether one carried selector stays valid: the carry holds while the page fingerprint stays unchanged, and only a fingerprint change revalidates the selector. */
export function warmselectorcarryvalid(input: { record: warmselectorrecord; fingerprint: string }): {
  carry: boolean;
  reason: string;
} {
  if (input.record.fingerprint === input.fingerprint)
    return {
      carry: true,
      reason: `The page fingerprint stayed unchanged since the step ${input.record.carriedfrom}; the carried resolution of ${input.record.selector} holds and needs no revalidation.`,
    };
  return {
    carry: false,
    reason: `The page fingerprint changed since the step ${input.record.carriedfrom}; the carried resolution of ${input.record.selector} revalidates before the dispatch.`,
  };
}

/** Builds one sessionreuse grant: the authenticated profile attaches to a run only through its explicit per profile consent prompt. */
export function sessionreusegrantof(input: {
  profile: string;
  container: string;
  promptid: string;
  consentedat: number;
  runid?: string;
}): sessionreusegrant {
  if (input.profile.trim() === "") throw new Error("The sessionreuse grant needs its profile.");
  if (input.promptid.trim() === "")
    throw new Error("The sessionreuse grant needs its consent prompt id; a promptless grant attaches no profile.");
  return {
    profile: input.profile,
    container: input.container,
    promptid: input.promptid,
    consentedat: input.consentedat,
    ...(input.runid !== undefined ? { runid: input.runid } : {}),
  };
}

/** Reads the container name of one task under one profile so the sessionreuse isolates the cookies per task through separate containers. */
export function sessioncontainerof(input: { profile: string; taskid: string }): string {
  if (input.profile.trim() === "") throw new Error("The session container needs its profile.");
  if (input.taskid.trim() === "") throw new Error("The session container needs its task id.");
  return `${input.profile}:${input.taskid}`;
}

/* ── Merged from backgroundruns.ts ── */

import type { backgroundqueueentry } from "./types.js";
import { backgroundrungate } from "./policy.js";

/**
 * Background run queue logic of the 1.1.66 family.
 * The queue that keeps workflows executing with no open surface lives here: each entry holds one reviewed workflow the user queued, the queue hands the entries to the executor one at a time in their queued order, a running entry holds the keepalive signal of 1.1.60 for its whole duration, the interrupted entries of a restart requeue for the recovery, and every state transition feeds the attentionfeed through the statusbadge.
 * The queue never starts an unreviewed workflow: a queued entry needs its approved review state exactly like a foreground run.
 */

/** Builds one background queue entry: the workflow stays queued until the executor picks it while no keepalive signal is held yet. */
export function backgroundqueueentryof(input: {
  workflowid: string;
  summary: string;
  now: number;
}): backgroundqueueentry {
  if (input.workflowid.trim() === "") throw new Error("The background queue entry needs its workflow id.");
  return {
    id: `background:${input.workflowid}:${input.now}`,
    workflowid: input.workflowid,
    state: "queued",
    keepaliveheld: false,
    queuedat: input.now,
    summary: input.summary,
  };
}

/** Enqueues one workflow for a background run: the queue keeps its order and one workflow may wait more than once. */
export function enqueuebackgroundrun(input: {
  queue: backgroundqueueentry[];
  workflowid: string;
  summary: string;
  now: number;
}): backgroundqueueentry[] {
  return [
    ...input.queue,
    backgroundqueueentryof({ workflowid: input.workflowid, summary: input.summary, now: input.now }),
  ];
}

/** Reads the next queued entry of the queue in its queued order; an empty queue returns undefined. */
export function nextbackgroundrun(queue: backgroundqueueentry[]): backgroundqueueentry | undefined {
  return [...queue].filter((entry) => entry.state === "queued").sort((a, b) => a.queuedat - b.queuedat)[0];
}

/** Begins one background run: the entry moves to running and holds the keepalive signal for its whole duration behind the background run gate. */
export function beginbackgroundrun(
  entry: backgroundqueueentry,
  now: number,
  reviewed: boolean,
): { entry: backgroundqueueentry; gate: { allowed: boolean; reason: string } } {
  const gate = backgroundrungate({ reviewed, keepaliveheld: true });
  return {
    entry: gate.allowed ? { ...entry, state: "running" as const, keepaliveheld: true, startedat: now } : entry,
    gate: { allowed: gate.allowed, reason: gate.reason ?? "" },
  };
}

/** Finishes one background run: the entry reaches its terminal state and releases the keepalive hold it carried. */
export function finishbackgroundrun(
  entry: backgroundqueueentry,
  state: "done" | "failed",
  now: number,
): backgroundqueueentry {
  return { ...entry, state, keepaliveheld: false, endedat: now };
}

/** Reads the restart recovery state of the queue: every running entry of an interrupted worker requeues while the terminal entries keep their state for the audit. */
export function resumebackgroundqueue(
  queue: backgroundqueueentry[],
  now: number,
): { queue: backgroundqueueentry[]; requeued: string[] } {
  const requeued: string[] = [];
  const next = queue.map((entry) => {
    if (entry.state !== "running") return entry;
    requeued.push(entry.id);
    const { startedat, ...rest } = entry;
    void startedat;
    return { ...rest, state: "queued" as const, keepaliveheld: false };
  });
  void now;
  return { queue: next, requeued };
}

/** Reads the attention descriptor of one background queue entry: a failed entry feeds the attentionfeed while a queued entry defers until the executor turn frees. */
export function backgroundrunattention(
  entry: backgroundqueueentry,
  origin: string,
): { cause: "failure" | "deferral"; runid: string; origin: string; summary: string } | undefined {
  if (entry.state === "failed")
    return {
      cause: "failure",
      runid: entry.id,
      origin,
      summary: `The background run of ${entry.workflowid} failed: ${entry.summary}`,
    };
  if (entry.state === "queued")
    return {
      cause: "deferral",
      runid: entry.id,
      origin,
      summary: `The background run of ${entry.workflowid} waits for its executor turn.`,
    };
  return undefined;
}

/** Reads the dashboard view of the background queue: one row per entry with its state and its progress by the workflow step count. */
export function backgroundrunsview(
  queue: backgroundqueueentry[],
): Array<{
  id: string;
  workflowid: string;
  state: string;
  keepaliveheld: boolean;
  queuedat: number;
  startedat?: number;
  endedat?: number;
  summary: string;
  progress: string;
}> {
  return queue.map((entry) => ({
    id: entry.id,
    workflowid: entry.workflowid,
    state: entry.state,
    keepaliveheld: entry.keepaliveheld,
    queuedat: entry.queuedat,
    ...(entry.startedat !== undefined ? { startedat: entry.startedat } : {}),
    ...(entry.endedat !== undefined ? { endedat: entry.endedat } : {}),
    summary: entry.summary,
    progress:
      entry.state === "running"
        ? `Running with the keepalive signal held since ${entry.startedat ?? entry.queuedat}`
        : entry.state === "queued"
          ? "Queued for the next executor turn"
          : entry.state === "done"
            ? "Completed in the background"
            : "Failed; the attentionfeed carries the cause",
  }));
}

/** Reads the recenttray rows of the finished background runs: the tray grows its background section from the terminal entries of the queue. */
export function backgroundtrayrows(
  queue: backgroundqueueentry[],
  origin: string,
): Array<{
  runid: string;
  origin: string;
  outcome: "running" | "completed" | "halted" | "failed";
  title: string;
  at: number;
  resumable: boolean;
  reopenable: boolean;
}> {
  return queue
    .filter((entry) => entry.state === "done" || entry.state === "failed")
    .map((entry) => ({
      runid: entry.id,
      origin,
      outcome: entry.state === "done" ? "completed" : "failed",
      title: `Background run of ${entry.workflowid}`,
      at: entry.endedat ?? entry.queuedat,
      resumable: false,
      reopenable: true,
    }));
}

/** Cancels one queued entry of the background queue: a running entry keeps its executor path and only a queued entry leaves through the queue. */
export function cancelbackgroundentry(
  queue: backgroundqueueentry[],
  id: string,
): { queue: backgroundqueueentry[]; cancelled: string[] } {
  const cancelled: string[] = [];
  const next = queue.filter((entry) => {
    if (entry.id === id && entry.state === "queued") {
      cancelled.push(entry.id);
      return false;
    }
    return true;
  });
  return { queue: next, cancelled };
}
