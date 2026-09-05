/**
 * The swarm module of the 1.1.90 consolidation: every correlated variation of the swarm logic interned in this one file, so the module family carries one surface without duplicate variations.
 * The correlation is the multi agent swarm organized over one shared queue and one shared board: orchestration holds the organizing topology (leader worker election by user rule, work slicing, result collection, worker scaling inside the user bound, the planner executor split with step reporting, critic reviews, verifier checks, the progressboard aggregation, human decided escalations, arbitration of competing claims and consensus rounds with quorum); taskqueue holds the shared work every agent of the swarm claims from (lanes, priorities, claims with heartbeats, work stealing with lane ownership, completion policy and the requeue of orphaned tasks); and blackboard is the shared memory every agent reads with no relay (sections, posting with authors, freshness filtered reads, retirement by the user window and the consent class inheritance of the source extraction).
 * Orchestration never bypasses review: the leader only organizes work whose proposals still pass the same human review, the critic reads outputs without acting on the page, and every escalation lands on the user.
 */

/* ── Merged from orchestration.ts ── */

import type { agentidentity, arbitrationrule, boardlane, boardmilestone, consensusround, consensusvote, criticreview, escalationrecord, executorreport, leaderworker, plannerexecutor, progressboard, reviewrequest, reviewverdict, taskitem, taskqueue, verifiercheck, workerassignment } from "./types.js";

/**
 * Multi agent orchestration logic of the 1.1.59 family.
 * Every correlated rule for the leader worker topology (election by user rule, work slicing, result collection, worker scaling), the planner executor split with step reporting, critic reviews over agent outputs, verifier checks of result claims, the progressboard aggregation, escalations that stay human decided, arbitration of competing claims and consensus rounds with quorum lives in this file.
 * Orchestration never bypasses review: the leader only organizes work whose proposals still pass the same human review, the critic reads outputs without acting on the page and every escalation lands on the user.
 */

/** Elects the leader of the swarm and builds the leader worker topology: the user rule names the leader (first registration or one named agent), the live workers, critics and verifiers join their lanes by role, and the topology records the election. */
export function electleader(input: { agents: agentidentity[]; id: string; rule?: { kind: "first" | "named"; agentid?: string }; now: number }): leaderworker {
  const live = input.agents.filter(agent => agent.state !== "stopped");
  if (live.length === 0) throw new Error("The swarm holds no live agent; the leader election waits for the user to register one.");
  const rule = input.rule ?? { kind: "first" as const };
  let leader: agentidentity | undefined;
  if (rule.kind === "named") {
    if (rule.agentid === undefined || rule.agentid.trim() === "") throw new Error("The named election rule needs the agent id the user named.");
    leader = live.find(agent => agent.id === rule.agentid);
    if (!leader) throw new Error(`The named election rule names the agent ${rule.agentid} which is not a live agent of the swarm.`);
  } else {
    leader = live[live.length - 1];
  }
  if (!leader) throw new Error("The leader election found no live agent.");
  const leaderid = leader.id;
  const workers = live.filter(agent => agent.id !== leaderid && agent.role === "worker");
  const critics = live.filter(agent => agent.id !== leaderid && agent.role === "critic");
  const verifiers = live.filter(agent => agent.id !== leaderid && agent.role === "verifier");
  return {
    id: input.id,
    leaderid: leader.id,
    workerids: workers.map(agent => agent.id),
    criticids: critics.map(agent => agent.id),
    verifierids: verifiers.map(agent => agent.id),
    assignments: [],
    rule: { kind: rule.kind, ...(rule.agentid !== undefined ? { agentid: rule.agentid } : {}) },
    electedat: input.now
  };
}

/** Slices the tasks across the workers of the topology: the workers take turns over the queued and claimed tasks in queue order, every slice names the task payload it owns and the assignments record the worker, the task and the slice. */
export function assignwork(input: { topology: leaderworker; tasks: taskitem[]; now: number }): leaderworker {
  if (input.topology.workerids.length === 0) throw new Error("The topology holds no worker; the user adds workers before the assignment.");
  const assignments: workerassignment[] = [];
  const tasks = input.tasks.filter(task => task.state === "queued" || task.state === "claimed");
  tasks.forEach((task, index) => {
    const workerid = input.topology.workerids[index % input.topology.workerids.length]!;
    assignments.push({ workerid, taskid: task.id, slice: `${task.payload} (slice ${Math.floor(index / input.topology.workerids.length) + 1} of lane ${task.lane})`, assignedat: input.now });
  });
  return { ...input.topology, assignments };
}

/** Gathers the worker outputs with status: every assignment reports its state while the outputs the workers returned land beside their tasks, and the missing list names the assignments still without an output. */
export function collectresults(input: { topology: leaderworker; outputs: Array<{ workerid: string; taskid: string; state: string; summary: string }> }): { gathered: Array<{ workerid: string; taskid: string; state: string; summary: string }>; missing: string[] } {
  const gathered = input.topology.assignments.map(assignment => {
    const output = input.outputs.find(entry => entry.taskid === assignment.taskid && entry.workerid === assignment.workerid);
    return output ?? { workerid: assignment.workerid, taskid: assignment.taskid, state: "pending", summary: `The worker ${assignment.workerid} has not returned its slice of the task ${assignment.taskid} yet.` };
  });
  return { gathered, missing: gathered.filter(entry => entry.state === "pending").map(entry => `${entry.workerid}:${entry.taskid}`) };
}

/** Scales the worker lane by load: queued work beyond the current workers adds the live worker role agents the swarm already holds (never past the user configured bound while one exists), idle workers retire down to the work left, and no engine cap ever exists. */
export function scaleworkers(input: { topology: leaderworker; agents: agentidentity[]; pending: number; bound?: number; now: number }): { topology: leaderworker; added: string[]; retired: string[]; reason: string } {
  const live = input.agents.filter(agent => agent.state === "active" && agent.role === "worker" && agent.id !== input.topology.leaderid);
  const current = input.topology.workerids.filter(workerid => live.some(agent => agent.id === workerid));
  const ceiling = input.bound;
  if (input.pending > current.length) {
    const available = live.filter(agent => !current.includes(agent.id)).map(agent => agent.id);
    const wanted = input.pending - current.length;
    const addable = ceiling === undefined ? available.slice(0, wanted) : available.slice(0, Math.min(wanted, Math.max(ceiling - current.length, 0)));
    if (addable.length === 0) return { topology: input.topology, added: [], retired: [], reason: ceiling === undefined ? `The load of ${input.pending} pending slices exceeds the ${current.length} workers but the swarm holds no further live worker role agent to add.` : `The load of ${input.pending} pending slices exceeds the ${current.length} workers but the user configured bound of ${ceiling} workers holds.` };
    return { topology: { ...input.topology, workerids: [...current, ...addable], electedat: input.topology.electedat, assignments: input.topology.assignments }, added: addable, retired: [], reason: `The load of ${input.pending} pending slices added the workers ${addable.join(", ")}; ${ceiling === undefined ? "no bound is configured so the user scale stands alone" : `the user configured bound of ${ceiling} workers holds`}.` };
  }
  const keep = Math.max(input.pending, 0);
  if (current.length > keep) {
    const retired = current.slice(keep);
    return { topology: { ...input.topology, workerids: current.slice(0, keep), electedat: input.topology.electedat, assignments: input.topology.assignments.filter(assignment => !retired.includes(assignment.workerid)) }, added: [], retired, reason: `The load of ${input.pending} pending slices retired the idle workers ${retired.join(", ")}.` };
  }
  return { topology: input.topology, added: [], retired: [], reason: `The load of ${input.pending} pending slices matches the ${current.length} workers; the scale stays unchanged.` };
}

/** Splits one task between the planner and the executor: the plan owner agent drafts the reviewed plan while the run owner agent executes it, and the split record starts empty of step reports. */
export function plannersplit(input: { id: string; planownerid: string; runownerid: string; taskid?: string; now: number }): plannerexecutor {
  if (input.planownerid.trim() === "" || input.runownerid.trim() === "") throw new Error("The planner executor split needs its plan owner and run owner agent ids.");
  if (input.planownerid === input.runownerid) throw new Error("The planner executor split keeps plan drafting and execution in different agents; one agent holds both sides never.");
  return { id: input.id, planownerid: input.planownerid, runownerid: input.runownerid, ...(input.taskid !== undefined && input.taskid.trim() !== "" ? { taskid: input.taskid } : {}), stepreports: [], splitat: input.now };
}

/** Reports one executor step outcome back to the planner agent: the executor appends its report to the split record so the planner reads every step result. */
export function reportstep(input: { split: plannerexecutor; stepid: string; outcome: "done" | "failed"; detail: string; now: number }): plannerexecutor {
  if (input.stepid.trim() === "") throw new Error("The executor report needs its step id.");
  if (input.detail.trim() === "") throw new Error("The executor report needs its detail in plain language.");
  const report: executorreport = { stepid: input.stepid.trim(), outcome: input.outcome, detail: input.detail, reportedat: input.now };
  return { ...input.split, stepreports: [...input.split.stepreports.filter(entry => entry.stepid !== report.stepid), report] };
}

/** Routes one review request to a reviewing agent: the request names the subject and payload and stays open until its ack, its answer or its user configured timeout. */
export function requestreview(input: { requests: reviewrequest[]; id: string; fromagentid: string; toagentid: string; subject: string; payload: string; timeoutms?: number; now: number }): reviewrequest[] {
  if (input.subject.trim() === "") throw new Error("The review request needs its subject.");
  if (input.payload.trim() === "") throw new Error("The review request needs its payload.");
  if (input.toagentid.trim() === "" || input.toagentid === input.fromagentid) throw new Error("The review request names another reviewing agent, never its own requester.");
  const request: reviewrequest = { id: input.id, fromagentid: input.fromagentid, toagentid: input.toagentid, subject: input.subject, payload: input.payload, state: "open", requestedat: input.now, ...(input.timeoutms !== undefined ? { timeoutat: input.now + input.timeoutms } : {}) };
  return [request, ...input.requests];
}

/** Acks one review request: the reviewing agent confirms receipt while the answer still waits. */
export function ackreview(input: { requests: reviewrequest[]; id: string; now: number }): reviewrequest[] {
  const request = input.requests.find(entry => entry.id === input.id);
  if (!request) throw new Error(`The review request ${input.id} does not exist.`);
  if (request.state !== "open") throw new Error(`The review request ${input.id} is ${request.state}; only an open request receives its ack.`);
  return input.requests.map(entry => entry.id === input.id ? { ...entry, state: "acked" as const, ackedat: input.now } : entry);
}

/** Applies the critic verdict to one review request: the review carries the verdict, the issues and the required changes while the request closes as answered. */
export function applyreview(input: { requests: reviewrequest[]; id: string; reviewerid: string; verdict: reviewverdict; issues: string[]; requiredchanges: string[]; taskid?: string; now: number }): { review: criticreview; requests: reviewrequest[] } {
  const request = input.requests.find(entry => entry.id === input.id);
  if (!request) throw new Error(`The review request ${input.id} does not exist.`);
  if (request.state === "answered" || request.state === "timeout") throw new Error(`The review request ${input.id} is ${request.state}; an answered or timed out request never reviews again.`);
  if (request.toagentid !== input.reviewerid) throw new Error(`The review request ${input.id} routes to the agent ${request.toagentid}; the agent ${input.reviewerid} never answers in its place.`);
  if (input.verdict === "changes" && input.requiredchanges.length === 0) throw new Error("A changes verdict needs its required changes in plain language.");
  const review: criticreview = { id: request.id, reviewerid: input.reviewerid, subjectagentid: request.fromagentid, ...(input.taskid !== undefined && input.taskid.trim() !== "" ? { taskid: input.taskid } : {}), verdict: input.verdict, issues: input.issues, requiredchanges: input.requiredchanges, reviewedat: input.now };
  return { review, requests: input.requests.map(entry => entry.id === input.id ? { ...entry, state: "answered" as const, answeredat: input.now } : entry) };
}

/** Sweeps the review requests past their user configured timeout: an unanswered request without an ack or an answer times out and the requester reads the expiry. */
export function sweepreviews(input: { requests: reviewrequest[]; now: number }): { requests: reviewrequest[]; timedout: string[] } {
  const expired = input.requests.filter(request => request.state === "open" || request.state === "acked").filter(request => request.timeoutat !== undefined && input.now > request.timeoutat);
  if (expired.length === 0) return { requests: input.requests, timedout: [] };
  const ids = new Set(expired.map(request => request.id));
  return { requests: input.requests.map(request => ids.has(request.id) ? { ...request, state: "timeout" as const } : request), timedout: [...ids] };
}

/** Records one verifier check of a result claim: the verifier names the claim, the method it used and the pass or fail outcome with its evidence; the check itself never writes to the page. */
export function checkclaim(input: { id: string; verifierid: string; claimagentid: string; claim: string; method: string; outcome: "pass" | "fail"; evidence?: string; taskid?: string; now: number }): verifiercheck {
  if (input.claim.trim() === "") throw new Error("The verifier check needs its claim in plain language.");
  if (input.method.trim() === "") throw new Error("The verifier check needs the method the user configured.");
  if (input.claimagentid.trim() === "") throw new Error("The verifier check names the agent whose claim it checks.");
  return { id: input.id, verifierid: input.verifierid, claimagentid: input.claimagentid, ...(input.taskid !== undefined && input.taskid.trim() !== "" ? { taskid: input.taskid } : {}), claim: input.claim, method: input.method, outcome: input.outcome, ...(input.evidence !== undefined && input.evidence.trim() !== "" ? { evidence: input.evidence } : {}), checkedat: input.now };
}

/** Builds the progressboard that aggregates the swarm: one lane per live agent with its role, state, lane of work, current task and milestones, so the user reads every agent at once. */
export function boardstate(input: { agents: agentidentity[]; queue: taskqueue; topology?: leaderworker; milestones?: Record<string, boardmilestone[]>; now: number }): progressboard {
  const lanes: boardlane[] = input.agents
    .filter(agent => agent.state !== "stopped")
    .map(agent => {
      const assignment = input.topology?.assignments.find(entry => entry.workerid === agent.id);
      const claim = input.queue.claims.find(record => record.agentid === agent.id && input.queue.items.some(item => item.id === record.taskid && item.state === "claimed"));
      const task = claim !== undefined ? input.queue.items.find(item => item.id === claim.taskid) : undefined;
      const lane = task?.lane ?? (agent.role === "critic" || agent.role === "verifier" ? agent.role : agent.role === "planner" ? "planning" : "idle");
      return { agentid: agent.id, name: agent.name, role: agent.role, state: agent.state, lane, ...(task !== undefined ? { currenttask: task.payload } : assignment !== undefined ? { currenttask: assignment.slice } : {}), milestones: input.milestones?.[agent.id] ?? [] };
    });
  return { id: `board:${input.now}`, lanes, builtat: input.now };
}

/** Lifts one stalled agent decision to the user with its full context: the escalation stays open until the user writes the decision because escalations are always human decided. */
export function escalate(input: { id: string; agentid: string; subject: string; context: string; now: number }): escalationrecord {
  if (input.subject.trim() === "") throw new Error("The escalation needs its subject.");
  if (input.context.trim() === "") throw new Error("The escalation needs its full context in plain language; the user decides on what the agent saw.");
  if (input.agentid.trim() === "") throw new Error("The escalation names the agent whose decision it lifts.");
  return { id: input.id, agentid: input.agentid, subject: input.subject, context: input.context, state: "open", raisedat: input.now };
}

/** Resolves one escalation with the decision the user wrote; the decision time records and the record closes. */
export function resolveescalation(input: { escalation: escalationrecord; decision: string; now: number }): escalationrecord {
  if (input.escalation.state === "decided") throw new Error("The escalation already carries its user decision.");
  if (input.decision.trim() === "") throw new Error("The escalation decision needs the words the user wrote.");
  return { ...input.escalation, state: "decided", decision: input.decision, decidedat: input.now };
}

/** Orders competing resource claims by the user configured arbitration rule: the priority strategy follows the user ordered agent list, the age strategy gives the resource to the oldest claim and the leader strategy names the elected leader first. */
export function arbitrate(input: { rule: arbitrationrule; leaderid?: string; claims: Array<{ agentid: string; claimedat: number }> }): string[] {
  if (input.claims.length === 0) return [];
  if (input.rule.strategy === "priority") {
    const order = input.rule.priorityorder;
    return [...input.claims].sort((one, two) => {
      const oneindex = order.indexOf(one.agentid);
      const twoindex = order.indexOf(two.agentid);
      return (oneindex === -1 ? order.length : oneindex) - (twoindex === -1 ? order.length : twoindex) || one.claimedat - two.claimedat;
    }).map(claim => claim.agentid);
  }
  if (input.rule.strategy === "age") return [...input.claims].sort((one, two) => one.claimedat - two.claimedat || (one.agentid < two.agentid ? -1 : 1)).map(claim => claim.agentid);
  if (input.leaderid === undefined) throw new Error("The leader arbitration strategy needs the elected leader of the topology.");
  return [...input.claims].sort((one, two) => (one.agentid === input.leaderid ? -1 : 1) - (two.agentid === input.leaderid ? -1 : 1) || one.claimedat - two.claimedat).map(claim => claim.agentid);
}

/** Opens one consensus round: the subject stays plain language and the quorum stays the user configured value the round needs to carry. */
export function openconsensus(input: { id: string; subject: string; quorum: number; now: number }): consensusround {
  if (input.subject.trim() === "") throw new Error("The consensus round needs its subject in plain language.");
  if (!Number.isInteger(input.quorum) || input.quorum < 1) throw new Error("The consensus round needs its quorum as a positive whole number the user configured.");
  return { id: input.id, subject: input.subject, votes: [], quorum: input.quorum, state: "open", openedat: input.now };
}

/** Collects one verdict into a consensus round: an agent votes once, the round stays open until the votes carry or the round closes, and the quorum counts yes votes only. */
export function castvote(input: { round: consensusround; agentid: string; vote: consensusvote; now: number }): consensusround {
  if (input.agentid.trim() === "") throw new Error("The consensus vote names its agent; a blank agent id never votes.");
  if (input.round.state !== "open") throw new Error(`The consensus round ${input.round.id} is ${input.round.state}; a closed round collects no vote.`);
  if (input.round.votes.some(entry => entry.agentid === input.agentid)) throw new Error(`The agent ${input.agentid} already voted in the round ${input.round.id}.`);
  const votes = [...input.round.votes, { agentid: input.agentid, vote: input.vote, votedat: input.now }];
  const yes = votes.filter(entry => entry.vote === "yes").length;
  const no = votes.filter(entry => entry.vote === "no").length;
  if (yes >= input.round.quorum) return { ...input.round, votes, state: "carried", closedat: input.now };
  if (no >= input.round.quorum) return { ...input.round, votes, state: "failed", closedat: input.now };
  return { ...input.round, votes };
}

/** Reads the state of one consensus round: the yes, no and abstain counts beside the quorum so the panel shows the votes and the quorum state at once. */
export function consensusstate(round: consensusround): { yes: number; no: number; abstain: number; quorum: number; state: string } {
  return {
    yes: round.votes.filter(entry => entry.vote === "yes").length,
    no: round.votes.filter(entry => entry.vote === "no").length,
    abstain: round.votes.filter(entry => entry.vote === "abstain").length,
    quorum: round.quorum,
    state: round.state
  };
}

/* ── Merged from taskqueue.ts ── */

import type { claimrecord } from "./types.js";

/**
 * Shared task queue logic of the 1.1.58 multi agent family.
 * Every correlated rule for lanes, priorities, claims, work stealing with lane ownership, completion, heartbeats and the requeue of orphaned tasks lives in this file.
 * The queue never executes anything: a claimed task only names the work whose proposal still passes the same human review every single agent proposal passes.
 */

/** One lane ownership rule the user configures: the lane name and the roles allowed to steal from it; a lane without a rule stays open to every agent of the approved swarm. */
export interface laneownership {
  lane: string;
  roles: string[];
}

/** Builds one empty queue with the user configured lanes, priority scale and completion policy; the empty set of lanes accepts any lane name the user enqueues. */
export function emptyqueue(input: { lanes?: string[]; priorities?: number[]; completionpolicy?: "all" | "any" } = {}): taskqueue {
  return { lanes: input.lanes ?? [], priorities: input.priorities ?? [], completionpolicy: input.completionpolicy ?? "all", items: [], claims: [] };
}

/** Enqueues one task item into a lane with its priority; a configured lane list refuses unknown lanes and the payload stays the plain language text the user typed. */
export function enqueue(input: { queue: taskqueue; id: string; lane: string; priority: number; payload: string; now: number }): taskqueue {
  if (input.lane.trim() === "") throw new Error("The task needs its lane name.");
  if (input.payload.trim() === "") throw new Error("The task needs its payload in plain language.");
  if (input.queue.lanes.length > 0 && !input.queue.lanes.includes(input.lane)) throw new Error(`The lane ${input.lane} is not one of the configured lanes.`);
  if (input.queue.items.some(item => item.id === input.id)) throw new Error(`The task id ${input.id} already waits in the queue.`);
  const item: taskitem = { id: input.id, lane: input.lane, priority: input.priority, payload: input.payload, state: "queued", enqueuedat: input.now };
  return { ...input.queue, items: [...input.queue.items, item] };
}

/** Sorts the queued items of one lane: the highest priority first and the oldest task wins a tie. */
function orderedcandidates(queue: taskqueue, lane?: string): taskitem[] {
  return queue.items
    .filter(item => item.state === "queued" && (lane === undefined || item.lane === lane))
    .sort((one, two) => two.priority - one.priority || one.enqueuedat - two.enqueuedat);
}

/** Lets one agent claim the highest priority queued task; the claim carries the heartbeat time that keeps it alive and an agent holds one task at a time. */
export function claim(input: { queue: taskqueue; agentid: string; now: number }): { queue: taskqueue; task?: taskitem } {
  const held = input.queue.claims.find(record => record.agentid === input.agentid);
  if (held) {
    const task = input.queue.items.find(item => item.id === held.taskid);
    if (task && task.state === "claimed") return { queue: input.queue, task };
  }
  const candidate = orderedcandidates(input.queue)[0];
  if (!candidate) return { queue: input.queue };
  const record: claimrecord = { agentid: input.agentid, taskid: candidate.id, claimedat: input.now, heartbeatat: input.now };
  return {
    queue: { ...input.queue, items: input.queue.items.map(item => item.id === candidate.id ? { ...item, state: "claimed" as const } : item), claims: [...input.queue.claims.filter(entry => entry.agentid !== input.agentid || input.queue.items.find(item => item.id === entry.taskid)?.state !== "claimed"), record] },
    task: { ...candidate, state: "claimed" }
  };
}

/** Lets one idle agent steal a queued task from a named lane; the lane ownership rules the user configures refuse agents whose role holds no grant for the lane. */
export function steal(input: { queue: taskqueue; agentid: string; role: string; fromlane: string; ownership?: laneownership[]; now: number }): { queue: taskqueue; task?: taskitem } {
  const rule = (input.ownership ?? []).find(entry => entry.lane === input.fromlane);
  if (rule && !rule.roles.includes(input.role)) throw new Error(`The lane ${input.fromlane} only lets the roles ${rule.roles.join(", ")} steal its tasks; the ${input.role} agent stays out.`);
  const candidate = orderedcandidates(input.queue, input.fromlane)[0];
  if (!candidate) return { queue: input.queue };
  const record: claimrecord = { agentid: input.agentid, taskid: candidate.id, claimedat: input.now, heartbeatat: input.now };
  return {
    queue: { ...input.queue, items: input.queue.items.map(item => item.id === candidate.id ? { ...item, state: "claimed" as const } : item), claims: [...input.queue.claims.filter(entry => entry.agentid !== input.agentid), record] },
    task: { ...candidate, state: "claimed" }
  };
}

/** Marks one task done and releases the claim of the agent that held it. */
export function complete(input: { queue: taskqueue; taskid: string; now: number }): taskqueue {
  const task = input.queue.items.find(item => item.id === input.taskid);
  if (!task) throw new Error(`The task ${input.taskid} is not in the queue.`);
  if (task.state !== "claimed") throw new Error(`The task ${input.taskid} is ${task.state}; only a claimed task completes.`);
  return { ...input.queue, items: input.queue.items.map(item => item.id === input.taskid ? { ...item, state: "done" as const } : item), claims: input.queue.claims.filter(record => record.taskid !== input.taskid) };
}

/** Cancels one queued or claimed task; the cancelled task releases its claim and leaves the queue. */
export function canceltask(input: { queue: taskqueue; taskid: string; now: number }): taskqueue {
  const task = input.queue.items.find(item => item.id === input.taskid);
  if (!task) throw new Error(`The task ${input.taskid} is not in the queue.`);
  if (task.state === "done") throw new Error(`The task ${input.taskid} is done; a completed task never cancels.`);
  return { ...input.queue, items: input.queue.items.map(item => item.id === input.taskid ? { ...item, state: "cancelled" as const } : item), claims: input.queue.claims.filter(record => record.taskid !== input.taskid) };
}

/** Refreshes the heartbeats of every live claim of one agent so a working agent keeps its tasks. */
export function claimheartbeat(input: { queue: taskqueue; agentid: string; now: number }): taskqueue {
  return { ...input.queue, claims: input.queue.claims.map(record => record.agentid === input.agentid ? { ...record, heartbeatat: input.now } : record) };
}

/** Returns the orphaned tasks to their lane: a claim whose heartbeat stayed silent past the user configured expiry window releases and the task waits as queued again; an absent window never expires a claim. */
export function requeue(input: { queue: taskqueue; now: number; window?: number }): { queue: taskqueue; requeued: string[] } {
  if (input.window === undefined) return { queue: input.queue, requeued: [] };
  const window = input.window;
  const expired = input.queue.claims.filter(record => input.now - record.heartbeatat > window);
  if (expired.length === 0) return { queue: input.queue, requeued: [] };
  const expiredids = new Set(expired.map(record => record.taskid));
  return {
    queue: {
      ...input.queue,
      items: input.queue.items.map(item => expiredids.has(item.id) && item.state === "claimed" ? { ...item, state: "queued" as const } : item),
      claims: input.queue.claims.filter(record => !expiredids.has(record.taskid))
    },
    requeued: [...expiredids]
  };
}

/** Reports every lane with its queued, claimed, done and cancelled task counts and the live claims, so the queue view reads the lanes at a glance. */
export function lanereport(queue: taskqueue): Array<{ lane: string; queued: number; claimed: number; done: number; cancelled: number; claims: Array<{ agentid: string; taskid: string; heartbeatat: number }> }> {
  const lanes = [...queue.lanes, ...queue.items.map(item => item.lane)].filter((lane, index, all) => all.indexOf(lane) === index);
  return lanes.map(lane => ({
    lane,
    queued: queue.items.filter(item => item.lane === lane && item.state === "queued").length,
    claimed: queue.items.filter(item => item.lane === lane && item.state === "claimed").length,
    done: queue.items.filter(item => item.lane === lane && item.state === "done").length,
    cancelled: queue.items.filter(item => item.lane === lane && item.state === "cancelled").length,
    claims: queue.claims.filter(record => queue.items.some(item => item.id === record.taskid && item.lane === lane && item.state === "claimed")).map(record => ({ agentid: record.agentid, taskid: record.taskid, heartbeatat: record.heartbeatat }))
  }));
}

/** Evaluates the completion policy of the queue: all completes only when every task is done while any completes with the first done task. */
export function queuecomplete(queue: taskqueue): boolean {
  const open = queue.items.filter(item => item.state !== "cancelled");
  if (open.length === 0) return false;
  return queue.completionpolicy === "any" ? open.some(item => item.state === "done") : open.every(item => item.state === "done");
}

/** Counts the tasks by claim state for the popup gauge: the claimed tasks are the active work of the swarm. */
export function taskcounts(queue: taskqueue): { queued: number; claimed: number; done: number; cancelled: number } {
  return {
    queued: queue.items.filter(item => item.state === "queued").length,
    claimed: queue.items.filter(item => item.state === "claimed").length,
    done: queue.items.filter(item => item.state === "done").length,
    cancelled: queue.items.filter(item => item.state === "cancelled").length
  };
}

/* ── Merged from blackboard.ts ── */

import type { actionrisk, blackboard, blackboardentry, blackboardsection } from "./types.js";

/**
 * Blackboard shared memory logic of the 1.1.58 multi agent family.
 * Every correlated rule for the shared sections, posting with authors, reading with freshness filters, retirement by the user configured window and the consent class inheritance of the source extraction lives in this file.
 * Every agent of the swarm reads the same board: the writes of one agent are visible to every other agent with no relay.
 */

/** The blackboard sections the swarm shares by default; the user may narrow the list to the sections in use. */
export const blackboardsections: blackboardsection[] = ["goals", "facts", "findings", "scratch"];

/** Builds one empty blackboard over the four shared sections with no retirement window; an absent window keeps every entry. */
export function emptyboard(sections?: blackboardsection[]): blackboard {
  return { sections: sections ?? blackboardsections, entries: [] };
}

/** Writes one entry to a section with its author: the key and value stay the plain text the author typed, the section joins the board when it is new and the entry carries the consent class of its source extraction. */
export function postentry(input: { board: blackboard; id: string; key: string; value: string; section: blackboardsection; author: string; valuekind?: "text" | "json"; consentclass?: actionrisk; now: number }): blackboard {
  if (input.key.trim() === "") throw new Error("The blackboard entry needs its key.");
  if (input.value.trim() === "") throw new Error("The blackboard entry needs its value.");
  if (input.author.trim() === "") throw new Error("The blackboard entry needs its author.");
  if (!blackboardsections.includes(input.section)) throw new Error(`The section ${input.section} is not one of the shared blackboard sections.`);
  if (input.board.entries.some(entry => entry.id === input.id)) throw new Error(`The blackboard entry id ${input.id} already exists.`);
  if (input.valuekind === "json") {
    try { JSON.parse(input.value); } catch { throw new Error("The json blackboard entry needs a well-formed json value."); }
  }
  const entry: blackboardentry = { id: input.id, key: input.key.trim(), valuekind: input.valuekind ?? "text", value: input.value, author: input.author, section: input.section, consentclass: input.consentclass ?? "read", postedat: input.now };
  return { ...input.board, sections: input.board.sections.includes(input.section) ? input.board.sections : [...input.board.sections, input.section], entries: [entry, ...input.board.entries] };
}

/** True when one entry stayed fresh inside the window; an absent window keeps every entry fresh. */
export function entryfresh(entry: blackboardentry, now: number, window?: number): boolean {
  if (entry.retiredat !== undefined) return false;
  if (window === undefined) return true;
  return now - entry.postedat <= window;
}

/** Returns the entries of one section with freshness filters: retired entries stay out and an optional window keeps only the fresh ones; an absent section returns every live entry. */
export function readentries(input: { board: blackboard; section?: blackboardsection; freshness?: number; now: number }): blackboardentry[] {
  return input.board.entries
    .filter(entry => entry.retiredat === undefined)
    .filter(entry => input.section === undefined || entry.section === input.section)
    .filter(entry => entryfresh(entry, input.now, input.freshness))
    .sort((one, two) => two.postedat - one.postedat);
}

/** Retires the stale entries by the user configured policy: entries older than the retirement window of the board receive their retirement time while an absent window retires nothing. */
export function retireentries(input: { board: blackboard; now: number }): { board: blackboard; retired: string[] } {
  if (input.board.retirementwindow === undefined) return { board: input.board, retired: [] };
  const stale = input.board.entries.filter(entry => entry.retiredat === undefined && input.now - entry.postedat > input.board.retirementwindow!);
  if (stale.length === 0) return { board: input.board, retired: [] };
  const staleids = new Set(stale.map(entry => entry.id));
  return {
    board: { ...input.board, entries: input.board.entries.map(entry => staleids.has(entry.id) ? { ...entry, retiredat: input.now } : entry) },
    retired: [...staleids]
  };
}

/** Retires one entry by its id; the retired entry stays stored for the audit trail while the live reads stop showing it. */
export function retireentry(input: { board: blackboard; entryid: string; now: number }): blackboard {
  const entry = input.board.entries.find(candidate => candidate.id === input.entryid);
  if (!entry) throw new Error(`The blackboard entry ${input.entryid} does not exist.`);
  if (entry.retiredat !== undefined) throw new Error(`The blackboard entry ${entry.key} is already retired.`);
  return { ...input.board, entries: input.board.entries.map(candidate => candidate.id === input.entryid ? { ...candidate, retiredat: input.now } : candidate) };
}

/** Inherits the consent class of the source extraction into one entry: the reader of the entry sees the class of the extraction it came from, so a sensitive extraction stays sensitive on the board. */
export function inheritconsent(entry: blackboardentry, sourcerisk: actionrisk): blackboardentry {
  return { ...entry, consentclass: sourcerisk };
}

/** Summarizes the board for the panel: every section with its live entry count, its authors and the freshest posting time. */
export function boardsummary(board: blackboard, now: number): Array<{ section: blackboardsection; entries: number; authors: string[]; freshestat?: number }> {
  return board.sections.map(section => {
    const live = board.entries.filter(entry => entry.section === section && entry.retiredat === undefined);
    return { section, entries: live.length, authors: [...new Set(live.map(entry => entry.author))], ...(live.length > 0 ? { freshestat: Math.max(...live.map(entry => entry.postedat)) } : {}) };
  });
}
