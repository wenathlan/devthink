/**
 * markdown.tsx — the in-house renderer of the chat: the block grammar
 * (paragraphs, headings, ordered and nested unordered lists with the gfm
 * task checkboxes, blockquotes, horizontal rules, tables, fenced code
 * blocks with the header row — the language label, the copy key with the
 * checkmark morph, the soft wrap toggle, the sandbox tag treatment — and
 * the in-house syntax highlighter) over the inline grammar (bold, italic,
 * inline code, safe links with citations). Loose component of the chat
 * page; turn.tsx composes it. The parser is line-based and
 * streaming-honest: a fence left open mid-stream renders as a code block
 * in progress, and no block ever flashes raw markers on the floor (rungs
 * 122-123 — the markdown v2 waves; the code grammar re-weighed in w5-b).
 */
import { CheckmarkRegular as Checkmark, CopyRegular as Copy, TextWrapRegular as TextWrap } from "@fluentui/react-icons";
import { type ReactNode, useEffect, useMemo, useRef, useState } from "react";

type Token = { kind: "text" | "bold" | "italic" | "code"; text: string } | { kind: "link"; text: string; href: string };

type Block =
  | { kind: "text"; text: string }
  | { kind: "code"; lang: string; code: string }
  | { kind: "heading"; level: number; text: string }
  | { kind: "hr" }
  | { kind: "quote"; text: string }
  | { kind: "list"; ordered: boolean; items: Array<{ depth: number; text: string; task: boolean | null }> }
  | { kind: "table"; align: Array<"left" | "center" | "right">; head: string[]; rows: string[][] };

const FENCE = /```([^\n`]*)\n?([\s\S]*?)```/g;
// markdown links and bare http(s) urls first (the citation grammar), then
// code, bold, single asterisks; underscore italics need word boundaries
const INLINE =
  /(\[[^\]\n]+\]\((https?:\/\/[^\s)]+)(?:\s+"[^"]*")?\))|((?:https?:\/\/)[^\s<>)]+)|(`[^`\n]+`)|(\*\*[^*\n]+\*\*)|(\*[^*\n]+\*)|(?<![\w])(_[^_\n]+_)(?![\w])/g;

const HEADING = /^(#{1,6})\s+(.+?)\s*#*\s*$/;
const HR = /^\s{0,3}(?:(?:-\s*){3,}|(?:\*\s*){3,}|(?:_\s*){3,})$/;
const QUOTE = /^\s{0,3}>\s?(.*)$/;
const LIST = /^(\s*)([-*+]|\d{1,9}[.)])\s+(.*)$/;
/* the gfm task marker: [ ] or [x] riding the head of one list item — the
 * follower whitespace is required, so a bracket link like [x](url) never
 * turns into a task and a lone [x] stays literal text */
const TASK = /^\s*\[([ xX])]\s+(.*)$/;
const BLANK = /^\s*$/;
const TABLE_DIVIDER = /^\s*\|?(\s*:?-{3,}:?\s*\|)+\s*:?-{3,}:?\s*\|?\s*$/;

/** splitRow — the cells of one table line (the leading and trailing pipes
 * are optional, the escapes stay literal — the chat floor never needs the
 * full pipe-escape grammar). */
function splitRow(line: string): string[] {
  let body = line.trim();
  if (body.startsWith("|")) body = body.slice(1);
  if (body.endsWith("|") && !body.endsWith("\\|")) body = body.slice(0, -1);
  return body.split("|").map((cell) => cell.trim());
}

/** alignOf — the column alignment of one divider cell (:--- left, :---:
 * center, ---: right; the bare dash defaults left). */
function alignOf(cell: string): "left" | "center" | "right" {
  const left = cell.startsWith(":");
  const right = cell.endsWith(":");
  if (left && right) return "center";
  if (right) return "right";
  return "left";
}

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
  let list: { ordered: boolean; items: Array<{ depth: number; text: string; task: boolean | null }> } | null = null;

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

  for (let li = 0; li < lines.length; li++) {
    const line = lines[li].replace(/\s+$/, "");
    if (BLANK.test(line)) {
      flushAll();
      continue;
    }
    /* the table lane: a pipe-carrying line whose follower is the divider
     * row opens a table — the header rides the opening line, the divider
     * fixes the alignment, and every following pipe-line is a row (the
     * table ends at the first pipe-less line). */
    if (line.includes("|") && li + 1 < lines.length && TABLE_DIVIDER.test(lines[li + 1])) {
      flushAll();
      const align = splitRow(lines[li + 1]).map(alignOf);
      const head = splitRow(line);
      let ri = li + 2;
      const rows: string[][] = [];
      while (ri < lines.length && lines[ri].includes("|") && !BLANK.test(lines[ri])) {
        rows.push(splitRow(lines[ri]));
        ri++;
      }
      blocks.push({ kind: "table", align, head, rows });
      li = ri - 1;
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
      /* the gfm task lane: the checkbox state parses out of the item head
       * here, so the raw brackets never reach the floor */
      const task = item[3].match(TASK);
      list.items.push({
        depth,
        text: task ? task[2] : item[3],
        task: task ? task[1].toLowerCase() === "x" : null,
      });
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
    if (raw.startsWith("[")) {
      /* the markdown link: the label and the href, both sanitized to the
       * http(s) lane the regex already enforces (never javascript:, never
       * a scheme the floor would execute). */
      const label = raw.slice(1, raw.indexOf("]"));
      const href = m[2] ?? label;
      tokens.push({ kind: "link", text: label, href });
    } else if (raw.startsWith("http")) {
      /* the bare url autolink — the citation grammar of the sources. The
       * trailing punctuation never rides the href (the sentence's period
       * stays on the floor as text, not inside the link). */
      const bare = raw.replace(/[.,;:!?)\]]+$/, "");
      tokens.push({ kind: "link", text: bare, href: bare });
      const tailLen = raw.length - bare.length;
      if (tailLen > 0) tokens.push({ kind: "text", text: raw.slice(bare.length) });
    } else if (raw.startsWith("`")) tokens.push({ kind: "code", text: raw.slice(1, -1) });
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
    if (t.kind === "link") {
      return (
        // biome-ignore lint/suspicious/noArrayIndexKey: static parse, same rationale
        <a key={i} className="dtc-md__link" href={t.href} target="_blank" rel="noopener noreferrer nofollow">
          {t.text}
        </a>
      );
    }
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

/* --------------------- the in-house highlighter ------------------------ */
/*
 * The syntax highlighter of the code panes (rung 123): one ordered master
 * scan per language family — comments, strings, numbers, keywords, calls —
 * with the gaps falling back to the plain pane ink. It is honest about
 * being a light grammar: no tree, no states, just the tokens the chat
 * floor needs to read code the way the flagship panes do. Every language
 * family answers the same contract, the unknown ones fall to the generic
 * scan (strings, numbers, comments), and nothing ever breaks the render:
 * a token the scan misses is plain text, never an error.
 */

type CodeToken = { kind: string; text: string };

const KW_JS =
  /\b(?:const|let|var|function|return|if|else|for|while|do|switch|case|break|continue|class|extends|implements|interface|type|enum|import|export|from|as|default|async|await|try|catch|finally|throw|new|typeof|instanceof|in|of|delete|void|yield|super|this|null|undefined|true|false|public|private|protected|readonly|static|abstract|declare|namespace|satisfies)\b/;
const KW_PY =
  /\b(?:def|class|return|if|elif|else|for|while|import|from|as|try|except|finally|raise|with|lambda|pass|break|continue|yield|global|nonlocal|assert|del|in|is|not|and|or|None|True|False|async|await|match|case)\b/;
const KW_SH =
  /\b(?:if|then|else|elif|fi|for|do|done|while|until|case|esac|function|echo|export|cd|return|local|set|unset|shift|sudo|apt|npm|bun|bunx|npx|git|curl|wget|mkdir|rm|cp|mv|cat|grep|sed|awk|chmod|source)\b/;
const KW_SQL =
  /\b(?:select|from|where|insert|into|values|update|set|delete|create|table|drop|alter|add|join|left|right|inner|outer|full|cross|on|group|by|order|limit|offset|as|and|or|not|null|is|in|between|like|distinct|having|primary|key|foreign|references|unique|index|default|check|exists|union|all|case|when|then|end)\b/;
const KW_JSON = /\b(?:true|false|null)\b/;

/** familyOf — the language family of a fence label (the aliases fold into
 * the five grammars the house ships; everything else is generic). */
function familyOf(lang: string): "js" | "py" | "sh" | "sql" | "json" | "generic" {
  const l = lang.toLowerCase();
  if (/^(js|jsx|ts|tsx|javascript|typescript|mjs|cjs|node)$/.test(l)) return "js";
  if (/^(py|python|python3)$/.test(l)) return "py";
  if (/^(sh|bash|shell|zsh|console|terminal)$/.test(l)) return "sh";
  if (/^(sql|postgres|postgresql|sqlite|mysql)$/.test(l)) return "sql";
  if (/^(json|jsonc|webmanifest)$/.test(l)) return "json";
  return "generic";
}

/** highlight — the ordered scan of one code pane: line comments and
 * triple-quoted blocks first (the longest match wins by alternation
 * order), then strings, numbers, the family keywords, and the call-shaped
 * identifiers; the gaps are plain text. The capture groups are computed
 * with the family (the keyword group only exists when the family ships
 * one), so the kind of every match reads its own group, never a
 * misnumbered neighbor. */
function highlight(code: string, lang: string): CodeToken[] {
  const family = familyOf(lang);
  const kw =
    family === "js"
      ? KW_JS
      : family === "py"
        ? KW_PY
        : family === "sh"
          ? KW_SH
          : family === "sql"
            ? KW_SQL
            : family === "json"
              ? KW_JSON
              : null;
  const lineComment =
    family === "py" || family === "sh" || family === "sql"
      ? "#[^\\n]*"
      : family === "generic"
        ? "(?:#|//)[^\\n]*"
        : "//[^\\n]*";
  const blockComment = family === "py" ? "'''[\\s\\S]*?'''|\"\"\"[\\s\\S]*?\"\"\"" : "/\\*[\\s\\S]*?\\*/";
  const master = new RegExp(
    `${blockComment}|${lineComment}|("(?:[^"\\\\\\n]|\\\\.)*"|'(?:[^'\\\\\\n]|\\\\.)*'|\`(?:[^\`\\\\]|\\\\.)*\`)|(\\b\\d[\\d_]*(?:\\.\\d+)?(?:e[+-]?\\d+)?\\b)${kw ? `|(${kw.source})` : ""}|([A-Za-z_$][\\w$]*)(?=\\s*\\()`,
    "g",
  );
  /* the group ladder: 1 strings, 2 numbers, 3 keywords (only when the
   * family ships a grammar), then the call-shaped identifier last. */
  const kwGroup = kw ? 3 : 0;
  const fnGroup = kw ? 4 : 3;
  const tokens: CodeToken[] = [];
  let last = 0;
  for (const m of code.matchAll(master)) {
    const start = m.index ?? 0;
    if (start > last) tokens.push({ kind: "text", text: code.slice(last, start) });
    const raw = m[0];
    let kind = "text";
    if (raw.startsWith("/*") || raw.startsWith("'''") || raw.startsWith('"""')) kind = "comment";
    else if ((raw.startsWith("//") || raw.startsWith("#")) && !raw.startsWith("#!")) kind = "comment";
    else if (raw.startsWith('"') || raw.startsWith("'") || raw.startsWith("`")) kind = "string";
    else if (/^\d/.test(raw)) kind = "number";
    else if (kwGroup > 0 && m[kwGroup]) kind = "keyword";
    else if (m[fnGroup]) kind = "fn";
    tokens.push({ kind, text: raw });
    last = start + raw.length;
  }
  if (last < code.length) tokens.push({ kind: "text", text: code.slice(last) });
  return tokens;
}

/* ------------------------- the code block ------------------------------ */
/*
 * The w5-b code grammar: the header row rides the block's top edge — the
 * language label on the left (the quiet mono voice), the ghost keys on
 * the right. The copy key morphs to the checkmark for 1200ms on success
 * (the same grammar as the turn copy key — the clipboard answer is the
 * feedback itself, no toast noise; a failure keeps the copy glyph so the
 * retry stays armed). The soft wrap key freezes the pane between the
 * horizontal scroll and the wrapped read — state per block, aria-pressed,
 * never persisted. Blocks tagged `sandbox` carry the accent hairline and
 * the mono label, and stay fully visible as code: the bridge parses
 * them, the floor never hides them (the honesty law).
 */

/** SANDBOX_TAG — the fence label word that routes the block to the
 * sandbox bridge (the tag is the first word of the label, case-quiet —
 * "sandbox py" is tagged, "sandboxed" is not). */
const SANDBOX_TAG = /^\s*sandbox\b/i;

function CodeBlock({ lang, code }: { lang: string; code: string }) {
  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">("idle");
  const [wrap, setWrap] = useState(false);
  const timer = useRef<number | null>(null);
  const tokens = useMemo(() => (code ? highlight(code, lang) : []), [code, lang]);
  useEffect(
    () => () => {
      if (timer.current !== null) window.clearTimeout(timer.current);
    },
    [],
  );

  const onCopy = () => {
    void copyText(code).then((result) => {
      setCopyState(result);
      if (timer.current !== null) window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setCopyState("idle"), result === "copied" ? 1200 : 2400);
    });
  };

  const sandboxed = SANDBOX_TAG.test(lang);
  const label = lang.trim() || "code";

  return (
    <figure className={`dtc-code${sandboxed ? " dtc-code--sandbox" : ""}${wrap ? " dtc-code--wrap" : ""}`}>
      <figcaption className="dtc-code__head">
        <span className="dtc-code__lang">{label}</span>
        <span className="dtc-code__keys">
          <button
            type="button"
            className="dtc-code__key dtc-code__wrapkey"
            onClick={() => setWrap((on) => !on)}
            aria-pressed={wrap}
            aria-label={wrap ? "disable soft wrap" : "enable soft wrap"}
            title={wrap ? "disable soft wrap" : "enable soft wrap"}
          >
            <TextWrap fontSize={13} aria-hidden="true" />
          </button>
          <button
            type="button"
            className={`dtc-code__key dtc-code__copy${copyState === "copied" ? " is-copied" : copyState === "failed" ? " is-failed" : ""}`}
            onClick={onCopy}
            aria-label={
              copyState === "copied" ? "copied" : copyState === "failed" ? "copy failed — retry" : "copy code"
            }
            title={copyState === "failed" ? "copy failed — retry" : "copy code"}
          >
            {copyState === "copied" ? (
              <Checkmark fontSize={13} aria-hidden="true" />
            ) : (
              <Copy fontSize={13} aria-hidden="true" />
            )}
          </button>
          <span className="sr-only" role="status" aria-live="polite">
            {copyState === "copied" ? "copied to clipboard" : copyState === "failed" ? "copy failed" : ""}
          </span>
        </span>
      </figcaption>
      <pre className="dtc-code__pre">
        <code>
          {tokens.length
            ? tokens.map((t, i) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: the tokens are a static parse of one source string — they never reorder, only remount together
                <span key={i} className={t.kind === "text" ? undefined : `dtc-hl--${t.kind}`}>
                  {t.text}
                </span>
              ))
            : code}
        </code>
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
 * quotes, ordered and nested unordered lists with the gfm task
 * checkboxes, tables, fenced code with the header row — the copy morph
 * and the soft wrap key. */
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
              {b.items.map((item, j) => {
                /* the gfm task lane: the checkbox mirrors the parsed marker
                 * state, inert on the floor — the chat renders the list, it
                 * never edits it */
                const taskCls = item.task === null ? "" : ` dtc-md__li--task${item.task ? " dtc-md__li--done" : ""}`;
                return (
                  // biome-ignore lint/suspicious/noArrayIndexKey: static parse, same rationale
                  <li key={j} className={`dtc-md__li dtc-md__li--d${item.depth}${taskCls}`}>
                    {item.task === null ? null : (
                      <input type="checkbox" className="dtc-md__task" checked={item.task === true} disabled readOnly />
                    )}
                    {renderInline(item.text)}
                  </li>
                );
              })}
            </Tag>
          );
        }
        if (b.kind === "table") {
          return (
            // biome-ignore lint/suspicious/noArrayIndexKey: the blocks are a static parse of one source string — they never reorder, only remount together
            <div key={`${i}-t`} className="dtc-md__tablewrap">
              <table className="dtc-md__table">
                <thead>
                  <tr>
                    {b.head.map((cell, j) => (
                      // biome-ignore lint/suspicious/noArrayIndexKey: static parse, same rationale
                      <th key={j} style={{ textAlign: b.align[j] ?? "left" }}>
                        {renderInline(cell)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {b.rows.map((row, j) => (
                    // biome-ignore lint/suspicious/noArrayIndexKey: static parse, same rationale
                    <tr key={j}>
                      {b.head.map((_, k) => (
                        // biome-ignore lint/suspicious/noArrayIndexKey: static parse, same rationale
                        <td key={k} style={{ textAlign: b.align[k] ?? "left" }}>
                          {renderInline(row[k] ?? "")}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }
        // biome-ignore lint/suspicious/noArrayIndexKey: the blocks are a static parse of one source string — they never reorder, only remount together
        return <p key={`${i}-p`}>{renderInline(b.text)}</p>;
      })}
    </div>
  );
}
