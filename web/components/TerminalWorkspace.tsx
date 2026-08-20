/** Design: DevThink v1.1.10 — original browser chrome and command-first workspace shared with the Ink CLI. */
import { Command, Plus, Play, Settings2, Wifi } from "lucide-react";
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
  const activeGlyph = categories.find(([id]) => id === active)?.[1] || "◉";
  return (
    <main className="terminal-workspace">
      <header className="browser-chrome">
        <button className="browser-brand" type="button" onClick={() => onCategory("all")} aria-label="Abrir o workspace DevThink"><span aria-hidden="true">✦</span><strong>DEVTHINK</strong><small>local</small></button>
        <nav className="browser-session-tabs" aria-label="Sessão atual">
          <button className="browser-session-tab is-active" type="button" onClick={() => onCategory("all")} aria-current="page"><i aria-hidden="true" /><span>local session</span><em>{routeLabel}</em></button>
          <button className="browser-session-tabs__new" type="button" onClick={onOpenPalette} aria-label="Abrir comando para nova sessão"><Plus size={15} /></button>
        </nav>
        <div className="browser-state"><span><Wifi size={12} />{paired ? "paired" : "local"}</span></div>
      </header>

      <nav className="workspace-taskstrip" aria-label="Categorias do workspace" role="tablist">
        {categories.map(([id, glyph]) => <button key={id} type="button" role="tab" aria-selected={active === id} className={active === id ? "is-active" : ""} onClick={() => onCategory(id)}><span>{glyph}</span>{id}</button>)}
        <button type="button" className="workspace-taskstrip__command" aria-label="Abrir paleta de comando" onClick={onOpenPalette}><Command size={14} /><span>commands</span></button>
      </nav>

      <div className="terminal-context"><strong><span>{activeGlyph}</span> {active}</strong><span>{entries.length} {entries.length === 1 ? "entry" : "entries"} · {routeLabel}</span></div>

      <section className="terminal-canvas" aria-live="polite">
        {entries.length ? <div className="terminal-entry-list">{entries.map((message) => <article className={`terminal-stream-entry terminal-stream-entry--${message.role}`} key={message.id}><div className="terminal-stream-entry__meta"><span>{messageLabel(message)}</span><time>{message.time}</time></div><h1>{message.title}</h1><p>{message.body}</p></article>)}</div> : <div className="terminal-empty"><p>Nothing is active yet.</p><span>Describe the next feature, bug or piece of work below.</span></div>}
        <div className="terminal-wordmark" aria-hidden="true">DEVTHINK</div>
      </section>

      <form className="terminal-command-rail" onSubmit={onSend}>
        <button className="terminal-command-rail__palette" type="button" onClick={onOpenPalette} aria-label="Abrir paleta de comandos"><Command size={15} /></button>
        <span className="terminal-command-rail__prompt">›_</span>
        <input value={draft} onChange={(event) => onDraftChange(event.target.value)} aria-label="Comando DevThink" placeholder={`Ask DevThink about ${active === "all" ? "the work…" : `${active}…`}`} />
        <span className="terminal-command-rail__provider">{provider.label.toLowerCase()}</span>
        <button className="terminal-command-rail__run" type="submit" disabled={!draft.trim()}><Play size={13} fill="currentColor" />run</button>
      </form>
      <footer className="terminal-footer"><span><Settings2 size={12} /> provider credentials stay in the local cli</span><span>tab categories · ⌘K commands · enter run</span></footer>
    </main>
  );
}
