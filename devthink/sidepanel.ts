import type { securityview as securityviewtype, automationallowlistentry, classconsent, consentwindow, maskrule, originprofile, revokerunevent, sensitiveclass } from "../types.js";
import type { a11ycapture, a11ynode, agentplan, artifactinventoryentry, artifactrecord, auditevent, autosnapshotstate, bannerreport, capabilityreport, captchahandoff, capturepolicy, cleanuprule, cleanuprun, clipboardconsentrecord, clipentry, clickablemap, closedtab, columnspec, consolediff, consoleconsentrecord, controltabstate, curatedlist, dataset, datasetrow, derivedselector, detectionrecord, diagnosticreport, downloadrecord, errorrecord, errorreport, extractsession, fielderror, focusevent, formprofile, listpattern, longtaskentry, mimefilter, mutationevent, navcontrol, navrecord, navqueues, netlogrecord, planprogress, provenancerecord, quarantineentry, ratelimitstate, readercapture, rejectionrecord, resolvedtarget, retryoutcome, safetyverdict, sessiondiff, sessionevent, sessionfolder, sessionrecord, sessionsnapshot, shotpair, snapshotdiff, stepoutcome, streamstate, submitticket, tabbadge, tabgrouprecord, tablayout, tabmeta, tableshape, taskrules, taskstate, timelineentry, toolstep, trailentry, transformrule, typeaheadpick, waitprofilerecord, wizardstate , actionkind, runlogentry, steptemplate, variablescope, workflowprovenance, workflowrecord, workflowrun, editormodel, editornode, editorlayout, exportformat, nestedparam, palettenode, runhistoryentry, siteoverride, steplibraryentry, variablekind, versiondiff, watchdogconfig, watchdogrecord, workflowversion} from "../types.js";
import { addedge, addnode, bindparam, buildsteplibrary, editstep, groupselect, markbreakpoint, minimapfocus, palettecategories, palettenodes, redoedit, removenode, removeedge, renderminimap, reordersteps, searchsteps, snapnode, undoedit, zoomcanvas } from "../workflow.js";
import { switcherlist, type tabshape, type windowshape } from "../commands.js";
import { cardmask } from "../page.js";
import { consentprompttext, denydefaultnotice, profilesummary, sensitiveclassesof } from "../security.js";
import { sortrows } from "../data.js";
import { environmentof } from "../progress.js";
import { applycontrasttheme, contrasttokensof, focusorderof } from "../views.js";

const objective = document.querySelector<HTMLTextAreaElement>("#objective");
const localbutton = document.querySelector<HTMLButtonElement>("#localplan");
const remotebutton = document.querySelector<HTMLButtonElement>("#remoteplan");
const diagnosticbutton = document.querySelector<HTMLButtonElement>("#diagnostic");
const planroot = document.querySelector<HTMLElement>("#plan");
const auditroot = document.querySelector<HTMLElement>("#audit");
const diagnosticroot = document.querySelector<HTMLElement>("#diagnostics");
const maproot = document.querySelector<HTMLElement>("#map");
const a11yroot = document.querySelector<HTMLElement>("#a11y");
const readerroot = document.querySelector<HTMLElement>("#reader");
const detectionsroot = document.querySelector<HTMLElement>("#detections");
const streamroot = document.querySelector<HTMLElement>("#stream");
const diffsroot = document.querySelector<HTMLElement>("#diffs");
const bannersroot = document.querySelector<HTMLElement>("#banners");
const selectorsroot = document.querySelector<HTMLElement>("#selectors");
const trailroot = document.querySelector<HTMLElement>("#trail");
const navigationroot = document.querySelector<HTMLElement>("#navigation");
const tabswindowsroot = document.querySelector<HTMLElement>("#tabswindows");
const formsroot = document.querySelector<HTMLElement>("#forms");
const datasetsroot = document.querySelector<HTMLElement>("#datasets");
const filesroot = document.querySelector<HTMLElement>("#files");
const capturesroot = document.querySelector<HTMLElement>("#captures");
const mediaroot = document.querySelector<HTMLElement>("#media");
const callsroot = document.querySelector<HTMLElement>("#calls");
const trafficroot = document.querySelector<HTMLElement>("#traffic");
const timelineroot = document.querySelector<HTMLElement>("#timeline");
const consolediffroot = document.querySelector<HTMLElement>("#consolediff");
const debuggerroot = document.querySelector<HTMLElement>("#debugger");
const profilingroot = document.querySelector<HTMLElement>("#profiling");
const emulationroot = document.querySelector<HTMLElement>("#emulation");
const netviewroot = document.querySelector<HTMLElement>("#netview");
const sessionsroot = document.querySelector<HTMLElement>("#sessions");
const workflowsroot = document.querySelector<HTMLElement>("#workflows");
const workfloweditorroot = document.querySelector<HTMLElement>("#workfloweditor");
const triggersroot = document.querySelector<HTMLElement>("#triggers");
const agentprotocolroot = document.querySelector<HTMLElement>("#agentprotocol");
const modelsroot = document.querySelector<HTMLElement>("#models");
const agentsroot = document.querySelector<HTMLElement>("#agents");
const environmentsroot = document.querySelector<HTMLElement>("#environments");
const securityroot = document.querySelector<HTMLElement>("#security");
const commandinput = document.querySelector<HTMLInputElement>("#command");
const commandbutton = document.querySelector<HTMLButtonElement>("#commandsend");
const intentbadge = document.querySelector<HTMLElement>("#intentbadge");

/** The swarm view of the context: the overview counts, the agent cards with their roles, tabs, states, budgets, usage meters, current tasks, review statuses and handoff arrows, the shared task queue with its lanes, priorities and claims, the mailboxes with their messages, the blackboard with its sections and live entries, the spawn history, the lifecycle events, the killswitch state and the 1.1.59 orchestration state (topology, splits, critic reviews, verifier checks, review requests, handoff log, locks, conflict scans, merged report, progressboard, escalations, consensus rounds, interleaved timeline and shared costs). */
type swarmview = {
  overview: { agents: number; active: number; paused: number; stopped: number; tasks: number; queued: number; claimed: number; done: number; cancelled: number; messages: number; unread: number };
  agents: Array<{ id: string; name: string; role: string; state: string; depth: number; tabid?: number; parentid?: string; heartbeatat?: number; budget?: { maxtokens?: number; maxcost?: number; maxsteps?: number; currency?: string }; usage?: { tokens: number; cost: number; steps: number }; currenttask?: string; unread: number; reviewstatus?: string; handoffarrows: string[] }>;
  queue: { lanes: string[]; priorities: number[]; completionpolicy: string; items: Array<{ id: string; lane: string; priority: number; payload: string; state: string; enqueuedat: number }>; claims: Array<{ agentid: string; taskid: string; claimedat: number; heartbeatat: number }>; lanesreport: Array<{ lane: string; queued: number; claimed: number; done: number; cancelled: number }>; counts: { queued: number; claimed: number; done: number; cancelled: number }; complete: boolean };
  mailboxes: Array<{ agentid: string; unread: number; inbox: Array<{ id: string; senderid: string; recipient: string; routing: string; payload: string; sentat: number }>; outbox: Array<{ id: string; senderid: string; recipient: string; routing: string; payload: string; sentat: number }> }>;
  blackboard: { sections: Array<{ section: string; entries: number; authors: string[]; freshestat?: number }>; entries: Array<{ id: string; key: string; valuekind: string; value: string; author: string; section: string; consentclass: string; postedat: number }> };
  spawns: Array<{ id: string; parentid: string; childid: string; role: string; depth: number; at: number }>;
  events: Array<{ id: string; kind: string; agentid?: string; taskid?: string; summary: string; at: number }>;
  killswitch: { engaged: boolean; engagedat?: number; reason?: string };
  topology?: { id: string; leaderid: string; workerids: string[]; criticids: string[]; verifierids: string[]; assignments: Array<{ workerid: string; taskid: string; slice: string; assignedat: number }>; rule: { kind: string; agentid?: string }; electedat: number };
  splits: Array<{ id: string; planownerid: string; runownerid: string; taskid?: string; stepreports: Array<{ stepid: string; outcome: string; detail: string; reportedat: number }>; splitat: number }>;
  reviews: Array<{ id: string; reviewerid: string; subjectagentid: string; taskid?: string; verdict: string; issues: string[]; requiredchanges: string[]; reviewedat: number }>;
  verifications: Array<{ id: string; verifierid: string; claimagentid: string; taskid?: string; claim: string; method: string; outcome: string; evidence?: string; checkedat: number }>;
  reviewrequests: Array<{ id: string; fromagentid: string; toagentid: string; subject: string; payload: string; state: string; requestedat: number; ackedat?: number; answeredat?: number; timeoutat?: number }>;
  handoffs: Array<{ id: string; fromagentid: string; toagentid: string; tabid?: number; taskstate: string; state: string; reason?: string; createdat: number; transferredat?: number; resumedat?: number }>;
  locks: Array<{ key: string; holder: string; kind: string; origin: string; selector: string; acquiredat: number; expiresat?: number }>;
  conflicts: Array<{ id: string; writers: Array<{ agentid: string; origin: string; selector: string; taskid?: string }>; overlaps: Array<{ origin: string; selector: string; writers: string[] }>; suggestedorder: string[]; clean: boolean; scannedat: number }>;
  report?: { id: string; title: string; sections: Array<{ title: string; entries: Array<{ id: string; agentid: string; taskid?: string; key: string; value: string; conflict?: string; mergedat: number }>; sources: string[] }>; sources: string[]; confidence?: string; createdat: number };
  board: { id: string; builtat: number; lanes: Array<{ agentid: string; name: string; role: string; state: string; lane: string; currenttask?: string; milestones: Array<{ label: string; done: boolean; at?: number }> }> };
  escalations: Array<{ id: string; agentid: string; subject: string; context: string; state: string; decision?: string; raisedat: number; decidedat?: number }>;
  consensus: Array<{ id: string; subject: string; votes: Array<{ agentid: string; vote: string; votedat: number }>; quorum: number; state: string; openedat: number; closedat?: number }>;
  timeline: Array<{ id: string; kind: string; agentid?: string; summary: string; at: number }>;
  costs: Array<{ agents: number; tokens: number; cost: number; steps: number; currency?: string; computedat: number }>;
};

/** The llm integration view of the context: the providers, the local endpoint, the routing table, the drafts and replans under review, the reflection notes, the cost budget with its usage meter, the prompt library, the last parsed command, the guard refusal notices and the active model per task kind. */
type llmview = { providers: Array<{ id: string; name: string; endpoint: string; style: string; models: string[]; authref?: { name: string }; status: string; lastcheckedat?: number; costpermilliontokens?: number; currency?: string }>; local?: { endpoint: string; model: string; style: string; health?: { checkedat: number; ok: boolean; detail?: string } }; routes: Array<{ id: string; kind: string; providerid: string; model: string; fallbackproviderid?: string; fallbackmodel?: string; revision: number }>; routehistory: Array<{ kind: string; providerid: string; model: string; revision: number; updatedat: number }>; drafts: Array<{ id: string; goal: string; steps: Array<{ id: string; kind: string; target?: string; value?: string; summary: string; freshreview?: boolean }>; openquestions: string[]; providerid: string; model: string; state: string; lintfindings: string[]; createdat: number }>; replans: Array<{ id: string; draftid: string; completedstepids: string[]; failedstepids: string[]; tail: Array<{ id: string; kind: string; summary: string; freshreview?: boolean }>; reason: string; state: string; createdat: number }>; notes: Array<{ id: string; runid: string; stepid: string; outcome: string; lesson: string; advice: string; model: string; createdat: number }>; budget?: { maxtokens?: number; maxcost?: number; currency?: string }; usage: { prompttokens: number; completiontokens: number; totaltokens: number; cost: number; calls: number }; templates: Array<{ id: string; name: string; body: string; variables: string[]; version: number; notes?: string }>; parse?: { text: string; intent: string; entities: Array<{ name: string; value: string }>; confidence: number; model?: string }; guardnotices: Array<{ raw: string; verdict: string; reason?: string; attempts: number }>; tasks: Array<{ kind: string; provider?: string; model?: string }>; toolbriefs: string };
const triggerview = { manual: undefined as { id: string; workflowid: string; preview: Array<{ stepid: string; kind: string; label: string; block?: string; control?: Record<string, unknown> }>; at: number } | undefined, history: undefined as Array<{ id: string; ruleid: string; at: number; cause: string; url?: string; title?: string }> | undefined };
/** Sessions view state: the search term and time window, the two diff selections, the pending restore review and the pending import review. */
const sessionsview = { term: "", window: "all" as "all" | "hour" | "day" | "week", diffselection: [] as string[], restorereview: undefined as sessionrecord | undefined, importreview: undefined as { records: Array<{ id: string; name: string; tabs: number }>; file: unknown } | undefined };
const workflowview = { review: undefined as { workflowid: string; name: string; risk: string; steps: Array<{ id: string; kind: string; label: string; block?: string; target?: string; bindings?: unknown[]; expression?: { operator: string; result: string }; extract?: { groups: string[] }; control?: { kind: string; paths?: string[]; elsepath?: string; list?: string; item?: string; index?: string; bound?: number; selector?: string; branches?: string[]; strategy?: string; onfail?: string; attempts?: number; backoff?: string; rerun?: boolean; stepms?: number; runms?: number; expression?: string } }> } | undefined, selected: "" as string };
/** Workflow editor view state: the open canvas model with its undo and redo stacks, the node selection, the open step inspector, the palette and step library search terms, the run history filters with the last report, the pending import review and the version diff selection. */
const editorview = {
  workflowid: "" as string,
  model: undefined as editormodel | undefined,
  selected: [] as string[],
  inspector: "" as string,
  palettesearch: "",
  librarysearch: "",
  stepsearch: "",
  historyfilter: { workflowid: "", outcome: "" },
  history: undefined as runhistoryentry[] | undefined,
  importreview: undefined as { importid: string; workflowid: string; name: string; version: number; risk: string; steps: Array<{ id: string; kind: string; label: string; block?: string; target?: string }> } | undefined,
  diff: undefined as versiondiff | undefined,
  library: undefined as steplibraryentry[] | undefined,
  palette: undefined as palettenode[] | undefined,
};
const statusnode = document.querySelector<HTMLElement>("#status");
const progressnode = document.querySelector<HTMLProgressElement>("#planprogress");
const capabilitiestext = document.querySelector<HTMLElement>("#capabilitiestext");

type previewresult = { ok: boolean; summary: string; resolvedtarget?: resolvedtarget; candidates?: string[] };
const previews = new Map<string, previewresult>();

/** Live timeline view filters: level, source and step id; the filters stay user choices of the review panel. */
const timelinefilter = { level: "", source: "", stepid: "" };

/** The last console diff result rendered by the diff view. */
let lastdiff: consolediff | undefined;

/** Safely reads the reviewed options object of one step. */
function options(step: toolstep): Record<string, unknown> {
  if (!step.options) return {};
  try {
    const parsed = JSON.parse(step.options);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? (parsed as Record<string, unknown>) : {};
  } catch { return {}; }
}

function status(message: string, error = false): void { if (statusnode) { statusnode.textContent = message; statusnode.dataset.state = error ? "error" : "ready"; } }
async function request(message: unknown): Promise<unknown> { const response = await chrome.runtime.sendMessage(message) as { ok: boolean; value?: unknown; error?: string }; if (!response.ok) throw new Error(response.error); return response.value; }
function button(label: string, action: () => Promise<void>, disabled = false): HTMLButtonElement { const element = document.createElement("button"); element.type = "button"; element.textContent = label; element.disabled = disabled; element.addEventListener("click", () => action().catch(error => status(error instanceof Error ? error.message : String(error), true))); return element; }

/** Builds one plain text line paragraph the empty-state branches of the session interface family append (the 2.0.9 end-to-end run caught the family calling a line helper that never existed, so every empty branch answered `line is not defined` and aborted the refresh). */
function line(text: string): HTMLParagraphElement { const element = document.createElement("p"); element.textContent = text; return element; }


/** Kinds addressable by a css target or a reviewed targetref; only these can be previewed. */
const previewkinds = ["focus", "inspect", "click", "type", "scroll", "select", "hover", "clickdeep", "rightclick", "doubleclick", "drag", "drop", "upload", "clear", "check", "uncheck", "toggle", "submit", "readattribute", "readstyle", "readgeometry", "readvalue", "readtext", "readhtml", "countelements", "readtable", "highlight", "setattribute", "removeattribute", "waitfor", "shiftclick", "typetime", "appendtext", "setvalue", "typeedit", "submitsearch", "selectmulti", "chooseradio", "setslider", "setdate", "setcolor", "expanddetails", "verifyvisible", "verifyenabled", "pierceshadow", "clickpoint", "clicktext", "clickaria", "clickname", "resolvexpath", "deriveselector", "fingerprintsection", "submitform", "retryform", "selectchain", "picktypeahead", "pickdate", "attachfile", "fillcode", "consentpassword"];

/** Topic rows that group the new interaction and observation kinds inside each risk class. */
const topictags: Array<{ topic: string; kinds: string[] }> = [
  { topic: "pointer", kinds: ["movepointer", "clickpoint", "shiftclick", "clicktext", "clickaria", "clickname", "pierceshadow"] },
  { topic: "typing", kinds: ["typetime", "appendtext", "setvalue", "typeedit", "submitsearch"] },
  { topic: "keys", kinds: ["keyhold", "keyrelease"] },
  { topic: "controls", kinds: ["selectmulti", "chooseradio", "setslider", "setdate", "setcolor", "expanddetails"] },
  { topic: "dialogs", kinds: ["dismissdialog"] },
  { topic: "frames", kinds: ["enterframe"] },
  { topic: "retry", kinds: ["retryaction"] },
  { topic: "reads", kinds: ["mapclicks", "verifyvisible", "verifyenabled", "resolvexpath"] },
  { topic: "observation", kinds: ["a11ytree", "readvisible", "readertree", "readoutline", "readselection", "readopengraph", "readlang", "detectlanguage", "listshadow", "listframes", "readscrollpos"] },
  { topic: "detection", kinds: ["detectlists", "detecttables", "detectinfinitescroll", "detectvirtual", "detectlazy", "detectsticky", "detectscrolllock", "countpages", "classifypage", "fingerprintsection"] },
  { topic: "watch", kinds: ["watchmutate", "watchbanner", "watchfocus", "waitquiet", "readjson", "diffsnapshots", "deriveselector"] },
  { topic: "navigation", kinds: ["openlink", "openprivate", "reloadcache", "stopnav", "waitload", "waiturl", "followlink", "spanav", "spawait", "rewritequery", "setfragment", "navlist", "navprofile", "detecthttp", "readredirects", "readfinalurl", "handleauth", "printpdf", "prefetch", "preconnect", "deeplink", "reopentab", "trailaudit", "pausenav", "navintent", "navrate", "openclipboard", "checksafe", "batchopen"] },
  { topic: "tabs", kinds: ["querytabs", "duplicatetab", "closepattern", "pintab", "mutetab", "movetab", "movetabwindow", "grouptabs", "colorgroup", "collapsegroup", "discardtab", "reloadtabs", "zoomin", "zoomout", "watchtab", "switchtab", "maximizewindow", "minimizewindow", "restorewindow", "focuswindow", "scratchwindow", "incognitowindow", "restoretab", "savelayout", "restorelayout", "findclones", "searchtabs", "badgetab", "attachmeta", "listaudio", "reopenrun", "snapshotsession"] },
  { topic: "forms", kinds: ["fillform", "filllabel", "fillplaceholder", "detectfields", "generatevalues", "saveprofiles", "asksubmit", "submitform", "readerrors", "retryform", "runwizard", "selectchain", "picktypeahead", "pickdate", "attachfile", "handoffcaptcha", "fillcard", "fillcode", "consentpassword", "skiphoneypot", "detectlogin", "detecttemplate"] },
];

function steptopic(kind: string): string | undefined {
  return topictags.find(tag => tag.kinds.includes(kind))?.topic;
}

/** Renders plan completion as a live progress ratio. */
function renderprogress(plan: agentplan, completed: string[]): void {
  if (!progressnode) return;
  const total = plan.steps.length || 1;
  progressnode.max = total;
  progressnode.value = completed.length;
  progressnode.textContent = `${completed.length} of ${plan.steps.length} reviewed steps executed`;
}

/** Renders the latest structured outcome of one step beside its review entry. */
function renderoutcome(step: toolstep, outcomes: stepoutcome[]): HTMLElement | null {
  const outcome = [...outcomes].reverse().find(item => item.stepid === step.id && item.ok) ?? [...outcomes].reverse().find(item => item.stepid === step.id);
  if (!outcome) return null;
  const node = document.createElement("details");
  node.className = "outcome";
  const summary = document.createElement("summary");
  summary.textContent = `${outcome.ok ? "result" : "failure"}: ${outcome.summary}`;
  node.append(summary);
  if (outcome.details && Object.keys(outcome.details).length > 0) {
    const payload = document.createElement("pre");
    payload.textContent = JSON.stringify(outcome.details, null, 2).slice(0, 4000);
    node.append(payload);
  }
  return node;
}

/** Renders the hold id of a key hold or release step beside its summary. */
function holddetail(step: toolstep): string {
  if (step.kind === "keyhold") {
    const holdid = options(step).holdid;
    return typeof holdid === "string" && holdid ? ` · hold id ${holdid}` : "";
  }
  if (step.kind === "keyrelease") return step.value ? ` · releases hold id ${step.value}` : "";
  return "";
}

/** Renders the retry attempts of one retry step on the step timeline. */
function retrydetail(step: toolstep, retries: retryoutcome[]): HTMLElement | null {
  const latest = [...retries].reverse().find(item => item.stepid === step.id);
  if (!latest) return null;
  const node = document.createElement("p");
  node.className = "timeline";
  node.textContent = `retry timeline: ${latest.attempts} attempt${latest.attempts === 1 ? "" : "s"} · ${latest.movement.toFixed(1)} px movement · ${latest.ok ? "succeeded" : "failed"}`;
  return node;
}

/** Renders the network quiet progress of one waitquiet step from its outcome evidence. */
function quietdetail(step: toolstep, outcomes: stepoutcome[]): HTMLElement | null {
  if (step.kind !== "waitquiet") return null;
  const latest = [...outcomes].reverse().find(outcome => outcome.stepid === step.id);
  if (!latest) return null;
  const samples = Array.isArray(latest.details?.samples) ? latest.details?.samples as Array<{ at: number; quietfor: number }> : [];
  const idle = typeof latest.details?.idle === "number" ? latest.details?.idle : 0;
  const last = samples[samples.length - 1];
  const node = document.createElement("p");
  node.className = "timeline";
  node.textContent = `network quiet: ${samples.length} sample${samples.length === 1 ? "" : "s"} · quiet for ${Math.round(last?.quietfor ?? 0)} ms · idle threshold ${idle} ms · ${latest.ok ? "quiet reached" : "still busy"}`;
  return node;
}

/** Renders the per iteration row variables of one looprows step on the step timeline. */
function loopdetail(step: toolstep, progress: planprogress | undefined): HTMLElement | null {
  if (step.kind !== "looprows") return null;
  const iterations = (progress?.outcomes ?? []).filter(outcome => outcome.stepid === step.id && outcome.details?.iteration !== undefined);
  if (iterations.length === 0) return null;
  const node = document.createElement("p");
  node.className = "timeline";
  const latest = iterations[iterations.length - 1];
  if (!latest) return null;
  const variables = latest.details?.variables as Record<string, string> | undefined;
  const shown = variables ? Object.entries(variables).slice(0, 4).map(([key, value]) => `${key}=${value}`).join(", ") : "";
  node.textContent = `loop timeline: ${iterations.length} iteration${iterations.length === 1 ? "" : "s"} · ${String(latest.details?.variable ?? "row")} variables ${shown}`;
  return node;
}

/** Renders the navlist progress of one navlist step with the current url and the remaining count. */
function navlistdetail(step: toolstep, progress: planprogress | undefined, outcomes: stepoutcome[]): HTMLElement | null {
  if (step.kind !== "navlist") return null;
  const entries = (progress?.outcomes ?? []).filter(outcome => outcome.stepid === step.id && outcome.details?.naventry !== undefined).map(outcome => outcome.details?.naventry as { index: number; url: string; ok: boolean });
  const total = entries.length > 0 ? Math.max(...entries.map(entry => entry.index)) + 1 : 0;
  const latestoutcome = [...outcomes].reverse().find(outcome => outcome.stepid === step.id);
  const remaining = typeof latestoutcome?.details?.remaining === "number" ? latestoutcome.details?.remaining : 0;
  const current = entries[entries.length - 1];
  const node = document.createElement("p");
  node.className = "timeline";
  node.textContent = entries.length === 0
    ? "navigation list: no entry completed yet"
    : `navigation list: ${entries.filter(entry => entry.ok).length} of ${total} entries completed · current url ${current?.url ?? ""} · ${remaining} remaining`;
  return node;
}

/** Renders the redirect chain and final url of one navigation step from its outcome evidence. */
function redirectdetail(step: toolstep, outcomes: stepoutcome[]): HTMLElement | null {
  if (!["navigate", "followlink", "spanav", "navlist", "openlink", "reloadcache"].includes(step.kind)) return null;
  const latest = [...outcomes].reverse().find(outcome => outcome.stepid === step.id && outcome.details?.hops !== undefined);
  if (!latest) return null;
  const hops = typeof latest.details?.hops === "number" ? latest.details?.hops : 0;
  const final = typeof latest.details?.finalurl === "string" ? latest.details?.finalurl : "";
  const node = document.createElement("p");
  node.className = "timeline";
  node.textContent = `redirects: ${Math.max(0, hops - 1)} hop${hops - 1 === 1 ? "" : "s"} · final url ${final || "unknown"}`;
  return node;
}

/** Renders the resolved target details of one previewed interaction step before approval. */
function renderpreview(step: toolstep): HTMLElement | null {
  const preview = previews.get(step.id);
  if (!preview) return null;
  const node = document.createElement("details");
  node.className = "outcome";
  const summary = document.createElement("summary");
  summary.textContent = `preview: ${preview.summary}`;
  node.append(summary);
  if (preview.resolvedtarget) {
    const payload = document.createElement("pre");
    payload.textContent = JSON.stringify(preview.resolvedtarget, null, 2);
    node.append(payload);
  }
  if (preview.candidates && preview.candidates.length > 1) {
    const chooser = document.createElement("p");
    chooser.textContent = "Ambiguous resolution; choose one candidate as the target hint:";
    node.append(chooser);
    for (const candidate of preview.candidates) {
      node.append(" ", button(`Choose "${candidate}"`, async () => { pickhint(`target hint: ${candidate}`); }));
    }
  }
  return node;
}

function stepitem(plan: agentplan, step: toolstep, completed: string[], outcomes: stepoutcome[], retries: retryoutcome[], progress?: planprogress): HTMLLIElement {
  const item = document.createElement("li");
  const done = completed.includes(step.id);
  item.textContent = `${done ? "✓" : ""} ${step.summary}${holddetail(step)}`;
  const environmentbadge = progress?.planid === plan.id ? environmentof(progress, plan.id, step.id) ?? step.environment : step.environment;
  if (environmentbadge !== undefined) {
    const badge = document.createElement("span");
    badge.className = "muted";
    badge.textContent = ` [${environmentbadge}]`;
    item.append(badge);
  }
  const outcome = renderoutcome(step, outcomes);
  if (outcome) item.append(outcome);
  const timeline = step.kind === "retryaction" ? retrydetail(step, retries) : quietdetail(step, outcomes);
  if (timeline) item.append(timeline);
  const navlist = navlistdetail(step, progress, outcomes);
  if (navlist) item.append(navlist);
  const loopvars = loopdetail(step, progress);
  if (loopvars) item.append(loopvars);
  const redirects = redirectdetail(step, outcomes);
  if (redirects) item.append(redirects);
  const preview = renderpreview(step);
  if (preview) item.append(preview);
  const hastarget = Boolean(step.target) || options(step).targetref !== undefined;
  if (!done && hastarget && previewkinds.includes(step.kind) && ["pending", "approved"].includes(plan.state)) item.append(" ", button("Preview current target", async () => { const result = await request({ kind: "preview", stepid: step.id }) as previewresult; previews.set(step.id, result); status(result.summary); await refresh(); }));
  if (!done && plan.state === "approved") item.append(" ", button("Run this reviewed step", async () => { const result = await request({ kind: "execute", stepid: step.id }) as { summary: string }; status(result.summary); await refresh(); }));
  return item;
}

function steplist(plan: agentplan, steps: toolstep[], completed: string[], outcomes: stepoutcome[], retries: retryoutcome[], risk: toolstep["risk"], progress?: planprogress): HTMLElement | null {
  const group = steps.filter(step => step.risk === risk);
  if (group.length === 0) return null;
  const section = document.createElement("section");
  const heading = document.createElement("h3");
  heading.textContent = `${risk} steps`;
  section.append(heading);
  const general = group.filter(step => steptopic(step.kind) === undefined);
  if (general.length > 0) {
    const list = document.createElement("ol");
    for (const step of general) list.append(stepitem(plan, step, completed, outcomes, retries, progress));
    section.append(list);
  }
  for (const tag of topictags) {
    const tagged = group.filter(step => steptopic(step.kind) === tag.topic);
    if (tagged.length === 0) continue;
    const row = document.createElement("h4");
    row.textContent = `${tag.topic} steps`;
    section.append(row);
    const list = document.createElement("ol");
    for (const step of tagged) list.append(stepitem(plan, step, completed, outcomes, retries, progress));
    section.append(list);
  }
  return section;
}

function renderplan(plan?: agentplan, progress?: planprogress, outcomes: stepoutcome[] = [], retries: retryoutcome[] = []): void {
  if (!planroot) return;
  planroot.replaceChildren();
  if (!plan) { planroot.textContent = "Start a session, then request a local or endpoint plan. No task runs before review."; if (progressnode) progressnode.value = 0; return; }
  const title = document.createElement("h2"); title.textContent = `${plan.state}: ${plan.objective}`; planroot.append(title);
  const completed = progress?.planid === plan.id ? progress.completedsteps : [];
  renderprogress(plan, completed);
  const sensitive = steplist(plan, plan.steps, completed, outcomes, retries, "sensitive", progress);
  const interaction = steplist(plan, plan.steps, completed, outcomes, retries, "interaction", progress);
  const read = steplist(plan, plan.steps, completed, outcomes, retries, "read", progress);
  for (const group of [sensitive, interaction, read]) if (group) planroot.append(group);
  if (plan.state === "pending") { planroot.append(button("Approve reviewed plan", async () => { await request({ kind: "approve" }); await refresh(); }), button("Reject plan", async () => { await request({ kind: "reject" }); await refresh(); })); }
  if (plan.state === "completed" && plan.completedat) { const note = document.createElement("p"); note.textContent = "Every reviewed step has executed and the plan is closed."; planroot.append(note); }
}

/** Records one clickable map entry or candidate as the target hint for the next plan. */
function pickhint(hint: string): void {
  if (objective) objective.value = objective.value ? `${objective.value}\n${hint}` : hint;
  status(`${hint} recorded as the target hint for the next plan.`);
}

/** Renders the clickable map as a numbered list beside the plan and lets the user pick entries. */
function rendermap(map?: clickablemap): void {
  if (!maproot) return;
  maproot.replaceChildren();
  if (!map || map.entries.length === 0) { maproot.textContent = "Run a mapclicks step to number every clickable element on the page."; return; }
  for (const entry of map.entries) {
    const item = document.createElement("li");
    const pick = document.createElement("button");
    pick.type = "button";
    pick.textContent = `${entry.number}. ${entry.label || entry.selector} (${entry.role})`;
    pick.addEventListener("click", () => pickhint(`target hint: ${entry.selector} (map entry ${entry.number}, ${entry.label || entry.role})`));
    item.append(pick);
    maproot.append(item);
  }
}

/** Renders the latest accessibility tree beside the dom snapshot as indented role lines. */
function rendera11y(capture?: a11ycapture): void {
  if (!a11yroot) return;
  a11yroot.replaceChildren();
  if (!capture) { a11yroot.textContent = "Run an a11ytree step to capture the accessibility tree beside the dom snapshot."; return; }
  const lines: string[] = [];
  const walk = (node: a11ynode, depth: number): void => {
    if (lines.length >= 80) return;
    const states = node.states.length > 0 ? ` [${node.states.join(", ")}]` : "";
    const value = node.value !== undefined ? ` = ${node.value}` : "";
    lines.push(`${"· ".repeat(depth)}${node.role}: ${node.name || "(unnamed)"}${states}${value}`);
    for (const child of node.children) walk(child, depth + 1);
  };
  walk(capture.tree, 0);
  const payload = document.createElement("pre");
  payload.textContent = lines.join("\n");
  a11yroot.append(payload);
}

/** Renders the latest reader view text with heading blocks highlighted. */
function renderreader(capture?: readercapture): void {
  if (!readerroot) return;
  readerroot.replaceChildren();
  if (!capture) { readerroot.textContent = "Run a readertree step to extract the reader view."; return; }
  const title = document.createElement("p");
  title.textContent = `${capture.article.title || "Untitled"}${capture.article.byline ? ` · ${capture.article.byline}` : ""} · ${capture.article.words} words · ${capture.article.blocks.length} blocks`;
  readerroot.append(title);
  for (const block of capture.article.blocks.slice(0, 40)) {
    const line = document.createElement("p");
    line.className = /^h\d$/.test(block.kind) ? "readerblock heading" : "readerblock";
    line.textContent = `${block.kind}: ${block.text.slice(0, 200)}`;
    readerroot.append(line);
  }
}

/** Shows detected lists, tables and pagination shapes as plan suggestions the user can pick. */
function renderdetections(plan: agentplan | undefined, outcomes: stepoutcome[]): void {
  if (!detectionsroot) return;
  detectionsroot.replaceChildren();
  if (!plan) { detectionsroot.textContent = "Detection steps list their detected lists, tables and pagination shapes here as suggestions."; return; }
  const kindof = (stepid: string): string | undefined => plan.steps.find(step => step.id === stepid)?.kind;
  const latest = (kind: string): stepoutcome | undefined => [...outcomes].reverse().find(outcome => outcome.ok && kindof(outcome.stepid) === kind);
  let shown = 0;
  const listoutcome = latest("detectlists");
  const lists = Array.isArray(listoutcome?.details?.lists) ? listoutcome?.details?.lists as listpattern[] : [];
  for (const pattern of lists.slice(0, 6)) {
    const item = document.createElement("li");
    const pick = document.createElement("button");
    pick.type = "button";
    pick.textContent = `list of ${pattern.repeat} items · ${pattern.itemselector}`;
    pick.addEventListener("click", () => pickhint(`target hint: ${pattern.itemselector} (repeated list item of ${pattern.container})`));
    item.append(pick);
    detectionsroot.append(item);
    shown += 1;
  }
  const tableoutcome = latest("detecttables");
  const tables = Array.isArray(tableoutcome?.details?.tables) ? tableoutcome?.details?.tables as tableshape[] : [];
  for (const table of tables.slice(0, 6)) {
    const item = document.createElement("li");
    const pick = document.createElement("button");
    pick.type = "button";
    pick.textContent = `table of ${table.rows} rows · ${table.columns.length} columns · ${table.selector}`;
    pick.addEventListener("click", () => pickhint(`target hint: ${table.selector} (detected data table)`));
    item.append(pick);
    detectionsroot.append(item);
    shown += 1;
  }
  const paginationoutcome = latest("countpages");
  if (paginationoutcome) {
    const item = document.createElement("li");
    const current = typeof paginationoutcome.details?.current === "number" ? paginationoutcome.details?.current : 0;
    const total = typeof paginationoutcome.details?.total === "number" ? paginationoutcome.details?.total : 0;
    const text = document.createElement("span");
    text.textContent = `pagination: current page ${current} · estimated total ${total}`;
    item.append(text);
    detectionsroot.append(item);
    shown += 1;
  }
  if (shown === 0) detectionsroot.textContent = "Detected lists, tables and pagination shapes appear here as plan suggestions.";
}

/** Shows the live mutation and focus stream observed during watched steps. */
function renderstream(mutationevents: mutationevent[], focusevents: focusevent[]): void {
  if (!streamroot) return;
  streamroot.replaceChildren();
  if (mutationevents.length === 0 && focusevents.length === 0) { streamroot.textContent = "Watched steps stream their mutation and focus events here."; return; }
  for (const event of mutationevents.slice(0, 6)) {
    const item = document.createElement("li");
    item.textContent = `${new Date(event.at).toLocaleTimeString()} · mutation ${event.event} · ${event.targetpath}`;
    streamroot.append(item);
  }
  for (const event of focusevents.slice(0, 6)) {
    const item = document.createElement("li");
    item.textContent = `${new Date(event.at).toLocaleTimeString()} · focus ${event.kind} · ${event.targetpath}`;
    streamroot.append(item);
  }
}

/** Renders the latest snapshot diff with added, removed and changed rows. */
function renderdiffs(diffs: snapshotdiff[]): void {
  if (!diffsroot) return;
  diffsroot.replaceChildren();
  const latest = diffs[0];
  if (!latest) { diffsroot.textContent = "Diff two captured observation versions with a diffsnapshots step."; return; }
  const heading = document.createElement("p");
  heading.textContent = `version ${latest.baseversion} → ${latest.targetversion}: ${latest.added.length} added · ${latest.removed.length} removed · ${latest.changed.length} changed`;
  diffsroot.append(heading);
  const list = document.createElement("ul");
  for (const entry of [...latest.added, ...latest.removed, ...latest.changed].slice(0, 12)) {
    const item = document.createElement("li");
    item.className = `diffrow ${entry.kind}`;
    item.textContent = `${entry.kind} · ${entry.selector} · ${entry.summary}`;
    list.append(item);
  }
  diffsroot.append(list);
}

/** Flags consent banners with a review card before any interaction. */
function renderbanners(banners: bannerreport[]): void {
  if (!bannersroot) return;
  bannersroot.replaceChildren();
  if (banners.length === 0) { bannersroot.textContent = "No consent banner has been observed yet."; return; }
  for (const banner of banners.slice(0, 3)) {
    const card = document.createElement("div");
    card.className = "bannercard";
    const title = document.createElement("p");
    title.textContent = `${banner.kind} banner detected — review it before any interaction.`;
    const text = document.createElement("p");
    text.textContent = banner.text.slice(0, 160) || "(no banner text)";
    const controls = document.createElement("p");
    controls.textContent = `controls: ${banner.controls.length > 0 ? banner.controls.join(", ") : "none"}`;
    card.append(title, text, controls);
    bannersroot.append(card);
  }
}

/** Shows derived selector candidates with their stability scores for reuse. */
function renderselectors(selectors: derivedselector[]): void {
  if (!selectorsroot) return;
  selectorsroot.replaceChildren();
  if (selectors.length === 0) { selectorsroot.textContent = "Run a deriveselector step to rank stable selectors."; return; }
  for (const record of selectors.slice(0, 8)) {
    const item = document.createElement("li");
    const pick = document.createElement("button");
    pick.type = "button";
    pick.textContent = `${record.selector} (${record.strategy} · stability ${record.score})`;
    pick.addEventListener("click", () => pickhint(`target hint: ${record.selector} (derived ${record.strategy} selector)`));
    item.append(pick);
    selectorsroot.append(item);
  }
}

/** Renders the navigation trail of the session as a timeline of visited urls. */
function rendertrail(trail: trailentry[]): void {
  if (!trailroot) return;
  trailroot.replaceChildren();
  if (trail.length === 0) { trailroot.textContent = "No page has been visited inside a reviewed navigation step yet."; return; }
  for (const entry of [...trail].reverse().slice(0, 12)) {
    const item = document.createElement("li");
    item.textContent = `${new Date(entry.at).toLocaleTimeString()} · ${entry.url}${entry.title ? ` · ${entry.title}` : ""}${entry.stepid ? ` · step ${entry.stepid}` : ""}`;
    trailroot.append(item);
  }
}

/** Renders the navigation state: paused navigation, rate limit windows per domain, wait profiles, redirect chains, curated lists, safety verdicts, artifacts and the basic auth prompt behind the consent gate. */
function rendernavigation(context: { session?: { stoppedat?: number; expiresat: number; origin?: string }; navcontrol?: navcontrol; ratestates?: ratelimitstate[]; waitprofiles?: waitprofilerecord[]; navrecords?: navrecord[]; curated?: curatedlist[]; safeties?: safetyverdict[]; auths?: Array<{ origin: string; username: string; reviewedat: number }>; navqueues?: navqueues; artifacts?: artifactrecord[] }): void {
  if (!navigationroot) return;
  navigationroot.replaceChildren();
  const paused = document.createElement("p");
  if (context.navcontrol?.pausedat) {
    paused.className = "bannercard";
    paused.textContent = `Navigation is paused while ${context.navcontrol.reason ?? "a consent prompt is open"}; reviewed navigation steps are blocked until it resumes.`;
  } else {
    paused.textContent = "Navigation is live; no consent prompt holds it.";
  }
  navigationroot.append(paused);
  const rates = context.ratestates ?? [];
  if (rates.length > 0) {
    const heading = document.createElement("p");
    heading.textContent = "rate limit windows per domain:";
    navigationroot.append(heading);
    const list = document.createElement("ul");
    for (const state of rates.slice(0, 6)) {
      const item = document.createElement("li");
      item.textContent = `${state.domain}: ${state.count} of ${state.limit.ceiling} navigations inside the reviewed window of ${state.limit.window} ms`;
      list.append(item);
    }
    navigationroot.append(list);
  }
  const records = context.navrecords ?? [];
  const record = records[0];
  if (record) {
    const chain = document.createElement("p");
    chain.textContent = `latest navigation: ${Math.max(0, record.chain.hops.length - 1)} redirect${record.chain.hops.length - 1 === 1 ? "" : "s"} · final url ${record.finalurl}`;
    navigationroot.append(chain);
    const hops = document.createElement("ul");
    for (const hop of record.chain.hops.slice(0, 6)) {
      const item = document.createElement("li");
      let path = hop.url;
      try { path = new URL(hop.url).pathname; } catch { path = hop.url; }
      item.textContent = `hop ${path} · status ${hop.status} · ${new Date(hop.at).toLocaleTimeString()}`;
      hops.append(item);
    }
    navigationroot.append(hops);
  }
  const curatedlists = context.curated ?? [];
  if (curatedlists.length > 0) {
    const heading = document.createElement("p");
    heading.textContent = "curated link lists with per url safety states:";
    navigationroot.append(heading);
    for (const list of curatedlists.slice(0, 3)) {
      const card = document.createElement("div");
      card.className = "bannercard";
      const title = document.createElement("p");
      title.textContent = `${list.links.length} curated url${list.links.length === 1 ? "" : "s"}${list.reviewedat ? " · opened after review" : " · waiting for review"}`;
      card.append(title);
      for (const link of list.links.slice(0, 8)) {
        const line = document.createElement("p");
        line.textContent = `${link.verdict === "safe" ? "✓" : "✗"} ${link.url}${link.reasons.length > 0 ? ` · ${link.reasons.join("; ")}` : ""}`;
        card.append(line);
      }
      navigationroot.append(card);
    }
  }
  const safeties = context.safeties ?? [];
  const runner = document.createElement("p");
  const checkinput = document.createElement("input");
  checkinput.type = "url";
  checkinput.placeholder = "https://external.example/link";
  checkinput.setAttribute("aria-label", "url to verify with checksafe");
  const checkbutton = button("Run checksafe", async () => {
    const verdict = await request({ kind: "checksafe", url: checkinput.value }) as safetyverdict;
    status(verdict.safe ? `${verdict.url} passed every safety check.` : `${verdict.url} is unsafe: ${verdict.reasons.join("; ")}.`);
    await refresh();
  });
  runner.append(checkinput, " ", checkbutton);
  navigationroot.append(runner);
  if (safeties.length > 0) {
    const list = document.createElement("ul");
    for (const verdict of safeties.slice(0, 6)) {
      const item = document.createElement("li");
      item.textContent = `${verdict.safe ? "safe" : "unsafe"} · ${verdict.url}${verdict.reasons.length > 0 ? ` · ${verdict.reasons.join("; ")}` : ""}`;
      list.append(item);
    }
    navigationroot.append(list);
  }
  const active = context.session && !context.session.stoppedat && context.session.expiresat > Date.now();
  const authcard = document.createElement("div");
  authcard.className = "bannercard";
  const authtitle = document.createElement("p");
  authtitle.textContent = active ? "basic auth credentials (stored only after your explicit review):" : "basic auth credentials need an active session before they can be reviewed.";
  authcard.append(authtitle);
  if (active) {
    const origininput = document.createElement("input");
    origininput.type = "url";
    origininput.placeholder = context.session?.origin ?? "https://example.com";
    origininput.setAttribute("aria-label", "auth origin");
    const userinput = document.createElement("input");
    userinput.type = "text";
    userinput.placeholder = "username";
    userinput.setAttribute("aria-label", "auth username");
    const passinput = document.createElement("input");
    passinput.type = "password";
    passinput.placeholder = "password";
    passinput.setAttribute("aria-label", "auth password");
    const storebutton = button("Store reviewed credentials", async () => {
      const stored = await request({ kind: "storeauth", origin: origininput.value, username: userinput.value, password: passinput.value }) as { origin: string };
      status(`Reviewed basic auth credentials stored for ${stored.origin}.`);
      await refresh();
    });
    authcard.append(origininput, " ", userinput, " ", passinput, " ", storebutton);
  }
  navigationroot.append(authcard);
  const auths = context.auths ?? [];
  if (auths.length > 0) {
    const list = document.createElement("ul");
    for (const record of auths.slice(0, 4)) {
      const item = document.createElement("li");
      item.textContent = `basic auth for ${record.origin} as ${record.username}, reviewed ${new Date(record.reviewedat).toLocaleString()}`;
      list.append(item);
    }
    navigationroot.append(list);
  }
  const artifacts = context.artifacts ?? [];
  if (artifacts.length > 0) {
    const heading = document.createElement("p");
    heading.textContent = "task artifacts:";
    navigationroot.append(heading);
    const list = document.createElement("ul");
    for (const artifact of artifacts.slice(0, 6)) {
      const item = document.createElement("li");
      item.textContent = `${artifact.kind}: ${artifact.name} · step ${artifact.stepid}`;
      list.append(item);
    }
    navigationroot.append(list);
  }
}

/** Renders the tabs and windows command surface: quick switcher, groups, badges, audio state, layouts, snapshots, clone warnings, the task tab budget gauge and the pinned control tab feed. */
function rendertabswindows(context: { session?: { stoppedat?: number; expiresat: number }; plan?: agentplan; progress?: planprogress; tabs?: tabshape[]; windows?: windowshape[]; tabgroups?: tabgrouprecord[]; badges?: tabbadge[]; tabmetas?: tabmeta[]; clones?: Array<{ url: string; tabids: number[] }>; layouts?: tablayout[]; snapshots?: sessionsnapshot[]; closedtabs?: closedtab[]; tasktabgauge?: { used: number; ceiling?: number; over: boolean }; controltab?: controltabstate }): void {
  if (!tabswindowsroot) return;
  tabswindowsroot.replaceChildren();
  const tabs = context.tabs ?? [];
  const badges = context.badges ?? [];
  const metas = context.tabmetas ?? [];
  const active = context.session && !context.session.stoppedat && context.session.expiresat > Date.now();
  const gauge = context.tasktabgauge ?? { used: 0, ceiling: undefined, over: false };
  const budget = document.createElement("p");
  budget.className = gauge.over ? "bannercard" : "";
  budget.textContent = `task tab budget: ${gauge.used} tab${gauge.used === 1 ? "" : "s"} with active tasks${gauge.ceiling !== undefined ? ` of the user configured ceiling ${gauge.ceiling}` : " with no user ceiling configured"}${gauge.over ? " — over the reviewed budget" : ""}`;
  tabswindowsroot.append(budget);
  const ceilinginput = document.createElement("input");
  ceilinginput.type = "number";
  ceilinginput.min = "0";
  ceilinginput.placeholder = gauge.ceiling !== undefined ? String(gauge.ceiling) : "no ceiling";
  ceilinginput.setAttribute("aria-label", "concurrent task tab ceiling");
  const ceilingbutton = button("Save task tab ceiling", async () => {
    await request({ kind: "settasktabceiling", ceiling: ceilinginput.value === "" ? undefined : Number(ceilinginput.value) });
    status(`Task tab ceiling saved as ${ceilinginput.value === "" ? "no ceiling" : ceilinginput.value}; the value stays a user choice.`);
    await refresh();
  });
  tabswindowsroot.append(ceilinginput, " ", ceilingbutton);
  const switcherheading = document.createElement("p");
  switcherheading.textContent = "quick switcher (ordered by recency, filter by title or url):";
  tabswindowsroot.append(switcherheading);
  const filterinput = document.createElement("input");
  filterinput.type = "search";
  filterinput.placeholder = "filter open tabs";
  filterinput.setAttribute("aria-label", "quick switcher filter");
  const switchlist = document.createElement("ul");
  const renderswitchlist = (): void => {
    switchlist.replaceChildren();
    const ordered = switcherlist(tabs, [], filterinput.value).slice(0, 10);
    for (const tab of ordered) {
      const item = document.createElement("li");
      const jump = document.createElement("button");
      jump.type = "button";
      const badge = badges.find(entry => entry.tabid === tab.tabid);
      const meta = metas.find(entry => entry.tabid === tab.tabid);
      jump.textContent = `${tab.title || tab.url}${tab.pinned ? " 📌" : ""}${tab.audible || tab.muted ? ` ${tab.muted ? "🔇" : "🔊"}` : ""}${badge ? ` [${badge.label}]` : ""}${meta && meta.labels.length > 0 ? ` (${meta.labels.join(", ")})` : ""}`;
      jump.addEventListener("click", () => request({ kind: "jumptotab", tabid: tab.tabid }).then(() => status(`Jumped to tab ${tab.tabid}.`)).catch(error => status(error instanceof Error ? error.message : String(error), true)));
      item.append(jump);
      switchlist.append(item);
    }
    if (ordered.length === 0) { const empty = document.createElement("li"); empty.textContent = "no open tab matches the filter"; switchlist.append(empty); }
  };
  filterinput.addEventListener("input", renderswitchlist);
  tabswindowsroot.append(filterinput, switchlist);
  renderswitchlist();
  const searchinput = document.createElement("input");
  searchinput.type = "search";
  searchinput.placeholder = "search across open tabs by title and url";
  searchinput.setAttribute("aria-label", "searchtabs text");
  const searchresults = document.createElement("ul");
  const searchbutton = button("Run searchtabs", async () => {
    const result = await request({ kind: "tabsearch", text: searchinput.value }) as { matches: tabshape[] };
    searchresults.replaceChildren();
    for (const tab of result.matches.slice(0, 10)) {
      const item = document.createElement("li");
      const jump = document.createElement("button");
      jump.type = "button";
      jump.textContent = `${tab.title || tab.url} · ${tab.url}`;
      jump.addEventListener("click", () => request({ kind: "jumptotab", tabid: tab.tabid }).then(() => status(`Jumped to tab ${tab.tabid}.`)).catch(error => status(error instanceof Error ? error.message : String(error), true)));
      item.append(jump);
      searchresults.append(item);
    }
    status(`searchtabs matched ${result.matches.length} open tab${result.matches.length === 1 ? "" : "s"}.`);
  });
  tabswindowsroot.append(searchinput, " ", searchbutton, searchresults);
  const clones = context.clones ?? [];
  for (const clone of clones.slice(0, 3)) {
    const warning = document.createElement("p");
    warning.className = "bannercard";
    warning.textContent = `duplicate tab warning: ${clone.tabids.length} open tabs share the url ${clone.url} (tabs ${clone.tabids.join(", ")})`;
    tabswindowsroot.append(warning);
  }
  const groups = context.tabgroups ?? [];
  if (groups.length > 0) {
    const groupsheading = document.createElement("p");
    groupsheading.textContent = "tab groups with colors and collapse states:";
    tabswindowsroot.append(groupsheading);
    const grouplist = document.createElement("ul");
    for (const group of groups.slice(0, 6)) {
      const item = document.createElement("li");
      item.textContent = `${group.name} · ${group.color} · ${group.collapsed ? "collapsed" : "expanded"} · ${group.tabids.length} member tab${group.tabids.length === 1 ? "" : "s"}`;
      grouplist.append(item);
    }
    tabswindowsroot.append(grouplist);
  }
  const windows = context.windows ?? [];
  if (windows.length > 0) {
    const windowsheading = document.createElement("p");
    windowsheading.textContent = "windows with layouts and bounds:";
    tabswindowsroot.append(windowsheading);
    const windowlist = document.createElement("ul");
    for (const item of windows.slice(0, 6)) {
      const entry = document.createElement("li");
      entry.textContent = `window ${item.windowid} · ${item.state} · bounds ${item.left}×${item.top} ${item.width}×${item.height}${item.incognito ? " · incognito, grants not inherited" : ""}${item.focused ? " · focused" : ""}`;
      const closebutton = button("Close window", async () => {
        const tasktabids = (context.progress?.tasktabs ?? []);
        const tabsoftask = (context.tabs ?? []).filter(tab => tab.windowid === item.windowid && tasktabids.includes(tab.tabid));
        const reviewed = tabsoftask.length > 1 ? window.confirm(`This window holds ${tabsoftask.length} task tabs. Close it anyway under explicit review?`) : true;
        await request({ kind: "closewindow", windowid: item.windowid, reviewed });
        status(`Closed window ${item.windowid}.`);
        await refresh();
      });
      entry.append(" ", closebutton);
      windowlist.append(entry);
    }
    tabswindowsroot.append(windowlist);
  }
  const layoutcontrols = document.createElement("p");
  const layoutname = document.createElement("input");
  layoutname.type = "text";
  layoutname.placeholder = "layout name";
  layoutname.setAttribute("aria-label", "layout name");
  const savebutton = button("Save layout", async () => {
    if (!active) { status("Layout save stays inside an active session.", true); return; }
    await request({ kind: "savelayout", name: layoutname.value });
    status(`Saved the tab layout ${layoutname.value}.`);
    await refresh();
  });
  const restorebutton = button("Restore layout", async () => {
    if (!active) { status("Layout restore stays inside an active session.", true); return; }
    const result = await request({ kind: "restorelayout", name: layoutname.value }) as { reopened: number };
    status(`Restored the tab layout ${layoutname.value}: ${result.reopened} tab${result.reopened === 1 ? "" : "s"} reopened.`);
    await refresh();
  });
  layoutcontrols.append(layoutname, " ", savebutton, " ", restorebutton);
  tabswindowsroot.append(layoutcontrols);
  const layouts = context.layouts ?? [];
  if (layouts.length > 0) {
    const layoutlist = document.createElement("ul");
    for (const layout of layouts.slice(0, 4)) {
      const item = document.createElement("li");
      item.textContent = `${layout.name} · ${layout.tabs.length} tab${layout.tabs.length === 1 ? "" : "s"} · ${layout.groups.length} group${layout.groups.length === 1 ? "" : "s"} · ${layout.windows.length} window bound${layout.windows.length === 1 ? "" : "s"} · saved ${new Date(layout.savedat).toLocaleString()}`;
      layoutlist.append(item);
    }
    tabswindowsroot.append(layoutlist);
  }
  const snapshots = context.snapshots ?? [];
  if (snapshots.length > 0) {
    const snapcard = document.createElement("div");
    snapcard.className = "bannercard";
    const snaptitle = document.createElement("p");
    snaptitle.textContent = `session snapshot card: ${snapshots.length} snapshot${snapshots.length === 1 ? "" : "s"} stored`;
    snapcard.append(snaptitle);
    for (const snapshot of snapshots.slice(0, 3)) {
      const row = document.createElement("p");
      row.textContent = `${snapshot.layout.tabs.length} tabs · captured ${new Date(snapshot.capturedat).toLocaleString()}`;
      const restore = button("Restore snapshot", async () => {
        const result = await request({ kind: "restoresnapshot", id: snapshot.id }) as { reopened: number };
        status(`Restored the session snapshot: ${result.reopened} tab${result.reopened === 1 ? "" : "s"} reopened.`);
        await refresh();
      });
      row.append(" ", restore);
      snapcard.append(row);
    }
    tabswindowsroot.append(snapcard);
  }
  const controlcard = document.createElement("div");
  controlcard.className = "bannercard";
  const controlstate = context.controltab;
  const completed = context.progress?.completedsteps.length ?? 0;
  const total = context.plan?.steps.length ?? 0;
  controlcard.textContent = `pinned control tab feed: ${controlstate?.enabled ? `open as tab ${controlstate.tabid} with the live task status ${completed} of ${total} reviewed steps executed` : "disabled"}${context.plan ? ` · ${context.plan.state}` : " · no plan"}`;
  const controlbutton = button(controlstate?.enabled ? "Close pinned control tab" : "Open pinned control tab", async () => {
    await request({ kind: "controltab", enabled: !controlstate?.enabled });
    status(controlstate?.enabled ? "The pinned control tab was closed." : "The pinned control tab was opened with the live task feed.");
    await refresh();
  });
  controlcard.append(" ", controlbutton);
  tabswindowsroot.append(controlcard);
}

/** Renders the forms and data surface: the form map, generated values, saved profiles, asksubmit cards with the values diff, wizard progress, inline error reports, honeypot skips, template badges, the consent gated code entry and masked card fills. */
function renderforms(context: { session?: { stoppedat?: number; expiresat: number; origin?: string }; plan?: agentplan; outcomes?: stepoutcome[]; profiles?: formprofile[]; tickets?: submitticket[]; wizards?: { wizards: wizardstate[]; picks: typeaheadpick[] }; errorreports?: errorreport[]; captchas?: captchahandoff[]; detections?: detectionrecord[]; codeentry?: boolean }): void {
  if (!formsroot) return;
  formsroot.replaceChildren();
  const outcomes = context.outcomes ?? [];
  const active = context.session && !context.session.stoppedat && context.session.expiresat > Date.now();
  const opencaptcha = (context.captchas ?? []).find(handoff => !handoff.resolved);
  if (opencaptcha) {
    const card = document.createElement("div");
    card.className = "bannercard";
    card.textContent = `Captcha handoff open on ${opencaptcha.origin}: control is yours and the plan waits until you resolve it.`;
    card.append(" ", button("Captcha resolved", async () => { await request({ kind: "resolvecaptcha" }); status("Captcha handoff resolved; the plan continues."); await refresh(); }));
    formsroot.append(card);
  }
  const detections = context.detections ?? [];
  if (detections.length > 0) {
    const badges = document.createElement("p");
    badges.textContent = `template badges: ${detections.slice(0, 6).map(record => `${record.kind} on ${record.origin}${record.markers.length > 0 ? ` (${record.markers.join(", ")})` : ""}`).join(" · ")}`;
    formsroot.append(badges);
  }
  const mapoutcome = [...outcomes].reverse().find(outcome => outcome.details?.report !== undefined && outcome.details?.count !== undefined);
  const skippedselectors = new Set(outcomes.flatMap(outcome => Array.isArray(outcome.details?.skipped) ? outcome.details?.skipped as Array<{ selector: string }> : []).map(trap => trap.selector));
  if (mapoutcome) {
    const report = mapoutcome.details?.report as { form: string; fields: Array<{ selector: string; label: string; kind: string; matched: boolean }> };
    const heading = document.createElement("p");
    heading.textContent = `form map${report.form ? ` of ${report.form}` : ""}: ${report.fields.length} detected field${report.fields.length === 1 ? "" : "s"} with their kinds${skippedselectors.size > 0 ? `; ${skippedselectors.size} honeypot field${skippedselectors.size === 1 ? "" : "s"} highlighted as skipped` : ""}`;
    formsroot.append(heading);
    const list = document.createElement("ul");
    for (const field of report.fields.slice(0, 10)) {
      const item = document.createElement("li");
      const skipped = skippedselectors.has(field.selector);
      item.textContent = `${field.label || field.selector} · ${field.kind}${field.matched ? "" : " · unmatched"}${skipped ? " · honeypot, skipped" : ""}`;
      list.append(item);
    }
    formsroot.append(list);
  }
  const valuesoutcome = [...outcomes].reverse().find(outcome => Array.isArray(outcome.details?.values) && outcome.details?.locale !== undefined);
  if (valuesoutcome) {
    const values = valuesoutcome.details?.values as Array<{ label: string; kind: string; value: string }>;
    const locale = typeof valuesoutcome.details?.locale === "string" ? valuesoutcome.details.locale : "en";
    const seed = typeof valuesoutcome.details?.seed === "number" ? valuesoutcome.details.seed : 1;
    const heading = document.createElement("p");
    heading.textContent = `generated values (locale ${locale}, seed ${seed}) with a regenerate button per field:`;
    formsroot.append(heading);
    const list = document.createElement("ul");
    for (const entry of values.slice(0, 10)) {
      const item = document.createElement("li");
      item.textContent = `${entry.label} · ${entry.kind} · ${entry.value}`;
      item.append(" ", button("Regenerate", async () => {
        const regenerated = await request({ kind: "regeneratevalue", field: entry.kind, locale, seed: seed + 1 }) as { value: string };
        status(`Regenerated ${entry.label}: ${regenerated.value}.`);
      }));
      list.append(item);
    }
    formsroot.append(list);
  }
  const cardoutcome = [...outcomes].reverse().find(outcome => Array.isArray(outcome.details?.segments));
  if (cardoutcome) {
    const segments = cardoutcome.details?.segments as Array<{ label: string; masked: string }>;
    const cardline = document.createElement("p");
    cardline.textContent = `card fill segments (masked): ${segments.map(segment => `${segment.label} ${cardmask(segment.masked)}`).join(" · ")}`;
    formsroot.append(cardline);
  }
  const profiles = context.profiles ?? [];
  if (profiles.length > 0) {
    const heading = document.createElement("p");
    heading.textContent = "saved form profiles with origin grants:";
    formsroot.append(heading);
    const list = document.createElement("ul");
    for (const profile of profiles.slice(0, 6)) {
      const item = document.createElement("li");
      item.textContent = `${profile.name} · ${profile.fields.length} field${profile.fields.length === 1 ? "" : "s"} · grants ${profile.grants.join(", ")} · saved ${new Date(profile.savedat).toLocaleString()}`;
      item.append(" ", button("Apply", async () => {
        const applied = await request({ kind: "applyprofile", name: profile.name }) as { profile: { fields: unknown[] } };
        pickhint(`profile hint: ${profile.name} with ${applied.profile.fields.length} reviewed field entries`);
      }), " ", button("Remove", async () => {
        await request({ kind: "removeprofile", name: profile.name });
        status(`Form profile ${profile.name} removed.`);
        await refresh();
      }));
      list.append(item);
    }
    formsroot.append(list);
  }
  const pending = (context.tickets ?? []).filter(ticket => ticket.approved === undefined);
  for (const ticket of pending) {
    const card = document.createElement("div");
    card.className = "bannercard";
    const title = document.createElement("p");
    title.textContent = `asksubmit for form ${ticket.form || "the reviewed form"} · values hash ${ticket.valueshash}`;
    card.append(title);
    const askoutcome = [...outcomes].reverse().find(outcome => Array.isArray(outcome.details?.values) && outcome.details?.ticket !== undefined);
    const values = askoutcome?.details?.values as Array<{ label: string; value: string }> | undefined;
    if (values) {
      const diff = document.createElement("ul");
      for (const entry of values.slice(0, 10)) {
        const item = document.createElement("li");
        item.textContent = `${entry.label}: ${entry.value}`;
        diff.append(item);
      }
      card.append(diff);
    } else {
      const note = document.createElement("p");
      note.textContent = "The full values diff appears here once the asksubmit step reads the form.";
      card.append(note);
    }
    card.append(button("Approve submission", async () => { await request({ kind: "approvesubmit", id: ticket.id, approved: true }); status("Submission approved; the reviewed submitform step may run."); await refresh(); }), " ", button("Decline", async () => { await request({ kind: "approvesubmit", id: ticket.id, approved: false }); status("Submission declined."); await refresh(); }));
    formsroot.append(card);
  }
  const wizards = context.wizards?.wizards ?? [];
  if (wizards.length > 0) {
    const wizard = wizards[0] as wizardstate;
    const heading = document.createElement("p");
    const indicators = Array.from({ length: wizard.steps }, (_, index) => `${index < wizard.index ? (wizard.completed[index] ? "✓" : "·") : "○"}`).join(" ");
    heading.textContent = `wizard progress: step ${Math.min(wizard.index + 1, wizard.steps)} of ${wizard.steps} ${indicators}`;
    formsroot.append(heading);
  }
  const picks = context.wizards?.picks ?? [];
  if (picks.length > 0) {
    const pickline = document.createElement("p");
    pickline.textContent = `typeahead picks: ${picks.slice(0, 6).map(pick => `"${pick.pick}" for "${pick.query}"`).join(" · ")}`;
    formsroot.append(pickline);
  }
  const reports = context.errorreports ?? [];
  if (reports.length > 0) {
    const heading = document.createElement("p");
    heading.textContent = "inline error reports with field refs for correction loops:";
    formsroot.append(heading);
    const list = document.createElement("ul");
    for (const report of reports.slice(0, 3)) {
      const item = document.createElement("li");
      item.textContent = `${report.form || "the reviewed form"}: ${report.errors.map((error: fielderror) => `${error.field} — ${error.message}`).join("; ") || "no message"}`;
      list.append(item);
    }
    formsroot.append(list);
  }
  const codecard = document.createElement("div");
  codecard.className = "bannercard";
  const codetitle = document.createElement("p");
  codetitle.textContent = active ? "one time code entry (stored behind the consent gate of the active session):" : "one time code entry needs an active session first.";
  codecard.append(codetitle);
  if (active) {
    const codeinput = document.createElement("input");
    codeinput.type = "text";
    codeinput.inputMode = "numeric";
    codeinput.placeholder = context.codeentry ? "a reviewed code is stored" : "one time code";
    codeinput.setAttribute("aria-label", "one time code");
    const storebutton = button("Store reviewed code", async () => {
      await request({ kind: "storecode", code: codeinput.value });
      status("The reviewed one time code is stored behind the consent gate.");
      await refresh();
    });
    codecard.append(codeinput, " ", storebutton);
  }
  formsroot.append(codecard);
}

/** Renders the dataset surfaces: the preview grid with sortable columns, extraction progress cards with resume prompts, export actions per dataset, transform rule previews, dedupe results, provenance records, import pickers and sheet endpoint grant states. */
function renderdatasets(context: { session?: { stoppedat?: number; expiresat: number }; plan?: agentplan; outcomes?: stepoutcome[]; datasets?: dataset[]; imports?: dataset[]; extractsessions?: extractsession[]; streams?: streamstate[]; exports?: Array<{ id: string; kind: string; name: string; rowcount: number; checksum: string; at: number }>; provenances?: provenancerecord[]; taskrules?: taskrules[]; sheetendpoints?: Array<{ endpoint: string; origin: string; configuredat: number; granted: boolean }> }): void {
  if (!datasetsroot) return;
  datasetsroot.replaceChildren();
  const outcomes = context.outcomes ?? [];
  const active = context.session && !context.session.stoppedat && context.session.expiresat > Date.now();
  const extractsessions = context.extractsessions ?? [];
  for (const extract of extractsessions.slice(0, 4)) {
    const card = document.createElement("p");
    const interrupted = extract.done !== true;
    card.textContent = `extraction ${extract.name}: ${extract.pages.length} page${extract.pages.length === 1 ? "" : "s"} visited · ${extract.rows} row${extract.rows === 1 ? "" : "s"} collected · cursor ${extract.cursor} of ${extract.planned}${extract.done ? " · complete" : " · interrupted"}`;
    datasetsroot.append(card);
  }
  const interrupted = extractsessions.find(extract => extract.done !== true);
  if (interrupted && active) {
    const prompt = document.createElement("div");
    prompt.className = "bannercard";
    prompt.textContent = `Extraction ${interrupted.name} was interrupted at cursor ${interrupted.cursor}; run its resumeextract reviewed step to continue from the stored cursor.`;
    datasetsroot.append(prompt);
  }
  const streams = context.streams ?? [];
  if (streams.length > 0) {
    const stream = streams[0]!;
    const card = document.createElement("p");
    card.textContent = `stream state: ${stream.name} chunk ${stream.chunk} of ${stream.chunks} · ${stream.written} row${stream.written === 1 ? "" : "s"} written${stream.done ? " · complete" : " · resumable"}`;
    datasetsroot.append(card);
  }
  const rules = (context.taskrules ?? [])[0];
  if (rules && rules.transforms.length > 0) {
    const transforms = document.createElement("p");
    transforms.textContent = `transform rules: ${rules.transforms.map(rule => `${rule.sources.join("+")} → ${rule.target} (${rule.expression})`).join(" · ")}`;
    datasetsroot.append(transforms);
  }
  if (rules && rules.dedupekeys.length > 0) {
    const keys = document.createElement("p");
    keys.textContent = `dedupe keys: ${rules.dedupekeys.join(", ")}`;
    datasetsroot.append(keys);
  }
  const dedupeoutcome = [...outcomes].reverse().find(outcome => outcome.details?.dedupe !== undefined);
  if (dedupeoutcome) {
    const dedupe = dedupeoutcome.details?.dedupe as { removed: number; kept: number; keys: string[] };
    const card = document.createElement("p");
    card.textContent = `last dedupe: removed ${dedupe.removed} duplicate row${dedupe.removed === 1 ? "" : "s"}, kept ${dedupe.kept} by ${dedupe.keys.join(", ")}`;
    datasetsroot.append(card);
  }
  for (const datasetvalue of (context.datasets ?? []).slice(0, 4)) {
    const card = document.createElement("div");
    card.className = "panel";
    const head = document.createElement("p");
    head.textContent = `dataset ${datasetvalue.name}: ${datasetvalue.rows.length} row${datasetvalue.rows.length === 1 ? "" : "s"} · ${datasetvalue.columns.length} column${datasetvalue.columns.length === 1 ? "" : "s"}${(context.imports ?? []).some(item => item.id === datasetvalue.id) ? " · imported csv" : ""}`;
    card.append(head);
    const grid = document.createElement("table");
    const headerrow = document.createElement("tr");
    for (const column of datasetvalue.columns.slice(0, 6)) {
      const cell = document.createElement("th");
      cell.textContent = `${column.label || column.key} ${column.kind === "number" ? "#" : ""}`;
      cell.addEventListener("click", () => {
        const body = grid.querySelector("tbody");
        if (!body) return;
        const sorted = sortrows(datasetvalue.rows.slice(0, 5), column.key, cell.dataset.sorted === "asc" ? "desc" : "asc");
        cell.dataset.sorted = cell.dataset.sorted === "asc" ? "desc" : "asc";
        body.replaceChildren(...sorted.map(row => {
          const line = document.createElement("tr");
          for (const columnspec of datasetvalue.columns.slice(0, 6)) {
            const value = document.createElement("td");
            value.textContent = row[columnspec.key] ?? "";
            line.append(value);
          }
          return line;
        }));
      });
      headerrow.append(cell);
    }
    grid.append(headerrow);
    const body = document.createElement("tbody");
    for (const row of datasetvalue.rows.slice(0, 5)) {
      const line = document.createElement("tr");
      for (const column of datasetvalue.columns.slice(0, 6)) {
        const cell = document.createElement("td");
        cell.textContent = row[column.key] ?? "";
        line.append(cell);
      }
      body.append(line);
    }
    grid.append(body);
    card.append(grid);
    if (active) {
      const actions = document.createElement("p");
      for (const format of ["csv", "json", "excel"] as const) {
        actions.append(" ", button(`Export ${format}`, async () => {
          const artifact = await request({ kind: "exportdataset", datasetid: datasetvalue.id, format }) as { name: string; checksum: string };
          status(`Exported ${datasetvalue.name} to ${artifact.name} with checksum ${artifact.checksum}.`);
          await refresh();
        }));
      }
      card.append(actions);
    }
    datasetsroot.append(card);
  }
  const provenances = context.provenances ?? [];
  if (provenances.length > 0) {
    const list = document.createElement("ul");
    for (const record of provenances.slice(0, 6)) {
      const item = document.createElement("li");
      item.textContent = `${record.name}: rows ${record.rowstart}–${record.rowend} · checksum ${record.checksum} · source ${record.url}`;
      list.append(item);
    }
    datasetsroot.append(list);
  }
  const sheetendpoints = context.sheetendpoints ?? [];
  if (sheetendpoints.length > 0) {
    const sheets = document.createElement("p");
    sheets.textContent = `sheet endpoints: ${sheetendpoints.map(config => `${config.origin} ${config.granted ? "granted" : "not granted"}`).join(" · ")}`;
    datasetsroot.append(sheets);
  }
  if (active) {
    const importer = document.createElement("div");
    importer.className = "panel";
    const csvinput = document.createElement("textarea");
    csvinput.rows = 3;
    csvinput.placeholder = "Paste reviewed csv content for a fill loop (header line first).";
    const nameinput = document.createElement("input");
    nameinput.placeholder = "dataset name (optional)";
    const mappinginput = document.createElement("input");
    mappinginput.placeholder = "column mapping json (optional, csv header → target)";
    importer.append(csvinput, nameinput, mappinginput, " ", button("Import csv", async () => {
      let mapping: Record<string, string> = {};
      if (mappinginput.value.trim()) {
        try { mapping = JSON.parse(mappinginput.value) as Record<string, string>; } catch { status("The column mapping must be a json object.", true); return; }
      }
      const imported = await request({ kind: "importcsv", csv: csvinput.value, name: nameinput.value, mapping }) as { name: string; rows: number };
      status(`Imported ${imported.rows} rows as dataset ${imported.name} for fill loops.`);
      await refresh();
    }));
    datasetsroot.append(importer);
  }
}

/** Renders the files, clipboard and downloads surface: the batch download queue with per file states and pause, resume and verify actions, mime interception rules with origin grants, clipboard consent prompts with the requesting step, the netlog viewer with step correlation filters and redaction notices, the quarantine list with scan verdicts and release actions, capture naming previews, cleanup policy editing, artifact inventories and copyscreen results. */
function renderfiles(context: { session?: { stoppedat?: number; expiresat: number; origin?: string }; plan?: agentplan; downloads?: downloadrecord[]; mimefilters?: mimefilter[]; clipconsents?: clipboardconsentrecord[]; clips?: clipentry[]; netlogs?: netlogrecord[]; quarantines?: quarantineentry[]; capturecounters?: Array<{ taskid: string; counters: Record<string, number>; at: number }>; cleanuprules?: cleanuprule[]; cleanupruns?: cleanuprun[]; inventory?: artifactinventoryentry[]; scanhooks?: Array<{ scanner: string; endpoint: string; origin: string; configuredat: number; granted: boolean }> }): void {
  if (!filesroot) return;
  filesroot.replaceChildren();
  const active = context.session && !context.session.stoppedat && context.session.expiresat > Date.now();
  const downloads = context.downloads ?? [];
  if (downloads.length > 0) {
    const card = document.createElement("div");
    card.className = "panel";
    const head = document.createElement("p");
    const states = ["queued", "running", "paused", "complete", "failed"] as const;
    head.textContent = `batch download queue: ${downloads.length} file${downloads.length === 1 ? "" : "s"} (${states.map(state => `${downloads.filter(item => item.state === state).length} ${state}`).filter(part => !part.startsWith("0 ")).join(" · ") || "none"})`;
    card.append(head);
    const list = document.createElement("ul");
    for (const record of downloads.slice(0, 6)) {
      const item = document.createElement("li");
      item.textContent = `${record.filename} · ${record.state}${record.bytes !== undefined ? ` · ${record.bytes} bytes` : ""}${record.checksum !== undefined ? ` · checksum ${record.checksum}` : ""}${record.path !== undefined ? ` · ${record.path}` : ""}`;
      if (active) {
        item.append(" ", button("Pause", () => request({ kind: "downloadaction", id: record.id, action: "pause" }).then(() => refresh()).then(() => status(`Paused the download of ${record.filename}.`)), record.state !== "running"));
        item.append(" ", button("Resume", () => request({ kind: "downloadaction", id: record.id, action: "resume" }).then(() => refresh()).then(() => status(`Resumed the download of ${record.filename}.`)), record.state !== "paused"));
        item.append(" ", button("Verify", () => request({ kind: "downloadaction", id: record.id, action: "verify" }).then(value => { const output = value as { summary: string }; status(output.summary); return refresh(); })));
      }
      list.append(item);
    }
    card.append(list);
    filesroot.append(card);
  }
  const filters = context.mimefilters ?? [];
  if (filters.length > 0) {
    const filter = filters[0]!;
    const card = document.createElement("p");
    card.textContent = `mime interception: include ${filter.include.join(", ")} · exclude ${filter.exclude.join(", ") || "none"} · ${filter.default} default for unlisted mime types${context.session?.origin ? ` · armed inside the ${context.session.origin} origin grants` : ""}`;
    filesroot.append(card);
  }
  const consents = (context.clipconsents ?? []).filter(record => record.approved === undefined);
  for (const consent of consents.slice(0, 4)) {
    const card = document.createElement("div");
    card.className = "bannercard";
    card.textContent = `Clipboard read consent ${consent.id} waits for your approval: step ${consent.stepid} on ${consent.origin} asked to read the clipboard — "${consent.prompt}".`;
    if (active) {
      card.append(" ", button("Approve read", async () => { await request({ kind: "approveclipconsent", id: consent.id, approved: true }); status(`Clipboard read consent ${consent.id} approved; run the step again to read once.`); await refresh(); }));
      card.append(" ", button("Decline", async () => { await request({ kind: "approveclipconsent", id: consent.id, approved: false }); status(`Clipboard read consent ${consent.id} declined.`); await refresh(); }));
    }
    filesroot.append(card);
  }
  const netlogs = context.netlogs ?? [];
  if (netlogs.length > 0) {
    const card = document.createElement("div");
    card.className = "panel";
    const head = document.createElement("p");
    const steps = [...new Set(netlogs.map(record => record.stepid))];
    head.textContent = `network log: ${netlogs.length} record${netlogs.length === 1 ? "" : "s"} correlated with ${steps.length} step${steps.length === 1 ? "" : "s"} (${steps.slice(0, 4).join(", ")}${steps.length > 4 ? "…" : ""})`;
    card.append(head);
    const list = document.createElement("ul");
    for (const record of netlogs.slice(0, 6)) {
      const item = document.createElement("li");
      item.textContent = `${record.method} ${record.url} · ${record.status} · ${record.timing}ms · request ${record.requestid ?? "?"} · step ${record.stepid}`;
      list.append(item);
    }
    card.append(list);
    if (active) card.append(button("Export netlog (header values redacted)", async () => { const exported = await request({ kind: "exportnetlog" }) as { records: unknown[]; redaction: string }; status(`Exported ${exported.records.length} netlog records; ${exported.redaction}.`); }));
    filesroot.append(card);
  }
  const quarantines = context.quarantines ?? [];
  if (quarantines.length > 0) {
    const card = document.createElement("div");
    card.className = "panel";
    const head = document.createElement("p");
    head.textContent = `quarantine: ${quarantines.length} file${quarantines.length === 1 ? "" : "s"} outside the downloads folder (${quarantines.filter(entry => entry.scan === "pending").length} awaiting scan verdicts)`;
    card.append(head);
    const list = document.createElement("ul");
    for (const entry of quarantines.slice(0, 6)) {
      const item = document.createElement("li");
      item.textContent = `${entry.path} · scan ${entry.scan}${entry.release !== undefined ? ` · released under ${entry.release}` : ""} · ${entry.reason}`;
      if (active && entry.release === undefined && entry.scan === "clean") item.append(" ", button("Release", async () => { await request({ kind: "releasequarantine", id: entry.id }); status(`Released ${entry.path} from quarantine under the clean scan verdict.`); await refresh(); }));
      list.append(item);
    }
    card.append(list);
    filesroot.append(card);
  }
  const planid = context.plan?.id;
  const counters = (context.capturecounters ?? []).find(item => item.taskid === planid);
  if (counters) {
    const card = document.createElement("p");
    card.textContent = `capture naming for task ${counters.taskid}: ${Object.entries(counters.counters).map(([step, sequence]) => `${step} → ${counters.taskid}-${step}-${sequence}`).join(" · ")}`;
    filesroot.append(card);
  }
  const rules = context.cleanuprules ?? [];
  const rulecard = document.createElement("div");
  rulecard.className = "panel";
  const rulehead = document.createElement("p");
  rulehead.textContent = `cleanup policy: ${rules.length > 0 ? rules.map(rule => `older than ${rule.age}ms of kind ${rule.kind} keep ${rule.keep}`).join(" · ") : "no rule set stored yet"}`;
  rulecard.append(rulehead);
  const runs = context.cleanupruns ?? [];
  if (runs.length > 0) {
    const lastrun = runs[0]!;
    const runline = document.createElement("p");
    runline.textContent = `last sweep: removed ${lastrun.removed}, kept ${lastrun.kept} under ${lastrun.rules} rule${lastrun.rules === 1 ? "" : "s"}`;
    rulecard.append(runline);
  }
  if (active) {
    const ageinput = document.createElement("input");
    ageinput.placeholder = "age window in ms";
    const kindinput = document.createElement("input");
    kindinput.placeholder = "artifact kind (any matches all)";
    const keepinput = document.createElement("input");
    keepinput.placeholder = "keep policy: none, latest or all";
    rulecard.append(ageinput, kindinput, keepinput, " ", button("Add cleanup rule", async () => {
      const age = Number(ageinput.value);
      const rule = { age, kind: kindinput.value.trim() || "any", keep: keepinput.value.trim() || "none" } as cleanuprule;
      const stored = await request({ kind: "setcleanuprules", rules: [...rules, rule] }) as { rules: number };
      status(`Stored ${stored.rules} reviewed cleanup rule${stored.rules === 1 ? "" : "s"}; ages stay your choice with no code ceiling.`);
      await refresh();
    }));
  }
  filesroot.append(rulecard);
  const inventory = context.inventory ?? [];
  if (inventory.length > 0) {
    const card = document.createElement("p");
    card.textContent = `artifact inventory: ${inventory.slice(0, 5).map(entry => `${entry.name} (${entry.kind}, ${entry.size} characters, ${Math.max(0, Math.round((Date.now() - entry.at) / 60000))} minute${Math.round((Date.now() - entry.at) / 60000) === 1 ? "" : "s"} old)`).join(" · ")}${inventory.length > 5 ? ` and ${inventory.length - 5} more` : ""}`;
    filesroot.append(card);
  }
  const screens = (context.clips ?? []).filter(entry => entry.kind === "screen").slice(0, 2);
  for (const screen of screens) {
    const card = document.createElement("p");
    card.textContent = `copyscreen result: ${screen.length} characters of png data with payload hash ${screen.hash} routed to the clipboard destination.`;
    filesroot.append(card);
  }
  const hooks = context.scanhooks ?? [];
  if (active) {
    const hookcard = document.createElement("div");
    hookcard.className = "panel";
    const hookhead = document.createElement("p");
    hookhead.textContent = hooks.length > 0 ? `scan hooks: ${hooks.map(hook => `${hook.scanner} at ${hook.origin} ${hook.granted ? "granted" : "not granted"}`).join(" · ")}` : "scan hooks: none configured; scan verdicts stay pending without one.";
    hookcard.append(hookhead);
    const scannerinput = document.createElement("input");
    scannerinput.placeholder = "scanner name";
    const endpointinput = document.createElement("input");
    endpointinput.placeholder = "https://scanner.example/verdict";
    hookcard.append(scannerinput, endpointinput, " ", button("Configure scan hook", async () => {
      await request({ kind: "configurescanhook", scanner: scannerinput.value, endpoint: endpointinput.value });
      status(`Scan hook ${scannerinput.value} configured; hook failures stay pending verdicts.`);
      await refresh();
    }));
    filesroot.append(hookcard);
  }
}

/** One capture metadata card of the gallery; bytes stay out of the context and load per capture on demand. */
type capturemeta = { id: string; runid: string; stepid: string; kind: string; format: string; width: number; height: number; capturedat: number; name?: string; annotated?: boolean; target?: string; bytesexpired?: boolean };

/** Loads the bytes of one stored capture on demand; expired bytes resolve to undefined. */
async function capturebytes(id: string): Promise<string | undefined> {
  try {
    const record = await request({ kind: "capturebytes", id }) as { bytes: string };
    return record.bytes;
  } catch { return undefined; }
}

/** Opens any capture full size with its metadata, download and clipboard copy actions. */
function opencapture(record: capturemeta): void {
  if (!capturesroot) return;
  const viewer = document.createElement("div");
  viewer.className = "panel captureviewer";
  const head = document.createElement("p");
  head.textContent = `${record.kind} · ${record.format} · ${record.width}×${record.height} px · step ${record.stepid}${record.annotated ? " · annotated evidence" : ""}${record.name !== undefined ? ` · ${record.name}` : ""}`;
  viewer.append(head);
  const image = document.createElement("img");
  image.alt = `Capture ${record.id} of kind ${record.kind}`;
  image.src = "";
  void capturebytes(record.id).then(bytes => { if (bytes) image.src = bytes; else viewer.append(Object.assign(document.createElement("p"), { textContent: "The capture bytes expired from the retention window; the metadata stays for the audit trail." })); });
  viewer.append(image);
  const actions = document.createElement("div");
  actions.className = "actions";
  actions.append(button("Download", () => request({ kind: "downloadcapture", id: record.id }).then(() => status(`Downloaded capture ${record.id} through the reviewed download flow.`))));
  actions.append(button("Copy to clipboard", () => request({ kind: "copycapture", id: record.id }).then(() => status(`Copied capture ${record.id} to the clipboard.`))));
  actions.append(button("Close", async () => viewer.remove()));
  viewer.append(actions);
  capturesroot.append(viewer);
}


/** One media record metadata card; bytes stay out of the context and load per record on demand. */
type mediameta = { id: string; runid: string; stepid: string; at: number; bytesexpired?: boolean } & Record<string, unknown>;

/** Loads the bytes of one stored media record on demand; expired bytes resolve to undefined. */
async function mediabytes(id: string): Promise<string | undefined> {
  try {
    const record = await request({ kind: "mediabytes", id }) as { bytes: string };
    return record.bytes;
  } catch { return undefined; }
}

/** Plays an ordered frame sequence as a lapse: the image cycles through the frame bytes at the recorded interval. */
function playframes(frameids: string[], interval: number, label: string): void {
  if (!mediaroot) return;
  const viewer = document.createElement("div");
  viewer.className = "panel captureviewer";
  const head = document.createElement("p");
  head.textContent = `${label}: ${frameids.length} frames at ${interval} millisecond intervals`;
  viewer.append(head);
  const image = document.createElement("img");
  image.alt = "Lapse frame";
  viewer.append(image);
  let index = 0;
  let stopped = false;
  const show = async (): Promise<void> => {
    if (stopped) return;
    const bytes = await capturebytes(frameids[index] ?? "");
    if (bytes) image.src = bytes;
    index = (index + 1) % Math.max(1, frameids.length);
  };
  void show();
  const timer = window.setInterval(() => { void show(); }, Math.max(100, interval));
  const actions = document.createElement("div");
  actions.className = "actions";
  actions.append(button("Stop", async () => { stopped = true; window.clearInterval(timer); viewer.remove(); }));
  viewer.append(actions);
  mediaroot.append(viewer);
}

/** Renders the media tab: the recording indicator, recording consents, pdf reports, image batches with match counts, video frames and lapse playback, recordings with play, download and delete controls, stream probe results, assets and the convertimage and makethumbs actions on stored captures. */
function rendermedia(context: { session?: { stoppedat?: number; expiresat: number }; media?: mediameta[]; imagebatches?: Array<{ id: string; runid: string; stepid: string; images: Array<{ url: string; alt: string; width: number; height: number; bytes: number; mime: string }>; matched: number; downloaded: number; at: number }>; recordingconsents?: Array<{ id: string; prompt: string; origin: string; stepid: string; approved?: boolean; usedat?: number; at: number }>; recordingactive?: Array<{ id: string; kind: string; scope: string; startedat: number; stopat: number }>; recordingwindow?: number; captures?: capturemeta[] }): void {
  if (!mediaroot) return;
  mediaroot.replaceChildren();
  const active = context.session && !context.session.stoppedat && context.session.expiresat > Date.now();
  if ((context.recordingactive ?? []).length > 0) {
    const indicator = document.createElement("p");
    indicator.className = "recordingindicator";
    indicator.textContent = `● recording in progress: ${context.recordingactive?.map(item => `${item.kind} of ${item.scope} scope`).join(", ")}`;
    mediaroot.append(indicator);
  }
  for (const consent of (context.recordingconsents ?? []).filter(item => item.approved === undefined)) {
    const card = document.createElement("div");
    card.className = "panel recordingcard";
    const head = document.createElement("p");
    head.textContent = `Recording consent ${consent.id} for step ${consent.stepid} on ${consent.origin}: ${consent.prompt}`;
    card.append(head);
    const actions = document.createElement("div");
    actions.className = "actions";
    actions.append(button("Approve recording", () => request({ kind: "approverecordingconsent", id: consent.id, approved: true }).then(() => status(`Recording consent ${consent.id} approved; rerun the recording step.`)).then(refresh)));
    actions.append(button("Decline", () => request({ kind: "approverecordingconsent", id: consent.id, approved: false }).then(() => status(`Recording consent ${consent.id} declined.`)).then(refresh)));
    card.append(actions);
    mediaroot.append(card);
  }
  const records = context.media ?? [];
  const pdfs = records.filter(record => record.pages !== undefined);
  const recordings = records.filter(record => record.startedat !== undefined);
  const frames = records.filter(record => record.timestamp !== undefined);
  const canvases = records.filter(record => record.context !== undefined);
  const streams = records.filter(record => record.tracks !== undefined);
  const assets = records.filter(record => record.url !== undefined && record.kind !== undefined && (record.kind === "favicon" || record.kind === "logo"));
  if (pdfs.length > 0) {
    const card = document.createElement("div");
    card.className = "panel";
    const head = document.createElement("p");
    head.textContent = `pdf reports: ${pdfs.length}`;
    card.append(head);
    for (const pdf of pdfs) {
      const row = document.createElement("p");
      row.textContent = `${String(pdf.name ?? pdf.id)} · ${String(pdf.pages)} page${String(pdf.pages) === "1" ? "" : "s"} · ${String(pdf.pagewidth)}×${String(pdf.pageheight)} pt${pdf.landscape === true ? " · landscape" : ""} · ${String(pdf.bytes)} bytes${pdf.bytesexpired === true ? " · bytes expired" : ""}`;
      card.append(row);
      const actions = document.createElement("div");
      actions.className = "actions";
      actions.append(button("Download pdf", () => request({ kind: "downloadmedia", id: String(pdf.id) }).then(() => status(`Downloaded the pdf report ${String(pdf.name ?? pdf.id)} through the reviewed download flow.`)), !active || pdf.bytesexpired === true));
      card.append(actions);
    }
    mediaroot.append(card);
  }
  for (const batch of context.imagebatches ?? []) {
    const card = document.createElement("div");
    card.className = "panel";
    const head = document.createElement("p");
    head.textContent = `image batch of step ${batch.stepid}: ${batch.matched} of ${batch.images.length} observed images matched, ${batch.downloaded} downloaded`;
    card.append(head);
    const list = document.createElement("ol");
    list.className = "audit";
    for (const image of batch.images.slice(0, 12)) {
      const entry = document.createElement("li");
      entry.textContent = `${image.url}${image.alt ? ` · ${image.alt}` : ""} · ${image.width}×${image.height} · ${image.bytes} bytes · ${image.mime}`;
      list.append(entry);
    }
    card.append(list);
    mediaroot.append(card);
  }
  if (frames.length > 0) {
    const card = document.createElement("div");
    card.className = "panel";
    const head = document.createElement("p");
    head.textContent = `video frames: ${frames.length}`;
    card.append(head);
    const grid = document.createElement("div");
    grid.className = "capturegrid";
    for (const frame of frames) {
      const cell = document.createElement("button");
      cell.type = "button";
      cell.className = "capturecard";
      const label = document.createElement("span");
      label.textContent = `${String(frame.source)} · ${String(frame.timestamp)}s${frame.poster === true ? " · poster" : ""}${frame.bytesexpired === true ? " · bytes expired" : ""}`;
      cell.append(label);
      const image = document.createElement("img");
      image.alt = `Video frame ${String(frame.id)}`;
      if (frame.bytesexpired !== true) void mediabytes(String(frame.id)).then(bytes => { if (bytes) image.src = bytes; });
      cell.append(image);
      grid.append(cell);
    }
    card.append(grid);
    mediaroot.append(card);
  }
  const timelapse = (context.captures ?? []).filter(record => record.kind === "timelapse");
  if (timelapse.length > 1) {
    const card = document.createElement("div");
    card.className = "panel";
    const head = document.createElement("p");
    head.textContent = `time lapse sequences: ${timelapse.length} frames`;
    card.append(head);
    card.append(button("Play lapse sequence", async () => {
      const ordered = await request({ kind: "capturereport" }) as { records: Array<{ id: string; kind: string; capturedat: number }> };
      const ids = ordered.records.filter(record => record.kind === "timelapse").sort((left, right) => left.capturedat - right.capturedat).map(record => record.id);
      playframes(ids, 800, "time lapse");
    }));
    mediaroot.append(card);
  }
  if (canvases.length > 0) {
    const card = document.createElement("div");
    card.className = "panel";
    const head = document.createElement("p");
    head.textContent = `canvas captures: ${canvases.length}`;
    card.append(head);
    const grid = document.createElement("div");
    grid.className = "capturegrid";
    for (const canvas of canvases) {
      const cell = document.createElement("button");
      cell.type = "button";
      cell.className = "capturecard";
      const label = document.createElement("span");
      label.textContent = `${String(canvas.element)} · ${String(canvas.context)} · ${String(canvas.width)}×${String(canvas.height)}${canvas.bytesexpired === true ? " · bytes expired" : ""}`;
      cell.append(label);
      const image = document.createElement("img");
      image.alt = `Canvas capture ${String(canvas.id)}`;
      if (canvas.bytesexpired !== true) void mediabytes(String(canvas.id)).then(bytes => { if (bytes) image.src = bytes; });
      cell.append(image);
      grid.append(cell);
    }
    card.append(grid);
    mediaroot.append(card);
  }
  for (const stream of streams) {
    const card = document.createElement("div");
    card.className = "panel";
    const head = document.createElement("p");
    head.textContent = `stream probe ${String(stream.label || stream.id)}: ${String(stream.tracks)} track${String(stream.tracks) === "1" ? "" : "s"} · ${stream.live === true ? "live" : "ended"}`;
    card.append(head);
    const detail = stream.detail as Array<{ kind: string; label: string; width?: number; height?: number; framerate?: number; state: string }> | undefined;
    if (Array.isArray(detail)) {
      const list = document.createElement("ul");
      list.className = "audit";
      for (const track of detail) {
        const entry = document.createElement("li");
        entry.textContent = `${track.kind} track${track.label ? ` ${track.label}` : ""}${track.width !== undefined ? ` · ${track.width}×${track.height}` : ""}${track.framerate !== undefined ? ` · ${Math.round(track.framerate)} fps` : ""} · ${track.state}`;
        list.append(entry);
      }
      card.append(list);
    }
    mediaroot.append(card);
  }
  if (assets.length > 0) {
    const card = document.createElement("div");
    card.className = "panel";
    const head = document.createElement("p");
    head.textContent = `page assets: ${assets.filter(asset => asset.kind === "favicon").length} favicon and ${assets.filter(asset => asset.kind === "logo").length} logo entries`;
    card.append(head);
    const list = document.createElement("ul");
    list.className = "audit";
    for (const asset of assets.slice(0, 12)) {
      const entry = document.createElement("li");
      entry.textContent = `${String(asset.kind)} · ${String(asset.url)}${asset.sizes !== undefined ? ` · ${String(asset.sizes)}` : ""}`;
      list.append(entry);
    }
    card.append(list);
    mediaroot.append(card);
  }
  for (const recording of recordings) {
    const card = document.createElement("div");
    card.className = "panel recordingcard";
    const head = document.createElement("p");
    head.textContent = `${String(recording.kind)} recording ${String(recording.id)} · ${String(recording.scope)} scope · ${String(recording.duration ?? 0)} ms · ${Array.isArray(recording.frames) ? String(recording.frames.length) : "0"} frames · manifest ${String(recording.bytes ?? 0)} bytes${recording.bytesexpired === true ? " · bytes expired" : ""}`;
    card.append(head);
    const actions = document.createElement("div");
    actions.className = "actions";
    const frames = Array.isArray(recording.frames) ? recording.frames as string[] : [];
    if (String(recording.kind) === "screen" && frames.length > 0) {
      actions.append(button("Play frames", async () => {
        const state = await request({ kind: "recordingframes", id: String(recording.id) }) as { frames: string[]; interval: number };
        playframes(state.frames, state.interval, `screen recording ${String(recording.id)}`);
      }));
    }
    actions.append(button("Download manifest", () => request({ kind: "downloadrecording", id: String(recording.id) }).then(() => status(`Downloaded the recording manifest ${String(recording.id)} through the reviewed download flow.`)), !active));
    actions.append(button("Delete", () => request({ kind: "deleterecording", id: String(recording.id) }).then(() => status(`Deleted the recording ${String(recording.id)}.`)).then(refresh), !active));
    card.append(actions);
    mediaroot.append(card);
  }
  const stored = (context.captures ?? []).filter(record => record.bytesexpired !== true).slice(0, 12);
  if (stored.length > 0) {
    const card = document.createElement("div");
    card.className = "panel";
    const head = document.createElement("p");
    head.textContent = "capture transforms: convertimage and makethumbs actions on stored captures";
    card.append(head);
    for (const record of stored) {
      const row = document.createElement("div");
      row.className = "actions";
      const label = document.createElement("p");
      label.textContent = `${record.kind} ${record.id} (${record.format})`;
      row.append(label);
      for (const target of ["png", "jpeg", "webp"] as const) {
        if (target !== record.format) row.append(button(`→ ${target}`, () => request({ kind: "convertcapture", id: record.id, target }).then(() => status(`Converted capture ${record.id} to ${target}.`)).then(refresh), !active));
      }
      row.append(button("thumbnail", () => request({ kind: "thumbcapture", id: record.id, size: 240, fit: "cover", suffix: "thumb" }).then(() => status(`Thumbnailed capture ${record.id}.`)).then(refresh), !active));
      card.append(row);
    }
    mediaroot.append(card);
  }
  if (records.length === 0 && (context.imagebatches ?? []).length === 0 && (context.recordingactive ?? []).length === 0) {
    mediaroot.append(Object.assign(document.createElement("p"), { textContent: "No media stored yet; run a capturepdf, recordscreen, captureaudio, captureframe, downloadimages, shotcanvas, probestream, readmedia, readassets, timelapse, convertimage or makethumbs step." }));
  }
}
/** Renders the capture gallery: the policy toggle, stitch progress, thumbnails per run, contact sheet cells and before and after pairs with a divider. */
function rendercaptures(context: { session?: { stoppedat?: number; expiresat: number }; plan?: agentplan; outcomes?: stepoutcome[]; captures?: capturemeta[]; capturepairs?: shotpair[]; capturepolicy?: string; stitchprogress?: Array<{ stepid: string; done: number; total: number }> }): void {
  if (!capturesroot) return;
  capturesroot.replaceChildren();
  const active = context.session && !context.session.stoppedat && context.session.expiresat > Date.now();
  const policy = (context.capturepolicy ?? "manual") as capturepolicy;
  const policyrow = document.createElement("div");
  policyrow.className = "actions";
  const policylabel = document.createElement("p");
  policylabel.textContent = `capture policy: ${policy}${policy === "beforeafter" ? " — state pairs wrap every page moving action" : ""}`;
  policyrow.append(policylabel);
  for (const mode of ["off", "manual", "annotated", "beforeafter"] as const) {
    policyrow.append(button(mode, async () => { await request({ kind: "setcapturepolicy", mode }); status(`Capture policy set to ${mode}.`); await refresh(); }, !active || mode === policy));
  }
  capturesroot.append(policyrow);
  for (const progress of context.stitchprogress ?? []) {
    const bar = document.createElement("progress");
    bar.max = Math.max(1, progress.total);
    bar.value = progress.done;
    const label = document.createElement("p");
    label.textContent = `stitching full page capture of step ${progress.stepid}: tile ${progress.done} of ${progress.total}`;
    capturesroot.append(label, bar);
  }
  const captures = context.captures ?? [];
  if (captures.length === 0 && (context.capturepairs ?? []).length === 0) {
    capturesroot.append(Object.assign(document.createElement("p"), { textContent: "No captures stored yet; run a shotview, shotfullpage, shotelement, shotregion or contactsheet step." }));
    return;
  }
  const runs = [...new Set(captures.map(record => record.runid))];
  for (const run of runs) {
    const runcaptures = captures.filter(record => record.runid === run);
    const card = document.createElement("div");
    card.className = "panel";
    const head = document.createElement("p");
    head.textContent = `run ${run}: ${runcaptures.length} capture${runcaptures.length === 1 ? "" : "s"}`;
    card.append(head);
    const grid = document.createElement("div");
    grid.className = "capturegrid";
    for (const record of runcaptures) {
      const cell = document.createElement("button");
      cell.type = "button";
      cell.className = record.annotated ? "capturecard annotated" : "capturecard";
      const label = document.createElement("span");
      label.textContent = `${record.kind} · ${record.format} · ${record.width}×${record.height}${record.annotated ? " · annotated" : ""}${record.bytesexpired ? " · bytes expired" : ""}`;
      cell.append(label);
      const image = document.createElement("img");
      image.alt = `Capture ${record.id} of kind ${record.kind}`;
      if (!record.bytesexpired) void capturebytes(record.id).then(bytes => { if (bytes) image.src = bytes; });
      cell.append(image);
      cell.addEventListener("click", () => opencapture(record));
      grid.append(cell);
      if (record.kind === "contactsheet") {
        const cells = (context.outcomes ?? []).find(outcome => outcome.stepid === record.stepid && outcome.details?.cells !== undefined)?.details?.cells as Array<{ index: number; selector: string; caption: string }> | undefined;
        for (const sheetcell of cells ?? []) {
          const cellbutton = document.createElement("button");
          cellbutton.type = "button";
          cellbutton.className = "secondary";
          cellbutton.textContent = sheetcell.caption || sheetcell.selector;
          cellbutton.addEventListener("click", () => opencapture(record));
          grid.append(cellbutton);
        }
      }
    }
    card.append(grid);
    capturesroot.append(card);
  }
  for (const pair of context.capturepairs ?? []) {
    const card = document.createElement("div");
    card.className = "panel pairview";
    const head = document.createElement("p");
    head.textContent = `state pair around the ${pair.actionkind} action${pair.target !== undefined ? ` on ${pair.target}` : ""}${pair.domsnapshotid !== undefined ? ` · dom snapshot ${pair.domsnapshotid}` : ""}`;
    card.append(head);
    const row = document.createElement("div");
    row.className = "pairrow";
    const before = document.createElement("img");
    before.alt = `Before shot ${pair.beforeid}`;
    const after = document.createElement("img");
    after.alt = `After shot ${pair.afterid}`;
    void capturebytes(pair.beforeid).then(bytes => { if (bytes) before.src = bytes; });
    void capturebytes(pair.afterid).then(bytes => { if (bytes) after.src = bytes; });
    row.append(before, after);
    const divider = document.createElement("input");
    divider.type = "range";
    divider.min = "0";
    divider.max = "100";
    divider.value = "50";
    divider.setAttribute("aria-label", "Before and after divider");
    divider.addEventListener("input", () => { before.style.width = `${100 - Number(divider.value)}%`; after.style.width = `${Number(divider.value)}%`; });
    card.append(row, divider);
    capturesroot.append(card);
  }
}


/** Renders the traffic control view: the active block, mock and rewrite rule lists with live hit counts, the cookie operations with values redacted, the oauth flow state with provider and scopes, the stored token metadata per provider, the proxy state with a manual revert button, the rate limit waits with reset times, the api key consent scope and the multipart upload progress of postfiles steps. */
function rendertraffic(context: { session?: { stoppedat?: number; expiresat: number }; traffic?: { blocks: Array<{ id: string; urlpattern: string; hits: number; revertedat?: number; stepid: string }>; mocks: Array<{ id: string; urlpattern: string; status: number; hits: number; revertedat?: number }>; rewrites: Array<{ id: string; urlpattern: string; name: string; operation: string; value?: string; hits: number; revertedat?: number }>; cookies: Array<{ id: string; kind: string; domain: string; names: string[]; at: number }>; proxies: Array<{ id: string; scheme: string; host: string; port: number; bypass: string[]; appliedat: number; revertedat?: number }>; ratelimits: Array<{ origin: string; remaining?: number; limit?: number; resetat: number }> }; tokens?: { tokens: Array<{ id: string; provider: string; origin: string; scopes: string[]; expiresat: number; refreshedat?: number; revokedat?: number }> }; authflows?: Array<{ provider: string; redirectorigin: string; scopes: string[]; stepid: string; tabid: number; stage: string }>; apikeys?: Array<{ name: string; origins: string[]; header: string; createdat: number; lastuse?: number }>; activerules?: number; progress?: planprogress }): void {
  if (!trafficroot) return;
  trafficroot.replaceChildren();
  const head = document.createElement("p");
  head.textContent = `active traffic rules: ${context.activerules ?? 0} (every rule reverts at run end)`;
  trafficroot.append(head);
  const traffic = context.traffic;
  if (traffic === undefined) return;
  if ( (traffic.blocks.length === 0 && traffic.mocks.length === 0 && traffic.rewrites.length === 0 && traffic.cookies.length === 0 && traffic.proxies.length === 0 && traffic.ratelimits.length === 0)) {
    trafficroot.append(Object.assign(document.createElement("p"), { className: "muted", textContent: "No traffic rule has been applied yet; blockrequest, mockresponse, rewriteheaders, setcookies, clearcookies, routeproxy, postform and postfiles steps land here." }));
  }
  for (const rule of traffic.blocks) {
    const row = document.createElement("p");
    row.textContent = `block ${rule.urlpattern} · ${rule.hits} blocked · ${rule.revertedat !== undefined ? "reverted" : "active"} · step ${rule.stepid}`;
    trafficroot.append(row);
  }
  for (const spec of traffic.mocks) {
    const row = document.createElement("p");
    row.textContent = `mock ${spec.urlpattern} → ${spec.status} · ${spec.hits} served · ${spec.revertedat !== undefined ? "reverted" : "active"}`;
    trafficroot.append(row);
  }
  for (const rule of traffic.rewrites) {
    const row = document.createElement("p");
    row.textContent = `rewrite ${rule.operation} ${rule.name} on ${rule.urlpattern} · ${rule.hits} applied · ${rule.revertedat !== undefined ? "reverted" : "active"}`;
    trafficroot.append(row);
  }
  for (const route of traffic.proxies) {
    const row = document.createElement("p");
    row.textContent = `proxy ${route.scheme}://${route.host}:${route.port} · bypass ${route.bypass.join(", ")} · ${route.revertedat !== undefined ? "reverted" : "active"}`;
    trafficroot.append(row);
    if (route.revertedat === undefined) {
      const actions = document.createElement("div");
      actions.className = "actions";
      actions.append(button("Revert proxy route", () => request({ kind: "revertproxyroute", id: route.id }).then(() => status(`Proxy route ${route.id} reverted; the previous routing state is restored.`)).then(refresh)));
      trafficroot.append(actions);
    }
  }
  for (const read of traffic.ratelimits) {
    const row = document.createElement("p");
    row.textContent = `rate limit ${read.origin} · ${read.remaining ?? "?"} of ${read.limit ?? "?"} remaining · resets ${new Date(read.resetat).toLocaleTimeString()}`;
    trafficroot.append(row);
  }
  for (const flow of context.authflows ?? []) {
    const row = document.createElement("p");
    row.textContent = `oauth ${flow.provider} · scopes ${flow.scopes.join(", ")} · redirect ${flow.redirectorigin} · ${flow.stage} in tab ${flow.tabid}`;
    trafficroot.append(row);
  }
  for (const token of context.tokens?.tokens ?? []) {
    const row = document.createElement("p");
    row.textContent = `token ${token.provider} · scopes ${token.scopes.join(", ")} · ${token.revokedat !== undefined ? "revoked" : `expires ${new Date(token.expiresat).toLocaleTimeString()}`}${token.refreshedat !== undefined ? " · refreshed" : ""}`;
    trafficroot.append(row);
    if (token.revokedat === undefined) {
      const actions = document.createElement("div");
      actions.className = "actions";
      actions.append(button("Revoke token", () => request({ kind: "revoketokens", tokenids: [token.id], reason: "review panel demand" }).then(() => status(`Token ${token.id} of ${token.provider} revoked.`)).then(refresh)));
      trafficroot.append(actions);
    }
  }
  for (const op of traffic.cookies.slice(0, 8)) {
    const row = document.createElement("p");
    row.textContent = `cookie ${op.kind} · ${op.domain} · ${op.names.length === 0 ? "all cookies" : op.names.join(", ")} · ${new Date(op.at).toLocaleTimeString()} (values never stored)`;
    trafficroot.append(row);
  }
  for (const ref of context.apikeys ?? []) {
    const row = document.createElement("p");
    row.textContent = `api key ${ref.name} · header ${ref.header} · scoped to ${ref.origins.join(", ")}${ref.lastuse !== undefined ? ` · last use ${new Date(ref.lastuse).toLocaleTimeString()}` : " · unused"}`;
    trafficroot.append(row);
  }
  const uploads = (context.progress?.outcomes ?? []).filter(outcome => outcome.details?.upload !== undefined).slice(-4);
  for (const outcome of uploads) {
    const entry = outcome.details?.upload as { chunk: number; chunks: number; uploaded: number; bytes: number };
    const row = document.createElement("p");
    row.textContent = `upload chunk ${entry.chunk} of ${entry.chunks} · ${entry.uploaded} of ${entry.bytes} bytes`;
    trafficroot.append(row);
  }
}

/** Renders the network calls view: every outbound call of the run with status, duration, retries and byte counts, expandable header names, parsed fields and errors, fetch consent prompts with name and value, stream progress bars, origin, method and status class filters, endpoint and api key configuration and the reviewed call list export. */
function rendercalls(context: { session?: { stoppedat?: number; expiresat: number }; calls?: Array<{ id: string; runid: string; stepid: string; kind: string; url: string; origin: string; method: string; status: number; statusclass: string; duration: number; retries: number; bytes: number; headernames: string[]; endpoint?: string; bodyexpired?: boolean; fields?: Array<{ name: string; path: string; kind: string; value?: unknown; missing?: boolean }>; errors?: string[]; streambytes?: number }>; fetchconsents?: Array<{ id: string; origin: string; headers: Array<{ name: string; value: string }>; approved?: boolean; expiresat: number; at: number }>; endpoints?: Array<{ name: string; method: string; url: string; version: number; headers?: Record<string, string>; schema?: { fields: Array<{ name: string; kind: string; required?: boolean; default?: string | number | boolean }> } }>; apikeys?: Array<{ name: string; origins: string[]; header: string; createdat: number; lastuse?: number }>; callretention?: number; fetchesactive?: number }): void {
  if (!callsroot) return;
  callsroot.replaceChildren();
  const active = context.session && !context.session.stoppedat && context.session.expiresat > Date.now();
  for (const consent of (context.fetchconsents ?? []).filter(item => item.approved === undefined)) {
    const card = document.createElement("div");
    card.className = "panel consentcard";
    const head = document.createElement("p");
    head.textContent = `Fetch consent ${consent.id} for ${consent.origin}: review every custom header before it is sent.`;
    card.append(head);
    for (const header of consent.headers) {
      const row = document.createElement("p");
      row.textContent = `${header.name}: ${header.value}`;
      card.append(row);
    }
    const note = document.createElement("p");
    note.className = "muted";
    note.textContent = `The prompt appears once per origin and expires ${new Date(consent.expiresat).toLocaleTimeString()}; header values never enter the audit trail.`;
    card.append(note);
    const actions = document.createElement("div");
    actions.className = "actions";
    actions.append(button("Approve headers", () => request({ kind: "approvefetchconsent", id: consent.id, approved: true }).then(() => status(`Fetch consent ${consent.id} approved; rerun the fetch step.`)).then(refresh)));
    actions.append(button("Decline", () => request({ kind: "approvefetchconsent", id: consent.id, approved: false }).then(() => status(`Fetch consent ${consent.id} declined.`)).then(refresh)));
    card.append(actions);
    callsroot.append(card);
  }
  const endpoints = context.endpoints ?? [];
  if (endpoints.length > 0) {
    const card = document.createElement("div");
    card.className = "panel";
    const head = document.createElement("p");
    head.textContent = `typed endpoints: ${endpoints.length}`;
    card.append(head);
    for (const endpoint of endpoints) {
      const row = document.createElement("p");
      row.textContent = `${endpoint.name} · ${endpoint.method} ${endpoint.url} · v${endpoint.version} · ${endpoint.schema?.fields.length ?? 0} payload field${endpoint.schema?.fields.length === 1 ? "" : "s"}${endpoint.headers !== undefined ? ` · ${Object.keys(endpoint.headers).length} reviewed header${Object.keys(endpoint.headers).length === 1 ? "" : "s"}` : ""}`;
      card.append(row);
    }
    callsroot.append(card);
  }
  const apikeys = context.apikeys ?? [];
  if (apikeys.length > 0) {
    const card = document.createElement("div");
    card.className = "panel";
    const head = document.createElement("p");
    head.textContent = `api key references: ${apikeys.length} (secrets never listed)`;
    card.append(head);
    for (const ref of apikeys) {
      const row = document.createElement("p");
      row.textContent = `${ref.name} · header ${ref.header} · scoped to ${ref.origins.join(", ")}`;
      card.append(row);
      const actions = document.createElement("div");
      actions.className = "actions";
      actions.append(button(`Remove ${ref.name}`, () => request({ kind: "deleteapikey", name: ref.name }).then(() => status(`Api key reference ${ref.name} removed.`)).then(refresh)));
      card.append(actions);
    }
    callsroot.append(card);
  }
  const callsmeta = context.calls ?? [];
  const filters = document.createElement("div");
  filters.className = "actions";
  const originfilter = document.createElement("input");
  originfilter.placeholder = "filter by origin";
  const methodfilter = document.createElement("input");
  methodfilter.placeholder = "filter by method";
  const classfilter = document.createElement("input");
  classfilter.placeholder = "filter by status class";
  filters.append(originfilter, methodfilter, classfilter);
  callsroot.append(filters);
  const list = document.createElement("div");
  const applyfilters = (): void => {
    list.replaceChildren();
    const origin = originfilter.value.trim().toLowerCase();
    const method = methodfilter.value.trim().toUpperCase();
    const statusclass = classfilter.value.trim().toLowerCase();
    const matched = callsmeta.filter(call => (!origin || call.origin.toLowerCase().includes(origin)) && (!method || call.method.toUpperCase().includes(method)) && (!statusclass || call.statusclass.includes(statusclass)));
    if (matched.length === 0) { list.textContent = "No outbound call matches the filters yet."; return; }
    for (const call of matched) {
      const card = document.createElement("details");
      card.className = "panel callcard";
      const summary = document.createElement("summary");
      const credential = call.headernames.some(name => name.toLowerCase().startsWith("apikey:") || ["authorization", "cookie", "proxy-authorization", "api-key", "x-api-key", "x-auth-token"].includes(name.toLowerCase()));
      summary.textContent = `${call.method} ${call.kind} ${call.status} ${call.statusclass} · ${new URL(call.url).host} · ${call.duration} ms · ${call.retries} retr${call.retries === 1 ? "y" : "ies"} · ${call.bytes} bytes · step ${call.stepid}`;
      if (credential) {
        const badge = document.createElement("span");
        badge.className = "credentialbadge";
        badge.textContent = " credential call ";
        summary.append(badge);
      }
      card.append(summary);
      const urlrow = document.createElement("p");
      urlrow.textContent = `url: ${call.url}${call.endpoint !== undefined ? ` · endpoint ${call.endpoint}` : ""}${call.bodyexpired === true ? " · body expired from retention" : ""}`;
      card.append(urlrow);
      const headersrow = document.createElement("p");
      headersrow.textContent = `request header names: ${call.headernames.length > 0 ? call.headernames.join(", ") : "none"} (values never persist)`;
      card.append(headersrow);
      if ((call.fields ?? []).length > 0) {
        const fieldstitle = document.createElement("p");
        fieldstitle.textContent = `parsed fields: ${(call.fields ?? []).length}`;
        card.append(fieldstitle);
        for (const field of call.fields ?? []) {
          const fieldrow = document.createElement("p");
          fieldrow.textContent = `${field.name} (${field.kind}) from ${field.path}: ${field.missing === true ? "miss filled by the reviewed default" : JSON.stringify(field.value)}`;
          card.append(fieldrow);
        }
      }
      if (call.streambytes !== undefined) {
        const streamrow = document.createElement("p");
        streamrow.textContent = `streamed ${call.streambytes} bytes of the response body`;
        card.append(streamrow);
        const gauge = document.createElement("progress");
        gauge.max = Math.max(call.streambytes, call.bytes);
        gauge.value = call.streambytes;
        card.append(gauge);
      }
      for (const error of call.errors ?? []) {
        const errorrow = document.createElement("p");
        errorrow.className = "diffrow.removed";
        errorrow.textContent = `error of step ${call.stepid}: ${error}`;
        card.append(errorrow);
      }
      list.append(card);
    }
  };
  originfilter.addEventListener("input", applyfilters);
  methodfilter.addEventListener("input", applyfilters);
  classfilter.addEventListener("input", applyfilters);
  applyfilters();
  callsroot.append(list);
  const actions = document.createElement("div");
  actions.className = "actions";
  actions.append(button(`Export ${callsmeta.length} call${callsmeta.length === 1 ? "" : "s"}`, () => request({ kind: "exportcalls" }).then(() => status(`Exported ${callsmeta.length} call record${callsmeta.length === 1 ? "" : "s"} through the reviewed download flow.`)).catch(error => status(error instanceof Error ? error.message : String(error), true))));
  if (active) {
    const retentioninput = document.createElement("input");
    retentioninput.placeholder = "call body retention (records)";
    retentioninput.value = context.callretention !== undefined ? String(context.callretention) : "";
    retentioninput.setAttribute("aria-label", "call body retention window");
    const retentionbutton = button("Save call retention", () => request({ kind: "setcallretention", retention: retentioninput.value === "" ? undefined : Number(retentioninput.value) }).then(() => status(`Call body retention saved as ${retentioninput.value === "" ? "keep every body" : retentioninput.value} records; metadata always survives.`)).then(refresh));
    actions.append(retentioninput, retentionbutton);
  }
  callsroot.append(actions);
}


/** Renders the network view: every observed exchange of the run with method, url, status, size and duration, expandable redacted headers and a body preview, failed requests with an error class badge, grouping by correlation id, the live channel state with message counters, the event stream subscriptions with event names, the poll loops with cursor values and stop conditions, the webrequest grant toggle and the netlog export. */
function rendernetview(context: { session?: { stoppedat?: number; expiresat: number }; exchanges?: Array<{ id: string; runid: string; stepid: string; correlationid: string; url: string; origin: string; method: string; status: number; statusclass: string; errorclass?: string; source: string; timing: number; bytes: number; mime?: string; bodyref?: string; bodyexpired?: boolean; requestheaders?: Record<string, string>; responseheaders?: Record<string, string> }>; channels?: Array<{ id: string; kind: string; url: string; origin: string; state: string; sent: number; received: number; reconnects: number; lasteventid?: string }>; subscriptions?: Array<{ id: string; url: string; origin: string; state: string; events: number; names: string[]; lasteventid?: string; cancel: { kind: string; value: string | number } }>; apimap?: Array<{ endpoint: string; method: string; mime: string; frequency: number; jsonshare: number; stability: number; origin: string; payloadshape: string[] }>; progress?: planprogress; webrequestgrant?: boolean; bodyretention?: number; socketsactive?: number; activerules?: number; traffic?: { blocks: Array<{ id: string; urlpattern: string; hits: number; revertedat?: number; stepid: string }>; mocks: Array<{ id: string; urlpattern: string; status: number; hits: number; revertedat?: number }>; rewrites: Array<{ id: string; urlpattern: string; name: string; operation: string; value?: string; hits: number; revertedat?: number }>; cookies: Array<{ id: string; kind: string; domain: string; names: string[]; at: number }>; proxies: Array<{ id: string; scheme: string; host: string; port: number; bypass: string[]; appliedat: number; revertedat?: number }>; ratelimits: Array<{ origin: string; remaining?: number; limit?: number; resetat: number }> }; tokens?: { tokens: Array<{ id: string; provider: string; origin: string; scopes: string[]; expiresat: number; refreshedat?: number; revokedat?: number }> }; authflows?: Array<{ provider: string; redirectorigin: string; scopes: string[]; stepid: string; tabid: number; stage: string }> }): void {
  if (!netviewroot) return;
  netviewroot.replaceChildren();
  const active = context.session && !context.session.stoppedat && context.session.expiresat > Date.now();
  const grantcard = document.createElement("div");
  grantcard.className = "panel";
  const grantrow = document.createElement("p");
  grantrow.textContent = `request watching: ${context.webrequestgrant === true ? "granted" : "not granted"} — the observation derives from the page timing buffers and adds no manifest permission.`;
  grantcard.append(grantrow);
  if (active) {
    const grantactions = document.createElement("div");
    grantactions.className = "actions";
    grantactions.append(button(context.webrequestgrant === true ? "Revoke request watching" : "Grant request watching", () => request({ kind: "setwebrequestgrant", granted: context.webrequestgrant !== true }).then(() => status(context.webrequestgrant === true ? "Request watching revoked." : "Request watching granted; watchrequests steps can run now.")).then(refresh)));
    grantcard.append(grantactions);
  }
  netviewroot.append(grantcard);
  const channels = context.channels ?? [];
  const subscriptions = context.subscriptions ?? [];
  if (channels.length > 0 || subscriptions.length > 0 || (context.socketsactive ?? 0) > 0) {
    const card = document.createElement("div");
    card.className = "panel";
    const head = document.createElement("p");
    head.textContent = `live channels: ${channels.length} websocket channel${channels.length === 1 ? "" : "s"} · ${subscriptions.length} event stream${subscriptions.length === 1 ? "" : "s"}`;
    card.append(head);
    for (const channel of channels) {
      const row = document.createElement("p");
      row.textContent = `${channel.kind} ${channel.state} · ${channel.origin} · ${channel.sent} sent · ${channel.received} received · ${channel.reconnects} reconnect${channel.reconnects === 1 ? "" : "s"}${channel.lasteventid !== undefined ? ` · last event ${channel.lasteventid}` : ""}`;
      card.append(row);
      if (channel.state === "open" || channel.state === "connecting") {
        const actions = document.createElement("div");
        actions.className = "actions";
        actions.append(button(`Close ${channel.id}`, () => request({ kind: "closesocket", id: channel.id }).then(() => status(`Channel ${channel.id} closed cleanly.`)).then(refresh)));
        card.append(actions);
      }
    }
    for (const subscription of subscriptions) {
      const row = document.createElement("p");
      row.textContent = `sse ${subscription.state} · ${subscription.origin} · ${subscription.events} event${subscription.events === 1 ? "" : "s"}${subscription.names.length > 0 ? ` (${subscription.names.slice(0, 4).join(", ")}${subscription.names.length > 4 ? "…" : ""})` : ""}${subscription.lasteventid !== undefined ? ` · resume at ${subscription.lasteventid}` : ""} · cancel on ${subscription.cancel.kind}`;
      card.append(row);
    }
    netviewroot.append(card);
  }
  const pollevidence = (context.progress?.outcomes ?? []).filter(outcome => outcome.details?.poll !== undefined).map(outcome => outcome.details?.poll as { poll: number; cursor?: string; status: number; stopped: boolean; reason: string });
  if (pollevidence.length > 0) {
    const card = document.createElement("div");
    card.className = "panel";
    const head = document.createElement("p");
    head.textContent = `poll loops: ${pollevidence.length} iteration${pollevidence.length === 1 ? "" : "s"}`;
    card.append(head);
    for (const poll of pollevidence.slice(0, 8)) {
      const row = document.createElement("p");
      row.textContent = `poll ${poll.poll} · status ${poll.status}${poll.cursor !== undefined ? ` · cursor ${poll.cursor}` : ""} · ${poll.stopped ? `stopped: ${poll.reason}` : "continuing"}`;
      card.append(row);
    }
    card.append(document.createRange().createContextualFragment(""));
    netviewroot.append(card);
  }
  const exchanges = context.exchanges ?? [];
  const list = document.createElement("div");
  if (exchanges.length === 0) { list.textContent = "No request of the run has been observed yet; grant request watching and run a watchrequests step."; }
  for (const exchange of exchanges) {
    const card = document.createElement("details");
    card.className = "panel callcard";
    const summary = document.createElement("summary");
    summary.textContent = `${exchange.method} ${exchange.status} ${exchange.statusclass} · ${new URL(exchange.url).host} · ${exchange.bytes} bytes · ${exchange.timing} ms · correlation ${exchange.correlationid} · ${exchange.source === "page" ? "derived" : "captured"}`;
    if (exchange.errorclass !== undefined) {
      const badge = document.createElement("span");
      badge.className = "credentialbadge";
      badge.textContent = ` ${exchange.errorclass} `;
      summary.append(badge);
    }
    card.append(summary);
    const urlrow = document.createElement("p");
    urlrow.textContent = `url: ${exchange.url}${exchange.mime !== undefined ? ` · ${exchange.mime}` : ""}${exchange.bodyref !== undefined ? ` · body ${exchange.bodyref}` : ""}${exchange.bodyexpired === true ? " · body expired from retention" : ""}`;
    card.append(urlrow);
    const requestheadernames = Object.keys(exchange.requestheaders ?? {});
    if (requestheadernames.length > 0 || Object.keys(exchange.responseheaders ?? {}).length > 0) {
      const headersrow = document.createElement("p");
      headersrow.textContent = `stored headers (redacted on the redaction list): request ${requestheadernames.length > 0 ? requestheadernames.join(", ") : "none"} · response ${Object.keys(exchange.responseheaders ?? {}).join(", ") || "none"}`;
      card.append(headersrow);
    } else {
      const headersrow = document.createElement("p");
      headersrow.className = "muted";
      headersrow.textContent = "no captured headers: derived page exchanges expose no header names through the timing buffers.";
      card.append(headersrow);
    }
    if (exchange.bodyref !== undefined && exchange.bodyexpired !== true) {
      const bodyrow = document.createElement("p");
      bodyrow.textContent = `captured body ${exchange.bodyref}`;
      card.append(bodyrow);
      const actions = document.createElement("div");
      actions.className = "actions";
      actions.append(button(`Preview body ${exchange.bodyref}`, () => request({ kind: "exchangebody", ref: exchange.bodyref }).then(value => {
        const record = value as { body: string; mime: string; bytes: number };
        bodyrow.textContent = `captured body ${exchange.bodyref} of ${record.mime} and ${record.bytes} bytes: ${record.body.slice(0, 400)}${record.body.length > 400 ? "… (display preview truncates; the stored body keeps every byte)" : ""}`;
      }).catch(error => status(error instanceof Error ? error.message : String(error), true))));
      card.append(actions);
    }
    list.append(card);
  }
  netviewroot.append(list);
  const apimap = context.apimap ?? [];
  if (apimap.length > 0) {
    const card = document.createElement("div");
    card.className = "panel";
    const head = document.createElement("p");
    head.textContent = `page api map: ${apimap.length} ranked endpoint${apimap.length === 1 ? "" : "s"}`;
    card.append(head);
    for (const entry of apimap.slice(0, 10)) {
      const row = document.createElement("p");
      row.textContent = `${entry.method} ${entry.endpoint} · ${entry.frequency} call${entry.frequency === 1 ? "" : "s"} · json ${Math.round(entry.jsonshare * 100)}% · stable ${Math.round(entry.stability * 100)}%${entry.payloadshape.length > 0 ? ` · ${entry.payloadshape.slice(0, 5).join(", ")}` : ""}`;
      card.append(row);
    }
    netviewroot.append(card);
  }
  const actions = document.createElement("div");
  actions.className = "actions";
  actions.append(button(`Export netlog (${exchanges.length} exchange${exchanges.length === 1 ? "" : "s"})`, () => request({ kind: "exportnetlog" }).then(() => status("Exported the captured run log through the reviewed download flow.")).catch(error => status(error instanceof Error ? error.message : String(error), true))));
  if (active) {
    const retentioninput = document.createElement("input");
    retentioninput.placeholder = "captured body retention (records)";
    retentioninput.value = context.bodyretention !== undefined ? String(context.bodyretention) : "";
    retentioninput.setAttribute("aria-label", "captured body retention window");
    actions.append(retentioninput, button("Save body retention", () => request({ kind: "setbodyretention", retention: retentioninput.value === "" ? undefined : Number(retentioninput.value) }).then(() => status(`Captured body retention saved as ${retentioninput.value === "" ? "keep every body" : retentioninput.value} records; exchange metadata always survives.`)).then(refresh)));
  }
  netviewroot.append(actions);
}

function rendercapabilities(report?: capabilityreport): void {
  if (!capabilitiestext) return;
  if (!report) { capabilitiestext.textContent = "Optional capabilities unknown."; return; }
  capabilitiestext.textContent = `tabs ${report.tabs ? "granted" : "absent"} · downloads ${report.downloads ? "granted" : "absent"} · clipboard read ${report.clipboardread ? "granted" : "absent"} · clipboard write ${report.clipboardwrite ? "granted" : "absent"}`;
}

function renderaudit(events: auditevent[]): void { if (!auditroot) return; auditroot.replaceChildren(); for (const event of events.slice(0, 12)) { const item = document.createElement("li"); item.textContent = `${new Date(event.at).toLocaleTimeString()} · ${event.kind} · ${event.summary}`; auditroot.append(item); } }
function renderdiagnostic(report?: diagnosticreport): void { if (!diagnosticroot) return; diagnosticroot.replaceChildren(); if (!report) { diagnosticroot.textContent = "Run a local diagnostic after starting a session to record bridge and page-shape health."; return; } const values = [`origin: ${report.origin}`, `title: ${report.title || "untitled"}`, `interactive elements: ${report.interactivecount}`, `forms: ${report.formcount}`, `page text length: ${report.textlength}`, `bridge available: ${report.bridgeavailable ? "yes" : "no"}`]; for (const value of values) { const item = document.createElement("li"); item.textContent = value; diagnosticroot.append(item); } }
/** Renders the run timeline view: console capture consent prompts, level, source and step filters, entries with spam collapse counts and step markers, errors expanded into their stack frames, long task bars beside their steps and the level count summary with the retention setting. */
function rendertimeline(context: { plan?: agentplan; timeline?: { entries: timelineentry[]; errors: errorrecord[]; rejections: rejectionrecord[]; longtasks: longtaskentry[]; levelcounts: Record<string, number> }; consoleconsents?: consoleconsentrecord[]; timelineretention?: number; levelsummaries?: Array<{ runid: string; counts: Record<string, number>; at: number }>; rotationtargets?: Array<{ target: string; runid: string; entries: number; at: number }> }): void {
  if (!timelineroot) return;
  timelineroot.replaceChildren();
  const waiting = (context.consoleconsents ?? []).filter(consent => consent.approved === undefined);
  for (const consent of waiting) {
    const card = document.createElement("div");
    card.className = "consentcard";
    const prompt = document.createElement("p");
    prompt.textContent = `Console capture consent: ${consent.prompt}`;
    card.append(prompt, button("Approve console capture", () => request({ kind: "approveconsoleconsent", id: consent.id }).then(() => status(`Console capture on ${consent.origin} approved; run the watchconsole step again.`)).then(refresh)));
    timelineroot.append(card);
  }
  const entries = context.timeline?.entries ?? [];
  const errors = context.timeline?.errors ?? [];
  const rejections = context.timeline?.rejections ?? [];
  const longtasks = context.timeline?.longtasks ?? [];
  if (entries.length === 0 && errors.length === 0 && rejections.length === 0 && longtasks.length === 0) { timelineroot.textContent = "Run watchconsole, watcherrors or watchtasks steps to fill the run timeline."; return; }
  const levels = ["error", "warn", "info", "log", "debug", "trace"] as const;
  const sources = ["console", "error", "rejection", "resource", "longtask", "network"] as const;
  const filters = document.createElement("div");
  filters.className = "actions";
  for (const level of levels) filters.append(button(timelinefilter.level === level ? `level ${level} ✓` : `level ${level}`, async () => { timelinefilter.level = timelinefilter.level === level ? "" : level; await refresh(); }));
  for (const source of sources) filters.append(button(timelinefilter.source === source ? `source ${source} ✓` : `source ${source}`, async () => { timelinefilter.source = timelinefilter.source === source ? "" : source; await refresh(); }));
  timelineroot.append(filters);
  const stepids = [...new Set(entries.map(entry => entry.stepid))];
  if (stepids.length > 1) {
    const select = document.createElement("select");
    select.style.width = "100%";
    const any = document.createElement("option");
    any.value = "";
    any.textContent = "every step";
    select.append(any);
    for (const stepid of stepids) {
      const option = document.createElement("option");
      option.value = stepid;
      option.textContent = `step ${stepid}`;
      if (timelinefilter.stepid === stepid) option.selected = true;
      select.append(option);
    }
    select.addEventListener("change", () => { timelinefilter.stepid = select.value; void refresh(); });
    timelineroot.append(select);
  }
  const shown = entries.filter(entry => (timelinefilter.level === "" || entry.level === timelinefilter.level) && (timelinefilter.source === "" || entry.source === timelinefilter.source) && (timelinefilter.stepid === "" || entry.stepid === timelinefilter.stepid)).slice().reverse().slice(0, 60);
  const list = document.createElement("ul");
  list.className = "audit";
  for (const entry of shown) {
    const item = document.createElement("li");
    item.className = "timelinerow";
    item.dataset.level = entry.level;
    const head = document.createElement("p");
    head.className = "timeline";
    head.textContent = `${new Date(entry.time).toLocaleTimeString()} · ${entry.level} · ${entry.source} · step ${entry.stepid}${entry.repeat !== undefined && entry.repeat > 1 ? ` · collapsed ×${entry.repeat}` : ""}`;
    const message = document.createElement("p");
    message.textContent = entry.message;
    item.append(head, message);
    if (entry.level === "error" && (entry.source === "error" || entry.source === "rejection")) {
      const record = entry.source === "error" ? errors.find(candidate => candidate.stepid === entry.stepid && candidate.message === entry.message) : rejections.find(candidate => candidate.stepid === entry.stepid && candidate.reason === entry.message);
      const frames = record && "frames" in record ? record.frames : [];
      if (frames.length > 0) {
        const expand = document.createElement("details");
        const summary = document.createElement("summary");
        summary.textContent = `${frames.length} stack frame${frames.length === 1 ? "" : "s"}`;
        const pre = document.createElement("pre");
        pre.textContent = frames.map(frame => `at ${frame.functionname ?? "<anonymous>"} (${frame.url}:${frame.line}${frame.column !== undefined ? `:${frame.column}` : ""})`).join("\n");
        expand.append(summary, pre);
        item.append(expand);
      }
    }
    list.append(item);
  }
  timelineroot.append(list);
  const maxtask = longtasks.reduce((max, task) => Math.max(max, task.duration), 0);
  for (const task of longtasks.slice(0, 12)) {
    const bar = document.createElement("div");
    bar.className = "taskbar";
    const label = document.createElement("p");
    label.className = "timeline";
    label.textContent = `long task · ${task.duration} ms${task.attributions.length > 0 ? ` · ${task.attributions.join(", ")}` : ""} · step ${task.stepid}`;
    const gauge = document.createElement("div");
    gauge.className = "taskgauge";
    const fill = document.createElement("div");
    fill.className = "taskfill";
    fill.style.width = maxtask > 0 ? `${Math.round((task.duration / maxtask) * 100)}%` : "0%";
    gauge.append(fill);
    bar.append(label, gauge);
    timelineroot.append(bar);
  }
  const counts = context.timeline?.levelcounts ?? {};
  const summaryline = document.createElement("p");
  summaryline.className = "muted";
  const expired = (context.levelsummaries ?? []).reduce((total, item) => total + Object.values(item.counts).reduce((sum, count) => sum + count, 0), 0);
  summaryline.textContent = `${entries.length} live entr${entries.length === 1 ? "y" : "ies"} (${levels.map(level => `${counts[level] ?? 0} ${level}`).join(" · ")})${expired > 0 ? ` · ${expired} expired into level summaries` : ""}${(context.rotationtargets ?? []).length > 0 ? ` · ${(context.rotationtargets ?? []).reduce((total, target) => total + target.entries, 0)} rotated to overflow stores` : ""}.`;
  const retentioninput = document.createElement("input");
  retentioninput.type = "number";
  retentioninput.min = "0";
  retentioninput.placeholder = "timeline retention";
  retentioninput.value = context.timelineretention !== undefined ? String(context.timelineretention) : "";
  timelineroot.append(summaryline, retentioninput, button("Save timeline retention", () => request({ kind: "settimelineretention", retention: retentioninput.value === "" ? undefined : Number(retentioninput.value) }).then(() => status(`Timeline retention saved as ${retentioninput.value === "" ? "keep every entry" : retentioninput.value} entries; level count summaries always survive.`)).then(refresh)));
}

/** Renders the console diff view: two run id fields, the compare action and the added, removed and repeated lines of the compared console outputs. */
function renderconsolediff(): void {
  if (!consolediffroot) return;
  consolediffroot.replaceChildren();
  const baseinput = document.createElement("input");
  baseinput.placeholder = "base run id";
  const targetinput = document.createElement("input");
  targetinput.placeholder = "target run id";
  consolediffroot.append(baseinput, targetinput, button("Compare console output", () => request({ kind: "consolediff", base: baseinput.value, target: targetinput.value }).then(value => {
    const parsed = value as { diff: consolediff };
    if (!parsed) throw new Error("The console diff returned no result.");
    lastdiff = parsed.diff;
    status(`Diffed runs ${parsed.diff.base} and ${parsed.diff.target}: ${parsed.diff.added} added, ${parsed.diff.removed} removed and ${parsed.diff.repeated} repeated line${parsed.diff.added + parsed.diff.removed + parsed.diff.repeated === 1 ? "" : "s"}.`);
    renderconsolediff();
  })));
  if (!lastdiff) { const hint = document.createElement("p"); hint.className = "muted"; hint.textContent = "Compare the console output of two runs to see added, removed and repeated lines."; consolediffroot.append(hint); return; }
  const headline = document.createElement("p");
  headline.className = "muted";
  headline.textContent = `Run ${lastdiff.base} became run ${lastdiff.target}: ${lastdiff.added} added, ${lastdiff.removed} removed and ${lastdiff.repeated} repeated.`;
  const list = document.createElement("ul");
  list.className = "audit";
  for (const line of lastdiff.lines.slice(0, 80)) {
    const item = document.createElement("li");
    item.className = `diffrow ${line.kind}`;
    item.textContent = `${line.kind}${line.count !== undefined ? ` ×${line.count}` : ""}: ${line.text}`;
    list.append(item);
  }
  consolediffroot.append(headline, list);
}

/** Renders the debugger view: the debugger consent prompts with the domain allowlist shown, the session state with its domains and honest derivation, the sent commands with durations and results, the breakpoints with hit counts and conditions, the pause banner with call frames, the watch expression values per pause, the script override list with revert controls and the domain event counts streamed beside the run timeline. */
function renderdebugger(context: { session?: { stoppedat?: number; pausedat?: number; expiresat: number; origin?: string }; cdpsessions?: Array<{ id: string; runid: string; tabid: number; origin: string; attachedat: number; domains: string[]; debuggerversion: string; detachedat?: number; userdetached?: boolean }>; cdpcommands?: Array<{ id: string; sessionid: string; method: string; domain: string; duration: number; errorclass?: string; at: number }>; cdpeventrules?: Array<{ id: string; domain: string; event: string; events: number; closedat?: number; match?: string }>; breakpoints?: Array<{ id: string; runid: string; url: string; line: number; column?: number; condition?: string; hits: number; revertedat?: number }>; pauses?: Array<{ id: string; runid: string; stepid: string; reason: string; callframes: Array<{ functionname?: string; url: string; line: number; column?: number }>; hitbreakpoint?: string; domsnapshotid?: string; at: number; framesexpired?: boolean }>; watchexpressions?: Array<{ id: string; expression: string; scope: string; values: Array<{ pauseid: string; value: string; at: number }>; reviewed: boolean }>; scriptoverrides?: Array<{ id: string; urlpattern: string; hits: number; appliedat: number; revertedat?: number; reviewed: boolean }>; debuggergrants?: Array<{ id: string; origin: string; domains: string[]; approved?: boolean; consentedat: number; revokedat?: number }>; pauseretention?: number; breakpointceiling?: number; cdpattached?: number }): void {
  if (!debuggerroot) return;
  debuggerroot.replaceChildren();
  const waiting = (context.debuggergrants ?? []).filter(grant => grant.approved === undefined && grant.revokedat === undefined);
  for (const grant of waiting) {
    const card = document.createElement("div");
    card.className = "consentcard";
    const prompt = document.createElement("p");
    prompt.textContent = `Debugger attach on ${grant.origin} waits for your consent with the domain allowlist ${grant.domains.join(", ")} shown.`;
    card.append(prompt, button("Approve debugger consent", () => request({ kind: "approvedebuggerconsent", id: grant.id }).then(() => status(`Debugger consent on ${grant.origin} approved for ${grant.domains.join(", ")}; run the attachcdp step again.`)).then(refresh)));
    debuggerroot.append(card);
  }
  const granted = (context.debuggergrants ?? []).filter(grant => grant.approved === true && grant.revokedat === undefined);
  if (granted.length > 0) debuggerroot.append(button("Detach debugger now", () => request({ kind: "revokedebuggerconsent" }).then(value => { const parsed = value as { revoked: number; paused: boolean }; status(`Detached the debugger: ${parsed.revoked} consent record${parsed.revoked === 1 ? "" : "s"} revoked, every breakpoint and override reverted and the run paused for review.`); return refresh(); })));
  const sessions = context.cdpsessions ?? [];
  const attached = sessions.filter(session => session.detachedat === undefined);
  const sessionline = document.createElement("p");
  sessionline.className = "muted";
  sessionline.textContent = attached.length === 0
    ? "No devtools session is attached; run the attachcdp step behind the reviewed debugger consent."
    : `${attached.length} attached devtools session${attached.length === 1 ? "" : "s"}${attached[0] !== undefined ? ` of ${attached[0].origin} with the domains ${attached[0].domains.join(", ")} enabled through ${attached[0].debuggerversion}` : ""}.`;
  debuggerroot.append(sessionline);
  const lastpause = (context.pauses ?? [])[0];
  if (lastpause !== undefined && context.cdpattached !== 0) {
    const banner = document.createElement("div");
    banner.className = "bannercard";
    const head = document.createElement("p");
    head.textContent = `Paused on ${lastpause.reason}${lastpause.hitbreakpoint !== undefined ? ` at breakpoint ${lastpause.hitbreakpoint}` : ""}${lastpause.domsnapshotid !== undefined ? ` with dom snapshot ${lastpause.domsnapshotid}` : ""}.`;
    banner.append(head);
    if (lastpause.framesexpired === true) {
      const expired = document.createElement("p");
      expired.textContent = "The call frames expired from the pause retention window; the pause reason and hit breakpoint survive.";
      banner.append(expired);
    } else {
      for (const frame of lastpause.callframes.slice(0, 6)) {
        const row = document.createElement("p");
        row.textContent = `${frame.functionname ?? "anonymous"} ${frame.url}:${frame.line}${frame.column !== undefined ? `:${frame.column}` : ""}`;
        banner.append(row);
      }
    }
    debuggerroot.append(banner);
  }
  const commands = context.cdpcommands ?? [];
  if (commands.length > 0) {
    const head = document.createElement("h4");
    head.textContent = "Raw protocol commands";
    const list = document.createElement("ul");
    list.className = "audit";
    for (const command of commands.slice(0, 12)) {
      const item = document.createElement("li");
      const badge = document.createElement("span");
      badge.className = "protocolbadge";
      badge.textContent = "raw protocol";
      item.append(`${command.method} · ${command.duration} ms${command.errorclass !== undefined ? ` · ${command.errorclass}` : ""} · session ${command.sessionid.slice(0, 8)}`, badge);
      list.append(item);
    }
    debuggerroot.append(head, list);
  }
  const breakpoints = (context.breakpoints ?? []).filter(spec => spec.revertedat === undefined);
  if (breakpoints.length > 0) {
    const head = document.createElement("h4");
    head.textContent = "Breakpoints";
    const list = document.createElement("ul");
    list.className = "audit";
    for (const spec of breakpoints) {
      const item = document.createElement("li");
      item.textContent = `${spec.url}:${spec.line}${spec.column !== undefined ? `:${spec.column}` : ""} · ${spec.hits} hit${spec.hits === 1 ? "" : "s"}${spec.condition !== undefined ? ` · condition ${spec.condition}` : ""}`;
      list.append(item);
    }
    debuggerroot.append(head, list);
  }
  const watches = context.watchexpressions ?? [];
  if (watches.length > 0) {
    const head = document.createElement("h4");
    head.textContent = "Watch expressions";
    const list = document.createElement("ul");
    list.className = "audit";
    for (const watch of watches) {
      const item = document.createElement("li");
      const values = watch.values.slice(-4).map(value => `${value.value} @${value.pauseid.slice(0, 6)}`).join(" · ");
      item.textContent = `${watch.expression} (${watch.scope} scope${watch.reviewed ? ", reviewed" : ""})${values ? `: ${values}` : ": no value captured yet"}`;
      list.append(item);
    }
    debuggerroot.append(head, list);
  }
  const overrides = context.scriptoverrides ?? [];
  if (overrides.length > 0) {
    const head = document.createElement("h4");
    head.textContent = "Script overrides";
    const list = document.createElement("ul");
    list.className = "audit";
    for (const spec of overrides) {
      const item = document.createElement("li");
      item.textContent = `${spec.urlpattern} · ${spec.hits} applied evaluation${spec.hits === 1 ? "" : "s"}${spec.reviewed ? " · reviewed fixture" : ""}${spec.revertedat !== undefined ? " · reverted" : " · active"}`;
      if (spec.revertedat === undefined) item.append(button("Revert fixture", () => request({ kind: "revertcdpoverride", id: spec.id }).then(() => status(`Reverted the script override of ${spec.urlpattern}; later evaluations run the original source again.`)).then(refresh)));
      list.append(item);
    }
    debuggerroot.append(head, list);
  }
  const rules = context.cdpeventrules ?? [];
  if (rules.length > 0) {
    const head = document.createElement("h4");
    head.textContent = "Domain events beside the timeline";
    const list = document.createElement("ul");
    list.className = "audit";
    for (const rule of rules.slice(0, 10)) {
      const item = document.createElement("li");
      item.textContent = `${rule.domain}.${rule.event}${rule.match !== undefined ? ` matching ${rule.match}` : ""} · ${rule.events} matched event${rule.events === 1 ? "" : "s"}${rule.closedat !== undefined ? " · closed" : ""}`;
      list.append(item);
    }
    debuggerroot.append(head, list);
  }
  const settingsline = document.createElement("p");
  settingsline.className = "muted";
  settingsline.textContent = `Pause retention ${context.pauseretention ?? "keeps every capture"} · breakpoint ceiling ${context.breakpointceiling ?? "none"}.`;
  const retentioninput = document.createElement("input");
  retentioninput.placeholder = "pause retention";
  retentioninput.value = context.pauseretention !== undefined ? String(context.pauseretention) : "";
  const ceilinginput = document.createElement("input");
  ceilinginput.placeholder = "breakpoint ceiling";
  ceilinginput.value = context.breakpointceiling !== undefined ? String(context.breakpointceiling) : "";
  debuggerroot.append(settingsline, retentioninput, ceilinginput, button("Save debugger settings", () => Promise.all([request({ kind: "setpauseretention", retention: retentioninput.value === "" ? undefined : Number(retentioninput.value) }), request({ kind: "setbreakpointceiling", ceiling: ceilinginput.value === "" ? undefined : Number(ceilinginput.value) })]).then(() => status(`Debugger settings saved: pause retention ${retentioninput.value === "" ? "keeps every capture" : retentioninput.value} and breakpoint ceiling ${ceilinginput.value === "" ? "none" : ceilinginput.value}.`)).then(refresh)));
}

/** Renders the emulation view: the pending location consent prompts with their coordinates, the active layers per run with their revert plans and the manual revert button, the stacking warning when layers pile on one tab, the offline note when a network layer cuts the traffic, the user curated preset libraries with the preset editor, the blackbox patterns of the current run, the permission override history with restore states, the import and export of preset files through review and the restore of the stored state after a crash. */
function renderemulation(context: { plan?: agentplan; session?: { stoppedat?: number; expiresat: number; origin?: string }; emulation?: { layers: Array<{ id: string; runid: string; stepid: string; family: string; name: string; originscope: string; appliedat: number; revertedat?: number; revertplan: string[] }>; devices: Array<{ name: string; width: number; height: number; pixelratio: number; mobile: boolean }>; networks: Array<{ name: string; latency: number; download: number; upload: number; offline: boolean }>; locations: Array<{ name: string; latitude: number; longitude: number; accuracy: number }>; agents: Array<{ name: string; useragent: string; platform: string; brands: string[] }>; blackbox: Array<{ origin: string; rules: Array<{ urlpatterns: string[]; tracescope: string }> }>; permissions: Array<{ id: string; runid: string; origin: string; name: string; state: string; priorstate: string; appliedat: number; restoredat?: number }>; consents: Array<{ id: string; origin: string; latitude: number; longitude: number; approved?: boolean; consentedat: number; revokedat?: number }> }; emulatedlayers?: string[]; emulationretention?: number }): void {
  if (!emulationroot) return;
  emulationroot.replaceChildren();
  const emulation = context.emulation;
  if (!emulation) { emulationroot.textContent = "No emulation state is available yet; start a session and review a plan with emulation steps."; return; }
  const pending = emulation.consents.filter(consent => consent.approved === undefined && consent.revokedat === undefined);
  for (const consent of pending) {
    const card = document.createElement("div");
    card.className = "bannercard";
    const title = document.createElement("p");
    title.textContent = `Location consent needed on ${consent.origin}`;
    const coordinates = document.createElement("p");
    coordinates.textContent = `Reviewed coordinates: ${consent.latitude}, ${consent.longitude}; the override applies through a page-injected geolocation mask and the true browser location stays untouched.`;
    card.append(title, coordinates, button("Approve location consent", () => request({ kind: "approvelocationconsent", id: consent.id }).then(() => { status(`Approved the location consent for ${consent.latitude}, ${consent.longitude} on ${consent.origin}.`); return refresh(); })));
    emulationroot.append(card);
  }
  const active = emulation.layers.filter(layer => layer.revertedat === undefined);
  const state = document.createElement("p");
  state.textContent = `${active.length} active emulation layer${active.length === 1 ? "" : "s"} of run ${active[0]?.runid ?? "none"}${active.length > 1 ? "; the last applied layer wins conflicts" : ""}.`;
  emulationroot.append(state);
  if (active.length > 1) {
    const warn = document.createElement("p");
    warn.textContent = `Warning: ${active.length} layers stack on one tab (${active.map(layer => layer.name).join(", ")}); every mask reverts at run end in reverse order.`;
    warn.className = "muted";
    emulationroot.append(warn);
  }
  const offlinelayer = active.find(layer => layer.family === "network" && emulation.networks.some(preset => preset.name === layer.name && preset.offline));
  if (offlinelayer !== undefined) {
    const offline = document.createElement("p");
    offline.textContent = `Offline: the network layer ${offlinelayer.name} cuts the traffic the extension initiates; page traffic stays observed only.`;
    offline.className = "muted";
    emulationroot.append(offline);
  }
  for (const layer of active) {
    const row = document.createElement("div");
    row.className = "emulationrow";
    row.dataset.stacked = active.length > 1 ? "true" : "false";
    const line = document.createElement("p");
    line.textContent = `${layer.family} layer ${layer.name} on ${layer.originscope} applied ${new Date(layer.appliedat).toLocaleTimeString()} with the revert plan ${layer.revertplan.join(", ")}.`;
    row.append(line, button("Revert now", () => request({ kind: "revertemulation" }).then(() => { status("Reverted every active emulation layer of the run on review panel demand."); return refresh(); })));
    emulationroot.append(row);
  }
  if (active.length > 0) {
    emulationroot.append(button("Restore stored layers after a crash", () => request({ kind: "restoreemulation" }).then(() => { status("Restored the stored emulation layers of the run record."); return refresh(); })));
  }
  const families: Array<{ label: string; presets: Array<{ label: string; kind: string }> }> = [
    { label: "device presets", presets: emulation.devices.map(preset => ({ label: `${preset.name}: ${preset.width}x${preset.height} @${preset.pixelratio}${preset.mobile ? " mobile" : ""}`, kind: "device" })) },
    { label: "network presets", presets: emulation.networks.map(preset => ({ label: `${preset.name}: ${preset.latency}ms, ${preset.download}/${preset.upload} kbps${preset.offline ? ", offline" : ""}`, kind: "network" })) },
    { label: "location presets", presets: emulation.locations.map(preset => ({ label: `${preset.name}: ${preset.latitude}, ${preset.longitude} ±${preset.accuracy}m`, kind: "location" })) },
    { label: "agent presets", presets: emulation.agents.map(preset => ({ label: `${preset.name}: ${preset.platform} with ${preset.brands.length} brands`, kind: "agent" })) },
  ];
  for (const family of families) {
    const head = document.createElement("h4");
    head.textContent = family.label;
    emulationroot.append(head);
    if (family.presets.length === 0) {
      const empty = document.createElement("p");
      empty.className = "muted";
      empty.textContent = "No user curated preset yet; the library stays user data instead of a hardcoded list.";
      emulationroot.append(empty);
      continue;
    }
    for (const preset of family.presets) {
      const line = document.createElement("p");
      line.textContent = preset.label;
      emulationroot.append(line);
    }
  }
  const editor = document.createElement("details");
  const summary = document.createElement("summary");
  summary.textContent = "Preset editor";
  editor.append(summary);
  const nameinput = document.createElement("input");
  nameinput.placeholder = "preset name";
  const valueinput = document.createElement("input");
  valueinput.placeholder = 'preset json, for example {"name":"phone","width":390,"height":844,"pixelratio":3,"mobile":true}';
  const familyselect = document.createElement("select");
  for (const family of ["device", "network", "location", "agent"]) {
    const option = document.createElement("option");
    option.value = family;
    option.textContent = family;
    familyselect.append(option);
  }
  editor.append(nameinput, valueinput, familyselect, button("Save preset", async () => {
    let payload: unknown;
    try { payload = JSON.parse(valueinput.value); } catch { throw new Error("The preset payload must be reviewed JSON."); }
    if (payload && typeof payload === "object" && !Array.isArray(payload) && nameinput.value.trim()) payload = { ...(payload as Record<string, unknown>), name: nameinput.value.trim() };
    const kind = familyselect.value === "device" ? "setdevicepreset" : familyselect.value === "network" ? "setnetworkpreset" : familyselect.value === "location" ? "setlocationpreset" : "setagentpreset";
    const field = familyselect.value;
    await request({ kind, [field]: payload });
    status(`Stored the ${familyselect.value} preset in the user curated library.`);
    await refresh();
  }));
  const exportrow = document.createElement("div");
  exportrow.className = "actions";
  exportrow.append(button("Export preset file", () => request({ kind: "exportpresets" }).then(value => { const parsed = value as { exported: number }; status(`Exported ${parsed.exported} preset${parsed.exported === 1 ? "" : "s"} through the reviewed download flow.`); return refresh(); })));
  const importinput = document.createElement("input");
  importinput.type = "file";
  importinput.accept = "application/json";
  importinput.addEventListener("change", () => {
    const file = importinput.files?.[0];
    if (!file) return;
    void file.text().then(content => JSON.parse(content)).then(filevalue => request({ kind: "importpresets", file: filevalue })).then(value => { const parsed = value as { imported: number }; status(`Imported ${parsed.imported} reviewed preset${parsed.imported === 1 ? "" : "s"} into the library.`); return refresh(); }).catch(error => status(error instanceof Error ? error.message : String(error), true));
  });
  exportrow.append(importinput);
  editor.append(exportrow);
  emulationroot.append(editor);
  const blackbox = emulation.blackbox.filter(entry => entry.rules.length > 0);
  if (blackbox.length > 0) {
    const head = document.createElement("h4");
    head.textContent = "blackboxed patterns of the run";
    emulationroot.append(head);
    for (const entry of blackbox) {
      const line = document.createElement("p");
      line.textContent = `${entry.origin}: ${entry.rules.flatMap(rule => rule.urlpatterns).join(", ")} (${entry.rules.map(rule => rule.tracescope).join(", ")} scope)`;
      emulationroot.append(line);
    }
  }
  const restored = emulation.permissions.filter(record => record.restoredat === undefined);
  if (restored.length > 0) {
    const head = document.createElement("h4");
    head.textContent = "permission overrides pending restore";
    emulationroot.append(head);
    for (const record of restored) {
      const line = document.createElement("p");
      line.textContent = `${record.name} of ${record.origin} answered ${record.state} for run ${record.runid}; the prior ${record.priorstate} state restores at run end.`;
      emulationroot.append(line);
    }
  }
  const retentionrow = document.createElement("p");
  retentionrow.className = "muted";
  retentionrow.textContent = `Reverted layer state retention: ${context.emulationretention === undefined ? "keep every prior state" : `${context.emulationretention} layer${context.emulationretention === 1 ? "" : "s"}`}; the layer history itself always survives.`;
  emulationroot.append(retentionrow);
}

async function refresh(): Promise<void> { const context = await request({ kind: "context" }) as { plan?: agentplan; progress?: planprogress; diagnostic?: diagnosticreport; audit: auditevent[]; outcomes?: stepoutcome[]; capabilities?: capabilityreport; session?: { id: string; pausedat?: number; stoppedat?: number; expiresat: number; origin?: string }; map?: clickablemap; retries?: retryoutcome[]; a11y?: a11ycapture; reader?: readercapture; banners?: bannerreport[]; mutationevents?: mutationevent[]; focusevents?: focusevent[]; diffs?: snapshotdiff[]; selectors?: derivedselector[]; trail?: { trail: trailentry[] }; navrecords?: navrecord[]; ratestates?: ratelimitstate[]; safeties?: safetyverdict[]; curated?: curatedlist[]; waitprofiles?: waitprofilerecord[]; auths?: Array<{ origin: string; username: string; reviewedat: number }>; navcontrol?: navcontrol; navqueues?: navqueues; artifacts?: artifactrecord[]; tabs?: tabshape[]; windows?: windowshape[]; tabgroups?: tabgrouprecord[]; badges?: tabbadge[]; tabmetas?: tabmeta[]; clones?: Array<{ url: string; tabids: number[] }>; layouts?: tablayout[]; snapshots?: sessionsnapshot[]; closedtabs?: closedtab[]; tasktabgauge?: { used: number; ceiling?: number; over: boolean }; controltab?: controltabstate; profiles?: formprofile[]; tickets?: submitticket[]; wizards?: { wizards: wizardstate[]; picks: typeaheadpick[] }; picks?: typeaheadpick[]; errorreports?: errorreport[]; captchas?: captchahandoff[]; detections?: detectionrecord[]; codeentry?: boolean; datasets?: dataset[]; imports?: dataset[]; extractsessions?: extractsession[]; streams?: streamstate[]; exports?: Array<{ id: string; kind: string; name: string; rowcount: number; checksum: string; at: number }>; provenances?: provenancerecord[]; taskrules?: taskrules[]; sheetendpoints?: Array<{ endpoint: string; origin: string; configuredat: number; granted: boolean }>; downloads?: downloadrecord[]; mimefilters?: mimefilter[]; clipconsents?: clipboardconsentrecord[]; clips?: clipentry[]; netlogs?: netlogrecord[]; quarantines?: quarantineentry[]; capturecounters?: Array<{ taskid: string; counters: Record<string, number>; at: number }>; cleanuprules?: cleanuprule[]; cleanupruns?: cleanuprun[]; inventory?: artifactinventoryentry[]; scanhooks?: Array<{ scanner: string; endpoint: string; origin: string; configuredat: number; granted: boolean }>; captures?: Array<{ id: string; runid: string; stepid: string; kind: string; format: string; width: number; height: number; capturedat: number; name?: string; annotated?: boolean; target?: string; bytesexpired?: boolean }>; capturepairs?: shotpair[]; capturepolicy?: string; stitchprogress?: Array<{ stepid: string; done: number; total: number }>; media?: Array<{ id: string; runid: string; stepid: string; at: number; bytesexpired?: boolean } & Record<string, unknown>>; imagebatches?: Array<{ id: string; runid: string; stepid: string; images: Array<{ url: string; alt: string; width: number; height: number; bytes: number; mime: string }>; matched: number; downloaded: number; at: number }>; recordingconsents?: Array<{ id: string; prompt: string; origin: string; stepid: string; approved?: boolean; usedat?: number; at: number }>; recordingactive?: Array<{ id: string; kind: string; scope: string; startedat: number; stopat: number }>; recordingwindow?: number; calls?: Array<{ id: string; runid: string; stepid: string; kind: string; url: string; origin: string; method: string; status: number; statusclass: string; duration: number; retries: number; bytes: number; headernames: string[]; endpoint?: string; bodyexpired?: boolean; fields?: Array<{ name: string; path: string; kind: string; value?: unknown; missing?: boolean }>; errors?: string[]; streambytes?: number }>; fetchconsents?: Array<{ id: string; origin: string; headers: Array<{ name: string; value: string }>; approved?: boolean; expiresat: number; at: number }>; endpoints?: Array<{ name: string; method: string; url: string; version: number; headers?: Record<string, string>; schema?: { fields: Array<{ name: string; kind: string; required?: boolean; default?: string | number | boolean }> } }>; apikeys?: Array<{ name: string; origins: string[]; header: string; createdat: number; lastuse?: number }>; callretention?: number; fetchesactive?: number; exchanges?: Array<{ id: string; runid: string; stepid: string; correlationid: string; url: string; origin: string; method: string; status: number; statusclass: string; errorclass?: string; source: string; timing: number; bytes: number; mime?: string; bodyref?: string; bodyexpired?: boolean; requestheaders?: Record<string, string>; responseheaders?: Record<string, string> }>; channels?: Array<{ id: string; kind: string; url: string; origin: string; state: string; sent: number; received: number; reconnects: number; lasteventid?: string }>; subscriptions?: Array<{ id: string; url: string; origin: string; state: string; events: number; names: string[]; lasteventid?: string; cancel: { kind: string; value: string | number } }>; apimap?: Array<{ endpoint: string; method: string; mime: string; frequency: number; jsonshare: number; stability: number; origin: string; payloadshape: string[] }>; webrequestgrant?: boolean; bodyretention?: number; timelineretention?: number; timeline?: { entries: timelineentry[]; errors: errorrecord[]; rejections: rejectionrecord[]; longtasks: longtaskentry[]; levelcounts: Record<string, number> }; consoleconsents?: consoleconsentrecord[]; rotationtargets?: Array<{ target: string; runid: string; entries: number; at: number }>; levelsummaries?: Array<{ runid: string; counts: Record<string, number>; at: number }>; cdpsessions?: Array<{ id: string; runid: string; tabid: number; origin: string; attachedat: number; domains: string[]; debuggerversion: string; detachedat?: number; userdetached?: boolean }>; cdpcommands?: Array<{ id: string; sessionid: string; method: string; domain: string; duration: number; errorclass?: string; at: number }>; cdpeventrules?: Array<{ id: string; domain: string; event: string; events: number; closedat?: number; match?: string }>; breakpoints?: Array<{ id: string; runid: string; url: string; line: number; column?: number; condition?: string; hits: number; revertedat?: number }>; pauses?: Array<{ id: string; runid: string; stepid: string; reason: string; callframes: Array<{ functionname?: string; url: string; line: number; column?: number }>; hitbreakpoint?: string; domsnapshotid?: string; at: number; framesexpired?: boolean }>; watchexpressions?: Array<{ id: string; expression: string; scope: string; values: Array<{ pauseid: string; value: string; at: number }>; reviewed: boolean }>; scriptoverrides?: Array<{ id: string; urlpattern: string; hits: number; appliedat: number; revertedat?: number; reviewed: boolean }>; debuggergrants?: Array<{ id: string; origin: string; domains: string[]; approved?: boolean; consentedat: number; revokedat?: number }>; pauseretention?: number; breakpointceiling?: number; cdpattached?: number; socketsactive?: number; profileretention?: number; traceceiling?: number; profileactive?: number; profiletargets?: Array<{ kind: string; url: string; sessionid: string; attachedat: number }>; profile?: { flows: Array<{ id: string; runid: string; stepid: string; name: string; duration: number; steps: string[] }>; heaps: Array<{ id: string; runid: string; origin: string; bytesize: number; nodecount: number; capturedat: number; bytesexpired?: boolean }>; samples: Array<{ id: string; runid: string; stepid: string; usedbytes: number; limitbytes: number; at: number }>; trends: Array<{ runid: string; slope: number; samples: number; flaggedsteps: string[]; at: number }>; profiles: Array<{ id: string; runid: string; duration: number; samplecount: number; hotfunctions: string[]; at: number; samplesexpired?: boolean }>; shifts: Array<{ id: string; runid: string; stepid: string; score: number; starttime: number; selectors: string[]; at: number }>; traces: Array<{ id: string; runid: string; origin: string; categories: string[]; bytesize: number; events: number; annotations: Array<{ stepid: string; label: string; offset: number }>; startedat: number; endedat: number; bytesexpired?: boolean; exportedat?: number }>; sourcemaps: Array<{ id: string; runid: string; origin: string; scripturl: string; mapurl: string; parsed: boolean; at: number }>; consents: Array<{ id: string; origin: string; approved?: boolean; consentedat: number; revokedat?: number }> }; emulation?: { layers: Array<{ id: string; runid: string; stepid: string; family: string; name: string; originscope: string; appliedat: number; revertedat?: number; revertplan: string[] }>; devices: Array<{ name: string; width: number; height: number; pixelratio: number; mobile: boolean }>; networks: Array<{ name: string; latency: number; download: number; upload: number; offline: boolean }>; locations: Array<{ name: string; latitude: number; longitude: number; accuracy: number }>; agents: Array<{ name: string; useragent: string; platform: string; brands: string[] }>; blackbox: Array<{ origin: string; rules: Array<{ urlpatterns: string[]; tracescope: string }> }>; permissions: Array<{ id: string; runid: string; origin: string; name: string; state: string; priorstate: string; appliedat: number; restoredat?: number }>; consents: Array<{ id: string; origin: string; latitude: number; longitude: number; approved?: boolean; consentedat: number; revokedat?: number }> }; emulatedlayers?: string[]; emulationretention?: number; sessionmemory?: { records: sessionrecord[]; events: sessionevent[]; folders: sessionfolder[]; diffs: sessiondiff[]; auto?: { period: number; maxsnapshots: number; expiry: number }; crashed?: boolean }; autosnapshotstate?: autosnapshotstate; sessionretention?: number; taskstate?: taskstate; workflow?: { workflows: workflowrecord[]; runs: workflowrun[]; templates: steptemplate[]; log: runlogentry[]; scopes: variablescope[]; provenance: workflowprovenance[] }; runlogretention?: number; trigger?: { rules: Array<{ id: string; kind: string; workflowid: string; workflowname?: string; label: string; enabled: boolean; paused?: boolean; cooldown: number; lastfireat?: number; nextfireat?: number; fires: number; launches: number; suppressions: number; summary: Record<string, unknown> }>; queued: number }; triggerretention?: number; mcp?: { state: string; config: { bind?: string; port: number; transports: string[]; framesize?: number; queuedepth?: number; callretention?: number; enabled: boolean; remote?: boolean; httpstream?: { endpoint: string; streampath: string; tls: { mode: string; certificatefingerprint?: string; verifiedat?: number }; heartbeatms?: number; idlewindowms?: number }; remoteaccess?: { endpoint: string; tls: { mode: string }; maxclients?: number; tokenlifetimems?: number; approvaltimeout?: { windowms: number } } }; bind: string; port: number; localhost: boolean; clients: Array<{ id: string; transport: string; paired: boolean; connectedat: number; capabilities?: { protocolversion: string; toolversion: number; tools: number; transports: string[] }; toolfloor?: number; fingerprint?: string; pairedat?: number }>; bridge?: { id: string; host: string; connected: boolean; restarts: number; received: number; sent: number; startedat: number }; calls: Array<{ id: string; clientid: string; tool: string; origin: string; ok: boolean; code?: string; at: number; dryrun?: boolean; mocked?: boolean; batchid?: string; idempotencykey?: string; replayed?: boolean }>; calllog?: Array<{ id: string; clientid: string; tool: string; origin: string; ok: boolean; code?: string; at: number; dryrun?: boolean; mocked?: boolean; batchid?: string; idempotencykey?: string; replayed?: boolean }>; catalog: { tools: Array<{ name: string; version: number; description: string; risk: string; consentmeta?: { review: string; riskclass: string; approvalrequired: boolean; originscope: string }; inputschema: { type: string; properties: Record<string, { type: string; description: string; required?: boolean }>; required: string[] } }> }; launches: Array<{ id: string; host: string; pid: number; restart: boolean; at: number }>; remote: { endpoint: string; tls: { mode: string; certificaterequired: boolean; verified: boolean }; clients: number; paired: number; channelsopen: number; channelsdead: number; tokenslive: number }; pairing: Array<{ code: string; scopes: string[]; issuedat: number; expiresat: number }>; allowlist: Array<{ fingerprint: string; displayname: string; namespaces: string[]; grantedat: number; history: Array<{ at: number; actor: string; change: string }> }>; tokens: Array<{ id: string; clientid: string; scopes: string[]; issuedat: number; expiresat: number; revokedat?: number }>; identities: Array<{ fingerprint: string; displayname: string }>; handshakes: Array<{ id: string; clientid: string; method: string; outcome: string; at: number }>; channels: Array<{ id: string; clientid: string; openedat: number; lastbeatat: number; closedat?: number }>; approvals: Array<{ id: string; clientid: string; tool: string; reason: string; params: Record<string, unknown>; state: string; raisedat: number; timeoutat?: number; decidedat?: number; secretfields?: string[] }>; subscriptions?: Array<{ id: string; clientid: string; kinds: string[]; origin?: string; tool?: string; createdat: number; lastdeliveredat?: number }>; watches?: Array<{ id: string; clientid: string; resource: string; createdat: number; lastdeliveredat?: number }>; sampling?: Array<{ id: string; clientid: string; prompt: string; system?: string; pagecontent?: string; maxtokens?: number; state: string; requestedat: number; answeredat?: number; answer?: string }>; limits?: Array<{ clientid: string; windowms: number; budget?: number; windowstartedat: number; used: number }>; contexts?: Array<{ callid: string; clientid: string; tool: string; state: string; startedat: number; endedat?: number; idempotencykey?: string; dryrun?: boolean; batchid?: string; chunks: number; errorcode?: string }>; inflight?: Array<{ callid: string; clientid: string; tool: string; startedat: number; chunks: number; dryrun?: boolean }>; batches?: Array<{ id: string; clientid: string; state: string; stoponerror: boolean; createdat: number; finishedat?: number; calls: Array<{ id: string; name: string }>; outcomes: Array<{ callid: string; tool: string; ok: boolean; at: number }> }>; chunks?: Array<{ callid: string; seq: number; content: string; done: boolean; at: number }>; progressnotices?: Array<{ callid: string; percent?: number; message: string; cancellable: boolean; at: number }>; mocks?: Array<{ tool: string; testcontext: boolean; createdat: number }>; dryruntoggle?: boolean; idempotency?: Array<{ key: string; clientid: string; tool: string; createdat: number; expiresat: number }> }; llm?: llmview; swarm?: swarmview; environments?: environmentsview; security?: securityviewtype & { prompts?: Array<{ stepid: string; kind: string; origin: string; prompt: string }>; promptduration?: number; logretention?: number; maskshapes?: string[]; sessionorigin?: string }; sessionview?: sessioninterfaceview; }; renderplan(context.plan, context.progress, context.outcomes ?? [], context.retries ?? []); renderdiagnostic(context.diagnostic); rendermap(context.map); rendera11y(context.a11y); renderreader(context.reader); renderdetections(context.plan, context.outcomes ?? []); renderstream(context.mutationevents ?? [], context.focusevents ?? []); renderdiffs(context.diffs ?? []); renderbanners(context.banners ?? []); renderselectors(context.selectors ?? []); rendertrail(context.trail?.trail ?? []); rendernavigation(context); rendertabswindows(context); renderforms(context); renderdatasets(context); renderfiles(context); rendercaptures(context); rendermedia(context); rendercalls(context); rendernetview(context); rendertraffic(context); rendertimeline(context); renderdebugger(context); renderprofiling(context); renderemulation(context); rendersessions(context); renderworkflows(context); renderworkfloweditor(context); rendertriggers(context); renderagentprotocol(context); rendermodels(context); renderagents(context); renderenvironments(context); rendersecurity(context); rendersessioninterface(context); renderconsolediff(); renderaudit(context.audit); rendercapabilities(context.capabilities); if (context.session?.pausedat) status("Session paused. Reviewed actions are blocked until resume."); else status(context.session ? "Active session is visible. The extension is waiting for review." : "No active browser session."); }
async function create(kind: "proposelocal" | "proposeremote"): Promise<void> { await request({ kind, objective: objective?.value ?? "" }); await refresh(); }
localbutton?.addEventListener("click", () => create("proposelocal").catch(error => status(error instanceof Error ? error.message : String(error), true)));
remotebutton?.addEventListener("click", () => create("proposeremote").catch(error => status(error instanceof Error ? error.message : String(error), true)));
diagnosticbutton?.addEventListener("click", () => request({ kind: "diagnostic" }).then(() => refresh()).catch(error => status(error instanceof Error ? error.message : String(error), true)));
commandbutton?.addEventListener("click", () => request({ kind: "llmcommand", text: commandinput?.value ?? "" }).then(() => { status("The model parsed the command; the intent badge shows the classification."); return refresh(); }).catch(error => status(error instanceof Error ? error.message : String(error), true)));
commandinput?.addEventListener("keydown", event => { if (event.key === "Enter") commandbutton?.click(); });
refresh().catch(error => status(error instanceof Error ? error.message : String(error), true));

/** Renders the profiling view: the source map consent prompts, the flow duration bars per step, the heap samples with the growth trend line, the hot functions of the cpu profiles, the layout shifts with scores and impacted selectors, the trace records with export and replay controls grouped by category and step, the attach target state of iframes and workers, and the profile retention and trace byte ceiling settings. */
function renderprofiling(context: { session?: { stoppedat?: number; expiresat: number; origin?: string }; profile?: { flows: Array<{ id: string; runid: string; stepid: string; name: string; duration: number; steps: string[] }>; heaps: Array<{ id: string; runid: string; origin: string; bytesize: number; nodecount: number; capturedat: number; bytesexpired?: boolean }>; samples: Array<{ id: string; runid: string; stepid: string; usedbytes: number; limitbytes: number; at: number }>; trends: Array<{ runid: string; slope: number; samples: number; flaggedsteps: string[]; at: number }>; profiles: Array<{ id: string; runid: string; duration: number; samplecount: number; hotfunctions: string[]; at: number; samplesexpired?: boolean }>; shifts: Array<{ id: string; runid: string; stepid: string; score: number; starttime: number; selectors: string[]; at: number }>; traces: Array<{ id: string; runid: string; origin: string; categories: string[]; bytesize: number; events: number; annotations: Array<{ stepid: string; label: string; offset: number }>; startedat: number; endedat: number; bytesexpired?: boolean; exportedat?: number }>; sourcemaps: Array<{ id: string; runid: string; origin: string; scripturl: string; mapurl: string; parsed: boolean; at: number }>; consents: Array<{ id: string; origin: string; approved?: boolean; consentedat: number; revokedat?: number }> }; profileretention?: number; traceceiling?: number; profileactive?: number; profiletargets?: Array<{ kind: string; url: string; sessionid: string; attachedat: number }> }): void {
  if (!profilingroot) return;
  profilingroot.replaceChildren();
  const report = context.profile;
  const waiting = (report?.consents ?? []).filter(consent => consent.approved === undefined && consent.revokedat === undefined);
  for (const consent of waiting) {
    const card = document.createElement("div");
    card.className = "consentcard";
    const prompt = document.createElement("p");
    prompt.textContent = `Source map capture on ${consent.origin} waits for your consent; the map files of the loaded same origin scripts are fetched and parsed locally.`;
    card.append(prompt, button("Approve source map capture", () => request({ kind: "approvesourcemapconsent", id: consent.id }).then(() => status(`Source map capture on ${consent.origin} approved; run the capturesourcemaps step again.`)).then(refresh)));
    profilingroot.append(card);
  }
  const granted = (report?.consents ?? []).filter(consent => consent.approved === true && consent.revokedat === undefined);
  if (granted.length > 0) profilingroot.append(button("Revoke source map consent", () => request({ kind: "revokesourcemapconsent" }).then(value => { const parsed = value as { revoked: number }; status(`Revoked ${parsed.revoked} source map consent record${parsed.revoked === 1 ? "" : "s"}; the next capture needs a new reviewed prompt.`); return refresh(); })));
  const stateline = document.createElement("p");
  stateline.className = "muted";
  stateline.textContent = `${context.profileactive ?? 0} profiling instrument${(context.profileactive ?? 0) === 1 ? "" : "s"} active${(context.profiletargets ?? []).length > 0 ? ` with the targets ${(context.profiletargets ?? []).map(target => `${target.kind} ${target.url} (${target.sessionid.slice(0, 10)})`).join(", ")} attached through flattened sub sessions` : ""}.`;
  profilingroot.append(stateline);
  const flows = report?.flows ?? [];
  if (flows.length > 0) {
    const head = document.createElement("h4");
    head.textContent = "Flow durations per step";
    profilingroot.append(head);
    const maxflow = flows.reduce((max, metric) => Math.max(max, metric.duration), 0);
    for (const metric of flows.slice(0, 12)) {
      const bar = document.createElement("div");
      bar.className = "taskbar";
      const label = document.createElement("p");
      label.className = "timeline";
      label.textContent = `${metric.name} · ${metric.duration} ms · steps ${metric.steps.join(", ")}`;
      const gauge = document.createElement("div");
      gauge.className = "taskgauge";
      const fill = document.createElement("div");
      fill.className = "taskfill";
      fill.style.width = maxflow > 0 ? `${Math.round((metric.duration / maxflow) * 100)}%` : "0%";
      gauge.append(fill);
      bar.append(label, gauge);
      profilingroot.append(bar);
    }
  }
  const heaps = report?.heaps ?? [];
  const samples = report?.samples ?? [];
  const trend = (report?.trends ?? [])[0];
  if (samples.length > 0 || heaps.length > 0) {
    const head = document.createElement("h4");
    head.textContent = "Heap samples with the growth trend";
    profilingroot.append(head);
    const maxused = samples.reduce((max, sample) => Math.max(max, sample.usedbytes), 1);
    for (const sample of samples.slice(0, 12)) {
      const bar = document.createElement("div");
      bar.className = "taskbar";
      const label = document.createElement("p");
      label.className = "timeline";
      label.textContent = `${sample.usedbytes} of ${sample.limitbytes} bytes · step ${sample.stepid}`;
      const gauge = document.createElement("div");
      gauge.className = "taskgauge";
      const fill = document.createElement("div");
      fill.className = "taskfill";
      fill.style.width = `${Math.round((sample.usedbytes / maxused) * 100)}%`;
      gauge.append(fill);
      bar.append(label, gauge);
      profilingroot.append(bar);
    }
    const trendline = document.createElement("p");
    trendline.className = "muted";
    trendline.textContent = trend !== undefined ? `Trend slope ${trend.slope.toFixed(2)} bytes per millisecond over ${trend.samples} sample${trend.samples === 1 ? "" : "s"}${trend.flaggedsteps.length > 0 ? `; flagged steps ${trend.flaggedsteps.join(", ")}` : ""}.` : "No growth trend computed yet; trackmemory computes it from the samples beside every step.";
    profilingroot.append(trendline);
    if (heaps.length > 0) {
      const list = document.createElement("ul");
      list.className = "audit";
      for (const heap of heaps.slice(0, 6)) {
        const item = document.createElement("li");
        item.textContent = `snapshot ${heap.id.slice(0, 8)} · ${heap.bytesize} bytes · ${heap.nodecount} dom nodes${heap.bytesexpired === true ? " · heavy bytes expired" : ""}`;
        list.append(item);
      }
      profilingroot.append(list);
    }
  }
  const cpuprofiles = report?.profiles ?? [];
  if (cpuprofiles.length > 0) {
    const head = document.createElement("h4");
    head.textContent = "Cpu profiles with hot functions";
    const list = document.createElement("ul");
    list.className = "audit";
    for (const profile of cpuprofiles.slice(0, 6)) {
      const item = document.createElement("li");
      item.textContent = `profile ${profile.id.slice(0, 8)} · ${profile.duration} ms · ${profile.samplecount} sample${profile.samplecount === 1 ? "" : "s"} · hot ${profile.hotfunctions.slice(0, 4).join(", ") || "none"}${profile.samplesexpired === true ? " · heavy samples expired" : ""}`;
      list.append(item);
    }
    profilingroot.append(head, list);
  }
  const shifts = report?.shifts ?? [];
  if (shifts.length > 0) {
    const head = document.createElement("h4");
    head.textContent = "Layout shifts with scores and selectors";
    const list = document.createElement("ul");
    list.className = "audit";
    for (const shift of shifts.slice(0, 10)) {
      const item = document.createElement("li");
      item.textContent = `score ${shift.score.toFixed(4)} at ${Math.round(shift.starttime)} ms${shift.selectors.length > 0 ? ` · impacted ${shift.selectors.join(", ")}` : ""} · step ${shift.stepid}`;
      list.append(item);
    }
    profilingroot.append(head, list);
  }
  const traces = report?.traces ?? [];
  if (traces.length > 0) {
    const head = document.createElement("h4");
    head.textContent = "Traces with step annotations";
    profilingroot.append(head);
    const list = document.createElement("ul");
    list.className = "audit";
    for (const trace of traces.slice(0, 8)) {
      const item = document.createElement("li");
      item.textContent = `trace ${trace.id.slice(0, 8)} · ${trace.categories.join(", ")} · ${trace.events} event${trace.events === 1 ? "" : "s"} · ${trace.bytesize} bytes · ${trace.annotations.length} annotation${trace.annotations.length === 1 ? "" : "s"}${trace.bytesexpired === true ? " · heavy bytes expired" : ""}${trace.exportedat !== undefined ? " · exported" : ""}`;
      item.append(button("Replay trace", () => request({ kind: "tracereplay", traceid: trace.id }).then(value => { const replay = value as { events: Array<{ name: string; category: string; offset: number; stepid?: string }>; categories: Record<string, number>; annotations: Array<{ stepid: string; label: string }> }; const grouped = Object.entries(replay.categories).map(([category, count]) => `${category} ${count}`).join(", "); const steps = [...new Set(replay.events.map(event => event.stepid).filter((stepid): stepid is string => stepid !== undefined))].join(", "); status(`Trace replay of ${trace.id.slice(0, 8)}: ${replay.events.length} event${replay.events.length === 1 ? "" : "s"} grouped by category (${grouped}) and by step (${steps || "none"}) with ${replay.annotations.length} annotation${replay.annotations.length === 1 ? "" : "s"}.`); return refresh(); })));
      if (trace.bytesexpired !== true) item.append(button("Export trace", () => request({ kind: "exporttrace", traceid: trace.id }).then(() => status(`Exported the trace ${trace.id.slice(0, 8)} through the reviewed download flow with its ${trace.annotations.length} step annotation${trace.annotations.length === 1 ? "" : "s"}.`)).then(refresh)));
      list.append(item);
    }
    profilingroot.append(list);
  }
  const sourcemaps = report?.sourcemaps ?? [];
  if (sourcemaps.length > 0) {
    const head = document.createElement("h4");
    head.textContent = "Source maps";
    const list = document.createElement("ul");
    list.className = "audit";
    for (const ref of sourcemaps.slice(0, 10)) {
      const item = document.createElement("li");
      item.textContent = `${ref.scripturl} → ${ref.mapurl} · ${ref.parsed ? "parsed" : "unparsed"}`;
      list.append(item);
    }
    profilingroot.append(head, list);
  }
  const settingsline = document.createElement("p");
  settingsline.className = "muted";
  settingsline.textContent = `Profile retention ${context.profileretention ?? "keeps every heavy artifact"} · trace byte ceiling ${context.traceceiling ?? "none"}.`;
  const retentioninput = document.createElement("input");
  retentioninput.placeholder = "profile retention ms";
  retentioninput.value = context.profileretention !== undefined ? String(context.profileretention) : "";
  const ceilinginput = document.createElement("input");
  ceilinginput.placeholder = "trace byte ceiling";
  ceilinginput.value = context.traceceiling !== undefined ? String(context.traceceiling) : "";
  profilingroot.append(settingsline, retentioninput, ceilinginput, button("Save profiling settings", () => Promise.all([request({ kind: "setprofileretention", retention: retentioninput.value === "" ? undefined : Number(retentioninput.value) }), request({ kind: "settraceceiling", ceiling: ceilinginput.value === "" ? undefined : Number(ceilinginput.value) })]).then(() => status(`Profiling settings saved: profile retention ${retentioninput.value === "" ? "keeps every heavy artifact" : `${retentioninput.value} milliseconds`} and trace byte ceiling ${ceilinginput.value === "" ? "none" : `${ceilinginput.value} bytes`}.`)).then(refresh)));
}

/** Renders the sessions view of the 1.1.49 memory release: the crash restore banner after a browser restart, the auto snapshot state, the search box with its time window, the saved sessions grouped by folder with tags and timestamps, the restore review listing tabs, form state and captures before approval, the diff selection and its change view, the export review and the import review. */
function rendersessions(context: { session?: { stoppedat?: number; expiresat: number }; plan?: agentplan; sessionmemory?: { records: sessionrecord[]; events: sessionevent[]; folders: sessionfolder[]; diffs: sessiondiff[]; auto?: { period: number; maxsnapshots: number; expiry: number }; crashed?: boolean }; autosnapshotstate?: autosnapshotstate; sessionretention?: number; taskstate?: taskstate }): void {
  if (!sessionsroot) return;
  sessionsroot.replaceChildren();
  const memory = context.sessionmemory;
  const auto = context.autosnapshotstate;
  const crashed = memory?.crashed === true;
  if (crashed) {
    const banner = document.createElement("div");
    banner.className = "crashbanner";
    const title = document.createElement("p");
    title.textContent = `Browser restart interrupted the run${context.taskstate ? ` at step cursor ${context.taskstate.stepcursor}` : ""}; the crash restore stays inside the session consent model.`;
    banner.append(title);
    banner.append(button("Resume the interrupted run", async () => { const result = await request({ kind: "resumerun" }) as { executed: number; remaining: number }; status(`Resumed the run: ${result.executed} of ${result.remaining} remaining steps executed.`); await refresh(); }));
    banner.append(" ", button("Dismiss crash banner", async () => { await request({ kind: "clearautosnapshot" }).catch(() => undefined); status("Crash banner dismissed; the saved sessions stay available for restore."); await refresh(); }));
    sessionsroot.append(banner);
  }
  if (auto) {
    const state = document.createElement("p");
    state.textContent = `Auto snapshots: every ${auto.interval.period} ms · ${auto.count} of ${auto.interval.maxsnapshots} taken · expiry ${auto.interval.expiry} ms.`;
    sessionsroot.append(state, button("Clear auto snapshot interval", async () => { await request({ kind: "clearautosnapshot" }); status("Auto snapshot interval cleared."); await refresh(); }));
  }
  const search = document.createElement("div");
  search.className = "actions";
  const term = document.createElement("input");
  term.type = "search";
  term.placeholder = "Search sessions by name, url, title or captured text";
  term.value = sessionsview.term;
  term.addEventListener("input", () => { sessionsview.term = term.value; rendersessions(context); });
  const windowselect = document.createElement("select");
  for (const option of [["all", "all time"], ["hour", "last hour"], ["day", "last day"], ["week", "last week"]] as const) {
    const candidate = document.createElement("option");
    candidate.value = option[0];
    candidate.textContent = option[1];
    candidate.selected = sessionsview.window === option[0];
    windowselect.append(candidate);
  }
  windowselect.addEventListener("change", () => { sessionsview.window = windowselect.value as typeof sessionsview.window; rendersessions(context); });
  search.append(term, windowselect);
  sessionsroot.append(search);
  const importfile = document.createElement("input");
  importfile.type = "file";
  importfile.accept = "application/json";
  importfile.addEventListener("change", async () => {
    const file = importfile.files?.[0];
    if (!file) return;
    const content = await file.text();
    const review = await request({ kind: "loadsessionfile", content }) as { formatversion: number; records: Array<{ id: string; name: string; tabs: number }>; bytesize: number };
    sessionsview.importreview = { records: review.records, file: JSON.parse(content) };
    status(`Session file loaded: ${review.records.length} record${review.records.length === 1 ? "" : "s"} await review.`);
    await refresh();
  });
  sessionsroot.append(importfile);
  if (sessionsview.importreview) {
    const review = document.createElement("div");
    review.className = "sessionrow";
    const title = document.createElement("p");
    title.textContent = `Import review: ${sessionsview.importreview.records.map(record => `${record.name} (${record.tabs} tabs)`).join(", ")}.`;
    review.append(title, button("Approve full record import", async () => { const result = await request({ kind: "importsessionrecords", file: sessionsview.importreview?.file }) as { imported: number }; sessionsview.importreview = undefined; status(`Imported ${result.imported} session record${result.imported === 1 ? "" : "s"} after review.`); await refresh(); }), " ", button("Cancel import", async () => { sessionsview.importreview = undefined; status("Import cancelled."); await refresh(); }));
    sessionsroot.append(review);
  }
  const now = Date.now();
  const windowspan: Record<typeof sessionsview.window, number> = { all: Number.POSITIVE_INFINITY, hour: 3_600_000, day: 86_400_000, week: 604_800_000 };
  const records = (memory?.records ?? []).filter(record => {
    if (now - record.createdat > windowspan[sessionsview.window]) return false;
    if (!sessionsview.term.trim()) return true;
    const haystack = [record.name, record.folder ?? "", ...record.tags, ...record.tabs.flatMap(tab => [tab.url, tab.title, ...tab.forms.map(form => form.value)])].join(" ").toLowerCase();
    return sessionsview.term.trim().toLowerCase().split(/\s+/).every(term => haystack.includes(term));
  });
  if (sessionsview.diffselection.length >= 2) {
    const [left, right] = sessionsview.diffselection;
    sessionsroot.append(button("Diff the two selected sessions", async () => { const result = await request({ kind: "sessiondiff", left, right }) as { changes: Array<{ class: string; subject: string; detail: string }> }; status(`Session diff: ${result.changes.length} change${result.changes.length === 1 ? "" : "s"}.`); await refresh(); }));
  }
  const groups = new Map<string, sessionrecord[]>();
  for (const record of records) {
    const key = record.folder ?? "";
    groups.set(key, [...(groups.get(key) ?? []), record]);
  }
  for (const [folder, entries] of groups) {
    const group = document.createElement("details");
    group.className = "sessiongroup";
    group.open = true;
    const summary = document.createElement("summary");
    summary.textContent = folder === "" ? "Saved sessions" : `Folder ${folder} (${entries.length})`;
    group.append(summary);
    for (const record of entries) group.append(sessionrow(record, context.plan));
    sessionsroot.append(group);
  }
  if (records.length === 0) {
    const empty = document.createElement("p");
    empty.textContent = "No saved session matches the search yet; run a capturesession step to snapshot the browsing session.";
    sessionsroot.append(empty);
  }
  if (memory && memory.diffs.length > 0) {
    const diff = memory.diffs[0];
    if (diff) {
      const diffview = document.createElement("details");
      diffview.className = "sessiongroup";
      const summary = document.createElement("summary");
      summary.textContent = `Latest session diff (${diff.changes.length} changes)`;
      diffview.append(summary);
      for (const change of diff.changes) {
        const line = document.createElement("p");
        line.textContent = `${change.class} ${change.subject}: ${change.detail}`;
        line.dataset.class = change.class;
        diffview.append(line);
      }
      sessionsroot.append(diffview);
    }
  }
  if (sessionsview.restorereview) renderrestorereview(sessionsview.restorereview);
}

/** Renders one saved session row with its name, folder, tags, timestamp, restored badge and the restore, diff and export actions; the snapshot action runs through the reviewed capturesession step of the approved plan. */
function sessionrow(record: sessionrecord, plan?: agentplan): HTMLElement {
  const row = document.createElement("div");
  row.className = "sessionrow";
  row.dataset.selected = sessionsview.diffselection.includes(record.id) ? "true" : "false";
  const title = document.createElement("p");
  const badge = document.createElement("span");
  badge.className = "sessionbadge";
  badge.dataset.restored = record.restoredat !== undefined ? "true" : "false";
  badge.textContent = record.restoredat !== undefined ? "restored" : record.auto === true ? "auto" : "saved";
  title.append(`${record.name} · ${new Date(record.createdat).toLocaleString()} · ${record.tabs.length} tabs${record.folder !== undefined ? ` · folder ${record.folder}` : ""}${record.tags.length > 0 ? ` · ${record.tags.join(", ")}` : ""}`, badge);
  row.append(title);
  const actions = document.createElement("div");
  actions.className = "actions";
  actions.append(button("Restore under review", async () => { sessionsview.restorereview = record; await refresh(); }, record.sectionsexpired === true));
  actions.append(" ", button(sessionsview.diffselection.includes(record.id) ? "Unselect diff" : "Select diff", async () => {
    sessionsview.diffselection = sessionsview.diffselection.includes(record.id) ? sessionsview.diffselection.filter(id => id !== record.id) : [...sessionsview.diffselection, record.id].slice(-2);
    await refresh();
  }));
  actions.append(" ", button("Export reviewed file", async () => { const result = await request({ kind: "exportsessionfile", ids: [record.id] }) as { bytes: number }; status(`Exported the session file of ${result.bytes} bytes through the download flow.`); }));
  const capturestep = plan?.state === "approved" ? plan.steps.find(step => step.kind === "capturesession") : undefined;
  if (capturestep) actions.append(" ", button("Run reviewed snapshot step", async () => { const result = await request({ kind: "execute", stepid: capturestep.id }) as { summary: string }; status(result.summary); await refresh(); }));
  row.append(actions);
  return row;
}

/** Renders the restore review of one saved session: every tab, form state and capture is listed before the approval reopens anything. */
function renderrestorereview(record: sessionrecord): void {
  if (!sessionsroot) return;
  const review = document.createElement("div");
  review.className = "sessionrow";
  const title = document.createElement("p");
  title.textContent = `Restore review of ${record.name}: ${record.tabs.length} tabs, ${record.tabs.reduce((total, tab) => total + tab.forms.length, 0)} captured form fields, ${record.captures.length} linked captures.`;
  review.append(title);
  for (const tab of record.tabs) {
    const line = document.createElement("p");
    line.textContent = `Tab ${tab.index}: ${tab.title || tab.url} · ${tab.forms.length} form fields · scroll ${tab.scrollx},${tab.scrolly}`;
    review.append(line);
  }
  for (const entry of record.storage) {
    const line = document.createElement("p");
    line.textContent = `Local storage of ${entry.origin}: ${entry.keys.length} keys captured.`;
    review.append(line);
  }
  for (const entry of record.cookies) {
    const line = document.createElement("p");
    line.textContent = `Cookies of ${entry.origin}: ${entry.names.length} names captured, values held back.`;
    review.append(line);
  }
  review.append(button("Approve restore", async () => { const result = await request({ kind: "approverestore", sessionid: record.id }) as { restored: number; skippedorigins: string[] }; sessionsview.restorereview = undefined; status(`Restored ${result.restored} tabs${result.skippedorigins.length > 0 ? `; skipped ${result.skippedorigins.join(", ")}` : ""}.`); await refresh(); }), " ", button("Cancel restore", async () => { sessionsview.restorereview = undefined; status("Restore cancelled."); await refresh(); }));
  sessionsroot.append(review);
}

/** Renders the control flow summary of one reviewed step: the branch paths with the else path preview, the loop bounds and bodies, the parallel branches with the join policy and the try retry and timeout policies. */
function controlreviewtext(control: { kind: string; paths?: string[]; elsepath?: string; list?: string; item?: string; index?: string; bound?: number; selector?: string; branches?: string[]; strategy?: string; onfail?: string; attempts?: number; backoff?: string; rerun?: boolean; stepms?: number; runms?: number; expression?: string } | undefined): string {
  if (control === undefined) return "";
  if (control.kind === "condition") return ` · condition ${control.expression ?? "expression"}`;
  if (control.kind === "branch") return ` · paths ${(control.paths ?? []).join(", ")} · else ${control.elsepath ?? "else"} when no path matches`;
  if (control.kind === "loop") return ` · loops ${control.list ?? "list"} binding ${control.item ?? "item"} and ${control.index ?? "index"} per iteration · safety bound ${control.bound ?? 1000}`;
  if (control.kind === "repeatuntil") return ` · repeats until convergence · safety bound ${control.bound ?? 1000}`;
  if (control.kind === "whileloop") return ` · while the condition holds · safety bound ${control.bound ?? "reviewed"}`;
  if (control.kind === "foreach") return ` · foreach ${control.selector ?? "selector"} binding ${control.item ?? "item"} and ${control.index ?? "index"} per element`;
  if (control.kind === "parallel") return ` · branches ${(control.branches ?? []).join(", ")} · join ${control.strategy ?? "last"} · on failure ${control.onfail ?? "continue"}`;
  return ` · try with catch${control.rerun === true ? " and rerun" : ""}${control.attempts !== undefined ? ` · ${control.attempts} attempt${control.attempts === 1 ? "" : "s"} of ${control.backoff ?? "fixed"} backoff` : ""}${control.stepms !== undefined ? ` · step budget ${control.stepms} ms` : ""}${control.runms !== undefined ? ` · run budget ${control.runms} ms` : ""}`;
}

/** Renders one control flow decision of the runlog: the chosen branch path highlighted, the loop iterations as a collapsible group, the retry attempts with their backoff countdowns, the parallel branch lanes, the join result with the merged variables, the catch path of a try block and the timeout aborts with the exceeded budget. */
function rendercontroldecision(entry: runlogentry): HTMLElement {
  const block = document.createElement("details");
  block.className = "sessiongroup";
  const control = entry.details?.control as { kind?: string; branch?: { path: string; reason: string }; loops?: Array<{ path: string; ok: boolean }>; retries?: Array<{ attempt: number; delay: number; errorclass: string }>; timeouts?: Array<{ budget: number; scope: string }>; join?: { strategy: string; conflicts: string[]; merged: string[] }; branches?: Array<{ branchid: string; ok: boolean; summary: string; cancelled?: boolean }>; catch?: { errorclass: string; rerun: boolean } } | undefined;
  const summary = document.createElement("summary");
  summary.textContent = `control flow · ${control?.kind ?? "decision"} · ${entry.summary}`;
  block.append(summary);
  if (control?.branch !== undefined) {
    const line = document.createElement("p");
    line.textContent = `Chose the path ${control.branch.path}: ${control.branch.reason}`;
    line.dataset.class = "added";
    line.dataset.branch = control.branch.path;
    block.append(line);
  }
  if (control?.loops !== undefined && control.loops.length > 0) {
    const group = document.createElement("details");
    group.className = "sessiongroup";
    const groupsummary = document.createElement("summary");
    groupsummary.textContent = `Loop iterations (${control.loops.length})`;
    group.append(groupsummary);
    for (const counter of control.loops) {
      const line = document.createElement("p");
      line.textContent = `${counter.path} · ${counter.ok ? "completed" : "failed"}`;
      line.dataset.class = counter.ok ? "added" : "changed";
      group.append(line);
    }
    block.append(group);
  }
  if (control?.retries !== undefined && control.retries.length > 0) {
    for (const attempt of control.retries) {
      const line = document.createElement("p");
      line.textContent = `Retry attempt ${attempt.attempt} after a ${attempt.delay} ms backoff countdown for the ${attempt.errorclass} error class.`;
      line.dataset.class = "changed";
      block.append(line);
    }
  }
  if (control?.timeouts !== undefined && control.timeouts.length > 0) {
    for (const abort of control.timeouts) {
      const line = document.createElement("p");
      line.textContent = `Timeout abort: the ${abort.scope} exceeded its reviewed budget of ${abort.budget} milliseconds.`;
      line.dataset.class = "changed";
      line.dataset.timeout = "true";
      block.append(line);
    }
  }
  if (control?.branches !== undefined && control.branches.length > 0) {
    const lanes = document.createElement("details");
    lanes.className = "sessiongroup";
    const lannessummary = document.createElement("summary");
    lannessummary.textContent = `Parallel branch lanes (${control.branches.length})`;
    lanes.append(lannessummary);
    for (const outcome of control.branches) {
      const lane = document.createElement("p");
      lane.textContent = `lane ${outcome.branchid} · ${outcome.cancelled === true ? "cancelled" : outcome.ok ? "completed" : "failed"} · ${outcome.summary}`;
      lane.dataset.class = outcome.ok && outcome.cancelled !== true ? "added" : "changed";
      lanes.append(lane);
    }
    block.append(lanes);
  }
  if (control?.join !== undefined) {
    const line = document.createElement("p");
    line.textContent = `Join under the ${control.join.strategy} strategy merged ${control.join.merged.join(", ") || "no variable"}${control.join.conflicts.length > 0 ? ` with the conflicts ${control.join.conflicts.join(", ")}` : " with no conflict"}.`;
    line.dataset.class = control.join.conflicts.length > 0 ? "changed" : "added";
    block.append(line);
  }
  if (control?.catch !== undefined) {
    const line = document.createElement("p");
    line.textContent = `The catch handler ran after the ${control.catch.errorclass} failure${control.catch.rerun ? " and reran the fragile body" : ""}.`;
    line.dataset.class = "changed";
    block.append(line);
  }
  return block;
}

/** Renders the workflow view: the composed workflows with their run and dry run actions behind the plan review, the approval prompt of the first real run with the expanded step list, the live step timeline with checkpoint markers and dry run marks, the variable values per scope, the inline expression results, the active block highlight, the runlog stream and the single step execution from the step context. */
function renderworkflows(context: { session?: { stoppedat?: number; expiresat: number }; plan?: agentplan; workflow?: { workflows: workflowrecord[]; runs: workflowrun[]; templates: steptemplate[]; log: runlogentry[]; scopes: variablescope[]; provenance: workflowprovenance[] } }): void {
  if (!workflowsroot) return;
  workflowsroot.replaceChildren();
  const state = context.workflow;
  const runs = state?.runs ?? [];
  const running = runs.filter(run => run.state === "running");
  const latest = runs[0];
  const title = document.createElement("p");
  title.textContent = `${state?.workflows.length ?? 0} composed workflow${(state?.workflows.length ?? 0) === 1 ? "" : "s"} · ${running.length} running in the background · ${state?.templates.length ?? 0} shared step template${(state?.templates.length ?? 0) === 1 ? "" : "s"}.`;
  workflowsroot.append(title);
  for (const record of state?.workflows ?? []) {
    const row = document.createElement("div");
    row.className = "sessionrow";
    const headline = document.createElement("p");
    const badge = document.createElement("span");
    badge.className = "sessionbadge";
    badge.dataset.restored = "false";
    badge.textContent = record.risk === "sensitive" ? "sensitive" : record.risk;
    headline.append(`${record.name} v${record.version} · ${record.steps.length} steps · ${record.origins.join(", ")}`, badge);
    row.append(headline);
    const actions = document.createElement("div");
    actions.className = "actions";
    const planstep = (kind: "runworkflow" | "dryrun"): toolstep | undefined => (context.plan?.state === "approved" ? context.plan.steps.find(step => step.kind === kind && (() => { try { return JSON.parse(step.options ?? "{}").workflowid === record.id; } catch { return false; } })()) : undefined);
    const runstepofplan = planstep("runworkflow");
    const drystepofplan = planstep("dryrun");
    actions.append(button("Review expanded steps", async () => { const review = await request({ kind: "workflowreview", workflowid: record.id }) as { steps: Array<{ id: string; kind: string; label: string; block?: string; target?: string; bindings?: unknown[]; expression?: { operator: string; result: string }; extract?: { groups: string[] }; control?: { kind: string; paths?: string[]; elsepath?: string; list?: string; item?: string; index?: string; bound?: number; selector?: string; branches?: string[]; strategy?: string; onfail?: string; attempts?: number; backoff?: string; rerun?: boolean; stepms?: number; runms?: number; expression?: string } }> }; workflowview.review = { workflowid: record.id, name: record.name, risk: record.risk, steps: review.steps }; status(`Workflow review: ${review.steps.length} expanded steps of ${record.name}.`); await refresh(); }));
    actions.append(" ", button("Approve run review", async () => { const result = await request({ kind: "approveworkflowrun", workflowid: record.id }) as { steps: number }; status(`Run review approved: ${result.steps} steps shown; the plan review still gates every run.`); await refresh(); }));
    actions.append(" ", button("Run reviewed workflow", async () => { if (!runstepofplan) { status("No approved runworkflow step of this workflow is in the plan.", true); return; } const result = await request({ kind: "execute", stepid: runstepofplan.id }) as { summary: string }; status(result.summary); await refresh(); }, runstepofplan === undefined));
    actions.append(" ", button("Dry run", async () => { if (!drystepofplan) { status("No approved dryrun step of this workflow is in the plan.", true); return; } const result = await request({ kind: "execute", stepid: drystepofplan.id }) as { summary: string }; status(result.summary); await refresh(); }, drystepofplan === undefined));
    row.append(actions);
    workflowsroot.append(row);
  }
  if ((state?.workflows.length ?? 0) === 0) {
    const empty = document.createElement("p");
    empty.textContent = "No composed workflow yet; run a composeworkflow step to freeze a reviewed step list.";
    workflowsroot.append(empty);
  }
  if (workflowview.review) {
    const review = document.createElement("div");
    review.className = "sessionrow";
    const headline = document.createElement("p");
    headline.textContent = `Workflow approval of ${workflowview.review.name} (${workflowview.review.risk} for review): every expanded step shows before the first real run.`;
    review.append(headline);
    const list = document.createElement("ol");
    for (const step of workflowview.review.steps) {
      const line = document.createElement("li");
      line.textContent = `${step.label} (${step.kind}${step.block !== undefined ? ` · block ${step.block}` : ""}${step.target !== undefined ? ` · ${step.target}` : ""}${step.expression !== undefined ? ` · expression ${step.expression.operator} into ${step.expression.result}` : ""}${step.extract !== undefined && step.extract.groups.length > 0 ? ` · extracts ${step.extract.groups.join(", ")}` : ""}${Array.isArray(step.bindings) && step.bindings.length > 0 ? ` · ${step.bindings.length} binding${step.bindings.length === 1 ? "" : "s"}` : ""}${controlreviewtext(step.control)}`;
      list.append(line);
      if (step.control !== undefined && (step.control.kind === "loop" || step.control.kind === "repeatuntil")) {
        const boundrow = document.createElement("div");
        boundrow.className = "actions";
        const boundlabel = document.createElement("label");
        boundlabel.textContent = `Safety bound of ${step.label}: `;
        const boundinput = document.createElement("input");
        boundinput.type = "number";
        boundinput.min = "1";
        boundinput.value = String(step.control.bound ?? 1000);
        boundlabel.append(boundinput);
        boundrow.append(boundlabel, " ", button("Apply bound before a run", async () => {
          const bound = Number(boundinput.value);
          if (!Number.isInteger(bound) || bound < 1) { status("The loop safety bound must be a positive integer with no code ceiling.", true); return; }
          const result = await request({ kind: "setloopbound", workflowid: workflowview.review?.workflowid, stepid: step.id, bound }) as { version: number };
          status(`Loop bound applied: the workflow was recomposed as version ${result.version} and the older version survives for the audit trail.`);
          await refresh();
        }));
        list.append(boundrow);
      }
    }
    review.append(list);
    review.append(button("Close workflow review", async () => { workflowview.review = undefined; status("Workflow review closed."); await refresh(); }));
    workflowsroot.append(review);
  }
  if (latest) {
    const timeline = document.createElement("details");
    timeline.className = "sessiongroup";
    timeline.open = latest.state === "running" || latest.state === "paused";
    const summary = document.createElement("summary");
    summary.textContent = `Run ${latest.id.slice(0, 8)} of ${latest.workflowid.slice(0, 8)}: ${latest.state}${latest.dryrun === true ? " (dry run)" : ""} at step cursor ${latest.cursor}.`;
    timeline.append(summary);
    const controls = document.createElement("div");
    controls.className = "actions";
    controls.append(button("Pause run", async () => { const result = await request({ kind: "pauseworkflowrun", runid: latest.id }) as { state: string }; status(`Workflow run ${result.state}.`); await refresh(); }, latest.state !== "running"));
    controls.append(" ", button("Resume run", async () => { const result = await request({ kind: "resumeworkflowrun", runid: latest.id }) as { state: string; cursor: number }; status(`Workflow run resumed and ended ${result.state} at cursor ${result.cursor}.`); await refresh(); }, latest.state !== "paused"));
    controls.append(" ", button("Cancel run", async () => { const result = await request({ kind: "cancelworkflowrun", runid: latest.id, reason: "sidepanel cancel" }) as { state: string }; status(`Workflow run ${result.state}.`); await refresh(); }, latest.state === "done" || latest.state === "cancelled"));
    timeline.append(controls);
    const record = state?.workflows.find(entry => entry.id === latest.workflowid);
    if (record) {
      const steps = document.createElement("ol");
      for (const [index, step] of record.steps.entries()) {
        const line = document.createElement("li");
        const entry = state?.log.find(candidate => candidate.stepid === step.id);
        const done = index < latest.cursor;
        line.textContent = `${step.label} (${step.kind}${step.block !== undefined ? ` · block ${step.block}` : ""})${done ? ` · done${entry?.checkpoint === true ? " · checkpointed" : ""}` : ""}${entry !== undefined ? ` · ${entry.state}: ${entry.summary}` : ""}`;
        line.dataset.class = entry?.state === "failed" || entry?.state === "refused" ? "changed" : done ? "added" : "unavailable";
        if (step.block !== undefined && index === latest.cursor) line.dataset.blockactive = "true";
        const singlestep = document.createElement("div");
        singlestep.className = "actions";
        singlestep.append(button("Run single step", async () => { const outcome = await request({ kind: "executeworkflowstep", runid: latest.id, stepid: step.id }) as { steps: Array<{ stepid: string; state: string; summary: string }> }; status(outcome.steps[0] ? `Single step ${outcome.steps[0].state}: ${outcome.steps[0].summary}` : "The single step returned no outcome."); await refresh(); }));
        line.append(singlestep);
        steps.append(line);
      }
      timeline.append(steps);
    }
    const runlog = document.createElement("div");
    for (const entry of state?.log ?? []) {
      const line = document.createElement("p");
      line.textContent = `${entry.state} · ${entry.label} · ${entry.duration} ms${entry.produced !== undefined && entry.produced.length > 0 ? ` · produced ${entry.produced.join(", ")}` : ""}${entry.consumed !== undefined && entry.consumed.length > 0 ? ` · consumed ${entry.consumed.join(", ")}` : ""} · ${entry.summary}`;
      line.dataset.class = entry.state === "failed" || entry.state === "refused" ? "changed" : "added";
      runlog.append(line);
      if (entry.details !== undefined && entry.details.control !== undefined) runlog.append(rendercontroldecision(entry));
    }
    timeline.append(runlog);
    workflowsroot.append(timeline);
    const scopes = state?.scopes ?? [];
    if (scopes.length > 0) {
      const scopeview = document.createElement("details");
      scopeview.className = "sessiongroup";
      const scopesummary = document.createElement("summary");
      scopesummary.textContent = `Variables per scope (${scopes.reduce((total, scope) => total + scope.variables.length, 0)} values)`;
      scopeview.append(scopesummary);
      for (const scope of scopes) {
        const line = document.createElement("p");
        line.textContent = `Scope ${scope.name}${scope.parent !== undefined ? ` (child of ${scope.parent})` : ""}: ${scope.variables.length === 0 ? "no variable" : scope.variables.map(variable => `${variable.name} = ${Array.isArray(variable.value) ? `[${variable.value.join(", ")}]` : String(variable.value)} (${variable.kind})`).join(" · ")}`;
        scopeview.append(line);
      }
      workflowsroot.append(scopeview);
    }
    const provenance = state?.provenance ?? [];
    if (provenance.length > 0) {
      const provenanceview = document.createElement("details");
      provenanceview.className = "sessiongroup";
      const provsummary = document.createElement("summary");
      provsummary.textContent = `Provenance (${provenance.length} entries)`;
      provenanceview.append(provsummary);
      for (const entry of provenance.slice(-12)) {
        const line = document.createElement("p");
        line.textContent = `${entry.kind} · ${entry.name} = ${Array.isArray(entry.value) ? `[${entry.value.join(", ")}]` : String(entry.value)}`;
        provenanceview.append(line);
      }
      workflowsroot.append(provenanceview);
    }
  }
}

/** Saves one file from the panel through a local blob download so workflow exports and share bundles leave the browser only by the user's hand. */
function savefile(filename: string, contents: string): void {
  const url = URL.createObjectURL(new Blob([contents], { type: "application/octet-stream" }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

/** Renders the workflow editor view of the 1.1.53 release: the canvas with draggable nodes, typed binding sockets and block containers, the mini map with viewport navigation, the zoom that keeps labels readable, the undo and redo stacks, the block palette with search, the step library of every reviewed kind grouped by category, the step inspector with options, bindings and nested params, the variable inspector, the run log with breakpoint marks, the run history with filters, the version timeline with diffs and rollbacks, the import review before activation, the export and share buttons, the background run toggle, the watchdog status and the per site policy override editor. */
function renderworkfloweditor(context: { session?: { stoppedat?: number; expiresat: number }; plan?: agentplan; workflow?: { workflows: workflowrecord[]; runs: workflowrun[]; templates: steptemplate[]; log: runlogentry[]; scopes: variablescope[] }; editor?: { versions: workflowversion[]; diffs: versiondiff[]; history: runhistoryentry[]; breakpoints: string[]; overrides: siteoverride[]; imports: Array<{ id: string; workflowid: string; name: string; version: number; steps: number; risk: string; importedat: number; filename?: string }>; backgroundruns: Record<string, boolean>; watchdog: { config?: watchdogconfig; events: watchdogrecord[] } } }): void {
  if (!workfloweditorroot) return;
  workfloweditorroot.replaceChildren();
  const editor = context.editor;
  const workflows = context.workflow?.workflows ?? [];
  const title = document.createElement("p");
  title.textContent = `${workflows.length} workflow${workflows.length === 1 ? "" : "s"} in the library · ${editor?.versions.length ?? 0} version${(editor?.versions.length ?? 0) === 1 ? "" : "s"} · ${editor?.history.length ?? 0} run history entr${(editor?.history.length ?? 0) === 1 ? "y" : "ies"} · ${editor?.imports.length ?? 0} pending import${(editor?.imports.length ?? 0) === 1 ? "" : "s"} · ${editor?.overrides.length ?? 0} site override${(editor?.overrides.length ?? 0) === 1 ? "" : "s"} · ${editor?.watchdog.events.length ?? 0} watchdog event${(editor?.watchdog.events.length ?? 0) === 1 ? "" : "s"}.`;
  workfloweditorroot.append(title);
  const openrow = document.createElement("div");
  openrow.className = "actions";
  for (const record of workflows) {
    openrow.append(button(`${record.name} v${record.version}`, async () => {
      const loaded = await request({ kind: "editormodel", workflowid: record.id }) as { model: editormodel };
      editorview.workflowid = record.id;
      editorview.model = loaded.model;
      editorview.selected = [];
      editorview.inspector = "";
      status(`Opened ${record.name} v${record.version} on the canvas with ${loaded.model.nodes.length} nodes.`);
      await refresh();
    }), " ");
  }
  if (editorview.model !== undefined) openrow.append(button("Close canvas", async () => { editorview.workflowid = ""; editorview.model = undefined; editorview.selected = []; editorview.inspector = ""; editorview.diff = undefined; status("Canvas closed; the stored versions survive."); await refresh(); }));
  workfloweditorroot.append(openrow);
  const model = editorview.model;
  if (model !== undefined) {
    /** Renders one canvas node element with its typed sockets, breakpoint mark, selection outline and pointer drag wiring. */
    const nodeelement = (node: editornode): HTMLElement => {
      const element = document.createElement("div");
      element.className = "editornode";
      element.style.left = `${node.x}px`;
      element.style.top = `${node.y}px`;
      const id = node.id ?? node.step?.id ?? node.invocation?.block ?? "";
      element.dataset.selected = editorview.selected.includes(id) ? "true" : "false";
      element.dataset.breakpoint = node.step?.breakpoint === true ? "true" : "false";
      element.dataset.invocation = node.invocation !== undefined ? "true" : "false";
      const kind = document.createElement("p");
      kind.className = "nodekind";
      kind.textContent = node.step !== undefined ? node.step.kind : `block ${node.invocation?.block ?? ""}`;
      element.append(kind);
      const label = document.createElement("p");
      label.textContent = node.step !== undefined ? node.step.label : (node.invocation?.label ?? "");
      element.append(label);
      if (node.invocation !== undefined) {
        const nested = model.blocks.find(block => block.name === node.invocation?.block);
        for (const entry of nested?.steps ?? []) {
          const child = document.createElement("p");
          child.textContent = entry && "kind" in entry ? `· ${entry.label} (${entry.kind})` : `· block ${(entry as { block: string }).block}`;
          element.append(child);
        }
      }
      const sockets = document.createElement("p");
      const targets = node.invocation !== undefined ? [id, ...(model.blocks.find(block => block.name === node.invocation?.block)?.steps ?? []).flatMap(entry => "id" in entry ? [entry.id] : [])] : [id];
      for (const edge of model.edges.filter(candidate => targets.includes(candidate.to))) {
        const socket = document.createElement("span");
        socket.className = "socket in";
        socket.textContent = `${edge.variable} (${edge.kind})`;
        sockets.append(socket, " ");
      }
      for (const edge of model.edges.filter(candidate => candidate.from === id)) {
        const socket = document.createElement("span");
        socket.className = "socket out";
        socket.textContent = `${edge.variable} →`;
        sockets.append(socket, " ");
      }
      if (node.invocation?.params !== undefined && node.invocation.params.length > 0) {
        for (const param of node.invocation.params) {
          const socket = document.createElement("span");
          socket.className = "socket";
          socket.textContent = `${param.name}: ${param.kind}`;
          sockets.append(socket, " ");
        }
      }
      element.append(sockets);
      element.addEventListener("click", () => { editorview.selected = [id]; editorview.inspector = id; void refresh(); });
      if (node.step !== undefined) {
        element.addEventListener("pointerdown", event => {
          if (event.button !== 0) return;
          const startx = event.clientX;
          const starty = event.clientY;
          const originx = node.x;
          const originy = node.y;
          element.setPointerCapture(event.pointerId);
          const move = (moveevent: PointerEvent): void => { element.style.left = `${originx + moveevent.clientX - startx}px`; element.style.top = `${originy + moveevent.clientY - starty}px`; };
          const drop = (upevent: PointerEvent): void => {
            element.removeEventListener("pointermove", move);
            element.removeEventListener("pointerup", drop);
            void (async () => {
              if (editorview.model === undefined) return;
              try {
                editorview.model = snapnode(editorview.model, id, originx + upevent.clientX - startx, originy + upevent.clientY - starty);
                status(`Snapped ${id} onto the block grid; drop it near a block column to attach.`);
              } catch (error) { status(error instanceof Error ? error.message : String(error), true); }
              await refresh();
            })();
          };
          element.addEventListener("pointermove", move);
          element.addEventListener("pointerup", drop);
        });
      }
      return element;
    };
    const canvascard = document.createElement("div");
    canvascard.className = "sessionrow";
    const toolbar = document.createElement("div");
    toolbar.className = "actions";
    toolbar.append(button("Undo", async () => { if (editorview.model === undefined) return; editorview.model = undoedit(editorview.model); status("Canvas edit undone; the redo stack keeps it."); await refresh(); }, (model.undo ?? []).length === 0));
    toolbar.append(" ", button("Redo", async () => { if (editorview.model === undefined) return; editorview.model = redoedit(editorview.model); status("Canvas edit redone."); await refresh(); }, (model.redo ?? []).length === 0));
    toolbar.append(" ", button("Toggle breakpoint", async () => { if (editorview.model === undefined || editorview.inspector === "") { status("Select a step node first.", true); return; } editorview.model = markbreakpoint(editorview.model, editorview.inspector); status(`Breakpoint toggled on ${editorview.inspector}; a debug run pauses before it.`); await refresh(); }));
    toolbar.append(" ", button("Remove selected", async () => { if (editorview.model === undefined || editorview.selected.length === 0) { status("Select a node first.", true); return; } try { for (const id of editorview.selected) editorview.model = removenode(editorview.model, id); editorview.selected = []; editorview.inspector = ""; status("Node removed with its edges; undo brings it back."); } catch (error) { status(error instanceof Error ? error.message : String(error), true); } await refresh(); }));
    toolbar.append(" ", button("Move up", async () => { if (editorview.model === undefined || editorview.inspector === "") return; const index = editorview.model.nodes.findIndex(node => (node.id ?? node.step?.id ?? node.invocation?.block ?? "") === editorview.inspector); try { if (index > 0) editorview.model = reordersteps(editorview.model, editorview.inspector, index - 1); } catch (error) { status(error instanceof Error ? error.message : String(error), true); } await refresh(); }));
    toolbar.append(" ", button("Move down", async () => { if (editorview.model === undefined || editorview.inspector === "") return; const index = editorview.model.nodes.findIndex(node => (node.id ?? node.step?.id ?? node.invocation?.block ?? "") === editorview.inspector); try { if (index >= 0 && index < editorview.model.nodes.length - 1) editorview.model = reordersteps(editorview.model, editorview.inspector, index + 1); } catch (error) { status(error instanceof Error ? error.message : String(error), true); } await refresh(); }));
    const grouprow = document.createElement("div");
    grouprow.className = "actions";
    const groupinput = document.createElement("input");
    groupinput.type = "text";
    groupinput.placeholder = "blockname";
    grouprow.append(groupinput, " ", button("Group selection into block", async () => {
      if (editorview.model === undefined || editorview.selected.length === 0) { status("Select step nodes first.", true); return; }
      try { editorview.model = groupselect(editorview.model, editorview.selected, groupinput.value.trim()); editorview.selected = []; status(`Grouped the selection into the block ${groupinput.value.trim()}.`); } catch (error) { status(error instanceof Error ? error.message : String(error), true); }
      await refresh();
    }));
    canvascard.append(toolbar, grouprow);
    const canvas = document.createElement("div");
    canvas.className = "editorcanvas";
    const layer = document.createElement("div");
    layer.style.position = "absolute";
    layer.style.transformOrigin = "0 0";
    layer.style.left = "0";
    layer.style.top = "0";
    layer.style.width = `${model.layout.width}px`;
    layer.style.height = `${model.layout.height}px`;
    const zoom = model.layout.zoom > 0 ? model.layout.zoom : 1;
    layer.style.transform = `translate(${-Math.max(0, model.layout.viewportx)}px, ${-Math.max(0, model.layout.viewporty)}px) scale(${zoom})`;
    for (const block of model.blocks) {
      const members = model.nodes.filter(node => node.invocation?.block === block.name);
      if (members.length === 0) continue;
      const container = document.createElement("div");
      container.className = "editorblock";
      const left = Math.min(...members.map(node => node.x)) - 14;
      const top = Math.min(...members.map(node => node.y)) - 14;
      container.style.left = `${left}px`;
      container.style.top = `${top}px`;
      container.style.width = `${Math.max(...members.map(node => node.x)) - left + 234}px`;
      container.style.height = `${Math.max(...members.map(node => node.y)) - top + 110}px`;
      const name = document.createElement("span");
      name.textContent = block.name;
      container.append(name);
      layer.append(container);
    }
    for (const node of model.nodes) layer.append(nodeelement(node));
    canvas.append(layer);
    canvascard.append(canvas);
    const minimap = document.createElement("div");
    minimap.className = "editorminimap";
    const projection = renderminimap(model);
    for (const dot of projection.nodes) {
      const point = document.createElement("span");
      point.className = "dot";
      point.style.left = `${Math.min(dot.x, model.minimap.width - 5)}px`;
      point.style.top = `${Math.min(dot.y, model.minimap.height - 5)}px`;
      minimap.append(point);
    }
    const rect = document.createElement("span");
    rect.className = "viewportrect";
    rect.style.left = `${Math.max(0, model.minimap.viewport.x)}px`;
    rect.style.top = `${Math.max(0, model.minimap.viewport.y)}px`;
    rect.style.width = `${Math.max(8, model.minimap.viewport.width)}px`;
    rect.style.height = `${Math.max(6, model.minimap.viewport.height)}px`;
    minimap.append(rect);
    minimap.addEventListener("click", event => {
      void (async () => {
        if (editorview.model === undefined) return;
        const bounds = minimap.getBoundingClientRect();
        try {
          editorview.model = minimapfocus(editorview.model, event.clientX - bounds.left, event.clientY - bounds.top);
          status("Canvas jumped to the mini map region.");
        } catch (error) { status(error instanceof Error ? error.message : String(error), true); }
        await refresh();
      })();
    });
    canvascard.append(minimap);
    const zoomrow = document.createElement("div");
    zoomrow.className = "actions";
    const zoominput = document.createElement("input");
    zoominput.type = "number";
    zoominput.min = "0.1";
    zoominput.step = "0.1";
    zoominput.value = String(zoom);
    zoomrow.append(zoominput, " ", button("Apply zoom", async () => {
      if (editorview.model === undefined) return;
      try { const applied = zoomcanvas(editorview.model, Number(zoominput.value)); editorview.model = applied.model; status(`Canvas zoom ${Number(zoominput.value)} with label scale ${applied.labelscale.toFixed(2)} so every step label stays readable.`); } catch (error) { status(error instanceof Error ? error.message : String(error), true); }
      await refresh();
    }));
    const searchinput = document.createElement("input");
    searchinput.type = "text";
    searchinput.placeholder = "search steps by label, kind or variable";
    searchinput.value = editorview.stepsearch;
    searchinput.addEventListener("input", () => { editorview.stepsearch = searchinput.value; });
    zoomrow.append(searchinput, " ", button("Search steps", async () => { await refresh(); }));
    canvascard.append(zoomrow);
    const results = searchsteps(model, editorview.stepsearch);
    if (results.length > 0) {
      const list = document.createElement("ul");
      for (const result of results) {
        const line = document.createElement("li");
        line.textContent = `${result.label} (${result.kind}) matched ${result.matched.join(", ")}`;
        list.append(line);
      }
      canvascard.append(list);
    }
    workfloweditorroot.append(canvascard);
    const inspector = model.nodes.find(node => (node.id ?? node.step?.id ?? node.invocation?.block ?? "") === editorview.inspector);
    if (inspector !== undefined) {
      const card = document.createElement("div");
      card.className = "sessionrow";
      const headline = document.createElement("p");
      headline.textContent = inspector.step !== undefined ? `Step inspector of ${inspector.step.id}` : `Invocation inspector of block ${inspector.invocation?.block ?? ""}`;
      card.append(headline);
      if (inspector.step !== undefined) {
        const inspectedstep = inspector.step;
        const grid = document.createElement("div");
        grid.className = "editorgrid";
        const labelinput = document.createElement("input");
        labelinput.type = "text";
        labelinput.value = inspectedstep.label;
        const targetinput = document.createElement("input");
        targetinput.type = "text";
        targetinput.placeholder = "css target";
        targetinput.value = inspectedstep.target ?? "";
        const valueinput = document.createElement("input");
        valueinput.type = "text";
        valueinput.placeholder = "value";
        valueinput.value = inspectedstep.value ?? "";
        const optionsinput = document.createElement("input");
        optionsinput.type = "text";
        optionsinput.placeholder = "json options";
        optionsinput.value = inspectedstep.options ?? "";
        for (const [labeltext, input] of [["label", labelinput], ["target", targetinput], ["value", valueinput], ["options json", optionsinput]] as Array<[string, HTMLInputElement]>) {
          const fieldlabel = document.createElement("label");
          fieldlabel.textContent = labeltext;
          fieldlabel.append(input);
          grid.append(fieldlabel);
        }
        card.append(grid, button("Save step edits", async () => {
          if (editorview.model === undefined || inspectedstep === undefined) return;
          const options = optionsinput.value.trim() === "" ? undefined : optionsinput.value.trim();
          try {
            editorview.model = editstep(editorview.model, { ...inspectedstep, label: labelinput.value.trim(), ...(targetinput.value.trim() !== "" ? { target: targetinput.value.trim() } : {}), ...(valueinput.value.trim() !== "" ? { value: valueinput.value.trim() } : {}), ...(options !== undefined ? { options } : {}) });
            status(`Saved the edits of ${inspectedstep.id}; undo covers them.`);
          } catch (error) { status(error instanceof Error ? error.message : String(error), true); }
          await refresh();
        }));
        const bindings = document.createElement("details");
        bindings.className = "sessiongroup";
        const bindingssummary = document.createElement("summary");
        bindingssummary.textContent = `Bindings and nested params (${model.edges.filter(edge => edge.to === inspectedstep.id || edge.from === inspectedstep.id).length} edges)`;
        bindings.append(bindingssummary);
        for (const edge of model.edges.filter(candidate => candidate.to === inspectedstep?.id)) {
          const line = document.createElement("p");
          line.textContent = `${edge.variable} (${edge.kind}) from ${edge.from}${edge.path !== undefined ? ` path ${edge.path}` : ""}`;
          line.append(" ", button("Remove binding", async () => { if (editorview.model === undefined) return; try { editorview.model = removeedge(editorview.model, edge.from, edge.to, edge.variable); status(`Removed the binding ${edge.variable}.`); } catch (error) { status(error instanceof Error ? error.message : String(error), true); } await refresh(); }));
          bindings.append(line);
        }
        const source = document.createElement("select");
        for (const node of model.nodes) {
          if (node.step === undefined || node.step.id === inspectedstep.id) continue;
          const option = document.createElement("option");
          option.value = node.step.id;
          option.textContent = `${node.step.id} (${node.step.kind})`;
          source.append(option);
        }
        const variableinput = document.createElement("input");
        variableinput.type = "text";
        variableinput.placeholder = "variable";
        const kindselect = document.createElement("select");
        for (const kind of ["string", "number", "boolean", "list", "element"] as variablekind[]) {
          const option = document.createElement("option");
          option.value = kind;
          option.textContent = kind;
          kindselect.append(option);
        }
        const pathinput = document.createElement("input");
        pathinput.type = "text";
        pathinput.placeholder = "path into outcome details";
        bindings.append(source, " ", variableinput, " ", kindselect, " ", pathinput, " ", button("Bind variable", async () => {
          if (editorview.model === undefined) return;
          try {
            editorview.model = addedge(editorview.model, { from: source.value, to: inspectedstep?.id ?? "", variable: variableinput.value.trim(), kind: kindselect.value as variablekind, ...(pathinput.value.trim() !== "" ? { path: pathinput.value.trim() } : {}) });
            status(`Bound ${variableinput.value.trim()} from ${source.value}.`);
          } catch (error) { status(error instanceof Error ? error.message : String(error), true); }
          await refresh();
        }));
        card.append(bindings);
      }
      if (inspector.invocation !== undefined) {
        const paramgrid = document.createElement("div");
        paramgrid.className = "editorgrid";
        const paramname = document.createElement("input");
        paramname.type = "text";
        paramname.placeholder = "param name";
        const paramkind = document.createElement("select");
        for (const kind of ["string", "number", "boolean", "list", "element"] as variablekind[]) {
          const option = document.createElement("option");
          option.value = kind;
          option.textContent = kind;
          paramkind.append(option);
        }
        const paramdefault = document.createElement("input");
        paramdefault.type = "text";
        paramdefault.placeholder = "default value";
        paramgrid.append(paramname, paramkind, paramdefault);
        card.append(paramgrid, button("Bind nested param", async () => {
          if (editorview.model === undefined) return;
          try {
            const parseddefault = paramdefault.value.trim() === "" ? undefined : paramkind.value === "number" ? Number(paramdefault.value) : paramkind.value === "boolean" ? paramdefault.value === "true" : paramkind.value === "list" ? paramdefault.value.split(",").map(part => part.trim()) : paramdefault.value;
            editorview.model = bindparam(editorview.model, inspector.invocation?.block ?? "", { name: paramname.value.trim(), kind: paramkind.value as variablekind, ...(parseddefault !== undefined ? { default: parseddefault } : {}) });
            status(`Bound the nested param ${paramname.value.trim()} into ${inspector.invocation?.block ?? ""}.`);
          } catch (error) { status(error instanceof Error ? error.message : String(error), true); }
          await refresh();
        }));
      }
      workfloweditorroot.append(card);
    }
    const saverow = document.createElement("div");
    saverow.className = "sessionrow";
    const nameinput = document.createElement("input");
    nameinput.type = "text";
    nameinput.value = model.name;
    const originsinput = document.createElement("input");
    originsinput.type = "text";
    originsinput.value = model.origins.join(", ");
    const noteinput = document.createElement("input");
    noteinput.type = "text";
    noteinput.placeholder = "change note for the version timeline";
    const versioninput = document.createElement("input");
    versioninput.type = "number";
    versioninput.min = "1";
    versioninput.value = String(model.version + 1);
    saverow.append(nameinput, " ", originsinput, " ", versioninput, " ", noteinput, " ", button("Save canvas as new version", async () => {
      if (editorview.model === undefined) return;
      editorview.model = { ...editorview.model, name: nameinput.value.trim(), origins: originsinput.value.split(",").map(origin => origin.trim()).filter(origin => origin !== ""), version: Number(versioninput.value) };
      try {
        const saved = await request({ kind: "editorsave", model: editorview.model, note: noteinput.value.trim() }) as { workflowid: string; version: number; steps: number; risk: string };
        status(`Saved ${saved.workflowid} as version ${saved.version}: ${saved.steps} expanded steps graded ${saved.risk} through the full grammar.`);
      } catch (error) { status(error instanceof Error ? error.message : String(error), true); }
      await refresh();
    }));
    workfloweditorroot.append(saverow);
  } else {
    const empty = document.createElement("p");
    empty.textContent = "No canvas open; open a composed workflow above or import a workflow file below.";
    workfloweditorroot.append(empty);
  }
  const palettecard = document.createElement("details");
  palettecard.className = "sessiongroup";
  const palettesummary = document.createElement("summary");
  palettesummary.textContent = "Block palette and step library";
  palettecard.append(palettesummary);
  const paletteactions = document.createElement("div");
  paletteactions.className = "actions";
  const paletteinput = document.createElement("input");
  paletteinput.type = "text";
  paletteinput.placeholder = "search the palette by block or category";
  paletteinput.value = editorview.palettesearch;
  paletteinput.addEventListener("input", () => { editorview.palettesearch = paletteinput.value; });
  const libraryinput = document.createElement("input");
  libraryinput.type = "text";
  libraryinput.placeholder = "search the step library by kind or category";
  libraryinput.value = editorview.librarysearch;
  libraryinput.addEventListener("input", () => { editorview.librarysearch = libraryinput.value; });
  paletteactions.append(paletteinput, " ", libraryinput, " ", button("Load palette and library", async () => {
    const loaded = await request({ kind: "steplibrarystore" }) as { categories: string[]; palette: palettenode[]; library: steplibraryentry[] };
    editorview.palette = loaded.palette;
    editorview.library = loaded.library;
    status(`Loaded ${loaded.palette.length} palette blocks and ${loaded.library.length} library kinds.`);
    await refresh();
  }));
  palettecard.append(paletteactions);
  const palettebody = document.createElement("div");
  palettebody.className = "editorpalette";
  if (editorview.palette === undefined) {
    const hint = document.createElement("p");
    hint.textContent = "Load the palette to browse the curated drop blocks and every reviewed action kind grouped by category.";
    palettebody.append(hint);
  } else {
    for (const category of palettecategories) {
      const blocks = editorview.palette.filter(node => node.category === category && `${node.label} ${node.kind} ${node.category}`.toLowerCase().includes(editorview.palettesearch.toLowerCase()));
      if (blocks.length === 0) continue;
      const head = document.createElement("p");
      head.className = "palettecategory";
      head.textContent = category;
      palettebody.append(head);
      for (const block of blocks) {
        palettebody.append(button(block.label, async () => {
          if (editorview.model === undefined) { status("Open a canvas first.", true); return; }
          try { editorview.model = addnode(editorview.model, { id: block.kind, kind: block.kind as actionkind, label: block.label }); status(`Dropped ${block.label} onto the canvas; the step inspector edits its target and options.`); } catch (error) { status(error instanceof Error ? error.message : String(error), true); }
          await refresh();
        }), " ");
      }
    }
  }
  if (editorview.library !== undefined) {
    for (const category of palettecategories) {
      const kinds = editorview.library.filter(entry => entry.category === category && `${entry.kind} ${entry.category}`.toLowerCase().includes(editorview.librarysearch.toLowerCase()));
      if (kinds.length === 0) continue;
      const head = document.createElement("p");
      head.className = "palettecategory";
      head.textContent = `${category} library`;
      palettebody.append(head);
      const list = document.createElement("ul");
      for (const entry of kinds) {
        const line = document.createElement("li");
        line.textContent = `${entry.kind}${entry.optionschema.length > 0 ? ` · options: ${entry.optionschema.map(option => `${option.name} ${option.kind}${option.required === true ? " (required)" : ""}`).join(", ")}` : ""}`;
        list.append(line);
      }
      palettebody.append(list);
    }
  }
  palettecard.append(palettebody);
  workfloweditorroot.append(palettecard);
  if (model !== undefined && editor !== undefined) {
    const versioncard = document.createElement("details");
    versioncard.className = "sessiongroup";
    const versionopen = editorview.diff !== undefined;
    if (versionopen) versioncard.open = true;
    const versionsummary = document.createElement("summary");
    versionsummary.textContent = `Version timeline (${editor.versions.filter(entry => entry.workflowid === editorview.workflowid).length} versions of this workflow)`;
    versioncard.append(versionsummary);
    for (const version of editor.versions.filter(entry => entry.workflowid === editorview.workflowid)) {
      const line = document.createElement("p");
      line.className = "diffrow";
      line.textContent = `v${version.version} · ${new Date(version.createdat).toISOString()} · ${version.steps} steps · ${version.risk ?? "ungraded"}${version.rollback === true ? " · rollback" : ""} · ${version.note}`;
      line.append(" ", button("Roll back here", async () => {
        try {
          const rolled = await request({ kind: "rollbackversion", workflowid: editorview.workflowid, version: version.version }) as { version: number; reviewstate: string };
          status(`Rolled back to v${version.version}; stored as v${rolled.version} and ${rolled.reviewstate} until the rollback review approves it.`);
        } catch (error) { status(error instanceof Error ? error.message : String(error), true); }
        await refresh();
      }));
      versioncard.append(line);
    }
    const diffrow = document.createElement("div");
    diffrow.className = "actions";
    const frominput = document.createElement("input");
    frominput.type = "number";
    frominput.min = "1";
    frominput.placeholder = "from";
    const toinput = document.createElement("input");
    toinput.type = "number";
    toinput.min = "1";
    toinput.placeholder = "to";
    diffrow.append(frominput, " ", toinput, " ", button("Diff versions", async () => {
      try {
        const diff = await request({ kind: "diffversions", workflowid: editorview.workflowid, from: Number(frominput.value), to: Number(toinput.value) }) as versiondiff;
        editorview.diff = diff;
        status(`Diffed v${diff.from} into v${diff.to}: ${diff.added.length} added, ${diff.removed.length} removed, ${diff.changed.length} changed.`);
      } catch (error) { status(error instanceof Error ? error.message : String(error), true); }
      await refresh();
    }));
    versioncard.append(diffrow);
    if (editorview.diff !== undefined) {
      const diff = editorview.diff;
      const card = document.createElement("div");
      card.className = "sessionrow";
      const headline = document.createElement("p");
      headline.textContent = `Version diff v${diff.from} → v${diff.to}`;
      card.append(headline);
      for (const added of diff.added) { const line = document.createElement("p"); line.className = "diffrow"; line.dataset.class = "added"; line.textContent = `+ ${added.stepid} (${added.kind}) ${added.label}`; card.append(line); }
      for (const removed of diff.removed) { const line = document.createElement("p"); line.className = "diffrow"; line.dataset.class = "removed"; line.textContent = `- ${removed.stepid} (${removed.kind}) ${removed.label}`; card.append(line); }
      for (const changed of diff.changed) { const line = document.createElement("p"); line.className = "diffrow"; line.dataset.class = "changed"; line.textContent = `~ ${changed.stepid} (${changed.kind}) ${changed.label}: ${changed.changes.join(", ")}`; card.append(line); }
      card.append(button("Close diff", async () => { editorview.diff = undefined; await refresh(); }));
      versioncard.append(card);
    }
    workfloweditorroot.append(versioncard);
    const backgroundrow = document.createElement("div");
    backgroundrow.className = "actions";
    const backgroundcheck = document.createElement("input");
    backgroundcheck.type = "checkbox";
    backgroundcheck.checked = editor.backgroundruns[editorview.workflowid] === true;
    const backgroundlabel = document.createElement("label");
    backgroundlabel.append(backgroundcheck, " keep runs of this workflow executing with the panel closed (checkpoints restore on every worker wake)");
    backgroundrow.append(backgroundlabel);
    backgroundrow.append(button("Apply background toggle", async () => {
      const result = await request({ kind: "setbackgroundrun", workflowid: editorview.workflowid, enabled: backgroundcheck.checked }) as { enabled: boolean };
      status(result.enabled ? "Background runs stay alive with the panel closed; every step checkpoints." : "Background runs off; a closed panel pauses the next run at its last checkpoint.");
      await refresh();
    }));
    workfloweditorroot.append(backgroundrow);
  }
  if (context.workflow !== undefined) {
    const logcard = document.createElement("details");
    logcard.className = "sessiongroup";
    const logsummary = document.createElement("summary");
    logsummary.textContent = `Run log and variable inspector of the newest run (${context.workflow.log.length} entries)`;
    logcard.append(logsummary);
    const breakpoints = new Set([...(editor?.breakpoints ?? []), ...(context.workflow.workflows.find(record => record.id === editorview.workflowid)?.steps.flatMap(step => step.breakpoint === true ? [step.id] : []) ?? [])]);
    for (const entry of context.workflow.log) {
      const line = document.createElement("p");
      line.textContent = `${entry.state} · ${entry.label}${breakpoints.has(entry.stepid) ? " · breakpoint" : ""} · ${entry.duration} ms · ${entry.summary}`;
      line.dataset.class = entry.state === "failed" || entry.state === "refused" ? "changed" : "added";
      logcard.append(line);
    }
    if (context.workflow.log.length === 0) { const empty = document.createElement("p"); empty.textContent = "No run log entry yet; run the workflow from the workflows view."; logcard.append(empty); }
    for (const scope of context.workflow.scopes) {
      const line = document.createElement("p");
      line.textContent = `Scope ${scope.name}: ${scope.variables.length === 0 ? "no variable" : scope.variables.map(variable => `${variable.name} = ${Array.isArray(variable.value) ? `[${variable.value.join(", ")}]` : String(variable.value)} (${variable.kind})`).join(" · ")}`;
      logcard.append(line);
    }
    workfloweditorroot.append(logcard);
  }
  const historycard = document.createElement("details");
  historycard.className = "sessiongroup";
  if (editorview.history !== undefined) historycard.open = true;
  const historysummary = document.createElement("summary");
  historysummary.textContent = `Run history (${editorview.history?.length ?? editor?.history.length ?? 0} entries)`;
  historycard.append(historysummary);
  const historyfilters = document.createElement("div");
  historyfilters.className = "actions";
  const workflowselect = document.createElement("select");
  const anyoption = document.createElement("option");
  anyoption.value = "";
  anyoption.textContent = "every workflow";
  workflowselect.append(anyoption);
  for (const record of workflows) { const option = document.createElement("option"); option.value = record.id; option.textContent = record.name; workflowselect.append(option); }
  workflowselect.value = editorview.historyfilter.workflowid;
  const outcomeinput = document.createElement("input");
  outcomeinput.type = "text";
  outcomeinput.placeholder = "outcome filter";
  outcomeinput.value = editorview.historyfilter.outcome;
  historyfilters.append(workflowselect, " ", outcomeinput, " ", button("Apply history filters", async () => {
    editorview.historyfilter = { workflowid: workflowselect.value, outcome: outcomeinput.value.trim() };
    try {
      const report = await request({ kind: "runhistory", ...(workflowselect.value !== "" ? { workflowid: workflowselect.value } : {}), ...(outcomeinput.value.trim() !== "" ? { outcome: outcomeinput.value.trim() } : {}) }) as { entries: runhistoryentry[] };
      editorview.history = report.entries;
      status(`Run history: ${report.entries.length} entries match the filters.`);
    } catch (error) { status(error instanceof Error ? error.message : String(error), true); }
    await refresh();
  }));
  historyfilters.append(button("Keep every entry", async () => { await request({ kind: "setrunhistoryretention" }); status("Run history keeps every entry; no code ceiling applies."); await refresh(); }));
  historycard.append(historyfilters);
  const historyentries = editorview.history ?? editor?.history ?? [];
  for (const entry of historyentries.slice(0, 40)) {
    const line = document.createElement("div");
    line.className = "historyrow";
    line.dataset.outcome = entry.outcome;
    const detail = document.createElement("p");
    detail.textContent = `${entry.outcome} · ${entry.steps}/${entry.total} steps · ${entry.duration} ms · ${entry.cause}${entry.dryrun === true ? " · dry run" : ""} · ${new Date(entry.startedat).toISOString()}`;
    line.append(detail);
    historycard.append(line);
  }
  workfloweditorroot.append(historycard);
  const filecard = document.createElement("details");
  filecard.className = "sessiongroup";
  const filesummary = document.createElement("summary");
  filesummary.textContent = "Import, export and template sharing";
  filecard.append(filesummary);
  const formatselect = document.createElement("select");
  for (const format of ["json", "yaml"] as exportformat[]) { const option = document.createElement("option"); option.value = format; option.textContent = format; formatselect.append(option); }
  const contentsinput = document.createElement("textarea");
  contentsinput.rows = 4;
  contentsinput.placeholder = "paste a workflow file to import";
  const filenameinput = document.createElement("input");
  filenameinput.type = "text";
  filenameinput.placeholder = "source filename";
  const importactions = document.createElement("div");
  importactions.className = "actions";
  importactions.append(contentsinput, " ", filenameinput, " ", formatselect, " ", button("Import workflow file", async () => {
    if (contentsinput.value.trim() === "") { status("Paste the workflow file contents first.", true); return; }
    try {
      const imported = await request({ kind: "importworkflow", contents: contentsinput.value, format: formatselect.value, ...(filenameinput.value.trim() !== "" ? { filename: filenameinput.value.trim() } : {}) }) as { importid: string; workflowid: string; name: string; version: number; steps: number; risk: string; templates: number };
      const review = await request({ kind: "workflowreview", workflowid: imported.workflowid }) as { steps: Array<{ id: string; kind: string; label: string; block?: string; target?: string }> };
      editorview.importreview = { importid: imported.importid, workflowid: imported.workflowid, name: imported.name, version: imported.version, risk: imported.risk, steps: review.steps };
      status(`Imported ${imported.name} v${imported.version} with ${imported.steps} steps and ${imported.templates} templates; review before activation.`);
    } catch (error) { status(error instanceof Error ? error.message : String(error), true); }
    await refresh();
  }));
  filecard.append(importactions);
  /* the one click gallery import of the 2.0.0 example gallery: the packaged extension carries the gallery index and its recipe plans under fixtures/, the select lists every entry grouped by category, and one click wraps the chosen recipe into a workflow document the same import review walks — nothing runs before the review approves it and no recipe grows a grant */
  void (async () => {
    try {
      const galleryresponse = await fetch(chrome.runtime.getURL("fixtures/gallery.json"));
      if (galleryresponse.ok) {
        const gallery = await galleryresponse.json() as { entries: Array<{ id: string; category: string; difficulty: string; description: string; origin: string }> };
        const galleryrow = document.createElement("div");
        galleryrow.className = "actions";
        const galleryselect = document.createElement("select");
        for (const entry of gallery.entries) { const option = document.createElement("option"); option.value = entry.id; option.textContent = `${entry.category}: ${entry.id} (${entry.difficulty})`; galleryselect.append(option); }
        const gallerybutton = button("Import gallery recipe", async () => {
          const id = galleryselect.value;
          try {
            const reciperequest = await fetch(chrome.runtime.getURL(`fixtures/recipes/${id}.json`));
            if (!reciperequest.ok) throw new Error(`The packaged recipe ${id} did not answer.`);
            const recipe = await reciperequest.json() as { origin: string; steps: Array<{ id: string; kind: string; label: string; target?: string; value?: string; options?: string }> };
            if (!Array.isArray(recipe.steps) || recipe.steps.length === 0) throw new Error(`The recipe ${id} carries no steps.`);
            const workflowdocument = JSON.stringify({ format: 1, exportedat: Date.now(), workflow: { name: `gallery ${id}`, version: 1, origins: [recipe.origin], steps: recipe.steps } });
            const imported = await request({ kind: "importworkflow", contents: workflowdocument, format: "json", filename: `gallery:${id}` }) as { importid: string; workflowid: string; name: string; version: number; steps: number; risk: string; templates: number };
            const review = await request({ kind: "workflowreview", workflowid: imported.workflowid }) as { steps: Array<{ id: string; kind: string; label: string; block?: string; target?: string }> };
            editorview.importreview = { importid: imported.importid, workflowid: imported.workflowid, name: imported.name, version: imported.version, risk: imported.risk, steps: review.steps };
            status(`Imported the gallery recipe ${id} as ${imported.name} with ${imported.steps} steps; review before activation.`);
          } catch (error) { status(error instanceof Error ? error.message : String(error), true); }
          await refresh();
        });
        galleryrow.append(galleryselect, " ", gallerybutton);
        filecard.append(galleryrow);
      }
    } catch { /* an extension package without the gallery fixtures keeps the paste import only; the gallery row appears when the packaged gallery answers */ }
  })();
  if (editorview.importreview !== undefined) {
    const review = document.createElement("div");
    review.className = "sessionrow";
    const headline = document.createElement("p");
    headline.textContent = `Import review of ${editorview.importreview.name} v${editorview.importreview.version} (${editorview.importreview.risk} for review): every expanded step shows before activation and nothing runs until approval.`;
    review.append(headline);
    const list = document.createElement("ol");
    for (const step of editorview.importreview.steps) { const line = document.createElement("li"); line.textContent = `${step.label} (${step.kind}${step.block !== undefined ? ` · block ${step.block}` : ""}${step.target !== undefined ? ` · ${step.target}` : ""})`; list.append(line); }
    review.append(list);
    review.append(button("Approve import", async () => {
      try { const approved = await request({ kind: "approveimport", importid: editorview.importreview?.importid }) as { reviewstate: string }; status(`Import approved: ${approved.reviewstate}; the workflow runs behind the same gates.`); editorview.importreview = undefined; } catch (error) { status(error instanceof Error ? error.message : String(error), true); }
      await refresh();
    }), " ", button("Reject import", async () => {
      try { await request({ kind: "rejectimport", importid: editorview.importreview?.importid }); status("Import rejected; the pending record left the library."); editorview.importreview = undefined; } catch (error) { status(error instanceof Error ? error.message : String(error), true); }
      await refresh();
    }));
    filecard.append(review);
  }
  for (const pending of editor?.imports ?? []) {
    const line = document.createElement("p");
    line.textContent = `Pending import ${pending.name} v${pending.version} (${pending.steps} steps, ${pending.risk})${pending.filename !== undefined ? ` from ${pending.filename}` : ""}`;
    line.append(" ", button("Review steps", async () => {
      try {
        const steps = await request({ kind: "workflowreview", workflowid: pending.workflowid }) as { steps: Array<{ id: string; kind: string; label: string; block?: string; target?: string }> };
        editorview.importreview = { importid: pending.id, workflowid: pending.workflowid, name: pending.name, version: pending.version, risk: pending.risk, steps: steps.steps };
        status(`Import review of ${pending.name}: ${steps.steps.length} expanded steps.`);
      } catch (error) { status(error instanceof Error ? error.message : String(error), true); }
      await refresh();
    }));
    filecard.append(line);
  }
  const exportrow = document.createElement("div");
  exportrow.className = "actions";
  const noteinput = document.createElement("input");
  noteinput.type = "text";
  noteinput.placeholder = "change note inside the file";
  exportrow.append(noteinput, " ", button("Export open workflow", async () => {
    if (editorview.workflowid === "") { status("Open a workflow on the canvas first.", true); return; }
    try {
      const exported = await request({ kind: "exportworkflow", workflowid: editorview.workflowid, format: formatselect.value, ...(noteinput.value.trim() !== "" ? { note: noteinput.value.trim() } : {}) }) as { contents: string; filename: string; format: string };
      savefile(exported.filename, exported.contents);
      status(`Exported ${exported.filename} (${exported.contents.length} characters, ${exported.format}); the export review held every secret back.`);
    } catch (error) { status(error instanceof Error ? error.message : String(error), true); }
  }), " ", button("Share with templates", async () => {
    if (editorview.workflowid === "") { status("Open a workflow on the canvas first.", true); return; }
    try {
      const shared = await request({ kind: "shareworkflow", workflowid: editorview.workflowid, format: formatselect.value, ...(noteinput.value.trim() !== "" ? { note: noteinput.value.trim() } : {}) }) as { contents: string; filename: string };
      savefile(shared.filename, shared.contents);
      status(`Packed the share bundle ${shared.filename}; templates travel with the workflow.`);
    } catch (error) { status(error instanceof Error ? error.message : String(error), true); }
  }));
  filecard.append(exportrow);
  workfloweditorroot.append(filecard);
  const watchdogcard = document.createElement("details");
  watchdogcard.className = "sessiongroup";
  const watchdogsummary = document.createElement("summary");
  const watchdogconfig = editor?.watchdog.config;
  watchdogsummary.textContent = `Watchdog status (${editor?.watchdog.events.length ?? 0} events)`;
  watchdogcard.append(watchdogsummary);
  const watchdoggrid = document.createElement("div");
  watchdoggrid.className = "editorgrid";
  const enabledcheck = document.createElement("input");
  enabledcheck.type = "checkbox";
  enabledcheck.checked = watchdogconfig?.enabled === true;
  const thresholdinput = document.createElement("input");
  thresholdinput.type = "number";
  thresholdinput.min = "1";
  thresholdinput.placeholder = "stall threshold ms";
  thresholdinput.value = watchdogconfig !== undefined ? String(watchdogconfig.stallthreshold) : "";
  const actionselect = document.createElement("select");
  for (const action of ["retry", "pause", "cancel"]) { const option = document.createElement("option"); option.value = action; option.textContent = action; actionselect.append(option); }
  actionselect.value = watchdogconfig?.action ?? "pause";
  const zombieinput = document.createElement("input");
  zombieinput.type = "number";
  zombieinput.min = "1";
  zombieinput.placeholder = "zombie window ms";
  zombieinput.value = watchdogconfig?.zombiewindow !== undefined ? String(watchdogconfig.zombiewindow) : "";
  for (const [labeltext, control] of [["enabled", enabledcheck], ["stall threshold ms", thresholdinput], ["recovery action", actionselect], ["zombie window ms", zombieinput]] as Array<[string, HTMLElement]>) { const fieldlabel = document.createElement("label"); fieldlabel.textContent = labeltext; fieldlabel.append(control); watchdoggrid.append(fieldlabel); }
  watchdogcard.append(watchdoggrid);
  const watchdogactions = document.createElement("div");
  watchdogactions.className = "actions";
  watchdogactions.append(button("Save watchdog config", async () => {
    try {
      await request({ kind: "setwatchdog", config: { enabled: enabledcheck.checked, stallthreshold: Number(thresholdinput.value), action: actionselect.value as "retry" | "pause" | "cancel", ...(zombieinput.value.trim() !== "" ? { zombiewindow: Number(zombieinput.value) } : {}) } });
      status("Watchdog saved; thresholds stay user values with no code ceiling.");
    } catch (error) { status(error instanceof Error ? error.message : String(error), true); }
    await refresh();
  }), " ", button("Scan now", async () => {
    try { const scan = await request({ kind: "watchdogscan" }) as { events: watchdogrecord[] }; status(`Watchdog scan: ${scan.events.length} stalled or zombie run${scan.events.length === 1 ? "" : "s"} recovered.`); } catch (error) { status(error instanceof Error ? error.message : String(error), true); }
    await refresh();
  }));
  watchdogcard.append(watchdogactions);
  for (const event of (editor?.watchdog.events ?? []).slice(0, 15)) {
    const line = document.createElement("p");
    line.textContent = `${event.verdict} · ${event.action} · ${new Date(event.at).toISOString()} · ${event.outcome}`;
    watchdogcard.append(line);
  }
  workfloweditorroot.append(watchdogcard);
  const overridecard = document.createElement("details");
  overridecard.className = "sessiongroup";
  const overridesummary = document.createElement("summary");
  overridesummary.textContent = `Per site policy overrides (${editor?.overrides.length ?? 0})`;
  overridecard.append(overridesummary);
  const overridegrid = document.createElement("div");
  overridegrid.className = "editorgrid";
  const patterninput = document.createElement("input");
  patterninput.type = "text";
  patterninput.placeholder = "https://origin or https://*.origin";
  const knobinputs: Array<[string, HTMLInputElement]> = [];
  for (const knob of ["loopbound", "stepms", "runms", "waitms", "delaybase"]) {
    const input = document.createElement("input");
    input.type = "number";
    input.min = "1";
    input.placeholder = knob;
    knobinputs.push([knob, input]);
    const fieldlabel = document.createElement("label");
    fieldlabel.textContent = knob;
    fieldlabel.append(input);
    overridegrid.append(fieldlabel);
  }
  const patternlabel = document.createElement("label");
  patternlabel.textContent = "origin pattern";
  patternlabel.append(patterninput);
  overridegrid.prepend(patternlabel);
  overridecard.append(overridegrid, button("Attach override", async () => {
    if (editorview.workflowid === "") { status("Open a workflow on the canvas first.", true); return; }
    const deltas: Record<string, number> = {};
    for (const [knob, input] of knobinputs) if (input.value.trim() !== "" && Number.isFinite(Number(input.value)) && Number(input.value) > 0) deltas[knob] = Number(input.value);
    try { await request({ kind: "setsiteoverride", workflowid: editorview.workflowid, pattern: patterninput.value.trim(), deltas }); status(`Attached the override ${patterninput.value.trim()} with ${Object.keys(deltas).length} knob delta${Object.keys(deltas).length === 1 ? "" : "s"}.`); } catch (error) { status(error instanceof Error ? error.message : String(error), true); }
    await refresh();
  }));
  for (const override of editor?.overrides ?? []) {
    const line = document.createElement("p");
    line.textContent = `${override.pattern} of ${override.workflowid}: ${Object.entries(override.deltas).map(([knob, delta]) => `${knob} ${delta}`).join(", ") || "no delta"}`;
    line.append(" ", button("Remove override", async () => { try { await request({ kind: "removesiteoverride", id: override.id }); status(`Removed the override ${override.pattern}.`); } catch (error) { status(error instanceof Error ? error.message : String(error), true); } await refresh(); }));
    overridecard.append(line);
  }
  workfloweditorroot.append(overridecard);
}


/** Renders the trigger section: every armed rule grouped per workflow with its enable and disable toggle, the next scheduled fire of cron and interval rules, the fire history, the visit rule creation from the current page, rule duplication to a second workflow, the manual run step preview with approve and cancel, webhook rule status with secret rotation and the fire retention setting. */
function rendertriggers(context: { session?: { stoppedat?: number; pausedat?: number; expiresat: number }; plan?: agentplan; workflow?: { workflows: workflowrecord[] }; trigger?: { rules: Array<{ id: string; kind: string; workflowid: string; workflowname?: string; label: string; enabled: boolean; paused?: boolean; cooldown: number; lastfireat?: number; nextfireat?: number; fires: number; launches: number; suppressions: number; summary: Record<string, unknown> }>; queued: number }; triggerretention?: number }): void {
  if (!triggersroot) return;
  triggersroot.replaceChildren();
  const rules = context.trigger?.rules ?? [];
  const queued = context.trigger?.queued ?? 0;
  const workflows = context.workflow?.workflows ?? [];
  const title = document.createElement("p");
  title.textContent = `${rules.length} armed rule${rules.length === 1 ? "" : "s"} across ${new Set(rules.map(rule => rule.workflowid)).size} workflow${new Set(rules.map(rule => rule.workflowid)).size === 1 ? "" : "s"} · ${queued} queued fire${queued === 1 ? "" : "s"}${context.session?.pausedat !== undefined ? " held while the session is paused" : ""}.`;
  triggersroot.append(title);
  const byworkflow = new Map<string, typeof rules>();
  for (const rule of rules) {
    const group = byworkflow.get(rule.workflowid) ?? [];
    group.push(rule);
    byworkflow.set(rule.workflowid, group);
  }
  for (const [workflowid, group] of byworkflow) {
    const workflowname = group[0]?.workflowname ?? workflowid;
    const box = document.createElement("details");
    box.className = "sessiongroup";
    box.open = true;
    const summary = document.createElement("summary");
    summary.textContent = `${workflowname} · ${group.length} rule${group.length === 1 ? "" : "s"}`;
    box.append(summary);
    for (const rule of group) {
      const row = document.createElement("div");
      row.className = "sessionrow";
      const headline = document.createElement("p");
      const badge = document.createElement("span");
      badge.className = "sessionbadge";
      badge.dataset.restored = "false";
      badge.textContent = rule.enabled ? (rule.paused === true ? "paused" : "enabled") : "disabled";
      const match = rule.summary.pattern !== undefined ? String(rule.summary.pattern) : rule.summary.origins !== undefined ? (rule.summary.origins as string[]).join(", ") : rule.summary.cron !== undefined ? `${String(rule.summary.cron)}${rule.summary.timezone !== undefined ? ` (${String(rule.summary.timezone)})` : ""}` : rule.summary.period !== undefined ? `every ${String(rule.summary.period)} ms${rule.summary.jitter !== undefined ? ` ± ${String(rule.summary.jitter)} ms` : ""}` : rule.summary.title !== undefined ? String(rule.summary.title) : rule.summary.command !== undefined ? String(rule.summary.command) : rule.summary.events !== undefined ? (rule.summary.events as string[]).join(", ") : rule.kind === "urllist" ? `${(rule.summary.urls as string[] | undefined)?.length ?? 0} urls` : rule.kind === "webhook" ? `webhook with ${String(rule.summary.fields ?? 0)} schema fields` : "toolbar button";
      headline.append(`${rule.label} · ${rule.kind} · ${match} · cooldown ${rule.cooldown} ms · ${rule.fires} fire${rule.fires === 1 ? "" : "s"}, ${rule.launches} launch${rule.launches === 1 ? "" : "es"}, ${rule.suppressions} suppressed${rule.nextfireat !== undefined ? ` · next fire ${new Date(rule.nextfireat).toISOString()}` : ""}`, badge);
      row.append(headline);
      const actions = document.createElement("div");
      actions.className = "actions";
      actions.append(button(rule.enabled ? "Disable" : "Enable", async () => { await request({ kind: "toggletrigger", ruleid: rule.id, enabled: !rule.enabled }); status(`The ${rule.kind} rule is now ${rule.enabled ? "disabled" : "enabled"}.`); await refresh(); }));
      actions.append(" ", button("Fire history", async () => { const result = await request({ kind: "triggerhistory", ruleid: rule.id }) as { fires: Array<{ id: string; ruleid: string; at: number; cause: string; url?: string; title?: string }> }; triggerview.history = result.fires; status(`Fire history: ${result.fires.length} fire record${result.fires.length === 1 ? "" : "s"} of the ${rule.kind} rule.`); await refresh(); }));
      actions.append(" ", button("Fire manually", async () => { const result = await request({ kind: "firetrigger", ruleid: rule.id }) as { fired: boolean; queued?: boolean; suppressed?: string }; status(result.fired ? `The ${rule.kind} rule fired${result.queued === true ? " and queued for the busy run" : ""}.` : `The ${rule.kind} rule suppressed the fire: ${result.suppressed ?? "review gate"}.`); await refresh(); }));
      if (rule.kind === "webhook") actions.append(" ", button("Rotate secret", async () => { const result = await request({ kind: "rotatetriggersecret", ruleid: rule.id }) as { secret: string }; status(`The webhook secret rotated to ${result.secret}; it was shown once and never leaves the store.`); await refresh(); }));
      if (workflows.length > 1) actions.append(" ", button("Duplicate to second workflow", async () => { const target = workflows.find(record => record.id !== rule.workflowid); if (!target) { status("No second composed workflow exists to duplicate the rule to.", true); return; } await request({ kind: "duplicatetrigger", ruleid: rule.id, workflowid: target.id }); status(`Duplicated the ${rule.kind} rule to ${target.name}.`); await refresh(); }));
      row.append(actions);
      box.append(row);
    }
    const workflowactions = document.createElement("div");
    workflowactions.className = "actions";
    workflowactions.append(button("Create visit rule from current page", async () => { await request({ kind: "createvisitrule", workflowid }); status(`Armed a visit rule of the current page origin for ${workflowname}.`); await refresh(); }));
    workflowactions.append(" ", button("Manual run preview", async () => { const result = await request({ kind: "manualrun", workflowid }) as { manualrun: { id: string; workflowid: string; preview: Array<{ stepid: string; kind: string; label: string; block?: string; control?: Record<string, unknown> }> }; at: number }; triggerview.manual = { ...result.manualrun, at: Date.now() }; status(`Manual run preview: ${result.manualrun.preview.length} steps of ${workflowname}; nothing runs before the confirmation.`); await refresh(); }));
    box.append(workflowactions);
    triggersroot.append(box);
  }
  if (rules.length === 0) {
    const empty = document.createElement("p");
    empty.textContent = "No armed trigger rule yet; arm a reviewed rule of any family or create a visit rule from the current page.";
    triggersroot.append(empty);
  }
  if (triggerview.history !== undefined) {
    const history = document.createElement("details");
    history.className = "sessiongroup";
    const summary = document.createElement("summary");
    summary.textContent = `Fire history (${triggerview.history.length} records)`;
    history.append(summary);
    for (const fire of triggerview.history.slice(0, 25)) {
      const line = document.createElement("p");
      line.textContent = `${new Date(fire.at).toISOString()} · ${fire.cause}${fire.url !== undefined ? ` · ${fire.url}` : ""}${fire.title !== undefined ? ` · ${fire.title}` : ""}`;
      history.append(line);
    }
    triggersroot.append(history);
  }
  if (triggerview.manual !== undefined) {
    const preview = document.createElement("div");
    preview.className = "sessionrow";
    const headline = document.createElement("p");
    headline.textContent = `Manual run step preview: ${triggerview.manual.preview.length} expanded step${triggerview.manual.preview.length === 1 ? "" : "s"}; approve or cancel before anything runs.`;
    preview.append(headline);
    for (const step of triggerview.manual.preview) {
      const line = document.createElement("p");
      line.textContent = `${step.stepid} · ${step.kind} · ${step.label}${step.block !== undefined ? ` · block ${step.block}` : ""}${step.control !== undefined ? ` · ${Object.entries(step.control).map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(", ") : String(value)}`).join(" · ")}` : ""}`;
      preview.append(line);
    }
    const actions = document.createElement("div");
    actions.className = "actions";
    actions.append(button("Approve manual run", async () => { const result = await request({ kind: "confirmmanualrun", previewid: triggerview.manual?.id, confirmed: true }) as { confirmed: boolean; runid?: string; state?: string }; status(`Manual run approved and launched${result.runid !== undefined ? ` as run ${result.runid}` : ""}; the run ended ${result.state ?? "running"}.`); triggerview.manual = undefined; await refresh(); }));
    actions.append(" ", button("Cancel manual run", async () => { await request({ kind: "confirmmanualrun", previewid: triggerview.manual?.id, confirmed: false }); status("Manual run cancelled after the step preview; nothing ran."); triggerview.manual = undefined; await refresh(); }));
    preview.append(actions);
    triggersroot.append(preview);
  }
  const settings = document.createElement("details");
  settings.className = "sessiongroup";
  const settingsummary = document.createElement("summary");
  settingsummary.textContent = "Trigger settings";
  settings.append(settingsummary);
  const retention = document.createElement("p");
  retention.textContent = `Fire record retention: ${context.triggerretention === undefined ? "keep every fire record" : `${context.triggerretention} record${context.triggerretention === 1 ? "" : "s"}`}; the rule counters always survive and no code ceiling applies.`;
  settings.append(retention);
  const retentionactions = document.createElement("div");
  retentionactions.className = "actions";
  retentionactions.append(button("Keep every fire record", async () => { await request({ kind: "settriggerretention" }); status("Trigger fire retention keeps every record."); await refresh(); }));
  retentionactions.append(" ", button("Keep last 100 fire records", async () => { await request({ kind: "settriggerretention", retention: 100 }); status("Trigger fire retention keeps the last 100 records."); await refresh(); }));
  settings.append(retentionactions);
  triggersroot.append(settings);
}

/** Renders the agent protocol view: the mcp server status with start and stop, the localhost bind state and port, the connected clients with their transports, negotiated capabilities and pairing prompt, the disconnect control, the tool catalog grouped by namespace, the stdio bridge status with restart and the recent tool calls with caller and outcome. */
function renderagentprotocol(context: { session?: { stoppedat?: number; pausedat?: number; expiresat: number }; mcp?: { state: string; config: { bind?: string; port: number; transports: string[]; framesize?: number; queuedepth?: number; callretention?: number; enabled: boolean; remote?: boolean; httpstream?: { endpoint: string; streampath: string; tls: { mode: string; certificatefingerprint?: string; verifiedat?: number }; heartbeatms?: number; idlewindowms?: number }; remoteaccess?: { endpoint: string; tls: { mode: string }; maxclients?: number; tokenlifetimems?: number; approvaltimeout?: { windowms: number } } }; bind: string; port: number; localhost: boolean; clients: Array<{ id: string; transport: string; paired: boolean; connectedat: number; capabilities?: { protocolversion: string; toolversion: number; tools: number; transports: string[] }; toolfloor?: number; fingerprint?: string; pairedat?: number }>; bridge?: { id: string; host: string; connected: boolean; restarts: number; received: number; sent: number; startedat: number }; calls: Array<{ id: string; clientid: string; tool: string; origin: string; ok: boolean; code?: string; at: number; dryrun?: boolean; mocked?: boolean; batchid?: string; idempotencykey?: string; replayed?: boolean }>; calllog?: Array<{ id: string; clientid: string; tool: string; origin: string; ok: boolean; code?: string; at: number; dryrun?: boolean; mocked?: boolean; batchid?: string; idempotencykey?: string; replayed?: boolean }>; catalog: { tools: Array<{ name: string; version: number; description: string; risk: string; consentmeta?: { review: string; riskclass: string; approvalrequired: boolean; originscope: string }; inputschema: { type: string; properties: Record<string, { type: string; description: string; required?: boolean }>; required: string[] } }> }; launches: Array<{ id: string; host: string; pid: number; restart: boolean; at: number }>; remote: { endpoint: string; tls: { mode: string; certificaterequired: boolean; verified: boolean }; clients: number; paired: number; channelsopen: number; channelsdead: number; tokenslive: number }; pairing: Array<{ code: string; scopes: string[]; issuedat: number; expiresat: number }>; allowlist: Array<{ fingerprint: string; displayname: string; namespaces: string[]; grantedat: number; history: Array<{ at: number; actor: string; change: string }> }>; tokens: Array<{ id: string; clientid: string; scopes: string[]; issuedat: number; expiresat: number; revokedat?: number }>; identities: Array<{ fingerprint: string; displayname: string }>; handshakes: Array<{ id: string; clientid: string; method: string; outcome: string; at: number }>; channels: Array<{ id: string; clientid: string; openedat: number; lastbeatat: number; closedat?: number }>; approvals: Array<{ id: string; clientid: string; tool: string; reason: string; params: Record<string, unknown>; state: string; raisedat: number; timeoutat?: number; decidedat?: number; secretfields?: string[] }>; subscriptions?: Array<{ id: string; clientid: string; kinds: string[]; origin?: string; tool?: string; createdat: number; lastdeliveredat?: number }>; watches?: Array<{ id: string; clientid: string; resource: string; createdat: number; lastdeliveredat?: number }>; sampling?: Array<{ id: string; clientid: string; prompt: string; system?: string; pagecontent?: string; maxtokens?: number; state: string; requestedat: number; answeredat?: number; answer?: string }>; limits?: Array<{ clientid: string; windowms: number; budget?: number; windowstartedat: number; used: number }>; contexts?: Array<{ callid: string; clientid: string; tool: string; state: string; startedat: number; endedat?: number; idempotencykey?: string; dryrun?: boolean; batchid?: string; chunks: number; errorcode?: string }>; inflight?: Array<{ callid: string; clientid: string; tool: string; startedat: number; chunks: number; dryrun?: boolean }>; batches?: Array<{ id: string; clientid: string; state: string; stoponerror: boolean; createdat: number; finishedat?: number; calls: Array<{ id: string; name: string }>; outcomes: Array<{ callid: string; tool: string; ok: boolean; at: number }> }>; chunks?: Array<{ callid: string; seq: number; content: string; done: boolean; at: number }>; progressnotices?: Array<{ callid: string; percent?: number; message: string; cancellable: boolean; at: number }>; mocks?: Array<{ tool: string; testcontext: boolean; createdat: number }>; dryruntoggle?: boolean; idempotency?: Array<{ key: string; clientid: string; tool: string; createdat: number; expiresat: number }> } }): void {
  if (!agentprotocolroot) return;
  agentprotocolroot.replaceChildren();
  const mcp = context.mcp;
  if (!mcp) {
    const empty = document.createElement("p");
    empty.textContent = "The agent protocol state is unknown.";
    agentprotocolroot.append(empty);
    return;
  }
  const running = mcp.state === "running";
  const head = document.createElement("p");
  head.textContent = `Server ${mcp.state} · ${mcp.bind}:${mcp.port}${mcp.localhost ? " (localhost bind)" : " (remote bind behind the explicit review)"} · transports ${mcp.config.transports.join(" and ")} · ${mcp.catalog.tools.length} tools · ${mcp.clients.length} connected client${mcp.clients.length === 1 ? "" : "s"}.`;
  agentprotocolroot.append(head);
  const controls = document.createElement("div");
  controls.className = "actions";
  controls.append(button(running ? "Stop server" : "Start server", async () => { await request({ kind: running ? "mcpserverstop" : "mcpserverstart" }); status(running ? "The mcp server stopped; no tool call passes the gates." : "The mcp server started on the localhost bind; every client waits for the pairing approval."); await refresh(); }));
  const bindinput = document.createElement("input");
  bindinput.placeholder = "bind address (empty keeps localhost)";
  bindinput.value = mcp.config.bind ?? "";
  const portinput = document.createElement("input");
  portinput.placeholder = "port";
  portinput.value = String(mcp.config.port);
  controls.append(" ", bindinput, " ", portinput, " ", button("Save config", async () => { await request({ kind: "mcpserverconfig", bind: bindinput.value, port: Number(portinput.value), ...(bindinput.value.trim() !== "" && bindinput.value.trim() !== "127.0.0.1" && bindinput.value.trim() !== "localhost" && bindinput.value.trim() !== "::1" ? { remote: true } : {}) }); status(`Saved the mcp server config for ${bindinput.value.trim() === "" ? "127.0.0.1" : bindinput.value.trim()}:${portinput.value}.`); await refresh(); }));
  agentprotocolroot.append(controls);
  if (mcp.bridge !== undefined) {
    const bridge = document.createElement("p");
    bridge.textContent = `Stdio bridge ${mcp.bridge.connected ? "connected" : "disconnected"} on the ${mcp.bridge.host} host · ${mcp.bridge.restarts} restart${mcp.bridge.restarts === 1 ? "" : "s"} · ${mcp.bridge.received} inbound and ${mcp.bridge.sent} outbound frame${mcp.bridge.sent === 1 ? "" : "s"}${mcp.launches.length > 0 ? ` · last launch pid ${mcp.launches[0]?.pid ?? "unknown"}` : " · no host launch reported yet"}.`;
    agentprotocolroot.append(bridge);
    const bridgeactions = document.createElement("div");
    bridgeactions.className = "actions";
    bridgeactions.append(button("Restart bridge", async () => { await request({ kind: "mcpbridge", action: "restart" }); status("The stdio bridge restart ran; the browser exposes the native messaging host only under a native messaging permission."); await refresh(); }));
    agentprotocolroot.append(bridgeactions);
  }
  const clientsbox = document.createElement("details");
  clientsbox.className = "sessiongroup";
  clientsbox.open = true;
  const clientsummary = document.createElement("summary");
  clientsummary.textContent = `Connected clients (${mcp.clients.length})`;
  clientsbox.append(clientsummary);
  for (const client of mcp.clients) {
    const row = document.createElement("div");
    row.className = "sessionrow";
    const headline = document.createElement("p");
    const badge = document.createElement("span");
    badge.className = "sessionbadge";
    badge.dataset.restored = "false";
    badge.textContent = client.paired ? "paired" : "waiting for approval";
    headline.append(`${client.id} · ${client.transport}${client.fingerprint !== undefined ? ` · ${client.fingerprint.slice(0, 12)}` : ""}${client.capabilities !== undefined ? ` · protocol ${client.capabilities.protocolversion} · tool floor ${client.toolfloor ?? client.capabilities.toolversion} · ${client.capabilities.tools} tools` : " · not negotiated yet"}`, badge);
    row.append(headline);
    const actions = document.createElement("div");
    actions.className = "actions";
    if (!client.paired) {
      actions.append(button("Approve pairing", async () => { await request({ kind: "mcpclientdecision", clientid: client.id, approved: true }); status(`Approved the pairing of the client ${client.id}; its tool calls now pass the same consent gates.`); await refresh(); }));
      actions.append(" ", button("Refuse pairing", async () => { await request({ kind: "mcpclientdecision", clientid: client.id, approved: false }); status(`Refused and disconnected the client ${client.id}.`); await refresh(); }));
    }
    actions.append(button("Disconnect", async () => { await request({ kind: "mcpclientdisconnect", clientid: client.id }); status(`Disconnected the client ${client.id}; its record stays for the audit trail.`); await refresh(); }));
    const clienttokens = mcp.tokens.filter(token => token.clientid === client.id && token.revokedat === undefined);
    for (const token of clienttokens) {
      const tokenline = document.createElement("p");
      const remaining = Math.max(0, Math.round((token.expiresat - Date.now()) / 1000));
      tokenline.textContent = `Session token ${token.id.slice(0, 8)} · scopes ${token.scopes.join(", ") || "none"} · expires in ${Math.floor(remaining / 60)}m ${remaining % 60}s${token.revokedat !== undefined ? " · revoked" : ""}.`;
      row.append(tokenline);
    }
    actions.append(" ", button("Revoke client", async () => { await request({ kind: "mcprevokeclient", clientid: client.id }); status(`Revoked the client ${client.id}; its tokens stopped verifying at once.`); await refresh(); }));
    row.append(actions);
    clientsbox.append(row);
  }
  if (mcp.clients.length === 0) {
    const empty = document.createElement("p");
    empty.textContent = "No connected client yet; a paired client speaks json rpc frames over the stdio bridge or an http post envelope.";
    clientsbox.append(empty);
  }
  agentprotocolroot.append(clientsbox);
  const approvalsbox = document.createElement("details");
  approvalsbox.className = "sessiongroup";
  approvalsbox.open = true;
  const approvalssummary = document.createElement("summary");
  const pendingapprovals = mcp.approvals.filter(request => request.state === "pending");
  approvalssummary.textContent = `Approval gates (${pendingapprovals.length} pending, ${mcp.approvals.length - pendingapprovals.length} resolved)`;
  approvalsbox.append(approvalssummary);
  for (const gate of mcp.approvals.slice(0, 10)) {
    const card = document.createElement("div");
    card.className = "sessionrow";
    const identity = mcp.identities.find(entry => entry.fingerprint === mcp.clients.find(client => client.id === gate.clientid)?.fingerprint);
    const headline = document.createElement("p");
    const secrets = gate.secretfields ?? [];
    const shown: Record<string, unknown> = {};
    for (const [name, value] of Object.entries(gate.params)) shown[name] = secrets.includes(name) ? "[redacted]" : value;
    headline.textContent = `${gate.state === "pending" ? "PENDING" : gate.state.toUpperCase()} · ${identity?.displayname ?? gate.clientid} calls ${gate.tool} · ${gate.reason} Arguments: ${JSON.stringify(shown)}${gate.timeoutat !== undefined ? ` · refuses by default at ${new Date(gate.timeoutat).toISOString()}` : ""}.`;
    card.append(headline);
    if (gate.state === "pending") {
      const actions = document.createElement("div");
      actions.className = "actions";
      actions.append(button("Approve", async () => { await request({ kind: "mcpapprovaldecision", approvalid: gate.id, approved: true }); status(`Approved the ${gate.tool} call of the client ${gate.clientid}; the gate executed the held call.`); await refresh(); }));
      actions.append(" ", button("Refuse", async () => { await request({ kind: "mcpapprovaldecision", approvalid: gate.id, approved: false }); status(`Refused the ${gate.tool} call of the client ${gate.clientid}; the pending call never executes.`); await refresh(); }));
      card.append(actions);
    }
    approvalsbox.append(card);
  }
  if (mcp.approvals.length === 0) {
    const empty = document.createElement("p");
    empty.textContent = "No approval gate yet; every sensitive call a remote client raises lands here with its full arguments before anything executes.";
    approvalsbox.append(empty);
  }
  agentprotocolroot.append(approvalsbox);
  const remotebox = document.createElement("details");
  remotebox.className = "sessiongroup";
  const remotesummary = document.createElement("summary");
  remotesummary.textContent = `Remote transport (${mcp.remote.channelsopen} live channel${mcp.remote.channelsopen === 1 ? "" : "s"}, ${mcp.remote.channelsdead} closed)`;
  remotebox.append(remotesummary);
  const remoteline = document.createElement("p");
  remoteline.textContent = `Endpoint ${mcp.remote.endpoint} · tls ${mcp.remote.tls.mode}${mcp.remote.tls.certificaterequired ? " (certificate required)" : ""}${mcp.remote.tls.verified ? " and verified" : " and unverified"} · ${mcp.remote.paired} of ${mcp.remote.clients} client${mcp.remote.clients === 1 ? "" : "s"} paired · ${mcp.remote.tokenslive} live token${mcp.remote.tokenslive === 1 ? "" : "s"}.`;
  remotebox.append(remoteline);
  for (const channel of mcp.channels.slice(0, 10)) {
    const line = document.createElement("p");
    const beatage = Math.max(0, Math.round((Date.now() - channel.lastbeatat) / 1000));
    line.textContent = `Stream channel ${channel.id.slice(0, 12)} of ${channel.clientid} · ${channel.closedat === undefined ? `heartbeat ${beatage}s ago` : `closed at ${new Date(channel.closedat).toISOString()}`}.`;
    remotebox.append(line);
  }
  for (const shake of mcp.handshakes.slice(0, 5)) {
    const line = document.createElement("p");
    line.textContent = `Auth handshake ${shake.method} of ${shake.clientid} · ${shake.outcome}${shake.outcome === "refused" ? " (consentrefused error, no pairing state leaked)" : ""} · ${new Date(shake.at).toISOString()}.`;
    remotebox.append(line);
  }
  const pairingline = document.createElement("p");
  pairingline.textContent = mcp.pairing.length > 0 ? `Pairing code ${mcp.pairing[0]?.code} for ${mcp.pairing[0]?.scopes.join(", ") || "no"} namespaces · expires at ${new Date(mcp.pairing[0]?.expiresat ?? Date.now()).toISOString()} · single use.` : "No pairing code pending; issue one while a session is live to pair a remote client.";
  remotebox.append(pairingline);
  const pairingactions = document.createElement("div");
  pairingactions.className = "actions";
  pairingactions.append(button("Issue pairing code", async () => { await request({ kind: "mcppairing", scopes: ["browser", "workflow", "memory", "system"] }); status("Issued one single use pairing code; copy it to the remote client before its window closes."); await refresh(); }));
  pairingactions.append(" ", button("Copy pairing code", async () => { const code = mcp.pairing[0]?.code ?? ""; if (code === "") { status("No pending pairing code to copy.", true); return; } await navigator.clipboard.writeText(code).then(() => status(`Copied the pairing code ${code} to the clipboard.`)).catch(() => status(`Pairing code: ${code} (the clipboard permission was refused).`, true)); }));
  remotebox.append(pairingactions);
  const tlsheadline = document.createElement("p");
  tlsheadline.textContent = "Tls certificate options of the remote transport: the mode and the reviewed sha-256 fingerprint stay user choices with no hardcoded certificate.";
  remotebox.append(tlsheadline);
  const tlsactions = document.createElement("div");
  tlsactions.className = "actions";
  const endpointinput = document.createElement("input");
  endpointinput.placeholder = "remote endpoint url";
  endpointinput.value = mcp.config.remoteaccess?.endpoint ?? "";
  const tlsmodeinput = document.createElement("input");
  tlsmodeinput.placeholder = "tls mode: off, on or required";
  tlsmodeinput.value = mcp.config.remoteaccess?.tls.mode ?? "off";
  const certinput = document.createElement("input");
  certinput.placeholder = "certificate sha-256 fingerprint";
  certinput.value = mcp.config.httpstream?.tls.certificatefingerprint ?? "";
  const maxclientsinput = document.createElement("input");
  maxclientsinput.placeholder = "max clients (empty: unbounded)";
  maxclientsinput.value = mcp.config.remoteaccess?.maxclients !== undefined ? String(mcp.config.remoteaccess.maxclients) : "";
  const timeoutinput = document.createElement("input");
  timeoutinput.placeholder = "approval window ms";
  timeoutinput.value = mcp.config.remoteaccess?.approvaltimeout !== undefined ? String(mcp.config.remoteaccess.approvaltimeout.windowms) : "";
  tlsactions.append(endpointinput, " ", tlsmodeinput, " ", certinput, " ", maxclientsinput, " ", timeoutinput, " ", button("Save remote config", async () => { await request({ kind: "mcpremoteconfig", endpoint: endpointinput.value, tlsmode: tlsmodeinput.value, ...(certinput.value.trim() !== "" ? { certificatefingerprint: certinput.value } : {}), ...(maxclientsinput.value.trim() !== "" ? { maxclients: Number(maxclientsinput.value) } : {}), ...(timeoutinput.value.trim() !== "" ? { approvaltimeoutms: Number(timeoutinput.value) } : {}), reviewed: true }); status(`Saved the remote transport config for ${endpointinput.value} with the ${tlsmodeinput.value} tls mode.`); await refresh(); }));
  remotebox.append(tlsactions);
  agentprotocolroot.append(remotebox);
  const allowlistbox = document.createElement("details");
  allowlistbox.className = "sessiongroup";
  const allowlistsummary = document.createElement("summary");
  allowlistsummary.textContent = `Client allowlist (${mcp.allowlist.length} entr${mcp.allowlist.length === 1 ? "y" : "ies"})`;
  allowlistbox.append(allowlistsummary);
  for (const entry of mcp.allowlist) {
    const line = document.createElement("p");
    line.textContent = `${entry.displayname} · ${entry.fingerprint.slice(0, 12)} · namespaces ${entry.namespaces.join(", ") || "none"} · granted ${new Date(entry.grantedat).toISOString()} · ${entry.history.length} grant change${entry.history.length === 1 ? "" : "s"}.`;
    allowlistbox.append(line);
    const actions = document.createElement("div");
    actions.className = "actions";
    actions.append(button(`Rescope to browser+memory`, async () => { await request({ kind: "mcpallowlist", fingerprint: entry.fingerprint, displayname: entry.displayname, namespaces: ["browser", "memory"] }); status(`Rescoped the allowlist entry ${entry.displayname} to the browser and memory namespaces.`); await refresh(); }));
    actions.append(" ", button("Refuse entry", async () => { await request({ kind: "mcpallowlist", fingerprint: entry.fingerprint, remove: true }); status(`Refused the allowlist entry ${entry.displayname}; its fingerprint stops passing the check.`); await refresh(); }));
    allowlistbox.append(actions);
  }
  const allowactions = document.createElement("div");
  allowactions.className = "actions";
  const fingerprintinput = document.createElement("input");
  fingerprintinput.placeholder = "client fingerprint";
  const displayinput = document.createElement("input");
  displayinput.placeholder = "display name";
  const scopesinput = document.createElement("input");
  scopesinput.placeholder = "namespaces: browser,workflow,memory,system";
  allowactions.append(fingerprintinput, " ", displayinput, " ", scopesinput, " ", button("Allow client", async () => { const namespaces = scopesinput.value.split(",").map(scope => scope.trim()).filter(scope => scope !== ""); await request({ kind: "mcpallowlist", fingerprint: fingerprintinput.value, ...(displayinput.value.trim() !== "" ? { displayname: displayinput.value } : {}), namespaces }); status(`Allowed the client ${displayinput.value || fingerprintinput.value} the ${namespaces.join(", ") || "no"} namespaces.`); await refresh(); }));
  allowlistbox.append(allowactions);
  if (mcp.allowlist.length === 0) {
    const empty = document.createElement("p");
    empty.textContent = "No allowlist entry yet; a remote client pairs through the one time code or the user allows a known fingerprint with its namespace scopes.";
    allowlistbox.append(empty);
  }
  agentprotocolroot.append(allowlistbox);
  const catalogbox = document.createElement("details");
  catalogbox.className = "sessiongroup";
  const catalogsummary = document.createElement("summary");
  catalogsummary.textContent = `Tool catalog (${mcp.catalog.tools.length} tools by namespace)`;
  catalogbox.append(catalogsummary);
  const bynamespace = new Map<string, typeof mcp.catalog.tools>();
  for (const tool of mcp.catalog.tools) {
    const namespace = tool.name.split(".")[0] ?? "browser";
    const group = bynamespace.get(namespace) ?? [];
    group.push(tool);
    bynamespace.set(namespace, group);
  }
  for (const [namespace, tools] of bynamespace) {
    const domain = document.createElement("details");
    domain.className = "sessiongroup";
    const domainsummary = document.createElement("summary");
    domainsummary.textContent = `${namespace} (${tools.length} tools)`;
    domain.append(domainsummary);
    for (const tool of tools) {
      const line = document.createElement("p");
      line.textContent = `${tool.name} v${tool.version} · ${tool.risk} · ${tool.description.split(".")[0] ?? tool.description}${tool.consentmeta !== undefined ? ` · ${tool.consentmeta.riskclass} · approval gate ${tool.consentmeta.approvalrequired ? "required" : "off"} · ${tool.consentmeta.originscope} scope · review: ${tool.consentmeta.review}` : ""}`;
      domain.append(line);
    }
    catalogbox.append(domain);
  }
  agentprotocolroot.append(catalogbox);
  const runtimebox = document.createElement("details");
  runtimebox.className = "sessiongroup";
  const runtimesummary = document.createElement("summary");
  runtimesummary.textContent = `Call runtime (${mcp.inflight?.length ?? 0} in flight, ${mcp.dryruntoggle === true ? "dry run armed" : "dry run off"}, ${mcp.mocks?.length ?? 0} mock${(mcp.mocks?.length ?? 0) === 1 ? "" : "s"})`;
  runtimebox.append(runtimesummary);
  for (const call of mcp.inflight ?? []) {
    const line = document.createElement("p");
    line.textContent = `In flight ${call.tool} of ${call.clientid} · call ${call.callid.slice(0, 12)} · ${call.chunks} chunk${call.chunks === 1 ? "" : "s"} · open ${Math.max(0, Math.round((Date.now() - call.startedat) / 1000))}s${call.dryrun === true ? " · dry run" : ""}.`;
    runtimebox.append(line);
    const actions = document.createElement("div");
    actions.className = "actions";
    actions.append(button("Cancel call", async () => { await request({ kind: "mcpcancelcall", callid: call.callid }); status(`Cancelled the in flight ${call.tool} call; the partial result stays preserved.`); await refresh(); }));
    runtimebox.append(actions);
  }
  if ((mcp.inflight?.length ?? 0) === 0) {
    const empty = document.createElement("p");
    empty.textContent = "No in flight tool call; a cancellation frame aborts a running call and preserves its partial result.";
    runtimebox.append(empty);
  }
  const runtimeactions = document.createElement("div");
  runtimeactions.className = "actions";
  runtimeactions.append(button(mcp.dryruntoggle === true ? "Disarm dry run" : "Dry run next call", async () => { await request({ kind: "mcpdryrun", enabled: mcp.dryruntoggle !== true }); status(mcp.dryruntoggle === true ? "Disarmed the tool dry run; the next call executes behind the gates." : "Armed the tool dry run of the next call: it evaluates arguments and consent with no side effects."); await refresh(); }));
  const mockinput = document.createElement("input");
  mockinput.placeholder = "tool name to mock (test context)";
  runtimeactions.append(" ", mockinput, " ", button("Add mock", async () => { if (mockinput.value.trim() === "") { status("The tool mock needs the namespaced tool name.", true); return; } await request({ kind: "mcpmock", tool: mockinput.value.trim() }); status(`Registered the ${mockinput.value.trim()} tool mock of a test context; it never touches the browser.`); await refresh(); }));
  runtimebox.append(runtimeactions);
  for (const mock of mcp.mocks ?? []) {
    const line = document.createElement("p");
    line.textContent = `Tool mock ${mock.tool} · test context · created ${new Date(mock.createdat).toISOString()}.`;
    runtimebox.append(line);
    const actions = document.createElement("div");
    actions.className = "actions";
    actions.append(button("Remove mock", async () => { await request({ kind: "mcpmock", tool: mock.tool, remove: true }); status(`Removed the ${mock.tool} tool mock; the tool returns to the real gates.`); await refresh(); }));
    runtimebox.append(actions);
  }
  agentprotocolroot.append(runtimebox);
  const limitsbox = document.createElement("details");
  limitsbox.className = "sessiongroup";
  const limitssummary = document.createElement("summary");
  limitssummary.textContent = `Rate limits (${mcp.limits?.length ?? 0} client${(mcp.limits?.length ?? 0) === 1 ? "" : "s"} limited)`;
  limitsbox.append(limitssummary);
  for (const limit of mcp.limits ?? []) {
    const line = document.createElement("p");
    const used = limit.budget !== undefined ? Math.min(100, Math.round((limit.used / limit.budget) * 100)) : 0;
    const bar = limit.budget !== undefined ? " " + "█".repeat(Math.round(used / 10)) + "·".repeat(10 - Math.round(used / 10)) : "";
    line.textContent = `${limit.clientid} · ${limit.used}${limit.budget !== undefined ? ` of ${limit.budget}` : " of unbounded"} call${limit.used === 1 ? "" : "s"} in the ${limit.windowms}ms window${bar} · resets in ${Math.max(0, Math.round((limit.windowstartedat + limit.windowms - Date.now()) / 1000))}s.`;
    limitsbox.append(line);
    const actions = document.createElement("div");
    actions.className = "actions";
    actions.append(button("Remove limit", async () => { await request({ kind: "mcpratelimit", clientid: limit.clientid, remove: true }); status(`Removed the rate limit of the client ${limit.clientid}; the client stays unbounded because no silent default applies.`); await refresh(); }));
    limitsbox.append(actions);
  }
  const limtactions = document.createElement("div");
  limtactions.className = "actions";
  const limitclientinput = document.createElement("input");
  limitclientinput.placeholder = "client id";
  const limitwindowinput = document.createElement("input");
  limitwindowinput.placeholder = "window ms";
  const limitbudgetinput = document.createElement("input");
  limitbudgetinput.placeholder = "call budget (empty: unbounded)";
  limtactions.append(limitclientinput, " ", limitwindowinput, " ", limitbudgetinput, " ", button("Limit client", async () => { if (limitclientinput.value.trim() === "") { status("The rate limit needs the client id.", true); return; } await request({ kind: "mcpratelimit", clientid: limitclientinput.value.trim(), windowms: Number(limitwindowinput.value) || 60_000, ...(limitbudgetinput.value.trim() !== "" ? { budget: Number(limitbudgetinput.value) } : {}) }); status(`Limited the client ${limitclientinput.value.trim()} inside its window; the budget stays the user choice.`); await refresh(); }));
  limitsbox.append(limtactions);
  if ((mcp.limits?.length ?? 0) === 0) {
    const empty = document.createElement("p");
    empty.textContent = "No rate limit configured; an absent limit keeps the client unbounded because no silent default ever applies.";
    limitsbox.append(empty);
  }
  agentprotocolroot.append(limitsbox);
  const streambox = document.createElement("details");
  streambox.className = "sessiongroup";
  const streamsummary = document.createElement("summary");
  streamsummary.textContent = `Streaming and progress (${mcp.chunks?.length ?? 0} chunk${(mcp.chunks?.length ?? 0) === 1 ? "" : "s"}, ${mcp.progressnotices?.length ?? 0} notice${(mcp.progressnotices?.length ?? 0) === 1 ? "" : "s"})`;
  streambox.append(streamsummary);
  for (const notice of (mcp.progressnotices ?? []).slice(0, 5)) {
    const line = document.createElement("p");
    line.textContent = `Progress ${notice.percent !== undefined ? `${notice.percent}%` : ""} of the call ${notice.callid.slice(0, 12)} · ${notice.message}${notice.cancellable ? " · cancellable" : ""} · ${new Date(notice.at).toISOString()}.`;
    streambox.append(line);
  }
  for (const chunk of (mcp.chunks ?? []).slice(0, 10)) {
    const line = document.createElement("p");
    line.textContent = `Chunk ${chunk.seq}${chunk.done ? " (done)" : ""} of the call ${chunk.callid.slice(0, 12)} · ${chunk.content.slice(0, 60)}${chunk.content.length > 60 ? "…" : ""}`;
    streambox.append(line);
  }
  if ((mcp.chunks?.length ?? 0) === 0 && (mcp.progressnotices?.length ?? 0) === 0) {
    const empty = document.createElement("p");
    empty.textContent = "No streamed result yet; a streaming call delivers its content in ordered chunks with progress notices in between.";
    streambox.append(empty);
  }
  agentprotocolroot.append(streambox);
  const samplingbox = document.createElement("details");
  samplingbox.className = "sessiongroup";
  const samplingsummary = document.createElement("summary");
  samplingsummary.textContent = `Sampling callbacks (${mcp.sampling?.length ?? 0})`;
  samplingbox.append(samplingsummary);
  for (const callback of mcp.sampling ?? []) {
    const line = document.createElement("p");
    line.textContent = `${callback.state} · client ${callback.clientid} · requested ${new Date(callback.requestedat).toISOString()}${callback.answeredat !== undefined ? ` · answered ${new Date(callback.answeredat).toISOString()}` : ""}${callback.pagecontent !== undefined ? " · page content granted" : " · page content stripped"}.`;
    samplingbox.append(line);
    const payload = document.createElement("p");
    payload.textContent = `Prompt: ${callback.prompt}${callback.system !== undefined ? ` System: ${callback.system}` : ""}${callback.answer !== undefined ? ` Answer: ${callback.answer}` : ""}`;
    samplingbox.append(payload);
    if (callback.state === "pending") {
      const actions = document.createElement("div");
      actions.className = "actions";
      const answerinput = document.createElement("input");
      answerinput.placeholder = "client answer for the local test";
      actions.append(answerinput, " ", button("Record answer", async () => { await request({ kind: "mcpsampling", respond: true, samplingid: callback.id, ...(answerinput.value.trim() !== "" ? { answer: answerinput.value.trim() } : { refused: true }) }); status(`Closed the sampling round trip ${callback.id.slice(0, 12)}.`); await refresh(); }));
      samplingbox.append(actions);
    }
  }
  if ((mcp.sampling?.length ?? 0) === 0) {
    const empty = document.createElement("p");
    empty.textContent = "No sampling callback yet; a callback asks a paired client model for a completion and the page content rides it only behind the user grant.";
    samplingbox.append(empty);
  }
  const samplingactions = document.createElement("div");
  samplingactions.className = "actions";
  const samplingclientinput = document.createElement("input");
  samplingclientinput.placeholder = "client id";
  const samplingpromptinput = document.createElement("input");
  samplingpromptinput.placeholder = "prompt for the client model";
  const samplingpageinput = document.createElement("input");
  samplingpageinput.placeholder = "page content (empty: none)";
  samplingactions.append(samplingclientinput, " ", samplingpromptinput, " ", samplingpageinput, " ", button("Ask client model", async () => { if (samplingclientinput.value.trim() === "" || samplingpromptinput.value.trim() === "") { status("The sampling callback needs the client id and the prompt.", true); return; } await request({ kind: "mcpsampling", clientid: samplingclientinput.value.trim(), prompt: samplingpromptinput.value.trim(), ...(samplingpageinput.value.trim() !== "" ? { pagecontent: samplingpageinput.value.trim(), pagegrant: true } : {}) }); status(`Sent one sampling callback to the client ${samplingclientinput.value.trim()}; the exact payload rides this view.`); await refresh(); }));
  samplingbox.append(samplingactions);
  agentprotocolroot.append(samplingbox);
  const subsbox = document.createElement("details");
  subsbox.className = "sessiongroup";
  const subssummary = document.createElement("summary");
  subssummary.textContent = `Subscriptions (${mcp.subscriptions?.length ?? 0} event, ${mcp.watches?.length ?? 0} resource)`;
  subsbox.append(subssummary);
  for (const subscription of mcp.subscriptions ?? []) {
    const line = document.createElement("p");
    line.textContent = `Client ${subscription.clientid} · kinds ${subscription.kinds.join(", ")}${subscription.origin !== undefined ? ` · origin ${subscription.origin}` : ""}${subscription.tool !== undefined ? ` · tool ${subscription.tool}` : ""} · subscribed ${new Date(subscription.createdat).toISOString()}${subscription.lastdeliveredat !== undefined ? ` · last delivery ${new Date(subscription.lastdeliveredat).toISOString()}` : ""}.`;
    subsbox.append(line);
    const actions = document.createElement("div");
    actions.className = "actions";
    actions.append(button("Unsubscribe", async () => { await request({ kind: "mcpsubscribe", clientid: subscription.clientid, subscriptionid: subscription.id, unsubscribe: true }); status(`Cancelled the event subscription of the client ${subscription.clientid}.`); await refresh(); }));
    subsbox.append(actions);
  }
  for (const watch of mcp.watches ?? []) {
    const line = document.createElement("p");
    line.textContent = `Client ${watch.clientid} watches the ${watch.resource} resource · since ${new Date(watch.createdat).toISOString()}${watch.lastdeliveredat !== undefined ? ` · last delta ${new Date(watch.lastdeliveredat).toISOString()}` : ""}.`;
    subsbox.append(line);
    const actions = document.createElement("div");
    actions.className = "actions";
    actions.append(button("Unwatch", async () => { await request({ kind: "mcpresource", clientid: watch.clientid, watchid: watch.id, unwatch: true }); status(`Cancelled the ${watch.resource} resource watcher of the client ${watch.clientid}.`); await refresh(); }));
    subsbox.append(actions);
  }
  if ((mcp.subscriptions?.length ?? 0) === 0 && (mcp.watches?.length ?? 0) === 0) {
    const empty = document.createElement("p");
    empty.textContent = "No subscription yet; a paired client subscribes its event kinds and watches page state resources through the frame intake.";
    subsbox.append(empty);
  }
  agentprotocolroot.append(subsbox);
  const batchbox = document.createElement("details");
  batchbox.className = "sessiongroup";
  const batchsummary = document.createElement("summary");
  batchsummary.textContent = `Batch calls (${mcp.batches?.length ?? 0})`;
  batchbox.append(batchsummary);
  for (const batch of mcp.batches ?? []) {
    const line = document.createElement("p");
    const done = batch.outcomes.length;
    line.textContent = `${batch.state} · client ${batch.clientid} · ${done} of ${batch.calls.length} member${batch.calls.length === 1 ? "" : "s"} done · stop on error ${batch.stoponerror ? "on" : "off"} · created ${new Date(batch.createdat).toISOString()}.`;
    batchbox.append(line);
    for (const outcome of batch.outcomes.slice(0, 10)) {
      const item = document.createElement("p");
      item.textContent = `  ${outcome.ok ? "ran" : "failed"} · ${outcome.tool} (${outcome.callid}).`;
      batchbox.append(item);
    }
  }
  if ((mcp.batches?.length ?? 0) === 0) {
    const empty = document.createElement("p");
    empty.textContent = "No batch call yet; an ordered batch runs its members behind the gates and stops at the first error when the flag requests it.";
    batchbox.append(empty);
  }
  agentprotocolroot.append(batchbox);
  const callsbox = document.createElement("details");
  callsbox.className = "sessiongroup";
  const callssummary = document.createElement("summary");
  callssummary.textContent = `Audited tool calls (${(mcp.calllog ?? mcp.calls).length} shown, every call logged)`;
  callsbox.append(callssummary);
  for (const call of (mcp.calllog ?? mcp.calls).slice(0, 25)) {
    const line = document.createElement("p");
    line.textContent = `${new Date(call.at).toISOString()} · ${call.clientid} · ${call.tool} · ${call.origin} · ${call.ok ? "ran behind the gates" : `refused${call.code !== undefined ? ` (${call.code})` : ""}`}${call.dryrun === true ? " · dry run" : ""}${call.mocked === true ? " · mocked" : ""}${call.batchid !== undefined ? " · batch member" : ""}${call.idempotencykey !== undefined ? ` · key ${call.idempotencykey.slice(0, 10)}` : ""}${call.replayed === true ? " · idempotent replay" : ""}`;
    callsbox.append(line);
  }
  if ((mcp.calllog ?? mcp.calls).length === 0) {
    const empty = document.createElement("p");
    empty.textContent = "No tool call yet; every call records the client, tool, outcome and idempotency key without payloads.";
    callsbox.append(empty);
  }
  agentprotocolroot.append(callsbox);
}

/** Renders the models view of the 1.1.57 llm integration: the provider list with endpoint editing and test call buttons, the local model endpoint with its health check, the modelroute table per task kind, the natural language command intent, the model drafted plan review cards with editable steps, the replan reviews with the highlighted changed tail, the reflection notes under the completed steps, the budget meter against the configured ceiling, the prompt template library browser and the guard refusal notices. */
function rendermodels(context: { llm?: llmview }): void {
  if (!modelsroot) return;
  modelsroot.replaceChildren();
  const llm = context.llm;
  if (!llm) {
    const empty = document.createElement("p");
    empty.textContent = "The models state is unknown.";
    modelsroot.append(empty);
    return;
  }
  const head = document.createElement("p");
  head.textContent = `${llm.providers.length} provider${llm.providers.length === 1 ? "" : "s"} · ${llm.routes.length} route${llm.routes.length === 1 ? "" : "s"} · ${llm.usage.calls} model call${llm.usage.calls === 1 ? "" : "s"} with ${llm.usage.totaltokens} tokens${llm.budget !== undefined ? ` against the ceiling` : " and no ceiling"}.`;
  modelsroot.append(head);

  const providersbox = document.createElement("details");
  providersbox.className = "sessiongroup";
  providersbox.open = true;
  const providersummary = document.createElement("summary");
  providersummary.textContent = `Providers (${llm.providers.length})`;
  providersbox.append(providersummary);
  for (const provider of llm.providers) {
    const row = document.createElement("div");
    row.className = "sessionrow";
    const info = document.createElement("p");
    info.textContent = `${provider.name} · ${provider.style} · ${provider.status}${provider.lastcheckedat !== undefined ? ` (checked ${new Date(provider.lastcheckedat).toLocaleTimeString()})` : ""}${provider.authref !== undefined ? ` · key ${provider.authref.name}` : " · no key"}${provider.costpermilliontokens !== undefined ? ` · ${provider.costpermilliontokens} per million tokens` : ""}.`;
    row.append(info);
    const actions = document.createElement("div");
    actions.className = "actions";
    const nameinput = document.createElement("input");
    nameinput.value = provider.name;
    nameinput.placeholder = "name";
    const endpointinput = document.createElement("input");
    endpointinput.value = provider.endpoint;
    endpointinput.placeholder = "endpoint url";
    const styleselect = document.createElement("select");
    for (const style of ["chatcompletions", "responses", "messages", "gemini"]) {
      const option = document.createElement("option");
      option.value = style;
      option.textContent = style;
      option.selected = provider.style === style;
      styleselect.append(option);
    }
    const modelsinput = document.createElement("input");
    modelsinput.value = provider.models.join(", ");
    modelsinput.placeholder = "models, comma separated";
    const keyinput = document.createElement("input");
    keyinput.placeholder = "stored key name";
    actions.append(nameinput, " ", endpointinput, " ", styleselect, " ", modelsinput, " ", keyinput, " ", button("Save", async () => { await request({ kind: "llmproviders", id: provider.id, name: nameinput.value, endpoint: endpointinput.value, style: styleselect.value, models: modelsinput.value.split(",").map(model => model.trim()).filter(model => model !== ""), ...(keyinput.value.trim() !== "" ? { authrefname: keyinput.value.trim() } : {}) }); status(`Saved the provider ${nameinput.value}.`); await refresh(); }), " ", button("Test call", async () => { await request({ kind: "llmtestprovider", id: provider.id }); status(`The test call of ${provider.name} answered.`); await refresh(); }), " ", button("Remove", async () => { await request({ kind: "llmproviders", id: provider.id, remove: true }); status(`Removed the provider ${provider.name}.`); await refresh(); }));
    row.append(actions);
    providersbox.append(row);
  }
  const addrow = document.createElement("div");
  addrow.className = "actions";
  const addname = document.createElement("input");
  addname.placeholder = "new provider name";
  const addendpoint = document.createElement("input");
  addendpoint.placeholder = "endpoint url";
  const addstyle = document.createElement("select");
  for (const style of ["chatcompletions", "responses", "messages", "gemini"]) { const option = document.createElement("option"); option.value = style; option.textContent = style; addstyle.append(option); }
  const addmodels = document.createElement("input");
  addmodels.placeholder = "models, comma separated";
  const addkey = document.createElement("input");
  addkey.placeholder = "stored key name";
  addrow.append(addname, " ", addendpoint, " ", addstyle, " ", addmodels, " ", addkey, " ", button("Add provider", async () => { await request({ kind: "llmproviders", name: addname.value, endpoint: addendpoint.value, style: addstyle.value, models: addmodels.value.split(",").map(model => model.trim()).filter(model => model !== ""), ...(addkey.value.trim() !== "" ? { authrefname: addkey.value.trim() } : {}) }); status(`Added the provider ${addname.value}; nothing is hardcoded so any gateway works.`); await refresh(); }));
  providersbox.append(addrow);
  modelsroot.append(providersbox);

  const localbox = document.createElement("details");
  localbox.className = "sessiongroup";
  localbox.open = true;
  const localsummary = document.createElement("summary");
  localsummary.textContent = "Local model endpoint";
  localbox.append(localsummary);
  const localinfo = document.createElement("p");
  localinfo.textContent = llm.local !== undefined ? `${llm.local.endpoint} with ${llm.local.model} (${llm.local.style})${llm.local.health !== undefined ? ` · health ${llm.local.health.ok ? "ok" : `failing: ${llm.local.health.detail ?? "unknown"}`}` : " · no health check yet"}.` : "No local endpoint configured; local inference keeps sensitive extractions on the machine.";
  localbox.append(localinfo);
  const localactions = document.createElement("div");
  localactions.className = "actions";
  const localendpoint = document.createElement("input");
  localendpoint.placeholder = "local endpoint url";
  localendpoint.value = llm.local?.endpoint ?? "";
  const localmodel = document.createElement("input");
  localmodel.placeholder = "model name";
  localmodel.value = llm.local?.model ?? "";
  const localstyle = document.createElement("select");
  for (const style of ["chatcompletions", "responses", "messages", "gemini"]) { const option = document.createElement("option"); option.value = style; option.textContent = style; option.selected = llm.local?.style === style; localstyle.append(option); }
  localactions.append(localendpoint, " ", localmodel, " ", localstyle, " ", button("Save local", async () => { await request({ kind: "llmlocal", endpoint: localendpoint.value, model: localmodel.value, style: localstyle.value }); status("Saved the local model endpoint; the calls never leave the machine."); await refresh(); }), " ", button("Health check", async () => { await request({ kind: "llmlocal", check: true }); status("The local health check ran; the result rides the endpoint line."); await refresh(); }));
  localbox.append(localactions);
  modelsroot.append(localbox);

  const routesbox = document.createElement("details");
  routesbox.className = "sessiongroup";
  routesbox.open = true;
  const routesummary = document.createElement("summary");
  routesummary.textContent = `Model routes (${llm.routes.length})`;
  routesbox.append(routesummary);
  for (const task of llm.tasks) {
    const row = document.createElement("div");
    row.className = "sessionrow";
    const info = document.createElement("p");
    info.textContent = `${task.kind}: ${task.provider !== undefined ? `${task.provider} with ${task.model}` : "unrouted; the user picks the pair"}.`;
    row.append(info);
    const actions = document.createElement("div");
    actions.className = "actions";
    const providerselect = document.createElement("select");
    for (const provider of llm.providers) { const option = document.createElement("option"); option.value = provider.id; option.textContent = provider.name; providerselect.append(option); }
    const modelinput = document.createElement("input");
    modelinput.placeholder = "model";
    const fallbackselect = document.createElement("select");
    const noneoption = document.createElement("option");
    noneoption.value = "";
    noneoption.textContent = "no fallback";
    fallbackselect.append(noneoption);
    for (const provider of llm.providers) { const option = document.createElement("option"); option.value = provider.id; option.textContent = provider.name; fallbackselect.append(option); }
    const fallbackmodel = document.createElement("input");
    fallbackmodel.placeholder = "fallback model";
    actions.append(providerselect, " ", modelinput, " ", fallbackselect, " ", fallbackmodel, " ", button("Route", async () => { await request({ kind: "llmroutes", taskkind: task.kind, providerid: providerselect.value, model: modelinput.value, ...(fallbackselect.value !== "" ? { fallbackproviderid: fallbackselect.value, fallbackmodel: fallbackmodel.value } : {}) }); status(`Routed the ${task.kind} task kind.`); await refresh(); }), " ", button("Unroute", async () => { await request({ kind: "llmroutes", taskkind: task.kind, remove: true }); status(`Removed the route of the ${task.kind} task kind.`); await refresh(); }));
    row.append(actions);
    routesbox.append(row);
  }
  if (llm.routehistory.length > 0) {
    const history = document.createElement("p");
    history.textContent = `Route revisions: ${llm.routehistory.slice(0, 5).map(entry => `${entry.kind} r${entry.revision} ${entry.providerid}/${entry.model}`).join(" · ")}.`;
    routesbox.append(history);
  }
  modelsroot.append(routesbox);

  if (llm.parse !== undefined) {
    const badge = document.createElement("p");
    badge.textContent = `Last command: ${llm.parse.intent} at confidence ${Math.round(llm.parse.confidence * 100)}%${llm.parse.entities.length > 0 ? ` with ${llm.parse.entities.map(entity => `${entity.name}=${entity.value}`).join(", ")}` : ""}${llm.parse.model !== undefined ? ` parsed by ${llm.parse.model}` : " parsed locally"}.`;
    modelsroot.append(badge);
    if (intentbadge) intentbadge.textContent = `${llm.parse.intent} ${Math.round(llm.parse.confidence * 100)}%`;
  } else if (intentbadge) intentbadge.textContent = "";

  const draftsbox = document.createElement("details");
  draftsbox.className = "sessiongroup";
  draftsbox.open = true;
  const draftsummary = document.createElement("summary");
  draftsummary.textContent = `Model drafted plans (${llm.drafts.length})`;
  draftsbox.append(draftsummary);
  for (const draft of llm.drafts.slice(0, 5)) {
    const card = document.createElement("div");
    card.className = "sessionrow";
    const info = document.createElement("p");
    info.textContent = `${draft.goal} · ${draft.steps.length} steps · ${draft.state}${draft.lintfindings.length > 0 ? ` · ${draft.lintfindings.length} grammar finding${draft.lintfindings.length === 1 ? "" : "s"}` : " · clean grammar"} · by ${draft.model}.`;
    card.append(info);
    const edits: Array<{ id: string; kind: HTMLInputElement; target: HTMLInputElement; value: HTMLInputElement; summary: HTMLInputElement }> = [];
    for (const step of draft.steps) {
      const steprow = document.createElement("div");
      steprow.className = "actions";
      const kindinput = document.createElement("input");
      kindinput.value = step.kind;
      kindinput.placeholder = "kind";
      const targetinput = document.createElement("input");
      targetinput.value = step.target ?? "";
      targetinput.placeholder = "target";
      const valueinput = document.createElement("input");
      valueinput.value = step.value ?? "";
      valueinput.placeholder = "value";
      const summaryinput = document.createElement("input");
      summaryinput.value = step.summary;
      summaryinput.placeholder = "summary";
      steprow.append(kindinput, " ", targetinput, " ", valueinput, " ", summaryinput);
      card.append(steprow);
      edits.push({ id: step.id, kind: kindinput, target: targetinput, value: valueinput, summary: summaryinput });
    }
    if (draft.openquestions.length > 0) {
      const questions = document.createElement("p");
      questions.textContent = `Open questions: ${draft.openquestions.join(" | ")}`;
      card.append(questions);
    }
    if (draft.lintfindings.length > 0) {
      const findings = document.createElement("p");
      findings.textContent = `Grammar findings: ${draft.lintfindings.join(" ")}`;
      card.append(findings);
    }
    const actions = document.createElement("div");
    actions.className = "actions";
    actions.append(button("Approve draft", async () => { await request({ kind: "llmdraftdecision", draftid: draft.id, approve: true, steps: edits.map(edit => ({ id: edit.id, kind: edit.kind.value, ...(edit.target.value.trim() !== "" ? { target: edit.target.value } : {}), ...(edit.value.value.trim() !== "" ? { value: edit.value.value } : {}), summary: edit.summary.value })) }); status("The approved draft became a pending plan that still passes the same plan review."); await refresh(); }), " ", button("Reject draft", async () => { await request({ kind: "llmdraftdecision", draftid: draft.id }); status("The draft is rejected and stays for the audit trail."); await refresh(); }), " ", button("Replan failed tail", async () => { await request({ kind: "llmreplan", draftid: draft.id, failedstepids: edits.slice(-1).map(edit => edit.id), reason: "The last step failed and the model replans the tail." }); status("The model replanned the failed tail; the fresh review waits."); await refresh(); }));
    card.append(actions);
    draftsbox.append(card);
  }
  modelsroot.append(draftsbox);

  const replansbox = document.createElement("details");
  replansbox.className = "sessiongroup";
  replansbox.open = true;
  const replansummary = document.createElement("summary");
  replansummary.textContent = `Replans (${llm.replans.length})`;
  replansbox.append(replansummary);
  for (const replan of llm.replans.slice(0, 5)) {
    const card = document.createElement("div");
    card.className = "sessionrow";
    const info = document.createElement("p");
    info.textContent = `${replan.reason} · keeps ${replan.completedstepids.length} completed step${replan.completedstepids.length === 1 ? "" : "s"} · ${replan.state}.`;
    card.append(info);
    for (const step of replan.tail) {
      const tail = document.createElement("p");
      tail.textContent = `↻ ${step.id} ${step.kind}: ${step.summary} — fresh review required`;
      card.append(tail);
    }
    const actions = document.createElement("div");
    actions.className = "actions";
    actions.append(button("Approve fresh review", async () => { await request({ kind: "llmreplandecision", replanid: replan.id, approve: true }); status("The approved replan became a pending plan with the changed tail under the same plan review."); await refresh(); }), " ", button("Reject replan", async () => { await request({ kind: "llmreplandecision", replanid: replan.id }); status("The replan is rejected and stays for the audit trail."); await refresh(); }));
    card.append(actions);
    replansbox.append(card);
  }
  modelsroot.append(replansbox);

  const notesbox = document.createElement("details");
  notesbox.className = "sessiongroup";
  const notesummary = document.createElement("summary");
  notesummary.textContent = `Reflection notes (${llm.notes.length})`;
  notesbox.append(notesummary);
  for (const note of llm.notes.slice(0, 5)) {
    const row = document.createElement("p");
    row.textContent = `Step ${note.stepid} (${note.runid}): ${note.outcome} — lesson ${note.lesson} — next ${note.advice} · by ${note.model}.`;
    notesbox.append(row);
  }
  modelsroot.append(notesbox);

  const budgetbox = document.createElement("details");
  budgetbox.className = "sessiongroup";
  budgetbox.open = true;
  const budgetsummary = document.createElement("summary");
  budgetsummary.textContent = "Cost budget";
  budgetbox.append(budgetsummary);
  const meter = document.createElement("progress");
  meter.max = llm.budget?.maxtokens ?? (llm.usage.totaltokens || 1);
  meter.value = Math.min(llm.usage.totaltokens, Number(meter.max));
  budgetbox.append(meter);
  const budgetinfo = document.createElement("p");
  budgetinfo.textContent = `${llm.usage.totaltokens} tokens (${llm.usage.prompttokens} prompt and ${llm.usage.completiontokens} completion) and ${llm.usage.cost.toFixed(4)} cost over ${llm.usage.calls} call${llm.usage.calls === 1 ? "" : "s"}${llm.budget?.maxtokens !== undefined ? ` against the ${llm.budget.maxtokens} token ceiling` : " with no token ceiling"}${llm.budget?.maxcost !== undefined ? ` and the ${llm.budget.maxcost} ${llm.budget.currency ?? ""} cost ceiling` : ""}; a reached ceiling halts and asks.`;
  budgetbox.append(budgetinfo);
  const budgetactions = document.createElement("div");
  budgetactions.className = "actions";
  const tokensinput = document.createElement("input");
  tokensinput.placeholder = "token ceiling";
  const costinput = document.createElement("input");
  costinput.placeholder = "cost ceiling";
  const currencyinput = document.createElement("input");
  currencyinput.placeholder = "currency";
  budgetactions.append(tokensinput, " ", costinput, " ", currencyinput, " ", button("Set budget", async () => { await request({ kind: "llmbudget", ...(tokensinput.value.trim() !== "" ? { maxtokens: Number(tokensinput.value) } : {}), ...(costinput.value.trim() !== "" ? { maxcost: Number(costinput.value) } : {}), ...(currencyinput.value.trim() !== "" ? { currency: currencyinput.value } : {}) }); status("Saved the cost budget; every ceiling stays the user choice."); await refresh(); }), " ", button("Remove budget", async () => { await request({ kind: "llmbudget", remove: true }); status("The cost budget is gone; the runs stay unbounded."); await refresh(); }));
  budgetbox.append(budgetactions);
  modelsroot.append(budgetbox);

  const templatesbox = document.createElement("details");
  templatesbox.className = "sessiongroup";
  const templatesummary = document.createElement("summary");
  templatesummary.textContent = `Prompt library (${llm.templates.length})`;
  templatesbox.append(templatesummary);
  for (const template of llm.templates.slice(0, 8)) {
    const row = document.createElement("p");
    row.textContent = `${template.name} v${template.version} · variables ${template.variables.join(", ") || "none"}${template.notes !== undefined ? ` · ${template.notes}` : ""}: ${template.body.slice(0, 120)}${template.body.length > 120 ? "…" : ""}`;
    templatesbox.append(row);
  }
  const templateactions = document.createElement("div");
  templateactions.className = "actions";
  const templatename = document.createElement("input");
  templatename.placeholder = "template name";
  const templatebody = document.createElement("input");
  templatebody.placeholder = "body with {{variables}}";
  const templatenotes = document.createElement("input");
  templatenotes.placeholder = "change notes";
  templateactions.append(templatename, " ", templatebody, " ", templatenotes, " ", button("Save template", async () => { await request({ kind: "llmtemplate", name: templatename.value, body: templatebody.value, ...(templatenotes.value.trim() !== "" ? { notes: templatenotes.value } : {}) }); status("Saved the template version with its change notes."); await refresh(); }), " ", button("Remove template", async () => { await request({ kind: "llmtemplate", name: templatename.value, remove: true }); status("Removed every version of the template."); await refresh(); }));
  templatesbox.append(templateactions);
  modelsroot.append(templatesbox);

  const guardbox = document.createElement("details");
  guardbox.className = "sessiongroup";
  const guardsummary = document.createElement("summary");
  guardsummary.textContent = `Guard refusals (${llm.guardnotices.length})`;
  guardbox.append(guardsummary);
  for (const notice of llm.guardnotices.slice(0, 5)) {
    const row = document.createElement("p");
    row.textContent = `${notice.verdict} after ${notice.attempts} attempt${notice.attempts === 1 ? "" : "s"}: ${notice.reason ?? "the output failed its guard"}.`;
    guardbox.append(row);
  }
  if (llm.guardnotices.length === 0) {
    const row = document.createElement("p");
    row.textContent = "No guard refusal yet; invalid model output never executes.";
    guardbox.append(row);
  }
  modelsroot.append(guardbox);
}

/** Renders the agents tab of the 1.1.58 and 1.1.59 swarm: the overview header with the killswitch, the agent cards with their roles, tabs, states, budgets, usage meters, current tasks, review statuses and handoff arrows, the spawn dialog, the task queue view with its lanes, priorities and claims, the mailbox view with the compose form, the blackboard view with its editor, the leader worker topology with the election, assignment, scaling and planner executor split controls, the progressboard with its milestones, the review and verification cards with the critic verdict flows and verifier badges, the escalation inbox, the consensus rounds with their votes and quorum, the handoff log with its transfer and resume buttons, the lock view with its expiry countdowns and releases, the conflict scans with the suggested ordering, the merged report preview with its export, the compare, lesson and cost controls, the interleaved timeline with the replay and the lifecycle event feed. */
type securityview = securityviewtype & { prompts?: Array<{ stepid: string; kind: string; origin: string; prompt: string }>; promptduration?: number; logretention?: number; maskshapes?: string[]; sessionorigin?: string; gates?: Array<{ gateid: string; kind: string; stepid: string; origin: string; payload: Record<string, string>; state: string; openedat: number; resolvedat?: number; actor?: string }>; resolutions?: Array<{ gateid: string; kind: string; stepid: string; decision: string; actor: string; at: number }>; deferred?: Array<{ stepid: string; kind: string; origin: string; reason: string; resetsat: number; at: number }>; phishverdicts?: Array<{ origin: string; matchedorigin?: string; distance: number; threshold: number; blocked: boolean; reason: string; at: number }>; vault?: Array<{ vaultid: string; label: string; scope: string; provenance: string; createdat: number }>; };

/** Renders the security part one surface: the denydefault posture with the automation allowlist, the per origin profiles with their kind grants and denials, the active consent windows with their remaining time and the renew action, the consent prompts of the pending sensitive steps with their class badges, the revoke consent control with its confirm dialog naming the halted steps, the fresh class consents, the mask rules with the redacted field notes, the revocation history and the per run log chain verification with the seal hash. */
function rendersecurity(context: { security?: securityview; plan?: agentplan; session?: { id: string; origin?: string } }): void {
  if (!securityroot) return;
  securityroot.replaceChildren();
  const view = context.security;
  if (!view) { securityroot.textContent = "The security state is unknown."; return; }
  const head = document.createElement("p");
  head.textContent = `Posture ${view.posture}: the allowlist holds ${view.allowlist.length} exact origin${view.allowlist.length === 1 ? "" : "s"} with no wildcard expansion, ${view.profiles.length} origin profile${view.profiles.length === 1 ? "" : "s"}, ${view.windows.filter(window => window.state === "active").length} active consent window${view.windows.filter(window => window.state === "active").length === 1 ? "" : "s"} and ${view.revocations.length} recorded revocation${view.revocations.length === 1 ? "" : "s"}.`;
  securityroot.append(head);

  const allowbox = document.createElement("details");
  allowbox.className = "sessiongroup";
  const allowsummary = document.createElement("summary");
  allowsummary.textContent = "Automation allowlist (denydefault)";
  allowbox.append(allowsummary);
  if (view.allowlist.length === 0) { const none = document.createElement("p"); none.textContent = "No origin is granted yet; the denydefault posture refuses every ungranted origin."; allowbox.append(none); }
  for (const entry of view.allowlist) {
    const line = document.createElement("p");
    line.textContent = `${entry.origin} · profile workspace ${entry.profileid} · granted ${new Date(entry.grantedat).toLocaleString()}`;
    line.append(" ", button("Remove", async () => { await request({ kind: "security", allowlist: { remove: { origin: entry.origin } } }); await refresh(); }));
    allowbox.append(line);
  }
  const origininput = document.createElement("input");
  origininput.placeholder = "https://exact.example";
  origininput.setAttribute("aria-label", "Exact origin to grant");
  const addorigin = button("Grant exact origin", async () => { const origin = origininput.value.trim(); if (origin === "") throw new Error("The allowlist grant needs its exact origin."); await request({ kind: "security", allowlist: { add: { origin } } }); origininput.value = ""; await refresh(); });
  allowbox.append(origininput, " ", addorigin);
  const allownote = document.createElement("p");
  allownote.className = "muted";
  allownote.textContent = "The allowlist binds every grant to one exact origin with no wildcard expansion; the active tab grant counts as exactly one explicit single origin grant, and grants never outlive their named boundary.";
  allowbox.append(allownote);
  securityroot.append(allowbox);

  const profilebox = document.createElement("details");
  profilebox.className = "sessiongroup";
  const profilesummarynode = document.createElement("summary");
  profilesummarynode.textContent = "Origin profiles";
  profilebox.append(profilesummarynode);
  if (view.profiles.length === 0) { const none = document.createElement("p"); none.textContent = profilesummary(undefined); profilebox.append(none); }
  for (const profile of view.profiles) {
    const line = document.createElement("p");
    line.textContent = `${profile.origin}: ${profile.grants.length} granted kind${profile.grants.length === 1 ? "" : "s"}${profile.denials.length > 0 ? `, ${profile.denials.length} denied kind${profile.denials.length === 1 ? "" : "s"}` : ""}.`;
    profilebox.append(line);
  }
  if (context.session?.origin !== undefined) {
    const kindinput = document.createElement("input");
    kindinput.placeholder = "action kind such as submitform";
    kindinput.setAttribute("aria-label", "Action kind for the origin profile");
    profilebox.append(kindinput, " ", button("Grant kind on active origin", async () => { const kind = kindinput.value.trim(); if (kind === "") throw new Error("The origin profile decision needs its action kind."); await request({ kind: "security", profile: { origin: context.session?.origin, kind, decision: "grant" } }); await refresh(); }), " ", button("Deny kind on active origin", async () => { const kind = kindinput.value.trim(); if (kind === "") throw new Error("The origin profile decision needs its action kind."); await request({ kind: "security", profile: { origin: context.session?.origin, kind, decision: "deny" } }); await refresh(); }));
  }
  securityroot.append(profilebox);

  const windowbox = document.createElement("details");
  windowbox.className = "sessiongroup";
  const windowsummary = document.createElement("summary");
  windowsummary.textContent = "Consent windows";
  windowbox.append(windowsummary);
  const now = Date.now();
  if (view.windows.length === 0) { const none = document.createElement("p"); none.textContent = "No consent window exists yet; every sensitive step waits for its prompt."; windowbox.append(none); }
  for (const window of view.windows) {
    const remaining = window.state === "active" ? Math.max(0, window.expiresat - now) : 0;
    const line = document.createElement("p");
    line.textContent = `${window.origin} · ${window.state === "active" ? `active, ${Math.ceil(remaining / 1000)}s of the ${window.boundary} boundary left` : `closed at ${new Date(window.closedat ?? window.expiresat).toLocaleString()}`} · ${window.kinds.length} kind${window.kinds.length === 1 ? "" : "s"} covered.`;
    if (window.state === "active") {
      const durationinput = document.createElement("input");
      durationinput.placeholder = "duration in ms";
      durationinput.setAttribute("aria-label", "Renewal duration in milliseconds");
      line.append(" ", durationinput, " ", button("Renew", async () => { const duration = Number(durationinput.value.trim()); const offer = Number.isFinite(duration) && duration > 0 ? duration : view.promptduration; if (offer === undefined) throw new Error("The renewal prompt needs its duration in milliseconds; no grant ever defaults to unlimited."); await request({ kind: "security", consent: { renew: { windowid: window.id, duration: offer } } }); await refresh(); }));
    }
    windowbox.append(line);
  }
  const durationinput = document.createElement("input");
  durationinput.placeholder = "duration in ms";
  durationinput.setAttribute("aria-label", "Consent window duration in milliseconds");
  const offered = view.promptduration !== undefined ? String(view.promptduration) : "";
  if (offered !== "") durationinput.value = offered;
  windowbox.append(durationinput, " ", button("Open consent window", async () => { const duration = Number(durationinput.value.trim()); if (!Number.isFinite(duration) || duration <= 0) throw new Error("The consent prompt needs its duration in milliseconds; no grant ever defaults to unlimited."); await request({ kind: "security", consent: { open: { duration } } }); await refresh(); }));
  const windownote = document.createElement("p");
  windownote.className = "muted";
  windownote.textContent = "Every consent window scopes to one session and one origin and names its boundary; a window past its boundary suspends the run mid step and the executor refuses to resume without a new explicit prompt.";
  windowbox.append(windownote);
  securityroot.append(windowbox);

  const promptbox = document.createElement("details");
  promptbox.className = "sessiongroup";
  const promptsummary = document.createElement("summary");
  promptsummary.textContent = "Consent prompts of the pending plan";
  promptbox.append(promptsummary);
  const prompts = view.prompts ?? [];
  if (prompts.length === 0) { const none = document.createElement("p"); none.textContent = "No sensitive step of the current plan waits for a fresh consent prompt."; promptbox.append(none); }
  for (const pending of prompts) {
    const classification = context.plan?.steps.find(step => step.id === pending.stepid) !== undefined ? sensitiveclassesof(context.plan.steps.find(step => step.id === pending.stepid) as { kind: actionkind; value?: string; options?: string }) : { classes: [] as sensitiveclass[], bydefault: false };
    const line = document.createElement("p");
    line.textContent = `${pending.prompt}${classification.classes.length > 0 ? ` Class badge: ${classification.classes.join(", ")}.` : classification.bydefault ? " Class badge: sensitive by default." : ""}`;
    promptbox.append(line);
  }
  if (context.session?.origin !== undefined && prompts.length > 0) {
    promptbox.append(button("Consent to every sensitive class", async () => {
      const classes = new Set<sensitiveclass>();
      for (const pending of prompts) for (const step of context.plan?.steps ?? []) if (step.id === pending.stepid) for (const classname of sensitiveclassesof(step).classes) classes.add(classname);
      if (classes.size === 0) throw new Error("The pending steps grade sensitive by default; open their consent window instead.");
      await request({ kind: "security", consent: { classes: { origin: context.session?.origin, classes: [...classes] } } });
      await refresh();
    }));
  }
  securityroot.append(promptbox);

  const consentbox = document.createElement("div");
  consentbox.className = "actions";
  const revoke = button("Revoke consent mid run", async () => {
    const plan = context.plan;
    if (!plan) throw new Error("The revocation needs its run; no plan is open.");
    const halted = plan.steps.map(step => `${step.id} (${step.kind})`);
    const confirmnode = document.createElement("p");
    confirmnode.textContent = `Confirm the revokerun: the pending step and every queued step halt without executing${halted.length > 0 ? ` (${halted.length} step${halted.length === 1 ? "" : "s"} of the plan: ${halted.slice(0, 5).join(", ")}${halted.length > 5 ? ", …" : ""})` : ""}.`;
    confirmnode.append(" ", button("Confirm revokerun", async () => { await request({ kind: "security", revoke: { runid: plan.id } }); await refresh(); }), " ", button("Cancel", async () => { confirmnode.remove(); }));
    securityroot.prepend(confirmnode);
  });
  consentbox.append(revoke);
  const revocations = view.revocations;
  if (revocations.length > 0) consentbox.append(document.createElement("span"), document.createTextNode(`Last revocation: ${revocations[0]?.runid} halted ${revocations[0]?.haltedstepids.length} step${revocations[0]?.haltedstepids.length === 1 ? "" : "s"}.`));
  securityroot.append(consentbox);

  const maskbox = document.createElement("details");
  maskbox.className = "sessiongroup";
  const masksummary = document.createElement("summary");
  masksummary.textContent = "Mask rules for sensitive field shapes";
  maskbox.append(masksummary);
  const shapeinput = document.createElement("input");
  shapeinput.placeholder = "field shape such as accountnumber";
  shapeinput.setAttribute("aria-label", "Field shape to mask");
  maskbox.append(shapeinput, " ", button("Add mask shape", async () => { const shape = shapeinput.value.trim(); if (shape === "") throw new Error("The mask rule needs its field shape."); await request({ kind: "security", mask: { add: { shapes: [shape] } } }); await refresh(); }));
  if (view.maskrules.length === 0) { const none = document.createElement("p"); none.textContent = "No custom mask rule exists; the documented password, token, card and secret shapes always apply."; maskbox.append(none); }
  for (const rule of view.maskrules) {
    const line = document.createElement("p");
    line.textContent = `${rule.shapes.join(", ")}${rule.origin !== undefined ? ` scoped to ${rule.origin}` : " global"} · values show as [redacted] fields in step details.`;
    line.append(" ", button("Remove", async () => { await request({ kind: "security", mask: { remove: { id: rule.id } } }); await refresh(); }));
    maskbox.append(line);
  }
  securityroot.append(maskbox);

  const gatebox = document.createElement("details");
  gatebox.className = "sessiongroup";
  gatebox.open = (view.gates ?? []).some(gate => gate.state === "open");
  const gatesummary = document.createElement("summary");
  gatesummary.textContent = "Confirm gates for payments, deletions and credentials";
  gatebox.append(gatesummary);
  const gates = view.gates ?? [];
  if (gates.length === 0) { const none = document.createElement("p"); none.textContent = "No confirm gate exists; payment, destructive delete and credential steps open one and pause the executor."; gatebox.append(none); }
  for (const gate of gates) {
    const line = document.createElement("p");
    const payload = Object.entries(gate.payload).map(([key, value]) => `${key} ${value}`).join(", ");
    line.textContent = `${gate.kind} · step ${gate.stepid} on ${gate.origin} · ${payload} · ${gate.state}${gate.resolvedat !== undefined ? ` at ${new Date(gate.resolvedat).toLocaleTimeString()} by ${gate.actor ?? "the user"}` : " · waiting for one distinct human action; no timeout resolves a gate"}.`;
    if (gate.state === "open") line.append(" ", button("Approve", async () => { await request({ kind: "security", gate: { resolve: { gateid: gate.gateid, decision: "resolved" } } }); await refresh(); }), " ", button("Refuse", async () => { await request({ kind: "security", gate: { resolve: { gateid: gate.gateid, decision: "refused" } } }); await refresh(); }));
    gatebox.append(line);
  }
  securityroot.append(gatebox);

  const deferbox = document.createElement("details");
  deferbox.className = "sessiongroup";
  const defersummary = document.createElement("summary");
  defersummary.textContent = "Deferred steps and phishguard verdicts";
  deferbox.append(defersummary);
  const deferred = view.deferred ?? [];
  if (deferred.length === 0) { const none = document.createElement("p"); none.textContent = "No deferred step waits for a ratelimit bucket reset."; deferbox.append(none); }
  for (const step of deferred) deferbox.append(Object.assign(document.createElement("p"), { textContent: `Deferred: the ${step.kind} step ${step.stepid} on ${step.origin} waits for the bucket reset at ${new Date(step.resetsat).toLocaleTimeString()}: ${step.reason}` }));
  const phishverdicts = view.phishverdicts ?? [];
  if (phishverdicts.length > 0) {
    const phishnote = document.createElement("p");
    phishnote.textContent = "Phishguard verdicts before login steps:";
    deferbox.append(phishnote);
    for (const verdict of phishverdicts) deferbox.append(Object.assign(document.createElement("p"), { textContent: `${verdict.origin}${verdict.matchedorigin !== undefined ? ` sits ${verdict.distance} from the granted origin ${verdict.matchedorigin}` : ` sits ${verdict.distance} from the closest granted origin`} under the threshold ${verdict.threshold}${verdict.blocked ? " — the credential step blocks and the deny names the matched origin" : ""}.` }));
  } else {
    deferbox.append(Object.assign(document.createElement("p"), { textContent: "No phishguard verdict exists yet; a credential step on a new origin records the first one under the user threshold." }));
  }
  const vaultnote = document.createElement("p");
  const vaultlabels = (view.vault ?? []).map(entry => entry.label).join(", ");
  vaultnote.textContent = `Secretvault: ${vaultlabels !== "" ? `${vaultlabels} (labels only; values stay behind the vault and the transparencypage manages them)` : "no entry yet; the transparencypage stores labels and values behind the vault seam"}.`;
  deferbox.append(vaultnote);
  securityroot.append(deferbox);

  const chainbox = document.createElement("details");
  chainbox.className = "sessiongroup";
  const chainsummary = document.createElement("summary");
  chainsummary.textContent = "Run log chain verification";
  chainbox.append(chainsummary);
  if (view.chain.length === 0) { const none = document.createElement("p"); none.textContent = "No run log exists yet; the session start writes the consentscope grant into the immutable log."; chainbox.append(none); }
  for (const chain of view.chain) {
    const line = document.createElement("p");
    line.textContent = `${chain.runid}: ${chain.valid ? "chain verified" : `chain broken at entry ${chain.brokenat ?? "unknown"}`} · ${chain.entries} entries${chain.sealhash !== undefined ? ` · seal hash ${chain.sealhash.slice(0, 12)}… at ${new Date(chain.sealedat ?? 0).toLocaleString()}` : " · unsealed"}.`;
    line.append(" ", button("Read log", async () => { const read = await request({ kind: "security", read: { runid: chain.runid } }) as { log?: Array<{ kind: string; summary: string }>; verification?: string }; status(read.verification ?? `The log of ${chain.runid} read through the audit accessor.`); }), " ", button("Export audit file", async () => { const exported = await request({ kind: "security", export: { runid: chain.runid } }) as { export?: { entries: number } }; status(`The verified run log of ${chain.runid} was exported as an audit file with ${exported.export?.entries ?? 0} entries.`); }));
    chainbox.append(line);
  }
  const chainnote = document.createElement("p");
  chainnote.className = "muted";
  chainnote.textContent = "The immutable log appends only: every entry chains through its loghash to its predecessor, the session close seals the chain with a final hash, and the audit accessor refuses reads of a chain with a broken link.";
  chainbox.append(chainnote);
  securityroot.append(chainbox);

  if (view.sessionorigin !== undefined && !view.allowlist.some(entry => entry.origin === view.sessionorigin)) {
    const notice = document.createElement("p");
    notice.textContent = denydefaultnotice(view.sessionorigin);
    securityroot.append(notice);
  }
}

type environmentsview = {
  report: { version: string; environments: Array<{ stepid: string; environment: string }>; turnarounds: Array<{ stepid: string; milliseconds: number }>; offscreen: Array<{ document: string; runid: string; reasons: string[]; justification: string; createdat: number; closedat?: number }>; workers: number; keepalive?: { runid: string; state: string; beats: number; lastbeatat: number; portopen: boolean } };
  grants?: string[];
  requirements: Array<{ kind: string; environments: string[]; defaultenvironment: string }>;
  registry: Array<{ environment: string; adapter: string; description: string }>;
  offscreengranted: boolean;
  parseoffload: boolean;
  workerpoolsize?: number;
  sandboxorigins?: string[];
  workerevents: Array<{ id: string; runid: string; kind: string; workers: number; reason: string; at: number }>;
  runstates: Array<{ runid: string; sessionid: string; state: string; beats: number; lastbeatat: number; pendingstepid?: string; urls: number }>;
  locks: Array<{ sessionid: string; runid: string; holder: string; acquiredat: number; expiresat?: number }>;
  zombies: string[];
  urls: Array<{ url: string; stepid: string; at: number }>;
  recovery?: { runid: string; pendingstepid?: string; recoverable: boolean; reason: string };
  restartnotice?: string;
};

/** Renders the execution environments surface: the environment badges of the open run grouped by environment, the keepalive heartbeat trail with its port state, the worker pool counts and turnarounds, the offscreen registry with its reasons, the sandbox renders, the environment grants with the consent flow link, the offscreen capability request, the zombie warning with its reap action, the url history of the open run, the restart recovery notice and the per profile options of the parse offload, the worker pool size, the sandbox origins and the keepalive documentation. */
function renderenvironments(context: { environments?: environmentsview }): void {
  if (!environmentsroot) return;
  environmentsroot.replaceChildren();
  const view = context.environments;
  if (!view) { environmentsroot.textContent = "The execution environment state is unknown."; return; }
  const head = document.createElement("p");
  head.textContent = `Steps by environment: ${view.report.environments.length} executed · offscreen ${view.offscreengranted ? "granted" : "not granted"} · parse offload ${view.parseoffload ? "on" : "off"} · workers ${view.report.workers} · sandbox origins ${view.sandboxorigins?.length ?? 0} configured.`;
  environmentsroot.append(head);

  const keepalive = view.report.keepalive;
  const keepbox = document.createElement("div");
  keepbox.className = "actions";
  const beatinfo = document.createElement("span");
  beatinfo.textContent = keepalive ? `Keepalive ${keepalive.state}: ${keepalive.beats} beat${keepalive.beats === 1 ? "" : "s"}, port ${keepalive.portopen ? "open" : "closed"}, last beat ${new Date(keepalive.lastbeatat).toLocaleTimeString()}${view.workerpoolsize !== undefined ? ` · pool size ${view.workerpoolsize}` : ""}.` : "No run state holds a keepalive port.";
  keepbox.append(beatinfo);
  if (keepalive?.state === "active") {
    keepbox.append(button("Beat now", async () => { await request({ kind: "runstate", beat: true }); await refresh(); }), button("Close run state", async () => { await request({ kind: "runstate", stop: true }); await refresh(); }));
  }
  environmentsroot.append(keepbox);
  const keepnote = document.createElement("p");
  keepnote.className = "muted";
  keepnote.textContent = "Keepalive runs only during active reviewed plans: the port opens behind an approved plan of an active session and closes at every terminal state.";
  environmentsroot.append(keepnote);

  if (view.restartnotice !== undefined || view.recovery !== undefined) {
    const notice = document.createElement("p");
    notice.textContent = view.restartnotice ?? view.recovery?.reason ?? "";
    if (view.recovery?.recoverable === true) notice.append(" ", button("Resume pending step", async () => { const result = await request({ kind: "runstate", recover: true }) as { resumed?: string; recovery?: { reason: string } }; status(result.resumed ?? result.recovery?.reason ?? "The recovery finished."); await refresh(); }));
    environmentsroot.append(notice);
  }

  if (view.zombies.length > 0) {
    const warning = document.createElement("p");
    warning.textContent = `Zombie run${view.zombies.length === 1 ? "" : "s"} whose heartbeat fell silent: ${view.zombies.join(", ")}.`;
    warning.append(" ", button("Reap zombie runs", async () => { const result = await request({ kind: "runstate", reap: true }) as { reaped?: string[] }; status(`The reaper closed ${result.reaped?.length ?? 0} zombie run${result.reaped?.length === 1 ? "" : "s"}.`); await refresh(); }));
    environmentsroot.append(warning);
  }

  const grouped = new Map<string, string[]>();
  for (const entry of view.report.environments) grouped.set(entry.environment, [...(grouped.get(entry.environment) ?? []), entry.stepid]);
  const groupbox = document.createElement("details");
  groupbox.className = "sessiongroup";
  const groupsummary = document.createElement("summary");
  groupsummary.textContent = "Steps grouped by execution environment";
  groupbox.append(groupsummary);
  if (grouped.size === 0) { const none = document.createElement("p"); none.textContent = "No step of the open run has executed yet."; groupbox.append(none); }
  for (const [environment, stepids] of grouped) {
    const line = document.createElement("p");
    line.textContent = `${environment}: ${stepids.length} step${stepids.length === 1 ? "" : "s"}${view.report.turnarounds.filter(entry => stepids.includes(entry.stepid)).length > 0 ? ` · worker turnaround ${view.report.turnarounds.filter(entry => stepids.includes(entry.stepid)).map(entry => `${entry.stepid}: ${entry.milliseconds} ms`).join(", ")}` : ""}`;
    groupbox.append(line);
  }
  environmentsroot.append(groupbox);

  const grantbox = document.createElement("div");
  grantbox.className = "actions";
  const grantinfo = document.createElement("span");
  grantinfo.textContent = view.grants !== undefined ? `Session environment grants: ${view.grants.length > 0 ? view.grants.join(", ") : "the documented default posture"}.` : "Session environment grants: the documented default posture (no grant list configured).";
  grantbox.append(grantinfo);
  const allenvironments = ["pagecontext", "isolatedworld", "offscreenworker", "sandboxframe"];
  for (const environment of allenvironments) {
    const active = view.grants?.includes(environment) ?? false;
    grantbox.append(" ", button(`${active ? "Revoke" : "Grant"} ${environment}`, async () => {
      const current = view.grants ?? [];
      const next = active ? current.filter(entry => entry !== environment) : [...current, environment];
      await request({ kind: "environments", grants: next });
      await refresh();
    }));
  }
  environmentsroot.append(grantbox);
  const grantnote = document.createElement("p");
  grantnote.className = "muted";
  grantnote.textContent = "Environment grants join the origin grants of the session record: a configured list narrows every step to its entries and the request links to the same consent flow the origins use.";
  environmentsroot.append(grantnote);

  const capabilitybox = document.createElement("div");
  capabilitybox.className = "actions";
  const capabilityinfo = document.createElement("span");
  capabilityinfo.textContent = `Offscreen capability: ${view.offscreengranted ? "granted" : "absent — heavy parses keep their inline fallback inside the page"}.`;
  capabilitybox.append(capabilityinfo);
  if (!view.offscreengranted) capabilitybox.append(" ", button("Request offscreen capability", async () => { const result = await request({ kind: "environments", requestcapability: true }) as { requested?: boolean }; status(result.requested === true ? "The offscreen capability was granted; the worker pool may spawn." : "The capability request stayed refused; the inline fallback holds."); await refresh(); }));
  else capabilitybox.append(" ", button("Close offscreen document", async () => { await request({ kind: "environments", offscreenclose: true }); await refresh(); }));
  environmentsroot.append(capabilitybox);

  const optionsbox = document.createElement("details");
  optionsbox.className = "sessiongroup";
  const optionssummary = document.createElement("summary");
  optionssummary.textContent = "Environment options";
  optionsbox.append(optionssummary);
  const offloadrow = document.createElement("div");
  offloadrow.className = "actions";
  offloadrow.append(button(`Parse offload: ${view.parseoffload ? "on" : "off"}`, async () => { await request({ kind: "environments", settings: { parseoffload: !view.parseoffload } }); await refresh(); }));
  const poolinput = document.createElement("input");
  poolinput.type = "number";
  poolinput.min = "1";
  poolinput.placeholder = "worker pool size (no cap)";
  poolinput.value = view.workerpoolsize !== undefined ? String(view.workerpoolsize) : "";
  offloadrow.append(" ", poolinput, " ", button("Set pool size", async () => { const value = poolinput.value.trim(); await request({ kind: "environments", settings: { ...(value !== "" ? { workerpoolsize: Number(value) } : {}) } }); await refresh(); }));
  optionsbox.append(offloadrow);
  const origininput = document.createElement("input");
  origininput.type = "url";
  origininput.placeholder = "https://origin.example to allow sandbox renders";
  const originrow = document.createElement("div");
  originrow.className = "actions";
  originrow.append(origininput, " ", button("Add sandbox origin", async () => { const value = origininput.value.trim(); if (value === "") return; const next = [...(view.sandboxorigins ?? []), value]; await request({ kind: "environments", settings: { sandboxorigins: next } }); await refresh(); }));
  optionsbox.append(originrow);
  if ((view.sandboxorigins ?? []).length > 0) {
    const originlist = document.createElement("ul");
    originlist.className = "audit";
    for (const origin of view.sandboxorigins ?? []) {
      const item = document.createElement("li");
      item.textContent = origin;
      item.append(" ", button("Remove", async () => { await request({ kind: "environments", settings: { sandboxorigins: (view.sandboxorigins ?? []).filter(entry => entry !== origin) } }); await refresh(); }));
      originlist.append(item);
    }
    optionsbox.append(originlist);
  }
  const intervalinput = document.createElement("input");
  intervalinput.type = "number";
  intervalinput.min = "1";
  intervalinput.placeholder = "keepalive interval ms (roadmap: 30000)";
  const intervalrow = document.createElement("div");
  intervalrow.className = "actions";
  intervalrow.append(intervalinput, " ", button("Set interval", async () => { const value = intervalinput.value.trim(); if (value === "") return; await request({ kind: "environments", settings: { keepaliveinterval: Number(value) } }); await refresh(); }));
  optionsbox.append(intervalrow);
  environmentsroot.append(optionsbox);

  if (view.registry.length > 0) {
    const registrybox = document.createElement("details");
    registrybox.className = "sessiongroup";
    const registrysummary = document.createElement("summary");
    registrysummary.textContent = "Executor registry";
    registrybox.append(registrysummary);
    const registrylist = document.createElement("ul");
    registrylist.className = "audit";
    for (const adapter of view.registry) {
      const item = document.createElement("li");
      item.textContent = `${adapter.environment} → ${adapter.adapter}: ${adapter.description}`;
      registrylist.append(item);
    }
    registrybox.append(registrylist);
    environmentsroot.append(registrybox);
  }

  if (view.report.offscreen.length > 0) {
    const offbox = document.createElement("details");
    offbox.className = "sessiongroup";
    const offsummary = document.createElement("summary");
    offsummary.textContent = `Offscreen documents (${view.report.offscreen.length})`;
    offbox.append(offsummary);
    const offlist = document.createElement("ul");
    offlist.className = "audit";
    for (const entry of view.report.offscreen) {
      const item = document.createElement("li");
      item.textContent = `${entry.document} for the run ${entry.runid}: ${entry.reasons.join(", ")}${entry.closedat !== undefined ? ` · closed ${new Date(entry.closedat).toLocaleTimeString()}` : " · open"} — ${entry.justification}`;
      offlist.append(item);
    }
    offbox.append(offlist);
    environmentsroot.append(offbox);
  }

  if (view.workerevents.length > 0) {
    const workerbox = document.createElement("details");
    workerbox.className = "sessiongroup";
    const workersummary = document.createElement("summary");
    workersummary.textContent = `Worker activity (${view.workerevents.length})`;
    workerbox.append(workersummary);
    const workerlist = document.createElement("ul");
    workerlist.className = "audit";
    for (const event of view.workerevents.slice(0, 10)) {
      const item = document.createElement("li");
      item.textContent = `${event.kind} ${event.workers} worker${event.workers === 1 ? "" : "s"}: ${event.reason}`;
      workerlist.append(item);
    }
    workerbox.append(workerlist);
    environmentsroot.append(workerbox);
  }

  if (view.urls.length > 0) {
    const urlbox = document.createElement("details");
    urlbox.className = "sessiongroup";
    const urlsummary = document.createElement("summary");
    urlsummary.textContent = `Url history of the open run (${view.urls.length})`;
    urlbox.append(urlsummary);
    const urllist = document.createElement("ol");
    urllist.className = "audit";
    for (const entry of view.urls) {
      const item = document.createElement("li");
      item.textContent = `${new Date(entry.at).toLocaleTimeString()} ${entry.url} (step ${entry.stepid})`;
      urllist.append(item);
    }
    urlbox.append(urllist);
    environmentsroot.append(urlbox);
  }

  const locksbox = document.createElement("details");
  locksbox.className = "sessiongroup";
  const lockssummary = document.createElement("summary");
  lockssummary.textContent = `Run locks (${view.locks.length})`;
  locksbox.append(lockssummary);
  if (view.locks.length === 0) { const none = document.createElement("p"); none.textContent = "No session holds a run lock; one session never carries two concurrent runs."; locksbox.append(none); }
  const locklist = document.createElement("ul");
  locklist.className = "audit";
  for (const lock of view.locks) {
    const item = document.createElement("li");
    item.textContent = `Session ${lock.sessionid} → run ${lock.runid} (${lock.holder})${lock.expiresat !== undefined ? ` · expires ${new Date(lock.expiresat).toLocaleTimeString()}` : " · no expiry"}`;
    locklist.append(item);
  }
  locksbox.append(locklist);
  environmentsroot.append(locksbox);
}

function renderagents(context: { swarm?: swarmview }): void {
  if (!agentsroot) return;
  agentsroot.replaceChildren();
  const swarm = context.swarm;
  if (!swarm) {
    const empty = document.createElement("p");
    empty.textContent = "The swarm state is unknown.";
    agentsroot.append(empty);
    return;
  }
  const head = document.createElement("p");
  head.textContent = `${swarm.overview.agents} agent${swarm.overview.agents === 1 ? "" : "s"} (${swarm.overview.active} active, ${swarm.overview.paused} paused, ${swarm.overview.stopped} stopped) · ${swarm.overview.tasks} task${swarm.overview.tasks === 1 ? "" : "s"} (${swarm.overview.claimed} claimed, ${swarm.overview.queued} queued, ${swarm.overview.done} done) · ${swarm.overview.messages} message${swarm.overview.messages === 1 ? "" : "s"} with ${swarm.overview.unread} unread · queue policy ${swarm.queue.completionpolicy}${swarm.queue.complete ? " · queue complete" : ""}.`;
  agentsroot.append(head);

  const switchbox = document.createElement("div");
  switchbox.className = "actions";
  if (swarm.killswitch.engaged) {
    const state = document.createElement("span");
    state.className = "muted";
    state.textContent = `Killswitch engaged${swarm.killswitch.reason !== undefined ? `: ${swarm.killswitch.reason}` : ""}; every agent halted.`;
    switchbox.append(state, " ", button("Disarm killswitch", async () => { await request({ kind: "swarmagent", disarm: true }); status("The killswitch disarmed; the stopped agents stay stopped until resumed."); await refresh(); }));
  } else {
    switchbox.append(button("Halt every agent (killswitch)", async () => { if (window.confirm("Halt every agent of the swarm at once?")) { await request({ kind: "swarmagent", killall: true, reason: "The user halted the swarm from the panel." }); status("The killswitch engaged: every agent halted at once and the claims returned to the queue."); await refresh(); } }));
  }
  agentsroot.append(switchbox);

  const agentsbox = document.createElement("details");
  agentsbox.className = "sessiongroup";
  agentsbox.open = true;
  const agentsummary = document.createElement("summary");
  agentsummary.textContent = `Agent cards (${swarm.agents.length})`;
  agentsbox.append(agentsummary);
  for (const agent of swarm.agents) {
    const row = document.createElement("div");
    row.className = "sessionrow";
    const info = document.createElement("p");
    const budgettext = agent.budget === undefined ? "no ceiling" : [agent.budget.maxtokens !== undefined ? `${agent.usage?.tokens ?? 0}/${agent.budget.maxtokens} tokens` : "", agent.budget.maxcost !== undefined ? `${agent.usage?.cost ?? 0}/${agent.budget.maxcost} ${agent.budget.currency ?? ""}` : "", agent.budget.maxsteps !== undefined ? `${agent.usage?.steps ?? 0}/${agent.budget.maxsteps} steps` : ""].filter(part => part !== "").join(", ") || "no ceiling set";
    info.textContent = `${agent.name} · ${agent.role} · ${agent.state}${agent.tabid !== undefined ? ` · tab ${agent.tabid}` : ""}${agent.parentid !== undefined ? ` · sub of ${agent.parentid} at depth ${agent.depth}` : ""}${agent.currenttask !== undefined ? ` · working: ${agent.currenttask}` : " · idle"} · budget ${budgettext}${agent.heartbeatat !== undefined ? ` · heartbeat ${new Date(agent.heartbeatat).toLocaleTimeString()}` : ""}${agent.unread > 0 ? ` · ${agent.unread} unread` : ""}${agent.reviewstatus !== undefined ? ` · review: ${agent.reviewstatus}` : ""}${agent.handoffarrows.length > 0 ? ` · handoffs: ${agent.handoffarrows.join(", ")}` : ""}.`;
    row.append(info);
    const actions = document.createElement("div");
    actions.className = "actions";
    actions.append(button("Pause", async () => { await request({ kind: "swarmagent", agentid: agent.id, action: "pause" }); status(`Paused the agent ${agent.name}; the others keep running.`); await refresh(); }), " ", button("Resume", async () => { await request({ kind: "swarmagent", agentid: agent.id, action: "resume" }); status(`Resumed the agent ${agent.name}.`); await refresh(); }), " ", button("Stop", async () => { await request({ kind: "swarmagent", agentid: agent.id, action: "stop" }); status(`Stopped the agent ${agent.name}.`); await refresh(); }), " ", button("Claim task", async () => { await request({ kind: "swarmqueue", agentid: agent.id, claim: true }); status(`The agent ${agent.name} claimed the highest priority task; the proposal still passes the plan review.`); await refresh(); }), " ", button("Heartbeat", async () => { await request({ kind: "swarmagent", agentid: agent.id, heartbeat: true }); status(`The agent ${agent.name} refreshed its heartbeat.`); await refresh(); }));
    const budgetrow = document.createElement("div");
    budgetrow.className = "actions";
    const tokensinput = document.createElement("input");
    tokensinput.placeholder = "token ceiling";
    const costinput = document.createElement("input");
    costinput.placeholder = "cost ceiling";
    const stepsinput = document.createElement("input");
    stepsinput.placeholder = "step ceiling";
    const currencyinput = document.createElement("input");
    currencyinput.placeholder = "currency";
    budgetrow.append(tokensinput, " ", costinput, " ", currencyinput, " ", stepsinput, " ", button("Set budget", async () => { await request({ kind: "swarmagent", agentid: agent.id, budget: { ...(tokensinput.value.trim() !== "" ? { maxtokens: Number(tokensinput.value) } : {}), ...(costinput.value.trim() !== "" ? { maxcost: Number(costinput.value) } : {}), ...(stepsinput.value.trim() !== "" ? { maxsteps: Number(stepsinput.value) } : {}), ...(currencyinput.value.trim() !== "" ? { currency: currencyinput.value.trim() } : {}) } }); status(`Saved the budget of the agent ${agent.name}.`); await refresh(); }));
    row.append(actions, budgetrow);
    agentsbox.append(row);
  }
  const addrow = document.createElement("div");
  addrow.className = "actions";
  const nameinput = document.createElement("input");
  nameinput.placeholder = "new agent name";
  const roleselect = document.createElement("select");
  for (const role of ["worker", "planner", "observer", "critic", "verifier"]) { const option = document.createElement("option"); option.value = role; option.textContent = role; roleselect.append(option); }
  const customrole = document.createElement("input");
  customrole.placeholder = "custom role";
  const tabinput = document.createElement("input");
  tabinput.placeholder = "tab id";
  addrow.append(nameinput, " ", roleselect, " ", customrole, " ", tabinput, " ", button("Register agent", async () => { await request({ kind: "swarmagent", register: { name: nameinput.value, role: customrole.value.trim() !== "" ? customrole.value.trim() : roleselect.value, ...(tabinput.value.trim() !== "" ? { tabid: Number(tabinput.value) } : {}) } }); status(`Registered the agent ${nameinput.value}; one tab holds at most one agent.`); await refresh(); }));
  agentsbox.append(addrow);

  const spawnrow = document.createElement("div");
  spawnrow.className = "actions";
  const parentselect = document.createElement("select");
  for (const agent of swarm.agents) { const option = document.createElement("option"); option.value = agent.id; option.textContent = agent.name; parentselect.append(option); }
  const spawnrole = document.createElement("select");
  for (const role of ["worker", "planner", "observer", "critic", "verifier"]) { const option = document.createElement("option"); option.value = role; option.textContent = role; spawnrole.append(option); }
  const spawntask = document.createElement("input");
  spawntask.placeholder = "sub agent task";
  const spawndepth = document.createElement("input");
  spawndepth.placeholder = "depth";
  spawndepth.value = "1";
  const spawnname = document.createElement("input");
  spawnname.placeholder = "sub agent name";
  spawnrow.append(parentselect, " ", spawnrole, " ", spawntask, " ", spawndepth, " ", spawnname, " ", button("Spawn sub agent", async () => { await request({ kind: "swarmagent", spawn: { parentid: parentselect.value, role: spawnrole.value, task: spawntask.value, depth: Number(spawndepth.value || "1"), ...(spawnname.value.trim() !== "" ? { name: spawnname.value } : {}) } }); status("Spawned the sub agent; the depth history records the recursion."); await refresh(); }));
  agentsbox.append(spawnrow);
  if (swarm.spawns.length > 0) {
    const history = document.createElement("p");
    history.textContent = `Spawn history: ${swarm.spawns.slice(0, 5).map(record => `${record.parentid} → ${record.childid} (${record.role}, depth ${record.depth})`).join("; ")}.`;
    agentsbox.append(history);
  }
  agentsroot.append(agentsbox);

  const queuebox = document.createElement("details");
  queuebox.className = "sessiongroup";
  queuebox.open = true;
  const queuesummary = document.createElement("summary");
  queuesummary.textContent = `Task queue (${swarm.queue.items.length})`;
  queuebox.append(queuesummary);
  for (const lane of swarm.queue.lanesreport) {
    const row = document.createElement("p");
    const claims = swarm.queue.claims.filter(claim => swarm.queue.items.some(item => item.id === claim.taskid && item.lane === lane.lane && item.state === "claimed"));
    row.textContent = `Lane ${lane.lane}: ${lane.queued} queued · ${lane.claimed} claimed · ${lane.done} done · ${lane.cancelled} cancelled${claims.length > 0 ? ` · held by ${claims.map(claim => claim.agentid).join(", ")}` : ""}.`;
    queuebox.append(row);
  }
  const list = document.createElement("ol");
  list.className = "audit";
  for (const item of swarm.queue.items.slice(0, 12)) {
    const entry = document.createElement("li");
    entry.textContent = `${item.payload} — lane ${item.lane}, priority ${item.priority}, ${item.state}.`;
    const actions = document.createElement("div");
    actions.className = "actions";
    actions.append(button("Complete", async () => { await request({ kind: "swarmqueue", taskid: item.id, complete: true }); status("The task completed and released its claim."); await refresh(); }), " ", button("Cancel", async () => { await request({ kind: "swarmqueue", taskid: item.id, cancel: true }); status("The task left the queue."); await refresh(); }));
    entry.append(actions);
    list.append(entry);
  }
  queuebox.append(list);
  const enqueuerow = document.createElement("div");
  enqueuerow.className = "actions";
  const laneinput = document.createElement("input");
  laneinput.placeholder = "lane";
  const priorityinput = document.createElement("input");
  priorityinput.placeholder = "priority";
  const payloadinput = document.createElement("input");
  payloadinput.placeholder = "task in plain language";
  const lanesinput = document.createElement("input");
  lanesinput.placeholder = "configured lanes, comma separated";
  lanesinput.value = swarm.queue.lanes.join(", ");
  enqueuerow.append(laneinput, " ", priorityinput, " ", payloadinput, " ", button("Enqueue", async () => { await request({ kind: "swarmqueue", enqueue: { lane: laneinput.value, priority: Number(priorityinput.value || "0"), payload: payloadinput.value } }); status("The task entered the lane; nothing runs before the plan review."); await refresh(); }), " ", button("Requeue orphans", async () => { await request({ kind: "swarmqueue", requeue: true }); status("The requeue pass returned the orphaned tasks to their lanes."); await refresh(); }), " ", button("Save lanes", async () => { await request({ kind: "swarmqueue", lanes: lanesinput.value.split(",").map(lane => lane.trim()).filter(lane => lane !== "") }); status("Saved the configured lanes."); await refresh(); }));
  queuebox.append(enqueuerow);
  agentsroot.append(queuebox);

  const mailboxbox = document.createElement("details");
  mailboxbox.className = "sessiongroup";
  const mailboxsummary = document.createElement("summary");
  mailboxsummary.textContent = `Mailboxes (${swarm.mailboxes.length})`;
  mailboxbox.append(mailboxsummary);
  for (const mailbox of swarm.mailboxes) {
    if (mailbox.inbox.length === 0 && mailbox.outbox.length === 0) continue;
    const row = document.createElement("div");
    row.className = "sessionrow";
    const info = document.createElement("p");
    info.textContent = `Agent ${mailbox.agentid}: ${mailbox.inbox.length} in, ${mailbox.outbox.length} out, ${mailbox.unread} unread.`;
    row.append(info);
    const feed = document.createElement("ul");
    feed.className = "audit";
    for (const message of [...mailbox.inbox, ...mailbox.outbox].slice(0, 6)) {
      const entry = document.createElement("li");
      entry.textContent = `${message.senderid} → ${message.recipient} (${message.routing}): ${message.payload}`;
      feed.append(entry);
    }
    row.append(feed, button("Receive", async () => { await request({ kind: "swarmmailbox", agentid: mailbox.agentid, receive: true }); status(`The agent ${mailbox.agentid} drained its inbox.`); await refresh(); }));
    mailboxbox.append(row);
  }
  const composerow = document.createElement("div");
  composerow.className = "actions";
  const recipientselect = document.createElement("select");
  const broadcastoption = document.createElement("option");
  broadcastoption.value = "*";
  broadcastoption.textContent = "broadcast (every agent)";
  recipientselect.append(broadcastoption);
  for (const agent of swarm.agents) { const option = document.createElement("option"); option.value = agent.id; option.textContent = `${agent.name} (${agent.id})`; recipientselect.append(option); }
  const routingselect = document.createElement("select");
  for (const routing of ["direct", "broadcast", "role"]) { const option = document.createElement("option"); option.value = routing; option.textContent = routing; routingselect.append(option); }
  const messageinput = document.createElement("input");
  messageinput.placeholder = "message to the agents";
  composerow.append(recipientselect, " ", routingselect, " ", messageinput, " ", button("Send user message", async () => { await request({ kind: "swarmmailbox", send: { senderid: "user", recipient: recipientselect.value, routing: routingselect.value, payload: messageinput.value } }); status("The user message was delivered to the swarm."); await refresh(); }));
  mailboxbox.append(composerow);
  agentsroot.append(mailboxbox);

  const boardbox = document.createElement("details");
  boardbox.className = "sessiongroup";
  const boardsummary = document.createElement("summary");
  boardsummary.textContent = "Blackboard";
  boardbox.append(boardsummary);
  for (const section of swarm.blackboard.sections) {
    const row = document.createElement("p");
    row.textContent = `Section ${section.section}: ${section.entries} live entr${section.entries === 1 ? "y" : "ies"}${section.authors.length > 0 ? ` by ${section.authors.join(", ")}` : ""}${section.freshestat !== undefined ? ` · freshest ${new Date(section.freshestat).toLocaleTimeString()}` : ""}.`;
    boardbox.append(row);
  }
  const entries = document.createElement("ol");
  entries.className = "audit";
  for (const entry of swarm.blackboard.entries.slice(0, 12)) {
    const item = document.createElement("li");
    item.textContent = `[${entry.section}] ${entry.key} = ${entry.value} — ${entry.author}, ${entry.consentclass}, posted ${new Date(entry.postedat).toLocaleTimeString()}.`;
    const actions = document.createElement("div");
    actions.className = "actions";
    actions.append(button("Retire", async () => { await request({ kind: "swarmblackboard", retire: entry.id }); status(`Retired the entry ${entry.key}.`); await refresh(); }));
    item.append(actions);
    entries.append(item);
  }
  boardbox.append(entries);
  const postrow = document.createElement("div");
  postrow.className = "actions";
  const keyinput = document.createElement("input");
  keyinput.placeholder = "key";
  const valueinput = document.createElement("input");
  valueinput.placeholder = "value";
  const sectionselect = document.createElement("select");
  for (const section of ["goals", "facts", "findings", "scratch"]) { const option = document.createElement("option"); option.value = section; option.textContent = section; sectionselect.append(option); }
  const authorselect = document.createElement("select");
  const useroption = document.createElement("option");
  useroption.value = "user";
  useroption.textContent = "user";
  authorselect.append(useroption);
  for (const agent of swarm.agents) { const option = document.createElement("option"); option.value = agent.id; option.textContent = agent.name; authorselect.append(option); }
  postrow.append(keyinput, " ", valueinput, " ", sectionselect, " ", authorselect, " ", button("Post entry", async () => { await request({ kind: "swarmblackboard", post: { key: keyinput.value, value: valueinput.value, section: sectionselect.value, author: authorselect.value } }); status("The entry landed on the shared board; every agent reads it."); await refresh(); }), " ", button("Retirement sweep", async () => { await request({ kind: "swarmblackboard", sweep: true }); status("The retirement pass expired the stale entries."); await refresh(); }));
  boardbox.append(postrow);
  agentsroot.append(boardbox);

  const orchestrationbox = document.createElement("details");
  orchestrationbox.className = "sessiongroup";
  const orchestrationsummary = document.createElement("summary");
  orchestrationsummary.textContent = "Leader worker topology";
  orchestrationbox.append(orchestrationsummary);
  if (swarm.topology !== undefined) {
    const lead = swarm.agents.find(agent => agent.id === swarm.topology?.leaderid);
    const topinfo = document.createElement("p");
    topinfo.textContent = `Leader ${swarm.topology.leaderid}${lead !== undefined ? ` (${lead.name})` : ""} by the ${swarm.topology.rule.kind} rule · ${swarm.topology.workerids.length} workers, ${swarm.topology.criticids.length} critics, ${swarm.topology.verifierids.length} verifiers · ${swarm.topology.assignments.length} assignment${swarm.topology.assignments.length === 1 ? "" : "s"}.`;
    orchestrationbox.append(topinfo);
    const assignments = document.createElement("ul");
    assignments.className = "audit";
    for (const assignment of swarm.topology.assignments.slice(0, 8)) {
      const entry = document.createElement("li");
      entry.textContent = `${assignment.workerid} → task ${assignment.taskid}: ${assignment.slice}.`;
      assignments.append(entry);
    }
    orchestrationbox.append(assignments);
    for (const split of swarm.splits.slice(0, 4)) {
      const row = document.createElement("p");
      row.textContent = `Planner executor split: ${split.planownerid} plans, ${split.runownerid} runs${split.taskid !== undefined ? ` task ${split.taskid}` : ""} with ${split.stepreports.length} step report${split.stepreports.length === 1 ? "" : "s"} (${split.stepreports.filter(report => report.outcome === "done").length} done).`;
      orchestrationbox.append(row);
    }
  } else {
    const none = document.createElement("p");
    none.textContent = "No leader is elected yet; the user elects one by the first or named rule.";
    orchestrationbox.append(none);
  }
  const electionrow = document.createElement("div");
  electionrow.className = "actions";
  const leaderselect = document.createElement("select");
  const firstoption = document.createElement("option");
  firstoption.value = "first";
  firstoption.textContent = "first registration";
  leaderselect.append(firstoption);
  for (const agent of swarm.agents) { const option = document.createElement("option"); option.value = agent.id; option.textContent = `named: ${agent.name}`; leaderselect.append(option); }
  const splitplan = document.createElement("select");
  const splitrun = document.createElement("select");
  const splittask = document.createElement("input");
  splittask.placeholder = "task id";
  for (const agent of swarm.agents) { const plan = document.createElement("option"); plan.value = agent.id; plan.textContent = agent.name; splitplan.append(plan); const run = document.createElement("option"); run.value = agent.id; run.textContent = agent.name; splitrun.append(run); }
  electionrow.append(leaderselect, " ", button("Elect leader", async () => { await request({ kind: "swarmleader", elect: leaderselect.value === "first" ? { rule: "first" } : { rule: "named", agentid: leaderselect.value } }); status("The leader election recorded the topology; the leader only organizes reviewed work."); await refresh(); }), " ", button("Assign work", async () => { await request({ kind: "swarmleader", assign: {} }); status("The leader sliced the tasks across the workers; every slice still passes the plan review."); await refresh(); }), " ", button("Scale workers", async () => { await request({ kind: "swarmleader", scale: { pending: swarm.queue.counts.queued + swarm.queue.counts.claimed } }); status("The worker lane scaled by the load under the user configured bound."); await refresh(); }), " ", splitplan, " ", splitrun, " ", splittask, " ", button("Split plan and run", async () => { if (splitplan.value === splitrun.value) { status("The planner executor split needs two different agents."); return; } await request({ kind: "swarmleader", split: { planownerid: splitplan.value, runownerid: splitrun.value, ...(splittask.value.trim() !== "" ? { taskid: splittask.value } : {}) } }); status("The task split between the planner and the executor; the executor reports every step back."); await refresh(); }));
  orchestrationbox.append(electionrow);
  agentsroot.append(orchestrationbox);

  const boardbox2 = document.createElement("details");
  boardbox2.className = "sessiongroup";
  const board2summary = document.createElement("summary");
  board2summary.textContent = `Progressboard (${swarm.board.lanes.length} lanes)`;
  boardbox2.append(board2summary);
  for (const lane of swarm.board.lanes) {
    const row = document.createElement("p");
    row.textContent = `${lane.name} (${lane.role}, ${lane.state}) · lane ${lane.lane}${lane.currenttask !== undefined ? ` · working: ${lane.currenttask}` : ""}${lane.milestones.length > 0 ? ` · ${lane.milestones.filter(milestone => milestone.done).length}/${lane.milestones.length} milestones (${lane.milestones.map(milestone => milestone.done ? milestone.label : `${milestone.label} (open)`).join(", ")})` : ""}.`;
    boardbox2.append(row);
  }
  const milestonerow = document.createElement("div");
  milestonerow.className = "actions";
  const milestoneagent = document.createElement("select");
  for (const agent of swarm.agents) { const option = document.createElement("option"); option.value = agent.id; option.textContent = agent.name; milestoneagent.append(option); }
  const milestonelabel = document.createElement("input");
  milestonelabel.placeholder = "milestone label";
  milestonerow.append(milestoneagent, " ", milestonelabel, " ", button("Report milestone", async () => { await request({ kind: "swarmleader", milestone: { agentid: milestoneagent.value, label: milestonelabel.value, done: true } }); status("The milestone landed on the progressboard snapshot."); await refresh(); }), " ", button("Snapshot board", async () => { await request({ kind: "swarmmerge", snapshot: true }); status("The progressboard snapshot was stored under the user configured retention."); await refresh(); }));
  boardbox2.append(milestonerow);
  agentsroot.append(boardbox2);

  const reviewbox = document.createElement("details");
  reviewbox.className = "sessiongroup";
  const reviewsummary = document.createElement("summary");
  reviewsummary.textContent = `Reviews and verifications (${swarm.reviews.length} verdicts, ${swarm.verifications.length} checks)`;
  reviewbox.append(reviewsummary);
  for (const request2 of swarm.reviewrequests.slice(0, 8)) {
    const row = document.createElement("p");
    row.textContent = `Review request ${request2.subject}: ${request2.fromagentid} → ${request2.toagentid}, ${request2.state}${request2.timeoutat !== undefined ? ` · deadline ${new Date(request2.timeoutat).toLocaleTimeString()}` : ""}.`;
    const actions = document.createElement("div");
    actions.className = "actions";
    actions.append(button("Ack", async () => { await request({ kind: "swarmreview", ack: request2.id }); status("The review request was acked."); await refresh(); }));
    row.append(actions);
    reviewbox.append(row);
  }
  for (const review of swarm.reviews.slice(0, 8)) {
    const row = document.createElement("p");
    row.textContent = `Critic verdict ${review.verdict} by ${review.reviewerid} over the output of ${review.subjectagentid}${review.issues.length > 0 ? ` · issues: ${review.issues.join("; ")}` : ""}${review.requiredchanges.length > 0 ? ` · required: ${review.requiredchanges.join("; ")}` : ""}.`;
    reviewbox.append(row);
  }
  for (const check of swarm.verifications.slice(0, 8)) {
    const row = document.createElement("p");
    const badge = document.createElement("strong");
    badge.textContent = check.outcome === "pass" ? "PASS" : "FAIL";
    row.append(`Verifier ${check.verifierid} checked the claim of ${check.claimagentid} by the ${check.method} method: `, badge, ` — ${check.claim}${check.evidence !== undefined ? ` (${check.evidence})` : ""}.`);
    reviewbox.append(row);
  }
  const reviewrow = document.createElement("div");
  reviewrow.className = "actions";
  const reviewfrom = document.createElement("select");
  const reviewto = document.createElement("select");
  for (const agent of swarm.agents) { const one = document.createElement("option"); one.value = agent.id; one.textContent = agent.name; reviewfrom.append(one); const two = document.createElement("option"); two.value = agent.id; two.textContent = agent.name; reviewto.append(two); }
  const reviewsubject = document.createElement("input");
  reviewsubject.placeholder = "review subject";
  const reviewpayload = document.createElement("input");
  reviewpayload.placeholder = "output payload";
  const reviewverdict = document.createElement("select");
  for (const verdict of ["approve", "changes", "reject"]) { const option = document.createElement("option"); option.value = verdict; option.textContent = verdict; reviewverdict.append(option); }
  const reviewchanges = document.createElement("input");
  reviewchanges.placeholder = "required changes, semicolon separated";
  reviewrow.append(reviewfrom, " ", reviewto, " ", reviewsubject, " ", reviewpayload, " ", button("Request review", async () => { await request({ kind: "swarmreview", request: { fromagentid: reviewfrom.value, toagentid: reviewto.value, subject: reviewsubject.value, payload: reviewpayload.value } }); status("The review request was routed; the critic reads only."); await refresh(); }), " ", reviewverdict, " ", reviewchanges, " ", button("Apply verdict", async () => { const open = swarm.reviewrequests.find(entry => entry.state === "open" && entry.toagentid === reviewto.value); if (open === undefined) { status("No open review request for the selected reviewer; request one first."); return; } await request({ kind: "swarmreview", apply: { id: open.id, reviewerid: reviewto.value, verdict: reviewverdict.value, issues: [], requiredchanges: reviewchanges.value.split(";").map(change => change.trim()).filter(change => change !== "") } }); status("The critic verdict was applied; the rework still passes the human review."); await refresh(); }), " ", button("Sweep timeouts", async () => { await request({ kind: "swarmreview", sweep: true }); status("The review sweep timed out the unanswered requests."); await refresh(); }));
  const verifyrow = document.createElement("div");
  verifyrow.className = "actions";
  const verifierselect = document.createElement("select");
  for (const agent of swarm.agents) { const option = document.createElement("option"); option.value = agent.id; option.textContent = agent.name; verifierselect.append(option); }
  const claimagent = document.createElement("select");
  for (const agent of swarm.agents) { const option = document.createElement("option"); option.value = agent.id; option.textContent = agent.name; claimagent.append(option); }
  const claimtext = document.createElement("input");
  claimtext.placeholder = "claim to verify";
  const claimmethod = document.createElement("input");
  claimmethod.placeholder = "method";
  const claimoutcome = document.createElement("select");
  for (const outcome of ["pass", "fail"]) { const option = document.createElement("option"); option.value = outcome; option.textContent = outcome; claimoutcome.append(option); }
  verifyrow.append(verifierselect, " ", claimagent, " ", claimtext, " ", claimmethod, " ", claimoutcome, " ", button("Verify claim", async () => { await request({ kind: "swarmreview", verify: { verifierid: verifierselect.value, claimagentid: claimagent.value, claim: claimtext.value, method: claimmethod.value, outcome: claimoutcome.value } }); status(`The verifier marked the claim ${claimoutcome.value} with the method it used.`); await refresh(); }));
  reviewbox.append(reviewrow, verifyrow);
  agentsroot.append(reviewbox);

  const escalationbox = document.createElement("details");
  escalationbox.className = "sessiongroup";
  const escalationsummary = document.createElement("summary");
  escalationsummary.textContent = `Escalation inbox (${swarm.escalations.filter(escalation => escalation.state === "open").length} open)`;
  escalationbox.append(escalationsummary);
  for (const escalation of swarm.escalations.slice(0, 8)) {
    const row = document.createElement("div");
    row.className = "sessionrow";
    const info = document.createElement("p");
    info.textContent = `${escalation.state === "open" ? "AWAITS THE USER" : "decided"} · ${escalation.agentid} lifted ${escalation.subject} — ${escalation.context}${escalation.decision !== undefined ? ` · decision: ${escalation.decision}` : ""}.`;
    row.append(info);
    if (escalation.state === "open") {
      const actions = document.createElement("div");
      actions.className = "actions";
      const decision = document.createElement("input");
      decision.placeholder = "the decision the user writes";
      actions.append(decision, " ", button("Decide", async () => { await request({ kind: "swarmreview", decide: { id: escalation.id, decision: decision.value } }); status("The user decision was recorded; the agent continues from it."); await refresh(); }));
      row.append(actions);
    }
    escalationbox.append(row);
  }
  const escalaterow = document.createElement("div");
  escalaterow.className = "actions";
  const escalateagent = document.createElement("select");
  for (const agent of swarm.agents) { const option = document.createElement("option"); option.value = agent.id; option.textContent = agent.name; escalateagent.append(option); }
  const escalatesubject = document.createElement("input");
  escalatesubject.placeholder = "stalled subject";
  const escalatecontext = document.createElement("input");
  escalatecontext.placeholder = "full context for the user";
  escalaterow.append(escalateagent, " ", escalatesubject, " ", escalatecontext, " ", button("Escalate to user", async () => { await request({ kind: "swarmreview", escalate: { agentid: escalateagent.value, subject: escalatesubject.value, context: escalatecontext.value } }); status("The stalled decision was lifted to the user; the agent waits."); await refresh(); }));
  escalationbox.append(escalaterow);
  agentsroot.append(escalationbox);

  const consensusbox = document.createElement("details");
  consensusbox.className = "sessiongroup";
  const consensussummary = document.createElement("summary");
  consensussummary.textContent = `Consensus rounds (${swarm.consensus.length})`;
  consensusbox.append(consensussummary);
  for (const round of swarm.consensus.slice(0, 6)) {
    const yes = round.votes.filter(vote => vote.vote === "yes").length;
    const no = round.votes.filter(vote => vote.vote === "no").length;
    const abstain = round.votes.filter(vote => vote.vote === "abstain").length;
    const row = document.createElement("p");
    row.textContent = `${round.subject}: ${round.state} · ${yes} yes, ${no} no, ${abstain} abstain against the quorum ${round.quorum}${round.votes.length > 0 ? ` · voted by ${round.votes.map(vote => vote.agentid).join(", ")}` : ""}.`;
    const actions = document.createElement("div");
    actions.className = "actions";
    const voterselect = document.createElement("select");
    for (const agent of swarm.agents) { const option = document.createElement("option"); option.value = agent.id; option.textContent = agent.name; voterselect.append(option); }
    const voteselect = document.createElement("select");
    for (const vote of ["yes", "no", "abstain"]) { const option = document.createElement("option"); option.value = vote; option.textContent = vote; voteselect.append(option); }
    actions.append(voterselect, " ", voteselect, " ", button("Vote", async () => { await request({ kind: "swarmreview", vote: { id: round.id, agentid: voterselect.value, vote: voteselect.value } }); status(`The vote landed on the round ${round.subject}.`); await refresh(); }));
    row.append(actions);
    consensusbox.append(row);
  }
  const consensusrow = document.createElement("div");
  consensusrow.className = "actions";
  const subjectinput2 = document.createElement("input");
  subjectinput2.placeholder = "consensus subject";
  const quoruminput = document.createElement("input");
  quoruminput.placeholder = "quorum";
  consensusrow.append(subjectinput2, " ", quoruminput, " ", button("Open round", async () => { await request({ kind: "swarmreview", consensus: { subject: subjectinput2.value, ...(quoruminput.value.trim() !== "" ? { quorum: Number(quoruminput.value) } : {}) } }); status("The consensus round opened with the user configured quorum."); await refresh(); }));
  consensusbox.append(consensusrow);
  agentsroot.append(consensusbox);

  const handoffbox = document.createElement("details");
  handoffbox.className = "sessiongroup";
  const handoffsummary = document.createElement("summary");
  handoffsummary.textContent = `Handoffs and locks (${swarm.handoffs.length} handoffs, ${swarm.locks.length} locks)`;
  handoffbox.append(handoffsummary);
  for (const record of swarm.handoffs.slice(0, 8)) {
    const row = document.createElement("p");
    row.textContent = `${record.fromagentid} → ${record.toagentid}${record.tabid !== undefined ? ` · tab ${record.tabid}` : ""} · ${record.state} · packaged state: ${record.taskstate}.`;
    const actions = document.createElement("div");
    actions.className = "actions";
    if (record.state === "prepared") actions.append(button("Transfer", async () => { await request({ kind: "swarmhandoff", transfer: record.id }); status("The tab moved between the agents under the one agent per tab rule."); await refresh(); }), " ");
    if (record.state === "transferred") actions.append(button("Resume", async () => { await request({ kind: "swarmhandoff", resume: record.id }); status("The receiving agent resumed the task from the packaged state."); await refresh(); }));
    row.append(actions);
    handoffbox.append(row);
  }
  const handoffrow = document.createElement("div");
  handoffrow.className = "actions";
  const handofffrom = document.createElement("select");
  const handoffto = document.createElement("select");
  for (const agent of swarm.agents) { const one = document.createElement("option"); one.value = agent.id; one.textContent = agent.name; handofffrom.append(one); const two = document.createElement("option"); two.value = agent.id; two.textContent = agent.name; handoffto.append(two); }
  const handoffstate = document.createElement("input");
  handoffstate.placeholder = "packaged task state";
  handoffrow.append(handofffrom, " ", handoffto, " ", handoffstate, " ", button("Prepare handoff", async () => { await request({ kind: "swarmhandoff", prepare: { fromagentid: handofffrom.value, toagentid: handoffto.value, taskstate: handoffstate.value } }); status("The handoff was prepared with the packaged task state."); await refresh(); }));
  handoffbox.append(handoffrow);
  for (const lock of swarm.locks.slice(0, 8)) {
    const row = document.createElement("p");
    row.textContent = `Lock ${lock.key} · ${lock.kind} · holder ${lock.holder} · acquired ${new Date(lock.acquiredat).toLocaleTimeString()}${lock.expiresat !== undefined ? ` · expires in ${Math.max(Math.round((lock.expiresat - Date.now()) / 1000), 0)}s` : " · no expiry"}.`;
    const actions = document.createElement("div");
    actions.className = "actions";
    actions.append(button("Release", async () => { await request({ kind: "swarmlocks", release: { key: lock.key, holder: lock.holder } }); status("The lock released and the resource returned to the pool."); await refresh(); }));
    row.append(actions);
    handoffbox.append(row);
  }
  const lockrow = document.createElement("div");
  lockrow.className = "actions";
  const lockholder = document.createElement("select");
  for (const agent of swarm.agents) { const option = document.createElement("option"); option.value = agent.id; option.textContent = agent.name; lockholder.append(option); }
  const lockorigin = document.createElement("input");
  lockorigin.placeholder = "origin";
  const lockselector = document.createElement("input");
  lockselector.placeholder = "selector";
  const lockkindselect = document.createElement("select");
  for (const kind of ["exclusive", "shared"]) { const option = document.createElement("option"); option.value = kind; option.textContent = kind; lockkindselect.append(option); }
  lockrow.append(lockholder, " ", lockorigin, " ", lockselector, " ", lockkindselect, " ", button("Acquire lock", async () => { await request({ kind: "swarmlocks", acquire: { holder: lockholder.value, origin: lockorigin.value, selector: lockselector.value, kind: lockkindselect.value } }); status("The lock went to the holder; it serializes reviewed work only."); await refresh(); }), " ", button("Sweep expired", async () => { await request({ kind: "swarmlocks", sweep: true }); status("The expiry sweep returned the abandoned locks to the pool."); await refresh(); }));
  handoffbox.append(lockrow);
  agentsroot.append(handoffbox);

  const conflictbox = document.createElement("details");
  conflictbox.className = "sessiongroup";
  const conflictsummary = document.createElement("summary");
  conflictsummary.textContent = `Conflicts and merges (${swarm.conflicts.length} scans)`;
  conflictbox.append(conflictsummary);
  for (const scan of swarm.conflicts.slice(0, 6)) {
    const row = document.createElement("p");
    row.textContent = scan.clean ? `Scan of ${scan.writers.length} writers: clean, no overlapping write.` : `Scan of ${scan.writers.length} writers: ${scan.overlaps.map(overlap => `${overlap.origin}|${overlap.selector} by ${overlap.writers.join(", ")}`).join("; ")} — suggested order ${scan.suggestedorder.join(" → ")}.`;
    conflictbox.append(row);
  }
  const conflictrow = document.createElement("div");
  conflictrow.className = "actions";
  const scanorigin = document.createElement("input");
  scanorigin.placeholder = "origin";
  const scanselector = document.createElement("input");
  scanselector.placeholder = "selector";
  const scanagents = document.createElement("input");
  scanagents.placeholder = "writer agent ids, comma separated";
  conflictrow.append(scanorigin, " ", scanselector, " ", scanagents, " ", button("Scan conflicts", async () => { const writers = scanagents.value.split(",").map(id => id.trim()).filter(id => id !== "").map(id => ({ agentid: id, origin: scanorigin.value, selector: scanselector.value })); await request({ kind: "swarmlocks", scan: { writers } }); status("The conflict scan checked the overlapping writes before the parallel runs."); await refresh(); }));
  conflictbox.append(conflictrow);
  if (swarm.report !== undefined) {
    const reportinfo = document.createElement("p");
    reportinfo.textContent = `Merged report ${swarm.report.title}: ${swarm.report.sections.length} section${swarm.report.sections.length === 1 ? "" : "s"} from ${swarm.report.sources.join(", ")}${swarm.report.confidence !== undefined ? ` · confidence: ${swarm.report.confidence}` : ""}.`;
    conflictbox.append(reportinfo);
    const reportlist = document.createElement("ol");
    reportlist.className = "audit";
    for (const section of swarm.report.sections.slice(0, 3)) {
      const item = document.createElement("li");
      item.textContent = `${section.title}: ${section.entries.slice(0, 5).map(entry => `${entry.key} = ${entry.value} (${entry.agentid}${entry.conflict !== undefined ? `; ${entry.conflict}` : ""})`).join("; ")}.`;
      reportlist.append(item);
    }
    conflictbox.append(reportlist);
    const exportrow = document.createElement("div");
    exportrow.className = "actions";
    exportrow.append(button("Export report", async () => { await request({ kind: "swarmmerge", export: { carriespagecontent: true } }); status("The merged report was exported; the page content it carries grades as a data egress event."); await refresh(); }));
    conflictbox.append(exportrow);
  }
  const mergerow = document.createElement("div");
  mergerow.className = "actions";
  const reporttitle = document.createElement("input");
  reporttitle.placeholder = "report title";
  const mergeruleselect = document.createElement("select");
  for (const rule of ["first", "last", "preferagent", "fail"]) { const option = document.createElement("option"); option.value = rule; option.textContent = rule; mergeruleselect.append(option); }
  const mergeoutputs = document.createElement("input");
  mergeoutputs.placeholder = "agent:task:key:value triples, semicolon separated";
  mergerow.append(reporttitle, " ", mergeruleselect, " ", mergeoutputs, " ", button("Build report", async () => { const entries = mergeoutputs.value.split(";").map(triple => triple.split(":")).filter(parts => parts.length === 4).map(parts => ({ agentid: parts[0]?.trim() ?? "", taskid: parts[1]?.trim(), key: parts[2]?.trim() ?? "", value: parts[3]?.trim() ?? "" })); await request({ kind: "swarmmerge", entries, report: { title: reporttitle.value, rule: mergeruleselect.value } }); status("The parallel outputs folded into one report with their provenance."); await refresh(); }));
  conflictbox.append(mergerow);
  const comparerow = document.createElement("div");
  comparerow.className = "actions";
  const comparesubject = document.createElement("input");
  comparesubject.placeholder = "compare subject";
  const comparefirst = document.createElement("select");
  const comparesecond = document.createElement("select");
  for (const agent of swarm.agents) { const one = document.createElement("option"); one.value = agent.id; one.textContent = agent.name; comparefirst.append(one); const two = document.createElement("option"); two.value = agent.id; two.textContent = agent.name; comparesecond.append(two); }
  const comparevalue = document.createElement("input");
  comparevalue.placeholder = "output of the first agent";
  const comparevalue2 = document.createElement("input");
  comparevalue2.placeholder = "output of the second agent";
  comparerow.append(comparesubject, " ", comparefirst, " ", comparevalue, " ", comparesecond, " ", comparevalue2, " ", button("Compare outputs", async () => { await request({ kind: "swarmmerge", compare: { subject: comparesubject.value, outputs: [{ agentid: comparefirst.value, value: comparevalue.value }, { agentid: comparesecond.value, value: comparevalue2.value }] } }); status("The competing outputs were contrasted for the user."); await refresh(); }));
  conflictbox.append(comparerow);
  const lessonrow = document.createElement("div");
  lessonrow.className = "actions";
  const lessonagent = document.createElement("select");
  for (const agent of swarm.agents) { const option = document.createElement("option"); option.value = agent.id; option.textContent = agent.name; lessonagent.append(option); }
  const lessonstatement = document.createElement("input");
  lessonstatement.placeholder = "verified lesson";
  const lessonverifier = document.createElement("input");
  lessonverifier.placeholder = "verified by";
  lessonrow.append(lessonagent, " ", lessonstatement, " ", lessonverifier, " ", button("Share lesson", async () => { await request({ kind: "swarmmerge", lesson: { agentid: lessonagent.value, statement: lessonstatement.value, verifiedby: lessonverifier.value } }); status("The verified lesson landed on the findings section for every agent."); await refresh(); }), " ", button("Recompute costs", async () => { await request({ kind: "swarmmerge", costs: true }); status("The shared cost accounting summed the per agent usage into the swarm totals."); await refresh(); }));
  conflictbox.append(lessonrow);
  agentsroot.append(conflictbox);

  const timelinebox = document.createElement("details");
  timelinebox.className = "sessiongroup";
  const timelinesummary = document.createElement("summary");
  timelinesummary.textContent = `Swarm timeline and costs (${swarm.timeline.length} actions)`;
  timelinebox.append(timelinesummary);
  const feed2 = document.createElement("ul");
  feed2.className = "audit";
  for (const action of swarm.timeline.slice(-12).reverse()) {
    const entry = document.createElement("li");
    entry.textContent = `${new Date(action.at).toLocaleTimeString()} ${action.kind}${action.agentid !== undefined ? ` (${action.agentid})` : ""}: ${action.summary}`;
    feed2.append(entry);
  }
  timelinebox.append(feed2);
  const replayrow = document.createElement("div");
  replayrow.className = "actions";
  const replayselect = document.createElement("select");
  for (const agent of swarm.agents) { const option = document.createElement("option"); option.value = agent.id; option.textContent = agent.name; replayselect.append(option); }
  replayrow.append(replayselect, " ", button("Replay agent run", async () => { const replayed = await request({ kind: "swarmmerge", replay: replayselect.value }) as { replay?: Array<{ kind: string; summary: string; at: number }> }; status(replayed.replay !== undefined && replayed.replay.length > 0 ? `The replay rebuilt ${replayed.replay.length} recorded actions of the agent.` : "The audit trail holds no recorded action of that agent yet."); await refresh(); }));
  timelinebox.append(replayrow);
  const latestcost = swarm.costs[0];
  if (latestcost !== undefined) {
    const costinfo = document.createElement("p");
    costinfo.textContent = `Shared costs of ${latestcost.agents} agent${latestcost.agents === 1 ? "" : "s"}: ${latestcost.tokens} tokens · ${latestcost.cost} ${latestcost.currency ?? ""} · ${latestcost.steps} steps.`;
    timelinebox.append(costinfo);
  }
  agentsroot.append(timelinebox);

  if (swarm.events.length > 0) {
    const eventbox = document.createElement("details");
    eventbox.className = "sessiongroup";
    const eventsummary = document.createElement("summary");
    eventsummary.textContent = `Lifecycle events (${swarm.events.length})`;
    eventbox.append(eventsummary);
    const feed = document.createElement("ul");
    feed.className = "audit";
    for (const event of swarm.events.slice(0, 10)) {
      const entry = document.createElement("li");
      entry.textContent = `${event.kind}: ${event.summary}`;
      feed.append(entry);
    }
    eventbox.append(feed);
    agentsroot.append(eventbox);
  }
}


/** Hosts the sandbox frame of the 1.1.60 family while the panel stays open: the background posts untrusted markup renders that already stripped their scripts and handlers, the hidden iframe loads the sandboxed page with no extension privileges and the render result posts back through its per render nonce without ever reentering the dom outside the frame. */
{
  let sandboxframe: HTMLIFrameElement | undefined;
  chrome.runtime.onMessage.addListener((message: { kind?: string; action?: string; render?: { nonce?: string; markup?: string } }, _sender, sendresponse) => {
    if (!message || message.kind !== "environments" || message.action !== "sandboxhost" || !message.render?.nonce) return false;
    try {
      if (!sandboxframe) {
        sandboxframe = document.createElement("iframe");
        sandboxframe.src = chrome.runtime.getURL("sandbox.html");
        sandboxframe.style.display = "none";
        sandboxframe.setAttribute("aria-hidden", "true");
        document.body.append(sandboxframe);
      }
      sandboxframe.contentWindow?.postMessage({ channel: "devthinksandbox", type: "render", nonce: message.render.nonce, markup: message.render.markup ?? "" }, "*");
      const waitfor = (event: MessageEvent) => {
        const data = event.data as { channel?: string; type?: string; nonce?: string; ok?: boolean; text?: string; summary?: string };
        if (data?.channel !== "devthinksandbox" || data.type !== "renderresult" || data.nonce !== message.render?.nonce) return;
        window.removeEventListener("message", waitfor);
        sendresponse({ ok: data.ok !== false, text: data.text ?? "", summary: data.summary ?? "The sandbox frame returned its render result." });
      };
      window.addEventListener("message", waitfor);
      return true;
    } catch {
      sendresponse({ ok: false, text: "", summary: "The sandbox host could not open the sandboxed page." });
      return true;
    }
  });
}

/** The session interface view of the 1.1.63 family the context report serves: the sessiongrid rows, the site notes, the scratchpad of the running task, the run summaries, the correction and consent memory, the ranked semanticrecall preview, the error surfaces with their retry hints, the empty state guidance and the user preferences. */
type sessioninterfaceview = {
  grid: Array<{ sessionid: string; runid: string; origins: string[]; state: string; outcome: string; steps: number; completed: number; lock: string; tabid?: number; sealhash?: string; updatedat: number; actions: string[] }>;
  notes: Array<{ id: string; origin: string; title: string; body: string; author: string; sensitive: boolean; updatedat: number }>;
  scratchpad: Array<{ id: string; taskid: string; text: string; stepid?: string; author: string; at: number }>;
  summaries: Array<{ runid: string; origins: string[]; kinds: string[]; steps: number; provenance: string; distilledat: number }>;
  corrections: Array<{ id: string; origin: string; kind: string; stepid: string; source: string; reason: string; at: number }>;
  consentmemory: Array<{ id: string; origin: string; decision: string; boundary: string; kinds: string[]; at: number; expiresat?: number }>;
  recall: Array<{ origin: string; runid: string; stepid: string; score: number; reason: string }>;
  errors: Array<{ stepid: string; runid: string; cause: string; message: string; retry: { allowed: boolean; reason: string }; at: number }>;
  emptystates: Array<{ surface: string; message: string }>;
  cancelrollback?: "queued" | "none";
  historyindex: boolean;
};

/** The last history search answer rendered by the history search box of the session interface. */
const historystate: { hits: Array<{ source: string; id: string; title: string; excerpt: string; highlights: string[]; origin?: string; outcome?: string; at: number }>; query: string } = { hits: [], query: "" };

/** Renders the session grid of the 1.1.63 family: every live and saved run as one filterable grid row with its origin set, step count, state, outcome, per tab lock state, seal hash link and the resume, cancelrun and reopen actions the row offers. */
function rendersessiongrid(view: sessioninterfaceview): void {
  const root = document.querySelector<HTMLElement>("#sessiongrid");
  if (!root) return;
  root.replaceChildren();
  const empty = view.emptystates.find(state => state.surface === "sessiongrid");
  if (view.grid.length === 0) { root.append(line(empty?.message ?? "No session exists yet; start the first run by describing an objective and reviewing the plan the agent proposes.")); return; }
  for (const row of view.grid) {
    const item = document.createElement("div");
    item.className = "row";
    const summary = document.createElement("p");
    summary.textContent = `${row.state} run ${row.runid} — ${row.origins.join(", ")} — ${row.outcome} — ${row.completed}/${row.steps} steps — lock ${row.lock}${row.sealhash !== undefined ? ` — sealed ${row.sealhash.slice(0, 12)}` : ""}`;
    item.append(summary);
    if (row.actions.includes("cancelrun")) item.append(button("Cancel run", async () => { await request({ kind: "sessions", cancel: { runid: row.runid, ...(view.cancelrollback !== undefined ? { rollback: view.cancelrollback } : {}) } }); status(`The run ${row.runid} cancelled with its queued rollback.`); await refresh(); }));
    if (row.actions.includes("resume")) item.append(" ", button("Resume", async () => { await request({ kind: "sessions", grid: { resume: { runid: row.runid } } }); status(`The session of the run ${row.runid} resumed.`); await refresh(); }));
    if (row.actions.includes("reopen")) item.append(" ", button("Reopen sealed run", async () => { const result = await request({ kind: "sessions", grid: { reopen: { runid: row.runid } } }) as { entries: number }; status(`The sealed run ${row.runid} reopened with ${result.entries} verified log entries.`); }));
    item.append(" ", button("Open in sidepanel", async () => { await request({ kind: "sessions", grid: { open: { runid: row.runid } } }); }));
    root.append(item);
  }
}

/** Renders the history search box of the 1.1.63 family: sessions, site notes and run summaries searched from one box with the origin, time range and outcome filters and the matched terms highlighted. */
function renderhistorysearch(view: sessioninterfaceview): void {
  const root = document.querySelector<HTMLElement>("#historysearch");
  if (!root) return;
  root.replaceChildren();
  if (!view.historyindex) { root.append(line("The historysearch index building stays off in the options; turn it on to search sessions, notes and summaries.")); return; }
  const input = document.createElement("input");
  input.placeholder = "Search sessions, notes and run summaries";
  input.value = historystate.query;
  input.addEventListener("keydown", event => {
    if (event.key !== "Enter") return;
    void (async () => {
      const answer = await request({ kind: "sessions", search: { query: { text: input.value } } }) as { hits: Array<{ source: string; id: string; title: string; excerpt: string; highlights: string[]; origin?: string; outcome?: string; at: number }> };
      historystate.hits = answer.hits;
      historystate.query = input.value;
      renderhistorysearch(view);
    })();
  });
  root.append(input, " ", button("Search", async () => {
    const answer = await request({ kind: "sessions", search: { query: { text: input.value } } }) as { hits: Array<{ source: string; id: string; title: string; excerpt: string; highlights: string[]; origin?: string; outcome?: string; at: number }> };
    historystate.hits = answer.hits;
    historystate.query = input.value;
    renderhistorysearch(view);
  }));
  if (historystate.hits.length === 0) { root.append(line(view.emptystates.find(state => state.surface === "historysearch")?.message ?? "No history matches yet; start with a first query such as an origin, a note title or a kind the runs executed.")); return; }
  for (const hit of historystate.hits) {
    const item = document.createElement("div");
    item.className = "row";
    const text = document.createElement("p");
    text.textContent = `${hit.source}: ${hit.title} — ${hit.excerpt}${hit.highlights.length > 0 ? ` [matched: ${hit.highlights.join(", ")}]` : ""}`;
    item.append(text);
    item.append(button("Open sealed run", async () => { await request({ kind: "sessions", grid: { open: { runid: hit.source === "summary" ? hit.id : hit.id } } }); status(`The history hit ${hit.id} links to its sealed run view.`); }));
    root.append(item);
  }
}

/** Renders the site notes editor of the 1.1.63 family: one inline editor per origin with its title, body, sensitive sealing and author provenance. */
function rendersitenotes(view: sessioninterfaceview): void {
  const root = document.querySelector<HTMLElement>("#sitenotes");
  if (!root) return;
  root.replaceChildren();
  if (view.notes.length === 0) root.append(line(view.emptystates.find(state => state.surface === "sitenotes")?.message ?? "No site note exists yet; write the first note with a title and a body and the note flow keeps it per origin with its author provenance."));
  for (const note of view.notes) {
    const item = document.createElement("div");
    item.className = "row";
    const text = document.createElement("p");
    text.textContent = `${note.origin}: ${note.title} — ${note.body}${note.sensitive ? " (sensitive: the body stays sealed at rest)" : ""} — by ${note.author} at ${new Date(note.updatedat).toLocaleString()}`;
    item.append(text);
    item.append(button("Edit note", async () => {
      const title = window.prompt("Note title", note.title);
      if (title === null) return;
      const body = window.prompt("Note body", note.body);
      if (body === null) return;
      await request({ kind: "sessions", note: { edit: { id: note.id, title, body } } });
      status("The site note edit landed with its author provenance.");
      await refresh();
    }), " ", button("Remove note", async () => { await request({ kind: "sessions", note: { remove: { id: note.id } } }); status("The site note removed."); await refresh(); }));
    root.append(item);
  }
  const title = document.createElement("input");
  title.placeholder = "note title";
  const body = document.createElement("input");
  body.placeholder = "note body";
  const sensitive = document.createElement("input");
  sensitive.type = "checkbox";
  const senslabel = document.createElement("label");
  senslabel.append(sensitive, " sensitive (seals the body at rest)");
  root.append(document.createElement("hr"), title, " ", body, " ", senslabel, " ", button("Write note", async () => {
    await request({ kind: "sessions", note: { add: { title: title.value, body: body.value, consent: true, ...(sensitive.checked ? { sensitive: true } : {}) } } });
    status("The site note landed per origin behind the explicit consent of the write.");
    await refresh();
  }));
}

/** Renders the scratchpad of the running task with its live appends: every entry carries its step provenance and its timestamp. */
function renderscratchpad(view: sessioninterfaceview): void {
  const root = document.querySelector<HTMLElement>("#scratchpad");
  if (!root) return;
  root.replaceChildren();
  if (view.scratchpad.length === 0) root.append(line(view.emptystates.find(state => state.surface === "scratchpad")?.message ?? "The scratchpad holds no entry yet; the agent appends its per task notes here while the reviewed steps run, and every entry carries its step provenance."));
  for (const entry of view.scratchpad) {
    const item = document.createElement("p");
    item.textContent = `${new Date(entry.at).toLocaleTimeString()} ${entry.author}${entry.stepid !== undefined ? ` beside ${entry.stepid}` : ""}: ${entry.text}`;
    root.append(item);
  }
  const text = document.createElement("input");
  text.placeholder = "append one scratchpad entry";
  root.append(document.createElement("hr"), text, " ", button("Append", async () => { await request({ kind: "sessions", scratch: { append: { text: text.value } } }); status("The scratchpad entry appended; the pad stays append only."); await refresh(); }));
}

/** Renders the session memory of the 1.1.63 family: the run summary of the completed run, the ranked semanticrecall results while planning, the past corrections beside matching steps, the consentmemory decisions, the error surfaces with their retry actions and the cancelrun preference. */
function rendersessionmemory(view: sessioninterfaceview): void {
  const root = document.querySelector<HTMLElement>("#sessionmemory");
  if (!root) return;
  root.replaceChildren();
  const summaryhead = document.createElement("h3");
  summaryhead.textContent = "Run summaries";
  root.append(summaryhead);
  if (view.summaries.length === 0) root.append(line("No run summary exists yet; the executor distills one at run completion as an offscreen worker task."));
  for (const summary of view.summaries) {
    root.append(line(`${summary.runid} — ${summary.origins.join(", ")} — ${summary.kinds.length} kind${summary.kinds.length === 1 ? "" : "s"} — ${summary.steps} step outcome${summary.steps === 1 ? "" : "s"} — distilled ${summary.provenance === "offscreenworker" ? "inside the offscreen worker pool" : "inline beside the page"} at ${new Date(summary.distilledat).toLocaleString()}`));
  }
  const recallhead = document.createElement("h3");
  recallhead.textContent = "Semantic recall";
  root.append(recallhead);
  if (view.recall.length === 0) root.append(line("No past extraction matches the current objective inside the run scope yet."));
  for (const match of view.recall) root.append(line(`${match.origin} run ${match.runid} step ${match.stepid} — score ${match.score.toFixed(3)} — ${match.reason}`));
  const recallquery = document.createElement("input");
  recallquery.placeholder = "recall past extractions while planning";
  root.append(recallquery, " ", button("Recall", async () => {
    const answer = await request({ kind: "sessions", recall: { query: { text: recallquery.value } } }) as { matches: Array<{ entry: { origin: string; runid: string; stepid: string }; score: number; reason: string }> };
    status(answer.matches.length > 0 ? answer.matches.map(match => `${match.entry.origin} ${match.entry.stepid} ${match.score.toFixed(3)}`).join(" · ") : "No past extraction matches the query inside the run scope.");
  }));
  const correctionshead = document.createElement("h3");
  correctionshead.textContent = "Correction memory";
  root.append(correctionshead);
  if (view.corrections.length === 0) root.append(line("No correction exists yet; plan review edits and rejections land here per origin and kind."));
  for (const correction of view.corrections) root.append(line(`${correction.source} ${correction.kind} step ${correction.stepid} of ${correction.origin}: ${correction.reason}`));
  const consenthead = document.createElement("h3");
  consenthead.textContent = "Consent memory";
  root.append(consenthead);
  if (view.consentmemory.length === 0) root.append(line("No consent decision exists yet; every grant, denial, expiry and revocation lands here per origin and stays advisory."));
  for (const entry of view.consentmemory) root.append(line(`${entry.origin} ${entry.decision} ${entry.kinds.join(", ")} — boundary ${entry.boundary} — ${new Date(entry.at).toLocaleString()}${entry.expiresat !== undefined ? ` — expires ${new Date(entry.expiresat).toLocaleString()}` : ""}`));
  const errorshead = document.createElement("h3");
  errorshead.textContent = "Error surfaces";
  root.append(errorshead);
  if (view.errors.length === 0) root.append(line("No failed step recorded an error surface yet."));
  for (const surface of view.errors) {
    const item = document.createElement("div");
    item.className = "row";
    item.append(line(`${surface.cause} failure of step ${surface.stepid} of run ${surface.runid}: ${surface.message} — retry ${surface.retry.allowed ? "allowed" : "refused"}: ${surface.retry.reason}`));
    if (surface.retry.allowed) item.append(button("Retry reviewed step", async () => { const output = await request({ kind: "sessions", retry: { stepid: surface.stepid } }) as { summary: string }; status(output.summary); await refresh(); }));
    root.append(item);
  }
}

/** Renders the whole session interface of the 1.1.63 family from the context report: the session grid, the history search box, the site notes, the scratchpad and the session memory. */
function rendersessioninterface(context: { sessionview?: sessioninterfaceview }): void {
  const view = context.sessionview;
  if (!view) return;
  rendersessiongrid(view);
  renderhistorysearch(view);
  rendersitenotes(view);
  renderscratchpad(view);
  rendersessionmemory(view);
}

/** Workspace surface of the 1.1.64 family: the sidepanel becomes the workspace with plan, run and review tabs, hosts the taskinput box at the top of the plan tab and renders the plancards, the stepstimeline and the live logstream of the review tab. */
const tasksubmitbutton = document.querySelector<HTMLButtonElement>("#tasksubmit");
const plancardsroot = document.querySelector<HTMLElement>("#plancards");
const stepstimelineroot = document.querySelector<HTMLElement>("#stepstimeline");
const logstreamroot = document.querySelector<HTMLElement>("#logstream");
let logstreampaused = false;
let logstreamfilter: { level?: string; origin?: string; stepid?: string } = {};

/** The fixed keyboard focus order of the review dialog of the 2.0.2 final polish (roadmap rc.2 item 34): the focusorderof helper computes the ordered tabindex sequence the plancard controls carry — the step summary reads first, then the approve, revise and reject controls — and the dialog moves focus to the first control when it opens. */
const reviewfocus = focusorderof();
let reviewdialogopens = false;

/** Assigns every workspace section to its tab: the plan tab keeps the task input, the current plan, the map and the detected shapes, the run tab keeps every live execution view and the review tab keeps the plancards, the timeline, the logstream and the audit memories; opening the review tab opens the review dialog, so the fixed focus order moves the keyboard to its first control. */
function applyworkspacetabs(active: "plan" | "run" | "review" | "data"): void {
  const plantitles = ["Current plan", "Clickable map", "Detected shapes", "Derived selectors", "Structured diagnostics"];
  const reviewtitles = ["Plan cards", "Steps timeline", "Log stream", "Local audit", "Session grid", "History search", "Site notes", "Scratchpad", "Session memory", "Security", "Console diff", "Datasets", "Consent banners", "Accessibility tree", "Reader view", "Snapshot diffs", "Agent protocol", "Models"];
  const datatitles = ["Data grid", "Compare viewer", "Shot panel", "Picker overlay"];
  for (const section of Array.from(document.querySelectorAll<HTMLElement>("main > section"))) {
    const title = section.querySelector("h2")?.textContent?.trim() ?? "";
    const tab = plantitles.includes(title) ? "plan" : reviewtitles.includes(title) ? "review" : datatitles.includes(title) ? "data" : "run";
    section.hidden = tab !== active;
  }
  for (const tab of ["plan", "run", "review", "data"] as const) {
    const element = document.querySelector<HTMLButtonElement>(`#tab${tab}`);
    if (element) element.className = tab === active ? "" : "secondary";
  }
  if (active === "review") { reviewdialogopens = true; focusreviewdialog(); }
}
for (const tab of ["plan", "run", "review", "data"] as const) {
  document.querySelector<HTMLButtonElement>(`#tab${tab}`)?.addEventListener("click", () => applyworkspacetabs(tab));
}
applyworkspacetabs("plan");

/** Submits the taskinput goal of the plan tab through the same proposal flow as the api with the active origin and page outline attached. */
tasksubmitbutton?.addEventListener("click", () => {
  const text = objective?.value ?? "";
  if (text.trim() === "") { status("Describe the goal first; the proposal flow needs its natural language task.", true); return; }
  void (async () => {
    status("The taskinput goal routes through the proposal flow; the plan generates.");
    const result = await request({ kind: "surface", task: { submit: { text, surface: "sidepanel" } } }) as { plan?: { id: string } };
    status(`The taskinput goal became the plan ${result.plan?.id ?? ""}; review its plancards below.`);
    await refresh();
    await rendersurfacereview();
  })().catch(error => status(error instanceof Error ? error.message : String(error), true));
});

/** Renders the plancard groups of the pending or approved plan: one card per step with its kind, risk class, environment and options, the matching corrections beside it and the approve, reject and edit actions of one distinct human action each — every card control carries its ordered tabindex value from the fixed review dialog focus order, and a render that lands while the review dialog just opened moves focus to the first control. */
async function renderplancards(): Promise<void> {
  if (!plancardsroot) return;
  try {
    const result = await request({ kind: "surface", review: { groups: true } }) as { cards: Array<{ stepid: string; kind: string; risk: string; environment: string; options: string; summary: string; corrections: Array<{ id: string; source: string; reason: string }>; editable: boolean }>; groups: Array<{ risk: string; cards: Array<{ stepid: string; kind: string; risk: string; environment: string; options: string; summary: string; corrections: Array<{ id: string; source: string; reason: string }>; editable: boolean }>; expanded: boolean }> };
    plancardsroot.replaceChildren();
    if (result.cards.length === 0) { plancardsroot.textContent = "No plan exists yet; submit a task goal and the proposed steps render their cards here."; return; }
    const tabindexof = (control: string): number => reviewfocus.order.find(entry => entry.control === control)?.tabindex ?? 0;
    for (const group of result.groups) {
      const heading = document.createElement("h3");
      heading.textContent = `${group.risk} steps${group.expanded ? " (expanded)" : ""}`;
      plancardsroot.append(heading);
      for (const card of group.cards) {
        const item = document.createElement("div");
        item.className = "panel";
        const label = document.createElement("strong");
        label.textContent = `${card.stepid} · ${card.kind} · ${card.environment}`;
        const summary = document.createElement("p");
        summary.textContent = card.summary;
        summary.tabIndex = tabindexof("readsummary");
        summary.dataset.focusorder = "readsummary";
        summary.setAttribute("aria-label", `Step summary of ${card.stepid}: ${card.summary}`);
        const options = document.createElement("p");
        options.className = "muted";
        options.textContent = card.options === "" ? "No reviewed options." : `Options: ${card.options}`;
        item.append(label, summary, options);
        for (const correction of card.corrections) item.append(Object.assign(document.createElement("p"), { className: "muted", textContent: `Correction memory (${correction.source}): ${correction.reason}` }));
        if (card.editable) {
          const approvebutton = button("Approve step", () => resolveStep(card.stepid, "approve"));
          approvebutton.tabIndex = tabindexof("approve");
          approvebutton.dataset.focusorder = "approve";
          item.append(approvebutton);
          const rejectbutton = button("Reject step", () => resolveStep(card.stepid, "reject"));
          rejectbutton.tabIndex = tabindexof("reject");
          rejectbutton.dataset.focusorder = "reject";
          item.append(" ", rejectbutton);
          const revisebutton = button("Edit step", () => editStep(card.stepid));
          revisebutton.tabIndex = tabindexof("revise");
          revisebutton.dataset.focusorder = "revise";
          item.append(" ", revisebutton);
        }
        if (card.risk === "sensitive") item.append(" ", button("Diff preview", () => diffPreview(card.stepid)));
        plancardsroot.append(item);
      }
    }
    if (reviewdialogopens) { reviewdialogopens = false; focusreviewdialog(); }
  } catch (error) { plancardsroot.textContent = error instanceof Error ? error.message : String(error); }
}

/** Moves focus to the first control of the review dialog focus order: the read summary of the first card, so the keyboard starts the review where the eye starts it. */
function focusreviewdialog(): void {
  plancardsroot?.querySelector<HTMLElement>(`[data-focusorder="${reviewfocus.focusfirst}"]`)?.focus();
}

/** Resolves one step with one distinct human action: the resolution writes into the immutable log with its surface provenance. */
async function resolveStep(stepid: string, resolution: "approve" | "reject"): Promise<void> {
  const result = await request({ kind: "surface", approve: { resolve: { stepid, resolution, surface: "sidepanel" } } }) as { resolution: { stepid: string; resolution: string } };
  status(`The step ${result.resolution.stepid} resolved with a ${result.resolution.resolution}; the resolution landed in the immutable log.`);
  await refresh();
  await rendersurfacereview();
}

/** Opens the inline editor of one step before approve: the edited shape rides the plan and the correction memory records the change. */
async function editStep(stepid: string): Promise<void> {
  if (!plancardsroot) return;
  const editor = document.createElement("div");
  editor.className = "panel";
  const input = document.createElement("textarea");
  input.rows = 4;
  input.value = "{ \"kind\": \"click\", \"summary\": \"Describe the corrected step.\" }";
  const save = button("Save edit", async () => {
    const result = await request({ kind: "surface", approve: { resolve: { stepid, resolution: "edit", edited: input.value, surface: "sidepanel" } } }) as { resolution: { stepid: string } };
    status(`The step ${result.resolution.stepid} carries the edited shape and the correction memory recorded the change.`);
    editor.remove();
    await refresh();
    await rendersurfacereview();
  });
  editor.append(input, save);
  plancardsroot.append(editor);
}

/** Opens the diffpreview of one write class step: the observed before state beside the predicted after state with masked values carrying their verdicts. */
async function diffPreview(stepid: string): Promise<void> {
  const before: Record<string, string> = {};
  try {
    const preview = await request({ kind: "preview", stepid }) as { resolvedtarget?: { mode?: string; selector?: string; text?: string } };
    if (preview.resolvedtarget?.selector !== undefined) before.selector = preview.resolvedtarget.selector;
    if (preview.resolvedtarget?.text !== undefined) before.text = preview.resolvedtarget.text;
    if (preview.resolvedtarget?.mode !== undefined) before.mode = preview.resolvedtarget.mode;
  } catch { /* a failing preview leaves the before state empty and the predicted after state alone */ }
  const result = await request({ kind: "surface", diff: { preview: { stepid, before } } }) as { preview: { stepid: string; changes: Array<{ field: string; kind: string; before?: string; after?: string }>; maskverdicts: Record<string, string>; provenance: string } };
  const detail = result.preview.changes.map(change => `${change.kind} ${change.field}${change.before !== undefined ? ` from ${change.before}` : ""}${change.after !== undefined ? ` to ${change.after}` : ""}`).join("; ");
  const masked = Object.entries(result.preview.maskverdicts).map(([field, verdict]) => `${field}: ${verdict}`).join("; ");
  status(`Diff preview of ${stepid} (${result.preview.provenance}): ${detail === "" ? "no field changes" : detail}${masked === "" ? "" : ` — masked: ${masked}`}`);
}

/** Renders the stepstimeline derived from progress records with no new state: the statuses, durations, environment badges and the deep link anchors of every step — the timeline adopts the virtlist windowing of the 1.1.68 family (roadmap item 38): the same window options family and the same rowsneeded budget seam the logstream renders through windows the timeline nodes, so long plans render their visible slice while the full chain stays in memory. */
async function renderstepstimeline(): Promise<void> {
  if (!stepstimelineroot) return;
  try {
    const result = await request({ kind: "surface", timeline: { nodes: true } }) as { nodes: Array<{ stepid: string; kind: string; status: string; durationms?: number; environment?: string; active: boolean; anchor: string; resultsummary?: string; parseduration?: number }> };
    stepstimelineroot.replaceChildren();
    if (result.nodes.length === 0) { stepstimelineroot.textContent = "No plan runs yet; the timeline derives its nodes from progress records with no new state."; return; }
    const list = document.createElement("ol");
    list.className = "audit";
    let windowed = result.nodes;
    try {
      const perfview = await request({ kind: "perf", virtlist: { open: { surface: "stepstimeline", total: result.nodes.length } } }) as { window: { start: number; end: number; total: number; recycled: number } };
      windowed = result.nodes.slice(perfview.window.start, perfview.window.end);
      if (result.nodes.length > windowed.length) list.append(Object.assign(document.createElement("li"), { textContent: `The virtlist window renders ${windowed.length} of ${result.nodes.length} timeline nodes; the full step chain stays in memory while the window recycles its row nodes during scroll.` }));
    } catch { /* an unset window renders every timeline node */ }
    for (const node of windowed) {
      const item = document.createElement("li");
      item.id = node.anchor.slice(1);
      const badge = node.active ? " ▶" : "";
      const duration = node.durationms !== undefined ? ` · ${node.durationms}ms` : "";
      const environment = node.environment !== undefined ? ` · ${node.environment}` : "";
      const parseduration = node.parseduration !== undefined ? ` · parse ${node.parseduration}ms` : "";
      item.textContent = `${node.stepid} ${node.kind} — ${node.status}${duration}${environment}${parseduration}${badge}${node.resultsummary !== undefined ? ` — ${node.resultsummary}` : ""}`;
      if (node.status === "waiting") item.append(" ", button("Diff preview at the gate wait", () => diffPreview(node.stepid)));
      if (node.active) item.scrollIntoView({ block: "nearest" });
      list.append(item);
    }
    stepstimelineroot.append(list);
  } catch (error) { stepstimelineroot.textContent = error instanceof Error ? error.message : String(error); }
}

/** Renders the 1.1.68 run performance footer: the query counts and the cache hits of the run beside the selcache generation that advanced with every dom mutation batch, and the worker queue depth of the parse pool. */
async function renderperffooter(): Promise<void> {
  const footernode = document.querySelector<HTMLElement>("#perffooter");
  if (!footernode) return;
  try {
    const view = await request({ kind: "perf", view: true }) as { footer: { queries: number; cachehits: number; steps: number; duration: number; delta: boolean }; selcache?: { runid: string; generation: number; entries: number; hits: number; stale: number }; queue: { depth: number; deferred: number; peak: number } };
    const selcache = view.selcache !== undefined ? ` · selcache generation ${view.selcache.generation} (${view.selcache.entries} entr${view.selcache.entries === 1 ? "y" : "ies"}, ${view.selcache.stale} stale)` : "";
    footernode.textContent = `Run footer: ${view.footer.steps} measured step${view.footer.steps === 1 ? "" : "s"} · ${view.footer.queries} querie${view.footer.queries === 1 ? "" : "s"} · ${view.footer.cachehits} cache hit${view.footer.cachehits === 1 ? "" : "s"} · ${view.footer.duration}ms total${view.footer.delta ? " · latest step served from a delta" : ""}${selcache} · worker queue ${view.queue.depth} pending${view.queue.deferred > 0 ? ` (${view.queue.deferred} deferred)` : ""}.`;
  } catch { footernode.textContent = "No run measured yet; the footer shows the query counts, the cache hits and the selcache generation of the open run."; }
}

/** Renders the 1.1.69 batch lanes of the open run beside its timeoutcancel events: every domain lane names its user concurrency slots with its running and queued counts, and every timeoutcancel event names its bound and its retry hint. */
async function renderbatchlanes(): Promise<void> {
  const lanesnode = document.querySelector<HTMLElement>("#batchlanes");
  if (!lanesnode) return;
  try {
    const view = await request({ kind: "schedule", view: true }) as { backpressure: { runid: string; behind: number; paused: boolean; window?: number }; lanes: Array<{ domain: string; slots: number; running: number; queued: number }>; timeouts: Array<{ stepid: string; bound: number; elapsed: number; logged: boolean }> };
    lanesnode.replaceChildren();
    const line = document.createElement("p");
    line.textContent = `Batch queue of ${view.backpressure.runid}: ${view.backpressure.behind} step${view.backpressure.behind === 1 ? "" : "s"} ahead of its outcomes${view.backpressure.window !== undefined ? ` inside the user window of ${view.backpressure.window}` : " with no user window"}${view.backpressure.paused ? " · enqueueing paused (queued steps stay queued)" : " · enqueueing open"}.`;
    lanesnode.append(line);
    if (view.lanes.length > 0) {
      const lanes = document.createElement("ol");
      lanes.className = "audit";
      for (const lane of view.lanes) lanes.append(Object.assign(document.createElement("li"), { textContent: `${lane.domain} — ${lane.running} running of ${lane.slots} slot${lane.slots === 1 ? "" : "s"}${lane.queued > 0 ? ` · ${lane.queued} queued in the lane` : ""}` }));
      lanesnode.append(lanes);
    }
    if (view.timeouts.length > 0) {
      const timeouts = document.createElement("ul");
      for (const event of view.timeouts) timeouts.append(Object.assign(document.createElement("li"), { textContent: `timeoutcancel of ${event.stepid}: aborted at the user bound of ${event.bound}ms after ${event.elapsed}ms${event.logged ? " · cancel event logged" : ""} — the retry stays a reviewed dispatch.` }));
      lanesnode.append(timeouts);
    }
  } catch { lanesnode.textContent = "No batch run scheduled yet; the lanes show the domain limits with their running and queued steps, and the timeoutcancel events with their retry hints."; }
}

/** Renders the 1.1.70 run lifecycle of the open plan: the live runstate badge beside the plan, the checkpoint position with its resume control, the offline queue depth with its replay now control, the zombie runs with their reap timestamps, the replayed steps marked with their idempotencykeys and the rollback, rollback cancel or plain cancel choices of a failed run. */
async function renderresilience(): Promise<void> {
  const node = document.querySelector<HTMLElement>("#runlifecycle");
  if (!node) return;
  try {
    const view = await request({ kind: "resilience", view: true }) as { runs: Array<{ runid: string; planid: string; state: string; updatedat: number; heartbeat?: number; beats?: number }>; queue: { size: number; offline: boolean; depth?: number }; zombies: Array<{ runid: string; planid: string }>; window: number; summaries: Array<{ runid: string; state: string; steps: number; completed: number; checkpointstep?: string; updatedat: number }>; executedkeys: string[] };
    node.replaceChildren();
    const headline = document.createElement("p");
    headline.textContent = `Offline queue: ${view.queue.size} task${view.queue.size === 1 ? "" : "s"} waiting${view.queue.offline ? " while offline" : " while online"}${view.queue.depth !== undefined ? ` of the user depth ${view.queue.depth}` : " with no user depth"} · heartbeat window ${view.window}ms${view.zombies.length > 0 ? ` · ${view.zombies.length} zombie run${view.zombies.length === 1 ? "" : "s"}` : ""}.`;
    node.append(headline);
    const actions = document.createElement("div");
    actions.className = "actions";
    actions.append(button("Replay queue now", async () => { await request({ kind: "resilience", queue: { replay: true } }); await renderresilience(); }));
    actions.append(button("Zombiecheck", async () => { await request({ kind: "resilience", zombie: { check: true } }); await renderresilience(); }));
    node.append(actions);
    if (view.summaries.length > 0) {
      const runs = document.createElement("ol");
      runs.className = "audit";
      for (const summary of view.summaries) {
        const row = document.createElement("li");
        const badge = document.createElement("span");
        badge.className = "runbadge";
        badge.dataset.state = summary.state;
        badge.textContent = summary.state;
        row.append(document.createTextNode(`run ${summary.runid} — ${summary.completed} of ${summary.steps} steps`), badge);
        const detail = document.createElement("p");
        detail.textContent = `${summary.checkpointstep !== undefined ? `checkpoint at ${summary.checkpointstep} · ` : ""}updated ${new Date(summary.updatedat).toISOString()}`;
        row.append(detail);
        const rowactions = document.createElement("div");
        rowactions.className = "actions";
        if (summary.checkpointstep !== undefined) rowactions.append(button("Resume from checkpoint", async () => { await request({ kind: "resilience", checkpoint: { resume: { runid: summary.runid } } }); await renderresilience(); }));
        if (summary.state === "failed") {
          rowactions.append(button("Rollback", async () => { await request({ kind: "resilience", rollback: { choose: { runid: summary.runid, choice: "rollback" } } }); await renderresilience(); }));
          rowactions.append(button("Cancel without rollback", async () => { await request({ kind: "resilience", cancel: { runid: summary.runid, choice: "none" } }); await renderresilience(); }));
        }
        if (summary.state === "running" || summary.state === "paused" || summary.state === "queued") rowactions.append(button("Cancel with rollback", async () => { await request({ kind: "resilience", cancel: { runid: summary.runid, choice: "rollback" } }); await renderresilience(); }));
        if (rowactions.childElementCount > 0) row.append(rowactions);
        runs.append(row);
      }
      node.append(runs);
    }
    const zombieids = new Set(view.zombies.map(zombie => zombie.runid));
    const tracked = view.runs.filter(run => zombieids.has(run.runid) || view.summaries.some(summary => summary.runid === run.runid));
    if (tracked.length > 0) {
      const rows = document.createElement("ul");
      for (const run of tracked) {
        const row = document.createElement("li");
        const badge = document.createElement("span");
        badge.className = "runbadge";
        badge.dataset.state = run.state;
        badge.textContent = run.state;
        row.append(document.createTextNode(`run ${run.runid} of plan ${run.planid}`), badge);
        if (zombieids.has(run.runid)) {
          const reap = document.createElement("span");
          reap.className = "runbadge";
          reap.dataset.state = "failed";
          reap.textContent = `zombie since ${new Date(run.updatedat).toISOString()}`;
          row.append(reap);
        }
        rows.append(row);
      }
      node.append(rows);
    }
    if (view.executedkeys.length > 0) {
      const keys = document.createElement("p");
      keys.textContent = `Executed idempotencykeys of the open plan: ${view.executedkeys.slice(0, 6).join(", ")}${view.executedkeys.length > 6 ? ` and ${view.executedkeys.length - 6} more` : ""}; every replayed step marks with its key so the duplicate skips.`;
      node.append(keys);
    }
  } catch { node.textContent = "No run lifecycle yet; the section shows the live runstate badge beside the plan, the checkpoint position with its resume control, the offline queue depth with its replay control, the zombie runs with their reap timestamps and the rollback or cancel choices of a failed run."; }
}

/** Renders the 1.1.71 state depth of the open run: the runtimeline with its phase buckets, the urlhistory of the active run, the sessionlock holder that names who blocks a run, the quotareport with its cleanup control, the expiryrules editor per memory class and the audit bundle export through the download control. */
async function renderstatedepth(): Promise<void> {
  const node = document.querySelector<HTMLElement>("#statedepth");
  if (!node) return;
  try {
    const view = await request({ kind: "state", view: true }) as { visits: { count: number; origins: string[]; first?: number; last?: number }; timeline: { count: number; buckets: Array<{ phase: string; count: number }> }; locks: Array<{ holder: string; sessionid: string; acquiredat: number; expiresat: number }>; lockwindow: number; memory: { items: number; encrypted: number; expired: number; provenancecomplete: boolean }; quota?: { usage: number; quota: number; remaining: number; candidates?: Array<{ key: string; bytes: number; reason: string }> }; encryptrest: boolean; expireinterval?: number };
    node.replaceChildren();
    const headline = document.createElement("p");
    headline.textContent = `State depth: ${view.timeline.count} timeline event${view.timeline.count === 1 ? "" : "s"} in ${view.timeline.buckets.length} phase bucket${view.timeline.buckets.length === 1 ? "" : "s"} · ${view.visits.count} url visit${view.visits.count === 1 ? "" : "s"} over ${view.visits.origins.length} origin${view.visits.origins.length === 1 ? "" : "s"} · ${view.memory.items} memory item${view.memory.items === 1 ? "" : "s"}${view.memory.encrypted > 0 ? `, ${view.memory.encrypted} encrypted` : ""}${view.memory.expired > 0 ? `, ${view.memory.expired} expired` : ""} · encryptrest ${view.encryptrest ? "on" : "off"} · lock window ${view.lockwindow}ms${view.expireinterval !== undefined ? ` · expire interval ${view.expireinterval}ms` : ""}.`;
    node.append(headline);
    const actions = document.createElement("div");
    actions.className = "actions";
    actions.append(button("Load timeline", async () => { await renderstatedepthtimeline(); }));
    actions.append(button("Quotawatch now", async () => { await request({ kind: "state", quota: { watch: true } }); await renderstatedepth(); }));
    actions.append(button("Expire memory", async () => { await request({ kind: "state", expire: { run: { confirmed: true } } }); await renderstatedepth(); }));
    actions.append(button("Export audit bundle", async () => { await request({ kind: "state", export: { download: true } }); status("The audit bundle exported through the download flow."); }));
    node.append(actions);
    if (view.locks.length > 0) {
      const locks = document.createElement("ul");
      for (const lock of view.locks) {
        const row = document.createElement("li");
        const badge = document.createElement("span");
        badge.className = "runbadge";
        badge.dataset.state = "running";
        badge.textContent = "held";
        row.append(document.createTextNode(`session ${lock.sessionid} locked by the run ${lock.holder}`), badge);
        const detail = document.createElement("p");
        detail.textContent = `acquired ${new Date(lock.acquiredat).toISOString()} · expires ${new Date(lock.expiresat).toISOString()}; a concurrent run waits and the gate names the holder.`;
        row.append(detail);
        locks.append(row);
      }
      node.append(locks);
    }
    if (view.quota !== undefined) {
      const quota = document.createElement("p");
      const candidates = view.quota.candidates ?? [];
      quota.textContent = `Quota: ${view.quota.usage} of ${view.quota.quota} bytes used, ${view.quota.remaining} remaining${candidates.length > 0 ? `, ${candidates.length} cleanup candidate${candidates.length === 1 ? "" : "s"} ranked by age and expiry policy` : ""}.`;
      node.append(quota);
      if (candidates.length > 0) {
        const cleanup = document.createElement("div");
        cleanup.className = "actions";
        cleanup.append(button("Approve cleanup batch", async () => { const outcome = await request({ kind: "state", quota: { cleanup: { approved: true } } }) as { reclaimed: number }; status(`The cleanup batch reclaimed ${outcome.reclaimed} byte${outcome.reclaimed === 1 ? "" : "s"}; the audit history stayed untouched.`); await renderstatedepth(); }));
        node.append(cleanup);
      }
    }
    const rulesform = document.createElement("div");
    rulesform.className = "actions";
    const patterninput = document.createElement("input");
    patterninput.placeholder = "Memory key pattern of the expiry rule";
    patterninput.setAttribute("aria-label", "Expiry rule memory key pattern");
    const lifetimeinput = document.createElement("input");
    lifetimeinput.placeholder = "Lifetime in milliseconds";
    lifetimeinput.setAttribute("aria-label", "Expiry rule lifetime in milliseconds");
    lifetimeinput.type = "number";
    const setrule = document.createElement("button");
    setrule.className = "secondary";
    setrule.textContent = "Set expiry rule";
    setrule.addEventListener("click", () => { void (async () => { const pattern = patterninput.value.trim(); const lifetime = Number.parseInt(lifetimeinput.value, 10); if (pattern === "" || !Number.isFinite(lifetime) || lifetime <= 0) { status("The expiry rule needs its pattern and its positive lifetime in milliseconds; every lifetime stays the user's choice."); return; } await request({ kind: "state", expire: { rules: { set: [{ pattern, lifetime }] } } }); status(`The expiry rule of ${pattern} set with its lifetime of ${lifetime} milliseconds.`); await renderstatedepth(); })(); });
    rulesform.append(patterninput, lifetimeinput, setrule);
    node.append(rulesform);
  } catch { node.textContent = "No state depth yet; the section shows the runtimeline with its phase buckets, the urlhistory of the active run, the sessionlock holder that names who blocks a run, the quotareport with its cleanup control, the expiryrules editor per memory class and the audit bundle export."; }
}

/** Renders the runtimeline of the open run with its phase buckets: every event row marks its source and the buckets group the steps, the failures, the audit trail and the route. */
async function renderstatedepthtimeline(): Promise<void> {
  const node = document.querySelector<HTMLElement>("#statedepthtimeline");
  if (!node) return;
  try {
    const view = await request({ kind: "state", timeline: { view: true } }) as { timeline: { runid: string; events: Array<{ at: number; source: string; summary: string; stepid?: string; kind?: string }>; buckets: Array<{ phase: string; count: number }> }; buckets: Array<{ phase: string; events: Array<{ at: number; source: string; summary: string; stepid?: string; kind?: string }> }> };
    node.replaceChildren();
    const headline = document.createElement("p");
    headline.textContent = `Runtimeline of the run ${view.timeline.runid}: ${view.timeline.events.length} event${view.timeline.events.length === 1 ? "" : "s"} in ${view.buckets.length} phase bucket${view.buckets.length === 1 ? "" : "s"} (${view.buckets.map(bucket => `${bucket.phase} ${bucket.events.length}`).join(" · ")}); the timeline renders read only and never executes anything.`;
    node.append(headline);
    for (const bucket of view.buckets) {
      const head = document.createElement("h4");
      head.textContent = bucket.phase;
      node.append(head);
      const list = document.createElement("ul");
      for (const event of bucket.events.slice(0, 12)) {
        const row = document.createElement("li");
        const badge = document.createElement("span");
        badge.className = "runbadge";
        badge.dataset.state = event.source === "visit" ? "queued" : event.source === "audit" ? "paused" : "running";
        badge.textContent = event.source;
        row.append(document.createTextNode(`[${new Date(event.at).toLocaleTimeString()}] ${event.summary}`), badge);
        list.append(row);
      }
      node.append(list);
    }
  } catch { node.textContent = "No runtimeline yet; every step result, audit event and url visit of the open run merges into one ordered stream with its phase buckets."; }
}

/** Renders the live logstream with pause and filter controls, the live chain verification badge and the copy of a verified range as an audit excerpt. */
async function renderlogstream(): Promise<void> {
  if (!logstreamroot) return;
  try {
    const result = await request({ kind: "surface", logstream: { read: { filters: logstreamfilter } } }) as { events: Array<{ id: string; level: string; source: string; origin: string; summary: string; stepid?: string; masked: boolean; maskverdict: string; at: number }>; chain: { valid: boolean; reason: string }; total: number };
    logstreamroot.replaceChildren();
    const controls = document.createElement("div");
    controls.className = "actions";
    const pause = button(logstreampaused ? "Resume stream" : "Pause stream", async () => { logstreampaused = !logstreampaused; await renderlogstream(); });
    const levelselect = document.createElement("select");
    for (const level of ["", "error", "warn", "info", "log", "debug", "trace"]) {
      const option = document.createElement("option");
      option.value = level;
      option.textContent = level === "" ? "all levels" : level;
      levelselect.append(option);
    }
    levelselect.value = logstreamfilter.level ?? "";
    levelselect.addEventListener("change", () => { const level = levelselect.value; logstreamfilter = { ...logstreamfilter, ...(level !== "" ? { level } : {}) }; void renderlogstream(); });
    const copy = button("Copy verified excerpt", async () => {
      const excerpt = await request({ kind: "surface", logstream: { excerpt: {} } }) as { excerpt: string; reason: string };
      await navigator.clipboard?.writeText(excerpt.excerpt).catch(() => { /* the clipboard write needs its reviewed clipboard consent */ });
      status(excerpt.reason);
    });
    const chain = document.createElement("span");
    chain.className = "muted";
    chain.textContent = result.chain.valid ? `chain verified · ${result.total} events` : `chain broken: ${result.chain.reason}`;
    controls.append(pause, levelselect, copy, chain);
    const list = document.createElement("ol");
    list.className = "audit";
    const liveevents = logstreampaused ? [] : result.events;
    let windowed = liveevents;
    try {
      const perfview = await request({ kind: "perf", virtlist: { open: { surface: "logstream", total: liveevents.length } } }) as { window: { start: number; end: number; total: number; recycled: number } };
      windowed = liveevents.slice(perfview.window.start, perfview.window.end);
      if (liveevents.length > windowed.length) list.append(Object.assign(document.createElement("li"), { textContent: `The virtlist window renders ${windowed.length} of ${liveevents.length} events; the full history stays in memory while the window recycles its row nodes during scroll.` }));
    } catch { /* an unset window renders every event */ }
    for (const event of windowed) {
      const item = document.createElement("li");
      item.textContent = `[${new Date(event.at).toLocaleTimeString()}] ${event.level} ${event.source}${event.stepid !== undefined ? ` step ${event.stepid}` : ""} ${event.origin} — ${event.summary}${event.masked ? ` (${event.maskverdict})` : ""}`;
      list.append(item);
    }
    if (logstreampaused) list.append(Object.assign(document.createElement("li"), { textContent: "The live stream pauses while the run continues; the full history stays in memory." }));
    logstreamroot.append(controls, list);
  } catch (error) { logstreamroot.textContent = error instanceof Error ? error.message : String(error); }
}

/** Renders the 1.1.72 fleet control: the agent fleet with its names, roles and control states, the remaining budget per agent, the fleet registration form with its user chosen ceilings, the open escalations with their answer controls, the agent to agent review requests with their verdict controls, the outputcompare of two competing agents side by side, the consensusvote tally with its outcome and the single agent pause from its row. */
async function renderfleetcontrol(): Promise<void> {
  const node = document.querySelector<HTMLElement>("#fleetcontrol");
  if (!node) return;
  try {
    const view = await request({ kind: "fleet", view: true }) as { overview: { agents: number; active: number; paused: number; stopped: number; openescalations: number; openreviews: number; lastkillswitchat?: number }; agents: Array<{ id: string; name: string; role: string; origin: string; state: string; remaining?: string }>; escalations: Array<{ id: string; agentid: string; subject: string; context: string; state: string; decision?: string; stepid?: string; raisedat: number }>; reviews: Array<{ id: string; fromagentid: string; toagentid: string; subject: string; output: string; state: string; verdict?: string; issues?: string[]; requestedat: number }>; comparisons: Array<{ id: string; subject: string; left: { agentid: string; fields: Record<string, string> }; right: { agentid: string; fields: Record<string, string> }; matching: string[]; conflicting: string[]; missing: string[]; comparedat: number }>; votes: Array<{ proposal: string; votes: Array<{ agentid: string; vote: string; reason?: string }>; tally: { yes: number; no: number; abstain: number }; quorum: number; outcome: string }> };
    node.replaceChildren();
    const headline = document.createElement("p");
    headline.textContent = `Fleet: ${view.overview.agents} agent${view.overview.agents === 1 ? "" : "s"} (${view.overview.active} active, ${view.overview.paused} paused, ${view.overview.stopped} stopped) · ${view.overview.openescalations} open escalation${view.overview.openescalations === 1 ? "" : "s"} · ${view.overview.openreviews} open review${view.overview.openreviews === 1 ? "" : "s"}${view.overview.lastkillswitchat !== undefined ? ` · last killswitch ${new Date(view.overview.lastkillswitchat).toISOString()}` : " · killswitch never engaged"}.`;
    node.append(headline);
    const registerform = document.createElement("div");
    registerform.className = "actions";
    const nameinput = document.createElement("input");
    nameinput.placeholder = "Agent name (lowercase, unique)";
    nameinput.setAttribute("aria-label", "Fleet agent name");
    const roleinput = document.createElement("input");
    roleinput.placeholder = "Role (worker, planner, observer, critic, verifier)";
    roleinput.setAttribute("aria-label", "Fleet agent role");
    const stepsinput = document.createElement("input");
    stepsinput.placeholder = "Step ceiling (optional)";
    stepsinput.type = "number";
    stepsinput.setAttribute("aria-label", "Fleet agent step ceiling");
    const registerbutton = document.createElement("button");
    registerbutton.className = "secondary";
    registerbutton.textContent = "Register agent";
    registerbutton.addEventListener("click", () => { void (async () => { const name = nameinput.value.trim(); if (name === "") { status("The agent needs its user chosen name; agent naming stays a user choice."); return; } const steps = Number.parseInt(stepsinput.value, 10); await request({ kind: "fleet", register: { name, ...(roleinput.value.trim() !== "" ? { role: roleinput.value.trim() } : {}), ...(Number.isFinite(steps) && steps > 0 ? { maxsteps: steps } : {}) } }); status(`The agent ${name} registered in the fleet through agentname before its first run.`); await renderfleetcontrol(); })().catch(error => status(error instanceof Error ? error.message : String(error), true)); });
    registerform.append(nameinput, roleinput, stepsinput, registerbutton);
    node.append(registerform);
    if (view.agents.length > 0) {
      const fleet = document.createElement("ul");
      for (const agent of view.agents) {
        const row = document.createElement("li");
        const badge = document.createElement("span");
        badge.className = "fleetbadge";
        badge.dataset.state = agent.state;
        badge.textContent = agent.state;
        row.append(document.createTextNode(`${agent.name} · ${agent.role} · ${agent.origin}`), badge);
        if (agent.remaining !== undefined) { const budget = document.createElement("p"); budget.textContent = `Budget: ${agent.remaining}`; row.append(budget); }
        const controls = document.createElement("div");
        controls.className = "actions";
        controls.append(button(agent.state === "paused" ? "Resume agent" : "Pause agent", async () => { await request({ kind: "fleet", ...(agent.state === "paused" ? { unpause: { agentid: agent.id } } : { pause: { agentid: agent.id } }) }); status(agent.state === "paused" ? `The agent ${agent.name} resumed; its peers never changed.` : `The pause holds only the agent ${agent.name}; its peers stay runnable and their run records stay untouched.`); await renderfleetcontrol(); }));
        row.append(controls);
        fleet.append(row);
      }
      node.append(fleet);
    }
    const openescalations = view.escalations.filter(escalation => escalation.state === "open");
    if (openescalations.length > 0) {
      const heading = document.createElement("h4");
      heading.textContent = "Open escalations";
      node.append(heading);
      const list = document.createElement("ul");
      for (const escalation of openescalations) {
        const row = document.createElement("li");
        row.append(document.createTextNode(`${escalation.agentid} asks: ${escalation.subject}${escalation.stepid !== undefined ? ` (step ${escalation.stepid})` : ""}`));
        const context = document.createElement("p");
        context.textContent = escalation.context;
        row.append(context);
        const answerrow = document.createElement("div");
        answerrow.className = "actions";
        const answerinput = document.createElement("input");
        answerinput.placeholder = "The decision only the user writes";
        answerinput.setAttribute("aria-label", `Escalation answer for ${escalation.subject}`);
        const answerbutton = document.createElement("button");
        answerbutton.className = "secondary";
        answerbutton.textContent = "Answer";
        answerbutton.addEventListener("click", () => { void (async () => { const decision = answerinput.value.trim(); if (decision === "") { status("The escalation decision needs the words the user wrote; escalations stay human decided."); return; } await request({ kind: "fleet", answer: { id: escalation.id, decision } }); status(`The escalation of ${escalation.agentid} answered; the hold on the raising agent lifts.`); await renderfleetcontrol(); })().catch(error => status(error instanceof Error ? error.message : String(error), true)); });
        answerrow.append(answerinput, answerbutton);
        row.append(answerrow);
        list.append(row);
      }
      node.append(list);
    }
    const openreviews = view.reviews.filter(review => review.state === "open");
    if (openreviews.length > 0) {
      const heading = document.createElement("h4");
      heading.textContent = "Review requests";
      node.append(heading);
      const list = document.createElement("ul");
      for (const review of openreviews) {
        const row = document.createElement("li");
        row.append(document.createTextNode(`${review.fromagentid} → ${review.toagentid}: ${review.subject}`));
        const output = document.createElement("p");
        output.textContent = `Output under review: ${review.output}`;
        row.append(output);
        const controls = document.createElement("div");
        controls.className = "actions";
        const issuesinput = document.createElement("input");
        issuesinput.placeholder = "Issues in plain language (changes and reject need them)";
        issuesinput.setAttribute("aria-label", `Review issues for ${review.subject}`);
        controls.append(issuesinput);
        for (const verdict of ["approve", "changes", "reject"] as const) {
          controls.append(button(verdict, async () => { const issues = issuesinput.value.trim() !== "" ? [issuesinput.value.trim()] : undefined; await request({ kind: "fleet", verdict: { id: review.id, reviewerid: review.toagentid, verdict, ...(issues !== undefined ? { issues } : {}) } }); status(`The ${verdict} verdict recorded beside the original output on ${review.subject}.`); await renderfleetcontrol(); }));
        }
        row.append(controls);
        list.append(row);
      }
      node.append(list);
    }
    const compareform = document.createElement("div");
    compareform.className = "actions";
    const leftinput = document.createElement("input");
    leftinput.placeholder = "Left agent id";
    leftinput.setAttribute("aria-label", "Output compare left agent id");
    const rightinput = document.createElement("input");
    rightinput.placeholder = "Right agent id";
    rightinput.setAttribute("aria-label", "Output compare right agent id");
    const subjectinput = document.createElement("input");
    subjectinput.placeholder = "Subject of the comparison";
    subjectinput.setAttribute("aria-label", "Output compare subject");
    compareform.append(leftinput, rightinput, subjectinput, button("Compare outputs", async () => {
      const leftagentid = leftinput.value.trim();
      const rightagentid = rightinput.value.trim();
      if (leftagentid === "" || rightagentid === "") throw new Error("The outputcompare names both competing agents of the fleet.");
      const result = await request({ kind: "fleet", compare: { subject: subjectinput.value.trim() !== "" ? subjectinput.value.trim() : "the competing outputs", leftagentid, rightagentid, leftfields: {}, rightfields: {} } }) as { comparisons: Array<{ subject: string; matching: string[]; conflicting: string[]; missing: string[] }> };
      status(`The comparison of ${leftagentid} and ${rightagentid} stands in the comparisons list.`);
      void result;
      await renderfleetcontrol();
    }));
    node.append(compareform);
    if (view.comparisons.length > 0) {
      const heading = document.createElement("h4");
      heading.textContent = "Output comparisons";
      node.append(heading);
      for (const comparison of view.comparisons.slice(0, 3)) {
        const card = document.createElement("div");
        card.className = "sessionrow";
        const headline2 = document.createElement("p");
        headline2.textContent = `${comparison.subject}: ${comparison.left.agentid} vs ${comparison.right.agentid} — ${comparison.matching.length} matching, ${comparison.conflicting.length} conflicting, ${comparison.missing.length} missing.`;
        card.append(headline2);
        const leftcolumn = document.createElement("p");
        leftcolumn.textContent = `${comparison.left.agentid}: ${Object.entries(comparison.left.fields).map(([key, value]) => `${key}=${value}`).join(", ") || "no fields"}`;
        const rightcolumn = document.createElement("p");
        rightcolumn.textContent = `${comparison.right.agentid}: ${Object.entries(comparison.right.fields).map(([key, value]) => `${key}=${value}`).join(", ") || "no fields"}`;
        const conflicts = document.createElement("p");
        conflicts.textContent = `${comparison.conflicting.length > 0 ? `Conflicting: ${comparison.conflicting.join(", ")}. ` : ""}${comparison.missing.length > 0 ? `Missing: ${comparison.missing.join(", ")}.` : ""}`.trim() || "The two outputs agree on every shared field.";
        card.append(leftcolumn, rightcolumn, conflicts);
        node.append(card);
      }
    }
    if (view.votes.length > 0) {
      const heading = document.createElement("h4");
      heading.textContent = "Consensus votes";
      node.append(heading);
      const list = document.createElement("ul");
      for (const vote of view.votes.slice(0, 5)) {
        const row = document.createElement("li");
        const outcomebadge = document.createElement("span");
        outcomebadge.className = "fleetbadge";
        outcomebadge.dataset.state = vote.outcome === "carried" ? "active" : vote.outcome === "failed" ? "stopped" : "paused";
        outcomebadge.textContent = vote.outcome;
        row.append(document.createTextNode(`${vote.proposal} — ${vote.tally.yes} yes, ${vote.tally.no} no, ${vote.tally.abstain} abstain of quorum ${vote.quorum} `), outcomebadge);
        const dissent = vote.votes.filter(entry => entry.vote !== "yes");
        if (dissent.length > 0) { const detail = document.createElement("p"); detail.textContent = `Dissent kept for the audit trail: ${dissent.map(entry => `${entry.agentid} (${entry.vote}${entry.reason !== undefined ? `: ${entry.reason}` : ""})`).join("; ")}.`; row.append(detail); }
        list.append(row);
      }
      node.append(list);
    }
  } catch { node.textContent = "No fleet yet; the section lists the agent fleet with its names, roles and control states, the remaining budget per agent, the open escalations with their answer controls, the review requests with their verdict controls, the outputcompare side by side, the consensusvote tally with its outcome and the single agent pause from its row."; }
}

/** Renders the whole review surface half: the plancards, the stepstimeline, the logstream and the 1.1.68 run performance footer. */
async function rendersurfacereview(): Promise<void> {
  await renderplancards();
  await renderstepstimeline();
  await renderlogstream();
  await renderperffooter();
  await renderbatchlanes();
  await renderresilience();
  await renderstatedepth();
  await renderfleetcontrol();
  await renderagentwork();
  await rendernavintelligence();
  await renderpipelines();
  await renderwebapi();
  await rendervisionocr();
  await renderforensics();
  await renderminimization();
  await renderbridge();
  await rendergateways();
}

/** The last checked batch of the navigation intelligence section: the urls the user pasted and the per link checklist the check returned; the state survives the section re-renders so the open control uses exactly the links the checklist verified. */
let navbatchurls: string[] = [];
let navbatchchecklist: Array<{ url: string; verdict: string; reasons: string[] }> = [];

/** Renders the 1.1.74 navigation intelligence: the predicted next pages with their prefetch state, the open preconnect sockets, the navtrail of the active run, the rate limit state per domain, the safety verdicts with their reasons, the batch open link checklist, the paused consent navigation with its pending url and the navigation user choices for the rate window, the batch ceiling and the closed tab retention. */
async function rendernavintelligence(): Promise<void> {
  const node = document.querySelector<HTMLElement>("#navintelligence");
  if (!node) return;
  try {
    const view = await request({ kind: "nav", view: true }) as { predictions: { predictedurls: Array<{ url: string; confidence: number }>; createdat: number }; prefetchqueue: number; sockets: Array<{ origin: string; expectedat: number; connected: boolean; revokedat?: number }>; navtrail: Array<{ url: string; stepid?: string; at: number; runid?: string }>; trailentries: Array<{ url: string; at: number; runid?: string }>; ratelimits: Array<{ domain: string; count: number; resetat: number; hits?: number[]; window?: number; ceiling?: number }>; safetyverdicts: Array<{ url: string; safe: boolean; reasons: string[]; at: number }>; closedtabs: Array<{ id: string; url: string; title: string; closedat: number; reopenedat?: number }>; navpause?: { pausedat: number; reason: string; pendingurl?: string; updatedat: number }; settings: { navratewindow?: number; batchsizelimit?: number; closedtabretention?: number }; batch?: { id: string; urls: string[]; links?: Array<{ url: string; verdict: string; reasons: string[] }> } };
    node.replaceChildren();
    const headline = document.createElement("p");
    headline.textContent = `Predictions: ${view.predictions.predictedurls.length} next page${view.predictions.predictedurls.length === 1 ? "" : "s"} · prefetch queue ${view.prefetchqueue} · sockets ${view.sockets.filter(socket => socket.connected).length} open · navtrail ${view.navtrail.length} entr${view.navtrail.length === 1 ? "y" : "ies"} · ${view.ratelimits.length} rate window${view.ratelimits.length === 1 ? "" : "s"} · ${view.safetyverdicts.length} safety verdict${view.safetyverdicts.length === 1 ? "" : "s"}${view.navpause !== undefined ? " · navigation paused" : ""}.`;
    node.append(headline);
    if (view.predictions.predictedurls.length > 0) {
      const predictions = document.createElement("ul");
      for (const entry of view.predictions.predictedurls.slice(0, 8)) {
        const row = document.createElement("li");
        const badge = document.createElement("span");
        badge.className = "navbadge";
        badge.dataset.state = view.prefetchqueue > 0 ? "warmed" : "predicted";
        badge.textContent = view.prefetchqueue > 0 ? "prefetch warmed" : "predicted";
        row.append(`${entry.url} (confidence ${entry.confidence}) `, badge);
        predictions.append(row);
      }
      node.append(predictions);
    }
    if (view.sockets.length > 0) {
      const sockets = document.createElement("ul");
      for (const socket of view.sockets) {
        const row = document.createElement("li");
        const badge = document.createElement("span");
        badge.className = "navbadge";
        badge.dataset.state = socket.revokedat !== undefined ? "revoked" : socket.connected ? "open" : "closed";
        badge.textContent = socket.revokedat !== undefined ? "revoked" : socket.connected ? "read only" : "closed";
        row.append(`${socket.origin} `, badge, ` — expected ${new Date(socket.expectedat).toISOString().slice(11, 19)}`);
        sockets.append(row);
      }
      node.append(sockets);
    }
    if (view.navtrail.length > 0 || view.trailentries.length > 0) {
      const trail = document.createElement("ol");
      for (const entry of view.navtrail.slice(0, 12)) trail.append(Object.assign(document.createElement("li"), { textContent: `${entry.url}${entry.stepid !== undefined ? ` (step ${entry.stepid})` : ""} — ${new Date(entry.at).toISOString().slice(11, 19)}` }));
      node.append(trail);
    }
    if (view.ratelimits.length > 0) {
      const windows = document.createElement("ul");
      for (const window of view.ratelimits) {
        const row = document.createElement("li");
        const badge = document.createElement("span");
        badge.className = "navbadge";
        badge.dataset.state = window.ceiling !== undefined && window.count >= window.ceiling ? "full" : "live";
        badge.textContent = window.ceiling !== undefined && window.count >= window.ceiling ? "full" : "live";
        row.append(`${window.domain} — ${window.count} navigation${window.count === 1 ? "" : "s"}${window.ceiling !== undefined ? ` of ${window.ceiling}` : ""}${window.window !== undefined ? ` inside ${window.window}ms` : ""} `, badge, ` · resets ${new Date(window.resetat).toISOString().slice(11, 19)}`);
        windows.append(row);
      }
      node.append(windows);
    }
    if (view.safetyverdicts.length > 0) {
      const verdicts = document.createElement("ul");
      for (const verdict of view.safetyverdicts.slice(0, 10)) {
        const row = document.createElement("li");
        const badge = document.createElement("span");
        badge.className = "navbadge";
        badge.dataset.state = verdict.safe ? "safe" : "unsafe";
        badge.textContent = verdict.safe ? "safe" : "unsafe";
        row.append(`${verdict.url} `, badge, verdict.reasons.length > 0 ? ` — ${verdict.reasons.join("; ")}` : "");
        verdicts.append(row);
      }
      node.append(verdicts);
    }
    if (view.batch !== undefined && (view.batch.links ?? []).length > 0) {
      const batch = document.createElement("ul");
      for (const link of view.batch.links ?? []) {
        const row = document.createElement("li");
        const badge = document.createElement("span");
        badge.className = "navbadge";
        badge.dataset.state = link.verdict === "safe" ? "safe" : "unsafe";
        badge.textContent = link.verdict;
        row.append(`${link.url} `, badge, link.reasons.length > 0 ? ` — ${link.reasons.join("; ")}` : "");
        batch.append(row);
      }
      node.append(batch);
    }
    const batchform = document.createElement("div");
    batchform.className = "actions";
    const batchinput = document.createElement("input");
    batchinput.placeholder = "Curated urls to batch open, comma separated";
    batchinput.setAttribute("aria-label", "Batch open curated urls");
    batchinput.value = navbatchurls.join(", ");
    const checkbutton = button("Check batch", async () => {
      const urls = batchinput.value.split(/[,\s]+/).map(url => url.trim()).filter(url => url !== "");
      if (urls.length === 0) { status("The batch check needs its curated urls; paste the links first."); return; }
      const result = await request({ kind: "nav", batchcheck: { urls } }) as { checklist?: Array<{ url: string; verdict: string; reasons: string[] }> };
      navbatchurls = urls;
      navbatchchecklist = result.checklist ?? [];
      await rendernavintelligence();
      status(`The batch check verified ${navbatchchecklist.length} link${navbatchchecklist.length === 1 ? "" : "s"}; ${navbatchchecklist.filter(link => link.verdict === "safe").length} checked safe with the reasons listed beside every link.`);
    });
    batchform.append(batchinput, checkbutton);
    if (navbatchchecklist.length > 0) {
      const checklist = document.createElement("ul");
      for (const link of navbatchchecklist) {
        const row = document.createElement("li");
        const badge = document.createElement("span");
        badge.className = "navbadge";
        badge.dataset.state = link.verdict === "safe" ? "safe" : "unsafe";
        badge.textContent = link.verdict;
        row.append(`${link.url} `, badge, link.reasons.length > 0 ? ` — ${link.reasons.join("; ")}` : "");
        checklist.append(row);
      }
      node.append(checklist);
      if (navbatchchecklist.every(link => link.verdict === "safe")) batchform.append(button("Open checked batch", async () => {
        const result = await request({ kind: "nav", batchopen: { urls: navbatchurls } }) as { opened?: string[]; waits?: Array<{ url: string; waitms: number }> };
        status(`The batch opened ${(result.opened ?? []).length} curated url${(result.opened ?? []).length === 1 ? "" : "s"} with one tab per link after the checklist verified every url.`);
        await rendernavintelligence();
      }));
    }
    node.append(batchform);
    if (view.closedtabs.length > 0) {
      const closed = document.createElement("ul");
      for (const record of view.closedtabs) {
        const row = document.createElement("li");
        row.textContent = `${record.title || record.url} — closed ${new Date(record.closedat).toISOString().slice(11, 19)}${record.reopenedat !== undefined ? " (already reopened)" : ""}`;
        if (record.reopenedat === undefined) row.append(" ", button("Reopen", async () => { await request({ kind: "nav", reopen: { id: record.id } }); status(`The closed tab ${record.url} reopened after the grant recheck.`); await rendernavintelligence(); }));
        closed.append(row);
      }
      node.append(closed);
    }
    if (view.navpause !== undefined) {
      const pause = document.createElement("p");
      pause.textContent = `Navigation paused while ${view.navpause.reason}${view.navpause.pendingurl !== undefined ? `; the pending navigation ${view.navpause.pendingurl} queues until the answer` : ""}.`;
      node.append(pause, " ", button("Resume navigation", async () => { const result = await request({ kind: "nav", resume: true }) as { pendingurl?: string }; status(result.pendingurl !== undefined ? `Navigation resumed; the queued navigation ${result.pendingurl} returns to the run.` : "Navigation resumed; the reviewed navigation steps can run again."); await rendernavintelligence(); }));
    }
    const choices = document.createElement("div");
    choices.className = "actions";
    const windowinput = document.createElement("input");
    windowinput.placeholder = "Rate window ms";
    windowinput.type = "number";
    windowinput.setAttribute("aria-label", "Navigation rate window milliseconds");
    windowinput.value = view.settings.navratewindow !== undefined ? String(view.settings.navratewindow) : "";
    const ceilinginput = document.createElement("input");
    ceilinginput.placeholder = "Batch ceiling";
    ceilinginput.type = "number";
    ceilinginput.setAttribute("aria-label", "Batch size ceiling");
    ceilinginput.value = view.settings.batchsizelimit !== undefined ? String(view.settings.batchsizelimit) : "";
    const retentioninput = document.createElement("input");
    retentioninput.placeholder = "Closed tab retention ms";
    retentioninput.type = "number";
    retentioninput.setAttribute("aria-label", "Closed tab retention milliseconds");
    retentioninput.value = view.settings.closedtabretention !== undefined ? String(view.settings.closedtabretention) : "";
    const savebutton = button("Save navigation choices", async () => {
      const settings: { navratewindow?: number; batchsizelimit?: number; closedtabretention?: number } = {};
      if (windowinput.value.trim() !== "") settings.navratewindow = Number.parseInt(windowinput.value, 10);
      if (ceilinginput.value.trim() !== "") settings.batchsizelimit = Number.parseInt(ceilinginput.value, 10);
      if (retentioninput.value.trim() !== "") settings.closedtabretention = Number.parseInt(retentioninput.value, 10);
      await request({ kind: "nav", settings });
      status("The navigation choices saved; every bound stays the user's choice.");
      await rendernavintelligence();
    });
    choices.append(windowinput, ceilinginput, retentioninput, savebutton);
    node.append(choices);
  } catch { node.textContent = "No navigation intelligence yet; the section shows the predicted next pages with their prefetch state, the open preconnect sockets, the navtrail of the active run, the rate limit state per domain, the safety verdicts with their reasons, the batch open link checklist and the paused consent navigations with their pending urls."; }
}

/** The pipeline preview state of the data pipelines section: the pipeline the preview serves with its sort column, its direction and its filter, kept between re-renders so the sortable columns and the selected row provlog keep working off the same view. */
let pipelinepreviewstate: { pipelineid: string; sortcolumn?: string; sortdirection?: string; filter?: string } | undefined;
/** The row key whose provlog the pipelines section shows; the selected row keeps its provenance across re-renders. */
let pipelineselectedrow: string | undefined;

/** Renders the 1.1.75 data pipelines: the extract pipelines of the run with their stream progress in rows and bytes, the grid preview with its sortable columns and its stamped, transformed and deduplicated cell marks, the transform rules per field, the dedupe report with its dropped counts, the provlog provenance of the selected row, the resume control of an interrupted extraction and the stream chunk and preview retention choices of the user. */
async function renderpipelines(): Promise<void> {
  const node = document.querySelector<HTMLElement>("#pipelines");
  if (!node) return;
  try {
    const view = await request({ kind: "pipeline", view: true }) as { pipelines: Array<{ id: string; runid: string; name: string; state: string; sink: string; origin: string; steps: number; transforms: number; dedupe?: { columns: string[]; normalization: string }; sample?: { rows: number; strategy: string } }>; state: { running: number; paused: number; finished: number }; progress: Array<{ pipelineid: string; name: string; rows: number; bytes: number; chunks: number; offset: number; state: string }>; provlog: Array<{ id: string; pipelineid: string; operation: string; rowkeys: string[]; summary: string; at: number }>; dedupereports: Array<{ pipelineid: string; keys: string[]; removed: number; kept: number; droppedkeys: string[]; at: number }>; settings: { streamchunkrows?: number; previewretention?: number } };
    node.replaceChildren();
    const headline = document.createElement("p");
    headline.textContent = `Pipelines: ${view.pipelines.length} · ${view.state.running} running · ${view.state.paused} paused · ${view.state.finished} finished · ${view.provlog.length} provlog entr${view.provlog.length === 1 ? "y" : "ies"} · ${view.dedupereports.length} dedupe report${view.dedupereports.length === 1 ? "" : "s"}.`;
    node.append(headline);
    if (view.pipelines.length > 0) {
      const pipelines = document.createElement("ul");
      for (const [index, pipeline] of view.pipelines.entries()) {
        const row = document.createElement("li");
        const progress = view.progress.find(entry => entry.pipelineid === pipeline.id);
        const badge = document.createElement("span");
        badge.className = "pipemark";
        badge.dataset.mark = pipeline.state;
        badge.textContent = pipeline.state;
        row.append(`${pipeline.name} (${pipeline.sink}) `, badge, ` — ${pipeline.steps} step${pipeline.steps === 1 ? "" : "s"}, ${pipeline.transforms} transform${pipeline.transforms === 1 ? "" : "s"}, streamed ${progress?.rows ?? 0} row${(progress?.rows ?? 0) === 1 ? "" : "s"} in ${progress?.chunks ?? 0} chunk${(progress?.chunks ?? 0) === 1 ? "" : "s"} of ${(progress?.bytes ?? 0).toLocaleString()} byte${(progress?.bytes ?? 0) === 1 ? "" : "s"}${pipeline.dedupe !== undefined ? `, dedupe by ${pipeline.dedupe.columns.join(", ")} (${pipeline.dedupe.normalization})` : ""}${pipeline.sample !== undefined ? `, sample ${pipeline.sample.rows} row${pipeline.sample.rows === 1 ? "" : "s"} by ${pipeline.sample.strategy}` : ""}`);
        const controls = document.createElement("span");
        controls.append(" ");
        controls.append(button("Preview grid", async () => { pipelinepreviewstate = { pipelineid: pipeline.id, ...(pipelinepreviewstate?.sortcolumn !== undefined ? { sortcolumn: pipelinepreviewstate.sortcolumn, sortdirection: pipelinepreviewstate.sortdirection } : {}), ...(pipelinepreviewstate?.filter !== undefined ? { filter: pipelinepreviewstate.filter } : {}) }; pipelineselectedrow = undefined; await renderpipelines(); }));
        if (pipeline.state !== "finished") controls.append(" ", button("Resume", async () => { const result = await request({ kind: "pipeline", resume: { pipelineid: pipeline.id } }) as { resume?: { skipped: number; rowswritten: number } }; status(`The pipeline ${pipeline.name} resumed; ${(result.resume?.skipped ?? 0)} already persisted row${(result.resume?.skipped ?? 0) === 1 ? "" : "s"} skipped by their row keys and ${(result.resume?.rowswritten ?? 0)} further row${(result.resume?.rowswritten ?? 0) === 1 ? "" : "s"} streamed to the reviewed sink.`); await renderpipelines(); }));
        if (pipeline.dedupe !== undefined) controls.append(" ", button("Run dedupe pass", async () => { const result = await request({ kind: "pipeline", dedupe: { pipelineid: pipeline.id } }) as { dedupe?: { removed: number; kept: number } }; status(`The dedupe pass dropped ${(result.dedupe?.removed ?? 0)} duplicate${(result.dedupe?.removed ?? 0) === 1 ? "" : "s"} and kept ${(result.dedupe?.kept ?? 0)} row${(result.dedupe?.kept ?? 0) === 1 ? "" : "s"} with the first occurrence.`); await renderpipelines(); }));
        controls.append(" ", button("Export reviewed sink", async () => { const result = await request({ kind: "pipeline", export: { pipelineid: pipeline.id, confirmed: true } }) as { export?: { artifact: { name: string; checksum: string; rowcount: number } } }; status(`The pipeline exported ${(result.export?.artifact.rowcount ?? 0)} provenance carrying row${(result.export?.artifact.rowcount ?? 0) === 1 ? "" : "s"} through the reviewed ${pipeline.sink} flow into ${result.export?.artifact.name ?? "the artifact"} with checksum ${result.export?.artifact.checksum ?? ""}.`); await renderpipelines(); }));
        row.append(controls);
        pipelines.append(row);
        if (index === view.pipelines.length - 1) {
          const transformform = document.createElement("div");
          transformform.className = "actions";
          const fieldinput = document.createElement("input");
          fieldinput.placeholder = "Field to transform";
          fieldinput.setAttribute("aria-label", "Pipeline transform field");
          const operationinput = document.createElement("input");
          operationinput.placeholder = "Operation: trim, case, number or date";
          operationinput.setAttribute("aria-label", "Pipeline transform operation");
          const addbutton = button("Set transform", async () => { const field = fieldinput.value.trim(); const operation = operationinput.value.trim().toLowerCase(); if (field === "") { status("The transform edit names its field; the pipeline reshapes one field at a time."); return; } await request({ kind: "pipeline", transform: { pipelineid: pipeline.id, field, operation } }); status(`The field ${field} now carries the ${operation} operation; the raw values stay beside every transformed value.`); await renderpipelines(); });
          transformform.append(fieldinput, operationinput, addbutton, button("Remove transform", async () => { const field = fieldinput.value.trim(); if (field === "") { status("The transform removal names its field."); return; } await request({ kind: "pipeline", transform: { pipelineid: pipeline.id, field, remove: true } }); status(`The field ${field} lost its transform rule; the values flow raw again.`); await renderpipelines(); }));
          const provlogform = document.createElement("div");
          provlogform.className = "actions";
          const rowkeyinput = document.createElement("input");
          rowkeyinput.placeholder = "Row key for its provlog";
          rowkeyinput.setAttribute("aria-label", "Pipeline provlog row key");
          rowkeyinput.value = pipelineselectedrow ?? "";
          provlogform.append(rowkeyinput, button("Show row provlog", async () => { const rowkey = rowkeyinput.value.trim(); if (rowkey === "") { status("The provlog query names its row key; the provenance answers one row at a time."); return; } pipelineselectedrow = rowkey; await renderpipelines(); }));
          node.append(transformform, provlogform);
        }
      }
      node.append(pipelines);
    }
    if (pipelinepreviewstate !== undefined) {
      const preview = await request({ kind: "pipeline", preview: { pipelineid: pipelinepreviewstate.pipelineid, ...(pipelinepreviewstate.sortcolumn !== undefined ? { sortcolumn: pipelinepreviewstate.sortcolumn, sortdirection: pipelinepreviewstate.sortdirection ?? "ascending" } : {}), ...(pipelinepreviewstate.filter !== undefined ? { filter: pipelinepreviewstate.filter } : {}) } }) as { preview?: { pipeline: { id: string; name: string; state: string; sink: string }; columns: Array<{ name: string; kind: string; width: number }>; rows: Array<{ key: string; values: Record<string, string>; stamped: boolean; transformed: string[]; deduplicated: boolean }>; total: number; sample?: { rows: number; strategy: string }; sampledpreview: { rows: number; strategy: string; readonly: boolean }; streamcursor: { pipelineid: string; offset: number; chunk: number; updatedat: number } } };
      if (preview.preview !== undefined) {
        const grid = document.createElement("div");
        grid.className = "actions";
        const filterinput = document.createElement("input");
        filterinput.placeholder = "Filter the preview locally";
        filterinput.setAttribute("aria-label", "Pipeline preview filter");
        filterinput.value = pipelinepreviewstate.filter ?? "";
        const filterbutton = button("Filter preview", async () => { const current = pipelinepreviewstate; if (current === undefined) { await renderpipelines(); return; } const query = filterinput.value.trim(); pipelinepreviewstate = { pipelineid: current.pipelineid, ...(current.sortcolumn !== undefined ? { sortcolumn: current.sortcolumn, sortdirection: current.sortdirection ?? "ascending" } : {}), ...(query !== "" ? { filter: query } : {}) }; await renderpipelines(); });
        grid.append(filterinput, filterbutton, ` — ${preview.preview.sampledpreview.rows} of ${preview.preview.total} row${preview.preview.total === 1 ? "" : "s"} sampled by ${preview.preview.sampledpreview.strategy} (read only preview) · cursor at offset ${preview.preview.streamcursor.offset} chunk ${preview.preview.streamcursor.chunk}.`);
        node.append(grid);
        const table = document.createElement("table");
        table.className = "pipetable";
        const head = document.createElement("tr");
        for (const column of preview.preview.columns) {
          const cell = document.createElement("th");
          const sortbutton = document.createElement("button");
          sortbutton.className = "secondary";
          sortbutton.textContent = `${column.name} (${column.kind})${pipelinepreviewstate?.sortcolumn === column.name ? pipelinepreviewstate?.sortdirection === "descending" ? " ↓" : " ↑" : ""}`;
          sortbutton.addEventListener("click", () => { void (async () => { pipelinepreviewstate = { pipelineid: preview.preview?.pipeline.id ?? "", sortcolumn: column.name, sortdirection: pipelinepreviewstate?.sortcolumn === column.name && pipelinepreviewstate?.sortdirection !== "descending" ? "descending" : "ascending", ...(pipelinepreviewstate?.filter !== undefined ? { filter: pipelinepreviewstate.filter } : {}) }; await renderpipelines(); })().catch(error => status(error instanceof Error ? error.message : String(error), true)); });
          cell.append(sortbutton);
          head.append(cell);
        }
        const markshead = document.createElement("th");
        markshead.textContent = "marks";
        head.append(markshead);
        table.append(head);
        for (const row of preview.preview.rows) {
          const tr = document.createElement("tr");
          for (const column of preview.preview.columns) {
            const cell = document.createElement("td");
            cell.textContent = row.values[column.name] ?? "";
            if (row.transformed.includes(column.name)) cell.dataset.mark = "transformed";
            tr.append(cell);
          }
          const marks = document.createElement("td");
          const markslist: string[] = [];
          if (row.stamped) markslist.push("stamped");
          for (const field of row.transformed) if (!markslist.includes(`transformed:${field}`)) markslist.push(`transformed:${field}`);
          if (row.deduplicated) markslist.push("deduplicated");
          for (const mark of markslist) {
            const badge = document.createElement("span");
            badge.className = "pipemark";
            badge.dataset.mark = mark.startsWith("transformed:") ? "transformed" : mark;
            badge.textContent = mark;
            marks.append(badge, " ");
          }
          if (pipelineselectedrow === row.key) tr.classList.add("selected");
          const keybutton = document.createElement("button");
          keybutton.className = "secondary";
          keybutton.textContent = "provlog";
          keybutton.addEventListener("click", () => { void (async () => { pipelineselectedrow = row.key; await renderpipelines(); })().catch(error => status(error instanceof Error ? error.message : String(error), true)); });
          marks.append(keybutton);
          tr.append(marks);
          table.append(tr);
        }
        node.append(table);
      }
    }
    if (pipelineselectedrow !== undefined) {
      const provenance = await request({ kind: "pipeline", provlog: { rowkey: pipelineselectedrow } }) as { provenance?: Array<{ id: string; operation: string; summary: string; at: number }> };
      const log = document.createElement("ul");
      for (const entry of provenance.provenance ?? []) log.append(Object.assign(document.createElement("li"), { textContent: `${new Date(entry.at).toISOString().slice(11, 19)} ${entry.operation}: ${entry.summary}` }));
      if ((provenance.provenance ?? []).length === 0) log.append(Object.assign(document.createElement("li"), { textContent: `The provlog holds no entry for the row ${pipelineselectedrow}.` }));
      node.append(log);
    }
    if (view.dedupereports.length > 0) {
      const reports = document.createElement("ul");
      for (const report of view.dedupereports.slice(0, 6)) reports.append(Object.assign(document.createElement("li"), { textContent: `Dedupe by ${report.keys.join(", ")}: removed ${report.removed} duplicate${report.removed === 1 ? "" : "s"}, kept ${report.kept} row${report.kept === 1 ? "" : "s"}${report.droppedkeys.length > 0 ? ` (${report.droppedkeys.slice(0, 4).join(", ")}${report.droppedkeys.length > 4 ? "…" : ""})` : ""}.` }));
      node.append(reports);
    }
    if (view.provlog.length > 0) {
      const entries = document.createElement("ul");
      for (const entry of view.provlog.slice(-8)) entries.append(Object.assign(document.createElement("li"), { textContent: `${new Date(entry.at).toISOString().slice(11, 19)} ${entry.operation} (${entry.rowkeys.length} row${entry.rowkeys.length === 1 ? "" : "s"}): ${entry.summary}` }));
      node.append(entries);
    }
    const choices = document.createElement("div");
    choices.className = "actions";
    const chunkinput = document.createElement("input");
    chunkinput.placeholder = "Stream chunk rows";
    chunkinput.type = "number";
    chunkinput.setAttribute("aria-label", "Pipeline stream chunk rows");
    chunkinput.value = view.settings.streamchunkrows !== undefined ? String(view.settings.streamchunkrows) : "";
    const retentioninput = document.createElement("input");
    retentioninput.placeholder = "Preview retention batches";
    retentioninput.type = "number";
    retentioninput.setAttribute("aria-label", "Pipeline preview retention batches");
    retentioninput.value = view.settings.previewretention !== undefined ? String(view.settings.previewretention) : "";
    const savebutton = button("Save pipeline choices", async () => {
      const settings: { streamchunkrows?: number; previewretention?: number } = {};
      if (chunkinput.value.trim() !== "") settings.streamchunkrows = Number.parseInt(chunkinput.value, 10);
      if (retentioninput.value.trim() !== "") settings.previewretention = Number.parseInt(retentioninput.value, 10);
      await request({ kind: "pipeline", settings });
      status("The pipeline choices saved; the chunk ceiling and the preview retention stay the user's choices.");
      await renderpipelines();
    });
    choices.append(chunkinput, retentioninput, savebutton);
    node.append(choices);
  } catch { node.textContent = "No data pipeline yet; the section shows the extract pipelines of the run with their stream progress in rows and bytes, the grid preview with its sortable columns and its stamped, transformed and deduplicated cell marks, the transform rules per field, the dedupe report with its dropped counts, the provlog provenance of a selected row and the resume control of an interrupted extraction."; }
}

/** Renders the 1.1.76 web api transports: the open subscriptions with their channels and last event ids, the poll loops with their cursors, the upload progress bars, the rate limit waits with their reset times, the cache hits per step, the correlated request pairs per run and the transport user choices for the poll timeout, the poll backoff, the subscription ceiling and the cache retention. */
async function renderwebapi(): Promise<void> {
  const node = document.querySelector<HTMLElement>("#webapitransports");
  if (!node) return;
  try {
    const view = await request({ kind: "webapi", view: true }) as { subscriptions: Array<{ id: string; runid: string; stepid: string; url: string; origin: string; state: string; events: number; names: string[]; lasteventid?: string; channel?: string }>; graphqlchannels: Array<{ id: string; runid: string; stepid: string; channel: string; operationid: string; results: number; errors: number; completed: boolean }>; polls: Array<{ stepid: string; entries: Array<{ poll: number; cursor?: string; status: number; stopped: boolean; reason: string }> }>; uploads: Array<{ stepid: string; latest?: { chunk: number; chunks: number; uploaded: number; bytes: number } }>; ratelimits: Array<{ origin: string; scope: string; remaining?: number; resetat: number; retryafter?: number }>; cache: Array<{ key: string; runid: string; url: string; method: string; status: number; hits: number; bytes: number; expiry?: number }>; correlation?: { runid: string; requests: number; pairs: number; map: Array<{ requestid: string; correlationid: string; stepid: string; url: string; method: string; paired: boolean; status?: number }> }; apicalls: Array<{ endpoint: string; method: string; origin: string; frequency?: number }>; settings: { polltimeout?: number; pollbackoff?: number; subscriptionlimit?: number; cacheretention?: number; apicallretention?: number } };
    node.replaceChildren();
    const opensubscriptions = view.subscriptions.filter(record => record.state === "open").length;
    const headline = document.createElement("p");
    headline.textContent = `Transports: ${opensubscriptions} open subscription${opensubscriptions === 1 ? "" : "s"} of ${view.subscriptions.length} · ${view.graphqlchannels.filter(channel => !channel.completed).length} live graphql channel${view.graphqlchannels.filter(channel => !channel.completed).length === 1 ? "" : "s"} · ${view.polls.length} poll loop${view.polls.length === 1 ? "" : "s"} · ${view.ratelimits.length} rate directive${view.ratelimits.length === 1 ? "" : "s"} · ${view.cache.length} cache entr${view.cache.length === 1 ? "y" : "ies"} with ${view.cache.reduce((total, entry) => total + entry.hits, 0)} hit${view.cache.reduce((total, entry) => total + entry.hits, 0) === 1 ? "" : "s"}${view.correlation !== undefined ? ` · ${view.correlation.pairs} of ${view.correlation.requests} request pairs joined` : ""}.`;
    node.append(headline);
    if (view.subscriptions.length > 0) {
      const subscriptions = document.createElement("ul");
      for (const record of view.subscriptions.slice(0, 12)) {
        const row = document.createElement("li");
        const badge = document.createElement("span");
        badge.className = "transportmark";
        badge.dataset.state = record.state === "open" ? "live" : record.state;
        badge.textContent = record.state;
        row.append(badge, ` ${record.url} — ${record.events} event${record.events === 1 ? "" : "s"}${record.names.length > 0 ? ` on ${record.names.slice(0, 4).join(", ")}` : ""}${record.lasteventid !== undefined ? ` · last event id ${record.lasteventid}` : ""}${record.channel !== undefined ? ` · channel ${record.channel}` : ""}`);
        if (record.state === "open") row.append(" ", button("Cancel", async () => { await request({ kind: "webapi", cancel: { id: record.id } }); status(`The transport ${record.id} cancelled; the channel closed cleanly and the run state machine saw it.`); await renderwebapi(); }));
        subscriptions.append(row);
      }
      node.append(subscriptions);
    }
    if (view.graphqlchannels.length > 0) {
      const channels = document.createElement("ul");
      for (const channel of view.graphqlchannels.slice(0, 12)) {
        const row = document.createElement("li");
        const badge = document.createElement("span");
        badge.className = "transportmark";
        badge.dataset.state = channel.completed ? "closed" : "live";
        badge.textContent = channel.completed ? "complete" : "live";
        row.append(badge, ` ${channel.channel} — ${channel.results} result${channel.results === 1 ? "" : "s"}${channel.errors > 0 ? `, ${channel.errors} error${channel.errors === 1 ? "" : "s"}` : ""} on operation ${channel.operationid}`);
        channels.append(row);
      }
      node.append(channels);
    }
    if (view.polls.length > 0) {
      const polls = document.createElement("ul");
      for (const poll of view.polls) {
        const latest = poll.entries[poll.entries.length - 1];
        const row = document.createElement("li");
        row.textContent = `Poll ${poll.stepid}: ${poll.entries.length} exchange${poll.entries.length === 1 ? "" : "s"}${latest !== undefined ? `, cursor ${latest.cursor ?? "start"}, status ${latest.status}${latest.stopped ? `, stopped — ${latest.reason}` : ""}` : ""}.`;
        polls.append(row);
      }
      node.append(polls);
    }
    if (view.uploads.length > 0) {
      for (const upload of view.uploads) {
        if (upload.latest === undefined) continue;
        const progress = document.createElement("progress");
        progress.max = upload.latest.chunks;
        progress.value = upload.latest.chunk;
        progress.setAttribute("aria-label", `Upload progress of step ${upload.stepid}`);
        const label = document.createElement("p");
        label.textContent = `Upload ${upload.stepid}: chunk ${upload.latest.chunk} of ${upload.latest.chunks}, ${upload.latest.uploaded} of ${upload.latest.bytes} bytes streamed without buffering the whole payload.`;
        node.append(progress, label);
      }
    }
    if (view.ratelimits.length > 0) {
      const waits = document.createElement("ul");
      for (const directive of view.ratelimits.slice(0, 12)) {
        const row = document.createElement("li");
        const badge = document.createElement("span");
        badge.className = "transportmark";
        badge.dataset.state = "rate";
        badge.textContent = "rate delayed";
        const remaining = directive.remaining !== undefined ? `${directive.remaining} remaining, ` : "";
        row.append(badge, ` ${directive.origin} (${directive.scope}) — ${remaining}resets ${new Date(directive.resetat).toLocaleTimeString()}${directive.retryafter !== undefined ? `, retry after ${directive.retryafter}ms` : ""}.`);
        waits.append(row);
      }
      node.append(waits);
    }
    if (view.cache.length > 0) {
      const cache = document.createElement("ul");
      for (const entry of view.cache.slice(0, 12)) {
        const row = document.createElement("li");
        const badge = document.createElement("span");
        badge.className = "transportmark";
        badge.dataset.state = "cached";
        badge.textContent = "cached";
        row.append(badge, ` ${entry.method} ${entry.url} — status ${entry.status}, ${entry.hits} hit${entry.hits === 1 ? "" : "s"}, ${entry.bytes} byte${entry.bytes === 1 ? "" : "s"}${entry.expiry !== undefined ? `, expires ${new Date(entry.expiry).toLocaleTimeString()}` : ", no expiry header"}.`);
        cache.append(row);
      }
      node.append(cache);
    }
    if (view.correlation !== undefined && view.correlation.map.length > 0) {
      const pairs = document.createElement("ul");
      for (const request of view.correlation.map.slice(0, 12)) {
        const row = document.createElement("li");
        row.textContent = `${request.requestid} → ${request.method} ${request.url} (step ${request.stepid})${request.paired ? ` joined with status ${request.status ?? "?"}` : " awaiting its response"}.`;
        pairs.append(row);
      }
      const exportbutton = button("Export correlation map", async () => { await request({ kind: "webapi", correlation: { runid: view.correlation?.runid ?? "" } }); status(`The correlation map of ${view.correlation?.requests ?? 0} requests exported to the audit trail; the mapping stays read only inside the run.`); await renderwebapi(); });
      node.append(pairs, exportbutton);
    }
    if (view.apicalls.length > 0) {
      const observed = document.createElement("ul");
      for (const call of view.apicalls.slice(0, 12)) {
        const row = document.createElement("li");
        row.textContent = `${call.method} ${call.endpoint}${call.frequency !== undefined ? ` — ${call.frequency} call${call.frequency === 1 ? "" : "s"} observed` : ""} (read only observation).`;
        observed.append(row);
      }
      node.append(observed);
    }
    const choices = document.createElement("form");
    choices.className = "actions";
    const timeoutinput = document.createElement("input");
    timeoutinput.placeholder = `Poll timeout ms${view.settings.polltimeout !== undefined ? ` (${view.settings.polltimeout})` : ""}`;
    timeoutinput.setAttribute("aria-label", "Web api poll timeout in milliseconds");
    const backoffinput = document.createElement("input");
    backoffinput.placeholder = `Poll backoff ms${view.settings.pollbackoff !== undefined ? ` (${view.settings.pollbackoff})` : ""}`;
    backoffinput.setAttribute("aria-label", "Web api poll backoff in milliseconds");
    const limitinput = document.createElement("input");
    limitinput.placeholder = `Subscription ceiling${view.settings.subscriptionlimit !== undefined ? ` (${view.settings.subscriptionlimit})` : ""}`;
    limitinput.setAttribute("aria-label", "Web api open subscription ceiling");
    const retentioninput = document.createElement("input");
    retentioninput.placeholder = `Cache retention entries${view.settings.cacheretention !== undefined ? ` (${view.settings.cacheretention})` : ""}`;
    retentioninput.setAttribute("aria-label", "Web api cache retention in entries per run");
    choices.append(timeoutinput, backoffinput, limitinput, retentioninput, " ", button("Save transport choices", async () => {
      const settings: Record<string, number> = {};
      if (timeoutinput.value.trim() !== "") settings.polltimeout = Number(timeoutinput.value.trim());
      if (backoffinput.value.trim() !== "") settings.pollbackoff = Number(backoffinput.value.trim());
      if (limitinput.value.trim() !== "") settings.subscriptionlimit = Number(limitinput.value.trim());
      if (retentioninput.value.trim() !== "") settings.cacheretention = Number(retentioninput.value.trim());
      await request({ kind: "webapi", settings });
      status("The transport choices saved; the poll timeout, the poll backoff, the subscription ceiling and the cache retention stay the user's choices with no code default.");
      await renderwebapi();
    }), button("Cache cleanup pass", async () => { const result = await request({ kind: "webapi", cachecleanup: true }) as { cleanup?: { expired: number; kept: number } }; status(`The cache cleanup pass expired ${result.cleanup?.expired ?? 0} entries and kept ${result.cleanup?.kept ?? 0} live ones; the expiry answers the response headers and the user policy.`); await renderwebapi(); }));
    node.append(choices);
  } catch { node.textContent = "No web api transport yet; the section shows the open subscriptions with their channels and last event ids, the poll loops with their cursors, the upload progress bars, the rate limit waits with their reset times, the cache hits per step, the correlated request pairs per run and the transport choices of the user."; }
}

/** The drawn region of the vision section: the x, y, width and height the user typed for one regionocr read; the state survives the section re-renders so the read control uses exactly the geometry the user drew. */
let visionregion: { x: string; y: string; width: string; height: string } = { x: "", y: "", width: "", height: "" };

/** Renders the 1.1.77 vision and ocr surface: the ocr text with its word box overlay, the vision descriptions beside their screenshots, the redaction masks editable on the capture with the proposals from the field shapes, the grounding candidates with their scores, the dom snapshots paired with the screenshot view, the frame reads with their positions, the visioncache hits, the pair queries, the vision cost ledger and the vision choices of the user. */
async function rendervisionocr(): Promise<void> {
  const node = document.querySelector<HTMLElement>("#visionocr");
  if (!node) return;
  try {
    const view = await request({ kind: "vision", view: true }) as { ocrs: Array<{ id: string; imageid: string; words: number; lines: number; paragraphs: number; characters: number; lowestconfidence?: number; at: number }>; visions: Array<{ id: string; imageid: string; regions: number; prompt: string; at: number }>; masks: Array<{ id: string; captureid: string; regions: number; reason: string; source: string; at: number }>; pairs: Array<{ id: string; imageid: string; domsnapshotid: string; capturetime: number; viewport: { width: number; height: number }; at: number }>; groundings: Array<{ id: string; descriptionid: string; matches: Array<{ label: string; text: string; selector: string; score: number }>; at: number }>; framereads: Array<{ selector: string; positionms: number; at: number }>; cache: Array<{ hash: string; kind: string; imageid: string; hits: number; at: number }>; cachehits: number; calls: Array<{ runid: string; kind: string; model: boolean; at: number }>; cost: { calls: number; modelcalls: number; units: number; description: string }; settings: { visionmodel?: string; visionendpoint?: string; visionretention?: number; visioncacheretention?: number; frameretention?: number; visionwaitbudget?: number } };
    node.replaceChildren();
    const headline = document.createElement("p");
    headline.textContent = `Vision: ${view.ocrs.length} ocr result${view.ocrs.length === 1 ? "" : "s"} · ${view.visions.length} description${view.visions.length === 1 ? "" : "s"} · ${view.masks.length} mask${view.masks.length === 1 ? "" : "s"} · ${view.pairs.length} pair${view.pairs.length === 1 ? "" : "s"} · ${view.groundings.length} grounding${view.groundings.length === 1 ? "" : "s"} · ${view.cachehits} cache hit${view.cachehits === 1 ? "" : "s"} · ${view.cost.modelcalls} model call${view.cost.modelcalls === 1 ? "" : "s"} of ${view.cost.calls}.`;
    node.append(headline);
    if (view.ocrs.length > 0) {
      const recognized = document.createElement("ul");
      for (const record of view.ocrs.slice(0, 6)) {
        const row = document.createElement("li");
        const badge = document.createElement("span");
        badge.className = "visionmark";
        badge.dataset.state = "recognized";
        badge.textContent = "recognized";
        row.append(badge, ` ${record.imageid} — ${record.words} word${record.words === 1 ? "" : "s"} in ${record.lines} line${record.lines === 1 ? "" : "s"} and ${record.paragraphs} paragraph${record.paragraphs === 1 ? "" : "s"} of ${record.characters} character${record.characters === 1 ? "" : "s"}${record.lowestconfidence !== undefined ? `, lowest confidence ${record.lowestconfidence}` : ""}.`);
        recognized.append(row);
      }
      node.append(recognized);
      const overlay = document.createElement("div");
      overlay.className = "wordoverlay";
      const caption = document.createElement("p");
      caption.className = "muted";
      caption.textContent = "The word boxes of the newest recognition render as dashed boxes; the low confidence words read red.";
      overlay.append(caption);
      node.append(overlay);
    }
    if (view.visions.length > 0) {
      const descriptions = document.createElement("ul");
      for (const record of view.visions.slice(0, 6)) {
        const row = document.createElement("li");
        const badge = document.createElement("span");
        badge.className = "visionmark";
        badge.dataset.state = "described";
        badge.textContent = "described";
        row.append(badge, ` ${record.imageid} — ${record.regions} labeled region${record.regions === 1 ? "" : "s"} for the prompt ${record.prompt}.`);
        descriptions.append(row);
      }
      node.append(descriptions);
    }
    if (view.groundings.length > 0) {
      const grounded = document.createElement("ul");
      for (const record of view.groundings.slice(0, 4)) {
        for (const match of record.matches.slice(0, 5)) {
          const row = document.createElement("li");
          const badge = document.createElement("span");
          badge.className = "visionmark";
          badge.dataset.state = "grounded";
          badge.textContent = "grounded";
          row.append(badge, ` ${match.label} → ${match.selector} (score ${match.score.toFixed(2)}, text ${match.text}).`);
          grounded.append(row);
        }
      }
      node.append(grounded);
    }
    if (view.pairs.length > 0) {
      const pairs = document.createElement("ul");
      for (const pair of view.pairs.slice(0, 6)) {
        const row = document.createElement("li");
        const badge = document.createElement("span");
        badge.className = "visionmark";
        badge.dataset.state = "paired";
        badge.textContent = "paired";
        row.append(badge, ` ${pair.imageid} + dom snapshot ${pair.domsnapshotid} at the ${pair.viewport.width} by ${pair.viewport.height} viewport.`);
        pairs.append(row);
      }
      node.append(pairs);
    }
    if (view.framereads.length > 0) {
      const frames = document.createElement("ul");
      for (const read of view.framereads.slice(0, 6)) frames.append(Object.assign(document.createElement("li"), { textContent: `Frame read of ${read.selector} at ${read.positionms} milliseconds.` }));
      node.append(frames);
    }
    if (view.cache.length > 0) {
      const cache = document.createElement("ul");
      for (const entry of view.cache.slice(0, 6)) {
        const row = document.createElement("li");
        const badge = document.createElement("span");
        badge.className = "visionmark";
        badge.dataset.state = "cached";
        badge.textContent = "cached";
        row.append(badge, ` ${entry.kind} of ${entry.imageid} — ${entry.hits} hit${entry.hits === 1 ? "" : "s"} on the hash ${entry.hash}.`);
        cache.append(row);
      }
      node.append(cache);
    }
    const regionform = document.createElement("div");
    regionform.className = "actions";
    const xinput = document.createElement("input");
    xinput.placeholder = "x";
    xinput.setAttribute("aria-label", "Ocr region x");
    xinput.value = visionregion.x;
    const yinput = document.createElement("input");
    yinput.placeholder = "y";
    yinput.setAttribute("aria-label", "Ocr region y");
    yinput.value = visionregion.y;
    const widthinput = document.createElement("input");
    widthinput.placeholder = "width";
    widthinput.setAttribute("aria-label", "Ocr region width");
    widthinput.value = visionregion.width;
    const heightinput = document.createElement("input");
    heightinput.placeholder = "height";
    heightinput.setAttribute("aria-label", "Ocr region height");
    heightinput.value = visionregion.height;
    regionform.append(xinput, yinput, widthinput, heightinput, " ", button("Read region", async () => {
      visionregion = { x: xinput.value.trim(), y: yinput.value.trim(), width: widthinput.value.trim(), height: heightinput.value.trim() };
      const region = { x: Number(visionregion.x), y: Number(visionregion.y), width: Number(visionregion.width), height: Number(visionregion.height) };
      if (Object.values(region).some(value => !Number.isFinite(value))) { status("The drawn region needs its x, y, width and height as numbers; draw the rectangle first."); return; }
      const result = await request({ kind: "vision", regionocr: { region } }) as { regionocr?: { words: number; lines: number; text: string } };
      await rendervisionocr();
      status(`The regionocr pass read ${result.regionocr?.words ?? 0} word${result.regionocr?.words === 1 ? "" : "s"} in ${result.regionocr?.lines ?? 0} line${result.regionocr?.lines === 1 ? "" : "s"} inside the drawn region; the boxes stay in absolute screenshot coordinates.`);
    }));
    node.append(regionform);
    const maskform = document.createElement("div");
    maskform.className = "actions";
    const captureinput = document.createElement("input");
    captureinput.placeholder = "Capture id to mask";
    captureinput.setAttribute("aria-label", "Redaction capture id");
    const reasoninput = document.createElement("input");
    reasoninput.placeholder = "Mask reason";
    reasoninput.setAttribute("aria-label", "Redaction reason");
    const regionmaskinput = document.createElement("input");
    regionmaskinput.placeholder = "x,y,width,height per region, semicolon separated";
    regionmaskinput.setAttribute("aria-label", "Redaction regions");
    maskform.append(captureinput, reasoninput, regionmaskinput, " ", button("Draw mask", async () => {
      const captureid = captureinput.value.trim();
      const reason = reasoninput.value.trim();
      const regions = regionmaskinput.value.split(";").map(part => part.split(",").map(value => Number(value.trim()))).filter(values => values.length === 4 && values.every(value => Number.isFinite(value))).map(([x, y, width, height]) => ({ x, y, width, height }));
      if (captureid === "" || reason === "" || regions.length === 0) { status("The redaction mask needs its capture id, its reason and at least one x,y,width,height region."); return; }
      await request({ kind: "vision", mask: { captureid, reason, regions } });
      await rendervisionocr();
      status(`The redaction mask of ${regions.length} region${regions.length === 1 ? "" : "s"} recorded on the capture ${captureid}; the mask records itself in the audit trail before any share.`);
    }), button("Propose masks", async () => {
      const captureid = captureinput.value.trim();
      if (captureid === "") { status("The mask proposal needs its capture id."); return; }
      const result = await request({ kind: "vision", propose: { captureid } }) as { proposals?: Array<{ reason: string }> };
      await rendervisionocr();
      status(`The mask proposal derived ${result.proposals?.length ?? 0} mask${result.proposals?.length === 1 ? "" : "s"} from the sensitive field shapes; the proposals wait for the user review.`);
    }));
    node.append(maskform);
    if (view.masks.length > 0) {
      const masks = document.createElement("ul");
      for (const mask of view.masks.slice(0, 6)) {
        const row = document.createElement("li");
        const badge = document.createElement("span");
        badge.className = "visionmark";
        badge.dataset.state = "masked";
        badge.textContent = "masked";
        row.append(badge, ` ${mask.captureid} — ${mask.regions} region${mask.regions === 1 ? "" : "s"} (${mask.source}): ${mask.reason}`);
        masks.append(row);
      }
      node.append(masks);
    }
    const choices = document.createElement("form");
    choices.className = "actions";
    const modelinput = document.createElement("input");
    modelinput.placeholder = `Vision model${view.settings.visionmodel !== undefined ? ` (${view.settings.visionmodel})` : ""}`;
    modelinput.setAttribute("aria-label", "Vision model");
    const endpointinput = document.createElement("input");
    endpointinput.placeholder = `Vision endpoint${view.settings.visionendpoint !== undefined ? ` (${view.settings.visionendpoint})` : ""}`;
    endpointinput.setAttribute("aria-label", "Vision model endpoint");
    const retentioninput = document.createElement("input");
    retentioninput.placeholder = `Vision retention records${view.settings.visionretention !== undefined ? ` (${view.settings.visionretention})` : ""}`;
    retentioninput.setAttribute("aria-label", "Vision retention in records");
    const cacheretentioninput = document.createElement("input");
    cacheretentioninput.placeholder = `Visioncache retention ms${view.settings.visioncacheretention !== undefined ? ` (${view.settings.visioncacheretention})` : ""}`;
    cacheretentioninput.setAttribute("aria-label", "Visioncache retention in milliseconds");
    choices.append(modelinput, endpointinput, retentioninput, cacheretentioninput, " ", button("Save vision choices", async () => {
      const settings: Record<string, number | string> = {};
      if (modelinput.value.trim() !== "") settings.visionmodel = modelinput.value.trim();
      if (endpointinput.value.trim() !== "") settings.visionendpoint = endpointinput.value.trim();
      if (retentioninput.value.trim() !== "") settings.visionretention = Number(retentioninput.value.trim());
      if (cacheretentioninput.value.trim() !== "") settings.visioncacheretention = Number(cacheretentioninput.value.trim());
      await request({ kind: "vision", settings });
      status("The vision choices saved; the model, the endpoint, the vision retention and the visioncache retention stay the user's choices with no code default.");
      await rendervisionocr();
    }), button("Cache cleanup pass", async () => { const result = await request({ kind: "vision", cachecleanup: true }) as { cachecleanup?: { expired: number; kept: number } }; status(`The visioncache cleanup pass expired ${result.cachecleanup?.expired ?? 0} entries and kept ${result.cachecleanup?.kept ?? 0} live ones; the expiry answers the user retention window.`); await rendervisionocr(); }));
    node.append(choices);
  } catch { node.textContent = "No vision pass yet; the section shows the ocr text with its word box overlay, the vision descriptions beside the screenshots, the redaction masks editable on the capture, the grounding candidates with their scores, the dom snapshot paired with the screenshot view and the vision choices of the user."; }
}

/** Renders the 1.1.78 capture forensics: the before and after captures side by side with their step links, the console timeline with its level filters, the net timeline with its status filters, the diff overlays with the changed regions and scores, the capture thumbnails of the run log, the timelapse frames with their playback, the baseline and export controls with the capture file name preview and the forensic choices of the user for the diff threshold, the timelapse interval, the thumbnail edge and the retention. */
async function renderforensics(): Promise<void> {
  const node = document.querySelector<HTMLElement>("#forensics");
  if (!node) return;
  try {
    const view = await request({ kind: "forensics", view: true }) as { pairs: Array<{ id: string; stepid: string; stepkind: string; preid?: string; postid?: string; beat?: number; at: number }>; consoleentries: Array<{ id: string; stepid: string; level: string; source: string; sequence: number; reload?: number; text: string; at: number }>; netentries: Array<{ id: string; stepid: string; url: string; method: string; status: number; correlationid: string; paired?: boolean; at: number }>; baselines: Array<{ id: string; captureid: string; pagestate: string; threshold?: number; at: number }>; diffs: Array<{ id: string; baselineid: string; captureid: string; score: number; regions: number; regression: boolean; at: number }>; thumbs: Array<{ id: string; captureid: string; width: number; height: number; at: number }>; lapse: { config?: { runid: string; interval: number; duration: number; startedat: number; state: string; stoppedat?: number }; frames: Array<{ captureid: string; sequence: number; at: number }> }; namerule?: { pattern: string; parts: string[] }; lastdiffscore?: number; choices: { diffthreshold?: number; timelapseinterval?: number; thumbnailedge?: number; forensicretention?: number } };
    node.replaceChildren();
    const headline = document.createElement("p");
    headline.textContent = `Forensics: ${view.pairs.length} before after pair${view.pairs.length === 1 ? "" : "s"} · ${view.consoleentries.length} console entr${view.consoleentries.length === 1 ? "y" : "ies"} · ${view.netentries.length} net entr${view.netentries.length === 1 ? "y" : "ies"} · ${view.diffs.filter(diff => diff.regression).length} regression${view.diffs.filter(diff => diff.regression).length === 1 ? "" : "s"} of ${view.diffs.length} diff${view.diffs.length === 1 ? "" : "s"} · ${view.thumbs.length} thumbnail${view.thumbs.length === 1 ? "" : "s"} · ${view.lapse.frames.length} lapse frame${view.lapse.frames.length === 1 ? "" : "s"}${view.lapse.config?.state === "running" ? " running" : ""}${view.lastdiffscore !== undefined ? ` · last diff score ${view.lastdiffscore}` : ""}.`;
    node.append(headline);
    if (view.pairs.length > 0) {
      const pairs = document.createElement("ul");
      for (const pair of view.pairs.slice(0, 8)) {
        const row = document.createElement("li");
        const badge = document.createElement("span");
        badge.className = "forensicsmark";
        badge.dataset.state = pair.preid !== undefined ? "paired" : "post";
        badge.textContent = pair.preid !== undefined ? "before after" : "post only";
        row.append(badge, ` ${pair.stepkind} step ${pair.stepid}: pre ${pair.preid ?? "skipped (read only)"} → post ${pair.postid ?? "none"}${pair.beat !== undefined ? ` on beat ${pair.beat}` : ""}.`);
        pairs.append(row);
      }
      node.append(pairs);
    }
    if (view.consoleentries.length > 0) {
      const levels = [...new Set(view.consoleentries.map(entry => entry.level))];
      for (const level of levels) {
        const lines = document.createElement("ul");
        for (const entry of view.consoleentries.filter(line => line.level === level).slice(-6)) {
          const row = document.createElement("li");
          const badge = document.createElement("span");
          badge.className = "forensicsmark";
          badge.dataset.state = entry.level === "error" ? "error" : entry.level === "warn" ? "warning" : "log";
          badge.textContent = entry.level;
          row.append(badge, ` #${entry.sequence} of step ${entry.stepid || "none"}${entry.reload !== undefined ? ` after reload ${entry.reload}` : ""}: ${entry.text}`);
          lines.append(row);
        }
        node.append(lines);
      }
    }
    if (view.netentries.length > 0) {
      const nets = document.createElement("ul");
      for (const entry of view.netentries.slice(-8)) {
        const row = document.createElement("li");
        const badge = document.createElement("span");
        badge.className = "forensicsmark";
        badge.dataset.state = entry.status >= 400 || entry.status === 0 ? "error" : entry.status >= 300 ? "warning" : "ok";
        badge.textContent = String(entry.status);
        row.append(badge, ` ${entry.method} ${entry.url} of step ${entry.stepid || "none"}${entry.paired === true ? " (paired)" : " (unjoined)"} through ${entry.correlationid}.`);
        nets.append(row);
      }
      node.append(nets);
    }
    if (view.diffs.length > 0) {
      const diffs = document.createElement("ul");
      for (const diff of view.diffs.slice(0, 6)) {
        const row = document.createElement("li");
        const badge = document.createElement("span");
        badge.className = "forensicsmark";
        badge.dataset.state = diff.regression ? "regression" : "clean";
        badge.textContent = diff.regression ? "regression" : "score";
        row.append(badge, ` ${diff.captureid} vs baseline ${diff.baselineid}: score ${diff.score} with ${diff.regions} changed region${diff.regions === 1 ? "" : "s"}.`);
        diffs.append(row);
      }
      node.append(diffs);
    }
    if (view.thumbs.length > 0) {
      const thumbs = document.createElement("ul");
      for (const thumb of view.thumbs.slice(0, 8)) thumbs.append(Object.assign(document.createElement("li"), { textContent: `Thumbnail of ${thumb.captureid} at ${thumb.width} by ${thumb.height} pixels.` }));
      node.append(thumbs);
    }
    if (view.lapse.frames.length > 0 || view.lapse.config !== undefined) {
      const lapse = document.createElement("ul");
      lapse.append(Object.assign(document.createElement("li"), { textContent: `Timelapse ${view.lapse.config?.state ?? "none"}${view.lapse.config !== undefined ? ` on the ${view.lapse.config.interval} millisecond interval for ${view.lapse.config.duration} milliseconds` : ""} with ${view.lapse.frames.length} ordered frame${view.lapse.frames.length === 1 ? "" : "s"}.` }));
      for (const frame of view.lapse.frames.slice(0, 8)) lapse.append(Object.assign(document.createElement("li"), { textContent: `Frame ${frame.sequence} — capture ${frame.captureid}.` }));
      node.append(lapse);
      const playform = document.createElement("div");
      playform.className = "actions";
      playform.append(button("Play timelapse frames", async () => {
        const frames = view.lapse.frames;
        if (frames.length === 0) { status("The timelapse holds no frames yet; start the lapse first."); return; }
        status(`The timelapse plays ${frames.length} frame${frames.length === 1 ? "" : "s"} from ${frames[0]?.captureid} to ${frames[frames.length - 1]?.captureid} in their ordered sequence; the frames list above walks the playback.`);
        await renderforensics();
      }));
      node.append(playform);
    }
    const controls = document.createElement("div");
    controls.className = "actions";
    const captureinput = document.createElement("input");
    captureinput.placeholder = "Capture id for baseline or diff";
    captureinput.setAttribute("aria-label", "Forensic capture id");
    const stateinput = document.createElement("input");
    stateinput.placeholder = "Page state label for the baseline";
    stateinput.setAttribute("aria-label", "Diff baseline page state");
    const durationinput = document.createElement("input");
    durationinput.placeholder = `Timelapse duration ms${view.choices.timelapseinterval !== undefined ? ` (interval ${view.choices.timelapseinterval})` : " (set the interval first)"}`;
    durationinput.setAttribute("aria-label", "Timelapse duration in milliseconds");
    controls.append(captureinput, stateinput, durationinput, " ", button("Set diff baseline", async () => {
      const captureid = captureinput.value.trim();
      const pagestate = stateinput.value.trim();
      if (captureid === "" || pagestate === "") { status("The diff baseline needs its capture id and its page state label."); return; }
      await request({ kind: "forensics", baseline: { captureid, pagestate } });
      await renderforensics();
      status(`The diff baseline for ${pagestate} frozen on the capture ${captureid}; every sensitive step now compares against it.`);
    }), button("Run diffshot", async () => {
      const captureid = captureinput.value.trim();
      if (captureid === "") { status("The diffshot pass needs its capture id."); return; }
      const result = await request({ kind: "forensics", diff: { captureid } }) as { diff?: { score: number; regions: number; regression: boolean } };
      await renderforensics();
      status(`The diffshot pass scored ${result.diff?.score ?? 0} with ${result.diff?.regions ?? 0} changed region${(result.diff?.regions ?? 0) === 1 ? "" : "s"}${result.diff?.regression ? " and the visual regression flags" : ""}; the threshold stays the user's choice.`);
    }), button("Start timelapse", async () => {
      const duration = Number(durationinput.value.trim());
      if (!Number.isFinite(duration) || duration <= 0) { status("The timelapse needs its duration as a positive number of milliseconds."); return; }
      await request({ kind: "forensics", timelapse: { start: { duration } } });
      await renderforensics();
      status(`The timelapse started for ${duration} milliseconds on the configured interval; the lapse stops at the duration end, the plan completion or the stop.`);
    }), button("Stop timelapse", async () => {
      await request({ kind: "forensics", timelapse: { stop: true } });
      await renderforensics();
      status("The timelapse stopped; the ordered frames stay ready for the playback.");
    }), button("Export bundle", async () => {
      const result = await request({ kind: "forensics", export: { download: true } }) as { export?: { captures: number; provenance: number; names: Array<{ captureid: string; name: string }> } };
      await renderforensics();
      status(`The capture bundle exported ${result.export?.captures ?? 0} capture${(result.export?.captures ?? 0) === 1 ? "" : "s"} with ${result.export?.provenance ?? 0} provenance entries${(result.export?.names ?? []).length > 0 ? `; the preview names the first file ${result.export?.names[0]?.name}` : ""}.`);
    }), button("Cleanup pass", async () => {
      const result = await request({ kind: "forensics", cleanup: true }) as { cleanup?: { pruned: number; retention?: number } };
      await renderforensics();
      status(`The forensic cleanup pass pruned ${result.cleanup?.pruned ?? 0} record${(result.cleanup?.pruned ?? 0) === 1 ? "" : "s"}${result.cleanup?.retention !== undefined ? ` inside the user retention ${result.cleanup.retention}` : " with no retention configured so every record survives"}; no silent sweep ever prunes on its own.`);
    }));
    node.append(controls);
    const choices = document.createElement("form");
    choices.className = "actions";
    const thresholdinput = document.createElement("input");
    thresholdinput.placeholder = `Diff threshold 0..1${view.choices.diffthreshold !== undefined ? ` (${view.choices.diffthreshold})` : " (never flags)"}`;
    thresholdinput.setAttribute("aria-label", "Diff threshold");
    const intervalinput = document.createElement("input");
    intervalinput.placeholder = `Timelapse interval ms${view.choices.timelapseinterval !== undefined ? ` (${view.choices.timelapseinterval})` : ""}`;
    intervalinput.setAttribute("aria-label", "Timelapse interval in milliseconds");
    const edgeinput = document.createElement("input");
    edgeinput.placeholder = `Thumbnail edge px${view.choices.thumbnailedge !== undefined ? ` (${view.choices.thumbnailedge})` : " (capture size)"}`;
    edgeinput.setAttribute("aria-label", "Thumbnail edge in pixels");
    const retentioninput = document.createElement("input");
    retentioninput.placeholder = `Forensic retention records${view.choices.forensicretention !== undefined ? ` (${view.choices.forensicretention})` : " (every record kept)"}`;
    retentioninput.setAttribute("aria-label", "Forensic retention in records");
    const patterninput = document.createElement("input");
    patterninput.placeholder = `Capture naming pattern${view.namerule !== undefined ? ` (${view.namerule.pattern})` : ""}`;
    patterninput.setAttribute("aria-label", "Capture naming pattern");
    choices.append(thresholdinput, intervalinput, edgeinput, retentioninput, patterninput, " ", button("Save forensic choices", async () => {
      const settings: Record<string, number | string> = {};
      if (thresholdinput.value.trim() !== "") settings.diffthreshold = Number(thresholdinput.value.trim());
      if (intervalinput.value.trim() !== "") settings.timelapseinterval = Number(intervalinput.value.trim());
      if (edgeinput.value.trim() !== "") settings.thumbnailedge = Number(edgeinput.value.trim());
      if (retentioninput.value.trim() !== "") settings.forensicretention = Number(retentioninput.value.trim());
      if (patterninput.value.trim() !== "") { await request({ kind: "forensics", name: { pattern: patterninput.value.trim(), parts: ["plan", "step", "timestamp", "sequence"] } }); }
      if (Object.keys(settings).length > 0) await request({ kind: "forensics", settings });
      status("The forensic choices saved; the diff threshold, the timelapse interval, the thumbnail edge, the retention and the naming pattern stay the user's choices with no code default.");
      await renderforensics();
    }));
    node.append(choices);
  } catch { node.textContent = "No forensic evidence yet; the section shows the before and after captures side by side, the console timeline with its level filters, the net timeline with its status filters, the diff overlays with the changed regions, the capture thumbnails of the run log, the timelapse frames with their playback, the export preview with the capture file names and the forensic choices of the user."; }
}

/** Renders the 1.1.79 data minimization: the stored data inventory with its classes and sizes, the telemetry status fixed to off, the sync opt in per data class with its consent stamps and encrypted records, the purge controls with the typed confirmation, the exportall bundle with its scope picker and streaming chunks, the cookie jar state per run, the quarantine entries with their verdicts, the artifact cleanup schedule with the retention flags, the local rule fields that never leave the device and the minimization choices of the user. */

/**
 * Site bridge section of the 1.1.82 family: the socket status of the user configured relay, the pairing code with its expiry countdown, the chat task text the site sent, the plan review cards with their decision controls that return decisions to the extension review gate (the bridge never executes an action), and the offline queue depth with its replay control.
 */
async function renderbridge(): Promise<void> {
  const node = document.querySelector<HTMLElement>("#sitebridge");
  if (!node) return;
  try {
    const view = await request({ kind: "bridge", view: true }) as { status: { status: string; paired: boolean; queued: number }; pairing?: { code: string; countdown: { label: string; expired: boolean } }; session?: { id: string; origin: string; state: string; sent: number; received: number; rotations: number }; tokens: { live: number }; events: Array<{ id: string; kind: string; stream: string; opid: string; at: number }>; queue: { depth: number; total: number }; killswitch: boolean; consent: boolean };
    node.replaceChildren();
    const statusbadge = document.createElement("span");
    statusbadge.className = "bridgemark";
    statusbadge.dataset.state = view.status.status;
    statusbadge.textContent = view.status.status;
    const headline = document.createElement("p");
    headline.textContent = `Site bridge: ${view.status.status}${view.status.paired ? " and paired" : ""}${view.session !== undefined ? ` on the session ${view.session.id} of ${view.session.origin} (${view.session.sent} sent, ${view.session.received} received, ${view.session.rotations} token rotation${view.session.rotations === 1 ? "" : "s"})` : " with no session"} · ${view.tokens.live} live token${view.tokens.live === 1 ? "" : "s"} · ${view.queue.depth} queued frame${view.queue.depth === 1 ? "" : "s"}${view.killswitch ? " · kill switch engaged" : ""}${view.consent ? "" : " · consent not granted"}.`;
    headline.append(" ", statusbadge);
    node.append(headline);
    if (view.pairing !== undefined) {
      const pairing = document.createElement("p");
      pairing.textContent = `Pairing code ${view.pairing.code}: ${view.pairing.countdown.label}`;
      node.append(pairing);
    }
    const events = view;
    const chat = events.events.filter(event => event.kind === "chat").slice(0, 6);
    if (chat.length > 0) {
      const list = document.createElement("ul");
      for (const event of chat) list.append(Object.assign(document.createElement("li"), { textContent: `Chat on the ${event.stream} stream under ${event.opid} at ${new Date(event.at).toISOString().slice(11, 19)}.` }));
      node.append(list);
    }
    const proposals = events.events.filter(event => event.kind === "planproposal").slice(0, 4);
    if (proposals.length > 0) {
      const cards = document.createElement("ul");
      for (const proposal of proposals) {
        const row = document.createElement("li");
        const badge = document.createElement("span");
        badge.className = "bridgemark";
        badge.dataset.state = "review";
        badge.textContent = "review";
        row.append(badge, ` Plan proposal ${proposal.opid} on the ${proposal.stream} stream waits for the site review decision.`);
        const decisions = document.createElement("div");
        decisions.className = "actions";
        for (const decision of ["approved", "changes", "refused"] as const) {
          const button = document.createElement("button");
          button.className = decision === "approved" ? "" : "secondary";
          button.textContent = decision === "approved" ? "Approve" : decision === "changes" ? "Request changes" : "Refuse";
          button.addEventListener("click", () => { void (async () => { await request({ kind: "bridge", review: { proposalid: proposal.opid, decision, by: "extension sidepanel" } }); await renderbridge(); })().catch(() => { /* the next render surfaces the refusal */ }); });
          decisions.append(button);
        }
        row.append(decisions);
        cards.append(row);
      }
      node.append(cards);
    }
    const controls = document.createElement("div");
    controls.className = "actions";
    const proposebutton = document.createElement("button");
    proposebutton.textContent = "Propose current plan";
    proposebutton.addEventListener("click", () => { void (async () => { await request({ kind: "bridge", propose: {} }); await renderbridge(); })().catch(() => { /* the next render surfaces the refusal */ }); });
    const replaybutton = document.createElement("button");
    replaybutton.className = "secondary";
    replaybutton.textContent = "Replay offline queue";
    replaybutton.addEventListener("click", () => { void (async () => { await request({ kind: "bridge", queue: { replay: true } }); await renderbridge(); })().catch(() => { /* the next render surfaces the refusal */ }); });
    controls.append(proposebutton, replaybutton);
    node.append(controls);
  } catch (error) { node.textContent = error instanceof Error ? error.message : String(error); }
}

/**
 * Model gateways section of the 1.1.83 family: the provider adapters with their user configured base urls and consent stamps (every provider ships disabled and no cloud default applies — the ollamalocal adapter alone defaults to the localhost machine), the discovered model lists with the cache window, the chat that streams the provider answer token by token into the panel (the cursor poll appends every batch as it arrives and the cancel control stops the stream), the token budget with its warning state and per session totals, the cost estimates per provider and model, the capabilityad advertisement counts of the tool catalog and the per task prompt templates with their variable slots.
 */
async function rendergateways(): Promise<void> {
  const node = document.querySelector<HTMLElement>("#gateways");
  if (!node) return;
  try {
    const view = await request({ kind: "gateway", view: true }) as { configs: Array<{ providerid: string; kind: string; baseurl: string; pathprefix?: string; enabled: boolean; consented?: boolean; keyref?: { name: string }; keymask?: string; costpermilliontokens?: number; currency?: string; local: boolean }>; models: Array<{ providerid: string; models: Array<{ id: string; label?: string; contextwindow?: number; modalities?: string[] }>; fetchedat: number }>; chat: { source: string; provider?: string; model?: string; reason?: string }; chats: Array<{ requestid: string; providerid: string; kind: string; model: string; prompt: string; tokens: Array<{ seq: number; text: string; at: number }>; done: boolean }>; budget?: { maxtokens?: number; maxcost?: number; warnratio?: number }; usage: { totaltokens: number; cost: number; calls: number }; sessionusage?: { totaltokens: number; cost: number; calls: number }; estimates: Array<{ providerid: string; model: string; permillion: number; currency?: string; recordedtokens: number; recordedcost: number }>; capabilityad: { kind: string; tools: number; consent: number; requiredcapabilities: string[] }; warning: { warned: boolean; reason?: string }; cachewindow?: number; templates: Array<{ name: string; version: number; variables: string[] }> };
    node.replaceChildren();
    const head = document.createElement("p");
    head.textContent = `${view.configs.length} provider gateway${view.configs.length === 1 ? "" : "s"} · chat route: ${view.chat.provider !== undefined ? `${view.chat.provider}${view.chat.model !== undefined ? ` with ${view.chat.model}` : ""} (${view.chat.source})` : `unrouted — ${view.chat.reason ?? "the user picks the pair"}`} · ${view.usage.calls} model call${view.usage.calls === 1 ? "" : "s"} with ${view.usage.totaltokens} tokens${view.sessionusage !== undefined ? ` (${view.sessionusage.totaltokens} this session)` : ""}${view.warning.warned ? ` · budget warning: ${view.warning.reason ?? "threshold crossed"}` : ""}.`;
    node.append(head);
    const configsbox = document.createElement("details");
    configsbox.className = "sessiongroup";
    configsbox.open = true;
    const configsummary = document.createElement("summary");
    configsummary.textContent = `Provider gateways (${view.configs.length})`;
    configsbox.append(configsummary);
    for (const config of view.configs) {
      const row = document.createElement("div");
      row.className = "sessionrow";
      const info = document.createElement("p");
      info.textContent = `${config.providerid} · ${config.kind} · ${config.baseurl}${config.pathprefix !== undefined ? ` under ${config.pathprefix}` : ""} · ${config.enabled ? "enabled" : "disabled"}${config.consented === true ? " · consented" : config.local ? " · local runtime, no remote consent" : " · consent pending"}${config.keyref !== undefined ? ` · key ${config.keyref.name} in the vault` : " · no key"}${config.costpermilliontokens !== undefined ? ` · ${config.costpermilliontokens} per million tokens` : ""}.`;
      row.append(info);
      const actions = document.createElement("div");
      actions.className = "actions";
      const baseurlinput = document.createElement("input");
      baseurlinput.value = config.baseurl;
      baseurlinput.placeholder = config.local ? "localhost endpoint" : "user configured base url";
      const prefixinput = document.createElement("input");
      prefixinput.value = config.pathprefix ?? "";
      prefixinput.placeholder = "path prefix (optional)";
      const enablebox = document.createElement("input");
      enablebox.type = "checkbox";
      enablebox.checked = config.enabled;
      const enablelabel = document.createElement("label");
      enablelabel.append(enablebox, " enabled");
      const keyinput = document.createElement("input");
      keyinput.type = "password";
      keyinput.placeholder = "api key (stores in the vault)";
      actions.append(baseurlinput, " ", prefixinput, " ", enablelabel, " ", keyinput, " ", button("Save", async () => { await request({ kind: "gateway", config: { providerid: config.providerid, kind: config.kind, baseurl: baseurlinput.value, ...(prefixinput.value.trim() !== "" ? { pathprefix: prefixinput.value.trim() } : {}), enabled: enablebox.checked } }); status(`Saved the ${config.kind} gateway ${config.providerid}.`); await rendergateways(); }), " ", config.consented === true ? button("Withdraw consent", async () => { await request({ kind: "gateway", consent: { providerid: config.providerid, grant: false } }); status(`The consent of ${config.providerid} withdrew; no call leaves the machine.`); await rendergateways(); }) : config.local ? document.createTextNode("") : button("Consent", async () => { await request({ kind: "gateway", consent: { providerid: config.providerid, grant: true } }); status(`The consent of ${config.providerid} stamped; the first remote call may leave.`); await rendergateways(); }), " ", button("Store key", async () => { if (keyinput.value === "") throw new Error("Type the key material first; it stores behind the vault seam."); await request({ kind: "gateway", key: { providerid: config.providerid, value: keyinput.value, consent: true } }); keyinput.value = ""; status(`Stored the key of ${config.providerid} behind the vault; the surfaces show the mask only.`); await rendergateways(); }), " ", config.keyref !== undefined ? button("Revoke key", async () => { await request({ kind: "gateway", key: { providerid: config.providerid, revoke: true } }); status(`Revoked the key of ${config.providerid} with one click.`); await rendergateways(); }) : document.createTextNode(""), " ", button("Models", async () => { await request({ kind: "gateway", models: { providerid: config.providerid, refresh: true } }); status(`Refreshed the model list of ${config.providerid}.`); await rendergateways(); }), " ", button("Remove", async () => { await request({ kind: "gateway", config: { providerid: config.providerid, kind: config.kind, remove: true } }); status(`Removed the gateway ${config.providerid}.`); await rendergateways(); }));
      row.append(actions);
      const cached = view.models.find(entry => entry.providerid === config.providerid);
      if (cached !== undefined && cached.models.length > 0) {
        const list = document.createElement("p");
        list.textContent = `Models (${cached.models.length}): ${cached.models.slice(0, 8).map(model => `${model.id}${model.contextwindow !== undefined ? ` [${model.contextwindow} ctx]` : ""}${model.modalities !== undefined && model.modalities.length > 0 ? ` (${model.modalities.join("/")})` : ""}`).join(", ")}${cached.models.length > 8 ? " …" : ""}.`;
        row.append(list);
      }
      configsbox.append(row);
    }
    const addrow = document.createElement("div");
    addrow.className = "actions";
    const addid = document.createElement("input");
    addid.placeholder = "provider id";
    const addkind = document.createElement("select");
    for (const kind of ["openaicompat", "anthropicgateway", "geminigateway", "ollamalocal"]) { const option = document.createElement("option"); option.value = kind; option.textContent = kind; addkind.append(option); }
    const addbase = document.createElement("input");
    addbase.placeholder = "base url (empty leaves the ollama localhost default)";
    const addprefix = document.createElement("input");
    addprefix.placeholder = "path prefix (optional)";
    addrow.append(addid, " ", addkind, " ", addbase, " ", addprefix, " ", button("Add gateway", async () => { await request({ kind: "gateway", config: { providerid: addid.value, kind: addkind.value, baseurl: addbase.value, ...(addprefix.value.trim() !== "" ? { pathprefix: addprefix.value.trim() } : {}), enabled: false } }); status(`Added the ${addkind.value} gateway ${addid.value}; it stays disabled until you enable it.`); await rendergateways(); }));
    configsbox.append(addrow);
    node.append(configsbox);

    const chatbox = document.createElement("details");
    chatbox.className = "sessiongroup";
    chatbox.open = true;
    const chatsummary = document.createElement("summary");
    chatsummary.textContent = "Gateway chat";
    chatbox.append(chatsummary);
    const chatline = document.createElement("p");
    chatline.textContent = "The chat streams the provider answer token by token; the model proposes plan steps only and never executes a tool — every drafted step passes the same human review.";
    chatbox.append(chatline);
    const chatactions = document.createElement("div");
    chatactions.className = "actions";
    const chatprompt = document.createElement("input");
    chatprompt.placeholder = "prompt for the routed gateway";
    chatprompt.style.width = "60%";
    const chatmodel = document.createElement("input");
    chatmodel.placeholder = "model (empty uses the first discovered)";
    chatactions.append(chatprompt, " ", chatmodel, " ");
    const answer = document.createElement("p");
    answer.className = "gatewaystream";
    let cancelled = false;
    const sendbutton = button("Send", async () => {
      cancelled = false;
      answer.replaceChildren();
      const start = await request({ kind: "gateway", chat: { prompt: chatprompt.value, ...(chatmodel.value.trim() !== "" ? { model: chatmodel.value.trim() } : {}) } }) as { requestid: string; done: boolean; tokens: number; error?: { message: string; retryhint?: string } };
      if (start.error !== undefined) { answer.textContent = `The call failed: ${start.error.message} ${start.error.retryhint ?? ""}`; return; }
      let cursor = 0;
      let done = start.done && start.tokens === 0;
      let guard = 0;
      while (!done && !cancelled && guard < 600) {
        guard += 1;
        const batch = await request({ kind: "gateway", poll: { requestid: start.requestid, cursor } }) as { text: string; nextcursor: number; done: boolean; error?: { message: string } };
        if (batch.text !== "") answer.append(batch.text);
        cursor = batch.nextcursor;
        done = batch.done;
        if (batch.error !== undefined) { answer.append(` The call failed: ${batch.error.message}`); break; }
        if (!done && batch.text === "") await new Promise(resolve => setTimeout(resolve, 150));
      }
      if (cancelled) answer.append(" [cancelled]");
    });
    const cancelbutton = button("Cancel", async () => { cancelled = true; });
    cancelbutton.className = "secondary";
    chatactions.append(sendbutton, cancelbutton);
    chatbox.append(chatactions);
    chatbox.append(answer);
    if (view.chats.length > 0) {
      const recent = document.createElement("ul");
      for (const chat of view.chats.slice(0, 4)) recent.append(Object.assign(document.createElement("li"), { textContent: `${chat.providerid} (${chat.kind}) with ${chat.model}: ${chat.tokens.length} tokens${chat.done ? " · finished" : " · open"} — ${chat.prompt.slice(0, 80)}` }));
      chatbox.append(recent);
    }
    node.append(chatbox);

    const budgetbox = document.createElement("details");
    budgetbox.className = "sessiongroup";
    const budgetsummary = document.createElement("summary");
    budgetsummary.textContent = "Budget, cost estimates and capabilityad";
    budgetbox.append(budgetsummary);
    const budgetline = document.createElement("p");
    budgetline.textContent = `Token budget: ${view.usage.totaltokens} tokens of ${view.budget?.maxtokens !== undefined ? `${view.budget.maxtokens} ceiling` : "no ceiling"} at ${view.usage.cost.toFixed(4)} recorded cost${view.budget?.warnratio !== undefined ? ` with the warning threshold at ${Math.round(view.budget.warnratio * 100)} percent` : ""}${view.warning.warned ? ` — WARNING: ${view.warning.reason ?? "the threshold crossed"}` : ""}.`;
    budgetbox.append(budgetline);
    if (view.estimates.length > 0) {
      const list = document.createElement("ul");
      for (const estimate of view.estimates.slice(0, 6)) list.append(Object.assign(document.createElement("li"), { textContent: `${estimate.providerid} · ${estimate.model}: ${estimate.permillion} per million tokens${estimate.currency !== undefined ? ` ${estimate.currency}` : ""} — recorded ${estimate.recordedtokens} tokens at ${estimate.recordedcost.toFixed(4)}.` }));
      budgetbox.append(list);
    }
    const adline = document.createElement("p");
    adline.textContent = `Capabilityad of the ${view.capabilityad.kind} shape: ${view.capabilityad.tools} tools advertised with ${view.capabilityad.consent} consent declarations and the required capabilities ${view.capabilityad.requiredcapabilities.join(", ")} — the plan review gate rides every advertisement.`;
    budgetbox.append(adline);
    const windowrow = document.createElement("div");
    windowrow.className = "actions";
    const windowinput = document.createElement("input");
    windowinput.type = "number";
    windowinput.min = "1";
    windowinput.placeholder = "model cache window (ms)";
    if (view.cachewindow !== undefined) windowinput.value = String(view.cachewindow);
    windowrow.append(windowinput, " ", button("Save cache window", async () => { const value = Number.parseInt(windowinput.value, 10); if (!Number.isFinite(value)) throw new Error("Type the cache window in milliseconds."); await request({ kind: "gateway", cachewindow: value }); status("Saved the model cache window."); await rendergateways(); }), " ", button("Seed templates", async () => { await request({ kind: "gateway", templates: true }); status("Seeded the per task gateway templates into the prompt library."); await rendergateways(); }));
    budgetbox.append(windowrow);
    if (view.templates.length > 0) {
      const templates = document.createElement("p");
      templates.textContent = `Templates: ${view.templates.map(template => `${template.name} v${template.version} ({{${template.variables.join("}}, {{")}}})`).join(" · ")}.`;
      budgetbox.append(templates);
    }
    node.append(budgetbox);
  } catch (error) { node.textContent = error instanceof Error ? error.message : String(error); }
}

async function renderminimization(): Promise<void> {
  const node = document.querySelector<HTMLElement>("#minimization");
  if (!node) return;
  try {
    const view = await request({ kind: "minimization", view: true }) as { inventory: Array<{ key: string; dataclass: string; size: number; records: number }>; telemetry: { enabled: boolean; counters: string }; sync: { enabled: string[]; cadence?: number; consent: Array<{ dataclass: string; at: number }>; records: Array<{ id: string; classes: string[]; formattag: string; payloadhash: string; syncedat: number }> }; purge?: { scope: string[]; confirmation: string }; cleanup?: { classes: string[]; timing: string; at: number }; jars: Array<{ jarid: string; runid: string; cookies: number; sealed: boolean; sealedat?: number; expiresat?: number }>; quarantines: Array<{ id: string; path: string; reason: string; scan: string; status: string; at: number }>; localrules: Array<{ origin: string; fields: string[]; at: number }>; bundles: Array<{ id: string; records: number; bytes: number; downloadid?: string; at: number }>; retained: string[]; choices: { synccadence?: number; cleanupdelay?: number; jarexpiry?: number } };
    node.replaceChildren();
    const totalsize = view.inventory.reduce((total, entry) => total + entry.size, 0);
    const telemetrybadge = document.createElement("span");
    telemetrybadge.className = "minimizationmark";
    telemetrybadge.dataset.state = "local";
    telemetrybadge.textContent = "telemetry off";
    const headline = document.createElement("p");
    headline.textContent = `Minimization: ${view.inventory.length} stored famil${view.inventory.length === 1 ? "y" : "ies"} of ${totalsize} byte${totalsize === 1 ? "" : "s"} · sync ${view.sync.enabled.length > 0 ? `${view.sync.enabled.length} class${view.sync.enabled.length === 1 ? "" : "es"} opted in` : "off"} · ${view.sync.records.length} sync record${view.sync.records.length === 1 ? "" : "s"} · ${view.jars.length} cookie jar${view.jars.length === 1 ? "" : "s"} · ${view.quarantines.filter(entry => entry.status === "held").length} held file${view.quarantines.filter(entry => entry.status === "held").length === 1 ? "" : "s"} · ${view.retained.length} retained artifact${view.retained.length === 1 ? "" : "s"}.`;
    headline.append(" ", telemetrybadge);
    node.append(headline);
    if (view.inventory.length > 0) {
      const inventory = document.createElement("ul");
      for (const entry of view.inventory.slice(0, 8)) {
        const row = document.createElement("li");
        const badge = document.createElement("span");
        badge.className = "minimizationmark";
        badge.dataset.state = entry.dataclass === "audit" ? "encrypted" : "local";
        badge.textContent = entry.dataclass === "audit" ? "audit sealed" : "local";
        row.append(badge, ` ${entry.key}: ${entry.records} record${entry.records === 1 ? "" : "s"} of ${entry.size} byte${entry.size === 1 ? "" : "s"}.`);
        inventory.append(row);
      }
      node.append(inventory);
    }
    if (view.sync.enabled.length > 0 || view.sync.consent.length > 0) {
      const sync = document.createElement("ul");
      for (const consent of view.sync.consent.slice(0, 6)) {
        const row = document.createElement("li");
        const badge = document.createElement("span");
        badge.className = "minimizationmark";
        badge.dataset.state = "synced";
        badge.textContent = "synced";
        row.append(badge, ` ${consent.dataclass} opted in at ${new Date(consent.at).toISOString().slice(11, 19)}${view.sync.cadence !== undefined ? ` on the ${view.sync.cadence} millisecond cadence` : " with no cadence configured so every pass waits"}.`);
        sync.append(row);
      }
      for (const record of view.sync.records.slice(0, 4)) {
        sync.append(Object.assign(document.createElement("li"), { textContent: `Sync record ${record.id} of ${record.classes.join(", ")} under ${record.formattag} with the payload hash ${record.payloadhash}.` }));
      }
      node.append(sync);
    }
    if (view.jars.length > 0) {
      const jars = document.createElement("ul");
      for (const jar of view.jars.slice(0, 6)) {
        const row = document.createElement("li");
        const badge = document.createElement("span");
        badge.className = "minimizationmark";
        badge.dataset.state = jar.sealed ? "encrypted" : "local";
        badge.textContent = jar.sealed ? "sealed" : "open";
        row.append(badge, ` Jar ${jar.jarid} of the run ${jar.runid} with ${jar.cookies} cookie${jar.cookies === 1 ? "" : "s"}${jar.expiresat !== undefined ? ` expiring ${new Date(jar.expiresat).toISOString().slice(11, 19)}` : ""}.`);
        jars.append(row);
      }
      node.append(jars);
    }
    if (view.quarantines.length > 0) {
      const quarantines = document.createElement("ul");
      for (const entry of view.quarantines.slice(0, 6)) {
        const row = document.createElement("li");
        const badge = document.createElement("span");
        badge.className = "minimizationmark";
        badge.dataset.state = entry.status === "released" ? "synced" : entry.status === "deleted" ? "local" : "held";
        badge.textContent = entry.status;
        row.append(badge, ` ${entry.path} — ${entry.reason} (verdict ${entry.scan}).`);
        quarantines.append(row);
      }
      node.append(quarantines);
    }
    if (view.localrules.length > 0) {
      const rules = document.createElement("ul");
      for (const rule of view.localrules.slice(0, 6)) rules.append(Object.assign(document.createElement("li"), { textContent: `Local rule of ${rule.origin}: ${rule.fields.join(", ")} never leave the device.` }));
      node.append(rules);
    }
    if (view.bundles.length > 0) {
      const bundles = document.createElement("ul");
      for (const bundle of view.bundles.slice(0, 4)) bundles.append(Object.assign(document.createElement("li"), { textContent: `Exportall bundle ${bundle.id} of ${bundle.records} record${bundle.records === 1 ? "" : "s"} and ${bundle.bytes} byte${bundle.bytes === 1 ? "" : "s"}${bundle.downloadid !== undefined ? ` linked to download ${bundle.downloadid}` : ""}.` }));
      node.append(bundles);
    }
    if (view.cleanup !== undefined) node.append(Object.assign(document.createElement("p"), { className: "muted", textContent: `Cleanup schedule: the ${view.cleanup.classes.join(", ") || "no"} classes on the ${view.cleanup.timing} timing; the artifacts the user flags for retention stay.` }));
    const controls = document.createElement("div");
    controls.className = "actions";
    const classinput = document.createElement("input");
    classinput.placeholder = "Data classes to sync (runs, memory, captures, settings, provenance)";
    classinput.setAttribute("aria-label", "Sync data classes");
    const passphraseinput = document.createElement("input");
    passphraseinput.type = "password";
    passphraseinput.placeholder = "Sync passphrase (encryptsync derives the key)";
    passphraseinput.setAttribute("aria-label", "Sync passphrase");
    const typedinput = document.createElement("input");
    typedinput.placeholder = `Typed confirmation for the full purge${view.purge !== undefined ? ` (${view.purge.confirmation})` : ""}`;
    typedinput.setAttribute("aria-label", "Purge typed confirmation");
    const origininput = document.createElement("input");
    origininput.placeholder = "Origin for the local rule";
    origininput.setAttribute("aria-label", "Local rule origin");
    const fieldinput = document.createElement("input");
    fieldinput.placeholder = "Local rule fields, comma separated";
    fieldinput.setAttribute("aria-label", "Local rule fields");
    const retaininput = document.createElement("input");
    retaininput.placeholder = "Artifact ids to retain, comma separated";
    retaininput.setAttribute("aria-label", "Retained artifact ids");
    controls.append(classinput, passphraseinput, typedinput, origininput, fieldinput, retaininput, " ", button("Opt in sync", async () => {
      const classes = classinput.value.split(",").map(item => item.trim()).filter(item => item !== "");
      if (classes.length === 0) { status("The sync opt in lists its data classes; an empty enablement turns nothing on."); return; }
      const result = await request({ kind: "minimization", sync: { enable: classes, ...(passphraseinput.value !== "" ? { passphrase: passphraseinput.value } : {}) } }) as { sync?: { enabled: string[] } };
      await renderminimization();
      status(`The sync opt in enabled ${result.sync?.enabled.join(", ") ?? classes.join(", ")} with the consent stamp per class; the encryptsync pass ${passphraseinput.value !== "" ? "encrypted the payload with the derived key" : "refused without the passphrase"} — a sync without the passphrase never transports.`);
    }), button("Purge stored data", async () => {
      const typed = typedinput.value.trim();
      if (typed === "") { status("The purge needs the typed confirmation phrase; a purge nobody typed out never runs."); return; }
      const result = await request({ kind: "minimization", purge: { scope: ["runs", "memory", "captures", "settings", "provenance"], typed } }) as { purge?: { deleted: string[]; audithashespreserved: boolean } };
      await renderminimization();
      status(`The purge deleted ${result.purge?.deleted.length ?? 0} stored famil${(result.purge?.deleted.length ?? 0) === 1 ? "y" : "ies"} while the audit hashes ${result.purge?.audithashespreserved === true ? "survived" : "stayed sealed"}; every deleted key entered the audit trail.`);
    }), button("Export all", async () => {
      const result = await request({ kind: "minimization", exportall: { download: true, settings: true, chunksize: 4096 } }) as { exportall?: { runs: number; memory: number; captures: number; provenance: number; records: number; bytes: number; chunks?: number } };
      await renderminimization();
      status(`The exportall bundle carried ${result.exportall?.records ?? 0} record${(result.exportall?.records ?? 0) === 1 ? "" : "s"} of ${result.exportall?.bytes ?? 0} byte${(result.exportall?.bytes ?? 0) === 1 ? "" : "s"}${result.exportall?.chunks !== undefined ? ` streamed in ${result.exportall.chunks} chunk${result.exportall.chunks === 1 ? "" : "s"}` : ""} through the download flow without a size cap.`);
    }), button("Seal jar", async () => {
      await request({ kind: "minimization", jar: { seal: {} } });
      await renderminimization();
      status("The cookie jar of the run sealed; a sealed jar refuses every write and the user expiry window marks its cleanup.");
    }), button("Quarantine verdict", async () => {
      const path = view.quarantines[0]?.path ?? "";
      if (path === "") { status("No quarantined file stands yet; the verdict branch needs its path."); return; }
      const result = await request({ kind: "minimization", quarantine: { verdict: { path } } }) as { quarantine?: { verdict: string; action: string } };
      await renderminimization();
      status(`The scanner verdict read ${result.quarantine?.verdict ?? "pending"} so the file ${result.quarantine?.action ?? "holds"}; only a clean verdict ever releases.`);
    }), button("Cleanup run artifacts", async () => {
      const result = await request({ kind: "minimization", cleanup: { run: true } }) as { cleanup?: { cleared: number; kept: number } };
      await renderminimization();
      status(`The cleanup pass cleared ${result.cleanup?.cleared ?? 0} artifact${(result.cleanup?.cleared ?? 0) === 1 ? "" : "s"} and kept ${result.cleanup?.kept ?? 0} — the retained artifacts the user flagged never leave.`);
    }), button("Add local rule", async () => {
      const origin = origininput.value.trim();
      const fields = fieldinput.value.split(",").map(item => item.trim()).filter(item => item !== "");
      if (origin === "" || fields.length === 0) { status("The local rule needs its origin and its field names."); return; }
      await request({ kind: "minimization", localrule: { add: { origin, fields } } });
      await renderminimization();
      status(`The fields ${fields.join(", ")} of ${origin} stay on the device; the localgate refuses any outbound payload that carries one.`);
    }), button("Flag retention", async () => {
      const ids = retaininput.value.split(",").map(item => item.trim()).filter(item => item !== "");
      if (ids.length === 0) { status("The retention flag lists its artifact ids."); return; }
      await request({ kind: "minimization", retain: { ids } });
      await renderminimization();
      status(`${ids.length} artifact${ids.length === 1 ? "" : "s"} flagged for retention; every cleanup pass keeps them.`);
    }));
    node.append(controls);
    const choices = document.createElement("form");
    choices.className = "actions";
    const cadenceinput = document.createElement("input");
    cadenceinput.placeholder = `Sync cadence ms${view.choices.synccadence !== undefined ? ` (${view.choices.synccadence})` : " (every pass off)"}`;
    cadenceinput.setAttribute("aria-label", "Sync cadence in milliseconds");
    const delayinput = document.createElement("input");
    delayinput.placeholder = `Cleanup delay ms${view.choices.cleanupdelay !== undefined ? ` (${view.choices.cleanupdelay})` : " (explicit pass only)"}`;
    delayinput.setAttribute("aria-label", "Cleanup delay in milliseconds");
    const expiryinput = document.createElement("input");
    expiryinput.placeholder = `Jar expiry ms${view.choices.jarexpiry !== undefined ? ` (${view.choices.jarexpiry})` : " (kept until purge)"}`;
    expiryinput.setAttribute("aria-label", "Jar expiry in milliseconds");
    const scheduleinput = document.createElement("input");
    scheduleinput.placeholder = `Cleanup classes${view.cleanup !== undefined ? ` (${view.cleanup.classes.join(", ")})` : ""}`;
    scheduleinput.setAttribute("aria-label", "Cleanup schedule classes");
    choices.append(cadenceinput, delayinput, expiryinput, scheduleinput, " ", button("Save minimization choices", async () => {
      const settings: Record<string, number> = {};
      if (cadenceinput.value.trim() !== "") settings.synccadence = Number(cadenceinput.value.trim());
      if (delayinput.value.trim() !== "") settings.cleanupdelay = Number(delayinput.value.trim());
      if (expiryinput.value.trim() !== "") settings.jarexpiry = Number(expiryinput.value.trim());
      if (Object.keys(settings).length > 0) await request({ kind: "minimization", settings });
      if (scheduleinput.value.trim() !== "") await request({ kind: "minimization", schedule: { classes: scheduleinput.value.split(",").map(item => item.trim()).filter(item => item !== ""), timing: "afterrun" } });
      status("The minimization choices saved; the sync cadence, the cleanup delay, the jar expiry and the cleanup schedule stay the user's choices with no code default.");
      await renderminimization();
    }));
    node.append(choices);
  } catch { node.textContent = "No minimization state yet; the section shows the stored data inventory with its classes and sizes, the telemetry status fixed to off, the sync opt in per data class with its consent stamps, the purge controls with the typed confirmation, the exportall bundle with its scope picker, the cookie jar state per run, the quarantine entries with their verdicts, the artifact cleanup schedule and the local rule fields that never leave the device."; }
}

/** Renders the 1.1.73 agent work: the spawn tree with its depth indicators, the aggregatereport with its per agent sections and conflict resolutions, the interleaved timeline with its per agent lanes, the lessonshare with its reuse counts, the arbitration cases with their verdicts and release controls, the priority lanes with their drag and drop order, the scaleworkers suggestions with their consent controls and the shared cost ledger with its per agent shares. */
async function renderagentwork(): Promise<void> {
  const node = document.querySelector<HTMLElement>("#agentwork");
  if (!node) return;
  try {
    const view = await request({ kind: "work", view: true }) as { spawns: Array<{ id: string; parentid: string; childid: string; parentname: string; childname: string; depth: number; objective?: string; at: number }>; depthlimit: { maxdepth?: number }; spawntree: Array<{ id: string; name: string; role: string; state: string; depth: number; children: Array<{ id: string; name: string; state: string; depth: number; objective?: string; children: unknown[] }> }>; aggregates: Array<{ subject: string; sections: Array<{ agentid: string; runid?: string; section: string; output: string }>; conflicts: Array<{ key: string; resolvedby?: string }>; state: string }>; interleave: Array<{ id: string; agentid: string; kind: string; summary: string; lane: string; at: number }>; lanes: Array<{ name: string; priority: number; agentids?: string[]; interactive?: boolean }>; lessons: Array<{ id: string; agentid: string; agentname: string; finding: string; origin: string; reusecount: number; recordedat: number }>; cases: Array<{ id: string; resource: string; origin: string; requesterids: string[]; state: string; verdict?: { holderagentid: string; lane: string; reason: string; grantedat: number }; openedat: number }>; load: Array<{ origin: string; concurrency: number; latency: number; sampledat: number }>; suggestions: Array<{ origin: string; suggestion: string; reason: string }>; workersperorigin: Array<{ origin: string; count: number }>; costs: { entries: Array<{ agentid: string; units: number; description: string; at: number }>; split: Array<{ agentid: string; units: number; share: number; sharedwith?: string[] }> }; maxworkersorigin?: number };
    node.replaceChildren();
    const headline = document.createElement("p");
    headline.textContent = `Work: ${view.spawns.length} spawn${view.spawns.length === 1 ? "" : "s"} · depth limit ${view.depthlimit.maxdepth !== undefined ? view.depthlimit.maxdepth : "unbounded"} · ${view.lessons.length} lesson${view.lessons.length === 1 ? "" : "s"} · ${view.cases.filter(workcase => workcase.state !== "released").length} open case${view.cases.filter(workcase => workcase.state !== "released").length === 1 ? "" : "s"} · ${view.costs.entries.length} cost entr${view.costs.entries.length === 1 ? "y" : "ies"}${view.maxworkersorigin !== undefined ? ` · worker ceiling ${view.maxworkersorigin} per origin` : ""}.`;
    node.append(headline);
    const spawnform = document.createElement("div");
    spawnform.className = "actions";
    const parentinput = document.createElement("input");
    parentinput.placeholder = "Parent agent id";
    parentinput.setAttribute("aria-label", "Spawn parent agent id");
    const objectiveinput = document.createElement("input");
    objectiveinput.placeholder = "Parent objective in plain language";
    objectiveinput.setAttribute("aria-label", "Spawn objective");
    const depthinput = document.createElement("input");
    depthinput.placeholder = "Depth";
    depthinput.type = "number";
    depthinput.setAttribute("aria-label", "Spawn depth");
    const spawnbutton = document.createElement("button");
    spawnbutton.className = "secondary";
    spawnbutton.textContent = "Spawn sub agent";
    spawnbutton.addEventListener("click", () => { void (async () => { const parentid = parentinput.value.trim(); const objective = objectiveinput.value.trim(); const depth = Number.parseInt(depthinput.value, 10); if (parentid === "" || objective === "") { status("The spawn names its parent and its parent objective; both stay user choices."); return; } if (!Number.isFinite(depth)) { status("The spawn carries its depth as the lineage level of the child."); return; } await request({ kind: "work", spawn: { parentid, objective, depth } }); status(`The sub agent spawned under ${parentid} at depth ${depth} through the agent endpoint contract.`); await renderagentwork(); })().catch(error => status(error instanceof Error ? error.message : String(error), true)); });
    spawnform.append(parentinput, objectiveinput, depthinput, spawnbutton);
    node.append(spawnform);
    if (view.spawntree.length > 0) {
      const tree = document.createElement("ul");
      type treenode = { name: string; state: string; depth: number; objective?: string; children: treenode[] | unknown[] };
      const rendertreenode = (entry: treenode, level: number): void => {
        const row = document.createElement("li");
        row.style.paddingLeft = `${level * 16}px`;
        const badge = document.createElement("span");
        badge.className = "fleetbadge";
        badge.textContent = `depth ${entry.depth}`;
        row.append(`${entry.name} (${entry.state}) `, badge, ...(entry.objective !== undefined ? [` — ${entry.objective}`] : []));
        tree.append(row);
        for (const child of entry.children) rendertreenode(child as treenode, level + 1);
      };
      for (const root of view.spawntree) rendertreenode(root, 0);
      node.append(tree);
    }
    if (view.aggregates.length > 0) {
      const aggregates = document.createElement("ul");
      for (const aggregate of view.aggregates) {
        const row = document.createElement("li");
        const byagent = aggregate.sections.map(section => `${section.agentid}${section.runid !== undefined ? ` (${section.runid})` : ""}`).join(", ");
        const conflicts = aggregate.conflicts.map(conflict => `${conflict.key}${conflict.resolvedby !== undefined ? ` resolved by ${conflict.resolvedby}` : " unresolved for the escalation"}`).join("; ");
        row.textContent = `${aggregate.subject} [${aggregate.state}] — sections from ${byagent}${conflicts !== "" ? ` — conflicts: ${conflicts}` : " — no conflict"}.`;
        aggregates.append(row);
      }
      node.append(aggregates);
    }
    if (view.interleave.length > 0) {
      const timeline = document.createElement("ol");
      for (const event of view.interleave.slice(0, 20)) {
        const row = document.createElement("li");
        const lanebadge = document.createElement("span");
        lanebadge.className = "fleetbadge";
        lanebadge.textContent = event.lane;
        row.append(`[${new Date(event.at).toISOString().slice(11, 19)}] ${event.agentid} · ${event.kind} `, lanebadge, ` — ${event.summary.slice(0, 120)}`);
        timeline.append(row);
      }
      node.append(timeline);
    }
    if (view.lessons.length > 0) {
      const lessons = document.createElement("ul");
      for (const lesson of view.lessons.slice(0, 12)) {
        const row = document.createElement("li");
        row.textContent = `${lesson.agentname} on ${lesson.origin} (reused ${lesson.reusecount}×): ${lesson.finding}`;
        lessons.append(row);
      }
      node.append(lessons);
    }
    if (view.cases.length > 0) {
      const cases = document.createElement("ul");
      for (const workcase of view.cases) {
        const row = document.createElement("li");
        row.textContent = `${workcase.resource} of ${workcase.origin} [${workcase.state}] — requesters ${workcase.requesterids.join(", ")}${workcase.verdict !== undefined ? ` — verdict: ${workcase.verdict.holderagentid} of the ${workcase.verdict.lane} lane` : ""}.`;
        if (workcase.state === "granted") {
          const releasebutton = button("Release verdict", async () => { await request({ kind: "work", release: { id: workcase.id } }); status(`The verdict of ${workcase.resource} released; the waiting requesters take their turn.`); await renderagentwork(); });
          row.append(" ", releasebutton);
        }
        cases.append(row);
      }
      node.append(cases);
    }
    if (view.lanes.length > 0) {
      const laneform = document.createElement("div");
      laneform.className = "actions";
      const laneheader = document.createElement("p");
      laneheader.textContent = `Lanes (drag to reorder): ${view.lanes.map(lane => `${lane.name} at ${lane.priority}${lane.interactive === true ? " interactive" : ""}`).join(", ")}.`;
      const laneorder: string[] = view.lanes.map(lane => lane.name);
      for (const lane of view.lanes) {
        const lanetag = document.createElement("span");
        lanetag.className = "fleetbadge";
        lanetag.textContent = lane.name;
        lanetag.draggable = true;
        lanetag.addEventListener("dragstart", event => { event.dataTransfer?.setData("text/plain", lane.name); });
        lanetag.addEventListener("dragover", event => { event.preventDefault(); });
        lanetag.addEventListener("drop", event => {
          event.preventDefault();
          const dragged = event.dataTransfer?.getData("text/plain") ?? "";
          if (dragged === "" || dragged === lane.name) return;
          const from = laneorder.indexOf(dragged);
          const to = laneorder.indexOf(lane.name);
          if (from === -1 || to === -1) return;
          laneorder.splice(to, 0, laneorder.splice(from, 1)[0] as string);
          void request({ kind: "work", lanes: { order: laneorder } }).then(() => status(`The lane order saved: ${laneorder.join(", ")}; the drain honors it.`)).then(() => renderagentwork()).catch(error => status(error instanceof Error ? error.message : String(error), true));
        });
        laneform.append(lanetag, " ");
      }
      node.append(laneheader, laneform);
    }
    if (view.suggestions.length > 0) {
      const suggestions = document.createElement("ul");
      for (const suggestion of view.suggestions) {
        const row = document.createElement("li");
        row.textContent = `${suggestion.origin}: ${suggestion.reason}`;
        if (suggestion.suggestion === "spawn" || suggestion.suggestion === "pause") {
          const consentbutton = button(`Consent to ${suggestion.suggestion}`, async () => { await request({ kind: "work", scale: { consent: { origin: suggestion.origin, suggestion: suggestion.suggestion } } }); status(`The user consented to the ${suggestion.suggestion} of ${suggestion.origin}.`); await renderagentwork(); });
          row.append(" ", consentbutton);
        }
        suggestions.append(row);
      }
      node.append(suggestions);
    }
    if (view.costs.split.length > 0) {
      const ledger = document.createElement("ul");
      for (const share of view.costs.split) {
        const row = document.createElement("li");
        row.textContent = `${share.agentid}: ${share.units} unit${share.units === 1 ? "" : "s"} total — own ${share.share}${share.sharedwith !== undefined ? `, shared with ${share.sharedwith.join(", ")}` : ""}.`;
        ledger.append(row);
      }
      node.append(ledger);
    }
  } catch { node.textContent = "No agent work yet; the section shows the spawn tree with its depth indicators, the aggregatereport with its per agent sections, the interleaved timeline with its lanes, the lessonshare with its reuse counts, the arbitration cases with their verdicts, the priority lanes with their drag and drop order, the scaleworkers suggestions and the shared cost ledger."; }
}
void rendersurfacereview().catch(() => { /* a failing review render retries on the next broadcast frame */ });

/** The sidepanel subscribes to logstream events and run state through the single broadcast channel. */
const surfacechannel: BroadcastChannel | undefined = typeof BroadcastChannel === "function" ? new BroadcastChannel("devthinksurfaces") : undefined;
surfacechannel?.addEventListener("message", (event: MessageEvent) => {
  const frame = event.data as { channel?: string };
  if (frame?.channel === "logstream") { if (!logstreampaused) void renderlogstream().catch(() => { /* a failing stream render keeps the last frame */ }); return; }
  void refresh().catch(() => { /* a failing refresh keeps the last rendered state */ });
  void rendersurfacereview().catch(() => { /* a failing review render retries on the next frame */ });
});

/** Applies the resolved contrast variant of the 2.0.2 final polish (roadmap rc.2 item 35): the layout preferences seam carries the contrastpreference the optionspage toggle persisted for this surface, and a high preference writes the high contrast token set over the --theme-* custom properties the darklight family already resolves — the mode still comes from the theme seam while the default preference keeps the shipped tokens untouched. */
void (async () => {
  try {
    const layout = await request({ kind: "surface", layout: { get: { surface: "sidepanel" } } }) as { layout?: { preferences?: { contrastpreference?: string } } };
    if (layout.layout?.preferences?.contrastpreference !== "high") return;
    const theme = await request({ kind: "views", theme: { resolve: true } }) as { appearance: { mode: "dark" | "light" } };
    applycontrasttheme(document.documentElement, document.body, contrasttokensof({ mode: theme.appearance.mode, contrast: "high" }), "high");
    status("The high contrast theme is active; the reading tokens answer WCAG AA against the surface.");
  } catch { /* a failing preference read keeps the shipped default tokens */ }
})();

/** The commandpalette of the sidepanel workspace: it opens from the keyboard shortcut in every surface, fuzzy searches the catalog and runs its commands through the command bus. */
const paletteinputnode = document.querySelector<HTMLInputElement>("#paletteinput");
const palettematchespanel = document.querySelector<HTMLElement>("#palettematches");

/** Renders the fuzzy palette matches of the workspace surface with the recent commands ranked first. */
async function renderworkspacepalette(): Promise<void> {
  if (!palettematchespanel) return;
  try {
    const result = await request({ kind: "surface", palette: { query: { text: paletteinputnode?.value ?? "" } } }) as { matches: Array<{ entry: { id: string; label: string; action: { command: string; surface: string } }; reason: string }> };
    palettematchespanel.replaceChildren();
    for (const match of result.matches.slice(0, 6)) {
      const item = document.createElement("button");
      item.type = "button";
      item.className = "secondary";
      item.textContent = `${match.entry.label} (${match.entry.action.surface})`;
      item.title = match.reason;
      item.addEventListener("click", () => { void runworkspacepalette(match.entry.action.command).catch(error => status(error instanceof Error ? error.message : String(error), true)); });
      palettematchespanel.append(item, " ");
    }
    if (result.matches.length === 0) palettematchespanel.textContent = "No command matches; the palette lists only the actions the current capability set allows.";
  } catch (error) { palettematchespanel.textContent = error instanceof Error ? error.message : String(error); }
}

/** Runs one workspace palette command: the navigation commands open their surface while every other command rides the command bus. */
async function runworkspacepalette(command: string): Promise<void> {
  await request({ kind: "surface", palette: { used: { command } } });
  if (command === "opendashboardpage" || command === "historysearch") { await chrome.tabs.create({ url: chrome.runtime.getURL("dashboardpage.html") }); status("The dashboardpage opened in a new tab."); return; }
  if (command === "openoptionspage") { await chrome.tabs.create({ url: chrome.runtime.getURL("optionspage.html") }); status("The optionspage opened in a new tab."); return; }
  if (command === "opentransparencypage") { await chrome.tabs.create({ url: chrome.runtime.getURL("transparencypage.html") }); status("The transparencypage opened in a new tab."); return; }
  if (command === "replayonboarding") { await request({ kind: "surface", onboarding: { replay: true } }); status("The onboarding walkthrough replays on the next popup open."); return; }
  if (command === "copyauditexcerpt") { const result = await request({ kind: "surface", logstream: { excerpt: {} } }) as { excerpt: string }; await navigator.clipboard?.writeText(result.excerpt).catch(() => { /* the clipboard write needs its reviewed clipboard consent */ }); status("The verified range copied as an audit excerpt."); return; }
  const route = await request({ kind: "surface", bus: { action: { surface: "sidepanel", command } } }) as { route: { reason: string } };
  status(route.route.reason);
  await refresh();
  await rendersurfacereview();
}
paletteinputnode?.addEventListener("input", () => { void renderworkspacepalette(); });
document.querySelector<HTMLButtonElement>("#paletteopen")?.addEventListener("click", () => { paletteinputnode?.focus(); void renderworkspacepalette(); });
document.addEventListener("keydown", event => { if (event.ctrlKey && event.key === ".") { event.preventDefault(); paletteinputnode?.focus(); void renderworkspacepalette(); } });
void renderworkspacepalette().catch(() => { /* a failing palette render keeps the empty matches panel */ });

/**
 * Data tab of the 1.1.65 family: the datagrid previews the extraction result with its inferred column types and its local filter, the exportmenu ships the csv with masked values only, the pickeroverlay starts its stability scored session from the sidepanel, the shotpanel previews a capture with its redaction verdicts and the compareviewer pairs the before and after captures of an executed write step.
 */
const gridnode = document.querySelector<HTMLElement>("#datagrid");
const gridqueryinput = document.querySelector<HTMLInputElement>("#gridquery");
const comparenode = document.querySelector<HTMLElement>("#compareviewer");
const shotpanelnode = document.querySelector<HTMLElement>("#shotpanel");
const pickernode = document.querySelector<HTMLElement>("#picker");
let opengrid: { columns: Array<{ field: string; type: string }>; rows: Array<{ values: Record<string, string> }> } | undefined;

/** Builds the datagrid preview from the rows of the current dataset store through the views command family. */
async function renderdatagrid(): Promise<void> {
  if (!gridnode) return;
  try {
    const view = await request({ kind: "context" }) as { datasets?: Array<{ id: string; name?: string; rows?: Array<Record<string, string>> }> };
    const rows = view.datasets?.[0]?.rows ?? [];
    if (rows.length === 0) { gridnode.textContent = "No extracted rows yet; run a read step and the grid previews its result."; return; }
    const result = await request({ kind: "views", datagrid: { view: { title: view.datasets?.[0]?.name ?? "Extraction result", rows } } }) as { view: { columns: Array<{ field: string; type: string }>; rows: Array<{ values: Record<string, string> }> } };
    opengrid = result.view;
    await rendergridrows(result.view, gridqueryinput?.value ?? "");
  } catch (error) { gridnode.textContent = error instanceof Error ? error.message : String(error); }
}

/** Renders the grid rows with the local filter applied inside the surface, through the 1.1.68 virtlist window when the user configured a row window, with the chunkextract cursor progress line of a big table extraction. */
async function rendergridrows(view: { columns: Array<{ field: string; type: string }>; rows: Array<{ values: Record<string, string> }> }, query: string): Promise<void> {
  if (!gridnode) return;
  const text = query.trim().toLowerCase();
  const rows = text === "" ? view.rows : view.rows.filter(row => Object.values(row.values).some(value => value.toLowerCase().includes(text)));
  gridnode.replaceChildren();
  const header = document.createElement("p");
  header.textContent = `${view.columns.length} inferred column${view.columns.length === 1 ? "" : "s"} (${view.columns.map(column => `${column.field}:${column.type}`).join(", ")}) — ${rows.length} row${rows.length === 1 ? "" : "s"}.`;
  gridnode.append(header);
  let windowed = rows;
  try {
    const perfview = await request({ kind: "perf", virtlist: { open: { surface: "datagrid", total: rows.length } } }) as { window: { start: number; end: number; total: number; recycled: number } };
    windowed = rows.slice(perfview.window.start, perfview.window.end);
    if (rows.length > windowed.length) {
      const windownote = document.createElement("p");
      windownote.textContent = `The virtlist window renders ${windowed.length} of ${rows.length} rows; the window recycles its row nodes during scroll while the full grid stays in memory.`;
      gridnode.append(windownote);
    }
  } catch { /* an unset window renders every row */ }
  try {
    const chunks = await request({ kind: "perf", chunk: {} }) as { cursors: Record<string, { tableid: string; fingerprint: string; rowindex: number; window: number; complete: boolean }> };
    const active = Object.values(chunks.cursors ?? {}).filter(cursor => !cursor.complete);
    if (active.length > 0) {
      const progress = document.createElement("p");
      progress.textContent = active.map(cursor => `Chunk cursor ${cursor.tableid}: ${cursor.rowindex} rows extracted, next window of ${cursor.window} rows, fingerprint ${cursor.fingerprint.slice(0, 8)}.`).join(" · ");
      gridnode.append(progress);
    }
  } catch { /* no cursor renders no line */ }
  const list = document.createElement("ul");
  list.className = "audit";
  for (const row of windowed) list.append(Object.assign(document.createElement("li"), { textContent: view.columns.map(column => `${column.field}=${row.values[column.field] ?? ""}`).join(" · ") }));
  gridnode.append(list);
}

/** Exports the open datagrid preview as csv through the masked exportmenu path. */
async function exportgrid(): Promise<void> {
  if (opengrid === undefined) { status("Open the datagrid preview first; the export runs on the grid view.", true); return; }
  const result = await request({ kind: "views", export: { run: { format: "csv", scope: "run" } } }) as { format: string; scope: string };
  status(`The ${result.format} export of the ${result.scope} scope runs with masked values only; the surface module renders the payload.`);
}

/** Starts one pickeroverlay session with stability scored candidates from the granted origin. */
async function startpicker(): Promise<void> {
  if (!pickernode) return;
  try {
    const result = await request({ kind: "views", picker: { start: { candidates: [] } } }) as { picker?: { id: string; origin: string; candidates: Array<{ selector: string; stabilityscore: number; reason: string }> } };
    const picker = result.picker;
    if (picker === undefined || picker.candidates.length === 0) { pickernode.textContent = "The picker session started with no candidate yet; the observed elements of the granted origin join the session as the read steps run."; return; }
    pickernode.replaceChildren();
    const list = document.createElement("ol");
    list.className = "audit";
    for (const candidate of picker.candidates) list.append(Object.assign(document.createElement("li"), { textContent: `${candidate.selector} (stability ${candidate.stabilityscore}) — ${candidate.reason}` }));
    pickernode.append(list);
  } catch (error) { pickernode.textContent = error instanceof Error ? error.message : String(error); }
}

/** Renders the compareviewer pairs and the shotpanel hint of the evidence family. */
async function renderevidence(): Promise<void> {
  if (comparenode) {
    try {
      const perfview = await request({ kind: "perf", virtlist: { open: { surface: "compareviewer", total: 0 } } }) as { window: { start: number; end: number; total: number; recycled: number } };
      comparenode.textContent = `Every executed write step pairs its before and after captures here; the slider overlays the two captures so you see exactly what the step changed${perfview.window.end > 0 ? ` while the virtlist window of ${perfview.window.end} row${perfview.window.end === 1 ? "" : "s"} keeps long capture histories smooth` : ""}.`;
    } catch { comparenode.textContent = "Every executed write step pairs its before and after captures here; the slider overlays the two captures so you see exactly what the step changed."; }
  }
  if (shotpanelnode) shotpanelnode.textContent = "The shotpanel previews the capture of a step with its redaction verdicts once a capture exists; the zoom and pan stay inside this surface.";
}

gridqueryinput?.addEventListener("input", () => { if (opengrid !== undefined) void rendergridrows(opengrid, gridqueryinput?.value ?? "").catch(() => { /* a failing window keeps the last rendered rows */ }); });
document.querySelector<HTMLButtonElement>("#gridbuild")?.addEventListener("click", () => { void renderdatagrid().catch(error => status(error instanceof Error ? error.message : String(error), true)); });
document.querySelector<HTMLButtonElement>("#gridexport")?.addEventListener("click", () => { void exportgrid().catch(error => status(error instanceof Error ? error.message : String(error), true)); });
document.querySelector<HTMLButtonElement>("#pickerstart")?.addEventListener("click", () => { void startpicker().catch(error => status(error instanceof Error ? error.message : String(error), true)); });
void renderdatagrid().catch(() => { /* an empty dataset keeps the empty state */ });
void renderevidence();

/**
 * Ecosystem section of the 1.1.66 family: the sidepanel lists the installed flowlibrary entries beside the native workflows with their fork and remove actions, the attentionfeed panel with its deep links and dismissals, the runreplay view that renders the stepstimeline with the replay cursor and the restored observation and capture per step, and the outputcompare view that renders two runs side by side with the divergence highlight.
 */
const ecosystemroot = document.querySelector<HTMLElement>("#ecosystem");
const replayruninput = document.querySelector<HTMLInputElement>("#replayrunid");
const compareruninputa = document.querySelector<HTMLInputElement>("#comparerunida");
const compareruninputb = document.querySelector<HTMLInputElement>("#comparerunidb");

/** Renders the ecosystem panel: the installed library entries, the attentionfeed, the background queue, the runreplay controls and the outputcompare controls. */
async function renderecosystem(): Promise<void> {
  if (!ecosystemroot) return;
  try {
    const view = await request({ kind: "ecosystem" }) as { library: Array<{ id: string; title: string; publisher: string; version: string; grants: string[]; sensitive: boolean; state: string }>; installed: Array<{ id: string; title: string; version: string; forkable: boolean }>; attention: Array<{ id: string; cause: string; severity: string; runid: string; summary: string; deeplink: string; at: number }>; backgroundruns: Array<{ id: string; workflowid: string; state: string; keepaliveheld: boolean; progress: string }> };
    ecosystemroot.replaceChildren();
    const attention = document.createElement("div");
    attention.className = "sessionrow";
    const attentionheadline = document.createElement("p");
    attentionheadline.textContent = `Attention feed: ${view.attention.length} entr${view.attention.length === 1 ? "y" : "ies"} need a human; the statusbadge counts them on the toolbar icon.`;
    attention.append(attentionheadline);
    for (const entry of view.attention.slice(0, 10)) {
      const row = document.createElement("p");
      row.textContent = `${entry.severity} ${entry.cause} — ${entry.summary} (${entry.deeplink})`;
      row.append(" ", button("Dismiss", async () => { await request({ kind: "ecosystem", attention: { dismiss: { id: entry.id } } }); await renderecosystem(); }));
      attention.append(row);
    }
    if (view.attention.length === 0) { const empty = document.createElement("p"); empty.textContent = "Nothing needs attention; gate waits, phishguard blocks, deferrals and failures all land here."; attention.append(empty); }
    ecosystemroot.append(attention);
    const library = document.createElement("div");
    library.className = "sessionrow";
    const libraryheadline = document.createElement("p");
    libraryheadline.textContent = `Installed flowlibrary entries: ${view.installed.length} beside the native workflows.`;
    library.append(libraryheadline);
    for (const entry of view.installed) {
      const row = document.createElement("p");
      row.textContent = `${entry.title} ${entry.version} (${entry.id})`;
      row.append(" ", button("Fork", async () => { const fork = await request({ kind: "ecosystem", library: { fork: { entryid: entry.id } } }) as { fork: { id: string } }; status(`The fork created the independent local workflow ${fork.fork.id}.`); await refresh(); }));
      row.append(" ", button("Remove", async () => { await request({ kind: "ecosystem", library: { remove: { entryid: entry.id } } }); status(`The entry ${entry.id} left the flowlibrary; its local forks stayed untouched.`); await renderecosystem(); }));
      library.append(row);
    }
    if (view.installed.length === 0) { const empty = document.createElement("p"); empty.textContent = "No installed library entry yet; browse the flowlibrary on the dashboardpage and install one behind its grant diff."; library.append(empty); }
    ecosystemroot.append(library);
    const background = document.createElement("div");
    background.className = "sessionrow";
    const backgroundheadline = document.createElement("p");
    backgroundheadline.textContent = `Background run queue: ${view.backgroundruns.length} entr${view.backgroundruns.length === 1 ? "y" : "ies"}.`;
    background.append(backgroundheadline);
    for (const run of view.backgroundruns.slice(0, 8)) background.append(Object.assign(document.createElement("p"), { textContent: `${run.state} — ${run.workflowid} — ${run.progress}${run.keepaliveheld ? " — keepalive held" : ""}` }));
    if (view.backgroundruns.length === 0) background.append(Object.assign(document.createElement("p"), { textContent: "No background run stands in the queue." }));
    ecosystemroot.append(background);
    const replay = document.createElement("div");
    replay.className = "sessionrow";
    const replayheadline = document.createElement("p");
    replayheadline.textContent = "Run replay: open a sealed run and walk its verified chain step by step with the restored observation and capture of each step.";
    replay.append(replayheadline);
    const replaycontrols = document.createElement("div");
    replaycontrols.className = "actions";
    replaycontrols.append(button("Open replay", async () => {
      const runid = replayruninput?.value.trim() ?? "";
      if (runid === "") throw new Error("The runreplay needs its recorded run id.");
      const result = await request({ kind: "ecosystem", replay: { open: { runid } } }) as { replay: { cursor: number; playing: boolean; steps: Array<{ stepid: string; index: number; summary: string; gateresolutions: Array<{ gateid: string; kind: string; resolution: string }> }> }; restored: { stepid: string; summary: string; observationversion?: number; captureid?: string } };
      status(`Replay of ${runid}: cursor at step ${result.replay.cursor} of ${result.replay.steps.length}${result.restored.observationversion !== undefined ? `, observation ${result.restored.observationversion}` : ""}${result.restored.captureid !== undefined ? `, capture ${result.restored.captureid}` : ""}.`);
      const timeline = document.createElement("ol");
      timeline.className = "audit";
      for (const step of result.replay.steps) timeline.append(Object.assign(document.createElement("li"), { textContent: `${step.index === result.replay.cursor ? "▶" : "·"} ${step.stepid} — ${step.summary}${step.gateresolutions.length > 0 ? ` [gates: ${step.gateresolutions.map(gate => `${gate.kind} ${gate.resolution}`).join(", ")}]` : ""}` }));
      replay.append(timeline);
    }));
    replaycontrols.append(button("Step forward", async () => { const runid = replayruninput?.value.trim() ?? ""; if (runid === "") throw new Error("The runreplay needs its recorded run id."); const result = await request({ kind: "ecosystem", replay: { move: { runid, direction: "forward" } } }) as { replay: { cursor: number; steps: unknown[] }; restored: { stepid: string; summary: string; observationversion?: number; captureid?: string } }; status(`Replay cursor at step ${result.replay.cursor} of ${result.replay.steps.length}: ${result.restored.summary}`); }));
    replaycontrols.append(button("Step backward", async () => { const runid = replayruninput?.value.trim() ?? ""; if (runid === "") throw new Error("The runreplay needs its recorded run id."); const result = await request({ kind: "ecosystem", replay: { move: { runid, direction: "backward" } } }) as { replay: { cursor: number; steps: unknown[] }; restored: { stepid: string; summary: string } }; status(`Replay cursor at step ${result.replay.cursor}: ${result.restored.summary}`); }));
    replaycontrols.append(button("Play", async () => { const runid = replayruninput?.value.trim() ?? ""; if (runid === "") throw new Error("The runreplay needs its recorded run id."); await request({ kind: "ecosystem", replay: { play: { runid, playing: true } } }); status(`The replay of ${runid} plays through the recorded steps.`); }));
    replaycontrols.append(button("Pause", async () => { const runid = replayruninput?.value.trim() ?? ""; if (runid === "") throw new Error("The runreplay needs its recorded run id."); await request({ kind: "ecosystem", replay: { play: { runid, playing: false } } }); status(`The replay of ${runid} paused at its cursor.`); }));
    replay.append(replaycontrols);
    ecosystemroot.append(replay);
    const compare = document.createElement("div");
    compare.className = "sessionrow";
    const compareheadline = document.createElement("p");
    compareheadline.textContent = "Output compare: two runs that share a task input signature stand side by side with the first divergence highlighted; the comparison never executes a step.";
    compare.append(compareheadline);
    const comparecontrols = document.createElement("div");
    comparecontrols.className = "actions";
    comparecontrols.append(button("Compare runs", async () => {
      const runida = compareruninputa?.value.trim() ?? "";
      const runidb = compareruninputb?.value.trim() ?? "";
      if (runida === "" || runidb === "") throw new Error("The outputcompare needs both run ids.");
      const result = await request({ kind: "ecosystem", compare: { open: { runida, runidb } } }) as { view: Array<{ stepid: string; agreement: string; summarya: string; summaryb: string; durationdelta: number; highlighted: boolean }>; metrics: { reason: string } };
      status(result.metrics.reason);
      const list = document.createElement("ol");
      list.className = "audit";
      for (const step of result.view) list.append(Object.assign(document.createElement("li"), { textContent: `${step.highlighted ? "◀ " : ""}${step.stepid} — ${step.agreement} — ${step.summarya} vs ${step.summaryb} (${step.durationdelta >= 0 ? "+" : ""}${step.durationdelta}ms)` }));
      compare.append(list);
    }));
    compare.append(comparecontrols);
    ecosystemroot.append(compare);
  } catch (error) { ecosystemroot.textContent = error instanceof Error ? error.message : String(error); }
}

void renderecosystem();
surfacechannel?.addEventListener("message", () => { void renderecosystem().catch(() => { /* a failing ecosystem refresh keeps the last rendered panel */ }); });
