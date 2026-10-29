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
      "pressure-test a provider-neutral gateway: where does the architecture break first, and what hardens it?",
  },
  {
    id: "reasoning",
    label: "Reason step by step",
    prompt:
      "reason step by step: should a provider-neutral workbench cache provider responses locally? weigh latency, cost, staleness.",
  },
  {
    id: "decisions",
    label: "Weigh the trade offs",
    prompt:
      "self-hosting an inference gateway versus provider apis: commit to one call and name the three facts that drive it.",
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
  { id: "composer.sandboxNote", text: "open the saddle sandbox lane" },
  { id: "gw.notRegistered", text: "No gateway registered" },
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
  { id: "sb.prompt", text: "root@saddle:~#" },
  { id: "sb.running", text: 'ok: sandbox running. type "help" for the command list.' },
  { id: "sb.stopped", text: "sandbox stopped; snapshot-less teardown complete." },
  { id: "sb.halted", text: "sandbox halted — boot to start the microvm." },
  { id: "panel.instructionsPlaceholder", text: "pinned instructions for the conversation" },
  { id: "panel.instructionsSaved", text: "saved on this device" },
  { id: "panel.instructionsDraft", text: "a local draft for now" },
  { id: "panel.memoryEmpty", text: "nothing saved on this device" },
  { id: "panel.probing", text: "Probing the endpoint" },
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
  "You are Sol, the DevThink gateway assistant: precise, warm and technical. Answer in the user's language, prefer concrete detail over filler, and use markdown when structure helps.";

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
