import { describe, expect, it } from "vitest";
import { readFile } from "node:fs/promises";
import { sessionmemory } from "../memory.js";
import { clamppanelwidth, panelwidthbounds, panelwidthslayout, panelwidthsof, resizepanel } from "../views.js";
import {
  agentcontrolsof,
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
  topologyinventoryof,
} from "../dashdone.js";
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
  taskqueue,
  swarmaction,
  swarmcost,
} from "../types.js";

const now = 1_800_000_000_000;

/** The in memory adapter the panel width persistence round trip rides: the layout record the resize writes reads back through the same seam. */
class fakeadapter {
  private readonly data = new Map<string, unknown>();
  async get<T>(key: string): Promise<T | undefined> {
    return this.data.get(key) as T | undefined;
  }
  async set<T>(key: string, value: T): Promise<void> {
    this.data.set(key, value);
  }
}

/** Builds the five agent fleet of the certified leader worker topology. */
function fleet(): agentidentity[] {
  return [
    { id: "a1", name: "Scout", role: "worker", depth: 0, state: "active", tabid: 101, registeredat: now },
    { id: "w1", name: "Scribe", role: "worker", depth: 0, state: "active", tabid: 102, registeredat: now },
    { id: "w2", name: "Probe", role: "worker", depth: 0, state: "paused", tabid: 201, registeredat: now },
    { id: "c1", name: "Judge", role: "critic", depth: 0, state: "active", tabid: 202, registeredat: now },
    { id: "v1", name: "Witness", role: "verifier", depth: 0, state: "stopped", tabid: 301, registeredat: now },
  ];
}

/** Builds the shared queue of the certification with both lanes and one claim. */
function queue(): taskqueue {
  return {
    lanes: ["extraction", "indexing"],
    priorities: [2, 1],
    completionpolicy: "all",
    items: [
      {
        id: "t1",
        lane: "extraction",
        priority: 2,
        payload: "Read the pricing table",
        state: "claimed",
        enqueuedat: now,
      },
      {
        id: "t2",
        lane: "indexing",
        priority: 1,
        payload: "Index the footer links",
        state: "queued",
        enqueuedat: now + 1,
      },
      { id: "t3", lane: "extraction", priority: 1, payload: "Read the hero", state: "done", enqueuedat: now + 2 },
    ],
    claims: [
      { agentid: "w1", taskid: "t1", claimedat: now, heartbeatat: now },
      { agentid: "w1", taskid: "t3", claimedat: now + 2, heartbeatat: now + 3 },
    ],
  };
}

/** Builds the mailboxes of the fleet with one unread direct message. */
function mailboxes(): agentmailbox[] {
  return [
    {
      agentid: "w1",
      inbox: [
        {
          id: "m1",
          senderid: "a1",
          recipient: "w1",
          routing: "direct",
          payload: "Start with the table.",
          sentat: now + 1,
        },
      ],
      outbox: [],
      unread: 1,
    },
    {
      agentid: "a1",
      inbox: [],
      outbox: [
        {
          id: "m1",
          senderid: "a1",
          recipient: "w1",
          routing: "direct",
          payload: "Start with the table.",
          sentat: now + 1,
          readat: now + 2,
        },
      ],
      unread: 0,
    },
  ];
}

describe("the multi agent dashboard view panels", () => {
  it("shapes the overview panel with the topology status, the state counts and the killswitch", () => {
    const topology: leaderworker = {
      id: "top1",
      leaderid: "a1",
      workerids: ["w1", "w2"],
      criticids: ["c1"],
      verifierids: ["v1"],
      assignments: [],
      rule: { kind: "first" },
      electedat: now,
    };
    const overview = multiagentoverviewof({
      agents: fleet(),
      queue: queue(),
      topology,
      killswitch: { engaged: true, engagedat: now, reason: "The user halted the swarm." },
      unread: 3,
    });
    expect(overview.topology).toContain("leader a1");
    expect(overview.workers).toBe(2);
    expect(overview.critics).toBe(1);
    expect(overview.verifiers).toBe(1);
    expect(overview.killswitch).toContain("engaged");
    expect(overview.agents).toBe(5);
    expect(overview.active).toBe(3);
    expect(overview.paused).toBe(1);
    expect(overview.stopped).toBe(1);
    expect(overview).toMatchObject({ tasks: 3, queued: 1, claimed: 1, done: 1, unread: 3 });
    const bare = multiagentoverviewof({
      agents: [],
      queue: { lanes: [], priorities: [], completionpolicy: "all", items: [], claims: [] },
      killswitch: { engaged: false },
      unread: 0,
    });
    expect(bare.topology).toBe("no topology elected");
    expect(bare.killswitch).toBe("kill switch disarmed");
  });

  it("shapes the per agent status cards with the live progress and the usage counters", () => {
    const view = multiagentviewof({
      agents: fleet(),
      queue: queue(),
      mailboxes: mailboxes(),
      killswitch: { engaged: false },
      usage: [{ agentid: "w1", tokens: 280, cost: 0.028, steps: 2, updatedat: now }],
      costs: [],
      conflicts: [],
      locks: [],
      escalations: [],
      timeline: [],
      now,
    });
    const scribe = view.cards.find((card) => card.agentid === "w1");
    expect(scribe).toMatchObject({
      name: "Scribe",
      role: "worker",
      state: "active",
      tabid: 102,
      depth: 0,
      currenttask: "Read the pricing table",
      claimed: 1,
      done: 1,
      tokens: 280,
      cost: 0.028,
      steps: 2,
      unread: 1,
    });
    const witness = view.cards.find((card) => card.agentid === "v1");
    expect(witness?.tokens).toBe(0);
    expect(witness?.unread).toBe(0);
  });

  it("shapes the shared queue view with the lane filter and the empty lane state", () => {
    const view = multiagentviewof({
      agents: fleet(),
      queue: queue(),
      mailboxes: mailboxes(),
      killswitch: { engaged: false },
      usage: [],
      costs: [],
      conflicts: [],
      locks: [],
      escalations: [],
      timeline: [],
      now,
    });
    expect(view.queueview.lanes).toEqual(["extraction", "indexing"]);
    expect(view.queueview.rows).toHaveLength(3);
    expect(view.queueview.rows[0]).toMatchObject({
      taskid: "t1",
      lane: "extraction",
      priority: 2,
      state: "claimed",
      holder: "w1",
    });
    const filtered = queuelaneviewof({ queue: queue(), lane: "indexing" });
    expect(filtered.lane).toBe("indexing");
    expect(filtered.rows.map((row) => row.taskid)).toEqual(["t2"]);
    const emptylane = queuelaneviewof({
      queue: { lanes: ["extraction"], priorities: [1], completionpolicy: "all", items: [], claims: [] },
      lane: "extraction",
    });
    expect(emptylane.rows).toEqual([]);
    const unfiltered = queuelaneviewof({ queue: queue(), lane: " " });
    expect(unfiltered.rows).toHaveLength(3);
    expect(unfiltered.lane).toBeUndefined();
  });

  it("shapes the message flow view as one time ordered stream between the agents", () => {
    const flow = messageflowof({ mailboxes: mailboxes() });
    expect(flow.deliveries).toBe(2);
    expect(flow.rows[0]).toMatchObject({
      messageid: "m1",
      senderid: "a1",
      recipient: "w1",
      routing: "direct inbox",
      payload: "Start with the table.",
      read: false,
    });
    expect(flow.rows[1]?.routing).toBe("direct outbox");
    expect(flow.rows[1]?.read).toBe(true);
  });

  it("shapes the conflict and arbitration log from the scans and the live locks", () => {
    const scan: conflictscan = {
      id: "scan1",
      writers: [
        { agentid: "w1", origin: "https://example.com", selector: "#submit" },
        { agentid: "w2", origin: "https://example.com", selector: "#submit" },
      ],
      overlaps: [{ origin: "https://example.com", selector: "#submit", writers: ["w1", "w2"] }],
      suggestedorder: ["w1", "w2"],
      clean: false,
      scannedat: now,
    };
    const lock: resourcelock = {
      key: "https://example.com|#submit",
      holder: "w1",
      kind: "exclusive",
      origin: "https://example.com",
      selector: "#submit",
      acquiredat: now + 1,
    };
    const log = conflictlogof({ conflicts: [scan], locks: [lock] });
    expect(log.open).toBe(1);
    expect(log.rows).toHaveLength(2);
    expect(log.rows[0]).toMatchObject({ source: "lock", key: "https://example.com|#submit" });
    expect(log.rows[1]).toMatchObject({
      source: "conflict",
      key: "https://example.com|#submit",
      writers: ["w1", "w2"],
    });
    const clean = conflictlogof({
      conflicts: [
        {
          id: "scan2",
          writers: [{ agentid: "w1", origin: "https://example.com", selector: "#a" }],
          overlaps: [],
          suggestedorder: [],
          clean: true,
          scannedat: now,
        },
      ],
      locks: [],
    });
    expect(clean.open).toBe(0);
    expect(clean.rows[0]?.detail).toContain("clean");
  });

  it("shapes the cost per agent panel from the accounting the costcert totals feed", () => {
    const usage: agentusage[] = [
      { agentid: "w2", tokens: 90, cost: 0.009, steps: 1, updatedat: now },
      { agentid: "w1", tokens: 280, cost: 0.028, steps: 2, updatedat: now },
    ];
    const totals: swarmcost = { agents: 2, tokens: 370, cost: 0.037, steps: 3, currency: "usd", computedat: now };
    const costview = costperagentof({ usage, totals });
    expect(costview.rows.map((row) => row.agentid)).toEqual(["w1", "w2"]);
    expect(costview.rows[0]).toMatchObject({
      tokens: 280,
      cost: 0.028,
      steps: 2,
      share: Math.round((280 / 370) * 100) / 100,
    });
    expect(costview.total).toMatchObject({ tokens: 370, cost: 0.037, steps: 3, currency: "usd" });
    expect(costview.source).toContain("costcert");
    const empty = costperagentof({ usage: [] });
    expect(empty.rows).toEqual([]);
    expect(empty.total.tokens).toBe(0);
  });

  it("shapes the escalation inbox with the open count and the decided rows", () => {
    const escalations: escalationrecord[] = [
      {
        id: "e1",
        agentid: "w2",
        subject: "The paywall blocks the footer.",
        context: "The read needs the user decision.",
        state: "open",
        raisedat: now,
      },
      {
        id: "e2",
        agentid: "w1",
        subject: "Two rows disagree.",
        context: "The merge needs the policy order.",
        state: "decided",
        decision: "Keep the re-read count.",
        raisedat: now - 1,
        decidedat: now,
      },
    ];
    const inbox = escalationinboxof({ escalations });
    expect(inbox.open).toBe(1);
    expect(inbox.rows[0]).toMatchObject({ escalationid: "e1", agentid: "w2", state: "open" });
    expect(inbox.rows[0]?.decision).toBeUndefined();
    expect(inbox.rows[1]).toMatchObject({ state: "decided", decision: "Keep the re-read count." });
  });

  it("shapes the timeline scrubber over the interleaved events with the positions", () => {
    const actions: swarmaction[] = [
      { id: "x2", kind: "readtext", agentid: "w2", summary: "The background agent read the table.", at: now + 300 },
      {
        id: "x1",
        kind: "click",
        agentid: "w1",
        summary: "The interactive agent opened the pricing page.",
        at: now + 100,
      },
    ];
    const timeline = timelinescrubof({ actions });
    expect(timeline.marks.map((mark) => mark.actionid)).toEqual(["x1", "x2"]);
    expect(timeline.marks[0]?.position).toBe(0);
    expect(timeline.marks[1]?.position).toBe(1);
    expect(timeline.position).toBe(1);
    const positioned = timelinescrubof({ actions, position: 0 });
    expect(positioned.position).toBe(0);
    const empty = timelinescrubof({ actions: [] });
    expect(empty.marks).toEqual([]);
    expect(empty.position).toBe(0);
  });

  it("shapes the aggregate report download and its empty state", () => {
    const report: resultreport = {
      id: "rep1",
      title: "The pricing table read",
      sections: [
        {
          title: "rowcount",
          entries: [{ id: "m1", agentid: "w1", taskid: "t1", key: "rowcount", value: "14", mergedat: now }],
          sources: ["w1"],
        },
      ],
      sources: ["w1", "w2"],
      confidence: "The verifier re-read both counts.",
      createdat: now,
    };
    const download = aggregatereportdownloadof({ report, now: now + 10 });
    expect(download.filename).toBe("devthink-aggregate-rep1.json");
    expect(download.bytes).toBeGreaterThan(10);
    expect(JSON.parse(download.payload)).toMatchObject({ id: "rep1", title: "The pricing table read" });
    expect(download.reason).toContain("2 contributing agents");
    const absent = aggregatereportdownloadof({ now });
    expect(absent).toMatchObject({ filename: "", payload: "", bytes: 0 });
    expect(absent.reason).toContain("No aggregate report exists yet");
  });

  it("shapes the per agent controls the viewer role and the killswitch gate", () => {
    const active = fleet()[1]!;
    expect(
      agentcontrolsof({ agent: active, viewer: { readonly: false }, killswitch: { engaged: false } }),
    ).toMatchObject({ pause: true, resume: false, stop: true, killswitch: true });
    const paused = fleet()[2]!;
    expect(
      agentcontrolsof({ agent: paused, viewer: { readonly: false }, killswitch: { engaged: false } }),
    ).toMatchObject({ pause: false, resume: true, stop: true });
    expect(
      agentcontrolsof({ agent: active, viewer: { readonly: true }, killswitch: { engaged: false } }).reason,
    ).toMatch(/no run role/);
    expect(
      agentcontrolsof({ agent: active, viewer: { readonly: false }, killswitch: { engaged: true, engagedat: now } })
        .reason,
    ).toMatch(/kill switch stays engaged/);
  });

  it("renders read only for observers without the run role and keeps the controls for the operator", () => {
    expect(dashboardviewerof({})).toMatchObject({ readonly: false, controls: true });
    expect(dashboardviewerof({ viewer: { role: "worker" } }).controls).toBe(true);
    const observer = dashboardviewerof({ viewer: { role: "observer" } });
    expect(observer.readonly).toBe(true);
    expect(observer.controls).toBe(false);
    expect(observer.reason).toMatch(/renders read only/);
    expect(dashboardviewerof({ viewer: { role: "worker", readonly: true } }).controls).toBe(false);
  });

  it("shapes the empty state guidance that walks the first multi agent run", () => {
    const empty = dashboardemptyguidanceof({ agents: [] });
    expect(empty.empty).toBe(true);
    expect(empty.guidance.length).toBeGreaterThanOrEqual(4);
    expect(empty.guidance.join(" ")).toMatch(/register/i);
    expect(empty.guidance.join(" ")).toMatch(/lanes/i);
    expect(dashboardemptyguidanceof({ agents: fleet() })).toEqual({ empty: false, guidance: [] });
  });

  it("shapes the topology inventory of the agent registry snapshot", () => {
    const topology: leaderworker = {
      id: "top1",
      leaderid: "a1",
      workerids: ["w1", "w2"],
      criticids: ["c1"],
      verifierids: ["v1"],
      assignments: [],
      rule: { kind: "first" },
      electedat: now,
    };
    const inventory = topologyinventoryof({ agents: fleet(), topology });
    expect(inventory.entries).toHaveLength(5);
    expect(inventory.scenarios).toBe(6);
    expect(inventory.certified).toBe(true);
    expect(inventory.entries.find((entry) => entry.agentid === "a1")?.lane).toBe("leader");
    expect(inventory.entries.find((entry) => entry.agentid === "c1")?.lane).toBe("critic");
    const bare = topologyinventoryof({ agents: [] });
    expect(bare.certified).toBe(false);
    expect(bare.reason).toMatch(/no agent/i);
  });

  it("shapes the full multi agent view with every panel in one call", () => {
    const topology: leaderworker = {
      id: "top1",
      leaderid: "a1",
      workerids: ["w1", "w2"],
      criticids: ["c1"],
      verifierids: ["v1"],
      assignments: [],
      rule: { kind: "first" },
      electedat: now,
    };
    const view = multiagentviewof({
      agents: fleet(),
      queue: queue(),
      mailboxes: mailboxes(),
      topology,
      killswitch: { engaged: false },
      usage: [{ agentid: "w1", tokens: 280, cost: 0.028, steps: 2, updatedat: now }],
      costs: [{ agents: 1, tokens: 280, cost: 0.028, steps: 2, computedat: now }],
      conflicts: [],
      locks: [],
      escalations: [
        {
          id: "e1",
          agentid: "w2",
          subject: "The paywall blocks the footer.",
          context: "The read needs the user decision.",
          state: "open",
          raisedat: now,
        },
      ],
      timeline: [
        { id: "x1", kind: "click", agentid: "w1", summary: "The interactive agent opened the pricing page.", at: now },
      ],
      report: {
        id: "rep1",
        title: "The pricing table read",
        sections: [
          {
            title: "rowcount",
            entries: [{ id: "m1", agentid: "w1", taskid: "t1", key: "rowcount", value: "14", mergedat: now }],
            sources: ["w1"],
          },
        ],
        sources: ["w1"],
        createdat: now,
      },
      viewer: { role: "observer" },
      lane: "extraction",
      now,
    });
    expect(view.overview.leader).toBe("a1");
    expect(view.cards).toHaveLength(5);
    expect(view.queueview.lane).toBe("extraction");
    expect(view.queueview.rows).toHaveLength(2);
    expect(view.messageflow.deliveries).toBe(2);
    expect(view.escalationinbox.open).toBe(1);
    expect(view.timeline.marks).toHaveLength(1);
    expect(view.reportdownload.filename).toBe("devthink-aggregate-rep1.json");
    expect(view.viewer.readonly).toBe(true);
    expect(view.controls.killswitch).toBe(false);
    expect(view.inventory.certified).toBe(true);
  });
});

describe("the dashboard panel resize of the 2.0.2 final polish", () => {
  it("clamps the panel column widths inside the readable minimum and the shared maximum", () => {
    expect(panelwidthbounds).toEqual({ minimum: 280, maximum: 720 });
    expect(clamppanelwidth(480)).toBe(480);
    expect(clamppanelwidth(120)).toBe(280);
    expect(clamppanelwidth(-40)).toBe(280);
    expect(clamppanelwidth(5_000)).toBe(720);
    expect(clamppanelwidth(480.6)).toBe(481);
    expect(clamppanelwidth(Number.NaN)).toBe(280);
    /* a known viewport narrows the ceiling so the sibling column never loses its own minimum */
    expect(clamppanelwidth(700, 900)).toBe(620);
    expect(clamppanelwidth(300, 900)).toBe(300);
    expect(clamppanelwidth(700, 400)).toBe(280);
    /* the resize move applies a pointer delta through the clamp and names whether it clamped */
    const open = resizepanel({ widths: { left: 480 }, delta: 60 });
    expect(open.widths).toEqual({ left: 540 });
    expect(open.clamped).toBe(false);
    const floored = resizepanel({ widths: { left: 480 }, delta: -600 });
    expect(floored.widths).toEqual({ left: 280 });
    expect(floored.clamped).toBe(true);
    const ceiled = resizepanel({ widths: { left: 700 }, delta: 400, viewport: 1_000 });
    expect(ceiled.widths).toEqual({ left: 720 });
    expect(ceiled.clamped).toBe(true);
    const narrowing = resizepanel({ widths: { left: 600 }, delta: 400, viewport: 900 });
    expect(narrowing.widths).toEqual({ left: 620 });
    expect(narrowing.clamped).toBe(true);
  });

  it("round trips the panelwidths preference through the surface layout seam and clamps the stored row", async () => {
    const store = new sessionmemory(new fakeadapter());
    /* the serialize and parse pair keeps the settled split across the round trip while the clamp holds the stored row inside its bounds */
    const widths = resizepanel({ widths: panelwidthsof(undefined), delta: 120 }).widths;
    await store.setsurfacelayout({
      surface: "dashboardpage",
      preferences: { panelwidths: panelwidthslayout(widths) },
      updatedat: now,
    });
    const stored = (await store.getsurfacelayout("dashboardpage"))?.preferences.panelwidths;
    expect(stored).toBe(panelwidthslayout(widths));
    expect(panelwidthsof(stored)).toEqual(widths);
    /* an absent or malformed row keeps the shipped split while a wild value clamps back inside the bounds */
    expect(panelwidthsof(undefined)).toEqual({ left: 480 });
    expect(panelwidthsof("left=5")).toEqual({ left: 280 });
    expect(panelwidthsof("left=99999")).toEqual({ left: 720 });
    expect(panelwidthsof("nonsense")).toEqual({ left: 480 });
    expect(panelwidthsof("left=640", 900)).toEqual({ left: 620 });
    /* the dashboardpage renders the resize handle between the two panel columns with the pointer drag and the keyboard steps persisting the settled split */
    const dashboardpage = await readFile("web/extension/dashboardpage.ts", "utf8");
    expect(dashboardpage).toContain("let panelwidths = panelwidthsof(undefined, viewportwidth());");
    expect(dashboardpage).toContain('document.querySelector<HTMLElement>("#panelresizer")');
    expect(dashboardpage).toContain('panelresizernode.addEventListener("pointerdown"');
    expect(dashboardpage).toContain('panelresizernode.addEventListener("pointermove"');
    expect(dashboardpage).toContain('panelresizernode.addEventListener("pointerup"');
    expect(dashboardpage).toContain('panelresizernode.addEventListener("keydown"');
    expect(dashboardpage).toContain(
      "const move = resizepanel({ widths: dragstartwidths, delta: event.clientX - dragstartx,",
    );
    expect(dashboardpage).toContain(
      "const preferences = { ...(layout.layout?.preferences ?? {}), panelwidths: panelwidthslayout(panelwidths) };",
    );
    const design = await readFile("web/extension/index.html", "utf8");
    expect(design).toContain(
      '<div class="panelresizer" id="panelresizer" role="separator" aria-orientation="vertical"',
    );
    expect(design).toContain('aria-valuemin="280" aria-valuemax="720"');
    for (const panel of [
      "multiagentoverview",
      "agentstatuscards",
      "sharedqueueview",
      "queuelanefilter",
      "messageflow",
      "conflictlog",
      "agentcostpanel",
      "escalationinbox",
      "timelinescrubber",
      "aggregatetimeline",
      "killswitch",
      "reportdownload",
      "sessiongrid",
      "flowlibrary",
      "backgroundruns",
      "historyhits",
      "sitenotes",
      "transparency",
      "onboarding",
      "perfsummary",
      "perfchart",
      "budgetalerts",
      "selectorprofile",
      "dropzone",
      "historyquery",
      "libraryquery",
    ]) {
      expect(design).toContain(`id="${panel}"`);
    }
  });
});
