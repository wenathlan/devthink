/** Style: DevThink Unified Terminal Workspace — sparse category shell shared with the interactive CLI. */
import { Command, Play, Settings2, Wifi } from "lucide-react";
import type { FormEvent } from "react";
import type { DevThinkMessage, DevThinkProvider } from "./devthink-types";

const categories = [
  ["features", "ϟ"],
  ["bugs", "⊗"],
  ["refactor", "◌"],
  ["snippets", "◫"],
  ["tasks", "☑"],
  ["notes", "□"],
  ["all", "◉"],
  ["settings", "⚙"],
] as const;

type TerminalCategory = (typeof categories)[number][0];

type TerminalWorkspaceProps = {
  sectionId: string;
  routeLabel: string;
  provider: DevThinkProvider;
  messages: DevThinkMessage[];
  draft: string;
  paired: boolean;
  onDraftChange: (value: string) => void;
  onSend: (event: FormEvent) => void;
  onCategory: (category: TerminalCategory) => void;
  onOpenPalette: () => void;
};

function messageLabel(message: DevThinkMessage): string {
  return message.role === "assistant" ? "devthink" : message.role;
}

export function TerminalWorkspace({ sectionId, routeLabel, provider, messages, draft, paired, onDraftChange, onSend, onCategory, onOpenPalette }: TerminalWorkspaceProps) {
  const active = categories.some(([id]) => id === sectionId) ? sectionId as TerminalCategory : "all";
  const entries = messages.filter((message) => message.role !== "system");
  return (
    <main className="terminal-workspace">
      <header className="terminal-topbar">
        <div className="terminal-topbar__identity" aria-label="DevThink local workspace"><span className="terminal-topbar__glyph">▣</span><span>devthink</span></div>
        <nav className="terminal-tabs" aria-label="Categorias do workspace" role="tablist">
          {categories.map(([id, glyph]) => <button key={id} type="button" role="tab" aria-selected={active === id} className={active === id ? "is-active" : ""} onClick={() => onCategory(id)}><span>{glyph}</span>{id}</button>)}
          <button type="button" className="terminal-tabs__plus" aria-label="Abrir paleta de comando" onClick={onOpenPalette}>+</button>
        </nav>
        <div className="terminal-topbar__status"><Wifi size={12} /><span>{paired ? "paired" : "local"}</span></div>
      </header>

      <div className="terminal-context"><strong><span>{categories.find(([id]) => id === active)?.[1]}</span> {active} entries</strong><span>{entries.length} {entries.length === 1 ? "entry" : "entries"} · {routeLabel}</span></div>

      <section className="terminal-canvas" aria-live="polite">
        {entries.length ? <div className="terminal-entry-list">{entries.map((message) => <article className={`terminal-entry terminal-entry--${message.role}`} key={message.id}><div className="terminal-entry__meta"><span>{messageLabel(message)}</span><time>{message.time}</time></div><h1>{message.title}</h1><p>{message.body}</p></article>)}</div> : <div className="terminal-empty"><p>no {active === "all" ? "entries" : active} planned yet.</p><span>think {active === "all" ? "feature add a local provider" : `${active} …`}</span></div>}
        <div className="terminal-wordmark" aria-hidden="true">DEVTHINK</div>
      </section>

      <form className="terminal-command-rail" onSubmit={onSend}>
        <button className="terminal-command-rail__palette" type="button" onClick={onOpenPalette} aria-label="Abrir paleta de comandos"><Command size={15} /></button>
        <span className="terminal-command-rail__prompt">›_</span>
        <input value={draft} onChange={(event) => onDraftChange(event.target.value)} aria-label="Comando DevThink" placeholder={`think ${active === "all" ? "feature, bug, task, note…" : `${active} …`}`} />
        <span className="terminal-command-rail__provider">{provider.label.toLowerCase()}</span>
        <button className="terminal-command-rail__run" type="submit" disabled={!draft.trim()}><Play size={13} fill="currentColor" />run</button>
      </form>
      <footer className="terminal-footer"><span><Settings2 size={12} /> provider credentials stay in the local cli</span><span>tab categories · ⌘K commands · enter run</span></footer>
    </main>
  );
}
