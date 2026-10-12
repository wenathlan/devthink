/**
 * composer.tsx — the send-pill composer (r2-b conversation craft): the input
 * IS the pill — a fully-rounded hairline shell with a white 4% fill holding
 * the autosize textarea (40 → 140px floor per the D-07 chat polish) and the
 * signal key embedded at its end (a 40px round button, the only accent
 * surface — hover wash lighter, press scale .96; the focus ring rides the
 * pill through :focus-within in the theme layer). The technical microcopy
 * row (model name right, mono lowercase) sits above the pill and the tool
 * chips sit below it; the chips toggle local modes only — each one patches
 * the system prompt of the next turn (see state.ts for the honest notes).
 * While no gateway is registered, an honest one-line notice rides above the
 * chips — the gateway is opt-in, nothing is fetched without a registration.
 * Enter sends, Shift+Enter breaks the line.
 */

import { BrainCircuit, Image as ImageIcon, type LucideIcon, Paperclip, Search, Send, Telescope } from "lucide-react";
import { type KeyboardEvent, type RefObject, useEffect } from "react";
import { CHAT_TOOLS, GATEWAY_MODEL, type ToolId } from "./state.ts";

const TOOL_ICONS: Record<ToolId, LucideIcon> = {
  thinking: BrainCircuit,
  search: Search,
  research: Telescope,
  files: Paperclip,
  image: ImageIcon,
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
}) {
  // biome-ignore lint/correctness/useExhaustiveDependencies: draft is the trigger — the body reads the live textarea metrics whenever the text changes
  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "auto";
    // the D-07 composer contract: the input never sits under 40px tall (the
    // 8px shell keeps its radius, the theme layer carries the focus ring)
    el.style.height = `${Math.min(140, Math.max(40, el.scrollHeight))}px`;
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
        <span>enter sends · shift+enter breaks</span>
        <span className="dtc-model">model · {GATEWAY_MODEL}</span>
      </div>

      <div className="dtc-inner">
        <textarea
          ref={inputRef}
          value={draft}
          rows={1}
          placeholder="Ask Sol anything — hard questions welcome…"
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
          <Send size={18} strokeWidth={1.9} aria-hidden="true" />
        </button>
      </div>

      {notice ? (
        <p className="dtc-composer__notice" role="status">
          {notice}
        </p>
      ) : null}

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
              title={`${tool.label} — ${tool.note}`}
            >
              <Icon size={13} strokeWidth={1.9} aria-hidden="true" />
              <span>{tool.label}</span>
            </button>
          );
        })}
      </fieldset>
    </div>
  );
}
