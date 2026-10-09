/**
 * state.ts — the conversation logic of the chat subapp: persisted sessions
 * ({ id, title, messages, at }) on the os useStoredState grammar (localStorage
 * + type-guard + cap), the tool pills as honest local modes, and a thin
 * wrapper around the os gateway client. Zero fetch logic here — everything
 * goes through gatewayChat from ../../osgateway, so the chat subapp owns no
 * network code of its own.
 */
import { useCallback, useMemo } from "react";
import { type GatewayMessage, gatewayChat } from "../../osgateway";
import { arrayOf, isString, useStoredState, type Validator } from "../os/usestoredstate";

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
  at: number;
};

export type ChatSession = {
  id: string;
  title: string;
  messages: ChatTurn[];
  /** last activity timestamp — drives the Today / Previous 7 days groups. */
  at: number;
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
    typeof t.at === "number"
  );
};

export const isChatSession: Validator<ChatSession> = (v): v is ChatSession => {
  if (typeof v !== "object" || v === null) return false;
  const s = v as Record<string, unknown>;
  return (
    typeof s.id === "string" &&
    typeof s.title === "string" &&
    Array.isArray(s.messages) &&
    s.messages.every(isChatTurn) &&
    typeof s.at === "number"
  );
};

export const isChatSessionList: Validator<ChatSession[]> = arrayOf(isChatSession);

/* ------------------------------- storage ------------------------------ */

export const SESSIONS_KEY = "dt-chat-sessions-v1";
export const ACTIVE_KEY = "dt-chat-active-v1";
export const SESSION_CAP = 60;
export const TURN_CAP = 40;
export const HISTORY_CAP = 12;
export const GATEWAY_MODEL = "devthink";

/**
 * The gateway opt-in contract — the preference key, the endpoint validator
 * and the registration machine live in the shared os kernel
 * (../os/gatewaybase.ts) so the chat panel and the settings page consume
 * ONE contract; re-exported here to keep the chat surface's single-import
 * grammar.
 */
export { normalizeGatewayBase, PREF_GATEWAYBASE } from "../os/gatewaybase";

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

export function newSession(first: ChatTurn): ChatSession {
  return {
    id: `s-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    title: deriveTitle(first.content),
    messages: [first],
    at: Date.now(),
  };
}

/** upsertSession — newest first, capped at SESSION_CAP. */
export function upsertSession(sessions: ChatSession[], next: ChatSession, cap = SESSION_CAP): ChatSession[] {
  const rest = sessions.filter((s) => s.id !== next.id);
  return [{ ...next, at: Date.now() }, ...rest].slice(0, cap);
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
export type ToolId = "thinking" | "search" | "research" | "files" | "image";

export type ChatTool = {
  id: ToolId;
  label: string;
  note: string;
};

export const CHAT_TOOLS: ChatTool[] = [
  {
    id: "thinking",
    label: "Thinking",
    note: "Walk through the reasoning explicitly, step by step, before the final answer.",
  },
  {
    id: "search",
    label: "Search",
    note: "The gateway has no live retrieval; reason as if searching and flag anything that needs verification.",
  },
  {
    id: "research",
    label: "Deep research",
    note: "Go long: multi-angle analysis with trade-offs, no external sources are contacted.",
  },
  {
    id: "files",
    label: "Files",
    note: "Attachment upload is not wired to the gateway; ask the user to paste file contents inline.",
  },
  {
    id: "image",
    label: "Image",
    note: "Image generation is not wired to the gateway; describe visuals in text only.",
  },
];

/** buildSystemPrompt — the Sol persona plus one line per active tool flag. */
export function buildSystemPrompt(active: ToolId[]): string {
  const lines = [
    "You are Sol, the DevThink gateway assistant: precise, warm and technical. Answer in the user's language, prefer concrete detail over filler, and use markdown when structure helps.",
  ];
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
  opts?: { base?: string; signal?: AbortSignal; model?: string; timeoutMs?: number; guard?: PromptGuard },
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
    return new Date(at).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}

/** minimal class joiner (clsx-shaped, no external dependency). */
export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}
