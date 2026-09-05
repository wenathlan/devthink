/** The multi agent dashboard family of the 1.1.96 release: the dashdone completion of the roadmap multi agent certification. The panels the dashboardpage renders live in their own root module beside the swarm family so the frozen library surface of index.ts stays byte identical — the background service worker shapes the view through multiagentviewof, the dashboardpage renders every panel from the shaped view, and the module stays out of the index.ts export graph because the api freeze of 1.1.91 pins that surface until 2.0.0. The family covers the multi agent overview with the topology status, the per agent status cards with their live progress, the shared queue view with its lane filters, the message flow view between agents, the conflict and arbitration log, the cost per agent panel the costcert totals feed, the escalation inbox for human review, the kill switch and pause controls per agent, the timeline scrubber over the interleaved events, the aggregate report download, the read only rendering for observers without the run role, the empty states that guide the first multi agent run and the agent registry snapshot that exports the certified topology inventory. */
import type { agentidentity, agentmailbox, agentusage, conflictscan, escalationrecord, killswitch, leaderworker, resourcelock, resultreport, spawnrecord, swarmaction, swarmcost, taskqueue } from "./types.js";
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
    queueview: {
        lanes: string[];
        lane?: string;
        rows: queuelanerow[];
    };
    messageflow: {
        rows: messageflowrow[];
        deliveries: number;
    };
    conflictlog: {
        rows: conflictlogrow[];
        open: number;
    };
    costview: {
        rows: costperagentrow[];
        total: {
            tokens: number;
            cost: number;
            steps: number;
            currency?: string;
        };
        source: string;
    };
    escalationinbox: {
        rows: escalationrow[];
        open: number;
    };
    controls: {
        pause: boolean;
        resume: boolean;
        stop: boolean;
        killswitch: boolean;
        reason: string;
    };
    timeline: {
        marks: timelinescrubmark[];
        position: number;
    };
    reportdownload: {
        filename: string;
        payload: string;
        bytes: number;
        reason: string;
    };
    empty: {
        empty: boolean;
        guidance: string[];
    };
    viewer: {
        readonly: boolean;
        controls: boolean;
        reason: string;
    };
    inventory: {
        entries: topologyinventoryentry[];
        scenarios: number;
        certified: boolean;
        reason: string;
    };
}
/** Decides the dashboard view mode of one viewer: an observer without the run role — an agent record carrying the observer role or the readonly scope flag — reads every panel without the controls, because a viewer that never runs steps never pauses, stops or kills the swarm; the operator session and every run role keep the full controls. */
export declare function dashboardviewerof(input: {
    viewer?: {
        role?: string;
        readonly?: boolean;
    };
}): {
    readonly: boolean;
    controls: boolean;
    reason: string;
};
/** Shapes the multi agent overview panel: the topology status names the leader, the worker, critic and verifier lanes and the killswitch state beside the at a glance counts of the swarm. */
export declare function multiagentoverviewof(input: {
    agents: agentidentity[];
    queue: taskqueue;
    topology?: leaderworker;
    killswitch: killswitch;
    unread: number;
}): multiagentview["overview"];
/** Shapes one per agent status card: the identity fields the panel lists beside the live progress (its claimed task with the queue counts it owns), the usage counters against its budget and the handoff arrows it took part in. */
export declare function agentstatuscardof(input: {
    agent: agentidentity;
    usage?: agentusage;
    claim?: {
        taskid: string;
        payload: string;
    };
    done: number;
    unread: number;
    reviewstatus?: string;
    handoffarrows?: string[];
}): agentstatuscard;
/** Shapes the shared queue view with its lane filter: one coherent row per task — its lane, priority, state, payload and the claim that holds it with the heartbeat keeping the claim alive — while the lane filter narrows the rows to the lane the user picked and the empty lane filter keeps every row. */
export declare function queuelaneviewof(input: {
    queue: taskqueue;
    lane?: string;
}): multiagentview["queueview"];
/** Shapes the message flow view between agents: every inbox and outbox message folds into one stream ordered by its send time with the sender, the recipient and its routing kind, the payload and the read marker, so the panel reads the deliveries between every agent pair. */
export declare function messageflowof(input: {
    mailboxes: agentmailbox[];
}): multiagentview["messageflow"];
/** Shapes the conflict and arbitration log panel: every conflict scan with its overlapping writers and its suggested ordering beside every live resource lock with its holder and its kind, so the panel reads both the detected conflicts and the arbitration that holds the contested resources. */
export declare function conflictlogof(input: {
    conflicts: conflictscan[];
    locks: resourcelock[];
}): multiagentview["conflictlog"];
/** Shapes the cost per agent panel from the accounting the costcert gate reconciles: one row per agent with its tokens, cost and steps beside its share of the swarm total, and the total row the costcert artifact records — the panel and the certification read the same numbers because both fold the same per agent usage. */
export declare function costperagentof(input: {
    usage: agentusage[];
    totals?: swarmcost;
}): multiagentview["costview"];
/** Shapes the escalation inbox for human review: every escalation with its raising agent, its subject, its state and the decision the user wrote, so the inbox reads as the human queue the escalations of any agent form; only the open rows wait for the answer. */
export declare function escalationinboxof(input: {
    escalations: escalationrecord[];
}): multiagentview["escalationinbox"];
/** Shapes the per agent controls: the pause, resume and stop availability of one agent and the kill switch availability of the swarm, gated by the viewer role so an observer without the run role reads the panels without touching the swarm. */
export declare function agentcontrolsof(input: {
    agent: agentidentity;
    viewer: {
        readonly: boolean;
    };
    killswitch: killswitch;
}): multiagentview["controls"];
/** Shapes the timeline scrubber over the interleaved events: every interleaved action becomes one mark with its relative position on a zero to one scale, so the dashboard walks the merged fleet timeline deterministically and the scrubber position names the mark it rests on. */
export declare function timelinescrubof(input: {
    actions: swarmaction[];
    position?: number;
}): multiagentview["timeline"];
/** Shapes the aggregate report download: the merged result report of the swarm folds into one json payload with a stable file name, so the dashboard downloads exactly what the agents contributed and the audit trail recorded; an absent report answers the empty state instead of an empty file. */
export declare function aggregatereportdownloadof(input: {
    report?: resultreport;
    now: number;
}): multiagentview["reportdownload"];
/** Shapes the empty state guidance of the multi agent dashboard: a swarm with no registered agent reads the guidance that walks the user through the first multi agent run — registering the first agents, electing the topology, enqueueing the shared queue and watching the panels go live. */
export declare function dashboardemptyguidanceof(input: {
    agents: unknown[];
}): multiagentview["empty"];
/** Shapes the certified topology inventory the agent registry snapshot exports: one entry per registered agent with its role, state, depth and parent beside the topology lane it sits in and the certification scenario families that exercise it, so the snapshot answers which certified topologies the fleet carries. */
export declare function topologyinventoryof(input: {
    agents: agentidentity[];
    topology?: leaderworker;
    spawns?: spawnrecord[];
}): multiagentview["inventory"];
/** Shapes the full multi agent dashboard view from the live swarm state: every panel of the dashdone completion — the overview with the topology status, the per agent status cards, the shared queue view with its lane filter, the message flow, the conflict and arbitration log, the cost per agent panel, the escalation inbox, the per agent controls, the timeline scrubber, the aggregate report download, the empty state guidance, the viewer mode and the topology inventory — in one call the background serves and the dashboardpage renders. */
export declare function multiagentviewof(input: {
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
    viewer?: {
        role?: string;
        readonly?: boolean;
    };
    lane?: string;
    now: number;
}): multiagentview;
//# sourceMappingURL=dashdone.d.ts.map