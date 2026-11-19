import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent as ReactPointerEvent } from 'react';
import type { Conversation, Workspace } from '../../studio.client';
import { useGtxLanguage } from '../../studio.gtx';
import {
  DevThinkLogoMark,
  DevThinkWordmark,
  FluentArrowSync,
  FluentChat,
  FluentDismiss,
  FluentMenu,
  FluentPlus,
  FluentSearch,
  FluentSidebarCollapse,
  NewChatMorphLogo,
} from './studio.icons';

interface TopBarProps {
  sidebarOpen?: boolean;
  isDesktop?: boolean;
  effectiveSidebarWidth?: number;
  isResizingSidebar?: boolean;
  floatingSidebar?: boolean;
  searchOpen?: boolean;
  railPadLeft?: number;
  railPadRight?: number;
  onToggleSidebar: () => void;
  onToggleSearch?: () => void;
  openTabs: Conversation[];
  workspaces?: Workspace[];
  activeConversationId: string;
  streamingConvId: string | null;
  onSelectTab: (id: string) => void;
  onCloseTab: (id: string) => void;
  onNewTab: () => void;
  onRenameTab: (id: string, title: string) => void;
  onReorderTabs?: (sourceId: string, targetId: string) => void;
  onReplayIntro?: () => void;
}

function ActiveSaddleTabSurface({ fillColor }: { fillColor: string }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(140);

  useEffect(() => {
    const el = hostRef.current?.parentElement;
    if (!el) return;
    const update = () => {
      const w = Math.round(el.offsetWidth);
      if (w > 0) setWidth(w);
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    window.addEventListener('resize', update);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', update);
    };
  }, []);

  const r = 10;
  const totalW = width + r * 2;
  const h = 34;
  const d = [
    `M 0 ${h}`,
    `C ${r * 0.5523} ${h}, ${r} ${h - r * 0.4477}, ${r} ${h - r}`,
    `L ${r} ${r}`,
    `C ${r} ${r * 0.4477}, ${r * 1.4477} 0, ${r * 2} 0`,
    `L ${width} 0`,
    `C ${width + r * 0.5523} 0, ${width + r} ${r * 0.4477}, ${width + r} ${r}`,
    `L ${width + r} ${h - r}`,
    `C ${width + r} ${h - r * 0.4477}, ${width + r * 1.4477} ${h}, ${totalW} ${h}`,
    'Z',
  ].join(' ');

  return (
    <div
      ref={hostRef}
      aria-hidden="true"
      className="pointer-events-none select-none absolute inset-y-0 -left-[10px] -right-[10px] z-0"
    >
      <svg
        aria-hidden="true"
        focusable="false"
        width={totalW}
        height={h}
        viewBox={`0 0 ${totalW} ${h}`}
        preserveAspectRatio="none"
        fill="none"
        shapeRendering="geometricPrecision"
        className="block w-full h-full"
      >
        <path d={d} fill={fillColor} />
      </svg>
    </div>
  );
}

export function TopBar({
  sidebarOpen = true,
  isDesktop = true,
  effectiveSidebarWidth = 252,
  isResizingSidebar = false,
  floatingSidebar = false,
  searchOpen = false,
  railPadLeft,
  railPadRight,
  onToggleSidebar,
  onToggleSearch,
  openTabs,
  workspaces = [],
  activeConversationId,
  streamingConvId,
  onSelectTab,
  onCloseTab,
  onNewTab,
  onRenameTab,
  onReorderTabs,
  onReplayIntro,
}: TopBarProps) {
  const { formatConversationTitle } = useGtxLanguage();
  const [editingTabId, setEditingTabId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [draggingTabId, setDraggingTabId] = useState<string | null>(null);
  const [dragOffsetX, setDragOffsetX] = useState(0);

  const prevSidebarOpenRef = useRef(sidebarOpen);
  const sidebarOpenChanged = prevSidebarOpenRef.current !== sidebarOpen;
  useEffect(() => {
    prevSidebarOpenRef.current = sidebarOpen;
  }, [sidebarOpen]);

  const tabRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const openTabsRef = useRef(openTabs);
  openTabsRef.current = openTabs;
  const onReorderTabsRef = useRef(onReorderTabs);
  onReorderTabsRef.current = onReorderTabs;
  const dragOffsetRef = useRef(0);
  const suppressTabClickRef = useRef(false);

  const dragSessionRef = useRef<{
    tabId: string;
    startX: number;
    grabDeltaFromCenter: number;
    zoomScale: number;
    dragging: boolean;
  } | null>(null);

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      const session = dragSessionRef.current;
      if (!session) return;

      if (!session.dragging) {
        if (Math.abs(e.clientX - session.startX) < 6) {
          return;
        }
        session.dragging = true;
        suppressTabClickRef.current = true;
        setDraggingTabId(session.tabId);
      }

      const draggedEl = tabRefs.current[session.tabId];
      if (!draggedEl) return;

      const currentRect = draggedEl.getBoundingClientRect();
      const zoomScale =
        currentRect.width / Math.max(1, draggedEl.offsetWidth) || session.zoomScale || 1;
      session.zoomScale = zoomScale;

      const untransformedCenterX =
        currentRect.left + currentRect.width / 2 - dragOffsetRef.current * zoomScale;
      const targetCenterX = e.clientX - session.grabDeltaFromCenter;

      const tabs = openTabsRef.current;
      const dragIdx = tabs.findIndex((t) => t.id === session.tabId);

      if (dragIdx > 0) {
        const prevTab = tabs[dragIdx - 1];
        const prevEl = tabRefs.current[prevTab.id];
        if (prevEl) {
          const prevRect = prevEl.getBoundingClientRect();
          const prevCenterX = prevRect.left + prevRect.width / 2;
          if (targetCenterX < prevCenterX) {
            onReorderTabsRef.current?.(session.tabId, prevTab.id);
          }
        }
      }

      if (dragIdx >= 0 && dragIdx < tabs.length - 1) {
        const nextTab = tabs[dragIdx + 1];
        const nextEl = tabRefs.current[nextTab.id];
        if (nextEl) {
          const nextRect = nextEl.getBoundingClientRect();
          const nextCenterX = nextRect.left + nextRect.width / 2;
          if (targetCenterX > nextCenterX) {
            onReorderTabsRef.current?.(session.tabId, nextTab.id);
          }
        }
      }

      const nextOffset = (targetCenterX - untransformedCenterX) / zoomScale;
      const clampedOffset = Math.max(-240, Math.min(240, nextOffset));
      dragOffsetRef.current = clampedOffset;
      setDragOffsetX(clampedOffset);
    };

    const endDrag = () => {
      const session = dragSessionRef.current;
      if (!session) return;
      const didDrag = session.dragging;
      dragSessionRef.current = null;
      dragOffsetRef.current = 0;
      setDraggingTabId(null);
      setDragOffsetX(0);
      if (didDrag) {
        setTimeout(() => {
          suppressTabClickRef.current = false;
        }, 0);
      }
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', endDrag);
    window.addEventListener('pointercancel', endDrag);
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', endDrag);
      window.removeEventListener('pointercancel', endDrag);
    };
  }, []);

  const handleTabPointerDown = (e: ReactPointerEvent<HTMLDivElement>, tabId: string) => {
    if (e.button !== 0 || editingTabId === tabId || openTabs.length < 2) return;
    const target = e.target as HTMLElement | null;
    if (target?.closest('[data-tab-close="true"]') || target?.closest('input')) {
      return;
    }
    const el = tabRefs.current[tabId];
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const zoomScale = rect.width / Math.max(1, el.offsetWidth) || 1;
    dragOffsetRef.current = 0;
    dragSessionRef.current = {
      tabId,
      startX: e.clientX,
      grabDeltaFromCenter: e.clientX - (rect.left + rect.width / 2),
      zoomScale,
      dragging: false,
    };
  };

  const workspaceMap = new Map(workspaces.map((w) => [w.id, w.name]));

  const startRename = (tab: Conversation) => {
    setEditingTabId(tab.id);
    setEditingTitle(formatConversationTitle(tab.title));
  };

  const commitRename = () => {
    if (!editingTabId) return;
    const trimmed = editingTitle.trim();
    if (trimmed) {
      onRenameTab(editingTabId, trimmed);
    }
    setEditingIdSafe();
  };

  function setEditingIdSafe() {
    setEditingTabId(null);
  }

  const handleRenameKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      commitRename();
    } else if (e.key === 'Escape') {
      setEditingTabId(null);
    }
  };

  const headerStyle =
    isDesktop && (railPadLeft !== undefined || railPadRight !== undefined)
      ? {
          paddingLeft: railPadLeft !== undefined ? `${railPadLeft}px` : undefined,
          paddingRight: railPadRight !== undefined ? `${railPadRight}px` : undefined,
        }
      : undefined;

  const leadingStyle =
    isDesktop && sidebarOpen
      ? {
          width: `${effectiveSidebarWidth}px`,
          transition:
            isResizingSidebar || sidebarOpenChanged
              ? 'none'
              : 'width 0.16s cubic-bezier(0.22, 1, 0.36, 1)',
        }
      : undefined;

  // In floating/split Expandable Box mode, <main> starts 10px after <aside> and has 10px top-left rounding,
  // so Tab 0's -10px left Saddle skirt needs +30.3px padding to sit cleanly on <main>'s flat top edge.
  const tabsStripPadLeft =
    isDesktop && sidebarOpen ? (floatingSidebar ? '30.3px' : '10.3px') : '10.3px';

  return (
    <header className="shell-tab-row" style={headerStyle}>
      {/* Zone 1: Aligned with Sidebar left edge (Logo) & right edge (Search + Collapse/Split) */}
      <div
        className="shell-tab-leading"
        style={leadingStyle}
        data-testid="topbar-leading"
      >
        <div className="flex items-center gap-1 min-w-0">
          <button
            type="button"
            onClick={onToggleSidebar}
            aria-label="Toggle sidebar"
            title="Menu"
            className="dk-icon-btn lg:hidden w-7 sm:w-8 px-0 shrink-0"
          >
            <FluentMenu className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={onReplayIntro}
            aria-label="Replay DevThink 3D intro"
            title="Replay 3D intro"
            className="group inline-flex items-center gap-1.5 sm:gap-2 px-0.5 h-full bg-transparent border-0 text-[var(--dk-text)] hover:opacity-80 transition-all cursor-pointer focus:outline-none whitespace-nowrap shrink-0"
          >
            <DevThinkLogoMark className="h-4 w-4 sm:h-[18px] sm:w-[18px] shrink-0 transition-transform duration-300 group-hover:rotate-12" />
            <DevThinkWordmark className="h-[10px] sm:h-[12px] w-auto shrink-0" />
          </button>
        </div>

        <div className="hidden lg:inline-flex items-center gap-1 shrink-0">
          {onToggleSearch && (
            <button
              type="button"
              onClick={onToggleSearch}
              aria-label="Search sessions"
              aria-pressed={searchOpen}
              title="Search & filter"
              data-testid="topbar-search-btn"
              className={`group w-6.5 h-6.5 rounded-[8px] squircle flex items-center justify-center transition-all focus:outline-none cursor-pointer ${
                searchOpen
                  ? 'icon-frame-3d text-[var(--dk-text)]'
                  : 'text-[var(--dk-text-2)] hover:text-[var(--dk-text)] hover:bg-[var(--dk-raised)]'
              }`}
            >
              <FluentSearch className="h-3.5 w-3.5" />
            </button>
          )}

          <button
            type="button"
            onClick={onToggleSidebar}
            aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
            title={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
            data-testid="topbar-toggle-sidebar-btn"
            className={`group w-6.5 h-6.5 rounded-[8px] squircle flex items-center justify-center transition-all focus:outline-none cursor-pointer ${
              sidebarOpen
                ? 'icon-frame-3d text-[var(--dk-text)]'
                : 'text-[var(--dk-text-2)] hover:text-[var(--dk-text)] hover:bg-[var(--dk-raised)]'
            }`}
          >
            <FluentSidebarCollapse filled={sidebarOpen} className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Zone 2: Connected Session Browser Tabs with 1-Piece Saddle Tab Surface + Drag-to-Reorder */}
      <div className="tabs-viewport">
        <div
          role="tablist"
          aria-label="Open sessions"
          style={{ paddingLeft: tabsStripPadLeft }}
          className="tabs-strip"
        >
          {openTabs.map((tab, idx) => {
            const isActive = tab.id === activeConversationId;
            const isDraggingThis = draggingTabId === tab.id;
            const nextTab = openTabs[idx + 1];
            const nextIsActive = nextTab && nextTab.id === activeConversationId;
            const showDivider = !isActive && !nextIsActive && !isDraggingThis && Boolean(nextTab);
            const isTabStreaming = streamingConvId === tab.id;
            const isEditing = editingTabId === tab.id;
            const isEmptyChat = tab.messages.length === 0;
            const displayTitle = formatConversationTitle(tab.title);
            const wsName = tab.workspaceId ? workspaceMap.get(tab.workspaceId) : undefined;
            const tooltip = wsName
              ? `${wsName} / ${displayTitle} (drag to reorder, double-click to rename)`
              : `${displayTitle} (drag to reorder, double-click to rename)`;

            return (
              <div
                key={tab.id}
                ref={(el) => {
                  tabRefs.current[tab.id] = el;
                }}
                data-tab-id={tab.id}
                data-dragging={isDraggingThis ? 'true' : 'false'}
                onPointerDown={(e) => handleTabPointerDown(e, tab.id)}
                style={
                  isDraggingThis
                    ? {
                        transform: `translateX(${dragOffsetX}px)`,
                        zIndex: 25,
                      }
                    : undefined
                }
                className={`relative h-full flex items-end flex-1 min-w-[56px] max-w-[176px] ${
                  isDraggingThis ? 'transition-none' : 'transition-transform duration-150'
                }`}
              >
                <div
                  className={`browser-tab group ${isActive ? 'active' : ''} ${
                    isDraggingThis ? '!cursor-grabbing' : ''
                  }`}
                >
                  {isActive && (
                    <ActiveSaddleTabSurface fillColor="var(--dk-workspace-surface)" />
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
                      aria-label="Rename tab"
                      className="relative z-10 min-w-0 flex-1 rounded bg-[var(--dk-surface-2)] px-1 py-0.5 text-[11.5px] font-semibold text-[var(--dk-text)] outline-none border border-[var(--dk-matte-edge)]"
                    />
                  ) : (
                    <button
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      onClick={() => {
                        if (suppressTabClickRef.current) return;
                        onSelectTab(tab.id);
                      }}
                      onDoubleClick={() => startRename(tab)}
                      title={tooltip}
                      className={`relative z-10 flex min-w-0 flex-1 items-center gap-1.5 h-full text-left focus:outline-none ${
                        isDraggingThis ? 'cursor-grabbing' : 'cursor-pointer'
                      }`}
                    >
                      {isTabStreaming ? (
                        <FluentArrowSync className="h-3 w-3 shrink-0 animate-spin text-[var(--dk-brand)]" />
                      ) : isEmptyChat ? (
                        <NewChatMorphLogo className="h-3 w-3 opacity-70" />
                      ) : (
                        <FluentChat className="h-3 w-3 shrink-0 opacity-55" />
                      )}
                      <span className="truncate leading-none">
                        {displayTitle}
                      </span>
                    </button>
                  )}

                  {openTabs.length > 1 && !isEditing && (
                    <button
                      type="button"
                      data-tab-close="true"
                      onClick={(e) => {
                        e.stopPropagation();
                        onCloseTab(tab.id);
                      }}
                      aria-label={`Close tab ${displayTitle}`}
                      className={`relative z-10 inline-flex h-4.5 w-4.5 items-center justify-center rounded-md text-[var(--dk-text-3)] hover:bg-[var(--dk-raised)] hover:text-[var(--dk-text)] transition-opacity focus:outline-none cursor-pointer ${
                        isActive
                          ? 'opacity-70 hover:opacity-100'
                          : 'opacity-0 group-hover:opacity-85 focus-visible:opacity-100'
                      }`}
                    >
                      <FluentDismiss className="h-2.5 w-2.5" />
                    </button>
                  )}
                </div>

                {showDivider && <span className="browser-tab-divider" aria-hidden="true" />}
              </div>
            );
          })}

          {/* Browser-style + Add Tab button right after the open tabs */}
          <button
            type="button"
            onClick={onNewTab}
            aria-label="New session"
            title="New session"
            data-testid="topbar-new-tab-btn"
            className="ml-1.5 mb-1 inline-flex h-6.5 w-6.5 items-center justify-center rounded-[9px] squircle text-[var(--dk-text-2)] hover:bg-[var(--dk-raised)] hover:text-[var(--dk-text)] transition-colors focus:outline-none shrink-0 cursor-pointer"
          >
            <FluentPlus className="h-3.5 w-3.5 shrink-0" />
          </button>
        </div>
      </div>
    </header>
  );
}
