/**
 * markdown.tsx — the in-house renderer of the chat: the block grammar
 * (paragraphs, headings, ordered and nested unordered lists, blockquotes,
 * horizontal rules, fenced code blocks with a language header and a
 * clipboard copy) over the inline grammar (bold, italic, inline code).
 * Loose component of the chat page; turn.tsx composes it. The parser is
 * line-based and streaming-honest: a fence left open mid-stream renders as
 * a code block in progress, and no block ever flashes raw markers on the
 * floor (rung 122 — the block grammar wave).
 */
import { type ReactNode, useEffect, useMemo, useRef, useState } from "react";

type Token = { kind: "text" | "bold" | "italic" | "code"; text: string };

type Block =
  | { kind: "text"; text: string }
  | { kind: "code"; lang: string; code: string }
  | { kind: "heading"; level: number; text: string }
  | { kind: "hr" }
  | { kind: "quote"; text: string }
  | { kind: "list"; ordered: boolean; items: Array<{ depth: number; text: string }> };

const FENCE = /```([^\n`]*)\n?([\s\S]*?)```/g;
// bold first, then single asterisks; underscore italics need word boundaries
const INLINE = /(`[^`\n]+`)|(\*\*[^*\n]+\*\*)|(\*[^*\n]+\*)|(?<![\w])(_[^_\n]+_)(?![\w])/g;

const HEADING = /^(#{1,6})\s+(.+?)\s*#*\s*$/;
const HR = /^\s{0,3}(?:(?:-\s*){3,}|(?:\*\s*){3,}|(?:_\s*){3,})$/;
const QUOTE = /^\s{0,3}>\s?(.*)$/;
const LIST = /^(\s*)([-*+]|\d{1,9}[.)])\s+(.*)$/;
const BLANK = /^\s*$/;

/** parseBlocks — the fence split first (the streaming-honest open-fence
 * lane stays), then the line grammar over every non-code segment:
 * headings, rules, quotes and lists group their consecutive lines, and
 * the remaining lines join into paragraphs on blank-line boundaries (the
 * old renderer glued multi-paragraph answers into one p). */
function parseBlocks(source: string): Block[] {
  const blocks: Block[] = [];
  let last = 0;
  for (const m of source.matchAll(FENCE)) {
    const start = m.index ?? 0;
    if (start > last) blocks.push(...parseProse(source.slice(last, start)));
    blocks.push({ kind: "code", lang: (m[1] ?? "").trim(), code: (m[2] ?? "").replace(/\n$/, "") });
    last = start + m[0].length;
  }
  if (last < source.length) {
    const tail = source.slice(last);
    // a fence left open mid-stream renders as a code block in progress, so
    // tokens land in the code pane instead of flashing raw backticks
    const open = tail.indexOf("```");
    if (open !== -1) {
      if (open > 0) blocks.push(...parseProse(tail.slice(0, open)));
      const rest = tail.slice(open + 3);
      const lineEnd = rest.indexOf("\n");
      const lang = lineEnd === -1 ? rest : rest.slice(0, lineEnd);
      const code = lineEnd === -1 ? "" : rest.slice(lineEnd + 1).replace(/\n$/, "");
      blocks.push({ kind: "code", lang: lang.trim(), code });
    } else {
      blocks.push(...parseProse(tail));
    }
  }
  return blocks;
}

/** parseProse — the line grammar of one fence-free segment: the scanner
 * walks the lines, groups the quote and list runs, splits paragraphs on
 * blank lines, and lets headings and rules stand alone. */
function parseProse(segment: string): Block[] {
  const blocks: Block[] = [];
  const lines = segment.split("\n");
  let para: string[] = [];
  let quote: string[] = [];
  let list: { ordered: boolean; items: Array<{ depth: number; text: string }> } | null = null;

  const flushPara = () => {
    if (para.length) {
      blocks.push({ kind: "text", text: para.join("\n").trim() });
      para = [];
    }
  };
  const flushQuote = () => {
    if (quote.length) {
      blocks.push({ kind: "quote", text: quote.join("\n").trim() });
      quote = [];
    }
  };
  const flushList = () => {
    if (list) {
      blocks.push({ kind: "list", ordered: list.ordered, items: list.items });
      list = null;
    }
  };
  const flushAll = () => {
    flushPara();
    flushQuote();
    flushList();
  };

  for (const raw of lines) {
    const line = raw.replace(/\s+$/, "");
    if (BLANK.test(line)) {
      flushAll();
      continue;
    }
    const heading = line.match(HEADING);
    if (heading) {
      flushAll();
      blocks.push({ kind: "heading", level: heading[1].length, text: heading[2] });
      continue;
    }
    if (HR.test(line)) {
      flushAll();
      blocks.push({ kind: "hr" });
      continue;
    }
    const quoted = line.match(QUOTE);
    if (quoted) {
      flushPara();
      flushList();
      quote.push(quoted[1]);
      continue;
    }
    const item = line.match(LIST);
    if (item) {
      flushPara();
      flushQuote();
      const ordered = /\d/.test(item[2][0]);
      const depth = Math.min(3, Math.floor(item[1].replace(/\t/g, "  ").length / 2));
      if (list && list.ordered !== ordered) {
        // a marker-type change starts a new list (a dash run never swallows
        // a numbered run)
        flushList();
      }
      if (!list) {
        list = { ordered, items: [] };
      }
      list.items.push({ depth, text: item[3] });
      continue;
    }
    flushQuote();
    flushList();
    para.push(line);
  }
  flushAll();
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

/** the heading ladder of the chat floor: the markdown levels cap at the
 * document grammar the page owns (the page h1 lives in the topbar, so
 * markdown # renders as the h3 of the thread — never a second h1). */
function headingTag(level: number): "h3" | "h4" | "h5" | "h6" {
  if (level <= 1) return "h3";
  if (level === 2) return "h4";
  if (level === 3) return "h5";
  return "h6";
}

/** Markdown — the block renderer: paragraphs, the heading ladder, rules,
 * quotes, ordered and nested unordered lists, fenced code with copy. */
export function Markdown({ source }: { source: string }) {
  const blocks = useMemo(() => parseBlocks(source), [source]);
  return (
    <div className="dtc-md">
      {blocks.map((b, i) => {
        if (b.kind === "code") {
          // biome-ignore lint/suspicious/noArrayIndexKey: the blocks are a static parse of one source string — they never reorder, only remount together
          return <CodeBlock key={`${i}-code`} lang={b.lang} code={b.code} />;
        }
        if (b.kind === "heading") {
          const Tag = headingTag(b.level);
          return (
            // biome-ignore lint/suspicious/noArrayIndexKey: the blocks are a static parse of one source string — they never reorder, only remount together
            <Tag key={`${i}-h`} className={`dtc-md__h dtc-md__h--${Math.min(4, b.level)}`}>
              {renderInline(b.text)}
            </Tag>
          );
        }
        if (b.kind === "hr") {
          // biome-ignore lint/suspicious/noArrayIndexKey: the blocks are a static parse of one source string — they never reorder, only remount together
          return <hr key={`${i}-hr`} className="dtc-md__hr" />;
        }
        if (b.kind === "quote") {
          return (
            // biome-ignore lint/suspicious/noArrayIndexKey: the blocks are a static parse of one source string — they never reorder, only remount together
            <blockquote key={`${i}-q`} className="dtc-md__quote">
              {renderInline(b.text)}
            </blockquote>
          );
        }
        if (b.kind === "list") {
          const Tag = b.ordered ? "ol" : "ul";
          return (
            // biome-ignore lint/suspicious/noArrayIndexKey: the blocks are a static parse of one source string — they never reorder, only remount together
            <Tag key={`${i}-l`} className={b.ordered ? "dtc-md__list dtc-md__list--ol" : "dtc-md__list"}>
              {b.items.map((item, j) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: static parse, same rationale
                <li key={j} className={`dtc-md__li dtc-md__li--d${item.depth}`}>
                  {renderInline(item.text)}
                </li>
              ))}
            </Tag>
          );
        }
        // biome-ignore lint/suspicious/noArrayIndexKey: the blocks are a static parse of one source string — they never reorder, only remount together
        return <p key={`${i}-p`}>{renderInline(b.text)}</p>;
      })}
    </div>
  );
}
