import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { FluentCheck, FluentCopy } from './studio.icons';

interface CodeBlockProps {
  language?: string;
  value: string;
}

function CodeBlock({ language, value }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Ignore clipboard permission failure
    }
  };

  return (
    <div className="my-3 overflow-hidden rounded-[18px] squircle border border-[var(--dk-matte-edge)] bg-[var(--dk-surface)]">
      <div className="flex items-center justify-between border-b border-[var(--dk-panel-divider)] bg-[var(--dk-surface-2)] px-3.5 py-2 text-xs text-[var(--dk-text-2)]">
        <span className="font-mono font-medium text-[var(--dk-text)]">
          {language || 'código'}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          aria-label="Copiar bloco de código"
          className="dk-icon-btn h-6 px-2 text-[11px]"
        >
          {copied ? (
            <>
              <FluentCheck className="h-3 w-3 text-[var(--dk-brand)]" />
              <span>Copiado</span>
            </>
          ) : (
            <>
              <FluentCopy className="h-3 w-3" />
              <span>Copiar</span>
            </>
          )}
        </button>
      </div>
      <pre className="overflow-x-auto p-3.5 text-[12.5px] leading-relaxed font-mono text-[var(--dk-text)]">
        <code>{value}</code>
      </pre>
    </div>
  );
}

export function MarkdownRenderer({ content }: { content: string }) {
  return (
    <div className="chat-markdown">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          pre({ children }) {
            return <>{children}</>;
          },
          code({ className, children, ...props }) {
            const match = /language-([\w-]+)/.exec(className || '');
            const rawText = String(children).replace(/\n$/, '');
            const isBlock = Boolean(match) || rawText.includes('\n');
            if (isBlock) {
              return <CodeBlock language={match?.[1]} value={rawText} />;
            }
            return (
              <code
                {...props}
                className="rounded-md bg-[var(--dk-raised)] px-1.5 py-0.5 text-[12.5px] font-mono text-[var(--dk-text)]"
              >
                {children}
              </code>
            );
          },
          a({ href, children }) {
            return (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--dk-brand)] hover:underline font-medium"
              >
                {children}
              </a>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
