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
  LightbulbRegular as BrainCircuit,
  CubeRegular as Cube,
  type FluentIcon as LucideIcon,
  SendRegular as Send,
} from "@fluentui/react-icons";
import { type KeyboardEvent, type RefObject, useEffect } from "react";
import { CHAT_TOOLS, GATEWAY_MODEL, type ToolId } from "../../chatstate.ts";

const TOOL_ICONS: Record<ToolId, LucideIcon> = {
  thinking: BrainCircuit,
};

export function Composer({
  draft,
  onDraft,
  onSend,
  busy,
  tools,
  onToggleTool,
  inputRef,
  notice,
  sandboxOn,
  sandboxRunning,
  onToggleSandbox,
}: {
  draft: string;
  onDraft: (v: string) => void;
  onSend: () => void;
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
      <div className="dtc-microrow">
        <span>model {GATEWAY_MODEL}</span>
      </div>

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
        </fieldset>
        {onToggleSandbox ? (
          <fieldset className="dtc-pills dtc-pills--action" aria-label="Sandbox">
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
          </fieldset>
        ) : null}
      </div>
    </div>
  );
}
