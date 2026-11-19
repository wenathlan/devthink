import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import type { ChatMessage, RouteDiscoveryResult, RouteName } from '../../studio.client';
import type { EffortChromaTier } from '../../studio.uiprefs';
import { MarkdownRenderer } from './studio.markdown';
import { DevThinkAnsiCanvas } from './studio.visuals';
import {
  DevThinkLogoMark,
  DevThinkLogoOutline,
  FluentArrowDown,
  FluentArrowSync,
  FluentArrowUpRight,
  FluentBot,
  FluentCheck,
  FluentChevronDown,
  FluentChevronRight,
  FluentCode,
  FluentCopy,
  FluentCube,
  FluentDismiss,
  FluentDownload,
  FluentLayers,
  FluentMaximize,
  FluentWarning,
  NewChatMorphLogo,
} from './studio.icons';

interface ChatThreadProps {
  messages: ChatMessage[];
  activeConversationId?: string;
  sidebarOpen: boolean;
  onExpandSidebar: () => void;
  activeRoute: RouteName;
  routeResults: RouteDiscoveryResult[];
  onRetryLast: () => void;
  onContinueLast?: () => void;
  onSelectFallbackRoute: (route: RouteName) => void;
  onQuickPrompt?: (prompt: string) => void;
  onTriggerAttachImage?: () => void;
  onPrefillImagePrompt?: () => void;
  onOpenParams?: () => void;
  onExportMarkdown?: () => void;
  centeredComposer?: ReactNode;
  darkMode: boolean;
  ansiPulseCount: number;
  ansiEnabled?: boolean;
  autoScrollEnabled?: boolean;
  engineMode?: boolean;
  effortTier?: EffortChromaTier;
}

function ReasoningDisclosure({
  reasoning,
  isStreaming,
}: {
  reasoning: string;
  isStreaming?: boolean;
}) {
  const [open, setOpen] = useState(Boolean(isStreaming));
  const previewLine = reasoning.replace(/\s+/g, ' ').trim();

  return (
    <div className="mb-3 border-l border-[var(--dk-panel-divider)] pl-3">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center gap-1.5 py-1 text-left text-xs text-[var(--dk-text-3)] hover:text-[var(--dk-text)] transition-colors cursor-pointer"
      >
        {open ? (
          <FluentChevronDown className="h-3.5 w-3.5 shrink-0" />
        ) : (
          <FluentChevronRight className="h-3.5 w-3.5 shrink-0" />
        )}
        <span className="font-semibold shrink-0">
          {isStreaming ? 'Thinking...' : 'Thinking'}
        </span>
        {!open && previewLine && (
          <span className="truncate italic opacity-75">{previewLine}</span>
        )}
      </button>

      <div className={`reasoning-disclosure-body ${open ? 'open' : ''}`}>
        <div className="reasoning-disclosure-inner">
          <div className="pt-1.5 pb-1 text-xs leading-relaxed text-[var(--dk-text-2)] whitespace-pre-wrap font-mono">
            {reasoning}
          </div>
        </div>
      </div>
    </div>
  );
}

function AssistantMessageRow({
  msg,
  isLast,
  onRetryLast,
  onContinueLast,
  onPreviewImage,
}: {
  msg: ChatMessage;
  isLast: boolean;
  onRetryLast: () => void;
  onContinueLast?: () => void;
  onPreviewImage: (src: string, alt: string) => void;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(msg.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // ignore clipboard errors
    }
  };

  return (
    <article className="group/msg dt-bubble-pop py-1">
      {/* Compact Attribution Line */}
      <div className="mb-1.5 flex flex-wrap items-center gap-2 text-[11px] text-[var(--dk-text-3)] tabular-nums">
        <DevThinkLogoMark className="h-3.5 w-3.5 text-[var(--dk-text-2)] shrink-0" />
        <span className="notranslate font-semibold text-[var(--dk-text-2)]">
          {msg.modelId || 'Assistant'}
        </span>
        {msg.fallback && (
          <span className="font-mono text-[var(--dk-warning)]">
            fallback {msg.fallback}
          </span>
        )}
      </div>

      <div>
        {msg.reasoning && (
          <ReasoningDisclosure
            reasoning={msg.reasoning}
            isStreaming={msg.isStreaming && !msg.content}
          />
        )}

        {msg.isStreaming &&
        !msg.content &&
        !msg.reasoning &&
        !msg.generatedImages?.length &&
        !msg.error ? (
          <div
            className="msg-assistant-typing"
            aria-label="Generating response"
            data-testid="assistant-typing-bubble"
          >
            <DevThinkLogoMark className="h-3.5 w-3.5 text-[var(--dk-text-2)] animate-pulse" />
            <div className="h-1.5 w-14 rounded-[3px] bg-[var(--dk-text-3)]/40 dt-shimmer-bar origin-left" />
          </div>
        ) : (
          <div
            className={
              msg.content || (msg.generatedImages && msg.generatedImages.length > 0)
                ? 'msg-assistant-bubble notranslate'
                : 'notranslate'
            }
          >
            {msg.generatedImages && msg.generatedImages.length > 0 && (
              <div className="mb-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {msg.generatedImages.map((src, index) => (
                  <div
                    key={`${msg.id}_gen_${index}`}
                    className="group/img relative overflow-hidden rounded-[16px] squircle border border-[var(--dk-matte-edge)] bg-[var(--dk-surface)]"
                  >
                    <button
                      type="button"
                      onClick={() =>
                        onPreviewImage(src, `Generated image ${index + 1}`)
                      }
                      aria-label={`Enlarge image ${index + 1}`}
                      className="block w-full cursor-zoom-in focus:outline-none"
                    >
                      <img
                        src={src}
                        alt={`Imagem gerada ${index + 1}`}
                        className="w-full max-h-[380px] object-contain bg-[var(--dk-surface-2)]"
                      />
                    </button>
                    <div className="flex items-center justify-between gap-2 border-t border-[var(--dk-panel-divider)] px-3 py-1.5 text-xs text-[var(--dk-text-2)]">
                      <span className="font-mono truncate">
                        {msg.modelId || 'image'}
                      </span>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() =>
                            onPreviewImage(src, `Generated image ${index + 1}`)
                          }
                          aria-label="Enlarge image"
                          className="text-[var(--dk-text-3)] hover:text-[var(--dk-text)] cursor-pointer"
                        >
                          <FluentMaximize className="h-3.5 w-3.5" />
                        </button>
                        <a
                          href={src}
                          download={`devthink-image-${index + 1}.jpg`}
                          aria-label="Download image"
                          className="inline-flex items-center gap-1 font-semibold text-[var(--dk-brand)]"
                        >
                          <FluentDownload className="h-3.5 w-3.5 shrink-0" />
                          <span>Download</span>
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {msg.content && <MarkdownRenderer content={msg.content} />}
          </div>
        )}

        {msg.error && (
          <div className="mt-3 rounded-[14px] squircle border border-red-500/30 bg-red-500/10 p-3.5 text-xs text-[var(--dk-text)]">
            <div className="flex items-start gap-2.5">
              <FluentWarning className="mt-0.5 h-4 w-4 shrink-0 text-[var(--dk-danger)]" />
              <div className="min-w-0 flex-1">
                <p className="font-semibold">
                  {msg.content.trim()
                    ? 'Response interrupted before completion'
                    : 'Model response failed'}
                </p>
                <p className="mt-1 font-mono text-[11.5px] text-[var(--dk-text-2)] break-words">
                  {msg.error}
                </p>
                {isLast && (
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    {msg.content.trim() && onContinueLast && (
                      <button
                        type="button"
                        onClick={onContinueLast}
                        className="send-key h-7 px-3 text-xs gap-1.5"
                      >
                        <FluentArrowSync className="h-3 w-3" />
                        <span>Continue response</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={onRetryLast}
                      className="inline-flex h-7 items-center gap-1.5 rounded-[10px] squircle border border-red-500/35 bg-red-500/15 px-3 text-xs font-semibold text-[var(--dk-danger)] hover:bg-red-500/25 transition-colors cursor-pointer"
                    >
                      <FluentArrowSync className="h-3 w-3" />
                      <span>Try again</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {!msg.isStreaming && (!msg.error || Boolean(msg.content)) && (
          <div className="mt-2 flex flex-wrap items-center gap-2 text-[11.5px] text-[var(--dk-text-3)] tabular-nums">
            {msg.content && (
              <button
                type="button"
                onClick={handleCopy}
                aria-label="Copy response"
                title="Copy"
                className="group inline-flex items-center rounded-lg px-1.5 py-1 hover:bg-[var(--dk-raised)] hover:text-[var(--dk-text)] transition-colors cursor-pointer"
              >
                {copied ? (
                  <>
                    <FluentCheck className="h-3.5 w-3.5 shrink-0 text-[var(--dk-brand)]" />
                    <span className="ml-1 font-semibold text-[var(--dk-brand)]">
                      Copied
                    </span>
                  </>
                ) : (
                  <>
                    <FluentCopy className="h-3.5 w-3.5 shrink-0" />
                    <span className="max-w-0 overflow-hidden opacity-0 group-hover:max-w-[60px] group-hover:opacity-100 group-hover:ml-1 transition-all duration-200 whitespace-nowrap">
                      Copy
                    </span>
                  </>
                )}
              </button>
            )}

            {isLast && !msg.error && (
              <button
                type="button"
                onClick={onRetryLast}
                aria-label="Regenerate response"
                title="Regenerate"
                className="group inline-flex items-center rounded-lg px-1.5 py-1 hover:bg-[var(--dk-raised)] hover:text-[var(--dk-text)] transition-colors cursor-pointer"
              >
                <FluentArrowSync className="h-3.5 w-3.5 shrink-0" />
                <span className="max-w-0 overflow-hidden opacity-0 group-hover:max-w-[85px] group-hover:opacity-100 group-hover:ml-1 transition-all duration-200 whitespace-nowrap">
                  Regenerate
                </span>
              </button>
            )}

            {msg.usage?.total_tokens !== undefined && (
              <span className="font-mono opacity-80 pl-1">
                {msg.usage.total_tokens} tokens
              </span>
            )}
          </div>
        )}
      </div>
    </article>
  );
}

export function ChatThread({
  messages,
  activeConversationId,
  sidebarOpen,
  onExpandSidebar,
  activeRoute,
  routeResults,
  onRetryLast,
  onContinueLast,
  onSelectFallbackRoute,
  onQuickPrompt,
  onExportMarkdown,
  centeredComposer,
  darkMode,
  ansiPulseCount,
  ansiEnabled = true,
  autoScrollEnabled = true,
  engineMode = true,
  effortTier = 'neutral',
}: ChatThreadProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [copiedId, setCopiedId] = useState(false);
  const [lightbox, setLightbox] = useState<{ src: string; alt: string } | null>(null);

  const starterBubbles = useMemo(
    () => [
      {
        id: 'image',
        label: 'Create image',
        tag: 'Visual & frosted',
        prompt:
          'Create a minimalist image of frosted glass and white ceramic sculpture under soft studio light.',
        Icon: FluentCube,
      },
      {
        id: 'idea',
        label: 'Explore ideas',
        tag: 'Multi-angle',
        prompt: 'Suggest 3 creative and minimal approaches to solve this problem.',
        Icon: FluentBot,
      },
      {
        id: 'explain',
        label: 'Quick summary',
        tag: 'Step-by-step',
        prompt: 'Explain step by step in a simple and objective way.',
        Icon: FluentLayers,
      },
      {
        id: 'code',
        label: 'Structure code',
        tag: 'Clean TypeScript',
        prompt: 'Help me structure a clean, testable TypeScript module.',
        Icon: FluentCode,
      },
    ],
    []
  );

  useEffect(() => {
    if (messages.length === 0 && scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [activeConversationId, messages.length]);

  useEffect(() => {
    if (autoScrollEnabled && messages.length > 0) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [
    autoScrollEnabled,
    messages.length,
    messages[messages.length - 1]?.content,
    messages[messages.length - 1]?.reasoning,
  ]);

  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightbox(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightbox]);

  const activeRouteInfo = routeResults.find((r) => r.route === activeRoute);

  const totalThreadTokens = useMemo(
    () => messages.reduce((sum, m) => sum + (m.usage?.total_tokens || 0), 0),
    [messages]
  );

  const toolbar =
    activeConversationId && messages.length > 0 ? (
      <div className="relative z-10 flex h-10 items-center justify-between gap-2 px-3 sm:px-4 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <span className="notranslate hidden sm:inline font-mono text-[11px] text-[var(--dk-text-3)] tabular-nums whitespace-nowrap">
            {messages.length} msgs{totalThreadTokens > 0 ? ` / ${totalThreadTokens} tok` : ''}
          </span>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {activeConversationId && messages.length > 0 && (
            <>
              {onExportMarkdown && (
                <button
                  type="button"
                  onClick={onExportMarkdown}
                  aria-label="Export conversation as Markdown"
                  title="Export Markdown"
                  data-testid="thread-export-btn"
                  className="dk-icon-btn w-7 h-7 px-0"
                >
                  <FluentDownload className="h-3.5 w-3.5" />
                </button>
              )}

              <button
                type="button"
                onClick={() =>
                  bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
                }
                aria-label="Scroll to bottom"
                title="Scroll to bottom"
                className="dk-icon-btn w-7 h-7 px-0"
              >
                <FluentArrowDown className="h-3.5 w-3.5" />
              </button>

              <button
                type="button"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(activeConversationId);
                    setCopiedId(true);
                    setTimeout(() => setCopiedId(false), 1600);
                  } catch {
                    // ignore
                  }
                }}
                aria-label="Copy conversation ID"
                title="Copy ID"
                data-testid="copy-thread-btn"
                className="group dk-icon-btn text-[11px] font-mono px-2"
              >
                {copiedId ? (
                  <>
                    <FluentCheck className="h-3.5 w-3.5 shrink-0 text-[var(--dk-brand)]" />
                    <span className="ml-1">Copied</span>
                  </>
                ) : (
                  <>
                    <FluentCopy className="h-3.5 w-3.5 shrink-0" />
                    <span className="max-w-0 overflow-hidden opacity-0 group-hover:max-w-[50px] group-hover:opacity-100 group-hover:ml-1 transition-all duration-200 whitespace-nowrap">
                      ID
                    </span>
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    ) : null;

  return (
    <>
      {messages.length === 0 ? (
        <div className="relative flex flex-1 flex-col min-h-0 overflow-hidden">
          {ansiEnabled && (
            <DevThinkAnsiCanvas
              engineMode={engineMode}
              pulseTrigger={ansiPulseCount}
              darkMode={darkMode}
              allowCenter={true}
              bottomAnchored={true}
              effortTier={effortTier}
              className="pointer-events-none absolute inset-x-0 bottom-0 h-[44%] z-0 opacity-75 [mask-image:linear-gradient(to_bottom,transparent_0%,black_34%,black_100%)]"
            />
          )}

          <div
            data-testid="hero-gaussian-shader"
            data-effort-tier={effortTier}
            className="hero-gaussian-shader pointer-events-none absolute inset-0 z-0 opacity-85"
          />

          {toolbar}

          <div
            ref={scrollContainerRef}
            className="relative z-10 flex flex-1 flex-col items-center justify-center overflow-y-auto px-4 sm:px-8 py-6"
          >
            <div className="relative w-full max-w-[660px] flex flex-col items-center">
              {/* Soft Chromatic Stage Halo behind headline & centered composer */}
              <div
                aria-hidden="true"
                className="dt-chromatic-stage-glow pointer-events-none absolute -top-8 inset-x-4 h-[210px] rounded-full z-0 opacity-80 dark:opacity-50"
              />

              {/* Architectural Hairline Wireframe DevThink Emblem Behind Greeting */}
              <div
                aria-hidden="true"
                data-testid="hero-logo-outline"
                className="pointer-events-none absolute -top-16 sm:-top-24 left-1/2 -translate-x-1/2 text-[var(--dk-text)] opacity-[0.07] dark:opacity-[0.095]"
              >
                <DevThinkLogoOutline className="h-56 w-56 sm:h-64 sm:w-64" />
              </div>

              {/* Morphing Chat <-> DevThink Hero Emblem + Title */}
              <div
                key={activeConversationId || 'empty-hero'}
                className="dt-empty-hero-enter relative z-10 flex flex-col items-center text-center mb-5"
              >
                <div className="dt-float-idle relative mb-3 flex h-10 w-10 items-center justify-center">
                  <NewChatMorphLogo className="h-9 w-9 text-[var(--dk-text)]" />
                </div>

                <h1 className="font-display text-2xl sm:text-[26px] font-semibold tracking-tight text-[var(--dk-text)] leading-tight text-balance">
                  What are we building today?
                </h1>
              </div>

              {activeRouteInfo?.status === 'paused' && (
                <div className="relative z-10 mb-3.5 inline-flex items-center gap-2 rounded-[13px] squircle border border-[var(--dk-matte-edge)] bg-[var(--dk-surface)] px-3.5 py-1.5 text-xs text-[var(--dk-warning)]">
                  <FluentWarning className="h-3.5 w-3.5 shrink-0" />
                  <span>Model temporarily unavailable on this route.</span>
                  <button
                    type="button"
                    onClick={() => onSelectFallbackRoute('v1')}
                    className="font-semibold underline cursor-pointer"
                  >
                    Switch
                  </button>
                </div>
              )}

              <div className="relative z-10 w-full">{centeredComposer}</div>

              {/* Claymorphic 4-Column Starter Cards */}
              {onQuickPrompt && (
                <div
                  data-testid="cute-starter-bubbles"
                  className="relative z-10 mt-5 w-full grid grid-cols-2 sm:grid-cols-4 gap-3"
                >
                  {starterBubbles.map(({ id, label, tag, prompt, Icon }, idx) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => onQuickPrompt(prompt)}
                      style={{ animationDelay: `${0.08 + idx * 0.06}s` }}
                      className="group relative w-full rounded-[14px] squircle p-3.5 text-left flex flex-col justify-between min-h-[108px] transition-all duration-300 hover:-translate-y-1 surface-card dt-bubble-pop cursor-pointer"
                    >
                      <div className="flex items-start justify-between gap-2 w-full">
                        <div className="w-8 h-8 rounded-[10px] squircle flex items-center justify-center icon-frame-3d starter-icon-well-light text-[var(--dk-text)] transition shrink-0">
                          <Icon className="h-4 w-4" />
                        </div>
                        <FluentArrowUpRight className="h-3.5 w-3.5 opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition shrink-0 text-[var(--dk-text-2)]" />
                      </div>
                      <div className="mt-2.5 min-w-0">
                        <div className="text-[12px] font-bold text-[var(--dk-text)] leading-tight truncate">
                          {label}
                        </div>
                        <div className="text-[10.5px] text-[var(--dk-text-3)] mt-0.5 truncate">
                          {tag}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="relative flex flex-1 flex-col min-h-0 overflow-hidden">
          {ansiEnabled && (
            <DevThinkAnsiCanvas
              engineMode={engineMode}
              pulseTrigger={ansiPulseCount}
              darkMode={darkMode}
              allowCenter={false}
              bottomAnchored={true}
              className="pointer-events-none absolute inset-x-0 bottom-0 h-[40%] z-0 opacity-30 [mask-image:linear-gradient(to_bottom,transparent_0%,black_38%,black_100%)]"
            />
          )}

          {toolbar}

          <div ref={scrollContainerRef} className="thread-transcript relative z-10 px-4 sm:px-6">
            <div className="mx-auto max-w-[660px] py-3 space-y-4">
              {messages.map((msg, idx) => {
                const isLast = idx === messages.length - 1;
                if (msg.role === 'user') {
                  return (
                    <div key={msg.id} className="group/user flex flex-col items-end gap-1 dt-bubble-pop">
                      <div className="msg-user-bubble notranslate">
                        {msg.images && msg.images.length > 0 && (
                          <div className="mb-2 flex flex-wrap gap-2">
                            {msg.images.map((img) => (
                              <button
                                key={img.id}
                                type="button"
                                onClick={() => setLightbox({ src: img.dataUrl, alt: img.name })}
                                aria-label={`Enlarge ${img.name}`}
                                className="block overflow-hidden rounded-[12px] squircle border border-[var(--dk-matte-edge)] bg-[var(--dk-surface)] cursor-zoom-in focus:outline-none"
                              >
                                <img
                                  src={img.dataUrl}
                                  alt={img.name}
                                  className="max-h-44 object-contain"
                                />
                              </button>
                            ))}
                          </div>
                        )}
                        <div className="whitespace-pre-wrap">{msg.content}</div>
                      </div>
                      {msg.content && (
                        <button
                          type="button"
                          onClick={() => navigator.clipboard?.writeText(msg.content).catch(() => undefined)}
                          aria-label="Copy your message"
                          title="Copy"
                          className="inline-flex h-5 w-5 items-center justify-center rounded-md text-[var(--dk-text-3)] opacity-0 group-hover/user:opacity-80 hover:opacity-100 hover:bg-[var(--dk-raised)] hover:text-[var(--dk-text)] transition-opacity cursor-pointer"
                        >
                          <FluentCopy className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  );
                }

                return (
                  <AssistantMessageRow
                    key={msg.id}
                    msg={msg}
                    isLast={isLast}
                    onRetryLast={onRetryLast}
                    onContinueLast={onContinueLast}
                    onPreviewImage={(src, alt) => setLightbox({ src, alt })}
                  />
                );
              })}
              <div ref={bottomRef} className="h-3" />
            </div>
          </div>
        </div>
      )}

      {/* Image Lightbox Modal */}
      {lightbox &&
        typeof document !== 'undefined' &&
        createPortal(
          // biome-ignore lint/a11y/useKeyWithClickEvents: click-to-dismiss is a deliberate mouse-only convenience — the dialog the backdrop seats owns the keyboard lane, so a keyboard handler here would be dead code
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Enlarged image preview"
            data-testid="image-lightbox"
            onClick={() => setLightbox(null)}
            className="fixed inset-0 z-[90] flex items-center justify-center bg-black/75 backdrop-blur-md p-4"
          >
            {/* biome-ignore lint/a11y/useKeyWithClickEvents: the inner pane stops the backdrop dismissal without owning a click action — the image inside carries the click-through, so a keyboard handler here would be dead code */}
            <div
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-4xl max-h-[88vh] overflow-hidden rounded-[18px] squircle border border-[var(--dk-matte-edge)] bg-[var(--dk-surface)]"
            >
              <div className="flex items-center justify-between gap-4 border-b border-[var(--dk-panel-divider)] px-4 py-2.5">
                <span className="text-xs font-semibold text-[var(--dk-text)] truncate">
                  {lightbox.alt}
                </span>
                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href={lightbox.src}
                    download="devthink-image.jpg"
                    className="inline-flex items-center gap-1 rounded-[8px] squircle px-2 py-1 text-xs font-semibold text-[var(--dk-text-2)] hover:bg-[var(--dk-raised)] hover:text-[var(--dk-text)]"
                  >
                    <FluentDownload className="h-3.5 w-3.5" />
                    <span>Download</span>
                  </a>
                  <button
                    type="button"
                    onClick={() => setLightbox(null)}
                    aria-label="Close preview"
                    className="dk-icon-btn w-7 h-7 px-0"
                  >
                    <FluentDismiss className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              <div className="p-3 bg-[var(--dk-surface-2)] flex items-center justify-center">
                <img
                  src={lightbox.src}
                  alt={lightbox.alt}
                  className="max-h-[75vh] max-w-full object-contain rounded-[10px] squircle"
                />
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
