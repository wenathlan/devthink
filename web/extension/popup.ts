import { hostpattern, normalizeendpoint } from "../../policy.js";
import { bridgestatuslabel } from "../../bridge.js";
import type {
  capabilityreport,
  captchahandoff,
  clipboardconsentrecord,
  consoleconsentrecord,
  dataset,
  dialogdecision,
  downloadrecord,
  keyholdstate,
  navqueues,
  navstate,
  quarantineentry,
  streamstate,
  tabbadge,
  waitprofilerecord,
} from "../../types.js";
import type { windowshape } from "../../commands.js";

type pagesignallike = { language?: string; template?: string; scrolllocked?: boolean; banner?: string };

const endpointinput = document.querySelector<HTMLInputElement>("#endpoint");
const statusnode = document.querySelector<HTMLElement>("#status");
const capabilitiesnode = document.querySelector<HTMLElement>("#capabilities");
const livenode = document.querySelector<HTMLElement>("#livelogic");
const navstatenode = document.querySelector<HTMLElement>("#navstate");
const windowlayoutnode = document.querySelector<HTMLElement>("#windowlayout");
const captchastatenode = document.querySelector<HTMLElement>("#captchastate");
const datasetstatenode = document.querySelector<HTMLElement>("#datasetstate");
const downloadstatenode = document.querySelector<HTMLElement>("#downloadstate");
const clipboardstatenode = document.querySelector<HTMLElement>("#clipboardstate");
const capturestatenode = document.querySelector<HTMLElement>("#capturestate");
const mediastatenode = document.querySelector<HTMLElement>("#mediastate");
const callstatenode = document.querySelector<HTMLElement>("#callstate");
const rulestatenode = document.querySelector<HTMLElement>("#rulestate");
const netstatenode = document.querySelector<HTMLElement>("#netstate");
const debugstatenode = document.querySelector<HTMLElement>("#debugstate");
const emulationstatenode = document.querySelector<HTMLElement>("#emulationstate");
const sessionstatenode = document.querySelector<HTMLElement>("#sessionstate");
const workflowstatenode = document.querySelector<HTMLElement>("#workflowstate");
const triggerstatenode = document.querySelector<HTMLElement>("#triggerstate");
const mcpstatenode = document.querySelector<HTMLElement>("#mcpstate");
const modelstatenode = document.querySelector<HTMLElement>("#modelstate");
const swarmstatenode = document.querySelector<HTMLElement>("#swarmstate");
const environmentstatenode = document.querySelector<HTMLElement>("#environmentstate");
const perfstatenode = document.querySelector<HTMLElement>("#perfstate");
const securitystatenode = document.querySelector<HTMLElement>("#securitystate");
const securitycontrols = document.querySelector<HTMLElement>("#securitycontrols");
const sessiongridstatenode = document.querySelector<HTMLElement>("#sessiongridstate");
const sessiongridcontrols = document.querySelector<HTMLElement>("#sessiongridcontrols");
const environmentcontrols = document.querySelector<HTMLElement>("#environmentcontrols");
const workflowcontrols = document.querySelector<HTMLElement>("#workflowcontrols");
const windowcontrols = document.querySelector<HTMLElement>("#windowcontrols");
const connectbutton = document.querySelector<HTMLButtonElement>("#connect");
const sessionbutton = document.querySelector<HTMLButtonElement>("#session");
const pausebutton = document.querySelector<HTMLButtonElement>("#pause");
const stopbutton = document.querySelector<HTMLButtonElement>("#stop");
const killswitchbutton = document.querySelector<HTMLButtonElement>("#killswitch");
const openbutton = document.querySelector<HTMLButtonElement>("#openpanel");

function status(message: string, error = false): void {
  if (statusnode) {
    statusnode.textContent = message;
    statusnode.dataset.state = error ? "error" : "ready";
  }
}
async function request(message: unknown): Promise<unknown> {
  const response = (await chrome.runtime.sendMessage(message)) as { ok: boolean; value?: unknown; error?: string };
  if (!response.ok) throw new Error(response.error);
  return response.value;
}

function pauselabel(paused: boolean): string {
  return paused ? "Resume session" : "Pause session";
}

/** Renders the live optional capability set the user has granted. */
function rendercapabilities(report?: capabilityreport): void {
  if (!capabilitiesnode) return;
  if (!report) {
    capabilitiesnode.textContent = "Capabilities unknown.";
    return;
  }
  const granted = [
    `tabs ${report.tabs ? "granted" : "absent"}`,
    `downloads ${report.downloads ? "granted" : "absent"}`,
    `clipboard read ${report.clipboardread ? "granted" : "absent"}`,
    `clipboard write ${report.clipboardwrite ? "granted" : "absent"}`,
  ];
  capabilitiesnode.textContent = `Optional capabilities: ${granted.join(" · ")}.`;
}

/** Renders the currently held keys and the dialogs answered by the reviewed policy. */
function renderlivestate(holds?: keyholdstate[], dialogs?: dialogdecision[], signals?: pagesignallike): void {
  if (!livenode) return;
  const held = (holds ?? []).filter((hold) => hold.releasedat === undefined);
  const heldsummary =
    held.length > 0 ? held.map((hold) => `${hold.key}${hold.holdid ? ` (${hold.holdid})` : ""}`).join(", ") : "none";
  const dialogsummary = (dialogs ?? []).length > 0 ? `${dialogs?.length} answered` : "none";
  const pages =
    signals && (signals.language !== undefined || signals.template !== undefined || signals.scrolllocked !== undefined)
      ? [
          signals.language !== undefined ? `language ${signals.language || "unknown"}` : "",
          signals.template !== undefined ? `template ${signals.template}` : "",
          signals.scrolllocked !== undefined ? `scroll lock ${signals.scrolllocked ? "on" : "off"}` : "",
        ]
          .filter(Boolean)
          .join(" · ")
      : "unknown";
  livenode.textContent = `Held keys: ${heldsummary} · Open dialogs answered: ${dialogsummary} · Page signals: ${pages}.`;
}

/** Renders the load phase, offline state, active wait profile and queued navigation targets of the session tab. */
function rendernavstate(state?: navstate, offline?: boolean, profile?: waitprofilerecord, queues?: navqueues): void {
  if (!navstatenode) return;
  const phase = state?.phase ? `load phase ${state.phase}` : "load phase unknown";
  const offlinestate = offline === undefined ? "connectivity unknown" : offline ? "offline" : "online";
  const wait = profile ? `wait profile ${profile.profile.signals.join("+")}` : "no wait profile";
  const queued = queues
    ? `queued targets ${queues.prefetch + queues.batchopen} (${queues.prefetch} prefetch · ${queues.batchopen} batch open)`
    : "no queued targets";
  navstatenode.textContent = `Navigation: ${phase} · ${offlinestate} · ${wait} · ${queued}.`;
}

/** Renders the current window layout and the quick window state buttons. */
function renderwindowlayout(windows?: windowshape[], badges?: tabbadge[]): void {
  if (!windowlayoutnode || !windowcontrols) return;
  windowlayoutnode.textContent =
    windows === undefined
      ? "Window layout: unknown."
      : `Window layout: ${windows.length} window${windows.length === 1 ? "" : "s"}${windows.length > 0 ? ` (${windows.map((item) => `${item.windowid}: ${item.state}${item.incognito ? " incognito" : ""}`).join(" · ")})` : ""} · ${new Set((badges ?? []).map((badge) => badge.tabid)).size} tab${new Set((badges ?? []).map((badge) => badge.tabid)).size === 1 ? "" : "s"} with active tasks.`;
  windowcontrols.replaceChildren();
  for (const item of (windows ?? []).slice(0, 4)) {
    for (const state of ["maximized", "minimized", "normal"] as const) {
      const quick = document.createElement("button");
      quick.type = "button";
      quick.className = "secondary";
      quick.textContent = `${state === "normal" ? "restore" : state} ${item.windowid}`;
      quick.addEventListener("click", () =>
        request({ kind: "windowstate", windowid: item.windowid, state })
          .then(() => {
            status(`Window ${item.windowid} set to ${state}.`);
            return restore();
          })
          .catch((error) => status(error instanceof Error ? error.message : String(error), true)),
      );
      windowcontrols.append(quick);
    }
  }
}

/** Renders the captcha handoff state while a plan waits for the user. */
function rendercaptchastate(captchas?: captchahandoff[]): void {
  if (!captchastatenode) return;
  const open = (captchas ?? []).find((handoff) => !handoff.resolved);
  if (open) {
    captchastatenode.dataset.state = "error";
    captchastatenode.textContent = `Captcha handoff open on ${open.origin}; the plan waits until you resolve it in the review panel.`;
    return;
  }
  delete captchastatenode.dataset.state;
  captchastatenode.textContent = "Captcha handoff: none.";
}

/** Renders the active dataset row count and the stream state of the session. */
function renderdatasetstate(datasets?: dataset[], streams?: streamstate[]): void {
  if (!datasetstatenode) return;
  const rows = (datasets ?? []).reduce((total, datasetvalue) => total + datasetvalue.rows.length, 0);
  const count = datasets?.length ?? 0;
  const stream = (streams ?? []).find((item) => item.done !== true) ?? (streams ?? [])[0];
  const streamsummary = stream
    ? ` · stream ${stream.name} chunk ${stream.chunk} of ${stream.chunks}${stream.done ? " complete" : ""}`
    : "";
  datasetstatenode.textContent =
    count === 0
      ? "Datasets: none collected yet."
      : `Datasets: ${count} collected (${rows} row${rows === 1 ? "" : "s"})${streamsummary}.`;
}

/** Renders the live batch download states and the quarantined files awaiting scan verdicts. */
function renderdownloadstate(downloads?: downloadrecord[], quarantines?: quarantineentry[]): void {
  if (!downloadstatenode) return;
  const states = (downloads ?? []).filter(
    (record) => record.state === "running" || record.state === "queued" || record.state === "paused",
  );
  const completed = (downloads ?? []).filter((record) => record.state === "complete").length;
  const failed = (downloads ?? []).filter((record) => record.state === "failed").length;
  const pending = (quarantines ?? []).filter((entry) => entry.scan === "pending").length;
  const parts = [
    states.length > 0 ? `${states.length} in flight (${states.map((record) => record.state).join(" · ")})` : "",
    completed > 0 ? `${completed} completed` : "",
    failed > 0 ? `${failed} failed` : "",
    pending > 0 ? `${pending} quarantined awaiting scan` : "",
  ].filter(Boolean);
  downloadstatenode.textContent =
    (downloads ?? []).length === 0 && pending === 0
      ? "Downloads: none."
      : `Downloads: ${parts.join(" · ") || "none active"}.`;
}

/** Renders the clipboard consent state while a read waits for the user approval. */
function renderclipboardstate(consents?: clipboardconsentrecord[]): void {
  if (!clipboardstatenode) return;
  const waiting = (consents ?? []).filter((record) => record.approved === undefined);
  if (waiting.length > 0) {
    clipboardstatenode.dataset.state = "error";
    clipboardstatenode.textContent = `Clipboard consent: ${waiting.length} read prompt${waiting.length === 1 ? "" : "s"} waiting for your approval in the review panel.`;
    return;
  }
  delete clipboardstatenode.dataset.state;
  clipboardstatenode.textContent = "Clipboard consent: none waiting.";
}

/** Renders the capture count of the active run beside the capture policy. */
function rendercapturestate(captures?: Array<{ id: string }>, policy?: string): void {
  if (!capturestatenode) return;
  const count = captures?.length ?? 0;
  const mode = policy ?? "manual";
  capturestatenode.textContent =
    count === 0 ? `Captures: none (policy ${mode}).` : `Captures: ${count} of the run (policy ${mode}).`;
}

/** Renders the observed request count of the active run beside the live channel and stream state. */
function rendernetstate(exchanges?: Array<{ id: string }>, channels?: Array<{ id: string; state: string }>): void {
  if (!netstatenode) return;
  const count = exchanges?.length ?? 0;
  const live = (channels ?? []).filter((channel) => channel.state === "open" || channel.state === "connecting").length;
  netstatenode.textContent = `Observed requests: ${count} of the run${live > 0 ? ` · ${live} live channel${live === 1 ? "" : "s"}` : ""}.`;
}

/** Renders the error count captured in the active run beside pending console capture consent prompts, the debugger attached badge of devtools sessions and the profiling badge of active profile or trace instruments. */
function renderdebugstate(
  timeline?: { errors?: Array<{ id: string }>; rejections?: Array<{ id: string }> },
  consoleconsents?: consoleconsentrecord[],
  debuggergrants?: Array<{ approved?: boolean; revokedat?: number }>,
  cdpattached?: number,
  profileactive?: number,
  sourcemapconsents?: Array<{ approved?: boolean; revokedat?: number }>,
): void {
  if (!debugstatenode) return;
  const errors = timeline?.errors?.length ?? 0;
  const rejections = timeline?.rejections?.length ?? 0;
  const waiting = (consoleconsents ?? []).filter((consent) => consent.approved === undefined).length;
  const debuggerwaiting = (debuggergrants ?? []).filter(
    (grant) => grant.approved === undefined && grant.revokedat === undefined,
  ).length;
  const attached = cdpattached ?? 0;
  const profiling = profileactive ?? 0;
  const sourcemapwaiting = (sourcemapconsents ?? []).filter(
    (consent) => consent.approved === undefined && consent.revokedat === undefined,
  ).length;
  debugstatenode.textContent =
    errors === 0 &&
    rejections === 0 &&
    waiting === 0 &&
    debuggerwaiting === 0 &&
    attached === 0 &&
    profiling === 0 &&
    sourcemapwaiting === 0
      ? "Timeline: no errors captured."
      : `Timeline: ${errors} error${errors === 1 ? "" : "s"}${rejections > 0 ? ` · ${rejections} rejection${rejections === 1 ? "" : "s"}` : ""} captured in the active run${waiting > 0 ? ` · ${waiting} console consent prompt${waiting === 1 ? "" : "s"} waiting` : ""}${debuggerwaiting > 0 ? ` · ${debuggerwaiting} debugger consent prompt${debuggerwaiting === 1 ? "" : "s"} waiting` : ""}${attached > 0 ? ` · debugger attached on ${attached} session${attached === 1 ? "" : "s"}` : ""}${profiling > 0 ? ` · profiling active on ${profiling} instrument${profiling === 1 ? "" : "s"}` : ""}${sourcemapwaiting > 0 ? ` · ${sourcemapwaiting} source map prompt${sourcemapwaiting === 1 ? "" : "s"} waiting` : ""}.`;
  if (errors > 0 || waiting > 0 || debuggerwaiting > 0 || sourcemapwaiting > 0) debugstatenode.dataset.state = "error";
  else delete debugstatenode.dataset.state;
  if (attached > 0) debugstatenode.dataset.debugger = "attached";
  else delete debugstatenode.dataset.debugger;
  if (profiling > 0) debugstatenode.dataset.profile = "active";
  else delete debugstatenode.dataset.profile;
}

/** Renders the active traffic rule count badge of controlled runs. */
function renderrulestate(activerules?: number, blocked?: number, mocked?: number): void {
  if (!rulestatenode) return;
  const rules = activerules ?? 0;
  rulestatenode.textContent =
    rules === 0
      ? "Traffic rules: none active."
      : `Traffic rules: ${rules} active of the run${blocked !== undefined && blocked > 0 ? ` · ${blocked} blocked request${blocked === 1 ? "" : "s"}` : ""}${mocked !== undefined && mocked > 0 ? ` · ${mocked} mocked response${mocked === 1 ? "" : "s"}` : ""}.`;
  if (rules > 0) rulestatenode.dataset.state = "controlled";
  else delete rulestatenode.dataset.state;
}

/** Renders the media state badge: the recording indicator of active recordings beside the stored media record count. */
function rendercallstate(calls?: Array<{ id: string }>, fetchconsents?: Array<{ approved?: boolean }>): void {
  if (!callstatenode) return;
  const count = calls?.length ?? 0;
  const waiting = (fetchconsents ?? []).filter((consent) => consent.approved === undefined).length;
  callstatenode.textContent = `Outbound calls: ${count} of the run${waiting > 0 ? ` · ${waiting} header consent prompt${waiting === 1 ? "" : "s"} waiting` : ""}.`;
}

function rendermediastate(
  media?: Array<{ id: string }>,
  recordingactive?: Array<{ id: string; kind: string }>,
  recordingconsents?: Array<{ approved?: boolean }>,
): void {
  if (!mediastatenode) return;
  const active = (recordingactive ?? []).length;
  const waiting = (recordingconsents ?? []).filter((record) => record.approved === undefined).length;
  const count = media?.length ?? 0;
  const recording =
    active > 0
      ? `● recording ${active} active capture${active === 1 ? "" : "s"}`
      : waiting > 0
        ? `recording consent: ${waiting} prompt${waiting === 1 ? "" : "s"} waiting`
        : "";
  mediastatenode.textContent = `Media: ${count} record${count === 1 ? "" : "s"}${recording ? ` · ${recording}` : ""}.`;
  if (active > 0) mediastatenode.dataset.state = "recording";
  else delete mediastatenode.dataset.state;
}

/** Renders the active emulation badge of the run: the layer names and the pending location consent prompts. */
function renderemulationstate(layers?: string[], locationconsents?: Array<{ approved?: boolean }>): void {
  if (!emulationstatenode) return;
  const active = layers ?? [];
  const waiting = (locationconsents ?? []).filter((consent) => consent.approved === undefined).length;
  emulationstatenode.textContent = `Emulation: ${active.length > 0 ? `${active.length} active layer${active.length === 1 ? "" : "s"} (${active.join(", ")})` : "no active layer"}${waiting > 0 ? ` · ${waiting} location consent prompt${waiting === 1 ? "" : "s"} waiting` : ""}.`;
  if (active.length > 0) emulationstatenode.dataset.emulated = "active";
  else delete emulationstatenode.dataset.emulated;
  if (waiting > 0) emulationstatenode.dataset.state = "error";
  else delete emulationstatenode.dataset.state;
}

/** Renders the saved session count and the auto snapshot state with its interval and count. */
function rendersessionstate(
  memory?: {
    records: Array<{ id: string; name: string }>;
    auto?: { period: number; maxsnapshots: number; expiry: number };
  },
  auto?: { interval: { period: number; maxsnapshots: number; expiry: number }; count: number },
): void {
  if (!sessionstatenode) return;
  const saved = memory?.records.length ?? 0;
  const interval = auto?.interval ?? memory?.auto;
  sessionstatenode.textContent = `Sessions: ${saved} saved${interval !== undefined ? ` · auto snapshot every ${interval.period} ms (${auto?.count ?? 0} of ${interval.maxsnapshots})` : " · no auto interval"}.`;
  if (interval !== undefined) sessionstatenode.dataset.auto = "active";
  else delete sessionstatenode.dataset.auto;
}

/** Renders the active workflow state with pause and cancel buttons, the count of workflows running in the background and the active loop iteration count of the running runs. */
function renderworkflowstate(
  runs?: Array<{ id: string; state: string; cursor: number; workflowid: string; dryrun?: boolean }>,
  control?: Array<{ runid: string; kind: string; loops?: Array<{ path: string }> }>,
): void {
  if (!workflowstatenode) return;
  const all = runs ?? [];
  const running = all.filter((run) => run.state === "running");
  const paused = all.filter((run) => run.state === "paused");
  const iterations = (control ?? [])
    .filter((decision) => decision.kind === "loop" && running.some((run) => run.id === decision.runid))
    .reduce((total, decision) => total + (decision.loops?.length ?? 0), 0);
  workflowstatenode.textContent = `Workflows: ${running.length} running in the background${paused.length > 0 ? ` · ${paused.length} paused` : ""}${running.length > 0 && iterations > 0 ? ` · loop iteration ${iterations}` : ""}${all.length > 0 ? ` · latest ${all[0]?.state ?? ""}` : " · none composed yet"}.`;
  if (running.length > 0) workflowstatenode.dataset.state = "active";
  else delete workflowstatenode.dataset.state;
  if (!workflowcontrols) return;
  workflowcontrols.replaceChildren();
  for (const run of [...running, ...paused]) {
    const controls = document.createElement("span");
    const pause = document.createElement("button");
    pause.className = "secondary";
    pause.textContent = run.state === "running" ? `Pause ${run.id.slice(0, 6)}` : `Resume ${run.id.slice(0, 6)}`;
    pause.disabled = false;
    pause.addEventListener("click", async () => {
      try {
        await request({ kind: run.state === "running" ? "pauseworkflowrun" : "resumeworkflowrun", runid: run.id });
        status(
          run.state === "running"
            ? "Workflow run paused at its checkpoint."
            : "Workflow run resumed from its checkpoint.",
        );
        await restore();
      } catch (error) {
        status(error instanceof Error ? error.message : String(error), true);
      }
    });
    const cancel = document.createElement("button");
    cancel.className = "danger";
    cancel.textContent = `Cancel ${run.id.slice(0, 6)}`;
    cancel.addEventListener("click", async () => {
      try {
        await request({ kind: "cancelworkflowrun", runid: run.id, reason: "popup cancel" });
        status("Workflow run cancelled with its reason recorded.");
        await restore();
      } catch (error) {
        status(error instanceof Error ? error.message : String(error), true);
      }
    });
    controls.append(pause, " ", cancel);
    workflowcontrols.append(controls);
  }
}

/** Renders the trigger layer: the armed rule count, the queued fires held while the session is paused and the button rule status of the toolbar click. */
/** Renders the mcp server running indicator of the agent protocol: the running state, the localhost bind, the connected clients, the paired count, the pending approval gates as notifications and the long tool progress of the in flight calls that announces itself while the panel stays hidden. */
/** Renders the active model per running task kind: every routed task kind shows its provider and model so the user reads which model drives which task. */
function rendermodelstate(state?: {
  providers: Array<{ id: string; name: string; status: string }>;
  tasks: Array<{ kind: string; provider?: string; model?: string }>;
  usage: { totaltokens: number; cost: number; calls: number };
}): void {
  if (!modelstatenode) return;
  if (!state) {
    modelstatenode.textContent = "Models: none connected.";
    return;
  }
  const routed = state.tasks.filter((task) => task.provider !== undefined);
  modelstatenode.textContent = `Models: ${
    routed.length > 0
      ? routed
          .slice(0, 3)
          .map((task) => `${task.kind} ${task.model}`)
          .join(" · ")
      : "no route yet"
  } · ${state.usage.calls} call${state.usage.calls === 1 ? "" : "s"} · ${state.usage.totaltokens} tokens.`;
}

/** Renders the swarm summary: the popup reads the agent count with the active, paused and stopped split, the claimed tasks of the shared queue, the elected leader and the held lock count, so the user reads the swarm at a glance. */
/** Renders the execution environment status of the running session: the environments of the open run, the keepalive heartbeat indicator, the offscreen capability state and the zombie warning with its reap action. */
function renderenvironmentstate(view?: {
  report: {
    environments: Array<{ stepid: string; environment: string }>;
    workers: number;
    keepalive?: { runid: string; state: string; beats: number; lastbeatat: number; portopen: boolean };
  };
  offscreengranted: boolean;
  parseoffload: boolean;
  zombies: string[];
  grants?: string[];
}): void {
  if (!environmentstatenode) return;
  if (!view) {
    environmentstatenode.textContent = "Environments: no run state.";
    return;
  }
  const counted = new Map<string, number>();
  for (const entry of view.report.environments)
    counted.set(entry.environment, (counted.get(entry.environment) ?? 0) + 1);
  const breakdown = [...counted.entries()].map(([environment, count]) => `${environment} ${count}`).join(" · ");
  const keepalive = view.report.keepalive;
  environmentstatenode.textContent = `Environments: ${breakdown.length > 0 ? breakdown : "no step executed"} · offscreen ${view.offscreengranted ? "granted" : "absent"} · offload ${view.parseoffload ? "on" : "off"}${view.report.workers > 0 ? ` · workers ${view.report.workers}` : ""} · keepalive ${keepalive ? `${keepalive.state === "active" && keepalive.portopen ? "♥" : "closed"} ${keepalive.beats} beat${keepalive.beats === 1 ? "" : "s"}` : "none"}${view.zombies.length > 0 ? ` · zombie runs ${view.zombies.join(", ")}` : ""}${view.grants !== undefined ? ` · grants ${view.grants.length > 0 ? view.grants.join(", ") : "default"}` : ""}.`;
  if (keepalive?.state === "active" && keepalive.portopen) environmentstatenode.dataset.state = "active";
  else delete environmentstatenode.dataset.state;
  if (environmentcontrols) {
    environmentcontrols.replaceChildren();
    if (view.zombies.length > 0) {
      const reap = document.createElement("button");
      reap.className = "secondary";
      reap.textContent = "Reap zombie runs";
      reap.addEventListener("click", () => {
        void request({ kind: "runstate", reap: true })
          .then(() => restore())
          .catch((error) => status(error instanceof Error ? error.message : String(error), true));
      });
      environmentcontrols.append(reap);
    }
    if (!view.offscreengranted) {
      const grant = document.createElement("button");
      grant.className = "secondary";
      grant.textContent = "Request offscreen grant";
      grant.addEventListener("click", () => {
        void request({ kind: "environments", requestcapability: true })
          .then(() => restore())
          .catch((error) => status(error instanceof Error ? error.message : String(error), true));
      });
      environmentcontrols.append(grant);
    }
  }
}

/** Renders the security posture of the active tab: the origin allowlist state, the originprofile summary, the consent window state, the denydefault notice and the safedefaults notice of an unprofiled origin that links to the transparencypage originprofile editor, with the allowlist grant request for a new origin. */
function rendersecuritystate(
  view?: {
    posture: string;
    allowlist: Array<{ origin: string; profileid: string }>;
    profiles: Array<{ origin: string; grants: string[]; denials: string[] }>;
    windows: Array<{ origin: string; state: string; expiresat: number }>;
    sessionorigin?: string;
    chain: Array<{ runid: string; valid: boolean; entries: number; sealhash?: string }>;
  },
  activeorigin?: string,
): void {
  if (!securitystatenode) return;
  if (!view) {
    securitystatenode.textContent = "Security: state unknown.";
    return;
  }
  const origin = activeorigin ?? view.sessionorigin ?? "the active tab";
  const granted = view.allowlist.some((entry) => entry.origin === origin);
  const profile = view.profiles.find((candidate) => candidate.origin === origin);
  const windowstate = view.windows.find((candidate) => candidate.origin === origin && candidate.state === "active");
  const verified = view.chain.filter((chain) => chain.valid).length;
  securitystatenode.textContent = `Security: ${origin} ${granted ? "allowlisted" : "ungranted (denydefault)"}${profile !== undefined ? ` · profile ${profile.grants.length} granted / ${profile.denials.length} denied` : " · no origin profile"}${windowstate !== undefined ? ` · consent window until ${new Date(windowstate.expiresat).toLocaleTimeString()}` : " · no active consent window"} · ${verified}/${view.chain.length} log chain${view.chain.length === 1 ? "" : "s"} verified.`;
  if (granted) delete securitystatenode.dataset.state;
  else securitystatenode.dataset.state = "error";
  if (securitycontrols) {
    securitycontrols.replaceChildren();
    if (!granted) {
      const grant = document.createElement("button");
      grant.className = "secondary";
      grant.textContent = `Grant ${origin} allowlist entry`;
      grant.addEventListener("click", () => {
        void request({ kind: "security", allowlist: { add: { origin } } })
          .then(() => restore())
          .catch((error) => status(error instanceof Error ? error.message : String(error), true));
      });
      securitycontrols.append(grant);
    }
    if (profile === undefined && origin !== "the active tab") {
      const safedefaults = document.createElement("button");
      safedefaults.className = "secondary";
      safedefaults.textContent = `Safedefaults on ${origin}: reads only — open the originprofile editor`;
      safedefaults.addEventListener("click", () => {
        try {
          chrome.runtime.openOptionsPage(() => {
            void chrome.runtime.lastError;
          });
        } catch {
          status("The transparencypage did not open; open it from the extensions page.", true);
        }
      });
      securitycontrols.append(safedefaults);
    }
    if (view.chain.length > 0) {
      const seal = view.chain.find((chain) => chain.sealhash !== undefined);
      if (seal?.sealhash !== undefined) {
        const sealinfo = document.createElement("span");
        sealinfo.className = "muted";
        sealinfo.textContent = `Seal ${seal.sealhash.slice(0, 10)}…`;
        securitycontrols.append(sealinfo);
      }
    }
  }
}

function renderswarmstate(state?: {
  overview: { agents: number; active: number; paused: number; stopped: number; claimed: number; queued: number };
  killswitch: { engaged: boolean };
  topology?: { leaderid: string };
  locks?: Array<{ key: string }>;
}): void {
  if (!swarmstatenode) return;
  if (!state) {
    swarmstatenode.textContent = "Swarm: no agents.";
    return;
  }
  swarmstatenode.textContent = `Swarm: ${state.overview.agents} agent${state.overview.agents === 1 ? "" : "s"}${state.overview.agents > 0 ? ` (${state.overview.active} active${state.overview.paused > 0 ? `, ${state.overview.paused} paused` : ""}${state.overview.stopped > 0 ? `, ${state.overview.stopped} stopped` : ""})` : ""} · ${state.overview.claimed} active task${state.overview.claimed === 1 ? "" : "s"}${state.overview.queued > 0 ? ` · ${state.overview.queued} queued` : ""}${state.topology !== undefined ? ` · leader ${state.topology.leaderid}` : ""}${state.locks !== undefined && state.locks.length > 0 ? ` · ${state.locks.length} lock${state.locks.length === 1 ? "" : "s"}` : ""}${state.killswitch.engaged ? " · killswitch engaged" : ""}.`;
  if (state.overview.active > 0 || state.killswitch.engaged) swarmstatenode.dataset.state = "active";
  else delete swarmstatenode.dataset.state;
}

function rendermcpstate(state?: {
  state: string;
  bind?: string;
  port: number;
  localhost: boolean;
  clients?: Array<{ id: string; paired: boolean }>;
  approvals?: Array<{ id: string; tool: string; state: string }>;
  inflight?: Array<{ callid: string; tool: string; chunks: number }>;
  progressnotices?: Array<{ callid: string; percent?: number; message: string; cancellable?: boolean; at: number }>;
}): void {
  if (!mcpstatenode) return;
  const running = state?.state === "running";
  const clients = state?.clients ?? [];
  const paired = clients.filter((client) => client.paired).length;
  const pending = (state?.approvals ?? []).filter((approval) => approval.state === "pending");
  const inflight = state?.inflight ?? [];
  const notice = (state?.progressnotices ?? [])[0];
  mcpstatenode.textContent = `Mcp server: ${running ? `running on ${state?.bind ?? "127.0.0.1"}:${state?.port ?? 7436}${state?.localhost === false ? " (remote bind)" : ""} · ${clients.length} client${clients.length === 1 ? "" : "s"}${paired !== clients.length ? ` · ${paired} paired` : ""}${pending.length > 0 ? ` · ${pending.length} approval gate${pending.length === 1 ? "" : "s"} waiting (${[...new Set(pending.map((approval) => approval.tool))].slice(0, 3).join(", ")})` : ""}${inflight.length > 0 ? ` · ${inflight.length} call${inflight.length === 1 ? "" : "s"} in flight${notice !== undefined ? ` (${notice.percent !== undefined ? `${notice.percent}%` : notice.message}${notice.cancellable === false ? "" : ", cancellable in the panel"})` : ""}` : ""}` : (state?.state ?? "stopped")}.`;
  if (running) mcpstatenode.dataset.state = "active";
  else delete mcpstatenode.dataset.state;
}

function rendertriggerstate(
  rules?: Array<{ id: string; kind: string; enabled: boolean; paused?: boolean; nextfireat?: number }>,
  queued?: number,
  paused?: boolean,
  buttonfired?: boolean,
): void {
  if (!triggerstatenode) return;
  const armed = rules ?? [];
  const enabled = armed.filter((rule) => rule.enabled && rule.paused !== true);
  const scheduled = enabled.filter((rule) => rule.nextfireat !== undefined);
  const buttons = enabled.filter((rule) => rule.kind === "button");
  triggerstatenode.textContent = `Triggers: ${armed.length} armed rule${armed.length === 1 ? "" : "s"}${enabled.length !== armed.length ? ` · ${enabled.length} enabled` : ""}${scheduled.length > 0 ? ` · ${scheduled.length} scheduled` : ""}${(queued ?? 0) > 0 ? ` · ${queued} fire${queued === 1 ? "" : "s"} ${paused ? "held while the session is paused" : "queued"}` : ""}${buttons.length > 0 ? ` · toolbar button ${buttonfired ? "fired" : "ready"}` : ""}.`;
  if (enabled.length > 0) triggerstatenode.dataset.state = "active";
  else delete triggerstatenode.dataset.state;
}

/** Renders the 1.1.68 performance state of the popup: the active worker queue depth with the deferred count the backpressure holds and the startup module budget of the user prewarm set. */
/** Renders the run heartbeat staleness of the long task: the last beat, its age against the user window and the zombie risk the popup warns about. */
async function renderheartbeatstate(): Promise<void> {
  const node = document.querySelector<HTMLElement>("#heartbeatstate");
  if (!node) return;
  try {
    const view = (await request({ kind: "resilience", view: true })) as {
      runs: Array<{ runid: string; state: string; updatedat: number; heartbeat?: number; beats?: number }>;
      window: number;
    };
    const running = view.runs.filter((run) => run.state === "running");
    if (running.length === 0) {
      node.textContent = "Heartbeat: no running run heartbeats yet.";
      delete node.dataset.state;
      return;
    }
    const newest = running.reduce((one, two) => ((two.heartbeat ?? 0) > (one.heartbeat ?? 0) ? two : one));
    const beats = newest.beats ?? 0;
    const age = newest.heartbeat !== undefined ? Math.max(0, Date.now() - newest.heartbeat) : undefined;
    const stale = age !== undefined && age > view.window;
    node.textContent = `Heartbeat: run ${newest.runid} beat ${beats} time${beats === 1 ? "" : "s"}${age !== undefined ? ` · last beat ${Math.round(age / 1000)}s ago` : " · no beat recorded"} of the ${Math.round(view.window / 1000)}s window${stale ? " · stale, the zombiecheck may reap the run" : ""}.`;
    if (stale) node.dataset.state = "stale";
    else delete node.dataset.state;
  } catch {
    node.textContent = "Heartbeat: no run heartbeats yet.";
  }
}

/** Renders the at rest encryption status of the memory workspace: whether encryptrest stays on, how many stored items encrypt and whether every provenance stands complete for the export. */
async function renderencryptstate(): Promise<void> {
  const node = document.querySelector<HTMLElement>("#encryptstate");
  if (!node) return;
  try {
    const view = (await request({ kind: "state", view: true })) as {
      memory: { items: number; encrypted: number; provenancecomplete: boolean };
      encryptrest: boolean;
    };
    node.textContent = `Encryption: encryptrest ${view.encryptrest ? "on" : "off"} · ${view.memory.encrypted} of ${view.memory.items} item${view.memory.items === 1 ? "" : "s"} encrypted${view.encryptrest ? " through the webcrypto derived key; the key never persists and the secret entry stays a consent prompt" : "; sensitive classes refuse plaintext writes once the user turns it on"}${view.memory.provenancecomplete ? " · provenance complete for the export" : " · provenance incomplete for the export"}.`;
    if (view.encryptrest) node.dataset.state = "encrypted";
    else delete node.dataset.state;
  } catch {
    node.textContent = "Encryption: no memory workspace yet.";
    delete node.dataset.state;
  }
}

/** Renders the fleet state of the 1.1.72 family: the agent count with its control states, the open escalations and reviews and the timestamp of the last killswitch stop. */
async function renderfleetstate(): Promise<void> {
  const node = document.querySelector<HTMLElement>("#fleetstate");
  if (!node) return;
  try {
    const view = (await request({ kind: "fleet", view: true })) as {
      overview: {
        agents: number;
        active: number;
        paused: number;
        stopped: number;
        openescalations: number;
        openreviews: number;
        lastkillswitchat?: number;
      };
    };
    node.textContent = `Fleet: ${view.overview.agents} agent${view.overview.agents === 1 ? "" : "s"} (${view.overview.active} active, ${view.overview.paused} paused, ${view.overview.stopped} stopped)${view.overview.openescalations > 0 ? ` · ${view.overview.openescalations} open escalation${view.overview.openescalations === 1 ? "" : "s"}` : ""}${view.overview.openreviews > 0 ? ` · ${view.overview.openreviews} open review${view.overview.openreviews === 1 ? "" : "s"}` : ""}${view.overview.lastkillswitchat !== undefined ? ` · last killswitch ${new Date(view.overview.lastkillswitchat).toISOString()}` : " · killswitch never engaged"}.`;
    if (view.overview.paused > 0) node.dataset.state = "paused";
    else delete node.dataset.state;
  } catch {
    node.textContent = "Fleet: no agents.";
    delete node.dataset.state;
  }
}

/** Renders the worker state of the 1.1.73 family: the live worker count per origin the scaleworkers pass reads, so the popup shows where the fleet stands. */
async function renderworkstate(): Promise<void> {
  const node = document.querySelector<HTMLElement>("#workstate");
  if (!node) return;
  try {
    const view = (await request({ kind: "work", view: true })) as {
      workersperorigin: Array<{ origin: string; count: number }>;
      suggestions: Array<{ origin: string; suggestion: string; reason: string }>;
    };
    if (view.workersperorigin.length === 0) {
      node.textContent = "Workers: none.";
      delete node.dataset.state;
      return;
    }
    node.textContent = `Workers: ${view.workersperorigin.map((entry) => `${entry.count} on ${entry.origin}`).join(" · ")}${view.suggestions.some((suggestion) => suggestion.suggestion !== "hold") ? ` · ${view.suggestions.filter((suggestion) => suggestion.suggestion !== "hold").length} scale suggestion${view.suggestions.filter((suggestion) => suggestion.suggestion !== "hold").length === 1 ? "" : "s"} in the sidepanel` : ""}.`;
    if (view.workersperorigin.some((entry) => entry.count > 0)) node.dataset.state = "active";
    else delete node.dataset.state;
  } catch {
    node.textContent = "Workers: none.";
    delete node.dataset.state;
  }
}

async function renderpipelinestate(): Promise<void> {
  const node = document.querySelector<HTMLElement>("#pipelinestate");
  if (!node) return;
  try {
    const view = (await request({ kind: "pipeline", view: true })) as {
      state: { running: number; paused: number; finished: number };
      progress: Array<{ rows: number; bytes: number; state: string }>;
    };
    const active = view.state.running + view.state.paused;
    if (active === 0 && view.state.finished === 0) {
      node.textContent = "Pipelines: none.";
      delete node.dataset.state;
      return;
    }
    node.textContent = `Pipelines: ${view.state.running} running · ${view.state.paused} paused · ${view.state.finished} finished${
      view.progress.some((entry) => entry.state !== "finished")
        ? ` · ${view.progress
            .filter((entry) => entry.state !== "finished")
            .reduce((total, entry) => total + entry.rows, 0)
            .toLocaleString()} row${view.progress.filter((entry) => entry.state !== "finished").reduce((total, entry) => total + entry.rows, 0) === 1 ? "" : "s"} streamed`
        : ""
    }.`;
    if (active > 0) node.dataset.state = "active";
    else delete node.dataset.state;
  } catch {
    node.textContent = "Pipelines: none.";
    delete node.dataset.state;
  }
}

async function rendertransportstate(): Promise<void> {
  const node = document.querySelector<HTMLElement>("#transportstate");
  if (!node) return;
  try {
    const view = (await request({ kind: "webapi", view: true })) as {
      subscriptions: Array<{ state: string }>;
      graphqlchannels: Array<{ completed: boolean }>;
      ratelimits: Array<{ origin: string }>;
      cache: Array<{ hits: number }>;
    };
    const open =
      view.subscriptions.filter((record) => record.state === "open").length +
      view.graphqlchannels.filter((channel) => !channel.completed).length;
    const hits = view.cache.reduce((total, entry) => total + entry.hits, 0);
    if (open === 0 && view.ratelimits.length === 0 && hits === 0) {
      node.textContent = "Transports: none open.";
      delete node.dataset.state;
      return;
    }
    node.textContent = `Transports: ${open} open${view.ratelimits.length > 0 ? ` · ${view.ratelimits.length} rate directive${view.ratelimits.length === 1 ? "" : "s"}` : ""}${hits > 0 ? ` · ${hits} cache hit${hits === 1 ? "" : "s"}` : ""}.`;
    if (open > 0) node.dataset.state = "active";
    else delete node.dataset.state;
  } catch {
    node.textContent = "Transports: none open.";
    delete node.dataset.state;
  }
}

/** Renders the popup vision model status of the 1.1.77 family: the configured model with the ocr, description and cache hit counts of the run, or the unconfigured refusal because no recognition ships inside the extension. */
async function rendervisionstate(): Promise<void> {
  const node = document.querySelector<HTMLElement>("#visionstate");
  if (!node) return;
  try {
    const view = (await request({ kind: "vision", view: true })) as {
      ocrs: Array<{ words: number }>;
      visions: Array<{ regions: number }>;
      cachehits: number;
      cost: { modelcalls: number; calls: number };
      settings: { visionmodel?: string; visionendpoint?: string };
    };
    const words = view.ocrs.reduce((total, record) => total + record.words, 0);
    if (view.ocrs.length === 0 && view.visions.length === 0) {
      node.textContent =
        view.settings.visionmodel !== undefined
          ? `Vision: model ${view.settings.visionmodel} configured, none read yet.`
          : "Vision: no model configured.";
      delete node.dataset.state;
      return;
    }
    node.textContent = `Vision: ${view.settings.visionmodel !== undefined ? view.settings.visionmodel : "unconfigured model"} · ${view.ocrs.length} ocr result${view.ocrs.length === 1 ? "" : "s"} of ${words} word${words === 1 ? "" : "s"} · ${view.visions.length} description${view.visions.length === 1 ? "" : "s"} · ${view.cachehits} cache hit${view.cachehits === 1 ? "" : "s"} · ${view.cost.modelcalls} model call${view.cost.modelcalls === 1 ? "" : "s"}.`;
    if (view.cost.modelcalls > 0) node.dataset.state = "active";
    else delete node.dataset.state;
  } catch {
    node.textContent = "Vision: no model configured.";
    delete node.dataset.state;
  }
}

/** Renders the popup forensic evidence status of the 1.1.78 family: the before after pair, console, net and regression counts of the run with the latest diff score, so the popup names the evidence the run gathered at a glance. */
async function renderforensicsstate(): Promise<void> {
  const node = document.querySelector<HTMLElement>("#forensicsstate");
  if (!node) return;
  try {
    const view = (await request({ kind: "forensics", view: true })) as {
      pairs: Array<{ stepkind: string }>;
      consoleentries: Array<{ level: string }>;
      netentries: Array<{ status: number }>;
      diffs: Array<{ regression: boolean; score: number }>;
      lastdiffscore?: number;
    };
    const errors = view.consoleentries.filter((entry) => entry.level === "error").length;
    const regressions = view.diffs.filter((diff) => diff.regression).length;
    if (
      view.pairs.length === 0 &&
      view.consoleentries.length === 0 &&
      view.netentries.length === 0 &&
      view.diffs.length === 0
    ) {
      node.textContent = "Forensics: none.";
      delete node.dataset.state;
      return;
    }
    node.textContent = `Forensics: ${view.pairs.length} pair${view.pairs.length === 1 ? "" : "s"} · ${view.consoleentries.length} console entr${view.consoleentries.length === 1 ? "y" : "ies"} (${errors} error${errors === 1 ? "" : "s"}) · ${view.netentries.length} net entr${view.netentries.length === 1 ? "y" : "ies"} · ${regressions} regression${regressions === 1 ? "" : "s"}${view.lastdiffscore !== undefined ? ` · last diff ${view.lastdiffscore}` : ""}.`;
    if (errors > 0 || regressions > 0) node.dataset.state = "active";
    else delete node.dataset.state;
  } catch {
    node.textContent = "Forensics: none.";
    delete node.dataset.state;
  }
}

/** Renders the popup telemetry status of the 1.1.79 minimization family: the policy stays fixed to off by default and by construction — the enabled literal of the telemetrypolicy type makes an on state unrepresentable — so the popup names the posture and every counter keeps living inside the local memory. */
async function renderbridgestate(): Promise<void> {
  const node = document.querySelector<HTMLElement>("#bridgestate");
  if (!node) return;
  try {
    const view = (await request({ kind: "bridge", view: true })) as {
      status: { status: string; paired: boolean; queued: number };
    };
    node.textContent = bridgestatuslabel(view.status);
    if (view.status.status === "connected") node.dataset.state = "active";
    else delete node.dataset.state;
  } catch {
    node.textContent = "Bridge: disabled (no relay url set).";
    delete node.dataset.state;
  }
}

async function rendertelemetrystate(): Promise<void> {
  const node = document.querySelector<HTMLElement>("#telemetrystate");
  if (!node) return;
  try {
    const view = (await request({ kind: "minimization", view: true })) as {
      telemetry: { enabled: boolean; counters: string };
      inventory: Array<{ key: string; dataclass: string; size: number; records: number }>;
    };
    const localsize = view.inventory.reduce((total, entry) => total + entry.size, 0);
    node.textContent = `Telemetry: ${view.telemetry.enabled === false ? "off" : "off"} (fixed) · ${view.telemetry.counters} counters · ${view.inventory.length} stored famil${view.inventory.length === 1 ? "y" : "ies"} of ${localsize} byte${localsize === 1 ? "" : "s"} stay on the device.`;
    delete node.dataset.state;
  } catch {
    node.textContent = "Telemetry: off by default and by construction.";
    delete node.dataset.state;
  }
}

async function renderperfstate(): Promise<void> {
  if (!perfstatenode) return;
  try {
    const view = (await request({ kind: "perf", view: true })) as {
      queue: { depth: number; deferred: number; peak: number; configured?: number };
      startup: { prewarmed: string[]; lazy: string[]; budget?: number; over: boolean };
    };
    perfstatenode.textContent = `Performance: worker queue ${view.queue.depth} pending${view.queue.deferred > 0 ? ` · ${view.queue.deferred} deferred` : ""}${view.queue.peak > 0 ? ` · peak ${view.queue.peak}` : ""}${view.queue.configured !== undefined ? ` · user depth ${view.queue.configured}` : ""} · startup ${view.startup.prewarmed.length} prewarmed of ${view.startup.prewarmed.length + view.startup.lazy.length} module${view.startup.prewarmed.length + view.startup.lazy.length === 1 ? "" : "s"}${view.startup.budget !== undefined ? ` · budget ${view.startup.budget}${view.startup.over ? " (over, reported never refused)" : ""}` : ""}.`;
    if (view.queue.depth > 0) perfstatenode.dataset.state = "active";
    else delete perfstatenode.dataset.state;
  } catch {
    perfstatenode.textContent = "Performance: no run measured.";
    delete perfstatenode.dataset.state;
  }
}

async function restore(): Promise<void> {
  const context = (await request({ kind: "context" })) as {
    config?: { endpoint: string };
    session?: { stoppedat?: number; pausedat?: number; expiresat: number; origin?: string };
    capabilities?: capabilityreport;
    holds?: { heldkeys: keyholdstate[] };
    dialogs?: dialogdecision[];
    signals?: pagesignallike;
    navstate?: navstate;
    offline?: boolean;
    waitprofile?: waitprofilerecord;
    navqueues?: navqueues;
    windows?: windowshape[];
    badges?: tabbadge[];
    captchas?: captchahandoff[];
    datasets?: dataset[];
    streams?: streamstate[];
    downloads?: downloadrecord[];
    clipconsents?: clipboardconsentrecord[];
    quarantines?: quarantineentry[];
    captures?: Array<{ id: string }>;
    capturepolicy?: string;
    media?: Array<{ id: string }>;
    recordingactive?: Array<{ id: string; kind: string }>;
    recordingconsents?: Array<{ approved?: boolean }>;
    calls?: Array<{ id: string }>;
    fetchconsents?: Array<{ approved?: boolean }>;
    exchanges?: Array<{ id: string }>;
    channels?: Array<{ id: string; state: string }>;
    activerules?: number;
    timeline?: { errors?: Array<{ id: string }>; rejections?: Array<{ id: string }> };
    consoleconsents?: consoleconsentrecord[];
    debuggergrants?: Array<{ approved?: boolean; revokedat?: number }>;
    cdpattached?: number;
    profileactive?: number;
    profile?: { consents?: Array<{ approved?: boolean; revokedat?: number }> };
    emulatedlayers?: string[];
    emulation?: { consents: Array<{ approved?: boolean }> };
    traffic?: {
      blocks: Array<{ hits: number; revertedat?: number }>;
      mocks: Array<{ hits: number; revertedat?: number }>;
    };
    sessionmemory?: {
      records: Array<{ id: string; name: string }>;
      auto?: { period: number; maxsnapshots: number; expiry: number };
    };
    autosnapshotstate?: { interval: { period: number; maxsnapshots: number; expiry: number }; count: number };
    workflow?: {
      runs: Array<{ id: string; state: string; cursor: number; workflowid: string; dryrun?: boolean }>;
      control?: Array<{ runid: string; kind: string; loops?: Array<{ path: string }> }>;
    };
    trigger?: {
      rules: Array<{ id: string; kind: string; enabled: boolean; paused?: boolean; nextfireat?: number }>;
      queued: number;
    };
    mcp?: {
      state: string;
      bind?: string;
      port: number;
      localhost: boolean;
      clients: Array<{ id: string; paired: boolean }>;
      approvals: Array<{ id: string; tool: string; state: string }>;
      inflight?: Array<{ callid: string; tool: string; chunks: number }>;
      progressnotices?: Array<{ callid: string; percent?: number; message: string; cancellable?: boolean; at: number }>;
    };
    llm?: {
      providers: Array<{ id: string; name: string; status: string }>;
      tasks: Array<{ kind: string; provider?: string; model?: string }>;
      usage: { totaltokens: number; cost: number; calls: number };
    };
    swarm?: {
      overview: { agents: number; active: number; paused: number; stopped: number; claimed: number; queued: number };
      killswitch: { engaged: boolean };
      topology?: { leaderid: string };
      locks?: Array<{ key: string }>;
    };
    environments?: {
      report: {
        environments: Array<{ stepid: string; environment: string }>;
        workers: number;
        keepalive?: { runid: string; state: string; beats: number; lastbeatat: number; portopen: boolean };
      };
      offscreengranted: boolean;
      parseoffload: boolean;
      zombies: string[];
      grants?: string[];
    };
    security?: {
      posture: string;
      allowlist: Array<{ origin: string; profileid: string }>;
      profiles: Array<{ origin: string; grants: string[]; denials: string[] }>;
      windows: Array<{ origin: string; state: string; expiresat: number }>;
      sessionorigin?: string;
      chain: Array<{ runid: string; valid: boolean; entries: number; sealhash?: string }>;
    };
    sessionview?: {
      grid: Array<{
        sessionid: string;
        runid: string;
        origins: string[];
        state: string;
        outcome: string;
        steps: number;
        completed: number;
        lock: string;
        tabid?: number;
        sealhash?: string;
        updatedat: number;
        actions: string[];
      }>;
    };
    v1sunset?: { at: number; declared: number; clientid: string; dismissedat?: number };
    migrationprompt?: {
      promptedat: number;
      previousversion: string;
      command: string;
      migrationpromptdismissed?: boolean;
      dismissedat?: number;
    };
  };
  if (endpointinput && context.config) endpointinput.value = context.config.endpoint;
  rendercapabilities(context.capabilities);
  renderlivestate(context.holds?.heldkeys, context.dialogs, context.signals);
  rendernavstate(context.navstate, context.offline, context.waitprofile, context.navqueues);
  renderwindowlayout(context.windows, context.badges);
  rendercaptchastate(context.captchas);
  renderdatasetstate(context.datasets, context.streams);
  renderdownloadstate(context.downloads, context.quarantines);
  renderclipboardstate(context.clipconsents);
  rendercapturestate(context.captures, context.capturepolicy);
  rendermediastate(context.media, context.recordingactive, context.recordingconsents);
  rendercallstate(context.calls, context.fetchconsents);
  rendernetstate(context.exchanges, context.channels);
  renderdebugstate(
    context.timeline,
    context.consoleconsents,
    context.debuggergrants,
    context.cdpattached,
    context.profileactive,
    context.profile?.consents,
  );
  renderemulationstate(context.emulatedlayers, context.emulation?.consents);
  rendersessionstate(context.sessionmemory, context.autosnapshotstate);
  renderworkflowstate(context.workflow?.runs, context.workflow?.control);
  rendertriggerstate(
    context.trigger?.rules,
    context.trigger?.queued,
    context.session?.pausedat !== undefined,
    triggerbuttonfired,
  );
  rendermcpstate(context.mcp);
  rendermodelstate(context.llm);
  renderswarmstate(context.swarm);
  renderenvironmentstate(context.environments);
  await renderperfstate();
  await renderheartbeatstate();
  await renderencryptstate();
  await renderfleetstate();
  await renderworkstate();
  await renderpipelinestate();
  await rendertransportstate();
  await rendervisionstate();
  await renderforensicsstate();
  await rendertelemetrystate();
  await renderbridgestate();
  rendersecuritystate(context.security, context.session?.origin);
  renderv1sunsetbanner(context.v1sunset);
  rendermigrationpromptbanner(context.migrationprompt);
  rendersessiongridstate(context.sessionview?.grid);
  renderrulestate(
    context.activerules,
    (context.traffic?.blocks ?? [])
      .filter((rule) => rule.revertedat === undefined)
      .reduce((total, rule) => total + rule.hits, 0),
    (context.traffic?.mocks ?? [])
      .filter((spec) => spec.revertedat === undefined)
      .reduce((total, spec) => total + spec.hits, 0),
  );
  const active = context.session && !context.session.stoppedat && context.session.expiresat > Date.now();
  if (pausebutton) {
    pausebutton.disabled = !active;
    pausebutton.textContent = pauselabel(Boolean(context.session?.pausedat));
  }
  if (active && context.session?.pausedat) status("Session paused. Reviewed actions are blocked until resume.");
  else status(active ? "Session active. Review the plan in the side panel." : "No active browser session.");
}

/** The popup open is the toolbar button click of a default popup: an armed button rule evaluates behind the gates once per popup open. */
let triggerbuttonfired = false;
void (async () => {
  try {
    const result = (await request({ kind: "buttontrigger" })) as { fired: boolean; reason?: string };
    if (result.fired) {
      triggerbuttonfired = true;
      status("The toolbar button rule fired behind the consent gates.");
    }
  } catch {
    /* no armed button rule or the gates refused the fire; the panel shows the reason */
  }
})();

connectbutton?.addEventListener("click", async () => {
  try {
    const config = normalizeendpoint(endpointinput?.value ?? "");
    const granted = await chrome.permissions.request({ origins: [hostpattern(config.origin)] });
    if (!granted) throw new Error("Origin permission was not granted.");
    await request({ kind: "configure", endpoint: config.endpoint });
    status(`Endpoint approved for ${config.origin}.`);
  } catch (error) {
    status(error instanceof Error ? error.message : String(error), true);
  }
});
sessionbutton?.addEventListener("click", async () => {
  try {
    await request({ kind: "startsession" });
    status("Session started for the active HTTPS tab.");
    await restore();
  } catch (error) {
    status(error instanceof Error ? error.message : String(error), true);
  }
});
pausebutton?.addEventListener("click", async () => {
  try {
    const context = (await request({ kind: "context" })) as { session?: { pausedat?: number } };
    await request({ kind: context.session?.pausedat ? "resumesession" : "pausesession" });
    await restore();
  } catch (error) {
    status(error instanceof Error ? error.message : String(error), true);
  }
});
stopbutton?.addEventListener("click", async () => {
  try {
    await request({ kind: "stop" });
    status("Session stopped. No action can continue.");
    await restore();
  } catch (error) {
    status(error instanceof Error ? error.message : String(error), true);
  }
});
killswitchbutton?.addEventListener("click", async () => {
  try {
    await request({ kind: "fleet", killswitch: { reason: "The popup killswitch button." } });
    status(
      "The killswitch engaged: every fleet record stopped, every agent run cancelled and every queue cleared; the switch stays user triggered only.",
    );
    await restore();
  } catch (error) {
    status(error instanceof Error ? error.message : String(error), true);
  }
});
openbutton?.addEventListener("click", () => chrome.sidePanel.open({ windowId: chrome.windows.WINDOW_ID_CURRENT }));
restore().catch((error) => status(error instanceof Error ? error.message : String(error), true));

/** Renders the compact sessiongrid of recent sessions: every live and saved run in one row with its state, outcome and lock, and a deep link that opens the sidepanel run view. */
function rendersessiongridstate(
  grid?: Array<{
    sessionid: string;
    runid: string;
    origins: string[];
    state: string;
    outcome: string;
    steps: number;
    completed: number;
    lock: string;
    tabid?: number;
    sealhash?: string;
    updatedat: number;
    actions: string[];
  }>,
): void {
  if (!sessiongridstatenode) return;
  if (!grid || grid.length === 0) {
    sessiongridstatenode.textContent = "Session grid: no run yet.";
    if (sessiongridcontrols) sessiongridcontrols.replaceChildren();
    return;
  }
  const recent = grid.slice(0, 3);
  sessiongridstatenode.textContent = `Session grid: ${grid.length} run${grid.length === 1 ? "" : "s"} — ${recent.map((row) => `${row.state} ${row.runid.slice(0, 8)} ${row.completed}/${row.steps} ${row.lock}`).join(" · ")}.`;
  if (!sessiongridcontrols) return;
  sessiongridcontrols.replaceChildren();
  for (const row of recent) {
    const deep = document.createElement("button");
    deep.type = "button";
    deep.className = "secondary";
    deep.textContent = `Open ${row.state} run ${row.runid.slice(0, 8)}`;
    deep.addEventListener("click", () =>
      request({ kind: "sessions", grid: { open: { runid: row.runid } } })
        .then(() => {
          status(`The session grid row of the run ${row.runid} opened in the sidepanel run view.`);
          return restore();
        })
        .catch((error) => status(error instanceof Error ? error.message : String(error), true)),
    );
    sessiongridcontrols.append(deep);
  }
}

/** Command surface of the 1.1.64 family: the popup carries the task input, the quick run actions, the command palette with its keyboard shortcut, the onboarding walkthrough and the live broadcast refresh. */
const taskinputnode = document.querySelector<HTMLTextAreaElement>("#taskinput");
const tasksubmitbutton = document.querySelector<HTMLButtonElement>("#tasksubmit");
const proposalstatusnode = document.querySelector<HTMLElement>("#proposalstatus");
const runquickbutton = document.querySelector<HTMLButtonElement>("#runquick");
const cancelquickbutton = document.querySelector<HTMLButtonElement>("#cancelquick");
const opendashboardbutton = document.querySelector<HTMLButtonElement>("#opendashboard");
const openoptionsbutton = document.querySelector<HTMLButtonElement>("#openoptions");
const paletteinput = document.querySelector<HTMLInputElement>("#paletteinput");
const paletteopenbutton = document.querySelector<HTMLButtonElement>("#paletteopen");
const palettematchesnode = document.querySelector<HTMLElement>("#palettematches");
const onboardingcardnode = document.querySelector<HTMLElement>("#onboardingcard");

/** The single broadcast channel every surface subscribes to: the popup refreshes its live status from each frame. */
const surfacechannel: BroadcastChannel | undefined =
  typeof BroadcastChannel === "function" ? new BroadcastChannel("devthinksurfaces") : undefined;
surfacechannel?.addEventListener("message", () => {
  void restore().catch(() => {
    /* a failing refresh keeps the last rendered state */
  });
  void renderonboarding().catch(() => {
    /* a failing walkthrough render keeps the card as it was */
  });
});

/** Shows the proposal status of the taskinput while the plan generates. */
function proposalstatus(status: "idle" | "generating" | "ready" | "failed", detail = ""): void {
  if (!proposalstatusnode) return;
  proposalstatusnode.textContent = detail === "" ? status : `${status} — ${detail}`;
  proposalstatusnode.dataset.state = status;
}

/** Submits the taskinput goal through the same proposal flow as the api with the active origin and page outline attached. */
tasksubmitbutton?.addEventListener("click", async () => {
  const text = taskinputnode?.value ?? "";
  if (text.trim() === "") {
    status("Describe the goal first; the proposal flow needs its natural language task.", true);
    return;
  }
  proposalstatus("generating");
  try {
    const result = (await request({ kind: "surface", task: { submit: { text, surface: "popup" } } })) as {
      plan?: { id: string; state: string };
      status?: string;
    };
    proposalstatus("ready", `plan ${result.plan?.id ?? ""} awaits its plancard review`);
    status(`The taskinput goal became the plan ${result.plan?.id ?? ""}; review its plancards in the side panel.`);
    await restore();
  } catch (error) {
    proposalstatus("failed", error instanceof Error ? error.message : String(error));
    status(error instanceof Error ? error.message : String(error), true);
  }
});

/** Runs the quick actions of the command surface through the command bus. */
async function busaction(command: string, payload = "", stepid?: string): Promise<void> {
  const action = {
    surface: "popup",
    command,
    ...(payload !== "" ? { payload } : {}),
    ...(stepid !== undefined ? { stepid } : {}),
  };
  const route = (await request({ kind: "surface", bus: { action } })) as {
    route: { dispatched: boolean; reason: string };
  };
  status(route.route.reason);
  await restore();
}
runquickbutton?.addEventListener("click", () => {
  void busaction("starttask", taskinputnode?.value ?? "").catch((error) =>
    status(error instanceof Error ? error.message : String(error), true),
  );
});
cancelquickbutton?.addEventListener("click", () => {
  void busaction("cancelrun").catch((error) => status(error instanceof Error ? error.message : String(error), true));
});
opendashboardbutton?.addEventListener("click", () => {
  void chrome.tabs.create({ url: chrome.runtime.getURL("dashboardpage.html") });
});
openoptionsbutton?.addEventListener("click", () => {
  void chrome.tabs.create({ url: chrome.runtime.getURL("optionspage.html") });
});

/** Renders the fuzzy palette matches with the recent commands ranked first. */
async function renderpalette(): Promise<void> {
  if (!palettematchesnode) return;
  const text = paletteinput?.value ?? "";
  try {
    const result = (await request({ kind: "surface", palette: { query: { text } } })) as {
      matches: Array<{
        entry: { id: string; label: string; action: { command: string; surface: string } };
        reason: string;
      }>;
    };
    palettematchesnode.replaceChildren();
    for (const match of result.matches.slice(0, 6)) {
      const item = document.createElement("button");
      item.type = "button";
      item.className = "secondary";
      item.textContent = `${match.entry.label} (${match.entry.action.surface})`;
      item.title = match.reason;
      item.addEventListener("click", () => {
        void runpalettecommand(match.entry.action.command).catch((error) =>
          status(error instanceof Error ? error.message : String(error), true),
        );
      });
      palettematchesnode.append(item, " ");
    }
    if (result.matches.length === 0)
      palettematchesnode.textContent =
        "No command matches; the palette lists only the actions the current capability set allows.";
  } catch (error) {
    palettematchesnode.textContent = error instanceof Error ? error.message : String(error);
  }
}

/** Runs one commandpalette command: the navigation commands open their surface while every other command rides the command bus and its use records for the ranking. */
async function runpalettecommand(command: string): Promise<void> {
  await request({ kind: "surface", palette: { used: { command } } });
  if (command === "opendashboardpage") {
    await chrome.tabs.create({ url: chrome.runtime.getURL("dashboardpage.html") });
    status("The dashboardpage opened in a new tab.");
    return;
  }
  if (command === "openoptionspage") {
    await chrome.tabs.create({ url: chrome.runtime.getURL("optionspage.html") });
    status("The optionspage opened in a new tab.");
    return;
  }
  if (command === "opentransparencypage") {
    await chrome.tabs.create({ url: chrome.runtime.getURL("transparencypage.html") });
    status("The transparencypage opened in a new tab.");
    return;
  }
  if (command === "replayonboarding") {
    await request({ kind: "surface", onboarding: { replay: true } });
    await renderonboarding();
    status("The onboarding walkthrough replays.");
    return;
  }
  if (command === "historysearch") {
    await chrome.tabs.create({ url: chrome.runtime.getURL("dashboardpage.html") });
    status("The dashboardpage opened with the historysearch view.");
    return;
  }
  if (command === "copyauditexcerpt") {
    const result = (await request({ kind: "surface", logstream: { excerpt: {} } })) as { excerpt: string };
    await navigator.clipboard?.writeText(result.excerpt).catch(() => {
      /* the clipboard write needs its reviewed clipboard consent */
    });
    status("The verified range copied as an audit excerpt.");
    return;
  }
  await busaction(command);
  await renderpalette();
}
paletteinput?.addEventListener("input", () => {
  void renderpalette();
});
paletteopenbutton?.addEventListener("click", () => {
  paletteinput?.focus();
  void renderpalette();
});
document.addEventListener("keydown", (event) => {
  const shortcut = event.ctrlKey && event.key === ".";
  if (!shortcut) return;
  event.preventDefault();
  paletteinput?.focus();
  void renderpalette();
});
void renderpalette();

/** Renders the onboarding walkthrough card while the walkthrough runs: the current step with its body and its completion button. */
async function renderonboarding(): Promise<void> {
  if (!onboardingcardnode) return;
  try {
    const result = (await request({ kind: "surface", onboarding: {} })) as {
      steps?: Array<{ id: string; surface: string; title: string; body: string; completion: string }>;
      state?: { stepscompleted: string[]; done: boolean };
    };
    const steps = result.steps ?? [];
    const state = result.state;
    if (!state || state.done || steps.length === 0) {
      onboardingcardnode.hidden = true;
      onboardingcardnode.replaceChildren();
      return;
    }
    const current = steps.find((step) => !state.stepscompleted.includes(step.id)) ?? steps[0];
    if (current === undefined) {
      onboardingcardnode.hidden = true;
      return;
    }
    onboardingcardnode.hidden = false;
    onboardingcardnode.replaceChildren();
    const title = document.createElement("strong");
    title.textContent = `Onboarding — ${current.title} (${state.stepscompleted.length}/${steps.length})`;
    const body = document.createElement("p");
    body.textContent = current.body;
    const done = document.createElement("button");
    done.type = "button";
    done.textContent = `Mark ${current.title} done`;
    done.addEventListener("click", () => {
      void request({ kind: "surface", onboarding: { complete: { stepid: current.id } } })
        .then(() => renderonboarding())
        .then(() => restore())
        .catch((error) => status(error instanceof Error ? error.message : String(error), true));
    });
    onboardingcardnode.append(title, body, done);
  } catch {
    onboardingcardnode.hidden = true;
  }
}
void renderonboarding();

/** The version one sunset notice record the context carries: the time the first below floor declaration arrived, the major the client declared, the client that declared it and the session dismissal time. */
type v1sunsetnotice = { at: number; declared: number; clientid: string; dismissedat?: number };

/** The version one migration prompt record the context carries: the time the prompt fired, the 1.x release the update upgraded from, the migrateplan command it surfaces and the persistent dismissal flag. */
type migrationpromptnotice = {
  promptedat: number;
  previousversion: string;
  command: string;
  migrationpromptdismissed?: boolean;
  dismissedat?: number;
};

/** Builds the version one sunset banner card content: the plain language sunset notice the negotiation refusal texts carry, the migration guide path the banner references, the migration command the card names and the visibility the session state decides. */
export function v1sunsetbannercard(state: v1sunsetnotice | undefined): {
  title: string;
  body: string;
  guide: string;
  command: string;
  dismiss: string;
  visible: boolean;
} {
  return {
    title: "Protocol v1 retired",
    body: "Protocol v1 retired — this client cannot connect. The migration guide and the migrateplan command upgrade v1 plans.",
    guide: "docs/migrationguide.md",
    command: "devthink migrateplan",
    dismiss: "Dismiss for this session",
    visible: state !== undefined && state.dismissedat === undefined,
  };
}

/** Builds the version one migration prompt card content: the one time upgrade notice for an affected upgrader, the guide path, the migrateplan command the Migrate action surfaces and the visibility the persistent dismissal flag decides. */
export function migrationpromptcard(state: migrationpromptnotice | undefined): {
  title: string;
  body: string;
  guide: string;
  command: string;
  migrate: string;
  dismiss: string;
  visible: boolean;
} {
  return {
    title: "Version one migration",
    body: `The update from ${state?.previousversion ?? "a version one release"} closed the protocol v1 window; convert v1 plans before the next connection.`,
    guide: "docs/migrationguide.md",
    command: state?.command ?? "devthink migrateplan",
    migrate: "Migrate",
    dismiss: "Dismiss permanently",
    visible: state !== undefined && state.migrationpromptdismissed !== true && state.dismissedat === undefined,
  };
}

/** The lazily created banner cards the popup appends to its body: the design file carries no dedicated sunset node, so the popup builds the two cards it needs — the version one sunset banner and the version one migration prompt — and removes them when their state hides. */
const sunsetbannersection = typeof document === "undefined" ? undefined : document.createElement("section");
const migrationbannersection = typeof document === "undefined" ? undefined : document.createElement("section");

/** Renders the version one sunset banner card: the notice names the retired protocol, the guide path and the migration command, and the dismissal resets it for the session through the surface command family. */
export function renderv1sunsetbanner(state: v1sunsetnotice | undefined): void {
  if (sunsetbannersection === undefined || typeof document.body?.append !== "function") return;
  const card = v1sunsetbannercard(state);
  if (!card.visible) {
    sunsetbannersection.remove();
    return;
  }
  sunsetbannersection.className = "panel";
  sunsetbannersection.setAttribute("role", "status");
  sunsetbannersection.replaceChildren();
  const title = document.createElement("strong");
  title.textContent = card.title;
  const body = document.createElement("p");
  body.textContent = `${card.body} Guide: ${card.guide}. Command: ${card.command}.`;
  const dismiss = document.createElement("button");
  dismiss.type = "button";
  dismiss.className = "secondary";
  dismiss.textContent = card.dismiss;
  dismiss.addEventListener("click", () => {
    void request({ kind: "surface", v1sunset: { dismiss: true } })
      .then(() => renderv1sunsetbanner(undefined))
      .catch((error) => status(error instanceof Error ? error.message : String(error), true));
  });
  sunsetbannersection.append(title, body, dismiss);
  document.body.append(sunsetbannersection);
}

/** Renders the version one migration prompt card: the Migrate action surfaces the migrateplan command the prompt record carries, and the dismissal writes the persistent flag through the surface command family so the prompt never appears again. */
export function rendermigrationpromptbanner(state: migrationpromptnotice | undefined): void {
  if (migrationbannersection === undefined || typeof document.body?.append !== "function") return;
  const card = migrationpromptcard(state);
  if (!card.visible) {
    migrationbannersection.remove();
    return;
  }
  migrationbannersection.className = "panel";
  migrationbannersection.setAttribute("role", "status");
  migrationbannersection.replaceChildren();
  const title = document.createElement("strong");
  title.textContent = card.title;
  const body = document.createElement("p");
  body.textContent = `${card.body} Guide: ${card.guide}.`;
  const migrate = document.createElement("button");
  migrate.type = "button";
  migrate.className = "secondary";
  migrate.textContent = card.migrate;
  migrate.addEventListener("click", () => {
    void request({ kind: "surface", migrationprompt: { migrate: true } })
      .then(() => status(`The migration command: ${card.command}. The guide at ${card.guide} records the full path.`))
      .catch((error) => status(error instanceof Error ? error.message : String(error), true));
  });
  const dismiss = document.createElement("button");
  dismiss.type = "button";
  dismiss.className = "secondary";
  dismiss.textContent = card.dismiss;
  dismiss.addEventListener("click", () => {
    void request({ kind: "surface", migrationprompt: { dismiss: true } })
      .then(() => rendermigrationpromptbanner(undefined))
      .catch((error) => status(error instanceof Error ? error.message : String(error), true));
  });
  migrationbannersection.append(title, body, migrate, " ", dismiss);
  document.body.append(migrationbannersection);
}

/** Recenttray of the 1.1.65 family: the popup lists the latest runs with resume for a halted run and reopen for a completed one through the same sessions seam. */
const recenttraynode = document.querySelector<HTMLElement>("#recenttray");
async function renderrecenttray(): Promise<void> {
  if (!recenttraynode) return;
  try {
    const result = (await request({ kind: "views", recent: { list: true } })) as {
      tray?: Array<{
        runid: string;
        origin: string;
        outcome: string;
        title: string;
        at: number;
        resumable: boolean;
        reopenable: boolean;
      }>;
    };
    const tray = result.tray ?? [];
    recenttraynode.replaceChildren();
    if (tray.length === 0)
      recenttraynode.textContent = "No run yet; the tray lists the latest runs with resume and reopen.";
    else {
      const list = document.createElement("ul");
      list.className = "audit";
      for (const entry of tray) {
        const item = document.createElement("li");
        item.textContent = `${entry.outcome} — ${entry.title || entry.runid} (${entry.origin})`;
        if (entry.resumable) {
          const resume = document.createElement("button");
          resume.type = "button";
          resume.className = "secondary";
          resume.textContent = "Resume";
          resume.addEventListener("click", () => {
            void (async () => {
              await request({ kind: "sessions", grid: { resume: { runid: entry.runid } } });
              status(`The run ${entry.runid} resumed through the sessions seam.`);
            })().catch((error) => status(error instanceof Error ? error.message : String(error), true));
          });
          item.append(" ", resume);
        }
        if (entry.reopenable) {
          const reopen = document.createElement("button");
          reopen.type = "button";
          reopen.className = "secondary";
          reopen.textContent = "Reopen";
          reopen.addEventListener("click", () => {
            void (async () => {
              await request({ kind: "sessions", grid: { reopen: { runid: entry.runid } } });
              status(`The run ${entry.runid} reopened through the sessions seam.`);
            })().catch((error) => status(error instanceof Error ? error.message : String(error), true));
          });
          item.append(" ", reopen);
        }
        list.append(item);
      }
      recenttraynode.append(list);
    }
  } catch (error) {
    recenttraynode.textContent = error instanceof Error ? error.message : String(error);
  }
  try {
    const background = (await request({ kind: "ecosystem", background: { list: true } })) as {
      tray: Array<{ runid: string; title: string; outcome: string }>;
    };
    if (background.tray.length > 0) {
      const backgroundlist = document.createElement("ul");
      backgroundlist.className = "audit";
      const headline = document.createElement("li");
      headline.textContent = `Background runs: ${background.tray.length} finished entr${background.tray.length === 1 ? "y" : "ies"} from the background queue.`;
      backgroundlist.append(headline);
      for (const entry of background.tray.slice(0, 3))
        backgroundlist.append(
          Object.assign(document.createElement("li"), { textContent: `${entry.outcome} — ${entry.title}` }),
        );
      recenttraynode.append(backgroundlist);
    }
  } catch {
    /* a failing background tray read keeps the foreground tray rendered */
  }
}

/** Quickactions of the 1.1.65 family: only the actions the origin allowlist of the clicked tab permits surface in the popup. */
const quickactionsnode = document.querySelector<HTMLElement>("#quickactions");
async function renderquickactions(): Promise<void> {
  if (!quickactionsnode) return;
  try {
    const result = (await request({ kind: "views", quickaction: { list: {}, surface: true } })) as {
      actions?: Array<{ id: string; label: string; command: string }>;
    };
    const actions = result.actions ?? [];
    quickactionsnode.replaceChildren();
    if (actions.length === 0) {
      quickactionsnode.textContent =
        "No quickaction registers on this tab; grant its origin and the permitted actions surface.";
      return;
    }
    const list = document.createElement("ul");
    list.className = "audit";
    for (const action of actions) {
      const item = document.createElement("li");
      item.textContent = action.label;
      const run = document.createElement("button");
      run.type = "button";
      run.className = "secondary";
      run.textContent = "Run";
      run.addEventListener("click", () => {
        void (async () => {
          if (action.command === "opendashboardpage") {
            await chrome.tabs.create({ url: chrome.runtime.getURL("dashboardpage.html") });
            status("The dashboardpage opened in a new tab.");
          } else {
            await busaction("starttask");
            status(`The ${action.id} quickaction routed through the command bus.`);
          }
        })().catch((error) => status(error instanceof Error ? error.message : String(error), true));
      });
      item.append(" ", run);
      list.append(item);
    }
    quickactionsnode.append(list);
  } catch (error) {
    quickactionsnode.textContent = error instanceof Error ? error.message : String(error);
  }
}
void renderrecenttray();
void renderquickactions();

/** Closedtabs of the 1.1.74 family: the popup lists the recently closed tab records under the user retention window and reopens one on request after the grant recheck. */
const closedtabsnode = document.querySelector<HTMLElement>("#closedtabs");
async function renderclosedtabs(): Promise<void> {
  if (!closedtabsnode) return;
  try {
    const view = (await request({ kind: "nav", view: true })) as {
      closedtabs?: Array<{ id: string; url: string; title: string; closedat: number; reopenedat?: number }>;
    };
    const records = view.closedtabs ?? [];
    closedtabsnode.replaceChildren();
    if (records.length === 0) {
      closedtabsnode.textContent = "No closed tab yet; the records stay under the user retention window.";
      return;
    }
    const list = document.createElement("ul");
    list.className = "audit";
    for (const record of records.slice(0, 6)) {
      const item = document.createElement("li");
      item.textContent = `${record.title || record.url}${record.reopenedat !== undefined ? " (already reopened)" : ""}`;
      if (record.reopenedat === undefined) {
        const reopen = document.createElement("button");
        reopen.type = "button";
        reopen.className = "secondary";
        reopen.textContent = "Reopen";
        reopen.addEventListener("click", () => {
          void (async () => {
            await request({ kind: "nav", reopen: { id: record.id } });
            status(`The closed tab ${record.url} reopened after the grant recheck.`);
            await renderclosedtabs();
          })().catch((error) => status(error instanceof Error ? error.message : String(error), true));
        });
        item.append(" ", reopen);
      }
      list.append(item);
    }
    closedtabsnode.append(list);
  } catch (error) {
    closedtabsnode.textContent = error instanceof Error ? error.message : String(error);
  }
}
void renderclosedtabs();
