/*! devthink 2.0.0 — consent-first browser agent library — GPL-3.0-only — https://github.com/wenathlan/extension */

// dashdone.ts
function dashboardviewerof(input) {
  const viewer = input.viewer;
  if (viewer === void 0) return { readonly: false, controls: true, reason: "The dashboard viewer is the operator session; the run role holds and every control stays available." };
  const readonly = viewer.readonly === true || viewer.role === "observer";
  return { readonly, controls: !readonly, reason: readonly ? `The viewer carries the ${viewer.role ?? "readonly"} role without the run grant; the multi agent dashboard renders read only and every control hides.` : `The viewer carries the ${viewer.role ?? "run"} role; the multi agent dashboard keeps its controls available.` };
}
function multiagentoverviewof(input) {
  const topology = input.topology;
  const active = input.agents.filter((agent) => agent.state === "active").length;
  const paused = input.agents.filter((agent) => agent.state === "paused").length;
  const stopped = input.agents.filter((agent) => agent.state === "stopped").length;
  const queued = input.queue.items.filter((item) => item.state === "queued").length;
  const claimed = input.queue.items.filter((item) => item.state === "claimed").length;
  const done = input.queue.items.filter((item) => item.state === "done").length;
  return {
    topology: topology === void 0 ? "no topology elected" : `${topology.rule.kind === "named" ? `named leader ${topology.leaderid}` : `first registered leader ${topology.leaderid}`} with ${topology.workerids.length} worker${topology.workerids.length === 1 ? "" : "s"}, ${topology.criticids.length} critic${topology.criticids.length === 1 ? "" : "s"} and ${topology.verifierids.length} verifier${topology.verifierids.length === 1 ? "" : "s"}`,
    ...topology?.leaderid !== void 0 ? { leader: topology.leaderid } : {},
    workers: topology?.workerids.length ?? 0,
    critics: topology?.criticids.length ?? 0,
    verifiers: topology?.verifierids.length ?? 0,
    killswitch: input.killswitch.engaged ? `kill switch engaged at ${input.killswitch.engagedat ?? 0}` : "kill switch disarmed",
    agents: input.agents.length,
    active,
    paused,
    stopped,
    tasks: input.queue.items.length,
    queued,
    claimed,
    done,
    unread: input.unread
  };
}
function agentstatuscardof(input) {
  const usage = input.usage;
  return {
    agentid: input.agent.id,
    name: input.agent.name,
    role: input.agent.role,
    state: input.agent.state,
    depth: input.agent.depth,
    ...input.agent.tabid !== void 0 ? { tabid: input.agent.tabid } : {},
    ...input.agent.sessionid !== void 0 ? { sessionid: input.agent.sessionid } : {},
    ...input.agent.parentid !== void 0 ? { parentid: input.agent.parentid } : {},
    ...input.claim !== void 0 ? { currenttask: input.claim.payload } : {},
    claimed: input.claim !== void 0 ? 1 : 0,
    done: input.done,
    tokens: usage?.tokens ?? 0,
    cost: usage?.cost ?? 0,
    steps: usage?.steps ?? 0,
    unread: input.unread,
    ...input.reviewstatus !== void 0 ? { reviewstatus: input.reviewstatus } : {},
    handoffarrows: input.handoffarrows ?? []
  };
}
function queuelaneviewof(input) {
  const lane = input.lane !== void 0 && input.lane.trim() !== "" ? input.lane.trim() : void 0;
  const rows = input.queue.items.filter((item) => lane === void 0 || item.lane === lane).map((item) => {
    const claim = input.queue.claims.find((record) => record.taskid === item.id);
    return { taskid: item.id, lane: item.lane, priority: item.priority, state: item.state, payload: item.payload, ...claim !== void 0 ? { holder: claim.agentid, heartbeatat: claim.heartbeatat } : {} };
  });
  return { lanes: [...input.queue.lanes], ...lane !== void 0 ? { lane } : {}, rows };
}
function messageflowof(input) {
  const rows = [];
  for (const mailbox of input.mailboxes) {
    for (const message of mailbox.inbox) rows.push({ messageid: message.id, senderid: message.senderid, recipient: mailbox.agentid, routing: `${message.routing} inbox`, payload: message.payload, sentat: message.sentat, read: message.readat !== void 0 });
    for (const message of mailbox.outbox) rows.push({ messageid: message.id, senderid: mailbox.agentid, recipient: message.recipient, routing: `${message.routing} outbox`, payload: message.payload, sentat: message.sentat, read: message.readat !== void 0 });
  }
  rows.sort((one, two) => one.sentat - two.sentat || one.messageid.localeCompare(two.messageid));
  return { rows, deliveries: rows.length };
}
function conflictlogof(input) {
  const rows = [];
  for (const scan of input.conflicts) {
    for (const overlap of scan.overlaps) rows.push({ source: "conflict", key: `${overlap.origin}|${overlap.selector}`, detail: `${scan.clean ? "clean" : "conflict"}: the writers ${overlap.writers.join(", ")} overlap on ${overlap.origin} ${overlap.selector}; the suggested order is ${scan.suggestedorder.join(", ") || "none"}.`, writers: overlap.writers, at: scan.scannedat });
    if (scan.overlaps.length === 0) rows.push({ source: "conflict", key: `scan ${scan.id}`, detail: `clean: the ${scan.writers.length} writer${scan.writers.length === 1 ? "" : "s"} touch no overlapping target.`, writers: scan.writers.map((writer) => writer.agentid), at: scan.scannedat });
  }
  for (const lock of input.locks) rows.push({ source: "lock", key: lock.key, detail: `${lock.kind} lock held by ${lock.holder} since ${lock.acquiredat}${lock.expiresat !== void 0 ? ` expiring at ${lock.expiresat}` : " with no expiry"}.`, writers: [lock.holder], at: lock.acquiredat });
  rows.sort((one, two) => two.at - one.at || one.key.localeCompare(two.key));
  return { rows, open: input.conflicts.filter((scan) => !scan.clean).length };
}
function costperagentof(input) {
  const tokens = input.usage.reduce((total, usage) => total + usage.tokens, 0);
  const cost = input.usage.reduce((total, usage) => total + usage.cost, 0);
  const steps = input.usage.reduce((total, usage) => total + usage.steps, 0);
  const rows = [...input.usage].sort((one, two) => one.agentid.localeCompare(two.agentid)).map((usage) => ({ agentid: usage.agentid, tokens: usage.tokens, cost: usage.cost, steps: usage.steps, share: tokens > 0 ? Math.round(usage.tokens / tokens * 100) / 100 : 0 }));
  return { rows, total: { tokens, cost, steps, ...input.totals?.currency !== void 0 ? { currency: input.totals.currency } : {} }, source: "the per agent usage the costcert reconciliation of tests/artifacts/costcert.json recomputes" };
}
function escalationinboxof(input) {
  const rows = [...input.escalations].sort((one, two) => two.raisedat - one.raisedat || one.id.localeCompare(two.id)).map((escalation) => ({ escalationid: escalation.id, agentid: escalation.agentid, subject: escalation.subject, state: escalation.state, ...escalation.decision !== void 0 ? { decision: escalation.decision } : {}, raisedat: escalation.raisedat }));
  return { rows, open: input.escalations.filter((escalation) => escalation.state === "open").length };
}
function agentcontrolsof(input) {
  if (input.viewer.readonly) return { pause: false, resume: false, stop: false, killswitch: false, reason: "The viewer carries no run role; the multi agent dashboard renders read only and no control dispatches." };
  if (input.killswitch.engaged) return { pause: false, resume: false, stop: false, killswitch: false, reason: "The kill switch stays engaged; the stopped agents wait for the re-registration before any control dispatches." };
  return {
    pause: input.agent.state === "active",
    resume: input.agent.state === "paused",
    stop: input.agent.state !== "stopped",
    killswitch: true,
    reason: `The controls follow the ${input.agent.state} state of the agent; the kill switch stops every agent at once.`
  };
}
function timelinescrubof(input) {
  const actions = [...input.actions].sort((one, two) => one.at - two.at || one.id.localeCompare(two.id));
  const first = actions[0]?.at ?? 0;
  const last = actions[actions.length - 1]?.at ?? first;
  const span = last - first;
  const marks = actions.map((action) => ({ actionid: action.id, kind: action.kind, ...action.agentid !== void 0 ? { agentid: action.agentid } : {}, summary: action.summary, at: action.at, position: span > 0 ? Math.round((action.at - first) / span * 100) / 100 : 0 }));
  const position = marks.length === 0 ? 0 : Math.min(Math.max(input.position !== void 0 && Number.isFinite(input.position) ? input.position : marks.length - 1, 0), marks.length - 1);
  return { marks, position: Math.round(position * 100) / 100 };
}
function aggregatereportdownloadof(input) {
  if (input.report === void 0) return { filename: "", payload: "", bytes: 0, reason: "No aggregate report exists yet; the swarm builds one when the parallel results merge after the review." };
  const payload = JSON.stringify({ id: input.report.id, title: input.report.title, sections: input.report.sections, sources: input.report.sources, ...input.report.confidence !== void 0 ? { confidence: input.report.confidence } : {}, createdat: input.report.createdat, exportedat: input.now }, null, 2);
  return { filename: `devthink-aggregate-${input.report.id}.json`, payload, bytes: payload.length, reason: `The aggregate report of ${input.report.sources.length} contributing agent${input.report.sources.length === 1 ? "" : "s"} over ${input.report.sections.length} section${input.report.sections.length === 1 ? "" : "s"} downloads as one json payload of ${payload.length} bytes.` };
}
function dashboardemptyguidanceof(input) {
  if (input.agents.length > 0) return { empty: false, guidance: [] };
  return {
    empty: true,
    guidance: [
      "No agent is registered yet; the first multi agent run starts by registering the agents of the fleet from the sidepanel fleet control.",
      "Attach the roles \u2014 the planner drafts, the workers execute, the critic reviews and the verifier confirms \u2014 so the leader worker topology has its lanes.",
      "Enqueue the shared tasks into the lanes; the shared queue view shows every task with the agent that claimed it.",
      "Watch this dashboard go live: the overview names the elected topology, the status cards follow every agent and the cost panel sums the accounting the costcert gate reconciles."
    ]
  };
}
function topologyinventoryof(input) {
  const topology = input.topology;
  const spawns = input.spawns ?? [];
  const scenariofamilies = {
    leader: ["leader worker scrape", "competing extraction"],
    worker: ["leader worker scrape", "parallel form fill", "monitoring swarm", "competing extraction"],
    critic: ["planner executor critic", "escalation and review"],
    verifier: ["planner executor critic", "leader worker scrape"],
    planner: ["planner executor critic", "monitoring swarm"],
    observer: ["monitoring swarm"]
  };
  const entries = [...input.agents].sort((one, two) => one.id.localeCompare(two.id)).map((agent) => {
    const lane = topology?.leaderid === agent.id ? "leader" : topology?.workerids.includes(agent.id) === true ? "worker" : topology?.criticids.includes(agent.id) === true ? "critic" : topology?.verifierids.includes(agent.id) === true ? "verifier" : spawns.some((spawn) => spawn.childid === agent.id) ? "sub agent" : "unassigned";
    const parent = spawns.find((spawn) => spawn.childid === agent.id);
    const parentid = agent.parentid ?? parent?.parentid;
    return { agentid: agent.id, name: agent.name, role: agent.role, state: agent.state, depth: agent.depth, ...parentid !== void 0 ? { parentid } : {}, lane, scenarios: scenariofamilies[lane] ?? scenariofamilies[String(agent.role)] ?? ["escalation and review"] };
  });
  const scenarios = 6;
  return { entries, scenarios, certified: input.agents.length > 0 && topology !== void 0, reason: entries.length === 0 ? "The fleet registry carries no agent; the topology inventory exports the certified scenario families with no live entry." : `The agent registry snapshot exports ${entries.length} entr${entries.length === 1 ? "y" : "ies"} over the ${scenarios} certified scenario families${topology !== void 0 ? ` with the elected topology of the leader ${topology.leaderid}` : ""}.` };
}
function multiagentviewof(input) {
  const viewer = dashboardviewerof({ ...input.viewer !== void 0 ? { viewer: input.viewer } : {} });
  const donecounts = /* @__PURE__ */ new Map();
  for (const item of input.queue.items) if (item.state === "done") {
    const claim = input.queue.claims.find((record) => record.taskid === item.id);
    if (claim !== void 0) donecounts.set(claim.agentid, (donecounts.get(claim.agentid) ?? 0) + 1);
  }
  const totals = input.costs.length > 0 ? input.costs[input.costs.length - 1] : void 0;
  const cards = input.agents.map((agent) => {
    const claimrecord = input.queue.claims.find((record) => record.agentid === agent.id);
    const claim = claimrecord !== void 0 ? input.queue.items.find((item) => item.id === claimrecord.taskid) : void 0;
    const usage = input.usage.find((entry) => entry.agentid === agent.id);
    return agentstatuscardof({
      agent,
      ...usage !== void 0 ? { usage } : {},
      ...claim !== void 0 ? { claim: { taskid: claim.id, payload: claim.payload } } : {},
      done: donecounts.get(agent.id) ?? 0,
      unread: input.mailboxes.find((mailbox) => mailbox.agentid === agent.id)?.unread ?? 0,
      handoffarrows: []
    });
  });
  const unread = input.mailboxes.reduce((total, mailbox) => total + mailbox.unread, 0);
  return {
    overview: multiagentoverviewof({ agents: input.agents, queue: input.queue, ...input.topology !== void 0 ? { topology: input.topology } : {}, killswitch: input.killswitch, unread }),
    cards,
    queueview: queuelaneviewof({ queue: input.queue, ...input.lane !== void 0 ? { lane: input.lane } : {} }),
    messageflow: messageflowof({ mailboxes: input.mailboxes }),
    conflictlog: conflictlogof({ conflicts: input.conflicts, locks: input.locks }),
    costview: costperagentof({ usage: input.usage, ...totals !== void 0 ? { totals } : {} }),
    escalationinbox: escalationinboxof({ escalations: input.escalations }),
    controls: { pause: viewer.controls, resume: viewer.controls, stop: viewer.controls, killswitch: viewer.controls, reason: viewer.reason },
    timeline: timelinescrubof({ actions: input.timeline }),
    reportdownload: aggregatereportdownloadof({ ...input.report !== void 0 ? { report: input.report } : {}, now: input.now }),
    empty: dashboardemptyguidanceof({ agents: input.agents }),
    viewer,
    inventory: topologyinventoryof({ agents: input.agents, ...input.topology !== void 0 ? { topology: input.topology } : {}, ...input.spawns !== void 0 ? { spawns: input.spawns } : {} })
  };
}
export {
  agentcontrolsof,
  agentstatuscardof,
  aggregatereportdownloadof,
  conflictlogof,
  costperagentof,
  dashboardemptyguidanceof,
  dashboardviewerof,
  escalationinboxof,
  messageflowof,
  multiagentoverviewof,
  multiagentviewof,
  queuelaneviewof,
  timelinescrubof,
  topologyinventoryof
};
//# sourceMappingURL=dashdone.js.map
