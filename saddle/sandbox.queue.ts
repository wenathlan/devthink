/**
 * sandbox.queue.ts — the sandbox lifecycle queue of saddle.
 *
 * one sandbox walks a single linear machine: creating -> starting ->
 * running -> stopping -> stopped, with the supervision states cancelled,
 * failed and timedout closing the paths out. every intermediate state
 * carries a per-state time budget; the health-check tick reaps entries
 * whose budget expired (the ttl reaper pattern of web.server.ts and the
 * pool reaper of opensandbox). transitions are validated by a pure
 * transition table so both callers and tests exercise the same guard.
 *
 * the module is deliberately pure: no timers of its own, no dom, no node
 * builtins, an injectable clock. hosts drive it — web.server.ts ramps
 * the api lifecycle with a timeout, the ttl reaper sweeps every minute,
 * and orchestrator.ts owns the fifteen state vm plane machine; this
 * module is the queue-level complement those surfaces can delegate to
 * (wire point documented in the web.server statemachine context: the
 * api states map as created->creating, expired->timedout,
 * destroyed->stopped).
 *
 * studied competitors shaping the contract: daytonaio/daytona (sandbox
 * states creating/starting/started/stopping/stopped/error with the
 * -ing intermediates) and opensandbox-group/opensandbox (Creating ->
 * Running -> Deleting -> Deleted with 409 on state conflicting
 * operations and a pool acquisition that fails fast with Retry-After).
 */

/* ------------------------------------------------------------------ */
/* types: phases, transitions, entries                                 */
/* ------------------------------------------------------------------ */

/** every phase of the sandbox lifecycle queue. */
export type sandboxphase =
  | 'creating'
  | 'starting'
  | 'running'
  | 'stopping'
  | 'stopped'
  | 'cancelled'
  | 'failed'
  | 'timedout';

/** phases that end the queue entry (no further transition is legal). */
export const SANDBOXTERMINALPHASES: readonly sandboxphase[] = [
  'stopped',
  'cancelled',
  'failed',
  'timedout',
];

/** the legal transitions of the single lifecycle machine. */
const sandboxtransitions: Record<sandboxphase, readonly sandboxphase[]> = {
  creating: ['starting', 'cancelled', 'failed', 'timedout'],
  starting: ['running', 'cancelled', 'failed', 'timedout'],
  running: ['stopping', 'cancelled', 'failed', 'timedout'],
  stopping: ['stopped', 'failed', 'timedout'],
  stopped: [],
  cancelled: [],
  failed: [],
  timedout: [],
};

/** per-state time budgets in milliseconds; a state without a budget
 * never times out (running typically relies on the host ttl instead). */
export type sandboxphasebudgets = {
  readonly creating?: number;
  readonly starting?: number;
  readonly running?: number;
  readonly stopping?: number;
};

/** one queue entry: identity, phase, bookkeeping. */
export type sandboxqueueentry = {
  readonly id: string;
  state: sandboxphase;
  /** epoch ms of the last phase change. */
  enteredat: number;
  /** epoch ms the current phase budget expires; null when unbounded. */
  deadline: number | null;
};

/** one recorded lifecycle event (bounded ring, newest last). */
export type sandboxqueueevent = {
  readonly id: string;
  readonly from: sandboxphase;
  readonly to: sandboxphase;
  readonly at: number;
  readonly reason: 'requested' | 'timeout' | 'cancel';
};

/** failure codes carried by sandboxqueueerror. */
export type sandboxqueueerrorcode =
  | 'unknown-sandbox'
  | 'duplicate-sandbox'
  | 'invalid-transition'
  | 'terminal-phase';

/** the typed queue failure, traceable to the entry and both phases. */
export class sandboxqueueerror extends Error {
  /** machine readable failure code. */
  readonly code: sandboxqueueerrorcode;
  /** the entry the failure belongs to. */
  readonly id: string;
  /** the phase the entry was in (or from), when known. */
  readonly from: sandboxphase | null;
  /** the requested target phase, when known. */
  readonly to: sandboxphase | null;

  constructor(
    code: sandboxqueueerrorcode,
    id: string,
    from: sandboxphase | null,
    to: sandboxphase | null,
    message?: string,
  ) {
    super(
      message ??
        `sandbox queue ${code} for ${id}${from === null ? '' : ` (from ${from})`}${to === null ? '' : ` to ${to}`}`,
    );
    this.name = 'sandboxqueueerror';
    this.code = code;
    this.id = id;
    this.from = from;
    this.to = to;
  }
}

/* ------------------------------------------------------------------ */
/* pure guards                                                         */
/* ------------------------------------------------------------------ */

/** checks whether a phase change is legal on the single machine. */
export function cansandboxstep(from: sandboxphase, to: sandboxphase): boolean {
  return sandboxtransitions[from].includes(to);
}

/** reports whether a phase is terminal. */
export function issandboxterminal(phase: sandboxphase): boolean {
  return SANDBOXTERMINALPHASES.includes(phase);
}

/* ------------------------------------------------------------------ */
/* the queue                                                           */
/* ------------------------------------------------------------------ */

/** options of createsandboxqueue (all optional, sane defaults). */
export type sandboxqueueoptions = {
  /** per-state budgets; the defaults mirror the 125 ms api ramp. */
  readonly budgets?: sandboxphasebudgets;
  /** event ring capacity (default 100). */
  readonly eventcap?: number;
};

/** a read-only status view answered by status(). */
export type sandboxqueuestatus = {
  readonly id: string;
  readonly state: sandboxphase;
  readonly enteredat: number;
  readonly deadline: number | null;
  readonly age: number;
  readonly terminal: boolean;
};

/**
 * creates the lifecycle queue. the queue validates every transition,
 * stamps deadlines from the budgets and reaps expired entries on the
 * health-check tick; the host decides when to tick.
 *
 * @param options the budgets and event ring capacity.
 * @returns the queue facade (add, step, cancel, healthcheck, status,
 *   list, events, size).
 */
export function createsandboxqueue(options?: sandboxqueueoptions): {
  add: (id: string, now?: number) => sandboxqueueentry;
  step: (id: string, to: sandboxphase, now?: number) => sandboxqueueentry;
  cancel: (id: string, now?: number) => sandboxqueueentry;
  healthcheck: (now?: number) => string[];
  status: (id: string, now?: number) => sandboxqueuestatus;
  list: (now?: number) => sandboxqueuestatus[];
  events: () => sandboxqueueevent[];
  size: () => number;
} {
  const budgets: sandboxphasebudgets = options?.budgets ?? {
    creating: 125,
    starting: 125,
    stopping: 30000,
  };
  const eventcap = options?.eventcap ?? 100;
  const entries = new Map<string, sandboxqueueentry>();
  const ring: sandboxqueueevent[] = [];

  /** stamps one event into the bounded ring. */
  function record(id: string, from: sandboxphase, to: sandboxphase, at: number, reason: sandboxqueueevent['reason']): void {
    ring.push({ id, from, to, at, reason });
    if (ring.length > eventcap) {
      ring.splice(0, ring.length - eventcap);
    }
  }

  /** resolves the deadline of a phase from the budget table. */
  function deadlinefor(state: sandboxphase, now: number): number | null {
    const budget = budgets[state as keyof sandboxphasebudgets];
    return typeof budget === 'number' && budget > 0 ? now + budget : null;
  }

  function statusOf(entry: sandboxqueueentry, now: number): sandboxqueuestatus {
    return {
      id: entry.id,
      state: entry.state,
      enteredat: entry.enteredat,
      deadline: entry.deadline,
      age: Math.max(0, now - entry.enteredat),
      terminal: issandboxterminal(entry.state),
    };
  }

  return {
    add(id, now = Date.now()) {
      if (entries.has(id)) {
        throw new sandboxqueueerror('duplicate-sandbox', id, null, null);
      }
      const entry: sandboxqueueentry = {
        id,
        state: 'creating',
        enteredat: now,
        deadline: deadlinefor('creating', now),
      };
      entries.set(id, entry);
      record(id, 'creating', 'creating', now, 'requested');
      return entry;
    },

    step(id, to, now = Date.now()) {
      const entry = entries.get(id);
      if (entry === undefined) {
        throw new sandboxqueueerror('unknown-sandbox', id, null, to);
      }
      if (!cansandboxstep(entry.state, to)) {
        if (issandboxterminal(entry.state)) {
          throw new sandboxqueueerror(
            'terminal-phase',
            id,
            entry.state,
            to,
            `sandbox ${id} is terminal (${entry.state}); ${to} is unreachable`,
          );
        }
        throw new sandboxqueueerror(
          'invalid-transition',
          id,
          entry.state,
          to,
          `sandbox ${id} cannot transition ${entry.state} -> ${to}`,
        );
      }
      const from = entry.state;
      entry.state = to;
      entry.enteredat = now;
      entry.deadline = deadlinefor(to, now);
      record(id, from, to, now, 'requested');
      return entry;
    },

    cancel(id, now = Date.now()) {
      const entry = entries.get(id);
      if (entry === undefined) {
        throw new sandboxqueueerror('unknown-sandbox', id, null, 'cancelled');
      }
      const from = entry.state;
      if (!cansandboxstep(from, 'cancelled')) {
        if (issandboxterminal(from)) {
          throw new sandboxqueueerror(
            'terminal-phase',
            id,
            from,
            'cancelled',
            `sandbox ${id} is terminal (${from}); cancellation is unreachable`,
          );
        }
        throw new sandboxqueueerror(
          'invalid-transition',
          id,
          from,
          'cancelled',
          `sandbox ${id} cannot be cancelled from ${from}`,
        );
      }
      entry.state = 'cancelled';
      entry.enteredat = now;
      entry.deadline = null;
      record(id, from, 'cancelled', now, 'cancel');
      return entry;
    },

    healthcheck(now = Date.now()) {
      const reaped: string[] = [];
      for (const entry of entries.values()) {
        if (entry.deadline === null || entry.deadline > now || issandboxterminal(entry.state)) {
          continue;
        }
        const from = entry.state;
        entry.state = 'timedout';
        entry.enteredat = now;
        entry.deadline = null;
        record(entry.id, from, 'timedout', now, 'timeout');
        reaped.push(entry.id);
      }
      return reaped;
    },

    status(id, now = Date.now()) {
      const entry = entries.get(id);
      if (entry === undefined) {
        throw new sandboxqueueerror('unknown-sandbox', id, null, null);
      }
      return statusOf(entry, now);
    },

    list(now = Date.now()) {
      return [...entries.values()]
        .map((entry) => statusOf(entry, now))
        .sort((a, b) => (a.id < b.id ? -1 : 1));
    },

    events() {
      return [...ring];
    },

    size() {
      return entries.size;
    },
  };
}
