# Certified agent scenarios

The six certified topologies of the multi agent certification describe every coordination shape the agentcert suite drives: each scenario lists its topology diagram, its cost characteristics, its consent model and its fake tab setup, and maps onto the pool items 469 through 502 the suite verifies. All six run inside `tests/agentcert.mjs` through the real compiled modules with the fake clock mode keeping every run deterministic; the per scenario verification lives in `docs/agentcert.md`.

The fake tab setup every scenario shares: the fake tab provider hands out one deterministic tab id per browser kind and per slot — chromium 101 and 102, firefox 201 and 202, safari 301 — so every agent binds a tab the same way on every browser kind the extension ships (chromium, firefox and safari), through the same one tab one agent invariant the live surface enforces.

## One — the leader worker scrape

The leader worker scrape splits one page read across a fleet: the leader elects over the five fake agents, slices the extraction into lane tasks, the workers claim every task exactly once, the critic reviews the merged output and the verifier confirms the result before the completion.

Topology diagram:

```text
        ┌─────────┐   elect    ┌─────────┐
        │  user   │──────────▶│ leader a1│
        └─────────┘            └────┬────┘
                                  │ assignwork (round robin)
                 ┌────────────────┼────────────────┐
                 ▼                ▼                 ▼
          ┌──────────┐     ┌──────────┐      ┌──────────┐
          │ worker w1│     │ worker w2│      │ critic c1│
          │ tab 102  │     │ tab 201  │      │ tab 202  │
          └────┬─────┘     └────┬─────┘      └────┬─────┘
               │ claim t1        │ claim t2        │ review
               └────────┬────────┴────────────────┘
                        ▼
                 ┌──────────┐  verify   ┌─────┐
                 │ merge    │─────────▶│ v1  │ tab 301
                 │ results  │           └─────┘
                 └──────────┘
```

Cost characteristics: the leader pays one election and one assignment pass (two model calls of the draftplan kind), every worker pays its own extraction call on its own tab, the critic pays one review pass and the verifier pays one re read — the shared cost accounting splits the ledger so the shared extraction reads carry both worker shares while the per agent usage totals keep the solo costs attributed (the costcert entry 3 verifies the same split). The typical spend stays linear in the task count because the round robin assignment never double reads one task.

Consent model: the user grants the origin once; the leader slices only reviewed read kinds, the workers run inside the granted origin and the read only scope, the critic reads outputs without page access and the verifier re reads the page through the same grant — the sensitive kinds stay out of this topology, so no human gate opens mid run, and the kill switch stays the one press stop.

Pool mapping: 469, 470, 471, 475, 476, 478, 482, 491, 496 (agentcert entries 1, 3, 4, 6, 12, 14, 26).

## Two — the planner executor critic

The planner executor critic separates the drafting from the execution: the planner turns the objective into the step plan, the executor runs the steps, the critic reviews every executed step output and the verdict drives the fix loop.

Topology diagram:

```text
   ┌─────────┐  objective  ┌──────────┐
   │  user   │────────────▶│ planner p1│
   └─────────┘             └────┬─────┘
                                │ plan (draftplan kind)
                                ▼
                          ┌──────────┐
                          │executor e1│
                          └────┬─────┘
                               │ step outputs
                               ▼
                          ┌──────────┐  verdict  ┌─────┐
                          │ critic c1│─────────▶│ fix │
                          └──────────┘  changes  └──┬──┘
                             ▲                     │ redo
                             └─────────────────────┘
```

Cost characteristics: the planner pays the draftplan routing (the planner gateway), the executor pays one call per step, the critic pays one review per step output — the loop multiplies the executor and critic cost by the fix rounds, so the budget ceilings per agent stop the loop when the planner or the executor overspends (the agentcert entry 24 and the costcert entry 4 verify the same budget behavior). The planner executor split never merges into one agent, so the model routing always lands the planner calls on the planner gateway and the extraction calls on the extraction gateway (costcert entry 6).

Consent model: the plan needs the human approval before the executor starts (the same plan review the single agent surface holds), the executor runs only approved steps, the critic stays read only and the fix loop re opens the plan review whenever a step changes shape — the review request flow routes between the agents of the shared origin and refuses the foreign origin (agentcert entry 18).

Pool mapping: 470, 476, 477, 484, 487 (agentcert entries 2, 3, 18, 24).

## Three — the parallel form fill

The parallel form fill splits one long form across workers: the shared queue holds one task per form section, every worker claims its section, the resource lock serialises the shared submit target and the conflict scan keeps the simultaneous edits honest.

Topology diagram:

```text
        ┌──────────────┐  enqueue per section
        │ shared queue │  lanes: form (interactive)
        └──┬────┬────┬──┘
           │    │    │  claim (exactly once)
           ▼    ▼    ▼
        ┌────┐┌────┐┌────┐
        │w1  ││w2  ││w3  │  each fills its section
        └─┬──┘└─┬──┘└─┬──┘
          │     │     │  acquirelock #submit
          ▼     ▼     ▼
        ┌──────────────┐
        │ shared lock  │ one writer at a time
        │ + conflicts  │ scanconflicts on #submit
        └──────────────┘
```

Cost characteristics: every worker pays its own section read and fill calls while the lock and the conflict scan cost nothing — the arbitration verdict under contention picks the fastlane holder so the waiting contenders never pay for a lost race, and the shared ledger attributes the submit exactly once to the holder (costcert entry 3). The parallel fill keeps the wall clock near one section while the token cost stays linear in the section count.

Consent model: the form fill is a sensitive kind — the human confirms the plan with the fillcard step before any worker starts, every worker runs inside the interactive lane the sensitive steps always serve through (agentcert entry 21), and the shared resource lock refuses the double write so two confirmed workers never submit twice (agentcert entry 10). The one tab one agent rule refuses a second agent on the same tab; the handoff flow moves a tab between agents when the fill needs one worker to finish another worker's section (agentcert entry 9).

Pool mapping: 469, 471, 472, 480, 481, 500, 502 (agentcert entries 6, 7, 9, 10, 11, 21).

## Four — the monitoring swarm

The monitoring swarm watches several origins over time: the observers poll their granted origins, the planner balances the lanes, the load reports suggest the spawn and pause decisions and the lessons of past runs keep the fleet from relearning.

Topology diagram:

```text
  origin A ──▶ ┌────────┐        ┌────────┐
  origin B ──▶ │observer│──load──▶│planner │
  origin C ──▶ │ o1 o2  │  report │  p1    │
               └───┬────┘        └───┬────┘
                   │ scalesuggestion    │ scaleworkers
                   ▼                    ▼
             ┌──────────┐        ┌──────────┐
             │ pause o2 │        │ spawn o3 │ (depth 1)
             └──────────┘        └──────────┘
                   │
                   ▼
             ┌──────────┐
             │ lessons  │ lessonmatches same origin
             └──────────┘
```

Cost characteristics: the observers pay periodic watch calls (the poll cadence the user configures), the planner pays one balancing decision per load report and the spawns pay the observer cost again — the depth limit keeps the recursion bounded so the spawn chain never compounds, the budget ceiling stops the observer that overspends its grant and the decay retires the lessons nobody reuses (agentcert entry 28). The idle origin suggests a spawn, the throttled origin suggests a pause, and the user bound keeps the fleet inside the configured worker count.

Consent model: the observation is read only — the observers run the watch kinds inside their granted origins with the readonly scope, the sensitive kinds refuse inside the observer scope before dispatch, the spawn needs the user approval behind the spawn grade, and the scale decision refuses the unconsented scale (agentcert entries 16, 23, 25). The monitoring reads never carry page content across the messages (the egress grade of the policy suite).

Pool mapping: 469, 473, 485, 493, 494, 495, 498, 501 (agentcert entries 5, 16, 23, 25, 28).

## Five — the competing extraction

The competing extraction runs two workers over the same target and compares the outputs: the leader seeds the same task into two lanes, the verifier grades both claims, the comparison names every difference and the aggregate report merges the winner with the provenance of both.

Topology diagram:

```text
            ┌──────────┐  same task, two lanes
            │ leader a1│─────────────┬──────────────┐
            └──────────┘             ▼              ▼
                               ┌─────────┐    ┌─────────┐
                               │  w1     │    │  w2     │
                               │ row 42  │    │ row 43  │
                               └────┬────┘    └────┬────┘
                                    │              │
                                    ▼              ▼
                               ┌──────────────────────┐
                               │ compareoutputs       │
                               │ rowcount conflicting │
                               └──────────┬───────────┘
                                          ▼
                               ┌──────────────────────┐
                               │ verifier v1 re read  │
                               │ + aggregate merge    │
                               └──────────────────────┘
```

Cost characteristics: the competition doubles the extraction cost by design — two workers pay the same read, the comparison and the verifier re read add one decision and one confirmation, and the aggregate merge costs nothing; the shared ledger attributes the duplicate reads to both workers so the cost panel reads exactly why the redundancy paid (the costcert entry 2 verifies the per agent accounting against the step logs). The confidence of the merged report names the verification evidence.

Consent model: the user approves the same read kind twice on purpose (the redundancy is the value), the verifier method list stays user configured (the guess method refuses), the conflicting cells resolve only through the user policy order the user names — an unresolved conflict escalates instead of silently picking a side — and the export of the merged report carries no page content without the egress consent (agentcert entries 4, 20, 26).

Pool mapping: 475, 478, 482, 489, 496, 502 (agentcert entries 4, 12, 20, 26).

## Six — the escalation and review

The escalation and review flow lifts the stalled decisions to the human: any agent escalates when its decision needs the user, the escalation inbox holds the open questions, the answering user decision lifts the hold, and the review request loop routes the outputs through the critic of the shared origin.

Topology diagram:

```text
  ┌─────┐ stalled    ┌───────────┐  inbox   ┌─────────────┐
  │ w2  │───────────▶│escalation │─────────▶│  the human  │
  └─────┘            │  hold on  │          │ answers the │
   ▲                 │  w2 only  │◀─────────│  decision   │
   │                 └───────────┘  answer  └─────────────┘
   │ review request
   │         ┌──────────┐
   └────────▶│ critic c1│ same origin only
             └────┬─────┘
                  │ verdict changes
                  ▼
             ┌──────────┐
             │  w2 fix  │
             └──────────┘
```

Cost characteristics: the escalation itself costs nothing — the hold pauses the raising agent alone so its token spend freezes while the peers keep paying, the review request costs one critic pass per round, and the replay of the interleaved audit trail reconstructs the whole flow from the recorded events at zero model cost (agentcert entries 15, 17, 19). The escalation inbox of the dashboard reads the same rows the memory store keeps.

Consent model: the escalation gate reaches the human from any agent with no configuration barrier (the same no barrier rule the kill switch holds), the hold blocks only the raising agent so the swarm keeps running, the user decision stays terminal (a second decision on the same escalation refuses), and the review request refuses the foreign origin and the self review so the critic verdict always comes from another agent of the same origin (agentcert entries 3, 17, 18).

Pool mapping: 486, 487, 488, 492, 497 (agentcert entries 3, 15, 17, 18, 19).

## The scenario ledger

| Scenario | Entries | Pool items | Browser kinds |
| --- | --- | --- | --- |
| leader worker scrape | 1, 3, 4, 6, 12, 14, 26 | 469, 470, 471, 475, 476, 478, 482, 491, 496 | chromium, firefox, safari |
| planner executor critic | 2, 3, 18, 24 | 470, 476, 477, 484, 487 | chromium |
| parallel form fill | 6, 7, 9, 10, 11, 21 | 469, 471, 472, 479, 480, 481, 500, 502 | chromium, firefox, safari |
| monitoring swarm | 5, 16, 23, 25, 28 | 469, 473, 485, 493, 494, 495, 498, 501 | chromium, firefox |
| competing extraction | 4, 12, 20, 26 | 475, 478, 482, 489, 496, 502 | chromium, firefox |
| escalation and review | 3, 15, 17, 18, 19 | 486, 487, 488, 492, 497 | chromium, firefox |

Every entry above runs against the real compiled modules with the deterministic fake clock and the fake tabs of the browser kinds listed; the certification doc of `docs/agentcert.md` carries the full entry table with the verification detail of each.
