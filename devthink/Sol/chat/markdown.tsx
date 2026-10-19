/**
 * markdown.tsx — the in-house renderer of the chat: paragraphs, bold,
 * italic, inline code and fenced code blocks with a language header and a
 * clipboard copy. Loose component of the chat page; turn.tsx composes it.
 */
import { type ReactNode, useEffect, useMemo, useRef, useState } from "react";

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
  if (last < source.length) {
    const tail = source.slice(last);
    // a fence left open mid-stream renders as a code block in progress, so
    // tokens land in the code pane instead of flashing raw backticks
    const open = tail.indexOf("```");
    if (open !== -1) {
      if (open > 0) blocks.push({ kind: "text", text: tail.slice(0, open) });
      const rest = tail.slice(open + 3);
      const lineEnd = rest.indexOf("\n");
      const lang = lineEnd === -1 ? rest : rest.slice(0, lineEnd);
      const code = lineEnd === -1 ? "" : rest.slice(lineEnd + 1).replace(/\n$/, "");
      blocks.push({ kind: "code", lang: lang.trim(), code });
    } else {
      blocks.push({ kind: "text", text: tail });
    }
  }
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
export async function copyText(text: string): Promise<"copied" | "failed"> {
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
        <button type="button" className="dtc-code__copy" onClick={onCopy} aria-label="Copy code">
          {state === "copied" ? "copied" : state === "failed" ? "failed" : "copy"}
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
