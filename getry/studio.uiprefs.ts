export const DEFAULT_UI_ZOOM = 110;
export const MIN_UI_ZOOM = 100;
export const MAX_UI_ZOOM = 125;
export const UI_ZOOM_STEP = 5;
export const UI_ZOOM_PRESETS = [100, 110, 120] as const;

export const DEFAULT_SIDEBAR_WIDTH = 252;
export const MIN_SIDEBAR_WIDTH = 220;
export const MAX_SIDEBAR_WIDTH = 360;

export function clampUiZoom(raw: unknown): number {
  const num = typeof raw === 'number' ? raw : Number(raw);
  if (!Number.isFinite(num) || num <= 0) {
    return DEFAULT_UI_ZOOM;
  }
  const snapped = Math.round(num / UI_ZOOM_STEP) * UI_ZOOM_STEP;
  return Math.min(MAX_UI_ZOOM, Math.max(MIN_UI_ZOOM, snapped));
}

export function stepUiZoom(current: number, deltaSteps: number): number {
  const base = clampUiZoom(current);
  return clampUiZoom(base + deltaSteps * UI_ZOOM_STEP);
}

export function formatZoomLabel(zoomPercent: number): string {
  return `${clampUiZoom(zoomPercent)}%`;
}

export function computeZoomViewportStyle(zoomPercent: number): {
  zoom: number;
  width: string;
  height: string;
} {
  const safePercent = clampUiZoom(zoomPercent);
  const scale = Number((safePercent / 100).toFixed(4));
  return {
    zoom: scale,
    width: '100%',
    height: '100%',
  };
}

export function clampSidebarWidth(raw: unknown): number {
  const num = typeof raw === 'number' ? raw : Number(raw);
  if (!Number.isFinite(num) || num <= 0) {
    return DEFAULT_SIDEBAR_WIDTH;
  }
  return Math.min(MAX_SIDEBAR_WIDTH, Math.max(MIN_SIDEBAR_WIDTH, Math.round(num)));
}

export interface ExportableMessage {
  role: string;
  content: string;
  reasoning?: string;
  modelId?: string;
}

export function formatConversationMarkdown(
  title: string,
  route: string,
  modelId: string,
  messages: ExportableMessage[]
): string {
  const safeTitle = (title || 'Nova conversa').trim();
  const lines: string[] = [
    `# ${safeTitle}`,
    '',
    `Rota: /${route || 'v1'} | Modelo: ${modelId || 'auto'}`,
    '',
  ];
  for (const msg of messages) {
    const label = msg.role === 'user' ? 'Usuário' : msg.modelId || 'Assistente';
    lines.push(`## ${label}`);
    lines.push('');
    if (msg.reasoning?.trim()) {
      lines.push('> Raciocínio');
      lines.push(`> ${msg.reasoning.trim().replace(/\n/g, '\n> ')}`);
      lines.push('');
    }
    if (msg.content?.trim()) {
      lines.push(msg.content.trim());
      lines.push('');
    }
  }
  return lines.join('\n').trim() + '\n';
}

export function sortConversationsWithPins<T extends { id: string; updatedAt: number }>(
  conversations: T[],
  pinnedIds: string[]
): T[] {
  const pinSet = new Set(pinnedIds);
  return [...conversations].sort((a, b) => {
    const aPinned = pinSet.has(a.id);
    const bPinned = pinSet.has(b.id);
    if (aPinned !== bPinned) return aPinned ? -1 : 1;
    return b.updatedAt - a.updatedAt;
  });
}

export function getReasoningStepIndex(levels: readonly string[], current: string): number {
  if (levels.length === 0) return 0;
  const idx = levels.indexOf(current);
  return idx >= 0 ? idx : 0;
}

export function snapRatioToStepIndex(ratio: number, stepCount: number): number {
  if (stepCount <= 1) return 0;
  const clamped = Math.min(1, Math.max(0, Number.isFinite(ratio) ? ratio : 0));
  return Math.min(stepCount - 1, Math.max(0, Math.round(clamped * (stepCount - 1))));
}

export function formatReasoningStepShortLabel(level: string): string {
  const norm = level.toLowerCase();
  if (norm === 'default') return 'Auto';
  if (norm === 'none') return '0';
  if (norm === 'minimal') return 'Min';
  if (norm === 'low') return 'Low';
  if (norm === 'medium') return 'Med';
  if (norm === 'high') return 'High';
  if (norm === 'xhigh') return 'Xh';
  if (norm === 'max') return 'Max';
  return level.slice(0, 4);
}

export function formatEffortDynamicLabel(
  level: string,
  budgets?: Record<string, number>
): string {
  const norm = level.toLowerCase();
  if (norm === 'default') return 'auto';
  const budget = budgets?.[level];
  if (typeof budget === 'number' && Number.isFinite(budget) && budget > 0) {
    const formatted = new Intl.NumberFormat('pt-BR').format(budget);
    return `${norm} ${formatted}`;
  }
  return norm;
}

export type PermissionMode = 'full' | 'assisted' | 'readonly';

export function formatPermissionLabel(mode: PermissionMode): string {
  if (mode === 'full') return 'Acesso total';
  if (mode === 'assisted') return 'Assistido';
  return 'Somente leitura';
}

export function groupSessionsByWorkspace<
  W extends { id: string; name: string },
  S extends { id: string; workspaceId?: string; updatedAt: number }
>(
  workspaces: W[],
  sessions: S[],
  fallbackWorkspaceId: string
): Array<{ workspace: W; sessions: S[] }> {
  const buckets = new Map<string, S[]>();
  for (const ws of workspaces) {
    buckets.set(ws.id, []);
  }
  for (const session of sessions) {
    const targetId =
      session.workspaceId && buckets.has(session.workspaceId)
        ? session.workspaceId
        : fallbackWorkspaceId;
    const list = buckets.get(targetId);
    if (list) {
      list.push(session);
    }
  }
  return workspaces.map((workspace) => ({
    workspace,
    sessions: buckets.get(workspace.id) ?? [],
  }));
}

export function computeUsageStatistics(
  workspaces: readonly { id: string }[],
  conversations: readonly {
    messages: readonly { usage?: { total_tokens?: number } }[];
  }[]
): {
  workspaceCount: number;
  sessionCount: number;
  messageCount: number;
  totalTokens: number;
} {
  let messageCount = 0;
  let totalTokens = 0;
  for (const conv of conversations) {
    messageCount += conv.messages.length;
    for (const msg of conv.messages) {
      totalTokens += msg.usage?.total_tokens ?? 0;
    }
  }
  return {
    workspaceCount: workspaces.length,
    sessionCount: conversations.length,
    messageCount,
    totalTokens,
  };
}

export function isMaxEffortLevel(levels: readonly string[], current: string): boolean {
  const norm = (current || '').trim().toLowerCase();
  if (norm === 'max') return true;
  if (levels.length <= 1 || norm === 'default' || norm === 'none') return false;
  return getReasoningStepIndex(levels, current) === levels.length - 1;
}

export function getEffortGlowIntensity(levels: readonly string[], current: string): number {
  const norm = (current || '').trim().toLowerCase();
  if (norm === 'none') return 0;
  if (!norm || norm === 'default') return 0.28;
  if (norm === 'max') return 1;
  if (levels.length <= 1) return 0.28;
  const idx = getReasoningStepIndex(levels, current);
  const ratio = idx / (levels.length - 1);
  return Number(Math.min(1, Math.max(0.25, ratio)).toFixed(2));
}

export type EffortChromaTier = 'neutral' | 'lime' | 'green' | 'purple' | 'chromatic';

export interface EffortChromaSpec {
  tier: EffortChromaTier;
  intensity: number;
  isMax: boolean;
  primary: string;
  secondary: string;
  border: string;
  glow: string;
}

const NEUTRAL_CHROMA: EffortChromaSpec = {
  tier: 'neutral',
  intensity: 0,
  isMax: false,
  primary: 'var(--dk-text-2)',
  secondary: 'var(--dk-text-3)',
  border: 'var(--dk-matte-edge)',
  glow: 'transparent',
};

const RADIOACTIVE_CHROMA_MAP: Record<Exclude<EffortChromaTier, 'neutral'>, Omit<EffortChromaSpec, 'tier' | 'intensity' | 'isMax'>> = {
  lime: {
    primary: '#84cc16',
    secondary: '#bef264',
    border: 'rgba(132, 204, 22, 0.56)',
    glow: 'transparent',
  },
  green: {
    primary: '#22c55e',
    secondary: '#4ade80',
    border: 'rgba(34, 197, 94, 0.58)',
    glow: 'transparent',
  },
  purple: {
    primary: '#a855f7',
    secondary: '#c084fc',
    border: 'rgba(168, 85, 247, 0.60)',
    glow: 'transparent',
  },
  chromatic: {
    primary: '#38bdf8',
    secondary: '#c084fc',
    border: 'rgba(167, 139, 250, 0.64)',
    glow: 'transparent',
  },
};

export function resolveEffortChroma(
  levels: readonly string[],
  current: string
): EffortChromaSpec {
  const norm = (current || '').trim().toLowerCase();
  if (!norm || norm === 'default' || norm === 'none') {
    return NEUTRAL_CHROMA;
  }

  const intensity = getEffortGlowIntensity(levels, current);
  const isMax = isMaxEffortLevel(levels, current);
  if (isMax) {
    return {
      tier: 'chromatic',
      intensity: 1,
      isMax: true,
      ...RADIOACTIVE_CHROMA_MAP.chromatic,
    };
  }

  const activeLevels = levels.filter((lvl) => {
    const k = lvl.trim().toLowerCase();
    return k !== 'default' && k !== 'none';
  });
  const activeIdx = activeLevels.indexOf(current);
  const ratio =
    activeLevels.length > 1 && activeIdx >= 0
      ? activeIdx / (activeLevels.length - 1)
      : intensity;

  let tier: Exclude<EffortChromaTier, 'neutral'>;
  if (norm === 'minimal' || (activeLevels.length >= 4 && norm === 'low') || ratio <= 0.25) {
    tier = 'lime';
  } else if (norm === 'medium' || norm === 'low' || ratio <= 0.55) {
    tier = 'green';
  } else {
    tier = 'purple';
  }

  return {
    tier,
    intensity,
    isMax: false,
    ...RADIOACTIVE_CHROMA_MAP[tier],
  };
}

export function stepReasoningLevelByDelta(
  levels: readonly string[],
  current: string,
  stepDelta: number,
  options?: { wrap?: boolean }
): string {
  if (levels.length === 0) return current;
  if (levels.length === 1) return levels[0];
  const idx = getReasoningStepIndex(levels, current);
  const raw = idx + Math.trunc(stepDelta);
  if (options?.wrap) {
    const wrapped = ((raw % levels.length) + levels.length) % levels.length;
    return levels[wrapped];
  }
  const clamped = Math.min(levels.length - 1, Math.max(0, raw));
  return levels[clamped];
}

export type SaddleDockEdge = 'left' | 'right' | 'top' | 'bottom';
export type RailMode = 'full' | 'full-floating' | 'saddle' | 'floating';

export function normalizeRailMode(raw: unknown, legacyFloating?: boolean): RailMode {
  if (raw === 'full' || raw === 'full-floating' || raw === 'saddle' || raw === 'floating') {
    return raw;
  }
  return legacyFloating ? 'floating' : 'full';
}

export interface RailPosition {
  x: number;
  y: number;
}

export interface RailSnapResult {
  floating: boolean;
  edge: SaddleDockEdge;
  pos: RailPosition;
}

export const DEFAULT_RAIL_SNAP_THRESHOLD = 28;

export function clampRailPosition(
  x: number,
  y: number,
  viewW: number,
  viewH: number,
  margin = 20
): RailPosition {
  const safeW = Math.max(margin * 2 + 1, Number.isFinite(viewW) ? viewW : 1200);
  const safeH = Math.max(margin * 2 + 1, Number.isFinite(viewH) ? viewH : 800);
  const safeX = Number.isFinite(x) ? x : margin;
  const safeY = Number.isFinite(y) ? y : safeH * 0.54;
  return {
    x: Math.round(Math.max(margin, Math.min(safeW - margin, safeX))),
    y: Math.round(Math.max(margin, Math.min(safeH - margin, safeY))),
  };
}

export function resolveRailSnapState(
  pointerX: number,
  pointerY: number,
  viewW: number,
  viewH: number,
  snapThreshold = DEFAULT_RAIL_SNAP_THRESHOLD
): RailSnapResult {
  const safeW = Math.max(160, Number.isFinite(viewW) ? viewW : 1200);
  const safeH = Math.max(160, Number.isFinite(viewH) ? viewH : 800);
  const clamped = clampRailPosition(pointerX, pointerY, safeW, safeH, 0);

  const distLeft = clamped.x;
  const distRight = safeW - clamped.x;
  const distTop = clamped.y;
  const distBottom = safeH - clamped.y;
  const minDist = Math.min(distLeft, distRight, distTop, distBottom);

  const padY = Math.min(92, safeH * 0.25);
  const padX = Math.min(96, safeW * 0.25);

  if (minDist <= snapThreshold) {
    if (minDist === distLeft) {
      return {
        floating: false,
        edge: 'left',
        pos: {
          x: 0,
          y: Math.round(Math.max(padY, Math.min(safeH - padY, clamped.y))),
        },
      };
    }
    if (minDist === distRight) {
      return {
        floating: false,
        edge: 'right',
        pos: {
          x: safeW,
          y: Math.round(Math.max(padY, Math.min(safeH - padY, clamped.y))),
        },
      };
    }
    if (minDist === distTop) {
      return {
        floating: false,
        edge: 'top',
        pos: {
          x: Math.round(Math.max(padX, Math.min(safeW - padX, clamped.x))),
          y: 0,
        },
      };
    }
    return {
      floating: false,
      edge: 'bottom',
      pos: {
        x: Math.round(Math.max(padX, Math.min(safeW - padX, clamped.x))),
        y: safeH,
      },
    };
  }

  return {
    floating: true,
    edge: 'left',
    pos: clampRailPosition(clamped.x, clamped.y, safeW, safeH, 24),
  };
}

export interface VisualEffectsPrefs {
  ansi: boolean;
  glow: boolean;
  blur: boolean;
  transparency: boolean;
}

export const DEFAULT_VISUAL_EFFECTS: VisualEffectsPrefs = {
  ansi: true,
  glow: true,
  blur: true,
  transparency: true,
};

export function normalizeVisualEffectsPrefs(
  raw: Partial<Record<keyof VisualEffectsPrefs, unknown>> | null | undefined
): VisualEffectsPrefs {
  if (!raw || typeof raw !== 'object') {
    return { ...DEFAULT_VISUAL_EFFECTS };
  }
  return {
    ansi: raw.ansi !== false,
    glow: raw.glow !== false,
    blur: raw.blur !== false,
    transparency: raw.transparency !== false,
  };
}

export function nextProjectName(existingWorkspaces: readonly { name: string }[]): string {
  const used = new Set(existingWorkspaces.map((w) => w.name.trim().toLowerCase()));
  let idx = existingWorkspaces.length + 1;
  while (idx < 1000) {
    const label = `Project ${String(idx).padStart(2, '0')}`;
    if (!used.has(label.toLowerCase())) {
      return label;
    }
    idx += 1;
  }
  return `Project ${Date.now()}`;
}

export function reorderTabIds(
  tabIds: readonly string[],
  sourceId: string,
  targetId: string
): string[] {
  if (!sourceId || !targetId || sourceId === targetId) {
    return [...tabIds];
  }
  const fromIdx = tabIds.indexOf(sourceId);
  const toIdx = tabIds.indexOf(targetId);
  if (fromIdx < 0 || toIdx < 0) {
    return [...tabIds];
  }
  const next = [...tabIds];
  const [moved] = next.splice(fromIdx, 1);
  next.splice(toIdx, 0, moved);
  return next;
}

function assertUi(condition: unknown, message: string): void {
  if (!condition) throw new Error(`uiPrefs self-test failed: ${message}`);
}

function assertEqUi(actual: unknown, expected: unknown, label: string): void {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a !== e) {
    throw new Error(`uiPrefs self-test [${label}] expected ${e}, got ${a}`);
  }
}

export function runUiPrefsSelfTests(): number {
  assertEqUi(DEFAULT_UI_ZOOM, 110, 'DEFAULT_UI_ZOOM');
  assertEqUi(MIN_UI_ZOOM, 100, 'MIN_UI_ZOOM');
  assertEqUi(clampUiZoom(undefined), 110, 'clampUiZoom undefined');
  assertEqUi(clampUiZoom('invalid'), 110, 'clampUiZoom invalid');
  assertEqUi(clampUiZoom(80), 100, 'clampUiZoom min');
  assertEqUi(clampUiZoom(112), 110, 'clampUiZoom snap');
  assertEqUi(clampUiZoom(113), 115, 'clampUiZoom snap up');
  assertEqUi(clampUiZoom(140), MAX_UI_ZOOM, 'clampUiZoom max');

  assertEqUi(stepUiZoom(110, 1), 115, 'stepUiZoom +1');
  assertEqUi(stepUiZoom(110, -2), 100, 'stepUiZoom -2');
  assertEqUi(formatZoomLabel(110), '110%', 'formatZoomLabel');

  const style110 = computeZoomViewportStyle(110);
  assertEqUi(style110, { zoom: 1.1, width: '100%', height: '100%' }, 'computeZoomViewportStyle');

  assertEqUi(clampSidebarWidth(undefined), DEFAULT_SIDEBAR_WIDTH, 'clampSidebarWidth undef');
  assertEqUi(clampSidebarWidth(120), MIN_SIDEBAR_WIDTH, 'clampSidebarWidth min');
  assertEqUi(clampSidebarWidth(260), 260, 'clampSidebarWidth mid');
  assertEqUi(clampSidebarWidth(500), MAX_SIDEBAR_WIDTH, 'clampSidebarWidth max');

  const md = formatConversationMarkdown('Arquitetura UI', 'v1', 'gpt-4o', [
    { role: 'user', content: 'Explique os componentes.' },
    { role: 'assistant', content: 'Aqui está o resumo.', reasoning: 'Passo 1', modelId: 'gpt-4o' },
  ]);
  assertUi(md.includes('# Arquitetura UI') && md.includes('> Passo 1'), 'formatConversationMarkdown');

  const sorted = sortConversationsWithPins(
    [
      { id: 'c1', updatedAt: 300 },
      { id: 'c2', updatedAt: 100 },
      { id: 'c3', updatedAt: 200 },
    ],
    ['c2']
  );
  assertEqUi(sorted.map((c) => c.id), ['c2', 'c1', 'c3'], 'sortConversationsWithPins');

  const keys = ['default', 'none', 'minimal', 'low', 'medium', 'high', 'xhigh', 'max'];
  assertEqUi(getReasoningStepIndex(keys, 'high'), 5, 'getReasoningStepIndex');
  assertEqUi(snapRatioToStepIndex(-0.2, 8), 0, 'snapRatio low');
  assertEqUi(snapRatioToStepIndex(0.5, 8), 4, 'snapRatio mid');
  assertEqUi(snapRatioToStepIndex(1.4, 8), 7, 'snapRatio high');
  assertEqUi(formatReasoningStepShortLabel('xhigh'), 'Xh', 'shortLabel xhigh');
  assertEqUi(formatEffortDynamicLabel('max', { max: 98000 }), 'max 98.000', 'effortDynamic');
  assertEqUi(isMaxEffortLevel(keys, 'max'), true, 'isMaxEffortLevel');
  assertEqUi(getEffortGlowIntensity(keys, 'max'), 1, 'getEffortGlowIntensity');

  const grouped = groupSessionsByWorkspace(
    [
      { id: 'ws_1', name: 'devthink1' },
      { id: 'ws_2', name: 'downloads' },
    ],
    [
      { id: 's1', workspaceId: 'ws_2', updatedAt: 200, messages: [{ usage: { total_tokens: 120 } }] },
      { id: 's2', workspaceId: 'ws_1', updatedAt: 100, messages: [{ usage: { total_tokens: 80 } }, {}] },
      { id: 's3', updatedAt: 50, messages: [] },
    ],
    'ws_1'
  );
  assertEqUi(grouped[0].sessions.map((s) => s.id), ['s2', 's3'], 'groupSessions ws_1');
  assertEqUi(
    computeUsageStatistics([{ id: 'ws_1' }, { id: 'ws_2' }], [
      { messages: [{ usage: { total_tokens: 120 } }] },
      { messages: [{ usage: { total_tokens: 80 } }, {}] },
    ]),
    { workspaceCount: 2, sessionCount: 2, messageCount: 3, totalTokens: 200 },
    'computeUsageStatistics'
  );
  assertEqUi(formatPermissionLabel('full'), 'Acesso total', 'formatPermissionLabel');

  assertEqUi(resolveEffortChroma(keys, 'minimal').tier, 'lime', 'chroma lime');
  assertEqUi(resolveEffortChroma(keys, 'medium').tier, 'green', 'chroma green');
  assertEqUi(resolveEffortChroma(keys, 'high').tier, 'purple', 'chroma purple');
  assertEqUi(resolveEffortChroma(keys, 'max').tier, 'chromatic', 'chroma max');
  assertEqUi(stepReasoningLevelByDelta(keys, 'default', -1, { wrap: true }), 'max', 'step wrap');

  assertEqUi(normalizeRailMode('full-floating', false), 'full-floating', 'normalizeRailMode full-floating');
  assertEqUi(normalizeRailMode('saddle', false), 'saddle', 'normalizeRailMode saddle');
  assertEqUi(normalizeRailMode(undefined, true), 'floating', 'normalizeRailMode legacy floating');
  assertEqUi(normalizeRailMode(undefined, false), 'full', 'normalizeRailMode default full');

  assertEqUi(resolveRailSnapState(12, 420, 1280, 800, 28), { floating: false, edge: 'left', pos: { x: 0, y: 420 } }, 'snap left');
  assertEqUi(resolveRailSnapState(1265, 390, 1280, 800, 28), { floating: false, edge: 'right', pos: { x: 1280, y: 390 } }, 'snap right');
  assertEqUi(resolveRailSnapState(620, 14, 1280, 800, 28), { floating: false, edge: 'top', pos: { x: 620, y: 0 } }, 'snap top');
  assertEqUi(resolveRailSnapState(620, 785, 1280, 800, 28), { floating: false, edge: 'bottom', pos: { x: 620, y: 800 } }, 'snap bottom');
  assertEqUi(resolveRailSnapState(520, 360, 1280, 800, 28), { floating: true, edge: 'left', pos: { x: 520, y: 360 } }, 'center float');
  assertEqUi(nextProjectName([{ name: 'devthink-principal' }, { name: 'Project 02' }]), 'Project 03', 'nextProjectName');
  assertEqUi(normalizeVisualEffectsPrefs(undefined), DEFAULT_VISUAL_EFFECTS, 'visualEffects default');
  assertEqUi(
    normalizeVisualEffectsPrefs({ glow: false, blur: false, transparency: true }),
    { ansi: true, glow: false, blur: false, transparency: true },
    'visualEffects partial'
  );
  assertEqUi(reorderTabIds(['a', 'b', 'c'], 'a', 'c'), ['b', 'c', 'a'], 'reorderTabIds forward');
  assertEqUi(reorderTabIds(['a', 'b', 'c'], 'c', 'a'), ['c', 'a', 'b'], 'reorderTabIds backward');
  assertEqUi(reorderTabIds(['a', 'b', 'c'], 'a', 'b'), ['b', 'a', 'c'], 'reorderTabIds adjacent');
  assertEqUi(reorderTabIds(['a', 'b', 'c'], 'a', 'missing'), ['a', 'b', 'c'], 'reorderTabIds missing');
  return 15;
}

if (
  typeof process !== 'undefined' &&
  Array.isArray(process.argv) &&
  process.argv[1]?.endsWith('uiPrefs.ts')
) {
  const passed = runUiPrefsSelfTests();
  console.log(`uiPrefs.ts embedded self-tests: ${passed} checks passed`);
}


