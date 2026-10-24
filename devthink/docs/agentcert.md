# Multi agent certification

The security review of 1.1.94 cleared the single agent surface, so the certification of 1.1.96 covers the coordination layer end to end: the agentcert gate of `tests/agentcert.mjs` drives every coordination scenario against the real compiled modules of `dist/`, and the costcert gate of `tests/costcert.mjs` proves the shared accounting reconciles. This document describes the coordination suite; the accounting verification method lives in `docs/costcert.md`, the six certified topologies in `docs/agentscenarios.md` and the multi agent dashboard in `docs/dashdone.md`. The five agent recipes of `tests/code/recipes/` — `agentswarm`, `agentsreview`, `agentsforms`, `agentsmonitor` and `agentscompete` — are the certified plan file examples of the swarm, review, parallel, monitor and compete topologies, indexed with their kinds and expected durations in the gallery documentation of `docs/gallery.md`.

## The automated coordination checklist

Every entry below executes one real function call sequence of the swarm, agent, policy, memory or dashdone families with its assertions. The gate runs in its fake clock mode by default so every scenario replays byte identical (the fixed epoch `1_800_000_000_000` advances exactly one thousand milliseconds per tick and the artifact carries no timestamp), the fake tab provider hands out one deterministic tab id per browser kind and per slot so the agent scenarios bind tabs the same way on chromium, firefox and safari, and the gate records every executed entry with its outcome in `tests/artifacts/agentcert.json` in a fixed order so reruns stay byte identical, and exits nonzero on any failed entry.

| Entry | Family | Module | Verification |
| --- | --- | --- | --- |
| 1 | topology | swarm.js and agent.js | The leader worker topology elects and assigns across five fake agents: electleader elects a1 over the five fake agents with the workers w1, w2, the critic c1 and the verifier v1; assignwork slices the two tasks across both workers in round robin order and collectresults gathers both outputs with no missing slice. |
| 2 | roles | swarm.js | The planner executor separation keeps drafting and execution in different agents: plannersplit separates the planner p1 from the executor e1, reportstep records the executor outcome with the repeated step id updating in place, and the same agent split refuses. |
| 3 | review | swarm.js and policy.js | The critic agent review loop closes on the reviewed output: requestreview routes the output of w1 to the critic c1, ackreview acknowledges it, applyreview closes the loop with the changes verdict and its issues, the answered request survives the sweep while the stalled one times out. |
| 4 | verification | swarm.js and policy.js | The verifier agent confirms the results before the completion: checkclaim marks the w1 claim pass with the re-read evidence and the w2 claim fail; the method grade refuses the guess method and the failed slice reports failed instead of done. |
| 5 | messaging | agent.js | Message passing delivers between every agent pair: sendmessage delivers the twenty direct messages of every ordered pair with four inbox, outbox and unread entries per agent, the drain acks four messages of a1, the broadcast reaches every peer but the sender and the role addressed message reaches the critic c1. |
| 6 | queue | swarm.js | The shared task queue hands out every task exactly once: the seven tasks of the shared queue were claimed exactly once each across the three workers (no task handed out twice), completed in place and the queue closed under the all policy with both lanes reporting. |
| 7 | work stealing | swarm.js and policy.js | Work stealing respects the lock protocol of the lanes: steal moved the indexing task to the idle worker w2 under the lane ownership that refuses the critic, the policy grade demanded the swarm approval, and the expired heartbeat returned the stolen task to the lane. |
| 8 | blackboard | swarm.js and agent.js | The blackboard memory merges the concurrent writes of the agents: the two concurrent rowcount writes of w1 and w2 both stayed on the board with their authors, mergeresults folded them under the first rule with the value 42, the provenance of w1 and the conflict note naming both writers, and sharelesson landed the verified lesson on the findings section. |
| 9 | tab handoff | agent.js and policy.js | The tab handoff between agents keeps the session state: preparehandoff, transferhandoff and resumehandoff moved the tab and the packaged session state between agents on every browser kind (chromium, firefox and safari) while the one tab one agent rule refused the contested transfer. |
| 10 | locking | agent.js and policy.js | The shared resource lock blocks the double writes: acquirelock refused the double write of w2 and the double hold of w1 while the shared kind admitted the second reader, releaselock refused the foreign holder and honored the right one, and expirelocks swept the expired lock back to the pool. |
| 11 | conflicts | agent.js | The conflict detection catches the simultaneous edits: scanconflicts flagged the simultaneous edits of w1 and w2 on the same form selector with the suggested order w1, w2 while the writers of different origins stayed clean. |
| 12 | merging | agent.js and policy.js | The merge of results from parallel agents keeps the provenance: mergeresults folded the parallel results of w1 and w2 under the first, last, preferagent and fail rules with every merged value keeping its agent provenance, and swarmreport built the aggregate with both sources. |
| 13 | consensus | swarm.js and agent.js | The vote and consensus flow carries the quorum across the agents: openconsensus and castvote carried the round at the quorum of three yes votes and refused the late vote, consensusrecordof failed the complete no round with the dissenting reasons kept, and the quorum and weight grades held. |
| 14 | emergency stops | agent.js and swarm.js | The kill switch stops every agent at once: killall stopped all five agents with the switch engaged, engagekillswitch stopped the fleet records, cancelled every attributed run and cleared the shared queue in one call, and disarmkillswitch lifted the switch. |
| 15 | lifecycle | agent.js and policy.js | Pausing one agent leaves the others running: pauseone paused only w1 while a1, w2, c1 and v1 kept running, resumeone lifted the pause and refused the never paused agent, the pause gate held and the heartbeat of w2 refreshed. |
| 16 | sub agents | agent.js and swarm.js | The depth limit refuses the spawned sub agents past the ceiling: spawnsubagent built the lineage p1 → c1 → g1 with the child scope staying a subset of the parent, depthlimitof refused the depth two lineage under the ceiling of one, and the swarm spawn refused the same recursion. |
| 17 | escalation | swarm.js, agent.js and policy.js | The escalation gate reaches the human from any agent: escalate lifted the stalled decision of w2 to the human, the hold blocked only the raising agent, resolveescalation landed the user decision and lifted the hold, and the terminal escalation refused the second decision. |
| 18 | review flow | agent.js and policy.js | The review request flow routes between the agents of the shared origin: reviewrecordof moved the output of w1 to the critic c1 of the shared origin behind the policy gate that refuses the foreign origin, recordverdict landed the changes verdict beside the untouched original output, and the self review refused. |
| 19 | audit replay | agent.js | The interleaved agent run replays for the audit: reconstructreplay rebuilt the run of w1 from the interleaved audit trail with the steps s1 recorded and s2, s4 done, rebuilt the failed paywall step of w2 as failed, runreplay captured the live failed step, and replayagentrun filtered the three w1 events from the merged stream. |
| 20 | comparison | agent.js | The comparison of the competing agent outputs names every difference: compareoutputs named the row count difference between w1 and w2, outputcompare aligned the fields field by field (title matching, rowcount conflicting, two missing) and the self comparison refused. |
| 21 | lanes | agent.js and policy.js | The prioritized task lanes order the execution: prioritylaneof moved the sensitive task into the interactive lane and ordered the rest by lane priority with the round robin fallback, the lane change gate demanded the confirmation for the sensitive downgrade, and the queue claim picked the highest priority task first. |
| 22 | arbitration | swarm.js and agent.js | The resource arbitration orders the contenders under contention: arbitrate ordered the three contenders under the priority, age and leader strategies, arbitrationcaseof granted the fastlane contender w2 under contention, releasecase released the case when the holder finished, and the verdict gate refused the out of scope origin. |
| 23 | scaling | swarm.js and agent.js | The worker scale decision follows the site load: scaleworkers grew the worker lane to the pending load inside the user bound and retired the idle workers, the load reports suggested a spawn on the idle origin and a pause on the throttled one, and the consent gate refused the unconsented scale. |
| 24 | budgets | agent.js | The per agent budget limits stop the right agent: the budget grant of w1 with its 1000 token and 5 step ceilings spent down to zero tokens with the overspend refusing at the ceiling, the over budget w1 halted while the unbudgeted peer w2 and the in budget usage kept running, so the budget stops the right agent alone. |
| 25 | scopes | agent.js and policy.js | The per agent permission scopes gate the right kinds: the scope of w1 admitted its granted origin and namespace while refusing the outside origin, the browser namespace, the click kind outside its action kinds and the observer click, and the child scope kept its narrowing inside the parent grants without widening. |
| 26 | reporting | agent.js | The aggregate report merges every agent contribution: aggregatereport kept the conflicting contributions open, merged them under the user policy order that names w2, kept all three cells, and swarmreport folded the three agent contributions into two sections with every source named. |
| 27 | timeline | agent.js | The interleaved timeline orders the events of every agent: interleave ordered the concurrent actions of w1 and w2 into one timeline with the interactive lane first and every event keeping its lane, and interleavetimeline ordered the same stream by time with the handoff closing it. |
| 28 | lessons | agent.js and memory.js | The lessons learned store deduplicates the entries: the lesson store kept one entry per lesson id while the rewrite carried its reuse count (no duplicate rows), lessonmatches served only the same origin lesson and lessondecay retired the stale unreused entry while keeping the reused one. |
| 29 | pool coverage | swarm.js, agent.js and policy.js | The coordination pool items 469 through 502 all map onto real modules: every pool item maps onto one real exported function of the compiled agent.js or swarm.js modules (thirty four items, none missing), the shared cost split and the swarm overview answering beside them. |
| 30 | pool coverage | dashdone.js | The certified topology inventory exports from the agent registry snapshot: topologyinventoryof exported the five agent registry entries with their lanes and scenario families over the six certified scenarios of docs/agentscenarios.md, certifying the live leader worker topology of the five fake agents. |

## The fake clock mode and the fake tab provider

The coordination suite gains a fake clock mode for deterministic runs: the gate starts its clock at the fixed epoch and every tick advances exactly one thousand milliseconds, so every scenario replays byte identical and the artifact carries no wall clock read. The real clock mode exists only for the live verification runs the operator drives with `node tests/agentcert.mjs --clock real`.

The fake tab provider covers every browser kind for the agent scenarios: one deterministic tab id per browser kind and per slot (chromium 101, firefox 201, safari 301 and so on), so the coordination entries bind tabs the same way on chromium, firefox and safari — the same binding rule the live surface applies through the one tab one agent invariant. Every scenario of `docs/agentscenarios.md` references this provider for its fake tab setup.

## Coordination coverage of the feature pool

Every pool item 469 through 502 of the crx feature mining pool maps onto the suite (thirty four items, none missing), and the entry that verifies it recomputes the mapping against the real compiled modules on every run:

| Pool item | Requirement | Module | Export | Entry |
| --- | --- | --- | --- | --- |
| 469 | run several agents in separate tabs | agent.js | registeragent | 1, 5, 30 |
| 470 | assign different roles to agents | agent.js | assignrole | 1, 2 |
| 471 | share a task queue across agents | swarm.js | claim | 6, 7 |
| 472 | work stealing across agents | swarm.js | steal | 7 |
| 473 | message passing between agents | agent.js | sendmessage | 5 |
| 474 | blackboard memory shared by agents | swarm.js | postentry | 8 |
| 475 | leader worker topology | swarm.js | electleader | 1 |
| 476 | critic agent reviewing outputs | swarm.js | requestreview | 3, 18 |
| 477 | planner and executor separation | swarm.js | plannersplit | 2 |
| 478 | verifier agent for results | swarm.js | checkclaim | 4 |
| 479 | hand a tab between agents mid task | agent.js | transferhandoff | 9 |
| 480 | lock shared resources | agent.js | acquirelock | 10 |
| 481 | detect conflicts on simultaneous edits | agent.js | scanconflicts | 11 |
| 482 | merge results from parallel agents | agent.js | mergeresults | 12, 26 |
| 483 | progress dashboard across agents | swarm.js | boardstate | 8 and the dashdone suite |
| 484 | per agent budget limits | agent.js | agentbudgetcheck | 24 and the costcert suite |
| 485 | per agent permission scopes | agent.js | scopegate | 25 and the policy suite |
| 486 | human escalation from any agent | swarm.js | escalate | 17 |
| 487 | agent to agent review requests | agent.js | reviewrecordof | 18 |
| 488 | replay of an agent run for audit | agent.js | runreplay | 19 |
| 489 | compare outputs from competing agents | agent.js | compareoutputs | 20 |
| 490 | vote or consensus among agents | swarm.js | openconsensus | 13 |
| 491 | kill switch for all agents | agent.js | engagekillswitch | 14 |
| 492 | pause one agent without stopping others | agent.js | pauseone | 15 |
| 493 | agent naming and metadata | agent.js | agentname | 1, 5, 30 |
| 494 | spawn sub agents on demand | agent.js | spawnsubagent | 16 |
| 495 | depth limits for sub agents | agent.js | depthlimitof | 16 |
| 496 | aggregate results into one report | agent.js | aggregatereport | 26 |
| 497 | timeline of interleaved agent actions | agent.js | interleavetimeline | 27 and the progress suite |
| 498 | share lessons learned across agents | agent.js | lessonrecordof | 28 |
| 499 | resource arbitration between agents | swarm.js | arbitrate | 22 |
| 500 | prioritized task lanes | agent.js | prioritylaneof | 21 |
| 501 | scale workers by site load | agent.js | scalesuggestion | 23 |
| 502 | shared cost accounting across agents | agent.js | sharedcostsplit | 29 and the costcert suite |

The scenario doc of `docs/agentscenarios.md` maps every one of the six certified topologies onto the same pool range, so the suite and the scenarios read one shared coverage ledger.

## The certification entry gate

The certification entry gate runs agentcert and costcert together: `pnpm validate:agents` executes `node tests/agentcert.mjs && node tests/costcert.mjs`, the chain joins `pnpm validate` after `validate:security`, and the verify workflow runs both gates beside the security gates so every candidate certifies its coordination layer before the freeze. The certification artifacts `tests/artifacts/agentcert.json` and `tests/artifacts/costcert.json` join the release evidence bundle (the gate regenerates them deterministically on every run of the verify workflow, so the candidate evidence always carries the current release stamp), and the certification summary reports the covered scenario count — thirty coordination scenario entries and nine accounting checks at the current release. The artifact diff against 1.1.94 shows no regression: no coordination artifact existed before this release, so the diff is pure addition — thirty passing entries with no removed or downgraded record.

## Rerunning the certification

Run one command from the repository root after a build:

```bash
pnpm build && node tests/agentcert.mjs
```text

The gate prints one line per entry with its outcome, prints the summary json (with the clock mode, the fake tab kinds and the pool coverage), writes `tests/artifacts/agentcert.json` with every executed entry, its family, its module and its detail, and exits nonzero on any failed entry. The chromium smoke run executes the leader worker topology scenario end to end against the shipped bundles inside a live browser, and the artifact test of `tests/agentcert.test.ts` verifies the artifact covers every scenario — running the gate itself when a built tree carries no fresh artifact of the current release, so every lane that builds before the vitest suite verifies the checklist without depending on gate ordering.
