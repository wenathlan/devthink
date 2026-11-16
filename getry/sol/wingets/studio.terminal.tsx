'use client';

/**
 * ============================================================================
 * TERMINAL DRAWER — the live gateway request log (v2 studio feature, kept on
 * the interface-18 replacement)
 * ============================================================================
 * a docked-bottom translucent drawer listing the last gateway calls: method,
 * path, status, duration and detail — the same contract the previous studio
 * interface shipped (TerminalLogLine), rendered under the crisp-white /
 * matte-obsidian squircle grammar (glass surface, DM Mono, effort-tier accent).
 */

import { useEffect, useRef } from 'react';
import { FluentDismiss, FluentTerminal } from './studio.icons';

export interface TerminalLogLine {
  id: string;
  at: number;
  method: string;
  path: string;
  status: number | string;
  detail: string;
  durationMs?: number;
}

export interface TerminalDrawerProps {
  open: boolean;
  onClose: () => void;
  lines: TerminalLogLine[];
}

function statusTone(status: number | string): string {
  if (status === 'ERR') return 'text-red-400';
  const n = typeof status === 'number' ? status : Number(status);
  if (!Number.isFinite(n)) return 'text-[var(--dk-text-3)]';
  if (n >= 500) return 'text-red-400';
  if (n >= 400) return 'text-amber-300';
  if (n >= 200) return 'text-emerald-400';
  return 'text-[var(--dk-text-3)]';
}

export function TerminalDrawer({ open, onClose, lines }: TerminalDrawerProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  /* keep the newest line in view when the drawer is open */
  useEffect(() => {
    if (open && scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [open, lines.length]);

  if (!open) return null;

  return (
    <section
      aria-label="Terminal — log de requisições do gateway"
      data-testid="terminal-drawer"
      className="pointer-events-auto absolute inset-x-0 bottom-0 z-40 px-3 pb-3"
    >
      <div
        className="mx-auto flex h-[236px] max-w-[860px] flex-col overflow-hidden rounded-[18px] corner-shape-squircle border border-[var(--dk-glass-edge)] text-[var(--dk-text)] shadow-[var(--dk-popover-shadow)]"
        style={{
          background: 'var(--dk-glass-popover)',
          backdropFilter: 'blur(22px) saturate(170%)',
          WebkitBackdropFilter: 'blur(22px) saturate(170%)',
        }}
      >
        {/* header */}
        <header className="flex items-center justify-between border-b border-[var(--dk-panel-divider)] px-4 py-2.5">
          <div className="flex items-center gap-2.5">
            <span className="grid h-6 w-6 place-items-center rounded-[8px] corner-shape-squircle bg-[var(--dk-tab-track)]">
              <FluentTerminal className="h-3.5 w-3.5" />
            </span>
            <span className="font-display text-[12.5px] font-bold tracking-[-0.01em]">
              Terminal — gateway
            </span>
            <span className="font-mono text-[10.5px] text-[var(--dk-text-muted)]">
              {lines.length} calls
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar terminal"
            className="dk-icon-btn"
          >
            <FluentDismiss className="h-3.5 w-3.5" />
          </button>
        </header>

        {/* log lines */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto px-4 py-2.5"
          role="log"
          aria-live="polite"
        >
          {lines.length === 0 ? (
            <p className="font-mono text-[11.5px] text-[var(--dk-text-muted)]">
              aguardando chamadas ao gateway… tudo que o estúdio pedir aparece aqui.
            </p>
          ) : (
            <ul className="flex flex-col gap-[5px]">
              {lines.map((line) => (
                <li
                  key={line.id}
                  className="grid grid-cols-[44px_1fr_52px_58px] items-baseline gap-2 font-mono text-[11px] leading-[1.5]"
                >
                  <span className="font-bold text-[var(--dk-text-3)]">{line.method}</span>
                  <span className="truncate text-[var(--dk-text-2)]" title={line.detail}>
                    {line.path}
                    {line.detail ? (
                      <span className="text-[var(--dk-text-muted)]"> — {line.detail}</span>
                    ) : null}
                  </span>
                  <span className={`text-right font-bold ${statusTone(line.status)}`}>
                    {line.status}
                  </span>
                  <span className="text-right text-[var(--dk-text-muted)]">
                    {line.durationMs !== undefined ? `${line.durationMs}ms` : ''}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
