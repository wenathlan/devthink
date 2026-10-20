/**
 * turn.tsx — one conversation turn in the Windows grammar: the user message
 * sits in an 8px cell on the right, the assistant speaks flat on the floor,
 * 36px 8px-corner avatars, the markdown renderer beside it (markdown.tsx),
 * the collapsible cognition drawer styled as a win11 expander for
 * reasoning_content, and the meta line with time and model. The user turn
 * carries the edit affordance (the cascading checkpoint law): the pencil
 * rides the hover, the field is the win11 8px well with the accent underline,
 * and saving hands the edit to the branch logic in chatstate. Also exports
 * the functional generation status row (a 3px live bar) and the inline
 * error row with a win11 retry — the same contract as the os AuraChat.
 */
import {
  ArrowClockwiseRegular as ArrowClockwise,
  CheckmarkRegular as Checkmark,
  ChevronDownRegular as ChevronDown,
  DismissRegular as Dismiss,
  EditRegular as Edit,
  LightbulbRegular as Lightbulb,
} from "@fluentui/react-icons";
import { useEffect, useRef, useState } from "react";
import { type ChatTurn, cx, fmtTime } from "../../chatstate.ts";
import { Markdown } from "./markdown.tsx";
import { SolBotIcon } from "./solboticon.tsx";

/** Cognition — the reasoning drawer of the assistant turn. */
function Cognition({ text }: { text: string }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="dtc-cog" data-open={open ? "true" : "false"}>
      <button type="button" className="dtc-cog__head" aria-expanded={open} onClick={() => setOpen((v) => !v)}>
        <Lightbulb fontSize={13} aria-hidden="true" />
        <span>Cognition</span>
        <ChevronDown fontSize={13} aria-hidden="true" className="dtc-cog__chev" />
      </button>
      {open ? <p className="dtc-cog__body">{text}</p> : null}
    </div>
  );
}

/**
 * Turn — one message row: avatar, cognition drawer (assistant), bubble, meta
 * line. `fresh` marks the turn that just arrived (the chat page sets it on
 * the last turn only); the theme layer rises it 240ms and never replays the
 * history — the class is inert under reduced motion. `onEdit` arms the user
 * turn with the checkpoint affordance: the pencil appears on hover/focus,
 * the field swaps the bubble while editing, and the save hands the new text
 * to the caller (the branch round answers from the edit). `onRegenerate`
 * arms the last assistant turn with the competitor grammar: the round
 * arrow re-answers the same user turn (the old answer leaves the floor),
 * and a stopped partial carries its honest · stopped mark in the meta line.
 */
export function Turn({
  turn,
  fresh = false,
  busy = false,
  onEdit,
  onRegenerate,
}: {
  turn: ChatTurn;
  fresh?: boolean;
  busy?: boolean;
  onEdit?: (text: string) => void;
  onRegenerate?: () => void;
}) {
  const assistant = turn.role === "assistant";
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(turn.content);
  const editfieldRef = useRef<HTMLTextAreaElement | null>(null);

  const editable = !assistant && !busy && typeof onEdit === "function";
  const regenerable = assistant && !busy && typeof onRegenerate === "function";

  // the edit field takes focus as the form reveals (the ref effect answers
  // the focus the a11y law refuses the autofocus attribute)
  useEffect(() => {
    if (editable && editing) editfieldRef.current?.focus();
  }, [editable, editing]);

  if (editable && editing) {
    return (
      <article className={cx("dtc-turn", "user", "is-editing")} aria-label="Editing message">
        <span className="dtc-avatar" aria-hidden="true">
          <span className="dtc-avatar__glyph">YOU</span>
        </span>
        <form
          className="dtc-turn__stack dtc-editform"
          onSubmit={(e) => {
            e.preventDefault();
            const clean = draft.trim();
            if (!clean || clean === turn.content) {
              setEditing(false);
              return;
            }
            setEditing(false);
            onEdit?.(clean);
          }}
        >
          <textarea
            className="dtc-editfield"
            ref={editfieldRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={Math.min(8, Math.max(2, draft.split("\n").length + 1))}
            aria-label="Edit message"
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                e.preventDefault();
                setDraft(turn.content);
                setEditing(false);
              }
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                e.currentTarget.form?.requestSubmit();
              }
            }}
          />
          <div className="dtc-editrow">
            <button type="submit" className="dtc-editbtn is-primary" aria-label="Save edit and branch">
              <Checkmark fontSize={14} aria-hidden="true" /> Save
            </button>
            <button
              type="button"
              className="dtc-editbtn"
              aria-label="Cancel edit"
              onClick={() => {
                setDraft(turn.content);
                setEditing(false);
              }}
            >
              <Dismiss fontSize={14} aria-hidden="true" /> Cancel
            </button>
            <span className="dtc-editnote">Saving opens the checkpoint branch</span>
          </div>
        </form>
      </article>
    );
  }

  return (
    <article
      className={cx("dtc-turn", assistant ? "assistant" : "user", fresh && "is-fresh")}
      onMouseLeave={() => undefined}
    >
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
          {turn.stopped ? <i className="dtc-meta__stop">· stopped</i> : null}
          {regenerable ? (
            <button
              type="button"
              className="dtc-turn__act"
              aria-label="Regenerate response"
              title="Regenerate response"
              onClick={() => onRegenerate?.()}
            >
              <ArrowClockwise fontSize={13} aria-hidden="true" />
            </button>
          ) : null}
          {editable ? (
            <button
              type="button"
              className="dtc-turn__act"
              aria-label="Edit message"
              title="Edit message"
              onClick={() => {
                setDraft(turn.content);
                setEditing(true);
              }}
            >
              <Edit fontSize={13} aria-hidden="true" />
            </button>
          ) : null}
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
        <ArrowClockwise fontSize={15} aria-hidden="true" /> Retry
      </button>
    </div>
  );
}
