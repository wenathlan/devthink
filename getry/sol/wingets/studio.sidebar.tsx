import { useEffect, useMemo, useRef, useState, type KeyboardEvent, type PointerEvent as ReactPointerEvent } from 'react';
import { formatCompactTokens } from '../../studio.client';
import type {
  Conversation,
  DiscoveredModel,
  RouteDiscoveryResult,
  RouteName,
  Workspace
} from '../../studio.client';
import {
  CountryFlag,
  FluentArrowSync,
  FluentBoxDocked,
  FluentBoxFloating,
  FluentBrain,
  FluentCanvasBg,
  FluentChartBar,
  FluentChat,
  FluentCheck,
  FluentChecklist,
  FluentChevronDown,
  FluentChevronLeft,
  FluentChevronRight,
  FluentCode,
  FluentCopy,
  FluentDelete,
  FluentDismiss,
  FluentDockBottom,
  FluentDockLeft,
  FluentDockRight,
  FluentDockTop,
  FluentEdit,
  FluentEye,
  FluentFloatDock,
  FluentFloatPanel,
  FluentFolder,
  FluentFxBlur,
  FluentFxGlow,
  FluentFxPalette,
  FluentFxTransparency,
  FluentGlobe,
  FluentLayers,
  FluentModel,
  FluentMoon,
  FluentPanelWidth,
  FluentPerson,
  FluentPin,
  FluentPlus,
  FluentRailFloating,
  FluentRailFull,
  FluentRailFullFloat,
  FluentRailSaddle,
  FluentScrollText,
  FluentSearch,
  FluentSettings,
  FluentSliders,
  FluentSun,
  FluentTerminal,
  FluentWand,
  FluentWorkspaceAdd,
  NewChatMorphLogo,
} from './studio.icons';
import { TranslucentEffortSpectrum, TranslucentMeterSlider } from './studio.sliders';
import { SUPPORTED_LANGUAGES, useGtxLanguage } from '../../studio.gtx';
import type { ExtractedArtifact, WorkspaceTask } from '../../studio.artifacts';
import {
  computeUsageStatistics,
  formatEffortDynamicLabel,
  groupSessionsByWorkspace,
  MAX_SIDEBAR_WIDTH,
  MIN_SIDEBAR_WIDTH,
  sortConversationsWithPins,
  type RailMode,
  type SaddleDockEdge,
} from '../../studio.uiprefs';

export type SidebarTab = 'chats' | 'artifacts' | 'tasks' | 'models' | 'params' | 'settings';

type SettingsSectionId =
  | 'appearance'
  | 'language'
  | 'gateway'
  | 'personalization'
  | 'memory'
  | 'stats';

function AnimatedLetters({
  text,
  className = '',
}: {
  text: string;
  delayStep?: number;
  className?: string;
}) {
  return (
    <span key={text} className={`dt-empty-hero-enter inline-block ${className}`}>
      {text}
    </span>
  );
}

interface SettingsMenuItem {
  id: SettingsSectionId;
  groupKey: 'general' | 'capabilities' | 'data';
  group: string;
  label: string;
  keywords: string;
  Icon: typeof FluentSettings;
}



interface SidebarProps {
  isOpen: boolean;
  isDesktop: boolean;
  sidebarWidth: number;
  onChangeSidebarWidth: (nextWidth: number) => void;
  dragPreviewWidth: number | null;
  isResizing: boolean;
  onResizePointerDown: (e: ReactPointerEvent<HTMLDivElement>) => void;
  railMode: RailMode;
  onChangeRailMode: (mode: RailMode) => void;
  railDockEdge: SaddleDockEdge;
  onChangeRailDockEdge: (edge: SaddleDockEdge) => void;
  floatingSidebar: boolean;
  onChangeFloatingSidebar: (floating: boolean) => void;
  searchOpen: boolean;
  onToggleSearchOpen: () => void;
  ansiEnabled: boolean;
  onToggleAnsiEnabled: () => void;
  glowEnabled: boolean;
  onToggleGlowEnabled: () => void;
  blurEnabled: boolean;
  onToggleBlurEnabled: () => void;
  transparencyEnabled: boolean;
  onToggleTransparencyEnabled: () => void;
  autoScrollEnabled: boolean;
  onToggleAutoScrollEnabled: () => void;
  onCloseMobile: () => void;
  activeTab: SidebarTab;
  onTabChange: (tab: SidebarTab) => void;
  workspaces: Workspace[];
  activeWorkspaceId: string;
  onSelectWorkspace: (workspaceId: string) => void;
  onCreateWorkspace: (name: string) => void;
  onCreateProjectInstant: () => void;
  onRenameWorkspace: (workspaceId: string, name: string) => void;
  conversations: Conversation[];
  pinnedConvIds: string[];
  onTogglePinConversation: (id: string) => void;
  activeConversationId: string;
  onSelectConversation: (id: string) => void;
  onNewConversation: (workspaceId?: string) => void;
  onRenameConversation: (id: string, title: string) => void;
  onDeleteConversation: (id: string) => void;
  artifacts: ExtractedArtifact[];
  onSelectArtifactConversation: (conversationId: string) => void;
  tasks: WorkspaceTask[];
  onAddTask: (label: string) => void;
  onToggleTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  searchFocusSignal?: number;
  routeResults: RouteDiscoveryResult[];
  discoveredModels: DiscoveredModel[];
  isDiscovering: boolean;
  onSyncAll: () => void;
  isSyncing?: boolean;
  baseUrl: string;
  onApplyBaseUrl: (url: string) => void;
  activeRoute: RouteName;
  activeModelId: string;
  onSelectModel: (route: RouteName, modelId: string) => void;
  inspectorOpen: boolean;
  onOpenInspector: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  systemPrompt: string;
  onChangeSystemPrompt: (val: string) => void;
  temperature: number;
  onChangeTemperature: (val: number) => void;
  thinkingLevel: string;
  onChangeThinkingLevel: (val: string) => void;
  thinkingLevels: Record<string, number>;
  onResetParams: () => void;
  workspaceMemory: string;
  onChangeWorkspaceMemory: (val: string) => void;
  userDisplayName: string;
  onChangeUserDisplayName: (val: string) => void;
}

export function Sidebar({
  isOpen,
  isDesktop,
  sidebarWidth,
  onChangeSidebarWidth,
  dragPreviewWidth,
  isResizing,
  onResizePointerDown,
  railMode,
  onChangeRailMode,
  railDockEdge,
  onChangeRailDockEdge,
  floatingSidebar,
  onChangeFloatingSidebar,
  searchOpen,
  onToggleSearchOpen,
  ansiEnabled,
  onToggleAnsiEnabled,
  glowEnabled,
  onToggleGlowEnabled,
  blurEnabled,
  onToggleBlurEnabled,
  transparencyEnabled,
  onToggleTransparencyEnabled,
  autoScrollEnabled,
  onToggleAutoScrollEnabled,
  onCloseMobile,
  activeTab,
  onTabChange,
  workspaces,
  activeWorkspaceId,
  onSelectWorkspace,
  onCreateWorkspace,
  onCreateProjectInstant,
  onRenameWorkspace,
  conversations,
  pinnedConvIds,
  onTogglePinConversation,
  activeConversationId,
  onSelectConversation,
  onNewConversation,
  onRenameConversation,
  onDeleteConversation,
  artifacts,
  onSelectArtifactConversation,
  tasks,
  onAddTask,
  onToggleTask,
  onDeleteTask,
  searchFocusSignal,
  routeResults,
  isDiscovering,
  discoveredModels,
  onSyncAll,
  isSyncing,
  baseUrl,
  onApplyBaseUrl,
  activeRoute,
  activeModelId,
  onSelectModel,
  inspectorOpen,
  onOpenInspector,
  theme,
  onToggleTheme,
  systemPrompt,
  onChangeSystemPrompt,
  temperature,
  onChangeTemperature,
  thinkingLevel,
  onChangeThinkingLevel,
  thinkingLevels,
  onResetParams,
  workspaceMemory,
  onChangeWorkspaceMemory,
  userDisplayName,
  onChangeUserDisplayName,
}: SidebarProps) {
  const { lang, isTranslating, setLanguage, formatConversationTitle } = useGtxLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [capabilityFilter, setCapabilityFilter] = useState<'all' | 'vision' | 'image'>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [editingWorkspaceId, setEditingWorkspaceId] = useState<string | null>(null);
  const [editingWorkspaceName, setEditingWorkspaceName] = useState('');
  const [creatingWorkspace, setCreatingWorkspace] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const [collapsedWorkspaces, setCollapsedWorkspaces] = useState<Record<string, boolean>>({});
  const [settingsSection, setSettingsSection] = useState<SettingsSectionId | null>(null);
  const [gatewayDraft, setGatewayDraft] = useState(baseUrl);
  const [activeHintKey, setActiveHintKey] = useState<string | null>(null);
  const [newTaskText, setNewTaskText] = useState('');
  const [copiedArtifactId, setCopiedArtifactId] = useState<string | null>(null);
  const topSearchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!searchFocusSignal || !searchOpen) return;
    const raf = requestAnimationFrame(() => {
      topSearchInputRef.current?.focus();
    });
    return () => cancelAnimationFrame(raf);
  }, [searchFocusSignal, searchOpen]);

  const systemPresets = useMemo(
    () => [
      {
        id: 'direct',
        label: 'Direct',
        prompt: 'Respond objectively, step by step, without fluff.',
      },
      {
        id: 'didactic',
        label: 'Didactic',
        prompt: 'Explain clearly with structured sections and practical examples.',
      },
      {
        id: 'review',
        label: 'Critical',
        prompt: 'Identify risks, bottlenecks, edge cases, and suggest concrete improvements.',
      },
    ],
    []
  );

  const settingsMenuItems = useMemo<SettingsMenuItem[]>(
    () => [
      {
        id: 'appearance',
        groupKey: 'general',
        group: 'General',
        label: 'Appearance',
        keywords: 'appearance aparencia floating rail panel width effects ansi glow blur transparency scroll',
        Icon: FluentCanvasBg,
      },
      {
        id: 'language',
        groupKey: 'general',
        group: 'General',
        label: 'Language',
        keywords: 'language idioma lingua country flag english portugues espanol francais deutsch japanese',
        Icon: FluentGlobe,
      },
      {
        id: 'gateway',
        groupKey: 'general',
        group: 'General',
        label: 'Gateway',
        keywords: 'gateway url connection endpoint',
        Icon: FluentTerminal,
      },
      {
        id: 'personalization',
        groupKey: 'capabilities',
        group: 'Capabilities',
        label: 'Personalization',
        keywords: 'personalization personalizacao profile name',
        Icon: FluentPerson,
      },
      {
        id: 'memory',
        groupKey: 'capabilities',
        group: 'Capabilities',
        label: 'Memory',
        keywords: 'memory memoria context persistent notes workspace',
        Icon: FluentBrain,
      },
      {
        id: 'stats',
        groupKey: 'data',
        group: 'Data',
        label: 'Statistics',
        keywords: 'stats statistics estatisticas usage tokens messages sessions workspaces',
        Icon: FluentChartBar,
      },
    ],
    []
  );

  const startRename = (conv: Conversation) => {
    setEditingId(conv.id);
    setEditingTitle(formatConversationTitle(conv.title));
  };

  const commitRename = () => {
    if (!editingId) return;
    const trimmed = editingTitle.trim();
    if (trimmed) {
      onRenameConversation(editingId, trimmed);
    }
    setEditingId(null);
  };

  const handleRenameKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      commitRename();
    } else if (e.key === 'Escape') {
      setEditingId(null);
    }
  };

  const handleCreateWorkspaceSubmit = () => {
    const trimmed = newWorkspaceName.trim();
    if (!trimmed) return;
    onCreateWorkspace(trimmed);
    setNewWorkspaceName('');
    setCreatingWorkspace(false);
  };

  const commitWorkspaceRename = () => {
    if (!editingWorkspaceId) return;
    const trimmed = editingWorkspaceName.trim();
    if (trimmed) {
      onRenameWorkspace(editingWorkspaceId, trimmed);
    }
    setEditingWorkspaceId(null);
  };

  const imageModelIds = useMemo(
    () =>
      new Set(
        routeResults.flatMap((r) =>
          (r.imageModels || []).map((im) => im.id.toLowerCase())
        )
      ),
    [routeResults]
  );

  const isImageModel = (m: DiscoveredModel) =>
    imageModelIds.has(m.id.toLowerCase()) ||
    Boolean(m.modalities?.output?.includes('image'));

  const activeQuery = searchQuery.trim().toLowerCase();

  const filteredModels = useMemo(() => {
    return discoveredModels.filter((m) => {
      if (capabilityFilter === 'vision' && !m.supportsVision) return false;
      if (capabilityFilter === 'image' && !isImageModel(m)) return false;
      if (!activeQuery) return true;
      return m.id.toLowerCase().includes(activeQuery);
    });
  }, [discoveredModels, activeQuery, capabilityFilter, imageModelIds]);

  const orderedConversations = useMemo(
    () => sortConversationsWithPins(conversations, pinnedConvIds),
    [conversations, pinnedConvIds]
  );

  const filteredConversations = useMemo(() => {
    if (!activeQuery) return orderedConversations;
    return orderedConversations.filter(
      (c) =>
        c.title.toLowerCase().includes(activeQuery) ||
        c.modelId.toLowerCase().includes(activeQuery)
    );
  }, [orderedConversations, activeQuery]);

  const filteredArtifacts = useMemo(() => {
    if (!activeQuery) return artifacts;
    return artifacts.filter(
      (a) =>
        a.title.toLowerCase().includes(activeQuery) ||
        a.tag.toLowerCase().includes(activeQuery) ||
        a.workspaceName.toLowerCase().includes(activeQuery)
    );
  }, [artifacts, activeQuery]);

  const filteredTasks = useMemo(() => {
    if (!activeQuery) return tasks;
    return tasks.filter((t) => t.label.toLowerCase().includes(activeQuery));
  }, [tasks, activeQuery]);

  const pinnedSet = useMemo(() => new Set(pinnedConvIds), [pinnedConvIds]);

  const pinnedConversations = useMemo(
    () => filteredConversations.filter((c) => pinnedSet.has(c.id)),
    [filteredConversations, pinnedSet]
  );

  const unpinnedConversations = useMemo(
    () => filteredConversations.filter((c) => !pinnedSet.has(c.id)),
    [filteredConversations, pinnedSet]
  );

  const workspaceGroups = useMemo(
    () =>
      groupSessionsByWorkspace(
        workspaces,
        unpinnedConversations,
        activeWorkspaceId || workspaces[0]?.id || 'ws_default'
      ),
    [workspaces, unpinnedConversations, activeWorkspaceId]
  );

  const usageStats = useMemo(
    () => computeUsageStatistics(workspaces, conversations),
    [workspaces, conversations]
  );

  const filteredSettingsItems = useMemo(() => {
    if (!activeQuery) return settingsMenuItems;
    return settingsMenuItems.filter(
      (item) =>
        item.label.toLowerCase().includes(activeQuery) ||
        item.group.toLowerCase().includes(activeQuery) ||
        item.keywords.includes(activeQuery)
    );
  }, [activeQuery, settingsMenuItems]);

  const showDesktopPreview = isDesktop && dragPreviewWidth !== null && dragPreviewWidth > 0;
  const visibleOnDesktop = isOpen || showDesktopPreview;
  const effectiveDesktopWidth =
    dragPreviewWidth !== null ? dragPreviewWidth : sidebarWidth;

  const sectionTitle =
    activeTab === 'chats'
      ? 'Sessions'
      : activeTab === 'artifacts'
        ? 'Artifacts'
        : activeTab === 'tasks'
          ? 'Tasks'
          : activeTab === 'models'
            ? 'Models'
            : activeTab === 'params'
              ? 'Parameters'
              : 'Settings';

  const openTasksCount = useMemo(
    () => tasks.filter((t) => !t.done).length,
    [tasks]
  );

  const handleTaskSubmit = () => {
    const trimmed = newTaskText.trim();
    if (!trimmed) return;
    onAddTask(trimmed);
    setNewTaskText('');
  };

  const thinkingOptions = Object.keys(thinkingLevels);
  const allThinkingKeys = ['default', ...thinkingOptions];
  const tempToneLabel =
    temperature <= 0.3
      ? 'Precise'
      : temperature <= 0.9
        ? 'Balanced'
        : 'Creative';

  const activeWorkspaceName =
    workspaces.find((w) => w.id === activeWorkspaceId)?.name || workspaces[0]?.name || 'Workspace';
  const profileLabel = userDisplayName.trim() || activeWorkspaceName;
  const initials =
    profileLabel
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase() || '')
      .join('') || 'W';

  const renderConversationRow = (conv: Conversation) => {
    const isActive = conv.id === activeConversationId;
    const isEditing = editingId === conv.id;
    const isPinned = pinnedSet.has(conv.id);
    const isEmptyChat = conv.messages.length === 0;
    const displayTitle = formatConversationTitle(conv.title);
    return (
      <div
        key={conv.id}
        className={`sidebar-thread group ${isActive ? 'active' : ''}`}
      >
        {isEmptyChat ? (
          <NewChatMorphLogo className="h-3.5 w-3.5 opacity-75" />
        ) : (
          <FluentChat className="h-3.5 w-3.5 shrink-0 opacity-50" />
        )}
        {isEditing ? (
            <input
              type="text"
              value={editingTitle}
              onChange={(e) => setEditingTitle(e.target.value)}
              onBlur={commitRename}
              onKeyDown={handleRenameKey}
              onClick={(e) => e.stopPropagation()}
              // biome-ignore lint/a11y/noAutofocus: the rename input answers ready to type — the inline edit the row opens exists to type into immediately
              autoFocus
              aria-label="Rename session"
              data-testid={`rename-input-${conv.id}`}
              className="min-w-0 flex-1 rounded-md border border-[var(--dk-matte-edge)] bg-[var(--dk-surface)] px-1.5 py-0.5 text-[12px] font-semibold text-[var(--dk-text)] outline-none focus:border-[var(--dk-brand)]"
            />
          ) : (
            <>
              <button
                type="button"
                onClick={() => {
                  onSelectConversation(conv.id);
                  onCloseMobile();
                }}
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  startRename(conv);
                }}
                title={`${displayTitle} (double-click to rename)`}
                className="min-w-0 flex-1 text-left truncate h-full flex items-center cursor-pointer"
              >
                <span className="truncate">
                  {displayTitle}
                </span>
              </button>

              <div className="flex items-center gap-0.5 shrink-0">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onTogglePinConversation(conv.id);
                  }}
                  aria-label={`${isPinned ? 'Unpin' : 'Pin'} "${displayTitle}"`}
                  title={isPinned ? 'Unpin' : 'Pin'}
                  className={`inline-flex h-5 w-5 items-center justify-center rounded-md transition-opacity shrink-0 cursor-pointer ${
                    isPinned
                      ? 'text-[var(--dk-brand)] opacity-90'
                      : 'text-[var(--dk-text-3)] opacity-0 group-hover:opacity-100 focus-visible:opacity-100 hover:bg-[var(--dk-surface)] hover:text-[var(--dk-text)]'
                  }`}
                >
                  <FluentPin className="h-3 w-3" />
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    startRename(conv);
                  }}
                  aria-label={`Rename "${displayTitle}"`}
                  title="Rename"
                  data-testid={`rename-conv-${conv.id}`}
                  className="inline-flex h-5 w-5 items-center justify-center rounded-md text-[var(--dk-text-3)] opacity-0 group-hover:opacity-100 focus-visible:opacity-100 hover:bg-[var(--dk-surface)] hover:text-[var(--dk-text)] transition-opacity shrink-0 cursor-pointer"
                >
                  <FluentEdit className="h-3 w-3" />
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteConversation(conv.id);
                  }}
                  aria-label={`Delete "${displayTitle}"`}
                  title="Delete"
                  className="inline-flex h-5 w-5 items-center justify-center rounded-md text-[var(--dk-text-3)] opacity-0 group-hover:opacity-100 focus-visible:opacity-100 hover:bg-[var(--dk-surface)] hover:text-[var(--dk-danger)] transition-opacity shrink-0 cursor-pointer"
                >
                  <FluentDelete className="h-3.5 w-3.5" />
                </button>
              </div>
            </>
          )}
      </div>
    );
  };

  const renderAppearanceControls = () => (
    <div className="divide-y divide-[var(--dk-panel-divider)]">
      {/* 4 Sidebar / Rail Modalities: Full (Inteiro), Saddle (4 Edges), Floating Capsule */}
      <div className="dt-kinetic-row px-3 py-2.5 space-y-2">
        <div
          className="dt-hint-anchor flex items-center gap-2 min-w-0"
          data-hint-visible={activeHintKey === 'rail-mode' ? 'true' : 'false'}
          onPointerEnter={() => setActiveHintKey('rail-mode')}
          onPointerLeave={() => setActiveHintKey((k) => (k === 'rail-mode' ? null : k))}
        >
          <FluentFloatDock className="dt-settings-icon h-4 w-4 text-[var(--dk-text-2)] shrink-0" />
          <span
            onTouchStart={() => setActiveHintKey('rail-mode')}
            className="text-[11.5px] font-semibold text-[var(--dk-text)] whitespace-nowrap cursor-default"
          >
            <AnimatedLetters text="Sidebar rail mode" delayStep={12} />
          </span>
          <span className="dt-hover-caption dt-hover-caption-left" role="tooltip">
            Switch between Full edge-to-edge, 4-Edge Saddle, or Floating capsule
          </span>
        </div>

        <div className="grid grid-cols-4 gap-1.5" role="radiogroup" aria-label="Sidebar rail mode">
          {(
            [
              { id: 'full', label: 'Full bar', Icon: FluentRailFull },
              { id: 'full-floating', label: 'Full Float', Icon: FluentRailFullFloat },
              { id: 'saddle', label: 'Saddle bridge', Icon: FluentRailSaddle },
              { id: 'floating', label: 'Floating', Icon: FluentRailFloating },
            ] as const
          ).map(({ id, label, Icon }, idx) => {
            const active = railMode === id;
            const edgeAlign =
              idx === 0
                ? 'dt-hover-caption-left'
                : idx === 3
                  ? 'dt-hover-caption-right'
                  : '';
            return (
              <button
                key={id}
                type="button"
                role="radio"
                aria-checked={active}
                aria-label={label}
                title={label}
                onClick={() => onChangeRailMode(id)}
                data-testid={`rail-mode-${id}`}
                data-active={active ? 'true' : 'false'}
                className="group dt-settings-icon-tile"
              >
                <Icon className="h-4.5 w-4.5" />
                <span className={`dt-hover-caption ${edgeAlign}`} role="tooltip">
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4-Edge Rail Dock Quick Selector (Icon-Only Controls) */}
      <div className="dt-kinetic-row px-3 py-2.5 space-y-2">
        <div className="flex items-center gap-2 min-w-0">
          <FluentDockLeft className="dt-settings-icon h-4 w-4 text-[var(--dk-text-2)] shrink-0" />
          <span className="text-[11.5px] font-semibold text-[var(--dk-text)] whitespace-nowrap">
            <AnimatedLetters text="Rail dock edge" delayStep={12} />
          </span>
        </div>
        <div className="grid grid-cols-4 gap-1.5" role="group" aria-label="Rail dock edge">
          {(
            [
              { edge: 'left', label: 'Dock Left', Icon: FluentDockLeft },
              { edge: 'right', label: 'Dock Right', Icon: FluentDockRight },
              { edge: 'top', label: 'Dock Top', Icon: FluentDockTop },
              { edge: 'bottom', label: 'Dock Bottom', Icon: FluentDockBottom },
            ] as const
          ).map(({ edge, label, Icon }, idx) => {
            const active = railMode === 'saddle' && railDockEdge === edge;
            const edgeAlign =
              idx === 0
                ? 'dt-hover-caption-left'
                : idx === 3
                  ? 'dt-hover-caption-right'
                  : '';
            return (
              <button
                key={edge}
                type="button"
                aria-label={label}
                aria-pressed={active}
                title={label}
                onClick={() => {
                  onChangeRailMode('saddle');
                  onChangeRailDockEdge(edge);
                }}
                data-testid={`rail-dock-edge-${edge}`}
                data-active={active ? 'true' : 'false'}
                className="group dt-settings-icon-tile"
              >
                <Icon className="h-4.5 w-4.5" />
                <span className={`dt-hover-caption ${edgeAlign}`} role="tooltip">
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Expandable Box Modality: Docked vs Floating (Icon-Only Tiles) */}
      <div className="dt-kinetic-row px-3 py-2.5 space-y-2">
        <div
          className="dt-hint-anchor flex items-center gap-2 min-w-0"
          data-hint-visible={activeHintKey === 'float-panel' ? 'true' : 'false'}
          onPointerEnter={() => setActiveHintKey('float-panel')}
          onPointerLeave={() => setActiveHintKey((k) => (k === 'float-panel' ? null : k))}
        >
          <FluentFloatPanel className="dt-settings-icon h-4 w-4 text-[var(--dk-text-2)] shrink-0" />
          <span
            onTouchStart={() => setActiveHintKey('float-panel')}
            className="text-[11.5px] font-semibold text-[var(--dk-text)] whitespace-nowrap cursor-default"
          >
            <AnimatedLetters text="Expandable box" delayStep={12} />
          </span>
          <span className="dt-hover-caption dt-hover-caption-left" role="tooltip">
            Choose between attached panel or 10px detached floating box
          </span>
        </div>

        <div className="grid grid-cols-2 gap-1.5" role="radiogroup" aria-label="Expandable box mode">
          <button
            type="button"
            role="radio"
            aria-checked={!floatingSidebar}
            aria-label="Docked expandable box"
            title="Docked box"
            onClick={() => onChangeFloatingSidebar(false)}
            data-testid="toggle-docked-sidebar"
            data-active={!floatingSidebar ? 'true' : 'false'}
            className="group dt-settings-icon-tile"
          >
            <FluentBoxDocked className="h-4.5 w-4.5" />
            <span className="dt-hover-caption dt-hover-caption-left" role="tooltip">
              Docked box
            </span>
          </button>

          <button
            type="button"
            role="radio"
            aria-checked={floatingSidebar}
            aria-label="Floating expandable box"
            title="Floating box"
            onClick={() => onChangeFloatingSidebar(true)}
            data-testid="toggle-floating-sidebar"
            data-active={floatingSidebar ? 'true' : 'false'}
            className="group dt-settings-icon-tile"
          >
            <FluentBoxFloating className="h-4.5 w-4.5" />
            <span className="dt-hover-caption dt-hover-caption-right" role="tooltip">
              Floating box
            </span>
          </button>
        </div>
      </div>

      {/* Translucent Panel Width Meter */}
      <div className="dt-kinetic-row px-3 py-2.5 space-y-2">
        <div className="flex items-center justify-between gap-2 text-[11.5px]">
          <span className="flex items-center gap-2 font-semibold text-[var(--dk-text)]">
            <FluentPanelWidth className="dt-settings-icon h-4 w-4 text-[var(--dk-text-2)] shrink-0" />
            <AnimatedLetters text="Panel width" delayStep={12} />
          </span>
          <span className="notranslate font-mono text-[11px] font-bold tabular-nums text-[var(--dk-text-2)]">
            {sidebarWidth}px
          </span>
        </div>

        <TranslucentMeterSlider
          value={sidebarWidth}
          min={MIN_SIDEBAR_WIDTH}
          max={MAX_SIDEBAR_WIDTH}
          step={4}
          onChange={onChangeSidebarWidth}
          ariaLabel="Expandable panel width"
          testId="sidebar-width-slider"
          leftHint="Compact"
          rightHint="Wide"
          ticks={11}
        />
      </div>

      {/* Effects Controls (Icon-Only Toggles: ANSI Art, Glow, Blur, Transparency) */}
      <div className="dt-kinetic-row px-3 py-2.5 space-y-2">
        <div className="flex items-center gap-2 min-w-0">
          <FluentFxPalette className="dt-settings-icon h-4 w-4 text-[var(--dk-text-2)] shrink-0" />
          <span className="text-[11.5px] font-semibold text-[var(--dk-text)] whitespace-nowrap">
            <AnimatedLetters text="Effects" delayStep={12} />
          </span>
        </div>

        <div className="grid grid-cols-4 gap-1.5" role="group" aria-label="Visual effects">
          {(
            [
              {
                id: 'ansi',
                label: 'ANSI Art',
                active: ansiEnabled,
                onToggle: onToggleAnsiEnabled,
                testId: 'toggle-ansi-bg',
                Icon: FluentCanvasBg,
              },
              {
                id: 'glow',
                label: 'Glow',
                active: glowEnabled,
                onToggle: onToggleGlowEnabled,
                testId: 'toggle-glow-effect',
                Icon: FluentFxGlow,
              },
              {
                id: 'blur',
                label: 'Blur',
                active: blurEnabled,
                onToggle: onToggleBlurEnabled,
                testId: 'toggle-blur-effect',
                Icon: FluentFxBlur,
              },
              {
                id: 'transparency',
                label: 'Transparency',
                active: transparencyEnabled,
                onToggle: onToggleTransparencyEnabled,
                testId: 'toggle-transparency-effect',
                Icon: FluentFxTransparency,
              },
            ] as const
          ).map(({ id, label, active, onToggle, testId, Icon }, idx) => {
            const edgeAlign =
              idx === 0
                ? 'dt-hover-caption-left'
                : idx === 3
                  ? 'dt-hover-caption-right'
                  : '';
            return (
              <button
                key={id}
                type="button"
                aria-label={label}
                aria-pressed={active}
                title={label}
                onClick={onToggle}
                data-testid={testId}
                data-active={active ? 'true' : 'false'}
                className="group dt-settings-icon-tile"
              >
                <Icon className="h-4.5 w-4.5" />
                <span className={`dt-hover-caption ${edgeAlign}`} role="tooltip">
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Auto-scroll Switch */}
      <div className="dt-kinetic-row px-3 py-2.5 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <FluentScrollText className="dt-settings-icon h-4 w-4 text-[var(--dk-text-2)] shrink-0" />
          <span className="text-[11.5px] font-semibold text-[var(--dk-text)] whitespace-nowrap">
            <AnimatedLetters text="Auto-scroll thread" delayStep={12} />
          </span>
        </div>

        <button
          type="button"
          role="switch"
          aria-checked={autoScrollEnabled}
          aria-label="Toggle automatic scroll"
          data-testid="toggle-auto-scroll"
          onClick={onToggleAutoScrollEnabled}
          className="dt-switch-track shrink-0"
        >
          <span className="dt-switch-thumb" aria-hidden="true" />
        </button>
      </div>
    </div>
  );

  const renderSettingsSubView = (section: SettingsSectionId) => {
    const activeMeta = settingsMenuItems.find((i) => i.id === section);
    return (
      <div className="flex flex-1 flex-col min-h-0">
        <div className="border-b border-[var(--dk-panel-divider)] px-2.5 py-2 shrink-0">
          <button
            type="button"
            onClick={() => setSettingsSection(null)}
            data-testid="settings-back-btn"
            className="dt-kinetic-row flex w-full items-center gap-1.5 rounded-[10px] squircle px-2 py-1.5 text-xs font-semibold text-[var(--dk-text-2)] hover:bg-[var(--dk-raised)] hover:text-[var(--dk-text)] transition-colors cursor-pointer"
          >
            <FluentChevronLeft className="dt-settings-icon h-3.5 w-3.5 shrink-0" />
            <span className="truncate">
              <AnimatedLetters text={activeMeta?.label || 'Settings'} delayStep={14} />
            </span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-[var(--dk-panel-divider)]">
          {section === 'appearance' && renderAppearanceControls()}

          {section === 'language' && (
            <div data-testid="settings-language-panel" className="p-2 space-y-1">
                {SUPPORTED_LANGUAGES.map((item) => {
                  const selected = lang === item.code;
                  return (
                    <button
                      key={item.code}
                      type="button"
                      onClick={() => void setLanguage(item.code)}
                      aria-pressed={selected}
                      data-testid={`language-option-${item.code}`}
                      className={`dt-kinetic-row flex w-full items-center justify-between gap-2.5 rounded-[11px] squircle px-2.5 py-2 text-left transition-all cursor-pointer ${
                        selected
                          ? 'bg-[var(--dk-selected)] text-[var(--dk-text)] font-semibold'
                          : 'text-[var(--dk-text-2)] hover:bg-[var(--dk-raised)] hover:text-[var(--dk-text)]'
                      }`}
                    >
                      <span className="flex min-w-0 items-center gap-2.5">
                        <CountryFlag code={item.flag} className="w-7 h-5 shrink-0" />
                        <span className="notranslate truncate text-[12.5px]">{item.label}</span>
                      </span>

                      <span className="flex items-center gap-1.5 shrink-0">
                        <span className="notranslate font-mono text-[10px] uppercase tracking-wider text-[var(--dk-text-3)]">
                          {item.region}
                        </span>
                        {selected && isTranslating ? (
                          <FluentArrowSync className="h-3.5 w-3.5 animate-spin text-[var(--dk-brand)]" />
                        ) : selected ? (
                          <FluentCheck className="h-3.5 w-3.5 text-[var(--dk-brand)]" />
                        ) : null}
                      </span>
                    </button>
                  );
                })}
            </div>
          )}

          {section === 'gateway' && (
            <div className="px-3.5 py-3 space-y-2.5">
              <label
                htmlFor="settings-gateway-url"
                className="flex items-center gap-2 text-xs font-semibold text-[var(--dk-text)]"
              >
                <FluentTerminal className="dt-settings-icon h-3.5 w-3.5 text-[var(--dk-text-2)]" />
                <AnimatedLetters text="Gateway URL" delayStep={12} />
              </label>
              <input
                id="settings-gateway-url"
                type="url"
                value={gatewayDraft}
                onChange={(e) => setGatewayDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    onApplyBaseUrl(gatewayDraft);
                  }
                }}
                placeholder="https://..."
                className="w-full rounded-[10px] squircle border border-[var(--dk-matte-edge)] bg-[var(--dk-surface-2)] px-2.5 py-1.5 font-mono text-[11.5px] text-[var(--dk-text)] focus:border-[var(--dk-brand)] focus:outline-none"
              />
              <button
                type="button"
                onClick={() => onApplyBaseUrl(gatewayDraft)}
                disabled={!gatewayDraft.trim()}
                className="send-key w-full h-8 text-xs"
              >
                Apply & Connect
              </button>
            </div>
          )}

          {section === 'personalization' && (
            <div className="px-3.5 py-3 space-y-2.5">
              <label
                htmlFor="settings-user-display-name"
                className="flex items-center gap-2 text-xs font-semibold text-[var(--dk-text)]"
              >
                <FluentPerson className="dt-settings-icon h-3.5 w-3.5 text-[var(--dk-text-2)]" />
                <AnimatedLetters text="Profile Name" delayStep={12} />
              </label>
              <input
                id="settings-user-display-name"
                type="text"
                value={userDisplayName}
                onChange={(e) => onChangeUserDisplayName(e.target.value)}
                placeholder="Your name..."
                className="w-full rounded-[10px] squircle border border-[var(--dk-matte-edge)] bg-[var(--dk-surface-2)] px-2.5 py-1.5 text-xs text-[var(--dk-text)] focus:border-[var(--dk-brand)] focus:outline-none"
              />
            </div>
          )}

          {section === 'memory' && (
            <div className="px-3.5 py-3 space-y-2">
              <label
                htmlFor="settings-workspace-memory"
                className="flex items-center gap-2 text-xs font-semibold text-[var(--dk-text)]"
              >
                <FluentBrain className="dt-settings-icon h-3.5 w-3.5 text-[var(--dk-text-2)]" />
                <AnimatedLetters text="Workspace Memory" delayStep={12} />
              </label>
              <textarea
                id="settings-workspace-memory"
                rows={5}
                value={workspaceMemory}
                onChange={(e) => onChangeWorkspaceMemory(e.target.value)}
                placeholder="Persistent preferences, architecture conventions, and constraints..."
                className="w-full rounded-[11px] squircle border border-[var(--dk-matte-edge)] bg-[var(--dk-surface-2)] p-2.5 text-xs leading-relaxed text-[var(--dk-text)] placeholder:text-[var(--dk-text-3)] focus:border-[var(--dk-brand)] focus:outline-none"
              />
            </div>
          )}

          {section === 'stats' && (
            <div data-testid="settings-usage-stats" className="divide-y divide-[var(--dk-panel-divider)]">
              {[
                { label: 'Workspaces', val: usageStats.workspaceCount },
                { label: 'Sessions', val: usageStats.sessionCount },
                { label: 'Messages', val: usageStats.messageCount },
                { label: 'Tokens recorded', val: usageStats.totalTokens },
              ].map((stat, idx) => (
                <div
                  key={stat.label}
                  className="dt-kinetic-row px-3.5 py-3 flex items-center justify-between gap-2 text-xs"
                >
                  <span className="text-[var(--dk-text-2)]">
                    <AnimatedLetters text={stat.label} delayStep={10 + idx * 2} />
                  </span>
                  <span className="notranslate font-mono font-bold tabular-nums text-[var(--dk-text)]">
                    {stat.val}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/35 lg:hidden"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      <aside
        aria-label="Workspace sidebar"
        data-testid="project-sidebar"
        data-floating={floatingSidebar ? 'true' : 'false'}
        style={
          isDesktop && visibleOnDesktop
            ? {
                width: `${effectiveDesktopWidth}px`,
                transition: isResizing ? 'none' : 'width 0.16s cubic-bezier(0.22, 1, 0.36, 1)',
              }
            : undefined
        }
        className={`project-sidebar fixed top-[44px] bottom-1.5 left-1.5 z-40 max-lg:w-[272px] rounded-[10px] dt-clay-quad-light overflow-hidden lg:relative lg:top-auto lg:bottom-auto lg:left-auto lg:translate-x-0 lg:visible lg:pointer-events-auto ${
          isOpen
            ? 'translate-x-0 visible opacity-100 pointer-events-auto'
            : showDesktopPreview
              ? '-translate-x-[115%] invisible opacity-0 pointer-events-none lg:flex lg:visible lg:opacity-100 lg:pointer-events-auto'
              : '-translate-x-[115%] invisible opacity-0 pointer-events-none lg:hidden'
        }`}
      >
        <div
          aria-hidden="true"
          className="hero-gaussian-shader pointer-events-none absolute top-[32%] -bottom-[90px] -left-14 -right-24 z-0 opacity-35 dark:opacity-25"
        />
        <div className="relative z-10 flex flex-1 flex-col min-h-0">
          {/* Sidebar Header */}
          <div className="flex h-10 items-center justify-between gap-2 border-b border-[var(--dk-panel-divider)] px-3 shrink-0">
            <div className="flex items-center gap-1.5 min-w-0">
              <span key={sectionTitle} className="hidden lg:inline font-display text-[13px] font-bold text-[var(--dk-text)] truncate">
                {activeTab === 'settings' ? (
                  <AnimatedLetters key={settingsSection ?? 'settings-root'} text={sectionTitle} delayStep={18} />
                ) : (
                  sectionTitle
                )}
              </span>

              <button
                type="button"
                onClick={onCloseMobile}
                aria-label="Close sidebar"
                title="Close"
                className="lg:hidden dk-icon-btn w-7 h-7 px-0 shrink-0"
              >
                <FluentDismiss className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Mobile Drawer Section Switcher & New Session */}
            <div
              role="tablist"
              aria-label="Sidebar sections"
              className="lg:hidden dk-segmented-track text-[11px]"
            >
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'chats'}
                aria-label="Sessions and Workspaces"
                data-testid="sidebar-tab-chats"
                onClick={() => onTabChange('chats')}
                className="dk-segmented-btn !px-1.5 !py-1"
              >
                <FluentChat className="h-3.5 w-3.5" />
              </button>

              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'artifacts'}
                aria-label="Artifacts"
                data-testid="sidebar-tab-artifacts"
                onClick={() => onTabChange('artifacts')}
                className="dk-segmented-btn !px-1.5 !py-1"
              >
                <FluentLayers className="h-3.5 w-3.5" />
              </button>

              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'tasks'}
                aria-label="Tasks"
                data-testid="sidebar-tab-tasks"
                onClick={() => onTabChange('tasks')}
                className="dk-segmented-btn !px-1.5 !py-1"
              >
                <FluentChecklist className="h-3.5 w-3.5" />
              </button>

              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'models'}
                aria-label="Discovered models"
                data-testid="sidebar-tab-models"
                onClick={() => onTabChange('models')}
                className="dk-segmented-btn !px-1.5 !py-1"
              >
                <FluentModel className="h-3.5 w-3.5" />
              </button>

              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'params'}
                aria-label="Parameters"
                data-testid="sidebar-tab-params"
                onClick={() => onTabChange('params')}
                className="dk-segmented-btn !px-1.5 !py-1"
              >
                <FluentSliders className="h-3.5 w-3.5" />
              </button>

              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'settings'}
                aria-label="Settings"
                data-testid="sidebar-tab-settings"
                onClick={() => onTabChange('settings')}
                className="dk-segmented-btn !px-1.5 !py-1"
              >
                <FluentSettings className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="flex lg:hidden items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={onToggleSearchOpen}
                aria-label="Toggle filter search"
                aria-pressed={searchOpen}
                title="Filter..."
                data-testid="sidebar-header-search-btn"
                className={`inline-flex h-6.5 w-6.5 items-center justify-center rounded-[8px] squircle transition-colors cursor-pointer ${
                  searchOpen
                    ? 'bg-[var(--dk-selected)] text-[var(--dk-text)]'
                    : 'text-[var(--dk-text-3)] hover:bg-[var(--dk-raised)] hover:text-[var(--dk-text)]'
                }`}
              >
                <FluentSearch className="h-3.5 w-3.5" />
              </button>

              <button
                type="button"
                onClick={() => {
                  onNewConversation(activeWorkspaceId);
                  onCloseMobile();
                }}
                aria-label="New session"
                data-testid="sidebar-new-chat-btn"
                className="icon-frame-3d inline-flex h-7 w-7 items-center justify-center rounded-[10px] squircle text-[var(--dk-text)] cursor-pointer shrink-0"
              >
                <FluentPlus className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Unified Top Search Bar (Above Workspace / New project / Artifacts / Tasks across ALL tabs) */}
          {searchOpen && (
            <div
              data-testid="sidebar-top-search"
              className="border-b border-[var(--dk-panel-divider)] px-2.5 py-2 shrink-0"
            >
              <div className="relative flex items-center">
                <FluentSearch className="pointer-events-none absolute left-2.5 top-1/2 z-10 h-3.5 w-3.5 -translate-y-1/2 text-[var(--dk-text-3)]" />
                <input
                  ref={topSearchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter..."
                  aria-label="Filter across workspace"
                  data-testid="sidebar-filter-input"
                  className="w-full rounded-[9px] squircle border border-[var(--dk-matte-edge)] bg-[var(--dk-surface)]/80 py-1.5 pl-8 pr-7 text-xs text-[var(--dk-text)] placeholder:text-[var(--dk-text-3)] focus:border-[var(--dk-brand)] focus:outline-none backdrop-blur-md"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    aria-label="Clear filter"
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--dk-text-3)] hover:text-[var(--dk-text)] cursor-pointer"
                  >
                    <FluentDismiss className="h-3 w-3" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Quick-Action Strip for Workspace / New Project / Artifacts / Tasks */}
          {(activeTab === 'chats' || activeTab === 'artifacts' || activeTab === 'tasks') && (
            <div
              data-testid="sidebar-quick-actions"
              className="border-b border-[var(--dk-panel-divider)] px-2.5 py-2 space-y-1 shrink-0"
            >
              <button
                type="button"
                onClick={() => onTabChange('chats')}
                data-testid="sidebar-action-workspace"
                className={`group flex w-full items-center justify-between gap-2 rounded-[10px] squircle px-2.5 py-1.5 text-[11.5px] font-semibold transition-all cursor-pointer ${
                  activeTab === 'chats'
                    ? 'bg-[var(--dk-selected)] text-[var(--dk-text)]'
                    : 'text-[var(--dk-text-2)] hover:bg-[var(--dk-raised)] hover:text-[var(--dk-text)]'
                }`}
              >
                <span className="flex items-center gap-2 min-w-0">
                  <FluentFolder filled={activeTab === 'chats'} className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">Workspace</span>
                </span>
                <span className="notranslate rounded-[6px] bg-[var(--dk-surface-2)]/80 px-1.5 py-0.5 font-mono text-[10px] text-[var(--dk-text-3)] tabular-nums">
                  {workspaces.length}
                </span>
              </button>

              <button
                type="button"
                onClick={onCreateProjectInstant}
                data-testid="sidebar-action-new-project"
                className="group flex w-full items-center justify-between gap-2 rounded-[10px] squircle px-2.5 py-1.5 text-[11.5px] font-semibold text-[var(--dk-text-2)] hover:bg-[var(--dk-raised)] hover:text-[var(--dk-text)] transition-all cursor-pointer"
              >
                <span className="flex items-center gap-2 min-w-0">
                  <FluentWorkspaceAdd className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">New project</span>
                </span>
                <FluentPlus className="h-3 w-3 shrink-0 opacity-60 group-hover:opacity-100" />
              </button>

              <button
                type="button"
                onClick={() => onTabChange(activeTab === 'artifacts' ? 'chats' : 'artifacts')}
                data-testid="sidebar-action-artifacts"
                className={`group flex w-full items-center justify-between gap-2 rounded-[10px] squircle px-2.5 py-1.5 text-[11.5px] font-semibold transition-all cursor-pointer ${
                  activeTab === 'artifacts'
                    ? 'bg-[var(--dk-selected)] text-[var(--dk-text)]'
                    : 'text-[var(--dk-text-2)] hover:bg-[var(--dk-raised)] hover:text-[var(--dk-text)]'
                }`}
              >
                <span className="flex items-center gap-2 min-w-0">
                  <FluentLayers filled={activeTab === 'artifacts'} className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">Artifacts</span>
                </span>
                <span className="notranslate rounded-[6px] bg-[var(--dk-surface-2)]/80 px-1.5 py-0.5 font-mono text-[10px] text-[var(--dk-text-3)] tabular-nums">
                  {artifacts.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => onTabChange(activeTab === 'tasks' ? 'chats' : 'tasks')}
                data-testid="sidebar-action-tasks"
                className={`group flex w-full items-center justify-between gap-2 rounded-[10px] squircle px-2.5 py-1.5 text-[11.5px] font-semibold transition-all cursor-pointer ${
                  activeTab === 'tasks'
                    ? 'bg-[var(--dk-selected)] text-[var(--dk-text)]'
                    : 'text-[var(--dk-text-2)] hover:bg-[var(--dk-raised)] hover:text-[var(--dk-text)]'
                }`}
              >
                <span className="flex items-center gap-2 min-w-0">
                  <FluentChecklist filled={activeTab === 'tasks'} className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">Tasks</span>
                </span>
                <span className="notranslate rounded-[6px] bg-[var(--dk-surface-2)]/80 px-1.5 py-0.5 font-mono text-[10px] text-[var(--dk-text-3)] tabular-nums">
                  {openTasksCount}
                </span>
              </button>
            </div>
          )}

          {/* Content Body */}
          {activeTab === 'chats' ? (
            <div className="flex flex-1 flex-col min-h-0">
              {creatingWorkspace && (
                <div className="px-2.5 pt-2 shrink-0">
                  <div className="flex items-center gap-1">
                    <input
                      type="text"
                      value={newWorkspaceName}
                      onChange={(e) => setNewWorkspaceName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleCreateWorkspaceSubmit();
                        } else if (e.key === 'Escape') {
                          setCreatingWorkspace(false);
                        }
                      }}
                      placeholder="Workspace name..."
                      aria-label="New workspace name"
                      // biome-ignore lint/a11y/noAutofocus: the new-workspace field answers ready to type — the creation row the sidebar opens exists to type the name into immediately
                      autoFocus
                      className="min-w-0 flex-1 rounded-[9px] squircle border border-[var(--dk-matte-edge)] bg-[var(--dk-surface-2)] px-2.5 py-1 text-xs text-[var(--dk-text)] placeholder:text-[var(--dk-text-3)] focus:border-[var(--dk-brand)] focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleCreateWorkspaceSubmit}
                      disabled={!newWorkspaceName.trim()}
                      className="send-key h-7 px-2 text-[11px]"
                    >
                      Create
                    </button>
                  </div>
                </div>
              )}

              <div className="flex-1 overflow-y-auto px-2 py-2 space-y-2.5">
                {/* Pinned Sessions Section */}
                {pinnedConversations.length > 0 && (
                  <div>
                    <div className="px-2 py-1 text-[10.5px] font-semibold uppercase tracking-wider text-[var(--dk-text-3)]">
                      Pinned
                    </div>
                    <div className="space-y-0.5">
                      {pinnedConversations.map(renderConversationRow)}
                    </div>
                  </div>
                )}

                {/* Workspace Groups -> Sessions Hierarchy */}
                <div>
                  <div className="px-2 py-1 flex items-center justify-between text-[10.5px] font-semibold uppercase tracking-wider text-[var(--dk-text-3)]">
                    <span>Workspaces</span>
                    <button
                      type="button"
                      onClick={() => setCreatingWorkspace((v) => !v)}
                      aria-label="Create new workspace"
                      title="Custom workspace"
                      data-testid="sidebar-new-workspace-btn"
                      className="inline-flex h-5 w-5 items-center justify-center rounded-md text-[var(--dk-text-3)] hover:bg-[var(--dk-raised)] hover:text-[var(--dk-text)] cursor-pointer"
                    >
                      <FluentPlus className="h-3 w-3" />
                    </button>
                  </div>

                <div className="space-y-2">
                  {workspaceGroups.map(({ workspace, sessions }) => {
                    const isActiveWs = workspace.id === activeWorkspaceId;
                    const isCollapsed = Boolean(collapsedWorkspaces[workspace.id]);
                    const isRenamingWs = editingWorkspaceId === workspace.id;

                    return (
                      <div key={workspace.id} data-testid={`workspace-group-${workspace.id}`}>
                        <div
                          className={`group flex items-center justify-between gap-1 rounded-[9px] squircle px-1.5 py-1 text-xs transition-colors ${
                            isActiveWs
                              ? 'text-[var(--dk-text)] font-semibold'
                              : 'text-[var(--dk-text-2)] hover:text-[var(--dk-text)]'
                          }`}
                        >
                          {isRenamingWs ? (
                            <input
                              type="text"
                              value={editingWorkspaceName}
                              onChange={(e) => setEditingWorkspaceName(e.target.value)}
                              onBlur={commitWorkspaceRename}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  commitWorkspaceRename();
                                } else if (e.key === 'Escape') {
                                  setEditingWorkspaceId(null);
                                }
                              }}
                              // biome-ignore lint/a11y/noAutofocus: the rename input answers ready to type — the inline edit the row opens exists to type into immediately
                              autoFocus
                              aria-label="Rename workspace"
                              className="min-w-0 flex-1 rounded border border-[var(--dk-matte-edge)] bg-[var(--dk-surface)] px-1.5 py-0.5 text-xs text-[var(--dk-text)] outline-none"
                            />
                          ) : (
                            <>
                              <button
                                type="button"
                                onClick={() => {
                                  onSelectWorkspace(workspace.id);
                                  setCollapsedWorkspaces((prev) => ({
                                    ...prev,
                                    [workspace.id]: !prev[workspace.id],
                                  }));
                                }}
                                onDoubleClick={() => {
                                  setEditingWorkspaceId(workspace.id);
                                  setEditingWorkspaceName(workspace.name);
                                }}
                                aria-expanded={!isCollapsed}
                                className="flex min-w-0 flex-1 items-center gap-1.5 text-left cursor-pointer"
                              >
                                {isCollapsed ? (
                                  <FluentChevronRight className="h-3 w-3 shrink-0 opacity-55" />
                                ) : (
                                  <FluentChevronDown className="h-3 w-3 shrink-0 opacity-55" />
                                )}
                                <FluentFolder className="h-3.5 w-3.5 shrink-0 opacity-75" />
                                <span className="notranslate truncate">{workspace.name}</span>
                              </button>

                              <div className="flex items-center gap-0.5 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingWorkspaceId(workspace.id);
                                    setEditingWorkspaceName(workspace.name);
                                  }}
                                  aria-label={`Rename workspace ${workspace.name}`}
                                  title="Rename workspace"
                                  className="inline-flex h-5 w-5 items-center justify-center rounded text-[var(--dk-text-3)] opacity-0 group-hover:opacity-100 hover:bg-[var(--dk-raised)] hover:text-[var(--dk-text)] transition-opacity cursor-pointer"
                                >
                                  <FluentEdit className="h-3 w-3" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    onNewConversation(workspace.id);
                                    onCloseMobile();
                                  }}
                                  aria-label={`New session (${workspace.name})`}
                                  title="New session in workspace"
                                  className="inline-flex h-5 w-5 items-center justify-center rounded text-[var(--dk-text-3)] opacity-75 hover:opacity-100 hover:bg-[var(--dk-raised)] hover:text-[var(--dk-text)] cursor-pointer"
                                >
                                  <FluentPlus className="h-3 w-3" />
                                </button>
                              </div>
                            </>
                          )}
                        </div>

                        {!isCollapsed && (
                          <div className="ml-2.5 pl-2 border-l border-[var(--dk-panel-divider)] space-y-0.5 mt-0.5">
                            {sessions.length === 0 ? (
                              <p className="px-2 py-1.5 text-[11px] text-[var(--dk-text-3)]">
                                No sessions in this workspace
                              </p>
                            ) : (
                              sessions.map(renderConversationRow)
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                </div>
              </div>
            </div>
        ) : activeTab === 'artifacts' ? (
          <div
            data-testid="sidebar-artifacts-panel"
            className="flex flex-1 flex-col min-h-0 overflow-y-auto px-2.5 py-2.5 space-y-1.5"
          >
            {filteredArtifacts.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center text-center px-3 py-8">
                <div className="icon-frame-3d w-10 h-10 rounded-[12px] squircle flex items-center justify-center text-[var(--dk-text-2)] mb-2.5">
                  <FluentLayers className="h-4.5 w-4.5" />
                </div>
                <p className="text-xs font-semibold text-[var(--dk-text)]">No artifacts yet</p>
                <p className="mt-1 text-[11px] leading-snug text-[var(--dk-text-3)]">
                  Code blocks and generated images from your sessions appear here.
                </p>
              </div>
            ) : (
              filteredArtifacts.map((art) => (
                <div
                  key={art.id}
                  className="surface-card rounded-[12px] squircle p-2.5 space-y-1.5 transition-transform hover:-translate-y-0.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        onSelectArtifactConversation(art.conversationId);
                        onCloseMobile();
                      }}
                      className="flex min-w-0 flex-1 items-center gap-2 text-left cursor-pointer"
                    >
                      {art.kind === 'image' ? (
                        <img
                          src={art.content}
                          alt={art.title}
                          className="h-8 w-8 rounded-[8px] object-cover shrink-0 border border-[var(--dk-matte-edge)]"
                        />
                      ) : (
                        <span className="icon-frame-3d inline-flex h-8 w-8 items-center justify-center rounded-[8px] squircle shrink-0 text-[var(--dk-text-2)]">
                          <FluentCode className="h-3.5 w-3.5" />
                        </span>
                      )}
                      <div className="min-w-0">
                        <div className="truncate text-[11.5px] font-semibold text-[var(--dk-text)]">
                          {art.title}
                        </div>
                        <div className="truncate text-[10px] text-[var(--dk-text-3)]">
                          {art.tag} · {art.workspaceName}
                        </div>
                      </div>
                    </button>

                    {art.kind === 'code' && (
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            await navigator.clipboard.writeText(art.content);
                            setCopiedArtifactId(art.id);
                            setTimeout(() => setCopiedArtifactId((cur) => (cur === art.id ? null : cur)), 1600);
                          } catch {
                            // ignore clipboard error
                          }
                        }}
                        aria-label={`Copy ${art.title}`}
                        title="Copy snippet"
                        className="dk-icon-btn w-6.5 h-6.5 px-0 shrink-0"
                      >
                        {copiedArtifactId === art.id ? (
                          <FluentCheck className="h-3 w-3 text-[var(--dk-brand)]" />
                        ) : (
                          <FluentCopy className="h-3 w-3" />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        ) : activeTab === 'tasks' ? (
          <div
            data-testid="sidebar-tasks-panel"
            className="flex flex-1 flex-col min-h-0"
          >
            <div className="px-2.5 pt-2.5 pb-2 border-b border-[var(--dk-panel-divider)] shrink-0">
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={newTaskText}
                  onChange={(e) => setNewTaskText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleTaskSubmit();
                    }
                  }}
                  placeholder="Add workspace task..."
                  aria-label="New workspace task"
                  data-testid="task-input"
                  className="min-w-0 flex-1 rounded-[10px] squircle border border-[var(--dk-matte-edge)] bg-[var(--dk-surface-2)] px-2.5 py-1.5 text-xs text-[var(--dk-text)] placeholder:text-[var(--dk-text-3)] focus:border-[var(--dk-brand)] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleTaskSubmit}
                  disabled={!newTaskText.trim()}
                  aria-label="Add task"
                  data-testid="task-add-btn"
                  className="send-key h-11 w-11 px-0 shrink-0"
                >
                  <FluentPlus className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-2.5 py-2 space-y-1.5">
              {filteredTasks.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center px-3 py-8">
                  <div className="icon-frame-3d w-10 h-10 rounded-[12px] squircle flex items-center justify-center text-[var(--dk-text-2)] mb-2.5">
                    <FluentChecklist className="h-4.5 w-4.5" />
                  </div>
                  <p className="text-xs font-semibold text-[var(--dk-text)]">No tasks yet</p>
                  <p className="mt-1 text-[11px] leading-snug text-[var(--dk-text-3)]">
                    Keep track of implementation steps for this workspace.
                  </p>
                </div>
              ) : (
                filteredTasks.map((task) => (
                  <div
                    key={task.id}
                    data-testid={`task-row-${task.id}`}
                    className="surface-card group flex items-center justify-between gap-2 rounded-[11px] squircle px-2.5 py-2"
                  >
                    <button
                      type="button"
                      onClick={() => onToggleTask(task.id)}
                      aria-label={`Toggle task "${task.label}"`}
                      aria-pressed={task.done}
                      className="flex min-w-0 flex-1 items-center gap-2 text-left cursor-pointer"
                    >
                      <span
                        className={`inline-flex h-4 w-4 items-center justify-center rounded-[5px] squircle border shrink-0 transition-colors ${
                          task.done
                            ? 'bg-[var(--dk-primary-action)] border-[var(--dk-primary-action)] text-[var(--dk-primary-action-text)]'
                            : 'border-[var(--dk-matte-edge)] bg-[var(--dk-surface)]'
                        }`}
                      >
                        {task.done && <FluentCheck className="h-2.5 w-2.5" />}
                      </span>
                      <span
                        className={`truncate text-[11.5px] font-medium ${
                          task.done
                            ? 'line-through text-[var(--dk-text-3)]'
                            : 'text-[var(--dk-text)]'
                        }`}
                      >
                        {task.label}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onDeleteTask(task.id)}
                      aria-label={`Delete task "${task.label}"`}
                      className="inline-flex h-5 w-5 items-center justify-center rounded text-[var(--dk-text-3)] opacity-0 group-hover:opacity-100 focus-visible:opacity-100 hover:text-[var(--dk-danger)] transition-opacity cursor-pointer shrink-0"
                    >
                      <FluentDelete className="h-3 w-3" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        ) : activeTab === 'models' ? (
          <div className="flex flex-1 flex-col min-h-0">
            <div className="px-2.5 pt-2.5 pb-2 border-b border-[var(--dk-panel-divider)] shrink-0">
              <div className="dk-segmented-track w-full !grid grid-cols-3 text-[11px]">
                <button
                  type="button"
                  onClick={() => setCapabilityFilter('all')}
                  aria-selected={capabilityFilter === 'all'}
                  className="dk-segmented-btn justify-center !px-1.5 whitespace-nowrap"
                >
                  <span>All</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCapabilityFilter('vision')}
                  aria-selected={capabilityFilter === 'vision'}
                  className="dk-segmented-btn justify-center !px-1.5 whitespace-nowrap"
                >
                  <FluentEye className="h-3 w-3 shrink-0" />
                  <span>Vision</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCapabilityFilter('image')}
                  aria-selected={capabilityFilter === 'image'}
                  className="dk-segmented-btn justify-center !px-1.5 whitespace-nowrap"
                >
                  <FluentWand className="h-3 w-3 shrink-0" />
                  <span>Image</span>
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-2 py-1.5 space-y-0.5">
              {isDiscovering && discoveredModels.length === 0 ? (
                <div className="space-y-1.5 p-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <div
                      key={n}
                      className="h-8 rounded-[10px] bg-[var(--dk-raised)] opacity-60 animate-pulse"
                    />
                  ))}
                </div>
              ) : filteredModels.length === 0 ? (
                <p className="px-2 py-6 text-center text-xs text-[var(--dk-text-3)]">
                  No models found.
                </p>
              ) : (
                filteredModels.map((model) => {
                  const selected =
                    model.route === activeRoute && model.id === activeModelId;
                  return (
                    <button
                      key={`${model.route}:${model.id}`}
                      type="button"
                      onClick={() => {
                        onSelectModel(model.route, model.id);
                        onCloseMobile();
                      }}
                      title={model.id}
                      className={`sidebar-thread w-full justify-between text-left ${
                        selected ? 'active' : ''
                      }`}
                    >
                      <span className="notranslate min-w-0 truncate text-[12.5px]">
                        {model.id}
                      </span>
                      <span className="flex items-center gap-1.5 shrink-0 text-[11px] text-[var(--dk-text-3)] tabular-nums">
                        {isImageModel(model) && (
                          <FluentWand className="h-3 w-3 text-[var(--dk-text-2)]" />
                        )}
                        {model.supportsVision && (
                          <FluentEye className="h-3 w-3 text-[var(--dk-brand)]" />
                        )}
                        {model.contextWindow ? (
                          <span className="notranslate hidden sm:inline font-mono text-[10.5px]">
                            {formatCompactTokens(model.contextWindow)}
                          </span>
                        ) : null}
                        {selected && (
                          <FluentCheck className="h-3.5 w-3.5 text-[var(--dk-brand)]" />
                        )}
                      </span>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        ) : activeTab === 'params' ? (
          /* Parameters Tab */
          <div
            data-testid="sidebar-params-panel"
            className="flex flex-1 flex-col min-h-0"
          >
            <div className="flex-1 overflow-y-auto divide-y divide-[var(--dk-panel-divider)]">
              {/* 1. System Prompt + Direct Tone Presets */}
              <div className="p-3.5 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <label
                    htmlFor="sidebar-system-prompt"
                    title="System prompt"
                    className="text-xs font-semibold text-[var(--dk-text)] whitespace-nowrap"
                  >
                    Instructions
                  </label>
                  <div className="flex items-center gap-0.5">
                    {systemPresets.map((preset) => (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => onChangeSystemPrompt(preset.prompt)}
                        className={`rounded-[7px] squircle px-1.5 py-0.5 text-[10.5px] font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                          systemPrompt === preset.prompt
                            ? 'bg-[var(--dk-selected)] text-[var(--dk-text)]'
                            : 'text-[var(--dk-text-3)] hover:bg-[var(--dk-raised)] hover:text-[var(--dk-text)]'
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                <textarea
                  id="sidebar-system-prompt"
                  rows={4}
                  value={systemPrompt}
                  onChange={(e) => onChangeSystemPrompt(e.target.value)}
                  placeholder="Instructions for the model..."
                  className="w-full rounded-[12px] squircle border border-[var(--dk-matte-edge)] bg-[var(--dk-surface-2)]/70 p-2.5 text-xs leading-relaxed text-[var(--dk-text)] placeholder:text-[var(--dk-text-3)] focus:border-[var(--dk-brand)] focus:outline-none"
                />
              </div>

              {/* 2. Translucent Monochrome Temperature Meter */}
              <div className="p-3.5 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[var(--dk-text)]">
                    Temperature
                  </span>
                  <span className="font-mono text-[11px] font-bold tabular-nums text-[var(--dk-text-2)]">
                    <span className="notranslate">{temperature.toFixed(1)}</span>
                    <span className="notranslate mx-1">/</span>
                    <span key={tempToneLabel}>{tempToneLabel}</span>
                  </span>
                </div>

                <TranslucentMeterSlider
                  value={temperature}
                  min={0}
                  max={1.5}
                  step={0.1}
                  onChange={onChangeTemperature}
                  ariaLabel="Model temperature"
                  testId="params-temperature-slider"
                  leftHint="Precise"
                  rightHint="Creative"
                  ticks={11}
                />
              </div>

              {/* 3. Distinct Translucent Emerald-Cyan-Blue Effort Spectrum */}
              {thinkingOptions.length > 0 && (
                <div className="p-3.5 space-y-2.5">
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="font-semibold text-[var(--dk-text)] whitespace-nowrap">
                      Effort
                    </span>
                    <span
                      key={thinkingLevel}
                      className="notranslate dt-effort-value-enter font-mono text-[11px] font-bold text-[var(--dk-text-2)] tabular-nums whitespace-nowrap"
                    >
                      {formatEffortDynamicLabel(thinkingLevel, thinkingLevels)}
                    </span>
                  </div>

                  <TranslucentEffortSpectrum
                    levels={allThinkingKeys}
                    value={thinkingLevel}
                    budgets={thinkingLevels}
                    onChange={onChangeThinkingLevel}
                    ariaLabel="Reasoning effort level"
                    testId="reasoning-level-slider"
                  />
                </div>
              )}
            </div>

            <div className="border-t border-[var(--dk-panel-divider)] p-3 shrink-0">
              <button
                type="button"
                onClick={onResetParams}
                className="flex w-full items-center justify-center gap-1.5 rounded-[11px] squircle py-1.5 px-3 text-xs font-semibold text-[var(--dk-text)] hover:bg-[var(--dk-raised)] transition-colors cursor-pointer"
              >
                <FluentArrowSync className="h-3.5 w-3.5" />
                <span>Reset defaults</span>
              </button>
            </div>
          </div>
        ) : (
          /* Deduplicated Searchable Settings Tab with Animated Letters & Icons */
          <div
            data-testid="sidebar-settings-panel"
            className="flex flex-1 flex-col min-h-0"
          >
            {settingsSection !== null ? (
              renderSettingsSubView(settingsSection)
            ) : (
              <div className="flex flex-1 flex-col min-h-0">
                {/* Organized Settings Categories (Zero Duplicates, filtered via Top Search) */}
                <div className="flex-1 overflow-y-auto px-2 py-2 space-y-3">
                  {filteredSettingsItems.length === 0 ? (
                    <p className="px-3 py-6 text-center text-xs text-[var(--dk-text-3)]">
                      No settings found.
                    </p>
                  ) : (
                    ([
                      { key: 'general', title: 'General' },
                      { key: 'capabilities', title: 'Capabilities' },
                      { key: 'data', title: 'Data' },
                    ] as const).map(({ key: groupKey, title: groupTitle }, groupIdx) => {
                      const groupItems = filteredSettingsItems.filter(
                        (item) => item.groupKey === groupKey
                      );
                      if (groupItems.length === 0) return null;
                      return (
                        <div key={groupKey}>
                          <div className="px-2 py-1 text-[10.5px] font-semibold uppercase tracking-wider text-[var(--dk-text-3)]">
                            <AnimatedLetters text={groupTitle} delayStep={16 + groupIdx * 2} />
                          </div>
                          <div className="space-y-0.5">
                            {groupItems.map(({ id, label, Icon }) => (
                              <button
                                key={id}
                                type="button"
                                onClick={() => {
                                  if (id === 'gateway') setGatewayDraft(baseUrl);
                                  setSettingsSection(id);
                                }}
                                data-testid={`settings-nav-${id}`}
                                className="sidebar-thread dt-kinetic-row w-full justify-between"
                              >
                                <span className="flex min-w-0 items-center gap-2">
                                  <Icon className="dt-settings-icon h-3.5 w-3.5 shrink-0 opacity-80" />
                                  <span className="truncate">
                                    <AnimatedLetters text={label} delayStep={13} />
                                  </span>
                                </span>
                                <FluentChevronRight className="h-3 w-3 opacity-60 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5" />
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Live Workspace / Profile Footer */}
                <div className="border-t border-[var(--dk-panel-divider)] px-3 py-2.5 flex items-center justify-between gap-2 shrink-0">
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="inline-flex h-6.5 w-6.5 items-center justify-center rounded-[8px] squircle bg-[var(--dk-selected)] font-display text-[11px] font-bold text-[var(--dk-text)] shrink-0">
                      {initials}
                    </span>
                    <div className="min-w-0">
                      <div className="truncate text-xs font-semibold text-[var(--dk-text)]">
                        <AnimatedLetters text={profileLabel} delayStep={12} />
                      </div>
                      <div className="truncate text-[10.5px] text-[var(--dk-text-3)]">
                        {usageStats.workspaceCount}{' '}
                        {usageStats.workspaceCount === 1
                          ? 'workspace'
                          : 'workspaces'}{' '}
                        · {usageStats.sessionCount}{' '}
                        {usageStats.sessionCount === 1
                          ? 'session'
                          : 'sessions'}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSettingsSection('personalization')}
                    aria-label="Edit profile"
                    className="dt-kinetic-row dk-icon-btn w-7 h-7 px-0 shrink-0"
                  >
                    <FluentEdit className="dt-settings-icon h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Mobile-only Bottom Utility Dock */}
        <div
          data-testid="sidebar-utility-dock"
          className="flex lg:hidden items-center justify-around gap-1 border-t border-[var(--dk-panel-divider)] px-2.5 py-2 shrink-0"
        >
          <button
            type="button"
            onClick={onOpenInspector}
            aria-label="GET Endpoints"
            data-testid="sidebar-endpoints-btn"
            className={`dk-icon-btn w-8 h-8 px-0 ${inspectorOpen ? 'active' : ''}`}
          >
            <FluentTerminal className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={onSyncAll}
            disabled={isDiscovering || isSyncing}
            aria-label="Sync models and gateway history"
            data-testid="sidebar-sync-btn"
            className="dk-icon-btn w-8 h-8 px-0"
          >
            <FluentArrowSync
              className={`h-4 w-4 ${isDiscovering || isSyncing ? 'animate-spin' : ''}`}
            />
          </button>

          <button
            type="button"
            onClick={onToggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            data-testid="sidebar-theme-btn"
            className="dk-icon-btn w-8 h-8 px-0"
          >
            {theme === 'dark' ? (
              <FluentSun className="h-4 w-4 text-amber-300" />
            ) : (
              <FluentMoon className="h-4 w-4" />
            )}
          </button>
        </div>
        </div>

        {/* Interactive Push / Drag Divider Line on Desktop */}
        <div
          role="separator"
          aria-orientation="vertical"
          aria-label="Drag to resize or collapse sidebar"
          title="Drag to resize or collapse sidebar"
          data-testid="sidebar-resize-handle"
          data-dragging={isResizing ? 'true' : 'false'}
          onPointerDown={onResizePointerDown}
          className="hidden lg:flex sidebar-resize-handle"
        />
      </aside>
    </>
  );
}
