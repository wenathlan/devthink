/**
 * Chat.tsx — the devthink chat screen of the getry Sol theme (the chat
 * surface, task 2-a): the real conversation pane over the OpenAI-compatible
 * gateway routes. two panes answer — the conversations rail (new chat, the
 * stored list with the delete key, the route chips with the live status
 * dots of the parallel discovery, the model picker and the gateway origin
 * pin) and the thread column (the reasoning-disclosing assistant blocks,
 * the markdown bodies, the honest usage/backend/lane footer, the starter
 * cards on the empty state, the composer with the thinking caixinha).
 *
 * the state law: conversations live in react state seeded from the db lane
 * (listconversations over /api/v1/conversations) with the localStorage
 * mirror as the offline fallback — db the source of truth when reachable,
 * the mirror always written, the saves debounced ~1.5s so a stream commits
 * once at its end. the streaming answer is a transient ghost that commits
 * as a message on done; an abort keeps the partial answer (the stop key is
 * a save, never a loss); every send resends the full history (the gateway
 * rotation contract) with the conversation session id pinned.
 */

import { AddRegular, ArrowSyncRegular, DeleteRegular } from "@fluentui/react-icons";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  type ChatResult,
  completechat,
  DISCOVERYVERSIONS,
  type DiscoveryRoute,
  discovery,
  gatewayorigin,
  newsessionid,
  setgatewayorigin,
  streamchat,
} from "../../chatclient";
import {
  deleteconversationremote,
  listconversations,
  saveconversationremote,
  type ClientConversationRow,
  type ClientMessageRow,
  type ConversationUpsert,
} from "../../db";
import { gatewayViewConfig, smartpoolof } from "../../gateway";
import { label, labelfill } from "../../labels";
import { observeReveals } from "../../reveal";
import { DEFAULTTHINKINGLEVEL } from "../../thinking";
import { toast } from "../toast/Toast.tsx";
import { Composer, ModelPicker, type ModelOption } from "./Composer.tsx";
import { MessageView, type ChatMessageView } from "./Message.tsx";

/** the localStorage mirror of the conversations (the offline fallback lane). */
const MIRRORKEY = "getry.chat.conversations";

/** the localStorage key of the onboarding start prefs — {version, modelId,
 * thinkingLevel} — the seed of every new conversation when present (the
 * design pass law: the first run pick rides the browser only). */
const PREFSKEY = "getry.chat.prefs";

/** the debounce window of the db saves in milliseconds. */
const SAVEDEBOUNCE = 1500;

/** the title budget: the auto-derived title truncates at 42 characters. */
const TITLEBUDGET = 42;

/** the default temperature the conversations ride. */
const DEFAULTTEMPERATURE = 0.7;

/** one conversation of the chat surface — the state row the persistence
 * lanes mirror and the thread renders. */
export type ChatConversation = {
  id: string;
  title: string;
  version: string;
  modelId: string;
  thinkingLevel: string;
  temperature: number;
  sessionId: string;
  messages: ChatMessageView[];
  createdAt: string;
  updatedAt: string;
};

/** the transient streaming ghost — the answer that has not committed yet. */
type StreamGhost = {
  conversationId: string;
  content: string;
  reasoning: string;
};

/** draws one row id (message or conversation) — the drawn suffix keeps the keys unique (the crypto lane draws the bytes; Math.random never touches an id the rotation context can bind to). */
function newid(prefix: string): string {
  const draw = new Uint8Array(6);
  globalThis.crypto.getRandomValues(draw);
  const suffix = Array.from(draw, (byte) => byte.toString(36).padStart(2, "0")).join("").slice(0, 8);
  return `${prefix}-${Date.now().toString(36)}-${suffix}`;
}

/** derives the conversation title from the first user message (42 chars, one line). */
function derivetitle(text: string): string {
  const flat = text.replace(/\s+/g, " ").trim();
  return flat.length > TITLEBUDGET ? `${flat.slice(0, TITLEBUDGET).trimEnd()}…` : flat;
}

/** formats one timestamp as the relative label of the conversation rows. */
function relativetime(iso: string): string {
  const then = Date.parse(iso);
  if (!Number.isFinite(then)) return "";
  const minutes = Math.floor((Date.now() - then) / 60000);
  if (minutes < 1) return label("chat.time.now");
  if (minutes < 60) return labelfill("chat.time.minutes", { n: String(minutes) });
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return labelfill("chat.time.hours", { n: String(hours) });
  return labelfill("chat.time.days", { n: String(Math.floor(hours / 24)) });
}

/** reads the localStorage mirror — the offline lane the db rows overlay. */
function readmirror(): ChatConversation[] {
  try {
    const raw = window.localStorage.getItem(MIRRORKEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((row): row is ChatConversation => row !== null && typeof row === "object" && Array.isArray((row as { messages?: unknown }).messages));
  } catch {
    return [];
  }
}

/** writes the localStorage mirror (best effort — the db stays the truth). */
function writemirror(conversations: ChatConversation[]): void {
  try {
    window.localStorage.setItem(MIRRORKEY, JSON.stringify(conversations));
  } catch {
    /* a full or absent storage lane never breaks the surface */
  }
}

/** reads the saved start prefs of the onboarding (getry.chat.prefs) — the
 * {version, modelId, thinkingLevel} trio seeds every new conversation when
 * present; null when absent or unreadable (best effort, never a break). */
function readprefs(): { version?: string; modelId?: string; thinkingLevel?: string } | null {
  try {
    const raw = window.localStorage.getItem(PREFSKEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (parsed === null || typeof parsed !== "object") return null;
    return parsed as { version?: string; modelId?: string; thinkingLevel?: string };
  } catch {
    return null;
  }
}

/** maps one stored conversation row (the db shape) to the state row. */
function fromrow(row: ClientConversationRow & { messages: ClientMessageRow[] }): ChatConversation {
  return {
    id: row.id,
    title: row.title || label("chat.untitled"),
    version: row.route ?? "v1",
    modelId: row.modelId ?? "devthink",
    thinkingLevel: row.thinkingLevel ?? DEFAULTTHINKINGLEVEL,
    temperature: typeof row.temperature === "number" ? row.temperature : DEFAULTTEMPERATURE,
    sessionId: row.sessionId ?? newsessionid(),
    messages: (row.messages ?? []).map((message) => ({
      id: message.id,
      role: message.role === "assistant" ? "assistant" : "user",
      content: message.content ?? "",
      reasoning: message.reasoning ?? undefined,
      modelId: message.modelId ?? undefined,
      route: message.route ?? undefined,
      provider: message.provider ?? undefined,
      backendModel: undefined,
      fallback: message.fallback ?? undefined,
      error: message.error ?? undefined,
      usage:
        message.usage !== null && typeof message.usage === "object"
          ? (message.usage as ChatMessageView["usage"])
          : undefined,
      createdAt: message.createdAt ?? "",
    })),
    createdAt: row.createdAt ?? "",
    updatedAt: row.updatedAt ?? "",
  };
}

/** builds the upsert body of one conversation (the db lane shape). */
function toupsert(conversation: ChatConversation): ConversationUpsert {
  return {
    id: conversation.id,
    title: conversation.title,
    route: conversation.version,
    modelId: conversation.modelId,
    thinkingLevel: conversation.thinkingLevel,
    temperature: conversation.temperature,
    sessionId: conversation.sessionId,
    messages: conversation.messages.map((message) => ({
      id: message.id,
      role: message.role,
      content: message.content,
      reasoning: message.reasoning ?? null,
      modelId: message.modelId ?? null,
      route: message.route ?? null,
      provider: message.provider ?? null,
      fallback: message.fallback ?? null,
      error: message.error ?? null,
      usage: message.usage ?? null,
    })),
  };
}

/**
 * the chat screen.
 *
 * @returns the chat element.
 */
export default function Chat() {
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [ghost, setGhost] = useState<StreamGhost | null>(null);
  const [routes, setRoutes] = useState<DiscoveryRoute[] | null>(null);
  const [probing, setProbing] = useState(false);
  const [originField, setOriginField] = useState(() => gatewayorigin());
  const [storageLane, setStorageLane] = useState<"db" | "local">("local");
  const [armedDelete, setArmedDelete] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  const abortRef = useRef<AbortController | null>(null);
  const saveTimer = useRef<number | undefined>(undefined);
  const threadRef = useRef<HTMLDivElement | null>(null);
  const hydratedRef = useRef(false);

  const active = useMemo(
    () => conversations.find((conversation) => conversation.id === activeId) ?? null,
    [conversations, activeId],
  );
  const streaming = ghost !== null;

  /* ===== block: mount — the load, the discovery, the reveal pass ===== */

  const refreshroutes = useCallback(async () => {
    setProbing(true);
    try {
      setRoutes(await discovery(gatewayorigin()));
    } finally {
      setProbing(false);
    }
  }, []);

  useEffect(() => {
    observeReveals();
    let live = true;
    void (async () => {
      const dbrows = await listconversations();
      if (!live) return;
      const localrows = readmirror();
      // the merge law: db rows win on the same id (the source of truth when
      // reachable), the mirror-only rows survive, newest updated first
      const byid = new Map(localrows.map((row) => [row.id, row]));
      for (const row of dbrows) byid.set(row.id, fromrow(row));
      const merged = [...byid.values()].sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
      hydratedRef.current = true;
      if (!live) return;
      if (dbrows.length > 0) setStorageLane("db");
      setConversations(merged);
      if (merged.length > 0) setActiveId(merged[0].id);
      setHydrated(true);
    })();
    void refreshroutes();
    return () => {
      live = false;
    };
  }, [refreshroutes]);

  /* ===== block: persistence — the mirror now, the db lane debounced ===== */

  useEffect(() => {
    if (!hydrated) return;
    writemirror(conversations);
    window.clearTimeout(saveTimer.current);
    const conversation = conversations.find((row) => row.id === activeId);
    if (!conversation || conversation.messages.length === 0) return;
    saveTimer.current = window.setTimeout(() => {
      void saveconversationremote(toupsert(conversation)).then((stored) => {
        setStorageLane(stored !== null ? "db" : "local");
      });
    }, SAVEDEBOUNCE);
    return () => window.clearTimeout(saveTimer.current);
  }, [conversations, activeId, hydrated]);

  /* ===== block: the thread auto-scroll ===== */

  useEffect(() => {
    const thread = threadRef.current;
    if (thread) thread.scrollTop = thread.scrollHeight;
  }, [ghost?.content, ghost?.reasoning, active?.messages.length, activeId]);

  /* ===== block: the catalog — live discovery with the family seed fallback ===== */

  /** the model options of one version: the live catalog when discovery
   * answered, the gateway.ts seed otherwise — always the meta badge of the
   * mask row and the smart-pool badge of the rotation pool. */
  const modeloptions = useCallback(
    (version: string): ModelOption[] => {
      const discovered = routes?.find((route) => route.version === version && route.status === "live");
      const pool = new Set(
        discovered?.meta?.rotationPool ?? smartpoolof(gatewayViewConfig, version),
      );
      if (discovered && discovered.models.length > 0) {
        return discovered.models.map((row) => ({
          id: row.id,
          context: row.context,
          output: row.output,
          meta: row.id === "devthink",
          pool: pool.has(row.id),
        }));
      }
      const config = gatewayViewConfig.versions[version];
      if (!config) return [];
      return config.models.map((model) => ({
        id: model.id,
        context: model.context,
        output: model.maxoutput,
        meta: model.id === config.metamodel?.id,
        pool: pool.has(model.id),
      }));
    },
    [routes],
  );

  const activeoptions = useMemo(() => modeloptions(active?.version ?? "v1"), [modeloptions, active?.version]);

  /** the status one version chip answers: the probed route, or the seed badge while probing. */
  const routestatus = (version: string): "live" | "paused" | "error" => {
    const probed = routes?.find((route) => route.version === version);
    if (probed) return probed.status;
    return gatewayViewConfig.versions[version]?.paused === true ? "paused" : "live";
  };

  /* ===== block: the conversation actions ===== */

  /** creates a fresh conversation row — the onboarding start prefs
   * (getry.chat.prefs) seed the replica, the model and the rung when the
   * first run saved a start; the honest defaults answer otherwise. */
  function newconversation(): ChatConversation {
    const now = new Date().toISOString();
    const prefs = readprefs();
    return {
      id: newid("conv"),
      title: label("chat.untitled"),
      version: typeof prefs?.version === "string" && prefs.version !== "" ? prefs.version : "v1",
      modelId: typeof prefs?.modelId === "string" && prefs.modelId !== "" ? prefs.modelId : "devthink",
      thinkingLevel:
        typeof prefs?.thinkingLevel === "string" && prefs.thinkingLevel !== ""
          ? prefs.thinkingLevel
          : DEFAULTTHINKINGLEVEL,
      temperature: DEFAULTTEMPERATURE,
      sessionId: newsessionid(),
      messages: [],
      createdAt: now,
      updatedAt: now,
    };
  }

  /** the new-chat key: stops any live stream, opens the fresh conversation. */
  function startnew() {
    abortRef.current?.abort();
    const conversation = newconversation();
    setConversations((prev) => [conversation, ...prev]);
    setActiveId(conversation.id);
  }

  /** the delete key — the two-step confirm (arm, then delete for real). */
  function removeconversation(id: string) {
    if (armedDelete !== id) {
      setArmedDelete(id);
      window.setTimeout(() => setArmedDelete((current) => (current === id ? null : current)), 2600);
      return;
    }
    setArmedDelete(null);
    if (id === activeId) setActiveId(null);
    setConversations((prev) => {
      const next = prev.filter((row) => row.id !== id);
      writemirror(next);
      return next;
    });
    void deleteconversationremote(id);
    toast(label("chat.toast.deleted"), "info");
  }

  /** picks one route: the active conversation and the draft both move; a
   * model the new lane never serves resets to the mask. */
  function pickversion(version: string) {
    if (routestatus(version) === "paused") return;
    const options = modeloptions(version);
    setConversations((prev) =>
      prev.map((row) =>
        row.id === activeId
          ? {
              ...row,
              version,
              modelId: options.some((option) => option.id === row.modelId) ? row.modelId : "devthink",
              updatedAt: new Date().toISOString(),
            }
          : row,
      ),
    );
  }

  /** picks one model for the active conversation. */
  function pickmodel(id: string) {
    setConversations((prev) =>
      prev.map((row) => (row.id === activeId ? { ...row, modelId: id, updatedAt: new Date().toISOString() } : row)),
    );
  }

  /** picks one thinking level — persisted on the conversation row. */
  function pickthinking(level: string) {
    setConversations((prev) =>
      prev.map((row) =>
        row.id === activeId ? { ...row, thinkingLevel: level, updatedAt: new Date().toISOString() } : row,
      ),
    );
  }

  /** commits the origin field on blur — the pin re-probes the routes. */
  function commitorigin() {
    const accepted = setgatewayorigin(originField);
    setOriginField(accepted);
    void refreshroutes();
  }

  /* ===== block: the send, stop and retry lanes ===== */

  /** appends one message to a conversation row. */
  const appendmessage = useCallback((conversationId: string, message: ChatMessageView) => {
    setConversations((prev) =>
      prev.map((row) =>
        row.id === conversationId
          ? { ...row, messages: [...row.messages, message], updatedAt: message.createdAt }
          : row,
      ),
    );
  }, []);

  /** builds the assistant message row of one settled result. */
  function assistantof(conversation: ChatConversation, result: ChatResult, createdAt: string): ChatMessageView {
    return {
      id: newid("msg"),
      role: "assistant",
      content: result.content,
      reasoning: result.reasoning !== "" ? result.reasoning : undefined,
      modelId: result.model ?? conversation.modelId,
      route: conversation.version,
      provider: result.provider,
      backendModel: result.backendModel,
      fallback: result.fallback,
      usage: result.usage,
      createdAt,
    };
  }

  /** the send lane: the user turn commits at once, the answer streams as the
   * ghost and commits on done (an abort keeps the partial answer). */
  async function send(text: string) {
    if (ghost !== null) return;
    let conversation = active;
    if (!conversation) {
      conversation = newconversation();
      setConversations((prev) => [conversation as ChatConversation, ...prev]);
      setActiveId(conversation.id);
    }
    const now = new Date().toISOString();
    const user: ChatMessageView = { id: newid("msg"), role: "user", content: text, createdAt: now };
    const history = [...conversation.messages, user];
    const titled =
      conversation.messages.length === 0 ? derivetitle(text) : conversation.title;
    setConversations((prev) =>
      prev.map((row) =>
        row.id === conversation?.id ? { ...row, title: titled, messages: history, updatedAt: now } : row,
      ),
    );
    const lane: ChatConversation = { ...conversation, messages: history };
    const controller = new AbortController();
    abortRef.current = controller;
    setGhost({ conversationId: lane.id, content: "", reasoning: "" });
    try {
      const result = await streamchat({
        origin: gatewayorigin(),
        version: lane.version,
        model: lane.modelId,
        messages: history.map((message) => ({ role: message.role, content: message.content })),
        thinkingLevel: lane.thinkingLevel,
        temperature: lane.temperature,
        sessionId: lane.sessionId,
        signal: controller.signal,
        onDelta: (chunk) =>
          setGhost((prev) => (prev && prev.conversationId === lane.id ? { ...prev, content: prev.content + chunk } : prev)),
        onReasoning: (chunk) =>
          setGhost((prev) =>
            prev && prev.conversationId === lane.id ? { ...prev, reasoning: prev.reasoning + chunk } : prev,
          ),
      });
      const empty = result.content === "" && result.reasoning === "";
      if (!(result.aborted === true && empty)) {
        appendmessage(lane.id, assistantof(lane, result, new Date().toISOString()));
      }
      if (result.aborted === true && !empty) {
        toast(label("chat.toast.stopped"), "info");
      } else if (result.aborted !== true && empty) {
        toast(label("chat.error.empty"), "error");
      }
    } catch (error) {
      const reason = error instanceof Error ? error.message : "the route never answered";
      appendmessage(lane.id, {
        id: newid("msg"),
        role: "assistant",
        content: "",
        error: labelfill("chat.error.stream", { reason }),
        modelId: lane.modelId,
        route: lane.version,
        createdAt: new Date().toISOString(),
      });
    } finally {
      abortRef.current = null;
      setGhost(null);
    }
  }

  /** the stop lane — the abort keeps the partial answer, the ghost commits. */
  function stop() {
    abortRef.current?.abort();
  }

  /** the retry lane — the non-stream helper re-asks with the history the
   * last assistant turn rode, replacing its answer. */
  async function retry() {
    if (ghost !== null || !active) return;
    const messages = [...active.messages];
    while (messages.length > 0 && messages[messages.length - 1].role === "assistant") messages.pop();
    if (messages.length === 0) return;
    const lane: ChatConversation = { ...active, messages };
    setConversations((prev) =>
      prev.map((row) => (row.id === lane.id ? { ...row, messages, updatedAt: new Date().toISOString() } : row)),
    );
    toast(label("chat.toast.retrying"), "info");
    try {
      const result = await completechat({
        origin: gatewayorigin(),
        version: lane.version,
        model: lane.modelId,
        messages: messages.map((message) => ({ role: message.role, content: message.content })),
        thinkingLevel: lane.thinkingLevel,
        temperature: lane.temperature,
        sessionId: lane.sessionId,
      });
      appendmessage(lane.id, assistantof(lane, result, new Date().toISOString()));
    } catch (error) {
      const reason = error instanceof Error ? error.message : "the route never answered";
      appendmessage(lane.id, {
        id: newid("msg"),
        role: "assistant",
        content: "",
        error: labelfill("chat.error.stream", { reason }),
        modelId: lane.modelId,
        route: lane.version,
        createdAt: new Date().toISOString(),
      });
    }
  }

  /* ===== block: the render ===== */

  /** the version chips of the route selector. */
  const versionchips = DISCOVERYVERSIONS.map((version) => {
    const status = routestatus(version);
    const probed = routes?.find((route) => route.version === version);
    const tip =
      status === "paused"
        ? label("chat.route.paused")
        : status === "error"
          ? label("chat.route.error")
          : labelfill("chat.route.latency", { ms: String(probed?.latencyMs ?? 0) });
    return (
      <button
        key={version}
        type="button"
        className="r3-chip chat__routechip"
        aria-pressed={active?.version === version ? "true" : "false"}
        aria-disabled={status === "paused" ? "true" : undefined}
        data-tip={tip}
        onClick={() => pickversion(version)}
      >
        <i className="chatdot" data-status={status} aria-hidden="true" />
        /{version}
      </button>
    );
  });

  /** the starter prompts of the empty thread. */
  const starters = [label("chat.thread.starter1"), label("chat.thread.starter2"), label("chat.thread.starter3"), label("chat.thread.starter4")];

  const showstarters = !active || active.messages.length === 0;
  const ghostvisible = ghost !== null && ghost.conversationId === active?.id;
  const lastassistant =
    active !== null && active.messages.length > 0 && active.messages[active.messages.length - 1].role === "assistant";

  return (
    <section className="chat" aria-label={label("chat.aria")}>
      {/* the conversations rail — the list, the route selector, the model
          picker and the origin pin of the advanced seat */}
      <aside className="chat__side">
        <button type="button" className="btn-tactile-3d chat__new" onClick={startnew}>
          <AddRegular fontSize={15} aria-hidden="true" />
          {label("chat.new")}
        </button>

        <div className="chatconvlist" aria-label={label("chat.list.aria")}>
          {conversations.length === 0 ? (
            <p className="chatconvlist__empty">{label("chat.list.empty")}</p>
          ) : (
            conversations.map((conversation) => (
              <div
                key={conversation.id}
                className="chatconv"
                data-active={conversation.id === activeId ? "true" : undefined}
              >
                <button
                  type="button"
                  className="chatconv__open"
                  onClick={() => setActiveId(conversation.id)}
                  aria-current={conversation.id === activeId ? "true" : undefined}
                >
                  <span className="chatconv__title">{conversation.title}</span>
                  <span className="chatconv__meta mono">
                    {conversation.version} · {conversation.modelId} · {relativetime(conversation.updatedAt)}
                  </span>
                </button>
                <button
                  type="button"
                  className="chatconv__del"
                  data-armed={armedDelete === conversation.id ? "true" : undefined}
                  aria-label={armedDelete === conversation.id ? label("chat.list.deleteConfirm") : label("chat.list.delete")}
                  data-tip={armedDelete === conversation.id ? label("chat.list.deleteConfirm") : label("chat.list.delete")}
                  onClick={() => removeconversation(conversation.id)}
                >
                  <DeleteRegular fontSize={13} aria-hidden="true" />
                </button>
              </div>
            ))
          )}
        </div>

        <div className="chat__panel reveal">
          <p className="railmeta__head">{label("chat.route.head")}</p>
          <div className="chat__routes">{versionchips}</div>
          <button type="button" className="chat__probe" onClick={() => void refreshroutes()} disabled={probing}>
            <ArrowSyncRegular fontSize={12} aria-hidden="true" />
            {label("chat.route.probe")}
          </button>

          <p className="railmeta__head">{label("chat.model.head")}</p>
          <ModelPicker options={activeoptions} modelId={active?.modelId ?? "devthink"} onPick={pickmodel} />

          <label className="chat__originlabel" htmlFor="chat-origin">
            {label("chat.origin.label")}
          </label>
          <input
            id="chat-origin"
            className="chat__origin"
            type="url"
            spellCheck={false}
            autoComplete="off"
            value={originField}
            placeholder={label("chat.origin.hint")}
            aria-label={label("chat.origin.aria")}
            onChange={(event) => setOriginField(event.target.value)}
            onBlur={commitorigin}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                commitorigin();
              }
            }}
          />
          <span className="badge chat__storage" aria-label={label("chat.storage.aria")}>
            {storageLane === "db" ? label("chat.storage.db") : label("chat.storage.local")}
          </span>
        </div>
      </aside>

      {/* the thread column — the head, the exchange and the composer */}
      <div className="chat__threadcol">
        <header className="chatthread__head">
          <p className="chatthread__title">{active?.title ?? label("chat.untitled")}</p>
          <p className="chatthread__lane mono">
            {active
              ? `/${active.version} · ${active.modelId} · ${active.thinkingLevel}`
              : "/v1 · devthink · high"}
          </p>
        </header>

        <div className="chatthread" ref={threadRef} aria-label={label("chat.thread.aria")}>
          {showstarters ? (
            <div className="chatstarters">
              <p className="chatstarters__head">{label("chat.thread.starterHead")}</p>
              <div className="chatstarters__grid">
                {starters.map((starter) => (
                  <button key={starter} type="button" className="chatstarter" onClick={() => void send(starter)}>
                    {starter}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {active?.messages.map((message, index) => (
            <MessageView
              key={message.id}
              message={message}
              onRetry={
                !streaming && lastassistant === true && index === active.messages.length - 1
                  ? () => void retry()
                  : undefined
              }
            />
          ))}

          {ghostvisible && ghost ? (
            <MessageView
              message={{
                id: "ghost",
                role: "assistant",
                content: ghost.content,
                reasoning: ghost.reasoning !== "" ? ghost.reasoning : undefined,
                modelId: active?.modelId,
                route: active?.version,
                createdAt: "",
              }}
              streaming
            />
          ) : null}
        </div>

        <Composer
          streaming={streaming}
          modelOptions={activeoptions}
          modelId={active?.modelId ?? "devthink"}
          onPickModel={pickmodel}
          thinkingLevel={active?.thinkingLevel ?? DEFAULTTHINKINGLEVEL}
          onPickThinking={pickthinking}
          temperature={active?.temperature ?? DEFAULTTEMPERATURE}
          onSend={(text) => void send(text)}
          onStop={stop}
        />
      </div>
    </section>
  );
}
