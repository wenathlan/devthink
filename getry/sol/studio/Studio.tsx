/**
 * Studio.tsx — the devthink studio os surface of the getry sol theme, the
 * interface 18 edition (the "devthink chat3" replacement spec): the anchor
 * of the studio folder mounts the full studio desktop — the omni saddle
 * rail, the seamless browser tabs, the workspace sidebar, the chat thread,
 * the composer — wired to the GETRY LANES through getry/studio.client
 * (the correlated-logic adapter): discovery over chatclient.discovery(),
 * streaming over chatclient.streamchat() with the reasoning ALWAYS before
 * the content, the devthink meta-model smart-first rotation, the thinking
 * ladder of thinking.ts, conversations persisted through the db lane, and
 * the getry pages one rail press away (/sessions, /versions, /chat). every
 * feature of the interface 17 surface survives; none was removed:
 *
 *   - omni saddle rail: full / full-floating / saddle (4 dock edges) /
 *     floating drag capsule, with edge snapping and zoom-aware math
 *   - browser-style seamless tabs (drag reorder, rename, streaming state)
 *   - workspaces (projects) + workspace memory + permission modes
 *   - tasks, artifacts (code + image extraction), markdown export
 *   - composer: templates, dictation (web speech), permission pills,
 *     model picker with search/filter, drag-to-effort spectrum
 *   - gtx runtime UI translation (6 languages, cached)
 *   - FX toggles (ansi/glow/blur/transparency), UI zoom, auto-scroll
 *   - intro 3D animation + ansi canvas hero
 */

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { useLocation } from "wouter";
import { setgatewayorigin } from "../../chatclient";
import { IntroAnimation } from "../wingets/studio.visuals";
import { OmniSaddleRail } from "../wingets/studio.rail";
import {
  deleteConversationFromDb,
  discoverGatewayRoutes,
  fetchConversationsFromDb,
  generateGatewayImage,
  importFromGatewayDatabase,
  runImageUnderstanding,
  saveConversationToDb,
  streamChatCompletion,
  applyStreamDeltaToMessage,
  buildUnderstandingPrompt,
  DEFAULT_GATEWAY_BASE_URL,
  DEFAULT_ROUTES,
  deriveConversationTitle,
  normalizeBaseUrl,
  resolveThinkingLevels,
  shouldGenerateImageInChat,
  normalizeImageFile,
  type ChatImageAttachment,
  type ChatMessage,
  type Conversation,
  type RouteDiscoveryResult,
  type RouteName,
  type Workspace,
} from "../../studio.client";
import { Sidebar, type SidebarTab } from "../wingets/studio.sidebar";
import { TopBar } from "../wingets/studio.topbar";
import { ChatThread } from "../wingets/studio.chatthread";
import { Composer } from "../wingets/studio.composer";
import { ModelInspectorModal } from "../wingets/studio.inspector";
import { TerminalDrawer, type TerminalLogLine } from "../wingets/studio.terminal";
import { extractConversationArtifacts, type WorkspaceTask } from "../../studio.artifacts";
import {
  clampSidebarWidth,
  computeZoomViewportStyle,
  DEFAULT_SIDEBAR_WIDTH,
  DEFAULT_UI_ZOOM,
  formatConversationMarkdown,
  MAX_SIDEBAR_WIDTH,
  MIN_SIDEBAR_WIDTH,
  nextProjectName,
  normalizeRailMode,
  reorderTabIds,
  resolveEffortChroma,
  type PermissionMode,
  type RailMode,
  type RailPosition,
  type SaddleDockEdge,
} from '../../studio.uiprefs';
import { GtxLanguageProvider } from '../../studio.gtx';

const STORAGE_CONVS_KEY = 'devthink_chat_conversations_v1';
const STORAGE_ACTIVE_KEY = 'devthink_chat_active_id_v1';
const STORAGE_OPEN_TABS_KEY = 'devthink_chat_open_tabs_v1';
const STORAGE_WORKSPACES_KEY = 'devthink_chat_workspaces_v1';
const STORAGE_ACTIVE_WORKSPACE_KEY = 'devthink_chat_active_workspace_v1';
const STORAGE_PERMISSION_MODE_KEY = 'devthink_chat_permission_mode_v1';
const STORAGE_MEMORY_KEY = 'devthink_chat_workspace_memory_v1';
const STORAGE_USER_NAME_KEY = 'devthink_chat_user_name_v1';
const STORAGE_BASE_URL_KEY = 'devthink_chat_base_url_v1';
const STORAGE_THEME_KEY = 'devthink_chat_theme_v1';
const STORAGE_FLOATING_RAIL_KEY = 'devthink_chat_floating_rail_v1';
const STORAGE_RAIL_MODE_KEY = 'devthink_chat_rail_mode_v1';
const STORAGE_RAIL_DOCK_EDGE_KEY = 'devthink_chat_rail_edge_v1';
const STORAGE_RAIL_POS_KEY = 'devthink_chat_rail_pos_v1';
const STORAGE_FLOATING_SIDEBAR_KEY = 'devthink_chat_floating_sidebar_v1';
const STORAGE_SIDEBAR_WIDTH_KEY = 'devthink_chat_sidebar_width_v1';
const STORAGE_ANSI_BG_KEY = 'devthink_chat_ansi_bg_v1';
const STORAGE_FX_GLOW_KEY = 'devthink_chat_fx_glow_v1';
const STORAGE_FX_BLUR_KEY = 'devthink_chat_fx_blur_v1';
const STORAGE_FX_TRANSPARENCY_KEY = 'devthink_chat_fx_transparency_v1';
const STORAGE_AUTO_SCROLL_KEY = 'devthink_chat_auto_scroll_v1';
const STORAGE_PINNED_CONVS_KEY = 'devthink_chat_pinned_convs_v1';
const STORAGE_TASKS_KEY = 'devthink_chat_tasks_v1';

const DEFAULT_WORKSPACE_ID = 'ws_default';

function createDefaultWorkspace(): Workspace {
  const now = Date.now();
  return {
    id: DEFAULT_WORKSPACE_ID,
    name: 'devthink-principal',
    createdAt: now,
    updatedAt: now,
  };
}

function loadInitialWorkspaces(): Workspace[] {
  try {
    const raw = localStorage.getItem(STORAGE_WORKSPACES_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.filter(
          (w): w is Workspace =>
            Boolean(w && typeof w.id === 'string' && typeof w.name === 'string')
        );
      }
    }
  } catch {
    // ignore corrupted storage
  }
  return [createDefaultWorkspace()];
}

function makeId(prefix: string): string {
  /* the CSPRNG law (the insecure-randomness cure, alert #5130): the id
   * draws through the crypto random the platform grants — the randomUUID
   * path first, the getRandomValues suffix the Chat lane's newid pattern
   * stamps when the uuid shape is unavailable; the Math.random string the
   * CodeQL gate refused never answers. */
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}_${crypto.randomUUID()}`;
  }
  const bytes = new Uint8Array(4);
  crypto.getRandomValues(bytes);
  const suffix = Array.from(bytes, (byte) => byte.toString(36).padStart(2, '0')).join('');
  return `${prefix}_${Date.now().toString(36)}_${suffix}`;
}

function createEmptyConversation(
  route: RouteName = 'v1',
  modelId = '',
  workspaceId = DEFAULT_WORKSPACE_ID
): Conversation {
  const now = Date.now();
  const id = makeId('conv');
  return {
    id,
    workspaceId,
    sessionId: id,
    title: 'New chat',
    route,
    modelId,
    systemPrompt: '',
    temperature: 0.7,
    thinkingLevel: 'default',
    messages: [],
    createdAt: now,
    updatedAt: now,
  };
}

function loadInitialConversations(): Conversation[] {
  try {
    const raw = localStorage.getItem(STORAGE_CONVS_KEY);
    if (!raw) return [createEmptyConversation()];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.map((c) => ({
        ...c,
        workspaceId: c.workspaceId || DEFAULT_WORKSPACE_ID,
        messages: Array.isArray(c.messages)
          ? c.messages.map((m: ChatMessage) => ({ ...m, isStreaming: false }))
          : [],
      }));
    }
  } catch {
    // ignore corrupted storage
  }
  return [createEmptyConversation()];
}

function loadInitialOpenTabIds(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_OPEN_TABS_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    if (Array.isArray(parsed)) {
      return parsed.filter((id): id is string => typeof id === 'string');
    }
  } catch {
    // ignore
  }
  return [];
}

function AppContent() {
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_THEME_KEY);
      return saved === 'dark' ? 'dark' : 'light';
    } catch {
      return 'light';
    }
  });

  const [baseUrl, setBaseUrl] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_BASE_URL_KEY);
      return saved ? normalizeBaseUrl(saved) || DEFAULT_GATEWAY_BASE_URL : DEFAULT_GATEWAY_BASE_URL;
    } catch {
      return DEFAULT_GATEWAY_BASE_URL;
    }
  });

  const [workspaces, setWorkspaces] = useState<Workspace[]>(loadInitialWorkspaces);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string>(() => {
    try {
      return localStorage.getItem(STORAGE_ACTIVE_WORKSPACE_KEY) || DEFAULT_WORKSPACE_ID;
    } catch {
      return DEFAULT_WORKSPACE_ID;
    }
  });
  const [permissionMode, setPermissionMode] = useState<PermissionMode>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_PERMISSION_MODE_KEY);
      if (saved === 'full' || saved === 'assisted' || saved === 'readonly') return saved;
    } catch {
      // ignore
    }
    return 'assisted';
  });
  const [workspaceMemory, setWorkspaceMemory] = useState<string>(() => {
    try {
      return localStorage.getItem(STORAGE_MEMORY_KEY) || '';
    } catch {
      return '';
    }
  });
  const [userDisplayName, setUserDisplayName] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_USER_NAME_KEY);
      if (!saved || saved === 'DevThink Studio') return '';
      return saved;
    } catch {
      return '';
    }
  });

  const [conversations, setConversations] = useState<Conversation[]>(loadInitialConversations);
  const [activeConversationId, setActiveConversationId] = useState<string>(() => {
    try {
      return localStorage.getItem(STORAGE_ACTIVE_KEY) || '';
    } catch {
      return '';
    }
  });
  const [openTabIds, setOpenTabIds] = useState<string[]>(loadInitialOpenTabIds);

  const [routeResults, setRouteResults] = useState<RouteDiscoveryResult[]>([]);
  const [isDiscovering, setIsDiscovering] = useState<boolean>(true);
  const [discoveryError, setDiscoveryError] = useState<string | null>(null);

  const [isDesktop, setIsDesktop] = useState<boolean>(() =>
    typeof window !== 'undefined' ? window.innerWidth >= 1024 : true
  );
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(() =>
    typeof window !== 'undefined' ? window.innerWidth >= 1024 : true
  );
  const [sidebarTab, setSidebarTab] = useState<SidebarTab>('chats');
  const [railMode, setRailMode] = useState<RailMode>(() => {
    try {
      const savedMode = localStorage.getItem(STORAGE_RAIL_MODE_KEY);
      const legacyFloating = localStorage.getItem(STORAGE_FLOATING_RAIL_KEY) === 'true';
      return normalizeRailMode(savedMode, legacyFloating);
    } catch {
      return 'full';
    }
  });
  const [sidebarSearchOpen, setSidebarSearchOpen] = useState<boolean>(false);
  const [floatingSidebar, setFloatingSidebar] = useState<boolean>(() => {
    try {
      return localStorage.getItem(STORAGE_FLOATING_SIDEBAR_KEY) === 'true';
    } catch {
      return false;
    }
  });
  const [sidebarWidth, setSidebarWidth] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_SIDEBAR_WIDTH_KEY);
      return saved ? clampSidebarWidth(saved) : DEFAULT_SIDEBAR_WIDTH;
    } catch {
      return DEFAULT_SIDEBAR_WIDTH;
    }
  });
  const [dragPreviewWidth, setDragPreviewWidth] = useState<number | null>(null);
  const [isResizingSidebar, setIsResizingSidebar] = useState<boolean>(false);
  const [ansiEnabled, setAnsiEnabled] = useState<boolean>(() => {
    try {
      return localStorage.getItem(STORAGE_ANSI_BG_KEY) !== 'false';
    } catch {
      return true;
    }
  });
  const [glowEnabled, setGlowEnabled] = useState<boolean>(() => {
    try {
      return localStorage.getItem(STORAGE_FX_GLOW_KEY) !== 'false';
    } catch {
      return true;
    }
  });
  const [blurEnabled, setBlurEnabled] = useState<boolean>(() => {
    try {
      return localStorage.getItem(STORAGE_FX_BLUR_KEY) !== 'false';
    } catch {
      return true;
    }
  });
  const [transparencyEnabled, setTransparencyEnabled] = useState<boolean>(() => {
    try {
      return localStorage.getItem(STORAGE_FX_TRANSPARENCY_KEY) !== 'false';
    } catch {
      return true;
    }
  });
  const [autoScrollEnabled, setAutoScrollEnabled] = useState<boolean>(() => {
    try {
      return localStorage.getItem(STORAGE_AUTO_SCROLL_KEY) !== 'false';
    } catch {
      return true;
    }
  });
  const [pinnedConvIds, setPinnedConvIds] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_PINNED_CONVS_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === 'string') : [];
    } catch {
      return [];
    }
  });
  const [railDockEdge, setRailDockEdge] = useState<SaddleDockEdge>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_RAIL_DOCK_EDGE_KEY);
      if (saved === 'left' || saved === 'right' || saved === 'top' || saved === 'bottom') {
        return saved;
      }
    } catch {
      // ignore
    }
    return 'left';
  });
  const [railPos, setRailPos] = useState<RailPosition | null>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_RAIL_POS_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed.x === 'number' && typeof parsed.y === 'number') {
        return { x: parsed.x, y: parsed.y };
      }
    } catch {
      // ignore
    }
    return null;
  });
  const [workspaceTasks, setWorkspaceTasks] = useState<WorkspaceTask[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_TASKS_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed)
        ? parsed.filter(
            (t): t is WorkspaceTask =>
              Boolean(t && typeof t.id === 'string' && typeof t.label === 'string')
          )
        : [];
    } catch {
      return [];
    }
  });

  const [inspectorOpen, setInspectorOpen] = useState(false);

  /* ---------------- the getry page lane + the live request log ----------- */
  const [, navigate] = useLocation();
  const [terminalOpen, setTerminalOpen] = useState(false);
  const [terminalLog, setTerminalLog] = useState<TerminalLogLine[]>([]);

  const logTerminal = useCallback(
    (
      method: string,
      path: string,
      status: number | string,
      detail: string,
      durationMs?: number
    ) => {
      setTerminalLog((prev) =>
        [
          {
            id: makeId('log'),
            at: Date.now(),
            method,
            path,
            status,
            detail,
            durationMs,
          },
          ...prev,
        ].slice(0, 120)
      );
    },
    []
  );

  const [composerInput, setComposerInput] = useState('');
  const [pendingImages, setPendingImages] = useState<ChatImageAttachment[]>([]);
  const [streamingConvId, setStreamingConvId] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  const [showIntro, setShowIntro] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    const params = new URLSearchParams(window.location.search);
    return params.get('autostart') !== '1';
  });
  const [ansiPulseCount, setAnsiPulseCount] = useState<number>(0);
  const [attachSignal, setAttachSignal] = useState<number>(0);
  const [focusSignal, setFocusSignal] = useState<number>(0);
  const [searchFocusSignal, setSearchFocusSignal] = useState<number>(0);

  const abortControllerRef = useRef<AbortController | null>(null);
  const shellRef = useRef<HTMLDivElement>(null);
  const dbHydratedRef = useRef(false);
  const lastSavedSnapshotRef = useRef<Record<string, string>>({});

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(min-width: 1024px)');
    const onChange = (e: MediaQueryListEvent) => {
      setIsDesktop(e.matches);
      setSidebarOpen(e.matches);
    };
    setIsDesktop(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_RAIL_MODE_KEY, railMode);
      localStorage.setItem(STORAGE_FLOATING_RAIL_KEY, String(railMode === 'floating'));
    } catch {
      // ignore
    }
  }, [railMode]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_FLOATING_SIDEBAR_KEY, String(floatingSidebar));
    } catch {
      // ignore
    }
  }, [floatingSidebar]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_SIDEBAR_WIDTH_KEY, String(sidebarWidth));
    } catch {
      // ignore
    }
  }, [sidebarWidth]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_ANSI_BG_KEY, String(ansiEnabled));
    } catch {
      // ignore
    }
  }, [ansiEnabled]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_FX_GLOW_KEY, String(glowEnabled));
    } catch {
      // ignore
    }
  }, [glowEnabled]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_FX_BLUR_KEY, String(blurEnabled));
    } catch {
      // ignore
    }
  }, [blurEnabled]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_FX_TRANSPARENCY_KEY, String(transparencyEnabled));
    } catch {
      // ignore
    }
  }, [transparencyEnabled]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_AUTO_SCROLL_KEY, String(autoScrollEnabled));
    } catch {
      // ignore
    }
  }, [autoScrollEnabled]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_PINNED_CONVS_KEY, JSON.stringify(pinnedConvIds));
    } catch {
      // ignore
    }
  }, [pinnedConvIds]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_RAIL_DOCK_EDGE_KEY, railDockEdge);
    } catch {
      // ignore
    }
  }, [railDockEdge]);

  useEffect(() => {
    try {
      if (railPos) {
        localStorage.setItem(STORAGE_RAIL_POS_KEY, JSON.stringify(railPos));
      } else {
        localStorage.removeItem(STORAGE_RAIL_POS_KEY);
      }
    } catch {
      // ignore
    }
  }, [railPos]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_TASKS_KEY, JSON.stringify(workspaceTasks));
    } catch {
      // ignore
    }
  }, [workspaceTasks]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_WORKSPACES_KEY, JSON.stringify(workspaces));
    } catch {
      // ignore
    }
  }, [workspaces]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_ACTIVE_WORKSPACE_KEY, activeWorkspaceId);
    } catch {
      // ignore
    }
  }, [activeWorkspaceId]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_PERMISSION_MODE_KEY, permissionMode);
    } catch {
      // ignore
    }
  }, [permissionMode]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_MEMORY_KEY, workspaceMemory);
    } catch {
      // ignore
    }
  }, [workspaceMemory]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_USER_NAME_KEY, userDisplayName);
    } catch {
      // ignore
    }
  }, [userDisplayName]);

  const handleResizePointerDown = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      if (!isDesktop) return;
      e.preventDefault();
      const startX = e.clientX;
      const startWidth = sidebarWidth;
      setIsResizingSidebar(true);
      document.body.classList.add('select-none');

      const onMove = (ev: PointerEvent) => {
        const raw = startWidth + (ev.clientX - startX);
        if (raw < 130) {
          setDragPreviewWidth(Math.max(0, raw));
        } else {
          setDragPreviewWidth(null);
          setSidebarWidth(Math.min(MAX_SIDEBAR_WIDTH, Math.max(MIN_SIDEBAR_WIDTH, Math.round(raw))));
        }
      };

      const onUp = (ev: PointerEvent) => {
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onUp);
        window.removeEventListener('pointercancel', onUp);
        document.body.classList.remove('select-none');

        const raw = startWidth + (ev.clientX - startX);
        if (raw < 130) {
          setSidebarOpen(false);
          setSidebarWidth(startWidth >= MIN_SIDEBAR_WIDTH ? startWidth : DEFAULT_SIDEBAR_WIDTH);
        }
        setDragPreviewWidth(null);
        setIsResizingSidebar(false);
      };

      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', onUp);
      window.addEventListener('pointercancel', onUp);
    },
    [isDesktop, sidebarWidth]
  );

  // Sync dark class and data-theme attribute on <html> atomically without transition ghosting
  useEffect(() => {
    const root = document.documentElement;
    root.classList.add('theme-switching');
    root.classList.toggle('dark', theme === 'dark');
    root.setAttribute('data-theme', theme);
    void root.offsetHeight;
    let raf1 = 0;
    let raf2 = 0;
    raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        root.classList.remove('theme-switching');
      });
    });
    try {
      localStorage.setItem(STORAGE_THEME_KEY, theme);
    } catch {
      // ignore
    }
    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
      root.classList.remove('theme-switching');
    };
  }, [theme]);

  // Persist conversations
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_CONVS_KEY, JSON.stringify(conversations));
    } catch {
      // ignore quota exceeded
    }
  }, [conversations]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_OPEN_TABS_KEY, JSON.stringify(openTabIds));
    } catch {
      // ignore
    }
  }, [openTabIds]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_BASE_URL_KEY, baseUrl);
    } catch {
      // ignore
    }
  }, [baseUrl]);

  // Hydrate conversations from self-hosted SQLite on mount
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const dbConvs = await fetchConversationsFromDb();
        if (cancelled) return;
        const dbIds = new Set(dbConvs.map((c) => c.id));
        const localNonEmpty = conversations.filter(
          (c) => c.messages.length > 0 && !dbIds.has(c.id)
        );
        for (const c of localNonEmpty) {
          await saveConversationToDb(c).catch(() => undefined);
        }
        const merged =
          localNonEmpty.length > 0 ? [...localNonEmpty, ...dbConvs] : dbConvs;

        if (merged.length > 0) {
          for (const c of merged) {
            lastSavedSnapshotRef.current[c.id] = JSON.stringify(c);
          }
          setConversations(merged);
          const current = merged.find((c) => c.id === activeConversationId);
          if (!current || current.messages.length === 0) {
            const preferred =
              merged.find((c) => c.messages.length > 0) ?? merged[0];
            setActiveConversationId(preferred.id);
            setOpenTabIds((prev) => {
              const valid = prev.filter((id) => merged.some((c) => c.id === id));
              if (valid.includes(preferred.id)) return valid;
              return [preferred.id, ...valid].slice(0, 6);
            });
          }
        }
      } catch {
        // Fallback to localStorage if server DB is temporarily unreachable
      } finally {
        if (!cancelled) {
          dbHydratedRef.current = true;
        }
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist active conversation to self-hosted SQLite when not actively streaming
  useEffect(() => {
    if (!dbHydratedRef.current || streamingConvId) return;
    const conv = conversations.find((c) => c.id === activeConversationId);
    if (!conv) return;
    const snap = JSON.stringify(conv);
    if (lastSavedSnapshotRef.current[conv.id] === snap) return;
    const timer = setTimeout(() => {
      lastSavedSnapshotRef.current[conv.id] = snap;
      saveConversationToDb(conv).catch(() => undefined);
    }, 350);
    return () => clearTimeout(timer);
  }, [conversations, activeConversationId, streamingConvId, baseUrl]);

  const activeConversation = useMemo(() => {
    return (
      conversations.find((c) => c.id === activeConversationId) ?? conversations[0]
    );
  }, [conversations, activeConversationId]);

  useEffect(() => {
    if (activeConversation && activeConversation.id !== activeConversationId) {
      setActiveConversationId(activeConversation.id);
    }
    if (activeConversation) {
      setOpenTabIds((prev) => {
        const existingSet = new Set(conversations.map((c) => c.id));
        const filtered = prev.filter((id) => existingSet.has(id));
        if (filtered.includes(activeConversation.id)) {
          return filtered.length === prev.length ? prev : filtered;
        }
        return [...filtered, activeConversation.id];
      });
      try {
        localStorage.setItem(STORAGE_ACTIVE_KEY, activeConversation.id);
      } catch {
        // ignore
      }
    }
  }, [activeConversation, activeConversationId, conversations]);

  const openTabs = useMemo(() => {
    const map = new Map(conversations.map((c) => [c.id, c]));
    const resolved = openTabIds
      .map((id) => map.get(id))
      .filter((c): c is Conversation => Boolean(c));
    if (resolved.length > 0) return resolved;
    return activeConversation ? [activeConversation] : [];
  }, [conversations, openTabIds, activeConversation]);

  const runDiscovery = useCallback(async (targetBaseUrl: string) => {
    setIsDiscovering(true);
    setDiscoveryError(null);
    try {
      const t0 = Date.now();
      const { results } = await discoverGatewayRoutes(targetBaseUrl, DEFAULT_ROUTES);
      logTerminal(
        'GET',
        '/{v1..v5}/models',
        200,
        `${results.filter((r) => r.status === 'live').length}/${results.length} live`,
        Date.now() - t0
      );
      setRouteResults(results);

      const firstLive =
        results.find((r) => r.status === 'live' && r.models.length > 0) ??
        results.find((r) => r.models.length > 0);

      if (firstLive) {
        const fallbackModel = firstLive.defaultModel || firstLive.models[0]?.id || '';
        setConversations((prev) =>
          prev.map((c) => {
            if (!c.modelId) {
              return { ...c, route: firstLive.route, modelId: fallbackModel };
            }
            return c;
          })
        );
      }
    } catch (err) {
      logTerminal('GET', '/{v1..v5}/models', 'ERR', String(err));
      setDiscoveryError(
        err instanceof Error ? err.message : 'Failed to discover models via GET.'
      );
    } finally {
      setIsDiscovering(false);
    }
  }, []);

  useEffect(() => {
    runDiscovery(baseUrl);
  }, [baseUrl, runDiscovery]);

  const activeRoute = activeConversation?.route || 'v1';
  const activeModelId = activeConversation?.modelId || '';

  const activeRouteInfo = useMemo(
    () => routeResults.find((r) => r.route === activeRoute),
    [routeResults, activeRoute]
  );

  const activeModel = useMemo(
    () => activeRouteInfo?.models.find((m) => m.id === activeModelId),
    [activeRouteInfo, activeModelId]
  );

  const discoveredImageModels = useMemo(() => {
    const list: Array<{
      id: string;
      sizes?: string[];
      modality?: string;
      route: RouteName;
    }> = [];
    for (const r of routeResults) {
      if (r.imageModels) {
        for (const im of r.imageModels) {
          list.push({ ...im, route: r.route });
        }
      }
    }
    return list;
  }, [routeResults]);

  const fallbackUnderstandingRoutePath = useMemo(() => {
    const v1Route = routeResults.find(
      (r) => r.route === 'v1' && r.status === 'live' && r.understandingRoutes?.image?.route
    );
    if (v1Route?.understandingRoutes?.image?.route) {
      return v1Route.understandingRoutes.image.route;
    }
    const anyLive = routeResults.find(
      (r) => r.status === 'live' && r.understandingRoutes?.image?.route
    );
    return anyLive?.understandingRoutes?.image?.route;
  }, [routeResults]);


  const resolvedThinkingLevels = useMemo(
    () => resolveThinkingLevels(activeRouteInfo, routeResults),
    [activeRouteInfo, routeResults]
  );

  const effortChroma = useMemo(
    () =>
      resolveEffortChroma(
        ['default', ...Object.keys(resolvedThinkingLevels)],
        activeConversation?.thinkingLevel || 'default'
      ),
    [resolvedThinkingLevels, activeConversation?.thinkingLevel]
  );

  const discoveredModels = useMemo(() => {
    const ordered = [...routeResults].sort((a, b) => {
      if (a.status === 'live' && b.status !== 'live') return -1;
      if (b.status === 'live' && a.status !== 'live') return 1;
      return 0;
    });
    const seen = new Set<string>();
    const unique: typeof routeResults[number]['models'] = [];
    for (const r of ordered) {
      if (r.status === 'paused' && r.models.length === 0) continue;
      for (const m of r.models) {
        if (!seen.has(m.id)) {
          seen.add(m.id);
          unique.push(m);
        }
      }
    }
    return unique;
  }, [routeResults]);

  const updateConversation = useCallback(
    (convId: string, updater: (prev: Conversation) => Conversation) => {
      setConversations((prev) =>
        prev.map((c) => (c.id === convId ? updater(c) : c))
      );
    },
    []
  );

  const handleSelectModel = useCallback(
    (route: RouteName, modelId: string) => {
      if (!activeConversation) return;
      setAnsiPulseCount((c) => c + 1);
      updateConversation(activeConversation.id, (c) => ({
        ...c,
        route,
        modelId,
        updatedAt: Date.now(),
      }));
    },
    [activeConversation, updateConversation]
  );

  const handleSelectFallbackRoute = useCallback(
    (route: RouteName) => {
      const target = routeResults.find((r) => r.route === route);
      const nextModel = target?.defaultModel || target?.models[0]?.id || '';
      if (nextModel) {
        handleSelectModel(route, nextModel);
      }
    },
    [routeResults, handleSelectModel]
  );

  const handleSelectConversation = useCallback(
    (id: string) => {
      setActiveConversationId(id);
      setOpenTabIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
      const found = conversations.find((c) => c.id === id);
      if (found?.workspaceId && workspaces.some((w) => w.id === found.workspaceId)) {
        setActiveWorkspaceId(found.workspaceId);
      }
    },
    [conversations, workspaces]
  );

  const handleNewConversation = useCallback(
    (targetWorkspaceId?: string) => {
      const wsId =
        targetWorkspaceId && workspaces.some((w) => w.id === targetWorkspaceId)
          ? targetWorkspaceId
          : activeWorkspaceId || workspaces[0]?.id || DEFAULT_WORKSPACE_ID;
      setActiveWorkspaceId(wsId);
      const newConv = createEmptyConversation(activeRoute, activeModelId, wsId);
      setConversations((prev) => [newConv, ...prev]);
      setOpenTabIds((prev) => [...prev, newConv.id]);
      setActiveConversationId(newConv.id);
      setComposerInput('');
      setPendingImages([]);
      setAnsiPulseCount((c) => c + 1);
      saveConversationToDb(newConv).catch(() => undefined);
    },
    [activeRoute, activeModelId, baseUrl, activeWorkspaceId, workspaces]
  );

  const handleSelectWorkspace = useCallback(
    (wsId: string) => {
      if (!workspaces.some((w) => w.id === wsId)) return;
      setActiveWorkspaceId(wsId);
      if (activeConversation?.workspaceId === wsId) return;
      const inWs = conversations.find((c) => (c.workspaceId || DEFAULT_WORKSPACE_ID) === wsId);
      if (inWs) {
        setActiveConversationId(inWs.id);
        setOpenTabIds((prev) => (prev.includes(inWs.id) ? prev : [...prev, inWs.id]));
      } else {
        const newConv = createEmptyConversation(activeRoute, activeModelId, wsId);
        setConversations((prev) => [newConv, ...prev]);
        setOpenTabIds((prev) => [...prev, newConv.id]);
        setActiveConversationId(newConv.id);
        saveConversationToDb(newConv).catch(() => undefined);
      }
    },
    [workspaces, activeConversation, conversations, activeRoute, activeModelId, baseUrl]
  );

  const handleCreateWorkspace = useCallback(
    (name: string) => {
      const clean = name.trim();
      if (!clean) return;
      const now = Date.now();
      const ws: Workspace = {
        id: makeId('ws'),
        name: clean,
        createdAt: now,
        updatedAt: now,
      };
      setWorkspaces((prev) => [...prev, ws]);
      setActiveWorkspaceId(ws.id);
      const newConv = createEmptyConversation(activeRoute, activeModelId, ws.id);
      setConversations((prev) => [newConv, ...prev]);
      setOpenTabIds((prev) => [...prev, newConv.id]);
      setActiveConversationId(newConv.id);
      saveConversationToDb(newConv).catch(() => undefined);
    },
    [activeRoute, activeModelId, baseUrl]
  );

  const handleCreateProjectInstant = useCallback(() => {
    const projectTitle = nextProjectName(workspaces);
    handleCreateWorkspace(projectTitle);
    setSidebarTab('chats');
  }, [workspaces, handleCreateWorkspace]);

  const handleRenameWorkspace = useCallback((wsId: string, name: string) => {
    const clean = name.trim();
    if (!clean) return;
    setWorkspaces((prev) =>
      prev.map((w) => (w.id === wsId ? { ...w, name: clean, updatedAt: Date.now() } : w))
    );
  }, []);

  const extractedArtifacts = useMemo(
    () => extractConversationArtifacts(conversations, workspaces),
    [conversations, workspaces]
  );

  const handleAddTask = useCallback(
    (label: string) => {
      const clean = label.trim();
      if (!clean) return;
      const task: WorkspaceTask = {
        id: makeId('task'),
        workspaceId: activeWorkspaceId || DEFAULT_WORKSPACE_ID,
        label: clean,
        done: false,
        createdAt: Date.now(),
      };
      setWorkspaceTasks((prev) => [task, ...prev]);
    },
    [activeWorkspaceId]
  );

  const handleToggleTask = useCallback((taskId: string) => {
    setWorkspaceTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, done: !t.done } : t))
    );
  }, []);

  const handleDeleteTask = useCallback((taskId: string) => {
    setWorkspaceTasks((prev) => prev.filter((t) => t.id !== taskId));
  }, []);


  const handleRenameConversation = useCallback(
    (id: string, nextTitle: string) => {
      const cleaned = nextTitle.trim();
      if (!cleaned) return;
      let updatedTarget: Conversation | null = null;
      setConversations((prev) =>
        prev.map((c) => {
          if (c.id !== id) return c;
          updatedTarget = { ...c, title: cleaned, updatedAt: Date.now() };
          return updatedTarget;
        })
      );
      if (updatedTarget) {
        saveConversationToDb(updatedTarget).catch(() => undefined);
      }
    },
    [baseUrl]
  );

  const handleCloseTab = useCallback(
    (id: string) => {
      setOpenTabIds((prev) => {
        const next = prev.filter((tabId) => tabId !== id);
        if (next.length === 0) {
          const fresh = createEmptyConversation(activeRoute, activeModelId);
          setConversations((cPrev) => [fresh, ...cPrev]);
          setActiveConversationId(fresh.id);
          saveConversationToDb(fresh).catch(() => undefined);
          return [fresh.id];
        }
        if (id === activeConversationId) {
          const idx = prev.indexOf(id);
          const fallbackId = next[Math.min(idx, next.length - 1)] || next[0];
          setActiveConversationId(fallbackId);
        }
        return next;
      });
    },
    [activeRoute, activeModelId, activeConversationId, baseUrl]
  );

  const handleReorderTabs = useCallback((sourceId: string, targetId: string) => {
    setOpenTabIds((prev) => reorderTabIds(prev, sourceId, targetId));
  }, []);

  const handleDeleteConversation = useCallback(
    (id: string) => {
      if (streamingConvId === id) {
        abortControllerRef.current?.abort();
        setStreamingConvId(null);
      }
      deleteConversationFromDb(id).catch(() => undefined);
      setOpenTabIds((prev) => prev.filter((tabId) => tabId !== id));
      setConversations((prev) => {
        const remaining = prev.filter((c) => c.id !== id);
        if (remaining.length === 0) {
          const fresh = createEmptyConversation(activeRoute, activeModelId);
          setActiveConversationId(fresh.id);
          setOpenTabIds([fresh.id]);
          return [fresh];
        }
        if (id === activeConversationId) {
          setActiveConversationId(remaining[0].id);
        }
        return remaining;
      });
    },
    [streamingConvId, activeRoute, activeModelId, activeConversationId]
  );

  const handleImportFromGateway = useCallback(async () => {
    if (isImporting) return;
    setIsImporting(true);
    try {
      const { conversations: synced } = await importFromGatewayDatabase(baseUrl);
      if (synced.length > 0) {
        for (const c of synced) {
          lastSavedSnapshotRef.current[c.id] = JSON.stringify(c);
        }
        setConversations(synced);
        setSidebarTab('chats');
        const current = synced.find((c) => c.id === activeConversationId);
        if (!current || current.messages.length === 0) {
          const preferred = synced.find((c) => c.messages.length > 0) ?? synced[0];
          setActiveConversationId(preferred.id);
          setOpenTabIds([preferred.id]);
        }
      }
    } catch (err) {
      setDiscoveryError(
        err instanceof Error ? err.message : 'Failed to sync gateway conversations.'
      );
    } finally {
      setIsImporting(false);
    }
  }, [isImporting, baseUrl, activeConversationId]);

  const handleAddImages = useCallback(async (files: FileList) => {
    const fileList = Array.from(files)
      .filter((f) => f.type.startsWith('image/'))
      .slice(0, 4);
    if (fileList.length === 0) return;

    const normalized = await Promise.all(
      fileList.map((file) => normalizeImageFile(file))
    );
    setPendingImages((prev) => [
      ...prev.slice(0, Math.max(0, 4 - normalized.length)),
      ...normalized.map((item) => ({
        id: makeId('img'),
        name: item.name,
        dataUrl: item.dataUrl,
      })),
    ]);
  }, []);

  const executeCompletion = useCallback(
    async (
      convId: string,
      historyForApi: ChatMessage[],
      assistantMsgId: string
    ) => {
      const targetConv = conversations.find((c) => c.id === convId);
      const route = targetConv?.route || activeRoute;
      const modelId = targetConv?.modelId || activeModelId;
      const baseSystemPrompt = targetConv?.systemPrompt || '';
      const systemPrompt = workspaceMemory.trim()
        ? `${baseSystemPrompt ? `${baseSystemPrompt}\n\n` : ''}[Workspace Memory]\n${workspaceMemory.trim()}`
        : baseSystemPrompt;
      const temperature = targetConv?.temperature ?? 0.7;
      const thinkingLevel = targetConv?.thinkingLevel || 'default';

      const routeInfoForConv = routeResults.find((r) => r.route === route);
      const modelInfoForConv = routeInfoForConv?.models.find((m) => m.id === modelId);
      const lastUserMsg = historyForApi[historyForApi.length - 1];
      const userImages = lastUserMsg?.images ?? [];

      const controller = new AbortController();
      abortControllerRef.current = controller;
      setStreamingConvId(convId);

      const finishWithUnderstanding = async () => {
        const imageDataUrl = userImages[0]?.dataUrl;
        if (!imageDataUrl) {
          throw new Error('No image found to send to the understanding route.');
        }

        const preferredPath =
          routeInfoForConv?.understandingRoutes?.image?.route ||
          fallbackUnderstandingRoutePath ||
          '/v1/images/understanding';

        const preferredIsV1 = preferredPath.startsWith('/v1/');
        const preferredModel =
          preferredIsV1 && modelInfoForConv?.supportsVision ? modelId : undefined;
        const fallbackPath = fallbackUnderstandingRoutePath || '/v1/images/understanding';

        logTerminal('POST', preferredPath, '···', 'image understanding fallback');
        const res = await runImageUnderstanding({
          baseUrl,
          routePath: preferredPath,
          fallbackRoutePath: fallbackPath !== preferredPath ? fallbackPath : undefined,
          prompt: buildUnderstandingPrompt(
            historyForApi.slice(0, -1),
            lastUserMsg?.content || ''
          ),
          imageDataUrl,
          modelId: preferredModel,
          timeoutMs: preferredIsV1 ? 45000 : 10000,
          signal: controller.signal,
        });

        const resolvedRoute = (res.fallback || preferredPath)
          .replace(/^\//, '')
          .split('/')[0];

        setStreamingConvId(null);
        updateConversation(convId, (c) => ({
          ...c,
          updatedAt: Date.now(),
          messages: c.messages.map((m) =>
            m.id === assistantMsgId
              ? {
                  ...m,
                  content: res.content,
                  reasoning: res.reasoning,
                  modelId: res.model || m.modelId,
                  provider: res.provider || m.provider,
                  fallback: res.fallback || m.fallback,
                  usage: res.usage,
                  route: resolvedRoute || m.route,
                  isStreaming: false,
                  error: undefined,
                }
              : m
          ),
        }));
      };

      try {
        const shouldUseUnderstandingDirectly =
          userImages.length > 0 &&
          (route !== 'v1' || !modelInfoForConv?.supportsVision);

        if (shouldUseUnderstandingDirectly) {
          await finishWithUnderstanding();
          return;
        }

        if (
          userImages.length === 0 &&
          shouldGenerateImageInChat(
            lastUserMsg?.content || '',
            discoveredImageModels.length > 0
          )
        ) {
          const imgModel = discoveredImageModels[0];
          const fallbackImgModel = discoveredImageModels[1]?.id;
          const cleanPrompt =
            lastUserMsg.content.replace(/^\/(imagem|image|img)\s+/i, '').trim() ||
            lastUserMsg.content;

          const generated = await generateGatewayImage({
            baseUrl,
            route: imgModel.route,
            action: 'generations',
            modelId: imgModel.id,
            fallbackModelId: fallbackImgModel,
            prompt: cleanPrompt,
            size: imgModel.sizes?.[0],
            signal: controller.signal,
          });

          setStreamingConvId(null);
          updateConversation(convId, (c) => ({
            ...c,
            updatedAt: Date.now(),
            messages: c.messages.map((m) =>
              m.id === assistantMsgId
                ? {
                    ...m,
                    content: generated.revisedPrompt || '',
                    generatedImages: [generated.imageDataUrl],
                    modelId: generated.model || imgModel.id,
                    fallback: generated.fallback,
                    route: imgModel.route,
                    isStreaming: false,
                    error: undefined,
                  }
                : m
            ),
          }));
          return;
        }

        let streamHadText = false;
        let streamErrorMsg: string | null = null;
        let streamFinishedCleanly = false;

        logTerminal('POST', `/${route}/chat/completions`, '···', `${modelId} · ${thinkingLevel}`);
        const streamT0 = Date.now();
        await streamChatCompletion(
          {
            baseUrl,
            route,
            modelId,
            messages: historyForApi,
            systemPrompt,
            temperature,
            thinkingLevel,
            sessionId: historyForApi.length > 1 ? targetConv?.sessionId : undefined,
            signal: controller.signal,
          },
          {
            onDelta(patch) {
              if (patch.contentDelta || patch.reasoningDelta) {
                streamHadText = true;
              }
              updateConversation(convId, (c) => ({
                ...c,
                sessionId: patch.sessionId || c.sessionId,
                updatedAt: Date.now(),
                messages: c.messages.map((m) =>
                  m.id === assistantMsgId ? applyStreamDeltaToMessage(m, patch) : m
                ),
              }));
            },
            onError(errorMsg) {
              streamErrorMsg = errorMsg;
            },
            onDone() {
              streamFinishedCleanly = true;
            },
          }
        );

        logTerminal(
          'POST',
          `/${route}/chat/completions`,
          streamErrorMsg ? 'ERR' : 200,
          streamErrorMsg || `${modelId} · ${(Date.now() - streamT0)}ms`,
          Date.now() - streamT0
        );

        if (controller.signal.aborted) {
          setStreamingConvId(null);
          updateConversation(convId, (c) => ({
            ...c,
            updatedAt: Date.now(),
            messages: c.messages.map((m) => {
              if (m.id !== assistantMsgId) return m;
              const empty = !m.content.trim() && !m.reasoning?.trim() && !m.error;
              return {
                ...m,
                isStreaming: false,
                content: empty ? '_Generation stopped._' : m.content,
              };
            }),
          }));
          return;
        }

        if (
          userImages.length > 0 &&
          (streamErrorMsg || (!streamHadText && streamFinishedCleanly))
        ) {
          await finishWithUnderstanding();
          return;
        }

        setStreamingConvId(null);
        updateConversation(convId, (c) => ({
          ...c,
          updatedAt: Date.now(),
          messages: c.messages.map((m) => {
            if (m.id !== assistantMsgId) return m;
            if (streamErrorMsg) {
              return { ...m, isStreaming: false, error: streamErrorMsg };
            }
            const empty = !m.content.trim() && !m.reasoning?.trim() && !m.error;
            return {
              ...m,
              isStreaming: false,
              error: empty ? 'The model ended the response with no content.' : m.error,
            };
          }),
        }));
      } catch (err) {
        setStreamingConvId(null);
        if (
          controller.signal.aborted ||
          (err instanceof DOMException && err.name === 'AbortError')
        ) {
          return;
        }
        updateConversation(convId, (c) => ({
          ...c,
          updatedAt: Date.now(),
          messages: c.messages.map((m) =>
            m.id === assistantMsgId
              ? {
                  ...m,
                  isStreaming: false,
                  error:
                    err instanceof Error
                      ? err.message
                      : 'Unexpected error during response.',
                }
              : m
          ),
        }));
      }
    },
    [
      conversations,
      activeRoute,
      activeModelId,
      workspaceMemory,
      baseUrl,
      routeResults,
      discoveredImageModels,
      fallbackUnderstandingRoutePath,
      updateConversation,
    ]
  );

  const handleSend = useCallback(
    async (overridePrompt?: string) => {
      if (!activeConversation || streamingConvId) return;
      if (!activeModelId) return;

      const text = (overridePrompt ?? composerInput).trim();
      const images = overridePrompt ? [] : pendingImages;
      if (!text && images.length === 0) return;

      setAnsiPulseCount((c) => c + 1);

      const userMsg: ChatMessage = {
        id: makeId('msg'),
        role: 'user',
        content: text || 'Describe and analyze this image in detail.',
        images: images.length > 0 ? images : undefined,
        createdAt: Date.now(),
      };

      const assistantMsgId = makeId('msg');
      const assistantPlaceholder: ChatMessage = {
        id: assistantMsgId,
        role: 'assistant',
        content: '',
        modelId: activeModelId,
        route: activeRoute,
        createdAt: Date.now(),
        isStreaming: true,
      };

      const nextMessages = [...activeConversation.messages, userMsg];
      const nextTitle =
        activeConversation.messages.length === 0
          ? deriveConversationTitle(text || 'Image analysis')
          : activeConversation.title;

      updateConversation(activeConversation.id, (c) => ({
        ...c,
        title: nextTitle,
        updatedAt: Date.now(),
        messages: [...nextMessages, assistantPlaceholder],
      }));

      if (!overridePrompt) {
        setComposerInput('');
        setPendingImages([]);
      }

      await executeCompletion(
        activeConversation.id,
        nextMessages,
        assistantMsgId
      );
    },
    [
      activeConversation,
      streamingConvId,
      activeModelId,
      activeRoute,
      composerInput,
      pendingImages,
      updateConversation,
      executeCompletion,
    ]
  );

  const handleStopStreaming = useCallback(() => {
    abortControllerRef.current?.abort();
    setStreamingConvId(null);
    if (activeConversation) {
      updateConversation(activeConversation.id, (c) => ({
        ...c,
        messages: c.messages.map((m) =>
          m.isStreaming ? { ...m, isStreaming: false } : m
        ),
      }));
    }
  }, [activeConversation, updateConversation]);

  const handleRetryLast = useCallback(async () => {
    if (!activeConversation || streamingConvId) return;
    const msgs = activeConversation.messages;
    if (msgs.length === 0) return;

    const lastUserIndex = [...msgs]
      .reverse()
      .findIndex((m) => m.role === 'user');
    if (lastUserIndex === -1) return;

    const cutIndex = msgs.length - 1 - lastUserIndex;
    const historyUpToUser = msgs.slice(0, cutIndex + 1);

    const assistantMsgId = makeId('msg');
    const assistantPlaceholder: ChatMessage = {
      id: assistantMsgId,
      role: 'assistant',
      content: '',
      modelId: activeModelId,
      route: activeRoute,
      createdAt: Date.now(),
      isStreaming: true,
    };

    updateConversation(activeConversation.id, (c) => ({
      ...c,
      updatedAt: Date.now(),
      messages: [...historyUpToUser, assistantPlaceholder],
    }));

    await executeCompletion(
      activeConversation.id,
      historyUpToUser,
      assistantMsgId
    );
  }, [
    activeConversation,
    streamingConvId,
    activeModelId,
    activeRoute,
    updateConversation,
    executeCompletion,
  ]);

  const handleContinueLast = useCallback(async () => {
    if (!activeConversation || streamingConvId) return;
    const msgs = activeConversation.messages;
    if (msgs.length === 0) return;
    const lastMsg = msgs[msgs.length - 1];
    if (lastMsg.role !== 'assistant' || !lastMsg.content.trim()) return;

    const controller = new AbortController();
    abortControllerRef.current = controller;
    setStreamingConvId(activeConversation.id);

    updateConversation(activeConversation.id, (c) => ({
      ...c,
      updatedAt: Date.now(),
      messages: c.messages.map((m) =>
        m.id === lastMsg.id ? { ...m, isStreaming: true, error: undefined } : m
      ),
    }));

    const continuationMessages: ChatMessage[] = [
      ...msgs.slice(0, -1),
      { ...lastMsg, error: undefined, isStreaming: false },
      {
        id: makeId('cont'),
        role: 'user',
        content:
          'Continue exactly from where the previous text stopped without repeating what was already written.',
        createdAt: Date.now(),
      },
    ];

    let streamErr: string | null = null;
    try {
      await streamChatCompletion(
        {
          baseUrl,
          route: lastMsg.route || activeRoute,
          modelId: lastMsg.modelId || activeModelId,
          messages: continuationMessages,
          systemPrompt: activeConversation.systemPrompt || '',
          temperature: activeConversation.temperature ?? 0.7,
          thinkingLevel: activeConversation.thinkingLevel || 'default',
          sessionId: activeConversation.sessionId,
          signal: controller.signal,
        },
        {
          onDelta(patch) {
            updateConversation(activeConversation.id, (c) => ({
              ...c,
              updatedAt: Date.now(),
              messages: c.messages.map((m) =>
                m.id === lastMsg.id ? applyStreamDeltaToMessage(m, patch) : m
              ),
            }));
          },
          onError(msg) {
            streamErr = msg;
          },
          onDone() {
            // handled after stream completes
          },
        }
      );
    } finally {
      setStreamingConvId(null);
      updateConversation(activeConversation.id, (c) => ({
        ...c,
        updatedAt: Date.now(),
        messages: c.messages.map((m) =>
          m.id === lastMsg.id
            ? { ...m, isStreaming: false, error: streamErr ?? m.error }
            : m
        ),
      }));
    }
  }, [
    activeConversation,
    streamingConvId,
    baseUrl,
    activeRoute,
    activeModelId,
    updateConversation,
  ]);

  const handleApplyBaseUrl = useCallback(
    (rawUrl: string) => {
      const normalized = normalizeBaseUrl(rawUrl);
      if (!normalized) return;
      if (normalized === baseUrl) {
        runDiscovery(normalized);
      } else {
        setBaseUrl(normalized);
      }
    },
    [baseUrl, runDiscovery]
  );


  const isStreaming = Boolean(streamingConvId);
  const isEmptyThread = (activeConversation?.messages.length || 0) === 0;

  const composerElement = (
    <Composer
      input={composerInput}
      onChangeInput={setComposerInput}
      images={pendingImages}
      onAddImages={handleAddImages}
      onRemoveImage={(id) =>
        setPendingImages((prev) => prev.filter((img) => img.id !== id))
      }
      onSend={() => handleSend()}
      onStop={handleStopStreaming}
      isStreaming={isStreaming}
      activeRoute={activeRoute}
      activeModel={activeModel}
      activeModelId={activeModelId}
      discoveredModels={discoveredModels}
      routeResults={routeResults}
      onSelectModel={handleSelectModel}
      workspaces={workspaces}
      activeWorkspaceId={activeWorkspaceId}
      onSelectWorkspace={handleSelectWorkspace}
      onCreateWorkspace={handleCreateWorkspace}
      onNewSessionInWorkspace={(wsId) => handleNewConversation(wsId)}
      activeSessionTitle={activeConversation?.title}
      permissionMode={permissionMode}
      onChangePermissionMode={setPermissionMode}
      temperature={activeConversation?.temperature ?? 0.7}
      onChangeTemperature={(val) =>
        activeConversation &&
        updateConversation(activeConversation.id, (c) => ({
          ...c,
          temperature: val,
        }))
      }
      thinkingLevel={activeConversation?.thinkingLevel || 'default'}
      thinkingLevels={resolvedThinkingLevels}
      onChangeThinkingLevel={(val) =>
        activeConversation &&
        updateConversation(activeConversation.id, (c) => ({
          ...c,
          thinkingLevel: val,
        }))
      }
      centered={isEmptyThread}
      attachSignal={attachSignal}
      focusSignal={focusSignal}
    />
  );

  const handleToggleTheme = () => {
    setTheme((t) => (t === 'dark' ? 'light' : 'dark'));
    setAnsiPulseCount((c) => c + 1);
  };

  const handleTogglePinConversation = useCallback((convId: string) => {
    setPinnedConvIds((prev) =>
      prev.includes(convId) ? prev.filter((id) => id !== convId) : [convId, ...prev]
    );
  }, []);

  const handleExportMarkdown = useCallback(() => {
    if (!activeConversation || activeConversation.messages.length === 0) return;
    const md = formatConversationMarkdown(
      activeConversation.title,
      activeConversation.route,
      activeConversation.modelId,
      activeConversation.messages
    );
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const slug = (activeConversation.title || 'chat')
      .toLowerCase()
      .replace(/[^a-z0-9]+/gi, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 40);
    a.download = `${slug || 'chat'}.md`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }, [activeConversation]);

  const zoomViewportStyle = useMemo(
    () => computeZoomViewportStyle(DEFAULT_UI_ZOOM),
    []
  );

  const handleSyncAll = useCallback(() => {
    runDiscovery(baseUrl);
    handleImportFromGateway();
  }, [baseUrl, runDiscovery, handleImportFromGateway]);

  const handleRailSection = (tab: SidebarTab) => {
    if (sidebarOpen && sidebarTab === tab) {
      setSidebarOpen(false);
    } else {
      setSidebarTab(tab);
      setSidebarOpen(true);
    }
  };

  const handleGoHomeOrNewChat = () => {
    setSidebarOpen(true);
    setSidebarTab('chats');
    const existingEmpty = openTabs.find(
      (tTab) =>
        tTab.messages.length === 0 &&
        (tTab.workspaceId || DEFAULT_WORKSPACE_ID) === activeWorkspaceId
    );
    if (existingEmpty) {
      setActiveConversationId(existingEmpty.id);
      setComposerInput('');
      setPendingImages([]);
      setAnsiPulseCount((c) => c + 1);
    } else {
      handleNewConversation(activeWorkspaceId);
    }
  };

  const handleToggleSearch = () => {
    if (!sidebarOpen) {
      setSidebarOpen(true);
      setSidebarSearchOpen(true);
      setSearchFocusSignal((n) => n + 1);
      return;
    }
    setSidebarSearchOpen((prev) => {
      const next = !prev;
      if (next) {
        setSearchFocusSignal((n) => n + 1);
      }
      return next;
    });
  };

  const handleToggleSidebarSearch = useCallback(() => {
    setSidebarSearchOpen((prev) => {
      const next = !prev;
      if (next) {
        setSearchFocusSignal((n) => n + 1);
      }
      return next;
    });
  }, []);

  const handleChangeRailDockEdge = useCallback((edge: SaddleDockEdge) => {
    setRailMode('saddle');
    setRailDockEdge(edge);
    setRailPos(null);
  }, []);

  const handleSelectRailMode = useCallback(
    (mode: RailMode) => {
      setRailMode(mode);
      if (mode === 'floating') {
        const viewW = shellRef.current?.offsetWidth || 1200;
        const viewH = shellRef.current?.offsetHeight || 760;
        setRailPos((prev) => {
          if (
            !prev ||
            prev.y < 56 ||
            prev.y > viewH - 56 ||
            prev.x < 12 ||
            prev.x > viewW - 12
          ) {
            return { x: 28, y: Math.round(viewH * 0.54) };
          }
          return prev;
        });
      }
    },
    []
  );

  const effectiveSidebarWidth =
    dragPreviewWidth !== null ? dragPreviewWidth : sidebarWidth;
  const isFullFloatingRail = isDesktop && railMode === 'full-floating';
  const isFloatingQuad = isDesktop && floatingSidebar;
  const framePad = isFloatingQuad ? 10 : 8;
  const railPadLeft = isFullFloatingRail ? 50 + framePad * 2 : framePad;
  const railPadRight = framePad;

  const railNode = (
    <OmniSaddleRail
      containerRef={shellRef}
      railMode={railMode}
      onChangeRailMode={handleSelectRailMode}
      dockEdge={railDockEdge}
      onChangeDockEdge={handleChangeRailDockEdge}
      railPos={railPos}
      onChangeRailPos={setRailPos}
      sidebarOpen={sidebarOpen}
      floatingSidebar={floatingSidebar}
      sidebarTab={sidebarTab}
      inspectorOpen={inspectorOpen}
      isEmptyThread={isEmptyThread}
      isSyncDisabled={isDiscovering || isImporting}
      isSyncSpinning={isDiscovering || isImporting}
      theme={theme}
      onGoHomeOrNewChat={handleGoHomeOrNewChat}
      onToggleSection={handleRailSection}
      onOpenEndpoints={() => setInspectorOpen(true)}
      onOpenKeys={() => navigate("/sessions")}
      onOpenDashboard={() => navigate("/versions")}
      terminalOpen={terminalOpen}
      onToggleTerminal={() => setTerminalOpen((t) => !t)}
      onSyncAll={handleSyncAll}
      onToggleTheme={handleToggleTheme}
    />
  );

  return (
    <>
      {/* 3D Intro Overlay outside zoomed desktop-shell so zero transform/frame clips it */}
      <IntroAnimation
        visible={showIntro}
        darkMode={theme === 'dark'}
        onComplete={() => setShowIntro(false)}
      />

      <div className="studio3-viewport">
      <div
        ref={shellRef}
        className="desktop-shell"
        style={zoomViewportStyle}
        data-ui-zoom={DEFAULT_UI_ZOOM}
        data-effort-tier={effortChroma.tier}
        data-effort-max={effortChroma.isMax ? 'true' : 'false'}
        data-fx-ansi={ansiEnabled ? 'true' : 'false'}
        data-fx-glow={glowEnabled ? 'true' : 'false'}
        data-fx-blur={blurEnabled ? 'true' : 'false'}
        data-fx-transparency={transparencyEnabled ? 'true' : 'false'}
        data-testid="desktop-shell"
      >
        {/* Modalities: Full-Height Docked Left / 4-Edge Saddle / Unconstrained Floating Capsule */}
        {!isFullFloatingRail && railNode}

        <div className="flex flex-1 flex-col min-w-0 min-h-0">
          <TopBar
            sidebarOpen={sidebarOpen}
            isDesktop={isDesktop}
            effectiveSidebarWidth={effectiveSidebarWidth}
            isResizingSidebar={isResizingSidebar}
            floatingSidebar={floatingSidebar}
            searchOpen={sidebarSearchOpen}
            railPadLeft={railPadLeft}
            railPadRight={railPadRight}
            onToggleSidebar={() => setSidebarOpen((v) => !v)}
            onToggleSearch={handleToggleSearch}
            openTabs={openTabs}
            workspaces={workspaces}
            activeConversationId={activeConversation?.id || ''}
            streamingConvId={streamingConvId}
            onSelectTab={handleSelectConversation}
            onCloseTab={handleCloseTab}
            onNewTab={() => handleNewConversation(activeWorkspaceId)}
            onRenameTab={handleRenameConversation}
            onReorderTabs={handleReorderTabs}
            onReplayIntro={() => setShowIntro(true)}
          />

          <div
            className="relative z-10 flex flex-1 min-h-0 overflow-hidden max-lg:px-1.5 max-lg:pb-1.5"
            style={
              isDesktop
                ? {
                    paddingLeft: `${framePad}px`,
                    paddingRight: `${framePad}px`,
                    paddingBottom: `${framePad}px`,
                    gap: isFullFloatingRail ? `${framePad}px` : undefined,
                  }
                : undefined
            }
          >
            {/* Modality 2: Full-Floating Frosted Bar (matches Expandable Box top & bottom 1:1) */}
            {isFullFloatingRail && railNode}

            {/* Docked Unified Workspace Frame OR Detached Frosted Sidebar + Detached Main Stage */}
            <div
              className={isFloatingQuad ? 'workspace-frame-floating' : 'workspace-frame'}
              data-testid="workspace-frame"
            >
              <Sidebar
                isOpen={sidebarOpen}
                isDesktop={isDesktop}
                sidebarWidth={sidebarWidth}
                onChangeSidebarWidth={(nextW) => setSidebarWidth(clampSidebarWidth(nextW))}
                dragPreviewWidth={dragPreviewWidth}
                isResizing={isResizingSidebar}
                onResizePointerDown={handleResizePointerDown}
                railMode={railMode}
                onChangeRailMode={handleSelectRailMode}
                railDockEdge={railDockEdge}
                onChangeRailDockEdge={handleChangeRailDockEdge}
                floatingSidebar={floatingSidebar}
                onChangeFloatingSidebar={setFloatingSidebar}
                searchOpen={sidebarSearchOpen}
                onToggleSearchOpen={handleToggleSidebarSearch}
                ansiEnabled={ansiEnabled}
                onToggleAnsiEnabled={() => setAnsiEnabled((v) => !v)}
                glowEnabled={glowEnabled}
                onToggleGlowEnabled={() => setGlowEnabled((v) => !v)}
                blurEnabled={blurEnabled}
                onToggleBlurEnabled={() => setBlurEnabled((v) => !v)}
                transparencyEnabled={transparencyEnabled}
                onToggleTransparencyEnabled={() => setTransparencyEnabled((v) => !v)}
                autoScrollEnabled={autoScrollEnabled}
                onToggleAutoScrollEnabled={() => setAutoScrollEnabled((v) => !v)}
                onCloseMobile={() => {
                  if (window.innerWidth < 1024) {
                    setSidebarOpen(false);
                  }
                }}
                activeTab={sidebarTab}
                onTabChange={setSidebarTab}
                workspaces={workspaces}
                activeWorkspaceId={activeWorkspaceId}
                onSelectWorkspace={handleSelectWorkspace}
                onCreateWorkspace={handleCreateWorkspace}
                onCreateProjectInstant={handleCreateProjectInstant}
                onRenameWorkspace={handleRenameWorkspace}
                conversations={conversations}
                pinnedConvIds={pinnedConvIds}
                onTogglePinConversation={handleTogglePinConversation}
                activeConversationId={activeConversation?.id || ''}
                onSelectConversation={handleSelectConversation}
                onNewConversation={handleNewConversation}
                onRenameConversation={handleRenameConversation}
                onDeleteConversation={handleDeleteConversation}
                artifacts={extractedArtifacts}
                onSelectArtifactConversation={(convId) => {
                  handleSelectConversation(convId);
                  setSidebarTab('chats');
                }}
                tasks={workspaceTasks}
                onAddTask={handleAddTask}
                onToggleTask={handleToggleTask}
                onDeleteTask={handleDeleteTask}
                searchFocusSignal={searchFocusSignal}
                routeResults={routeResults}
                discoveredModels={discoveredModels}
                isDiscovering={isDiscovering}
                onSyncAll={handleSyncAll}
                isSyncing={isImporting}
                baseUrl={baseUrl}
                onApplyBaseUrl={handleApplyBaseUrl}
                activeRoute={activeRoute}
                activeModelId={activeModelId}
                onSelectModel={handleSelectModel}
                inspectorOpen={inspectorOpen}
                onOpenInspector={() => setInspectorOpen(true)}
                theme={theme}
                onToggleTheme={handleToggleTheme}
                systemPrompt={activeConversation?.systemPrompt || ''}
                onChangeSystemPrompt={(val) =>
                  activeConversation &&
                  updateConversation(activeConversation.id, (c) => ({
                    ...c,
                    systemPrompt: val,
                  }))
                }
                temperature={activeConversation?.temperature ?? 0.7}
                onChangeTemperature={(val) =>
                  activeConversation &&
                  updateConversation(activeConversation.id, (c) => ({
                    ...c,
                    temperature: val,
                  }))
                }
                thinkingLevel={activeConversation?.thinkingLevel || 'default'}
                onChangeThinkingLevel={(val) =>
                  activeConversation &&
                  updateConversation(activeConversation.id, (c) => ({
                    ...c,
                    thinkingLevel: val,
                  }))
                }
                thinkingLevels={resolvedThinkingLevels}
                onResetParams={() =>
                  activeConversation &&
                  updateConversation(activeConversation.id, (c) => ({
                    ...c,
                    systemPrompt: '',
                    temperature: 0.7,
                    thinkingLevel: 'default',
                  }))
                }
                workspaceMemory={workspaceMemory}
                onChangeWorkspaceMemory={setWorkspaceMemory}
                userDisplayName={userDisplayName}
                onChangeUserDisplayName={setUserDisplayName}
              />

              <main
                className={`${
                  isFloatingQuad
                    ? 'main-stage-floating '
                    : sidebarOpen
                      ? 'rounded-r-[10px] rounded-l-none '
                      : 'rounded-[10px] '
                }relative z-0 flex min-w-0 flex-1 flex-col overflow-hidden`}
              >

                {discoveryError && (
                  <div className="border-b border-red-500/30 bg-red-500/10 px-4 py-2 text-xs text-[var(--dk-danger)] flex items-center justify-between gap-3 shrink-0">
                    <span>{discoveryError}</span>
                    <button
                      type="button"
                      onClick={() => runDiscovery(baseUrl)}
                      className="font-semibold underline cursor-pointer shrink-0"
                    >
                      Try again
                    </button>
                  </div>
                )}

                <ChatThread
                  messages={activeConversation?.messages || []}
                  activeConversationId={activeConversation?.id}
                  sidebarOpen={sidebarOpen}
                  onExpandSidebar={() => setSidebarOpen(true)}
                  activeRoute={activeRoute}
                  routeResults={routeResults}
                  onRetryLast={handleRetryLast}
                  onContinueLast={handleContinueLast}
                  onSelectFallbackRoute={handleSelectFallbackRoute}
                  onQuickPrompt={(prompt) => handleSend(prompt)}
                  onTriggerAttachImage={() => setAttachSignal((n) => n + 1)}
                  onPrefillImagePrompt={() => {
                    setComposerInput((prev) =>
                      /^\/(imagem|image|img)\b/i.test(prev.trim())
                        ? prev
                        : `/image ${prev}`.trimStart()
                    );
                    setFocusSignal((n) => n + 1);
                  }}
                  onOpenParams={() => {
                    setSidebarTab('params');
                    setSidebarOpen(true);
                  }}
                  onExportMarkdown={handleExportMarkdown}
                  centeredComposer={isEmptyThread ? composerElement : undefined}
                  darkMode={theme === 'dark'}
                  ansiPulseCount={ansiPulseCount}
                  ansiEnabled={ansiEnabled}
                  autoScrollEnabled={autoScrollEnabled}
                  engineMode={pendingImages.length === 0}
                  effortTier={effortChroma.tier}
                />

                {!isEmptyThread && composerElement}
              </main>
            </div>
          </div>
        </div>

      <ModelInspectorModal
          isOpen={inspectorOpen}
          onClose={() => setInspectorOpen(false)}
          baseUrl={baseUrl}
          onApplyBaseUrl={handleApplyBaseUrl}
          routeResults={routeResults}
          isDiscovering={isDiscovering}
          onSelectModel={handleSelectModel}
          activeRoute={activeRoute}
          activeModelId={activeModelId}
        />
      </div>

      {/* the live terminal request log of every gateway call */}
      <TerminalDrawer
        open={terminalOpen}
        onClose={() => setTerminalOpen(false)}
        lines={terminalLog}
      />
      </div>
    </>
  );
}

/** the studio anchor: the interface 18 desktop inside the gtx language
 *  provider (the runtime translation lane of the surface). */
export default function Studio() {
  return (
    <GtxLanguageProvider>
      <AppContent />
    </GtxLanguageProvider>
  );
}

