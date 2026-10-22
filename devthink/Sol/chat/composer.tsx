/**
 * composer.tsx — the floating glass dock of the chat (the synara glass
 * well married to the t3code resting pill): ONE bordered shell carrying
 * the autosize editor (44 → 140px, the D-07 touch floor) on top and the
 * control bar UNDER the input, INSIDE the shell — the zcode stacked
 * layout. the surface is the frosted glass layer: an aria-hidden overlay
 * pinned under the content (blur 40px, saturate 150 percent, the canvas
 * fill at 55 percent) so the timeline reads through the dock while the
 * shell keeps its border and the 1.2rem radius. unfocused with one line
 * of draft the well rests as the round pill — the 9999px radius, the
 * compact paddings, the control bar joining the pill row by display
 * contents — and the block returns on focus, on a multiline draft or
 * while a picker is open. the bar's lead cluster holds the tool toggles
 * (each patches the system prompt of the next turn — see chatstate for
 * the honest notes) plus the sandbox action chip (not a mode: it opens
 * the saddle engine lane); the tail cluster holds the model control, the
 * effort control and the quiet token meter, collapsing icon-only once
 * the measured well falls under 640px (a ResizeObserver container query,
 * never a media query), ending in the signal key — the 32px circle
 * morphing by state: the up arrow to send, the filled square to stop
 * while a round runs, the spinner while a round is submitting, and the
 * disabled state until content. the placeholder answers the session
 * phase: the empty invitation, the follow up while a round works. While
 * no gateway is registered, an honest one-line notice rides above the
 * well — the gateway is opt-in, nothing is fetched without a
 * registration. Enter sends, Shift+Enter breaks the line.
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
  StopFilled as Stop,
} from "@fluentui/react-icons";
import { type CSSProperties, type KeyboardEvent, type RefObject, useEffect, useMemo, useRef, useState } from "react";
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
  /** aborts the running round — the signal key swaps to the stop square
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
  /* the pill probe state: the well rests as the round pill only while it
   * holds no focus, the draft measures one line and no picker is open.
   * the focus pair below tracks the focus INSIDE the shell (any child:
   * the editor, a chip, a picker row) so interacting with the controls
   * never collapses the pill mid-flight. */
  const wellRef = useRef<HTMLDivElement | null>(null);
  const singleLineHRef = useRef(0);
  const lastWidthRef = useRef(0);
  const [multiline, setMultiline] = useState(false);
  const [focusWithin, setFocusWithin] = useState(false);
  const [wellWidth, setWellWidth] = useState(0);
  const [widthRev, setWidthRev] = useState(0);

  /* the autosize pass (the D-07 composer contract: the input never sits
   * under 44px tall) doubles as the pill probe: the scrollHeight read
   * with the 44px floor lifted — against the single-line baseline,
   * captured whenever the editor empties — decides the multiline flag
   * (a 13px editor wraps its second line under the touch floor, so the
   * raw content height is the only honest line count). the width
   * revision re-runs the pass when a resize rewraps the draft so the
   * pill state never goes stale. */
  // biome-ignore lint/correctness/useExhaustiveDependencies: draft is the trigger — the body reads the live textarea metrics whenever the text changes; widthRev is the revision counter that re-runs the pass when a resize rewraps the draft
  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.minHeight = "0";
    const h = el.scrollHeight;
    el.style.minHeight = "";
    if (el.value === "") {
      singleLineHRef.current = h;
    } else if (singleLineHRef.current === 0) {
      const lh = Number.parseFloat(window.getComputedStyle(el).lineHeight);
      singleLineHRef.current = Number.isFinite(lh) && lh > 0 ? lh : h;
    }
    setMultiline(h > singleLineHRef.current + 2);
    // the theme layer carries the well + the focus ring; the height pin
    // keeps the editor between the touch floor and the 140px cap
    el.style.height = `${Math.min(140, Math.max(44, h))}px`;
  }, [draft, inputRef, widthRev]);

  /* the focus tracking rides the shell, not the editor: focusin and
   * focusout bubble through the well and the relatedTarget check keeps
   * the expanded shape while the focus walks between the children — the
   * blur-to-sibling flash never collapses the pill. */
  useEffect(() => {
    const well = wellRef.current;
    if (!well) return;
    setFocusWithin(well.contains(document.activeElement));
    const onIn = () => setFocusWithin(true);
    const onOut = (e: FocusEvent) => {
      if (!well.contains(e.relatedTarget as Node | null)) setFocusWithin(false);
    };
    well.addEventListener("focusin", onIn);
    well.addEventListener("focusout", onOut);
    return () => {
      well.removeEventListener("focusin", onIn);
      well.removeEventListener("focusout", onOut);
    };
  }, []);

  /* the control ladder (the zcode fit hook): the well watches its own
   * border box with a ResizeObserver — never the viewport — and the tail
   * cluster drops its labels once the surface falls under 640px (the
   * icons and the titles stay). the same observer bumps the width
   * revision so the editor re-measures when a rewrap changes the line
   * count. */
  useEffect(() => {
    const well = wellRef.current;
    if (!well || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => {
      const w = well.getBoundingClientRect().width;
      if (Math.abs(w - lastWidthRef.current) < 0.5) return;
      lastWidthRef.current = w;
      setWellWidth(w);
      setWidthRev((n) => n + 1);
    });
    ro.observe(well);
    return () => ro.disconnect();
  }, []);

  /* the reduced-transparency floor: the glass rides an inline layer, so
   * the media query answers in js — a reduce match swaps the frosted
   * fill for the solid canvas (the same law the model menu carries). */
  const [solidGlass, setSolidGlass] = useState(false);
  useEffect(() => {
    if (typeof window.matchMedia !== "function") return;
    const mq = window.matchMedia("(prefers-reduced-transparency: reduce)");
    const apply = () => setSolidGlass(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

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
   * the declared window turns it into an honest percent. the meter rides
   * the tail cluster between the effort control and the signal key and
   * steps aside under the compact ladder (it is all label, no icon). */
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

  /* the resting pill (the t3code grammar): unfocused with a single line
   * of draft the well collapses to the round pill; focus, a multiline
   * draft or an open picker returns the 1.2rem block. */
  const resting = !focusWithin && !multiline && !modelOpen && !thinkOpen;
  /* the measured ladder: the tail labels leave under 640px of well. */
  const compact = wellWidth > 0 && wellWidth < 640;
  /* the state aware placeholder: the empty invitation, the follow up
   * while a round works. */
  const placeholder = busy ? "send a follow up while it works" : "ask anything";

  /* the dock shell: relative + isolate pin the glass layer (z -1) between
   * the shell paint and the content; the radius and the padding carry the
   * resting morph inline, and the resting grid joins the bar row — the
   * wellbar melts to display contents so the lead chips, the editor and
   * the tail ride ONE pill row. */
  const wellResting: CSSProperties = {
    display: "grid",
    gridTemplateColumns: "minmax(0, auto) minmax(0, 1fr) auto",
    alignItems: "center",
    columnGap: "10px",
  };
  const wellStyle: CSSProperties = {
    position: "relative",
    isolation: "isolate",
    borderRadius: resting ? "9999px" : "1.2rem",
    padding: resting ? "6px 12px" : "12px",
    ...(resting ? wellResting : null),
    transition:
      "border-color 150ms ease, background-color 150ms ease, border-radius 200ms var(--ease-fluent, ease), padding 200ms var(--ease-fluent, ease)",
  };

  /* the frosted surface (the ::before equivalent): the blur 40px with the
   * saturation lift over the canvas fill at 55 percent — solid canvas
   * under the reduced-transparency floor. */
  const glassFill: CSSProperties = solidGlass
    ? { background: "var(--sol-canvas)" }
    : {
        backdropFilter: "blur(40px) saturate(150%)",
        WebkitBackdropFilter: "blur(40px) saturate(150%)",
        background: "color-mix(in oklab, var(--sol-canvas) 55%, transparent)",
      };
  const glassStyle: CSSProperties = {
    position: "absolute",
    inset: 0,
    zIndex: -1,
    borderRadius: "inherit",
    pointerEvents: "none",
    ...glassFill,
  };

  return (
    <div className="dtc-composer">
      {notice ? (
        <p className="dtc-composer__notice" role="status">
          {notice}
        </p>
      ) : null}

      <div ref={wellRef} className="dtc-well" data-resting={resting} data-compact={compact} style={wellStyle}>
        <div className="dtc-well__glass" aria-hidden="true" style={glassStyle} />

        <textarea
          ref={inputRef}
          className="dtc-well__input"
          value={draft}
          rows={1}
          placeholder={placeholder}
          aria-label="Message Sol"
          autoComplete="off"
          enterKeyHint="send"
          onChange={(e) => onDraft(e.target.value)}
          onKeyDown={onKeyDown}
          style={resting ? { gridArea: "1 / 2" } : undefined}
        />

        <div className="dtc-wellbar" style={resting ? { display: "contents" } : undefined}>
          <div className="dtc-wellbar__lead" style={resting ? { gridArea: "1 / 1" } : undefined}>
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

          <div className="dtc-wellbar__tail" style={resting ? { gridArea: "1 / 3" } : undefined}>
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
                  {compact ? null : <span className="dtc-wctrl__label">{activeModel}</span>}
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
                          {m.context ? (
                            <span className="dtc-modelmenu__ctx">{Math.round(m.context / 1000)}k ctx</span>
                          ) : null}
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
                  {compact ? null : <span className="dtc-wctrl__label">{activeThinking}</span>}
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

            {typeof tokenEstimate === "number" && !compact ? (
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
                className={busy ? "dtc-send dtc-send--busy" : "dtc-send"}
                onClick={submit}
                disabled={busy || !draft.trim()}
                aria-label={busy ? "Sending" : "Send message"}
                title={busy ? "Sending" : "Send message"}
              >
                {busy ? (
                  <i className="dtc-gw__spinner dtc-send__spin" aria-hidden="true" />
                ) : (
                  <ArrowUp fontSize={16} aria-hidden="true" />
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
