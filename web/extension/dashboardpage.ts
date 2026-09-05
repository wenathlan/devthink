export {};

/**
 * Dashboardpage runtime of the 1.1.64 family.
 * The dashboardpage opens in a new tab from the popup and the sidepanel and aggregates the sessions, the runs, the notes and the transparency views of the profile workspace; it renders the sessiongrid and the historysearch of the 1.1.63 session interface beside the transparency report of the 1.1.62 family and the onboarding state, and it subscribes to session and run updates through the single broadcast channel so the view stays live without a reload. The 1.1.96 dashdone completion adds the multi agent panels: the overview with the topology status, the per agent status cards with their live progress, the shared queue view with its lane filter, the message flow between the agents, the conflict and arbitration log, the cost per agent panel, the escalation inbox with its answer controls, the kill switch and the per agent pause controls, the timeline scrubber over the interleaved events, the aggregate report download, the read only rendering for observers without the run role and the empty states that guide the first multi agent run.
 */

import type { multiagentview } from "../../dashdone.js";
import { applycontrasttheme, contrasttokensof, panelwidthslayout, panelwidthsof, resizepanel } from "../../views.js";

type sessionview = {
  grid: Array<{ sessionid: string; runid: string; origins: string[]; state: string; outcome: string; steps: number; completed: number; lock: string; tabid?: number; sealhash?: string; updatedat: number; actions: string[] }>;
  notes: Array<{ id: string; origin: string; title: string; body: string; author: string; sensitive: boolean; updatedat: number }>;
  summaries: Array<{ runid: string; origins: string[]; kinds: string[]; steps: number; provenance: string; distilledat: number }>;
};
type transparencyview = {
  grants: Array<{ origin: string; scope: string; boundary: string; grantedat: number }>;
  windows: Array<{ id: string; origin: string; state: string; boundary: string; startedat: number; expiresat: number }>;
  permdiffs: Array<{ fromversion: string; toversion: string; added: string[]; removed: string[]; computedat: number }>;
  safedefaults: Array<{ origin: string; firstseenat: number }>;
};
type dashboardview = { sessionview: sessionview; transparency: transparencyview; onboarding: { stepscompleted: string[]; done: boolean }; environments?: { offscreengranted: boolean; parseoffload: boolean; workers?: number }; security?: { posture?: string }; multiagent?: multiagentview };
type libraryrow = { id: string; title: string; publisher: string; version: string; grants: string[]; sensitive: boolean; state: string; registry?: string };
type backgroundrow = { id: string; workflowid: string; state: string; keepaliveheld: boolean; progress: string };

const statusnode = document.querySelector<HTMLElement>("#status");
const sessiongridroot = document.querySelector<HTMLElement>("#sessiongrid");
const historyhitsroot = document.querySelector<HTMLElement>("#historyhits");
const sitenotesroot = document.querySelector<HTMLElement>("#sitenotes");
const transparencyroot = document.querySelector<HTMLElement>("#transparency");
const onboardingroot = document.querySelector<HTMLElement>("#onboarding");
const historyinput = document.querySelector<HTMLInputElement>("#historyquery");
const libraryroot = document.querySelector<HTMLElement>("#flowlibrary");
const librarystatusnode = document.querySelector<HTMLElement>("#librarystatus");
const libraryinput = document.querySelector<HTMLInputElement>("#libraryquery");
const backgroundrunsroot = document.querySelector<HTMLElement>("#backgroundruns");
/* the multi agent panel roots of the 1.1.96 dashdone completion */
const multiagentoverviewroot = document.querySelector<HTMLElement>("#multiagentoverview");
const multiagentviewernode = document.querySelector<HTMLElement>("#multiagentviewer");
const agentstatuscardsroot = document.querySelector<HTMLElement>("#agentstatuscards");
const sharedqueueviewroot = document.querySelector<HTMLElement>("#sharedqueueview");
const queuelanefilternode = document.querySelector<HTMLSelectElement>("#queuelanefilter");
const multiagentstatusnode = document.querySelector<HTMLElement>("#multiagentstatus");
const messageflowroot = document.querySelector<HTMLElement>("#messageflow");
const conflictlogroot = document.querySelector<HTMLElement>("#conflictlog");
const agentcostpanelroot = document.querySelector<HTMLElement>("#agentcostpanel");
const escalationinboxroot = document.querySelector<HTMLElement>("#escalationinbox");
const timelinescrubbernode = document.querySelector<HTMLInputElement>("#timelinescrubber");
const timelinescrubreadoutnode = document.querySelector<HTMLElement>("#timelinescrubreadout");
const aggregatetimelineroot = document.querySelector<HTMLElement>("#aggregatetimeline");
const killswitchbuttonnode = document.querySelector<HTMLButtonElement>("#killswitch");
const reportdownloadbuttonnode = document.querySelector<HTMLButtonElement>("#reportdownload");

function status(message: string, error = false): void { if (statusnode) { statusnode.textContent = message; statusnode.dataset.state = error ? "error" : "ready"; } }
async function request(message: unknown): Promise<unknown> { const response = await chrome.runtime.sendMessage(message) as { ok: boolean; value?: unknown; error?: string }; if (!response.ok) throw new Error(response.error); return response.value; }
function button(label: string, action: () => Promise<void>): HTMLButtonElement { const element = document.createElement("button"); element.type = "button"; element.className = "secondary"; element.textContent = label; element.addEventListener("click", () => action().catch(error => status(error instanceof Error ? error.message : String(error), true))); return element; }

/** Renders the sessiongrid rows of the 1.1.63 session interface with their resume, cancelrun and reopen actions as deep links. */
function rendersessiongrid(view: sessionview): void {
  if (!sessiongridroot) return;
  sessiongridroot.replaceChildren();
  if (view.grid.length === 0) { sessiongridroot.textContent = "No session exists yet; start the first run from the popup taskinput."; return; }
  const list = document.createElement("ol");
  list.className = "audit";
  for (const row of view.grid) {
    const item = document.createElement("li");
    item.textContent = `${row.state} ${row.runid} — ${row.origins.join(", ")} — ${row.completed}/${row.steps} steps — ${row.outcome} — ${row.lock}${row.sealhash !== undefined ? ` — sealed ${row.sealhash.slice(0, 12)}` : ""}`;
    for (const action of row.actions) item.append(" ", button(action === "cancelrun" ? "Cancel run" : action === "resume" ? "Resume" : "Reopen", async () => {
      await request({ kind: "sessions", grid: action === "cancelrun" ? { open: { runid: row.runid } } : action === "resume" ? { resume: { runid: row.runid } } : { reopen: { runid: row.runid } } });
      if (action === "cancelrun") await request({ kind: "surface", bus: { action: { surface: "dashboardpage", command: "cancelrun" } } });
      status(`The ${action} action of the run ${row.runid} routed through the command bus.`);
      await render();
    }));
    list.append(item);
  }
  sessiongridroot.append(list);
}

/** Renders the historysearch corpus of the 1.1.63 session interface with the matched terms highlighted. */
async function renderhistorysearch(text: string): Promise<void> {
  if (!historyhitsroot) return;
  try {
    const result = await request({ kind: "sessions", search: { query: { text } } }) as { hits: Array<{ source: string; title: string; excerpt: string; highlights: string[]; origin?: string; at: number }> };
    historyhitsroot.replaceChildren();
    if (result.hits.length === 0) { historyhitsroot.append(Object.assign(document.createElement("li"), { textContent: "No history matches yet." })); return; }
    for (const hit of result.hits) {
      const item = document.createElement("li");
      item.textContent = `${hit.source} — ${hit.title}${hit.origin !== undefined ? ` (${hit.origin})` : ""}: ${hit.excerpt}${hit.highlights.length > 0 ? ` [${hit.highlights.join(", ")}]` : ""}`;
      historyhitsroot.append(item);
    }
  } catch (error) { historyhitsroot.textContent = error instanceof Error ? error.message : String(error); }
}

/** Renders the site notes of the session interface with their author provenance. */
function rendersitenotes(view: sessionview): void {
  if (!sitenotesroot) return;
  if (view.notes.length === 0) { sitenotesroot.textContent = "No site note exists yet; write the first note from the sidepanel."; return; }
  sitenotesroot.replaceChildren();
  const list = document.createElement("ul");
  list.className = "audit";
  for (const note of view.notes) list.append(Object.assign(document.createElement("li"), { textContent: `${note.title} (${note.origin}, by ${note.author}${note.sensitive ? ", sealed at rest" : ""}): ${note.body}` }));
  sitenotesroot.append(list);
}

/** Renders the transparency views of the 1.1.62 family: the grants with their boundaries, the window history, the permdiffs and the safedefaults applications. */
function rendertransparency(view: transparencyview): void {
  if (!transparencyroot) return;
  transparencyroot.replaceChildren();
  const grants = document.createElement("p");
  grants.textContent = `Grants: ${view.grants.length} grant row${view.grants.length === 1 ? "" : "s"}${view.grants.length > 0 ? ` (${view.grants.slice(0, 5).map(grant => `${grant.origin} — ${grant.scope} — ${grant.boundary}`).join(" · ")})` : ""}.`;
  const windows = document.createElement("p");
  windows.textContent = `Consent windows: ${view.windows.length} recorded window${view.windows.length === 1 ? "" : "s"}.`;
  const permdiffs = document.createElement("p");
  permdiffs.textContent = `Permdiffs: ${view.permdiffs.length} record${view.permdiffs.length === 1 ? "" : "s"}${view.permdiffs.length > 0 ? ` (latest ${view.permdiffs[0]?.fromversion} → ${view.permdiffs[0]?.toversion})` : ""}.`;
  const safedefaults = document.createElement("p");
  safedefaults.textContent = `Safedefaults applications: ${view.safedefaults.length} origin${view.safedefaults.length === 1 ? "" : "s"} under the reads only posture.`;
  transparencyroot.append(grants, windows, permdiffs, safedefaults);
}

/** Renders the 1.1.68 perf summary of the most recent run beside its step duration chart: the step count, the total and average duration, the query count, the cache hit ratio and the delta share of the run. */
async function renderperfsummary(): Promise<void> {
  const summarynode = document.querySelector<HTMLElement>("#perfsummary");
  const chartnode = document.querySelector<HTMLElement>("#perfchart");
  if (!summarynode || !chartnode) return;
  try {
    const report = await request({ kind: "perf", summary: {} }) as { runid: string; summary: { steps: number; duration: number; average: number; queries: number; cachehits: number; hitratio: number; deltashare: number }; chart: Array<{ stepid: string; duration: number; delta: boolean }>; selcache: { generation: number; entries: number }; queue: { depth: number; deferred: number; peak: number } };
    summarynode.replaceChildren();
    if (report.summary.steps === 0) { summarynode.textContent = "No run measured yet; the perf summary builds from the recorded perf records of the recent runs."; chartnode.textContent = "The step duration chart renders one point per measured step."; return; }
    const line = document.createElement("p");
    line.textContent = `Run ${report.runid}: ${report.summary.steps} measured step${report.summary.steps === 1 ? "" : "s"} · ${report.summary.duration}ms total · ${report.summary.average}ms average · ${report.summary.queries} querie${report.summary.queries === 1 ? "" : "s"} · ${report.summary.cachehits} cache hit${report.summary.cachehits === 1 ? "" : "s"} (ratio ${Math.round(report.summary.hitratio * 100)}%) · ${Math.round(report.summary.deltashare * 100)}% served from deltas · selcache generation ${report.selcache.generation} · worker queue peak ${report.queue.peak}.`;
    summarynode.append(line);
    chartnode.replaceChildren();
    const chart = document.createElement("ol");
    chart.className = "audit";
    const peak = Math.max(...report.chart.map(point => point.duration), 1);
    for (const point of report.chart) {
      const bars = Math.max(Math.round((point.duration / peak) * 10), 1);
      chart.append(Object.assign(document.createElement("li"), { textContent: `${point.stepid} — ${point.duration}ms${point.delta ? " (delta)" : ""} ${"▮".repeat(bars)}` }));
    }
    chartnode.append(chart);
  } catch (error) { summarynode.textContent = error instanceof Error ? error.message : String(error); chartnode.textContent = ""; }
}

/** Renders the 1.1.69 budgetalerts with their thresholds beside the selectorprofile latencies of the profile workspace: every alert names its severity level and its ratio, and every selector bars its average resolution time with its failure rate and its latency flag. */
async function renderbudgetalerts(): Promise<void> {
  const alertnode = document.querySelector<HTMLElement>("#budgetalerts");
  const selectornode = document.querySelector<HTMLElement>("#selectorprofile");
  if (!alertnode || !selectornode) return;
  try {
    const view = await request({ kind: "schedule", view: true }) as { backpressure: { runid: string; behind: number; paused: boolean; window?: number }; alerts: Array<{ runid: string; level: string; kind: string; ratio: number; paused: boolean }>; selectors?: Array<{ selector: string; average: number; count: number; failures: number; flagged: boolean }>; startup?: { duration: number; spent: number; target?: number } };
    alertnode.replaceChildren();
    const line = document.createElement("p");
    line.textContent = `Run budget of ${view.backpressure.runid}: ${view.backpressure.behind} step${view.backpressure.behind === 1 ? "" : "s"} ahead of its outcomes${view.backpressure.window !== undefined ? ` against the user backpressure window of ${view.backpressure.window}` : " with no user window"}${view.startup !== undefined ? ` · cold start ${view.startup.duration}ms with ${view.startup.spent} lazymod${view.startup.spent === 1 ? "" : "s"} at ready${view.startup.target !== undefined ? ` (user target ${view.startup.target}ms)` : ""}` : ""}.`;
    alertnode.append(line);
    if (view.alerts.length === 0) { const empty = document.createElement("p"); empty.textContent = "No budgetalert fired yet; the alerts report the user thresholds and only the critical threshold pauses a run pending a user choice."; alertnode.append(empty); }
    else {
      const alerts = document.createElement("ol");
      alerts.className = "audit";
      for (const alert of view.alerts) alerts.append(Object.assign(document.createElement("li"), { textContent: `${alert.level} ${alert.kind} alert of ${alert.runid} at ${Math.round(alert.ratio * 100)} percent${alert.paused ? " — run paused pending a user choice" : " — reported, the run keeps running"}` }));
      alertnode.append(alerts);
    }
    selectornode.replaceChildren();
    const selectors = view.selectors ?? [];
    if (selectors.length === 0) { selectornode.textContent = "No selectorprofile recorded yet; the chart bars the average resolution latency of every selector the runs resolved."; return; }
    const chart = document.createElement("ol");
    chart.className = "audit";
    const peak = Math.max(...selectors.map(stats => stats.average), 1);
    for (const stats of selectors) {
      const bars = Math.max(Math.round((stats.average / peak) * 10), 1);
      chart.append(Object.assign(document.createElement("li"), { textContent: `${stats.selector} — ${stats.average}ms over ${stats.count} resolution${stats.count === 1 ? "" : "s"} · ${Math.round(stats.failures / stats.count * 100)}% failed${stats.flagged ? " · flagged above the user latency threshold" : ""} ${"▮".repeat(bars)}` }));
    }
    selectornode.append(chart);
  } catch (error) { alertnode.textContent = error instanceof Error ? error.message : String(error); selectornode.textContent = ""; }
}

/** Renders the onboarding state with its replay offer on demand. */
function renderonboarding(onboarding: { stepscompleted: string[]; done: boolean }): void {
  if (!onboardingroot) return;
  onboardingroot.replaceChildren();
  const state = document.createElement("p");
  state.textContent = onboarding.done ? "The onboarding walkthrough is done; replay it on demand from the optionspage." : `The onboarding walkthrough stands at ${onboarding.stepscompleted.length} completed step${onboarding.stepscompleted.length === 1 ? "" : "s"}.`;
  onboardingroot.append(state);
}

/** Renders the flowlibrary browser of the 1.1.66 ecosystem family: every row names its publisher, version and required grants, the entry view shows the full step list before install, the grant diff opens the diff dialog and the install lands as a pending import behind the same review. */
async function renderlibrary(query: string): Promise<void> {
  if (!libraryroot) return;
  try {
    const view = await request({ kind: "ecosystem", library: { browse: { ...(query.trim() !== "" ? { query } : {}) } } }) as { library: libraryrow[] };
    libraryroot.replaceChildren();
    if (view.library.length === 0) { libraryroot.textContent = "No flowlibrary entry matches yet; import a manifest from a file or pull one through a syncbridge hook."; return; }
    const list = document.createElement("ol");
    list.className = "audit";
    for (const row of view.library) {
      const item = document.createElement("li");
      item.textContent = `${row.title} ${row.version} — ${row.publisher}${row.registry !== undefined ? ` — ${row.registry}` : ""} — ${row.state}${row.sensitive ? " — sensitive" : ""} — grants: ${row.grants.join(", ") || "none"}`;
      item.append(" ", button("Steps", async () => {
        const detail = await request({ kind: "ecosystem", library: { entry: { entryid: row.id } } }) as { steps: Array<{ id: string; kind: string; label: string; target?: string; families: string[]; fields: string[] }> };
        if (librarystatusnode) librarystatusnode.textContent = detail.steps.map(step => `${step.id}: ${step.kind} — ${step.label}${step.target !== undefined ? ` (${step.target})` : ""}${step.fields.length > 0 ? ` [${step.families.join(", ")}: ${step.fields.join(", ")}]` : ""}`).join(" · ");
      }));
      item.append(" ", button("Grant diff", async () => {
        const diff = await request({ kind: "ecosystem", library: { grants: { entryid: row.id } } }) as { diff: { added: string[]; kept: string[] } };
        if (librarystatusnode) librarystatusnode.textContent = `Grant diff: added ${diff.diff.added.join(", ") || "none"}, held ${diff.diff.kept.join(", ") || "none"}; the added grants map onto originprofiles before the import completes.`;
      }));
      item.append(" ", button("Install", async () => {
        const result = await request({ kind: "ecosystem", library: { install: { entryid: row.id, ...(row.sensitive ? { consent: true } : {}) } } }) as { record: { id: string; steps: number } };
        if (librarystatusnode) librarystatusnode.textContent = `The install landed as the pending workflow ${result.record.id} with ${result.record.steps} steps; the import review approves its step list before anything runs.`;
        await renderlibrary(query);
      }));
      item.append(" ", button("Fork", async () => {
        const result = await request({ kind: "ecosystem", library: { fork: { entryid: row.id } } }) as { fork: { id: string } };
        if (librarystatusnode) librarystatusnode.textContent = `The fork created the independent local workflow ${result.fork.id}; the fork owns its name from its creation on.`;
      }));
      item.append(" ", button("Remove", async () => {
        await request({ kind: "ecosystem", library: { remove: { entryid: row.id } } });
        if (librarystatusnode) librarystatusnode.textContent = `The entry ${row.id} left the flowlibrary while its local forks stayed untouched.`;
        await renderlibrary(query);
      }));
      list.append(item);
    }
    libraryroot.append(list);
  } catch (error) { libraryroot.textContent = error instanceof Error ? error.message : String(error); }
}

/** Renders the background run queue of the 1.1.66 ecosystem family with its progress and its keepalive hold. */
async function renderbackgroundruns(): Promise<void> {
  if (!backgroundrunsroot) return;
  try {
    const view = await request({ kind: "ecosystem", background: { list: true } }) as { queue: backgroundrow[] };
    backgroundrunsroot.replaceChildren();
    if (view.queue.length === 0) { backgroundrunsroot.textContent = "No background run stands in the queue; queue a reviewed workflow and it keeps executing with the panel closed."; return; }
    const list = document.createElement("ol");
    list.className = "audit";
    for (const row of view.queue) {
      const item = document.createElement("li");
      item.textContent = `${row.state} — ${row.workflowid} — ${row.progress}${row.keepaliveheld ? " — keepalive held" : ""}`;
      if (row.state === "queued") item.append(" ", button("Cancel", async () => { await request({ kind: "ecosystem", background: { cancel: { id: row.id } } }); await renderbackgroundruns(); }));
      list.append(item);
    }
    backgroundrunsroot.append(list);
  } catch (error) { backgroundrunsroot.textContent = error instanceof Error ? error.message : String(error); }
}

/** Renders the multi agent panels of the 1.1.96 dashdone completion from the shaped view the background serves: the overview with the topology status, the per agent status cards with their live progress and controls, the shared queue with its lane filter, the message flow, the conflict and arbitration log, the cost per agent panel, the escalation inbox, the timeline scrubber, the aggregate report download, the viewer mode and the empty states that guide the first multi agent run. */
let currentmultiagent: multiagentview | undefined;
let selectedlane = "";
function rendermultiagent(view: multiagentview | undefined): void {
  currentmultiagent = view;
  if (view === undefined) {
    if (multiagentoverviewroot) multiagentoverviewroot.textContent = "The multi agent view is unavailable; the swarm state read failed.";
    return;
  }
  if (multiagentoverviewroot) {
    multiagentoverviewroot.replaceChildren();
    if (view.empty.empty) {
      const empty = document.createElement("p");
      empty.textContent = "No agent is registered yet; the panels below stay empty until the first multi agent run registers its fleet.";
      multiagentoverviewroot.append(empty);
      const guidance = document.createElement("ol");
      guidance.className = "audit";
      for (const step of view.empty.guidance) guidance.append(Object.assign(document.createElement("li"), { textContent: step }));
      multiagentoverviewroot.append(guidance);
    } else {
      const line = document.createElement("p");
      line.textContent = `Topology: ${view.overview.topology}; ${view.overview.killswitch}. Agents: ${view.overview.agents} (${view.overview.active} active, ${view.overview.paused} paused, ${view.overview.stopped} stopped). Queue: ${view.overview.tasks} task${view.overview.tasks === 1 ? "" : "s"} — ${view.overview.queued} queued, ${view.overview.claimed} claimed, ${view.overview.done} done. Unread messages: ${view.overview.unread}.`;
      multiagentoverviewroot.append(line);
    }
  }
  if (multiagentviewernode) multiagentviewernode.textContent = view.viewer.reason;
  renderagentcards(view);
  rendersharedqueue(view);
  rendermessageflow(view);
  renderconflictlog(view);
  rendercostpanel(view);
  renderescalationinbox(view);
  rendertimeline(view);
}

/** Renders the per agent status cards with their live progress, their usage against the budget and the pause, resume and stop controls the viewer role gates. */
function renderagentcards(view: multiagentview): void {
  if (!agentstatuscardsroot) return;
  agentstatuscardsroot.replaceChildren();
  if (view.cards.length === 0) { agentstatuscardsroot.textContent = "No agent status card exists yet; register the first agents of the fleet from the sidepanel fleet control."; return; }
  const list = document.createElement("ol");
  list.className = "audit";
  for (const card of view.cards) {
    const item = document.createElement("li");
    item.textContent = `${card.state} ${card.name} (${card.agentid}) — ${card.role}, depth ${card.depth}${card.tabid !== undefined ? `, tab ${card.tabid}` : ""}${card.parentid !== undefined ? `, sub agent of ${card.parentid}` : ""}${card.sessionid !== undefined ? `, session ${card.sessionid}` : ""} — ${card.done} done, ${card.claimed} claimed${card.currenttask !== undefined ? `, working on ${card.currenttask}` : ""} — ${card.tokens} token${card.tokens === 1 ? "" : "s"}, ${card.cost} cost, ${card.steps} step${card.steps === 1 ? "" : "s"} — ${card.unread} unread${card.reviewstatus !== undefined ? `, ${card.reviewstatus}` : ""}.`;
    if (view.viewer.controls) {
      if (card.state === "active") item.append(" ", button("Pause", async () => { await request({ kind: "swarmagent", action: "pause", agentid: card.agentid }); status(`The pause of the agent ${card.name} routed through the swarm command; the peers keep running.`); await render(); }));
      if (card.state === "paused") item.append(" ", button("Resume", async () => { await request({ kind: "swarmagent", action: "resume", agentid: card.agentid }); status(`The agent ${card.name} resumed; its peers never changed.`); await render(); }));
      if (card.state !== "stopped") item.append(" ", button("Stop", async () => { await request({ kind: "swarmagent", action: "stop", agentid: card.agentid }); status(`The agent ${card.name} stopped; its claims release through the requeue pass.`); await render(); }));
    }
    list.append(item);
  }
  agentstatuscardsroot.append(list);
}

/** Renders the shared queue view with its lane filter: one row per task with its lane, priority, state and the claim that holds it. */
function rendersharedqueue(view: multiagentview): void {
  if (queuelanefilternode) {
    const lanes = view.queueview.lanes;
    const current = queuelanefilternode.value;
    queuelanefilternode.replaceChildren(Object.assign(document.createElement("option"), { value: "", textContent: "Every lane" }));
    for (const lane of lanes) queuelanefilternode.append(Object.assign(document.createElement("option"), { value: lane, textContent: lane }));
    queuelanefilternode.value = lanes.includes(current) ? current : "";
  }
  if (!sharedqueueviewroot) return;
  sharedqueueviewroot.replaceChildren();
  const rows = view.queueview.rows.filter(row => selectedlane === "" || row.lane === selectedlane);
  if (rows.length === 0) { sharedqueueviewroot.textContent = view.queueview.lanes.length === 0 ? "No lane is configured yet; the shared queue fills when the first multi agent run enqueues its tasks." : `No task sits in the ${selectedlane === "" ? "queue" : `lane ${selectedlane}`} yet; enqueue the shared work from the sidepanel fleet control.`; return; }
  const list = document.createElement("ol");
  list.className = "audit";
  for (const row of rows) list.append(Object.assign(document.createElement("li"), { textContent: `${row.state} ${row.taskid} — lane ${row.lane}, priority ${row.priority} — ${row.payload}${row.holder !== undefined ? ` — claimed by ${row.holder}${row.heartbeatat !== undefined ? ` (heartbeat ${row.heartbeatat})` : ""}` : " — unclaimed"}` }));
  sharedqueueviewroot.append(list);
}

/** Renders the message flow view between agents: every delivered message with its sender, its recipient and its routing kind. */
function rendermessageflow(view: multiagentview): void {
  if (!messageflowroot) return;
  messageflowroot.replaceChildren();
  if (view.messageflow.rows.length === 0) { messageflowroot.textContent = "No message passed between the agents yet; the flow view lists every delivery with its sender, its recipient and its routing kind."; return; }
  const list = document.createElement("ol");
  list.className = "audit";
  for (const row of view.messageflow.rows) list.append(Object.assign(document.createElement("li"), { textContent: `${row.senderid} → ${row.recipient} (${row.routing}) at ${row.sentat}${row.read ? " — read" : " — unread"}: ${row.payload}` }));
  messageflowroot.append(list);
}

/** Renders the conflict and arbitration log panel: the conflict scans with their overlapping writers beside the live resource locks. */
function renderconflictlog(view: multiagentview): void {
  if (!conflictlogroot) return;
  conflictlogroot.replaceChildren();
  if (view.conflictlog.rows.length === 0) { conflictlogroot.textContent = "No conflict and no arbitration case exists yet; the log lists every overlapping write beside the resource locks the swarm holds."; return; }
  const head = document.createElement("p");
  head.textContent = `Open conflicts: ${view.conflictlog.open}.`;
  conflictlogroot.append(head);
  const list = document.createElement("ol");
  list.className = "audit";
  for (const row of view.conflictlog.rows) list.append(Object.assign(document.createElement("li"), { textContent: `${row.source} ${row.key} at ${row.at}: ${row.detail}` }));
  conflictlogroot.append(list);
}

/** Renders the cost per agent panel the costcert totals feed: one row per agent with its tokens, cost and steps beside its share of the swarm total. */
function rendercostpanel(view: multiagentview): void {
  if (!agentcostpanelroot) return;
  agentcostpanelroot.replaceChildren();
  if (view.costview.rows.length === 0) { agentcostpanelroot.textContent = "No cost is recorded per agent yet; the panel sums the same accounting the costcert gate reconciles once the agents spend tokens."; return; }
  const total = document.createElement("p");
  total.textContent = `Swarm totals: ${view.costview.total.tokens} token${view.costview.total.tokens === 1 ? "" : "s"}, ${view.costview.total.cost} cost${view.costview.total.currency !== undefined ? ` ${view.costview.total.currency}` : ""}, ${view.costview.total.steps} step${view.costview.total.steps === 1 ? "" : "s"} — ${view.costview.source}.`;
  agentcostpanelroot.append(total);
  const list = document.createElement("ol");
  list.className = "audit";
  for (const row of view.costview.rows) list.append(Object.assign(document.createElement("li"), { textContent: `${row.agentid}: ${row.tokens} token${row.tokens === 1 ? "" : "s"}, ${row.cost} cost, ${row.steps} step${row.steps === 1 ? "" : "s"} — ${Math.round(row.share * 100)} percent of the token total.` }));
  agentcostpanelroot.append(list);
}

/** Renders the escalation inbox for human review: every escalation with its answer control when the viewer holds the run role. */
function renderescalationinbox(view: multiagentview): void {
  if (!escalationinboxroot) return;
  escalationinboxroot.replaceChildren();
  if (view.escalationinbox.rows.length === 0) { escalationinboxroot.textContent = "No escalation waits for the human; the inbox lists every stalled agent decision that only the user decides."; return; }
  const head = document.createElement("p");
  head.textContent = `Open escalations: ${view.escalationinbox.open}.`;
  escalationinboxroot.append(head);
  const list = document.createElement("ol");
  list.className = "audit";
  for (const row of view.escalationinbox.rows) {
    const item = document.createElement("li");
    item.textContent = `${row.state} ${row.escalationid} — the agent ${row.agentid} asks: ${row.subject} (raised at ${row.raisedat})${row.decision !== undefined ? ` — decided: ${row.decision}` : ""}.`;
    if (view.viewer.controls && row.state === "open") {
      const answer = document.createElement("input");
      answer.placeholder = "The decision the user writes";
      answer.setAttribute("aria-label", `The escalation answer of ${row.escalationid}`);
      item.append(" ", answer, " ", button("Answer", async () => {
        const decision = answer.value.trim();
        if (decision === "") throw new Error("The escalation decision needs the words the user wrote; escalations stay human decided.");
        await request({ kind: "fleet", answer: { id: row.escalationid, decision } });
        status(`The escalation ${row.escalationid} was answered; the hold on the agent ${row.agentid} lifts.`);
        await render();
      }));
    }
    list.append(item);
  }
  escalationinboxroot.append(list);
}

/** Renders the timeline scrubber over the interleaved events: the range input walks the merged fleet timeline and the readout names the mark it rests on. */
function rendertimeline(view: multiagentview): void {
  if (aggregatetimelineroot) {
    aggregatetimelineroot.replaceChildren();
    if (view.timeline.marks.length === 0) { aggregatetimelineroot.textContent = "No interleaved event exists yet; the timeline merges the actions of every agent into one ordered stream once the swarm runs."; }
    else {
      const list = document.createElement("ol");
      list.className = "audit";
      for (const mark of view.timeline.marks) list.append(Object.assign(document.createElement("li"), { textContent: `${mark.agentid ?? "swarm"} ${mark.kind} at ${mark.at} (position ${mark.position}): ${mark.summary}` }));
      aggregatetimelineroot.append(list);
    }
  }
  if (timelinescrubbernode) {
    timelinescrubbernode.max = String(Math.max(view.timeline.marks.length - 1, 0));
    if (timelinescrubbernode.value === "" || Number(timelinescrubbernode.value) > view.timeline.marks.length - 1) timelinescrubbernode.value = String(Math.max(view.timeline.marks.length - 1, 0));
  }
  updatetimelinescrubreadout();
}

/** Updates the timeline scrubber readout with the mark the scrubber rests on. */
function updatetimelinescrubreadout(): void {
  const view = currentmultiagent;
  if (!timelinescrubreadoutnode || view === undefined) return;
  const index = Math.min(Math.max(Number(timelinescrubbernode?.value ?? 0) || 0, 0), Math.max(view.timeline.marks.length - 1, 0));
  const mark = view.timeline.marks[index];
  timelinescrubreadoutnode.textContent = mark === undefined ? "No interleaved event yet." : `${mark.agentid ?? "swarm"} ${mark.kind} at ${mark.at}: ${mark.summary}`;
}

/** Loads the aggregated dashboard view: the sessionview of 1.1.63, the transparency report of 1.1.62, the onboarding state and the multi agent view of the 1.1.96 dashdone completion. */
async function render(): Promise<void> {
  const view = await request({ kind: "surface", dashboard: { view: true } }) as dashboardview;
  rendersessiongrid(view.sessionview);
  rendersitenotes(view.sessionview);
  rendertransparency(view.transparency);
  renderonboarding(view.onboarding);
  rendermultiagent(view.multiagent);
  await renderperfsummary();
  await renderbudgetalerts();
  status(`Dashboard view live: ${view.sessionview.grid.length} run${view.sessionview.grid.length === 1 ? "" : "s"}, ${view.sessionview.notes.length} note${view.sessionview.notes.length === 1 ? "" : "s"}, ${view.transparency.grants.length} grant row${view.transparency.grants.length === 1 ? "" : "s"} and ${view.multiagent?.overview.agents ?? 0} agent${(view.multiagent?.overview.agents ?? 0) === 1 ? "" : "s"}${view.multiagent?.viewer.readonly === true ? " (read only)" : ""}.`);
}

document.querySelector<HTMLButtonElement>("#openpanel")?.addEventListener("click", () => { void chrome.sidePanel.open({ windowId: chrome.windows.WINDOW_ID_CURRENT }).catch(() => { /* the panel opens beside the dashboard tab */ }); });
document.querySelector<HTMLButtonElement>("#openoptions")?.addEventListener("click", () => { void chrome.tabs.create({ url: chrome.runtime.getURL("optionspage.html") }); });
document.querySelector<HTMLButtonElement>("#historyrun")?.addEventListener("click", () => { void renderhistorysearch(historyinput?.value ?? "").catch(error => status(error instanceof Error ? error.message : String(error), true)); });
historyinput?.addEventListener("keydown", event => { if (event.key === "Enter") document.querySelector<HTMLButtonElement>("#historyrun")?.click(); });
document.querySelector<HTMLButtonElement>("#libraryrun")?.addEventListener("click", () => { void renderlibrary(libraryinput?.value ?? "").catch(error => status(error instanceof Error ? error.message : String(error), true)); });
libraryinput?.addEventListener("keydown", event => { if (event.key === "Enter") document.querySelector<HTMLButtonElement>("#libraryrun")?.click(); });
document.querySelector<HTMLButtonElement>("#libraryexport")?.addEventListener("click", () => { void request({ kind: "ecosystem", library: { export: true } }).then(result => { const manifests = (result as { manifests: Array<{ title: string; publisher: string; version: string; digest: string; state: string }> }).manifests; if (librarystatusnode) librarystatusnode.textContent = `The manifest list exported ${manifests.length} entr${manifests.length === 1 ? "y" : "ies"} for audit with digest, publisher, version, state and provenance and no step payload.`; }).catch(error => { if (librarystatusnode) librarystatusnode.textContent = error instanceof Error ? error.message : String(error); }); });
/* the multi agent controls of the 1.1.96 dashdone completion: the lane filter, the kill switch, the aggregate report download and the timeline scrubber */
queuelanefilternode?.addEventListener("change", () => { selectedlane = queuelanefilternode.value; if (currentmultiagent !== undefined) rendersharedqueue(currentmultiagent); if (multiagentstatusnode) multiagentstatusnode.textContent = selectedlane === "" ? "The shared queue view lists every task with its lane, priority, state and the agent that claimed it." : `The lane filter shows only the lane ${selectedlane}; every other lane stays one selection away.`; });
killswitchbuttonnode?.addEventListener("click", () => {
  if (currentmultiagent?.viewer.controls !== true) { status(currentmultiagent?.viewer.reason ?? "The viewer carries no run role; the kill switch control stays unavailable.", true); return; }
  void request({ kind: "swarmagent", killall: true, reason: "The dashboardpage engaged the kill switch." }).then(() => { status("The kill switch engaged: every agent stopped at once, every attributed run cancelled and the queue cleared."); return render(); }).catch(error => status(error instanceof Error ? error.message : String(error), true));
});
reportdownloadbuttonnode?.addEventListener("click", () => {
  const download = currentmultiagent?.reportdownload;
  if (download === undefined || download.payload === "") { status("No aggregate report exists yet; the swarm builds one when the parallel results merge after the review.", true); return; }
  const anchor = document.createElement("a");
  anchor.href = URL.createObjectURL(new Blob([download.payload], { type: "application/json" }));
  anchor.download = download.filename;
  anchor.click();
  URL.revokeObjectURL(anchor.href);
  status(download.reason);
});
timelinescrubbernode?.addEventListener("input", updatetimelinescrubreadout);

/**
 * Dashboard panel resize of the 2.0.2 final polish (roadmap rc.2 item 37): the dashboardcolumns split carries the separator handle between the two panel columns; the pointer drag moves the left column width through the resizepanel clamp (the readable minimum, the shared maximum and a viewport that keeps the sibling column its own minimum), the arrow keys walk the split for the keyboard, the aria value tracks the live width, and every settled split persists as the panelwidths preference through the same surface layout seam the per surface preferences ride.
 */
const dashboardleftnode = document.querySelector<HTMLElement>("#dashboardleft");
const panelresizernode = document.querySelector<HTMLElement>("#panelresizer");
const viewportwidth = (): number | undefined => (typeof window === "undefined" ? undefined : window.innerWidth);
let panelwidths = panelwidthsof(undefined, viewportwidth());

/** Applies the current panelwidths state to the left column and the separator's live aria value. */
function applypanelwidths(): void {
  if (dashboardleftnode) dashboardleftnode.style.width = `${panelwidths.left}px`;
  panelresizernode?.setAttribute("aria-valuenow", String(panelwidths.left));
}

/** Loads the persisted panelwidths preference through the surface layout seam; an absent preference keeps the shipped split. */
async function loadpanelwidths(): Promise<void> {
  try {
    const layout = await request({ kind: "surface", layout: { get: { surface: "dashboardpage" } } }) as { layout?: { preferences?: { panelwidths?: string } } };
    panelwidths = panelwidthsof(layout.layout?.preferences?.panelwidths, typeof window === "undefined" ? undefined : window.innerWidth);
    applypanelwidths();
  } catch { /* an unreadable preference keeps the shipped split */ }
}

/** Persists the current panelwidths state through the surface layout seam, merging into the preferences the surface already stores. */
async function savepanelwidths(): Promise<void> {
  try {
    const layout = await request({ kind: "surface", layout: { get: { surface: "dashboardpage" } } }) as { layout?: { preferences?: Record<string, string> } };
    const preferences = { ...(layout.layout?.preferences ?? {}), panelwidths: panelwidthslayout(panelwidths) };
    await request({ kind: "surface", layout: { set: { surface: "dashboardpage", preferences } } });
    status(`The dashboard panel split of ${panelwidths.left} pixels saved; the columns keep their widths across reloads.`);
  } catch (error) { status(error instanceof Error ? error.message : String(error), true); }
}

if (panelresizernode) {
  let dragstartx = 0;
  let dragstartwidths = panelwidths;
  panelresizernode.addEventListener("pointerdown", event => {
    dragstartx = event.clientX;
    dragstartwidths = panelwidths;
    panelresizernode?.setPointerCapture(event.pointerId);
  });
  panelresizernode.addEventListener("pointermove", event => {
    if (panelresizernode?.hasPointerCapture(event.pointerId) !== true) return;
    const viewport = typeof window === "undefined" ? undefined : window.innerWidth;
    const move = resizepanel({ widths: dragstartwidths, delta: event.clientX - dragstartx, ...(viewport !== undefined ? { viewport } : {}) });
    panelwidths = move.widths;
    applypanelwidths();
  });
  panelresizernode.addEventListener("pointerup", event => {
    if (panelresizernode?.hasPointerCapture(event.pointerId) !== true) return;
    panelresizernode?.releasePointerCapture(event.pointerId);
    void savepanelwidths().catch(() => { /* an unsaved split keeps working until the next write */ });
  });
  panelresizernode.addEventListener("keydown", event => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    const viewport = typeof window === "undefined" ? undefined : window.innerWidth;
    const move = resizepanel({ widths: panelwidths, delta: event.key === "ArrowLeft" ? -16 : 16, ...(viewport !== undefined ? { viewport } : {}) });
    panelwidths = move.widths;
    applypanelwidths();
    void savepanelwidths().catch(() => { /* an unsaved step keeps working until the next write */ });
  });
}
void loadpanelwidths().catch(() => { /* an unreadable preference keeps the shipped split */ });

/** Applies the resolved contrast variant of the 2.0.2 final polish (roadmap rc.2 item 35): the layout preferences seam carries the contrastpreference the optionspage toggle persisted for this surface, and a high preference writes the high contrast token set over the --theme-* custom properties the darklight family resolves — the mode still comes from the theme seam while the default preference keeps the shipped tokens untouched. */
void (async () => {
  try {
    const layout = await request({ kind: "surface", layout: { get: { surface: "dashboardpage" } } }) as { layout?: { preferences?: { contrastpreference?: string } } };
    if (layout.layout?.preferences?.contrastpreference !== "high") return;
    const theme = await request({ kind: "views", theme: { resolve: true } }) as { appearance: { mode: "dark" | "light" } };
    applycontrasttheme(document.documentElement, document.body, contrasttokensof({ mode: theme.appearance.mode, contrast: "high" }), "high");
    status("The high contrast theme is active; the reading tokens answer WCAG AA against the surface.");
  } catch { /* a failing preference read keeps the shipped default tokens */ }
})();

/** The dashboardpage subscribes to session and run updates through the single broadcast channel. */
const surfacechannel: BroadcastChannel | undefined = typeof BroadcastChannel === "function" ? new BroadcastChannel("devthinksurfaces") : undefined;
surfacechannel?.addEventListener("message", () => { void render().catch(() => { /* a failing refresh keeps the last rendered dashboard */ }); });

void render().catch(error => status(error instanceof Error ? error.message : String(error), true));
void renderhistorysearch("").catch(() => { /* an empty first search shows the empty state */ });
void renderlibrary("").catch(() => { /* an empty first browse shows the empty state */ });
void renderbackgroundruns().catch(() => { /* a failing background runs read keeps the last rendered queue */ });

/**
 * Dropimport zone of the 1.1.65 family: the dashboardpage accepts the csv, json and workflow files the user drops with the same file kind detection and the same import path as the optionspage.
 */
const dropzonenode = document.querySelector<HTMLElement>("#dropzone");
const dropstatusnode = document.querySelector<HTMLElement>("#dropstatus");
if (dropzonenode) {
  dropzonenode.addEventListener("dragover", event => { event.preventDefault(); });
  dropzonenode.addEventListener("drop", event => {
    event.preventDefault();
    const file = event.dataTransfer?.files[0];
    if (file === undefined) return;
    void file.text().then(head => request({ kind: "views", dropimport: { file: { filename: file.name, bytes: file.size, head: head.slice(0, 2000) } } })).then(result => {
      const session = (result as { session: { filename: string; kind: string; bytes: number } }).session;
      if (dropstatusnode) dropstatusnode.textContent = `The dropimport detected the ${session.kind} kind of ${session.filename} (${session.bytes} byte${session.bytes === 1 ? "" : "s"}); the import path takes the file from here.`;
    }).catch(error => { if (dropstatusnode) dropstatusnode.textContent = error instanceof Error ? error.message : String(error); });
  });
}
