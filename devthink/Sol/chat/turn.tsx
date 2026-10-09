/**
 * turn.tsx — one conversation turn in the Windows grammar: the user message
 * sits in an 8px cell on the right, the assistant speaks flat on the floor,
 * 36px 8px-corner avatars, a minimal in-house markdown renderer (bold,
 * italic, inline code, fenced code blocks with a language header and a
 * clipboard copy button), the collapsible "Internal cognition" drawer styled
 * as a win11 expander for reasoning_content, and the meta line with time and
 * model. Also exports the functional generation status row ("Sol is
 * thinking" behind a 3px live bar) and the inline error row with a win11
 * retry button — the same contract as the os AuraChat.
 */

import { BrainCircuit, ChevronDown, RefreshCw } from "lucide-react";
import { type ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { SolBotIcon } from "./solboticon";
import { type ChatTurn, cx, fmtTime } from "./state";

/* ----------------------------- markdown ------------------------------- */

type Token = { kind: "text" | "bold" | "italic" | "code"; text: string };
type Block = { kind: "text"; text: string } | { kind: "code"; lang: string; code: string };

const FENCE = /```([^\n`]*)\n?([\s\S]*?)```/g;
// bold first, then single asterisks; underscore italics need word boundaries
const INLINE = /(`[^`\n]+`)|(\*\*[^*\n]+\*\*)|(\*[^*\n]+\*)|(?<![\w])(_[^_\n]+_)(?![\w])/g;

function parseBlocks(source: string): Block[] {
  const blocks: Block[] = [];
  let last = 0;
  for (const m of source.matchAll(FENCE)) {
    const start = m.index ?? 0;
    if (start > last) blocks.push({ kind: "text", text: source.slice(last, start) });
    blocks.push({ kind: "code", lang: (m[1] ?? "").trim(), code: (m[2] ?? "").replace(/\n$/, "") });
    last = start + m[0].length;
  }
  if (last < source.length) blocks.push({ kind: "text", text: source.slice(last) });
  return blocks;
}

function parseInline(text: string): Token[] {
  const tokens: Token[] = [];
  let last = 0;
  for (const m of text.matchAll(INLINE)) {
    const start = m.index ?? 0;
    if (start > last) tokens.push({ kind: "text", text: text.slice(last, start) });
    const raw = m[0];
    if (raw.startsWith("`")) tokens.push({ kind: "code", text: raw.slice(1, -1) });
    else if (raw.startsWith("**") || raw.startsWith("__")) tokens.push({ kind: "bold", text: raw.slice(2, -2) });
    else tokens.push({ kind: "italic", text: raw.slice(1, -1) });
    last = start + raw.length;
  }
  if (last < text.length) tokens.push({ kind: "text", text: text.slice(last) });
  return tokens;
}

function renderInline(text: string): ReactNode[] {
  return parseInline(text).map((t, i) => {
    // biome-ignore lint/suspicious/noArrayIndexKey: the tokens are a static parse of one source string — they never reorder, only remount together
    if (t.kind === "bold") return <strong key={i}>{t.text}</strong>;
    // biome-ignore lint/suspicious/noArrayIndexKey: static parse, same rationale
    if (t.kind === "italic") return <em key={i}>{t.text}</em>;
    // biome-ignore lint/suspicious/noArrayIndexKey: static parse, same rationale
    if (t.kind === "code") return <code key={i}>{t.text}</code>;
    // biome-ignore lint/suspicious/noArrayIndexKey: static parse, same rationale
    return <span key={i}>{t.text}</span>;
  });
}

/** copyText — clipboard API with a legacy fallback; failures surface, never fake success. */
async function copyText(text: string): Promise<"copied" | "failed"> {
  try {
    await navigator.clipboard.writeText(text);
    return "copied";
  } catch {
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(ta);
      return ok ? "copied" : "failed";
    } catch {
      return "failed";
    }
  }
}

function CodeBlock({ lang, code }: { lang: string; code: string }) {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");
  const timer = useRef<number | null>(null);
  useEffect(
    () => () => {
      if (timer.current !== null) window.clearTimeout(timer.current);
    },
    [],
  );

  const onCopy = () => {
    void copyText(code).then((result) => {
      setState(result);
      if (timer.current !== null) window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setState("idle"), 2000);
    });
  };

  return (
    <figure className="dtc-code">
      <figcaption className="dtc-code__head">
        <span>{lang || "code"}</span>
        <button type="button" className="dtc-code__copy" onClick={onCopy} aria-label="Copy code to clipboard">
          {state === "copied" ? "copied" : state === "failed" ? "copy failed" : "copy"}
        </button>
      </figcaption>
      <pre>
        <code>{code}</code>
      </pre>
    </figure>
  );
}

/** Markdown — the minimal renderer: paragraphs, inline styles, fenced code. */
export function Markdown({ source }: { source: string }) {
  const blocks = useMemo(() => parseBlocks(source), [source]);
  return (
    <div className="dtc-md">
      {blocks.map((b, i) =>
        b.kind === "code" ? (
          // biome-ignore lint/suspicious/noArrayIndexKey: the blocks are a static parse of one source string — they never reorder, only remount together
          <CodeBlock key={`${i}-code`} lang={b.lang} code={b.code} />
        ) : (
          // biome-ignore lint/suspicious/noArrayIndexKey: static parse, same rationale
          <p key={`${i}-text`}>{renderInline(b.text)}</p>
        ),
      )}
    </div>
  );
}

/* ----------------------------- cognition ------------------------------ */

function Cognition({ text }: { text: string }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="dtc-cog" data-open={open ? "true" : "false"}>
      <button type="button" className="dtc-cog__head" aria-expanded={open} onClick={() => setOpen((v) => !v)}>
        <BrainCircuit size={13} strokeWidth={1.8} aria-hidden="true" />
        <span>Internal cognition</span>
        <ChevronDown size={13} strokeWidth={1.8} aria-hidden="true" className="dtc-cog__chev" />
      </button>
      {open ? <p className="dtc-cog__body">{text}</p> : null}
    </div>
  );
}

/* -------------------------------- turn -------------------------------- */

/** Turn — one message row: avatar, cognition drawer (assistant), bubble, meta line. */
export function Turn({ turn }: { turn: ChatTurn }) {
  const assistant = turn.role === "assistant";
  return (
    <article className={cx("dtc-turn", assistant ? "assistant" : "user")}>
      <span className="dtc-avatar" aria-hidden="true">
        {assistant ? <SolBotIcon size={22} /> : <span className="dtc-avatar__glyph">YOU</span>}
      </span>
      <div className="dtc-turn__stack">
        {assistant && turn.thought ? <Cognition text={turn.thought} /> : null}
        <div className="dtc-bubble">
          {assistant ? <Markdown source={turn.content} /> : <p className="dtc-md dtc-md--plain">{turn.content}</p>}
        </div>
        <p className="dtc-meta">
          {fmtTime(turn.at)} · {assistant ? (turn.model ?? "devthink").toUpperCase() : "YOU"}
        </p>
      </div>
    </article>
  );
}

/* ---------------------------- status rows ----------------------------- */

/** ThinkingRow — the functional generation status: a 3px live bar + label,
 * one discreet opacity loop, no orb. */
export function ThinkingRow() {
  return (
    <div className="dtc-thinking" role="status" aria-live="polite">
      <i className="dtc-thinking__bar" aria-hidden="true" />
      <span>Sol is thinking</span>
    </div>
  );
}

/** ErrorRow — the inline failure card with a win11 retry (AuraChat contract). */
export function ErrorRow({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="dtc-error" role="alert">
      <p>error · {message}</p>
      <button type="button" className="dtc-error__retry" onClick={onRetry}>
        <RefreshCw size={15} strokeWidth={1.8} aria-hidden="true" /> Retry
      </button>
    </div>
  );
}
