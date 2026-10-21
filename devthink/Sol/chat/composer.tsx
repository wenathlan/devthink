/**
 * composer.tsx — the hero composer in the reference grammar (the zcode
 * input shell, the t3code control bar): ONE 2xl bordered well (the only
 * content surface that earns the sanctioned exception) carrying the
 * autosize textarea (44 → 140px, the D-07 touch floor) on top and the
 * control bar UNDER the input, INSIDE the shell — the zcode stacked
 * layout. The bar's lead cluster holds the tool toggles (each patches the
 * system prompt of the next turn — see chatstate for the honest notes)
 * plus the sandbox action chip (not a mode: it opens the saddle engine
 * lane); the tail cluster holds the model control, the effort control
 * and the quiet token meter, ending in the signal key — a 28px circle on
 * the windows accent with the up-arrow glyph (the reference grammar;
 * hover lifts the wash, press scales .96, the running round swaps it to
 * the stop circle). The pickers fly out ABOVE their controls over the
 * input on the glass law. While no gateway is registered, an honest
 * one-line notice rides above the well — the gateway is opt-in, nothing
 * is fetched without a registration. Enter sends, Shift+Enter breaks the
 * line.
 */

import {
  ArrowUpRegular as ArrowUp,
  BoxRegular as Box,
  BrainCircuitRegular as BrainCircuit,
  CheckmarkRegular as Checkmark,
  ChevronDownRegular as ChevronDown,
  CubeRegular as Cube,
  type FluentIcon as LucideIcon,
  LightbulbRegular as Lightbulb,
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
  thinking: Lightbulb,
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
  /** aborts the running round — the signal key swaps to the Stop circle
   * while busy (the reference grammar; the partial commits on the floor). */
  onStop?: (() => void) | undefined;
  busy: boolean;
  tools: ToolId[];
  onToggleTool: (id: ToolId) => void;
  inputRef: RefObject<HTMLTextAreaElement | null>;
  /** the honest disconnected line — rendered above the well while set. */
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
    // touch law floor; the theme layer carries the well + the focus ring)
    el.style.height = `${Math.min(140, Math.max(44, el.scrollHeight))}px`;
  }, [draft, inputRef]);

  /* the model picker (rung 124): the tail cluster's model control opens
   * the catalog flyout above the well — one row per gateway model with its
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
      {notice ? (
        <p className="dtc-composer__notice" role="status">
          {notice}
        </p>
      ) : null}

      <div className="dtc-well">
        <textarea
          ref={inputRef}
          className="dtc-well__input"
          value={draft}
          rows={1}
          placeholder="Ask Sol anything"
          aria-label="Message Sol"
          autoComplete="off"
          enterKeyHint="send"
          onChange={(e) => onDraft(e.target.value)}
          onKeyDown={onKeyDown}
        />

        <div className="dtc-wellbar">
          <div className="dtc-wellbar__lead">
            <fieldset className="dtc-chips" aria-label="Tool modes">
              {CHAT_TOOLS.map((tool) => {
                const Icon = TOOL_ICONS[tool.id];
                const on = tools.includes(tool.id);
                return (
                  <button
                    key={tool.id}
                    type="button"
                    className="dtc-chip"
                    aria-pressed={on}
                    onClick={() => onToggleTool(tool.id)}
                    title={tool.note}
                  >
                    <Icon fontSize={15} aria-hidden="true" />
                    <span>{tool.label}</span>
                  </button>
                );
              })}
              {onToggleSandbox ? (
                <button
                  type="button"
                  className="dtc-chip dtc-chip--sb"
                  aria-pressed={sandboxOn === true}
                  onClick={onToggleSandbox}
                  title="Open the saddle sandbox lane"
                >
                  <Cube fontSize={15} aria-hidden="true" />
                  <span>Sandbox</span>
                  {sandboxRunning ? <i className="dtc-chip--sb__dot" aria-hidden="true" /> : null}
                </button>
              ) : null}
            </fieldset>
          </div>

          <div className="dtc-wellbar__tail">
            {onModel ? (
              <span className="dtc-wctrl">
                <button
                  ref={modelBtnRef}
                  type="button"
                  className="dtc-wctrl__btn"
                  aria-haspopup="listbox"
                  aria-expanded={modelOpen}
                  onClick={openModel}
                  title="Pick the model"
                >
                  <Box fontSize={15} aria-hidden="true" />
                  <span className="dtc-wctrl__label">{activeModel}</span>
                  <ChevronDown fontSize={11} aria-hidden="true" className="dtc-wctrl__chev" />
                </button>
                {modelOpen ? (
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
              </span>
            ) : null}

            {onThinking ? (
              <span className="dtc-wctrl">
                <button
                  ref={thinkBtnRef}
                  type="button"
                  className="dtc-wctrl__btn"
                  aria-haspopup="listbox"
                  aria-expanded={thinkOpen}
                  onClick={openThink}
                  title="Reasoning effort"
                >
                  <BrainCircuit fontSize={15} aria-hidden="true" />
                  <span className="dtc-wctrl__label">{activeThinking}</span>
                  <ChevronDown fontSize={11} aria-hidden="true" className="dtc-wctrl__chev" />
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
              </span>
            ) : null}

            {typeof tokenEstimate === "number" ? (
              <span
                className="dtc-meter"
                title="Estimated with the house chars-per-token approximation — never an exact count"
              >
                {meterText}
              </span>
            ) : null}

            {busy && onStop ? (
              <button
                type="button"
                className="dtc-send dtc-send--stop"
                onClick={onStop}
                aria-label="Stop generating"
                title="Stop generating"
              >
                <Stop fontSize={13} aria-hidden="true" />
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
                <ArrowUp fontSize={16} aria-hidden="true" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
