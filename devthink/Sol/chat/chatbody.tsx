/**
 * chatbody.tsx — the conversation body of the chat subapp, beside the page
 * anchor: the dtc-frame (nav rail, thread stage, session panel) without any
 * shell chrome, so the /chat page and the os chat window mount the SAME
 * body (the windows law — one app, one body, two surfaces). This file also
 * carries the deep-link handoff: a /w/…/chat cold link parks its session
 * id under sessionStorage (chatstate), the body opens it here and hydrates
 * the conversation from the browser db (the os HD) when the local list
 * doesn't know it yet — the first send adopts the link id, so the stored
 * conversation and the address id agree from then on.
 */

import { PanelLeft, PanelRight, Trash2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  buildSystemPrompt,
  type ChatSession,
  type ChatTurn,
  capTurns,
  clearChatHandoff,
  deriveTitle,
  GATEWAY_MODEL,
  newSession,
  readChatHandoff,
  runTurn,
  type ToolId,
  useChatSessions,
  userTurn,
} from "../../chatstate.ts";
import { loadBrowserSession } from "../../db.ts";
import { GATEWAY_REQUIRED_COPY, GATEWAY_SEND_NOTICE, useGatewayRegistration } from "../../gatewaybase.ts";
import { useIsMobile } from "../../useismobile.ts";
import { Composer } from "./composer.tsx";
import { SessionPanel } from "./sessionpanel.tsx";
import { Sidebar } from "./sidebar.tsx";
import { ErrorRow, ThinkingRow, Turn } from "./turn.tsx";
import { Welcome } from "./welcome.tsx";

/** The chat slice of the wave atmosphere contract: the C1-01 atmosphere
 * layers (.atmos light source, .grain film) are painted by the theme stylesheet — this guard only guarantees they never sit on
 * the pointer path, whatever pseudo-element each one lands on. */
const CHAT_CSS = `
.atmos::before, .atmos::after, .grain::before, .grain::after { pointer-events: none; }
`;

let chatCssReady = false;

/** Injects the chat atmosphere guard exactly once per document. */
function ensureChatCss(): void {
  if (chatCssReady || typeof document === "undefined") return;
  chatCssReady = true;
  const tag = document.createElement("style");
  tag.setAttribute("data-dt-chat", "");
  tag.textContent = CHAT_CSS;
  document.head.appendChild(tag);
}

export default function ChatBody() {
  ensureChatCss();
  const { sessions, active, open, startFresh, commit, remove } = useChatSessions();
  const [tools, setTools] = useState<ToolId[]>([]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [railCollapsed, setRailCollapsed] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(max-width: 860px)").matches,
  );
  /* the session panel runs on the ShellChrome menu mount-state: the panel
   * mounts hidden, a rAF flips data-open on the next frame so the Windows
   * slide-cum-fade enter plays, and the exit keeps it mounted for the 200ms
   * transition before unmounting (a reopen during the exit reuses it) */
  const [panelMounted, setPanelMounted] = useState(() => typeof window !== "undefined" && window.innerWidth > 1100);
  const [panelOpen, setPanelOpen] = useState(false);
  const panelMountedRef = useRef(false);
  const panelExitTimer = useRef<number | null>(null);
  const isMobile = useIsMobile();
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const lastPrompt = useRef<string | null>(null);
  /** the fresh-turn tracker (r2-b conversation craft): the conversation id
   * and the id of the last turn already on the floor. A turn is "fresh"
   * (rises in 240ms) only when it arrives after the mount in the SAME
   * conversation — opening an old thread or the first history replay
   * resets the tracker and animates nothing. */
  const sessionRef = useRef<string>("");
  const lastTurnRef = useRef<string>("");
  const [freshId, setFreshId] = useState<string | null>(null);
  /** the explicit gateway opt-in (os/gatewaybase.ts): disconnected by
   * default, registered only through the session panel or settings — the
   * saved preference is the persisted opt-in and every registration runs a
   * real reachability probe. No gateway call happens without a base. */
  const gateway = useGatewayRegistration();
  /** the deep-link handoff: the parked session id of this arrival visit
   * (read once, cleared by this body, adopted by the first send) */
  const handoffRef = useRef<string | null>(readChatHandoff());

  const toggleTool = useCallback((id: ToolId) => {
    setTools((prev) => (prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]));
  }, []);

  // the handoff runs once per body mount: open the link session and, when
  // the local list doesn't carry it yet, hydrate it from the browser db.
  // The mount-only pass reads the initial session list on purpose — a later
  // list change must not replay the hydration.
  // biome-ignore lint/correctness/useExhaustiveDependencies: the handoff is a one-shot mount effect
  useEffect(() => {
    const handoff = handoffRef.current;
    if (!handoff) return undefined;
    clearChatHandoff();
    open(handoff);
    if (sessions.some((session) => session.id === handoff)) return undefined;
    void loadBrowserSession(handoff)
      .then((snapshot) => {
        const turns: ChatTurn[] = snapshot.messages
          .filter((message) => message.role !== "system")
          .map((message) => ({
            id: message.id,
            role: message.role === "user" ? "user" : "assistant",
            content: message.content,
            at: Date.parse(message.createdAt) || Date.now(),
          }));
        if (!turns.length) return;
        const spoken = turns.find((turn) => turn.role === "user");
        commit({
          id: handoff,
          title: snapshot.session?.title || deriveTitle(spoken?.content ?? ""),
          messages: capTurns(turns),
          at: Date.now(),
        });
      })
      .catch(() => undefined);
    return undefined;
  }, []);

  /** runCompletion — the gateway round for a history that already ends with
   * the user turn. Without a registered gateway nothing is fetched: the
   * honest notice takes the existing inline error/retry path and busy never
   * engages, so retry answers the moment a gateway is registered. */
  const runCompletion = useCallback(
    async (history: ChatSession, system: string) => {
      if (!gateway.base) {
        setError(GATEWAY_SEND_NOTICE);
        toast.error("No gateway registered", {
          description: GATEWAY_REQUIRED_COPY,
        });
        return;
      }
      setBusy(true);
      setError(null);
      try {
        const reply = await runTurn(history.messages, system, {
          base: gateway.base,
        });
        commit({
          ...history,
          messages: capTurns([...history.messages, reply]),
          at: Date.now(),
        });
      } catch (err) {
        const msg = err instanceof Error ? err.message : "unknown failure";
        setError(msg);
        toast.error("Sol did not respond", { description: msg });
      } finally {
        setBusy(false);
        window.requestAnimationFrame(() => inputRef.current?.focus());
      }
    },
    [commit, gateway.base],
  );

  /** send — commits the user turn (the empty→thread migration happens here,
   * adopting the deep-link id when the conversation is born from a link),
   * then rounds the gateway. */
  const send = useCallback(
    async (text: string) => {
      const clean = text.trim();
      if (!clean || busy) return;
      setDraft("");
      lastPrompt.current = clean;

      const user = userTurn(clean);
      const session: ChatSession = active
        ? {
            ...active,
            messages: capTurns([...active.messages, user]),
            at: Date.now(),
          }
        : newSession(user, handoffRef.current ?? undefined);
      handoffRef.current = null;
      commit(session);
      await runCompletion(session, buildSystemPrompt(tools));
    },
    [active, busy, commit, runCompletion, tools],
  );

  /**
   * retry — the AuraChat pattern, without the duplicate-turn flaw: when the
   * failed history still ends with the user turn, it is replayed as-is.
   */
  const retry = useCallback(() => {
    if (busy) return;
    if (active && active.messages.length > 0 && active.messages[active.messages.length - 1].role === "user") {
      void runCompletion(active, buildSystemPrompt(tools));
      return;
    }
    if (lastPrompt.current) void send(lastPrompt.current);
  }, [active, busy, runCompletion, send, tools]);

  const deleteActive = useCallback(() => {
    if (!active) return;
    remove(active.id);
    setError(null);
    toast("Conversation deleted");
  }, [active, remove]);

  const deleteFromRail = useCallback(
    (id: string) => {
      remove(id);
      setError(null);
      toast("Conversation deleted");
    },
    [remove],
  );

  /** openPanel — mounts the panel first; the effect flips the visible state
   * on the next frame so the enter transition plays; a reopen during the
   * exit shows the still-mounted panel right away. */
  const openPanel = useCallback(() => {
    if (panelExitTimer.current !== null) {
      window.clearTimeout(panelExitTimer.current);
      panelExitTimer.current = null;
    }
    if (panelMountedRef.current) {
      setPanelOpen(true);
      return;
    }
    panelMountedRef.current = true;
    setPanelMounted(true);
  }, []);

  /** closePanel — the slide-and-fade exit plays and the panel unmounts once
   * the 200ms Windows transition settles. */
  const closePanel = useCallback(() => {
    setPanelOpen(false);
    if (panelExitTimer.current !== null) window.clearTimeout(panelExitTimer.current);
    panelExitTimer.current = window.setTimeout(() => {
      panelMountedRef.current = false;
      setPanelMounted(false);
    }, 220);
  }, []);

  // mounting flips the visible state one frame later (the enter transition)
  useEffect(() => {
    if (!panelMounted) return undefined;
    const frame = window.requestAnimationFrame(() => setPanelOpen(true));
    return () => window.cancelAnimationFrame(frame);
  }, [panelMounted]);

  // the exit timer never outlives the chat body
  useEffect(
    () => () => {
      if (panelExitTimer.current !== null) window.clearTimeout(panelExitTimer.current);
    },
    [],
  );

  // the fresh-turn watcher: marks the appended turn (240ms rise, last only)
  useEffect(() => {
    const sid = active?.id ?? "";
    const msgs = active?.messages ?? [];
    const last = msgs.length ? msgs[msgs.length - 1] : null;
    if (sid !== sessionRef.current) {
      // conversation switch or first load — the floor replays nothing
      sessionRef.current = sid;
      lastTurnRef.current = last?.id ?? "";
      return;
    }
    if (last && last.id !== lastTurnRef.current) {
      lastTurnRef.current = last.id;
      setFreshId(last.id);
    }
  }, [active]);

  // autoscroll: every committed turn and the status flip pull the thread to the bottom
  // biome-ignore lint/correctness/useExhaustiveDependencies: the dep list is the trigger set — autoscroll re-runs on each committed turn and on the status/error flips even though the body only reads the scroll container
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [active?.messages.length, busy, error]);

  // Escape closes the mobile drawer first, then the session panel
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (isMobile && !railCollapsed) setRailCollapsed(true);
      else if (panelOpen) closePanel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [closePanel, isMobile, railCollapsed, panelOpen]);

  const empty = !active || active.messages.length === 0;

  return (
    <div className="dtc-frame">
      <Sidebar
        collapsed={railCollapsed}
        onToggleCollapsed={() => setRailCollapsed((v) => !v)}
        sessions={sessions}
        activeId={active?.id ?? ""}
        onOpen={open}
        onNew={startFresh}
        onDelete={deleteFromRail}
      />
      {isMobile && !railCollapsed ? (
        <button type="button" className="dtc-scrim" aria-label="Close sidebar" onClick={() => setRailCollapsed(true)} />
      ) : null}

      <main className="dtc-main">
        <header className="dtc-topbar">
          <button
            type="button"
            className="dtc-tb-btn"
            onClick={() => setRailCollapsed((v) => !v)}
            aria-expanded={!railCollapsed}
            aria-label={railCollapsed ? "Open sidebar" : "Close sidebar"}
            title={railCollapsed ? "Open sidebar" : "Close sidebar"}
          >
            <PanelLeft size={18} strokeWidth={1.8} aria-hidden="true" />
          </button>
          <div className="dtc-tb-title">
            <h1>{active ? active.title : "New chat"}</h1>
            <small>
              sol {GATEWAY_MODEL} {gateway.base ? "gateway on" : "gateway off"}
            </small>
          </div>
          <div className="dtc-tb-actions">
            {active ? (
              <button
                type="button"
                className="dtc-tb-btn"
                onClick={deleteActive}
                aria-label="Delete conversation"
                title="Delete conversation"
              >
                <Trash2 size={17} strokeWidth={1.8} aria-hidden="true" />
              </button>
            ) : null}
            <button
              type="button"
              className="dtc-tb-btn"
              onClick={panelOpen ? closePanel : openPanel}
              aria-pressed={panelOpen}
              aria-label={panelOpen ? "Close session panel" : "Open session panel"}
              title="Session panel"
            >
              <PanelRight size={18} strokeWidth={1.8} aria-hidden="true" />
            </button>
          </div>
        </header>

        <div className="dtc-stage atmos">
          {empty ? (
            <div className="dtc-hero grain" key="hero">
              <div className="dtc-hero__wrap">
                <Welcome onPick={(t) => void send(t)} gatewayRegistered={gateway.base !== ""} />
                <div className="dtc-dock">
                  <Composer
                    draft={draft}
                    onDraft={setDraft}
                    onSend={() => void send(draft)}
                    busy={busy}
                    tools={tools}
                    onToggleTool={toggleTool}
                    inputRef={inputRef}
                    notice={gateway.base ? undefined : GATEWAY_SEND_NOTICE}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="dtc-thread" key="thread">
              <div className="dtc-scroll" ref={scrollRef}>
                <div className="dtc-scroll__inner">
                  {active.messages.map((m) => (
                    <Turn key={m.id} turn={m} fresh={m.id === freshId} />
                  ))}
                  {busy ? <ThinkingRow /> : null}
                  {error && !busy ? <ErrorRow message={error} onRetry={retry} /> : null}
                </div>
              </div>
              <div className="dtc-dock">
                <Composer
                  draft={draft}
                  onDraft={setDraft}
                  onSend={() => void send(draft)}
                  busy={busy}
                  tools={tools}
                  onToggleTool={toggleTool}
                  inputRef={inputRef}
                  notice={gateway.base ? undefined : GATEWAY_SEND_NOTICE}
                />
              </div>
            </div>
          )}
        </div>
      </main>

      {panelMounted ? (
        <SessionPanel
          open={panelOpen}
          onClose={closePanel}
          model={GATEWAY_MODEL}
          turnCount={active?.messages.length ?? 0}
          sessionCount={sessions.length}
          tools={tools}
          gateway={gateway}
        />
      ) : null}
    </div>
  );
}
