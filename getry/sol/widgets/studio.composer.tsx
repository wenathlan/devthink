import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import { createPortal } from 'react-dom';
import { formatCompactTokens } from '../../studio.client';
import type {
  ChatImageAttachment,
  DiscoveredModel,
  RouteDiscoveryResult,
  RouteName,
  Workspace
} from '../../studio.client';
import {
  formatEffortDynamicLabel,
  getReasoningStepIndex,
  isMaxEffortLevel,
  resolveEffortChroma,
  stepReasoningLevelByDelta,
  type PermissionMode,
} from '../../studio.uiprefs';
import { isDefaultEmptyConversationTitle, useGtxLanguage } from '../../studio.gtx';
import {
  TranslucentEffortSpectrum,
  TranslucentMeterSlider,
} from './studio.sliders';
import {
  FluentArrowUp,
  FluentBolt,
  FluentChartBar,
  FluentCheck,
  FluentChevronDown,
  FluentCode,
  FluentDismiss,
  FluentDocumentText,
  FluentEraser,
  FluentEye,
  FluentFolder,
  FluentImageAdd,
  FluentMic,
  FluentModel,
  FluentPlus,
  FluentSearch,
  FluentSend,
  FluentShield,
  FluentSliders,
  FluentStop,
  FluentWand,
} from './studio.icons';

interface SpeechRecognitionInstance {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((ev: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: ((ev: { error?: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

interface ComposerProps {
  input: string;
  onChangeInput: (val: string) => void;
  images: ChatImageAttachment[];
  onAddImages: (files: FileList) => void;
  onRemoveImage: (id: string) => void;
  onSend: () => void;
  onStop: () => void;
  isStreaming: boolean;
  activeRoute: RouteName;
  activeModel?: DiscoveredModel;
  activeModelId: string;
  discoveredModels: DiscoveredModel[];
  routeResults: RouteDiscoveryResult[];
  onSelectModel: (route: RouteName, modelId: string) => void;
  workspaces: Workspace[];
  activeWorkspaceId: string;
  onSelectWorkspace: (workspaceId: string) => void;
  onCreateWorkspace: (name: string) => void;
  onNewSessionInWorkspace: (workspaceId?: string) => void;
  activeSessionTitle?: string;
  permissionMode: PermissionMode;
  onChangePermissionMode: (mode: PermissionMode) => void;
  temperature: number;
  onChangeTemperature: (val: number) => void;
  thinkingLevel: string;
  thinkingLevels: Record<string, number>;
  onChangeThinkingLevel: (level: string) => void;
  centered?: boolean;
  attachSignal?: number;
  focusSignal?: number;
}

export function Composer({
  input,
  onChangeInput,
  images,
  onAddImages,
  onRemoveImage,
  onSend,
  onStop,
  isStreaming,
  activeRoute,
  activeModel,
  activeModelId,
  discoveredModels,
  routeResults,
  onSelectModel,
  workspaces,
  activeWorkspaceId,
  onSelectWorkspace,
  onCreateWorkspace,
  onNewSessionInWorkspace,
  activeSessionTitle,
  permissionMode,
  onChangePermissionMode,
  temperature,
  onChangeTemperature,
  thinkingLevel,
  thinkingLevels,
  onChangeThinkingLevel,
  centered = false,
  attachSignal = 0,
  focusSignal = 0,
}: ComposerProps) {
  const { lang } = useGtxLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const popoverAnchorRef = useRef<HTMLDivElement>(null);
  const wheelZoneRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const inputLatestRef = useRef(input);
  inputLatestRef.current = input;
  const dragEffortSessionRef = useRef<{
    pointerId: number;
    startY: number;
    startIdx: number;
    moved: boolean;
  } | null>(null);
  const suppressModelClickRef = useRef(false);
  const wheelDeltaAccumRef = useRef(0);
  const wheelCallbackRef = useRef<(e: WheelEvent) => void>(() => {});

  const [popoverOpen, setPopoverOpen] = useState(false);
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const [workspaceOpen, setWorkspaceOpen] = useState(false);
  const [permissionsOpen, setPermissionsOpen] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const [modelQuery, setModelQuery] = useState('');
  const [routeFilter, setRouteFilter] = useState<string>('all');
  const [visionOnly, setVisionOnly] = useState(false);
  const [isDictating, setIsDictating] = useState(false);
  const [dictationNotice, setDictationNotice] = useState<string | null>(null);
  const [isDraggingModelEffort, setIsDraggingModelEffort] = useState(false);

  const multimodalTemplates = useMemo(
    () => [
      {
        id: 'ui-audit',
        title: 'Analyze UI',
        text: 'Review layout, spacing, hierarchy, and propose visual improvements.',
        Icon: FluentEye,
        iconClass: 'text-[var(--dk-brand)]',
      },
      {
        id: 'code-arch',
        title: 'Code & Architecture',
        text: 'Review this architecture, diagnose bottlenecks, and suggest cleaner alternatives.',
        Icon: FluentCode,
        iconClass: 'text-sky-500',
      },
      {
        id: 'gen-visual',
        title: 'Create Visual',
        text: '/image minimalist futuristic isometric workspace illustration, glassmorphism, soft cyan lighting',
        Icon: FluentWand,
        iconClass: 'text-amber-500',
      },
      {
        id: 'compare',
        title: 'Compare Trade-offs',
        text: 'Compare architectural options using a clear trade-offs table and recommendation.',
        Icon: FluentChartBar,
        iconClass: 'text-emerald-600 dark:text-emerald-400',
      },
    ],
    []
  );

  const permissionOptions = useMemo(
    () => [
      {
        mode: 'full' as PermissionMode,
        label: 'Full',
        Icon: FluentBolt,
        iconClass: 'text-amber-500',
      },
      {
        mode: 'assisted' as PermissionMode,
        label: 'Assisted',
        Icon: FluentShield,
        iconClass: 'text-[var(--dk-brand)]',
      },
      {
        mode: 'readonly' as PermissionMode,
        label: 'Read-only',
        Icon: FluentEye,
        iconClass: 'text-emerald-600 dark:text-emerald-400',
      },
    ],
    []
  );

  const permissionLabel =
    permissionMode === 'full'
      ? 'Full'
      : permissionMode === 'assisted'
        ? 'Assisted'
        : 'Read-only';

  useEffect(() => {
    if (attachSignal > 0) {
      fileInputRef.current?.click();
    }
  }, [attachSignal]);

  useEffect(() => {
    if (focusSignal > 0) {
      textareaRef.current?.focus();
    }
  }, [focusSignal]);

  const activeWorkspace = useMemo(
    () => workspaces.find((w) => w.id === activeWorkspaceId) ?? workspaces[0],
    [workspaces, activeWorkspaceId]
  );

  const allThinkingKeys = useMemo(
    () => ['default', ...Object.keys(thinkingLevels)],
    [thinkingLevels]
  );

  const isMaxEffort = useMemo(
    () => isMaxEffortLevel(allThinkingKeys, thinkingLevel),
    [allThinkingKeys, thinkingLevel]
  );

  const effortChroma = useMemo(
    () => resolveEffortChroma(allThinkingKeys, thinkingLevel),
    [allThinkingKeys, thinkingLevel]
  );

  const handleModelTriggerPointerDown = (e: ReactPointerEvent<HTMLButtonElement>) => {
    if (e.button !== 0 && e.button !== 1 && e.pointerType === 'mouse') return;
    if (e.button === 1) {
      e.preventDefault();
    }
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // ignore if unsupported
    }
    dragEffortSessionRef.current = {
      pointerId: e.pointerId,
      startY: e.clientY,
      startIdx: getReasoningStepIndex(allThinkingKeys, thinkingLevel),
      moved: false,
    };
  };

  const handleModelTriggerPointerMove = (e: ReactPointerEvent<HTMLButtonElement>) => {
    const session = dragEffortSessionRef.current;
    if (!session || session.pointerId !== e.pointerId) return;
    const dy = session.startY - e.clientY;
    if (!session.moved) {
      if (Math.abs(dy) < 6) return;
      session.moved = true;
      setIsDraggingModelEffort(true);
    }
    if (allThinkingKeys.length <= 1) return;
    const stepDelta =
      dy > 0
        ? Math.max(1, Math.floor((dy - 6) / 12) + 1)
        : -Math.max(1, Math.floor((-dy - 6) / 12) + 1);
    const startLevel = allThinkingKeys[session.startIdx] ?? thinkingLevel;
    const nextLevel = stepReasoningLevelByDelta(allThinkingKeys, startLevel, stepDelta, {
      wrap: false,
    });
    if (nextLevel && nextLevel !== thinkingLevel) {
      onChangeThinkingLevel(nextLevel);
    }
  };

  const finishModelTriggerPointerDrag = (e: ReactPointerEvent<HTMLButtonElement>) => {
    const session = dragEffortSessionRef.current;
    if (!session || session.pointerId !== e.pointerId) return;
    dragEffortSessionRef.current = null;
    setIsDraggingModelEffort(false);
    try {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    } catch {
      // ignore
    }
    if (session.moved) {
      suppressModelClickRef.current = true;
      window.setTimeout(() => {
        suppressModelClickRef.current = false;
      }, 80);
    }
  };

  wheelCallbackRef.current = (e: WheelEvent) => {
    if (allThinkingKeys.length <= 1) return;
    if (popoverOpen || templatesOpen || workspaceOpen || permissionsOpen) return;

    const textarea = textareaRef.current;
    if (textarea && textarea.contains(e.target as Node)) {
      const hasOverflow = textarea.scrollHeight > textarea.clientHeight + 2;
      if (hasOverflow) {
        const canScrollDown =
          e.deltaY > 0 && textarea.scrollTop + textarea.clientHeight < textarea.scrollHeight - 1;
        const canScrollUp = e.deltaY < 0 && textarea.scrollTop > 1;
        if (canScrollDown || canScrollUp) {
          return;
        }
      }
    }

    const rawDelta =
      e.deltaMode === 1 ? e.deltaY * 16 : e.deltaMode === 2 ? e.deltaY * 120 : e.deltaY;
    if (!Number.isFinite(rawDelta) || Math.abs(rawDelta) < 0.5) return;

    e.preventDefault();
    e.stopPropagation();

    if (wheelDeltaAccumRef.current * rawDelta < 0) {
      wheelDeltaAccumRef.current = 0;
    }
    wheelDeltaAccumRef.current += rawDelta;
    if (Math.abs(wheelDeltaAccumRef.current) < 24) return;

    const stepDir = wheelDeltaAccumRef.current < 0 ? 1 : -1;
    wheelDeltaAccumRef.current = 0;

    const nextLevel = stepReasoningLevelByDelta(allThinkingKeys, thinkingLevel, stepDir, {
      wrap: true,
    });
    if (nextLevel && nextLevel !== thinkingLevel) {
      onChangeThinkingLevel(nextLevel);
    }
  };

  useEffect(() => {
    const el = wheelZoneRef.current;
    if (!el) return;
    const listener = (ev: WheelEvent) => wheelCallbackRef.current(ev);
    el.addEventListener('wheel', listener, { passive: false });
    return () => el.removeEventListener('wheel', listener);
  }, []);

  const availableRoutes = useMemo(() => {
    const ordered = ['v1', 'v2', 'v3', 'v4', 'v5'];
    const present = routeResults.map((r) => r.route);
    return ordered
      .filter((r) => present.includes(r))
      .concat(present.filter((r) => !ordered.includes(r)));
  }, [routeResults]);

  const filteredModels = useMemo(() => {
    const pool: DiscoveredModel[] =
      routeFilter === 'all'
        ? discoveredModels
        : routeResults.find((r) => r.route === routeFilter)?.models ?? [];
    const q = modelQuery.trim().toLowerCase();
    return pool.filter((m) => {
      if (visionOnly && !m.supportsVision) return false;
      if (!q) return true;
      return m.id.toLowerCase().includes(q) || m.ownedBy.toLowerCase().includes(q);
    });
  }, [discoveredModels, routeResults, routeFilter, visionOnly, modelQuery]);

  const closeAllPopovers = () => {
    setPopoverOpen(false);
    setTemplatesOpen(false);
    setWorkspaceOpen(false);
    setPermissionsOpen(false);
  };

  useEffect(() => {
    if (!popoverOpen && !templatesOpen && !workspaceOpen && !permissionsOpen) return;
    const handlePointerDown = (e: MouseEvent) => {
      if (
        popoverAnchorRef.current &&
        !popoverAnchorRef.current.contains(e.target as Node)
      ) {
        if (!templatesOpen && !(centered && popoverOpen) && !permissionsOpen) {
          closeAllPopovers();
        }
      }
    };
    const handleKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeAllPopovers();
      }
    };
    document.addEventListener('mousedown', handlePointerDown);
    window.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      window.removeEventListener('keydown', handleKey);
    };
  }, [popoverOpen, templatesOpen, workspaceOpen, permissionsOpen, centered]);

  useEffect(() => {
    return () => {
      try {
        recognitionRef.current?.stop();
      } catch {
        // ignore cleanup
      }
    };
  }, []);

  const toggleDictation = () => {
    if (isDictating) {
      try {
        recognitionRef.current?.stop();
      } catch {
        // ignore
      }
      setIsDictating(false);
      return;
    }

    const win = window as unknown as {
      SpeechRecognition?: new () => SpeechRecognitionInstance;
      webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
    };
    const SpeechRec = win.SpeechRecognition || win.webkitSpeechRecognition;

    if (!SpeechRec) {
      setDictationNotice('Voice input unavailable in this browser.');
      setTimeout(() => setDictationNotice(null), 2800);
      return;
    }

    try {
      const rec = new SpeechRec();
      rec.lang =
        lang === 'pt'
          ? 'pt-BR'
          : lang === 'es'
            ? 'es-ES'
            : lang === 'fr'
              ? 'fr-FR'
              : lang === 'de'
                ? 'de-DE'
                : lang === 'ja'
                  ? 'ja-JP'
                  : 'en-US';
      rec.continuous = false;
      rec.interimResults = false;
      rec.onresult = (event) => {
        let transcript = '';
        for (let i = 0; i < event.results.length; i++) {
          const item = event.results[i]?.[0]?.transcript;
          if (item) transcript += (transcript ? ' ' : '') + item.trim();
        }
        if (transcript) {
          const base = inputLatestRef.current.trim();
          onChangeInput(base ? `${base} ${transcript}` : transcript);
        }
      };
      rec.onerror = () => {
        setIsDictating(false);
        setDictationNotice('Voice capture failed. Check microphone permission.');
        setTimeout(() => setDictationNotice(null), 2600);
      };
      rec.onend = () => {
        setIsDictating(false);
      };
      recognitionRef.current = rec;
      rec.start();
      setDictationNotice(null);
      setIsDictating(true);
    } catch {
      setIsDictating(false);
      setDictationNotice('Could not start dictation.');
      setTimeout(() => setDictationNotice(null), 2600);
    }
  };

  const canSend =
    !isStreaming &&
    Boolean(activeModelId) &&
    (input.trim().length > 0 || images.length > 0);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (canSend) {
        onSend();
      }
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onAddImages(e.target.files);
      e.target.value = '';
    }
  };

  const handleCreateNewWorkspace = () => {
    const trimmed = newWorkspaceName.trim();
    if (!trimmed) return;
    onCreateWorkspace(trimmed);
    setNewWorkspaceName('');
    setWorkspaceOpen(false);
  };

  const compactModelName = activeModelId
    ? activeModelId.split('/').pop() || activeModelId
    : 'Model';

  const isImageCommand = /^\/(image|imagem|img)\b/i.test(input.trim());
  const imageCommandPrefix = '/image';

  const tempToneLabel =
    temperature <= 0.3
      ? 'Precise'
      : temperature <= 0.9
        ? 'Balanced'
        : 'Creative';

  const modelSelectorCard = (
    <div
      className={`flex flex-col min-h-0 ${
        centered ? 'max-h-[84vh]' : 'max-h-[min(68vh,470px)]'
      }`}
    >
      <div className="border-b border-[var(--dk-panel-divider)] px-3.5 py-3 space-y-2.5 shrink-0">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <FluentModel className="h-4 w-4 text-[var(--dk-brand)] shrink-0" />
            <span className="font-display text-xs font-bold text-[var(--dk-text)]">
              Select model
            </span>
          </div>
          <button
            type="button"
            onClick={() => setPopoverOpen(false)}
            aria-label="Close model selector"
            className="text-[var(--dk-text-3)] hover:text-[var(--dk-text)] cursor-pointer"
          >
            <FluentDismiss className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="relative">
          <FluentSearch className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--dk-text-3)]" />
          <input
            type="text"
            value={modelQuery}
            onChange={(e) => setModelQuery(e.target.value)}
            placeholder="Search model or route..."
            aria-label="Search model"
            // biome-ignore lint/a11y/noAutofocus: the immediate focus is the flow the picker opens for — the search field answers ready to type the same way every command palette does
            autoFocus
            className="w-full rounded-[10px] squircle border border-[var(--dk-matte-edge)] bg-[var(--dk-surface-2)] py-1.5 pl-8 pr-7 text-xs text-[var(--dk-text)] placeholder:text-[var(--dk-text-3)] focus:border-[var(--dk-brand)] focus:outline-none"
          />
          {modelQuery && (
            <button
              type="button"
              onClick={() => setModelQuery('')}
              aria-label="Clear search"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--dk-text-3)] hover:text-[var(--dk-text)] cursor-pointer"
            >
              <FluentDismiss className="h-3 w-3" />
            </button>
          )}
        </div>

        {/* Route Filter Tabs (/v1–/v5) */}
        <div className="flex items-center justify-between gap-1.5">
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
            <button
              type="button"
              onClick={() => setRouteFilter('all')}
              className={`px-2 py-0.5 rounded-md text-[11px] font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                routeFilter === 'all'
                  ? 'bg-[var(--dk-selected)] text-[var(--dk-text)]'
                  : 'text-[var(--dk-text-3)] hover:text-[var(--dk-text)]'
              }`}
            >
              All
            </button>
            {availableRoutes.map((rt) => (
              <button
                key={rt}
                type="button"
                onClick={() => setRouteFilter(rt)}
                className={`notranslate px-2 py-0.5 rounded-md text-[11px] font-mono uppercase transition-colors cursor-pointer whitespace-nowrap ${
                  routeFilter === rt
                    ? 'bg-[var(--dk-selected)] text-[var(--dk-text)] font-bold'
                    : 'text-[var(--dk-text-3)] hover:text-[var(--dk-text)]'
                }`}
              >
                /{rt}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setVisionOnly((v) => !v)}
            aria-label="Filter vision models"
            aria-pressed={visionOnly}
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold shrink-0 transition-colors cursor-pointer whitespace-nowrap ${
              visionOnly
                ? 'bg-[var(--dk-brand-soft)] text-[var(--dk-brand)]'
                : 'text-[var(--dk-text-3)] hover:text-[var(--dk-text)]'
            }`}
          >
            <FluentEye className="h-3 w-3" />
            <span>Vision</span>
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-0 max-h-[195px] sm:max-h-[220px] overflow-y-auto p-1.5 space-y-0.5">
        {filteredModels.length === 0 ? (
          <div className="px-3 py-5 text-center space-y-2">
            <p className="text-xs text-[var(--dk-text-3)]">
              No model found for this filter.
            </p>
            {modelQuery.trim() && (
              <button
                type="button"
                onClick={() => {
                  const targetRoute =
                    routeFilter !== 'all' ? routeFilter : activeRoute;
                  onSelectModel(targetRoute, modelQuery.trim());
                  setPopoverOpen(false);
                }}
                className="btn-tactile-3d px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Use "<span className="notranslate">{modelQuery.trim()}</span>"
              </button>
            )}
          </div>
        ) : (
          filteredModels.map((model) => {
            const isSelected =
              model.id === activeModelId && model.route === activeRoute;
            return (
              <button
                key={`${model.route}:${model.id}`}
                type="button"
                onClick={() => {
                  onSelectModel(model.route, model.id);
                  setPopoverOpen(false);
                }}
                className={`flex w-full items-center justify-between gap-2.5 rounded-[11px] squircle px-2.5 py-2 text-left transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-[var(--dk-selected)] text-[var(--dk-text)]'
                    : 'text-[var(--dk-text-2)] hover:bg-[var(--dk-raised)] hover:text-[var(--dk-text)]'
                }`}
              >
                <div className="min-w-0 flex items-center gap-2">
                  <span className="notranslate truncate text-[12.5px] font-semibold">
                    {model.id}
                  </span>
                  <span className="notranslate text-[10px] font-mono uppercase text-[var(--dk-text-3)] shrink-0">
                    /{model.route}
                  </span>
                </div>

                <span className="flex items-center gap-2 shrink-0 text-[11px] text-[var(--dk-text-3)] tabular-nums">
                  {model.supportsVision && (
                    <FluentEye className="h-3.5 w-3.5 text-[var(--dk-brand)]" />
                  )}
                  {model.contextWindow ? (
                    <span className="notranslate font-mono text-[10.5px]">
                      {formatCompactTokens(model.contextWindow)}
                    </span>
                  ) : null}
                  {isSelected && (
                    <FluentCheck className="h-3.5 w-3.5 text-[var(--dk-brand)]" />
                  )}
                </span>
              </button>
            );
          })
        )}
      </div>

      {/* Compact Side-by-Side Temperature & Effort Parameters Bar */}
      <div
        data-testid="model-popover-params"
        className="border-t border-[var(--dk-panel-divider)] bg-[var(--dk-surface-2)]/42 backdrop-blur-md px-3.5 py-2.5 shrink-0"
      >
        <div
          className={
            allThinkingKeys.length > 1
              ? 'grid grid-cols-2 gap-3 items-start'
              : 'grid grid-cols-1'
          }
        >
          <div className="space-y-1 min-w-0" title={tempToneLabel}>
            <div className="flex items-center justify-between gap-1.5 text-[11px]">
              <span className="font-semibold text-[var(--dk-text)] truncate">
                Temperature
              </span>
              <span className="notranslate font-mono text-[10.5px] font-bold tabular-nums text-[var(--dk-text-2)] shrink-0">
                {temperature.toFixed(1)}
              </span>
            </div>

            <TranslucentMeterSlider
              compact
              value={temperature}
              min={0}
              max={1.5}
              step={0.1}
              onChange={onChangeTemperature}
              ariaLabel="Model temperature"
              testId="model-popover-temperature-slider"
              ticks={9}
            />
          </div>

          {allThinkingKeys.length > 1 && (
            <div className="space-y-1 min-w-0">
              <div className="flex items-center justify-between gap-1.5 text-[11px]">
                <span className="font-semibold text-[var(--dk-text)] whitespace-nowrap">
                  Effort
                </span>
                <span
                  key={thinkingLevel}
                  className="notranslate dt-effort-value-enter font-mono text-[10.5px] font-bold text-[var(--dk-text-2)] tabular-nums whitespace-nowrap truncate"
                >
                  {formatEffortDynamicLabel(thinkingLevel, thinkingLevels)}
                </span>
              </div>

              <TranslucentEffortSpectrum
                compact
                levels={allThinkingKeys}
                value={thinkingLevel}
                budgets={thinkingLevels}
                onChange={onChangeThinkingLevel}
                ariaLabel="Reasoning effort"
                testId="model-popover-effort-slider"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const modelTriggerToneClass =
    effortChroma.tier === 'chromatic'
      ? 'icon-frame-3d !border-sky-400/45 text-sky-500 dark:text-sky-300'
      : effortChroma.tier === 'azure'
        ? 'icon-frame-3d !border-sky-500/40 text-sky-600'
        : effortChroma.tier === 'green'
          ? 'icon-frame-3d !border-emerald-500/40 text-emerald-500'
          : effortChroma.tier === 'lime'
            ? 'icon-frame-3d !border-lime-500/40 text-lime-600 dark:text-lime-400'
            : 'icon-frame-3d text-[var(--dk-text-2)] hover:text-[var(--dk-text)]';

  const modelIconColorClass =
    effortChroma.tier === 'chromatic'
      ? 'text-sky-500 dark:text-sky-300'
      : effortChroma.tier === 'azure'
        ? 'text-sky-600'
        : effortChroma.tier === 'green'
          ? 'text-emerald-500'
          : effortChroma.tier === 'lime'
            ? 'text-lime-600 dark:text-lime-400'
            : 'text-[var(--dk-brand)]';

  return (
    <div
      className={
        centered
          ? 'w-full max-w-[660px] mx-auto shrink-0'
          : 'w-full px-3 sm:px-6 pb-3 pt-1 shrink-0'
      }
    >
      <div className="mx-auto max-w-[660px]">
        <div
          ref={wheelZoneRef}
          data-testid="composer-effort-wheel-zone"
          className="relative py-3 -my-3 px-4 -mx-4"
        >
          <div ref={popoverAnchorRef} className="relative">
          {/* Workspace Switcher Popover (Always opens upward so it never blocks cards below) */}
          {workspaceOpen && (
            <div
              role="dialog"
              aria-label="Select workspace"
              data-testid="composer-workspace-popover"
              className="model-popover model-popover-up !left-0 !right-auto dt-popover-pop"
            >
              <div className="flex items-center justify-between border-b border-[var(--dk-panel-divider)] px-3.5 py-2.5">
                <span className="font-display text-xs font-bold text-[var(--dk-text)]">
                  Workspaces
                </span>
                <button
                  type="button"
                  onClick={() => setWorkspaceOpen(false)}
                  aria-label="Close workspace list"
                  className="text-[var(--dk-text-3)] hover:text-[var(--dk-text)] cursor-pointer"
                >
                  <FluentDismiss className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="max-h-[210px] overflow-y-auto p-1.5 space-y-0.5">
                {workspaces.map((ws) => {
                  const selected = ws.id === activeWorkspace?.id;
                  return (
                    <button
                      key={ws.id}
                      type="button"
                      onClick={() => {
                        onSelectWorkspace(ws.id);
                        setWorkspaceOpen(false);
                      }}
                      className={`flex w-full items-center justify-between gap-2 rounded-[10px] squircle px-2.5 py-2 text-left text-xs transition-colors cursor-pointer ${
                        selected
                          ? 'bg-[var(--dk-selected)] text-[var(--dk-text)] font-semibold'
                          : 'text-[var(--dk-text-2)] hover:bg-[var(--dk-raised)] hover:text-[var(--dk-text)]'
                      }`}
                    >
                      <span className="flex items-center gap-2 min-w-0">
                        <FluentFolder className="h-3.5 w-3.5 shrink-0 opacity-75" />
                        <span className="notranslate truncate">{ws.name}</span>
                      </span>
                      {selected && <FluentCheck className="h-3.5 w-3.5 shrink-0 text-[var(--dk-brand)]" />}
                    </button>
                  );
                })}
              </div>

              <div className="border-t border-[var(--dk-panel-divider)] p-2.5 flex items-center gap-1.5">
                <input
                  type="text"
                  value={newWorkspaceName}
                  onChange={(e) => setNewWorkspaceName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleCreateNewWorkspace();
                    }
                  }}
                  placeholder="New workspace..."
                  aria-label="New workspace name"
                  data-testid="composer-new-workspace-input"
                  className="min-w-0 flex-1 rounded-[9px] squircle border border-[var(--dk-matte-edge)] bg-[var(--dk-surface-2)] px-2.5 py-1 text-xs text-[var(--dk-text)] placeholder:text-[var(--dk-text-3)] focus:border-[var(--dk-brand)] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleCreateNewWorkspace}
                  disabled={!newWorkspaceName.trim()}
                  data-testid="composer-create-workspace-btn"
                  className="send-key h-7 px-2.5 text-[11px]"
                >
                  Create
                </button>
              </div>
            </div>
          )}

          {/* Modalities and Actions Modal (Icon-Driven & Concise, Centered with Full Blur) */}
          {permissionsOpen &&
            typeof document !== 'undefined' &&
            createPortal(
              // biome-ignore lint/a11y/useKeyWithClickEvents: click-to-dismiss is a deliberate mouse-only convenience — the dialog the backdrop seats owns the keyboard lane, so a keyboard handler here would be dead code
              <div
                onClick={() => setPermissionsOpen(false)}
                className="dt-center-modal-backdrop fixed inset-0 z-[90] flex items-center justify-center p-4"
              >
                {/* biome-ignore lint/a11y/useKeyWithClickEvents: the dialog pane stops the backdrop dismissal without owning a click action — the controls inside carry the keyboard lane, so a keyboard handler here would be dead code */}
                <div
                  role="dialog"
                  aria-modal="true"
                  aria-label="Modalities and Actions"
                  data-testid="composer-permissions-popover"
                  onClick={(e) => e.stopPropagation()}
                  className="dt-center-modal-card dt-popover-pop w-full max-w-[360px]"
                >
                  <div className="flex items-center justify-between border-b border-[var(--dk-panel-divider)] px-4 py-3">
                    <div className="flex items-center gap-2">
                      <FluentSliders className="h-4 w-4 text-[var(--dk-brand)]" />
                      <span className="font-display text-xs font-bold text-[var(--dk-text)]">
                        Modalities and Actions
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setPermissionsOpen(false)}
                      aria-label="Close modalities"
                      className="text-[var(--dk-text-3)] hover:text-[var(--dk-text)] cursor-pointer"
                    >
                      <FluentDismiss className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <div className="divide-y divide-[var(--dk-panel-divider)] max-h-[340px] overflow-y-auto">
                    {permissionOptions.map(({ mode, label, Icon, iconClass }) => {
                      const selected = permissionMode === mode;
                      return (
                        <button
                          key={mode}
                          type="button"
                          data-testid={`modality-option-${mode}`}
                          onClick={() => {
                            onChangePermissionMode(mode);
                            setPermissionsOpen(false);
                          }}
                          className={`flex w-full items-center justify-between gap-2.5 px-4 py-3 text-left transition-colors cursor-pointer ${
                            selected ? 'bg-[var(--dk-selected)]' : 'hover:bg-[var(--dk-raised)]'
                          }`}
                        >
                          <span className="flex items-center gap-2.5 min-w-0">
                            <Icon className={`h-4 w-4 shrink-0 ${iconClass}`} />
                            <span className="text-xs font-semibold text-[var(--dk-text)] truncate">
                              {label}
                            </span>
                          </span>
                          {selected && (
                            <FluentCheck className="h-3.5 w-3.5 shrink-0 text-[var(--dk-brand)]" />
                          )}
                        </button>
                      );
                    })}

                    <button
                      type="button"
                      data-testid="modality-action-image"
                      onClick={() => {
                        const next = isImageCommand
                          ? input
                          : `${imageCommandPrefix} ${input}`.trimStart();
                        onChangeInput(next);
                        setPermissionsOpen(false);
                        textareaRef.current?.focus();
                      }}
                      className={`flex w-full items-center justify-between gap-2.5 px-4 py-3 text-left transition-colors cursor-pointer ${
                        isImageCommand ? 'bg-[var(--dk-selected)]' : 'hover:bg-[var(--dk-raised)]'
                      }`}
                    >
                      <span className="flex items-center gap-2.5 min-w-0">
                        <FluentWand className="h-4 w-4 shrink-0 text-[var(--dk-brand)]" />
                        <span className="text-xs font-semibold text-[var(--dk-text)] truncate">
                          Create with image
                        </span>
                      </span>
                      {isImageCommand && (
                        <FluentCheck className="h-3.5 w-3.5 shrink-0 text-[var(--dk-brand)]" />
                      )}
                    </button>

                    {input.trim().length > 0 && (
                      <button
                        type="button"
                        data-testid="modality-action-clear"
                        onClick={() => {
                          onChangeInput('');
                          setPermissionsOpen(false);
                          textareaRef.current?.focus();
                        }}
                        className="flex w-full items-center gap-2.5 px-4 py-3 text-left hover:bg-[var(--dk-raised)] transition-colors cursor-pointer"
                      >
                        <FluentEraser className="h-4 w-4 shrink-0 text-[var(--dk-text-3)]" />
                        <span className="text-xs font-semibold text-[var(--dk-text)]">
                          Clear message
                        </span>
                      </button>
                    )}
                  </div>
                </div>
              </div>,
              document.body
            )}

          {/* Prompt Templates Modal (Icon-Driven & Concise, Centered with Full Blur) */}
          {templatesOpen &&
            typeof document !== 'undefined' &&
            createPortal(
              // biome-ignore lint/a11y/useKeyWithClickEvents: click-to-dismiss is a deliberate mouse-only convenience — the dialog the backdrop seats owns the keyboard lane, so a keyboard handler here would be dead code
              <div
                onClick={() => setTemplatesOpen(false)}
                className="dt-center-modal-backdrop fixed inset-0 z-[90] flex items-center justify-center p-4"
              >
                {/* biome-ignore lint/a11y/useKeyWithClickEvents: the dialog pane stops the backdrop dismissal without owning a click action — the controls inside carry the keyboard lane, so a keyboard handler here would be dead code */}
                <div
                  role="dialog"
                  aria-modal="true"
                  aria-label="Prompt templates"
                  data-testid="prompt-templates-popover"
                  onClick={(e) => e.stopPropagation()}
                  className="dt-center-modal-card dt-popover-pop w-full max-w-[360px]"
                >
                  <div className="flex items-center justify-between border-b border-[var(--dk-panel-divider)] px-4 py-3">
                    <div className="flex items-center gap-2">
                      <FluentDocumentText className="h-4 w-4 text-[var(--dk-brand)]" />
                      <span className="font-display text-xs font-bold text-[var(--dk-text)]">
                        Prompt Templates
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setTemplatesOpen(false)}
                      aria-label="Close prompt templates"
                      className="text-[var(--dk-text-3)] hover:text-[var(--dk-text)] cursor-pointer"
                    >
                      <FluentDismiss className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="divide-y divide-[var(--dk-panel-divider)] max-h-[340px] overflow-y-auto">
                    {multimodalTemplates.map(({ id, title, text, Icon, iconClass }) => (
                      <button
                        key={id}
                        type="button"
                        data-testid={`prompt-template-${id}`}
                        onClick={() => {
                          onChangeInput(text);
                          setTemplatesOpen(false);
                          textareaRef.current?.focus();
                        }}
                        className="flex w-full items-center gap-2.5 px-4 py-3 text-left hover:bg-[var(--dk-raised)] transition-colors cursor-pointer"
                      >
                        <Icon className={`h-4 w-4 shrink-0 ${iconClass}`} />
                        <span className="text-xs font-semibold text-[var(--dk-text)] truncate">
                          {title}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>,
              document.body
            )}

          {/* Model Selector: Centered Modal on Empty Hero, Upward Popover in Thread */}
          {popoverOpen &&
            (centered ? (
              typeof document !== 'undefined' &&
              createPortal(
                // biome-ignore lint/a11y/useKeyWithClickEvents: click-to-dismiss is a deliberate mouse-only convenience — the dialog the backdrop seats owns the keyboard lane, so a keyboard handler here would be dead code
                <div
                  onClick={() => setPopoverOpen(false)}
                  className="dt-center-modal-backdrop fixed inset-0 z-[90] flex items-center justify-center p-4"
                >
                  {/* biome-ignore lint/a11y/useKeyWithClickEvents: the dialog pane stops the backdrop dismissal without owning a click action — the controls inside carry the keyboard lane, so a keyboard handler here would be dead code */}
                  <div
                    role="dialog"
                    aria-modal="true"
                    aria-label="Select model"
                    data-testid="model-selector-popover"
                    onClick={(e) => e.stopPropagation()}
                    className="dt-center-modal-card dt-popover-pop w-full max-w-[440px]"
                  >
                    {modelSelectorCard}
                  </div>
                </div>,
                document.body
              )
            ) : (
              <div
                role="dialog"
                aria-label="Select model"
                data-testid="model-selector-popover"
                className="model-popover model-popover-up dt-popover-pop"
              >
                {modelSelectorCard}
              </div>
            ))}

          {/* Multimodal Composer Surface */}
          <div
            data-testid="composer-box"
            data-effort-level={thinkingLevel}
            data-effort-tier={effortChroma.tier}
            data-effort-max={isMaxEffort ? 'true' : 'false'}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              if (e.dataTransfer.files?.length) {
                onAddImages(e.dataTransfer.files);
              }
            }}
            className="composer-box"
          >
            <div className="dt-specular-thread absolute top-0 inset-x-6 h-[1.5px] rounded-[2px]" />

            {/* Top Workspace & Session Context Strip */}
            <div className="flex items-center justify-between gap-2 border-b border-[var(--dk-panel-divider)] px-4 py-2 text-[11.5px]">
              <div className="flex min-w-0 items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const next = !workspaceOpen;
                    closeAllPopovers();
                    setWorkspaceOpen(next);
                  }}
                  aria-expanded={workspaceOpen}
                  aria-haspopup="dialog"
                  data-testid="composer-workspace-trigger"
                  className="inline-flex min-w-0 items-center gap-1.5 rounded-[7px] squircle px-1.5 py-0.5 font-semibold text-[var(--dk-text-2)] hover:bg-[var(--dk-raised)] hover:text-[var(--dk-text)] transition-colors cursor-pointer"
                >
                  <FluentFolder className="h-3.5 w-3.5 shrink-0 opacity-75" />
                  <span
                    className={`truncate max-w-[170px] sm:max-w-[230px] ${
                      activeWorkspace?.name ? 'notranslate' : ''
                    }`}
                  >
                    {activeWorkspace?.name || 'Workspace'}
                  </span>
                  <FluentChevronDown className="h-3 w-3 shrink-0 opacity-60" />
                </button>

                {activeSessionTitle && !isDefaultEmptyConversationTitle(activeSessionTitle) && (
                  <span className="text-[var(--dk-text-3)] text-[11px] truncate hidden sm:inline">
                    {activeSessionTitle}
                  </span>
                )}

                <button
                  type="button"
                  onClick={() => onNewSessionInWorkspace(activeWorkspace?.id)}
                  aria-label="New session in workspace"
                  title="New session in workspace"
                  data-testid="composer-new-session-btn"
                  className="inline-flex h-5 w-5 items-center justify-center rounded-[6px] squircle text-[var(--dk-text-3)] hover:bg-[var(--dk-raised)] hover:text-[var(--dk-text)] transition-colors cursor-pointer shrink-0"
                >
                  <FluentPlus className="h-3 w-3" />
                </button>
              </div>

              {dictationNotice ? (
                <span className="text-[10.5px] text-[var(--dk-warning)] truncate">
                  {dictationNotice}
                </span>
              ) : isDictating ? (
                <span className="text-[10.5px] font-semibold text-[var(--dk-brand)] animate-pulse">
                  Listening...
                </span>
              ) : null}
            </div>

            {images.length > 0 && (
              <div className="flex flex-wrap gap-2 px-4 pt-2.5">
                {images.map((img) => (
                  <div
                    key={img.id}
                    className="dt-bubble-pop relative h-[52px] w-[62px] overflow-hidden rounded-[12px] squircle border border-[var(--dk-matte-edge)] bg-[var(--dk-surface-2)]"
                  >
                    <img
                      src={img.dataUrl}
                      alt={img.name}
                      className="h-full w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => onRemoveImage(img.id)}
                      aria-label={`Remove ${img.name}`}
                      className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-[5px] squircle bg-black/75 text-white hover:bg-black cursor-pointer"
                    >
                      <FluentDismiss className="h-2.5 w-2.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <textarea
              ref={textareaRef}
              rows={2}
              value={input}
              onChange={(e) => onChangeInput(e.target.value)}
              onPaste={(e) => {
                if (e.clipboardData?.files?.length) {
                  onAddImages(e.clipboardData.files);
                }
              }}
              onKeyDown={handleKeyDown}
              placeholder={
                images.length > 0
                  ? 'Describe how you want to analyze or transform these images...'
                  : 'What will we build today?'
              }
              aria-label="Message for the model"
              className="w-full resize-none bg-transparent px-4 pt-3 pb-1.5 text-[14px] leading-relaxed text-[var(--dk-text)] placeholder:text-[var(--dk-text-3)] focus:outline-none max-h-40"
            />

            {/* Cleanly Spaced Bottom Action Bar */}
            <div className="flex items-center justify-between gap-2 sm:gap-3 px-2.5 sm:px-3.5 pb-2.5 pt-0.5">
              {/* Left Cluster: Primary Actions (Spaced Icon Frames, Zero Layout Shift) */}
              <div className="flex items-center gap-1.5 sm:gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div className="dt-hint-anchor">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    aria-label="Attach image"
                    title={
                      activeModel?.supportsVision
                        ? 'Attach image (Vision)'
                        : 'Attach image'
                    }
                    className="icon-frame-3d inline-flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-[10px] sm:rounded-[11px] squircle text-[var(--dk-text-2)] hover:text-[var(--dk-text)] shrink-0 cursor-pointer"
                  >
                    {images.length > 0 ? (
                      <FluentImageAdd className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0 text-[var(--dk-brand)]" />
                    ) : (
                      <FluentPlus className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                    )}
                  </button>
                  <span className="dt-hover-caption dt-hover-caption-up dt-hover-caption-left hidden sm:block" role="tooltip">
                    Attach image
                  </span>
                </div>

                <div className="dt-hint-anchor">
                  <button
                    type="button"
                    onClick={() => {
                      const next = !templatesOpen;
                      closeAllPopovers();
                      setTemplatesOpen(next);
                    }}
                    aria-expanded={templatesOpen}
                    aria-label="Prompt Templates"
                    data-testid="prompt-templates-btn"
                    title="Prompt Templates"
                    className={`icon-frame-3d inline-flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-[10px] sm:rounded-[11px] squircle shrink-0 cursor-pointer ${
                      templatesOpen
                        ? 'bg-[var(--dk-selected)] text-[var(--dk-text)]'
                        : 'text-[var(--dk-text-2)] hover:text-[var(--dk-text)]'
                    }`}
                  >
                    <FluentDocumentText className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                  </button>
                  <span className="dt-hover-caption dt-hover-caption-up hidden sm:block" role="tooltip">
                    Prompts
                  </span>
                </div>

                <div className="dt-hint-anchor">
                  <button
                    type="button"
                    onClick={() => {
                      const next = !permissionsOpen;
                      closeAllPopovers();
                      setPermissionsOpen(next);
                    }}
                    aria-expanded={permissionsOpen}
                    aria-haspopup="dialog"
                    aria-label={`Modality: ${permissionLabel}`}
                    data-testid="composer-tools-toggle"
                    title={`Modality: ${permissionLabel}`}
                    className={`icon-frame-3d inline-flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-[10px] sm:rounded-[11px] squircle shrink-0 cursor-pointer ${
                      permissionsOpen || permissionMode !== 'assisted'
                        ? 'bg-[var(--dk-selected)] text-[var(--dk-text)]'
                        : 'text-[var(--dk-text-2)] hover:text-[var(--dk-text)]'
                    }`}
                  >
                    {permissionMode === 'full' ? (
                      <FluentBolt className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0 text-amber-500" />
                    ) : permissionMode === 'readonly' ? (
                      <FluentEye className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <FluentShield className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0 text-[var(--dk-brand)]" />
                    )}
                  </button>
                  <span
                    key={permissionLabel}
                    className="dt-hover-caption dt-hover-caption-up hidden sm:block"
                    role="tooltip"
                  >
                    {permissionLabel}
                  </span>
                </div>
              </div>

              {/* Right Cluster: Neural Model Picker (with Hold+Drag & Wheel Effort Gesture) + Mic + Icon-Only Send */}
              <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                <div className="dt-hint-anchor relative">
                  <button
                    type="button"
                    onPointerDown={handleModelTriggerPointerDown}
                    onPointerMove={handleModelTriggerPointerMove}
                    onPointerUp={finishModelTriggerPointerDrag}
                    onPointerCancel={finishModelTriggerPointerDrag}
                    onClick={() => {
                      if (suppressModelClickRef.current) return;
                      const next = !popoverOpen;
                      closeAllPopovers();
                      setPopoverOpen(next);
                    }}
                    aria-expanded={popoverOpen}
                    aria-haspopup="dialog"
                    aria-label={`Select model (${activeModelId || 'Model'})`}
                    title={`${compactModelName} · /${activeRoute} · Hold & drag up/down or scroll wheel for Effort`}
                    data-testid="model-selector-trigger"
                    data-effort-tier={effortChroma.tier}
                    className={`inline-flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-[10px] sm:rounded-[11px] squircle transition shrink-0 select-none touch-none ${
                      isDraggingModelEffort ? 'cursor-ns-resize scale-105' : 'cursor-pointer'
                    } ${
                      popoverOpen
                        ? 'bg-[var(--dk-selected)] border border-[var(--dk-matte-edge)] text-[var(--dk-text)]'
                        : modelTriggerToneClass
                    }`}
                  >
                    <FluentModel
                      className={`h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0 ${modelIconColorClass}`}
                    />
                  </button>
                  <span className="notranslate dt-hover-caption dt-hover-caption-up hidden sm:block" role="tooltip">
                    {compactModelName} · /{activeRoute}
                  </span>
                </div>

                {/* Voice Dictation Button */}
                <button
                  type="button"
                  onClick={toggleDictation}
                  aria-label={isDictating ? 'Stop voice dictation' : 'Voice dictation'}
                  aria-pressed={isDictating}
                  title={isDictating ? 'Stop dictation' : 'Dictate by voice'}
                  data-testid="composer-mic-btn"
                  className={`icon-frame-3d inline-flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-[10px] sm:rounded-[11px] squircle shrink-0 cursor-pointer ${
                    isDictating
                      ? 'bg-[var(--dk-selected)] border-[var(--dk-brand)] text-[var(--dk-brand)] animate-pulse'
                      : 'text-[var(--dk-text-2)] hover:text-[var(--dk-text)]'
                  }`}
                >
                  <FluentMic className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                </button>

                {isStreaming ? (
                  <button
                    type="button"
                    onClick={onStop}
                    aria-label="Stop generation"
                    title="Stop"
                    className="inline-flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-[10px] sm:rounded-[11px] squircle bg-red-600 text-white hover:bg-red-500 transition-colors cursor-pointer shrink-0"
                  >
                    <FluentStop className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={onSend}
                    disabled={!canSend}
                    aria-label="Send message"
                    title="Send"
                    data-testid="composer-send-btn"
                    className="send-key h-11 w-11 px-0 shrink-0"
                  >
                    {canSend ? (
                      <FluentSend className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                    ) : (
                      <FluentArrowUp className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
}

