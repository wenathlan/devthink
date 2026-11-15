/**
 * Message.tsx — one message of the devthink chat thread (the sol folder
 * law: the screen folder carries its own components beside the anchor).
 * the assistant block discloses its reasoning above the content — the
 * "Raciocínio do modelo" collapsible that stays open while the stream
 * thinks and folds away after — renders the markdown through the
 * in-house mini renderer (paragraphs, bold, italic, inline code, fenced
 * code panes with the language label and the copy key, lists, links with
 * the noopener law — zero dependencies, react elements by construction so
 * no markup ever rides a raw string) and carries the honest footer: token
 * usage, the backend badge the exposed headers answered, the lane the
 * request rode and the retry key on the last answer.
 */

import {
  ArrowCounterclockwiseRegular,
  BrainCircuitRegular,
  CheckmarkRegular,
  ChevronDownRegular,
  ChevronUpRegular,
  CopyRegular,
} from "@fluentui/react-icons";
import { type ReactNode, useEffect, useState } from "react";
import type { ChatUsage } from "../../chatclient";
import { label, labelfill } from "../../labels";

/** one message of a conversation — the view row the thread renders and the
 * persistence lane mirrors (the reasoning, the backend answer and the usage
 * ride with the content so a reload replays the whole exchange). */
export type ChatMessageView = {
  id: string;
  role: "user" | "assistant";
  content: string;
  reasoning?: string;
  modelId?: string;
  route?: string;
  provider?: string;
  backendModel?: string;
  fallback?: string;
  usage?: ChatUsage;
  error?: string;
  createdAt: string;
};

/** formats one token count the way the meta row renders it (1.2k above a thousand). */
function formattokens(count: number | undefined): string {
  if (count === undefined || !Number.isFinite(count)) return "—";
  if (count < 1000) return String(count);
  return `${(count / 1000).toFixed(1).replace(/\.0$/, "")}k`;
}

/* ===== block: the in-house markdown mini renderer ===== */

/** one inline token of the markdown walk. */
type InlineToken =
  | { kind: "text"; text: string }
  | { kind: "strong"; text: string }
  | { kind: "em"; text: string }
  | { kind: "code"; text: string }
  | { kind: "link"; text: string; href: string };

/** the inline grammar: **bold**, *italic*, `code`, [text](url) — the first
 * match of the alternation wins, everything before it rides as text. */
const INLINEPATTERN = /(\*\*[^*]+\*\*|\*[^*\n]+\*|`[^`\n]+`|\[[^\]]+\]\([^)\s]+\))/g;

/**
 * walks one string into its inline tokens.
 *
 * @param text the raw inline source.
 * @returns the ordered tokens.
 */
function inetokens(text: string): InlineToken[] {
  const tokens: InlineToken[] = [];
  const pattern = new RegExp(INLINEPATTERN);
  let rest = text;
  for (;;) {
    const match = pattern.exec(rest);
    if (match === null) break;
    if (match.index > 0) tokens.push({ kind: "text", text: rest.slice(0, match.index) });
    const token = match[0];
    if (token.startsWith("**")) tokens.push({ kind: "strong", text: token.slice(2, -2) });
    else if (token.startsWith("`")) tokens.push({ kind: "code", text: token.slice(1, -1) });
    else if (token.startsWith("[")) {
      const link = /^\[([^\]]+)\]\(([^)\s]+)\)$/.exec(token);
      if (link) tokens.push({ kind: "link", text: link[1], href: link[2] });
      else tokens.push({ kind: "text", text: token });
    } else tokens.push({ kind: "em", text: token.slice(1, -1) });
    rest = rest.slice(match.index + token.length);
    pattern.lastIndex = 0;
  }
  if (rest !== "") tokens.push({ kind: "text", text: rest });
  return tokens;
}

/**
 * renders the inline tokens of one line — react elements by construction,
 * so no markup of the answer ever rides a raw string (the injection law).
 *
 * @param text the raw inline source.
 * @param keyPrefix the react key prefix of the run.
 * @returns the inline elements.
 */
function renderinline(text: string, keyPrefix: string): ReactNode[] {
  return inetokens(text).map((token, index) => {
    const key = `${keyPrefix}-${index}`;
    switch (token.kind) {
      case "strong":
        return <strong key={key}>{token.text}</strong>;
      case "em":
        return <em key={key}>{token.text}</em>;
      case "code":
        return <code key={key}>{token.text}</code>;
      case "link":
        return (
          <a key={key} href={token.href} target="_blank" rel="noopener noreferrer">
            {token.text}
          </a>
        );
      default:
        return <span key={key}>{token.text}</span>;
    }
  });
}

/** the fenced code pane: the language label and the copy key over the deep well. */
function CodePane({ language, code }: { language: string; code: string }) {
  const [copied, setCopied] = useState(false);

  /** the copy action — the clipboard lane answers, the checkmark confirms, the label reverts. */
  function copy() {
    const done = (): void => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    };
    if (navigator.clipboard?.writeText) {
      void navigator.clipboard.writeText(code).then(done).catch(() => {});
    }
  }

  return (
    <div className="chatcode">
      <div className="chatcode__bar">
        <span className="chatcode__lang">{language !== "" ? language : label("chat.thread.codePlain")}</span>
        <button type="button" className="chatcode__copy" onClick={copy} aria-live="polite">
          {copied ? (
            <CheckmarkRegular fontSize={13} aria-hidden="true" />
          ) : (
            <CopyRegular fontSize={13} aria-hidden="true" />
          )}
          <span>{copied ? label("chat.thread.copied") : label("chat.thread.copy")}</span>
        </button>
      </div>
      <pre className="codeblock chatcode__pre">
        <code>{code}</code>
      </pre>
    </div>
  );
}

/** one block of the markdown walk: a code pane, a paragraph or a list. */
type MdBlock =
  | { kind: "code"; language: string; code: string }
  | { kind: "para"; lines: string[] }
  | { kind: "list"; ordered: boolean; items: string[] };

/**
 * parses the block structure of one markdown source: fenced code first
 * (the ``` fences with their language label, an unterminated fence owns
 * the rest), then paragraphs and lists inside the prose segments.
 *
 * @param source the raw message body.
 * @returns the ordered blocks.
 */
function parseblocks(source: string): MdBlock[] {
  const blocks: MdBlock[] = [];
  const segments = source.split(/```/);
  for (let index = 0; index < segments.length; index += 1) {
    const segment = segments[index];
    if (index % 2 === 1) {
      // inside a fence: the first line may name the language, the rest is the code
      const fenceLines = segment.replace(/^\n/, "").replace(/\n$/, "").split("\n");
      const first = fenceLines[0] ?? "";
      const looksLang = /^[A-Za-z0-9+#._-]{0,24}$/.test(first.trim());
      const language = looksLang ? first.trim() : "";
      const code = (looksLang ? fenceLines.slice(1) : fenceLines).join("\n");
      blocks.push({ kind: "code", language, code });
      continue;
    }
    const lines = segment.split("\n");
    let para: string[] = [];
    let list: { ordered: boolean; items: string[] } | null = null;
    const flushPara = (): void => {
      if (para.length > 0) {
        blocks.push({ kind: "para", lines: para.filter((line) => line.trim() !== "") });
        para = [];
      }
    };
    const flushList = (): void => {
      if (list) {
        blocks.push({ kind: "list", ordered: list.ordered, items: list.items });
        list = null;
      }
    };
    for (const line of lines) {
      if (line.trim() === "") {
        flushPara();
        flushList();
        continue;
      }
      const bullet = /^[-*]\s+(.*)$/.exec(line.trim());
      const numbered = /^\d+[.)]\s+(.*)$/.exec(line.trim());
      if (bullet) {
        flushPara();
        if (!list || list.ordered) {
          flushList();
          list = { ordered: false, items: [] };
        }
        list.items.push(bullet[1]);
      } else if (numbered) {
        flushPara();
        if (!list || !list.ordered) {
          flushList();
          list = { ordered: true, items: [] };
        }
        list.items.push(numbered[1]);
      } else {
        flushList();
        para.push(line);
      }
    }
    flushPara();
    flushList();
  }
  return blocks;
}

/**
 * renders one markdown source into the thread body — the in-house mini
 * renderer (no dependency rides): fenced code panes, paragraphs, bullet
 * and ordered lists, inline bold/italic/code/links.
 *
 * @param source the raw message body.
 * @returns the block elements.
 */
export function rendermarkdown(source: string): ReactNode[] {
  const blocks = parseblocks(source);
  const out: ReactNode[] = [];
  let paraIndex = 0;
  let listIndex = 0;
  for (const block of blocks) {
    if (block.kind === "code") {
      if (block.code.trim() === "") continue;
      out.push(<CodePane key={`code-${out.length}`} language={block.language} code={block.code} />);
    } else if (block.kind === "para") {
      if (block.lines.length === 0) continue;
      out.push(
        <p key={`para-${(paraIndex += 1)}`} className="chatmd__para">
          {block.lines.map((line, lineIndex) => (
            <span key={`line-${lineIndex}`}>
              {lineIndex > 0 ? " " : null}
              {renderinline(line, `l${lineIndex}`)}
            </span>
          ))}
        </p>,
      );
    } else {
      const Tag = block.ordered ? "ol" : "ul";
      out.push(
        <Tag key={`list-${(listIndex += 1)}`} className="chatmd__list">
          {block.items.map((item, itemIndex) => (
            <li key={`item-${itemIndex}`}>{renderinline(item, `i${itemIndex}`)}</li>
          ))}
        </Tag>,
      );
    }
  }
  return out;
}

/* ===== block: the reasoning disclosure ===== */

/**
 * the reasoning disclosure of one assistant answer: the brain glyph and
 * the "Raciocínio do modelo" key over the reasoning text — open while the
 * stream thinks (the live label), collapsible after the answer settles.
 *
 * @param reasoning the reasoning text the stream collected.
 * @param streaming true while the answer is still arriving.
 * @returns the disclosure element.
 */
function ReasoningDisclosure({ reasoning, streaming }: { reasoning: string; streaming: boolean }) {
  const [open, setOpen] = useState(streaming);

  // the live stream keeps the disclosure open — the person may fold it after
  useEffect(() => {
    if (streaming) setOpen(true);
  }, [streaming]);

  return (
    <div className="chatthink" data-open={open ? "true" : undefined}>
      <button
        type="button"
        className="chatthink__key"
        aria-expanded={open ? "true" : "false"}
        onClick={() => setOpen((current) => !current)}
      >
        <BrainCircuitRegular fontSize={15} aria-hidden="true" />
        <span className="chatthink__label">
          {streaming ? label("chat.thread.thinkingLive") : label("chat.thread.thinking")}
        </span>
        {open ? (
          <ChevronUpRegular fontSize={12} aria-hidden="true" />
        ) : (
          <ChevronDownRegular fontSize={12} aria-hidden="true" />
        )}
      </button>
      {open ? <div className="chatthink__body">{reasoning}</div> : null}
    </div>
  );
}

/* ===== block: the message ===== */

/**
 * one message of the thread: the user turn rides the subtle right-aligned
 * bubble; the assistant block carries the reasoning disclosure, the
 * markdown body, the honest footer (usage, backend badge, lane) and — on
 * the last answer — the retry key.
 *
 * @param message the message row.
 * @param streaming true while this message is the live stream ghost.
 * @param onRetry the retry action (the last assistant answer only).
 * @returns the message element.
 */
export function MessageView({
  message,
  streaming,
  onRetry,
}: {
  message: ChatMessageView;
  streaming?: boolean;
  onRetry?: () => void;
}) {
  if (message.role === "user") {
    return (
      <div className="chatmsg chatmsg--user">
        <div className="chatmsg__bubble">{message.content}</div>
      </div>
    );
  }
  return (
    <article className="chatmsg chatmsg--assistant" data-streaming={streaming ? "true" : undefined}>
      {message.reasoning ? (
        <ReasoningDisclosure reasoning={message.reasoning} streaming={streaming === true} />
      ) : null}
      <div className="chatmsg__body chatmd">
        {rendermarkdown(message.content)}
        {streaming && message.content === "" ? <span className="chatmd__pulse" aria-hidden="true" /> : null}
      </div>
      {message.error ? <p className="chatmsg__error">{message.error}</p> : null}
      {!streaming ? (
        <div className="chatmsg__meta">
          {message.usage ? (
            <span className="chatmsg__chip mono">
              {labelfill("chat.thread.usage", { count: formattokens(message.usage.totalTokens) })}
            </span>
          ) : null}
          {message.backendModel ? (
            <span className="chatmsg__chip mono">
              {labelfill("chat.thread.backend", {
                requested: message.modelId ?? "devthink",
                backend: message.backendModel,
              })}
            </span>
          ) : null}
          {message.route ? (
            <span className="chatmsg__chip mono">
              {labelfill("chat.thread.lane", { version: message.route, provider: message.provider ?? "—" })}
            </span>
          ) : null}
          {message.fallback ? <span className="chatmsg__chip mono">{message.fallback}</span> : null}
          {onRetry ? (
            <button type="button" className="chatmsg__retry" onClick={onRetry}>
              <ArrowCounterclockwiseRegular fontSize={13} aria-hidden="true" />
              <span>{label("chat.thread.retry")}</span>
            </button>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}

export default MessageView;
