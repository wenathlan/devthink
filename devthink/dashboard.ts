// # dashboard.ts — the one keyword file of the desktop shell surface
// domain: the consolidation law of the root (one keyword file per domain,
// lógicas em TS na raiz, um arquivo = responsabilidade única) merged the
// four scattered seats of the desktop shell surface into this file — the
// multi agent dashboard family of the 1.1.96 dashdone completion (the
// former dashdone.ts body below: the panel shapers the background serves
// and the dashboardpage renders), the pure state layer of the desktop icon
// field with the navbar mode lane, the drag verdict and the desktop lock
// posture (the former desktopstate.ts), the alt-tab switcher cycle math
// and key grammar (the former alttab.ts) and the DPI density tokens of
// the one design (the former density.ts) — every export preserved
// verbatim, zero logic changes, zero behavior changes.
// The consolidation notes: the four seats declared no duplicated helper
// and no same-name const across their bodies (the desktop grid cells
// CELL_MEDIUM/CELL_LARGE of the desktopstate section never collide with
// the terminal character cells CELL_W_PX/CELL_H_PX of the density
// section), so every export rides once under its own name with no group
// suffix and both surfaces stay live in one file; the merged import
// surface is the types.js type-only import the dashdone family always
// carried (the other three seats stay import-free pure modules) and the
// lazy storage.ts preference lane of the navbar section stays lazy
// exactly as it rode in its standalone era.

import type {
  agentidentity,
  agentmailbox,
  agentusage,
  conflictscan,
  escalationrecord,
  killswitch,
  leaderworker,
  resourcelock,
  resultreport,
  spawnrecord,
  swarmaction,
  swarmcost,
  taskqueue,
} from "./types.js";

/* ------------------------------------------------------------------ */
/* the dashdone section — the multi agent dashboard family of the      */
/* 1.1.96 completion (the former dashdone.ts, preserved verbatim)      */
/* ------------------------------------------------------------------ */

/** The multi agent dashboard family of the 1.1.96 release: the dashdone completion of the roadmap multi agent certification. The panels the dashboardpage renders live in their own root module beside the swarm family so the frozen library surface of index.ts stays byte identical — the background service worker shapes the view through multiagentviewof, the dashboardpage renders every panel from the shaped view, and the module stays out of the index.ts export graph because the api freeze of 1.1.91 pins that surface until 2.0.0. The family covers the multi agent overview with the topology status, the per agent status cards with their live progress, the shared queue view with its lane filters, the message flow view between agents, the conflict and arbitration log, the cost per agent panel the costcert totals feed, the escalation inbox for human review, the kill switch and pause controls per agent, the timeline scrubber over the interleaved events, the aggregate report download, the read only rendering for observers without the run role, the empty states that guide the first multi agent run and the agent registry snapshot that exports the certified topology inventory. */

/** One per agent status card of the multi agent dashboard: the agent identity with its role, state, depth and tab binding, the live progress of its claimed task, the usage counters against its budget, the unread mailbox count and the handoff arrows it took part in. */
export interface agentstatuscard {
  agentid: string;
  name: string;
  role: string;
  state: string;
  depth: number;
  tabid?: number;
  sessionid?: string;
  parentid?: string;
  currenttask?: string;
  claimed: number;
  done: number;
  tokens: number;
  cost: number;
  steps: number;
  unread: number;
  reviewstatus?: string;
  handoffarrows: string[];
}

/** One row of the shared queue view: the task with its lane, priority, state and the claim that holds it, so the lane filter reads one coherent row per task. */
export interface queuelanerow {
  taskid: string;
  lane: string;
  priority: number;
  state: string;
  payload: string;
  holder?: string;
  heartbeatat?: number;
}

/** One row of the message flow view between agents: the sender, the recipient with its routing kind and the payload with its read marker, so the flow reads as one ordered stream of deliveries. */
export interface messageflowrow {
  messageid: string;
  senderid: string;
  recipient: string;
  routing: string;
  payload: string;
  sentat: number;
  read: boolean;
}

/** One row of the conflict and arbitration log: either one conflict scan with its overlapping writers and the suggested ordering, or one live resource lock with its holder and its kind. */
export interface conflictlogrow {
  source: "conflict" | "lock";
  key: string;
  detail: string;
  writers: string[];
  at: number;
}

/** One row of the cost per agent panel: the agent id with its tokens, cost and steps beside the share of the swarm total, so the costcert reconciliation and the panel read the same numbers. */
export interface costperagentrow {
  agentid: string;
  tokens: number;
  cost: number;
  steps: number;
  share: number;
}

/** One row of the escalation inbox: the raising agent, the subject, the state and the decision when the user already answered, so the inbox reads as the human queue the escalations form. */
export interface escalationrow {
  escalationid: string;
  agentid: string;
  subject: string;
  state: string;
  decision?: string;
  raisedat: number;
}

/** One mark of the timeline scrubber: the interleaved action with its time and its relative position on the scrubber, so the dashboard walks the merged fleet timeline deterministically. */
export interface timelinescrubmark {
  actionid: string;
  kind: string;
  agentid?: string;
  summary: string;
  at: number;
  position: number;
}

/** One entry of the certified topology inventory the agent registry snapshot exports: the agent with its role, state, depth and parent, the topology lane it sits in and the certification scenario families that exercise it. */
export interface topologyinventoryentry {
  agentid: string;
  name: string;
  role: string;
  state: string;
  depth: number;
  parentid?: string;
  lane: string;
  scenarios: string[];
}

/** The shaped multi agent view the dashboardpage renders: every panel of the dashdone completion with the controls flag the viewer role decides. */
export interface multiagentview {
  overview: {
    topology: string;
    leader?: string;
    workers: number;
    critics: number;
    verifiers: number;
    killswitch: string;
    agents: number;
    active: number;
    paused: number;
    stopped: number;
    tasks: number;
    queued: number;
    claimed: number;
    done: number;
    unread: number;
  };
  cards: agentstatuscard[];
  queueview: { lanes: string[]; lane?: string; rows: queuelanerow[] };
  messageflow: { rows: messageflowrow[]; deliveries: number };
  conflictlog: { rows: conflictlogrow[]; open: number };
  costview: {
    rows: costperagentrow[];
    total: { tokens: number; cost: number; steps: number; currency?: string };
    source: string;
  };
  escalationinbox: { rows: escalationrow[]; open: number };
  controls: { pause: boolean; resume: boolean; stop: boolean; killswitch: boolean; reason: string };
  timeline: { marks: timelinescrubmark[]; position: number };
  reportdownload: { filename: string; payload: string; bytes: number; reason: string };
  empty: { empty: boolean; guidance: string[] };
  viewer: { readonly: boolean; controls: boolean; reason: string };
  inventory: { entries: topologyinventoryentry[]; scenarios: number; certified: boolean; reason: string };
}

/** Decides the dashboard view mode of one viewer: an observer without the run role — an agent record carrying the observer role or the readonly scope flag — reads every panel without the controls, because a viewer that never runs steps never pauses, stops or kills the swarm; the operator session and every run role keep the full controls. */
export function dashboardviewerof(input: { viewer?: { role?: string; readonly?: boolean } }): {
  readonly: boolean;
  controls: boolean;
  reason: string;
} {
  const viewer = input.viewer;
  if (viewer === undefined)
    return {
      readonly: false,
      controls: true,
      reason: "The dashboard viewer is the operator session; the run role holds and every control stays available.",
    };
  const readonly = viewer.readonly === true || viewer.role === "observer";
  return {
    readonly,
    controls: !readonly,
    reason: readonly
      ? `The viewer carries the ${viewer.role ?? "readonly"} role without the run grant; the multi agent dashboard renders read only and every control hides.`
      : `The viewer carries the ${viewer.role ?? "run"} role; the multi agent dashboard keeps its controls available.`,
  };
}

/** Shapes the multi agent overview panel: the topology status names the leader, the worker, critic and verifier lanes and the killswitch state beside the at a glance counts of the swarm. */
export function multiagentoverviewof(input: {
  agents: agentidentity[];
  queue: taskqueue;
  topology?: leaderworker;
  killswitch: killswitch;
  unread: number;
}): multiagentview["overview"] {
  const topology = input.topology;
  const active = input.agents.filter((agent) => agent.state === "active").length;
  const paused = input.agents.filter((agent) => agent.state === "paused").length;
  const stopped = input.agents.filter((agent) => agent.state === "stopped").length;
  const queued = input.queue.items.filter((item) => item.state === "queued").length;
  const claimed = input.queue.items.filter((item) => item.state === "claimed").length;
  const done = input.queue.items.filter((item) => item.state === "done").length;
  return {
    topology:
      topology === undefined
        ? "no topology elected"
        : `${topology.rule.kind === "named" ? `named leader ${topology.leaderid}` : `first registered leader ${topology.leaderid}`} with ${topology.workerids.length} worker${topology.workerids.length === 1 ? "" : "s"}, ${topology.criticids.length} critic${topology.criticids.length === 1 ? "" : "s"} and ${topology.verifierids.length} verifier${topology.verifierids.length === 1 ? "" : "s"}`,
    ...(topology?.leaderid !== undefined ? { leader: topology.leaderid } : {}),
    workers: topology?.workerids.length ?? 0,
    critics: topology?.criticids.length ?? 0,
    verifiers: topology?.verifierids.length ?? 0,
    killswitch: input.killswitch.engaged
      ? `kill switch engaged at ${input.killswitch.engagedat ?? 0}`
      : "kill switch disarmed",
    agents: input.agents.length,
    active,
    paused,
    stopped,
    tasks: input.queue.items.length,
    queued,
    claimed,
    done,
    unread: input.unread,
  };
}

/** Shapes one per agent status card: the identity fields the panel lists beside the live progress (its claimed task with the queue counts it owns), the usage counters against its budget and the handoff arrows it took part in. */
export function agentstatuscardof(input: {
  agent: agentidentity;
  usage?: agentusage;
  claim?: { taskid: string; payload: string };
  done: number;
  unread: number;
  reviewstatus?: string;
  handoffarrows?: string[];
}): agentstatuscard {
  const usage = input.usage;
  return {
    agentid: input.agent.id,
    name: input.agent.name,
    role: input.agent.role,
    state: input.agent.state,
    depth: input.agent.depth,
    ...(input.agent.tabid !== undefined ? { tabid: input.agent.tabid } : {}),
    ...(input.agent.sessionid !== undefined ? { sessionid: input.agent.sessionid } : {}),
    ...(input.agent.parentid !== undefined ? { parentid: input.agent.parentid } : {}),
    ...(input.claim !== undefined ? { currenttask: input.claim.payload } : {}),
    claimed: input.claim !== undefined ? 1 : 0,
    done: input.done,
    tokens: usage?.tokens ?? 0,
    cost: usage?.cost ?? 0,
    steps: usage?.steps ?? 0,
    unread: input.unread,
    ...(input.reviewstatus !== undefined ? { reviewstatus: input.reviewstatus } : {}),
    handoffarrows: input.handoffarrows ?? [],
  };
}

/** Shapes the shared queue view with its lane filter: one coherent row per task — its lane, priority, state, payload and the claim that holds it with the heartbeat keeping the claim alive — while the lane filter narrows the rows to the lane the user picked and the empty lane filter keeps every row. */
export function queuelaneviewof(input: { queue: taskqueue; lane?: string }): multiagentview["queueview"] {
  const lane = input.lane !== undefined && input.lane.trim() !== "" ? input.lane.trim() : undefined;
  const rows = input.queue.items
    .filter((item) => lane === undefined || item.lane === lane)
    .map((item) => {
      const claim = input.queue.claims.find((record) => record.taskid === item.id);
      return {
        taskid: item.id,
        lane: item.lane,
        priority: item.priority,
        state: item.state,
        payload: item.payload,
        ...(claim !== undefined ? { holder: claim.agentid, heartbeatat: claim.heartbeatat } : {}),
      };
    });
  return { lanes: [...input.queue.lanes], ...(lane !== undefined ? { lane } : {}), rows };
}

/** Shapes the message flow view between agents: every inbox and outbox message folds into one stream ordered by its send time with the sender, the recipient and its routing kind, the payload and the read marker, so the panel reads the deliveries between every agent pair. */
export function messageflowof(input: { mailboxes: agentmailbox[] }): multiagentview["messageflow"] {
  const rows: messageflowrow[] = [];
  for (const mailbox of input.mailboxes) {
    for (const message of mailbox.inbox)
      rows.push({
        messageid: message.id,
        senderid: message.senderid,
        recipient: mailbox.agentid,
        routing: `${message.routing} inbox`,
        payload: message.payload,
        sentat: message.sentat,
        read: message.readat !== undefined,
      });
    for (const message of mailbox.outbox)
      rows.push({
        messageid: message.id,
        senderid: mailbox.agentid,
        recipient: message.recipient,
        routing: `${message.routing} outbox`,
        payload: message.payload,
        sentat: message.sentat,
        read: message.readat !== undefined,
      });
  }
  rows.sort((one, two) => one.sentat - two.sentat || one.messageid.localeCompare(two.messageid));
  return { rows, deliveries: rows.length };
}

/** Shapes the conflict and arbitration log panel: every conflict scan with its overlapping writers and its suggested ordering beside every live resource lock with its holder and its kind, so the panel reads both the detected conflicts and the arbitration that holds the contested resources. */
export function conflictlogof(input: {
  conflicts: conflictscan[];
  locks: resourcelock[];
}): multiagentview["conflictlog"] {
  const rows: conflictlogrow[] = [];
  for (const scan of input.conflicts) {
    for (const overlap of scan.overlaps)
      rows.push({
        source: "conflict",
        key: `${overlap.origin}|${overlap.selector}`,
        detail: `${scan.clean ? "clean" : "conflict"}: the writers ${overlap.writers.join(", ")} overlap on ${overlap.origin} ${overlap.selector}; the suggested order is ${scan.suggestedorder.join(", ") || "none"}.`,
        writers: overlap.writers,
        at: scan.scannedat,
      });
    if (scan.overlaps.length === 0)
      rows.push({
        source: "conflict",
        key: `scan ${scan.id}`,
        detail: `clean: the ${scan.writers.length} writer${scan.writers.length === 1 ? "" : "s"} touch no overlapping target.`,
        writers: scan.writers.map((writer) => writer.agentid),
        at: scan.scannedat,
      });
  }
  for (const lock of input.locks)
    rows.push({
      source: "lock",
      key: lock.key,
      detail: `${lock.kind} lock held by ${lock.holder} since ${lock.acquiredat}${lock.expiresat !== undefined ? ` expiring at ${lock.expiresat}` : " with no expiry"}.`,
      writers: [lock.holder],
      at: lock.acquiredat,
    });
  rows.sort((one, two) => two.at - one.at || one.key.localeCompare(two.key));
  return { rows, open: input.conflicts.filter((scan) => !scan.clean).length };
}

/** Shapes the cost per agent panel from the accounting the costcert gate reconciles: one row per agent with its tokens, cost and steps beside its share of the swarm total, and the total row the costcert artifact records — the panel and the certification read the same numbers because both fold the same per agent usage. */
export function costperagentof(input: { usage: agentusage[]; totals?: swarmcost }): multiagentview["costview"] {
  const tokens = input.usage.reduce((total, usage) => total + usage.tokens, 0);
  const cost = input.usage.reduce((total, usage) => total + usage.cost, 0);
  const steps = input.usage.reduce((total, usage) => total + usage.steps, 0);
  const rows = [...input.usage]
    .sort((one, two) => one.agentid.localeCompare(two.agentid))
    .map((usage) => ({
      agentid: usage.agentid,
      tokens: usage.tokens,
      cost: usage.cost,
      steps: usage.steps,
      share: tokens > 0 ? Math.round((usage.tokens / tokens) * 100) / 100 : 0,
    }));
  return {
    rows,
    total: {
      tokens,
      cost,
      steps,
      ...(input.totals?.currency !== undefined ? { currency: input.totals.currency } : {}),
    },
    source: "the per agent usage the costcert reconciliation of test/devthink.costcert.ts recomputes",
  };
}

/** Shapes the escalation inbox for human review: every escalation with its raising agent, its subject, its state and the decision the user wrote, so the inbox reads as the human queue the escalations of any agent form; only the open rows wait for the answer. */
export function escalationinboxof(input: { escalations: escalationrecord[] }): multiagentview["escalationinbox"] {
  const rows = [...input.escalations]
    .sort((one, two) => two.raisedat - one.raisedat || one.id.localeCompare(two.id))
    .map((escalation) => ({
      escalationid: escalation.id,
      agentid: escalation.agentid,
      subject: escalation.subject,
      state: escalation.state,
      ...(escalation.decision !== undefined ? { decision: escalation.decision } : {}),
      raisedat: escalation.raisedat,
    }));
  return { rows, open: input.escalations.filter((escalation) => escalation.state === "open").length };
}

/** Shapes the per agent controls: the pause, resume and stop availability of one agent and the kill switch availability of the swarm, gated by the viewer role so an observer without the run role reads the panels without touching the swarm. */
export function agentcontrolsof(input: {
  agent: agentidentity;
  viewer: { readonly: boolean };
  killswitch: killswitch;
}): multiagentview["controls"] {
  if (input.viewer.readonly)
    return {
      pause: false,
      resume: false,
      stop: false,
      killswitch: false,
      reason: "The viewer carries no run role; the multi agent dashboard renders read only and no control dispatches.",
    };
  if (input.killswitch.engaged)
    return {
      pause: false,
      resume: false,
      stop: false,
      killswitch: false,
      reason:
        "The kill switch stays engaged; the stopped agents wait for the re-registration before any control dispatches.",
    };
  return {
    pause: input.agent.state === "active",
    resume: input.agent.state === "paused",
    stop: input.agent.state !== "stopped",
    killswitch: true,
    reason: `The controls follow the ${input.agent.state} state of the agent; the kill switch stops every agent at once.`,
  };
}

/** Shapes the timeline scrubber over the interleaved events: every interleaved action becomes one mark with its relative position on a zero to one scale, so the dashboard walks the merged fleet timeline deterministically and the scrubber position names the mark it rests on. */
export function timelinescrubof(input: { actions: swarmaction[]; position?: number }): multiagentview["timeline"] {
  const actions = [...input.actions].sort((one, two) => one.at - two.at || one.id.localeCompare(two.id));
  const first = actions[0]?.at ?? 0;
  const last = actions[actions.length - 1]?.at ?? first;
  const span = last - first;
  const marks = actions.map((action) => ({
    actionid: action.id,
    kind: action.kind,
    ...(action.agentid !== undefined ? { agentid: action.agentid } : {}),
    summary: action.summary,
    at: action.at,
    position: span > 0 ? Math.round(((action.at - first) / span) * 100) / 100 : 0,
  }));
  const position =
    marks.length === 0
      ? 0
      : Math.min(
          Math.max(
            input.position !== undefined && Number.isFinite(input.position) ? input.position : marks.length - 1,
            0,
          ),
          marks.length - 1,
        );
  return { marks, position: Math.round(position * 100) / 100 };
}

/** Shapes the aggregate report download: the merged result report of the swarm folds into one json payload with a stable file name, so the dashboard downloads exactly what the agents contributed and the audit trail recorded; an absent report answers the empty state instead of an empty file. */
export function aggregatereportdownloadof(input: {
  report?: resultreport;
  now: number;
}): multiagentview["reportdownload"] {
  if (input.report === undefined)
    return {
      filename: "",
      payload: "",
      bytes: 0,
      reason: "No aggregate report exists yet; the swarm builds one when the parallel results merge after the review.",
    };
  const payload = JSON.stringify(
    {
      id: input.report.id,
      title: input.report.title,
      sections: input.report.sections,
      sources: input.report.sources,
      ...(input.report.confidence !== undefined ? { confidence: input.report.confidence } : {}),
      createdat: input.report.createdat,
      exportedat: input.now,
    },
    null,
    2,
  );
  return {
    filename: `devthink-aggregate-${input.report.id}.json`,
    payload,
    bytes: payload.length,
    reason: `The aggregate report of ${input.report.sources.length} contributing agent${input.report.sources.length === 1 ? "" : "s"} over ${input.report.sections.length} section${input.report.sections.length === 1 ? "" : "s"} downloads as one json payload of ${payload.length} bytes.`,
  };
}

/** Shapes the empty state guidance of the multi agent dashboard: a swarm with no registered agent reads the guidance that walks the user through the first multi agent run — registering the first agents, electing the topology, enqueueing the shared queue and watching the panels go live. */
export function dashboardemptyguidanceof(input: { agents: unknown[] }): multiagentview["empty"] {
  if (input.agents.length > 0) return { empty: false, guidance: [] };
  return {
    empty: true,
    guidance: [
      "No agent is registered yet; the first multi agent run starts by registering the agents of the fleet from the sidepanel fleet control.",
      "Attach the roles — the planner drafts, the workers execute, the critic reviews and the verifier confirms — so the leader worker topology has its lanes.",
      "Enqueue the shared tasks into the lanes; the shared queue view shows every task with the agent that claimed it.",
      "Watch this dashboard go live: the overview names the elected topology, the status cards follow every agent and the cost panel sums the accounting the costcert gate reconciles.",
    ],
  };
}

/** Shapes the certified topology inventory the agent registry snapshot exports: one entry per registered agent with its role, state, depth and parent beside the topology lane it sits in and the certification scenario families that exercise it, so the snapshot answers which certified topologies the fleet carries. */
export function topologyinventoryof(input: {
  agents: agentidentity[];
  topology?: leaderworker;
  spawns?: spawnrecord[];
}): multiagentview["inventory"] {
  const topology = input.topology;
  const spawns = input.spawns ?? [];
  const scenariofamilies: Record<string, string[]> = {
    leader: ["leader worker scrape", "competing extraction"],
    worker: ["leader worker scrape", "parallel form fill", "monitoring swarm", "competing extraction"],
    critic: ["planner executor critic", "escalation and review"],
    verifier: ["planner executor critic", "leader worker scrape"],
    planner: ["planner executor critic", "monitoring swarm"],
    observer: ["monitoring swarm"],
  };
  const entries = [...input.agents]
    .sort((one, two) => one.id.localeCompare(two.id))
    .map((agent) => {
      const lane =
        topology?.leaderid === agent.id
          ? "leader"
          : topology?.workerids.includes(agent.id) === true
            ? "worker"
            : topology?.criticids.includes(agent.id) === true
              ? "critic"
              : topology?.verifierids.includes(agent.id) === true
                ? "verifier"
                : spawns.some((spawn) => spawn.childid === agent.id)
                  ? "sub agent"
                  : "unassigned";
      const parent = spawns.find((spawn) => spawn.childid === agent.id);
      const parentid = agent.parentid ?? parent?.parentid;
      return {
        agentid: agent.id,
        name: agent.name,
        role: agent.role,
        state: agent.state,
        depth: agent.depth,
        ...(parentid !== undefined ? { parentid } : {}),
        lane,
        scenarios: scenariofamilies[lane] ?? scenariofamilies[String(agent.role)] ?? ["escalation and review"],
      };
    });
  const scenarios = 6;
  return {
    entries,
    scenarios,
    certified: input.agents.length > 0 && topology !== undefined,
    reason:
      entries.length === 0
        ? "The fleet registry carries no agent; the topology inventory exports the certified scenario families with no live entry."
        : `The agent registry snapshot exports ${entries.length} entr${entries.length === 1 ? "y" : "ies"} over the ${scenarios} certified scenario families${topology !== undefined ? ` with the elected topology of the leader ${topology.leaderid}` : ""}.`,
  };
}

/** Shapes the full multi agent dashboard view from the live swarm state: every panel of the dashdone completion — the overview with the topology status, the per agent status cards, the shared queue view with its lane filter, the message flow, the conflict and arbitration log, the cost per agent panel, the escalation inbox, the per agent controls, the timeline scrubber, the aggregate report download, the empty state guidance, the viewer mode and the topology inventory — in one call the background serves and the dashboardpage renders. */
export function multiagentviewof(input: {
  agents: agentidentity[];
  queue: taskqueue;
  mailboxes: agentmailbox[];
  topology?: leaderworker;
  killswitch: killswitch;
  usage: agentusage[];
  costs: swarmcost[];
  conflicts: conflictscan[];
  locks: resourcelock[];
  escalations: escalationrecord[];
  timeline: swarmaction[];
  report?: resultreport;
  spawns?: spawnrecord[];
  viewer?: { role?: string; readonly?: boolean };
  lane?: string;
  now: number;
}): multiagentview {
  const viewer = dashboardviewerof({ ...(input.viewer !== undefined ? { viewer: input.viewer } : {}) });
  const donecounts = new Map<string, number>();
  for (const item of input.queue.items)
    if (item.state === "done") {
      const claim = input.queue.claims.find((record) => record.taskid === item.id);
      if (claim !== undefined) donecounts.set(claim.agentid, (donecounts.get(claim.agentid) ?? 0) + 1);
    }
  const totals = input.costs.length > 0 ? input.costs[input.costs.length - 1] : undefined;
  const cards = input.agents.map((agent) => {
    const claimrecord = input.queue.claims.find((record) => record.agentid === agent.id);
    const claim =
      claimrecord !== undefined ? input.queue.items.find((item) => item.id === claimrecord.taskid) : undefined;
    const usage = input.usage.find((entry) => entry.agentid === agent.id);
    return agentstatuscardof({
      agent,
      ...(usage !== undefined ? { usage } : {}),
      ...(claim !== undefined ? { claim: { taskid: claim.id, payload: claim.payload } } : {}),
      done: donecounts.get(agent.id) ?? 0,
      unread: input.mailboxes.find((mailbox) => mailbox.agentid === agent.id)?.unread ?? 0,
      handoffarrows: [],
    });
  });
  const unread = input.mailboxes.reduce((total, mailbox) => total + mailbox.unread, 0);
  return {
    overview: multiagentoverviewof({
      agents: input.agents,
      queue: input.queue,
      ...(input.topology !== undefined ? { topology: input.topology } : {}),
      killswitch: input.killswitch,
      unread,
    }),
    cards,
    queueview: queuelaneviewof({ queue: input.queue, ...(input.lane !== undefined ? { lane: input.lane } : {}) }),
    messageflow: messageflowof({ mailboxes: input.mailboxes }),
    conflictlog: conflictlogof({ conflicts: input.conflicts, locks: input.locks }),
    costview: costperagentof({ usage: input.usage, ...(totals !== undefined ? { totals } : {}) }),
    escalationinbox: escalationinboxof({ escalations: input.escalations }),
    controls: {
      pause: viewer.controls,
      resume: viewer.controls,
      stop: viewer.controls,
      killswitch: viewer.controls,
      reason: viewer.reason,
    },
    timeline: timelinescrubof({ actions: input.timeline }),
    reportdownload: aggregatereportdownloadof({
      ...(input.report !== undefined ? { report: input.report } : {}),
      now: input.now,
    }),
    empty: dashboardemptyguidanceof({ agents: input.agents }),
    viewer,
    inventory: topologyinventoryof({
      agents: input.agents,
      ...(input.topology !== undefined ? { topology: input.topology } : {}),
      ...(input.spawns !== undefined ? { spawns: input.spawns } : {}),
    }),
  };
}

/* ------------------------------------------------------------------ */
/* the desktopstate section — the pure state layer of the desktop     */
/* icon field, the navbar mode lane and the lock posture (the former  */
/* desktopstate.ts, preserved verbatim)                               */
/* ------------------------------------------------------------------ */

/**
 * desktopstate.ts — the pure state layer of the desktop icon field
 * (sol/panel/desktop.tsx): persistence, clamping, snapping, sorting and the
 * Windows left-aligned column grid as free functions with no react — the
 * desktop component owns the pointer work, this module owns the math and
 * the storage. Positions are percentages of the desktop area (the center of
 * the icon cell), persisted under one localStorage key as a map of
 * appId → {x, y}. Every helper here is deterministic and unit-testable.
 */

export type IconSpot = { x: number; y: number };

export type IconBounds = { minX: number; maxX: number; minY: number; maxY: number };

export type IconSpotMap = Record<string, IconSpot>;

/** the localStorage key of the moved desktop icons (appId → spot in %) —
 * v4: the Windows desktop face — the left-aligned column grid is the
 * default layout (the real windows desktop law), so every visitor starts
 * from the ordered grid and moved icons persist on top of it */
export const ICONS_STORAGE_KEY = "dt.desktop.icons.v4";

/** the fine snap lattice of the field: multiples of 2% x and 3.33% y —
 * smooth to drag, orderly to rest (every icon lands on the same grid) */
export const SNAP_STEP_X = 2;
export const SNAP_STEP_Y = 10 / 3;

/** the win11 desktop icon cell sizes (medium is the Sol default cell) */
export const CELL_MEDIUM = { width: 74, height: 84 };
export const CELL_LARGE = { width: 92, height: 104 };

/** the fixed chrome bands of the shell in px — the 48px taskbar topbar with
 * breathing room, and the floating dock strip (workspace.tsx constants) */
export const BAND_TOP_PX = 48;
export const BAND_BOTTOM_PX = 84;
/** the breathing edge kept clear on every side of the desktop, in px */
export const EDGE_PX = 8;

export type IconSize = "medium" | "large";

/** the pixel box of one icon size (drives the clamp bounds) */
export function cellSize(size: IconSize): { width: number; height: number } {
  return size === "large" ? CELL_LARGE : CELL_MEDIUM;
}

export function clampNumber(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

/** snaps a spot onto the fine lattice (2% x, 3.33% y) */
export function snapSpot(spot: IconSpot): IconSpot {
  return {
    x: round2(Math.round(spot.x / SNAP_STEP_X) * SNAP_STEP_X),
    y: round2(Math.round(spot.y / SNAP_STEP_Y) * SNAP_STEP_Y),
  };
}

/** clamps a spot inside the desktop bounds */
export function clampSpot(spot: IconSpot, bounds: IconBounds): IconSpot {
  return {
    x: round2(clampNumber(spot.x, bounds.minX, bounds.maxX)),
    y: round2(clampNumber(spot.y, bounds.minY, bounds.maxY)),
  };
}

/** clamp + snap — the resting form of a user-moved spot */
export function fitSpot(spot: IconSpot, bounds: IconBounds): IconSpot {
  return snapSpot(clampSpot(spot, bounds));
}

/**
 * the percentage bounds of a desktop area of widthPx × heightPx: a cell of
 * the given size stays fully inside the area (half-cell + edge on every
 * side) and clear of the top taskbar band and the bottom dock band.
 */
export function boundsForArea(
  widthPx: number,
  heightPx: number,
  cellWidth: number,
  cellHeight: number,
  bandTopPx: number = BAND_TOP_PX,
  bandBottomPx: number = BAND_BOTTOM_PX,
): IconBounds {
  const width = Math.max(widthPx, 1);
  const height = Math.max(heightPx, 1);
  const insetX = clampNumber(((cellWidth / 2 + EDGE_PX) / width) * 100, 0, 49);
  const insetTop = clampNumber(((bandTopPx + cellHeight / 2 + EDGE_PX) / height) * 100, 0, 90);
  const insetBottom = clampNumber(((bandBottomPx + cellHeight / 2 + EDGE_PX) / height) * 100, 0, 90);
  const minY = round2(insetTop);
  return {
    minX: round2(insetX),
    maxX: round2(100 - insetX),
    minY,
    maxY: round2(Math.max(minY + 1, 100 - insetBottom)),
  };
}

/** validates an untrusted spot map (storage answers as JSON): only finite
 * coordinate pairs survive, everything else drops silently */
export function normalizeSpotMap(raw: unknown): IconSpotMap {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  const spots: IconSpotMap = {};
  for (const [id, value] of Object.entries(raw as Record<string, unknown>)) {
    if (!id || !value || typeof value !== "object" || Array.isArray(value)) continue;
    const record = value as Record<string, unknown>;
    const x = record.x;
    const y = record.y;
    if (typeof x !== "number" || typeof y !== "number") continue;
    if (!Number.isFinite(x) || !Number.isFinite(y)) continue;
    spots[id] = { x, y };
  }
  return spots;
}

/** reads the stored icon overrides (an empty map when storage is absent) */
export function loadIconSpots(): IconSpotMap {
  try {
    const raw = window.localStorage.getItem(ICONS_STORAGE_KEY);
    if (!raw) return {};
    return normalizeSpotMap(JSON.parse(raw) as unknown);
  } catch {
    /* storage unavailable or corrupt: the defaults carry the layout */
    return {};
  }
}

/** persists the icon overrides (a no-op when storage is unavailable) */
export function saveIconSpots(spots: IconSpotMap): void {
  try {
    window.localStorage.setItem(ICONS_STORAGE_KEY, JSON.stringify(spots));
  } catch {
    /* storage unavailable: positions live for the session only */
  }
}

/** clears the stored overrides — the "reset layout" / "original spots" action */
export function clearIconSpots(): void {
  try {
    window.localStorage.removeItem(ICONS_STORAGE_KEY);
  } catch {
    /* storage unavailable: the in-memory reset still applies */
  }
}

/**
 * the resolved layout: the deterministic default spots with the stored
 * overrides on top. Defaults are only clamped (the hand-tuned organic
 * composition is never forced onto the snap lattice); user-moved spots are
 * clamped and snapped. Stale overrides (apps that left the catalog) drop out.
 */
export function mergedSpots(defaults: IconSpotMap, overrides: IconSpotMap, bounds: IconBounds): IconSpotMap {
  const merged: IconSpotMap = {};
  for (const [id, spot] of Object.entries(defaults)) {
    const override = overrides[id];
    merged[id] = override ? fitSpot(override, bounds) : clampSpot(spot, bounds);
  }
  return merged;
}

/** the minimal app shape the sorters need (the desktop maps its catalog onto it) */
export type SortableApp = { id: string; name: string; kind: string };

/** how a desktop app opens (the appregistry target kinds, in tab order) */
const KIND_ORDER = ["window", "destination", "route", "os", "external"] as const;

function kindRank(kind: string): number {
  const index = KIND_ORDER.indexOf(kind as (typeof KIND_ORDER)[number]);
  return index === -1 ? KIND_ORDER.length : index;
}

/** the catalog sorted by display name (stable by id) */
export function sortAppsByName<T extends SortableApp>(apps: readonly T[]): T[] {
  return [...apps].sort((a, b) => a.name.localeCompare(b.name) || a.id.localeCompare(b.id));
}

/** the catalog sorted by target kind, then name (stable by id) */
export function sortAppsByKind<T extends SortableApp>(apps: readonly T[]): T[] {
  return [...apps].sort(
    (a, b) => kindRank(a.kind) - kindRank(b.kind) || a.name.localeCompare(b.name) || a.id.localeCompare(b.id),
  );
}

/**
 * the Windows desktop grid — the default layout of the icon field: the
 * left-aligned column grid the real desktop keeps, filled top-to-bottom
 * then wrapped to the next column (the win11React .desktopCont column
 * flow). The pitch is the icon cell plus the 8px grid gutter, measured
 * against the live area, and the row count derives from the usable height
 * between the top band and the dock strip, so every viewport keeps the
 * same tidy columns.
 *
 * @param count the number of icons to lay out.
 * @param widthPx the pixel width of the desktop area.
 * @param heightPx the pixel height of the desktop area.
 * @param cell the pixel box of one icon cell (the medium cell by default).
 * @returns one grid spot per icon, clamped inside the reference bounds.
 */
export function gridSpots(
  count: number,
  widthPx: number,
  heightPx: number,
  cell: { width: number; height: number } = CELL_MEDIUM,
): IconSpot[] {
  const width = Math.max(widthPx, 1);
  const height = Math.max(heightPx, 1);
  const bounds = boundsForArea(width, height, cell.width, cell.height);
  const pitchX = ((cell.width + GRID_GAP_PX) / width) * 100;
  const pitchY = ((cell.height + GRID_GAP_PX) / height) * 100;
  const usable = bounds.maxY - bounds.minY;
  const rows = Math.max(1, Math.floor(usable / pitchY) + 1);
  const spots: IconSpot[] = [];
  for (let index = 0; index < count; index += 1) {
    const column = Math.floor(index / rows);
    const row = index % rows;
    spots.push(clampSpot({ x: bounds.minX + column * pitchX, y: bounds.minY + row * pitchY }, bounds));
  }
  return spots;
}

/** the gap between two grid cells, in px (the win11React margin law) */
export const GRID_GAP_PX = 8;

/** the grid layout of one app list (catalog order, or a pre-sorted list)
 * as a spot map — the default layout AND the "sort by" reflow share it.
 * The row shape is the minimal one the mapping needs (an id), so the
 * catalog rows and the sorter rows ride the same function. */
export function gridLayoutSpots<T extends { id: string }>(
  apps: readonly T[],
  widthPx: number,
  heightPx: number,
  cell: { width: number; height: number } = CELL_MEDIUM,
): IconSpotMap {
  const slots = gridSpots(apps.length, widthPx, heightPx, cell);
  const spots: IconSpotMap = {};
  apps.forEach((app, index) => {
    const slot = slots[index];
    if (slot) spots[app.id] = slot;
  });
  return spots;
}

/* ------------------------------------------------------------------ */
/* the navbar mode — floating and docked, the two faces of the shell   */
/* bar: the floating pad (centered, rounded, the magnifying dock) and  */
/* the docked bar pinned to one screen edge (the bottom taskbar or the */
/* 48px side rail). The choice persists on the system store — the      */
/* account-scoped browser preference lane of storage.ts (the same      */
/* machine the theme and the display name ride), never a raw browser   */
/* localStorage key of this build.                                     */
/* ------------------------------------------------------------------ */

/** the mode the shell bar wears: floating (the detached rounded pad — the
 * magnifying dock) or docked (the bar pinned to one screen edge) */
export type NavbarMode = "floating" | "docked";

/** the screen edge the docked bar hugs (the floating pad ignores it) */
export type NavbarEdge = "bottom" | "left" | "right";

/** the account preference keys the mode and the edge ride (the system
 * store of storage.ts — one preference per concern, account-scoped) */
export const NAVBAR_MODE_PREF = "navbarMode";
export const NAVBAR_EDGE_PREF = "navbarEdge";

/** the window events a mode or edge change dispatches — the shell chrome
 * and the settings card listen, so the bar re-docks the moment a choice
 * or a drag lands */
export const NAVBAR_MODE_EVENT = "dt-navbar-mode";
export const NAVBAR_EDGE_EVENT = "dt-navbar-edge";

/** validates an untrusted stored mode (the store answers as text) */
export function isNavbarMode(value: unknown): value is NavbarMode {
  return value === "floating" || value === "docked";
}

/** validates an untrusted stored edge */
export function isNavbarEdge(value: unknown): value is NavbarEdge {
  return value === "bottom" || value === "left" || value === "right";
}

/** the account preference lane: the browser preference store of the os
 * (storage.ts), imported lazily so the pure layer stays loadable
 * everywhere the chrome is (the browser bundle already carries the
 * module — the auth and the gateway faces ride it) */
interface Preferencelane {
  readBrowserPreferences(): Promise<Record<string, string>>;
  saveBrowserPreference(key: string, value: string): Promise<unknown>;
}

async function preferencelane(): Promise<Preferencelane | null> {
  try {
    const lane = (await import("./storage.ts")) as Preferencelane;
    if (typeof lane.readBrowserPreferences !== "function" || typeof lane.saveBrowserPreference !== "function")
      return null;
    return lane;
  } catch {
    return null;
  }
}

/**
 * reads the stored navbar mode from the account store (floating when the
 * store is away, empty or stale — the honest default).
 */
export async function loadNavbarMode(): Promise<NavbarMode> {
  try {
    const lane = await preferencelane();
    if (!lane) return "floating";
    const preferences = await lane.readBrowserPreferences();
    if (isNavbarMode(preferences[NAVBAR_MODE_PREF])) return preferences[NAVBAR_MODE_PREF];
  } catch {
    /* the store is unavailable: the floating pad carries the shell */
  }
  return "floating";
}

/**
 * reads the stored dock edge from the account store (bottom when absent
 * or stale — the full-width taskbar edge).
 */
export async function loadNavbarEdge(): Promise<NavbarEdge> {
  try {
    const lane = await preferencelane();
    if (!lane) return "bottom";
    const preferences = await lane.readBrowserPreferences();
    if (isNavbarEdge(preferences[NAVBAR_EDGE_PREF])) return preferences[NAVBAR_EDGE_PREF];
  } catch {
    /* the store is unavailable: the bottom edge carries the bar */
  }
  return "bottom";
}

/**
 * persists the navbar mode on the account store (best effort: the store
 * may be away, the mode then lives for the session through the event).
 */
export function saveNavbarMode(mode: NavbarMode): void {
  void preferencelane()
    .then((lane) => (lane ? lane.saveBrowserPreference(NAVBAR_MODE_PREF, mode) : undefined))
    .catch(() => undefined);
}

/**
 * persists the navbar edge on the account store (best effort, the same
 * session-only honesty the mode rides).
 */
export function saveNavbarEdge(edge: NavbarEdge): void {
  void preferencelane()
    .then((lane) => (lane ? lane.saveBrowserPreference(NAVBAR_EDGE_PREF, edge) : undefined))
    .catch(() => undefined);
}

/* ------------------------------------------------------------------ */
/* the drag verdict — the smart gestures that move the bar between its */
/* two modes: pull the bar up and it floats; pull it sideways and it   */
/* docks to that edge; pull a docked bar off its wall and it floats    */
/* again with the rounded corners back. Pure math, no DOM.             */
/* ------------------------------------------------------------------ */

/** the lift (px) a bottom-docked bar answers before it floats */
export const NAVBAR_FLOAT_LIFT_PX = 32;
/** the sideways pull (px) before the bar docks to the dragged edge */
export const NAVBAR_DOCK_PULL_PX = 48;
/** the release (px, about a millimeter of travel) a docked bar answers
 * before it leaves its wall and floats again */
export const NAVBAR_RELEASE_PX = 6;

/** the stance a drag starts from (the bar's current mode and edge) */
export type NavbarStance = { mode: NavbarMode; edge: NavbarEdge };

/** the verdict a completed drag lands (the new stance), or null while the
 * gesture has not crossed any threshold yet */
export type NavbarDragVerdict = { mode: NavbarMode; edge: NavbarEdge } | null;

/**
 * the drag verdict of one pointer gesture: the pointer travel (dx, dy)
 * against the stance the bar rests in. The three laws the owner ordered:
 * pulling up floats the bar, pulling sideways docks it to that edge, and
 * pulling a docked bar off its wall floats it again. The sideways pulls
 * answer only when they outrun the vertical travel, so a diagonal drag
 * never lands on the wrong wall; the reverse of every law rides too (a
 * floating pad pushed back down re-docks on the bottom edge).
 *
 * @param stance the mode and edge the bar rests in.
 * @param dx the horizontal pointer travel (px, right positive).
 * @param dy the vertical pointer travel (px, down positive).
 * @returns the new stance once a threshold crossed, null before that.
 */
export function navbarDragVerdict(stance: NavbarStance, dx: number, dy: number): NavbarDragVerdict {
  const { mode, edge } = stance;
  const horizontalWins = Math.abs(dx) > Math.abs(dy);
  if (mode === "docked") {
    // a docked bar leaves its wall on the ~1mm pull — the rounded corners
    // come back with the floating pad
    if (edge === "left" && dx >= NAVBAR_RELEASE_PX) return { mode: "floating", edge: "bottom" };
    if (edge === "right" && dx <= -NAVBAR_RELEASE_PX) return { mode: "floating", edge: "bottom" };
    if (edge === "bottom") {
      // the bottom edge answers every direction: up floats, sideways docks
      if (dy <= -NAVBAR_FLOAT_LIFT_PX) return { mode: "floating", edge: "bottom" };
      if (horizontalWins) {
        if (dx <= -NAVBAR_DOCK_PULL_PX) return { mode: "docked", edge: "left" };
        if (dx >= NAVBAR_DOCK_PULL_PX) return { mode: "docked", edge: "right" };
      }
    }
    return null;
  }
  // the floating pad: push it down to re-dock on the bottom edge, pull it
  // sideways to dock on that wall
  if (dy >= NAVBAR_DOCK_PULL_PX && !horizontalWins) return { mode: "docked", edge: "bottom" };
  if (horizontalWins) {
    if (dx <= -NAVBAR_DOCK_PULL_PX) return { mode: "docked", edge: "left" };
    if (dx >= NAVBAR_DOCK_PULL_PX) return { mode: "docked", edge: "right" };
  }
  return null;
}

/* ------------------------------------------------------------------ */
/* the desktop lock — the lock state of the desktop surface. The win11 */
/* chain: boot → desktop, and the lock rides ON the desktop (the lock  */
/* overlay of sol/wingets/PanelDesktoplock.tsx) instead of gating the  */
/* entry: no screen ever blocks the desktop. The state persists on the */
/* session (a reload of a locked tab stays locked, a fresh tab does    */
/* not inherit it) and the dt-desktop-lock event re-faces the shell    */
/* the moment a lock or an unlock lands. Pure helpers, no react.       */
/* ------------------------------------------------------------------ */

/** the lock posture of the desktop surface */
export type DesktopLockState = "locked" | "unlocked";

/** the sessionStorage key of the desktop lock posture */
export const DESKTOP_LOCK_STORAGE_KEY = "dt.desktop.lock";

/** the window event a lock or an unlock dispatches (detail: the state) —
 * the workspace and the lock overlay listen, so the face flips the
 * moment the posture changes */
export const DESKTOP_LOCK_EVENT = "dt-desktop-lock";

/** validates an untrusted stored posture (storage answers as text) */
export function isDesktopLockState(value: unknown): value is DesktopLockState {
  return value === "locked" || value === "unlocked";
}

/** reads the stored lock posture (unlocked when storage is absent or
 * stale — the honest default: the desktop never blocks the entry) */
export function loadDesktopLock(): DesktopLockState {
  try {
    const raw = window.sessionStorage.getItem(DESKTOP_LOCK_STORAGE_KEY);
    if (isDesktopLockState(raw)) return raw;
  } catch {
    /* storage unavailable: the unlocked posture carries the shell */
  }
  return "unlocked";
}

/** persists the lock posture (a no-op when storage is unavailable) */
export function saveDesktopLock(state: DesktopLockState): void {
  try {
    window.sessionStorage.setItem(DESKTOP_LOCK_STORAGE_KEY, state);
  } catch {
    /* storage unavailable: the posture lives for the mount only */
  }
}

/** one lock/unlock side effect bundle: the posture persists and the
 * dt-desktop-lock event tells the shell (the callers keep one line) */
export function commitDesktopLock(state: DesktopLockState): void {
  saveDesktopLock(state);
  try {
    window.dispatchEvent(new CustomEvent<DesktopLockState>(DESKTOP_LOCK_EVENT, { detail: state }));
  } catch {
    /* no window: nothing to tell */
  }
}

/* ------------------------------------------------------------------ */
/* the alttab section — the alt-tab switcher cycle math and key       */
/* grammar (the former alttab.ts, preserved verbatim)                 */
/* ------------------------------------------------------------------ */

/**
 * alttab — the pure logic behind the Windows alt-tab switcher of the Sol
 * shell (sol/shell/alttabswitcher.tsx). One responsibility: the cycle math
 * and the key grammar of the switcher. The switcher walks the MRU window
 * order (most recently focused first), stepping forward with alt+tab and
 * backward with alt+shift+tab, wrapping at both ends; the arrow keys walk
 * the visible cards the same way; releasing Alt commits the selected
 * window and Escape cancels back to the pre-switch focus. The key grammar
 * is matched by one predicate pair (`alttabkeydown` / `altkeyup`) so the
 * component stays presentational; `nextaltindex` never mutates and never
 * touches the DOM, so the reduced-motion rule of the stylesheet keeps the
 * only visual opinion (the hard stop zeroes the entrance).
 */

/**
 * Answers whether a keyboard event is the alt+tab cycle chord (with or
 * without shift — both directions ride the same chord) or one of the
 * in-switcher navigation keys.
 *
 * @param event the raw keyboard event.
 * @returns true when the event drives the switcher.
 */
export function alttabkeydown(event: KeyboardEvent): boolean {
  if (event.key === "Tab" && event.altKey) return true;
  if (event.altKey && (event.key === "ArrowRight" || event.key === "ArrowLeft")) return true;
  return false;
}

/**
 * Answers whether a keyboard event ends the switcher gesture: the Alt
 * release commits the selection, Escape cancels it.
 *
 * @param event the raw keyboard event.
 * @returns true when the gesture ends with this event.
 */
export function altgestureend(event: KeyboardEvent): boolean {
  if (event.key === "Alt") return true;
  return event.key === "Escape";
}

/**
 * Steps one index through the cycle with wrap-around in both directions.
 *
 * @param current the selected index (any integer — it wraps).
 * @param step the signed step (1 = next older window, -1 = back toward the
 * most recent one).
 * @param count the cycle length; a non-positive count answers 0.
 * @returns the next index, always inside `0..count-1`.
 */
export function nextaltindex(current: number, step: number, count: number): number {
  if (count <= 0) return 0;
  const moved = (((current + step) % count) + count) % count;
  return moved;
}

/**
 * Ranks the windows in the MRU order the switcher walks: the array order
 * of the shell window list already is the z order (last = focused), so the
 * reversed copy is the alt-tab order. Minimized windows stay in the cycle
 * (alt-tab restores them on commit, exactly like Windows).
 *
 * @param ids the window ids in z order (last = topmost).
 * @returns the same ids, most recently focused first.
 */
export function mruorder(ids: string[]): string[] {
  return [...ids].reverse();
}

/* ------------------------------------------------------------------ */
/* the density section — the DPI law of the one design (the former    */
/* density.ts, preserved verbatim)                                    */
/* ------------------------------------------------------------------ */

/**
 * density.ts — the DPI law of the one design (wave 2-c / PR11): the family
 * answers every screen with ONE design; the only thing a platform changes is
 * the density it renders that design at. This module is the single token
 * splitter every surface reads — the web (vercel, cloudflare, netlify — the
 * same static build), the terminal conversion (buildterminal.ts rides these
 * tokens when it maps the Sol widgets to cells), the TV 10-foot face and the
 * android dp face all resolve the SAME spacing rhythm through here, so a
 * second design can never fork in.
 *
 * The law in tokens:
 * - web — the device pixel ratio ladder (1x / 2x / 3x): the CSS px grid of
 *   the design stays the unit, the device doubles and triples behind it;
 * - terminal — the character cell is the unit: one cell horizontally
 *   (≈8px) and one row vertically (≈16px); every spacing of the design
 *   quantizes to cells, never to fractions of a glyph;
 * - tv — the 10-foot face: the same rhythm at a 1.75 factor with the
 *   generous hit targets a couch distance needs;
 * - android — density-independent pixels: dp is the design unit, px = dp ×
 *   dpi/160, the mdpi→xxxhdpi buckets are the dpi ladder of the platform.
 *
 * Pure TypeScript, zero imports, DOM-free: the browser, the build converter
 * and the terminal runtime all import the same module.
 */

/** the platforms the one design answers */
export type DensityPlatform = "web" | "terminal" | "tv" | "android";

/** every platform of the law, in the canonical family order */
export const DENSITY_PLATFORMS: readonly DensityPlatform[] = ["web", "terminal", "tv", "android"];

/** the web device pixel ratio ladder */
export type WebDpr = 1 | 2 | 3;

/** the android density buckets (the dpi ladder of the platform) */
export type AndroidBucket = "mdpi" | "hdpi" | "xhdpi" | "xxhdpi" | "xxxhdpi";

/** the android bucket → dpi and factor table (160dpi is the dp baseline) */
export const ANDROID_DPI: Readonly<Record<AndroidBucket, number>> = {
  mdpi: 160,
  hdpi: 240,
  xhdpi: 320,
  xxhdpi: 480,
  xxxhdpi: 640,
};

/** the terminal character cell: the nominal cell of the medium (a mono glyph
 * is ≈8px wide and ≈16px tall on the reference terminal) — every px of the
 * design quantizes through these when the conversion maps it to cells */
export const CELL_W_PX = 8;
export const CELL_H_PX = 16;

/** the reference columns/rows of the terminal face (the 80×24 contract the
 * conversion renders into — the same measure the 640px lede answers) */
export const TERMINAL_COLUMNS = 80;
export const TERMINAL_ROWS = 24;

/** the tv 10-foot factor: the couch distance scale of the same rhythm */
export const TV_TEN_FOOT_FACTOR = 1.75;

/** the resolved density tokens of the one design on one platform */
export type DensityTokens = {
  /** the platform the tokens answer */
  platform: DensityPlatform;
  /** the multiplier the platform renders the design at (web dpr, terminal 1
   * cell, tv 10-foot, android bucket factor) */
  factor: number;
  /** the unit the platform counts the rhythm in */
  unit: "px" | "cell" | "dp";
  /** the base spacing step of the design (the 4px rhythm) in the unit */
  step: number;
  /** the hairline width in the unit (the 1px rule of the design) */
  hairline: number;
  /** the icon size of the design in the unit */
  icon: number;
  /** the body font size of the design in the unit */
  font: number;
  /** the minimum interactive target in the unit (the affordance law) */
  hit: number;
  /** how many columns the responsive grid folds into on this platform */
  columns: number;
};

/** the platform hint the caller may pass (every field optional) */
export type DensityHint = {
  /** the web device pixel ratio */
  dpr?: WebDpr;
  /** the android density bucket */
  bucket?: AndroidBucket;
  /** the live terminal size in cells */
  cols?: number;
  rows?: number;
};

/** resolves the density tokens of the one design for one platform.
 *
 * @param platform the platform the tokens answer.
 * @param hint optional resolution hints (web dpr, android bucket, live
 *        terminal size). Defaults: web 2x (the reference display), terminal
 *        80×24, tv 1080p couch, android xhdpi (the reference handset).
 */
export function densityTokens(platform: DensityPlatform, hint: DensityHint = {}): DensityTokens {
  switch (platform) {
    case "web": {
      const dpr: WebDpr = hint.dpr ?? 2;
      return {
        platform,
        factor: dpr,
        unit: "px",
        step: 4,
        hairline: 1,
        icon: 16 * dpr,
        font: 13,
        hit: 24,
        columns: 12,
      };
    }
    case "terminal": {
      const cols = hint.cols ?? TERMINAL_COLUMNS;
      return {
        platform,
        factor: 1,
        unit: "cell",
        step: 1,
        hairline: 1,
        icon: 1,
        font: 1,
        hit: 1,
        columns: cols,
      };
    }
    case "tv": {
      return {
        platform,
        factor: TV_TEN_FOOT_FACTOR,
        unit: "px",
        step: 4 * TV_TEN_FOOT_FACTOR,
        hairline: 2,
        icon: 28 * TV_TEN_FOOT_FACTOR,
        font: Math.round(13 * TV_TEN_FOOT_FACTOR),
        hit: Math.round(24 * 2),
        columns: 12,
      };
    }
    case "android": {
      const bucket: AndroidBucket = hint.bucket ?? "xhdpi";
      const dpi = ANDROID_DPI[bucket];
      return {
        platform,
        factor: dpi / 160,
        unit: "dp",
        step: 4,
        hairline: 1,
        icon: 16,
        font: 13,
        hit: 24,
        columns: 4,
      };
    }
  }
}

/** converts android dp to device px at one bucket (px = dp × dpi/160) */
export function dpToPx(dp: number, bucket: AndroidBucket): number {
  return dp * (ANDROID_DPI[bucket] / 160);
}

/** converts design px to terminal cells: the horizontal lane quantizes to
 * the cell width, the vertical lane to the row height (never a fraction of a
 * glyph — the conversion rounds to the nearest cell, minimum one) */
export function pxToCellX(px: number): number {
  return Math.max(1, Math.round(px / CELL_W_PX));
}
export function pxToCellY(px: number): number {
  return Math.max(1, Math.round(px / CELL_H_PX));
}

/** the device pixels one design px renders at on one platform (the dpi
 * difference, the only difference) */
export function designPxToPlatformPx(px: number, platform: DensityPlatform, hint: DensityHint = {}): number {
  const tokens = densityTokens(platform, hint);
  if (platform === "terminal") return pxToCellX(px) * CELL_W_PX;
  return px * tokens.factor;
}
