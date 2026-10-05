/**
 * composer.tsx — the two-layer composer in the win11 search-box skin: an
 * 8px shell with a dark hairline and a white 5% fill (never a pill) holding
 * a technical microcopy row (model name right, in Plex Mono uppercase), the
 * flat inner layer with the autosize textarea (36 → 140px) and the solar
 * send button (the only accent surface — hover wash lighter, press scale
 * .96), and a bottom row of functional tool chips (4px corners; the active
 * state is a wash plus a 3px dot that means the tool patches the next
 * turn's system prompt). The chips toggle local modes only — each one
 * patches the system prompt of the next turn (see state.ts for the honest
 * notes). While no gateway is registered, an honest one-line notice rides
 * above the chips — the gateway is opt-in, nothing is fetched without a
 * registration. Enter sends, Shift+Enter breaks the line.
 */
import { useEffect, type KeyboardEvent, type RefObject } from "react";
import { BrainCircuit, Image as ImageIcon, Paperclip, Search, Send, Telescope, type LucideIcon } from "lucide-react";
import { CHAT_TOOLS, GATEWAY_MODEL, type ToolId } from "./state";

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
    el.style.height = `${Math.min(140, Math.max(32, el.scrollHeight))}px`;
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
