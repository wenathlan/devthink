/**
 * turn.tsx — one conversation turn in the Windows grammar: the user message
 * sits in an 8px cell on the right, the assistant speaks flat on the floor,
 * 36px 8px-corner avatars, the markdown renderer beside it (markdown.tsx),
 * the collapsible cognition drawer styled as a win11 expander for
 * reasoning_content, and the meta line with time and model. Also exports the
 * functional generation status row (a 3px live bar) and the inline error row
 * with a win11 retry — the same contract as the os AuraChat.
 */
import { BrainCircuit, ChevronDown, RefreshCw } from "lucide-react";
import { useState } from "react";
import { type ChatTurn, cx, fmtTime } from "../../chatstate.ts";
import { Markdown } from "./markdown.tsx";
import { SolBotIcon } from "./solboticon.tsx";

/** Cognition — the reasoning drawer of the assistant turn. */
function Cognition({ text }: { text: string }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="dtc-cog" data-open={open ? "true" : "false"}>
      <button type="button" className="dtc-cog__head" aria-expanded={open} onClick={() => setOpen((v) => !v)}>
        <BrainCircuit size={13} strokeWidth={1.8} aria-hidden="true" />
        <span>Cognition</span>
        <ChevronDown size={13} strokeWidth={1.8} aria-hidden="true" className="dtc-cog__chev" />
      </button>
      {open ? <p className="dtc-cog__body">{text}</p> : null}
    </div>
  );
}

/** Turn — one message row: avatar, cognition drawer (assistant), bubble, meta
 * line. `fresh` marks the turn that just arrived (the chat page sets it on
 * the last turn only); the theme layer rises it 240ms and never replays the
 * history — the class is inert under reduced motion. */
export function Turn({ turn, fresh = false }: { turn: ChatTurn; fresh?: boolean }) {
  const assistant = turn.role === "assistant";
  return (
    <article className={cx("dtc-turn", assistant ? "assistant" : "user", fresh && "is-fresh")}>
      <span className="dtc-avatar" aria-hidden="true">
        {assistant ? <SolBotIcon size={22} /> : <span className="dtc-avatar__glyph">YOU</span>}
      </span>
      <div className="dtc-turn__stack">
        {assistant && turn.thought ? <Cognition text={turn.thought} /> : null}
        <div className="dtc-bubble">
          {assistant ? <Markdown source={turn.content} /> : <p className="dtc-md dtc-md--plain">{turn.content}</p>}
        </div>
        <p className="dtc-meta">
          {fmtTime(turn.at)} {assistant ? (turn.model ?? "devthink").toUpperCase() : "YOU"}
        </p>
      </div>
    </article>
  );
}

/** ThinkingRow — the functional generation status: a 3px live bar + label,
 * one discreet opacity loop, no orb. */
export function ThinkingRow() {
  return (
    <div className="dtc-thinking" role="status" aria-live="polite">
      <i className="dtc-thinking__bar" aria-hidden="true" />
      <span>Thinking</span>
    </div>
  );
}

/** ErrorRow — the inline failure card with a win11 retry (AuraChat contract). */
export function ErrorRow({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="dtc-error" role="alert">
      <p>{message}</p>
      <button type="button" className="dtc-error__retry" onClick={onRetry}>
        <RefreshCw size={15} strokeWidth={1.8} aria-hidden="true" /> Retry
      </button>
    </div>
  );
}
