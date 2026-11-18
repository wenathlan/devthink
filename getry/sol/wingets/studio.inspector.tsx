import { useEffect, useState } from 'react';
import { formatCompactTokens } from './studio.client';
import type {
  RouteDiscoveryResult,
  RouteName
} from './studio.client';
import {
  FluentArrowSync,
  FluentCheck,
  FluentDismiss,
} from './studio.icons';

interface ModelInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  baseUrl: string;
  onApplyBaseUrl: (nextUrl: string) => void;
  routeResults: RouteDiscoveryResult[];
  isDiscovering: boolean;
  onSelectModel: (route: RouteName, modelId: string) => void;
  activeRoute: RouteName;
  activeModelId: string;
}

export function ModelInspectorModal({
  isOpen,
  onClose,
  baseUrl,
  onApplyBaseUrl,
  routeResults,
  isDiscovering,
  onSelectModel,
  activeRoute,
  activeModelId,
}: ModelInspectorModalProps) {
  const [draftUrl, setDraftUrl] = useState(baseUrl);
  const [selectedInspectRoute, setSelectedInspectRoute] = useState<string>(
    activeRoute || 'v1'
  );
  const [showRawJson, setShowRawJson] = useState(false);

  useEffect(() => {
    setDraftUrl(baseUrl);
  }, [baseUrl]);

  useEffect(() => {
    if (isOpen) {
      setSelectedInspectRoute(activeRoute || routeResults[0]?.route || 'v1');
    }
  }, [isOpen, activeRoute, routeResults]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const inspected =
    routeResults.find((r) => r.route === selectedInspectRoute) ??
    routeResults[0];

  return (
    // biome-ignore lint/a11y/useKeyWithClickEvents: click-to-dismiss is a deliberate mouse-only convenience — the inspector dialog owns the keyboard lane, so a keyboard handler here would be dead code
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Inspect GET model discovery"
      className="dt-center-modal-backdrop fixed inset-0 z-[90] flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* biome-ignore lint/a11y/useKeyWithClickEvents: the pane stops the backdrop dismissal without owning a click action — the controls inside carry the keyboard lane, so a keyboard handler here would be dead code */}
      <div
        style={{ boxShadow: 'var(--dk-popover-shadow)' }}
        className="flex max-h-[86vh] w-full max-w-4xl flex-col overflow-hidden rounded-[22px] squircle border border-[var(--dk-matte-edge)] bg-[var(--dk-popover)] text-[var(--dk-text)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-4 border-b border-[var(--dk-panel-divider)] px-5 py-3.5 shrink-0">
          <div>
            <h2 className="font-display text-[15px] font-bold">
              GET Model Discovery
            </h2>
            <p className="text-xs text-[var(--dk-text-3)]">
              Live probing of model IDs, routes, and capabilities
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close inspector"
            className="dk-icon-btn w-8 h-8 px-0"
          >
            <FluentDismiss className="h-4 w-4" />
          </button>
        </div>

        {/* Base URL Input */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onApplyBaseUrl(draftUrl);
          }}
          className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 border-b border-[var(--dk-panel-divider)] bg-[var(--dk-surface-2)] px-5 py-3 shrink-0"
        >
          <label htmlFor="gateway-base-url" className="sr-only">
            Gateway base URL
          </label>
          <input
            id="gateway-base-url"
            type="text"
            value={draftUrl}
            onChange={(e) => setDraftUrl(e.target.value)}
            placeholder="https://b15m592snje1-d.space-z.ai"
            className="flex-1 rounded-[12px] squircle border border-[var(--dk-matte-edge)] bg-[var(--dk-surface)] px-3 py-1.5 font-mono text-xs text-[var(--dk-text)] focus:border-[var(--dk-brand)] focus:outline-none"
          />
          <button
            type="submit"
            disabled={isDiscovering}
            className="send-key h-8 px-4"
          >
            <FluentArrowSync className={`h-3.5 w-3.5 ${isDiscovering ? 'animate-spin' : ''}`} />
            <span>Run GET</span>
          </button>
        </form>

        {/* Route tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto border-b border-[var(--dk-panel-divider)] px-5 py-2.5 shrink-0">
          <div className="dk-segmented-track">
            {routeResults.map((r) => {
              const isSelected = r.route === inspected?.route;
              const statusText =
                r.status === 'live'
                  ? `${r.models.length}`
                  : r.status === 'paused'
                    ? '503'
                    : r.status === 'key_required'
                      ? `${r.models.length} key`
                      : 'error';
              return (
                <button
                  key={r.route}
                  type="button"
                  aria-selected={isSelected}
                  onClick={() => setSelectedInspectRoute(r.route)}
                  className="dk-segmented-btn font-mono text-[11.5px] tabular-nums"
                >
                  <span className="notranslate">/{r.route}</span>
                  <span className="notranslate opacity-65">{statusText}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Route Details + Model Table or Raw JSON */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {inspected && (
            <>
              <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-[var(--dk-text-2)] tabular-nums">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="notranslate font-mono font-medium text-[var(--dk-text)]">
                    GET {baseUrl}/{inspected.route}/models
                  </span>
                  <span className="opacity-45" aria-hidden="true">/</span>
                  <span className="notranslate">HTTP {inspected.httpStatus || 'ERR'}</span>
                  <span className="opacity-45" aria-hidden="true">/</span>
                  <span className="notranslate font-mono">{inspected.latencyMs} ms</span>
                  <span className="opacity-45" aria-hidden="true">/</span>
                  <span className="notranslate">{inspected.providerLabel}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowRawJson((v) => !v)}
                  className="text-xs font-semibold text-[var(--dk-brand)] hover:underline cursor-pointer"
                >
                  {showRawJson ? 'View ID table' : 'View raw JSON'}
                </button>
              </div>

              {inspected.error && (
                <div className="rounded-[14px] squircle border border-[var(--dk-matte-edge)] bg-[var(--dk-surface-2)] px-4 py-2.5 text-xs text-[var(--dk-warning)]">
                  {inspected.error}
                </div>
              )}

              {(inspected.understandingRoutes ||
                inspected.imageModels ||
                inspected.thinkingLevels) &&
                !showRawJson && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {inspected.thinkingLevels && (
                      <div className="rounded-[16px] squircle border border-[var(--dk-matte-edge)] bg-[var(--dk-surface-2)] p-3.5 text-xs space-y-2 md:col-span-2">
                        <div className="font-semibold text-[var(--dk-text)]">
                          Thinking Levels (reasoning_effort)
                        </div>
                        <div className="flex flex-wrap gap-2 font-mono text-[11px] text-[var(--dk-text-2)] tabular-nums">
                          {Object.entries(inspected.thinkingLevels).map(([lvl, budget]) => (
                            <span
                              key={lvl}
                              className="rounded-lg bg-[var(--dk-surface)] border border-[var(--dk-matte-edge)] px-2.5 py-1"
                            >
                              <span className="text-[var(--dk-text)] font-medium">{lvl}</span>
                              <span className="ml-1.5 text-[var(--dk-text-3)]">{budget}</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {inspected.understandingRoutes && (
                      <div className="rounded-[16px] squircle border border-[var(--dk-matte-edge)] bg-[var(--dk-surface-2)] p-3.5 text-xs space-y-2">
                        <div className="font-semibold text-[var(--dk-text)]">
                          Understanding Routes
                        </div>
                        <div className="space-y-1.5">
                          {(['image', 'audio', 'video'] as const).map((kind) => {
                            const entry = inspected.understandingRoutes?.[kind];
                            if (!entry) return null;
                            return (
                              <div
                                key={kind}
                                className="flex flex-col gap-0.5 border-t border-[var(--dk-panel-divider)] pt-1.5 first:border-t-0 first:pt-0"
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <span className="font-mono text-[var(--dk-text)]">
                                    {entry.route}
                                  </span>
                                  <span className="text-[11px] text-[var(--dk-text-3)]">
                                    {kind}
                                  </span>
                                </div>
                                <div className="font-mono text-[11px] text-[var(--dk-text-3)] break-all">
                                  {entry.models.join(', ')}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {inspected.imageModels && inspected.imageModels.length > 0 && (
                      <div className="rounded-[16px] squircle border border-[var(--dk-matte-edge)] bg-[var(--dk-surface-2)] p-3.5 text-xs space-y-2">
                        <div className="font-semibold text-[var(--dk-text)]">
                          Image Models (/{inspected.route}/images/generations)
                        </div>
                        <div className="space-y-1.5">
                          {inspected.imageModels.map((im) => (
                            <div
                              key={im.id}
                              className="flex flex-col gap-0.5 border-t border-[var(--dk-panel-divider)] pt-1.5 first:border-t-0 first:pt-0"
                            >
                              <div className="flex items-center justify-between gap-2">
                                <span className="font-mono text-[var(--dk-text)]">{im.id}</span>
                                {im.modality && (
                                  <span className="text-[11px] text-[var(--dk-text-3)]">
                                    {im.modality}
                                  </span>
                                )}
                              </div>
                              {im.sizes && im.sizes.length > 0 && (
                                <div className="font-mono text-[11px] text-[var(--dk-text-3)]">
                                  {im.sizes.join(' / ')}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

              {showRawJson ? (
                <pre className="notranslate max-h-[46vh] overflow-auto rounded-[16px] squircle border border-[var(--dk-matte-edge)] bg-[var(--dk-surface-2)] p-4 font-mono text-xs text-[var(--dk-text)]">
                  {JSON.stringify(inspected.rawPayload, null, 2)}
                </pre>
              ) : inspected.models.length > 0 ? (
                <div className="overflow-x-auto rounded-[16px] squircle border border-[var(--dk-matte-edge)] bg-[var(--dk-surface)]">
                  <table className="w-full border-collapse text-left text-xs">
                    <thead>
                      <tr className="border-b border-[var(--dk-panel-divider)] bg-[var(--dk-surface-2)] text-[var(--dk-text-3)]">
                        <th className="px-4 py-2.5 font-semibold">Model ID</th>
                        <th className="px-4 py-2.5 font-semibold">Source</th>
                        <th className="px-4 py-2.5 font-semibold text-right">Context</th>
                        <th className="px-4 py-2.5 font-semibold text-right">Max output</th>
                        <th className="px-4 py-2.5 font-semibold text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--dk-panel-divider)]">
                      {inspected.models.map((m) => {
                        const isCurrent =
                          m.route === activeRoute && m.id === activeModelId;
                        return (
                          <tr
                            key={m.id}
                            className="hover:bg-[var(--dk-raised)] transition-colors"
                          >
                            <td className="px-4 py-2 font-mono font-medium text-[var(--dk-text)]">
                              <span className="notranslate">{m.id}</span>
                              {m.supportsVision && (
                                <span className="ml-2 font-sans text-[11px] text-[var(--dk-brand)]">
                                  Vision
                                </span>
                              )}
                              {m.meta && (
                                <span className="notranslate ml-2 font-sans text-[11px] text-[var(--dk-text-3)]">
                                  Meta
                                </span>
                              )}
                            </td>
                            <td className="notranslate px-4 py-2 text-[var(--dk-text-2)]">
                              {m.ownedBy}
                            </td>
                            <td className="notranslate px-4 py-2 text-right font-mono tabular-nums text-[var(--dk-text-2)]">
                              {formatCompactTokens(m.contextWindow)}
                            </td>
                            <td className="notranslate px-4 py-2 text-right font-mono tabular-nums text-[var(--dk-text-2)]">
                              {formatCompactTokens(m.maxOutput)}
                            </td>
                            <td className="px-4 py-2 text-right">
                              <button
                                type="button"
                                onClick={() => {
                                  onSelectModel(m.route, m.id);
                                  onClose();
                                }}
                                className={
                                  isCurrent
                                    ? 'inline-flex items-center gap-1 rounded-[10px] squircle bg-[var(--dk-brand-soft)] px-2.5 py-1 text-xs font-semibold text-[var(--dk-brand)] cursor-pointer'
                                    : 'send-key h-7 px-3 text-xs'
                                }
                              >
                                {isCurrent ? (
                                  <>
                                    <FluentCheck className="h-3 w-3" />
                                    <span>Active</span>
                                  </>
                                ) : (
                                  <span>Use ID</span>
                                )}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : null}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
