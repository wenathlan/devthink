/**
 * body.tsx — the conversation body of the chat subapp, beside the page
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
  DocumentEditRegular as CanvasGlyph,
  ChevronDownRegular as ChevronDown,
  CubeRegular as Cube,
  PanelLeftRegular as PanelLeft,
  PanelRightRegular as PanelRight,
  DeleteRegular as TrashIcon,
} from "@fluentui/react-icons";
import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { osAppLabels } from "../../catalog.ts";
import { chatLimit, chatSandboxContract, chatText } from "../../chatlabels.ts";
import {
  branchLabel,
  buildSystemPrompt,
  type ChatSession,
  type ChatThinking,
  type ChatTurn,
  capTurns,
  checkpointCount,
  clearChatHandoff,
  cloneSessionForEdit,
  deriveTitle,
  GATEWAY_MODEL,
  type GatewayModel,
  gatewayModels,
  isChatStop,
  newSession,
  readChatHandoff,
  runTurnStream,
  siblingBranches,
  type ToolId,
  useChatModel,
  useChatSessions,
  useChatThinking,
  userTurn,
} from "../../chatstate.ts";
import { loadBrowserSession } from "../../db.ts";
import { GATEWAY_REQUIRED_COPY, GATEWAY_SEND_NOTICE, useGatewayRegistration } from "../../gatewaybase.ts";
import { label } from "../../labels.ts";
import { estimateHistoryTokens, formatCompactTokenCount } from "../../tokenestimate.ts";
import { useIsMobile } from "../../useismobile.ts";
import { arrayOf, isString, useStoredState } from "../../usestoredstate.ts";
import { CANVAS_OPEN_EVENT, type CanvasDoc, type CanvasOpenDetail, CanvasPane } from "./ChatCanvaspane.tsx";
import { Composer } from "./ChatComposer.tsx";
import { type SandboxFileChange, SandboxPane, type SandboxRunner } from "./ChatSandboxpane.tsx";
import { SessionPanel } from "./ChatSessionpanel.tsx";
import { Sidebar } from "./ChatSidebar.tsx";
import type { SolBotState } from "./ChatSolboticon.tsx";
import { DaySeparator, dayKey, ErrorRow, ThinkingRow, Turn } from "./ChatTurn.tsx";
import { type RecentConversation, Welcome } from "./ChatWelcome.tsx";

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

/** the verdict grammar of the turn action rail (the w3 turn contract): the
 * good/bad keys report through the optional onVerdict prop and the record
 * stays on this device — never persisted, never sent. */
type Verdict = "up" | "down";

/** the w4 persistence keys — the house stored-state pattern (the same law
 * as the rail pins): the saved memory facts and the pinned project
 * instructions, both localStorage records with a validating type-guard
 * and storage optional. the list validator sits at module scope so the
 * load effect identity stays stable. */
const MEMORY_KEY = "dt-chat-memory-v1";
const isMemoryList = arrayOf(isString);
const INSTRUCTIONS_KEY = "dt-chat-instructions-v1";
/** the memory cap: the oldest fact leaves when a write would pass 30. */
const MEMORY_CAP = chatLimit("memoryCap");

/* the w5-a sandbox bridge: the thread and the engine finally speak. the
 * contract below rides the round's system prompt while the sandbox chip
 * is on, the parser reads the assistant's fenced blocks and json
 * tool-call lines, the pane's executor dispatches each command through
 * the engine lane, the task cards render under the turn that spawned
 * them, and the undelivered results ride the next round's history as one
 * follow-up user message — the quiet tool context that closes the
 * model's loop. honesty laws: no dispatch while the lane is closed or
 * the engine halted, no fabricated output, no error surface for a parse
 * miss (a malformed fence or line is today's plain markdown). */

/** SANDBOX_TOOL_CONTRACT — the tool-calling instruction the round's
 * system prompt gains while the sandbox chip is on: the fenced grammar
 * (one fence tagged sandbox carrying the command) and the json line
 * grammar, the honest result loop, and the law that the thread only
 * renders what the engine answered. */
const SANDBOX_TOOL_CONTRACT = chatSandboxContract();

/** the per-command output cap of the quiet tool context: longer engine
 * answers truncate with the honest marker (never a summarized fake). */
const SANDBOX_CONTEXT_CAP = chatLimit("sandboxContextCap");

/** one sandbox task of the bridge: the command the assistant asked the
 * engine to run, the honest answer, the measured duration and the vfs
 * changes the command wrote — grouped under the turn that spawned it. */
type SandboxTask = {
  id: string;
  turnId: string;
  command: string;
  output: string;
  exitCode: number;
  durationMs: number;
  changes: SandboxFileChange[];
};

/** the task id sequence — one counter for every card this body lands,
 * the react keys never collide. */
let sandboxTaskSeq = 0;

/** one row of the quiet diff: a removed or added line with its stable
 * row id. */
type DiffRow = { id: number; mark: "-" | "+"; text: string };

/** diffLines — the quiet line diff of one vfs change: the common head
 * and tail trim away, the changed middle answers as removed (-) and
 * added (+) rows — a deleted file is every line removed, a born file
 * every line added, an append or overwrite shows exactly the lines that
 * moved. */
function diffLines(before: string, after: string | null): DiffRow[] {
  const oldlines = before.length === 0 ? [] : before.split("\n");
  const newlines = after === null || after.length === 0 ? [] : after.split("\n");
  let head = 0;
  while (head < oldlines.length && head < newlines.length && oldlines[head] === newlines[head]) head += 1;
  let tailold = oldlines.length;
  let tailnew = newlines.length;
  while (tailold > head && tailnew > head && oldlines[tailold - 1] === newlines[tailnew - 1]) {
    tailold -= 1;
    tailnew -= 1;
  }
  const rows: DiffRow[] = [];
  let seq = 0;
  const push = (mark: "-" | "+", text: string) => {
    seq += 1;
    rows.push({ id: seq, mark, text });
  };
  for (let i = head; i < tailold; i += 1) push("-", oldlines[i] ?? "");
  for (let i = head; i < tailnew; i += 1) push("+", newlines[i] ?? "");
  return rows;
}

/** parseSandboxCalls — the tool-call parser of the bridge: the fenced
 * grammar first (a fence tagged sandbox carrying the command lines — the
 * closing fence must stand, so a stream stopped mid-fence never fires),
 * then the json line grammar ({"tool":"sandbox","command":"…"} on its
 * own line). a parse miss answers nothing: a malformed fence or line is
 * today's plain markdown, never an error surface. */
function parseSandboxCalls(text: string): string[] {
  const calls: string[] = [];
  /* the fence pass collects the commands and strips the matched blocks,
   * so the json line pass below never re-reads a line a fence already
   * answered (a json line inside a fence is a command, not a call). */
  const rest = text.replace(/```sandbox[^\n]*\n([\s\S]*?)```/g, (_full: string, body: string) => {
    for (const line of body.split("\n")) {
      const command = line.trim();
      if (command.length > 0) calls.push(command);
    }
    return "";
  });
  for (const line of rest.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed.startsWith("{") || !trimmed.endsWith("}")) continue;
    let parsed: unknown;
    try {
      parsed = JSON.parse(trimmed);
    } catch {
      continue;
    }
    if (typeof parsed !== "object" || parsed === null) continue;
    const call = parsed as { tool?: unknown; command?: unknown };
    if (call.tool === "sandbox" && typeof call.command === "string" && call.command.trim().length > 0) {
      calls.push(call.command.trim());
    }
  }
  return calls;
}

/** fmtTaskDuration — the honest engine duration of a task card: the
 * sub-millisecond dispatch reads "<1 ms", the rest the whole
 * milliseconds the clock measured (never a rounded-up zero or a padded
 * fake). */
function fmtTaskDuration(ms: number): string {
  return ms < 1 ? "<1 ms" : `${Math.round(ms)} ms`;
}

/** sandboxContextBody — the quiet tool section the model reads: every
 * command with its engine answer and exit code, the long outputs capped
 * with the honest truncation marker (never a fabricated summary). */
function sandboxContextBody(tasks: SandboxTask[]): string {
  const sections = tasks.map((task) => {
    const out =
      task.output.length > SANDBOX_CONTEXT_CAP
        ? `${task.output.slice(0, SANDBOX_CONTEXT_CAP)}\n[output truncated: ${task.output.length} chars total]`
        : task.output;
    const body = out.length > 0 ? `\n${out}` : "";
    return `$ ${task.command}${body}\n[exit ${task.exitCode}]`;
  });
  return `sandbox tool results (the engine answered these):\n\n${sections.join("\n\n")}`;
}

/* the w6-a canvas lane: the versioned text and code buffer beside the
 * thread — the flagship of the redesign. the openers: the topbar ghost
 * key (an empty buffer keeps the standing record), the dom event lane
 * (dt-canvas-open, armed today for the code block keys turn.tsx or
 * markdown.tsx may dispatch in a later wave), and the honest auto-open
 * — a committed assistant turn carrying a ```canvas fence opens the
 * pane with the last fence's buffer only when the pane was closed and
 * the round ended (the fence stays verbatim on the floor either way).
 * the version record: every save (the pane's edit lane) and every
 * differing opener content append one version, capped at 50 with the
 * oldest trimmed; the record is body-local — chatstate is out of
 * bounds, so the buffer dies with the body mount and never keys per
 * session (the session-record seam for a later wave). */

/** CANVAS_VERSION_CAP — the version record cap: a save that would pass
 * 50 trims the oldest (the pointer rides the head, never the trimmed
 * middle). */
const CANVAS_VERSION_CAP = chatLimit("canvasVersions");

/** CANVAS_FENCE — the fenced grammar of the canvas openers: a fence
 * whose label carries the canvas tag word (the boundary keeps
 * "canvasing" untagged), the language riding the rest of the label and
 * the closing fence required — a stream stopped mid-fence never opens
 * anything (the same honesty law the sandbox bridge runs). */
const CANVAS_FENCE = /```canvas\b([^\n`]*)\n([\s\S]*?)```/g;

/** lastCanvasFence — the honest scan of one committed assistant turn:
 * the LAST canvas fence's buffer and language, null when the turn
 * carries none (the open answers nothing — the fence stays plain
 * markdown on the floor). */
function lastCanvasFence(text: string): { content: string; lang: string } | null {
  let found: { content: string; lang: string } | null = null;
  for (const match of text.matchAll(CANVAS_FENCE)) {
    found = {
      content: (match[2] ?? "").replace(/\n$/, ""),
      lang: (match[1] ?? "").trim(),
    };
  }
  return found;
}

export default function ChatBody({ embedded }: { embedded?: boolean }) {
  ensureChatCss();
  const { sessions, active: persistedActive, open, startFresh, commit, remove } = useChatSessions();
  const [tools, setTools] = useState<ToolId[]>([]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  /* the model lane (rung 124): the persisted selection rides every round
   * (the meta-model stays the default so an unconfigured chat never names
   * an unknown model), and the catalog probe fills the picker when a
   * gateway registers — a probe failure keeps the meta-model row alone. */
  const [model, setModel] = useChatModel();
  const [models, setModels] = useState<GatewayModel[]>([]);
  /* the cognition lane (rung 125): the persisted effort rides every round
   * as the x-thinking-level header (off maps to none — the honest straight
   * answer), and the token meter below estimates the next round's payload
   * with the house estimator (a chars-per-token approximation — the meter
   * always says estimate, never pretends to count). */
  const [thinking, setThinking] = useChatThinking();
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
  /* the canvas lane (w6-a) rides the same mount-state grammar as the
   * sandbox lane: mounted hidden, a rAF flips data-open so the Windows
   * slide-cum-fade enter plays, the exit stays mounted for the 200ms
   * transition and a reopen reuses it. the versioned buffer outlives
   * the pane — the doc record lives in this body (body-local by the
   * chatstate boundary, the session-record seam noted at the top of
   * the file), so a closed and reopened pane finds the same buffer. */
  const [canvasMounted, setCanvasMounted] = useState(false);
  const [canvasOpen, setCanvasOpen] = useState(false);
  const [canvasDoc, setCanvasDoc] = useState<CanvasDoc | null>(null);
  const canvasMountedRef = useRef(false);
  const canvasOpenRef = useRef(false);
  const canvasExitTimer = useRef<number | null>(null);
  /* the canvas lane swaps the conversation body on the narrow viewport
   * or the embedded window — the same law the sandbox lane runs (the
   * flag derives beside the isMobile hook below). the exit seam is
   * declared ahead of the round and the sandbox open seam below because
   * those read it at render time through their dependency lists (the
   * render-order law of hooks). */
  /** closeCanvas — the slide-and-fade exit plays and the pane unmounts
   * once the 200ms Windows transition settles; the version record
   * stays in this body, so the next open finds the same buffer. */
  const closeCanvas = useCallback(() => {
    canvasOpenRef.current = false;
    setCanvasOpen(false);
    if (canvasExitTimer.current !== null) window.clearTimeout(canvasExitTimer.current);
    canvasExitTimer.current = window.setTimeout(() => {
      canvasMountedRef.current = false;
      setCanvasMounted(false);
    }, 220);
  }, []);

  /** the live-opener registration: the round (declared above the pane
   * lifecycle) and the dom event listener read the open seam through
   * this ref — the same registration law the sandbox bridge runner
   * runs, so no dependency cycle crosses the pane lifecycle. */
  const openCanvasRef = useRef<((content: string, title?: string, lang?: string) => void) | null>(null);

  /** maybeOpenCanvasFromReply — the honest auto-open: a committed
   * assistant turn carrying a canvas fence opens the pane with the
   * last fence's buffer, only while the pane was closed (an open pane
   * never yanks its buffer under the visitor) and only after the round
   * ended (the fence is committed text — a stream stopped mid-fence
   * never parses). */
  const maybeOpenCanvasFromReply = useCallback((text: string) => {
    if (canvasOpenRef.current) return;
    const fence = lastCanvasFence(text);
    if (fence === null) return;
    openCanvasRef.current?.(fence.content, undefined, fence.lang);
  }, []);
  /* the w5-a bridge state: the per-session task record (the cards are
   * work rows, never persisted turns — the record rides this body and
   * dies with the mount), the delivered watermark that keeps every
   * engine result reaching the model exactly once, the pane's executor
   * handoff, and the first-card anchors the turn chips scroll to. */
  const [sandboxTasks, setSandboxTasks] = useState<Record<string, SandboxTask[]>>({});
  const sandboxTasksRef = useRef<Record<string, SandboxTask[]>>({});
  const sandboxDeliveredRef = useRef<Record<string, number>>({});
  const sandboxRunnerRef = useRef<SandboxRunner | null>(null);
  const taskCardRefs = useRef<Map<string, HTMLElement>>(new Map());
  const taskScrollTimer = useRef<number | null>(null);
  const isMobile = useIsMobile();
  /* the canvas swap flag rides the isMobile hook answer (the same
   * derivation the sandbox lane runs at the render, hoisted here so
   * the open seams below read it through their dependency lists). */
  const canvasSwap = isMobile || embedded === true;
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

  /* the temporary lane (the w4 feature pass): the session that never
   * persists. the flag rides this body — the composer's lead-cluster
   * toggle is the composer wave's seam, so the lanes land here first:
   * while the flag is up every conversation mutation routes into the
   * ephemeral record below (the store never hears of the round), the
   * rail hides the working lane and the thread renders the ephemeral
   * session; opening a stored conversation always leaves the lane. */
  const [temporary, setTemporary] = useState(false);
  const [ephemeral, setEphemeral] = useState<ChatSession | null>(null);
  /** the working session every reader below answers: the ephemeral record
   * while the temporary flag is up, the stored record otherwise. */
  const active = temporary ? ephemeral : persistedActive;

  /* the w4 persistence pass: the saved-memory fact list and the pinned
   * project instructions ride the house stored-state hook (localStorage
   * plus validating type-guard, storage optional — the same law as the
   * rail pins), so both survive the reload and the panel's edit seams
   * write straight through. the memory list is capped: a write that
   * would pass 30 facts trims the oldest. */
  const [memoryFacts, setMemoryFacts] = useStoredState<string[]>(MEMORY_KEY, [], isMemoryList);
  const [instructions, setInstructions] = useStoredState<string>(INSTRUCTIONS_KEY, "", isString);

  /** changeMemory — the panel's memory seam writes through the cap: the
   * oldest fact leaves when a write would pass 30. */
  const changeMemory = useCallback(
    (facts: string[]) => {
      setMemoryFacts(facts.length > MEMORY_CAP ? facts.slice(-MEMORY_CAP) : facts);
    },
    [setMemoryFacts],
  );

  /** stitchSystemPrompt — the w4 prompt stitch: the pinned instructions
   * and the remembered facts ride ahead of the Sol persona on every
   * round. chatstate is out of bounds, so the composition happens here
   * at the call sites — every round that built buildSystemPrompt(tools)
   * now builds this instead. the w5-a seam: while the sandbox chip is
   * on, the sandbox tool contract joins the context blocks (the bridge
   * dispatches only while the engine lane answers — a closed lane
   * renders the fenced blocks as plain markdown, never fake work). */
  const stitchSystemPrompt = useCallback(
    (activeTools: ToolId[]): string => {
      const pinned = instructions.trim();
      const head = pinned ? `project instructions:\n${pinned}\n\n` : "";
      /* the temporary law: the memory never rides an ephemeral round —
       * the lane reads no facts while nothing saves on this device. */
      const facts = !temporary && memoryFacts.length > 0 ? `remembered facts:\n${memoryFacts.join("\n")}\n\n` : "";
      const sandbox = sandboxOpen ? `${SANDBOX_TOOL_CONTRACT}\n\n` : "";
      return `${head}${facts}${sandbox}${buildSystemPrompt(activeTools)}`;
    },
    [instructions, memoryFacts, sandboxOpen, temporary],
  );

  /** commitLane — the temporary-law router: every conversation mutation
   * rides this seam. the persisted lane writes the store (the upsert
   * plus the active id), the temporary lane grows the ephemeral record
   * the thread renders from — the store never hears of the round. */
  const commitLane = useCallback(
    (session: ChatSession) => {
      if (temporary) setEphemeral(session);
      else commit(session);
    },
    [commit, temporary],
  );

  /** runSandboxBridge — the honest loop of the w5-a tool bridge: the
   * committed assistant text parses for sandbox calls and every call
   * dispatches through the pane's engine executor — the command and its
   * answer land as task cards under the turn that spawned them and wait
   * as the next round's result context. the pass acts only while the
   * bridge is armed: a closed lane, a halted engine or a parse miss
   * answers nothing, and the fenced blocks stay plain markdown. */
  const runSandboxBridge = useCallback((sessionId: string, reply: ChatTurn) => {
    const runner = sandboxRunnerRef.current;
    if (runner === null) return;
    const calls = parseSandboxCalls(reply.content);
    if (calls.length === 0) return;
    const landed: SandboxTask[] = [];
    for (const command of calls) {
      const started = performance.now();
      const result = runner(command);
      const durationMs = performance.now() - started;
      /* the engine went away mid-pass — nothing fakes the rest of the
       * round's calls. */
      if (result === null) continue;
      sandboxTaskSeq += 1;
      landed.push({
        id: `sb-${sandboxTaskSeq}`,
        turnId: reply.id,
        command,
        output: result.output,
        exitCode: result.exitCode,
        durationMs,
        changes: result.changes,
      });
    }
    if (landed.length === 0) return;
    const next: Record<string, SandboxTask[]> = {
      ...sandboxTasksRef.current,
      [sessionId]: [...(sandboxTasksRef.current[sessionId] ?? []), ...landed],
    };
    sandboxTasksRef.current = next;
    setSandboxTasks(next);
  }, []);

  /** runCompletion — the gateway round for a history that already ends with
   * the user turn. Without a registered gateway nothing is fetched: the
   * honest notice takes the existing inline error/retry path and busy never
   * engages, so retry answers the moment a gateway is registered. The round
   * streams: reasoning deltas land in the cognition drawer, content deltas
   * grow the live turn on the floor, and the committed turn replaces the
   * live one when the stream closes (one [DONE]). The Stop pill aborts the
   * controller and the partial answer commits with its stopped flag — the
   * visitor's stop is never an error. The w5-a seam: the round's history
   * carries the undelivered sandbox results as one follow-up user message
   * (the quiet tool context, never committed to the visible thread),
   * the committed answer runs the tool-call bridge afterwards, and the
   * w6-a seam: a ```canvas fence in the committed answer auto-opens the
   * canvas lane (only while the pane was closed — the honest
   * auto-open). */
  const runCompletion = useCallback(
    async (history: ChatSession, system: string) => {
      if (!gateway.base) {
        setError(GATEWAY_SEND_NOTICE);
        toast.error(label("chat.body.noGateway"), {
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
      /* the sandbox result context (w5-a): the undelivered engine answers
       * ride this round's history as one follow-up user message — the task
       * cards carry the visible surface, this quiet context closes the
       * model's loop, and the message never commits to the conversation
       * (the watermark below advances only after the round answered, so a
       * failed fetch re-delivers on the retry — no result is ever lost). */
      const sid = history.id;
      const delivered = sandboxDeliveredRef.current[sid] ?? 0;
      const undelivered = (sandboxTasksRef.current[sid] ?? []).slice(delivered);
      const toolContext = undelivered.length > 0 ? userTurn(sandboxContextBody(undelivered)) : null;
      const roundMessages = toolContext === null ? history.messages : [...history.messages, toolContext];
      try {
        const reply = await runTurnStream(roundMessages, system, {
          base: gateway.base,
          model: model === GATEWAY_MODEL ? undefined : model,
          sessionId: history.id.split("~")[0],
          thinkingLevel: thinking === "off" ? "none" : thinking,
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
        /* the round answered — the results it consumed mark delivered
         * (each engine result reaches the model exactly once). */
        if (toolContext !== null) {
          sandboxDeliveredRef.current = {
            ...sandboxDeliveredRef.current,
            [sid]: delivered + undelivered.length,
          };
        }
        commitLane({
          ...history,
          messages: capTurns([...history.messages, reply]),
          at: Date.now(),
        });
        /* the tool-call bridge (w5-a): the committed answer parses for
         * sandbox calls and every call dispatches through the engine —
         * the cards land under this turn and wait as the next round's
         * result context. */
        runSandboxBridge(sid, reply);
        /* the canvas auto-open (w6-a): the committed answer's last
         * ```canvas fence opens the pane — only while it was closed
         * (the maybe seam reads the live opener through the ref). */
        maybeOpenCanvasFromReply(reply.content);
      } catch (err) {
        if (isChatStop(err)) {
          /* the visitor stopped the round: whatever streamed stays on the
           * floor as an honest partial (stopped flag on), and a round with
           * nothing streamed keeps the user turn for the retry path. */
          const partial = liveRef.current;
          if (partial && (partial.content.trim() || partial.thought?.trim())) {
            const committed: ChatTurn = {
              ...partial,
              id: `t-${Date.now()}-a`,
              model: partial.model ?? GATEWAY_MODEL,
              stopped: true,
            };
            commitLane({
              ...history,
              messages: capTurns([...history.messages, committed]),
              at: Date.now(),
            });
            /* the stopped partial is a committed answer too — its complete
             * fences dispatch honestly (a fence left open by the stop
             * never parses). */
            runSandboxBridge(sid, committed);
            /* the stopped partial is a committed answer too — its
             * complete canvas fences open the pane the same way. */
            maybeOpenCanvasFromReply(committed.content);
            toast(chatText("toast.stopped"), {
              description: chatText("toast.stoppedDescription"),
            });
          } else {
            toast(chatText("toast.stopped"));
          }
        } else {
          const msg = err instanceof Error ? err.message : "unknown failure";
          setError(msg);
          toast.error(chatText("toast.noRespond"), { description: msg });
        }
      } finally {
        abortRef.current = null;
        liveRef.current = null;
        setBusy(false);
        setLive(null);
        window.requestAnimationFrame(() => inputRef.current?.focus());
      }
    },
    [commitLane, gateway.base, maybeOpenCanvasFromReply, model, runSandboxBridge, thinking, tools],
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
      commitLane(stripped);
      void runCompletion(stripped, stitchSystemPrompt(tools));
      return;
    }
    void runCompletion(active, stitchSystemPrompt(tools));
  }, [active, busy, commitLane, runCompletion, stitchSystemPrompt, tools]);

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
      commitLane(session);
      await runCompletion(session, stitchSystemPrompt(tools));
    },
    [active, busy, commitLane, runCompletion, stitchSystemPrompt, tools],
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
      commitLane(branch);
      toast(chatText("toast.branch"), {
        description: chatText("toast.branchDescription"),
      });
      void runCompletion(branch, stitchSystemPrompt(tools));
    },
    [active, busy, commitLane, runCompletion, stitchSystemPrompt, tools],
  );

  /**
   * retry — the AuraChat pattern, without the duplicate-turn flaw: when the
   * failed history still ends with the user turn, it is replayed as-is.
   */
  const retry = useCallback(() => {
    if (busy) return;
    if (active && active.messages.length > 0 && active.messages[active.messages.length - 1].role === "user") {
      void runCompletion(active, stitchSystemPrompt(tools));
      return;
    }
    if (lastPrompt.current) void send(lastPrompt.current);
  }, [active, busy, runCompletion, send, stitchSystemPrompt, tools]);

  /** deleteTurn — the row delete of the action row (rung 120): the message
   * leaves the conversation (the session commits without it), the toast
   * answers once, and a session left empty falls back to the hero. */
  const deleteTurn = useCallback(
    (turnId: string) => {
      if (!active || busy) return;
      if (!active.messages.some((m) => m.id === turnId)) return;
      commitLane({
        ...active,
        messages: active.messages.filter((m) => m.id !== turnId),
        at: Date.now(),
      });
      toast(chatText("toast.messageDeleted"));
    },
    [active, busy, commitLane],
  );

  /** deleteActive — the topbar delete of the whole conversation: the
   * temporary lane discards the ephemeral record (nothing was ever
   * stored), the persisted lane removes it from the store. */
  const deleteActive = useCallback(() => {
    if (temporary) {
      setEphemeral(null);
      setError(null);
      toast(chatText("toast.conversationDeleted"));
      return;
    }
    if (!persistedActive) return;
    remove(persistedActive.id);
    setError(null);
    toast(chatText("toast.conversationDeleted"));
  }, [persistedActive, remove, temporary]);

  /** changeTags — the panel's tag seam (w8): the visitor labels ride the
   * session record through the same commit lane every conversation
   * mutation rides — an empty list clears the field (undefined is the
   * stored shape). the temporary lane writes nothing: nothing saves, so
   * no label ever lands (the honest lane). */
  const changeTags = useCallback(
    (tags: string[]) => {
      if (temporary || persistedActive === null) return;
      commitLane({ ...persistedActive, tags: tags.length > 0 ? tags : undefined });
    },
    [commitLane, persistedActive, temporary],
  );

  const deleteFromRail = useCallback(
    (id: string) => {
      remove(id);
      setError(null);
      toast(chatText("toast.conversationDeleted"));
    },
    [remove],
  );

  /** openLane — the rail opener under the temporary law: opening a stored
   * conversation always leaves the temporary lane — the past lives in the
   * store, the temporary conversation is the one that never persists. */
  const openLane = useCallback(
    (id: string) => {
      setTemporary(false);
      setEphemeral(null);
      open(id);
    },
    [open],
  );

  /** startLane — the new-chat key: a fresh chat always returns to the
   * persisted lane — the temporary mode is the hero's explicit entry (the
   * welcome ghost chip) and the composer's lead-cluster toggle owns the
   * standing in-conversation switch when its wave lands, so this wave
   * never strands a visitor in the lane without an exit. */
  const startLane = useCallback(() => {
    setTemporary(false);
    setEphemeral(null);
    startFresh();
  }, [startFresh]);

  /** startTemporary — the welcome entry chip arms the lane: the flag
   * flips on, the working record resets and the hero answers the honest
   * nothing-saves sub line; the first send builds the ephemeral session
   * the store never hears of. */
  const startTemporary = useCallback(() => {
    setTemporary(true);
    setEphemeral(null);
    startFresh();
  }, [startFresh]);

  /* the verdict bridge (the w3 turn contract): the per-session map of the
   * good/bad keys. The turn reports through the optional onVerdict prop —
   * null reads as the explicit toggle off — the record lives only in this
   * body (the verdict stays on the device), and the same key twice also
   * reads as off. The reset effect below clears the map when the
   * conversation switches — the verdict belongs to the turn it rated,
   * never to the rail slot. */
  const [verdicts, setVerdicts] = useState<Record<string, Verdict>>({});
  const verdictSessionRef = useRef<string>("");

  const recordVerdict = useCallback(
    (turnId: string, verdict: Verdict | null) => {
      const next: Record<string, Verdict> = {};
      for (const [id, mark] of Object.entries(verdicts)) if (id !== turnId) next[id] = mark;
      if (verdict !== null && verdicts[turnId] !== verdict) next[turnId] = verdict;
      setVerdicts(next);
    },
    [verdicts],
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
   * exit shows the still-mounted pane right away. the one-stage law
   * (w6-a): on the swapped viewport the canvas lane answers the stage
   * first in the render tree, so opening the engine lane hands the
   * stage over — the canvas closes honestly (its buffer survives in
   * the body), never silently unmounts. */
  const openSandbox = useCallback(() => {
    if (sandboxExitTimer.current !== null) {
      window.clearTimeout(sandboxExitTimer.current);
      sandboxExitTimer.current = null;
    }
    if (canvasSwap && canvasOpenRef.current) closeCanvas();
    if (sandboxMountedRef.current) {
      setSandboxOpen(true);
      return;
    }
    sandboxMountedRef.current = true;
    setSandboxMounted(true);
  }, [canvasSwap, closeCanvas]);

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

  /** registerSandboxRunner — the pane's bridge handoff (stable identity so
   * the pane registration effect never loops): the body holds the last
   * registration in a ref — null while the lane is closed or the engine
   * halted, the live executor while both stand. */
  const registerSandboxRunner = useCallback((runner: SandboxRunner | null) => {
    sandboxRunnerRef.current = runner;
  }, []);

  /** revealSandboxWork — the turn chip's action (w5-a): the lane mount
   * grammar opens the pane and the turn's task group centers once the
   * enter transition settles (the docking reflows the thread column, so
   * the scroll rides 240ms behind it). on the swapped viewport the pane
   * replaces the thread — the honest destination is the engine itself
   * and the scroll rests. */
  const revealSandboxWork = useCallback(
    (turnId: string) => {
      openSandbox();
      if (taskScrollTimer.current !== null) window.clearTimeout(taskScrollTimer.current);
      taskScrollTimer.current = window.setTimeout(() => {
        taskScrollTimer.current = null;
        taskCardRefs.current.get(turnId)?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 240);
    },
    [openSandbox],
  );

  /** openCanvas — the one opener seam behind every entry point: the
   * topbar ghost key (an empty buffer keeps the standing record), the
   * dom event lane and the fence auto-open (both reading this seam
   * through the ref above). no doc yet → the content becomes the first
   * version; a differing content on a standing record appends as the
   * newest version (the model's fences and the visitor's saves join
   * one stream); an identical content just opens. on the swapped
   * viewport the stage holds one pane — opening the canvas hands the
   * stage over, so the sandbox lane closes first (its engine dies
   * honestly, never silently unmounts). */
  const openCanvas = useCallback(
    (content: string, title?: string, lang?: string) => {
      canvasOpenRef.current = true;
      setCanvasDoc((prev) => {
        const stamp = Date.now();
        if (prev === null) {
          return {
            title: title ?? chatText("canvas.defaultTitle"),
            lang: lang ?? "",
            versions: [{ content, at: stamp }],
            index: 0,
          };
        }
        const titled = title !== undefined && title.length > 0 ? title : prev.title;
        const languaged = lang !== undefined && lang.length > 0 ? lang : prev.lang;
        /* the empty open keeps the standing buffer — the ghost key never
         * wipes the visitor's canvas. */
        if (content.length === 0) return { ...prev, title: titled, lang: languaged };
        const head = prev.versions[prev.index] ?? prev.versions[prev.versions.length - 1];
        if (head?.content === content) return { ...prev, title: titled, lang: languaged };
        const versions = [...prev.versions, { content, at: stamp }];
        const capped =
          versions.length > CANVAS_VERSION_CAP ? versions.slice(versions.length - CANVAS_VERSION_CAP) : versions;
        return { title: titled, lang: languaged, versions: capped, index: capped.length - 1 };
      });
      if (canvasSwap && sandboxOpen) closeSandbox();
      if (canvasExitTimer.current !== null) {
        window.clearTimeout(canvasExitTimer.current);
        canvasExitTimer.current = null;
      }
      if (canvasMountedRef.current) {
        setCanvasOpen(true);
        return;
      }
      canvasMountedRef.current = true;
      setCanvasMounted(true);
    },
    [canvasSwap, closeSandbox, sandboxOpen],
  );

  /** toggleCanvas — the topbar ghost key flips the lane. */
  const toggleCanvas = useCallback(() => {
    if (canvasOpen) closeCanvas();
    else openCanvas("");
  }, [canvasOpen, closeCanvas, openCanvas]);

  /** browseCanvas — the version navigation seam of the pane's back and
   * forward keys: the pointer moves, clamped honestly (an out-of-range
   * call answers nothing). */
  const browseCanvas = useCallback((index: number) => {
    setCanvasDoc((prev) => {
      if (prev === null) return prev;
      if (index < 0 || index >= prev.versions.length) return prev;
      return { ...prev, index };
    });
  }, []);

  /** commitCanvasVersion — the edit save seam of the pane: a changed
   * buffer lands as the newest version (the cap trims the oldest) and
   * the pointer moves to the head — editing a browsed-back version
   * branches forward, the history keeps every step. */
  const commitCanvasVersion = useCallback((content: string) => {
    setCanvasDoc((prev) => {
      if (prev === null) return prev;
      const versions = [...prev.versions, { content, at: Date.now() }];
      const capped =
        versions.length > CANVAS_VERSION_CAP ? versions.slice(versions.length - CANVAS_VERSION_CAP) : versions;
      return { ...prev, versions: capped, index: capped.length - 1 };
    });
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

  // mounting flips the canvas lane the same way (the enter transition)
  useEffect(() => {
    if (!canvasMounted) return undefined;
    const frame = window.requestAnimationFrame(() => setCanvasOpen(true));
    return () => window.cancelAnimationFrame(frame);
  }, [canvasMounted]);

  // the live-opener registration: the round's reply seam and the dom
  // listener below read the open seam through the ref (the law above)
  useEffect(() => {
    openCanvasRef.current = openCanvas;
  }, [openCanvas]);

  // the dom event lane of the canvas openers (w6-a): turn.tsx or
  // markdown.tsx may dispatch dt-canvas-open from a code block key in a
  // later wave — the listener is armed today, the detail validated
  // honestly (a payload without a string content answers nothing, never
  // a fabricated buffer).
  useEffect(() => {
    const onCanvasOpen = (event: Event) => {
      const detail: unknown = (event as CustomEvent<unknown>).detail;
      if (typeof detail !== "object" || detail === null) return;
      const call = detail as Partial<CanvasOpenDetail>;
      if (typeof call.content !== "string") return;
      const title = typeof call.title === "string" && call.title.trim().length > 0 ? call.title.trim() : undefined;
      const lang = typeof call.lang === "string" ? call.lang.trim() : undefined;
      openCanvasRef.current?.(call.content, title, lang);
    };
    document.addEventListener(CANVAS_OPEN_EVENT, onCanvasOpen);
    return () => document.removeEventListener(CANVAS_OPEN_EVENT, onCanvasOpen);
  }, []);

  // the exit timers never outlive the chat body
  useEffect(
    () => () => {
      if (panelExitTimer.current !== null) window.clearTimeout(panelExitTimer.current);
      if (sandboxExitTimer.current !== null) window.clearTimeout(sandboxExitTimer.current);
      if (canvasExitTimer.current !== null) window.clearTimeout(canvasExitTimer.current);
      if (taskScrollTimer.current !== null) window.clearTimeout(taskScrollTimer.current);
    },
    [],
  );

  // the model catalog probe (rung 124): a registered gateway answers its
  // /v1/models catalog once per registration — the probe never chats, an
  // outage keeps the meta-model row, and a disconnect empties the picker.
  useEffect(() => {
    let alive = true;
    if (!gateway.base) {
      setModels([]);
      return () => {
        alive = false;
      };
    }
    void gatewayModels(gateway.base).then((rows) => {
      if (alive) setModels(rows);
    });
    return () => {
      alive = false;
    };
  }, [gateway.base]);

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

  // the verdict map is per-session: the conversation switch resets it (the
  // map rides the body, the verdicts never outlive their thread)
  useEffect(() => {
    const sid = active?.id ?? "";
    if (verdictSessionRef.current === sid) return;
    verdictSessionRef.current = sid;
    setVerdicts({});
  }, [active?.id]);

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

  /* the branch lineage chip (w8): a session carrying an edit fork or a
   * checkpoint ladder wears the lineage mark in the topbar — the chip
   * opens the family flyout (the root and every sibling of the same
   * lineage key, newest first) and a row click rides the rail opener.
   * the flyout follows the composer-menu discipline: the outside
   * pointerdown closes it, Escape closes it first on the ladder below —
   * and the temporary lane never renders it (nothing saves, so no
   * lineage exists to switch). */
  const [lineageOpen, setLineageOpen] = useState(false);
  const lineageBtnRef = useRef<HTMLButtonElement | null>(null);
  const lineageMenuRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!lineageOpen) return;
    const onDocPointer = (e: PointerEvent) => {
      const t = e.target as Node | null;
      if (!lineageMenuRef.current?.contains(t) && !lineageBtnRef.current?.contains(t)) setLineageOpen(false);
    };
    document.addEventListener("pointerdown", onDocPointer);
    return () => document.removeEventListener("pointerdown", onDocPointer);
  }, [lineageOpen]);

  // Escape closes the lineage flyout first, then the canvas pane, then the
  // mobile drawer, then the session panel, then the sandbox lane (the
  // lineage menu is the smallest surface — a topbar flyout answers before
  // any lane, the canvas stays the newest surface, the w6-a ladder head,
  // and the pane's edit lane cancels before this chain ever sees its
  // escape)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (lineageOpen) setLineageOpen(false);
      else if (canvasOpen) closeCanvas();
      else if (isMobile && !railCollapsed) setRailCollapsed(true);
      else if (panelOpen) closePanel();
      else if (sandboxOpen) closeSandbox();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [canvasOpen, closeCanvas, closePanel, closeSandbox, isMobile, lineageOpen, panelOpen, railCollapsed, sandboxOpen]);

  /* the token meter (rung 125): the estimated budget of the NEXT round —
   * the system prompt plus the capped history window plus the draft in the
   * well. It is the house approximation (chars-per-token by script), it
   * always reads as an estimate, and the declared context window of the
   * selected model turns it into an honest percent. the w5-a seam: the
   * pending sandbox result context joins the window — the meter estimates
   * the payload the next round really carries. */
  const meterTokens = useMemo(() => {
    const window = (active?.messages ?? []).slice(-12).map((m) => ({ role: m.role, content: m.content }));
    if (draft.trim()) window.push({ role: "user", content: draft });
    const sid = active?.id ?? "";
    const pending = (sandboxTasks[sid] ?? []).slice(sandboxDeliveredRef.current[sid] ?? 0);
    if (pending.length > 0) window.push({ role: "user", content: sandboxContextBody(pending) });
    return estimateHistoryTokens(window);
  }, [active?.id, active?.messages, draft, sandboxTasks]);
  const meterContext = useMemo(() => {
    const row = models.find((m) => m.id === model);
    return row?.context;
  }, [model, models]);

  /** the hero recents slice (the w3 welcome seam): up to three spoken
   * conversations, newest first — the session list is already newest-first
   * (upsertSession), the empty shells never surface on the hero, and the
   * row shape is the sibling's RecentConversation record. */
  const recents = useMemo<RecentConversation[]>(
    () =>
      sessions
        .filter((session) => session.messages.length > 0)
        .slice(0, 3)
        .map((session) => ({ id: session.id, title: session.title, when: session.at })),
    [sessions],
  );

  /** the rail slice under the temporary law: while the lane is up the
   * working conversation never lists on the rail — the ephemeral record
   * never enters the store, and a stored conversation the flag overtook
   * hides for the lane's life (the belt-and-braces filter of the w4
   * seam). */
  const railSessions = useMemo(
    () => (temporary ? sessions.filter((s) => s.id !== active?.id) : sessions),
    [sessions, temporary, active?.id],
  );

  /** the solbot mark state (the w3 icon seam): the phase this body already
   * tracks — thinking while a round runs before the first answer delta,
   * streaming while the answer lands, idle otherwise. Threaded into the
   * sidebar so the rail brand answers the floor; the glyph union lives in
   * solboticon.tsx (speaking and halted join with their later waves). */
  const markState: SolBotState = !busy ? "idle" : live?.content ? "streaming" : "thinking";

  /** the per-turn grouping of the session's sandbox tasks (w5-a): the
   * cards render under the turn that spawned them, in dispatch order. */
  const tasksByTurn = useMemo(() => {
    const groups = new Map<string, SandboxTask[]>();
    for (const task of sandboxTasks[active?.id ?? ""] ?? []) {
      const lane = groups.get(task.turnId);
      if (lane === undefined) groups.set(task.turnId, [task]);
      else lane.push(task);
    }
    return groups;
  }, [sandboxTasks, active?.id]);

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
        sessions={railSessions}
        activeId={active?.id ?? ""}
        onOpen={openLane}
        onNew={startLane}
        onDelete={deleteFromRail}
        state={markState}
        runningId={busy && active ? active.id : undefined}
        errorId={error && active ? active.id : undefined}
      />
      {isMobile && !railCollapsed ? (
        <button
          type="button"
          className="dtc-scrim"
          aria-label={label("chat.body.closeSidebar")}
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
            aria-label={railCollapsed ? label("chat.body.openSidebar") : label("chat.body.closeSidebar")}
            title={railCollapsed ? label("chat.body.openSidebar") : label("chat.body.closeSidebar")}
          >
            <PanelLeft fontSize={18} aria-hidden="true" />
          </button>
          <div className="dtc-tb-title">
            <h1>{active ? active.title : (CHAT_LABEL?.name ?? "Chat")}</h1>
            <small>
              sol {model} {gateway.base ? chatText("topbar.gatewayOn") : chatText("topbar.gatewayOff")}
            </small>
          </div>
          {/* the temporary-lane badge (the w4 seam): the existing gateway
              pill class carries the quiet mono chip — no new css needed. */}
          {temporary ? (
            <p className="dtc-gw__pill" title={chatText("chat.temporaryTitle")}>
              {chatText("chat.temporaryPill")}
            </p>
          ) : null}
          <div className="dtc-tb-actions">
            {active ? (
              <button
                type="button"
                className="dtc-tb-btn"
                onClick={deleteActive}
                aria-label={label("chat.body.deleteConversation")}
                title={label("chat.body.deleteConversation")}
              >
                <TrashIcon fontSize={17} aria-hidden="true" />
              </button>
            ) : null}
            {/* the branch lineage chip (w8): an edit fork or a ladder
                carrier wears the mark beside the canvas key — the label
                is the honest ordinal of the branch. the temporary lane
                renders nothing: nothing saves, so no lineage exists. */}
            {!temporary && active !== null && (active.editOf || checkpointCount(active) > 0) ? (
              <button
                type="button"
                ref={lineageBtnRef}
                className="dtc-lineage"
                data-open={lineageOpen ? "true" : "false"}
                aria-expanded={lineageOpen}
                aria-haspopup="menu"
                onClick={() => setLineageOpen((v) => !v)}
                title={label("chat.body.branchLineage")}
              >
                <span className="dtc-lineage__mark" aria-hidden="true" />
                {label("chat.body.branch")} · {label("chat.body.edit")} {branchLabel(active)}
              </button>
            ) : null}
            {/* the family flyout (w8): every sibling of the lineage key,
                newest first — the root round and each edit fork; the
                active row carries aria-current and a row click rides the
                rail opener, the same open seam the rail rows use. */}
            {lineageOpen && !temporary && active !== null ? (
              <div
                ref={lineageMenuRef}
                className="dtc-lineage__menu"
                role="menu"
                aria-label={label("chat.body.branchLineage")}
              >
                {siblingBranches(sessions, active).map((sib) => (
                  <button
                    key={sib.id}
                    type="button"
                    role="menuitem"
                    className="dtc-lineage__row"
                    aria-current={sib.id === active.id ? "true" : undefined}
                    onClick={() => {
                      setLineageOpen(false);
                      openLane(sib.id);
                    }}
                  >
                    <span className="dtc-lineage__ordinal">
                      {branchLabel(sib) === 0
                        ? label("chat.body.root")
                        : `${label("chat.body.edit")} ${branchLabel(sib)}`}
                    </span>
                    <span className="dtc-lineage__title">{sib.title}</span>
                  </button>
                ))}
              </div>
            ) : null}
            {/* the canvas ghost key (w6-a): the quiet topbar opener beside
                the panel key — an empty open keeps the standing buffer,
                so the key is the lane toggle, never a reset. */}
            <button
              type="button"
              className="dtc-tb-btn"
              onClick={toggleCanvas}
              aria-pressed={canvasOpen}
              aria-label={canvasOpen ? label("chat.body.closeCanvasPane") : label("chat.body.openCanvasPane")}
              title={label("chat.body.canvasPane")}
            >
              <CanvasGlyph fontSize={18} aria-hidden="true" />
            </button>
            <button
              type="button"
              className="dtc-tb-btn"
              onClick={panelOpen ? closePanel : openPanel}
              aria-pressed={panelOpen}
              aria-label={panelOpen ? label("chat.body.closeSessionPanel") : label("chat.body.openSessionPanel")}
              title={label("chat.body.sessionPanel")}
            >
              <PanelRight fontSize={18} aria-hidden="true" />
            </button>
          </div>
        </header>

        <div className="dtc-stage atmos">
          {/* the canvas lane (w6-a): on the swapped viewport it answers
              the stage first — opening it hands the stage over from the
              sandbox lane (the one-stage law), so the canvas branch
              rides ahead of the sandbox branch; the buffer guard keeps
              the pane's doc prop honest (a mount never outruns the doc
              seam that created it). */}
          {canvasMounted && canvasDoc !== null && canvasSwap ? (
            <CanvasPane
              open={canvasOpen}
              onClose={closeCanvas}
              swap
              doc={canvasDoc}
              onBrowse={browseCanvas}
              onCommit={commitCanvasVersion}
            />
          ) : sandboxMounted && sandboxSwap ? (
            <SandboxPane
              open={sandboxOpen}
              onClose={closeSandbox}
              swap
              onRunningChange={reportSandboxRunning}
              onBridgeChange={registerSandboxRunner}
            />
          ) : empty ? (
            <div className="dtc-hero grain" key="hero">
              <div className="dtc-hero__wrap">
                <Welcome
                  onPick={(t) => {
                    /* the prefill law (the w4 rewire): the chip hands its
                     * prompt to the well — the draft rides the composer and
                     * the focus follows; nothing sends until the visitor
                     * presses the key. */
                    setDraft(t);
                    inputRef.current?.focus();
                  }}
                  gatewayRegistered={gateway.base !== ""}
                  recent={recents}
                  onOpenRecent={openLane}
                  temporary={temporary}
                  onTemporary={startTemporary}
                />
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
                  model={model}
                  models={models}
                  onModel={setModel}
                  thinking={thinking}
                  onThinking={setThinking}
                  tokenEstimate={meterTokens}
                  tokenContext={meterContext}
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
                    const laneTasks = tasksByTurn.get(m.id) ?? [];
                    return (
                      <Fragment key={m.id}>
                        {newDay ? <DaySeparator at={m.at} /> : null}
                        <Turn
                          turn={m}
                          fresh={m.id === freshId}
                          busy={busy}
                          onEdit={m.role === "user" ? (text) => editTurn(m.id, text) : undefined}
                          onVerdict={m.role === "assistant" ? (v: Verdict | null) => recordVerdict(m.id, v) : undefined}
                          onRegenerate={
                            m.role === "assistant" && m.id === active.messages[active.messages.length - 1]?.id && !busy
                              ? regenerate
                              : undefined
                          }
                          onDelete={!busy ? () => deleteTurn(m.id) : undefined}
                        />
                        {/* the sandbox work lane (w5-a): the task cards of
                            the commands this turn's round dispatched through
                            the engine, grouped under the turn that spawned
                            them — the chip opens the pane and centers the
                            first card of the group. */}
                        {laneTasks.length > 0 ? (
                          <section
                            className="dtc-tasks"
                            aria-label={label("chat.body.sandboxCommands").replace("{n}", String(laneTasks.length))}
                            ref={(el) => {
                              const anchors = taskCardRefs.current;
                              if (el === null) anchors.delete(m.id);
                              else anchors.set(m.id, el);
                            }}
                          >
                            <button
                              type="button"
                              className="dtc-tasks__chip"
                              onClick={() => revealSandboxWork(m.id)}
                              aria-label={label("chat.body.sandboxChipOpen").replace("{n}", String(laneTasks.length))}
                              title={label("chat.body.sandboxPaneTitle")}
                            >
                              <Cube fontSize={12} aria-hidden="true" />
                              <span>{label("chat.body.sandbox")}</span>
                              <i className="dtc-tasks__count">{laneTasks.length}</i>
                            </button>
                            {laneTasks.map((task) => (
                              <SandboxTaskCard key={task.id} task={task} />
                            ))}
                          </section>
                        ) : null}
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
                  model={model}
                  models={models}
                  onModel={setModel}
                  thinking={thinking}
                  onThinking={setThinking}
                  tokenEstimate={meterTokens}
                  tokenContext={meterContext}
                />
              </div>
            </div>
          )}
        </div>
      </main>

      {/* the canvas lane docks beside the thread (the chatgpt grammar):
          the wide viewport lane, the pane reusing the sandbox mount law —
          the buffer survives the close in this body. */}
      {canvasMounted && canvasDoc !== null && !canvasSwap ? (
        <CanvasPane
          open={canvasOpen}
          onClose={closeCanvas}
          doc={canvasDoc}
          onBrowse={browseCanvas}
          onCommit={commitCanvasVersion}
        />
      ) : null}

      {sandboxMounted && !sandboxSwap ? (
        <SandboxPane
          open={sandboxOpen}
          onClose={closeSandbox}
          onRunningChange={reportSandboxRunning}
          onBridgeChange={registerSandboxRunner}
        />
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
          session={active}
          memory={memoryFacts}
          onMemoryChange={changeMemory}
          instructions={instructions}
          onInstructionsChange={setInstructions}
          onTagsChange={changeTags}
        />
      ) : null}
    </div>
  );
}

/** SandboxTaskCard — one dispatched sandbox command of the w5-a bridge:
 * the command (mono), the engine verdict (ok or fail with its exit
 * code), the honest duration, and the collapsed body carrying the log
 * scroller (the max-h-64 cap the css owns) with the vfs diff rows of
 * every file the command wrote. The card renders only what the engine
 * answered — no field is synthesized, a failure keeps its exit code on
 * the face. */
function SandboxTaskCard({ task }: { task: SandboxTask }) {
  const [open, setOpen] = useState(false);
  const ok = task.exitCode === 0;
  return (
    <article className="dtc-task" data-verdict={ok ? "ok" : "fail"}>
      <button
        type="button"
        className="dtc-task__head"
        aria-expanded={open}
        aria-label={label("chat.body.sandboxCommandAria")
          .replace("{command}", task.command)
          .replace(
            "{verdict}",
            ok
              ? label("chat.body.verdictOk")
              : label("chat.body.verdictFailedExit").replace("{code}", String(task.exitCode)),
          )}
        title={label("chat.body.expandEngineOutput")}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="dtc-task__cmd">{task.command}</span>
        <span className="dtc-task__verdict">
          {ok ? label("chat.body.verdictOk") : label("chat.body.verdictFail").replace("{code}", String(task.exitCode))}
        </span>
        <span className="dtc-task__dur">{fmtTaskDuration(task.durationMs)}</span>
        <ChevronDown fontSize={12} aria-hidden="true" className="dtc-task__chev" />
      </button>
      {open ? (
        <div className="dtc-task__body">
          {task.output.length > 0 ? (
            <pre className="dtc-task__log">{task.output}</pre>
          ) : (
            <p className="dtc-task__quiet">{label("chat.body.noOutput")}</p>
          )}
          {task.changes.map((change) => {
            const rows = diffLines(change.before, change.after);
            if (rows.length === 0) return null;
            return (
              <div className="dtc-task__diff" key={change.path}>
                <p className="dtc-task__diffpath">
                  {change.path}
                  {change.after === null ? label("chat.body.deletedSuffix") : ""}
                </p>
                {rows.map((row) => (
                  <span
                    key={row.id}
                    className={
                      row.mark === "+" ? "dtc-task__dline dtc-task__dline--add" : "dtc-task__dline dtc-task__dline--del"
                    }
                  >
                    {row.mark} {row.text}
                  </span>
                ))}
              </div>
            );
          })}
        </div>
      ) : null}
    </article>
  );
}
