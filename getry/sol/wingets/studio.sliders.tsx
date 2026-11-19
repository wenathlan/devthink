import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import {
  formatEffortDynamicLabel,
  formatReasoningStepShortLabel,
  getReasoningStepIndex,
  isMaxEffortLevel,
  resolveEffortChroma,
  snapRatioToStepIndex,
  stepReasoningLevelByDelta,
} from '../../studio.uiprefs';

interface TranslucentMeterSliderProps {
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (nextValue: number) => void;
  ariaLabel: string;
  testId?: string;
  leftHint?: string;
  rightHint?: string;
  ticks?: number;
  compact?: boolean;
}

export function TranslucentMeterSlider({
  value,
  min,
  max,
  step,
  onChange,
  ariaLabel,
  testId,
  leftHint,
  rightHint,
  ticks = 11,
  compact = false,
}: TranslucentMeterSliderProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);

  const clamped = Math.min(max, Math.max(min, value));
  const pct = max > min ? ((clamped - min) / (max - min)) * 100 : 0;

  const snapValue = (rawRatio: number) => {
    const ratio = Math.min(1, Math.max(0, rawRatio));
    const raw = min + ratio * (max - min);
    const stepped = Math.round((raw - min) / step) * step + min;
    const decimals = step < 1 ? String(step).split('.')[1]?.length || 1 : 0;
    const rounded = Number(stepped.toFixed(decimals));
    return Math.min(max, Math.max(min, rounded));
  };

  const updateFromClientX = (clientX: number) => {
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect || rect.width <= 0) return;
    const ratio = (clientX - rect.left) / rect.width;
    const next = snapValue(ratio);
    if (next !== value) {
      onChange(next);
    }
  };

  const handlePointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragging(true);
    updateFromClientX(e.clientX);
  };

  const handlePointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragging) return;
    updateFromClientX(e.clientX);
  };

  const handlePointerUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragging) return;
    setDragging(false);
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // ignore if already released
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const decimals = step < 1 ? String(step).split('.')[1]?.length || 1 : 0;
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      e.preventDefault();
      onChange(Math.min(max, Number((clamped + step).toFixed(decimals))));
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      e.preventDefault();
      onChange(Math.max(min, Number((clamped - step).toFixed(decimals))));
    } else if (e.key === 'Home') {
      e.preventDefault();
      onChange(min);
    } else if (e.key === 'End') {
      e.preventDefault();
      onChange(max);
    }
  };

  return (
    <div className="space-y-1.5">
      <div
        ref={trackRef}
        role="slider"
        tabIndex={0}
        aria-label={ariaLabel}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={clamped}
        data-testid={testId}
        data-dragging={dragging ? 'true' : 'false'}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onKeyDown={handleKeyDown}
        className={`dt-meter-track group ${compact ? 'dt-meter-track-compact' : ''}`}
      >
        <div className="dt-meter-sheen" aria-hidden="true" />

        <div
          className="pointer-events-none absolute inset-x-2.5 inset-y-0 flex items-center justify-between"
          aria-hidden="true"
        >
          {Array.from({ length: ticks }).map((_, idx) => {
            const isMajor = idx === 0 || idx === ticks - 1 || idx === Math.floor(ticks / 2);
            return (
              <span
                key={idx}
                className={`w-[1px] rounded-[1px] bg-[var(--dk-text)] transition-opacity ${
                  isMajor ? 'h-3 opacity-20' : 'h-1.5 opacity-12'
                }`}
              />
            );
          })}
        </div>

        <div
          className="dt-meter-fill"
          style={{ width: `${pct}%` }}
          aria-hidden="true"
        >
          <span className="dt-meter-blade" />
        </div>
      </div>

      {(leftHint || rightHint) && (
        <div className="flex justify-between text-[10.5px] text-[var(--dk-text-3)] tabular-nums">
          <span>{leftHint}</span>
          <span>{rightHint}</span>
        </div>
      )}
    </div>
  );
}

interface TranslucentEffortSpectrumProps {
  levels: readonly string[];
  value: string;
  budgets?: Record<string, number>;
  onChange: (nextLevel: string) => void;
  ariaLabel: string;
  testId?: string;
  inline?: boolean;
  compact?: boolean;
}

export function TranslucentEffortSpectrum({
  levels,
  value,
  budgets,
  onChange,
  ariaLabel,
  testId,
  inline = false,
  compact = false,
}: TranslucentEffortSpectrumProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const pointerSessionRef = useRef<{
    downX: number;
    moved: boolean;
    changedOnDown: boolean;
    idxAtDown: number;
  } | null>(null);
  const [dragging, setDragging] = useState(false);

  const count = levels.length;
  const activeIdx = getReasoningStepIndex(levels, value);
  const rawPct = count > 1 ? (activeIdx / (count - 1)) * 100 : 100;
  const thumbLeftPct = count > 1 ? 6 + (activeIdx / (count - 1)) * 88 : 94;
  const fillWidthPct = inline
    ? count > 1
      ? activeIdx === 0
        ? 16
        : Math.round((activeIdx / (count - 1)) * 100)
      : 100
    : activeIdx === 0
      ? 12
      : activeIdx === count - 1
        ? 100
        : thumbLeftPct + 2;
  const dynamicLabel = formatEffortDynamicLabel(value, budgets);
  const shortLabel = formatReasoningStepShortLabel(value);
  const isMax = isMaxEffortLevel(levels, value);
  const chroma = resolveEffortChroma(levels, value);
  const wheelAccumRef = useRef(0);

  const updateFromClientX = (clientX: number): boolean => {
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect || rect.width <= 0 || count === 0) return false;
    const ratio = (clientX - rect.left) / rect.width;
    const idx = snapRatioToStepIndex(ratio, count);
    const next = levels[idx];
    if (next && next !== value) {
      onChange(next);
      return true;
    }
    return false;
  };

  const handlePointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragging(true);
    const changed = updateFromClientX(e.clientX);
    pointerSessionRef.current = {
      downX: e.clientX,
      moved: false,
      changedOnDown: changed,
      idxAtDown: activeIdx,
    };
  };

  const handlePointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragging) return;
    const session = pointerSessionRef.current;
    if (session && Math.abs(e.clientX - session.downX) > 3) {
      session.moved = true;
    }
    updateFromClientX(e.clientX);
  };

  const handlePointerUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragging) return;
    setDragging(false);
    const session = pointerSessionRef.current;
    pointerSessionRef.current = null;
    if (
      inline &&
      session &&
      !session.moved &&
      !session.changedOnDown &&
      count > 1
    ) {
      const nextIdx = (session.idxAtDown + 1) % count;
      const next = levels[nextIdx];
      if (next) onChange(next);
    }
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // ignore if already released
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (count === 0) return;
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      e.preventDefault();
      onChange(levels[Math.min(count - 1, activeIdx + 1)]);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      e.preventDefault();
      onChange(levels[Math.max(0, activeIdx - 1)]);
    } else if (e.key === 'Home') {
      e.preventDefault();
      onChange(levels[0]);
    } else if (e.key === 'End') {
      e.preventDefault();
      onChange(levels[count - 1]);
    }
  };

  const wheelCallbackRef = useRef<(e: WheelEvent) => void>(() => {});
  wheelCallbackRef.current = (e: WheelEvent) => {
    if (count <= 1) return;
    const rawDelta =
      e.deltaMode === 1 ? e.deltaY * 16 : e.deltaMode === 2 ? e.deltaY * 120 : e.deltaY;
    if (!Number.isFinite(rawDelta) || Math.abs(rawDelta) < 0.5) return;
    e.preventDefault();
    e.stopPropagation();
    if (wheelAccumRef.current * rawDelta < 0) {
      wheelAccumRef.current = 0;
    }
    wheelAccumRef.current += rawDelta;
    if (Math.abs(wheelAccumRef.current) < 24) return;
    const stepDir = wheelAccumRef.current < 0 ? 1 : -1;
    wheelAccumRef.current = 0;
    const next = stepReasoningLevelByDelta(levels, value, stepDir, { wrap: true });
    if (next && next !== value) {
      onChange(next);
    }
  };

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const listener = (ev: WheelEvent) => wheelCallbackRef.current(ev);
    el.addEventListener('wheel', listener, { passive: false });
    return () => el.removeEventListener('wheel', listener);
  }, []);

  return (
    <div className={inline ? 'relative inline-flex items-center w-full' : 'relative'}>
      <div
        ref={trackRef}
        role="slider"
        tabIndex={0}
        aria-label={ariaLabel}
        aria-valuemin={0}
        aria-valuemax={Math.max(0, count - 1)}
        aria-valuenow={activeIdx}
        aria-valuetext={dynamicLabel}
        data-testid={testId}
        data-effort-level={value}
        data-effort-tier={chroma.tier}
        data-effort-max={isMax ? 'true' : 'false'}
        data-dragging={dragging ? 'true' : 'false'}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onKeyDown={handleKeyDown}
        className={`dt-spectrum-track ${
          inline ? 'dt-spectrum-track-inline' : ''
        } ${compact ? 'dt-spectrum-track-compact' : ''} ${
          isMax ? 'dt-spectrum-track-max' : ''
        }`}
      >
        <div
          className={`dt-spectrum-fill ${
            inline && fillWidthPct < 100 && fillWidthPct > 0 ? 'dt-spectrum-fill-edge' : ''
          }`}
          style={{ width: `${Math.min(100, Math.max(inline ? 16 : 12, fillWidthPct))}%` }}
          aria-hidden="true"
        />

        <div className="dt-meter-sheen rounded-[10px]" aria-hidden="true" />

        {inline ? (
          <span
            data-testid={testId ? `${testId}-badge` : 'effort-level-badge'}
            className={`dt-spectrum-inline-label ${isMax ? 'is-max' : ''}`}
          >
            {shortLabel}
          </span>
        ) : (
          <span
            className="dt-spectrum-thumb"
            style={{ left: `${rawPct === 0 ? 6 : rawPct === 100 ? 94 : thumbLeftPct}%` }}
            aria-hidden="true"
          />
        )}
      </div>
    </div>
  );
}

export const TranslucentSteppedMeter = TranslucentEffortSpectrum;

