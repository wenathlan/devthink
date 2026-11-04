/**
 * labels.ts — the copy law of the os app: every interface string lives in
 * the label store, the wingets read through this typed accessor, and a
 * hardcoded string inside a widget is a defect. the manifest below is the
 * english source of truth the seed ingests into the labels store of the
 * database; the runtime translation replaces the overrides at boot and the
 * seed never overwrites a translated row.
 */

/* the store seat rides uistore.ts (the acyclic law): the manifest stays a
 * pure data seat here — the rowStore adapter pulls the browser label lane
 * of storage.ts, and storage sits above this seat in the module graph, so
 * the store lives in the ui copy seat that nothing under storage imports. */

/** the label revision of the manifest: bump on every copy wave so the seed
 * refreshes the store rows of the changed strings. */
export const LABEL_REVISION = 5;

/** the english manifest: the page.widget.key path answers the surface text. */
export const labelManifest = {
  // the chat composer
  "chat.composer.placeholder": "Message Sol",
  "chat.composer.send": "Send message",
  "chat.composer.sending": "Sending",
  "chat.composer.stop": "Stop generating",
  "chat.composer.models": "Models",
  "chat.composer.pickModel": "Pick the model",
  "chat.composer.effort": "Reasoning effort",
  "chat.composer.reasoning": "Reasoning",
  "chat.composer.tools": "Tools",
  "chat.composer.toolModes": "Tool modes",
  "chat.composer.moreTools": "More tools",
  "chat.composer.sandboxLane": "Open the sandbox",
  // the chat timeline
  "chat.body.assistantReply": "Assistant reply",
  "chat.body.yourMessage": "Your message",
  "chat.body.thinking": "Thinking",
  "chat.body.showFull": "Show full message",
  "chat.body.showLess": "Show less of the message",
  "chat.body.recentConversations": "Recent conversations",
  "chat.body.badResponse": "Bad response",
  "chat.body.goodResponse": "Good response",
  // the chat turn actions
  "chat.turn.copy": "Copy message",
  "chat.turn.copied": "Copied",
  "chat.turn.copyFailed": "Copy failed — retry",
  "chat.turn.edit": "Edit message",
  "chat.turn.editing": "Editing message",
  "chat.turn.cancelEdit": "Cancel edit",
  "chat.turn.saveEdit": "Save edit and branch",
  "chat.turn.saveEditHint": "Saving opens the checkpoint branch",
  "chat.turn.delete": "Delete message",
  "chat.turn.readAloud": "Read message aloud",
  "chat.turn.stopReading": "Stop reading aloud",
  "chat.turn.regenerate": "Regenerate response",
  // the composer keys
  "chat.composer.keyEnter": "Enter",
  "chat.composer.keyEscape": "Escape",
  // the chat composer surface (the copy wave: the hardcoded literals leave)
  "chat.composer.auto": "auto",
  "chat.composer.autoRoutes": "chosen by the prompt",
  "chat.composer.effortAutoRow": "chosen by the prompt — {level} for this draft",
  "chat.composer.effortAutoTitle": "Reasoning effort — auto picks by the prompt ({level} now)",
  "chat.composer.effortAria": "Reasoning effort: {level}",
  "chat.composer.modelAria": "Model: {model}",
  "chat.composer.compact": "compact",
  "chat.composer.compactHint":
    "the next message may overflow the context window — compaction is not wired yet, so the key marks the intent only",
  "chat.composer.meterHint": "Estimated with the house chars-per-token approximation — never an exact count",
  "chat.composer.ctxSuffix": "k ctx",
  // the chat body surface (the conversation frame and the sandbox cards)
  "chat.body.closeSidebar": "Close sidebar",
  "chat.body.openSidebar": "Open sidebar",
  "chat.body.deleteConversation": "Delete conversation",
  "chat.body.branchLineage": "Branch lineage",
  "chat.body.branch": "branch",
  "chat.body.edit": "edit",
  "chat.body.root": "root",
  "chat.body.canvasPane": "Canvas pane",
  "chat.body.openCanvasPane": "Open canvas pane",
  "chat.body.closeCanvasPane": "Close canvas pane",
  "chat.body.sessionPanel": "Session panel",
  "chat.body.openSessionPanel": "Open session panel",
  "chat.body.closeSessionPanel": "Close session panel",
  "chat.body.sandbox": "sandbox",
  "chat.body.sandboxCommands": "sandbox commands from this turn ({n})",
  "chat.body.sandboxChipOpen": "open the sandbox pane and show the {n} commands this turn ran",
  "chat.body.sandboxPaneTitle": "open the sandbox pane",
  "chat.body.sandboxCommandAria": "sandbox command {command} — {verdict} — expand the output",
  "chat.body.expandEngineOutput": "expand the output",
  "chat.body.verdictOk": "ok",
  "chat.body.verdictFail": "fail {code}",
  "chat.body.verdictFailedExit": "failed, exit {code}",
  "chat.body.noOutput": "no output",
  "chat.body.deletedSuffix": "(deleted)",
  "chat.body.noGateway": "No assistant service connected",
  // the chat turn surface (the cognition head, the edit form, the meta marks)
  "chat.turn.thoughtFor": "Thought for {n}s",
  "chat.turn.save": "Save",
  "chat.turn.cancel": "Cancel",
  "chat.turn.retry": "Retry",
  "chat.turn.stoppedMark": "stopped",
  "chat.turn.editedMark": "edited",
  "chat.turn.you": "YOU",
  // the chat welcome surface (the recents row and the relative stamps)
  "chat.welcome.now": "now",
  "chat.welcome.minutesAgo": "{n}m ago",
  "chat.welcome.hoursAgo": "{n}h ago",
  "chat.welcome.daysAgo": "{n}d ago",
  "chat.welcome.gatewayOn": "CLI on",
  "chat.welcome.gatewayOff": "CLI off",
  "chat.welcome.suggestedPrompts": "suggested prompts",
  "chat.welcome.startWith": "Start with {prompt}",
  "chat.welcome.temporaryTitle": "nothing saves on this device",
  "chat.welcome.temporaryChip": "start a temporary chat",

  /* ------------------------ explore · the categories ---------------------- */
  // the nouns of the gallery — every category answers a real surface of the
  // family (the registry rows, the studios, the console, the library, the
  // runner shelf, the family sites), never an invented one.
  "explore.cat.video": "video",
  "explore.cat.video.sub": "the native video editor of cadria",
  "explore.cat.image": "image",
  "explore.cat.image.sub": "the native image studio of cadria",
  "explore.cat.audio": "audio",
  "explore.cat.audio.sub": "the native music studio of debonair",
  "explore.cat.model3d": "three dee",
  "explore.cat.model3d.sub": "the cadria studio carries the 3d worlds of the family",
  "explore.cat.code": "code",
  "explore.cat.code.sub": "the core modules of the cli — the same rows the console serves",
  "explore.cat.documents": "documents",
  "explore.cat.documents.sub": "the documents the platform publishes — about, terms and policy",
  "explore.cat.sandbox": "sandbox runs",
  "explore.cat.sandbox.sub": "the sandbox shelf — forge and foundry run the work",
  "explore.cat.shares": "community shares",
  "explore.cat.shares.sub": "the family sites — every row a live site of the platform",
  "explore.nav.categories": "categories",
  "explore.categories.aria": "the category gallery",
  "explore.categories.cap": "the category rail",
  "explore.categories.title": "browse by category",
  "explore.categories.sub":
    "every category answers a real surface of the family — the studios, the console, the library, the app shelf and the community sites.",
  "explore.categories.pick": "browse {name}",
  "explore.categories.waves": "02 · the categories",
  "explore.categories.wavesMeta":
    "video · image · audio · three dee · code · documents · sandbox runs · community shares",

  /* --------------------- explore · the sidebar grammar -------------------- */
  // the captured grammar: nouns first, the section stacks, the per-row
  // overflow menus, the soft imperative voices of three to five words.
  "explore.sidebar.aria": "Explore sections",
  "explore.sidebar.categories": "the categories",
  "explore.sidebar.recents": "recents",
  "explore.sidebar.family": "the family",
  "explore.sidebar.overflow": "More actions for {name}",
  "explore.sidebar.act.openSurface": "open the surface",
  "explore.sidebar.act.browse": "browse the entries",
  "explore.sidebar.act.openWindow": "open the window",
  "explore.sidebar.act.visitSite": "visit the site",
  "explore.sidebar.rowAria": "{name} — {detail}",
  "explore.sidebar.count": "{count} entries",
  "explore.sidebar.none": "no entries yet",
  "explore.sidebar.pending": "reading the catalog",
  /* the two empty-state rows of this stack (recentsEmpty, familyEmpty) moved
     to the ui store — the intro.hero/panel/explorer rows of uistore.ts ride
     the db over /api/v1/ui/copy (the single-home law of the copy) */
  "explore.sidebar.recentsAct": "open a studio",

  /* ------------------------ explore · the section deck -------------------- */
  "explore.deck.waves": "03 · the section deck",
  "explore.deck.wavesMeta": "the entries the catalog answers",
  "explore.deck.cap": "the section deck",
  "explore.deck.idle": "pick a category — its real entries open here.",
  "explore.deck.empty": "the {name} catalog answers empty — nothing invented in its place.",
  "explore.deck.act.studio": "open the studio",
  "explore.deck.act.runner": "open the app shelf",
  "explore.deck.detail": "open the detail of {name}",
  "explore.deck.back": "back to the categories",

  /* -------------------------- explore · the detail ------------------------ */
  "explore.detail.aria": "the entry detail",
  "explore.detail.close": "close the detail",
  "explore.detail.act.studio": "open the studio",
  "explore.detail.act.window": "open the window",
  "explore.detail.act.visit": "visit the site",
  "explore.detail.act.console": "open the console",
  "explore.detail.act.docs": "read the docs",
  "explore.detail.act.read": "read the document",

  /* ------------------------ explore · the share surface ------------------- */
  "explore.share.cap": "the share surface",
  "explore.share.title": "the community shares",
  "explore.share.sub": "the sites the family serves — every row answers a real deploy of the platform.",

  /* -------------------------- explore · the states ------------------------ */
  // the honest ladder: the loading, the empty with the next action and the
  // error with the retry — never a fake row, never an invented number.
  "explore.state.loading": "reading the catalog",
  "explore.state.error": "the catalog could not be read",
  "explore.state.errorLine": "the built-in answers serve when the service is away — retry to ask it again.",
  "explore.state.retry": "retry the catalog",
  "explore.state.paragraphs": "{count} paragraphs",
  "explore.state.kind.asset": "studio asset",
  "explore.state.kind.track": "studio track",
  "explore.state.kind.module": "core module",
  "explore.state.kind.document": "document",
  "explore.state.kind.site": "family site",
  "explore.state.kind.binary": "app",
  "explore.modules.waves": "04 · the modules",
  "explore.download.waves": "05 · the builds",
} as const;

export type LabelKey = keyof typeof labelManifest & string;

/** the row-store door of the os app: the labels ride the IndexedDB lane of
 * the storage module (the browser-safe service door — never better-sqlite3
 * inside the static bundle). the adapter maps the door onto the factory's
 * row store contract. */
/* ===== block: chatlabels ===== */
/** Style: DevThink chat label table — the read-only data layer of the chat
 * surfaces. The owner doctrine: the interface never hardcodes information
 * in components; every text, label, prompt, toast and tuning number of the
 * chat lives here as a typed seed row, the components read through the
 * typed accessors, and the same rows answer the paired database endpoint
 * when it comes online (the offline seeds are the static build's answer,
 * the osAppLabels precedent). Nothing is written to the visitor device. */

/* ------------------------------ suggestions ---------------------------- */

/** one hero suggestion chip: the label the visitor reads, the prompt the
 * chip prefills into the composer (clicking never auto-sends). */
export type ChatSuggestion = {
  id: string;
  label: string;
  prompt: string;
};

export const seedChatSuggestions: ChatSuggestion[] = [
  {
    id: "engineering",
    label: "Trace a failure",
    prompt:
      "pressure-test a distributed system: where does the architecture break first, and what hardens it?",
  },
  {
    id: "reasoning",
    label: "Reason step by step",
    prompt:
      "reason step by step: should a smart workbench cache answers locally? weigh latency, cost, staleness.",
  },
  {
    id: "decisions",
    label: "Weigh the trade offs",
    prompt:
      "running your own model service versus provider apis: commit to one call and name the three facts that drive it.",
  },
];

/** the hero suggestion chips, catalog order. */
export function chatSuggestions(): ChatSuggestion[] {
  return seedChatSuggestions;
}

/* ------------------------------- greetings ------------------------------ */

/** one time-of-day greeting band: the headline the hero wears from
 * fromHour (inclusive) until the next band begins. */
export type ChatGreeting = {
  id: string;
  fromHour: number;
  headline: string;
};

export const seedChatGreetings: ChatGreeting[] = [
  { id: "morning", fromHour: 5, headline: "Good morning" },
  { id: "afternoon", fromHour: 12, headline: "Good afternoon" },
  { id: "evening", fromHour: 18, headline: "Good evening" },
  { id: "late", fromHour: 23, headline: "Working late" },
];

/** the greeting headline of the hour — the last band whose fromHour has
 * arrived, the late band wrapping past midnight. */
export function chatGreetingForHour(hour: number): string {
  let headline = seedChatGreetings[seedChatGreetings.length - 1]!.headline;
  for (const band of seedChatGreetings) {
    if (hour >= band.fromHour) headline = band.headline;
  }
  return headline;
}

/* -------------------------------- strings ------------------------------- */

/** one interface string row: the id is the dot address the components
 * quote, the text is the exact copy the surface renders. */
export type ChatStringRow = { id: string; text: string };

const seedChatStrings: ChatStringRow[] = [
  { id: "welcome.temporarySub", text: "temporary chat: nothing saves on this device" },
  { id: "welcome.modelLine", text: "sol {model}" },
  { id: "chat.temporaryPill", text: "temporary chat" },
  { id: "chat.temporaryTitle", text: "this conversation never saves to this device" },
  { id: "topbar.gatewayOn", text: "CLI on" },
  { id: "topbar.gatewayOff", text: "CLI off" },
  { id: "composer.placeholderIdle", text: "ask anything" },
  { id: "composer.placeholderFollowUp", text: "send a follow up while it works" },
  { id: "composer.sandboxChip", text: "Sandbox" },
  { id: "composer.sandboxNote", text: "open the sandbox" },
  { id: "gw.notRegistered", text: "No assistant service connected" },
  { id: "toast.stopped", text: "Generation stopped" },
  {
    id: "toast.stoppedDescription",
    text: "The partial answer stayed on the floor — regenerate answers it again.",
  },
  { id: "toast.noRespond", text: "Sol did not respond" },
  { id: "toast.branch", text: "Checkpoint branch opened" },
  {
    id: "toast.branchDescription",
    text: "The original keeps its round — the edit carries the ladder forward.",
  },
  { id: "toast.messageDeleted", text: "Message deleted" },
  { id: "toast.conversationDeleted", text: "Conversation deleted" },
  { id: "turn.thinking", text: "Thinking" },
  { id: "turn.responding", text: "Responding" },
  { id: "turn.copied", text: "copied to clipboard" },
  { id: "turn.copyFailed", text: "copy failed" },
  { id: "day.today", text: "Today" },
  { id: "day.yesterday", text: "Yesterday" },
  { id: "sb.prompt", text: "root@devthink:~#" },
  { id: "sb.running", text: 'ok: sandbox running. type "help" for the command list.' },
  { id: "sb.stopped", text: "sandbox stopped; snapshot-less teardown complete." },
  { id: "sb.halted", text: "sandbox halted — boot to start the session." },
  { id: "panel.instructionsPlaceholder", text: "pinned instructions for the conversation" },
  { id: "panel.instructionsSaved", text: "saved on this device" },
  { id: "panel.instructionsDraft", text: "a local draft for now" },
  { id: "panel.memoryEmpty", text: "nothing saved on this device" },
  { id: "panel.probing", text: "Checking the connection" },
  { id: "panel.gatewayError", text: "The service did not answer" },
  { id: "panel.exportFallback", text: "chat-session" },
  { id: "canvas.defaultTitle", text: "canvas" },
  { id: "canvas.empty", text: "the canvas is empty — the edit key begins the buffer." },
];

export type ChatStringId = (typeof seedChatStrings)[number]["id"];

/** chatText — the typed string accessor: the dot id quotes the row, the
 * seed answers today and the paired database answers tomorrow. An unknown
 * id renders the empty string (never a crash on the interface). */
export function chatText(id: ChatStringId): string {
  const row = seedChatStrings.find((entry) => entry.id === id);
  return row ? row.text : "";
}

/* -------------------------------- limits -------------------------------- */

/** one tuning limit row: the config numbers the chat logic reads (caps,
 * thresholds, defaults) so the living config rides the database, not the
 * component source. */
export type ChatLimitRow = { id: string; value: number };

const seedChatLimits: ChatLimitRow[] = [
  { id: "memoryCap", value: 30 },
  { id: "sessionCap", value: 60 },
  { id: "turnCap", value: 40 },
  { id: "historyCap", value: 12 },
  { id: "canvasVersions", value: 50 },
  { id: "sandboxContextCap", value: 6000 },
  { id: "autoEffortTokens", value: 700 },
  { id: "sandboxDefaultVcpus", value: 8 },
  { id: "sandboxDefaultRamGb", value: 32 },
  { id: "tagsCap", value: 8 },
];

export type ChatLimitId = (typeof seedChatLimits)[number]["id"];

/** chatLimit — the typed limit accessor: the tuning number of the id, the
 * seed answering the static build and the paired database answering
 * tomorrow. An unknown id answers 0 (the caller's validators own the
 * honest fallback). */
export function chatLimit(id: ChatLimitId): number {
  const row = seedChatLimits.find((entry) => entry.id === id);
  return row ? row.value : 0;
}

/* ---------------------------------- nav --------------------------------- */

/** one rail navigation row: the existing route the rail links to and the
 * label it wears (the icons stay code — the registry maps them by id). */
export type ChatNavRow = { id: string; href: string; label: string };

export const seedChatNav: ChatNavRow[] = [
  { id: "home", href: "/", label: "Home" },
  { id: "os", href: "/panel", label: "OS" },
  { id: "projects", href: "/projects", label: "Projects" },
  { id: "docs", href: "/docs", label: "Docs" },
  { id: "explore", href: "/explore", label: "Explore" },
  { id: "settings", href: "/settings", label: "Settings" },
];

/** the rail navigation rows, catalog order. */
export function chatNav(): ChatNavRow[] {
  return seedChatNav;
}

/* -------------------------------- buckets -------------------------------- */

/** the calendar-day bucket labels of the session list, newest first. */
export const seedChatBuckets: string[] = [
  "today",
  "yesterday",
  "2 days ago",
  "3 days ago",
  "this week",
  "last week",
  "this month",
  "last month",
  "older",
];

/** the bucket labels in order. */
export function chatBuckets(): string[] {
  return seedChatBuckets;
}

/* ----------------------------- thinking levels --------------------------- */

/** one cognition effort level: the picker row the composer flies. */
export type ChatThinkingRow = { id: "off" | "medium" | "high"; label: string; note: string };

export const seedChatThinking: ChatThinkingRow[] = [
  { id: "off", label: "Off", note: "Answer straight — no reasoning drawer." },
  { id: "medium", label: "Medium", note: "Reason quietly, answer fast." },
  { id: "high", label: "High", note: "Walk the whole reasoning staircase." },
];

/** the thinking effort rows, catalog order. */
export function chatThinkingLevels(): ChatThinkingRow[] {
  return seedChatThinking;
}

/* --------------------------------- persona -------------------------------- */

/** the system persona sentence of the round: the voice the assistant
 * wears on every call (the build of the prompt lives in chatstate, the
 * sentence is information and rides the table). */
export const seedChatPersona =
  "You are Sol, the DevThink assistant: precise, warm and technical. Answer in the user's language, prefer concrete detail over filler, and use markdown when structure helps.";

/** the persona sentence of the round. */
export function chatPersona(): string {
  return seedChatPersona;
}

/* ---------------------------- sandbox contract ---------------------------- */

/** the tool-calling instruction the round's system prompt gains while the
 * sandbox chip is on: the fenced grammar, the json line grammar, the
 * honest result loop and the law that the thread renders only what the
 * engine answered. */
export const seedChatSandboxContract = [
  "sandbox tool contract: a saddle sandbox microvm is attached to this conversation.",
  "to run a command in it, emit a fenced code block tagged sandbox carrying exactly one shell command:",
  "```sandbox",
  "lscpu",
  "```",
  'or a single json line: {"tool":"sandbox","command":"lscpu"}.',
  "the engine answers help, lscpu, cat /proc/cpuinfo, cat /proc/meminfo, free -h, nvidia-smi, nvidia-smi -L, clinfo, vulkaninfo --summary, glxinfo, uname -a, ls, ls /etc/virtual, env, uptime, whoami, neofetch, echo, echo <text> > <file>, echo <text> >> <file>, touch <file>, cat <file>, rm <file>, df -h, stat <file>, pwd, history, man <command> — run help for the catalog.",
  "each command's output and exit code return to you as the sandbox result context of the next round, and workspace files persist through the session.",
  "emit a sandbox call only when the answer needs the engine, otherwise answer in plain text. never fabricate command output — the thread renders only what the engine answered.",
].join("\n");

/** the sandbox tool contract of the round. */
export function chatSandboxContract(): string {
  return seedChatSandboxContract;
}
