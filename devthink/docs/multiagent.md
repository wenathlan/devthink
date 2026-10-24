# Multi agent guide

Devthink 1.1.58 opens the multi agent phase: several agents work at once, each in its own tab with its own role, over one shared context. Devthink 1.1.59 gives the swarm its shape: a leader worker topology organizes the work, critics and verifiers judge it, tab handoffs move tasks mid run, locks and conflict scans keep parallel edits safe, result merging turns parallel outputs into one report and the progressboard shows every agent at once. The consent model never changes — every agent's proposals go through the same human review a single agent passes, and multi agent coordination never bypasses review.

Nothing is hardcoded: the agent count, the agent names, the roles, the lane names, the priority scale, the freshness windows, the depth ceilings, the leader election rule, the worker scale bound, the consensus quorum, the lock kinds and expiries, the merge rules and the verifier methods are user choices. No code cap exists on concurrent agents beyond what the user configures, and the manifest permissions stay untouched.

## Agents, roles and tabs

The user registers agents through the panel (`swarmagent` handler with `register`): every `agentidentity` carries a user chosen name for dashboards and audit, a role, an optional bound tab and an optional parent with its depth for sub agents.

- **One agent per tab.** `opentabagent` binds one agent to one tab session; a tab that already holds a live agent refuses the binding, so one tab runs one agent. There is no ceiling on how many agents the user registers.
- **Roles.** The five internal roles carry documented defaults — `planner` (compose reviewed plans, read memory: `workflow`, `memory`, `system` namespaces), `worker` (also act on the browser: `browser` too), `observer` (`memory`, `system` only), `critic` (review the outputs of the other agents read only: `workflow`, `memory`, `system`) and `verifier` (re-read the page to check claims, read side: `browser`, `memory`, `system`). A custom role name the user types grades with the worker defaults until the user narrows its scope; `roledefaults` answers the defaults of any role.
- **Naming.** Agent naming is a user choice; the names ride the dashboards, the lifecycle events and the audit trail exactly as typed.

## The shared task queue and work stealing

The swarm shares one `taskqueue` with user configured `lanes`, a user configured `priorities` scale and a completion policy (`all` or `any`). `enqueue` adds a `taskitem` to a lane with its priority; a configured lane list refuses unknown lanes while an empty list accepts any lane name.

- **Claim.** `claim` hands the highest priority queued task to an agent (the oldest task wins a tie). A claim is a `claimrecord` with the agent id, the task id and a heartbeat time; an agent holds one task at a time.
- **Work stealing.** `steal` lets an idle agent take a queued task from a named lane. `workstealgrade` permits stealing only inside one user approved swarm (a live session), and the lane ownership rules the user configures (`Array<{ lane, roles }>`) keep agents whose role holds no grant out of the lane.
- **Heartbeats and requeue.** `claimheartbeat` refreshes the claims of one agent. `requeue` releases the claims whose heartbeat stayed silent past the user configured `claimwindow` (a run setting) and returns the orphaned tasks to their lane as queued; an absent window never expires a claim, so dead agents release tasks exactly when the user decides.
- **Completion.** `complete` marks a task done and releases the claim, moving the per agent usage counters; `canceltask` leaves the queue; `queuecomplete` evaluates the completion policy.

A claimed task names work — it never executes anything by itself. The per agent run context (`agentruncontext`) reuses the workflow engine run records (`<agentid>:<taskid>`), and every proposal the agent drafts still passes the same plan review.

## Mailboxes and messages

Every agent owns one `agentmailbox` with an inbox, an outbox and an unread counter. `agentmessage` records carry the sender, the recipient, the routing kind, the payload and the read time.

- `direct` delivers to one agent id (unknown recipients refuse; a direct message never addresses its own sender).
- `broadcast` (recipient `*`) reaches every live agent but the sender.
- `role` reaches every live agent of the named role.
- `receivemessages` drains an inbox with ack tracking: every message gets its read time and the unread counter resets.
- The user may compose a message to any agent from the panel (sender `user`).

Policy grades cross agent messages that carry page content as data egress events (`messageegressgrade`), so the audit trail names what moved between agents; the delivery itself stays inside the swarm. The `mailboxretention` run setting bounds the stored inbox and outbox messages when the user configures one.

## The blackboard memory

The `blackboard` is the shared memory of the swarm: the four sections `goals`, `facts`, `findings` and `scratch`, every `blackboardentry` with a key, a value kind (`text` or `json`), an author and the posting time.

- `postentry` writes with the author; a json value must parse.
- `readentries` reads with a section filter and an optional freshness window; retired entries stay out of the live reads while the stored entry survives for the audit trail.
- `retireentries` expires the entries older than the user configured `retirementwindow`; `retireentry` retires one entry by its id.
- **Every agent reads the same board.** The writes of one agent are visible to every other agent with no relay.
- **Consent inheritance.** Every entry carries the consent class of its source extraction (`read`, `interaction` or `sensitive`); `blackboardconsentgrade` grades the entry by the inherited class so a sensitive extraction stays sensitive on the board.

## Budgets, scopes and the killswitch

- **Per agent budgets.** An `agentbudget` holds optional token, cost and step ceilings. `agentbudgetcheck` halts an agent whose usage passed a ceiling — the claim handler refuses new work and asks the user to raise the ceiling or stop the agent; absent ceilings never halt. The `swarmagent` handler validates budgets with `agentbudgetvalid` (positive user values, currency named with a cost ceiling).
- **Per agent scopes.** An `agentscope` holds the origins and tool namespaces granted to one agent. `agentscopevalid` validates the grants against the session grant list, so no agent scope ever widens the session; `scopegate` refuses an origin or a namespace outside the grant while an absent scope stays unbounded inside the session grants.
- **The killswitch.** `killall` engages the `killswitch` and stops every agent at once — the claims return to the queue and the reason is recorded. `killswitchgate` documents the design rule: the switch stays available with no configuration barrier, so the user halts the whole swarm at any time. `pauseone` suspends a single agent without stopping the others.

## Sub agents and depth limits

`spawn` creates a sub agent under a `spawnrequest` (parent, role, task, depth). The child carries its parent, its depth (exactly one level under the parent) and the requested role; the spawn history (`spawnrecord`) persists for audit. `spawngrade` grades the request with the risk class of the requested role — planner and observer spawns grade read side while worker and custom role spawns grade sensitive because they may execute reviewed steps.

The depth ceiling is a user choice: the `swarmdepth` run setting bounds the recursion and `spawn` refuses recursion past the configured `depthlimit`; an absent setting keeps spawning unbounded.

## Where to see it

- The sidepanel **Agents** tab lists agent cards (role, tab, state, current task, budget use, heartbeat) with pause, resume, stop, claim and heartbeat buttons, the spawn dialog (parent, role, task, depth, name), the task queue view (lanes, priorities, claims, enqueue, requeue, cancel, complete), the mailbox view with the compose form, the blackboard view with its editor and retire buttons, the spawn history and the lifecycle event feed.
- The popup shows the swarm size and the active task count at a glance.
- The protocol carries the `swarmstatereport` envelope and the `agents/notify` event frames; the `swarm` audit kind records register, assign, claim, steal, complete, spawn, killswitch and pause events.

## Leader worker topology

The swarm organizes itself through a `leaderworker` topology the user elects (`swarmleader` handler with `elect`): the rule stays a user choice — `first` takes the first registration while `named` takes the agent the user names, and `leaderelectionvalid` refuses everything else. The topology separates the live agents into the worker, critic and verifier lanes beside the leader.

- **Assign.** `assignwork` slices the queued and claimed tasks across the workers in turns; every `workerassignment` records the worker, the task and the slice in plain language.
- **Collect.** `collectresults` gathers the worker outputs with their state while the pending slices stay named so nothing silently disappears.
- **Scale.** `scaleworkers` adds live worker role agents when the pending slices exceed the workers and retires the idle tail when the work shrinks, all under the user configured `swarmworkers` bound — an absent bound stays unbounded because no engine cap exists (`workerscalevalid`).
- **Planner executor split.** `plannersplit` keeps plan drafting and execution in two different agents; the executor reports every step outcome back through `reportstep` so the planner reads the run as it happens.

## Critics, verifiers and consensus

- **Critic review.** `requestreview` routes one agent output to a critic agent with the user configured answer window; the critic acks, then `applyreview` returns its verdict (`approve`, `changes` or `reject`) with the issues and the required changes. `criticreviewgrade` keeps the review read only — the critic never acts on the page, and the rework still passes the same human review. `sweepreviews` times out the unanswered requests.
- **Verifier checks.** `checkclaim` records a pass or fail over a result claim with the method used and its evidence; `verifiermethodgrade` checks the method against the `verifiermethods` list the user configures (an empty list stays the documented open choice).
- **Consensus.** `openconsensus` opens a round with the user configured quorum (`swarmquorum` setting or the call), `consensusvote` collects one vote per agent (yes, no or abstain), the round carries when the yes votes reach the quorum and fails when the no votes reach it; `consensusquorumvalid` refuses an unreachable quorum.

## Tab handoffs

A handoff moves a task between agents mid run without losing the run. `preparehandoff` packages the tab id and the task state in plain language; `transferhandoff` moves the tab binding to the receiving agent under the one agent per tab rule while `handoffgrantgate` checks that the receiving scope stays inside the original session grants (a tab transfer never widens the session); `resumehandoff` continues the task from the packaged state. The handoff log persists every transfer with its resumed state.

## Locks and conflicts

- **Locks.** `acquirelock` takes an `exclusive` or `shared` lock keyed by exactly one origin and one selector — `lockscopevalid` refuses keys that span unrelated origins. An exclusive lock refuses every second holder; shared locks stack until an exclusive request arrives. `releaselock` frees the lock with its holder named, and the sweep (`expirelocks`) returns the abandoned locks past their user configured expiry while a lock without an expiry never expires.
- **Conflicts.** `scanconflicts` groups the parallel writers by their origin and selector and reports every overlapping target with its writers plus a deterministic suggested ordering (by agent id). The scan runs before the parallel runs so the user sees the collision first.
- **Arbitration.** When claims compete for one resource, `arbitrate` orders them by the user rule: `priority` follows the user ordered agent list, `age` gives the resource to the oldest claim and `leader` lets the elected leader go first.

## Merging, reports and the timeline

- **Merge rules.** `mergeresults` folds duplicate keys under the rule the user picks: `first` keeps the earliest value, `last` keeps the latest, `preferagent` keeps the value of the agent the user names (falling back to the latest with a note when that agent wrote nothing) and `fail` refuses the fold on any conflict. `conflictresolutiongrade` marks the overwriting rules (`last`, `preferagent`) sensitive. Every merged value keeps its provenance — the contributing agents stay readable.
- **The aggregate report.** `swarmreport` builds one `resultreport` across the agents: sections per task, the sources of every entry, the confidence as the agents stated it. Exporting a report that includes page content grades as a data egress event (`mergeegressgrade`).
- **Compare.** `compareoutputs` contrasts two or more competing agent outputs side by side and names where they disagree.
- **Lessons.** `sharelesson` writes a verified lesson to the blackboard findings section — only a verified lesson lands on the board.
- **Shared costs.** `swarmcosts` sums the per agent usage into the swarm totals of tokens, cost and steps.
- **Timeline and replay.** Every orchestrated action appends to the interleaved swarm timeline; `getswarmtimeline` reads it with agent, kind and time filters, and `replayagentrun` rebuilds any agent run from the audit trail.

## The progressboard and escalation

- **Progressboard.** `boardstate` aggregates the agents, the queue and the topology into one lane per agent with its role, state, lane of work, current task and milestones — the user reads every agent at once. Snapshots persist under the user configured `boardretention` window.
- **Escalation.** `escalate` lifts a stalled agent decision to the user with its full context; the escalation stays open until the user writes the decision because escalations are always human decided (`escalationgate`).

## Where to see it (1.1.59)

- The sidepanel **Agents** tab grows the orchestration views: the topology box (election, assign, scale, planner executor split), the progressboard with milestones, the review cards with critic verdicts and verifier PASS/FAIL badges, the escalation inbox with decide inputs, the consensus rounds with votes and quorum, the handoff log with transfer and resume, the lock view with expiry countdowns, the conflict scans with the suggested ordering, the merged report preview with its export, the compare, lesson and cost controls, and the interleaved timeline with replay.
- The popup shows the elected leader and the held lock count beside the swarm summary.
- The protocol carries the `boardstate` snapshot envelope and the `agents/handoff` and `agents/review` event frames; the `swarm` audit kind records elect, assign, review, verify, handoff, lock and merge events.
