/** The agent module of the 1.1.88 consolidation: every correlated variation of the agent logic interned in this one file, so the module family carries one surface without duplicate variations. */

/* ── Merged from agentfleet.ts: the 1.1.88 consolidation interns the correlated agentfleet logic here, so no variation of the same file lives beside another. ── */
import type {
  agentbudget,
  agentrecord,
  agentscope,
  agentrole,
  budgetstate,
  runrecord,
  runstate,
  taskqueue,
  toolnamespace,
  agentidentity,
  agentmailbox,
  agentmessage,
  messagerouting,
  comparisonrecord,
  consensusrecord,
  consensusvote,
  escalationrecord,
  replayrecord,
  reviewrecord,
  reviewverdict,
  callcontext,
  cancelframe,
  capabilityset,
  eventkind,
  jsonrpcframe,
  progressnotice,
  promptdef,
  protocoleventsubscription,
  resourcewatch,
  samplingrequest,
  streamchunk,
  aggregatecell,
  aggregaterecord,
  arbitrationcase,
  arbitrationverdict,
  costentry,
  depthlimit,
  interleaveevent,
  lessonrecord,
  loadreport,
  spawnrecord,
  subagentspec,
  tasklane,
  agentevent,
  agenteventkind,
  agentusage,
  killswitch,
  spawnrequest,
  swarmstate,
  taskitem,
  workflowrun,
  actionrisk,
  blackboard,
  blackboardsection,
  conflictscan,
  conflictwriter,
  handoffrecord,
  mergeentry,
  mergerule,
  outputcomparison,
  resourcelock,
  resultreport,
  swarmaction,
  swarmcost,
} from "./types.js";

/**
 * Agent fleet logic of the 1.1.72 family.
 * Every correlated rule for the fleet registry, the unique lowercase agent naming with its reserved words, the scope intersection that narrows the requested origins and action kinds to the session grants, the read only observer scope, the per agent budget grant from user configuration with its spending and refusal, the remaining budget report, the single agent pause that leaves the peers and their run records untouched, and the global killswitch that cancels every agent run and clears every queue in one call lives in this file.
 * The fleet never bypasses review: the scope keeps every step inside the session grants, every budget ceiling stays a user choice with no hardcoded cap, and the killswitch needs the user action because no agent ever triggers it.
 */

/** The reserved fleet names no agent may take: the user, the operator, the human and the system identities stay outside the agent namespace. */
export const reservedagentnames: ReadonlySet<string> = new Set(["user", "operator", "human", "system"]);

/** Assigns one fleet record with its unique lowercase name: the helper lowercases the user proposal, refuses names outside the lowercase identifier rule, reserved words and duplicates, and registers the record with its role and home origin before its first run. */
export function agentname(input: {
  records: agentrecord[];
  id: string;
  proposed: string;
  role?: agentrole;
  origin: string;
  now: number;
}): agentrecord {
  const name = input.proposed.trim().toLowerCase();
  if (name === "") throw new Error("The agent needs its user chosen name; agent naming stays a user choice.");
  if (!/^[a-z][a-z0-9]*$/.test(name))
    throw new Error(
      `The agent name ${input.proposed.trim()} must stay a lowercase identifier of letters and digits starting with a letter.`,
    );
  if (reservedagentnames.has(name))
    throw new Error(
      `The agent name ${name} is reserved; the user, the operator, the human and the system identities never belong to an agent.`,
    );
  if (input.records.some((record) => record.name === name))
    throw new Error(`The agent name ${name} is already registered; fleet names stay unique.`);
  if (input.id.trim() === "") throw new Error("The fleet record needs its id.");
  if (input.origin.trim() === "")
    throw new Error(
      "The fleet record needs its home origin; every agent works from the origin its scope intersects with the session grants.",
    );
  return {
    id: input.id.trim(),
    name,
    role: input.role ?? "worker",
    origin: input.origin.trim(),
    state: "active",
    registeredat: input.now,
    lastseenat: input.now,
  };
}

/** Intersects the requested scope with the session grants: the requested origins keep only the granted entries, the requested action kinds keep only the allowed catalog entries, an absent request stays unbounded inside the grants, and a request that lands entirely outside the grants refuses loudly instead of silently widening. */
export function agentscopeof(input: {
  agentid: string;
  requested?: { origins?: string[]; toolnamespaces?: toolnamespace[]; actionkinds?: string[] };
  grants?: string[];
  allowedkinds?: string[];
}): agentscope {
  if (input.agentid.trim() === "") throw new Error("The scope needs its agent id.");
  const requested = input.requested ?? {};
  const requestedorigins = (requested.origins ?? []).map((origin) => origin.trim()).filter((origin) => origin !== "");
  const origins =
    input.grants === undefined ? requestedorigins : requestedorigins.filter((origin) => input.grants!.includes(origin));
  if (input.grants !== undefined && requestedorigins.length > 0 && origins.length === 0)
    throw new Error(
      `The requested origins ${requestedorigins.join(", ")} sit outside the session grants ${input.grants.join(", ")}; the scope never widens past the grants.`,
    );
  const requestedkinds = (requested.actionkinds ?? []).map((kind) => kind.trim()).filter((kind) => kind !== "");
  const actionkinds =
    input.allowedkinds === undefined
      ? requestedkinds
      : requestedkinds.filter((kind) => input.allowedkinds!.includes(kind));
  if (input.allowedkinds !== undefined && requestedkinds.length > 0 && actionkinds.length === 0)
    throw new Error(
      `The requested action kinds ${requestedkinds.join(", ")} sit outside the allowed catalog; the scope narrows every step to the allowed kinds only.`,
    );
  const toolnamespaces = requested.toolnamespaces ?? [];
  return { agentid: input.agentid.trim(), origins, toolnamespaces, ...(actionkinds.length > 0 ? { actionkinds } : {}) };
}

/** Builds the read only scope of an observer agent: the observer reads the page and the fleet state through the read side kinds only and never acts on it. */
export function readonlyscope(input: { agentid: string; readkinds: string[] }): agentscope {
  if (input.agentid.trim() === "") throw new Error("The read only scope needs its agent id.");
  const readkinds = input.readkinds.map((kind) => kind.trim()).filter((kind) => kind !== "");
  if (readkinds.length === 0)
    throw new Error("The read only scope needs its read side action kinds; an observer with no kinds reads nothing.");
  return {
    agentid: input.agentid.trim(),
    origins: [],
    toolnamespaces: ["memory", "system"],
    actionkinds: readkinds,
    readonly: true,
  };
}

/** Grants one per agent budget from user configuration: the ceilings copy the user values with no hardcoded cap and the fresh budgetstate starts at zero spent. */
export function agentbudgetof(input: {
  agentid: string;
  maxsteps?: number;
  maxtokens?: number;
  maxdurationms?: number;
  currency?: string;
  now: number;
}): { budget: agentbudget; state: budgetstate } {
  if (input.agentid.trim() === "") throw new Error("The budget needs its agent id.");
  const ceilings: Array<[string, number | undefined]> = [
    ["maxsteps", input.maxsteps],
    ["maxtokens", input.maxtokens],
    ["maxdurationms", input.maxdurationms],
  ];
  for (const [label, value] of ceilings) {
    if (value !== undefined && (!Number.isFinite(value) || value <= 0))
      throw new Error(
        `The ${label} ceiling must stay a positive number; every ceiling stays the user's choice with no engine default.`,
      );
  }
  const agentid = input.agentid.trim();
  return {
    budget: {
      agentid,
      ...(input.maxtokens !== undefined ? { maxtokens: input.maxtokens } : {}),
      ...(input.maxsteps !== undefined ? { maxsteps: input.maxsteps } : {}),
      ...(input.maxdurationms !== undefined ? { maxdurationms: input.maxdurationms } : {}),
      ...(input.currency !== undefined && input.currency.trim() !== "" ? { currency: input.currency.trim() } : {}),
      configuredat: input.now,
    },
    state: {
      agentid,
      spentsteps: 0,
      spenttokens: 0,
      spentdurationms: 0,
      ...(input.maxsteps !== undefined ? { maxsteps: input.maxsteps } : {}),
      ...(input.maxtokens !== undefined ? { maxtokens: input.maxtokens } : {}),
      ...(input.maxdurationms !== undefined ? { maxdurationms: input.maxdurationms } : {}),
      updatedat: input.now,
    },
  };
}

/** Spends one unit per executed step against the budget state: the spend adds its steps, tokens and duration, and a spend past a user configured ceiling refuses the execution until the user raises the ceiling or stops the agent. */
export function spendbudget(input: {
  state: budgetstate;
  steps?: number;
  tokens?: number;
  durationms?: number;
  now: number;
}): budgetstate {
  const steps = input.steps ?? 1;
  const tokens = input.tokens ?? 0;
  const durationms = input.durationms ?? 0;
  for (const [label, value] of [
    ["steps", steps],
    ["tokens", tokens],
    ["durationms", durationms],
  ] as Array<[string, number]>) {
    if (!Number.isFinite(value) || value < 0)
      throw new Error(
        `The ${label} spend stays a finite non negative number; the budget never recharges or takes a nonsensical amount.`,
      );
  }
  const nextsteps = input.state.spentsteps + steps;
  const nexttokens = input.state.spenttokens + tokens;
  const nextduration = input.state.spentdurationms + durationms;
  if (input.state.maxsteps !== undefined && nextsteps > input.state.maxsteps)
    throw new Error(
      `The agent ${input.state.agentid} already executed ${input.state.spentsteps} of its ${input.state.maxsteps} budgeted steps; the user raises the ceiling or stops the agent.`,
    );
  if (input.state.maxtokens !== undefined && nexttokens > input.state.maxtokens)
    throw new Error(
      `The agent ${input.state.agentid} already spent ${input.state.spenttokens} of its ${input.state.maxtokens} budgeted tokens; the user raises the ceiling or stops the agent.`,
    );
  if (input.state.maxdurationms !== undefined && nextduration > input.state.maxdurationms)
    throw new Error(
      `The agent ${input.state.agentid} already spent ${input.state.spentdurationms} of its ${input.state.maxdurationms} budgeted milliseconds; the user raises the ceiling or stops the agent.`,
    );
  return {
    ...input.state,
    spentsteps: nextsteps,
    spenttokens: nexttokens,
    spentdurationms: nextduration,
    updatedat: input.now,
  };
}

/** Reports the remaining budget of one agent: every ceiling the user configured reports its remaining value while an absent ceiling reports unbounded. */
export function budgetremaining(state: budgetstate): {
  steps?: number;
  tokens?: number;
  durationms?: number;
  reason: string;
} {
  const steps = state.maxsteps === undefined ? undefined : Math.max(0, state.maxsteps - state.spentsteps);
  const tokens = state.maxtokens === undefined ? undefined : Math.max(0, state.maxtokens - state.spenttokens);
  const durationms =
    state.maxdurationms === undefined ? undefined : Math.max(0, state.maxdurationms - state.spentdurationms);
  const parts: string[] = [];
  parts.push(steps === undefined ? "steps unbounded" : `${steps} of ${state.maxsteps} steps left`);
  parts.push(tokens === undefined ? "tokens unbounded" : `${tokens} of ${state.maxtokens} tokens left`);
  parts.push(
    durationms === undefined ? "duration unbounded" : `${durationms} of ${state.maxdurationms} milliseconds left`,
  );
  return {
    ...(steps !== undefined ? { steps } : {}),
    ...(tokens !== undefined ? { tokens } : {}),
    ...(durationms !== undefined ? { durationms } : {}),
    reason: `The agent ${state.agentid} spent ${state.spentsteps} steps, ${state.spenttokens} tokens and ${state.spentdurationms} milliseconds: ${parts.join(", ")}.`,
  };
}

/** Pauses one agent of the fleet without stopping its peers: the pause holds only the named agent while every other record and every other run record stays exactly as it was. */
export function pauseagent(input: { records: agentrecord[]; agentid: string; now: number }): agentrecord[] {
  const agent = input.records.find((record) => record.id === input.agentid);
  if (!agent) throw new Error(`The agent ${input.agentid} is not registered in the fleet.`);
  if (agent.state === "stopped") throw new Error(`The agent ${agent.name} is stopped; a stopped agent needs no pause.`);
  return input.records.map((record) =>
    record.id === input.agentid ? { ...record, state: "paused" as const, lastseenat: input.now } : record,
  );
}

/** Resumes one paused agent of the fleet: the resume lifts only the named agent while the peers never changed. */
export function unpauseagent(input: { records: agentrecord[]; agentid: string; now: number }): agentrecord[] {
  const agent = input.records.find((record) => record.id === input.agentid);
  if (!agent) throw new Error(`The agent ${input.agentid} is not registered in the fleet.`);
  if (agent.state !== "paused") throw new Error(`The agent ${agent.name} is not paused.`);
  return input.records.map((record) =>
    record.id === input.agentid ? { ...record, state: "active" as const, lastseenat: input.now } : record,
  );
}

/** Engages the global killswitch in one call: every fleet record stops, every agent run cancels, every queued item of every queue clears, and the return carries one stop entry per agent so the audit trail records each stopped agent. */
export function engagekillswitch(input: {
  records: agentrecord[];
  runs: runrecord[];
  queues?: taskqueue[];
  reason?: string;
  now: number;
}): {
  records: agentrecord[];
  runs: runrecord[];
  queues: taskqueue[];
  stopped: Array<{ agentid: string; name: string; runs: string[]; queued: number }>;
  engagedat: number;
  reason: string;
} {
  const reason =
    input.reason !== undefined && input.reason.trim() !== "" ? input.reason.trim() : "The user engaged the killswitch.";
  const terminal: runstate[] = ["completed", "failed", "cancelled", "rolledback", "done"];
  const runs = input.runs.map((run) =>
    run.agentid !== undefined && !terminal.includes(run.state)
      ? { ...run, state: "cancelled" as runstate, updatedat: input.now }
      : run,
  );
  const cancelled = runs.filter(
    (run) =>
      run.agentid !== undefined &&
      run.state === "cancelled" &&
      input.runs.find((original) => original.runid === run.runid)?.state !== "cancelled",
  );
  const queues = (input.queues ?? []).map((queue) => ({ ...queue, items: [], claims: [] }));
  const queuedperagent = new Map<string, number>();
  for (const queue of input.queues ?? []) {
    for (const claim of queue.claims) queuedperagent.set(claim.agentid, (queuedperagent.get(claim.agentid) ?? 0) + 1);
    for (const item of queue.items)
      if (item.state === "queued") queuedperagent.set("fleet", (queuedperagent.get("fleet") ?? 0) + 1);
  }
  const stopped = input.records.map((record) => ({
    agentid: record.id,
    name: record.name,
    runs: cancelled.filter((run) => run.agentid === record.id).map((run) => run.runid),
    queued:
      (queuedperagent.get(record.id) ?? 0) +
      (record.state === "active" || record.state === "paused" ? (queuedperagent.get("fleet") ?? 0) : 0),
  }));
  return {
    records: input.records.map((record) => ({ ...record, state: "stopped" as const, lastseenat: input.now })),
    runs,
    queues,
    stopped,
    engagedat: input.now,
    reason,
  };
}

/** Reads the fleet at a glance for the sidepanel and the protocol envelope: the records with their control states, the budget states, the open escalations and reviews and the timestamp of the last killswitch stop. */
export function fleetoverview(input: {
  records: agentrecord[];
  budgets: budgetstate[];
  openescalations: number;
  openreviews: number;
  killswitchat?: number;
}): {
  agents: number;
  active: number;
  paused: number;
  stopped: number;
  openescalations: number;
  openreviews: number;
  lastkillswitchat?: number;
} {
  return {
    agents: input.records.length,
    active: input.records.filter((record) => record.state === "active").length,
    paused: input.records.filter((record) => record.state === "paused").length,
    stopped: input.records.filter((record) => record.state === "stopped").length,
    openescalations: input.openescalations,
    openreviews: input.openreviews,
    ...(input.killswitchat !== undefined ? { lastkillswitchat: input.killswitchat } : {}),
  };
}

/* ── Merged from agentmailbox.ts: the 1.1.88 consolidation interns the correlated agentmailbox logic here, so no variation of the same file lives beside another. ── */

/**
 * Agent mailbox logic of the 1.1.58 multi agent family.
 * Every correlated rule for the direct, broadcast and role addressed routing, the inbox and outbox records, the unread counters and the receive drain with ack tracking lives in this file.
 * The messages stay inside the swarm: a message that carries page content grades as an egress event in the audit trail, and no mailbox delivery ever bypasses a consent gate.
 */

/** The broadcast recipient marker: a message addressed to it reaches every agent of the swarm but the sender. */
export const broadcastrecipient = "*";

/** Returns the mailbox of one agent; an agent without a mailbox yet reads an empty one. */
export function mailboxof(mailboxes: agentmailbox[], agentid: string): agentmailbox {
  return mailboxes.find((mailbox) => mailbox.agentid === agentid) ?? { agentid, inbox: [], outbox: [], unread: 0 };
}

/** Returns every agent id of one role for the role addressed routing. */
export function roleaddress(agents: agentidentity[], role: string): string[] {
  return agents.filter((agent) => agent.role === role && agent.state !== "stopped").map((agent) => agent.id);
}

/** Resolves the recipients of one message: a direct message names one agent, a broadcast reaches every live agent but the sender and a role message reaches every live agent of the role. */
export function resolverecipients(input: {
  agents: agentidentity[];
  senderid: string;
  recipient: string;
  routing: messagerouting;
}): string[] {
  if (input.routing === "broadcast")
    return input.agents
      .filter((agent) => agent.id !== input.senderid && agent.state !== "stopped")
      .map((agent) => agent.id);
  if (input.routing === "role") return roleaddress(input.agents, input.recipient);
  const direct = input.agents.find((agent) => agent.id === input.recipient);
  if (!direct) throw new Error(`The direct message names the recipient ${input.recipient} which is not registered.`);
  return [direct.id];
}

/** Delivers one message to the recipient inboxes: the sender outbox records it, the unread counters rise and the delivery stays visible to every reader of the swarm. */
export function sendmessage(input: {
  mailboxes: agentmailbox[];
  agents: agentidentity[];
  id: string;
  senderid: string;
  recipient: string;
  routing: messagerouting;
  payload: string;
  now: number;
}): agentmailbox[] {
  if (input.payload.trim() === "") throw new Error("The agent message needs its payload.");
  if (input.routing === "direct" && input.senderid === input.recipient)
    throw new Error("A direct message never addresses its own sender.");
  const message: agentmessage = {
    id: input.id,
    senderid: input.senderid,
    recipient: input.recipient,
    routing: input.routing,
    payload: input.payload,
    sentat: input.now,
  };
  const recipients = resolverecipients({
    agents: input.agents,
    senderid: input.senderid,
    recipient: input.recipient,
    routing: input.routing,
  });
  const known = new Set([
    ...input.mailboxes.map((mailbox) => mailbox.agentid),
    ...recipients,
    ...(input.agents.some((agent) => agent.id === input.senderid) ? [input.senderid] : []),
  ]);
  return [...known].map((agentid) => {
    const mailbox = mailboxof(input.mailboxes, agentid);
    const delivered = recipients.includes(agentid);
    const sent = agentid === input.senderid;
    return {
      agentid,
      inbox: delivered ? [message, ...mailbox.inbox] : mailbox.inbox,
      outbox: sent ? [message, ...mailbox.outbox] : mailbox.outbox,
      unread: delivered ? mailbox.unread + 1 : mailbox.unread,
    };
  });
}

/** Drains one inbox with ack tracking: every message receives its read time, the unread counter resets and the drain returns the read messages oldest first. */
export function receivemessages(input: { mailboxes: agentmailbox[]; agentid: string; now: number }): {
  mailboxes: agentmailbox[];
  messages: agentmessage[];
} {
  const mailbox = mailboxof(input.mailboxes, input.agentid);
  const messages = [...mailbox.inbox]
    .sort((one, two) => one.sentat - two.sentat)
    .map((message) => ({ ...message, ...(message.readat === undefined ? { readat: input.now } : {}) }));
  const drained: agentmailbox = { agentid: input.agentid, inbox: messages, outbox: mailbox.outbox, unread: 0 };
  return { mailboxes: input.mailboxes.map((entry) => (entry.agentid === input.agentid ? drained : entry)), messages };
}

/** Returns the unread count of one agent mailbox. */
export function unreadcount(mailboxes: agentmailbox[], agentid: string): number {
  return mailboxof(mailboxes, agentid).unread;
}

/* ── Merged from agentreview.ts: the 1.1.88 consolidation interns the correlated agentreview logic here, so no variation of the same file lives beside another. ── */

/**
 * Agent review logic of the 1.1.72 family.
 * Every correlated rule for the human escalation hold that blocks the raising agent until the user answers, the agent to agent review requests with the reviewer verdict recorded beside the original output, the runreplay capture of the ordered steps and results of one agent run with its reconstruction from the audit trail when the run memory is gone, the field by field outputcompare of two competing agent outputs and the consensusvote with one vote per agent, the user configured quorum rule and the dissenting votes kept for the audit trail lives in this file.
 * The review layer never touches the page and never bypasses a gate: an escalation stays human decided, a review request stays between two agents of the shared origin, a replay reads the records only and every vote counts exactly once.
 */

/** Reads the escalation hold of one agent: an open escalation blocks its raising agent until the human answers, so the run of a blocked agent waits instead of guessing. */
export function escalationblock(input: { escalations: escalationrecord[]; agentid: string }): {
  blocked: boolean;
  open: number;
  reason: string;
} {
  const open = input.escalations.filter(
    (escalation) => escalation.agentid === input.agentid && escalation.state === "open",
  );
  if (open.length === 0)
    return {
      blocked: false,
      open: 0,
      reason: `The agent ${input.agentid} carries no open escalation; its steps continue through the same review.`,
    };
  return {
    blocked: true,
    open: open.length,
    reason: `The agent ${input.agentid} waits behind ${open.length} open escalation${open.length === 1 ? "" : "s"}: ${open.map((escalation) => escalation.subject).join("; ")}; only the human answer lifts the hold.`,
  };
}

/** Sends one agent output to a peer agent for review: the review record carries the original output exactly as produced and waits open until the reviewing agent records its verdict. */
export function reviewrecordof(input: {
  id: string;
  fromagentid: string;
  toagentid: string;
  subject: string;
  output: string;
  now: number;
}): reviewrecord {
  if (input.id.trim() === "") throw new Error("The review request needs its id.");
  if (input.fromagentid.trim() === "") throw new Error("The review request names the agent whose output it carries.");
  if (input.toagentid.trim() === "") throw new Error("The review request names the reviewing agent.");
  if (input.fromagentid === input.toagentid)
    throw new Error(
      "A review request moves one output between two different agents; an agent never reviews its own output.",
    );
  if (input.subject.trim() === "") throw new Error("The review request needs its subject in plain language.");
  if (input.output.trim() === "")
    throw new Error("The review request needs the original output under review; the verdict lands beside it.");
  return {
    id: input.id.trim(),
    fromagentid: input.fromagentid.trim(),
    toagentid: input.toagentid.trim(),
    subject: input.subject.trim(),
    output: input.output,
    state: "open",
    requestedat: input.now,
  };
}

/** Records the reviewer verdict beside the original output: the answered review keeps the verdict, the issues the reviewer named and the answer time while the original output stays untouched. */
export function recordverdict(input: {
  records: reviewrecord[];
  id: string;
  reviewerid: string;
  verdict: reviewverdict;
  issues?: string[];
  now: number;
}): reviewrecord {
  const record = input.records.find((entry) => entry.id === input.id);
  if (!record) throw new Error(`The review request ${input.id} does not exist.`);
  if (record.state === "answered")
    throw new Error(`The review request ${record.id} already carries its verdict; the verdict never rewrites.`);
  if (input.reviewerid.trim() === "") throw new Error("The verdict names the reviewing agent that recorded it.");
  if (input.reviewerid !== record.toagentid)
    throw new Error(
      `The review request ${record.id} waits for the agent ${record.toagentid}; the agent ${input.reviewerid} never answers a review addressed to another agent.`,
    );
  const issues = (input.issues ?? []).map((issue) => issue.trim()).filter((issue) => issue !== "");
  if (input.verdict !== "approve" && issues.length === 0)
    throw new Error(
      `A ${input.verdict} verdict names its issues in plain language; the requesting agent reads exactly what failed the review.`,
    );
  return {
    ...record,
    state: "answered",
    verdict: input.verdict,
    ...(issues.length > 0 ? { issues } : {}),
    answeredat: input.now,
  };
}

/** Captures one runreplay of an agent run: the ordered steps with their results and times freeze into one replay record the audit trail keeps per agent. */
export function runreplay(input: {
  id: string;
  agentid: string;
  runid: string;
  steps: Array<{ stepid: string; kind: string; summary: string; state: string; at: number }>;
  now: number;
}): replayrecord {
  if (input.id.trim() === "") throw new Error("The runreplay capture needs its id.");
  if (input.agentid.trim() === "") throw new Error("The runreplay capture names its agent.");
  if (input.runid.trim() === "") throw new Error("The runreplay capture names its run.");
  if (input.steps.length === 0)
    throw new Error("The runreplay capture needs at least one recorded step; an empty run replays nothing.");
  const steps = [...input.steps].sort((one, two) => one.at - two.at || (one.stepid < two.stepid ? -1 : 1));
  return {
    id: input.id.trim(),
    agentid: input.agentid.trim(),
    runid: input.runid.trim(),
    steps,
    capturedat: input.now,
  };
}

/** Reconstructs one runreplay from the audit trail when the run memory is gone: the recorded events of the agent and its run order into the same replay shape a live capture produced, and the reconstruction marks itself. */
export function reconstructreplay(input: {
  id: string;
  agentid: string;
  runid: string;
  events: Array<{
    id: string;
    kind: string;
    summary: string;
    at: number;
    agentid?: string;
    stepid?: string;
    planid?: string;
  }>;
  now: number;
}): replayrecord {
  const owned = input.events.filter(
    (event) => event.agentid === input.agentid && (event.planid === undefined || event.planid === input.runid),
  );
  if (owned.length === 0)
    throw new Error(
      `The audit trail carries no event of the agent ${input.agentid} for the run ${input.runid}; the reconstruction replays only what the trail recorded.`,
    );
  const steps = owned
    .filter((event) => event.stepid !== undefined)
    .map((event) => ({
      stepid: event.stepid as string,
      kind: event.kind,
      summary: event.summary,
      state:
        event.kind === "action" || event.kind === "complete" ? "done" : event.kind === "error" ? "failed" : "recorded",
      at: event.at,
    }))
    .sort((one, two) => one.at - two.at || (one.stepid < two.stepid ? -1 : 1));
  if (steps.length === 0)
    throw new Error(
      `The audit trail of the agent ${input.agentid} names no step of the run ${input.runid}; the reconstruction needs the step ids the trail carried.`,
    );
  return {
    id: input.id.trim(),
    agentid: input.agentid.trim(),
    runid: input.runid.trim(),
    steps,
    reconstructed: true,
    capturedat: input.now,
  };
}

/** Aligns two competing agent outputs field by field: every field of both sides grades matching when the values agree, conflicting when they differ and missing when one side carries no value, so the user reads exactly where the agents disagree. */
export function outputcompare(input: {
  id: string;
  subject: string;
  left: { agentid: string; fields: Record<string, string> };
  right: { agentid: string; fields: Record<string, string> };
  now: number;
}): comparisonrecord {
  if (input.id.trim() === "") throw new Error("The output comparison needs its id.");
  if (input.subject.trim() === "") throw new Error("The output comparison needs its subject in plain language.");
  if (input.left.agentid.trim() === "" || input.right.agentid.trim() === "")
    throw new Error("The output comparison names both agents of its competing outputs.");
  if (input.left.agentid === input.right.agentid)
    throw new Error("The output comparison contrasts two different agents; one agent never competes with itself.");
  const keys = [...new Set([...Object.keys(input.left.fields), ...Object.keys(input.right.fields)])].sort();
  const matching: string[] = [];
  const conflicting: string[] = [];
  const missing: string[] = [];
  for (const key of keys) {
    const left = input.left.fields[key];
    const right = input.right.fields[key];
    if (left !== undefined && right !== undefined) (left === right ? matching : conflicting).push(key);
    else missing.push(key);
  }
  return {
    id: input.id.trim(),
    subject: input.subject.trim(),
    left: { agentid: input.left.agentid.trim(), fields: input.left.fields },
    right: { agentid: input.right.agentid.trim(), fields: input.right.fields },
    matching,
    conflicting,
    missing,
    comparedat: input.now,
  };
}

/** Collects one vote per agent on one proposal and computes the outcome by the user configured quorum rule: duplicate voters refuse, yes votes carry the proposal at the quorum, a complete round under the quorum fails it, an incomplete round stays open and every dissenting vote stays in the record for the audit trail. */
export function consensusrecordof(input: {
  id: string;
  proposal: string;
  votes: Array<{ agentid: string; vote: consensusvote; reason?: string; castat: number }>;
  quorum: number;
  voters?: number;
  now: number;
}): consensusrecord {
  if (input.id.trim() === "") throw new Error("The consensus record needs its id.");
  if (input.proposal.trim() === "") throw new Error("The consensus record needs its proposal in plain language.");
  if (!Number.isInteger(input.quorum) || input.quorum < 1)
    throw new Error("The consensus quorum stays a positive whole number the user configured.");
  const seen = new Set<string>();
  const votes: consensusrecord["votes"] = [];
  for (const vote of input.votes) {
    if (vote.agentid.trim() === "") throw new Error("Every vote names its agent; the weight stays one vote per agent.");
    if (seen.has(vote.agentid))
      throw new Error(`The agent ${vote.agentid} already voted; the vote weight stays one per agent.`);
    seen.add(vote.agentid);
    votes.push({
      agentid: vote.agentid.trim(),
      vote: vote.vote,
      ...(vote.reason !== undefined && vote.reason.trim() !== "" ? { reason: vote.reason.trim() } : {}),
      castat: vote.castat,
    });
  }
  const tally = {
    yes: votes.filter((vote) => vote.vote === "yes").length,
    no: votes.filter((vote) => vote.vote === "no").length,
    abstain: votes.filter((vote) => vote.vote === "abstain").length,
  };
  const complete = input.voters !== undefined && votes.length >= input.voters;
  const outcome = tally.yes >= input.quorum ? "carried" : complete ? "failed" : "open";
  return {
    id: input.id.trim(),
    proposal: input.proposal.trim(),
    votes,
    tally,
    quorum: input.quorum,
    outcome,
    ...(outcome !== "open" ? { closedat: input.now } : {}),
  };
}

/* ── Merged from agentstream.ts: the 1.1.88 consolidation interns the correlated agentstream logic here, so no variation of the same file lives beside another. ── */
import { randomid } from "./memory.js";

/**
 * Agent stream of the 1.1.56 agent protocol part three.
 * Every subscription, resource, sampling, prompt, streaming, progress and cancellation concern lives in this file: the event subscriptions with their kinds and filters, the event notifications that push protocol events to matching subscribers, the resource watchers with their page state baselines and the page state deltas they deliver, the sampling callbacks that ask a client model for a completion behind its declared capabilities and the page content grant, the prompt defs exposed as callable tools with their template rendering, the stream chunks of progressive tool results, the progress notices of long tools with their cancel hints and the cancellation frames that abort an in flight tool call while preserving its partial result.
 * The stream stays pure and consent-first: a subscription never widens what the session grants, a sampling prompt never leaves the browser with ungranted page content and a cancellation never bypasses the audit trail.
 */

/** The protocol event kinds a client may subscribe to; the callstarted kind mirrors every tool call including calls with side effects. */
export const protocoleventkinds: eventkind[] = [
  "callstarted",
  "callresult",
  "streamchunk",
  "progress",
  "resourcedelta",
  "sampling",
  "cancellation",
];

/** The observation event kinds that stay read only: every kind except the callstarted mutation mirror. */
export const readonlyeventkinds: eventkind[] = [
  "callresult",
  "streamchunk",
  "progress",
  "resourcedelta",
  "sampling",
  "cancellation",
];

/** Registers one client event subscription: the kinds validate against the protocol event kinds while an absent kinds list subscribes the read only observation kinds so a subscription never widens what the session grants. */
export function subscriberegister(input: {
  clientid: string;
  kinds?: string[];
  origin?: string;
  tool?: string;
  now: number;
  id?: string;
}): { subscription?: protocoleventsubscription; reason?: string } {
  if (input.clientid.trim() === "") return { reason: "The event subscription needs the paired client it belongs to." };
  const kinds =
    input.kinds === undefined || input.kinds.length === 0 ? [...readonlyeventkinds] : [...new Set(input.kinds)];
  for (const kind of kinds) {
    if (!protocoleventkinds.includes(kind as eventkind))
      return { reason: `The event kind ${kind} is not a protocol event kind.` };
  }
  if (input.origin !== undefined && input.origin.trim() === "")
    return { reason: "The origin filter of an event subscription must name an origin or stay absent." };
  if (input.tool !== undefined && input.tool.trim() === "")
    return { reason: "The tool filter of an event subscription must name a tool or stay absent." };
  return {
    subscription: {
      id: input.id ?? randomid(),
      clientid: input.clientid,
      kinds: kinds as eventkind[],
      ...(input.origin !== undefined ? { origin: input.origin } : {}),
      ...(input.tool !== undefined ? { tool: input.tool } : {}),
      createdat: input.now,
    },
  };
}

/** Cancels one client event subscription; the record stays for the audit trail with its cancel time. */
export function unsubscriberegister(
  subscriptions: protocoleventsubscription[],
  id: string,
  now: number,
): protocoleventsubscription[] {
  return subscriptions.map((subscription) =>
    subscription.id === id && subscription.canceledat === undefined
      ? { ...subscription, canceledat: now }
      : subscription,
  );
}

/** Pushes one protocol event to every matching subscriber: active subscriptions whose kinds carry the event kind, whose origin filter matches when set and whose tool filter matches when set receive one notification frame; the delivery stamps the last delivery time. */
export function notifyevent(input: {
  subscriptions: protocoleventsubscription[];
  kind: eventkind;
  origin?: string;
  tool?: string;
  payload?: Record<string, unknown>;
  now: number;
}): {
  deliveries: Array<{ subscriptionid: string; clientid: string; frame: jsonrpcframe }>;
  subscriptions: protocoleventsubscription[];
} {
  const deliveries: Array<{ subscriptionid: string; clientid: string; frame: jsonrpcframe }> = [];
  const subscriptions = input.subscriptions.map((subscription) => {
    if (subscription.canceledat !== undefined) return subscription;
    if (!subscription.kinds.includes(input.kind)) return subscription;
    if (subscription.origin !== undefined && input.origin !== undefined && subscription.origin !== input.origin)
      return subscription;
    if (subscription.tool !== undefined && input.tool !== undefined && subscription.tool !== input.tool)
      return subscription;
    deliveries.push({
      subscriptionid: subscription.id,
      clientid: subscription.clientid,
      frame: {
        jsonrpc: "2.0",
        method: "events/notify",
        params: {
          subscriptionid: subscription.id,
          kind: input.kind,
          ...(input.origin !== undefined ? { origin: input.origin } : {}),
          ...(input.tool !== undefined ? { tool: input.tool } : {}),
          ...(input.payload !== undefined ? { payload: input.payload } : {}),
          at: input.now,
        },
      },
    });
    return { ...subscription, lastdeliveredat: input.now };
  });
  return { deliveries, subscriptions };
}

/** Starts one page state watcher for a client: the resource names the watched page state and the baseline freezes the page state at watch time so later deltas compare against it. */
export function watchresource(input: {
  clientid: string;
  resource: string;
  state?: Record<string, unknown>;
  now: number;
  id?: string;
}): { watch?: resourcewatch; reason?: string } {
  if (input.clientid.trim() === "") return { reason: "The resource watcher needs the paired client it belongs to." };
  if (input.resource.trim() === "") return { reason: "The resource watcher needs the page state resource it watches." };
  return {
    watch: {
      id: input.id ?? randomid(),
      clientid: input.clientid,
      resource: input.resource,
      baseline: input.state ?? {},
      createdat: input.now,
    },
  };
}

/** Cancels one page state watcher; the record stays for the audit trail with its cancel time. */
export function unwatchresource(watches: resourcewatch[], id: string, now: number): resourcewatch[] {
  return watches.map((watch) =>
    watch.id === id && watch.canceledat === undefined ? { ...watch, canceledat: now } : watch,
  );
}

/** Pushes the page state deltas of one resource to its active watchers: every changed key against the baseline lands in the delta, the baseline absorbs the new state and the delivery stamps the last delivery time. */
export function notifyresource(input: {
  watches: resourcewatch[];
  resource: string;
  state: Record<string, unknown>;
  now: number;
}): {
  deliveries: Array<{ watchid: string; clientid: string; delta: Record<string, unknown> }>;
  watches: resourcewatch[];
} {
  const deliveries: Array<{ watchid: string; clientid: string; delta: Record<string, unknown> }> = [];
  const watches = input.watches.map((watch) => {
    if (watch.canceledat !== undefined || watch.resource !== input.resource) return watch;
    const delta: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(input.state)) {
      if (!(key in watch.baseline) || watch.baseline[key] !== value) delta[key] = value;
    }
    if (Object.keys(delta).length === 0) return watch;
    deliveries.push({ watchid: watch.id, clientid: watch.clientid, delta });
    return { ...watch, baseline: { ...input.state }, lastdeliveredat: input.now };
  });
  return { deliveries, watches };
}

/** Sends one sampling callback to a client model: the client must have declared its sampling capability, the page content stays stripped unless the user granted it and the request records its provenance for the round trip. */
export function requestsampling(input: {
  clientid: string;
  capabilities?: capabilityset;
  prompt: string;
  system?: string;
  pagecontent?: string;
  pagegrant?: boolean;
  maxtokens?: number;
  now: number;
  id?: string;
}): { request?: samplingrequest; reason?: string } {
  if (input.clientid.trim() === "") return { reason: "The sampling callback needs the paired client it addresses." };
  if (input.prompt.trim() === "") return { reason: "The sampling callback needs its prompt." };
  if (input.capabilities?.sampling === false)
    return { reason: "The client declared no sampling capability and the callback is refused." };
  if (input.maxtokens !== undefined && (!Number.isFinite(input.maxtokens) || input.maxtokens <= 0))
    return { reason: "The granted maximum tokens of a sampling callback must stay a positive user value." };
  const granted = input.pagegrant === true;
  const pagecontent = granted ? input.pagecontent : undefined;
  const prompt =
    granted || input.pagecontent === undefined
      ? input.prompt
      : `${input.prompt}\nThe page content stays stripped because the user granted none.`;
  return {
    request: {
      id: input.id ?? randomid(),
      clientid: input.clientid,
      prompt,
      ...(input.system !== undefined ? { system: input.system } : {}),
      ...(pagecontent !== undefined ? { pagecontent } : {}),
      ...(input.maxtokens !== undefined ? { maxtokens: input.maxtokens } : {}),
      state: "pending",
      requestedat: input.now,
    },
  };
}

/** Completes one sampling round trip: the client answer closes the pending request with its provenance times while answered, refused and unknown requests stay untouched. */
export function answersampling(input: {
  requests: samplingrequest[];
  id: string;
  answer?: string;
  refused?: boolean;
  now: number;
}): { requests: samplingrequest[]; request?: samplingrequest; reason?: string } {
  const match = input.requests.find((request) => request.id === input.id);
  if (match === undefined) return { requests: input.requests, reason: "The sampling answer names no stored request." };
  if (match.state !== "pending")
    return { requests: input.requests, reason: "The sampling request already closed its round trip." };
  const request: samplingrequest = {
    ...match,
    state: input.refused === true ? "refused" : "answered",
    answeredat: input.now,
    ...(input.refused !== true && input.answer !== undefined ? { answer: input.answer } : {}),
  };
  return { requests: input.requests.map((candidate) => (candidate.id === input.id ? request : candidate)), request };
}

/** Lists the prompt defs the server exposes as callable tools: every prompt carries its name, description, declared arguments and render template. */
export function listprompts(): promptdef[] {
  return [
    {
      name: "runreview",
      description:
        "Renders the run review prompt that asks the user model to summarize the executed steps of the approved plan behind the consent gates.",
      arguments: [
        { name: "objective", description: "The objective of the approved plan under review.", required: true },
        { name: "steps", description: "The executed step summaries the review covers.", required: true },
        { name: "tone", description: "The tone of the summary.", default: "plain" },
      ],
      template:
        "Review the run of the objective {{objective}}. Summarize the executed steps: {{steps}}. Keep the tone {{tone}} and state every refusal the consent gates raised.",
    },
    {
      name: "pagesummary",
      description:
        "Renders the page summary prompt that condenses the observed page state of the session tab into the summary the client model asked for.",
      arguments: [
        { name: "url", description: "The url of the observed page.", required: true },
        {
          name: "observations",
          description: "The observed page state sections the summary condenses.",
          required: true,
        },
      ],
      template:
        "Summarize the page at {{url}} from the observations: {{observations}}. Name nothing the observations leave out.",
    },
    {
      name: "failuretriage",
      description:
        "Renders the failure triage prompt that classifies a failed tool call through the retry hints of the structured error it produced.",
      arguments: [
        { name: "tool", description: "The namespaced tool that failed.", required: true },
        { name: "error", description: "The structured error of the failed call.", required: true },
      ],
      template:
        "Triage the failure of the {{tool}} tool: {{error}}. Classify it as retryable, a busy window or a consent refusal and propose the next reviewed step.",
    },
  ];
}

/** Renders one prompt def with its arguments: every double braced placeholder substitutes its argument value while a required argument left empty keeps its placeholder so the review sees the gap. */
export function renderprompt(prompt: promptdef, args: Record<string, unknown>): string {
  return prompt.template.replace(/\{\{\s*([a-z0-9]+)\s*\}\}/g, (whole, name: string) => {
    const value = args[name];
    if (value === undefined || value === null) return whole;
    return typeof value === "string" ? value : JSON.stringify(value);
  });
}

/** Calls one prompt: the render validates the declared arguments, substitutes the defaults the prompt reviewed and returns the rendered prompt with its arguments as one tool call the client dispatches behind the consent gates. */
export function callprompt(input: { name: string; args?: Record<string, unknown>; now?: number }): {
  toolcall?: { name: string; params: Record<string, unknown> };
  rendered?: string;
  reason?: string;
} {
  const prompt = listprompts().find((candidate) => candidate.name === input.name);
  if (prompt === undefined) return { reason: `The server exposes no prompt named ${input.name}.` };
  const args = input.args ?? {};
  const findings: string[] = [];
  const resolved: Record<string, unknown> = {};
  for (const argument of prompt.arguments) {
    const value = args[argument.name];
    if (value === undefined || value === null || (typeof value === "string" && value.trim() === "")) {
      if (argument.default !== undefined) resolved[argument.name] = argument.default;
      else if (argument.required === true)
        findings.push(`The prompt argument ${argument.name} is required and stays empty.`);
      else resolved[argument.name] = "";
    } else {
      resolved[argument.name] = value;
    }
  }
  if (findings.length > 0) return { reason: findings.join(" ") };
  return {
    rendered: renderprompt(prompt, resolved),
    toolcall: {
      name: `prompts.${prompt.name}`,
      params: { prompt: prompt.name, arguments: resolved, rendered: renderprompt(prompt, resolved) },
    },
  };
}

/** Emits one stream chunk of a progressive tool result: the sequence number orders the chunks while the done marker closes the stream. */
export function streamchunkof(input: {
  callid: string;
  seq: number;
  content: string;
  done?: boolean;
  now: number;
}): streamchunk {
  return { callid: input.callid, seq: input.seq, content: input.content, done: input.done === true, at: input.now };
}

/** Splits one tool result content into ordered stream chunks; the final chunk carries the done marker so the client reassembles the progressive result. */
export function chunkcontent(input: { callid: string; content: string; size?: number; now: number }): streamchunk[] {
  const size = input.size !== undefined && Number.isFinite(input.size) && input.size > 0 ? Math.floor(input.size) : 80;
  const parts: string[] = [];
  for (let index = 0; index < input.content.length; index += size) parts.push(input.content.slice(index, index + size));
  const slices = parts.length > 0 ? parts : [""];
  return slices.map((content, index) =>
    streamchunkof({
      callid: input.callid,
      seq: index + 1,
      content,
      done: index === slices.length - 1,
      now: input.now + index,
    }),
  );
}

/** Reassembles ordered stream chunks into the progressive result content they carry. */
export function assemblechunks(chunks: streamchunk[]): string {
  return [...chunks]
    .sort((one, two) => one.seq - two.seq)
    .map((chunk) => chunk.content)
    .join("");
}

/** Emits one progress notice of a long tool call: the percent, the plain language message and the cancel hint the panel renders. */
export function notifyprogress(input: {
  callid: string;
  percent?: number;
  message: string;
  cancellable?: boolean;
  now: number;
}): progressnotice {
  return {
    callid: input.callid,
    ...(input.percent !== undefined ? { percent: input.percent } : {}),
    message: input.message,
    cancellable: input.cancellable !== false,
    at: input.now,
  };
}

/** Builds one cancellation frame that aborts an in flight tool call: the call id and the reason in plain language. */
export function cancelframeof(input: { callid: string; reason?: string; now: number }): cancelframe {
  return { callid: input.callid, ...(input.reason !== undefined ? { reason: input.reason } : {}), at: input.now };
}

/** Aborts one in flight tool call on its cancellation frame: the call context turns cancelled with its end time while the partial result survives for the answer; a finished or unknown call reports why nothing aborted. */
export function canceltool(input: {
  contexts: callcontext[];
  callid: string;
  reason?: string;
  partial?: callcontext["partial"];
  now: number;
}): { contexts: callcontext[]; context?: callcontext; reason?: string } {
  const match = input.contexts.find((context) => context.callid === input.callid);
  if (match === undefined)
    return { contexts: input.contexts, reason: `The cancellation frame names no call context ${input.callid}.` };
  if (match.state !== "inflight")
    return { contexts: input.contexts, reason: `The call ${input.callid} already left the in flight state.` };
  const context: callcontext = {
    ...match,
    state: "cancelled",
    endedat: input.now,
    ...(input.partial !== undefined ? { partial: input.partial } : {}),
  };
  return {
    contexts: input.contexts.map((candidate) => (candidate.callid === input.callid ? context : candidate)),
    context,
  };
}

/* ── Merged from agentwork.ts: the 1.1.88 consolidation interns the correlated agentwork logic here, so no variation of the same file lives beside another. ── */

/**
 * Agent work logic of the 1.1.73 family.
 * Every correlated rule for the on demand sub agent spawning under the user configured depth limit with the parent scope copied into the child unless narrowed, the lineage depth computed from the spawn records, the aggregatereport that merges parallel agent outputs into one document with per agent sections, provenance and conflicts resolved by policy order or sent to escalation, the interleaved timeline that orders the actions of every agent into one merged view with the per agent lanes kept visible, the lessonshare that records reusable lessons of finished runs, serves the matching lessons to agents starting similar tasks and counts reuse while stale lessons decay, the arbitrate cases that open when two agents contest one resource and grant it to the first requester or the priority lane winner and release when the holder finishes, the prioritylane ranking that keeps sensitive steps in the interactive lane and prevents lane starvation through the round robin fallback, the scaleworkers load reports per origin with their spawn and pause suggestions that never act without consent, and the costshare ledger that attributes shared costs to the agents that caused them lives in this file.
 * The work layer never bypasses a gate: a spawn stays inside the parent scope, the depth ceiling stays the user's choice with no hardcoded number, an aggregation never rewrites the original outputs, a verdict never bypasses the sessionlock or the origin grants, a suggestion never spawns a worker without consent and every lesson sanitizes before storage.
 */

/** Spawns one sub agent under its parent: the child registers with its unique lowercase name through the same agentname rule of the fleet, the spawn refuses a paused or stopped parent, the child depth sits exactly one level under the parent lineage depth, the parent scope copies into the child unless the spec narrows it, and a narrowing that widens past the parent refuses loudly. */
export function spawnsubagent(input: {
  records: agentrecord[];
  spawns: spawnrecord[];
  spec: subagentspec;
  parentscope?: agentscope;
  id: string;
  name?: string;
  now: number;
}): { record: agentrecord; scope: agentscope; spawn: spawnrecord } {
  const parent = input.records.find((record) => record.id === input.spec.parentid);
  if (!parent)
    throw new Error(
      `The spawn request names the parent ${input.spec.parentid} which the fleet registry does not carry.`,
    );
  if (input.spec.objective.trim() === "")
    throw new Error(
      "The spawn request needs its parent objective in plain language; the child works on the objective its parent handed over.",
    );
  const parentdepth = depthoflineage({ spawns: input.spawns, agentid: parent.id });
  if (!Number.isInteger(input.spec.depth) || input.spec.depth <= 0)
    throw new Error("The spawn depth stays a positive whole number of the lineage.");
  if (input.spec.depth !== parentdepth + 1)
    throw new Error(
      `The spawn request depth ${input.spec.depth} must sit exactly one level under the parent lineage depth ${parentdepth}.`,
    );
  if (parent.state === "paused")
    throw new Error(`The parent ${parent.name} sits paused; a paused parent spawns no child until its resume.`);
  if (parent.state === "stopped")
    throw new Error(`The parent ${parent.name} is stopped; a stopped parent spawns no child.`);
  const record = agentname({
    records: input.records,
    id: input.id,
    proposed:
      input.name !== undefined && input.name.trim() !== "" ? input.name : `${parent.name}sub${input.spec.depth}`,
    ...(input.spec.role !== undefined ? { role: input.spec.role } : { role: "worker" as agentrole }),
    origin: parent.origin,
    now: input.now,
  });
  const scope = childscopeof({
    agentid: record.id,
    ...(input.parentscope !== undefined ? { parent: input.parentscope } : {}),
    ...(input.spec.narrowscope !== undefined ? { narrowed: input.spec.narrowscope } : {}),
  });
  const spawn: spawnrecord = {
    id: `${record.id}:spawn`,
    parentid: parent.id,
    childid: record.id,
    role: record.role,
    depth: input.spec.depth,
    objective: input.spec.objective.trim(),
    at: input.now,
  };
  return { record, scope, spawn };
}

/** Copies the parent scope into the child unless narrowed: a narrowing keeps only the parent origins and action kinds so the child scope stays a subset of its parent, and a narrowing that lands entirely outside the parent refuses instead of silently widening. */
export function childscopeof(input: {
  agentid: string;
  parent?: agentscope;
  narrowed?: { origins?: string[]; actionkinds?: string[] };
}): agentscope {
  if (input.agentid.trim() === "") throw new Error("The child scope needs its agent id.");
  const parent = input.parent;
  if (parent === undefined) return { agentid: input.agentid.trim(), origins: [], toolnamespaces: [] };
  const narrowedorigins = (input.narrowed?.origins ?? [])
    .map((origin) => origin.trim())
    .filter((origin) => origin !== "");
  const origins =
    narrowedorigins.length > 0 ? narrowedorigins.filter((origin) => parent.origins.includes(origin)) : parent.origins;
  if (narrowedorigins.length > 0 && origins.length === 0)
    throw new Error(
      `The narrowed origins ${narrowedorigins.join(", ")} sit outside the parent scope ${parent.origins.join(", ")}; the child scope never widens past its parent.`,
    );
  const narrowedkinds = (input.narrowed?.actionkinds ?? []).map((kind) => kind.trim()).filter((kind) => kind !== "");
  const parentkinds = parent.actionkinds ?? [];
  const actionkinds =
    narrowedkinds.length > 0 ? narrowedkinds.filter((kind) => parentkinds.includes(kind)) : parentkinds;
  if (narrowedkinds.length > 0 && actionkinds.length === 0)
    throw new Error(
      `The narrowed action kinds ${narrowedkinds.join(", ")} sit outside the parent scope; the child scope never widens past its parent.`,
    );
  return {
    agentid: input.agentid.trim(),
    origins,
    toolnamespaces: parent.toolnamespaces,
    ...(actionkinds.length > 0 ? { actionkinds } : {}),
    ...(parent.readonly === true ? { readonly: true } : {}),
  };
}

/** Computes the spawn depth of one agent lineage: the chain of spawn records from the agent up through its parents counts one level per spawn, an agent nobody spawned sits at depth zero, and a cycle in the lineage refuses instead of looping. */
export function depthoflineage(input: { spawns: spawnrecord[]; agentid: string }): number {
  let current = input.agentid;
  let depth = 0;
  const seen = new Set<string>([current]);
  for (;;) {
    const spawn = input.spawns.find((entry) => entry.childid === current);
    if (!spawn) return depth;
    if (seen.has(spawn.parentid))
      throw new Error(
        `The spawn lineage of the agent ${input.agentid} carries a cycle at ${spawn.parentid}; the depth never loops.`,
      );
    seen.add(spawn.parentid);
    current = spawn.parentid;
    depth += 1;
  }
}

/** Checks one spawn depth against the user configured depth limit: the depth refuses past the configured ceiling while an absent limit stays unbounded because the ceiling stays the user's choice with no hardcoded number. */
export function depthlimitof(input: { spawns: spawnrecord[]; agentid: string; limit: depthlimit }): {
  depth: number;
  allowed: boolean;
  reason: string;
} {
  const depth = depthoflineage({ spawns: input.spawns, agentid: input.agentid });
  if (input.limit.maxdepth === undefined)
    return {
      depth,
      allowed: true,
      reason: `The lineage depth of the agent ${input.agentid} sits at ${depth}; the user configured no depth ceiling so the spawn recursion stays unbounded.`,
    };
  if (depth > input.limit.maxdepth)
    return {
      depth,
      allowed: false,
      reason: `The lineage depth ${depth} of the agent ${input.agentid} passes the user configured depth limit ${input.limit.maxdepth}; the spawn refuses until the user raises the limit.`,
    };
  return {
    depth,
    allowed: true,
    reason: `The lineage depth ${depth} of the agent ${input.agentid} sits inside the user configured depth limit ${input.limit.maxdepth}.`,
  };
}

/** Merges the parallel outputs of several agents into one aggregatereport: every agent keeps its own section with its run provenance, a section two agents wrote conflicts, a conflict resolves through the user configured policy order that names its agent precedence while a conflict without an order stays unresolved and the record stays open for the escalation. */
export function aggregatereport(input: {
  id: string;
  subject: string;
  cells: aggregatecell[];
  conflictorder?: string[];
  expected?: string[];
  now: number;
}): aggregaterecord {
  if (input.id.trim() === "") throw new Error("The aggregatereport needs its id.");
  if (input.subject.trim() === "") throw new Error("The aggregatereport needs its subject in plain language.");
  const cells = input.cells.filter((cell) => cell.agentid.trim() !== "" && cell.section.trim() !== "");
  if (cells.length === 0)
    throw new Error("The aggregatereport merges at least one agent output; an empty parallel run aggregates nothing.");
  const sections = new Map<string, aggregatecell[]>();
  for (const cell of cells) {
    const key = cell.section.trim();
    sections.set(key, [...(sections.get(key) ?? []), { ...cell, agentid: cell.agentid.trim(), section: key }]);
  }
  const conflicts: aggregaterecord["conflicts"] = [];
  for (const [key, writers] of [...sections.entries()].sort((one, two) => (one[0] < two[0] ? -1 : 1))) {
    if (writers.length < 2) continue;
    const ordered =
      input.conflictorder !== undefined
        ? writers.slice().sort((one, two) => {
            const oneindex = input.conflictorder!.indexOf(one.agentid);
            const twoindex = input.conflictorder!.indexOf(two.agentid);
            return (
              (oneindex === -1 ? Number.MAX_SAFE_INTEGER : oneindex) -
              (twoindex === -1 ? Number.MAX_SAFE_INTEGER : twoindex)
            );
          })
        : writers;
    const winner = ordered[0] as aggregatecell;
    const resolved = input.conflictorder !== undefined && input.conflictorder.includes(winner.agentid);
    conflicts.push({ key, ...(resolved ? { resolvedby: winner.agentid } : {}) });
  }
  const unresolved = conflicts.filter((conflict) => conflict.resolvedby === undefined);
  const complete =
    input.expected === undefined || input.expected.every((agentid) => cells.some((cell) => cell.agentid === agentid));
  const state: aggregaterecord["state"] = unresolved.length > 0 || !complete ? "open" : "merged";
  return {
    id: input.id.trim(),
    subject: input.subject.trim(),
    cells,
    conflicts,
    ...(input.expected !== undefined ? { expected: input.expected } : {}),
    state,
    ...(state === "merged" ? { mergedat: input.now } : {}),
    createdat: input.now,
  };
}

/** Orders the actions of different agents into one interleaved timeline: the events sort by their time and id across every agent while each event carries its lane so the merged view keeps every per agent lane visible inside the one stream. */
export function interleave(input: {
  events: Array<{ id?: string; agentid: string; kind: string; summary: string; at: number; lane?: string }>;
  lanes: tasklane[];
}): interleaveevent[] {
  const lanemap = new Map<string, string>();
  for (const lane of input.lanes) for (const agentid of lane.agentids ?? []) lanemap.set(agentid, lane.name);
  const events: interleaveevent[] = input.events.map((event, index) => ({
    id: event.id !== undefined && event.id.trim() !== "" ? event.id.trim() : `ie${index}`,
    agentid: event.agentid,
    kind: event.kind,
    summary: event.summary,
    lane:
      event.lane !== undefined && event.lane.trim() !== ""
        ? event.lane.trim()
        : (lanemap.get(event.agentid) ?? "background"),
    at: event.at,
  }));
  if (events.length === 0)
    throw new Error(
      "The interleaved timeline orders at least one agent action; an empty fleet view interleaves nothing.",
    );
  return events.sort((one, two) => one.at - two.at || (one.id < two.id ? -1 : 1));
}

/** Records one reusable lesson of a finished run: the finding in plain language, the agent that found it and the origin it holds on, with the reuse count starting at zero until another agent serves it. */
export function lessonrecordof(input: {
  id: string;
  agentid: string;
  finding: string;
  origin: string;
  now: number;
}): lessonrecord {
  if (input.id.trim() === "") throw new Error("The lesson needs its id.");
  if (input.agentid.trim() === "") throw new Error("The lesson names the agent that found it.");
  if (input.finding.trim() === "")
    throw new Error("The lesson needs its finding in plain language; the fleet reads exactly what the run learned.");
  if (input.origin.trim() === "")
    throw new Error("The lesson names its origin; the matches prefer the lessons of the same site.");
  return {
    id: input.id.trim(),
    agentid: input.agentid.trim(),
    finding: input.finding.trim(),
    origin: input.origin.trim(),
    reusecount: 0,
    recordedat: input.now,
  };
}

/** Serves the matching lessons to an agent starting a similar task: the lessons of the same origin match first, the findings that share words with the task follow, and the reuse count of every served lesson grows so the fleet reads which lessons carry their weight. */
export function lessonmatches(input: {
  lessons: lessonrecord[];
  task: string;
  origin?: string;
  limit?: number;
}): lessonrecord[] {
  if (input.task.trim() === "") return [];
  const words = new Set(
    input.task
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter((word) => word.length > 3),
  );
  const scored = input.lessons
    .map((lesson) => {
      const lessonwords = lesson.finding
        .toLowerCase()
        .split(/[^a-z0-9]+/)
        .filter((word) => word.length > 3);
      const overlap = lessonwords.filter((word) => words.has(word)).length;
      const originmatch = input.origin !== undefined && lesson.origin === input.origin ? 1 : 0;
      return { lesson, score: originmatch * 2 + overlap };
    })
    .filter((entry) => entry.score > 0)
    .sort((one, two) => two.score - one.score || two.lesson.reusecount - one.lesson.reusecount);
  const limit =
    input.limit !== undefined && Number.isFinite(input.limit) && input.limit > 0
      ? Math.floor(input.limit)
      : scored.length;
  return scored.slice(0, limit).map((entry) => entry.lesson);
}

/** Counts one reuse of a served lesson: the reuse count grows by one and the last used time moves to now while the lessons nobody serves stay exactly as they were. */
export function lessonreuse(input: { lessons: lessonrecord[]; id: string; now: number }): lessonrecord[] {
  const lesson = input.lessons.find((entry) => entry.id === input.id);
  if (!lesson) throw new Error(`The lesson ${input.id} does not exist; the reuse counts only the served lessons.`);
  return input.lessons.map((entry) =>
    entry.id === input.id ? { ...entry, reusecount: entry.reusecount + 1, lastusedat: input.now } : entry,
  );
}

/** Decays the stale lessons: a lesson nobody reused for the whole user configured window retires from the serving list while the lessons still carrying reuse stay; an absent window keeps every lesson because the decay stays the user's choice. */
export function lessondecay(input: { lessons: lessonrecord[]; now: number; stalewindow?: number }): lessonrecord[] {
  if (input.stalewindow === undefined || !Number.isFinite(input.stalewindow) || input.stalewindow <= 0)
    return input.lessons;
  const stalewindow: number = input.stalewindow;
  return input.lessons.filter((lesson) => {
    if (lesson.reusecount > 0) return true;
    const age = input.now - (lesson.lastusedat ?? lesson.recordedat);
    return age <= stalewindow;
  });
}

/** Opens one arbitration case of a contested resource and grants its first verdict: the case needs at least two requesting agents because one requester contests nothing, the first requester holds the resource by default, a requester of a higher priority lane takes the grant over the first requester, and the verdict names its lane and its reason for the audit trail. */
export function arbitrationcaseof(input: {
  id: string;
  resource: string;
  origin: string;
  requesters: string[];
  lanes: tasklane[];
  now: number;
}): arbitrationcase {
  if (input.id.trim() === "") throw new Error("The arbitration case needs its id.");
  if (input.resource.trim() === "") throw new Error("The arbitration case names its contested resource.");
  if (input.origin.trim() === "") throw new Error("The arbitration case names the origin of its contested resource.");
  const requesters = [...new Set(input.requesters.map((id) => id.trim()).filter((id) => id !== ""))];
  if (requesters.length < 2)
    throw new Error(
      `The arbitration case of ${input.resource.trim()} needs at least two requesting agents; one requester contests nothing.`,
    );
  const lanepriority = new Map<string, number>();
  for (const lane of input.lanes) for (const agentid of lane.agentids ?? []) lanepriority.set(agentid, lane.priority);
  const first = requesters[0] as string;
  const winner = requesters
    .slice(1)
    .reduce(
      (lead, candidate) => ((lanepriority.get(candidate) ?? 0) > (lanepriority.get(lead) ?? 0) ? candidate : lead),
      first,
    );
  const lane = input.lanes.find((entry) => (entry.agentids ?? []).includes(winner));
  const verdict: arbitrationverdict = {
    holderagentid: winner,
    lane: lane?.name ?? "background",
    reason:
      winner === first
        ? `The first requester ${winner} holds ${input.resource.trim()} by default; no lane of a peer outranks it.`
        : `The requester ${winner} of the ${lane?.name ?? "background"} lane outranks the first requester through its user configured priority; the verdict honors the lane.`,
    grantedat: input.now,
  };
  return {
    id: input.id.trim(),
    resource: input.resource.trim(),
    origin: input.origin.trim(),
    requesterids: requesters,
    state: "granted",
    verdict,
    openedat: input.now,
  };
}

/** Releases the verdict of one arbitration case when its holder finishes: the release frees the resource for the next requester and closes the case while a release without the finished holder refuses. */
export function releasecase(input: {
  cases: arbitrationcase[];
  id: string;
  holderfinished: boolean;
  now: number;
}): arbitrationcase {
  const record = input.cases.find((entry) => entry.id === input.id);
  if (!record) throw new Error(`The arbitration case ${input.id} does not exist.`);
  if (record.state !== "granted")
    throw new Error(`The arbitration case ${record.id} carries no granted verdict to release.`);
  if (!input.holderfinished)
    throw new Error(
      `The holder ${record.verdict?.holderagentid} of ${record.resource} still works; the verdict releases only when the holder finishes.`,
    );
  return { ...record, state: "released", closedat: input.now };
}

/** Ranks the queued tasks by the user configured lane priority: the sensitive tasks stay in the interactive lane whatever lane asked for them, the interactive lane always serves first, and every further lane serves one task per round robin cycle in its priority order so no lane starves behind a busy higher priority lane. */
export function prioritylaneof(input: {
  tasks: Array<{ id: string; lane: string; priority?: number; sensitive?: boolean; enqueuedat: number }>;
  lanes: tasklane[];
}): Array<{ id: string; lane: string; priority?: number; sensitive?: boolean; enqueuedat: number }> {
  const tasks = input.tasks.map((task) => ({ ...task, lane: task.sensitive === true ? "interactive" : task.lane }));
  const order = (lane: string): number => {
    const found = input.lanes.find((entry) => entry.name === lane);
    if (found?.interactive === true) return Number.MAX_SAFE_INTEGER;
    return found?.priority ?? 0;
  };
  const groups = [...new Set(tasks.map((task) => task.lane))].sort((one, two) => order(two) - order(one));
  const queues = new Map<string, typeof tasks>();
  for (const lane of groups)
    queues.set(
      lane,
      tasks
        .filter((task) => task.lane === lane)
        .sort((one, two) => (two.priority ?? 0) - (one.priority ?? 0) || one.enqueuedat - two.enqueuedat),
    );
  const ordered: typeof tasks = [];
  for (;;) {
    let served = false;
    for (const lane of groups) {
      const queue = queues.get(lane) ?? [];
      const next = queue.shift();
      if (next !== undefined) {
        ordered.push(next);
        served = true;
      }
    }
    if (!served) return ordered;
  }
}

/** Builds one load report sample of an origin: the concurrency of the live workers and the latency of the waits freeze into one sample the scaleworkers pass reads. */
export function loadreportof(input: { origin: string; concurrency: number; latency: number; now: number }): loadreport {
  if (input.origin.trim() === "") throw new Error("The load report names its origin.");
  if (!Number.isFinite(input.concurrency) || input.concurrency < 0)
    throw new Error("The load report concurrency stays zero or positive.");
  if (!Number.isFinite(input.latency) || input.latency < 0)
    throw new Error("The load report latency stays zero or positive milliseconds.");
  return {
    origin: input.origin.trim(),
    concurrency: Math.floor(input.concurrency),
    latency: Math.round(input.latency),
    sampledat: input.now,
  };
}

/** Reads the scaleworkers suggestions from the load reports: an origin whose load stays low suggests spawning one more worker, an origin whose latency passes the throttle threshold suggests pausing a worker, and every suggestion stays a suggestion because the spawn itself needs the user consent; absent thresholds hold the suggestions. */
export function scalesuggestion(input: {
  reports: loadreport[];
  lowthreshold?: number;
  throttlethreshold?: number;
}): Array<{ origin: string; suggestion: "spawn" | "pause" | "hold"; reason: string }> {
  return input.reports.map((report) => {
    if (
      input.throttlethreshold !== undefined &&
      Number.isFinite(input.throttlethreshold) &&
      input.throttlethreshold > 0 &&
      report.latency >= input.throttlethreshold
    )
      return {
        origin: report.origin,
        suggestion: "pause" as const,
        reason: `The origin ${report.origin} throttles at ${report.latency} milliseconds of latency past the threshold ${input.throttlethreshold}; pausing one worker eases the site, and the pause needs the user.`,
      };
    if (
      input.lowthreshold !== undefined &&
      Number.isFinite(input.lowthreshold) &&
      input.lowthreshold > 0 &&
      report.concurrency <= input.lowthreshold &&
      report.latency < input.lowthreshold
    )
      return {
        origin: report.origin,
        suggestion: "spawn" as const,
        reason: `The origin ${report.origin} carries its load of ${report.concurrency} worker${report.concurrency === 1 ? "" : "s"} with ${report.latency} milliseconds of latency; spawning one more worker shares the work, and the spawn needs the user consent.`,
      };
    return {
      origin: report.origin,
      suggestion: "hold" as const,
      reason: `The origin ${report.origin} carries ${report.concurrency} worker${report.concurrency === 1 ? "" : "s"} at ${report.latency} milliseconds of latency; the fleet holds its size.`,
    };
  });
}

/** Builds one cost entry of the shared fleet ledger: the agent that caused the cost, the run it belongs to, the units it spent and the plain language description of what the units bought. */
export function costentryof(input: {
  agentid: string;
  runid?: string;
  units: number;
  description: string;
  now: number;
}): costentry {
  if (input.agentid.trim() === "") throw new Error("The cost entry names the agent that caused it.");
  if (!Number.isFinite(input.units) || input.units <= 0)
    throw new Error("The cost entry carries a positive number of units; a zero cost never enters the ledger.");
  if (input.description.trim() === "")
    throw new Error("The cost entry describes what its units bought in plain language.");
  return {
    agentid: input.agentid.trim(),
    ...(input.runid !== undefined && input.runid.trim() !== "" ? { runid: input.runid.trim() } : {}),
    units: input.units,
    description: input.description.trim(),
    at: input.now,
  };
}

/** Splits the shared costs of the fleet ledger to the agents that caused them: a cost one agent caused attributes fully to it while a cost several agents share through the same description splits equally among its causers, and every agent reads its own share. */
export function sharedcostsplit(input: {
  entries: costentry[];
}): Array<{ agentid: string; units: number; share: number; sharedwith?: string[] }> {
  const solo = new Map<string, number>();
  const groups = new Map<string, Map<string, number>>();
  for (const entry of input.entries) {
    const group = groups.get(entry.description) ?? new Map<string, number>();
    group.set(entry.agentid, (group.get(entry.agentid) ?? 0) + entry.units);
    groups.set(entry.description, group);
  }
  for (const group of groups.values()) {
    const agents = [...group.keys()];
    if (agents.length === 1) {
      const agentid = agents[0] as string;
      solo.set(agentid, (solo.get(agentid) ?? 0) + (group.get(agentid) ?? 0));
    }
  }
  const shared = new Map<string, { units: number; peers: Set<string> }>();
  for (const group of groups.values()) {
    const agents = [...group.keys()];
    if (agents.length < 2) continue;
    const total = [...group.values()].reduce((sum, units) => sum + units, 0);
    const share = total / agents.length;
    for (const agentid of agents) {
      const current = shared.get(agentid) ?? { units: 0, peers: new Set<string>() };
      current.units += share;
      for (const peer of agents) if (peer !== agentid) current.peers.add(peer);
      shared.set(agentid, current);
    }
  }
  const agentids = [...new Set([...solo.keys(), ...shared.keys()])].sort();
  return agentids.map((agentid) => {
    const soloamount = solo.get(agentid) ?? 0;
    const sharedamount = shared.get(agentid);
    return {
      agentid,
      units: soloamount + (sharedamount?.units ?? 0),
      share: soloamount,
      ...(sharedamount !== undefined ? { sharedwith: [...sharedamount.peers].sort() } : {}),
    };
  });
}

/* ── Merged from multiagent.ts: the 1.1.88 consolidation interns the correlated multiagent logic here, so no variation of the same file lives beside another. ── */
import { newworkflowrun } from "./workflow.js";

/**
 * Multi agent lifecycle logic of the 1.1.58 family.
 * Every correlated rule for agent identities, roles, tab binding, sub agent spawning with depth limits, pause, resume, stop, the killswitch, per agent budgets and permission scopes, per agent usage and the swarm overview lives in this file.
 * The swarm never bypasses review: an agent claims queue tasks and proposes work through the same plan review a single agent passes, and the killswitch stays available with no configuration barrier.
 */

/** The default tool namespaces of a role: planners compose and read, workers also act on the browser, critics review agent outputs read only, verifiers re-read the page to check claims and observers stay read only; a custom role grades with the worker defaults until the user narrows its scope. */
export function roledefaults(role: agentrole): { toolnamespaces: toolnamespace[]; description: string } {
  if (role === "planner")
    return {
      toolnamespaces: ["workflow", "memory", "system"],
      description: "Planners compose reviewed plans and read memory; they never act on the page themselves.",
    };
  if (role === "observer")
    return {
      toolnamespaces: ["memory", "system"],
      description: "Observers read the shared memory and the system reports only.",
    };
  if (role === "critic")
    return {
      toolnamespaces: ["workflow", "memory", "system"],
      description: "Critics review the outputs of the other agents read only; they never act on the page themselves.",
    };
  if (role === "verifier")
    return {
      toolnamespaces: ["browser", "memory", "system"],
      description: "Verifiers re-read the page to check the claims of the other agents; their checks stay read side.",
    };
  return {
    toolnamespaces: ["browser", "workflow", "memory", "system"],
    description:
      role === "worker"
        ? "Workers execute the reviewed steps of approved plans."
        : `The custom role ${role} carries the worker defaults until the user narrows its scope.`,
  };
}

/** Registers one agent identity bound to a tab; the user names the agent for dashboards and audit, and one tab never holds two agents. */
export function registeragent(input: {
  agents: agentidentity[];
  id: string;
  name: string;
  tabid?: number;
  sessionid?: string;
  role?: agentrole;
  now: number;
}): agentidentity[] {
  if (input.name.trim() === "")
    throw new Error("The agent needs the user chosen name; agent naming stays a user choice.");
  if (
    input.tabid !== undefined &&
    input.agents.some((agent) => agent.tabid === input.tabid && agent.state !== "stopped")
  )
    throw new Error(
      `Tab ${input.tabid} already holds the agent ${input.agents.find((agent) => agent.tabid === input.tabid)?.name ?? "another agent"}; one tab binds one agent.`,
    );
  if (input.id !== "" && input.agents.some((agent) => agent.id === input.id))
    throw new Error(`The agent id ${input.id} is already registered.`);
  const agent: agentidentity = {
    id: input.id,
    name: input.name.trim(),
    role: input.role ?? "worker",
    depth: 0,
    state: "active",
    ...(input.tabid !== undefined ? { tabid: input.tabid } : {}),
    ...(input.sessionid !== undefined ? { sessionid: input.sessionid } : {}),
    registeredat: input.now,
    heartbeatat: input.now,
  };
  return [agent, ...input.agents];
}

/** Attaches one role to a registered agent; the role carries its defaults and the change reads in the audit trail. */
export function assignrole(input: {
  agents: agentidentity[];
  agentid: string;
  role: agentrole;
  now: number;
}): agentidentity[] {
  const agent = input.agents.find((entry) => entry.id === input.agentid);
  if (!agent) throw new Error(`The agent ${input.agentid} is not registered.`);
  return input.agents.map((entry) =>
    entry.id === input.agentid ? { ...entry, role: input.role, heartbeatat: input.now } : entry,
  );
}

/** Binds one agent to one tab session; a tab bound to another live agent refuses the binding, so one tab runs one agent. */
export function opentabagent(input: {
  agents: agentidentity[];
  agentid: string;
  tabid: number;
  sessionid?: string;
  now: number;
}): agentidentity[] {
  const agent = input.agents.find((entry) => entry.id === input.agentid);
  if (!agent) throw new Error(`The agent ${input.agentid} is not registered.`);
  const holder = input.agents.find(
    (entry) => entry.tabid === input.tabid && entry.id !== input.agentid && entry.state !== "stopped",
  );
  if (holder) throw new Error(`Tab ${input.tabid} already holds the agent ${holder.name}; one tab binds one agent.`);
  return input.agents.map((entry) =>
    entry.id === input.agentid
      ? {
          ...entry,
          tabid: input.tabid,
          ...(input.sessionid !== undefined ? { sessionid: input.sessionid } : {}),
          heartbeatat: input.now,
        }
      : entry,
  );
}

/** Spawns one sub agent under a spawn request; the child carries its parent, its depth and the requested role, and the spawn refuses recursion past the configured depth limit. */
export function spawn(input: {
  agents: agentidentity[];
  request: spawnrequest;
  limit: depthlimit;
  id: string;
  name?: string;
  now: number;
}): agentidentity[] {
  const parent = input.agents.find((entry) => entry.id === input.request.parentid);
  if (!parent) throw new Error(`The spawn request names the parent ${input.request.parentid} which is not registered.`);
  if (input.request.task.trim() === "") throw new Error("The spawn request needs its task in plain language.");
  if (input.request.depth !== parent.depth + 1)
    throw new Error(
      `The spawn request depth ${input.request.depth} must sit exactly one level under the parent depth ${parent.depth}.`,
    );
  if (input.limit.maxdepth !== undefined && input.request.depth > input.limit.maxdepth)
    throw new Error(
      `The spawn refuses recursion at depth ${input.request.depth}: the user configured depth limit stops at ${input.limit.maxdepth}.`,
    );
  const child: agentidentity = {
    id: input.id,
    name:
      input.name?.trim() !== "" && input.name !== undefined
        ? input.name.trim()
        : `${parent.name} sub ${input.request.depth}`,
    role: input.request.role,
    parentid: parent.id,
    depth: input.request.depth,
    state: "active",
    registeredat: input.now,
    heartbeatat: input.now,
  };
  return [child, ...input.agents];
}

/** Pauses one agent without stopping the others; a paused agent claims no task until its resume. */
export function pauseone(input: { agents: agentidentity[]; agentid: string; now: number }): agentidentity[] {
  const agent = input.agents.find((entry) => entry.id === input.agentid);
  if (!agent) throw new Error(`The agent ${input.agentid} is not registered.`);
  if (agent.state === "stopped") throw new Error(`The agent ${agent.name} is stopped; a stopped agent needs no pause.`);
  return input.agents.map((entry) =>
    entry.id === input.agentid ? { ...entry, state: "paused" as const, heartbeatat: input.now } : entry,
  );
}

/** Resumes one paused agent; the other agents never changed. */
export function resumeone(input: { agents: agentidentity[]; agentid: string; now: number }): agentidentity[] {
  const agent = input.agents.find((entry) => entry.id === input.agentid);
  if (!agent) throw new Error(`The agent ${input.agentid} is not registered.`);
  if (agent.state !== "paused") throw new Error(`The agent ${agent.name} is not paused.`);
  return input.agents.map((entry) =>
    entry.id === input.agentid ? { ...entry, state: "active" as const, heartbeatat: input.now } : entry,
  );
}

/** Stops one agent; its claims release through the queue requeue pass. */
export function stopone(input: { agents: agentidentity[]; agentid: string; now: number }): agentidentity[] {
  const agent = input.agents.find((entry) => entry.id === input.agentid);
  if (!agent) throw new Error(`The agent ${input.agentid} is not registered.`);
  return input.agents.map((entry) =>
    entry.id === input.agentid ? { ...entry, state: "stopped" as const, heartbeatat: input.now } : entry,
  );
}

/** Triggers the killswitch and cancels every agent run at once: every agent stops whatever it holds and the switch records why. */
export function killall(input: { agents: agentidentity[]; reason?: string; now: number }): {
  agents: agentidentity[];
  killswitch: killswitch;
} {
  return {
    agents: input.agents.map((agent) => ({ ...agent, state: "stopped" as const, heartbeatat: input.now })),
    killswitch: {
      engaged: true,
      engagedat: input.now,
      ...(input.reason !== undefined && input.reason.trim() !== "" ? { reason: input.reason } : {}),
    },
  };
}

/** Disarms the killswitch so the user may register or resume agents again. */
export function disarmkillswitch(now: number): killswitch {
  return { engaged: false, engagedat: now };
}

/** Checks one agent against its budget: a reached token, cost or step ceiling halts the agent until the user raises the ceiling; absent ceilings never halt. */
export function agentbudgetcheck(input: { agent: agentidentity; usage: agentusage | undefined }): {
  halted: boolean;
  reason?: string;
} {
  const budget = input.agent.budget;
  const usage = input.usage;
  if (!budget || !usage) return { halted: false };
  if (budget.maxtokens !== undefined && usage.tokens > budget.maxtokens)
    return {
      halted: true,
      reason: `The agent ${input.agent.name} spent ${usage.tokens} tokens past its ceiling of ${budget.maxtokens}; the user raises the ceiling or stops the agent.`,
    };
  if (budget.maxcost !== undefined && usage.cost > budget.maxcost)
    return {
      halted: true,
      reason: `The agent ${input.agent.name} spent ${usage.cost} past its cost ceiling of ${budget.maxcost}; the user raises the ceiling or stops the agent.`,
    };
  if (budget.maxsteps !== undefined && usage.steps > budget.maxsteps)
    return {
      halted: true,
      reason: `The agent ${input.agent.name} executed ${usage.steps} steps past its ceiling of ${budget.maxsteps}; the user raises the ceiling or stops the agent.`,
    };
  return { halted: false };
}

/** Checks one agent scope: an origin or a tool namespace outside the grant refuses, and an absent scope stays unbounded inside the session grants. */
export function scopegate(input: { scope: agentscope | undefined; origin?: string; namespace?: toolnamespace }): {
  allowed: boolean;
  reason?: string;
} {
  if (!input.scope) return { allowed: true };
  if (input.origin !== undefined && input.scope.origins.length > 0 && !input.scope.origins.includes(input.origin))
    return { allowed: false, reason: `The agent scope grants no access to the origin ${input.origin}.` };
  if (
    input.namespace !== undefined &&
    input.scope.toolnamespaces.length > 0 &&
    !input.scope.toolnamespaces.includes(input.namespace)
  )
    return { allowed: false, reason: `The agent scope grants no access to the ${input.namespace} tool namespace.` };
  return { allowed: true };
}

/** Refreshes one agent heartbeat so the panel and the queue read a live agent. */
export function agentheartbeat(input: { agents: agentidentity[]; agentid: string; now: number }): agentidentity[] {
  return input.agents.map((entry) => (entry.id === input.agentid ? { ...entry, heartbeatat: input.now } : entry));
}

/** Accumulates one usage delta into the per agent usage counters held against the agent budget. */
export function recordagentusage(input: {
  usage: agentusage | undefined;
  agentid: string;
  tokens?: number;
  cost?: number;
  steps?: number;
  now: number;
}): agentusage {
  const base = input.usage ?? { agentid: input.agentid, tokens: 0, cost: 0, steps: 0, updatedat: input.now };
  return {
    agentid: input.agentid,
    tokens: base.tokens + (input.tokens ?? 0),
    cost: base.cost + (input.cost ?? 0),
    steps: base.steps + (input.steps ?? 0),
    updatedat: input.now,
  };
}

/** Builds one per agent run context that reuses the workflow engine: the run id carries the agent and the task so concurrent agent runs stay isolated through the same run records the workflow engine keeps. */
export function agentruncontext(input: { agent: agentidentity; task: taskitem; now: number }): {
  agentid: string;
  taskid: string;
  run: workflowrun;
} {
  return {
    agentid: input.agent.id,
    taskid: input.task.id,
    run: newworkflowrun({ id: `${input.agent.id}:${input.task.id}`, workflowid: input.task.lane, now: input.now }),
  };
}

/** Builds one agent lifecycle event notification for the protocol envelope and the audit trail. */
export function agenteventof(input: {
  id: string;
  kind: agenteventkind;
  summary: string;
  agentid?: string;
  taskid?: string;
  now: number;
}): agentevent {
  return {
    id: input.id,
    kind: input.kind,
    summary: input.summary,
    ...(input.agentid !== undefined ? { agentid: input.agentid } : {}),
    ...(input.taskid !== undefined ? { taskid: input.taskid } : {}),
    at: input.now,
  };
}

/** Returns the swarm at a glance: the agents with their live states, the tasks by claim state and the message counters. */
export function swarmoverview(input: { agents: agentidentity[]; queue: taskqueue; mailboxes: agentmailbox[] }): {
  agents: number;
  active: number;
  paused: number;
  stopped: number;
  tasks: number;
  queued: number;
  claimed: number;
  done: number;
  cancelled: number;
  messages: number;
  unread: number;
} {
  const claimed = input.queue.items.filter((item) => item.state === "claimed").length;
  return {
    agents: input.agents.length,
    active: input.agents.filter((agent) => agent.state === "active").length,
    paused: input.agents.filter((agent) => agent.state === "paused").length,
    stopped: input.agents.filter((agent) => agent.state === "stopped").length,
    tasks: input.queue.items.length,
    queued: input.queue.items.filter((item) => item.state === "queued").length,
    claimed,
    done: input.queue.items.filter((item) => item.state === "done").length,
    cancelled: input.queue.items.filter((item) => item.state === "cancelled").length,
    messages: input.mailboxes.reduce((total, mailbox) => total + mailbox.inbox.length, 0),
    unread: input.mailboxes.reduce((total, mailbox) => total + mailbox.unread, 0),
  };
}

/** Reads the swarm state snapshot the protocol envelope and the panel render: the agents, the queue, the mailboxes and the killswitch. */
export function swarmstateof(input: {
  agents: agentidentity[];
  queue: taskqueue;
  mailboxes: agentmailbox[];
  killswitch: killswitch;
}): swarmstate {
  return { agents: input.agents, queue: input.queue, mailboxes: input.mailboxes, killswitch: input.killswitch };
}

/* ── Merged from coordination.ts: the 1.1.88 consolidation interns the correlated coordination logic here, so no variation of the same file lives beside another. ── */
import { postentry } from "./swarm.js";

/**
 * Multi agent coordination logic of the 1.1.59 family.
 * Every correlated rule for tab handoffs between agents mid run, resource locks keyed by one origin and one selector, conflict scans of overlapping writes, result merging with conflict rules and provenance, output comparison, the interleaved swarm timeline, verified lessons on the blackboard, the aggregate report across agents, the shared cost accounting and the replay of one agent run from the audit trail lives in this file.
 * Coordination never bypasses review: a handoff preserves the original session grants, a lock only serializes work the same review already approved and every merged report that includes page content grades as an egress event on export.
 */

/** Composes the lock key of exactly one origin and one selector; a lock never spans unrelated origins because the key names one target of one origin. */
export function lockkey(origin: string, selector: string): string {
  return `${origin}|${selector}`;
}

/** Packages one tab handoff for transfer: the transferring agent names the receiving agent, the tab and the task state in plain language; the record waits prepared until its transfer. */
export function preparehandoff(input: {
  agents: agentidentity[];
  id: string;
  fromagentid: string;
  toagentid: string;
  taskstate: string;
  tabid?: number;
  reason?: string;
  now: number;
}): handoffrecord {
  if (!input.agents.some((agent) => agent.id === input.fromagentid))
    throw new Error(`The handoff names the transferring agent ${input.fromagentid} which is not registered.`);
  if (!input.agents.some((agent) => agent.id === input.toagentid))
    throw new Error(`The handoff names the receiving agent ${input.toagentid} which is not registered.`);
  if (input.fromagentid === input.toagentid)
    throw new Error("A handoff moves a task between two different agents; an agent never hands off to itself.");
  if (input.taskstate.trim() === "")
    throw new Error(
      "The handoff needs its packaged task state in plain language; the resume continues exactly from it.",
    );
  const from = input.agents.find((agent) => agent.id === input.fromagentid)!;
  const tabid = input.tabid ?? from.tabid;
  if (tabid === undefined)
    throw new Error("The handoff needs its tab id; the transferring agent holds no tab to hand off.");
  return {
    id: input.id,
    fromagentid: input.fromagentid,
    toagentid: input.toagentid,
    tabid,
    taskstate: input.taskstate,
    state: "prepared",
    ...(input.reason !== undefined && input.reason.trim() !== "" ? { reason: input.reason } : {}),
    createdat: input.now,
  };
}

/** Moves one tab binding between agents: the prepared handoff transfers the tab from the transferring agent to the receiving agent under the one agent per tab rule, and the record marks the transfer. */
export function transferhandoff(input: {
  agents: agentidentity[];
  handoffs: handoffrecord[];
  id: string;
  now: number;
}): { agents: agentidentity[]; handoffs: handoffrecord[] } {
  const record = input.handoffs.find((entry) => entry.id === input.id);
  if (!record) throw new Error(`The handoff ${input.id} does not exist.`);
  if (record.state !== "prepared")
    throw new Error(`The handoff ${record.id} is ${record.state}; only a prepared handoff transfers.`);
  const receiver = input.agents.find((agent) => agent.id === record.toagentid);
  if (!receiver) throw new Error(`The receiving agent ${record.toagentid} is not registered.`);
  if (receiver.state === "stopped")
    throw new Error(
      `The receiving agent ${receiver.name} is stopped; the handoff waits for its resume or another receiver.`,
    );
  const holder = input.agents.find(
    (agent) => agent.tabid === record.tabid && agent.id !== record.fromagentid && agent.state !== "stopped",
  );
  if (holder) throw new Error(`Tab ${record.tabid} already holds the agent ${holder.name}; one tab binds one agent.`);
  const agents = input.agents.map((agent) => {
    if (agent.id === record.fromagentid) {
      const { tabid, ...rest } = agent;
      void tabid;
      return rest;
    }
    if (agent.id === record.toagentid && record.tabid !== undefined) return { ...agent, tabid: record.tabid };
    return agent;
  });
  return {
    agents,
    handoffs: input.handoffs.map((entry) =>
      entry.id === input.id ? { ...entry, state: "transferred" as const, transferredat: input.now } : entry,
    ),
  };
}

/** Continues one transferred task from its packaged state: the receiving agent owns the task from the recorded task state and the record marks the resume. */
export function resumehandoff(input: { handoffs: handoffrecord[]; id: string; now: number }): handoffrecord {
  const record = input.handoffs.find((entry) => entry.id === input.id);
  if (!record) throw new Error(`The handoff ${input.id} does not exist.`);
  if (record.state !== "transferred")
    throw new Error(`The handoff ${record.id} is ${record.state}; only a transferred handoff resumes.`);
  return { ...record, state: "resumed", resumedat: input.now };
}

/** Acquires one resource lock keyed by one origin and one selector: an exclusive lock refuses every second holder while a shared lock admits further shared holders only; a held key refuses the newcomer whatever the kinds. */
export function acquirelock(input: {
  locks: resourcelock[];
  holder: string;
  origin: string;
  selector: string;
  kind?: "exclusive" | "shared";
  expiresat?: number;
  now: number;
}): { locks: resourcelock[]; acquired: boolean; reason: string } {
  if (input.holder.trim() === "") throw new Error("The lock needs its holder agent id.");
  if (input.origin.trim() === "") throw new Error("The lock needs its origin; a lock never spans unrelated origins.");
  if (input.selector.trim() === "") throw new Error("The lock needs its selector of the origin.");
  const kind = input.kind ?? "exclusive";
  const key = lockkey(input.origin.trim(), input.selector.trim());
  const held = input.locks.filter((lock) => lock.key === key);
  if (held.some((lock) => lock.holder === input.holder))
    return { locks: input.locks, acquired: false, reason: `The agent ${input.holder} already holds the lock ${key}.` };
  if (held.length > 0) {
    if (held.some((lock) => lock.kind === "exclusive") || kind === "exclusive")
      return {
        locks: input.locks,
        acquired: false,
        reason: `The lock ${key} is held ${held.some((lock) => lock.kind === "exclusive") ? "exclusively" : "shared"}; the ${kind} request of ${input.holder} refuses.`,
      };
  }
  const lock: resourcelock = {
    key,
    holder: input.holder,
    kind,
    origin: input.origin.trim(),
    selector: input.selector.trim(),
    acquiredat: input.now,
    ...(input.expiresat !== undefined ? { expiresat: input.expiresat } : {}),
  };
  return {
    locks: [...input.locks, lock],
    acquired: true,
    reason: `The ${kind} lock ${key} went to the agent ${input.holder}.`,
  };
}

/** Releases one lock with the holder named: the freed key returns to the pool for the next agent. */
export function releaselock(input: { locks: resourcelock[]; key: string; holder: string; now: number }): {
  locks: resourcelock[];
  released: boolean;
} {
  const lock = input.locks.find((entry) => entry.key === input.key && entry.holder === input.holder);
  if (!lock) return { locks: input.locks, released: false };
  return {
    locks: input.locks.filter((entry) => entry.key !== input.key || entry.holder !== input.holder),
    released: true,
  };
}

/** Returns the abandoned locks to the pool: a lock past its user configured expiry releases on the sweep while a lock without an expiry never expires. */
export function expirelocks(input: { locks: resourcelock[]; now: number }): {
  locks: resourcelock[];
  expired: string[];
} {
  const stale = input.locks.filter((lock) => lock.expiresat !== undefined && input.now > lock.expiresat);
  if (stale.length === 0) return { locks: input.locks, expired: [] };
  const keys = new Set(stale.map((lock) => `${lock.key}:${lock.holder}`));
  return { locks: input.locks.filter((lock) => !keys.has(`${lock.key}:${lock.holder}`)), expired: [...keys] };
}

/** Scans the parallel writes for overlapping targets before the runs start: two writers on the same origin and selector overlap, the scan lists the overlapping targets with their writers and the suggested ordering keeps the writers deterministic by agent id. */
export function scanconflicts(input: { id: string; writers: conflictwriter[]; now: number }): conflictscan {
  const targets = new Map<string, conflictwriter[]>();
  for (const writer of input.writers) {
    const key = lockkey(writer.origin, writer.selector);
    targets.set(key, [...(targets.get(key) ?? []), writer]);
  }
  const overlaps = [...targets.entries()]
    .filter(([, writers]) => writers.length > 1)
    .map(([key, writers]) => ({
      origin: writers[0]!.origin,
      selector: writers[0]!.selector,
      writers: writers.map((writer) => writer.agentid),
    }));
  const overlappingagents = new Set(overlaps.flatMap((entry) => entry.writers));
  return {
    id: input.id,
    writers: input.writers,
    overlaps,
    suggestedorder: input.writers
      .filter((writer) => overlappingagents.has(writer.agentid))
      .map((writer) => writer.agentid)
      .filter((agentid, index, all) => all.indexOf(agentid) === index)
      .sort((one, two) => (one < two ? -1 : 1)),
    clean: overlaps.length === 0,
    scannedat: input.now,
  };
}

/** Folds the parallel results into one report with conflict rules: the entries group by key, first keeps the earliest value, last keeps the latest, preferagent keeps the value of the agent the user named and fail refuses the fold on any conflict; every merged value keeps its provenance and every conflict lands its resolution note. */
export function mergeresults(input: { entries: mergeentry[]; rule: mergerule; preferagent?: string; now: number }): {
  entries: mergeentry[];
  conflicts: string[];
  refused: boolean;
} {
  const keys = new Map<string, mergeentry[]>();
  for (const entry of input.entries) {
    keys.set(entry.key, [...(keys.get(entry.key) ?? []), entry]);
  }
  const conflicts: string[] = [];
  const merged: mergeentry[] = [];
  for (const [key, entries] of keys) {
    const ordered = [...entries].sort((one, two) => one.mergedat - two.mergedat);
    if (ordered.length === 1) {
      merged.push(ordered[0]!);
      continue;
    }
    if (input.rule === "fail") {
      conflicts.push(
        `The key ${key} carries ${ordered.length} parallel values from ${ordered.map((entry) => entry.agentid).join(", ")}; the fail rule refuses the fold.`,
      );
      continue;
    }
    const winner =
      input.rule === "first"
        ? ordered[0]!
        : input.rule === "last"
          ? ordered[ordered.length - 1]!
          : (ordered.find((entry) => entry.agentid === input.preferagent) ?? ordered[ordered.length - 1]!);
    const note =
      input.rule === "preferagent" &&
      input.preferagent !== undefined &&
      !ordered.some((entry) => entry.agentid === input.preferagent)
        ? `The preferagent rule names the agent ${input.preferagent} which wrote no value; the latest value of ${winner.agentid} stayed.`
        : `The ${input.rule} rule kept the value of ${winner.agentid} from ${ordered.map((entry) => entry.agentid).join(", ")}.`;
    conflicts.push(`The key ${key}: ${note}`);
    merged.push({ ...winner, id: `${winner.id}:merged`, conflict: note });
  }
  return { entries: merged, conflicts, refused: input.rule === "fail" && conflicts.length > 0 };
}

/** Builds the final report across agents: the outputs fold under the merge rule the user picked, the sections group by task and every section keeps the agent sources of its entries with the provenance. */
export function swarmreport(input: {
  id: string;
  title: string;
  outputs: mergeentry[];
  rule: mergerule;
  preferagent?: string;
  confidence?: string;
  now: number;
}): { report: resultreport; conflicts: string[]; refused: boolean } {
  if (input.title.trim() === "") throw new Error("The report needs its title.");
  const fold = mergeresults({
    entries: input.outputs,
    rule: input.rule,
    ...(input.preferagent !== undefined ? { preferagent: input.preferagent } : {}),
    now: input.now,
  });
  const groups = new Map<string, mergeentry[]>();
  for (const entry of fold.entries) {
    const group = entry.taskid ?? "general";
    groups.set(group, [...(groups.get(group) ?? []), entry]);
  }
  const sections = [...groups.entries()].map(([taskid, entries]) => ({
    title: `Task ${taskid}`,
    entries,
    sources: [
      ...new Set(
        input.outputs.filter((output) => (output.taskid ?? "general") === taskid).map((output) => output.agentid),
      ),
    ],
  }));
  return {
    report: {
      id: input.id,
      title: input.title.trim(),
      sections,
      sources: [...new Set(input.outputs.map((output) => output.agentid))],
      ...(input.confidence !== undefined && input.confidence.trim() !== "" ? { confidence: input.confidence } : {}),
      createdat: input.now,
    },
    conflicts: fold.conflicts,
    refused: fold.refused,
  };
}

/** Contrasts the competing agent outputs for the user: the comparison lists every output with its agent and names the keys where the agents disagree. */
export function compareoutputs(input: {
  id: string;
  subject: string;
  outputs: Array<{ agentid: string; value: string }>;
  now: number;
}): outputcomparison {
  if (input.subject.trim() === "") throw new Error("The comparison needs its subject.");
  if (input.outputs.length < 2) throw new Error("The comparison contrasts at least two competing outputs.");
  const differences = input.outputs
    .filter((output) => output.value !== input.outputs[0]?.value)
    .map(
      (output) =>
        `The agent ${output.agentid} answers ${output.value} while the agent ${input.outputs[0]!.agentid} answers ${input.outputs[0]!.value}.`,
    );
  return { id: input.id, subject: input.subject, outputs: input.outputs, differences, comparedat: input.now };
}

/** Interleaves the actions of every agent into one stream: the actions order by time and the ties keep their arrival order, so one timeline reads the whole swarm. */
export function interleavetimeline(actions: swarmaction[]): swarmaction[] {
  return [...actions].sort((one, two) => one.at - two.at || (one.id < two.id ? -1 : 1));
}

/** Writes one verified lesson to the blackboard: the lesson lands in the findings section under its own key with the agent and its verifier named, so every agent of the swarm reads it. */
export function sharelesson(input: {
  board: blackboard;
  id: string;
  agentid: string;
  statement: string;
  verifiedby: string;
  section?: blackboardsection;
  consentclass?: actionrisk;
  now: number;
}): blackboard {
  if (input.statement.trim() === "") throw new Error("The lesson needs its statement in plain language.");
  if (input.verifiedby.trim() === "")
    throw new Error("The lesson needs its verifier; only a verified lesson lands on the board.");
  return postentry({
    board: input.board,
    id: input.id,
    key: `lesson:${input.statement.trim().slice(0, 40)}`,
    value: `${input.statement.trim()} (verified by ${input.verifiedby.trim()})`,
    section: input.section ?? "findings",
    author: input.agentid.trim() === "" ? "user" : input.agentid,
    consentclass: input.consentclass ?? "read",
    now: input.now,
  });
}

/** Sums the per agent usage into the swarm totals of the shared cost accounting: tokens, cost and steps of every agent in one record. */
export function swarmcosts(input: { usage: agentusage[]; currency?: string; now: number }): swarmcost {
  return {
    agents: input.usage.length,
    tokens: input.usage.reduce((total, usage) => total + usage.tokens, 0),
    cost: input.usage.reduce((total, usage) => total + usage.cost, 0),
    steps: input.usage.reduce((total, usage) => total + usage.steps, 0),
    ...(input.currency !== undefined && input.currency.trim() !== "" ? { currency: input.currency } : {}),
    computedat: input.now,
  };
}

/** Rebuilds one agent run from the audit trail: the actions that name the agent order by time into one replay stream the panel scrolls. */
export function replayagentrun(input: {
  events: Array<{ id: string; kind: string; summary: string; at: number; agentid?: string }>;
  agentid: string;
}): swarmaction[] {
  return interleavetimeline(
    input.events
      .filter((event) => event.agentid === input.agentid)
      .map((event) => ({
        id: event.id,
        kind: event.kind,
        summary: event.summary,
        at: event.at,
        ...(event.agentid !== undefined ? { agentid: event.agentid } : {}),
      })),
  );
}
