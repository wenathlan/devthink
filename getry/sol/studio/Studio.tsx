/**
 * Studio.tsx — the devthink studio os surface of the getry sol theme (the
 * interface 17 grammar): the full studio window app wired to the same lanes
 * the chat surface rides — the discovery catalog of the five routes, the
 * devthink meta-models with the smart-first pool, the seven-rung thinking
 * ladder, the streaming answers with the reasoning always before the
 * content, the conversations persisted through the db lane with the
 * localStorage mirror — wearing the interface 17 chrome: the wallpaper
 * stage, the header cluster with the seamless saddle tabs, the quadro
 * flutuante (the claymorphic projects panel), the ansi art hero with the
 * "what can i help build?" stage, the tactile composer with the model
 * segmented selector and the thinking caixinha, the square starter cards,
 * the terminal drawer with the live request log and the 4-edge saddle
 * docking overlay sidebar.
 *
 * the state law rides the chat surface grammar: conversations live in react
 * state seeded from the db lane (the mirror survives offline), the
 * streaming answer is a transient ghost that commits on done, every send
 * resends the full history (the gateway rotation contract) with the images
 * riding as openai multimodal parts, and an abort keeps the partial answer.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  type ChatPart,
  type ChatResult,
  type DiscoveryRoute,
  DISCOVERYVERSIONS,
  completechat,
  discovery,
  gatewayorigin,
  newsessionid,
  setgatewayorigin,
  streamchat,
} from "../../chatclient";
import {
  type ClientConversationRow,
  type ClientMessageRow,
  type ConversationUpsert,
  deleteconversationremote,
  listconversations,
  saveconversationremote,
} from "../../db";
import { GATEWAYVERSIONS, gatewayViewConfig, smartpoolof } from "../../gateway";
import { type LabelKey, label } from "../../labels";
import { DEFAULTTHINKINGLEVEL, formatbudget, listlevels } from "../../thinking";
import { toast } from "../toast/Toast.tsx";
import {
  ActiveSaddleTabSurface,
  DevThinkLogoMark,
  DevThinkWordmark,
  OmniSaddleBridge,
  StudioGlyphs as G,
  type SaddleDockEdge,
} from "./StudioBrand.tsx";
import { StudioAnsiCanvas } from "./StudioAnsi.tsx";

/* ===== block: constants and local types ================================ */

/** the localStorage mirror of the conversations (the same lane the chat
 * surface reads — one store, two surfaces). */
const MIRRORKEY = "getry.chat.conversations";

/** the localStorage key of the onboarding start prefs (shared with chat). */
const PREFSKEY = "getry.chat.prefs";

/** the localStorage keys of the studio projects (workspaces) and the
 * conversation→project map. */
const WORKSPACESKEY = "getry.studio.workspaces";
const WSMAPKEY = "getry.studio.wsmap";

/** the debounce window of the db saves in milliseconds. */
const SAVEDEBOUNCE = 1500;

/** the title budget of the auto-derived conversation title. */
const TITLEBUDGET = 42;

/** the default temperature the conversations ride. */
const DEFAULTTEMPERATURE = 0.7;

/** the maximum images one user turn carries (the composer law). */
const MAXIMAGES = 4;

/** one studio message — the chat view row plus the multimodal images. */
export type StudioMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  reasoning?: string;
  images?: string[];
  modelId?: string;
  route?: string;
  provider?: string;
  backendModel?: string;
  fallback?: string;
  error?: string;
  usage?: { promptTokens?: number; completionTokens?: number; totalTokens?: number };
  createdAt: string;
};

/** one conversation of the studio surface (the chat shape + the images). */
export type StudioConversation = {
  id: string;
  title: string;
  version: string;
  modelId: string;
  thinkingLevel: string;
  temperature: number;
  sessionId: string;
  messages: StudioMessage[];
  createdAt: string;
  updatedAt: string;
};

/** one project group of the quadro flutuante. */
type WorkspaceGroup = { id: string; name: string; expanded: boolean };

/** one line of the live terminal request log. */
type TerminalLine = {
  id: string;
  at: number;
  method: string;
  path: string;
  status: number | string;
  detail: string;
  durationMs?: number;
};

/** the transient streaming ghost — the answer that has not committed yet. */
type StreamGhost = { conversationId: string; content: string; reasoning: string };

/** the tactile starters of the hero stage. */
const STARTERS: Array<{ icon: "cube" | "bot" | "code" | "layers"; title: LabelKey; tag: LabelKey; prompt: LabelKey }> = [
  { icon: "cube", title: "studio.starter.1.title", tag: "studio.starter.1.tag", prompt: "studio.starter.1.prompt" },
  { icon: "bot", title: "studio.starter.2.title", tag: "studio.starter.2.tag", prompt: "studio.starter.2.prompt" },
  { icon: "code", title: "studio.starter.3.title", tag: "studio.starter.3.tag", prompt: "studio.starter.3.prompt" },
  { icon: "layers", title: "studio.starter.4.title", tag: "studio.starter.4.tag", prompt: "studio.starter.4.prompt" },
];

/* ===== block: pure helpers ============================================= */

/** draws one row id (message or conversation). */
function newid(prefix: string): string {
  const bytes = new Uint8Array(4);
  crypto.getRandomValues(bytes);
  const suffix = Array.from(bytes, (byte) => byte.toString(36).padStart(2, "0")).join("");
  return `${prefix}-${Date.now().toString(36)}-${suffix}`;
}

/** derives the conversation title from the first user message. */
function derivetitle(text: string): string {
  const flat = text.replace(/\s+/g, " ").trim();
  return flat.length > TITLEBUDGET ? `${flat.slice(0, TITLEBUDGET).trimEnd()}…` : flat;
}

/** reads the localStorage mirror — the offline lane. */
function readmirror(): StudioConversation[] {
  try {
    const raw = window.localStorage.getItem(MIRRORKEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((row): row is StudioConversation => row !== null && typeof row === "object" && Array.isArray((row as { messages?: unknown }).messages));
  } catch {
    return [];
  }
}

/** writes the localStorage mirror (best effort). */
function writemirror(conversations: StudioConversation[]): void {
  try {
    window.localStorage.setItem(MIRRORKEY, JSON.stringify(conversations));
  } catch {
    /* a full or absent storage lane never breaks the surface */
  }
}

/** reads the onboarding start prefs. */
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

/** reads the studio projects (workspaces) — the default group answers when
 * the storage lane is empty. */
function readworkspaces(): WorkspaceGroup[] {
  try {
    const raw = window.localStorage.getItem(WORKSPACESKEY);
    if (!raw) return [{ id: "ws-default", name: label("studio.panel.projects"), expanded: true }];
    const parsed: unknown = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) return parsed as WorkspaceGroup[];
  } catch {
    /* the default group answers */
  }
  return [{ id: "ws-default", name: label("studio.panel.projects"), expanded: true }];
}

/** reads the conversation→project map. */
function readwsmap(): Record<string, string> {
  try {
    const raw = window.localStorage.getItem(WSMAPKEY);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (parsed !== null && typeof parsed === "object") return parsed as Record<string, string>;
  } catch {
    /* an empty map answers */
  }
  return {};
}

/** maps one stored conversation row to the studio state row. */
function fromrow(row: ClientConversationRow & { messages: ClientMessageRow[] }): StudioConversation {
  return {
    id: row.id,
    title: row.title || label("studio.panel.untitled"),
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
      images: Array.isArray(message.images) ? (message.images as { dataUrl?: string }[]).map((img) => typeof img === "string" ? img : (img.dataUrl ?? "")).filter((url) => url !== "") : undefined,
      modelId: message.modelId ?? undefined,
      route: message.route ?? undefined,
      provider: message.provider ?? undefined,
      backendModel: undefined,
      fallback: message.fallback ?? undefined,
      error: message.error ?? undefined,
      usage: message.usage !== null && typeof message.usage === "object" ? (message.usage as StudioMessage["usage"]) : undefined,
      createdAt: message.createdAt ?? "",
    })),
    createdAt: row.createdAt ?? "",
    updatedAt: row.updatedAt ?? "",
  };
}

/** builds the upsert body of one conversation. */
function toupsert(conversation: StudioConversation): ConversationUpsert {
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
      images: message.images ?? undefined,
      modelId: message.modelId ?? null,
      route: message.route ?? null,
      provider: message.provider ?? null,
      fallback: message.fallback ?? null,
      error: message.error ?? null,
      usage: message.usage ?? null,
    })),
  };
}

/** formats one token count the meta row renders (1.2k above a thousand). */
function formattokens(count: number | undefined): string {
  if (count === undefined || !Number.isFinite(count)) return "";
  if (count < 1000) return String(count);
  return `${(count / 1000).toFixed(1).replace(/\.0$/, "")}k`;
}

/** builds the multimodal parts of one send — the text first, the images
 * after (the openai wire grammar the gateway routes natively). */
function turnparts(text: string, images: string[]): Array<ChatPart> | string {
  if (images.length === 0) return text;
  const parts: ChatPart[] = [];
  if (text !== "") parts.push({ type: "text", text });
  for (const url of images) parts.push({ type: "image_url", image_url: { url } });
  return parts;
}

/* ===== block: the rich message renderer ================================ */

/** one fenced block of the message body — code or prose. */
type MessageBlock = { kind: "code"; lang: string; code: string } | { kind: "text"; text: string };

/** splits one message body into fenced code blocks and prose runs. */
function splitblocks(content: string): MessageBlock[] {
  const blocks: MessageBlock[] = [];
  const fence = /```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g;
  let last = 0;
  let match: RegExpExecArray | null;
  while ((match = fence.exec(content)) !== null) {
    if (match.index > last) blocks.push({ kind: "text", text: content.slice(last, match.index) });
    blocks.push({ kind: "code", lang: match[1] || "tsx", code: match[2].replace(/\n$/, "") });
    last = match.index + match[0].length;
  }
  if (last < content.length) blocks.push({ kind: "text", text: content.slice(last) });
  return blocks;
}

/* ===== block: the studio surface ======================================= */

/**
 * the studio os screen.
 *
 * @returns the studio element.
 */
export default function Studio() {
  /* ---- the conversation state (the chat grammar) ---- */
  const [conversations, setConversations] = useState<StudioConversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [ghost, setGhost] = useState<StreamGhost | null>(null);
  const [routes, setRoutes] = useState<DiscoveryRoute[] | null>(null);
  const [probing, setProbing] = useState(false);
  const [originField, setOriginField] = useState(() => gatewayorigin());
  const [hydrated, setHydrated] = useState(false);
  const [armedDelete, setArmedDelete] = useState<string | null>(null);

  /* ---- the studio os state (the interface 17 grammar) ---- */
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [floatingSidebar, setFloatingSidebar] = useState(false);
  const [dockEdge, setDockEdge] = useState<SaddleDockEdge>("left");
  const [sidebarPos, setSidebarPos] = useState<{ x: number; y: number } | null>(null);
  const [draggingSidebar, setDraggingSidebar] = useState(false);
  const [sidebarSection, setSidebarSection] = useState<"projects" | "routes" | "settings">("projects");
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [terminalOpen, setTerminalOpen] = useState(false);
  const [terminalLog, setTerminalLog] = useState<TerminalLine[]>([]);
  const [workspaces, setWorkspaces] = useState<WorkspaceGroup[]>(() => readworkspaces());
  const [wsMap, setWsMap] = useState<Record<string, string>>(() => readwsmap());
  const [activeWorkspace, setActiveWorkspace] = useState("ws-default");
  const [modelPickerOpen, setModelPickerOpen] = useState(false);
  const [thinkingOpen, setThinkingOpen] = useState(false);
  const [modelQuery, setModelQuery] = useState("");
  const [expandedReasoning, setExpandedReasoning] = useState<Record<string, boolean>>({});
  const [studioToast, setStudioToast] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [pendingImages, setPendingImages] = useState<string[]>([]);

  const abortRef = useRef<AbortController | null>(null);
  const saveTimer = useRef<number | undefined>(undefined);
  const threadRef = useRef<HTMLDivElement | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const overlayRef = useRef<HTMLElement | null>(null);
  const dragRef = useRef<{ pointerId: number; startX: number; startY: number; originX: number; originY: number; moved: boolean } | null>(null);
  const suppressClickRef = useRef(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const hydratedRef = useRef(false);

  const active = useMemo(() => conversations.find((conversation) => conversation.id === activeId) ?? null, [conversations, activeId]);
  const streaming = ghost !== null;

  const showToast = useCallback((message: string) => setStudioToast(message), []);
  useEffect(() => {
    if (studioToast === null) return;
    const timer = window.setTimeout(() => setStudioToast(null), 2200);
    return () => window.clearTimeout(timer);
  }, [studioToast]);

  const logterminal = useCallback((method: string, path: string, status: number | string, detail: string, durationMs?: number) => {
    setTerminalLog((prev) => [{ id: newid("log"), at: Date.now(), method, path, status, detail, durationMs }, ...prev].slice(0, 120));
  }, []);

  /* ---- the mount: the load, the discovery ---- */

  const refreshroutes = useCallback(async () => {
    setProbing(true);
    const started = Date.now();
    try {
      const probed = await discovery(gatewayorigin());
      setRoutes(probed);
      const live = probed.filter((route) => route.status === "live").length;
      const models = probed.reduce((acc, route) => acc + route.models.length, 0);
      logterminal("GET", "/{v1..v5}/models", live > 0 ? 200 : 503, label("studio.terminal.probe").replace("{live}", String(live)).replace("{total}", String(probed.length)).replace("{models}", String(models)), Date.now() - started);
    } finally {
      setProbing(false);
    }
  }, [logterminal]);

  useEffect(() => {
    let live = true;
    void (async () => {
      const dbrows = await listconversations();
      if (!live) return;
      const localrows = readmirror();
      const byid = new Map(localrows.map((row) => [row.id, row]));
      for (const row of dbrows) byid.set(row.id, fromrow(row));
      const merged = [...byid.values()].sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
      hydratedRef.current = true;
      setConversations(merged);
      if (merged.length > 0) setActiveId(merged[0].id);
      setHydrated(true);
    })();
    void refreshroutes();
    try {
      if (window.innerWidth < 1024) setSidebarOpen(false);
    } catch {
      /* the width probe never breaks the boot */
    }
    return () => {
      live = false;
    };
  }, [refreshroutes]);

  /* ---- the persistence: the mirror now, the db lane debounced ---- */

  useEffect(() => {
    if (!hydrated) return;
    writemirror(conversations);
    window.clearTimeout(saveTimer.current);
    const conversation = conversations.find((row) => row.id === activeId);
    if (!conversation || conversation.messages.length === 0) return;
    saveTimer.current = window.setTimeout(() => {
      void saveconversationremote(toupsert(conversation));
    }, SAVEDEBOUNCE);
    return () => window.clearTimeout(saveTimer.current);
  }, [conversations, activeId, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(WORKSPACESKEY, JSON.stringify(workspaces));
      window.localStorage.setItem(WSMAPKEY, JSON.stringify(wsMap));
    } catch {
      /* the project lanes never break the surface */
    }
  }, [workspaces, wsMap, hydrated]);

  /* ---- the thread auto-scroll ---- */

  useEffect(() => {
    const thread = threadRef.current;
    if (thread) thread.scrollTop = thread.scrollHeight;
  }, [ghost?.content, ghost?.reasoning, active?.messages.length, activeId]);

  /* ---- the overlay sidebar drag (the 4-edge saddle law) ---- */

  function onOverlayPointerDown(event: React.PointerEvent<HTMLElement>) {
    if (event.button !== 0) return;
    const el = overlayRef.current;
    const rootEl = rootRef.current;
    if (!el || !rootEl) return;
    const rootRect = rootEl.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();
    const originX = elRect.left - rootRect.left + elRect.width / 2;
    const originY = elRect.top - rootRect.top + elRect.height / 2;
    dragRef.current = { pointerId: event.pointerId, startX: event.clientX - rootRect.left, startY: event.clientY - rootRect.top, originX, originY, moved: false };
  }

  useEffect(() => {
    const onMove = (event: PointerEvent) => {
      const drag = dragRef.current;
      const rootEl = rootRef.current;
      if (!drag || drag.pointerId !== event.pointerId || !rootEl) return;
      const rootRect = rootEl.getBoundingClientRect();
      const mouseX = event.clientX - rootRect.left;
      const mouseY = event.clientY - rootRect.top;
      const dist = Math.hypot(mouseX - drag.startX, mouseY - drag.startY);
      if (!drag.moved && dist > 5) {
        drag.moved = true;
        suppressClickRef.current = true;
        setDraggingSidebar(true);
      }
      if (!drag.moved) return;
      const viewW = rootEl.offsetWidth;
      const viewH = rootEl.offsetHeight;
      const blend = Math.min(1, dist / 36);
      const grabX = (drag.originX - drag.startX) * (1 - blend);
      const grabY = (drag.originY - drag.startY) * (1 - blend);
      const rawX = Math.max(16, Math.min(viewW - 16, mouseX + grabX));
      const rawY = Math.max(16, Math.min(viewH - 16, mouseY + grabY));
      const distLeft = mouseX;
      const distRight = viewW - mouseX;
      const distTop = mouseY;
      const distBottom = viewH - mouseY;
      const minDist = Math.min(distLeft, distRight, distTop, distBottom);
      if (minDist <= 26) {
        setFloatingSidebar(false);
        if (minDist === distLeft) {
          setDockEdge("left");
          setSidebarPos({ x: 0, y: Math.max(78, Math.min(viewH - 78, mouseY)) });
        } else if (minDist === distRight) {
          setDockEdge("right");
          setSidebarPos({ x: viewW, y: Math.max(78, Math.min(viewH - 78, mouseY)) });
        } else if (minDist === distTop) {
          setDockEdge("top");
          setSidebarPos({ x: Math.max(82, Math.min(viewW - 82, mouseX)), y: 0 });
        } else {
          setDockEdge("bottom");
          setSidebarPos({ x: Math.max(82, Math.min(viewW - 82, mouseX)), y: viewH });
        }
      } else {
        setFloatingSidebar(true);
        setSidebarPos({ x: rawX, y: rawY });
      }
    };
    const onUp = (event: PointerEvent) => {
      const drag = dragRef.current;
      if (!drag || drag.pointerId !== event.pointerId) return;
      if (drag.moved) {
        window.setTimeout(() => {
          suppressClickRef.current = false;
        }, 60);
      } else {
        suppressClickRef.current = false;
      }
      dragRef.current = null;
      setDraggingSidebar(false);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, []);

  /* ---- the catalog: live discovery with the family seed fallback ---- */

  const modeloptions = useCallback(
    (version: string): Array<{ id: string; context?: number; output?: number; meta: boolean; pool: boolean }> => {
      const discovered = routes?.find((route) => route.version === version && route.status === "live");
      const pool = new Set(discovered?.meta?.rotationPool ?? smartpoolof(gatewayViewConfig, version));
      if (discovered && discovered.models.length > 0) {
        return discovered.models.map((row) => ({ id: row.id, context: row.context, output: row.output, meta: row.id === "devthink", pool: pool.has(row.id) }));
      }
      const config = gatewayViewConfig.versions[version];
      if (!config) return [];
      return config.models.map((model) => ({ id: model.id, context: model.context, output: model.maxoutput, meta: model.id === config.metamodel?.id, pool: pool.has(model.id) }));
    },
    [routes],
  );

  const routestatus = (version: string): "live" | "paused" | "error" => {
    const probed = routes?.find((route) => route.version === version);
    if (probed) return probed.status;
    return gatewayViewConfig.versions[version]?.paused === true ? "paused" : "live";
  };

  /** the two tactile quick models of the segmented selector: the devthink
   * meta-models of the two best live routes. */
  const quickmetas = useMemo(() => {
    const metas: Array<{ version: string; pool: string[] }> = [];
    for (const route of routes ?? []) {
      if (route.status !== "live" || route.meta === null) continue;
      metas.push({ version: route.version, pool: route.meta.rotationPool });
    }
    if (metas.length === 0) {
      for (const version of DISCOVERYVERSIONS) {
        if (routestatus(version) === "paused") continue;
        if (metas.length >= 2) break;
        metas.push({ version, pool: smartpoolof(gatewayViewConfig, version) });
      }
    }
    return metas.slice(0, 2);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routes]);

  /* ---- the conversation actions ---- */

  function newconversation(): StudioConversation {
    const now = new Date().toISOString();
    const prefs = readprefs();
    return {
      id: newid("conv"),
      title: label("studio.panel.untitled"),
      version: typeof prefs?.version === "string" && prefs.version !== "" ? prefs.version : "v1",
      modelId: typeof prefs?.modelId === "string" && prefs.modelId !== "" ? prefs.modelId : "devthink",
      thinkingLevel: typeof prefs?.thinkingLevel === "string" && prefs.thinkingLevel !== "" ? prefs.thinkingLevel : DEFAULTTHINKINGLEVEL,
      temperature: DEFAULTTEMPERATURE,
      sessionId: newsessionid(),
      messages: [],
      createdAt: now,
      updatedAt: now,
    };
  }

  function startnew(workspaceId?: string) {
    abortRef.current?.abort();
    const conversation = newconversation();
    setConversations((prev) => [conversation, ...prev]);
    setActiveId(conversation.id);
    setDraft("");
    setPendingImages([]);
    if (workspaceId) setWsMap((prev) => ({ ...prev, [conversation.id]: workspaceId }));
  }

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
    toast(label("studio.toast.deleted"), "info");
  }

  function pickversion(version: string) {
    if (routestatus(version) === "paused") return;
    const options = modeloptions(version);
    setConversations((prev) =>
      prev.map((row) =>
        row.id === activeId
          ? { ...row, version, modelId: options.some((option) => option.id === row.modelId) ? row.modelId : "devthink", updatedAt: new Date().toISOString() }
          : row,
      ),
    );
  }

  function pickmodel(id: string) {
    setConversations((prev) => prev.map((row) => (row.id === activeId ? { ...row, modelId: id, updatedAt: new Date().toISOString() } : row)));
    setModelPickerOpen(false);
  }

  function pickthinking(level: string) {
    setConversations((prev) => prev.map((row) => (row.id === activeId ? { ...row, thinkingLevel: level, updatedAt: new Date().toISOString() } : row)));
    setThinkingOpen(false);
  }

  function commitorigin() {
    const accepted = setgatewayorigin(originField);
    setOriginField(accepted);
    void refreshroutes();
  }

  function createworkspace() {
    const id = `ws-${Date.now()}`;
    const name = `Project 0${workspaces.length + 1}`;
    setWorkspaces((prev) => [{ id, name, expanded: true }, ...prev]);
    setActiveWorkspace(id);
    setSidebarSection("projects");
    setSidebarOpen(true);
    showToast(`created ${name}`);
  }

  /* ---- the image attachments ---- */

  function attachfiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    const images = Array.from(files).filter((file) => file.type.startsWith("image/")).slice(0, MAXIMAGES);
    if (images.length === 0) return;
    for (const file of images) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          setPendingImages((prev) => (prev.length >= MAXIMAGES ? prev : [...prev, reader.result as string]));
        }
      };
      reader.readAsDataURL(file);
    }
  }

  /* ---- the send, stop and retry lanes ---- */

  const appendmessage = useCallback((conversationId: string, message: StudioMessage) => {
    setConversations((prev) => prev.map((row) => (row.id === conversationId ? { ...row, messages: [...row.messages, message], updatedAt: message.createdAt } : row)));
  }, []);

  function assistantof(conversation: StudioConversation, result: ChatResult, createdAt: string): StudioMessage {
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

  async function send(text: string, images: string[] = []) {
    if (ghost !== null) return;
    let conversation = active;
    if (!conversation) {
      conversation = newconversation();
      setConversations((prev) => [conversation as StudioConversation, ...prev]);
      setActiveId(conversation.id);
    }
    const now = new Date().toISOString();
    const user: StudioMessage = { id: newid("msg"), role: "user", content: text, images: images.length > 0 ? images : undefined, createdAt: now };
    const history = [...conversation.messages, user];
    const titled = conversation.messages.length === 0 ? derivetitle(text) : conversation.title;
    setConversations((prev) => prev.map((row) => (row.id === conversation?.id ? { ...row, title: titled, messages: history, updatedAt: now } : row)));
    const lane: StudioConversation = { ...conversation, messages: history };
    const controller = new AbortController();
    abortRef.current = controller;
    setGhost({ conversationId: lane.id, content: "", reasoning: "" });
    const started = Date.now();
    try {
      const result = await streamchat({
        origin: gatewayorigin(),
        version: lane.version,
        model: lane.modelId,
        messages: history.map((message) => ({ role: message.role, content: turnparts(message.content, message.images ?? []) })),
        thinkingLevel: lane.thinkingLevel,
        temperature: lane.temperature,
        sessionId: lane.sessionId,
        signal: controller.signal,
        onDelta: (chunk) => setGhost((prev) => (prev && prev.conversationId === lane.id ? { ...prev, content: prev.content + chunk } : prev)),
        onReasoning: (chunk) => setGhost((prev) => (prev && prev.conversationId === lane.id ? { ...prev, reasoning: prev.reasoning + chunk } : prev)),
      });
      logterminal("POST", `/${lane.version}/chat/completions`, result.content === "" && result.reasoning === "" ? 502 : 200, `${lane.modelId}${result.backendModel ? ` → ${result.backendModel}` : ""}`, Date.now() - started);
      const empty = result.content === "" && result.reasoning === "";
      if (!(result.aborted === true && empty)) {
        appendmessage(lane.id, assistantof(lane, result, new Date().toISOString()));
      }
      if (result.aborted === true && !empty) {
        toast(label("studio.thread.stopped"), "info");
      } else if (result.aborted !== true && empty) {
        toast(label("studio.thread.empty"), "error");
      }
    } catch (error) {
      const reason = error instanceof Error ? error.message : "the route never answered";
      logterminal("POST", `/${lane.version}/chat/completions`, "ERR", reason, Date.now() - started);
      appendmessage(lane.id, { id: newid("msg"), role: "assistant", content: "", error: reason, modelId: lane.modelId, route: lane.version, createdAt: new Date().toISOString() });
    } finally {
      abortRef.current = null;
      setGhost(null);
    }
  }

  function senddraft() {
    const text = draft.trim();
    if (text === "" && pendingImages.length === 0) return;
    const images = pendingImages;
    setDraft("");
    setPendingImages([]);
    void send(text === "" ? "descreva e analise esta imagem em detalhes" : text, images);
  }

  function stop() {
    abortRef.current?.abort();
  }

  async function retry() {
    if (ghost !== null || !active) return;
    const messages = [...active.messages];
    while (messages.length > 0 && messages[messages.length - 1].role === "assistant") messages.pop();
    if (messages.length === 0) return;
    const lane: StudioConversation = { ...active, messages };
    setConversations((prev) => prev.map((row) => (row.id === lane.id ? { ...row, messages, updatedAt: new Date().toISOString() } : row)));
    toast(label("chat.toast.retrying"), "info");
    try {
      const result = await completechat({
        origin: gatewayorigin(),
        version: lane.version,
        model: lane.modelId,
        messages: messages.map((message) => ({ role: message.role, content: turnparts(message.content, message.images ?? []) })),
        thinkingLevel: lane.thinkingLevel,
        temperature: lane.temperature,
        sessionId: lane.sessionId,
      });
      appendmessage(lane.id, assistantof(lane, result, new Date().toISOString()));
    } catch (error) {
      const reason = error instanceof Error ? error.message : "the route never answered";
      appendmessage(lane.id, { id: newid("msg"), role: "assistant", content: "", error: reason, modelId: lane.modelId, route: lane.version, createdAt: new Date().toISOString() });
    }
  }

  /* ---- the derived render rows ---- */

  const thinkingladder = listlevels();

  const conversationsOfWorkspace = (wsId: string) => conversations.filter((row) => (wsMap[row.id] ?? "ws-default") === wsId);

  const filteredConversations = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (query === "") return null;
    return conversations.filter((row) => row.title.toLowerCase().includes(query) || row.messages.some((message) => message.content.toLowerCase().includes(query)));
  }, [conversations, searchQuery]);

  const activeThread = active ? [...active.messages] : [];
  if (ghost !== null && active !== null && ghost.conversationId === active.id) {
    activeThread.push({ id: "ghost", role: "assistant", content: ghost.content, reasoning: ghost.reasoning !== "" ? ghost.reasoning : undefined, modelId: active.modelId, route: active.version, createdAt: "" });
  }

  const showstarters = activeThread.length === 0;

  /* the overlay sidebar style — the dock edge or the floating pill */
  const overlayStyle: React.CSSProperties = {};
  if (floatingSidebar) {
    overlayStyle.left = sidebarPos ? `${sidebarPos.x}px` : "28px";
    overlayStyle.top = sidebarPos ? `${sidebarPos.y}px` : "56%";
    overlayStyle.transform = "translate(-50%, -50%)";
  } else if (dockEdge === "left") {
    overlayStyle.left = "0px";
    overlayStyle.top = sidebarPos ? `${sidebarPos.y}px` : "56%";
    overlayStyle.transform = "translateY(-50%)";
  } else if (dockEdge === "right") {
    overlayStyle.right = "0px";
    overlayStyle.top = sidebarPos ? `${sidebarPos.y}px` : "56%";
    overlayStyle.transform = "translateY(-50%)";
  } else if (dockEdge === "top") {
    overlayStyle.top = "0px";
    overlayStyle.left = sidebarPos ? `${sidebarPos.x}px` : "50%";
    overlayStyle.transform = "translateX(-50%)";
  } else {
    overlayStyle.bottom = "0px";
    overlayStyle.left = sidebarPos ? `${sidebarPos.x}px` : "50%";
    overlayStyle.transform = "translateX(-50%)";
  }

  const isHorizontalPill = floatingSidebar ? Boolean(sidebarPos && (sidebarPos.y < 52 || sidebarPos.y > (rootRef.current?.offsetHeight ?? 800) - 52)) : dockEdge === "top" || dockEdge === "bottom";

  /** the nav buttons of the overlay rail (workspace · routes · terminal ·
   * theme · settings) with the saddle tooltips. */
  const navbuttons = (
    <>
      {(
        [
          { key: "projects", glyph: <G.home fontSize={14} />, text: label("studio.nav.workspace"), on: sidebarSection === "projects" && sidebarOpen },
          { key: "routes", glyph: <G.checklist fontSize={14} />, text: label("studio.nav.routes"), on: sidebarSection === "routes" && sidebarOpen },
          { key: "terminal", glyph: <G.terminal fontSize={14} />, text: label("studio.nav.terminal"), on: terminalOpen },
        ] as const
      ).map((button) => (
        <button
          key={button.key}
          type="button"
          className={`studio-overlay__btn${button.on ? " is-on" : ""}`}
          onClick={() => {
            if (button.key === "terminal") {
              setTerminalOpen((open) => !open);
              return;
            }
            setSidebarSection(button.key);
            setSidebarOpen(true);
          }}
          aria-label={button.text}
        >
          {button.glyph}
          <span className="studio-overlay__tip">{button.text}</span>
        </button>
      ))}
      <button
        type="button"
        className="studio-overlay__btn"
        onClick={() => {
          const next = (document.documentElement.getAttribute("data-theme") ?? "light") === "dark" ? "light" : "dark";
          document.documentElement.setAttribute("data-theme", next);
          try {
            window.localStorage.setItem("getry.theme", next);
          } catch {
            /* the theme lane never breaks the rail */
          }
        }}
        aria-label={label("studio.nav.theme")}
      >
        <G.moon fontSize={14} />
        <span className="studio-overlay__tip">{label("studio.nav.theme")}</span>
      </button>
      <button
        type="button"
        className={`studio-overlay__btn${sidebarSection === "settings" && sidebarOpen ? " is-on" : ""}`}
        onClick={() => {
          setSidebarSection((section) => (section === "settings" ? "projects" : "settings"));
          setSidebarOpen(true);
        }}
        aria-label={label("studio.nav.settings")}
      >
        <G.settings fontSize={14} />
        <span className="studio-overlay__tip">{label("studio.nav.settings")}</span>
      </button>
    </>
  );

  /* ===== the render ===== */

  return (
    <div ref={rootRef} className="studio" aria-label={label("studio.aria")}>
      {/* ===== 0. the overlay saddle sidebar ===== */}
      <aside
        ref={overlayRef}
        className={`studio-overlay${floatingSidebar ? " is-floating" : ""}${draggingSidebar ? " is-dragging" : ""}`}
        style={overlayStyle}
        aria-label={label("studio.nav.workspace")}
        onPointerDown={onOverlayPointerDown}
        onClickCapture={(event) => {
          if (suppressClickRef.current) {
            event.stopPropagation();
            event.preventDefault();
          }
        }}
      >
        {floatingSidebar ? (
          <div className={`studio-overlay__pill${isHorizontalPill ? " studio-overlay__pill--horizontal" : ""}`}>{navbuttons}</div>
        ) : (
          <OmniSaddleBridge edge={dockEdge} fillColor="var(--studio-stage)">
            <div className={`omnibridge__children omnibridge__children--${dockEdge === "top" || dockEdge === "bottom" ? "horizontal" : "vertical"}`}>{navbuttons}</div>
          </OmniSaddleBridge>
        )}
      </aside>

      {/* ===== 1. the header: the brand cluster + the saddle tabs ===== */}
      <header className="studio__header">
        <div className="studio-headcluster">
          <span className="studio-brand">
            <DevThinkLogoMark className="h-[16.5px] w-[16.5px]" />
            <DevThinkWordmark className="h-[16.5px]" />
          </span>
          <button type="button" className={`studio-iconbtn${searchOpen ? " is-on" : ""}`} onClick={() => setSearchOpen((open) => !open)} aria-label={label("studio.header.search")} title={label("studio.header.search")}>
            <G.search fontSize={14} />
          </button>
          <button type="button" className={`studio-iconbtn studio-iconbtn--frame${sidebarOpen ? " is-on" : ""}`} onClick={() => setSidebarOpen((open) => !open)} aria-label={label("studio.header.panel")} title={label("studio.header.panel")}>
            <G.layers fontSize={14} />
          </button>
          <button type="button" className="studio-iconbtn studio-iconbtn--frame" onClick={() => startnew(activeWorkspace)} aria-label={label("studio.header.new")} title={label("studio.header.new")}>
            <G.plus fontSize={14} />
          </button>
        </div>

        <div className="studio__tabs">
          {conversations.slice(0, 8).map((conversation) => {
            const isActive = conversation.id === active?.id;
            return (
              <button
                key={conversation.id}
                type="button"
                className={`studio-tab${isActive ? " is-active" : ""}`}
                onClick={() => setActiveId(conversation.id)}
                title={conversation.title}
              >
                {isActive && <ActiveSaddleTabSurface fillColor="var(--studio-stage)" />}
                <span className="studio-tab__label">{conversation.title}</span>
                <span
                  role="button"
                  tabIndex={0}
                  className="studio-tab__close"
                  onClick={(event) => {
                    event.stopPropagation();
                    removeconversation(conversation.id);
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.stopPropagation();
                      removeconversation(conversation.id);
                    }
                  }}
                  aria-label={label("studio.tab.close")}
                >
                  <G.close fontSize={11} />
                </span>
              </button>
            );
          })}
        </div>
      </header>

      {/* ===== 2. the workspace row: the quadro + the stage ===== */}
      <div className="studio__row">
        {sidebarOpen && (
          <aside className="studio-quad" aria-label={label("studio.panel.projects")}>
            <div className="studio-quad__shader hero-gaussian-shader" aria-hidden="true" />
            <div className="studio-quad__inner">
              {searchOpen && (
                <div className="studio-search">
                  <G.search fontSize={13} />
                  <input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder={label("studio.header.search")} />
                  {searchQuery !== "" && (
                    <button type="button" className="studio-minibtn" onClick={() => setSearchQuery("")} aria-label={label("studio.tab.close")}>
                      <G.close fontSize={10} />
                    </button>
                  )}
                </div>
              )}

              {sidebarSection === "projects" && (
                <>
                  <button type="button" className="studio-newchat" onClick={() => startnew(activeWorkspace)}>
                    <span className="studio-pop__itemname">
                      <G.plus fontSize={13} />
                      {label("studio.panel.new")}
                    </span>
                    <span style={{ opacity: 0.4, fontSize: 9 }}>{conversations.length}</span>
                  </button>
                  <div className="studio-quad__list">
                    {filteredConversations !== null ? (
                      filteredConversations.length === 0 ? (
                        <p className="studio-quad__empty">{label("studio.panel.empty")}</p>
                      ) : (
                        filteredConversations.map((conversation) => (
                          <button key={conversation.id} type="button" className={`studio-conv${conversation.id === active?.id ? " is-active" : ""}`} onClick={() => setActiveId(conversation.id)}>
                            <span className="studio-conv__label">{conversation.title}</span>
                            <span className="studio-conv__chip">{conversation.version}</span>
                          </button>
                        ))
                      )
                    ) : (
                      workspaces.map((workspace) => {
                        const rows = conversationsOfWorkspace(workspace.id);
                        return (
                          <div key={workspace.id}>
                            <div className="studio-wsrow">
                              <button
                                type="button"
                                className="studio-wsrow__name"
                                onClick={() => setWorkspaces((prev) => prev.map((row) => (row.id === workspace.id ? { ...row, expanded: !row.expanded } : row)))}
                              >
                                <G.chevronDown fontSize={10} className={`studio-wsrow__chev${workspace.expanded ? "" : " is-closed"}`} />
                                {workspace.name}
                              </button>
                              <span className="studio-wsrow__actions">
                                <button type="button" className="studio-minibtn" onClick={() => startnew(workspace.id)} aria-label={label("studio.panel.new")}>
                                  <G.plus fontSize={11} />
                                </button>
                                {workspace.id !== "ws-default" && (
                                  <button
                                    type="button"
                                    className="studio-minibtn"
                                    onClick={() => {
                                      setWorkspaces((prev) => prev.filter((row) => row.id !== workspace.id));
                                      showToast(`${workspace.name} removido`);
                                    }}
                                    aria-label={label("studio.panel.delete")}
                                  >
                                    <G.trash fontSize={11} />
                                  </button>
                                )}
                              </span>
                            </div>
                            {workspace.expanded &&
                              (rows.length === 0 ? (
                                <p className="studio-quad__empty" style={{ paddingLeft: 16 }}>
                                  {label("studio.panel.empty")}
                                </p>
                              ) : (
                                rows.map((conversation) => (
                                  <button
                                    key={conversation.id}
                                    type="button"
                                    className={`studio-conv${conversation.id === active?.id ? " is-active" : ""}`}
                                    onClick={() => {
                                      setActiveId(conversation.id);
                                      setActiveWorkspace(workspace.id);
                                    }}
                                    title={`${conversation.title} · /${conversation.version}`}
                                  >
                                    <span className="studio-conv__label">{conversation.title}</span>
                                    <span className="studio-conv__chip">{conversation.version}</span>
                                  </button>
                                ))
                              ))}
                          </div>
                        );
                      })
                    )}
                  </div>
                  <button type="button" className="studio-newproject" onClick={createworkspace}>
                    <G.plus fontSize={13} />
                    {label("studio.panel.newproject")}
                  </button>
                </>
              )}

              {sidebarSection === "routes" && (
                <div className="studio-quad__list">
                  {DISCOVERYVERSIONS.map((version) => {
                    const status = routestatus(version);
                    const probed = routes?.find((route) => route.version === version);
                    return (
                      <button
                        key={version}
                        type="button"
                        className={`studio-route${version === active?.version ? " is-active" : ""}`}
                        onClick={() => pickversion(version)}
                        title={probed ? `${probed.models.length} models · ${probed.latencyMs}ms` : label("studio.panel.probe")}
                      >
                        <span className="studio-route__row">
                          <span className="studio-route__name">
                            <i className="studiodot" data-status={status} aria-hidden="true" />
                            /{version}
                          </span>
                          <span className="studio-route__meta">
                            {probed ? `${probed.models.length} · ${probed.latencyMs}ms` : "…"}
                          </span>
                        </span>
                        <span className="studio-route__provider">{GATEWAYVERSIONS.find((row) => row.v === version)?.provider ?? ""}</span>
                      </button>
                    );
                  })}
                  {probing && <p className="studio-quad__empty">probing…</p>}
                  <button type="button" className="studio-setting" onClick={() => void refreshroutes()}>
                    <G.sparkle fontSize={13} />
                    {label("studio.panel.probe")}
                  </button>
                </div>
              )}

              {sidebarSection === "settings" && (
                <div className="studio-quad__list">
                  <label className="studio-route__provider" style={{ padding: "0 4px", textTransform: "uppercase", fontWeight: 800, letterSpacing: "0.08em" }}>
                    {label("studio.panel.origin")}
                  </label>
                  <input className="studio-originfield" value={originField} onChange={(event) => setOriginField(event.target.value)} onBlur={commitorigin} placeholder="(same origin)" />
                  <p className="studio-originhint">{label("studio.panel.originHint")}</p>
                  <button type="button" className="studio-setting" onClick={() => void refreshroutes()}>
                    <G.sparkle fontSize={13} />
                    {label("studio.panel.probe")}
                  </button>
                  <a className="studio-setting" href="#/thinking">
                    <G.pulse fontSize={13} />
                    {label("shell.rail.thinking")}
                  </a>
                  <a className="studio-setting" href="#/sessions">
                    <G.key fontSize={13} />
                    {label("shell.rail.sessions")}
                  </a>
                  <a className="studio-setting" href="#/versions">
                    <G.data fontSize={13} />
                    {label("shell.rail.versions")}
                  </a>
                </div>
              )}
            </div>
          </aside>
        )}

        {/* ===== 3. the stage: the ansi hero + the chat ===== */}
        <main className="studio-stage">
          <div className="studio-stage__shader hero-gaussian-shader" aria-hidden="true" />
          <StudioAnsiCanvas engineMode={streaming} pulseTrigger={0} />
          <div className="studio-stage__inner">
            {terminalOpen && (
              <div className="studio-terminal">
                <div className="studio-terminal__bar">
                  <span className="studio-pop__itemname">
                    <span className="studio-terminal__tag">{label("studio.terminal.title")}</span>
                    <span className="studio-terminal__cmd">$ devthink studio --gateway=&quot;{gatewayorigin() || "same-origin"}&quot;</span>
                  </span>
                  <button type="button" className="studio-minibtn" onClick={() => setTerminalOpen(false)} aria-label={label("studio.tab.close")}>
                    <G.close fontSize={12} />
                  </button>
                </div>
                <div className="studio-terminal__log">
                  {terminalLog.length === 0 ? (
                    <p style={{ opacity: 0.5 }}>{label("studio.terminal.waiting")}</p>
                  ) : (
                    terminalLog.map((line) => (
                      <p key={line.id} className="studio-terminal__line">
                        <span className="studio-terminal__time">{new Date(line.at).toLocaleTimeString()}</span>
                        <span className="studio-terminal__method">{line.method}</span>
                        <span className="studio-terminal__path">{line.path}</span>
                        <span className={`studio-terminal__status${typeof line.status === "number" && line.status >= 400 ? " is-bad" : ""}`}>{line.status}</span>
                        <span className="studio-terminal__detail">{line.detail}</span>
                        {line.durationMs !== undefined && <span className="studio-terminal__dur">{line.durationMs}ms</span>}
                      </p>
                    ))
                  )}
                </div>
              </div>
            )}

            {showstarters ? (
              /* the hero stage */
              <div className="studio-hero">
                <div className="studio-hero__wrap">
                  <div className="studio-hero__glow" aria-hidden="true" />
                  <h1 className="studio-hero__title">{label("studio.hero.title")}</h1>

                  <div className="studio-composer">
                    {modelPickerOpen && (
                      <div className="studio-pop" role="listbox">
                        <div className="studio-pop__search">
                          <G.search fontSize={12} />
                          <input value={modelQuery} onChange={(event) => setModelQuery(event.target.value)} placeholder="model / route / provider" />
                        </div>
                        {DISCOVERYVERSIONS.map((version) => {
                          const options = modeloptions(version);
                          if (options.length === 0) return null;
                          const query = modelQuery.toLowerCase();
                          const matches = options.filter((option) => query === "" || option.id.toLowerCase().includes(query) || version.toLowerCase().includes(query));
                          if (matches.length === 0) return null;
                          return (
                            <div key={version}>
                              <p className="studio-pop__group">/{version}</p>
                              {matches.slice(0, 24).map((option) => {
                                const selected = option.id === active?.modelId && version === active?.version;
                                return (
                                  <button key={`${version}:${option.id}`} type="button" className={`studio-pop__item${selected ? " is-on" : ""}`} onClick={() => { pickversion(version); pickmodel(option.id); }} role="option" aria-selected={selected}>
                                    <span className="studio-pop__itemname">
                                      <G.sparkle fontSize={13} style={{ color: "#0EA5E9", flexShrink: 0 }} />
                                      <span className="studio-pop__itemtext">
                                        <span className="studio-pop__id">{option.id}</span>
                                        <span className="studio-pop__sub">{option.meta ? `meta · pool ${option.pool ? "smart" : ""}` : option.pool ? "smart pool" : ""}</span>
                                      </span>
                                    </span>
                                    <span className="studio-pop__badges">
                                      {option.meta && <span className="studio-badge studio-badge--think">META</span>}
                                      {option.pool && !option.meta && <span className="studio-badge studio-badge--pool">POOL</span>}
                                      {selected && <G.check fontSize={13} style={{ color: "#0EA5E9" }} />}
                                    </span>
                                  </button>
                                );
                              })}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {thinkingOpen && (
                      <div className="studio-pop studio-pop--narrow">
                        {thinkingladder.map((rung) => {
                          const selected = (active?.thinkingLevel ?? DEFAULTTHINKINGLEVEL) === rung.level;
                          return (
                            <button key={rung.level} type="button" className={`studio-pop__item${selected ? " is-on" : ""}`} onClick={() => pickthinking(rung.level)}>
                              <span>{rung.level}</span>
                              <span className="studio-pop__budget">{formatbudget(rung.budget)}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}

                    <div className="studio-composer__box">
                      {pendingImages.length > 0 && (
                        <div className="studio-composer__thumbs">
                          {pendingImages.map((url, index) => (
                            <button key={index} type="button" className="studio-thumb" onClick={() => setPendingImages((prev) => prev.filter((_, at) => at !== index))} title={label("studio.composer.remove")}>
                              <img src={url} alt={`attachment ${index + 1}`} />
                            </button>
                          ))}
                        </div>
                      )}
                      <textarea
                        className="studio-composer__area"
                        rows={3}
                        value={draft}
                        onChange={(event) => setDraft(event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" && !event.shiftKey) {
                            event.preventDefault();
                            senddraft();
                          }
                        }}
                        placeholder={label("studio.composer.placeholder")}
                      />
                      <div className="studio-composer__row">
                        <div className="studio-composer__left">
                          <input ref={fileInputRef} type="file" accept="image/*" multiple hidden onChange={(event) => { attachfiles(event.target.files); event.target.value = ""; }} />
                          <button type="button" className="studio-iconbtn studio-iconbtn--frame" onClick={() => fileInputRef.current?.click()} aria-label={label("studio.composer.attach")} title={label("studio.composer.attach")}>
                            <G.image fontSize={15} />
                          </button>
                        </div>
                        <div className="studio-composer__right">
                          <div className="studio-seg">
                            {quickmetas.map((meta) => {
                              const selected = active?.version === meta.version && active?.modelId === "devthink";
                              return (
                                <button key={meta.version} type="button" className={`studio-seg__btn${selected ? " is-on" : ""}`} onClick={() => { pickversion(meta.version); pickmodel("devthink"); }}>
                                  <G.sparkle fontSize={11} />
                                  DevThink {meta.version}
                                </button>
                              );
                            })}
                            <button type="button" className={`studio-seg__btn${modelPickerOpen ? " is-on" : ""}`} onClick={() => { setModelPickerOpen((open) => !open); setThinkingOpen(false); }} aria-label={label("studio.composer.more")}>
                              <G.chevronDown fontSize={11} />
                            </button>
                            <button type="button" className={`studio-seg__btn${thinkingOpen ? " is-on" : ""}`} onClick={() => { setThinkingOpen((open) => !open); setModelPickerOpen(false); }}>
                              {active?.thinkingLevel ?? DEFAULTTHINKINGLEVEL}
                            </button>
                          </div>
                          {streaming ? (
                            <button type="button" className="studio-stop" onClick={stop} aria-label={label("studio.composer.stop")}>
                              <G.stop fontSize={14} />
                            </button>
                          ) : (
                            <button type="button" className="studio-send btn-tactile-3d" onClick={senddraft} aria-label={label("studio.composer.send")}>
                              <G.send fontSize={14} />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="studio-starters">
                    {STARTERS.map((starter) => (
                      <button key={starter.title} type="button" className="studio-starter" onClick={() => void send(label(starter.prompt))}>
                        <span className="studio-starter__top">
                          <span className="studio-starter__well">
                            {starter.icon === "cube" && <G.cube fontSize={19} />}
                            {starter.icon === "bot" && <G.bot fontSize={19} />}
                            {starter.icon === "code" && <G.code fontSize={19} />}
                            {starter.icon === "layers" && <G.layers fontSize={19} />}
                          </span>
                          <G.arrowUpRight fontSize={15} className="studio-starter__arrow" />
                        </span>
                        <span>
                          <span className="studio-starter__title">{label(starter.title)}</span>
                          <span className="studio-starter__tag">{label(starter.tag)}</span>
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              /* the active thread */
              <div className="studio-thread">
                <div ref={threadRef} className="studio-thread__scroll">
                  <div className="studio-thread__list">
                    {activeThread.map((message) => {
                      if (message.role === "user") {
                        return (
                          <div key={message.id} className="studio-msg--user">
                            {message.images && message.images.length > 0 && (
                              <span className="studio-msg__imgs">
                                {message.images.map((url, index) => (
                                  <img key={index} src={url} alt={`attachment ${index + 1}`} />
                                ))}
                              </span>
                            )}
                            <div className="studio-msg__bubble">{message.content}</div>
                          </div>
                        );
                      }
                      const reasonOpen = Boolean(expandedReasoning[message.id]);
                      const isGhost = message.id === "ghost";
                      return (
                        <div key={message.id} className="studio-msg--bot">
                          <span className="studio-msg__avatar">
                            <G.sparkle fontSize={15} style={{ color: "#6366F1" }} />
                          </span>
                          <div className="studio-msg__body">
                            {message.reasoning && message.reasoning !== "" && (
                              <div className={`studio-reason${isGhost ? " is-live" : ""}`}>
                                <button
                                  type="button"
                                  className="studio-reason__head"
                                  onClick={() => setExpandedReasoning((prev) => ({ ...prev, [message.id]: !prev[message.id] }))}
                                >
                                  <span className="studio-reason__label">
                                    <G.pulse fontSize={13} className="studio-reason__glyph" style={{ color: "#6366F1" }} />
                                    {label("studio.thread.reasoning")}
                                  </span>
                                  <G.chevronDown fontSize={13} className={`studio-reason__chev${reasonOpen ? " is-open" : ""}`} />
                                </button>
                                {reasonOpen && <div className="studio-reason__body">{message.reasoning}</div>}
                              </div>
                            )}
                            {message.error ? (
                              <div>
                                <p className="studio-msg__error">{message.error}</p>
                                <button type="button" className="studio-msg__retry" onClick={() => void retry()}>
                                  <G.pulse fontSize={12} />
                                  {label("studio.thread.retry")}
                                </button>
                              </div>
                            ) : (
                              <div className="studio-md">
                                {splitblocks(message.content).map((block, index) => {
                                  if (block.kind === "code") {
                                    return (
                                      <div key={index} className="studio-code">
                                        <div className="studio-code__bar">
                                          <span className="studio-code__lang">{block.lang}</span>
                                          <button
                                            type="button"
                                            className="studio-code__copy"
                                            onClick={() => {
                                              void navigator.clipboard?.writeText(block.code);
                                              showToast(label("studio.toast.copied"));
                                            }}
                                          >
                                            <G.copy fontSize={12} />
                                            Copy
                                          </button>
                                        </div>
                                        <pre className="studio-code__pre">
                                          <code>{block.code}</code>
                                        </pre>
                                      </div>
                                    );
                                  }
                                  return (
                                    <div key={index}>
                                      {block.text.split("\n").map((line, lineIndex) => {
                                        const trimmed = line.trim();
                                        if (trimmed === "") return <div key={lineIndex} style={{ height: 4 }} />;
                                        if (trimmed.startsWith("### ")) {
                                          return (
                                            <h4 key={lineIndex} className="studio-md__heading" style={{ fontSize: 17 }}>
                                              {trimmed.slice(4)}
                                            </h4>
                                          );
                                        }
                                        if (trimmed.startsWith("## ")) {
                                          return (
                                            <h3 key={lineIndex} className="studio-md__heading" style={{ fontSize: 19 }}>
                                              {trimmed.slice(3)}
                                            </h3>
                                          );
                                        }
                                        if (/^[-*] /.test(trimmed)) {
                                          return (
                                            <div key={lineIndex} className="studio-md__bullet">
                                              <span className="studio-md__dot">•</span>
                                              <p className="studio-md__para" style={{ marginBottom: 0, flex: 1 }}>
                                                {trimmed.slice(2)}
                                              </p>
                                            </div>
                                          );
                                        }
                                        const tokens = line.split(/(`[^`]+`|\*\*[^*]+\*\*)/g);
                                        return (
                                          <p key={lineIndex} className="studio-md__para">
                                            {tokens.map((token, tokenIndex) => {
                                              if (token.startsWith("`") && token.endsWith("`") && token.length > 2) {
                                                return (
                                                  <code key={tokenIndex} className="studio-md__inline">
                                                    {token.slice(1, -1)}
                                                  </code>
                                                );
                                              }
                                              if (token.startsWith("**") && token.endsWith("**") && token.length > 4) {
                                                return (
                                                  <strong key={tokenIndex} className="studio-md__strong">
                                                    {token.slice(2, -2)}
                                                  </strong>
                                                );
                                              }
                                              return <span key={tokenIndex}>{token}</span>;
                                            })}
                                          </p>
                                        );
                                      })}
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                            {!isGhost && !message.error && (message.modelId || message.usage) && (
                              <div className="studio-meta">
                                {message.backendModel && <span className="studio-meta__backend">devthink → {message.backendModel}</span>}
                                {message.modelId && <span>{message.modelId}</span>}
                                {message.route && <span>· /{message.route}</span>}
                                {message.provider && <span>· {message.provider}</span>}
                                {message.fallback && <span className="studio-meta__lane">fallback</span>}
                                {message.usage?.totalTokens !== undefined && (
                                  <span>
                                    · {label("studio.thread.tokens").replace("{n}", formattokens(message.usage.totalTokens))}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* the bottom compact composer */}
                <div className="studio-bottom">
                  <div className="studio-bottom__box">
                    {modelPickerOpen && (
                      <div className="studio-pop studio-pop--narrow" style={{ position: "static", width: "100%", marginBottom: 8, maxHeight: 200 }}>
                        {DISCOVERYVERSIONS.map((version) => {
                          const options = modeloptions(version).filter((option) => modelQuery === "" || option.id.toLowerCase().includes(modelQuery.toLowerCase()));
                          if (options.length === 0) return null;
                          return (
                            <div key={version}>
                              <p className="studio-pop__group">/{version}</p>
                              {options.slice(0, 10).map((option) => (
                                <button key={`${version}:${option.id}`} type="button" className={`studio-pop__item${option.id === active?.modelId && version === active?.version ? " is-on" : ""}`} onClick={() => { pickversion(version); pickmodel(option.id); }}>
                                  <span className="studio-pop__id">{option.id}</span>
                                  {option.meta && <span className="studio-badge studio-badge--think">META</span>}
                                </button>
                              ))}
                            </div>
                          );
                        })}
                      </div>
                    )}
                    <div className="studio-bottom__row">
                      <div className="studio-seg">
                        <button type="button" className={`studio-seg__btn${modelPickerOpen ? " is-on" : ""}`} onClick={() => setModelPickerOpen((open) => !open)}>
                          <G.sparkle fontSize={11} />
                          <span style={{ maxWidth: 130, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{active?.modelId ?? "devthink"}</span>
                          <G.chevronDown fontSize={10} />
                        </button>
                        <button type="button" className={`studio-seg__btn${thinkingOpen ? " is-on" : ""}`} onClick={() => setThinkingOpen((open) => !open)}>
                          {active?.thinkingLevel ?? DEFAULTTHINKINGLEVEL}
                        </button>
                      </div>
                      <span style={{ flex: 1 }} />
                      {!streaming && activeThread.length > 0 && (
                        <button type="button" className="studio-seg__btn" onClick={() => void retry()} style={{ opacity: 0.6 }}>
                          retry
                        </button>
                      )}
                    </div>
                    <div className="studio-bottom__inputrow">
                      <input ref={fileInputRef} type="file" accept="image/*" multiple hidden onChange={(event) => { attachfiles(event.target.files); event.target.value = ""; }} />
                      <button type="button" className="studio-iconbtn studio-iconbtn--frame" style={{ width: 32, height: 32, borderRadius: 9 }} onClick={() => fileInputRef.current?.click()} aria-label={label("studio.composer.attach")}>
                        <G.image fontSize={15} />
                      </button>
                      <input
                        className="studio-bottom__input"
                        value={draft}
                        onChange={(event) => setDraft(event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter") {
                            event.preventDefault();
                            senddraft();
                          }
                        }}
                        placeholder={label("studio.composer.placeholder")}
                      />
                      {pendingImages.length > 0 && (
                        <span className="studio-conv__chip">
                          {pendingImages.length}/{MAXIMAGES}
                        </span>
                      )}
                      {streaming ? (
                        <button type="button" className="studio-stop" onClick={stop} aria-label={label("studio.composer.stop")}>
                          <G.stop fontSize={14} />
                        </button>
                      ) : (
                        <button type="button" className="studio-send btn-tactile-3d" onClick={senddraft} aria-label={label("studio.composer.send")}>
                          <G.send fontSize={14} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {studioToast !== null && <div className="studio-toast">{studioToast}</div>}
    </div>
  );
}
