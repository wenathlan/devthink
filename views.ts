/**
 * The views module of the 1.1.90 consolidation: every correlated variation of the interface surface logic interned in this one file, so the module family carries one surface without duplicate variations.
 * The correlation is the interface surface family itself: surfaces holds the commandpalette, the taskinput proposals, the onboarding walkthrough and the command bus with the broadcast channel every surface shares; statusviews carries the statusbadge, the done and attention notifications, the recent tray and the stetoast stack; pickerviews scores the element candidates of a picker session with its target halo, page chips and guided tips; tourviews replays the featuretour and localizes the a11ylabels through the locale bundles; evidenceviews renders the shotpanel and the compareviewer pair of the capture evidence; datagrid infers the column types of extraction results with its sorting, filtering, range selection and masked exports; virtlist windows the long lists every surface renders; siteprefs resolves the site profiles, the theme tokens, the locale bundles and the shortcut bindings; quickactions carries the quickaction catalog with its omnibox task parsing and shortcut grammar; and attentionfeed collects, dedupes, ranks and dismisses the attention entries every surface surfaces.
 * No palette depth, list window, locale set or shortcut is ever hardcoded: every bound stays the user's choice with no engine cap, and no surface action ever bypasses the human review.
 */

/* ── Merged from surfaces.ts ── */
import type {
  broadcastchannelkind,
  broadcastframe,
  onboardingstate,
  onboardingstep,
  paletteentry,
  palettematch,
  paletteuserecord,
  surfaceaction,
  surfaceroute,
  taskinputsubmission,
  uisurface,
  notificationpayload,
  recenttrayentry,
  statusbadgestate,
  stetoast,
  guidedtip,
  pagechipconfirmation,
  pickercandidate,
  pickersession,
  targethalo,
  a11ylabel,
  featuretourstop,
  localebundle,
  compareviewerpair,
  shotpanelview,
  datagridcolumn,
  datagridrow,
  datagridview,
  exportmenudescriptor,
  virtlistwindow,
  darklighttokens,
  siteprofile,
  shortcutbinding,
  omniboxtasksubmission,
  quickaction,
  attentionentry,
  attentioncause,
} from "./types.js";
import { paletteactiongate, planreviewgate, taskinputproposalgate } from "./policy.js";
import { randomid } from "./memory.js";

/**
 * Interface surface logic of the 1.1.64 family, part one.
 * The popup, the sidepanel, the dashboardpage, the optionspage and the onboarding share this pure logic: the commandpalette registers its catalog from every module at startup, lists only the actions the current capability set allows and ranks fuzzy matches over ids, labels and keywords with the recent commands first; the taskinput builds submissions with the active origin and the page outline attached and routes them through the same proposal flow as the api; the onboarding walks its four steps once on first install, replays on demand and writes a single consent scoped event on completion; the command bus routes every surface action through the same policy gates; and the single broadcast channel frames every run state, logstream, session store and settings change the surfaces subscribe to.
 * No window, limit or ranking depth is ever hardcoded: every bound stays the user's choice with no engine cap, and no surface action ever bypasses the human review.
 */

/** The commandpalette catalog registered from every module at startup: each entry routes through the command bus with the permission and session needs it declares. */
export function surfacepalette(): paletteentry[] {
  return [
    {
      id: "starttask",
      label: "Start task",
      keywords: ["task", "objective", "run", "goal", "plan"],
      action: { command: "starttask", surface: "popup" },
    },
    {
      id: "pauserun",
      label: "Pause run",
      keywords: ["pause", "hold", "stop", "run"],
      action: { command: "pauserun", surface: "popup", session: true },
    },
    {
      id: "resumerun",
      label: "Resume run",
      keywords: ["resume", "continue", "unpause", "run"],
      action: { command: "resumerun", surface: "popup", session: true },
    },
    {
      id: "cancelrun",
      label: "Cancel run",
      keywords: ["cancel", "stop", "rollback", "queued"],
      action: { command: "cancelrun", surface: "popup", session: true },
    },
    {
      id: "resumesession",
      label: "Resume session",
      keywords: ["session", "resume", "grid", "reopen"],
      action: { command: "resumesession", surface: "sidepanel" },
    },
    {
      id: "stepapprove",
      label: "Review step",
      keywords: ["approve", "reject", "edit", "step", "review", "plancard"],
      action: { command: "stepapprove", surface: "sidepanel", session: true },
    },
    {
      id: "diffpreview",
      label: "Preview step diff",
      keywords: ["diff", "preview", "before", "after", "write"],
      action: { command: "diffpreview", surface: "sidepanel", session: true },
    },
    {
      id: "historysearch",
      label: "Search history",
      keywords: ["history", "search", "notes", "summaries", "corpus"],
      action: { command: "historysearch", surface: "dashboardpage" },
    },
    {
      id: "revokeconsent",
      label: "Revoke consent",
      keywords: ["revoke", "consent", "allowlist", "origin", "grant"],
      action: { command: "revokeconsent", surface: "dashboardpage", session: true },
    },
    {
      id: "opentransparencypage",
      label: "Open transparency page",
      keywords: ["transparency", "grants", "permissions", "diff"],
      action: { command: "opentransparencypage", surface: "optionspage" },
    },
    {
      id: "opendashboardpage",
      label: "Open dashboard",
      keywords: ["dashboard", "sessions", "runs", "notes", "full"],
      action: { command: "opendashboardpage", surface: "dashboardpage" },
    },
    {
      id: "openoptionspage",
      label: "Open options",
      keywords: ["options", "settings", "preferences", "configure"],
      action: { command: "openoptionspage", surface: "optionspage" },
    },
    {
      id: "copyauditexcerpt",
      label: "Copy audit excerpt",
      keywords: ["audit", "excerpt", "copy", "verified", "range"],
      action: { command: "copyauditexcerpt", surface: "dashboardpage" },
    },
    {
      id: "replayonboarding",
      label: "Replay onboarding",
      keywords: ["onboarding", "tour", "walkthrough", "replay", "first"],
      action: { command: "replayonboarding", surface: "onboarding" },
    },
  ];
}

/** Lists only the palette actions the current capability set and session state allow: every command rides its existing permission gate before it lists. */
export function palettecommandsof(
  entries: paletteentry[],
  input: { granted: string[]; sessionactive: boolean },
): paletteentry[] {
  return entries.filter(
    (entry) =>
      paletteactiongate({ action: entry.action, granted: input.granted, sessionactive: input.sessionactive }).allowed,
  );
}

/** Scores one fuzzy query against an entry id, label and keywords: exact id matches rank highest, label and keyword hits rank next and each matched keyword lifts the score. */
function fuzzyentryscore(entry: paletteentry, query: string): number {
  const text = query.trim().toLowerCase();
  if (text === "") return 1;
  const id = entry.id.toLowerCase();
  const label = entry.label.toLowerCase();
  if (id === text || label === text) return 100;
  let score = 0;
  if (id.includes(text)) score += 40;
  if (label.includes(text)) score += 30;
  for (const keyword of entry.keywords) {
    const lower = keyword.toLowerCase();
    if (lower === text) score += 20;
    else if (lower.includes(text)) score += 10;
  }
  if (score === 0 && text.length > 1) {
    // subsequence fuzzy match: every query letter appears in order inside the label or the id
    for (const haystack of [label, id]) {
      let cursor = 0;
      let matched = true;
      for (const letter of text) {
        const found = haystack.indexOf(letter, cursor);
        if (found === -1) {
          matched = false;
          break;
        }
        cursor = found + 1;
      }
      if (matched) {
        score += 15;
        break;
      }
    }
  }
  return score;
}

/** Ranks the fuzzy palette matches for one query: ids, labels and keywords match while the most recently used commands rank first among equal scores. */
export function palettequery(
  entries: paletteentry[],
  input: { text: string; usage: paletteuserecord[]; recentwindow?: number },
): palettematch[] {
  const text = input.text.trim();
  const matches = entries
    .map((entry) => ({ entry, score: fuzzyentryscore(entry, text) }))
    .filter((match) => match.score > 0);
  const lastusedof = (command: string): number =>
    input.usage.find((record) => record.command === command)?.lastusedat ?? 0;
  const countof = (command: string): number => input.usage.find((record) => record.command === command)?.count ?? 0;
  const recentwindow = input.recentwindow;
  const ranked = matches.sort((left, right) => {
    if (right.score !== left.score) return right.score - left.score;
    const leftrecent =
      recentwindow === undefined
        ? 0
        : countof(left.entry.action.command) > 0 &&
            lastusedof(left.entry.action.command) >= lastusedof(right.entry.action.command)
          ? 1
          : 0;
    const rightrecent =
      recentwindow === undefined
        ? 0
        : countof(right.entry.action.command) > 0 &&
            lastusedof(right.entry.action.command) >= lastusedof(left.entry.action.command)
          ? 1
          : 0;
    if (rightrecent !== leftrecent) return rightrecent - leftrecent;
    return lastusedof(right.entry.action.command) - lastusedof(left.entry.action.command);
  });
  return ranked.map((match) => ({
    entry: match.entry,
    score: match.score,
    reason:
      match.score >= 100
        ? `The query matches the ${match.entry.id} command exactly.`
        : `The query matches the label or the keywords of the ${match.entry.id} command${countof(match.entry.action.command) > 0 ? ` and its ${countof(match.entry.action.command)} recorded use${countof(match.entry.action.command) === 1 ? "" : "s"} rank it first among equals` : ""}.`,
  }));
}

/** Records one commandpalette use: the count grows and the last use time moves so the recent first ranking reads both. */
export function paletteuseafter(usage: paletteuserecord[], command: string, now: number): paletteuserecord[] {
  const existing = usage.find((record) => record.command === command);
  if (existing === undefined) return [{ command, count: 1, lastusedat: now }, ...usage];
  return usage.map((record) =>
    record.command === command ? { ...record, count: record.count + 1, lastusedat: now } : record,
  );
}

/** Builds one taskinput submission with the active origin and the page outline context attached; an empty text or origin refuses the submission. */
export function taskinputof(input: {
  text: string;
  context?: string;
  origin: string;
  surface: uisurface;
  at: number;
}): taskinputsubmission {
  if (input.text.trim() === "") throw new Error("The taskinput needs its natural language goal.");
  if (input.origin.trim() === "") throw new Error("The taskinput needs its active origin scope.");
  return {
    id: randomid(),
    text: input.text.trim(),
    context: input.context ?? "",
    origin: input.origin.trim(),
    surface: input.surface,
    at: input.at,
  };
}

/** Keeps the taskinput history per profile with the newest entry first; an absent retention window keeps every entry. */
export function taskhistoryafter(
  history: taskinputsubmission[],
  entry: taskinputsubmission,
  retention: number | undefined,
  now: number,
): taskinputsubmission[] {
  if (retention === undefined) return [entry, ...history];
  return [entry, ...history].filter((candidate) => now - candidate.at < retention);
}

/** The five onboarding steps: the origin grants, the plan review, the run control, the log audit walkthrough of a first run and the optional library walkthrough stop of the 1.1.66 ecosystem family. */
export function onboardingsteps(): onboardingstep[] {
  return [
    {
      id: "origingrants",
      surface: "popup",
      title: "Origin grants",
      body: "Devthink denies automation by default; grant one exact origin at a time from the popup and every run stays inside the granted origins.",
      completion: "origingrantscompleted",
    },
    {
      id: "planreview",
      surface: "sidepanel",
      title: "Plan review",
      body: "Every task becomes a plan of reviewed steps; read the plancards of each risk class and approve, reject or edit one step at a time.",
      completion: "planreviewcompleted",
    },
    {
      id: "runcontrol",
      surface: "sidepanel",
      title: "Run control",
      body: "Runs start, pause, resume and cancel under your hand; a cancelled run rolls only its queued steps back while the executed steps stay sealed.",
      completion: "runcontrolcompleted",
    },
    {
      id: "logaudit",
      surface: "dashboardpage",
      title: "Log audit",
      body: "The immutable log chains every step transition with masked values; open the dashboard, verify the chain and copy a verified range as an audit excerpt.",
      completion: "logauditcompleted",
    },
    {
      id: "library",
      surface: "dashboardpage",
      title: "Flow library",
      body: "The flowlibrary shares reviewed workflow templates: browse an entry, read its step list and grant diff, and every install still lands as a proposal behind the same review.",
      completion: "librarycompleted",
      optional: true,
    },
    {
      id: "performance",
      surface: "optionspage",
      title: "Performance",
      body: "Heavy modules load lazily, snapshots compute deltas against their base and big tables extract in resumable chunks; the optionspage shows the startup budget and every window stays your choice.",
      completion: "performancecompleted",
      optional: true,
    },
  ];
}

/** Starts the onboarding once on first install or on an explicit replay: a fresh walkthrough begins while an already done state resets. */
export function onboardingstart(previous: onboardingstate | undefined, now: number): onboardingstate {
  return { stepscompleted: [], done: false, startedat: now };
}

/** Completes one onboarding step: the walkthrough records the step and a full completion of every mandatory stop writes exactly one consent scoped event while the optional library stop enriches without blocking. */
export function onboardingcomplete(
  state: onboardingstate,
  stepid: string,
  now: number,
): { state: onboardingstate; consentevent?: string } {
  const steps = onboardingsteps();
  const step = steps.find((candidate) => candidate.id === stepid);
  if (step === undefined) throw new Error(`The onboarding knows no ${stepid} step.`);
  const completed = state.stepscompleted.includes(stepid) ? state.stepscompleted : [...state.stepscompleted, stepid];
  const done = steps
    .filter((candidate) => candidate.optional !== true)
    .every((candidate) => completed.includes(candidate.id));
  if (!done) return { state: { ...state, stepscompleted: completed, done: false } };
  const consentevent = "onboardingconsentgranted";
  return {
    state: {
      stepscompleted: completed,
      done: true,
      ...(state.startedat !== undefined ? { startedat: state.startedat } : {}),
      consentevent,
      completedat: now,
    },
    consentevent,
  };
}

/** Builds one broadcast frame of the single surface channel: every run state, logstream, session store and settings change rides the same channel. */
export function broadcastframeof(input: {
  channel: broadcastchannelkind;
  surface: uisurface | "background";
  summary: string;
  at: number;
}): broadcastframe {
  if (input.summary.trim() === "") throw new Error("The broadcast frame needs its summary.");
  return { channel: input.channel, surface: input.surface, summary: input.summary, at: input.at };
}

/** Maps one audit kind onto the broadcast channel its frame rides: run control kinds carry run state, session store kinds carry session updates and the rest streams as logstream frames. */
export function broadcastchannelof(kind: string): broadcastchannelkind {
  if (
    [
      "session",
      "proposal",
      "approval",
      "action",
      "stop",
      "pause",
      "resume",
      "complete",
      "cancel",
      "error",
      "capability",
    ].includes(kind)
  )
    return "runstate";
  if (
    [
      "notes",
      "scratchpad",
      "summary",
      "recall",
      "correction",
      "consentmemory",
      "search",
      "vault",
      "gate",
      "grant",
      "revoke",
      "expiry",
      "deny",
    ].includes(kind)
  )
    return "sessions";
  if (["configure", "transparency"].includes(kind)) return "settings";
  return "logstream";
}

/** Routes one surface action through the command bus: every action rides the same policy gates before it dispatches and the verdict names the gate that decided. */
export function busrouteaction(
  action: surfaceaction,
  input: {
    sessionactive: boolean;
    granted: string[];
    planreviewed: boolean;
    planstate: string;
    text?: string;
    origin?: string;
  },
): surfaceroute {
  const entry = surfacepalette().find((candidate) => candidate.action.command === action.command);
  if (entry === undefined)
    return {
      dispatched: false,
      gate: "commandbus",
      reason: `The ${action.surface} asked for the unknown ${action.command} command; the bus routes only catalog commands.`,
    };
  const permission = paletteactiongate({
    action: entry.action,
    granted: input.granted,
    sessionactive: input.sessionactive,
  });
  if (!permission.allowed)
    return {
      dispatched: false,
      gate: "paletteactiongate",
      reason: permission.reason ?? "The command misses its granted permission.",
    };
  if (action.command === "starttask") {
    const proposal = taskinputproposalgate({ text: input.text ?? "", origin: input.origin ?? "", direct: false });
    if (!proposal.allowed)
      return {
        dispatched: false,
        gate: "taskinputproposalgate",
        reason: proposal.reason ?? "The task submission refuses.",
      };
  }
  if (action.command === "stepapprove" || action.command === "diffpreview") {
    const review = planreviewgate({ reviewed: input.planreviewed, state: input.planstate as "pending" | "approved" });
    if (!review.allowed)
      return { dispatched: false, gate: "planreviewgate", reason: review.reason ?? "The plan review stays open." };
  }
  return {
    dispatched: true,
    gate: "commandbus",
    reason: `The ${action.command} action of the ${action.surface} routed through its policy gates and dispatches.`,
  };
}

/** The terminal command registry the cli grows: the palette definitions the extension registers share this registry, so one command catalog drives the surfaces and the cli with no drift between them. */
export function clicommands(
  palette: paletteentry[],
): Array<{ id: string; label: string; keywords: string[]; surface: string; terminal: boolean }> {
  const terminal = [
    {
      id: "manifest",
      label: "Validate the extension manifest with the deep manifest checks",
      keywords: ["manifest", "permissions", "identity", "validate", "csp", "icons"],
      surface: "terminal",
      terminal: true,
    },
    {
      id: "describe",
      label: "Print the frozen capability manifest of every surface with the protocolv2 negotiation line",
      keywords: [
        "describe",
        "capmanifest",
        "surface",
        "freeze",
        "protocol",
        "capabilities",
        "messages",
        "kinds",
        "permissions",
      ],
      surface: "terminal",
      terminal: true,
    },
    {
      id: "commands",
      label: "Print the shared command registry of the palette and the cli",
      keywords: ["commands", "registry", "palette", "cli", "surface"],
      surface: "terminal",
      terminal: true,
    },
    {
      id: "planlint",
      label: "Lint plan files",
      keywords: ["planlint", "lint", "plan", "diagnostics", "rules"],
      surface: "terminal",
      terminal: true,
    },
    {
      id: "migrateplan",
      label: "Convert a foreign plan source into the reviewed plan grammar",
      keywords: [
        "migrateplan",
        "convert",
        "import",
        "v1",
        "automa",
        "selenium",
        "uivision",
        "tabular",
        "migration",
        "plan",
      ],
      surface: "terminal",
      terminal: true,
    },
    {
      id: "recipes",
      label: "List the example gallery and validate one recipe entry",
      keywords: ["recipes", "gallery", "examples", "scraping", "forms", "testing", "monitoring", "agents", "dryrun"],
      surface: "terminal",
      terminal: true,
    },
    {
      id: "flowrun",
      label: "Run a plan file",
      keywords: ["flowrun", "run", "plan", "terminal", "consent"],
      surface: "terminal",
      terminal: true,
    },
    {
      id: "runworkflow",
      label: "Run a saved workflow with checkpoints and an audit trail file",
      keywords: ["runworkflow", "workflow", "replay", "checkpoint", "resume", "dryrun"],
      surface: "terminal",
      terminal: true,
    },
    {
      id: "exportdata",
      label: "Export session, audit or extraction data",
      keywords: ["exportdata", "export", "session", "audit", "extraction", "csv", "jsonl", "markdown"],
      surface: "terminal",
      terminal: true,
    },
    {
      id: "headless",
      label: "Replay a plan against recorded page state fixtures",
      keywords: ["headless", "fixture", "replay", "recorded", "library"],
      surface: "terminal",
      terminal: true,
    },
    {
      id: "serve",
      label: "Serve the mcp server mode over stdio and a localhost http listener",
      keywords: ["serve", "mcp", "model", "context", "protocol", "stdio", "http", "jsonrpc"],
      surface: "terminal",
      terminal: true,
    },
    {
      id: "native",
      label: "Install, remove or diagnose the optional native host of the native bridge",
      keywords: ["native", "host", "bridge", "companion", "install", "uninstall", "diagnostics", "messaging"],
      surface: "terminal",
      terminal: true,
    },
    {
      id: "export",
      label: "Export runs, extractions and notes",
      keywords: ["export", "csv", "json", "log", "runs", "extractions", "notes"],
      surface: "terminal",
      terminal: true,
    },
    {
      id: "init",
      label: "Scaffold a plan file",
      keywords: ["init", "scaffold", "plan", "template"],
      surface: "terminal",
      terminal: true,
    },
    {
      id: "doctor",
      label: "Probe runtime capabilities",
      keywords: ["doctor", "capabilities", "runtime", "probe", "matrix"],
      surface: "terminal",
      terminal: true,
    },
    {
      id: "help",
      label: "List every command with the version banner and the exit codes",
      keywords: ["help", "usage", "commands", "version"],
      surface: "terminal",
      terminal: true,
    },
  ];
  const shared = palette.map((entry) => ({
    id: entry.id,
    label: entry.label,
    keywords: entry.keywords,
    surface: entry.action.surface,
    terminal: false,
  }));
  return [...terminal, ...shared];
}

/** The fixed keyboard focus order of the review dialog of the 2.0.2 final polish (roadmap rc.2 item 34): the keyboard reads the step summary first, then walks the approve, revise and reject controls, so the review dialog answers one predictable sequence instead of the tab order the markup happens to carry. */
export const reviewdialogorder: readonly ("readsummary" | "approve" | "revise" | "reject")[] = [
  "readsummary",
  "approve",
  "revise",
  "reject",
];

/** Computes the ordered tabindex sequence of the review dialog controls: every control of the fixed order earns its tabindex in sequence starting at one while the first control names the focus target the dialog moves focus to when it opens; a control list that repeats or empties a control refuses because a focus order that loses a control hides it from the keyboard. */
export function focusorderof(controls: readonly string[] = reviewdialogorder): {
  order: Array<{ control: string; tabindex: number }>;
  focusfirst: string;
} {
  const seen = new Set<string>();
  for (const control of controls) {
    if (control.trim() === "") throw new Error("The review dialog focus order needs every control named.");
    if (seen.has(control))
      throw new Error(
        `The review dialog focus order lists the control ${control} twice; one control earns one tabindex.`,
      );
    seen.add(control);
  }
  if (controls.length === 0) throw new Error("The review dialog focus order needs its controls.");
  const order = controls.map((control, index) => ({ control, tabindex: index + 1 }));
  return { order, focusfirst: controls[0]! };
}

/* ── Merged from statusviews.ts ── */
import { notificationcontentgate } from "./policy.js";

/**
 * Statusbadge, notification, recenttray and stetoast logic of the 1.1.65 family.
 * The user stays informed without watching: the statusbadge derives its idle, running, waiting and attention states from the run state and counts the waiting gates when attention is needed on the toolbar icon; notifydone fires on run completion with a deep link to the runsummary while notifyattention fires on gate waits, phishguard blocks and deferrals with a deep link to the exact waiting step and every notification respects the os do not disturb state and shows page content only after its consent; the recenttray lists the latest runs in the popup with resume for halted runs and reopen for completed ones; and the stetoasts confirm step completion with kind and duration, stacking with a bounded live count and a history view.
 * No depth or live count is ever hardcoded: the recenttray depth and the toast live count stay user choices with no engine cap, and no notification ever bypasses the content consent.
 */

/** Derives the statusbadge state of the toolbar icon from the run state: idle with no run, running while the approved plan executes, waiting while a gate holds and attention when waiting gates count above zero. */
export function statusbadgeof(input: {
  planstate?: "pending" | "approved" | "rejected" | "cancelled" | "expired";
  waitingcount: number;
  runid?: string;
}): statusbadgestate {
  if (input.planstate === undefined) return { state: "idle", waitingcount: 0 };
  if (input.waitingcount > 0)
    return {
      state: "attention",
      waitingcount: input.waitingcount,
      ...(input.runid !== undefined ? { runid: input.runid } : {}),
    };
  if (input.planstate === "approved")
    return { state: "running", waitingcount: 0, ...(input.runid !== undefined ? { runid: input.runid } : {}) };
  if (input.planstate === "pending")
    return { state: "waiting", waitingcount: 0, ...(input.runid !== undefined ? { runid: input.runid } : {}) };
  return { state: "idle", waitingcount: 0, ...(input.runid !== undefined ? { runid: input.runid } : {}) };
}

/** Renders the toolbar badge text of one statusbadge state: attention names its waiting gate count, running marks the live run and idle clears the badge. */
export function badgetextof(state: statusbadgestate): string {
  if (state.state === "attention") return String(state.waitingcount);
  if (state.state === "running") return "run";
  if (state.state === "waiting") return "wait";
  return "";
}

/** Names the badge color of one statusbadge state so the outline color follows the run state. */
export function badgecolorof(state: statusbadgestate): string {
  if (state.state === "attention") return "#b3261e";
  if (state.state === "running") return "#1a73e8";
  if (state.state === "waiting") return "#e37400";
  return "#5f6368";
}

/** Pluralizes one counted noun of the notification texts: english and the shipped pt bundle both keep the singular at exactly one while zero and counts above one take the plural — english appends the s while portuguese nouns ending in ão take the ões shape — with the portuguese nouns the notifications name carrying their bundle words so the localized plurals of the 2.0.2 final polish (roadmap rc.2 item 36) read "1 step", "3 steps", "1 etapa", "3 etapas" and "2 execuções" from the same rule. */
export function pluralize(count: number, noun: string, language = "en"): string {
  const portuguesenouns: Record<string, string> = {
    step: "etapa",
    capture: "captura",
    run: "execução",
    gate: "verificação",
  };
  const word = language === "pt" ? (portuguesenouns[noun] ?? noun) : noun;
  if (count === 1) return word;
  if (language === "pt" && word.endsWith("ão")) return `${word.slice(0, -2)}ões`;
  return `${word}s`;
}

/** Renders one counted noun as its localized count label: the number beside its correctly pluralized noun — "1 step", "3 steps", "1 capture", "4 captures" — so every notification body that carries a count reads its own grammar instead of a hardcoded plural. */
export function countlabel(count: number, noun: string, language = "en"): string {
  return `${count} ${pluralize(count, noun, language)}`;
}

/** Builds the notifydone payload of a completed run: the plain language title and body with the deep link to the runsummary; the body never carries page content so no consent is needed, and an absent summary falls back to the counted steps and captures the run recorded, pluralized through the countlabel grammar so one step reads "1 step" while three read "3 steps". */
export function notifydoneof(input: {
  runid: string;
  origin: string;
  summary: string;
  steps?: number;
  captures?: number;
  language?: string;
  at: number;
}): notificationpayload {
  if (input.runid.trim() === "") throw new Error("The done notification needs its run id.");
  const countedsteps = input.steps !== undefined ? ` of the ${countlabel(input.steps, "step", input.language)}` : "";
  const countedcaptures =
    input.captures !== undefined ? ` beside ${countlabel(input.captures, "capture", input.language)}` : "";
  const fallback =
    input.steps === undefined && input.captures === undefined
      ? `The run of ${input.origin} completed; the runsummary holds every step outcome.`
      : `The run of ${input.origin} completed; the runsummary holds every outcome${countedsteps}${countedcaptures}.`;
  return {
    id: randomid(),
    kind: "done",
    title: "The run completed",
    body: input.summary.trim() === "" ? fallback : input.summary,
    deeplink: `#run-${input.runid}`,
    runid: input.runid,
    content: false,
    at: input.at,
  };
}

/** Builds the notifyattention payload of a gate wait, a phishguard block or a deferral: the deep link opens the exact waiting step of the run; a body that carries page content needs its consent before it builds, and an optional waiting gate count appends its pluralized count so "1 gate waits" never reads "1 gates wait". */
export function notifyattentionof(input: {
  runid: string;
  stepid: string;
  cause: "gatewait" | "phishguard" | "deferral";
  reason: string;
  waitinggates?: number;
  language?: string;
  content?: boolean;
  consent?: boolean;
  at: number;
}): notificationpayload {
  if (input.stepid.trim() === "") throw new Error("The attention notification needs its waiting step.");
  const gate = notificationcontentgate({ content: input.content === true, consent: input.consent === true });
  if (!gate.allowed) throw new Error(gate.reason ?? "The attention notification refuses its page content.");
  const waiting =
    input.waitinggates === undefined ? "" : ` (${countlabel(input.waitinggates, "gate", input.language)} waiting)`;
  return {
    id: randomid(),
    kind: "attention",
    title:
      input.cause === "gatewait"
        ? "The run waits for review"
        : input.cause === "phishguard"
          ? "The phishguard blocked a step"
          : "The run deferred a step",
    body: `${input.reason}${waiting}`,
    deeplink: `#step-${input.stepid}`,
    runid: input.runid,
    stepid: input.stepid,
    content: input.content === true,
    at: input.at,
  };
}

/** Applies the os do not disturb state to one notification: a quiet os suppresses the toast while the deep link stays in the history for the user to open. */
export function notificationrespectsdnd(payload: notificationpayload, dnd: boolean): { show: boolean; reason: string } {
  if (dnd)
    return {
      show: false,
      reason: `The os stays in do not disturb, so the ${payload.kind} notification holds its deep link ${payload.deeplink} in the history instead of showing.`,
    };
  return { show: true, reason: `The ${payload.kind} notification shows with its deep link ${payload.deeplink}.` };
}

/** Builds one recenttray entry: the run id, the origin, the outcome, the title and the time; a halted run offers resume while a completed run offers reopen. */
export function recenttrayentryof(input: {
  runid: string;
  origin: string;
  outcome: "running" | "completed" | "halted" | "failed";
  title: string;
  at: number;
}): recenttrayentry {
  if (input.runid.trim() === "") throw new Error("The recenttray entry needs its run id.");
  return {
    runid: input.runid,
    origin: input.origin,
    outcome: input.outcome,
    title: input.title,
    at: input.at,
    resumable: input.outcome === "halted",
    reopenable: input.outcome === "completed" || input.outcome === "failed",
  };
}

/** Appends one recenttray entry with the newest first: the user configured depth keeps the latest runs while an absent depth keeps every run. */
export function recenttrayafter(
  entries: recenttrayentry[],
  entry: recenttrayentry,
  depth: number | undefined,
): recenttrayentry[] {
  const appended = [entry, ...entries.filter((candidate) => candidate.runid !== entry.runid)];
  if (depth === undefined) return appended;
  if (!Number.isInteger(depth) || depth <= 0) return appended;
  return appended.slice(0, depth);
}

/** Lists the actions one recenttray entry offers: resume for a halted run and reopen for a completed or failed one. */
export function recenttrayactions(entry: recenttrayentry): string[] {
  const actions: string[] = [];
  if (entry.resumable) actions.push("resume");
  if (entry.reopenable) actions.push("reopen");
  return actions;
}

/** Builds one stetoast: the step completion confirmation with the step kind and its duration in milliseconds. */
export function stetoastof(input: { stepid: string; kind: string; durationms: number; at: number }): stetoast {
  if (input.stepid.trim() === "") throw new Error("The stetoast needs its step.");
  return { id: randomid(), stepid: input.stepid, kind: input.kind, durationms: input.durationms, at: input.at };
}

/** Stacks one steteoast with a bounded live count: the live stack keeps the newest toasts inside the user configured bound while the full history stays queryable; an absent bound keeps every toast live. */
export function stetoaststackafter(
  toasts: stetoast[],
  toast: stetoast,
  livecount: number | undefined,
): { live: stetoast[]; history: stetoast[] } {
  const history = [...toasts, toast];
  if (livecount === undefined || !Number.isInteger(livecount) || livecount <= 0) return { live: history, history };
  return { live: history.slice(-livecount), history };
}

/** Reads the toast history newest first for the history view. */
export function stetoasthistory(toasts: stetoast[]): stetoast[] {
  return [...toasts].reverse();
}

/* ── Merged from pickerviews.ts ── */
import { pickeroverlaygate } from "./policy.js";

/**
 * Pickeroverlay, targethalo, guidedtips and pagechips logic of the 1.1.65 family.
 * Selection and inline review live here: the pickeroverlay starts from the sidepanel, lists the element candidates of the granted origin with stability scored selectors and locks one candidate for the proposed step; the targethalo outlines the active target element during a run with its color following the step state; the guidedtips explain the selector choice during picker sessions and dismiss and recall from the optionspage; and the pagechips render inline confirmations anchored to the target element with approve and reject actions whose resolutions write to the immutable log exactly like stepapprove.
 * No candidate count or scoring depth is ever hardcoded: every bound stays the user's choice, and no picker read or pagechip resolution ever bypasses the human review.
 */

/** Scores one element candidate for selector stability: an id selector scores highest, stable attribute and role selectors score next, a unique text anchor lifts the score and positional selectors score lowest. */
export function stabilityscoreof(input: {
  selector: string;
  hasid: boolean;
  hasstableattributes: boolean;
  hasrole: boolean;
  textunique: boolean;
}): number {
  let score = 0;
  if (input.hasid) score += 40;
  if (input.hasstableattributes) score += 25;
  if (input.hasrole) score += 15;
  if (input.textunique) score += 10;
  if (input.selector.trim() === "") score -= 20;
  else if (input.selector.includes(":nth-child") || input.selector.includes(":nth-of-type")) score -= 15;
  return Math.max(0, Math.min(100, score));
}

/** Builds one picker candidate with its stability score and the plain language reason the score stands. */
export function pickercandidateof(input: {
  selector: string;
  text?: string;
  role?: string;
  hasid: boolean;
  hasstableattributes: boolean;
  hasrole: boolean;
  textunique: boolean;
}): pickercandidate {
  const score = stabilityscoreof(input);
  const reasons: string[] = [];
  if (input.hasid) reasons.push("the id anchors the selector");
  if (input.hasstableattributes) reasons.push("stable attributes back the selector");
  if (input.hasrole) reasons.push("the aria role names the element");
  if (input.textunique) reasons.push("the text stays unique on the page");
  if (reasons.length === 0) reasons.push("only the positional shape anchors the selector");
  return {
    selector: input.selector,
    ...(input.text !== undefined && input.text !== "" ? { text: input.text } : {}),
    ...(input.role !== undefined && input.role !== "" ? { role: input.role } : {}),
    stabilityscore: score,
    reason: `The stability score of ${score} stands because ${reasons.join(", ")}.`,
  };
}

/** Starts one pickeroverlay session from the sidepanel: the origin grants gate the reads and the candidates rank by their stability score. */
export function pickersessionstart(input: {
  origin: string;
  granted: string[];
  candidates: pickercandidate[];
  at: number;
}): pickersession {
  const gate = pickeroverlaygate({ origin: input.origin, granted: input.granted });
  if (!gate.allowed) throw new Error(gate.reason);
  return { id: randomid(), origin: input.origin, candidates: rankcandidates(input.candidates), startedat: input.at };
}

/** Ranks the picker candidates by their stability score with the most stable selector first. */
export function rankcandidates(candidates: pickercandidate[]): pickercandidate[] {
  return [...candidates].sort((left, right) => right.stabilityscore - left.stabilityscore);
}

/** Locks one picker candidate for the proposed step: the locked session carries the step id and the chosen selector while a second lock on the same session refuses. */
export function lockcandidate(session: pickersession, candidateindex: number, stepid: string): pickersession {
  const candidate = session.candidates[candidateindex];
  if (candidate === undefined) throw new Error(`The picker session knows no candidate ${candidateindex} to lock.`);
  if (session.lockedstepid !== undefined)
    throw new Error(
      `The picker session already locks its candidate for the step ${session.lockedstepid}; one session locks one candidate.`,
    );
  return { ...session, lockedstepid: stepid, lockedselector: candidate.selector };
}

/** Builds one targethalo geometry descriptor: the step it outlines, the target selector, the pixel rect and the step state that colors the outline. */
export function haloof(input: {
  stepid: string;
  selector: string;
  rect: { x: number; y: number; width: number; height: number };
  state: targethalo["state"];
}): targethalo {
  if (input.selector.trim() === "") throw new Error("The targethalo needs its target selector.");
  return { stepid: input.stepid, selector: input.selector, rect: input.rect, state: input.state };
}

/** Colors the targethalo outline by step state: pending stays gray, running blue, waiting amber, done green, failed red and halted dark. */
export function halocolorof(state: targethalo["state"]): string {
  if (state === "running") return "#1a73e8";
  if (state === "waiting") return "#e37400";
  if (state === "done") return "#188038";
  if (state === "failed") return "#b3261e";
  if (state === "halted") return "#3c4043";
  return "#5f6368";
}

/** The guidedtips content bound to picker sessions: each tip explains one selector choice with its surface and its picker step. */
export function guidedtips(): guidedtip[] {
  return [
    {
      id: "selectorstability",
      surface: "sidepanel",
      title: "Selector stability",
      body: "Devthink scores every candidate selector by its stability: an id anchor, stable attributes, an aria role and a unique text each lift the score while a positional shape lowers it, so the proposed step binds to the selector least likely to break.",
      pickerstep: "candidatepick",
    },
    {
      id: "candidatelock",
      surface: "sidepanel",
      title: "Locking a candidate",
      body: "Lock one candidate to bind it to the proposed step; one picker session locks one candidate and the locked selector rides the step for its review.",
      pickerstep: "candidatelock",
    },
    {
      id: "haloreadout",
      surface: "sidepanel",
      title: "The halo read out",
      body: "During a run the targethalo outlines the active target element and its color follows the step state: gray while pending, blue while running, amber at a gate, green when done, red on failure and dark when halted.",
      pickerstep: "halotracking",
    },
  ];
}

/** Dismisses one guidedtip: the dismissed tip never shows again on its own while the optionspage recalls every dismissed tip on demand. */
export function guidedtipdismiss(tips: guidedtip[], dismissed: string[], tipid: string): string[] {
  const tip = tips.find((candidate) => candidate.id === tipid);
  if (tip === undefined) throw new Error(`The guidedtips know no ${tipid} tip.`);
  return [...new Set([...dismissed, tipid])];
}

/** Recalls every dismissed guidedtip: the recall clears the dismissed list so the tips show again. */
export function guidedtiprecall(dismissed: string[]): string[] {
  return [];
}

/** Builds one pagechip confirmation anchored to the target element of a gated step: the chip renders inline on the page with its approve and reject actions. */
export function pagechipof(input: {
  stepid: string;
  selector: string;
  origin: string;
  at: number;
}): pagechipconfirmation {
  if (input.stepid.trim() === "") throw new Error("The pagechip needs its step.");
  if (input.selector.trim() === "") throw new Error("The pagechip needs its anchor selector.");
  return { id: randomid(), stepid: input.stepid, selector: input.selector, origin: input.origin, at: input.at };
}

/** Resolves one pagechip with its approve or reject action: the resolution carries its human surface and writes to the immutable log exactly like a stepapprove resolution. */
export function pagechipresolve(
  chip: pagechipconfirmation,
  resolution: "approve" | "reject",
  surface: uisurface | "background",
  at: number,
): { chip: pagechipconfirmation; logevent: { kind: "review"; summary: string; stepid: string } } {
  if (surface === "background")
    throw new Error(
      "The pagechip resolution needs its distinct human action from a surface; the background never resolves a review on its own.",
    );
  const resolved: pagechipconfirmation = { ...chip, resolution, resolvedat: at };
  return {
    chip: resolved,
    logevent: {
      kind: "review",
      stepid: chip.stepid,
      summary: `The user ${resolution === "approve" ? "approved" : "rejected"} the step ${chip.stepid} of ${chip.origin} from the pagechip anchored to ${chip.selector} on the ${surface}; one distinct human action resolved the step alone.`,
    },
  };
}

/* ── Merged from tourviews.ts ── */

/**
 * Featuretour and a11ylabels logic of the 1.1.65 family.
 * The interface teaches itself here: the featuretour replays the onboarding walkthrough on demand and adds its own stops for the datagrid, the compareviewer and the pickeroverlay with the surface and the focus of every stop; and the a11ylabels name every control across the popup, the sidepanel, the dashboardpage and the optionspage with role, name, state and value for screen readers, following the language of the interface.
 * No stop count or label set is ever hardcoded: every tour and label reads the same locale bundles, and no tour stop ever bypasses the human review.
 */

/** The featuretour stops: the onboarding walkthrough replays on demand while the added stops walk the datagrid, the compareviewer and the pickeroverlay with their surface and focus. */
export function featuretourstops(): featuretourstop[] {
  return [
    {
      id: "origingrants",
      surface: "popup",
      focus: "#allowlist",
      title: "Origin grants",
      body: "Devthink denies automation by default; grant one exact origin at a time and every run stays inside the granted origins.",
      order: 1,
    },
    {
      id: "planreview",
      surface: "sidepanel",
      focus: "#plancards",
      title: "Plan review",
      body: "Every task becomes a plan of reviewed steps; read the plancards of each risk class and approve, reject or edit one step at a time.",
      order: 2,
    },
    {
      id: "runcontrol",
      surface: "sidepanel",
      focus: "#timeline",
      title: "Run control",
      body: "Runs start, pause, resume and cancel under your hand while the stepstimeline follows every transition.",
      order: 3,
    },
    {
      id: "logaudit",
      surface: "dashboardpage",
      focus: "#sessiongrid",
      title: "Log audit",
      body: "The immutable log chains every step transition with masked values; verify the chain and copy a verified range as an audit excerpt.",
      order: 4,
    },
    {
      id: "datagrid",
      surface: "sidepanel",
      focus: "#datagrid",
      title: "The datagrid",
      body: "Extraction results render as a grid with inferred column types; sort and filter locally, select a row range and export csv, json or clipboard with masked values only.",
      order: 5,
    },
    {
      id: "compareviewer",
      surface: "sidepanel",
      focus: "#compareviewer",
      title: "The compareviewer",
      body: "Every executed write step pairs its before and after captures; the slider overlays the two so you see exactly what the step changed.",
      order: 6,
    },
    {
      id: "pickeroverlay",
      surface: "sidepanel",
      focus: "#picker",
      title: "The pickeroverlay",
      body: "Start a picker session to list the element candidates of the granted origin with stability scored selectors; lock one candidate for the proposed step.",
      order: 7,
    },
    {
      id: "chunkextract",
      surface: "sidepanel",
      focus: "#datagrid",
      title: "Chunked extraction",
      body: "Big tables extract in resumable row windows: the datagrid appends every window as it arrives, the cursor progress line shows the rows extracted so far, and an interruption resumes from the fingerprint verified cursor.",
      order: 8,
    },
  ];
}

/** Orders the featuretour stops by their stop order for the replay. */
export function featuretourordered(stops: featuretourstop[]): featuretourstop[] {
  return [...stops].sort((left, right) => left.order - right.order);
}

/** The stop of the featuretour at one position for the replay walkthrough. */
export function featuretourstopat(stops: featuretourstop[], position: number): featuretourstop | undefined {
  return featuretourordered(stops)[position];
}

/** Builds one a11ylabel: the control, its role, its accessible name and its optional state and value for screen readers. */
export function a11ylabelof(input: {
  control: string;
  role: a11ylabel["role"];
  name: string;
  state?: string;
  value?: string;
}): a11ylabel {
  if (input.control.trim() === "") throw new Error("The a11ylabel needs its control.");
  if (input.name.trim() === "") throw new Error("The a11ylabel needs its accessible name.");
  return {
    control: input.control,
    role: input.role,
    name: input.name,
    ...(input.state !== undefined ? { state: input.state } : {}),
    ...(input.value !== undefined ? { value: input.value } : {}),
  };
}

/** The a11ylabels of one surface: every control across the popup, the sidepanel, the dashboardpage and the optionspage carries its role, name, state and value. */
export function a11ylabelsfor(surface: uisurface): a11ylabel[] {
  const labels: Record<uisurface, a11ylabel[]> = {
    popup: [
      a11ylabelof({ control: "taskinput", role: "textbox", name: "popup.taskinput.placeholder", state: "idle" }),
      a11ylabelof({ control: "submit", role: "button", name: "popup.taskinput.submit" }),
      a11ylabelof({ control: "palette", role: "button", name: "popup.palette.open" }),
      a11ylabelof({ control: "recenttray", role: "list", name: "popup.recent.title", value: "0 runs" }),
    ],
    sidepanel: [
      a11ylabelof({ control: "plantab", role: "tab", name: "sidepanel.tab.plan", state: "selected" }),
      a11ylabelof({ control: "runtab", role: "tab", name: "sidepanel.tab.run", state: "unselected" }),
      a11ylabelof({ control: "reviewtab", role: "tab", name: "sidepanel.tab.review", state: "unselected" }),
      a11ylabelof({ control: "datagrid", role: "table", name: "grid.empty" }),
      a11ylabelof({ control: "compareviewer", role: "slider", name: "sidepanel.data.compare", value: "50" }),
      a11ylabelof({ control: "picker", role: "button", name: "sidepanel.data.picker" }),
    ],
    dashboardpage: [
      a11ylabelof({ control: "sessiongrid", role: "table", name: "dashboard.title", value: "0 runs" }),
      a11ylabelof({ control: "historysearch", role: "search", name: "dashboard.history" }),
      a11ylabelof({ control: "dropzone", role: "region", name: "options.importexport.label" }),
    ],
    optionspage: [
      a11ylabelof({ control: "theme", role: "radiogroup", name: "options.theme.label", value: "system" }),
      a11ylabelof({ control: "locale", role: "combobox", name: "options.locale.label", value: "en" }),
      a11ylabelof({ control: "shortcuts", role: "group", name: "options.shortcuts.label" }),
      a11ylabelof({ control: "notifications", role: "switch", name: "options.notifications.label", state: "off" }),
      a11ylabelof({ control: "importexport", role: "region", name: "options.importexport.label" }),
      a11ylabelof({ control: "tour", role: "button", name: "options.tour.label" }),
    ],
    onboarding: [a11ylabelof({ control: "onboarding", role: "dialog", name: "options.tour.label", state: "open" })],
    omnibox: [a11ylabelof({ control: "omnibox", role: "textbox", name: "popup.taskinput.placeholder" })],
    page: [a11ylabelof({ control: "pagechip", role: "group", name: "pagechip.approve", state: "pending" })],
  };
  return labels[surface];
}

/** Localizes one a11ylabel through the locale bundles: the accessible name resolves in the language of the interface with the english fallback so every control keeps a spoken name. */
export function a11ylabellocalized(label: a11ylabel, bundles: localebundle[], language: string): a11ylabel {
  return { ...label, name: localestring(bundles, language, label.name) };
}

/** Localizes every a11ylabel of one surface so screen readers follow the language of the interface. */
export function a11ylabelslocalizedfor(surface: uisurface, bundles: localebundle[], language: string): a11ylabel[] {
  return a11ylabelsfor(surface).map((label) => a11ylabellocalized(label, bundles, language));
}

/* ── Merged from evidenceviews.ts ── */
import { shotpanelgate } from "./policy.js";

/**
 * Shotpanel and compareviewer logic of the 1.1.65 family.
 * Evidence views live here: the shotpanel previews the capture of every step with its capture provenance and redaction verdicts and zooms and pans the large stitched captures; the compareviewer pairs the before and after captures of every executed write step and overlays the two captures with a slider so the user sees exactly what the step changed.
 * No zoom factor, pan step or pixel ceiling is ever hardcoded: every view stays a user choice, and no capture of an ungranted origin ever opens in the panel.
 */

/** Builds one shotpanel view: the step, the run, the capture id, the capture provenance, the redaction verdicts and the zoom and pan the user set; the capture origin must hold a granted origin. */
export function shotpanelof(input: {
  stepid: string;
  runid: string;
  captureid: string;
  provenance: "viewport" | "fullpage" | "element" | "region";
  origin: string;
  granted: string[];
  redactions?: Array<{ region: string; verdict: string }>;
  at: number;
}): shotpanelview {
  const gate = shotpanelgate({ captureorigin: input.origin, granted: input.granted });
  if (!gate.allowed) throw new Error(gate.reason);
  if (input.stepid.trim() === "") throw new Error("The shotpanel view needs its step.");
  return {
    id: randomid(),
    stepid: input.stepid,
    runid: input.runid,
    captureid: input.captureid,
    provenance: input.provenance,
    origin: input.origin,
    redactions: input.redactions ?? [],
    zoom: 1,
    pan: { x: 0, y: 0 },
    at: input.at,
  };
}

/** Zooms one shotpanel view: the factor multiplies the current zoom while a non positive zoom refuses the change. */
export function shotpanelzoom(view: shotpanelview, factor: number): shotpanelview {
  if (!(factor > 0)) throw new Error("The shotpanel zoom factor stays a positive number.");
  return { ...view, zoom: view.zoom * factor };
}

/** Pans one shotpanel view: the offsets move the viewport over the large stitched capture so the user inspects any region. */
export function shotpanelpan(view: shotpanelview, offset: { x: number; y: number }): shotpanelview {
  return { ...view, pan: { x: view.pan.x + offset.x, y: view.pan.y + offset.y } };
}

/** Builds one compareviewer pair: the step, the before capture, the after capture and the slider that starts at the middle so the overlay splits the two captures. */
export function comparepairof(input: {
  stepid: string;
  beforecaptureid: string;
  aftercaptureid: string;
}): compareviewerpair {
  if (input.stepid.trim() === "") throw new Error("The compareviewer pair needs its step.");
  if (input.beforecaptureid === input.aftercaptureid)
    throw new Error("The compareviewer pair needs its distinct before and after captures.");
  return {
    id: randomid(),
    stepid: input.stepid,
    beforecaptureid: input.beforecaptureid,
    aftercaptureid: input.aftercaptureid,
    slidervalue: 50,
  };
}

/** Moves the compareviewer slider: the value stays between zero and one hundred so the overlay splits the before and after captures at the user chosen position. */
export function overlayslider(pair: compareviewerpair, value: number): compareviewerpair {
  if (!Number.isFinite(value) || value < 0 || value > 100)
    throw new Error("The compareviewer slider stays between zero and one hundred.");
  return { ...pair, slidervalue: value };
}

/** Pairs the before and after captures of every executed write step: only a step that changed page or browser state earns a pair, and each pair names its step. */
export function comparepairsforsteps(
  steps: Array<{ stepid: string; risk: "read" | "interaction" | "sensitive"; writeexecuted: boolean }>,
  captures: Record<string, { beforecaptureid?: string; aftercaptureid?: string }>,
): compareviewerpair[] {
  const pairs: compareviewerpair[] = [];
  for (const step of steps) {
    if (!step.writeexecuted) continue;
    const capture = captures[step.stepid];
    if (capture?.beforecaptureid === undefined || capture?.aftercaptureid === undefined) continue;
    pairs.push(
      comparepairof({
        stepid: step.stepid,
        beforecaptureid: capture.beforecaptureid,
        aftercaptureid: capture.aftercaptureid,
      }),
    );
  }
  return pairs;
}

/* ── Merged from datagrid.ts ── */

/**
 * Datagrid and exportmenu logic of the 1.1.65 family.
 * The extraction half of the interface lives here: a datagrid view arranges the extraction result of one run into columns and rows with the column types inferred from the values themselves, sorts and filters rows locally inside the surface, and selects a row range so a partial export ships only what the user chose; the exportmenu offers csv, json and clipboard formats scoped to the selection, one step or the whole run and writes masked values only, honoring the maskinputs verdicts of every sensitive field shape so no clear value ever leaves the grid.
 * No row count, column count or byte ceiling is ever hardcoded: every bound stays the user's choice with no engine cap, and no export path ever bypasses the mask verdicts.
 */

/** Infers one column type from its observed values: numbers, booleans and iso dates infer their type while every other shape stays text; an all empty column infers empty. */
export function infercolumntype(values: string[]): datagridcolumn["type"] {
  const present = values.filter((value) => value.trim() !== "");
  if (present.length === 0) return "empty";
  if (present.every((value) => /^-?\d+(?:\.\d+)?$/.test(value.trim()))) return "number";
  if (present.every((value) => value.trim() === "true" || value.trim() === "false")) return "boolean";
  if (present.every((value) => !Number.isNaN(Date.parse(value.trim())) && /\d{4}-\d{2}-\d{2}/.test(value.trim())))
    return "date";
  return "text";
}

/** Builds the inferred columns of one extraction result: every field of every row becomes one column with its type inferred from the observed values. */
export function datagridcolumnsof(rows: Array<Record<string, string>>): datagridcolumn[] {
  const fields = [...new Set(rows.flatMap((row) => Object.keys(row)))];
  return fields.map((field) => ({
    field,
    label: field,
    type: infercolumntype(rows.map((row) => row[field] ?? "")),
    inferred: true,
  }));
}

/** Builds one datagrid view of an extraction result: the title, the origin it ran on, the run it belongs to, the inferred columns and the rows with their original order as index. */
export function datagridof(input: {
  title: string;
  origin: string;
  runid: string;
  rows: Array<Record<string, string>>;
  at: number;
}): datagridview {
  if (input.title.trim() === "") throw new Error("The datagrid view needs its title.");
  if (input.origin.trim() === "") throw new Error("The datagrid view needs its origin.");
  if (input.rows.length === 0) throw new Error("The datagrid view needs at least one extracted row.");
  const columns = datagridcolumnsof(input.rows);
  const rows: datagridrow[] = input.rows.map((row, index) => ({
    index,
    values: Object.fromEntries(columns.map((column) => [column.field, row[column.field] ?? ""])),
  }));
  return {
    id: randomid(),
    title: input.title.trim(),
    origin: input.origin.trim(),
    runid: input.runid,
    columns,
    rows,
    at: input.at,
  };
}

/** Sorts the datagrid rows locally by one column: text sorts lexicographically while numbers, booleans and dates sort by their parsed value; an absent direction keeps the original order. */
export function sortdatagridrows(
  view: datagridview,
  input: { field: string; direction: "ascending" | "descending" },
): datagridview {
  const column = view.columns.find((candidate) => candidate.field === input.field);
  if (column === undefined) throw new Error(`The datagrid knows no ${input.field} column to sort.`);
  const rows = [...view.rows]
    .sort((left, right) => {
      const leftvalue = left.values[input.field] ?? "";
      const rightvalue = right.values[input.field] ?? "";
      let compared = 0;
      if (column.type === "number") compared = Number(leftvalue) - Number(rightvalue);
      else if (column.type === "boolean") compared = (leftvalue === "true" ? 1 : 0) - (rightvalue === "true" ? 1 : 0);
      else if (column.type === "date") compared = Date.parse(leftvalue) - Date.parse(rightvalue);
      else compared = leftvalue.localeCompare(rightvalue);
      return input.direction === "descending" ? -compared : compared;
    })
    .map((row, index) => ({ ...row, index }));
  return { ...view, rows };
}

/** Filters the datagrid rows locally by one text query: a row stays when any column value contains the query; an empty query keeps every row. */
export function filterdatagridrows(view: datagridview, text: string): datagridview {
  const query = text.trim().toLowerCase();
  if (query === "") return view;
  const rows = view.rows.filter((row) =>
    Object.values(row.values).some((value) => value.toLowerCase().includes(query)),
  );
  return { ...view, rows };
}

/** Selects one inclusive row range for a partial export: the rows inside the range carry their selected mark while the rest clears. */
export function selectrowrange(view: datagridview, from: number, to: number): datagridview {
  if (from < 0 || to < from || to >= view.rows.length)
    throw new Error(
      `The row range ${from} to ${to} names no inclusive slice of the ${view.rows.length} row${view.rows.length === 1 ? "" : "s"}.`,
    );
  const rows = view.rows.map((row) => ({ ...row, selected: row.index >= from && row.index <= to }));
  return { ...view, rows };
}

/** The rows one export ships: a selection scope keeps the selected rows only while the step and run scopes ship every row of the grid. */
export function exportrowsof(view: datagridview, scope: exportmenudescriptor["scope"]): datagridrow[] {
  if (scope === "selection") {
    const selected = view.rows.filter((row) => row.selected === true);
    if (selected.length === 0)
      throw new Error("The selection export needs its selected row range; select rows before the export.");
    return selected;
  }
  return view.rows;
}

/** Builds the exportmenu descriptors of one datagrid: the csv, json and clipboard formats scoped to the selection, one step or the whole run. */
export function exportmenudescriptors(): exportmenudescriptor[] {
  return (["csv", "json", "clipboard"] as const).flatMap((format) =>
    (["selection", "step", "run"] as const).map((scope) => ({
      format,
      scope,
      destination: format === "clipboard" ? "clipboard" : "download",
    })),
  );
}

/** Masks one field value when the mask verdicts name it: a masked value never renders in the clear while every other value ships as extracted. */
export function maskedvalueof(
  value: string,
  field: string,
  maskverdicts: Record<string, string>,
): { value: string; masked: boolean } {
  const verdict = maskverdicts[field];
  if (verdict === undefined) return { value, masked: false };
  return { value: `${"•".repeat(Math.min(value.length, 8))} (${value.length} characters, masked)`, masked: true };
}

/** Escapes one csv field: a value with a quote, a comma or a newline wraps in quotes with its quotes doubled. */
function csvfield(value: string): string {
  if (/[",\n]/.test(value)) return `"${value.replaceAll('"', '""')}"`;
  return value;
}

/** Renders the export payload of one datagrid view: csv writes the header row and every shipping row, json writes the typed records and the clipboard format writes the csv text for the clipboard. */
export function exportdatagrid(
  view: datagridview,
  descriptor: exportmenudescriptor,
  maskverdicts: Record<string, string> = {},
): {
  format: exportmenudescriptor["format"];
  scope: exportmenudescriptor["scope"];
  destination: exportmenudescriptor["destination"];
  text: string;
  rows: number;
  maskedfields: string[];
} {
  const rows = exportrowsof(view, descriptor.scope);
  const maskedfields = [
    ...new Set(rows.flatMap((row) => Object.keys(row.values)).filter((field) => maskverdicts[field] !== undefined)),
  ];
  if (descriptor.format === "json") {
    const records = rows.map((row) =>
      Object.fromEntries(
        view.columns.map((column) => {
          const masked = maskedvalueof(row.values[column.field] ?? "", column.field, maskverdicts);
          return [
            column.field,
            column.type === "number" && !masked.masked
              ? Number(masked.value)
              : column.type === "boolean" && !masked.masked
                ? masked.value === "true"
                : masked.value,
          ];
        }),
      ),
    );
    return {
      format: descriptor.format,
      scope: descriptor.scope,
      destination: descriptor.destination,
      text: JSON.stringify(
        {
          view: view.title,
          origin: view.origin,
          runid: view.runid,
          columns: view.columns.map((column) => ({ field: column.field, type: column.type })),
          rows: records,
        },
        null,
        2,
      ),
      rows: records.length,
      maskedfields,
    };
  }
  const header = view.columns.map((column) => csvfield(column.label)).join(",");
  const lines = rows.map((row) =>
    view.columns
      .map((column) => csvfield(maskedvalueof(row.values[column.field] ?? "", column.field, maskverdicts).value))
      .join(","),
  );
  return {
    format: descriptor.format,
    scope: descriptor.scope,
    destination: descriptor.destination,
    text: [header, ...lines].join("\n"),
    rows: rows.length,
    maskedfields,
  };
}

/* ── Merged from virtlist.ts ── */

/**
 * Virtlist logic of the 1.1.68 family.
 * Long lists render through a virtualized window in every surface: the window keeps the visible row range, the measured height map holds the row heights the measurement pass records, and the row nodes recycle during scroll instead of rebuilding.
 * The row window stays the user's choice: an absent window renders every row, and no engine default ever caps a list.
 */

/** Builds the initial virtlist window of one surface at scroll top: the window starts at row zero, spans the user configured row count or every row when the user set none, and the height map starts empty. */
export function openvirtlist(input: { surface: string; total: number; rows?: number }): virtlistwindow {
  if (input.surface.trim() === "") throw new Error("The virtlist window needs its surface name.");
  const span = input.rows === undefined ? input.total : Math.min(input.rows, Math.max(input.total, 0));
  return { surface: input.surface, start: 0, end: span, total: input.total, heights: {}, recycled: 0 };
}

/** Moves one virtlist window to a scroll offset: the window keeps its span, clamps inside the row range and recycles the rows the previous window rendered when they stay inside the new range. */
export function scrollvirtlist(window: virtlistwindow, start: number, rows?: number): virtlistwindow {
  const span = rows ?? window.end - window.start;
  const clamped = Math.max(0, Math.min(start, Math.max(window.total - span, 0)));
  const end = Math.min(clamped + span, window.total);
  const previous = new Set(range(window.start, window.end));
  const current = new Set(range(clamped, end));
  let recycled = 0;
  for (const row of current) if (previous.has(row)) recycled += 1;
  return { ...window, start: clamped, end, recycled };
}

/** Measures the row heights of one virtlist window: the height map records the measured height of every rendered row while the rows outside the window keep their last measurement. */
export function measurevirtlistrows(window: virtlistwindow, measurements: Record<string, number>): virtlistwindow {
  return { ...window, heights: { ...window.heights, ...measurements } };
}

/** Reads the row slice one virtlist window renders: only the rows inside the window travel to the surface while the full list stays in memory. */
export function virtlistrows<T>(window: virtlistwindow, rows: T[]): T[] {
  return rows.slice(window.start, window.end);
}

/** Reads the estimated height of one virtlist window from its height map: measured rows count their measurement while unmeasured rows count the estimate the caller supplies because no engine default exists. */
export function virtlistheight(
  window: virtlistwindow,
  estimate: number,
): { measured: number; estimate: number; total: number } {
  const measured = Object.values(window.heights).reduce((sum, height) => sum + height, 0);
  const unmeasured = Math.max(window.total - Object.keys(window.heights).length, 0);
  return { measured, estimate, total: measured + unmeasured * estimate };
}

/** Reads the render savings of one virtlist window: the rows the surface avoided rendering beside the recycled nodes the scroll reused. */
export function virtlistsavings(window: virtlistwindow): { rendered: number; skipped: number; recycled: number } {
  const rendered = Math.max(window.end - window.start, 0);
  return { rendered, skipped: Math.max(window.total - rendered, 0), recycled: window.recycled };
}

/** Builds the height map key of one row so the per surface height maps the memory stores stay stable across scrolls. */
export function heightmapkey(surface: string, row: number): string {
  return `${surface}:${row}`;
}

/** Builds the per surface height map record the memory stores for reuse: the surface, its measured heights and the time of the measurement pass. */
export function heightmaprecord(input: { surface: string; heights: Record<string, number>; now: number }): {
  surface: string;
  heights: Record<string, number>;
  at: number;
} {
  if (input.surface.trim() === "") throw new Error("The height map needs its surface name.");
  return { surface: input.surface, heights: { ...input.heights }, at: input.now };
}

/** Exclusive row range helper of the virtualized windows. */
function range(start: number, end: number): number[] {
  const rows: number[] = [];
  for (let row = start; row < end; row += 1) rows.push(row);
  return rows;
}

/* ── Merged from siteprefs.ts ── */
import { siteprofilegate } from "./policy.js";

/**
 * Siteprofiles, darklight themes and locale logic of the 1.1.65 family.
 * The surface rounds out here: siteprofiles store the per site interface preferences (the theme, the shortcutkeys and the default view) beside the originprofiles policy preferences and activate automatically on their origin; the darklight theme follows the os preference with a manual override while its tokens cover every surface including the dashboardpage; and the locale bundles ship the interface strings of every supported language with an english fallback for missing strings and per language date, number and duration formatting.
 * No theme, language or profile is ever forced: every preference stays the user's choice, and no siteprofile ever adjusts a policy gate.
 */

/** Builds one siteprofile: the origin, the theme, the shortcutkeys, the default view and the update time; the origin must hold an https shape because the profile extends the originprofiles family. */
export function siteprofileof(input: {
  origin: string;
  theme?: siteprofile["theme"];
  shortcuts?: shortcutbinding[];
  defaultview?: string;
  at: number;
}): siteprofile {
  const gate = siteprofilegate({ origin: input.origin });
  if (!gate.allowed) throw new Error(gate.reason);
  return {
    origin: input.origin,
    ...(input.theme !== undefined ? { theme: input.theme } : {}),
    ...(input.shortcuts !== undefined ? { shortcuts: input.shortcuts } : {}),
    ...(input.defaultview !== undefined ? { defaultview: input.defaultview } : {}),
    updatedat: input.at,
  };
}

/** Tests whether one siteprofile activates on the given origin: the profile applies automatically when its origin matches the active origin exactly. */
export function siteprofileactive(profile: siteprofile, origin: string): boolean {
  return profile.origin === origin;
}

/** Resolves the effective siteprofile of one origin: the stored profile applies when its origin matches while an absent profile returns undefined and the global preferences keep governing. */
export function siteprofilefor(profiles: siteprofile[], origin: string): siteprofile | undefined {
  return profiles.find((profile) => siteprofileactive(profile, origin));
}

/** The darklight theme tokens of one mode: every surface, including the dashboardpage, reads the same token names so the theme covers the whole interface. */
export function darklighttokensof(mode: darklighttokens["mode"]): darklighttokens {
  const tokens: Record<string, string> =
    mode === "dark"
      ? {
          surface: "#1f1f1f",
          elevated: "#2b2b2b",
          text: "#e3e3e3",
          muted: "#9aa0a6",
          accent: "#8ab4f8",
          border: "#3c4043",
          focus: "#aecbfa",
          error: "#f28b82",
          success: "#81c995",
          warning: "#fdd663",
        }
      : {
          surface: "#ffffff",
          elevated: "#f8f9fa",
          text: "#202124",
          muted: "#5f6368",
          accent: "#1a73e8",
          border: "#dadce0",
          focus: "#174ea6",
          error: "#b3261e",
          success: "#188038",
          warning: "#e37400",
        };
  return { mode, tokens };
}

/** Resolves the effective appearance: the siteprofile theme wins on its origin, the manual user override wins next and the os preference governs when no override exists, with the source naming which layer decided. */
export function resolveappearance(input: {
  ospreference: "dark" | "light";
  useroverride?: "dark" | "light" | "system";
  siteprofile?: siteprofile;
}): darklighttokens {
  if (input.siteprofile?.theme !== undefined && input.siteprofile.theme !== "system")
    return { ...darklighttokensof(input.siteprofile.theme), source: "site" };
  if (input.useroverride !== undefined && input.useroverride !== "system")
    return { ...darklighttokensof(input.useroverride), source: "user" };
  return { ...darklighttokensof(input.ospreference), source: "os" };
}

/** Applies one token set to a surface document: every custom property of the theme lands on the root element so every surface, including the dashboardpage, renders with the same tokens. */
export function applytheme(
  documentroot: { style: { setProperty(name: string, value: string): void } },
  tokens: darklighttokens,
): void {
  for (const [name, value] of Object.entries(tokens.tokens)) documentroot.style.setProperty(`--theme-${name}`, value);
  documentroot.style.setProperty("color-scheme", tokens.mode);
}

/** The high contrast token set of the 2.0.2 final polish (roadmap rc.2 item 35): the same token names the darklight family resolves, retuned so every reading token reaches at least 4.5:1 against its surface and the accent and border reach at least 3:1 under the WCAG relative luminance arithmetic — pure black surfaces with white ink and whitened signal colors in the dark mode, a white surface with black ink and deepened signal colors in the light mode — while the default darklight sets stay untouched beside it. */
export function highcontrasttokens(mode: darklighttokens["mode"]): darklighttokens {
  const tokens: Record<string, string> =
    mode === "dark"
      ? {
          surface: "#000000",
          elevated: "#000000",
          text: "#ffffff",
          muted: "#e6e6e6",
          accent: "#74e8c1",
          border: "#ffffff",
          focus: "#00e0ff",
          error: "#ffb3c1",
          success: "#b9f6ca",
          warning: "#ffe08a",
        }
      : {
          surface: "#ffffff",
          elevated: "#ffffff",
          text: "#000000",
          muted: "#262626",
          accent: "#2b7ff0",
          border: "#767676",
          focus: "#174ea6",
          error: "#b3261e",
          success: "#0b6b2e",
          warning: "#8a5300",
        };
  return { mode, tokens };
}

/** Resolves the effective token set under the contrast preference of the 2.0.2 final polish: the default preference keeps the darklight tokens exactly as the family resolved them while the high preference swaps in the high contrast set of the same mode, so the preference never moves the dark or light mode itself. */
export function contrasttokensof(input: {
  mode: darklighttokens["mode"];
  contrast: "default" | "high";
}): darklighttokens {
  if (input.contrast === "high") return highcontrasttokens(input.mode);
  return darklighttokensof(input.mode);
}

/** Applies the resolved tokens with their contrast variant to one surface document: the --theme-* custom properties land on the document root the darklight family already writes while the body carries its data-contrast attribute, so a high contrast surface renders from the same rules and names its variant for the assistive surface. */
export function applycontrasttheme(
  documentroot: { style: { setProperty(name: string, value: string): void } },
  body: { setAttribute(name: string, value: string): void },
  tokens: darklighttokens,
  contrast: "default" | "high",
): void {
  for (const [name, value] of Object.entries(tokens.tokens)) documentroot.style.setProperty(`--theme-${name}`, value);
  documentroot.style.setProperty("color-scheme", tokens.mode);
  body.setAttribute("data-contrast", contrast);
}

/** The dashboard panel width bounds of the 2.0.2 final polish (roadmap rc.2 item 37): every resizable panel column keeps at least the readable minimum while no column passes the shared maximum, and a known viewport keeps the sibling column its minimum too. */
export const panelwidthbounds: Readonly<{ minimum: number; maximum: number }> = Object.freeze({
  minimum: 280,
  maximum: 720,
});

/** Clamps one dashboard panel width inside the bounds: the floor keeps the column readable, the ceiling holds the shared maximum, and a viewport the caller supplies narrows the ceiling so the sibling column never loses its own minimum. */
export function clamppanelwidth(width: number, viewport?: number | undefined): number {
  if (!Number.isFinite(width)) return panelwidthbounds.minimum;
  const ceiling =
    viewport !== undefined && Number.isFinite(viewport)
      ? Math.min(panelwidthbounds.maximum, Math.max(viewport - panelwidthbounds.minimum, panelwidthbounds.minimum))
      : panelwidthbounds.maximum;
  return Math.min(Math.max(Math.round(width), panelwidthbounds.minimum), ceiling);
}

/** Parses the persisted panelwidths preferences of the dashboard columns from the layout seam shape: the "left=480" row resolves into the clamped left width while an absent or malformed row keeps the shipped default split. */
export function panelwidthsof(raw: string | undefined, viewport?: number | undefined): { left: number } {
  if (raw === undefined) return { left: clamppanelwidth(480, viewport) };
  const match = /^left=(\d+)$/.exec(raw.trim());
  if (match === null) return { left: clamppanelwidth(480, viewport) };
  return { left: clamppanelwidth(Number(match[1]), viewport) };
}

/** Serializes the panelwidths preferences into the layout seam shape: the "left=480" row the per surface preferences persist, one clamped width per named column. */
export function panelwidthslayout(widths: { left: number }): string {
  return `left=${clamppanelwidth(widths.left)}`;
}

/** Applies one resize move to the panelwidths state: the pointer delta moves the left column width by its pixels, the clamp holds the bounds and the answer names whether the move clamped, so the drag stops pushing the column past its readable edge. */
export function resizepanel(input: { widths: { left: number }; delta: number; viewport?: number | undefined }): {
  widths: { left: number };
  clamped: boolean;
} {
  const target = input.widths.left + input.delta;
  const left = clamppanelwidth(target, input.viewport);
  return { widths: { left }, clamped: left !== Math.round(target) };
}

/** The shipped locale bundles of the supported languages: every bundle carries the interface strings of its language with english as the fallback base. */
export function localebundles(): localebundle[] {
  return [
    {
      language: "en",
      strings: {
        "popup.title": "Devthink",
        "popup.taskinput.placeholder": "Describe the goal for the active tab",
        "popup.taskinput.submit": "Propose the plan",
        "popup.palette.open": "Open the commandpalette",
        "popup.recent.title": "Recent runs",
        "popup.recent.resume": "Resume",
        "popup.recent.reopen": "Reopen",
        "sidepanel.tab.plan": "Plan",
        "sidepanel.tab.run": "Run",
        "sidepanel.tab.review": "Review",
        "sidepanel.data.export": "Export",
        "dashboard.title": "Dashboard",
        "options.title": "Options",
        "options.theme.label": "Theme",
        "options.theme.dark": "Dark",
        "options.theme.light": "Light",
        "options.theme.system": "Follow the system",
        "options.locale.label": "Language",
        "options.shortcuts.label": "Shortcutkeys",
        "options.notifications.label": "Notifications",
        "options.importexport.label": "Import and export",
        "options.tour.label": "Feature tour",
        "stepapprove.approve": "Approve",
        "stepapprove.reject": "Reject",
        "stepapprove.edit": "Edit",
        "pagechip.approve": "Approve",
        "pagechip.reject": "Reject",
        "grid.empty": "No extracted rows yet",
        "toast.stepdone": "Step completed",
      },
    },
    {
      language: "pt",
      strings: {
        "popup.title": "Devthink",
        "popup.taskinput.placeholder": "Descreva o objetivo para a aba ativa",
        "popup.taskinput.submit": "Propor o plano",
        "popup.palette.open": "Abrir a paleta de comandos",
        "popup.recent.title": "Execuções recentes",
        "popup.recent.resume": "Retomar",
        "popup.recent.reopen": "Reabrir",
        "sidepanel.tab.plan": "Plano",
        "sidepanel.tab.run": "Execução",
        "sidepanel.tab.review": "Revisão",
        "sidepanel.data.export": "Exportar",
        "dashboard.title": "Painel",
        "options.title": "Opções",
        "options.theme.label": "Tema",
        "options.theme.dark": "Escuro",
        "options.theme.light": "Claro",
        "options.theme.system": "Seguir o sistema",
        "options.locale.label": "Idioma",
        "options.shortcuts.label": "Atalhos",
        "options.notifications.label": "Notificações",
        "options.importexport.label": "Importar e exportar",
        "options.tour.label": "Tour de recursos",
        "stepapprove.approve": "Aprovar",
        "stepapprove.reject": "Rejeitar",
        "stepapprove.edit": "Editar",
        "pagechip.approve": "Aprovar",
        "pagechip.reject": "Rejeitar",
        "grid.empty": "Nenhuma linha extraída ainda",
        "toast.stepdone": "Etapa concluída",
      },
    },
  ];
}

/** Resolves one interface string in the requested language: a missing string falls back to the english bundle so no control ever renders an empty label. */
export function localestring(bundles: localebundle[], language: string, key: string): string {
  const requested = bundles.find((bundle) => bundle.language === language);
  const english = bundles.find((bundle) => bundle.language === "en");
  return requested?.strings[key] ?? english?.strings[key] ?? key;
}

/** The languages the shipped bundles cover. */
export function supportedlanguages(bundles: localebundle[]): string[] {
  return bundles.map((bundle) => bundle.language);
}

/** Formats one date, number or duration value per language: dates render with the locale order, numbers with the locale separators and durations as minutes and seconds. */
export function localeformat(input: { language: string; value: number; kind: "date" | "number" | "duration" }): string {
  if (input.kind === "date") {
    const date = new Date(input.value);
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const day = String(date.getUTCDate()).padStart(2, "0");
    const hours = String(date.getUTCHours()).padStart(2, "0");
    const minutes = String(date.getUTCMinutes()).padStart(2, "0");
    return input.language === "pt"
      ? `${day}/${month}/${year} ${hours}:${minutes}`
      : `${year}-${month}-${day} ${hours}:${minutes}`;
  }
  if (input.kind === "duration") {
    const seconds = Math.round(input.value / 1000);
    const minutes = Math.floor(seconds / 60);
    const rest = seconds % 60;
    return input.language === "pt" ? `${minutes} min ${rest} s` : `${minutes}m ${rest}s`;
  }
  const text = String(input.value);
  const parts = text.split(".");
  const whole = parts[0] ?? "0";
  const fraction = parts[1];
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, input.language === "pt" ? "." : ",");
  return fraction !== undefined ? `${grouped}${input.language === "pt" ? "," : "."}${fraction}` : grouped;
}

/* ── Merged from quickactions.ts ── */
import { quickactiongate } from "./policy.js";

/**
 * Quickactions, shortcutkeys and omniboxtask logic of the 1.1.65 family.
 * The path to a run shortens here: quickactions bind the context menu entries of the active tab (extract page, capture shot, run recent and open dashboardpage) behind the origin allowlist of the clicked tab so only permitted actions surface; shortcutkeys bind run, pause, resume, cancelrun and the commandpalette to user editable key combinations that route through the same commandpalette gates; and the omniboxtask parses the keyword text into a taskinput submission that lands in the standard proposal flow with its review intact.
 * No binding is ever forced: every shortcut stays user editable in the optionspage, and no quickaction, shortcut or omnibox entry ever bypasses the human review.
 */

/** The quickaction catalog bound to the context menu entries of the active tab: extract page, capture shot, run recent and open dashboardpage. */
export function quickactioncatalog(): quickaction[] {
  return [
    { id: "extractpage", label: "Extract page data", command: "starttask", surface: "sidepanel", session: true },
    {
      id: "captureshot",
      label: "Capture a shot",
      command: "starttask",
      surface: "sidepanel",
      permission: "downloads",
      session: true,
    },
    { id: "runrecent", label: "Run the recent task", command: "starttask", surface: "popup", session: true },
    { id: "opendashboardpage", label: "Open the dashboard", command: "opendashboardpage", surface: "dashboardpage" },
  ];
}

/** Lists only the quickactions the active origin permits: every entry rides the origin allowlist of the clicked tab before it registers. */
export function quickactionsfor(
  catalog: quickaction[],
  input: { origin: string; granted: string[]; sessionactive: boolean; grantedcapabilities?: string[] },
): quickaction[] {
  const capabilities = input.grantedcapabilities ?? ["activeTab", "storage", "scripting", "sidePanel"];
  const grantedcapabilities = capabilities;
  return catalog.filter(
    (action) =>
      quickactiongate({
        action: {
          command: action.command,
          origin: input.origin,
          ...(action.permission !== undefined ? { permission: action.permission } : {}),
          ...(action.session !== undefined ? { session: action.session } : {}),
        },
        granted: input.granted,
        sessionactive: input.sessionactive,
        capabilities: grantedcapabilities,
      }).allowed,
  );
}

/** The default shortcutkeys bindings: run, pause, resume, cancelrun and the commandpalette open from every surface; every binding stays user editable. */
export function shortcutdefaults(): shortcutbinding[] {
  return [
    { command: "starttask", key: "Enter", modifiers: [], editable: true, surface: "popup" },
    { command: "pauserun", key: "p", modifiers: ["ctrl", "shift"], editable: true, surface: "sidepanel" },
    { command: "resumerun", key: "r", modifiers: ["ctrl", "shift"], editable: true, surface: "sidepanel" },
    { command: "cancelrun", key: "x", modifiers: ["ctrl", "shift"], editable: true, surface: "sidepanel" },
    { command: "commandpalette", key: ".", modifiers: ["ctrl"], editable: true, surface: "popup" },
  ];
}

/** Parses one shortcut text such as ctrl+. into its key and modifiers: an empty text refuses the binding. */
export function parseshortcut(text: string): { key: string; modifiers: string[] } {
  const parts = text
    .trim()
    .toLowerCase()
    .split("+")
    .map((part) => part.trim())
    .filter((part) => part !== "");
  if (parts.length === 0) throw new Error("The shortcut binding needs its key.");
  const modifiers = ["ctrl", "alt", "shift", "meta"];
  const key = parts.filter((part) => !modifiers.includes(part))[0];
  if (key === undefined || key === "") throw new Error("The shortcut binding needs its key beside its modifiers.");
  return { key, modifiers: parts.filter((part) => modifiers.includes(part)) };
}

/** Formats one shortcut binding as its display text with the modifiers first. */
export function shortcuttext(binding: shortcutbinding): string {
  return [...binding.modifiers, binding.key].join("+");
}

/** Edits one shortcut binding: the user chosen combination replaces the binding while an unknown command refuses the edit. */
export function shortcutbindingafter(bindings: shortcutbinding[], command: string, text: string): shortcutbinding[] {
  const existing = bindings.find((binding) => binding.command === command);
  if (existing === undefined) throw new Error(`The shortcutkeys know no ${command} command to edit.`);
  const parsed = parseshortcut(text);
  return bindings.map((binding) =>
    binding.command === command ? { ...binding, key: parsed.key, modifiers: parsed.modifiers } : binding,
  );
}

/** Matches one pressed key and modifier set against the bindings: the first command whose combination matches wins, and the palette command matches from every surface. */
export function shortcutcommandof(
  bindings: shortcutbinding[],
  input: { key: string; modifiers: string[]; surface: uisurface },
): string | undefined {
  const pressed = [...input.modifiers].map((modifier) => modifier.toLowerCase()).sort();
  return bindings.find(
    (binding) =>
      binding.key.toLowerCase() === input.key.toLowerCase() &&
      [...binding.modifiers].sort().join("+") === pressed.join("+") &&
      (binding.command === "commandpalette" || binding.surface === input.surface),
  )?.command;
}

/** Confirms one bound command rides the commandpalette catalog with its gates intact: a shortcut may only trigger a command the palette action gate lists for the current capability set and session state. */
export function shortcutdispatchable(
  command: string,
  entries: paletteentry[],
  input: { granted: string[]; sessionactive: boolean },
): boolean {
  const entry = entries.find((candidate) => candidate.action.command === command);
  if (entry === undefined) return command === "commandpalette";
  return paletteactiongate({
    action: {
      command: entry.action.command,
      ...(entry.action.permission !== undefined ? { permission: entry.action.permission } : {}),
      ...(entry.action.session !== undefined ? { session: entry.action.session } : {}),
    },
    granted: input.granted,
    sessionactive: input.sessionactive,
  }).allowed;
}

/** Parses one omnibox keyword text into an omniboxtask submission: the text after the keyword becomes the natural language goal of the active origin while an empty text refuses the submission. */
export function parseomniboxtask(input: { text: string; origin: string; at: number }): omniboxtasksubmission {
  const text = input.text.trim();
  if (text === "") throw new Error("The omnibox task needs its natural language goal after the keyword.");
  if (input.origin.trim() === "") throw new Error("The omnibox task needs its active origin scope.");
  return { id: randomid(), text, origin: input.origin.trim(), surface: "omnibox", at: input.at };
}

/** Lands one omniboxtask submission in the standard proposal flow: the submission becomes a taskinput of the omnibox surface that routes through the same proposal and review gates as the api. */
export function omniboxtasktotaskinput(submission: omniboxtasksubmission): taskinputsubmission {
  return {
    id: submission.id,
    text: submission.text,
    context: "",
    origin: submission.origin,
    surface: "omnibox",
    at: submission.at,
  };
}

/* ── Merged from attentionfeed.ts ── */

/**
 * Attentionfeed logic of the 1.1.66 family.
 * Everything that needs a human lands in one feed: gate waits, phishguard blocks, deferrals and failures each collect as one entry with its cause, its run and gate refs and its deep link to the exact waiting surface, repeated causes per run deduplicate while the first occurrence keeps its time, the severity of the cause ranks the feed, and the retention window of the store stays the user's choice.
 * The feed never resolves anything on its own: a deep link opens the waiting surface and the human resolves the cause exactly as before.
 */

/** Reads the severity rank of one attention cause: a gate wait and a phishguard block hold the run for a human, a deferral waits its window and a failure needs the reviewed retry. */
export function attentionseverityof(cause: attentioncause): "critical" | "warning" | "info" {
  if (cause === "gatewait" || cause === "phishguard") return "critical";
  if (cause === "deferral") return "warning";
  return "info";
}

/** Builds the deep link of one attention cause: the link opens the exact surface that resolves the cause. */
export function attentiondeeplinkof(cause: attentioncause, runid: string, gateref?: string): string {
  if (cause === "gatewait")
    return `devthink://gate/${encodeURIComponent(gateref ?? "unknown")}?run=${encodeURIComponent(runid)}`;
  if (cause === "phishguard") return `devthink://phishguard?run=${encodeURIComponent(runid)}`;
  if (cause === "deferral") return `devthink://deferred?run=${encodeURIComponent(runid)}`;
  return `devthink://error?run=${encodeURIComponent(runid)}`;
}

/** Builds one attention entry from its source: the cause, the run ref, the gate ref when the run waits at a gate, the summary in plain language and the deep link. */
export function attentionentryof(input: {
  cause: attentioncause;
  runid: string;
  origin: string;
  summary: string;
  gateref?: string;
  at: number;
}): attentionentry {
  if (input.runid.trim() === "") throw new Error("The attention entry needs its run ref.");
  if (input.summary.trim() === "") throw new Error("The attention entry needs its summary in plain language.");
  return {
    id: `attention:${input.cause}:${input.runid}:${input.gateref ?? "none"}`,
    cause: input.cause,
    severity: attentionseverityof(input.cause),
    runid: input.runid,
    ...(input.gateref !== undefined && input.gateref.trim() !== "" ? { gateref: input.gateref } : {}),
    origin: input.origin,
    summary: input.summary,
    deeplink: attentiondeeplinkof(input.cause, input.runid, input.gateref),
    at: input.at,
  };
}

/** Collects the attention entries of one pass: the gate waits the progress recorded, the phishguard blocks, the deferred events and the failed steps each feed one entry. */
export function collectattention(input: {
  gatewaits?: Array<{ runid: string; stepid: string; gateid: string; kind: string; origin: string; waitedms: number }>;
  phishblocks?: Array<{ runid: string; origin: string; matchedorigin: string; reason: string }>;
  deferrals?: Array<{ runid: string; origin: string; reason: string }>;
  failures?: Array<{ runid: string; stepid: string; origin: string; message: string }>;
  now: number;
}): attentionentry[] {
  const entries: attentionentry[] = [];
  for (const wait of input.gatewaits ?? [])
    entries.push(
      attentionentryof({
        cause: "gatewait",
        runid: wait.runid,
        origin: wait.origin,
        summary: `The ${wait.kind} gate of the step ${wait.stepid} waits ${wait.waitedms} milliseconds for one human action.`,
        gateref: wait.gateid,
        at: input.now,
      }),
    );
  for (const block of input.phishblocks ?? [])
    entries.push(
      attentionentryof({
        cause: "phishguard",
        runid: block.runid,
        origin: block.origin,
        summary: `The phishguard blocked a credential step on ${block.origin} that resembles the granted ${block.matchedorigin}: ${block.reason}`,
        at: input.now,
      }),
    );
  for (const deferral of input.deferrals ?? [])
    entries.push(
      attentionentryof({
        cause: "deferral",
        runid: deferral.runid,
        origin: deferral.origin,
        summary: `A command deferred past its rate window on ${deferral.origin}: ${deferral.reason}`,
        at: input.now,
      }),
    );
  for (const failure of input.failures ?? [])
    entries.push(
      attentionentryof({
        cause: "failure",
        runid: failure.runid,
        origin: failure.origin,
        summary: `The step ${failure.stepid} failed: ${failure.message}`,
        at: input.now,
      }),
    );
  return entries;
}

/** Deduplicates repeated causes per run: the first occurrence of one cause inside one run keeps its entry and its time while every later occurrence drops. */
export function dedupeattention(entries: attentionentry[]): attentionentry[] {
  const seen = new Set<string>();
  const kept: attentionentry[] = [];
  for (const entry of [...entries].sort((a, b) => a.at - b.at)) {
    const key = `${entry.cause}:${entry.runid}:${entry.gateref ?? "none"}`;
    if (seen.has(key)) continue;
    seen.add(key);
    kept.push(entry);
  }
  return kept;
}

/** Ranks the attention entries by cause severity first and time second: critical gate waits and phishguard blocks stand above warnings and failures. */
export function rankattention(entries: attentionentry[]): attentionentry[] {
  const order: Record<attentionentry["severity"], number> = { critical: 0, warning: 1, info: 2 };
  return [...entries].sort((a, b) => order[a.severity] - order[b.severity] || b.at - a.at);
}

/** Reads the count of attention entries the statusbadge surfaces. */
export function attentioncountof(entries: attentionentry[]): number {
  return rankattention(dedupeattention(entries)).length;
}

/** Dismisses one attention entry by its id: the dismissal only removes the feed row, the waiting cause keeps its own resolution path. */
export function dismissattention(entries: attentionentry[], id: string): attentionentry[] {
  return entries.filter((entry) => entry.id !== id);
}

/** Prunes the attention entries past their retention window: an absent window keeps every entry while the pruned ids return for the audit note. */
export function pruneattention(
  entries: attentionentry[],
  retention: number | undefined,
  now: number,
): { kept: attentionentry[]; pruned: string[] } {
  if (retention === undefined) return { kept: entries, pruned: [] };
  const kept = entries.filter((entry) => now - entry.at < retention);
  return { kept, pruned: entries.filter((entry) => now - entry.at >= retention).map((entry) => entry.id) };
}

/** Renders the attention entries as system notifications: one content free payload per entry with its deep link, so no page content consent is needed. */
export function attentionnotifications(
  entries: attentionentry[],
  now: number,
): Array<{
  id: string;
  kind: "done" | "attention";
  title: string;
  body: string;
  deeplink: string;
  runid?: string;
  stepid?: string;
  content: boolean;
  at: number;
}> {
  return rankattention(dedupeattention(entries)).map((entry) => ({
    id: `notify:${entry.id}`,
    kind: "attention" as const,
    title:
      entry.cause === "gatewait"
        ? "A gate waits for you"
        : entry.cause === "phishguard"
          ? "The phishguard blocked a step"
          : entry.cause === "deferral"
            ? "A command deferred"
            : "A step failed",
    body: entry.summary,
    deeplink: entry.deeplink,
    runid: entry.runid,
    ...(entry.gateref !== undefined ? { stepid: entry.gateref } : {}),
    content: false,
    at: now,
  }));
}
