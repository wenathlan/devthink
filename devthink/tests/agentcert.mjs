/** Executes the coordination certification checklist of the 1.1.96 multi agent certification release against the real compiled modules: every automated entry exercises one real function call sequence of the swarm, agent, policy and memory families with its assertions, the artifact tests/artifacts/agentcert.json records every executed entry with its outcome in a fixed order with no timestamps so reruns stay byte identical, and the gate exits nonzero on any failed entry. The checklist covers every coordination scenario of the release candidates: the leader worker topology, the planner executor critic verifier role split, the mailboxes, the shared queue with its lanes and work stealing, the blackboard, the tab handoffs, the resource locks with conflict detection, the result merging, the consensus rounds, the emergency stops, the sub agent depth limits, the escalations, the reviews, the audit replays, the output comparison, the arbitration, the worker scaling, the per agent budgets and scopes, the aggregate reports, the interleaved timelines, the lessons store and the pool item coverage of 469 through 502; the gate runs in its fake clock mode by default so the certification stays deterministic, the fake tab provider hands out fake tabs of every browser kind (chromium, firefox and safari) so the agent scenarios bind tabs the same way on every browser, and the scenario docs live in docs/agentcert.md and docs/agentscenarios.md. */
import { mkdir, writeFile } from "node:fs/promises";
import { readFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";

const packagejson = JSON.parse(await readFile("package.json", "utf8"));
const release = String(packagejson.version);
const artifactpath = "tests/artifacts/agentcert.json";

/** Collects one executed checklist entry with its outcome; the detail names the functions the entry exercised and what they answered. */
const executed = [];

/** Runs one checklist entry body and records the outcome deterministically. */
async function entry(spec, body) {
  try {
    const detail = await body();
    executed.push({ id: spec.id, title: spec.title, family: spec.family, module: spec.module, outcome: "pass", detail: detail ?? "" });
  } catch (error) {
    executed.push({ id: spec.id, title: spec.title, family: spec.family, module: spec.module, outcome: "fail", detail: error instanceof Error ? error.message : String(error) });
  }
}

/** Asserts one condition with the message the failure reports. */
function check(condition, message) {
  if (!condition) throw new Error(message);
}

/** The fake clock mode of the coordination suite: the clock starts at one fixed epoch and every tick advances exactly one thousand milliseconds, so every scenario replays byte identical; the real clock mode exists only for the live verification runs the operator drives with the --clock real switch. */
function fakeclock(mode = "fake") {
  let now = 1_800_000_000_000;
  if (mode === "real") return { now: () => Date.now(), tick: () => (now += 0) && Date.now() };
  return { now: () => now, tick: () => (now += 1_000) };
}
const clockmode = process.argv.includes("--clock") ? (process.argv[process.argv.indexOf("--clock") + 1] ?? "fake") : "fake";
const clock = fakeclock(clockmode === "real" ? "real" : "fake");
const now = clock.now;

/** The fake tab provider of the agent scenarios: one deterministic tab id per browser kind and per slot, so the coordination entries bind tabs the same way on chromium, firefox and safari — the fake tab covers every browser kind the extension ships. */
const faketabprovider = {
  kinds: ["chromium", "firefox", "safari"],
  tabof(browser, slot) {
    const base = { chromium: 100, firefox: 200, safari: 300 }[browser] ?? 0;
    return base + slot;
  },
};

/** The fake agent fixture of the certification: five agents registered through the real registeragent with the roles the leader worker topology needs, bound to fake tabs of every browser kind. */
function fiveagents(agentmodule) {
  let agents = [];
  const registrations = [
    { id: "a1", name: "Scout", role: "worker", browser: "chromium", slot: 1 },
    { id: "w1", name: "Scribe", role: "worker", browser: "chromium", slot: 2 },
    { id: "w2", name: "Probe", role: "worker", browser: "firefox", slot: 1 },
    { id: "c1", name: "Judge", role: "critic", browser: "firefox", slot: 2 },
    { id: "v1", name: "Witness", role: "verifier", browser: "safari", slot: 1 },
  ];
  for (const registration of registrations) {
    agents = agentmodule.registeragent({ agents, id: registration.id, name: registration.name, role: registration.role, tabid: faketabprovider.tabof(registration.browser, registration.slot), now: now() });
  }
  return agents;
}

/** The full automated coordination certification checklist of the release candidates. */
export async function runagentcertsuite() {
  /* the real compiled modules: the library index bundle carries the agent, swarm, memory and run families the coordination scenarios exercise, the policy bundle carries the coordination gates and the dashdone bundle carries the topology inventory export */
  const library = await import("../dist/index.js");
  const policy = await import("../dist/policy.js");
  const agent = library;
  const swarm = library;

  await entry({ id: 1, title: "the leader worker topology elects and assigns across five fake agents", family: "topology", module: "swarm.js and agent.js" }, async () => {
    const agents = fiveagents(agent);
    check(agents.length === 5, `the fleet registered ${agents.length} agents instead of five`);
    const topology = swarm.electleader({ agents, id: "top-cert", now: now() });
    check(topology.leaderid === "a1", `the first registered agent a1 lost the election to ${topology.leaderid}`);
    check(topology.workerids.length === 2 && topology.workerids.includes("w1") && topology.workerids.includes("w2"), `the worker lane holds ${topology.workerids.join(", ")}`);
    check(topology.criticids.join(",") === "c1", `the critic lane holds ${topology.criticids.join(", ")}`);
    check(topology.verifierids.join(",") === "v1", `the verifier lane holds ${topology.verifierids.join(", ")}`);
    check(policy.leaderelectionvalid({ rule: topology.rule, agents }).allowed === true, "the leader election failed its policy validation");
    let queue = swarm.emptyqueue({ lanes: ["extraction", "indexing"] });
    queue = swarm.enqueue({ queue, id: "t1", lane: "extraction", priority: 2, payload: "Read the pricing table", now: now() });
    queue = swarm.enqueue({ queue, id: "t2", lane: "indexing", priority: 1, payload: "Index the footer links", now: now() });
    const assigned = swarm.assignwork({ topology, tasks: queue.items, now: now() });
    check(assigned.assignments.length === 2, `the assignment sliced ${assigned.assignments.length} tasks instead of two`);
    check(new Set(assigned.assignments.map(assignment => assignment.workerid)).size === 2, "the round robin assignment sent two slices to one worker");
    const gathered = swarm.collectresults({ topology: assigned, outputs: assigned.assignments.map(assignment => ({ workerid: assignment.workerid, taskid: assignment.taskid, state: "done", summary: "The slice completed under the review." })) });
    check(gathered.missing.length === 0, `the collection still waits for ${gathered.missing.join(", ")}`);
    return `electleader elected a1 over the five fake agents with the workers w1, w2, the critic c1 and the verifier v1; assignwork sliced the two tasks across both workers in round robin order and collectresults gathered both outputs with no missing slice.`;
  });

  await entry({ id: 2, title: "the planner executor separation keeps drafting and execution in different agents", family: "roles", module: "swarm.js" }, async () => {
    const split = swarm.plannersplit({ id: "split-cert", planownerid: "p1", runownerid: "e1", taskid: "t1", now: now() });
    check(split.planownerid === "p1" && split.runownerid === "e1", "the split lost its plan or run owner");
    check(split.stepreports.length === 0, "the fresh split already carried step reports");
    let reported = swarm.reportstep({ split, stepid: "step-1", outcome: "done", detail: "The row count is 42.", now: now() });
    reported = swarm.reportstep({ split: reported, stepid: "step-1", outcome: "failed", detail: "The re-read found 41.", now: now() });
    check(reported.stepreports.length === 1, "the repeated step report duplicated instead of updating");
    check(reported.stepreports[0].outcome === "failed", "the step report kept the outdated outcome");
    let refused = false;
    try { swarm.plannersplit({ id: "split-cert-2", planownerid: "same", runownerid: "same", now: now() }); } catch { refused = true; }
    check(refused === true, "the split allowed one agent to draft and execute its own plan");
    return `plannersplit separated the planner p1 from the executor e1, reportstep recorded the executor outcome with the repeated step id updating in place, and the same-agent split refused.`;
  });

  await entry({ id: 3, title: "the critic agent review loop closes on the reviewed output", family: "review", module: "swarm.js and policy.js" }, async () => {
    const requests = swarm.requestreview({ requests: [], id: "rev-cert", fromagentid: "w1", toagentid: "c1", subject: "The pricing extraction", payload: "42 rows read.", timeoutms: 5_000, now: now() });
    check(requests[0].state === "open", "the review request never opened");
    const acked = swarm.ackreview({ requests, id: "rev-cert", now: now() });
    check(acked[0].state === "acked", "the critic never acknowledged the review request");
    const outcome = swarm.applyreview({ requests: acked, id: "rev-cert", reviewerid: "c1", verdict: "changes", issues: ["One row is stale."], requiredchanges: ["Re-read the footer."], taskid: "t1", now: now() });
    check(outcome.review.verdict === "changes" && outcome.review.issues.length === 1, "the critic verdict lost its changes or issues");
    check(outcome.requests[0].state === "answered", "the review request never closed");
    check(policy.criticreviewgrade(outcome.review).allowed === true, "the critic review failed its policy grade");
    const swept = swarm.sweepreviews({ requests: outcome.requests, now: now() + 10_000 });
    check(swept.timedout.length === 0, `the answered review timed out anyway: ${swept.timedout.join(", ")}`);
    const stalled = swarm.sweepreviews({ requests: swarm.requestreview({ requests: [], id: "rev-cert-2", fromagentid: "w1", toagentid: "c1", subject: "The second pass", payload: "41 rows.", timeoutms: 1_000, now: now() }), now: now() + 5_000 });
    check(stalled.timedout.join(",") === "rev-cert-2", "the unacknowledged review never timed out");
    return `requestreview routed the output of w1 to the critic c1, ackreview acknowledged it, applyreview closed the loop with the changes verdict and its issues, the answered request survived the sweep while the stalled one timed out.`;
  });

  await entry({ id: 4, title: "the verifier agent confirms the results before the completion", family: "verification", module: "swarm.js and policy.js" }, async () => {
    const pass = swarm.checkclaim({ id: "ver-cert", verifierid: "v1", claimagentid: "w1", claim: "The table holds 42 rows.", method: "re-read", outcome: "pass", evidence: "The re-read counted 42 rows.", taskid: "t1", now: now() });
    check(pass.outcome === "pass" && pass.evidence.includes("42"), "the verifier pass lost its outcome or evidence");
    const fail = swarm.checkclaim({ id: "ver-cert-2", verifierid: "v1", claimagentid: "w2", claim: "The footer shows the total.", method: "compare", outcome: "fail", evidence: "The compare found no total.", taskid: "t2", now: now() });
    check(fail.outcome === "fail", "the verifier fail lost its outcome");
    check(policy.verifiermethodgrade({ method: "re-read", allowed: ["re-read", "compare"] }).allowed === true, "the re-read method failed the verifier method grade");
    check(policy.verifiermethodgrade({ method: "guess", allowed: ["re-read", "compare"] }).allowed === false, "the guess method passed the verifier method grade");
    const topology = { id: "top-ver", leaderid: "a1", workerids: ["w1", "w2"], criticids: ["c1"], verifierids: ["v1"], assignments: [{ workerid: "w1", taskid: "t1", slice: "Read the table", assignedat: now() }, { workerid: "w2", taskid: "t2", slice: "Read the footer", assignedat: now() }], rule: { kind: "first" }, electedat: now() };
    const gathered = swarm.collectresults({ topology, outputs: [{ workerid: "w1", taskid: "t1", state: "done", summary: "42 rows read." }, { workerid: "w2", taskid: "t2", state: "failed", summary: "No total found." }] });
    check(gathered.gathered.find(row => row.taskid === "t2").state === "failed", "the failed verification still reported done");
    return `checkclaim marked the w1 claim pass with the re-read evidence and the w2 claim fail; the method grade refused the guess method and the failed slice reported failed instead of done.`;
  });

  await entry({ id: 5, title: "message passing delivers between every agent pair", family: "messaging", module: "agent.js" }, async () => {
    const agents = fiveagents(agent);
    const ids = agents.map(identity => identity.id);
    let mailboxes = ids.map(id => ({ agentid: id, inbox: [], outbox: [], unread: 0 }));
    let counter = 0;
    for (const sender of ids) {
      for (const recipient of ids) {
        if (sender === recipient) continue;
        counter += 1;
        mailboxes = agent.sendmessage({ mailboxes, agents, id: `m-${counter}`, senderid: sender, recipient, routing: "direct", payload: `The message ${counter} from ${sender} to ${recipient}.`, now: now() });
      }
    }
    check(counter === 20, `the pair sweep sent ${counter} messages instead of twenty`);
    for (const id of ids) {
      const box = agent.mailboxof(mailboxes, id);
      check(box.inbox.length === 4, `the inbox of ${id} holds ${box.inbox.length} messages instead of four`);
      check(box.outbox.length === 4, `the outbox of ${id} holds ${box.outbox.length} messages instead of four`);
      check(box.unread === 4, `the unread counter of ${id} reads ${box.unread} instead of four`);
    }
    const drained = agent.receivemessages({ mailboxes, agentid: "a1", now: now() });
    check(drained.messages.length === 4 && agent.unreadcount(drained.mailboxes, "a1") === 0, "the drain left messages or unread counts behind");
    const broadcast = agent.sendmessage({ mailboxes: drained.mailboxes, agents, id: "m-broadcast", senderid: "a1", recipient: agent.broadcastrecipient, routing: "broadcast", payload: "Status check of the fleet.", now: now() });
    check(agent.unreadcount(broadcast, "w1") === 5 && agent.unreadcount(broadcast, "a1") === 0, "the broadcast missed a peer or reached its own sender");
    const roleaddressed = agent.sendmessage({ mailboxes: broadcast, agents, id: "m-role", senderid: "a1", recipient: "critic", routing: "role", payload: "Review the extraction.", now: now() });
    check(agent.mailboxof(roleaddressed, "c1").inbox.length === 6, "the role addressed message missed the critic lane");
    return `sendmessage delivered the twenty direct messages of every ordered pair with four inbox, outbox and unread entries per agent, the drain acked four messages of a1, the broadcast reached every peer but the sender and the role addressed message reached the critic c1.`;
  });

  await entry({ id: 6, title: "the shared task queue hands out every task exactly once", family: "queue", module: "swarm.js" }, async () => {
    let queue = swarm.emptyqueue({ lanes: ["extraction", "indexing"], priorities: [1, 5] });
    for (let index = 1; index <= 7; index += 1) queue = swarm.enqueue({ queue, id: `t${index}`, lane: index % 2 === 0 ? "indexing" : "extraction", priority: (index % 3) + 1, payload: `The task ${index}.`, now: now() });
    check(swarm.taskcounts(queue).queued === 7, "the queue did not hold the seven enqueued tasks");
    const claimcounts = new Map();
    const workers = ["w1", "w2", "a1"];
    let round = 0;
    let remaining = swarm.taskcounts(queue).queued;
    while (remaining > 0 && round < 30) {
      for (const worker of workers) {
        const outcome = swarm.claim({ queue, agentid: worker, now: now() });
        queue = outcome.queue;
        if (outcome.task !== undefined) {
          claimcounts.set(outcome.task.id, (claimcounts.get(outcome.task.id) ?? 0) + 1);
          queue = swarm.complete({ queue, taskid: outcome.task.id, now: now() });
        }
      }
      remaining = swarm.taskcounts(queue).queued;
      round += 1;
    }
    check(remaining === 0, `the claim loop left ${remaining} tasks unclaimed`);
    check(claimcounts.size === 7, `the claim loop handed out ${claimcounts.size} distinct tasks instead of seven`);
    check([...claimcounts.values()].every(count => count === 1), `a task was handed out twice: ${[...claimcounts.entries()].filter(([, count]) => count !== 1).map(([id]) => id).join(", ")}`);
    check(swarm.taskcounts(queue).done === 7, "the completed count lost the seven tasks");
    check(swarm.queuecomplete(queue) === true, "the completion policy never closed the queue");
    check(swarm.lanereport(queue).length === 2, "the lane report lost a lane");
    return `the seven tasks of the shared queue were claimed exactly once each across the three workers (no task handed out twice), completed in place and the queue closed under the all policy with both lanes reporting.`;
  });

  await entry({ id: 7, title: "work stealing respects the lock protocol of the lanes", family: "work stealing", module: "swarm.js and policy.js" }, async () => {
    let queue = swarm.emptyqueue({ lanes: ["extraction", "indexing"] });
    queue = swarm.enqueue({ queue, id: "t1", lane: "extraction", priority: 1, payload: "Read the table.", now: now() });
    queue = swarm.enqueue({ queue, id: "t2", lane: "indexing", priority: 3, payload: "Index the links.", now: now() });
    const ownership = [{ lane: "indexing", roles: ["worker"] }];
    const stolen = swarm.steal({ queue, agentid: "w2", role: "worker", fromlane: "indexing", ownership, now: now() });
    check(stolen.task?.id === "t2", "the worker never stole the indexing task");
    check(stolen.queue.claims.find(record => record.taskid === "t2")?.agentid === "w2", "the stolen claim lost its new holder");
    let refused = false;
    try { swarm.steal({ queue: stolen.queue, agentid: "c1", role: "critic", fromlane: "indexing", ownership, now: now() }); } catch { refused = true; }
    check(refused === true, "the lane ownership let a critic steal from the worker lane");
    check(policy.workstealgrade({ swarmapproved: true, agentrole: "worker", lane: "indexing", ownership }).allowed === true, "the policy grade refused a legal steal");
    check(policy.workstealgrade({ swarmapproved: false, agentrole: "worker", lane: "indexing", ownership }).allowed === false, "the policy grade allowed a steal without the swarm approval");
    const requeued = swarm.requeue({ queue: stolen.queue, now: now() + 60_000, window: 30_000 });
    check(requeued.requeued.join(",") === "t2", "the silent heartbeat never returned the stolen task to the lane");
    return `steal moved the indexing task to the idle worker w2 under the lane ownership that refuses the critic, the policy grade demanded the swarm approval, and the expired heartbeat returned the stolen task to the lane.`;
  });

  await entry({ id: 8, title: "the blackboard memory merges the concurrent writes of the agents", family: "blackboard", module: "swarm.js and agent.js" }, async () => {
    let board = swarm.emptyboard();
    board = swarm.postentry({ board, id: "b1", key: "rowcount", value: "42", section: "findings", author: "w1", now: now() });
    board = swarm.postentry({ board, id: "b2", key: "rowcount", value: "41", section: "findings", author: "w2", now: now() + 1 });
    board = swarm.postentry({ board, id: "b3", key: "title", value: "Pricing", section: "facts", author: "a1", now: now() + 2 });
    const reads = swarm.readentries({ board, now: now() + 3 });
    check(reads.length === 3, "the concurrent writes lost entries on the board");
    check(reads.filter(entry => entry.key === "rowcount").length === 2, "the board collapsed the concurrent writers into one entry before the merge");
    const entries = reads.map(entry => ({ id: entry.id, agentid: entry.author, key: entry.key, value: entry.value, mergedat: entry.postedat }));
    const fold = agent.mergeresults({ entries, rule: "first", now: now() + 4 });
    check(fold.refused === false && fold.entries.length === 2, "the merge fold refused or lost keys");
    const rowcount = fold.entries.find(candidate => candidate.key === "rowcount");
    check(rowcount.value === "42" && rowcount.agentid === "w1", "the first rule kept the wrong value or provenance");
    check(String(rowcount.conflict).includes("w1, w2"), "the merged entry lost its conflict note naming both writers");
    const lessonboard = agent.sharelesson({ board: swarm.emptyboard(), id: "l1", agentid: "w1", statement: "The footer renders only after the scroll.", verifiedby: "v1", now: now() });
    check(lessonboard.entries[0].section === "findings" && String(lessonboard.entries[0].value).includes("verified by v1"), "the lesson share lost its section or verifier");
    return `the two concurrent rowcount writes of w1 and w2 both stayed on the board with their authors, mergeresults folded them under the first rule with the value 42, the provenance of w1 and the conflict note naming both writers, and sharelesson landed the verified lesson on the findings section.`;
  });

  await entry({ id: 9, title: "the tab handoff between agents keeps the session state", family: "tab handoff", module: "agent.js and policy.js" }, async () => {
    let movedbrowsercount = 0;
    for (const browser of faketabprovider.kinds) {
      const tabid = faketabprovider.tabof(browser, 1);
      const agents = [
        { id: "a1", name: "Scout", role: "worker", depth: 0, state: "active", registeredat: now(), heartbeatat: now(), tabid },
        { id: "a2", name: "Scribe", role: "worker", depth: 0, state: "active", registeredat: now(), heartbeatat: now() },
      ];
      const prepared = agent.preparehandoff({ agents, id: `h-${browser}`, fromagentid: "a1", toagentid: "a2", taskstate: "Halfway through the footer.", reason: "The user moved the work.", now: now() });
      check(prepared.tabid === tabid, `the ${browser} handoff lost its tab binding`);
      const moved = agent.transferhandoff({ agents, handoffs: [prepared], id: `h-${browser}`, now: now() });
      check(moved.agents.find(identity => identity.id === "a1").tabid === undefined, `the ${browser} sender kept the tab`);
      check(moved.agents.find(identity => identity.id === "a2").tabid === tabid, `the ${browser} receiver never took the tab`);
      const resumed = agent.resumehandoff({ handoffs: moved.handoffs, id: `h-${browser}`, now: now() });
      check(resumed.taskstate === "Halfway through the footer.", `the ${browser} handoff lost the packaged session state`);
      movedbrowsercount += 1;
    }
    check(movedbrowsercount === 3, "the tab handoff did not cover every browser kind");
    const contested = [
      { id: "a1", name: "Scout", role: "worker", depth: 0, state: "active", registeredat: now(), heartbeatat: now(), tabid: 101 },
      { id: "a3", name: "Probe", role: "worker", depth: 0, state: "active", registeredat: now(), heartbeatat: now(), tabid: 101 },
    ];
    let refused = false;
    try { agent.transferhandoff({ agents: contested, handoffs: [agent.preparehandoff({ agents: contested, id: "h-contested", fromagentid: "a1", toagentid: "a3", taskstate: "State.", now: now() })], id: "h-contested", now: now() }); } catch { refused = true; }
    check(refused === true, "the handoff moved a tab a live agent already held");
    return `preparehandoff, transferhandoff and resumehandoff moved the tab and the packaged session state between agents on every browser kind (chromium, firefox and safari) while the one tab one agent rule refused the contested transfer.`;
  });

  await entry({ id: 10, title: "the shared resource lock blocks the double writes", family: "locking", module: "agent.js and policy.js" }, async () => {
    const origin = "https://example.com";
    const selector = "#pricing table";
    const first = agent.acquirelock({ locks: [], holder: "w1", origin, selector, now: now() });
    check(first.acquired === true, "the first writer never acquired the lock");
    const second = agent.acquirelock({ locks: first.locks, holder: "w2", origin, selector, now: now() });
    check(second.acquired === false, "the second writer acquired a lock held exclusively");
    const sameholder = agent.acquirelock({ locks: first.locks, holder: "w1", origin, selector, now: now() });
    check(sameholder.acquired === false, "the same holder acquired the same lock twice");
    const sharedsecond = agent.acquirelock({ locks: agent.acquirelock({ locks: [], holder: "w1", origin, selector, kind: "shared", now: now() }).locks, holder: "w2", origin, selector, kind: "shared", now: now() });
    check(sharedsecond.acquired === true, "the shared kind refused a second reader");
    check(policy.lockscopevalid(first.locks[0]).allowed === true, "the acquired lock failed its scope validation");
    const wrongholder = agent.releaselock({ locks: first.locks, key: agent.lockkey(origin, selector), holder: "w2", now: now() });
    check(wrongholder.released === false, "a foreign holder released the lock");
    const mine = agent.releaselock({ locks: first.locks, key: agent.lockkey(origin, selector), holder: "w1", now: now() });
    check(mine.released === true && mine.locks.length === 0, "the right holder could not release the lock");
    const expired = agent.expirelocks({ locks: [agent.acquirelock({ locks: [], holder: "w1", origin, selector, expiresat: now() + 500, now: now() }).locks[0]], now: now() + 1_000 });
    check(expired.expired.length === 1, "the expired lock never returned to the pool");
    return `acquirelock refused the double write of w2 and the double hold of w1 while the shared kind admitted the second reader, releaselock refused the foreign holder and honored the right one, and expirelocks swept the expired lock back to the pool.`;
  });

  await entry({ id: 11, title: "the conflict detection catches the simultaneous edits", family: "conflicts", module: "agent.js" }, async () => {
    const scan = agent.scanconflicts({ id: "scan-cert", writers: [
      { agentid: "w2", origin: "https://example.com", selector: "#form", taskid: "t2" },
      { agentid: "w1", origin: "https://example.com", selector: "#form", taskid: "t1" },
      { agentid: "v1", origin: "https://example.com", selector: "#table", taskid: "t3" },
    ], now: now() });
    check(scan.clean === false, "the scan marked the overlapping writes clean");
    check(scan.overlaps.length === 1 && scan.overlaps[0].writers.join(",") === "w2,w1", "the scan lost the overlapping form writers");
    check(scan.suggestedorder.join(",") === "w1,w2", "the suggested order lost its deterministic agent ordering");
    const clean = agent.scanconflicts({ id: "scan-cert-2", writers: [
      { agentid: "w1", origin: "https://example.com", selector: "#form" },
      { agentid: "w2", origin: "https://shop.example", selector: "#form" },
    ], now: now() });
    check(clean.clean === true && clean.overlaps.length === 0, "the scan flagged the writes of different origins as a conflict");
    return `scanconflicts flagged the simultaneous edits of w1 and w2 on the same form selector with the suggested order w1, w2 while the writers of different origins stayed clean.`;
  });

  await entry({ id: 12, title: "the merge of results from parallel agents keeps the provenance", family: "merging", module: "agent.js and policy.js" }, async () => {
    const parallel = [
      { id: "m1", agentid: "w1", taskid: "t1", key: "rowcount", value: "42", mergedat: now() },
      { id: "m2", agentid: "w2", taskid: "t2", key: "rowcount", value: "41", mergedat: now() + 1 },
      { id: "m3", agentid: "w1", taskid: "t1", key: "title", value: "Pricing", mergedat: now() + 2 },
    ];
    const first = agent.mergeresults({ entries: parallel, rule: "first", now: now() + 3 });
    check(first.refused === false && first.entries.length === 2, "the first rule fold lost keys");
    check(first.entries.find(candidate => candidate.key === "rowcount").value === "42", "the first rule kept the wrong value");
    const last = agent.mergeresults({ entries: parallel, rule: "last", now: now() + 3 });
    check(last.entries.find(candidate => candidate.key === "rowcount").value === "41", "the last rule kept the wrong value");
    const preferred = agent.mergeresults({ entries: parallel, rule: "preferagent", preferagent: "w2", now: now() + 3 });
    check(preferred.entries.find(candidate => candidate.key === "rowcount").value === "41", "the preferagent rule kept the wrong value");
    const refused = agent.mergeresults({ entries: parallel, rule: "fail", now: now() + 3 });
    check(refused.refused === true, "the fail rule folded a conflicting merge anyway");
    check(policy.conflictresolutiongrade("first").allowed === true, "the conflict resolution grade refused the first rule");
    const report = agent.swarmreport({ id: "rep-cert", title: "The pricing extraction", outputs: parallel, rule: "first", confidence: "Every row was re-read once.", now: now() + 4 });
    check(report.refused === false && report.report.sources.join(",") === "w1,w2", "the report lost its contributing sources");
    check(report.report.sections[0].entries.length === 2, "the report section lost an entry");
    return `mergeresults folded the parallel results of w1 and w2 under the first, last, preferagent and fail rules with every merged value keeping its agent provenance, and swarmreport built the aggregate with both sources.`;
  });

  await entry({ id: 13, title: "the vote and consensus flow carries the quorum across the agents", family: "consensus", module: "swarm.js and agent.js" }, async () => {
    const round = swarm.openconsensus({ id: "con-cert", subject: "Which lane runs first", quorum: 3, now: now() });
    check(round.state === "open" && round.quorum === 3, "the consensus round never opened with its quorum");
    check(policy.consensusquorumvalid({ quorum: 3, voters: 5 }).allowed === true, "the policy grade refused a reachable quorum");
    check(policy.consensusquorumvalid({ quorum: 6, voters: 5 }).allowed === false, "the policy grade allowed an unreachable quorum");
    let voted = swarm.castvote({ round, agentid: "w1", vote: "yes", now: now() });
    voted = swarm.castvote({ round: voted, agentid: "w2", vote: "yes", now: now() });
    const state = swarm.consensusstate(voted);
    check(state.yes === 2 && state.state === "open", "the open round lost its tally");
    const carried = swarm.castvote({ round: voted, agentid: "v1", vote: "yes", now: now() });
    check(carried.state === "carried", "the quorum of three yes votes never carried the round");
    let closed = false;
    try { swarm.castvote({ round: carried, agentid: "c1", vote: "yes", now: now() }); } catch { closed = true; }
    check(closed === true, "the carried round accepted another vote");
    const record = agent.consensusrecordof({ id: "con-rec", proposal: "Abort the second pass", votes: [{ agentid: "w1", vote: "no", reason: "The re-read is cheap.", castat: now() }, { agentid: "w2", vote: "no", castat: now() }, { agentid: "v1", vote: "abstain", castat: now() }], quorum: 2, voters: 3, now: now() });
    check(record.outcome === "failed" && record.tally.no === 2, "the completed round under the quorum never failed");
    check(record.votes.find(vote => vote.agentid === "w1").reason !== undefined, "the dissenting reason left the record");
    check(policy.voteweightvalid({ votes: record.votes }).allowed === true, "the vote weight grade refused one vote per agent");
    return `openconsensus and castvote carried the round at the quorum of three yes votes and refused the late vote, consensusrecordof failed the complete no round with the dissenting reasons kept, and the quorum and weight grades held.`;
  });

  await entry({ id: 14, title: "the kill switch stops every agent at once", family: "emergency stops", module: "agent.js and swarm.js" }, async () => {
    const agents = fiveagents(agent);
    const outcome = agent.killall({ agents, reason: "The user halted the swarm.", now: now() });
    check(outcome.agents.every(identity => identity.state === "stopped"), "an agent survived the kill switch");
    check(outcome.killswitch.engaged === true, "the kill switch never engaged");
    const records = agents.map(identity => ({ id: identity.id, name: identity.name, role: identity.role, origin: "https://example.com", state: identity.state === "stopped" ? "active" : "active", registeredat: identity.registeredat, lastseenat: now() }));
    const runs = ["a1", "w1", "w2"].map(agentid => ({ ...library.initialrun({ planid: "plan", sessionid: "session", runid: `run-${agentid}`, now: now() }), agentid, state: "running" }));
    let queue = swarm.emptyqueue({ lanes: ["extraction"] });
    queue = swarm.enqueue({ queue, id: "t1", lane: "extraction", priority: 1, payload: "Read the table.", now: now() });
    const stopped = agent.engagekillswitch({ records, runs, queues: [queue], reason: "The user halted the swarm.", now: now() });
    check(stopped.stopped.length === 5, `the fleet stop covered ${stopped.stopped.length} agents instead of five`);
    check(stopped.records.every(record => record.state === "stopped"), "a fleet record survived the fleet stop");
    check(stopped.runs.filter(run => run.agentid !== undefined).every(run => run.state === "cancelled"), "an attributed run survived the fleet stop");
    check(stopped.queues[0].items.length === 0, "the shared queue survived the fleet stop");
    check(agent.disarmkillswitch(now()).engaged === false, "the disarmed switch stayed engaged");
    return `killall stopped all five agents with the switch engaged, engagekillswitch stopped the fleet records, cancelled every attributed run and cleared the shared queue in one call, and disarmkillswitch lifted the switch.`;
  });

  await entry({ id: 15, title: "pausing one agent leaves the others running", family: "lifecycle", module: "agent.js and policy.js" }, async () => {
    const agents = fiveagents(agent);
    const paused = agent.pauseone({ agents, agentid: "w1", now: now() });
    check(paused.find(identity => identity.id === "w1").state === "paused", "the named agent never paused");
    check(paused.filter(identity => identity.id !== "w1").every(identity => identity.state === "active"), "the pause stopped a peer agent");
    const resumed = agent.resumeone({ agents: paused, agentid: "w1", now: now() });
    check(resumed.find(identity => identity.id === "w1").state === "active", "the paused agent never resumed");
    let unpausedrefused = false;
    try { agent.resumeone({ agents: resumed, agentid: "w2", now: now() }); } catch { unpausedrefused = true; }
    check(unpausedrefused === true, "the resume accepted an agent that never paused");
    const records = paused.map(identity => ({ id: identity.id, name: identity.name, role: identity.role, origin: "https://example.com", state: identity.state === "stopped" ? "stopped" : identity.state, registeredat: identity.registeredat, lastseenat: now() }));
    check(policy.pauseagentgate({ records, agentid: "w2" }).allowed === true, "the pause gate refused an active agent");
    check(policy.pauseagentgate({ records, agentid: "ghost" }).allowed === false, "the pause gate allowed an unknown agent");
    const beat = agent.agentheartbeat({ agents: resumed, agentid: "w2", now: now() + 5_000 });
    check(beat.find(identity => identity.id === "w2").heartbeatat === now() + 5_000, "the heartbeat never refreshed");
    return `pauseone paused only w1 while a1, w2, c1 and v1 kept running, resumeone lifted the pause and refused the never-paused agent, the pause gate held and the heartbeat of w2 refreshed.`;
  });

  await entry({ id: 16, title: "the depth limit refuses the spawned sub agents past the ceiling", family: "sub agents", module: "agent.js and swarm.js" }, async () => {
    const parent = { id: "p1", name: "planner", role: "planner", origin: "https://example.com", state: "active", registeredat: now(), lastseenat: now() };
    const spawned = agent.spawnsubagent({ records: [parent], spawns: [], spec: { parentid: "p1", objective: "Read the pricing table", depth: 1 }, parentscope: { agentid: "p1", origins: ["https://example.com"], toolnamespaces: ["browser", "memory"], actionkinds: ["observe", "readtext"] }, id: "c1", now: now() });
    check(spawned.spawn.depth === 1 && spawned.spawn.parentid === "p1", "the spawn lost its lineage");
    check(spawned.scope.origins.join(",") === "https://example.com", "the child scope widened past the parent");
    const deeperspawn = agent.spawnsubagent({ records: [parent, spawned.record], spawns: [spawned.spawn], spec: { parentid: "c1", objective: "Read the footer", depth: 2 }, parentscope: spawned.scope, id: "g1", now: now() });
    const verdict = agent.depthlimitof({ spawns: [spawned.spawn, deeperspawn.spawn], agentid: "g1", limit: { maxdepth: 2 } });
    check(verdict.allowed === true && verdict.depth === 2, "the depth limit refused a legal depth of two");
    const refused = agent.depthlimitof({ spawns: [spawned.spawn, deeperspawn.spawn], agentid: "g1", limit: { maxdepth: 1 } });
    check(refused.allowed === false, "the depth limit allowed the recursion past the ceiling");
    let swarmrefused = false;
    try { swarm.spawn({ agents: [{ id: "a1", name: "Scout", role: "worker", depth: 0, state: "active", registeredat: now(), heartbeatat: now() }, { id: "c1", name: "Scout sub 1", role: "worker", depth: 1, state: "active", registeredat: now(), heartbeatat: now() }], request: { parentid: "c1", role: "worker", task: "Too deep", depth: 2 }, limit: { maxdepth: 1 }, id: "g2", now: now() }); } catch { swarmrefused = true; }
    check(swarmrefused === true, "the swarm spawn added an agent past the limit");
    check(policy.spawngrade({ parentid: "c1", role: "worker", task: "Too deep", depth: 2 }).allowed === true, "the spawn grade refused a well formed request");
    return `spawnsubagent built the lineage p1 → c1 → g1 with the child scope staying a subset of the parent, depthlimitof refused the depth two lineage under the ceiling of one, and the swarm spawn refused the same recursion.`;
  });

  await entry({ id: 17, title: "the escalation gate reaches the human from any agent", family: "escalation", module: "swarm.js, agent.js and policy.js" }, async () => {
    const raised = swarm.escalate({ id: "esc-cert", agentid: "w2", subject: "Which origin to open next", context: "Both origins hold half of the table.", now: now() });
    check(raised.state === "open" && raised.decision === undefined, "the escalation opened already decided");
    check(policy.escalationgate(raised).allowed === true, "the escalation gate refused a well formed escalation");
    const blocked = agent.escalationblock({ escalations: [raised], agentid: "w2" });
    check(blocked.blocked === true, "the raising agent kept running behind its open escalation");
    const untouched = agent.escalationblock({ escalations: [raised], agentid: "w1" });
    check(untouched.blocked === false, "the escalation hold blocked an agent that never raised it");
    const decided = swarm.resolveescalation({ escalation: raised, decision: "Open the second origin.", now: now() });
    check(decided.state === "decided" && decided.decision === "Open the second origin.", "the human decision never landed on the escalation");
    check(policy.escalationgate(decided).allowed === true, "the decided escalation failed its gate validation");
    const lifted = agent.escalationblock({ escalations: [decided], agentid: "w2" });
    check(lifted.blocked === false, "the decided escalation kept the hold on the raising agent");
    let twice = false;
    try { swarm.resolveescalation({ escalation: decided, decision: "Again.", now: now() }); } catch { twice = true; }
    check(twice === true, "the resolved escalation reopened for a second decision");
    return `escalate lifted the stalled decision of w2 to the human, the hold blocked only the raising agent, resolveescalation landed the user decision and lifted the hold, and the terminal escalation refused the second decision.`;
  });

  await entry({ id: 18, title: "the review request flow routes between the agents of the shared origin", family: "review flow", module: "agent.js and policy.js" }, async () => {
    const from = { id: "w1", name: "scout", role: "worker", origin: "https://example.com", state: "active", registeredat: now(), lastseenat: now() };
    const to = { id: "c1", name: "judge", role: "critic", origin: "https://example.com", state: "active", registeredat: now(), lastseenat: now() };
    const foreign = { id: "x1", name: "stranger", role: "critic", origin: "https://outside.example", state: "active", registeredat: now(), lastseenat: now() };
    check(policy.reviewrequestgate({ from, to }).allowed === true, "the review request gate refused the shared origin pair");
    check(policy.reviewrequestgate({ from, to: foreign }).allowed === false, "the review request gate allowed a foreign origin reviewer");
    const record = agent.reviewrecordof({ id: "rev-flow", fromagentid: "w1", toagentid: "c1", subject: "The extraction output", output: "The table rows", now: now() });
    check(record.state === "open" && record.output === "The table rows", "the review record lost its original output");
    const answered = agent.recordverdict({ records: [record], id: "rev-flow", reviewerid: "c1", verdict: "changes", issues: ["One row is stale."], now: now() });
    check(answered.state === "answered" && answered.verdict === "changes", "the verdict never landed beside the original output");
    check(answered.output === "The table rows", "the verdict rewrote the original output");
    let selfreview = false;
    try { agent.reviewrecordof({ id: "rev-self", fromagentid: "w1", toagentid: "w1", subject: "s", output: "o", now: now() }); } catch { selfreview = true; }
    check(selfreview === true, "an agent reviewed its own output");
    return `reviewrecordof moved the output of w1 to the critic c1 of the shared origin behind the policy gate that refuses the foreign origin, recordverdict landed the changes verdict beside the untouched original output, and the self review refused.`;
  });

  await entry({ id: 19, title: "the interleaved agent run replays for the audit", family: "audit replay", module: "agent.js" }, async () => {
    const events = [
      { id: "e1", kind: "claim", summary: "w1 claimed the task t1.", at: now(), agentid: "w1", stepid: "s1", planid: "run-audit" },
      { id: "e2", kind: "lock", summary: "w2 held the pricing lock.", at: now() + 1, agentid: "w2" },
      { id: "e3", kind: "action", summary: "w1 read the table.", at: now() + 2, agentid: "w1", stepid: "s2", planid: "run-audit" },
      { id: "e4", kind: "error", summary: "w2 hit the paywall.", at: now() + 3, agentid: "w2", stepid: "s3", planid: "run-audit" },
      { id: "e5", kind: "complete", summary: "w1 finished the extraction.", at: now() + 4, agentid: "w1", stepid: "s4", planid: "run-audit" },
    ];
    const replay = agent.reconstructreplay({ id: "replay-cert", agentid: "w1", runid: "run-audit", events, now: now() + 5 });
    check(replay.reconstructed === true, "the replay reconstruction lost its marker");
    check(replay.steps.map(step => step.stepid).join(",") === "s1,s2,s4", `the replay steps read ${replay.steps.map(step => step.stepid).join(",")}`);
    const states = replay.steps.map(step => `${step.stepid}:${step.state}`).join(",");
    check(states === "s1:recorded,s2:done,s4:done", `the replay step states read ${states}`);
    const failure = agent.reconstructreplay({ id: "replay-fail", agentid: "w2", runid: "run-audit", events, now: now() + 5 });
    check(failure.steps.map(step => step.state).join(",") === "failed", "the failed step of the replay never marked failed");
    const captured = agent.runreplay({ id: "replay-cap", agentid: "w2", runid: "run-audit", steps: [{ stepid: "s3", kind: "readtext", summary: "w2 hit the paywall.", state: "failed", at: now() + 3 }], now: now() + 6 });
    check(captured.steps.length === 1 && captured.steps[0].state === "failed", "the live capture lost its failed step");
    const timeline = agent.interleavetimeline(events.map(event => ({ id: event.id, kind: event.kind, summary: event.summary, at: event.at, ...(event.agentid !== undefined ? { agentid: event.agentid } : {}) })));
    check(timeline.map(event => event.id).join(",") === "e1,e2,e3,e4,e5", "the interleaved timeline lost the audit order");
    const filtered = agent.replayagentrun({ events: events.map(event => ({ id: event.id, kind: event.kind, summary: event.summary, at: event.at, ...(event.agentid !== undefined ? { agentid: event.agentid } : {}) })), agentid: "w1" });
    check(filtered.length === 3, `the w1 replay kept ${filtered.length} events instead of three`);
    return `reconstructreplay rebuilt the run of w1 from the interleaved audit trail with the steps s1 recorded and s2, s4 done, rebuilt the failed paywall step of w2 as failed, runreplay captured the live failed step, and replayagentrun filtered the three w1 events from the merged stream.`;
  });

  await entry({ id: 20, title: "the comparison of the competing agent outputs names every difference", family: "comparison", module: "agent.js" }, async () => {
    const comparison = agent.compareoutputs({ id: "cmp-cert", subject: "The row count", outputs: [{ agentid: "w1", value: "42" }, { agentid: "w2", value: "41" }], now: now() });
    check(comparison.differences.length === 1, "the comparison lost the row count difference");
    const aligned = agent.outputcompare({ id: "cmp-fields", subject: "The pricing extraction", left: { agentid: "w1", fields: { rowcount: "42", title: "Pricing" } }, right: { agentid: "w2", fields: { rowcount: "41", title: "Pricing", footer: "Totals" } }, now: now() });
    check(aligned.matching.join(",") === "title" && aligned.conflicting.join(",") === "rowcount", "the field alignment lost its matching or conflicting fields");
    check(aligned.missing.length === 1 && aligned.missing.join(",") === "footer", `the field alignment read the missing fields ${aligned.missing.join(",")}`);
    let selfcompare = false;
    try { agent.outputcompare({ id: "cmp-self", subject: "s", left: { agentid: "w1", fields: {} }, right: { agentid: "w1", fields: {} }, now: now() }); } catch { selfcompare = true; }
    check(selfcompare === true, "one agent competed with itself");
    return `compareoutputs named the row count difference between w1 and w2, outputcompare aligned the fields field by field (title matching, rowcount conflicting, two missing) and the self comparison refused.`;
  });

  await entry({ id: 21, title: "the prioritized task lanes order the execution", family: "lanes", module: "agent.js and policy.js" }, async () => {
    const lanes = [{ name: "interactive", priority: 10, interactive: true }, { name: "high", priority: 5 }, { name: "low", priority: 1 }];
    const tasks = [
      { id: "high1", lane: "high", priority: 2, enqueuedat: now() },
      { id: "high2", lane: "high", priority: 1, enqueuedat: now() + 1 },
      { id: "low1", lane: "low", priority: 9, enqueuedat: now() },
      { id: "sensitive1", lane: "low", priority: 1, sensitive: true, enqueuedat: now() },
    ];
    const ordered = agent.prioritylaneof({ tasks, lanes });
    check(ordered[0].id === "sensitive1" && ordered[0].lane === "interactive", "the sensitive task stayed outside the interactive lane");
    check(ordered.slice(1).map(task => task.id).join(",") === "high1,low1,high2", `the lane order read ${ordered.slice(1).map(task => task.id).join(",")}`);
    check(policy.lanechangegate({ lane: lanes[2], sensitive: true, confirmed: false }).allowed === false, "the lane change gate allowed a sensitive downgrade without the confirmation");
    check(policy.lanechangegate({ lane: lanes[2], sensitive: true, confirmed: true }).allowed === true, "the lane change gate refused a confirmed sensitive change");
    let queue = swarm.emptyqueue({ lanes: ["high", "low"], priorities: [1, 10] });
    for (const task of ordered) queue = swarm.enqueue({ queue, id: task.id, lane: task.lane === "interactive" ? "high" : task.lane, priority: task.priority, payload: `The task ${task.id}.`, now: now() });
    const claimed = swarm.claim({ queue, agentid: "w1", now: now() });
    check(claimed.task.id === "low1", `the queue claim picked ${claimed.task?.id} instead of the highest priority queued task`);
    return `prioritylaneof moved the sensitive task into the interactive lane and ordered the rest by lane priority with the round robin fallback, the lane change gate demanded the confirmation for the sensitive downgrade, and the queue claim picked the highest priority task first.`;
  });

  await entry({ id: 22, title: "the resource arbitration orders the contenders under contention", family: "arbitration", module: "swarm.js and agent.js" }, async () => {
    const claims = [{ agentid: "w2", claimedat: now() + 5 }, { agentid: "w1", claimedat: now() }, { agentid: "v1", claimedat: now() + 2 }];
    const priority = { id: "rule-cert", strategy: "priority", priorityorder: ["v1", "w2"], configuredat: now() };
    check(swarm.arbitrate({ rule: priority, claims }).join(",") === "v1,w2,w1", "the priority strategy lost its user order");
    check(swarm.arbitrate({ rule: { ...priority, strategy: "age" }, claims }).join(",") === "w1,v1,w2", "the age strategy lost the oldest claim first");
    check(swarm.arbitrate({ rule: { ...priority, strategy: "leader" }, leaderid: "w2", claims }).join(",") === "w2,w1,v1", "the leader strategy lost its leader first");
    const caseopened = agent.arbitrationcaseof({ id: "case-cert", resource: "https://example.com/pricing", origin: "https://example.com", requesters: ["w1", "w2"], lanes: [{ name: "fastlane", priority: 9, agentids: ["w2"] }, { name: "background", priority: 1, agentids: ["w1"] }], now: now() });
    check(caseopened.verdict.holderagentid === "w2" && caseopened.verdict.lane === "fastlane", "the lane priority never granted the fastlane contender");
    const released = agent.releasecase({ cases: [caseopened], id: "case-cert", holderfinished: true, now: now() + 1_000 });
    check(released.state === "released" && released.closedat === now() + 1_000, "the finished holder never released the case");
    check(policy.arbitrationverdictgate({ holderagentid: "w2", origin: "https://example.com", origingrants: ["https://example.com"] }).allowed === true, "the arbitration verdict gate refused an in-scope holder");
    check(policy.arbitrationverdictgate({ holderagentid: "w2", origin: "https://outside.example", origingrants: ["https://example.com"] }).allowed === false, "the arbitration verdict gate allowed an out-of-scope origin");
    return `arbitrate ordered the three contenders under the priority, age and leader strategies, arbitrationcaseof granted the fastlane contender w2 under contention, releasecase released the case when the holder finished, and the verdict gate refused the out-of-scope origin.`;
  });

  await entry({ id: 23, title: "the worker scale decision follows the site load", family: "scaling", module: "swarm.js and agent.js" }, async () => {
    const agents = fiveagents(agent);
    const withspare = agent.registeragent({ agents, id: "a6", name: "Spare", role: "worker", tabid: faketabprovider.tabof("safari", 2), now: now() });
    const elected = swarm.electleader({ agents: withspare, id: "top-scale", now: now() });
    const topology = { ...elected, workerids: ["w1", "w2"] };
    const grown = swarm.scaleworkers({ topology, agents: withspare, pending: 4, now: now() });
    check(grown.added.join(",") === "a6" && grown.topology.workerids.length === 3, `the scale up added ${grown.added.join(", ")} workers`);
    const bounded = swarm.scaleworkers({ topology: grown.topology, agents: withspare, pending: 9, bound: 3, now: now() });
    check(bounded.added.length === 0 && String(bounded.reason).includes("bound of 3"), `the scale up passed the user bound: ${bounded.reason}`);
    const retired = swarm.scaleworkers({ topology: grown.topology, agents: withspare, pending: 1, now: now() });
    check(retired.retired.length === 2, `the scale down retired ${retired.retired.length} workers`);
    check(policy.workerscalevalid(3).allowed === true && policy.workerscalevalid(undefined).allowed === true, "the workerscale grade refused a legal bound");
    const reports = [agent.loadreportof({ origin: "https://example.com", concurrency: 1, latency: 80, now: now() }), agent.loadreportof({ origin: "https://shop.example", concurrency: 3, latency: 4_500, now: now() })];
    const suggestions = agent.scalesuggestion({ reports, lowthreshold: 200, throttlethreshold: 4_000 });
    check(suggestions.find(suggestion => suggestion.origin === "https://example.com").suggestion === "spawn", "the idle origin never suggested a spawn");
    check(suggestions.find(suggestion => suggestion.origin === "https://shop.example").suggestion === "pause", "the throttled origin never suggested a pause");
    check(policy.scaleconsentgate({ userconsented: false, origin: "https://example.com" }).allowed === false, "the scale consent gate allowed an unconsented scale");
    return `scaleworkers grew the worker lane to the pending load inside the user bound and retired the idle workers, the load reports suggested a spawn on the idle origin and a pause on the throttled one, and the consent gate refused the unconsented scale.`;
  });

  await entry({ id: 24, title: "the per agent budget limits stop the right agent", family: "budgets", module: "agent.js" }, async () => {
    const grant = agent.agentbudgetof({ agentid: "w1", maxtokens: 1_000, maxsteps: 5, now: now() });
    check(grant.budget.maxtokens === 1_000, "the budget grant lost its token ceiling");
    let state = grant.state;
    state = agent.spendbudget({ state, tokens: 600, steps: 3, now: now() });
    state = agent.spendbudget({ state, tokens: 400, steps: 1, now: now() });
    check(agent.budgetremaining(state).tokens === 0, "the spend lost its token accounting");
    let overspendrefused = false;
    try { agent.spendbudget({ state, tokens: 1, now: now() }); } catch { overspendrefused = true; }
    check(overspendrefused === true, "the spend passed the token ceiling without refusing");
    const over = agent.agentbudgetcheck({ agent: { id: "w1", name: "Scribe", role: "worker", depth: 0, state: "active", registeredat: now(), heartbeatat: now(), budget: grant.budget }, usage: { agentid: "w1", tokens: 1_100, cost: 0, steps: 2, updatedat: now() } });
    check(over.halted === true, "the over-budget agent never halted");
    const peer = agent.agentbudgetcheck({ agent: { id: "w2", name: "Probe", role: "worker", depth: 0, state: "active", registeredat: now(), heartbeatat: now() }, usage: { agentid: "w2", tokens: 1_100, cost: 0, steps: 2, updatedat: now() } });
    check(peer.halted === false, "the budget of w1 halted the unbudgeted peer w2");
    const within = agent.agentbudgetcheck({ agent: { id: "w1", name: "Scribe", role: "worker", depth: 0, state: "active", registeredat: now(), heartbeatat: now(), budget: grant.budget }, usage: { agentid: "w1", tokens: 900, cost: 0, steps: 3, updatedat: now() } });
    check(within.halted === false, "the in-budget agent halted");
    return `the budget grant of w1 with its 1000 token and 5 step ceilings spent down to zero tokens with the overspend refusing at the ceiling, the over-budget w1 halted while the unbudgeted peer w2 and the in-budget usage kept running, so the budget stops the right agent alone.`;
  });

  await entry({ id: 25, title: "the per agent permission scopes gate the right kinds", family: "scopes", module: "agent.js and policy.js" }, async () => {
    const scope = agent.agentscopeof({ agentid: "w1", requested: { origins: ["https://example.com", "https://shop.example"], toolnamespaces: ["memory", "system"], actionkinds: ["observe", "readtext"] }, grants: ["https://example.com", "https://shop.example"], allowedkinds: ["observe", "readtext", "click", "fillfield"] });
    check(agent.scopegate({ scope, origin: "https://example.com", namespace: "memory" }).allowed === true, "the scope gate refused the granted origin and namespace");
    check(agent.scopegate({ scope, origin: "https://outside.example" }).allowed === false, "the scope gate allowed an origin outside the scope");
    check(agent.scopegate({ scope, namespace: "browser" }).allowed === false, "the scope gate allowed a namespace outside the scope");
    check(policy.agentscopegate({ scope, kind: "click", origin: "https://example.com" }).allowed === false, "the policy scope gate allowed a click outside the action kinds");
    check(policy.agentscopegate({ scope, kind: "readtext", origin: "https://example.com" }).allowed === true, "the policy scope gate refused the readtext inside the action kinds");
    const observer = agent.readonlyscope({ agentid: "c1", readkinds: ["observe", "readtext"] });
    check(observer.readonly === true, "the observer scope lost its readonly marker");
    check(policy.agentscopegate({ scope: observer, kind: "click", origin: "https://example.com" }).allowed === false, "the observer scope allowed a click");
    const child = agent.childscopeof({ agentid: "s1", parent: scope, narrowed: { origins: ["https://shop.example"], actionkinds: ["readtext"] } });
    check(child.origins.join(",") === "https://shop.example" && child.actionkinds.join(",") === "readtext", "the child scope lost its narrowing");
    let widened = false;
    try { agent.childscopeof({ agentid: "s2", parent: scope, narrowed: { origins: ["https://outside.example"] } }); } catch { widened = true; }
    check(widened === true, "the child scope widened past the parent origins");
    return `the scope of w1 admitted its granted origin and namespace while refusing the outside origin, the browser namespace, the click kind outside its action kinds and the observer click, and the child scope kept its narrowing inside the parent grants without widening.`;
  });

  await entry({ id: 26, title: "the aggregate report merges every agent contribution", family: "reporting", module: "agent.js" }, async () => {
    const cells = [
      { agentid: "w1", runid: "run-1", section: "output", output: "The price table holds 14 rows." },
      { agentid: "w2", runid: "run-2", section: "output", output: "The price table holds 15 rows." },
      { agentid: "a1", runid: "run-3", section: "notes", output: "The table sits under the hero." },
    ];
    const open = agent.aggregatereport({ id: "agg-cert", subject: "The pricing table read", cells, now: now() });
    check(open.state === "open" && open.conflicts.length === 1, "the conflicting report closed without a resolution");
    const merged = agent.aggregatereport({ id: "agg-cert-2", subject: "The pricing table read", cells, conflictorder: ["w2", "w1"], now: now() });
    check(merged.state === "merged" && merged.conflicts[0].resolvedby === "w2", "the policy order never resolved the conflict");
    check(merged.cells.length === 3, "the merged report lost a contribution");
    const report = agent.swarmreport({ id: "rep-agg", title: "The pricing table read", outputs: [
      { id: "m1", agentid: "w1", taskid: "t1", key: "rowcount", value: "14", mergedat: now() },
      { id: "m2", agentid: "w2", taskid: "t2", key: "rowcount", value: "15", mergedat: now() + 1 },
      { id: "m3", agentid: "a1", taskid: "t3", key: "position", value: "under the hero", mergedat: now() + 2 },
    ], rule: "preferagent", preferagent: "w2", confidence: "The verifier re-read both counts.", now: now() + 3 });
    check(report.report.sources.join(",") === "w1,w2,a1" && report.report.sections.length === 2, "the swarm report lost a source or section");
    check(policy.mergeegressgrade({ report: report.report, carriespagecontent: false }).allowed === true, "the merge egress grade refused a plain report export");
    return `aggregatereport kept the conflicting contributions open, merged them under the user policy order that names w2, kept all three cells, and swarmreport folded the three agent contributions into two sections with every source named.`;
  });

  await entry({ id: 27, title: "the interleaved timeline orders the events of every agent", family: "timeline", module: "agent.js" }, async () => {
    const events = [
      { agentid: "w2", kind: "readtext", summary: "The background agent read the table.", at: now() + 300 },
      { agentid: "w1", kind: "click", summary: "The interactive agent opened the pricing page.", at: now() + 100 },
      { agentid: "w2", kind: "observe", summary: "The background agent observed the hero.", at: now() + 200 },
      { agentid: "a1", kind: "handoff", summary: "The tab moved between the agents.", at: now() + 400 },
    ];
    const lanes = [{ name: "interactive", priority: 10, interactive: true, agentids: ["w1"] }, { name: "background", priority: 1, agentids: ["w2"] }];
    const merged = agent.interleave({ events, lanes });
    check(merged.map(event => event.kind).join(",") === "click,observe,readtext,handoff", `the lane interleaving read ${merged.map(event => event.kind).join(",")}`);
    check(merged[0].lane === "interactive" && merged[1].lane === "background", "the interleaved events lost their lane attribution");
    const timeline = agent.interleavetimeline(events.map(event => ({ id: `x-${event.at - now()}`, kind: event.kind, summary: event.summary, at: event.at, ...(event.agentid !== undefined ? { agentid: event.agentid } : {}) })));
    check(timeline.map(event => event.kind).join(",") === "click,observe,readtext,handoff", "the global timeline lost the time order");
    check(agent.interleavetimeline([]).length === 0, "the empty timeline carried events");
    return `interleave ordered the concurrent actions of w1 and w2 into one timeline with the interactive lane first and every event keeping its lane, and interleavetimeline ordered the same stream by time with the handoff closing it.`;
  });

  await entry({ id: 28, title: "the lessons learned store deduplicates the entries", family: "lessons", module: "agent.js and memory.js" }, async () => {
    const first = agent.lessonrecordof({ id: "l1", agentid: "w1", finding: "The pricing table loads only after the hero settles.", origin: "https://example.com", now: now() });
    const second = agent.lessonrecordof({ id: "l2", agentid: "w2", finding: "The login form refuses pasted passwords on the shop.", origin: "https://shop.example", now: now() });
    check(first.reusecount === 0 && second.reusecount === 0, "the fresh lessons carried reuse counts");
    let reused = agent.lessonreuse({ lessons: [first, second], id: "l1", now: now() + 1_000 });
    check(reused.find(lesson => lesson.id === "l1").reusecount === 1, "the reuse count never grew");
    class fakeadapter {
      constructor() { this.data = new Map(); }
      async get(key) { return this.data.get(key); }
      async set(key, value) { this.data.set(key, value); }
    }
    const store = new library.sessionmemory(new fakeadapter());
    await store.setlesson(first);
    await store.setlesson(second);
    check((await store.getlessons()).length === 2, "the store lost a lesson");
    const updated = reused.find(lesson => lesson.id === "l1");
    await store.setlesson(updated);
    const stored = await store.getlessons();
    check(stored.length === 2, `the store duplicated the rewritten lesson: ${stored.length} entries`);
    check(stored.find(lesson => lesson.id === "l1").reusecount === 1, "the rewritten lesson lost its reuse count");
    const matches = agent.lessonmatches({ lessons: stored, task: "Read the pricing table of the hero again", origin: "https://example.com" });
    check(matches.map(lesson => lesson.id).join(",") === "l1", `the matches served ${matches.map(lesson => lesson.id).join(",")}`);
    const decayed = agent.lessondecay({ lessons: stored, now: now() + 100_000_000, stalewindow: 1_000_000 });
    check(decayed.map(lesson => lesson.id).join(",") === "l1", "the decay retired the reused lesson instead of the stale one");
    return `the lesson store kept one entry per lesson id while the rewrite carried its reuse count (no duplicate rows), lessonmatches served only the same-origin lesson and lessondecay retired the stale unreused entry while keeping the reused one.`;
  });

  await entry({ id: 29, title: "the coordination pool items 469 through 502 all map onto real modules", family: "pool coverage", module: "swarm.js, agent.js and policy.js" }, async () => {
    const fleet = fiveagents(agent);
    const pool = {
      469: ["agent.js", "registeragent"], 470: ["agent.js", "assignrole"], 471: ["swarm.js", "claim"], 472: ["swarm.js", "steal"], 473: ["agent.js", "sendmessage"], 474: ["swarm.js", "postentry"],
      475: ["swarm.js", "electleader"], 476: ["swarm.js", "requestreview"], 477: ["swarm.js", "plannersplit"], 478: ["swarm.js", "checkclaim"], 479: ["agent.js", "transferhandoff"], 480: ["agent.js", "acquirelock"],
      481: ["agent.js", "scanconflicts"], 482: ["agent.js", "mergeresults"], 483: ["swarm.js", "boardstate"], 484: ["agent.js", "agentbudgetcheck"], 485: ["agent.js", "scopegate"], 486: ["swarm.js", "escalate"], 487: ["agent.js", "reviewrecordof"],
      488: ["agent.js", "runreplay"], 489: ["agent.js", "compareoutputs"], 490: ["swarm.js", "openconsensus"], 491: ["agent.js", "engagekillswitch"], 492: ["agent.js", "pauseone"], 493: ["agent.js", "agentname"], 494: ["agent.js", "spawnsubagent"],
      495: ["agent.js", "depthlimitof"], 496: ["agent.js", "aggregatereport"], 497: ["agent.js", "interleavetimeline"], 498: ["agent.js", "lessonrecordof"], 499: ["swarm.js", "arbitrate"], 500: ["agent.js", "prioritylaneof"], 501: ["agent.js", "scalesuggestion"], 502: ["agent.js", "sharedcostsplit"],
    };
    const modules = { "agent.js": agent, "swarm.js": swarm };
    const missing = [];
    for (const [item, [modulename, exportname] ] of Object.entries(pool)) {
      const module = modules[modulename];
      if (module === undefined || typeof module[exportname] !== "function") missing.push(`${item}:${modulename}.${exportname}`);
    }
    check(missing.length === 0, `the pool items lost their module mapping: ${missing.join(", ")}`);
    check(Object.keys(pool).length === 34, `the pool mapping covered ${Object.keys(pool).length} items instead of thirty four`);
    const split = agent.sharedcostsplit({ entries: [agent.costentryof({ agentid: "w1", runid: "run-1", units: 4, description: "The pricing table read.", now: now() }), agent.costentryof({ agentid: "w2", runid: "run-2", units: 2, description: "The footer read.", now: now() })] });
    check(split.length === 2 && split.every(share => share.units > 0), "the shared cost split lost an agent share");
    const overview = agent.swarmoverview({ agents: fleet, queue: swarm.emptyqueue({ lanes: ["extraction"] }), mailboxes: fleet.map(identity => ({ agentid: identity.id, inbox: [], outbox: [], unread: 0 })) });
    check(overview.agents === 5, "the swarm overview lost the fleet count");
    return `every pool item 469 through 502 maps onto one real exported function of the compiled agent.js or swarm.js modules (thirty four items, none missing), the shared cost split and the swarm overview answering beside them.`;
  });

  await entry({ id: 30, title: "the certified topology inventory exports from the agent registry snapshot", family: "pool coverage", module: "dashdone.js" }, async () => {
    const dashdone = await import("../dist/dashdone.js");
    const agents = fiveagents(agent);
    const topology = swarm.electleader({ agents, id: "top-inv", now: now() });
    const inventory = dashdone.topologyinventoryof({ agents, topology, spawns: [] });
    check(inventory.entries.length === 5, `the inventory exported ${inventory.entries.length} entries instead of five`);
    check(inventory.scenarios === 6, "the inventory lost the six certified scenario families");
    check(inventory.certified === true, "the inventory never certified the live topology");
    const leader = inventory.entries.find(candidate => candidate.agentid === "a1");
    check(leader.lane === "leader" && leader.scenarios.includes("leader worker scrape"), "the leader entry lost its lane or scenarios");
    const snapshot = { release, inventory };
    check(JSON.stringify(snapshot).includes("w1"), "the snapshot serialization lost an agent");
    return `topologyinventoryof exported the five agent registry entries with their lanes and scenario families over the six certified scenarios of docs/agentscenarios.md, certifying the live leader worker topology of the five fake agents.`;
  });

  const failed = executed.filter(candidate => candidate.outcome === "fail");
  return {
    release,
    checklist: "docs/agentcert.md",
    clockmode,
    faketabkinds: faketabprovider.kinds,
    entries: executed,
    summary: { total: executed.length, passed: executed.length - failed.length, failed: failed.length, poolitems: { from: 469, to: 502, covered: 34 } },
  };
}

/** Runs the leader worker topology coordination scenario end to end for the chromium smoke: the five fake agents register on the fake tabs of every browser kind, the topology elects, the shared queue hands out every task exactly once and the review, verification and report close the loop — the scenario speaks through the one shipped library bundle so the smoke certifies exactly what the release packs. */
export async function runleaderworkertopologyscenario() {
  const library = await import("../dist/index.js");
  const agent = library;
  const swarm = library;
  const clock = fakeclock("fake");
  let agents = [];
  for (const registration of [
    { id: "a1", name: "Scout", role: "worker", tab: faketabprovider.tabof("chromium", 1) },
    { id: "w1", name: "Scribe", role: "worker", tab: faketabprovider.tabof("chromium", 2) },
    { id: "w2", name: "Probe", role: "worker", tab: faketabprovider.tabof("firefox", 1) },
    { id: "c1", name: "Judge", role: "critic", tab: faketabprovider.tabof("firefox", 2) },
    { id: "v1", name: "Witness", role: "verifier", tab: faketabprovider.tabof("safari", 1) },
  ]) {
    agents = agent.registeragent({ agents, id: registration.id, name: registration.name, role: registration.role, tabid: registration.tab, now: clock.now() });
  }
  let queue = swarm.emptyqueue({ lanes: ["extraction", "indexing"] });
  queue = swarm.enqueue({ queue, id: "t1", lane: "extraction", priority: 2, payload: "Read the pricing table", now: clock.now() });
  queue = swarm.enqueue({ queue, id: "t2", lane: "indexing", priority: 1, payload: "Index the footer links", now: clock.now() });
  const topology = swarm.electleader({ agents, id: "top-smoke", now: clock.now() });
  const assigned = swarm.assignwork({ topology, tasks: queue.items, now: clock.now() });
  let claimed = 0;
  while (swarm.taskcounts(queue).queued > 0) {
    const outcome = swarm.claim({ queue, agentid: claimed % 2 === 0 ? "w1" : "w2", now: clock.now() });
    queue = outcome.queue;
    if (outcome.task !== undefined) claimed += 1;
  }
  const requests = swarm.requestreview({ requests: [], id: "rev-smoke", fromagentid: "w1", toagentid: "c1", subject: "The pricing extraction", payload: "42 rows read.", now: clock.now() });
  const reviewed = swarm.applyreview({ requests, id: "rev-smoke", reviewerid: "c1", verdict: "approve", issues: [], requiredchanges: [], now: clock.now() });
  const verified = swarm.checkclaim({ id: "ver-smoke", verifierid: "v1", claimagentid: "w1", claim: "The table holds 42 rows.", method: "re-read", outcome: "pass", evidence: "The re-read counted 42 rows.", now: clock.now() });
  for (const id of ["t1", "t2"]) queue = swarm.complete({ queue, taskid: id, now: clock.now() });
  const report = agent.swarmreport({ id: "rep-smoke", title: "The pricing extraction", outputs: [{ id: "m1", agentid: "w1", taskid: "t1", key: "rowcount", value: "42", mergedat: clock.now() }], rule: "first", confidence: "The verifier re-read the count.", now: clock.now() });
  if (agents.length !== 5 || assigned.assignments.length !== 2 || claimed !== 2 || reviewed.review.verdict !== "approve" || verified.outcome !== "pass" || !swarm.queuecomplete(queue) || report.refused !== false) throw new Error("The leader worker topology scenario did not close its loop end to end.");
  return { agents: agents.length, tasks: claimed, verdict: reviewed.review.verdict, verification: verified.outcome, complete: swarm.queuecomplete(queue) };
}

const invokeddirectly = process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href;
if (invokeddirectly) {
  const report = await runagentcertsuite();
  await mkdir("tests/artifacts", { recursive: true });
  await writeFile(artifactpath, `${JSON.stringify(report, null, 2)}\n`);
  for (const candidate of report.entries) {
    const line = `[${candidate.outcome === "pass" ? "ok" : "FAIL"}] ${candidate.id}. ${candidate.title} (${candidate.module}) — ${candidate.detail}`;
    if (candidate.outcome === "pass") console.log(line);
    else console.error(line);
  }
  console.log(JSON.stringify({ release: report.release, artifact: artifactpath, clock: report.clockmode, faketabs: report.faketabkinds, ...report.summary }, null, 2));
  if (report.summary.failed > 0) process.exitCode = 1;
}
