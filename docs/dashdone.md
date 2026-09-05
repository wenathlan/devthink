# Multi agent dashboard

The dashdone completion of the 1.1.96 release finishes the multi agent dashboard on the dashboardpage surface: the newtab override every browser kind serves. The background service worker shapes one multi agent view from the live swarm state through the dashdone family module (`dashdone.ts`, shipped as `dist/dashdone.js` beside the frozen index surface because the api freeze of 1.1.91 pins the index exports until 2.0.0), and the dashboardpage renders every panel from that shaped view. The module covers the panels below, the viewer mode and the empty states; the coordination scenarios the panels watch live in `docs/agentscenarios.md`.

## The panels

- **the multi agent overview panel** (`#multiagentoverview`): the topology status names the elected leader with its worker, critic and verifier lanes beside the kill switch state, and the at a glance counts — the agents by state (active, paused, stopped), the queue by state (queued, claimed, done) and the unread message total. The panel renders the empty state guidance when no agent is registered yet.
- **the per agent status cards** (`#agentstatuscards`): one card per agent with its role, state, depth, tab binding, parent (for sub agents), session, the claimed task it works on, its done and claimed counts, its usage counters (tokens, cost, steps) against its budget, its unread count and its review status. The cards carry the pause, resume and stop controls when the viewer holds the run role.
- **the shared queue view** (`#sharedqueueview`): one row per task with its lane, priority, state, payload and the agent that claimed it with the heartbeat keeping the claim alive. The lane filter (`#queuelanefilter`) narrows the rows to the lane the user picked; the empty filter keeps every row.
- **the message flow view** (`#messageflow`): every inbox and outbox message folded into one stream ordered by the send time with the sender, the recipient, the routing kind (direct, broadcast or role), the payload and the read marker, so the panel reads the deliveries between every agent pair.
- **the conflict and arbitration log panel** (`#conflictlog`): every conflict scan with its overlapping writers and its suggested ordering beside every live resource lock with its holder and its kind, newest first, so the panel reads both the detected conflicts and the arbitration holding the contested resources.
- **the cost per agent panel** (`#agentcostpanel`): one row per agent with its tokens, cost and steps beside its share of the swarm total, and the total row the costcert totals feed — the panel and the certification read the same numbers because both fold the same per agent usage (the source note names the costcert artifact `tests/artifacts/costcert.json`).
- **the escalation inbox** (`#escalationinbox`): every escalation with its raising agent, its subject, its state and the decision when the user already answered; only the open rows wait for the answer, and the answer control routes through the human decided gate — the escalation decision needs the words the user wrote.
- **the kill switch and pause controls**: the kill switch button (`#killswitch`) stops every agent at once, cancels every attributed run and clears the shared queue in one press; the per agent pause, resume and stop controls ride the status cards and route through the same swarm commands the sidepanel fleet control holds.
- **the timeline scrubber** (`#timelinescrubber` over `#aggregatetimeline`): the range input walks the merged fleet timeline — the interleaved actions of every agent ordered by time — and the readout names the mark the scrubber rests on; the panel lists every mark with its agent, kind, time and relative position.
- **the aggregate report download** (`#reportdownload`): the merged result report of the swarm downloads as one json payload (`devthink-aggregate-<id>.json`) with a stable file name; an absent report answers the empty state instead of an empty file.

## The viewer modes

The dashboard renders read only for observers without the run role: a viewer carrying the observer role or the readonly scope flag reads every panel without the controls (no pause, no resume, no stop, no kill switch, no escalation answer), because a viewer that never runs steps never pauses, stops or kills the swarm. The operator session and every run role keep the full controls. The viewer line (`#multiagentviewer`) names the mode and its reason.

## The empty states

A swarm with no registered agent reads the guidance that walks the user through the first multi agent run: register the agents of the fleet from the sidepanel fleet control, attach the roles (the planner drafts, the workers execute, the critic reviews, the verifier confirms), enqueue the shared tasks into the lanes, and watch the panels go live. Every panel carries its own empty state — the queue names the empty lanes, the cost panel names the accounting that starts with the first spent token, the timeline names the interleaved stream that starts with the first swarm run.

## The agent registry snapshot

The agent registry snapshot exports the certified topology inventory: one entry per registered agent with its role, state, depth and parent, the topology lane it sits in (leader, worker, critic, verifier, sub agent or unassigned) and the certification scenario families that exercise it, over the six certified scenarios of `docs/agentscenarios.md`. The snapshot answers which certified topologies the live fleet carries.

## Wiring

The background service worker shapes the view through `multiagentviewof` inside the dashboard view response (`{ kind: "surface", dashboard: { view: true } }`), reading the live swarm state — the agents, the topology, the shared queue, the mailboxes, the kill switch, the per agent usage and the swarm costs, the conflict scans, the locks, the escalations, the swarm timeline and the aggregate report — and interleaving the timeline through the same `interleavetimeline` the certification verifies. The dashboardpage renders every panel on load and on every surface broadcast, the manifest test verifies the dashboard surface declares the panels with no new permission, the runtime policy accepts the certification paths, and the packageextension gate verifies the dashboard bundle — the html with every panel and the compiled module — rides complete inside the shipped archive.
