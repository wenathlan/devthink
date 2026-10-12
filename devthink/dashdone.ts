/** The multi agent dashboard family of the 1.1.96 release: the dashdone completion of the roadmap multi agent certification. The panels the dashboardpage renders live in their own root module beside the swarm family so the frozen library surface of index.ts stays byte identical — the background service worker shapes the view through multiagentviewof, the dashboardpage renders every panel from the shaped view, and the module stays out of the index.ts export graph because the api freeze of 1.1.91 pins that surface until 2.0.0. The family covers the multi agent overview with the topology status, the per agent status cards with their live progress, the shared queue view with its lane filters, the message flow view between agents, the conflict and arbitration log, the cost per agent panel the costcert totals feed, the escalation inbox for human review, the kill switch and pause controls per agent, the timeline scrubber over the interleaved events, the aggregate report download, the read only rendering for observers without the run role, the empty states that guide the first multi agent run and the agent registry snapshot that exports the certified topology inventory. */
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
    source: "the per agent usage the costcert reconciliation of tests/artifacts/costcert.json recomputes",
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
