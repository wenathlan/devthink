/**
 * chatstate.ts — the conversation logic of the chat subapp: persisted sessions
 * ({ id, title, messages, at }) on the os useStoredState grammar (localStorage
 * + type-guard + cap), the tool pills as honest local modes, and a thin
 * wrapper around the os gateway client. Zero fetch logic here — everything
 * goes through gatewayChat from ./osgateway, so the chat subapp owns no
 * network code of its own.
 */
import { useCallback, useMemo } from "react";
import { chatLimit, chatPersona, chatThinkingLevels } from "./chatlabels.ts";
import { compactToken, createCompactId } from "./ids.ts";
import {
  ChatStoppedError,
  type GatewayMessage,
  type GatewayModel,
  gatewayChat,
  gatewayChatStream,
  isChatStop,
  type StreamHandlers,
  type ThinkingLevel,
} from "./osgateway";
import { arrayOf, isString, useStoredState, type Validator } from "./usestoredstate.ts";

export { ChatStoppedError, isChatStop };
export { type GatewayModel, gatewayModels } from "./osgateway";

/* ------------------------------- types -------------------------------- */

export type TurnRole = "user" | "assistant";

export type ChatTurn = {
  id: string;
  role: TurnRole;
  content: string;
  /** reasoning_content of the gateway, rendered as the cognition drawer. */
  thought?: string | undefined;
  /** model reported by the gateway (assistant turns only). */
  model?: string | undefined;
  /** true when the visitor stopped the generation — the partial answer
   * stayed on the floor and the meta line says so honestly. */
  stopped?: boolean | undefined;
  /** true when this user turn was born from the checkpoint edit law (the
   * branch carried the edit forward) — the meta line carries the honest
   * · edited mark. */
  edited?: boolean | undefined;
  at: number;
};

/** One checkpoint of the cascading edit law — every edit appends here, the
 * branch carries the whole ladder and the newest edit prevails at merge. */
export type ChatCheckpoint = {
  at: number;
  /** the turn the edit landed on. */
  turnId: string;
  /** the edit ordinal — 1 for the first edit of the lineage. */
  edit: number;
};

/** The birth identity of a conversation — the sandbox law of the house:
 * every conversation is born with its space, its sandbox and its own
 * session identity provisioned automatically, so the saddle lane and the
 * deep links always have real ids to bind (never a display-time guess).
 * Branches inherit the same birth: the identity belongs to the lineage. */
export type ChatBirth = {
  /** the workspace the conversation lives in. */
  spaceId: string;
  /** the saddle sandbox the conversation was born with. */
  sandboxId: string;
  /** the conversation identity itself. */
  sessionId: string;
};

export type ChatSession = {
  id: string;
  title: string;
  messages: ChatTurn[];
  /** last activity timestamp — drives the Today / Previous 7 days groups. */
  at: number;
  /** the cascading checkpoint ladder (the edit law of the house). */
  checkpoints?: ChatCheckpoint[];
  /** the session this branch was born from — the original stays intact. */
  editOf?: string;
  /** the birth identity (space, sandbox, session) — minted at creation,
   * inherited by every branch of the lineage. */
  birth?: ChatBirth;
  /** the visitor tags of the conversation — free labels, capped, the
   * sidebar chips and the panel editor read and write them. */
  tags?: string[];
};

export const isChatTurn: Validator<ChatTurn> = (v): v is ChatTurn => {
  if (typeof v !== "object" || v === null) return false;
  const t = v as Record<string, unknown>;
  return (
    typeof t.id === "string" &&
    (t.role === "user" || t.role === "assistant") &&
    typeof t.content === "string" &&
    (t.thought === undefined || typeof t.thought === "string") &&
    (t.model === undefined || typeof t.model === "string") &&
    (t.stopped === undefined || typeof t.stopped === "boolean") &&
    (t.edited === undefined || typeof t.edited === "boolean") &&
    typeof t.at === "number"
  );
};

export const isChatCheckpoint: Validator<ChatCheckpoint> = (v): v is ChatCheckpoint => {
  if (typeof v !== "object" || v === null) return false;
  const t = v as Record<string, unknown>;
  return typeof t.at === "number" && typeof t.turnId === "string" && typeof t.edit === "number";
};

export const isChatBirth: Validator<ChatBirth> = (v): v is ChatBirth => {
  if (typeof v !== "object" || v === null) return false;
  const b = v as Record<string, unknown>;
  return typeof b.spaceId === "string" && typeof b.sandboxId === "string" && typeof b.sessionId === "string";
};

export const isChatSession: Validator<ChatSession> = (v): v is ChatSession => {
  if (typeof v !== "object" || v === null) return false;
  const s = v as Record<string, unknown>;
  return (
    typeof s.id === "string" &&
    typeof s.title === "string" &&
    Array.isArray(s.messages) &&
    s.messages.every(isChatTurn) &&
    (s.checkpoints === undefined || (Array.isArray(s.checkpoints) && s.checkpoints.every(isChatCheckpoint))) &&
    (s.editOf === undefined || typeof s.editOf === "string") &&
    (s.birth === undefined || isChatBirth(s.birth)) &&
    (s.tags === undefined || (Array.isArray(s.tags) && s.tags.every((t) => typeof t === "string"))) &&
    typeof s.at === "number"
  );
};

export const isChatSessionList: Validator<ChatSession[]> = arrayOf(isChatSession);

/* ------------------------------- storage ------------------------------ */

export const SESSIONS_KEY = "dt-chat-sessions-v1";
export const ACTIVE_KEY = "dt-chat-active-v1";
/** the caps ride the chatlabels table now — chatLimit answers the seed
 * rows today and the paired database tomorrow; the exported names stay
 * so every consumer keeps its single-import grammar. */
export const SESSION_CAP = chatLimit("sessionCap");
export const TURN_CAP = chatLimit("turnCap");
export const HISTORY_CAP = chatLimit("historyCap");
export const GATEWAY_MODEL = "devthink";

/** the persisted model preference of the chat (rung 124): the picker's
 * chosen id rides every round as the model lane of the request body; the
 * meta-model stays the default so an unconfigured chat never names a
 * model the gateway doesn't know. */
export const MODEL_KEY = "dt-chat-model-v1";

/** useChatModel — the persisted model selection (localStorage + type
 * guard, the os stored-state grammar). */
export function useChatModel() {
  return useStoredState<string>(MODEL_KEY, GATEWAY_MODEL, isString);
}

/* --------------------------- thinking effort --------------------------- */

/** the cognition effort of the round (rung 125): off answers straight,
 * medium reasons quietly, high walks the whole staircase — the honest
 * effort control the competitors ship, persisted per visitor. */
export type ChatThinking = "off" | "medium" | "high";

/** the cognition effort rows ride the chatlabels table now
 * (chatThinkingLevels answers the seeds today, the paired database
 * tomorrow) — the export keeps its name and shape so the composer's
 * single-import grammar stays untouched. */
export const CHAT_THINKING_LEVELS: Array<{ id: ChatThinking; label: string; note: string }> = chatThinkingLevels();

export const isChatThinking: Validator<ChatThinking> = (v): v is ChatThinking =>
  v === "off" || v === "medium" || v === "high";

export const THINKING_KEY = "dt-chat-thinking-v1";

/** useChatThinking — the persisted effort selection. The default is
 * medium (the round the unconfigured chat always ran). */
export function useChatThinking() {
  return useStoredState<ChatThinking>(THINKING_KEY, "medium", isChatThinking);
}

/**
 * The gateway opt-in contract — the preference key, the endpoint validator
 * and the registration machine live in the shared os kernel
 * (gatewaybase.ts) so the chat panel and the settings page consume
 * ONE contract; re-exported here to keep the chat surface's single-import
 * grammar.
 */
export { normalizeGatewayBase, PREF_GATEWAYBASE } from "./gatewaybase.ts";

/**
 * deriveTitle — the session title is the first user message, single line,
 * capped. No inference call: honest derivation from local data.
 */
export function deriveTitle(text: string): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (!clean) return "New chat";
  return clean.length <= 48 ? clean : `${clean.slice(0, 48).trimEnd()}…`;
}

export function userTurn(content: string): ChatTurn {
  return { id: `t-${Date.now()}-u`, role: "user", content, at: Date.now() };
}

/**
 * newSession — one fresh conversation; the explicit id carries a deep
 * link's session (the /w/…/chat route hands its session over, so the
 * stored conversation and the address id agree instead of minting a
 * second identity the link can never find again).
 */
export function newSession(first: ChatTurn, id?: string): ChatSession {
  const sessionId = id || `s-${Date.now()}-${compactToken().slice(0, 5)}`;
  return {
    id: sessionId,
    title: deriveTitle(first.content),
    messages: [first],
    at: Date.now(),
    birth: {
      spaceId: createCompactId("sp"),
      sandboxId: createCompactId("sb"),
      sessionId,
    },
  };
}

/** upsertSession — newest first, capped at SESSION_CAP. */
export function upsertSession(sessions: ChatSession[], next: ChatSession, cap = SESSION_CAP): ChatSession[] {
  const rest = sessions.filter((s) => s.id !== next.id);
  return [{ ...next, at: Date.now() }, ...rest].slice(0, cap);
}

/* ------------------------------- handoff ------------------------------ */

/**
 * The deep-link handoff — the panel seals a /w/…/chat cold link on the
 * clean desktop route and parks the link's session id here; the chat
 * window consumes the slot once (open + db hydration) and clears it.
 * sessionStorage: the handoff lives for the arrival visit only.
 */
export const CHAT_HANDOFF_KEY = "dt.chat.handoff";

export function writeChatHandoff(sessionId: string): void {
  try {
    if (sessionId) window.sessionStorage.setItem(CHAT_HANDOFF_KEY, sessionId);
    else window.sessionStorage.removeItem(CHAT_HANDOFF_KEY);
  } catch {
    /* storage unavailable: the handoff rides the mount only */
  }
}

export function readChatHandoff(): string | null {
  try {
    return window.sessionStorage.getItem(CHAT_HANDOFF_KEY);
  } catch {
    return null;
  }
}

export function clearChatHandoff(): void {
  try {
    window.sessionStorage.removeItem(CHAT_HANDOFF_KEY);
  } catch {
    /* storage unavailable: nothing to clear */
  }
}

export function capTurns(messages: ChatTurn[], cap = TURN_CAP): ChatTurn[] {
  return messages.slice(-cap);
}

/* -------------------------------- tools ------------------------------- */

/**
 * The tool pills are honest local modes: they steer the system prompt sent
 * with the next turn and nothing else. There is no retrieval, upload or
 * image pipeline behind them yet — the notes below say exactly that, and
 * the same note reaches the model so it never pretends otherwise.
 */
export type ToolId = "thinking";

export type ChatTool = {
  id: ToolId;
  label: string;
  note: string;
};

export const CHAT_TOOLS: ChatTool[] = [
  /* the thinking tool retired at rung 125: cognition effort moved to the
   * microrow picker (the persisted ChatThinking rides the x-thinking-level
   * header of every round — the honest effort control, not a prompt patch).
   * The array stays the extension point the future tools (search, files)
   * will join. */
];

/** buildSystemPrompt — the Sol persona plus one line per active tool flag. */
export function buildSystemPrompt(active: ToolId[]): string {
  const lines = [chatPersona()];
  for (const tool of CHAT_TOOLS) {
    if (active.includes(tool.id)) lines.push(`${tool.label}: ${tool.note}`);
  }
  return lines.join(" ");
}

/* --------------------------- json model guard -------------------------- */

/**
 * The json model tripwire — the muse-jev ask_human rule wired to the chat
 * prompt. The caller may inject a `guard` channel (a json-model decision
 * built on ../../jsonengine with the gateway completer): one decision asks
 * whether the turn asks for an irreversible action (send, publish, pay,
 * delete or a permission change). A high-confidence yes appends one honest
 * line to the system prompt; low confidence, an outage or an absent channel
 * keeps the prompt the pills built — the guard refines, never blocks.
 */
export type PromptGuard = (prompt: string) => Promise<string | null>;

export const ACCOUNT_GUARD_NOTE =
  "Guard: this request may involve an irreversible action (send, publish, pay, delete or a permission change). You cannot execute anything — explain the consequence and ask the user to act and confirm.";

/**
 * guardlinefromverdict — one decision verdict to the guard line; anything
 * below the confidence floor (the fallback) answers null.
 */
export function guardlinefromverdict(verdict: { ok: boolean; value?: unknown }): string | null {
  return verdict.ok && verdict.value === "irreversible" ? ACCOUNT_GUARD_NOTE : null;
}

/* ------------------------------- gateway ------------------------------ */

/**
 * runTurn — one chat round: wraps gatewayChat with the system prompt and a
 * capped history window, running the optional json-model guard against the
 * last user prompt before the round (the guard line joins the system
 * content; a guard failure is swallowed — it never blocks the chat).
 * Returns a ready assistant turn; errors propagate to the caller (inline
 * error + retry, same contract as the os AuraChat).
 */
export async function runTurn(
  history: ChatTurn[],
  system: string,
  opts?: {
    base?: string;
    signal?: AbortSignal;
    model?: string;
    timeoutMs?: number;
    guard?: PromptGuard;
  },
): Promise<ChatTurn> {
  const apiMessages: GatewayMessage[] = [
    { role: "system", content: system },
    ...history.slice(-HISTORY_CAP).map((m) => ({ role: m.role, content: m.content })),
  ];
  const prompt = [...history].reverse().find((m) => m.role === "user")?.content ?? "";
  if (opts?.guard && prompt.trim()) {
    const line = await opts.guard(prompt).catch(() => null);
    if (line) apiMessages[0] = { role: "system", content: `${system} ${line}` };
  }
  const reply = await gatewayChat(apiMessages, opts);
  return {
    id: `t-${Date.now()}-a`,
    role: "assistant",
    content: reply.content,
    thought: reply.reasoning,
    model: reply.model ?? GATEWAY_MODEL,
    at: Date.now(),
  };
}

/**
 * runTurnStream — the streaming round of the same contract: reasoning deltas
 * land before content, every delta rides the handlers as it arrives, and the
 * session id + thinking level ride the gateway headers (the rotation context
 * and the budget live server-side). Returns the ready assistant turn with
 * the folded content — identical shape to runTurn, one caller grammar.
 */
export async function runTurnStream(
  history: ChatTurn[],
  system: string,
  opts?: {
    base?: string;
    signal?: AbortSignal;
    model?: string;
    sessionId?: string;
    thinkingLevel?: ThinkingLevel;
    timeoutMs?: number;
    handlers?: StreamHandlers;
  },
): Promise<ChatTurn> {
  const apiMessages: GatewayMessage[] = [
    { role: "system", content: system },
    ...history.slice(-HISTORY_CAP).map((m) => ({ role: m.role, content: m.content })),
  ];
  const reply = await gatewayChatStream(apiMessages, {
    base: opts?.base,
    model: opts?.model,
    sessionId: opts?.sessionId,
    thinkingLevel: opts?.thinkingLevel,
    timeoutMs: opts?.timeoutMs,
    signal: opts?.signal,
    handlers: opts?.handlers,
  });
  return {
    id: `t-${Date.now()}-a`,
    role: "assistant",
    content: reply.content,
    thought: reply.reasoning,
    model: reply.model ?? GATEWAY_MODEL,
    at: Date.now(),
  };
}

/* ------------------------ cascading edit checkpoints -------------------- */

/**
 * cloneSessionForEdit — the cascading checkpoint law of the house (R00170):
 * editing a message opens a variant flow that inherits the last context
 * WITHOUT interrupting the running one. The original session stays intact
 * (its round keeps running to its checkpoint); the branch carries the edit,
 * the whole checkpoint ladder, and re-answers from the edited turn — the
 * newest edit prevails because the branch is the conversation that commits
 * next. Pure logic, zero services.
 */
export function cloneSessionForEdit(session: ChatSession, turnId: string, newText: string): ChatSession | null {
  const index = session.messages.findIndex((m) => m.id === turnId && m.role === "user");
  if (index === -1) return null;
  const edited: ChatTurn = {
    ...session.messages[index],
    content: newText,
    id: `t-${Date.now()}-e`,
    at: Date.now(),
    edited: true,
  };
  const ladder: ChatCheckpoint[] = [
    ...(session.checkpoints ?? []),
    { at: Date.now(), turnId, edit: (session.checkpoints?.length ?? 0) + 1 },
  ];
  return {
    id: `${session.id.split("~")[0]}~e${ladder.length}-${compactToken().slice(0, 4)}`,
    title: session.title,
    messages: [...session.messages.slice(0, index), edited],
    at: Date.now(),
    checkpoints: ladder,
    editOf: session.id,
    /* the lineage owns one identity: the branch inherits the birth and
     * the visitor tags of the conversation it continues. */
    birth: session.birth,
    tags: session.tags,
  };
}

/** checkpointCount — the honest ladder size for the surfaces. */
export function checkpointCount(session: ChatSession): number {
  return session.checkpoints?.length ?? 0;
}

/* --------------------------- tags and lineage --------------------------- */

/** addTag — one visitor label joins the conversation (deduplicated,
 * trimmed, capped by the table's tagsCap; unknown casing is normalized
 * to lower so chips stay quiet). Pure logic, zero services. */
export function addTag(session: ChatSession, raw: string, cap = chatLimit("tagsCap")): ChatSession {
  const tag = raw.trim().toLowerCase().slice(0, 24);
  if (!tag) return session;
  const tags = session.tags ?? [];
  if (tags.includes(tag) || tags.length >= cap) return session;
  return { ...session, tags: [...tags, tag] };
}

/** removeTag — one visitor label leaves the conversation. */
export function removeTag(session: ChatSession, tag: string): ChatSession {
  const tags = (session.tags ?? []).filter((t) => t !== tag);
  return tags.length === 0 ? { ...session, tags: undefined } : { ...session, tags };
}

/** lineageKey — the identity the branch family shares: the id before the
 * first branch mark (the root session id the edit law forks from). */
export function lineageKey(session: ChatSession): string {
  return session.id.split("~")[0] ?? session.id;
}

/** siblingBranches — the whole branch family of the session (the root
 * and every fork, the session itself included), newest first — the
 * lineage switcher reads exactly this list. */
export function siblingBranches(sessions: ChatSession[], session: ChatSession): ChatSession[] {
  const key = lineageKey(session);
  return sessions.filter((s) => lineageKey(s) === key).sort((a, b) => b.at - a.at);
}

/** branchLabel — the honest ordinal of a branch: the edit count the
 * ladder carries, zero meaning the root round itself. */
export function branchLabel(session: ChatSession): number {
  return checkpointCount(session);
}

/* --------------------------------- hook ------------------------------- */

/**
 * useChatSessions — persisted session list + persisted active id. A fresh
 * chat is an empty active id; the empty→thread migration happens when the
 * first turn commits.
 */
export function useChatSessions() {
  const [sessions, setSessions] = useStoredState<ChatSession[]>(SESSIONS_KEY, [], isChatSessionList);
  const [activeId, setActiveId] = useStoredState<string>(ACTIVE_KEY, "", isString);
  const active = useMemo(() => sessions.find((s) => s.id === activeId) ?? null, [sessions, activeId]);

  const open = useCallback((id: string) => setActiveId(id), [setActiveId]);
  const startFresh = useCallback(() => setActiveId(""), [setActiveId]);
  const commit = useCallback(
    (session: ChatSession) => {
      setSessions((prev) => upsertSession(prev, session));
      setActiveId(session.id);
    },
    [setSessions, setActiveId],
  );
  const remove = useCallback(
    (id: string) => {
      setSessions((prev) => prev.filter((s) => s.id !== id));
      setActiveId((cur) => (cur === id ? "" : cur));
    },
    [setSessions, setActiveId],
  );

  return { sessions, active, activeId, open, startFresh, commit, remove };
}

/* ------------------------------- helpers ------------------------------ */

/** fmtTime — hh:mm in the en-GB clock, tabular for the meta lines. */
export function fmtTime(at: number): string {
  try {
    return new Date(at).toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

/** minimal class joiner (clsx-shaped, no external dependency). */
export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}
