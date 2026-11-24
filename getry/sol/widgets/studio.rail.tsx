import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  type RefObject,
} from 'react';
import type { SidebarTab } from './studio.sidebar';
import {
  clampRailPosition,
  resolveRailSnapState,
  type RailMode,
  type RailPosition,
  type SaddleDockEdge,
} from '../../studio.uiprefs';
import {
  FluentArrowSync,
  FluentChartBar,
  FluentChat,
  FluentChecklist,
  FluentKey,
  FluentLayers,
  FluentModel,
  FluentMoon,
  FluentScrollText,
  FluentSettings,
  FluentSliders,
  FluentSun,
  FluentTerminal,
  HomeChatMorphLogo,
} from './studio.icons';

interface OmniSaddleBridgeProps {
  edge: SaddleDockEdge;
  fillColor: string;
  children: ReactNode;
  className?: string;
}

export function OmniSaddleBridge({
  edge,
  fillColor,
  children,
  className = '',
}: OmniSaddleBridgeProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const isHorizontal = edge === 'top' || edge === 'bottom';
  const [length, setLength] = useState(336);

  useEffect(() => {
    const el = hostRef.current;
    if (!el) return;
    const sync = () => {
      const next = Math.round(isHorizontal ? el.offsetWidth : el.offsetHeight);
      if (next > 64) {
        setLength(next);
      }
    };
    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(el);
    window.addEventListener('resize', sync);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', sync);
    };
  }, [isHorizontal]);

  const thick = 34;
  const safeLen = Math.max(96, length);

  const buildPath = (): string => {
    if (edge === 'left') {
      return [
        'M 0 0',
        `C 0 12, 12 18, 24 22`,
        `C 30 24.5, ${thick} 28.5, ${thick} 35`,
        `L ${thick} ${safeLen - 35}`,
        `C ${thick} ${safeLen - 28.5}, 30 ${safeLen - 24.5}, 24 ${safeLen - 22}`,
        `C 12 ${safeLen - 18}, 0 ${safeLen - 12}, 0 ${safeLen}`,
        'Z',
      ].join(' ');
    }
    if (edge === 'right') {
      return [
        `M ${thick} 0`,
        `C ${thick} 12, ${thick - 12} 18, ${thick - 24} 22`,
        `C ${thick - 30} 24.5, 0 28.5, 0 35`,
        `L 0 ${safeLen - 35}`,
        `C 0 ${safeLen - 28.5}, ${thick - 30} ${safeLen - 24.5}, ${thick - 24} ${safeLen - 22}`,
        `C ${thick - 12} ${safeLen - 18}, ${thick} ${safeLen - 12}, ${thick} ${safeLen}`,
        'Z',
      ].join(' ');
    }
    if (edge === 'top') {
      return [
        'M 0 0',
        'C 12 0, 18 12, 22 24',
        `C 24.5 30, 28.5 ${thick}, 35 ${thick}`,
        `L ${safeLen - 35} ${thick}`,
        `C ${safeLen - 28.5} ${thick}, ${safeLen - 24.5} 30, ${safeLen - 22} 24`,
        `C ${safeLen - 18} 12, ${safeLen - 12} 0, ${safeLen} 0`,
        'Z',
      ].join(' ');
    }
    // bottom
    return [
      `M 0 ${thick}`,
      `C 12 ${thick}, 18 ${thick - 12}, 22 ${thick - 24}`,
      `C 24.5 ${thick - 30}, 28.5 0, 35 0`,
      `L ${safeLen - 35} 0`,
      `C ${safeLen - 28.5} 0, ${safeLen - 24.5} ${thick - 30}, ${safeLen - 22} ${thick - 24}`,
      `C ${safeLen - 18} ${thick - 12}, ${safeLen - 12} ${thick}, ${safeLen} ${thick}`,
      'Z',
    ].join(' ');
  };

  return (
    <div
      ref={hostRef}
      className={`relative inline-flex items-center justify-center ${
        isHorizontal ? 'h-[34px] px-[30px] py-1' : 'w-[34px] py-[30px] px-1'
      } ${className}`}
    >
      <svg
        width={isHorizontal ? safeLen : thick}
        height={isHorizontal ? thick : safeLen}
        viewBox={isHorizontal ? `0 0 ${safeLen} ${thick}` : `0 0 ${thick} ${safeLen}`}
        shapeRendering="geometricPrecision"
        aria-hidden="true"
        className="pointer-events-none select-none absolute inset-0 w-full h-full block z-0 drop-shadow-[0_2px_8px_rgba(0,0,0,0.08)] dark:drop-shadow-[0_4px_14px_rgba(0,0,0,0.45)]"
      >
        <path d={buildPath()} fill={fillColor} />
      </svg>
      <div className="relative z-10 flex items-center justify-center">{children}</div>
    </div>
  );
}

interface OmniSaddleRailProps {
  containerRef: RefObject<HTMLDivElement | null>;
  railMode: RailMode;
  onChangeRailMode: (mode: RailMode) => void;
  dockEdge: SaddleDockEdge;
  onChangeDockEdge: (edge: SaddleDockEdge) => void;
  railPos: RailPosition | null;
  onChangeRailPos: (pos: RailPosition | null) => void;
  sidebarOpen: boolean;
  floatingSidebar?: boolean;
  sidebarTab: SidebarTab;
  inspectorOpen: boolean;
  isEmptyThread: boolean;
  isSyncDisabled: boolean;
  isSyncSpinning: boolean;
  theme: 'dark' | 'light';
  onGoHomeOrNewChat: () => void;
  onToggleSection: (tab: SidebarTab) => void;
  onOpenEndpoints: () => void;
  /** v2 gateway features kept on the rail: BYOK keys panel + dashboard overlay
   *  + the live terminal request-log drawer */
  onOpenKeys: () => void;
  onOpenDashboard: () => void;
  terminalOpen: boolean;
  onToggleTerminal: () => void;
  onSyncAll: () => void;
  onToggleTheme: () => void;
}

export function OmniSaddleRail({
  containerRef,
  railMode,
  onChangeRailMode,
  dockEdge,
  onChangeDockEdge,
  railPos,
  onChangeRailPos,
  sidebarOpen,
  floatingSidebar = false,
  sidebarTab,
  inspectorOpen,
  isEmptyThread,
  isSyncDisabled,
  isSyncSpinning,
  theme,
  onGoHomeOrNewChat,
  onToggleSection,
  onOpenEndpoints,
  onOpenKeys,
  onOpenDashboard,
  terminalOpen,
  onToggleTerminal,
  onSyncAll,
  onToggleTheme,
}: OmniSaddleRailProps) {
  const asideRef = useRef<HTMLElement>(null);
  const dragRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    originX: number;
    originY: number;
    moved: boolean;
    startedFromFull: boolean;
  } | null>(null);
  const suppressClickRef = useRef(false);
  const [isDragging, setIsDragging] = useState(false);
  const [measuredExtent, setMeasuredExtent] = useState(340);

  useEffect(() => {
    const el = asideRef.current;
    if (!el || railMode === 'full' || railMode === 'full-floating') return;
    const sync = () => {
      const horiz =
        railMode === 'floating'
          ? Boolean(
              railPos &&
                (railPos.y < 52 ||
                  railPos.y > (containerRef.current?.offsetHeight || 760) - 52)
            )
          : dockEdge === 'top' || dockEdge === 'bottom';
      const next = Math.round(horiz ? el.offsetWidth : el.offsetHeight);
      if (next > 80) setMeasuredExtent(next);
    };
    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(el);
    window.addEventListener('resize', sync);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', sync);
    };
  }, [railMode, dockEdge, railPos, containerRef]);

  const handlePointerDown = (e: ReactPointerEvent<HTMLElement>) => {
    if (e.button !== 0) return;
    const asideEl = asideRef.current;
    const rootEl = containerRef.current;
    if (!asideEl || !rootEl) return;

    const rootRect = rootEl.getBoundingClientRect();
    const scaleX = rootRect.width / Math.max(1, rootEl.offsetWidth);
    const scaleY = rootRect.height / Math.max(1, rootEl.offsetHeight);

    const asideRect = asideEl.getBoundingClientRect();
    const originX = (asideRect.left - rootRect.left + asideRect.width / 2) / scaleX;
    const originY = (asideRect.top - rootRect.top + asideRect.height / 2) / scaleY;

    const startX = (e.clientX - rootRect.left) / scaleX;
    const startY = (e.clientY - rootRect.top) / scaleY;

    dragRef.current = {
      pointerId: e.pointerId,
      startX,
      startY,
      originX,
      originY,
      moved: false,
      startedFromFull: railMode === 'full' || railMode === 'full-floating',
    };
  };

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const drag = dragRef.current;
      const rootEl = containerRef.current;
      if (!drag || drag.pointerId !== e.pointerId || !rootEl) return;

      const rootRect = rootEl.getBoundingClientRect();
      const scaleX = rootRect.width / Math.max(1, rootEl.offsetWidth);
      const scaleY = rootRect.height / Math.max(1, rootEl.offsetHeight);

      const mouseX = (e.clientX - rootRect.left) / scaleX;
      const mouseY = (e.clientY - rootRect.top) / scaleY;

      const moveDist = Math.hypot(mouseX - drag.startX, mouseY - drag.startY);
      const activationDist = drag.startedFromFull ? 20 : 5;
      if (!drag.moved && moveDist > activationDist) {
        drag.moved = true;
        suppressClickRef.current = true;
        setIsDragging(true);
      }

      if (drag.moved) {
        const viewW = rootEl.offsetWidth;
        const viewH = rootEl.offsetHeight;
        const followBlend = Math.min(1, moveDist / 36);
        const grabOffsetX = (drag.originX - drag.startX) * (1 - followBlend);
        const grabOffsetY = (drag.originY - drag.startY) * (1 - followBlend);

        const raw = clampRailPosition(
          mouseX + grabOffsetX,
          mouseY + grabOffsetY,
          viewW,
          viewH,
          16
        );
        const snap = resolveRailSnapState(mouseX, mouseY, viewW, viewH);

        if (!snap.floating) {
          onChangeRailMode('saddle');
          onChangeDockEdge(snap.edge);
          onChangeRailPos(snap.pos);
        } else {
          onChangeRailMode('floating');
          onChangeRailPos(raw);
        }
      }
    };

    const onUp = (e: PointerEvent) => {
      const drag = dragRef.current;
      if (!drag || drag.pointerId !== e.pointerId) return;
      if (drag.moved) {
        setTimeout(() => {
          suppressClickRef.current = false;
        }, 60);
      } else {
        suppressClickRef.current = false;
      }
      dragRef.current = null;
      setIsDragging(false);
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
    };
  }, [containerRef, onChangeDockEdge, onChangeRailMode, onChangeRailPos]);

  // Modality 1: Classic Full-Height Docked Left Rail (spans top-to-bottom of viewport)
  if (railMode === 'full') {
    const fullBtnClass = (active: boolean) =>
      `group rail-btn ${active ? 'active' : ''}`;

    return (
      <aside
        ref={asideRef}
        aria-label="Main navigation"
        data-testid="navigation-rail"
        data-rail-mode="full"
        data-floating="false"
        data-dock-edge="left"
        onPointerDown={handlePointerDown}
        onClickCapture={(e) => {
          if (suppressClickRef.current) {
            e.stopPropagation();
            e.preventDefault();
          }
        }}
        className="hidden lg:flex shell-navigation h-full z-30"
      >
        <div className="flex flex-col items-center gap-1">
          <button
            type="button"
            onClick={onGoHomeOrNewChat}
            aria-label="Home and New chat"
            data-testid="rail-new-chat-btn"
            className={fullBtnClass(isEmptyThread)}
          >
            <HomeChatMorphLogo className="h-4.5 w-4.5" />
            <span className="dt-hover-caption dt-hover-caption-rail" role="tooltip">
              Home / Chat
            </span>
          </button>

          <button
            type="button"
            onClick={() => onToggleSection('chats')}
            aria-label="Chats"
            data-testid="rail-chats-btn"
            className={fullBtnClass(sidebarOpen && sidebarTab === 'chats')}
          >
            <FluentChat filled={sidebarOpen && sidebarTab === 'chats'} className="h-4.5 w-4.5" />
            <span className="dt-hover-caption dt-hover-caption-rail" role="tooltip">
              Chats
            </span>
          </button>

          <button
            type="button"
            onClick={() => onToggleSection('artifacts')}
            aria-label="Artifacts"
            data-testid="rail-artifacts-btn"
            className={fullBtnClass(sidebarOpen && sidebarTab === 'artifacts')}
          >
            <FluentLayers filled={sidebarOpen && sidebarTab === 'artifacts'} className="h-4.5 w-4.5" />
            <span className="dt-hover-caption dt-hover-caption-rail" role="tooltip">
              Artifacts
            </span>
          </button>

          <button
            type="button"
            onClick={() => onToggleSection('tasks')}
            aria-label="Tasks"
            data-testid="rail-tasks-btn"
            className={fullBtnClass(sidebarOpen && sidebarTab === 'tasks')}
          >
            <FluentChecklist filled={sidebarOpen && sidebarTab === 'tasks'} className="h-4.5 w-4.5" />
            <span className="dt-hover-caption dt-hover-caption-rail" role="tooltip">
              Tasks
            </span>
          </button>

          <button
            type="button"
            onClick={() => onToggleSection('models')}
            aria-label="Models"
            data-testid="rail-models-btn"
            className={fullBtnClass(sidebarOpen && sidebarTab === 'models')}
          >
            <FluentModel className="h-4.5 w-4.5" />
            <span className="dt-hover-caption dt-hover-caption-rail" role="tooltip">
              Models
            </span>
          </button>

          <button
            type="button"
            onClick={onOpenEndpoints}
            aria-label="GET Endpoints"
            data-testid="rail-endpoints-btn"
            className={fullBtnClass(inspectorOpen)}
          >
            <FluentTerminal filled={inspectorOpen} className="h-4.5 w-4.5" />
            <span className="dt-hover-caption dt-hover-caption-rail" role="tooltip">
              GET Endpoints
            </span>
          </button>

          <button
            type="button"
            onClick={onOpenKeys}
            aria-label="Chaves (BYOK)"
            data-testid="rail-keys-btn"
            className={fullBtnClass(false)}
          >
            <FluentKey className="h-4.5 w-4.5" />
            <span className="dt-hover-caption dt-hover-caption-rail" role="tooltip">
              Chaves (BYOK)
            </span>
          </button>

          <button
            type="button"
            onClick={onOpenDashboard}
            aria-label="Gateway Dashboard"
            data-testid="rail-dashboard-btn"
            className={fullBtnClass(false)}
          >
            <FluentChartBar className="h-4.5 w-4.5" />
            <span className="dt-hover-caption dt-hover-caption-rail" role="tooltip">
              Gateway Dashboard
            </span>
          </button>

          <button
            type="button"
            onClick={onToggleTerminal}
            aria-label="Terminal"
            data-testid="rail-terminal-btn"
            className={fullBtnClass(terminalOpen)}
          >
            <FluentScrollText filled={terminalOpen} className="h-4.5 w-4.5" />
            <span className="dt-hover-caption dt-hover-caption-rail" role="tooltip">
              Terminal
            </span>
          </button>

          <button
            type="button"
            onClick={() => onToggleSection('params')}
            aria-label="Parameters"
            data-testid="rail-params-btn"
            className={fullBtnClass(sidebarOpen && sidebarTab === 'params')}
          >
            <FluentSliders className="h-4.5 w-4.5" />
            <span className="dt-hover-caption dt-hover-caption-rail" role="tooltip">
              Parameters
            </span>
          </button>

          <button
            type="button"
            onClick={() => onToggleSection('settings')}
            aria-label="Settings"
            data-testid="rail-settings-btn"
            className={fullBtnClass(sidebarOpen && sidebarTab === 'settings')}
          >
            <FluentSettings filled={sidebarOpen && sidebarTab === 'settings'} className="h-4.5 w-4.5" />
            <span className="dt-hover-caption dt-hover-caption-rail" role="tooltip">
              Settings
            </span>
          </button>
        </div>

        <div className="flex flex-col items-center gap-1">
          <button
            type="button"
            onClick={onSyncAll}
            disabled={isSyncDisabled}
            aria-label="Sync models and gateway history"
            data-testid="rail-sync-btn"
            className={`${fullBtnClass(false)} disabled:opacity-45 disabled:cursor-not-allowed`}
          >
            <FluentArrowSync className={`h-4.5 w-4.5 ${isSyncSpinning ? 'animate-spin' : ''}`} />
            <span className="dt-hover-caption dt-hover-caption-rail" role="tooltip">
              Sync
            </span>
          </button>

          <button
            type="button"
            onClick={onToggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            data-testid="rail-theme-btn"
            className={`${fullBtnClass(false)} ${theme === 'dark' ? '!text-amber-300' : ''}`}
          >
            {theme === 'dark' ? <FluentSun className="h-4.5 w-4.5" /> : <FluentMoon className="h-4.5 w-4.5" />}
            <span className="dt-hover-caption dt-hover-caption-rail" role="tooltip">
              {theme === 'dark' ? 'Light mode' : 'Dark mode'}
            </span>
          </button>
        </div>
      </aside>
    );
  }

  // Modality 2: Full-Height Floating Frosted Bar (Reference Balanced 3D Texture & Spacing, aligned 1:1 with Expandable Box)
  if (railMode === 'full-floating') {
    const ffBtnClass = (active: boolean) =>
      `group rail-btn ${active ? 'active' : ''}`;

    const ffTooltip = (label: string) =>
      isDragging ? null : (
        <span className="dt-hover-caption dt-hover-caption-rail" role="tooltip">
          {label}
        </span>
      );

    return (
      <aside
        ref={asideRef}
        aria-label="Main navigation"
        data-testid="navigation-rail"
        data-rail-mode="full-floating"
        data-floating="true"
        data-dock-edge="left"
        onPointerDown={handlePointerDown}
        onClickCapture={(e) => {
          if (suppressClickRef.current) {
            e.stopPropagation();
            e.preventDefault();
          }
        }}
        style={{ touchAction: 'none' }}
        className={`hidden lg:flex relative z-20 h-full shell-navigation-floating select-none ${
          isDragging ? 'cursor-grabbing scale-[1.02]' : 'cursor-grab'
        }`}
      >
        <div className="flex flex-col items-center gap-1">
          <button
            type="button"
            onClick={onGoHomeOrNewChat}
            aria-label="Home and New chat"
            data-testid="rail-new-chat-btn"
            className={ffBtnClass(isEmptyThread)}
          >
            <HomeChatMorphLogo className="h-4.5 w-4.5" />
            {ffTooltip('Home / Chat')}
          </button>

          <button
            type="button"
            onClick={() => onToggleSection('chats')}
            aria-label="Chats"
            data-testid="rail-chats-btn"
            className={ffBtnClass(sidebarOpen && sidebarTab === 'chats')}
          >
            <FluentChat filled={sidebarOpen && sidebarTab === 'chats'} className="h-4.5 w-4.5" />
            {ffTooltip('Chats')}
          </button>

          <button
            type="button"
            onClick={() => onToggleSection('artifacts')}
            aria-label="Artifacts"
            data-testid="rail-artifacts-btn"
            className={ffBtnClass(sidebarOpen && sidebarTab === 'artifacts')}
          >
            <FluentLayers filled={sidebarOpen && sidebarTab === 'artifacts'} className="h-4.5 w-4.5" />
            {ffTooltip('Artifacts')}
          </button>

          <button
            type="button"
            onClick={() => onToggleSection('tasks')}
            aria-label="Tasks"
            data-testid="rail-tasks-btn"
            className={ffBtnClass(sidebarOpen && sidebarTab === 'tasks')}
          >
            <FluentChecklist filled={sidebarOpen && sidebarTab === 'tasks'} className="h-4.5 w-4.5" />
            {ffTooltip('Tasks')}
          </button>

          <button
            type="button"
            onClick={() => onToggleSection('models')}
            aria-label="Models"
            data-testid="rail-models-btn"
            className={ffBtnClass(sidebarOpen && sidebarTab === 'models')}
          >
            <FluentModel className="h-4.5 w-4.5" />
            {ffTooltip('Models')}
          </button>

          <button
            type="button"
            onClick={onOpenEndpoints}
            aria-label="GET Endpoints"
            data-testid="rail-endpoints-btn"
            className={ffBtnClass(inspectorOpen)}
          >
            <FluentTerminal filled={inspectorOpen} className="h-4.5 w-4.5" />
            {ffTooltip('GET Endpoints')}
          </button>

          <button
            type="button"
            onClick={onOpenKeys}
            aria-label="Chaves (BYOK)"
            data-testid="rail-keys-btn"
            className={ffBtnClass(false)}
          >
            <FluentKey className="h-4.5 w-4.5" />
            {ffTooltip('Chaves (BYOK)')}
          </button>

          <button
            type="button"
            onClick={onOpenDashboard}
            aria-label="Gateway Dashboard"
            data-testid="rail-dashboard-btn"
            className={ffBtnClass(false)}
          >
            <FluentChartBar className="h-4.5 w-4.5" />
            {ffTooltip('Gateway Dashboard')}
          </button>

          <button
            type="button"
            onClick={onToggleTerminal}
            aria-label="Terminal"
            data-testid="rail-terminal-btn"
            className={ffBtnClass(terminalOpen)}
          >
            <FluentScrollText filled={terminalOpen} className="h-4.5 w-4.5" />
            {ffTooltip('Terminal')}
          </button>

          <button
            type="button"
            onClick={() => onToggleSection('params')}
            aria-label="Parameters"
            data-testid="rail-params-btn"
            className={ffBtnClass(sidebarOpen && sidebarTab === 'params')}
          >
            <FluentSliders className="h-4.5 w-4.5" />
            {ffTooltip('Parameters')}
          </button>

          <button
            type="button"
            onClick={() => onToggleSection('settings')}
            aria-label="Settings"
            data-testid="rail-settings-btn"
            className={ffBtnClass(sidebarOpen && sidebarTab === 'settings')}
          >
            <FluentSettings filled={sidebarOpen && sidebarTab === 'settings'} className="h-4.5 w-4.5" />
            {ffTooltip('Settings')}
          </button>
        </div>

        <div className="flex flex-col items-center gap-1">
          <button
            type="button"
            onClick={onSyncAll}
            disabled={isSyncDisabled}
            aria-label="Sync models and gateway history"
            data-testid="rail-sync-btn"
            className={`${ffBtnClass(false)} disabled:opacity-45 disabled:cursor-not-allowed`}
          >
            <FluentArrowSync className={`h-4.5 w-4.5 ${isSyncSpinning ? 'animate-spin' : ''}`} />
            {ffTooltip('Sync')}
          </button>

          <button
            type="button"
            onClick={onToggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            data-testid="rail-theme-btn"
            className={`${ffBtnClass(false)} ${theme === 'dark' ? '!text-amber-300' : ''}`}
          >
            {theme === 'dark' ? <FluentSun className="h-4.5 w-4.5" /> : <FluentMoon className="h-4.5 w-4.5" />}
            {ffTooltip(theme === 'dark' ? 'Light mode' : 'Dark mode')}
          </button>
        </div>
      </aside>
    );
  }

  // Modalities 3 & 4: Unconstrained 4-Edge Saddle Rail OR Floating Frosted Capsule (over entire .desktop-shell)
  const isFloating = railMode === 'floating';
  const viewW =
    containerRef.current?.offsetWidth ||
    (typeof window !== 'undefined' ? window.innerWidth / 1.1 : 1200);
  const viewH =
    containerRef.current?.offsetHeight ||
    (typeof window !== 'undefined' ? window.innerHeight / 1.1 : 760);

  const isHorizontalBar = isFloating
    ? Boolean(railPos && (railPos.y < 52 || railPos.y > viewH - 52))
    : dockEdge === 'top' || dockEdge === 'bottom';

  const tooltipPosClass = isFloating
    ? isHorizontalBar
      ? railPos && railPos.y < 120
        ? 'top-11 left-1/2 -translate-x-1/2'
        : 'bottom-11 left-1/2 -translate-x-1/2'
      : railPos && railPos.x > viewW / 2
        ? 'right-11 top-1/2 -translate-y-1/2'
        : 'left-11 top-1/2 -translate-y-1/2'
    : dockEdge === 'left'
      ? 'left-9 top-1/2 -translate-y-1/2'
      : dockEdge === 'right'
        ? 'right-9 top-1/2 -translate-y-1/2'
        : dockEdge === 'top'
          ? 'top-9 left-1/2 -translate-x-1/2'
          : 'bottom-9 left-1/2 -translate-x-1/2';

  const asideStyle: CSSProperties = {
    touchAction: 'none',
  };

  const halfExtent = Math.max(150, Math.round(measuredExtent / 2) + 8);

  if (isFloating) {
    const safePos = railPos
      ? clampRailPosition(railPos.x, railPos.y, viewW, viewH, 24)
      : { x: 30, y: Math.round(viewH * 0.54) };
    asideStyle.left = `${safePos.x}px`;
    asideStyle.top = `${safePos.y}px`;
    asideStyle.transform = 'translate(-50%, -50%)';
  } else if (dockEdge === 'left') {
    const maxCenterY = Math.max(halfExtent, viewH - halfExtent);
    const safeY = railPos
      ? Math.max(halfExtent, Math.min(maxCenterY, railPos.y))
      : Math.round(viewH * 0.54);
    asideStyle.left = '0px';
    asideStyle.top = `${safeY}px`;
    asideStyle.transform = 'translateY(-50%)';
  } else if (dockEdge === 'right') {
    const maxCenterY = Math.max(halfExtent, viewH - halfExtent);
    const safeY = railPos
      ? Math.max(halfExtent, Math.min(maxCenterY, railPos.y))
      : Math.round(viewH * 0.54);
    asideStyle.right = '0px';
    asideStyle.top = `${safeY}px`;
    asideStyle.transform = 'translateY(-50%)';
  } else if (dockEdge === 'top') {
    const maxCenterX = Math.max(halfExtent, viewW - halfExtent);
    const safeX = railPos
      ? Math.max(halfExtent, Math.min(maxCenterX, railPos.x))
      : Math.round(viewW * 0.5);
    asideStyle.top = '0px';
    asideStyle.left = `${safeX}px`;
    asideStyle.transform = 'translateX(-50%)';
  } else {
    const maxCenterX = Math.max(halfExtent, viewW - halfExtent);
    const safeX = railPos
      ? Math.max(halfExtent, Math.min(maxCenterX, railPos.x))
      : Math.round(viewW * 0.5);
    asideStyle.bottom = '0px';
    asideStyle.left = `${safeX}px`;
    asideStyle.transform = 'translateX(-50%)';
  }

  const iconSizeClass = isFloating ? 'h-[17px] w-[17px]' : 'h-3.5 w-3.5';
  const btnClass = (active: boolean) =>
    `group rail-btn ${isFloating ? 'rail-btn-compact' : 'rail-btn-saddle'} ${
      active ? 'active' : ''
    }`;

  const renderTooltip = (label: string) =>
    isDragging ? null : (
      <span
        className={`pointer-events-none absolute ${tooltipPosClass} px-2.5 py-1 rounded-[8px] squircle bg-[var(--dk-primary-action)] text-[var(--dk-primary-action-text)] text-[11px] font-semibold opacity-0 group-hover:opacity-100 transition whitespace-nowrap z-50 shadow-md`}
        role="tooltip"
      >
        {label}
      </span>
    );

  const renderButtons = () => (
    <>
      <button
        type="button"
        onClick={onGoHomeOrNewChat}
        aria-label="Home and New chat"
        data-testid="rail-new-chat-btn"
        className={btnClass(isEmptyThread)}
      >
        <HomeChatMorphLogo className={iconSizeClass} />
        {renderTooltip('Home / Chat')}
      </button>

      <button
        type="button"
        onClick={() => onToggleSection('chats')}
        aria-label="Chats"
        data-testid="rail-chats-btn"
        className={btnClass(sidebarOpen && sidebarTab === 'chats')}
      >
        <FluentChat filled={sidebarOpen && sidebarTab === 'chats'} className={iconSizeClass} />
        {renderTooltip('Chats')}
      </button>

      <button
        type="button"
        onClick={() => onToggleSection('artifacts')}
        aria-label="Artifacts"
        data-testid="rail-artifacts-btn"
        className={btnClass(sidebarOpen && sidebarTab === 'artifacts')}
      >
        <FluentLayers
          filled={sidebarOpen && sidebarTab === 'artifacts'}
          className={iconSizeClass}
        />
        {renderTooltip('Artifacts')}
      </button>

      <button
        type="button"
        onClick={() => onToggleSection('tasks')}
        aria-label="Tasks"
        data-testid="rail-tasks-btn"
        className={btnClass(sidebarOpen && sidebarTab === 'tasks')}
      >
        <FluentChecklist
          filled={sidebarOpen && sidebarTab === 'tasks'}
          className={iconSizeClass}
        />
        {renderTooltip('Tasks')}
      </button>

      <button
        type="button"
        onClick={() => onToggleSection('models')}
        aria-label="Models"
        data-testid="rail-models-btn"
        className={btnClass(sidebarOpen && sidebarTab === 'models')}
      >
        <FluentModel className={iconSizeClass} />
        {renderTooltip('Models')}
      </button>

      <button
        type="button"
        onClick={onOpenEndpoints}
        aria-label="GET Endpoints"
        data-testid="rail-endpoints-btn"
        className={btnClass(inspectorOpen)}
      >
        <FluentTerminal filled={inspectorOpen} className={iconSizeClass} />
        {renderTooltip('GET Endpoints')}
      </button>

      <button
        type="button"
        onClick={onOpenKeys}
        aria-label="Chaves (BYOK)"
        data-testid="rail-keys-btn"
        className={btnClass(false)}
      >
        <FluentKey className={iconSizeClass} />
        {renderTooltip('Chaves (BYOK)')}
      </button>

      <button
        type="button"
        onClick={onOpenDashboard}
        aria-label="Gateway Dashboard"
        data-testid="rail-dashboard-btn"
        className={btnClass(false)}
      >
        <FluentChartBar className={iconSizeClass} />
        {renderTooltip('Gateway Dashboard')}
      </button>

      <button
        type="button"
        onClick={onToggleTerminal}
        aria-label="Terminal"
        data-testid="rail-terminal-btn"
        className={btnClass(terminalOpen)}
      >
        <FluentScrollText filled={terminalOpen} className={iconSizeClass} />
        {renderTooltip('Terminal')}
      </button>

      <button
        type="button"
        onClick={() => onToggleSection('params')}
        aria-label="Parameters"
        data-testid="rail-params-btn"
        className={btnClass(sidebarOpen && sidebarTab === 'params')}
      >
        <FluentSliders className={iconSizeClass} />
        {renderTooltip('Parameters')}
      </button>

      <button
        type="button"
        onClick={() => onToggleSection('settings')}
        aria-label="Settings"
        data-testid="rail-settings-btn"
        className={btnClass(sidebarOpen && sidebarTab === 'settings')}
      >
        <FluentSettings
          filled={sidebarOpen && sidebarTab === 'settings'}
          className={iconSizeClass}
        />
        {renderTooltip('Settings')}
      </button>

      <span
        aria-hidden="true"
        className={
          isHorizontalBar
            ? 'h-4 w-px bg-[var(--dk-panel-divider)] mx-0.5'
            : 'w-4 h-px bg-[var(--dk-panel-divider)] my-0.5'
        }
      />

      <button
        type="button"
        onClick={onSyncAll}
        disabled={isSyncDisabled}
        aria-label="Sync models and gateway history"
        data-testid="rail-sync-btn"
        className={`${btnClass(false)} disabled:opacity-45 disabled:cursor-not-allowed`}
      >
        <FluentArrowSync
          className={`${iconSizeClass} ${isSyncSpinning ? 'animate-spin' : ''}`}
        />
        {renderTooltip('Sync')}
      </button>

      <button
        type="button"
        onClick={onToggleTheme}
        aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        data-testid="rail-theme-btn"
        className={`${btnClass(false)} ${
          theme === 'dark' ? '!text-amber-300' : ''
        }`}
      >
        {theme === 'dark' ? (
          <FluentSun className={iconSizeClass} />
        ) : (
          <FluentMoon className={iconSizeClass} />
        )}
        {renderTooltip(theme === 'dark' ? 'Light mode' : 'Dark mode')}
      </button>
    </>
  );

  return (
    <aside
      ref={asideRef}
      aria-label="Main navigation"
      data-testid="navigation-rail"
      data-rail-mode={railMode}
      data-floating={isFloating ? 'true' : 'false'}
      data-dock-edge={dockEdge}
      onPointerDown={handlePointerDown}
      onClickCapture={(e) => {
        if (suppressClickRef.current) {
          e.stopPropagation();
          e.preventDefault();
        }
      }}
      style={asideStyle}
      className={`hidden lg:flex absolute z-50 items-center justify-center select-none ${
        isDragging ? 'cursor-grabbing scale-[1.03]' : 'cursor-grab'
      }`}
    >
      {isFloating ? (
        <div
          className={`dt-rail-capsule flex ${
            isHorizontalBar ? 'flex-row px-2 py-1.5' : 'flex-col py-2 px-1.5'
          } items-center gap-1`}
        >
          {renderButtons()}
        </div>
      ) : (
        <OmniSaddleBridge
          edge={dockEdge}
          fillColor="var(--dk-workspace-surface)"
        >
          <div
            className={`flex ${
              isHorizontalBar ? 'flex-row' : 'flex-col'
            } items-center gap-1`}
          >
            {renderButtons()}
          </div>
        </OmniSaddleBridge>
      )}
    </aside>
  );
}
