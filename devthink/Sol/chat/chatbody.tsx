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

import {
  PanelLeftRegular as PanelLeft,
  PanelRightRegular as PanelRight,
  DeleteRegular as TrashIcon,
} from "@fluentui/react-icons";
import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { osAppLabels } from "../../catalog.ts";
import {
  buildSystemPrompt,
  type ChatSession,
  type ChatTurn,
  capTurns,
  clearChatHandoff,
  cloneSessionForEdit,
  deriveTitle,
  GATEWAY_MODEL,
  isChatStop,
  newSession,
  readChatHandoff,
  runTurnStream,
  type ToolId,
  useChatSessions,
  userTurn,
} from "../../chatstate.ts";
import { loadBrowserSession } from "../../db.ts";
import { GATEWAY_REQUIRED_COPY, GATEWAY_SEND_NOTICE, useGatewayRegistration } from "../../gatewaybase.ts";
import { useIsMobile } from "../../useismobile.ts";
import { Composer } from "./composer.tsx";
import { SandboxPane } from "./sandboxpane.tsx";
import { SessionPanel } from "./sessionpanel.tsx";
import { Sidebar } from "./sidebar.tsx";
import { DaySeparator, ErrorRow, dayKey, ThinkingRow, Turn } from "./turn.tsx";
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

/** the app title of the empty conversation rides the catalog label row, never
 * a hardcoded literal (the bare id keeps the heading honest if the row is
 * missing). */
const CHAT_LABEL = osAppLabels().chat;

export default function ChatBody({ embedded }: { embedded?: boolean }) {
  ensureChatCss();
  const { sessions, active, open, startFresh, commit, remove } = useChatSessions();
  const [tools, setTools] = useState<ToolId[]>([]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  /* the stop lane (rung 119): the controller of the running round — the
   * Stop pill aborts it, the gateway answers the honest ChatStoppedError
   * and the partial answer commits to the floor instead of an error row.
   * The live turn mirrors into a ref because the catch reads it after the
   * state closure went stale (the async round outlives the render). */
  const abortRef = useRef<AbortController | null>(null);
  const liveRef = useRef<ChatTurn | null>(null);
  /* the streaming clock (rung 121): the round start + the half-second tick
   * that drives the elapsed label of the generation status row. */
  const roundStartRef = useRef<number>(0);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [railCollapsed, setRailCollapsed] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(max-width: 860px)").matches,
  );
  /* the session panel runs on the ShellChrome menu mount-state: the panel
   * mounts hidden, a rAF flips data-open on the next frame so the Windows
   * slide-cum-fade enter plays, and the exit keeps it mounted for the 200ms
   * transition before unmounting (a reopen during the exit reuses it). The
   * page keeps the inspector default (open on wide viewports); the embedded
   * window starts closed — the window is narrow and the panel would cover
   * the composer, so it opens on demand only. */
  const [panelMounted, setPanelMounted] = useState(
    () => !embedded && typeof window !== "undefined" && window.innerWidth > 1100,
  );
  const [panelOpen, setPanelOpen] = useState(false);
  const panelMountedRef = useRef(false);
  const panelExitTimer = useRef<number | null>(null);
  /* the sandbox lane rides the same mount-state grammar as the session
   * panel: mounted hidden, a rAF flips data-open so the Windows
   * slide-cum-fade enter plays, the exit keeps it mounted for the 200ms
   * transition and a reopen reuses it. On a wide viewport it docks as a
   * right-side lane beside the thread stage; on the narrow viewport or the
   * embedded window it swaps the conversation body instead (the pane carries
   * its own command well, so overlaying the composer would fight the chat).
   * The pane unmounts fully on close — the engine state dies with it: the
   * sandbox is ephemeral session state (like busy) and never persists in
   * chatstate. */
  const [sandboxMounted, setSandboxMounted] = useState(false);
  const [sandboxOpen, setSandboxOpen] = useState(false);
  const [sandboxRunning, setSandboxRunning] = useState(false);
  const sandboxMountedRef = useRef(false);
  const sandboxExitTimer = useRef<number | null>(null);
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
  /** the live streaming turn — grows with every delta, replaced by the
   * committed turn when the stream closes. */
  const [live, setLive] = useState<ChatTurn | null>(null);
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
   * engages, so retry answers the moment a gateway is registered. The round
   * streams: reasoning deltas land in the cognition drawer, content deltas
   * grow the live turn on the floor, and the committed turn replaces the
   * live one when the stream closes (one [DONE]). The Stop pill aborts the
   * controller and the partial answer commits with its stopped flag — the
   * visitor's stop is never an error. */
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
      const ctrl = new AbortController();
      abortRef.current = ctrl;
      roundStartRef.current = Date.now();
      setElapsedMs(0);
      const seedLive: ChatTurn = { id: "t-live", role: "assistant", content: "", at: Date.now() };
      liveRef.current = seedLive;
      setLive(seedLive);
      try {
        const reply = await runTurnStream(history.messages, system, {
          base: gateway.base,
          sessionId: history.id.split("~")[0],
          thinkingLevel: tools.includes("thinking") ? "high" : "medium",
          signal: ctrl.signal,
          handlers: {
            onContent: (d) => {
              liveRef.current = liveRef.current
                ? { ...liveRef.current, content: liveRef.current.content + d }
                : liveRef.current;
              setLive((prev) => (prev ? { ...prev, content: prev.content + d } : prev));
            },
            onReasoning: (d) => {
              liveRef.current = liveRef.current
                ? { ...liveRef.current, thought: (liveRef.current.thought ?? "") + d }
                : liveRef.current;
              setLive((prev) => (prev ? { ...prev, thought: (prev.thought ?? "") + d } : prev));
            },
          },
        });
        commit({
          ...history,
          messages: capTurns([...history.messages, reply]),
          at: Date.now(),
        });
      } catch (err) {
        if (isChatStop(err)) {
          /* the visitor stopped the round: whatever streamed stays on the
           * floor as an honest partial (stopped flag on), and a round with
           * nothing streamed keeps the user turn for the retry path. */
          const partial = liveRef.current;
          if (partial && (partial.content.trim() || partial.thought?.trim())) {
            commit({
              ...history,
              messages: capTurns([
                ...history.messages,
                {
                  ...partial,
                  id: `t-${Date.now()}-a`,
                  model: partial.model ?? GATEWAY_MODEL,
                  stopped: true,
                },
              ]),
              at: Date.now(),
            });
            toast("Generation stopped", {
              description: "The partial answer stayed on the floor — regenerate answers it again.",
            });
          } else {
            toast("Generation stopped");
          }
        } else {
          const msg = err instanceof Error ? err.message : "unknown failure";
          setError(msg);
          toast.error("Sol did not respond", { description: msg });
        }
      } finally {
        abortRef.current = null;
        liveRef.current = null;
        setBusy(false);
        setLive(null);
        window.requestAnimationFrame(() => inputRef.current?.focus());
      }
    },
    [commit, gateway.base, tools],
  );

  /** stop — the Stop pill of the composer: aborts the running round. The
   * catch lane above commits the partial and clears busy; pressing stop
   * without a running round is a no-op. */
  const stop = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  /** regenerate — the competitor grammar on the last assistant turn: the
   * old answer leaves the floor (the session commits without it) and the
   * same user turn rounds again. A stopped partial regenerates the same
   * way — the stop never locks the conversation. */
  const regenerate = useCallback(() => {
    if (busy || !active || active.messages.length === 0) return;
    const last = active.messages[active.messages.length - 1];
    if (last.role === "assistant") {
      const stripped: ChatSession = {
        ...active,
        messages: active.messages.slice(0, -1),
        at: Date.now(),
      };
      commit(stripped);
      void runCompletion(stripped, buildSystemPrompt(tools));
      return;
    }
    void runCompletion(active, buildSystemPrompt(tools));
  }, [active, busy, commit, runCompletion, tools]);

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

  /** editTurn — the cascading checkpoint law: the edit opens the variant
   * flow (cloneSessionForEdit snapshots the conversation, the original stays
   * intact, the branch carries the edit plus the whole ladder) and the round
   * answers from the edited turn. The newest edit prevails — the branch is
   * the conversation that commits next. */
  const editTurn = useCallback(
    (turnId: string, newText: string) => {
      if (!active || busy) return;
      const branch = cloneSessionForEdit(active, turnId, newText);
      if (!branch) return;
      commit(branch);
      toast("Checkpoint branch opened", {
        description: "The original keeps its round — the edit carries the ladder forward.",
      });
      void runCompletion(branch, buildSystemPrompt(tools));
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

  /** deleteTurn — the row delete of the action row (rung 120): the message
   * leaves the conversation (the session commits without it), the toast
   * answers once, and a session left empty falls back to the hero. */
  const deleteTurn = useCallback(
    (turnId: string) => {
      if (!active || busy) return;
      if (!active.messages.some((m) => m.id === turnId)) return;
      commit({
        ...active,
        messages: active.messages.filter((m) => m.id !== turnId),
        at: Date.now(),
      });
      toast("Message deleted");
    },
    [active, busy, commit],
  );

  /** deleteActive — the topbar delete of the whole conversation. */
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

  /** openSandbox — mounts the lane first; the effect flips the visible state
   * on the next frame so the enter transition plays; a reopen during the
   * exit shows the still-mounted pane right away. */
  const openSandbox = useCallback(() => {
    if (sandboxExitTimer.current !== null) {
      window.clearTimeout(sandboxExitTimer.current);
      sandboxExitTimer.current = null;
    }
    if (sandboxMountedRef.current) {
      setSandboxOpen(true);
      return;
    }
    sandboxMountedRef.current = true;
    setSandboxMounted(true);
  }, []);

  /** closeSandbox — the slide-and-fade exit plays, the engine lamp resets
   * and the pane unmounts once the 200ms Windows transition settles (the
   * engine state dies with it). */
  const closeSandbox = useCallback(() => {
    setSandboxOpen(false);
    if (sandboxExitTimer.current !== null) window.clearTimeout(sandboxExitTimer.current);
    sandboxExitTimer.current = window.setTimeout(() => {
      sandboxMountedRef.current = false;
      setSandboxMounted(false);
      setSandboxRunning(false);
    }, 220);
  }, []);

  /** toggleSandbox — the composer chip flips the lane. */
  const toggleSandbox = useCallback(() => {
    if (sandboxOpen) closeSandbox();
    else openSandbox();
  }, [closeSandbox, openSandbox, sandboxOpen]);

  /** the engine lamp reporter for the composer chip (stable identity so the
   * pane effect only re-runs on the status flip). */
  const reportSandboxRunning = useCallback((running: boolean) => {
    setSandboxRunning(running);
  }, []);

  // mounting flips the visible state one frame later (the enter transition)
  useEffect(() => {
    if (!panelMounted) return undefined;
    const frame = window.requestAnimationFrame(() => setPanelOpen(true));
    return () => window.cancelAnimationFrame(frame);
  }, [panelMounted]);

  // mounting flips the sandbox lane the same way (the enter transition)
  useEffect(() => {
    if (!sandboxMounted) return undefined;
    const frame = window.requestAnimationFrame(() => setSandboxOpen(true));
    return () => window.cancelAnimationFrame(frame);
  }, [sandboxMounted]);

  // the exit timers never outlive the chat body
  useEffect(
    () => () => {
      if (panelExitTimer.current !== null) window.clearTimeout(panelExitTimer.current);
      if (sandboxExitTimer.current !== null) window.clearTimeout(sandboxExitTimer.current);
    },
    [],
  );

  // the streaming clock (rung 121): while the round runs, the half-second
  // tick keeps the elapsed label honest; the clear on stop/finish is
  // implicit (busy flips false, the effect tears the interval down).
  useEffect(() => {
    if (!busy) return;
    const tick = () => setElapsedMs(Date.now() - roundStartRef.current);
    tick();
    const timer = window.setInterval(tick, 500);
    return () => window.clearInterval(timer);
  }, [busy]);

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

  // the stream follower: while tokens land, the thread tracks the growth only
  // when the visitor rides the bottom (the classic chat pin — reading history
  // mid-answer never yanks the floor away). A new turn or a status flip always
  // pulls to the bottom.
  const streamPinnedRef = useRef(true);

  const onScrollTrack = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    streamPinnedRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 120;
  }, []);

  // biome-ignore lint/correctness/useExhaustiveDependencies: the dep list is the trigger set — autoscroll re-runs on each committed turn and on the status/error flips even though the body only reads the scroll container
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
    streamPinnedRef.current = true;
  }, [active?.id, active?.messages.length, busy, error]);

  // the live deltas: scroll only while pinned to the bottom
  // biome-ignore lint/correctness/useExhaustiveDependencies: the live lengths are the trigger — the follower reads the scroll container only
  useEffect(() => {
    if (!busy) return;
    const el = scrollRef.current;
    if (el && streamPinnedRef.current) el.scrollTop = el.scrollHeight;
  }, [busy, live?.content.length, live?.thought?.length]);

  // Escape closes the mobile drawer first, then the session panel, then the
  // sandbox lane
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (isMobile && !railCollapsed) setRailCollapsed(true);
      else if (panelOpen) closePanel();
      else if (sandboxOpen) closeSandbox();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [closePanel, closeSandbox, isMobile, railCollapsed, panelOpen, sandboxOpen]);

  const empty = !active || active.messages.length === 0;
  /** the sandbox pane docks as a right-side lane while the viewport is wide
   * on the full page; the narrow viewport and the embedded window swap the
   * conversation body instead (the pane owns its own command well). */
  const sandboxSwap = isMobile || embedded === true;

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
            <PanelLeft fontSize={18} aria-hidden="true" />
          </button>
          <div className="dtc-tb-title">
            <h1>{active ? active.title : (CHAT_LABEL?.name ?? "Chat")}</h1>
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
                <TrashIcon fontSize={17} aria-hidden="true" />
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
              <PanelRight fontSize={18} aria-hidden="true" />
            </button>
          </div>
        </header>

        <div className="dtc-stage atmos">
          {sandboxMounted && sandboxSwap ? (
            <SandboxPane open={sandboxOpen} onClose={closeSandbox} swap onRunningChange={reportSandboxRunning} />
          ) : empty ? (
            <div className="dtc-hero grain" key="hero">
              <div className="dtc-hero__wrap">
                <Welcome onPick={(t) => void send(t)} gatewayRegistered={gateway.base !== ""} />
              </div>
              <div className="dtc-dock">
                <Composer
                  draft={draft}
                  onDraft={setDraft}
                  onSend={() => void send(draft)}
                  onStop={stop}
                  busy={busy}
                  tools={tools}
                  onToggleTool={toggleTool}
                  inputRef={inputRef}
                  notice={gateway.base ? undefined : GATEWAY_SEND_NOTICE}
                  sandboxOn={sandboxOpen}
                  sandboxRunning={sandboxRunning}
                  onToggleSandbox={toggleSandbox}
                />
              </div>
            </div>
          ) : (
            <div className="dtc-thread" key={active?.id ?? "thread"}>
              <div className="dtc-scroll" ref={scrollRef} onScroll={onScrollTrack}>
                <div className="dtc-scroll__inner">
                  {active.messages.map((m, i) => {
                    const prev = i > 0 ? active.messages[i - 1] : null;
                    const newDay = !prev || dayKey(prev.at) !== dayKey(m.at);
                    return (
                      <Fragment key={m.id}>
                        {newDay ? <DaySeparator at={m.at} /> : null}
                        <Turn
                          turn={m}
                          fresh={m.id === freshId}
                          busy={busy}
                          onEdit={m.role === "user" ? (text) => editTurn(m.id, text) : undefined}
                          onRegenerate={
                            m.role === "assistant" && m.id === active.messages[active.messages.length - 1]?.id && !busy
                              ? regenerate
                              : undefined
                          }
                          onDelete={!busy ? () => deleteTurn(m.id) : undefined}
                        />
                      </Fragment>
                    );
                  })}
                  {busy ? (
                    <ThinkingRow streaming={Boolean(live && (live.content || live.thought))} elapsedMs={elapsedMs} />
                  ) : null}
                  {busy && live && (live.content || live.thought) ? <Turn turn={live} /> : null}
                  {error && !busy ? <ErrorRow message={error} onRetry={retry} /> : null}
                </div>
              </div>
              <div className="dtc-dock">
                <Composer
                  draft={draft}
                  onDraft={setDraft}
                  onSend={() => void send(draft)}
                  onStop={stop}
                  busy={busy}
                  tools={tools}
                  onToggleTool={toggleTool}
                  inputRef={inputRef}
                  notice={gateway.base ? undefined : GATEWAY_SEND_NOTICE}
                  sandboxOn={sandboxOpen}
                  sandboxRunning={sandboxRunning}
                  onToggleSandbox={toggleSandbox}
                />
              </div>
            </div>
          )}
        </div>
      </main>

      {sandboxMounted && !sandboxSwap ? (
        <SandboxPane open={sandboxOpen} onClose={closeSandbox} onRunningChange={reportSandboxRunning} />
      ) : null}

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
