/** Design: DevThink v1.1.15 — tab-first paired local workspace with an optional destination rail and one shared identity per frame. */
import { Command, Play, Settings2, Wifi } from "lucide-react";
import type { FormEvent } from "react";
import { workspaceDestinations, type WorkspaceDestination } from "../../workspace.ts";
import type { DevThinkMessage, DevThinkProvider, DevThinkTab } from "./types";
import { WorkspaceTabs } from "./tabs";

const categories = [
  ["features", "ϟ"],
  ["bugs", "⊗"],
  ["refactor", "◌"],
  ["snippets", "◫"],
  ["tasks", "☑"],
  ["notes", "□"],
  ["all", "◉"],
] as const;

type TerminalCategory = (typeof categories)[number][0];

type TerminalWorkspaceProps = {
  sectionId: string;
  routeLabel: string;
  userId?: string;
  provider: DevThinkProvider;
  messages: DevThinkMessage[];
  tabs: DevThinkTab[];
  activeTabId: string;
  draft: string;
  paired: boolean;
  railMode: "always" | "auto" | "off";
  onDraftChange: (value: string) => void;
  onSend: (event: FormEvent) => void;
  onCategory: (category: TerminalCategory) => void;
  onDestination: (destination: WorkspaceDestination) => void;
  onSelectTab: (id: string) => void;
  onCloseTab: (id: string) => void;
  onNewTab: () => void;
  onOpenPalette: () => void;
};

function messageLabel(message: DevThinkMessage): string {
  return message.role === "assistant" ? "devthink" : message.role;
}

function destinationFrom(sectionId: string): WorkspaceDestination {
  return workspaceDestinations.some((destination) => destination.id === sectionId) ? sectionId as WorkspaceDestination : "chat";
}

export function TerminalWorkspace({ sectionId, routeLabel, userId, provider, messages, tabs, activeTabId, draft, paired, railMode, onDraftChange, onSend, onCategory, onDestination, onSelectTab, onCloseTab, onNewTab, onOpenPalette }: TerminalWorkspaceProps) {
  const destination = destinationFrom(sectionId);
  const active = categories.some(([id]) => id === sectionId) ? sectionId as TerminalCategory : "all";
  const entries = messages.filter((message) => message.role !== "system");
  const activeGlyph = categories.find(([id]) => id === active)?.[1] || "◉";
  const contextTitle = destination === "history" ? "session history" : destination === "settings" ? "local settings" : `${activeGlyph} ${active}`;
  const contextMeta = destination === "history" ? `${tabs.length} open ${tabs.length === 1 ? "tab" : "tabs"} · ${entries.length} local entries` : `${entries.length} ${entries.length === 1 ? "entry" : "entries"} · ${routeLabel}`;
  return (
    <main className={`terminal-workspace terminal-workspace--v111 terminal-workspace--rail-${railMode}`}>
      {railMode !== "off" && <aside className="workspace-rail" aria-label="DevThink workspace destinations">
        <button className="workspace-rail__brand" type="button" onClick={() => onDestination("chat")} aria-label="Abrir sessão DevThink"><span aria-hidden="true">✦</span><strong>DEVTHINK</strong><small>local</small></button>
        <nav className="workspace-rail__nav" aria-label="Destinos do workspace">
          {workspaceDestinations.map((item) => <button key={item.id} type="button" className={destination === item.id ? "is-active" : ""} aria-current={destination === item.id ? "page" : undefined} onClick={() => onDestination(item.id)}><span aria-hidden="true">{item.glyph}</span><span>{item.label}</span></button>)}
        </nav>
        <div className="workspace-rail__status"><Wifi size={12} /><span>{paired ? "paired local" : "local only"}</span></div>
      </aside>}

      <div className="terminal-workspace__main">
        <header className="browser-chrome">
          <WorkspaceTabs tabs={tabs} activeTab={activeTabId} onSelect={onSelectTab} onClose={onCloseTab} onNew={onNewTab} />
          <div className="browser-state"><span><Wifi size={12} />{paired ? userId || "paired" : "local preview"}</span></div>
        </header>

        <nav className="workspace-taskstrip" aria-label="Categorias de trabalho" role="tablist">
          {categories.map(([id, glyph]) => <button key={id} type="button" role="tab" aria-selected={active === id && destination === "chat"} className={active === id && destination === "chat" ? "is-active" : ""} onClick={() => onCategory(id)}><span>{glyph}</span>{id}</button>)}
          <button type="button" className="workspace-taskstrip__command" aria-label="Abrir paleta de comando" onClick={onOpenPalette}><Command size={14} /><span>commands</span></button>
        </nav>

        <div className="terminal-context"><strong>{contextTitle}</strong><span>{contextMeta}</span></div>

        <section className="terminal-canvas" aria-live="polite">
          {destination === "history" && <div className="terminal-history"><p>Open session tabs remain local to this workspace.</p>{tabs.map((tab) => <button key={tab.id} type="button" onClick={() => onSelectTab(tab.id)} className={tab.id === activeTabId ? "is-active" : ""}><span>◷</span><strong>{tab.label}</strong><small>{tab.provider}</small></button>)}</div>}
          {destination !== "history" && entries.length ? <div className="terminal-entry-list">{entries.map((message) => <article className={`terminal-stream-entry terminal-stream-entry--${message.role}`} key={message.id}><div className="terminal-stream-entry__meta"><span>{messageLabel(message)}</span><time>{message.time}</time></div><h1>{message.title}</h1><p>{message.body}</p></article>)}</div> : destination !== "history" && <div className="terminal-empty"><p>Nothing is active yet.</p><span>Describe the next feature, bug or piece of work below.</span></div>}
          <div className="terminal-wordmark" aria-hidden="true">DEVTHINK</div>
        </section>

        <form className="terminal-command-rail" onSubmit={onSend}>
          <button className="terminal-command-rail__palette" type="button" onClick={onOpenPalette} aria-label="Abrir paleta de comandos"><Command size={15} /></button>
          <span className="terminal-command-rail__prompt">›_</span>
          <input value={draft} onChange={(event) => onDraftChange(event.target.value)} aria-label="Comando DevThink" placeholder={`Ask DevThink about ${destination === "chat" && active !== "all" ? `${active}…` : "the work…"}`} />
          <span className="terminal-command-rail__provider">{provider.label.toLowerCase()}</span>
          <button className="terminal-command-rail__run" type="submit" disabled={!draft.trim()}><Play size={13} fill="currentColor" />run</button>
        </form>
        <footer className="terminal-footer"><span><Settings2 size={12} />provider credentials stay in the local cli</span><span>tabs · history · ⌘K commands · enter run</span></footer>
      </div>
    </main>
  );
}
