/**
 * composer.tsx — the send-pill composer (r2-b conversation craft, wave 3-d
 * Win11 grade): the input IS the control — a flat well (r4 top corners, hairline
 * edge, bottom hairline) carrying the autosize textarea (44 → 140px floor per
 * the D-07 chat polish) and the signal key embedded at its end (a 44px round
 * button on the windows accent #0067c0 with its accent ink — hover wash
 * lighter, press scale .96; the focus state rides the well through
 * :focus-within as the 2px accent underline in the theme layer). The technical
 * microcopy row (model name right, mono lowercase) sits above the well and
 * the tool chips sit below it; the chips toggle local modes only — each one
 * patches the system prompt of the next turn (see state.ts for the honest
 * notes) — while the sandbox action chip at the row end is not a mode: it
 * opens the saddle engine lane (the pane carries its own execution surface).
 * While no gateway is registered, an honest one-line notice rides above the
 * chips — the gateway is opt-in, nothing is fetched without a registration.
 * Enter sends, Shift+Enter breaks the line.
 */

import {
  CheckmarkRegular as Checkmark,
  ChevronDownRegular as ChevronDown,
  LightbulbRegular as BrainCircuit,
  CubeRegular as Cube,
  type FluentIcon as LucideIcon,
  SendRegular as Send,
  StopRegular as Stop,
} from "@fluentui/react-icons";
import { type KeyboardEvent, type RefObject, useEffect, useMemo, useRef, useState } from "react";
import {
  CHAT_THINKING_LEVELS,
  type ChatThinking,
  CHAT_TOOLS,
  type GatewayModel,
  GATEWAY_MODEL,
  type ToolId,
} from "../../chatstate.ts";
import { formatCompactTokenCount } from "../../tokenestimate.ts";

const TOOL_ICONS: Record<ToolId, LucideIcon> = {
  thinking: BrainCircuit,
};

export function Composer({
  draft,
  onDraft,
  onSend,
  onStop,
  busy,
  tools,
  onToggleTool,
  inputRef,
  notice,
  sandboxOn,
  sandboxRunning,
  onToggleSandbox,
  model,
  models,
  onModel,
  thinking,
  onThinking,
  tokenEstimate,
  tokenContext,
}: {
  draft: string;
  onDraft: (v: string) => void;
  onSend: () => void;
  /** aborts the running round — the Send key swaps to the Stop glyph
   * while busy (the competitor grammar; the partial commits on the floor). */
  onStop?: (() => void) | undefined;
  busy: boolean;
  tools: ToolId[];
  onToggleTool: (id: ToolId) => void;
  inputRef: RefObject<HTMLTextAreaElement | null>;
  /** the honest disconnected line — rendered above the pills while set. */
  notice?: string | undefined;
  /** whether the sandbox lane is open (drives the chip pressed state). */
  sandboxOn?: boolean | undefined;
  /** whether the saddle engine is running (lights the chip dot). */
  sandboxRunning?: boolean | undefined;
  /** opens/closes the sandbox lane (the action chip door). */
  onToggleSandbox?: (() => void) | undefined;
  /** the active model id of the round (the picker's pressed row). */
  model?: string | undefined;
  /** the gateway's model catalog (empty keeps the meta-model row alone). */
  models?: GatewayModel[] | undefined;
  /** picks the model for the next round (persisted by the caller). */
  onModel?: ((id: string) => void) | undefined;
  /** the cognition effort of the round (the picker's pressed row). */
  thinking?: ChatThinking | undefined;
  /** picks the effort for the next round (persisted by the caller). */
  onThinking?: ((level: ChatThinking) => void) | undefined;
  /** the estimated token budget of the next round (the house estimator —
   * always an estimate, the meter never pretends to count). */
  tokenEstimate?: number | undefined;
  /** the declared context window of the selected model, when known. */
  tokenContext?: number | undefined;
}) {
  // biome-ignore lint/correctness/useExhaustiveDependencies: draft is the trigger — the body reads the live textarea metrics whenever the text changes
  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "auto";
    // the D-07 composer contract: the input never sits under 44px tall (the
    // touch law floor; the theme layer carries the well + the focus underline)
    el.style.height = `${Math.min(140, Math.max(44, el.scrollHeight))}px`;
  }, [draft, inputRef]);

  /* the model picker (rung 124): the microrow's model chip opens the
   * catalog flyout above the well — one row per gateway model with its
   * declared context window, the pressed row carrying the checkmark. The
   * outside pointerdown closes it; Escape closes it first (the chat
   * Escape stack sits above it in the body). */
  const [modelOpen, setModelOpen] = useState(false);
  const [thinkOpen, setThinkOpen] = useState(false);
  const modelBtnRef = useRef<HTMLButtonElement | null>(null);
  const modelMenuRef = useRef<HTMLDivElement | null>(null);
  const thinkBtnRef = useRef<HTMLButtonElement | null>(null);
  const thinkMenuRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!modelOpen && !thinkOpen) return;
    const onDocPointer = (e: PointerEvent) => {
      const t = e.target as Node | null;
      if (modelOpen && !modelMenuRef.current?.contains(t) && !modelBtnRef.current?.contains(t)) setModelOpen(false);
      if (thinkOpen && !thinkMenuRef.current?.contains(t) && !thinkBtnRef.current?.contains(t)) setThinkOpen(false);
    };
    document.addEventListener("pointerdown", onDocPointer);
    return () => document.removeEventListener("pointerdown", onDocPointer);
  }, [modelOpen, thinkOpen]);
  /* one flyout at a time — opening one closes the other. */
  const openModel = () => {
    setThinkOpen(false);
    setModelOpen((v) => !v);
  };
  const openThink = () => {
    setModelOpen(false);
    setThinkOpen((v) => !v);
  };

  const catalog: GatewayModel[] = models && models.length > 0 ? models : [{ id: GATEWAY_MODEL }];
  const activeModel = model ?? GATEWAY_MODEL;
  const activeThinking: ChatThinking = thinking ?? "medium";

  /* the token meter (rung 125): the estimate reads with the ~ mark and
   * the declared window turns it into an honest percent. */
  const meterText = useMemo(() => {
    const est = formatCompactTokenCount(tokenEstimate ?? 0);
    if (tokenContext && tokenContext > 0) {
      const pct = Math.min(100, Math.round(((tokenEstimate ?? 0) / tokenContext) * 100));
      return `≈ ${est} tok · ${pct}%`;
    }
    return `≈ ${est} tok`;
  }, [tokenContext, tokenEstimate]);

  const submit = () => {
    if (!draft.trim() || busy) return;
    onSend();
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <div className="dtc-composer">
      <div className="dtc-inner">
        <textarea
          ref={inputRef}
          value={draft}
          rows={1}
          placeholder="Ask Sol anything"
          aria-label="Message Sol"
          autoComplete="off"
          enterKeyHint="send"
          onChange={(e) => onDraft(e.target.value)}
          onKeyDown={onKeyDown}
        />
        {busy && onStop ? (
          <button
            type="button"
            className="dtc-send dtc-send--stop"
            onClick={onStop}
            aria-label="Stop generating"
            title="Stop generating"
          >
            <Stop fontSize={16} aria-hidden="true" />
          </button>
        ) : (
          <button
            type="button"
            className="dtc-send"
            onClick={submit}
            disabled={busy || !draft.trim()}
            aria-label="Send message"
            title="Send message"
          >
            <Send fontSize={18} aria-hidden="true" />
          </button>
        )}
      </div>

      {notice ? (
        <p className="dtc-composer__notice" role="status">
          {notice}
        </p>
      ) : null}

      <div className="dtc-pillrow">
        <fieldset className="dtc-pills" aria-label="Tool modes">
          {CHAT_TOOLS.map((tool) => {
            const Icon = TOOL_ICONS[tool.id];
            const on = tools.includes(tool.id);
            return (
              <button
                key={tool.id}
                type="button"
                className="dtc-pill"
                aria-pressed={on}
                onClick={() => onToggleTool(tool.id)}
                title={tool.note}
              >
                <Icon fontSize={13} aria-hidden="true" />
                <span>{tool.label}</span>
              </button>
            );
          })}
          {onToggleSandbox ? (
            <button
              type="button"
              className="dtc-pill dtc-pill--sb"
              aria-pressed={sandboxOn === true}
              onClick={onToggleSandbox}
              title="Open the saddle sandbox lane"
            >
              <Cube fontSize={13} aria-hidden="true" />
              <span>Sandbox</span>
              {sandboxRunning ? <i className="dtc-pill--sb__dot" aria-hidden="true" /> : null}
            </button>
          ) : null}
        </fieldset>

        <div className="dtc-microrow dtc-microrow--bar">
          {onModel ? (
            <button
              ref={modelBtnRef}
              type="button"
              className="dtc-modelbtn"
              aria-haspopup="listbox"
              aria-expanded={modelOpen}
              onClick={() => setModelOpen((v) => !v)}
              title="Pick the model"
            >
              <span>model {activeModel}</span>
              <ChevronDown fontSize={11} aria-hidden="true" className="dtc-modelbtn__chev" />
            </button>
          ) : (
            <span>model {activeModel}</span>
          )}
          {modelOpen && onModel ? (
            <div
              ref={modelMenuRef}
              className="dtc-modelmenu"
              role="listbox"
              aria-label="Models"
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  e.stopPropagation();
                  setModelOpen(false);
                  modelBtnRef.current?.focus();
                }
              }}
            >
              {catalog.map((m) => {
                const on = m.id === activeModel;
                return (
                  <button
                    key={m.id}
                    type="button"
                    role="option"
                    aria-selected={on}
                    className="dtc-modelmenu__row"
                    onClick={() => {
                      onModel(m.id);
                      setModelOpen(false);
                      modelBtnRef.current?.focus();
                    }}
                  >
                    <span className="dtc-modelmenu__id">{m.id}</span>
                    {m.context ? <span className="dtc-modelmenu__ctx">{Math.round(m.context / 1000)}k ctx</span> : null}
                    {on ? <Checkmark fontSize={13} aria-hidden="true" className="dtc-modelmenu__check" /> : null}
                  </button>
                );
              })}
            </div>
          ) : null}
          {onThinking ? (
            <>
              <button
                ref={thinkBtnRef}
                type="button"
                className="dtc-modelbtn"
                aria-haspopup="listbox"
                aria-expanded={thinkOpen}
                onClick={openThink}
                title="Reasoning effort"
              >
                <span>think {activeThinking}</span>
                <ChevronDown fontSize={11} aria-hidden="true" className="dtc-modelbtn__chev" />
              </button>
              {thinkOpen ? (
                <div
                  ref={thinkMenuRef}
                  className="dtc-modelmenu dtc-modelmenu--right"
                  role="listbox"
                  aria-label="Reasoning effort"
                  onKeyDown={(e) => {
                    if (e.key === "Escape") {
                      e.stopPropagation();
                      setThinkOpen(false);
                      thinkBtnRef.current?.focus();
                    }
                  }}
                >
                  {CHAT_THINKING_LEVELS.map((lvl) => {
                    const on = lvl.id === activeThinking;
                    return (
                      <button
                        key={lvl.id}
                        type="button"
                        role="option"
                        aria-selected={on}
                        className="dtc-modelmenu__row"
                        title={lvl.note}
                        onClick={() => {
                          onThinking(lvl.id);
                          setThinkOpen(false);
                          thinkBtnRef.current?.focus();
                        }}
                      >
                        <span className="dtc-modelmenu__id">{lvl.label}</span>
                        <span className="dtc-modelmenu__ctx">{lvl.note}</span>
                        {on ? <Checkmark fontSize={13} aria-hidden="true" className="dtc-modelmenu__check" /> : null}
                      </button>
                    );
                  })}
                </div>
              ) : null}
              {typeof tokenEstimate === "number" ? (
                <span
                  className="dtc-meter"
                  title="Estimated with the house chars-per-token approximation — never an exact count"
                >
                  {meterText}
                </span>
              ) : null}
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
