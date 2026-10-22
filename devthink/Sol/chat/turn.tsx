/**
 * turn.tsx — one conversation turn in the reference grammar (the zcode
 * timeline, the t3code rows): NO avatars — the user message is a
 * right-aligned bubble in the trajectory user wash (the xl radius with
 * the sm tail corner on its top-right, the hairline edge), the assistant
 * speaks flat on the floor (the zero-contrast canvas IS the assistant
 * surface — the synara law), the markdown renderer beside it
 * (markdown.tsx), the collapsible cognition drawer owning the reasoning
 * violet, and the meta line (time · model, the action keys) answering the
 * hover — opacity 0 until the row lifts, the way both references hold
 * their action rails. The user turn carries the edit affordance (the
 * cascading checkpoint law): the pencil rides the hover, the field is
 * the win11 8px well with the accent underline, and saving hands the
 * edit to the branch logic in chatstate. The w3-b grammar pass completes
 * the decided spec on this floor: the cognition head owns the elapsed
 * chip (the shimmering live state while the trace streams, the frozen
 * thought-for-Ns count once the answer begins), the streaming answer
 * carries the 2px block caret, the hover timestamp reads day aware, the
 * overlong user message collapses at the measured 176px line behind the
 * gradient mask, and the assistant rail gains the read aloud key (speech
 * synthesis, the glyph swapping to the stop square while speaking) with
 * the verdict pair (the local flag, the optional onVerdict seam). Also
 * exports the functional generation status row (a 3px live bar) and the
 * inline error row with a win11 retry — the same contract as the os
 * AuraChat.
 */
import {
  ArrowClockwiseRegular as ArrowClockwise,
  CheckmarkRegular as Checkmark,
  ChevronDownRegular as ChevronDown,
  CopyRegular as Copy,
  DeleteRegular as Delete,
  DismissRegular as Dismiss,
  EditRegular as Edit,
  LightbulbRegular as Lightbulb,
  RecordStopRegular as RecordStop,
  Speaker2Regular as Speaker,
  ThumbDislikeRegular as ThumbDown,
  ThumbDislikeFilled as ThumbDownOn,
  ThumbLikeRegular as ThumbUp,
  ThumbLikeFilled as ThumbUpOn,
} from "@fluentui/react-icons";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { chatText } from "../../chatlabels.ts";
import { type ChatTurn, cx, fmtTime } from "../../chatstate.ts";
import { copyText, Markdown } from "./markdown.tsx";

/** fmtFull — the hover timestamp of the meta line: the full locale
 * date-time (title attribute), honest on every turn. */
function fmtFull(at: number): string {
  try {
    return new Date(at).toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  } catch {
    return "";
  }
}

/** fmtDayTime — the day-aware timestamp of the meta line (the decided
 * law): the time alone today, the weekday and time within the current
 * week, the calendar date older (the year joining when it differs) —
 * the full locale stamp rides the title attribute and any formatting
 * failure falls back to the plain clock of the meta grammar. */
function fmtDayTime(at: number): string {
  const d = new Date(at);
  const now = new Date();
  try {
    const time = d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
    const startOf = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
    const diffDays = Math.round((startOf(now) - startOf(d)) / 86_400_000);
    if (diffDays === 0) return time;
    if (diffDays > 0 && diffDays < 7) {
      const weekday = d.toLocaleDateString(undefined, { weekday: "short" });
      return `${weekday} ${time}`;
    }
    const sameYear = d.getFullYear() === now.getFullYear();
    return d.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      ...(sameYear ? {} : { year: "numeric" }),
    });
  } catch {
    return fmtTime(at);
  }
}

/** secondsOf — the whole-second count of a duration: a sub-second trace
 * still reads 1s (the chip never lies with a zero), the rounding is the
 * honest nearest second. */
function secondsOf(ms: number): number {
  return Math.max(1, Math.round(ms / 1000));
}

/** rollingTail — the one-line rolling summary of the live trace (the
 * decided cognition law): the newest non-empty line of the reasoning,
 * capped for the single line it owns behind the edge masks. */
function rollingTail(text: string): string {
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  const last = lines.length > 0 ? lines[lines.length - 1] : "";
  return last.length > 160 ? `${last.slice(0, 157)}…` : last;
}

/* the live-stream grace of the row detector: a delta observed within
 * this window keeps the live states armed (the shimmer, the caret); a
 * silent stretch past it reads settled — the row never spins about a
 * dead round the way a lying loader would. */
const STREAM_GRACE_MS = 1600;
const STREAM_TICK_MS = 500;

/** useStreamPhase — the honest streaming detector of the timeline rows.
 * The floor hands the live turn no flag of its own, so the phase derives
 * from what the row can observe: a mount is never growth (history
 * records mount exactly the way a stream does), every observed delta
 * re-arms the live window, and the phase reads — thinking while only
 * the trace grows (a stopped partial never counts), answering while the
 * content grows, settled once the grace expires. The first content
 * delta after a trace freezes the answer stamp, which is the thinking
 * duration the chip settles on (the round's own `at` is the trace
 * start — the latency the visitor waited rides the count honestly). */
function useStreamPhase(turn: ChatTurn): {
  phase: "settled" | "thinking" | "answering";
  answerAt: number | null;
  now: number;
} {
  const content = turn.content;
  const thought = turn.thought ?? "";
  const [now, setNow] = useState(() => Date.now());
  const lens = useRef<{ c: number; t: number } | null>(null);
  const lastGrow = useRef(0);
  const answerAt = useRef<number | null>(null);

  // the growth watcher: every observed delta re-stamps the live clock
  // and re-derives the phase, and the first content delta after a
  // reasoning trace freezes the answer stamp (the count stops there).
  useEffect(() => {
    const prev = lens.current;
    const c = content.length;
    const t = thought.length;
    lens.current = { c, t };
    if (prev === null) return;
    if (c <= prev.c && t <= prev.t) return;
    lastGrow.current = Date.now();
    if (prev.c === 0 && c > 0) answerAt.current = Date.now();
    setNow(Date.now());
  }, [content, thought]);

  const live = lastGrow.current > 0 && now - lastGrow.current <= STREAM_GRACE_MS;
  let phase: "settled" | "thinking" | "answering" = "settled";
  if (live) {
    if (content.length === 0 && thought.length > 0 && !turn.stopped) phase = "thinking";
    else if (content.length > 0) phase = "answering";
  }

  // the half-second tick (the ThinkingRow cadence): while a live phase
  // holds, the clock keeps stamping — the live count advances and the
  // grace expires on its own, never by a guess.
  useEffect(() => {
    if (phase === "settled") return;
    const id = window.setInterval(() => setNow(Date.now()), STREAM_TICK_MS);
    return () => window.clearInterval(id);
  }, [phase]);

  return { phase, answerAt: answerAt.current, now };
}

/** Cognition — the reasoning drawer of the assistant turn: the trajectory
 * reasoning violet owns the expander (the head glyph, the label, the
 * rotating chevron) and the body reads the trace on the violet-tinted
 * quiet, capped at the max-h-96 scroller that follows the live stream
 * unless the reader scrolled away from the edge. Collapsed by default —
 * the reference law: the reasoning never shouts over the answer. The
 * w3-b head grammar: while the trace streams the label shimmers
 * (cognition-live, the violet gradient sweep) beside the ticking count
 * and the one-line rolling summary with the edge masks; once the answer
 * begins the label freezes to the honest thought-for-Ns chip (tabular),
 * the plain reasoning label standing in whenever no duration is known;
 * and the completion folds the drawer back unless the visitor toggled
 * it themselves — the interaction always wins. */
function Cognition({
  text,
  live,
  thinkingMs,
  liveMs,
}: {
  text: string;
  live: boolean;
  thinkingMs: number | null;
  liveMs: number;
}) {
  const [open, setOpen] = useState(false);
  const touched = useRef(false);
  const bodyRef = useRef<HTMLParagraphElement | null>(null);

  // the auto collapse on completion, respecting the interaction: the
  // stream settling folds the drawer only when the visitor never touched
  // it — a manual toggle always wins over the automation.
  useEffect(() => {
    if (live) return;
    if (!touched.current) setOpen(false);
  }, [live]);

  // the expanded live trace follows the stream: the body rides the
  // bottom unless the reader scrolled away from the edge (the trace
  // length keys the ride — every delta re-anchors the scroller).
  const traceLen = text.length;
  useEffect(() => {
    if (!live || !open || traceLen === 0) return;
    const el = bodyRef.current;
    if (!el) return;
    const away = el.scrollHeight - el.scrollTop - el.clientHeight > 48;
    if (!away) el.scrollTop = el.scrollHeight;
  }, [live, open, traceLen]);

  const label = live ? "Thinking" : thinkingMs !== null ? `Thought for ${secondsOf(thinkingMs)}s` : "Reasoning";

  return (
    <div className="dtc-cog" data-open={open ? "true" : "false"} data-live={live ? "true" : "false"}>
      <button
        type="button"
        className="dtc-cog__head"
        aria-expanded={open}
        onClick={() => {
          touched.current = true;
          setOpen((v) => !v);
        }}
      >
        <Lightbulb fontSize={13} aria-hidden="true" />
        <span className={cx("dtc-cog__label", live && "cognition-live")}>{label}</span>
        {/* the ticking count and the rolling tail sit out of the accessible
         * name: both churn every half second while the trace streams, and
         * the duration already reads through the thinking row the floor
         * mounts — the name stays the quiet frozen label. */}
        {live ? (
          <i className="dtc-cog__elapsed" aria-hidden="true">
            · {secondsOf(liveMs)}s
          </i>
        ) : null}
        {live && !open ? (
          <span className="dtc-cog__roll" aria-hidden="true">
            {rollingTail(text)}
          </span>
        ) : null}
        <ChevronDown fontSize={13} aria-hidden="true" className="dtc-cog__chev" />
      </button>
      {open ? (
        <p className="dtc-cog__body" ref={bodyRef}>
          {text}
        </p>
      ) : null}
    </div>
  );
}

/** the measured collapse line of the long user message (the max-h-44 law
 * of the decided spec): a bubble taller than this clamps behind the
 * gradient mask until the ghost key opens the full read. */
const USER_COLLAPSE_PX = 176;

/**
 * Turn — one timeline row in the reference grammar. `fresh` marks the
 * turn that just arrived (the chat page sets it on the last turn only);
 * the theme layer rises it 240ms and never replays the history — the
 * class is inert under reduced motion. `onEdit` arms the user turn with
 * the checkpoint affordance: the pencil appears on hover/focus, the field
 * swaps the bubble while editing, and the save hands the new text to the
 * caller (the branch round answers from the edit). `onRegenerate` arms
 * the last assistant turn with the competitor grammar: the round arrow
 * re-answers the same user turn (the old answer leaves the floor), and a
 * stopped partial carries its honest · stopped mark in the meta line.
 * `onDelete` arms every turn with the row delete: the message leaves the
 * conversation (the caller commits the session without it). The copy key
 * rides every turn — the icon morphs to the checkmark on success (the
 * clipboard answer is the feedback, no toast noise), and the meta time
 * reads day aware with the full locale date-time on its title.
 *
 * The w3-b additions, all optional seams so no caller changes: the
 * assistant rail gains the read aloud key (speech synthesis of the plain
 * turn text, the second press stopping the utterance, the glyph swapping
 * to the stop square while it runs — the key never renders where the
 * synthesis is missing) and the verdict pair (the local up/down flag
 * with the filled glyph answering the landed state, `onVerdict` the
 * optional seam for a caller that persists it). `thinkingMs` is the
 * optional duration seam of the cognition chip: a caller that knows a
 * round's reasoning time hands it here; without it the live rounds
 * derive their count from the observed stamps and the unwired records
 * read the plain reasoning label — honest, never a guessed number.
 */
export function Turn({
  turn,
  fresh = false,
  busy = false,
  onEdit,
  onRegenerate,
  onDelete,
  onVerdict,
  thinkingMs,
}: {
  turn: ChatTurn;
  fresh?: boolean;
  busy?: boolean;
  onEdit?: (text: string) => void;
  onRegenerate?: () => void;
  onDelete?: () => void;
  onVerdict?: (verdict: "up" | "down" | null) => void;
  thinkingMs?: number;
}) {
  const assistant = turn.role === "assistant";
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(turn.content);
  const editfieldRef = useRef<HTMLTextAreaElement | null>(null);
  /* the copy lane (rung 120): the icon morphs to the checkmark for 1.4s
   * on success — the clipboard answer is the feedback itself, so no toast
   * ever doubles the surface. A failure keeps the copy glyph (the retry
   * stays available) and the sr-only status line says what happened. */
  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">("idle");
  const copyTimer = useRef<number | null>(null);
  useEffect(
    () => () => {
      if (copyTimer.current !== null) window.clearTimeout(copyTimer.current);
    },
    [],
  );

  /* the stream phase of the row (w3-b): the detector above owns the
   * honesty — thinking arms the shimmering chip, answering arms the
   * caret, and the first answer stamp freezes the thinking count. The
   * frozen observation outranks the prop seam, the prop seam outranks
   * the plain label. */
  const { phase, answerAt, now } = useStreamPhase(turn);
  const thinkingLive = assistant && phase === "thinking";
  const answering = assistant && phase === "answering";
  const frozenMs = answerAt !== null ? answerAt - turn.at : null;
  const chipMs = frozenMs ?? (typeof thinkingMs === "number" && thinkingMs >= 0 ? thinkingMs : null);

  /* the long-message lane (w3-b): the bubble measures once on the floor —
   * a natural height past the 176px line arms the clamp and the ghost key
   * toggles the full read; the touch surface never clamps (the css law),
   * and the hidden text stays in the dom for the readers that need it. */
  const [overlong, setOverlong] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const bubbleRef = useRef<HTMLDivElement | null>(null);
  useLayoutEffect(() => {
    if (assistant || turn.content.length === 0) return;
    const el = bubbleRef.current;
    if (!el) return;
    setOverlong(el.scrollHeight > USER_COLLAPSE_PX + 1);
  }, [assistant, turn.content]);

  /* the read aloud lane (w3-b): the speaker key speaks the plain text of
   * the turn through the platform synthesis — the second press (or the
   * utterance ending) releases the key back to the speaker glyph, the
   * stop glyph answering while it runs (the signal-key pattern of the
   * copy morph). The key never renders where the synthesis is missing,
   * and a row leaving the floor cancels its own utterance. */
  const speakable = assistant && typeof window !== "undefined" && "speechSynthesis" in window;
  const [speaking, setSpeaking] = useState(false);
  const speakingRef = useRef(false);
  useEffect(
    () => () => {
      if (speakingRef.current) window.speechSynthesis.cancel();
    },
    [],
  );

  const onSpeak = () => {
    const synth = window.speechSynthesis;
    if (!synth || !speakable) return;
    if (speaking) {
      synth.cancel();
      setSpeaking(false);
      speakingRef.current = false;
      return;
    }
    const utter = new SpeechSynthesisUtterance(turn.content);
    utter.onend = () => {
      setSpeaking(false);
      speakingRef.current = false;
    };
    utter.onerror = () => {
      setSpeaking(false);
      speakingRef.current = false;
    };
    synth.cancel();
    synth.speak(utter);
    setSpeaking(true);
    speakingRef.current = true;
  };

  /* the verdict lane (w3-b): the thumbs pair lands a local flag on the
   * render state — pressing the landed key clears it, the sibling
   * replaces it — and the optional onVerdict seam carries the change to
   * any caller that persists verdicts; the flag never blocks the other
   * keys, the rail stays one quiet economy. */
  const [verdict, setVerdict] = useState<"up" | "down" | null>(null);
  const onVerdictKey = (side: "up" | "down") => {
    const landed = verdict === side ? null : side;
    setVerdict(landed);
    onVerdict?.(landed);
  };

  const onCopy = () => {
    void copyText(turn.content).then((result) => {
      setCopyState(result);
      if (copyTimer.current !== null) window.clearTimeout(copyTimer.current);
      copyTimer.current = window.setTimeout(() => setCopyState("idle"), result === "copied" ? 1400 : 2400);
    });
  };

  const editable = !assistant && !busy && typeof onEdit === "function";
  const regenerable = assistant && !busy && typeof onRegenerate === "function";
  const deletable = !busy && typeof onDelete === "function";

  // the edit field takes focus as the form reveals (the ref effect answers
  // the focus the a11y law refuses the autofocus attribute)
  useEffect(() => {
    if (editable && editing) editfieldRef.current?.focus();
  }, [editable, editing]);

  if (editable && editing) {
    return (
      <article className={cx("dtc-turn", "user", "is-editing")} aria-label="Editing message">
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
    <article className={cx("dtc-turn", assistant ? "assistant" : "user", fresh && "is-fresh")}>
      {/* the sr-only heading carries the thread's h-level structure: the
       * topbar owns the one h1, every turn answers an h2 — the structure
       * rides under the visual grammar without touching it. */}
      <h2 className="sr-only">{assistant ? "Assistant reply" : "Your message"}</h2>
      <div className="dtc-turn__stack">
        {assistant && turn.thought ? (
          <Cognition text={turn.thought} live={thinkingLive} thinkingMs={chipMs} liveMs={now - turn.at} />
        ) : null}
        <div
          ref={bubbleRef}
          className={cx(
            "dtc-bubble",
            assistant ? "dtc-bubble--assistant" : "dtc-bubble--user",
            answering && "is-streaming",
            !assistant && overlong && !expanded && "is-clamped",
          )}
        >
          {assistant ? <Markdown source={turn.content} /> : <p className="dtc-md dtc-md--plain">{turn.content}</p>}
          {answering ? <i className="stream-caret" aria-hidden="true" /> : null}
        </div>
        {!assistant && overlong ? (
          <button
            type="button"
            className="dtc-expand"
            aria-expanded={expanded}
            aria-label={expanded ? "Show less of the message" : "Show full message"}
            onClick={() => setExpanded((v) => !v)}
          >
            {expanded ? "show less" : "show full message"}
          </button>
        ) : null}
        <p className={cx("dtc-meta", !assistant && "dtc-meta--user")}>
          <span className="dtc-meta__time" title={fmtFull(turn.at)}>
            {fmtDayTime(turn.at)}
          </span>{" "}
          {assistant ? (turn.model ?? "devthink").toUpperCase() : "YOU"}
          {turn.stopped ? <i className="dtc-meta__mark">· stopped</i> : null}
          {turn.edited ? <i className="dtc-meta__mark">· edited</i> : null}
          <span className="sr-only" role="status" aria-live="polite">
            {copyState === "copied"
              ? chatText("turn.copied")
              : copyState === "failed"
                ? chatText("turn.copyFailed")
                : ""}
          </span>
          <span className="dtc-turn__acts">
            <button
              type="button"
              className={cx(
                "dtc-turn__act",
                copyState === "copied" && "is-copied",
                copyState === "failed" && "is-failed",
              )}
              aria-label={
                copyState === "copied" ? "Copied" : copyState === "failed" ? "Copy failed — retry" : "Copy message"
              }
              title={copyState === "failed" ? "Copy failed — retry" : "Copy message"}
              onClick={onCopy}
            >
              {copyState === "copied" ? (
                <Checkmark fontSize={13} aria-hidden="true" />
              ) : (
                <Copy fontSize={13} aria-hidden="true" />
              )}
            </button>
            {speakable ? (
              <button
                type="button"
                className={cx("dtc-turn__act", speaking && "is-speaking")}
                aria-label={speaking ? "Stop reading aloud" : "Read message aloud"}
                title={speaking ? "Stop reading aloud" : "Read message aloud"}
                onClick={onSpeak}
              >
                {speaking ? (
                  <RecordStop fontSize={13} aria-hidden="true" />
                ) : (
                  <Speaker fontSize={13} aria-hidden="true" />
                )}
              </button>
            ) : null}
            {assistant ? (
              <button
                type="button"
                className="dtc-turn__act dtc-turn__act--verdict"
                aria-pressed={verdict === "up"}
                aria-label="Good response"
                title="Good response"
                onClick={() => onVerdictKey("up")}
              >
                {verdict === "up" ? (
                  <ThumbUpOn fontSize={13} aria-hidden="true" />
                ) : (
                  <ThumbUp fontSize={13} aria-hidden="true" />
                )}
              </button>
            ) : null}
            {assistant ? (
              <button
                type="button"
                className="dtc-turn__act dtc-turn__act--verdict"
                aria-pressed={verdict === "down"}
                aria-label="Bad response"
                title="Bad response"
                onClick={() => onVerdictKey("down")}
              >
                {verdict === "down" ? (
                  <ThumbDownOn fontSize={13} aria-hidden="true" />
                ) : (
                  <ThumbDown fontSize={13} aria-hidden="true" />
                )}
              </button>
            ) : null}
            {deletable ? (
              <button
                type="button"
                className="dtc-turn__act dtc-turn__act--del"
                aria-label="Delete message"
                title="Delete message"
                onClick={() => onDelete?.()}
              >
                <Delete fontSize={13} aria-hidden="true" />
              </button>
            ) : null}
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
          </span>
        </p>
      </div>
    </article>
  );
}

/** dayKey — the calendar day of a turn (local time), the grouping key of
 * the date separators. */
export function dayKey(at: number): string {
  const d = new Date(at);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

/** dayLabel — the separator label of a day: Today, Yesterday, or the
 * locale weekday with month and day (the year joins when it is not the
 * current one — honest dating, never a hardcode). */
export function dayLabel(at: number): string {
  const d = new Date(at);
  const now = new Date();
  const startOf = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const diffDays = Math.round((startOf(now) - startOf(d)) / 86_400_000);
  if (diffDays === 0) return chatText("day.today");
  if (diffDays === 1) return chatText("day.yesterday");
  const sameYear = d.getFullYear() === now.getFullYear();
  try {
    return d.toLocaleDateString(undefined, {
      weekday: "long",
      month: "short",
      day: "numeric",
      ...(sameYear ? {} : { year: "numeric" }),
    });
  } catch {
    return d.toDateString();
  }
}

/** DaySeparator — the timeline divider between turns of different days:
 * the reference divider grammar (the t3code rules) — twin hairline rules
 * carrying the tiny centered label between them, never a heavy band.
 * Exported for the thread floor and any future surface. */
export function DaySeparator({ at }: { at: number }) {
  return (
    <div className="dtc-daysep" role="separator" aria-label={dayLabel(at)}>
      <span className="dtc-daysep__label">{dayLabel(at)}</span>
    </div>
  );
}

/** ThinkingRow — the functional generation status: a 3px live bar + label,
 * one discreet opacity loop, no orb. The elapsed clock rides the whole
 * streaming phase (rung 121): the label reads Thinking before the first
 * token and Responding while the deltas land, with the honest · Ns count
 * ticking every half second from the round start. */
export function ThinkingRow({ streaming = false, elapsedMs = 0 }: { streaming?: boolean; elapsedMs?: number }) {
  const seconds = Math.floor(elapsedMs / 1000);
  return (
    <div className="dtc-thinking" role="status" aria-live="polite">
      <i className="dtc-thinking__bar" aria-hidden="true" />
      <span>{streaming ? chatText("turn.responding") : chatText("turn.thinking")}</span>
      {/* the ticking count stays out of the announcement: the live region
       * speaks the phase change once, never every half-second tick. */}
      {seconds > 0 ? (
        <i className="dtc-thinking__elapsed" aria-hidden="true">
          · {seconds}s
        </i>
      ) : null}
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
