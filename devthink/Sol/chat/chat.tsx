/**
 * chat page anchor — layer 3 of the anchor architecture.
 * The file carrying the folder's own name is the path manager of the page:
 * it imports the loose components beside it, mounts the page and re-exports
 * the public component surface. Only the theme anchor (Sol/Sol.tsx) consumes
 * this file; no module outside the folder imports the folder members
 * directly. This anchor carries the page mount itself.
 *
 * Chat — the /chat surface of the Sol theme, a Grok/ChatGPT-grade
 * conversation shell on the Sol material:
 * - windows 11 rail (New chat, grouped history, theme links) + right
 *   session panel with a spring transform, both collapsible
 * - the signature migration: the empty state centers the composer under
 *   the welcome hero; the first turn crossfades (~500ms) into the thread
 *   layout with the composer docked at the footer of the internal layout
 * - turns with a minimal markdown renderer, the internal-cognition drawer
 *   and an honest generation status; errors inherit the AuraChat contract
 *   (inline card + retry + toast)
 * - conversations persist via useStoredState (localStorage + type-guard +
 *   caps); the network goes through the os gateway client exclusively
 * - the gateway is opt-in: the chat starts disconnected and the assistant
 *   answers only after the visitor registers a gateway (session panel or
 *   settings); a send without a registration surfaces an inline notice and
 *   the error/retry row, never a gateway call
 */

/** Style: Sol liquid glass on slate dark — one ember signal, mica rail, glass composer. */
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { PanelLeft, PanelRight, Trash2 } from "lucide-react";
import {
  GATEWAY_REQUIRED_COPY,
  GATEWAY_SEND_NOTICE,
  useGatewayRegistration,
} from "../os/gateway.base";
import { useIsMobile } from "./use.is.mobile";
import {
  buildSystemPrompt,
  capTurns,
  GATEWAY_MODEL,
  newSession,
  runTurn,
  useChatSessions,
  userTurn,
  type ChatSession,
  type ToolId,
} from "./state";
import { Sidebar } from "./sidebar";
import { Composer } from "./composer";
import { ErrorRow, ThinkingRow, Turn } from "./turn";
import { Welcome } from "./welcome";
import { SessionPanel } from "./session.panel";
import { ShellChrome } from "../shell/ShellChrome";

export * from "./sidebar";
export * from "./composer";
export * from "./turn";
export * from "./welcome";
export * from "./session.panel";
export * from "./solbot.icon";
export * from "./state";
export * from "./use.is.mobile";

export default function Chat() {
  const { sessions, active, open, startFresh, commit, remove } = useChatSessions();
  const [tools, setTools] = useState<ToolId[]>([]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [railCollapsed, setRailCollapsed] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(max-width: 860px)").matches
  );
  const [panelOpen, setPanelOpen] = useState(
    () => typeof window !== "undefined" && window.innerWidth > 1100
  );
  const isMobile = useIsMobile();
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const lastPrompt = useRef<string | null>(null);
  /** the explicit gateway opt-in (os/gateway.base.ts): disconnected by
   * default, registered only through the session panel or settings — the
   * saved preference is the persisted opt-in and every registration runs a
   * real reachability probe. No gateway call happens without a base. */
  const gateway = useGatewayRegistration();

  const toggleTool = useCallback((id: ToolId) => {
    setTools((prev) => (prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]));
  }, []);

  /** runCompletion — the gateway round for a history that already ends with
   * the user turn. Without a registered gateway nothing is fetched: the
   * honest notice takes the existing inline error/retry path and busy never
   * engages, so retry answers the moment a gateway is registered. */
  const runCompletion = useCallback(
    async (history: ChatSession, system: string) => {
      if (!gateway.base) {
        setError(GATEWAY_SEND_NOTICE);
        toast.error("No gateway registered", { description: GATEWAY_REQUIRED_COPY });
        return;
      }
      setBusy(true);
      setError(null);
      try {
        const reply = await runTurn(history.messages, system, { base: gateway.base });
        commit({ ...history, messages: capTurns([...history.messages, reply]), at: Date.now() });
      } catch (err) {
        const msg = err instanceof Error ? err.message : "unknown failure";
        setError(msg);
        toast.error("Sol did not respond", { description: msg });
      } finally {
        setBusy(false);
        window.requestAnimationFrame(() => inputRef.current?.focus());
      }
    },
    [commit, gateway.base]
  );

  /** send — commits the user turn (the empty→thread migration happens here), then rounds the gateway. */
  const send = useCallback(
    async (text: string) => {
      const clean = text.trim();
      if (!clean || busy) return;
      setDraft("");
      lastPrompt.current = clean;

      const user = userTurn(clean);
      const session: ChatSession = active
        ? { ...active, messages: capTurns([...active.messages, user]), at: Date.now() }
        : newSession(user);
      commit(session);
      await runCompletion(session, buildSystemPrompt(tools));
    },
    [active, busy, commit, runCompletion, tools]
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
    const title = active.title;
    remove(active.id);
    setError(null);
    toast("Conversation deleted", { description: `“${title}” was removed from this device.` });
  }, [active, remove]);

  const deleteFromRail = useCallback(
    (id: string) => {
      remove(id);
      setError(null);
      toast("Conversation deleted", { description: "The conversation was removed from this device." });
    },
    [remove]
  );

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
      else if (panelOpen) setPanelOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isMobile, railCollapsed, panelOpen]);

  const empty = !active || active.messages.length === 0;

  return (
    <div className="chat-root">
      <ShellChrome />
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
          <button
            type="button"
            className="dtc-scrim"
            aria-label="Close sidebar"
            onClick={() => setRailCollapsed(true)}
          />
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
                sol · model {GATEWAY_MODEL} · {gateway.base ? "gateway registered" : "no gateway registered"}
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
                onClick={() => setPanelOpen((v) => !v)}
                aria-pressed={panelOpen}
                aria-label={panelOpen ? "Close session panel" : "Open session panel"}
                title="Session panel"
              >
                <PanelRight size={18} strokeWidth={1.8} aria-hidden="true" />
              </button>
            </div>
          </header>

          <div className="dtc-stage">
            {empty ? (
              <div className="dtc-hero" key="hero">
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
                      <Turn key={m.id} turn={m} />
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

        <SessionPanel
          open={panelOpen}
          onClose={() => setPanelOpen(false)}
          model={GATEWAY_MODEL}
          turnCount={active?.messages.length ?? 0}
          sessionCount={sessions.length}
          tools={tools}
          gateway={gateway}
        />
      </div>
    </div>
  );
}
